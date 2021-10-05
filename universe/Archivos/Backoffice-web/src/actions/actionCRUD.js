export const INIT_UPDATE_DATA_CRUD = "UPDATE_DATA_CRUD"
export const END_UPDATE_DATA_CRUD = "END_UPDATE_DATA_CRUD"

export const initUpdateDataCRUD = (data) => ({
  type: INIT_UPDATE_DATA_CRUD,
  data
})

export const endUpdateDataCRUD = () => ({
  type: END_UPDATE_DATA_CRUD
})
