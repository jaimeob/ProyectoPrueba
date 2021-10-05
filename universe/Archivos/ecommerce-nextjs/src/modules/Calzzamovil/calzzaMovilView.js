import React, { Component } from 'react'
import moment from 'moment'
import compose from 'recompose/compose'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Button, Chip } from '@material-ui/core'

// Utils
import Utils from '../../resources/Utils'
import { dropShoppingCart } from '../../actions/actionShoppingCart'
import GoogleMapReact from 'google-map-react'
import io from 'socket.io-client'

const styles = theme => ({
  root: {
    width: '100%',
    margin: '0 auto',
    padding: '16px 0px 16px',
    backgroundColor: "#F4F4F4"
  },
  container: {
    width: '90%',
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 16,
    padding: 24,
    [theme.breakpoints.down('md')]: {
      width: '90%'
    },
    [theme.breakpoints.down('sm')]: {
      width: '75%'
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%'
    }
  },
  mainText: {
    textAlign: 'center',
    fontStyle: 'normal',
    fontWeight: 800,
    fontSize: 32,
  },
  secondaryText: {
    textAlign: 'center',
    marginTop: '8px',
    fontSize: '16px',
  },
  secondaryHeavyText: {
    textAlign: 'center',
    marginTop: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  textError: {
    textAlign: 'center',
    fontSize: 32,
    color: '#FF6C62',
  },
  button: {
    marginTop: '24px',
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#243B7A',
  },
  buttonFailed: {
    marginTop: '24px',
    fontSize: '14px',
    fontWeight: 'normal',
    align: 'center'
  },
  loading: {
    textAlign: "center",
  },
  imageContainer: {
    display: 'flex',
    alignItems: 'center'
  }
})

class CalzzamovilView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      socket: null,
      lat: 24.781143,
      lng: -107.411886,
      order: null,
      pipeline: null,
      pipelineColor: 'green',
      dealer: null,
      currentStatus: 1,
      orientation: 1,
      toHome: false
    }
    this.changeCoordinates = this.changeCoordinates.bind(this)

  }

  async componentWillMount() {
    //Utils.scrollTop()
    if (this.props.data !== undefined) {
      this.setState({
        order: this.props.data.order,
        pipeline: this.props.data.pipeline,
        dealer: this.props.data.dealer,
        currentStatus: this.props.data.currentStatus
      })
      if (this.props.data.stores !== null && this.props.data.stores !== undefined && this.props.data.stores.length > 0) {
        this.setState({
          lat: Number(this.props.data.stores[0].lat),
          lng: Number(this.props.data.stores[0].lng)
        })

      }

      if (this.props.data.order > 4 || this.props.data.order === 0) {
        this.setState({ pipelineColor: 'red' })
      }
    }

    if (this.props.data || this.props.data !== undefined && this.props.data.order.currentStatus === 2) {
      let user = await Utils.getCurrentUser()
      if (user) {
        if (this.state.socket === null) {
          const socket = io(Utils.constants.CONFIG_ENV.HOST_TRACKING_API)
          // const socket = io('https://calzzamovil.ngrok.io')


          socket.on('connect', () => {
            this.setState({
              socket: socket
            })
            socket.emit('registration', { folio: this.props.data.order.order, userId: user.id }, () => {
            })

          })
          socket.emit('registration', { folio: this.props.data.order.order, userId: user.id }, () => {
          })
          socket.on('tracking', (data) => {
            //console.log('TRACKING data de socket ', data);
            this.changeCoordinates(data.lat, data.lng, data.orientation)
          })
          socket.on('toHome', (data) => {
            //log('TRACKING data de socket ', data);
            let toHome = false
            if (data.toHome !== undefined && data.toHome !== null && data.toHome) {
              toHome = true
            }
            this.setState({ toHome: toHome })
          })
          socket.on('pipeline', (data) => {
            //log('Pipeline socket', data);
            let pipelineAux = this.state.pipeline
            this.setState({ pipelineColor: 'green', dealer: data.dealer })
            pipelineAux.forEach(element => {
              if (element.id === data.pipeline) {
                element.status = true
                this.setState({ currentStatus: data.pipeline })
              } else {
                if (data.pipeline === 0 || data.pipeline > 4) {
                  this.setState({ pipelineColor: 'red' })
                } else {
                  element.status = false
                }
              }
            })
            this.setState({
              pipeline: pipelineAux
            })

          })

          socket.on('start', (data) => {
            //console.log('START data de socket ', data);
            if (data.currentStatus > 1) {
              this.setState({
                dealer: data,
                currentStatus: data.currentStatus
              })
            }
          })

        }
      }

    }
  }
  changeCoordinates(lat, lng, orientation) {
    let orientationSuma = Number(orientation) + 10
    this.setState({
      lat: Number(lat),
      lng: Number(lng),
      orientation: orientationSuma,
    })

  }


  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        {
          (this.props.data !== undefined) ?
            <Grid container alignContent="center" direction="column">
              <Grid container alignItems="left" direction="row" className={classes.container}>
                <Grid item xl={7} lg={7} md={7} sm={12} xs={12} style={{ textAlign: 'left' }}>
                  <Typography variant="body1" style={{ fontSize: 24 }}><strong>Folio de rastreo:</strong> {this.props.data.order.order}</Typography>
                  <Typography variant="body2"><strong>Método de pago utilizado:</strong> {this.props.data.order.paymentMethod.name}</Typography>
                  <br />
                  <Typography variant="body2"><strong>Mi dirección:</strong></Typography>
                  <Typography variant="body2">{this.props.data.order.address.street + ' #' + this.props.data.order.address.exteriorNumber + ' Col. ' + this.props.data.order.address.suburb + ' C.P. ' + this.props.data.order.address.zip + '. ' + this.props.data.order.address.municipality + ', ' + this.props.data.order.address.state + '.'}</Typography>
                  <br />
                  <Typography variant="body2"><strong>Total:</strong> <span style={{ color: 'green', fontWeight: 400 }}>${Utils.numberWithCommas(this.props.data.order.total)} M.N.</span></Typography>
                  {/* <Button onClick={() => {
                    this.state.socket.emit('start', { token: 1608687004166 }, () => {
                    })

                  }} > registration </Button> */}
                </Grid>
                <Grid item xl={5} lg={5} md={5} sm={12} xs={12}>
                  <Grid container>
                    {
                      this.state.pipeline.map(item => {
                        return (
                          <Grid sm={3} style={{ textAlign: 'center' }}>
                            <div style={{ zIndex: 9999, padding: 0, margin: '0 auto', height: 44, width: 44, background: (item.status) ? this.state.pipelineColor : '#E0E0E0', borderRadius: '50%' }}></div>
                            <Typography variant="body2" style={{ fontSize: 12, lineHeight: 1.1, width: '50%', margin: '0 auto', marginTop: 8, fontWeight: (item.status) ? 800 : 400 }}>{item.name}</Typography>
                          </Grid>
                        )
                      })
                    }
                  </Grid>
                  <Grid container style={{ textAlign: 'center', padding: '8px 16px', marginTop: 32 }}>
                    {
                      (this.state.dealer !== null) ?
                        (this.state.currentStatus === 4) ?
                          <Grid item xs={12}>
                            <Typography variant="body1" style={{}}>Tu repartidor fue:<br></br> <strong style={{ color: 'green' }}>{this.state.dealer.fullName} </strong></Typography>
                          </Grid>
                          :
                          <Grid item xs={12}>
                            <img class='mymove' style={{ width: '20px', height: 'auto', transform: 'rotate(90deg)', position: 'relative', animation: ` mymove 5s infinite` }} src='../../motorbike.png'></img>
                            <Typography variant="body1" style={{}}>Tu repartidor es:<br></br> <strong style={{ color: 'green' }}>{this.state.dealer.fullName} </strong></Typography>
                          </Grid>
                        :
                        <Grid item xs={12}>
                          <Typography variant="body2" style={{ color: 'red' }}><strong>Repartidor pendiente de asignar</strong></Typography>
                        </Grid>
                    }
                    <Button variant="contained" style={{ background: '#075E54', color: 'white', textTransform: 'none', fontSize: 16, marginTop: 24, width: '100%' }} onClick={() => {
                      let description = ''
                      if (this.props.data.dealer !== null) {
                        description = '. Mi repartidor es: '
                      }
                      window.open("https://api.whatsapp.com/send?phone=526677515229&text=Hola, necesito atención con mi entrega Calzzamovil ® con folio: " + this.props.data.order.order + description)
                    }}>
                      <img style={{ width: 20, marginRight: 8 }} src="../../whatsapp.svg" /> Solicitar atención
                    </Button>

                  </Grid>
                </Grid>
                <Grid item xl={7} lg={7} md={7} sm={12} xs={12} style={{ marginTop: 24, pointerEvents: 'none' }}>
                  {
                    (this.state.currentStatus === 2 || this.state.currentStatus === 3) ?
                      <div>
                        {
                          (!this.state.toHome) ?
                            <Chip label="Haciendo algunas entregas en el camino" color='primary' style={{ float: 'left', position: 'relative', zIndex: '3', margin: '10px', background: 'white' }} className={classes.chip} variant="outlined" />
                            :
                            ''
                        }

                        <GoogleMapReact
                          style={{ width: '100%', height: '500px', position: 'relative', zIndex: '2' }}
                          bootstrapURLKeys={{
                            key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo'
                          }}
                          center={{
                            lat: this.state.lat,
                            lng: this.state.lng
                          }}
                          zoom={18}
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

                          {/* <img style={{ width: '20px', height: 'auto', transform: `rotate(${this.state.orientation}deg)`, position: 'relative' }} src='/motorbike.png'></img> */}
                          <img lat={this.state.lat} lng={this.state.lng} style={{ marginLeft: '-5px', marginTop: '-10px', width: '15px', height: 'auto', position: 'relative' }} src='/circulo.png'></img>
                          {/* <div onClick={() => { }} lat={this.state.lat} lng={this.state.lng} className={classes.pin}><img style={{ marginLeft:'-20px', marginTop:'-5px', width: '30px', height: 'auto' }} src='/circulo.png' ></img></div> */}
                          <div onClick={() => { }} lat={Number(this.props.data.order.address.lat)} lng={Number(this.props.data.order.address.lng)} className={classes.pin}><img style={{ width: '30px', height: 'auto', transform: '' }} src='/house.png' ></img></div>
                          {
                            this.props.data.stores.map(item => {
                              return (
                                <div onClick={() => { }} lat={item.lat} lng={item.lng} className={classes.pin}><img style={{ width: '40px', height: 'auto', transform: '' }} src='/store.png' ></img></div>
                              )

                            })
                          }
                        </GoogleMapReact>

                      </div>
                      :
                      (this.state.currentStatus === 1) ?
                        <Grid container >
                          <Grid item xs={12}>
                            <img style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block' }} src='/box.gif'></img>
                          </Grid>
                          <Grid item xs={12} style={{ marginTop: 30 }}>
                            <Typography style={{ textAlign: 'center', fontSize: '24px' }} variant="body1" ><strong>En espera...</strong></Typography>
                            <Typography style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }} variant="body2" >En un momento un repartidor tomará tu pedido y te lo llevará hasta tu domicilio.</Typography>
                          </Grid>
                        </Grid>
                        :
                        // Cuando finalice.
                        (this.state.currentStatus === 4) ?
                          <Grid container >
                            <Grid item xs={12}>
                              <img style={{ width: '120px', height: 'auto', marginLeft: 'auto', marginRight: 'auto', display: 'block' }} src='/check.png'></img>
                            </Grid>
                            <Grid item xs={12} style={{ marginTop: 30 }}>
                              <Typography style={{ textAlign: 'center', fontSize: '24px' }} variant="body1" ><strong>Finalizado.</strong></Typography>
                              <Typography style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }} variant="body2" >Tu pedido ha finalizado.</Typography>
                            </Grid>
                          </Grid>
                          :
                          <Grid container >
                            {/* <Grid item xs={12}>
                            <img style={{ width: '120px', height: 'auto', marginLeft: 'auto', marginRight: 'auto', display: 'block' }} src='/check.png'></img>
                          </Grid> */}
                            <Grid item xs={12} style={{ marginTop: 30 }}>
                              <Typography style={{ textAlign: 'center', fontSize: '24px' }} variant="body1" ><strong>Pedido Pausado</strong></Typography>
                              <Typography style={{ textAlign: 'center', marginTop: 20, marginBottom: 20 }} variant="body2" >Tu pedido se ha pausado.</Typography>
                            </Grid>
                          </Grid>
                  }
                </Grid>
                <Grid item xl={5} lg={5} md={5} sm={12} xs={12} style={{ paddingLeft: 32, marginTop: 24 }}>
                  <Typography variant="body1" style={{ fontSize: 24 }}><strong>Tus productos</strong></Typography>
                  {
                    (this.props.data.products) ?
                      <Grid >
                        {this.props.data.products.map((detail, index) => {
                          return (
                            <Grid key={index} item sm={12} container direction="row" style={{ marginTop: 32 }}>
                              <Grid item xl={3} lg={3} md={3} sm={3} className={classes.imageContainer}>
                                <img style={{ width: '100%' }} alt='' src={detail.image} />
                              </Grid>
                              <Grid item xl={8} lg={8} md={8} sm={8} container direction="row" justify="space-between">
                                <Grid item xl={12} lg={12} md={12} sm={12} container direction="column">
                                  <Grid container>
                                    <Typography className={classes.font} style={{ color: '#000000' }}>
                                      {detail.productDescription}
                                    </Typography>
                                  </Grid>
                                  <Grid container direction="row" justify="space-between">
                                    <Grid item xl={12} lg={12} md={12} sm={12} direction="column">
                                      {(detail.brand !== undefined) ?
                                        <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                                          Marca: {detail.brand}
                                        </Typography>
                                        :
                                        ''
                                      }
                                      <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                                        Talla: {detail.size}
                                      </Typography>
                                      <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                                        Cantidad: {detail.quantity}
                                      </Typography>
                                      <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                                        Subtotal: ${Utils.numberWithCommas(Number(detail.subtotal).toFixed(2))}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Grid>

                              </Grid>
                            </Grid>
                          )
                        })}
                      </Grid>
                      :
                      ''
                  }
                </Grid>
              </Grid>
              <Grid container alignItems="center" direction="column" className={classes.container}>
                <Typography className={classes.secondaryText}> ¿Tienes alguna pregunta? </Typography>
                <Typography className={classes.secondaryText}> Llámanos las 24 horas, los 365 días del año </Typography>
                <Typography className={classes.secondaryText}> También puedes visitar nuestra sección de <a href={Utils.constants.paths.faq}><ins style={{ color: '#243B7A' }}>preguntas frecuentes</ins></a> y <a href={Utils.constants.paths.support}><ins style={{ color: '#243B7A' }}>soporte</ins></a></Typography>
              </Grid>
            </Grid>
            :
            <Grid container alignContent="center" direction="column">
              <Grid container alignItems="center" direction="column" className={classes.container}>
                {/*<img src="/unsuccessfull.svg" alt='' />*/}
                <Typography className={classes.textError}>¡Compra no disponible con Calzzamovil ®!</Typography>
                <Typography className={classes.secondaryText}>Esta compra no está disponible por el momento.</Typography>
                <Typography className={classes.secondaryText}>Intenta de nuevo más tarde o consulta otra compra.</Typography>
              </Grid>
              <Grid container alignItems="center" direction="column" className={classes.container}>
                <Typography className={classes.secondaryText}> ¿Tienes alguna pregunta? </Typography>
                <Typography className={classes.secondaryText}> Llámanos las 24 horas, los 365 días del año </Typography>
                <Typography className={classes.secondaryText}> También puedes visitar nuestra sección de <a href={Utils.constants.paths.faq}><ins style={{ color: '#243B7A' }}>preguntas frecuentes</ins></a> y <a href={Utils.constants.paths.support}><ins style={{ color: '#243B7A' }}>soporte</ins></a></Typography>
              </Grid>
            </Grid>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    dropShoppingCart: () => {
      dispatch(dropShoppingCart())
    }
  }
}

export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(CalzzamovilView)
