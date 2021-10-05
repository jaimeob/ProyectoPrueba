'use strict'

export const REQUEST_GET_DATA_AUTOCOMPLETE = "REQUEST_GET_DATA_AUTOCOMPLETE"
export const RESPONSE_GET_DATA_AUTOCOMPLETE = "RESPONSE_GET_DATA_AUTOCOMPLETE"
export const CLEAR_AUTOCOMPLETE = "CLEAR_AUTOCOMPLETE"
export const RELOAD_AUTOCOMPLETE = "RELOAD_AUTOCOMPLETE"

export const requestGetDataAutocomplete = (request) => ({
  type: REQUEST_GET_DATA_AUTOCOMPLETE,
  request
})

export const responseGetDataAutocomplete = (response) => ({
  type: RESPONSE_GET_DATA_AUTOCOMPLETE,
  response
})

export const clearAutocomplete = (autocomplete) => ({
  type: CLEAR_AUTOCOMPLETE,
  autocomplete
})

export const reloadAutocomplete = (autocomplete) => ({
  type: RELOAD_AUTOCOMPLETE,
  autocomplete
})
