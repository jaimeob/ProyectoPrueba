export const LOAD_CONFIG_APP = 'LOAD_CONFIG_APP'

export const loadConfig = (data, tree) => (dispatch) => {
  dispatch({
    type: LOAD_CONFIG_APP,
    payload: { data, tree }
  })
}
