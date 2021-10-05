'use strict'
const Utils = require('../Utils.js')
var ObjectId = require('mongodb').ObjectID
const moment = require('moment')
const giveawayClasses = require('../../common/classes/giveaway')
const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'

if (NODE_ENV === 'staging') {
    environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
    environment = '../../server/datasources.json'
}

const configs = require('../configs.' + NODE_ENV + '.json')
const datasources = require(environment)


module.exports = function (Giveaway) {


    Giveaway.createGiveaway = async (data) => {
        let response = { created: false }
        data.status = 0
        data.path = data.name.replace(/ /g, '-').toLowerCase()
        try {
            let insertMongo = await Utils.createMongoDB(Giveaway.app.models.Giveaway, data)
            if (insertMongo.success) {
                response.created = true
            }
        } catch (error) {
            console.log(error)
        }
        return response

    }


    Giveaway.getAllGiveaways = async () => {
        let response = []
        try {
            let giveaways = await Utils.mongoFind('Giveaway', {})
            if (giveaways.length > 0) {
                response = giveaways
            }
        } catch (error) {
            console.log(error)
        }
        return response

    }

    Giveaway.getGiveawayById = async (id) => {
        let response = null
        try {
            let giveaways = await Utils.mongoFind('Giveaway', { _id: ObjectId(id) })
            if (giveaways.length > 0) {
                response = giveaways[0]
            }
        } catch (error) {
            console.log(error)
        }
        return response

    }


    Giveaway.getTicketsUser = async (id) => {
        let response = []
        try {
            let giveawayParam = ObjectId(id)
            let ticketsArray = await Utils.mongoFind('participants', { giveawayId: giveawayParam })
            let tickArray = []
            ticketsArray.forEach(participant => {
                let total = 0
                let idUser = ""
                let name = ""
                participant.tickets.forEach(ticket => {
                    total += ticket.amount
                    idUser = participant.client
                })

                tickArray.push({
                    idUser: participant.userId,
                    name: participant.name,
                    totalAmount: total,
                    tickets: participant.tickets,
                })

            })

            return response.tickArray = tickArray

        } catch (error) {
            console.log(error)
        }
        return response

    }

    Giveaway.updateGiveaway = async (data, id) => {
        let response = { updated: false }
        try {
            let giveaway = await Utils.updateMongoDb(Giveaway.app.models.Giveaway, data, ObjectId(id))
            if (Utils.isEmpty(giveaway)) {
                response.updated = true
            }
        } catch (error) {
            console.log(error)
        }
        return response
    }


    Giveaway.sortTicket = async (id) => {
        let response = { created: false }
        try {

            let giveawayParam = ObjectId(id)
            let giveawayArr = await Utils.mongoFind('Giveaway', { _id: giveawayParam })
            let giveaway = null
            if (giveawayArr.length > 0) {
                giveaway = giveawayArr[0]
            }

            let participants = await Utils.mongoFind('participants', { giveawayId: giveawayParam })

            if (participants.length > 0) {

                let ticketsArray = participants.map(p => ({ ...p.tickets, userId: p.userId, name: p.name }))
                let winners = []

                for (let i = 0; i < giveaway.totalWinners; i++) {
                    let rand = Math.floor(Math.random() * ticketsArray.length)
                    winners.push(ticketsArray[rand])
                    ticketsArray = ticketsArray.filter(t => t.userId !== ticketsArray[rand].userId) // This delete all tickets of participant
                }

                giveaway.winner = winners
                giveaway.status = Utils.Constants.Status.ENDED
                await Utils.updateMongoDb(Giveaway.app.models.Giveaway, giveaway, giveawayParam)
                response.giveaway = giveaway
                response.created = true
            } else {
                response.error = 'No hay participantes para sortear'
            }

        } catch (error) {
            console.log(error)
        }
        return response

    }

    Giveaway.getGiveawayTotals = async (id) => {
        let response = {}
        try {
            let ticketsArray = await Utils.mongoFind('participants', { giveawayId: ObjectId(id) })
            let totalParticipants = ticketsArray.length
            let totalAmount = 0
            let totalTickets = 0
            ticketsArray.forEach(ticketarr => {
                ticketarr.tickets.forEach(ticket => {
                    totalAmount += ticket.amount
                    totalTickets += 1
                })
            })

            let totalGiveaway = totalAmount
            let avgTickets = totalTickets / totalParticipants
            totalAmount = totalAmount / totalTickets
            if (avgTickets === null || isNaN(avgTickets)) {
                avgTickets = 0
            }
            let totals = { totalParticipants, totalAmount, totalTickets, totalGiveaway, avgTickets }
            response.totals = totals
        } catch (error) {
            console.log(error)
        }
        return response

    }


    Giveaway.getTicketsByUuid = async (id, uuid) => {
        let response = {}
        try {
            let giveawayParam = ObjectId(id)
            let ticketsArray = await Utils.mongoFind('participants', { giveawayId: giveawayParam }, { tickets: 1 })
            let tickets = []
            ticketsArray.forEach(p => {
                p.tickets.forEach(ticket => {
                    if (ticket.instance === uuid) {
                        ticket.createdAt = moment(ticket.createdAt).format('DD-MM-YYYY')
                        tickets.push(ticket)
                    }
                })
            })
            response.tickets = tickets

        } catch (error) {
            console.log(error)
        }
        return response
    }

    Giveaway.getGiveawayByUuid = async (name, uuid) => {
        let response = {}
        try {
            let giveaway = await Utils.mongoFind('Giveaway', { path: name, "instances.uuid": uuid })
            response.giveaway = giveaway[0]

        } catch (error) {
            console.log(error)
        }
        return response

    }

    Giveaway.registerTicket = async (data) => {
        let response = {
            created: false,
            error: null
        }

        const { ticket, giveawayId, amount, userId } = data.data

        try {
            let db = await Utils.connectToDB({
                host: datasources.ecommerce.host,
                port: datasources.ecommerce.port,
                database: datasources.ecommerce.database,
                user: datasources.ecommerce.user,
                password: datasources.ecommerce.password
            })

            let user = await db.query(`SELECT Name, firstLastName, secondLastName FROM User WHERE id = ?`, [userId])
            await db.close()

            let giveawayArr = await Utils.mongoFind('Giveaway', { path: giveawayId })
            let giveaway = null

            if (giveawayArr.length > 0) {
                giveaway = giveawayArr[0]
            }

            if (giveaway !== null) {

                // const tt = await Participants.count({ "tickets.ticketid": ticket })
                let ticketsArray = []
                let tt = await Utils.mongoFind('participants', { giveawayId: ObjectId(giveaway._id) })
                tt.forEach(participant => {
                    participant.tickets.forEach(t => {
                        ticketsArray.push(t)
                    })
                })               

                const found = ticketsArray.some(el => el.ticketid === ticket)

                if (found) {
                    response.error = "El ticket ya está registrado"
                    response.status = 400
                    response.created = false
                }

                let ticketDetail = await giveawayClasses.createCalzzapatoCoupon(ticket)
                if (ticketDetail.cliente === null) {
                    response.error = "El ticket no es válido"
                    response.status = 400,
                    response.created = false
                }

                if (ticketDetail.status === false && response.error === null) {
                    response.error = "La compra está cancelada"
                    response.status = 400
                    response.created = false

                }

                if (ticketDetail.importeCompra !== amount && response.error === null) {
                    response.error = "El importe no coincide con tu folio de compra"
                    response.status = 400
                    response.created = false
                }

                if (giveaway.minimumRequired && ticketDetail.importeCompra < giveaway.minimumAmount && response.error === null) {
                    response.error = `Tu compra debe ser por un minimo de ${giveaway.minimumAmount} para participar`
                    response.status = 400
                    response.created = false
                }

                if (response.error === null) {

                    let participant = await Utils.mongoFind('participants', { userId, giveawayId: ObjectId(giveaway._id) })

                    if (participant === null || participant.length === 0) {
                        let dataParticipant = { userId, giveawayId: giveaway._id, status: 0, name: user[0].Name + ' ' + user[0].firstLastName + ' ' + user[0].secondLastName }
                        let participante = await Utils.createMongoDB(Giveaway.app.models.Participants, dataParticipant)
                        participant = participante.data
                    } else {
                        participant = participant[0]
                    }

                    let instance = Utils.unidadToInstance(ticketDetail.idUnidadDeNegocio)
                    if (giveaway.instances.find(i => i.uuid == instance) == null) {
                        response.error = 'Este ticket no pertenece a esta tienda'
                        response.status = 400
                        response.created = false
                    }

                    if (participant.tickets === undefined && response.error === null) {
                        participant.tickets = []
                    }

                    participant.tickets.push({
                        ticketid: ticket,
                        client: ticketDetail.cliente,
                        clientName: ticketDetail.nombreCliente,
                        amount: ticketDetail.importeCompra,
                        branch: ticketDetail.cSucursal,
                        purchaseDate: moment(ticketDetail.fechaCompra).toDate(),
                        instance: instance,
                        createdAt: new Date(),
                    })

                    if (participant.id != undefined) {
                        try {
                            let participantUpdate = {
                                userId: participant.userId,
                                giveawayId: participant.giveawayId,
                                status: participant.status,
                                tickets: participant.tickets
                            }

                            participant = await Utils.updateMongoDb(Giveaway.app.models.Participants, participantUpdate, ObjectId(participant.id))

                        } catch (error) {
                            console.log(error)
                        }

                    } else {
                        participant = await Utils.updateMongoDb(Giveaway.app.models.Participants, participant, ObjectId(participant._id))
                    }
                }

            } else {
                response.error = "La ruta del giveaway no es valida"
                response.status = 400
            }

        } catch (err) {
            console.log(err, "error")
        }

        return response

    }


    //////////////////////// remote Methods  //////////////// //////////////// //////////////// //////////////// //////////////// 

    Giveaway.remoteMethod('createGiveaway', {
        description: 'Create giveaway.',
        http: {
            path: '/new/',
            verb: 'POST'
        },
        accepts: [
            { arg: 'data', type: 'object', http: { source: 'body' } }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })


    Giveaway.remoteMethod('getAllGiveaways', {
        description: 'Create giveaway.',
        http: {
            path: '/all',
            verb: 'GET'
        },
        accepts: [
            { arg: 'data', type: 'object', http: { source: 'body' } }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })

    Giveaway.remoteMethod('updateGiveaway', {
        description: 'Update giveaway.',
        http: {
            path: '/:id',
            verb: 'PATCH'
        },
        accepts: [
            { arg: 'data', type: 'object', http: { source: 'body' } },
            { arg: 'id', type: 'string', required: true }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })


    Giveaway.remoteMethod('getGiveawayById', {
        description: 'Get giveawayById .',
        http: {
            path: '/:id/',
            verb: 'GET'
        },
        accepts: [
            { arg: 'id', type: 'string', required: true }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })

    Giveaway.remoteMethod('getTicketsUser', {
        description: 'getTicketsUser .',
        http: {
            path: '/ticket-user/:id',
            verb: 'GET'
        },
        accepts: [
            { arg: 'id', type: 'string', required: true }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })

    Giveaway.remoteMethod('sortTicket', {
        description: 'sortTicket .',
        http: {
            path: '/sort-ticket/:id',
            verb: 'POST'
        },
        accepts: [
            { arg: 'id', type: 'string', required: true }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })

    Giveaway.remoteMethod('getTicketInfo', {
        description: 'getTicketInfo .',
        http: {
            path: '/ticket-info/:id/',
            verb: 'GET'
        },
        accepts: [
            { arg: 'id', type: 'string', required: true }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })

    Giveaway.remoteMethod('getGiveawayTotals', {
        description: 'getGiveawayTotals .',
        http: {
            path: '/getGiveawayTotals/:id/',
            verb: 'GET'
        },
        accepts: [
            { arg: 'id', type: 'string', required: true }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })

    Giveaway.remoteMethod('getTicketsByUuid', {
        description: 'getTicketsByUuid .',
        http: {
            path: '/:id/tickets-uuid/:uuid/',
            verb: 'GET'
        },
        accepts: [
            { arg: 'id', type: 'string', required: true },
            { arg: 'uuid', type: 'string', required: true }

        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })

    Giveaway.remoteMethod('getGiveawayByUuid', {
        description: 'getTicketsByUuid .',
        http: {
            path: '/:name/giveaway-uuid/:uuid/',
            verb: 'GET'
        },
        accepts: [
            { arg: 'name', type: 'string', required: true },
            { arg: 'uuid', type: 'string', required: true }

        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })

     Giveaway.remoteMethod('registerTicket', {
        description: 'registerTicket .',
        http: {
            path: '/register-ticket',
            verb: 'POST'
        },
        accepts: [
            { arg: 'data', type: 'object', http: { source: 'body' } }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })
}
