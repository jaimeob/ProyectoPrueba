'use strict'
const Utils = require('../Utils.js')

module.exports = (Menu) => {
  Menu.getButtons = async (req) => {
    let instanceId = req.headers.instanceId
    let response = await Utils.loopbackFind(Menu.app.models.Menu, { where: { instanceId: instanceId } })
    return response[0].categories
  }

  Menu.remoteMethod('getButtons', {
    description: 'Get buttons',
    http: {
      path: '/buttons',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'Array',
      root: true
    }
  })

  Menu.getMenu = async (req) => {
    let instanceId = req.headers.instanceId
    let response = await Utils.loopbackFind(Menu.app.models.Menu, { where: { instanceId: instanceId } })
    return response[0].menu
  }

  Menu.remoteMethod(
    'getMenu',
    {
      description: 'Get menu',
      http: {
        path: '/tree',
        verb: 'GET'
      },
      accepts: [
        { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
      ],
      returns: {
        arg: 'data',
        type: 'Array',
        root: true
      }
    }
  )
}
