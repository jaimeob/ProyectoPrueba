import { getAuthAPI } from '../api/api'
import lodash, { constant } from 'lodash'
import Axios from 'axios'
import { isMobileOnly, isDesktop } from 'react-device-detect'
const ENV = process.env.REACT_APP_MODE

const constants = {
  CONFIG_ENV: process.env.CONFIG_ENV,
  HOST_CDN_AWS: "https://s3-us-west-1.amazonaws.com/calzzapato",
  version: '3.0.210629',
  paths: {
    home: '/',
    login: '/ingreso',
    signUp: '/registro',
    allProducts: '/todos',
    recoveryPassword: '/recuperar-contrasena',
    newPassword: '/nueva-contrasena',
    addresses: '/direcciones',
    checkout: '/compras/finalizar',
    payments: '/pagar',
    terms: '/terminos',
    privacy: '/privacidad',
    aboutUs: '/nosotros',
    faq: '/preguntas',
    locateYourStore: '/tiendas',
    category: '/categorias/:people',
    success: '/resumen/:token',
    categoryExplorer: '/:section/:sectionId',
    productDetail: '/todos/:name/:sku',
    catalog: '/catalogos',
    support: '/soporte',
    myOrders: "/mi-cuenta/mis-pedidos",
    myAccount: '/mi-cuenta',
    mySections: '/mi-cuenta/mis-apartados',
    addresses: '/mi-cuenta/mis-direcciones',
    myTaxData: '/mi-cuenta/datos-fiscales',
    personalInfo: '/mi-cuenta/informacion-personal',
    myCatalogs: "/mi-cuenta/mis-catalogos",
    myCards: "/mi-cuenta/mis-tarjetas",
    validateCrediVale: "/validar-credivales",
    offers: "/todos?csa=eyJwZyI6MCwibCI6NTAsInUiOm51bGwsImMiOm51bGwsImJjIjpudWxsLCJiciI6W10sInNjIjpbXSwiYiI6W10sImEiOltdLCJzIjpbXSwicCI6W10sImciOltdLCJvIjp0cnVlLCJicCI6ZmFsc2UsIm9iIjoiYmVzdE9mZmVyIn0=",
    checkoutDireccions: "/checkout/direcciones",
    checkoutPago: "/checkout/pagos",
    checkoutVerificar: "/checkout/verificar",
    carrito: "/carrito"
  },
  localStorage: {
    UUID: 'uuid',
    USER: 'user',
    MODULES: 'modules',
    MENU: 'menu',
    SHOPPING_CART: 'shoppingCart',
    ORDER: 'order',
    CATALOG: 'catalog',
    CATALOG_INIT: 'catalogInit',
    IP: 'ip',
    DELIVERY_ADDRESS: 'deliveryAddress'
  },
  status: {
    SUCCESS: 200,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    PAYLOAD_TO_LARGE: 413,
    ERROR: 500
  }
}

const checkLanguage = () => {
  const userLang = navigator.language || navigator.userLanguage
  const lang = userLang.split('-')[0]
  return lang.toLowerCase()
}
const cloneJson = function (json = {}) {
  return JSON.parse(JSON.stringify(json))
}
const isEmpty = (value) => {
  try {
    return lodash.isEmpty(value)
  } catch (e) {
    return true
  }
}
const isUserLoggedIn = () => {
  let data = JSON.parse(localStorage.getItem(constants.localStorage.USER))
  if (isEmpty(data)) {
    return false
  }
  return true
}
const onlyDate = (val) => {
  try {
    return val.split("T")[0].trim()
  }
  catch (error) {
    return '-'
  }
}

const isExternalLink = (url) => {
  return (url.substring(0, 4) === 'http' || url.substring(0, 5) === 'https')
}

const getCurrentUser = async () => {
  let auth = await getAuthAPI()
  if (auth.status === constants.status.SUCCESS) {
    return auth.data
  } else {
    return null
  }
}

