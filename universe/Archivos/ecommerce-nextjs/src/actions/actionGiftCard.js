export const SET_GIFT_CARD = "SET_GIFT_CARD"
export const DELETE_GIFT_CARD = "DELETE_GIFT_CARD"

export const setGiftCard = (data) => ({
  type: SET_GIFT_CARD,
  data
})

export const deleteGiftCard = (data) => ({
  type: DELETE_GIFT_CARD
})
