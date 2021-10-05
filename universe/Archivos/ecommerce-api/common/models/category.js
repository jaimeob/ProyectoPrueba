'use strict'

const mongodb = require('../classes/mongodb.js')
const mysql = require('../classes/mysql.js')
const Utils = require('../Utils.js')

module.exports = (Category) => {
  Category.getMenuByCategory = async (categoryId, req) => {
    const mdb = mongodb.getConnection('db')
    try {
      let categories = await Utils.loopbackFind(Category, {where: { father: categoryId } })
      let products = []
      let subcategories = []
      let photos = []

      const db = mysql.connectToDBManually()
      let configs = await db.query('SELECT businessUnit, radius FROM Config WHERE instanceId = ? LIMIT 1;', [req.headers.instanceId])
      await db.close()

      let businessUnit = configs[0].businessUnit

      let where = {
        and: [
          {
            businesses: {
              elemMatch: {
                code: businessUnit
              }
            }
          }
        ]
      }

      await Utils.asyncForEach(categories, async (category) => {
        category.description = category.description.substr(0, 1) + category.description.substr(1, category.description.length - 1).toLowerCase()
        subcategories = await Utils.getSubcategories([category.node], [])

        let aux = []
        subcategories.forEach(subcategory => {
          aux.push({ categoryCode: subcategory.categoryCode })
        })

        aux.unshift({ categoryCode: category.node })

        where.or = aux

        products = await Utils.loopbackFind(Category.app.models.Product, { where: where })

        //products = await Utils.getAllProductsByCategories(Category, [category], [])
        if (products.length > 0) {
          while (photos.length === 0) {
            if (products[Math.floor(Math.random() * products.length)] !== undefined) {
              photos = products[Math.floor(Math.random() * products.length)]['photos']
              category.image = photos[0].description
            }
          }
          photos = []
        } else {
          photos = []
          category.image = ''
        }

        category.products = products.length
      })

      return categories
    } catch (err) {
      return []
    }
  }

  Category.remoteMethod('getMenuByCategory', {
    description: 'Get menu by category',
    http: {
      path: '/:categoryId/menu',
      verb: 'GET'
    },
    accepts: [
      { arg: 'categoryId', type: 'string', required: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'array',
      root: true
    }
  })

  Category.transform = async (data) => {
    let response = { categoryId: null }
    const mdb = mongodb.getConnection('db')
    try {
      let categoryId = null
      let error = false
      // Buscar código de categoría por nombre
      await Utils.asyncForEach(data.url, async (breadcrumb) => {
        breadcrumb = Utils.generateURL(breadcrumb)
        if (categoryId === null) {
          categoryId = await mongodb.mongoFind(mdb, 'Category', { key: breadcrumb })
        } else {
          if (categoryId[0].node !== undefined) {
            categoryId = await mongodb.mongoFind(mdb, 'Category', { father: categoryId[0].node, key: breadcrumb })
          } else {
            error = true
          }
        }
      })

      if (error && categoryId.length === undefined || categoryId.length <= 0) {
        return response
      } else {
        response.categoryId = categoryId[0].node
        return response
      }
    } catch (err) {
      return response
    }
  }
  
  Category.remoteMethod('transform', {
    description: 'Get id category from url',
    http: {
      path: '/transform',
      verb: 'POST'
    },
    accepts: [
      {
        arg: 'data', type: 'object', http: { source: 'body' }, required: true,
      },
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
