import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Paper, Button, Hidden, Card } from '@material-ui/core'

// Components
import QuantityControl from './QuantityControl'
import Line from './Line'
import { requestAPI } from '../api/CRUD'

// Utils
import Utils from '../resources/Utils'
import ItemCheckout from './ItemCheckout'

import { updateShippingMethod } from '../actions/actionCheckout'


const styles = theme => ({
  cantidad: {
    fontSize: '16px',
    [theme.breakpoints.down("xs")]: {
      fontSize: '14px',
    }
  },
  card: {
    padding: theme.spacing(2),
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)'
  },
  colorGray: {
    color: '#808080'
  },

  containerItemSelected: {
    margin: '5px',
    padding: '16px 16px 16px',
    borderRadius: '4px',
    border: 'solid 1px rgba(0, 131, 224, 0.35)',
    background: '#f7f8f9',
  },
  containerItem: {
    margin: '5px',
    padding: '16px 16px 16px',
    borderRadius: '4px',
    background: '#f7f8f9',
  },
  containerItemInfo: {
    margin: '5px',
    padding: '16px 16px 16px',
    borderRadius: '4px',
  },
  line: {
    marginBottom: '10px',
    marginTop: '17px',
  },
  lineContainerItem: {
    marginTop: '15px',
    paddingLeft: '7px',
    paddingRight: '7px'

  },
  productInformationContainer: {

  },
  productColor: {
    fontSize: '16px',
    color: '#808080',
    [theme.breakpoints.down("xs")]: {
      fontSize: '14px',
    }
  },
  productEdit: {
    border: 'none',
    background: 'none',
    color: '#006fb9',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0px'
  },
  productImage: {
    height: '72px',
    width: '72px',
    [theme.breakpoints.down("xs")]: {
      height: '66px',
      width: '66px',
    }
  },
  productName: {
    fontSize: '18px',
    [theme.breakpoints.down("xs")]: {
      fontSize: '16px',
    }
  },
  productSize: {
    fontSize: '16px',
    color: '#808080',
    [theme.breakpoints.down("xs")]: {
      fontSize: '14px',
    }
  },
  price: {
    fontSize: '16px',
    fontWeight: 'normal',
    color: '#808080',
    [theme.breakpoints.down("md")]: {
      fontSize: '14px',
    }
  },
  priceNumber: {
    textDecoration: 'line-through'
  },
  oferta: {
    fontSize: '16px',
    [theme.breakpoints.down("md")]: {
      fontSize: '14px',
    }
  },
  subtotalCheckout: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '20px'

  },
  total: {
    fontSize: '16px',
    fontWeight: '500',
    [theme.breakpoints.down("md")]: {
      fontSize: '14px',
    }
  }
})

