export const REQUEST_LOGIN = "REQUEST_LOGIN"
export const RESPONSE_LOGIN = "RESPONSE_LOGIN"

export const requestLogin = (credentials) => ({
  type: REQUEST_LOGIN,
  credentials
})

export const responseLogin = (response) => ({
  type: RESPONSE_LOGIN,
  response
})

export const REQUEST_NEWPASSWORD = "REQUEST_NEWPASSWORD"
export const RESPONSE_NEWPASSWORD = "RESPONSE_NEWPASSWORD"

export const requestNewPassword = (request) => ({
  type: REQUEST_NEWPASSWORD,
  request
})

export const responseNewPassword = (response) => ({
  type: RESPONSE_NEWPASSWORD,
  response
})
