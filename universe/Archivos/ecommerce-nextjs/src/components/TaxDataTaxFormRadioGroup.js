import { Component } from 'react'

import { RadioGroup, Radio, FormControlLabel, Grid, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

const styles = (theme) => ({
  radio: {
    '&$checked': {
      color: '#e63946'
    }
  },
  checked: {}
})

class TaxDataTaxFormRadioGroup extends Component {
  render() {
    const { classes } = this.props
    const { value, onChange } = this.props
    return (
      <RadioGroup value={value} onChange={onChange}>
        <Grid container direction='row' alignItems='center'>
          <Grid item style={{ marginRight: 20 }}>
            <Typography variant='body1'>
              <strong>Tipo de persona:</strong>
            </Typography>
          </Grid>
          <Grid item>
            <FormControlLabel
              classes={{
                root: classes.formControlLabelRoot,
                label: classes.formControlLabel
              }}
              value='fisica'
              control={<Radio classes={{ root: classes.radio, checked: classes.checked }} />}
              label='Persona física'
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              classes={{
                root: classes.formControlLabelRoot,
                label: classes.formControlLabel
              }}
              value='moral'
              control={<Radio classes={{ root: classes.radio, checked: classes.checked }} />}
              label='Persona moral'
            />
          </Grid>
        </Grid>
      </RadioGroup>
    )
  }
}

export default withStyles(styles)(TaxDataTaxFormRadioGroup)
