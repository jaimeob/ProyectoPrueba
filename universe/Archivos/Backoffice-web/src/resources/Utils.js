'use strict'

import lodash from 'lodash'
import { getAuthAPI, getModulesAPI, getPermissionsAPI } from '../api/api'
const ENV = process.env.REACT_APP_MODE

function serialize(obj) {
  return Object.keys(obj).map(k => ({ key: k, value: obj[k], name: obj[obj[k]] })).filter(k => Number.isInteger(k.value))
}

let ConstantsGiveaway = Object.freeze({
	Status: {
		INACTIVE: 0,
		ACTIVE: 1,
		CLOSED: 2,
		ENDED: 3,
		0: "Inactivo",
		1: "Activo",
		2: "Cerrado",
		3: "Finalizado",
	}
});

let constants = {
  HOST_CDN_AWS: "https://s3-us-west-1.amazonaws.com/calzzapato",
  version: '3.0.210629',
  MAX_UPLOAD_SIZE: 40000000,
  VALID_FORMATS: ".png,.jpeg,.jpg,.pdf",
  paths: {
    home: '/',
    newPassword: '/bienvenido',
    recoveryPassword: '/recuperar-contrasena',
    dashboard: '/inicio',
    orders: '/pedidos',
    cms: '/cms',
    products: '/productos',
    carts: '/carritos',
    users: '/usuarios',
    newBlock: '/cms/nuevo',
    createBlock: '/cms/nuevo/:id',
    editBlock: '/cms/:id/editar',
    pages: '/paginas',
    createPage: '/paginas/nueva',
    landings: '/landings',
    createLanding: '/landings/nueva',
    editUrlLanding: '/landings/:id/editar',
    editLanding: '/landings/:id/bloques',
    newLandingBlock: '/landings/:id/bloques/nuevo',
    editLandingBlock: '/landings/:id/editar/:blockId',
    createLandingBlock: '/landings/:id/bloques/nuevo/:blockId',
    calzzamovil: '/calzzamovil',
    giveaway: '/giveaway',
    mailing: '/mailing',
    foliador: '/foliador',
    persons: '/personas',
    giveaway: '/giveaway',
    detailProducts: '/detalle-producto'
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
    TRACKING: 'tracking',
    IP: 'ip',
    BUSINESS_UNIT: 'businessUnit'
  },
  status: {
    SUCCESS: 200,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    ERROR: 500,
    INACTIVE: 0,
		ACTIVE: 1,
		CLOSED: 2,
		ENDED: 3,
		0: "Inactivo",
		1: "Activo",
		2: "Cerrado",
		3: "Finalizado",
  },
  selectedModuleId: 0,
  blocks: {
    TEXT_BLOCK: 1,
    GRID_BLOCK: 2,
    BANNER_GRID_BLOCK: 3,
    BANNER_BLOCK: 4,
    VIDEO_BLOCK: 5,
    BENEFITS_BLOCK: 6,
    NEWSLETTER_BLOCK: 7,
    CAROUSEL_BLOCK: 15,
    COUNTDOWN_BLOCK: 17,
    CONTAINER_BLOCK: 18,
    COUNTDOWN_BLOCK: 17,
    FILTER_BLOCK: 22
  }
}



