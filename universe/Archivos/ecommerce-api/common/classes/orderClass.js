'use strict'
const Distance = require('geo-distance')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../../common/configs.' + NODE_ENV + '.json')
const Utils = require('../Utils.js')
const mysql = require('./mysql.js')
const mongodb = require('./mongodb.js')
const calzzamovil = require('./calzzamovil')
const shippingMethods = require('./shippingMethods.js')
const convert = require('xml-js')
const openpay = require('../classes/openpay.js')
const netpay = require('../classes/netpay')
const conekta = require('../classes/conekta.js')
const paypal = require('../classes/paypal.js')


const { payments } = require('@paypal/checkout-server-sdk')


let environment = '../../server/datasources.development.json'
if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}

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

const datasources = require(environment)

const getCheckout = async (data, headers) => {
  let response = null
  try {
    let checkout = await Utils.request({
      url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/checkout/detail',
      method: 'POST',
      json: true,
      body: {
        data: data
      },
      headers: {
        uuid: headers.uuid,
        authorization: headers.authorization,
        metadata: headers.metadata,
        zip: ''
      }
    })
    if (checkout.body !== null && checkout.body !== undefined) {
      response = checkout.body
    }

  } catch (error) {
    console.log(error)
  }
  return response
}

const disabledOrder = async (db, userId, orderId) => {
  let response = { disabled: false }
  try {

    // Obtener última orden del usuario
    let users = await db.query('SELECT `lastOrderId` FROM `User` WHERE id = ? AND `status` = 1 LIMIT 1;', [
      userId
    ])
    let lastOrderId = users[0].lastOrderId

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
    await db.query('UPDATE `User` SET `lastOrderId` = ? WHERE `id` = ?;', [orderId, userId])

    response.disabled = true
  } catch (error) {
    console.log(error)
  }
  return response
}

