'use strict'

const lodash = require('lodash')
const fs = require('fs')
const util = require('util')
const mysql = require('mysql2')
const req = require('request')
const nodemailer = require('nodemailer')
const path = require('path')
const jimp = require('jimp')
const unzipper = require('unzipper')
const mongodb = require('mongodb')

const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../server/datasources.development.json'

if (NODE_ENV === 'staging') {
  environment = '../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../server/datasources.json'
}

const configs = require('../common/configs.' + NODE_ENV + '.json')
const datasources = require(environment)

const MONGODB_URL_CONNECTION = "mongodb://" + datasources.mongodb.user + ":" + datasources.mongodb.password + "@" + datasources.mongodb.host + ":" + datasources.mongodb.port + "/" + datasources.mongodb.database + "?retryWrites=true&w=majority&maxPoolSize=9999999999"
var databaseMongoDB = null

let Constants = Object.freeze({
	Status: {
		INACTIVE: 0,
		ACTIVE: 1,
		CLOSED: 2,
		ENDED: 3,
		0: "Inactivo",
		1: "Activo",
		2: "Cerrado",
		3: "Finalizado",
	}
});

const getCallToAction = async (link, businessUnit) => {
  let callToAction = {
    link: link,
    text: '',
    type: '',
    u: null,
    b: null,
    bc: null,
    csa: null,
    code: null
  }

  if (isExternalLink(link)) {
    return {
      link: link,
      type: 'webview',
      u: null,
      b: null,
      bc: null,
      csa: null,
      code: null
    }
  }

  // Revisar si es producto único
  try {
    let split = link.split('-')
    if (split.length !== 0) {
      let code = split[split.length - 1]
      let filter = {
        where: {
          code: code
        },
        include: ['brand']
      }

      let responseProduct = await request({
        method: 'GET',
        url: configs.HOST_ECOMMERCE + ':' + configs.PORT_ECOMMERCE + '/api/products/findOne?filter=' + JSON.stringify(filter),
        json: true,
        headers: {
          uuid: businessUnit
        }
      })

      if (responseProduct.body !== undefined) {
        if (responseProduct.body.code !== undefined) {
          callToAction.type = 'product'
          callToAction.code = code
        }
      }
    }
  } catch (err) {
    console.log(err)
  }

  // Es lista
  if (isEmpty(callToAction.type)) {
    link = link.split('/')
    if (link.length > 0) {
      link.splice(0, 1)
      if (link.length > 1) {
        callToAction.bc = cloneJson(link)
        if (link[0].includes('marcas', 0)) {
          let brands = await mongoFind('Brand', {})
          brands.forEach(brand => {
            if (brand.name.toLowerCase().split(' ').join('-') === link[1]) {
              callToAction.b = brand.code
            }
          })
        }

        if (link[link.length - 1].includes('csa=', 0)) {
          callToAction.bc.splice(-1, 1)
          callToAction.bc.push(link[link.length - 1].split('?csa=')[0])
          callToAction.csa = link[link.length - 1].split('?csa=')[1]
        }
      } else {
        if (!link[0].includes('todos', 0)) {
          if (link[0].includes('marcas', 0)) {
            let brands = await mongoFind('Brand', {})
            brands.forEach(brand => {
              if (brand.name.toLowerCase().split(' ').join('-') === link[0]) {
                callToAction.b = brand.code
              }
            })
          } else {
            callToAction.bc = link
            callToAction.u = link[0]
            if (link[0].includes('csa=', 0)) {
              callToAction.bc = [link[0].split('?csa=')[0]]
              callToAction.u = link[0].split('?csa=')[0]
              callToAction.csa = link[0].split('?csa=')[1]
            }
          }
        } else {
          if (link[0].includes('csa=')) {
            callToAction.csa = link[0].split('?csa=')[1]
          }
        }
      }
    }
    callToAction.type = 'list'
  }
  return callToAction
}

// NETPAY
const loginWithNetpay = async () => {
  let response = await request({
    method: 'POST', url: configs.netpay.login, body: {
      security: {
        userName: configs.netpay.username,
        password: configs.netpay.password
      }
    },
    json: true,
    headers: {
      "content-type": "application/json"
    }
  })
  return response.body
}

