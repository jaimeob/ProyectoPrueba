'use strict'
const Utils = require('../Utils')
const moment = require('moment')
const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')
const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'
const mysql = require('../classes/mysql.js')


if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}

const configs = require('../configs.' + NODE_ENV + '.json')
const datasources = require(environment)
const  sendTrackingEmail = async (data) => {
    let db = await mysql.connectToDBManually()
    let response = []
    let start = new Date()
    start = moment(start).format()
    //Variables que se reciben
    let userEmail = data.email
    let title = `¡Hola ${data.name}!`
    let userOrder = data.trackingNumber
    let orderMsg = data.message
    let sendSms = data.sms //True o False
    let estimatedDelivery = data.estimatedDelivery
    //Dependiendo de la instancia cargo estas variables 
    let instanceName = null
    let logo = null
    let linkTracking = null
    //Traemos las instancias
    let instances = []
    try {

    
        instances = await db.query('SELECT i.id, i.uuid, i.domain, i.alias, c.businessUnit FROM Instance AS i LEFT JOIN Config AS c ON c.instanceId = i.id WHERE i.uuid = ? LIMIT 1;', [data.uuid])
        if (instances !== null && instances !== undefined && instances.length > 0) {
                //Depende la instancia cargare esto
                switch (data.uuid) {
                    case '054b980b-6f4e-4d0c-8d53-1915be4abea2':
                        //Calzzapato
                        logo = 'https://i.imgur.com/HcaXIcC.png'
                        instanceName = instances[0].alias
                        linkTracking = `https://${instances[0].domain}/tracking/${userOrder}`
                        break;
                    case '2b0c178e-516b-4673-b5be-46a298a159d1':
                        //Kelder
                        logo = 'https://i.imgur.com/fTJjfKf.jpeg'
                        instanceName = instances[0].alias
                        linkTracking = `https://${instances[0].domain}/tracking/${userOrder}`
                        break;
                    case 'e2a08434-976d-44cc-b1c0-16c5235b0b62':
                        //Urbanna
                        logo = 'https://i.imgur.com/qysCCJc.png'
                        instanceName = instances[0].alias
                        linkTracking = `https://${instances[0].domain}/tracking/${userOrder}`
                        break;
                    case 'e2a08434-976d-44cc-b1c0-16c5235b0b63':
                        //Calzzasport
                        logo = 'https://i.imgur.com/MvZqUio.png'
                        instanceName = instances[0].alias
                        linkTracking = `https://${instances[0].domain}/tracking/${userOrder}`
                        break;
                    case 'e2a08434-976d-44cc-b1c0-16c5235b0b64':
                        //Calzakids
                        logo = 'https://i.imgur.com/2iK6Chn.png'
                        instanceName = instances[0].alias
                        linkTracking = `https://${instances[0].domain}/tracking/${userOrder}`
                        break;
                    default:
                        logo = 'https://i.imgur.com/HcaXIcC.png'
                        linkTracking = `https://${instances[0].domain}`
                        break;
                }
            
        }
        let mail = {
            "logo": logo,
            "title": title,
            "message": orderMsg,
            "date": estimatedDelivery,
            "link": linkTracking,
            "logoTruck" :"https://imgur.com/MkqLyeL"
        }
        let filePath = path.join(__dirname, '../templates/tracking-mail.hbs')
        const source = fs.readFileSync(filePath, 'utf-8')
        const template = handlebars.compile(source)
        Utils.sendEmail({
            from: '"Calzzapato.com" <contacto@calzzapato.com>',
            to: userEmail,
            cco: 'contacto@calzzapato.com',
            subject: `${data.subjectTitle} - Calzzapato.com 👠`,
            template: template(mail)
        })
        if (sendSms) {
            Utils.request({
                url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/send-sms',
                method: 'POST',
                json: true,
                body: {
                    cellphone: '+526672297686',
                    message: `${orderMsg}, puede rastrear su pedido con este link: ${linkTracking}`
                }
            })
        }
        
    } catch (error) {
        console.log(error)
    }
    await db.close()
}
module.exports = ({ sendTrackingEmail })