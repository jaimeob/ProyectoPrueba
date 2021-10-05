import React, { Component } from 'react'
import { connect } from 'react-redux'
// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography } from '@material-ui/core'
import compose from "recompose/compose"
import { openShoppingCart, removeProductFromShoppingCart, updateAllProductFrontShoppingCart, updateShoppingCart } from '../../actions/actionShoppingCart'
import Router from 'next/router'



// Components
import ProductCart from '../../components/ProductCartNew'
import ShoppingDetail from '../../components/ShoppingDetailNew'
import Loading from '../../components/Loading'
import Empty from '../../components/Empty'
import TextBlock from '../../components/TextBlock'
import ProductsBlock from '../../components/ProductsBlock'


// Utils
import Utils from '../../resources/Utils'
import { requestAPI } from '../../api/CRUD'
const styles = theme => ({
  container: {
    width: 1080,
    margin: '0 auto',
    // position: 'relative',

    [theme.breakpoints.down("md")]: {
      margin: '0 auto',
      width: 900,
    },
    [theme.breakpoints.down("sm")]: {
      margin: '0 auto',
      width: '100%',
    },
    [theme.breakpoints.down("xs")]: {
      margin: '0 auto',
      width: '100%',
    }
  },
  blueButton: {
    width: '280px',
    height: '44px',
    padding: '10px 39px 11px',
    borderRadius: '4px',
    backgroundColor: '#22397c',
    color: '#ffffff',
    border: 'none',
    display: 'block',
    fontSize: '16px',
    marginLeft: 'auto',
    marginTop: '20px',
  },
  line: {
    height: '1px',
    margin: '7.5px 0 15.5px',
    border: 'solid 1px #e98607'
  },
  loading: {
    alignItems: 'center',
    display: 'flex',
    height: '70vh',
    justifyContent: 'center',
  },
  productCartContainer: {
    marginTop: '24px'
  },
  shoppingDetailContainer: {
    marginLeft: '24px',
    marginTop: '24px',
    //position: 'fixed',
    [theme.breakpoints.down("sm")]: {
      bottom: '10px',
      marginLeft: '0px',
      position: 'fixed',
      width: '100%',
      zIndex: '1'
    }
  },
  shoppingSticky: {
    position: 'relative',
    right: '0px',
    width: '100%',
    top: '22px',
    [theme.breakpoints.down("sm")]: {
      position: 'sticky',
      width: '50%',
      bottom: 0,
      left: 0,
    }
  },
  title: {
    fontSize: '16px'
  }

})
class Cart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      priceInformation: null,
      products: [],
      scrollPosition: 0,
      loadingCart: true
    }
    this.loadData = this.loadData.bind(this)
    this.removeProduct = this.removeProduct.bind(this)
  }
  async loadData() {
    await this.setState({ loadingCart: true })

    let zip = Utils.getDeliveryAddress().zip
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/cart',
      headers: {
        zip: zip
      },
      json: true
    })
    //console.log('resopnssess', response)
    await this.setState({ loadingCart: false })

    if (response !== undefined && response.status === 200 && response.data !== undefined && response.data.products !== undefined && response.data.products.length > 0) {
      this.props.updateAllProductFrontShoppingCart(response.data.products)
      this.props.updateShoppingCart({
        products: response.data.products,
        priceInformation: {
          total: response.data.total,
          totalProducts: response.data.totalProducts,
          shippingMethod: response.data.shippingMethod,
          subtotal: response.data.subtotal,
        }
      })
      this.setState({
        loading: false,
        products: response.data.products,
        priceInformation: {
          total: response.data.total,
          totalProducts: response.data.totalProducts,
          shippingMethod: response.data.shippingMethod,
          subtotal: response.data.subtotal
        }
      })
    } else if (response !== undefined && response.data !== undefined && response.data.products !== undefined) {
      this.props.updateAllProductFrontShoppingCart([])
      this.setState({
        loading: false,
        products: [],
        priceInformation: {
          total: 0,
          totalProducts: 0,
          shippingMethod: 0,
          subtotal: 0
        }
      })

    }
  }
  async removeProductFromCart(data) {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'DELETE',
      resource: 'carts',
      endpoint: '/remove',
      data: {
        product: this.state.products[data].code,
        size: this.state.products[data].selection.size,
        article: this.state.products[data].selection.article
      }
    })
    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.removed) {
        await this.loadData()
        //await this.props.updateAllProductFrontShoppingCart(this.state.products)
      }
    }
  }
  componentDidMount() {
    Utils.scrollTop()
    this.setState({ loading: false })
  }
  async componentWillMount() {
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      await this.loadData()
    } else {
      Router.push(Utils.constants.paths.login)
    }
    window.addEventListener("scroll", this.checkFixed.bind(this))
    this.checkFixed()
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.checkFixed.bind(this))
  }
  checkFixed() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop
    this.setState({
      scrollPosition: winScroll
    })
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

  render() {
  
    const { classes } = this.props
    return (
      <div>
        {
          (!this.state.loadingCart) ?
            (this.state.products.length > 0) ?
              // (this.state.products !== undefined && this.state.products.length > 0) ?
              <Grid container className={classes.container}>
                <Grid item md={12} xs={12} >
                  <Typography variant="h5">Mi carrito</Typography>
                </Grid>
                {/* Product Cards */}
                {
                  <Grid item xs={12} container >
                    <Grid item md={8} xs={12}>
                      {
                        this.state.products.map((product, idx) => {
                          return (
                            <div className={classes.productCartContainer}>
                              <ProductCart
                                number={idx}
                                loadData={() => { this.loadData() }}
                                loading={() => { this.setState({ loadingCart: true }) }}
                                removeProductFromCart={(data) => { this.removeProductFromCart(data) }}
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
                                removeProduct={() => { this.removeProduct(idx) }}
                                url={product.url}
                              />
                            </div>
                          )
                        })
                      }
                      

                  


                    </Grid>
                    <Grid item md={4} xs={12} className={classes.shoppingSticky} >
                      {/* <div style={{ top: this.state.scrollPosition, position:'absolute'  }} > */}
                      <div>
                        {/* <div style={{ position:'absolute' }} > */}
                        <ShoppingDetail data={this.state.priceInformation} />
                      </div>
                    </Grid>
                    <Grid item md={12} xs={12}>
                      {/* // Personal recommendations for the empty cart page RETAILROCKET */}
                      <div data-retailrocket-markup-block="613ba5f697a5251e74fdb4f6" ></div>

                    </Grid>

                  </Grid>
                }
                {/* {
                  <>
                    <div style={{ marginTop: 24 }}>
                      <TextBlock configs={{
                        title: "Recomendaciones.",
                        message: "",
                        cta: null
                      }}
                      />
                      <ProductsBlock type="recomendations" />
                    </div>
                  </>
                } */}
              </Grid>
              :
              <Grid container className={classes.loading} >
                <Empty
                  emptyImg={'icon-custom-carrito.png'}
                  title={'Tu carrito está vacío'}
                  description={'Parece que aún no has agregado nada a tu carrito. Llénalo con nuestras ofertas y ahorra.'}
                  buttonTitle={'Ir a la sección de ofertas'}
                  callToAction={() => { Router.push(Utils.constants.paths.offers) }}
                />
              </Grid>
            :
            <Grid container className={classes.loading} >
              <Loading />
            </Grid>
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
    },
    updateShoppingCart: (shoppingCart) => {
      dispatch(updateShoppingCart(shoppingCart))
    }
  }
}

export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(Cart)
