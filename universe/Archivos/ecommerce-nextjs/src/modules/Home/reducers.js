import {HOME_MENU_TREE} from './types'

const INITIAL_STATE = {
  alias: 'calzzapato',
  data: null
}

export const homeReducers =  (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case HOME_MENU_TREE: return {
      data: action.payload
    }
    default : return state
  }
}
export default homeReducers