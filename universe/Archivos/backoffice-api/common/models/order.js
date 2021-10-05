'use strict'

const Utils = require('../Utils.js')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')
const facebook = "https://i.imgur.com/WbUpJ3D.png"
const instagram = "https://i.imgur.com/mDzzAGi.png"
const whatsapp = "https://i.imgur.com/rBMgS23.png"
const youtube = "https://i.imgur.com/nVSzbQv.png"



const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'

if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}

const configs = require('../configs.' + NODE_ENV + '.json')
const datasources = require(environment)

module.exports = (Order) => {
  let PAYMENT_WAY = 1

  const messagesError = {
    invalidUser: '00001',
    invalidShippingAddress: '00002',
    invalidShoppingCart: '00003',
    thereIsNotStock: '00004',
    errorToCreateOrder: '00005',
    errorToCreateOrderBancomer: '00006'
  }

  Order.getOrders = async (filter, req) => {
    let response = { orders: [], count: 0 }
    let instanceId = req.headers.instanceId
    let filterDate = ''
    let filterOffset = ''
    let limit = 50
    let page = 0
    let filters = ''
    let cityName = ''

    let db = await Utils.connectToDB()

    let dbEcommerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })

    try {
      // 'AND month(shoppingDate) = 4 AND year(shoppingDate) = 2020'

      if (req.query !== undefined && req.query !== null && req.query !== undefined && req.query !== null && req.query.filter !== undefined && req.query.filter !== null) {
        let filterReq = JSON.parse(req.query.filter)
        cityName = filterReq.cityName

        if (filterReq.page !== 0) {
          page = Number(filterReq.page) - 1
          page = page * limit
        }
        if (filterReq.filters !== undefined && filterReq.filters !== null) {
          filters = 'AND ( o.calzzapatoCode LIKE "' + filterReq.filters + '%" OR o.order LIKE  "' + filterReq.filters + '%" OR sm.name LIKE  "' + filterReq.filters + '%" OR pm.name LIKE  "' + filterReq.filters + '%"  OR o.total LIKE  "' + filterReq.filters + '%"  OR pm.name LIKE  "' + filterReq.filters + '%" )'
        }
      }
      filterOffset = ' LIMIT ' + limit + ' OFFSET ' + page



      let orders = await dbEcommerce.query("SELECT o.id, o.shoppingDate, o.order, o.calzzapatoCode, TRIM(CONCAT(u.name, ' ', u.firstLastName, ' ', u.secondLastName)) AS fullName,u.email, u.cellphone, u.phone, o.discount, o.shippingCost, o.subtotal, o.total, o.pipeline, p.name AS pipelineName, o.paymentMethodId, o.shippingMethodId, pm.name AS paymentMethod, sm.name AS shippingMethod, o.createdAt, o.updatedAt FROM `Order` AS o \
      LEFT JOIN Pipeline AS p ON p.id = o.pipeline \
      LEFT JOIN User AS u ON u.id = o.userId \
      LEFT JOIN PaymentMethod AS pm ON pm.id = o.paymentMethodId\
      LEFT JOIN `ShippingAddress` AS sa ON o.shippingAddressId = sa.id\
      LEFT JOIN `OrderDetail` AS ord ON ord.orderId = o.id\
      LEFT JOIN `Address` AS ad ON sa.addressId = ad.id\
      LEFT JOIN `Municipality` AS mu on mu.municipalityStateCode = ad.municipalityCode\
      LEFT JOIN ShippingMethod AS sm ON sm.id = o.shippingMethodId \
      WHERE " + filterDate + ` o.status = 1${cityName != '' && cityName != undefined ? " AND mu.name = '" + cityName + "' " : ' '}` + filters + " ORDER BY updatedAt DESC " + filterOffset + " ;")

      let count = await dbEcommerce.query('SELECT count(*) AS total FROM `Order` AS o LEFT JOIN Pipeline AS p ON p.id = o.pipeline LEFT JOIN User AS u ON u.id = o.userId LEFT JOIN PaymentMethod AS pm ON pm.id = o.paymentMethodId LEFT JOIN ShippingMethod AS sm ON sm.id = o.shippingMethodId WHERE  o.status = 1 ' + filters)
      let addresses = []

      await Utils.asyncForEach(orders, async (order) => {
        /*
        let assignments = await db.query('SELECT u.id, TRIM(CONCAT(u.name, " ", u.firstLastName, " ", u.secondLastName)) AS fullName, u.email FROM Assignment AS a LEFT JOIN User AS u ON u.id = a.userId WHERE a.status = 1 AND u.status = 1 AND a.orderId = ?', [
          order.id
        ])
        order.assigned = assignments[0]
        */

        if (order.paymentMethodId === 1) {
          order.paymentMethod = 'BBVA'
        } else if (order.paymentMethodId === 2) {
          order.paymentMethod = 'CREDIVALE'
        } else if (order.paymentMethodId === 3) {
          order.paymentMethod = 'OXXO'
          if (order.calzzapatoCode !== null) {
            order.pipelineName = 'ORDEN PAGADA'
          }
        } else if (order.paymentMethodId === 4) {
          order.paymentMethod = 'PAYPAL'
        } else if (order.paymentMethodId === 5) {
          //order.paymentMethod = 'NETPAY'
        }

        addresses = await dbEcommerce.query('select sa.name AS name, sa.phone, sa.reference, a.zip, s.name AS stateName, m.name AS municipalityName, lt.name AS locationTypeName, l.name AS locationName, a.street, a.exteriorNumber, a.interiorNumber, a.betweenStreets, a.lat, a.lng FROM `Order` AS o LEFT JOIN ShippingAddress AS sa ON sa.id = o.shippingAddressId LEFT JOIN Address AS a ON a.id = sa.addressId LEFT JOIN Location AS l ON l.locationMunicipalityStateCode = a.locationCode LEFT JOIN Municipality AS m ON m.municipalityStateCode = l.municipalityStateCode LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode LEFT JOIN State AS s ON s.code = m.stateCode where o.id = ? AND o.status = 1 AND a.status = 1 AND sa.status = 1;', [
          order.id
        ])

        order.address = addresses[0]

        order.detail = await dbEcommerce.query('select od.productCode, od.productArticleCode, od.productDescription, od.quantity, od.size, od.unitPrice FROM `Order` AS o LEFT JOIN OrderDetail AS od ON o.id = od.orderId LEFT JOIN User AS u ON u.id = o.userId LEFT JOIN ShippingAddress AS sa ON sa.id = o.shippingAddressId LEFT JOIN Address AS a ON a.id = sa.addressId LEFT JOIN Location AS l ON l.locationMunicipalityStateCode = a.locationCode LEFT JOIN Municipality AS m ON m.municipalityStateCode = l.municipalityStateCode LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode LEFT JOIN State AS s ON s.code = m.stateCode where od.status = 1 AND od.orderId = ?', [
          order.id
        ])
        await Utils.asyncForEach(order.detail, async (detail) => {
          let photos = await Utils.mongoFind('Product', { code: detail.productCode })
          if (photos.length > 0) {
            detail.photos = photos[0].photos
          }
        })
        let logs = await Utils.mongoFind('OrderLog', { orderId: order.id })
        if (logs.length > 0) {
          order.logs = logs[0]
        }
      })
      response.orders = orders
      if (count !== null && count !== undefined && count.length > 0) {
        response.count = count[0].total
      }

    } catch (err) {
      console.log(err)
    }
    await db.close()
    await dbEcommerce.close()
    return response
  }

  Order.createOrder = async (data, res, cb) => {
    let response = { created: false, paymentWay: PAYMENT_WAY }
    let orderId = null

    let instanceId = Order.app.get('instanceId')
    let user = Order.app.get('user')

    let products = Utils.orderBy(data.products, 'producto_id', 'ASC')
    let address = data.address
    let responseUser = []
    let responseOrder = []
    let responseAddress = []
    let responseCart = []
    let cart = []
    let subTotal = 0

    let db = await Utils.connectToDB()
    let dbOld = await Utils.connectToDB({
      host: datasources.old.host,
      port: datasources.old.port,
      database: datasources.old.database,
      user: datasources.old.user,
      password: datasources.old.password
    })

    try {
      responseUser = await db.query('SELECT * FROM User WHERE email = ? AND password = ? AND status = 1 LIMIT 1;', [user.email, user.password])

      if (responseUser.length === 0) {
        throw messagesError.invalidUser
      }


      responseAddress = await db.query('SELECT sa.id AS shippingAddressId, sa.*, a.*, l.name AS locationName, l.zone AS locationZone, m.name AS municipalityName, s.name AS stateName FROM ShippingAddress AS sa LEFT JOIN Address AS a ON sa.addressId = a.id LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode LEFT JOIN State AS s ON s.code = m.stateCode WHERE sa.userId = ? AND sa.addressId = ? AND sa.status = 1 AND a.status = 1 LIMIT 1;', [responseUser[0].id, address.addressId])

      if (responseAddress.length === 0) {
        throw messagesError.invalidShippingAddress
      }

      let productsId = ''
      data.products.forEach((product, idx) => {
        if (idx !== 0) {
          productsId += ',"' + product.producto_id + '"'
        }
        else {
          productsId = '"' + product.producto_id + '"'
        }
      })

      responseCart = await dbOld.query('SELECT * FROM productos WHERE producto_id IN (' + productsId + ') AND deleted_at IS NULL ORDER BY producto_id ASC;')

      if (responseCart.length !== data.products.length) {
        throw messagesError.invalidShoppingCart
      }

      let responseStockBranch = null
      let stock = 0
      let thereIsStock = true
      await Utils.asyncForEach(responseCart, async (item, idx) => {
        responseStockBranch = await Utils.request({
          url: configs.HOST + ':' + configs.PORT + '/api/products/' + item.producto_id + '/stock'
        })
        if (responseStockBranch.body === undefined) {
          throw messagesError.thereIsNotStock
        }
        else {
          responseStockBranch = JSON.parse(responseStockBranch.body)
          stock = 0
          responseStockBranch.forEach((branch) => {
            if (products[idx].selectedArticle === branch.article) {
              responseCart[idx].article = products[idx].selectedArticle
              responseCart[idx].size = products[idx].selectedSize
              responseCart[idx].quantity = products[idx].quantity
              stock += Number(branch.stock)
            }
          })
          if (products[idx].quantity > stock) {
            thereIsStock = false
          }
        }
      })

      if (!thereIsStock) {
        throw messagesError.thereIsNotStock
      }

      let paymentMethodId = 1
      let paymentMethods = await db.query('SELECT * FROM PaymentMethod WHERE id = ? LIMIT 1;', [data.paymentMethod.id])
      if (paymentMethods.length > 0)
        paymentMethodId = paymentMethods[0].id

      if (paymentMethodId === 2 && data.digitalVale !== null) {
        PAYMENT_WAY = 2
        let crediValeResponse = await Utils.request({
          method: 'POST',
          url: configs.HOST + ':' + configs.PORT + '/api/credivales/validate',
          json: true,
          body: {
            data: {
              folio: data.digitalVale.folio,
              amount: data.digitalVale.amount
            }
          }
        })
      }

      let price = 0
      responseCart.forEach((item) => {
        price = 0
        if (Number(item.precio_porcentaje) > 0) {
          price = Number(item.precio_rebaja)
        }
        else {
          price = Number(item.precio)
        }

        subTotal += (price * Number(item.quantity))

        cart.push({
          sku: item.producto_id,
          article: item.article,
          description: item.nombre,
          size: item.size.toFixed(1).toString(),
          quantity: item.quantity,
          unitPrice: price
        })
      })

      let userId = responseUser[0].id
      let userName = (responseUser[0].name + " " + responseUser[0].firstLastName + " " + responseUser[0].secondLastName).trim()
      let userEmail = responseUser[0].email

      let phoneNumber = responseUser[0].phone

      if (!Utils.isEmpty(responseUser[0].cellphone)) {
        phoneNumber = responseUser[0].cellphone
      }

      responseAddress = responseAddress[0]

      let coupon = null

      let shippingCost = 0
      let shippingMethodId = 1
      let shippingMethods = await db.query('SELECT id, cost FROM ShippingMethod WHERE id = ? LIMIT 1;', [data.shippingMethod.id])
      if (shippingMethods.length > 0) {
        shippingMethodId = shippingMethods[0].id
        shippingCost = shippingMethods[0].cost
      }

      let discount = 0

      let coupons = await db.query('SELECT * FROM Coupon WHERE name = ? AND status = 1 LIMIT 1;', [
        data.coupon
      ])

      if (coupons.length > 0) {
        coupon = coupons[0]
        let percentageDiscount = Number(coupon.percentageDiscount)
        let priceDiscount = Number(coupon.priceDiscount)
        if (percentageDiscount > 0) {
          discount = ((subTotal * percentageDiscount) / 100)
        }
        else {
          discount = priceDiscount
        }
        coupon = Number(coupon.id)
      }

      subTotal = Number(subTotal)
      discount = Number(discount)
      shippingCost = Number(shippingCost)
      let total = (subTotal - discount) + shippingCost

      let pipeline = {
        id: 1,
        description: 'ORDEN CREADA'
      }

      if (responseUser[0].lastOrderId !== null) {
        responseOrder = await db.query('SELECT * FROM `Order` WHERE `instanceId` = ? AND `id` = ? AND `userId` = ? AND `calzzapatoCode` IS NULL AND `pipeline` = ? AND paymentMethodId = 1 LIMIT 1;', [
          instanceId,
          responseUser[0].lastOrderId,
          userId,
          pipeline.id
        ])
      }

      let order = Date.now()
      let reference = Math.floor(100000 + Math.random() * 900000) + "" + Math.floor(100000 + Math.random() * 900000) + "" + Math.floor(100000 + Math.random() * 900000) + "" + Math.floor(Math.random() * 10)

      let discountForProduct = (discount / cart.length)
      let shippingCostForProduct = (shippingCost / cart.length)

      await db.beginTransaction()
      if (responseOrder.length > 0) {
        order = responseOrder[0]
        orderId = order.id
        await db.query('UPDATE `Order` SET `shippingMethodId` = ?, `shippingAddressId` = ?, `discount` = ?, `shippingCost` = ?, `subtotal` = ?, `total` = ?, `paymentMethodId` = ?, `couponId` = ? WHERE id = ?', [
          shippingMethodId,
          responseAddress.shippingAddressId,
          discount,
          shippingCost,
          subTotal,
          total,
          paymentMethodId,
          coupon,
          order.id
        ])

        await db.query('UPDATE `OrderDetail` SET `status` = 2 WHERE orderId = ?', [order.id])
        await Utils.asyncForEach(cart, async (item) => {
          await db.query('INSERT INTO OrderDetail (orderId, productCode, productArticleCode, productDescription, quantity, size, unitPrice, discount, shippingCost, subtotal, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            order.id,
            item.sku,
            item.article,
            item.description,
            item.quantity,
            item.size,
            item.unitPrice,
            discountForProduct,
            shippingCostForProduct,
            (item.quantity * item.unitPrice),
            ((item.quantity * item.unitPrice) - discountForProduct)
          ])
        })

        response.order = order.order
        reference = order.reference
      }
      else {
        let responseCreateOrder = await db.query('INSERT INTO `Order` (`instanceId`, `order`, `reference`, `userId`, `shippingMethodId`, `shippingAddressId`, `discount`, `shippingCost`, `subtotal`, `total`, `paymentMethodId`, `couponId`, `pipeline`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [
          instanceId,
          order,
          reference,
          userId,
          shippingMethodId,
          responseAddress.shippingAddressId,
          discount,
          shippingCost,
          subTotal,
          total,
          paymentMethodId,
          coupon,
          pipeline.id
        ])

        orderId = responseCreateOrder.insertId

        await db.query('UPDATE `User` SET `lastOrderId` = ? WHERE `id` = ?;', [responseCreateOrder.insertId, userId])

        await Utils.asyncForEach(cart, async (item) => {
          await db.query('INSERT INTO OrderDetail (orderId, productCode, productArticleCode, productDescription, quantity, size, unitPrice, discount, shippingCost, subtotal, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            responseCreateOrder.insertId,
            item.sku,
            item.article,
            item.description,
            item.quantity,
            item.size,
            item.unitPrice,
            discountForProduct,
            shippingCostForProduct,
            (item.quantity * item.unitPrice),
            ((item.quantity * item.unitPrice) - discountForProduct)
          ])
        })

        response.order = order
      }

      if (PAYMENT_WAY === 2) {
        if (responseOrder.length > 0) {
          await db.query('UPDATE `PaymentCrediVale` SET folio = ?, amount = ?, orderAmount = ? WHERE orderId = ?', [
            data.digitalVale.folio,
            Number(data.digitalVale.amount),
            orderId,
            total
          ])
        }
        else {
          await db.query('INSERT INTO `PaymentCrediVale` (`orderId`, `folio`, `amount`, `orderAmount`) VALUES (?, ?, ?, ?);', [
            orderId,
            data.digitalVale.folio,
            Number(data.digitalVale.amount),
            total
          ])
        }

        let emailResponseOrder = await db.query('SELECT * FROM `Order` WHERE `id` = ? AND `status` = 1;', [orderId])
        let emailResponseOrderDetail = await db.query('SELECT * FROM OrderDetail WHERE orderId = ? AND status = 1;', [orderId])
        let emailResponseShippingMethod = await db.query('SELECT * FROM ShippingMethod WHERE id = ? AND status = 1 LIMIT 1;', [emailResponseOrder[0].shippingMethodId])
        let emailResponsePaymentMethod = await db.query('SELECT * FROM PaymentMethod WHERE id = ? AND status = 1 LIMIT 1;', [emailResponseOrder[0].paymentMethodId])
        let emailResponsePipeline = await db.query('SELECT * FROM Pipeline WHERE id = ? AND status = 1 LIMIT 1;', [emailResponseOrder[0].pipeline])

        await Utils.asyncForEach(emailResponseOrderDetail, async (detail, index) => {
          let photos = await dbOld.query('SELECT * FROM fotografias WHERE lote = ? AND angulo = 1 LIMIT 1', [detail.productCode])
          let url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/" + photos[0].nombre_fotografia
          emailResponseOrderDetail[index]["productImage"] = url
          emailResponseOrderDetail[index]["unitPrice"] = Utils.numberWithCommas(Number(emailResponseOrderDetail[index]["unitPrice"]).toFixed(2))
          emailResponseOrderDetail[index]["unitPrice"] = Utils.numberWithCommas(Number(emailResponseOrderDetail[index]["discount"]).toFixed(2))
          emailResponseOrderDetail[index]["unitPrice"] = Utils.numberWithCommas(Number(emailResponseOrderDetail[index]["shippingCost"]).toFixed(2))
          emailResponseOrderDetail[index]["unitPrice"] = Utils.numberWithCommas(Number(emailResponseOrderDetail[index]["subtotal"]).toFixed(2))
          emailResponseOrderDetail[index]["unitPrice"] = Utils.numberWithCommas(Number(emailResponseOrderDetail[index]["total"]).toFixed(2))
        })

        let orderData = {
          "logo": {
            "url": "https://i.imgur.com/HcaXIcC.png"
          },
          "facebook": facebook,
          "instagram": instagram,
          "whatsapp": whatsapp,
          "youtube": youtube,
          "user": {
            "name": responseOrder.name,
            "firstLastName": responseOrder.firstLastName,
            "secondLastName": responseOrder.secondLastName,
          },
          "order": {
            "order": emailResponseOrder[0].order,
            "reference": emailResponseOrder[0].reference,
            "discount": Utils.numberWithCommas(Number(emailResponseOrder[0].discount).toFixed(2)),
            "shippingCost": Utils.numberWithCommas(Number(emailResponseOrder[0].shippingCost).toFixed(2)),
            "subtotal": Utils.numberWithCommas(Number(emailResponseOrder[0].subtotal).toFixed(2)),
            "total": Utils.numberWithCommas(Number(emailResponseOrder[0].total).toFixed(2)),
            "shoppingDate": moment(emailResponseOrder[0].createdAt).locale('es').format("DD/MMMM/YYYY"),
            "shoppingDate2": moment(emailResponseOrder[0].createdAt).locale('es').add(8, 'days').format("DD/MMMM/YYYY"),
            "ShippingMethod": {
              "name": emailResponseShippingMethod[0].name,
              "description": emailResponseShippingMethod[0].description
            },
            "OrderDetail": emailResponseOrderDetail,
            "OrderDetailCod": emailResponseOrderDetail[0].productCode,
            "PaymentMethod": {
              "name": emailResponsePaymentMethod[0].name,
              "description": emailResponsePaymentMethod[0].description,
            },

            "ShippingAddress": {
              "Address": {
                "street": responseAddress.street,
                "exteriorNumber": responseAddress.exteriorNumber,
                "interiorNumber": responseAddress.interiorNumber,
                "location": responseAddress.locationName,
                "type": '',
                "zip": responseAddress.zip,
                "municipality": responseAddress.municipalityName,
                "state": responseAddress.stateName,
              }
            },
            "Pipeline": {
              "name": emailResponsePipeline[0].name,
              "description": emailResponsePipeline[0].description
            }
          }
        }

        const filePath = path.join(__dirname, '../templates/new-order.html')
        const source = fs.readFileSync(filePath, 'utf-8')
        const template = handlebars.compile(source)

        await Utils.sendEmail({
          from: '"Calzzapato.com" <contacto@calzzapato.com>',
          to: userEmail,
          cco: 'contacto@calzzapato.com',
          subject: 'Tu pedido está en camino - Calzzapato.com 👠',
          template: template(orderData)
        })

        await db.commit()
      }
      else {
        let hmac = crypto.createHmac('sha256', configs.bancomerPrivateKey)
        hmac.update(response.order + reference.toString() + total.toFixed(2).toString())
        let signature = hmac.digest('hex')

        let responseWebServiceBancomer = await Utils.request({
          method: 'POST',
          uri: configs.bancomerURL,
          form: {
            mp_account: configs.mp_account,
            mp_product: configs.mp_product,
            mp_order: response.order,
            mp_reference: reference.toString(),
            mp_node: configs.mp_node,
            mp_concept: configs.mp_concept,
            mp_amount: total.toFixed(2).toString(),
            mp_customername: userName,
            mp_email: userEmail,
            mp_phone: phoneNumber,
            mp_signature: signature,
            mp_currency: configs.mp_currency,
            mp_urlsuccess: configs.mp_urlsuccess,
            mp_urlfailure: configs.mp_urlfailure
          }
        })

        if (responseWebServiceBancomer.error) {
          throw messagesError.errorToCreateOrderBancom6r
        }
        else {
          response.body = responseWebServiceBancomer.body
          await db.commit()
        }
      }
    } catch (err) {
      console.log(err)
      response.error = err
      await db.rollback()
    }

    await dbOld.close()
    await db.close()

    if (PAYMENT_WAY === 2 && data.digitalVale) {
      let token = jwt.sign(response.order, configs.jwtPrivateKey)
      response.created = true
      response.paymentWay = 2
      response.order = token
      return response
    }
    else {
      if (response.error) {
        throw response.error
      }
      else {
        response.created = true
        return response
      }
    }
  }

  Order.userOrder = async (userId, res) => {
    let responseOrders = []

    let db = await Utils.connectToDB()
    let dbOld = await Utils.connectToDB({
      host: datasources.old.host,
      port: datasources.old.port,
      database: datasources.old.database,
      user: datasources.old.user,
      password: datasources.old.password
    })

    try {
      responseOrders = await db.query('SELECT `id`, `order`, `reference`, `pipeline`, `discount`, `shippingCost`, `subtotal`, `shippingMethodId`, `paymentMethodId`, `total`, `createdAt` AS shoppingDate, TIMESTAMPADD(DAY, 7, createdAt) as deliveryDate FROM `Order` WHERE userId=? AND status = 1;', [userId])

      for (let idx in responseOrders) {
        let address = await db.query('SELECT sa.name, a.zip, a.street, a.exteriorNumber, a.interiorNumber, l.name AS locationName, l.zone AS locationZone, m.name AS municipalityName, s.name AS stateName FROM ShippingAddress AS sa LEFT JOIN Address AS a ON sa.addressId = a.id LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode LEFT JOIN State AS s ON s.code = m.stateCode WHERE sa.userId = ? AND sa.status = 1 AND a.status = 1 LIMIT 1;', [userId])
        let pipeline = await db.query('SELECT `name`, `description` FROM `Pipeline` WHERE id = ? AND status = 1 LIMIT 1;', [responseOrders[idx].pipeline]);
        let paymentMethod = await db.query('SELECT `name`, `description` FROM `PaymentMethod` WHERE id = ? AND status = 1 LIMIT 1;', [responseOrders[idx].paymentMethodId]);
        let shippingMethod = await db.query('SELECT `name`, `description` FROM `ShippingMethod` WHERE id = ? AND status = 1 LIMIT 1;', [responseOrders[idx].shippingMethodId]);

        responseOrders[idx]['address'] = address[0];
        responseOrders[idx]['orderState'] = pipeline[0];
        responseOrders[idx]['paymentMethod'] = paymentMethod[0];
        responseOrders[idx]['shippingMethod'] = shippingMethod[0];
        responseOrders[idx]['orderDetail'] = await db.query('SELECT `productCode`, `productArticleCode`, `productDescription`, `quantity`, `size`, `unitPrice`, `discount`, `subtotal`, `total` FROM `OrderDetail` WHERE orderId = ? AND status = 1;', [responseOrders[idx].id]);

        for (let jdx in responseOrders[idx].orderDetail) {
          let product = await dbOld.query('SELECT m.descripcion AS brand, mc.descripcion AS color FROM productos AS p LEFT JOIN marcas AS m ON p.marca_id = m.id LEFT JOIN  marcas_colores AS mc ON p.marca_color_id = mc.id WHERE p.producto_id=? LIMIT 1;', [responseOrders[idx].orderDetail[jdx].productCode])
          let photos = await dbOld.query('SELECT * FROM fotografias WHERE lote = ? AND angulo = 1 LIMIT 1;', [responseOrders[idx].orderDetail[jdx].productCode])

          if (photos.length > 0) {
            let url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/" + photos[0].nombre_fotografia
            responseOrders[idx].orderDetail[jdx]["image"] = url;
          }

          if (product[0] != undefined) {
            responseOrders[idx].orderDetail[jdx]["brand"] = product[0].brand
            responseOrders[idx].orderDetail[jdx]["color"] = product[0].color
          }
        }
      }
    } catch (err) {
      await dbOld.close()
      await db.close()
      throw err;
    }

    await dbOld.close()
    await db.close()

    return responseOrders;
  }

  Order.getOrderByFolio = async (token) => {
    let order = []
    let orderDetail = []
    let shippingAddress = []
    let db = await Utils.connectToDB()
    try {
      let folio = jwt.verify(token, configs.jwtPrivateKey)

      order = await db.query('SELECT `id`, `shippingAddressId`, CAST(createdAt AS DATE) AS date FROM `Order` WHERE `order`=? AND `status`= 1;', [folio]);
      orderDetail = await db.query('SELECT COUNT(*) AS count FROM `OrderDetail` WHERE `orderId`="?" AND `status`= 1;', [order[0].id]);
      shippingAddress = await db.query('SELECT a.street,a.exteriorNumber,a.interiorNumber,a.zip, s.name AS state, m.name AS municipality,lt.name AS location, l.name AS suburb FROM `ShippingAddress` AS sa INNER JOIN `Address` AS a ON sa.addressId=a.id INNER JOIN State AS s ON a.stateCode = s.id INNER JOIN Municipality AS m ON a.municipalityCode=m.municipalityStateCode INNER JOIN Location AS l ON a.locationCode=l.locationMunicipalityStateCode INNER JOIN LocationType AS lt ON l.locationTypeCode=lt.code WHERE sa.id="?" ;', [order[0].shippingAddressId]);
    } catch (err) {
      console.log(err)
      await db.close();
      return {
        success: false
      }
    }
    await db.close();
    let response = {
      success: true,
      amount: orderDetail[0].count,
      address: shippingAddress[0],
      date: order[0].date
    }
    return response
  }

  Order.orderDetail = async (req, store) => {
    let response = {}
    let user = req.headers.user

    let db = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })

    try {
      if (user && !isNaN(user.id)) {
        let order = await db.query('SELECT `id`, `calzzapatoCode`, `order`, `reference`, `pipeline`, `discount`, `shippingCost`, `subtotal`, `shippingMethodId`, `paymentMethodId`, `shippingAddressId`, `total`, `createdAt` AS shoppingDate, TIMESTAMPADD(DAY, 7, createdAt) as deliveryDate FROM `Order` WHERE `order` = ? LIMIT 1;', [folio])
        let responseWebService = null
        responseWebService = await Utils.request(configs.HOST_IP_ECOMMERCE + ':' + configs.PORT_IP_ECOMMERCE + '/api/orders/' + folio + '/tracking')
        order[0]['orderStatus'] = JSON.parse(responseWebService.body) || [{ current: '1' }]
        order[0]['orderDetail'] = await db.query('SELECT `productCode`, `productArticleCode`, `productDescription`, `quantity`, `size`, `unitPrice`, `saved` FROM `OrderDetail` WHERE orderId = ? AND status = 1;', [order[0].id])
      }
    } catch (err) {
      await db.close()
      throw err
    }

    await db.close()
    return response
  }


  ///////////////////// CHECAR ALLI /////////////////////////////////////////////////////////
  Order.getStores = async (req, store) => {
    let response = {}
    let user = req.headers.user
    let db = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })
    try {
      let productInformation = await db.query('SELECT od.id, od.productCode AS code, od.productArticleCode, od.size, od.quantity \
      FROM `Order` AS o\
      LEFT JOIN OrderDetail AS od ON od.orderId = o.id\
      WHERE o.order = ?;', [store])
      if (productInformation.length > 0) {
        productInformation.forEach(product => {
          product.size = Number(product.size)
          product.stock = { status: true }
        })
        console.time('Locations')
        let stores = await Utils.request({
          method: 'POST',
          url: configs.HOST_IP_ECOMMERCE + ':' + configs.PORT_IP_ECOMMERCE + '/api/products/locations',
          json: true,
          body: {
            data: {
              deliveryZip: '80000',
              products: productInformation
            }
          }
        })
        console.timeEnd('Locations')

        if (stores !== null && stores !== undefined && stores.body !== null && stores.body !== undefined && stores.body[0].isLocal) {
          await Utils.asyncForEach(stores.body[0].locations, async (store) => {
            let storeResponse = await Utils.mongoFind('Store', { 'code': store.branch })
            store.name = storeResponse[0].name
          })
          stores.body[0].locations = await Utils.orderBy(stores.body[0].locations, 'branch', 'asc')
          response = stores.body[0].locations
        }
      }
    } catch (err) {
      await db.close()
      throw err
    }
    await db.close()
    return response
  }


  ///////////////////// CHECAR ALLI /////////////////////////////////////////////////////////


  Order.updateStore = async (req, data) => {
    let response = { updated: false }
    let user = req.headers.user

    let db = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })

    try {
      let calzzamovilDetail = await db.query('SELECT cd.*, o.id AS orderId\
      FROM CalzzamovilDetail AS cd\
      LEFT JOIN OrderDetail AS od ON od.id = cd.orderDetailId\
      LEFT JOIN `Order` AS o ON o.id = od.orderId\
      WHERE o.order = ? LIMIT 1;', [data.order])

      if (calzzamovilDetail.length > 0) {

        let changeStore = await Utils.request({
          method: 'POST',
          url: configs.HOST_IP_ECOMMERCE + ':' + configs.PORT_IP_ECOMMERCE + '/api/orders/store',
          json: true,
          body: {
            order: calzzamovilDetail[0].orderId,
            type: 3,
            store: data.storeId
          }
        })
        console.log('WebService SYNC Ecommerce', changeStore.body)
        if (changeStore !== null && changeStore !== undefined && changeStore.body !== null && changeStore.body !== undefined && changeStore.body.sync) {
          await db.query('UPDATE CalzzamovilDetail SET storeId = ? WHERE id = ?;', [data.storeId, calzzamovilDetail[0].id])
          await db.query('UPDATE Calzzamovil SET pipelineId = 2 WHERE id = ?;', [calzzamovilDetail[0].calzzamovilId])
          response.updated = true
        }
      }
    } catch (err) {
      await db.close()
      throw err
    }
    await db.close()
    return response
  }

  Order.remoteMethod('getOrders', {
    description: 'Get all orders',
    http: {
      path: '/all',
      verb: 'GET'
    },
    accepts: [
      { arg: 'filter', type: 'object', http: { source: 'body' } },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req; } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.remoteMethod('createOrder', {
    description: 'Create order',
    http: {
      path: '/create',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true },
      { arg: 'res', type: 'object', http: ctx => { return ctx.res; } },
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.remoteMethod('userOrder', {
    description: 'Create order',
    http: {
      path: '/order/:userId',
      verb: 'GET'
    },
    accepts: [
      { arg: 'userId', type: 'string', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.remoteMethod('orderAddress', {
    description: 'Receives a token and returns the full address',
    http: {
      path: '/orderAddress',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.remoteMethod('getOrderByFolio', {
    description: 'Receives a token and returns the full address',
    http: {
      path: '/:token/entity',
      verb: 'GET'
    },
    accepts: [
      { arg: 'token', type: 'string', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.getDealerOrders = async (req) => {
    let response = []
    let instanceId = req.headers.instanceId
    let user = req.headers.user

    let db = await Utils.connectToDB()

    let dbEcommerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })

    try {
      let filterDate = ''
      filterDate = ' o.dealerId = 3 AND '
      // 'AND month(shoppingDate) = 4 AND year(shoppingDate) = 2020'

      let orders = await dbEcommerce.query('SELECT o.id, o.shoppingDate, o.order, o.calzzapatoCode, TRIM(CONCAT(u.name, " ", u.firstLastName, " ", u.secondLastName)) AS fullName, u.email, u.cellphone, u.phone, o.discount, o.shippingCost, o.subtotal, o.total, o.pipeline, p.name AS pipelineName, o.paymentMethodId, o.shippingMethodId, pm.name AS paymentMethod, sm.name AS shippingMethod, o.createdAt, o.updatedAt FROM `Order` AS o LEFT JOIN Pipeline AS p ON p.id = o.pipeline LEFT JOIN User AS u ON u.id = o.userId LEFT JOIN PaymentMethod AS pm ON pm.id = o.paymentMethodId LEFT JOIN ShippingMethod AS sm ON sm.id = o.shippingMethodId WHERE ' + filterDate + ' o.status = 1 ORDER BY updatedAt DESC;')
      let addresses = []
      let photos = []

      await Utils.asyncForEach(orders, async (order) => {
        /*
        let assignments = await db.query('SELECT u.id, TRIM(CONCAT(u.name, " ", u.firstLastName, " ", u.secondLastName)) AS fullName, u.email FROM Assignment AS a LEFT JOIN User AS u ON u.id = a.userId WHERE a.status = 1 AND u.status = 1 AND a.orderId = ?', [
          order.id
        ])

        order.assigned = assignments[0]
        */

        if (order.paymentMethodId === 1) {
          order.paymentMethod = 'BBVA'
        } else if (order.paymentMethodId === 2) {
          order.paymentMethod = 'CREDIVALE'
        } else if (order.paymentMethodId === 3) {
          order.paymentMethod = 'OXXO'
          if (order.calzzapatoCode !== null) {
            order.pipelineName = 'ORDEN PAGADA'
          }
        } else if (order.paymentMethodId === 4) {
          order.paymentMethod = 'PAYPAL'
        } else if (order.paymentMethodId === 5) {
          order.paymentMethod = 'NETPAY'
        }

        addresses = await dbEcommerce.query('select sa.name AS name, sa.phone, sa.reference, a.zip, s.name AS stateName, m.name AS municipalityName, lt.name AS locationTypeName, l.name AS locationName, a.street, a.exteriorNumber, a.interiorNumber, a.betweenStreets FROM `Order` AS o LEFT JOIN ShippingAddress AS sa ON sa.id = o.shippingAddressId LEFT JOIN Address AS a ON a.id = sa.addressId LEFT JOIN Location AS l ON l.locationMunicipalityStateCode = a.locationCode LEFT JOIN Municipality AS m ON m.municipalityStateCode = l.municipalityStateCode LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode LEFT JOIN State AS s ON s.code = m.stateCode where o.id = ? AND o.status = 1 AND a.status = 1 AND sa.status = 1;', [
          order.id
        ])

        order.address = addresses[0]

        order.detail = await dbEcommerce.query('select od.productCode, od.productArticleCode, od.productDescription, od.quantity, od.size, od.unitPrice FROM `Order` AS o LEFT JOIN OrderDetail AS od ON o.id = od.orderId LEFT JOIN User AS u ON u.id = o.userId LEFT JOIN ShippingAddress AS sa ON sa.id = o.shippingAddressId LEFT JOIN Address AS a ON a.id = sa.addressId LEFT JOIN Location AS l ON l.locationMunicipalityStateCode = a.locationCode LEFT JOIN Municipality AS m ON m.municipalityStateCode = l.municipalityStateCode LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode LEFT JOIN State AS s ON s.code = m.stateCode where od.status = 1 AND od.orderId = ?', [
          order.id
        ])

        order.detail.forEach(async (detail, idx) => {
          photos = await dbOld.query('select nombre_fotografia AS image FROM fotografias WHERE angulo = 1 AND lote = ? limit 1;', [
            detail.productCode
          ])
          order.detail[idx].image = photos[0].image
        })
      })

      response = orders
    } catch (err) {
      console.log(err)
    }

    await db.close()
    await dbEcommerce.close()

    return response
  }

  Order.remoteMethod('getDealerOrders', {
    description: 'Get all dealers orders',
    http: {
      path: '/dealer',
      verb: 'GET'
    },
    accepts: [
      //{ arg: 'filter', type: 'object', http: { source: 'body' } },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req; } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.remoteMethod('orderDetail', {
    description: 'Get orders by user',
    http: {
      path: '/:folio',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'folio', type: 'string', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.remoteMethod('getStores', {
    description: 'Get stores where the product are.',
    http: {
      path: '/stores/:store',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'store', type: 'string', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.remoteMethod('updateStore', {
    description: 'Change the store from calzzamovilDetail.',
    http: {
      path: '/calzzamovil/store',
      verb: 'PATCH'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })


 
}