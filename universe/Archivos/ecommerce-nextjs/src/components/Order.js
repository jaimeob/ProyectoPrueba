import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import compose from 'recompose/compose'
import dateFormat from 'dateformat'
import Slider from "react-slick";
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Hidden, IconButton, ButtonBase, SvgIcon} from '@material-ui/core'

// Components
import ProgressBar from './ProgressBar'

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
  root:{
    marginBottom: 72,
    [theme.breakpoints.down('xs')]: {
      marginBottom: 40
    }
  },
  date: {
    fontSize: 18,
    fontWeight: 500,
    [theme.breakpoints.down('sm')]: {
      fontSize: 16
    }
  },
  cardContainer: {
    width: '100%',
    overflow: 'auto',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginTop: 16,
    padding: 24,
    [theme.breakpoints.down('xs')]: {
      padding: '16px 0px 16px 16px'
    }
  },
  imageContainer: {
    float: 'left', 
    width: '25%',
    paddingRight: 24,
    [theme.breakpoints.down('xs')]: {
      paddingRight: 16
    }
  },
  containers: {
    paddingRight: 24,
    [theme.breakpoints.down('xs')]: {
      paddingRight: 16
    }
  },
  text: {
    fontSize: 16,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  },
  dateText: {
    fontSize: 18,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  },
  button: {
    width: 128,
    height: 42,
    border: 'solid 2px #283a78',
    borderRadius: 3,
    color: '#283a78',
    fontSize: 16,
    fontWeight: 500,
    [theme.breakpoints.down('sm')]: {
      width: 96,
      height: 34,
      fontSize: 12,
      fontWeight: 400
    }
  }
})

