const configs = require('../configs.development.json')
const Utils = require('../Utils')


// ORIENTACION
const getAllUsers = async (db) => {
    let response = []
    try {
        let users = await db.query(`SELECT id,Name, firstLastName,secondLastName,email FROM User WHERE status = 1`)
        if (users.length !== 0) {
            response = users
        }
    } catch (error) {
        console.log(error)
    }
    return response
}

const getLastPurshaseUsers = async (db) => {
    let response = []
    try {
        let users = await db.query(`SELECT id,Name, firstLastName,secondLastName,email FROM User WHERE status = 1`)
        if (users.length !== 0) {
            response = users
        }
    } catch (error) {
        console.log(error)
    }
    return response
}

const getCityUsers = async (db,municipality) => {
    let response = []
    try {
        // let municipality = '00625'
        let users = await db.query("SELECT u.id,u.Name,u.firstLastName,u.secondLastName,u.email \
            FROM `User` AS u\
            LEFT JOIN  `Address` AS ad ON ad.id = u.favoriteAddressId\
            WHERE ad.municipalityCode IN (?)", [municipality])
        
        if (users.length !== 0) {
            response = users
        }
    } catch (error) {
        console.log(error)
    }
    return response
}

const getNoPurshaseUsers = async (db) => {
    let response = []
    try {
        let users = await db.query(`SELECT id,Name, firstLastName,secondLastName,email FROM User WHERE lastOrderId IS NULL AND status =1;`)
        if (users.length !== 0) {
            response = users
        }
    } catch (error) {
        console.log(error)
    }
    return response
}

const getWithFacebookUsers = async (db) => {
    let response = []
    try {
        let users = await db.query(`SELECT id,Name, firstLastName,secondLastName,email FROM User WHERE facebookId != "" AND status =1`)
        if (users.length !== 0) {
            response = users
        }
    } catch (error) {
        console.log(error)
    }
    return response
}

const getWithoutFacebookUsers = async (db) => {
    let response = []
    try {
        let users = await db.query(`SELECT id,Name, firstLastName,secondLastName,email FROM User WHERE facebookId = "" AND status =1`)
        if (users.length !== 0) {
            response = users
        }
    } catch (error) {
        console.log(error)
    }
    return response
}

const getNewsletterUsers = async (db) => {
    let response = []
    try {
        let users = await db.query(`SELECT U.id,U.Name,U.firstLastName,U.secondLastName,U.email FROM User AS U
        INNER JOIN  Subscriber AS SUB ON  SUB.email = U.email  WHERE U.status =1`)
        if (users.length !== 0) {
            response = users
        }
    } catch (error) {
        console.log(error)
    }
    return response
}


////

module.exports = {
    getAllUsers,
    getLastPurshaseUsers,
    getNoPurshaseUsers,
    getWithFacebookUsers,
    getWithoutFacebookUsers,
    getNewsletterUsers,
    getCityUsers
}