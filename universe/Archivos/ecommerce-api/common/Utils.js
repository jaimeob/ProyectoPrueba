'use strict'

const lodash = require('lodash')
const fs = require('fs')
const req = require('request')
const nodemailer = require('nodemailer')
const ObjectId = require('mongodb').ObjectID
const jimp = require('jimp')
const bwipjs = require('bwip-js')
const NODE_ENV = process.env.NODE_ENV || 'development'
const mongodb = require('./classes/mongodb.js')
const CDN = require('./classes/cdn.js')
const configs = require('./configs.' + NODE_ENV + '.json')

// SYNC
const syncAll = async () => {
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/attributes' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/brands' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/businesses' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/categories' })
  // await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/colors' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/genders' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/zones' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/stores' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/sublines' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/products' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/products/businesses' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/products/category' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/products/photos' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/menu' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/buttons' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/products/attributes' })
  if (process.env.NODE_ENV === 'production') {
    await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/google' })
    await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/sitemaps' })
  }
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/products/stock' })
  await request({ method: 'POST', timeout: configs.timeout, url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/products/stores' })
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

const createQuery = async (businessUnit, data) => {
  let withBrands = data.brands || []
  let withCategories = data.categories || []
  let withProducts = data.productsQuery === '' ? [] : data.productsQuery.split(',')

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
      productArray.push({ code: product.trim() })
    })
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
  if (data.withDiscount) {
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
  if (data.productsLimit) {
    query.limit = data.productsLimit
  }

  // Order
  let order = 'buyDate DESC'
  if (data.order.value !== null && !isEmpty(data.order.value)) {
    if (data.order.value === 'priceLowToHight') {
      order = 'price ASC'
    }
    else if (data.order.value === 'priceHightToLow') {
      order = 'price DESC'
    } else if (data.order.value === 'brandNameASC') {
      order = 'name ASC'
    } else if (data.order.value === 'brandNameDESC') {
      order = 'name DESC'
    } else if (data.order.value === 'bestOffer') {
      order = 'percentagePrice DESC'
    } else if (data.order.value === 'bluePoints') {
      order = 'bluePoints.winPercentage DESC'
    }
  }
  query.order = order

  // if (data.withBluePoints) {
  //   if (query.where.and === undefined) {
  //     query.where.and = []
  //   }
  //   query.where.and.push({
  //     bluePoints: {
  //       status: true
  //     }
  //   })
  // }

  return query
}

const getSubcategories = async (newSubcategories, subcategories) => {
  const db = mongodb.getConnection('db')

  if (newSubcategories.length === 0) {
    return subcategories
  }

  let response = []
  let aux = []
  await asyncForEach(newSubcategories, async (item) => {
    response = await mongodb.mongoFind(db, 'Category', { father: item })
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
  for (let i = 0; i < len; i++) { char = val.charAt(i); if (chars.indexOf(char) === -1) { numeric = false } }
  return numeric
}

const isDouble = (val) => {
  var numeric = true
  var chars = "0123456789.+"
  var len = val.length
  var char = ""
  for (let i = 0; i < len; i++) { char = val.charAt(i); if (chars.indexOf(char) === -1) { numeric = false } }
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
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
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
    html: options.template,
    attachments: (options.attachments !== undefined) ? options.attachments : []
  })

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
  url = url.replace(/á/gi, "a")
  url = url.replace(/é/gi, "e")
  url = url.replace(/í/gi, "i")
  url = url.replace(/ó/gi, "o")
  url = url.replace(/ú/gi, "u")
  url = url.replace(/ñ/gi, "n")

  return url.toLowerCase()
}

const makeCode = (length) => {
  var result = ''
  var characters = '0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
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

const generateBarcode = async (data) => {
  return new Promise(async (resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'code128',
      text: data,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    }, async (err, png) => {
      if (err) {
        resolve({ success: false })
      } else {
        let responseFile = await CDN.createFileIntoCDN(data + '.png', '/barcode', png.toString('base64'))
        if (responseFile.success) {
          resolve({ success: true, url: responseFile.url })
        }
      }
    })
  })
}

