'use strict'

const Utils = require('../Utils.js')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const handlebars = require('handlebars')
const { asyncForEach } = require('../Utils.js')
var moment = require('moment')
var ObjectId = require('mongodb').ObjectID;

const NODE_ENV = process.env.NODE_ENV || 'development'
const configs = require('../configs.' + NODE_ENV + '.json')

let environment = '../../server/datasources.development.json'

if (NODE_ENV === 'staging') {
  environment = '../../server/datasources.staging.json'
} else if (NODE_ENV === 'production') {
  environment = '../../server/datasources.json'
}

const datasources = require(environment)

module.exports = function (User) {
  User.createAccount = async function (data, cb) {
    let response = { created: false }
    let db = Utils.connectToDB()
    try {
      let verificationToken = crypto.createHash('sha256').update(data.email).digest('hex')

      await db.beginTransaction()

      let newUser = await db.query('INSERT INTO User (employeeIdentifier, name, firstLastName, secondLastName, username, email, realm, cellphone, createdBy, password, verificationToken, emailVerified, lastLogin, status, cityMunicipalityStateCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [
        data.employeeIdentifier,
        data.name,
        data.firstLastName,
        data.secondLastName,
        data.email,
        data.email,
        data.email,
        data.cellphone,
        data.createdBy,
        verificationToken,
        verificationToken,
        0,
        null,
        2,
        data.cityMunicipalityStateCode
      ])

      await asyncForEach(data.branches, async (branch) => {
        await db.query('INSERT INTO Access (instanceId, roleId, branchId, userId) VALUES (1, ?, ?, ?)', [
          data.roleId,
          branch.value,
          newUser.insertId
        ])
      })


      let roles = await db.query('SELECT * FROM Role WHERE id = ? AND status = 1;', [
        data.roleId
      ])

      response.created = true
      await db.commit()

      let template = await Utils.readFile(__dirname + '/../templates/new-account.html')
      template = handlebars.compile(template)

      let emailResponse = await Utils.sendEmail({
        from: '"Calzzapato.com" <contacto@calzzapato.com>',
        to: data.email,
        subject: 'Nueva cuenta backoffice Calzzapato.com 👠',
        template: template({
          user: {
            name: data.name,
            firstLastName: data.firstLastName
          },
          role: roles[0].name,
          url: configs.HOST + '/bienvenido?token=' + verificationToken
        })
      })
      
    } catch (err) {
      console.log(err)
      if (err.errno === 1062) {
        response.error = { message: 'Correo ya existente.' }
      } else {
        console.log(err)
        response.error = err
      }

      await db.rollback()
    }
    await db.close()

    if (response.error) {
      throw response.error
    }

    return response
  }

  User.verifyEmail = async function (data, cb) {
    let response = { verified: false }
    let db = await Utils.connectToDB()
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

  User.recoveryPassword = async function (data, cb) {
    let response = { sent: false }
    let db = Utils.connectToDB()

    try {

      let verificationToken = crypto.createHash('sha256').update(Math.floor(100000 + Math.random() * 900000).toString()).digest('hex')
      let users = await db.query('SELECT id, name, firstLastName, secondLastName FROM User WHERE email = ? AND status = 1 LIMIT 1;', [data.email])

      await db.beginTransaction()
      await db.query('UPDATE User SET verificationToken = ? WHERE id = ?', [verificationToken, users[0].id])

      let template = await Utils.readFile(__dirname + '/../templates/recovery-password.html')
      template = handlebars.compile(template)

      await Utils.sendEmail({
        from: '"Calzzapato.com" <contacto@calzzapato.com>',
        to: data.email,
        subject: 'Recuperación de contraseña Backoffice Calzzapato.com 👠',
        template: template({
          user: {
            name: users[0].name,
            firstLastName: users[0].firstLastName,
            secondLastName: users[0].secondLastName
          },
          url: configs.HOST + '/bienvenido?token=' + verificationToken
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

  User.validateToken = async function (data, cb) {
    let response = { verificated: false }
    let db = Utils.connectToDB()

    try {
      let users = await db.query('SELECT id FROM User WHERE verificationToken = ? LIMIT 1;', [data.token])

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

  User.setNewPassword = async function (data, cb) {
    let response = { changed: false }
    let db = Utils.connectToDB()

    try {
      let user = await db.query('SELECT id, email FROM User WHERE verificationToken = ? LIMIT 1;', [data.token])
      await db.beginTransaction()
      let password = crypto.createHash('sha256').update(data.password).digest('hex')
      await db.query('UPDATE User SET password = ?, emailVerified = 1, verificationToken = "", status = 1 WHERE verificationToken = ?', [password, data.token])

      response.email = user[0].email
      await db.commit()
    } catch (err) {
      response.error = err
      await db.rollback()
    }
    await db.close()

    if (response.error) {
      throw response
    }

    response.changed = true
    return response
  }

  User.facebookLogin = async function (data, cb) {
    let response = { logged: false }
    let db = await Utils.connectToDB()
    try {
      let password = crypto.createHash('sha256').update(data.password).digest('hex')
      let verificationToken = crypto.createHash('sha256').update(data.email).digest('hex')
      await db.beginTransaction()
      let responseExistEmail = await db.query('SELECT * FROM User WHERE email = ?;', [data.email])
      if (responseExistEmail.length > 0) {
        let responseFacebookIdIsNull = await db.query('SELECT id FROM User WHERE email = ? AND facebookId = "";', [data.email])
        if (responseFacebookIdIsNull.length > 0) {
          await db.query('UPDATE User SET facebookId = ?, password = ?, verificationToken = ?, emailVerified = 0, status = 1 WHERE email = ?', [
            data.facebookId,
            password,
            verificationToken,
            data.email
          ])

          let template = await Utils.readFile(__dirname + '/../templates/linked-facebook.html')
          template = handlebars.compile(template)

          await Utils.sendEmail({
            from: '"Calzzapato.com" <contacto@calzzapato.com>',
            to: data.email,
            subject: 'Cuenta de Facebook vinculada a Calzzapato.com 👠',
            template: template({
              user: {
                facebookId: data.facebookId,
                email: data.email,
                name: responseExistEmail[0].name,
                firstLastName: responseExistEmail[0].firstLastName,
                secondLastName: responseExistEmail[0].secondLastName
              }
            })
          })
        }
      }
      else {
        await db.query('INSERT INTO User (facebookId, name, firstLastName, secondLastName, username, email, cellphone, password, verificationToken, emailVerified, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [
          data.facebookId,
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
        let template = await Utils.readFile(__dirname + '/../templates/new-account.html')
        template = handlebars.compile(template)

        await Utils.sendEmail({
          from: '"Calzzapato.com" <contacto@calzzapato.com>',
          to: data.email,
          subject: 'Hola, bienvenido a Calzzapato.com 👠',
          template: template({
            user: {
              name: data.name,
              firstLastName: data.firstLastName,
              secondLastName: data.secondLastName
            },
            url: configs.HOST + '?token=' + verificationToken
          })
        })
      }

      let welcomeToNewsletter = false
      let subscribers = await db.query('SELECT * FROM Subscriber WHERE email = ? LIMIT 1;', [
        data.email
      ])

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

      if (welcomeToNewsletter) {
        let template = await Utils.readFile(__dirname + '/../templates/welcome-newsletter.html')
        template = handlebars.compile(template)

        let emailResponse = await Utils.sendEmail({
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

      await db.commit()
      response.logged = true
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

  User.login = async function (data, cb) {
    let error = null
    let response = {}
    let db = await Utils.connectToDB()
    try {
      let password = crypto.createHash('sha256').update(data.password).digest('hex')
      let users = await db.query('SELECT * FROM User WHERE email = ? AND password = ? AND status = 1 LIMIT 1;', [data.email, password])
      if (users.length > 0) {
        let token = jwt.sign(users[0].email + '|' + users[0].password, configs.jwtPrivateKey)
        //let session = await db.query('INSERT INTO Session (userId, jwt)')

        let accesses = await db.query('SELECT a.id, b.name, b.description FROM Access AS a LEFT JOIN Branch AS b ON a.branchId = b.id WHERE a.userId = ? AND a.status = 1 AND b.status = 1;', [
          users[0].id
        ])
        users[0].accesses = accesses
        delete users[0].employeeIdentifier
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
        throw 'User not found'
      }
    } catch (err) {
      error = err
    }

    await db.close()
    if (error) {
      throw error
    }
    return response
  }
  User.auth = async function (req) {
    let response = null
    let error = null
    let user = req.headers.user
    let instanceId = req.headers.instanceId
    let sqlQueryGetIntance = "SELECT id FROM Instance WHERE uuid = ? LIMIT 1;"
    let sqlQuery = "SELECT u.id, u.email, u.name, u.firstLastName, u.secondLastName, u.status\
      FROM User AS u\
      WHERE u.email = ?\
      AND u.password = ?\
      AND u.status = 1\
      LIMIT 1;"

    let db = await Utils.connectToDB()

    try {
      let users = await db.query(sqlQuery, [user.email, user.password])

      let accesses = await db.query('SELECT a.id, b.name, b.description FROM Access AS a LEFT JOIN Branch AS b ON a.branchId = b.id WHERE a.userId = ? AND a.status = 1 AND b.status = 1;', [
        users[0].id
      ])

      users[0].accesses = accesses
      response = users[0]
    } catch (err) {
      error = err
      console.log(err)
    }

    await db.close()

    if (error) {
      throw error
    } else {
      return response
    }
  }

  User.getRoles = function (req, cb) {
    let dataSource = User.dataSource
    let sqlQuery = "SELECT id, name, description FROM Role WHERE status = 1;"

    dataSource.connector.query(sqlQuery, [], (err, roles) => {
      if (err) console.error(err)
      cb(err, roles)
    })
  }
  User.getBranches = function (req, cb) {
    let dataSource = User.dataSource
    let sqlQuery = "SELECT id AS value, description AS label FROM Branch WHERE status = 1;"

    dataSource.connector.query(sqlQuery, [], (err, roles) => {
      if (err) console.error(err)
      cb(err, roles)
    })
  }

  User.getUsers = function (filter, req, cb) {
    let dataSource = User.dataSource
    let sqlQuery = ""

    if (filter === undefined || filter === null) {
      sqlQuery = "\
      SELECT u.id, u.name, u.firstLastName, u.secondLastName, u.email, u.phone, u.cellphone, cbu.name AS createdByName, cbu.firstLastName AS createdByFirstLastName, cbu.secondLastName AS createdBySecondLastName, s.name AS status\
      FROM User AS u\
      LEFT JOIN User AS cbu ON cbu.id = u.createdBy\
      LEFT JOIN Status AS s ON s.id = u.status;"

      dataSource.connector.query(sqlQuery, [], (err, users) => {
        if (err) console.error(err)

        for (let i in users) {
          users[i].fullName = users[i].name + " " + users[i].firstLastName + " " + users[i].secondLastName
          users[i].createdBy = users[i].createdByName + " " + users[i].createdByFirstLastName + " " + users[i].createdBySecondLastName

          delete users[i].name
          delete users[i].firstLastName
          delete users[i].secondLastName
          delete users[i].createdByName
          delete users[i].createdByFirstLastName
          delete users[i].createdBySecondLastName
        }

        cb(err, users)
      })
    } else {
      filter = `'%${filter.replace(/"/g, "")}%'`
      sqlQuery = "\
        SELECT u.id, u.name, u.firstLastName, u.secondLastName, u.email, u.phone, u.cellphone, cbu.name AS createdByName, cbu.firstLastName AS createdByFirstLastName, cbu.secondLastName AS createdBySecondLastName\
        FROM User AS u\
        LEFT JOIN User AS cbu ON cbu.id = u.createdBy\
        WHERE\
        u.status = 1 AND\
        (u.name LIKE ? OR u.firstLastName LIKE ? OR u.secondLastName LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.cellphone LIK ?);\
        "

      dataSource.connector.query(sqlQuery, [filter.trim(), filter.trim(), filter, filter, filter, filter], (err, users) => {
        if (err) console.error(err)


        for (let i in users) {
          users[i].fullName = users[i].name + " " + users[i].firstLastName + " " + users[i].secondLastName
          users[i].createdBy = users[i].createdByName + " " + users[i].createdByFirstLastName + " " + users[i].createdBySecondLastName

          delete users[i].name
          delete users[i].firstLastName
          delete users[i].secondLastName
          delete users[i].createdByName
          delete users[i].createdByFirstLastName
          delete users[i].createdBySecondLastName
        }

        cb(err, users)
      })
    }
  }

  // Get permissions
  User.permissions = function (email, req, cb) {
    let instanceId = req.headers.instanceId
    let dataSource = User.dataSource
    let sqlQuery = "\
      SELECT m.id, m.icon, m.name, m.description, m.component, m.path, m.nesting, m.moduleGroup, m.status, a.name AS actionName, a.pluralName AS actionPluralName, a.icon AS actionIcon, ma.pipeline\
      FROM Module AS m\
      LEFT JOIN ModuleAction AS ma ON ma.moduleId = m.id\
      LEFT JOIN Action AS a ON a.id = ma.actionId\
      LEFT JOIN Permission AS p ON p.moduleActionId = ma.id\
      LEFT JOIN Access AS ac ON ac.roleId = p.roleId\
      LEFT JOIN Instance AS i ON i.id = ac.instanceId\
      LEFT JOIN InstancePlan AS ip ON ip.instanceId = i.id\
      LEFT JOIN PlanModuleAction AS pma ON pma.planId = ip.planId\
      LEFT JOIN Role AS r ON r.id = ac.roleId\
      LEFT JOIN Branch AS b ON b.id = ac.branchId\
      LEFT JOIN User AS u ON u.id = ac.userId\
      WHERE\
      ac.instanceId = ?\
      AND i.status = 1\
      AND ip.status = 1\
      AND m.status = 1\
      AND pma.status = 1\
      AND ma.status = 1\
      AND p.status = 1\
      AND b.status = 1\
      AND r.status = 1\
      AND ac.status = 1\
      AND u.status = 1\
      AND u.email = ?\
      GROUP BY ma.id\
      ORDER BY ma.order ASC;\
    "
    dataSource.connector.query(sqlQuery, [instanceId, email], function (err, permissions) {
      if (err) console.error(err)
      cb(err, permissions)
    })
  }

  User.getAddressesByUser = async function (id, cb) {
    let error = null
    let response = []
    let user = User.app.get('user')
    let fav

    let db = await Utils.connectToDB()
    try {
      let addresses = await db.query('SELECT\
        sa.id,\
        sa.userId AS userId,\
        sa.reference,\
        a.instanceId,\
        a.id AS addressId,\
        a.zip,\
        a.betweenStreets,\
        s.name AS state,\
        m.name AS municipality,\
        l.name AS location,\
        l.code AS locationCode,\
        lt.name AS type,\
        a.street,\
        a.exteriorNumber,\
        a.interiorNumber,\
        sa.name,\
        sa.phone,\
        sa.alias\
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
      response = addresses

      fav = await db.query(' SELECT A.* from User AS U LEFT JOIN ShippingAddress AS A ON U.favoriteAddressId = A.id WHERE U.id=? AND A.status=1 ;', [user.id]);

    } catch (err) {
      error = err
    }

    await db.close()
    if (error === null) {
      return {
        response,
        fav
      }
    }
    else {
      throw error
    }
  }

  User.getFavoriteAddress = async function (id, cb) {
    let db = await Utils.connectToDB()
    var addressId = await db.query('SELECT u.favoriteAddressId FROM User AS u INNER JOIN ShippingAddress AS a ON u.favoriteAddressId=a.id WHERE u.id=? AND a.status = 1 LIMIT 1;', [id])
    await db.close()

    return addressId
  }

  User.updateUserInfo = async function (data) {
    let db = await Utils.connectToDB()
    let response = {}

    try {
      db.query('UPDATE User SET name=?, firstLastName=?, genderId=?, birthday=? WHERE email= ? AND status = 1 ;', [data.name, data.firstLastName, data.genderId, data.birthday, data.email])
      let users = await db.query('SELECT * FROM User WHERE email = ? AND status = 1 LIMIT 1;', [data.email])
      if (users.length > 0) {
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
        response = users[0]
      }

    } catch (error) {
      response.error = { error }
    }

    await db.close();

    if (response.error) {
      throw response
    }

    return response
  }

  User.setFavoriteAddress = async function (data) {
    let db = await Utils.connectToDB()
    let response = { updated: false }

    try {
      await db.query('UPDATE User SET favoriteAddressId=? WHERE id= ?  ;', [data.addressId, data.userId])
      response.updated = true
    } catch (error) {
      response.error = { error }
    }

    await db.close()

    if (response.error) {
      throw response
    }

    return response
  }

  User.modules = function (email, req, cb) {
    let instanceId = req.headers.instanceId
    let dataSource = User.dataSource
    let sqlQuery = "\
      SELECT m.id, m.icon, m.name, m.description, m.component, m.path, m.nesting, m.moduleGroup, m.status, a.name AS actionName\
      FROM Module AS m\
      LEFT JOIN ModuleAction AS ma ON ma.moduleId = m.id\
      LEFT JOIN Action AS a ON a.id = ma.actionId\
      LEFT JOIN Permission AS p ON p.moduleActionId = ma.id\
      LEFT JOIN Access AS ac ON ac.roleId = p.roleId\
      LEFT JOIN Instance AS i ON i.id = ac.instanceId\
      LEFT JOIN InstancePlan AS ip ON ip.instanceId = i.id\
      LEFT JOIN PlanModuleAction AS pma ON pma.planId = ip.planId\
      LEFT JOIN Role AS r ON r.id = ac.roleId\
      LEFT JOIN Branch AS b ON b.id = ac.branchId\
      LEFT JOIN User AS u ON u.id = ac.userId\
      WHERE\
      ac.instanceId = ?\
      AND i.status = 1\
      AND ip.status = 1\
      AND m.status = 1\
      AND pma.status = 1\
      AND ma.status = 1\
      AND p.status = 1\
      AND b.status = 1\
      AND r.status = 1\
      AND ac.status = 1\
      AND u.status = 1\
      AND a.name = 'read'\
      AND u.email = ?\
      GROUP BY m.id;\
    "
    dataSource.connector.query(sqlQuery, [instanceId, email], function (err, modules) {
      if (err) console.error(err)
      cb(err, modules)
    })
  }

  User.getCalzzamovil = async (req) => {
    let response = {
      error: null,
      deliverys: [],
      orders: []
    }
    let db = await Utils.connectToDB()
    let eccomerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password,
      database: datasources.ecommerce.database
    })

    try {
      let deliverys = await db.query('SELECT u.id, u.name, u.firstLastName, u.secondLastName, u.email, u.status AS userStatus, u.cellphone, a.status, u.cityMunicipalityStateCode FROM Access as a LEFT JOIN User AS u ON a.userId = u.id WHERE a.roleId = 4;')
      await asyncForEach(deliverys, async (delivery) => {
        let municipality = await eccomerce.query('SELECT `name` FROM CalzzamovilCity WHERE cityMunicipalityStateCode = ?;', [delivery.cityMunicipalityStateCode])
        if (municipality.length > 0) {
          delivery.municipality = municipality[0].name
        }
        delivery.userName = delivery.name + ' ' + delivery.firstLastName + ' ' + delivery.secondLastName
        delivery.statusName = (delivery.status === 1 && delivery.userStatus === 1) ? "Activo" : "Inactivo"
      })

      response.deliverys = deliverys

      let orders = await eccomerce.query('SELECT c.id, c.orderId, c.zoneId, c.dealerId, c.deliveryDate, c.deliveryAt, c.pipelineId, c.status, c.reasons AS comments, m.name AS municipality, cp.name AS pipeline, c.dealerId, u.id AS userId, u.name, u.firstLastName, u.secondLastName, o.order, r.name AS reason, c.createdAt, c.deliveryDate \
      FROM Calzzamovil AS c\
      LEFT JOIN `Order` AS o ON c.orderId = o.id \
      LEFT JOIN ShippingAddress AS sa ON o.shippingAddressId = sa.id \
      LEFT JOIN Address AS a ON sa.addressId = a.id \
      LEFT JOIN Municipality AS m ON a.municipalityCode = m.municipalityStateCode \
      LEFT JOIN User AS u ON o.userId = u.id \
      LEFT JOIN Reasons AS r ON c.reasonId = r.id \
      LEFT JOIN CalzzamovilPipeline AS cp ON c.pipelineId = cp.id \
      ORDER BY c.id DESC')
      await asyncForEach(orders, async (order) => {
        order.client = order.name + ' ' + order.firstLastName + ' ' + order.secondLastName
        let d = new Date(order.createdAt)
        order.createdAt = moment(d).format('L') + ' ' + moment(d).format('LT')

        if (order.deliveryDate === undefined || order.deliveryDate === null) {
          order.diference = `No entregado`
          order.deliveryDate = '-'
        } else {
          try {
            // let a = moment(d, 'YYYYMMDD').endOf('hour').locale('es').from(order.deliveryDate) // 10 years ago
            var a = moment(d)
            var b = moment(order.deliveryDate)
            a = b.diff(a, 'hours')
            order.diference = a + ' horas'
          } catch (error) {
            console.log(error)
          }
        }
        if (order.reason === null) {
          order.reason = '-'
        }
        if (order.comments === null) {
          order.comments = '-'
        }
        let delivery = await db.query('SELECT name, firstLastName, secondLastName FROM User WHERE id = ? AND status = 1 LIMIT 1;', [order.dealerId])
        if (delivery !== undefined && delivery !== null && delivery.length > 0) {
          order.delivery = delivery[0].name + ' ' + delivery[0].firstLastName + ' ' + delivery[0].secondLastName
        } else {
          order.delivery = 'Aún no asignado'
        }
      })

      response.orders = orders

    } catch (err) {
      response.error = err
    }

    if (response.error) {
      throw response
    }


    await db.close()
    await eccomerce.close()

    return response
  }

  User.getDeliveryDetail = async (userId, req) => {
    let response = {
      error: null,
      delivery: null
    }

    let db = await Utils.connectToDB()
    let eccomerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password,
      database: datasources.ecommerce.database
    })

    try {
      let user = await db.query('SELECT u.id, u.name, u.firstLastName, u.secondLastName, u.email, u.cellphone, a.status, c.name AS municipality FROM Access as a LEFT JOIN User AS u ON a.userId = u.id LEFT JOIN City AS c ON u.cityId = c.id WHERE a.roleId = 4 AND a.userId = ? LIMIT 1;', [userId])
      let calzzamovilList = await eccomerce.query("SELECT rating FROM Calzzamovil WHERE dealerId = ? AND pipelineId = 4 AND status = 1;", [userId])

      let rating = 0.0

      if (calzzamovilList.length > 0) {
        await Utils.asyncForEach(calzzamovilList, async (calzzamovil) => {
          rating += calzzamovil.rating
        })

        rating = rating / calzzamovilList.length
      }

      if (user.length > 0) {
        user = user[0]
        user.fullName = user.name + ' ' + user.firstLastName + ' ' + user.secondLastName
        user.rating = rating

        response.delivery = user
      }
    } catch (err) {
      response.error = err
    }

    await db.close()
    await eccomerce.close()

    if (response.error) {
      throw response
    }

    return response
  }

  User.getCalzzamovilOrderDetail = async (req, folio) => {
    let response = {}

    let db = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password,
      database: datasources.ecommerce.database
    })

    try {
      let order = await db.query('SELECT `id`, `calzzapatoCode`, `order`, `reference`, `pipeline`, `discount`, `shippingCost`, `subtotal`, `shippingMethodId`, `paymentMethodId`, `shippingAddressId`, `total`, `createdAt` AS shoppingDate, TIMESTAMPADD(DAY, 7, createdAt) as deliveryDate FROM `Order` WHERE `order` = ? LIMIT 1;', [folio])
      let responseWebService = null
      responseWebService = await Utils.request(configs.HOST_IP_ECOMMERCE + ':' + configs.PORT_IP_ECOMMERCE + '/api/orders/' + folio + '/tracking')
      order[0]['orderStatus'] = JSON.parse(responseWebService.body) || [{ current: '1' }]

      order[0]['orderDetail'] = await db.query('SELECT `productCode`, `productArticleCode`, `productDescription`, `quantity`, `size`, `unitPrice`, `saved` FROM `OrderDetail` WHERE orderId = ? AND status = 1;', [order[0].id])

      let address = await db.query('SELECT sa.name, a.zip, a.street, a.exteriorNumber, a.interiorNumber, l.name AS locationName, l.zone AS locationZone, lt.name AS locationType, m.name AS municipalityName, s.name AS stateName FROM ShippingAddress AS sa LEFT JOIN Address AS a ON sa.addressId = a.id LEFT JOIN Location AS l ON a.locationCode = l.locationMunicipalityStateCode LEFT JOIN LocationType AS lt ON lt.code = l.locationTypeCode LEFT JOIN Municipality AS m ON l.municipalityStateCode = m.municipalityStateCode LEFT JOIN State AS s ON s.code = m.stateCode WHERE sa.id = ? LIMIT 1;', [order[0].shippingAddressId])
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
        let photos = await Utils.mongoFind('Product', {
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

  User.updateDelivery = async (userId) => {
    let error = null

    let response = {
      updated: false
    }

    let db = await Utils.connectToDB()

    try {
      let status = await db.query("SELECT status FROM Access WHERE userId = ? LIMIT 1;", [userId])

      if (status.length > 0) {
        status = (status[0].status === 1) ? 2 : 1

        await db.beginTransaction()
        await db.query("UPDATE Access SET status = ? WHERE userId = ?;", [status, userId])
        await db.query("UPDATE User SET status = ? WHERE id = ?;", [status, userId])
        await db.commit()

        response.updated = true
      }
    } catch (err) {
      error = err
    }

    await db.close()

    if (error) {
      throw error
    }

    return response
  }

  User.getClientDetail = async (req, userId) => {
    let response = {
      clientDetail: null,
      error: null
    }

    let eccomerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password,
      database: datasources.ecommerce.database
    })

    try {
      let user = await eccomerce.query("SELECT id, name, firstLastName, secondLastName, email, cellphone, cellphone FROM User WHERE id = ? AND status = 1 LIMIT 1;", [userId])

      if (user.length > 0) {
        user = user[0]
        user.name = user.name + ' ' + user.firstLastName + ' ' + user.secondLastName

        delete user.firstLastName
        delete user.secondLastName

        user.address = await eccomerce.query("SELECT sa.name, a.zip, a.street, a.exteriorNumber, a.interiorNumber, a.betweenStreets, m.name AS municipality, s.name AS state, l.name AS location, lt.name AS locationType FROM ShippingAddress AS sa LEFT JOIN Address AS a ON sa.addressId = a.id LEFT JOIN Municipality AS m ON a.municipalityCode = m.municipalityStateCode LEFT JOIN State AS s ON a.stateCode = s.code LEFT JOIN Location as l ON a.locationCode = l.locationMunicipalityStateCode LEFT JOIN LocationType AS lt ON l.locationTypeCode = lt.code WHERE sa.userId = ? AND sa.status = 1 AND a.status = 1;", [userId])

        response.clientDetail = user
      }
    } catch (err) {
      response.error = err
    }

    await eccomerce.close()

    if (response.error) {
      throw response
    }

    return response
  }

  User.getOrderEvidence = async (req, orderId) => {
    let response = {
      evidence: null,
      error: null
    }

    try {
      let evidence = await Utils.mongoFind('CalzzamovilEvidence', { calzzamovilId: orderId })
      if (evidence.length > 0) {
        response.evidence = evidence[0]
      }
    } catch (err) {
      response.error = err
    }

    if (response.error) {
      throw response
    }

    return response
  }

  User.cancelOrder = async (data) => {
    let response = {
      updated: false,
      message: '',
      error: null
    }

    let eccomerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password,
      database: datasources.ecommerce.database
    })

    try {
      if (data.accepts && data.date !== undefined && data.date !== null) {
        let date = moment(new Date(data.date)).format("YYYY-MM-DD HH:mm:ss");
        if (data.type === 'PAUSED') {
          await Utils.request({
            url: configs.HOST_IP_TRACKING + ':' + configs.PORT_IP_TRACKING + '/api/users/notification',
            method: 'POST',
            json: true,
            body: {
              orderId: data.orderId,
              notificationType: 'DELIVERY_PAUSED',
              userRole: 'DEALERS'
            }
          })

          await eccomerce.beginTransaction()
          await eccomerce.query("UPDATE Calzzamovil SET `pipelineId` = 6, deliveryAt = ?, status = 1 WHERE orderId = ?;", [date, data.orderId])
          await eccomerce.commit()

          let calzzamovil = await eccomerce.query("SELECT pipelineId FROM Calzzamovil WHERE orderId = ? AND status = 1;", [data.orderId])

          if (calzzamovil.length > 0) {
            calzzamovil = calzzamovil[0]

            if (calzzamovil.pipelineId === 6) {
              response.message = 'Se ha pospuesto el pedido'
              response.updated = true
            } else {
              response.message = 'Ha ocurrido un error al posponer el pedido'
            }
          }

        } else {
          await eccomerce.beginTransaction()
          let updateResponse = await eccomerce.query("UPDATE Calzzamovil SET `pipelineId` = 5 WHERE orderId = ? AND status = 1;", [data.orderId])
          await eccomerce.commit()

          let calzzamovil = await eccomerce.query("SELECT pipelineId FROM Calzzamovil WHERE orderId = ? AND status = 1;", [data.orderId])

          if (calzzamovil.length > 0) {
            calzzamovil = calzzamovil[0]

            if (calzzamovil.pipelineId === 5) {
              response.message = 'Se ha cancelado el pedido'
              response.update = true
            } else {
              response.message = 'Ha ocurrido un error al cancelar el pedido'
            }
          }
        }
      } else {
        if (data.type === 'PAUSED') {
          await Utils.request({
            url: configs.HOST_IP_TRACKING + ':' + configs.PORT_IP_TRACKING + '/api/users/notification',
            method: 'POST',
            json: true,
            body: {
              orderId: data.orderId,
              notificationType: 'DELIVERY_PAUSED',
              roleType: 'DEALERS'
            }
          })

          let calzzamovilDetail = await eccomerce.query('SELECT cd.calzzamovilId, cd.collect FROM CalzzamovilDetail AS cd LEFT JOIN Calzzamovil AS c ON c.id = cd.calzzamovilId WHERE c.orderId = ?;', [data.orderId])
          console.log(calzzamovilDetail);
          let pipeline = 0
          if (calzzamovilDetail.length > 0 && calzzamovilDetail[0].collect === 1) {
            pipeline = 3
          } else {
            pipeline = 2
          }

          await eccomerce.query("UPDATE Calzzamovil SET `pipelineId` = ?, status = 1 WHERE id = ?;", [pipeline, calzzamovilDetail[0].calzzamovilId])

          let calzzamovil = await eccomerce.query("SELECT pipelineId FROM Calzzamovil WHERE orderId = ? AND status = 1;", [data.orderId])

          if (calzzamovil.length > 0) {
            calzzamovil = calzzamovil[0]

            if (calzzamovil.pipelineId === 3) {
              response.message = 'Se ha rechazado la solicitud del repartidor'
              response.update = true
            } else {
              response.message = 'Ha ocurrido un error al rechazar la solicitud del repartidor'
            }
          }
        }
      }
    } catch (err) {
      response.error = err
    }

    await eccomerce.close()

    return response
  }

  User.getTokensForTracking = async (data) => {
    console.log('getTokensForTracking');
    let response = { token: null }
    let db = await Utils.connectToDB()
    let eccomerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password,
      database: datasources.ecommerce.database
    })
    try {

      // Nuevos cambios
      if (data.orderId !== null && data.orderId !== undefined) {
        let dealerId = await eccomerce.query("SELECT dealerId FROM Calzzamovil WHERE orderId = ? AND status = 1 LIMIT 1;", [data.orderId])
        //let token = await db.query("SELECT ft.token FROM Device AS d LEFT JOIN FirebaseToken AS ft ON d.id = ft.deviceId WHERE d.status = 1 AND ft.status = 1 AND d.userId = ? AND ft.token IS NOT NULL LIMIT 1;", [dealerId])
        if (dealerId.length > 0) {
          let token = response.data = await db.query('SELECT ft.token, u.name, u.firstLastName, u.secondLastname, TRIM(CONCAT(u.name, " ", u.firstLastName, " ", u.secondLastName)) AS fullName \
              FROM Access AS a \
              LEFT JOIN User AS u ON u.id = a.userId\
              LEFT JOIN Device AS d ON d.userId = u.id\
              LEFT JOIN FirebaseToken AS ft ON ft.deviceId = d.id\
              WHERE a.roleId = 4 AND u.status = 1 AND d.status = 1 AND ft.status = 1 AND u.id = ? ;', [dealerId[0].dealerId])
          if (token.length > 0) {
            response = token[0]
          }
        }
      } else if (data.userId !== null && data.userId !== undefined) {
        let info = await db.query('SELECT ft.token, u.name, u.firstLastName, u.secondLastname, TRIM(CONCAT(u.name, " ", u.firstLastName, " ", u.secondLastName)) AS fullName  FROM User AS u \
        LEFT JOIN Device AS d ON d.userId = u.id\
        LEFT JOIN FirebaseToken AS ft ON ft.deviceId = d.id WHERE u.id = ? AND u.status = 1;', [data.userId])
        response = info[0]
      } else {
        let token = response.data = await db.query('SELECT ft.token, u.name, u.firstLastName, u.secondLastname, TRIM(CONCAT(u.name, " ", u.firstLastName, " ", u.secondLastName)) AS fullName \
              FROM Access AS a \
              LEFT JOIN User AS u ON u.id = a.userId\
              LEFT JOIN Device AS d ON d.userId = u.id\
              LEFT JOIN FirebaseToken AS ft ON ft.deviceId = d.id\
              WHERE a.roleId = 4 AND u.status = 1 AND d.status = 1 AND ft.status = 1 AND ft.`token` IS NOT NULL AND u.cityMunicipalityStateCode = ?;', [data.cityMunicipalityStateCode])
        // WHERE a.roleId = 4 AND u.status = 1 AND d.status = 1 AND ft.status = 1 AND ft.`token` IS NOT NULL ;')

        response = token

      }
    } catch (err) {
      response.error = err
    }
    await db.close()
    await eccomerce.close()

    if (response === undefined || response.error) {
      throw response
    }

    return response
  }

  User.updateUser = async (data) => {
    let response = {
      error: null,
      updated: false
    }
    let db = await Utils.connectToDB()
    try {
      let users = await db.query('SELECT email FROM `User` WHERE id = ?;', [data.id])
      if (users.length > 0) {
        let email = users[0].email

        if (email === data.email) {
          await db.query("UPDATE User SET name = ?, firstLastName = ?, secondLastName = ?, cellphone = ?, email = ? WHERE id = ?;", [data.name, data.firstLastName, data.secondLastName, data.cellphone, data.email, data.id])
        } else {
          let verificationToken = crypto.createHash('sha256').update(data.email).digest('hex')
          await db.query("UPDATE User SET name = ?, firstLastName = ?, secondLastName = ?, cellphone = ?, email = ?, status = 2, emailVerified = 0, verificationToken = ?, password = ? WHERE id = ?;", [data.name, data.firstLastName, data.secondLastName, data.cellphone, data.email, verificationToken, verificationToken, data.id])

          let template = await Utils.readFile(__dirname + '/../templates/new-account.html')
          template = handlebars.compile(template)

          let emailResponse = await Utils.sendEmail({
            from: '"Calzzapato.com" <contacto@calzzapato.com>',
            to: data.email,
            subject: 'Nueva cuenta backoffice Calzzapato.com 👠',
            template: template({
              user: {
                name: data.name,
                firstLastName: data.firstLastName
              },
              role: 'Repartidor',
              url: configs.HOST + '/bienvenido?token=' + verificationToken
            })
          })
          console.log(emailResponse)
        }
        await db.close()
        response.updated = true
      }
    } catch (err) {
      console.log(err)
      response.error = err
    }
    if (response.error) {
      throw response
    }

    return response
  }

  User.createDevice = async (data, req) => {
    let response = { created: false }
    let user = req.headers.user
    let instanceId = req.headers.instanceId
    let db = await Utils.connectToDB()
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
          await db.query('UPDATE FirebaseToken SET token = ? WHERE deviceId = ?;', [data.data.registrationToken, device[0].id])
        }
        response.created = true
        await db.commit()
      }
    } catch (err) {
      console.log("Error: ", err)
      response.created = false
      await db.rollback()
    }

    await db.close()
    return response
  }

  User.getCalzzamovilRating = async (req, folio) => {
    let response = { rating: null, feedback: null }
    let user = req.headers.user
    let instanceId = req.headers.instanceId
    let db = await Utils.connectToDB()

    try {

      let feedbackInfo = await db.query('SELECT feedback, rating FROM Calzzamovil AS c \
      LEFT JOIN `Order` AS o ON o.id = c.orderId WHERE order = ? AND o.status = 1 AND c.status = 1 TOP 1;', [folio])
      if (feedbackInfo.length > 0) {
        response.feedback = feedbackInfo[0].feedback
        response.rating = feedbackInfo[0].rating
      }
    } catch (err) {
      console.log("Error: ", err)
      response.created = false

    }
    await db.close()
    return response
  }

  User.getCalzzamovilCities = async () => {
    let response = []
    let eccomerce = await Utils.connectToDB({
      host: datasources.ecommerce.host,
      port: datasources.ecommerce.port,
      user: datasources.ecommerce.user,
      password: datasources.ecommerce.password,
      database: datasources.ecommerce.database
    })
    try {
      let cities = await eccomerce.query('SELECT id, name, cityMunicipalityStateCode, state, stateCode, cityId FROM CalzzamovilCity WHERE status = 1 ORDER BY `name`;')
      if (cities.length > 0) {
        response = cities
      }
    } catch (error) {
      console.log(error)
    }
    await eccomerce.close()
    return response
  }

  User.createAgreement = async (req, data) => {
    let response = { created: false }
    let db = await Utils.connectToDB()
    try {
      let newAgreement = await db.query('INSERT INTO Agreement (name, nickname, businessName, prefix, contactName, cellphone) VALUES (?, ?, ?, ?, ?, ?);', [
        data.name,
        data.nickname,
        data.businessName,
        data.prefix,
        data.contactName,
        data.cellphone,
      ])
      if (newAgreement.insertId > 0) {
        response.created = true
      }
    } catch (error) {
      console.log(error)
    }
    await db.close()
    return response
  }

  User.getAgreement = async (req) => {
    let response = { agreements: [], campaigns: [], folios: [] }
    let db = await Utils.connectToDB()
    try {
      let agreements = await db.query('SELECT id, name, nickname, prefix, contactName, cellphone, status  FROM Agreement ORDER BY id DESC;', [])
      let campaigns = await db.query('SELECT id, name, status FROM Campaign ORDER BY id DESC;')
      let folios = await Utils.mongoFind('Folio', {})
      folios = folios.reverse()

      await asyncForEach(folios, async (folio) => {
        let agreement = await db.query('SELECT name FROM Agreement WHERE id = ? LIMIT 1;', [folio.agreementId])
        let campaign = await db.query('SELECT name FROM Campaign WHERE id = ? LIMIT 1;', [folio.campaignId])
        folio.agreement = agreement[0].name
        folio.campaign = campaign[0].name
        folio.initFolio = folio.folios[0].code
        folio.finishFolio = folio.folios[folio.folios.length - 1].code
        folio.statusId = folio.status
        folio.status = (folio.status === 1) ? 'Activo' : 'Desactivado'
      })
      await db.close()
      response.agreements = agreements
      response.campaigns = campaigns
      response.folios = folios
    } catch (error) {
      console.log(error)
    }
    return response
  }

  User.createCampaign = async (req, data) => {
    let response = { created: false }
    let db = await Utils.connectToDB()
    try {
      let newAgreement = await db.query('INSERT INTO Campaign (name) VALUES (?);', [
        data.name,
      ])
      await db.close()
      if (newAgreement.insertId > 0) {
        response.created = true
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  User.getAgreementById = async (folio) => {
    let response = null
    let db = await Utils.connectToDB()
    try {
      let agreements = await db.query('SELECT id, name, nickname, businessName, prefix, contactName, cellphone, status FROM Agreement WHERE id = ? LIMIT 1;', [folio])
      await db.close()
      if (agreements.length > 0) {
        response = agreements[0]
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  User.editAgreement = async (folio, data) => {
    let response = { edited: false }
    let db = await Utils.connectToDB()
    try {
      let agreements = await db.query('UPDATE Agreement SET contactName = ?, cellphone = ? WHERE id = ?;', [data.contactName, data.cellphone, folio])
      await db.close()
      if (agreements.affectedRows === 1) {
        response.edited = true
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  User.getCampaignById = async (folio) => {
    let response = null
    let db = await Utils.connectToDB()
    try {
      let campaign = await db.query('SELECT id, name, status FROM Campaign WHERE id = ? LIMIT 1;', [folio])
      await db.close()
      if (campaign.length > 0) {
        response = campaign[0]
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  User.editCampaign = async (folio, data) => {
    let response = { edited: false }
    let db = await Utils.connectToDB()
    try {
      let campaign = await db.query('UPDATE Campaign SET name = ? WHERE id = ?;', [data.name, folio])
      await db.close()
      if (campaign.affectedRows === 1) {
        response.edited = true
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  User.createFolio = async (req, data) => {
    let response = { created: false }
    let db = await Utils.connectToDB()
    let agreementName = null
    let campaignName = null
    let foliosToSave = []
    try {
      let campaign = await db.query('SELECT name FROM Campaign WHERE id = ? LIMIT 1;', [data.campaignId])
      if (campaign.length > 0) {
        campaignName = campaign[0].name
      }
      let agreement = await db.query('SELECT name, prefix FROM Agreement WHERE id = ? LIMIT 1;', [data.agreementId])
      if (agreement.length > 0) {
        agreementName = agreement[0].name
      }
      if (campaignName !== null && agreementName !== null) {
        let lastTicket = 0
        let folios = await Utils.mongoFind('Folio', { agreementId: Number(data.agreementId) })
        if (folios.length > 0) {
          lastTicket = Number(folios[folios.length - 1].lastTicket) + 1
        } else {
          lastTicket = 1
        }
        let limit = Number(lastTicket) + Number(data.totalFolios)
        for (let index = lastTicket; index < limit; index++) {
          let number = String(index).padStart(5, '0')
          foliosToSave.push({ code: agreement[0].prefix + number, status: true, userId: null })
        }
        await Utils.createMongoDB(User.app.models.Folio, {
          campaignId: data.campaignId,
          name: 'Folio ' + agreement[0].prefix,
          agreementId: data.agreementId,
          totalFolios: data.totalFolios,
          import: data.import,
          initDate: (data.initDate !== null && data.initDate !== undefined) ? new Date(data.initDate) : null,
          finishDate: (data.finishDate !== null && data.finishDate !== undefined) ? new Date(data.finishDate) : null,
          // initDate: new Date(),
          // finishDate: new Date(),
          folios: foliosToSave,
          createdAt: new Date(),
          lastTicket: Number(lastTicket) + Number(data.totalFolios) - 1
        })
        response.created = true
      }
    } catch (error) {
      console.log(error)
    }
    await db.close()
    return response
  }

  User.getFolioById = async (id) => {
    let response = null
    try {
      let folios = await Utils.mongoFind('Folio', {
        _id: ObjectId(id)
      })
      if (folios.length > 0) {
        response = folios[0]
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  User.editFolio = async (folio, data) => {
    let response = { edited: false }
    try {
      let folios = await Utils.mongoFind('Folio', { _id: ObjectId(folio) })
      if (folios.length > 0) {
        let folioToSave = folios[0]
        if (data.finishDate !== null && data.finishDate !== undefined) {
          folioToSave.finishDate = new Date(data.finishDate)
        }
        if (data.status !== null && data.status !== undefined) {
          if (folioToSave.status === 1) {
            folioToSave.status = 2
          } else {
            folioToSave.status = 1
          }
        }
        let update = await Utils.updateMongoDb(User.app.models.Folio, folioToSave, folio)
        if (update.success) {
          response.edited = true
        }
      }
    } catch (error) {
      console.log(error)
    }
    return response
  }

  User.remoteMethod('updateDelivery', {
    description: 'Update delivery status.',
    http: {
      path: '/calzzamovil/:userId/delivery/update',
      verb: 'PATCH'
    },
    accepts: [
      {
        arg: 'userId', type: "number", require: true
      }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('getCalzzamovil',
    {
      description: 'Get a list of orders and deliverys.',
      http: {
        path: '/calzzamovil',
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
    }
  )

  User.remoteMethod('getDeliveryDetail',
    {
      description: 'Get delivery detail',
      http: {
        path: '/calzzamovil/:userId/delivery',
        verb: 'GET'
      },
      accepts: [
        { arg: 'userId', type: 'number', required: true },
        { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
      ],
      returns: {
        arg: 'data',
        type: ['Object'],
        root: true
      }
    }
  )

  User.remoteMethod('getCalzzamovilOrderDetail', {
    description: 'Get orders by user',
    http: {
      path: '/calzzamovil/:folio/order',
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

  User.remoteMethod('getClientDetail', {
    description: 'Get client detail',
    http: {
      path: '/calzzamovil/client/:userId',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.rq } },
      { arg: 'userId', type: 'number', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('getOrderEvidence', {
    description: 'Get evidence of order',
    http: {
      path: '/calzzamovil/order/:orderId/evidence',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.rq } },
      { arg: 'orderId', type: 'number', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('cancelOrder', {
    description: 'Cancel order',
    http: {
      path: '/calzzamovil/cancel',
      verb: 'POST'
    },
    accepts: [{
      arg: 'data', type: 'object', http: { source: 'body' }, required: true
    }
    ],
    returns: {
      arg: 'data',
      type: ['Object'],
      root: true
    }
  })


  User.remoteMethod('updateUser', {
    description: 'Update user info',
    http: {
      path: '/calzzamovil/update',
      verb: 'POST'
    },
    accepts: [{
      arg: 'data', type: 'object', http: { source: 'body' }, required: true
    }
    ],
    returns: {
      arg: 'data',
      type: ['Object'],
      root: true
    }
  })

  User.remoteMethod('modules',
    {
      description: 'Get modules by user',
      http: {
        path: '/:email/modules',
        verb: 'GET'
      },
      accepts: [
        { arg: 'email', type: 'string', required: true },
        { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
      ],
      returns: {
        arg: 'data',
        type: ['Object'],
        root: true
      }
    }
  )

  User.remoteMethod('createAccount', {
    description: 'Create user account',
    http: {
      path: '/create',
      verb: 'POST'
    },
    accepts: [
      {
        arg: 'data', type: 'object', http: { source: 'body' }, required: true,
      }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

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

  User.remoteMethod('recoveryPassword', {
    description: 'Send email for recovery password',
    http: {
      path: '/recovery-password',
      verb: 'POST'
    },
    accepts: [
      {
        arg: 'data', type: 'object', http: { source: 'body' }, required: true
      }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('validateToken', {
    description: 'Validate token',
    http: {
      path: '/validate-token',
      verb: 'POST'
    },
    accepts: [
      {
        arg: 'data', type: 'object', http: { source: 'body' }, required: true
      }
    ],
    returns: {
      arg: 'data',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('setNewPassword', {
    description: 'Set new password',
    http: {
      path: '/password',
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

  User.remoteMethod('facebookLogin', {
    description: 'Login with facebook',
    http: {
      path: '/fb-login',
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

  User.remoteMethod('login', {
    description: 'Login for users',
    http: {
      path: '/login',
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

  User.remoteMethod('getAddressesByUser', {
    description: 'Get addresses by user',
    http: {
      path: '/addresses',
      verb: 'GET'
    },
    accepts: [
      { arg: 'id', type: 'string', require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('getFavoriteAddress', {
    description: 'Get favorite address id from an user',
    http: {
      path: '/:id/favoriteAddress',
      verb: 'GET'
    },
    accepts: [
      {
        arg: 'id', type: 'number', required: true,
      }
    ],
    returns: {
      arg: 'id',
      type: 'string',
      root: true
    }
  })

  User.remoteMethod('setFavoriteAddress', {
    description: 'Sets favorite address id of an user',
    http: {
      path: '/setFavoriteAddress',
      verb: 'POST'
    },
    accepts: [
      {
        arg: 'data', type: 'Object', required: true,
      }
    ],
    returns: {
      arg: 'data',
      type: 'Object',
      root: true
    }
  })

  User.remoteMethod('updateUserInfo', {
    description: 'Update user personal information',
    http: {
      path: '/update-info',
      verb: 'POST'
    },
    accepts: [
      {
        arg: 'data', type: 'Object', required: true,
      }
    ],
    returns: {
      arg: 'data',
      type: 'Object',
      root: true
    }
  })

  User.remoteMethod('permissions', {
    description: 'Get permissions by user',
    http: {
      path: '/:email/permissions',
      verb: 'GET'
    },
    accepts: [
      { arg: 'email', type: 'string', required: true },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: ['Object'],
      root: true
    }
  }
  )

  User.remoteMethod('getUsers', {
    description: 'Get list of users',
    http: {
      path: '/list',
      verb: 'GET'
    },
    accepts: [
      { arg: 'filter', type: 'string', required: false },
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } }
    ],
    returns: {
      arg: 'data',
      type: ['Object'],
      root: true
    }
  }
  )

  User.remoteMethod('getRoles', {
    description: 'Get list of user roles',
    http: {
      path: '/roles',
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
  }
  )

  User.remoteMethod('getBranches', {
    description: 'Get list of branchees',
    http: {
      path: '/branches',
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
  }
  )

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

  User.remoteMethod('getTokensForTracking', {
    description: 'Get token for use in tracking',
    http: {
      path: '/token',
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

  User.remoteMethod('getCalzzamovilRating', {
    description: 'Get rating and feedback in calzzamovil orders.',
    http: {
      path: '/calzzamovil/:folio/rating',
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

  User.remoteMethod('getCalzzamovilCities', {
    description: 'Get a list of cities where calzzamovil is available.',
    http: {
      path: '/calzzamovil/cities',
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
  }
  )

  User.remoteMethod('createAgreement', {
    description: 'Create new agreement',
    http: {
      path: '/agreement/new',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: "object", http: { source: 'body' }, require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('getAgreement', {
    description: 'Get an agreement list.',
    http: {
      path: '/agreement/all',
      verb: 'GET'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('createCampaign', {
    description: 'Create new Campaign.',
    http: {
      path: '/campaign/new',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: "object", http: { source: 'body' }, require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('getAgreementById', {
    description: 'Get a especific agreement by id.',
    http: {
      path: '/agreement/:folio/',
      verb: 'GET'
    },
    accepts: [
      { arg: 'folio', type: 'string', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('editAgreement', {
    description: 'Edit agreement by id.',
    http: {
      path: '/agreement/:folio/',
      verb: 'PATCH'
    },
    accepts: [
      { arg: 'folio', type: 'string', required: true },
      { arg: 'data', type: "object", http: { source: 'body' }, require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('getCampaignById', {
    description: 'Get a especific agreement by id.',
    http: {
      path: '/campaign/:folio/',
      verb: 'GET'
    },
    accepts: [
      { arg: 'folio', type: 'string', required: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('editCampaign', {
    description: 'Edit campaign by id.',
    http: {
      path: '/campaign/:folio/',
      verb: 'PATCH'
    },
    accepts: [
      { arg: 'folio', type: 'string', required: true },
      { arg: 'data', type: "object", http: { source: 'body' }, require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('createFolio', {
    description: 'Create new folio',
    http: {
      path: '/folio/new',
      verb: 'POST'
    },
    accepts: [
      { arg: 'req', type: 'object', http: ctx => { return ctx.req } },
      { arg: 'data', type: "object", http: { source: 'body' }, require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

  User.remoteMethod('getFolioById', {
    description: 'Get a especific folio by id.',
    http: {
      path: '/folio/:id/',
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

  User.remoteMethod('editFolio', {
    description: 'Edit folio by id.',
    http: {
      path: '/folio/:folio/',
      verb: 'PATCH'
    },
    accepts: [
      { arg: 'folio', type: 'string', required: true },
      { arg: 'data', type: "object", http: { source: 'body' }, require: true }
    ],
    returns: {
      arg: 'response',
      type: 'object',
      root: true
    }
  })

}
