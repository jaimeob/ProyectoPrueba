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
import Router from 'next/router'

const styles = theme => ({
  cantidad: {
    fontSize: '16px',
    [theme.breakpoints.down("xs")]: {
      fontSize: '14px',
    }
  },
  card: {
    padding: theme.spacing(2),
    margin: 10,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    display: 'block',
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
  },
  changeSize: {
    cursor: 'pointer',
    color: '#49a7e9',
    fontSize: '13px',
    fontWeight: '600',
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
  discount: {
    color: '#57aa64',
    fontSize: '18',
    [theme.breakpoints.down("xs")]: {
      fontSize: '10px',
    }
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
    width: '100%',
    cursor: 'pointer'
  },
  productName: {
    fontSize: '18px',
    [theme.breakpoints.down("xs")]: {
      fontSize: '16px',
    }
  },
  productNameNew: {
    fontSize: '18px',
    color: '#111110',
    lineHeight: '1.5em',
    height: '1.5em',
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
    fontSize: '16px',
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
  priceNumber: {
    textDecoration: 'line-through',
    color: '#808080',
    [theme.breakpoints.down("xs")]: {
      fontSize: '10px',
    }

  },
  quitar: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    color: '#49a7e9',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    [theme.breakpoints.down("xs")]: {
      top: 'auto',
      right: 'auto'
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
class ProductCartNew extends Component {
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
        <Paper elevation={0} style={{ position: 'relative' }} className={(this.props.verification !== true) ? classes.card : ''}>
          <Hidden smDown >
            <div onClick={this.props.removeProduct} className={classes.quitar} style={(this.props.modalCart) ? { top: 'auto', bottom: '9px', left: '12px' } : {}}  >Quitar</div>
          </Hidden>
          <Grid container>
            <Grid item lg={2} sm={2} xs={3}>
              {
                (this.state.imageWorking) ?
                <div>
                  <img onClick={ (this.props.url !== null && this.props.url !== undefined)? ()=>{ Router.push(this.props.url) } : '' } className={classes.productImage} src={this.props.image} onError={() => { this.setState({ imageWorking: false }) }}  ></img>
                  <br></br>
                  <Hidden mdUp>
                    <div onClick={this.props.removeProduct} className={classes.quitar} style={(this.props.modalCart) ? { top: 'auto', bottom: '9px', left: '12px' } : {}}  >Quitar</div>
                  </Hidden>

                </div>
                  :
                  <img onClick={ (this.props.url !== null && this.props.url !== undefined)? ()=>{ Router.push(this.props.url) } : '' }  style={{ width: '90%' }} src={'/placeholder.svg'} alt=" " />
              }
            </Grid>

            {/* Web View */}
            {
              (this.props.modalCart) ?
                <Hidden smDown >
                  <Grid item xs={8}>
                    <Typography className={classes.productNameNew} >{this.props.name}</Typography>
                    <Typography variant='body2' className={classes.productSize} >Código: {this.props.code}</Typography>
                    <Typography variant='body2' className={classes.productSize} >Talla: <span style={{ fontWeight: '600', color: 'black' }} > {this.props.size} </span></Typography>
                    <Grid container>
                      <Grid item xs={7} style={{}}>
                        <QuantityControl
                          data={{ quantity: this.props.quantity, available: this.props.available }}
                          changeQuantity={(quantity) => { self.changeQuantity(quantity) }}
                          modalCart={this.props.modalCart}
                        />
                      </Grid>
                      <Grid item xs={5} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', position: 'absolute', right: '12px', bottom: '12px', width: '100%' }}>
                        <div>
                          {
                            (this.props.percentagePrice !== null && this.props.percentagePrice !== undefined && this.props.percentagePrice > 0) ?
                              <Typography variant='body2' style={{ textAlign: 'center' }} > <span className={classes.discount} >{'-%' + this.props.percentagePrice}</span> <span className={classes.priceNumber} > ${Utils.numberWithCommas(this.props.price)} </span> </Typography>
                              :
                              ''
                          }
                          <Typography variant='body2' className={classes.price} > ${Utils.numberWithCommas(this.props.total)} </Typography>
                        </div>
                      </Grid>

                    </Grid>

                  </Grid>
                </Hidden>
                :
                <Hidden smDown >
                  <Grid item sm={5} style={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }} >
                    <div>
                      <Typography className={classes.productNameNew} >{this.props.name}</Typography>
                      <Typography variant='body2' className={classes.productSize} >Código: {this.props.code}</Typography>
                      <Typography variant='body2' className={classes.productSize} >Talla: <span style={{ fontWeight: '600', color: 'black' }} > {this.props.size} </span></Typography>
                      <Typography variant='body2' className={classes.changeSize} >Cambiar talla</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                    <QuantityControl
                      data={{ quantity: this.props.quantity, available: this.props.available }}
                      changeQuantity={(quantity) => { self.changeQuantity(quantity) }}
                    />
                  </Grid>
                  <Grid item xs={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                    <div>
                      {
                        (this.props.percentagePrice !== null && this.props.percentagePrice !== undefined && this.props.percentagePrice > 0) ?
                          <Typography variant='body2' style={{ textAlign: 'center' }} > <span className={classes.discount} >{'-%' + this.props.percentagePrice}</span> <span className={classes.priceNumber} > ${Utils.numberWithCommas(this.props.price)} </span> </Typography>
                          :
                          ''
                      }
                      <Typography variant='body2' className={classes.price} > ${Utils.numberWithCommas(this.props.total)} </Typography>
                    </div>
                  </Grid>
                </Hidden>
            }
            {/* Responsive View */}
            <Hidden mdUp>
              <Grid item xs={8}>
                <Typography className={classes.productNameNew} >{this.props.name}</Typography>
                <Typography variant='body2' className={classes.productSize} >Código: {this.props.code}</Typography>
                <Typography variant='body2' className={classes.productSize} >Talla: <span style={{ fontWeight: '600', color: 'black' }} > {this.props.size} </span></Typography>
                <Grid container >
                  <Grid item xs={12}>
                    <Grid container >
                      <Grid item xs={8}>
                        <QuantityControl
                          data={{ quantity: this.props.quantity, available: this.props.available }}
                          changeQuantity={(quantity) => { self.changeQuantity(quantity) }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <div>
                      {
                        (this.props.percentagePrice !== null && this.props.percentagePrice !== undefined && this.props.percentagePrice > 0) ?
                          <Typography variant='body2'  > <span className={classes.discount} >{'-%' + this.props.percentagePrice}</span> <span className={classes.priceNumber} > ${Utils.numberWithCommas(this.props.price)} </span> </Typography>
                          :
                          ''
                      }
                      <Typography variant='body2' className={classes.price} > ${Utils.numberWithCommas(this.props.total)} </Typography>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Hidden>
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
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(ProductCartNew)
