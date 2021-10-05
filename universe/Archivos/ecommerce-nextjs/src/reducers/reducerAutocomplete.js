// Actions
import {
  RESPONSE_GET_DATA_AUTOCOMPLETE
} from '../actions/actionAutocomplete'

export default function autocomplete(state={}, action) {
  
  const type = action.type

  switch (type) {

    case RESPONSE_GET_DATA_AUTOCOMPLETE: {
      let response = {}
      response[action.response.resource] = action.response.data
      return Object.assign({}, state, response)
    }

    default:
      return state
  }
}
