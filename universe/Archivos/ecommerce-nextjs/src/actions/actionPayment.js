export const ADD_PAYMENT_FORM = "ADD_PAYMENT_FORM"
export const DELETE_PAYMENT_FORM = "DELETE_PAYMENT_FORM"

export const addPaymentForm = (form) => ({
  type: ADD_PAYMENT_FORM,
  form
})

export const deletePaymentForm = () => ({
  type: DELETE_PAYMENT_FORM
})
