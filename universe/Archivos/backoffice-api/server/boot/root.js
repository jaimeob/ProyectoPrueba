// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict'

const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../../common/configs.' + NODE_ENV + '.json')

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router()
  router.get('/status', server.loopback.status())
  router.get('/version', (req, res) => {
    res.send({
      environment: NODE_ENV,
      version: configs.version
    })
  })
  server.use(router)
}
