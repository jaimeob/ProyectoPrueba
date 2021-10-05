import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Paper, Hidden } from '@material-ui/core'

// Components
import QuantityControl from './QuantityControl'
import { requestAPI } from '../api/CRUD'

// Utils
import Utils from '../resources/Utils'
import ItemCheckout from './ItemCheckout'
import ShippingIcons from './ShippingIcons'
import CarrierComponent from './CarrierComponent'

import { updateShippingMethod } from '../actions/actionCheckout'
import Router from 'next/router'

const styles = theme => ({
  addressText: {
    fontSize: '10px',
    marginLeft: '8px',
    color: '#828282'
  },
  card: {
    padding: theme.spacing(2),
    marginTop: '10px',
    marginRight: '10px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    display: 'block',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dinamicText: {
    color: '#243b7a',
    fontWeight: '600'

  },
  productImage: {
    width: '100%',
    cursor: 'pointer'
  },
  productNameNew: {
    fontSize: '14px',
    color: '#111110',
    lineHeight: '1.5em',
    height: '3em',
    overflow: 'hidden',
    fontWeight: 'bold',
    //whiteSpace: 'nowrap',
    //textOverflow: 'ellipsis',
    width: '100%',
    [theme.breakpoints.down("xs")]: {
      fontSize: '14px',
    }
  },
  productSize: {
    fontSize: '12px',
    color: '#808080',
    [theme.breakpoints.down("xs")]: {
      fontSize: '12px',
    }
  },
  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'black',
  },
  shippingText: {
    fontSize: '12px',
    fontWeight: '600',
    marginLeft: '8px'
  },

})
class ProductCheckout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageWorking: true,
      shippingMethods: [
        { id: 1, name: 'Envío a domicilio', image: '/envio1.svg', imageSelected: '/envio1-selected.svg', selected: true },
        { id: 2, name: 'Click & collect', image: '/click-collect.svg', imageSelected: '/click-collect-selected.svg', selected: false },
        { id: 3, name: 'Envío express', image: '/envio-express.svg', imageSelected: '/envio-express-selected.svg', selected: false },
      ],
      carriers: [
        { id: 1, price: '90', img: '/amex.png', selected: true },
        { id: 2, price: '120', img: '/amex.png', selected: false },
        { id: 3, price: '205', img: '/amex.png', selected: false },
      ],
      changeShippingMethod: false
    }

    this.changeShippingMethod = this.changeShippingMethod.bind(this)
  }

  changeShippingMethod(id) {
    let shippingMethods = this.state.shippingMethods
    shippingMethods.forEach(method => {
      if (method.id === id && id !== 2) {
        method.selected = true
      } else {
        method.selected = false
      }
    })
    // if (id === 2) {
    //   this.props.openClickAndCollectModal()
    // }
    this.setState({
      shippingMethods: shippingMethods
    })
    this.props.handleChangeShippingMethod(id)
    if (id === 2) {
      this.props.handleChangeClickCollect(this.props.shippingMethods[1].stores)
    }

  }


  componentWillMount() {
    if (this.props.shippingMethods !== null && this.props.shippingMethods !== undefined && this.props.shippingMethods.length > 0) {
      let expressDeliveryIndex = this.props.shippingMethods.findIndex(element => element.id === 3)
      let carriers = []
      if (expressDeliveryIndex !== -1) {
        carriers = this.props.shippingMethods[expressDeliveryIndex].carriers
      }
      this.setState({ shippingMethods: this.props.shippingMethods, carriers: carriers })
    }
  }

  render() {
    const { classes } = this.props
    const self = this

    return (
      <div>
        <Paper elevation={0} style={{ position: 'relative' }} className={(this.props.verification !== true) ? classes.card : ''}>
          <Grid container>
            <Grid item lg={2} sm={2} xs={3} style={{ display: 'flex', alignItems: 'center' }} >
              {
                (this.state.imageWorking) ?
                  <div>
                    <img onClick={(this.props.url !== null && this.props.url !== undefined) ? () => { Router.push(this.props.url) } : ''} className={classes.productImage} src={this.props.image} onError={() => { this.setState({ imageWorking: false }) }}  ></img>
                  </div>
                  :
                  <img onClick={(this.props.url !== null && this.props.url !== undefined) ? () => { Router.push(this.props.url) } : ''} style={{ width: '90%' }} src={'/placeholder.svg'} alt=" " />
              }
            </Grid>

            {/* Web View */}

            <Grid item sm={4} xs={9} style={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }} >
              <div>
                <Typography className={classes.productNameNew} >{this.props.name}</Typography>
                <Typography variant='body2' className={classes.productSize} >Código: {this.props.code}</Typography>
                <Typography variant='body2' className={classes.productSize} >Talla: <span style={{ fontWeight: '600', color: 'black' }} > {this.props.size} </span></Typography>
                <Typography variant='body2' className={classes.productSize} >Cantidad: <span style={{ fontWeight: '600', color: 'black' }} > {this.props.quantity} </span></Typography>
              </div>
            </Grid>

            <Grid item sm={6} xs={12} style={{ display: 'flex' }} >
              <Grid container >
                {
                  (this.props.shippingMethods !== null && this.props.shippingMethods !== undefined && this.props.shippingMethods.length > 0)?
                  this.props.shippingMethods.map((shippingMethod, idx) => {
                    return (<ShippingIcons
                      data={shippingMethod}
                      changeShippingMethod={() => { this.changeShippingMethod(shippingMethod.id) }}
                    ></ShippingIcons>
                    )
                  })
                  :
                  ''
                }
                {/* Shipping Methods */}
                {
                  (this.props.shippingMethod === 1) ?
                    <Grid item xs={12}>
                      <Typography style={{ color: this.props.shippingDayColor }} variant='body2' className={classes.shippingText} >Días estimados de entrega {this.props.shippingDay} </Typography>
                    </Grid>
                    :
                    (this.props.shippingMethod === 2 && this.props.store) ?
                      <Grid item xs={12}>
                        <Typography variant='body2' className={classes.shippingText} >Recoger en tienda:  <span className={classes.dinamicText} >{this.props.store}</span> </Typography>
                        <Typography variant='body2' className={classes.addressText} >{this.props.addressStore}</Typography>
                      </Grid>
                      :
                      (this.props.shippingMethod === 3) ?
                        <Grid item xs={12}>
                          {
                            (this.state.carriers !== null && this.state.carriers !== undefined && this.state.carriers.length > 0 && this.state.carriers[0].calzzamovil) ?
                              <Grid container>
                                <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }} >
                                  <img style={{ width:'70%' }} src='/calzzamovil.png'></img>
                                </Grid>
                              </Grid>

                              :
                              <Grid container>
                                <Grid item xs={12}>
                                  <Typography variant='body2' className={classes.shippingText} >Seleccione una paquetería</Typography>
                                </Grid>

                                <Grid item xs={12} >
                                  <Grid style={{ marginLeft: '1px', marginTop: '10px', display:'flex', alignItems: 'center' }} container spacing={1} >
                                    {
                                      this.state.carriers.map((carrier, idx) => {
                                        return (<Grid item xs={4}>
                                          <CarrierComponent
                                            urlImage={carrier.urlImage}
                                            price={carrier.totalPrice}
                                            selected={(carrier.selected !== null && carrier.selected !== undefined)? carrier.selected : false}
                                            changeCarrier={()=>{ this.props.changeCarrier(carrier.carrier) }}
                                          ></CarrierComponent>
                                        </Grid>
                                        )
                                      })
                                    }
                                  </Grid>
                                </Grid>
                                <Grid item xs={12} style={{ marginTop: '10px' }} >
                                  <Typography variant='body2' className={classes.shippingText}> {this.props.shippingDay.description} </Typography>
                                </Grid>
                              </Grid>
                          }
                        </Grid>
                        :
                        ''
                }
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </div>
    )
  }
}
const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = dispatch => {
  return {
    updateShippingMethod: (checkout) => {
      dispatch(updateShippingMethod(checkout))
    }
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(ProductCheckout)
