import Utils from '../resources/Utils'

// Actions
import {
  START_CREATE_CATALOG,
  END_CREATE_CATALOG,
  GET_CURRENT_CATALOG_STATUS,
  GET_CURRENT_CATALOG,
  ADD_TO_CATALOG,
  REMOVE_FROM_CATALOG
} from '../actions/actionCatalog'

export default function catalog(state = {}, action) {

  const type = action.type

  switch (type) {

    case START_CREATE_CATALOG: {
      state.products = []
      //return Object.assign({}, state, { init: true, products: [] })
      return state
    }

    case END_CREATE_CATALOG: {
      localStorage.setItem(Utils.constants.localStorage.CATALOG_INIT, 0)
      localStorage.setItem(Utils.constants.localStorage.CATALOG, JSON.stringify([]))
      return Object.assign({}, state, { init: false, products: [] })
    }

    case GET_CURRENT_CATALOG_STATUS: {
      if (state.products) {
        return state.products.length
      } else {
        return 0
      }
    }

    case ADD_TO_CATALOG: {
      if (state.products) {
        let products = [...state.products]
        products.push(action.product)
        state.products = products
      }
      return state
    }

    case GET_CURRENT_CATALOG: {
      let products = JSON.parse(localStorage.getItem(Utils.constants.localStorage.CATALOG))
      if (products === undefined) {
        products = []
      }
      return Object.assign({}, state, { products: products })
    }

    case REMOVE_FROM_CATALOG: {
      let products = state.products
      if (products !== undefined) {
        if (products.length > 0) {
          products.forEach(function(product, idx) {
            if (product.code === action.product.code) {
              products.splice(idx, 1)
            }
          })
        }
      }

      return state
    }

    case 'CLEAN_CURRENT_CATALOG': {
      return state.products = []
    }

    default:
      return state
  }
}
