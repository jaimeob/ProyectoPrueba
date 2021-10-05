import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Button } from '@material-ui/core'

import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

// Utils
import Utils from '../resources/Utils'
import Link from 'next/link'

const styles = theme => ({
  container: {
    position: 'fixed',
    top: 116,
    right: 32,
    width: 544,
    backgroundColor: 'white'
  },
  shoppingCartWithProducts: {
    backgroundColor: '#A7E688',
    color: '#035D59',
    border: '2px solid #A7E688',
    boxShadow: 'none',
    '&:hover': {
      opacity: 0.9
    }
  },
  emptyShoppingCart: {
    backgroundColor: 'white',
    color: '#035D59',
    border: '2px solid #A7E688',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#A7E688',
      color: '#035D59'
    }
  },
  buyButton: {
    backgroundColor: '#A7E688',
    color: '#035D59',
    border: '2px solid #A7E688',
    boxShadow: 'none',
    marginBottom: 22,
    '&:hover': {
      opacity: 0.9
    }
  }
})

class ProductItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageWorking: true
    }

    this.getPriceByProduct = this.getPriceByProduct.bind(this)
    this.getCreditPriceByProduct = this.getCreditPriceByProduct.bind(this)
    this.getBiweeklyCreditPriceByProduct = this.getBiweeklyCreditPriceByProduct.bind(this)
  }

  getPriceByProduct(idx) {
    let product = this.props.products[idx]
    if (product.percentagePrice > 0) {
      return Utils.numberWithCommas(product.discountPrice.toFixed(2))
    }
    return Utils.numberWithCommas(product.price.toFixed(2))
  }

  getCreditPriceByProduct(idx) {
    let product = this.props.products[idx]
    return Utils.numberWithCommas(product.creditPrice.toFixed(2))
  }

  getBiweeklyCreditPriceByProduct(idx) {
    let product = this.props.products[idx]
    return Utils.numberWithCommas((product.partialityPrice).toFixed(2))
  }

  render() {
    const self = this
    return (
      <Grid container style={{ backgroundColor: 'white', paddingTop: 16, paddingBottom: 16 }}>
        <Grid item lg={4} md={4} sm={4} xs={4}>
          <div style={{display:'flex',alignItems:'center', justifyContent:'center'}} >
          {
            (this.props.products[this.props.idx].photos.length > 0) ?
              (this.state.imageWorking) ?
                <img style={{ width: '90%' }} src={Utils.constants.HOST_CDN_AWS + '/normal/' + this.props.products[this.props.idx].photos[0].description} alt=" " onError={() => { this.setState({ imageWorking: false }) }} />
                :
                <img style={{ width: '90%' }} src={Utils.getPlaceholderByGender(this.props.products[this.props.idx].genderCode)} alt=" " />
              :
              <img style={{ width: '90%' }} src={'/placeholder.svg'} alt=" " />
          }
          </div>
          <Link href={this.props.products[this.props.idx].url} style={{ textAlign: 'center' }}>
            <Typography variant="body2" style={{textAlign:'center', paddingTop: 16, color: 'blue', textDecoration: 'underline', cursor:'pointer' }}>Ver producto</Typography>
          </Link>
          <div style={{ marginTop: 16, display:'flex', alignItems:'center', justifyContent:'center'}}>
          {
            (this.props.products[this.props.idx].bluePoints.status) ?
            <div style={{ padding: 0, margin: 0, textAlign: 'center', fontSize: 12, background: '#42c8f4', color: 'white', width: 52, height: 52, borderRadius: '50%' }}>
              <p style={{ margin: 0, padding: 0, marginTop: 4, textAlign: 'center', color: 'white' }}>
                <strong style={{ fontSize: 18, display: 'block', marginBottom: -4 }}>{this.props.products[this.props.idx].bluePoints.win}</strong>
                <span>puntos</span>
              </p>
            </div>
            :
            ''
          }
          </div>
        </Grid>
        <Grid item lg={8} md={8} sm={8} xs={8}>
          <Typography variant="body1" style={{ fontSize: 12 }}>Código: {this.props.products[this.props.idx].code}</Typography>
          <Typography variant="body2">{this.props.products[this.props.idx].name}</Typography>
          <Typography variant="body2">Talla: <strong >{this.props.products[this.props.idx].selection.size}</strong></Typography>
          {
            (this.props.products[this.props.idx].percentagePrice > 0) ?
              <div>
                {/*<img src={hotSaleImg} style={{ float: 'left', width: 48, paddingRight: 8 }} /> */}
                <Typography variant="body2" style={{ color: 'red' }}>Descuento: <strong>{this.props.products[this.props.idx].percentagePrice}%</strong></Typography>
                <Typography variant="body2" style={{ color: 'red', fontSize: 12 }}>Precio anterior: <strong style={{ textDecoration: 'line-through' }}>${Utils.numberWithCommas(this.props.products[this.props.idx].price.toFixed(2))}</strong></Typography>
              </div>
              :
              ''
          }
          <Typography variant="body2">Precio unitario: <strong>${self.getPriceByProduct(this.props.idx)}</strong> (al contado)</Typography>
          {
            (this.props.products[this.props.idx].creditPrice > 0) ?
              <Grid container>
                <Grid item xl={2} lg={2} md={2} sm={3} xs={3} style={{ textAlign: 'right', paddingRight: 12 }}>
                  <img style={{ marginTop: 8, width: 52 }} src='/credivale.svg' />
                </Grid>
                <Grid item xl={10} lg={10} md={10} sm={9} xs={9}>
                  <Typography variant="body2" style={{ fontSize: 12 }}>
                    Precio a crédito: <strong>${Utils.numberWithCommas(this.props.products[this.props.idx].creditPrice.toFixed(2))}</strong>
                  </Typography>
                  <Typography variant="body2" style={{ fontSize: 12 }}>{this.props.products[this.props.idx].partiality} quincenas de ${self.getBiweeklyCreditPriceByProduct(this.props.idx)}</Typography>
                </Grid>
              </Grid>
              :
              ''
          }
          {
            (this.props.changeQuantity === undefined || this.props.changeQuantity) ?
              <div>
                {
                  (this.props.products[this.props.idx].genderCode === 5 || !this.props.products[this.props.idx].changeQuantity) ?
                  <Typography variant="body1">Cantidad: <strong>{this.props.products[this.props.idx].selection.quantity}</strong></Typography>
                  :
                  <div>
                    <Typography variant="body1">Cantidad:</Typography>
                    <FormControl >
                      <Select
                        native
                        value={this.props.products[this.props.idx].quantity}
                        onChange={(event) => { self.props.handleChangeQuantity(event, this.props.idx) }}
                      >
                      <option value={0}>Remover</option>
                      {
                        (this.props.products[this.props.idx].selectorQuantity.length > 0) ?
                          this.props.products[this.props.idx].selectorQuantity.map(function (stock) {
                            return (
                              <option selected={stock.value === self.props.products[self.props.idx].selection.quantity} value={stock.value}>{stock.description}</option>
                            )
                          })
                          :
                          ''
                      }
                      </Select>
                    </FormControl>
                  </div>
                }
                <Button style={{ padding: 0, paddingTop: 8, paddingBottom: 8 }} onClick={ () => { 
                  self.props.removeProduct(this.props.idx) 
                  if (Utils.constants.CONFIG_ENV.APP_MODE === this.props.app.data.environmentMode) {
                    gtag('event', 'remove_from_cart', {
                      "items": [
                        {"id": this.props.products[this.props.idx].id,
                        "name": this.props.products[this.props.idx].name,
                        "list_name": "CategoryExplorer",
                        "brand": this.props.products[this.props.idx].name,
                        "category": this.props.products[this.props.idx].categoryCode,
                        "price": this.props.products[this.props.idx].price}
                      ]
                    })
                  }
                }}
                >
                  <Typography variant="body2" style={{ marginLeft: 0, color: 'red', textDecoration: 'underline', fontSize: 11, fontWeight: 800 }}>Remover producto</Typography>
                </Button>
              </div>
              :
              <div>
                <Typography variant="body2">Cantidad: <strong>{this.props.products[this.props.idx].quantity}</strong></Typography>
                <Button onClick={ () => { 
                  self.props.removeProduct(this.props.idx)
                  if (Utils.constants.CONFIG_ENV.APP_MODE === this.props.app.data.environmentMode) {
                    gtag('event', 'remove_from_cart', {
                      "items": [
                        {"id": this.props.products[this.props.idx].id,
                        "name": this.props.products[this.props.idx].name,
                        "list_name": "CategoryExplorer",
                        "brand": this.props.products[this.props.idx].name,
                        "category": this.props.products[this.props.idx].categoryCode,
                        "price": this.props.products[this.props.idx].price}
                      ]
                    })
                  }
                 }}
                 >
                  <Typography variant="body2" style={{ marginLeft: -8, color: 'red', textDecoration: 'underline' }}>Remover producto</Typography>
                </Button>
              </div>
          }
          <Typography variant="body2">Subtotal: <strong style={{ color: '#035D59' }}>$ {Utils.numberWithCommas(this.props.products[this.props.idx].subtotal.toFixed(2))}</strong></Typography>
          <Typography variant="body1" style={{ fontSize: 11 }}>* Precio pagando de contado</Typography>
          {
            (this.props.products[this.props.idx].location !== null) ?
            <Grid container style={{ marginTop: 8 }}>
              <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
                <div style={{ float: 'left', marginRight: 8, background: this.props.products[this.props.idx].location[0].color, width: 28, height: 28, borderRadius: '50%'}}></div>
              </Grid>
              <Grid item xl={10} lg={10} md={10} sm={10} xs={10}>
              <Typography variant="body2" style={{ paddingLeft: 8, fontSize: 11, lineHeight: 1.1 }}>
                {this.props.products[this.props.idx].location[0].description}
              </Typography>
              </Grid>
            </Grid>
            :
            ''
          }
        </Grid>
      </Grid>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(ProductItem)
