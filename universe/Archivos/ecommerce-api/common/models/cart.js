'use strict'

const ObjectId = require('mongodb').ObjectID
const Utils = require('../Utils.js')
const mongodb = require('../classes/mongodb.js')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

module.exports = (Cart) => {
  const messagesError = {
    deletedProduct: {
      code: '0001',
      message: 'El producto no se encuentra vigente por el momento.'
    },
    withoutStock: {
      code: '0002',
      message: 'No hay suficiente existencia para este producto.'
    }
  }

  // Add product to shopping cart
  Cart.addProduct = async (data, req) => {
    let instanceId = null
    let userId = null
    let uuid = null
    let response = { added: false }

    const db = mongodb.getConnection('db')

    try {
      if (req.headers !== undefined) {
        instanceId = req.headers.instanceId
        if (req.headers.metadata !== undefined) {
          let metadata = JSON.parse(req.headers.metadata)
          if (metadata.uuid !== undefined && metadata.uuid !== null && !Utils.isEmpty(metadata.uuid)) {
            uuid = metadata.uuid
          }
        }
      }

      let query = { '$and': [{ uuid: uuid }, { status: true }] }
      if (req.headers.user !== undefined) {
        userId = Number(req.headers.user.id)
        query = { '$and': [{ user: userId }, { status: true }] }
      }

      if (uuid === null && userId === null) {
        throw 'Ocurrió un problema al consultar el carrito de compras del usuario.'
      }

      // Revisar vigencia del producto
      let checkProducts = await mongodb.mongoFind(db, 'Product', { code: data.product })
      if (checkProducts.length !== 1) {
        throw messagesError.deletedProduct
      }

      // Revisar existencia
      let checkStock = await Utils.request({ method: 'GET', url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products/' + data.product + '/stock', json: true })
      let stock = 0

      checkStock.body.forEach(product => {
        if (product.article === data.article) {
          stock += Number(product.stock)
        }
      })

      if (stock < data.quantity && checkProducts[0].stock !== undefined && checkProducts[0].stock.status) {
        throw messagesError.withoutStock
      }

      // Revisar si el usuario tiene un carrito de compras activo
      let carts = await mongodb.mongoFind(db, 'Cart', query)
      if (carts.length === 0) {
        // Crear nuevo carrito
        let created = await mongodb.createMongoDB(Cart, {
          uuid: uuid,
          user: userId,
          products: [
            {
              instance: instanceId,
              code: data.product,
              size: data.size,
              article: data.article,
              quantity: data.quantity
            }
          ],
          historial: [
            {
              action: 'ADD_PRODUCT',
              instance: instanceId,
              code: data.product,
              size: data.size,
              article: data.article,
              quantity: data.quantity,
              createdAt: new Date()
            },
            {
              action: 'NEW_CART',
              createdAt: new Date()
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          status: true
        })

        if (created.success) {
          response.added = true
        }
      } else if (carts.length === 1) {
        // Usar carrito actual
        let cart = carts[0]
        let products = cart.products
        let historial = cart.historial
        let exist = false
        let oldQuantity = 0

        products.forEach(product => {
          if (product.article === data.article) {
            exist = true
            // oldQuantity = product.quantity
            // product.quantity = product.quantity + data.quantity
            // data.quantity = product.quantity
          }
        })

        if (exist) {
          historial.unshift({
            action: 'UPDATE_QUANTITY',
            instance: instanceId,
            code: data.product,
            size: data.size,
            article: data.article,
            oldQuantity: oldQuantity,
            quantity: data.quantity,
            createdAt: new Date()
          })
        } else {

          historial.unshift({
            action: 'ADD_PRODUCT',
            instance: instanceId,
            code: data.product,
            size: data.size,
            article: data.article,
            quantity: data.quantity,
            createdAt: new Date()
          })
        }

        products.unshift({
          instance: instanceId,
          code: data.product,
          size: data.size,
          article: data.article,
          quantity: data.quantity
        })

        cart.products = products
        cart.historial = historial

        let updated = await mongodb.findAndUpdateMongoDB(db, 'Cart', { _id: ObjectId(cart._id) }, {
          '$set': {
            products: products,
            historial: historial,
            updatedAt: new Date()
          }
        })

        if (updated.success) {
          response.added = true
        } else {
          console.log('Error al actualizar carrito de compras')
        }
      } else {
        console.log('Existe más de un carrito de compras activo para este usuario')
        // console.log(carts)
      }
    } catch (err) {
      console.log('Error actualizar carrito de compras')
      console.log(err)
      response.error = err
    }

    if (response.error) {
      throw response
    } else {
      return response
    }
  }

  Cart.remoteMethod('addProduct', {
    description: 'Add product to active shopping cart by user',
    http: {
      path: '/add',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: "object", require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  // Update quantity (products)
  Cart.updateProduct = async (data, req) => {
    let instanceId = null
    let userId = null
    let uuid = null
    let response = { updated: false }

    const db = mongodb.getConnection('db')

    try {
      if (req.headers !== undefined) {
        instanceId = req.headers.instanceId
        if (req.headers.metadata !== undefined) {
          let metadata = JSON.parse(req.headers.metadata)
          if (metadata.uuid !== undefined && metadata.uuid !== null && !Utils.isEmpty(metadata.uuid)) {
            uuid = metadata.uuid
          }
        }
      }

      let query = { '$and': [{ uuid: uuid }, { status: true }] }
      if (req.headers.user !== undefined) {
        userId = Number(req.headers.user.id)
        query = { '$and': [{ user: userId }, { status: true }] }
      }

      if (uuid === null && userId === null) {
        throw 'Ocurrió un problema al consultar el carrito de compras del usuario.'
      }

      console.log('data', data)
      // Revisar si el usuario tiene un carrito de compras activo
      let carts = await mongodb.mongoFind(db, 'Cart', query)
      if (carts.length === 1) {
        let products = carts[0].products
        let historial = carts[0].historial
        if (data.id !== null && data.id !== undefined) {
          products[data.id].shippingMethod = data.shippingMethod
        } else {
          let productsClone = [...products]
          productsClone.forEach(product => {
            if (product.code === data.product && product.size === data.size && product.article === data.article) {
              if (data.shippingMethod !== null && data.shippingMethod !== undefined) {
                product.shippingMethod = data.shippingMethod
              } else {
                historial.unshift({
                  action: 'UPDATE_QUANTITY',
                  instance: instanceId,
                  code: data.product,
                  size: product.size,
                  article: product.article,
                  oldQuantity: product.quantity,
                  quantity: data.quantity,
                  createdAt: new Date()
                })
                // product.instance = instanceId
                // product.quantity = data.quantity
                console.log('Aumenta');
                
              }
            }
          })
          products.push({
            instance: instanceId,
            code: data.product,
            size: data.size,
            article: data.article,
            quantity: 1
          })
        }

        let responseMongo = await mongodb.findAndUpdateMongoDB(db, 'Cart', { _id: ObjectId(carts[0]._id) }, {
          '$set': {
            products: products,
            historial: historial,
            updatedAt: new Date()
          }
        })

        response.updated = responseMongo.success
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

  Cart.remoteMethod('updateProduct', {
    description: 'Update product from cart by user',
    http: {
      path: '/update',
      verb: 'PATCH'
    },
    accepts: [
      { arg: 'data', type: "object", require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  // Delete product from shopping cart
  Cart.removeProduct = async (data, req) => {
    let instanceId = null
    let userId = null
    let uuid = null
    let response = { removed: false }

    let db = mongodb.getConnection('db')

    try {
      if (req.headers !== undefined) {
        instanceId = req.headers.instanceId
        if (req.headers.metadata !== undefined) {
          let metadata = JSON.parse(req.headers.metadata)
          if (metadata.uuid !== undefined && metadata.uuid !== null && !Utils.isEmpty(metadata.uuid)) {
            uuid = metadata.uuid
          }
        }
      }

      let query = { '$and': [{ uuid: uuid }, { status: true }] }
      if (req.headers.user !== undefined) {
        userId = Number(req.headers.user.id)
        query = { '$and': [{ user: userId }, { status: true }] }
      }

      if (uuid === null && userId === null) {
        throw 'Ocurrió un problema al consultar el carrito de compras del usuario.'
      }

      // Revisar si el usuario tiene un carrito de compras activo
      let carts = await mongodb.mongoFind(db, 'Cart', query)
      if (carts.length === 1) {
        let products = []
        let historial = carts[0].historial
        carts[0].products.forEach(product => {
          if (product.code === data.product && product.size === data.size && product.article === data.article) {
            historial.unshift({
              action: 'REMOVE_PRODUCT',
              instance: instanceId,
              code: data.product,
              size: product.size,
              article: product.article,
              quantity: product.quantity,
              createdAt: new Date()
            })
          } else {
            products.push(product)
          }
        })

        let responseMongo = await mongodb.findAndUpdateMongoDB(db, 'Cart', { _id: ObjectId(carts[0]._id) }, {
          '$set': {
            products: products,
            historial: historial,
            updatedAt: new Date()
          }
        })

        response.removed = responseMongo.success
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

  Cart.remoteMethod('removeProduct', {
    description: 'Remove product from cart by user',
    http: {
      path: '/remove',
      verb: 'DELETE'
    },
    accepts: [
      { arg: 'data', type: "object", require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  // Change shopping cart status
  Cart.buy = async (req, data) => {
    let response = { changed: false }
    let webhook = false
    let userId = null
    let uuid = null

    const db = mongodb.getConnection('db')

    try {
      if (req.headers.webhook !== undefined && req.headers.webhook === "true") {
        webhook = true
      }

      let instanceId = (webhook) ? Number(req.headers.instanceid) : req.headers.instanceId

      if (req.headers.metadata !== undefined) {
        let metadata = JSON.parse(req.headers.metadata)
        if (metadata.uuid !== undefined && metadata.uuid !== null && !Utils.isEmpty(metadata.uuid)) {
          uuid = metadata.uuid
        }
      }

      let query = { '$and': [{ uuid: uuid }, { status: true }] }
      if (webhook || req.headers.user !== undefined) {
        userId = (webhook) ? Number(req.headers.userid) : req.headers.user.id
        query = { '$and': [{ user: userId }, { status: true }] }
      }

      if (uuid === null && userId === null) {
        throw 'Ocurrió un problema al consultar el carrito de compras del usuario.'
      }

      // Revisar si el usuario tiene un carrito de compras activo
      let carts = await mongodb.mongoFind(db, 'Cart', query)

      if (carts.length === 1) {
        let historial = carts[0].historial
        historial.unshift({
          action: data.status,
          instance: instanceId,
          order: data.order,
          response: data.response,
          createdAt: new Date()
        })

        let status = true
        if (data.status === 'BUY') {
          status = false
        }

        let responseMongo = await mongodb.findAndUpdateMongoDB(db, 'Cart', { _id: ObjectId(carts[0]._id) }, {
          '$set': {
            historial: historial,
            status: status,
            updatedAt: new Date()
          }
        })

        response.changed = responseMongo.success
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

  Cart.remoteMethod('buy', {
    description: 'Chage shopping cart status',
    http: {
      path: '/buy',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: "object", http: { source: 'body' }, require: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })
}
