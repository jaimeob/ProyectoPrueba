import {SIGNUP_CREATE_SESSION, SIGNUP_CREATE_SESSION_ERROR} from './types'
import {LOGIN_INIT_SESSION} from '../Login/types'
import Axios from 'axios'
import Utils from '../../resources/Utils'
export const signupCreateSession = (data) => async (dispatch) => {
  try{
    const response = await Axios.post(`${Utils.constants.CONFIG_ENV.HOST}/api/users/create`, data.data, {headers:{uuid: data.uuid}})
    const data = await response.data
    dispatch({
      type: SIGNUP_CREATE_SESSION,
      payload: data.user
    })
    dispatch({
      type: LOGIN_INIT_SESSION,
      payload: data.user
    })
    return response
  } catch (error) {
    dispatch({
      type: SIGNUP_CREATE_SESSION_ERROR,
      payload: error.response
    })
    return error.response
  }
}
