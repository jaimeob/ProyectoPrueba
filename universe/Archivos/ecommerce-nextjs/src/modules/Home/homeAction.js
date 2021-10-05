import {HOME_MENU_TREE, HOME_MENU_TREE_ERROR} from './types'
import Axios from 'axios'
import Utils from '../../resources/Utils'

export const menuTree = (data) => async (dispatch) => {
  try {
    const response = await Axios.get(`${Utils.constants.CONFIG_ENV.HOST}/api/menu/tree`, {headers:{uuid: data.uuid}})
    const datos = response.data
    dispatch({
      type: HOME_MENU_TREE,
      payload: datos
    })
    return response
  } catch (error) {
    dispatch({
      type: HOME_MENU_TREE_ERROR,
      payload: error.response
    })
    return error.response
  }
}