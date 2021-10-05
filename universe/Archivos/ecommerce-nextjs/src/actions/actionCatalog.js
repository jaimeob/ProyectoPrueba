export const START_CREATE_CATALOG = "START_CREATE_CATALOG"
export const END_CREATE_CATALOG = "END_CREATE_CATALOG"
export const GET_CURRENT_CATALOG_STATUS = "GET_CURRENT_CATALOG_STATUS"
export const GET_CURRENT_CATALOG = "GET_CURRENT_CATALOG"
export const ADD_TO_CATALOG = "ADD_TO_CATALOG"
export const REMOVE_FROM_CATALOG = "REMOVE_FROM_CATALOG"

export const startCreateCatalog = () => ({
  type: START_CREATE_CATALOG
})

export const endCreateCatalog = () => ({
  type: END_CREATE_CATALOG
})

export const getCurrentCatalogStatus = () => ({
  type: GET_CURRENT_CATALOG_STATUS
})

export const getCurrentCatalog = () => ({
  type: GET_CURRENT_CATALOG
})

export const addToCatalog = (product) => ({
  type: ADD_TO_CATALOG,
  product
})

export const removeFromCatalog = (product) => ({
  type: REMOVE_FROM_CATALOG,
  product
})
