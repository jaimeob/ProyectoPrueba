'use strict'

const Utils = require('../Utils.js')
const mongo = require('mongodb')
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

module.exports = function (Block) {

  // Get blocks CMS
  Block.getBlocks = async (req) => {
    let response = []
    try {
      // Get instance by business unit selected

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

      let filter = {
        where: {
          instanceId: instanceId,
          status: true
        },
        order: 'position ASC'
      }

      let blocks = await Utils.loopbackFind(Block, filter)
      response = blocks
    } catch (err) {
      console.log(err)
    }

    return response
  }

  Block.remoteMethod('getBlocks', {
    description: 'Get all blocks',
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

  // Create new block
  Block.createNewBlock = async (data, req) => {
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
      let blocks = await Utils.loopbackFind(Block, {
        where: {
          instanceId: instanceId,
          status: true
        },
        order: 'position ASC'
      })

      let position = 1
      if (blocks.length > 0) {
        position = blocks[blocks.length - 1].position
        position += 1
      }

      let block = null

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
      }
      // Banner grid block
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
            name: 'cms/' + alias + '/' + item.image.name + '.webp',
            data: item.image.data,
            contentType: item.image.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
      } else if (data.blockTypeId === 3) {
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
            name: 'cms/' + alias + '/' + item.desktopImage.name + '.webp',
            data: item.desktopImage.data,
            contentType: item.desktopImage.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.mobileImage.name + '.webp',
            data: item.mobileImage.data,
            contentType: item.mobileImage.type
          }

          cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.desktopImage.name + '.webp',
            data: item.desktopImage.data,
            contentType: item.desktopImage.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.mobileImage.name + '.webp',
            data: item.mobileImage.data,
            contentType: item.mobileImage.type
          }

          cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.image.name + '.webp',
            data: item.image.data,
            contentType: item.image.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.desktopImage.name + '.webp',
            data: item.desktopImage.data,
            contentType: item.desktopImage.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.mobileImage.name + '.webp',
            data: item.mobileImage.data,
            contentType: item.mobileImage.type
          }

          cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
      } else if (data.blockTypeId === 18) {
        let content = []
        data.content.forEach(item => {
          content.push({
            type: item.type,
            carousel: item.carousel.id
          })
        })
        block = {
          instanceId: instanceId,
          blockTypeId: data.blockTypeId,
          title: (data.title !== undefined) ? data.title : '',
          description: (data.description !== undefined) ? data.description : '',
          position: position,
          configs: content,
          createdAt: new Date(),
          updatedAt: new Date(),
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
      }

      let insertBlock = await Utils.createMongoDB(Block, block)

      if (insertBlock.success) {
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

  Block.remoteMethod('createNewBlock', {
    description: 'Add new block',
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

  Block.changePosition = async (data, req) => {
    let response = { changed: false }

    try {
      // Get instance by business unit selected

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

      let blocks = await Utils.loopbackFind(Block, {
        where: {
          instanceId: instanceId,
          status: true
        },
        order: 'position ASC'
      })

      let success = true
      let changeBlock = []

      if (data.direction === 'UP') {
        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].id === data.id) {
            changeBlock.push({ _id: blocks[i].id, position: blocks[i - 1].position })
            changeBlock.push({ _id: blocks[i - 1].id, position: blocks[i].position })
            break
          }
        }
      } else {
        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].id === data.id) {
            changeBlock.push({ _id: blocks[i].id, position: blocks[i + 1].position })
            changeBlock.push({ _id: blocks[i + 1].id, position: blocks[i].position })
            break
          }
        }
      }

      let update = await Utils.updateMongoDb(Block, { position: changeBlock[0].position }, changeBlock[0]._id)
      let update2 = await Utils.updateMongoDb(Block, { position: changeBlock[1].position }, changeBlock[1]._id)

      if (!update.success || !update2.success) {
        success = false
      }

      if (success) {
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


  Block.remoteMethod('changePosition', {
    description: 'Change block position',
    http: {
      path: '/position',
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

  Block.editBlock = async (id, data, req) => {
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

    data.updatedAt = new Date()
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
            name: 'cms/' + alias + '/' + item.image.name + '.webp',
            data: item.image.data,
            contentType: item.image.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
    } else if (data.blockTypeId === 3) {
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
            name: 'cms/' + alias + '/' + item.desktopImage.name + '.webp',
            data: item.desktopImage.data,
            contentType: item.desktopImage.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.mobileImage.name + '.webp',
            data: item.mobileImage.data,
            contentType: item.mobileImage.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.desktopImage.name + '.webp',
            data: item.desktopImage.data,
            contentType: item.desktopImage.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.mobileImage.name + '.webp',
            data: item.mobileImage.data,
            contentType: item.mobileImage.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.image.name + '.webp',
            data: item.image.data,
            contentType: item.image.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.desktopImage.name + '.webp',
            data: item.desktopImage.data,
            contentType: item.desktopImage.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
            name: 'cms/' + alias + '/' + item.mobileImage.name + '.webp',
            data: item.mobileImage.data,
            contentType: item.mobileImage.type
          }

          let cdnUpload = await CDN.upload(uploadData, Block.app.models.CDN, {
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
    } else if (data.blockTypeId === 22) {
      delete data.configs.query
      delete data.configs.queryString
      data.configs.query = await Utils.createQuery(businessUnit, data.configs)
      data.configs.queryString = JSON.stringify(data.configs.query)
    }
    let response = await Utils.findAndUpdateMongoDB('Block', { _id: new mongo.ObjectID(id) }, { '$set': data })
    return {
      updated: response.success
    }
  }

  Block.remoteMethod('editBlock', {
    description: 'Edit content block',
    http: {
      path: '/:id/edit',
      verb: 'PATCH'
    },
    accepts: [
      { arg: 'id', type: 'string', require: true },
      { arg: 'data', type: 'object', http: { source: 'body' }, require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Block.getOptionsForFilterBlock = async (req) => {
    let response = {}
    let brands = []
    let categories = []
    let attributes = []

    try {
      let ecommerce = await Utils.connectToDB({
        host: datasources.ecommerce.host,
        port: datasources.ecommerce.port,
        user: datasources.ecommerce.user,
        password: datasources.ecommerce.password,
        database: datasources.ecommerce.database
      })

      let businessUnit = await ecommerce.query('SELECT i.id, c.businessUnit FROM Instance AS i LEFT JOIN Config AS c ON i.id = c.instanceId WHERE i.uuid = ? AND i.status = 1 LIMIT 1;', [req.headers.businessunit])
      let instanceId = businessUnit[0].id
      businessUnit = businessUnit[0].businessUnit

      await ecommerce.close()

      let mongoCategories = await Utils.mongoFind('Menu', { instanceId: instanceId })
      let mongoBrands = await Utils.mongoFind('Brand')
      let mongoAttributes = await Utils.mongoFind('Attribute')
      let mongoProducts = await Utils.mongoFind('Product', { businesses: { $elemMatch: { code: businessUnit } } })
      let mongoMenu = mongoCategories[0].menu

      // Buscando las marcas que coincidan con los productos
      mongoBrands.forEach(brand => {
        let productsWithBrand = mongoProducts.filter((product) => {
          return (product.brandCode === brand.code)
        })

        if (productsWithBrand.length > 0) {
          let filteredBrands = productsWithBrand.filter(product => {
            return (product.brandCode === brand.code)
          })

          brands.push({ value: filteredBrands[0].brandCode, label: brand.name })
        }
      })

      // Buscando las marcas que coincidan con los productos
      mongoAttributes.forEach(attribute => {
          attributes.push({ value: attribute.code, label: attribute.description })
      })

      // Encontrando todas las categorías
      mongoMenu.map(data => {
        if (data.subNodes.length !== 0 && data.key !== 'brands') {
          categories.push({
            value: data.id,
            label: data.description.split(' ').join(' ').split('/').join(' '),
            node: data.node
          })
          data.subNodes.map(subdata => {
            subdata.count !== 0 ? categories.push({
              node: subdata.node,
              value: subdata.id,
              label: data.description.split(' ').join(' ').split('/').join(' ') + '/' + subdata.description.split(' ').join(' ').split('/').join(' ')
            }) : null
            subdata.subNodes.map(subsubdata => {
              subsubdata.count !== 0 ? categories.push({
                node: subsubdata.node,
                value: subsubdata.id,
                label: data.description.split(' ').join(' ').split('/').join(' ') + '/' + subdata.description.split(' ').join(' ').split('/').join(' ') + '/' + subsubdata.description.split(' ').join(' ').split('/').join(' ')
              }) : null
              subsubdata.subNodes.map(subsubsubdata => {
                subsubsubdata.count !== 0 ? categories.push({
                  node: subsubsubdata.node, value: subsubsubdata.id, label: data.description.split(' ').join(' ').split('/').join(' ') + '/' + subdata.description.split(' ').join(' ').split('/').join(' ') + '/' + subsubdata.description.split(' ').join(' ').split('/').join(' ') + '/' + subsubsubdata.description.split(' ').join(' ').split('/').join(' ')
                }) : null
                subsubsubdata.subNodes.map(subsubsubsubdata => {
                  subsubsubsubdata.count !== 0 ? categories.push({
                    node: subsubsubsubdata.node,
                    value: subsubsubsubdata.id,
                    label: data.description.split(' ').join(' ').split('/').join(' ') + '/' + subdata.description.split(' ').join(' ').split('/').join(' ') + '/' + subsubdata.description.split(' ').join(' ').split('/').join(' ') + '/' + subsubsubdata.description.split(' ').join(' ').split('/').join(' ') + '/' + subsubsubsubdata.description.split(' ').join(' ').split('/').join(' ')
                  }) : null
                })
              })
            })
          })
        }
      })

      // Orden alfabético de las marcas
      brands.sort(function (a, b) {
        if (a.label > b.label) {
          return 1
        }
        if (a.label < b.label) {
          return -1
        }

        return 0
      })

      attributes.sort(function (a, b) {
        if (a.label > b.label) {
          return 1
        }
        if (a.label < b.label) {
          return -1
        }
        return 0
      })

      response.brands = brands
      response.categories = categories
      response.attributes = attributes

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

  Block.remoteMethod('getOptionsForFilterBlock', {
    description: 'Get options for selects for backoffice web, categories and brands',
    http: {
      path: '/options',
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
  })
}
