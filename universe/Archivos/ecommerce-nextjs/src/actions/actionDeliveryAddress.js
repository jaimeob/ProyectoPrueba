export const GET_DELIVERY_ADDRESS = "GET_DELIVERY_ADDRESS"
export const SET_NEW_DELIVERY_ADDRESS = "SET_NEW_DELIVERY_ADDRESS"
export const DELETE_DELIVERY_ADDRESS = "DELETE_DELIVERY_ADDRESS"

export const getDeliveryAddress = () => ({
  type: GET_DELIVERY_ADDRESS
})

export const setNewDeliveryAddress = (address) => ({
  type: SET_NEW_DELIVERY_ADDRESS,
  address
})

export const deleteDeliveryAddress = () => ({
  type: DELETE_DELIVERY_ADDRESS,
})
