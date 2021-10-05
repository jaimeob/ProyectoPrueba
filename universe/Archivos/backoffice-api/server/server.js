'use strict'

const loopback = require('loopback')
const boot = require('loopback-boot')
const jwt = require('jsonwebtoken')
const http = require('http')
/*
const https = require('https')
const sslConfig = require('./ssl-config')
*/
const cors = require('cors')
const sync = require('./sync')
const Utils = require('../common/Utils.js')
const app = module.exports = loopback()

const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../common/configs.' + NODE_ENV + '.json')
const PORT = (NODE_ENV === 'development') ? 3003 : 3000

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
const {ErrorReporting} = require('@google-cloud/error-reporting');

// Instantiates a client
const errors = new ErrorReporting();

var logger = require('fluent-logger')
// The 2nd argument can be omitted. Here is a default value for options.
logger.configure('tag_prefix', {
   host: '10.168.0.3',
   port: 24224,
   timeout: 3.0,
   reconnectInterval: 600000 // 10 minutes
});

const report = (err, req) => {
  const payload = {
    serviceContext: {
      service: 'myapp',
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
}

app.use(async (req, res, next) => {
  let headers = req.headers

  if (headers.uuid !== undefined) {
    let db = await Utils.connectToDB()
    
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
          } catch (err) {}
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
  } else {
    if (headers.download !== undefined && Number(headers.download) === 1) {
      if (req.query !== undefined && req.query.filter !== undefined) {
        try {
          let filter = JSON.parse(req.query.filter)
          req.query.filter = filter
        } catch (err) {}
      }
    }
    next()
  }
})

app.get('/error', (req, res, next) => {
  res.send('Something broke!');
  next(new Error('Custom error message'));
});

app.get('/exception', () => {
  JSON.parse('{"malformedJson": true');
});

app.start = (httpOnly) => {
  app.set('port', PORT)
  let server = http.createServer(app)
  /*
  if (httpOnly === undefined) {
    if (ENV === 'development')
      httpOnly = true
    else
      httpOnly = false
  }
  let server = null
  if (!httpOnly) {
    const options = {
      key: sslConfig.privateKey,
      cert: sslConfig.certificate,
    }
    server = https.createServer(options, app)
  } else {
    server = http.createServer(app)
  }
  */
  server.listen(app.get('port'), async () => {
    console.log('Server listening: ' + NODE_ENV)
    await Utils.connectToMongoDB()
  })
  return server
}

// start the server if `$ node server.js`
if (require.main === module) {
  app.start()
  sync.start()
}
