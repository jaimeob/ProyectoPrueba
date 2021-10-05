'use strict';

const Utils = require('../Utils.js')

module.exports = function (Address) {
  Address.createAddress = async function (data, cb) {
    let error = null
    let response = { created: false }
    let instanceId = Address.app.get('instanceId') || {}
    let userId = data.userId
    let address = data.address

    let db = await Utils.connectToDB()
    try {
      await db.beginTransaction()
      let responseAddress = await db.query('INSERT INTO Address (instanceId, zip, stateCode, municipalityCode, locationCode, street, exteriorNumber, interiorNumber, betweenStreets) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);', [
        instanceId,
        address.zip,
        address.stateCode,
        (address.municipalityCode + address.stateCode),
        (address.locationCode + address.municipalityCode + address.stateCode),
        address.street,
        address.exteriorNumber,
        address.interiorNumber,
        address.betweenStreets
      ])
      let responseShippingAddress = await db.query('INSERT INTO ShippingAddress (userId, addressId, alias, name, phone, reference) VALUES (?, ?, ?, ?, ?, ?);', [
        userId,
        responseAddress.insertId,
        address.alias,
        address.name,
        address.phone,
        address.reference
      ])
      await db.query('UPDATE User SET favoriteAddressId=? WHERE id=? ;', [
        responseShippingAddress.insertId,
        userId
      ])

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
      sa.phone,\
      sa.alias\
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

      response.createdAddress = selectResponse[0];
      
      await db.commit()
      response.created = true
    } catch (err) {
      console.log(err)
      error = err
      await db.rollback()
    }

    await db.close()
    if (response.created) {
      return response
    }
    else {
      throw error
    }
  }

  Address.deleteAddress = async function (data, cb) {
    let error = null
    let response = { deleted: false }

    let db = await Utils.connectToDB()
    try {
      await db.beginTransaction()
      await db.query('UPDATE Address SET status = 2 WHERE id = ?', [
        data.addressId
      ])
      await db.query('UPDATE ShippingAddress SET status = 2 WHERE id = ?', [
        data.shippingAddressId
      ])
      await db.commit()
      response.deleted = true
    } catch (err) {
      console.log(err)
      error = err
      await db.rollback()
    }
    await db.close()
    if (response.deleted) {
      return response
    }
    else {
      throw error
    }
  }

  Address.updateAddress = async function (data, cb) {

    let error = null
    let response = { updated: false }

    let db = await Utils.connectToDB()
    try {
      await db.beginTransaction()
      await db.query('UPDATE `ShippingAddress` AS SA INNER JOIN `Address` AS A  ON SA.addressId = A.Id SET SA.alias = ?,\
                     SA.reference = ?, A.zip= ?, A.stateCode = ?, A.municipalityCode=?, A.locationCode=?,\
                      A.street=?, A.exteriorNumber= ?, A.interiorNumber=?,A.betweenStreets=?, SA.name=?,SA.phone=? WHERE SA.id=?;',
        [data.values.alias, data.values.reference, data.values.zip, data.location.stateCode, data.location.municipalityStateCode,
        data.location.locationMunicipalityStateCode, data.values.street, data.values.exteriorNumber, data.values.interiorNumber, data.values.betweenStreets, data.values.name, data.values.phone, data.values.id])
      await db.commit()
      response.updated = true
    } catch (err) {
      console.log(err)
      error = err
      await db.rollback()
    }

    await db.close()
    if (response.updated) {
      return response
    }
    else {
      throw error
    }
  }

  Address.remoteMethod('createAddress', {
    description: 'Create address',
    http: {
      path: '/create',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Address.remoteMethod('deleteAddress', {
    description: 'Delete address',
    http: {
      path: '/delete',
      verb: 'DELETE'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  Address.remoteMethod('updateAddress', {
    description: 'Update Address',
    http: {
      path: '/update',
      verb: 'PUT'
    },
    accepts: [
      { arg: 'data', type: 'object', require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
