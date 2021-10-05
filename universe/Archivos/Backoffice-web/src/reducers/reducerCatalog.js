import Utils from '../resources/Utils'

// Actions
import {
  START_CREATE_CATALOG,
  END_CREATE_CATALOG,
  GET_CURRENT_CATALOG_STATUS,
  GET_CURRENT_CATALOG,
  ADD_TO_CATALOG,
  REMOVE_FROM_CATALOG,
  CLEAN_CURRENT_CATALOG,
} from '../actions/actionCatalog'

export default function catalog(state = {}, action) {

  const type = action.type

  switch (type) {

    case START_CREATE_CATALOG: {
      localStorage.setItem(Utils.constants.localStorage.CATALOG_INIT, 1)
      localStorage.setItem(Utils.constants.localStorage.CATALOG, JSON.stringify([]))
      return Object.assign({}, state, { init: true, products: [] })
    }

    case END_CREATE_CATALOG: {
      localStorage.setItem(Utils.constants.localStorage.CATALOG_INIT, 0)
      localStorage.setItem(Utils.constants.localStorage.CATALOG, JSON.stringify([]))
      return Object.assign({}, state, { init: false, products: [] })
    }

    case GET_CURRENT_CATALOG_STATUS: {
      if (Number(localStorage.getItem(Utils.constants.localStorage.CATALOG_INIT)) === 1) {
        return Object.assign({}, state, { init: true })
      }
      else {
        return Object.assign({}, state, { init: false })
      }
    }

    case ADD_TO_CATALOG: {
      let product = action.product
      let newProduct = true
      let products = state.products

      if (products !== undefined) {
        if (products.length > 0) {
          products.forEach(function (p, idx) {
            if (p.producto_id === product.producto_id) {
              newProduct = false
            }
          })
        }
      }
      else {
        products = []
      }

      if (newProduct) {
        products.push(Utils.cloneJson(product))
      }

      localStorage.setItem(Utils.constants.localStorage.CATALOG, JSON.stringify(products))
      return Object.assign({}, state, { products: products })
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
            if (product.producto_id === action.product.producto_id) {
              products.splice(idx, 1)
            }
          })
        }
      }

      localStorage.setItem(Utils.constants.localStorage.CATALOG, JSON.stringify(products))
      return Object.assign({}, state, {products: products})
    }

    case CLEAN_CURRENT_CATALOG: {
      localStorage.setItem(Utils.constants.localStorage.CATALOG, JSON.stringify([]))
      return Object.assign({}, state, { init: true, products: [] })
    }

    default:
      return state
  }
}
