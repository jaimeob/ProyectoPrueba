'use strict'

const loopback = require('loopback')
const boot = require('loopback-boot')
const jwt = require('jsonwebtoken')
const http = require('http')
const sync = require('./sync')

const mysql = require('../common/classes/mysql.js')
const mongodb = require('../common/classes/mongodb.js')

const cors = require('cors')
const Utils = require('../common/Utils.js')
const app = module.exports = loopback()

const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../common/configs.' + NODE_ENV + '.json')
const PORT = (NODE_ENV === 'development') ? 3001 : 3000

let environment = '../server/datasources.development.json'
if (NODE_ENV === 'staging') {
  environment = '../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../server/datasources.json'
}

const datasources = require(environment)

// boot scripts mount components like REST API
boot(app, __dirname)

app.use(cors())

// Configurar cabeceras y cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
  next()
})

// Imports the Google Cloud client library
const { ErrorReporting } = require('@google-cloud/error-reporting');
const { Logger } = require('mongodb')
// Instantiates a client
const errors = new ErrorReporting({
  projectId: 'welcometolevel',
  keyFilename: 'welcometolevel-fecdbf45f289.json',
  reportMode: 'production',
});
const structuredLogger = require('fluent-logger').createFluentSender('myapp', {
  host: 'localhost',
  port: 24224,
  timeout: 3.0,
});
const report = (err, req) => {
  const payload = {
    serviceContext: {
      service: 'api',
    },
    message: err.stack,
    context: {
      httpRequest: {
        url: req.originalUrl,
        method: req.method,
        referrer: req.header('Referer'),
        userAgent: req.header('User-Agent'),
        remoteIp: req.ip,
        responseStatusCode: 500,
      },
    },
  };
  structuredLogger.emit('errors', payload);
};
// Handle errors (the following uses the Express framework)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  report(err, req);
  res.status(500).send(err.response || 'Something broke!');
});

