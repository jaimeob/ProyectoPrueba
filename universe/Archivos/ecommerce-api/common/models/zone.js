'use strict'

const Utils = require('../Utils.js')
const mysql = require('../classes/mysql.js')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

module.exports = (Zone) => {
  Zone.getStates = async (product, size) => {
    let response = []

    const db = mysql.connectToDBManually()

    try {
      let states = await db.query('SELECT * FROM State;')
      await db.close()
  
      let stock = await Utils.request({
        method: 'GET',
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products/' + product + '/stock',
        json: true
      })
  
      if (stock.body === undefined) {
        return response
      }
  
      stock = stock.body
      
      let storesAvailable = []

      stock.forEach(item => {
        if (Number(item.size) === Number(size)) {
          storesAvailable.push(item)
        }
      })
  
      await Utils.asyncForEach(states, async (state) => {
        let zones = await Utils.loopbackFind(Zone, { where: { stateCode: state.code } })
        
        if (zones.length > 0) {
          let zonesWithStores = []
         
          await Utils.asyncForEach(zones, async (zone) => {
            let stores = await Utils.loopbackFind(Zone.app.models.Store, { where: { zoneCode: zone.code } })
            let storesByZone = []
          
            storesAvailable.forEach(item => {
              stores.forEach(store => {
                if (store.code === item.branch) {
                  storesByZone.push(store)
                }
              })
            })
            
            if (storesByZone.length > 0) {
              zone.stores = storesByZone
              zonesWithStores.push(zone)
            }
          })
  
          if (zonesWithStores.length > 0) {
            response.push({
              code: state.code,
              name: state.name,
              zones: zonesWithStores
            })
          }
        }
      })
    } catch(err) {
      console.log(err)
    }
    
    return response
  }

  Zone.remoteMethod('getStates', {
    description: 'Get states',
    http: {
      path: '/states/:product/:size',
      verb: 'GET'
    },
    accepts: [
      { arg: 'product', type: 'string', required: true },
      { arg: 'size', type: 'string', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'array',
      root: true
    }
  })
}
