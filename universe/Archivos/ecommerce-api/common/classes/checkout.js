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
const { payments } = require('@paypal/checkout-server-sdk')

let environment = '../../server/datasources.development.json'
if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}

const datasources = require(environment)

const getFavoriteAddress = async (db, userId, instanceId) => {
  let response = null
  let favoriteAddress = await db.query('SELECT l.cityMunicipalityStateCode, m.municipalityStateCode AS zoneCode, s.name AS state, lt.name AS type, u.email, m.name AS municipality, u.cellphone, sa.reference, sa.id AS id, a.id AS addressId, a.zip, a.street, a.exteriorNumber, a.interiorNumber, l.name AS location, a.lat, a.lng, sa.alias, sa.name, sa.lastname\
        FROM Address AS a \
        LEFT JOIN ShippingAddress AS sa ON sa.addressId = a.id\
        LEFT JOIN `User` AS u ON u.id = sa.userId\
        LEFT JOIN `State` AS s ON s.code = a.stateCode\
        LEFT JOIN `Location` AS l ON a.locationCode = l.locationMunicipalityStateCode\
        LEFT JOIN Municipality AS m ON m.municipalityStateCode = a.municipalityCode\
        LEFT JOIN LocationType AS lt ON l.locationTypeCode = lt.code \
        WHERE u.status = 1 AND a.status = 1 AND sa.status = 1 AND a.instanceId = ? AND u.id = ? AND u.favoriteAddressId = sa.id LIMIT 1 ;', [instanceId, userId])
  if (favoriteAddress.length > 0) {
    response = favoriteAddress[0]
  }
  return response
}

const getProductsCart = async (req) => {

  let response = null
  try {
    let request = await Utils.request({
      method: 'GET',
      url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/cart',
      headers: {
        uuid: req.headers.uuid,
        authorization: req.headers.authorization,
        metadata: req.headers.metadata,
        zip: req.headers.zip || '',
        checkout: true
      },
      json: true
    })
    response = request.body
  } catch (error) {
    console.log(error)
  }
  return response
}

