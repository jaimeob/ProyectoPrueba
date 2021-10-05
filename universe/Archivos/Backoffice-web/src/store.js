import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import reducers from './reducers/reducers'
import mySaga from './api/sagas'

const sagaMiddleware = createSagaMiddleware()

// Production
// const composeEnhancers = compose

const composeEnhancers = 
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose

const enhancer = composeEnhancers(
  applyMiddleware(sagaMiddleware),
)

const store = createStore(reducers, enhancer)

export default store

sagaMiddleware.run(mySaga)