const createStoreAPIKeyWithNetPay = async (token) => {
  let response = await request({
    method: 'POST', url: configs.netpay.createAPIKey, json: true, headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  return response.body
}

const cardTokenizationWithNetpay = async (card) => {
  let responseToken = await loginWithNetpay()

  if (responseToken === undefined)
    return responseToken

  let responseCreateStoreAPIKey = await createStoreAPIKeyWithNetPay(responseToken.token)

  if (responseCreateStoreAPIKey === undefined)
    return responseCreateStoreAPIKey

  let response = await request({
    method: 'POST', url: configs.netpay.cardTokenization, json: true, body: {
      username: card.userId,
      storeApiKey: responseCreateStoreAPIKey.response.storeApiKey,
      customerCard: {
        cardNumber: card.number,
        expirationMonth: card.month,
        expirationYear: card.year,
        cvv: card.cvv,
        cardType: card.type,
        cardHolderName: card.titular
      }
    },
    headers: {
      "content-type": "application/json",
      'Authorization': 'Bearer ' + responseToken.token
    }
  })

  return response.body
}

const riskManagerNetPay = async (data) => {
  let responseToken = await loginWithNetpay()

  if (responseToken === undefined)
    return responseToken

  let responseCreateStoreAPIKey = await createStoreAPIKeyWithNetPay(responseToken.token)
  if (responseCreateStoreAPIKey === undefined)
    return responseCreateStoreAPIKey

  let street1 = data.address.street + ' #' + data.address.exteriorNumber + ' ' + data.address.interiorNumber
  street1 = street1.trim()
  let street2 = data.address.type + ' ' + data.address.location
  street2 = street2.trim()

  let response = await request({
    method: 'POST', url: configs.netpay.riskManager, json: true, body: {
      storeApiKey: responseCreateStoreAPIKey.response.storeApiKey,
      riskManager: {
        promotion: '000000',
        requestFraudService: {
          merchantReferenceCode: data.order,
          deviceFingerprintID: data.deviceFingerprintId,
          deviceFingerprintRaw: "true",
          bill: {
            city: data.address.municipality,
            country: 'MX',
            firstName: data.user.name,
            lastName: data.user.firstLastName,
            email: data.user.email,
            phoneNumber: "" + data.user.cellphone,
            postalCode: data.address.zip,
            state: data.address.state,
            street1: street1,
            street2: street2,
            ipAddress: data.ip
          },
          ship: {
            city: data.address.municipality,
            country: 'MX',
            firstName: data.user.name,
            lastName: data.user.firstLastName,
            email: data.user.email,
            phoneNumber: "" + data.user.cellphone,
            postalCode: data.address.zip,
            state: data.address.state,
            street1: street1,
            street2: street2,
            shippingMethod: data.shippingMethod
          },
          itemList: data.items,
          card: {
            cardToken: data.cardToken.token.publicToken
          },
          purchaseTotals: {
            grandTotalAmount: data.total,
            currency: "MXN"
          },
          merchanDefinedDataList: [
            {
              "id": 2,
              "value": "Web"
            },
            {
              "id": 9,
              "value": "Retail"
            },
            {
              "id": 10,
              "value": "3DS"
            },
            {
              "id": 13,
              "value": "N"
            },
            {
              "id": 20,
              "value": "Departamental"
            },
            {
              "id": 21,
              "value": "No"
            },
            {
              "id": 22,
              "value": "R"
            },
            {
              "id": 25,
              "value": configs.netpay.storeIdAcq
            },
            {
              "id": 28,
              "value": configs.netpay.storeIdAcq
            },
            {
              "id": 50,
              "value": "Si"
            },
            {
              "id": 93,
              "value": "" + data.user.cellphone
            }
          ]
        }
      }
    },
    headers: {
      "content-type": "application/json",
      'Authorization': 'Bearer ' + responseToken.token
    }
  })

  return response.body
}

const chargeAuthNetPay = async (transactionTokenId) => {
  let responseToken = await loginWithNetpay()

  if (responseToken === undefined)
    return responseToken

  let response = await request({
    method: 'POST', url: configs.netpay.chargeAuth, json: true, body: {
      transactionTokenId: transactionTokenId,
      transactionType: "Auth"
    },
    headers: {
      "content-type": "application/json",
      'Authorization': 'Bearer ' + responseToken.token
    }
  })
  return response.body
}

// SYNC
const syncAll = async () => {
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/attributes' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/brands' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/businesses' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/categories' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/colors' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/genders' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/stores' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/sublines' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/products' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/products/attributes' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/products/businesses' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/products/category' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/products/stock' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/products/photos' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/menu' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST + ':' + configs.PORT + '/api/syncs/buttons' })
}

const millisToMinutesAndSeconds = (millis) => {
  let minutes = Math.floor(millis / 60000)
  let seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds
}

const getAllProductsByCategories = async (referenceModel, categories, products, productsFilter = '') => {
  if (categories.length === 0) {
    return products
  } else {
    let auxProducts = []
    let auxCategories = []
    let newCategories = []

    await asyncForEach(categories, async (category) => {
      if (isEmpty(productsFilter)) {
        auxProducts = await loopbackFind(referenceModel.app.models.Product, { where: { categoryCode: category.node } })
        /*
        auxProducts = await connection.query('SELECT * FROM ProductCategory WHERE categoryId = ? AND status = 1;', [
          category.idNode
        ])
        */
      } else {
        /*
        auxProducts = await connection.query('SELECT * FROM ProductCategory WHERE productId IN (' + productsFilter + ') AND categoryId = ? AND status = 1;', [
          category.idNode
        ])
        */
      }

      auxProducts.forEach(ap => {
        products.push(ap)
      })

      auxCategories = await loopbackFind(referenceModel.app.models.Category, { where: { father: category.node } })
      /*
      auxCategories = await connection.query('SELECT * FROM CategoryNode WHERE idFather = ? AND status = 1;', [
        category.idNode
      ])
      */

      products = uniqBy(products, 'code')

      auxCategories.forEach(c => {
        if (c.node === category.node) {
          newCategories.push({ node: c.node, products: products })
        } else {
          newCategories.push({ node: c.node, products: [] })
        }
      })
    })

    newCategories = uniqBy(newCategories, 'node')

    return await getAllProductsByCategories(referenceModel, newCategories, products, productsFilter)
  }
}

const getSubcategories = async (newSubcategories, subcategories) => {
  if (newSubcategories.length === 0) {
    return subcategories
  }

  let response = []
  let aux = []
  await asyncForEach(newSubcategories, async (item) => {
    response = await mongoFind('Category', { father: item })
    response.forEach(obj => {
      aux.push(obj.node)
      subcategories.push({ categoryCode: obj.node, description: obj.description })
    })
  })

  newSubcategories = aux
  return await getSubcategories(newSubcategories, subcategories)
}

const imageIsVertical = async (source) => {
  return new Promise(async (resolve, reject) => {
    jimp.read(configs.HOST_CDN_AWS + '/thumbs/' + source, (err, img) => {
      if (err) {
        resolve({ isVertical: false })
      } else {
        if (img.getHeight() > img.getWidth()) {
          resolve({ isVertical: true })
        } else {
          resolve({ isVertical: false })
        }
      }
    })
  })
}

const connectToMongoDB = async () => {
  return new Promise(async (resolve, reject) => {
    mongodb.connect(MONGODB_URL_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }, (err, client) => {
      if (err) {
        return reject(err)
      } else {
        console.log('Success mongodb connection')
        databaseMongoDB = client.db(datasources.mongodb.db)
        return resolve(client)
      }
    })
  })
}

const closeMongoDB = async (connection) => {
  return new Promise(async (resolve, reject) => {
    connection.close(() => {
      resolve({ success: true })
    })
  })
}

const mongoFind = async (collection, filter) => {
  return new Promise(async (resolve, reject) => {
    databaseMongoDB.collection(collection).find(filter).toArray((err, response) => {
      if (err) {
        return resolve([])
      } else {
        return resolve(response)
      }
    })
  })
}

const loopbackFind = async (collection, where) => {
  return new Promise(async (resolve, reject) => {
    collection.find(where, (err, response) => {
      if (!err) {
        return resolve(cloneJson(response))
      } else {
        return reject([])
      }
    })
  })
}

const loopbackCount = async (collection, where) => {
  return new Promise(async (resolve, reject) => {
    collection.count(where, (err, response) => {
      if (!err) {
        return resolve(cloneJson(response))
      } else {
        return reject([])
      }
    })
  })
}

const findMongoDB = async (collection, where) => {
  return new Promise((resolve, reject) => {
    databaseMongoDB.collection(collection).find(where, (error, response) => {
      if (error) return reject(error)
      return resolve(response)
    })
  })
}

const findAndUpdateMongoDB = async (collection, where, query) => {
  // No usar para actualizar en mongo.
  return new Promise((resolve, reject) => {
    databaseMongoDB.collection(collection).update(where, query, (err) => {
      if (err) {
        return reject({ success: false })
      } else {
        return resolve({ success: true })
      }
    })
  })
}

const updateMongoDb = async (Model, data, id) => {
  return new Promise((resolve, reject) => {
    Model.updateAll({ id: id }, data, (err) => {
      if (err){
        return reject({ success: false })
      } else {
        return resolve({ success: true })
      }
    })
  })
}

const createMongoDB = (collection, data) => {
  return new Promise((resolve, reject) => {
    collection.create(data, function (err, response) {
      if (err) {
        return reject({ success: false, error: err })
      }
      return resolve({ success: true, data: response })
    })
  })
}

const findOne = (collection, where) => {
  return new Promise((resolve, reject) => {
    collection.findOne({ where: where }, (err, item) => {
      if (err) {
        return resolve({ success: false, item: null })
      } else {
        return resolve({ success: true, item: item })
      }
    })
  })
}

const createUniqueMongoDB = (collection, where, data) => {
  return new Promise((resolve, reject) => {
    collection.findOne({ where: where }, (err, item) => {
      if (err) {
        return reject({ success: false, error: err })
      } else {
        if (item !== null) {
          return resolve({ success: false, isUnique: true })
        } else {
          collection.create(data, function (err, response) {
            if (err) {
              return reject({ success: false, error: err })
            }
            return resolve({ success: true, data: response })
          })
        }
      }
    })
  })
}

const findAndDeleteMongoDB = (collection, query) => {
  return new Promise((resolve, reject) => {
    collection.findOne(query, (err, item) => {
      if (item !== null) {
        item.delete(query, function (err, response) {
          if (err) {
            return reject({ success: false, error: err })
          }
          return resolve({ success: true, data: response })
        })
      } else {
        return resolve({ success: true })
      }
    })
  })
}

const createMongoDBIndexes = (collection, indexes) => {
  return new Promise((resolve, reject) => {
    databaseMongoDB.collection(collection).createIndexes(indexes, (err) => {
      if (err) {
        return reject({ success: false })
      } else {
        return resolve({ success: true })
      }
    })
  })
}

const dropMongoDBIndexes = (collection, indexes) => {
  return new Promise((resolve, reject) => {
    databaseMongoDB.collection(collection).dropIndexes(indexes, (err) => {
      return resolve({ success: true })
    })
  })
}

const dropCollectionMongoDB = (collection) => {
  return new Promise((resolve, reject) => {
    databaseMongoDB.collection(collection).drop(() => {
      return resolve({ success: true })
    })
  })
}

const unzipperFile = async (pathWithFileName, outputPathWithFileName) => {
  const directory = await unzipper.Open.file(__dirname + '/..' + pathWithFileName);
  return new Promise((resolve, reject) => {
    return directory.files[0].stream().pipe(fs.createWriteStream(__dirname + '/..' + outputPathWithFileName)).on('error', () => {
      return reject({ success: false })
    }).on('finish', () => {
      return resolve({ success: true })
    })
  })
}

const createFileIntoCDN = (fileName, dir, data) => {
  let base64 = data.replace(/^data:([A-Za-z-+/]+);base64,/, "")
  return new Promise((resolve, reject) => {
    let directory = path.resolve(__dirname + '/../cdn' + dir + '/')
    fs.mkdir(directory, { recursive: true }, function (err) {
      if (err && err.code !== 'EEXIST') {
        console.log(err)
        return reject({ success: false })
      }
      else {
        fs.writeFile(directory + '/' + fileName, base64, 'base64', function (err) {
          if (err) {
            console.log(err)
            return reject({ success: false })
          }
          else {
            return resolve({ success: true, url: '/cdn' + dir + '/' + fileName })
          }
        })
      }
    })
  })
}

const onlyDate = (val) => {
  try {
    return val.split("T")[0].trim()
  }
  catch (error) {
    return '-'
  }
}

const isNumeric = (val) => {
  var numeric = true
  var chars = "0123456789+"
  var len = val.length
  var char = ""
  for (let i = 0; i < len; i++) { char = val.charAt(i); if (chars.indexOf(char) === -1) { numeric = false; } }
  return numeric
}

const isDouble = (val) => {
  var numeric = true
  var chars = "0123456789.+"
  var len = val.length
  var char = ""
  for (let i = 0; i < len; i++) { char = val.charAt(i); if (chars.indexOf(char) === -1) { numeric = false; } }
  return numeric
}

const isEmpty = (value) => {
  try {
    return lodash.isEmpty(value)
  } catch (e) {
    return true
  }
}

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase())
}