const getMetadata = () => {
  let user = null

  if (isUserLoggedIn()) {
    user = JSON.parse(localStorage.getItem(constants.localStorage.USER))
  }

  let ip = localStorage.getItem(constants.localStorage.IP)

  let metadata = {
    ip,
    instance: constants.CONFIG_ENV.UUID,
    user: user,
    appCodeName: window.navigator.appCodeName,
    appName: window.navigator.appName,
    appVersion: window.navigator.appVersion,
    cookieEnabled: window.navigator.cookieEnabled,
    deviceMemory: window.navigator.deviceMemory,
    hardwareConcurrency: window.navigator.hardwareConcurrency,
    language: window.navigator.language,
    platform: window.navigator.platform,
    product: window.navigator.product,
    productSub: window.navigator.productSub,
    userAgent: window.navigator.userAgent,
    vendor: window.navigator.vendor,
    vendorSub: window.navigator.vendorSub
  }

  metadata.uuid = encode(JSON.stringify(metadata))

  metadata.screen = {
    height: window.screen.height,
    width: window.screen.width,
    availHeight: window.screen.availHeight,
    availWidth: window.screen.availWidth,
    availTop: window.screen.availTop,
    availLeft: window.screen.availLeft,
    pixelDepth: window.screen.pixelDepth
  }
  
  return metadata
}

const getToken = () => {
  let user = localStorage.getItem(constants.localStorage.USER)
  if (user !== undefined) {
    try {
      user = JSON.parse(user)
      if (user.token !== undefined) {
        return user.token
      }
    } catch (err) {
      return ''
    }
  }
  return ''
}

const scrollTop = () => {
  window.scrollTo(0, 0)
}

const validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase())
}

const validatePassword = (pass) => {
  //at least 8 characters that are letters, numbers or the underscore
  //at least one lowercase and one uppercase letter
  var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])\w{8,}$/;
  return re.test(String(pass))
}
const isNumeric = (val) => {
  return lodash.isNumber(val)
}

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const isPhoneNumber = (val) => !isNaN(val)

