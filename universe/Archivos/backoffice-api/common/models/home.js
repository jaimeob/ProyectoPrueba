'use strict'

const Utils = require('../Utils.js')
const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'

if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}

const configs = require('../configs.' + NODE_ENV + '.json')
const datasources = require(environment)

module.exports = function (Home) {
  /*
  SELECT s.name AS estado, count(*) AS contador FROM `User`AS u LEFT JOIN ShippingAddress AS sa ON u.favoriteAddressId = sa.id LEFT JOIN `Address` AS a ON a.id = sa.addressId LEFT JOIN State AS s ON s.code = a.stateCode GROUP BY (a.stateCode);
  SELECT s.name, count(*) FROM `Order`AS o LEFT JOIN ShippingAddress AS sa ON o.shippingAddressId = sa.id LEFT JOIN `Address` AS a ON a.id = sa.addressId LEFT JOIN State AS s ON s.code = a.stateCode WHERE o.calzzapatoCode IS NOT NULL AND MONTH(o.updatedAt) >= 10 AND paymentMethodId = 5 GROUP BY (a.stateCode);
  SELECT count(*) FROM `Order` WHERE calzzapatoCode IS NOT NULL AND month(updatedAt) >= 10
  SELECT * FROM `Order` WHERE calzzapatoCode IS NOT NULL AND instanceId = 4 AND month(updatedAt) = 11
  */

  Home.getDashboard = async (req) => {
    if (req.query === undefined || req.query.init === undefined || req.query.end === undefined) {
      let date = new Date()
      date.setDate(1)
      let initDay = date.getDate()
      let initMonth = date.getMonth()
      let initYear = date.getFullYear()

      date.setMonth(date.getMonth() + 2)
      date.setDate(0)
      let endDay = date.getDate()
      let endMonth = date.getMonth() - 1
      let endYear = date.getFullYear()

      req.query = {
        init: initYear + '-' + initMonth + '-' + initDay,
        end: endYear + '-' + endMonth + '-' + endDay
      }

    }

    let dailyMetrics = {
      name: 'Hoy',
      description: 'Actividad del día.',
      daily: null,
      kpis: [
        {
          title: 'Pedidos creados',
          description: '',
          value: '',
          grid: 2,
          status: true
        },
        {
          title: 'Pedidos pagados',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Tasa de conversión',
          description: '',
          value: '',
          grid: 2,
          status: true
        },
        {
          title: 'Ticket promedio',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Productos vendidos',
          description: '',
          value: '',
          grid: 2,
          status: true
        },
        {
          title: 'Ventas por hora (pedidos)',
          description: 'Pedidos del día de hoy desglosados por hora',
          value: '',
          arrows: true,
          list: [
            { hour: 0 },
            { hour: 1 },
            { hour: 2 },
            { hour: 3 },
            { hour: 4 },
            { hour: 5 },
            { hour: 6 },
            { hour: 7 },
            { hour: 8 },
            { hour: 9 },
            { hour: 10 },
            { hour: 11 },
            { hour: 12 },
            { hour: 13 },
            { hour: 14 },
            { hour: 15 },
            { hour: 16 },
            { hour: 17 },
            { hour: 18 },
            { hour: 19 },
            { hour: 20 },
            { hour: 21 },
            { hour: 22 },
            { hour: 23 }
          ],
          type: 'chart',
          grid: 12,
          status: true
        },
        {
          title: 'Ventas por hora (monto)',
          description: 'Monto total vendido del día de hoy desglosado por hora',
          value: '',
          arrows: true,
          list: [
            { hour: 0 },
            { hour: 1 },
            { hour: 2 },
            { hour: 3 },
            { hour: 4 },
            { hour: 5 },
            { hour: 6 },
            { hour: 7 },
            { hour: 8 },
            { hour: 9 },
            { hour: 10 },
            { hour: 11 },
            { hour: 12 },
            { hour: 13 },
            { hour: 14 },
            { hour: 15 },
            { hour: 16 },
            { hour: 17 },
            { hour: 18 },
            { hour: 19 },
            { hour: 20 },
            { hour: 21 },
            { hour: 22 },
            { hour: 23 }
          ],
          type: 'chart',
          grid: 12,
          status: true
        }
      ]
    }

    let bluePointsMetrics = {
      name: 'Actividad Monedero Azul ®',
      description: '',
      daily: null,
      kpis:[
        {
          title: 'Usuarios Monedero Azul ®',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Puntos canjeados',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Puntos generados',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
      ],
    }

    let monthlyMetrics = {
      name: '',
      description: 'Actividad del mes.',
      daily: null,
      chart: 'day',
      kpis: [
        {
          title: 'Ventas por dia (monto)',
          description: '',
          value: '',
          arrows: true,
          list: [],
          type: 'chart',
          grid: 12,
          status: true
        }
      ]
    }

    let yearMetrics = {
      name: '',
      description: 'Actividad anual.',
      daily: null,
      chart: 'year',
      kpis: [
        {
          title: 'Ventas por mes (monto)',
          description: '',
          value: '',
          arrows: true,
          list: [],
          type: 'chart',
          grid: 12,
          status: true
        }
      ]
    }

    let ordersMetrics = {
      name: 'Pedidos',
      description: 'Métricas pedidos realizados en línea.',
      kpis: [
        {
          title: 'Total de pedidos creados',
          description: 'Total de pedidos creados en el periodo actual',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Pedidos calzzapato.com',
          description: '',
          value: '',
          grid: 3,
          status: false
        },
        {
          title: 'Pedidos kelder.mx',
          description: '',
          value: '',
          grid: 3,
          status: false
        },
        {
          title: 'Pedidos urbanna.mx',
          description: '',
          value: '',
          grid: 3,
          status: false
        },
        {
          title: 'Pedidos calzzasport.com',
          description: '',
          value: '',
          grid: 3,
          status: false
        },
        {
          title: 'Pedidos calzakids.mx',
          description: '',
          value: '',
          grid: 3,
          status: false
        },
        {
          title: 'Total de pedidos pagados',
          description: 'Total de pedidos pagados en el periodo actual',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Tasa de efectividad',
          description: 'Pedidos creados vs pedidos pagados',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Productos vendidos',
          description: 'Total de productos vendidos en el periodo actual',
          value: '',
          grid: 3,
          status: true
        }
      ]
    }

    let paymentsMetrics = {
      name: 'Pagos',
      description: 'Métricas pagos realizados en línea.',
      kpis: [
        {
          title: 'Total vendido',
          description: 'Monto total vendido en el periodo actual',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Venta contado',
          description: 'Monto total vendido de contado',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Venta crédito',
          description: 'Monto total vendido a crédito',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'BBVA',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'CrediVale',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'OXXO',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'PayPal',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'NetPay',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Openpay',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Paynet',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Compra rápida',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Checkout',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Click & Collect',
          description: '',
          value: '',
          grid: 4,
          status: true
        },

      ]
    }

    let platformMetrics = {
      name: 'Plataformas',
      description: 'Métricas por plataforma.',
      kpis: [
        {
          title: 'Pedidos Web',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Pedidos Android',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Pedidos iOS',
          description: '',
          value: '',
          grid: 4,
          status: true
        }
      ]
    }

    let brandMetrics = {
      name: 'Tiendas',
      description: 'Métricas por tienda en línea.',
      kpis: [
        {
          title: 'Pedidos Calzzapato.com',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Pedidos Kelder.mx',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Pedidos Urbanna.mx',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Pedidos CalzzaSport.com',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Pedidos CalzaKids.mx',
          description: '',
          value: '',
          grid: 4,
          status: true
        }
      ]
    }

    let usersMetrics = {
      name: 'Usuarios',
      description: 'Métricas de usuarios.',
      kpis: [
        {
          title: 'Usuarios registrados',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Usuarios Monedero Azul ®',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Usuarios que han comprado',
          description: '',
          value: '',
          grid: 6,
          status: false
        },
        {
          title: 'Usuarios que han comprado más de una vez',
          description: '',
          value: '',
          grid: 6,
          status: false
        },
        {
          title: 'Últimos usuarios registrados',
          description: '',
          value: '',
          grid: 4,
          status: false
        },
        {
          title: 'Últimos compradores',
          description: '',
          value: '',
          grid: 4,
          status: false
        },
        {
          title: 'Ubicación usuarios',
          description: '',
          value: '',
          grid: 4,
          status: false
        },
        {
          title: 'Ubicación compradores',
          description: '',
          value: '',
          grid: 4,
          status: false
        },
        {
          title: 'Puntos canjeados',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Puntos generados',
          description: '',
          value: '',
          grid: 4,
          status: true
        },
        {
          title: 'Solicitudes CrediVale ®',
          description: 'Solicitudes recibidas en el periodo:',
          value: '',
          grid: 4,
          status: true
        }
      ]
    }

    let productMetrics = {
      name: 'Productos',
      description: 'Métricas acerca de productos.',
      kpis: [
        {
          title: 'Productos más vendidos por cantidad',
          description: '',
          value: '',
          list: [],
          grid: 12,
          status: true
        },
        {
          title: 'Productos más vendidos por monto',
          description: '',
          value: '',
          list: [],
          grid: 12,
          status: true
        }
      ]
    }

    let shippmentsMetrics = {
      name: 'Envíos',
      description: 'Métricas de envíos.',
      kpis: [
        {
          title: 'Calzzapato',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Envia.com',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'Click & Collect',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
        {
          title: 'CalzzaMóvil',
          description: '',
          value: '',
          grid: 3,
          status: true
        },
      ]
    }

    let topSalesMetrics = {
      name: 'Top ventas',
      description: 'Información de lo más vendido.',
      kpis: [
        {
          title: 'Venta por ciudad',
          description: '',
          value: '',
          list: [],
          grid: 12,
          status: true,
          type: 'city',
        },
        {
          title: 'Venta por marca',
          description: '',
          value: '',
          list: [],
          grid: 12,
          status: true,
          type: 'brand',
        }
      ]
    }

    let dbEcommerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      database: datasources.ecommerce.database,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password
    })

    let daily = new Date()
    if (req.query.daily !== undefined && req.query.daily !== null) {
      let dateDaily = new Date(req.query.daily)
      if (daily.getDate() !== dateDaily.getDate() || (daily.getMonth() + 1) !== (dateDaily.getMonth() + 1) || daily.getFullYear() !== dateDaily.getFullYear()) {
        daily = new Date(req.query.daily)
        dailyMetrics.name = daily.getDate() + ' de ' + daily.toLocaleString('es-MX', { month: 'long' }) + ' del ' + daily.getFullYear()
      } else {
        dailyMetrics.name = 'Hoy'
        dailyMetrics.block = true
      }
    }

    let initDay = daily.getDate()
    let initMonth = daily.getMonth() + 1
    let initYear = daily.getFullYear()

    req.query.daily = initYear + '-' + initMonth + '-' + initDay
    dailyMetrics.daily = req.query.daily

    let dateYearAgo = `${Number(req.query.daily.split('-')[0]) - 1}-${req.query.daily.split('-')[1]}-${req.query.daily.split('-')[2]}`

    dailyMetrics.kpis[5].list.forEach((hour, idx) => {
      dailyMetrics.kpis[5].list[idx][dateYearAgo.substring(0,4)] = 0
      dailyMetrics.kpis[5].list[idx][req.query.daily.substring(0,4)] = 0
      dailyMetrics.kpis[6].list[idx][dateYearAgo.substring(0,4)] = 0
      dailyMetrics.kpis[6].list[idx][req.query.daily.substring(0,4)] = 0
    })
    
    // Pedidos creados hoy
    let totalDailyOrders = await dbEcommerce.query('SELECT * FROM `Order` WHERE DATE(createdAt) = ? AND status = 1;', [req.query.daily])
    dailyMetrics.kpis[0].value = Utils.numberWithCommas(totalDailyOrders.length)
    dailyMetrics.kpis[0].description = 'Pedidos del día: ' + initDay + '/' + initMonth + '/' + initYear

    // Pedidos pagados hoy
    let paymentsDaily = await dbEcommerce.query('SELECT * FROM `Order` WHERE DATE(createdAt) = ? AND calzzapatoCode IS NOT NULL;', [req.query.daily])
    dailyMetrics.kpis[1].description = 'Total de pedidos: ' + Utils.numberWithCommas(paymentsDaily.length)

    let totalDailyOrdersAmount = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) = ? AND calzzapatoCode IS NOT NULL;', [req.query.daily])
    dailyMetrics.kpis[1].value = '$ ' + Utils.numberWithCommas(Number(totalDailyOrdersAmount[0].totalSum).toFixed(2)) + ' M.N.'

    // Tasa de efectividad, pedidos creados vs pagados
    dailyMetrics.kpis[2].value = (paymentsDaily.length / totalDailyOrders.length) * 100
    if (isNaN(Number(dailyMetrics.kpis[2].value))) {
      dailyMetrics.kpis[2].value = '-'
    } else {
      dailyMetrics.kpis[2].value = dailyMetrics.kpis[2].value.toFixed(2) + '%'
    }
    dailyMetrics.kpis[2].description = initDay + '/' + initMonth + '/' + initYear

    let totalPaymentsDaily = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) = ? AND calzzapatoCode IS NOT NULL;', [req.query.daily])
    if (Number(totalPaymentsDaily[0].totalSum) <= 0 || paymentsDaily.length <= 0) {
      dailyMetrics.kpis[3].value = '-'
    } else {
      dailyMetrics.kpis[3].value = '$ ' + Utils.numberWithCommas(Number(totalPaymentsDaily[0].totalSum / paymentsDaily.length).toFixed(2)) + ' M.N.'
    }
    dailyMetrics.kpis[3].description = 'Promedio de ' + Utils.numberWithCommas(paymentsDaily.length) + ' venta(s).'

    // Productos vendidos hoy
    let totalDailyProducts = await dbEcommerce.query('SELECT sum(od.quantity) AS totalProducts FROM `OrderDetail` AS od LEFT JOIN `Order` AS o ON o.id = od.orderId WHERE o.calzzapatoCode IS NOT NULL AND DATE(o.createdAt) = ?;', [req.query.daily])
    
    dailyMetrics.kpis[4].value = totalDailyProducts[0].totalProducts === undefined ? '0' : Utils.numberWithCommas(Number(totalDailyProducts[0].totalProducts))
    dailyMetrics.kpis[4].description = 'Productos del día: ' + initDay + '/' + initMonth + '/' + initYear

    let ordersPerDay = await dbEcommerce.query('SELECT HOUR(createdAt) AS hour, count(*) AS total FROM `Order` WHERE calzzapatoCode IS NOT NULL AND CAST(createdAt AS DATE) = ? GROUP BY HOUR(createdAt);', [req.query.daily])
    dailyMetrics.kpis[5].list.forEach(item => {
      ordersPerDay.forEach(order => {
        if (item.hour === order.hour) {
          item[req.query.daily.substring(0,4)] = Number(order.total)
        }
      })
    })

    let ordersPerDayYearAgo = await dbEcommerce.query('SELECT HOUR(createdAt) AS hour, count(*) AS total FROM `Order` WHERE calzzapatoCode IS NOT NULL AND CAST(createdAt AS DATE) = ? GROUP BY HOUR(createdAt);', [dateYearAgo])
    dailyMetrics.kpis[5].list.forEach(item => {
      ordersPerDayYearAgo.forEach(order => {
        if (item.hour === order.hour) {
          item[dateYearAgo.substring(0,4)] = Number(order.total)
        }
      })
    })

    let ordersPerDayAmount = await dbEcommerce.query('SELECT HOUR(createdAt) AS hour, sum(total) AS total FROM `Order` WHERE calzzapatoCode IS NOT NULL AND CAST(createdAt AS DATE) = ? GROUP BY HOUR(createdAt);', [req.query.daily])
    dailyMetrics.kpis[6].list.forEach(item => {
      ordersPerDayAmount.forEach(order => {
        if (item.hour === order.hour) {
          item[req.query.daily.substring(0,4)] = parseFloat(order.total)
        }
      })
    })

    let ordersPerDayAmountYearAgo = await dbEcommerce.query('SELECT HOUR(createdAt) AS hour, sum(total) AS total FROM `Order` WHERE calzzapatoCode IS NOT NULL AND CAST(createdAt AS DATE) = ? GROUP BY HOUR(createdAt);', [dateYearAgo])
    dailyMetrics.kpis[6].list.forEach(item => {
      ordersPerDayAmountYearAgo.forEach(order => {
        if (item.hour === order.hour) {
          item[dateYearAgo.substring(0,4)] = parseFloat(order.total)
        }
      })
    })
    // --------------------------------------

    // Usuarios Monedero Azul hoy
    let bluePointsDailyUsers = await dbEcommerce.query('SELECT count(*) AS totalUsers FROM `User` WHERE calzzapatoUserId IS NOT NULL AND DATE(createdAt) = ?;', [req.query.daily])
    bluePointsMetrics.kpis[0].value = Utils.numberWithCommas(Number(bluePointsDailyUsers[0].totalUsers).toFixed(0))
    bluePointsMetrics.kpis[0].description = 'Registrados del día: ' + initDay + '/' + initMonth + '/' + initYear
    
    // Puntos canjeados hoy
    let pointsRedeemed = await dbEcommerce.query('SELECT sum(pointsExchange) AS totalSum FROM `Order` WHERE calzzapatoCode IS NOT NULL AND pointsExchange != 0 AND DATE(createdAt) = ?;',[req.query.daily])
    bluePointsMetrics.kpis[1].value = Utils.numberWithCommas(Number(pointsRedeemed[0].totalSum))
    bluePointsMetrics.kpis[1].description = 'Puntos canjeados del día: ' + initDay + '/' + initMonth + '/' + initYear

    // Puntos generados hoy
    let pointsGenerated = await dbEcommerce.query('SELECT sum(pointsWin) AS totalSum FROM `Order` WHERE calzzapatoCode IS NOT NULL AND pointsWin != 0 AND DATE(createdAt) = ?;', [req.query.daily])
    bluePointsMetrics.kpis[2].value = Utils.numberWithCommas(Number(pointsGenerated[0].totalSum))
    bluePointsMetrics.kpis[2].description = 'Puntos generados del día: ' + initDay + '/' + initMonth + '/' + initYear


    // --------------------------------------
    // Total de pedidos creados en el periodo
    let totalOrders = await dbEcommerce.query('SELECT * FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND status = 1;', [req.query.init, req.query.end])
    ordersMetrics.kpis[0].value = Utils.numberWithCommas(totalOrders.length)

    // Total de pedidos por website
    await Utils.asyncForEach([1, 2, 3, 4, 5], async (i) => {
      let orders = await dbEcommerce.query('SELECT * FROM `Order` WHERE instanceId = ? AND DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND status = 1;', [i, req.query.init, req.query.end])
      ordersMetrics.kpis[i].value = (orders.length / totalOrders.length) * 100
      ordersMetrics.kpis[i].value = ordersMetrics.kpis[i].value + '%'
      ordersMetrics.kpis[i].description = Utils.numberWithCommas(orders.length) + ' pedidos de un total de ' + Utils.numberWithCommas(totalOrders.length)
    })

    let payments = await dbEcommerce.query('SELECT * FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL;', [req.query.init, req.query.end])
    // Total de pedidos pagados en el periodo
    ordersMetrics.kpis[6].value = Utils.numberWithCommas(payments.length)

    // Tasa de efectividad, pedidos creados vs pagados
    ordersMetrics.kpis[7].value = (payments.length / totalOrders.length) * 100
    if (isNaN(Number(ordersMetrics.kpis[7].value))) {
      ordersMetrics.kpis[7].value = '-'
    } else {
      ordersMetrics.kpis[7].value = ordersMetrics.kpis[7].value.toFixed(2) + '%'
    }

    //Total productos vendidos en el periodo.

    let totalPeriodProductsSold = await dbEcommerce.query('SELECT sum(od.quantity) AS totalProductsSold FROM `OrderDetail` AS od LEFT JOIN `Order` AS o ON o.id = od.orderId WHERE o.calzzapatoCode IS NOT NULL AND DATE(o.createdAt) >= ? AND DATE(o.createdAt) <= ?;', [req.query.init, req.query.end])
    ordersMetrics.kpis[8].value = totalPeriodProductsSold[0].totalProductsSold === undefined ? '0' : Utils.numberWithCommas(Number(totalPeriodProductsSold[0].totalProductsSold))

    // ---------------
    // Monto total vendido en el mes
    let totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[0].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    // Monto total vendido de contado
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId != 2;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[1].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    // Monto total vendido de crédito
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 2;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[2].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    // Venta con BBVA (monto)
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 1;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[3].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    // Venta con BBVA
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 1;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[3].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Venta con Credivale (monto)
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 2;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[4].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    // Venta con Credivale
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 2;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[4].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Venta con OXXO (monto)
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 3;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[5].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    // Venta con OXXO
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 3;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[5].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Venta con PayPal (monto)
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 4;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[6].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    // Venta con PayPal
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 4;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[6].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Venta con NetPay (monto)
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 5;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[7].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    // Venta con NetPay
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 5;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[7].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Venta con Openpay (monto)
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 9;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[8].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    // Venta con Openpay
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 9;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[8].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Venta con Paynet (monto)
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 10;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[9].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    // Venta con Paynet
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND paymentMethodId = 10;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[9].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Compra rápida
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND fastShopping = 1;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[10].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND fastShopping = 1;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[10].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Compra Checkout
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND fastShopping = 0;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[11].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND fastShopping = 0;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[11].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Compra Click & Collect
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND clickAndCollectStoreId IS NOT NULL;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[12].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND clickAndCollectStoreId IS NOT NULL;', [req.query.init, req.query.end])
    paymentsMetrics.kpis[12].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // ---------------
    // Compras Web
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND deviceTypeId = 1;', [req.query.init, req.query.end])
    platformMetrics.kpis[0].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND deviceTypeId = 1;', [req.query.init, req.query.end])
    platformMetrics.kpis[0].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Compras Android
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND deviceTypeId = 2;', [req.query.init, req.query.end])
    platformMetrics.kpis[1].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND deviceTypeId = 2;', [req.query.init, req.query.end])
    platformMetrics.kpis[1].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Compras iOS
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND deviceTypeId = 3;', [req.query.init, req.query.end])
    platformMetrics.kpis[2].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND deviceTypeId = 3;', [req.query.init, req.query.end])
    platformMetrics.kpis[2].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // ---------------
    // Compras Calzzapato.com
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND instanceId = 1;', [req.query.init, req.query.end])
    brandMetrics.kpis[0].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND instanceId = 1;', [req.query.init, req.query.end])
    brandMetrics.kpis[0].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Compras Kelder.mx
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND instanceId = 2;', [req.query.init, req.query.end])
    brandMetrics.kpis[1].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND instanceId = 2;', [req.query.init, req.query.end])
    brandMetrics.kpis[1].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Compras Urbanna.mx
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND instanceId = 3;', [req.query.init, req.query.end])
    brandMetrics.kpis[2].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND instanceId = 3;', [req.query.init, req.query.end])
    brandMetrics.kpis[2].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Compras CalzzaSport.com
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND instanceId = 4;', [req.query.init, req.query.end])
    brandMetrics.kpis[3].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND instanceId = 4;', [req.query.init, req.query.end])
    brandMetrics.kpis[3].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // Compras CalzaKids.mx
    totalPayments = await dbEcommerce.query('SELECT sum(total) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND instanceId = 5;', [req.query.init, req.query.end])
    brandMetrics.kpis[4].value = '$ ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum).toFixed(2)) + ' M.N.'

    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalCount FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND instanceId = 5;', [req.query.init, req.query.end])
    brandMetrics.kpis[4].description = 'Total de pedidos: ' + Utils.numberWithCommas(totalPayments[0].totalCount)

    // ---------------
    // Usuarios registrados
    let totalUsers = await dbEcommerce.query('SELECT count(*) AS totalUsers FROM `User`;')
    usersMetrics.kpis[0].value = Utils.numberWithCommas(Number(totalUsers[0].totalUsers).toFixed(0))

    // Usuarios registrados en el periodo
    totalUsers = await dbEcommerce.query('SELECT count(*) AS totalUsers FROM `User` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ?;', [req.query.init, req.query.end])
    usersMetrics.kpis[0].description = 'Usuarios registrados en el periodo: ' + Utils.numberWithCommas(Number(totalUsers[0].totalUsers).toFixed(0))

    // Usuarios Monedero Azul
    totalUsers = await dbEcommerce.query('SELECT count(*) AS totalUsers FROM `User` WHERE calzzapatoUserId IS NOT NULL;')
    usersMetrics.kpis[1].value = Utils.numberWithCommas(Number(totalUsers[0].totalUsers).toFixed(0))

    // Usuarios Monedero Azul en el periodo
    totalUsers = await dbEcommerce.query('SELECT count(*) AS totalUsers FROM `User` WHERE calzzapatoUserId IS NOT NULL AND DATE(createdAt) >= ? AND DATE(createdAt) <= ?;', [req.query.init, req.query.end])
    usersMetrics.kpis[1].description = 'Usuarios activados en el periodo: ' + Utils.numberWithCommas(Number(totalUsers[0].totalUsers).toFixed(0))

    // Puntos canjeados
    totalPayments = await dbEcommerce.query('SELECT sum(pointsExchange) AS totalSum FROM `Order` WHERE calzzapatoCode IS NOT NULL AND pointsExchange != 0;')
    usersMetrics.kpis[8].value = Utils.numberWithCommas(Number(totalPayments[0].totalSum))

    totalPayments = await dbEcommerce.query('SELECT sum(pointsExchange) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND pointsExchange != 0;', [req.query.init, req.query.end])
    usersMetrics.kpis[8].description = 'Puntos canjeados en el periodo: ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum))

    // Puntos generados
    totalPayments = await dbEcommerce.query('SELECT sum(pointsWin) AS totalSum FROM `Order` WHERE calzzapatoCode IS NOT NULL AND pointsWin != 0;')
    usersMetrics.kpis[9].value = Utils.numberWithCommas(Number(totalPayments[0].totalSum))

    totalPayments = await dbEcommerce.query('SELECT sum(pointsWin) AS totalSum FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND pointsWin != 0;', [req.query.init, req.query.end])
    usersMetrics.kpis[9].description = 'Puntos generados en el periodo: ' + Utils.numberWithCommas(Number(totalPayments[0].totalSum))

    //
    totalPayments = await dbEcommerce.query('SELECT email FROM CrediValeLead WHERE status = 1 GROUP BY (email);')
    usersMetrics.kpis[10].value = Utils.numberWithCommas(Number(totalPayments.length))

    totalPayments = await dbEcommerce.query('SELECT email FROM CrediValeLead  WHERE status = 1 AND DATE(createdAt) >= ? AND DATE(createdAt) <= ? GROUP BY (email) ;', [req.query.init, req.query.end])
    usersMetrics.kpis[10].description = 'Solicitudes recibidas en el periodo: ' + Utils.numberWithCommas(Number(totalPayments.length))


    // ----------------------
    // Product metrics

    let topProducts = await dbEcommerce.query('SELECT od.productCode AS code, od.productDescription AS description, count(od.quantity) AS totalQuantity, sum(od.subtotal) AS total FROM `OrderDetail` AS od INNER JOIN `Order` AS o ON od.orderId = o.id WHERE o.calzzapatoCode IS NOT NULL AND o.status = 1 AND od.status = 1 AND DATE(o.createdAt) >= ? AND DATE(o.createdAt) <= ? GROUP BY od.productCode, od.productDescription ORDER BY totalQuantity DESC LIMIT 10;', [req.query.init, req.query.end])
    productMetrics.kpis[0].list = topProducts

    topProducts = await dbEcommerce.query('SELECT od.productCode AS code, od.productDescription AS description, count(od.quantity) AS totalQuantity, sum(od.subtotal) AS total FROM `OrderDetail` AS od INNER JOIN `Order` AS o ON od.orderId = o.id WHERE o.calzzapatoCode IS NOT NULL AND o.status = 1 AND od.status = 1 AND DATE(o.createdAt) >= ? AND DATE(o.createdAt) <= ? GROUP BY od.productCode, od.productDescription ORDER BY total DESC LIMIT 10;', [req.query.init, req.query.end])
    productMetrics.kpis[1].list = topProducts

    // ----------------------
    // Shippments metrics

    // Compra Click & Collect
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalOrders FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND clickAndCollectStoreId IS NOT NULL;', [req.query.init, req.query.end])
    shippmentsMetrics.kpis[2].value = Utils.numberWithCommas(Number(totalPayments[0].totalOrders))
    
    // Enviado con calzzapato
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalOrders FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND shippingMethodId = 1;', [req.query.init, req.query.end])
    shippmentsMetrics.kpis[0].value = Utils.numberWithCommas(Number(totalPayments[0].totalOrders)) 

    // Enviado con Envia
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalOrders FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND shippingMethodId = 2;', [req.query.init, req.query.end])
    shippmentsMetrics.kpis[1].value = Utils.numberWithCommas(Number(totalPayments[0].totalOrders))

    // Enviado con Calzzamovil
    totalPayments = await dbEcommerce.query('SELECT count(*) AS totalOrders FROM `Order` WHERE DATE(createdAt) >= ? AND DATE(createdAt) <= ? AND calzzapatoCode IS NOT NULL AND shippingMethodId = 4;', [req.query.init, req.query.end])
    shippmentsMetrics.kpis[3].value = Utils.numberWithCommas(Number(totalPayments[0].totalOrders))

    // --------------------------------------
    // Pedidos mensuales.
    let dailyMonth = null
    if (req.query.month !== undefined && req.query.month !== null) {
      dailyMonth = new Date(req.query.month)
      let today = new Date()
      if ((dailyMonth.getMonth() + 1) === (today.getMonth() + 1) && dailyMonth.getFullYear() === today.getFullYear()) {
        monthlyMetrics.block = true
      }
    } else {
      dailyMonth = new Date()
      monthlyMetrics.block = true
    }
    initMonth = dailyMonth.getMonth() + 1
    initYear = dailyMonth.getFullYear()

    let ordersPerMonth = await dbEcommerce.query('SELECT DAY(createdAt) AS day, sum(total) AS total FROM `Order` WHERE calzzapatoCode IS NOT NULL AND MONTH(createdAt) = ? AND YEAR(createdAt) = ? GROUP BY DAY(createdAt);', [initMonth, initYear])
    let totalDays = new Date(initYear, initMonth, 0).getDate()
    for (let i = 1; i <= totalDays; i++) {
      monthlyMetrics.kpis[0].list.push({ day: i })
      monthlyMetrics.kpis[0].list[i-1][initYear] = 0
      monthlyMetrics.kpis[0].list[i-1][dateYearAgo.substring(0,4)] = 0
    }

    monthlyMetrics.kpis[0].list.forEach(item => {
      ordersPerMonth.forEach(order => {
        if (item.day === order.day) {
          item[req.query.daily.substring(0,4)] = parseFloat(order.total)
        }
      })
    })

    let ordersPerMonthYearAgo = await dbEcommerce.query('SELECT DAY(createdAt) AS day, sum(total) AS total FROM `Order` WHERE calzzapatoCode IS NOT NULL AND MONTH(createdAt) = ? AND YEAR(createdAt) = ? GROUP BY DAY(createdAt);', [initMonth, Number(dateYearAgo.substring(0,4))])
    let totalDaysYearAgo = new Date(Number(dateYearAgo.substring(0,4)), initMonth, 0).getDate()

    monthlyMetrics.kpis[0].list.forEach(item => {
      ordersPerMonthYearAgo.forEach(order => {
        if (item.day === order.day) {
          item[dateYearAgo.substring(0,4)] = parseFloat(order.total)
        }
      })
    })
    monthlyMetrics.name = dailyMonth.toLocaleString('es-MX', { month: 'long' }) + ' del ' + dailyMonth.getFullYear()
    monthlyMetrics.name = monthlyMetrics.name.charAt(0).toUpperCase() + monthlyMetrics.name.slice(1)
    monthlyMetrics.month = initYear + '-' + initMonth + '-1'

    // --------------------------------------
    // Pedidos anuales.
    let dailyYear = new Date()
    if (req.query.year !== undefined && req.query.year !== null) {
      initYear = req.query.year
      let yearNow = Number(dailyYear.getFullYear())
      if ( yearNow === Number(req.query.year) ) {
        yearMetrics.block = true
      }
    } else {
      initYear = dailyYear.getFullYear()
      yearMetrics.block = true
    }

    let ordersPerYear = await dbEcommerce.query('SELECT MONTH(createdAt) AS mon, sum(total) AS total, count(*) AS totalOrders FROM `Order` WHERE calzzapatoCode IS NOT NULL AND YEAR(createdAt) = ? GROUP BY MONTH(createdAt);', [initYear])
    let totalMonths = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    for (let i = 1; i <= totalMonths.length; i++) {
      yearMetrics.kpis[0].list.push({ month: totalMonths[i - 1], id: i })
      yearMetrics.kpis[0].list[i-1][initYear] = 0
      yearMetrics.kpis[0].list[i-1][dateYearAgo.substring(0,4)] = 0
    }

    let ordersPerYearAgo = await dbEcommerce.query('SELECT MONTH(createdAt) AS mon, sum(total) AS total, count(*) AS totalOrders FROM `Order` WHERE calzzapatoCode IS NOT NULL AND YEAR(createdAt) = ? GROUP BY MONTH(createdAt);', [dateYearAgo.substring(0,4)])

    yearMetrics.kpis[0].list.forEach(item => {
      ordersPerYear.forEach(order => {
        if (item.id === order.mon) {
          item[req.query.daily.substring(0,4)] = parseFloat(order.total)
        }
      })
    })

    yearMetrics.kpis[0].list.forEach(item => {
      ordersPerYearAgo.forEach(order => {
        if (item.id === order.mon) {
          item[dateYearAgo.substring(0,4)] = parseFloat(order.total)
        }
      })
    })
    yearMetrics.name = initYear

    // Top Ventas
    let salesByCity = await dbEcommerce.query('SELECT DISTINCT mu.name AS cityName, COUNT(*) AS orders, SUM(od.total) AS amount, SUM(ord.quantity) AS products\
    FROM `Order` AS od \
    LEFT JOIN `ShippingAddress` AS sa ON od.shippingAddressId = sa.id\
    LEFT JOIN `OrderDetail` AS ord ON ord.orderId = od.id\
    LEFT JOIN `Address` AS ad ON sa.addressId = ad.id\
    LEFT JOIN `Municipality` AS mu on mu.municipalityStateCode = ad.municipalityCode\
    WHERE od.calzzapatoCode IS NOT NULL AND od.shippingMethodId != 3\
    AND DATE(od.createdAt) >= ? AND DATE(od.createdAt) <= ?\
    GROUP BY mu.name ORDER BY amount DESC LIMIT 50', [req.query.init, req.query.end])

    topSalesMetrics.kpis[0].list = salesByCity

    let salesByCategory = await dbEcommerce.query('SELECT ord.productCode, SUM(od.total) AS amount, SUM(ord.quantity) AS products\
    FROM `Order` AS od\
    LEFT JOIN `OrderDetail` AS ord ON ord.orderId = od.id\
    WHERE od.calzzapatoCode IS NOT NULL\
    AND DATE(od.createdAt) >= ? AND DATE(od.createdAt) <= ?\
    GROUP BY ord.productCode ORDER BY amount DESC LIMIT 50', [req.query.init, req.query.end])

    let categoryCodes = {}

    let brandCodes = {}

    for(let product of salesByCategory){
      let foundedProduct  = await Utils.mongoFind('Product', { code: product.productCode})

      

      if(foundedProduct[0]){

        /*
        let foundedCategory = await Utils.request({
          method: 'GET',
          json: true,
          url: configs.HOST_ECOMMERCE + ':' + configs.PORT_ECOMMERCE + `/api/products/${Number(foundedProduct[0].categoryCode)}/breadcrumbs`,
        })
        */


  
        let productCategories = []
  
        /*
        for(let category of foundedCategory.body){
          productCategories.push(category.description)
        }
        */
  
        let completeCategoryName = productCategories.join('/')
  
        if(categoryCodes[completeCategoryName] != undefined){
          categoryCodes[completeCategoryName]['amount'] +=  Number(product.amount)
          categoryCodes[completeCategoryName]['products'] +=  Number(product.products)        
        }else{
          categoryCodes[completeCategoryName] = {}
          categoryCodes[completeCategoryName]['amount'] =  Number(product.amount)
          categoryCodes[completeCategoryName]['products'] =  Number(product.products)
          // categoryCodes[completeCategoryName]['url'] = foundedCategory.body[foundedCategory.body.length - 1].url
        }
  
        
  
        let brand = await Utils.mongoFind('Brand', {code: Number(foundedProduct[0].brandCode)})
  
        if( brandCodes[brand[0].name] != undefined){
          brandCodes[brand[0].name]['amount'] +=  Number(product.amount)
          brandCodes[brand[0].name]['products'] +=  Number(product.products)
        }else{
          brandCodes[brand[0].name] = {}
          brandCodes[brand[0].name]['amount'] =  Number(product.amount)
          brandCodes[brand[0].name]['products'] =  Number(product.products)
        }
      }      
    }

    for(let brand in brandCodes){
      topSalesMetrics.kpis[1].list.push({brand: brand, amount: brandCodes[brand].amount, products: brandCodes[brand].products})
    }

    /*
    for(let category in categoryCodes){
      topSalesMetrics.kpis[2].list.push({category: category, amount: categoryCodes[category].amount, products: categoryCodes[category].products, url:categoryCodes[category].url})
    }
    */
      
    await dbEcommerce.close()

    return [
      dailyMetrics,
      bluePointsMetrics,
      monthlyMetrics,
      yearMetrics,
      ordersMetrics,
      paymentsMetrics,
      shippmentsMetrics,
      platformMetrics,
      brandMetrics,
      usersMetrics,
      topSalesMetrics,
      productMetrics,
    ]
  }

  Home.remoteMethod('getDashboard', {
    description: 'Get dashboard',
    http: {
      path: '/dashboard',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req; } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