const cloneJson = function (json) {
  return JSON.parse(JSON.stringify(json))
}

const jsonToArray = function (json) {
  var result = []
  var keys = Object.keys(json)
  keys.forEach(function (key) {
    result.push(json[key])
  })
  return result
}

const addFormat = function (value) {
  if (value < 10000)
    value = value
  if (value < 1000)
    value = "0" + value
  if (value < 100)
    value = "00" + value
  if (value < 10)
    value = "000" + value
  return value
}

function connectToDB(credentials = { host: datasources.db.host, port: datasources.db.port, user: datasources.db.user, password: datasources.db.password, database: datasources.db.database }) {
  const connection = mysql.createConnection({
    host: credentials.host,
    port: credentials.port,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database
  })

  return {
    beginTransaction() {
      return util.promisify(connection.beginTransaction).call(connection)
    },
    query(sql, args) {
      return util.promisify(connection.query).call(connection, sql, args)
    },
    commit() {
      return util.promisify(connection.commit).call(connection)
    },
    rollback() {
      return util.promisify(connection.rollback).call(connection)
    },
    close() {
      return util.promisify(connection.end).call(connection)
    }
  }
}

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const sendEmail = async (options) => {
  let transporter = nodemailer.createTransport({
    type: "smtp",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: configs.emailUser,
      pass: configs.emailPassword
    }
  })

  let email = await transporter.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.template
  })
  console.log('Email response', email);

  return email
}

