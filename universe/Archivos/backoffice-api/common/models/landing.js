'use strict'

const Utils = require('../Utils.js')
const mongo = require('mongodb')
const ObjectId = require('mongodb').ObjectID
const uuid = require('uuid')

const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'

if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}

const datasources = require(environment)

let CDN = require('../classes/cdn.js')

module.exports = function (Landing) {
  Landing.getLandings = async (req) => {
    let response = []

    let db = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password,
      database: datasources.ecommerce.database
    })

    try {
      let instances = await db.query('SELECT id FROM Instance WHERE uuid = ?', [
        req.headers.businessunit
      ])

      let filter = {
        where: {
          instanceId: instances[0].id,
          status: true
        }
      }

      if (req.query.filter !== undefined) {
        req.query.filter = JSON.parse(req.query.filter)
        filter.where.url = { like: req.query.filter.param }
      }

      let landings = await Utils.loopbackFind(Landing, filter)
      response = landings

      landings.forEach(landing => {
        landing.downloadCatalog = ''
        if (!Utils.isEmpty(landing.catalog)) {
          landing.downloadCatalog = 'https://api.calzzapato.com:3000/api/catalogs/' + landing.catalog + '/download'
        }

        if (landing.blocks === undefined) {
          landing.count = 0
        } else {
          landing.count = 0
          landing.blocks.forEach((block, idx) => {
            console.log(block)
            if (block.status) {
              landing.count = landing.count + 1
            }
          })
        }
      })

    } catch (err) {
      console.log(err)
    }

    await db.close()
    return response
  }

  Landing.remoteMethod('getLandings', {
    description: 'Get all landings',
    http: {
      path: '/all',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'array',
      root: true
    }
  })

  Landing.getEntity = async (landingId, req) => {
    let response = null

    try {
      let filter = {
        where: {
          id: landingId,
          status: true
        }
      }

      let landings = await Utils.loopbackFind(Landing, filter)

      if (landings.length > 0) {
        response = landings[0]
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

  Landing.remoteMethod('getEntity', {
    description: 'Get entity',
    http: {
      path: '/:landingId/entity',
      verb: 'GET'
    },
    accepts: [
      { arg: 'landingId', type: 'string' },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'array',
      root: true
    }
  })

  Landing.createNewLanding = async (data, req) => {
    let dbEcommerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })

    let instances = await dbEcommerce.query('SELECT id FROM Instance WHERE uuid = ? AND status = 1;', [
      req.headers.businessunit
    ])

    let instanceId = instances[0].id
    await dbEcommerce.close()

    let response = {
      added: false,
      error: null
    }

    try {
      if (Utils.validateStaticUrl(data.url).exists) {
        throw '0002'
      }

      let landings = await Utils.loopbackFind(Landing, { where: { url: data.url, instanceId: instanceId } })

      let catalogUUID = ''
      if (!Utils.isEmpty(data.catalog)) {
        catalogUUID = data.catalog.split('/')[data.catalog.split('/').length - 2]
      }

      if (landings.length === 0) {
        let insertLanding = await Utils.createMongoDB(Landing, {
          instanceId: instanceId,
          title: data.title,
          description: data.description,
          url: data.url,
          catalog: catalogUUID,
          showProducts: data.showProducts,
          blocks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          status: true
        })

        if (insertLanding.success) {
          response.added = true
        }
      } else {
        if (landings[0].status) {
          throw '0001'
        } else {
          let updateLanding = await Utils.updateMongoDb(Landing, { status: true, updatedAt: new Date() }, landings[0].id)

          if (updateLanding.success) {
            response.added = true
          }
        }
      }
    } catch (err) {
      response.error = err
    }

    if (response.error) {
      throw response.error
    }
    return response
  }

  Landing.remoteMethod('createNewLanding', {
    description: 'Add new landing',
    http: {
      path: '/new',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' }, require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Landing.createNewBlock = async (landingId, data, req) => {
    let response = { created: false }

    let dbEcommerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })
    
    let businessUnit = await dbEcommerce.query('SELECT i.id, i.alias, c.businessUnit FROM Instance AS i LEFT JOIN Config AS c ON i.id = c.instanceId WHERE i.uuid = ? AND i.status = 1 LIMIT 1;', [
      req.headers.businessunit
    ])

    let instanceId = businessUnit[0].id
    let alias = businessUnit[0].alias.trim().toLowerCase()
    businessUnit = businessUnit[0].businessUnit

    await dbEcommerce.close()

    try {
      let landings = await Utils.loopbackFind(Landing, {
        where: {
          id: landingId,
          status: true
        }
      })

      let landing = landings[0]

      let sort = landing.blocks.sort((a, b) => {
        return a.position - b.position
      })

      landing.blocks = sort

      let position = 1
      if (landing.blocks.length > 0) {
        position = landing.blocks[landing.blocks.length - 1].position
        position += 1
      }

      let block = null

      // Text block
      if (data.blockTypeId === 1) {
        let callToAction = null
        if (!Utils.isEmpty(data.callToActionUrl)) {
          callToAction = await Utils.getCallToAction(data.callToActionUrl, req.headers.businessunit)
          callToAction.text = data.callToActionText || ''
        }

        block = {
          instanceId: instanceId,
          blockTypeId: data.blockTypeId,
          identifier: data.identifier,
          position: position,
          configs: {
            fullWidth: data.fullWidth,
            textAlign: data.textAlign,
            paddingTop: data.paddingTop,
            paddingBottom: data.paddingBottom,
            title: data.title,
            message: data.message,
            cta: callToAction
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          v: '2.0',
          status: true
        }
      } // Banner grid block
      else if (data.blockTypeId === 2) {
        let totalSize = 0
        await Utils.asyncForEach(data.grid, async (item, idx) => {
          // Generate call to action
          if (!Utils.isEmpty(item.callToAction)) {
            let callToAction = await Utils.getCallToAction(item.callToAction, req.headers.businessunit)
            data.grid[idx].cta = callToAction
          } else {
            data.grid[idx].cta = null
          }

          item.image = item.image[0]
          
          item.image.name = uuid.v4()
          // Upload desktop image own cdn
          let uploadData = {
            name: 'landings/' + alias + '/' + item.image.name + '.webp',
            data: item.image.data,
            contentType: item.image.type
          }
          
          let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
            instanceId: instanceId,
            fileName: item.image.name
          }, {
            instanceId: instanceId,
            documentTypeId: item.image.documentTypeId,
            fileName: item.image.name,
            fileType: item.image.type,
            fileSize: item.image.size,
            height: item.image.height,
            width: item.image.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            item.image = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: item.image.size,
              width: item.image.width,
              height: item.image.height
            }
          }
          totalSize += item.image.size
        })

        block = {
          instanceId: instanceId,
          blockTypeId: data.blockTypeId,
          identifier: data.identifier,
          position: position,
          configs: {
            fullWidth: data.fullWidth,
            gridMobile: data.gridMobile,
            paddingTop: data.paddingTop,
            paddingBottom: data.paddingBottom,
            heightBanner: data.heightBanner,
            separationItems: data.separationItems,
            borderRadius: data.borderRadius,
            backgroundColor: data.backgroundColor,
            columns: data.columns,
            totalSize: totalSize,
            grid: data.grid
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          v: '2.0',
          status: true
        }
      }
      // Banner carousel block
      else if (data.blockTypeId === 3) {
        // Create an banner grid block
        let totalSize = 0
        
        data.banners.push(data.secondaryTopBanner)
        data.banners.push(data.secondaryBottomBanner)

        await Utils.asyncForEach(data.banners, async (item, idx) => {
          // Generate call to action
          if (!Utils.isEmpty(item.callToAction)) {
            let callToAction = await Utils.getCallToAction(item.callToAction, req.headers.businessunit)
            data.banners[idx].cta = callToAction
          } else {
            data.banners[idx].cta = null
          }

          item.desktopImage.name = uuid.v4()
          
          // Upload desktop image own cdn
          let uploadData = {
            name: 'landings/' + alias + '/' + item.desktopImage.name + '.webp',
            data: item.desktopImage.data,
            contentType: item.desktopImage.type
          }
          
          let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
            instanceId: instanceId,
            fileName: item.desktopImage.name
          }, {
            instanceId: instanceId,
            documentTypeId: item.desktopImage.documentTypeId,
            fileName: item.desktopImage.name,
            fileType: item.desktopImage.type,
            fileSize: item.desktopImage.size,
            height: item.desktopImage.height,
            width: item.desktopImage.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            item.desktopImage = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: item.desktopImage.size,
              width: item.desktopImage.width,
              height: item.desktopImage.height
            }
          }
          totalSize += item.desktopImage.size

          item.mobileImage.name = uuid.v4()
          // Upload desktop image own cdn
          uploadData = {
            name: 'landings/' + alias + '/' + item.mobileImage.name + '.webp',
            data: item.mobileImage.data,
            contentType: item.mobileImage.type
          }
          
          cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
            instanceId: instanceId,
            fileName: item.mobileImage.name
          }, {
            instanceId: instanceId,
            documentTypeId: item.mobileImage.documentTypeId,
            fileName: item.mobileImage.name,
            fileType: item.mobileImage.type,
            fileSize: item.mobileImage.size,
            height: item.mobileImage.height,
            width: item.mobileImage.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            item.mobileImage = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: item.mobileImage.size,
              width: item.mobileImage.width,
              height: item.mobileImage.height
            }
          }
          totalSize += item.mobileImage.size
        })

        let banners = Utils.cloneJson(data.banners)
        banners.pop()
        banners.pop()

        block = {
          instanceId: instanceId,
          blockTypeId: data.blockTypeId,
          identifier: data.identifier,
          position: position,
          configs: {
            gridBannerMobile: data.gridBannerMobile,
            paddingTop: data.paddingTop,
            paddingBottom: data.paddingBottom,
            totalSize: totalSize,
            banners: banners,
            secondaryTopBanner: data.banners[data.banners.length - 2],
            secondaryBottomBanner: data.banners[data.banners.length - 1],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          v: '2.0',
          status: true
        }
      } else if (data.blockTypeId === 4) {
        // Create an banner block
        let totalSize = 0
        await Utils.asyncForEach(data.banners, async (item, idx) => {
          // Generate call to action
          if (!Utils.isEmpty(item.callToAction)) {
            let callToAction = await Utils.getCallToAction(item.callToAction, req.headers.businessunit)
            data.banners[idx].cta = callToAction
          } else {
            data.banners[idx].cta = null
          }

          item.desktopImage.name = uuid.v4()
          // Upload desktop image own cdn
          let uploadData = {
            name: 'landings/' + alias + '/' + item.desktopImage.name + '.webp',
            data: item.desktopImage.data,
            contentType: item.desktopImage.type
          }
          
          let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
            instanceId: instanceId,
            fileName: item.desktopImage.name
          }, {
            instanceId: instanceId,
            documentTypeId: item.desktopImage.documentTypeId,
            fileName: item.desktopImage.name,
            fileType: item.desktopImage.type,
            fileSize: item.desktopImage.size,
            height: item.desktopImage.height,
            width: item.desktopImage.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            item.desktopImage = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: item.desktopImage.size,
              width: item.desktopImage.width,
              height: item.desktopImage.height
            }
          }
          totalSize += item.desktopImage.size

          item.mobileImage.name = uuid.v4()
          // Upload desktop image own cdn
          uploadData = {
            name: 'landings/' + alias + '/' + item.mobileImage.name + '.webp',
            data: item.mobileImage.data,
            contentType: item.mobileImage.type
          }
          
          cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
            instanceId: instanceId,
            fileName: item.mobileImage.name
          }, {
            instanceId: instanceId,
            documentTypeId: item.mobileImage.documentTypeId,
            fileName: item.mobileImage.name,
            fileType: item.mobileImage.type,
            fileSize: item.mobileImage.size,
            height: item.mobileImage.height,
            width: item.mobileImage.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            item.mobileImage = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: item.mobileImage.size,
              width: item.mobileImage.width,
              height: item.mobileImage.height
            }
          }
          totalSize += item.mobileImage.size
        })

        block = {
          instanceId: instanceId,
          blockTypeId: data.blockTypeId,
          identifier: data.identifier,
          position: position,
          configs: {
            fullWidth: data.fullWidth,
            paddingTop: data.paddingTop,
            paddingBottom: data.paddingBottom,
            heightBanner: data.heightBanner,
            heightBannerMobile: data.heightBannerMobile,
            totalSize: totalSize,
            banners: data.banners
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          v: '2.0',
          status: true
        }
      } else if (data.blockTypeId === 15) {
        // Create an banner block
        let totalSize = 0
        await Utils.asyncForEach(data.items, async (item, idx) => {
          // Generate call to action
          if (!Utils.isEmpty(item.callToAction)) {
            let callToAction = await Utils.getCallToAction(item.callToAction, req.headers.businessunit)
            data.items[idx].cta = callToAction
          } else {
            data.items[idx].cta = null
          }

          item.image.name = uuid.v4()
          // Upload desktop image own cdn
          let uploadData = {
            name: 'landings/' + alias + '/' + item.image.name + '.webp',
            data: item.image.data,
            contentType: item.image.type
          }
          
          let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
            instanceId: instanceId,
            fileName: item.image.name
          }, {
            instanceId: instanceId,
            documentTypeId: item.image.documentTypeId,
            fileName: item.image.name,
            fileType: item.image.type,
            fileSize: item.image.size,
            height: item.image.height,
            width: item.image.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            item.image = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: item.image.size,
              width: item.image.width,
              height: item.image.height
            }
          }
          totalSize += item.image.size
        })

        block = {
          instanceId: instanceId,
          blockTypeId: data.blockTypeId,
          identifier: data.identifier,
          position: position,
          configs: {
            fullWidth: data.fullWidth,
            paddingTop: data.paddingTop,
            paddingBottom: data.paddingBottom,
            heightBanner: data.heightBanner,
            separationItems: data.separationItems,
            borderRadius: data.borderRadius,
            backgroundColor: data.backgroundColor,
            totalSize: totalSize,
            items: data.items
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          v: '2.0',
          status: true
        }
      } else if (data.blockTypeId === 17) {
        // Countdown Block
        let totalSize = 0
        let banners = []
        banners.push(data.banner)
        banners.push(data.finishBanner)

        await Utils.asyncForEach(banners, async (item, idx) => {
          item.desktopImage.name = uuid.v4()
          // Upload desktop image own cdn
          let uploadData = {
            name: 'landings/' + alias + '/' + item.desktopImage.name + '.webp',
            data: item.desktopImage.data,
            contentType: item.desktopImage.type
          }
          
          let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
            instanceId: instanceId,
            fileName: item.desktopImage.name
          }, {
            instanceId: instanceId,
            documentTypeId: item.desktopImage.documentTypeId,
            fileName: item.desktopImage.name,
            fileType: item.desktopImage.type,
            fileSize: item.desktopImage.size,
            height: item.desktopImage.height,
            width: item.desktopImage.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            item.desktopImage = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: item.desktopImage.size,
              width: item.desktopImage.width,
              height: item.desktopImage.height
            }
          }
          totalSize += item.desktopImage.size

          item.mobileImage.name = uuid.v4()
          // Upload desktop image own cdn
          uploadData = {
            name: 'landings/' + alias + '/' + item.mobileImage.name + '.webp',
            data: item.mobileImage.data,
            contentType: item.mobileImage.type
          }
          
          cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
            instanceId: instanceId,
            fileName: item.mobileImage.name
          }, {
            instanceId: instanceId,
            documentTypeId: item.mobileImage.documentTypeId,
            fileName: item.mobileImage.name,
            fileType: item.mobileImage.type,
            fileSize: item.mobileImage.size,
            height: item.mobileImage.height,
            width: item.mobileImage.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            item.mobileImage = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: item.mobileImage.size,
              width: item.mobileImage.width,
              height: item.mobileImage.height
            }
          }
          totalSize += item.mobileImage.size
        })

        let callToAction = null
        if (!Utils.isEmpty(data.finishBanner.callToAction)) {
          callToAction = await Utils.getCallToAction(data.finishBanner.callToAction, req.headers.businessunit)
        }

        block = {
          instanceId: instanceId,
          blockTypeId: data.blockTypeId,
          identifier: data.identifier,
          position: position,
          configs: {
            fullWidth: data.fullWidth,
            paddingTop: data.paddingTop,
            paddingBottom: data.paddingBottom,
            heightBanner: data.heightBanner,
            heightBannerMobile: data.heightBannerMobile,
            countdownVerticalAlign: data.countdownVerticalAlign,
            countdownHorizontalAlign: data.countdownHorizontalAlign,
            banner: {
              seoDescription: banners[0].seoDescription,
              desktopImage: banners[0].desktopImage,
              mobileImage: banners[0].mobileImage
            },
            finishBanner: {
              seoDescription: banners[1].seoDescription,
              desktopImage: banners[1].desktopImage,
              mobileImage: banners[1].mobileImage,
              cta: callToAction
            },
            eventDate: new Date(data.eventDate),
            totalSize: totalSize
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          v: '2.0',
          status: true
        }
      } else if (data.blockTypeId === 22) {
        // Block de querys
        let query = await Utils.createQuery(businessUnit, data)
        block = {
          instanceId: instanceId,
          blockTypeId: data.blockTypeId,
          identifier: data.identifier,
          configs: {
            title: data.title,
            description: data.description,
            order: data.order,
            genders: data.genders || [],
            brands: data.brands || [],
            category: data.category || [],
            sizes: data.sizes || [],
            atributtes: data.atributtes || [],
            banner: data.banner || false,
            withQuery: data.withQuery || false,
            withInformation: data.withInformation || false,
            productLimit: data.productLimit,
            productsCode: data.productsCode,
            discount: data.discount,
            query: query,
            queryString: JSON.stringify(query),
            fullWidth: data.fullWidth,
            paddingTop: data.paddingTop,
            paddingBottom: data.paddingBottom,
            sizeProductCard: data.sizeProductCard
          },
          position: position,
          v: '2.0',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: true
        }
      } else {
        block = {
          instanceId: instanceId,
          blockTypeId: data.blockTypeId,
          identifier: data.identifier,
          configs: null,
          position: position,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: true
        }
      }

      block.landingId = landingId
      block.id = new mongo.ObjectID(data.id)
      landing.blocks.push(block)
      let insertLanding = await Utils.findAndUpdateMongoDB('Landing', { _id: ObjectId(landingId) }, { '$set': { blocks: landing.blocks, updatedAt: Date.now() } })

      if (insertLanding.success) {
        response.created = true
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    if (response.error) {
      throw response.error
    } else {
      return response
    }
  }

  Landing.remoteMethod('createNewBlock', {
    description: 'Add new block',
    http: {
      path: '/:landingId/new',
      verb: 'POST'
    },
    accepts: [
      { arg: 'landingId', type: 'string' },
      { arg: 'data', type: 'object', http: { source: 'body' }, require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Landing.editBlock = async (landingId, data, req) => {
    let response = { updated: false }

    let filter = {
      where: {
        id: landingId
      }
    }

    let landings = await Utils.loopbackFind(Landing, filter)
    let landing = landings[0]

    data.updatedAt = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString()

    let dbEcommerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })

    let businessUnit = await dbEcommerce.query('SELECT i.id, i.alias, c.businessUnit FROM Instance AS i LEFT JOIN Config AS c ON i.id = c.instanceId WHERE i.uuid = ? AND i.status = 1 LIMIT 1;', [
      req.headers.businessunit
    ])

    let instanceId = businessUnit[0].id
    let alias = businessUnit[0].alias.trim().toLowerCase()
    businessUnit = businessUnit[0].businessUnit
    
    await dbEcommerce.close()

    try {
      if (data.blockTypeId === 1) {
        if (!Utils.isEmpty(data.configs.callToActionUrl)) {
          let callToAction = await Utils.getCallToAction(data.configs.callToActionUrl, req.headers.businessunit)
          callToAction.text = data.configs.callToActionText || '' 
          data.configs.cta = callToAction
        } else {
          data.configs.cta = null
        }
        delete data.configs.callToActionUrl
        delete data.configs.callToActionText
      }
      else if (data.blockTypeId === 2) {
        // Edit grid block
        let totalSize = 0
        await Utils.asyncForEach(data.configs.grid, async (item, idx) => {
          if (!Utils.isEmpty(item.callToAction)) {
            let callToAction = await Utils.getCallToAction(item.callToAction, req.headers.businessunit)
            data.configs.grid[idx].cta = callToAction
          } else {
            data.configs.grid[idx].cta = null
          }

          item.image = item.image[0]
          
          if (item.image.data !== undefined) {
            item.image.name = uuid.v4()
            // Upload mobile image own cdn
            let uploadData = {
              name: 'landings/' + alias + '/' + item.image.name + '.webp',
              data: item.image.data,
              contentType: item.image.type
            }
            
            let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
              instanceId: instanceId,
              fileName: item.image.name
            }, {
              instanceId: instanceId,
              documentTypeId: item.image.documentTypeId,
              fileName: item.image.name,
              fileType: item.image.type,
              fileSize: item.image.size,
              height: item.image.height,
              width: item.image.width,
              url: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              status: true
            })

            if (cdnUpload.success) {
              item.image = {
                cdn: cdnUpload.data.id,
                url: cdnUpload.data.url,
                size: item.image.size,
                width: item.image.width,
                height: item.image.height
              }
            }
            totalSize += item.image.size
          } else {
            item.image.cdn = item.image.cdn
            totalSize += item.image.size
          }
        })
        data.configs.totalSize = totalSize
      }
      else if (data.blockTypeId === 3) {
        // Edit banner grid
        let totalSize = 0

        data.configs.banners.push(data.configs.secondaryTopBanner)
        data.configs.banners.push(data.configs.secondaryBottomBanner)

        await Utils.asyncForEach(data.configs.banners, async (item, idx) => {
          // Generate call to action
          if (!Utils.isEmpty(item.callToAction)) {
            let callToAction = await Utils.getCallToAction(item.callToAction, req.headers.businessunit)
            data.configs.banners[idx].cta = callToAction
          } else {
            data.configs.banners[idx].cta = null
          }

          if (item.desktopImage.data !== undefined) {
            item.desktopImage.name = uuid.v4()
          
            // Upload desktop image own cdn
            let uploadData = {
              name: 'landings/' + alias + '/' + item.desktopImage.name + '.webp',
              data: item.desktopImage.data,
              contentType: item.desktopImage.type
            }
            
            let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
              instanceId: instanceId,
              fileName: item.desktopImage.name
            }, {
              instanceId: instanceId,
              documentTypeId: item.desktopImage.documentTypeId,
              fileName: item.desktopImage.name,
              fileType: item.desktopImage.type,
              fileSize: item.desktopImage.size,
              height: item.desktopImage.height,
              width: item.desktopImage.width,
              url: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              status: true
            })

            if (cdnUpload.success) {
              item.desktopImage = {
                cdn: cdnUpload.data.id,
                url: cdnUpload.data.url,
                size: item.desktopImage.size,
                width: item.desktopImage.width,
                height: item.desktopImage.height
              }
            }
            totalSize += item.desktopImage.size
          } else {
            item.desktopImage.cdn = item.desktopImage.cdn
            totalSize += item.desktopImage.size
          }

          if (item.mobileImage.data !== undefined) {
            item.mobileImage.name = uuid.v4()
            // Upload desktop image own cdn
            let uploadData = {
              name: 'landings/' + alias + '/' + item.mobileImage.name + '.webp',
              data: item.mobileImage.data,
              contentType: item.mobileImage.type
            }
            
            let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
              instanceId: instanceId,
              fileName: item.mobileImage.name
            }, {
              instanceId: instanceId,
              documentTypeId: item.mobileImage.documentTypeId,
              fileName: item.mobileImage.name,
              fileType: item.mobileImage.type,
              fileSize: item.mobileImage.size,
              height: item.mobileImage.height,
              width: item.mobileImage.width,
              url: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              status: true
            })

            if (cdnUpload.success) {
              item.mobileImage = {
                cdn: cdnUpload.data.id,
                url: cdnUpload.data.url,
                size: item.mobileImage.size,
                width: item.mobileImage.width,
                height: item.mobileImage.height
              }
            }
            totalSize += item.mobileImage.size
          } else {
            item.mobileImage.cdn = item.mobileImage.cdn
            totalSize += item.mobileImage.size
          }
        })

        data.configs.secondaryBottomBanner = data.configs.banners[data.configs.banners.length - 1]
        data.configs.secondaryTopBanner = data.configs.banners[data.configs.banners.length - 2]

        let banners = Utils.cloneJson(data.configs.banners)
        banners.pop()
        banners.pop()

        data.configs.banners = banners
        data.configs.totalSize = totalSize
      }
      else if (data.blockTypeId === 4) {
        // Edit banner block
        let totalSize = 0
        await Utils.asyncForEach(data.configs.banners, async (item, idx) => {
          if (!Utils.isEmpty(item.callToAction)) {
            let callToAction = await Utils.getCallToAction(item.callToAction, req.headers.businessunit)
            data.configs.banners[idx].cta = callToAction
          } else {
            data.configs.banners[idx].cta = null
          }
          
          if (item.desktopImage.data !== undefined) {
            item.desktopImage.name = uuid.v4()
            // Upload mobile image own cdn
            let uploadData = {
              name: 'landings/' + alias + '/' + item.desktopImage.name + '.webp',
              data: item.desktopImage.data,
              contentType: item.desktopImage.type
            }
            
            let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
              instanceId: instanceId,
              fileName: item.desktopImage.name
            }, {
              instanceId: instanceId,
              documentTypeId: item.desktopImage.documentTypeId,
              fileName: item.desktopImage.name,
              fileType: item.desktopImage.type,
              fileSize: item.desktopImage.size,
              height: item.desktopImage.height,
              width: item.desktopImage.width,
              url: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              status: true
            })

            if (cdnUpload.success) {
              item.desktopImage = {
                cdn: cdnUpload.data.id,
                url: cdnUpload.data.url,
                size: item.desktopImage.size,
                width: item.desktopImage.width,
                height: item.desktopImage.height
              }
            }
            totalSize += item.desktopImage.size
          } else {
            item.desktopImage.cdn = item.desktopImage.cdn
            totalSize += item.desktopImage.size
          }

          if (item.mobileImage.data !== undefined) {
            item.mobileImage.name = uuid.v4()
            // Upload desktop image own cdn
            let uploadData = {
              name: 'landings/' + alias + '/' + item.mobileImage.name + '.webp',
              data: item.mobileImage.data,
              contentType: item.mobileImage.type
            }
            
            let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
              instanceId: instanceId,
              fileName: item.mobileImage.name
            }, {
              instanceId: instanceId,
              documentTypeId: item.mobileImage.documentTypeId,
              fileName: item.mobileImage.name,
              fileType: item.mobileImage.type,
              fileSize: item.mobileImage.size,
              height: item.mobileImage.height,
              width: item.mobileImage.width,
              url: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              status: true
            })

            if (cdnUpload.success) {
              item.mobileImage = {
                cdn: cdnUpload.data.id,
                url: cdnUpload.data.url,
                size: item.mobileImage.size,
                width: item.mobileImage.width,
                height: item.mobileImage.height
              }
            }
            totalSize += item.mobileImage.size
          } else {
            item.mobileImage.cdn = item.mobileImage.cdn
            totalSize += item.mobileImage.size
          }
        })
        data.configs.totalSize = totalSize
      }
      else if (data.blockTypeId === 15) {
        // Edit banner block
        let totalSize = 0
        await Utils.asyncForEach(data.configs.items, async (item, idx) => {
          if (!Utils.isEmpty(item.callToAction)) {
            let callToAction = await Utils.getCallToAction(item.callToAction, req.headers.businessunit)
            data.configs.items[idx].cta = callToAction
          } else {
            data.configs.items[idx].cta = null
          }
          
          if (item.image.data !== undefined) {
            item.image.name = uuid.v4()
            // Upload mobile image own cdn
            let uploadData = {
              name: 'landings/' + alias + '/' + item.image.name + '.webp',
              data: item.image.data,
              contentType: item.image.type
            }
            
            let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
              instanceId: instanceId,
              fileName: item.image.name
            }, {
              instanceId: instanceId,
              documentTypeId: item.image.documentTypeId,
              fileName: item.image.name,
              fileType: item.image.type,
              fileSize: item.image.size,
              height: item.image.height,
              width: item.image.width,
              url: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              status: true
            })

            if (cdnUpload.success) {
              item.image = {
                cdn: cdnUpload.data.id,
                url: cdnUpload.data.url,
                size: item.image.size,
                width: item.image.width,
                height: item.image.height
              }
            }
            totalSize += item.image.size
          } else {
            item.image.cdn = item.image.cdn
            totalSize += item.image.size
          }
        })
        data.configs.totalSize = totalSize
      }
      else if (data.blockTypeId === 17) {
        let totalSize = 0
        let banners = []
        banners.push(data.configs.banner)
        banners.push(data.configs.finishBanner)
        await Utils.asyncForEach(banners, async (item, idx) => {
          if (item.desktopImage.data !== undefined) {
            item.desktopImage.name = uuid.v4()
            let uploadData = {
              name: 'landings/' + alias + '/' + item.desktopImage.name + '.webp',
              data: item.desktopImage.data,
              contentType: item.desktopImage.type
            }
            
            let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
              instanceId: instanceId,
              fileName: item.desktopImage.name
            }, {
              instanceId: instanceId,
              documentTypeId: item.desktopImage.documentTypeId,
              fileName: item.desktopImage.name,
              fileType: item.desktopImage.type,
              fileSize: item.desktopImage.size,
              height: item.desktopImage.height,
              width: item.desktopImage.width,
              url: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              status: true
            })

            if (cdnUpload.success) {
              item.desktopImage = {
                cdn: cdnUpload.data.id,
                url: cdnUpload.data.url,
                size: item.desktopImage.size,
                width: item.desktopImage.width,
                height: item.desktopImage.height
              }
            }
            totalSize += item.desktopImage.size
          } else {
            item.desktopImage.cdn = item.desktopImage.cdn
            totalSize += item.desktopImage.size
          }

          if (item.mobileImage.data !== undefined) {
            item.mobileImage.name = uuid.v4()
            let uploadData = {
              name: 'landings/' + alias + '/' + item.mobileImage.name + '.webp',
              data: item.mobileImage.data,
              contentType: item.mobileImage.type
            }
            
            let cdnUpload = await CDN.upload(uploadData, Landing.app.models.CDN, {
              instanceId: instanceId,
              fileName: item.mobileImage.name
            }, {
              instanceId: instanceId,
              documentTypeId: item.mobileImage.documentTypeId,
              fileName: item.mobileImage.name,
              fileType: item.mobileImage.type,
              fileSize: item.mobileImage.size,
              height: item.mobileImage.height,
              width: item.mobileImage.width,
              url: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              status: true
            })

            if (cdnUpload.success) {
              item.mobileImage = {
                cdn: cdnUpload.data.id,
                url: cdnUpload.data.url,
                size: item.mobileImage.size,
                width: item.mobileImage.width,
                height: item.mobileImage.height
              }
            }
            totalSize += item.desktopImage.size
          } else {
            item.desktopImage.cdn = item.desktopImage.cdn
            totalSize += item.desktopImage.size
          }
        })

        let callToAction = null
        if (!Utils.isEmpty(banners[1].callToAction)) {
          callToAction = await Utils.getCallToAction(banners[1].callToAction, req.headers.businessunit)
        }

        banners[1].cta = callToAction
        data.configs.banner = banners[0]
        data.configs.finishBanner = banners[1]
        data.configs.eventDate = new Date(data.configs.eventDate)
        data.configs.totalSize = totalSize
      }
      else if (data.blockTypeId === 22) {
        delete data.configs.query
        delete data.configs.queryString
        data.configs.query = await Utils.createQuery(businessUnit, data.configs)
        data.configs.queryString = JSON.stringify(data.configs.query)
      }

      let index = landing.blocks.findIndex(block => block.id === data.id)

      if (index !== -1) {
        landing.blocks[index] = data
      }

      response = await Utils.findAndUpdateMongoDB('Landing', { _id: ObjectId(landingId) }, { '$set': { blocks: landing.blocks, updatedAt: Date.now() } })
    } catch (err) {
      console.log(err)
      response.error = err
    }

    if (response.error) {
      throw response.error
    } else {
      return {
        updated: response.success
      }
    }
  }

  Landing.remoteMethod('editBlock', {
    description: 'Edit content block',
    http: {
      path: '/:landingId/edit',
      verb: 'PATCH'
    },
    accepts: [
      { arg: 'landingId', type: 'string', require: true },
      { arg: 'data', type: 'object', http: { source: 'body' }, require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Landing.editLandingPage = async (data, req) => {
    let response = { updated: false }
    
    let dbEcommerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })

    let instances = await dbEcommerce.query('SELECT id FROM Instance WHERE uuid = ? AND status = 1;', [
      req.headers.businessunit
    ])

    let instanceId = instances[0].id
    await dbEcommerce.close()

    try {
      if (Utils.validateStaticUrl(data.url).exists) {
        throw '0002'
      }

      let landings = await Utils.loopbackFind(Landing, { where: { url: data.url, instanceId: instanceId } })

      if (landings.length > 0 && landings[0].id !== data.id) {
        throw '0001'
      } else {
        let catalogUUID = ''
        if (!Utils.isEmpty(data.catalog)) {
          catalogUUID = data.catalog.split('/')[data.catalog.split('/').length - 2]
        }
        
        let updateLanding = await Utils.updateMongoDb(Landing, { title: data.title, description: data.description, url: data.url, catalog: catalogUUID, showProducts: data.showProducts, updatedAt: new Date() }, data.id)

        if (updateLanding.success) {
          response.updated = true
        }
      }
    } catch (err) {
      response.error = err
    }

    if (response.error) {
      throw response.error
    }

    return response
  }

  Landing.remoteMethod('editLandingPage', {
    description: 'Edit content block',
    http: {
      path: '/update',
      verb: 'PATCH'
    },
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' }, require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Landing.changePosition = async (data, req) => {
    let response = { changed: false }

    try {
      let landing = await Utils.mongoFind('Landing', { _id: ObjectId(data.landingId) })
      
      let blocks = []
      landing[0].blocks.map((block) => {
        if (block.status) {
          blocks.push(block)
        }
      })

      let sort = blocks.sort((a, b) => {
        return a.position - b.position
      })

      if (data.direction === 'UP') {
        for (let i = 0; i < sort.length; i ++) {
          if (sort[i].id == data.id) {
            let currentBlock = sort[i].position
            sort[i].position = sort[i - 1].position
            sort[i - 1].position = currentBlock
            break
          }
        }
      } else {
        for (let i = 0; i < sort.length; i ++) {
          if (sort[i].id == data.id) {
            let currentBlock = sort[i].position
            sort[i].position = sort[i + 1].position
            sort[i + 1].position = currentBlock
            break
          }
        }
      }

      let updateLanding = await Utils.updateMongoDb(Landing, { blocks: sort, updatedAt: new Date() }, data.landingId)

      if (updateLanding.success) {
        response.changed = true
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    if (response.error) {
      throw response.error
    } else {
      return response
    }
  }


  Landing.remoteMethod('changePosition', {
    description: 'Change block position',
    http: {
      path: '/block/position',
      verb: 'PATCH'
    },
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' }, require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })
}

