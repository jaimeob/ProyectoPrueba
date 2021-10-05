'use strict'

const Utils = require('../Utils.js')
const NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = (Landing) => {
  Landing.getLandingBlocks = async (req) => {
    let response = { status: false }
    
    try {
      let filter = {
        where: {
          instanceId: req.headers.instanceId,
          url: req.query.filter.where.url.toLowerCase(),
          status: true
        }
      }

      let landings = await Utils.loopbackFind(Landing, filter)

      if (landings.length > 0) {
        response = landings[0]
        response.status = true
        if (response.blocks.length > 0 && response.status) {
          let sort = response.blocks.sort((a, b) => {
            return a.position - b.position
          })
          response.blocks = sort
        }
      }
    } catch (err) {
      console.log(err)
    }
    
    return response
  }

  Landing.remoteMethod('getLandingBlocks', {
    description: 'Get all blocks by landing url',
    http: {
      path: '/blocks',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