const request = async (options) => {
  return new Promise((resolve, reject) => {
    req(options, (error, response, body) => {
      if (error) return reject(error)
      return resolve({ body, response })
    })
  })
}

const readFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (error, data) => {
      if (error) return reject(error)
      return resolve(data)
    })
  })
}

const readDir = async (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (error, filenames) => {
      if (error) return reject(error)
      return resolve(filenames)
    })
  })
}

const arrayUnique = function (array) {
  return lodash.union(array)
}

const uniqBy = function (array, property) {
  if (property.split('.').length >= 2) {
    return lodash.uniqBy(array, function (item) {
      return item[property.split('.')[0]][property.split('.')[1]]
    })
  }
  else {
    return lodash.uniqBy(array, function (item) {
      return item[property]
    })
  }
}

const groupBy = function (array, property) {
  return lodash.groupBy(array, property)
}

const orderBy = function (array, property, direction) {
  return lodash.orderBy(array, [property], [direction])
}

// public method for encoding
const encode = function (input) {
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  var output = ""
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4
  var i = 0
  input = _utf8_encode(input)
  while (i < input.length) {
    chr1 = input.charCodeAt(i++)
    chr2 = input.charCodeAt(i++)
    chr3 = input.charCodeAt(i++)
    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63
    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4)
  }
  return output
}

