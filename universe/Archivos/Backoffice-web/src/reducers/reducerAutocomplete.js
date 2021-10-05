import Utils from '../resources/Utils'

// Actions
import {
  CLEAR_AUTOCOMPLETE,
  RELOAD_AUTOCOMPLETE
} from '../actions/actionAutocomplete'

export default function autocompletes(state={}, action) {
  
  const type = action.type

  switch (type) {

    case CLEAR_AUTOCOMPLETE: {
      let autocompletes = []

      if (state.autocompletes !== undefined) {
        autocompletes = state.autocompletes
      }

      try {
        autocompletes[action.autocomplete] = { updatedAt: Date.now(), action: 'clear' }
      } catch (err) {
        autocompletes.push({[action.autocomplete]: { updatedAt: Date.now(), action: 'clear' }})
      }

      return Object.assign({}, state, autocompletes)
    }

    case RELOAD_AUTOCOMPLETE: {
      let autocompletes = []
  
      if (state.autocompletes !== undefined) {
        autocompletes = state.autocompletes
      }
  
      try {
        autocompletes[action.autocomplete] = { updatedAt: Date.now(), action: 'reload' }
      } catch (err) {
        autocompletes.push({[action.autocomplete]: { updatedAt: Date.now(), action: 'reload' }})
      }
  
      return Object.assign({}, state, autocompletes)
    }
  
    default:
      return state
  }
}
