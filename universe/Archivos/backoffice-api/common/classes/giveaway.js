const configs = require('../configs.development.json')
const Utils = require('../Utils')
const getCalzzapatoToken = async () => {
  let response = null
  try {
    let req = await Utils.request({
      method: 'POST',
      url: "http://cloud.calzzapato.com/apicore/Token",
      headers: {
        'email': "app@calzzapato.com",
        'key': "920A2E6E-DA03-48EA-B6C3-09B5ED5DFD77"
      }
    })
    if (req.body !== null && req.body !== undefined) {
      response = req.body
    }
  } catch (error) {
    console.log(error)
  }  
  return response
}

const createCalzzapatoCoupon = async (ticket) => {
  let response = null
  try {
    let token = await getCalzzapatoToken()
    if (token !== null && token !== undefined) {
      let req = await Utils.request({
        method: 'GET',
        url: `http://cloud.calzzapato.com/apicore/GrupoCalzapato_General/DatosCompras/${ticket}`,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true,
      })
      if (req.body !== null && req.body !== undefined) {
        response = req.body
      }
    }
  } catch (error) {
    console.log(error)
  }
  return response
}

module.exports = {getCalzzapatoToken,createCalzzapatoCoupon}