// public method for decoding
const decode = function (input) {
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  var output = ""
  var chr1, chr2, chr3
  var enc1, enc2, enc3, enc4
  var i = 0
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "")
  while (i < input.length) {
    enc1 = _keyStr.indexOf(input.charAt(i++))
    enc2 = _keyStr.indexOf(input.charAt(i++))
    enc3 = _keyStr.indexOf(input.charAt(i++))
    enc4 = _keyStr.indexOf(input.charAt(i++))
    chr1 = (enc1 << 2) | (enc2 >> 4)
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    chr3 = ((enc3 & 3) << 6) | enc4
    output = output + String.fromCharCode(chr1)
    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2)
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3)
    }
  }
  output = _utf8_decode(output)
  return output
}

// private method for UTF-8 encoding
const _utf8_encode = function (string) {
  string = string.replace(/\r\n/g, "\n")
  var utftext = ""
  for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n)
    if (c < 128) {
      utftext += String.fromCharCode(c)
    }
    else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192)
      utftext += String.fromCharCode((c & 63) | 128)
    }
    else {
      utftext += String.fromCharCode((c >> 12) | 224)
      utftext += String.fromCharCode(((c >> 6) & 63) | 128)
      utftext += String.fromCharCode((c & 63) | 128)
    }
  }
  return utftext
}

// private method for UTF-8 decoding
const _utf8_decode = function (utftext) {
  var string = ""
  var i = 0
  var c, c2, c3 = 0
  while (i < utftext.length) {
    c = utftext.charCodeAt(i)
    if (c < 128) {
      string += String.fromCharCode(c)
      i++
    }
    else if ((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i + 1)
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
      i += 2
    }
    else {
      c2 = utftext.charCodeAt(i + 1)
      c3 = utftext.charCodeAt(i + 2)
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
      i += 3
    }
  }
  return string
}

