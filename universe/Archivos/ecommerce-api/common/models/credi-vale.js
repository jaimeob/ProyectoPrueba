'use strict'

const Utils = require('../Utils.js')
const mysql = require('../classes/mysql.js')
const convert = require('xml-js')
const handlebars = require('handlebars')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')
const uuid = require('uuid')
const CDN = require('../classes/cdn.js')

module.exports = (CrediVale) => {
  CrediVale.validateCrediValeAdvance = async (data) => {
    let response = null
    let body = '<?xml version="1.0" encoding="utf-8"?>\
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">\
      <soap12:Body>\
        <ValidaCredivaleDatos xmlns="citrix6.calzzapato.com/">\
          <aplicacion>' + configs.webServiceMayoristaApplication + '</aplicacion>\
          <password>' + configs.webServiceMayoristaPassword + '</password>\
          <FolioVale>'+ data.data.folio + '</FolioVale>\
          <Importe>'+ data.data.amount + '</Importe>\
        </ValidaCredivaleDatos>\
      </soap12:Body>\
    </soap12:Envelope>'

    try {
      let clzWebService = await Utils.request({
        url: configs.webServiceMayoristaURL + '?op=ValidaCredivaleDatos',
        method: 'POST',
        headers: {
          "content-type": "text/xml"
        },
        body: body
      })

      if (clzWebService.body !== undefined) {
        let result = convert.xml2json(clzWebService.body, { compact: true, spaces: 4 })
        result = JSON.parse(result)
        let message = result['soap:Envelope']['soap:Body']['ValidaCredivaleDatosResponse']['ValidaCredivaleDatosResult']
        response = message
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    if (response.error) {
      throw response.error
    } else {
      return response
    }
  }

  CrediVale.remoteMethod('validateCrediValeAdvance', {
    description: 'Validación de CrediVale con folio y monto',
    http: {
      path: '/validate-advance',
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

  CrediVale.validateCrediVale = async (data) => {
    let response = { validate: false }
    let body = '<?xml version="1.0" encoding="utf-8"?>\
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">\
      <soap12:Body>\
        <isValidCredivale xmlns="citrix6.calzzapato.com/">\
          <aplicacion>' + configs.webServiceMayoristaApplication + '</aplicacion>\
          <password>' + configs.webServiceMayoristaPassword + '</password>\
          <sFolioVale>'+ data.data.folio + '</sFolioVale>\
          <iImporte>'+ data.data.amount + '</iImporte>\
        </isValidCredivale>\
      </soap12:Body>\
    </soap12:Envelope>'

    try {
      let clzWebService = await Utils.request({
        url: configs.webServiceMayoristaURL + '?op=isValidCredivale',
        method: 'POST',
        headers: {
          "content-type": "text/xml"
        },
        body: body
      })

      if (clzWebService.body !== undefined) {
        let result = convert.xml2json(clzWebService.body, { compact: true, spaces: 4 })
        result = JSON.parse(result)
        let message = result['soap:Envelope']['soap:Body']['isValidCredivaleResponse']['isValidCredivaleResult']
        response = {
          validate: Boolean(message['bValido']['_text']),
          message: message['sDescripcion']['_text']
        }
      }
    } catch (err) {
      response.error = err
    }

    if (response.error) {
      throw response.error
    } else {
      return response
    }
  }

  CrediVale.remoteMethod('validateCrediVale', {
    description: 'Validación de CrediVale con folio y monto',
    http: {
      path: '/validate',
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

  CrediVale.requestForCrediVale = async(req, data) => {
    data = data.data
    let instanceId = req.headers.instanceId
    const db = mysql.connectToDBManually()

    try {
      let zoneCodes = [
        { name: 'Culiacán', email: 'gerenciaculiacan@calzzapato.com' },
        { name: 'Tepic', email: 'creditotepic@calzzapato.com' },
        { name: 'Navolato', email: 'creditonavolato@calzzapato.com' },
        { name: 'Costa Rica', email: 'creditocostarica@calzzapato.com' },
        { name: 'El Dorado', email: 'creditoeldorado@calzzapato.com' },
        { name: 'Los Mochis', email: 'creditomochis@calzzapato.com' },
        { name: 'Guamuchil', email: 'creditoguamuchil@calzzapato.com' },
        { name: 'Guasave', email: 'creditoguasave@calzzapato.com' },
        { name: 'Huatabampo', email: 'creditohuatabampo@calzzapato.com' },
        { name: 'Navojoa', email: 'creditoonavojoa@calzzapato.com' },
        { name: 'Ciudad Obregón', email: 'creditoobregon@calzzapato.com' },
        { name: 'Guaymas', email: 'creditoguaymas@calzzapato.com' },
        { name: 'Hermosillo', email: 'creditohermosillo@calzzapato.com' },
        { name: 'Caborca', email: 'creditocaborca@calzzapato.com' },
        { name: 'Tijuana', email: 'creditotijuana@calzzapato.com' },
        { name: 'Ensenada', email: 'creditoensenada@calzzapato.com' },
        { name: 'Mexicali', email: 'creditomexicali@calzzapato.com.mx' },
        { name: 'La Cruz', email: 'creditolacruz@calzzapato.com' },
        { name: 'Mazatlán', email: 'creditomazatlan@calzzapato.com' },
        { name: 'Vallarta', email: 'creditovallarta@calzzapato.com' },
        { name: 'Los Cabos San Lucas', email: 'creditocabos@calzzapato.com' },
        { name: 'La Paz', email: 'creditolapaz@calzzapato.com' },
        { name: 'San Jose Los Cabos', email: 'creditosanjose@calzzapato.com' },
        { name: 'El Fuerte', email: 'creditoelfuerte@calzzapato.com.mx' },
      ]

      let cityEmail = zoneCodes.find(x => x.name === data.cityName)
      
      if (cityEmail !== undefined) {
        let folio = Date.now()
        let attachments = []

        if (data.documents.ineFront.data !== undefined) {
          data.documents.ineFront.name = uuid.v4()
          // Upload mobile image own cdn
          let extencion = data.documents.ineFront.type.split('/')[1]
          let uploadData = {
            name: 'credivale/' + folio + '/ine-enfrente-' + data.documents.ineFront.name + '.' + extencion,
            data: data.documents.ineFront.data,
            contentType: data.documents.ineFront.type
          }
          
          let cdnUpload = await CDN.upload(uploadData, CrediVale.app.models.CDN, {
            instanceId: instanceId,
            fileName: data.documents.ineFront.name
          }, {
            instanceId: instanceId,
            documentTypeId: configs.documents.INE_FRONT,
            fileName: data.documents.ineFront.name,
            fileType: data.documents.ineFront.type,
            fileSize: data.documents.ineFront.size,
            height: data.documents.ineFront.height,
            width: data.documents.ineFront.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            data.documents.ineFront = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: data.documents.ineFront.size,
              width: data.documents.ineFront.width,
              height: data.documents.ineFront.height
            }

            attachments.push({
              filename: 'ine-enfrente-' + folio + '.' + extencion,
              path: data.documents.ineFront.url
            })
          }
        }

        if (data.documents.ineBack.data !== undefined) {
          data.documents.ineBack.name = uuid.v4()
          // Upload mobile image own cdn
          let extencion = data.documents.ineBack.type.split('/')[1]
          let uploadData = {
            name: 'credivale/' + folio + '/ine-atras-' + data.documents.ineBack.name + '.' + extencion,
            data: data.documents.ineBack.data,
            contentType: data.documents.ineBack.type
          }
          
          let cdnUpload = await CDN.upload(uploadData, CrediVale.app.models.CDN, {
            instanceId: instanceId,
            fileName: data.documents.ineBack.name
          }, {
            instanceId: instanceId,
            documentTypeId: configs.documents.INE_BACK,
            fileName: data.documents.ineBack.name,
            fileType: data.documents.ineBack.type,
            fileSize: data.documents.ineBack.size,
            height: data.documents.ineBack.height,
            width: data.documents.ineBack.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            data.documents.ineBack = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: data.documents.ineBack.size,
              width: data.documents.ineBack.width,
              height: data.documents.ineBack.height
            }

            attachments.push({
              filename: 'ine-atras-' + folio + '.' + extencion,
              path: data.documents.ineBack.url
            })
          }
        }

        if (data.documents.addressProof.data !== undefined) {
          data.documents.addressProof.name = uuid.v4()
          // Upload mobile image own cdn
          let extencion = data.documents.addressProof.type.split('/')[1]
          let uploadData = {
            name: 'credivale/' + folio + '/comprobante-domicilio-' + data.documents.addressProof.name + '.' + extencion,
            data: data.documents.addressProof.data,
            contentType: data.documents.addressProof.type
          }
          
          let cdnUpload = await CDN.upload(uploadData, CrediVale.app.models.CDN, {
            instanceId: instanceId,
            fileName: data.documents.addressProof.name
          }, {
            instanceId: instanceId,
            documentTypeId: configs.documents.ADDRESS_PROOF,
            fileName: data.documents.addressProof.name,
            fileType: data.documents.addressProof.type,
            fileSize: data.documents.addressProof.size,
            height: data.documents.addressProof.height,
            width: data.documents.addressProof.width,
            url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: true
          })

          if (cdnUpload.success) {
            data.documents.addressProof = {
              cdn: cdnUpload.data.id,
              url: cdnUpload.data.url,
              size: data.documents.addressProof.size,
              width: data.documents.addressProof.width,
              height: data.documents.addressProof.height
            }

            attachments.push({
              filename: 'comprobante-domicilio-' + folio + '.' + extencion,
              path: data.documents.addressProof.url
            })
          }
        }

        console.log(data.documents)
        
        await db.query('INSERT INTO CrediValeLead (instanceId, folio, name, firstLastName, secondLastName, birthday, location, ineFront, ineBack, addressProof, email, cellphone, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [
          instanceId,
          folio,
          data.name,
          data.firstLastName,
          data.secondLastName,
          data.birthday,
          data.location,
          String(data.documents.ineFront.cdn),
          String(data.documents.ineBack.cdn),
          String(data.documents.addressProof.cdn),
          data.email,
          data.cellphone,
          data.schedule
        ])

        let template = await Utils.readFile(__dirname + '/../templates/solicitud-credivale-cliente.hbs')
        template = handlebars.compile(template)

        Utils.sendEmail({
          from: '"Calzzapato.com" <contacto@calzzapato.com>',
          to: data.email,
          subject: '¡Recibimos tu solicitud CrediVale¡ Tu folio es: ' + folio,
          template: template({
            folio: folio
          })
        })

        Utils.request({
          method: 'POST',
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/send-sms',
          json: true,
          body: {
            cellphone: '+52' + data.cellphone,
            message: 'TU FOLIO ES: ' + folio + '. UN ASESOR CREDIVALE SE PONDRA EN CONTACTO CONTIGO.'
          }
        })

        let fullName = data.name.trim().toUpperCase() + ' ' + data.firstLastName.trim().toUpperCase() + ' ' + data.secondLastName.trim().toUpperCase()
        let cities = await db.query('SELECT name FROM Municipality WHERE municipalityStateCode = ? AND status = 1 LIMIT 1', [
          data.location
        ])

        await db.close()

        template = await Utils.readFile(__dirname + '/../templates/solicitud-credivale-staff.hbs')
        template = handlebars.compile(template)

        let emails = 'j@welcometolevel.com'
        if (process.env.NODE_ENV === 'production') {
          emails = 'credivaleprospectacion@gmail.com,j@welcometolevel.com,' + cityEmail.email
        }

        /*
        let attachments = []
        let uploadFile = null
        
        if (data.documents.ineFront !== null) {
          uploadFile = await CDN.createFileIntoCDN(data.documents.ineFront.name, '/solicitudes/' + folio, data.documents.ineFront.data)
          if (uploadFile.success) {
            let extencion = data.documents.ineFront.type.split('/')[1]
            attachments.push({
              filename: 'ine-enfrente-' + folio + '.' + extencion,
              path: configs.HOST_IP + ':' + configs.PORT_IP + uploadFile.url
            })
          }
        }

        if (data.documents.ineBack !== null) {
          uploadFile = await CDN.createFileIntoCDN(data.documents.ineBack.name, '/solicitudes/' + folio, data.documents.ineBack.data)
          if (uploadFile.success) {
            let extencion = data.documents.ineBack.type.split('/')[1]
            attachments.push({
              filename: 'ine-atras-' + folio + '.' + extencion,
              path: configs.HOST_IP + ':' + configs.PORT_IP + uploadFile.url
            })
          }
        }

        if (data.documents.addressProof !== null) {
          uploadFile = await CDN.createFileIntoCDN(data.documents.addressProof.name, '/solicitudes/' + folio, data.documents.addressProof.data)
          if (uploadFile.success) {
            let extencion = data.documents.addressProof.type.split('/')[1]
            attachments.push({
              filename: 'comprobante-domicilio-' + folio + '.' + extencion,
              path: configs.HOST_IP + ':' + configs.PORT_IP + uploadFile.url
            })
          }
        }
        */

        Utils.sendEmail({
          from: '"Calzzapato.com" <contacto@calzzapato.com>',
          to: emails,
          subject: 'Nueva solicitud web CrediVale - Folio: ' + folio,
          template: template({
            folio: folio,
            name: fullName.trim(),
            birthday: data.birthday,
            city: cities[0].name.toUpperCase(),
            email: data.email.toUpperCase(),
            cellphone: data.cellphone,
            schedule: data.schedule
          }),
          attachments: attachments
        })

        return { success: true }
      } else {
        await db.close()
        return { success: false, outZone: true }
      }
    } catch (err) {
      console.log(err)
      await db.close()
      return { success: false }
    }
  }

  CrediVale.remoteMethod('requestForCrediVale', {
    description: 'Pre-solicitud de crédito (generación de leads)',
    http: {
      path: '/request',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', http: { source: 'body' } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })
}
