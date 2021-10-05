import Utils from '../resources/Utils'
import axios from 'axios'
//const CancelToken = axios.CancelToken
//const source = CancelToken.source()

export const addDataAPI = async (request) => {
  try {
    let options = {
      headers: {
        uuid: localStorage.getItem(Utils.constants.localStorage.UUID),
      },
      method: 'POST',
      url: request.host + "/api/" + request.resource,
      data: request.data
    }

    const metadata = await Utils.getMetadata()
    options.headers.metadata = JSON.stringify(metadata)

    let response = await axios(options)
    response.resource = request.resource
    return response
  } catch (error) {
    return error.response
  }
}

export const editDataAPI = async (request) => {
  try {
    let options = {
      method: 'PATCH',
      url: request.host + "/api/" + request.resource + "/" + request.data.id,
      data: request.data
    }

    /*
    const metadata = await Utils.getMetadata()
    options.headers.metadata = JSON.stringify(metadata)
    */
    const response = await axios(options)
    response.resource = request.resource
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    errorResponse.resource = request.resource
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
    let response = await axios(url)
    response.resource = request.resource
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
    let response = await axios(url)
    response.resource = request.resource
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    errorResponse.resource = request.resource
    return errorResponse
  }
}

export const getPipelineAPI = async (request) => {
  try {
    let response = await axios(request.host + "/api/pipelines/" + request.resource + "/stages")
    response.resource = request.resource
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    errorResponse.resource = request.resource
    return errorResponse
  }
}

export const getCountAPI = async (request) => {
  try {
    let response = await axios(request.host + "/api/" + request.resource + "/count?where=" + JSON.stringify(request.filters.where))
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

export const getItemsAPI = async (request) => {
  try {
    const filters = {
      where: request.where,
      include: request.relations
    }
    let response = await axios(request.host + "/api/" + request.resource + "?filter=" + JSON.stringify(filters))
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
      data: request.data
    }
    const response = await axios(options)
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    errorResponse.resource = request.resource
    return errorResponse
  }
}

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
      data: data
    }

    options.headers = (request.headers !== undefined) ? request.headers : {}
    options.headers.uuid = localStorage.getItem(Utils.constants.localStorage.UUID)
    options.headers.businessUnit = localStorage.getItem(Utils.constants.localStorage.BUSINESS_UNIT)

    if (request.uuid !== undefined) {
      options.headers.uuid = request.uuid
    } else {
      if (Utils.getToken() !== null) {
        options.headers.Authorization = Utils.getToken()
      }
    }

    const metadata = await Utils.getMetadata()
    options.headers.metadata = JSON.stringify(metadata)

    let response = await axios(options)
    response.resource = request.resource
    return response
  } catch (error) {
    let errorResponse = Utils.cloneJson(error.response)
    errorResponse.resource = request.resource
    return errorResponse
  }
}

export const cancelAPI = async () => {
  const cancelToken = axios.CancelToken
  const source = cancelToken.source()
  const { data } = await axios.get("/", {
    cancelToken: source.token,
  })
}

// Autocomplete
export const getDataAutocompleteAPI = async (request) => {
  try {
    let response = await axios(request.host + "/api/" + request.resource + "?filter=" + JSON.stringify(request.filters))
    response.resource = request.resource
    return response
  } catch (error) {
    error.data.resource = request.resource
    return error.response
  }
}
