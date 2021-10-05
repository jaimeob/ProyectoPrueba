'use strict'
const Utils = require('../Utils.js')
const moment = require('moment')
const path = require('path')
const mongo = require('mongodb')
var ObjectId = require('mongodb').ObjectID

const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'

if (NODE_ENV === 'staging') {
    environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
    environment = '../../server/datasources.json'
}

const configs = require('../configs.' + NODE_ENV + '.json')
const datasources = require(environment)

module.exports = function (Person) {

    Person.createPerson = async (data) => {
        let response = { created: false }
        console.log(data)
        // let db = await Utils.connectToDB()
        // await db.close()
        try {
            await Utils.createMongoDB(Person.app.models.Person, {
                name: data.name,
                businessId: data.businessId,
                gender: data.gender,
                age: data.age,
                prices: data.prices,
                categories: data.categories,
                brands: data.brands,
                attributes: data.attributes,
                createdAt: new Date(),
                status: true
            })
            response.created = true
        } catch (error) {
            console.log(error)
        }
        return response
    }

    Person.remoteMethod('createPerson', {
        description: 'Create person for profile.',
        http: {
            path: '/new',
            verb: 'POST'
        },
        accepts: [
            { arg: 'data', type: 'object', http: { source: 'body' }, required: true }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })

    Person.getPersons = async (req) => {
        let response = []
        try {
            let personResponse = await Utils.mongoFind('Person', {})
            if (personResponse.length > 0) {
                personResponse.forEach(element => {
                    if(element.status){
                        element.status = 'Activo'
                    } else {
                        element.status = 'Desactivado'
                    }
                })
                personResponse.sort(function (a, b) {
                    if (a.createdAt < b.createdAt) {
                      return 1
                    }
                    if (a.createdAt > b.createdAt) {
                      return -1
                    }
            
                    return 0
                  })
                response = personResponse
            }
        } catch (error) {
            console.log(error)
        }
        return response
    }

    Person.remoteMethod('getPersons', {
        description: 'Get all the persons modules.',
        http: {
            path: '/all',
            verb: 'GET'
        },
        accepts: [
            { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
        ],
        returns: {
            arg: 'data',
            type: ['Object'],
            root: true
        }
    })

    Person.getPersonsById = async (id) => {
        let response = null
        try {
            let personResponse = await Utils.mongoFind('Person', {_id: ObjectId(id)})
            if (personResponse.length > 0) {
                response = personResponse[0]   
            }
        } catch (error) {
            console.log(error)
        }
        return response
    }

    Person.remoteMethod('getPersonsById', {
        description: 'Get person by id.',
        http: {
            path: '/:id/',
            verb: 'GET'
        },
        accepts: [
            { arg: 'id', type: 'string', required: true }
        ],
        returns: {
            arg: 'data',
            type: ['Object'],
            root: true
        }
    })

    Person.changeStatus = async (id) => {
        let response = { updated: false }
        try {
            let personResponse = await Utils.mongoFind('Person', {_id: ObjectId(id)})
            if (personResponse.length > 0) {
                personResponse[0].status = !personResponse[0].status
                await Utils.updateMongoDb(Person.app.models.Person, personResponse[0], ObjectId(id))
                response.updated = true
            }
        } catch (error) {
            console.log(error)
        }
        return response
    }

    Person.remoteMethod('changeStatus', {
        description: 'Change person status',
        http: {
            path: '/:id/',
            verb: 'PATCH'
        },
        accepts: [
            { arg: 'id', type: 'string', required: true }
        ],
        returns: {
            arg: 'data',
            type: ['Object'],
            root: true
        }
    })

}
