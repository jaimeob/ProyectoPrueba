'use strict'

const Utils = require('../Utils.js')
const handlebars = require('handlebars')
const mysql = require('../classes/mysql.js')

module.exports = function (Subscriber) {
  Subscriber.subscribeNewsletter = async (data) => {
    let response = { subscribed: false }

    const db = mysql.connectToDBManually()

    try {
      let subscribers = await db.query('SELECT * FROM Subscriber WHERE email = ?', [data.email])
      if (subscribers.length > 0) {
        if (subscribers[0].status === 2) {
          await db.query('UPDATE Subscriber SET status = 1 WHERE email = ?', [data.email])
        }
      }
      else {
        await db.query('INSERT INTO Subscriber (email, status) VALUES (?, ?);', [data.email, 1])
      }
      
      let template = await Utils.readFile(__dirname + '/../templates/welcome-newsletter.hbs')
      template = handlebars.compile(template)

      Utils.sendEmail({
        from: '"Calzzapato.com" <contacto@calzzapato.com>',
        to: data.email,
        subject: 'Bienvenido al newsletter de Calzzapato.com 👠',
        template: template()
      })

      response.subscribed = true
    } catch (err) {
      response.error = err
    }

    await db.close()
    
    if (response.error) {
      throw response.error
    }
    return response
  }

  Subscriber.remoteMethod(
    'subscribeNewsletter',
    {
      description: 'Subscribe to newsletter',
      http: {
        path: '/newsletter',
        verb: 'POST'
      },
      accepts: [
        {
          arg: 'data', type: "object", require: true
        }
      ],
      returns: {
        arg: 'data',
        type: 'object',
        root: true
      }
    }
  )
}
