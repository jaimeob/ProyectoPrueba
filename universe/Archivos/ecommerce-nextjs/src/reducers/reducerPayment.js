
// Actions
import {
  ADD_PAYMENT_FORM,
  DELETE_PAYMENT_FORM
} from '../actions/actionPayment'

export default function payment(state={}, action) {
  
  const type = action.type

  switch (type) {

    case ADD_PAYMENT_FORM: {
      localStorage.setItem('payment', JSON.stringify(action.form))
      return Object.assign({}, state, {form: action.form})
    }

    case DELETE_PAYMENT_FORM: {
      localStorage.removeItem('payment')
      return Object.assign({}, state, {form: undefined})
    }

    default:
      return state
  }
}
