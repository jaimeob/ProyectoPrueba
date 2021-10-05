import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Button, Icon, Hidden } from '@material-ui/core'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'

// Utils
import Utils from '../resources/Utils'
import Empty from './Empty'
import ProductItem from './ProductItem'
import { openShoppingCart, removeProductFromShoppingCart, updateAllProductFrontShoppingCart } from '../actions/actionShoppingCart'
import { requestAPI } from '../api/CRUD'
import Loading from './Loading'
import Router from 'next/router'
import ProductCartNew from './ProductCartNew'

const styles = theme => ({
  container: {
    position: 'fixed',
    top: '8%',
    bottom: '8%',
    right: '1.5%',
    width: 544,
    backgroundColor: 'white',
    'overflow-y': 'auto',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      height: '100%',
      top: 0,
      right: 0,
      bottom: 0
    }
  },
  cartContainer: {
    marginTop: 6,
    width: '100%',
    marginRight: 24,
    [theme.breakpoints.down('xs')]: {
      paddingRight: 0
    }
  },
  shoppingCartWithProducts: {
    backgroundColor: 'white',
    color: '#035D59',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: 'white',
      color: '#035D59',
      boxShadow: 'none'
    },
    width: '100%'
  },
  emptyShoppingCart: {
    backgroundColor: 'white',
    color: '#035D59',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: 'white',
      color: '#035D59',
      boxShadow: 'none'
    },
    width: '100%'
  },
  actionButtons: {
    width: 544,
    right: '1.5%',
    background: 'white',
    position: 'fixed',
    bottom: '8%',
    [theme.breakpoints.down('xs')]: {
      margin: 0,
      padding: 0,
      bottom: 0,
      right: 0,
      width: '100%'
    }
  },
  buyButton: {
    background: '#243b7a',
    boxShadow: 'none',
    color: 'white',
    cursor: 'pointer',
    textTransform: 'none',
    cursor: 'pointer',
    width: '100%',
    '&:hover': {
      opacity: 0.9
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: '10px'
    }
  },
  descriptionShoppingCartButton: {
    [theme.breakpoints.up('lg')]: {
      display: 'none'
    }
  },
  descriptionItem: {
    [theme.breakpoints.up('lg')]: {
      display: 'none'
    }
  },
  titleShoppingCartButton: {
    [theme.breakpoints.down('md')]: {}
  },
  iconShoppingCart: {
    marginRight: 4,
    marginBottom: -6,
    [theme.breakpoints.down('sm')]: {
      margin: 0
    }
  },
  textDescritionButton: {
    [theme.breakpoints.down('sm')]: {
      fontSize: 11,
      float: 'left',
      marginTop: -6
    }
  },
  buttonCarrito: {
    '&:hover': {
      backgroundColor: 'white',
      color: '#499dd8'
    }
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

class ShoppingCart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      cart: null,
      products: [],
      loadingCart: true,
      arrayCodeIdsRetailRocket: []
    }

    this.handleChangeQuantity = this.handleChangeQuantity.bind(this)
    this.removeProduct = this.removeProduct.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.loadData = this.loadData.bind(this)
    this.sendToCart = this.sendToCart.bind(this)
  }

  handleRender() {
    this.loadData()
  }

  sendToCart() {
    this.handleClose()
    Router.push(Utils.constants.paths.carrito)
  }

  async loadData() {
    this.setState({ loadingCart: true })
    let zip = Utils.getDeliveryAddress().zip
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/cart',
      headers: {
        zip: zip
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.products !== undefined) {
        this.props.updateAllProductFrontShoppingCart(response.data.products)
        if (response.data.products.length > 0) {
          this.setState({
            cart: response.data,
            products: response.data.products,
            loadingCart: false
          })
          this.setArrayIdsRetailRocket(response.data.products)
        } else {
          this.setState({
            cart: null,
            products: [],
            loadingCart: false
          })
        }
      } else {
        this.props.updateAllProductFrontShoppingCart([])
        this.setState({
          cart: null,
          products: [],
          loadingCart: false
        })
      }
    } else {
      this.setState({ loadingCart: false })
    }
  }

  setArrayIdsRetailRocket(products) {
    let ids = []

    products.forEach(product => {
      if (product.codeRetailRocket !== undefined) {
        ids.push(Number(product.codeRetailRocket))
      }
    });

    this.setState({ arrayCodeIdsRetailRocket: ids })
  }

  async removeProduct(idx) {
    this.setState({ loadingCart: true })
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'DELETE',
      resource: 'carts',
      endpoint: '/remove',
      data: {
        product: this.state.products[idx].code,
        size: this.state.products[idx].selection.size,
        article: this.state.products[idx].selection.article
      }
    })
    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.removed) {
        this.props.removeProductFromShoppingCart(this.state.products[idx])
        this.loadData()
      } else {
        this.setState({ loadingCart: false })
      }
    } else {
      this.setState({ loadingCart: false })
    }
  }

  async handleChangeQuantity(event, idx) {
    let value = Number(event.target.value)
    this.setState({ loadingCart: true })
    if (value > 0) {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'PATCH',
        resource: 'carts',
        endpoint: '/update',
        data: {
          product: this.state.products[idx].code,
          size: this.state.products[idx].selection.size,
          article: this.state.products[idx].selection.article,
          quantity: value
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.updated) {
          this.loadData()
        } else {
          this.setState({ loadingCart: false })
        }
      } else {
        this.setState({ loadingCart: false })
      }
    }
    else {
      this.removeProduct(idx)
    }
  }

  async handleConfirm() {
    this.handleClose()
    Router.push(Utils.constants.paths.checkout)
  }

  handleClose() {
    this.setState({
      show: false
    }, function () {
      this.props.openShoppingCart(false)
    })
  }

  render() {
    const self = this
    const { classes } = this.props
    console.log(this.state, "LOS PRODUCTOS");



    return (
      <div className={classes.cartContainer}>
        <Button variant="contained" style={{ textAlign: 'center', minWidth: '100%', width: '100%', maxWidth: '100%', textTransform: 'none' }} className={(this.state.products.length > 0) ? classes.shoppingCartWithProducts : classes.emptyShoppingCart} onClick={() => {
          let { show } = !this.props.shoppingCart
          this.setState({
            show: show
          }, function () {
            this.props.openShoppingCart(true)
          })
        }}>
          <div>
            <Icon className={classes.iconShoppingCart}>shopping_bag</Icon>
            {
              (this.props.shoppingCart.products !== undefined && this.props.shoppingCart.count > 0) ?
                <>
                  <br className={classes.descriptionItem} />
                  <span className={classes.textDescritionButton}>{this.props.shoppingCart.count} {(this.props.shoppingCart.count === 1) ? 'producto' : 'productos'}</span>
                </>
                :
                <>
                  <br className={classes.descriptionItem} />
                  <Hidden smUp>
                    <span className={classes.textDescritionButton}>Carrito</span>
                  </Hidden>
                  <Hidden xsDown>
                    <span className={classes.textDescritionButton}>Mi carrito</span>
                  </Hidden>
                </>
            }
          </div>
        </Button>
        {
          (this.props.shoppingCart.show) ?
            <div>
              <Dialog
                open={this.props.shoppingCart.show}
                onBackdropClick={() => { this.handleClose() }}
                onEscapeKeyDown={() => { this.handleClose() }}
                onRendered={() => { this.handleRender() }}
              >
                <div className={`${classes.container} ${classes.scrollBar}`}>
                  <DialogTitle style={{ paddingBottom: 8 }}>
                    <Grid container>
                      <Grid item xl={11} lg={11} md={11} sm={11} xs={11}>
                        <Typography style={{ color: '#353b48' }} variant="h4">Mi carrito</Typography>
                      </Grid>
                      <Grid item xl={11} lg={1} md={1} sm={1} xs={1}>
                        <Button style={{ float: 'right', fontSize: '11px', color: '#499dd8', textTransform: 'none' }} onClick={this.handleClose}>
                          Cerrar
                        </Button>
                      </Grid>
                    </Grid>
                  </DialogTitle>

                  <DialogContent style={{ 'overflow-y': 'scroll', height: 'auto', marginLeft: 4, marginRight: 4 }}>
                    {
                      (!this.state.loadingCart) ?
                        <div >
                          <ul style={{ margin: 0, padding: 0, paddingBottom: 100, listStyle: 'none' }}>
                            {
                              this.state.products.length > 0 ?
                                this.state.products.map(function (product, idx) {
                                  return (
                                    <li>
                                      <ProductCartNew
                                        number={idx}
                                        loadData={() => { self.loadData() }}
                                        // loading={() => { this.setState({ loadingCart: true }) }}
                                        // removeProductFromCart={(data) => { this.removeProductFromCart(data) }}
                                        article={product.selection.article}
                                        available={Number(product.selectorQuantity.length)}
                                        code={product.code}
                                        // color={product.color.description}
                                        image={Utils.constants.HOST_CDN_AWS + '/normal/' + product.photos[0].description}
                                        name={product.name}
                                        offer={product.savingPrice}
                                        price={product.price}
                                        quantity={Number(product.selection.quantity)}
                                        size={Number(product.selection.size)}
                                        total={product.subtotal}
                                        discountPrice={product.discountPrice}
                                        percentagePrice={product.percentagePrice}
                                        modalCart={true}
                                        removeProduct={() => { self.removeProduct(idx) }}
                                        url={product.url}

                                      />
                                      {/* <ProductItem
                                        idx={idx}
                                        from="shoppingCart"
                                        products={self.state.products}
                                        removeProduct={(idx) => { self.removeProduct(idx) }}
                                        handleChangeQuantity={(event, idx) => { self.handleChangeQuantity(event, idx) }}
                                      /> */}

                                    </li>
                                  )
                                })
                                :
                                <div>
                                  <Empty
                                    emptyImg="boxEmpty.svg"
                                    title="No hay productos."
                                    description="Carrito de compras vacío."
                                  />
                                  {/* // Personal recommendations for the empty cart page RETAILROCKET */}
                                  <div data-retailrocket-markup-block="613ba5f697a5251e74fdb4f6" ></div>
                                </div>

                            }
                          </ul>
                          {/* // RETAIL ROCKET Related items for the cart page */}
                          {
                            this.state.arrayCodeIdsRetailRocket !== undefined ?
                              <div data-retailrocket-markup-block="613ba5d797a5251e74fdb4f5" data-product-ids={this.state.arrayCodeIdsRetailRocket} ></div> : null
                          }
                          <Grid item md={12} xs={12}>


                          </Grid>
                        </div>
                        :
                        (this.state.loadingCart) ?
                          <div style={{ paddingTop: 100 }}>
                            <Loading />
                          </div>
                          :
                          <Empty
                            emptyImg="boxEmpty.svg"
                            title="No hay productos."
                            description="Carrito de compras vacío."
                          />
                    }
                  </DialogContent>
                  {
                    (!this.state.loadingCart) ?
                      <div className={classes.actionButtons}>
                        {
                          (this.state.cart !== null) ?
                            <>

                              <DialogActions style={{ marginLeft: 8, marginTop: 8 }}>
                                <Grid container>
                                  <Grid item xl={5} lg={5} md={5} sm={5} xs={12}>
                                    <Typography>
                                      Total de productos: <strong>{this.state.cart.totalProducts}</strong>
                                    </Typography>
                                    <Typography>
                                      Total: <strong style={{ color: '#035D59' }}>$ {Utils.numberWithCommas(this.state.cart.subtotal.toFixed(2))}</strong>
                                    </Typography>
                                  </Grid>
                                  <Grid item xl={6} lg={6} md={6} sm={6} xs={12}>
                                    <Grid container>
                                      <Grid item xs={12}>
                                        <Button
                                          className={classes.buyButton}
                                          variant="contained"
                                          onClick={this.handleConfirm}
                                          style={{ cursor: 'pointer' }}
                                        >
                                          <label style={{ fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Continuar con la compra</label>
                                        </Button>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Button onClick={this.sendToCart} className={classes.buttonCarrito} style={{ textTransform: 'none', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} >
                                          {/* <Typography  style={{ textAlign:'center', fontSize: '10px', fontWeight: '600', color:'#499dd8', marginTop:'5px', cursor:'pointer' }} variant='body2'>Ir a mi carrito</Typography> */}
                                        </Button>
                                      </Grid>
                                    </Grid>

                                  </Grid>
                                </Grid>
                              </DialogActions>
                            </>
                            :
                            ''
                        }
                      </div>
                      :
                      ''
                  }
                </div>
              </Dialog>
            </div>
            :
            ''
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    openShoppingCart: (show) => {
      dispatch(openShoppingCart(show))
    },
    removeProductFromShoppingCart: (product) => {
      dispatch(removeProductFromShoppingCart(product))
    },
    updateAllProductFrontShoppingCart: (shoppingCart) => {
      dispatch(updateAllProductFrontShoppingCart(shoppingCart))
    }
  }
}

export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(ShoppingCart)
