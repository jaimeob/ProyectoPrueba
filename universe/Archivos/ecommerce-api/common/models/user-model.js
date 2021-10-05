'use strict'

const Utils = require('../Utils.js')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const handlebars = require('handlebars')
const convert = require('xml-js')
const ObjectId = require('mongodb').ObjectID
const QR = require('qr-image')
const mysql = require('../classes/mysql.js')
const mongodb = require('../classes/mongodb.js')
const CDN = require('../classes/cdn.js')
const product = require('./product.js')
const cart = require('./cart.js')
const { utils } = require('mercadopago')
const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')
const bluePoints = require('../classes/bluepoints')
const catalog = require('./catalog.js')

module.exports = function (User) {
  User.createAccount = async (req, data) => {
    let response = { created: false }

    const db = mysql.connectToDBManually()

    try {
      let password = crypto.createHash('sha256').update(data.password).digest('hex')
      let verificationToken = crypto.createHash('sha256').update(data.email).digest('hex')
      await db.beginTransaction()

      let validations = await db.query('SELECT * FROM ValidationCellphone WHERE userId IS NULL AND cellphone = ? AND code = ? AND applied = 1 AND status = 1 LIMIT 1;', [
        data.cellphone,
        data.code
      ])

      if (validations.length !== 1)
        throw 'El número de celular no está validado o ya se encuentra en uso.'

      if (!Utils.validateEmail(data.email))
        throw 'El correo electrónico no es válido. Proporciona un correo electrónico válido.'

      let facebookId = ''
      if (data.facebookId !== undefined && !Utils.isEmpty(data.facebookId)) {
        facebookId = data.facebookId
      }

      let gender = null
      if (data.gender !== undefined) {
        gender = data.gender
      }

      let birthday = null
      let age = false
      if (data.birthday !== undefined) {
        birthday = data.birthday
        let enteredAge = Utils.getAge(data.birthday)
        if (enteredAge => 18 && enteredAge <= 90) {
          age = true
        }
      }

      let newAccount = await db.query('INSERT INTO User (facebookId, genderId, birthday, name, firstLastName, secondLastName, username, email, cellphone, password, verificationToken, emailVerified, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [
        facebookId,
        gender,
        birthday,
        data.name,
        data.firstLastName,
        data.secondLastName,
        data.email,
        data.email,
        data.cellphone,
        password,
        verificationToken,
        0,
        1
      ])

      // Crear usuario = calzzapatoUserId
      // Generar Monedero Azul
      if (gender !== null && birthday !== null && age && validations.length === 1) {
        // Activar
        let gender = 'F'
        if (gender === 2) {
          gender = 'M'
        }

        let birthday = new Date(data.birthday)
        let month = birthday.getMonth() + 1
        if (month <= 9) {
          month = '0' + month
        }

        let day = birthday.getDate()
        if (day <= 9) {
          day = '0' + day
        }

        if (!data.userSet) {
          let body = '<?xml version="1.0" encoding="utf-8"?>\
          <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
            <soap:Body>\
              <UsuarioSet xmlns="http://tempuri.org/">\
                <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
                <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
                <APaterno>' + data.firstLastName.trim() + '</APaterno>\
                <AMaterno>' + data.secondLastName.trim() + '</AMaterno>\
                <Nombre>' + data.name.trim() + '</Nombre>\
                <Sexo>' + gender + '</Sexo>\
                <FechaNacimiento>' + birthday.getFullYear() + '-' + month + '-' + day + '</FechaNacimiento>\
                <CorreoElectronico>' + data.email + '</CorreoElectronico>\
                <NumCelular>' + data.cellphone + '</NumCelular>\
                <CodigoVerificador>-999</CodigoVerificador>\
                <PasswordUsuario>' + password + '</PasswordUsuario>\
                <IdAplicacion>2</IdAplicacion>\
                <IdUsuarioExterno>' + newAccount.insertId + '</IdUsuarioExterno>\
              </UsuarioSet>\
            </soap:Body>\
          </soap:Envelope>'

          let request = await Utils.request({
            method: 'POST',
            url: configs.webServiceVentaPublicoURL + '?op=UsuarioSet',
            headers: {
              "content-type": "text/xml"
            },
            body: body
          })

          if (request.body !== undefined) {
            let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
            result = JSON.parse(result)
            result = result['soap:Envelope']['soap:Body']['UsuarioSetResponse'][['UsuarioSetResult']]

            if (result.Numero !== undefined && Number(result.Numero['_text']) > 0) {
              await db.query('UPDATE User SET calzzapatoUserId = ? WHERE id = ?', [
                Number(result.Numero['_text']),
                newAccount.insertId
              ])

              body = '<?xml version="1.0" encoding="utf-8"?>\
              <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                <soap:Body>\
                  <GenerarMonederoSet xmlns="http://tempuri.org/">\
                    <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
                    <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
                    <IDUsuario>' + result.Numero['_text'] + '</IDUsuario>\
                  </GenerarMonederoSet>\
                </soap:Body>\
              </soap:Envelope>'

              request = await Utils.request({
                method: 'POST',
                url: configs.webServiceVentaPublicoURL + '?op=GenerarMonederoSet',
                headers: {
                  "content-type": "text/xml"
                },
                body: body
              })

              if (request.body === undefined) {
                throw 'Ocurrió un problema al activar Monedero Azul ®'
              }
            } else {
              if (Number(result.idError['_text']) === 1) {
                throw 'No se ha podido activar la cuenta de usuario. Email inválido.'
              } else if (Number(result.idError['_text']) === 2) {
                throw 'Proporciona un número de celular válido.'
              } else if (Number(result.idError['_text']) === 3) {
                throw 'No se ha podido activar la cuenta de usuario. Email en uso.'
              } else if (Number(result.idError['_text']) === 4) {
                throw 'Edad inválida (rango: 18 a 90 años).'
              } else if (Number(result.idError['_text']) === 5) {
                throw 'No se ha podido activar la cuenta de usuario. Problema ID de aplicación.'
              } else if (Number(result.idError['_text']) === 6) {
                throw 'No se ha podido activar la cuenta de usuario. Problema ID de usuario.'
              } else if (Number(result.idError['_text']) === 7) {
                throw 'No se ha podido activar la cuenta de usuario. Problema al asignar puntos de bienvenida.'
              } else if (Number(result.idError['_text']) === 8) {
                throw 'Proporciona un número de celular válido.'
              } else if (Number(result.idError['_text']) === 9) {
                throw 'No se ha podido activar la cuenta de usuario. Código de verificación no válido.'
              } else if (Number(result.idError['_text']) === 10) {
                throw 'No se ha podido activar la cuenta de usuario. Nombre y primer apellido obligatorio.'
              }
            }
          } else {
            throw 'Ocurrió un problema al activar la cuenta de usuario.'
          }
        }
      }

      await db.query('UPDATE ValidationCellphone SET userId = ? WHERE id = ?', [
        newAccount.insertId,
        validations[0].id
      ])

      let welcomeToNewsletter = false
      let subscribers = await db.query('SELECT * FROM Subscriber WHERE email = ? LIMIT 1;', [
        data.email
      ])

      if (data.newsletter) {
        if (subscribers.length === 0) {
          await db.query('INSERT INTO Subscriber (email, status) VALUES (?, 1);', [
            data.email
          ])
          welcomeToNewsletter = true
        }
        else {
          if (subscribers[0].status === 2) {
            await db.query('UPDATE Subscriber SET status = 1 WHERE email = ?;', [
              data.email
            ])
            welcomeToNewsletter = true
          }
        }
      }

      if (welcomeToNewsletter) {
        let template = await Utils.readFile(__dirname + '/../templates/welcome-newsletter.hbs')
        template = handlebars.compile(template)

        Utils.sendEmail({
          from: '"Calzzapato.com" <contacto@calzzapato.com>',
          to: data.email,
          subject: 'Bienvenido al newsletter de Calzzapato.com 👠',
          template: template({
            user: {
              name: data.name,
              firstLastName: data.firstLastName,
              secondLastName: data.secondLastName
            }
          })
        })
      }

      let template = await Utils.readFile(__dirname + '/../templates/new-account.hbs')
      template = handlebars.compile(template)

      Utils.sendEmail({
        from: '"Calzzapato.com" <contacto@calzzapato.com>',
        to: data.email,
        subject: 'Hola, bienvenido a Calzzapato.com 👠',
        template: template({
          user: {
            name: data.name,
            firstLastName: data.firstLastName,
            secondLastName: data.secondLastName
          },
          url: configs.HOST_WEB_APP + '?token=' + verificationToken
        })
      })

      await db.commit()

      response.created = true

    } catch (err) {
      console.log(err)
      response.error = err
      await db.rollback()
    }

    await db.close()
    if (response.error) {
      throw response.error
    }
    return response
  }

  User.remoteMethod('createAccount', {
    description: 'Create user account',
    http: {
      path: '/create',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.verifyEmail = async (data) => {
    let response = { verified: false }
    const db = mysql.connectToDBManually()
    try {
      let responseUpdate = await db.query('UPDATE User SET emailVerified = 1, verificationToken = "" WHERE verificationToken = ? AND emailVerified = ?;', [data.verificationToken, 0])
      if (responseUpdate.affectedRows > 0)
        response.verified = true
    } catch (err) {
      response.error = err
    }

    await db.close()
    
    if (response.error) {
      throw response
    }
    
    return response
  }

  User.remoteMethod('verifyEmail', {
    description: 'Verify signup email',
    http: {
      path: '/verify-email',
      verb: 'PATCH'
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
  })

  User.recoveryPassword = async function (data) {
    let response = { sent: false }
    const db = await mysql.connectToDBManually()

    try {
      let verificationToken = crypto.createHash('sha256').update(Math.floor(100000 + Math.random() * 900000).toString()).digest('hex')
      let users = await db.query('SELECT id, name, firstLastName, secondLastName FROM User WHERE email = ? AND status = 1 LIMIT 1;', [data.email])

      await db.beginTransaction()
      await db.query('UPDATE User SET verificationToken = ? WHERE id = ?', [verificationToken, users[0].id])

      let template = await Utils.readFile(__dirname + '/../templates/recovery-password.hbs')
      template = handlebars.compile(template)

      let emailResponse = await Utils.sendEmail({
        from: '"Calzzapato.com" <contacto@calzzapato.com>',
        to: data.email,
        subject: 'Recuperación de contraseña Calzzapato.com 👠',
        template: template({
          user: {
            name: users[0].name,
            firstLastName: users[0].firstLastName,
            secondLastName: users[0].secondLastName
          },
          url: configs.HOST_WEB_APP + '/nueva-contrasena?token=' + verificationToken
        })
      })

      response.sent = true
      await db.commit()

    } catch (err) {

      response.error = err
      await db.rollback()
    }

    await db.close()

    if (response.error) {
      throw response.error
    }

    return response
  }

  User.remoteMethod('recoveryPassword', {
    description: 'Send email for recovery password',
    http: {
      path: '/recovery-password',
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
  })

  User.validateToken = async function (data) {
    let response = { verificated: false }
    const db = await mysql.connectToDBManually()
    try {
      let users = await db.query('SELECT id FROM User WHERE verificationToken = ? AND status = 1 LIMIT 1;', [data.token])
      if (users.length > 0) {
        response.verificated = true
      }
    } catch (err) {
      response.error = err
    }
    await db.close()
    if (response.error) {
      throw response
    }
    return response
  }

  User.remoteMethod('validateToken', {
    description: 'Validate token',
    http: {
      path: '/validate-token',
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
  })

  User.setNewPassword = async function (data) {
    let response = { changed: false }
    const db = await mysql.connectToDBManually()
    try {
      let users = await db.query('SELECT id, email FROM User WHERE verificationToken = ? AND status = 1 LIMIT 1;', [data.token])
      await db.beginTransaction()
      let password = crypto.createHash('sha256').update(data.password).digest('hex')
      await db.query('UPDATE User SET password = ?, emailVerified = 1, verificationToken = "" WHERE verificationToken = ?', [password, data.token])
      await db.commit()
      response.changed = true
      response.email = users[0].email
    } catch (err) {
      response.error = err
      await db.rollback()
    }
    await db.close()
    if (response.error) {
      throw response
    }
    return response
  }

  User.remoteMethod('setNewPassword', {
    description: 'Set new password',
    http: {
      path: '/new-password',
      verb: 'PATCH'
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
  })

  User.checkEmail = async function (data) {
    let response = { exist: true }
    const db = await mysql.connectToDBManually()
    try {
      let responseExistEmail = await db.query('SELECT * FROM User WHERE email = ?;', [data.email])
      if (responseExistEmail.length > 0) {
        response.exist = true
      } else {
        response.exist = false
      }
    } catch (err) {
      response.error = err
    }
    await db.close()
    if (response.error) {
      throw response.error
    }
    return response
  }

  User.remoteMethod('checkEmail', {
    description: 'Check if exist an email',
    http: {
      path: '/check-email',
      verb: 'POST'
    },
    accepts: [
      {
        arg: 'data', type: 'object', required: true,
      }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.signin = async (req, data) => {
    let error = null
    let response = {}
    let uuid = null
    const { username } = data
    if (req.headers.metadata !== undefined) {
      let metadata = JSON.parse(req.headers.metadata)
      if (metadata.uuid !== undefined && metadata.uuid !== null && !Utils.isEmpty(metadata.uuid)) {
        uuid = metadata.uuid
      }
    }

    const mdb = mongodb.getConnection('db')
    const db = await mysql.connectToDBManually()

    if(username != null && username != '' && username != undefined && username != null){

      try {
        if (data.withFacebook) {
          let users = await db.query('SELECT * FROM User WHERE facebookId = ? AND status = 1 LIMIT 1;', [data.facebookId])
          if (users.length === 1) {
  
            let carts = await mongodb.mongoFind(mdb, 'Cart', { '$and': [{ uuid: uuid }, { user: null }, { status: true }] })
            if (carts.length === 1) {
              await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { user: users[0].id, status: true }, {
                '$set': {
                  status: false
                }
              })
  
              await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { _id: ObjectId(carts[0]._id) }, {
                '$set': {
                  user: users[0].id
                }
              })
            }
  
            let facebookUser = await Utils.request('https://graph.facebook.com/me?access_token=' + data.accessToken)
            facebookUser = JSON.parse(facebookUser.body)
            if (facebookUser.id === data.facebookId) {
              users = await db.query('SELECT * FROM User WHERE facebookId = ? AND status = 1 LIMIT 1;', [data.facebookId])
              let token = jwt.sign(users[0].email + '|' + users[0].password, configs.jwtPrivateKey)
              //let session = await db.query('INSERT INTO Session (userId, jwt)')
              delete users[0].id
              delete users[0].password
              delete users[0].realm
              delete users[0].emailVerified
              delete users[0].verificationToken
              delete users[0].lastLogin
              delete users[0].createdAt
              delete users[0].updatedAt
              delete users[0].status
              users[0].token = token
              response = users[0]
            } else {
              throw 'Usuario y/o contraseña incorrecta.'
            }
          }
          else {
            users = await db.query('SELECT * FROM User WHERE (email = ? OR cellphone = ?) AND facebookId = "" AND status = 1 LIMIT 1;', [data.email, data.email])
            if (users.length === 1) {
              let carts = await mongodb.mongoFind(mdb, 'Cart', { '$and': [{ uuid: uuid }, { user: null }, { status: true }] })
              if (carts.length === 1) {
                await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { user: users[0].id, status: true }, {
                  '$set': {
                    status: false
                  }
                })
  
                await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { _id: ObjectId(carts[0]._id) }, {
                  '$set': {
                    user: users[0].id
                  }
                })
              }
  
              let facebookUser = await Utils.request('https://graph.facebook.com/me?access_token=' + data.accessToken)
              facebookUser = JSON.parse(facebookUser.body)
              if (facebookUser.id === data.facebookId) {
                await db.query('UPDATE User SET facebookId = ? WHERE email = ?', [
                  data.facebookId,
                  data.email
                ])
  
                users = await db.query('SELECT * FROM User WHERE facebookId = ? AND status = 1 LIMIT 1;', [data.facebookId])
                let token = jwt.sign(users[0].email + '|' + users[0].password, configs.jwtPrivateKey)
                //let session = await db.query('INSERT INTO Session (userId, jwt)')
                delete users[0].id
                delete users[0].password
                delete users[0].realm
                delete users[0].emailVerified
                delete users[0].verificationToken
                delete users[0].lastLogin
                delete users[0].createdAt
                delete users[0].updatedAt
                delete users[0].status
                users[0].token = token
                response = users[0]
              } else {
                throw 'Usuario y/o contraseña incorrecta.'
              }
            } else {
              throw 'Usuario y/o contraseña incorrecta.'
            }
          }
        }
        else {
          let password = crypto.createHash('sha256').update(data.password).digest('hex')
          let users = await db.query('SELECT * FROM User WHERE username = ? AND status = 1 LIMIT 1;', [data.username])
      
          if (users.length === 1) {
  
            let carts = await mongodb.mongoFind(mdb, 'Cart', { '$and': [{ uuid: uuid }, { user: null }, { status: true }] })
            if (carts.length === 1) {
              await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { user: users[0].id, status: true }, {
                '$set': {
                  status: false
                }
              })
  
              await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { _id: ObjectId(carts[0]._id) }, {
                '$set': {
                  user: users[0].id
                }
              })
            }
  
            let token = jwt.sign(users[0].email + '|' + users[0].password, configs.jwtPrivateKey)
            //let session = await db.query('INSERT INTO Session (userId, jwt)')
            delete users[0].id
            delete users[0].password
            delete users[0].realm
            delete users[0].emailVerified
            delete users[0].verificationToken
            delete users[0].lastLogin
            delete users[0].createdAt
            delete users[0].updatedAt
            delete users[0].status
            users[0].token = token
            response = users[0]
          }
          else {
            throw 'Usuario y/o contraseña incorrecta.'
          }
        }
      } catch (err) {
        error = err
      }
      
    }else{

      try {
        if (data.withFacebook) {
          let users = await db.query('SELECT * FROM User WHERE facebookId = ? AND status = 1 LIMIT 1;', [data.facebookId])
          if (users.length === 1) {
  
            let carts = await mongodb.mongoFind(mdb, 'Cart', { '$and': [{ uuid: uuid }, { user: null }, { status: true }] })
            if (carts.length === 1) {
              await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { user: users[0].id, status: true }, {
                '$set': {
                  status: false
                }
              })
  
              await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { _id: ObjectId(carts[0]._id) }, {
                '$set': {
                  user: users[0].id
                }
              })
            }
  
            let facebookUser = await Utils.request('https://graph.facebook.com/me?access_token=' + data.accessToken)
            facebookUser = JSON.parse(facebookUser.body)
            if (facebookUser.id === data.facebookId) {
              users = await db.query('SELECT * FROM User WHERE facebookId = ? AND status = 1 LIMIT 1;', [data.facebookId])
              let token = jwt.sign(users[0].email + '|' + users[0].password, configs.jwtPrivateKey)
              //let session = await db.query('INSERT INTO Session (userId, jwt)')
              delete users[0].id
              delete users[0].password
              delete users[0].realm
              delete users[0].emailVerified
              delete users[0].verificationToken
              delete users[0].lastLogin
              delete users[0].createdAt
              delete users[0].updatedAt
              delete users[0].status
              users[0].token = token
              response = users[0]
            } else {
              throw 'Usuario y/o contraseña incorrecta.'
            }
          }
          else {
            users = await db.query('SELECT * FROM User WHERE (email = ? OR cellphone = ?) AND facebookId = "" AND status = 1 LIMIT 1;', [data.email, data.email])
            if (users.length === 1) {
              let carts = await mongodb.mongoFind(mdb, 'Cart', { '$and': [{ uuid: uuid }, { user: null }, { status: true }] })
              if (carts.length === 1) {
                await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { user: users[0].id, status: true }, {
                  '$set': {
                    status: false
                  }
                })
  
                await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { _id: ObjectId(carts[0]._id) }, {
                  '$set': {
                    user: users[0].id
                  }
                })
              }
  
              let facebookUser = await Utils.request('https://graph.facebook.com/me?access_token=' + data.accessToken)
              facebookUser = JSON.parse(facebookUser.body)
              if (facebookUser.id === data.facebookId) {
                await db.query('UPDATE User SET facebookId = ? WHERE email = ?', [
                  data.facebookId,
                  data.email
                ])
  
                users = await db.query('SELECT * FROM User WHERE facebookId = ? AND status = 1 LIMIT 1;', [data.facebookId])
                let token = jwt.sign(users[0].email + '|' + users[0].password, configs.jwtPrivateKey)
                //let session = await db.query('INSERT INTO Session (userId, jwt)')
                delete users[0].id
                delete users[0].password
                delete users[0].realm
                delete users[0].emailVerified
                delete users[0].verificationToken
                delete users[0].lastLogin
                delete users[0].createdAt
                delete users[0].updatedAt
                delete users[0].status
                users[0].token = token
                response = users[0]
              } else {
                throw 'Usuario y/o contraseña incorrecta.'
              }
            } else {
              throw 'Usuario y/o contraseña incorrecta.'
            }
          }
        }
        else {
          let password = crypto.createHash('sha256').update(data.password).digest('hex')
          let users = await db.query('SELECT * FROM User WHERE (email = ? OR cellphone = ?) AND password = ? AND status = 1 LIMIT 1;', [data.email, data.email, password])
      
          if (users.length === 1) {
  
            let carts = await mongodb.mongoFind(mdb, 'Cart', { '$and': [{ uuid: uuid }, { user: null }, { status: true }] })
            if (carts.length === 1) {
              await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { user: users[0].id, status: true }, {
                '$set': {
                  status: false
                }
              })
  
              await mongodb.findAndUpdateMongoDB(mdb, 'Cart', { _id: ObjectId(carts[0]._id) }, {
                '$set': {
                  user: users[0].id
                }
              })
            }
  
            let token = jwt.sign(users[0].email + '|' + users[0].password, configs.jwtPrivateKey)
            //let session = await db.query('INSERT INTO Session (userId, jwt)')
            delete users[0].id
            delete users[0].password
            delete users[0].realm
            delete users[0].emailVerified
            delete users[0].verificationToken
            delete users[0].lastLogin
            delete users[0].createdAt
            delete users[0].updatedAt
            delete users[0].status
            users[0].token = token
            response = users[0]
          }
          else {
            throw 'Usuario y/o contraseña incorrecta.'
          }
        }
      } catch (err) {
        error = err
      }

    }

    await db.close()
    if (error) {
      throw error
    }
    return response
  }

  User.remoteMethod('signin', {
    description: 'Login for users',
    http: {
      path: '/signin',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', http: { source: 'body' }, require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.auth = async (req) => {
    try {
      let user = req.headers.user
      if (user === undefined || user === null) {
        return null
      }
      let token = jwt.sign(user.email + '|' + user.password, configs.jwtPrivateKey)
      user.token = token
      user.bluePoints = null

      if (user.calzzapatoUserId !== null) {
        let body = '<?xml version="1.0" encoding="utf-8"?>\
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
          <soap:Body>\
            <GetMonederoAzulSaldoActual xmlns="http://tempuri.org/">\
              <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
              <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
              <IDUsuario>' + user.calzzapatoUserId + '</IDUsuario>\
            </GetMonederoAzulSaldoActual>\
          </soap:Body>\
        </soap:Envelope>'

        let request = await Utils.request({
          method: 'POST',
          url: configs.webServiceVentaPublicoURL + '?op=GetMonederoAzulSaldoActual',
          headers: {
            "content-type": "text/xml"
          },
          body: body
        })

        if (request.body !== undefined) {
          let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
          result = JSON.parse(result)

          if (result['soap:Envelope']['soap:Body']['GetMonederoAzulSaldoActualResponse'] !== undefined) {
            result = result['soap:Envelope']['soap:Body']['GetMonederoAzulSaldoActualResponse'][['GetMonederoAzulSaldoActualResult']]
            user.bluePoints = {
              balance: Number(result.Puntos['_text'])
            }
          }
        }
      }

      const db = mysql.connectToDBManually()
      let newsletter = await db.query('SELECT status FROM `Subscriber` WHERE email = ? LIMIT 1', [
        user.email
      ])

      let validationCellphone = await db.query('SELECT applied FROM `ValidationCellphone` WHERE userId = ? AND cellphone = ? AND status = 1 LIMIT 1', [
        user.id,
        user.cellphone
      ])

      await db.close()

      if (validationCellphone.length === 1) {
        user.validationCellphone = (Number(validationCellphone[0].applied) === 1) ? true : false
      } else {
        user.validationCellphone = false
      }

      if (newsletter.length === 1) {
        user.newsletter = (Number(newsletter[0].status) === 1) ? true : false
      } else {
        user.newsletter = false
      }

      delete user.password
      delete user.verificationToken
      delete user.createdAt
      delete user.updatedAt

      return user
    } catch (err) {
      console.log(err)
      return null
    }
  }

  User.remoteMethod('auth', {
    description: 'Get auth by user',
    http: {
      path: '/auth',
      verb: 'GET'
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

  User.generateBluePointCode = async (req) => {
    try {
      let user = req.headers.user
      let codes = null

      if (user.calzzapatoUserId !== null) {
        let body = '<?xml version="1.0" encoding="utf-8"?>\
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
          <soap:Body>\
            <GenerarMonederoSet xmlns="http://tempuri.org/">\
              <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
              <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
              <IDUsuario>' + user.calzzapatoUserId + '</IDUsuario>\
            </GenerarMonederoSet>\
          </soap:Body>\
        </soap:Envelope>'

        let request = await Utils.request({
          method: 'POST',
          url: configs.webServiceVentaPublicoURL + '?op=GenerarMonederoSet',
          headers: {
            "content-type": "text/xml"
          },
          body: body
        })

        console.log('Respuesta al generar monedero desde Calzzapato WS')
        if (request.body !== undefined) {
          let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
          result = JSON.parse(result)

          if (result['soap:Envelope']['soap:Body']['GenerarMonederoSetResponse'] !== undefined) {
            result = result['soap:Envelope']['soap:Body']['GenerarMonederoSetResponse'][['GenerarMonederoSetResult']]

            codes = {
              qr: result.QR['_text'],
              barcode: result.Code128c['_text']
            }

            let dataImage = QR.imageSync(result.QR['_text'], { ec_level: 'H', type: 'png', size: 10, margin: 1 })
            let buffer = new Buffer(dataImage)
            let base64 = buffer.toString('base64')
            let responseFile = await CDN.createFileIntoCDN(result.QR['_text'] + '.png', '/qr', base64)

            if (responseFile.success) {
              codes.qrImage = responseFile.url
            }

            let responseBarcode = await Utils.generateBarcode(result.QR['_text'])
            if (responseBarcode.success) {
              codes.barcodeImage = responseBarcode.url
            }

            body = '<?xml version="1.0" encoding="utf-8"?>\
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
              <soap:Body>\
                <GetMonederoAzulSaldoActual xmlns="http://tempuri.org/">\
                  <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
                  <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
                  <IDUsuario>' + user.calzzapatoUserId + '</IDUsuario>\
                </GetMonederoAzulSaldoActual>\
              </soap:Body>\
            </soap:Envelope>'

            request = await Utils.request({
              method: 'POST',
              url: configs.webServiceVentaPublicoURL + '?op=GetMonederoAzulSaldoActual',
              headers: {
                "content-type": "text/xml"
              },
              body: body
            })

            console.log('Respuesta al obtener saldo monedero azul desde Calzzapato WS')

            if (request.body !== undefined) {
              console.log(request.body)
              let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
              result = JSON.parse(result)
              if (result['soap:Envelope']['soap:Body']['GetMonederoAzulSaldoActualResponse'] !== undefined) {
                result = result['soap:Envelope']['soap:Body']['GetMonederoAzulSaldoActualResponse'][['GetMonederoAzulSaldoActualResult']]
                codes.balance = Number(result.Puntos['_text'])
              }
            }
          }
        }
      }
      return codes
    } catch (err) {
      console.log(err)
      return null
    }
  }

  User.remoteMethod('generateBluePointCode', {
    description: 'Get auth by user',
    http: {
      path: '/bluepoints',
      verb: 'GET'
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

  User.getAddressesByUser = async function (req) {
    let error = null
    let response = []
    let user = req.headers.user
    const db = await mysql.connectToDBManually()

    try {
      let addresses = await db.query('SELECT\
        sa.id,\
        sa.userId AS userId,\
        sa.reference,\
        a.instanceId,\
        a.id AS addressId,\
        a.zip,\
        a.betweenStreets,\
        a.lat,\
        a.lng,\
        s.name AS state,\
        m.name AS municipality,\
        l.name AS location,\
        l.code AS locationCode,\
        lt.name AS type,\
        a.street,\
        a.exteriorNumber,\
        a.interiorNumber,\
        sa.name,\
        sa.lastName,\
        sa.phone,\
        sa.alias,\
        l.cityMunicipalityStateCode \
      FROM ShippingAddress AS sa\
      LEFT JOIN Address AS a ON a.id = sa.addressId\
      LEFT JOIN State AS s ON s.code = a.stateCode\
      LEFT JOIN Municipality AS m ON m.municipalityStateCode = a.municipalityCode\
      LEFT JOIN Location AS l ON l.locationMunicipalityStateCode = a.locationCode\
      LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode\
      WHERE sa.userId = ?\
      AND a.status = 1\
      AND sa.status = 1\
      ORDER BY a.createdAt DESC;', [
        user.id
      ])

      let fav = await db.query('SELECT A.* from User AS U LEFT JOIN ShippingAddress AS A ON U.favoriteAddressId = A.id WHERE U.id=? AND A.status=1 LIMIT 1;', [user.id])

      let thereIsFav = false
      if (fav.length > 0)
        thereIsFav = true

      addresses.forEach((address) => {
        if (address.lat !== null) {
          address.lat = Number(address.lat)
        }

        if (address.lng !== null) {
          address.lng = Number(address.lng)
        }

        address.favorite = false
        if (thereIsFav) {
          if (address.addressId === fav[0].addressId)
            address.favorite = true
        }
      })

      response = addresses
    } catch (err) {
      error = err
    }

    await db.close()

    if (error) {
      throw error
    }
    else {
      return response
    }
  }

  User.remoteMethod('getAddressesByUser', {
    description: 'Get addresses by user',
    http: {
      path: '/addresses',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.updateUserInfo = async function (data, req) {
    let user = req.headers.user
    const db = await mysql.connectToDBManually()
    let response = null

    try {
      await db.query('UPDATE User SET name = ?, firstLastName = ?, secondLastName = ?, genderId = ?, birthday = ? WHERE id = ? AND status = 1;', [
        (!data.name) ? user.name : data.name,
        (!data.firstLastName) ? user.firstLastName : data.firstLastName,
        (!data.secondLastName) ? user.secondLastName : data.secondLastName,
        (!data.genderId) ? user.genderId : data.genderId,
        (!data.birthday) ? user.birthday : data.birthday,
        user.id
      ])

      if (data.newsletter !== undefined) {
        await db.query('UPDATE Subscriber SET status = ? WHERE email = ?;', [
          data.newsletter,
          user.email
        ])
      }

      let users = await db.query('SELECT * FROM User WHERE id = ? AND status = 1 LIMIT 1;', [
        user.id
      ])

      if (users.length > 0) {
        let token = jwt.sign(users[0].email + '|' + users[0].password, configs.jwtPrivateKey)
        delete users[0].id
        delete users[0].password
        delete users[0].realm
        delete users[0].emailVerified
        delete users[0].verificationToken
        delete users[0].lastLogin
        delete users[0].createdAt
        delete users[0].updatedAt
        delete users[0].status
        users[0].token = token
        response = users[0]
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    await db.close()

    if (response.error) {
      throw response.error
    }
    return response
  }

  User.remoteMethod('updateUserInfo', {
    description: 'Update user personal information',
    http: {
      path: '/update-info',
      verb: 'PUT'
    },
    accepts: [
      { arg: 'data', type: 'object', required: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'Object',
      root: true
    }
  })

  User.setFavoriteAddress = async function (data, req) {
    let user = req.headers.user
    const db = await mysql.connectToDBManually()
    let response = { updated: false }

    try {
      await db.query('UPDATE User SET favoriteAddressId = ? WHERE id = ?;', [
        data.addressId,
        user.id
      ])
      response.updated = true
    } catch (err) {
      response.error = err
    }

    await db.close()

    if (response.error) {
      throw response
    }
    return response
  }

  User.remoteMethod('setFavoriteAddress', {
    description: 'Sets favorite address id of an user',
    http: {
      path: '/setFavoriteAddress',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'Object', required: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'Object',
      root: true
    }
  })

  User.ordersByUser = async (req) => {
    let responseOrders = []
    let CALZZAMOVIL = 4

    let instanceId = req.headers.instanceId
    let user = req.headers.user

    const mdb = mongodb.getConnection('db')
    const db = await mysql.connectToDBManually()

    try {
      if (user !== undefined && !isNaN(user.id)) {
        responseOrders = await db.query('SELECT `id`, `calzzapatoCode`, `order`, `reference`, `discount`, `shippingCost`, `subtotal`, `total`, `createdAt` AS shoppingDate, TIMESTAMPADD(DAY, 7, createdAt) as deliveryDate, `shippingMethodId` FROM `Order` WHERE userId = ? AND instanceId = ? AND status = 1 ORDER BY updatedAt DESC;', [user.id, instanceId])
        let orderDetail = []

        await Utils.asyncForEach(responseOrders, async (order) => {
          order.discount = Number(order.discount)
          order.shippingCost = Number(order.shippingCost)
          order.subtotal = Number(order.subtotal)
          order.total = Number(order.total)
          order.quantity = 0
          orderDetail = await db.query('SELECT `productCode`, `quantity` FROM `OrderDetail` WHERE orderId = ? AND status = 1;', [order.id])


          let photosArray = []
          await Utils.asyncForEach(orderDetail, async (detail) => {
            let photos = await mongodb.mongoFind(mdb, 'Product', {
              code: detail.productCode
            })

            let url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/"
            if (photos.length > 0) {
              if (photos[0].photos.length > 0) {
                url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/" + photos[0].photos[0].description
              }
            }

            order.quantity += detail.quantity
            photosArray.push(url)
          })
          order.photos = photosArray
          if (order.shippingMethodId === CALZZAMOVIL) {
            let calzzamovilOrders = await db.query('SELECT * FROM Calzzamovil WHERE deliveryDate IS NULL AND orderId = ? AND status = 1;', [order.id])
            if (calzzamovilOrders.length > 0) {
              order.calzzamovil = true
            } else {
              order.calzzamovil = false
            }
          } else {
            order.calzzamovil = false
          }
        })

      }
    } catch (err) {
      await db.close()
      throw err
    }

    await db.close()
    return responseOrders
  }

  User.remoteMethod('ordersByUser', {
    description: 'Get orders by user',
    http: {
      path: '/orders',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.cardsByUser = async (req) => {
    let response = []
    let instanceId = req.headers.instanceId
    let user = req.headers.user

    const db = await mysql.connectToDBManually()

    try {
      let cards = await db.query('SELECT id, type, number, titular, alias, token FROM Card WHERE instanceId = ? AND userId = ? AND paymentMethodId = 5 AND status = 1', [
        instanceId,
        user.id
      ])

      cards.forEach(card => {
        card.token = JSON.parse(card.token)
      })
      response = cards

    } catch (err) {
      console.log(err)
      response.error = err
    }

    await db.close()

    if (response.error) {
      throw response
    } else {
      return response
    }
  }

  User.remoteMethod('cardsByUser', {
    description: 'Get cards by user',
    http: {
      path: '/cards',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.sendSMS = async function (data) {
    let body = '<?xml version="1.0" encoding="utf-8"?>\
                <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">\
                  <soap12:Body>\
                    <postPwdRecovery xmlns="citrix6.calzzapato.com/">\
                      <aplicacion>' + configs.webServiceMayoristaApplication + '</aplicacion>\
                      <password>' + configs.webServiceMayoristaPassword + '</password>\
                      <movilDest>' + data.cellphone + '</movilDest>\
                      <textoSMS>' + data.message + '</textoSMS>\
                    </postPwdRecovery>\
                  </soap12:Body>\
                </soap12:Envelope>'

    try {
      let clzWebService = await Utils.request({
        url: configs.webServiceMayoristaURL + '?op=postPwdRecovery',
        method: 'POST',
        headers: {
          "content-type": "text/xml"
        },
        body: body
      })

      let result = convert.xml2json(clzWebService.body, { compact: true, spaces: 4 })
      result = JSON.parse(result)
      let message = result['soap:Envelope']['soap:Body']['postPwdRecoveryResponse']['postPwdRecoveryResult']
      if (Number(message['codigoRespuesta']['_text']) === 0) {
        return { success: true, message: message }
      } else {
        return { success: false, message: message }
      }
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  User.remoteMethod('sendSMS', {
    description: 'Send SMS to users',
    http: {
      path: '/send-sms',
      verb: 'POST'
    },
    accepts: [
      {
        arg: 'data', type: 'object', http: { source: 'body' }
      }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.generateCodeForValidateCellphoneOwn = async (req, data) => {
    let response = { success: false }
    let user = req.headers.user
    const db = await mysql.connectToDBManually()

    try {
      await db.beginTransaction()
      let validations = await db.query('SELECT * FROM ValidationCellphone WHERE userId IS NOT NULL AND applied = 1 AND cellphone = ? AND status = 1;', [
        data.cellphone
      ])

      if (validations.length > 0) {
        throw '0003'
      }

      if (data.newAccount !== undefined && data.newAccount) {
        let code = Utils.makeCode(6)

        await db.query('UPDATE ValidationCellphone SET status = 2 WHERE cellphone = ?', [
          data.cellphone
        ])

        let responseInsertValidationCellphone = await db.query('INSERT INTO ValidationCellphone (cellphone, code) VALUES (?, ?);', [
          data.cellphone,
          code
        ])

        if (responseInsertValidationCellphone.insertId !== undefined) {
          let responseSMS = await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/send-sms',
            method: 'POST',
            json: true,
            body: {
              cellphone: '+52' + data.cellphone,
              message: code + ' ES TU CODIGO DE VALIDACION CALZZAPATO. BIENVENIDO.'
            }
          })

          if (responseSMS.body !== undefined) {
            if (responseSMS.body.success) {
              response.success = responseSMS.body.success
              response.code = code
              await db.commit()
            } else {
              throw '0002'
            }
          }
          else {
            throw '0002'
          }
        }
        else {
          throw '0002'
        }
      } else {
        if (user === undefined || user.id === undefined || isNaN(Number(user.id)))
          throw '0001'

        let code = Utils.makeCode(6)
        await db.beginTransaction()
        await db.query('UPDATE ValidationCellphone SET status = 2 WHERE applied = 0 AND userId = ?', [
          user.id
        ])

        let responseInsertValidationCellphone = await db.query('INSERT INTO ValidationCellphone (userId, cellphone, code) VALUES (?, ?, ?);', [
          user.id,
          data.cellphone,
          code
        ])

        if (responseInsertValidationCellphone.insertId !== undefined) {
          let responseSMS = await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/send-sms',
            method: 'POST',
            json: true,
            body: {
              cellphone: '+52' + data.cellphone,
              message: code + ' ES TU CODIGO DE VALIDACION CALZZAPATO'
            }
          })

          if (responseSMS.body !== undefined) {
            if (responseSMS.body.success) {
              response.success = responseSMS.body.success
              if (process.env.NODE_ENV !== 'production') {
                response.code = code
              }
              await db.commit()
            } else {
              throw '0002'
            }
          }
          else {
            throw '0002'
          }
        }
        else {
          throw '0002'
        }
      }
    } catch (err) {
      console.log(err)
      response.error = err
      await db.rollback()
    }

    await db.close()

    if (response.error) {
      if (response.error === '0001') {
        throw 'Ocurrió un problema. Por favor, inicia sesión nuevamente.'
      } else if (response.error === '0002') {
        throw 'No se pudo generar el PIN de 6 dígitos. Por favor, intenta de nuevo más tarde.'
      } else if (response.error === '0003') {
        throw 'El número celular ingresado ya se encuentra en uso. Por favor, intenta de nuevo con otro número celular.'
      }
    } else {
      return response
    }
  }

  User.remoteMethod('generateCodeForValidateCellphoneOwn', {
    description: 'Generate code for validate cellphone',
    http: {
      path: '/generate-code',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.generateCodeForValidateCellphone = async (req, data) => {
    let response = { success: false }
    let user = req.headers.user
    const db = await mysql.connectToDBManually()

    let cellphone = ''
    if (user !== undefined) {
      cellphone = user.cellphone
    } else {
      cellphone = data.cellphone
    }
    let code = ''

    try {
      let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <CelularVerificarGet xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <NumCelular>' + cellphone + '</NumCelular>\
          </CelularVerificarGet>\
        </soap:Body>\
      </soap:Envelope>'

      let request = await Utils.request({
        method: 'POST',
        url: configs.webServiceVentaPublicoURL + '?op=CelularVerificarGet',
        headers: {
          "content-type": "text/xml"
        },
        body: body
      })

      if (request.body !== undefined) {
        let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
        result = JSON.parse(result)
        result = result['soap:Envelope']['soap:Body']['CelularVerificarGetResponse'][['CelularVerificarGetResult']]
        console.log(result)
        code = result.CodigoVerificador['_text']
      }

      if (code === 'False') {
        throw 'El número celular no es válido.'
      }

      if (data.newAccount !== undefined && data.newAccount) {
        await db.beginTransaction()
        await db.query('UPDATE ValidationCellphone SET status = 2 WHERE cellphone = ?', [
          data.cellphone
        ])

        await db.query('INSERT INTO ValidationCellphone (cellphone, code) VALUES (?, ?);', [
          data.cellphone,
          code
        ])

        response.success = true
        if (process.env.NODE_ENV !== 'production') {
          response.code = code
        }
        await db.commit()
      } else {
        if (user === undefined || user.id === undefined || isNaN(Number(user.id)))
          throw '0001'

        await db.beginTransaction()
        await db.query('UPDATE ValidationCellphone SET status = 2 WHERE applied = 0 AND userId = ?', [
          user.id
        ])

        await db.query('INSERT INTO ValidationCellphone (userId, cellphone, code) VALUES (?, ?, ?);', [
          user.id,
          data.cellphone,
          code
        ])

        console.log("CODE: ", code)
        response.success = true
        if (process.env.NODE_ENV !== 'production') {
          response.code = code
        }
        await db.commit()
      }
    } catch (err) {
      console.log(err)
      response.error = err
      await db.rollback()
    }

    await db.close()

    if (response.error) {
      if (response.error === '0001') {
        throw 'Ocurrió un problema. Por favor, inicia sesión nuevamente.'
      } else if (response.error === '0002') {
        throw 'No se pudo generar el PIN de 6 dígitos. Por favor, intenta de nuevo más tarde.'
      } else if (response.error === '0003') {
        throw 'El número celular ingresado ya se encuentra en uso. Por favor, intenta de nuevo con otro número celular.'
      } else {
        throw response.error
      }
    } else {
      return response
    }
  }

  User.remoteMethod('generateCodeForValidateCellphone', {
    description: 'Generate code for validate cellphone',
    http: {
      path: '/generate-code2',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.validateCodeForValidateCellphoneOwn = async (req, data) => {
    let response = { success: false }
    let user = req.headers.user
    const db = await mysql.connectToDBManually()

    try {
      if (data.newAccount !== undefined && data.newAccount) {
        await db.beginTransaction()
        if (data.code !== undefined && data.code.length === 6 && !isNaN(Number(data.code))) {
          let validations = await db.query('SELECT * FROM ValidationCellphone WHERE cellphone = ? AND code = ? AND applied = 0 AND status = 1 LIMIT 1;', [
            data.cellphone,
            data.code
          ])

          if (validations.length === 1) {
            let updated = await db.query('UPDATE ValidationCellphone SET applied = 1 WHERE status = 1 AND applied = 0 AND cellphone = ? AND id = ?', [
              data.cellphone,
              validations[0].id
            ])

            if (updated.changedRows === 1) {
              await db.commit()
              response.success = true
            } else {
              throw '0002'
            }
          } else {
            throw '0002'
          }
        } else {
          throw '0002'
        }
      } else {
        if (user === undefined || user.id === undefined || isNaN(Number(user.id)))
          throw '0001'

        await db.beginTransaction()
        if (data.code !== undefined && data.code.length === 6 && !isNaN(Number(data.code))) {
          let validations = await db.query('SELECT * FROM ValidationCellphone WHERE userId = ? AND code = ? AND applied = 0 AND status = 1 LIMIT 1;', [
            user.id,
            data.code
          ])

          if (validations.length === 1) {
            let updated = await db.query('UPDATE ValidationCellphone SET applied = 1 WHERE status = 1 AND applied = 0 AND userId = ? AND id = ?', [
              user.id,
              validations[0].id
            ])

            if (updated.changedRows === 1) {
              updated = await db.query('UPDATE User SET cellphone = ? WHERE id = ?', [
                validations[0].cellphone,
                user.id
              ])

              if (updated.affectedRows === 1) {
                await db.commit()
                response.success = true
              } else {
                throw '0002'
              }
            } else {
              throw '0002'
            }
          } else {
            throw '0002'
          }
        } else {
          throw '0002'
        }
      }
    } catch (err) {
      console.log(err)
      response.error = err
      await db.rollback()
    }

    await db.close()

    if (response.error) {
      if (response.error === '0001') {
        throw 'Ocurrió un problema. Por favor, inicia sesión nuevamente.'
      } else {
        throw 'No se pudo validar el código SMS. Por favor, intenta de nuevo más tarde.'
      }
    } else {
      return response
    }
  }

  User.remoteMethod('validateCodeForValidateCellphoneOwn', {
    description: 'Validate code for validate cellphone',
    http: {
      path: '/validate-code',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.validateCodeForValidateCellphone = async (req, data) => {
    let response = { success: false }
    let user = req.headers.user
    const db = await mysql.connectToDBManually()

    let cellphone = ''
    if (user !== undefined) {
      cellphone = user.cellphone
    } else {
      cellphone = data.cellphone
    }

    try {
      let body = '<?xml version="1.0" encoding="utf-8"?>\
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
          <CelularVerificarSet xmlns="http://tempuri.org/">\
            <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
            <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
            <NumCelular>' + cellphone + '</NumCelular>\
            <CodigoVerificador>' + data.code + '</CodigoVerificador>\
          </CelularVerificarSet>\
        </soap:Body>\
      </soap:Envelope>'

      let request = await Utils.request({
        method: 'POST',
        url: configs.webServiceVentaPublicoURL + '?op=CelularVerificarSet',
        headers: {
          "content-type": "text/xml"
        },
        body: body
      })

      if (request.body !== undefined) {
        console.log(request.body)
        let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
        result = JSON.parse(result)
        result = result['soap:Envelope']['soap:Body']['CelularVerificarSetResponse'][['CelularVerificarSetResult']]
        console.log(result)
        code = result.Verificar['_text']
      }

      if (code === 'False') {
        throw 'El código verificador no es válido.'
      }

      if (data.newAccount !== undefined && data.newAccount) {
        await db.beginTransaction()
        if (data.code !== undefined && data.code.length === 6 && !isNaN(Number(data.code))) {
          let validations = await db.query('SELECT * FROM ValidationCellphone WHERE cellphone = ? AND code = ? AND applied = 0 AND status = 1 LIMIT 1;', [
            data.cellphone,
            data.code
          ])

          if (validations.length === 1) {
            let updated = await db.query('UPDATE ValidationCellphone SET applied = 1 WHERE status = 1 AND applied = 0 AND cellphone = ? AND id = ?', [
              data.cellphone,
              validations[0].id
            ])

            if (updated.changedRows === 1) {
              await db.commit()
              response.success = true
            } else {
              throw '0002'
            }
          } else {
            throw '0002'
          }
        } else {
          throw '0002'
        }
      } else {
        if (user === undefined || user.id === undefined || isNaN(Number(user.id)))
          throw '0001'

        await db.beginTransaction()
        if (data.code !== undefined && data.code.length === 6 && !isNaN(Number(data.code))) {
          let validations = await db.query('SELECT * FROM ValidationCellphone WHERE userId = ? AND code = ? AND applied = 0 AND status = 1 LIMIT 1;', [
            user.id,
            data.code
          ])

          if (validations.length === 1) {
            let updated = await db.query('UPDATE ValidationCellphone SET applied = 1 WHERE status = 1 AND applied = 0 AND userId = ? AND id = ?', [
              user.id,
              validations[0].id
            ])

            if (updated.changedRows === 1) {
              updated = await db.query('UPDATE User SET cellphone = ? WHERE id = ?', [
                validations[0].cellphone,
                user.id
              ])

              if (updated.affectedRows === 1) {
                await db.commit()
                response.success = true
              } else {
                throw '0002'
              }
            } else {
              throw '0002'
            }
          } else {
            throw '0002'
          }
        } else {
          throw '0002'
        }
      }
    } catch (err) {
      console.log(err)
      response.error = err
      await db.rollback()
    }

    await db.close()

    if (response.error) {
      if (response.error === '0001') {
        throw 'Ocurrió un problema. Por favor, inicia sesión nuevamente.'
      } else {
        throw 'No se pudo validar el código SMS. Por favor, intenta de nuevo más tarde.'
      }
    } else {
      return response
    }
  }

  User.remoteMethod('validateCodeForValidateCellphone', {
    description: 'Validate code for validate cellphone',
    http: {
      path: '/validate-code2',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.checkCellphone = async (req) => {
    let response = { success: false, validated: false }
    let user = req.headers.user
    const db = await mysql.connectToDBManually()

    try {
      if (user === undefined || user.id === undefined || isNaN(Number(user.id)))
        throw 'Ocurrió un problema. Por favor, inicia sesión e intenta de nuevo.'

      let validations = await db.query('SELECT * FROM ValidationCellphone WHERE userId = ? AND applied = 1 AND status = 1 LIMIT 1;', [
        user.id
      ])

      if (validations.length === 1) {
        response.validated = true
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }

    await db.close()

    if (response.error) {
      throw response
    } else {
      response.success = true
      return response
    }
  }

  User.remoteMethod('checkCellphone', {
    description: 'Check cellphone',
    http: {
      path: '/check-cellphone',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.getCatalogs = async (req) => {
    let response = []
    let user = req.headers.user

    try {
      const mdb = mongodb.getConnection('db')

      let catalogs = await mongodb.findMongoDB(mdb, 'Catalog', { userId: user.id, status: true, })

      if (catalogs !== undefined && catalogs !== null  && catalogs.length > 0) {
        await Utils.asyncForEach(catalogs, async (catalog) => {
          let products = []

          catalog.products = 0

          if (catalog.configs === undefined || catalog.configs === null){
            products = undefined
          } else {
            if ((catalog.configs.categories !== undefined && catalog.configs.categories !== null && catalog.configs.categories.length > 0) || 
                (catalog.configs.brands !== undefined && catalog.configs.brands !== null && catalog.configs.brands.length > 0) ||
                (catalog.configs.productsCodes !== undefined && catalog.configs.productsCodes !== null && catalog.configs.productsCodes.length > 0) ||
                (catalog.configs.withDiscount)) {
                  products = await Utils.request({
                    url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products?filter=' + JSON.stringify(catalog.configs.query),
                    method: 'GET'
                  })
            } else {
              products = undefined
            }
          }

          if (products !== undefined && products !== null) {
            let productsListSize = JSON.parse(products.body).filter((product) => catalog.configs.deletedProducts !== undefined ? !catalog.configs.deletedProducts.includes(product.code) : true)
            catalog.products = productsListSize.length
           
          }
        })

        response = catalogs.reverse()
      }
    } catch (err) {
      console.log(err)
    }

    if (response.error) {
      throw response
    }

    return response
  }

  User.remoteMethod('getCatalogs', {
    description: 'Get catalog by user',
    http: {
      path: '/catalogs',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  // Get active shopping cart by user

  User.getShoppingCartByUser = async (req) => {
    let response = {}
    let db = await mysql.connectToDBManually()
    let totalProducts = 0
    let totalSubtotal = 0

    const mdb = mongodb.getConnection('db')

    try {
      const zip = req.headers.zip || ''
      let userId = null
      let uuid = null

      if (req.headers.metadata !== undefined) {
        let metadata = JSON.parse(req.headers.metadata)
        if (metadata.uuid !== undefined && metadata.uuid !== null && !Utils.isEmpty(metadata.uuid)) {
          uuid = metadata.uuid
        }
      }

      let query = { '$and': [{ uuid: uuid }, { status: true }] }
      if (req.headers.user !== undefined) {
        userId = Number(req.headers.user.id)
        query = { '$and': [{ user: userId }, { status: true }] }
      }

      if (uuid === null && userId === null) {
        throw 500
      }

      let carts = await mongodb.mongoFind(mdb, 'Cart', query)
      if (carts.length === 1) {
        carts[0].id = carts[0]._id
        delete carts[0]._id
        let products = []
        let cartProducts = []

        if (req.headers.checkout === null || req.headers.checkout === undefined || req.headers.checkout !== 'true') {
          carts[0].products.forEach(product => {
            let index = cartProducts.findIndex(element => element.article === product.article)
            if (index === -1) {
              cartProducts.push(product)
            } else {
              cartProducts[index].quantity = Number(cartProducts[index].quantity) + 1
            }
          })
        } else {
          cartProducts = carts[0].products
        }
        await Utils.asyncForEach(cartProducts, async (item, idx) => {
          // Revisar vigencia del producto
          let checkProduct = await Utils.loopbackFind(User.app.models.Product, { where: { code: item.code }, include: ['brand', 'color'] })
          if (checkProduct.length === 1) {
            // Revisar existencia
            let stock = 0
            if (checkProduct[0].stock.status) {
              let checkStock = await Utils.request({ method: 'GET', url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products/' + item.code + '/stock', json: true })
              checkStock.body.forEach(product => {
                if (product.article === item.article) {
                  stock += Number(product.stock)
                }
              })
            }

            if (stock >= item.quantity || !checkProduct[0].stock.status) {
              delete checkProduct[0].source
              checkProduct[0].selection = item
              item = checkProduct[0]
              item.location = null
              item.changeQuantity = checkProduct[0].stock.status
              item.selectorQuantity = []
              for (let i = 1; i <= stock; i++) {
                if (i > 10)
                  break
                item.selectorQuantity.push({ value: i, description: i })
              }


              if (!Utils.isEmpty(zip)) {
                let checkLocations = await Utils.request({
                  method: 'POST', url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products/locations', json: true, body: {
                    data: {
                      deliveryZip: zip,
                      products: [{
                        code: checkProduct[0].selection.code,
                        size: checkProduct[0].selection.size,
                        quantity: checkProduct[0].selection.quantity,
                        stock: checkProduct[0].stock
                      }]
                    }
                  }
                })
                if (checkLocations.body !== undefined) {
                  item.location = checkLocations.body
                }
              }

              if (item.percentagePrice > 0) {
                item.subtotal = (item.discountPrice * item.selection.quantity)
              } else {
                item.subtotal = (item.price * item.selection.quantity)
              }
              totalProducts += item.selection.quantity
              totalSubtotal += item.subtotal
              item.recharge = false
              if (item.brand.name.toUpperCase().includes('TELCEL')) {
                item.recharge = true
              }
              products.push(item)
            }
          }
        })
        delete carts[0].historial
        carts[0].products = products
        response = carts[0]
        response.totalProducts = totalProducts
        response.subtotal = totalSubtotal

        // Costo de envio.
        let minimiumAmount = await db.query('SELECT `minimiumAmount` FROM `ShippingMethod` WHERE `id` = 1 LIMIT 1;')
        if (minimiumAmount.length === 0) {
          minimiumAmount = 999
        } else {
          minimiumAmount = minimiumAmount[0].minimiumAmount
          minimiumAmount = Number(minimiumAmount)
        }
        let shippingCost = await db.query('SELECT `cost` FROM `ShippingMethod` WHERE `id` = 2 LIMIT 1;')
        if (shippingCost.length === 0) {
          shippingCost = 99
        } else {
          shippingCost = shippingCost[0].cost
          shippingCost = Number(shippingCost)
        }
        if (response.subtotal < minimiumAmount) {
          response.shippingMethod = {
            name: 'ESTÁNDAR',
            description: 'Envíos a todo México.',
            shippingCost: shippingCost
          }
          response.total = Number(response.subtotal) + Number(shippingCost)
        } else {
          response.shippingMethod = {
            name: 'Gratis',
            description: 'Envíos a todo México.',
            shippingCost: 0
          }
          response.total = Number(response.subtotal)

        }
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }
    await db.close()
    if (response.error) {
      throw response.error
    } else {
      return response
    }
  }

  User.remoteMethod('getShoppingCartByUser', {
    description: 'Get active cart by user',
    http: {
      path: '/cart',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.getProductToBuy = async (req, data) => {
    let response = {}
    let totalProducts = 0
    let totalSubtotal = 0
    try {
      const zip = req.headers.zip || ''
      let products = []

      await Utils.asyncForEach([data], async (item, idx) => {
        // Revisar vigencia del producto
        let checkProduct = await Utils.loopbackFind(User.app.models.Product, { where: { code: item.code }, include: ['brand'] })
        if (checkProduct.length === 1) {
          // Revisar existencia
          let stock = 0
          if (checkProduct[0].stock.status) {
            let checkStock = await Utils.request({ method: 'GET', url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products/' + item.code + '/stock', json: true })
            checkStock.body.forEach(product => {
              if (product.article === item.article) {
                stock += Number(product.stock)
              }
            })
          }

          if (stock >= item.quantity || !checkProduct[0].stock.status) {
            delete checkProduct[0].source
            checkProduct[0].selection = item
            item = checkProduct[0]
            item.location = null
            item.changeQuantity = checkProduct[0].stock.status
            item.selectorQuantity = []
            for (let i = 1; i <= stock; i++) {
              if (i > 10)
                break
              item.selectorQuantity.push({ value: i, description: i })
            }

            if (!Utils.isEmpty(zip)) {
              let checkLocations = await Utils.request({
                method: 'POST', url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products/locations', json: true, body: {
                  data: {
                    deliveryZip: zip,
                    products: [{
                      code: checkProduct[0].selection.code,
                      size: checkProduct[0].selection.size,
                      quantity: checkProduct[0].selection.quantity,
                      stock: checkProduct[0].stock
                    }]
                  }
                }
              })
              if (checkLocations.body !== undefined) {
                item.location = checkLocations.body
              }
            }

            if (item.percentagePrice > 0) {
              item.subtotal = (item.discountPrice * item.selection.quantity)
            } else {
              item.subtotal = (item.price * item.selection.quantity)
            }
            totalProducts += item.selection.quantity
            totalSubtotal += item.subtotal
            item.recharge = false
            if (item.brand.name.toUpperCase().includes('TELCEL')) {
              item.recharge = true
            }
            products.push(item)
          }
        }
      })
      response = {
        products: products
      }
      response.totalProducts = totalProducts
      response.subtotal = totalSubtotal
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

  User.remoteMethod('getProductToBuy', {
    description: 'Get product to buy by user',
    http: {
      path: '/buy',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object' }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.orderDetail = async (req, folio) => {
    let response = {}
    let user = req.headers.user

    const mdb = mongodb.getConnection('db')
    const db = await mysql.connectToDBManually()

    try {
      if (user !== undefined && !isNaN(user.id)) {
        let order = await db.query('SELECT `id`, `calzzapatoCode`, `order`, `reference`, `pipeline`, `discount`, `shippingCost`, `subtotal`, `shippingMethodId`, `paymentMethodId`, `shippingAddressId`, `total`, `createdAt` AS shoppingDate, TIMESTAMPADD(DAY, 7, createdAt) as deliveryDate FROM `Order` WHERE `order` = ? LIMIT 1;', [folio])
        let responseWebService = null
        responseWebService = await Utils.request(configs.HOST + ':' + configs.PORT + '/api/orders/' + folio + '/tracking')
        order[0]['orderStatus'] = JSON.parse(responseWebService.body) || [{ current: '1' }]

        order[0]['orderDetail'] = await db.query('SELECT `productCode`, `productArticleCode`, `productDescription`, `quantity`, `size`, `unitPrice`, `saved` FROM `OrderDetail` WHERE orderId = ? AND status = 1;', [order[0].id])

        let address = await db.query('SELECT sa.name, sa.lastName, a.zip, a.street, a.exteriorNumber, a.interiorNumber, l.name AS locationName, l.zone AS locationZone, lt.name AS locationType, m.name AS municipalityName, s.name AS stateName FROM ShippingAddress AS sa LEFT JOIN Address AS a ON sa.addressId = a.id LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode LEFT JOIN State AS s ON s.code = m.stateCode WHERE sa.id = ? LIMIT 1;', [order[0].shippingAddressId])
        let paymentMethod = await db.query('SELECT `id`, `name`, `description` FROM `PaymentMethod` WHERE id = ? LIMIT 1;', [order[0].paymentMethodId])
        let shippingMethod = await db.query('SELECT `name`, `description` FROM `ShippingMethod` WHERE id = ? LIMIT 1;', [order[0].shippingMethodId])
        let enviaLink = await db.query('SELECT trackUrl FROM OrderShipping WHERE orderId = ? AND status = 1 LIMIT 1;', [order[0].id])

        order[0]['address'] = address[0]
        order[0]['paymentMethod'] = paymentMethod[0]
        order[0]['shippingMethod'] = shippingMethod[0]
        order[0]['enviaInformation'] = enviaLink[0]

        var cancelado = false
        var credivale = false
        var steps = [{ id: 1, name: 'Por pagar' }, { id: 2, name: 'Pagado' }, { id: 3, name: 'Procesando pedido' }, { id: 4, name: 'Por enviar' }, { id: 5, name: 'Enviado' }]
        // Validar si es crediVale
        if (order[0].paymentMethodId === 2) {
          steps = [{ id: 1, name: 'Validando' }, { id: 2, name: 'Validado' }, { id: 3, name: 'Enviado' }]
          credivale = true
        }
        // validación
        let current = ''
        try {
          current = order[0]['orderStatus'][0].current
        } catch (error) {
          order[0]['orderStatus'] = [{
            current: '1'
          }
          ]
        }
        if (current === '6' || current === 6) {
          cancelado = true
          steps.push({ id: steps.length + 1, name: 'Cancelado' })
        } else {
          steps.push({ id: steps.length + 1, name: 'Entregado' })
        }
        if (!credivale) {
          if (!cancelado) {
            if (order[0].calzzapatoCode) {
              // Tiene calzzapatoCode
              if (order[0]['orderStatus'][0].current === '1' || order[0]['orderStatus'][0].current === 1) {
                order[0]['orderStatus'][0].current = '2'
              } else {
                var parsedNumber = parseInt(order[0]['orderStatus'][0].current) + 1
                order[0]['orderStatus'][0].current = parsedNumber + ""
              }
            } else {
              order[0]['orderStatus'][0].current = '1'
            }
          }

        } else {
          if (!cancelado) {
            if (order[0].calzzapatoCode) {
              if (order[0]['orderStatus'][0].current === '1' || order[0]['orderStatus'][0].current === 1 || order[0]['orderStatus'][0].current === '2' || order[0]['orderStatus'][0].current === 2) {
                order[0]['orderStatus'][0].current = '1'
              } else {
                var parsedNumber = parseInt(order[0]['orderStatus'][0].current) - 1
                order[0]['orderStatus'][0].current = parsedNumber + ""
              }
            } else {
              order[0]['orderStatus'][0].current = '1'
            }
          } else {
            order[0]['orderStatus'][0].current = '4'
          }
        }

        order[0]['orderStatus'].map(item => item['steps'] = steps)
        order[0]['orderDetail'].forEach((element, index) => {
          order[0]['orderDetail'][index].quantity = Number(element.quantity)
          order[0]['orderDetail'][index].saved = Number(element.saved)
          order[0]['orderDetail'][index].oldUnitPrice = Number(element.unitPrice) + Number(element.saved)
          order[0]['orderDetail'][index].unitPrice = Number(element.unitPrice)
          order[0]['orderDetail'][index].oldSubtotal = order[0]['orderDetail'][index].oldUnitPrice * Number(element.quantity)
          order[0]['orderDetail'][index].subtotal = order[0]['orderDetail'][index].unitPrice * Number(element.quantity)
          if (!order[0]['orderStatus'][index]) {
            element['orderStatus'] = order[0]['orderStatus'][0]
          } else {
            element['orderStatus'] = order[0]['orderStatus'][index]
          }
        })


        delete order[0]['orderStatus']
        order[0].discount = Number(order[0].discount)
        order[0].shippingCost = Number(order[0].shippingCost)
        order[0].subtotal = Number(order[0].subtotal)
        order[0].total = Number(order[0].total)
        await Utils.asyncForEach(order[0].orderDetail, async (detail) => {
          let photos = await mongodb.mongoFind(mdb, 'Product', {
            code: detail.productCode
          })

          let url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/"
          if (photos.length > 0) {
            if (photos[0].photos.length > 0) {
              url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/" + photos[0].photos[0].description
            }
          }
          detail["image"] = url
        })
        response = order[0]
      }
    } catch (err) {
      await db.close()
      throw err
    }

    await db.close()
    return response
  }

  User.remoteMethod('orderDetail', {
    description: 'Get orders by user',
    http: {
      path: '/orders/:folio',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'folio', type: 'string', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.getProductsSeen = async (req) => {
    let response = []
    let user = req.headers.user
    let instance = req.headers.instanceId

    const mdb = mongodb.getConnection('db')
    const db = await mysql.connectToDBManually()

    try {
      if (user !== undefined && !isNaN(user.id)) {
        // Obtener los códigos de productos de mongo
        let productCodes = []
        try {
          productCodes = await mongodb.mongoFind(mdb, 'RecentlySeen', { userId: user.id, instanceId: instance })

          let products = []
          if (productCodes.length !== 0) {
            await Utils.asyncForEach(productCodes[0].products, async (productCode) => {
              let mongoProduct = await Utils.loopbackFind(User.app.models.Product, { where: { code: productCode }, include: ['brand', 'color', 'gender', 'detail'] })
              if (mongoProduct.length > 0) {
                products.push(mongoProduct[0])
              }
            })
            response = products
          }

        } catch (error) {
          console.log('Error en product seen', error)
          response = []
        }

      }
    } catch (err) {
      await db.close()
      return []
    }

    await db.close()
    return response
  }

  User.remoteMethod('getProductsSeen', {
    description: 'Find a recently products seen ',
    http: {
      path: '/seen/products',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.getProductsRecomendation = async (req) => {
    let response = []
    let user = req.headers.user
    let instance = req.headers.instanceId
    let MAX_PRODUCTS_RECOMENDATION = 50

    const mdb = mongodb.getConnection('db')

    try {
      if (user !== undefined && !isNaN(user.id)) {
        let productCodes = await mongodb.mongoFind(mdb, 'RecentlySeen', { userId: user.id, instanceId: instance })

        // Recomendations
        if (productCodes.length > 0) {
          // Operación para saber cuantos productos recomendar por producto visto
          let maxProductsRecomendation = Math.round(MAX_PRODUCTS_RECOMENDATION / productCodes[0].products.length)
          maxProductsRecomendation++
          if (maxProductsRecomendation > 5) {
            maxProductsRecomendation = 5
          }
          let productToSave = []

          await Utils.asyncForEach(productCodes[0].products, async (productCode) => {

            // Hacer consulta para ver info de producto
            let product = await Utils.loopbackFind(User.app.models.Product, { where: { code: productCode } })

            if (product.length > 0) {
              // Ya teniedo el producto, buscar productos relacionados con brand y category que no sea el producto visto
              let recomendationProducts = await Utils.loopbackFind(User.app.models.Product, { where: { and: [{ categoryCode: product[0].categoryCode }, { brandCode: product[0].brandCode }], code: { nlike: productCode } }, limit: maxProductsRecomendation, include: ['brand', 'color', 'gender', 'detail'] })
              if (recomendationProducts.length > 0) {
                recomendationProducts.map(item => {
                  if (productToSave.length !== MAX_PRODUCTS_RECOMENDATION) {
                    // Revisar que no exista en productos vistos
                    ((productCodes[0].products.find(element => element === item.code) || (productToSave.find(element => element.code === item.code)))) ? '' : productToSave.push(item)
                  }
                })
              }
            }
          })
          response = productToSave
        }
      }
    } catch (err) {
      return []
    }
    return response
  }

  User.remoteMethod('getProductsRecomendation', {
    description: 'Get a product recomendation ',
    http: {
      path: '/recomendation/products',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })


  User.getProductsQuery = async (data, req) => {
    let response = []
    let query = ''
    let queryObject = null
    try {
      if (data.data !== undefined && data.data !== null && data.data.query !== undefined && data.data.query !== null) {
        if (typeof data.data.query === 'string') {
          query = data.data.query.replace('\\', '')
          queryObject = JSON.parse(query)
        } else {
          queryObject = data.data.query
        }
        if (queryObject !== null) {
          let products = await Utils.request({
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/products?filter=' + JSON.stringify(queryObject),
            method: 'GET'
          })
          if (products.body !== undefined) {
            response = JSON.parse(products.body)
          }
        }
      }
    } catch (err) {
      throw err
    }
    return response
  }
  User.remoteMethod('getProductsQuery', {
    description: 'Find a recently products seen ',
    http: {
      path: '/products/query',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: 'object', http: { source: 'body' }, require: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.activation = async (req, data) => {
    let error = null
    let message = 'No se ha podido activar la cuenta. Por favor, intenta de nuevo más tarde.'
    let activation = false
    let step = 0
    let user = null
    let password = crypto.createHash('sha256').update(data.password).digest('hex')
    let UUID = '054b980b-6f4e-4d0c-8d53-1915be4abea2'

    try {

      // Activación Monedero Azul ® solo cuando es nuevo usuario
      if (data.new) {
        let enteredAge = Utils.getAge(data.birthday)

        if (Utils.checkSpecialCharacters(data.name) || Utils.checkSpecialCharacters(data.firstLastName) || Utils.checkSpecialCharacters(data.secondLastName)) {
          return {
            activation: activation,
            message: 'El nombre, primer apellido y/o segundo apellido no debe contener caracteres especiales.',
            step: step,
            user: null
          }
        }

        // ID: 1 - Validate email
        if (!Utils.validateEmail(data.email)) {
          return {
            activation: activation,
            message: 'Correo electrónico inválido.',
            step: step,
            user: null
          }
        }

        // ID: 2 - Validate cellphone
        if (data.cellphone.length !== 10) {
          return {
            activation: activation,
            message: 'Número celular inválido.',
            step: step,
            user: null
          }
        }

        // ID: 4 - Validate date (18 to 90)
        if (enteredAge < 18 || enteredAge > 90) {
          return {
            activation: activation,
            message: 'Edad no permitida. Debe proporcionar una edad dentro de los 18 y 90 años.',
            step: step,
            user: null
          }
        }

        // ID: 10 - Validate name and firstLastName
        if (Utils.isEmpty(data.name.trim()) || Utils.isEmpty(data.firstLastName.trim())) {
          return {
            activation: activation,
            message: 'Nombre y primer apellido obligatorio.',
            step: step,
            user: null
          }
        }

        let responseNewRegister = await Utils.request({
          method: 'POST',
          json: true,
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/create',
          body: {
            data: {
              name: data.name,
              firstLastName: data.firstLastName,
              secondLastName: data.secondLastName,
              email: data.email,
              cellphone: data.cellphone,
              password: data.password,
              gender: data.gender,
              birthday: data.birthday,
              newsletter: data.newsletter,
              code: data.code,
              userSet: true
            }
          },
          headers: {
            uuid: UUID,
            metadata: req.headers.metadata
          }
        })

        if (responseNewRegister.body === undefined || !responseNewRegister.body.created) {
          return {
            activation: activation,
            message: 'No se ha podido crear la nueva cuenta de usuario. Por favor, intenta de nuevo más tarde.',
            step: step,
            user: null
          }
        }

        data.user = data.email
      }

      // Actualizar datos
      if (data.update) {
        let enteredAge = Utils.getAge(data.updateData.birthday)

        // ID: 4 - Validate date (18 to 90)
        if (enteredAge < 18 || enteredAge > 90) {
          return {
            activation: activation,
            message: 'Edad no permitida. Debe proporcionar una edad dentro de los 18 y 90 años.',
            step: step,
            user: null
          }
        }

        let response = await Utils.request({
          method: 'PUT',
          json: true,
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/update-info',
          body: {
            data: {
              name: data.updateData.name,
              firstLastName: data.updateData.firstLastName,
              secondLastName: data.updateData.secondLastName,
              genderId: data.updateData.gender,
              birthday: data.updateData.birthday
            }
          },
          headers: {
            uuid: UUID,
            authorization: req.headers.authorization,
            metadata: req.headers.metadata
          }
        })

        if (response.body === undefined || response.body === null) {
          return {
            activation: activation,
            message: 'No se ha podido actualizar la información. Por favor, intenta de nuevo más tarde.',
            step: step,
            user: null
          }
        }
      }

      let dataLogin = {
        withFacebook: false,
        email: data.user,
        password: data.password
      }

      if (data.withFacebook) {
        dataLogin = {
          withFacebook: true,
          facebookId: data.facebookId,
          accessToken: data.accessToken
        }
      }

      // Autenticar usuario
      let response = await Utils.request({
        method: 'POST',
        json: true,
        url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/signin',
        body: dataLogin,
        headers: {
          uuid: UUID,
          metadata: req.headers.metadata
        }
      })

      console.log(response,"Autenticar usuario ------");

      if (response.body !== undefined) {
        if (response.body.token !== undefined) {
          let headers = {
            uuid: UUID,
            authorization: response.body.token,
            metadata: req.headers.metadata
          }

          let auth = await Utils.request({
            method: 'GET',
            json: true,
            url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/auth',
            headers: headers
          })

          // Ver si es candidato a activar
          if (auth.body !== undefined) {
            user = auth.body

            if (user.calzzapatoUserId !== null) {
              throw 'La cuenta ya se encuentra activada.'
            }

            let enteredAge = Utils.getAge(user.birthday)

            // ID: 4 - Validate date (18 to 90)
            let age = false
            if (enteredAge => 18 && enteredAge <= 90) {
              age = true
            }

            if (user.validationCellphone && user.genderId !== null && age) {
              // Activar
              let gender = 'F'
              if (user.genderId === 2) {
                gender = 'M'
              }

              let birthday = new Date(user.birthday)
              let month = birthday.getMonth() + 1
              if (month <= 9) {
                month = '0' + month
              }

              let day = birthday.getDate()
              if (day <= 9) {
                day = '0' + day
              }

              let body = '<?xml version="1.0" encoding="utf-8"?>\
              <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                <soap:Body>\
                  <UsuarioSet xmlns="http://tempuri.org/">\
                    <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
                    <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
                    <APaterno>' + user.firstLastName.trim() + '</APaterno>\
                    <AMaterno>' + user.secondLastName.trim() + '</AMaterno>\
                    <Nombre>' + user.name.trim() + '</Nombre>\
                    <Sexo>' + gender + '</Sexo>\
                    <FechaNacimiento>' + birthday.getFullYear() + '-' + month + '-' + day + '</FechaNacimiento>\
                    <CorreoElectronico>' + user.email + '</CorreoElectronico>\
                    <NumCelular>' + user.cellphone + '</NumCelular>\
                    <CodigoVerificador>-999</CodigoVerificador>\
                    <PasswordUsuario>' + password + '</PasswordUsuario>\
                    <IdAplicacion>2</IdAplicacion>\
                    <IdUsuarioExterno>' + user.id + '</IdUsuarioExterno>\
                  </UsuarioSet>\
                </soap:Body>\
              </soap:Envelope>'

              console.log(body)

              let request = await Utils.request({
                method: 'POST',
                url: configs.webServiceVentaPublicoURL + '?op=UsuarioSet',
                headers: {
                  "content-type": "text/xml"
                },
                body: body
              })

              if (request.body !== undefined) {
                console.log(request.body)
                let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
                result = JSON.parse(result)
                result = result['soap:Envelope']['soap:Body']['UsuarioSetResponse'][['UsuarioSetResult']]
                if (result.Numero !== undefined && Number(result.Numero['_text']) > 0) {
                  const db = await mysql.connectToDBManually()
                  await db.query('UPDATE User SET calzzapatoUserId = ? WHERE id = ?', [
                    Number(result.Numero['_text']),
                    user.id
                  ])
                  await db.close()

                  body = '<?xml version="1.0" encoding="utf-8"?>\
                  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                    <soap:Body>\
                      <GenerarMonederoSet xmlns="http://tempuri.org/">\
                        <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
                        <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
                        <IDUsuario>' + result.Numero['_text'] + '</IDUsuario>\
                      </GenerarMonederoSet>\
                    </soap:Body>\
                  </soap:Envelope>'

                  request = await Utils.request({
                    method: 'POST',
                    url: configs.webServiceVentaPublicoURL + '?op=GenerarMonederoSet',
                    headers: {
                      "content-type": "text/xml"
                    },
                    body: body
                  })

                  if (request.body !== undefined) {
                    message = 'Cuenta con Monedero Azul ® activado.'
                    activation = true
                  } else {
                    throw 'Ocurrió un problema al activar Monedero Azul ®'
                  }
                } else {
                  if (Number(result.idError['_text']) === 1) {
                    throw 'No se ha podido activar la cuenta de usuario. Email inválido.'
                  } else if (Number(result.idError['_text']) === 2) {
                    const db = await mysql.connectToDBManually()
                    await db.query('UPDATE ValidationCellphone SET status = 2 WHERE userId = ?', [
                      user.id
                    ])
                    await db.close()
                    user.validationCellphone = false
                    message = 'Proporciona un número de celular válido.'
                    step = 2
                  } else if (Number(result.idError['_text']) === 3) {
                    throw 'No se ha podido activar la cuenta de usuario. Email en uso.'
                  } else if (Number(result.idError['_text']) === 4) {
                    const db = await mysql.connectToDBManually()
                    await db.query('UPDATE User SET birthday = null WHERE id = ?', [
                      user.id
                    ])
                    await db.close()
                    user.birthday = null
                    message = 'Edad inválida (rango: 18 a 90 años).'
                    step = 2
                  } else if (Number(result.idError['_text']) === 5) {
                    throw 'No se ha podido activar la cuenta de usuario. Problema ID de aplicación.'
                  } else if (Number(result.idError['_text']) === 6) {
                    throw 'No se ha podido activar la cuenta de usuario. Problema ID de usuario.'
                  } else if (Number(result.idError['_text']) === 7) {
                    throw 'No se ha podido activar la cuenta de usuario. Problema al asignar puntos de bienvenida.'
                  } else if (Number(result.idError['_text']) === 8) {
                    const db = await mysql.connectToDBManually()
                    await db.query('UPDATE ValidationCellphone SET status = 2 WHERE userId = ?', [
                      user.id
                    ])
                    await db.close()
                    user.validationCellphone = false
                    message = 'Proporciona un número de celular válido.'
                    step = 2
                  } else if (Number(result.idError['_text']) === 9) {
                    throw 'No se ha podido activar la cuenta de usuario. Código de verificación no válido.'
                  } else if (Number(result.idError['_text']) === 10) {
                    if (Utils.checkSpecialCharacters(user.name)) {
                      user.name = ''
                    }
                    if (Utils.checkSpecialCharacters(user.firstLastName)) {
                      user.firstLastName = ''
                    }
                    if (Utils.checkSpecialCharacters(user.secondLastName)) {
                      user.secondLastName = ''
                    }
                    message = 'No se ha podido activar la cuenta de usuario. Nombre y primer apellido obligatorio (no debe tener caracteres especiales).'
                    step = 2
                  }
                }
              } else {
                throw 'Ocurrió un problema al activar cuenta.'
              }
            } else {
              message = 'Completa tu perfil para activar tu Monedero Azul ®'
              step = 2
            }
          }
        }
      }
    } catch (err) {
      error = err
      console.log(err)
    }

    if (error !== null) {
      throw error
    } else {
      //Aqui registramos el ticket 
      if (activation && data.ticket !== undefined) {
        let response = await Utils.request({
          method: 'POST',
          json: true,
          url: configs.HOST_IP + ':' + configs.PORT_IP + '/api/users/add-ticket',
          body: {
            ticket: data.ticket,
            email: data.email
          },
          headers: {
            uuid: UUID,
            metadata: req.headers.metadata
          }
        })

        // User state 
        //-1: No registrado
        // 0: No activo
        // 1: Activo

        if (response.data !== undefined) {
          message = message + '\n' + response.data.message
        }
      }

      return {
        activation: activation,
        message: message,
        step: step,
        user: user
      }
    }
  }

  User.remoteMethod('activation', {
    description: 'Activation Monedero Azul',
    http: {
      path: '/activation',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'Object',
      root: true
    }
  })

  User.getTokensforTracking = async function (data) {
    let response = null
    const db = await mysql.connectToDBManually()
    try {
      let tokens = await db.query('SELECT ft.*, o.order AS folio, i.alias, ft.instanceId, i.alias \
      FROM FirebaseToken AS ft\
      LEFT JOIN Device AS d ON d.id = ft.deviceId\
      LEFT JOIN User AS u ON u.id = d.userId\
      LEFT JOIN `Order` AS o ON o.userId = u.id\
      LEFT JOIN Instance AS i ON i.id = ft.instanceId\
      WHERE o.id = ? AND o.status = 1 AND ft.token IS NOT NULL ORDER BY ft.updatedAt DESC;', [data.orderId])
      if (tokens.length > 0) {
        response = tokens
      }
    } catch (err) {
      console.log("ERRROR:", err)
    }

    await db.close()
    return response
  }

  User.remoteMethod('getTokensforTracking', {
    description: 'Get token for use in tracking',
    http: {
      path: '/token',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: "object", http: { source: 'body' }, require: true },
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.createCalzzamovilRating = async function (data) {
    let response = { updated: false }
    const db = await mysql.connectToDBManually()
    try {
      let updateResponse = await db.query('UPDATE Calzzamovil SET rating = ?, feedback = ? WHERE orderId = ?', [data.rating, data.feedback, data.orderId])
      if (updateResponse.affectedRows) {
        response.updated = true
      }
    } catch (err) {
      console.log("ERRROR:", err)
      response.error = true
    }

    await db.close()
    return response
  }

  User.remoteMethod('createCalzzamovilRating', {
    description: 'Create feedback',
    http: {
      path: '/rating/create',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: "object", http: { source: 'body' }, require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.orderDetailCalzzamovil = async (req, folio) => {
    let response = {}

    const mdb = mongodb.getConnection('db')
    const db = await mysql.connectToDBManually()

    try {
      let order = await db.query('SELECT `id`, `calzzapatoCode`, `order`, `reference`, `pipeline`, `discount`, `shippingCost`, `subtotal`, `shippingMethodId`, `paymentMethodId`, `shippingAddressId`, `total`, `createdAt` AS shoppingDate, TIMESTAMPADD(DAY, 7, createdAt) as deliveryDate, pointsExchange FROM `Order` WHERE `order` = ? LIMIT 1;', [folio])

      let responseWebService = null
      responseWebService = await Utils.request(configs.HOST + ':' + configs.PORT + '/api/orders/' + folio + '/tracking')
      order[0]['orderStatus'] = JSON.parse(responseWebService.body) || [{ current: '1' }]

      order[0]['orderDetail'] = await db.query('SELECT `productCode`, `productArticleCode`, `productDescription`, `quantity`, `size`, `unitPrice`, `saved` FROM `OrderDetail` WHERE orderId = ? AND status = 1;', [order[0].id])

      let address = await db.query('SELECT sa.name, sa.lastName, a.zip, a.street, a.exteriorNumber, a.interiorNumber, l.name AS locationName, l.zone AS locationZone, lt.name AS locationType, m.name AS municipalityName, s.name AS stateName, a.lat, a.lng FROM ShippingAddress AS sa LEFT JOIN Address AS a ON sa.addressId = a.id LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode LEFT JOIN State AS s ON s.code = m.stateCode WHERE sa.id = ? LIMIT 1;', [order[0].shippingAddressId])
      let paymentMethod = await db.query('SELECT `id`, `name`, `description` FROM `PaymentMethod` WHERE id = ? LIMIT 1;', [order[0].paymentMethodId])
      let shippingMethod = await db.query('SELECT `name`, `description` FROM `ShippingMethod` WHERE id = ? LIMIT 1;', [order[0].shippingMethodId])

      order[0]['address'] = address[0]
      order[0]['paymentMethod'] = paymentMethod[0]
      order[0]['shippingMethod'] = shippingMethod[0]

      var cancelado = false
      var credivale = false
      var steps = [{ id: 1, name: 'Por pagar' }, { id: 2, name: 'Pagado' }, { id: 3, name: 'Procesando pedido' }, { id: 4, name: 'Por enviar' }, { id: 5, name: 'Enviado' }]
      // Validar si es crediVale
      if (order[0].paymentMethodId === 2) {
        steps = [{ id: 1, name: 'Validando' }, { id: 2, name: 'Validado' }, { id: 3, name: 'Enviado' }]
        credivale = true
      }
      // validación
      let current = ''
      try {
        current = order[0]['orderStatus'][0].current
      } catch (error) {
        order[0]['orderStatus'] = [{
          current: '1'
        }
        ]
      }
      if (current === '6' || current === 6) {
        cancelado = true
        steps.push({ id: steps.length + 1, name: 'Cancelado' })
      } else {
        steps.push({ id: steps.length + 1, name: 'Entregado' })
      }
      if (!credivale) {
        if (!cancelado) {
          if (order[0].calzzapatoCode) {
            // Tiene calzzapatoCode
            if (order[0]['orderStatus'][0].current === '1' || order[0]['orderStatus'][0].current === 1) {
              order[0]['orderStatus'][0].current = '2'
            } else {
              var parsedNumber = parseInt(order[0]['orderStatus'][0].current) + 1
              order[0]['orderStatus'][0].current = parsedNumber + ""
            }
          } else {
            order[0]['orderStatus'][0].current = '1'
          }
        }

      } else {
        if (!cancelado) {
          if (order[0].calzzapatoCode) {
            if (order[0]['orderStatus'][0].current === '1' || order[0]['orderStatus'][0].current === 1 || order[0]['orderStatus'][0].current === '2' || order[0]['orderStatus'][0].current === 2) {
              order[0]['orderStatus'][0].current = '1'
            } else {
              var parsedNumber = parseInt(order[0]['orderStatus'][0].current) - 1
              order[0]['orderStatus'][0].current = parsedNumber + ""
            }
          } else {
            order[0]['orderStatus'][0].current = '1'
          }
        } else {
          order[0]['orderStatus'][0].current = '4'
        }
      }

      order[0]['orderStatus'].map(item => item['steps'] = steps)
      order[0]['orderDetail'].forEach((element, index) => {
        order[0]['orderDetail'][index].quantity = Number(element.quantity)
        order[0]['orderDetail'][index].saved = Number(element.saved)
        order[0]['orderDetail'][index].oldUnitPrice = Number(element.unitPrice) + Number(element.saved)
        order[0]['orderDetail'][index].unitPrice = Number(element.unitPrice)
        order[0]['orderDetail'][index].oldSubtotal = order[0]['orderDetail'][index].oldUnitPrice * Number(element.quantity)
        order[0]['orderDetail'][index].subtotal = order[0]['orderDetail'][index].unitPrice * Number(element.quantity)
        if (!order[0]['orderStatus'][index]) {
          element['orderStatus'] = order[0]['orderStatus'][0]
        } else {
          element['orderStatus'] = order[0]['orderStatus'][index]
        }
      })


      delete order[0]['orderStatus']
      order[0].discount = Number(order[0].discount)
      order[0].shippingCost = Number(order[0].shippingCost)
      order[0].subtotal = Number(order[0].subtotal)
      order[0].total = Number(order[0].total)
      await Utils.asyncForEach(order[0].orderDetail, async (detail) => {
        let photos = await mongodb.mongoFind(mdb, 'Product', {
          code: detail.productCode
        })

        let url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/"
        if (photos.length > 0) {
          if (photos[0].photos.length > 0) {
            url = "https://s3-us-west-1.amazonaws.com/calzzapato/normal/" + photos[0].photos[0].description
          }
        }
        detail["image"] = url
      })
      response = order[0]

    } catch (err) {
      await db.close()
      throw err
    }

    await db.close()
    return response
  }

  User.remoteMethod('orderDetailCalzzamovil', {
    description: 'Get orders by user',
    http: {
      path: '/calzzamovil/:folio/detail',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'folio', type: 'string', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.createDevice = async function (data, req) {
    console.log('Create device Ecommerce data ', data)
    let response = { created: false }
    let user = req.headers.user
    let instanceId = req.headers.instanceId
    const db = await mysql.connectToDBManually()
    await db.beginTransaction()

    try {
      if (user !== undefined) {
        let device = await db.query('SELECT id FROM Device WHERE uuid = ? AND userId = ? AND status = 1;', [data.data.uuid, user.id])
        await db.query('UPDATE FirebaseToken SET token = NULL WHERE token = ?;', [data.data.registrationToken])
        if (device.length === 0) {
          await db.query('INSERT INTO Device (instanceId, userId, uuid, so, version, ip, carrier) VALUES (?, ?, ?, ?, ?, ?, ?);', [instanceId, user.id, data.data.uuid, data.data.so, data.data.version, data.data.ip, data.data.carrier])
          let deviceNew = await db.query('SELECT id FROM Device WHERE uuid = ? AND userId = ? AND status = 1;', [data.data.uuid, user.id])
          // Actualizar tabla de firebase, que solo haya un token por persona
          await db.query('INSERT INTO FirebaseToken (instanceId, deviceId, token) VALUES (?, ?, ?);', [instanceId, deviceNew[0].id, data.data.registrationToken])
        }
        else {
          let firebaseToken = await db.query('SELECT * FROM FirebaseToken WHERE instanceId = ? AND deviceId = ? AND status = 1;', [instanceId, device[0].id])
          //console.log('firebaseToken', firebaseToken)
          if (firebaseToken.length === 0) {
            await db.query('INSERT INTO FirebaseToken (instanceId, deviceId, token) VALUES (?, ?, ?);', [instanceId, device[0].id, data.data.registrationToken])
          } else {
            await db.query('UPDATE FirebaseToken SET token = ? WHERE deviceId = ?;', [data.data.registrationToken, device[0].id])
          }
        }
        response.created = true
        await db.commit()
      }
    } catch (err) {
      console.log("Error al crear token: ", err)
      response.created = false
      await db.rollback()
    }
    await db.close()
    return response
  }

  User.remoteMethod('createDevice', {
    description: 'Create device in the table',
    http: {
      path: '/device',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: "object", http: { source: 'body' }, require: true }
      ,
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.addTicket = async (req, data) => {
    let response = { success: false, message: '', state: null }
    let email = ''
    const mongoDB = mongodb.getConnection('db')

    console.log(req.headers.user)
    if (req.headers.user !== undefined) {
      email = req.headers.user.email
    } else {
      email = data.email
    }

    const db = await mysql.connectToDBManually()
    let user = await db.query('SELECT calzzapatoUserId FROM `User` WHERE email = ? AND status = 1;', [email])
    await db.close()

    // User state 
    //-1: No registrado
    // 0: No activo
    // 1: Activo

    if (user.length === 0) {
      response.state = -1
    } else {
      if (user[0].calzzapatoUserId === null) {
        response.state = 0
      } else {
        response.state = 1
      }
    }

    console.log("RESPONSE STATE: ", response.state)

    try {
      if (response.state === 1) {
        let body = '<?xml version="1.0" encoding="utf-8"?>\
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
          <soap:Body>\
            <SetRegistraTicketPuntos xmlns="http://tempuri.org/">\
              <aplicacion>' + configs.webServiceVentaPublicoApplication + '</aplicacion>\
              <Password>' + configs.webServiceVentaPublicoPassword + '</Password>\
              <IdUsuarioMonedero>'+ user[0].calzzapatoUserId + '</IdUsuarioMonedero>\
              <cIndFactura>'+ data.ticket + '</cIndFactura>\
            </SetRegistraTicketPuntos>\
          </soap:Body>\
        </soap:Envelope>'

        let request = await Utils.request({
          method: 'POST',
          url: configs.webServiceVentaPublicoURL + '?op=SetRegistraTicketPuntos',
          headers: {
            "content-type": "text/xml"
          },
          body: body
        })

        console.log(request)

        if (request.body !== undefined) {
          let result = convert.xml2json(request.body, { compact: true, spaces: 4 })
          result = JSON.parse(result)
          result = result['soap:Envelope']['soap:Body']['SetRegistraTicketPuntosResponse']['SetRegistraTicketPuntosResult']

          console.log('result')
          console.log(result)

          if (result.Puntos._text !== undefined) {
            if (Number(result.Puntos._text) > 0) {
              response.message = 'Puntos azules registrados con éxito.'
              response.success = true
            } else if (Number(result.Puntos._text) <= 0) {
              // Error message.
              response.message = result.errDescrip._text
              let checkBluePointsCoupon = await bluePoints.validateBluePointsCoupon(user[0].calzzapatoUserId, data.ticket)
              console.log('CheckBluePoints', checkBluePointsCoupon)
              // console.log(await Utils.getCalzzapatoToken())
              if (checkBluePointsCoupon.valid && checkBluePointsCoupon.coupon !== null) {
                let calzzapatoResponse = await bluePoints.createCalzzapatoCoupon(user[0].calzzapatoUserId, checkBluePointsCoupon.coupon, data.ticket)
                console.log('CalzzapatoResponse', calzzapatoResponse)
                if (calzzapatoResponse.idUsuario !== null && calzzapatoResponse.idUsuario !== undefined) {
                  let folios = await mongodb.mongoFind(mongoDB, 'Folio', { folios: { $elemMatch: { code: data.ticket } } })
                  if (folios.length > 0) {
                    let folioToSave = folios[0]
                    let findFolio = folioToSave.folios.findIndex((element) => element.code === data.ticket)
                    if (findFolio !== -1) {
                      folioToSave.folios[findFolio].status = false
                      folioToSave.folios[findFolio].userId = user[0].calzzapatoUserId
                      folioToSave.folios[findFolio].calzzapatoCodeCoupon = calzzapatoResponse.idCupon
                      await mongodb.findAndUpdateMongoDB(mongoDB, 'Folio', { _id: ObjectId(folioToSave._id) }, { '$set': folioToSave })
                      response.message = 'Puntos azules registrados con éxito.'
                      response.success = true
                    }
                  }
                } else {
                  response.message = calzzapatoResponse
                }
              } else {
                response.message = 'Cupón no válido.'
              }
            }
          } else {
            response.message = result.errDescrip._text
          }
        } else {
          response.message = 'No se ha podido procesar tu ticket de compra. Intenta de nuevo más tarde.'
        }
      }
    } catch (err) {
      console.log(err)
      response.message = 'No se ha podido procesar tu ticket de compra. Intenta de nuevo más tarde.'
    }
    return response
  }

  User.remoteMethod('addTicket', {
    description: 'Add Points From Ticket To Monedero Azul',
    http: {
      path: '/add-ticket',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: 'object', required: true }
    ],
    returns: {
      arg: 'data',
      type: 'Object',
      root: true
    }
  })

  User.cardsOpenpayByUser = async (req) => {
    let response = []
    let instanceId = req.headers.instanceId
    let user = req.headers.user

    const db = await mysql.connectToDBManually()

    try {
      let cards = await db.query('SELECT id, type, number, titular, alias, token FROM Card WHERE instanceId = ? AND userId = ? AND paymentMethodId = 9 AND status = 1', [
        instanceId,
        user.id
      ])

      cards.forEach(card => {
        card.token = JSON.parse(card.token)
      })
      response = cards

    } catch (err) {
      console.log(err)
      response.error = err
    }

    await db.close()

    if (response.error) {
      throw response
    } else {
      return response
    }
  }

  User.remoteMethod('cardsOpenpayByUser', {
    description: 'Get openpay cards by user.',
    http: {
      path: '/cards/openpay',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.ordersForCalzzamovil = async function (data) {
    let response = { folios: [] }
    const db = await mysql.connectToDBManually()
    try {
      let calzzamovilOrders = await db.query('SELECT o.order AS folio\
        FROM Calzzamovil AS c \
        LEFT JOIN `Order` AS o ON o.id = c.orderId\
        WHERE c.dealerId = ? AND c.deliveryDate IS NULL AND c.pipelineId IN (2, 3) AND c.status = 1 AND o.status = 1 LIMIT 6;', [data.userId])
      if (calzzamovilOrders.length > 0) {
        response.folios = calzzamovilOrders
      }
    } catch (err) {
      console.log("ERROR: ", err)
    }
    await db.close()
    return response
  }

  User.remoteMethod('ordersForCalzzamovil', {
    description: 'Get the dealers Orders for Calzzamovil.',
    http: {
      path: '/calzzamovil/orders',
      verb: 'POST'
    },
    accepts: [
      { arg: 'data', type: "object", http: { source: 'body' }, require: true },
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.createBill = async function (data, req) {
    let response = { created: false }

    let instanceId = req.headers.instanceId

    let db = await mysql.connectToDBManually()

    try {
      await db.beginTransaction()

      let addressInsert = await db.query('INSERT INTO Address (instanceId, zip, stateCode, municipalityCode, locationCode, street, exteriorNumber, interiorNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        instanceId,
        data.data.zip,
        data.data.stateCode,
        (data.data.municipalityCode + data.data.stateCode),
        (data.data.locationCode + data.data.municipalityCode + data.data.stateCode),
        data.data.street,
        data.data.exteriorNumber,
        data.data.interiorNumber
      ])

      await db.query('INSERT INTO Bills (instanceId, addressId, isLegalEntity, name, lastName, secondLastName, phone, businessName, rfc, email, voterID, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        req.headers.instanceId,
        addressInsert.insertId,
        data.data.isLegalEntity,
        data.data.name,
        data.data.lastName,
        data.data.secondLastName,
        data.data.phone,
        data.data.businessName,
        data.data.rfc,
        data.data.email,
        data.data.voterID,
        req.headers.user.id,
      ])

      response.created = true

      await db.commit()
    } catch (err) {
      console.log("ERROR: ", err)
      await db.rollback()
    }
    await db.close()
    return response
  }

  User.remoteMethod('createBill', {
    description: 'Create customers billing information',
    http: {
      path: '/bill/create',
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

  User.getBills = async function (req) {
    let response = {}

    let userId = req.headers.user.id

    let db = await mysql.connectToDBManually()

    try {
      let bills = await db.query('SELECT b.isLegalEntity,  b.name,  b.lastName,  b.secondLastName,  b.phone,  b.businessName,  b.rfc,  b.email, b.voterID,  a.zip,  a.id,  a.stateCode,  a.municipalityCode,  a.locationCode,  a.street,  a.exteriorNumber,  a.interiorNumber FROM Bills AS b LEFT JOIN Address AS a ON b.addressId = a.id WHERE b.userId = ? AND b.status = 1;', [userId])

      response = bills
    } catch (err) {
      console.log("ERROR: ", err)
    }
    await db.close()
    return response
  }

  User.remoteMethod('getBills', {
    description: 'Get customer billing information',
    http: {
      path: '/bill',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }

    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.updateBills = async function (data, req) {
    let response = { updated: false }

    let db = await mysql.connectToDBManually()

    try {
      await db.beginTransaction()

      await db.query('UPDATE Address SET zip = ?, stateCode = ?, municipalityCode = ?, locationCode = ?, street = ?, exteriorNumber = ?, interiorNumber = ? WHERE id = ?', [
        data.data.zip,
        data.data.stateCode,
        (data.data.municipalityCode + data.data.stateCode),
        (data.data.locationCode + data.data.municipalityCode + data.data.stateCode),
        data.data.street,
        data.data.exteriorNumber,
        data.data.interiorNumber,
        data.data.addressId
      ])

      await db.query('UPDATE Bills SET name = ?, lastName = ?, secondLastName = ?, phone = ?, voterID = ?, businessName = ?, rfc = ?, email = ?, isLegalEntity = ? WHERE addressId = ?', [
        data.data.name,
        data.data.lastName,
        data.data.secondLastName,
        data.data.phone,
        data.data.voterID,
        data.data.businessName,
        data.data.rfc,
        data.data.email,
        data.data.isLegalEntity,
        data.data.addressId
      ])

      response.updated = true

      await db.commit()
    } catch (err) {
      console.log("ERROR: ", err)
      await db.rollback()
    }
    await db.close()
    return response
  }

  User.remoteMethod('updateBills', {
    description: 'Update customer billing information',
    http: {
      path: '/bill/update',
      verb: 'PUT'
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

  User.deleteBills = async function (data) {
    let response = { deleted: false }

    let db = await mysql.connectToDBManually()


    try {
      await db.beginTransaction()

      await db.query('UPDATE Address SET status = 2 WHERE id = ?', [
        data.data.addressId
      ])

      await db.query('UPDATE Bills SET status = 2 WHERE addressId = ?', [
        data.data.addressId
      ])

      response.deleted = true

      await db.commit()
    } catch (err) {
      console.log("ERROR: ", err)
      await db.rollback()
    }
    await db.close()
    return response
  }

  User.remoteMethod('deleteBills', {
    description: 'Delete customer billing information',
    http: {
      path: '/bill/delete',
      verb: 'DELETE'
    },
    accepts: [
      { arg: 'data', type: "object", http: { source: 'body' }, require: true },
      // { arg: 'req', type: 'object', http: ctx => { return ctx.req } }

    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.getProductsRecomendationMailing = async (data) => {
    let response = []
    let user = data.user.id
    let MAX_PRODUCTS_RECOMENDATION = 50

    const mdb = mongodb.getConnection('db')
    try {
      if (user !== undefined && !isNaN(user)) {
        let productCodes = await mongodb.mongoFind(mdb, 'RecentlySeen', { userId: user })
        // Recomendations
        if (productCodes.length > 0) {
          // Operación para saber cuantos productos recomendar por producto visto
          let maxProductsRecomendation = Math.round(MAX_PRODUCTS_RECOMENDATION / productCodes[0].products.length)
          maxProductsRecomendation++
          if (maxProductsRecomendation > 5) {
            maxProductsRecomendation = 5
          }
          let productToSave = []

          await Utils.asyncForEach(productCodes[0].products, async (productCode) => {

            // Hacer consulta para ver info de producto
            let product = await Utils.loopbackFind(User.app.models.Product, { where: { code: productCode } })

            if (product.length > 0) {
              // Ya teniedo el producto, buscar productos relacionados con brand y category que no sea el producto visto
              let recomendationProducts = await Utils.loopbackFind(User.app.models.Product, { where: { and: [{ categoryCode: product[0].categoryCode }, { brandCode: product[0].brandCode }], code: { nlike: productCode } }, limit: maxProductsRecomendation, include: ['brand', 'color', 'gender', 'detail'] })
              if (recomendationProducts.length > 0) {
                recomendationProducts.map(item => {
                  if (productToSave.length !== MAX_PRODUCTS_RECOMENDATION) {
                    // Revisar que no exista en productos vistos
                    ((productCodes[0].products.find(element => element === item.code) || (productToSave.find(element => element.code === item.code)))) ? '' : productToSave.push(item)
                  }
                })
              }
            }
          })
          response = productToSave
        }
      }
    } catch (err) {
      return []
    }
    return response
  }

  User.remoteMethod('getProductsRecomendationMailing', {
    description: 'Get a product recomendation ',
    http: {
      path: '/recomendation-mailing/products',
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

  User.getProductsSeenMailing = async (data) => {
    let response = []
    let user = data.user.id

    const mdb = mongodb.getConnection('db')
    const db = await mysql.connectToDBManually()

    try {
      if (user !== undefined && !isNaN(user)) {
        // Obtener los códigos de productos de mongo
        let productCodes = []
        try {
          productCodes = await mongodb.mongoFind(mdb, 'RecentlySeen', { userId: user })

          let products = []
          if (productCodes.length !== 0) {
            await Utils.asyncForEach(productCodes[0].products, async (productCode) => {
              let mongoProduct = await Utils.loopbackFind(User.app.models.Product, { where: { code: productCode }, include: ['brand', 'color', 'gender', 'detail'] })
              if (mongoProduct.length > 0) {
                products.push(mongoProduct[0])
              }
            })
            response = products
          }

        } catch (error) {
          console.log('Error en product seen', error)
          response = []
        }

      }
    } catch (err) {
      await db.close()
      return []
    }

    await db.close()
    return response
  }

  User.remoteMethod('getProductsSeenMailing', {
    description: 'Get a product seen.',
    http: {
      path: '/seen-mailing/products',
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
