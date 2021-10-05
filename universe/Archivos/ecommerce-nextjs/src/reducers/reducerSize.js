
// Actions
import {
    SELECTED_SIZE,
  } from '../actions/selectedSize'
  
  export default function payment(state={size :""}, action) {
    
    const type = action.type
  
    switch (type) {
  
      case SELECTED_SIZE: {
        return Object.assign({}, state, {size: action.payload})
      }
  
      default:
        return state
    }
  }
  