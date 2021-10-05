'use strict'

const Openpay = require('openpay')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')
const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')
const Utils = require('../Utils')

let OPENPAY_PRODUCTION = false
if (NODE_ENV === 'production') {
  OPENPAY_PRODUCTION = true
}

const createPaynetOrder = async (data) => {
  // Agrega credenciales
  console.log('Data al crear paynetOrder', data)
  let openpay = new Openpay(configs.openpay.id, configs.openpay.privateKey, OPENPAY_PRODUCTION)
  return new Promise(async (resolve, reject) => {
    try {
      let customerRequest = {
        'name': data.name,
        'email': data.email,
        'requires_account': false
      }
      openpay.customers.create(customerRequest, async function (error, customer) {
        if (error === null && customer !== null && customer !== undefined) {
          var storeChargeRequest = {
            'method': 'store',
            'amount': data.total,
            'description': 'COMPRA REALIZADO EN GRUPO CALZZAPATO.',
            'order_id': data.orderId,
            'currency': 'MXN'
          }
          openpay.customers.charges.create(customer.id, storeChargeRequest, (error2, charge) => {
            if (error2 === null) {
              charge.ticket = configs.openpay.urlTicket + configs.openpay.id + '/' + charge.payment_method.reference
              return resolve({ success: true, order: charge })
            } else {
              return reject({ success: false, error: error2 })
            }
          })
        } else {
          return reject({ success: false, error: error })
        }
      })
    } catch (err) {
      console.log('Error Paynet', err)
      return reject({ success: false, error: err })
    }
  })
}

const createOpenpayOrder = async (data) => {
  console.log('Data de crear orden con openpay', data);
  // Agrega credenciales
  let openpay = new Openpay(configs.openpay.id, configs.openpay.privateKey, OPENPAY_PRODUCTION)
  try {
    let customerRequest = {
      'name': data.name,
      'email': data.email,
      'requires_account': false
    }
    return new Promise(async (resolve, reject) => {
      // Crear Usuario
      openpay.customers.create(customerRequest, async function (error, customer) {
        // Hacer el cargo
        var newCharge = {
          "method": "card",
          "amount": data.amount,
          "description": "COMPRA REALIZADO EN GRUPO CALZZAPATO.",
          'customer': {
            'name': data.name,
            'last_name': data.firstLastName + data.secondLastName,
            'phone_number': data.cellphone,
            'email': data.email
          },
          "order_id": data.orderId,
          "device_session_id": data.deviceId,
          "source_id": data.tokenCard,
          "currency": "MXN",
          "use_3d_secure": data.secureCode,
          "redirect_url": configs.HOST + '/api/payments/openpay/redirect'
        }

        if (error === null) {
          openpay.charges.create(newCharge, function (error2, body, response) {
            if (error2 === null) {
              return resolve({ success: true, response: body })
            } else {
              console.log('error 2', error2)
              return reject({ success: false, error: error2 })
            }
          })
        } else {
          console.log('error 1', error)

          return reject({ success: false, error: error })
        }
      })
    })
  } catch (error) {
    console.log(error)
  }
}

const createCard = async (data) => {
  let openpay = new Openpay(configs.openpay.id, configs.openpay.privateKey, OPENPAY_PRODUCTION)

  return new Promise(async (resolve, reject) => {
    openpay.customers.create(data.customerInfo, async function (error, customer) {
      if (error === null) {
        //openpay.cards.create({ token_id: data.token, device_session_id: data.deviceId })
        openpay.cards.create({ token_id: data.token, device_session_id: data.deviceId }, async function (error2, card) {
          if (error2 === null) {
            // Tarjeta ya creada
            data.tokenCard = card
            //await insertToken(data)
            return resolve({ success: true, card: card })
          } else {
            console.log('error 2', error2)
            let errorMessage = await getOpenpayError(error2.error_code)
            return resolve({ success: false, error: errorMessage })
          }
        })
      } else {
        console.log('error 1', error)
        return reject({ success: false, error: error })
      }
    })

  })
}

const getOpenpayError = async (code) => {
  let response = null
  switch (code) {
    case 3001:
      response = 'La tarjeta fue rechazada.'
      break
    case 3002:
      response = 'La tarjeta ha expirado.'
      break
    case 3003:
      response = 'La tarjeta no tiene fondos suficientes.'
      break
    case 3004:
      response = 'La tarjeta fue rechazada.'
      // response = 'La tarjeta ha sido identificada como una tarjeta robada.'
      break
    case 3005:
      response = 'La tarjeta fue rechazada.'
      // response = 'La tarjeta ha sido rechazada por el sistema antifraudes.'
      break
    case 1003:
      response = 'Tarjeta rechazada.'
      break
    default:
      break
  }

  return response
}

const sendEmail = async (data) => {
  const filePath = path.join(__dirname, '../templates/paynet-reference.hbs')
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

  const templateData = {
    storeIconUrl: configs.HOST_WEB_APP + '/' + 'store-icon.png',
    ...data,
  }

  const template = handlebars.compile(source)

  let emailResponse = await Utils.sendEmail({
    from: '"Calzzapato.com" <contacto@calzzapato.com>',
    // to: orders[0].email,
    to: data.email,
    cco: 'contacto@calzzapato.com',
    subject: 'Referencia de pago Paynet ® - Calzzapato.com 👠',
    template: template(templateData)
  })
}

module.exports = ({
  createPaynetOrder,
  createOpenpayOrder,
  createCard,
  sendEmail
})