if (ENV == 'staging') {
  constants.IP = "http://35.236.1.135.107.20:3001"
  constants.HOST = "https://backoffice-api.calzzapato.net"
  constants.HOST_CDN = "https://backoffice-api.calzzapato.net/cdn"
  constants.HOST_API = "https://backoffice-api.calzzapato.net/api"
  constants.HOST_API_ECOMMERCE = "https:/api.calzzapato.net"
  constants.HOST_TRACKING = "https://tracking-api.calzzapato.net"
} else if (ENV == 'production') {
  constants.IP = "http://50.18.18.3:3001"
  constants.HOST = "https://boapi.calzzapato.com"
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

const setSelectedModuleId = (moduleId) => {
  localStorage.setItem('selectedModuleId', moduleId)
}

const getSelectedModuleId = () => {
  return Number(localStorage.getItem('selectedModuleId'))
}

const getModules = async () => {
  let actions = {}
  let modules = {}

  let currentUser = await getCurrentUser()
  let responsePermissions = await getPermissionsAPI(currentUser.email)
  responsePermissions.data.forEach(function (module, idx) {
    modules[module.component] = {}
    responsePermissions.data.forEach(function (submodule, jdx) {
      if (module.id === submodule.id) {
        actions[submodule.actionName] = { icon: submodule.actionIcon, name: submodule.actionName, pluralName: submodule.actionPluralName, permission: true, pipeline: submodule.pipeline }
      }
    })
    modules[module.component].permissions = actions
    actions = {}
  })
  localStorage.setItem(constants.localStorage.MODULES, JSON.stringify(modules))

  let responseModules = await getModulesAPI(currentUser.email)
  let menu = null

  if (responseModules !== undefined) {
    menu = responseModules.data
    localStorage.setItem(constants.localStorage.MENU, JSON.stringify(menu))
  }

  return { modules: modules, menu: menu }
}

const onlyDate = (val) => {
  try {
    return val.split("T")[0].trim()
  }
  catch (error) {
    return '-'
  }
}


const isNumeric = (val) => {
  return lodash.isNumber(val)
}

const isDouble = (val) => {
  var numeric = true
  var chars = "0123456789.+"
  var len = val.length
  var char = ""
  for (let i = 0; i < len; i++) { char = val.charAt(i); if (chars.indexOf(char) === -1) { numeric = false; } }
  return numeric
}

const isEmpty = (value) => {
  try {
    return lodash.isEmpty(value)
  } catch (e) {
    return true
  }
}

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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

const isUserLoggedIn = () => {
  let data = JSON.parse(localStorage.getItem(constants.localStorage.USER))
  if (isEmpty(data)) {
    return false
  }
  return true
}

const getCurrentUser = async () => {
  if (!isUserLoggedIn())
    return null

  let auth = await getAuthAPI()
  if (isEmpty(auth)) {
    return Object.assign({})
  }
  else {
    if (isEmpty(auth.data)) {
      return Object.assign({})
    }
  }
  return auth.data
}

const getMessages = () => {
  return JSON.parse(localStorage.getItem('lang'))
}

const getMetadata = () => {
  let user = null

  if (isUserLoggedIn()) {
    user = JSON.parse(localStorage.getItem(constants.localStorage.USER))
  }
  let ip = localStorage.getItem(constants.localStorage.IP)

  let metadata = {
    ip,
    user: user,
    lat: null,
    long: null,
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
    vendorSub: window.navigator.vendorSub,
    screen: {
      height: window.screen.height,
      width: window.screen.width,
      availHeight: window.screen.availHeight,
      availWidth: window.screen.availWidth,
      availTop: window.screen.availTop,
      availLeft: window.screen.availLeft,
      pixelDepth: window.screen.pixelDepth
    }
  }

  navigator.geolocation.getCurrentPosition(pos => {
    metadata.lat = pos.coords.latitude
    metadata.long = pos.coords.longitude
  })
  try {
    return metadata
  }
  catch (err) {
    return metadata
  }
}

const track = async ({ component = null, actionType = null, actionData = {} }) => {
  let list = getTracking();

  let item = {
    component,
    actionType,
    createdAt: new Date().toISOString()
  };

  for (let prop in actionData) item[prop] = actionData[prop];

  list.push(item);
  localStorage.setItem(constants.localStorage.TRACKING, JSON.stringify(list));
}

const getTracking = () => {
  let tracking = [];
  try {
    tracking = JSON.parse(localStorage.getItem(constants.localStorage.TRACKING))
  } catch (e) {
    tracking = []
  }
  if (!tracking) tracking = [];
  return tracking;
}

const generateURL = (name, productId = '') => {
  let url = name.split(" ").join('-').split('/').join('-').split('.').join('-').split('_').join('-').split(';').join('-').split('(').join('-').split(')').join('-').split('"').join('-').split('\'').join('-').split('\`').join('').split('`').join('').split('\´').join('').split('´').join('').split('+').join('').split('\\').join('').split('\\').join('').split('#').join('-').split("'").join('-').toLowerCase()
  url = url.split('------').join('-').split('-----').join('-').split('----').join('-').split('---').join('-').split('--').join('-')
  url = url.split('Š').join('S')
    .split('š').join('s')
    .split('Ž').join('Z')
    .split('ž').join('z')
    .split('À').join('A')
    .split('Á').join('A')
    .split('Â').join('A')
    .split('Ã').join('A')
    .split('Ä').join('A')
    .split('Å').join('A')
    .split('Æ').join('A')
    .split('Ç').join('C')
    .split('È').join('E')
    .split('É').join('E')
    .split('Ê').join('E')
    .split('Ë').join('E')
    .split('Ì').join('I')
    .split('Í').join('I')
    .split('Î').join('I')
    .split('Ï').join('I')
    .split('Ò').join('O')
    .split('Ó').join('O')
    .split('Ô').join('O')
    .split('Õ').join('O')
    .split('Ö').join('O')
    .split('Ø').join('O')
    .split('Ù').join('U')
    .split('Ú').join('U')
    .split('Û').join('U')
    .split('Ü').join('U')
    .split('Ý').join('Y')
    .split('Þ').join('B')
    .split('ß').join('Ss')
    .split('à').join('a')
    .split('á').join('a')
    .split('â').join('a')
    .split('ã').join('a')
    .split('ä').join('a')
    .split('å').join('a')
    .split('æ').join('a')
    .split('ç').join('c')
    .split('è').join('e')
    .split('é').join('e')
    .split('ê').join('e')
    .split('ë').join('e')
    .split('ì').join('i')
    .split('í').join('i')
    .split('î').join('i')
    .split('ï').join('i')
    .split('ð').join('o')
    .split('ò').join('o')
    .split('ó').join('o')
    .split('ô').join('o')
    .split('õ').join('o')
    .split('ö').join('o')
    .split('ø').join('o')
    .split('ù').join('u')
    .split('ú').join('u')
    .split('û').join('u')
    .split('ý').join('y')
    .split('þ').join('b')
    .split('ÿ').join('y')
    .split('&').join('&amp;')
    .split('À').join('&Agrave;')
    .split('Á').join('&Aacute;')
    .split('Â').join('&Acirc;')
    .split('Ã').join('&Atilde;')
    .split('Ä').join('&Auml;')
    .split('Å').join('&Aring;')
    .split('Æ').join('&AElig;')
    .split('Ç').join('&Ccedil;')
    .split('È').join('&Egrave;')
    .split('É').join('&Eacute;')
    .split('Ê').join('&Ecirc;')
    .split('Ë').join('&Euml;')
    .split('Ì').join('&Igrave;')
    .split('Í').join('&Iacute;')
    .split('Î').join('&Icirc;')
    .split('Ï').join('&Iuml;')
    .split('Ð').join('&ETH;')
    .split('Ò').join('&Ograve;')
    .split('Ó').join('&Oacute;')
    .split('Ô').join('&Ocirc;')
    .split('Õ').join('&Otilde;')
    .split('Ö').join('&Ouml;')
    .split('Ø').join('&Oslash;')
    .split('Ù').join('&Ugrave;')
    .split('Ú').join('&Uacute;')
    .split('Û').join('&Ucirc;')
    .split('Ü').join('&Uuml;')
    .split('Ý').join('&Yacute;')
    .split('Þ').join('&THORN;')
    .split('ß').join('&szlig;')
    .split('à').join('&agrave;')
    .split('á').join('&aacute;')
    .split('â').join('&acirc;')
    .split('ã').join('&atilde;')
    .split('ä').join('&auml;')
    .split('å').join('&aring;')
    .split('æ').join('&aelig;')
    .split('ç').join('&ccedil;')
    .split('è').join('&egrave;')
    .split('é').join('&eacute;')
    .split('ê').join('&ecirc;')
    .split('ë').join('&euml;')
    .split('ì').join('&igrave;')
    .split('í').join('&iacute;')
    .split('î').join('&icirc;')
    .split('ï').join('&iuml;')
    .split('ð').join('&eth;')
    .split('ò').join('&ograve;')
    .split('ó').join('&oacute;')
    .split('ô').join('&ocirc;')
    .split('õ').join('&otilde;')
    .split('ö').join('&ouml;')
    .split('ø').join('&oslash;')
    .split('ù').join('&ugrave;')
    .split('ú').join('&uacute;')
    .split('û').join('&ucirc;')
    .split('ü').join('&uuml;')
    .split('ý').join('&yacute;')
    .split('þ').join('&thorn;')
    .split('ÿ').join('&yuml;')
    .split('¨').join('')

  // Remove spaces
  url = url.replace(/%20/g, "")
  url = url.replace(/\s/g, "")

  // Tildes y ñ
  url = url.replace(/á/gi, "a");
  url = url.replace(/é/gi, "e");
  url = url.replace(/í/gi, "i");
  url = url.replace(/ó/gi, "o");
  url = url.replace(/ú/gi, "u");
  url = url.replace(/ñ/gi, "n");

  if (isEmpty(productId)) {
    return url
  }
  return url + '-' + productId
}

const generateURLWithSlash = (name, productId = '') => {
  let url = name.split(" ").join('-').split('.').join('-').split('_').join('-').split(';').join('-').split('(').join('-').split(')').join('-').split('"').join('-').split('\'').join('-').split('\`').join('').split('`').join('').split('\´').join('').split('´').join('').split('+').join('').split('\\').join('').split('\\').join('').split('#').join('-').split("'").join('-').toLowerCase()
  url = url.split('------').join('-').split('-----').join('-').split('----').join('-').split('---').join('-').split('--').join('-')
  url = url.split('Š').join('S')
    .split('š').join('s')
    .split('Ž').join('Z')
    .split('ž').join('z')
    .split('À').join('A')
    .split('Á').join('A')
    .split('Â').join('A')
    .split('Ã').join('A')
    .split('Ä').join('A')
    .split('Å').join('A')
    .split('Æ').join('A')
    .split('Ç').join('C')
    .split('È').join('E')
    .split('É').join('E')
    .split('Ê').join('E')
    .split('Ë').join('E')
    .split('Ì').join('I')
    .split('Í').join('I')
    .split('Î').join('I')
    .split('Ï').join('I')
    .split('Ò').join('O')
    .split('Ó').join('O')
    .split('Ô').join('O')
    .split('Õ').join('O')
    .split('Ö').join('O')
    .split('Ø').join('O')
    .split('Ù').join('U')
    .split('Ú').join('U')
    .split('Û').join('U')
    .split('Ü').join('U')
    .split('Ý').join('Y')
    .split('Þ').join('B')
    .split('ß').join('Ss')
    .split('à').join('a')
    .split('á').join('a')
    .split('â').join('a')
    .split('ã').join('a')
    .split('ä').join('a')
    .split('å').join('a')
    .split('æ').join('a')
    .split('ç').join('c')
    .split('è').join('e')
    .split('é').join('e')
    .split('ê').join('e')
    .split('ë').join('e')
    .split('ì').join('i')
    .split('í').join('i')
    .split('î').join('i')
    .split('ï').join('i')
    .split('ð').join('o')
    .split('ò').join('o')
    .split('ó').join('o')
    .split('ô').join('o')
    .split('õ').join('o')
    .split('ö').join('o')
    .split('ø').join('o')
    .split('ù').join('u')
    .split('ú').join('u')
    .split('û').join('u')
    .split('ý').join('y')
    .split('þ').join('b')
    .split('ÿ').join('y')
    .split('&').join('&amp;')
    .split('À').join('&Agrave;')
    .split('Á').join('&Aacute;')
    .split('Â').join('&Acirc;')
    .split('Ã').join('&Atilde;')
    .split('Ä').join('&Auml;')
    .split('Å').join('&Aring;')
    .split('Æ').join('&AElig;')
    .split('Ç').join('&Ccedil;')
    .split('È').join('&Egrave;')
    .split('É').join('&Eacute;')
    .split('Ê').join('&Ecirc;')
    .split('Ë').join('&Euml;')
    .split('Ì').join('&Igrave;')
    .split('Í').join('&Iacute;')
    .split('Î').join('&Icirc;')
    .split('Ï').join('&Iuml;')
    .split('Ð').join('&ETH;')
    .split('Ò').join('&Ograve;')
    .split('Ó').join('&Oacute;')
    .split('Ô').join('&Ocirc;')
    .split('Õ').join('&Otilde;')
    .split('Ö').join('&Ouml;')
    .split('Ø').join('&Oslash;')
    .split('Ù').join('&Ugrave;')
    .split('Ú').join('&Uacute;')
    .split('Û').join('&Ucirc;')
    .split('Ü').join('&Uuml;')
    .split('Ý').join('&Yacute;')
    .split('Þ').join('&THORN;')
    .split('ß').join('&szlig;')
    .split('à').join('&agrave;')
    .split('á').join('&aacute;')
    .split('â').join('&acirc;')
    .split('ã').join('&atilde;')
    .split('ä').join('&auml;')
    .split('å').join('&aring;')
    .split('æ').join('&aelig;')
    .split('ç').join('&ccedil;')
    .split('è').join('&egrave;')
    .split('é').join('&eacute;')
    .split('ê').join('&ecirc;')
    .split('ë').join('&euml;')
    .split('ì').join('&igrave;')
    .split('í').join('&iacute;')
    .split('î').join('&icirc;')
    .split('ï').join('&iuml;')
    .split('ð').join('&eth;')
    .split('ò').join('&ograve;')
    .split('ó').join('&oacute;')
    .split('ô').join('&ocirc;')
    .split('õ').join('&otilde;')
    .split('ö').join('&ouml;')
    .split('ø').join('&oslash;')
    .split('ù').join('&ugrave;')
    .split('ú').join('&uacute;')
    .split('û').join('&ucirc;')
    .split('ü').join('&uuml;')
    .split('ý').join('&yacute;')
    .split('þ').join('&thorn;')
    .split('ÿ').join('&yuml;')
    .split('¨').join('')

  // Remove spaces
  url = url.replace(/%20/g, "")
  url = url.replace(/\s/g, "")

  // Tildes y ñ
  url = url.replace(/á/gi, "a");
  url = url.replace(/é/gi, "e");
  url = url.replace(/í/gi, "i");
  url = url.replace(/ó/gi, "o");
  url = url.replace(/ú/gi, "u");
  url = url.replace(/ñ/gi, "n");

  if (isEmpty(productId)) {
    return url
  }
  return url + '-' + productId
}

const resetTacking = () => {
  localStorage.setItem(constants.localStorage.TRACKING, "[]");
}

const checkLanguage = () => {
  const userLang = navigator.language || navigator.userLanguage
  const lang = userLang.split('-')[0]
  return lang.toLowerCase()
}

const scrollTop = () => {
  window.scrollTo(0, 0)
}

const getBase64 = function (file) {
  return new Promise(function (resolve, reject) {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function () { resolve(reader.result) }
    reader.onerror = function (err) { reject(err) }
  })
}

const cloneJson = function (json = {}) {
  return JSON.parse(JSON.stringify(json))
}

const jsonToArray = function (json) {
  var result = []
  var keys = Object.keys(json)
  keys.forEach(function (key) {
    result.push(json[key])
  })
  return result
}

const app = function () {
  let app = {
    modules: JSON.parse(localStorage.getItem(constants.localStorage.MODULES)),
    menu: JSON.parse(localStorage.getItem(constants.localStorage.MENU))
  }
  return app
}

const arrayUnique = function (array) {
  return lodash.union(array)
}

const getItemSize = function (itemsPerRow) {
  return Number(((100) / itemsPerRow)).toString() + '%'
}

const getToken = function () {
  let user = JSON.parse(localStorage.getItem(constants.localStorage.USER))
  if (!user)
    return null
  return user.token
}

const orderBy = function (array, property, direction) {
  return lodash.orderBy(array, [property], [direction])
}

const uniqBy = function (array, property) {
  return lodash.uniqBy(array, function (item) {
    return item[property]
  })
}

const logout = function () {
  localStorage.removeItem(constants.localStorage.USER)
  localStorage.removeItem(constants.localStorage.MODULES)
  localStorage.removeItem(constants.localStorage.MENU)
  localStorage.removeItem(constants.localStorage.SHOPPING_CART)
  localStorage.removeItem(constants.localStorage.ORDER)
  localStorage.removeItem(constants.localStorage.CATALOG)
  localStorage.removeItem(constants.localStorage.CATALOG_INIT)
  return true
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

const getDeliveryDate = (date, dias) => {
  return new Date(Date.UTC(date.substring(0, 4), parseInt(date.substring(5, 7)) - 1, parseInt(date.substring(8, 10)) + (dias ? dias : 0), 0, 0, 0)).toLocaleDateString('mx-ES', { year: 'numeric', month: 'long', day: 'numeric' })
}

const isExternalLink = (url) => {
  return (url.substring(0, 4) === 'http' || url.substring(0, 5) === 'https')
}

const getPlaceholderByGender = (gender_id) => {
  return ''
}

const search = (array, filter) => {
  return lodash.filter(array, filter)
}

const getStatusColor = (pipeline) => {
  if (pipeline === 'CREATED') {
    return 'orange'
  } else if (pipeline === 'STOCKED') {
    return 'green'
  } else if (pipeline === 'WITH_CONSUMPTION') {
    return 'blue'
  } else if (pipeline === 'WITHOUT_CONSUMPTION') {
    return 'blue'
  }
}

const loadImage = (source) => {
  return new Promise(function (resolve, reject) {
    let img = new Image()
    img.src = source
    img.onload = function () {
      return resolve(this)
    }
    img.onerror = function () {
      return resolve(undefined)
    }
  })
}

export default ({
  constants: constants,
  ConstantsGiveaway:ConstantsGiveaway,
  messages: getMessages(),
  serialize,
  app,
  isNumeric,
  generateURL,
  generateURLWithSlash,
  isDouble,
  isEmpty,
  numberWithCommas,
  validateEmail,
  isUserLoggedIn,
  getCurrentUser,
  getMetadata,
  checkLanguage,
  scrollTop,
  getBase64,
  cloneJson,
  jsonToArray,
  onlyDate,
  getModules,
  setSelectedModuleId,
  getSelectedModuleId,
  arrayUnique,
  getItemSize,
  getToken,
  orderBy,
  uniqBy,
  logout,
  encode,
  decode,
  getDeliveryDate,
  track,
  getTracking,
  resetTacking,
  validatePassword,
  isExternalLink,
  getPlaceholderByGender,
  search,
  getStatusColor,
  loadImage
})