const getDeliveryDate = (date, dias) => {
  date = date + " - ";
  let a = date.substring(0, 4)
  let b = parseInt(date.substring(5, 7)) - 1
  let c = parseInt(date.substring(8, 10))
  let d = (dias ? dias : 0)
  let e = Date.UTC(a, b, c + d, 0, 0, 0)
  let f = new Date(e).toLocaleDateString('mx-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  let fecha = e
  return file
}

const generateURL = (name) => {
  let url = name.split(" ").join('-').split('/').join('-').split('.').join('-').split('_').join('-').split(';').join('-').split('(').join('-').split(')').join('-').split('"').join('-').split('\'').join('-').split('\`').join('').split('`').join('').split('\´').join('').split('´').join('').split('+').join('').split('\\').join('').split('\\').join('').split('#').join('-').split("'").join('-').toLowerCase()
  url = url.split('------').join('-').split('-----').join('-').split('----').join('-').split('---').join('-').split('--').join('-')
  url = url.split('Š').join('S')
    .split('š').join('s')
    .split('Ž').join('Z')
    .split('ž').join('z')
    .split('À').join('A')
    .split('Á').join('A')
    .split('Â').join('A')
    .split('Ã').join('A')
    .split('Ä').join('A')
    .split('Å').join('A')
    .split('Æ').join('A')
    .split('Ç').join('C')
    .split('È').join('E')
    .split('É').join('E')
    .split('Ê').join('E')
    .split('Ë').join('E')
    .split('Ì').join('I')
    .split('Í').join('I')
    .split('Î').join('I')
    .split('Ï').join('I')
    .split('Ò').join('O')
    .split('Ó').join('O')
    .split('Ô').join('O')
    .split('Õ').join('O')
    .split('Ö').join('O')
    .split('Ø').join('O')
    .split('Ù').join('U')
    .split('Ú').join('U')
    .split('Û').join('U')
    .split('Ü').join('U')
    .split('Ý').join('Y')
    .split('Þ').join('B')
    .split('ß').join('Ss')
    .split('à').join('a')
    .split('á').join('a')
    .split('â').join('a')
    .split('ã').join('a')
    .split('ä').join('a')
    .split('å').join('a')
    .split('æ').join('a')
    .split('ç').join('c')
    .split('è').join('e')
    .split('é').join('e')
    .split('ê').join('e')
    .split('ë').join('e')
    .split('ì').join('i')
    .split('í').join('i')
    .split('î').join('i')
    .split('ï').join('i')
    .split('ð').join('o')
    .split('ò').join('o')
    .split('ó').join('o')
    .split('ô').join('o')
    .split('õ').join('o')
    .split('ö').join('o')
    .split('ø').join('o')
    .split('ù').join('u')
    .split('ú').join('u')
    .split('û').join('u')
    .split('ý').join('y')
    .split('þ').join('b')
    .split('ÿ').join('y')
    .split('&').join('&amp;')
    .split('À').join('&Agrave;')
    .split('Á').join('&Aacute;')
    .split('Â').join('&Acirc;')
    .split('Ã').join('&Atilde;')
    .split('Ä').join('&Auml;')
    .split('Å').join('&Aring;')
    .split('Æ').join('&AElig;')
    .split('Ç').join('&Ccedil;')
    .split('È').join('&Egrave;')
    .split('É').join('&Eacute;')
    .split('Ê').join('&Ecirc;')
    .split('Ë').join('&Euml;')
    .split('Ì').join('&Igrave;')
    .split('Í').join('&Iacute;')
    .split('Î').join('&Icirc;')
    .split('Ï').join('&Iuml;')
    .split('Ð').join('&ETH;')
    .split('Ò').join('&Ograve;')
    .split('Ó').join('&Oacute;')
    .split('Ô').join('&Ocirc;')
    .split('Õ').join('&Otilde;')
    .split('Ö').join('&Ouml;')
    .split('Ø').join('&Oslash;')
    .split('Ù').join('&Ugrave;')
    .split('Ú').join('&Uacute;')
    .split('Û').join('&Ucirc;')
    .split('Ü').join('&Uuml;')
    .split('Ý').join('&Yacute;')
    .split('Þ').join('&THORN;')
    .split('ß').join('&szlig;')
    .split('à').join('&agrave;')
    .split('á').join('&aacute;')
    .split('â').join('&acirc;')
    .split('ã').join('&atilde;')
    .split('ä').join('&auml;')
    .split('å').join('&aring;')
    .split('æ').join('&aelig;')
    .split('ç').join('&ccedil;')
    .split('è').join('&egrave;')
    .split('é').join('&eacute;')
    .split('ê').join('&ecirc;')
    .split('ë').join('&euml;')
    .split('ì').join('&igrave;')
    .split('í').join('&iacute;')
    .split('î').join('&icirc;')
    .split('ï').join('&iuml;')
    .split('ð').join('&eth;')
    .split('ò').join('&ograve;')
    .split('ó').join('&oacute;')
    .split('ô').join('&ocirc;')
    .split('õ').join('&otilde;')
    .split('ö').join('&ouml;')
    .split('ø').join('&oslash;')
    .split('ù').join('&ugrave;')
    .split('ú').join('&uacute;')
    .split('û').join('&ucirc;')
    .split('ü').join('&uuml;')
    .split('ý').join('&yacute;')
    .split('þ').join('&thorn;')
    .split('ÿ').join('&yuml;')
    .split('¨').join('')
    .split('%').join('')

  // Remove spaces
  url = url.replace(/%20/g, "")
  url = url.replace(/\s/g, "")

  // Tildes y ñ
  url = url.replace(/á/gi, "a");
  url = url.replace(/é/gi, "e");
  url = url.replace(/í/gi, "i");
  url = url.replace(/ó/gi, "o");
  url = url.replace(/ú/gi, "u");
  url = url.replace(/ñ/gi, "n");

  return url
}

const makeCode = (length) => {
  var result = ''
  var characters = '0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result
}

const addDays = (date, days) => {
  date.setDate(date.getDate() + days)
  return date
}

const isSpecialProduct = (product) => {
  if (product.genderCode === 6 || product.genderCode === 7 || product.genderCode === 9 || product.genderCode === 10 || product.genderCode === 13)
    return true
  return false
}

const checkCreditDiscount = (product) => {
  if (product.genderCode >= 5) {
    if (product.genderCode !== 5) {
      return false
    }
  }
  return true
}

const getGender = (gender) => {
  if (gender === 1) {
    return 'MUJER'
  } else if (gender === 2) {
    return 'HOMBRE'
  } else if (gender === 3) {
    return 'NIÑA'
  } else if (gender === 4) {
    return 'NIÑO'
  } else {
    return ''
  }
}

const getImage = async (collection, businessUnit, node) => {
  let subcategories = await getSubcategories([node], [])
  let aux = []
  subcategories.forEach(category => {
    aux.push({ categoryCode: category.categoryCode })
  })

  aux.unshift({ categoryCode: node })

  let where = {
    or: aux,
    and: [
      {
        businesses: {
          elemMatch: {
            code: businessUnit
          }
        }
      },
      { photos: { 'exists': true, 'not': { 'size': 0 } } }
    ]
  }

  let products = await loopbackFind(collection, { where: where, limit: 10, order: 'buyDate DESC' })
  if (products[0] !== undefined)
    return products[0].photos[0].description
  return ''
}

const recursiveCount = (nodes, total) => {
  if (nodes.length === 0) {
    return total
  }
  let aux = []
  for (let node of nodes) {
    for (let item of node.subNodes) {
      if (item.count !== undefined) {
        total += item.count
      }
      aux.push(item)
    }
  }
  nodes = aux
  return recursiveCount(nodes, total)
}

const isExternalLink = (url) => {
  return (url.substring(0, 4) === 'http' || url.substring(0, 5) === 'https')
}

// Convierte formato de tiempo de 24 horas a 12 horas con AM y PM //
const convertTime = (time) => {
  // Revisa si es formato de tiempo correcto y lo separa en partes
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time]

  if (time.length > 1) {
    time = time.slice(1)
    time[5] = +time[0] < 12 ? ' AM' : ' PM'
    time[0] = +time[0] % 12 || 12
  }
  return time.join('')
}

