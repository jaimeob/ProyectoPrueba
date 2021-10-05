'use strict'

const convert = require('xml-js')
const Utils = require('../Utils.js')

const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

module.exports = function(Config) {
  Config.syncMenu = async function (cb) {
    let sync = false
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
    
    if(request.error) {
      throw console.log(request.error)
    }

    let result = convert.xml2json(request.body, {compact: true, spaces: 4})
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetCatCategorias2Response']['GetCatCategorias2Result']['Json']['_text']
    data = JSON.parse(data)

    let db = await Utils.connectToDB()
    await db.beginTransaction()
    try {
      await db.query('TRUNCATE TABLE CategoryNode;')
      await Utils.asyncForEach(data, async function(item) {
        if (item.nStatus) {
          await db.query('INSERT INTO CategoryNode (idNode, idFather, description) VALUES (?, ?, ?);', [item.IdNodo, item.IdPadre, item.cDescripcion])
        }
        else {
          console.log('No sync item...')
          console.log(item)
        }
      })
      sync = true
      await db.commit()
    } catch (err) {
      console.log(err)
      await db.rollback()
    }

    await db.close()
    return {sync: sync}
  }

  Config.syncProductsWithCategory = async function (cb) {
    let sync = false
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

    if(request.error) {
      throw console.log(request.error)
    }

    let result = convert.xml2json(request.body, {compact: true, spaces: 4})
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetLotesCategorias2Response']['GetLotesCategorias2Result']['Json']['_text']
    data = JSON.parse(data)

    let db = await Utils.connectToDB()
    await db.beginTransaction()
    try {
      await db.query('TRUNCATE TABLE ProductCategory;')
      await Utils.asyncForEach(data, async function(item) {
        await db.query('INSERT INTO ProductCategory (categoryId, productId) VALUES (?, ?);', [item.IdCategoria, item.cLote])
      })
      sync = true
      await db.commit()
    } catch (err) {
      console.log(err)
      await db.rollback()
    }

    await db.close()
    return {sync: sync}
  }

  Config.syncAttributes = async function (cb) {
    let sync = false
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

    if(request.error) {
      sync = false
      throw console.log(request.error)
    }
    
    let result = convert.xml2json(request.body, {compact: true, spaces: 4})
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetCatAtributosResponse']['GetCatAtributosResult']['AtributosJson']['_text']
    data = JSON.parse(data)

    let db = await Utils.connectToDB()
    await db.beginTransaction()
    try {
      await db.query('TRUNCATE TABLE Attribute;')
      await Utils.asyncForEach(data, async function(item) {
        await db.query('INSERT INTO Attribute (code, name) VALUES (?, ?);', [item.IdAtributo, item.Atributo])
      })
      sync = true
      await db.commit()
    } catch (err) {
      console.log(err)
      await db.rollback()
    }

    await db.close()
    return {sync: sync}
  }

  Config.syncProductsByAttributes = async function (cb) {
    let sync = false
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

    if(request.error) {
      sync = false
      throw console.log(request.error)
    }

    let result = convert.xml2json(request.body, {compact: true, spaces: 4})
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetLotesAtributosResponse']['GetLotesAtributosResult']['LotesAtributosJson']['_text']
    data = JSON.parse(data)

    let db = await Utils.connectToDB()
    await db.beginTransaction()
    try {
      await db.query('TRUNCATE TABLE ProductAttribute;')
      await Utils.asyncForEach(data, async function(item) {
        await db.query('INSERT INTO ProductAttribute (productId, attributeId) VALUES (?, ?);', [item.cLote, item.IdAtributo])
      })
      sync = true
      await db.commit()
    } catch (err) {
      console.log(err)
      await db.rollback()
    }

    await db.close()
    return {sync: sync}
  }

  Config.syncProductStock = async function () {
    let sync = false
    let body = '<?xml version="1.0" encoding="utf-8"?>\
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
      <soap:Body>\
        <GetExistencias xmlns="http://tempuri.org/">\
          <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
          <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
        </GetExistencias>\
      </soap:Body>\
    </soap:Envelope>'
    
    let request = await Utils.request({
      method: 'POST',
      url: 'http://187.141.134.126/wsappventapublico/service1.asmx?op=GetExistencias',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })

    let result = convert.xml2json(request.body, {compact: true, spaces: 4})
    result = JSON.parse(result)
    let data = result['soap:Envelope']['soap:Body']['GetExistenciasResponse']['GetExistenciasResult']['Json']['_text']
    data = JSON.parse(data)

    let db = await Utils.connectToDB()
    try {
      await db.beginTransaction()
      await db.query('TRUNCATE TABLE ProductStock;')
      await Utils.asyncForEach(data, async function(item) {
        await db.query('INSERT INTO ProductStock (zoneCode, zoneName, branchCode, branchName, productCode, stock) VALUES (?, ?, ?, ?, ?, ?)', [
          item.cPlaza,
          item.NombrePlaza,
          item.cSucursal,
          item.NombreSucursal,
          item.cLote,
          item.nExistencia
        ])
      })
      sync = true
      await db.commit()
    }
    catch (err) {
      console.log(err)
      await db.rollback()
    }
    await db.close()
    return {sync: sync}
  }
  
  Config.syncAll = async function () {
    let responses = []
    let response = await Utils.request({
      method: 'POST',
      url: configs.HOST + ':' + configs.PORT + '/api/configs/sync/attributes'
    })

    responses.push({attributes: response.body})
  
    response = await Utils.request({
      method: 'POST',
      url: configs.HOST + ':' + configs.PORT + '/api/configs/sync/products-category'
    })

    responses.push({['products-category']: response.body})
  
    response = await Utils.request({
      method: 'POST',
      url: configs.HOST + ':' + configs.PORT + '/api/configs/sync/products-attributes'
    })

    console.log('response sync products attributes')
    console.log(response)
    responses.push({['products-attributes']: response.body})
  
    response = await Utils.request({
      method: 'POST',
      url: configs.HOST + ':' + configs.PORT + '/api/configs/sync/menu'
    })

    console.log('response sync menu')
    console.log(response)
    responses.push({['menu']: response.body})
  
    response = await Utils.request({
      method: 'POST',
      url: configs.HOST + ':' + configs.PORT + '/api/configs/sync/product-stock'
    })

    console.log('response sync products stock')
    console.log(response)
    responses.push({['products-stock']: response.body})

    return { finished: true, responses }
  }

  Config.remoteMethod(
    'syncMenu',
    {
      description: 'Sync menu',
      http: {
        path: '/sync/menu',
        verb: 'POST'
      },
      accepts: [],
      returns: {
        arg: 'data',
        type: 'Object',
        root: true
      }
    }
  )

  Config.remoteMethod(
    'syncProductsWithCategory',
    {
      description: 'Sync products with category',
      http: {
        path: '/sync/products-category',
        verb: 'POST'
      },
      accepts: [],
      returns: {
        arg: 'data',
        type: 'Object',
        root: true
      }
    }
  )

  Config.remoteMethod(
    'syncAttributes',
    {
      description: 'Sync attributes',
      http: {
        path: '/sync/attributes',
        verb: 'POST'
      },
      accepts: [],
      returns: {
        arg: 'data',
        type: 'Object',
        root: true
      }
    }
  )

  Config.remoteMethod(
    'syncProductsByAttributes',
    {
      description: 'Sync products by attributes',
      http: {
        path: '/sync/products-attributes',
        verb: 'POST'
      },
      accepts: [],
      returns: {
        arg: 'data',
        type: 'Object',
        root: true
      }
    }
  )

  Config.remoteMethod(
    'syncProductStock',
    {
      description: 'Sync stock products by zone and branch',
      http: {
        path: '/sync/product-stock',
        verb: 'POST'
      },
      accepts: [
      ],
      returns: {
        arg: 'data',
        type: 'Object',
        root: true
      }
    }
  )

  Config.remoteMethod(
    'syncAll',
    {
      description: 'Sync all',
      http: {
        path: '/sync/all',
        verb: 'POST'
      },
      accepts: [
      ],
      returns: {
        arg: 'data',
        type: 'Object',
        root: true
      }
    }
  )
}
