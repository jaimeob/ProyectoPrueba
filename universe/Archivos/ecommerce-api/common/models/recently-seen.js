'use strict'

const Utils = require('../Utils.js')
const mongodb = require('../classes/mongodb.js')
const ObjectId = require('mongodb').ObjectID

module.exports = (Recentlyseen) => {
  Recentlyseen.addProduct = async (req, data) => {
    let response = { created: false }
    let user = req.headers.user
    let instance = req.headers.instanceId
    let MAX_PRODUCTS = 25
    const mdb = mongodb.getConnection('db')
    try {
      if (user !== undefined && !isNaN(user.id)) {
        let userProducts = await mongodb.mongoFind(mdb, 'RecentlySeen', { userId: user.id, instanceId: instance })
        if (userProducts.length !== 0) {
          // Usuarios que ya han visto productos
          let products = userProducts[0].products
          if (products.find(element => element === data.product)) {
            // Ya existe el producto que acaba de ver
            // Eliminamors producto para despues agregar al principio
            products = products.filter((item) => {
              return item !== data.product
            })
            products.splice(0, 0, data.product)
          } else {
            // El producto no existe en la lista de productos vistos
            products.splice(0, 0, data.product)
          }
          if (products.length > MAX_PRODUCTS) {
            products.splice(-1, 1)
          }
          await mongodb.findAndUpdateMongoDB(mdb, 'RecentlySeen', { _id: ObjectId(userProducts[0]._id) }, { '$set': { products: products } })

        } else {
          // Usuarios que no tienen ningun producto registrado 
          await mongodb.createMongoDB(Recentlyseen, { userId: user.id, products: [data.product], instanceId: instance })
        }
        response.created = true
      }
    } catch (err) {
      throw err
    }
    return response
  }

  Recentlyseen.remoteMethod('addProduct', {
    description: 'Add products for recently seen',
    http: {
      path: '/add-product',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
