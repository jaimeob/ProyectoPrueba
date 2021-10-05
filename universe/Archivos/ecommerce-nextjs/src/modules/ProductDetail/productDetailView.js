import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'
import Axios from 'axios'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { Typography, FormControl, Select, Paper, Button, Hidden, Icon } from '@material-ui/core'

// Utils
import Utils from '../../resources/Utils'
import { addProductToShoppingCart, openShoppingCart, updateAllProductFrontShoppingCart } from '../../actions/actionShoppingCart'
import { getDeliveryAddress } from '../../actions/actionDeliveryAddress'
import { requestAPI } from '../../api/CRUD'

// Components
import BasicBlock from '../../components/BasicBlock'
import BenefitBlock from '../../components/BenefitBlock'
import SeenProductsBlock from '../../components/SeenProductsBlock'
import LocatorModal from '../../components/LocatorModalDesign'
import Empty from '../../components/Empty'
import HotShoppingNew from '../../components/HotShoppingNew'
import Axios from 'axios'
import Loading from '../../components/Loading'

const styles = theme => ({
  productDetailContainer: {
    width: '100%',
    margin: '0 auto'
  },
  imageList: {
    marginTop: 48,
    listStyle: 'none'
  },
  imageItem: {
    padding: 4,
    margin: '8px 0',
    border: '2px solid #F4F4F4',
    cursor: 'pointer',
    width: '85%',
    height: 'auto',
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      width: '8%',
      margin: '0.5%'
    }
  },
  productTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
    [theme.breakpoints.down('sm')]: {
      marginTop: 0
    },
    [theme.breakpoints.down('sm')]: {
      marginBottom: 8
    }
  },
  descriptionTitle: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    color: 'gray',
    [theme.breakpoints.down('sm')]: {
      marginTop: 0,
      marginBottom: 16,
      padding: '0px 16px'
    }
  },
  zoomImageContainer: {
    marginTop: 16,
    width: '90%',
    margin: '0 auto'
  },
  zoomImageVerticalContainer: {
    marginTop: 16,
    width: '60%',
    margin: '0 auto'
  },
  image: {
    cursor: 'zoom-in',
    width: '100%'
  },
  infoList: {
    backgroundColor: '#F4F4F4',
    margin: 16,
    padding: 16,
    listStyle: 'none',
    textAlign: 'center'
  },
  infoItem: {
    marginTop: 8,
    marginBottom: 8
  },
  infoItemPrice: {
    fontSize: 32,
    color: theme.palette.primary.main
  },
  sizeItem: {
    padding: 8,
    margin: '1%',
    width: '23%',
    backgroundColor: 'white',
    color: 'black',
    borderRadius: 4,
    cursor: 'pointer'
  },
  sizeItemSelected: {
    padding: 8,
    margin: 4,
    margin: '1%',
    width: '23%',
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4,
    cursor: 'pointer'
  },
  infoPercentageDiscount: {
    padding: 4,
    width: '80%',
    margin: '0 auto',
    color: 'white',
    backgroundColor: 'red',
    fontSize: 14,
    fontWeight: 800,
    borderRadius: 10,
    marginTop: 16
  },
  infoOldPrice: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 400,
    color: 'red',
    textDecoration: 'line-through'
  },
  currentImg: {
    padding: '2px 2px 0px 2px',
    border: '2px solid #0076BD',
    borderRadius: 4,
    cursor: 'pointer',
    marginLeft: 2,
    marginRight: 2
  },
  notCurrentImg: {
    padding: '2px 2px 0px 2px',
    border: '2px solid white',
    borderRadius: 4,
    marginLeft: 2,
    marginRight: 2,
    cursor: 'pointer',
    '&:hover': {
      color: 'grey'
    }
  }
})

class ProductDetail extends Component {
  constructor(props) {
    super(props)

    this.state = {
      stock: true,
      user: null,
      loadingViews: true,
      loadingProduct: true,
      location: null,
      disabledSelect: true,
      openLocatorModal: false,
      locatorData: null,
      openSnack: false,
      messageSnack: '',
      blocks: [],
      selectedPhoto: '',
      isVertical: false,
      sizes: [],
      selectedSize: 0,
      selectedArticle: '',
      totalAvailable: null,
      clickFrom: '',
      colors: [],
      colorIdx: '',
      imageMagnifyWorking: true,
      openHotShoppingModal: false,
      fromClickAndCollect: false,
      uuidCAPIFacebook: null
    }

    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.handleChangeSizes = this.handleChangeSizes.bind(this)
    this.changePhoto = this.changePhoto.bind(this)
    this.loadSizes = this.loadSizes.bind(this)
    this.handleAddProductToShoppingCart = this.handleAddProductToShoppingCart.bind(this)
    this.openShoppingCart = this.openShoppingCart.bind(this)
    this.handleOpenLocatorModal = this.handleOpenLocatorModal.bind(this)
    this.getSizeName = this.getSizeName.bind(this)
    this.getLocationProduct = this.getLocationProduct.bind(this)
    this.isVertical = this.isVertical.bind(this)
    this.handleOpenWhatsApp = this.handleOpenWhatsApp.bind(this)

  }

  async isVertical(source) {
    let response = await Utils.checkImage(Utils.constants.HOST_CDN_AWS + '/thumbs/' + source)
    if (response.direction === 'VERTICAL') {
      return true
    }
    return false
  }

