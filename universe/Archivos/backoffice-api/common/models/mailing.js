'use strict';
const NODE_ENV = process.env.NODE_ENV || 'development'
let environment = '../../server/datasources.development.json'
const Utils = require('../Utils.js')
const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')
const moment = require('moment')
const mongo = require('mongodb')



if (NODE_ENV === 'staging') {
    environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
    environment = '../../server/datasources.json'
}

const configs = require('../configs.' + NODE_ENV + '.json')
const datasources = require(environment)
const mailClasses = require('../classes/mailing')
const productClasses = require('../classes/products')
let CDN = require('../classes/cdn.js');
const { forEach } = require('mysql2/lib/constants/charset_encodings');


// let instanceId = businessUnit[0].id
// let alias = businessUnit[0].alias.trim().toLowerCase()
// businessUnit = businessUnit[0].businessUnit

module.exports = (Mailing) => {

    Mailing.sendEmails = async (data) => {
   

        if (data.images !== undefined && data.images.length > 0) {
            await Utils.asyncForEach(data.images, async (image) => {

                let uploadData = {
                    name: 'cms/' + 'calzzapato' + '/' + Date.now() + '.webp',
                    data: image.data,
                    contentType: image.type
                }

                let cdnUpload = await CDN.upload(uploadData, Mailing.app.models.CDN, {
                    instanceId: '054b980b-6f4e-4d0c-8d53-1915be4abea2',
                    fileName: image.name
                }, {
                    instanceId: '054b980b-6f4e-4d0c-8d53-1915be4abea2',
                    documentTypeId: image.documentTypeId,
                    fileName: image.name,
                    fileType: image.type,
                    fileSize: image.size,
                    height: image.height,
                    width: image.width,
                    url: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: true
                })

                if (cdnUpload.success) {
                    image.data = cdnUpload.data.url
                }
            });
        }

        let response = { created: false }

        let db = Utils.connectToDB({
            host: datasources.ecommerce.host,
            port: datasources.ecommerce.port,
            database: datasources.ecommerce.database,
            user: datasources.ecommerce.user,
            password: datasources.ecommerce.password
        })

        try {
            /// PRODUCTOS ///////////////////////
            let users = []
            ////ORIENTACION /////////////////
            switch (data.orientationValue) {
                case 'all':
                    users = await mailClasses.getAllUsers(db)
                    break;
                case 'lastPurshase':
                    users = await mailClasses.getLastPurshaseUsers(db)
                    break;
                case 'city':
                    users = await mailClasses.getCityUsers(db, data.municipalitySelected)
                    break;
                case 'noPurshase':
                    users = await mailClasses.getNoPurshaseUsers(db)
                    break;
                case 'withFacebook':
                    users = await mailClasses.getWithFacebookUsers(db)

                    break;
                case 'withoutFacebook':
                    users = await mailClasses.getWithoutFacebookUsers(db)
                    break;
                case 'newsletter':
                    users = await mailClasses.getNewsletterUsers(db)
                    break;
                default:
                    break;
            }

            //////////// PRODUCTOS ////////////////////

            let products = []
            let title = "¡Hola!"
            let description = ""
            let buttonText = ""

            if (users !== undefined || users !== null || users.length > 0) {

                switch (data.productValue) {
                    case 'productsRealation':
                        products = await productClasses.getProductsRelation(db, users)
                        description = "Tenemos productos recomendados para ti"
                        buttonText = "Continuar comprando"
                        break;
                    case 'seenProducts':
                        products = await productClasses.getSeenProducts(db, users)
                        description = "Tenemos productos recomendados para ti"
                        buttonText = "Continuar comprando"
                        break;
                    case 'lostCar':
                        products = await productClasses.getLostCar(db, users)
                        description = "Parece que has olvidado algo en tu carrito"
                        buttonText = "¡Completar compra!"
                        break;
                    case 'offer':
                        products = await productClasses.getOffer(db, users)
                        description = "Tenemos los siguientes productos en oferta"
                        buttonText = "Explorar ofertas"
                        break;
                }

                response.products = products
                response.users = users
                let infoArray = []


                if (data.productValue === "offer") {
                    users.forEach(user => {
                        infoArray.push({ body: products, email: user.email })
                    });
                } else {
                    infoArray = products
                }


                for (let index = 0; index < infoArray.length; index++) {
                    const product = infoArray[index];
                   

                    let mail = {
                        "logo": "https://i.imgur.com/HcaXIcC.png",
                        "products": product.body,
                        "myAccount": 'https://www.calzzapato.com/mi-cuenta',
                        "offers": 'https://www.calzzapato.com/todos?csa=eyJwZyI6MCwibCI6NTAsInUiOm51bGwsImMiOm51bGwsImJjIjpudWxsLCJiciI6W10sInNjIjpbXSwiYiI6W10sImEiOltdLCJzIjpbXSwicCI6W10sImciOltdLCJvIjp0cnVlLCJicCI6ZmFsc2UsIm9iIjoiYmVzdE9mZmVyIn0=',
                        "home": 'https://www.calzzapato.com',
                        "images": data.images,
                        "type": data.products,
                        "title": title,
                        "description": description,
                        "buttonText": buttonText,
                    }
                    
                    let filePath = data.productValue === "offer" ? path.join(__dirname, '../templates/mailing-design-offer.hbs') : path.join(__dirname, '../templates/mailing-design.hbs')
                    const source = fs.readFileSync(filePath, 'utf-8')
                    
                    const template = handlebars.compile(source)

                    Utils.sendEmail({
                        from: '"Calzzapato.com" <contacto@calzzapato.com>',
                        to: product.email,
                        cco: 'contacto@calzzapato.com',
                        subject: `${data.subject} - Calzzapato.com 👠`,
                        template: template(mail)
                    })
                }

                if (users.length === 0) {
                    response.created = false
                } else {

                    await Utils.createMongoDB(Mailing.app.models.Mailing,
                        {
                            campaign: data.campaign,
                            subject: data.subject,
                            orientationValue: data.orientationValue,
                            productValue: data.productValue,
                            createdAt: new Date(),
                            emails: users.length,
                            responsable: data.user,
                            images: data.images
                        })
                    response.created = true
                }

            } else {
                response.created = false
            }


        } catch (error) {
            console.log(error)
        }
        await db.close()
        return response

    }
    //////////////////////// remote Methods  //////////////// //////////////// //////////////// //////////////// //////////////// 

    Mailing.remoteMethod('sendEmails', {
        description: 'SEND EMAILS',
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


    Mailing.getAllStates = async () => {

        let response = { created: false }
        let db = Utils.connectToDB({
            host: datasources.ecommerce.host,
            port: datasources.ecommerce.port,
            database: datasources.ecommerce.database,
            user: datasources.ecommerce.user,
            password: datasources.ecommerce.password
        })

        try {

            let states = await db.query(`SELECT * FROM State;`)
            if (states.length !== 0) {
                response = states
            }

        } catch (error) {
            console.log(error)
        }
        //CERRADO
        await db.close()
        return response
    }


    Mailing.remoteMethod('getAllStates', {
        description: 'All STATES',
        http: {
            path: '/states',
            verb: 'GET'
        },
        accepts: [
        ],
        returns: {
            arg: 'response',
            type: 'object',
            root: true
        }
    })


    Mailing.getAllMunicipality = async (data) => {
        let response = { created: false }
        let db = await Utils.connectToDB({
            host: datasources.ecommerce.host,
            port: datasources.ecommerce.port,
            database: datasources.ecommerce.database,
            user: datasources.ecommerce.user,
            password: datasources.ecommerce.password
        })


        try {
            let municipalityArray = await db.query("SELECT * FROM Municipality WHERE stateCode = ?;", [data.state])
            if (municipalityArray.length !== 0) {
                let munArray = []
                municipalityArray.forEach(mun => {
                    munArray.push({ value:mun.id,label:mun.name})
                });
                response = munArray
            }

        } catch (error) {
            console.log(error)
        }
        //CERRADO
        await db.close()
        return response
    }

    Mailing.remoteMethod('getAllMunicipality', {
        description: 'All MUNICIPALITY',
        http: {
            path: '/municipality',
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


    Mailing.getEmails = async (data) => {
        let response = { created: false }
       
        try {
            let mails = []
            if (Utils.isEmpty(data) || data.campaign === "" || data.campaign === undefined) {
                mails = await Utils.mongoFind('mailing', {})
            } else {
                let findParams = {}
                if (data.campaign) findParams.campaign = { $regex: `.*${data.campaign}.*` }
                mails = await Utils.mongoFind('mailing', findParams)
            }

            //campaign
            if (mails.length !== 0) {
                mails.forEach(mail => {
                    mail.createdAtFormated = moment(mail.createdAt).locale('es').format('dddd DD [de] MMMM YYYY')
                });

                response = mails
                response.created = true
            }

        } catch (err) {
            response.error = err
            console.log(err)
        }

        return response
    }



    Mailing.remoteMethod('getEmails', {
        description: 'GET ALL EMAILS',
        http: {
            path: '/emails',
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


    Mailing.getEmailById = async (data) => {
        let response = { created: false }
        try {
            let mails = []

            if (data.id !== "") {
                mails = await Utils.mongoFind('mailing', { _id: new mongo.ObjectID(data.id) })
            }
            //campaign
            if (mails.length !== 0) {
                mails.forEach(mail => {
                    mail.createdAtFormated = moment(mail.createdAt).locale('es').format('dddd DD [de] MMMM YYYY')
                });

                response = mails[0]
                response.created = true
            }

        } catch (err) {
            response.error = err
            console.log(err)
        }

        return response
    }

    Mailing.remoteMethod('getEmailById', {
        description: 'GET ONE EMAIL ',
        http: {
            path: '/mail/',
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

};
