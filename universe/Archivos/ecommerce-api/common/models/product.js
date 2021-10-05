'use strict'

const convert = require('xml-js')
const mongodb = require('../classes/mongodb.js')
const mysql = require('../classes/mysql.js')
const Utils = require('../Utils.js')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')
const uuid = require('uuid')
const CDN = require('../classes/cdn.js')
const calzzamovil = require('../classes/calzzamovil.js')

const sanitizeHtml = require('sanitize-html')

module.exports = (Product) => {
  Product.observe('loaded', async (ctx) => {
    // New properties
    if (ctx.data.detail === undefined) {
      let url = Utils.generateURL(ctx.data.name)
      ctx.data.url = '/' + url + '-' + ctx.data.code

      ctx.data.detail = {
        title: ctx.data.name,
        description: "",
        photo360: "",
        video: "",
        features: [],
        tags: [],
        raiting: 0,
        reviews: []
      }
    } else {
      ctx.data.url = '/' + Utils.generateURL(ctx.data.detail.title) + '-' + ctx.data.code
      ctx.data.detail.description = sanitizeHtml(ctx.data.detail.description, {
        allowedTags: ['strong', 'p', 'br', 'a', 'img', 'ul', 'li', 'h1', 'h2'],
        allowedAttributes: {
          'img': ['src'],
          'a': ['href'],
          'p': ['style']
        },
        allowedIframeHostnames: ['amazonaws.com']
      })
      await Utils.asyncForEach(ctx.data.detail.tags, async (tag, idx) => {
        let tagItem = await Utils.loopbackFind(Product.app.models.Tag, { where: { id: tag, status: true } })
        ctx.data.detail.tags[idx] = tagItem[0]
      })
    }

    ctx.data.percentagePrice = ctx.data.percentagePrice.toFixed(0)
    ctx.data.percentagePrice = Number(ctx.data.percentagePrice)

    // LUWAN 10 de noviembre de 2020: Si el producto ES DEPARTAMENTAL no tiene porcentaje de descuento en precio crédito
    if (Number(ctx.data.genderCode) < 5) {
      // Ignorar descuento bota UNDER ARMOUR
      if (!(ctx.data.code === '09CN98' || ctx.data.code === '09D0P2' || ctx.data.code === '09DA5X')) {
        ctx.data.creditPrice = ctx.data.creditPrice - (ctx.data.creditPrice * (ctx.data.percentagePrice / 100))
      }
    }

    if (ctx.data.bluePoints.status) {
      ctx.data.bluePoints.winPercentage = Number(ctx.data.bluePoints.winPercentage)
      if (ctx.data.discountPrice > 0) {
        ctx.data.bluePoints.win = ctx.data.discountPrice * (ctx.data.bluePoints.winPercentage / 100)
        ctx.data.bluePoints.win = Number(ctx.data.bluePoints.win).toFixed(0)
        ctx.data.bluePoints.win = Number(ctx.data.bluePoints.win)
      } else {
        ctx.data.bluePoints.win = ctx.data.price * (ctx.data.bluePoints.winPercentage / 100)
        ctx.data.bluePoints.win = Number(ctx.data.bluePoints.win).toFixed(0)
        ctx.data.bluePoints.win = Number(ctx.data.bluePoints.win)
      }
    } else {
      ctx.data.bluePoints.win = 0
    }

    ctx.data.partialityPrice = ctx.data.creditPrice / ctx.data.partiality

    if (!Utils.isEmpty(Utils.getSizesRange(ctx.data))) {
      ctx.data.shortDescription = Utils.getSizesRange(ctx.data)
    }

    if (ctx.data.gender !== undefined && ctx.data.gender.description !== undefined && ctx.data.gender.description !== null && !Utils.isEmpty(ctx.data.gender.description)) {
      if (!Utils.isEmpty(ctx.data.shortDescription)) {
        ctx.data.shortDescription = ctx.data.gender.description + ' (' + ctx.data.shortDescription + ')'
      }
      else {
        ctx.data.shortDescription = ctx.data.gender.description
      }
    }

    ctx.data.uniqueProduct = false
    if (ctx.data.genderCode >= 5 || (ctx.data.sublineCode === 252 || ctx.data.sublineCode === 63)) {
      if (ctx.data.sizes.length === 1) {
        ctx.data.uniqueProduct = true
      }
    } else {
      if (ctx.data.sizes.length === 1 && ctx.data.measurements.length === 0) {
        ctx.data.uniqueProduct = true
      }
    }

    // Vender solo con CrediVale NIKE
    if (ctx.data.brandCode === 118) {
      ctx.data.restricted = true
    } else {
      ctx.data.restricted = false
    }

    ctx.data.price = ctx.data.price.toFixed(0)
    ctx.data.price = Number(ctx.data.price)

    ctx.data.discountPrice = ctx.data.discountPrice.toFixed(0)
    ctx.data.discountPrice = Number(ctx.data.discountPrice)

    ctx.data.creditPrice = ctx.data.creditPrice.toFixed(0)
    ctx.data.creditPrice = Number(ctx.data.creditPrice)

    ctx.data.partialityPrice = ctx.data.partialityPrice.toFixed(0)
    ctx.data.partialityPrice = Number(ctx.data.partialityPrice)
  })

  Product.checkProduct = async (sku) => {
    let response = {
      exist: false
    }
    try {
      let comments = await Utils.loopbackFind(Product, {
        where: {
          code: sku
        }
      })
      if (comments.length === 1) {
        response.exist = true
      }
    } catch (err) {
      console.log(err)
      return response
    }
    return response
  }

  Product.remoteMethod('checkProduct', {
    description: 'Check product',
    http: {
      path: '/:sku/check',
      verb: 'GET'
    },
    accepts: [
      { arg: 'sku', type: 'string', type: "string" }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Product.getSizes = async (sku) => {
    let response = {
      sizes: [],
      stock: false
    }

    let product = []
    let sizes = []
    let finalSizes = []
    let quantity = 0
    let stock = false

    try {
      product = await Utils.loopbackFind(Product, { where: { code: sku } })

      if (product.length !== 1) {
        return response
      }

      product = product[0]

      let responseStock = await Utils.request({
        method: 'GET',
        json: true,
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products/' + sku + '/stock'
      })

      if (responseStock.body === undefined) {
        return response
      }

      if (responseStock.body.length > 0) {
        responseStock.body.forEach((data) => {
          if (sizes[data.size] !== undefined) {
            sizes[data.size].push(data)
          } else {
            sizes[data.size] = []
            sizes[data.size].push(data)
          }
        })
      }

      sizes = Utils.jsonToArray(sizes)

      sizes.forEach(size => {
        size.forEach((s) => {
          quantity += Number(s.stock)
        })

        finalSizes.push({ size: size[0].size, description: size[0].size, quantity: quantity, detail: size })
        quantity = 0
      })

      if (finalSizes.length > 0) {
        stock = true
      }

      let exist = false
      let idx = null

      if (finalSizes.length >= product.sizes.length) {
        finalSizes.forEach((item, index) => {
          exist = false
          idx = null

          product.sizes.forEach(size => {
            if (!exist && Number(size) === Number(item.size)) {
              exist = true
              idx = index
            }
          })

          if (!exist) {
            finalSizes.splice(idx, 0, { size: item.size, description: item.size, quantity: 0, detail: [] })
          }
        })
      } else {
        product.sizes.forEach(size => {
          exist = false
          idx = null

          finalSizes.forEach((item, index) => {
            if (!exist && Number(size) === Number(item.size)) {
              exist = true
              idx = index
            }
          })

          if (!exist) {
            finalSizes.splice(idx, 0, { size: size, description: size, quantity: 0, detail: [] })
          }
        })
      }

      finalSizes = Utils.orderBy(finalSizes, 'size', 'asc')

      if (finalSizes.length > 0) {
        if (product.measurements !== undefined && product.measurements.length > 0 && product.sizes.length === product.measurements.length) {
          product.sizes.forEach((size, idx) => {
            finalSizes[idx].description = product.measurements[idx]
          })
        }
      }
    } catch (err) {
      console.log(err)
    }

    response.sizes = finalSizes
    response.stock = stock
    return response
  }

  Product.remoteMethod('getSizes', {
    description: 'Get sizes',
    http: {
      path: '/:sku/sizes',
      verb: 'GET'
    },
    accepts: [
      { arg: 'sku', type: 'string', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'Array',
      root: true
    }
  })

  Product.createReview = async (req, data) => {
    // Create review
    let response = { created: false }
    let db = mysql.connectToDBManually()

    try {
      let instanceId = req.headers.instanceId
      let userId = req.headers.user.id
      // Revisar si el usuario ya ha comprado el producto anteriormente
      let orders = await db.query('SELECT * FROM `Order` AS o LEFT JOIN `OrderDetail` AS od ON o.id = od.orderId WHERE o.userId = ? AND od.productCode = ? AND o.calzzapatoCode IS NOT NULL;', [
        data.productCode,
        userId
      ])

      db.close()

      let reviewType = "visitor"

      if (orders.length > 0) {
        reviewType = "buyer"
      }

      if (data.photos.length > 0) {
        await Utils.asyncForEach(data.photos, async (photo, idx) => {
          photo.name = uuid.v4()
          // Upload desktop image own cdn
          let uploadData = {
            name: 'reviews/' + data.productCode + '/' + photo.name + '.webp',
            data: photo.data,
            contentType: 'image/webp'
          }

          let cdnUpload = await CDN.upload(uploadData, Product.app.models.CDN, {
            instanceId: instanceId,
            fileName: photo.name
          }, {
            instanceId: instanceId,
            documentTypeId: configs.documents.PRODUCT_PHOTO_REVIEW, // Foto de producto - reviews
            fileName: photo.name,
            fileType: 'image/webp',
            fileSize: photo.size,
            height: photo.height,
            width: photo.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            data.photos[idx] = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: photo.size,
              width: photo.width,
              height: photo.height
            }
          }
        })
      }

      let comment = await mongodb.createMongoDB(Product.app.models.Comment, {
        instanceId: instanceId,
        userId: userId,
        productCode: data.productCode,
        type: reviewType,
        rating: data.rating,
        title: data.title,
        message: data.message,
        photos: data.photos,
        status: false
      })

      response.created = comment.success
    } catch (err) {
      console.log(err)
      return response
    }

    return response
  }

  Product.remoteMethod('createReview', {
    description: 'Create review',
    http: {
      path: '/review',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', required: true },
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Product.getReviews = async (sku, req) => {
    // Get reviews by product
    let response = {
      rating: 0,
      comments: []
    }

    let db = mysql.connectToDBManually()

    try {
      let comments = await Utils.loopbackFind(Product.app.models.Comment, {
        where: {
          productCode: sku,
          status: true
        }
      })

      if (comments.length > 0) {
        let sum = 0
        await Utils.asyncForEach(comments, async (comment) => {
          sum += comment.rating
          let user = await db.query('SELECT name, firstLastName FROM User WHERE id = ? LIMIT 1;', [
            comment.userId
          ])
          comment.user = user[0].name.trim() + ' ' + user[0].firstLastName.trim()
          comment.user = comment.user.trim()
        })

        await db.close()

        response.rating = (sum / comments.length)
        response.comments = comments
      }
    } catch (err) {
      console.log(err)
      return response
    }
    return response
  }

  Product.remoteMethod('getReviews', {
    description: 'Get reviews',
    http: {
      path: '/:sku/reviews',
      verb: 'GET'
    },
    accepts: [
      { arg: 'sku', type: 'string', type: "string" },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Product.getBreadcrumbs = async (category) => {
    let breadcrumbs = await Utils.createBreadcrumbs(Product.app.models.Category, Number(category), [])
    let url = ''
    breadcrumbs.forEach(breadcrumb => {
      breadcrumb.description = breadcrumb.description.toLowerCase()
      breadcrumb.description = breadcrumb.description.charAt(0).toUpperCase() + breadcrumb.description.slice(1)
      if (breadcrumb.url === undefined) {
        url += '/' + Utils.generateURL(breadcrumb.description.toLowerCase())
        breadcrumb.url = url
      }
    })

    return breadcrumbs
  }

  Product.remoteMethod('getBreadcrumbs', {
    description: 'Get breadcrumbs',
    http: {
      path: '/:category/breadcrumbs',
      verb: 'GET'
    },
    accepts: [
      { arg: 'category', type: 'string', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'Array',
      root: true
    }
  })

  Product.checkStock = async (sku) => {
    let response = []

    let body = '<?xml version="1.0" encoding="utf-8"?>\
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
      <soap:Body>\
        <GetExistencia xmlns="http://tempuri.org/">\
          <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
          <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
          <cLote>' + sku + '</cLote>\
        </GetExistencia>\
      </soap:Body>\
    </soap:Envelope>'

    try {
      let responseStock = await Utils.request({
        method: 'POST',
        url: configs.webServiceVentaPublicoURL + '?op=GetExistencia',
        headers: {
          "content-type": "text/xml"
        },
        body: body
      })
      // console.log(body)
      if (responseStock.body !== undefined) {
        let result = convert.xml2json(responseStock.body, { compact: true, spaces: 4 })
        result = JSON.parse(result)

        let data = result['soap:Envelope']['soap:Body']['GetExistenciaResponse']['GetExistenciaResult']['CInfoLote']
        if (!data.length) {
          let tmp = data
          data = []
          data.push(tmp)
        }

        let stock = []

        data.forEach((item, idx) => {
          if (item !== undefined) {
            let cLote = item['cLote']
            let cArticulo = item['cArticulo']
            let nExistencia = item['nExistencia']
            let ctalla = item['ctalla']
            let cSucursal = item['cSucursal']
            let mensaje = item['mensaje']

            if (cLote !== undefined && cLote !== null && cArticulo !== undefined && cArticulo !== null && nExistencia !== undefined && nExistencia !== null && ctalla !== undefined && ctalla !== null && cSucursal !== undefined && cSucursal !== null && mensaje !== undefined && mensaje !== null) {
              stock.push({
                sku: cLote['_text'],
                article: cArticulo['_text'],
                stock: nExistencia['_text'],
                size: ctalla['_text'],
                branch: cSucursal['_text'],
                message: mensaje['_text']
              })
            }
          }
        })

        response = stock
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    return response
  }

  Product.remoteMethod('checkStock', {
    description: 'Check stock by SKU',
    http: {
      path: '/:sku/stock',
      verb: 'GET'
    },
    accepts: [
      { arg: 'sku', type: 'string', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'Array',
      root: true
    }
  })

  Product.search = async (req) => {
    let input = req.query.query
    let instanceId = req.headers.instanceId

    let products = []

    const db = mysql.connectToDBManually()

    try {
      let configs = await db.query('SELECT businessUnit, radius FROM Config WHERE instanceId = ? LIMIT 1;', [instanceId])
      await db.close()

      let businessUnit = configs[0].businessUnit

      let filter = {
        where: {
          and: [
            {
              businesses: {
                elemMatch: {
                  code: businessUnit
                }
              }
            },
            {
              or: [{ 'code': { like: input, options: 'i' } }, { 'name': { like: input, options: 'i' } }]
            },
          ]
        },
        include: ['gender', 'color', 'brand', 'detail'],
        limit: 50
      }

      products = await Utils.loopbackFind(Product, filter)

      let brands = []
      products.forEach(product => {
        brands.push({ code: product.brandCode })
      })

      brands = Utils.groupBy(brands, "code")
      brands = Utils.jsonToArray(brands)

      await Utils.asyncForEach(brands, async (brand) => {
        let brandResponse = await Utils.loopbackFind(Product.app.models.Brand, {
          where: {
            code: brand[0].code
          }
        })

        brandResponse = brandResponse[0]
        brandResponse.type = 'brand'
        brandResponse.url = '/marcas/' + brandResponse.name.toLowerCase().split(' ').join('-')
        products.unshift(brandResponse)
      })

    } catch (err) {
      console.log(err)
    }

    return products
  }

  Product.remoteMethod(
    'search',
    {
      description: 'Search products',
      http: {
        path: '/search',
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

  Product.searchWithFilters = async (filter, req) => {
    let instanceId = req.headers.instanceId
    let headers = req.headers
    let products = []

    try {
      filter = JSON.parse(Utils.decode(filter))

      let withCategory = null
      let withPosition = null
      let withUrl = null
      let withPage = null
      let withLimit = null
      let withGenders = []
      let withOffers = null
      let withBluePoints = null
      let withSubcategories = []
      let withBranches = []
      let withBrands = []
      let withSizes = []
      let withAttributes = []
      let withPrices = []
      let withOrderBy = null

      let withZones = []

      // Category
      if (filter.c !== undefined && filter.c !== null)
        withCategory = Number(filter.c)

      // Geolocation
      if (headers.position !== undefined)
        withPosition = JSON.parse(headers.position)

      // URL custom
      if (filter.u !== undefined)
        withUrl = filter.u

      // Page (skip)
      if (filter.pg !== undefined)
        withPage = Number(filter.pg)

      // Limit
      if (filter.l !== undefined)
        withLimit = Number(filter.l)

      // Genders
      if (filter.g !== undefined)
        withGenders = filter.g

      // Offers
      if (filter.o !== undefined)
        withOffers = filter.o

      // Blue points
      if (filter.bp !== undefined)
        withBluePoints = filter.bp

      // Subcategories
      if (filter.sc !== undefined)
        withSubcategories = filter.sc

      // Branch
      if (filter.br !== undefined)
        withBranches = filter.br

      // Brands
      if (filter.b !== undefined)
        withBrands = filter.b

      // Sizes
      if (filter.s !== undefined)
        withSizes = filter.s

      // Attributes
      if (filter.a !== undefined)
        withAttributes = filter.a

      // Prices
      if (filter.p !== undefined)
        withPrices = filter.p

      // Order by
      if (filter.ob !== undefined)
        withOrderBy = filter.ob

      // Zones
      if (filter.z !== undefined) {
        withZones = filter.z
      }

      const db = mysql.connectToDBManually()
      let configs = await db.query('SELECT businessUnit, radius FROM Config WHERE instanceId = ? LIMIT 1;', [instanceId])
      await db.close()

      let businessUnit = configs[0].businessUnit

      let where = {
        businesses: {
          elemMatch: {
            code: businessUnit
          }
        }
      }

      let withProducts = []
      let productsFilter = []

      if (withCategory !== null) {
        let aux = []
        let categories = await Utils.getSubcategories([withCategory], [])

        categories.forEach(category => {
          aux.push({ categoryCode: category.categoryCode })
        })

        aux.unshift({ categoryCode: withCategory })

        // Filter by categoryCode of product
        where.and = [{
          or: aux
        }]
        withProducts = aux
      }

      if (withUrl !== null && withProducts.length === 0) {
        let pages = await Utils.loopbackFind(Product.app.models.Landing, { where: { instanceId: req.headers.instanceId, url: '/' + withUrl, status: true } })
        if (pages.length > 0) {
          if (!Utils.isEmpty(pages[0].catalog)) {
            let catalog = await Utils.loopbackFind(Product.app.models.Catalog, { where: { uuid: pages[0].catalog, status: true } })
            productsFilter = catalog[0].products
          }
        }

        if (productsFilter.length > 0) {
          // Filter by code of product
          where.and = [{
            or: productsFilter
          }]
          withProducts = productsFilter
        }
      }

      if (withProducts.length === 0) {
        if (withUrl !== null || withCategory !== null) {
          return []
        }
      }

      // Filter for genderCode of product
      if (withGenders.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withGenders.forEach(gender => {
          where.and[where.and.length - 1].or.push({
            genderCode: Number(gender)
          })
        })
      }

      // Filter for brandCode of product
      if (withBrands.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withBrands.forEach(brand => {
          where.and[where.and.length - 1].or.push({
            brandCode: Number(brand)
          })
        })
      }

      // Filter for sizes of product
      if (withSizes.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withSizes.forEach(size => {
          where.and[where.and.length - 1].or.push({
            sizes: size
          })
        })
      }

      // Filter for attributes of product
      if (withAttributes.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withAttributes.forEach(attribute => {
          where.and[where.and.length - 1].or.push({
            attributes: {
              elemMatch: {
                code: Number(attribute)
              }
            }
          })
        })
      }

      // Filter for price of product
      if (withPrices.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            and: []
          }]
        } else {
          where.and.push({
            and: []
          })
        }

        withPrices.forEach(price => {
          where.and[where.and.length - 1].and.push({
            price: {
              lte: Number(price.split('|')[1])
            }
          })

          where.and[where.and.length - 1].and.push({
            price: {
              gte: Number(price.split('|')[0])
            }
          })
        })
      }

      let order = 'buyDate DESC'
      if (withOrderBy !== null && !Utils.isEmpty(withOrderBy)) {
        if (withOrderBy === 'priceLowToHight') {
          //query += ' ORDER BY CASE WHEN precio_ahorro > 0 THEN precio_rebaja ELSE precio END ASC'
          order = 'price ASC'
        }
        else if (withOrderBy === 'priceHightToLow') {
          order = 'price DESC'
          //query += ' ORDER BY CASE WHEN precio_ahorro > 0 THEN precio_rebaja ELSE precio END DESC'
        } else if (withOrderBy === 'brandNameASC') {
          order = 'name ASC'
        } else if (withOrderBy === 'brandNameDESC') {
          order = 'name DESC'
        } else if (withOrderBy === 'bestOffer') {
          order = 'percentagePrice DESC'
        }
      }

      if (withOffers !== null && withOffers) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        where.and[where.and.length - 1].or.push({
          percentagePrice: {
            gt: 0
          }
        })
      }

      if (withBluePoints !== null && withBluePoints) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        where.and[where.and.length - 1].or.push({
          'bluePoints.status': true
        })
      }

      //withZones = ['02', '24']
      let filterZones = { where: { and: [{ or: [] }] } }

      // Filter for zones
      if (withZones.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withZones.forEach(zone => {
          where.and[where.and.length - 1].or.push({
            stores: {
              elemMatch: {
                zoneId: zone
              }
            }
          })
          filterZones.where.and[0].or.push({ zoneCode: zone })
        })


      }

      // Filter with branch
      if (withBranches.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withBranches.forEach(branch => {
          where.and[where.and.length - 1].or.push({
            stores: {
              elemMatch: {
                storeId: branch
              }
            }
          })
        })
      }

      let filterProducts = { where: where }
      if (withOrderBy === 'brandNameASC' || withOrderBy === 'brandNameDESC') {
        filterProducts.include = ['gender', 'brand', 'detail']
      } else {
        filterProducts.order = order
        filterProducts.include = ['gender', 'brand', 'detail']
      }

      filterProducts.limit = withLimit
      filterProducts.skip = (withPage * withLimit)

      products = await Utils.loopbackFind(Product.app.models.Product, filterProducts)
    } catch (err) {
      console.log(err)
    }

    return products
  }

  Product.remoteMethod(
    'searchWithFilters',
    {
      description: 'Search products by filters',
      http: {
        path: '/filter',
        verb: 'GET'
      },
      accepts: [
        { arg: 'filter', type: 'string', required: true },
        { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
      ],
      returns: {
        arg: 'data',
        type: 'object',
        root: true
      }
    }
  )

  Product.getFilters = async (data, req) => {
    let instanceId = req.headers.instanceId
    let headers = req.headers

    let withCategory = null
    let withPosition = null
    let withUrl = null
    let withGenders = []
    let withOffers = null
    let withBluePoints = null
    let withSubcategories = []
    let withBranches = []
    let withBrands = []
    let withSizes = []
    let withAttributes = []
    let withPrices = []

    let withZones = []

    // Category
    if (data.c !== undefined && data.c !== null)
      withCategory = Number(data.c)

    // Geolocation
    if (headers.position !== undefined)
      withPosition = JSON.parse(headers.position)

    // URL custom
    if (data.u !== undefined)
      withUrl = data.u

    // Genders
    if (data.g !== undefined)
      withGenders = data.g

    // Offers
    if (data.o !== undefined)
      withOffers = data.o

    // Blue points
    if (data.bp !== undefined)
      withBluePoints = data.bp

    // Subcategories
    if (data.sc !== undefined)
      withSubcategories = data.sc

    // Branch
    if (data.br !== undefined)
      withBranches = data.br

    // Brands
    if (data.b !== undefined)
      withBrands = data.b

    // Sizes
    if (data.s !== undefined)
      withSizes = data.s

    // Attributes
    if (data.a !== undefined)
      withAttributes = data.a

    // Prices
    if (data.p !== undefined)
      withPrices = data.p

    // Zones
    if (data.z !== undefined)
      withZones = data.z

    let filtersResponse = {
      distance: '',
      offers: 0,
      bluePoints: 0,
      branches: [],
      subcategories: [],
      brands: [],
      sizes: [],
      attributes: [],
      prices: [],
      genders: [],
      count: 0,
      zones: []
    }

    try {
      const db = mysql.connectToDBManually()
      let configs = await db.query('SELECT businessUnit, radius FROM Config WHERE instanceId = ? LIMIT 1;', [instanceId])
      await db.close()

      let businessUnit = configs[0].businessUnit

      let where = {
        businesses: {
          elemMatch: {
            code: businessUnit
          }
        }
      }

      let withProducts = []
      let productsFilter = []

      if (withCategory !== null) {
        let aux = []
        let categories = await Utils.getSubcategories([withCategory], [])

        categories.forEach(category => {
          aux.push({ categoryCode: category.categoryCode })
        })

        aux.unshift({ categoryCode: withCategory })

        // Filter by categoryCode of product
        where.and = [{
          or: aux
        }]
        withProducts = aux
      }

      if (withUrl !== null && withProducts.length === 0) {
        let pages = await Utils.loopbackFind(Product.app.models.Landing, { where: { instanceId: req.headers.instanceId, url: '/' + withUrl, status: true } })
        if (pages.length > 0) {
          if (!Utils.isEmpty(pages[0].catalog)) {
            let catalog = await Utils.loopbackFind(Product.app.models.Catalog, { where: { uuid: pages[0].catalog, status: true } })
            productsFilter = catalog[0].products
          }
        }

        if (productsFilter.length > 0) {
          // Filter by code of product
          where.and = [{
            or: productsFilter
          }]
          withProducts = productsFilter
        }
      }

      if (withProducts.length === 0) {
        if (withUrl !== null || withCategory !== null) {
          return filtersResponse
        }
      }

      // Filter for genderCode of product
      if (withGenders.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withGenders.forEach(gender => {
          where.and[where.and.length - 1].or.push({
            genderCode: Number(gender)
          })
        })
      }

      // Filter for brandCode of product
      if (withBrands.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withBrands.forEach(brand => {
          where.and[where.and.length - 1].or.push({
            brandCode: Number(brand)
          })
        })
      }

      // Filter for sizes of product
      if (withSizes.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withSizes.forEach(size => {
          where.and[where.and.length - 1].or.push({
            sizes: size
          })
        })
      }

      // Filter for attributes of product
      if (withAttributes.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withAttributes.forEach(attribute => {
          where.and[where.and.length - 1].or.push({
            attributes: {
              elemMatch: {
                code: Number(attribute)
              }
            }
          })
        })
      }

      // Filter for price of product
      if (withPrices.length > 0) {
        if (where.and === undefined) {
          where.and = [{
            and: []
          }]
        } else {
          where.and.push({
            and: []
          })
        }

        withPrices.forEach(price => {
          where.and[where.and.length - 1].and.push({
            price: {
              lte: Number(price.split('|')[1])
            }
          })

          where.and[where.and.length - 1].and.push({
            price: {
              gte: Number(price.split('|')[0])
            }
          })
        })
      }

      if (withOffers !== null && withOffers) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        where.and[where.and.length - 1].or.push({
          percentagePrice: {
            gt: 0
          }
        })
      }

      if (withBluePoints !== null && withBluePoints) {
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        where.and[where.and.length - 1].or.push({
          'bluePoints.status': true
        })
      }


      let filterZones = { where: { and: [{ or: [] }] } }

      // Filter for zones
      if (withZones.length > 0) {

        withZones.forEach(zone => {
          where.stores = {
            elemMatch: {
              zoneId: zone
            }
          }
          filterZones.where.and[0].or.push({ zoneCode: zone })
        })
      }

      let whereWithOutBranches = null
      // Filter with branch
      if (withBranches.length > 0) {
        whereWithOutBranches = { ...where }
        if (where.and === undefined) {
          where.and = [{
            or: []
          }]
        } else {
          where.and.push({
            or: []
          })
        }

        withBranches.forEach(branch => {
          where.and[where.and.length - 1].or.push({
            stores: {
              elemMatch: {
                storeId: branch
              }
            }
          })
        })
      }

      let filterProducts = { where: where, include: ['gender', 'brand', 'detail'] }
      let products = await Utils.loopbackFind(Product.app.models.Product, filterProducts)

      filtersResponse.count = products.length

      let genders = [
        { id: 1, description: 'MUJERES', count: 0 },
        { id: 2, description: 'HOMBRES', count: 0 },
        { id: 3, description: 'NIÑAS', count: 0 },
        { id: 4, description: 'NIÑOS', count: 0 },
      ]

      let brands = []

      let catAttributes = await Utils.loopbackFind(Product.app.models.Attribute, {})
      let attributes = []

      let ranges = [
        { min: '0', max: '199', description: 'Menor de $200', count: 0 },
        { min: '200', max: '499', description: '$200 - $499', count: 0 },
        { min: '500', max: '999', description: '$500 - $999', count: 0 },
        { min: '1000', max: '1499', description: '$1,000 - $1,499', count: 0 },
        { min: '1500', max: '1999', description: '$1,500 - $1,999', count: 0 },
        { min: '2000', max: '4999', description: '$2,000 - $4,999', count: 0 },
        { min: '5000', max: '999999', description: '$5,000 o mayor', count: 0 }
      ]

      let sizes = []
      let priceType = 'price'
      products.forEach(product => {
        priceType = 'price'
        if (product.percentagePrice > 0) {
          filtersResponse.offers++
          priceType = 'creditPrice'
        }

        if (product.bluePoints.status) {
          filtersResponse.bluePoints++
        }


        if (product[priceType] <= 199) {
          ranges[0].count++
        }
        else if (product[priceType] >= 200 && product[priceType] <= 499) {
          ranges[1].count++
        }
        else if (product[priceType] >= 500 && product[priceType] <= 999) {
          ranges[2].count++
        }
        else if (product[priceType] >= 1000 && product[priceType] <= 1499) {
          ranges[3].count++
        }
        else if (product[priceType] >= 1500 && product[priceType] <= 1999) {
          ranges[4].count++
        }
        else if (product[priceType] >= 2000 && product[priceType] <= 4999) {
          ranges[5].count++
        }
        else if (product[priceType] >= 5000) {
          ranges[6].count++
        }

        if (product.genderCode === 1) {
          genders[0].count++
        } else if (product.genderCode === 2) {
          genders[1].count++
        } else if (product.genderCode === 3) {
          genders[2].count++
        } else if (product.genderCode === 4) {
          genders[3].count++
        }

        product.attributes.forEach(attribute => {
          attributes.push(attribute)
        })

        brands.push(product.brand)
        product.sizes.forEach(size => {
          sizes.push(size)
        })
      })

      let auxBrands = Utils.groupBy(brands, 'code')
      brands = Utils.uniqBy(brands, 'code')
      brands = Utils.orderBy(brands, 'name')

      brands.forEach((brand) => {
        brand.count = 0
        if (auxBrands[brand.code] !== undefined) {
          brand.count = auxBrands[brand.code].length
        }
      })

      attributes = Utils.groupBy(attributes, 'code')
      let finalAttributes = []
      catAttributes.forEach((attribute, idx) => {
        attribute.count = 0
        if (attributes[attribute.code] !== undefined) {
          attribute.count = attributes[attribute.code].length
          finalAttributes.push(attribute)
        }
      })

      let rangesSizes = []
      let size = ''
      for (let i = 0; i <= 40; i++) {
        size = '' + i
        rangesSizes.push({ value: size, count: 0 })
        size += '.5'
        rangesSizes.push({ value: size, count: 0 })
      }

      sizes.forEach((item) => {
        rangesSizes.forEach((range) => {
          if (range.value === item)
            range.count++
        })
      })

      rangesSizes = Utils.orderBy(rangesSizes, 'value', 'ASC')
      filtersResponse.sizes = rangesSizes.filter((data, index) => { return data.count > 0 })

      let finalGenders = []
      genders.forEach((gender, idx) => {
        if (gender.count !== 0) {
          finalGenders.push(gender)
        }
      })

      let zones = []
      if (withZones.length > 0) {
        zones = await Utils.loopbackFind(Product.app.models.Zone, { where: { code: withZones[0] } })
      } else {
        zones = await Utils.loopbackFind(Product.app.models.Zone, {})
      }

      if (zones.length > 0 && products.length > 0) {
        await Utils.asyncForEach(zones, async (zone) => {
          if (withZones.some((element) => element === zone.code)) {
            zone.checked = true
          }
          filterProducts.where.stores = { elemMatch: { zoneId: zone.code } }
          // let counterProducts = await Utils.loopbackFind(Product.app.models.Product, filterProducts)
          // zone.count = counterProducts.length
          zone.count = 0
          products.forEach(product => {
            if (product.stores !== undefined && product.stores !== null) {
              let response = product.stores.some((element) => element.zoneId === zone.code)
              if (response) {
                zone.count++
              }
            }
          })

        })
        filtersResponse.zones = zones
      }
      if (withZones > 0) {
        let stores = await Utils.loopbackFind(Product.app.models.Store, filterZones)

        await stores.forEach(store => {
          if (withBranches.some((element) => element === store.code)) {
            store.checked = true
          }
          store.count = 0
          products.forEach(product => {
            if (product.stores !== undefined && product.stores !== null) {
              let response = product.stores.some((element) => element.storeId === store.code)
              if (response) {
                store.count++
              }
            }
          })
        })
        filtersResponse.branches = stores
      }

      filtersResponse.genders = finalGenders
      filtersResponse.brands = brands
      filtersResponse.attributes = finalAttributes
      filtersResponse.prices = ranges

    } catch (err) {
      console.log(err)
    }

    return filtersResponse
  }

  Product.remoteMethod(
    'getFilters',
    {
      description: 'Get filters by products',
      http: {
        path: '/filters',
        verb: 'POST'
      },
      accepts: [
        { arg: 'data', type: 'object', required: true },
        { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
      ],
      returns: {
        arg: 'data',
        type: 'object',
        root: true
      }
    }
  )

  Product.checkLocations = async (data) => {
    let response = []

    const mdb = mongodb.getConnection('db')
    const db = mysql.connectToDBManually()

    try {
      let cities = await db.query('SELECT DISTINCT municipalityCode, stateCode, cityMunicipalityStateCode FROM Location WHERE zip = ?', [data.deliveryZip])

      if (cities.length <= 0) {
        throw 'Código postal no encontrado.'
      }

      let stores = await mongodb.mongoFind(mdb, 'Store', {
        'zone.municipalityCode': cities[0].municipalityCode,
        'zone.stateCode': cities[0].stateCode,
        'cityId': cities[0].cityMunicipalityStateCode
      })

      let allStores = await mongodb.mongoFind(mdb, 'Store', {})

      let responseWebService = null
      let isLocal = false
      let isLocalTmp = false
      let whereLocal = []
      let whereForeigners = []
      let quantity = 0
      let full = false
      let expressDelivery = false

      await Utils.asyncForEach(data.products, async (product) => {
        responseWebService = await Utils.request({
          method: 'GET',
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products/' + product.code + '/stock'
        })

        if (responseWebService.body !== undefined) {
          responseWebService = JSON.parse(responseWebService.body)

          responseWebService.forEach((result) => {
            if (Number(result.size) === product.size) {
              stores.forEach((store) => {
                if (store.code === result.branch) {
                  isLocal = true
                  isLocalTmp = true
                  quantity += Number(result.stock)
                  whereLocal.push(result)
                }
              })

              if (allStores.length > 0 && allStores !== undefined && allStores !== null) {
                allStores.forEach((store) => {
                  if (store.code === result.branch) {
                    result.zone = store.zoneCode
                    result.lat = store.lat
                    result.lng = store.lng
                    result.name = store.name
                  }
                })
              }

              if (!isLocalTmp) {
                whereForeigners.push(result)
              }

              isLocalTmp = false
            }
          })

          if (isLocal) {
            let color = ''
            let description = ''

            if (quantity >= product.quantity) {
              full = true
              color = '#448345'
              description = 'De 3 a 5 días hábiles.'

              if (Utils.isSpecialProduct(product.code)) {
                description = 'De 8 a 10 días hábiles.'
              }
            } else {
              color = '#E98607'
              description = (quantity.length === 1) ? quantity + ' producto ' : quantity + ' productos '

              if (Utils.isSpecialProduct(product.code)) {
                description += 'de 8 a 10 días hábiles. El resto llega de 30 a 35 días hábiles.'
              } else {
                description += 'de 4 a 8 días hábiles. El resto llega de 5 a 10 días hábiles.'
              }
            }

            if (!product.stock.status) {
              color = '#448345'
              description = 'De ' + product.stock.deliveryDays + ' a ' + (Number(product.stock.deliveryDays) + 3) + ' días hábiles.'
            }

            expressDelivery = await calzzamovil.isExpressDelivery(db, cities[0])

            response.push({
              color: color,
              description: description,
              id: product.code,
              size: product.size,
              quantity: product.quantity,
              full: full,
              available: quantity,
              locations: whereLocal,
              otherLocations: Utils.uniqBy(whereForeigners, 'branch'),
              isLocal: isLocal,
              expressDelivery: expressDelivery
            })
          } else {
            let color = '#E98607'
            let description = 'De 5 a 8 días hábiles.'

            if (Utils.isSpecialProduct(product.code)) {
              description = 'De 30 a 35 días hábiles.'
            }

            if (!product.stock.status) {
              color = '#448345'
              description = 'De ' + product.stock.deliveryDays + ' a ' + (Number(product.stock.deliveryDays) + 3) + ' días hábiles.'
            }

            response.push({
              color: color,
              description: description,
              id: product.code,
              size: product.size,
              isLocal: isLocal,
              full: false,
              available: 0,
              locations: [],
              otherLocations: Utils.uniqBy(whereForeigners, 'branch')
            })
          }

          whereLocal = []
          whereForeigners = []
          isLocal = false
          quantity = 0
          full = false
        }
      })
    } catch (err) {
      console.log(err)
    }

    await db.close()
    return response
  }

  Product.remoteMethod('checkLocations', {
    http: {
      path: '/locations',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Product.existence = async (code, req) => {
    let response = { product: null, stores: [] }
    let product = { code: null, name: null, brand: null, description: null, price: null, creditPrice: null, photos: [] }

    const mdb = mongodb.getConnection('db')

    try {

      let productInfo = await mongodb.mongoFind(mdb, 'Product', { code: code })
      if (productInfo.length > 0) {
        product.code = productInfo[0].code
        product.name = productInfo[0].name
        product.description = productInfo[0].description
        product.price = productInfo[0].price
        product.creditPrice = productInfo[0].creditPrice
        product.discountPrice = productInfo[0].discountPrice
        product.savingPrice = productInfo[0].savingPrice
        product.percentagePrice = productInfo[0].percentagePrice
        product.partiality = productInfo[0].partiality
        product.modelCode = productInfo[0].modelCode
        product.brandCode = productInfo[0].brandCode
        product.sublineCode = productInfo[0].sublineCode
        product.photos = productInfo[0].photos

        let brand = await mongodb.mongoFind(mdb, 'Brand', { code: productInfo[0].brandCode })
        if (brand.length > 0) {
          product.brand = brand[0]
        }

        response.product = product
      }

      let responseWebService = await Utils.request({
        method: 'GET',
        url: configs.HOST + ':' + configs.PORT + '/api/products/' + code + '/stock'
      })
      if (responseWebService.body !== undefined) {
        responseWebService = JSON.parse(responseWebService.body)
        await Utils.asyncForEach(responseWebService, async (element) => {
          if (response.stores.some((store) => store.branch === element.branch)) {
            let foundIndex = response.stores.findIndex(element2 => element2.branch == element.branch)
            response.stores[foundIndex].sizes.push({ size: Number(element.size), stock: Number(element.stock) })
          } else {
            let store = await mongodb.mongoFind(mdb, 'Store', { code: String(element.branch) })
            if (store.length > 0) {
              response.stores.push(
                {
                  branch: element.branch,
                  name: store[0].name,
                  lat: store[0].lat,
                  lng: store[0].lng,
                  reference: store[0].reference,
                  interiorNumber: store[0].interiorNumber,
                  zip: store[0].zip,
                  location: store[0].location,
                  municipality: store[0].municipality,
                  state: store[0].state,
                  street: store[0].street,
                  sizes: [{ size: Number(element.size), stock: Number(element.stock) }]
                })
            }
          }
        })
      }
    } catch (error) {
      console.log(error)
    }

    return response
  }

  Product.remoteMethod('existence', {
    description: 'Cancel order.',
    http: {
      path: '/existence/:code/',
      verb: 'GET'
    },
    accepts: [
      { arg: 'code', type: 'string', require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'Array',
      root: true
    }
  })
}
