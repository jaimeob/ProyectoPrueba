import Utils from '../resources/Utils'

// Actions
import {
  RESET_USER_DATA,
  RESPONSE_GET_CONFIGS,
  SET_BUSINESS_UNIT,
} from '../actions/actionConfigs'

export default function app(state={}, action) {
  
  const type = action.type

  switch (type) {

    case RESET_USER_DATA:
      return Object.assign({}, state, {user: {}})

    case RESPONSE_GET_CONFIGS: {
      if (action.response.status === Utils.constants.status.SUCCESS)
        return Object.assign({}, state, action.response.data)
    }

    case SET_BUSINESS_UNIT: {
      localStorage.setItem(Utils.constants.localStorage.BUSINESS_UNIT, action.business)
      return Object.assign({}, state, { businessUnit: action.business })
    }

    default:
      return state
  }
}