// M??todo para enviar producto a Conversion API Facebook
const sendConversionApiFacebook = async function (dataToSend, uuidActual){
  let pixelId= ''
  let accessToken=''
  let device = {type: null}
  
  isDesktop ? device.type='website' : device.type='mobile'

  if(dataToSend.data[0].custom_data){
    let custom = dataToSend.data[0].custom_data
    dataToSend.data[0].custom_data={...custom, device}
  }else{
    dataToSend.data[0].custom_data=device
  }

  if(uuidActual !== null && uuidActual !== undefined && uuidActual !== ''){
    switch (uuidActual) {
      case '054b980b-6f4e-4d0c-8d53-1915be4abea2': //Calzzapato
        pixelId = '716528969259588'
        accessToken = 'EAAMn8PbuTDIBABa0cG74gWZBcwoR3pYO6ZBmYBtBe12fWw5OS9ya6sOOIWGcUc8ebH0ZBdTWcNKMOpnSO4FHGaaXVsZBFgjrBHndBwMOZAYoyfR3QRIdoy2q63wMGcCuZAT6fZCdxklz0VA0IkuMiPQTcZAZCD7iUbXlBoJ3HMkcxVni81qH5X8a8SAgUH95KGHwZD'
        break;
      
      case '2b0c178e-516b-4673-b5be-46a298a159d1': //Kelder
        pixelId = '666297137628567'
        accessToken = 'EAAMn8PbuTDIBAB8PXcsiUHhslnaZBU7QoMv9nUkRqZAZCi08XpbRVWCLnoWogVmIoNAbtfgzn5aVoW9K6ZB5sRrZCR6FvnPVI59EqjjDP9ZBzbeLbEaqMQLSigViLbTziL3WhUurHN4pke5HBgUBqu8eZA1ylZAuRIS5ZCNghaMfMYRVrwe9MGuFU3ybOdV8XZAlkZD'
        break;

      case 'e2a08434-976d-44cc-b1c0-16c5235b0b62': //Urbanna
        pixelId = '839554736852750'
        accessToken = 'EAAMn8PbuTDIBAD6lYCgeHHzxxjzONVKyUfQFyHZChGTEZASgSUncqh82UMkliS4SmhBJc5ZBZA1dNrRZBPe2ZAsqcima8gCe5cFikow2x9OfN2tgflWo415pMMMAyZA8FwDlfx6p3OE7a2bwzfRXX5j6CRkRZA6rgUO0jUQ44BwM1BpGtQLlAa8jzLhC8qCJqdQZD'
        break;

      case '2c8041f1-d7f1-462c-b39d-3ca68f252579': //Calzasport
        pixelId = '3185348928258831'
        accessToken = 'EAAMn8PbuTDIBAPQ5DGjMC3c7itKlZC0CPbQD7UlygWY5YB37Hvx43gptKeaJvmpuvCsKtZA1kSf4fQGbfriQ3skMVcZCFrZAesP8AUcdRl3fMMTS45N8Ulu4C2sDAl36EJdcXY1eUZAbL55aEwYPycyWj4g7CdkGrJgdd4eZA0bHSoZAwEccJCHbAb5ZBKCZB2CMZD'
        break;

      case 'aecc4fd0-6171-4a55-a5eb-803a051574a5': //Calzakids
        pixelId = '331453044747334'
        accessToken = 'EAAMn8PbuTDIBAMfqs0REUp4qAZA0xLipt3DFsY5Dz5fpbUMkywio0cZAEPa7LY0xboiJ3bN6LZAeW1MurYU6hZA2PHHHk10fCKE1LWE6QAzrkqA6a60mh9OPwR0IIaSQ0BUWpgNQeqLrRFH4M037OMi8kduINihkkpCLZBbJDUBAGaSr14AoVPNPAfAhRlGYZD'
        break;

      default:
          return 0
    }
  }
  const sendConversionApi = `https://graph.facebook.com/v10.0/${pixelId}/events?access_token=${accessToken}`
  
  if (dataToSend !== undefined)
  try {
    const { data } = await Axios.post(sendConversionApi, dataToSend)
  } catch (error) {
    console.log(error)
  }
}

const hashingData = async function(data){
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(data);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string                  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

//Esto es para conversiones de api (Facebook)
const timeIntoSeconds = function(dateToConvert){
  return Math.floor(dateToConvert.getTime() / 1000)
}

// public method for encoding
const encode = function (input) {
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  var output = ""
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4
  var i = 0
  input = _utf8_encode(input)
  while (i < input.length) {
    chr1 = input.charCodeAt(i++)
    chr2 = input.charCodeAt(i++)
    chr3 = input.charCodeAt(i++)
    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63
    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4)
  }
  return output
}

// public method for decoding
const decode = function (input) {
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  var output = ""
  var chr1, chr2, chr3
  var enc1, enc2, enc3, enc4
  var i = 0
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "")
  while (i < input.length) {
    enc1 = _keyStr.indexOf(input.charAt(i++))
    enc2 = _keyStr.indexOf(input.charAt(i++))
    enc3 = _keyStr.indexOf(input.charAt(i++))
    enc4 = _keyStr.indexOf(input.charAt(i++))
    chr1 = (enc1 << 2) | (enc2 >> 4)
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    chr3 = ((enc3 & 3) << 6) | enc4
    output = output + String.fromCharCode(chr1)
    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2)
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3)
    }
  }
  output = _utf8_decode(output)
  return output
}

// private method for UTF-8 encoding
const _utf8_encode = function (string) {
  string = string.replace(/\r\n/g, "\n")
  var utftext = ""
  for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n)
    if (c < 128) {
      utftext += String.fromCharCode(c)
    }
    else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192)
      utftext += String.fromCharCode((c & 63) | 128)
    }
    else {
      utftext += String.fromCharCode((c >> 12) | 224)
      utftext += String.fromCharCode(((c >> 6) & 63) | 128)
      utftext += String.fromCharCode((c & 63) | 128)
    }
  }
  return utftext
}