  async getLocationProduct(zip) {
    let response = await Axios({
      method: 'POST',
      url: Utils.constants.CONFIG_ENV.HOST_API + '/products/locations',
      data: {
        data: {
          deliveryZip: zip,
          products: [{
            code: this.props.product.code,
            size: this.state.selectedSize,
            stock: this.props.product.stock,
            quantity: 1
          }]
        }
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.length === 1) {
        this.setState({
          location: response.data[0]
        })
      }
    }
  }

  getSizeName(size) {
    let sizeName = ''
    this.props.product.sizes.forEach((item, idx) => {
      if (Number(item) === Number(size.size)) {
        if (this.props.product.measurements !== undefined && this.props.product.measurements.length > 0) {
          sizeName = this.props.product.measurements[idx]
        } else {
          sizeName = this.props.product.sizes[idx]
        }
      }
    })
    return sizeName
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (prevProps.delivery !== this.props.delivery) {
        if (this.props.delivery !== undefined && this.props.delivery.data !== undefined && this.props.delivery.data !== null) {
          if (this.props.product !== null && (this.state.selectedSize !== 0 || !this.props.product.showSizeSelector)) {
            this.getLocationProduct(this.props.delivery.data.zip)
          }
        }
      }
    }
  }

  componentDidMount() {
    this.setState({ loadingViews: false })
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
    Utils.scrollTop()
    if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
      let dateSending = new Date();
      gtag('event', 'view_item', {
        "items": [
          {
            "id": this.props.product.code,
            "name": this.props.product.name,
            "list_name": "CategoryExplorer",
            "brand": this.props.product.brand.name,
            "category": this.props.product.categoryCode,
            "price": this.props.product.price
          }
        ]
      })

      fbq('track', 'ViewContent', {
        "content_ids": [this.props.product.code],
        "content_name": this.props.product.name,
        'contents': [this.props.product],
        "content_type": 'ProductDetail',
        "currency": 'MXN',
        "value": this.props.product.price
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
                "value": this.props.product.price,
                "currency": "MXN"
              },
              'event_id': 'ViewContent',
              'action_source': 'website'
            }
          ]
        }

        await Utils.sendConversionApiFacebook(eventToFacebook, this.state.uuidCAPIFacebook)
      }
    }

    let isVertical = await this.isVertical(this.props.product.photos[0].description)
    this.setState({
      selectedPhoto: this.props.product.photos[0].description,
      isVertical: isVertical,
      colorIdx: this.props.configs.colorIdx
    }, () => {
      if (this.props.product.showSizeSelector) {
        this.loadSizes()
      } else {
        this.loadSizes(true)
      }
    })
  }

  async loadSizes(selected = false) {
    const self = this
    let sizes = {}

    let responseStock = await Axios({
      method: 'GET',
      url: Utils.constants.CONFIG_ENV.HOST_API + '/products/' + this.props.product.code + '/stock',
      headers: {
        uuid: Utils.constants.CONFIG_ENV.uuid
      }
    })

    if (responseStock.status === Utils.constants.status.SUCCESS) {
      if (responseStock.data.length > 0) {
        responseStock.data.forEach((data) => {
          try {
            sizes[data.size].push(data)
          }
          catch (err) {
            sizes[data.size] = []
            sizes[data.size].push(data)
          }
        })
      }
    }

    let finalSizes = []
    let quantity = 0
    sizes = Utils.jsonToArray(sizes)
    sizes.forEach((size, idx) => {
      size.forEach((s) => {
        quantity += Number(s.stock)
      })
      finalSizes.push({
        size: size[0].size,
        quantity: quantity,
        detail: size
      })
      quantity = 0
    })

    finalSizes = Utils.orderBy(finalSizes, 'size', 'asc')

    let disabledSelect = true
    if (finalSizes.length > 0)
      disabledSelect = false

    let stock = false
    if (finalSizes.length > 0) {
      stock = true
    }

    this.setState({
      stock: stock,
      loadingProduct: false,
      sizes: finalSizes,
      selectedSize: 0,
      selectedArticle: '',
      totalAvailable: null,
      disabledSelect: disabledSelect
    }, () => {
      if (selected) {
        let totalAvailable = null
        let selectedArticle = ''

        this.state.sizes.forEach((item) => {
          if (Number(item.size) === Number(finalSizes[0].size)) {
            selectedArticle = item.detail[0].article
            totalAvailable = item.quantity
          }
        })

        if (finalSizes[0] === undefined) {
          this.setState({
            stock: false,
            location: null,
            selectedSize: 0,
            selectedArticle: '',
            totalAvailable: null
          })
        } else {
          this.setState({
            location: null,
            selectedSize: Number(finalSizes[0].size),
            selectedArticle: selectedArticle,
            totalAvailable: totalAvailable
          }, () => {
            self.props.getDeliveryAddress()
          })
        }
      }
    })
  }

  openShoppingCart() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    }, () => {
      this.props.openShoppingCart(true)
    })
  }

  handleOpenLocatorModal() {
    if (this.state.totalAvailable === null) {
      this.setState({
        openSnack: true,
        clickFrom: '',
        messageSnack: 'Selecciona una talla.'
      })
    } else {
      this.setState({
        openLocatorModal: true,
        locatorData: {
          product: this.props.product,
          selectedArticle: this.state.selectedArticle,
          selectedSize: this.state.selectedSize,
          sizes: this.state.sizes
        }
      })
    }
  }
  async loadData() {
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
      if (!Utils.isEmpty(response.data)) {
        this.props.updateAllProductFrontShoppingCart(response.data.products)
        this.setState({
          cart: response.data,
          products: response.data.products
        })
      }
    }
  }

  async handleAddProductToShoppingCart(method = '') {
    this.setState({ loadingProduct: true })
    if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
      let dateSending = new Date();
      gtag('event', 'conversion', {
        'send_to': this.props.app.data.googleAdsConversionEvents.addToCart,
        'value': this.props.product.price,
        'currency': 'MXN'
      })

      gtag('event', 'add_to_cart', {
        "items": [
          {
            "id": this.props.product.code,
            "name": this.props.product.name,
            "list_name": "CategoryExplorer",
            "brand": this.props.product.brand.name,
            "category": this.props.product.categoryCode,
            "price": this.props.product.price
          }
        ]
      })

      fbq('track', 'AddToCart', {
        "content_ids": this.props.product.code,
        "content_name": this.props.product.name,
        "content_type": this.props.product.categoryCode,
        "currency": 'MXN',
        "value": this.props.product.price
      }, { eventID: 'AddToCart' })

      if (this.state.user !== null && this.state.user !== undefined) {

        let eventToFacebook = {
          "data": [
            {
              "event_name": 'AddToCart',
              'event_time': Utils.timeIntoSeconds(dateSending),
              'user_data': {
                'fn': await Utils.hashingData(this.state.user.name),
                'ln': await Utils.hashingData(this.state.user.secondLastName)
              },
              'custom_data': {
                "content_ids": [this.props.product.code],
                "content_name": this.props.product.name,
                "value": this.props.product.price,
                "currency": "MXN"
              },
              'event_id': 'AddToCart',
              'action_source': 'website'
            }
          ]
        }

        await Utils.sendConversionApiFacebook(eventToFacebook, this.state.uuidCAPIFacebook)
      }
    }

    let messageError = 'Ocurrió un problema al intentar agregar un producto a tu carrito. Inténtalo de nuevo más tarde.'
    if (this.state.totalAvailable === null && this.props.product.stock.status) {
      this.setState({
        openSnack: true,
        messageSnack: 'Selecciona una talla.',
        loadingProduct: false
      })
    }
    else {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'carts',
        endpoint: '/add',
        data: {
          product: this.props.product.code,
          article: this.state.selectedArticle,
          size: this.state.selectedSize,
          quantity: 1
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.added) {
          let product = Utils.cloneJson(this.props.product)
          this.props.addProductToShoppingCart(product)
          this.props.openShoppingCart(true)

          if (this.props.product.showSizeSelector) {
            this.setState({
              selectedSize: 0,
              selectedArticle: '',
              totalAvailable: null,
              loadingProduct: false
            })
          }

          if (Utils.isEmpty(method)) {
            this.setState({
              openSnack: true,
              clickFrom: 'addToShoppingCart',
              messageSnack: 'Producto agregado al carrito de compras. (Código: ' + product.code + ')',
              loadingProduct: false
            })
          } else {
            if (Utils.isUserLoggedIn()) {
              Router.push(Utils.constants.paths.checkout + '' + method)
            }
            else {
              Router.push(Utils.constants.paths.login + '?checkout=true')
            }
          }
        } else {
          this.setState({
            openSnack: true,
            messageSnack: messageError,
            loadingProduct: false
          })
        }
      } else {
        if (response.data.error.error.code !== undefined) {
          messageError = response.data.error.error.message
        }
        this.setState({
          openSnack: true,
          messageSnack: messageError,
          loadingProduct: false
        })
      }
    }
  }

  async changePhoto(idx) {
    let selectedPhoto = ''
    let product = this.props.product
    let isVertical = false
    try {
      product.photos.forEach((image, i) => {
        product.photos[i].selected = false
      })
      product.photos[idx].selected = true
      selectedPhoto = product.photos[idx].description
      isVertical = await this.isVertical(selectedPhoto)
    } catch (err) {
      product.photos = []
    }

    this.setState({
      product: product,
      selectedPhoto: selectedPhoto,
      isVertical: isVertical,
      imageMagnifyWorking: true
    })
  }

  handleChangeSizes(event, option) {
    event.preventDefault()
    const self = this
    let totalAvailable = null
    let size = Number(option.size)
    let selectedArticle = ''

    /*
    if (size === 0) { disabledButton = true }
    else {}
    */

    this.state.sizes.forEach((item) => {
      if (Number(item.size) === size) {
        selectedArticle = item.detail[0].article
        totalAvailable = item.quantity
      }
    })

    this.setState({
      location: null,
      selectedSize: size,
      selectedArticle: selectedArticle,
      totalAvailable: totalAvailable
    }, () => {
      self.props.getDeliveryAddress()
    })
  }

  async handleChangeColor(idx) {
    let product = this.props.configs.colors[idx]
    product.photos.forEach(photo => {
      photo.selected = false
    })

    product.photos[0].selected = true

    let isVertical = false
    isVertical = await this.isVertical(product.photos[0].description)

    this.setState({
      product,
      selectedPhoto: product.photos[0].description,
      isVertical: isVertical,
      imageMagnifyWorking: true,
      sku: product.code,
      selectedSize: 0,
      colorIdx: idx
    }, () => {
      Router.push(product.url)
    })
  }

  handleCloseSnackbar() {
    this.setState({
      messageSnack: ''
    })
  }

  handleOpenWhatsApp() {
    window.location.href = 'https://api.whatsapp.com/send?phone=526677515229&text=Hola, necesito información de este producto: https://' + this.props.app.data.domain + this.props.product.url
  }

  render() {
    const self = this
    const { classes } = this.props
    return (
      <div className={classes.productDetailContainer}>
        {
          (this.props.product !== null) ?
            <Grid container>
              <Hidden smDown>
                <Grid item lg={1} md={1} sm={12} xs={12}>
                  <ul className={classes.imageList}>
                    {
                      this.props.product.photos.map((image, idx) => {
                        return (
                          <li key={idx} className={classes.imageItem} style={image.selected ? { border: '2px solid #0076BD' } : {}} onClick={() => { self.changePhoto(idx) }}>
                            {
                              (!image.imageWorking) ?
                                <img style={{ width: '100%' }} src={Utils.constants.HOST_CDN_AWS + '/thumbs/' + image.description} alt=" " onError={() => { image.imageWorking = true }} />
                                :
                                <img style={{ width: '100%' }} src={Utils.getPlaceholderByGender(self.props.product.genderCode)} alt=" " />
                            }
                          </li>
                        )
                      })
                    }
                  </ul>
                </Grid>
              </Hidden>
              <Grid item lg={8} md={8} sm={8} xs={12}>
                <div className={(this.state.isVertical) ? classes.zoomImageVerticalContainer : classes.zoomImageContainer}>
                  {/*
                    (this.props.product.percentagePrice > 0) ?
                    <img src={hotSaleImg} style={{ position: 'relative', marginTop: -8, float: 'left', width: 122 }} />
                    :
                    ''
                  */}
                  {
                    (this.state.imageMagnifyWorking) ?
                      <img onClick={() => { window.open(Utils.constants.HOST_CDN_AWS + '/zoom/' + this.state.selectedPhoto, "_self") }} className={classes.image} src={Utils.constants.HOST_CDN_AWS + '/zoom/' + this.state.selectedPhoto} />
                      :
                      <Empty isLoading={true} title="Cargando imagen" description="Espere un momento, por favor." />
                  }
                  {/*
                    (this.state.imageMagnifyWorking) ?
                      <ReactImageMagnify
                        {
                        ...{
                          smallImage: {
                            style: { cursor: 'zoom-in' },
                            isFluidWidth: true,
                            src: Utils.constants.HOST_CDN_AWS + '/zoom/' + this.state.selectedPhoto,
                            onError: () => {
                              self.setState({
                                imageMagnifyWorking: false
                              })
                            }
                          },
                          largeImage: {
                            src: Utils.constants.HOST_CDN_AWS + '/zoom/' + this.state.selectedPhoto,
                            width: ((this.state.isVertical) ? 1200 : 2206),
                            height: ((this.state.isVertical) ? 1050 : 1512),
                            onError: () => {
                              self.setState({
                                imageMagnifyWorking: false
                              })
                            }
                          },
                          shouldUsePositiveSpaceLens: false,
                          enlargedImagePosition: 'over'
                        }
                        }
                      />
                      :
                      <ReactImageMagnify
                        {
                        ...{
                          smallImage: {
                            isFluidWidth: true,
                            src: Utils.getPlaceholderByGender(this.props.product.genderCode),
                          },
                          shouldUsePositiveSpaceLens: false,
                          enlargedImagePosition: 'over'
                        }
                        }
                      />
                  */}
                </div>
                <Hidden mdUp>
                  <Grid item sm={12} xs={12} md={12}>
                    <ul className={classes.imageList} style={{ margin: '16px auto', marginBottom: 0, paddingLeft: '4%', width: '100%', paddingRight: '0' }}>
                      {
                        this.props.product.photos.map((image, idx) => {
                          return (
                            <li key={idx} className={classes.imageItem} style={image.selected ? { border: '2px solid #0076BD', display: 'inline-block' } : { display: 'inline-block' }} onClick={() => { self.changePhoto(idx) }}>
                              {
                                (!image.imageWorking) ?
                                  <img style={{ width: '100%' }} src={Utils.constants.HOST_CDN_AWS + '/thumbs/' + image.description} alt=" " onError={() => { image.imageWorking = true }} />
                                  :
                                  <img style={{ width: '100%' }} src={Utils.getPlaceholderByGender(self.props.product.genderCode)} alt=" " />
                              }
                            </li>
                          )
                        })
                      }
                    </ul>
                  </Grid>
                </Hidden>
                <Hidden xsDown>
                  {
                    (this.props.configs.colors.length > 0) ?
                      <Grid container justify="center" direction="row" alignItems="center" alignContent="center" style={{ width: 'auto', textAlign: 'center', margin: '0 auto', marginTop: 24 }}>
                        {
                          this.props.configs.colors.map((version, idx) => {
                            if (version.color !== undefined) {
                              return (
                                <Grid item className={(version.code === self.props.product.code) ? classes.currentImg : classes.notCurrentImg} onClick={(event) => { self.handleChangeColor(idx) }}>
                                  {
                                    (version.photos.length > 0) ?
                                      <img value={idx} width={100} src={Utils.constants.HOST_CDN_AWS + "/normal/" + version.photos[0].description} onError={() => { version.imageWorking = true }}></img>
                                      :
                                      <img value={idx} width={100} src={Utils.getPlaceholderByGender(version.genderCode)}></img>
                                  }
                                </Grid>
                              )
                            }
                          })
                        }
                      </Grid>
                      : ""
                  }
                </Hidden>
              </Grid>
              {
                <Grid item lg={3} md={3} sm={4} xs={12}>
                  <ul className={classes.infoList}>
                    <li className={classes.infoItem}>
                      <Typography variant="h4" className={classes.productTitle}>{this.props.product.brand.name}</Typography>
                      <Typography variant="body1" className={classes.descriptionTitle}>{this.props.product.name}</Typography>
                    </li>
                    <li className={classes.infoItem}>
                      <Typography variant="body1">{this.props.product.code}</Typography>
                      <Typography variant="body2">Código</Typography>
                    </li>
                    {
                      (this.props.product.percentagePrice > 0) ?
                        <li className={classes.infoItem}>
                          <Typography variant="body2" className={classes.infoPercentageDiscount}>{this.props.product.percentagePrice} % DESCUENTO</Typography>
                          <Typography variant="body2" className={classes.infoOldPrice}>Anterior: $ {Utils.numberWithCommas(this.props.product.price.toFixed(2))}</Typography>
                          <Typography variant="h2" className={classes.infoItemPrice}>$ {Utils.numberWithCommas(this.props.product.discountPrice.toFixed(2))}</Typography>
                          <Typography variant="body2">Precio al contado</Typography>
                        </li>
                        :
                        <li className={classes.infoItem}>
                          <Typography variant="h2" className={classes.infoItemPrice}>$ {Utils.numberWithCommas(this.props.product.price.toFixed(2))}</Typography>
                          <Typography variant="body2">Precio al contado</Typography>
                        </li>
                    }
                    {
                      (this.props.product.bluePoints.status) ?
                        <>
                          <div style={{ padding: 16, margin: 0, textAlign: 'center', fontSize: 12, background: '#42c8f4', color: 'white', width: 80, height: 80, display: 'inline-block', borderRadius: '50%' }}>
                            <p style={{ margin: 0, padding: 0, color: 'white' }}>
                              <strong style={{ fontSize: 18, display: 'block' }}>{this.props.product.bluePoints.win}</strong>
                              <span>puntos</span>
                            </p>
                          </div>
                          <div style={{ marginTop: 12, fontSize: 11 }}>
                            <Typography variant="body1" style={{ fontSize: 11, color: 'gray', margin: 0, padding: 0 }}>Más información en</Typography>
                            <a style={{ color: '#42c8f4' }} href="https://www.monederoazul.com">www.monederoazul.com</a>
                          </div>
                        </>
                        :
                        ''
                    }
                    {
                      (this.props.product.creditPrice > 0) ?
                        <li style={{ marginTop: 16 }}>
                          <Grid container>
                            <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                              <img src={'/credivale.svg'} style={{ width: 54, float: 'right', marginRight: 8 }} />
                            </Grid>
                            <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                              <Typography variant="body2" className={classes.itemPrice} style={{ marginTop: '-10px', textAlign: 'left' }} ><span style={{ textAlign: 'left', fontSize: 12, lineHeight: '1', fontWeight: 200 }}>Desde <span style={{ color: 'red', fontWeight: 800, fontSize: 15 }}>${Utils.numberWithCommas((self.props.product.partialityPrice).toFixed(2))}</span> quincenales</span></Typography>
                              <Typography variant="body2" style={{ marginTop: '-10px', textAlign: 'left' }} ><span style={{ textAlign: 'left', fontSize: 12, lineHeight: '1', fontWeight: 200 }}>con tu crédito CrediVale ®</span></Typography>
                            </Grid>
                            {
                              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
                                <Typography variant="body1" style={{ textAlign: 'center', fontSize: 14, lineHeight: '1' }} >(Paga <strong style={{ fontSize: 15, fontWeight: 800, color: 'red' }}>${Utils.numberWithCommas(this.props.product.creditPrice.toFixed(2))}</strong> en {this.props.product.partiality} quincenas)</Typography>
                              </Grid>
                            }
                          </Grid>
                        </li>
                        :
                        ''
                    }
                    {
                      <li className={classes.infoItem} style={{ marginTop: 24 }}>
                        {
                          (this.props.configs.colors.length > 1 && this.state.stock) ?
                            <Grid style={{ marginBottom: 16 }}>
                              <Typography variant="body1">Opciones</Typography>
                              <FormControl variant="outlined" style={{ width: '95%' }}>
                                <Select
                                  disabled={this.state.disabledSelect}
                                  native
                                  onChange={(event) => { this.handleChangeColor(event.target.value) }}
                                  value={this.state.colorIdx}
                                >
                                  {
                                    this.props.configs.colors.map((version, idx) => {
                                      return (
                                        <option value={idx}>{version.color.description}</option>
                                      )
                                    })
                                  }
                                </Select>
                              </FormControl>
                            </Grid>
                            : ""
                        }
                        {
                          (this.props.product.showSizeSelector) ?
                            <div>
                              {
                                (!this.state.loadingProduct && this.state.stock) ?
                                  <>
                                    <div style={{ marginBottom: 8 }}>
                                      <Typography variant="body1">Tallas disponibles</Typography>
                                    </div>
                                    <Grid container style={{ textAlign: 'center' }}>
                                      {
                                        (this.state.sizes.length >= 0) ?
                                          this.state.sizes.map(function (size, i) {
                                            return (
                                              <Grid item className={(self.state.selectedSize === Number(size.size)) ? classes.sizeItemSelected : classes.sizeItem} style={{ textAlign: 'center' }} onClick={(event) => { self.handleChangeSizes(event, size) }}>
                                                <span style={{ fontSize: 14, fontWeight: 200 }}>{self.getSizeName(size)}</span>
                                              </Grid>
                                            )
                                          })
                                          :
                                          ''
                                      }
                                    </Grid>
                                    <br />
                                    {
                                      (this.state.totalAvailable !== null) ?
                                        (this.state.totalAvailable !== 0) ?
                                          (this.state.totalAvailable === 1) ?
                                            <Typography variant="body2" style={{ color: 'red' }}>Solo 1 disponible.</Typography>
                                            :
                                            (this.state.totalAvailable < 10) ?
                                              <Typography variant="body2" style={{ color: 'red' }}>{this.state.totalAvailable} disponibles.</Typography>
                                              :
                                              ''
                                          :
                                          <Typography variant="body2" style={{ color: 'red' }}>No hay disponibilidad.</Typography>
                                        :
                                        <Typography variant="body2">Selecciona una talla</Typography>
                                    }
                                  </>
                                  :
                                  <>
                                    {
                                      (this.state.stock) ?
                                        <Loading />
                                        :
                                        <div style={{ padding: '8px 0' }}>
                                          <Typography variant="body2" style={{ color: 'red', fontWeight: 600 }}>Producto no disponible</Typography>
                                          <Button variant="contained" style={{ background: '#075E54', color: 'white', textTransform: 'none', fontSize: 16, marginTop: 16, width: '100%' }} onClick={() => { this.handleOpenWhatsApp() }}>
                                            <img style={{ width: 20, marginRight: 8 }} src="./whatsapp.svg" /> Solicitar atención
                                          </Button>
                                        </div>
                                    }
                                  </>
                              }
                            </div>
                            :
                            <>
                              {
                                (!this.state.stock) ?
                                  <div style={{ padding: '8px 0' }}>
                                    <Typography variant="body2" style={{ color: 'red', fontWeight: 600 }}>Producto no disponible</Typography>
                                    <Button variant="contained" style={{ background: '#075E54', color: 'white', textTransform: 'none', fontSize: 16, marginTop: 16, width: '100%' }} onClick={() => { this.handleOpenWhatsApp() }}>
                                      <img style={{ width: 20, marginRight: 8 }} src="./whatsapp.svg" /> Solicitar atención
                                    </Button>
                                  </div>
                                  :
                                  ''
                              }
                            </>
                        }
                        {/*
                          (this.props.product.showSizeSelector) ?
                          <div>
                            <Typography variant="body1">Tallas</Typography>
                            <FormControl variant="outlined" style={{ width: '95%' }}>
                              <Select
                                disabled={this.state.disabledSelect}
                                native
                                value={this.state.selectedSize}
                                onChange={(event) => { this.handleChangeSizes(event) }}
                                inputProps={{
                                  name: 'age',
                                  id: 'outlined-age-native-simple',
                                }}
                              >
                                <option value={0}>-</option>
                                {
                                  (this.state.sizes.length >= 0) ?
                                    this.state.sizes.map(function (size) {
                                      return (
                                        <option value={Number(size.size)}>{self.getSizeName(size)}</option>
                                      )
                                    })
                                    :
                                    ''
                                }
                              </Select>
                            </FormControl>
                            {
                              (this.state.totalAvailable !== null) ?
                                (this.state.totalAvailable !== 0) ?
                                  (this.state.totalAvailable === 1) ?
                                    <Typography variant="body2" style={{ color: 'red' }}>Solo 1 disponible.</Typography>
                                    :
                                    (this.state.totalAvailable < 10) ?
                                      <Typography variant="body2" style={{ color: 'red' }}>{this.state.totalAvailable} disponibles.</Typography>
                                      :
                                      ''
                                  :
                                  <Typography variant="body2" style={{ color: 'red' }}>No hay disponibilidad.</Typography>
                                :
                                <Typography variant="body2">Selecciona una talla</Typography>
                            }
                          </div>
                          :
                          ''
                        */}
                        {
                          (this.state.location !== null) ?
                            <Typography variant="body2" style={{ marginTop: 8, color: this.state.location.color, lineHeight: 1.2, fontSize: 13, fontWeight: 800 }}>{this.state.location.description}</Typography>
                            :
                            ''
                        }
                      </li>
                    }
                    <li className={classes.infoItem}>
                      {
                        (!this.state.loadingProduct && this.state.stock) ?
                          <>
                            {
                              (this.props.product.stock.status) ?
                                <Button variant="contained" color="primary" style={{ textTransform: 'none', fontSize: 16, marginTop: 16, width: '100%' }} onClick={() => { this.handleOpenLocatorModal() }}>
                                  <Icon style={{ fontSize: 16, marginRight: 8 }}>navigation</Icon> Localizar
                                </Button>
                                :
                                ''
                            }
                            {
                              (!this.props.product.restricted) ?
                                <>
                                  <Button variant="contained" style={{ textTransform: 'none', fontSize: 16, background: '#A7E688', color: '#035D59', marginTop: 16, width: '100%' }} onClick={() => { this.handleAddProductToShoppingCart() }}>
                                    <Icon style={{ fontSize: 18, marginRight: 8 }}>shopping_bag</Icon> Agregar al carrito
                                  </Button>
                                  <Button variant="contained" style={{ textTransform: 'none', fontSize: 16, marginTop: 16, backgroundColor: '#FFAA00', width: '100%' }} onClick={(event) => {
                                    event.preventDefault()
                                    if (!Utils.isUserLoggedIn()) {
                                      this.setState({ openSnack: true, messageSnack: 'Es necesario iniciar sesión.', clickFrom: 'login' })
                                      return
                                    }

                                    if (this.state.totalAvailable !== null) {
                                      this.setState({ openHotShoppingModal: true })
                                    }
                                    else {
                                      this.setState({ openSnack: true, messageSnack: 'Selecciona una talla.' })
                                    }
                                  }}>
                                    Comprar ahora
                                  </Button>
                                </>
                                :
                                <>
                                  <Button variant="contained" style={{ textTransform: 'none', fontSize: 16, marginTop: 16, backgroundColor: '#FFAA00', width: '100%' }} onClick={(event) => {
                                    event.preventDefault()
                                    if (!Utils.isUserLoggedIn()) {
                                      this.setState({ openSnack: true, messageSnack: 'Es necesario iniciar sesión.', clickFrom: 'login' })
                                      return
                                    }

                                    if (this.state.totalAvailable !== null) {
                                      this.setState({ openHotShoppingModal: true })
                                    }
                                    else {
                                      this.setState({ openSnack: true, messageSnack: 'Selecciona una talla.' })
                                    }
                                  }}>
                                    Comprar con CrediVale ®
                                  </Button>
                                </>
                            }
                            <Button variant="contained" style={{ textTransform: 'none', fontSize: 16, marginTop: 16, backgroundColor: '#f24848', color: 'white', width: '100%' }} onClick={(event) => {
                              event.preventDefault()
                              if (!Utils.isUserLoggedIn()) {
                                this.setState({ openSnack: true, messageSnack: 'Es necesario iniciar sesión.', clickFrom: 'login' })
                                return
                              }

                              if (this.state.totalAvailable !== null) {
                                this.setState({ openHotShoppingModal: true, fromClickAndCollect: true })
                              }
                              else {
                                this.setState({ openSnack: true, messageSnack: 'Selecciona una talla.' })
                              }
                            }}>
                              Click &amp; Collect
                            </Button>
                            <Typography variant="body2" style={{ fontSize: 13, marginTop: 4 }}>Recoge en tu tienda más cercana.</Typography>
                            <Button variant="contained" style={{ background: '#075E54', color: 'white', textTransform: 'none', fontSize: 16, marginTop: 16, width: '100%' }} onClick={() => { this.handleOpenWhatsApp() }}>
                              <img style={{ width: 20, marginRight: 8 }} src="./whatsapp.svg" /> Solicitar atención
                            </Button>
                          </>
                          :
                          ''
                      }
                      <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <img alt='' src={'/credivale.svg'} style={{ height: 24 }} />
                        <Typography variant="body1" style={{ marginTop: 2, marginBottom: 0, padding: 0 }}><span style={{ fontSize: 11, opacity: 0.8, margin: 0, padding: 0 }}>Paga a crédito con CrediVale ®</span></Typography>
                        <br />
                        <span><img alt='' src={'/mastercard.svg'} style={{ height: 24 }} /> <img alt='' src={'/visa.svg'} style={{ height: 24 }} /></span>
                        <Typography variant="body1" style={{ marginTop: 2, marginBottom: 0, padding: 0 }}><span style={{ fontSize: 11, opacity: 0.8, margin: 0, padding: 0 }}>Hasta 12 meses sin intereses</span></Typography>
                        <Typography variant="body1" style={{ marginTop: '-8px', padding: 0 }}><span style={{ fontSize: 11, opacity: 0.8, margin: 0, padding: 0 }}>con tarjetas participantes.</span></Typography>
                        <br />
                        <img alt='' src={'/oxxo.svg'} style={{ height: 24 }} />
                        <Typography variant="body1" style={{ marginTop: 4, marginBottom: 0, padding: 0 }}><span style={{ fontSize: 11, opacity: 0.8, margin: 0, padding: 0 }}>Paga en efectivo en tiendas OXXO ®</span></Typography>
                        <br />
                        <img alt='' src={'/paypal.svg'} style={{ height: 24 }} />
                        <Typography variant="body1" style={{ marginTop: 2, marginBottom: 0, padding: 0 }}><span style={{ fontSize: 11, opacity: 0.8, margin: 0, padding: 0 }}>Paga con tu cuenta PayPal ®</span></Typography>
                      </div>
                    </li>
                  </ul>
                </Grid>
                ////
              }
              <Hidden smUp>
                {
                  (this.props.configs.colors.length > 0) ?
                    <Grid container justify="center" direction="row" alignItems="center" alignContent="center" style={{ width: 'auto', textAlign: 'center', margin: '0 auto', marginTop: 24 }}>
                      {
                        this.props.configs.colors.map((version, idx) => {
                          if (version.color !== undefined) {
                            return (
                              <Grid item className={(version.code === self.props.product.code) ? classes.currentImg : classes.notCurrentImg} onClick={(event) => { self.handleChangeColor(idx) }}>
                                {
                                  (version.photos.length > 0) ?
                                    <img value={idx} width={100} src={Utils.constants.HOST_CDN_AWS + "/normal/" + version.photos[0].description} onError={() => { version.imageWorking = true }} />
                                    :
                                    <img value={idx} width={100} src={Utils.getPlaceholderByGender(version.genderCode)} />
                                }
                              </Grid>
                            )
                          }
                        })
                      }
                    </Grid>
                    : ""
                }
              </Hidden>
              {
                (!Utils.isEmpty(this.props.product.description)) ?
                  <Grid item lg={12} md={12} sm={12} xs={12}>
                    <Paper style={{ margin: 24, padding: 36 }}>
                      <Typography variant="h4" style={{ fontSize: 24 }}>Información del producto.</Typography>
                      <br />
                      <Typography variant="body1">{this.props.product.description}</Typography>
                    </Paper>
                  </Grid>
                  :
                  ''
              }
            </Grid>
            :
            <div style={{ marginTop: 144 }}>
              <Empty
                isLoading={true}
                title="Cargando producto..."
                description="Espere un momento por favor."
              />
            </div>
        }
        <div style={{ marginTop: 32 }}>
          <BenefitBlock
            title=""
            description=""
          />
        </div>
        <div>
          {
            (this.props.product !== null) ?
              <BasicBlock
                title="Productos relacionados."
                description="Quizás estos productos te puedan interesar."
                resource="products"
                filters={{
                  where: {
                    and: [
                      { genderCode: self.props.product.genderCode },
                      { brandCode: self.props.product.brandCode },
                      { sublineCode: self.props.product.sublineCode },
                      { code: { nlike: self.props.product.code } }
                    ]
                  },
                  limit: 8,
                  include: ['brand']
                }}
              />
              :
              ''
          }
        </div>
        {
          (!this.state.loadingViews) ?
            <>
              <div style={{ marginTop: '1%' }}>
                <SeenProductsBlock recomendation={true} title="Recomendaciones" />
              </div>
              <div style={{ marginTop: '2%' }}>
                <SeenProductsBlock seenProducts={true} title="Vistos recientemente" />
              </div>
            </>
            :
            <Loading />
        }
        {
          (this.state.locatorData !== null) ?
            <LocatorModal
              open={this.state.openLocatorModal}
              host={Utils.constants.CONFIG_ENV.HOST}
              data={this.state.locatorData}
              close={() => { this.setState({ openLocatorModal: false, locatorData: null }) }}
            />
            :
            ''
        }
        <HotShoppingNew open={this.state.openHotShoppingModal} product={this.props.product} fromClickAndCollect={this.state.fromClickAndCollect} selection={{
          size: this.state.selectedSize,
          article: this.state.selectedArticle,
          measurement: this.getSizeName({ size: this.state.selectedSize })
        }} handleClose={() =>
          this.setState({
            openHotShoppingModal: false,
            fromClickAndCollect: false
          })
        }
        />
        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.state.openSnack}
          onClose={() => this.setState({ openSnack: false, messageSnack: '' })}
          message={
            <span>{this.state.messageSnack}</span>
          }
          action={
            (this.state.clickFrom === 'addToShoppingCart') ?
              [
                <Button
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={() => { this.openShoppingCart() }}
                >
                  <Icon style={{ color: '#91E577', fontSize: 14, paddingRight: 8 }}>shopping_cart</Icon> <span style={{ color: '#91E577', fontSize: 14 }}>VER CARRITO</span>
                </Button>,
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={() => this.setState({ openSnack: false, clickFrom: '', messageSnack: '' })}
                >
                  <CloseIcon />
                </IconButton>
              ]
              :
              <>
                {
                  (this.state.clickFrom === 'login') ?
                    [
                      <Button
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={() => { Router.push(Utils.constants.paths.login) }}
                      >
                        <span style={{ fontSize: 14 }}>INGRESAR</span>
                      </Button>,
                      <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={() => this.setState({ openSnack: false, clickForm: '', messageSnack: '' })}
                      >
                        <CloseIcon />
                      </IconButton>
                    ]
                    :
                    <IconButton
                      key="close"
                      aria-label="Close"
                      color="inherit"
                      onClick={() => this.setState({ openSnack: false, clickForm: '', messageSnack: '' })}
                    >
                      <CloseIcon />
                    </IconButton>
                }
              </>
          }
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    addProductToShoppingCart: (product) => {
      dispatch(addProductToShoppingCart(product))
    },
    openShoppingCart: (show) => {
      dispatch(openShoppingCart(show))
    },
    getDeliveryAddress: () => {
      dispatch(getDeliveryAddress())
    },
    updateAllProductFrontShoppingCart: (shoppingCart) => {
      dispatch(updateAllProductFrontShoppingCart(shoppingCart))
    }
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(ProductDetail)
