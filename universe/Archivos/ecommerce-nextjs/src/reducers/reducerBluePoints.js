// Actions
import {
  SET_NEW_CODE
} from '../actions/actionBluePoints'

const INITIAL_STATE = {}

export const bluePoints = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_NEW_CODE: return { ...state, data: action.code }
    default: return state
  }
}

export default bluePoints
