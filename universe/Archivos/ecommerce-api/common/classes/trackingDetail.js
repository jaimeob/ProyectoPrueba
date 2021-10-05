'use strict'

const Utils = require('../Utils')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')
const moment = require('moment')


const getOrderInformation = async (db, id) => {
  let response = []
  let orderInformation = await db.query('SELECT o.id, o.`order` AS folio, o.calzzapatoCode, o.paymentMethodId, pm.`name` AS paymentName, o.createdAt, o.shoppingDate, o.shippingMethodId, sp.`name` AS shippingMethodName, o.total, o.subtotal, o.shippingCost, o.clickAndCollectStoreId, o.pipeline, \
    a.lat, a.lng, lt.name AS locationType, sa.name AS name, sa.lastName AS lastName, u.email, u.cellphone AS phone, a.street, a.exteriorNumber, l.name AS location, m.name AS municipality, a.zip, sa.reference, s.name AS state\
    FROM `Order` AS o \
    LEFT JOIN PaymentMethod AS pm ON pm.id = o.paymentMethodId\
    LEFT JOIN ShippingMethod AS sp ON sp.id = o.shippingMethodId\
    LEFT JOIN ShippingAddress AS sa ON sa.id = o.shippingAddressId\
    LEFT JOIN Address AS a ON sa.addressId = a.id\
    LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode \
    LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode \
    LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode \
    LEFT JOIN State AS s ON s.code = m.stateCode \
    LEFT JOIN User AS u ON u.id = o.userId WHERE o.order = ? OR o.calzzapatoCode = ? LIMIT 1;', [id, id])
  if (orderInformation.length > 0) {
    response = orderInformation
  }
  return response
}

const mainInformation = async (data) => {
  let response = {
    id: data.id,
    folio: data.folio,
    calzzapatoCode: data.calzzapatoCode,
    shoppingDate: moment(data.shoppingDate).locale('es').format('dddd DD [de] MMMM YYYY'),
    total: data.total,
    subtotal: data.subtotal,
    shippingCost: data.shippingCost,
    createdAt: moment(data.createdAt).locale('es').format('dddd DD [de] MMMM YYYY'),
    paymentMethodId: data.paymentMethodId,
    paymentName: data.paymentName,
  }
  return response
}

const addressFormat = async (data) => {
  let response = {
    location: data.location,
    state: data.state,
    municipality: data.municipality,
    zip: data.zip,
    reference: data.reference,
    exteriorNumber: data.exteriorNumber,
    street: data.street,
    lat: data.lat,
    lng: data.lng,
    locationType: data.locationType
  }
  return response
}

const getEnviaTracking = async (data) => {
  let response = []
  let responseWebService = await Utils.request({
    url: configs.envia.url + 'ship/generaltrack',
    method: 'POST',
    json: true,
    headers: {
      Authorization: 'Bearer ' + configs.envia.token
    },
    body: {
      trackingNumbers: [String(data)]
    }
  })
  if (responseWebService.body !== undefined && responseWebService.body !== null && responseWebService.body.meta === 'generaltrack'  && responseWebService.body.data.length > 0) {
    response = responseWebService.body.data[0].eventHistory
    response.ship = responseWebService.body.data[0]
  }
  return response
}


const getEnviaTrackingSingleShipping = async (data) => {
  
  let response = []
  let responseWebService = await Utils.request({
    url: configs.envia.queryUrl + 'guide/' + data,
    method: 'GET',
    json: true,
    headers: {
      Authorization: 'Bearer ' + configs.envia.token
    },
  })


  if (responseWebService.body !== undefined && responseWebService.body !== null && responseWebService.body.meta === 'generaltrack' && responseWebService.body.data.length > 0) {
    response = responseWebService.body.data[0].eventHistory
  }
  return response
}


const calzzamovilStatus = async (folio) => {
  let responseWebService = await Utils.request(configs.HOST + ':' + configs.PORT + '/api/orders/' + folio + '/tracking')
  // return [{ id: 2, status: true, name: 'Pagado' }, { id: 3, status: false, name: 'Procesando' }, { id: 5, status: false, name: 'Enviado' }, { id: 4, status: false, name: 'Por enviar' }]
  return [{ id: 1, name: 'Por pagar', status: true }, { id: 2, name: 'Pagado', status: false }, { id: 3, name: 'Procesando pedido', status: false }, { id: 4, name: 'Por enviar', status: false }, { id: 5, name: 'Enviado', status: false }]
}



module.exports = ({ getOrderInformation, mainInformation, addressFormat, getEnviaTracking, calzzamovilStatus,getEnviaTrackingSingleShipping })
