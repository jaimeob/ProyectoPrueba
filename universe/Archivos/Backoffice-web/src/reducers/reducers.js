import { combineReducers } from 'redux'
import { loadingBarReducer } from 'react-redux-loading-bar'

import initialState from '../resources/state'
import app from './reducerConfigs'
import onboarding from './reducerOnboarding'
import autocompletes from './reducerAutocomplete'
import catalog from './reducerCatalog'

function init(state={}, action) {
  const type = action.type
  switch (type) {
    default:
      return state
  }
}

export default combineReducers({
 init,
 app,
 onboarding,
 autocompletes,
 catalog,
 loadingBar: loadingBarReducer
})
