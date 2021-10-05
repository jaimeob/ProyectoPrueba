'use strict'
const ObjectId = require('mongodb').ObjectID
const mysql = require('../classes/mysql.js')
const mongodb = require('../classes/mongodb')

module.exports = (Orderlog) => {
    Orderlog.createOrderLog = async (data, req) => {
        let response = { added: false }
        const mdb = mongodb.getConnection('db')
        const db =  mysql.connectToDBManually()

        let user = req.headers.user
        let instanceId = req.headers.instanceId
        let orders = null
        let dataToSave = {}
        let action = {}
        let webhookFailure = false

        try {
            if (data.orderId !== null && data.orderId !== undefined) {
                orders = await db.query('SELECT od.productCode, od.size, o.instanceId, o.userId, o.calzzapatoCode, o.fastShopping FROM OrderDetail AS od LEFT JOIN `Order` AS o ON o.id = od.orderId WHERE od.orderId = ?;', [data.orderId])
                user = { id: orders[0].userId }
                instanceId = orders[0].instanceId
                if (orders.length > 0) {
                    dataToSave.carrito = (orders[0].fastShopping === 1) ? false : true
                    dataToSave.userId = orders[0].userId
                    dataToSave.calzzapatoCode = orders[0].calzzapatoCode

                    if (orders[0].fastShopping === 1) {
                        dataToSave.size = orders[0].size
                        dataToSave.productCode = orders[0].productCode
                        dataToSave.quantity = 1

                    } else {
                        let orderDetail = await db.query('SELECT productCode, size FROM OrderDetail WHERE orderId = ?;', data.orderId)
                        let carts = await mongodb.mongoFind(mdb, 'Cart', { user: user.id, status: true })
                        if (carts.length > 0) {
                            dataToSave.products = orderDetail
                            dataToSave.quantity = orderDetail.length
                            dataToSave.carrito = carts[0]._id
                        }
                    }

                    if (orders[0].calzzapatoCode !== null && orders[0].calzzapatoCode !== undefined) {
                        data.action.paymentStatus = 'success'
                        dataToSave.status = false
                    }
                    // dataToSave.productCode = orders[0].productCode
                } else if (data.action !== undefined && data.action !== null && data.action.name === 'BUY' && data.action.paymentStatus === 'failure') {
                    // CASO FALLO
                    dataToSave.carrito = (data.cart) ? true : false
                    dataToSave.userId = user.id
                        (data.cart) ? dataToSave.products = data.products : dataToSave.productCode = data.productCode
                            (data.cart) ? dataToSave.quantity = data.products.length : 1
                    dataToSave.status = false
                    dataToSave.actions = [{ name: data.action.name, paymentStatus: data.action.paymentStatus, success: false, response: data.response }]
                    webhookFailure = true
                }
            } else if (data.action !== null && data.action !== undefined) {
                data.action.response = data.response
                data.action.createdAt = new Date()
                data.action.instanceId = instanceId

                dataToSave.userId = user.id
                dataToSave.productCode = data.productCode
                dataToSave.size = data.size
                dataToSave.status = (data.paymentStatus === 'success') ? false : true
            }
            // Get actions.
            if (!webhookFailure) {
                if (data.orderId !== null && data.orderId !== undefined) {
                    dataToSave.orderId = data.orderId
                    data.action.response = data.response
                    data.action.createdAt = new Date()
                    data.action.instanceId = instanceId
                }
                let userLogs = await mongodb.mongoFind(mdb, 'OrderLog', { userId: user.id, productCode: dataToSave.productCode, size: Number(dataToSave.size), status: true })
                if (userLogs.length > 0) {
                    if (data.action.name === 'BUY') {
                        dataToSave.intentos = Number(userLogs[0].intentos) + 1
                        action.response = data.response
                    }

                    dataToSave.actions = [...userLogs[0].actions, data.action]
                    console.log('Update in Mongo', dataToSave);
                    await mongodb.findAndUpdateMongoDB(mdb, 'OrderLog', { _id: ObjectId(userLogs[0]._id) }, {
                        '$set': dataToSave
                    })
                } else if (data.action.name !== 'BUY' || data.cart) {
                    if (data.action.name === 'BUY') {
                        dataToSave.intentos = 1
                    }
                    dataToSave.actions = [data.action]
                    console.log('Create in Mongo', dataToSave);
                    await mongodb.createMongoDB(Orderlog, dataToSave)
                }
            }
        } catch (error) {
            console.log(error)
        }
        
        await db.close()
        return response
    }

    Orderlog.remoteMethod('createOrderLog', {
        description: 'Add log to save hot shopping actions.',
        http: {
            path: '/add',
            verb: 'POST'
        },
        accepts: [
            { arg: 'data', type: "object", http: { source: 'body' }, require: true },
            { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })

};
