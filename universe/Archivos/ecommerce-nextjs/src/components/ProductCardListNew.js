import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Button, Typography, Snackbar, IconButton, Hidden, Checkbox, Grid, Paper } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Tag from './Tag'
import { createGenerateClassName } from '@material-ui/core'

const styles = theme => ({
  itemName: {
    fontSize: '22px',
    fontWeight: 'normal',
    [theme.breakpoints.down("xs")]: {
      fontSize: '14px',

    }
  },
  itemPrice: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#22397c',
    [theme.breakpoints.down("xs")]: {
      fontSize: '20px',

    }
  },
  itemPriceTachado: {
    fontSize: '14px',
    fontWeight: 'normal',
    textDecoration: 'line-through',
    color: '#808080',
  },

  imageContainer:{
   height:'90%', width: '90%', objectFit:'contain',

    
    [theme.breakpoints.down("xs")]: {
      height: '100px',

    }
  },
  quincenas: {
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#68686a',
  },
  containerImage:{
    // display: 'flex',
    // justifyContent: 'center',
    // alignItems: 'center'
    height:'150px', display:'flex', justifyContent:'center', alignItems: 'center'
  }

})

class ProductCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      imageWorking: true,
      selected: false,
      selectedPhoto: (this.props.data.photos.length === 0) ? 'placeholder.svg' : Utils.constants.HOST_CDN_AWS + "/normal/" + this.props.data.photos[0].description
    }

    this.getSizesRange = this.getSizesRange.bind(this)
    this.getSubtitle = this.getSubtitle.bind(this)
    this.changePhoto = this.changePhoto.bind(this)
    this.addSeenProducts = this.addSeenProducts.bind(this)

  }

  changePhoto(status) {
    if (status === 0) {
      if (this.props.data.photos.length === 0) {
        this.setState({
          selectedPhoto: 'placeholder.svg'
        })
      } else {
        this.setState({
          selectedPhoto: Utils.constants.HOST_CDN_AWS + "/normal/" + this.props.data.photos[0].description
        })
      }
    } else {
      if (this.props.data.photos.length === 0) {
        this.setState({
          selectedPhoto: 'placeholder.svg'
        })
      } else {
        let random = Math.floor(Math.random() * this.props.data.photos.length)
        let photo = this.props.data.photos[random]
        if (this.props.data.photos.length > 1 && random === 0) {
          photo = this.props.data.photos[1]
        }
        this.setState({
          selectedPhoto: Utils.constants.HOST_CDN_AWS + "/normal/" + photo.description
        })
      }
    }
  }

  async addSeenProducts(product) {
    if (product) {
      await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'recently-seen',
        endpoint: '/add-product',
        data: {
          product: product
        }
      })
    }
  }

  getSubtitle(product) {
    let string = ''
    if (!Utils.isEmpty(this.getSizesRange(product))) {
      string = this.getSizesRange(product)
    }

    if (product.gender !== undefined && product.gender.description !== undefined && product.gender.description !== null && !Utils.isEmpty(product.gender.description)) {
      if (!Utils.isEmpty(string)) {
        string = product.gender.description + ' (' + string + ')'
      }
      else {
        string = product.gender.description
      }
    }
    return string
  }

  getSizesRange(product) {
    let sizes = product.sizes
    let string = ''
    if (sizes.length >= 2) {
      string = sizes[0] + ' - ' + sizes[sizes.length - 1]
    }
    return string
  }

  componentWillMount() {
    this.setState({
      selected: this.props.currentCatalog
    })
  }

  handleChange() {
    if (this.state.selected) {
      //Utils.removeProductFromCatalog(this.props.data)
      this.props.dispatch({ type: 'REMOVE_FROM_CATALOG', product: this.props.data })

      this.setState({
        selected: false
      })
    } else {
      //Utils.addProductToCatalog(this.props.data)
      this.props.dispatch({ type: 'ADD_TO_CATALOG', product: this.props.data })

      this.setState({
        selected: true
      })
    }
    this.props.updateCount()
  }

  render() {
    const { classes } = this.props
    let product = this.props.data
    return (
      <div>
        <a href={product.url}
          onClick={async () => {
            // Método para agregar producto a productos vistos
            (product.code) ? await this.addSeenProducts(product.code) : ''
          }}
        >
          {/*
            (product.percentagePrice > 0 && this.props.app.data.id === 1) ?
            <img src="/hot-sale.svg" style={{ width: 48, position: 'absolute', float: 'left', display: 'inline-block', marginTop: 16, marginLeft: 16 }}/>
            :
            ''
          */}
          <Grid container style={{paddingBottom: '10px', paddingTop: '10px'}} >
            {/* Image */}
            <Grid item lg={3} xs={4} className={classes.containerImage} >
              {
                (product.photos.length > 0) ?
                  (this.state.imageWorking) ?
                    <img
                      className={classes.imageContainer}
                      src={this.state.selectedPhoto}
                      onMouseOver={() => { this.changePhoto(1) }}
                      onMouseLeave={() => { this.changePhoto(0) }}
                      alt=""
                      onError={() => {
                        this.setState({ imageWorking: false })
                      }}
                    />
                    :
                    <img
                      className={classes.imageContainer}
                      src={Utils.getPlaceholderByGender(1)}
                      onMouseOver={() => { this.changePhoto(1) }}
                      onMouseLeave={() => { this.changePhoto(0) }}
                      alt=" "
                    />
                  :
                  <img
                    className={classes.imageContainer}
                    src={Utils.getPlaceholderByGender(1)}
                    onMouseOver={() => { this.changePhoto(1) }}
                    onMouseLeave={() => { this.changePhoto(0) }}
                    alt=" "
                  />
              }
            </Grid>

            {/* Information  */}
            <Grid item xs={8} style={{ marginTop: 16 }}>
              <Grid container>
                <Grid item xs={12} >
                  <Typography variant="body2" className={classes.productName}>{product.detail.title}</Typography>
                </Grid>
                {/* Tag */}
                {
                  (product.percentagePrice > 0) ?
                  <Grid item lg={3} sm={6} style={{ margin: 12, marginLeft: 0, marginBottom: 12 }}>
                    <Tag name={'Oferta ' + Utils.numberWithCommas(product.percentagePrice) + '%'} text={'offerText'} container={'offerRectangle'} />
                  </Grid>
                  :
                  ''
                }
                {
                  (product.bluePoints.status) ?
                  <Grid item lg={3} sm={6} style={{ margin: 12, marginBottom: 12, marginLeft: 0, marginRight: 0 }}>
                    <Tag name={'Gana ' + Utils.numberWithCommas(product.bluePoints.win) + ' puntos'} text={'bluePointText'} container={'bluePointRectangle'} />
                  </Grid>
                  :
                  ''
                }
                <Grid item xs={12}>
                  <Grid container>
                  {
                    (product.percentagePrice > 0) ?
                    <Grid item={12}>
                      <Typography variant="body1" className={classes.itemPrice}>$ { Utils.numberWithCommas(product.price) } <span className={classes.itemPriceTachado}>$ {Utils.numberWithCommas(product.discountPrice)}</span></Typography>
                    </Grid>
                    :
                    <Grid item={12}>
                      <Typography variant="body1" className={classes.itemPrice}>$ {Utils.numberWithCommas(product.price)}</Typography>
                    </Grid>
                  }
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                {
                  (product.creditPrice > 0) ?
                  <Grid item={12}>
                    {/* <Typography variant="body1" className={classes.itemPrice} style={{ color: 'red', overflow: 'hidden', width: '100%', textOverflow: 'ellipsis' }} ><span style={{ color: 'red' }}>${Utils.numberWithCommas(product.partialityPrice.toFixed(2))} quincenales.</span></Typography */}
                    <Typography variant="body2" className={classes.quincenas}>Desde ${Utils.numberWithCommas(product.partialityPrice)} quincenales. </Typography>
                  </Grid>
                  :
                  ''
                }
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </a>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(ProductCard)
