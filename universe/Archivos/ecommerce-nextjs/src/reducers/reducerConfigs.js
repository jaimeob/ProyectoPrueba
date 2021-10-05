import Utils from '../resources/Utils'

// Actions
import {
  RESET_USER_DATA,
  RESPONSE_GET_CONFIGS,
  SET_NAVBAR_TYPE,
  SHOW_MESSENGER_FACEBOOK
} from '../actions/actionConfigs'

export default function app(state={}, action) {
  
  const type = action.type

  switch (type) {

    case RESET_USER_DATA:
      return Object.assign({}, state, {user: {}})

    case RESPONSE_GET_CONFIGS: {
      if (action.response.status === Utils.constants.status.SUCCESS){
        return Object.assign({}, state, action.response.data)
      }else {
        break;
      }
    }

    case SET_NAVBAR_TYPE: {
      return Object.assign({}, state, {navbarType: action.navbarType})
    }

    case SHOW_MESSENGER_FACEBOOK: {
      return Object.assign({}, state, {showMessengerFacebook: action.show})
    }

    default:
      return state
  }
}