const getStores = async (products) => {
  let response = []
  console.time('Get Stores Calzzapato.')
  try {
    await Utils.asyncForEach(products, async (product) => {
      let stores = await Utils.request({ method: 'GET', url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products/' + product.code + '/stock', json: true })
      let productObj = { code: product.code, stores: stores.body }
      response.push(productObj)
    })
  } catch (error) {
    console.log(error)
  }
  console.timeEnd('Get Stores Calzzapato.')
  return response
}

const getPackageForQuote = async (productsQuantity) => {
  let response = []
  let packInfo = {}

  if (productsQuantity > 0) {
    let pluralProduct = (productsQuantity > 1) ? 's.' : '.'
    packInfo.content = 'Caja con ' + productsQuantity + ' producto' + pluralProduct
    packInfo.leng = (productsQuantity > 1) ? 20 : 10
    packInfo.width = (productsQuantity > 1) ? 45 : 30
    packInfo.height = (productsQuantity > 1) ? 20 : 10
    packInfo.weight = (productsQuantity > 1) ? 5 : 3
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
  response.push(packageInfo)
  return response
}

const getEnviaQuote = async (db, origin, destination, packageArray) => {
  console.time('enviaquote')
  let response = []
  let carriers = await db.query('SELECT id, name, carrierId, urlImage FROM Carrier WHERE status = 1 AND favorite = 1;')
  await Utils.asyncForEach(carriers, async (carrier) => {
    let responseWebService = await Utils.request({
      url: configs.envia.url + 'ship/rate',
      method: 'POST',
      json: true,
      headers: {
        Authorization: 'Bearer ' + configs.envia.token
      },
      body: {
        "origin": origin,
        "destination": destination,
        "packages": packageArray,
        "shipment": {
          "carrier": carrier.name
        }
      }
    })

    if (responseWebService.body !== undefined && responseWebService.body !== null && responseWebService.body.meta !== undefined && responseWebService.body.meta !== 'error' && responseWebService.body.data !== 'Not implemented' && responseWebService.body.data.length > 0) {
      responseWebService.body.data.forEach(carrier2 => {
        if (carrier2.service === 'express') {
          carrier2.urlImage = carrier.urlImage
          response.push(carrier2)
        }
      })
    }
  })
  console.timeEnd('enviaquote')
  return response
}

const getInformationForQuote = async (destination) => {
  let response = { origin: {}, destination: {} }
  const db = mongodb.getConnection('db')

  // Cambiar code de La Primavera.
  let stores = await mongodb.mongoFind(db, 'Store', {
    code: '005'
  })

  if (stores.length > 0) {
    let store = stores[0]
    response.origin.name = store.name
    response.origin.company = 'GRUPO CALZAPATO S.A. DE C.V.'
    response.origin.email = store.zone.email
    response.origin.phone = store.phone
    response.origin.street = store.street
    response.origin.number = store.exteriorNumber
    response.origin.district = store.suburb
    response.origin.country = 'MX'
    response.origin.reference = store.reference
    response.origin.postalCode = store.zip
    response.origin.city = store.municipality
    response.origin.coordinates = {
      latitude: store.lat,
      longitude: store.lng
    }
    response.destination.name = destination.name + ' ' + destination.lastname
    response.destination.company = 'GRUPO CALZAPATO S.A. DE C.V.'
    response.destination.email = destination.email
    response.destination.phone = destination.cellphone
    response.destination.street = destination.street
    response.destination.number = destination.exteriorNumber
    response.destination.district = destination.location
    response.destination.country = 'MX'
    response.destination.reference = destination.reference
    response.destination.postalCode = destination.zip
    response.destination.city = destination.municipality
    response.destination.coordinates = {
      latitude: destination.lat,
      longitude: destination.lng
    }

    let infoCoords = await calzzamovil.getInfoStateByCoords(store.zip)
    response.origin.state = infoCoords.data[0].state.code['2digit']
    response.origin.country = infoCoords.data[0].country.code

    infoCoords = await calzzamovil.getInfoStateByCoords(destination.zip)
    response.destination.state = infoCoords.data[0].state.code['2digit']
    response.destination.country = infoCoords.data[0].country.code

  }

  return response
}

const getShippingMethods = async (db, product, destination, notAvailableLocations, idx) => {
  let response = { calzzamovil: false, shippingMethods: [{ id: 1, name: 'Envío a domicilio', description: '', image: '/envio1.svg', imageSelected: '/envio1-selected.svg', selected: false }], shippingMethod: { id: 1 } }
  try {
    if (product.location !== null && product.location !== undefined && product.location.length > 0 && product.location[0].isLocal) {
      let zones = await getAvailableStores(product.location[0].locations, notAvailableLocations, idx)
      if (zones.length > 0) {
        zones = await getZonesForStores(zones)
        let storeClone = [...zones]
        let status = false
        response.shippingMethods.push({ id: 2, name: 'Click & collect', description: '', stores: storeClone, image: '/click-collect.svg', imageSelected: '/click-collect-selected.svg', selected: status })
      }
      let expressDelivery = await calzzamovil.isExpressDelivery(db, destination)
      if (expressDelivery) {
        if (zones.length > 0) {
          response.shippingMethods.push({ id: 3, name: 'Envío express', description: '', image: '/envio-express.svg', imageSelected: '/envio-express-selected.svg', carriers: [{ id: 1, name: 'Calzzamovil', calzzamovil: true, cost: 99 }], selected: false })
          response.calzzamovil = true
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
  return response
}

const checkClickAndCollect = async (db, zoneCode, zones) => {
  let response = { status: false, message: '', }
  try {
    zones.forEach(avaiableZone => {
      if (avaiableZone.zoneCode === zoneCode) {
        response.status = true
        response.zoneId = zoneCode
      }
    })
  } catch (error) {
    console.log(error)
  }
  return response
}

const checkExpressDelivery = async (db, zoneCode, zones) => {
  let response = { status: false, message: '', }
  let availableZonesForExpressDelivery = [
    {
      state: 'Sinaloa',
      stateCode: '25',
      municipality: 'Culiacán',
      municipalityCode: '006'
    }
  ]

  try {

    // let stores = await getStoresByFavoriteAddress(zones, availableZonesForExpressDelivery[0].municipalityCode + '' + availableZonesForExpressDelivery[0].stateCode, null)
    if (zones !== null && zones !== undefined && zones.length > 0) {
      let availableExpressDelivery = false
      availableZonesForExpressDelivery.forEach(avaiableZone => {
        let zoneCodeAvailable = avaiableZone.municipalityCode + '' + avaiableZone.stateCode
        if (zoneCode === zoneCodeAvailable) {
          availableExpressDelivery = true
        }
      })

      if (!availableExpressDelivery) {
        response.message = 'Zona no disponible para entregas express.'
        return response
      } else {
        response.status = true
      }
    }
  } catch (error) {
    console.log(error)
  }
  return response
}

const getZonesForStores = async (storesArray) => {
  let response = []
  const mdb = mongodb.getConnection('db')
  try {
    await Utils.asyncForEach(storesArray, async (store, idx) => {
      let stores = await mongodb.mongoFind(mdb, 'Store', { 'code': store.branch })
      if (stores.length > 0) {
        store.zoneCode = stores[0].zone.municipalityCode + stores[0].zone.stateCode
        store.lat = stores[0].lat
        store.lng = stores[0].lng
        store.name = stores[0].name
        store.street = stores[0].street
        store.suburb = stores[0].suburb
        store.zip = stores[0].zip
        store.location = stores[0].location
        store.state = stores[0].state
        store.exteriorNumber = stores[0].exteriorNumber
        store.storeType = stores[0].businessUnit
        store.address = store.street + ' ' + store.exteriorNumber + ', ' + store.suburb + ', ' + store.zip + ' ' + store.location + ', ' + store.state
        response.push(store)
      }
    })
  } catch (error) {
    console.log(error)
  }
  return response
}

const getShippingDay = async (product) => {
  let response = { description: '', color: '' }
  try {
    response.color = '#448345'
    if (Utils.isSpecialProduct(product)) {
      response.description = 'De 8 a 10 días hábiles.'
    } else {
      response.description = 'De 3 a 5 días hábiles.'
    }
  } catch (error) {
    console.log(error)
  }
  return response
}

const getStoresByFavoriteAddress = async (stores, zoneCode, size) => {
  let response = []
  let filteredStores = null

  try {
    if (stores.length > 0) {
      if (size !== undefined && size !== null) {
        filteredStores = stores.filter(store => store.zoneCode === zoneCode && store.size === String(size))
        response = filteredStores
      } else {
        filteredStores = stores.filter(store => store.zoneCode === zoneCode)
        response = filteredStores
      }
    }
  } catch (error) {
    console.log(error)
  }
  return response
}

const getClickAndCollectStores = async (stores, clickAndCollectStoresUnavailables) => {
  // Deben llegar tiendas ya filtradas.
  let response = { stores: [], clickAndCollectStoresUnavailables: [] }

  if (clickAndCollectStoresUnavailables !== null && clickAndCollectStoresUnavailables !== undefined && clickAndCollectStoresUnavailables.length > 0) {
    clickAndCollectStoresUnavailables.forEach(clickCollectStore => {
      let index = stores.findIndex(element => (element.branch === clickCollectStore.branch && element.sku === clickCollectStore.productCode))
      if (index !== -1) {
        stores[index].stock = Number(stores[index].stock) - 1
        if (Number(stores[index].stock) === 0) {
          if (clickCollectStore.added) {
            stores.splice(index, 1)
          }
        }
        clickCollectStore.added = true
        if (!clickCollectStore.added) {
          clickCollectStore.added = true
        }
      }
    })
  }
  response.stores = stores
  response.clickAndCollectStoresUnavailables = clickAndCollectStoresUnavailables

  return response
}

const checkRepeatProducts = async (products) => {
  let response = false
  products.forEach(product => {
    if (Number(product.selection.quantity) > 1) {
      response = true
      return response
    }
  })
  return response
}

const getIndividualProducts = async (products) => {
  let response = []
  let productsClones = [...products]
  productsClones.forEach(product => {
    if (Number(product.selection.quantity) > 1) {
      for (let i = 0; i < Number(product.selection.quantity); i++) {
        let productClone = JSON.parse(JSON.stringify(product))
        productClone.selection.quantity = 1
        response = [...response, productClone]
      }
    } else {
      response = [...response, ...product]
    }
  })
  return response
}

const getPaymentInfo = async (db, products, destination, isCredit) => {
  // console.log('isCredit', isCredit);
  let response = { subtotal: null, shippingPrice: null, total: null }
  let totalEstandardShipping = 0
  let countExpressShipping = 0
  let subtotal = 0
  let discount = 0
  let bluePointsWin = 0
  let carrier = null
  let CALZZAPATO_SHIPPING = false
  let CALZZAMOVIL = false
  let EXPRESS_SHIPPING = false

  let minimiumAmount = await db.query('SELECT cost, minimiumAmount FROM ShippingMethod WHERE id = 1;')
  if (minimiumAmount.length > 0) {
    minimiumAmount = minimiumAmount[0].minimiumAmount
  } else {
    minimiumAmount = 999
  }
  let shippingCost = await db.query('SELECT cost, minimiumAmount FROM ShippingMethod WHERE id = 2;')
  if (shippingCost.length > 0) {
    shippingCost = shippingCost[0].cost
  } else {
    shippingCost = 99
  }

  products.forEach(product => {
    if (product.selection !== null && product.selection !== undefined && product.selection.shippingMethod !== null && product.selection.shippingMethod !== undefined && product.selection.shippingMethod.id !== null && product.selection.shippingMethod.id !== undefined) {
      switch (product.selection.shippingMethod.id) {
        case 1:
          totalEstandardShipping = totalEstandardShipping + (isCredit) ? Number(product.creditPrice) : Number(product.price)
          CALZZAPATO_SHIPPING = true
          break
        case 3:
          if (product.selection.shippingMethod.carrier !== null && product.selection.shippingMethod.carrier !== undefined && product.selection.shippingMethod.carrier !== 'Calzzamovil') {
            countExpressShipping++
            carrier = product.selection.shippingMethod.carrier
            EXPRESS_SHIPPING = true
          } else {
            // Sumar Calzzamovil
            CALZZAPATO_SHIPPING = true
          }
          break
      }
      subtotal = (isCredit) ? subtotal + Number(product.creditPrice) : subtotal + Number(product.price)
      discount = discount + Number(product.savingPrice)
      if (!isCredit) {
        bluePointsWin = bluePointsWin + Number(product.bluePoints.win)
      }
    }
  })

  if (CALZZAPATO_SHIPPING && totalEstandardShipping < minimiumAmount) {
    response.shippingPrice = shippingCost
  }

  if (countExpressShipping > 0) {
    let information = await getInformationForQuote(destination)
    let packageInfo = await getPackageForQuote(countExpressShipping)
    let cotizacion = await individualQuote(information.origin, information.destination, packageInfo, carrier)
    response.shippingPrice = response.shippingPrice + cotizacion.cost
  }

  response.subtotal = subtotal
  response.total = subtotal + response.shippingPrice
  response.discount = discount
  response.bluePointsWin = bluePointsWin
  return response
}

const getPaymentMethods = async (db, products, shippingCost, userId) => {
  let response = { cards: [], credit: [], money: [] }
  let paymentMethods = await db.query('SELECT id, name, description, type FROM PaymentMethod WHERE status = 1 ORDER BY `order`;')
  if (paymentMethods.length > 0) {
    for (let i = 0; i < paymentMethods.length; i++) {
      paymentMethods[i].selected = false

    }
    paymentMethods = await validatePaymentsMethods(products, paymentMethods, shippingCost)

    await Utils.asyncForEach(paymentMethods, async (method) => {
      switch (method.type) {
        case 'CARD':
          let userCards = await db.query('SELECT id, userId, titular, alias, `type`, `number`, paymentMethodId FROM Card WHERE userId = ? AND status = 1 AND paymentMethodId = ?;', [userId, method.id])
          if (userCards.length > 0) {
            userCards[userCards.length - 1].selected = true
          }
          method.cards = userCards
          response.cards.push(method)
          break
        case 'CREDIT':
          response.credit.push(method)
          break
        case 'MONEY':
          response.money.push(method)
          break
      }
    })

  }
  return response
}

const getCards = async (db, userId, type) => {
  let response = []
  let cards = await db.query('  SELECT titular, alias, type, number FROM Card WHERE status = 1 AND paymentMethodId = ? AND userId = ? ;', [type, userId])
  if (cards.length > 0) {
    response = cards
  }
  return response
}

const validateCredivale = async () => {
  let response = { valid: false }
  return response
}

const deletePaymentMethod = async (paymentMethods, deleteArray, blockedMessage) => {
  let response = [...paymentMethods]
  deleteArray.forEach(methodId => {
    let index = paymentMethods.findIndex(element => element.id === methodId)
    if (index !== -1) {
      response[index].blocked = true
      response[index].blockedMessage = blockedMessage
    }
  })
  return response
}

const validatePaymentsMethods = async (products, paymentMethods, shippingCost) => {
  let response = []
  let MAX_AMOUNT = 10000
  let BANCOMER = 1
  let CREDIVALE = 2
  let OXXO = 3
  let PAYPAL = 4
  let NETPAY = 5
  let OPENPAY = 9
  let PAYNET = 10

  for (let i = 0; i < paymentMethods.length; i++) {
    paymentMethods[i].blocked = false
  }

  await Utils.asyncForEach(products, async (product) => {
    // Regla 1
    if (product.restricted) {
      paymentMethods = await deletePaymentMethod(paymentMethods, [BANCOMER, OXXO, PAYPAL, NETPAY, OPENPAY, PAYNET], 'Esta forma de pago no está disponible.')
    }
    if (product.selection !== null && product.selection !== undefined && product.selection.shippingMethod !== null && product.selection.shippingMethod !== undefined && product.selection.shippingMethod.id !== null && product.selection.shippingMethod.id !== undefined) {
      // Regla 2
      if (product.selection.shippingMethod.id === 2) {
        paymentMethods = await deletePaymentMethod(paymentMethods, [PAYPAL, CREDIVALE], 'Esta forma de pago no está disponible con Click & Collect.')
      }
      // Regla 3
      if (product.selection.shippingMethod.id === 3 && product.selection.shippingMethod.carrier === undefined) {
        paymentMethods = await deletePaymentMethod(paymentMethods, [PAYPAL, CREDIVALE], 'Esta forma de pago no está disponible con Calzzamovil.')
      }
    }
    // Regla 4
    if (Number(shippingCost.total) > MAX_AMOUNT) {
      paymentMethods = await deletePaymentMethod(paymentMethods, [OXXO, PAYNET], 'Esta forma de pago no está disponible porque su compra sobrepasa los $' + Utils.numberWithCommas(MAX_AMOUNT) + '.')
    }
  })
  response = paymentMethods
  return response
}

const individualQuote = async (origin, destination, packageArray, carrier) => {
  let response = { carrier: null, cost: null, deliveryDate: null }
  let responseWebService = await Utils.request({
    url: configs.envia.url + 'ship/rate',
    method: 'POST',
    json: true,
    headers: {
      Authorization: 'Bearer ' + configs.envia.token
    },
    body: {
      "origin": origin,
      "destination": destination,
      "packages": packageArray,
      "shipment": {
        "carrier": carrier
      }
    }
  })

  if (responseWebService.body !== undefined && responseWebService.body !== null && responseWebService.body.meta !== undefined && responseWebService.body.meta !== 'error' && responseWebService.body.data !== 'Not implemented' && responseWebService.body.data.length > 0) {
    response.carrier = carrier
    responseWebService.body.data.forEach(carrier2 => {
      if (carrier2.service === 'express') {
        response.cost = carrier2.totalPrice
        response.deliveryDate = carrier2.deliveryDate
      }
    })
  }
  return response
}

const getAvailableStores = async (stores, notAvailableLocations, idx) => {
  let response = []
  try {
    notAvailableLocations.forEach(selectedStore => {
      let storeIndex = stores.findIndex(element => element.branch === selectedStore.branch)
      if (storeIndex !== -1) {
        let storeIndex2 = selectedStore.allowedProducts.findIndex(element => element === idx)
        if (storeIndex2 === -1) {
          stores.splice(storeIndex, 1)
        }
      }
    })
    response = stores

  } catch (error) {
    console.log(error)
  }

  return response
}

const validateCoupon = async (db, coupon, paymentInfo, userId) => {
  let response = { valid: false, total: null, coupon: null }
  try {
    let subtotalProducts = paymentInfo.subtotal
    // if (data.isCredit) {
    //   subtotalProducts = 100
    //   // subtotalProducts = response.creditPrices.subtotal
    // }

    let coupons = await db.query('SELECT * FROM Coupon WHERE name = ? AND status = 1 AND minTotalShopping <= ? LIMIT 1;', [coupon, subtotalProducts])
    // El código es válido, está vigente, y coincide el monto mínimo de compra
    if (coupons.length === 1) {
      coupon = coupons[0]
      if (Number(coupon.unique) === 1) {
        let ordersWithCoupon = await db.query('SELECT * FROM `Order` WHERE userId = ? AND couponId = ? AND calzzapatoCode IS NOT NULL', [userId, coupon.id])
        if (ordersWithCoupon.length <= 0) {
          coupon = coupon
          response.coupon = coupon.name
        } else {
          coupon = null
        }
      } else {
        coupon = coupon
        response.coupon = coupon.name
      }

      if (Number(coupon.firstShopping) === 1) {
        let ordersWithCoupon = await db.query('SELECT * FROM `Order` WHERE userId = ? AND calzzapatoCode IS NOT NULL', [userId])
        if (ordersWithCoupon.length <= 0) {
          coupon = coupon
          response.coupon = coupon.name
        } else {
          coupon = null
        }
      }

      // Revisar dirección de la tienda (recoger) o de la entrega a domicilio
      // if (coupon.zone !== null && req.headers.zip !== undefined) {
      //   let zones = await db.query('SELECT * FROM Location WHERE zip = ? AND status = 1 LIMIT 1;', [req.headers.zip])
      //   if (zones.length === 1) {
      //     if (zones[0].municipalityStateCode === coupon.zone) {

      //       response.coupon = coupon
      //     } else {
      //       response.coupon = null
      //     }
      //   } else {
      //     response.coupon = null
      //   }
      // }
    } else {
      coupon = null
    }
    if (coupon !== null && coupon !== undefined) {
      response.valid = true
      if (coupon.percentageDiscount > 0) {
        let discount = 100 - Number(coupon.percentageDiscount)
        discount = discount / 100
        response.total = Number(paymentInfo.subtotal) * discount
      } else if (coupon.priceDiscount > 0) {
        response.total = Number(paymentInfo.subtotal) - Number(coupon.priceDiscount)
      }
      response.couponId = coupons[0].id
    }
  } catch (error) {
    console.log(error)
  }
  return response
}

const getBluePoints = async (calzzapatoUserId, paymentInfo) => {
  let response = { bluePoints: { conditions: null } }
  try {

    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetMonederoAzulCondiciones xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <MonederoID></MonederoID>\
            <IDUsuario>' + calzzapatoUserId + '</IDUsuario>\
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

    // console.log('WS GetMonederoAzulCondiciones')
    // console.log(request.body)

    if (request.body !== undefined) {
      let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
      result = JSON.parse(result)
      result = result['soap:Envelope']['soap:Body']['GetMonederoAzulCondicionesResponse']['GetMonederoAzulCondicionesResult']

      if (Number(result.errNumber['_text']) === 0) {
        response.bluePoints.conditions = {
          exchange: (result.ConCanje['_text'] == 'True') ? true : false
        }
        if (paymentInfo.subtotal >= Number(result.CompraMinimaParaCanje['_text'])) {
          response.bluePoints.conditions.exchange = true
          response.bluePoints.conditions.points = Number(result.SaldoActualPuntos['_text'])
        } else {
          response.bluePoints.conditions.message = 'Compra mínima para utilizar tus puntos azules: $ ' + Number(result.CompraMinimaParaCanje['_text']).toFixed(2) + ' M.N.'
        }
      }
    }




  } catch (error) {
    console.log(error)
  }



  return response
}

const getCurrentUser = async (req) => {
  let user = null
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
    return user
  }
}

const groupProducts = async (products) => {
  let response = []

  products.forEach(product => {

    let index = null
    switch (product.selection.shippingMethod.id) {
      case 1:
        index = response.findIndex(element => element.selection.article === product.selection.article && element.selection.shippingMethod.id === product.selection.shippingMethod.id)
        break
      case 2:
        index = response.findIndex(element => element.selection.article === product.selection.article && element.selection.shippingMethod.id === product.selection.shippingMethod.id && element.selection.shippingMethod.branch === product.selection.shippingMethod.branch)
        break
      case 3:
        index = response.findIndex(element => element.selection.article === product.selection.article && element.selection.shippingMethod.id === product.selection.shippingMethod.id && element.selection.shippingMethod.carrier === product.selection.shippingMethod.carrier)
        break
      default:
        break;
    }
    if (index === -1) {
      response.push(product)
    }

  })
  return response
}

module.exports = ({
  getFavoriteAddress,
  getProductsCart,
  getIndividualProducts,
  getStores,
  getPackageForQuote,
  getEnviaQuote,
  getShippingMethods,
  getInformationForQuote,
  checkClickAndCollect,
  getZonesForStores,
  getShippingDay,
  getStoresByFavoriteAddress,
  checkExpressDelivery,
  getClickAndCollectStores,
  getPaymentInfo,
  checkRepeatProducts,
  individualQuote,
  getAvailableStores,

  // Paso2
  getPaymentMethods,
  getCards,
  validateCredivale,

  // Paso 3
  validateCoupon,
  getBluePoints,
  getCurrentUser,
  groupProducts
})
