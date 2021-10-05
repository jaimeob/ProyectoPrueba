export const REQUEST_GET_CONFIGS = "REQUEST_GET_CONFIGS"
export const RESPONSE_GET_CONFIGS = "RESPONSE_GET_CONFIGS"

export const requestGetConfigs = (uuid) => ({
  type: REQUEST_GET_CONFIGS,
  uuid
})

export const responseGetConfigs = (response) => ({
  type: RESPONSE_GET_CONFIGS,
  response
})

export const RESET_USER_DATA = "RESET_USER_DATA"

export const resetUserData = () => ({
  type: RESET_USER_DATA
})

export const SET_BUSINESS_UNIT = "SET_BUSINESS_UNIT"

export const setBusinessUnit = (business) => ({
  type: SET_BUSINESS_UNIT,
  business
})