class ProductCart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageWorking: true,
      shippingMethods: [],
      changeShippingMethod: false
    }

    this.changeQuantity = this.changeQuantity.bind(this)
  }

  async changeQuantity(quantity) {
    if (quantity !== this.props.quantity && quantity !== 0 && quantity !== undefined && quantity !== null) {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'PATCH',
        resource: 'carts',
        endpoint: '/update',
        data: {
          product: this.props.code,
          size: this.props.size,
          quantity: quantity,
          article: this.props.article
        }
      })

      if (response.status === Utils.constants.status.SUCCESS && response.data.updated === true) {
        //await this.props.loading()
        await this.props.loadData()
      }
    }
  }
  async handleShippingMethod(code, id) {
    let shippingMethod = this.state.shippingMethods
    shippingMethod.forEach(element => {
      if (id === element.id) {
        element.selected = true
      } else {
        element.selected = false
      }
    })
    await this.setState({
      shippingMethods: shippingMethod
    })
    if (this.props.checkout !== null && this.props.checkout !== undefined && this.props.checkout.shippingMethodSelected !== undefined) {
      shippingMethod = this.props.checkout.shippingMethodSelected

      if (shippingMethod !== null && shippingMethod.some((element) => element.code === code)) {
        let foundIndex = shippingMethod.findIndex(element => element.code == code)
        shippingMethod[foundIndex].id = id
      } else if (shippingMethod !== null) {
        shippingMethod.push({ code, id })

      } else {
        shippingMethod = [{ code, id }]

      }
      await this.props.updateShippingMethod({ shippingMethod: shippingMethod })
      this.props.loadData()


    }
  }

  componentWillMount() {
    this.setState({
      shippingMethods: this.props.shippingMethod
    })
  }

  render() {
    const { classes } = this.props
    const self = this


    return (
      <div>
        <Paper elevation={0} className={(this.props.verification !== true) ? classes.card : ''}>
          <Grid container>
            <Grid container >
              <Grid item lg={2} md={2} sm={2} xs={4}>
                {
                  (this.state.imageWorking) ?
                    <img className={classes.productImage} src={this.props.image} onError={() => { this.setState({ imageWorking: false }) }}  ></img>
                    :
                    <img style={{ width: '90%' }} src={'/placeholder.svg'} alt=" " />
                }
                {
                  (this.props.verification !== true) ?
                    <button className={classes.productEdit} onClick={async () => await this.props.removeProductFromCart(this.props.number)} >
                      Eliminar
                    </button>
                    :
                    ''
                }
                {/* <Typography className={classes.productEdit} >Eliminar</Typography> */}
                {/* <Typography className={classes.productEdit} >Editar</Typography> */}
              </Grid>

              <Grid className={classes.productInformationContainer} item lg={10} md={10} sm={10} xs={8}>
                <Typography className={classes.productName} >{this.props.name}</Typography>
                <Typography variant='body2' className={classes.productSize} >Talla: {this.props.size}</Typography>
                <Typography variant='body2' className={classes.productColor} >Color: {this.props.color}</Typography>

                {
                  (this.props.verification === true) ?
                    ''
                    // <Typography className={classes.subtotalverification} >Subtotal: ${Utils.numberWithCommas(this.props.total.toFixed(0))}</Typography>
                    :
                    ''
                }


                <Hidden mdUp>
                  {/* Responsive */}
                  {
                    (this.props.verification !== true) ?
                      <Grid item xs={9} >
                        <Typography className={classes.cantidad} >Cantidad:</Typography>
                        <QuantityControl
                          data={{ quantity: this.props.quantity, available: this.props.available }}

                          changeQuantity={(quantity) => { self.changeQuantity(quantity) }}
                        />
                      </Grid>
                      :
                      ''
                  }
                </Hidden>

                {
                  (this.props.verification !== true) ?
                    <Hidden smDown>
                      {/* Desktop */}
                      <div className={classes.line}>
                        <Line color={'gray'} />
                      </div>

                      <Grid container >
                        {
                          (this.props.verification !== true) ?
                            <Grid item xs={7} >
                              <Typography className={classes.cantidad} >Cantidad:</Typography>
                              <QuantityControl
                                data={{ quantity: this.props.quantity, available: this.props.available }}
                                changeQuantity={(quantity) => { self.changeQuantity(quantity) }}
                              />
                            </Grid>
                            :
                            ''
                        }

                        <Grid item xs={5} container>

                          <Grid item xs={4}>
                            <Typography className={classes.price} >Precio</Typography>
                            <Typography className={(this.props.offer > 0) ? [classes.price, classes.priceNumber] : classes.price} >${Utils.numberWithCommas(this.props.price.toFixed(0))}</Typography>
                          </Grid>

                          <Grid item xs={4}>
                            <Typography className={classes.oferta} >Oferta</Typography>
                            <Typography className={classes.oferta} >${Utils.numberWithCommas(this.props.discountPrice.toFixed(0))}</Typography>
                          </Grid>

                          <Grid item xs={4}>
                            <Typography className={classes.total} >Total</Typography>
                            <Typography className={classes.total} >${Utils.numberWithCommas(this.props.total.toFixed(0))}</Typography>

                          </Grid>

                        </Grid>

                      </Grid>
                    </Hidden>
                    :
                    ''
                }

              </Grid>
            </Grid>
            {
              (this.state.changeShippingMethod === true && this.props.shippingMethod !== undefined && this.props.shippingMethod.length) ?
                <Grid item xs={12}>
                  <Grid container>
                    {
                      this.props.shippingMethod.map((item, idx) => {
                        return (
                          <Grid xs={12} className={(this.props.selected) ? classes.containerItemSelected : classes.containerItem} >
                            {/* Contenido */}
                            <ItemCheckout
                              selected={item.selected}
                              name={item.name}
                              description={item.description}
                              selectedFunction={() => { this.handleShippingMethod(this.props.code, item.id) }}

                            />
                          </Grid>
                        )
                      })
                    }


                  </Grid>
                </Grid>
                :
                ''
            }
            {
              (this.state.changeShippingMethod === false && this.props.shippingMethod !== undefined && this.props.shippingMethod.length) ?
                <Grid item xs={12}>
                  <Grid container>
                    {
                      this.props.shippingMethod.map((item, idx) => {
                        return (
                          (item.selected)?
                          <Grid xs={12} item >
                            <Typography variant='body1'>{ item.name }</Typography>
                            <Typography variant='body1'>{ item.description }</Typography>
                          </Grid>
                          :
                          ''
                        )
                      })
                    }


                  </Grid>
                </Grid>
                :
                ''
            }
            {
              <Grid item xs={12}>
                <Grid container>
                  <button className={classes.productEdit} onClick={ () => { this.setState({changeShippingMethod: !this.state.changeShippingMethod}) } } >
                    Cambiar
                  </button>
                </Grid>
              </Grid>
            }

            {
              (this.props.shippingMethod !== undefined && this.props.shippingMethod.length) ?
                <Grid item xs={12} className={classes.lineContainerItem} >
                  <Line />

                </Grid>
                :
                ''
            }


            {
              (this.props.verification !== true) ?
                <Hidden mdUp>
                  {/* Responsive */}
                  <Grid container>

                    <Grid item xs={12}>
                      <div className={classes.line}>
                        <Line color={'gray'} />
                      </div>
                    </Grid>

                    <Grid item xs={12} container>
                      <Grid item xs={10}>
                        <Typography className={classes.price} >Precio</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography align='right' className={(this.props.offer > 0) ? [classes.price, classes.priceNumber] : classes.price} >${Utils.numberWithCommas(this.props.price.toFixed(0))}</Typography>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} container>
                      <Grid item xs={10}>
                        <Typography className={classes.oferta} >Oferta</Typography>
                      </Grid>
                      <Grid item xs={2}>

                        <Typography align='right' className={classes.oferta} >${Utils.numberWithCommas(this.props.discountPrice.toFixed(0))}</Typography>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} container>
                      <Grid item xs={10}>
                        <Typography className={classes.total} >Total</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography align='right' className={classes.total} >${Utils.numberWithCommas(this.props.total.toFixed(0))}</Typography>
                      </Grid>
                    </Grid>

                  </Grid>

                </Hidden>
                :
                ''

            }
          </Grid>
        </Paper>
      </div>
    )
  }
}

// const mapStateToProps = state => ({ ...state })

// export default compose(
//   withStyles(styles),
//   connect(mapStateToProps, null)
// )(ProductCart)

const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = dispatch => {
  return {
    updateShippingMethod: (checkout) => {
      dispatch(updateShippingMethod(checkout))
    }
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(ProductCart)


