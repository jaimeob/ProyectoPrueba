import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';
import GoogleMapReact from 'google-map-react'
import house from '../resources/images/house.png'



// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Button, Typography, Modal, Avatar } from '@material-ui/core'


import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import PersonIcon from '@material-ui/icons/Person'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import PhoneIcon from '@material-ui/icons/Phone'
import MailIcon from '@material-ui/icons/Mail'

import Product from '../components/Product'


// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

registerLocale('es', es)

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
  container: {
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: '50%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '32px 16px 32px 16px',
    [theme.breakpoints.down('md')]: {
      width: '60%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
      padding: '16px 16px 16px 16px'
    }
  },
  containerOrder: {
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: '80%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '32px 16px 32px 16px',
    [theme.breakpoints.down('md')]: {
      width: '60%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
      padding: '16px 16px 16px 16px'
    }
  },

  avatar: {
    fontSize: '50px',
    width: '100px',
    height: '100px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
    display: 'flex',
  },
  containerInfo: {
    padding: '10px',
    borderRadius: '5px',
    boxShadow: 'rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) 0px 16px 32px -4px',
  }
})

class InfoModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedDate: '',
      comments: '',
      openSnack: false,
      messageSnack: '',
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)

  }

  handleClose() {
    this.setState({
      changeButton: true,
      comments: '',
      selectedDate: '',
      messageSnack: '',
      openSnack: false,
      sign: [],
      ine: [],

    })

    this.props.handleClose()
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  render() {
    const { classes } = this.props

    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
      >
        {
          (this.props.data !== null && this.props.data !== undefined) ?
            <div style={getModalStyle()} className={(this.props.data.key !== 'info_order' && this.props.data.key !== 'info_logs') ? classes.container : classes.containerOrder}>
              <Typography style={{ marginBottom: '20px' }} variant='h5'> {this.props.data.title} </Typography>
              <Grid container>
                <Grid item xs={12}>
                  {
                    (this.props.data !== null && this.props.data !== undefined) ?
                      <Grid container style={{ paddingBottom: '20px', paddingTop: '20px' }} >
                        {
                          (this.props.data.key === 'info_cliente') ?
                            <Grid container className={classes.containerInfo} >
                              <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar className={classes.avatar} > {this.props.data.letter} </Avatar>
                              </Grid>

                              <Grid item xs={7} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }} >
                                <Grid container >
                                  <Grid item xs={12} style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                    <PersonIcon />
                                    <Typography >{this.props.data.fullName}</Typography>
                                  </Grid>
                                  {
                                    (this.props.data.address !== undefined && this.props.data.address !== null && this.props.data.address.municipalityName !== undefined && this.props.data.address.municipalityName !== null && this.props.data.address.stateName !== undefined && this.props.data.address.stateName !== null) ?
                                      <Grid item xs={12} style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                        <LocationOnIcon />
                                        <Typography >Vive en {this.props.data.address.municipalityName + ', '}{this.props.data.address.stateName}</Typography>
                                      </Grid>
                                      :
                                      ''
                                  }
                                  <Grid item xs={12} style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                    <PhoneIcon />
                                    <Typography > {this.props.data.cellphone} </Typography>
                                  </Grid>
                                  <Grid item xs={12} style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                    <MailIcon />
                                    <Typography > {this.props.data.email} </Typography>
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid item xs={12} style={{ width: '100%' }} >
                                <Button onClick={() => { this.props.handleClose() }} variant="contained" color="primary" style={{ width: '20%', marginLeft: 'auto', display: 'block', color: 'white', marginTop: '20px', marginRight: '20px' }} >Cerrar</Button>
                              </Grid>
                            </Grid>
                            :
                            (this.props.data.key === 'info_address' && this.props.data.address !== null && this.props.data.address !== undefined) ?
                              <Grid container>
                                <Grid item xs={12}>
                                  <div style={{ minWidth: 300, minHeight: 300, width: '100%', height: '100%' }}>
                                    <GoogleMapReact
                                      style={{ marginTop: 16, width: '100%', height: '400px', position: 'relative' }}
                                      bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
                                      center={{
                                        lat: Number(this.props.data.address.lat),
                                        lng: Number(this.props.data.address.lng)
                                      }}
                                      zoom={17}
                                      disableDoubleClickZoom={false}
                                      zoomControl={false}
                                      options={{
                                        gestureHandling: 'greedy',
                                        disableDoubleClickZoom: true,
                                        scaleControl: false,
                                        zoomControl: false,
                                        rotateControl: false,
                                        panControl: false,
                                        streetViewControl: false,
                                        fullscreenControl: false,
                                        zoomControlOptions: { position: 9 },
                                        scrollwheel: false
                                      }}
                                    >
                                      <div onClick={() => { window.open('https://www.google.com/maps/?q=' + this.props.data.address.lat + ',' + this.props.data.address.lng, '_blank') }} lat={Number(this.props.data.address.lat)} lng={Number(this.props.data.address.lng)}><img style={{ width: 20, height: 20, cursor: 'pointer' }} src={house} /></div>
                                    </GoogleMapReact>
                                  </div>
                                </Grid>

                                <Grid item xs={12} style={{ padding: '20px', borderRadius: '50px', marginTop: '-120px', background: 'white', height: '200px', zIndex: 1 }} >
                                  <Grid container style={{ padding: '15px' }} >
                                    <Grid item xs={12}>
                                      <Typography style={{ fontWeight: 'bold', fontSize: '15px' }} variant='body1'> {this.props.data.address.name} </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Typography style={{}} variant='body2'> {this.props.data.address.locationTypeName + ' ' + this.props.data.address.locationName + '  ' + this.props.data.address.street + ' #' + this.props.data.address.exteriorNumber + ','} </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Typography variant='body2'> {this.props.data.address.municipalityName + ', ' + this.props.data.address.stateName + ', ' + this.props.data.address.zip} </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Typography variant='body2'> {'Celular: ' + this.props.data.address.phone} </Typography>
                                    </Grid>
                                    <Grid item xs={12} style={{ width: '100%' }} >
                                      <Button onClick={() => { this.props.handleClose() }} variant="contained" color="primary" style={{ width: '20%', marginLeft: 'auto', display: 'block', color: 'white', marginTop: '20px', marginRight: '20px' }} >Cerrar</Button>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                              :
                              (this.props.data.key === 'info_order') ?
                                <Grid container spacing={3} >
                                  <Grid item xs={4} className={classes.containerInfo} >
                                    <Grid container>
                                      <Grid item xs={12}>
                                        <Typography variant='body1' style={{ fontWeight: 'bold' }}>Orden: {this.props.data.calzzapatoCode}</Typography>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Typography variant='body2'>Pagada con: {this.props.data.paymentMethod}</Typography>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Typography variant='body2'>Fecha de pago: {this.props.data.shoppingDate}</Typography>
                                      </Grid>
                                      <Grid item xs={12} style={{ marginTop: '20px' }} >
                                        <Grid container>
                                          <Grid item xs={6}>
                                            <Typography variant='body1'>Subtotal </Typography>
                                          </Grid>
                                          <Grid item xs={6} style={{ textAlign: 'end' }}>
                                            <Typography variant='body2'>{Utils.numberWithCommas(Number(this.props.data.subtotal).toFixed(2))}</Typography>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Grid container>
                                          <Grid item xs={6}>
                                            <Typography variant='body1'>Descuento </Typography>
                                          </Grid>
                                          <Grid item xs={6} style={{ textAlign: 'end' }}>
                                            <Typography variant='body2'>{Utils.numberWithCommas(Number(this.props.data.discount).toFixed(2))}</Typography>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Grid container>
                                          <Grid item xs={6}>
                                            <Typography variant='body1'>Envío </Typography>
                                          </Grid>
                                          <Grid item xs={6} style={{ textAlign: 'end' }}>
                                            <Typography variant='body2'>{Utils.numberWithCommas(Number(this.props.data.shippingCost).toFixed(2))}</Typography>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                      <div style={{ marginBottom: '15px', marginTop: '15px', borderRadius: '5px', background: '#979797', height: '1px', width: '100%' }} />
                                      <Grid item xs={12}>
                                        <Grid container>
                                          <Grid item xs={6}>
                                            <Typography style={{ fontWeight: 'bold' }} variant='body1'>Total </Typography>
                                          </Grid>
                                          <Grid item xs={6} style={{ textAlign: 'end' }}>
                                            <Typography style={{ fontWeight: 'bold' }} variant='body2'>{Utils.numberWithCommas(Number(this.props.data.total).toFixed(2))}</Typography>
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={7} style={{ display: 'table', marginLeft: '10px' }} className={classes.containerInfo} >
                                    <Grid container style={{ overflow: 'scroll', maxHeight: '300px' }} >
                                      {
                                        this.props.data.detail.map((item, idx) => {
                                          return (
                                            <Grid item xs={12} style={{ marginTop: '10px', borderRadius: '10px' }} >
                                              <Product
                                                data={item}
                                              />
                                            </Grid>)
                                        })
                                      }
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={12} style={{ width: '100%' }} >
                                    <Button onClick={() => { this.props.handleClose() }} variant="contained" color="primary" style={{ width: '20%', marginLeft: 'auto', display: 'block', color: 'white', marginTop: '20px', marginRight: '85px' }} >Cerrar</Button>
                                  </Grid>
                                </Grid>
                                :
                                (this.props.data.key === 'info_logs' && this.props.data.logs !== null && this.props.data.logs !== undefined) ?
                                  <Grid container spacing={3}>

                                    <Grid item xs={4} style={{ padding:'10px', borderRadius: '10px',     boxShadow: 'rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) 0px 16px 32px -4px' }} >
                                      <Typography variant='body2'> <span style={{ fontWeight:'bold' }} >Intentos de compra:</span> {this.props.data.logs.intentos} </Typography>
                                      <Typography variant='body2'><span style={{ fontWeight:'bold' }} >Código calzzapato:</span> {this.props.data.logs.calzzapatoCode}</Typography>
                                      <Typography variant='body2'><span style={{ fontWeight:'bold' }} >Cantidad de productos:</span> {this.props.data.logs.quantity}</Typography>
                                    </Grid>
                                    
                                    <Grid style={{ marginLeft:'10px', maxHeight:'200px', overflow:'scroll' }} item xs={7}>
                                    {
                                      this.props.data.logs.actions.map((item, idx) => {
                                        return (
                                          <Grid item xs={12} style={{ marginBottom:'5px', padding: '5px', borderRadius: '5px',  boxShadow: 'rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) 0px 16px 32px -4px' }} >
                                            <Grid container>
                                              <Grid item xs={5}>
                                                <Typography variant='body2'>{item.name}</Typography>
                                              </Grid>
                                              <Grid item xs={3}>
                                                <Typography variant='body2'>{Utils.onlyDate(item.createdAt)}</Typography>
                                              </Grid>
                                              {
                                                (item.paymentStatus !== null && item.paymentStatus !== undefined)?
                                                <Grid item xs={3}>
                                                <Typography variant='body2'>{Utils.onlyDate(item.paymentStatus)}</Typography>
                                              </Grid>
                                              :
                                              (item.name === 'BUY' && (!item.success || item.error ))?
                                              <Grid item xs={4}>
                                                <Typography variant='body2'>failure</Typography>
                                              </Grid>
                                              :
                                              ''
                                              }
                                            </Grid>
                                          </Grid>
                                        )
                                      })
                                    }
                                    </Grid>
                                    <Grid item xs={12} style={{ width: '100%' }} >
                                      <Button onClick={() => { this.props.handleClose() }} variant="contained" color="primary" style={{ width: '20%', marginLeft: 'auto', display: 'block', color: 'white', marginTop: '20px', marginRight: '20px' }} >Cerrar</Button>
                                    </Grid>
                                  </Grid>
                                  :
                                  ''
                        }
                      </Grid>
                      :
                      ''
                  }
                </Grid>
              </Grid>
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
            :
            ''
        }
      </Modal>
    )
  }
}
const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = dispatch => {
  return {

  }
}
export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(InfoModal)
