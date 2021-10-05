'use strict'

const mercadopago = require('mercadopago')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

const createMercadoPagoOrder = async (data) => {
  // Agrega credenciales
  mercadopago.configure({
    access_token: configs.mercadopago.accessToken
  })
  return new Promise(async (resolve, reject) => {
    try {
      let preference = {
        items: data.items,
        payer: data.payer,
        "back_urls": {
          "success": configs.mercadopago.backUrl,
          "failure": configs.mercadopago.backUrl,
          "pending": configs.mercadopago.backUrl
        },
        "auto_return": "approved",
        "payment_methods": {
          "excluded_payment_methods": [
            {
              "id": "paypal"
            }
          ],
          "excluded_payment_types": [
            {
              "id": "bank_transfer"
            }
          ]
        },
        "shipments": {
          "cost": data.shippingMethodCost,
          "mode": "not_specified"
        }
      }
      let respuesta = {}
      await mercadopago.preferences.create(preference)
        .then(function (response) {
          // Este valor reemplazará el string "<%= global.id %>" en tu HTML
          global.id = response.body.id
          respuesta = response
        }).catch(function (error) {
          console.log(error)
        })
      if (respuesta.status === 201) {
        return resolve({ success: true, order: respuesta })
      }
    } catch (err) {
      return reject({ success: false, error: err })
    }
  })
}

module.exports = ({
  createMercadoPagoOrder
})
