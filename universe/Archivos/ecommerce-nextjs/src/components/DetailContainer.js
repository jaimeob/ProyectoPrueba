import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'


// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Paper, Button, Hidden, Radio, Collapse, GridList, TextField } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
// Components
import { requestAPI } from '../api/CRUD'
import Line from './Line'

// Utils
import Utils from '../resources/Utils'
import ItemCheckout from './ItemCheckout'
import ProductCart from './ProductCart'

import { updateBluePoint, updateCoupon } from '../actions/actionCheckout'


const styles = theme => ({
  buttonText: {
    display: 'flex',
    alignItems: 'center',
    color: '#006fb9',
    cursor: 'pointer',
    fontSize: '16px'

  },
  buttonApplicar: {
    width: '91px',
    height: '40',
    padding: '11px 16px 10px',
    borderRadius: '4px',
    border: 'solid 1px #22397c',
    background: 'none',
    color: '#22397c',
    cursor: 'pointer'

  },
  buttonApplicarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',

  },
  buttonSelect: {
    width: '200px',
    height: '44px',
    background: 'none',
    color: '#22397c',
    paddingTop: '13px',
    paddingBottom: '13px',
    borderRadius: '4px',
    border: 'solid 1px #22397c',
    cursor: 'pointer'

  },
  blueButton: {
    background: 'none',
    border: 'none',
    color: '#006fb9',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '0px',
    padding: '0px',
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px'

    }
  },
  textField: {
    width: '90%'
  },

  newCardButton: {
    width: '344px',
    height: '44px',
    padding: '0px',
    margin: '5px',
    //margin: '15.5px 344px 16px 0',
    //padding: '11px 189px 10px 16px',
    borderRadius: '4px',
    border: 'solid 1px rgba(0, 131, 224, 0.35)',
    background: '#ffffff',

  },
  description: {
    color: '#212222'

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





  card: {
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      boxShadow: '0 -1px 2px 0 rgba(0, 0, 0, 0.1)',
    }
  },
  line: {
    margin: '7.5px 0 15.5px 0px',
  },


  subtotal: {
    fontSize: '16px',
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px',
    }
  },
  title: {
    color: '#111110',
    fontSize: '16px'
  },

})

class DetailContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      seeDetail: true,
      firstResponsive: true,
      totalProducts: null,
      shippingMethod: null,
      subtotal: null,
      total: null,
      changeAddress: false,
      bluePoints: null,
      bluePointsTextField: false,
      coupon: false,
      couponValue: ''
    }

    this.handleChangeDetail = this.handleChangeDetail.bind(this)
    this.handleChangeAddress = this.handleChangeAddress.bind(this)
    this.handleChangeBluePoints = this.handleChangeBluePoints.bind(this)
    this.applyBluePoints = this.applyBluePoints.bind(this)
    this.handleCoupon = this.handleCoupon.bind(this)
    this.handleChangeCoupon = this.handleChangeCoupon.bind(this)
    this.applyCoupon = this.applyCoupon.bind(this)
    this.handleShippingMethod = this.handleShippingMethod.bind(this)



  }

  handleCoupon(flag) {
    this.setState({
      coupon: flag
    })
  }

  async applyBluePoints(flag) {
    if (!flag) {
      await this.props.bluePointsFunction(false)
      this.setState({
        bluePointsTextField: false,
        bluePoints: ''
      })
      this.props.updateBluePoint({
        bluePoints: 0,
      })
    } else {
      await this.props.bluePointsFunction(this.state.bluePoints)
      this.setState({
        bluePointsTextField: true
      })
    }
  }
  async applyCoupon(flag) {
    if (flag) {
      this.setState({
        coupon: true,
      })
    } else {
      this.setState({
        coupon: false,
        couponValue: ''
      })
      await this.props.updateCoupon({
        coupon: '',
      })

    }
    this.props.applyCouponFunction()

  }

  handleChangeBluePoints(input) {
    if (!isNaN(Number(input.target.value.trim()))) {
      this.setState({ bluePoints: input.target.value.trim() })
      this.props.updateBluePoint({ bluePoints: Number(input.target.value.trim()) })
    }
  }
  handleChangeCoupon(input) {
    this.setState({
      couponValue: input.target.value.toUpperCase()
    })
    this.props.updateCoupon({ coupon: input.target.value.toUpperCase() })

  }
  handleChangeDetail() {
    this.setState({ seeDetail: !this.state.seeDetail })
  }
  resize() {
    if (window.innerWidth > 960) {
      this.setState({ seeDetail: true, firstResponsive: true })
    } else if (this.state.firstResponsive) {
      this.setState({ seeDetail: false, firstResponsive: false })
    }
  }
  componentWillMount() {
    window.addEventListener("resize", this.resize.bind(this))
    this.resize()
    if (this.props !== undefined && this.props.data !== undefined) {
      this.setState({
        totalProducts: this.props.shoppingCart.count,
        total: this.props.data.total,
        subtotal: this.props.data.subtotal,
        shippingMethod: this.props.data.shippingMethod
      })
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.resize.bind(this))
  }
  handleChangeAddress(id) {
    if (id !== -1 || id !== undefined || id !== null) {
      this.props.changeAddress(id)
    }
    this.setState({
      changeAddress: !this.state.changeAddress
    })
  }

  handleShippingMethod(id) {

    this.setState({
      changeAddress: !this.state.changeAddress
    })
  }


  render() {
    const { classes } = this.props
    const self = this

    return (
      <div>
        <Paper elevation={0} className={classes.card} style={(this.props.styles !== undefined) ? this.props.styles : {}}>
          <Grid container>
            <Hidden smDown>
              {/* Desktop */}
              <Grid item xs={12}>
                <Typography className={classes.title} >{this.props.title}</Typography>
              </Grid>

              <Grid item xs={12}>
                <div className={classes.line} >
                  <Line color={'yellow'} />
                </div>
              </Grid>
            </Hidden>

            {
              (this.props.cardPayment) ?
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={4}>
                      <button onClick={this.props.openCardModal} className={classes.newCardButton} >
                        <div className={classes.buttonText} >
                          <AddIcon />
                            Nueva Tarjeta
                      </div>
                      </button>
                    </Grid>

                  </Grid>
                </Grid>
                :
                ''
            }
            {
              (this.props.resumen) ?
                <Grid item xs={12}>
                  <Grid container>
                    {
                      this.props.products.map((product, idx) => {
                        return (
                          <Grid key={idx} item xs={12} style={{ marginBottom: '30px' }}>
                            <ProductCart
                              number={idx}
                              loadData={() => { }}
                              loading={() => { this.setState({ loadingCart: true }) }}
                              removeProductFromCart={(data) => { this.removeProductFromCart(data) }}
                              code={product.code}
                              color={product.color.description}
                              image={Utils.constants.HOST_CDN_AWS + '/normal/' + product.photos[0].description}
                              name={product.name}
                              offer={product.savingPrice}
                              price={product.price}
                              quantity={Number(product.selection.quantity)}
                              size={Number(product.selection.size)}
                              total={product.subtotal}
                              discountPrice={product.discountPrice}
                              verification={true}
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
            {/* <Collapse in={this.state.seeDetail} style={{ width: '100%' }}> */}
            {
              (this.props.address) ?
                <div style={{ width: '100%' }}>
                  {
                    (this.props.addressButtons) ?
                      // (this.props.subtitle !== null && this.props.subtitle !== undefined) ?
                      (false) ?
                        <div style={{ width: '100%' }}>
                          <Grid xs={12}>
                            <Typography  > {this.props.subtitle} </Typography>
                          </Grid>
                          <Grid xs={12}>
                            <Grid container>
                              <Grid item xs={10}>
                                <Typography variant="body2" className={classes.description} > {this.props.description} </Typography>
                              </Grid>
                            </Grid>
                          </Grid>

                          <Grid xs={12}>
                            <button onClick={() => { this.handleChangeAddress(-1) }} className={classes.blueButton} >
                              {this.props.buttonDescription}
                            </button>
                          </Grid>
                        </div>
                        :
                        <div style={{ width: '100%' }}>
                          <Grid xs={12}>

                            <button className={classes.buttonSelect} onClick={this.props.emptyButtonFunction} >
                              {this.props.emptyButton}
                            </button>

                          </Grid>
                        </div>
                      :
                      ''
                  }

                  <Grid item xs={12}>
                    <Grid container>
                      {
                        (this.props.products !== undefined && this.props.products !== null && this.props.products.length > 0) ?
                          this.props.products.map((product, idx) => {
                            return (
                              <Grid key={idx} item xs={12} style={{ marginBottom: '30px' }}>
                                <ProductCart
                                  number={idx}
                                  code={product.code}
                                  color={product.color.description}
                                  image={Utils.constants.HOST_CDN_AWS + '/normal/' + product.photos[0].description}
                                  name={product.name}
                                  verification={true}
                                  shippingMethod={product.shippingMethods}
                                  selectShippingMethod={this.props.changeShippingMethod}
                                  loadData={this.props.loadData}
                                />
                              </Grid>
                            )
                          })
                          :
                          ''
                      }
                    </Grid>

                  </Grid>

                  {
                    (this.props.subtitle2 !== undefined) ?
                      <Grid xs={12}>
                        <Typography  > {this.props.subtitle2} </Typography>
                      </Grid>
                      :
                      ''
                  }
                  {
                    (this.props.description2 !== undefined) ?
                      <Grid xs={12}>
                        <Grid container>
                          <Grid item xs={6}>
                            <Typography variant="body2" className={classes.description} > {this.props.description2} </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      :
                      ''
                  }
                  {/* {
                    (this.props.buttonDescription !== undefined && this.props.buttonDescription !== null) ?
                      <Grid xs={12}>
                        <button onClick={() => { this.handleChangeAddress(-1) }} className={classes.blueButton} >
                          {this.props.buttonDescription}
                        </button>
                      </Grid>
                      :
                      ''
                  } */}
                  <div style={(this.state.changeAddress) ? { height: '300px', overflow: 'scroll' } : {}}>
                    {
                      (this.state.changeAddress && this.props.addresses !== null && this.props.addresses !== undefined) ?
                        this.props.addresses.map((item, idx) => {
                          return (
                            <Grid key={idx} xs={12} className={(this.props.selected) ? classes.containerItemSelected : classes.containerItem} >
                              {/* Contenido */}
                              <ItemCheckout
                                selected={item.selected}
                                name={item.name}
                                description={item.street + ', ' + item.exteriorNumber + ', Colonia ' + item.location + ', ' + item.zip + ', ' + item.municipality + ', ' + item.state}
                                selectedFunction={() => { this.handleChangeAddress(idx) }}
                              />
                            </Grid>
                          )
                        })
                        :
                        ''
                    }

                  </div>
                </div>
                :
                (this.props.shippingMethods || this.props.cardPayment || this.props.payments) ?
                  <div style={{ width: '100%' }}>
                    <Grid container>
                      {/* Poner map de opciones de envio */}
                      {
                        (this.props.shippingMethodItems !== null && this.props.shippingMethodItems !== undefined) ?
                          this.props.shippingMethodItems.map((item, idx) => {
                            return (
                              <Grid key={idx} xs={12} className={(this.props.selected) ? classes.containerItemSelected : classes.containerItem} >

                                {/* Contenido */}
                                <ItemCheckout
                                  selected={item.selected}
                                  name={item.name}
                                  description={item.description}
                                />
                              </Grid>
                            )
                          })
                          :
                          (this.props.cards !== null && this.props.cards !== undefined) ?
                            this.props.cards.map((item, idx) => {
                              return (
                                <Grid key={idx} xs={12} className={(this.props.selected) ? classes.containerItemSelected : classes.containerItem} >
                                  {/* Contenido */}
                                  <ItemCheckout
                                    selected={item.checked}
                                    name={item.alias}
                                    description={item.type.charAt(0).toUpperCase() + item.type.slice(1) + " terminación " + item.number}
                                    type={item.type}
                                    //selectedFunction={  }
                                    selectedFunction={(id) => { this.props.changeCard(item) }}
                                    image={true}
                                    card={true}


                                  />
                                </Grid>
                              )
                            })
                            :
                            (this.props.paymentMethods !== null && this.props.paymentMethods !== undefined) ?
                              this.props.paymentMethods.map((item, idx) => {
                                return (
                                  <div key={idx} style={{ width: '100%' }} >
                                    {
                                      (item.id !== 5 && item.id !== 9) ?
                                        <Grid xs={12} className={(this.props.selected) ? classes.containerItemSelected : classes.containerItem} >
                                          {/* Contenido */}

                                          <ItemCheckout
                                            selected={item.checked}
                                            name={item.name}
                                            selectedFunction={(id) => { this.props.changeMethod(item) }}
                                            image={true}
                                            paymentMethod={true}
                                            id={item.id}
                                          />
                                        </Grid>
                                        :
                                        ''
                                    }

                                  </div>
                                )
                              })
                              :
                              ''
                      }

                    </Grid>
                  </div>
                  :
                  (this.props.coupon) ?
                    <div style={{ width: '100%' }}>

                      <Grid container>
                        <Grid item xs={12} style={{ marginBottom: '10px' }}>
                          <Typography variant='body2' >  {'Tienes ' + Utils.numberWithCommas(this.props.bluePointsBalance)} {(Number(this.props.bluePointsBalance) === 1) ? 'punto' : 'puntos' + ' en tu Monedero Azul. ¿Cuántos quieres usar?'}  </Typography>
                        </Grid>

                        <Grid item xs={12} style={{ marginBottom: '10px' }}>
                          {/* pimer textfield */}
                          <Grid container>
                            <Grid item xs={10}  >
                              <TextField
                                size="small"
                                id="outlined-name"
                                label="¿Cuántos puntos quieres usar?"
                                className={classes.textField}
                                value={this.state.bluePoints}
                                onChange={this.handleChangeBluePoints}
                                variant="outlined"
                                disabled={this.state.bluePointsTextField}
                                style={{ height: '40px' }}
                              />
                            </Grid>
                            <Grid item xs={2} className={classes.buttonApplicarContainer} >
                              {
                                (!this.state.bluePointsTextField) ?
                                  <button className={classes.buttonApplicar} onClick={async () => await this.applyBluePoints(true)} >
                                    Aplicar
                              </button>
                                  :
                                  <button className={classes.buttonApplicar} onClick={async () => await this.applyBluePoints(false)} >
                                    Quitar
                              </button>
                              }

                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item xs={12} style={{ marginBottom: '10px' }}>
                          <Typography variant='body2' >Cupón de descuento </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          {/* pimer textfield */}
                          <Grid container >
                            <Grid item xs={10}>
                              <TextField
                                // defaultValue=''
                                size="small"
                                label="¿Cuál es tu código de descuento?"
                                className={classes.textField}
                                value={this.state.couponValue}
                                onChange={this.handleChangeCoupon}
                                variant="outlined"
                                disabled={this.state.coupon}
                              //style={{ width:'100%' }}
                              />

                            </Grid>
                            <Grid item xs={2} className={classes.buttonApplicarContainer} >
                              {
                                (!this.state.coupon) ?
                                  <button className={classes.buttonApplicar} onClick={() => { this.applyCoupon(true) }} >
                                    Aplicar
                                  </button>
                                  :
                                  <button className={classes.buttonApplicar} onClick={() => { this.applyCoupon(false) }} >
                                    Quitar
                                  </button>
                              }


                            </Grid>

                          </Grid>

                        </Grid>




                      </Grid>
                    </div>
                    :
                    ''
            }

            {/* </Collapse> */}

          </Grid>
        </Paper>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = dispatch => {
  return {
    updateBluePoint: (checkout) => {
      dispatch(updateBluePoint(checkout))
    },
    updateCoupon: (checkout) => {
      dispatch(updateCoupon(checkout))
    }
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(DetailContainer)