// private method for UTF-8 decoding
const _utf8_decode = function (utftext) {
  var string = ""
  var i = 0
  var c, c2, c3 = 0
  while (i < utftext.length) {
    c = utftext.charCodeAt(i)
    if (c < 128) {
      string += String.fromCharCode(c)
      i++
    }
    else if ((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i + 1)
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
      i += 2
    }
    else {
      c2 = utftext.charCodeAt(i + 1)
      c3 = utftext.charCodeAt(i + 2)
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
      i += 3
    }
  }
  return string
}

const jsonToArray = function (json) {
  var result = []
  var keys = Object.keys(json)
  keys.forEach(function (key) {
    result.push(json[key])
  })
  return result
}

const orderBy = function (array, property, direction) {
  return lodash.orderBy(array, [property], [direction])
}

const uniqBy = function (array, property) {
  return lodash.uniqBy(array, function (item) {
    return item[property]
  })
}

const checkImage = (source) => {
  return new Promise(function (resolve, reject) {
    let img = new Image()
    img.src = source
    img.onload = function () {
      if (this.height > this.width) {
        resolve({ direction: 'VERTICAL' })
      } else {
        resolve({ direction: 'HORIZONTAL' })
      }
    }
    img.onerror = function () {
      resolve({ direction: 'HORIZONTAL' })
    }
  })
}

const getPlaceholderByGender = (gender_id) => {
  return '/placeholder.svg'
  switch (gender_id) {
    case 1:
      return womanPlaceholder
    case 2:
      return manPlaceholder
    case 3:
    case 4:
    case 5:
      return boyPlaceholder
  }
}

const getDeliveryAddress = () => {
  let address = localStorage.getItem(constants.localStorage.DELIVERY_ADDRESS)
  try {
    address = JSON.parse(address)
    if (address.zip !== undefined) {
      return address
    }
  } catch (err) { }
  return {
    zip: '',
    state: '',
    city: ''
  }
}

const cybs_dfprofiler = (org_id, merchantID, sessionID) => {
  //JavaScript Code
  var tmscript = document.createElement("script");

  tmscript.src = "https://h.online-metrix.net/fp/tags.js?org_id=" + org_id + "&session_id=" + sessionID;

  tmscript.type = "text/javascript";

  document.getElementsByTagName("head")[0].appendChild(tmscript);

  //Iframe Code
  var iframeTM = document.createElement("iframe");

  iframeTM.setAttribute('id', 'iframeTM');
  iframeTM.style.width = "100px";
  iframeTM.style.height = "100px";
  iframeTM.style.border = "0";
  iframeTM.style.position = "absolute";
  iframeTM.style.top = "-5000px";

  iframeTM.src = "https://h.online-metrix.net/fp/tags?org_id=" + org_id + "&session_id=" + merchantID + sessionID;

  document.body.appendChild(iframeTM);

  return sessionID;
}

const initOpenPay = (callback) => {
  const existingScript = document.getElementById('openPay')
  if (!existingScript) {
    const script = document.createElement('script')
    script.src = 'https://js.openpay.mx/openpay.v1.min.js'
    script.id = 'openPay'
    document.body.appendChild(script)
    script.onload = () => {
      if (callback) callback()
    }
  }
  if (existingScript && callback) callback()
}

const getDeviceIdOpenpay = () => {
  var deviceSessionId = OpenPay.deviceData.setup("payment-form", "deviceIdHiddenFieldName")
  return deviceSessionId
}

const createToken = (data) => {
  return new Promise(async (resolve, reject) => {
    OpenPay.token.create({
        "card_number": data.number,
        "holder_name": data.titular,
        "expiration_year": data.year,
        "expiration_month": data.month,
        "cvv2": data.cvv,
      }, async function (response, error) {
        if (error === undefined || error ===  null && response !== undefined && response !== null) {
          return resolve({ success: true, card: response })
          
        } else {
          return reject({ success: false, error: error2 })
        }
    })
  })
}

