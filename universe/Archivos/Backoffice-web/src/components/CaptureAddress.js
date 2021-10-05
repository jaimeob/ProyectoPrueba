

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'

// Actions
import Utils from '../resources/Utils'
import { Typography, Grid, TextField } from '@material-ui/core'
import Autocomplete from '../components/Autocomplete'

const styles = theme => ({
  container: {
    padding: 12
  }
})

class CaptureAddress extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      values: {
        requesterId: null,
        hospitalId: null,
        doctorId: null,
        patientId: null,
        stateId: null,
        municipalityId: null
      },
      notes: []
    }

    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
  }

  handleChangeValueSelect(type, value) {
    this.setState({
      values: {
        [type]: value
      }
    })
  }

  render() {
    const { classes } = this.props
    return (
      <form>
        <Grid container>
          <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
            <Typography variant="body1"><strong>Código postal:</strong></Typography>
            <TextField
              placeholder="5 dígitos..."
              className={classes.textField}
              value={this.state.zip}
              onChange={(event) => { this.handleChangeValues('zip', event) }}
              type="number"
            />
          </Grid>
          <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
            <Typography variant="body1"><strong>Estado:</strong></Typography>
            <TextField
              disabled={true}
              placeholder="Estado..."
              className={classes.textField}
              value={this.state.state}
              type="text"
            />
          </Grid>
          <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
            <Typography variant="body1"><strong>Ciudad:</strong></Typography>
            <TextField
              disabled={true}
              placeholder="Ciudad..."
              className={classes.textField}
              value={this.state.municipality}
              type="text"
            />
          </Grid>
        </Grid>
        <div className={classes.textFieldForm}>
          <Typography variant="body1"><strong>{Utils.messages.OfficeForm.addressModal.suburb}:</strong></Typography>
          <TextField
            disabled={this.state.textInputDisabled}
            placeholder={Utils.messages.OfficeForm.addressModal.suburb + "..."}
            className={classes.textField}
            value={this.state.values.suburb}
            onChange={(event) => { this.handleChangeValues('suburb', event) }}
            type="text"
          />
        </div>
        <div className={classes.textFieldForm}>
          <Typography variant="body1"><strong>{Utils.messages.OfficeForm.addressModal.street}:</strong></Typography>
          <TextField
            disabled={this.state.textInputDisabled}
            placeholder={Utils.messages.OfficeForm.addressModal.street + "..."}
            className={classes.textField}
            value={this.state.values.street}
            onChange={(event) => { this.handleChangeValues('street', event) }}
            type="text"
          />
        </div>
        <div className={classes.textFieldForm}>
          <Grid container>
            <Grid item lg={6} style={{paddingRight: 8}}>
              <Typography variant="body1"><strong>{Utils.messages.OfficeForm.addressModal.exteriorNumber}:</strong></Typography>
              <TextField
                disabled={this.state.textInputDisabled}
                placeholder={Utils.messages.OfficeForm.addressModal.exteriorNumber + "..."}
                className={classes.textField}
                value={this.state.values.exteriorNumber}
                onChange={(event) => { this.handleChangeValues('exteriorNumber', event) }}
                type="number"
              />
            </Grid>
            <Grid item lg={6} style={{paddingLeft: 8}}>
              <Typography variant="body1"><strong>{Utils.messages.OfficeForm.addressModal.interiorNumber}:</strong></Typography>
              <TextField
                disabled={this.state.textInputDisabled}
                placeholder={Utils.messages.OfficeForm.addressModal.interiorNumber + "..."}
                className={classes.textField}
                value={this.state.values.interiorNumber}
                onChange={(event) => { this.handleChangeValues('interiorNumber', event) }}
                type="number"
              />
            </Grid>
          </Grid>
        </div>
      </form>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(CaptureAddress)
