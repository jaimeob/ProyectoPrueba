import {SIGNUP_CREATE_SESSION,SIGNUP_CREATE_SESSION_ERROR} from './types'

const INITIAL_STATE = {
  facebookId: '',
  profilePhotoId: null,
  shoeSizeId: null,
  genderId: null,
  favoriteAddressId: null,
  birthday: null,
  name: '',
  firstLastName: '',
  secondLastName: '',
  username: '',
  email: '',
  phone: null,
  cellphone: null,
  reference: null,
  lastOrderId: null,
  token:'',
  errorSession: '',
  errno: ''
}
 
export const signUp =  (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case SIGNUP_CREATE_SESSION: return {
      ...state, 
      facebookId: action.payload.facebookId,
      profilePhotoId: action.payload.profilePhotoId,
      shoeSizeId: action.payload.shoeSizeId,
      genderId: action.payload.genderId,
      favoriteAddressId: action.payload.favoriteAddressId,
      birthday: action.payload.birthday,
      name: action.payload.name,
      firstLastName: action.payload.firstLastName,
      secondLastName: action.payload.secondLastName,
      username: action.payload.username,
      email: action.payload.email,
      phone: action.payload.phone,
      cellphone: action.payload.cellphone,
      reference: action.payload.reference,
      lastOrderId: action.payload.lastOrderId,
      token: action.payload.token,
      errorSession: '',
      errno: ''
    }
    case SIGNUP_CREATE_SESSION_ERROR: return {
      ...state,
      errorSession: `error al conectar a la api`,
      errno: '',
      facebookId: '',
      profilePhotoId: null,
      shoeSizeId: null,
      genderId: null,
      favoriteAddressId: null,
      birthday: null,
      name: '',
      firstLastName: '',
      secondLastName: '',
      username: '',
      email: '',
      phone: null,
      cellphone: null,
      reference: null,
      lastOrderId: null,
      token:'',
    }
    default : return state
  }
}
export default signUp