const addProductToCatalog = (data) => {
  let newProduct = true
  let products = JSON.parse(localStorage.getItem(constants.localStorage.CATALOG))

  if (products !== null) {
    if (products.length > 0) {
      products.forEach(function (p, idx) {
        if (p.code === data.code) {
          newProduct = false
        }
      })
    }
  }
  else {
    products = []
  }

  if (newProduct) {
    products.push({ code: data.code })
  }

  localStorage.setItem(constants.localStorage.CATALOG, JSON.stringify(products))
  return products
}

const removeProductFromCatalog = (data) => {
  let products = JSON.parse(localStorage.getItem(constants.localStorage.CATALOG))
  if (products !== null) {
    if (products.length > 0) {
      products.forEach(function (product, idx) {
        if (product.code === data.code) {
          products.splice(idx, 1)
        }
      })
    }
  } else {
    products = []
  }

  localStorage.setItem(constants.localStorage.CATALOG, JSON.stringify(products))
  return products
}

const activeCatalog = () => {
  if (Number(localStorage.getItem(constants.localStorage.CATALOG_INIT)) === 1) {
    let products = JSON.parse(localStorage.getItem(constants.localStorage.CATALOG))
    return (products === null) ? [] : products
  }
}
const isProductIntoCatalog = (data) => {
  let exist = false
  let products = JSON.parse(localStorage.getItem(constants.localStorage.CATALOG))
  if (products !== null) {
    if (products.length > 0) {
      products.forEach(function (p, idx) {
        if (p.code === data.code) {
          exist = true
        }
      })
    }
  }
  return exist
}

const getCurrentCatalog = () => {
  let products = JSON.parse(localStorage.getItem(constants.localStorage.CATALOG))
  if (products !== null) {
    return products
  }
  return []
}

const getBase64 = function (file) {
  return new Promise(function (resolve, reject) {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function () { resolve(reader.result) }
    reader.onerror = function (err) { reject(err) }
  })
}

const compressImage = (data, type, width, height, compress) => {
  let canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(data, 0, 0, width, height)
  return canvas.toDataURL(type, compress)
}

const dataURLToBlob = (dataURL, type) => {
  // Decode the dataURL
  var binary = atob(dataURL.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: type });
}

const distance = (user, store) => {
  var radUserLat = Math.PI * user.lat / 180
  var radStoreLat = Math.PI * store.lat / 180

  var theta = user.lng - store.lng
  var radTheta = Math.PI * theta / 180
  var dist = Math.sin(radUserLat) * Math.sin(radStoreLat) + Math.cos(radUserLat) * Math.cos(radStoreLat) * Math.cos(radTheta);

  dist = Math.acos(dist)
  dist = dist * 180 / Math.PI
  dist = dist * 60 * 1.1515

  return dist * 1.609344
}

