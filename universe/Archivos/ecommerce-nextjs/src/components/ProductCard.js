'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Typography, IconButton, Checkbox, Icon, Grid, Box } from '@material-ui/core'
import CancelOutlinedIcon from '@material-ui/icons/ClearRounded'
import { requestAPI } from '../api/CRUD'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({
  item: {
    margin: 0,
    padding: 20,
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      padding: 4,
    }
  },
  itemNoInfo: {
    margin: 0,
    paddingBottom: 10,
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.12)',
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      padding: 4,
      height: '120'
    }
  },
  itemTag: {
    backgroundColor: 'red',
    position: 'absolute',
    color: 'white',
    fontSize: 18,
    padding: '4px 8px',
    borderBottomRightRadius: 10,
    [theme.breakpoints.down('sm')]: {
      marginTop: '-4px',
      marginLeft: '-4px'
    }
  },
  checkbox: {
    float: 'right',
    position: 'absolute',
    top: 0,
    right: 0
  },
  imageContainer: {
    verticalAlign: 'middle',
    textAlign: 'center',
    display: 'table-cell',
    margin: '0 auto',
    backgroundColor: 'white',
    [theme.breakpoints.down('md')]: {
    }
  },
  imageContainerNoInfo: {
    verticalAlign: 'middle',
    textAlign: 'center',
    display: 'table-cell',
    margin: '0 auto',
    backgroundColor: 'white',
    height: '310px',
    [theme.breakpoints.down('md')]: {
      height: '200px',
    }
  },
  itemImage: {
    width: '90%',
    objectFit: 'contain',
    height: '200px',
  },
  itemImageNoInfo: {
    width: '90%',
    objectFit: 'cover',
    maxHeight: '300px',
    [theme.breakpoints.down('md')]: {
      height: '200px',
    }
  },
  itemImagePlaceholder: {
    width: '100%',
    [theme.breakpoints.down('md')]: {
      height: 'auto',
    }
  },
  itemVerticalImage: {
    width: 'auto',
    height: '100%',
    objectFit: 'cover'
  },
  itemDescription: {
    width: '90%',
    margin: '0 auto',
    textAlign: 'left!important',
    minHeight: 130,
    [theme.breakpoints.down('xs')]: {
      minHeight: 120,
      marginBottom: '10px',
    }
  },
  itemName: {
    fontSize: 14,
    fontWeight: 800,
    height: '3em',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
      fontSize: 12
    },
    [theme.breakpoints.down('xs')]: {

    }
  },
  itemPrice: {
    lineHeight: 1,
    marginTop: 4,
    fontSize: 17,
    fontWeight: 800,
    color: '#243B7A',
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  },
  itemOldPrice: {
    fontSize: 12,
    fontWeight: 400,
    color: '#68686a',
    textDecoration: 'line-through'
  },
  itemBrand: {
    fontSize: 12,
    opacity: 0.8
  },
  itemCode: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.5
  },
  deleteIcon: {
    float: 'right',
    marginTop: 12,
    marginRight: 12,
    padding: 0,
    cursor: 'pointer',
    zIndex: 3
  }
})

class ProductCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      user: null,
      imageWorking: true,
      selected: false,
      uuidCAPIFacebook: null,
      selectedPhoto: (this.props.data.photos.length === 0) ? 'placeholder.svg' : Utils.constants.HOST_CDN_AWS + "/normal/" + this.props.data.photos[0].description,
      withInformation: (this.props.configs !== undefined) ? this.props.configs.withInformation : true,
      sizeProductCard: 'normal'
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

  addSeenProducts(productCode) {
    if (productCode !== undefined) {
      requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'recently-seen',
        endpoint: '/add-product',
        data: {
          product: productCode
        }
      })
    }
  }

  async componentWillMount() {
    let uuidActual = this.props.app.data.uuid
    if (uuidActual !== null) {
      this.setState({
        uuidCAPIFacebook: uuidActual
      })
    }
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      this.setState({
        user: user
      })
    }
    this.setState({
      //selected: this.props.currentCatalog
      selected: false
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
    let styleItem = { width: 'auto' }
    if (this.state.sizeProductCard === 'small') {
      styleItem = { width: 100 }
    } else if (this.state.sizeProductCard === 'normal') {
      styleItem = { width: 300 }
    } else if (this.state.sizeProductCard === 'big') {
      styleItem = { width: 400 }
    }

    styleItem = { width: '100%' }

    return (
      <div className={(!this.state.withInformation) ? classes.itemNoInfo : classes.item} style={styleItem} >
        {
          (Utils.isUserLoggedIn()) ?
            (this.props.currentCatalogStatus) ?
              <Checkbox
                color="primary"
                className={classes.checkbox}
                checked={this.state.selected}
                onChange={() => this.handleChange()}
              />
              :
              <div>
                {
                  (this.state.selected) ?
                    this.setState({
                      selected: false
                    })
                    :
                    ''
                }
              </div>
            :
            ''
        }
        {
          (this.props.cancelButton) ?
            <IconButton className={classes.checkbox} onClick={((this.props.cancelAction))}>
              <Icon>
                <CancelOutlinedIcon />
              </Icon>
            </IconButton>
            :
            ''
        }
        <a href={product.url}
          onClick={async () => {
            // Método para agregar producto a productos vistos
            (product.code !== undefined) ? this.addSeenProducts(product.code) : ''

            if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
              let dateSending = new Date();
              gtag('event', 'select_content', {
                "content_type": "product",
                "items": [
                  {
                    "id": this.props.data.code,
                    "name": this.props.data.name,
                    "list_name": "CategoryExplorer",
                    "brand": this.props.data.brand.name,
                    "category": this.props.data.categoryCode,
                    "price": this.props.data.price
                  }
                ]
              })

              fbq('track', 'ViewContent', {
                'content_ids': [this.props.data.code],
                'content_name': this.props.data.name,
                'content': [this.props.data],
                'content_type': 'CategoryExplorer',
                'currency': 'MXN',
                'valye': this.props.data.price
              }, { eventID: 'ViewContent' })

              if (this.state.user !== null && this.state.user !== undefined) {

                let eventToFacebook = {
                  "data": [
                    {
                      "event_name": 'ViewContent',
                      'event_time': Utils.timeIntoSeconds(dateSending),
                      'user_data': {
                        'fn': await Utils.hashingData(this.state.user.name),
                        'ln': await Utils.hashingData(this.state.user.secondLastName)
                      },
                      'custom_data': {
                        "content_ids": [this.props.product.code],
                        "content_name": this.props.product.name,
                        //'contents': [this.props.product],
                        'currency': 'MXN',
                        'content_type': 'CategoryExplorer',
                        "value": this.props.product.price
                      },
                      'event_id': 'ViewContent',
                      'action_source': 'website'
                    }
                  ]
                }

                await Utils.sendConversionApiFacebook(eventToFacebook, this.state.uuidCAPIFacebook)

              }
            }

          }}
        >
          <>
            {/* {
              (product.percentagePrice > 0) ?
                <div className={classes.itemTag}>
                  <span>{product.percentagePrice}%</span>
                </div>
                :
                ''
            } */}
            {
              (product.photos.length > 0) ?
                (this.state.imageWorking) ?
                  <div className={(!this.state.withInformation) ? classes.imageContainerNoInfo : classes.imageContainer} style={{ borderRadius: '15px', display: 'flex', justifyContent: 'center' }} >
                    <img
                      className={(!this.state.withInformation) ? classes.itemImageNoInfo : classes.itemImage}
                      style={styleItem}
                      src={this.state.selectedPhoto}
                      onMouseOver={() => { this.changePhoto(1) }}
                      onMouseLeave={() => { this.changePhoto(0) }}
                      alt={product.detail.title}
                      onError={() => {
                        this.setState({ imageWorking: false })
                      }}
                    />
                  </div>
                  :
                  <img
                    className={classes.itemImagePlaceholder}
                    style={styleItem}
                    src={Utils.getPlaceholderByGender(1)}
                    onMouseOver={() => { this.changePhoto(1) }}
                    onMouseLeave={() => { this.changePhoto(0) }}
                    alt={product.detail.title}
                  />
                :
                <img
                  className={classes.itemImagePlaceholder}
                  style={styleItem}
                  src={Utils.getPlaceholderByGender(1)}
                  onMouseOver={() => { this.changePhoto(1) }}
                  onMouseLeave={() => { this.changePhoto(0) }}
                  alt={product.detail.title}
                />
            }
            {
              (product.bluePoints.status) ?
                <div style={{ padding: 0, margin: 0, textAlign: 'center', position: 'absolute', top: 8, right: 8, fontSize: 12, background: '#42c8f4', color: 'white', width: 52, height: 52, borderRadius: '50%' }}>
                  <p style={{ margin: 0, padding: 0, marginTop: 4, color: 'white' }}>
                    <strong style={{ fontSize: 18, display: 'block', marginBottom: -6 }}>{product.bluePoints.win}</strong>
                    <span>puntos</span>
                  </p>
                </div>
                :
                ''
            }
            {
              (this.state.withInformation) ?
                <div className={classes.itemDescription}>

                  {/* {(product.percentagePrice > 0) ?
                    <div style={{ padding: 0, margin: 0, textAlign: 'center', position: 'absolute', top: 8, right: 8, fontSize: 12, color: 'white', width: 48, height: 48, borderRadius: '50%' }}>
                      <img src="/buenfin.svg" />
                    </div>
                    :
                    ''} */}

                  {
                    (product.percentagePrice > 0) ?
                      <div style={{ backgroundColor: '#ffe8eb', display: 'inline-block', borderRadius: '5px', padding: 5 }}>
                        <Typography style={{ fontSize: 14, fontWeight: 500, color: '#d11e0a' }}>Oferta {product.percentagePrice}%</Typography>
                      </div> : ''
                  }

                  <Typography variant="body1" className={classes.itemName} style={{ fontSize: 14, fontWeight: 400 }}>{product.name}</Typography>

                  {
                    (product.percentagePrice > 0) ?
                      <Grid container direction="row" alignItems="center">
                        <Typography variant="body1" className={classes.itemPrice}>${Utils.numberWithCommas(product.discountPrice.toFixed(2))}</Typography>
                        <Box width={5}></Box>
                        <Typography variant="body1" className={classes.itemOldPrice}>${Utils.numberWithCommas(product.price.toFixed(2))}</Typography>
                      </Grid>
                      :
                      <Typography variant="body1" className={classes.itemPrice}>${Utils.numberWithCommas(product.price.toFixed(2))} <span style={{ fontSize: 12 }}></span></Typography>
                  }
                  {
                    (product.creditPrice > 0) ?
                      <Typography variant="body1" className={classes.itemPrice} style={{ color: 'red', overflow: 'hidden', width: '100%', textOverflow: 'ellipsis' }} ><span style={{ color: '#68686a', fontSize: 12 }}>Desde ${Utils.numberWithCommas(product.partialityPrice.toFixed(2))} quincenales</span></Typography>
                      :
                      ''
                  }

                </div>
                :
                ''
            }

          </>
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
