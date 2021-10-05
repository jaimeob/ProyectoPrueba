import { SIGNUP_CREATE_SESSION_ERROR } from './types'
import Axios from 'axios'
import Utils from '../../resources/Utils'

export const signupCreateSession = (data) => async (dispatch) => {
  let datos = { data: { ...data.data } }
  let head = { headers: { uuid: data.uuid } }
  try {
    const response = await Axios.post(`${Utils.constants.CONFIG_ENV.HOST}/api/users/create`, datos, head)
    const data = await response.data
    return response
  } catch (error) {
    dispatch({
      type: SIGNUP_CREATE_SESSION_ERROR,
      payload: error.response
    })
    return error.response
  }
}
export const logout = () => (dispatch) => {
  dispatch({
    type: LOGOUT_SESSION
  })
}
