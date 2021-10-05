'use strict'

const crypto = require('crypto')
const handlebars = require('handlebars')
const pdf = require('html-pdf')
const fs = require('fs')
const ObjectId = require('mongodb').ObjectID
const Utils = require('../Utils.js')
const mysql = require('../classes/mysql.js')
const mongodb = require('../classes/mongodb.js')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')
let CDN = require('../classes/cdn.js')

const LIMIT = 100

module.exports = (Catalog) => {
  Catalog.getCatalog = async (uuid) => {
    let response = null

    const db = mongodb.getConnection('db')

    try {
      let catalogs = await mongodb.findMongoDB(db, 'Catalog', { uuid: uuid, status: true })

      if (catalogs.length !== 0) {
        let catalog = catalogs[0]
        let products = []

        if (catalog.configs === undefined || catalog.configs === null) {
          products = undefined
        } else {
          if ((catalog.configs.categories !== undefined && catalog.configs.categories !== null && catalog.configs.categories.length > 0) ||
            (catalog.configs.brands !== undefined && catalog.configs.brands !== null && catalog.configs.brands.length > 0) ||
            (catalog.configs.productsCodes !== undefined && catalog.configs.productsCodes !== null && catalog.configs.productsCodes.length > 0) ||
            (catalog.configs.withDiscount)) {
            products = await Utils.request({
              url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products?filter=' + JSON.stringify(catalog.configs.query),
              method: 'GET'
            })
          } else {
            products = undefined
          }
        }

        if (products !== undefined && products !== null) {
          let productsList = JSON.parse(products.body).filter((product) => catalog.configs.deletedProducts !== undefined ? !catalog.configs.deletedProducts.includes(product.code) : true)
          catalog.products = productsList
        }

        response = catalog
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    if (response.error) {
      throw response.error
    }
    return response
  }

  Catalog.remoteMethod('getCatalog', {
    description: 'Get catalog',
    http: {
      path: '/:uuid/entity',
      verb: 'GET'
    },
    accepts: [
      { arg: 'uuid', type: 'string', require: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  Catalog.createCatalog = async (data, req) => {
    let response = { created: false }
    let instanceId = req.headers.instanceId
    let user = req.headers.user
    let uuid = crypto.createHash('sha256').update(data.name + "" + Math.floor(100000 + Math.random() * 900000)).digest('hex')

    try {
      if (data !== null && data !== undefined) {

        if (data.productsQuery === '') {
          if (data.productsLimit <= 0) {
            throw '0002'
          }
        }

        let cdnCoverImageUpload = null
        let cdnBackCoverImageUpload = null

        if (data.coverImage !== null && data.coverImage !== undefined) {
          let coverImageUploadData = {
            name: 'catalogos/' + uuid + '/' + data.coverImage.name,
            data: data.coverImage.data,
            contentType: data.coverImage.type,
          }

          cdnCoverImageUpload = await CDN.uploadFile(coverImageUploadData)
        } else {
          throw '0003'
        }

        if (data.backCoverImage !== null && data.backCoverImage !== undefined) {
          let backCoverImageUploadData = {
            name: 'catalogos/' + uuid + '/' + data.backCoverImage.name,
            data: data.backCoverImage.data,
            contentType: data.backCoverImage.type,
          }

          cdnBackCoverImageUpload = await CDN.uploadFile(backCoverImageUploadData)
        } else {
          throw '00003'
        }

        let query = await Utils.createQuery(data.businessUnit, data)

        let catalog = await mongodb.createMongoDB(Catalog, {
          instanceId: instanceId,
          uuid: uuid,
          userId: user.id,
          name: data.name,
          configs: {
            coverImageUrl: cdnCoverImageUpload.success ? cdnCoverImageUpload.data.Location : '',
            backCoverImageUrl: cdnBackCoverImageUpload.success ? cdnBackCoverImageUpload.data.Location : '',
            catalogPresentation: data.catalogPresentation,
            columnsPerPage: data.columnsPerPage,
            productsPerPage: data.productsPerPage,
            productsCodes: data.productsQuery === '' ? [] : data.productsQuery.split(','),
            categories: data.categories,
            brands: data.brands,
            withDiscount: data.withDiscount,
            withBluePoints: data.withBluePoints,
            productsLimit: data.productsLimit,
            order: data.order.value,
            query: query,
            queryString: JSON.stringify(query),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          status: true
        })

        if (catalog.success) {
          response.created = true
          response.id = catalog.data.id
        }
      } else {
        throw '0001'
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    if (response.error) {
      if (response.error === '0001') {
        throw 'Ha ocurrido un error inesperado, intentalo de nuevo más tarde'
      } else if (response.error === '0002') {
        throw 'Es necesario que el limite de productos sea mayor a 0'
      } else if (response.error === '0003') {
        throw 'Las imágenes de portada y contraportada son necesarias'
      } else {
        throw response.error
      }
    } else {
      return response
    }
  }

  Catalog.remoteMethod('createCatalog', {
    description: 'Create custom catalog of products',
    http: {
      path: '/create',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: "object", require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Catalog.updateCatalog = async (data) => {
    let response = { updated: false }
    const db = mongodb.getConnection('db')
    let uuid = crypto.createHash('sha256').update(data.name + "" + Math.floor(100000 + Math.random() * 900000)).digest('hex')

    try {
      if (data !== null && data !== undefined) {
        if (data.productsQuery === '') {
          if (data.productsLimit <= 0) {
            throw '0002'
          }
        }

        let coverImageUrl = ''
        let backCoverImageUrl = ''

        if (data.coverImage.data !== null && data.coverImage.data !== undefined) {
          if (data.coverImage.name !== undefined) {
            let coverImageUploadData = {
              name: 'catalogos/' + uuid + '/' + data.coverImage.name,
              data: data.coverImage.data,
              contentType: data.coverImage.type,
            }

            let cdnCoverImageUpload = await CDN.uploadFile(coverImageUploadData)

            coverImageUrl = cdnCoverImageUpload.data.Location
          } else {
            coverImageUrl = data.coverImage.data
          }
        } else {
          throw '0003'
        }

        if (data.backCoverImage.data !== null && data.backCoverImage.data !== undefined) {
          if (data.backCoverImage.name !== undefined) {
            let backCoverImageUploadData = {
              name: 'catalogos/' + uuid + '/' + data.backCoverImage.name,
              data: data.backCoverImage.data,
              contentType: data.backCoverImage.type,
            }

            let cdnBackCoverImageUpload = await CDN.uploadFile(backCoverImageUploadData)

            backCoverImageUrl = cdnBackCoverImageUpload.data.Location
          } else {
            backCoverImageUrl = data.backCoverImage.data
          }
        } else {
          throw '0003'
        }

        let query = await Utils.createQuery(data.businessUnit, data)

        let update = await mongodb.findAndUpdateMongoDB(db, 'Catalog', {
          _id: ObjectId(data._id)
        }, {
          '$set': {
            "name": data.name,
            "configs.coverImageUrl": coverImageUrl,
            "configs.backCoverImageUrl": backCoverImageUrl,
            "configs.catalogPresentation": data.catalogPresentation,
            "configs.columnsPerPage": data.columnsPerPage,
            "configs.productsPerPage": data.productsPerPage,
            "configs.productsCodes": data.productsQuery === '' ? [] : data.productsQuery.split(','),
            "configs.categories": data.categories,
            "configs.brands": data.brands,
            "configs.withDiscount": data.withDiscount,
            "configs.withBluePoints": data.withBluePoints,
            "configs.productsLimit": data.productsLimit,
            "configs.order": data.order.value,
            "configs.query": query,
            "configs.queryString": JSON.stringify(query),
          }
        })

        if (update.success) {
          response.updated = true
        }
      } else {
        throw '0001'
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    if (response.error) {
      if (response.error === '0001') {
        throw 'Ha ocurrido un error inesperado, intentalo de nuevo más tarde'
      } else if (response.error === '0002') {
        throw 'Es necesario que el limite de productos sea mayor a 0'
      } else if (response.error === '0003') {
        throw 'Las imágenes de portada y contraportada son necesarias'
      } else {
        throw response.error
      }
    } else {
      return response
    }
  }

  Catalog.remoteMethod('updateCatalog', {
    description: 'Update catalog',
    http: {
      path: '/update',
      verb: 'PUT'
    },
    accepts: [
      { arg: 'data', type: "object", require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Catalog.deletedCatalog = async (uuid) => {
    let response = { deleted: false }
    const db = mongodb.getConnection('db')
    try {
      let deleted = await mongodb.findAndUpdateMongoDB(db, 'Catalog', {
        uuid: uuid,
        status: true
      }, {
        '$set': { status: false }
      })
      response.deleted = deleted.success
    } catch (err) {
      console.log(err)
      response.error = err
    }

    if (response.error) {
      throw response.error
    }
    return response
  }

  Catalog.remoteMethod('deletedCatalog', {
    description: 'Delete catalog',
    http: {
      path: '/:uuid/delete',
      verb: 'DELETE'
    },
    accepts: [
      { arg: 'uuid', type: "string", require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Catalog.deleteProduct = async (uuid, productId) => {
    let response = { deleted: false }
    const db = mongodb.getConnection('db')
    try {
      let catalogs = await mongodb.findMongoDB(db, 'Catalog', {
        uuid: uuid,
        status: true
      })

      if (catalogs.length > 0) {
        let catalog = catalogs[0]

        if (catalog.configs.productsCodes.length > 0) {
          let productsCodes = catalog.configs.productsCodes.filter((code) => code.trim() !== productId)
          let query = await Utils.createQuery(catalog.configs.query.where.businesses.elemMatch.code, { ...catalog.configs, productsQuery: productsCodes.join(',') })
          let updated = await mongodb.findAndUpdateMongoDB(db, 'Catalog', {
            uuid: uuid,
            status: true
          }, {
            '$set': { configs: { ...catalog.configs, productsCodes: productsCodes, query: query, queryString: JSON.stringify(query) } }
          })

          if (updated.success) {
            response.deleted = true
          }

        } else {
          let deletedProducts = catalog.configs.deletedProducts !== undefined ? [productId, ...catalog.configs.deletedProducts] : [productId]

          let updated = await mongodb.findAndUpdateMongoDB(db, 'Catalog', {
            uuid: uuid,
            status: true
          }, {
            '$set': { configs: { ...catalog.configs, deletedProducts: deletedProducts } }
          })

          if (updated.success) {
            response.deleted = true
          }
        }

      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    if (response.error) {
      throw response.error
    }
    return response
  }

  Catalog.remoteMethod('deleteProduct', {
    description: 'Delete product from catalog',
    http: {
      path: '/:uuid/:productId/delete',
      verb: 'DELETE'
    },
    accepts: [
      { arg: 'uuid', type: "string", require: true },
      { arg: 'productId', type: "string", require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Catalog.generatePDF = async (uuid, res) => {
    try {
      const mdb = mongodb.getConnection('db')
      const db = mysql.connectToDBManually()

      let foundCatalog = await mongodb.findMongoDB(mdb, 'Catalog', {
        uuid: uuid,
        status: true
      })

      let productsList = []

      if (foundCatalog[0].configs.productsCodes.length < 1) {

        productsList = await Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products?filter=' + JSON.stringify(foundCatalog[0].configs.query),
          method: 'GET'
        })

        foundCatalog[0].products = productsList === undefined ? [] : JSON.parse(productsList.body).filter((product) => foundCatalog[0].configs.deletedProducts !== undefined ? !foundCatalog[0].configs.deletedProducts.includes(product.code) : true)
      } else {
        let productsCodes = foundCatalog[0].configs.productsCodes.filter((productCode) => foundCatalog[0].configs.deletedProducts !== undefined ? !foundCatalog[0].configs.deletedProducts.includes(productCode.trim()) : true)

        for (let code of productsCodes) {
          let product = await mongodb.findMongoDB(mdb, 'Product', {
            code: code.trim()
          })

          if (product[0] !== undefined) {
            productsList.push(product[0])
          }

        }
        foundCatalog[0].products = productsList
      }

      let data = {
        catalog: foundCatalog[0],
        productPages: Math.ceil(foundCatalog[0].products.length / Number(foundCatalog[0].configs.productsPerPage))
      }

      let instanceConfig = await db.query('SELECT c.*, i.domain, i.id as instance FROM Config AS c LEFT JOIN Instance AS i ON c.instanceId = i.id  WHERE c.instanceId = ? AND c.status = 1 LIMIT 1;', [data.catalog.instanceId])
      await db.close()
      instanceConfig = instanceConfig[0]

      let template = await Utils.readFile(__dirname + '/../templates/catalog.hbs')

      template = handlebars.compile(template)

      let urlHost = null

      switch (data.catalog.instanceId) {
        case 1:
          urlHost = configs.HOST_WEB_APP
          break
        case 2:
          urlHost = configs.HOST_WEB_APP_KELDER
          break
        case 3:
          urlHost = configs.HOST_WEB_APP_URBANNA
          break
        case 4:
          urlHost = configs.HOST_WEB_APP_CALZZASPORT
          break
        case 5:
          urlHost = configs.HOST_WEB_APP_CALZAKIDS
          break
      }

      let products = data.catalog.products.map((product) => {
        return {
          productImage: "https://s3-us-west-1.amazonaws.com/calzzapato/zoom/" + product.photos[0].description,
          productName: product.name,
          productPrice: product.percentagePrice !== 0 ? Utils.numberWithCommas(product.discountPrice) : Utils.numberWithCommas(product.price),
          productDiscountPercentage: product.percentagePrice,
          productDiscountPrice: product.percentagePrice !== 0 ? Utils.numberWithCommas(product.price) : Utils.numberWithCommas(product.discountPrice),
          productBluePoints: product.bluePoints.winPercentageCredit,
          hasBluePoints: product.bluePoints.winPercentageCredit !== '0.00',
          hasDiscount: product.percentagePrice !== 0,
          productUrl: urlHost + '/' + Utils.generateURL(product.name) + '-' + product.code
        }
      })

      let catalogData = {
        catalogName: data.catalog.name,
        logo: instanceConfig.navbarLogo,
        primaryColor: instanceConfig.primaryColor,
        coverImage: data.catalog.configs.coverImageUrl,
        backCoverImage: data.catalog.configs.backCoverImageUrl,
        configs: {
          columnSpace: data.catalog.configs.columnsPerPage == 2 ? 6 : data.catalog.configs.columnsPerPage == 3 ? 4 : data.catalog.configs.columnsPerPage == 4 ? 3 : 12,
          divHeight: data.catalog.configs.columnsPerPage == 2 ? 47.5 : data.catalog.configs.columnsPerPage == 3 ? 31.6 : data.catalog.configs.columnsPerPage == 4 ? 23.75 : data.catalog.configs.productsPerPage == 2 ? 47.5 : data.catalog.configs.productsPerPage == 3 ? 31.6 : data.catalog.configs.productsPerPage == 4 ? 23.75 : "",
          isList: data.catalog.configs.catalogPresentation == 'list',
          listProductImageSize: data.catalog.configs.productsPerPage == 2 ? 5 : data.catalog.configs.productsPerPage == 3 ? 4 : data.catalog.configs.productsPerPage == 4 ? 3 : "",
          listProductNameSize: data.catalog.configs.productsPerPage == 2 ? 4 : data.catalog.configs.productsPerPage == 3 ? 5 : data.catalog.configs.productsPerPage == 4 ? 6 : "",
          buyNowButtonFontSize: data.catalog.configs.columnsPerPage == 4 ? 6 : 10,
          buyNowButtonPadding: data.catalog.configs.columnsPerPage == 4 ? 2 : 8,

        },
        pages: [...Array(data.productPages)].map((_) => {
          let pageProducts = []

          for (let i = 0; i < Number(data.catalog.configs.productsPerPage); i++) {
            if (products.length !== 0)
              pageProducts.push(products.shift())
          }

          return pageProducts
        })
      }



      pdf.create(template(catalogData), { 'orientation': 'landscape', "format": 'A3' }).toFile(__dirname + '../../../cdn/pdfs/html-pdf.pdf', async (err, stream) => {
        if (err) {
          console.log('Error al generar PDF')
          console.log(err)
          throw 'No se ha podido generar el PDF del catálogo seleccionado.'
        } else {
          let file = fs.createReadStream(stream.filename)
          let stat = fs.statSync(stream.filename)
          res.setHeader('Content-Length', stat.size)
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader('Content-Disposition', 'attachment; filename=' + catalogData.catalogName + '.pdf')
          await file.pipe(res)
          // fs.unlinkSync(stream.filename)
        }
      })


    } catch (err) {
      console.log('Error al generar catálogo')
      console.log(err)
      throw 'No se ha podido generar el PDF del catálogo seleccionado.'
    }
  }

  Catalog.remoteMethod('generatePDF', {
    description: 'Generate catalog PDF',
    http: {
      path: '/:uuid/download',
      verb: 'GET'
    },
    accepts: [
      { arg: 'uuid', type: 'string', require: true },
      { arg: 'res', type: 'object', http: ctx => { return ctx.res } }
    ],
    returns: [
      { arg: 'body', type: 'file', root: true },
      { arg: 'Content-Type', type: 'string', http: { target: 'header' } }
    ]
  })

  Catalog.getCategoriesAndBrands = async (req) => {
    let response = { categories: null, brands: null }
    const db = mysql.connectToDBManually()
    const mdb = mongodb.getConnection('db')

    try {
      let categories = []
      let brands = []

      let instanceId = req.headers.instanceId
      if (req.headers.instanceid !== null && req.headers.instanceid !== undefined) {
        instanceId = Number(req.headers.instanceid)
      }

      let businessUnit = await db.query('SELECT businessUnit FROM Config WHERE instanceId = ? AND status = 1 LIMIT 1;', [instanceId])

      businessUnit = businessUnit[0].businessUnit
      await db.close()

      let mongoCategories = await mongodb.findMongoDB(mdb, 'Menu', { instanceId: instanceId })
      let mongoBrands = await mongodb.findMongoDB(mdb, 'Brand')

      let brandCodes = await mongodb.mongoFindDistinct(mdb, 'Product', 'brandCode', { businesses: { $elemMatch: { code: businessUnit } } })

      //let mongoProducts = await mongodb.findMongoDB(mdb, 'Product', { businesses: { $elemMatch: { code: businessUnit } } })


      let mongoMenu = mongoCategories[0].menu

      // Buscando las marcas que coincidan con los productos
      mongoBrands.forEach(brand => {
        for (let i = 0; i < brandCodes.length; i++) {
          if (brand.code == brandCodes[i]) {
            brands.push({ value: brand.code, label: brand.name })
            break
          }
        }
      })

      brands.sort((a, b) => {
        if (a.label > b.label) {
          return 1
        }
        if (a.label < b.label) {
          return -1
        }

        return 0
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

      response.brands = brands
      response.categories = categories

    } catch (err) {
      response.error = err
    }

    if (response.error) {
      throw response.error
    }

    return response
  }

  Catalog.remoteMethod('getCategoriesAndBrands', {
    description: 'Get the catalogs categories and brands',
    http: {
      path: '/categories-brands',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })
}


