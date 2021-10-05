// Actions
import {
  LOAD_CONFIG_APP
} from '../actions/actionApp'

const INITIAL_STATE = {
  data: null,
  tree: null
}

export const app = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOAD_CONFIG_APP: return { ...state, data: action.payload.data, tree: action.payload.tree }
    default: return state
  }
}

export default app
