import {NEW_PASSWORD,NEW_PASSWORD_ERROR} from './types'
import Axios from 'axios'
import Utils from '../../resources/Utils'

export const newPassword = (data) => async (dispatch) => {
  let datos={"data":{
    token: data.tokenNewPass,
    password: data.password
  }}
  try{
    const response = await Axios.patch(`${Utils.constants.CONFIG_ENV.HOST}/api/users/new-password`, datos)
    const data = await response.data
    dispatch({
      type: NEW_PASSWORD,
      payload: data
    })
    return response
  } catch (error) {
    dispatch({
      type: NEW_PASSWORD_ERROR,
      payload: error.response.status
    })
    return error.response
  }
}