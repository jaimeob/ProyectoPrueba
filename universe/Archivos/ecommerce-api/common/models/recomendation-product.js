'use strict'

const Utils = require('../Utils.js')
const mongodb = require('../classes/mongodb.js')

module.exports = (Recomendationproduct) => {

  Recomendationproduct.addProduct = async (req) => {
    let response = { created: false }
    let user = req.headers.user
    let instance = req.headers.instanceId
    let MAX_PRODUCTS_RECOMENDATION = 50
    const mdb = mongodb.getConnection('db')
    try {
      if (user !== undefined && !isNaN(user.id)) {
        let userProducts = await mongodb.mongoFind(mdb, 'RecomendationProduct', { userId: user.id + '', instanceId: instance })

        if (userProducts.length === 0) {
          // Usuarios que no tienen ningun producto registrado 
          await mongodb.createMongoDB(Recomendationproduct, { userId: user.id + '', products: [''], instanceId: instance })
        }
        // Ya existe el usuario en bd
        // Obtenemos productos que ha visto
        let seenProducts = await mongodb.mongoFind(mdb, 'RecentlySeen', { userId: user.id + '', instanceId: instance })

        // Operación para saber cuantos productos recomendar por producto visto
        let maxProductsRecomendation = Math.round(MAX_PRODUCTS_RECOMENDATION / seenProducts[0].products.length)
        maxProductsRecomendation++
        if (maxProductsRecomendation > 5) {
          maxProductsRecomendation = 5
        }
        let productToSave = []

        await Utils.asyncForEach(seenProducts[0].products, async (productCode) => {

          // Hacer consulta para ver info de producto
          let product = await Utils.loopbackFind(Recomendationproduct.app.models.Product, { where: { code: productCode } })

          // Ya teniedo el producto, buscar productos relacionados con brand y category que no sea el producto visto
          //let RecomendationProducts = await Utils.loopbackFind(Recomendationproduct.app.models.Product, { where: { or: [{ categoryCode: product[0].categoryCode }, { brandCode: product[0].brandCode }], code: { nlike: productCode }  }, limit: maxProductsRecomendation })
          let recomendationProducts = await Utils.loopbackFind(Recomendationproduct.app.models.Product, { where: { and: [{ categoryCode: product[0].categoryCode }, { brandCode: product[0].brandCode }], code: { nlike: productCode } }, limit: maxProductsRecomendation })
          // if (recomendationProducts.length < maxProductsRecomendation ) {
          //     let alternativeRecomendation = await Utils.loopbackFind(Recomendationproduct.app.models.Product, { where: { or: [{ categoryCode: product[0].categoryCode }, { brandCode: product[0].brandCode }], code: { nlike: productCode }  }, limit: maxProductsRecomendation })
          //     recomendationProducts = [...recomendationProducts, ...alternativeRecomendation]
          // }

          recomendationProducts.map(item => {
            if (productToSave.length !== MAX_PRODUCTS_RECOMENDATION) {
              // Revisar que no exista en productos vistos
              ((seenProducts[0].products.find(element => element === item.code) || (productToSave.find(element => element === item.code)))) ? '' : productToSave.push(item.code)
            }
          })
        })
        await mongodb.findAndUpdateMongoDB(mdb, 'RecomendationProduct', { userId: user.id + '', instanceId: instance }, { '$set': { products: productToSave } })
        response.created = true
      }
    } catch (err) {
      throw err
    }
    return response
  }

  Recomendationproduct.remoteMethod('addProduct', {
    description: 'Add a products recomendation',
    http: {
      path: '/add-product',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
