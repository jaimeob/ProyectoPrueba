export const CLEAR_AUTOCOMPLETE = "CLEAR_AUTOCOMPLETE"
export const RELOAD_AUTOCOMPLETE = "RELOAD_AUTOCOMPLETE"

export const clearAutocomplete = (autocomplete) => ({
  type: CLEAR_AUTOCOMPLETE,
  autocomplete
})

export const reloadAutocomplete = (autocomplete) => ({
  type: RELOAD_AUTOCOMPLETE,
  autocomplete
})
