'use strict'

const mysql = require('../classes/mysql.js')
const mongodb = require('../classes/mongodb.js')
const Utils = require('../Utils.js')
const openpay = require('../classes/openpay')
const netpay = require('../classes/netpay')

module.exports = (Card) => {

  const paymentMethods = {
    NETPAY: 5,
    OPENPAY: 9
  }

  Card.addCard = async (data, req) => {
    const dataCopy = Utils.cloneJson(data)
    const instanceId = req.headers.instanceId
    const userId = req.headers.user.id
    let response = { added: false }
    
    const db = mysql.connectToDBManually()

    try {
      let cut = 4
      let type = '001'

      if (data.type === 'mastercard') {
        type = '002'
      } else if (data.type === 'american-express') {
        type = '003'
        cut = 5
      }

      let cutNumber = data.number.substr(data.number.length - cut, cut)

      let responseCardToken = await netpay.cardTokenizationWithNetpay({
        userId: userId,
        number: data.number,
        month: data.month,
        year: data.year,
        cvv: data.cvv,
        type: type,
        titular: data.titular
      })

      if (responseCardToken !== undefined) {
        let idCard = null
        let token = null

        if (Number(responseCardToken.responseCode) === 200) {
          let cards = await db.query('SELECT * FROM Card WHERE instanceId = ? AND userId = ? AND paymentMethodId = ? AND number = ?', [
            instanceId,
            userId,
            paymentMethods.NETPAY,
            cutNumber
          ])

          if (cards.length === 1) {
            let card = cards[0]

            if (card.status === 2) {
              await db.query('UPDATE Card SET titular = ?, alias = ?, status = 1 WHERE id = ?', [
                data.titular,
                data.alias,
                card.id
              ])
            } else {
              await db.query('UPDATE Card SET alias = ? WHERE id = ?', [
                data.alias,
                card.id
              ])
            }

            token = JSON.parse(card.token)
            data.titular = card.titular
            idCard = card.id
          } else {
            let insertCard = await db.query('INSERT INTO Card (instanceId, userId, paymentMethodId, titular, alias, type, number, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
              instanceId,
              userId,
              paymentMethods.NETPAY,
              data.titular,
              data.alias,
              data.type,
              data.number.substr(data.number.length - cut, cut),
              JSON.stringify(responseCardToken.response.customerToken)
            ])

            if (insertCard.insertId !== undefined) {
              token = responseCardToken.response.customerToken
              idCard = insertCard.insertId
              await mongodb.createMongoDB(Card.app.models.C, dataCopy)
            }
          }

          if (idCard !== null) {
            response = {
              added: true,
              card: {
                id: idCard,
                titular: data.titular,
                alias: data.alias,
                type: data.type,
                number: data.number.substr(data.number.length - cut, cut),
                token: token
              }
            }
          }
        }
      }
    } catch (err) {
      response.error = err
    }

    await db.close()

    if (response.error) {
      throw response.error
    }
    return response
  }

  Card.remoteMethod('addCard', {
    description: 'Add card',
    http: {
      path: '/add',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: "object", require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Card.addOpenpayCard = async (data, req) => {
    const dataCopy = Utils.cloneJson(data)
    const instanceId = req.headers.instanceId
    const userId = req.headers.user.id
    const email = req.headers.user.email

    let errorResponse = null
    let response = { added: false }

    const db = mysql.connectToDBManually()

    try {
      let cut = 4
      let type = '001'

      if (data.type === 'mastercard') {
        type = '002'
      } else if (data.type === 'american-express') {
        type = '003'
        cut = 5
      }

      let cutNumber = data.number.substr(data.number.length - cut, cut)
      let idCard = null
      let token = null
      let cards = await db.query('SELECT * FROM Card WHERE instanceId = ? AND userId = ? AND paymentMethodId = ? AND number = ?', [
        instanceId,
        userId,
        paymentMethods.OPENPAY,
        cutNumber
      ])

      if (cards.length === 1) {
        let card = cards[0]

        if (card.status === 2) {
          await db.query('UPDATE Card SET titular = ?, alias = ?, status = 1 WHERE id = ?', [
            data.titular,
            data.alias,
            card.id
          ])
        } else {
          await db.query('UPDATE Card SET alias = ? WHERE id = ?', [
            data.alias,
            card.id
          ])
        }
        token = JSON.parse(card.token)
        data.titular = card.titular
        idCard = card.id
      } else {

        let userCards = await db.query('SELECT id FROM Card WHERE userId = ? AND paymentMethodId = 9 AND status = 1;', [userId])

        if (userCards.length < 3) {


          data.email = email
          data.customerInfo = {
            name: data.titular,
            email: email,
            requires_account: false
          }

          let createCardResponse = await openpay.createCard(data)

          if (createCardResponse.success === true) {

            let insertCard = await db.query('INSERT INTO Card (instanceId, userId, paymentMethodId, titular, alias, type, number, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
              instanceId,
              userId,
              paymentMethods.OPENPAY,
              data.titular,
              data.alias,
              data.type,
              data.number.substr(data.number.length - cut, cut),
              JSON.stringify(data.cardInfo)
            ])

            if (insertCard.insertId !== undefined) {
              idCard = insertCard.insertId
              await mongodb.createMongoDB(Card.app.models.C, dataCopy)
            }

          } else {
            errorResponse = createCardResponse.error
          }
        } else {
          errorResponse = 'No puedes agregar mas de 3 tarjetas.'
        }
      }

      if (idCard !== null) {
        response = {
          added: true,
          card: {
            id: idCard,
            titular: data.titular,
            alias: data.alias,
            type: data.type,
            number: data.number.substr(data.number.length - cut, cut),
            token: data.cardInfo
          }
        }
      } else {
        response = {
          added: false,
          error: errorResponse
        }

      }
    } catch (err) {
      response.error = err
    }

    await db.close()

    if (response.error) {
      throw response.error
    }
    return response
  }

  Card.remoteMethod('addOpenpayCard', {
    description: 'Add card',
    http: {
      path: '/openpay/add',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: "object", require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })
}
