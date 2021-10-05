'use strict'

const cron = require('node-cron')
const Utils = require('../common/Utils.js')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../common/configs.' + NODE_ENV + '.json')
const mysql = require('../common/classes/mysql.js')

const start = async function () {
  // Sincronizar todo
  cron.schedule('0 4 * * *', async () => {
    await Utils.request({
      method: 'POST',
      url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/syncs/all'
    })
  }, {
    scheduled: true,
    timezone: 'America/Mazatlan'
  })

  // Sincronizar órdenes pendientes
  cron.schedule('*/60 * * * *', async () => {
    let db = await mysql.connectToDBManually()
    let orders = await db.query('SELECT `id` FROM `Order` WHERE `calzzapatoCode` IS NOT NULL AND `calzzapatoCode` <= 0;')
    await db.close()
    if (orders.length > 0) {
      await Utils.asyncForEach(orders, async function (order) {
        await Utils.request({
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/payments/sync/' + order.id,
          method: 'POST'
        })
      })
    }
  }, {
    scheduled: true,
    timezone: 'America/Mazatlan'
  })

  // cron.schedule('0 2 * * *', async () => {
  //   let connection = await mysql.connectToDBManually()
  //   let orders = await connection.query('SELECT o.id AS orderId FROM `Order` AS o \
  //   LEFT JOIN OrderShipping AS os ON os.orderId = o.id\
  //   WHERE o.calzzapatoCode IS NOT NULL AND o.status = 1 AND o.paymentMethodId != 2 AND o.shippingMethodId = 2 AND os.id IS NULL;')
  //   await connection.close()
  //   if (orders.length > 0) {
  //     await Utils.asyncForEach(orders, async function (order) {
  //       await Utils.request({
  //         url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/guide',
  //         method: 'POST',
  //         json: true,
  //         body: {
  //           "data": {
  //             "orderId": order.orderId
  //           }
  //         }
  //       })
  //     })
  //   }
  // }, {
  //   scheduled: true,
  //   timezone: 'America/Mazatlan'
  // })

  // Crear ruta para calzzamovil 
  // cron.schedule('* * * * *', async () => {
  //   await Utils.request({
  //     url: configs.HOST_IP + ':' + configs.PORT + '/api/orders/calzzamovil/all-route',
  //     method: 'POST',
  //     json: true,
  //     body: {
  //       "data": {
  //         "lat":"24.791287",
  //         "lng":"-107.403939"
  //       }
  //     }
  //   })
  // }, {
  //   scheduled: true,
  //   timezone: 'America/Mazatlan'
  // })

}

module.exports = ({ start })
