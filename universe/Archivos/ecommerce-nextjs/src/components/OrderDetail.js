import React, { Component } from 'react'
import compose from 'recompose/compose'
import dateFormat from 'dateformat'
import { connect } from 'react-redux'


// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Hidden, IconButton, Button, Icon } from '@material-ui/core'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import ClearIcon from '@material-ui/icons/Clear'


// Components
import ProgressBar from './ProgressBar'

import Slider from "react-slick";


import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'


dateFormat.i18n = {
  dayNames: [
    'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab',
    'Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'
  ],
  monthNames: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  timeNames: [
    'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
  ]
};

const styles = theme => ({
  root: {
    marginBottom: 32,
    [theme.breakpoints.down('xs')]: {
      marginBottom: 16
    }
  },
  imageContainer: {
    paddingRight: 24,
    [theme.breakpoints.down('xs')]: {
      paddingRight: 16
    }
  },
  font: {
    fontSize: 16,
    [theme.breakpoints.down('xs')]: {
      fontSize: 14
    }
  },
  fontDate: {
    fontSize: 18,
    [theme.breakpoints.down('xs')]: {
      fontSize: 14
    }
  },
  fontTotal: {
    fontSize: 24,
    [theme.breakpoints.down('xs')]: {
      fontSize: 18
    }
  },
  card: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 24,
    [theme.breakpoints.down('xs')]: {
      padding: 16
    }
  },
  slider: {
    height: "auto",
    "& .slick-list": {
      padding: '1.5em, 0em, 1.5em, 1em'
    }
  },
  gris: {
    color: 'rgba(0, 0, 0, 0.54)'
  },
  tachado: {
    textDecoration: 'line-through',
    textDecorationColor: 'rgba(0, 0, 0, 0.54)'
  },
  littleFont: {
    fontSize: '14px'
  }
})

const arrowClass = () => ({
  custom: {
    "&.MuiFab-root": {
      backgroundColor: "rgb(255, 255, 255, .80) !important"
    }
  }
})

function NextArrow(props) {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      className={arrowClass.custom}
      style={{ width: 16, height: 16, position: "absolute", right: "2px", top: "50%", transform: "translate(0, -50%)", zIndex: 99, backgroundColor: "rgb(255, 255, 255, .80)" }} >
      <KeyboardArrowRight fontSize="small" />
    </IconButton>
  )
}

function PreviousArrow(props) {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      className={arrowClass.custom}
      size="small"
      style={{ width: 16, height: 16, position: "absolute", left: "2px", top: "50%", transform: "translate(0, -50%)", zIndex: 99, backgroundColor: "rgb(255, 255, 255, .80)" }} >
      <KeyboardArrowLeft fontSize="small" />
    </IconButton>
  )
}

class OrderDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      expanded: false,
      open: false
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    this.getDetail = this.getDetail.bind(this)
  }

  componentDidMount() {
    this.updateWindowDimensions()
    window.addEventListener('resize', this.updateWindowDimensions)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions)
  }

  updateWindowDimensions() {
    if (window.innerWidth <= 600) {
      this.setState({ expanded: false })
    } else {
      if (this.state.open) {
        this.setState({ open: false })
        this.props.handleClose()
      }
    }
  }
  async getDetail(order) {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: `/orders/${order}`,
      headers: {
        Authorization: this.props.login.token,
        uuid: this.props.app.data.uuid
      }
    })
    this.setState({
      ordersLoaded: true
    })

    if (response.data !== undefined) {
      this.setState({
        orders: response.data,
        expanded: true
      })
    }
  }

  render() {
    const { classes, order } = this.props
    const settings = {
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      swipeToSlide: true,
      nextArrow: <NextArrow />,
      prevArrow: <PreviousArrow />
    }
    return (
      <div className={classes.root}>
        {/* <Grid container>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Typography variant="body1">
              Pedido creado el { dateFormat(order.shoppingDate, "d") } de { dateFormat(order.shoppingDate, "mmmm") } de { dateFormat(order.shoppingDate, "yyyy") }
            </Typography>
            <Typography variant="body1">
              {
                (order.calzzapatoCode !== null && order.calzzapatoCode > 0) ?
                <Typography variant="body1">Número de folio: <strong>{order.calzzapatoCode}</strong></Typography>
                :
                ''
              }
            </Typography>
          </Grid>
        </Grid> */}
        <Grid container direction="row" spacing={2} className={classes.card}>
          {(this.state.expanded) ?
            ''
            :
            <Grid item xl={3} lg={3} md={3} sm={3} xs={4} className={classes.imageContainer}>
              <Slider  {...settings} className={classes.slider}>
                {order.photos.map((detail, index) => {
                  return (
                    <img key={index} alt='' src={detail} />
                  )
                })}
              </Slider>
            </Grid>
          }
          {(this.state.expanded) ?
            <Grid item xl={12} lg={12} md={12} sm={12} container direction="row" justify="space-between">
              <Grid item xl={10} lg={10} md={10} sm={10} container direction="column">
                <Grid container direction="column">
                  <Grid item sm={6}>
                    <Hidden smUp>
                      <Grid item xl={2} lg={2} md={2} sm={2} container justify="flex-end">
                        <Grid item>
                          {/* <Button style={{ borderRadius: '50px', width: 100, padding: '10px' }} variant='outlined' color="primary" size="small" onClick={() => this.setState({ expanded: false })}>
                      CERRAR2
                  </Button> */}
                          <ClearIcon onClick={() => this.setState({ expanded: false })} />
                        </Grid>
                      </Grid>
                    </Hidden>
                  </Grid>
                  
                  <Grid item xs={12}>
                  <Grid container direction="row">
                    <Grid item sm={4}>
                      {
                        (order.calzzapatoCode) ?
                          <Typography className={classes.font} >
                            Folio: <span className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }} >#{order.calzzapatoCode}</span>
                          </Typography>
                          :
                          <Typography className={classes.font} >
                            Folio: <span className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }} >#{order.order}</span>
                          </Typography>
                      }
                      <Typography className={classes.font}>
                        Fecha: <span className={classes.font, classes.gris} >{dateFormat(order.deliveryDate, "dddd d")} de {dateFormat(order.deliveryDate, "mmmm")}</span>
                      </Typography>
                      {/* {
                    (order.orderDetail.length === 1) ?
                    <Typography style={{width: '100%', fontSize: 14}}>
                      Precio total (1 producto)
                    </Typography>
                    :
                    <Typography style={{width: '100%', fontSize: 14}}>
                      Precio total ({order.orderDetail.length} productos)
                    </Typography>
                  }
                  <Typography style={{width: '100%', fontSize: 18, marginBottom: 16, color: '#26a446'}}>
                    ${Utils.numberWithCommas(Number(order.total).toFixed(2))}
                  </Typography> */}
                    </Grid>
                    <Grid item sm={4} direction="column">
                      <Typography style={{ color: '#000000' }}>
                        Método de pago
                    </Typography>
                      <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                        {this.state.orders.paymentMethod.name}
                      </Typography>
                    </Grid>
                    <Grid item sm={4}>
                      <Typography className={classes.font} style={{ color: '#000000' }}>
                        Método de envío
                    </Typography>
                      {
                        (this.state.orders !== null && this.state.orders !== undefined && this.state.orders.shippingMethod !== null && this.state.orders.shippingMethod !== undefined && this.state.orders.shippingMethod.name !== 'GRATIS') ?
                          <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                            {this.state.orders.shippingMethod.name}(${Utils.numberWithCommas(Number(this.state.orders.shippingCost).toFixed(2))})
                          </Typography>
                          :
                          <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                            {
                              (this.state.orders !== null && this.state.orders !== undefined && this.state.orders.shippingMethod !== null && this.state.orders.shippingMethod !== undefined &&  this.state.orders.shippingMethod.name) ?
                                this.state.orders.shippingMethod.name
                                :
                                ''
                            }
                          </Typography>
                      }
                    </Grid>
                  </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Hidden xsDown>
                <Grid item xl={2} lg={2} md={2} sm={2} container justify="flex-end">
                  <Grid item>
                    <Button style={{ borderRadius: '50px', width: 100, padding: '10px' }} variant='outlined' color="primary" size="small" onClick={() => this.setState({ expanded: false })}>
                      CERRAR
                  </Button>
                  </Grid>
                </Grid>
              </Hidden>


              <Grid item xl={10} lg={10} md={10} sm={10} style={{ marginTop: '32px' }} container direction="column">
                <Grid container direction="column">

                  <Grid container direction="row">

                    <Grid item sm={4}>
                      <Typography className={classes.font} >
                        Ahorrado:
                      </Typography>
                      {
                        (order.saved === 0) ?
                          <Typography className={classes.font, classes.gris} >
                            ${Utils.numberWithCommas(Number(order.discount).toFixed(2))}
                          </Typography>
                          :
                          <Typography className={classes.font, classes.gris} >
                            -
                      </Typography>

                      }
                    </Grid>

                    <Grid item sm={4} direction="column">
                      <Typography className={classes.font} >
                        Cupón de pago:
                      </Typography>
                      {
                        (order.discount === 0) ?
                          <Typography className={classes.font, classes.gris} >
                            -
                        </Typography>
                          :
                          <Typography className={classes.font, classes.gris} >
                            ${order.discount}
                          </Typography>

                      }
                    </Grid>

                    <Grid item sm={4}>
                      <Typography className={classes.font} >
                        Total:
                      </Typography>
                      <Typography className={classes.font} style={{ color: 'green' }}>
                        <span style={{ color: 'green', fontWeight: 200 }}>${Utils.numberWithCommas(Number(order.total).toFixed(2)) + ' M.N.'}</span>
                      </Typography>
                    </Grid>

                  </Grid>
                </Grid>
              </Grid>




              <Grid item xl={12} lg={12} md={12} sm={12} container direction="column" style={{ marginTop: 32 }}>
                <Grid container direction="row" style={{ marginBottom: 24 }}>
                  {
                    (this.state.orders !== undefined && this.state.orders.address !== undefined) ?
                      <Grid item sm={12} direction="column">
                        <Typography className={classes.font} style={{ color: '#000000', marginTop: 16 }}>
                          Dirección de envío
                 </Typography>
                        <Typography className={classes.font} style={{ width: '100%', color: 'rgba(0, 0, 0, 0.54)' }}>
                          {this.state.orders.address.name}
                        </Typography>
                        <Typography className={classes.font} style={{ width: '100%', color: 'rgba(0, 0, 0, 0.54)' }}>
                          {this.state.orders.address.street} #{this.state.orders.address.exteriorNumber}, {this.state.orders.address.locationName}
                          {this.state.orders.address.municipalityName}, {this.state.orders.address.stateName}, México, {this.state.orders.address.zip}
                        </Typography>
                      </Grid>
                      :
                      ''
                  }
                </Grid>
                <Grid container style={{ marginBottom: 24 }}>
                  {(this.state.orders.orderDetail.length === 1) ?
                    <Typography style={{ fontSize: 18, color: '#000000' }}>
                      <strong>Tu producto</strong>
                    </Typography>
                    :
                    <Typography style={{ fontSize: 18, color: '#000000' }}>
                      <strong>Tus productos</strong>
                    </Typography>
                  }
                </Grid>
                <Grid container>
                  {this.state.orders.orderDetail.map((detail, index) => {
                    return (
                      <Grid key={index} item sm={12} container direction="row" style={{ marginTop: 32 }}>
                        <Grid item xl={3} lg={3} md={3} sm={3} className={classes.imageContainer}>
                          <img style={{ width: '100%' }} alt='' src={detail.image} />
                        </Grid>
                        <Grid item xl={9} lg={9} md={9} sm={9} container direction="row" justify="space-between">
                          <Grid item xl={7} lg={7} md={7} sm={7} container direction="column">
                            <Grid container>
                              <Typography className={classes.font} style={{ color: '#000000' }}>
                                {detail.productDescription}
                              </Typography>
                            </Grid>
                            <Grid container direction="row" justify="space-between">
                              <Grid item xl={7} lg={7} md={7} sm={7} direction="column">
                                {(detail.brand !== undefined) ?
                                  <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                                    Marca: {detail.brand}
                                  </Typography>
                                  :
                                  ''
                                }
                                <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                                  Talla: {detail.size} MX
                              </Typography>
                                <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                                  Cantidad: {detail.quantity}
                                </Typography>

                              </Grid>

                            </Grid>

                          </Grid>

                          <Grid item xl={5} lg={5} md={5} sm={5} container alignContent="flex-end" direction="column">
                            <Typography className={classes.font} >
                              ${Utils.numberWithCommas(Number(detail.subtotal).toFixed(2))}
                            </Typography>
                            {/* <Typography className={classes.font, classes.tachado} style={{ color: 'rgba(0, 0, 0, 0.54)' }} >
                              ${Utils.numberWithCommas(Number(detail.subtotal).toFixed(2))}
                            </Typography> */}
                            <Typography align={'right'} className={classes.littleFont} style={{ color: 'rgba(0, 0, 0, 0.54)' }}  >
                              Subtotal
                            </Typography>

                          </Grid>
                          {
                            (this.state.orders.shippingMethodId !== 4) ?
                              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                <Typography variant="body1" style={{ marginBottom: 16 }}>Estatus del pedido:</Typography>
                                <ProgressBar
                                  steps={[(this.state.orders.paymentMethodId === 1) ? detail.orderStatus.steps : detail.orderStatus.steps]}
                                  step={detail.orderStatus.current}
                                  style={{ fontSize: 13, color: 'rgba(0, 0, 0, 0.3)' }}
                                />
                                {
                                  (this.state.orders !== undefined && this.state.orders !== null && this.state.orders.enviaInformation !== undefined && this.state.orders.enviaInformation !== null && this.state.orders.enviaInformation.trackUrl !== undefined && this.state.orders.enviaInformation.trackUrl !== null) ?
                                    <Button variant="contained" style={{ height: 36, width: '100%', background: '#0074FF', color: 'white', marginTop: '15px' }} target='_blank' href={this.state.orders.enviaInformation.trackUrl} >
                                      Rastrear pedido
                                    </Button>
                                    :
                                    ''

                                }
                              </Grid>
                              :
                              <Button variant="contained" style={{ height: 36, width: '100%', background: 'green', color: 'white' }} onClick={() => {
                                window.location.href = "/calzzamovil/" + this.state.orders.order
                              }}>
                                SEGUIR ENTREGA EN VIVO
                            </Button>
                          }
                        </Grid>
                      </Grid>
                    )
                  })}
                </Grid>
              </Grid>
            </Grid>
            :
            <Grid item xl={9} lg={9} md={9} sm={9} xs={8} container direction="row" justify="space-between">
              <Grid style={{ display: 'flex', justifyContent: 'center' }} item xl={9} lg={9} md={9} sm={9} xs={10} container direction="column">
                <Hidden xsDown>
                  <div style={{ color: 'red!important' }} >
                    {
                      (order.calzzapatoCode) ?
                        <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                          Folio: {order.calzzapatoCode}
                        </Typography>
                        :
                        <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                          Folio: {order.order}
                        </Typography>
                    }
                    <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                      Fecha: {dateFormat(order.deliveryDate, "dddd d")} de {dateFormat(order.deliveryDate, "mmmm")}
                    </Typography>
                    {(order.quantity === 1) ?
                      <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                        Pedido de 1 producto
                  </Typography>
                      :
                      <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                        Pedido de {order.quantity} productos
                  </Typography>
                    }
                    <Typography className={classes.fontTotal} style={{ color: '#000000' }}>
                      Total: <span style={{ color: 'green', fontWeight: 200 }}>${Utils.numberWithCommas(Number(order.total).toFixed(2)) + ' M.N.'}</span>
                    </Typography>
                  </div>
                  {/*
                <Typography className={classes.fontDate} style={{color: '#000000'}}>
                  Entrega estimada {dateFormat(order.deliveryDate, "dddd d")} de {dateFormat(order.deliveryDate, "mmmm")}
                </Typography>
                */}
                  {
                    /*
                    <Typography className={classes.font} style={{color: '#283a78', marginBottom: 16}}>
                      Seguimiento del envío
                    </Typography>
                    */
                  }
                </Hidden>
                {/* responsive */}
                <Hidden smUp>
                  {
                    (order.calzzapatoCode) ?
                      <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                        Folio: {order.calzzapatoCode}
                      </Typography>
                      :
                      <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                        Folio: {order.order}
                      </Typography>
                  }
                  <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                    Fecha: {dateFormat(order.deliveryDate, "dddd d")} de {dateFormat(order.deliveryDate, "mmmm")}
                  </Typography>
                  {(order.quantity === 1) ?
                    <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                      Pedido de 1 producto
                    </Typography>
                    :
                    <Typography className={classes.font} style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                      Pedido de {order.quantity} productos
                  </Typography>
                  }
                  <Typography className={classes.fontTotal} style={{ color: '#000000' }}>
                    Total <span style={{ color: 'green', fontWeight: 200 }}>${Utils.numberWithCommas(Number(order.total).toFixed(2)) + ' M.N'}</span>
                  </Typography>
                  {/*
                <Typography className={classes.font} style={{color: '#283a78', marginBottom: 16}}>
                  Seguimiento del envío
                </Typography>
                */}
                </Hidden>
              </Grid>
              <Hidden xsDown>
                <Grid item xl={3} lg={3} md={3} sm={3} container justify="flex-end">
                  <Grid item>
                    <Button style={{ borderRadius: '50px', padding: '10px' }} variant='outlined' color="primary" size="small" onClick={() => { this.getDetail(order.order) }}>
                      {/* <Button style={{ borderRadius: '50px', padding: '10px' }} variant='outlined' color="primary" size="small" onClick={() => { this.getDetail() this.setState({ expanded: true })}}> */}
                      VER DETALLE
                  </Button>
                  </Grid>
                </Grid>
              </Hidden>
              {/* <Hidden smDown>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="body1" style={{ marginBottom: 16 }}>Estatus del pedido:</Typography>
                <ProgressBar
                  steps={[(order.paymentMethod.id === 1) ? [order.productsSteps[0].steps] : order.productsSteps[0].steps]}
                  step={order.orderStatus}
                  style={{fontSize: 13, color: 'rgba(0, 0, 0, 0.3)'}}
                />
              </Grid>
            </Hidden> */}
              <Hidden smUp>
                <Grid item sm={2} xs={2} container alignContent="center" justify="flex-end">
                  <IconButton onClick={() => {
                    this.getDetail(order.order)
                  }}>
                    <Icon>
                      <img height="24" width="24" src="/icon-arrow.svg" alt="" />
                    </Icon>
                  </IconButton>
                </Grid>
              </Hidden>
            </Grid>
          }
          {/* <Hidden smUp>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Typography variant="body1" style={{ marginBottom: 16 }}>Estatus del pedido:</Typography>
              <ProgressBar
                steps={[(order.paymentMethod.id === 1) ? [order.productsSteps[0].steps] : order.productsSteps[0].steps]}
                step={order.orderStatus}
                style={{fontSize: 11, color: 'rgba(0, 0, 0, 0.3)'}}
              />
            </Grid>
          </Hidden> */}

        </Grid>
      </div>
    )
  }
}


const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(OrderDetail)
