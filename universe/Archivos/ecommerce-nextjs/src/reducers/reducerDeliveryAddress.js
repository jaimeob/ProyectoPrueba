// Actions
import {
  SET_NEW_DELIVERY_ADDRESS,
  GET_DELIVERY_ADDRESS,
  DELETE_DELIVERY_ADDRESS
} from '../actions/actionDeliveryAddress'

import Utils from '../resources/Utils'

export default function delivery(state={}, action) {
  
  const type = action.type

  switch (type) {

    case GET_DELIVERY_ADDRESS: {
      let response = localStorage.getItem(Utils.constants.localStorage.DELIVERY_ADDRESS)
      if (response !== undefined && response !== null) {
        response = { data: JSON.parse(response) }
      }
      return Object.assign({}, state, response)
    }

    case SET_NEW_DELIVERY_ADDRESS: {
      localStorage.setItem(Utils.constants.localStorage.DELIVERY_ADDRESS, JSON.stringify(action.address))

      return Object.assign({}, state, { data: action.address })
    }

    case DELETE_DELIVERY_ADDRESS: {
      localStorage.removeItem(Utils.constants.localStorage.DELIVERY_ADDRESS)
      return Object.assign({}, state, { data: undefined })
    }

    default:
      return state
  }
}
