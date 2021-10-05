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

export const SET_NAVBAR_TYPE = "SET_NAVBAR_TYPE"
export const setNavbarType = (navbarType) => ({
  type: SET_NAVBAR_TYPE,
  navbarType
})

export const SHOW_MESSENGER_FACEBOOK = "SHOW_MESSENGER_FACEBOOK"

export const showMessengerFacebook = (show) => ({
  type: SHOW_MESSENGER_FACEBOOK,
  show
})
