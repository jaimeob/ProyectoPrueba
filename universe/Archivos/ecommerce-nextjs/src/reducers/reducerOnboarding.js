import Utils from '../resources/Utils'

// Actions
import {
  RESPONSE_LOGIN,
  RESPONSE_NEWPASSWORD
} from '../actions/actionOnboarding'


export default function onboarding(state={}, action) {
  
  const type = action.type

  switch (type) {

    case RESPONSE_LOGIN: {
      if (action.response.status === Utils.constants.status.SUCCESS) {
        let data = action.response.data
        localStorage.setItem(Utils.constants.localStorage.USER, JSON.stringify(data))
      }
      return Object.assign({}, state, {user: action.response})
    }

    case RESPONSE_NEWPASSWORD: {
      return Object.assign({}, state, {newPassword: action.response})
    }

    default:
      return state
  }
}
