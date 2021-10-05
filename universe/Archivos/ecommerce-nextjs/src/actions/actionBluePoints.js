export const SET_NEW_CODE = "SET_NEW_CODE"

export const setNewCode = (code) => (dispatch) => {
  dispatch({
    type: SET_NEW_CODE,
    code
  })
}
