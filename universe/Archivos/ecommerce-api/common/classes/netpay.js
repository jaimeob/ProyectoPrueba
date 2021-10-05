'use strict'

const Utils = require('../Utils.js')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

const loginWithNetpay = async () => {
  let response = await Utils.request({
    method: 'POST', url: configs.netpay.login, body: {
      security: {
        userName: configs.netpay.username,
        password: configs.netpay.password
      }
    },
    json: true,
    headers: {
      "content-type": "application/json"
    }
  })
  return response.body
}

const createStoreAPIKeyWithNetPay = async (token) => {
  let response = await Utils.request({
    method: 'POST', url: configs.netpay.createAPIKey, json: true, headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  return response.body
}

const cardTokenizationWithNetpay = async (card) => {
  let responseToken = await loginWithNetpay()

  if (responseToken === undefined)
    return responseToken

  let responseCreateStoreAPIKey = await createStoreAPIKeyWithNetPay(responseToken.token)

  if (responseCreateStoreAPIKey === undefined)
    return responseCreateStoreAPIKey

  let response = await Utils.request({
    method: 'POST', url: configs.netpay.cardTokenization, json: true, body: {
      username: card.userId,
      storeApiKey: responseCreateStoreAPIKey.response.storeApiKey,
      customerCard: {
        cardNumber: card.number,
        expirationMonth: card.month,
        expirationYear: card.year,
        cvv: card.cvv,
        cardType: card.type,
        cardHolderName: card.titular
      }
    },
    headers: {
      "content-type": "application/json",
      'Authorization': 'Bearer ' + responseToken.token
    }
  })

  return response.body
}

const riskManagerNetPay = async (data) => {
  let netPayCart = []
  data.checkout.cart.products.forEach((item, idx) => {
    if (item.percentageDiscount > 0 || item.savingPrice > 0) {
      item.price = item.discountPrice
    }

    // ¿Es necesario enviar el descuento? Preguntas a NetPay

    netPayCart.push({
      id: "" + idx,
      productSKU: item.selection.code,
      productName: item.name,
      quantity: item.selection.quantity,
      unitPrice: item.price.toFixed(2),
      productCode: item.selection.article
    })
  })

  let responseToken = await loginWithNetpay()

  if (responseToken === undefined)
    return responseToken

  let responseCreateStoreAPIKey = await createStoreAPIKeyWithNetPay(responseToken.token)
  if (responseCreateStoreAPIKey === undefined)
    return responseCreateStoreAPIKey

  let street1 = data.address.street + ' #' + data.address.exteriorNumber + ' ' + data.address.interiorNumber
  street1 = street1.trim()
  let street2 = data.address.type + ' ' + data.address.location
  street2 = street2.trim()

  let response = await Utils.request({
    method: 'POST', url: configs.netpay.riskManager, json: true, body: {
      storeApiKey: responseCreateStoreAPIKey.response.storeApiKey,
      riskManager: {
        promotion: '000000',
        requestFraudService: {
          merchantReferenceCode: data.order,
          deviceFingerprintID: data.deviceFingerprintId,
          deviceFingerprintRaw: "true",
          bill: {
            city: data.address.municipality,
            country: 'MX',
            firstName: data.user.name,
            lastName: data.user.firstLastName,
            email: data.user.email,
            phoneNumber: "" + data.user.cellphone,
            postalCode: data.address.zip,
            state: data.address.state,
            street1: street1,
            street2: street2,
            ipAddress: data.metadata.ip
          },
          ship: {
            city: data.address.municipality,
            country: 'MX',
            firstName: data.user.name,
            lastName: data.user.firstLastName,
            email: data.user.email,
            phoneNumber: "" + data.user.cellphone,
            postalCode: data.address.zip,
            state: data.address.state,
            street1: street1,
            street2: street2,
            // shippingMethod: data.checkout.shippingMethod.name
            shippingMethod: "Envio Calzzapato"
          },
          itemList: netPayCart,
          card: {
            cardToken: data.card.token.token.publicToken
          },
          purchaseTotals: {
            grandTotalAmount: data.checkout.prices.total,
            currency: "MXN"
          },
          merchanDefinedDataList: [
            {
              "id": 2,
              "value": "Web"
            },
            {
              "id": 9,
              "value": "Retail"
            },
            {
              "id": 10,
              "value": "3DS"
            },
            {
              "id": 13,
              "value": "N"
            },
            {
              "id": 20,
              "value": "Departamental"
            },
            {
              "id": 21,
              "value": "No"
            },
            {
              "id": 22,
              "value": "R"
            },
            {
              "id": 25,
              "value": configs.netpay.storeIdAcq
            },
            {
              "id": 28,
              "value": configs.netpay.storeIdAcq
            },
            {
              "id": 50,
              "value": "Si"
            },
            {
              "id": 93,
              "value": "" + data.user.cellphone
            }
          ]
        }
      }
    },
    headers: {
      "content-type": "application/json",
      'Authorization': 'Bearer ' + responseToken.token
    }
  })

  return response.body
}

const chargeAuthNetPay = async (transactionTokenId) => {
  let responseToken = await loginWithNetpay()

  if (responseToken === undefined)
    return responseToken

  let response = await Utils.request({
    method: 'POST', url: configs.netpay.chargeAuth, json: true, body: {
      transactionTokenId: transactionTokenId,
      transactionType: "Auth"
    },
    headers: {
      "content-type": "application/json",
      'Authorization': 'Bearer ' + responseToken.token
    }
  })
  return response.body
}

module.exports = ({
  loginWithNetpay,
  createStoreAPIKeyWithNetPay,
  cardTokenizationWithNetpay,
  riskManagerNetPay,
  chargeAuthNetPay
})
