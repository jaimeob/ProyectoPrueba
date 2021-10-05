import Utils from '../resources/Utils'

// Actions
import {
  OPEN_SHOPPING_CART,
  ADD_PRODUCT_TO_SHOPPING_CART,
  UPDATE_ALL_PRODUCT_FRONT_SHOPPING_CART,
  REMOVE_PRODUCT_FROM_SHOPPING_CART,
  DROP_SHOPPING_CART,
  UPDATE_SHOPPING_CART
} from '../actions/actionShoppingCart'

export default function shoppingCart(state = { show: false, products: [], count: 0 }, action) {

  const type = action.type

  switch (type) {
    case OPEN_SHOPPING_CART: {
      return Object.assign({}, state, { show: action.show })
    }

    case DROP_SHOPPING_CART: {
      return Object.assign({}, state, { show: false, products: [], count: 0 })
    }

    case ADD_PRODUCT_TO_SHOPPING_CART: {
      let product = action.product
      let newProduct = true
      let products = state.products
      
      if (products !== undefined) {
        if (products.length > 0) {
          products.forEach(function (p, idx) {
            if (p.code === product.code && p.selectedSize === product.selectedSize) {
              newProduct = false
              if (products[idx].selection.quantity < (product.stock.length - 1) && products[idx].selection.quantity < 10) {
                products[idx].selection.quantity = products[idx].selection.quantity + 1
              }
              if (product.genderCode === 5) {
                products[idx].selection.quantity = 1
              }
            }
          })
        }
      }
      else {
        products = []
      }

      if (newProduct) {
        product.selection = {
          quantity: 1
        }
        products.unshift(Utils.cloneJson(product))
      }

      let total = 0
      if (products !== undefined && products.length > 0) {
        products.forEach(product => {
          total += product.selection.quantity
        })
      }

      return Object.assign({}, state, { products: products, count: total })
    }

    case REMOVE_PRODUCT_FROM_SHOPPING_CART: {
      let products = state.products
      if (products !== undefined) {
        if (products.length > 0) {
          products.forEach(function (product, idx) {
            if (product.code === action.product.code && product.selection.size === action.product.selection.size) {
              products.splice(idx, 1)
            }
          })
        }
      }

      let total = 0
      if (products !== undefined && products.length > 0) {
        products.forEach(product => {
          total += product.selection.quantity
        })
      }

      return Object.assign({}, state, { products: products, count: total })
    }

    case UPDATE_ALL_PRODUCT_FRONT_SHOPPING_CART: {
      let total = 0
      if (action.response !== undefined && action.response.length > 0) {
        action.response.forEach(product => {
          total += product.selection.quantity
        })
      }

      return Object.assign({}, state, { products: action.response, count: total })
    }

    case UPDATE_SHOPPING_CART: {
      let total = 0
      let paymentMethod = null
      if (action.response !== undefined && action.response.products !== undefined && action.response.products.length > 0) {
        action.response.products.forEach(product => {
          total += product.selection.quantity
        })
        if( action.response.paymentMethod !== undefined && action.response.paymentMethod !== null && action.response.paymentMethod.id !== undefined && action.response.paymentMethod.id !== null ) {
          paymentMethod = action.response.paymentMethod
        }
      } 

      return Object.assign({}, state, { products: action.response.products, count: total, priceInformation: action.response.priceInformation, paymentMethod: paymentMethod })
    }

    default:
      return state
  }
}