class Order extends Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
  }

  componentDidMount() {
    this.updateWindowDimensions()
    window.addEventListener('resize', this.updateWindowDimensions)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions)
  }

  updateWindowDimensions() {
    if (window.innerWidth < 600) {
      this.setState({ expanded: false })
    }
  }


  render() {
    const { classes, order } = this.props
    
    let desktopSettings = {
      dots: true,
      arrows: false,
      infinite: true,
      speed: 500,
      slidesToScroll: 1,
      slidesToShow: 1,
      appendDots: dots => {
        return <ul style={{ overflow: 'auto', margin: '0px 0px 16px 0px' }}>{dots}</ul>;
      }
    }

    let movilSettings = {
      arrows: false,
      infinite: true,
      speed: 500,
      slidesToScroll: 1,
      slidesToShow: 1
    }

    return (
      <Grid container className={classes.root}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <Hidden xsDown>
            <Typography variant="body1" className={classes.date}>
              Fecha de compra: {dateFormat(order.shoppingDate, "d")} de {dateFormat(order.shoppingDate, "yyyy")} de {dateFormat(order.shoppingDate, "mmmm")}| Número de pedido: {order.order}
            </Typography>
          </Hidden>
          <Hidden smUp>
            <Typography variant="body1" className={classes.date}>
              Fecha de compra: {dateFormat(order.shoppingDate, "d")} de {dateFormat(order.shoppingDate, "yyyy")} de {dateFormat(order.shoppingDate, "mmmm")}
            </Typography>
          </Hidden>
        </Grid>
          <div className={classes.cardContainer}>
            {
              (this.state.expanded === false)?
                <div className={classes.imageContainer}>
                  <Hidden smUp>
                    <Slider {...movilSettings}>
                      {
                        (order.orderDetail.length > 0) ?
                          order.orderDetail.map((detail, index) => {
                            return (
                              <img key={index} src={detail.image} style={{width: 'auto', maxWidth: '100%', height: 'auto'}}/>
                            )
                          })
                          :
                          ''
                      }
                    </Slider>
                  </Hidden>
                  <Hidden xsDown>
                    <Slider {...desktopSettings}>
                      {
                        (order.orderDetail.length > 0) ?
                          order.orderDetail.map((detail, index) => {
                            return (
                              <img key={index} src={detail.image} style={{width: 'auto', maxWidth: '100%', height: 'auto'}}/>
                            )
                          })
                          :
                          ''
                      }
                    </Slider>
                  </Hidden>
                  
                </div>
              :
               ''
            }
            <div style={{overflow: 'hidden', height: '100%'}}>
              {
                (this.state.expanded === false)?
                  <div style={{height: 'inherit'}}>
                    <Hidden xsDown>
                      <div style={{width: '100%'}}>
                        <div style={{width: 'auto', float: 'right'}}>
                          <ButtonBase className={classes.button} onClick={() => this.setState({expanded: true})}>
                            VER DETALLE
                          </ButtonBase>
                        </div>
                        <div className={classes.containers} style={{overflow: 'hidden'}}>
                          {
                            (order.orderDetail.length === 1)? 
                              <Typography className={classes.text} style={{color: 'rgba(0, 0, 0, 0.54)'}}>
                                1 Producto
                              </Typography>
                            :
                              <Typography className={classes.text} style={{color: 'rgba(0, 0, 0, 0.54)'}}>
                                {order.orderDetail.length} Productos
                              </Typography>
                          }
                          {
                            (order.shippingMethod.id !== 4) ?
                            <>
                            <Typography className={classes.dateText} style={{color: '#000000'}}>
                              Llega el {dateFormat(order.deliveryDate, "dddd d")} de {dateFormat(order.deliveryDate, "mmmm")}
                            </Typography>
                            <Typography className={classes.text} style={{color: '#283a78', marginBottom: 16}}>
                              Seguimiento del envío
                            </Typography>
                            <ProgressBar
                              steps={['Pagado', 'Procesado', 'Preparado', 'Enviado', 'Entregado']}
                              step={2}
                              style={{fontSize: 14, color: 'rgba(0, 0, 0, 0.54)'}}
                            />
                            </>
                            :
                            ''
                          }
                        </div>
                      </div>
                    </Hidden>
                      
                    <Hidden smUp>
                      <div style={{width: '100%', height: 'inherit'}}>
                        <div style={{display: 'flex', float: 'right', height: 'inherit', alignContent: 'center'}}>
                          <IconButton>
                            <SvgIcon style={{color: '#000000'}}>
                              <path fill="#000" d="M19.71 11.286l-4-3.996c-.093-.093-.204-.167-.326-.218-.122-.05-.252-.076-.384-.076s-.262.026-.384.076-.233.125-.326.218-.167.203-.218.325c-.05.122-.076.252-.076.384s.026.262.076.384.125.232.218.325l2.3 2.288H5c-.265 0-.52.105-.707.293-.188.187-.293.441-.293.706 0 .265.105.52.293.706.187.188.442.293.707.293h11.59l-2.3 2.288c-.094.093-.168.203-.219.325-.05.122-.077.252-.077.384s.026.262.077.384c.05.122.125.233.219.325.093.094.204.168.325.219.122.05.253.077.385.077s.263-.026.385-.077c.121-.05.232-.125.325-.219l4-3.996c.091-.095.162-.207.21-.33.1-.243.1-.515 0-.759-.048-.122-.119-.234-.21-.33z"/>
                            </SvgIcon>
                          </IconButton>
                        </div>
                        <div className={classes.containers} style={{overflow: 'hidden'}}>
                          <Typography className={classes.text} style={{color: '#26a446'}}>
                            {order.orderState.name}
                          </Typography>
                          {
                            (order.orderDetail.length === 1)? 
                              <Typography className={classes.text} style={{color: '#000'}}>
                                1 Producto
                              </Typography>
                            :
                              <Typography className={classes.text} style={{color: '#000'}}>
                                {order.orderDetail.length} Productos
                              </Typography>
                          }
                          <Typography className={classes.dateText} style={{color: 'rgba(0, 0, 0, 0.54)'}}>
                            Entrega: {dateFormat(order.deliveryDate, "d/mmmm/yyyy")}
                          </Typography>
                        </div>
                      </div>
                    </Hidden>
                  </div>
                :
                  <div style={{width: '100%'}}>
                    <div style={{width: 'auto', float: 'right'}}>
                        <ButtonBase className={classes.button} onClick={() => this.setState({expanded: false})}>
                          CERRAR
                        </ButtonBase>
                      </div>
                    <div style={{width: '100%', marginBottom: 24}}>
                      <Typography style={{fontSize: 18, color: '#000000'}}>
                        <strong>Tu pedido</strong>
                      </Typography>
                    </div>
                    <div style={{display: 'inline-block', width: 'auto', paddingRight: 40}}>
                      <Typography className={classes.text} style={{color: '#000000'}}>
                        Pedido 
                      </Typography>
                      <Typography className={classes.text} style={{color: 'rgba(0, 0, 0, 0.54)'}}>
                        #{order.order} 
                      </Typography>
                    </div>
                    <div style={{display: 'inline-block', width: 'auto'}}>
                      <Typography className={classes.text} style={{color: '#000000'}}>
                        Metodo de pago 
                      </Typography>
                      <Typography className={classes.text} style={{color: 'rgba(0, 0, 0, 0.54)'}}>
                        {order.paymentMethod.name} 
                      </Typography>
                    </div>
                    <div style={{width: '100%', marginTop: 24, marginBottom: 24}}>
                      <Typography style={{fontSize: 18, color: '#000000'}}>
                        <strong>Tu envío</strong>
                      </Typography>
                    </div>

                    <div style={{width: '100%', marginTop: 24, marginBottom: 24}}>
                      <div style={{display: 'inline-block', width: '50%', paddingRight: 24, verticalAlign: 'top'}}>
                        <Typography className={classes.text} style={{color: '#000000'}}>
                          Entrega 
                        </Typography>
                        <Typography className={classes.text} style={{color: 'rgba(0, 0, 0, 0.54)'}}>
                          Llega el {dateFormat(order.deliveryDate, "dddd d")} de {dateFormat(order.deliveryDate, "mmmm")}
                        </Typography>
                      </div>
                      <div style={{display: 'inline-block', width: 'auto', verticalAlign: 'top'}}>
                        <Typography className={classes.text} style={{color: '#000000'}}>
                          Metodo de envío 
                        </Typography>
                        <Typography className={classes.text} style={{color: 'rgba(0, 0, 0, 0.54)'}}>
                          {order.shippingMethod.name} 
                        </Typography>
                      </div>
                    </div>

                    <div style={{width: '100%', marginTop: 24}}>
                      <div style={{display: 'inline-block', width: '50%', paddingRight: 24, verticalAlign: 'top'}}>
                        {
                          (order.shippingMethod.id !== 4) ?
                          <>
                          <Typography className={classes.text} style={{color: '#000000'}}>
                            Estado 
                          </Typography>
                          <ProgressBar
                            steps={['Pagado', 'Procesado', 'Preparado', 'Enviado', 'Entregado']}
                            step={2}
                            style={{fontSize: 14, color: 'rgba(0, 0, 0, 0.54)'}}
                          />
                          </>
                          :
                          ''
                        }
                      </div>
                      <div style={{display: 'inline-block', width: 'auto', verticalAlign: 'top'}}>
                        <Typography className={classes.text} style={{color: '#000000'}}>
                          Dirección de envío 
                        </Typography>
                        <Typography className={classes.text} style={{width: '100%', color: 'rgba(0, 0, 0, 0.54)'}}>
                          {order.address.name}
                        </Typography>
                        <Typography className={classes.text} style={{width: '100%', color: 'rgba(0, 0, 0, 0.54)'}}>
                          {order.address.street} {order.address.exteriorNumber}, {order.address.locationZone} {order.address.locationName}
                        </Typography>
                        <Typography className={classes.text} style={{width: '100%', color: 'rgba(0, 0, 0, 0.54)'}}>
                          {order.address.municipalityName} {order.address.stateName}, México
                        </Typography>
                        <Typography className={classes.text} style={{width: '100%', color: 'rgba(0, 0, 0, 0.54)'}}>
                          #{order.address.zip} 
                        </Typography>
                      </div>
                      <div style={{width: '100%', marginBottom: 8}}>
                        {
                          (order.orderDetail.length === 1)? 
                            <Typography style={{fontSize: 18, color: '#000000'}}>
                              <strong>Tu producto</strong>
                            </Typography>
                          :
                            <Typography style={{fontSize: 18, color: '#000000'}}>
                              <strong>Tus productos</strong>
                            </Typography>
                        }
                      </div>
                      {
                        (order.orderDetail.map((detail, index) => {
                          return(
                            <div key={index} style={{display: 'inline-block', width: '100%', marginTop: 16}}>
                              <div className={classes.containers} style={{float: 'left', width: '25%'}}>
                                <img src={detail.image} style={{width: 'auto', maxWidth: '100%', height: 'auto'}}/>
                              </div>
                              <div style={{overflow: 'hidden'}}>
                                <div style={{width: '100%'}}>
                                  <div style={{display: 'inline-block', width: '75%'}}>
                                    <Typography className={classes.text} style={{color: '#000000'}}>
                                      {detail.productDescription} 
                                    </Typography>
                                    <div style={{display:'inline-block', float: 'left'}}>
                                      {
                                        (detail.brand != null)?
                                          <Typography className={classes.text} style={{color: 'rgba(0, 0, 0, 0.54)'}}>
                                            Marca: {detail.brand}
                                          </Typography>
                                        :
                                        ''
                                      }
                                      <Typography className={classes.text} style={{color: 'rgba(0, 0, 0, 0.54)'}}>
                                        Talla: {detail.size} MX
                                      </Typography>
                                    </div>
                                    <div style={{display:'inline-block', float: 'right'}}>
                                      <Typography className={classes.text} style={{color: 'rgba(0, 0, 0, 0.54)'}}>
                                        Cantidad: {detail.quantity}
                                      </Typography>
                                    </div>
                                  </div>
                                  <div style={{display: 'inline-block', float: 'right'}}>
                                    <Typography className={classes.text} style={{color: '#000000'}}>
                                      ${detail.total}
                                    </Typography>
                                    <Typography className={classes.text} style={{textDecoration: 'line-through',color: 'rgba(0, 0, 0, 0.54)'}}>
                                      ${detail.subtotal}
                                    </Typography>
                                  </div>
                                  
                                </div>
                              </div>
                            </div>
                          )
                        }))
                      }
                    </div>
                  </div>
              }
            </div>
        </div>
      </Grid>
    )
  }
}

export default compose(
  
  withStyles(styles),
)(Order)

