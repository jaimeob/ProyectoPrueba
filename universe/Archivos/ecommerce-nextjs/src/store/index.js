'use strict'

import { combineReducers, createStore, applyMiddleware } from 'redux'
import reduxthunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// Modules
import app from '../reducers/reducerApp'
import bluePoints from '../reducers/reducerBluePoints'

import { homeReducers } from '../modules/Home/reducers'
import login from '../modules/Login/loginReducers'
import signUp from '../modules/SignUp/signUpReducers'
import recoveryPassword from '../modules/RecoveryPassword/recoveryReducers'
import delivery from '../reducers/reducerDeliveryAddress'
import shoppingCart from '../reducers/reducerShoppingCart'
import checkout from '../reducers/reducerCheckout'
import catalogs from '../reducers/reducerCatalog'
import sizeSelected from '../reducers/reducerSize'

const perssitConfig = {
  key: 'root',
  storage,
  whitelist: ['app', 'login', 'shoppingCart', 'bluePoints', 'checkout']
}

const rootReducer = combineReducers({
  app,
  homeReducers,
  login,
  signUp,
  recoveryPassword,
  delivery,
  shoppingCart,
  bluePoints,
  catalogs,
  checkout,
  sizeSelected,

})

export const store = createStore(
  persistReducer(perssitConfig, rootReducer),
  {},
  applyMiddleware(reduxthunk)
)

export const persistor = persistStore(store)

export default { store, persistor }
