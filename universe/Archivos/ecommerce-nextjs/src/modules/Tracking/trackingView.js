import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'

//Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography } from '@material-ui/core'
//import Router from 'next/router'

//Utils
import Utils from '../../resources/Utils'
import { requestAPI } from '../../api/CRUD'

//Components
import Empty from '../../components/Empty'
import TrackingExpress from '../../components/TrackingExpress'
import TrackingHomeOrder from '../../components/TrackingHomeOrder'
import TrackingClickAndCollect from '../../components/TrackingClickAndCollect'

const styles = theme => ({
  container: {
    width: "90%",
    margin: "0 auto",
    paddingTop: 36,
    [theme.breakpoints.down("md")]: {
      paddingTop: 36,
      width: "95%",

    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      paddingTop: 5,
    },
    paddingBottom: 64,
  },

  containerMainInfo: {
    padding: '15px'
  },
  title: {
    [theme.breakpoints.down("xs")]: {
      marginTop: '30px',
      marginLeft: '20px'
    },
  }

})

class TrackingView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      order: null,
      ordersLoaded: false,
      isClickAndCollect: false,
      emptyTitle: '¡Sin pedidos!',
      emptyDescription: 'No hay pedidos para mostrar.'
    }

    //this.getOrders = this.getOrders.bind(this)
  }

  async componentWillMount() {
    const { order } = this.props
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      if (order !== undefined && order !== null && order.shippingMethods !== null && order.shippingMethods !== undefined && order.shippingMethods.length > 0 && order.shippingMethods[0].shippingMethodId === 3) {
        this.setState({
          order: order,
          isClickAndCollect: true,
          ordersLoaded: true
        })
      } else if (order !== undefined) {
        this.setState({
          order: order,
          ordersLoaded: true
        })
      }
    }
  }


  // async getOrders() {

  //   const { folioBuscar } = this.props

  //   this.setState({
  //     ordersLoaded: true
  //   })

  //   let response = await requestAPI({
  //     host: Utils.constants.CONFIG_ENV.HOST,
  //     method: 'GET',
  //     resource: 'orders',
  //     endpoint: `/${folioBuscar}/detail-information`
  //   })
  //   console.log(response.data, "LA ORDEN PA");
  //   this.setState({
  //     ordersLoaded: false,
  //     order: response.data
  //   })

  // }

  render() {

    const { classes } = this.props
    const { order } = this.state
    return (
      <div>
        {
          (this.state.ordersLoaded) ?
            (order !== null && order !== undefined && order.information !== null && order.information !== undefined && order.shippingMethods !== null && order.shippingMethods !== undefined && order.shippingMethods !== []) ?
              <Grid container className={classes.container}>
                <Grid item md={12} xs={12} className={classes.title} >
                  <Typography variant="h5">Rastrear pedido</Typography>
                </Grid>
                {/* Product Cards */}
                {
                  <Grid item xs={12} style={{ marginTop: '15px' }} >
                    <Grid container>
                      <Grid item lg={4} md={12} xs={12} className={classes.containerMainInfo} style={{ height: 'fit-content' }}  >
                        <Grid container>
                          <Grid item xs={12} className={classes.containerMainInfo} style={{ background: 'white', paddingBottom: '20px', borderRadius: '6px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)', }}  >
                            <Grid container>
                              <Grid item xs={12}>
                                <Typography variant='h6'>Tu pedido</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant='subtitle1' style={{ fontWeight: 'bold', marginTop: '10px' }} >Folio</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant='subtitle1'>{order.information.folio}</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant='subtitle1' style={{ fontWeight: 'bold', marginTop: '10px' }} >Fecha de compra</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant='subtitle1'>{String(order.information.createdAt).charAt(0).toUpperCase() + (order.information.createdAt).slice(1)}</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant='subtitle1' style={{ fontWeight: 'bold', marginTop: '10px' }} >Método de pago</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant='subtitle1'>{order.information.paymentName}</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant='subtitle1' style={{ fontWeight: 'bold', marginTop: '10px' }} >Método de envío</Typography>
                              </Grid>
                              {
                                order.shippingMethods.map((method, idx) => (
                                  <Grid item xs={12} key={idx}>
                                    {
                                      (this.state.isClickAndCollect)
                                        ? <Typography variant='subtitle1'>
                                          {`${method.shippingMethodName}`}
                                        </Typography>
                                        : <Typography variant='subtitle1'>
                                          {`${method.shippingMethodName} ($${Utils.numberWithCommas(method.shippingCost)})`}
                                        </Typography>
                                    }

                                  </Grid>
                                ))
                              }

                              {
                                (this.state.isClickAndCollect) ? null :
                                  <>
                                    <Grid item xs={12}>
                                      <Typography variant='subtitle1' style={{ fontWeight: 'bold', marginTop: '10px' }} >Dirección de entrega</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Typography variant='subtitle1'>{order.information.address.locationType + ' ' + order.information.address.location}</Typography>
                                      <Typography variant='subtitle1'>{order.information.address.street + ' #' + order.information.address.exteriorNumber}</Typography>
                                      <Typography variant='subtitle1'>{order.information.address.municipality + ' ' + order.information.address.state + ' C.P.' + order.information.address.zip}</Typography>
                                    </Grid>
                                  </>

                              }
                              <Grid item xs={12}>
                                <Typography variant='subtitle1' style={{ fontWeight: 'bold', marginTop: '10px' }} >Total de compra</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant='subtitle1'>${Utils.numberWithCommas(order.information.total)}</Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item lg={8} md={12} xs={12} className={classes.containerMainInfo} >
                        <Grid container>
                          <Grid item xs={12} style={{}}  >
                            <Grid container>
                              {
                                order.shippingMethods.map((shipType, idx) => {
                                  if (shipType.shippingMethodId === 1 || shipType.shippingMethodId === 2) {
                                    return (
                                      <Grid item key={idx} xs={12} style={{ marginBottom: '20px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)', }}  >
                                        <TrackingHomeOrder order={order} data={shipType} />
                                      </Grid>
                                    )
                                  } else if (shipType.shippingMethodId === 3) {
                                    return (
                                      <Grid item key={idx} xs={12} style={{ marginBottom: '20px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)', }}  >
                                        <TrackingClickAndCollect orderTotrack={order} data={shipType} />
                                      </Grid>
                                    )

                                  } else {
                                    return (
                                      <Grid item key={idx} xs={12} style={{ marginBottom: '20px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)', }}  >
                                        <TrackingExpress data={shipType} order={order} ></TrackingExpress>
                                      </Grid>
                                    )
                                  }
                                })
                              }
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>

                    </Grid>
                  </Grid>
                }
              </Grid>
              :
              <Grid container className={classes.loading} >
                <Grid item xs={12} style={{ height: '60vh', margin: '0 auto',  marginBottom: '50px', display:'flex', alignItems: 'center' }}>
                  <Grid container style={{ display:'flex', justifyContent: 'center', alignItems:'center' }}>
                    <Grid item xs={12} style={{ display:'flex', justifyContent: 'center', alignItems:'center' }}>
                      <img src='/box.gif'></img>
                    </Grid>
                    <Grid item xs={12} style={{ display:'flex', justifyContent: 'center', alignItems:'center' }}>
                      <Typography variant='h3'>Folio no válido</Typography>
                    </Grid>
                    <Grid item xs={12} style={{ display:'flex', justifyContent: 'center', alignItems:'center' }}>
                      <Typography variant='body1'>Intenta otro folio de pedido.</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            :
            <Grid container className={classes.loading} >
              <div style={{ width: '100%', marginBottom: 32 }}>
                <Empty
                  isLoading={true}
                  title="Cargando..."
                  description="Espera un momento por favor."
                />
              </div>
            </Grid>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(TrackingView)