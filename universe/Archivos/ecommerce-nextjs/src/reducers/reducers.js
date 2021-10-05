import { combineReducers } from 'redux'
import app from './reducerConfigs'
import onboarding from './reducerOnboarding'
import autocomplete from './reducerAutocomplete'
import shoppingCart from './reducerShoppingCart'
import bluePoints from './reducerBluePoint'
import payment from './reducerPayment'
import catalog from './reducerCatalog'
import newsletter from './reducerNewsletterModal'
import giftCard from './reducerGiftCard'
import delivery from './reducerDeliveryAddress'

function init(state = {}, action) {
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
  autocomplete,
  shoppingCart,
  bluePoints,
  payment,
  catalog,
  newsletter,
  giftCard,
  delivery
})
