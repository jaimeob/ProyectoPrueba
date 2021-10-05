export const SELECTED_SIZE = 'SELECTED_SIZE'

export const selectedSize = (size) => (dispatch) => {
  dispatch({
    type: SELECTED_SIZE,
    payload: size
  })
}
