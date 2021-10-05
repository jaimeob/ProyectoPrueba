'use strict'

const Utils = require('../Utils.js')
const mysql = require('../classes/mysql.js')
const querystring = require('querystring')

module.exports = (Chatbot) => {
  Chatbot.webHookWhatsappAPI = async (req) => {
    if (req.body !== undefined && req.body.channel === 'whatsapp') {
      console.log(req.body)
      let destination = JSON.parse(req.body.messageobj).from

      let messages = []
      let message = {
        isHSM: "false",
        type: "text",
        text: ""
      }

      let messageFrom = JSON.parse(req.body.messageobj)
      if (messageFrom.type === 'text') {
        if (messageFrom.text === 'Hola') {
          message.text = 'Hola, soy Calzzabot 🤖 el asistente virtual de Grupo Calzzapato 👠.'
          messages.push(Utils.cloneJson(message))

          message.text = 'Yo te estaré ayudando en lo que pueda, sino... avisaré tan pronto sea posible a un miembro de nuestro equipo 🧑‍💻👩‍💻👨‍💻.'
          messages.push(Utils.cloneJson(message))

          message.text = '¿Qué deseas hacer?'
          messages.push(Utils.cloneJson(message))

          message.text = '*🛍 Comprar*'
          messages.push(Utils.cloneJson(message))

          message.text = '*📦 Consultar pedido*'
          messages.push(Utils.cloneJson(message))

          message.text = '*📱 Validar CrediVale ®*'
          messages.push(Utils.cloneJson(message))

          message.text = 'A continuación, escribe tu respuesta (o usa el emoji)...'
          messages.push(Utils.cloneJson(message))
        }

        if (messageFrom.text.toLowerCase() === '🛍' || messageFrom.text.toLowerCase() === '🛍 comprar' || messageFrom.text.toLowerCase() === 'comprar') {
          message.text = 'Excelente, ¡vamos a comprar 🛍!'
          messages.push(Utils.cloneJson(message))

          message.text = 'Cuéntame, ¿es un regalo o para quien es la compra?'
          messages.push(Utils.cloneJson(message))

          message.text = '*👩 Para mujer*'
          messages.push(Utils.cloneJson(message))

          message.text = '*🧔 Para hombre*'
          messages.push(Utils.cloneJson(message))

          message.text = '*👧 Para niña*'
          messages.push(Utils.cloneJson(message))

          message.text = '*👦 Para niño*'
          messages.push(Utils.cloneJson(message))

          message.text = '*🛍 Compra departamental*'
          messages.push(Utils.cloneJson(message))
        }

        if (messageFrom.text.toLowerCase() === '👩' || messageFrom.text.toLowerCase() === 'para mujer' || messageFrom.text.toLowerCase() === 'mujer' || messageFrom.text.toLowerCase() === '👩 para mujer') {
          message.text = '¡Muy bien!'
          messages.push(Utils.cloneJson(message))

          message.text = 'Tengo estas categorías para mujer...'
          messages.push(Utils.cloneJson(message))

          message.text = '*👠 Calzado*'
          messages.push(Utils.cloneJson(message))

          message.text = '*👜 Accesorios*'
          messages.push(Utils.cloneJson(message))

          message.text = '*👚 Ropa*'
          messages.push(Utils.cloneJson(message))

          message.text = 'Ingresa tu opción...'
          messages.push(Utils.cloneJson(message))
        }

        if (messageFrom.text.toLowerCase() === 'calzado' || messageFrom.text.toLowerCase() === "👠") {
          message.text = 'Perfecto, compremos unos zapatos.'
          messages.push(Utils.cloneJson(message))

          message.text = 'Te muestro las 10 mejores ofertas que tenemos...'
          messages.push(Utils.cloneJson(message))

          let categories = await Utils.getSubcategories([2], [])
          let aux = []
          
          categories.forEach(category => {
            aux.push({ categoryCode: category.categoryCode })
          })

          aux.unshift({ categoryCode: 2 })
          
          let products = await Utils.loopbackFind(Chatbot.app.models.Product, {
            where: {
              and: [
                {
                  or: aux
                },
                {
                  percentagePrice: {
                    gt: 0
                  }
                }
              ]
            },
            limit: 10,
            order: 'percentagePrice DESC'
          })

          products.forEach((product) => {
            console.log(product.photos[0].description)
            /*
            delete message.text
            delete message.isHSM
            message.type = 'image'
            message.originalUrl = "https://s3-us-west-1.amazonaws.com/calzzapato/zoom/" + product.photos[0].description,
            message.previewUrl = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/" + product.photos[0].description,
            message.caption = 'Código: *' + product.code +  '*\n_' + product.name + '_\n🚫 ANTES: *~$' + Utils.numberWithCommas(product.price.toFixed(2)) + ' M.N.~*\n✅ AHORA: *$' + Utils.numberWithCommas(product.discountPrice.toFixed(2)) + ' M.N.* \nhttps://www.kelder.mx' + product.url + '?whatsapp=true'
            */
            message.text = 'Código: *' + product.code +  '*\n_' + product.name + '_\n🚫 ANTES: *~$' + Utils.numberWithCommas(product.price.toFixed(2)) + ' M.N.~*\n✅ AHORA: *$' + Utils.numberWithCommas(product.discountPrice.toFixed(2)) + ' M.N.* \nhttps://www.kelder.mx' + product.url + '?whatsapp=true'
            messages.push(Utils.cloneJson(message))
          })

          /*
          delete message.originalUrl
          delete message.previewUrl
          message.isHSM = 'false'
          message.type = 'text'
          */
          message.text = 'También, te dejo el enlace para que consultes todo el calzado que tenemos...'
          messages.push(Utils.cloneJson(message))
          message.text = 'https://www.kelder.mx/calzado-para-mujer/2'
          messages.push(Utils.cloneJson(message))
          message.text = '⚠️ *En nuestra página, usa el botón de comprar con WhatsApp para continuar.*'
          messages.push(Utils.cloneJson(message))

        } else if (messageFrom.text.toLowerCase() === '40') {
          message.text = 'Perfecto, compremos accesorios.'
          messages.push(Utils.cloneJson(message))
          
        } else if (messageFrom.text.toLowerCase() === '217') {
          message.text = 'Perfecto, compremos ropa.'
          
        }
        
        /*
        else if (messageFrom.text === 'Consultar pedido') {
          message.text = 'Perfecto, proporcioname tu folio de compra, por favor...'
          messages.push(message)
        }
        else if (!isNaN(messageFrom.text)) {
          let response = await Utils.request({
            method: 'GET',
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/orders/' + messageFrom.text + '/tracking',
            json: true
          })

          console.log(response.body)
          let step = Number(response.body.step)
          if (step === 0) {
            message.text = 'No encontramos tu pedido, por favor, proporciona nuevamente tu folio de compra...'
          } else {
            const db = await mysql.connectToDBManually()
            let order = await db.query('SELECT * FROM `Order` WHERE `order` = ? OR `calzzapatoCode` = ?', [
              messageFrom.text,
              messageFrom.text
            ])

            order = order[0]

            if (step === 1) {
              if (order.paymentMethodId === 2) {
                message.text = 'Tu orden fue realizada con CrediVale ® y está siendo validada. Un asesor se comunicará contigo.'
              } else {
                message.text = 'Tu orden aún requiere pago, ¿deseas generar una referencia de OXXO para pagar?'
              }
              //Validando
              //Por pagar
            } else if (step === 2) {
              //Creada
              message.text = 'Hemos recibido tu compra y está siendo procesada.'
            } else if (step === 3) {
              //Procesando
              message.text = 'Continuamos procesando tu compra. Disculpa la espera.'
            } else if (step === 4) {
              //Por enviar
              message.text = 'Tu orden está lista para ser enviada. Pronto la tendrás en tu hogar.'
            } else if (step === 5) {
              //Enviado
              message.text = '¡Tu orden está en camino! Pronto estará contigo.'
            } else if (step === 6) {
              //Entregado
              message.text = 'Tu orden ha sido entregada con éxito. ¿Cómo te pareció la experiencia Calzzapato?'
            }
          }

          messages.push(message)
        }
        */
      }

      await Utils.asyncForEach(messages, async (message) => {
        message = JSON.stringify(message)

        let form = {
          'channel': 'whatsapp',
          'destination': destination.toString(),
          'source': '917834811114',
          'message': message,
          'src.name': 'Calzzabot'
        }
        
        let formData = querystring.stringify(form)
        let contentLength = formData.length
  
        let response = await Utils.request({
          method: 'POST',
          url: 'https://api.gupshup.io/sm/api/v1/msg',
          headers: {
            'Content-Length': contentLength,
            'Content-Type': 'application/x-www-form-urlencoded',
            'apikey': 'abda31a2b3a840cfc04224406846aa39'
          },
          body: formData
        })
        console.log(response.body)
      })
    }
  }

  Chatbot.remoteMethod('webHookWhatsappAPI', {
    description: 'webHookWhatsappAPI',
    http: {
      path: '/whatsapp',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'Object',
      root: true
    }
  })
}
