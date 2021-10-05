import { RECOVERY_PASS_ERROR, RECOVERY_PASS } from './types'
import Axios from 'axios'
import Utils from '../../resources/Utils'

export const recoverypass = (data) => async (dispatch) => {
  let datos = {
    "data": {
      "email": data
    }
  }
  try {
    const response = await Axios.post(`${Utils.constants.CONFIG_ENV.HOST}/api/users/recovery-password`, datos, { headers: { uuid: Utils.constants.CONFIG_ENV.UUID } })
    const data = await response.data
    dispatch({
      type: RECOVERY_PASS,
      payload: data
    })
    return response
  } catch (error) {
    dispatch({
      type: RECOVERY_PASS_ERROR,
      payload: error.response.status
    })
  }
}