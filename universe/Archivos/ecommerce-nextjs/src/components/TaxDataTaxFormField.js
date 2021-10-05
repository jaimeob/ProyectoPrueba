import { Component } from "react"

import { Grid, TextField, Typography } from "@material-ui/core"

export default class TaxDataFormField extends Component {
  render() {
    const { fieldName, fieldPlaceholder, fieldValue, onChange, xsSize = 12, type = "string" } = this.props

    return (
      <Grid item xs={xsSize}>
        <Typography variant="body1">
          <strong>{fieldName}</strong>
        </Typography>
        <TextField placeholder={fieldPlaceholder} fullWidth type={type} value={fieldValue} onChange={onChange} />
      </Grid>
    )
  }
}
