'use strict'

const { config } = require("aws-sdk")
const mysql = require("mysql")
const util = require('util')
const Utils = require('../Utils')
var connections = []

const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'
if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}
const configs = require('../../common/configs.' + NODE_ENV + '.json')
const datasources = require(environment)

const createConnection = async (name, data) => {
  return new Promise(async (resolve, reject) => {
    let pool = mysql.createPool(data)
    pool.getConnection(async (err, conn) => {
      if (err) {
        console.log('Error al establecer conexión con MySQL')
        return resolve({ success: false, error: err })
      }
      console.log('Conexión con MySQL establecida')
      connections.push({
        name: name,
        pool: pool,
        connection: conn
      })
      return resolve({ success: true, pool: pool, connection: conn })
    })
  })
}

const getConnection = async (name) => {
  return new Promise(async (resolve, reject) => {
    let pool = null
    connections.forEach(item => {
      if (item.name === name) {
        pool = item.pool
      }
    })
    pool.getConnection(async (err, connection) => {
      if (err) {
        console.log('Error al obtener conexión con MySQL')
        return reject(err)
      }
      return resolve(connection)
    })
  })
}

const beginTransaction = async (connection) => {
  return new Promise(async (resolve, reject) => {
    connection.beginTransaction(err => {
      if (err) {
        connection.rollback(() => {
          connection.release()
          reject({ success: false })
        })
      } else {
        resolve({ success: true })
      }
    })
  })
}

const commit = async (connection) => {
  return new Promise(async (resolve, reject) => {
    connection.commit(err => {
      if (err) {
        connection.rollback(() => {
          connection.release()
          reject({ success: false })
        })
      } else {
        connection.release()
        resolve({ success: true })
      }
    })
  })
}

const rollback = async (connection) => {
  return new Promise(async (resolve, reject) => {
    connection.rollback(err => {
      if (err) {
        connection.rollback(() => {
          connection.release()
          reject({ success: false })
        })
      } else {
        connection.release()
        resolve({ success: true })
      }
    })
  })
}

const query = async (connection, query, args) => {
  return new Promise(async (resolve, reject) => {
    connection.query(query, args, async (err, data) => {
      connection.release()
      if (err) {
        console.log('Error query')
        return reject(err)
      }
      return resolve(data)
    })
  })
}

function connectToDBManually(credentials = { host: datasources.db.host, port: datasources.db.port, user: datasources.db.user, password: datasources.db.password, database: datasources.db.database }) {
  const connection = mysql.createConnection({
    host: credentials.host,
    port: credentials.port,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database
  })

  return {
    beginTransaction() {
      return util.promisify(connection.beginTransaction).call(connection)
    },
    async query(sql, args) {
      try {
        let query = await util.promisify(connection.query).call(connection, sql, args)
        return query
      } catch (error) {
        if (error !== null && error !== undefined) {
          console.log('*************************************************************************')
          console.log(error.code)
          console.log('*************************************************************************')
          console.log(error);
          if (NODE_ENV !== 'development') {
            Utils.request({
              url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/send-sms',
              method: 'POST',
              json: true,
              body: {
                cellphone: '+526727250809',
                message: 'Problemas en servidor de ' + NODE_ENV + '.'
              }
            })
          }
        }
      }
    },
    commit() {
      return util.promisify(connection.commit).call(connection)
    },
    rollback() {
      return util.promisify(connection.rollback).call(connection)
    },
    close() {
      return util.promisify(connection.end).call(connection)
    }
  }
}

module.exports = ({
  connections,
  createConnection,
  getConnection,
  beginTransaction,
  commit,
  rollback,
  query,
  connectToDBManually
})