const getSizesRange = (product) => {
  let sizes = product.sizes
  let string = ''
  if (sizes.length >= 2) {
    string = sizes[0] + ' - ' + sizes[sizes.length - 1]
  }
  return string
}

const getAge = (value) => {
  let today = new Date()
  let birthDate = new Date(value)
  let age = today.getFullYear() - birthDate.getFullYear()
  let m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

const checkSpecialCharacters = (value) => {
  if (value.includes('[') || value.includes('¿') || value.includes(',') || value.includes('.') || value.includes('!') || value.includes('@') || value.includes('^') || value.includes('|') || value.includes('°') || value.includes('¬') || value.includes('¨') || value.includes('*') || value.includes('/') || value.includes('\\') || value.includes('-') || value.includes(';') || value.includes('}') || value.includes('%') || value.includes('{') || value.includes(')') || value.includes('&') || value.includes('$') || value.includes('¡') || value.includes('=') || value.includes('#') || value.includes('+') || value.includes('\'') || value.includes('\"')) {
    return true
  } else {
    return false
  }
}

const isExternalLink = (url) => {
  return (url.substring(0, 4) === 'http' || url.substring(0, 5) === 'https')
}

const sendNotification = async (data) => {
  await request({
    url: configs.HOST_TRACKING_IP + ':' + configs.PORT_TRACKING + '/api/users/notification',
    method: 'POST',
    json: true,
    headers: {
      Authorization: 'Bearer ' + configs.envia.token
    },
    body: data
  })
}

const generateMenu = async (uuid) => {
  let tree = await request({
    method: 'GET',
    json: true,
    url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/menu/tree',
    headers: {
      uuid
    }
  })

  let treeData = tree.body
  let menuMap = []
  treeData.map(data => {
    if (data.subNodes.length !== 0 && data.key !== 'brands') {
      menuMap.push(generateURL(data.description))
      data.subNodes.map(subdata => {
        subdata.count !== 0 ? menuMap.push(generateURL(data.description) + '/' + generateURL(subdata.description)) : null
        subdata.subNodes.map(subsubdata => {
          subsubdata.count !== 0 ? menuMap.push(generateURL(data.description) + '/' + generateURL(subdata.description) + '/' + generateURL(subsubdata.description)) : null
          subsubdata.subNodes.map(subsubsubdata => {
            subsubsubdata.count !== 0 ? menuMap.push(generateURL(data.description) + '/' + generateURL(subdata.description) + '/' + generateURL(subsubdata.description) + '/' + generateURL(subsubsubdata.description)) : null
            subsubsubdata.subNodes.map(subsubsubsubdata => {
              subsubsubsubdata.count !== 0 ? menuMap.push(generateURL(data.description) + '/' + generateURL(subdata.description) + '/' + generateURL(subsubdata.description) + '/' + generateURL(subsubsubdata.description) + '/' + generateURL(subsubsubsubdata.description)) : null
            })
          })
        })
      })
    } else {
      if (data.key === 'brands') {
        menuMap.push(data.url)
      } else {
        if (!isExternalLink(data.filter.url)) {
          let cam = data.filter.queryParams.map(i => `${i.key}=${i.value}`)
          menuMap.push(data.filter.queryParams.length !== 0 ? data.filter.url.split('/').join('').toLowerCase() + '?' + cam : data.filter.url.split('/').join('').toLowerCase())
        }
      }
    }
  })
  return menuMap
}

const createBreadcrumbs = async (model, categoryCode, categories) => {
  if (categoryCode === 0) {
    return categories
  }
  let category = await loopbackFind(model, { where: { node: categoryCode } })
  categories.unshift(category[0])
  return createBreadcrumbs(model, category[0].father, categories)
}

module.exports = ({
  createQuery,
  syncAll,
  onlyDate,
  isNumeric,
  isDouble,
  isEmpty,
  numberWithCommas,
  validateEmail,
  cloneJson,
  jsonToArray,
  addFormat,
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
  millisToMinutesAndSeconds,
  groupBy,
  getSubcategories,
  recursiveCount,
  getImage,
  generateBarcode,
  getSizesRange,
  getAge,
  checkSpecialCharacters,
  isExternalLink,
  sendNotification,
  generateMenu,
  createBreadcrumbs
})