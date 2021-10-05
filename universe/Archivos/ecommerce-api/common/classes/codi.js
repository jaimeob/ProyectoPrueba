'use strict'

const Utils = require('../Utils.js')

const createCodiOrder = async (data) => {
  // Agrega credenciales
  console.log('CreateCodiOrder');
  try {

    let body = '<xsd:complexType name="consultaLineaCaptura">\
    <xsd:sequence>\
    <xsd:element name="LineaDeCaptura" type="xsd:string"/>\
    </xsd:sequence>\
    </xsd:complexType>'

    let request = await Utils.request({
      method: 'POST',
      url: 'https://200.16.40.148:443/?consultaLineaCaptura',
      headers: {
        "content-type": "text/xml"
      },
      body: body
    })
    console.log(request.body)
  } catch (error) {

  }
}

module.exports = ({
  createCodiOrder
})
