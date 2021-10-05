'use strict'

const Utils = require('../Utils.js')
const convert = require('xml-js')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')
const mysql = require('../classes/mysql.js')
const netpay = require('../classes/netpay.js')
const paypal = require('../classes/paypal.js')
const Calzzamovil = require('../classes/calzzamovil.js')
const { clouddebugger } = require('googleapis/build/src/apis/clouddebugger')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

module.exports = function (Payment) {
  const BBVA_PAY = 1
  const CREDIVALE_PAY = 2
  const OXXO_PAY = 3
  const PAYPAL = 4
  const NETPAY = 5

  const FREE_DELIVERY = 1
  const DELIVERY = 2
  const CLICK_AND_COLLECT = 3
  const CALZZAMOVIL = 4

  Payment.bancomerSuccess = async (data, res) => {
    let responseOrder = null

    const db = mysql.connectToDBManually()
    
    try {
      await db.beginTransaction()

      responseOrder = await db.query('SELECT o.*, u.name, u.firstLastName, u.secondLastName, u.email, u.cellphone, u.phone, u.calzzapatoUserId FROM `Order` AS o INNER JOIN `User` AS u ON o.userId = u.id WHERE o.order = ? LIMIT 1;', [
        data.mp_order
      ])

      responseOrder = responseOrder[0]

      let shoppingDetail = await db.query('SELECT * FROM `OrderDetail` WHERE orderId = ? AND status = 1;', [responseOrder.id])

      let bodyShoppingDetail = ''
      shoppingDetail.forEach(function (detail) {
        bodyShoppingDetail += '<cCompra>'
        bodyShoppingDetail += '<Articulo>' + detail.productArticleCode + '</Articulo>'
        bodyShoppingDetail += '<Cantidad>' + detail.quantity + '</Cantidad>'
        bodyShoppingDetail += '<ImporteUnitario>' + detail.unitPrice + '</ImporteUnitario>'
        bodyShoppingDetail += '<SubTotal>' + detail.subtotal + '</SubTotal>'
        bodyShoppingDetail += '<Descuento>0</Descuento>'
        bodyShoppingDetail += '<Total>' + detail.subtotal + '</Total>'
        if (!Utils.isEmpty(detail.pointsCode) && Number(responseOrder.calzzapatoUserId) > 0) {
          bodyShoppingDetail += '<IDPromocion_eMonedero>' + detail.pointsCode + '</IDPromocion_eMonedero>'
          bodyShoppingDetail += '<Puntos_GanaPorcentaje>' + Number(detail.pointsWinPercentage).toFixed(0) + '</Puntos_GanaPorcentaje>'
          bodyShoppingDetail += '<Puntos_Gana>' + detail.pointsWin + '</Puntos_Gana>'
        }
        if (Number(detail.pointsExchange) > 0) {
          bodyShoppingDetail += '<Puntos_Paga>' + detail.pointsExchange + '</Puntos_Paga>'
        }
        bodyShoppingDetail += '</cCompra>'
      })

      let shippingMethod = Number(responseOrder.shippingMethodId)

      let responseAddress = null
      if (shippingMethod === FREE_DELIVERY || shippingMethod === DELIVERY || shippingMethod === CALZZAMOVIL) {
        responseAddress = await db.query("SELECT a.*, sa.name AS receiverName, sa.lastName AS receiverLastName, sa.phone AS receiverPhone, sa.reference, s.name AS state, m.name AS municipality, l.name AS suburb FROM `Address` AS a INNER JOIN `ShippingAddress` AS sa ON a.id = sa.addressId INNER JOIN `State` AS s ON s.code = a.stateCode INNER JOIN `Municipality` AS m ON a.municipalityCode = m.municipalityStateCode INNER JOIN `Location` AS l ON a.locationCode = l.locationMunicipalityStateCode WHERE sa.id = ? LIMIT 1;", [
          responseOrder.shippingAddressId
        ])
      }

      let bodyShipping = '<bEnvio>0</bEnvio>\
        <Estado></Estado>\
        <Municipio></Municipio>\
        <Colonia></Colonia>\
        <CP></CP>\
        <Calle></Calle>\
        <NumeroInt></NumeroInt>\
        <NumeroExt></NumeroExt>\
        <Observacion></Observacion>'

      if (shippingMethod === FREE_DELIVERY || shippingMethod === DELIVERY || shippingMethod === CALZZAMOVIL) {
        responseAddress = responseAddress[0]
        let observations = ''
        if (!Utils.isEmpty(responseAddress.betweenStreets)) {
          observations = responseAddress.betweenStreets
        }

        if (!Utils.isEmpty(responseAddress.reference)) {
          if (!Utils.isEmpty(responseAddress.betweenStreets)) {
            observations = responseAddress.betweenStreets + " - " + responseAddress.reference
          }
          else {
            observations = responseAddress.reference
          }
        }

        bodyShipping = ''
        bodyShipping += '<bEnvio>1</bEnvio>'
        bodyShipping += '<Estado>' + responseAddress.state + '</Estado>'
        bodyShipping += '<Municipio>' + responseAddress.municipality + '</Municipio>'
        bodyShipping += '<Colonia>' + responseAddress.suburb + '</Colonia>'
        bodyShipping += '<CP>' + responseAddress.zip + '</CP>'
        bodyShipping += '<Calle>' + responseAddress.street + '</Calle>'
        bodyShipping += '<NumeroInt>' + responseAddress.interiorNumber + '</NumeroInt>'
        bodyShipping += '<NumeroExt>' + responseAddress.exteriorNumber + '</NumeroExt>'
        bodyShipping += '<Observacion>' + observations + '</Observacion>'
      }

      let userFullName = (responseOrder.name + " " + responseOrder.firstLastName + " " + responseOrder.secondLastName).trim()
      let phoneNumber = responseOrder.phone
      if (!Utils.isEmpty(responseOrder.cellphone))
        phoneNumber = responseOrder.cellphone

      if (Utils.isEmpty(phoneNumber)) {
        phoneNumber = '9999999999'
      }

      let bluePointsParam = ''
      if (Number(responseOrder.calzzapatoUserId) > 0) {
        bluePointsParam = '<IdUsuarioMonedero>' + responseOrder.calzzapatoUserId + '</IdUsuarioMonedero>'
      }

      let IdOpcionEnvio = '1'
      let clickAndCollectParam = '<RecogerNumSucursal>0</RecogerNumSucursal>'

      let receiverData = ''
      if (shippingMethod === FREE_DELIVERY || shippingMethod === DELIVERY || shippingMethod === CALZZAMOVIL) {
        let receiver = responseAddress.receiverName + ' ' + responseAddress.receiverLastName
        receiver = receiver.trim()
        receiverData = '<EntregarANombre>' + receiver + '</EntregarANombre><EntregarATelefono>' + responseAddress.receiverPhone + '</EntregarATelefono>'
      }

      if (shippingMethod === CLICK_AND_COLLECT) {
        IdOpcionEnvio = '2'
        clickAndCollectParam = '<RecogerNumSucursal>' + responseOrder.clickAndCollectStoreId + '</RecogerNumSucursal>'
      } else if (shippingMethod === CALZZAMOVIL) {
        IdOpcionEnvio = '3'
      }

      let body = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <RegistraVentaProveedor xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <IdCliente>' + responseOrder.userId + '</IdCliente>\
            <IdVenta>' + Number(responseOrder.order) + '</IdVenta>\
            <Compras>' + bodyShoppingDetail + '</Compras>\
            <Envio>' + bodyShipping + '</Envio>\
            <ClienteNombre>' + userFullName + '</ClienteNombre>\
            <ClienteTelefono>' + phoneNumber + '</ClienteTelefono>\
            <ClienteEmail>' + responseOrder.email + '</ClienteEmail>\
            <IdProveedor>' + configs.shoppingProvider + '</IdProveedor>\
            <FolioAutorizacion>' + data.mp_authorization + '</FolioAutorizacion>' + bluePointsParam + '' + clickAndCollectParam + '' + receiverData + '\
            <IdOpcionEnvio>' + IdOpcionEnvio + '</IdOpcionEnvio>\
          </RegistraVentaProveedor>\
        </soap:Body>\
      </soap:Envelope>'
      
      console.log('CALZZAPATO SYNC BODY')
      console.log(body)

      let clzWebService = await Utils.request({
        url: configs.webServiceVentaPublicoURL + '?op=RegistraVentaProveedor',
        method: 'POST',
        headers: {
          "content-type": "text/xml"
        },
        body: body
      })

      console.log('CalzzapatoWebService')
      console.log(clzWebService)

      let result = convert.xml2json(clzWebService.body, { compact: true, spaces: 4 })
      result = JSON.parse(result)
      let number = result['soap:Envelope']['soap:Body']['RegistraVentaProveedorResponse']['RegistraVentaProveedorResult']['Numero']['_text']

      let paymentAttempts = (responseOrder.paymentAttempts + 1)

      await db.query('UPDATE `Order` SET calzzapatoCode = ?, shoppingDate = ?, paymentAttempts = ?, pipeline = 2 WHERE id = ?;', [
        Number(number),
        new Date(),
        paymentAttempts,
        responseOrder.id
      ])

      await db.query('INSERT INTO `PaymentBBVA` (orderId, mp_account, mp_order, mp_reference, mp_node, mp_concept, mp_amount, mp_currency, mp_paymentMethod, mp_paymentMethodCode, mp_paymentMethodcomplete, mp_response, mp_responsecomplete, mp_responsemsg, mp_responsemsgcomplete, mp_authorization, mp_authorizationcomplete, mp_pan, mp_pancomplete, mp_date, mp_signature, mp_customername, mp_promo_msi, mp_bankcode, mp_saleid, mp_sale_historyid, mp_trx_historyid, mp_trx_historyidComplete, mp_bankname, mp_folio, mp_cardholdername, mp_cardholdernamecomplete, mp_authorization_mp1, mp_phone, mp_email, mp_promo, mp_promo_msi_bank, mp_securepayment, mp_cardType, mp_platform, mp_contract, mp_cieinter_clabe, mp_commerceName, mp_commerceNameLegal, mp_cieinter_reference, mp_cieinter_concept, mp_sbtoken, success) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [
        responseOrder.id,
        data.mp_account,
        data.mp_order,
        data.mp_reference,
        data.mp_node,
        data.mp_concept,
        data.mp_amount,
        data.mp_currency,
        data.mp_paymentMethod,
        data.mp_paymentMethodCode,
        data.mp_paymentMethodcomplete,
        data.mp_response,
        data.mp_responsecomplete,
        data.mp_responsemsg,
        data.mp_responsemsgcomplete,
        data.mp_authorization,
        data.mp_authorizationcomplete,
        data.mp_pan,
        data.mp_pancomplete,
        data.mp_date,
        data.mp_signature,
        data.mp_customername,
        data.mp_promo_msi,
        data.mp_bankcode,
        data.mp_saleid,
        data.mp_sale_historyid,
        data.mp_trx_historyid,
        data.mp_trx_historyidComplete,
        data.mp_bankname,
        data.mp_folio,
        data.mp_cardholdername,
        data.mp_cardholdernamecomplete,
        data.mp_authorization_mp1,
        data.mp_phone,
        data.mp_email,
        data.mp_promo,
        data.mp_promo_msi_bank,
        data.mp_securepayment,
        data.mp_cardType,
        data.mp_platform,
        data.mp_contract,
        data.mp_cieinter_clabe,
        data.mp_commerceName,
        data.mp_commerceNameLegal,
        data.mp_cieinter_reference,
        data.mp_cieinter_concept,
        data.mp_sbtoken,
        1
      ])

      await db.query('UPDATE `User` SET lastOrderId = null WHERE id = ?;', [
        responseOrder.userId
      ])

      if (responseOrder.shippingMethodId === CALZZAMOVIL) {
        // Es entrega express
        let calzzaMovilAddress = await db.query('SELECT sa.addressId FROM `ShippingAddress` AS sa WHERE sa.id = ?;', [
          responseOrder.shippingAddressId
        ])

        let calzzamovilResponse = await Calzzamovil.checkExpressDelivery(db, responseOrder.id, calzzaMovilAddress[0].addressId, responseOrder.paymentMethodId)

        if (calzzamovilResponse.status) {
          let createCalzzamovil = await db.query('INSERT INTO Calzzamovil (orderId, zoneId, scheduledId, cityMunicipalityStateCode) VALUES (?, ?, ?, ?);', [
            responseOrder.id,
            calzzamovilResponse.zoneId,
            calzzamovilResponse.scheduledId,
            calzzamovilResponse.cityId
          ])

          delete calzzamovilResponse.message
          calzzamovilResponse.id = createCalzzamovil.insertId

          // Notificar a los repartidores de la zona
          // Utils.request({
          //   host: configs.HOST_TRACKING_IP + ':' + configs.PORT_TRACKING + '/api/order/new',
          //   method: 'POST',
          //   json: true,
          //   data: calzzamovilResponse
          // })
          //Utils.sendNotification({ notificationType: 'NEW_ORDER', userRole: 'DEALERS', cityMunicipalityStateCode: calzzamovilResponse.cityId})

        }
      }

      await db.commit()

      await Utils.request({
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/' + responseOrder.id + '/email',
        method: 'POST'
      })

      await Utils.request({
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/' + responseOrder.order + '/ticket',
        method: 'POST',
        json: true,
        body: {
          cellphone: phoneNumber,
          message: 'COMPROBANTE DIGITAL CALZZAPATO: '
        }
      })

      let orders = await db.query('SELECT o.id AS orderId, o.fastShopping FROM `Order` AS o \
      LEFT JOIN OrderShipping AS os ON os.orderId = o.id\
      WHERE o.pipeline = 2 AND o.status = 1 AND o.paymentMethodId != 2 AND o.shippingMethodId = 2 AND os.id IS NULL AND o.id = ?;', [orderId])
      if (orders.length > 0) {
        Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/guide',
          method: 'POST',
          json: true,
          body: {
            "data": {
              "orderId": orders[0].orderId
            }
          }
        })
      }

      data.paymentWay = BBVA_PAY

      let fastShopping = false
      if (orders[0].fastShopping === 1) {
        fastShopping = true
      }
      await Utils.request({
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/order-logs/add',
        method: 'POST',
        json: true,
        body: {
          action: 'BUY',
          paymentStatus: 'success',
          action: { name: 'BUY', response: data },
          cart: !fastShopping,
          success: true,
          orderId: orders[0].orderId,
        }
      })
      await Utils.request({
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
        method: 'POST',
        json: true,
        body: {
          status: 'BUY',
          order: responseOrder.id,
          response: data
        },
        headers: {
          webhook: true,
          instanceId: responseOrder.instanceId,
          userId: responseOrder.userId
        }
      })
    } catch (err) {
      console.log(err)
      await db.rollback()
    }

    await db.close()

    let token = jwt.sign(responseOrder.order, configs.jwtPrivateKey)
    if (responseOrder.instanceId === 1) {
      res.redirect(configs.HOST_WEB_APP + '/resumen/exito?pago=bbva&token=' + token)
    } else if (responseOrder.instanceId === 2) {
      res.redirect(configs.HOST_WEB_APP_KELDER + '/resumen/exito?pago=bbva&token=' + token)
    } else if (responseOrder.instanceId === 3) {
      res.redirect(configs.HOST_WEB_APP_URBANNA + '/resumen/exito?pago=bbva&token=' + token)
    } else if (responseOrder.instanceId === 4) {
      res.redirect(configs.HOST_WEB_APP_CALZZASPORT + '/resumen/exito?pago=bbva&token=' + token)
    } else if (responseOrder.instanceId === 5) {
      res.redirect(configs.HOST_WEB_APP_CALZZAKIDS + '/resumen/exito?pago=bbva&token=' + token)
    }
  }

  Payment.remoteMethod('bancomerSuccess', {
    description: 'Success payment',
    http: {
      path: '/success',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' } },
      { arg: 'res', type: 'object', http: ctx => { return ctx.res } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Payment.bancomerFailure = async (data, res) => {
    let responseOrder = null

    const db = mysql.connectToDBManually()

    try {
      await db.beginTransaction()

      responseOrder = await db.query('SELECT * FROM `Order` WHERE `order` = ? LIMIT 1;', [
        data.mp_order
      ])

      responseOrder = responseOrder[0]
      let paymentAttempts = (responseOrder.paymentAttempts + 1)

      await db.query('UPDATE `Order` SET paymentAttempts = ? WHERE id = ?;', [
        paymentAttempts,
        responseOrder.id
      ])

      await db.query('INSERT INTO `PaymentBBVA` (orderId, mp_account, mp_order, mp_reference, mp_node, mp_concept, mp_amount, mp_currency, mp_paymentMethod, mp_paymentMethodCode, mp_paymentMethodcomplete, mp_response, mp_responsecomplete, mp_responsemsg, mp_responsemsgcomplete, mp_authorization, mp_authorizationcomplete, mp_hpan, mp_pan, mp_pancomplete, mp_date, mp_signature, mp_customername, mp_promo_msi, mp_bankcode, mp_saleid, mp_sale_historyid, mp_trx_historyid, mp_trx_historyidComplete, mp_bankname, mp_cardholdername, mp_cardholdernamecomplete, mp_authorization_mp1, mp_phone, mp_email, mp_promo, mp_promo_msi_bank, mp_securepayment, mp_cardType, mp_platform, mp_contract, mp_commerceName, mp_commerceNameLegal, mp_code, mp_message, class, success) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [
        responseOrder.id,
        data.mp_account,
        data.mp_order,
        data.mp_reference,
        data.mp_node,
        data.mp_concept,
        data.mp_amount,
        data.mp_currency,
        data.mp_paymentMethod,
        data.mp_paymentMethodCode,
        data.mp_paymentMethodComplete,
        data.mp_response,
        data.mp_responseComplete,
        data.mp_responsemsg,
        data.mp_responsemsgComplete,
        data.mp_authorization,
        data.mp_authorizationComplete,
        data.mp_hpan,
        data.mp_pan,
        data.mp_panComplete,
        data.mp_date,
        data.mp_signature,
        data.mp_customername,
        data.mp_promo_msi,
        data.mp_bankcode,
        data.mp_saleid,
        data.mp_sale_historyid,
        data.mp_trx_historyid,
        data.mp_trx_historyidComplete,
        data.mp_bankname,
        data.mp_cardholdername,
        data.mp_cardHolderNameComplete,
        data.mp_authorization_mp1,
        data.mp_phone,
        data.mp_email,
        data.mp_promo,
        data.mp_promo_msi_bank,
        data.mp_securepayment,
        data.mp_cardType,
        data.mp_platform,
        data.mp_contract,
        data.mp_commerceName,
        data.mp_commerceNameLegal,
        data.mp_code,
        data.mp_message,
        data.class,
        0
      ])

      await db.commit()
    } catch (err) {
      console.log(err)
      await db.rollback()
    }

    await db.close()

    let fastShopping = false
    if (responseOrder.fastShopping === 1) {
      fastShopping = true
    }
    console.log('Caso fallo bbva.')
    Utils.request({
      url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/order-logs/add',
      method: 'POST',
      json: true,
      body: {
        orderId: responseOrder.id,
        success: false,
        cart: !fastShopping,
        paymentStatus: 'failure',
        action: { name: 'BUY', response: data },
        response: data
      }
    })


    if (responseOrder.instanceId === 1) {
      res.redirect(configs.HOST_WEB_APP + '/resumen/fallo')
    } else if (responseOrder.instanceId === 2) {
      res.redirect(configs.HOST_WEB_APP_KELDER + '/resumen/fallo')
    } else if (responseOrder.instanceId === 3) {
      res.redirect(configs.HOST_WEB_APP_URBANNA + '/resumen/fallo')
    } else if (responseOrder.instanceId === 4) {
      res.redirect(configs.HOST_WEB_APP_CALZZASPORT + '/resumen/fallo')
    } else if (responseOrder.instanceId === 5) {
      res.redirect(configs.HOST_WEB_APP_CALZZAKIDS + '/resumen/fallo')
    }
  }

  Payment.remoteMethod('bancomerFailure', {
    description: 'Failure payment',
    http: {
      path: '/failure',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' } },
      { arg: 'res', type: 'object', http: ctx => { return ctx.res } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Payment.paymentWithOXXO = async (order) => {
    let response = { success: false }
    
    const db = mysql.connectToDBManually()
    
    try {
      if (order.type === 'charge.paid') {

        let orders = await db.query('SELECT  o.shippingMethodId, p.orderId, o.shippingAddressId, o.paymentMethodId, p.id AS id \
        FROM PaymentOXXO AS p\
        INNER JOIN `Order` AS o ON o.id = p.orderId\
        WHERE p.conektaOrderId = ? AND p.conektaPaymentStatus = "pending_payment" AND p.status = 1 LIMIT 1;', [
          order.data.object.order_id
        ])

        if (orders.length > 0) {
          await db.beginTransaction()
          await db.query('UPDATE `Order` SET calzzapatoCode = -1, paymentAttempts = 1, shoppingDate = ?, pipeline = 2 WHERE calzzapatoCode IS NULL AND id = ? AND status = 1;', [
            new Date(order.data.object.paid_at * 1000),
            orders[0].orderId
          ])

          await db.query('UPDATE `User` SET `lastOrderId` = null WHERE `id` = ?', [
            orders[0].userId
          ])

          await db.query('UPDATE PaymentOXXO SET conektaPaymentStatus = ?, orderResponseJSON = ? WHERE orderId = ? AND conektaReference = ? AND conektaOrderId = ? AND conektaPaymentStatus = "pending_payment" AND orderResponseJSON IS NULL AND status = 1;', [
            order.data.object.status,
            JSON.stringify(order),
            orders[0].orderId,
            order.data.object.payment_method.reference,
            order.data.object.order_id
          ])

          if (orders[0].shippingMethodId === CALZZAMOVIL) {
            // Es entrega express
            let responseAddress = await db.query('SELECT sa.addressId FROM `ShippingAddress` AS sa WHERE sa.id = ?;', [
              orders[0].shippingAddressId
            ])

            let calzzamovilResponse = await Calzzamovil.checkExpressDelivery(db, orders[0].orderId, responseAddress[0].addressId, orders[0].paymentMethodId)
            console.log('CheckExpressDelivery')
            console.log(calzzamovilResponse)

            if (calzzamovilResponse.status) {
              let createCalzzamovil = await db.query('INSERT INTO Calzzamovil (orderId, zoneId, scheduledId, cityMunicipalityStateCode) VALUES (?, ?, ?, ?);', [
                orders[0].orderId,
                calzzamovilResponse.zoneId,
                calzzamovilResponse.scheduledId,
                calzzamovilResponse.cityId
              ])

              delete calzzamovilResponse.message
              calzzamovilResponse.id = createCalzzamovil.insertId

              // Notificar a los repartidores de la zona
              //Utils.sendNotification({ notificationType: 'NEW_ORDER', userRole: 'DEALERS', cityMunicipalityStateCode: calzzamovilResponse.cityId})
              // Utils.request({
              //   url: configs.HOST_TRACKING_IP + ':' + configs.PORT_TRACKING + '/api/orders/calzzamovil/webhook',
              //   method: 'POST',
              //   json: true,
              //   body: {
              //     data: calzzamovilResponse
              //   }
              // })
            } 
          }

          await db.commit()

          await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + orders[0].orderId,
            method: 'POST'
          })

          let ordersDetail = await db.query('SELECT id, instanceId, userId FROM `Order` WHERE id = ? AND status = 1 LIMIT 1;', [
            orders[0].orderId
          ])

          order.paymentWay = OXXO_PAY

          await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
            method: 'POST',
            json: true,
            body: {
              status: 'BUY',
              order: ordersDetail[0].id,
              response: order
            },
            headers: {
              webhook: true,
              instanceId: ordersDetail[0].instanceId,
              userId: ordersDetail[0].userId
            }
          })

          response.success = true
        }
      }
    } catch (err) {
      response.error = err
      console.log(err)
      await db.rollback()
    }

    await db.close()

    if (response.error) {
      throw response
    } else {
      return response
    }
  }

  Payment.remoteMethod('paymentWithOXXO', {
    description: 'Payments with OXXO',
    http: {
      path: '/oxxo',
      verb: 'POST'
    },
    accepts: [
      { arg: 'order', type: 'object', http: { source: 'body' } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Payment.paymentWithPayPal = async (req) => {
    let data = req.body
    
    if (data.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const db = mysql.connectToDBManually()
      try {
        await db.beginTransaction()

        let responseOrders = await db.query('SELECT * FROM `Order` AS o LEFT JOIN PaymentPayPal AS ppp ON o.id = ppp.orderId WHERE ppp.paymentToken = ? AND ppp.status = 1 AND ppp.paypalPaymentStatus = "APROVED" LIMIT 1;', [
          data.resource.id
        ])

        if (responseOrders.length > 0) {
          await db.query('UPDATE `Order` SET calzzapatoCode = -1, shoppingDate = ?, paymentAttempts = 1, pipeline = 2 WHERE calzzapatoCode IS NULL AND id = ? AND status = 1;', [
            new Date(),
            responseOrders[0].orderId
          ])

          await db.query('UPDATE PaymentPayPal SET paypalPaymentStatus = ?, responsePaymentJSON = ? WHERE token = ? AND status = 1 AND paypalPaymentStatus = "APROVED"', [
            'PAID',
            JSON.stringify(data),
            responseOrders[0].token
          ])

          if (responseOrders[0].shippingMethodId === CALZZAMOVIL) {
            // Es entrega express
            let responseAddress = await db.query('SELECT sa.addressId FROM `ShippingAddress` AS sa WHERE sa.id = ?;', [
              responseOrders[0].shippingAddressId
            ])

            let calzzamovilResponse = await Calzzamovil.checkExpressDelivery(db, responseOrdes[0].id, responseAddress[0].addressId, responseOrders[0].paymentMethodId)

            if (calzzamovilResponse.status) {
              let createCalzzamovil = await db.query('INSERT INTO Calzzamovil (orderId, zoneId, scheduledId, cityMunicipalityStateCode) VALUES (?, ?, ?, ?);', [
                responseOrders[0].orderId,
                calzzamovilResponse.zoneId,
                calzzamovilResponse.scheduledId,
                calzzamovilResponse.cityId
              ])

              delete calzzamovilResponse.message
              calzzamovilResponse.id = createCalzzamovil.insertId

              // Notificar a los repartidores de la zona
              //Utils.sendNotification({ notificationType: 'NEW_ORDER', userRole: 'DEALERS', cityMunicipalityStateCode: calzzamovilResponse.cityId})
              // Utils.request({
              //   url: configs.HOST_TRACKING_IP + ':' + configs.PORT_TRACKING + '/api/orders/calzzamovil/webhook',
              //   method: 'POST',
              //   json: true,
              //   body: {
              //     data: calzzamovilResponse
              //   }
              // })
            }
          }

          await db.commit()

          await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + responseOrders[0].orderId,
            method: 'POST'
          })

          data.paymentWay = PAYPAL

          await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
            method: 'POST',
            json: true,
            body: {
              status: 'BUY',
              order: responseOrders[0].orderId,
              response: data
            },
            headers: {
              webhook: true,
              instanceId: responseOrders[0].instanceId,
              userId: responseOrders[0].userId
            }
          })
        }
      } catch (err) {
        console.log(err)
        await db.rollback()
      }
      await db.close()
    } else if (data.event_type === 'PAYMENT.CAPTURE.DENIED') {
      const db = mysql.connectToDBManually()
      try {
        let responseOrders = await db.query('SELECT * FROM `Order` AS o LEFT JOIN PaymentPayPal AS ppp ON o.id = ppp.orderId WHERE ppp.paymentToken = ? AND ppp.status = 1 AND ppp.paypalPaymentStatus = "APROVED" LIMIT 1;', [data.resource.id])
        if (responseOrders.length > 0) {
          let fastShopping = false
          
          if (responseOrders[0].fastShopping === 1) {
            fastShopping = true
          }

          Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/order-logs/add',
            method: 'POST',
            json: true,
            body: {
              orderId: responseOrder[0].id,
              success: false,
              cart: !fastShopping,
              paymentStatus: 'failure',
              action: { name: 'BUY', response: data },
              response: data
            }
          })
        }

      } catch (error) {
        console.log(error);
      }

      await db.close()
    }
  }

  Payment.remoteMethod('paymentWithPayPal', {
    description: 'Payments with PayPal',
    http: {
      path: '/paypal/paid',
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

  Payment.aprovedPaymentWithPayPal = async (req, res) => {
    const db = mysql.connectToDBManually()

    if (req.query.token !== undefined && req.query.PayerID !== undefined) {
      let responseOrders = await db.query('SELECT * FROM PaymentPayPal WHERE token = ? AND status = 1 AND paypalPaymentStatus = "CREATED" LIMIT 1;', [
        req.query.token
      ])

      if (responseOrders.length > 0) {
        let response = await paypal.aprovedPaymentWithPayPal(req.query.token)

        if (response.success) {
          await db.query('UPDATE PaymentPayPal SET paymentToken = ?, payer = ?, paypalPaymentStatus = ?, responseAprovedJSON = ? WHERE token = ? AND status = 1 AND paypalPaymentStatus = "CREATED"', [
            response.order.result.purchase_units[0].payments.captures[0].id,
            JSON.stringify(response.order.result.payer),
            'APROVED',
            JSON.stringify(response.order),
            responseOrders[0].token
          ])

          let orders = await db.query('SELECT * FROM `Order` WHERE id = ? AND status = 1 LIMIT 1;', [
            responseOrders[0].orderId
          ])

          await db.close()

          let token = jwt.sign(orders[0].order, configs.jwtPrivateKey)

          if (orders[0].instanceId === 2) {
            res.redirect(configs.HOST_WEB_APP_KELDER + '/resumen/exito?pago=paypal&token=' + token)
          } else {
            res.redirect(configs.HOST_WEB_APP + '/resumen/exito?pago=paypal&token=' + token)
          }
        } else {
          await db.close()

          if (orders[0].instanceId === 2) {
            res.redirect(configs.HOST_WEB_APP_KELDER + '/resumen/fallo')
          } else {
            res.redirect(configs.HOST_WEB_APP + '/resumen/fallo')
          }
        }
      } else {
        await db.close()
        res.redirect(configs.HOST_WEB_APP)
      }
    } else {
      await db.close()
      res.redirect(configs.HOST_WEB_APP)
    }
  }

  Payment.remoteMethod('aprovedPaymentWithPayPal', {
    description: 'Aproved payment with PayPal',
    http: {
      path: '/paypal',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'res', type: 'object', http: ctx => { return ctx.res } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  // NETPAY
  Payment.WebHookNetPay = async (req, res) => {
    let error = true
    let order = ''

    const db = mysql.connectToDBManually()
    await db.beginTransaction()

    if (req.query !== undefined && req.query.transaction_token !== undefined && !Utils.isEmpty(req.query.transaction_token)) {
      try {
        let responseChargeAuth = await netpay.chargeAuthNetPay(req.query.transaction_token)

        if (responseChargeAuth !== undefined) {
          if (responseChargeAuth.response !== undefined && responseChargeAuth.response.responseCode == '00') {
            order = responseChargeAuth.transaction.merchantReferenceCode

            let orders = await db.query('SELECT *, o.id AS id FROM `Order` AS o LEFT JOIN `PaymentNetPay` AS pnp ON o.id = pnp.orderId WHERE o.order = ? AND pnp.netpayStatus = "REVIEW"', [
              order
            ])

            if (orders.length === 1) {

              order = orders[0]

              await db.query("UPDATE `PaymentNetPay` SET `netpayResponseChargeAuthJSON` = ?, `netPayStatus` = ? WHERE `orderId` = ?", [
                JSON.stringify(responseChargeAuth),
                "DONE",
                order.id
              ])

              await db.query('UPDATE `Order` SET `pipeline` = 2, `paymentAttempts` = 1, `shoppingDate` = ?, `calzzapatoCode` = -1 WHERE `id` = ?', [
                new Date(),
                order.id
              ])

              await db.query('UPDATE `User` SET `lastOrderId` = null WHERE `id` = ?', [
                order.userId
              ])

              error = false

              if (order.shippingMethodId === CALZZAMOVIL) {
                // Es entrega express
                let responseAddress = await db.query('SELECT sa.addressId FROM `ShippingAddress` AS sa WHERE sa.id = ?;', [
                  order.shippingAddressId
                ])

                let calzzamovilResponse = await Calzzamovil.checkExpressDelivery(db, order.id, responseAddress[0].addressId, order.paymentMethodId)

                if (calzzamovilResponse.status) {
                  let createCalzzamovil = await db.query('INSERT INTO Calzzamovil (orderId, zoneId, scheduledId, cityMunicipalityStateCode) VALUES (?, ?, ?, ?);', [
                    order.id,
                    calzzamovilResponse.zoneId,
                    calzzamovilResponse.scheduledId,
                    calzzamovilResponse.cityId
                  ])

                  delete calzzamovilResponse.message
                  calzzamovilResponse.id = createCalzzamovil.insertId

                  // Notificar a los repartidores de la zona
                  //Utils.sendNotification({ notificationType: 'NEW_ORDER', userRole: 'DEALERS', cityMunicipalityStateCode: calzzamovilResponse.cityId})
                  // Utils.request({
                  //   url: configs.HOST_TRACKING_IP + ':' + configs.PORT_TRACKING + '/api/orders/calzzamovil/webhook',
                  //   method: 'POST',
                  //   json: true,
                  //   body: {
                  //     data: calzzamovilResponse
                  //   }
                  // })
                }
              }

              await db.commit()

              await Utils.request({
                url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + order.id,
                method: 'POST'
              })

              responseChargeAuth.paymentWay = NETPAY

              await Utils.request({
                url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
                method: 'POST',
                json: true,
                body: {
                  status: 'BUY',
                  order: order.id,
                  response: responseChargeAuth
                },
                headers: {
                  webhook: true,
                  instanceId: order.instanceId,
                  userId: order.userId
                }
              })
            }
          }
        }
      } catch (err) {
        console.log(err)
        error = true
        await db.rollback()
      }
    }

    await db.close()

    if (error) {
      res.redirect(configs.HOST_WEB_APP + '/resumen/fallo')
    } else {
      let token = jwt.sign(order.order, configs.jwtPrivateKey)
      if (order.instanceId === 1) {
        res.redirect(configs.HOST_WEB_APP + '/resumen/exito?pago=netpay&token=' + token)
      } else if (order.instanceId === 2) {
        res.redirect(configs.HOST_WEB_APP_KELDER + '/resumen/exito?pago=netpay&token=' + token)
      } else if (order.instanceId === 3) {
        res.redirect(configs.HOST_WEB_APP_URBANNA + '/resumen/exito?pago=netpay&token=' + token)
      } else if (order.instanceId === 4) {
        res.redirect(configs.HOST_WEB_APP_CALZZASPORT + '/resumen/exito?pago=netpay&token=' + token)
      } else if (order.instanceId === 5) {
        res.redirect(configs.HOST_WEB_APP_CALZZAKIDS + '/resumen/exito?pago=netpay&token=' + token)
      }
    }
  }

  Payment.remoteMethod('WebHookNetPay', {
    description: 'WebHookNetPay',
    http: {
      path: '/netpay',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'res', type: 'object', http: ctx => { return ctx.res } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Payment.redirectOpenpay = async (req, res) => {
    const db = mysql.connectToDBManually()

    try {
      let payments = await db.query('SELECT orderId FROM PaymentOpenPay WHERE paymentId = ? LIMIT 1;', [req.query.id])

      if (payments.length > 0) {
        let orders = await db.query('SELECT * FROM `Order` WHERE id = ?;', [payments[0].orderId])
       
        if (orders.length > 0) {
          let token = jwt.sign(orders[0].order, configs.jwtPrivateKey)
  
          if (orders[0].instanceId === 1) {
            res.redirect(configs.HOST_WEB_APP + '/resumen/exito?pago=openpay&token=' + token)
          } else if (orders[0].instanceId === 2) {
            res.redirect(configs.HOST_WEB_APP_KELDER + '/resumen/exito?pago=openpay&token=' + token)
          } else if (orders[0].instanceId === 3) {
            res.redirect(configs.HOST_WEB_APP_URBANNA + '/resumen/exito?pago=openpay&token=' + token)
          } else if (orders[0].instanceId === 4) {
            res.redirect(configs.HOST_WEB_APP_CALZZASPORT + '/resumen/exito?pago=openpay&token=' + token)
          } else if (orders[0].instanceId === 5) {
            res.redirect(configs.HOST_WEB_APP_CALZZAKIDS + '/resumen/exito?pago=openpay&token=' + token)
          }
        }
      }

      await db.close()
    } catch(err) {
      console.log(err)
      await db.close()
    }
  }

  Payment.remoteMethod('redirectOpenpay', {
    description: 'redirectOpenpay',
    http: {
      path: '/openpay/redirect',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'res', type: 'object', http: ctx => { return ctx.res } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Payment.syncOrderCalzzapatoSystem = async (orderId, data) => {
    let response = { sync: false }

    orderId = Number(orderId)

    const db = mysql.connectToDBManually()
    let responseOrder = []

    try {
      responseOrder = await db.query('SELECT o.*, u.name, u.firstLastName, u.secondLastName, u.email, u.cellphone, u.phone, u.calzzapatoUserId, o.paymentMethodId FROM `Order` AS o INNER JOIN `User` AS u ON o.userId = u.id WHERE o.id = ? AND (o.calzzapatoCode IS NULL OR o.calzzapatoCode = -1) LIMIT 1;', [
        orderId
      ])
      console.log('responseOrder', responseOrder);
      console.log('orderId', orderId);
      responseOrder = responseOrder[0]

      let shippingMethod = Number(responseOrder.shippingMethodId)

      let responseAddress = null
      if (shippingMethod === FREE_DELIVERY || shippingMethod === DELIVERY || shippingMethod === CALZZAMOVIL) {
        responseAddress = await db.query("SELECT a.*, sa.name AS receiverName, sa.lastName AS receiverLastName, sa.phone AS receiverPhone, sa.reference, s.name AS state, m.name AS municipality, l.name AS suburb FROM `Address` AS a INNER JOIN `ShippingAddress` AS sa ON a.id = sa.addressId INNER JOIN `State` AS s ON s.code = a.stateCode INNER JOIN `Municipality` AS m ON a.municipalityCode = m.municipalityStateCode INNER JOIN `Location` AS l ON a.locationCode = l.locationMunicipalityStateCode WHERE sa.id = ? LIMIT 1;", [
          responseOrder.shippingAddressId
        ])
      }

      let bodyShipping = '<bEnvio>0</bEnvio>\
        <Estado></Estado>\
        <Municipio></Municipio>\
        <Colonia></Colonia>\
        <CP></CP>\
        <Calle></Calle>\
        <NumeroInt></NumeroInt>\
        <NumeroExt></NumeroExt>\
        <Observacion></Observacion>'

      if (shippingMethod === FREE_DELIVERY || shippingMethod === DELIVERY || shippingMethod === CALZZAMOVIL) {
        responseAddress = responseAddress[0]
        let observations = ''
        if (!Utils.isEmpty(responseAddress.betweenStreets)) {
          observations = responseAddress.betweenStreets
        }

        if (!Utils.isEmpty(responseAddress.reference)) {
          if (!Utils.isEmpty(responseAddress.betweenStreets)) {
            observations = responseAddress.betweenStreets + " - " + responseAddress.reference
          }
          else {
            observations = responseAddress.reference
          }
        }

        bodyShipping = ''
        bodyShipping += '<bEnvio>1</bEnvio>'
        bodyShipping += '<Estado>' + responseAddress.state + '</Estado>'
        bodyShipping += '<Municipio>' + responseAddress.municipality + '</Municipio>'
        bodyShipping += '<Colonia>' + responseAddress.suburb + '</Colonia>'
        bodyShipping += '<CP>' + responseAddress.zip + '</CP>'
        bodyShipping += '<Calle>' + responseAddress.street + '</Calle>'
        bodyShipping += '<NumeroInt>' + responseAddress.interiorNumber + '</NumeroInt>'
        bodyShipping += '<NumeroExt>' + responseAddress.exteriorNumber + '</NumeroExt>'
        bodyShipping += '<Observacion>' + observations + '</Observacion>'
      }

      let responseBBVA = await db.query("SELECT mp_authorization FROM `PaymentBBVA` WHERE orderId = ? LIMIT 1;", [
        responseOrder.id
      ])

      let folioAuthorization = ''
      if (responseBBVA.length > 0) {
        folioAuthorization = responseBBVA[0].mp_authorization
      }

      let shoppingDetail = await db.query('SELECT * FROM `OrderDetail` WHERE orderId = ? AND status = 1;', [responseOrder.id])
      let bodyShoppingDetail = ''

      shoppingDetail.forEach(function (detail) {
        bodyShoppingDetail += '<cCompra>'
        bodyShoppingDetail += '<Articulo>' + detail.productArticleCode + '</Articulo>'
        bodyShoppingDetail += '<Cantidad>' + detail.quantity + '</Cantidad>'
        bodyShoppingDetail += '<ImporteUnitario>' + detail.unitPrice + '</ImporteUnitario>'
        bodyShoppingDetail += '<SubTotal>' + detail.subtotal + '</SubTotal>'
        bodyShoppingDetail += '<Descuento>0</Descuento>'
        bodyShoppingDetail += '<Total>' + detail.subtotal + '</Total>'
        if (!Utils.isEmpty(detail.pointsCode) && Number(responseOrder.calzzapatoUserId) > 0) {
          bodyShoppingDetail += '<IDPromocion_eMonedero>' + detail.pointsCode + '</IDPromocion_eMonedero>'
          bodyShoppingDetail += '<Puntos_GanaPorcentaje>' + Number(detail.pointsWinPercentage).toFixed(0) + '</Puntos_GanaPorcentaje>'
          bodyShoppingDetail += '<Puntos_Gana>' + detail.pointsWin + '</Puntos_Gana>'
        }
        if (Number(detail.pointsExchange) > 0) {
          bodyShoppingDetail += '<Puntos_Paga>' + detail.pointsExchange + '</Puntos_Paga>'
        }
        bodyShoppingDetail += '</cCompra>'
      })

      let shoppingProvider = configs.shoppingProvider
      if (responseOrder.paymentMethodId === 2) {
        shoppingProvider = 4
        let responseCrediVale = await db.query("SELECT * FROM `PaymentCrediVale` WHERE orderId = ? LIMIT 1;", [
          responseOrder.id
        ])
        if (responseCrediVale.length > 0) {
          folioAuthorization = responseCrediVale[0].folio
        }
      }
      else if (responseOrder.paymentMethodId === 3) {
        shoppingProvider = 1
        let responseOXXO = await db.query("SELECT * FROM `PaymentOXXO` WHERE orderId = ? LIMIT 1;", [
          responseOrder.id
        ])
        if (responseOXXO.length > 0) {
          folioAuthorization = responseOXXO[0].conektaOrderId
        }
      }
      else if (responseOrder.paymentMethodId === 4) {
        shoppingProvider = 5
        let responsePayPal = await db.query("SELECT * FROM `PaymentPayPal` WHERE orderId = ? AND paymentToken != '' LIMIT 1;", [
          responseOrder.id
        ])
        if (responsePayPal.length > 0) {
          folioAuthorization = responsePayPal[0].paymentToken
        }
      } else if (responseOrder.paymentMethodId === 5) {
        shoppingProvider = 6
        let responseNetPay = await db.query("SELECT * FROM `PaymentNetPay` WHERE orderId = ? AND netpayResponseChargeAuthJSON IS NOT NULL LIMIT 1;", [
          responseOrder.id
        ])
        if (responseNetPay.length > 0) {
          folioAuthorization = JSON.parse(responseNetPay[0].netpayResponseChargeAuthJSON).transactionTokenId
        }
      } else if (responseOrder.paymentMethodId === 9) {
        shoppingProvider = 9
        let responseOpenpay = await db.query("SELECT * FROM `PaymentOpenPay` WHERE orderId = ? AND openpayStatus = ? LIMIT 1;", [
          responseOrder.id,
          'completed'
        ])
        if (responseOpenpay.length > 0) {
          folioAuthorization = responseOpenpay[0].paymentId
        }
      } else if (responseOrder.paymentMethodId === 10) {
        shoppingProvider = 10
        let responsePaynet = await db.query("SELECT * FROM `PaymentPaynet` WHERE orderId = ? AND paynetStatus = ? LIMIT 1;", [
          responseOrder.id,
          'completed'
        ])
        if (responsePaynet.length > 0) {
          folioAuthorization = responsePaynet[0].paynetId
        }
      }

      let userFullName = (responseOrder.name + " " + responseOrder.firstLastName + " " + responseOrder.secondLastName).trim()
      let phoneNumber = responseOrder.phone

      if (!Utils.isEmpty(responseOrder.cellphone))
        phoneNumber = responseOrder.cellphone

      if (Utils.isEmpty(phoneNumber))
        phoneNumber = '9999999999'

      let bluePointsParam = ''
      if (Number(responseOrder.calzzapatoUserId) > 0) {
        bluePointsParam = '<IdUsuarioMonedero>' + responseOrder.calzzapatoUserId + '</IdUsuarioMonedero>'
      }

      let IdOpcionEnvio = '1'
      let clickAndCollectParam = '<RecogerNumSucursal>0</RecogerNumSucursal>'

      let receiverData = ''
      if (shippingMethod === FREE_DELIVERY || shippingMethod === DELIVERY || shippingMethod === CALZZAMOVIL) {
        let receiver = responseAddress.receiverName + ' ' + responseAddress.receiverLastName
        receiver = receiver.trim()
        receiverData = '<EntregarANombre>' + receiver + '</EntregarANombre><EntregarATelefono>' + responseAddress.receiverPhone + '</EntregarATelefono>'
      }

      if (shippingMethod === CLICK_AND_COLLECT) {
        IdOpcionEnvio = '2'
        clickAndCollectParam = '<RecogerNumSucursal>' + responseOrder.clickAndCollectStoreId + '</RecogerNumSucursal>'
      } else if (shippingMethod === CALZZAMOVIL) {
        IdOpcionEnvio = '3'
      }

      if (data !== undefined && data.storeId !== undefined) {
        clickAndCollectParam = '<RecogerNumSucursal>' + data.storeId + '</RecogerNumSucursal>'
      }

      let body = '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <RegistraVentaProveedor xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <IdCliente>' + responseOrder.userId + '</IdCliente>\
            <IdVenta>' + responseOrder.order + '</IdVenta>\
            <Compras>' + bodyShoppingDetail + '</Compras>\
            <Envio>' + bodyShipping + '</Envio>\
            <ClienteNombre>' + userFullName + '</ClienteNombre>\
            <ClienteTelefono>' + phoneNumber + '</ClienteTelefono>\
            <ClienteEmail>' + responseOrder.email + '</ClienteEmail>\
            <IdProveedor>' + shoppingProvider + '</IdProveedor>\
            <FolioAutorizacion>' + folioAuthorization + '</FolioAutorizacion>' + bluePointsParam + '' + clickAndCollectParam + '' + receiverData + '\
            <IdOpcionEnvio>' + IdOpcionEnvio + '</IdOpcionEnvio>\
          </RegistraVentaProveedor>\
        </soap:Body>\
      </soap:Envelope>'

      let clzWebService = await Utils.request({
        url: configs.webServiceVentaPublicoURL + '?op=RegistraVentaProveedor',
        method: 'POST',
        headers: {
          "content-type": "text/xml"
        },
        body: body
      })

      response.detail = clzWebService.body

      let result = convert.xml2json(clzWebService.body, { compact: true, spaces: 4 })
      result = JSON.parse(result)
      let number = result['soap:Envelope']['soap:Body']['RegistraVentaProveedorResponse']['RegistraVentaProveedorResult']['Numero']['_text']

      if (Number(number) > 0) {
        response.sync = true
        response.folio = await db.query('UPDATE `Order` SET calzzapatoCode = ? WHERE id = ?;', [
          Number(number),
          responseOrder.id
        ])
        await db.commit()

        await Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/' + responseOrder.id + '/email',
          method: 'POST'
        })

        await Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/' + responseOrder.order + '/ticket',
          method: 'POST',
          json: true,
          body: {
            cellphone: phoneNumber,
            message: 'COMPROBANTE DIGITAL CALZZAPATO: '
          }
        })

        if (shippingMethod === CALZZAMOVIL) {
          Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/guide',
            method: 'POST',
            json: true,
            body: {
              "data": {
                "orderId": responseOrder.id
              }
            }
          })
        }

        let fastShopping = false
        if (responseOrder.fastShopping === 1) {
          fastShopping = true
        }
        Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/order-logs/add',
          method: 'POST',
          json: true,
          body: {
            orderId: orderId,
            success: true,
            paymentStatus: 'success',
            cart: !fastShopping,
            action: { name: 'BUY' }
          }
        })

      } else {
        await db.query('UPDATE `Order` SET calzzapatoCode = -1 WHERE id = ? AND calzzapatoCode IS NULL;', [
          responseOrder.id
        ])

        let fastShopping = false
        if (responseOrder.fastShopping === 1) {
          fastShopping = true
        }
        Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/order-logs/add',
          method: 'POST',
          json: true,
          body: {
            orderId: orderId,
            success: true,
            action: { name: 'BUY' },
            paymentStatus: 'success',
            cart: !fastShopping
          }
        })
      }
    } catch (err) {
      console.log(err)
      response.error = err
      await db.query('UPDATE `Order` SET calzzapatoCode = -1 WHERE id = ? AND calzzapatoCode IS NULL;', [responseOrder.id])
    }

    await db.close()
    return response
  }

  Payment.remoteMethod('syncOrderCalzzapatoSystem', {
    description: 'Sync order to Calzzapato ERP',
    http: {
      path: '/sync/:orderId',
      verb: 'POST'
    },
    accepts: [
      { arg: 'orderId', type: 'string', required: true },
      { arg: 'data', type: 'object', http: { source: 'body' } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Payment.paymentWithMercadoPago = async (req, res) => {
    let paymentId = req.query.payment_id
    let responseOrders = []

    const db =  mysql.connectToDBManually()

    if (req.query.preference_id !== undefined) {
      responseOrders = await db.query('SELECT * FROM PaymentMercadoPago WHERE token = ? AND status = 1 AND mercadopagoPaymentStatus = "201" LIMIT 1;', [
        req.query.preference_id
      ])

      if (responseOrders.length > 0) {
        //let response = await paypal.aprovedPaymentWithPayPal(req.query.token)
        let orders = await db.query('SELECT o.*, u.*, o.id AS orderId FROM `Order` AS o LEFT JOIN `User` AS u ON o.userId = u.id WHERE o.id = ? AND o.status = 1 LIMIT 1;', [responseOrders[0].orderId])

        if (req.query.status === 'approved') {
          await db.query('UPDATE PaymentMercadoPago SET mercadopagoPaymentStatus = ?, responsePaymentJSON = ?, mercadopagoPaymentId = ? WHERE token = ? AND status = 1 AND mercadopagoPaymentStatus = "201"', [
            'APPROVED',
            JSON.stringify(req.query),
            req.query.payment_id,
            req.query.preference_id
          ])
          await db.query('UPDATE `Order` SET shoppingDate = ?, paymentAttempts = 1, pipeline = 2, status = 1 WHERE id = ?;', [
            new Date(),
            orders[0].orderId
          ])
          await db.close()

          await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + orders[0].orderId,
            method: 'POST'
          })

          await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
            method: 'POST',
            json: true,
            body: {
              status: 'BUY',
              order: orders[0].orderId
              //response: responseChargeAuth
            },
            headers: {
              webhook: true,
              instanceId: orders[0].instanceId,
              userId: orders[0].userId
            }
          })
          let token = jwt.sign(orders[0].order, configs.jwtPrivateKey)
          if (orders[0].instanceId === 2) {
            res.redirect(configs.HOST_WEB_APP_KELDER + '/resumen/exito?pago=mercadopago&token=' + token)
          } else {
            res.redirect(configs.HOST_WEB_APP + '/resumen/exito?pago=mercadopago&token=' + token)
          }
        } else if (req.query.status === 'pending') {
          await db.query('UPDATE PaymentMercadoPago SET mercadopagoPaymentStatus = ?, mercadopagoPaymentId = ? WHERE token = ? AND status = 1 AND mercadopagoPaymentStatus = "201"', [
            'PENDING',
            req.query.payment_id,
            req.query.preference_id
          ])
          await db.close()

          let token = jwt.sign(orders[0].order, configs.jwtPrivateKey)

          if (orders[0].instanceId === 1) {
            res.redirect(configs.HOST_WEB_APP + '/resumen/exito?pago=mercadopago&token=' + token)
          } else if (orders[0].instanceId === 2) {
            res.redirect(configs.HOST_WEB_APP_KELDER + '/resumen/exito?pago=mercadopago&token=' + token)
          } else if (orders[0].instanceId === 3) {
            res.redirect(configs.HOST_WEB_APP_URBANNA + '/resumen/exito?pago=bbva&token=' + token)
          } else if (orders[0].instanceId === 4) {
            res.redirect(configs.HOST_WEB_APP_CALZZASPORT + '/resumen/exito?pago=bbva&token=' + token)
          } else if (orders[0].instanceId === 5) {
            res.redirect(configs.HOST_WEB_APP_CALZZAKIDS + '/resumen/exito?pago=bbva&token=' + token)
          }

          //Mandar mensaje aquí

          let request = await Utils.request({
            method: 'GET',
            url: "https://api.mercadopago.com/v1/payments/" + paymentId,
            headers: {
              "content-type": "application/json",
              Authorization: 'Bearer ' + configs.mercadopago.accessToken
            }
          })

          const filePath = path.join(__dirname, '../templates/mercadopago-reference.hbs')
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

          let convenio = ''
          let reference = ''
          let digitalTicket = ''

          let body = JSON.parse(request.body)
          let paymentMethodId = body.payment_method_id

          if (paymentMethodId === 'bancomer') {
            convenio = body.transaction_details.financial_institution
            reference = body.transaction_details.payment_method_reference_id
            digitalTicket = body.transaction_details.external_resource_url

          } else if (paymentMethodId === 'oxxo') {
            let verificationCode = body.transaction_details.verification_code
            convenio = '-'
            reference = verificationCode.substr(0, 4) + '-' + verificationCode.substr(4, 4) + '-' + verificationCode.substr(8, 4) + '-' + verificationCode.substr(12, 2)
          }

          let amount = Utils.numberWithCommas(Number(orders[0].total).toFixed(2))

          let data = {
            amount: amount,
            convenio: convenio,
            reference: reference,
            paymentMethod: paymentMethodId
          }

          let emailResponse = await Utils.sendEmail({
            from: '"Calzzapato.com" <contacto@calzzapato.com>',
            to: orders[0].email,
            cco: 'contacto@calzzapato.com',
            subject: 'Referencia de pago MercadoPago ® - Calzzapato.com 👠',
            template: template(data)
          })

        }
        else {
          await db.close()
          //res.redirect(configs.HOST_WEB_APP + '/resumen/fallo')
          if (responseOrder.instanceId === 1) {
            res.redirect(configs.HOST_WEB_APP + '/resumen/fallo')
          } else if (responseOrder.instanceId === 2) {
            res.redirect(configs.HOST_WEB_APP_KELDER + '/resumen/fallo')
          } else if (responseOrder.instanceId === 3) {
            res.redirect(configs.HOST_WEB_APP_URBANNA + '/resumen/fallo')
          } else if (responseOrder.instanceId === 4) {
            res.redirect(configs.HOST_WEB_APP_CALZZASPORT + '/resumen/fallo')
          } else if (responseOrder.instanceId === 5) {
            res.redirect(configs.HOST_WEB_APP_CALZZAKIDS + '/resumen/fallo')
          }


        }
      } else {
        await db.close()
        res.redirect(configs.HOST_WEB_APP + '/resumen/fallo')
      }
    } else {
      await db.close()
      res.redirect(configs.HOST_WEB_APP + '/resumen/fallo')
    }
  }

  Payment.remoteMethod('paymentWithMercadoPago', {
    description: 'Payments with MercadoPago',
    http: {
      path: '/mercadopago/paid',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'res', type: 'object', http: ctx => { return ctx.res } }

    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Payment.mercadoPagoWebHook = async (order) => {
    let orderId = 0
    let instanceId = 0
    let userId = 0
    let error = true

    const db = mysql.connectToDBManually()

    try {
      await db.beginTransaction()

      if (order.id) {
        let request = await Utils.request({
          url: 'https://api.mercadopago.com/v1/payments/' + order.data.id,
          method: 'GET',
          json: true,
          body: {
          },
          headers: {
            webhook: true,
            Authorization: 'Bearer ' + configs.mercadopago.accessToken
          }
        })
        // TEST
        // order.type = 'payment'
        // request.body.status = 'approved'

        if (order.data !== undefined && order.data !== null && typeof (order.data.id) === 'string' && order.type === 'payment' && request.body !== undefined && request.body.status === 'approved') {
          let mercadopagoPayment = await db.query('SELECT pm.*, o.userId, o.instanceId, o.shippingMethodId, shippingAddressId FROM PaymentMercadoPago AS pm LEFT JOIN `Order` AS o ON o.id = pm.orderId WHERE mercadopagoPaymentId = ?;', [order.data.id])
          if (mercadopagoPayment.length > 0) {
            await db.query('UPDATE PaymentMercadoPago SET mercadopagoPaymentStatus = ?, responsePaymentJSON = ? WHERE token = ? AND status = 1 AND mercadopagoPaymentStatus = "PENDING"', [
              'APPROVED',
              JSON.stringify(request.body),
              mercadopagoPayment[0].token
            ])
            await db.query('UPDATE `Order` SET shoppingDate = ?, paymentAttempts = 1, pipeline = 2, status = 1, `calzzapatoCode` = -1 WHERE id = ?;', [
              new Date(),
              mercadopagoPayment[0].orderId
            ])

            orderId = mercadopagoPayment[0].orderId
            userId = mercadopagoPayment[0].userId
            instanceId = mercadopagoPayment[0].instanceId
            error = false

            let responseAddress = await db.query('SELECT sa.name, sa.lastName, a.zip, a.street, a.exteriorNumber, l.name AS location, lt.name AS location, m.name AS municipality, s.name AS stateName, a.lat, a.lng\
            FROM ShippingAddress AS sa \
            LEFT JOIN Address AS a ON sa.addressId = a.id \
            LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode\
            LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode \
            LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode \
            LEFT JOIN State AS s ON s.code = m.stateCode \
            WHERE sa.id = ? AND sa.status = 1; ', [mercadopagoPayment[0].shippingAddressId])

            if (mercadopagoPayment[0].shippingMethodId === CALZZAMOVIL) {
              // Es entrega express
              let calzzamovilResponse = await Calzzamovil.checkExpressDelivery(db, orderId, responseAddress[0].addressId, mercadopagoPayment[0].paymentMethodId)
              if (calzzamovilResponse.status) {
                let createCalzzamovil = await db.query('INSERT INTO Calzzamovil (orderId, zoneId, scheduledId, cityMunicipalityStateCode) VALUES (?, ?, ?, ?);', [
                  orderId,
                  calzzamovilResponse.zoneId,
                  calzzamovilResponse.scheduledId, +
                  calzzamovilResponse.cityId
                ])
                delete calzzamovilResponse.message
                calzzamovilResponse.id = createCalzzamovil.insertId
              }
            }
          }
          await db.commit()
          await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + orderId,
            method: 'POST'
          })

          await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
            method: 'POST',
            json: true,
            body: {
              status: 'BUY',
              order: orderId,
              //response: responseChargeAuth
            },
            headers: {
              webhook: true,
              instanceId: instanceId,
              userId: userId
            }
          })
        }
      }
    } catch (error) {
      console.log(error)
      await db.rollback()
    }

    await db.close()
    return 201
  }

  Payment.remoteMethod('mercadoPagoWebHook', {
    description: 'MercadoPago payments webhook',
    http: {
      path: '/mercadopago/webhook',
      verb: 'POST'
    },
    accepts: [
      { arg: 'order', type: 'object', http: { source: 'body' } },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }

    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Payment.openpayWebhook = async (order) => {
    console.log('OPENPAY ORDER',order);
    let orderId = 0
    let instanceId = 0
    let userId = 0
    let error = true

    const db = mysql.connectToDBManually()

    try {
      await db.beginTransaction()

      if (order !== null && order !== undefined) {
        if (order.type === 'charge.succeeded' && order.transaction !== undefined && order.transaction.status === 'completed') {
          if (order.transaction.method === 'card') {

            let openpayOrder = await db.query('SELECT p.*, o.userId, o.instanceId, o.shippingMethodId, shippingAddressId \
            FROM PaymentOpenPay AS p \
            LEFT JOIN `Order` AS o ON o.id = p.orderId \
            WHERE o.id = ?;', [order.transaction.order_id])

            if (openpayOrder.length > 0) {
              await db.query('UPDATE PaymentOpenPay SET openpayStatus = ?, JSONresponse = ? WHERE orderId = ? AND status = 1;', [
                'completed',
                JSON.stringify(order),
                order.transaction.order_id
              ])

              await db.query('UPDATE `Order` SET shoppingDate = ?, paymentAttempts = 1, pipeline = 2, status = 1, `calzzapatoCode` = -1 WHERE id = ?;', [
                new Date(),
                order.transaction.order_id
              ])


              orderId = openpayOrder[0].orderId
              userId = openpayOrder[0].userId
              instanceId = openpayOrder[0].instanceId
              error = false

              if (openpayOrder[0].shippingMethodId === CALZZAMOVIL) {
                // Es entrega express
                let responseAddress = await db.query('SELECT addressId FROM `ShippingAddress` AS sa WHERE sa.id = ?;', [
                  openpayOrder[0].shippingAddressId
                ])

                let calzzamovilResponse = await Calzzamovil.checkExpressDelivery(db, order.id, responseAddress[0].addressId, order.paymentMethodId)

                if (calzzamovilResponse.status) {
                  let createCalzzamovil = await db.query('INSERT INTO Calzzamovil (orderId, zoneId, scheduledId, cityMunicipalityStateCode) VALUES (?, ?, ?, ?);', [
                    orderId,
                    calzzamovilResponse.zoneId,
                    calzzamovilResponse.scheduledId,
                    calzzamovilResponse.cityId
                  ])

                  delete calzzamovilResponse.message
                  calzzamovilResponse.id = createCalzzamovil.insertId

                  // Notificar a los repartidores de la zona
                  //Utils.sendNotification({ notificationType: 'NEW_ORDER', userRole: 'DEALERS', cityMunicipalityStateCode: calzzamovilResponse.cityId})
                }
              }


              await db.commit()

              await Utils.request({
                url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + orderId,
                method: 'POST'
              })

              await Utils.request({
                url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
                method: 'POST',
                json: true,
                body: {
                  status: 'BUY',
                  order: orderId,
                  //response: responseChargeAuth
                },
                headers: {
                  webhook: true,
                  instanceId: instanceId,
                  userId: userId
                }
              })
            }
          } else {
            let paynetOrder = await db.query('SELECT pm.*, o.userId, o.instanceId, o.shippingMethodId, shippingAddressId \
            FROM PaymentPaynet AS pm \
            LEFT JOIN `Order` AS o ON o.id = pm.orderId \
            WHERE o.id = ?;', [order.transaction.order_id])

            if (paynetOrder.length > 0) {
              await db.query('UPDATE PaymentPaynet SET paynetStatus = ?, responsePaymentJSON = ? WHERE orderId = ? AND status = 1;', [
                'completed',
                JSON.stringify(order),
                order.transaction.order_id
              ])

              await db.query('UPDATE `Order` SET shoppingDate = ?, paymentAttempts = 1, pipeline = 2, status = 1, `calzzapatoCode` = -1 WHERE id = ?;', [
                new Date(),
                order.transaction.order_id
              ])

              orderId = paynetOrder[0].orderId
              userId = paynetOrder[0].userId
              instanceId = paynetOrder[0].instanceId
              error = false

              if (paynetOrder[0].shippingMethodId === CALZZAMOVIL) {
                // Es entrega express
                let responseAddress = await db.query('SELECT addressId FROM `ShippingAddress` AS sa WHERE sa.id = ?;', [
                  paynetOrder[0].shippingAddressId
                ])

                let calzzamovilResponse = await Calzzamovil.checkExpressDelivery(db, order.id, responseAddress[0].addressId, order.paymentMethodId)

                if (calzzamovilResponse.status) {
                  let createCalzzamovil = await db.query('INSERT INTO Calzzamovil (orderId, zoneId, scheduledId, cityMunicipalityStateCode) VALUES (?, ?, ?, ?);', [
                    orderId,
                    calzzamovilResponse.zoneId,
                    calzzamovilResponse.scheduledId,
                    calzzamovilResponse.cityId
                  ])

                  delete calzzamovilResponse.message
                  calzzamovilResponse.id = createCalzzamovil.insertId

                  // Notificar a los repartidores de la zona
                  //Utils.sendNotification({ notificationType: 'NEW_ORDER', userRole: 'DEALERS', cityMunicipalityStateCode: calzzamovilResponse.cityId})
                }
              }

              await db.commit()

              await Utils.request({
                url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + orderId,
                method: 'POST'
              })

              await Utils.request({
                url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/carts/buy',
                method: 'POST',
                json: true,
                body: {
                  status: 'BUY',
                  order: orderId,
                  //response: responseChargeAuth
                },
                headers: {
                  webhook: true,
                  instanceId: instanceId,
                  userId: userId
                }
              })
            }

          }
        } else if (order.type === 'payout.failed') {
          let orders = null
          orders = await db.query('SELECT pm.*, o.userId, o.instanceId, o.shippingMethodId, shippingAddressId, o.fastShopping \
            FROM PaymentPaynet AS pm \
            LEFT JOIN `Order` AS o ON o.id = pm.orderId \
            WHERE o.id = ?;', [order.transaction.order_id])

          if (orders.length === 0) {
            orders = await db.query('SELECT p.*, o.userId, o.instanceId, o.shippingMethodId, shippingAddressId, o.fastShopping \
            FROM PaymentOpenPay AS p \
            LEFT JOIN `Order` AS o ON o.id = p.orderId \
            WHERE o.id = ?;', [order.transaction.order_id])
          }
          if (orders.length > 0) {
            let fastShopping = false
            if (orders[0].fastShopping === 1) {
              fastShopping = true
            }
          }

        }
      }
    } catch (error) {
      console.log(error)
      await db.rollback()
    }
    
    await db.close()
    return 201
  }

  Payment.remoteMethod('openpayWebhook', {
    description: 'Openpay payments webhook',
    http: {
      path: '/openpay/webhook',
      verb: 'POST'
    },
    accepts: [
      { arg: 'order', type: 'object', http: { source: 'body' } },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }

    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
