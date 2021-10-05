'use strict'

const Utils = require('../Utils.js')
const conekta = require('../classes/conekta.js')
const openpay = require('../classes/openpay.js')
const mercadopago = require('../classes/mercadopago.js')
const paypal = require('../classes/paypal.js')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')
const pdf = require('html-pdf')
const convert = require('xml-js')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')
const Calzzamovil = require('../classes/calzzamovil.js')
const mysql = require('../classes/mysql.js')
const mongodb = require('../classes/mongodb.js')
const netpay = require('../classes/netpay')
const calzzamovil = require('../classes/calzzamovil.js')
let CDN = require('../classes/cdn.js')
const uuid = require('uuid')
const tracking = require('../classes/trackingDetail')
const mailTrackingClasses = require('../classes/trackingMail')


module.exports = (Order) => {
  const RECHARGE_PRICE = 50

  // Métodos de pago disponibles
  const BBVA_PAY = 1
  const CREDIVALE_PAY = 2
  const OXXO_PAY = 3
  const PAYPAL = 4
  const NETPAY = 5
  const MERCADOPAGO = 8
  const OPENPAY = 9
  const PAYNET = 10

  // Métodos de entrega disponibles
  const CALZZAPATO_DELIVERY = 1
  const ENVIA_DELIVERY = 2
  const CLICK_AND_COLLECT = 3
  const CALZZAMOVIL = 4

  // Mensajes de errores controlados
  let messagesError = {
    invalidUser: {
      code: '00001',
      message: 'Ocurrió un problema. Por favor, inicia sesión de nuevo.'
    },
    invalidShippingAddress: {
      code: '00002',
      message: 'Ocurrió un problema. Por favor, intenta con otra dirección de entrega.'
    },
    invalidShoppingCart: {
      code: '00003',
      message: 'Ocurrió un problema al validar el carrito de compra. Por favor, intenta de nuevo más tarde.'
    },
    thereIsNotStock: {
      code: '00004',
      message: 'Problemas de existencias. Por favor, revisa tu carrito de compra.'
    },
    invalidPaymentMethod: {
      code: '00005',
      message: 'Ocurrió un problema con el método de pago seleccionado. Por favor, elige otro método de pago o inténta de nuevo más tarde.'
    },
    invalidCrediVale: {
      code: '00006',
      message: 'Ocurrió un problema. CrediVale inválido. Por favor, intenta de nuevo con otro CrediVale.'
    },
    invalidCrediValeAmount: {
      code: '00007',
      message: 'El saldo del CrediVale es menor al monto de la compra. Por favor, intenta de nuevo con otro CrediVale.'
    },
    crediValeUsed: {
      code: '00008',
      message: 'El folio electrónico del CrediVale ® ya fue utilizado para realizar una compra. Por favor, comunícate con un asesor digital.'
    },
    invalidOxxoPayAmount: {
      code: '00009',
      message: 'No se pueden procesar compras mayores a $10,000.00 M.N. con el método de pago OXXO. Por favor, selecciona otro método de pago.'
    },
    invalidCard: {
      code: '00010',
      message: 'Ocurrió un problema. Por favor, ingresa o selecciona otra tarjeta e intenta de nuevo.'
    },
    errorToCreateOrder: {
      code: '00011',
      message: 'Ocurrió un problema al procesar tu pedido. Por favor, intenta de nuevo más tarde.'
    },
    errorToCreateOrderBancomer: {
      code: '00012',
      message: 'Ocurrió un problema al procesar tu pedido. Por favor, intenta de nuevo más tarde.'
    },
    errorToCreateOrderOXXO: {
      code: '00013',
      message: 'Ocurrió un problema. No se ha podido procesar el pedido con OXXO. Por favor, intenta de nuevo más tarde.'
    },
    errorToCreateOrderPayPal: {
      code: '00014',
      message: 'Ocurrió un problema. No se ha podido procesar el pedido con PayPal. Por favor, intenta de nuevo más tarde.'
    },
    errorCellphoneValidation: {
      code: '00015',
      message: 'Ocurrió un problema. Número celular sin validar. Por favor, intenta de nuevo más tarde.'
    },
    errorToCreateOrderNetPay: {
      code: '00016',
      message: 'Ocurrió un problema. Es necesario que te comuniques con tu banco e intentes de nuevo más tarde. También puedes utilizar nuestro método de pago con la plataforma de BBVA.'
    },
    errorStore: {
      code: '00017',
      message: 'Ocurrió un problema. La tienda seleccionada no está disponible en este momento.'
    },
    invalidCoupon: {
      code: '00018',
      message: 'Cupón no válido.'
    }
  }

  Order.createOrder = async (data, req) => {
    let DEVICE_TYPE = 1
    if (req.headers.device !== undefined) {
      // 1 web
      // 2 android
      // 3 ios
      DEVICE_TYPE = Number(req.headers.device)
    }
    // Inicialización de variables
    let calzzamovil = {
      status: false,
      orderId: null,
      zoneId: null,
      scheduledId: null
    }

    let fastShopping = false
    let orderId = null
    let lastOrderId = null
    let PAYMENT_WAY = null
    let instanceId = req.headers.instanceId
    let user = req.headers.user
    data.user = user
    let response = { created: false, paymentWay: null }

    let pipeline = {
      id: 1,
      description: 'ORDEN CREADA'
    }

    let responseAddress = []
    let storeAddress = null
    let shippingMethod = CALZZAPATO_DELIVERY

    if (data.shippingMethodSelected !== undefined) {
      shippingMethod = data.shippingMethodSelected
      if (shippingMethod === CLICK_AND_COLLECT && data.storeId !== undefined) {
        storeAddress = await Utils.loopbackFind(Order.app.models.Store, { where: { code: data.storeId } })
        if (storeAddress.length !== 1) {
          throw messagesError.errorStore
        } else {
          storeAddress = storeAddress[0]
        }
      }
    }

    // Conexión con bases de datos
    const db = mysql.connectToDBManually()

    try {
      await db.beginTransaction()

      // Obtener IP del usuario a través de metadata
      data.metadata = null
      if (req.headers.metadata !== undefined) {
        data.metadata = JSON.parse(req.headers.metadata)
      }

      // Se valida que el usuario esté activo en el momento de generar la orden
      let auth = await Utils.request({
        method: 'GET',
        json: true,
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/auth',
        headers: {
          uuid: req.headers.uuid,
          authorization: req.headers.authorization,
          metadata: req.headers.metadata
        },
      })

      if (auth.body === undefined) {
        throw messagesError.invalidUser
      } else {
        user = auth.body
        data.user = user
      }

      if (shippingMethod === CALZZAPATO_DELIVERY || shippingMethod === ENVIA_DELIVERY || shippingMethod === CALZZAMOVIL) {
        // Se valida que la dirección esté activa al momento de generar la orden
        responseAddress = await db.query('SELECT sa.id AS shippingAddressId, sa.*, a.*, l.name AS locationName, l.zone AS locationZone, m.name AS municipalityName, s.name AS stateName FROM ShippingAddress AS sa LEFT JOIN Address AS a ON sa.addressId = a.id LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode LEFT JOIN State AS s ON s.code = m.stateCode WHERE sa.userId = ? AND sa.id = ? AND sa.status = 1 AND a.status = 1 LIMIT 1;', [
          user.id,
          data.address.id
        ])

        if (responseAddress.length !== 1) {
          throw messagesError.invalidShippingAddress
        }
      }

      // Revisar checkout
      let dataCheckout = {
        shippingMethodSelected: shippingMethod,
        isCredit: data.isCredit,
        coupon: (data.checkout.coupon !== undefined && data.checkout.coupon !== null) ? data.checkout.coupon.name : ''
      }

      if (data.product !== undefined) {
        if (data.product !== null) {
          fastShopping = true
          dataCheckout.product = data.product
        }
      }

      dataCheckout.bluePoints = 0
      if (data.bluePoints !== undefined && data.bluePoints > 0 && user.calzzapatoUserId !== null && user.bluePoints !== null && user.bluePoints.balance >= data.bluePoints) {
        dataCheckout.bluePoints = data.bluePoints
      }

      let checkout = await Utils.request({
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/checkout',
        method: 'POST',
        json: true,
        body: {
          data: dataCheckout
        },
        headers: {
          uuid: req.headers.uuid,
          authorization: req.headers.authorization,
          metadata: req.headers.metadata,
          zip: (shippingMethod !== CLICK_AND_COLLECT) ? data.address.zip : ''
        }
      })

      if (checkout.body === undefined) {
        // Error al validar checkout
        throw messagesError.invalidShoppingCart
      }

      let products = []
      let productsMessage = ''
      // Validar carrito de compras
      if (data.checkout.cart.products.length !== checkout.body.cart.products.length) {
        let exist = false
        data.checkout.cart.products.forEach(product => {
          checkout.body.cart.products.forEach(item => {
            if (product.code === item.code && product.article === item.article && product.instance === item.instance && product.selection.quantity === item.selection.quantity && product.size === item.size) {
              exist = true
            }
          })
          if (!exist) {
            // Productos que ya no se encuentran disponibles o en existencia
            if (Utils.isEmpty(productsMessage)) {
              productsMessage = product.code
            } else {
              productsMessage += ', ' + product.code
            }
            products.push(product)
          }
          exist = false
        })
      }

      if (products.length !== 0) {
        if (products.length === 1) {
          productsMessage = ' el producto: ' + productsMessage
        } else {
          productsMessage = ' los productos: ' + productsMessage
        }
        messagesError.thereIsNotStock.message = 'Problema de existencia con ' + productsMessage + '.'

        throw messagesError.thereIsNotStock
      }

      checkout.body.paymentMethods.forEach(method => {
        if (method.id === data.paymentMethodSelected.id) {
          PAYMENT_WAY = data.paymentMethodSelected.id
        }
      })

      if (PAYMENT_WAY === null) {
        // Método de pago inválido
        throw messagesError.invalidPaymentMethod
      }

      // Reglas por método de pago
      if (PAYMENT_WAY === CREDIVALE_PAY && data.isCredit) {
        // Revisar si el CrediVale ya fue usado en otra compra
        let credivales = await db.query('SELECT * FROM PaymentCrediVale WHERE folio = ?;', [data.vale.folio])
        if (credivales.length > 0) {
          throw messagesError.crediValeUsed
        }
        // Revisar si el credivale ingresado es válido
        if (data.vale !== undefined) {
          let crediValeResponse = await Utils.request({
            method: 'POST',
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/credivales/validate',
            json: true,
            body: {
              data: {
                folio: data.vale.folio,
                amount: data.vale.amount
              }
            }
          })

          if (crediValeResponse.body !== undefined) {
            let message = crediValeResponse.body.message.substr(crediValeResponse.body.message.length - 15, crediValeResponse.body.message.length)
            if (message !== 'SI son válidos.') {
              throw messagesError.invalidCrediVale
            } else {
              if (data.checkout.prices.total > Number(data.vale.amount)) {
                // Validar el monto a pagar con el credivale
                throw messagesError.invalidCrediValeAmount
              }
            }
          } else {
            throw messagesError.invalidCrediVale
          }
        }
      } else if (PAYMENT_WAY === OXXO_PAY) {
        // Revisar que el monto a pagar sea válido. Hasta $10,000.00 M.N.
        if (data.checkout.prices.total > 10000) {
          throw messagesError.invalidOxxoPayAmount
        }
      } else if (PAYMENT_WAY === NETPAY) {
        // Revisar si la tarjeta seleccionada es válida
        if (data.card === undefined || data.card === null) {
          // Tarjeta indefinida
          throw messagesError.invalidCard
        }
      } else if (PAYMENT_WAY === OPENPAY) {
        // Revisar si la tarjeta seleccionada es válida
        if (data.card === undefined || data.card === null) {
          // Tarjeta indefinida
          throw messagesError.invalidCard
        }
      }

      // Actualizar checkout y carrito de compras
      data.checkout = checkout.body

      // Empezar a crear el encabezado de la orden
      let userId = user.id
      let userName = (user.name + " " + user.firstLastName + " " + user.secondLastName).trim()
      let userEmail = user.email
      if (shippingMethod === CLICK_AND_COLLECT) {
        responseAddress = {
          shippingAddressId: null
        }
      } else {
        responseAddress = responseAddress[0]
      }

      let phoneNumber = user.phone

      if (!Utils.isEmpty(user.cellphone)) {
        phoneNumber = user.cellphone
      }

      let order = Date.now() // Math.floor(10000000 + Math.random() * 90000000)
      let reference = Math.floor(100000 + Math.random() * 900000) + "" + Math.floor(100000 + Math.random() * 900000) + "" + Math.floor(100000 + Math.random() * 900000) + "" + Math.floor(Math.random() * 10)

      let responseCreateOrder = await db.query('INSERT INTO `Order` (`instanceId`, `deviceTypeId`, `order`, `reference`, `userId`, `shippingMethodId`, `shippingAddressId`, `clickAndCollectStoreId`, `discount`, `shippingCost`, `saved`, `subtotal`, `recharge`, `total`, `pointsExchange`, `pointsWin`, `paymentMethodId`, `fastShopping`, `couponId`, `pipeline`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [
        instanceId,
        DEVICE_TYPE,
        order,
        reference,
        userId,
        data.checkout.shippingMethod.id,
        responseAddress.shippingAddressId,
        (data.storeId !== undefined && data.storeId !== null) ? data.storeId : null,
        data.checkout.prices.discount,
        data.checkout.shippingMethod.cost,
        data.checkout.prices.saved,
        data.checkout.prices.subtotal,
        data.checkout.prices.recharge,
        data.checkout.prices.total,
        data.checkout.bluePoints.exchange,
        data.checkout.bluePoints.win,
        PAYMENT_WAY,
        fastShopping,
        (data.checkout.coupon !== null) ? data.checkout.coupon.id : null,
        pipeline.id
      ])

      orderId = responseCreateOrder.insertId

      if (data.expressDelivery !== undefined && data.expressDelivery) {
        let calzzamovilResponse = await Calzzamovil.checkExpressDelivery(db, orderId, responseAddress.addressId, PAYMENT_WAY)

        if (calzzamovilResponse.status) {
          calzzamovil = {
            status: calzzamovilResponse.status,
            orderId: orderId,
            zoneId: calzzamovilResponse.zoneId,
            scheduledId: calzzamovilResponse.scheduledId,
            cityId: calzzamovilResponse.cityId
          }
        } else {
          throw calzzamovilResponse.message
        }
      }

      // Obtener última orden del usuario
      let users = await db.query('SELECT `lastOrderId` FROM `User` WHERE id = ? AND `status` = 1 LIMIT 1;', [
        userId
      ])
      lastOrderId = users[0].lastOrderId

      // Deshabilitar la última orden del usuario
      if (lastOrderId !== null) {
        await db.query('UPDATE `Order` SET `status` = 2 WHERE `id` = ?', [lastOrderId])
        await db.query('UPDATE `OrderDetail` SET `status` = 2 WHERE `orderId` = ?', [lastOrderId])
        await db.query('UPDATE `PaymentNetPay` SET `status` = 2 WHERE `orderId` = ?', [lastOrderId])
        await db.query('UPDATE `PaymentBBVA` SET `status` = 2 WHERE `orderId` = ?', [lastOrderId])
        await db.query('UPDATE `PaymentCrediVale` SET `status` = 2 WHERE `orderId` = ?', [lastOrderId])
        await db.query('UPDATE `PaymentOXXO` SET `status` = 2 WHERE `orderId` = ?', [lastOrderId])
        await db.query('UPDATE `PaymentPayPal` SET `status` = 2 WHERE `orderId` = ?', [lastOrderId])
        await db.query('UPDATE `PaymentMercadoPago` SET `status` = 2 WHERE `orderId` = ?', [lastOrderId])
        await db.query('UPDATE `PaymentOpenPay` SET `status` = 2 WHERE `orderId` = ?', [lastOrderId])
        await db.query('UPDATE `PaymentPaynet` SET `status` = 2 WHERE `orderId` = ?', [lastOrderId])
      }

      // Nueva última orden del usuario
      await db.query('UPDATE `User` SET `lastOrderId` = ? WHERE `id` = ?;', [responseCreateOrder.insertId, userId])

      let price = 0
      let discountPrice = 0
      let subtotal = 0

      // Validación puntos azules
      let bluePointsExchange = data.checkout.bluePoints.exchange
      if (data.checkout.bluePoints.conditions.exchange && bluePointsExchange > 0) {
        if (user.bluePoints !== undefined && user.bluePoints !== null) {
          if (user.bluePoints.balance < bluePointsExchange) {
            throw 'No cuentas con suficientes puntos azules.'
          }
        } else {
          throw 'No tienes Monedero Azul ® activo. Más información en https://www.monederoazul.com'
        }
      }

      await Utils.asyncForEach(data.checkout.cart.products, async (item) => {
        if (data.isCredit) {
          price = item.creditPrice
          discountPrice = item.creditPrice
          subtotal = (item.selection.quantity * item.creditPrice)
        } else {
          price = item.price
          discountPrice = item.discountPrice
          if (discountPrice > 0) {
            subtotal = (item.selection.quantity * item.discountPrice)
          } else {
            subtotal = (item.selection.quantity * item.price)
          }
        }

        let localDelivery = 0
        if (item.location !== null) {
          if (item.location[0].isLocal) {
            if (item.selection.quantity <= item.location[0].available) {
              localDelivery = item.selection.quantity
            } else {
              localDelivery = item.location[0].available
            }
          }
        }

        // Porcentaje del item con la compra final
        let percentage = (subtotal / data.checkout.prices.subtotal)

        // Puntos se distribuyen entre todos los productos de manera proporcional a su valor
        let bluePointsExchangeItem = bluePointsExchange * percentage
        subtotal = subtotal - Number(bluePointsExchangeItem).toFixed(0)

        if (discountPrice > 0) {
          price = discountPrice
        }
        price = subtotal / item.selection.quantity

        let bluePointsCode = (item.bluePoints.status) ? item.bluePoints.code : ''

        await db.query('INSERT INTO OrderDetail (orderId, productCode, productArticleCode, productDescription, quantity, localDelivery, size, unitPrice, saved, subtotal, pointsCode, pointsExchange, pointsWin, pointsWinPercentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
          responseCreateOrder.insertId,
          item.selection.code,
          item.selection.article,
          item.name,
          item.selection.quantity,
          localDelivery,
          item.selection.size,
          price,
          (item.selection.quantity * item.savingPrice),
          subtotal,
          bluePointsCode,
          bluePointsExchangeItem,
          (item.selection.quantity * item.bluePoints.win),
          item.bluePoints.winPercentage
        ])
      })

      response.order = order

      // Revisar si la orden tiene una tarjeta personalizada de regalo
      if (data.giftCard !== undefined && data.giftCard !== null) {
        let giftCard = data.giftCard.data
        let cards = await db.query('SELECT * FROM GiftCard WHERE id = ? AND status = 1 LIMIT 1;', [
          giftCard.option.id
        ])
        if (cards.length > 0) {
          await db.query('INSERT INTO OrderGiftCard (orderId, giftCardId, `from`, `message`) VALUES (?, ?, ?, ?);', [
            orderId,
            cards[0].id,
            giftCard.from,
            giftCard.message
          ])
        }
      }
      // Preparar respuesta dependiendo el método de pago utilizado
      // CrediVale
      if (PAYMENT_WAY === CREDIVALE_PAY) {
        await db.query('INSERT INTO `PaymentCrediVale` (`orderId`, `folio`, `amount`, `orderAmount`, `folioIne`) VALUES (?, ?, ?, ?, ?);', [
          orderId,
          data.vale.folio,
          Number(data.vale.amount),
          data.checkout.prices.total,
          data.vale.ine
        ])

        ///////////////////////////

        // await db.query('UPDATE `Order` SET `pipeline` = 2, `paymentAttempts` = 1, `shoppingDate` = ?, `calzzapatoCode` = -1 WHERE `id` = ?', [
        //   new Date(),
        //   orderId
        // ])

        // await db.query('UPDATE `User` SET `lastOrderId` = null WHERE `id` = ?', [
        //   user.id
        // ])

        if (calzzamovil.status) {
          // Es entrega express
          let createCalzzamovil = await db.query('INSERT INTO Calzzamovil (orderId, zoneId, scheduledId, cityMunicipalityStateCode) VALUES (?, ?, ?, ?);', [
            calzzamovil.orderId,
            calzzamovil.zoneId,
            calzzamovil.scheduledId,
            calzzamovil.cityId
          ])
          Utils.sendNotification({ notificationType: 'NEW_ORDER', userRole: 'DEALERS', cityMunicipalityStateCode: calzzamovil.cityId })
        }

        response.credivale = data.vale
        await db.commit()

        await Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + orderId,
          method: 'POST'
        })
      } else if (PAYMENT_WAY === OXXO_PAY) {
        // Conekta OXXO PAY
        let expiredAt = Math.round(Date.now() / 1000 + 60 * 60 * 24 * 3)
        let oxxoPayCart = []
        data.checkout.cart.products.forEach((item) => {
          if (item.percentageDiscount > 0 || item.savingPrice > 0) {
            item.price = item.discountPrice
          }

          if (item.recharge) {
            item.price += RECHARGE_PRICE
          }

          oxxoPayCart.push({
            sku: item.selection.article,
            name: item.name,
            quantity: item.selection.quantity,
            unit_price: Math.floor(item.price.toFixed(2) * 100)
          })
        })

        let addressDescription = ''
        let shippingContact = null
        if (shippingMethod === CLICK_AND_COLLECT) {
          addressDescription = storeAddress.street + ' #' + storeAddress.exteriorNumber + '' + ((!Utils.isEmpty(storeAddress.interiorNumber)) ? ' - ' + storeAddress.interiorNumber : '') + ', ' + storeAddress.suburb
          shippingContact = {
            "phone": user.cellphone,
            "receiver": user.name,
            "address": {
              "street1": addressDescription.toUpperCase(),
              "city": storeAddress.zone.name.toUpperCase(),
              "state": Utils.isEmpty(storeAddress.state) ? storeAddress.zone.stateCode : storeAddress.state.toUpperCase(),
              "postal_code": storeAddress.zip,
              "country": "MX"
            }
          }
        } else {
          addressDescription = data.address.street + ' #' + data.address.exteriorNumber + '' + ((!Utils.isEmpty(data.address.interiorNumber)) ? ' - ' + data.address.interiorNumber : '') + ', ' + data.address.type + ' ' + data.address.location
          shippingContact = {
            "phone": data.address.phone,
            "receiver": data.address.name,
            "address": {
              "street1": addressDescription.toUpperCase(),
              "city": data.address.municipality.toUpperCase(),
              "state": data.address.state.toUpperCase(),
              "postal_code": data.address.zip,
              "country": "MX"
            }
          }
        }

        let discountLines = []
        if (data.checkout.coupon !== null) {
          discountLines = [{
            type: "coupon",
            code: data.checkout.coupon.name,
            amount: Math.floor(data.checkout.prices.discount.toFixed(2) * 100)
          }]
        }

        if (data.checkout.bluePoints.conditions.exchange && data.checkout.bluePoints.exchange > 0) {
          discountLines.push({
            type: "loyalty",
            code: 'monederoazul',
            amount: Math.floor(data.checkout.bluePoints.exchange.toFixed(2) * 100)
          })
        }

        let dataOrder = {
          "line_items": oxxoPayCart,
          "discount_lines": discountLines,
          "shipping_lines": [{
            "amount": Math.floor(Number(data.checkout.shippingMethod.cost).toFixed(2) * 100),
            "carrier": 'ENVÍO ' + data.checkout.shippingMethod.name
          }],
          "currency": "MXN",
          "customer_info": {
            "name": userName,
            "email": userEmail,
            "phone": phoneNumber
          },
          "shipping_contact": shippingContact,
          "charges": [{
            "payment_method": {
              "type": "oxxo_cash",
              "expires_at": expiredAt
            }
          }]
        }

        let orderOxxoPay = await conekta.createConektaOrder(dataOrder)
        if (orderOxxoPay.success) {
          let orderOxxo = orderOxxoPay.order.toObject()
          await db.query('INSERT INTO PaymentOXXO (orderId, conektaOrderId, conektaReference, conektaBarcodeURL, conektaPaymentStatus, orderRequestJSON) VALUES (?, ?, ?, ?, ?, ?);', [
            orderId,
            orderOxxo.id,
            orderOxxo.charges.data[0].payment_method.reference,
            orderOxxo.charges.data[0].payment_method.barcode_url,
            orderOxxo.payment_status,
            JSON.stringify(orderOxxo)
          ])

          await db.commit()

          await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/' + orderId + '/reference',
            method: 'POST'
          })

          let referenceOXXO = orderOxxo.charges.data[0].payment_method.reference
          let barcode = orderOxxo.charges.data[0].payment_method.barcode_url
          referenceOXXO = referenceOXXO.substr(0, 4) + '-' + referenceOXXO.substr(4, 4) + '-' + referenceOXXO.substr(8, 4) + '-' + referenceOXXO.substr(12, 2)
          response.reference = referenceOXXO
          response.barcode = barcode
        } else {
          throw messagesError.errorToCreateOrderOXXO
        }
      } else if (PAYMENT_WAY === PAYPAL) {
        let payPalCart = []
        data.checkout.cart.products.forEach((item) => {
          if (item.percentageDiscount > 0 || item.savingPrice > 0) {
            item.price = item.discountPrice
          }

          if (item.recharge) {
            item.price += RECHARGE_PRICE
          }

          payPalCart.push({
            sku: item.selection.article,
            name: item.name,
            quantity: item.selection.quantity,
            unit_amount: {
              currency_code: 'MXN',
              value: item.price.toFixed(2)
            }
          })
        })

        let total = data.checkout.prices.total.toFixed(2)
        let subtotal = (data.checkout.prices.subtotal + data.checkout.prices.recharge)
        subtotal = subtotal.toFixed(2)

        let discount = data.checkout.prices.discount
        if (data.checkout.bluePoints.conditions.exchange && data.checkout.bluePoints.exchange > 0) {
          discount += data.checkout.bluePoints.exchange
        }
        discount.toFixed(2)

        let addressDescription = ''
        let shippingAddress = null
        if (shippingMethod === CLICK_AND_COLLECT) {
          addressDescription = storeAddress.street + ' #' + storeAddress.exteriorNumber + '' + ((!Utils.isEmpty(storeAddress.interiorNumber)) ? ' - ' + storeAddress.interiorNumber : '') + ', ' + storeAddress.suburb
          shippingAddress = {
            name: {
              full_name: user.name
            },
            address: {
              address_line_1: addressDescription.toUpperCase(),
              address_line_2: "",
              admin_area_2: storeAddress.zone.name.toUpperCase(),
              admin_area_1: Utils.isEmpty(storeAddress.state) ? storeAddress.zone.stateCode : storeAddress.state.toUpperCase(),
              postal_code: storeAddress.zip,
              country_code: "MX"
            }
          }
        } else {
          addressDescription = data.address.street + ' #' + data.address.exteriorNumber + '' + ((!Utils.isEmpty(data.address.interiorNumber)) ? ' - ' + data.address.interiorNumber : '') + ', ' + data.address.type + ' ' + data.address.location
          shippingAddress = {
            name: {
              full_name: data.address.name
            },
            address: {
              address_line_1: addressDescription.toUpperCase(),
              address_line_2: "",
              admin_area_2: data.address.municipality.toUpperCase(),
              admin_area_1: data.address.state.toUpperCase(),
              postal_code: data.address.zip,
              country_code: "MX"
            }
          }
        }

        let responsePayPal = await paypal.createPayPalOrder({
          intent: "CAPTURE",
          application_context: {
            shipping_preference: "SET_PROVIDED_ADDRESS",
            user_action: "PAY_NOW",
            landing_page: "LOGIN",
            return_url: configs.HOST + ':' + configs.PORT + '/api/payments/paypal',
            cancel_url: configs.HOST + ':' + configs.PORT + '/api/payments/paypal',
            brand_name: "GRUPO CALZAPATO S.A. DE C.V.",
            locale: "es-MX",
          },
          shipping_type: "SHIPPING",
          purchase_units: [{
            reference_id: response.order,
            shipping_method: data.checkout.shippingMethod.name,
            shipping: shippingAddress,
            amount: {
              value: total,
              currency_code: "MXN",
              breakdown: {
                item_total: {
                  value: subtotal,
                  currency_code: "MXN"
                },
                shipping: {
                  value: data.checkout.shippingMethod.cost.toFixed(2),
                  currency_code: "MXN"
                },
                discount: {
                  value: discount,
                  currency_code: "MXN"
                }
              }
            },
            items: payPalCart
          }]
        })

        if (responsePayPal.success) {
          response.paypal = responsePayPal.order.result

          await db.query('INSERT INTO PaymentPayPal (orderId, token, paypalPaymentStatus, requestJSON) VALUES (?, ?, ?, ?);', [
            orderId,
            responsePayPal.order.result.id,
            responsePayPal.order.result.status,
            JSON.stringify(responsePayPal.order)
          ])

          await db.commit()
        } else {
          throw messagesError.errorToCreateOrderPayPal
        }
      } else if (PAYMENT_WAY === NETPAY) {
        data.order = response.order

        if (shippingMethod === CLICK_AND_COLLECT) {
          data.address = {
            street: storeAddress.street,
            exteriorNumber: storeAddress.exteriorNumber,
            interiorNumber: storeAddress.interiorNumber,
            type: 'Colonia',
            location: storeAddress.suburb,
            zip: storeAddress.zip,
            street: storeAddress.street,
            municipality: storeAddress.zone.name,
            state: Utils.isEmpty(storeAddress.state) ? storeAddress.zone.stateCode : storeAddress.state
          }
        }

        let responseRiskManager = await netpay.riskManagerNetPay(data)

        console.log('Risk Manager NETPAY')
        console.log(responseRiskManager)

        if (responseRiskManager !== undefined) {
          if (responseRiskManager.status === 'CHARGEABLE') {
            let responseChargeAuth = await netpay.chargeAuthNetPay(responseRiskManager.transactionTokenId)

            console.log('Charge Auth NETPAY')
            console.log(responseChargeAuth)

            if (responseChargeAuth !== undefined) {
              if (responseChargeAuth.response.responseCode == '00') {
                await db.query("INSERT INTO PaymentNetPay (orderId, cardId, netpayResponseRiskManagerJSON, netpayResponseChargeAuthJSON, netpayStatus) VALUES (?, ?, ?, ?, ?);", [
                  orderId,
                  data.card.id,
                  JSON.stringify(responseRiskManager),
                  JSON.stringify(responseChargeAuth),
                  "DONE"
                ])

                await db.query('UPDATE `Order` SET `pipeline` = 2, `paymentAttempts` = 1, `shoppingDate` = ?, `calzzapatoCode` = -1 WHERE `id` = ?', [
                  new Date(),
                  orderId
                ])

                await db.query('UPDATE `User` SET `lastOrderId` = null WHERE `id` = ?', [
                  user.id
                ])

                if (calzzamovil.status) {
                  // Es entrega express
                  let createCalzzamovil = await db.query('INSERT INTO Calzzamovil (orderId, zoneId, scheduledId, cityMunicipalityStateCode) VALUES (?, ?, ?, ?);', [
                    calzzamovil.orderId,
                    calzzamovil.zoneId,
                    calzzamovil.scheduledId,
                    calzzamovil.cityId
                  ])
                  Utils.sendNotification({ notificationType: 'NEW_ORDER', userRole: 'DEALERS', cityMunicipalityStateCode: calzzamovil.cityId })
                  calzzamovil.id = createCalzzamovil.insertId
                }

                response.netpay = {
                  status: 'DONE',
                  detail: responseChargeAuth
                }

                await db.commit()

                await Utils.request({
                  url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + orderId,
                  method: 'POST'
                })
              } else {
                let message = messagesError.errorToCreateOrderNetPay.message
                if (responseChargeAuth.response.responseCode === '05') {
                  message = 'Ocurrió un problema. Es necesario que te comuniques con tu banco y valides que tu tarjeta puede hacer transacciones en línea.'
                } else if (responseChargeAuth.response.responseCode === '13' || responseChargeAuth.response.responseCode === '51') {
                  message = 'Ocurrió un problema. Es necesario que revise los fondos de tu tarjeta.'
                } else if (responseChargeAuth.response.responseCode === '14') {
                  message = 'Ocurrió un problema. Tarjeta inválida, intenta de nuevo con otra tarjeta.'
                } else if (responseChargeAuth.response.responseCode === '19' || responseChargeAuth.response.responseCode === '91' || responseChargeAuth.response.responseCode === '96') {
                  message = 'Ocurrió un problema. Fallo en la comunicación. Por favor, intenta de nuevo en un par de minutos.'
                } else if (responseChargeAuth.response.responseCode === '54') {
                  message = 'Ocurrió un problema. Tu tarjeta está vencida, intenta de nuevo con otra tarjeta.'
                }
                messagesError.errorToCreateOrderNetPay.message = message
                throw messagesError.errorToCreateOrderNetPay
              }
            } else {
              throw messagesError.errorToCreateOrderNetPay
            }
          } else if (responseRiskManager.status === 'REVIEW') {
            JSON.stringify(responseRiskManager)
            await db.query("INSERT INTO PaymentNetPay (orderId, cardId, netpayResponseRiskManagerJSON, netpayResponseChargeAuthJSON, netpayStatus) VALUES (?, ?, ?, ?, ?);", [
              orderId,
              data.card.id,
              JSON.stringify(responseRiskManager),
              null,
              "REVIEW"
            ])

            response.netpay = {
              status: 'REVIEW',
              url: responseRiskManager.threeDSecureResponse.authUrl + '?webHook=' + configs.HOST + ':' + configs.PORT + '/api/payments/netpay',
              detail: responseRiskManager
            }

            await db.commit()
          } else {

            throw messagesError.errorToCreateOrderNetPay
          }
        } else {
          throw messagesError.errorToCreateOrderNetPay
        }
      } else if (PAYMENT_WAY === MERCADOPAGO) {
        let coupon = false
        if (data.checkout.coupon) {
          coupon = true
        }

        let mercadoPagoCart = []
        data.checkout.cart.products.forEach((item) => {
          if (coupon) {
            if (Number(data.checkout.coupon.percentageDiscount)) {
              item.price = Number(item.price) * (1 - (Number(data.checkout.coupon.percentageDiscount) / 100))
            } else if (Number(data.checkout.coupon.priceDiscount)) {
              let percentage = (Number(item.price) * 100) / Number(data.checkout.prices.subtotal)
              item.price = Number(item.price) - (Number(data.checkout.coupon.priceDiscount) * (percentage / 100))
            }
          }
          if (item.recharge) {
            item.price += RECHARGE_PRICE
          }
          mercadoPagoCart.push({
            id: item.selection.article,
            title: item.name,
            //description: 'Inspired by the classic foldable art of origami',
            //category_id: 'fashion',
            quantity: item.selection.quantity,
            currency_id: 'MXN',
            unit_price: Number(item.price.toFixed(2))
          })
        })

        let payer = {
          name: data.user.name,
          surname: data.user.firstLastName + data.user.firstLastName || '',
          email: data.user.email,
          //date_created: "2015-06-02T12:58:41.425-04:00",
          phone: {
            area_code: "",
            number: Number(data.user.cellphone)
          },
          address: {
            zip_code: data.address.zip,
          }
        }
        let preference = {
          items: mercadoPagoCart,
          payer: payer,
          shippingMethodCost: Number(data.checkout.shippingMethod.cost),
          shippingMethod: 'ENVÍO ' + data.checkout.shippingMethod.name
          //"amount": Math.floor(Number(data.checkout.shippingMethod.cost).toFixed(2) * 100),
          //"carrier": 'ENVÍO ' + data.checkout.shippingMethod.name
        }
        // Revisar si hay cupón.
        if (data.checkout.coupon) {
          preference.couponAmount = data.checkout.prices.discount
          preference.couponCode = data.checkout.coupon.name

        }

        let responseMercadoPago = await mercadopago.createMercadoPagoOrder(preference)
        if (responseMercadoPago.success) {
          responseMercadoPago.mercadopago = responseMercadoPago.order.result
          response.url = responseMercadoPago.order.body.init_point

          await db.query('INSERT INTO PaymentMercadoPago (orderId, token, mercadopagoPaymentStatus, requestJSON) VALUES (?, ?, ?, ?);', [
            orderId,
            responseMercadoPago.order.body.id,
            responseMercadoPago.order.status,
            JSON.stringify(responseMercadoPago.order)
          ])

          await db.commit()
        } else {
          throw messagesError.errorToCreateOrderPayPal
        }
      } else if (PAYMENT_WAY === PAYNET) {

        let dataPaynet = {
          email: data.user.email,
          name: data.user.name + ' ' + data.user.firstLastName + ' ' + data.user.secondLastName,
          total: Number.parseFloat(data.checkout.prices.total).toFixed(3),
          orderId: orderId
        }
        let responsePaynet = await openpay.createPaynetOrder(dataPaynet)
        if (responsePaynet.success) {
          openpay.sendEmail({ amount: dataPaynet.total, email: dataPaynet.email, name: dataPaynet.name, ticket: responsePaynet.order.ticket, reference: responsePaynet.order.payment_method.reference, barcode: responsePaynet.order.payment_method.barcode_url })
          await db.query('INSERT INTO PaymentPaynet (orderId, paynetId, paynetStatus, paynetCustomer, ticket, requestJSON) VALUES (?, ?, ?, ?, ?, ?);', [
            orderId,
            responsePaynet.order.id,
            responsePaynet.order.status,
            responsePaynet.order.customer_id,
            responsePaynet.order.ticket,
            JSON.stringify(responsePaynet.order)
          ])
          await db.commit()
          response.ticket = responsePaynet.order.ticket

        } else {
          throw messagesError.errorToCreateOrderPayPal
        }
      } else if (PAYMENT_WAY === OPENPAY) {
        data.order = response.order

        if (shippingMethod === CLICK_AND_COLLECT) {
          data.address = {
            street: storeAddress.street,
            exteriorNumber: storeAddress.exteriorNumber,
            interiorNumber: storeAddress.interiorNumber,
            type: 'Colonia',
            location: storeAddress.suburb,
            zip: storeAddress.zip,
            street: storeAddress.street,
            municipality: storeAddress.zone.name,
            state: Utils.isEmpty(storeAddress.state) ? storeAddress.zone.stateCode : storeAddress.state
          }
        }
        let responseOpenpay = null
        let card = await db.query('SELECT * FROM PaymentOpenPay WHERE cardId = ? AND openpayStatus = ?;', [data.card.id, 'completed'])
        let secureCode = true
        if (card.length > 0) {
          secureCode = false
        }
        let dataOpenpay = {
          tokenCard: data.card.token.id,
          name: req.headers.user.name,
          firstLastName: req.headers.user.firstLastName,
          secondLastName: req.headers.user.secondLastName,
          cellphone: req.headers.user.cellphone,
          email: req.headers.user.email,
          deviceId: data.deviceId,
          amount: Number.parseFloat(data.checkout.prices.total).toFixed(3),
          orderId: orderId,
          secureCode: secureCode

        }
        // Validar card para 3D Secure.

        responseOpenpay = await openpay.createOpenpayOrder(dataOpenpay)
        console.log('RESPONSE responseOpenpay', responseOpenpay)

        if (responseOpenpay.success) {
          if (responseOpenpay.response !== undefined && responseOpenpay.response.status === 'completed') {
            await db.query("INSERT INTO PaymentOpenPay (orderId, cardId, JSONresponse, openpayStatus) VALUES (?, ?, ?, ?);", [
              orderId,
              data.card.id,
              JSON.stringify(responseOpenpay.response),
              "completed"
            ])

            await db.query('UPDATE `Order` SET `pipeline` = 2, `paymentAttempts` = 1, `shoppingDate` = ?, `calzzapatoCode` = -1 WHERE `id` = ?', [
              new Date(),
              orderId
            ])

            await db.query('UPDATE `User` SET `lastOrderId` = null WHERE `id` = ?', [
              user.id
            ])

            await db.commit()

            await Utils.request({
              url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + orderId,
              method: 'POST'
            })

          } else {

            await db.query("INSERT INTO PaymentOpenPay (orderId, cardId, JSONresponse, openpayStatus, paymentId) VALUES (?, ?, ?, ?, ?);", [
              orderId,
              data.card.id,
              JSON.stringify(responseOpenpay.response),
              "charge_pending",
              responseOpenpay.response.id
            ])
            response.url = responseOpenpay.response.payment_method.url
            await db.commit()
          }

        }


      } else {
        let hmac = crypto.createHmac('sha256', configs.bancomerPrivateKey)
        hmac.update(response.order + reference.toString() + data.checkout.prices.total.toFixed(2).toString())
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
            mp_amount: data.checkout.prices.total.toFixed(2).toString(),
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
          throw messagesError.errorToCreateOrderBancomer
        }
        else {
          response.body = responseWebServiceBancomer.body
          await db.commit()
        }
      }
    } catch (err) {
      console.log('error order', err)
      response.error = err
      await db.rollback()
    }

    await db.close()

    if (response.error) {

      response.error.paymentWay = PAYMENT_WAY

      // await Utils.request({
      //   url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/order-logs/add',
      //   method: 'POST',
      //   json: true,
      //   body: {
      //     action: { action: 'BUY' },
      //     paymentStatus: 'failure',
      //     cart: !fastShopping,
      //     success: false,
      //     orderId: orderId,
      //     response: response.error
      //   },
      //   headers: {
      //     uuid: req.headers.uuid,
      //     authorization: req.headers.authorization
      //   }
      // })

      await Utils.request({
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
        method: 'POST',
        json: true,
        body: {
          status: 'TRY_BUY',
          order: data.checkout,
          response: response.error
        },
        headers: {
          uuid: req.headers.uuid,
          authorization: req.headers.authorization
        }
      })


    }

    if (PAYMENT_WAY === CREDIVALE_PAY) {
      if (!response.error) {
        let token = jwt.sign(response.order, configs.jwtPrivateKey)
        response.created = true
        response.paymentWay = PAYMENT_WAY
        response.order = token

        await Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
          method: 'POST',
          json: true,
          body: {
            status: 'BUY',
            order: orderId,
            response: response
          },
          headers: {
            uuid: req.headers.uuid,
            authorization: req.headers.authorization
          }
        })

        return response
      }
      else {
        throw response.error
      }
    } else if (PAYMENT_WAY === OXXO_PAY) {
      if (!response.error) {
        let token = jwt.sign(response.order, configs.jwtPrivateKey)
        response.created = true
        response.paymentWay = PAYMENT_WAY
        response.order = token
        return response
      }
      else {
        throw response.error
      }
    } else if (PAYMENT_WAY === PAYPAL) {
      if (!response.error) {
        let token = jwt.sign(response.order, configs.jwtPrivateKey)
        response.created = true
        response.paymentWay = PAYMENT_WAY
        response.order = token
        return response
      }
      else {
        throw response.error
      }
    } else if (PAYMENT_WAY === MERCADOPAGO) {
      if (!response.error) {
        let token = jwt.sign(response.order, configs.jwtPrivateKey)
        response.created = true
        response.paymentWay = PAYMENT_WAY
        response.order = token
        //response.url = response.body.init_point
        return response
      }
      else {
        throw response.error
      }
    } else if (PAYMENT_WAY === PAYNET) {
      if (!response.error) {
        let token = jwt.sign(response.order, configs.jwtPrivateKey)
        response.created = true
        response.paymentWay = PAYMENT_WAY
        response.order = token
        return response
      }
      else {
        throw response.error
      }
    } else if (PAYMENT_WAY === NETPAY) {
      if (!response.error) {
        let token = jwt.sign(response.order, configs.jwtPrivateKey)
        response.created = true
        response.paymentWay = NETPAY
        response.order = token

        if (response.netpay.status === 'DONE') {

          await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
            method: 'POST',
            json: true,
            body: {
              status: 'BUY',
              order: orderId,
              response: response
            },
            headers: {
              uuid: req.headers.uuid,
              authorization: req.headers.authorization
            }
          })

        }

        return response
      }
      else {
        throw response.error
      }

    } else if (PAYMENT_WAY === OPENPAY) {
      if (!response.error) {
        let token = jwt.sign(response.order, configs.jwtPrivateKey)
        response.created = true
        response.paymentWay = OPENPAY
        response.order = token

        await Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
          method: 'POST',
          json: true,
          body: {
            status: 'BUY',
            order: orderId,
            response: response
          },
          headers: {
            uuid: req.headers.uuid,
            authorization: req.headers.authorization
          }
        })
        return response
      }
      else {
        throw response.error
      }

    } else {
      if (!response.error) {
        let token = jwt.sign(response.order, configs.jwtPrivateKey)
        response.created = true
        response.paymentWay = PAYMENT_WAY
        response.order = token
        return response
      }
      else {
        throw response.error
      }
    }
  }

  Order.remoteMethod('createOrder', {
    description: 'Create order',
    http: {
      path: '/create',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.sendOrderEmail = async (orderId) => {
    // Conexión con bases de datos
    let response = { sent: false }

    const mdb = mongodb.getConnection('db')
    const db = mysql.connectToDBManually()

    try {
      let emailResponseOrder = await db.query('SELECT * FROM `Order` WHERE `id` = ? AND `status` = 1 AND calzzapatoCode IS NOT NULL;', [orderId])
      let emailResponseUser = await db.query('SELECT * FROM `User` AS u LEFT JOIN `Order` AS o ON u.id = o.userId WHERE o.id = ? AND o.status = 1;', [orderId])
      let emailResponseOrderDetail = await db.query('SELECT * FROM OrderDetail WHERE orderId = ? AND status = 1;', [orderId])
      let emailResponseShippingMethod = await db.query('SELECT * FROM ShippingMethod WHERE id = ? AND status = 1 LIMIT 1;', [emailResponseOrder[0].shippingMethodId])
      let shippingAddress = {
        "street": "",
        "exteriorNumber": "",
        "interiorNumber": "",
        "location": "",
        "type": "",
        "zip": "",
        "municipality": "",
        "state": ""
      }
      let emailResponseShippingAddress = null
      if (emailResponseOrder[0].shippingAddressId !== null) {
        emailResponseShippingAddress = await db.query('SELECT a.street,a.exteriorNumber,a.interiorNumber,a.zip, s.name AS stateName, m.name AS municipalityName,lt.name AS locationTypeName, l.name AS locationName FROM `ShippingAddress` AS sa INNER JOIN `Address` AS a ON sa.addressId=a.id INNER JOIN State AS s ON a.stateCode = s.id INNER JOIN Municipality AS m ON a.municipalityCode=m.municipalityStateCode INNER JOIN Location AS l ON a.locationCode=l.locationMunicipalityStateCode INNER JOIN LocationType AS lt ON l.locationTypeCode=lt.code WHERE sa.id="?" ;', [emailResponseOrder[0].shippingAddressId])
        shippingAddress = {
          "street": emailResponseShippingAddress[0].street,
          "exteriorNumber": emailResponseShippingAddress[0].exteriorNumber,
          "interiorNumber": emailResponseShippingAddress[0].interiorNumber,
          "location": emailResponseShippingAddress[0].locationTypeName + ' ' + emailResponseShippingAddress[0].locationName,
          "type": '',
          "zip": emailResponseShippingAddress[0].zip,
          "municipality": emailResponseShippingAddress[0].municipalityName,
          "state": emailResponseShippingAddress[0].stateName,
        }
      } else {
        // Click & Collect
        if (emailResponseOrder[0].shippingMethodId === 3) {
          let storeAddress = await Utils.loopbackFind(Order.app.models.Store, { where: { code: emailResponseOrder[0].clickAndCollectStoreId } })
          if (storeAddress.length > 0) {
            storeAddress = storeAddress[0]
            shippingAddress = {
              "street": storeAddress.street,
              "exteriorNumber": storeAddress.exteriorNumber,
              "interiorNumber": storeAddress.interiorNumber,
              "location": storeAddress.suburb,
              "type": '',
              "zip": storeAddress.zip,
              "municipality": storeAddress.zone.name,
              "state": Utils.isEmpty(storeAddress.state) ? storeAddress.zone.stateCode : storeAddress.state,
            }
          }
        } else {
          shippingAddress = {
            "street": emailResponseShippingAddress[0].street,
            "exteriorNumber": emailResponseShippingAddress[0].exteriorNumber,
            "interiorNumber": emailResponseShippingAddress[0].interiorNumber,
            "location": emailResponseShippingAddress[0].locationTypeName + ' ' + emailResponseShippingAddress[0].locationName,
            "type": '',
            "zip": emailResponseShippingAddress[0].zip,
            "municipality": emailResponseShippingAddress[0].municipalityName,
            "state": emailResponseShippingAddress[0].stateName,
          }
        }
      }
      let emailResponsePaymentMethod = await db.query('SELECT * FROM PaymentMethod WHERE id = ? AND status = 1 LIMIT 1;', [emailResponseOrder[0].paymentMethodId])
      let emailResponsePipeline = await db.query('SELECT * FROM Pipeline WHERE id = ? AND status = 1 LIMIT 1;', [emailResponseOrder[0].pipeline])

      await Utils.asyncForEach(emailResponseOrderDetail, async (detail, index) => {
        let photos = await mongodb.mongoFind(mdb, 'Product', {
          code: detail.productCode
        })

        let url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/"
        if (photos.length > 0) {
          if (photos[0].photos.length > 0) {
            url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/" + photos[0].photos[0].description
          }
        }

        emailResponseOrderDetail[index]["productImage"] = url
        emailResponseOrderDetail[index]["unitPrice"] = Utils.numberWithCommas(Number(emailResponseOrderDetail[index]["unitPrice"]).toFixed(2))
      })

      let userName = (emailResponseUser[0].name + " " + emailResponseUser[0].firstLastName + " " + emailResponseUser[0].secondLastName).trim()
      let userEmail = emailResponseUser[0].email
      let phoneNumber = emailResponseUser[0].phone

      if (!Utils.isEmpty(emailResponseUser[0].cellphone)) {
        phoneNumber = emailResponseUser[0].cellphone
      }

      let subject = 'Tu pedido está en camino - Calzzapato.com 👠'
      let title = 'Hola ' + userName + ', tu pedido está en camino.'
      let crediValeInfo = ''
      let userInfo = ''

      if (Utils.isEmpty(phoneNumber)) {
        userInfo = userEmail
      } else {
        userInfo = userEmail + ' - ' + phoneNumber
      }

      let crediValeFolio = []
      if (emailResponseOrder[0].paymentMethodId === CREDIVALE_PAY) {
        crediValeFolio = await db.query('SELECT * FROM `PaymentCrediVale` WHERE `orderId` = ? AND `status` = 1;', [orderId])
      }

      if (emailResponseOrder[0].paymentMethodId === CREDIVALE_PAY) {
        subject = 'Tu pedido está siendo procesado - Calzzapato.com 👠'
        title = 'Hola ' + userName + ', tu pedido está siendo procesado.'
        crediValeInfo = 'Tu CrediVale ® utilizado: ' + crediValeFolio[0].folio + '. Un asesor se comunicará contigo para continuar con el proceso.'
      }

      let orderData = {
        "logo": {
          "url": "https://i.imgur.com/HcaXIcC.jpeg"
        },
        "hourglassIconUrl": configs.HOST_WEB_APP + '/' + 'hourglass-icon.png',
        "checkIconUrl": configs.HOST_WEB_APP + '/' + 'check-icon.png',
        "credivaleNumber": crediValeFolio[0].folio,
        "facebook": "https://i.imgur.com/WbUpJ3D.jpeg",
        "instagram": "https://i.imgur.com/mDzzAGi.jpeg",
        "whatsapp": "https://i.imgur.com/rBMgS23.jpeg",
        "youtube": "https://i.imgur.com/nVSzbQv.jpeg",
        "user": {
          "name": emailResponseUser.name,
          "firstLastName": emailResponseUser.firstLastName,
          "secondLastName": emailResponseUser.secondLastName,
        },
        "title": title,
        "userData": userInfo,
        "crediValeInfo": crediValeInfo,
        "order": {
          "order": emailResponseOrder[0].calzzapatoCode,
          "reference": emailResponseOrder[0].reference,
          "discount": Utils.numberWithCommas(Number(emailResponseOrder[0].discount).toFixed(2)),
          "shippingCost": Utils.numberWithCommas(Number(emailResponseOrder[0].shippingCost).toFixed(2)),
          "saved": Utils.numberWithCommas(Number(emailResponseOrder[0].saved).toFixed(2)),
          "subtotal": Utils.numberWithCommas(Number(emailResponseOrder[0].subtotal).toFixed(2)),
          "total": Utils.numberWithCommas(Number(emailResponseOrder[0].total).toFixed(2)),
          "shoppingDate": moment(emailResponseOrder[0].createdAt).locale('es').format("DD/MMMM/YYYY"),
          "shoppingDate2": moment(emailResponseOrder[0].createdAt).locale('es').add(8, 'days').format("DD/MMMM/YYYY"),
          "ShippingMethod": {
            "id": emailResponseShippingMethod[0].id,
            "name": emailResponseShippingMethod[0].name,
            "description": emailResponseShippingMethod[0].name,
            "calzzamovil": configs.HOST_WEB_APP + '/calzzamovil/' + emailResponseOrder[0].order
          },
          "OrderDetail": emailResponseOrderDetail,
          "OrderDetailCod": emailResponseOrderDetail[0].productCode,
          "PaymentMethod": {
            "name": emailResponsePaymentMethod[0].name,
            "description": emailResponsePaymentMethod[0].name,
          },

          "ShippingAddress": {
            "Address": shippingAddress
          },
          "Pipeline": {
            "name": emailResponsePipeline[0].name,
            "description": emailResponsePipeline[0].name
          }
        }
      }

      const filePath = path.join(__dirname, emailResponseOrder[0].paymentMethodId === CREDIVALE_PAY ? '../template/credivale-reference.hbs' : '../templates/new-order.hbs')
      const source = fs.readFileSync(filePath, 'utf-8')

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

      const template = handlebars.compile(source)

      await Utils.sendEmail({
        from: '"Calzzapato.com" <contacto@calzzapato.com>',
        to: userEmail,
        cco: 'contacto@calzzapato.com',
        subject: subject,
        template: template(orderData)
      })

      response.sent = true
    } catch (err) {
      console.log(err)
      response.error = err
    }

    await db.close()
    return response
  }

  Order.remoteMethod('sendOrderEmail', {
    description: 'Send order email',
    http: {
      path: '/:orderId/email',
      verb: 'POST'
    },
    accepts: [
      { arg: 'orderId', type: 'string', require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.sendPaymentReferenceEmail = async (orderId) => {
    const db = mysql.connectToDBManually()

    try {
      const filePath = path.join(__dirname, '../templates/oxxo-reference.hbs')
      const source = fs.readFileSync(filePath, 'utf-8')

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

      const template = handlebars.compile(source)

      let orders = await db.query('SELECT po.*, o.*, u.email AS email FROM PaymentOXXO AS po LEFT JOIN `Order` AS o ON po.orderId = o.id LEFT JOIN User AS u ON o.userId = u.id WHERE po.orderId = ? LIMIT 1;', [
        orderId
      ])

      let reference = orders[0].conektaReference
      let amount = Utils.numberWithCommas(Number(orders[0].total).toFixed(2))

      let date = new Date()

      let limitDate = new Date()

      limitDate.setDate(date.getDate() + 3)

      let day = limitDate.getDate()
      let month = limitDate.getMonth() + 1
      let year = limitDate.getFullYear()

      let data = {
        amount: amount,
        reference: reference.substr(0, 4) + '-' + reference.substr(4, 4) + '-' + reference.substr(8, 4) + '-' + reference.substr(12, 2),
        referenceWithoutFormat: reference,
        barcode: orders[0].conektaBarcodeURL,
        storeIconUrl: `${configs.HOST_WEB_APP}/store-icon.png`,
        limitDay: month < 10 ? `${day}/0${month}/${year}` : `${day}/${month}/${year}`
      }

      await Utils.sendEmail({
        from: '"Calzzapato.com" <contacto@calzzapato.com>',
        to: orders[0].email,
        cco: 'contacto@calzzapato.com',
        subject: 'Referencia de pago OXXO ® - Calzzapato.com 👠',
        template: template(data)
      })
    } catch (err) {
      console.log(err)
    }
    await db.close()
  }

  Order.remoteMethod('sendPaymentReferenceEmail', {
    description: 'Send payment reference email',
    http: {
      path: '/:orderId/reference',
      verb: 'POST'
    },
    accepts: [
      { arg: 'orderId', type: 'string', require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.getOrderByFolio = async (token) => {
    let orders = []
    let orderDetail = []
    let shippingAddress = []
    let folio = ''
    let paymentMethod = ''
    let crediValeFolio = null
    let referenceOXXO = null
    let barcodeOXXO = null
    let paynetTicket = null
    let items = []

    const db = await mysql.connectToDBManually()
    try {
      folio = jwt.verify(token, configs.jwtPrivateKey)

      orders = await db.query('SELECT `id`, `order`, `shippingMethodId`, `shippingAddressId`, `clickAndCollectStoreId`, `paymentMethodId`, CAST(createdAt AS DATE) AS date, `calzzapatoCode`, `total`, `shippingCost` FROM `Order` WHERE `order`=? AND `status`= 1;', [folio])
      orderDetail = await db.query('SELECT SUM(quantity) AS count FROM `OrderDetail` WHERE `orderId`="?" AND `status`= 1;', [orders[0].id])

      if (orders[0].shippingAddressId !== null) {
        shippingAddress = await db.query('SELECT sa.name, sa.lastName, sa.phone, a.street, a.exteriorNumber, a.interiorNumber, a.zip, s.name AS state, m.name AS municipality,lt.name AS location, l.name AS suburb FROM `ShippingAddress` AS sa INNER JOIN `Address` AS a ON sa.addressId=a.id INNER JOIN State AS s ON a.stateCode = s.id INNER JOIN Municipality AS m ON a.municipalityCode=m.municipalityStateCode INNER JOIN Location AS l ON a.locationCode=l.locationMunicipalityStateCode INNER JOIN LocationType AS lt ON l.locationTypeCode=lt.code WHERE sa.id="?" ;', [orders[0].shippingAddressId])
      } else {
        let storeAddress = {
          name: '',
          lastName: '',
          phone: '',
          street: '',
          exteriorNumber: '',
          interiorNumber: '',
          zip: '',
          state: '',
          municipality: '',
          location: '',
          suburb: ''
        }

        shippingAddress = await Utils.loopbackFind(Order.app.models.Store, { where: { code: orders[0].clickAndCollectStoreId } })
        if (shippingAddress.length > 0) {
          shippingAddress = shippingAddress[0]
          storeAddress = {
            name: shippingAddress.name,
            lastName: shippingAddress.lastName,
            phone: shippingAddress.phone,
            street: shippingAddress.street,
            exteriorNumber: shippingAddress.exteriorNumber,
            interiorNumber: shippingAddress.interiorNumber,
            zip: shippingAddress.zip,
            state: Utils.isEmpty(shippingAddress.state) ? shippingAddress.zone.stateCode : shippingAddress.state,
            municipality: shippingAddress.zone.name,
            location: '',
            suburb: shippingAddress.suburb
          }
          shippingAddress = [storeAddress]
        }
      }

      let details = await db.query('SELECT * FROM `OrderDetail` WHERE orderId = ? AND status = 1;', [Number(orders[0].id)])
      await Utils.asyncForEach(details, async (detail) => {
        let item = await Utils.loopbackFind(Order.app.models.Product, { where: { code: detail.productCode }, include: ['gender', 'color', 'brand'] })
        item[0].quantity = Number(detail.quantity)
        items.push(item[0])
      })

      if (orders[0].paymentMethodId === BBVA_PAY) {
        paymentMethod = 'bbva'
      } else if (orders[0].paymentMethodId === CREDIVALE_PAY) {
        let ordersPaymentCrediVale = await db.query('SELECT folio FROM PaymentCrediVale WHERE orderId = ? LIMIT 1;', [
          orders[0].id
        ])
        crediValeFolio = ordersPaymentCrediVale[0].folio
        paymentMethod = 'credivale'
      } else if (orders[0].paymentMethodId === OXXO_PAY) {
        let ordersOXXO = await db.query('SELECT conektaReference, conektaBarcodeURL FROM PaymentOXXO WHERE orderId = ? LIMIT 1;', [
          orders[0].id
        ])

        let reference = ordersOXXO[0].conektaReference
        reference = reference.substr(0, 4) + '-' + reference.substr(4, 4) + '-' + reference.substr(8, 4) + '-' + reference.substr(12, 2)

        referenceOXXO = reference
        barcodeOXXO = ordersOXXO[0].conektaBarcodeURL
        paymentMethod = 'oxxo'
      } else if (orders[0].paymentMethodId === PAYPAL) {
        paymentMethod = 'paypal'
      } else if (orders[0].paymentMethodId === NETPAY) {
        paymentMethod = 'netpay'
      } else if (orders[0].paymentMethodId === PAYNET) {
        let paynetOrder = await db.query('SELECT ticket FROM PaymentPaynet WHERE orderId = ? LIMIT 1;', [
          orders[0].id
        ])
        paymentMethod = 'paynet'
        paynetTicket = paynetOrder[0].ticket
      }
    } catch (err) {
      console.log(err)
      await db.close()
      return {
        success: false
      }
    }

    await db.close()

    let response = {
      success: true,
      folio: orders[0].order,
      calzzapatoCode: orders[0].calzzapatoCode,
      crediValeFolio: crediValeFolio,
      referenceOXXO: referenceOXXO,
      barcodeOXXO: barcodeOXXO,
      paynetTicket: paynetTicket,
      shippingMethod: Number(orders[0].shippingMethodId),
      paymentMethod: paymentMethod,
      quantity: orderDetail[0].count,
      address: shippingAddress[0],
      date: orders[0].date,
      total: Number(orders[0].total),
      shippingCost: Number(orders[0].shippingCost),
      items: items
    }
    return response
  }

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

  Order.getCalzzamovilOrderByFolio = async (folio) => {
    console.log('getCalzzamovilOrderByFolio ', folio)
    const db = await mysql.connectToDBManually()
    const mdb = mongodb.getConnection('db')
    let order = null

    let pipeline = [
      {
        id: 1,
        key: 'WAITING',
        name: 'En espera',
        description: 'En espera de un repartidor.',
        status: true
      },
      {
        id: 2,
        key: 'START',
        name: 'Recolectando productos',
        description: 'Tu repartidor está yendo por tus productos.',
        status: false
      },
      {
        id: 3,
        key: 'COLLECTED',
        name: 'En camino',
        description: 'Tu repartidor está en camino a entregarte tus productos.',
        status: false
      },
      {
        id: 4,
        key: 'END',
        name: 'Entregado',
        description: 'Tus productos fueron entregados.',
        status: false
      }
    ]

    let currentStatus = 0
    let dealer = null
    let coordinates = []
    let moments = []
    let products = []
    let stores = []

    let pipelineQuery = await db.query('SELECT c.id AS calzzamovilId, o.id AS orderId, c.pipelineId, c.dealerId\
    FROM Calzzamovil AS c\
    LEFT JOIN `Order` AS o ON o.id = c.orderId\
    WHERE o.order = ?;', [folio])

    if (pipelineQuery.length > 0) {
      pipeline.forEach(element => {
        if (element.id === pipelineQuery[0].pipelineId) {
          element.status = true
        } else {
          element.status = false
        }
      })
      currentStatus = pipelineQuery[0].pipelineId
    }

    try {

      order = await db.query('SELECT `id`, `order`, `shippingMethodId`, `shippingAddressId`, `clickAndCollectStoreId`, `paymentMethodId`, CAST(createdAt AS DATE) AS date, `calzzapatoCode`, `total`, `shippingCost` FROM `Order` WHERE `order`= ? AND `status`= 1 AND `shippingMethodId` = 4;', [
        folio
      ])

      if (order.length !== 1) {
        throw 'Pedido no disponible con Calzzamovil ®'
      } else {
        order = order[0]
      }

      let paymentMethod = await db.query('SELECT * FROM PaymentMethod WHERE id = ?;', [
        order.paymentMethodId
      ])

      order.paymentMethod = paymentMethod[0]

      // Determinar status

      // 1 - Si la orden no tiene dealer asignado

      // 2 - Si la orden tiene dealer asignado pero en CalzzamovilDetail aún no se recolentan todos los productos

      // 3 - Si la orden tiene dealer asignado y en CalzzamovilDetail ya se recolectaron todos los productos

      // 4 - Si en Calzzamovil hay fecha de entrega diferente a null


      let shippingAddress = await db.query('SELECT sa.name, sa.lastName, sa.phone, a.street, a.exteriorNumber, a.interiorNumber, a.zip, s.name AS state, m.name AS municipality,lt.name AS location, l.name AS suburb, a.lat, a.lng FROM `ShippingAddress` AS sa INNER JOIN `Address` AS a ON sa.addressId=a.id INNER JOIN State AS s ON a.stateCode = s.id INNER JOIN Municipality AS m ON a.municipalityCode=m.municipalityStateCode INNER JOIN Location AS l ON a.locationCode=l.locationMunicipalityStateCode INNER JOIN LocationType AS lt ON l.locationTypeCode=lt.code WHERE sa.id="?" ;', [
        order.shippingAddressId
      ])

      order.address = shippingAddress[0]

      products = await db.query('SELECT * FROM `OrderDetail` WHERE orderId = ? AND status = 1;', [
        order.id
      ])

      await Utils.asyncForEach(products, async (product) => {
        let photos = await mongodb.mongoFind(mdb, 'Product', {
          code: product.productCode
        })

        let url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/"
        if (photos.length > 0) {
          if (photos[0].photos.length > 0) {
            url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/" + photos[0].photos[0].description
          }
        }
        product.image = url

      })
      if (currentStatus !== 0) {
        if (pipelineQuery.length > 0 && pipelineQuery[0].dealerId !== null && pipelineQuery[0].dealerId !== undefined) {
          let responseWebService = await Utils.request({
            url: configs.HOST_BACKOFFICE + ':' + configs.PORT_BACKOFFICE + '/api/users/token',
            method: 'POST',
            json: true,
            body: {
              userId: pipelineQuery[0].dealerId
            }
          })
          if (responseWebService.body !== null && responseWebService.body !== undefined) {
            dealer = responseWebService.body
            dealer.url = ''
          }
        }
      }
      if (pipelineQuery.length > 0) {
        let storesQuery = await db.query('SELECT cd.id, cd.calzzamovilId, cd.orderDetailId, cd.storeId, cd.collect, c.orderId, o.order AS folio\
        FROM CalzzamovilDetail AS cd\
        LEFT JOIN Calzzamovil AS c ON c.id = cd.calzzamovilId\
        LEFT JOIN `Order` AS o ON o.id = c.orderId\
        WHERE o.id = ? AND cd.status = 1;', [pipelineQuery[0].orderId])
        await Utils.asyncForEach(storesQuery, async (product, index) => {
          let store = await mongodb.mongoFind(mdb, 'Store', {
            code: product.storeId
          })
          if (store.length > 0) {
            let exist = stores.some(elem => elem.storeId === store[0].storeId)
            if (!exist) {
              stores.push(store[0])
            }
          }
        })
      }
      await db.close()
    } catch (err) {
      console.log(err)
      await db.close()
      throw err
    }

    let response = {
      order: order,
      pipeline: pipeline,
      dealer: dealer,
      currentStatus: currentStatus,
      products: products,
      stores: stores
    }
    return response
  }

  Order.remoteMethod('getCalzzamovilOrderByFolio', {
    description: '',
    http: {
      path: '/:folio/calzzamovil',
      verb: 'GET'
    },
    accepts: [
      { arg: 'folio', type: 'string', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.generateOrderPDF = async (folio, res) => {
    let response = { sent: false }

    const mdb = mongodb.getConnection('db')
    const db = mysql.connectToDBManually()

    try {
      let emailResponseOrder = await db.query('SELECT * FROM `Order` WHERE `order` = ? AND `status` = 1 AND calzzapatoCode IS NOT NULL;', [folio])
      let emailResponseUser = await db.query('SELECT * FROM `User` AS u LEFT JOIN `Order` AS o ON u.id = o.userId WHERE o.order = ? AND o.status = 1;', [folio])
      let emailResponseOrderDetail = await db.query('SELECT * FROM OrderDetail WHERE orderId = ? AND status = 1;', [emailResponseOrder[0].id])
      let emailResponseShippingMethod = await db.query('SELECT * FROM ShippingMethod WHERE id = ? AND status = 1 LIMIT 1;', [emailResponseOrder[0].shippingMethodId])

      let shippingAddress = {
        "street": "",
        "exteriorNumber": "",
        "interiorNumber": "",
        "location": "",
        "type": "",
        "zip": "",
        "municipality": "",
        "state": ""
      }

      let emailResponseShippingAddress = null
      if (emailResponseOrder[0].shippingAddressId !== null) {
        emailResponseShippingAddress = await db.query('SELECT a.street,a.exteriorNumber,a.interiorNumber,a.zip, s.name AS stateName, m.name AS municipalityName,lt.name AS locationTypeName, l.name AS locationName FROM `ShippingAddress` AS sa INNER JOIN `Address` AS a ON sa.addressId=a.id INNER JOIN State AS s ON a.stateCode = s.id INNER JOIN Municipality AS m ON a.municipalityCode=m.municipalityStateCode INNER JOIN Location AS l ON a.locationCode=l.locationMunicipalityStateCode INNER JOIN LocationType AS lt ON l.locationTypeCode=lt.code WHERE sa.id="?" ;', [emailResponseOrder[0].shippingAddressId])
        shippingAddress = {
          "street": emailResponseShippingAddress[0].street,
          "exteriorNumber": emailResponseShippingAddress[0].exteriorNumber,
          "interiorNumber": emailResponseShippingAddress[0].interiorNumber,
          "location": emailResponseShippingAddress[0].locationTypeName + ' ' + emailResponseShippingAddress[0].locationName,
          "type": '',
          "zip": emailResponseShippingAddress[0].zip,
          "municipality": emailResponseShippingAddress[0].municipalityName,
          "state": emailResponseShippingAddress[0].stateName,
        }
      } else {
        // Click & Collect
        if (emailResponseOrder[0].shippingMethodId === 3) {
          let storeAddress = await Utils.loopbackFind(Order.app.models.Store, { where: { code: emailResponseOrder[0].clickAndCollectStoreId } })
          if (storeAddress.length > 0) {
            storeAddress = storeAddress[0]
            shippingAddress = {
              "street": storeAddress.street,
              "exteriorNumber": storeAddress.exteriorNumber,
              "interiorNumber": storeAddress.interiorNumber,
              "location": storeAddress.suburb,
              "type": '',
              "zip": storeAddress.zip,
              "municipality": storeAddress.zone.name,
              "state": Utils.isEmpty(storeAddress.state) ? storeAddress.zone.stateCode : storeAddress.state,
            }
          }
        } else {
          shippingAddress = {
            "street": emailResponseShippingAddress[0].street,
            "exteriorNumber": emailResponseShippingAddress[0].exteriorNumber,
            "interiorNumber": emailResponseShippingAddress[0].interiorNumber,
            "location": emailResponseShippingAddress[0].locationTypeName + ' ' + emailResponseShippingAddress[0].locationName,
            "type": '',
            "zip": emailResponseShippingAddress[0].zip,
            "municipality": emailResponseShippingAddress[0].municipalityName,
            "state": emailResponseShippingAddress[0].stateName,
          }
        }
      }

      let emailResponsePaymentMethod = await db.query('SELECT * FROM PaymentMethod WHERE id = ? AND status = 1 LIMIT 1;', [emailResponseOrder[0].paymentMethodId])
      let emailResponsePipeline = await db.query('SELECT * FROM Pipeline WHERE id = ? AND status = 1 LIMIT 1;', [emailResponseOrder[0].pipeline])

      await Utils.asyncForEach(emailResponseOrderDetail, async (detail, index) => {
        let photos = await mongodb.mongoFind(mdb, 'Product', {
          code: detail.productCode
        })

        let url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/"
        if (photos.length > 0) {
          if (photos[0].photos.length > 0) {
            url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/" + photos[0].photos[0].description
          }
        }

        emailResponseOrderDetail[index]["productImage"] = url
        emailResponseOrderDetail[index]["unitPrice"] = Utils.numberWithCommas(Number(emailResponseOrderDetail[index]["unitPrice"]).toFixed(2))
      })

      let userName = (emailResponseUser[0].name + " " + emailResponseUser[0].firstLastName + " " + emailResponseUser[0].secondLastName).trim()
      let userEmail = emailResponseUser[0].email
      let phoneNumber = emailResponseUser[0].phone

      if (!Utils.isEmpty(emailResponseUser[0].cellphone)) {
        phoneNumber = emailResponseUser[0].cellphone
      }

      let title = 'Hola ' + userName + ', tu pedido está en camino.'
      let crediValeInfo = ''
      let userInfo = ''

      if (Utils.isEmpty(phoneNumber)) {
        userInfo = userEmail
      } else {
        userInfo = userEmail + ' - ' + phoneNumber
      }

      let crediValeFolio = []
      if (emailResponseOrder[0].paymentMethodId === CREDIVALE_PAY) {
        crediValeFolio = await db.query('SELECT * FROM `PaymentCrediVale` WHERE `orderId` = ? AND `status` = 1;', [emailResponseOrder[0].id])
      }

      if (emailResponseOrder[0].paymentMethodId === CREDIVALE_PAY) {
        title = 'Hola ' + userName + ', tu pedido está siendo procesado.'
        crediValeInfo = 'Tu CrediVale ® utilizado: ' + crediValeFolio[0].folio + '. Un asesor se comunicará contigo para continuar con el proceso.'
      }

      let orderData = {
        "logo": {
          "url": "https://i.imgur.com/HcaXIcC.jpeg"
        },
        "facebook": "https://i.imgur.com/WbUpJ3D.jpeg",
        "instagram": "https://i.imgur.com/mDzzAGi.jpeg",
        "whatsapp": "https://i.imgur.com/rBMgS23.jpeg",
        "youtube": "https://i.imgur.com/nVSzbQv.jpeg",
        "user": {
          "name": emailResponseUser.name,
          "firstLastName": emailResponseUser.firstLastName,
          "secondLastName": emailResponseUser.secondLastName,
        },
        "title": title,
        "userData": userInfo,
        "crediValeInfo": crediValeInfo,
        "order": {
          "order": emailResponseOrder[0].calzzapatoCode,
          "reference": emailResponseOrder[0].reference,
          "discount": Utils.numberWithCommas(Number(emailResponseOrder[0].discount).toFixed(2)),
          "shippingCost": Utils.numberWithCommas(Number(emailResponseOrder[0].shippingCost).toFixed(2)),
          "saved": Utils.numberWithCommas(Number(emailResponseOrder[0].saved).toFixed(2)),
          "subtotal": Utils.numberWithCommas(Number(emailResponseOrder[0].subtotal).toFixed(2)),
          "total": Utils.numberWithCommas(Number(emailResponseOrder[0].total).toFixed(2)),
          "shoppingDate": moment(emailResponseOrder[0].createdAt).locale('es').format("DD/MMMM/YYYY"),
          "shoppingDate2": moment(emailResponseOrder[0].createdAt).locale('es').add(8, 'days').format("DD/MMMM/YYYY"),
          "ShippingMethod": {
            "id": emailResponseShippingMethod[0].id,
            "name": emailResponseShippingMethod[0].name,
            "description": emailResponseShippingMethod[0].name,
            "calzzamovil": configs.HOST_WEB_APP + '/calzzamovil/' + emailResponseOrder[0].order
          },
          "OrderDetail": emailResponseOrderDetail,
          "OrderDetailCod": emailResponseOrderDetail[0].productCode,
          "PaymentMethod": {
            "name": emailResponsePaymentMethod[0].name,
            "description": emailResponsePaymentMethod[0].name,
          },
          "ShippingAddress": {
            "Address": shippingAddress
          },
          "Pipeline": {
            "name": emailResponsePipeline[0].name,
            "description": emailResponsePipeline[0].name
          }
        }
      }

      const filePath = path.join(__dirname, '../templates/new-order.hbs')
      const source = fs.readFileSync(filePath, 'utf-8')

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

      const template = handlebars.compile(source)

      await db.close()

      pdf.create(template(orderData), { "width": "1120px", "height": "1736px" }).toFile('../../cdn/orders/Calzzapato.com - Orden #' + emailResponseOrder[0].calzzapatoCode + '.pdf', async (err, stream) => {
        if (err) {
          console.log(err)
          response.created = false
        } else {
          let file = fs.createReadStream(stream.filename)
          let stat = fs.statSync(stream.filename)
          res.setHeader('Content-Length', stat.size)
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', 'attachment; filename=Calzzapato.com - Orden #' + emailResponseOrder[0].calzzapatoCode + '.pdf')
          fs.unlinkSync(stream.filename)
          file.pipe(res)
        }
      })
    } catch (err) {
      console.log(err)
      await db.close()
    }
  }

  Order.remoteMethod('generateOrderPDF', {
    description: 'Generate order PDF',
    http: {
      path: '/:folio/ticket',
      verb: 'GET'
    },
    accepts: [
      { arg: 'folio', type: 'string', require: true },
      { arg: 'res', type: 'object', http: ctx => { return ctx.res } }
    ],
    returns: [
      { arg: 'body', type: 'file', root: true },
      { arg: 'Content-Type', type: 'string', http: { target: 'header' } }
    ]
  })

  Order.sendTicket = async (folio, data, req) => {
    let response = { success: false }

    try {
      let responseSMS = await Utils.request({
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/send-sms',
        method: 'POST',
        json: true,
        body: {
          cellphone: '+52' + data.cellphone,
          message: data.message + configs.HOST + ':' + configs.PORT + '/api/orders/' + folio + '/ticket'
        }
      })
      /*
      await Utils.request({
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/send-sms',
        method: 'POST',
        json: true,
        body: {
          cellphone: '+52' + data.cellphone,
          message: "SIGUE TU ENTREGA EN VIVO: " + configs.HOST_WEB_APP + '/calzzamovil/' + folio
        }
      })
      */

      if (responseSMS.body !== undefined) {
        if (responseSMS.body.success) {
          response.success = responseSMS.body.success
        } else {
          throw '00001'
        }
      }
      else {
        throw '00001'
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    if (response.error) {
      throw response
    } else {
      return response
    }
  }

  Order.remoteMethod('sendTicket', {
    description: 'Send ticket',
    http: {
      path: '/:folio/ticket',
      verb: 'POST'
    },
    accepts: [
      { arg: 'folio', type: 'string', required: true },
      { arg: 'data', type: 'object', http: { source: 'body' }, require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.trackingOrder = async (folio) => {
    const db = mysql.connectToDBManually()

    try {
      let orders = await db.query('SELECT `calzzapatoCode` FROM `Order` WHERE (`order` = ? OR `calzzapatoCode` = ?) AND `status` = 1 AND (`calzzapatoCode` IS NOT NULL OR `calzzapatoCode` > 0)', [
        folio,
        folio
      ])

      await db.close()

      if (orders.length <= 0) {
        return [{ current: '1', name: '' }]
      } else {
        let calzzapatoCode = orders[0].calzzapatoCode
        let body = '<?xml version="1.0" encoding="utf-8"?>\
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
          <soap:Body>\
            <GetEstatusSeguimiento xmlns="http://tempuri.org/">\
              <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
              <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
              <iFolioVenta>' + calzzapatoCode + '</iFolioVenta>\
            </GetEstatusSeguimiento>\
          </soap:Body>\
        </soap:Envelope>'

        let request = await Utils.request({
          method: 'POST',
          url: configs.webServiceVentaPublicoURL + '?op=GetEstatusSeguimiento',
          headers: {
            "content-type": "text/xml"
          },
          body: body
        })

        let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
        result = JSON.parse(result)

        let orderStatus = []
        let data = []

        if (result['soap:Envelope']) {
          if (result['soap:Envelope']['soap:Body']) {
            if (result['soap:Envelope']['soap:Body']['GetEstatusSeguimientoResponse']) {
              if (result['soap:Envelope']['soap:Body']['GetEstatusSeguimientoResponse']['GetEstatusSeguimientoResult']) {
                if (result['soap:Envelope']['soap:Body']['GetEstatusSeguimientoResponse']['GetEstatusSeguimientoResult']['cEstatusSeguimiento']) {
                  let step = 1
                  data = result['soap:Envelope']['soap:Body']['GetEstatusSeguimientoResponse']['GetEstatusSeguimientoResult']['cEstatusSeguimiento']
                  // Iterar para separar

                  let aux = 0
                  data.forEach(product => {
                    if (aux === 0) {
                      try {
                        step = product.EstatusActual._text
                        if (step === '2' || step === '3')
                          product.EstatusActual._text = '2'
                      } catch (err) {
                        product.EstatusActual._text = '1'
                      }
                      orderStatus.push({ current: product.EstatusActual._text, name: product.DescArticulo._text })
                      aux++
                    } else {
                      aux++
                      if (aux === 6) {
                        aux = 0
                      }
                    }
                  })
                }
              }
            }
          }
          return orderStatus
        } else {
          return [{ current: 1, name: '' }]
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  Order.remoteMethod('trackingOrder', {
    description: 'Tracking order by folio',
    http: {
      path: '/:folio/tracking',
      verb: 'GET'
    },
    accepts: [
      { arg: 'folio', type: 'string', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'Array',
      root: true
    }
  })

  Order.checkout = async (req, data) => {
    console.time('CheckoutTime')
    let user = req.headers.user
    let userId = req.headers.user.id
    const db = await mysql.connectToDBManually()
    let MINIMIUM_STOCK = 1
    let shippingCost = 0

    let response = {
      paymentMethods: [],
      cards: [],
      cardsOpenpay: [],
      cart: null,
      coupon: null,
      shippingMethod: {
        id: 1,
        name: 'ENTREGA CALZZAPATO',
        description: 'Envíos a todo méxico.',
        cost: 0
      },
      shipping: {
        cost: 0
      },
      bluePoints: {
        conditions: {
          exchange: false,
          message: '',
          link: ''
        },
        exchange: 0,
        win: 0
      },
      cashPrices: {
        saved: 0,
        discount: 0,
        shippingCost: 0,
        subtotal: 0,
        recharge: 0,
        bluePoints: 0,
        generateBluePoints: 0,
        total: 0
      },
      creditPrices: {
        saved: 0,
        discount: 0,
        shippingCost: 0,
        subtotal: 0,
        recharge: 0,
        bluePoints: 0,
        generateBluePoints: 0,
        total: 0
      },
      prices: {
        saved: 0,
        discount: 0,
        shippingCost: 0,
        subtotal: 0,
        recharge: 0,
        bluePoints: 0,
        generateBluePoints: 0,
        total: 0
      }
    }

    let shippingMethod = CALZZAPATO_DELIVERY
    if (data.shippingMethodSelected !== undefined) {
      shippingMethod = data.shippingMethodSelected
    }

    // Get payment methods
    let paymentMethods = await db.query('SELECT * FROM `PaymentMethod` WHERE `status` = 1 ORDER BY `order` ASC;')
    console.log("PAYMENT METHODS: ", paymentMethods)
    await Utils.asyncForEach(paymentMethods, async (paymentMethod, idx) => {
      paymentMethods[idx].images = JSON.parse(paymentMethod.images)

      if (paymentMethod.id === NETPAY) { //GET CARDS FOR NETPAY
        let cards = await db.query('SELECT id, titular, alias, type, number, token FROM Card WHERE userId = ? AND paymentMethodId = ? AND status = 1;', [userId, paymentMethod.id])

        cards.forEach(card => {
          card.token = JSON.parse(card.token)
        })

        response.cards = cards
      }

      if (paymentMethod.id === OPENPAY) { //GET CARDS FOR OPENPAY
        let cards = await db.query('SELECT id, titular, alias, type, number, token FROM Card WHERE userId = ? AND paymentMethodId = ? AND status = 1;', [userId, paymentMethod.id])

        cards.forEach(card => {
          if (card.token !== '' && card.token !== undefined && card.token !== null) {
            card.token = JSON.parse(card.token)
          } else {
            card.token = null
          }
        })

        response.cardsOpenpay = cards
      }

      if (shippingMethod === CLICK_AND_COLLECT || shippingMethod === CALZZAMOVIL) {
        if (paymentMethod.id === PAYPAL) {
          paymentMethods.splice(idx, 1)
        }
      }
    })

    response.paymentMethods = paymentMethods

    // Get gifts cards
    // Validaciones cuando se compra con gift card
    // ----

    let recharge = false
    if (data.product !== undefined) {
      if (data.product !== null) {
        let request = await Utils.request({
          method: 'GET',
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/buy',
          body: {
            data: data.product
          },
          headers: {
            uuid: req.headers.uuid,
            authorization: req.headers.authorization,
            metadata: req.headers.metadata,
            zip: req.headers.zip || ''
          },
          json: true
        })

        if (request.body === undefined) {
          await db.close()
          throw 'Error al obtener checkout'
        } else {
          response.cart = request.body
        }

        if (response.cart.products.length === 1 && response.cart.products[0].code !== undefined) {
          let product = response.cart.products[0]

          if (product.bluePoints.status) {
            response.bluePoints.win += product.bluePoints.win
          }

          if (product.recharge) {
            recharge = true
            response.cashPrices.recharge += (product.selection.quantity * RECHARGE_PRICE)
            response.creditPrices.recharge = response.cashPrices.recharge
          }

          response.cashPrices.saved += product.savingPrice
          response.creditPrices.saved += product.savingPrice

          // Subtotal
          if (product.percentagePrice > 0) {
            response.cashPrices.subtotal += (1 * product.discountPrice)
            response.creditPrices.subtotal += (1 * product.creditPrice)
          } else {
            response.cashPrices.subtotal += (1 * product.price)
            response.creditPrices.subtotal += (1 * product.creditPrice)
          }
        }
      } else {
        await db.close()
        throw 'Error al obtener checkout'
      }
    } else {
      // Get shopping cart
      let request = await Utils.request({
        method: 'GET',
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/cart',
        headers: {
          uuid: req.headers.uuid,
          authorization: req.headers.authorization,
          metadata: req.headers.metadata,
          zip: req.headers.zip || ''
        },
        json: true
      })

      if (request.body === undefined) {
        await db.close()
        throw 'Error al obtener checkout'
      } else {
        response.cart = request.body
      }

      // Get favoriteAddressZip
      //let userAddress = await db.query('SELECT a.zip, m.name AS municipality FROM Address AS a LEFT JOIN Municipality AS m ON a.municipalityCode = m.municipalityStateCode  WHERE a.id = ?;', [user.favoriteAddressId])
      //let shippingMethods = await db.query('SELECT id, name, description, cost, minimiumAmount FROM ShippingMethod WHERE status = 1;')

      // Get total
      await Utils.asyncForEach(response.cart.products, async (product) => {

        /*
        if (userAddress.length > 0) {
          let shipping = await Shipping.getShippingMethods({ zip: userAddress[0].zip, code: product.code, size: product.selection.size, municipality: userAddress[0].municipality, local: product.location[0].isLocal, shippingMethods: shippingMethods, price: product.subtotal, selectedShippingMethods: data.selectedShippingMethods })
          product.shippingMethods = JSON.parse(JSON.stringify(shipping.shippingMethods))
          if (shipping.cost) {
            shippingCost += product.subtotal
          }
        }
        */

        if (product.bluePoints.status) {
          response.bluePoints.win += product.selection.quantity * product.bluePoints.win
        }

        if (product.recharge) {
          recharge = true
          response.cashPrices.recharge += (product.selection.quantity * RECHARGE_PRICE)
          response.creditPrices.recharge = response.cashPrices.recharge
        }

        // Saved
        response.cashPrices.saved += product.savingPrice
        response.creditPrices.saved += product.savingPrice

        // Subtotal
        if (product.percentagePrice > 0) {
          response.cashPrices.subtotal += (product.selection.quantity * product.discountPrice)
          response.creditPrices.subtotal += (product.selection.quantity * product.creditPrice)
        } else {
          response.cashPrices.subtotal += (product.selection.quantity * product.price)
          response.creditPrices.subtotal += (product.selection.quantity * product.creditPrice)
        }
      })

      /*
      console.log('PRODUCtO antes', response.cart.products[0].shippingMethods)
      let shippingPrices = await Shipping.getShippingCost({ shippingMethods, products: response.cart.products })
      console.log(shippingPrices);
      if (shippingPrices.changed === true) {
        response.cart.products = shippingPrices.products
      }
      response.shipping.cost = shippingPrices.shippingCost
      */
    }

    // Validate and apply coupon
    // validaciones
    // 0.- Código activo = status 1
    // 2.- Zona/dirección del usuario válida
    // 1.- Código válido
    // 3.- Uso único por cuenta
    // 4.- Fecha vigencia del cupón
    // 5.- Monto mínimo de compra
    // 6.- Compra por primera vez

    let coupon = null
    if (data.coupon !== undefined && !Utils.isEmpty(data.coupon)) {
      let subtotalProducts = response.cashPrices.subtotal
      if (data.isCredit) {
        subtotalProducts = response.creditPrices.subtotal
      }

      let coupons = await db.query('SELECT * FROM Coupon WHERE name = ? AND status = 1 AND minTotalShopping <= ? LIMIT 1;', [data.coupon, subtotalProducts])
      // El código es válido, está vigente, y coincide el monto mínimo de compra
      if (coupons.length === 1) {
        coupon = coupons[0]
        if (Number(coupon.unique) === 1) {
          let ordersWithCoupon = await db.query('SELECT * FROM `Order` WHERE userId = ? AND couponId = ? AND calzzapatoCode IS NOT NULL', [userId, data.coupon])
          if (ordersWithCoupon.length <= 0) {
            response.coupon = coupon
          } else {
            response.coupon = null
          }
        } else {
          response.coupon = coupon
        }

        if (Number(coupon.firstShopping) === 1) {
          let ordersWithCoupon = await db.query('SELECT * FROM `Order` WHERE userId = ? AND calzzapatoCode IS NOT NULL', [userId])
          if (ordersWithCoupon.length <= 0) {
            response.coupon = coupon
          } else {
            response.coupon = null
          }
        }

        // Revisar dirección de la tienda (recoger) o de la entrega a domicilio
        if (coupon.zone !== null && req.headers.zip !== undefined) {
          let zones = await db.query('SELECT * FROM Location WHERE zip = ? AND status = 1 LIMIT 1;', [req.headers.zip])
          if (zones.length === 1) {
            if (zones[0].municipalityStateCode === coupon.zone) {

              response.coupon = coupon
            } else {

              response.coupon = null
            }
          } else {
            response.coupon = null
          }
        }
      }
    }

    // Discount by coupon
    if (response.coupon !== null) {
      if (response.coupon.percentageDiscount > 0) {
        response.cashPrices.discount = ((response.cashPrices.subtotal * response.coupon.percentageDiscount) / 100)
        response.creditPrices.discount = ((response.creditPrices.subtotal * response.coupon.percentageDiscount) / 100)
      } else {
        response.cashPrices.discount = Number(response.coupon.priceDiscount)
        response.creditPrices.discount = response.cashPrices.discount
      }
    }

    if (shippingMethod === CLICK_AND_COLLECT) {
      response.shippingMethod.id = 3
      response.shippingMethod.name = 'CLICK & COLLECT'
      response.shippingMethod.description = 'Recoge en tu tienda favorita.'
      response.cashPrices.shippingCost = 0
      response.shippingMethod.cost = response.cashPrices.shippingCost
    } else {
      let minimiumAmount = await db.query('SELECT `minimiumAmount` FROM `ShippingMethod` WHERE `id` = 1 LIMIT 1;')
      if (minimiumAmount.length === 0) {
        minimiumAmount = 999
      } else {
        minimiumAmount = minimiumAmount[0].minimiumAmount
        minimiumAmount = Number(minimiumAmount)
      }

      let shippingCost = await db.query('SELECT `cost` FROM `ShippingMethod` WHERE `id` = 2 LIMIT 1;')
      if (shippingCost.length === 0) {
        shippingCost = 99
      } else {
        shippingCost = shippingCost[0].cost
        shippingCost = Number(shippingCost)
      }

      if (recharge) {
        shippingCost = await db.query('SELECT `cost` FROM `ShippingMethod` WHERE `id` = 3 LIMIT 1;')
        if (shippingCost.length === 0) {
          shippingCost = 199
        } else {
          shippingCost = shippingCost[0].cost
          shippingCost = Number(shippingCost)
        }
      }

      if (response.coupon !== null) {
        if (response.coupon.freeShipping === 0) {
          // Calculate shipping cost
          if (response.cashPrices.subtotal < minimiumAmount) {
            //response.shippingMethod.id = 2
            response.shippingMethod.name = 'ESTÁNDAR'
            response.shippingMethod.description = 'Envíos a todo méxico.'
            response.cashPrices.shippingCost = shippingCost
            response.shippingMethod.cost = response.cashPrices.shippingCost
          }

          if (response.creditPrices.subtotal < minimiumAmount) {
            //response.shippingMethod.id = 2
            response.shippingMethod.name = 'ESTÁNDAR'
            response.shippingMethod.description = 'Envíos a todo méxico.'
            response.creditPrices.shippingCost = shippingCost
            response.shippingMethod.cost = response.creditPrices.shippingCost
          }

          if (recharge) {
            //response.shippingMethod.id = 3
            response.shippingMethod.name = 'ESTÁNDAR'
            response.shippingMethod.description = 'Envíos a todo méxico.'
            response.cashPrices.shippingCost = shippingCost
            response.shippingMethod.cost = response.cashPrices.shippingCost

            response.creditPrices.shippingCost = shippingCost
            response.shippingMethod.cost = response.creditPrices.shippingCost
          }
        }
      } else {
        // Calculate shipping cost
        if (response.cashPrices.subtotal < minimiumAmount) {
          //response.shippingMethod.id = 2
          response.shippingMethod.name = 'ESTÁNDAR'
          response.shippingMethod.description = 'Envíos a todo méxico.'
          response.cashPrices.shippingCost = shippingCost
          response.shippingMethod.cost = response.cashPrices.shippingCost
        }

        if (response.creditPrices.subtotal < minimiumAmount) {
          //response.shippingMethod.id = 2
          response.shippingMethod.name = 'ESTÁNDAR'
          response.shippingMethod.description = 'Envíos a todo méxico.'
          response.creditPrices.shippingCost = shippingCost
          response.shippingMethod.cost = response.creditPrices.shippingCost
        }

        if (recharge) {
          //response.shippingMethod.id = 3
          response.shippingMethod.name = 'ESTÁNDAR'
          response.shippingMethod.description = 'Envíos a todo méxico.'
          response.cashPrices.shippingCost = shippingCost
          response.shippingMethod.cost = response.cashPrices.shippingCost

          response.creditPrices.shippingCost = shippingCost
          response.shippingMethod.cost = response.creditPrices.shippingCost
        }
      }

      let expressDelivery = false
      if (data.expressDelivery !== undefined && data.expressDelivery) {
        expressDelivery = data.expressDelivery
      }

      if (shippingMethod !== CLICK_AND_COLLECT && !expressDelivery) {
        // Calculate ShippingMethod
        let checkLocations = await Calzzamovil.getExistProducts(response.cart.products, { minimiumStock: MINIMIUM_STOCK })
        if (checkLocations.local) {
          response.shippingMethod.id = 1
        } if (checkLocations.otherLocations) {
          response.shippingMethod.id = 2
        }
      }
    }

    let auth = await Utils.request({
      method: 'GET',
      json: true,
      url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/auth',
      headers: {
        uuid: req.headers.uuid,
        authorization: req.headers.authorization,
        metadata: req.headers.metadata
      },
    })

    if (auth.body === undefined) {
      await db.close()
      throw 'Error al obtener checkout'
    } else {
      user = auth.body
    }

    // Blue points
    if (user.calzzapatoUserId !== null && user.bluePoints !== null) {
      let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetMonederoAzulCondiciones xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <MonederoID></MonederoID>\
            <IDUsuario>' + user.calzzapatoUserId + '</IDUsuario>\
          </GetMonederoAzulCondiciones>\
        </soap:Body>\
      </soap:Envelope>'

      let request = await Utils.request({
        method: 'POST',
        url: configs.webServiceVentaPublicoURL + '?op=GetMonederoAzulCondiciones',
        headers: {
          "content-type": "text/xml"
        },
        body: body
      })

      console.log('WS GetMonederoAzulCondiciones')
      // console.log(request.body)

      if (request.body !== undefined) {
        let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
        result = JSON.parse(result)
        result = result['soap:Envelope']['soap:Body']['GetMonederoAzulCondicionesResponse']['GetMonederoAzulCondicionesResult']
        if (Number(result.errNumber['_text']) === 0) {
          response.bluePoints.conditions = {
            exchange: (result.ConCanje['_text'] == 'True') ? true : false
          }
          if (response.cashPrices.subtotal >= Number(result.CompraMinimaParaCanje['_text'])) {
            response.bluePoints.conditions.exchange = true
          } else {
            response.bluePoints.conditions.message = 'Compra mínima para utilizar tus puntos azules: $ ' + Number(result.CompraMinimaParaCanje['_text']).toFixed(2) + ' M.N.'
          }
        }
      }
    }

    if (data.isCredit) {
      response.bluePoints.conditions.exchange = false
      response.bluePoints.conditions.link = 'https://www.monederoazul.com'
      response.bluePoints.conditions.message = 'Por el momento solo puedes utilizar tus puntos en compras de contado. Presiona para más información.'
    }

    if (user.bluePoints === null) {
      response.bluePoints.conditions.exchange = false
      response.bluePoints.conditions.link = 'https://www.monederoazul.com'
      response.bluePoints.conditions.message = 'Activa tu Monedero Azul ® GRATIS y obtén grandes beneficios. Presiona para más información.'
    } else {
      if (data.bluePoints > (response.cashPrices.subtotal - response.cashPrices.discount)) {
        response.bluePoints.exchange = 0
        response.bluePoints.conditions.message = 'Los puntos azules ingresados superan el monto total de la compra.'
      } else if (user.bluePoints.balance <= 0) {
        response.bluePoints.conditions.message = 'No cuentas con puntos azules.'
      } else if (data.bluePoints > user.bluePoints.balance) {
        response.bluePoints.conditions.message = 'No cuentas con sufientes puntos azules.'
      }
    }

    if (data.bluePoints !== undefined && !isNaN(data.bluePoints)) {
      response.bluePoints.exchange = data.bluePoints
    }

    response.cashPrices.total = (((response.cashPrices.subtotal - response.bluePoints.exchange) - response.cashPrices.discount) + response.shippingMethod.cost) + response.cashPrices.recharge
    response.creditPrices.total = (((response.creditPrices.subtotal - response.bluePoints.exchange) - response.creditPrices.discount) + response.shippingMethod.cost) + response.creditPrices.recharge

    response.prices = response.cashPrices
    if (data.isCredit) {
      response.prices = response.creditPrices
    }
    await db.close()
    console.timeEnd("CheckoutTime")
    return response
  }


  Order.remoteMethod('checkout', {
    description: 'Get checkout',
    http: {
      path: '/checkout',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', require: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.collectProduct = async function (data) {
    let response = { updated: false }
    const db = mysql.connectToDBManually()

    try {
      await db.beginTransaction()

      await Utils.asyncForEach(data.data.products, async (product) => {
        let collectResponse = await db.query('UPDATE CalzzamovilDetail SET collect = 1 WHERE orderDetailId in (?);', [product])
        if (collectResponse.affectedRows) {
          if (collectResponse.affectedRows === data.data.products.length) {
            response.updated = true
          } else {
            response.error = true
          }
        }
      })

      await db.commit()

    } catch (error) {
      console.log(error)
      await db.rollback()
    }

    await db.close()
    return response
  }

  Order.remoteMethod('collectProduct', {
    description: 'Collect a product from calzzapato store.',
    http: {
      path: '/calzzamovil/collect',
      verb: 'PATCH'
    },
    accepts: [
      {
        arg: 'data', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.cancelOrder = async (id) => {
    let response = { canceled: false }
    const db = mysql.connectToDBManually()

    try {
      await db.beginTransaction()
      await db.query('UPDATE Calzzamovil SET status = 2, pipelineId = 5 WHERE orderId = ?', [id])

      let orderDetailResponse = await db.query('SELECT id FROM OrderDetail WHERE orderId = ?', [id])

      await Utils.asyncForEach(orderDetailResponse, async (product) => {
        await db.query('UPDATE CalzzamovilDetail SET status = 2 WHERE orderDetailId = ?', [product.id])
      })

      await db.commit()
      response.canceled = true
    } catch (error) {
      console.log(error)
      await db.rollback()
    }

    await db.close()
    return response
  }

  Order.remoteMethod('cancelOrder', {
    description: 'Cancel order',
    http: {
      path: '/calzzamovil/:id/cancel',
      verb: 'PATCH'
    },
    accepts: [
      {
        arg: 'id', type: 'number', required: true
      },
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.confirmRecolection = async (id) => {
    let response = { updated: false }

    const db = mysql.connectToDBManually()

    try {
      let updated = await db.query('UPDATE Calzzamovil SET pipelineId = 3 WHERE orderId = ?', [id])

      if (updated.changeRows === 1) {
        response.updated = true
      }
    } catch (error) {
      console.log(error)
    }
    await db.close()
    return response
  }

  Order.remoteMethod('confirmRecolection', {
    description: 'Confirm recolection for start journey.',
    http: {
      path: '/calzzamovil/:id/confirm',
      verb: 'PATCH'
    },
    accepts: [
      {
        arg: 'id', type: 'number', required: true
      },
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.finishJourney = async (id) => {
    let response = { updated: false }

    const db = mysql.connectToDBManually()

    try {
      let finishResponse = await db.query('UPDATE Calzzamovil SET pipelineId = 4, deliveryDate = NOW() WHERE orderId = ?;', [id])

      if (finishResponse.affectedRows) {
        response.updated = true
        Utils.sendNotification({ notificationType: 'DELIVERY_FINISHED', userRole: 'USERS', orderId: id })
        //await ecommercePush.sendNotification({ notificationType: 'DELIVERY_FINISHED', userRole: 'USERS', orderId: id })
      }
    } catch (error) {
      console.log(error)
    }
    await db.close()

    return response
  }

  Order.remoteMethod('finishJourney', {
    description: 'Finish journey.',
    http: {
      path: '/calzzamovil/:id/finish',
      verb: 'PATCH'
    },
    accepts: [
      {
        arg: 'id', type: 'number', required: true
      },
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.pauseOrder = async (req, id, data) => {
    let response = { updated: false }

    const db = mysql.connectToDBManually()

    try {
      let pauseResponse = await db.query('UPDATE Calzzamovil SET pipelineId = 6, reasons = ?, reasonId = ?, status = 2 WHERE orderId = ?;', [data.comments, data.reasonId, id])
      if (pauseResponse.affectedRows) {
        response.updated = true
      }
    } catch (error) {
      console.log(error)
    }

    await db.close()
    return response
  }

  Order.remoteMethod('pauseOrder', {
    description: 'Pause orderdes when dealer has a problem with the order.',
    http: {
      path: '/calzzamovil/:id/pause',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      {
        arg: 'id', type: 'number', required: true
      },
      {
        arg: 'data', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.getOrderForSocket = async (folio) => {
    let response = null

    const db = mysql.connectToDBManually()

    try {
      let orders = await db.query('SELECT c.id, c.orderId, c.zoneId, c.dealerId, c.pipelineId, o.order \
      FROM Calzzamovil AS c\
      LEFT JOIN `Order` AS o ON o.id = c.orderId\
      WHERE o.order = ? LIMIT 1;', [folio])

      if (orders.length > 0) {
        response = orders[0]
      }
    } catch (error) {
      console.log(error)
    }
    await db.close()

    return response
  }

  Order.remoteMethod('getOrderForSocket', {
    description: 'Get info about calzzamovil order.',
    http: {
      path: '/calzzamovil/:folio',
      verb: 'GET'
    },
    accepts: [
      {
        arg: 'folio', type: 'number', required: true
      },
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.createOrderEvidence = async (data) => {
    let response = { uploaded: false }
    let saveUrls = { ine: { id: null, url: null }, sign: { id: null, url: null } }

    const db = mysql.connectToDBManually()

    try {
      if (data.orderId !== undefined) {
        let calzzamovilId = await db.query('SELECT o.order, o.instanceId, c.id FROM `Calzzamovil` AS c\
          LEFT JOIN `Order` AS o ON c.orderId = o.id\
          WHERE o.id = ? LIMIT 1 ', [data.orderId])

        await db.close()

        if (calzzamovilId.length > 0) {

          // Upload desktop image own cdn
          let instanceId = calzzamovilId[0].instanceId
          let evidences = [data.documents.ine, data.documents.sign]

          await Utils.asyncForEach(evidences, async (evidence, idx) => {
            let extencion = 'jpg'
            if (evidence.type !== null && evidence.type !== undefined) {
              extencion = evidence.type.split('/')[1]
            }
            evidence.name = uuid.v4()
            let uploadData = {
              name: 'calzzamovil/' + calzzamovilId[0].order + '/' + evidence.document + '-' + evidence.name + '.' + extencion,
              data: evidence.data,
              contentType: (evidence.type !== null && evidence.type !== undefined) ? evidence.type : 'image/jpg'
            }
            let cdnUpload = await CDN.upload(uploadData, Order.app.models.CDN, {
              instanceId: instanceId,
              fileName: evidence.name
            }, {
              instanceId: instanceId,
              documentTypeId: evidence.documentTypeId,
              fileName: evidence.documentTypeName,
              fileType: (evidence.type !== null && evidence.type !== undefined) ? evidence.type : 'image/jpg',
              fileSize: evidence.size,
              height: evidence.height,
              width: evidence.width,
              url: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              status: true
            })

            if (cdnUpload.success) {
              if (evidence.document === 'ine') {
                saveUrls.ine.url = cdnUpload.data.url
                saveUrls.ine.id = cdnUpload.data.id
              } else {
                saveUrls.sign.url = cdnUpload.data.url
                saveUrls.sign.id = cdnUpload.data.id
              }
            }
          })
          await mongodb.createMongoDB(Order.app.models.CalzzamovilEvidence, { calzzamovilId: calzzamovilId[0].id, ine: saveUrls.ine, sign: saveUrls.sign })
          response.uploaded = true
        } else {
          response.message = 'No se encontró calzzamovil orden con orderId: ' + data.orderId
        }
      }
    } catch (error) {
      console.log(error)
    }

    return response
  }

  Order.remoteMethod('createOrderEvidence', {
    description: 'Upload order photos.',
    http: {
      path: '/calzzamovil/evidence',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.getRoute = async (data, req) => {
    let response = null
    let error = null
    let bestStore = null
    let bestHouse = null
    let menor = null
    let orders = []
    let STOCK_AVAILABLE = 1
    let MAX_PRODUCTS = 6
    let userId = req.headers.user.id

    const db = mysql.connectToDBManually()
    await db.beginTransaction()

    try {
      // Código de zona (cityMunicipalityStatecode)
      let backofficeDB = await calzzamovil.getBackofficeDataBase()
      let zoneCode = null
      if (backofficeDB !== null && backofficeDB !== undefined) {
        zoneCode = await backofficeDB.query('SELECT cityMunicipalityStateCode FROM `User` WHERE id = ?', [userId])
        await backofficeDB.close()
        if (zoneCode.length > 0) {
          zoneCode = zoneCode[0].cityMunicipalityStateCode
        }
      }
      // Ordenes Pendientes
      orders = await db.query('SELECT c.* FROM Calzzamovil AS c \
      LEFT JOIN `Order` AS o ON o.id = c.orderId\
      WHERE c.deliveryDate IS NULL \
      AND o.status = 1 AND c.dealerId IS NULL AND c.createdAt < NOW() AND c.status = 1 AND c.pipelineId <> 6 AND c.pipelineId <> 4 AND cityMunicipalityStateCode = ? AND o.calzzapatoCode IS NOT NULL ORDER BY c.createdAt;', [zoneCode])

      // Ordenes pausadas.
      let pausedOrders = await db.query('SELECT c.* FROM Calzzamovil AS c LEFT JOIN `Order` AS o ON o.id = c.orderId WHERE CURRENT_TIMESTAMP() >= c.deliveryAt AND c.deliveryAt IS NOT NULL AND c.status = 1 AND c.pipelineId = 6 AND c.deliveryDate IS NULL AND c.dealerId IS NULL AND o.calzzapatoCode IS NOT NULL AND cityMunicipalityStateCode = ? ;', [zoneCode])
      if (pausedOrders.length > 0) {
        let sumOrders = [...orders, ...pausedOrders]
        orders = sumOrders
      }
      if (orders.length === 0) {
        // Ordenes recientes para entregar hoy.
        orders = await db.query('SELECT c.* FROM Calzzamovil AS c \
        LEFT JOIN `Order` AS o ON o.id = c.orderId\
        WHERE c.deliveryDate IS NULL \
        AND c.dealerId IS NULL AND c.scheduledId = 1 AND (DAY(c.createdAt) = DAY(NOW()) AND MONTH(c.createdAt) = MONTH(NOW()))\
        AND c.status = 1 AND c.pipelineId <> 4 AND c.pipelineId <> 6 AND o.calzzapatoCode IS NOT NULL AND cityMunicipalityStateCode = ? ORDER BY c.createdAt;', [zoneCode])

        if (orders.length === 0) {
          // Ordenes recientes para entregar MAÑANA.
          orders = await db.query('SELECT c.* FROM Calzzamovil AS c \
          LEFT JOIN `Order` AS o ON o.id = c.orderId\
          WHERE c.deliveryDate IS NULL \
          AND c.dealerId IS NULL AND c.scheduledId = 2 AND (DAY(c.createdAt) = DAY(NOW()) AND MONTH(c.createdAt) = MONTH(NOW())) \
          AND c.status = 1 AND c.pipelineId <> 4 AND c.pipelineId <> 6 AND o.calzzapatoCode IS NOT NULL AND cityMunicipalityStateCode = ? ORDER BY c.createdAt;', [zoneCode])
        }
      }

      let assignedOrders = await db.query('SELECT c.*, o.shippingAddressId, cd.collect FROM Calzzamovil AS c LEFT JOIN `Order` AS o ON o.id = c.orderId \
      LEFT JOIN CalzzamovilDetail AS cd ON cd.calzzamovilId = c.id\
      WHERE (c.pipelineId <> 6 OR CURRENT_TIMESTAMP() >= deliveryAt) AND c.deliveryDate IS NULL AND c.dealerId = ?  AND c.status = 1 AND o.calzzapatoCode IS NOT NULL AND c.pipelineId != 4 AND c.pipelineId != 5 ORDER BY c.createdAt;', [req.headers.user.id])
      // Hay ASIGNADAS?
      if (assignedOrders.length > 0) {
        let assignetNotCollected = await db.query('SELECT c.*, cd.*\
        FROM Calzzamovil AS c\
        LEFT JOIN CalzzamovilDetail AS cd ON cd.calzzamovilId = c.id\
        LEFT JOIN `Order` AS o ON o.id = c.orderId\
        WHERE c.dealerId = ? AND cd.collect = 0 AND o.calzzapatoCode IS NOT NULL AND c.pipelineId != 4 AND c.pipelineId != 5;', [req.headers.user.id])

        // Asignadas con collect 1 y aun no entregadas.
        let collectedOrders = await db.query('SELECT c.orderId, a.lat, a.lng\
        FROM Calzzamovil AS c\
        LEFT JOIN CalzzamovilDetail AS cd ON cd.calzzamovilId = c.id\
        LEFT JOIN `Order` AS o ON o.id = c.orderId\
        LEFT JOIN ShippingAddress AS s ON s.id = o.shippingAddressId\
        LEFT JOIN Address AS a ON s.addressId = a.id\
        WHERE CURRENT_TIMESTAMP() >= deliveryAt AND deliveryAt IS NOT NULL AND c.dealerId = ? AND cd.collect = 1 AND c.deliveryDate IS NULL AND c.status = 1 AND o.calzzapatoCode IS NOT NULL AND c.pipelineId != 4 AND c.pipelineId != 5 ;', [req.headers.user.id])

        // HAY ASIGNADAS CON COLLECT = 0?
        if (assignetNotCollected.length > 0) {
          // Mandar información de la tienda
          let information = await Calzzamovil.sendInfoForTracking(db, assignetNotCollected[0].orderId, 'store')
          information.productCounter = collectedOrders.length
          await db.commit()
          await db.close()
          return information
        } else {
          if (collectedOrders.length > 0) {
            bestHouse = await Calzzamovil.getBestDistance(db, collectedOrders, { lat: String(data.lat), lng: String(data.lng) })
            if (bestHouse !== null)
              bestHouse.productCounter = collectedOrders.length
          }
        }
      }
      // Hay pendientes?
      if (orders.length > 0) {
        // En caso de :
        // 1.- No tengas ninguna orden asignada.
        // 2.- Haya ordenes pendientes sin asignar.
        if (bestHouse !== null) {
          if (bestHouse.productCounter < MAX_PRODUCTS) {
            bestStore = await Calzzamovil.getBestDistance(db, orders, { lat: String(data.lat), lng: String(data.lng), stockAvailable: STOCK_AVAILABLE })
          }
        } else {
          bestStore = await Calzzamovil.getBestDistance(db, orders, { lat: String(data.lat), lng: String(data.lng), stockAvailable: STOCK_AVAILABLE })
        }
      }
      if (bestHouse !== null) {
        if (bestStore !== null) {
          // Comparación
          if (bestStore.distance < bestHouse.distance) {
            let responseAssign = await Calzzamovil.createOrderIntoCalzzamovil(db, { productsDetailId: bestStore.productsDetailId, calzzamovilId: bestStore.calzzamovilId, branch: bestStore.branch, userId: req.headers.user.id, orderId: bestStore.orderId })
            if (responseAssign.created) {
              menor = bestStore
              menor.type = 'store'
              Calzzamovil.sendMessageToStore(db, { calzzamovilId: bestStore.calzzamovilId, phone: '6727250809' })
              Utils.sendNotification({ notificationType: 'DELIVERY_STARTED', userRole: 'USERS', orderId: bestStore.orderId })
            } else {
              throw 'No se pudo asignar la orden al repartidor (1).'
            }
          } else {
            menor = bestHouse
            menor.type = 'house'
            let checkNotification = await db.query('SELECT toHouse, cd.id FROM CalzzamovilDetail AS cd LEFT JOIN Calzzamovil AS c ON c.id = cd.calzzamovilId WHERE c.orderId = ?;', [bestHouse.orderId])
            if (checkNotification.length > 0 && checkNotification[0].toHouse === 0) {
              Utils.sendNotification({ notificationType: 'DELIVERY_CUSTOMER_STARTED', userRole: 'USERS', orderId: bestHouse.orderId })
              await db.query('UPDATE CalzzamovilDetail SET toHouse = 1 WHERE id = ?', [checkNotification[0].id])
            }
          }
        } else {
          // Manda house
          menor = bestHouse
          menor.type = 'house'
          let checkNotification = await db.query('SELECT toHouse, cd.id FROM CalzzamovilDetail AS cd LEFT JOIN Calzzamovil AS c ON c.id = cd.calzzamovilId WHERE c.orderId = ?;', [bestHouse.orderId])
          if (checkNotification.length > 0 && checkNotification[0].toHouse === 0) {
            Utils.sendNotification({ notificationType: 'DELIVERY_CUSTOMER_STARTED', userRole: 'USERS', orderId: bestHouse.orderId })
            await db.query('UPDATE CalzzamovilDetail SET toHouse = 1 WHERE id = ?', [checkNotification[0].id])
          }
        }
      } else if (bestStore !== null) {
        let createCalzzamovilDetail = await Calzzamovil.createOrderIntoCalzzamovil(db, { productsDetailId: bestStore.productsDetailId, calzzamovilId: bestStore.calzzamovilId, branch: bestStore.branch, userId: req.headers.user.id, orderId: bestStore.orderId })
        if (createCalzzamovilDetail.created) {
          menor = bestStore
          menor.type = 'store'
          menor.storeId = bestStore.branch
          // Calzzamovil.sendMessageToStore(db, { calzzamovilId: bestStore.calzzamovilId, phone: '6727250809' })          
          Utils.sendNotification({ notificationType: 'DELIVERY_STARTED', userRole: 'USERS', orderId: bestStore.orderId })
        } else {
          throw 'No se pudo asignar la orden al repartidor (2).'
        }
      } else {
        // Cuando no hay nada
        await db.rollback()
        await db.close()
        return response
      }
      response = await Calzzamovil.sendInfoForTracking(db, menor.orderId, menor.type, menor.storeId)
      if (bestHouse !== null) {
        response.productCounter = bestHouse.productCounter
      } else {
        response.productCounter = 0
      }
    } catch (error) {
      console.log(error)
      error = error
    }

    if (!error) {
      await db.commit()
    } else {
      await db.rollback()
    }

    await db.close()
    return response
  }

  Order.remoteMethod('getRoute', {
    description: 'Create order',
    http: {
      path: '/calzzamovil/route',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.getBestParcel = async (data) => {
    let connection = await mysql.connectToDBManually()
    let response = {}
    let availableCarriers = []
    let bestCarrier = null
    let bestDate = null
    let bestPrice = 0
    //console.log('ddata', data.body.data)
    try {
      let carriers = await connection.query('SELECT id, name, carrierId FROM Carrier WHERE status = 1;')
      await connection.close()
      await Utils.asyncForEach(carriers, async (carrier) => {
        let responseWebService = await Utils.request({
          url: configs.envia.url + 'ship/rate',
          method: 'POST',
          json: true,
          headers: {
            Authorization: 'Bearer ' + configs.envia.token
          },
          body: {
            "origin": data.body.data.origin,
            "destination": data.body.data.destination,
            "packages": [data.body.data.packages[0]],
            "shipment": {
              "carrier": carrier.name
            }
          }
        })

        console.log('Response web service ship rate Envia.com')
        console.log(responseWebService.body)

        if (responseWebService.body) {
          if (responseWebService.body.meta === 'rate' && typeof responseWebService.body.data !== 'string') {
            availableCarriers = [...availableCarriers, ...responseWebService.body.data]
            responseWebService.body.data.forEach(element => {
              if (element.service !== 'express' && element.service !== 'saver') {
                let date = element.deliveryDate.date
                if (bestPrice === 0) {
                  element.carrierId = carrier.carrierId
                  element.id = carrier.id
                  //element.logo = carrier.logo
                  bestPrice = element.totalPrice
                  bestDate = date
                  bestCarrier = element
                } else {
                  let newDate = Math.abs(new Date(date) - new Date())
                  let best = Math.abs(new Date(bestDate) - new Date())
                  //if (newDate < best && element.totalPrice < bestPrice) {
                  if ((newDate < best && element.totalPrice <= bestPrice) || (element.totalPrice < bestPrice && newDate <= best)) {
                    element.carrierId = carrier.carrierId
                    element.id = carrier.id
                    //element.logo = carrier.logo
                    bestPrice = element.totalPrice
                    bestDate = date
                    bestCarrier = element
                  }
                }
              } else {
                console.log('Hola express')
              }
            })
          }
        }
      })
      if (bestCarrier) {
        console.log('Hay carrier')
        console.log(bestCarrier)
        response.carrier = bestCarrier
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  Order.remoteMethod('getBestParcel', {
    description: 'Get the best parcel (time and price).',
    http: {
      path: '/parcel',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.createCarrierGuide = async (data, req) => {
    let response = { created: false, message: '' }
    let MINIMIUM_STOCK = 1
    let bestStore = null
    let sameLocations = []
    let packages = []
    let locations = []
    let origin = {}
    let destination = {}

    let connectionMysql = mysql.connectToDBManually()

    try {

      let products = await connectionMysql.query('SELECT od.orderId, od.productCode AS code, od.productArticleCode, od.size, od.productDescription, od.quantity, a.zip\
      FROM OrderDetail AS od \
      LEFT JOIN `Order` AS o ON o.id = od.orderId\
      LEFT JOIN ShippingAddress AS sa ON o.shippingAddressId = sa.id\
      LEFT JOIN Address AS a ON a.id = sa.addressId WHERE od.orderId = ? AND o.status = 1;', [data.orderId])


      let addressInformation = await connectionMysql.query('SELECT i.name AS instanceName, i.alias, a.lat, a.lng, sa.name AS name, sa.lastName AS lastName, u.email, u.cellphone AS phone, a.street, a.exteriorNumber, l.name AS location, m.name AS municipality, a.zip, sa.reference, s.name AS state, o.id AS orderId, o.order AS folio, o.calzzapatoCode AS code, u.id AS userId, sa.id AS shippingAddressId\
      FROM ShippingAddress AS sa \
      LEFT JOIN Address AS a ON sa.addressId = a.id \
      LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode \
      LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode \
      LEFT JOIN State AS s ON s.code = m.stateCode \
      LEFT JOIN `Order` AS o ON o.shippingAddressId = sa.id\
      LEFT JOIN User AS u ON u.id = o.userId\
      LEFT JOIN Instance AS i ON i.id = o.instanceId \
      WHERE o.status = 1 AND o.id = ?;', [data.orderId])

      await connectionMysql.close()

      if (products.length > 0 && addressInformation.length > 0) {

        // Locations donde se encuentran todos los productos
        sameLocations = await Calzzamovil.getExistProducts(products, { minimiumStock: MINIMIUM_STOCK })

        //console.log(sameLocations)

        if (sameLocations.otherLocations) {
          locations = sameLocations.locations
          locations = await Calzzamovil.findRecolectorStore({ locations: locations })
        } else if (sameLocations.local) {
          return response
          locations = sameLocations.locations
          locations = await Calzzamovil.findRecolectorStore({ locations: locations })
        } else {
          console.log('No hay producto en ninguna tienda')
          response.message = 'No hay producto en ninguna tienda'
          return response
        }

        if (addressInformation[0].lat === null || addressInformation[0].lat === undefined || addressInformation[0].lat === '' || addressInformation[0].lng === null || addressInformation[0].lng === undefined || addressInformation[0].lng === '') {
          //https://nominatim.openstreetmap.org/?country=Mexico&postalcode=97000&format=json
          // Coordenadas de LA PRIMAVERA.
          addressInformation[0].lat = '24.774118'
          addressInformation[0].lng = '-107.43698'
        }
        // Mejor tienda de donde puede salir el producto
        bestStore = await Calzzamovil.getBestDistanceForGuide(locations, { lat: addressInformation[0].lat, lng: addressInformation[0].lng })
        //console.log('BestStore',bestStore);

        let destinationName = addressInformation[0].name + ' ' + addressInformation[0].lastName
        destinationName = destinationName.trim()

        destination = {
          name: destinationName,
          company: addressInformation[0].code + ' (A)',
          email: addressInformation[0].email,
          phone: addressInformation[0].phone,
          street: addressInformation[0].street || '',
          number: addressInformation[0].exteriorNumber || '',
          district: addressInformation[0].location,
          city: addressInformation[0].municipality,
          postalCode: addressInformation[0].zip,
          reference: addressInformation[0].reference,
          lat: addressInformation[0].lat,
          lng: addressInformation[0].lng,
          zip: addressInformation[0].zip
        }

        // Información de la tienda (codes)
        let originLocationCondes = await Calzzamovil.getInfoStateByCoords(bestStore.zip)

        // Información del cliente (codes)
        let destinationLocationCodes = await Calzzamovil.getInfoStateByCoords(destination.zip)

        if (originLocationCondes.data.length > 0 && destinationLocationCodes.data.length > 0) {
          origin = {
            name: bestStore.name || 'GRUPO CALZAPATO S.A. DE C.V.',
            company: addressInformation[0].instanceName,
            email: "app@calzzapato.com",
            phone: bestStore.phone || '',
            street: bestStore.street || '',
            number: bestStore.exteriorNumber || '',
            district: bestStore.suburb,
            city: bestStore.municipality,
            postalCode: bestStore.zip,
            reference: bestStore.reference,
            state: originLocationCondes.data[0].state.code['2digit'],
            country: originLocationCondes.data[0].country.code,
            lat: bestStore.lat,
            lng: bestStore.lng
          }
          destination.state = destinationLocationCodes.data[0].state.code['2digit']
          destination.country = destinationLocationCodes.data[0].country.code

          if (sameLocations.otherLocations) {
            // Cuando se necesite crear una GUIA (otherLocations)
            let packInfo = {}
            if (products.length > 0) {
              let pluralProduct = (products.length > 1) ? 's.' : '.'
              packInfo.content = 'Caja con ' + products.length + ' producto' + pluralProduct
              packInfo.leng = (products.length > 1) ? 20 : 10
              packInfo.width = (products.length > 1) ? 45 : 30
              packInfo.height = (products.length > 1) ? 20 : 10
              packInfo.weight = (products.length > 1) ? 5 : 3
            }

            let packageInfo = {
              content: packInfo.content,
              amount: 1,
              type: "box",
              dimensions: {
                length: packInfo.leng,
                width: packInfo.width,
                height: packInfo.height,
              },
              weight: packInfo.weight,
              insurance: 0,
              declaredValue: 0,
              weightUnit: "KG",
              lengthUnit: "CM"
            }
            packages.push(packageInfo)

            // Sacar la mejor paqueteria segun precio y dia de entrega
            let bestCarrier = await Utils.request({
              method: 'POST',
              url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/parcel',
              json: true,
              body: {
                data: { origin: origin, destination: destination, packages: packages }
              }
            })
            console.log('bestCarrier', bestCarrier.body);
            if (bestCarrier.body.carrier) {
              let carrier = { carrier: bestCarrier.body.carrier.carrier, service: bestCarrier.body.carrier.service, carrierId: bestCarrier.body.carrier.id, orderId: products[0].orderId }
              let carrierResponse = await Calzzamovil.createCarrierGuide(origin, destination, packages, carrier)
              if (carrierResponse.created) {
                console.log('Creo guia')
                // Si la guia se creó, programamos recolección
                response.created = true
                // let totalWeight = 0
                // packages.forEach(packageInfo => {
                //   totalWeight += packageInfo.weight
                // })
                // let carrier = {
                //   totalProducts: products.length,
                //   carrier: bestCarrier.body.carrier.carrier,
                //   totalWeight: totalWeight,
                //   carrierId: bestCarrier.body.carrier.carrierId
                // }
                // if (bestCarrier.body.carrier.carrier !== 'quiken' || bestCarrier.body.carrier.carrier !== 'noventa9Minutos') {
                //   console.log('Crear recolección');
                //   await Calzzamovil.createRecolection(origin, carrier)
                // }
              }
            } else {
              console.log('Error en servicio Envia.com')
              console.log(bestCarrier.body)
            }
          } else {
            console.log('No se genera guía 1...')
          }
        } else {
          console.log('No se genera guía 2...')
        }
      } else {
        console.log('No se genera guía 3...')
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  Order.remoteMethod('createCarrierGuide', {
    description: 'Get the best parcel (time and price).',
    http: {
      path: '/guide',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.getCalzzamovilOrders = async (req) => {
    let response = {
      availables: [],
      delivered: [],
      stoped: [],
      inProgress: []
    }

    const db = mysql.connectToDBManually()

    try {
      response.availables = await db.query('SELECT o.id, o.calzzapatoCode, o.order AS folio, o.shoppingDate, u.name, u.firstLastName, u.secondLastName, u.cellphone, s.initHour, s.finishHour, cp.name AS pipeline, a.createdAt \
      FROM Calzzamovil AS a \
      LEFT JOIN `Order` AS o ON o.id = a.orderId\
      LEFT JOIN User AS u ON u.id = o.userId\
      LEFT JOIN Scheduled AS s ON s.id = a.scheduledId\
      LEFT JOIN CalzzamovilPipeline AS cp ON cp.id = a.pipelineId\
      WHERE a.status = 1 AND o.status = 1 AND cp.code = ?;', ['AVAILABLE'])

      await Utils.asyncForEach(response.availables, async (order) => {
        let products = await db.query('SELECT SUM(quantity) AS products FROM OrderDetail WHERE orderId = ?;', [order.id])
        order.products = products[0].products
      })

      response.delivered = await db.query('SELECT o.id, o.calzzapatoCode, o.order AS folio, o.shoppingDate, u.name, u.firstLastName, u.secondLastName, u.cellphone, s.initHour, s.finishHour, cp.name AS pipeline \
      FROM Calzzamovil AS a \
      LEFT JOIN `Order` AS o ON o.id = a.orderId\
      LEFT JOIN User AS u ON u.id = o.userId\
      LEFT JOIN Scheduled AS s ON s.id = a.scheduledId\
      LEFT JOIN CalzzamovilPipeline AS cp ON cp.id = a.pipelineId\
      WHERE a.status = 1 AND o.status = 1 AND (cp.code = ?) AND a.dealerId = ?;', ['DELIVERED', req.headers.user.id])

      response.stoped = await db.query('SELECT o.id, o.calzzapatoCode, o.order AS folio, o.shoppingDate, u.name, u.firstLastName, u.secondLastName, u.cellphone, s.initHour, s.finishHour, cp.name AS pipeline \
      FROM Calzzamovil AS a \
      LEFT JOIN `Order` AS o ON o.id = a.orderId\
      LEFT JOIN User AS u ON u.id = o.userId\
      LEFT JOIN Scheduled AS s ON s.id = a.scheduledId\
      LEFT JOIN CalzzamovilPipeline AS cp ON cp.id = a.pipelineId\
      WHERE a.status = 1 AND o.status = 1 AND (cp.code = ? OR cp.code = ?) AND a.dealerId = ?;', ['STOPPED', 'CANCELED', req.headers.user.id])

      await Utils.asyncForEach(response.stoped, async (order) => {
        let products = await db.query('SELECT SUM(quantity) AS products FROM OrderDetail WHERE orderId = ?;', [order.id])
        order.products = products[0].products
      })
    } catch (error) {
      console.log(error)
    }

    await db.close()
    return response
  }

  Order.remoteMethod('getCalzzamovilOrders', {
    description: 'Create a calzzamovil order.',
    http: {
      path: '/calzzamovil/all',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'Array',
      root: true
    }
  })

  Order.getInstance = async (data) => {
    let response = { instanceId: null, name: null }

    let db = mysql.connectToDBManually()

    try {
      let instance = await db.query('SELECT o.instanceId, i.alias FROM `Order` AS o LEFT JOIN `Instance` AS i ON i.id = o.instanceId WHERE o.id = ? LIMIT 1;', [data.orderId])
      if (instance !== undefined && instance !== null && instance.length > 0) {
        response.name = instance[0].alias
        response.instanceId = instance[0].instanceId
      }

    } catch (error) {
      console.log(error)
    }

    await db.close()
    return response
  }

  Order.remoteMethod('getInstance', {
    description: 'Get instances order for send to notification.',
    http: {
      path: '/calzzamovil/instance',
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

  Order.setStoreToSyncOrder = async (data) => {
    let response = { sync: false, detail: '' }
    let db = mysql.connectToDBManually()

    try {
      let orders = await db.query('SELECT calzzapatoCode FROM `Order` WHERE id = ? LIMIT 1;', [data.order])
      await db.close()

      if (orders.length !== 1) {
        return response
      } else {
        data.order = orders[0].calzzapatoCode
      }
      let body = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <SetVentaSucursal xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <IdVenta>' + data.order + '</IdVenta>\
            <IdOpcionEnvio>' + data.type + '</IdOpcionEnvio>\
            <sSucursal>' + data.store + '</sSucursal>\
          </SetVentaSucursal>\
        </soap:Body>\
      </soap:Envelope>'

      let clzWebService = await Utils.request({
        url: configs.webServiceVentaPublicoURL + '?op=SetVentaSucursal',
        method: 'POST',
        headers: {
          "content-type": "text/xml"
        },
        body: body
      })

      console.log('Web service calzzapato sync store')
      console.log(clzWebService)
      console.log(clzWebService.body)
      response.detail = clzWebService.body

      let result = convert.xml2json(clzWebService.body, { compact: true, spaces: 4 })
      result = JSON.parse(result)
      let number = result['soap:Envelope']['soap:Body']['SetVentaSucursalResponse']['SetVentaSucursalResult']['Numero']['_text']

      if (Number(number) === 0) {
        response.sync = true
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  Order.remoteMethod('setStoreToSyncOrder', {
    description: 'Set store to sync Order.',
    http: {
      path: '/store',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.getRoute2 = async (data, req) => {
    let response = { success: false, message: '' }
    let error = null
    let orders = []
    let MAX_PRODUCTS = 5

    let stores = []
    let houses = []
    let products = []

    const db = mysql.connectToDBManually()
    const mongoDB = await mongodb.getConnection('db')

    try {
      await db.beginTransaction()

      orders = await db.query('SELECT c.*, o.calzzapatoCode, od.productCode AS code, od.id AS orderDetailId, od.quantity, od.`size`, o.shippingAddressId, a.lat, a.lng \
      FROM Calzzamovil AS c \
      LEFT JOIN `Order` AS o ON o.id = c.orderId\
      LEFT JOIN OrderDetail AS od ON od.orderId = o.id \
      LEFT JOIN ShippingAddress AS sa ON sa.id = o.shippingAddressId\
      LEFT JOIN Address AS a ON sa.addressId = a.id\
      WHERE c.deliveryDate IS NULL  \
      AND o.status = 1 AND c.dealerId IS NULL \
      AND c.status = 1 AND c.pipelineId <> 6 \
      AND c.deliveryAt IS NOT NULL \
      AND c.deliveryAt < NOW()\
      AND DATEDIFF(CURRENT_TIMESTAMP, c.createdAt) >= 2 \
      ORDER BY c.createdAt;')

      if (orders.length === 0) {
        // Morning
        // order = await db.query('SELECT c.*, od.productCode AS code, od.id AS orderDetailId, od.quantity, od.`size`, o.shippingAddressId, a.lat, a.lng 
        // FROM Calzzamovil AS c 
        // LEFT JOIN `Order` AS o ON o.id = c.orderId
        // LEFT JOIN OrderDetail AS od ON od.orderId = o.id 
        // LEFT JOIN ShippingAddress AS sa ON sa.id = o.shippingAddressId
        // LEFT JOIN Address AS a ON sa.addressId = a.id
        // LEFT JOIN CalzzamovilDetail AS cd ON cd.calzzamovilId = c.id
        // WHERE c.deliveryDate IS NULL  
        // AND o.status = 1 AND c.dealerId IS NULL 
        // AND c.status = 1 AND c.pipelineId <> 6 
        // AND cd.id IS NULL
        // AND HOUR(c.createdAt) BETWEEN 14 AND 23
        // AND CURRENT_TIMESTAMP() >= c.deliveryAt AND c.deliveryAt IS NOT NULL 
        // ORDER BY c.createdAt;')
      }

      if (orders.length > 0) {
        orders.forEach(product => {
          product.size = Number(product.size)
          product.stock = { status: true }
          product.orderId = product.orderId
        })

        console.time('LocationsService')
        let locationResponse = await Utils.request({
          url: configs.HOST + ':' + configs.PORT + '/api/products/locations',
          method: 'POST',
          json: true,
          body: {
            data: {
              deliveryZip: '80000',
              products: orders
            }
          }
        })

        console.timeEnd('LocationsService')

        if (locationResponse !== null && locationResponse !== undefined && locationResponse.body !== null && locationResponse.body !== undefined && locationResponse.body.length > 0) {
          await Utils.asyncForEach(locationResponse.body, async (location) => {
            location.locations.forEach(element => {
              if (stores.some((store) => store.branch === element.branch)) {
                let foundIndex = stores.findIndex(store => store.branch === element.branch)
                stores[foundIndex].productsCode.push({ code: element.sku, size: element.size, stock: element.stock })
                stores[foundIndex].products++
              } else {
                stores.push({ branch: element.branch, productsCode: [{ code: element.sku, size: element.size, stock: element.stock }], products: 1, lat: element.lat, lng: element.lng })
              }
            })
          })
          // Fill in the product's Array with products from orders  .
          orders.map((element) => { products.push({ calzzamovilId: element.id, code: element.code, size: element.size, orderId: element.orderId, calzzapatoCode: element.calzzapatoCode, quantity: element.quantity, lat: element.lat, lng: element.lng, shippingAddressId: element.shippingAddressId }) })

          // Call recursiveMethod.
          let actions = await calzzamovil.getRoute({ db: db, houses: houses, stores: stores, products: products, recolected: 0, maxProducts: MAX_PRODUCTS, lat: data.lat, lng: data.lng, response: [] })
          if (actions.length > 0) {
            // Save in DB
            await Utils.asyncForEach(actions, async (action) => {
              if (action.branch !== undefined && action.branch !== null) {
                // Store
                let products = JSON.stringify(action.productsCode)
                let calzzapatoCodes = action.productsCode.map((product) => { return product.calzzapatoCode })
                await db.query('INSERT INTO `CalzzamovilRoute` (`branch`, products) VALUES (?, ?);', [action.branch, products])

                await Utils.asyncForEach(action.productsCode, async (product) => {
                  await db.query('INSERT INTO CalzzamovilDetail(calzzamovilId, storeId, quantity) VALUES(?, ?, ?);', [product.calzzamovilId, action.branch, 1])
                })

                // 1.- Sacar telefonos de mongo.
                let stores = await mongodb.mongoFind(mongoDB, 'Store', {
                  code: action.branch
                })
                // 2.- Iterar arreglo de numeros.
                if (stores !== undefined && stores !== null && stores.length > 0) {
                  if (typeof stores[0].phone === 'string') {
                    // Calzzamovil.sendMessageToStore(db, { calzzamovilId: bestStore.calzzamovilId, phone: typeof stores[0].phone })
                    Calzzamovil.sendMessageToStore(db, { orders: calzzapatoCodes, phone: '6727250809' })
                  } else {
                    stores[0].phone.forEach(phone => {
                      // Calzzamovil.sendMessageToStore(db, { calzzamovilId: bestStore.calzzamovilId, phone: typeof stores[0].phone })
                      Calzzamovil.sendMessageToStore(db, { orders: calzzapatoCodes, phone: '6727250809' })
                    })
                  }
                }
                // 2.1.- Mandar notificación.
                //Calzzamovil.sendMessageToStore(db, { orders: calzzapatoCodes, phone: '6727250809' })

              } else {
                // House
                await db.query('INSERT INTO `CalzzamovilRoute` (orderId) VALUES (?);', [action.orderId])
              }
            })
            response.success = true
          } else {
            response.message = 'No hay movimientos.'
          }
        }
      }
    } catch (error) {
      console.log(error)
      error = error

    }

    if (!error) {
      await db.commit()
    } else {
      await db.rollback()
    }

    await db.close()
    return response
  }

  Order.remoteMethod('getRoute2', {
    description: 'Get all the route that the delivery man must do (Cronjob).',
    http: {
      path: '/calzzamovil/all-route',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.getNextPoint = async (data, req) => {

    let response = { orders: [] }

    const db = mysql.connectToDBManually()

    try {
      let point = await db.query('SELECT * FROM CalzzamovilRoute WHERE status = 1 LIMIT 1;', [req.headers.user.id])
      // let point = await db.query('SELECT * FROM CalzzamovilRoute WHERE dealerId = ? AND status = 1 LIMIT 1 ;', [req.headers.user.id])
      if (point !== undefined && point !== null && point.length > 0) {
        point = point[0]
        if (point.products !== undefined && point.products !== null) {
          // Store
          let products = JSON.parse(point.products)
          await Utils.asyncForEach(products, async (product) => {
            let information = await calzzamovil.sendInfoForTracking(db, product.orderId, 'store', point.branch)
            response.orders.push(information)
          })
        } else {
          // House
          let information = await calzzamovil.sendInfoForTracking(db, point.orderId, 'house', undefined)
          response.orders.push(information)
        }
      }
    } catch (error) {
      console.log(error)
      error = error
    }
    await db.close()
    return response
  }

  Order.remoteMethod('getNextPoint', {
    description: 'Get all the route that the delivery man must do.',
    http: {
      path: '/calzzamovil/next-point',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Order.verifyOrder = async function (data) {
    let response = { valid: false }
    let db = await mysql.connectToDBManually()
    try {
      if (data.folio !== null && data.folio !== undefined && data.folio !== -1) {
        let orderResponse = await db.query('SELECT id FROM `Order` WHERE `order` = ? OR calzzapatoCode = ? LIMIT 1;', [data.folio, data.folio])
        await db.close()
        if (orderResponse.length > 0) {
          response.valid = true
          response.folio = data.folio
        }
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  Order.remoteMethod('verifyOrder', {
    description: 'Check if exist an order by order or calzzapatoCode',
    http: {
      path: '/verify-order',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.getOrderDetailInformation = async function (id) {
    let response = { information: null, shippingMethods: [] }
    let shippingMethod = {}
    let db = await mysql.connectToDBManually()
    const mdb = mongodb.getConnection('db')

    try {
      if (id !== null && id !== undefined) {

        // Get all the order information
        let orderInformation = await tracking.getOrderInformation(db, id)

        if (orderInformation.length > 0) {
          // Get main information.
          response.information = await tracking.mainInformation(orderInformation[0])

          if (Number(orderInformation[0].shippingMethodId) !== CLICK_AND_COLLECT) {
            let address = await tracking.addressFormat(orderInformation[0])
            response.information.address = address
          }

          let orderDetail = await db.query('SELECT productCode, productDescription, `size`, unitPrice, subtotal FROM OrderDetail WHERE orderId = ?;', [orderInformation[0].id])
          if (orderDetail.length > 0) {

            await Utils.asyncForEach(orderDetail, async (detail, index) => {
              let photos = await mongodb.mongoFind(mdb, 'Product', {
                code: detail.productCode
              })

              let url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/"
              if (photos.length > 0) {
                if (photos[0].photos.length > 0) {
                  url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/" + photos[0].photos[0].description
                }
              }

              orderDetail[index]["productImage"] = url

            })

            orderInformation[0].products = orderDetail
            let calzzapatoStatus = await tracking.calzzamovilStatus(response.information.folio)
            let shippingMethods = {
              shippingMethodId: orderInformation[0].shippingMethodId,
              shippingMethodName: orderInformation[0].shippingMethodName,
              shippingCost: orderInformation[0].shippingCost,
              callCenter: {
                cellphone: 1234567890,
              },
              // statusArray: [{ id: 2, status: true, name: 'Pagado' }, { id: 3, status: false, name: 'Procesando' }, { id: 5, status: false, name: 'Enviado' }, { id: 4, status: false, name: 'Por enviar' }],
              statusArray: calzzapatoStatus,
              currentStatus: 2,
              products: orderDetail
            }
            // Put foreach when change to checkout2.
            switch (Number(orderInformation[0].shippingMethodId)) {
              case CALZZAMOVIL:
                let calzzamovilOrder = await db.query('SELECT dealerId, pipelineId FROM Calzzamovil WHERE orderId = ?;', [orderInformation[0].id])
                let statusArray = await db.query('SELECT * FROM CalzzamovilPipeline WHERE status = 1;')
                let backofficeDB = await calzzamovil.getBackofficeDataBase()
                // Get dealer information.
                if (backofficeDB !== null && backofficeDB !== undefined && calzzamovilOrder.length > 0) {
                  let dealerInfo = await backofficeDB.query('SELECT id, name, firstLastName, secondLastName FROM `User` WHERE id = ?;', [calzzamovilOrder[0].dealerId])
                  if (calzzamovilOrder[0].pipelineId > 4) {
                    shippingMethods.calzzamovilArray = [statusArray[(calzzamovilOrder[0].pipelineId) - 1]]
                  } else {
                    shippingMethods.calzzamovilArray = statusArray
                  }

                  shippingMethods.calzzamovilStatus = calzzamovilOrder[0].pipelineId
                  await backofficeDB.close()
                  if (dealerInfo.length > 0) {
                    shippingMethods.dealer = dealerInfo[0].name + ' ' + dealerInfo[0].firstLastName + ' ' + dealerInfo[0].secondLastName
                  } else {
                    shippingMethods.dealer = 'Aun no asignado.'
                  }
                }
                break
              case CLICK_AND_COLLECT:
                let store = await mongodb.mongoFind(mdb, 'Store', { code: orderInformation[0].clickAndCollectStoreId })
                if (store.length > 0) {
                  store = {
                    code: store[0].code,
                    name: store[0].name,
                    street: store[0].street,
                    exteriorNumber: store[0].exteriorNumber,
                    location: store[0].location,
                    zip: store[0].zip,
                    reference: store[0].reference,
                    municipality: store[0].municipality,
                    state: store[0].state,
                    lat: store[0].lat,
                    lng: store[0].lng
                  }
                  shippingMethods.store = store
                }
                break
              default:
                let trackingFolio = await db.query('SELECT trackingNumber FROM OrderShipping WHERE orderId = ?;', [orderInformation[0].id])
                if (trackingFolio.length > 0) {
                  let tracckingArray = await tracking.getEnviaTracking(trackingFolio[0].trackingNumber)
                  shippingMethods.tracking = tracckingArray
                }
                break
            }
            response.shippingMethods = [shippingMethods]
          }
        }

      }
    } catch (error) {
      console.log(error)
    }
    await db.close()
    return response
  }

  Order.remoteMethod('getOrderDetailInformation', {
    description: 'Get all the order information for tracking.',
    http: {
      path: '/:id/detail-information/',
      verb: 'GET'
    },
    accepts: [
      { arg: 'id', type: 'number', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.getInfoGuide = async function (data) {
    let response = { information: null }
    let db = await mysql.connectToDBManually()

    // ARREGLO FIJO 
  //   let trackingResponse = {
  //     data:[{
  //       id: 5521717,
  //       tracking_number: "284426522534",
  //       folio: null,
  //       status: "Created",
  //       carrier_id: 1,
  //       name: "fedex",
  //       service: "ground",
  //       created_at: "2021-10-01 13:14:21",
  //       delivered_at: null,       
  //       total: 150,
  //       grand_total: 150,
  //       label_file: "https://s3.us-east-2.amazonaws.com/enviapaqueteria/uploads/fedex/2844265225346002861574ffdca7b0.pdf",
  //       evidence_file: "https://s3.us-east-2.amazonaws.com/enviapaqueteria/uploads/shipments/evidences/fedex/284426522534.pdf",
  //       created_by_name: "Cristian Sainz",
  //       created_by_email: "Tiendavirtual02@calzzapato.com",
  //     }]
  // }



    try {

      let trackingResponse  =  await tracking.getEnviaTrackingSingleShipping(data.id)
      let getEnviaTracking = await tracking.getEnviaTracking(data.id)
      //console.log(getEnviaTracking.ship, "getEnviaTracking -----------");
      // onsole.log(trackingResponse, "trackingResponse -----------");
      if (data.id != undefined && data.id != "" && data.id != null && data.id > 0 && trackingResponse.data != undefined && trackingResponse.data.length > 0 && trackingResponse.data != undefined && getEnviaTracking.ship != undefined) {
        let carrier = await db.query('SELECT * FROM Carrier WHERE  name =?;', [getEnviaTracking.ship.carrier])

        let insertShippingOrder = await db.query('INSERT INTO OrderShipping(`orderId`, `carrierId`, `trackingNumber`, `trackUrl`, `label`, `totalPrice`, `service`, `deliveryDate`, `pickupDate`, `timeFrom`, `timeTo`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [

          data.calzzapatoCode,
          carrier[0].id,
          trackingResponse.data[0].trackingNumber,
          trackingResponse.data[0].trackUrl,
          trackingResponse.data[0].label_file,
          trackingResponse.data[0].total,
          trackingResponse.data[0].service,
          getEnviaTracking.ship.deliveryDate,
          getEnviaTracking.ship.pickupDate,
          trackingResponse.data[0].createdAt,
          trackingResponse.data[0].createdAt,
          getEnviaTracking.ship.createdAt,
          getEnviaTracking.ship.createdAt,
          
        ])


          response.information = true
          response.trackingNumber = trackingResponse.data[0].trackingNumber,
          response.estimatedDelivery =  getEnviaTracking.ship.estimatedDelivery
      }
    } catch (error) {
      console.log(error);
    }

    await db.close()
    return response
  }


  Order.remoteMethod('getInfoGuide', {
    description: 'Get guide number .',
    http: {
      path: '/info-guide',
      verb: 'POST'
    },
    accepts: [{
      arg: 'data', type: 'object', http: { source: 'body' }, required: true
    }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Order.mailTracking = async (data) => {

    let response = []
    let db = mysql.connectToDBManually()

    let orderSelected = await db.query(
      'SELECT u.`name`, i.alias, i.id AS instanceId, u.email,i.uuid AS uuid\
    FROM `Order` AS o\
    LEFT JOIN `Instance` AS i ON i.id = o.instanceId\
    LEFT JOIN `User` AS u ON u.id = o.userId\
    WHERE calzzapatoCode = ?;', [data.calzzapatoCode])

    if (orderSelected.length > 0 && orderSelected !== undefined) {

      try {

        let mail = {
          email: orderSelected[0].email,
          name: orderSelected[0].name,
          trackingNumber: data.trackingNumber,
          message: "Estamos preparando tu pedido",
          sms: true,
          estimatedDelivery: data.estimatedDelivery,
          uuid: orderSelected[0].uuid,
          subjectTitle: `Rastreo de pedido`
        }
       

        mailTrackingClasses.sendTrackingEmail(mail)

      } catch (error) {
        console.log(error);
      }
    }
    await db.close()

  }


  Order.remoteMethod('mailTracking', {
    description: 'Sending email tracking',
    http: {
      path: '/email-tracking',
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
}
