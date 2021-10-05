'use strict'

const Utils = require('../Utils.js')
const handlebars = require('handlebars')
const pdf = require('html-pdf')
const fs = require('fs')

const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'

if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}

const configs = require('../configs.' + NODE_ENV + '.json')
const datasources = require(environment)

module.exports = function(Cart) {
  const BBVA_PAY = 1
  const CREDIVALE_PAY = 2
  const OXXO_PAY = 3
  const PAYPAL = 4
  const NETPAY = 5

  Cart.getCarts = async (req) => {
    console.log(req.query)
    req.setTimeout(999999999)

    let response = []

    let db = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password,
      database: datasources.ecommerce.database
    })

    let kpis = [
      {
        title: 'Compras fallidas',
        value: 0,
        subvalue: 0
      },
      {
        title: 'Carritos activos',
        value: 0,
        subvalue: 0
      },
      {
        title: 'Total carritos',
        value: 0,
        subvalue: 0
      }
    ]

    try {

      let limit = 1000
      if (req.query !== undefined && req.query.filter !== undefined) {
        limit = Number(req.query.filter.where.limit)
      }

      if (isNaN(limit) || limit <= 0) {
        limit = 1000
      }

      let carts = await Utils.loopbackFind(Cart, {
        where: {
          status: true,
          user: { nlike: null },
        }, order: 'updatedAt DESC', limit: limit
      })
  
      await Utils.asyncForEach(carts, async (cart) => {
        let user = await db.query('SELECT id, name, firstLastName, secondLastName, email, cellphone FROM User WHERE id = ?', [cart.user])
        if (user.length > 0) {
          user = user[0]
          cart.user = {
            name: user.name.trim() + ' ' + user.firstLastName.trim() + ' ' + user.secondLastName.trim(),
            email: user.email,
            cellphone: user.cellphone
          }

          cart.shoppings = await db.query('SELECT count(*) AS count FROM `Order` WHERE calzzapatoCode IS NOT NULL AND userId = ?;', [user.id])
          cart.shoppings = cart.shoppings[0].count

          let tryBuy = false
          let descriptionStatus = 'CARRITO ACTIVO'

          cart.historial.forEach(item => {
            if (item.action === 'TRY_BUY') {
              tryBuy = true
              descriptionStatus = 'FALLO AL COMPRAR'
              if (item.response !== undefined && item.response.paymentWay !== undefined) {
                if (item.response.paymentWay === BBVA_PAY) {
                  descriptionStatus = 'FALLO CON BBVA'
                } else if (item.response.paymentWay === CREDIVALE_PAY) {
                  descriptionStatus = 'FALLO CON CREDIVALE'
                } else if (item.response.paymentWay === OXXO_PAY) {
                  descriptionStatus = 'FALLO CON OXXO'
                } else if (item.response.paymentWay === PAYPAL) {
                  descriptionStatus = 'FALLO CON PAYPAL'
                } else if (item.response.paymentWay === NETPAY) {
                  descriptionStatus = 'FALLO CON NETPAY'
                }
              }
            }
          })

          let products = []
          cart.totalProducts = 0
          cart.total = 0
          
          await Utils.asyncForEach(cart.products, async (product, idx) => {
            let filter = {
              where: {
                code: product.code
              },
              include: ['brand']
            }

            let productDetail = await Utils.request({
              method: 'GET',
              json: true,
              url: configs.HOST_ECOMMERCE + ':' + configs.PORT_ECOMMERCE + '/api/products/findOne?filter=' + JSON.stringify(filter),
            })

            if (productDetail.body !== undefined && productDetail.body.code !== undefined) {
              let productItem = productDetail.body
              productItem.subtotal = 0

              if (Number(productItem.discountPrice) > 0) {
                productItem.subtotal = (Number(productItem.discountPrice) * product.quantity)
                cart.total += (Number(productItem.discountPrice) * product.quantity)
                kpis[2].value += (Number(productItem.discountPrice) * product.quantity)
                if (tryBuy) {
                  kpis[0].value += (Number(productItem.discountPrice) * product.quantity)
                } else {
                  kpis[1].value += (Number(productItem.discountPrice) * product.quantity)
                }
              } else {
                productItem.subtotal = (Number(productItem.price) * product.quantity)
                cart.total += (Number(productItem.price) * product.quantity)
                kpis[2].value += (Number(productItem.price) * product.quantity)
                if (tryBuy) {
                  kpis[0].value += (Number(productItem.price) * product.quantity)
                } else {
                  kpis[1].value += (Number(productItem.price) * product.quantity)
                }
              }

              productItem.quantity = Utils.numberWithCommas(product.quantity)
              productItem.size = product.size
              productItem.article = product.article
              productItem.subtotal = Utils.numberWithCommas(productItem.subtotal.toFixed(2))

              cart.totalProducts += product.quantity

              if (product.instance === 1) {
                productItem.url = 'https://www.calzzapato.com' + productItem.url
              } else if (product.instance === 2) {
                productItem.url = 'https://www.kelder.mx' + productItem.url
              } else if (product.instance === 3) {
                productItem.url = 'https://www.urbanna.mx' + productItem.url
              } else if (product.instance === 4) {
                productItem.url = 'https://www.calzzasport.com' + productItem.url
              } else if (product.instance === 5) {
                productItem.url = 'https://www.calzakids.mx' + productItem.url
              }

              if (productItem.photos.length > 0) {
                productItem.photo = 'https://s3-us-west-1.amazonaws.com/calzzapato/thumbs/' + productItem.photos[0].description
              }

              products.push(productItem)
            }
          })

          cart.products = products
          
          let oneDay = 1000 * 60 * 60 * 24
          // To set present_dates to two variables
          let now = new Date()
          // 0-11 is Month in JavaScript
          let createDate = new Date(cart.createdAt)
          let updateDate = new Date(cart.updatedAt)

          // To Calculate the result in milliseconds and then converting into days
          cart.createDays = Math.round(now.getTime() - createDate.getTime()) / (oneDay)
          cart.updateDays = Math.round(now.getTime() - updateDate.getTime()) / (oneDay)

          if (cart.createDays <= 2) {
            let hours = Math.abs(now.getTime() - createDate) / 36e5
            cart.createDays = 'Hace ' + hours.toFixed(0) + ' horas'
          }
          else {
            cart.createDays = 'Hace ' + cart.createDays.toFixed(0) + ' días'
          }

          if (cart.updateDays <= 2) {
            let hours = Math.abs(now.getTime() - updateDate) / 36e5
            cart.updateDays = 'Hace ' + hours.toFixed(0) + ' horas'
          }
          else {
            cart.updateDays = 'Hace ' + cart.updateDays.toFixed(0) + ' días'
          }

          cart.movements = cart.historial.length
          cart.status = descriptionStatus
          if (cart.totalProducts > 0) {
            cart.totalProducts = Utils.numberWithCommas(cart.totalProducts)
            cart.total = Utils.numberWithCommas(cart.total.toFixed(2))
            kpis[2].subvalue ++
            if (tryBuy) {
              kpis[0].subvalue ++
              response.unshift(cart)
            } else {
              kpis[1].subvalue ++
              response.push(cart)
            }
          }
        }
      })
    } catch (err) {
      console.log(err)
    }

    await db.close()
    return {
      kpis: kpis,
      carts: response
    }
  }

  Cart.remoteMethod('getCarts', {
    description: 'Get carts',
    http: {
      path: '/all',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'array',
      root: true
    }
  })

  Cart.generatePDF = async (req, res) => {
    console.log(req.query)
    req.setTimeout(999999999)

    let filter = {
      where: {
        limit: Number(req.query.limit)
      }
    }

    try {
      let carts = await Utils.request({
        method: 'GET',
        json: true,
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/all?filter=' + JSON.stringify(filter),
        headers: {
          download: 1
        }
      })

      let template = await Utils.readFile(__dirname + '/../templates/carts.hbs')

      handlebars.registerHelper('limit', function (arr, limit) {
        if (!Array.isArray(arr)) { return []; }
        return arr.slice(0, limit);
      });

      handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
        switch (operator) {
          case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this)
          case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this)
          case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this)
          case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this)
          case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this)
          case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this)
          case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this)
          case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this)
          case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this)
          case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this)
          default:
            return options.inverse(this)
        }
      })

      template = handlebars.compile(template)

      let timestamp = Date.now()
      
      // { "width": "874px", "height": "1240px" }

      pdf.create(template({ carts: carts.body })).toFile('../../cdn/carts/Carritos abandonados - ' + timestamp + '.pdf', async (err, stream) => {
        if (err) {
          console.log(err)
        } else {
          let file = fs.createReadStream(stream.filename)
          let stat = fs.statSync(stream.filename)
          res.setHeader('Content-Length', stat.size)
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', 'attachment; filename=Carritos abandonados - ' + timestamp + '.pdf')
          fs.unlinkSync(stream.filename)
          file.pipe(res)
        }
      })
    } catch (err) {
      console.log(err)
    }
  }

  Cart.remoteMethod('generatePDF', {
    description: 'Generate shopping carts report PDF',
    http: {
      path: '/download',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'res', type: 'object', http: ctx => { return ctx.res } }
    ],
    returns: [
      { arg: 'body', type: 'file', root: true },
      { arg: 'Content-Type', type: 'string', http: { target: 'header' } }
    ]
  })
}
