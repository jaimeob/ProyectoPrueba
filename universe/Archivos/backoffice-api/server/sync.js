'use strict'

const cron = require('node-cron')
//const Utils = require('../common/Utils.js')
//const configs = require('../common/configs.json')

const start = async function() {
  /*
  cron.schedule('0 14 * * *', async () => {
    console.log("Sync all 2:00 pm!")
    let syncResponse = await Utils.request({
      method: 'POST',
      url: configs.HOST + ':' + configs.PORT + '/api/configs/sync/all'
    })
    console.log(syncResponse.body)
  }, {
    scheduled: true,
    timezone: 'America/Mazatlan'
  })

  cron.schedule('0 4 * * *', async () => {
    console.log("Sync all 4:00 am!")
    let syncResponse = await Utils.request({
      method: 'POST',
      url: configs.HOST + ':' + configs.PORT + '/api/configs/sync/all'
    })
    console.log(syncResponse.body)
  }, {
    scheduled: true,
    timezone: 'America/Mazatlan'
  })
  */

  cron.schedule('*/60 * * * *', async () => {
    /*
    console.log('Sync orders with Calzzapato ERP (orders with identificator code -1)')
    let db = await Utils.connectToDB()
    let orders = await db.query('SELECT `id` FROM `Order` WHERE `calzzapatoCode` IS NOT NULL AND `calzzapatoCode` <= 0;')
    console.log(orders)
    if (orders.length > 0) {
      let response = null
      await Utils.asyncForEach(orders, async function(order) {
        response = await Utils.request({
          url: configs.HOST + ':' + configs.PORT + '/api/payments/sync/' + order.id,
          method: 'POST'
        })
        console.log('Sync order -1')
        console.log(response)
      })
      console.log('Finish!')
    }
    else {
      console.log('OK!')
    }
    await db.close()
    */
  }, {
    scheduled: true,
    timezone: 'America/Mazatlan'
  })
}

module.exports = ({start})