const getQuery = (query, field, attributesArray) => {
  if (attributesArray.length !== 0) {
    if (attributesArray.length > 1) {
      let filterArray = []
      attributesArray.forEach(attribute => {
        let attributeObject = {}
        attributeObject[field] = attribute
        filterArray.push(attributeObject)
      })
      query.or = filterArray
    } else {
      query[field] = attributesArray[0]
    }
  }
  return query
}

const createQuery = async (businessUnit, data) => {
  console.log('generate query')
  console.log(data)

  let withBrands = data.brands || []
  let withCategories = data.category || []
  let withProducts = data.productsCode || []

  let query = {
    where: {
      businesses: {
        elemMatch: {
          code: businessUnit
        }
      }
    },
    include: ['gender', 'color', 'brand', 'detail']
  }

  if (withCategories.length > 0) {
    let categoryArray = []
    await asyncForEach(withCategories, async (category) => {
      let categories = await getSubcategories([category.node], [])
      let aux = []
      categories.forEach(item => {
        aux.push({ categoryCode: item.categoryCode })
      })
      aux.unshift({ categoryCode: category.node })
      categoryArray = aux
      categoryArray.push({ categoryCode: category.node })
    })
    query.where.and = [
      { or: categoryArray }
    ]
  }

  // Brands
  if (withBrands.length > 0) {
    let brandArray = []
    withBrands.forEach(brand => {
      brandArray.push({ brandCode: brand })
    })
    if (query.where.and !== undefined) {
      query.where.and.push({
        or: brandArray
      })
    } else {
      query.where.and = [
        { or: brandArray }
      ]
    }
  }

  // Products
  if (withProducts.length > 0) {
    let productArray = []
    withProducts.forEach(product => {
      productArray.push({ code: product })
    })
    console.log(query.where.and)
    if (query.where.and !== undefined) {
      query.where.and.push({
        or: withProducts
      })
    } else {
      query.where.and = [
        { or: productArray }
      ]
    }
  }
  
  // Discount
  if (data.discount) {
    if (query.where.and === undefined) {
      query.where.and = []
    }
    query.where.and.push({
      percentagePrice: {
        gt: 0
      }
    })
  }

  // Limit
  if (data.productLimit) {
    query.limit = data.productLimit
  }

  // Order
  let order = 'buyDate DESC'
  if (data.order !== null && !isEmpty(data.order)) {
    if (data.order === 'priceLowToHight') {
      order = 'price ASC'
    }
    else if (data.order === 'priceHightToLow') {
      order = 'price DESC'
    } else if (data.order === 'brandNameASC') {
      order = 'name ASC'
    } else if (data.order === 'brandNameDESC') {
      order = 'name DESC'
    } else if (data.order === 'bestOffer') {
      order = 'percentagePrice DESC'
    } else if (data.order === 'bluePoints') {
      order = 'bluePoints.winPercentage DESC'
    }
  }
  query.order = order

  if (data.withBluePoints) {
    if (query.where.and === undefined) {
      query.where.and = []
    }
    query.where.and.push({
      'bluePoints.status': true
    })
  }
  return query
}

