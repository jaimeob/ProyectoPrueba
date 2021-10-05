import Utils from '../resources/Utils'
import Axios from 'axios'

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
        scope: {
          include: [{
            relation: 'home'
          }]
        }
      }]
    }

    const metadata = await Utils.getMetadata()
    options.headers.metadata = JSON.stringify(metadata)
    const response = await Axios(Utils.constants.CONFIG_ENV.HOST_API + "/instances/findOne?filter=" + JSON.stringify(filters), options)
    return response
  } catch (error) {
    return error.response
  }
}

// Auth user
export const getAuthAPI = async () => {
  try {
    let options = {
      method: 'GET',
      url: Utils.constants.CONFIG_ENV.HOST_API + "/users/auth",
      headers: {
        uuid: Utils.constants.CONFIG_ENV.UUID,
        Authorization: Utils.getToken(),
        metadata: JSON.stringify(Utils.getMetadata())
      }
    }

    const response = await Axios(options)
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    return errorResponse
  }
}

// Login user
export const loginAPI = async (data) => {
  try {
    let optionsPost = {
      headers: {
        //uuid: localStorage.getItem(Utils.constants.localStorage.UUID)
        uuid: Utils.constants.CONFIG_ENV.UUID
      },
      method: 'POST',
      url: Utils.constants.CONFIG_ENV.HOST_API + "/users/login",
      data: {
        "email":"jesus@welcometolevel.com",
        "password":"123456789"
        }
    }

    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await Axios(optionsPost)
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
      method: 'POST',
      url: Utils.constants.CONFIG_ENV.HOST_API + "/users/password",
      data: request
    }

    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await Axios(optionsPost)
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
      url: Utils.constants.CONFIG_ENV.HOST_API + "/users/" + user + "/modules"
    }

    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await Axios(optionsPost)
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
      url: Utils.constants.CONFIG_ENV.HOST_API + "/users/" + user + "/permissions"
    }

    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await Axios(optionsPost)
    return response
  } catch (error) {
    return error.response
  }
}

// Create Hot Shopping Logs
export const createHotShoppingLogs = async (request) => {
  try {
    let optionsPost = {
      headers: {
        uuid: Utils.constants.CONFIG_ENV.UUID
      },
      method: 'POST',
      url: Utils.constants.CONFIG_ENV.HOST_API + "/order-logs/add",
      data: request
    }
    if (!Utils.isEmpty(Utils.getToken())) {
      optionsPost.headers.Authorization = Utils.getToken()
    }
    const metadata = await Utils.getMetadata()
    optionsPost.headers.metadata = JSON.stringify(metadata)
    const response = await Axios(optionsPost)
    return response
  } catch (error) {
    console.log(error);
    return error.response
  }
}
