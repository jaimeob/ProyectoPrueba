import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import GoogleMapReact from 'google-map-react'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import Paper from '@material-ui/core/Paper'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

//
import Utils from '../resources/Utils'
import { getDataAPI, requestAPI } from '../api/CRUD'
import { Grid } from '@material-ui/core'
import Loading from './Loading'

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
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '100%',
      height: '100%'
    }
  },
  largeForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: '80%',
    height: '80%',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '100%',
      height: '100%'
    }
  },
  modalTitle: {
    fontSize: 28,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    },
    fontWeight: 600
  },
  form: {
    marginTop: 16
  },
  textFieldForm: {
    marginTop: 16
  },
  select: {
    marginTop: 16
  },
  textField: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'white',
    fontWeight: 200
  },
  actions: {
    float: 'right',
    marginTop: 32,
    [theme.breakpoints.down('sm')]: {
      paddingBottom: 16
    }
  },
  closeButton: {
    float: 'right',
    [theme.breakpoints.down('sm')]: {
      marginTop: 8
    }
  },
  primaryButton: {
    fontWeight: 600,
    fontSize: 14
  },
  pin: {
    background: '#3091E5',
    width: '25px',
    height: '25px',
    border: '3px solid white',
    borderRadius: '100%',
    color: 'white',
    textAlign: 'center'
  },
  selectedPin: {
    background: 'red',
    width: '25px',
    height: '25px',
    border: '3px solid white',
    borderRadius: '100%',
    color: 'white',
    textAlign: 'center'
  },
  scrollBar: {
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px'
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      'border-radius': '4px',
      'background-color': 'rgba(0,0,0,.5)',
      '-webkit-box-shadow': '0 0 1px hsla(0,0%,100%,.5)'
    }
  }
})

class MapModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingLocation: false,
      messageErrorLocation: false,
      selectedLocation: null,
      openSnack: false,
      messageSnack: ''
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.getPosition = this.getPosition.bind(this)
    this.clearData = this.clearData.bind(this)
    this.confirmLocation = this.confirmLocation.bind(this)
  }
  componentWillMount() {
    if (this.props.address !== undefined && this.props.address !== null) {
      this.setState({
        selectedLocation: {
          lat: this.props.address.lat,
          lng: this.props.address.lng
        }
      })
    }
  }
  componentDidMount() {
    // this.state.selectedLocation.lat

  }

  async confirmLocation() {
    if (this.props.fromCreateAddress === undefined || this.props.fromCreateAddress === false) {
      let responseUpdate = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'PUT',
        resource: 'addresses',
        endpoint: '/location',
        data: {
          id: this.props.address.addressId,
          lat: this.state.selectedLocation.lat,
          lng: this.state.selectedLocation.lng
        }
      })

      let withError = false
      if (responseUpdate.status === Utils.constants.status.SUCCESS) {
        if (responseUpdate.data.updated) {
          this.props.handleConfirm({
            location: this.state.selectedLocation
          })
        } else {
          withError = true
        }
      } else {
        withError = true
      }

      if (withError) {
        this.setState({
          openSnack: true,
          messageSnack: 'Ocurrió un problema al actualizar la ubicación. Intenta de nuevo más tarde.'
        })
      }
    } else {
      this.props.handleConfirm({ lat: this.state.selectedLocation.lat, lng: this.state.selectedLocation.lng })
    }
  }

  async getPosition() {
    let self = this
    let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }

    function success(location) {
      self.setState({
        loadingLocation: false,
        messageErrorLocation: false,
        selectedLocation: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        },
        openSnack: true,
        messageSnack: 'Ubicación seleccionada con éxito.'
      })
    }

    function error(err) {
      console.log(err)
      self.setState({
        loadingLocation: false,
        messageErrorLocation: true,
        openSnack: true,
        messageSnack: 'Tienes que proporcionar permisos a tu navegador y recargar el sitio para acceder a tu ubicación.'
      })
    }

    this.setState({
      loadingLocation: true
    })
    navigator.geolocation.getCurrentPosition(success, error, options)
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  clearData() {
    this.setState({
      selectedLocation: null
    })
  }

  render() {
    const self = this
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >
        <div style={getModalStyle()} className={`${classes.largeForm} ${classes.scrollBar}`}>
          <Button onClick={this.handleClose} className={classes.closeButton}><Icon>close</Icon> CERRAR</Button>
          <Typography variant="h4" className={classes.modalTitle}>
            Confirma tu ubicación.
          </Typography>
          <Typography variant="body1" style={{ fontSize: 14, color: 'gray' }}>
            Confirma tu ubicación para que nuestros repartidores no tengan problema con su destino de entrega.
          </Typography>
          {
            (this.props.address !== null) ?
              <Paper style={{ marginTop: 12, padding: '8px 16px' }}>
                <Grid container>
                  <Grid item md={8} sm={12}>
                    <Typography variant="body1"><strong>Tu dirección:</strong></Typography>
                    <Typography>{this.props.address.street} #{this.props.address.exteriorNumber} {(!Utils.isEmpty(this.props.address.interiorNumber) ? '(' + this.props.address.interiorNumber + ')' : '')} {this.props.address.type} {this.props.address.location} C.P. {this.props.address.zip}</Typography>
                    <Typography>{(this.props.address.municipality !== undefined) ? this.props.address.municipality : this.props.address.cityName}, {(this.props.address.state !== undefined) ? this.props.address.state : this.props.address.stateName}</Typography>
                  </Grid>
                  <Grid item md={4} sm={12}>
                    {
                      (!this.state.loadingLocation) ?
                        <Button disabled={this.state.messageErrorLocation} variant="contained" color="primary" style={{ marginTop: 8, float: 'right' }} onClick={() => { this.getPosition() }}>
                          <Icon>room</Icon> <label style={{ marginLeft: 4 }}>Utilizar mi ubicación</label>
                        </Button>
                        :
                        <div style={{ margin: '0 auto', width: '100%', textAlign: 'center' }}>
                          <Loading />
                          <Typography variant="body1">Cargando mi ubicación...</Typography>
                        </div>
                    }
                  </Grid>
                </Grid>
              </Paper>
              :
              ''
          }
          <div style={{ minWidth: 300, minHeight: 300, width: '100%', height: '100%', textAlign: 'center' }}>
            <Typography variant="body1" style={{ marginTop: 10 }}>
              {
                (this.state.selectedLocation !== null) ?
                  <div style={{ textAlign: 'center' }}>
                    <Button variant="contained" style={{ background: 'green', color: 'white', width: '100%' }} onClick={() => {
                      this.confirmLocation()
                    }}
                    >
                      CONFIRMAR UBICACIÓN DE ENTREGA
                  </Button>
                    <strong style={{ fontSize: 12 }}>Edita tu ubicación seleccionando un punto en el mapa</strong>
                  </div>
                  :
                  <strong style={{ fontSize: 12 }}>Selecciona un punto en el mapa</strong>
              }
            </Typography>
            <GoogleMapReact
              style={{ marginTop: 16, width: '100%', height: '60%', position: 'relative' }}
              bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
              center={{
                lat: (this.state.selectedLocation !== null && this.state.selectedLocation.lat !== '' && this.state.selectedLocation.lat !== 0) ? this.state.selectedLocation.lat : 24.806553,
                lng: (this.state.selectedLocation !== null && this.state.selectedLocation.lng !== '' && this.state.selectedLocation.lng !== 0) ? this.state.selectedLocation.lng : -107.393753
              }}
              zoom={(this.state.selectedLocation !== null) ? 20 : 15}
              onClick={(event) => {
                this.setState({
                  selectedLocation: {
                    lat: event.lat,
                    lng: event.lng
                  },
                  openSnack: true,
                  messageSnack: 'Ubicación seleccionada con éxito.'
                })
              }}
            >
              {
                (this.state.selectedLocation !== null) ?
                  <div lat={this.state.selectedLocation.lat} lng={this.state.selectedLocation.lng}><img style={{ marginTop: -20, marginLeft: -20, width: 50, height: 50 }} src="/house.png" /></div>
                  :
                  ''
              }
            </GoogleMapReact>
          </div>
          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.state.openSnack}
            onClose={this.handleCloseSnackbar}
            message={
              <span>{this.state.messageSnack}</span>
            }
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={this.handleCloseSnackbar}
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

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(MapModal)
