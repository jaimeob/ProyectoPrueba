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

const getDistance = (lat1h, lat2h, long1h, long2h) => {
  var point1 = {
    lat: parseFloat(lat1h),
    lon: parseFloat(long1h)
  }
  var point2 = {
    lat: parseFloat(lat2h),
    lon: parseFloat(long2h)
  }
  var point1ToPoint2 = Distance.between(point1, point2)
  let km = 6372.8
  let m = 6372800
  let response = parseFloat(Number.parseFloat(point1ToPoint2 * km).toFixed(3))
  return response
}

const getProducts = async (connectionDB, orderId, type) => {
  const db = mongodb.getConnection('db')
  let products = []

  if (type === 'store') {
    products = await connectionDB.query('SELECT od.id, od.quantity, od.productCode, od.productDescription AS productName, od.size, od.orderId AS orderId   \
    FROM OrderDetail AS od\
    WHERE od.orderId = '+ orderId + ';')
  } else {
    products = await connectionDB.query('SELECT od.id, od.quantity, cd.collect, od.productCode, od.productDescription AS productName, od.size, od.orderId AS orderId \
    FROM CalzzamovilDetail AS cd\
    LEFT JOIN OrderDetail AS od ON od.id = cd.orderDetailId\
    WHERE od.orderId = '+ orderId + ';')
  }

  products.forEach(product => {
    if (product.collect !== undefined && product.collect === 1) {
      product.collect = true
    } else {
      product.collect = false
    }
  })

  await Utils.asyncForEach(products, async (product) => {
    let photos = await mongodb.mongoFind(db, 'Product', {
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
  return products
}

const getPrice = async (connectionDB, orderId) => {
  let price = await connectionDB.query('SELECT o.id AS orderId, o.calzzapatoCode, o.order AS folio, o.discount, o.shippingCost, o.subtotal, o.shippingMethodId, o.paymentMethodId, o.shippingAddressId, o.total, o.pointsExchange, o.shippingAddressId\
  FROM Calzzamovil AS c \
  LEFT JOIN `Order` AS o ON o.id = c.orderId\
  WHERE o.id = ?;', [orderId])
  if (price.length > 0) {
    return price[0]
  }
  return null
}

const getAddress = async (connectionDB, shippingAddressId) => {
  let addressInfo = await connectionDB.query('SELECT sa.name, sa.lastName, a.zip, a.street, a.exteriorNumber, a.interiorNumber, l.name AS locationName, l.zone AS locationZone, lt.name AS locationType, m.name AS municipalityName, s.name AS stateName, a.lat, a.lng\
  FROM ShippingAddress AS sa \
  LEFT JOIN Address AS a ON sa.addressId = a.id \
  LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode\
  LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode \
  LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode \
  LEFT JOIN State AS s ON s.code = m.stateCode \
  WHERE sa.id = ? LIMIT 1;', [shippingAddressId])
  if (addressInfo.length > 0) {
    return addressInfo[0]
  }
  return null
}

const getCustomerData = async (connectionDB, orderId) => {
  let customer = await connectionDB.query('SELECT u.name, u.firstLastName, u.secondLastName, u.cellphone \
  FROM Calzzamovil AS c \
  LEFT JOIN `Order` AS o ON o.id = c.orderId\
  LEFT JOIN User AS u ON u.id = o.userId\
  LEFT JOIN Scheduled AS s ON s.id = c.scheduledId\
  WHERE o.id = ?;', [orderId])
  if (customer.length > 0)
    return customer[0]
  return null
}

const getStore = async (connectionDB, orderId, storeIdParam) => {
  const db = mongodb.getConnection('db')
  let storeId = null
  if (storeIdParam === undefined) {
    storeId = await connectionDB.query('SELECT cd.storeId FROM Calzzamovil AS c LEFT JOIN CalzzamovilDetail AS cd ON cd.calzzamovilId = c.id WHERE c.orderId = ?;', [orderId])
    if (storeId.length > 0)
      storeId = storeId[0].storeId
  } else {
    storeId = storeIdParam
  }
  let storeResponse = await mongodb.mongoFind(db, 'Store', { 'code': storeId })
  if (storeResponse.length > 0) {
    delete storeResponse[0].source
    return storeResponse[0]
  }
  return null
}

const getBestDistance = async (connectionDB, orders, data) => {
  const db = mongodb.getConnection('db')
  let distance = 0
  let best = null
  try {
    if (data.stockAvailable === undefined) {
      // SACAR LA MEJOR CASA
      await Utils.asyncForEach(orders, async (order) => {

        distance = await getDistance(data.lat, String(order.lat), data.lng, String(order.lng))
        if (best === null) {
          best = order
          best.distance = distance
        } else {
          if (distance < best.distance) {
            best = order
            best.distance = distance
          }
        }
      })
    } else {
      // AQUI ES PARA SACAR LA MEJOR TIENDA
      await Utils.asyncForEach(orders, async (order) => {
        let stores = []
        let productsDetail = await connectionDB.query('SELECT od.id, od.productCode AS code, od.productArticleCode, od.size, od.quantity, od.orderId, a.zip\
        FROM OrderDetail AS od\
        LEFT JOIN `Order` AS o ON o.id = od.orderId\
        LEFT JOIN ShippingAddress AS s ON s.id = o.shippingAddressId\
        LEFT JOIN Address AS a ON a.id = s.addressId\
        WHERE od.orderId = ?;', [order.orderId])
        if (productsDetail.length !== 0) {

          productsDetail.forEach(product => {
            product.size = Number(product.size)
            product.stock = { status: true }
          })

          let locationResponse = await Utils.request({
            url: configs.HOST + ':' + configs.PORT + '/api/products/locations',
            method: 'POST',
            json: true,
            body: {
              data: {
                deliveryZip: productsDetail[0].zip,
                products: productsDetail
              }
            }
          })

          // En este punto ya se tiene la información de las tiendas.
          // Tomar las tiendas que tengan 2 o mas productos en stock.
          if (locationResponse.body !== undefined) {
            if (locationResponse.body[0].locations.length > 0) {
              locationResponse.body[0].locations.forEach(store => {
                if (Number(store.stock) >= data.stockAvailable) {
                  stores.push(store)
                }
              })
            } else {
              console.log('No hay productos en Locations.')
            }
          }
          
          // Ya teniendo las tiendas que cuentan con el producto
          // Sacar la tienda que más cerca esté.
          await Utils.asyncForEach(stores, async (store) => {
            let storeResponse = await mongodb.mongoFind(db, 'Store', { 'code': store.branch, 'branchType': 'T' })
            //console.log('store', storeResponse)
            if (storeResponse.length > 0) {
              let distanceStore = await getDistance(data.lat, String(storeResponse[0].lat), data.lng, String(storeResponse[0].lng))
              //console.log('distance', distanceStore)
              if (best === null) {
                best = store
                best.distance = distanceStore
                best.orderId = order.orderId
                best.calzzamovilId = order.id
                best.productsDetailId = productsDetail[0].id
              } else {
                if (distanceStore < best.distance) {
                  best = store
                  best.distance = distanceStore
                  best.orderId = order.orderId
                  best.calzzamovilId = order.id
                  best.productsDetailId = productsDetail[0].id
                }
              }
            }
          })
        }
      })
    }
  } catch (error) {
    console.log(error)
  }
  return best
}

const sendInfoForTracking = async (connectionDB, orderId, type, storeId) => {
  let response = {
    order: {
      orderId: null,
      products: [],
      price: null
    },
    customer: {
      address: null
    },
    type: '',
    store: null,
    reasons: []
  }

  if (type !== undefined) {
    response.order.orderId = orderId
    response.order.products = await getProducts(connectionDB, orderId, type)
    response.order.price = await getPrice(connectionDB, orderId)
    response.order.folio = response.order.price.folio
    response.customer = await getCustomerData(connectionDB, orderId)
    if (response.customer !== null) {
      response.customer.address = await getAddress(connectionDB, response.order.price.shippingAddressId)
    }

    response.reasons = await connectionDB.query('SELECT id, name, description FROM Reasons WHERE status = 1;')

    if (type === 'store') {
      if (storeId !== undefined) {
        response.store = await getStore(connectionDB, orderId, storeId)
      } else {
        response.store = await getStore(connectionDB, orderId)
      }
      response.type = 'store'
    } else {
      response.store = null
      response.type = 'house'
    }
  }
  return response
}

const getBestDistanceForGuide = async (stores, data) => {
  const db = mongodb.getConnection('db')
  let best = 0
  await Utils.asyncForEach(stores, async (store) => {
    let storeResponse = await mongodb.mongoFind(db, 'Store', { 'code': store.branch })
    if (storeResponse.length > 0) {
      let distanceStore = await getDistance(data.lat, String(storeResponse[0].lat), data.lng, String(storeResponse[0].lng))
      if (best === 0) {
        best = storeResponse[0]
        best.distance = distanceStore
      } else if (distanceStore < best.distance) {
        best = storeResponse[0]
        best.distance = distanceStore
      }
    }
  })
  return best
}

const getExistProducts = async (products, data) => {
  console.log('GetExistProducts')
  let response = { local: false, otherLocations: false, locations: [] }
  let sameLocalLocations = []
  let sameOtherLocations = []
  let MINIMIUM_STOCK = data.minimiumStock
  let withLocations = true
  let locationResponse = null

  try {
    if (products !== undefined) {
      if (products.length > 0) {
        if (products[0].location === undefined) {
          withLocations = false
          products.forEach(product => {
            product.size = Number(product.size)
            product.stock = { status: true }
          })
        }
        if (!withLocations) {
          locationResponse = await Utils.request({
            url: configs.HOST + ':' + configs.PORT + '/api/products/locations',
            method: 'POST',
            json: true,
            body: {
              data: {
                deliveryZip: products[0].zip,
                products: products
              }
            }
          })
          locationResponse = locationResponse.body
        } else {
          locationResponse = products
        }

        locationResponse.forEach(product => {
          // Iterar locations
          if (product.locations === undefined) {
            product.locations = product.location[0].locations
            product.otherLocations = product.location[0].otherLocations
          }
          product.locations.forEach(location => {
            if (sameLocalLocations.some((element) => element.branch === location.branch)) {
              let foundIndex = sameLocalLocations.findIndex(element => element.branch == location.branch)
              sameLocalLocations[foundIndex].count++
            } else {
              location.count = 1
              sameLocalLocations.push(location)
            }
          })

          // Iterar otherLocations
          product.otherLocations.forEach(location => {
            if (sameOtherLocations.some((element) => element.branch === location.branch)) {
              let foundIndex = sameOtherLocations.findIndex(element => element.branch == location.branch)
              sameOtherLocations[foundIndex].count++
            } else {
              location.count = 1
              sameOtherLocations.push(location)
            }
          })
        })
        // Comprobar si existes location en sameLocations
        if (sameLocalLocations.length > 0) {
          sameLocalLocations = sameLocalLocations.filter(location => Number(location.stock) >= MINIMIUM_STOCK)
          sameLocalLocations = sameLocalLocations.filter(location => location.count === products.length)
          if (sameLocalLocations.length > 0) {
            response.local = true
            response.locations = sameLocalLocations
          }
        }

        if (sameLocalLocations.length === 0) {
          sameOtherLocations = sameOtherLocations.filter(location => Number(location.stock) >= MINIMIUM_STOCK)
          sameOtherLocations = sameOtherLocations.filter(location => location.count === products.length)
          if (sameOtherLocations.length > 0) {
            response.otherLocations = true
            response.locations = sameOtherLocations
          }
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
  return response
}

const createRecolection = async (origin, carrier) => {
  let response = { created: false }

  let carrierResponse = await Utils.request({
    url: configs.envia.queryUrl + 'carrier/' + carrier.carrierId,
    method: 'GET',
    json: true,
    headers: {
      Authorization: 'Bearer ' + configs.envia.token
    },
    body: {}
  })

  var dateObj = new Date()
  var month = dateObj.getUTCMonth() + 1 //months from 1-12
  var day = dateObj.getUTCDate()
  var year = dateObj.getUTCFullYear()
  let timeFrom = 0
  let timeTo = 0

  if (carrierResponse.body.data !== undefined) {
    if (carrierResponse.body.data[0].pickup_sameday === 0) {
      day = Number(day) + 1
    }
    timeFrom = carrierResponse.body.data[0].pickup_start_time
    timeTo = carrierResponse.body.data[0].pickup_end_time
  }
  if (day < 10) {
    day = '0' + day
  }
  if (month < 10) {
    month = '0' + month
  }
  // 2018-08-21
  newdate = year + "-" + month + "-" + day


  let recolectionResponse = await Utils.request({
    url: configs.envia.url + 'ship/pickup/',
    method: 'POST',
    json: true,
    headers: {
      Authorization: 'Bearer ' + configs.envia.token
    },
    body: {
      "origin": origin,
      "shipment": {
        "carrier": carrier.carrier,
        "pickup": {
          "timeFrom": timeFrom,
          "timeTo": timeTo,
          "date": newdate,
          "instructions": "",
          "totalPackages": carrier.totalProducts,
          "totalWeight": carrier.totalWeight
        }
      },
      "settings": {
        "currency": "MXN",
        "labelFormat": "pdf"
      }
    }
  })
  console.log(recolectionResponse.body)
  if (recolectionResponse.body) {
    if (recolectionResponse.body.data) {
      if (recolectionResponse.body.data.length > 0) {
        console.log('Recolection', recolectionResponse.body)
        response.created = true
      }
    }
  }
  return response

}

const createCarrierGuide = async (origin, destination, packages, carrier) => {
  console.log('CREATE CARRIER GUIDE')
  let response = { created: false }
  let connection = await mysql.connectToDBManually()
  let order = await connection.query('SELECT id FROM OrderShipping WHERE orderId = ? AND status = 1;', [carrier.orderId])

  let body = {
    "origin": origin,
    "destination": destination,
    "packages": packages,
    "shipment": {
      "carrier": carrier.carrier,
      "service": carrier.service
    },
    "settings": {
      "printFormat": "PDF",
      "printSize": "STOCK_4X6",
      "comments": ""
    }
  }

  console.log('BODYYYYY   ---> ', body)

  if (order.length === 0) {
    let createGuide = await Utils.request({
      url: configs.envia.url + 'ship/generate/',
      method: 'POST',
      json: true,
      headers: {
        Authorization: 'Bearer ' + configs.envia.token
      },
      body: body
    })
    console.log('Crear guia servicio')
    console.log(createGuide.body)
    if (createGuide.body) {
      if (createGuide.body.data) {
        if (createGuide.body.data.length > 0) {
          response.created = true
          console.log('Creado')
          await Utils.asyncForEach(createGuide.body.data, async (guide) => {
            await connection.query('INSERT INTO OrderShipping(`orderId`, carrierId, trackingNumber, trackUrl, totalPrice, service, label) VALUES (?, ?, ?, ?, ?, ?, ?);', [
              carrier.orderId, carrier.carrierId, guide.trackingNumber, guide.trackUrl, guide.totalPrice, guide.service, guide.label
            ])
          })
        }
      }
    }
  }
  await connection.close()
  return response
}

const createOrderIntoCalzzamovil = async (connectionDB, data) => {
  let response = { created: false }
  try {
    if (data.productsDetailId !== undefined) {
      let detail = await connectionDB.query('SELECT * FROM CalzzamovilDetail WHERE orderDetailId = ? LIMIT 1;', [data.productsDetailId])

      if (detail.length === 0) {
        // Orden asignada
        await connectionDB.query('INSERT INTO CalzzamovilDetail (orderDetailId, calzzamovilId, storeId, quantity) VALUES(?, ?, ?, ?);', [
          data.productsDetailId, data.calzzamovilId, data.branch, 1])
        await connectionDB.query('UPDATE Calzzamovil SET dealerId = ?, pipelineId = 2 WHERE orderId = ? AND dealerId IS NULL AND status = 1;', [data.userId, data.orderId])

        // Sync sucursal WS
        let responseWS = await Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/store',
          method: 'POST',
          json: true,
          body: {
            order: data.orderId,
            type: '3',
            store: data.branch
          }
        })

        if (responseWS.body !== undefined) {
          response.created = responseWS.body.sync
        }
      } else {
        console.log('No se asignó orden calzzamóvil (problema con detalle de la orden)')
      }
    }
  } catch (error) {
    console.log(error)
  }
  return response
}

const getInfoStateByCoords = async (data) => {
  let response = { data: null }
  let url = configs.envia.geocode + data + '?csrf_envia_token=' + configs.envia.geocodeToken
  let infoResponse = await Utils.request({
    url: configs.envia.geocode + data + '?csrf_envia_token=' + configs.envia.geocodeToken,
    method: 'GET',
    json: true,
    headers: {
      Authorization: 'Bearer ' + configs.envia.token
    },
    body: {}
  })
  if (infoResponse.body) {
    response.data = infoResponse.body
  }
  return response
}

const findRecolectorStore = async (data) => {
  return [{ branch: '119', zoneCode: '01' }]
  let locations = []
  let collectorStores = [
    { branch: '522', zoneCode: '04' },
    { branch: '096', zoneCode: '17' },
    { branch: '052', zoneCode: '12' },
    { branch: '212', zoneCode: '25' },
    { branch: '129', zoneCode: '21' },
    { branch: '254', zoneCode: '27' },
    { branch: '075', zoneCode: '06' },
    { branch: '525', zoneCode: '19' },
    { branch: '097', zoneCode: '16' },
    { branch: '215', zoneCode: '26' },
    { branch: '173', zoneCode: '23' },
    { branch: '515', zoneCode: '11' },
    { branch: '516', zoneCode: '05' },
    { branch: '012', zoneCode: '07' },
    { branch: '170', zoneCode: '18' },
    { branch: '128', zoneCode: '14' },
    { branch: '088', zoneCode: '03' },
    { branch: '197', zoneCode: '24' },
    { branch: '133', zoneCode: '22' },
    { branch: '121', zoneCode: '20' },
    { branch: '063', zoneCode: '01' },
    { branch: '124', zoneCode: '01' },
    { branch: '514', zoneCode: '01' },
    { branch: '523', zoneCode: '01' }]
  data.locations.forEach((location) => {
    if (collectorStores.some((element) => (element.branch === location.branch || element.zoneCode === location.zone))) {
      let foundIndex = collectorStores.findIndex(element => element.zoneCode === location.zone)
      locations.push(collectorStores[foundIndex])
    }
  })
  if (locations.length === 0) {
    console.log('Tienda por defecto')
    locations.push({ branch: '110', zoneCode: '01' })
  }
  return locations
}

const checkExpressDelivery = async (connectionDatabase, orderId, addressId, paymentMethod) => {

  let response = {
    status: false,
    message: '',
    zoneId: null,
    scheduledId: null,
    cityId: null
  }

  // let availableZonesForExpressDelivery = [
  //   {
  //     state: 'Sinaloa',
  //     stateCode: '25',
  //     municipality: 'Culiacán',
  //     municipalityCode: '006',
  //     cityId: '0200625'
  //   },
  //   {
  //     state: 'Baja California Sur',
  //     stateCode: '03',
  //     municipality: 'Cabo San Lucas',
  //     municipalityCode: '008',
  //     cityId: '0300803'
  //   },
  //   {
  //     state: 'Baja California Sur',
  //     stateCode: '03',
  //     municipality: 'San José del Cabo',
  //     municipalityCode: '008',
  //     cityId: '0400803'
  //   }
  // ]
  let availableZonesForExpressDelivery = await connectionDatabase.query('SELECT id, name, cityMunicipalityStateCode, state, stateCode FROM CalzzamovilCity WHERE status = 1;')

  if (availableZonesForExpressDelivery.length > 0) {
    let municipality = await connectionDatabase.query('SELECT m.id, m.municipalityStateCode AS zoneCode, a.lat, a.lng, c.cityMunicipalityStateCode\
    FROM Address AS a \
    LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode \
    LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode \
    LEFT JOIN State AS s ON s.code = m.stateCode \
    LEFT JOIN City AS c ON c.cityMunicipalityStateCode = l.cityMunicipalityStateCode\
    WHERE a.id = ? AND a.status = 1;', [addressId])


    if (municipality.length !== 1) {
      response.message = 'Zona no disponible para entregas express.'
      return response
    } else {
      municipality = municipality[0]
      if (municipality.lat === null || municipality.lng === null) {
        response.message = 'No se ha especificado la ubicación de destino para entrega express.'
        return response
      } else {
        let availableExpressDelivery = false
        availableZonesForExpressDelivery.forEach(avaiableZone => {
          let cityId = avaiableZone.cityMunicipalityStateCode
          if (cityId === municipality.cityMunicipalityStateCode) {
            availableExpressDelivery = true
          }
        })

        if (!availableExpressDelivery) {
          response.message = 'Zona no disponible para entregas express.'
          return response
        } else {
          let hour = new Date()
          // hour.setHours(hour.getHours() - 7)
          let scheduledId = 1
          if (hour.getHours() > 14) {
            scheduledId = 2
          }

          // Calzzamovil ® no disponible con CrediVale ®
          // if (paymentMethod === 2) {
          //   response.message = 'Método de pago CrediVale ® deshabilitado para entregas express.'
          //   return response
          // } else {
          //   response.status = true
          //   response.zoneId = municipality.id
          //   response.cityId = municipality.cityMunicipalityStateCode
          //   response.scheduledId = scheduledId
          //   await connectionDatabase.query('UPDATE `Order` SET `shippingMethodId`= 4 WHERE id = ?;', [
          //     orderId
          //   ])
          //   return response
          // }
          response.status = true
            response.zoneId = municipality.id
            response.cityId = municipality.cityMunicipalityStateCode
            response.scheduledId = scheduledId
            await connectionDatabase.query('UPDATE `Order` SET `shippingMethodId`= 4 WHERE id = ?;', [
              orderId
            ])
            return response
        }
      }
    }
  }
}

const sendMessageToStore = async (sendMessageToStore, data) => {


  // const backofficeDB = await mysql.connectToDBManually({
  //   host: datasources.backoffice.host,
  //   port: datasources.backoffice.port,
  //   user: datasources.backoffice.user,
  //   password: datasources.backoffice.password,
  //   database: datasources.backoffice.database
  // })

  // let messageInformation = await sendMessageToStore.query('SELECT c.dealerId, o.calzzapatoCode\
  // FROM Calzzamovil AS c\
  // LEFT JOIN CalzzamovilDetail AS cd ON c.id = cd.calzzamovilId\
  // LEFT JOIN `Order` AS o ON o.id = c.orderId\
  // WHERE calzzamovilId = ? LIMIT 1;', [data.calzzamovilId])

  // let dealerInformation = await backofficeDB.query('SELECT TRIM(CONCAT(u.name, " ", u.firstLastName, " ", u.secondLastName)) as fullName, phone FROM User AS u  WHERE u.id = ? LIMIT 1;', [messageInformation[0].dealerId])

  let message = null
  if (data.orders !== undefined && data.orders !== null) {
    if (data.orders.length === 1) {
      message = 'el pedido con codigo: ' + data.orders[0]
    } else {
      message = 'los pedidos con codigo: ' + data.orders[0]
      for (let i = 1; i < data.orders.length; i++) {
        message = message + ', ' + data.orders[i]
      }
    }
  }

  let responseSMS = await Utils.request({
    url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/send-sms',
    method: 'POST',
    json: true,
    body: {
      cellphone: '+52' + data.phone,
      // message: 'El repartidor ' + dealerInformation[0].fullName + ' llegara por el pedido con codigo ' + messageInformation[0].calzzapatoCode
      message: 'Un repartidor llegara por ' + message
    }
  })
  console.log(responseSMS.body)
}

const getRoute = async (data) => {
  let storeProducts = []
  let extraProducts = []
  let findx = 0

  let coords = [...data.houses, ...data.stores]

  if (data.recolected < data.maxProducts) {
    coords = [...data.houses, ...data.stores]
  } else {
    coords = [...data.houses]
  }

  if (data.houses.length === 0 && data.stores.length === 0) {
    //console.log('Entra response', data.response);
    return data.response
  } else {
    let bestDistance = await getBestDistance(data.db, coords, { lat: data.lat, lng: data.lng })
    if (bestDistance !== undefined && bestDistance !== null) {
      if (bestDistance.branch !== undefined && bestDistance.branch !== null) {
        // Is Store

        // Delete store from stores.
        bestDistance.productsCode.forEach((product) => {
          if (data.recolected < data.maxProducts) {
            storeProducts.push(product)
            data.recolected++
          } else {
            extraProducts.push(product)
          }
        })

        findx = data.stores.findIndex(element => element.branch === bestDistance.branch)
        if (storeProducts.length === bestDistance.productsCode.length) {
          // Delete store from stores.
          data.stores.splice(findx, 1)
        } else {
          data.stores[findx].productsCode = [...extraProducts]
          bestDistance.productsCode = [...storeProducts]
        }

        // Delete products from products
        bestDistance.productsCode.forEach(product => {
          let index = data.products.findIndex(element => element.code === product.code && element.size === Number(product.size) && Number(product.stock) >= element.quantity)
          data.houses.push(data.products[index])
          product.orderId = data.products[index].orderId
          product.calzzapatoCode = data.products[index].calzzapatoCode
          product.calzzamovilId = data.products[index].calzzamovilId
          if ((Number(product.stock) - data.products[index].quantity) === 0) {
            data.products.splice(index, 1)
          } else {
            product.stock = Number(product.stock) - data.products[index].quantity
          }
        })

        //Delete products from stores.products
        data.houses.forEach(product => {
          data.stores.forEach((store, idx) => {
            if (store.productsCode.some(element => element.code === product.code && Number(element.size) === Number(product.size) && Number(element.stock) >= product.quantity)) {
              let index = store.productsCode.findIndex(element => element.code === product.code && Number(element.size) === Number(product.size) && Number(element.stock) >= product.quantity)
              if ((Number(store.productsCode[index].stock) - Number(product.quantity)) === 0) {
                store.productsCode.splice(index, 1)
              } else {
                store.productsCode[index].stock = Number(store.productsCode[index].stock) - Number(product.quantity)
              }
            }
          })
        })

        // Delete stores without products.
        data.stores.forEach((store, index) => {
          if (store.productsCode.length === 0) {
            data.stores.splice(index, 1)
          }
        })

        data.stores.forEach(store => {
          store.productsCode.forEach((product, idx) => {
            if (!data.products.some(element => element.code === product.code && Number(product.size) === Number(element.size) && Number(product.stock) >= Number(element.quantity))) {
              store.productsCode.splice(idx, 1)
            }

          })
        })


        // Delete stores without products.
        data.stores.forEach((store, index) => {
          if (store.productsCode.length === 0) {
            data.stores.splice(index, 1)
          }
        })

        if (bestDistance.productsCode.length === 0) {
          bestDistance.productsCode = [...storeProducts]
          let aux = JSON.parse(JSON.stringify(bestDistance))
          aux.productsCode = [...extraProducts]
          data.stores.push(aux)
        }
        data.response.push(bestDistance)

      } else {
        // Is House
        data.response.push(bestDistance)
        data.recolected = data.recolected - Number(bestDistance.quantity)
        let index = data.houses.findIndex(house => house.orderId === bestDistance.orderId)
        data.houses.splice(index, 1)
      }
    }
    return getRoute({ houses: data.houses, stores: data.stores, products: data.products, recolected: data.recolected, maxProducts: data.maxProducts, lat: bestDistance.lat, lng: bestDistance.lng, response: data.response })
  }
}

const getBackofficeDataBase = async () => {
  let db = null
  try {
    db = await mysql.connectToDBManually({
      host: datasources.backoffice.host,
      port: datasources.backoffice.port,
      user: datasources.backoffice.user,
      password: datasources.backoffice.password,
      database: datasources.backoffice.database
    })

  } catch (error) {
    console.log(error);
  }
  return db
}

const isExpressDelivery = async (db, address) => {
  let response = false
  let calzzamovilStores = await db.query('SELECT id, name, cityMunicipalityStateCode, state, stateCode FROM CalzzamovilCity WHERE status = 1;')
  if (calzzamovilStores.length > 0) {
    calzzamovilStores.forEach(store => {
      if (address.cityMunicipalityStateCode === store.cityMunicipalityStateCode ) {
        response = true
      }
    })
  }
  return response
}

module.exports = ({
  getDistance,
  sendInfoForTracking,
  getBestDistance,
  getBestDistanceForGuide,
  getExistProducts,
  createRecolection,
  createCarrierGuide,
  createOrderIntoCalzzamovil,
  getInfoStateByCoords,
  findRecolectorStore,
  checkExpressDelivery,
  sendMessageToStore,

  getRoute,
  getBackofficeDataBase,
  isExpressDelivery
})
