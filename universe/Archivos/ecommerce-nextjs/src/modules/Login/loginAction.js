import { LOGIN_INIT_SESSION, LOGIN_INIT_SESSION_ERROR, LOGOUT_SESSION_LOGIN } from './types'
import Axios from 'axios'
import Utils from '../../resources/Utils'


export const initSession = (data) => async (dispatch) => {
  let request = {
    email: data.email,
    username: data.username,
    password: data.password,
    withFacebook: data.withFacebook,
    facebookId: data.facebookId,
    accessToken: data.accessToken
  }
  let uuid = data.metadata
  
  try {
    const response = await Axios.post(`${Utils.constants.CONFIG_ENV.HOST}/api/users/signin`, request, { headers: { uuid } })
    const data = await response.data
    dispatch({
      type: LOGIN_INIT_SESSION,
      payload: data
    })
    return response
  } catch (error) {
    dispatch({
      type: LOGIN_INIT_SESSION_ERROR,
      payload: error.response
    })
    return error.response
  }
}
export const logout = () => (dispatch) => {
  dispatch({
    type: LOGOUT_SESSION_LOGIN
  })
}