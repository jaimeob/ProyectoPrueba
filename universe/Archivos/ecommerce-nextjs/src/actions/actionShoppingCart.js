//
export const OPEN_SHOPPING_CART = "OPEN_SHOPPING_CART"
export const openShoppingCart = (show) => ({
  type: OPEN_SHOPPING_CART,
  show
})

//
export const DROP_SHOPPING_CART = "DROP_SHOPPING_CART"
export const dropShoppingCart = () => ({
  type: DROP_SHOPPING_CART
})

// Only local
export const ADD_PRODUCT_TO_SHOPPING_CART = "ADD_PRODUCT_TO_SHOPPING_CART"
export const addProductToShoppingCart = (product) => ({
  type: ADD_PRODUCT_TO_SHOPPING_CART,
  product
})

export const REMOVE_PRODUCT_FROM_SHOPPING_CART = "REMOVE_PRODUCT_FROM_SHOPPING_CART"
export const removeProductFromShoppingCart = (product) => ({
  type: REMOVE_PRODUCT_FROM_SHOPPING_CART,
  product
})

export const UPDATE_ALL_PRODUCT_FRONT_SHOPPING_CART = "UPDATE_ALL_PRODUCT_FRONT_SHOPPING_CART"
export const updateAllProductFrontShoppingCart = (response) => ({
  type: UPDATE_ALL_PRODUCT_FRONT_SHOPPING_CART,
  response
})

export const UPDATE_SHOPPING_CART = "UPDATE_SHOPPING_CART"
export const updateShoppingCart = (response) => ({
  type: UPDATE_SHOPPING_CART,
  response
})
