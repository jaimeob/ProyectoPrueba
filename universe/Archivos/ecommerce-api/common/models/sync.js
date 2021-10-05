'use strict'

const Utils = require('../Utils.js')
const convert = require('xml-js')
const path = require('path')
const moment = require('moment')
const fs = require('fs')
const { google } = require('googleapis')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')
const libxmljs = require('libxmljs')
const CDN = require('../classes/cdn.js')
const mongodb = require('../classes/mongodb.js')
const mysql = require('../classes/mysql.js')

module.exports = function (Sync) {
  Sync.syncAll = async function (req) {
    req.setTimeout(configs.timeout)
    Utils.syncAll()
    return { status: 'Synchronizing...' }
  }

  Sync.remoteMethod('syncAll', {
    description: 'Sync all',
    http: {
      path: '/all',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'Object',
      root: true
    }
  })

  Sync.syncAttributes = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetCatAtributos xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
          </GetCatAtributos>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetCatAtributos',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetCatAtributosResponse']['GetCatAtributosResult']['AtributosJson']['_text']
    data = JSON.parse(data)

    if (!data.length) {
      let tmp = data
      data = []
      data.push(tmp)
    }

    await mongodb.dropMongoDBIndexes(db, 'Attribute', ['code', 'description'])
    await mongodb.dropCollectionMongoDB(db, 'Attribute')
    await Utils.asyncForEach(data, async (item, idx) => {
      await mongodb.createMongoDB(Sync.app.models.Attribute, {
        code: Number(item.IdAtributo),
        description: item.Atributo
      })
      console.log('Sync attribute: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(data.length))
    })
    await mongodb.createMongoDBIndexes(db, 'Attribute', [{ key: { code: 1 }, name: 'code' }, { key: { description: 'text' }, name: 'description' }])

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Attribute' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Attribute',
      items: data.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return data
  }

  Sync.remoteMethod('syncAttributes', {
    description: 'GetCatAtributos',
    http: {
      path: '/attributes',
      verb: 'POST'
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

  Sync.syncBrands = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetMarcas xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <Todos>1</Todos>\
          </GetMarcas>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetMarcas',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetMarcasResponse']['GetMarcasResult']['_text']
    await CDN.createFileIntoCDN('marcas.zip', '/syncs', data)
    await CDN.unzipperFile('/cdn/syncs/marcas.zip', '/cdn/syncs/marcas.xml')
    let brands = fs.readFileSync(path.join(__dirname, '../../cdn/syncs/marcas.xml'), 'utf-8')
    brands = convert.xml2json(brands, { compact: true, spaces: 4 })
    brands = JSON.parse(brands)
    brands = brands['ArrayOfcMarca']['cMarca']

    if (!brands.length) {
      let tmp = brands
      brands = []
      brands.push(tmp)
    }

    await mongodb.dropMongoDBIndexes(db, 'Brand', ['code', 'name'])
    await mongodb.dropCollectionMongoDB(db, 'Brand')
    await Utils.asyncForEach(brands, async (brand, idx) => {
      await mongodb.createMongoDB(Sync.app.models.Brand, {
        code: Number(brand.id._text),
        name: brand.Nombre['_text'],
        image: 'https://s3-us-west-1.amazonaws.com/calzzapato/logos/' + brand.Nombre['_text'].split(' ').join('_') + '.jpeg'
      })
      console.log('Sync brand: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(brands.length))
    })
    await mongodb.createMongoDBIndexes(db, 'Brand', [{ key: { code: 1 }, name: 'code' }, { key: { name: 'text' }, name: 'name' }])

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Brand' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Brand',
      items: brands.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return brands
  }

  Sync.remoteMethod('syncBrands', {
    description: 'GetMarcas',
    http: {
      path: '/brands',
      verb: 'POST'
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

  Sync.syncBusinesses = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetUnidadesDeNegocio xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <Todos>1</Todos>\
          </GetUnidadesDeNegocio>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetUnidadesDeNegocio',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetUnidadesDeNegocioResponse']['GetUnidadesDeNegocioResult']['_text']
    await CDN.createFileIntoCDN('unidades.zip', '/syncs', data)
    await CDN.unzipperFile('/cdn/syncs/unidades.zip', '/cdn/syncs/unidades.xml')
    let businesses = fs.readFileSync(path.join(__dirname, '../../cdn/syncs/unidades.xml'), 'utf-8')
    businesses = convert.xml2json(businesses, { compact: true, spaces: 4 })
    businesses = JSON.parse(businesses)
    businesses = businesses['ArrayOfcUnidadNegocio']['cUnidadNegocio']

    await mongodb.dropMongoDBIndexes(db, 'Business', ['code'])
    await mongodb.dropCollectionMongoDB(db, 'Business')
    await Utils.asyncForEach(businesses, async (business, idx) => {
      await mongodb.createMongoDB(Sync.app.models.Business, {
        code: Number(business.IdUnidad['_text']),
        name: business.NombreUnidad['_text']
      })
      console.log('Sync business: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(businesses.length))
    })
    await mongodb.createMongoDBIndexes(db, 'Business', [{ key: { code: 1 }, name: 'code' }, { key: { name: 'text' }, name: 'name' }])

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Business' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Business',
      items: businesses.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return businesses
  }

  Sync.remoteMethod('syncBusinesses', {
    description: 'GetUnidadesDeNegocio',
    http: {
      path: '/businesses',
      verb: 'POST'
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

  Sync.syncCategories = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetCatCategorias2 xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
          </GetCatCategorias2>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetCatCategorias2',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetCatCategorias2Response']['GetCatCategorias2Result']['Json']['_text']
    data = JSON.parse(data)

    if (!data.length) {
      let tmp = data
      data = []
      data.push(tmp)
    }

    await mongodb.dropMongoDBIndexes(db, 'Category', ['node', 'father', 'description'])
    await mongodb.dropCollectionMongoDB(db, 'Category')

    let description = ''
    await Utils.asyncForEach(data, async (item, idx) => {
      if (item.nStatus) {
        description = item.cDescripcion.split('/').join(' ')
        if (description === 'DAMA') {
          description = 'MUJERES'
        } else if (description === 'CABALLERO') {
          description = 'HOMBRES'
        }

        await mongodb.createMongoDB(Sync.app.models.Category, {
          node: Number(item.IdNodo),
          father: Number(item.IdPadre),
          description: description,
          key: Utils.generateURL(description)
        })
      }
      console.log('Sync category: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(data.length))
    })
    await mongodb.createMongoDBIndexes(db, 'Category', [{ key: { node: 1 }, name: 'node' }, { key: { father: 1 }, name: 'father' }, { key: { description: 1 }, name: 'description' }])

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Category' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Category',
      items: data.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return data
  }

  Sync.remoteMethod('syncCategories', {
    description: 'GetCatCategorias2',
    http: {
      path: '/categories',
      verb: 'POST'
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

  Sync.syncColors = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetMarcasColores xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <Todos>1</Todos>\
          </GetMarcasColores>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetMarcasColores',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetMarcasColoresResponse']['GetMarcasColoresResult']['_text']
    await CDN.createFileIntoCDN('colores.zip', '/syncs', data)
    await CDN.unzipperFile('/cdn/syncs/colores.zip', '/cdn/syncs/colores.xml')
    let colors = fs.readFileSync(path.join(__dirname, '../../cdn/syncs/colores.xml'), 'utf-8')
    colors = convert.xml2json(colors, { compact: true, spaces: 4 })
    colors = JSON.parse(colors)
    colors = colors['ArrayOfcMarcaColor']['cMarcaColor']

    if (!colors.length) {
      let tmp = colors
      colors = []
      colors.push(tmp)
    }

    await mongodb.dropMongoDBIndexes(db, 'Color', ['code', 'colorCode', 'brandCode'])
    await mongodb.dropCollectionMongoDB(db, 'Color')
    await Utils.asyncForEach(colors, async (color, idx) => {
      await mongodb.createMongoDB(Sync.app.models.Color, {
        code: Number(color.id['_text']),
        colorCode: color.Color['_text'],
        brandCode: Number(color.Marca['_text']),
        description: color.Descripcion['_text']
      })
      console.log('Sync color: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(colors.length))
    })
    await mongodb.createMongoDBIndexes(db, 'Color', [{ key: { code: 1 }, name: 'code' }, { key: { colorCode: 'text' }, name: 'colorCode' }, { key: { brandCode: 1 }, name: 'brandCode' }])

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Color' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Color',
      items: colors.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return colors
  }

  Sync.remoteMethod('syncColors', {
    description: 'GetMarcasColores',
    http: {
      path: '/colors',
      verb: 'POST'
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

  Sync.syncGenders = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetGeneros xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <Todos>1</Todos>\
          </GetGeneros>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetGeneros',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetGenerosResponse']['GetGenerosResult']['_text']
    await CDN.createFileIntoCDN('generos.zip', '/syncs', data)
    await CDN.unzipperFile('/cdn/syncs/generos.zip', '/cdn/syncs/generos.xml')
    let genders = fs.readFileSync(path.join(__dirname, '../../cdn/syncs/generos.xml'), 'utf-8')
    genders = convert.xml2json(genders, { compact: true, spaces: 4 })
    genders = JSON.parse(genders)
    genders = genders['ArrayOfcGenero']['cGenero']

    if (!genders.length) {
      let tmp = genders
      genders = []
      genders.push(tmp)
    }

    await mongodb.dropMongoDBIndexes(db, 'Gender', ['code', 'description'])
    await mongodb.dropCollectionMongoDB(db, 'Gender')
    await Utils.asyncForEach(genders, async (gender, idx) => {
      await mongodb.createMongoDB(Sync.app.models.Gender, {
        code: Number(gender.Id['_text']),
        description: gender.Descripcion['_text']
      })
      console.log('Sync gender: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(genders.length))
    })
    await mongodb.createMongoDBIndexes(db, 'Gender', [{ key: { code: 1 }, name: 'code' }, { key: { description: 'text' }, name: 'description' }])
    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Gender' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Gender',
      items: genders.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return genders
  }

  Sync.remoteMethod('syncGenders', {
    description: 'GetGeneros',
    http: {
      path: '/genders',
      verb: 'POST'
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

  Sync.syncZones = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <getPlazas xmlns="citrix6.calzzapato.com/">\
            <aplicacion>' + configs.webServiceMayoristaApplication + '</aplicacion>\
            <password>' + configs.webServiceMayoristaPassword + '</password>\
          </getPlazas>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceMayoristaURL + '?op=getPlazas',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['getPlazasResponse']['getPlazasResult']['Plazas']

    if (!data.length) {
      let tmp = data
      data = []
      data.push(tmp)
    }

    await mongodb.dropMongoDBIndexes(db, 'Zone', ['code'])
    await mongodb.dropCollectionMongoDB(db, 'Zone')
    await Utils.asyncForEach(data, async (zone, idx) => {
      await mongodb.createMongoDB(Sync.app.models.Zone, {
        code: zone.idPlaza['_text'],
        name: zone.NombrePlaza['_text'],
        serie: zone.idSerieVale['_text'],
        stateCode: zone.idestado['_text'],
        municipalityCode: zone.IDMunicipio['_text'],
        // cityCode: zone.IDMunicipio['_text'],
        key: zone.ClavePlaza['_text'],
        email: (zone.eMail_Clientes['_text'] !== undefined) ? zone.eMail_Clientes['_text'] : ''
      })
      console.log('Sync zone: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(data.length))
    })
    await mongodb.createMongoDBIndexes(db, 'Zone', [{ key: { code: 'text' }, name: 'code' }])

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Zone' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Zone',
      items: data.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return data
  }

  Sync.remoteMethod('syncZones', {
    description: 'GetPlazas',
    http: {
      path: '/zones',
      verb: 'POST'
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

  Sync.syncStores = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetTiendas xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <Todos>1</Todos>\
          </GetTiendas>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetTiendas',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetTiendasResponse']['GetTiendasResult']['_text']
    await CDN.createFileIntoCDN('tiendas.zip', '/syncs', data)
    await CDN.unzipperFile('/cdn/syncs/tiendas.zip', '/cdn/syncs/tiendas.xml')
    let stores = fs.readFileSync(path.join(__dirname, '../../cdn/syncs/tiendas.xml'), 'utf-8')
    stores = convert.xml2json(stores, { compact: true, spaces: 4 })
    stores = JSON.parse(stores)
    stores = stores['ArrayOfcTienda']['cTienda']

    await mongodb.dropMongoDBIndexes(db, 'Store', ['code'])
    await mongodb.dropCollectionMongoDB(db, 'Store')
    let zones = []
    await Utils.asyncForEach(stores, async (store, idx) => {
      zones = await mongodb.findMongoDB(db, 'Zone', { code: store.idPlaza['_text'] })
      await mongodb.createMongoDB(Sync.app.models.Store, {
        code: store.idTienda['_text'],
        name: store.NombreTienda['_text'],
        reference: (store.Referencia['_text'] !== undefined) ? store.Referencia['_text'] : '',
        phone: (store.Telefono['_text'] !== undefined) ? store.Telefono['_text'] : '',
        businessUnit: {
          code: Number(store.IdUnidadNegocio['_text']),
          name: store.NombreUnidadNegocio['_text']
        },
        zip: store.CP['_text'],
        street: store.Calle['_text'],
        suburb: store.Colonia['_text'],
        exteriorNumber: store.NumExt['_text'],
        interiorNumber: (store.NumInt['_text'] !== undefined) ? store.NumInt['_text'] : '',
        locationCode: (store.idAsentamiento['_text'] !== undefined) ? store.idAsentamiento['_text'] : '',
        location: (store.Localidad['_text'] !== undefined) ? store.Localidad['_text'] : '',
        municipality: (store.Municipio['_text'] !== undefined) ? store.Municipio['_text'] : '',
        state: (store.Estado['_text'] !== undefined) ? store.Estado['_text'] : '',
        country: (store.Pais['_text'] !== undefined) ? store.Pais['_text'] : '',
        branchType: store.TipoSucursal['_text'],
        storeType: store.TipoTienda['_text'],
        zoneCode: store.idPlaza['_text'],
        zone: (zones.length === 1) ? zones[0] : null,
        source: store,
        lat: Number(store.nLatitud['_text']),
        lng: Number(store.nLongitud['_text']),
        cityId: store.IdLocalidad['_text'] + store.IdMunicipio['_text'] + store.IdEstado['_text'],
      })
      console.log('Sync store: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(stores.length))
    })
    await mongodb.createMongoDBIndexes(db, 'Store', [{ key: { code: 'text' }, name: 'code' }])

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Store' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Store',
      items: stores.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return stores
  }

  Sync.remoteMethod('syncStores', {
    description: 'GetTiendas',
    http: {
      path: '/stores',
      verb: 'POST'
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

  Sync.syncSublines = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetSubLineas xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <Todos>1</Todos>\
          </GetSubLineas>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetSubLineas',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetSubLineasResponse']['GetSubLineasResult']['_text']
    await CDN.createFileIntoCDN('sublineas.zip', '/syncs', data)
    await CDN.unzipperFile('/cdn/syncs/sublineas.zip', '/cdn/syncs/sublineas.xml')
    let sublines = fs.readFileSync(path.join(__dirname, '../../cdn/syncs/sublineas.xml'), 'utf-8')
    sublines = convert.xml2json(sublines, { compact: true, spaces: 4 })
    sublines = JSON.parse(sublines)
    sublines = sublines['ArrayOfcSubLinea']['cSubLinea']

    if (!sublines.length) {
      let tmp = sublines
      sublines = []
      sublines.push(tmp)
    }

    await mongodb.dropMongoDBIndexes(db, 'Subline', ['code', 'genderCode', 'description'])
    await mongodb.dropCollectionMongoDB(db, 'Subline')
    await Utils.asyncForEach(sublines, async (subline, idx) => {
      await mongodb.createMongoDB(Sync.app.models.Subline, {
        code: Number(subline.Id['_text']),
        genderCode: Number(subline.IdGenero['_text']),
        description: subline.Descripcion['_text']
      })
      console.log('Sync subline: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(sublines.length))
    })
    await mongodb.createMongoDBIndexes(db, 'Subline', [{ key: { code: 1 }, name: 'code' }, { key: { genderCode: 1 }, name: 'genderCode' }, { key: { description: 'text' }, name: 'description' }])

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Subline' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Subline',
      items: sublines.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return sublines
  }

  Sync.remoteMethod('syncSublines', {
    description: 'GetSubLineas',
    http: {
      path: '/sublines',
      verb: 'POST'
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

  Sync.syncProducts = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetArticulos xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <Todos>1</Todos>\
          </GetArticulos>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetArticulos',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetArticulosResponse']['GetArticulosResult']['_text']
    await CDN.createFileIntoCDN('productos.zip', '/syncs', data)
    await CDN.unzipperFile('/cdn/syncs/productos.zip', '/cdn/syncs/productos.xml')
    let products = fs.readFileSync(path.join(__dirname, '../../cdn/syncs/productos.xml'), 'utf-8')
    products = convert.xml2json(products, { compact: true, spaces: 4 })
    products = JSON.parse(products)
    products = products['ArrayOfcArticulo']['cArticulo']

    if (!products.length) {
      let tmp = products
      products = []
      products.push(tmp)
    }

    await mongodb.dropCollectionMongoDB(db, 'Product')
    let date = null
    let time = null
    let sizes = []
    let measurements = []
    await Utils.asyncForEach(products, async (product, idx) => {
      if (product.FechaCompraLote['_text'] !== undefined) {
        date = product.FechaCompraLote['_text'].split(' ')[0].split('/')
        date = date[2] + '-' + date[1] + '-' + date[0]
        time = product.FechaCompraLote['_text'].split(' ')[1]
        date = new Date(date + ' ' + time)
      }

      if (product.Tallas['_text'] !== undefined) {
        product.Tallas['_text'] = product.Tallas['_text'].substr(1, product.Tallas['_text'].length - 2)
        sizes = product.Tallas['_text'].split('|')
      }

      if (product.Medidas['_text'] !== undefined) {
        product.Medidas['_text'] = product.Medidas['_text'].substr(1, product.Medidas['_text'].length - 2)
        measurements = product.Medidas['_text'].split('|')
      }

      await mongodb.createMongoDB(Sync.app.models.Product, {
        code: product.cLote['_text'],
        categoryCode: null,
        name: product.Nombre['_text'],
        description: (product.Descripcion['_text'] !== undefined) ? product.Descripcion['_text'] : '',
        brandCode: (product.SubMarca['_text'] !== undefined) ? Number(product.SubMarca['_text']) : Number(product.Marca['_text']),
        originalBrandCode: Number(product.Marca['_text']),
        genderCode: Number(product.Genero['_text']),
        styleCode: Number(product.Estilo['_text']),
        colorCode: Number(product.MarcaColor['_text']),
        modelCode: product.Modelo['_text'],
        sublineCode: Number(product.SubLinea['_text']),
        tags: (product.Tags['_text'] !== undefined) ? product.Tags['_text'].split('|') : [],
        sizes: sizes,
        measurements: measurements,
        buyDate: date,
        price: Number(product.Precio['_text']).toFixed(2),
        savingPrice: Number(product.PrecioAhorro['_text']).toFixed(2),
        creditPrice: Number(product.PrecioCredito['_text']).toFixed(2),
        percentagePrice: Number(product.PrecioPorcentaje['_text']).toFixed(2),
        discountPrice: Number(product.PrecioRebaja['_text']).toFixed(2),
        partiality: (product.nQuincenas['_text'] !== undefined) ? Number(product.nQuincenas['_text']) : null,
        photos: [],
        attributes: [],
        businesses: [],
        stores: [],
        bluePoints: {
          status: (product.IdPromocionPuntos['_text'] === "0") ? false : true,
          code: product.IdPromocionPuntos['_text'],
          winPercentage: Number(product.PorcentajePuntosContado['_text']).toFixed(2),
          winPercentageCredit: Number(product.PorcentajePuntosCredito['_text']).toFixed(2)
        },
        stock: {
          status: true,
          deliveryDays: ''
        },
        source: product
      })
      console.log('Sync product: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(products.length))

      sizes = []
      measurements = []
    })

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Product' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Product',
      items: products.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return products
  }

  Sync.remoteMethod('syncProducts', {
    description: 'GetArticulos',
    http: {
      path: '/products',
      verb: 'POST'
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

  Sync.syncPhotosByProduct = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetFotos xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <Todos>1</Todos>\
          </GetFotos>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetFotos',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetFotosResponse']['GetFotosResult']['_text']
    await CDN.createFileIntoCDN('fotos.zip', '/syncs', data)
    await CDN.unzipperFile('/cdn/syncs/fotos.zip', '/cdn/syncs/fotos.xml')
    let photos = fs.readFileSync(path.join(__dirname, '../../cdn/syncs/fotos.xml'), 'utf-8')
    photos = convert.xml2json(photos, { compact: true, spaces: 4 })
    photos = JSON.parse(photos)
    photos = photos['ArrayOfcFoto']['cFoto']

    if (!photos.length) {
      let tmp = photos
      photos = []
      photos.push(tmp)
    }

    let groups = Utils.groupBy(photos, 'cLote._text')
    let uniques = Utils.uniqBy(photos, 'cLote._text')

    let newPhotos = []
    await Utils.asyncForEach(uniques, async (product, idx) => {
      groups[product.cLote._text].forEach(photo => {
        newPhotos.push({
          description: (photo.NombreFoto['_text'] === undefined) ? '' : photo.NombreFoto['_text']
            .split('Š').join('S')
            .split('š').join('s')
            .split('Ž').join('Z')
            .split('ž').join('z')
            .split('À').join('A')
            .split('Á').join('A')
            .split('Â').join('A')
            .split('Ã').join('A')
            .split('Ä').join('A')
            .split('Å').join('A')
            .split('Æ').join('A')
            .split('Ç').join('C')
            .split('È').join('E')
            .split('É').join('E')
            .split('Ê').join('E')
            .split('Ë').join('E')
            .split('Ì').join('I')
            .split('Í').join('I')
            .split('Î').join('I')
            .split('Ï').join('I')
            .split('Ñ').join('N')
            .split('Ò').join('O')
            .split('Ó').join('O')
            .split('Ô').join('O')
            .split('Õ').join('O')
            .split('Ö').join('O')
            .split('Ø').join('O')
            .split('Ù').join('U')
            .split('Ú').join('U')
            .split('Û').join('U')
            .split('Ü').join('U')
            .split('Ý').join('Y')
            .split('Þ').join('B')
            .split('ß').join('Ss')
            .split('à').join('a')
            .split('á').join('a')
            .split('â').join('a')
            .split('ã').join('a')
            .split('ä').join('a')
            .split('å').join('a')
            .split('æ').join('a')
            .split('ç').join('c')
            .split('è').join('e')
            .split('é').join('e')
            .split('ê').join('e')
            .split('ë').join('e')
            .split('ì').join('i')
            .split('í').join('i')
            .split('î').join('i')
            .split('ï').join('i')
            .split('ð').join('o')
            .split('ñ').join('n')
            .split('ò').join('o')
            .split('ó').join('o')
            .split('ô').join('o')
            .split('õ').join('o')
            .split('ö').join('o')
            .split('ø').join('o')
            .split('ù').join('u')
            .split('ú').join('u')
            .split('û').join('u')
            .split('ý').join('y')
            .split('þ').join('b')
            .split('ÿ').join('y')
            .split('(').join('')
            .split(')').join('')
            .split(' ').join('_'),
          angle: Number(photo.Angulo['_text']),
          isVertical: (photo.Vertical['_text'] === 'true') ? true : false
        })
      })
      await mongodb.findAndUpdateMongoDB(db, 'Product', { code: product.cLote._text }, { '$set': { photos: newPhotos } })
      newPhotos = []
      console.log('Sync photos by product: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(uniques.length))
    })

    await mongodb.dropMongoDBIndexes(db, 'Product', ['code', 'categoryCode', 'brandCode', 'genderCode', 'styleCode', 'colorCode', 'sublineCode', 'attributes.code', 'businesses.code'])
    await mongodb.createMongoDBIndexes(db, 'Product', [
      { key: { code: 'text' }, name: 'code' },
      { key: { categoryCode: 1 }, name: 'categoryCode' },
      { key: { brandCode: 1 }, name: 'brandCode' },
      { key: { genderCode: 1 }, name: 'genderCode' },
      { key: { styleCode: 1 }, name: 'styleCode' },
      { key: { colorCode: 1 }, name: 'colorCode' },
      { key: { sublineCode: 1 }, name: 'sublineCode' },
      { key: { 'attributes.code': 1 }, name: 'attributes.code' },
      { key: { 'businesses.code': 1 }, name: 'businesses.code' }
    ])

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Product.Photos' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Product.Photos',
      items: uniques.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return photos
  }

  Sync.remoteMethod('syncPhotosByProduct', {
    description: 'GetFotos',
    http: {
      path: '/products/photos',
      verb: 'POST'
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

  Sync.syncCategoryByProduct = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetLotesCategorias2 xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
          </GetLotesCategorias2>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetLotesCategorias2',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetLotesCategorias2Response']['GetLotesCategorias2Result']['Json']['_text']
    data = JSON.parse(data)

    if (!data.length) {
      let tmp = data
      data = []
      data.push(tmp)
    }

    await Utils.asyncForEach(data, async function (item, idx) {
      await mongodb.findAndUpdateMongoDB(db, 'Product', { code: item.cLote }, { '$set': { categoryCode: Number(item.IdCategoria) } })
      console.log('Sync category by product: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(data.length))
    })

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Product.Category' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Product.Category',
      items: data.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return data
  }

  Sync.remoteMethod('syncCategoryByProduct', {
    description: 'GetLotesCategorias2',
    http: {
      path: '/products/category',
      verb: 'POST'
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

  Sync.syncBusinessByProduct = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetLotesUnidadesNegocio xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <Todos>1</Todos>\
          </GetLotesUnidadesNegocio>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetLotesUnidadesNegocio',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetLotesUnidadesNegocioResponse']['GetLotesUnidadesNegocioResult']['_text']
    await CDN.createFileIntoCDN('productos-unidades.zip', '/syncs', data)
    await CDN.unzipperFile('/cdn/syncs/productos-unidades.zip', '/cdn/syncs/productos-unidades.xml')
    let products = fs.readFileSync(path.join(__dirname, '../../cdn/syncs/productos-unidades.xml'), 'utf-8')
    products = convert.xml2json(products, { compact: true, spaces: 4 })
    products = JSON.parse(products)
    products = products['ArrayOfcLoteUnidadNeg']['cLoteUnidadNeg']

    let groups = Utils.groupBy(products, 'cLote._text')
    let uniques = Utils.uniqBy(products, 'cLote._text')

    let businesses = []

    await Utils.asyncForEach(uniques, async (product, idx) => {
      groups[product.cLote._text].forEach(business => {
        businesses.push({
          code: Number(business.IdUnidadNegocio._text)
        })
      })
      await mongodb.findAndUpdateMongoDB(db, 'Product', { code: product.cLote._text }, { '$set': { businesses: businesses } })
      businesses = []
      console.log('Sync business unit by product: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(uniques.length))
    })

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Product.Business' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Product.Business',
      items: uniques.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return products
  }

  Sync.remoteMethod('syncBusinessByProduct', {
    description: 'GetLotesUnidadesNegocio',
    http: {
      path: '/products/businesses',
      verb: 'POST'
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

  Sync.syncAttributesByProduct = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()
    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetLotesAtributos xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
          </GetLotesAtributos>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetLotesAtributos',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetLotesAtributosResponse']['GetLotesAtributosResult']['LotesAtributosJson']['_text']
    data = JSON.parse(data)

    if (!data.length) {
      let tmp = data
      data = []
      data.push(tmp)
    }

    let groups = Utils.groupBy(data, 'cLote')
    let uniques = Utils.uniqBy(data, 'cLote')

    let attributes = []

    await Utils.asyncForEach(uniques, async function (item, idx) {
      groups[item.cLote].forEach(attribute => {
        attributes.push({ code: Number(attribute.IdAtributo) })
      })

      await mongodb.findAndUpdateMongoDB(db, 'Product', { code: item.cLote }, { '$set': { attributes: attributes } })
      console.log('Sync attributes by product: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(uniques.length))
      attributes = []
    })

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Product.Attributes' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Product.Attributes',
      items: uniques.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return [groups]
  }

  Sync.remoteMethod('syncAttributesByProduct', {
    description: 'GetLotesAtributos',
    http: {
      path: '/products/attributes',
      verb: 'POST'
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

  Sync.syncMenu = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()

    await mongodb.dropMongoDBIndexes(db, 'Menu', ['instanceId'])
    await mongodb.dropCollectionMongoDB(db, 'Menu')

    let items = [
      { businessUnit: 8, instanceId: 1 },
      { businessUnit: 9, instanceId: 2 },
      { businessUnit: 2, instanceId: 3 },
      { businessUnit: 11, instanceId: 4 },
      { businessUnit: 10, instanceId: 5 }
    ]

    await Utils.asyncForEach(items, async (item, count) => {
      let response = await Utils.loopbackFind(Sync.app.models.Category, {
        include: {
          relation: 'products',
          scope: {
            where: {
              businesses: {
                elemMatch: {
                  code: item.businessUnit
                }
              }
            }
          }
        }
      })

      let brands = await Utils.loopbackFind(Sync.app.models.Brand, { order: 'name ASC' })
      let indexBrands = []
      await Utils.asyncForEach(brands, async (brand) => {
        let products = await Utils.loopbackFind(Sync.app.models.Product, {
          where: {
            brandCode: brand.code,
            businesses: {
              elemMatch: {
                code: item.businessUnit
              }
            }
          }
        })

        if (products.length > 0) {

          let key = brand.name.substr(0, 1).toUpperCase()

          if (!isNaN(Number(key))) {
            key = '#'
          }

          let exist = null
          indexBrands.forEach((index, idx) => {
            if (index.key === key) {
              exist = idx
            }
          })

          if (exist === null) {
            indexBrands.push({
              key: key,
              brands: [
                {
                  code: brand.code,
                  name: brand.name,
                  count: products.length,
                  url: '/marcas/' + Utils.generateURL(brand.name.toLowerCase())
                }
              ]
            })
          } else {
            indexBrands[exist].brands.push({
              code: brand.code,
              name: brand.name,
              count: products.length,
              url: '/marcas/' + Utils.generateURL(brand.name.toLowerCase())
            })
          }
          exist = null
        }
      })

      let result = []
      let options = [
        {
          image: '',
          key: 'brands',
          description: 'Marcas',
          subNodes: indexBrands
        },
        {
          image: '',
          key: 'all',
          description: 'Todos',
          subNodes: [],
          filter: {
            module: 'CategoryExplorer',
            url: '/todos',
            queryParams: []
          }
        },
        {
          // image: (item.instanceId === 1 || item.instanceId === 2) ? 'https://i.imgur.com/sX6KPyq.png' : 'https://imgur.com/EnLdboQ.jpeg',
          image: 'https://i.imgur.com/EnLdboQ.jpeg',
          //image: 'https://imgur.com/hZ0dwKr.jpeg',
          key: 'offers',
          description: 'Ofertas',
          subNodes: [],
          filter: {
            module: 'CategoryExplorer',
            url: '/todos',
            queryParams: [
              {
                key: 'csa',
                value: 'eyJwZyI6MCwibCI6NTAsInUiOm51bGwsImMiOm51bGwsImJjIjpudWxsLCJiciI6W10sInNjIjpbXSwiYiI6W10sImEiOltdLCJzIjpbXSwicCI6W10sImciOltdLCJvIjp0cnVlLCJicCI6ZmFsc2UsIm9iIjoiYmVzdE9mZmVyIn0='
              }
            ]
          }
        },
        {
          image: 'https://imgur.com/FCpe2tu.jpeg',
          key: 'bluepoints',
          description: 'Monedero Azul ®',
          subNodes: [],
          filter: {
            module: 'CategoryExplorer',
            url: '/todos',
            queryParams: [
              {
                key: 'csa',
                value: 'eyJwZyI6MCwibCI6NTAsInUiOm51bGwsImMiOm51bGwsImJjIjpudWxsLCJiciI6W10sInNjIjpbXSwiYiI6W10sImEiOltdLCJzIjpbXSwicCI6W10sImciOltdLCJvIjpmYWxzZSwiYnAiOnRydWUsIm9iIjoiIn0='
              }
            ]
          }
        },
        {
          image: 'https://i.imgur.com/HcaXIcC.jpeg',
          key: 'calzzapato',
          description: 'Calzzapato',
          subNodes: [],
          filter: {
            module: 'WebView',
            url: 'https://www.calzzapato.com',
            queryParams: []
          }
        },
        {
          image: 'https://imgur.com/fTJjfKf.jpeg',
          key: 'kelder',
          description: 'Kelder',
          subNodes: [],
          filter: {
            module: 'WebView',
            url: 'https://www.kelder.mx',
            queryParams: []
          }
        },
        {
          image: 'https://imgur.com/qysCCJc.jpeg',
          key: 'urbanna',
          description: 'Urbanna',
          subNodes: [],
          filter: {
            module: 'WebView',
            url: 'https://www.urbanna.mx',
            queryParams: []
          }
        },
        {
          image: 'https://imgur.com/MvZqUio.jpeg',
          key: 'calzzasport',
          description: 'CalzzaSport',
          subNodes: [],
          filter: {
            module: 'WebView',
            url: 'https://www.calzzasport.com',
            queryParams: []
          }
        },
        {
          image: 'https://imgur.com/2iK6Chn.jpeg',
          key: 'calzakids',
          description: 'CalzaKids',
          subNodes: [],
          filter: {
            module: 'WebView',
            url: 'https://www.calzakids.mx',
            queryParams: []
          }
        },
        {
          image: 'https://imgur.com/Q2HaWiG.jpeg',
          key: 'credivale',
          description: 'CrediVale ®',
          subNodes: [],
          filter: {
            module: 'WebView',
            url: 'https://www.credivale.mx',
            queryParams: []
          }
        },
        {
          image: 'https://imgur.com/QWZZrC8.jpeg',
          key: 'puntosazules',
          description: 'Monedero Azul ®',
          subNodes: [],
          filter: {
            module: 'WebView',
            url: 'https://www.monederoazul.com',
            queryParams: []
          }
        }
      ]

      await Utils.asyncForEach(response, async (result) => {
        result.description = result.description.substr(0, 1) + result.description.substr(1, result.description.length - 1).toLowerCase()
        result.url = Utils.generateURL(result.description)
        response.forEach((node, idx) => {
          if (node.subNodes === undefined) {
            node.description = node.description.substr(0, 1) + node.description.substr(1, node.description.length - 1).toLowerCase()
            node.url = Utils.generateURL(node.description)
            node.subNodes = []
          }
          if (result.father === node.node) {
            result.count = (node.products !== undefined) ? node.products.length : result.products.length
            node.subNodes.push(result)
            delete node.products
            delete result.products
            node.description = node.description.substr(0, 1) + node.description.substr(1, node.description.length - 1).toLowerCase()
            node.url = Utils.generateURL(node.description)
            response[idx] = node
          }
        })
      })

      await Utils.asyncForEach(response, async (node, idx) => {
        if (idx <= 5) {
          node.count = Utils.recursiveCount([node], 0)
          await Utils.asyncForEach(node.subNodes, async (firstNode) => {
            firstNode.count = Utils.recursiveCount([firstNode], firstNode.count)
            if (firstNode.subNodes.length === 0) {
              firstNode.image = await Utils.getImage(Sync.app.models.Product, item.businessUnit, firstNode.node)
            }
            await Utils.asyncForEach(firstNode.subNodes, async (node) => {
              node.count = Utils.recursiveCount([node], node.count)
              if (node.count > 0) {
                node.image = await Utils.getImage(Sync.app.models.Product, item.businessUnit, node.node)
                firstNode.image = node.image
              }
            })
          })
        }
      })

      if (item.instanceId === 2) {
        result = [
          response[5], // Departamental
          response[0], // Mujeres
          response[1], // Hombres
          response[2], // Niños
          response[3], // Niñas
          response[4] // Bebes
        ]
      }
      else if (item.instanceId === 5) {
        result = [
          response[2], // Niños
          response[3], // Niñas
        ]
      } else {
        result = [
          response[0], // Mujeres
          response[1], // Hombres
          response[2], // Niños
          response[3], // Niñas
        ]
      }

      options.forEach(option => {
        if (item.instanceId === 1) {
          /*
          if (option.key === 'offers') {
            option.image = 'https://imgur.com/hZ0dwKr.jpeg'
          }
          */
          if (option.key !== 'calzzapato') {
            result.push(option)
          }
        }
        else if (item.instanceId === 2) {
          if (option.key !== 'kelder') {
            result.push(option)
          }
        } else if (item.instanceId === 3) {
          if (option.key !== 'urbanna') {
            result.push(option)
          }
        } else if (item.instanceId === 4) {
          if (option.key !== 'calzzasport') {
            result.push(option)
          }
        } else if (item.instanceId === 5) {
          if (option.key !== 'calzakids') {
            result.push(option)
          }
        }
      })

      await mongodb.createMongoDB(Sync.app.models.Menu, {
        instanceId: item.instanceId,
        menu: result
      })
      console.log('Sync menu: ' + Utils.numberWithCommas((count + 1)) + ' de ' + Utils.numberWithCommas(items.length))
    })

    await mongodb.createMongoDBIndexes(db, 'Menu', [{ key: { instanceId: 1 }, name: 'instanceId' }])

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Menu' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Menu',
      items: items.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return { status: true }
  }

  Sync.remoteMethod('syncMenu', {
    description: 'Sync menu',
    http: {
      path: '/menu',
      verb: 'POST'
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

  Sync.syncButtons = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()

    let items = [
      { businessUnit: 8, instanceId: 1 },
      { businessUnit: 9, instanceId: 2 },
      { businessUnit: 2, instanceId: 3 },
      { businessUnit: 11, instanceId: 4 },
      { businessUnit: 10, instanceId: 5 }
    ]

    await Utils.asyncForEach(items, async (item, count) => {
      try {
        let categories = await Utils.loopbackFind(Sync.app.models.Category, {
          where: {
            father: 0
          }
        })

        if (item.instanceId !== 2) {
          categories.forEach((category, idx) => {
            if (category.node === 6) {
              categories.splice(idx, 1)
            }
          })
        }

        let products = []
        let subcategories = []
        let photos = []

        let where = {
          and: [
            {
              businesses: {
                elemMatch: {
                  code: item.businessUnit
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

          products = await Utils.loopbackFind(Sync.app.models.Product, { where: where })

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
        await mongodb.findAndUpdateMongoDB(db, 'Menu', { instanceId: item.instanceId }, { '$set': { categories: categories } })
        console.log('Sync menu: ' + Utils.numberWithCommas((count + 1)) + ' de ' + Utils.numberWithCommas(items.length))
      } catch (err) {
        console.log(err)
        return { status: false }
      }
    })

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Buttons' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Buttons',
      items: items.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return { status: true }
  }

  Sync.remoteMethod('syncButtons', {
    description: 'Sync menu',
    http: {
      path: '/buttons',
      verb: 'POST'
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

  Sync.googleShopping = async (req) => {
    req.setTimeout(configs.timeout)
    let start = new Date()

    let key = {
      "type": "service_account",
      "project_id": "merchant-center-1604533683652",
      "private_key_id": "4256cea3f316c4a8d35cef2c1aec4c51583f0e70",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCZwM0q+MLMsFXb\nWe2pcsoJG9n1Q7eKLJ1XbxWeK1wSP7mJvQxSunJQv4ghbnmllKGC/eKY2Rtn97sx\n2ebCOqRXGZX/sTVLzqv0E2i3J2QCn8S+E5tA2a0G8JRYrbpJvnWOOwAKGqRVRMAe\n6Gm03uSamAb3I8krtcRNWVIFzI0VTXnOA/pMw8cNRxjgCI+cotMsBqztgkiDO0jj\n5vGDynVQW6srMNUYvdGe6s3m2TbtcLcIY2XzPoDLFT8CJQ1GlLU+Azu/Sz1pXu3i\nPSxUhGuQauwBwcYUo/LaEQxIwGrbXoPBSOCmy5gshe3E6HWCeyCOF1F87lYs5bi9\nvpuyc9AbAgMBAAECggEALmMlY0QXHYNL+/hnRDrOKq5c9WrfSpBITjNFDeneBuFz\n/FLtj14SFDuc+h0nFWZAzlED1wKViqoKr7EitlHT+DVPdIvF3R+28FYUv0FioooK\nZSBsNEYYNmJKF3EepZYRSH6TdfjwwIsT/Z84GSowRVX9r/17ebUGyyFaJka/AABe\nqXgWuD6LCVgrKWXXqQLh9fbL2MIUnN0gfUl4eLwSpQmad3vhdOT8H5Pr285XgdqC\nBdypu9sgA5kmFwXCYx+sHPeFkmlFtyAspQckjMogWFlGLt1poYyodGU6R/zEzDvC\nE91utFNOifiD6AqBH1G2mrNoCGSw5f6nXU3a3gMfWQKBgQDNQiHY2biYatgaMwXZ\n4iPf+0AkmRXhRFPoWEk2gv64z5IJuC0zr5lPqO+eSuLrGIHNxGpUKGC7QjdGir4W\n/Y2K4dCjwwa5sdBcuRVxw2gCAwoyH3sb4jPuWijVE9wOMfs8Coju6aBpYscxMmyd\nEvIYUlkQ71kdiUMfw9FrPWGjWQKBgQC/wyOYmvaUVJDlriS3E7BqVv4XfLJniAHr\nwxbZUQXnTirC1SthIWISXGthpBp0MueFGBlC/EFouB21I2vxAsGBjUDL3bN9jjEY\n3xl6suUFqhLs7uX80g+PcVAqwvFCnkJHrGX3X8ejr3fGMPj3PvqJEqRUJRbJjj7d\n1JcYGu6kkwKBgEIH41GagOrvfEO5ZEl6mWXlsvXTFZnZXFDjjfHuZDlZ9TYRPOFi\nvSRGSYeXubY9tQxYAoi+UJgNLjEQUyScPtuN14vHIrO8QzaBCCgH37698Zq8S+Nl\neqVT9czOTb13UMY48WJCYCtm7oOiIBTL0nwGicaL6RQ6YxCl8wnXvkBJAoGAHR3l\nJsPI0wbwJV/GxWGg9NSWqjxN3niBSioKKx8pVVDCH2k8t/fYq08LIv1G4wPjsYrS\nMyCYUe063YkuV58CgMhQ4WOdYGAZxlwBw2asbarASuePVk8S+8XJ1WRaO7JKABYG\nOYR6jLkU56wB8ZDHe86v0vL6vcnyc75W3tsgBy8CgYAkO+hdBT9D7mxjlcVg+77M\njMjpm7AcIAO+BywerNQuLcX/wq53Pv3vWb6d5ujxosaKb8TKT/tFL3o/Tx6zonU2\nM8RR3XzGuhEpkYjwLNbV0vvZnhkIKu6MNxYHLjj9yBN8X7VFi47FXP45vpg5zaUL\ng5kh3R1gaIRIq9j4n7WJTQ==\n-----END PRIVATE KEY-----\n",
      "client_email": "merchant-center-1604533683652@merchant-center-1604533683652.iam.gserviceaccount.com",
      "client_id": "104765964772424655400",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/merchant-center-1604533683652%40merchant-center-1604533683652.iam.gserviceaccount.com"
    }

    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ["https://www.googleapis.com/auth/content"],
      null
    )

    jwtClient.authorize(async function (err, tokens) {
      let db = await mysql.getConnection('db')

      let minimiumAmount = await mysql.query(db, 'SELECT `minimiumAmount` FROM `ShippingMethod` WHERE `id` = 1 LIMIT 1;')
      if (minimiumAmount.length === 0) {
        minimiumAmount = 999
      } else {
        minimiumAmount = minimiumAmount[0].minimiumAmount
        minimiumAmount = Number(minimiumAmount)
      }

      db = await mysql.getConnection('db')
      let shippingCost = await mysql.query(db, 'SELECT `cost` FROM `ShippingMethod` WHERE `id` = 1 LIMIT 1;')
      if (shippingCost.length === 0) {
        shippingCost = 99
      } else {
        shippingCost = shippingCost[0].cost
        shippingCost = Number(shippingCost)
      }

      /*
      let items = [
        { businessUnit: 8, instanceId: 1 },
        { businessUnit: 9, instanceId: 2 },
        { businessUnit: 2, instanceId: 3 },
        { businessUnit: 11, instanceId: 4 },
        { businessUnit: 10, instanceId: 5 }
      ]
      */

      let items = [
        { businessUnit: 8, instanceId: 1 }
      ]

      let genders = await Utils.loopbackFind(Sync.app.models.Gender)
      console.log(genders)

      let sublines = await Utils.loopbackFind(Sync.app.models.Subline)
      console.log(sublines)

      await Utils.asyncForEach(items, async (item) => {
        let products = await Utils.loopbackFind(Sync.app.models.Product, {
          where: {
            and: [
              {
                businesses: {
                  elemMatch: {
                    code: item.businessUnit
                  }
                }
              }
            ]
          }, include: ['brand', 'color', 'gender']
        })

        let date = new Date()

        let month = date.getMonth() + 1
        if (month <= 8) {
          month = '0' + (date.getMonth() + 1)
        }

        let day = (date.getDate() + 5)
        if (day <= 4) {
          day = '0' + (date.getDate() + 5)
        }

        let expirationDate = date.getFullYear() + '-' + month + '-' + day + 'T' + '00:00:00Z'

        let gender = 'HOMBRE'

        let reset = 0
        Utils.asyncForEach(products, async (data, idx) => {

          if (data.genderCode === 1 || data.genderCode === 3) {
            gender = 'MUJER'
          } else {
            gender = 'HOMBRE'
          }

          let photos = []
          data.photos.forEach((photo, i) => {
            if (i > 0) {
              photos.push('https://s3-us-west-1.amazonaws.com/calzzapato/normal/' + photo.description)
            }
          })

          let price = data.price
          let shippingPrice = shippingCost
          if (data.discountPrice > 0) {
            price = data.discountPrice
          }

          if (price >= minimiumAmount) {
            shippingPrice = 0
          }

          let category = ''
          genders.forEach(gender => {
            if (data.genderCode === gender.code) {
              category = gender.description
              if (category === 'DAMAS') {
                category = 'MUJERES'
              } else if (category === 'CABALLEROS') {
                category = 'HOMBRES'
              }
            }
          })

          sublines.forEach(subline => {
            if (data.sublineCode === subline.code) {
              category += ' > ' + subline.description
            }
          })

          if (reset >= 100) {
            let request = await Utils.request({
              method: 'POST',
              url: 'https://shoppingcontent.googleapis.com/content/v2.1/221592054/products?alt=json',
              headers: {
                'content-type': 'application/json',
                "Authorization": "Bearer " + tokens.access_token
              },
              json: true,
              body: {
                "kind": "content#product",
                "id": data.code,
                "offerId": data.code,
                "title": data.brand.name + ' ' + data.modelCode + ' ' + data.shortDescription,
                "description": data.name,
                "link": 'https://www.calzzapato.com' + data.url,
                "imageLink": 'https://s3-us-west-1.amazonaws.com/calzzapato/normal/' + data.photos[0].description,
                //"additionalImageLinks": photos,
                "contentLanguage": "es",
                "targetCountry": "MX",
                "channel": "online",
                "adult": false,
                "availability": "DISPONIBLE",
                "brand": data.brand.name,
                "condition": "NUEVO",
                "gtin": "",
                "gender": gender,
                "price": {
                  "value": price,
                  "currency": "MXN"
                },
                "shipping": {
                  "price": {
                    "value": shippingPrice,
                    "currency": "MXN"
                  }
                },
                "expirationDate": expirationDate
              }
            })
            reset = 0
            console.log(request.body)
          } else {
            Utils.request({
              method: 'POST',
              url: 'https://shoppingcontent.googleapis.com/content/v2.1/221592054/products?alt=json',
              headers: {
                'content-type': 'application/json',
                "Authorization": "Bearer " + tokens.access_token
              },
              json: true,
              body: {
                "kind": "content#product",
                "id": data.code,
                "offerId": data.code,
                "title": data.brand.name + ' ' + data.modelCode + ' ' + data.shortDescription,
                "description": data.name,
                "link": 'https://www.calzzapato.com' + data.url,
                "imageLink": 'https://s3-us-west-1.amazonaws.com/calzzapato/normal/' + data.photos[0].description,
                //"additionalImageLinks": photos,
                "contentLanguage": "es",
                "targetCountry": "MX",
                "channel": "online",
                "adult": false,
                "availability": "DISPONIBLE",
                "brand": data.brand.name,
                "condition": "NUEVO",
                "gtin": "",
                "gender": gender,
                "price": {
                  "value": price,
                  "currency": "MXN"
                },
                "shipping": {
                  "price": {
                    "value": shippingPrice,
                    "currency": "MXN"
                  }
                },
                "expirationDate": expirationDate
              }
            })
            reset += 1
          }
          console.log(item.businessUnit + ': ' + idx)
        })
      })
      await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Google' } })
      await mongodb.createMongoDB(Sync.app.models.Sync, {
        collection: 'Google',
        items: items.length,
        time: Utils.millisToMinutesAndSeconds(new Date() - start),
        updatedAt: new Date()
      })
    })
    return { status: "Synchronizing..." }
  }

  Sync.remoteMethod('googleShopping', {
    description: 'Google Shopping',
    http: {
      path: '/google',
      verb: 'POST'
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

  Sync.generateSitemaps = async (req) => {
    let response = { sync: false, errors: null }
    let db = await mysql.getConnection('db')
    let start = new Date()
    start = moment(start).format()
    let priority1 = 1.00
    let priority8 = .80
    let priority64 = .64
    const dbMongo = mongodb.getConnection('db')
    try {
      let instances = await mysql.query(db, 'SELECT i.id, i.uuid, i.domain, c.businessUnit FROM Instance AS i LEFT JOIN Config AS c ON c.instanceId = i.id WHERE i.status = 1;')
      await Utils.asyncForEach(instances, async (instance) => {
        console.log('Generate sitemap: ', instance.domain)
        let directory = `cdn/sitemaps/${instance.uuid}`
        // Creación de carpeta
        fs.mkdirSync(directory, { recursive: true })
        let domain = instance.domain
        // Array of products
        let products = await Utils.loopbackFind(Sync.app.models.Product, {
          where: {
            businesses: {
              elemMatch: {
                code: instance.businessUnit
              }
            }
          }
        })
        let urls = []
        await Utils.asyncForEach(products, async (product, count) => {
          urls.push(product.url)
        })
        /* 
        //sitemapMenu
        let responseMenu = await Utils.generateMenu(instance.uuid)
        urls = [...urls, ...responseMenu, ...staticRoutes] */

        //Define static routes
        let staticRoutes = ['404', 'ingreso', 'nosotros', 'nueva-contrasena', 'pagar', 'privacidad', 'recuperar-contrasena', 'registro', 'soporte', 'terminos', 'tiendas', 'validar-credivale', 'compras/finalizar', 'resumen/fallo', 'mi-cuenta/', 'mi-cuenta/informacion-personal', 'mi-cuenta/mis-catalogos', 'mi-cuenta/mis-direcciones', 'mi-cuenta/mis-pedidos', 'mi-cuenta/mis-tarjetas']

        //Get categories and brands
        let categories = []
        let brands = []


        let optionsResponse = await Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/catalogs/categories-brands',
          method: 'GET',
          headers: { instanceId: instance.id },
          json: true
        })
        categories = optionsResponse.body.categories
        brands = optionsResponse.body.brands

        let bothBrandAndCategories = [
          ...categories.map(category => ({ ...category, isCategory: true })),
          ...brands.map(brand => ({ ...brand, isCategory: false }))
        ]

        let doc = libxmljs.Document();
        let sitemapIndex = doc.node('sitemapindex')
        sitemapIndex.attr('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        sitemapIndex.attr('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        sitemapIndex.attr('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')
        /* SITEMAP DE LAS RUTAS PRINCIPALES, NO PRODUCTOS */
        let generalSitemap = sitemapIndex.node('sitemap')

        let urlSet = generalSitemap.node('urlset')
        urlSet.attr('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        urlSet.attr('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        urlSet.attr('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')
        let main = urlSet.node('url')
        main.node('loc', `https://${domain}/`)
        main.node('lastmod', start)
        main.node('priority', priority1.toFixed(2))

        if (bothBrandAndCategories !== null && bothBrandAndCategories !== undefined && bothBrandAndCategories.length > 0) {

          await Utils.asyncForEach(bothBrandAndCategories, async (direction, count) => {
            if (direction.label !== null && direction.label !== null) {
              let urlBrandAndCategories = urlSet.node('url')
              if (direction.isCategory) {
                urlBrandAndCategories.node('loc', `https://${domain}/${(direction.label).replace(/ /g, "-").toLowerCase()}`)
              } else {
                urlBrandAndCategories.node('loc', `https://${domain}/marcas/${(direction.label).replace(/ /g, "-").toLowerCase()}`)
              }
              urlBrandAndCategories.node('lastmod', start)
              urlBrandAndCategories.node('priority', priority8.toFixed(2))
            }
          })

        }

        if (bothBrandAndCategories !== null && bothBrandAndCategories !== undefined && bothBrandAndCategories.length > 0) {

          staticRoutes.forEach(route => {
            let staticUrl = urlSet.node('url')
            if (route !== null && route !== undefined) {
              staticUrl.node('loc', `https://${domain}/${route}`)
              staticUrl.node('lastmod', start)
              staticUrl.node('priority', priority8.toFixed(2))
            }
          })

        }
        /* FIN SITEMAP DE RUTAS PRINCIPALES, NO PRODUCTOS */

        /*INICIO SITEMAP CON PRODUCTOS DE CADA CATEGORIA */

        if (categories !== null && categories !== undefined && categories.length > 0) {

          await Utils.asyncForEach(categories, async (category, count) => {
            if (category.label !== null && category.label !== undefined) {
              let sitemapForProductsForEachCategory = sitemapIndex.node('sitemap')
              let urlSet2 = sitemapForProductsForEachCategory.node('urlset')
              urlSet2.attr('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
              urlSet2.attr('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
              urlSet2.attr('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')
              let urlProductsForCategory = urlSet2.node('url')
              //Esta es la raiz
              if (category.label !== null && category.label !== null) {
                urlProductsForCategory.node('loc', `https://${domain}/${(category.label).replace(/ /g, "-").toLowerCase()}`)
                urlProductsForCategory.node('lastmod', start)
                urlProductsForCategory.node('priority', priority8.toFixed(2))

                //Se inicia a buscar por cada categoria
                let urlSplit = category.label.split('/')
                let data = {
                  pg: 0,
                  u: (urlSplit !== null && urlSplit !== undefined && urlSplit.length > 0) ? (urlSplit[urlSplit.length - 1]).toLowerCase() : null, // La ultima categoria del arreglo.
                  c: category.node, //Node de la categoria.
                  br: [],
                  sc: [],
                  b: [],
                  a: [],
                  s: [],
                  p: [],
                  g: [],
                  o: false,
                  bp: false,
                  ob: ''
                }

                let filter = ''
                filter = Utils.encode(JSON.stringify(data))
                filter = JSON.stringify(filter)
                let response = await Utils.request({
                  method: 'GET',
                  url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products/filter?filter=' + filter,
                  headers: {
                    uuid: instance.uuid
                  }
                })

                //Se obtiene productos por categoria
                let productsPerCategory = await JSON.parse(response.body)
                if (productsPerCategory !== null && productsPerCategory !== undefined && productsPerCategory.length > 0) {

                  productsPerCategory.forEach(product => {
                    let urlProduct = urlSet2.node('url')
                    if (product.url !== null && product.url !== undefined) {
                      urlProduct.node('loc', `https://${domain}/${(category.label).replace(/ /g, "-").toLowerCase()}${product.url}`)
                      urlProduct.node('lastmod', start)
                      urlProduct.node('priority', priority8.toFixed(2))
                    }
                  })

                }

              }

            }
          })

        }

        //INICIO SITEMAPS CON PRODUCTOS DE CADA MARCA.
        if (brands !== null && brands !== undefined && brands.length > 0) {

          await Utils.asyncForEach(brands, async (brand, count) => {
            if (brand.label !== null && brand.label !== undefined) {
              let sitemapForProductsForEachBrand = sitemapIndex.node('sitemap')
              let urlSet3 = sitemapForProductsForEachBrand.node('urlset')
              urlSet3.attr('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
              urlSet3.attr('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
              urlSet3.attr('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')
              let urlForProductsForEachBrand = urlSet3.node('url')
              urlForProductsForEachBrand.node('loc', `https://${domain}/marcas/${(brand.label).replace(/ /g, "-").toLowerCase()}`)
              urlForProductsForEachBrand.node('lastmod', start)
              urlForProductsForEachBrand.node('priority', priority8.toFixed(2))
              let filter = {
                where: {
                  brandCode: Number(brand.value),
                  and: [
                    {
                      businesses: {
                        elemMatch: {
                          code: instance.businessUnit
                        }
                      }
                    }
                  ]
                },
                include: ['brand', 'detail'],
              }

              let productsForEachBrand = await Utils.loopbackFind(Sync.app.models.Product, filter)

              if (productsForEachBrand !== null && productsForEachBrand !== undefined && productsForEachBrand.length > 0) {

                await Utils.asyncForEach(productsForEachBrand, async (productBrand, count) => {
                  let urlProductBrand = urlSet3.node('url')
                  if (productBrand.url !== null && productBrand.url !== undefined) {
                    urlProductBrand.node('loc', `https://${domain}/marcas/${(brand.label).replace(/ /g, "-").toLowerCase()}${productBrand.url}`)
                    urlProductBrand.node('lastmod', start)
                    urlProductBrand.node('priority', priority8.toFixed(2))
                  }
                })

              }
            }
          })

        }
        //FIN SITEMAPS CON PRODUCTOS DE CADA MARCA.

        /* INICIO SITEMAP DE LOS PRODUCTOS */

        let sitemapProducts = sitemapIndex.node('sitemap')
        let urlSetProducts = sitemapProducts.node('urlset')
        urlSetProducts.attr('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        urlSetProducts.attr('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        urlSetProducts.attr('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')
        if (urls !== null && urls !== undefined && urls.length > 0) {

          urls.forEach(url => {
            if (url !== null && url !== undefined) {
              let urlProducts = urlSetProducts.node('url')
              urlProducts.node('loc', `https://${domain}${url}`)
              urlProducts.node('lastmod', start)
              urlProducts.node('priority', priority64.toFixed(2))
            }
          })

        }

        /* FIN SITEMAP DE LOS PRODUCTOS */

        const sitemap = doc.toString()

        // Create and validate sitemap
        fs.writeFileSync(directory + '/sitemap.xml', sitemap)
        const sitemapFile = fs.readFileSync(directory + '/sitemap.xml')
        const schema = fs.readFileSync('cdn/sitemap.xsd')

        // Parse the sitemap and schema
        const sitemapDoc = libxmljs.parseXml(sitemapFile)
        const schemaDoc = libxmljs.parseXml(schema)

        // Perform validation
        const isValid = sitemapDoc.validate(schemaDoc)
        if (!isValid) {
          response.errors = sitemapDoc.validationErrors
          response.sync = false
        } else {
          let path = 'sitemaps/'
          if (instance.id === 1) {
            path += 'calzzapato'
          } else if (instance.id === 2) {
            path += 'kelder'
          } else if (instance.id === 3) {
            path += 'urbanna'
          } else if (instance.id === 4) {
            path += 'calzzasport'
          } else if (instance.id === 5) {
            path += 'calzakids'
          }
          path += '/sitemap.xml'
          fs.readFile(directory + '/sitemap.xml', { encoding: 'base64' }, (error, data) => {
            CDN.uploadFile({
              name: path,
              data: data,
              contentType: 'application/xml'
            })
          })
          response.sync = true
        }
      })
      await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Sitemaps' } })
      await mongodb.createMongoDB(Sync.app.models.Sync, {
        collection: 'Sitemaps',
        items: instances.length,
        time: Utils.millisToMinutesAndSeconds(new Date() - start),
        errors: response.errors,
        updatedAt: new Date()
      })
    } catch (err) {
      console.log(err)
      throw err
    }
    return response
  }

  Sync.remoteMethod('generateSitemaps', {
    description: 'Generate a sitemaps',
    http: {
      path: '/sitemaps',
      verb: 'POST'
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

  Sync.syncProductStock = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()

    let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <GetArticulosSobrePedido xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
          </GetArticulosSobrePedido>\
        </soap:Body>\
      </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetArticulosSobrePedido',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    if (request.error) {
      throw request.error
    }

    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetArticulosSobrePedidoResponse']['GetArticulosSobrePedidoResult']
    data = data.cArticulosSobrePedido

    if (!data.length) {
      let tmp = data
      data = []
      data.push(tmp)
    }

    await Utils.asyncForEach(data, async (item, idx) => {
      await mongodb.findAndUpdateMongoDB(db, 'Product', { code: item.cLote._text }, {
        '$set': {
          stock: {
            status: false,
            deliveryDays: item.DiasEntrega._text
          }
        }
      })
      console.log('Sync product stock: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(data.length))
    })

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Product.Stock' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Product.Stock',
      items: data.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))

    return data
  }

  Sync.remoteMethod('syncProductStock', {
    description: 'GetArticulosSobrePedido',
    http: {
      path: '/products/stock',
      verb: 'POST'
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

  Sync.syncStoresByProduct = async (req) => {
    const db = mongodb.getConnection('db')
    req.setTimeout(configs.timeout)
    let start = new Date()

    let body = '<?xml version="1.0" encoding="utf-8"?>\
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
      <soap:Body>\
        <GetExistenciaSucursal xmlns="http://tempuri.org/">\
          <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
          <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
          <Todos>1</Todos>\
        </GetExistenciaSucursal>\
      </soap:Body>\
    </soap:Envelope>'

    let request = await Utils.request({
      method: 'POST',
      url: configs.webServiceVentaPublicoURL + '?op=GetExistenciaSucursal',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })
    if (request.error) {
      throw request.error
    }
    let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetExistenciaSucursalResponse']['GetExistenciaSucursalResult']['_text']

    await CDN.createFileIntoCDN('stores.zip', '/syncs', data)
    await CDN.unzipperFile('/cdn/syncs/stores.zip', '/cdn/syncs/stores.xml')
    let stores = fs.readFileSync(path.join(__dirname, '../../cdn/syncs/stores.xml'), 'utf-8')
    stores = convert.xml2json(stores, { compact: true, spaces: 4 })
    stores = JSON.parse(stores)
    stores = stores['ArrayOfcExistenciaSucursal']['cExistenciaSucursal']

    let mongoStores = await mongodb.findMongoDB(db, 'Store', {})

    await Utils.asyncForEach(stores, async (store, count) => {

      let storeObject = mongoStores.find(element => element.code === store.cSucursal._text)
      if (storeObject !== undefined && storeObject !== null) {
        let productData = {
          storeId: storeObject.code,
          zoneId: storeObject.zoneCode,
          stock: Number(store.nExistencia._text)
        }
        await mongodb.findAndUpdateMongoDB(db, 'Product', { code: store.cLote._text }, { '$push': { stores: productData } })
      }
    })

    await mongodb.findAndDeleteMongoDB(Sync.app.models.Sync, { where: { collection: 'Product.Stores' } })
    await mongodb.createMongoDB(Sync.app.models.Sync, {
      collection: 'Product.Stores',
      items: stores.length,
      time: Utils.millisToMinutesAndSeconds(new Date() - start),
      updatedAt: new Date()
    })

    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return data
  }

  Sync.remoteMethod('syncStoresByProduct', {
    description: 'Get Stores By Product',
    http: {
      path: '/products/stores',
      verb: 'POST'
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

  /*
  Sync.syncProductsToFBCatalogs = async (req) => {
    let products = []

    FB.api('oauth/access_token', { client_id: '569260793822380', client_secret: '3de31d5cb65dc5b4ba22fa620107fc0c', grant_type: 'client_credentials' }, async (res) => {
      if (!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
      }

      let accessToken = res.access_token;
      FB.setAccessToken(accessToken);

      products = await Utils.loopbackFind(Sync.app.models.Product, {
        where: {
          and: [
            {
              businesses: {
                elemMatch: {
                  code: 8
                }
              }
            }
          ]
        }, include: ['brand', 'color', 'gender'], limit: 1
      })


      for (let i = 0; i < (products.length / 100); i++) {
        let requestProducts = []

        for (let j = 0; j < 100; j++) {
          let index = (i * 100) + j

          if (index >= products.length) break

          let product = {
            "method": "CREATE",
            "retailer_id": products[index].code,
            "data": {
              "availability": (products[index].stock.status) ? "in stock" : "out of stock",
              "brand": products[index].brand.name,
              "name": products[index].name,
              "description": products[index].description,
              "image_url": 'https://s3-us-west-1.amazonaws.com/calzzapato/normal/' + products[index].photos[0].description,
              "price": products[index].price,
              "currency": "MX",
              "url": 'https://s3-us-west-1.amazonaws.com/calzzapato/normal/' + products[index].photos[0].description,
            }
          }

          requestProducts.push(product)
        }

        console.log("Requests: ", requestProducts)

        FB.api('1251123088594649/batch', "POST", {
          "access_token": accessToken,
          "requests": requestProducts
        }, (res) => {
          if (!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
          }
        })
      }
    });

    return products
  }

  Sync.remoteMethod('syncProductsToFBCatalogs', {
    description: 'sync products to Facebook Catalogs',
    http: {
      path: '/products-catalog',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'Object',
      root: true
    }
  })
  */

  // Migrations

  Sync.migrateBlocks = async (req) => {
    req.setTimeout(configs.timeout)
    let start = new Date()
    let db = await mysql.getConnection('db')

    let blocks = await mysql.query(db, 'SELECT * FROM Block;')
    await mongodb.dropMongoDBIndexes('Block', ['instanceId', 'blockTypeId'])
    await mongodb.dropCollectionMongoDB('Block')

    await Utils.asyncForEach(blocks, async (block, idx) => {
      await mongodb.createMongoDB(Sync.app.models.Block, {
        instanceId: block.instanceId,
        blockTypeId: block.blockTypeId,
        title: block.title,
        description: block.description,
        order: block.order,
        createdAt: block.createdAt,
        updatedAt: block.updatedAt,
        configs: (!Utils.isEmpty(block.configs)) ? JSON.parse(block.configs) : null,
        status: (block.status === 1) ? true : false
      })
      console.log('Migrate block: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(blocks.length))
    })
    await mongodb.createMongoDBIndexes('Block', [{ key: { instanceId: 1 }, name: 'instanceId' }, { key: { blockTypeId: 1 }, name: 'blockTypeId' }])
    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))

    return blocks
  }

  Sync.remoteMethod('migrateBlocks', {
    description: 'Migrate blocks',
    http: {
      path: '/blocks',
      verb: 'POST'
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

  Sync.migratePages = async (req) => {
    req.setTimeout(configs.timeout)
    let start = new Date()
    let db = await mysql.getConnection('db')

    let pages = await mysql.query(db, 'SELECT * FROM Page;')

    await mongodb.dropMongoDBIndexes('Page', ['instanceId', 'uuid'])
    await mongodb.dropCollectionMongoDB('Page')

    let detail = []
    await Utils.asyncForEach(pages, async (page, idx) => {
      detail = await mysql.query(db, 'SELECT productCode AS code FROM PageDetail WHERE pageId = ?', [
        page.id
      ])
      await mongodb.createMongoDB(Sync.app.models.Page, {
        instanceId: page.instanceId,
        uuid: page.uuid,
        catalog: page.catalog,
        banner: page.banner,
        mobileBanner: page.mobileBanner,
        name: page.name,
        description: page.description,
        url: page.url,
        products: detail,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        status: (page.status === 1) ? true : false
      })
      console.log('Migrate page: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(pages.length))
    })
    await mongodb.createMongoDBIndexes('Page', [
      { key: { instanceId: 1 }, name: 'instanceId' },
      { key: { uuid: 'text' }, name: 'uuid' }
    ])
    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))

    return pages
  }

  Sync.remoteMethod('migratePages', {
    description: 'Migrate pages',
    http: {
      path: '/pages',
      verb: 'POST'
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

  Sync.migrateCatalogs = async (req) => {
    req.setTimeout(configs.timeout)
    let start = new Date()
    let db = await mysql.getConnection('db')
    await db.beginTransaction()

    let catalogs = await mysql.query(db, 'SELECT * FROM Catalog;')

    await mongodb.dropMongoDBIndexes('Catalog', ['instanceId', 'uuid', 'userId'])
    await mongodb.dropCollectionMongoDB('Catalog')

    let detail = []
    await Utils.asyncForEach(catalogs, async (catalog, idx) => {
      detail = await mysql.query(db, 'SELECT productId AS code FROM CatalogDetail WHERE catalogId = ? AND status = 1', [
        catalog.id
      ])
      await mongodb.createMongoDB(Sync.app.models.Catalog, {
        instanceId: catalog.instanceId,
        uuid: catalog.uuid,
        userId: catalog.userId,
        name: catalog.name,
        description: catalog.description,
        products: detail,
        createdAt: catalog.createdAt,
        updatedAt: catalog.updatedAt,
        status: (catalog.status === 1) ? true : false
      })
      console.log('Migrate catalog: ' + Utils.numberWithCommas((idx + 1)) + ' de ' + Utils.numberWithCommas(catalogs.length))
    })
    await mongodb.createMongoDBIndexes('Catalog', [
      { key: { instanceId: 1 }, name: 'instanceId' },
      { key: { uuid: 'text' }, name: 'uuid' },
      { key: { userId: 1 }, name: 'userId' }
    ])
    console.log('Tiempo: ' + Utils.millisToMinutesAndSeconds(new Date() - start))
    return catalogs
  }

  Sync.remoteMethod('migrateCatalogs', {
    description: 'Migrate catalogs',
    http: {
      path: '/catalogs',
      verb: 'POST'
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

  Sync.syncSepomex = async () => {
    let response = { sync: false }

    let dir = __dirname + '/../../cdn/sepomex/'
    let files = await Utils.readDir(dir)

    let states = []
    let locations = []
    let locationsTypes = []
    let cities = []
    let municipalities = []

    await Utils.asyncForEach(files, async function (file) {
      let data = await Utils.readFile(dir + file)

      data = convert.xml2json(data, { compact: true, spaces: 4 })
      data = JSON.parse(data)
      data = data['NewDataSet']['table']

      let rows = []
      let row = {
        zip: '',
        locationId: '',
        location: '',
        locationType: '',
        locationTypeId: '',
        locationZone: '',
        municipality: '',
        municipalityId: '',
        state: '',
        stateId: '',
        city: '',
        cityId: '',
      }

      data.forEach(function (item) {
        row = {
          zip: (item['d_codigo'] !== undefined) ? item['d_codigo']['_text'] : '',
          locationId: (item['id_asenta_cpcons'] !== undefined) ? item['id_asenta_cpcons']['_text'] : '',
          location: (item['d_asenta'] !== undefined) ? item['d_asenta']['_text'] : '',
          locationType: (item['d_tipo_asenta'] !== undefined) ? item['d_tipo_asenta']['_text'] : '',
          locationTypeId: (item['c_tipo_asenta'] !== undefined) ? item['c_tipo_asenta']['_text'] : '',
          locationZone: (item['d_zona'] !== undefined) ? item['d_zona']['_text'] : '',
          municipality: (item['D_mnpio'] !== undefined) ? item['D_mnpio']['_text'] : '',
          municipalityId: (item['c_mnpio'] !== undefined) ? item['c_mnpio']['_text'] : '',
          state: (item['d_estado'] !== undefined) ? item['d_estado']['_text'] : '',
          stateId: (item['c_estado'] !== undefined) ? item['c_estado']['_text'] : '',
          city: (item['d_ciudad'] !== undefined) ? item['d_ciudad']['_text'] : '',
          cityId: (item['c_cve_ciudad'] !== undefined) ? item['c_cve_ciudad']['_text'] : ''
        }

        states.push({ id: row.stateId, name: row.state })
        municipalities.push({ municipalityStateCode: row.municipalityId + row.stateId, id: row.municipalityId, stateId: row.stateId, name: row.municipality })
        locations.push({ locationMunicipalityStateCode: row.locationId + row.municipalityId + row.stateId, code: row.locationId, zip: row.zip, locationTypeId: row.locationTypeId, stateId: row.stateId, municipalityId: row.municipalityId, municipalityStateCode: row.municipalityId + row.stateId, cityId: row.cityId, name: row.location, zone: row.locationZone, cityMunicipalityStateCode: row.cityId + row.municipalityId + row.stateId })
        locationsTypes.push({ id: row.locationTypeId, name: row.locationType })
        if (!Utils.isEmpty(row.cityId))
          cities.push({ index: row.cityId + row.municipalityId + row.stateId, id: row.cityId, stateId: row.stateId, municipalityId: row.municipalityId, name: row.city, cityMunicipalityStateCode: row.cityId + row.municipalityId + row.stateId })

        rows.push(row)

        row = {
          zip: '',
          locationId: '',
          location: '',
          locationType: '',
          locationTypeId: '',
          locationZone: '',
          municipality: '',
          municipalityId: '',
          state: '',
          stateId: '',
          city: '',
          cityId: ''
        }
      })
    })

    states = Utils.uniqBy(states, 'id')
    states = Utils.orderBy(states, 'id', 'asc')

    cities = Utils.uniqBy(cities, 'index')
    cities = Utils.orderBy(cities, 'id', 'asc')

    locations = Utils.uniqBy(locations, 'locationMunicipalityStateCode')
    locations = Utils.orderBy(locations, 'zip', 'asc')

    locationsTypes = Utils.uniqBy(locationsTypes, 'id')
    locationsTypes = Utils.orderBy(locationsTypes, 'id', 'asc')

    municipalities = Utils.uniqBy(municipalities, 'municipalityStateCode')
    municipalities = Utils.orderBy(municipalities, 'id', 'asc')

    const db = await mysql.connectToDBManually()
    try {
      await db.query('SET FOREIGN_KEY_CHECKS = 0;')
      await db.query('TRUNCATE TABLE State;')
      await db.query('TRUNCATE TABLE Municipality;')
      await db.query('TRUNCATE TABLE LocationType;')
      await db.query('TRUNCATE TABLE City;')
      await db.query('TRUNCATE TABLE Location;')
      await db.beginTransaction()

      await Utils.asyncForEach(states, async function (state) {
        await db.query("INSERT INTO State (code, name) VALUES (?, ?);", [state.id, state.name]);
      })

      await Utils.asyncForEach(municipalities, async function (municipality) {
        await db.query("INSERT INTO Municipality (code, stateCode, municipalityStateCode, name) VALUES (?, ?, ?, ?);", [municipality.id, municipality.stateId, municipality.municipalityStateCode, municipality.name]);
      })

      await Utils.asyncForEach(locationsTypes, async function (locationType) {
        await db.query("INSERT INTO LocationType (code, name) VALUES (?, ?);", [locationType.id, locationType.name]);
      })

      await Utils.asyncForEach(cities, async function (city) {
        await db.query("INSERT INTO City (code, stateCode, municipalityCode, name, cityMunicipalityStateCode) VALUES (?, ?, ?, ?, ?);", [city.id, city.stateId, city.municipalityId, city.name, city.cityMunicipalityStateCode]);
      })

      await Utils.asyncForEach(locations, async function (location) {
        await db.query("INSERT INTO Location (code, zip, locationTypeCode, stateCode, municipalityCode, municipalityStateCode, locationMunicipalityStateCode, cityCode, name, zone, cityMunicipalityStateCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [location.code, location.zip, location.locationTypeId, location.stateId, location.municipalityId, location.municipalityStateCode, location.locationMunicipalityStateCode, location.cityId, location.name, location.zone, location.cityMunicipalityStateCode]);
      })

      await db.query('SET FOREIGN_KEY_CHECKS = 1;')
      response.sync = true

      await db.commit()
    } catch (err) {
      console.log(err)
      response.message = err
      await db.rollback()
    }

    await db.close()
    return response
  }

  Sync.remoteMethod('syncSepomex', {
    description: 'Sync sepomex',
    http: {
      path: '/sepomex',
      verb: 'POST'
    },
    accepts: [],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
