import {NEW_PASSWORD,NEW_PASSWORD_ERROR} from './types'

const INITIAL_STATE = {
  sent: '',
  status: null
}
 
export const recoveryPassword =  (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case NEW_PASSWORD: return {
      ...state,
      sent: action.payload
    }
    case NEW_PASSWORD_ERROR: return {
      ...state, 
      sent: '',
      status: action.payload

    }
    default : return state
  }
}
export default recoveryPassword