//import {LOGIN_INIT_SESSION, LOGIN_INIT_SESSION_ERROR, LOGOUT_SESSION_LOGIN} from './types'


const INITIAL_STATE = {
  catalogs: []
}

export const loginCat =  (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case 'INCREMENT': return {
      ...state,
      category: 'Hola',
      status: 200
      
    }
    default : return state
  }
}
export default loginCat