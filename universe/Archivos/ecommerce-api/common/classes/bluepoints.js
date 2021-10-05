'use strict'

const Distance = require('geo-distance')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../../common/configs.' + NODE_ENV + '.json')
const Utils = require('../Utils.js')
const mysql = require('./mysql.js')
const mongodb = require('./mongodb.js')

let environment = '../../server/datasources.development.json'
if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}

const datasources = require(environment)

const getCalzzapatoToken = async () => {
  let response = null
  try {
    let req = await Utils.request({
      method: 'POST',
      url: configs.webServiceBluePoints + '/Token',
      headers: {
        'email': configs.bluePointsEmail,
        'key': configs.bluePointsPassword
      }
    })
    if (req.body !== null && req.body !== undefined) {
      response = req.body
    }
  } catch (error) {
    console.log(error)
  }
  return response
}

const createCalzzapatoCoupon = async (userId, coupon, ticket) => {
  let response = null
  try {
    let token = await getCalzzapatoToken()
    if (token !== null && token !== undefined) {
      let req = await Utils.request({
        method: 'POST',
        url: configs.webServiceBluePoints + '/MonederoAzul/Cupones',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true,
        body: {
          "idUsuario": userId,
          "cFolioCupon": ticket,
          "nPuntos": coupon.import
        }
      })
      console.log('Response de CALZZAPATO WEB SERVICE Crear Cupón. ',req.body)
      if (req.body !== null && req.body !== undefined) {
        response = req.body
      }
    }
  } catch (error) {
    console.log(error)
  }
  return response
}

const validateBluePointsCoupon = async (userId, id) => {
  let response = { valid: false, coupon: null, messagesError: '', serverError: '' }
  const db = mongodb.getConnection('db')

  try {
    let folioToSave = null
    let addTicket = false

    let folios = await mongodb.mongoFind(db, 'Folio', { folios: { $elemMatch: { code: id } } })
    let findFolio = null
    if (folios.length > 0) {
      folioToSave = folios[0]
      findFolio = folioToSave.folios.findIndex((element) => element.code === id)
      // Validar si existe folio (Hay Folio?)
      if (findFolio !== -1) {
        // Vigencia (Tiene vigencia?)
        if (folioToSave.initDate !== null && folioToSave.initDate !== undefined && folioToSave.finishDate !== null && folioToSave.finishDate !== undefined) {
          // Tiene vigencia.
          let current = new Date()
          if (current > folioToSave.initDate && current < folioToSave.finishDate) {
            if (folioToSave.folios[findFolio].status && folioToSave.status === 1) {
              addTicket = true
            }
          } else if (folioToSave.extend) {
            if (folioToSave.folios[findFolio].status && folioToSave.status === 1) {
              addTicket = true
            } else {
              response.serverError = 'No existe ese cupón'
              response.messagesError = 'Cupón no válido.'
            }
          } else {
            response.serverError = 'No existe ese cupón'
            response.messagesError = 'Cupón no válido.'
          }
        } else {
          // No tiene vigencia.
          // (Está vigente?)
          if (folioToSave.folios[findFolio].status && folioToSave.status === 1) {
            addTicket = true
          } else {
            response.serverError = 'No tiene vigencia.'
            response.messagesError = 'El código ha expirado'
          }
        }
      } else {
        response.serverError = 'No existe ese codigo'
        response.messagesError = 'Cupón no válido.'
      }
      if (addTicket) {
        // Sarch user in the same folios.
        let userFolio = folioToSave.folios.findIndex((element) => element.userId === userId)
        if (userFolio === -1) {
          let userFolios = await mongodb.mongoFind(db, 'Folio', { campaignId: folioToSave.campaignId, agreementId: folioToSave.agreementId, folios: { $elemMatch: { userId: userId } } })
          if (userFolios.length > 0) {
            addTicket = false
            response.messagesError = 'Ya has ingresado cupón en esta campaña.'
          }
        } else {
          addTicket = false
          response.messagesError = 'Cupón no válido.'

        }
        if (addTicket) {
          response.coupon = folioToSave
          // folioToSave.folios[findFolio].status = false
          // folioToSave.folios[findFolio].userId = userId
          // await mongodb.findAndUpdateMongoDB(db, 'Folio', { _id: ObjectId(folioToSave._id) }, { '$set': folioToSave })
        }
      }
    } else {
        response.serverError = 'No existe ese cupón'
        response.messagesError = 'Cupón no válido.'
    }
    response.valid = addTicket
  } catch (error) {
    console.log(error)
  }
  return response
}

module.exports = ({
  getCalzzapatoToken,
  createCalzzapatoCoupon,
  validateBluePointsCoupon
})
