'use strict'

const Utils = require('../Utils.js')
const { v4: uuidv4 } = require('uuid')

const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'

if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}

const datasources = require(environment)

module.exports = function (Page) {
  Page.getPages = async (filter, req) => {
    let response = []

    let dbEcommerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })

    try {

      let instances = await dbEcommerce.query('SELECT id FROM Instance WHERE uuid = ? AND status = 1;', [
        req.headers.businessunit
      ])

      let instanceId = instances[0].id

      let pages = await Utils.loopbackFind(Page, {
        where: {
          instanceId: instanceId,
          status: true
        }
      })

      console.log(pages)

      pages.forEach((page) => {
        page.downloadCatalog = ''
        if (!Utils.isEmpty(page.catalog)) {
          page.downloadCatalog = 'https://api.calzzapato.com:3000/api/catalogs/' + page.catalog + '/download'
        }
      })

      response = pages
    } catch (err) {
      console.log(err)
    }
    await dbEcommerce.close()
    return response
  }

  Page.remoteMethod('getPages', {
    description: 'Get all pages',
    http: {
      path: '/all',
      verb: 'GET'
    },
    accepts: [
      { arg: 'filter', type: 'object', http: { source: 'body' } },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'array',
      root: true
    }
  })

  Page.createPage = async (data, req) => {
    let response = { created: false }

    console.log(data)
    
    let dbEcommerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })

    try {
      let instances = await dbEcommerce.query('SELECT id FROM Instance WHERE uuid = ? AND status = 1;', [
        req.headers.businessunit
      ])

      let instanceId = instances[0].id

      let catalogUUID = ''
      if (!Utils.isEmpty(data.catalog)) {
        catalogUUID = data.catalog.split('/')[data.catalog.split('/').length - 2]
      }

      let insert = await Utils.createMongoDB(Page, {
        instanceId: instanceId,
        uuid: uuidv4(),
        catalog: catalogUUID,
        banner: data.banner,
        mobileBanner: data.mobileBanner,
        name: data.name,
        description: data.description,
        url: data.url
      })

      if (insert.success) {
        response.created = true
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }
    await dbEcommerce.close()
    if (response.error) {
      throw response.error
    }
    return response
  }

  Page.remoteMethod('createPage', {
    description: 'Create custom page of products',
    http: {
      path: '/create',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' }, require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