Date.prototype.addHours = function(h) {
  this.setHours(this.getHours() + h)
  return this
}

Date.prototype.subtractHours = function(h) {
  this.setHours(this.getHours() - h)
  return this
}

const validateStaticUrl = (url) => {
  let exists = false
  let staticsUrl = [
    '/espera-nuestra-llamada',
    '/ingreso',
    '/nosotros',
    '/nueva-contrasena',
    '/pagar',
    '/privacidad',
    '/recuperar-contrasena',
    '/registro',
    '/solicitud-credivale',
    '/soporte',
    '/terminos',
    '/tiendas',
    '/validar-credivale',
    '/mi-cuenta',
    '/mi-cuenta/mis-catalogos',
    '/mi-cuenta/informacion-personal',
    '/mi-cuenta/mis-direcciones',
    '/mis-pedidos',
    '/soporte',
    '/compras/finalizar'
  ]

  for (let i = 0; i < staticsUrl.length; i++) {
    if (staticsUrl[i] === url) {
      exists = true
      break
    }
  }
  return { exists: exists }
}

const getSizesRange = (product) => {
  let sizes = product.sizes
  let string = ''
  if (sizes.length >= 2) {
    string = sizes[0] + ' - ' + sizes[sizes.length - 1]
  }
  return string
}


const unidadToInstance = (unidad) => {
  let instance = ''
switch (unidad) {
    case '2': instance = 'e2a08434-976d-44cc-b1c0-16c5235b0b62' // urbana
        break;
    case '3': instance = '' // calzaconfort
        break;
    case '8': instance = '054b980b-6f4e-4d0c-8d53-1915be4abea2' // calzzapato
        break;
    case '9': instance = '2b0c178e-516b-4673-b5be-46a298a159d1' // kelder
        break;
    case '10': instance = 'aecc4fd0-6171-4a55-a5eb-803a051574a5' // calzzakids
        break;
    case '11': instance = '2c8041f1-d7f1-462c-b39d-3ca68f252579' // calzzasport
        break;
    case '12': instance = '' // flexi
        break;
    case '13': instance = '' // calzzeus
        break;
    case '15': instance = '' // adidas
        break;
    case '16': instance = '' // vans
        break;
}
return instance;
}

module.exports = ({
  Constants:Constants,
  createFileIntoCDN,
  onlyDate,
  isNumeric,
  isDouble,
  isEmpty,
  numberWithCommas,
  validateEmail,
  cloneJson,
  jsonToArray,
  addFormat,
  connectToDB,
  asyncForEach,
  sendEmail,
  request,
  readFile,
  arrayUnique,
  uniqBy,
  orderBy,
  readDir,
  encode,
  decode,
  getDeliveryDate,
  findMongoDB,
  updateMongoDb,
  createMongoDB,
  findOne,
  createUniqueMongoDB,
  generateURL,
  makeCode,
  addDays,
  isSpecialProduct,
  getGender,
  checkCreditDiscount,
  loopbackFind,
  loopbackCount,
  imageIsVertical,
  getAllProductsByCategories,
  unzipperFile,
  dropCollectionMongoDB,
  createMongoDBIndexes,
  dropMongoDBIndexes,
  findAndUpdateMongoDB,
  millisToMinutesAndSeconds,
  groupBy,
  getSubcategories,
  mongoFind,
  connectToMongoDB,
  closeMongoDB,
  syncAll,
  findAndDeleteMongoDB,
  recursiveCount,
  getImage,
  cardTokenizationWithNetpay,
  riskManagerNetPay,
  chargeAuthNetPay,
  getCallToAction,
  isExternalLink,
  convertTime,
  createQuery,
  getQuery,
  validateStaticUrl,
  getSizesRange,
  unidadToInstance
})
