'use strict'

const mysql = require('../classes/mysql.js')

module.exports = function (Address) {
  Address.createAddress = async (data, req) => {
    let response = { created: false }
    let user = req.headers.user
    let instanceId = req.headers.instanceId

    const db = mysql.connectToDBManually()
    
    try {
      await db.beginTransaction()

      let responseAddress = await db.query('INSERT INTO Address (instanceId, zip, stateCode, municipalityCode, locationCode, street, exteriorNumber, interiorNumber, betweenStreets, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [
        instanceId,
        data.zip,
        data.stateCode,
        (data.municipalityCode + data.stateCode),
        (data.locationCode + data.municipalityCode + data.stateCode),
        data.street,
        data.exteriorNumber,
        data.interiorNumber,
        data.betweenStreets,
        data.lat,
        data.lng
      ])

      let responseShippingAddress = await db.query('INSERT INTO ShippingAddress (userId, addressId, alias, name, lastName, phone, reference) VALUES (?, ?, ?, ?, ?, ?, ?);', [
        user.id,
        responseAddress.insertId,
        data.alias,
        data.name,
        data.lastName,
        data.phone,
        data.reference
      ])

      await db.query('UPDATE User SET favoriteAddressId = ? WHERE id = ?;', [responseShippingAddress.insertId, user.id])

      let selectResponse = await db.query('SELECT\
        sa.id,\
        sa.userId AS userId,\
        sa.reference,\
        a.instanceId,\
        a.id AS addressId,\
        a.zip,\
        a.betweenStreets,\
        s.name AS state,\
        m.name AS municipality,\
        l.name AS location,\
        l.code AS locationCode,\
        lt.name AS type,\
        a.street,\
        a.exteriorNumber,\
        a.interiorNumber,\
        sa.name,\
        sa.lastName,\
        sa.phone,\
        sa.alias,\
        a.lat,\
        a.lng\
        FROM ShippingAddress AS sa\
        LEFT JOIN Address AS a ON a.id = sa.addressId\
        LEFT JOIN State AS s ON s.code = a.stateCode\
        LEFT JOIN Municipality AS m ON m.municipalityStateCode = a.municipalityCode\
        LEFT JOIN Location AS l ON l.locationMunicipalityStateCode = a.locationCode\
        LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode\
        WHERE a.id = ?\
        AND a.status = 1\
        AND sa.status = 1\
        ORDER BY a.createdAt DESC;', [
        responseAddress.insertId
      ])

      if (selectResponse.length > 0) {
        response.createdAddress = selectResponse[0]
        await db.commit()
        response.created = true
      } 
    } catch (err) {
      response.error = err
      await db.rollback()
    }

    await db.close()

    if (response.created) {
      return response
    } else {
      throw response.error
    }
  }

  Address.remoteMethod('createAddress', {
    description: 'Create address',
    http: {
      path: '/create',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Address.deleteAddress = async (data, req) => {
    let response = { deleted: false }
    let user = req.headers.user

    const db = mysql.connectToDBManually()

    try {
      let addresses = await db.query('SELECT * FROM ShippingAddress WHERE id = ? AND userId = ? AND status = 1;', [data.addressId, user.id])

      if (addresses.length > 0) {
        await db.beginTransaction()
        await db.query('UPDATE Address SET status = 2 WHERE id = ?', [addresses[0].addressId])
        await db.query('UPDATE ShippingAddress SET status = 2 WHERE id = ?', [addresses[0].id])
  
        if (user.favoriteAddressId !== null) {
          if (user.favoriteAddressId === addresses[0].id) {
            await db.query('UPDATE User SET favoriteAddressId = NULL WHERE id = ?;', [user.id])
          }
        }

        await db.commit()
        response.deleted = true
      }
    } catch (err) {
      response.error = err
      await db.rollback()
    }

    await db.close()

    if (response.deleted) {
      return response
    } else {
      throw response.error
    }
  }

  Address.remoteMethod('deleteAddress', {
    description: 'Delete address',
    http: {
      path: '/delete',
      verb: 'DELETE'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Address.updateCoordinates = async (data, req) => {
    let response = { updated: false }
    let user = req.headers.user
    
    const db = mysql.connectToDBManually()

    try {
      await db.beginTransaction()

      let updated = await db.query('UPDATE Address AS a LEFT JOIN `ShippingAddress` AS sa ON sa.addressId = a.id SET a.lat = ?, a.lng = ? WHERE a.id = ? AND sa.userId = ?', [
        data.lat,
        data.lng,
        data.id,
        user.id
      ])

      if (updated.changedRows === 1) {
        await db.commit()
        response.updated = true
      }
    } catch (err) {
      response.error = err
      await db.rollback()
    }

    await db.close()
    
    if (response.updated) {
      return response
    } else {
      throw response.error
    }
  }

  Address.remoteMethod('updateCoordinates', {
    description: 'Update coordinates',
    http: {
      path: '/location',
      verb: 'PUT'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Address.updateAddress = async (data, req) => {
    let response = { updated: false }
    let user = req.headers.user
    
    const db =  mysql.connectToDBManually()

    try {
      await db.beginTransaction()

      let updated = await db.query('UPDATE `ShippingAddress` AS sa INNER JOIN `Address` AS a ON sa.addressId = a.id\
      SET sa.alias = ?, sa.reference = ?, a.zip= ?, a.stateCode = ?, a.municipalityCode = ?, a.locationCode = ?, a.lat = ?, a.lng = ?,\
      a.street = ?, a.exteriorNumber = ?, a.interiorNumber = ?, a.betweenStreets = ?, sa.name = ?, sa.lastName = ?, sa.phone = ?\
      WHERE sa.id = ? AND sa.userId = ?;', [
        data.values.alias,
        data.values.reference,
        data.values.zip,
        data.location.stateCode,
        data.location.municipalityStateCode,
        data.location.locationMunicipalityStateCode,
        data.values.lat,
        data.values.lng,
        data.values.street,
        data.values.exteriorNumber,
        data.values.interiorNumber,
        data.values.betweenStreets,
        data.values.name,
        data.values.lastName,
        data.values.phone,
        data.values.id,
        user.id
      ])

      if (updated.changedRows === 1 || updated.changedRows === 2) {
        await db.commit()
        response.updated = true
      }
    } catch (err) {
      response.error = err
      await db.rollback()
    }

    await db.close()

    if (response.updated) {
      return response
    } else {
      throw response.error
    }
  }

  Address.remoteMethod('updateAddress', {
    description: 'Update Address',
    http: {
      path: '/update',
      verb: 'PUT'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Address.getFavoriteAddress = async (req) => {
    let response = {}
    let user = req.headers.user
    
    const db =  mysql.connectToDBManually()

    try {
      let addresses = await db.query('SELECT\
        a.zip,\
        s.name AS state,\
        m.name AS city\
      FROM ShippingAddress AS sa\
      LEFT JOIN User AS u ON u.favoriteAddressId = sa.id\
      LEFT JOIN Address AS a ON a.id = sa.addressId\
      LEFT JOIN State AS s ON s.code = a.stateCode\
      LEFT JOIN Municipality AS m ON m.municipalityStateCode = a.municipalityCode\
      LEFT JOIN Location AS l ON l.locationMunicipalityStateCode = a.locationCode\
      LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode\
      WHERE sa.id = ?\
      AND a.status = 1\
      AND sa.status = 1\
      LIMIT 1', [
        user.favoriteAddressId
      ])

      if (addresses.length > 0) {
        response = addresses[0]
      }
    } catch (err) {
      response.error = err
    }

    await db.close()

    if (response.error) {
      throw response.error
    } else {
      return response
    }
  }

  Address.remoteMethod('getFavoriteAddress', {
    description: 'Get favorite address',
    http: {
      path: '/favorite',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