const makePayment = async (db, orderId, paymentMethod, user, data) => {

  // Métodos de pago disponibles
  const BBVA_PAY = 1
  const CREDIVALE_PAY = 2
  const OXXO_PAY = 3
  const PAYPAL = 4
  const NETPAY = 5
  const MERCADOPAGO = 8
  const OPENPAY = 9
  const PAYNET = 10
  let response = { created: false }
  try {
    switch (paymentMethod) {
      case OPENPAY:
        // Validar si es primera compra
        let cards = await db.query('SELECT * FROM PaymentOpenPay WHERE cardId = ? AND openpayStatus = ?;', [data.paymentMethod.card.id, 'completed'])
        let cardInformation = await db.query('SELECT * FROM Card WHERE id = ?;', [data.paymentMethodSelected.cards[0].id])
        if (cardInformation.length > 0) {
          cardInformation = cardInformation[0]
        }
        let secureCode = true
        if (cards.length > 0) {
          secureCode = false
        }

        // Armar objeto para hace compra con openpay.
        let dataOpenpay = {
          tokenCard: JSON.parse(cardInformation.token).id,
          name: user.name,
          firstLastName: user.firstLastName,
          secondLastName: user.secondLastName,
          cellphone: user.cellphone,
          email: user.email,
          deviceId: data.deviceId,
          amount: Number.parseFloat(data.total).toFixed(3),
          orderId: orderId,
          secureCode: secureCode
        }
        let responseOpenpay = await openpay.createOpenpayOrder(dataOpenpay)
        if (responseOpenpay.success) {
          response.created = true
          response.paymentWay = 'openpay'

          if (responseOpenpay.response !== undefined && responseOpenpay.response.status === 'completed') {
            await db.query("INSERT INTO PaymentOpenPay (orderId, cardId, JSONresponse, openpayStatus) VALUES (?, ?, ?, ?);", [
              orderId,
              cardInformation.id,
              JSON.stringify(responseOpenpay.response),
              "completed"
            ])
            await db.query('UPDATE `Order` SET `pipeline` = 2, `paymentAttempts` = 1, `shoppingDate` = ?, `calzzapatoCode` = -1 WHERE `id` = ?', [
              new Date(),
              orderId
            ])
            await Utils.request({
              url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + orderId,
              method: 'POST'
            })

          } else {
            await db.query("INSERT INTO PaymentOpenPay (orderId, cardId, JSONresponse, openpayStatus, paymentId) VALUES (?, ?, ?, ?, ?);", [
              orderId,
              cardInformation.id,
              JSON.stringify(responseOpenpay.response),
              "charge_pending",
              responseOpenpay.response.id
            ])
            response.url = responseOpenpay.response.payment_method.url

          }
        }
        break
      case PAYNET:
        let dataPaynet = {
          email: user.email,
          name: user.name + ' ' + user.firstLastName + ' ' + user.secondLastName,
          total: Number.parseFloat(data.total).toFixed(3),
          orderId: orderId
        }
        let responsePaynet = await openpay.createPaynetOrder(dataPaynet)
        if (responsePaynet.success) {
          response.paymentWay = 'paynet'
          response.created = true
          openpay.sendEmail({ amount: dataPaynet.total, email: dataPaynet.email, name: dataPaynet.name, ticket: responsePaynet.order.ticket, reference: responsePaynet.order.payment_method.reference, barcode: responsePaynet.order.payment_method.barcode_url })
          await db.query('INSERT INTO PaymentPaynet (orderId, paynetId, paynetStatus, paynetCustomer, ticket, requestJSON) VALUES (?, ?, ?, ?, ?, ?);', [
            orderId,
            responsePaynet.order.id,
            responsePaynet.order.status,
            responsePaynet.order.customer_id,
            responsePaynet.order.ticket,
            JSON.stringify(responsePaynet.order)
          ])
          response.ticket = responsePaynet.order.ticket

        } else {
          throw messagesError.errorToCreateOrderPayPal
        }
        break
      case NETPAY:
        // if (shippingMethod === CLICK_AND_COLLECT) {
        //   data.address = {
        //     street: storeAddress.street,
        //     exteriorNumber: storeAddress.exteriorNumber,
        //     interiorNumber: storeAddress.interiorNumber,
        //     type: 'Colonia',
        //     location: storeAddress.suburb,
        //     zip: storeAddress.zip,
        //     street: storeAddress.street,
        //     municipality: storeAddress.zone.name,
        //     state: Utils.isEmpty(storeAddress.state) ? storeAddress.zone.stateCode : storeAddress.state
        //   }
        // }
        let cardInformationNetpay = await db.query('SELECT * FROM Card WHERE id = ?;', [data.paymentMethodSelected.cards[0].id])
        if (cardInformationNetpay.length > 0) {
          cardInformationNetpay = cardInformationNetpay[0]
        }
        data.checkout.prices = {
          total: Number(data.total)
        }
        data.card = {
          token: JSON.parse(cardInformationNetpay.token)
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
                  cardInformationNetpay.id,
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
                response.created = true
                response.paymentWay = 'netpay'
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

            // await db.commit()
          } else {
            throw messagesError.errorToCreateOrderNetPay
          }
        } else {
          throw messagesError.errorToCreateOrderNetPay
        }
        break

      case OXXO_PAY:
        console.log('Data OXXO_PAY', data);
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
        // if (shippingMethod === CLICK_AND_COLLECT) {
        if (false) {
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
        if (data.checkout.coupon !== null && data.checkout.coupon !== undefined) {
          discountLines = [{
            type: "coupon",
            code: data.checkout.coupon.name,
            amount: Math.floor(data.checkout.prices.discount.toFixed(2) * 100)
          }]
        }

        // if (data.checkout.bluePoints.conditions.exchange && data.checkout.bluePoints.exchange > 0) {
        if (data.paymentInfo.bluePointsExchange !== null && data.paymentInfo.bluePointsExchange !== undefined && Number(data.paymentInfo.bluePointsExchange) > 0) {
          discountLines.push({
            type: "loyalty",
            code: 'monederoazul',
            amount: Math.floor(Number(data.paymentInfo.bluePointsExchange).toFixed(2) * 100)
          })
        }

        let dataOrder = {
          "line_items": oxxoPayCart,
          "discount_lines": discountLines,
          "shipping_lines": [{
            "amount": Math.floor(Number(data.paymentInfo.shippingCost).toFixed(2) * 100),
            "carrier": 'ENVÍO '
          }],
          "currency": "MXN",
          "customer_info": {
            "name": user.name,
            "email": user.email,
            "phone": user.cellphone
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
        console.log('orderOxxoPay', orderOxxoPay)
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
          response.created = true
          response.paymentWay = 'oxxopay'

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
        break

      case PAYPAL:
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

        let total = Number.parseFloat(data.total).toFixed(2)
        // let subtotal = (data.checkout.prices.subtotal + data.checkout.prices.recharge)
        let subtotal = Number.parseFloat(data.total).toFixed(2)
        // subtotal = subtotal.toFixed(2)

        // let discount = data.checkout.prices.discount
        // if (data.checkout.bluePoints.conditions.exchange && data.checkout.bluePoints.exchange > 0) {
        //   discount += data.checkout.bluePoints.exchange
        // }
        // discount.toFixed(2)
        let discount = 0

        console.log('SOY DATA ', data)
        let addressDescription2 = ''
        let shippingAddress = null
        // if (shippingMethod === CLICK_AND_COLLECT) {
        if (false) {
          addressDescription2 = storeAddress.street + ' #' + storeAddress.exteriorNumber + '' + ((!Utils.isEmpty(storeAddress.interiorNumber)) ? ' - ' + storeAddress.interiorNumber : '') + ', ' + storeAddress.suburb
          shippingAddress = {
            name: {
              full_name: user.name
            },
            address: {
              address_line_1: addressDescription2.toUpperCase(),
              address_line_2: "",
              admin_area_2: storeAddress.zone.name.toUpperCase(),
              admin_area_1: Utils.isEmpty(storeAddress.state) ? storeAddress.zone.stateCode : storeAddress.state.toUpperCase(),
              postal_code: storeAddress.zip,
              country_code: "MX"
            }
          }
        } else {
          addressDescription2 = data.address.street + ' #' + data.address.exteriorNumber + '' + ((!Utils.isEmpty(data.address.interiorNumber)) ? ' - ' + data.address.interiorNumber : '') + ', ' + data.address.type + ' ' + data.address.location
          shippingAddress = {
            name: {
              full_name: data.address.name
            },
            address: {
              address_line_1: addressDescription2.toUpperCase(),
              address_line_2: "",
              admin_area_2: data.address.municipality.toUpperCase(),
              admin_area_1: data.address.state.toUpperCase(),
              postal_code: data.address.zip,
              country_code: "MX"
            }
          }
        }

        let paypaObject = {
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
            reference_id: data.order,
            shipping_method: 'ENVIO CALZZAPATO.',
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
                  value: (data.paymentInfo.shippingCost !== null && data.paymentInfo.shippingCost !== undefined) ? data.paymentInfo.shippingCost : '0.00',
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
        }
        let responsePayPal = await paypal.createPayPalOrder(paypaObject)
        console.log('responsePayPal', responsePayPal)

        if (responsePayPal.success) {
          response.paypal = responsePayPal.order.result
          response.created = true

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
        break


      case CREDIVALE_PAY:

        await db.query('INSERT INTO `PaymentCrediVale` (`orderId`, `folio`, `amount`, `orderAmount`, `folioIne`) VALUES (?, ?, ?, ?, ?);', [
          orderId,
          data.vale.folio,
          Number(data.vale.amount),
          data.checkout.prices.total,
          data.vale.ine
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
        }

        response.credivale = data.vale
        await db.commit()

        await Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + orderId,
          method: 'POST'
        })


        break
    }



  } catch (error) {
    console.log(error)
  }
  return response
}

module.exports = ({
  getCheckout,
  disabledOrder,
  makePayment
})
