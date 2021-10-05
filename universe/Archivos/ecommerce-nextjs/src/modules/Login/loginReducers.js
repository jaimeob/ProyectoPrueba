import {LOGIN_INIT_SESSION, LOGIN_INIT_SESSION_ERROR, LOGOUT_SESSION_LOGIN} from './types'

const INITIAL_STATE = {
  calzzapatoUserId: null,
  bluePoints: null,
  facebookId: "",
  profilePhotoId: null,
  shoeSizeId: null,
  genderId: null,
  favoriteAddressId: null,
  birthday: null,
  name: "",
  firstLastName: "",
  secondLastName: "",
  username: "",
  email: "",
  phone: "",
  cellphone: "",
  validationCellphone: null,
  reference: "",
  lastOrderId: null,
  token: "",
  errorSession: "",
  status: null
}
 
export const login = (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case LOGIN_INIT_SESSION: return {
      ...state,
      calzzapatoUserId: action.payload.calzzapatoUserId,
      bluePoints: action.payload.bluePoints,
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
      validationCellphone: action.payload.validationCellphone,
      reference: action.payload.reference,
      lastOrderId: action.payload.lastOrderId,
      token: action.payload.token,
      errorSession: action.payload.errorSession,
      status: 200
    }
    case LOGIN_INIT_SESSION_ERROR: return {
      ...state,
      errorSession: `error al conectar a la api ${action.payload}`,
      status: action.payload
    }
    case LOGOUT_SESSION_LOGIN: return {
      calzzapatoUserId: null,
      bluePoints: null,
      facebookId: "",
      profilePhotoId: null,
      shoeSizeId: null,
      genderId: null,
      favoriteAddressId: null,
      birthday: null,
      name: "",
      firstLastName: "",
      secondLastName: "",
      username: "",
      email: "",
      phone: "",
      cellphone: "",
      validationCellphone: null,
      reference: "",
      lastOrderId: null,
      token: "",
      errorSession: "",
      status: null
    }
    default : return state
  }
}
export default login