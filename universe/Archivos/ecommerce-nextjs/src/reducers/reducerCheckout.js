import Utils from '../resources/Utils'

// Actions
import {
  CLEAN_CHECKOUT,
  UPDATE_CHECKOUT,
  UPDATE_ADDRESS,
  UPDATE_CARD,
  UPDATE_PAYMENT_METHOD,
  UPDATE_BLUEPOINT,
  UPDATE_COUPON,
  UPDATE_SHIPPING_METHOD
  
} from '../actions/actionCheckout'

export default function shoppingCart(state = { step: null, address: null, paymentMethod: null, shippingMethodSelected: [], bluePointExchange: null, couponValue: null }, action) {
  
  const type = action.type

  switch (type) {
    case CLEAN_CHECKOUT: {
      return Object.assign({}, state, { step: null, address: null, paymentMethod: null, shippingMethodSelected: [], card: null, bluePointExchange: null, couponValue: null })
    }
    case UPDATE_CHECKOUT: {
      let step = null
      let address = null
      let paymentMethod = null
      let shippingMethod = null
      let card = null

      if (action.response.step !== undefined) {
        step = action.response.step
      }
      if (action.response.address !== undefined) {
        address = action.response.address
      }
      if (action.response.paymentMethod !== undefined) {
        paymentMethod = action.response.paymentMethod
      }
      if (action.response.shippingMethod !== undefined) {
        shippingMethod = action.response.shippingMethod
      }
      if (action.response.card !== undefined) {
        card = action.response.card
      }

      return Object.assign({}, state, { step: step, address: address, paymentMethod: paymentMethod, shippingMethod: shippingMethod, card: card })

    }
    case UPDATE_PAYMENT_METHOD: { 
      let paymentMethod = null
      if (action.response.paymentMethod !== undefined) {
        paymentMethod = action.response.paymentMethod
      }
      return Object.assign({}, state, { paymentMethod: paymentMethod })
    }
    case UPDATE_CARD: { 
      let card = null
      if (action.response.card !== undefined) {
        card = action.response.card
      }
      return Object.assign({}, state, { card: card })
    }
    case UPDATE_ADDRESS: { 
      let address = null
      if (action.response.address !== undefined) {
        address = action.response.address
      }
      return Object.assign({}, state, { address: address })
    }
    case UPDATE_BLUEPOINT: { 
      let bluePoints = null
      if (action.response.bluePoints !== undefined) {
        bluePoints = action.response.bluePoints
      }
      return Object.assign({}, state, { bluePointExchange: bluePoints })
    }
    case UPDATE_COUPON: { 
      let coupon = null
      if (action.response.coupon !== undefined && action.response.coupon !== '') {
        coupon = action.response.coupon
      }
      return Object.assign({}, state, { couponValue: coupon })
    }
    case UPDATE_SHIPPING_METHOD: { 
      let shippingMethod = null
      if (action.response.shippingMethod !== undefined && action.response.shippingMethod !== '') {
        shippingMethod = action.response.shippingMethod
      }
      return Object.assign({}, state, { shippingMethodSelected: shippingMethod })
    }

    default:
      return state
  }
}
