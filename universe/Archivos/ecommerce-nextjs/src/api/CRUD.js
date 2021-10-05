'use strict'

import Utils from '../resources/Utils'
import Axios from 'axios'

export const requestAPI = async (request) => {
  try {
    let data = null
    if (request.data !== undefined) {
      data = request.data
    }

    let filters = request.filter || ''
    let endpoint = request.endpoint || ''

    let URL = request.host + "/api/" + request.resource + "" + endpoint

    if (!Utils.isEmpty(filters)) {
      URL += "?filter=" + JSON.stringify(filters)
    }

    let options = {
      method: request.method,
      url: URL,
      data: { data: data }
    }

    options.headers = (request.headers !== undefined) ? request.headers : {}
    options.headers.uuid = Utils.constants.CONFIG_ENV.UUID
    if (!Utils.isEmpty(Utils.getToken())) {
      options.headers.Authorization = Utils.getToken()
    }

    const metadata = Utils.getMetadata()

    options.headers.metadata = JSON.stringify(metadata)

    let response = await Axios(options)
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    return errorResponse
  }
}

export const getDataAPI = async (request) => {
  try {
    let filters = {}
    if (request.filters !== undefined) {
      filters = request.filters
      if (request.relations !== undefined)
        filters.include = request.relations
    }

    let url = request.host + "/api/" + request.resource + "?filter=" + JSON.stringify(filters)
    let response = await Axios(url)
    response.resource = request.resource
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    errorResponse.resource = request.resource
    return errorResponse
  }
}

export const deleteDataAPI = async (request) => {
  try {
    let options = {
      method: 'PATCH',
      url: request.host + "/api/" + request.resource + "/" + request.id,
      data: {
        status: 2
      }
    }
    const response = await Axios(options)
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    errorResponse.resource = request.resource
    return errorResponse
  }
}

export const getDataAPIEncoded = async (request) => {
  try {
    let filters = {}
    if (request.filters !== undefined) {
      filters = request.filters
      if (request.relations !== undefined)
        filters.include = request.relations
    }

    let url = request.host + "/api/" + request.resource + "?filter=" + encodeURIComponent(JSON.stringify(filters))
    let response = await Axios(url)
    response.resource = request.resource
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    errorResponse.resource = request.resource
    return errorResponse
  }
}

export const getItemAPI = async (request) => {
  try {
    let filters = {}
    if (request.filters !== undefined)
      filters = request.filters
    let response = await axios(request.host + "/api/" + request.resource + "/findOne?filter=" + JSON.stringify(filters))
    response.resource = request.resource
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    errorResponse.resource = request.resource
    return errorResponse
  }
}
