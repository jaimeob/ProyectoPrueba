import {RECOVERY_PASS,RECOVERY_PASS_ERROR} from './types'

const INITIAL_STATE = {
  sent: '',
  status: null
}
 
export const recoveryPassword =  (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case RECOVERY_PASS: return {
      ...state,
      sent: action.payload
    }
    case RECOVERY_PASS_ERROR: return {
      ...state, 
      sent: '',
      status: action.payload

    }
    default : return state
  }
}
export default recoveryPassword