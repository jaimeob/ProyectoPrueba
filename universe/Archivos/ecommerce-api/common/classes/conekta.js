'use strict'

const conekta = require('conekta')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

const createConektaOrder = async (data) => {
  return new Promise((resolve, reject) => {
    conekta.api_key = configs.conektaAPIKey
    conekta.api_version = configs.conektaAPIVersion
    conekta.Order.create(data, (err, res) => {
      if (err) return reject({ success: false, error: err })
      return resolve({ success: true, order: res })
    })
  })
}

module.exports = ({
  createConektaOrder
})
