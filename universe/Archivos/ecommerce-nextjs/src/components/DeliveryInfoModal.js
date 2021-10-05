import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Modal, Grid, Typography, TextField, Button, Snackbar, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

// Components
import Utils from '../resources/Utils'
import { getDataAPI } from '../api/CRUD.js'
import { setNewDeliveryAddress } from '../actions/actionDeliveryAddress'

function getModalStyle() {
  const top = 50
  const left = 50
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const styles = theme => ({
  smallForm: {
    overflowY: 'scroll',
    position: 'absolute',
    width: theme.spacing(60),
    maxHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  largeForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing(100),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  modalTitle: {
    fontSize: 28,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    },
    fontWeight: 600
  }
})

class DeliveryInfoModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      locations: [],
      values: {
        zip: '',
        stateCode: '',
        stateName: '',
        cityCode: '',
        cityName: ''
      }
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleRender = this.handleRender.bind(this)

    this.handleChangeValues = this.handleChangeValues.bind(this)
    this.checkZip = this.checkZip.bind(this)
    this.setNewDeliveryAddress = this.setNewDeliveryAddress.bind(this)
  }

  handleClose() {
    this.props.handleClose()
  }

  handleRender() {
    if (this.props.data !== undefined && this.props.data !== null) {
      let values = this.props.data
      this.setState({
        values: values
      })
    }
  }

  handleChangeValues(param, event) {
    let values = this.state.values
    if (param === 'zip') {
      if (event.target.value.trim().length > 5 || isNaN(event.target.value))
        return
    }
    values[param] = event.target.value
    this.setState({
      values: values
    })
    if (param === 'zip') {
      this.checkZip()
    }
  }

  async checkZip() {
    let values = this.state.values
    if (Utils.isNumeric(Number(values['zip']))) {
      if (values['zip'].trim().length === 5) {
        let response = await getDataAPI({
          host: Utils.constants.CONFIG_ENV.HOST,
          resource: 'locations',
          filters: {
            where: {
              zip: values['zip']
            },
            include: ["state", "municipality", "type"]
          }
        })
        if (response.data.length > 0) {
          values.stateCode = response.data[0].state.code
          values.stateName = response.data[0].state.name
          values.cityCode = response.data[0].municipality.code
          values.cityName = response.data[0].municipality.name
          this.setState({
            locations: response.data,
            values: values
          })
        }
      }
      else {
        values.stateCode = ''
        values.stateName = ''
        values.cityCode = ''
        values.cityName = ''
        this.setState({
          locations: [],
          values: values
        })
      }
    }
    else {
      values.stateCode = ''
      values.stateName = ''
      values.cityCode = ''
      values.cityName = ''
      this.setState({
        locations: [],
        values: values
      })
    }
  }

  setNewDeliveryAddress() {
    if (this.state.values.zip.trim().length !== 5 || this.state.locations.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Código postal incorrecto.'
      })
    } else {
      this.props.setNewDeliveryAddress({
        zip: this.state.values.zip,
        state: this.state.values.stateName,
        city: this.state.values.cityName,
      })
      this.handleClose()
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >
        <div style={getModalStyle()} className={classes.smallForm}>
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Typography variant="h4" className={classes.modalTitle} style={{ fontWeight: 800 }}>
                Mejora tu experiencia de compra.
              </Typography>
              <Typography variant="body1">
                Ingresa tu dirección de entrega y te indicaremos si el producto que seleccionaste se encuentra en tu ciudad.
              </Typography>
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Grid container style={{ marginTop: 24 }}>
                <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                  <Typography variant="body1"><strong>Código postal *</strong></Typography>
                  <TextField
                    type="text"
                    placeholder="Código postal..."
                    className={classes.textField}
                    value={this.state.values.zip}
                    onChange={(event) => { this.handleChangeValues('zip', event) }}
                  />
                </Grid>
                <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ paddingLeft: 8 }}>
                  <Typography variant="body1"><strong>Estado</strong></Typography>
                  <TextField
                    disabled={true}
                    className={classes.textField}
                    value={this.state.values.stateName}
                    type="text"
                  />
                </Grid>
                <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ paddingLeft: 8 }}>
                  <Typography variant="body1" ><strong>Ciudad</strong></Typography>
                  <TextField
                    disabled={true}
                    className={classes.textField}
                    value={this.state.values.cityName}
                    type="text"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Button variant="contained" style={{ marginRight: 16 }} onClick={() => { this.handleClose() }}>CANCELAR</Button>
            <Button variant="contained" color="primary" onClick={() => { this.setNewDeliveryAddress() }}>CONFIRMAR</Button>
          </div>
          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.state.openSnack}
            onClose={() => this.setState({ openSnack: false, messageSnack: '' })}
            message={
              <span>{this.state.messageSnack}</span>
            }
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => this.setState({ openSnack: false, messageSnack: '' })}
              >
                <CloseIcon />
              </IconButton>
            ]}
          />
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    setNewDeliveryAddress: (address) => {
      dispatch(setNewDeliveryAddress(address))
    }
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(DeliveryInfoModal)
