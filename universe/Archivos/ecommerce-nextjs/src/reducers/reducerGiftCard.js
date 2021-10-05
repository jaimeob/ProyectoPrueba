import Utils from '../resources/Utils'

// Actions
import {
  SET_GIFT_CARD,
  DELETE_GIFT_CARD
} from '../actions/actionGiftCard'

export default function giftCard(state={}, action) {
  
  const type = action.type

  switch (type) {

    case SET_GIFT_CARD: {
      localStorage.setItem(Utils.constants.localStorage.GIFT_CARD, JSON.stringify({
        option: action.data.selectedOption,
        from: action.data.from,
        message: action.data.message
      }))
      return Object.assign({}, state, {data: action.data})
    }

    case DELETE_GIFT_CARD: {
      localStorage.removeItem(Utils.constants.localStorage.GIFT_CARD)
      return Object.assign({}, state, {data: {}})
    }

    default:
      return state
  }
}