const getAge = (value) => {
  let today = new Date()
  let birthDate = new Date(value)
  let age = today.getFullYear() - birthDate.getFullYear()
  let m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

const checkSpecialCharacters = (value) => {
  if (value.includes('[') || value.includes('??') || value.includes(',') || value.includes('.') || value.includes('!') || value.includes('@') || value.includes('^') || value.includes('|') || value.includes('??') || value.includes('??') || value.includes('??') || value.includes('*') || value.includes('/') || value.includes('\\') || value.includes('-') || value.includes(';') || value.includes('}') || value.includes('%') || value.includes('{') || value.includes(')') || value.includes('&') || value.includes('$') || value.includes('??') || value.includes('=') || value.includes('#') || value.includes('+') || value.includes('\'') || value.includes('\"')) {
    return true
  } else {
    return false
  }
}

const isVertical = async (source) => {
  let response = await checkImage(constants.HOST_CDN_AWS + '/thumbs/' + source)
  if (response.direction === 'VERTICAL') {
    return true
  }
  return false
}

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const generateURL = (name) => {
  let url = name.split(" ").join('-').split('/').join('-').split('.').join('-').split('_').join('-').split(';').join('-').split('(').join('-').split(')').join('-').split('"').join('-').split('\'').join('-').split('\`').join('').split('`').join('').split('\??').join('').split('??').join('').split('+').join('').split('\\').join('').split('\\').join('').split('#').join('-').split("'").join('-').toLowerCase()
  url = url.split('------').join('-').split('-----').join('-').split('----').join('-').split('---').join('-').split('--').join('-')
  url = url.split('??').join('S')
    .split('??').join('s')
    .split('??').join('Z')
    .split('??').join('z')
    .split('??').join('A')
    .split('??').join('A')
    .split('??').join('A')
    .split('??').join('A')
    .split('??').join('A')
    .split('??').join('A')
    .split('??').join('A')
    .split('??').join('C')
    .split('??').join('E')
    .split('??').join('E')
    .split('??').join('E')
    .split('??').join('E')
    .split('??').join('I')
    .split('??').join('I')
    .split('??').join('I')
    .split('??').join('I')
    .split('??').join('O')
    .split('??').join('O')
    .split('??').join('O')
    .split('??').join('O')
    .split('??').join('O')
    .split('??').join('O')
    .split('??').join('U')
    .split('??').join('U')
    .split('??').join('U')
    .split('??').join('U')
    .split('??').join('Y')
    .split('??').join('B')
    .split('??').join('Ss')
    .split('??').join('a')
    .split('??').join('a')
    .split('??').join('a')
    .split('??').join('a')
    .split('??').join('a')
    .split('??').join('a')
    .split('??').join('a')
    .split('??').join('c')
    .split('??').join('e')
    .split('??').join('e')
    .split('??').join('e')
    .split('??').join('e')
    .split('??').join('i')
    .split('??').join('i')
    .split('??').join('i')
    .split('??').join('i')
    .split('??').join('o')
    .split('??').join('o')
    .split('??').join('o')
    .split('??').join('o')
    .split('??').join('o')
    .split('??').join('o')
    .split('??').join('o')
    .split('??').join('u')
    .split('??').join('u')
    .split('??').join('u')
    .split('??').join('y')
    .split('??').join('b')
    .split('??').join('y')
    .split('&').join('&amp;')
    .split('??').join('&Agrave;')
    .split('??').join('&Aacute;')
    .split('??').join('&Acirc;')
    .split('??').join('&Atilde;')
    .split('??').join('&Auml;')
    .split('??').join('&Aring;')
    .split('??').join('&AElig;')
    .split('??').join('&Ccedil;')
    .split('??').join('&Egrave;')
    .split('??').join('&Eacute;')
    .split('??').join('&Ecirc;')
    .split('??').join('&Euml;')
    .split('??').join('&Igrave;')
    .split('??').join('&Iacute;')
    .split('??').join('&Icirc;')
    .split('??').join('&Iuml;')
    .split('??').join('&ETH;')
    .split('??').join('&Ograve;')
    .split('??').join('&Oacute;')
    .split('??').join('&Ocirc;')
    .split('??').join('&Otilde;')
    .split('??').join('&Ouml;')
    .split('??').join('&Oslash;')
    .split('??').join('&Ugrave;')
    .split('??').join('&Uacute;')
    .split('??').join('&Ucirc;')
    .split('??').join('&Uuml;')
    .split('??').join('&Yacute;')
    .split('??').join('&THORN;')
    .split('??').join('&szlig;')
    .split('??').join('&agrave;')
    .split('??').join('&aacute;')
    .split('??').join('&acirc;')
    .split('??').join('&atilde;')
    .split('??').join('&auml;')
    .split('??').join('&aring;')
    .split('??').join('&aelig;')
    .split('??').join('&ccedil;')
    .split('??').join('&egrave;')
    .split('??').join('&eacute;')
    .split('??').join('&ecirc;')
    .split('??').join('&euml;')
    .split('??').join('&igrave;')
    .split('??').join('&iacute;')
    .split('??').join('&icirc;')
    .split('??').join('&iuml;')
    .split('??').join('&eth;')
    .split('??').join('&ograve;')
    .split('??').join('&oacute;')
    .split('??').join('&ocirc;')
    .split('??').join('&otilde;')
    .split('??').join('&ouml;')
    .split('??').join('&oslash;')
    .split('??').join('&ugrave;')
    .split('??').join('&uacute;')
    .split('??').join('&ucirc;')
    .split('??').join('&uuml;')
    .split('??').join('&yacute;')
    .split('??').join('&thorn;')
    .split('??').join('&yuml;')
    .split('??').join('')
    .split('%').join('')

  // Remove spaces
  url = url.replace(/%20/g, "")
  url = url.replace(/\s/g, "")

  // Tildes y ??
  url = url.replace(/??/gi, "a");
  url = url.replace(/??/gi, "e");
  url = url.replace(/??/gi, "i");
  url = url.replace(/??/gi, "o");
  url = url.replace(/??/gi, "u");
  url = url.replace(/??/gi, "n");

  return url.toLowerCase()
}

const isExpressDelivery = (code) => {
  let response = false
  let expressStores = [
    {
      name: 'Culiac??n',
      code: '0200625'
    },
    {
      name: 'Cabo San Lucas',
      code: '0300803'
    },
    {
      name: 'San Jos?? del Cabo',
      code: '0400803'
    },
  ]
  expressStores.forEach(store => {
    if (store.code === code) {
      response = true
    }
  })
  return response
}


if (process.env.CONFIG_ENV.APP_MODE === 'staging') {
  constants.IP = "http://35.236.1.135.107.20:3001"
  constants.HOST = "https://backoffice-api.calzzapato.net"
  constants.HOST_CDN = "https://backoffice-api.calzzapato.net/cdn"
  constants.HOST_API = "https://backoffice-api.calzzapato.net/api"
  constants.HOST_API_ECOMMERCE = "https:/api.calzzapato.net"
  constants.HOST_TRACKING = "https://tracking-api.calzzapato.net"
} else if (process.env.CONFIG_ENV.APP_MODE === 'production') {
  constants.IP = "http://50.18.18.3:3001"
  constants.HOST = "http://50.18.18.3:3001"
  constants.HOST_CDN = "https://boapi.calzzapato.com/cdn"
  constants.HOST_API = "https://boapi.calzzapato.com/api"
  constants.HOST_API_ECOMMERCE = "https://api.calzzapato.com"
  constants.HOST_TRACKING = "https://tracking-api.calzzapato.com"
} else {
  constants.IP = "http://127.0.0.1:3003"
  constants.HOST = "http://localhost:3003"
  constants.HOST_CDN = "http://localhost:3003/cdn"
  constants.HOST_API = "http://localhost:3003/api"
  constants.HOST_API_ECOMMERCE = "http://localhost:3001"
  constants.HOST_TRACKING = "http://localhost:3005"
}

export default ({ constants,
  validateEmail,
  validatePassword,
  scrollTop,
  checkLanguage,
  cloneJson,
  isEmpty,
  onlyDate,
  numberWithCommas,
  isUserLoggedIn,
  isExternalLink,
  getCurrentUser,
  getMetadata,
  isNumeric,
  isPhoneNumber,
  encode,
  decode,
  _utf8_encode,
  _utf8_decode,
  jsonToArray,
  orderBy,
  uniqBy,
  checkImage,
  getPlaceholderByGender,
  getToken,
  getDeliveryAddress,
  cybs_dfprofiler,
  addProductToCatalog,
  removeProductFromCatalog,
  isProductIntoCatalog,
  activeCatalog,
  getCurrentCatalog,
  getBase64,
  compressImage,
  dataURLToBlob,
  distance,
  getAge,
  checkSpecialCharacters,
  initOpenPay,
  getDeviceIdOpenpay,
  createToken,
  isVertical,
  asyncForEach,
  generateURL,
  isExpressDelivery,
  sendConversionApiFacebook,
  hashingData,
  timeIntoSeconds
})
