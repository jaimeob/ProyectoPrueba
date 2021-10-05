'use strict'

const Utils = require('../Utils.js')

module.exports = function(Product) {
  Product.observe('loaded', async (ctx) => {
    // new properties
    if (ctx.data.detail === undefined) {
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
      await Utils.asyncForEach(ctx.data.detail.tags, async (tag, idx) => {
        let tagItem = await Utils.loopbackFind(Product.app.models.Tag, { where: { id: tag, status: true } } )
        ctx.data.detail.tags[idx] = tagItem[0]
      })
    }

    // product url
    let url = Utils.generateURL(ctx.data.name)
    ctx.data.url = '/' + url + '-' + ctx.data.code

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
  
  Product.getProducts = async (req) => {
    let response = []
    try {
      // Get instance by business unit selected
      /*
      let ecommerce = await Utils.connectToDB({
        host: datasources.ecommerce.host,
        port: datasources.ecommerce.port,
        database: datasources.ecommerce.database,
        user: datasources.ecommerce.user,
        password: datasources.ecommerce.password
      })

      let instances = await ecommerce.query('SELECT c.businessUnit FROM Instance AS i LEFT JOIN Config AS c ON i.id = c.instanceId WHERE i.uuid = ? AND i.status = 1 LIMIT 1;', [
        req.headers.businessunit
      ])

      let businessUnit = instances[0].businessUnit
      await ecommerce.close()
      */

      let filter = {
        limit: 50,
        include: [ 'gender', 'brand', 'detail' ]
      }

      let products = await Utils.loopbackFind(Product, filter)
      response = products
    } catch (err) {
      console.log(err)
    }
    return response
  }

  Product.remoteMethod('getProducts', {
    description: 'Get all products',
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
}
