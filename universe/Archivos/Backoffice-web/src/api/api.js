import Utils from '../resources/Utils'
import axios from 'axios'

// Get system configs
export const getConfigsAPI = async (instanceId) => {
  try {
    let options = {
      headers: {
        uuid: localStorage.getItem(Utils.constants.localStorage.UUID),
      }
    }

    const filters = {
      where: {
        uuid: localStorage.getItem(Utils.constants.localStorage.UUID),
        status: 1
      },
      include: [{
        relation: 'configs',
        scope: {}
      }]
    }

    const metadata = await Utils.getMetadata()
    options.headers.metadata = JSON.stringify(metadata)
    const response = await axios(Utils.constants.HOST + "/api/instances/findOne?filter=" + JSON.stringify(filters), options)
    return response
  } catch (error) {
    return error.response
  }
}

// Auth user
export const getAuthAPI = async (user) => {
  try {
    let token = Utils.getToken()
    let options = {
      headers: {
        uuid: localStorage.getItem(Utils.constants.localStorage.UUID),
        Authorization: token
      },
      method: 'GET',
      url: Utils.constants.HOST + "/api/users/auth"
    }
    const metadata = await Utils.getMetadata()
    options.headers.metadata = JSON.stringify(metadata)
    const response = await axios(options)
    return response
  } catch (error) {
    window.location.replace('/')
    return error.response
  }
}

// Login user
export const loginAPI = async (data) => {
  try {
    let optionsPost = {
      headers: {
        uuid: localStorage.getItem(Utils.constants.localStorage.UUID)
      },
      method: 'POST',
      url: Utils.constants.HOST + "/api/users/login",
      data: data
    }

    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await axios(optionsPost)
    return response
  } catch (error) {
    return error.response
  }
}

// New password onboarding
export const newPasswordAPI = async (request) => {
  try {
    let optionsPost = {
      headers: {
        uuid: localStorage.getItem(Utils.constants.localStorage.UUID)
      },
      method: 'PATCH',
      url: Utils.constants.HOST + "/api/users/password",
      data: request
    }

    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await axios(optionsPost)
    return response
  } catch (error) {
    return error.response
  }
}

// Get menu
export const getModulesAPI = async (user) => {
  try {
    let optionsPost = {
      headers: {
        uuid: localStorage.getItem(Utils.constants.localStorage.UUID)
      },
      method: 'GET',
      url: Utils.constants.HOST + "/api/users/" + user + "/modules"
    }

    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await axios(optionsPost)
    return response
  } catch (error) {
    return error.response
  }
}

// Get permissions
export const getPermissionsAPI = async (user) => {
  try {
    let optionsPost = {
      headers: {
        uuid: localStorage.getItem(Utils.constants.localStorage.UUID)
      },
      method: 'GET',
      url: Utils.constants.HOST + "/api/users/" + user + "/permissions"
    }

    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await axios(optionsPost)
    return response
  } catch (error) {
    return error.response
  }
}

// Add product to shopping cart
export const addProductToShoppingCartAPI = async (data) => {
  try {
    let optionsPost = {
      headers: {
        uuid: localStorage.getItem(Utils.constants.localStorage.UUID),
        Authorization: Utils.getToken()
      },
      method: 'POST',
      url: Utils.constants.HOST + "/api/carts/add",
      data: data
    }

    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await axios(optionsPost)
    return response
  } catch (error) {
    return error.response
  }
}

// Remove product from shopping cart
export const removeProductFromShoppingCartAPI = async (data) => {
  try {
    let optionsPost = {}
    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await axios(optionsPost)
    return response
  } catch (error) {
    return error.response
  }
}

// Update product quantity from shopping cart
export const updateProductQuantityFromShoppingCartAPI = async (data) => {
  try {
    let optionsPost = {}
    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await axios(optionsPost)
    return response
  } catch (error) {
    return error.response
  }
}