app.use(async (req, res, next) => {
  let headers = req.headers
  if (headers.apk !== undefined && headers.apk === 'kangoapp') {
    const db = await mysql.connectToDBManually({
      host: datasources.backoffice.host,
      port: datasources.backoffice.port,
      user: datasources.backoffice.user,
      password: datasources.backoffice.password,
      database: datasources.backoffice.database
    })

    try {
      let instances = await db.query('SELECT i.id FROM Instance AS i WHERE i.uuid = ? AND i.status = 1 LIMIT 1;', [headers.uuid])
      if (instances.length > 0) {
        let instanceId = JSON.parse(JSON.stringify(instances[0]))
        instanceId = instanceId.id
        headers.instanceId = instanceId
        req.headers = headers

        if (req.query !== undefined && req.query.filter !== undefined) {
          try {
            let filter = JSON.parse(req.query.filter)
            filter.where.instanceId = instanceId
            req.query.filter = filter
            if (req.originalUrl !== undefined && req.originalUrl.split('products').length > 1 || req.originalUrl.split('brands').length > 1) {
              delete req.query.filter.where.instanceId
            }
          } catch (err) { }
        }

        if (headers.authorization !== undefined && !Utils.isEmpty(headers.authorization)) {
          let userCredentials = jwt.verify(headers.authorization, configs.jwtPrivateKey)
          let user = userCredentials.split('|')[0]
          let password = userCredentials.split('|')[1]
          let users = await db.query('SELECT * FROM User WHERE email = ? AND password = ? AND status = 1 LIMIT 1;', [user, password])

          if (users.length > 0) {
            await db.close()
            headers.user = users[0]
            req.headers = headers
            next()
          }
          else {
            await db.close()
            next(Error('User not found'))
          }
        }
        else {
          await db.close()
          next()
        }
      }
      else {
        await db.close()
        next()
      }
    } catch (err) {
      console.log(err)
      await db.close()
      next(err)
    }
  } else if (headers.apk === undefined && headers.uuid !== undefined) {
    const db = await mysql.connectToDBManually()
    try {
      let instances = await db.query('SELECT i.id, i.androidVersionCode, i.iosVersionCode FROM Instance AS i WHERE i.uuid = ? AND i.status = 1 LIMIT 1;', [headers.uuid])
      if (instances.length > 0) {
        let instanceId = JSON.parse(JSON.stringify(instances[0]))
        instanceId = instanceId.id
        let androidVersionCode = instanceId.androidVersionCode
        let iosVersionCode = instanceId.iosVersionCode
        headers.instanceId = instanceId
        headers.versioncode = req.headers.versioncode
        req.headers = headers

        if (req.query !== undefined && req.query.filter !== undefined) {
          try {
            let filter = JSON.parse(req.query.filter)
            filter.where.instanceId = instanceId
            req.query.filter = filter
            if (req.originalUrl !== undefined && req.originalUrl.split('products').length > 1 || req.originalUrl.split('brands').length > 1) {
              delete req.query.filter.where.instanceId
            }
          } catch (err) { }
        }

        if (headers.authorization !== undefined && !Utils.isEmpty(headers.authorization)) {
          let userCredentials = jwt.verify(headers.authorization, configs.jwtPrivateKey)
          let user = userCredentials.split('|')[0]
          let password = userCredentials.split('|')[1]
          let users = await db.query('SELECT * FROM User WHERE email = ? AND password = ? AND status = 1 LIMIT 1;', [user, password])
          
          if (users.length > 0) {
            headers.user = users[0]
            req.headers = headers
            
            let DEVICE = 1
            if (headers.device !== undefined && headers.device !== null) {
              DEVICE = Number(headers.device)
            }

            // Validación para actualizar.
            if (headers.versioncode === undefined || headers.versioncode === null) {
              // Send notification
              if (DEVICE !== 1) {
                let diference = await db.query('SELECT DATEDIFF(NOW(), updatedAt) AS days, appVersion FROM User WHERE email = ? AND password = ? AND status = 1 LIMIT 1;', [user, password])
                if (diference[0].appVersion === null || diference[0].appVersion === 0 || diference[0].days > 0) {
                  await db.query('UPDATE `User` SET appVersion = 1 WHERE id = ?;', [req.headers.user.id])
                  let tokens = await db.query('SELECT ft.*, i.alias, ft.instanceId, i.alias \
                  FROM FirebaseToken AS ft\
                  LEFT JOIN Device AS d ON d.id = ft.deviceId\
                  LEFT JOIN Instance AS i ON i.id = ft.instanceId\
                  WHERE ft.status = 1 AND d.status = 1 AND ft.token IS NOT NULL AND d.userId = ? AND ft.instanceId = ?;', [users[0].id, instanceId])
                  await Utils.sendNotification({ notificationType: 'NEED_ACTUALIZATION', tokens, send: true })
                }
              }
            } else if (DEVICE !== 1) {
              let diference = await db.query('SELECT DATEDIFF(NOW(), updatedAt) AS days, appVersion FROM User WHERE email = ? AND password = ? AND status = 1 LIMIT 1;', [user, password])
              let versionCode = Number(androidVersionCode)
              if (DEVICE === 3) {
                versionCode = Number(iosVersionCode)
              } 
              if (Number(headers.versioncode) < Number(versionCode) && diference[0].days > 0 ) {
                await db.query('UPDATE `User` SET appVersion = 1 WHERE id = ?;', [req.headers.user.id])
                let tokens = await db.query('SELECT ft.*, i.alias, ft.instanceId, i.alias \
                FROM FirebaseToken AS ft\
                LEFT JOIN Device AS d ON d.id = ft.deviceId\
                LEFT JOIN Instance AS i ON i.id = ft.instanceId\
                WHERE ft.status = 1 AND d.status = 1 AND ft.token IS NOT NULL AND d.userId = ? AND ft.instanceId = ?;', [users[0].id, instanceId])
                await Utils.sendNotification({ notificationType: 'NEED_ACTUALIZATION', tokens, send: true })
              }
            }
            await db.close()
            next()
          }
          else {
            await db.close()
            //let userss = await db.query('SELECT * FROM User WHERE email = ? AND password = ? AND status = 1 LIMIT 1;', [user, password])
            //headers.user = userss[0]
            //req.headers = headers
            next(Error('User not found'))
          }
        }
        else {
          await db.close()
          next()
        }
      }
      else {
        await db.close()
        next()
      }
    } catch (err) {
      console.log(err)
      await db.close()
      next(err)
    }
  } else {
    next()
  }
})

app.get('/error', (req, res, next) => {
  res.send('Something broke!');
  next(new Error('Custom error message'))
})

app.use(errors.express)

app.start = () => {
  app.set('port', PORT)
  let server = http.createServer(app)
  server.listen(app.get('port'), async () => {
    console.log('Server listening: ' + NODE_ENV)

    await mysql.createConnection('db', {
      host: datasources.db.host,
      port: datasources.db.port,
      user: datasources.db.user,
      password: datasources.db.password,
      database: datasources.db.database
    })

    await mongodb.createConnection('db', {
      host: datasources.mongodb.host,
      port: datasources.mongodb.port,
      user: datasources.mongodb.user,
      password: datasources.mongodb.password,
      database: datasources.mongodb.database
    })
  })

  return server
}

// start the server if `$ node server.js`
if (require.main === module) {
  app.start()
  sync.start()
}
