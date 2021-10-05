'use strict'

const paypal = require('@paypal/checkout-server-sdk')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

const createPayPalOrder = async (data) => {
  return new Promise(async (resolve, reject) => {
    let environment = null
    if (process.env.NODE_ENV !== 'production') {
      environment = new paypal.core.SandboxEnvironment(configs.paypalClientId, configs.paypalClientSecret)
    } else {
      environment = new paypal.core.LiveEnvironment(configs.paypalClientId, configs.paypalClientSecret)
    }
    let client = new paypal.core.PayPalHttpClient(environment)
    let request = new paypal.orders.OrdersCreateRequest()
    request.requestBody(data)
    try {
      let response = await client.execute(request)
      if (response.statusCode === 201) {
        return resolve({ success: true, order: response })
      }
    } catch (err) {
      return reject({ success: false, error: err })
    }
  })
}

const aprovedPaymentWithPayPal = async (data) => {
  return new Promise(async (resolve, reject) => {
    let environment = null
    if (process.env.NODE_ENV !== 'production') {
      environment = new paypal.core.SandboxEnvironment(configs.paypalClientId, configs.paypalClientSecret)
    } else {
      environment = new paypal.core.LiveEnvironment(configs.paypalClientId, configs.paypalClientSecret)
    }
    let client = new paypal.core.PayPalHttpClient(environment)
    let request = new paypal.orders.OrdersCaptureRequest(data)
    try {
      request.requestBody({})
      let response = await client.execute(request)
      if (response.statusCode === 201) {
        return resolve({ success: true, order: response })
      }
    } catch (err) {
      return reject({ success: false, error: err })
    }
  })
}

module.exports = ({
  createPayPalOrder,
  aprovedPaymentWithPayPal
})
