'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Modal, InputAdornment, Grid, Typography, Select, Button, Snackbar, IconButton, FormControl, Radio, OutlinedInput } from '@material-ui/core'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CloseIcon from '@material-ui/icons/Close'


// Components
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD.js'
import CardModal from './CardModal'
import AddressModal from './AddressModal'
import ValidationSMSModal from './ValidationSMSModal'
import Loading from './Loading'
import GoogleMapReact from 'google-map-react'
import MapModal from './MapModal'
import { createHotShoppingLogs } from '../api/api'
import Label from '@material-ui/icons/Label'
import { RESPONSE_GET_DATA_AUTOCOMPLETE } from '../actions/actionAutocomplete'
import { selectedSize } from '../actions/selectedSize'

function getModalStyle() {
  const top = 50
  const left = 50
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  }
}

const styles = theme => ({
  largeForm: {
    overflowY: 'scroll',
    overflowX: 'hidden',
    position: 'absolute',
    width: theme.spacing(100),
    minWidth: theme.spacing(100),
    maxWidth: theme.spacing(100),
    maxHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '2px',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      background: theme.palette.background.paper,
      minWidth: '100%',
      width: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      paddingLeft: '2.5%',
      paddingRight: '2.5%'
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
  },
  textSubtitle: {
    width: 'auto'
  },
  textSubtitleStep: {
    width: 'auto',
    padding: '0px 6px 0px 6px',
    marginRight: '12px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: 32,
    color: 'white'
  },
  cardContainer: {
    padding: theme.spacing(1),
    cursor: 'pointer'
  },
  cardDesignContainer: {
    padding: '20px 0px 20px 0px',
    borderRadius: '6px',
    boxShadow: '0 1px 4px 0.1px rgba(180, 180, 180, 0.5)'
  },
  cardSelectedDesignContainer: {
    padding: '20px 0px 20px 0px',
    borderRadius: '6px',
    border: 'solid 1px ' + theme.palette.primary.main,
    boxShadow: '0 1px 4px 0.1px rgba(180, 180, 180, 0.5)'
  },
  formControl: {
    padding: theme.spacing(1)
  },
  alertContainer: {
    backgroundColor: '#e2eaf4',
    borderRadius: 3,
    boxShadow: '0 2px 2px 0.1px rgba(180, 180, 180, 0.5)',
    padding: 12
  },
  primaryButton: {
    width: '100%',
    borderRadius: 2
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: "white",
    border: "2px solid " + theme.palette.primary.main,
    borderRadius: 2,
    color: theme.palette.primary.main,
  },
  image: {
    width: '70%',
    marginBottom: '-5px',
    [theme.breakpoints.down("xs")]: {
      width: '90%',
      marginTop: '7px'
    }
  }
})

const BBVA_PAY = 1
const CREDIVALE_PAY = 2
const OXXO_PAY = 3
const PAYPAL = 4
const NETPAY = 5
const MERCADOPAGO = 8
const OPENPAY = 9
const PAYNET = 10

const CLZ_DELIVERY = 1
const DELIVERY = 2
const CLICK_AND_COLLECT = 3
const CALZZAMOVIL = 4


class HotShoppingNew extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingCheckout: true,
      disabledBluePoints: false,
      createOrderLoading: false,
      openMapModal: false,
      openValidationSMS: false,
      validateCellphone: false,
      sizes: [],
      selectedSize: 0,
      selectedArticle: '',
      totalAvailable: null,
      selectedAddress: null,
      paymentMethodSelected: null,
      coupon: '',
      appliedCoupon: false,
      checkout: null,
      addresses: [],
      isVertical: false,
      location: null,
      openAddressModal: false,
      openAddCardModal: false,
      folio: '',
      amount: '',
      folioIne: '',
      card: null,
      bluePoints: '',
      shippingMethodSelected: null,
      selectedState: null,
      states: [],
      selectedZone: null,
      selectedStore: null,
      availableExpressDelivery: false,
      expressDelivery: false,
      cardOpenpay: false,
      openProgressBar: false
    }

    this.handleRender = this.handleRender.bind(this)
    this.loadSizes = this.loadSizes.bind(this)
    this.getSizeName = this.getSizeName.bind(this)
    this.handleChangeSizes = this.handleChangeSizes.bind(this)
    this.loadAddresses = this.loadAddresses.bind(this)
    this.loadStates = this.loadStates.bind(this)
    this.getCheckout = this.getCheckout.bind(this)
    this.checkExpressDelivery = this.checkExpressDelivery.bind(this)
    this.getLocationProduct = this.getLocationProduct.bind(this)

    this.handleChangeAddress = this.handleChangeAddress.bind(this)
    this.handleChangePaymentMethod = this.handleChangePaymentMethod.bind(this)
    this.handleChangeCard = this.handleChangeCard.bind(this)
    this.isVertical = this.isVertical.bind(this)

    this.handleClose = this.handleClose.bind(this)
    this.clearData = this.clearData.bind(this)

    this.handleConfirmWithAddress = this.handleConfirmWithAddress.bind(this)

    this.handleChangeFolio = this.handleChangeFolio.bind(this)
    this.handleChangeAmount = this.handleChangeAmount.bind(this)
    this.handleChangeFolioIne = this.handleChangeFolioIne.bind(this)

    this.handleChangeBluePoints = this.handleChangeBluePoints.bind(this)
    this.applyBluePoints = this.applyBluePoints.bind(this)

    this.createOrder = this.createOrder.bind(this)

    this.getFullSelectedAddress = this.getFullSelectedAddress.bind(this)
    this.getFullSelectedPaymentMethod = this.getFullSelectedPaymentMethod.bind(this)
    this.getFullSelectedCard = this.getFullSelectedCard.bind(this)

    this.handleChangeShippingMethod = this.handleChangeShippingMethod.bind(this)
    this.handleChangeState = this.handleChangeState.bind(this)
    this.handleChangeZone = this.handleChangeZone.bind(this)
    this.handleChangeStore = this.handleChangeStore.bind(this)

    this.getMarkerStore = this.getMarkerStore.bind(this)

    this.handleChangeCoupon = this.handleChangeCoupon.bind(this)
    this.applyCoupon = this.applyCoupon.bind(this)
    this.removeCoupon = this.removeCoupon.bind(this)
    this.getFullSelectedOpenpayCard = this.getFullSelectedOpenpayCard.bind(this)

    this.createLog = this.createLog.bind(this)
    this.validateCredivale = this.validateCredivale.bind(this)

  }

  componentWillMount() {
  }

  clearData() {
    this.setState({
      loadingCheckout: true,
      openValidationSMS: false,
      openMapModal: false,
      createOrderLoading: false,
      sizes: [],
      selectedSize: 0,
      selectedArticle: '',
      totalAvailable: null,
      selectedAddress: null,
      paymentMethodSelected: null,
      coupon: '',
      appliedCoupon: false,
      checkout: null,
      addresses: [],
      isVertical: false,
      location: null,
      openAddressModal: false,
      openAddCardModal: false,
      folio: '',
      amount: '',
      folioIne: '',
      isCredit: false,
      card: null,
      bluePoints: '',
      shippingMethodSelected: null,
      selectedState: null,
      states: [],
      selectedZone: null,
      selectedStore: null,
      availableExpressDelivery: false,
      expressDelivery: false,
      openProgressBar: false
    })
  }

  getMarkerStore(store) {
    if (store.name.toLowerCase().includes('kelder')) {
      return '/kelder-marker.svg'
    } else if (store.name.toLowerCase().includes('urbanna') || store.name.toLowerCase().includes('urbana')) {
      return '/urbanna-marker.svg'
    } else {
      return '/calzzapato-marker.svg'
    }
  }

  async removeCoupon() {
    const self = this
    this.setState({
      coupon: '',
      appliedCoupon: false
    }, () => {
      self.getCheckout()
    })
    this.createLog({ name: 'PUTOUT_COUPON' })

  }

  async applyCoupon() {
    const self = this
    if (!Utils.isEmpty(this.state.coupon)) {
      this.setState({
        appliedCoupon: true
      }, () => {
        self.getCheckout()
      })
      this.createLog({ name: 'PUT_COUPON', info: this.state.coupon })

    }
  }

  handleChangeCoupon(input) {
    this.setState({
      coupon: input.target.value.toUpperCase()
    })
  }

  handleChangeShippingMethod(method) {
    let self = this
    let isCredit = false

    let paymentMethodSelected = this.state.checkout.paymentMethods[0].id
    if (this.props.product.restricted && method !== CLICK_AND_COLLECT) {
      isCredit = true
      paymentMethodSelected = CREDIVALE_PAY
    }

    this.setState({
      paymentMethodSelected: paymentMethodSelected,
      card: null,
      bluePoints: '',
      selectedState: null,
      selectedZone: null,
      selectedStore: null,
      folio: '',
      amount: '',
      folioIne: '',
      isCredit: isCredit,
      shippingMethodSelected: method,
      location: location,
      selectedAddress: null,
      availableExpressDelivery: false,
      expressDelivery: false,
      disabledBluePoints: false
    }, () => {
      self.getCheckout()
      self.getLocationProduct()
    })
    this.createLog({ name: 'SELECT_SHIPPINGMETHOD' })
  }

  handleChangeState(option) {
    let state = null

    this.state.states.forEach(item => {
      if (item.code === option) {
        state = item
      }
    })

    this.setState({
      selectedState: state,
      selectedZone: null,
      selectedStore: null
    })
  }

  handleChangeZone(option) {
    let zone = null

    this.state.selectedState.zones.forEach(item => {
      if (item.code === option) {
        zone = item
      }
    })
    this.setState({
      selectedZone: zone,
      selectedStore: null
    })
  }

  handleChangeStore(option, map = false) {
    let state = null
    let zone = null
    let store = null
    if (map) {
      this.state.states.forEach(stateItem => {
        stateItem.zones.forEach(zoneItem => {
          zoneItem.stores.forEach(storeItem => {
            if (storeItem.code === option) {
              state = stateItem
              zone = zoneItem
              store = storeItem
            }
          })
        })
      })
      this.setState({
        selectedState: state,
        selectedZone: zone,
        selectedStore: store
      })
    } else {
      this.state.selectedZone.stores.forEach(item => {
        if (item.code === option) {
          store = item
        }
      })
      this.setState({
        selectedStore: store
      })
    }
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  handleChangeFolio(input) {
    this.setState({
      folio: input.target.value.toUpperCase().trim()
    })
  }

  handleChangeAmount(input) {
    if (!isNaN(Number(input.target.value.trim()))) {
      this.setState({
        amount: input.target.value.trim()
      })
    }
  }

  handleChangeFolioIne(input) {
    if (!isNaN(Number(input.target.value.trim())) && input.target.value.trim().length <= 4) {
      this.setState({
        folioIne: input.target.value.trim()
      })
    }
  }

  handleConfirmWithAddress(address) {
    const self = this
    let addressess = this.state.addresses
    addressess.push(address)

    this.setState({
      openAddressModal: false,
      addresses: addressess,
      selectedAddress: address.id,
      openSnack: true,
      messageSnack: 'Dirección guardada correctamente.'
    }, () => {
      self.getLocationProduct()
    })
  }

  getFullSelectedAddress() {
    let response = null
    this.state.addresses.forEach(address => {
      if (address.id === this.state.selectedAddress)
        response = address
    })
    return response
  }

  getFullSelectedPaymentMethod() {
    let response = null
    this.state.checkout.paymentMethods.forEach(method => {
      if (method.id === this.state.paymentMethodSelected)
        response = method
    })
    return response
  }

  getFullSelectedCard() {
    let response = null
    this.state.checkout.cards.forEach(card => {
      if (card.id === this.state.card)
        response = card
    })
    return response
  }

  getFullSelectedOpenpayCard() {
    let response = null
    this.state.checkout.cardsOpenpay.forEach(card => {
      if (card.id === this.state.card)
        response = card
    })
    return response
  }

  async isVertical(source) {
    let response = await Utils.checkImage(Utils.constants.HOST_CDN_AWS + '/thumbs/' + source)
    if (response.direction === 'VERTICAL') {
      return true
    }
    return false
  }

  async checkExpressDelivery() {
    let openSnack = false
    let messageSnack = ''
    let expressDelivery = false
    let availableExpressDelivery = false

    let selectedAddress = null
    this.state.addresses.forEach(address => {
      if (address.id === this.state.selectedAddress) {
        selectedAddress = address
      }
    })
    if (this.state.location !== null && this.state.location !== undefined && this.state.location.isLocal && selectedAddress !== null && this.state.location.expressDelivery) {
      openSnack = true
      expressDelivery = true
      availableExpressDelivery = true
      messageSnack = '¡Entrega Express disponible! Recíbelo en tu domicilio hoy mismo.'
    }
    this.setState({
      openSnack: openSnack,
      messageSnack: messageSnack,
      availableExpressDelivery: availableExpressDelivery,
      expressDelivery: expressDelivery
    })
  }

  async getLocationProduct() {
    const self = this
    if (this.props.product.showSizeSelector && this.state.selectedSize === 0) {
      return
    }

    let zip = ''
    this.state.addresses.forEach(address => {
      if (address.id === this.state.selectedAddress) {
        zip = address.zip
      }
    })

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'POST',
      resource: 'products',
      endpoint: '/locations',
      data: {
        deliveryZip: zip,
        products: [{
          code: this.props.product.code,
          size: this.state.selectedSize,
          stock: this.props.product.stock,
          quantity: 1
        }]
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.length === 1) {
        this.setState({
          location: response.data[0]
        }, () => {
          self.checkExpressDelivery()
        })
      }
    }
  }

  handleChangeAddress(value) {
    const self = this
    if (!Utils.isEmpty(value)) {
      this.setState({
        selectedAddress: Number(value)
      }, () => {
        self.getLocationProduct()
      })
    } else {
      this.setState({
        selectedAddress: null,
        availableExpressDelivery: false,
        expressDelivery: false,
      }, () => {
        self.getLocationProduct()
      })
    }
  }

  handleChangePaymentMethod(value) {
    const self = this
    let paymentMethodSelected = null
    this.state.checkout.paymentMethods.forEach(method => {
      if (method.id === Number(value)) {
        paymentMethodSelected = method.id
      }
    })

    let isCredit = false
    if (paymentMethodSelected === CREDIVALE_PAY) {
      isCredit = true
    }

    this.setState({
      isCredit: isCredit,
      paymentMethodSelected: paymentMethodSelected
    }, () => {
      self.getCheckout()
      self.checkExpressDelivery()
    })
  }

  handleChangeCard(value) {
    if (value !== null) {
      this.setState({
        card: Number(value)
      })
    }
  }

  async handleRender() {
    const self = this
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      let shippingMethod = null
      let paymentMethod = null
      if (this.props.fromClickAndCollect !== undefined && this.props.fromClickAndCollect) {
        shippingMethod = CLICK_AND_COLLECT
        paymentMethod = NETPAY
      }

      this.setState({
        shippingMethodSelected: shippingMethod,
        paymentMethod: paymentMethod,
        validateCellphone: user.validationCellphone,
        user: user
      }, () => {
        self.isVertical(self.props.product.photos[0].description)
        self.loadAddresses()
        self.loadStates()
        self.loadSizes()
      })
    } else {
      this.handleClose()
    }
  }

  async loadAddresses() {
    let addresses = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/addresses'
    })

    let favoriteAddressId = null
    let favorite = false
    addresses.data.forEach(address => {
      if (address.favorite) {
        favoriteAddressId = address.id
        favorite = true
      }
    })

    if (!favorite && addresses.data.length > 0) {
      favoriteAddressId = addresses.data[0].id
    }

    this.setState({
      selectedAddress: favoriteAddressId,
      addresses: addresses.data
    })
  }

  async loadStates() {
    let states = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'zones',
      endpoint: '/states/' + this.props.product.code + '/' + this.props.selection.size
    })

    if (states.status === Utils.constants.status.SUCCESS) {
      this.setState({
        states: states.data
      })
    }
  }

  async getCheckout() {
    this.setState({
      loadingCheckout: true
    })

    let isCredit = (this.state.paymentMethodSelected !== null && this.state.paymentMethodSelected === CREDIVALE_PAY)

    if (this.props.product.restricted && this.state.shippingMethodSelected !== CLICK_AND_COLLECT) {
      isCredit = true
    }

    let selection = {
      code: this.props.product.code,
      article: this.state.selectedArticle,
      size: this.state.selectedSize,
      quantity: 1
    }

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'POST',
      resource: 'orders',
      endpoint: '/checkout',
      data: {
        isCredit: isCredit,
        coupon: (this.state.appliedCoupon) ? this.state.coupon : '',
        product: selection,
        bluePoints: (Utils.isEmpty(this.state.bluePoints)) ? 0 : Number(this.state.bluePoints),
        shippingMethodSelected: this.state.shippingMethodSelected
      },
      headers: {
        zip: Utils.getDeliveryAddress().zip
      }
    })

    this.setState({
      loadingCheckout: false
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      let paymentMethodSelected = null

      response.data.paymentMethods.forEach((paymentMethod, idx) => {
        if (isCredit) {
          if (paymentMethod.id === CREDIVALE_PAY) {
            paymentMethodSelected = paymentMethod
          }
        } else {
          if (this.state.paymentMethodSelected !== null) {
            if (paymentMethod.id === this.state.paymentMethodSelected) {
              paymentMethodSelected = paymentMethod
            }
          } else {
            if (idx === 0) {
              paymentMethodSelected = paymentMethod
            }
          }
        }
      })

      let card = this.state.card
      if (card === null && response.data.cards.length > 0) {
        card = response.data.cards[0].id
      }

      let couponCode = this.state.appliedCoupon
      let couponName = this.state.coupon
      let snackBar = {
        status: false,
        message: ''
      }

      if (this.state.appliedCoupon) {
        if (response.data.coupon === null) {
          couponCode = false
          couponName = ''
          snackBar = {
            status: true,
            message: 'Cupón de descuento inválido.'
          }
        } else {
          snackBar = {
            status: true,
            message: 'Cupón de descuento válido.'
          }
        }
      }

      this.setState({
        isCredit: isCredit,
        paymentMethodSelected: paymentMethodSelected.id,
        checkout: response.data,
        appliedCoupon: couponCode,
        coupon: couponName,
        card: card,
        openSnack: snackBar.status,
        messageSnack: snackBar.message
      })
    } else {
      this.handleClose()
    }
  }

  async loadSizes() {
    const self = this
    let sizes = {}

    let responseStock = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'products',
      endpoint: '/' + this.props.product.code + '/stock'
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

    this.setState({
      sizes: finalSizes,
      selectedSize: 0,
      selectedArticle: '',
      totalAvailable: null,
      disabledSelect: disabledSelect
    }, () => {
      if (!Utils.isEmpty(self.props.selection.article)) {
        let totalAvailable = null
        let selectedArticle = ''
        self.state.sizes.forEach((item) => {
          if (Number(item.size) === Number(self.props.selection.size) && item.detail[0].article === self.props.selection.article) {
            selectedArticle = item.detail[0].article
            totalAvailable = item.quantity
          }
        })

        self.setState({
          location: null,
          selectedSize: Number(self.props.selection.size),
          selectedArticle: selectedArticle,
          totalAvailable: totalAvailable
        }, () => {
          self.getCheckout()
        })
      } else {
        self.getCheckout()
      }
    })
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

  handleChangeSizes(event, option) {
    event.preventDefault()
    const self = this
    let totalAvailable = null
    let size = Number(option.size)
    let selectedArticle = ''

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
      self.getLocationProduct()
    })
  }

  async validateCredivale() {
    let withError = false

    if (Utils.isEmpty(this.state.folio.trim()) || isNaN(this.state.amount.trim())) {
      withError = true

      this.setState({
        openSnack: true,
        messageSnack: 'Debes ingresar los datos del CrediVale ®'
      })
    }

    if (!withError) {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'credivales',
        endpoint: '/validate',
        data: {
          folio: this.state.folio.trim(),
          amount: this.state.amount.trim()
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        this.setState({
          openSnack: true,
          messageSnack: response.data.message,
          createOrderLoading: false
        })
      } else {
        this.setState({
          openSnack: true,
          messageSnack: response.data.error.message,
          createOrderLoading: false
        })
      }
    }
  }

  async createOrder() {
    let withError = false

    if (this.state.shippingMethodSelected === null) {
      withError = true

      this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un método de entrega.',
        openProgressBar: false
      })
    } else if (this.state.paymentMethodSelected === null) {
      withError = true

      this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un método de pago.',
        openProgressBar: false
      })
    } else if (this.state.paymentMethodSelected !== null && this.state.paymentMethodSelected === CREDIVALE_PAY) {
      if (Utils.isEmpty(this.state.folio.trim()) || isNaN(this.state.amount.trim())) {
        withError = true

        this.setState({
          openSnack: true,
          messageSnack: 'Debes ingresar los datos del CrediVale ®',
          openProgressBar: false
        })
      } else if (Utils.isEmpty(this.state.folioIne.trim()) || this.state.folioIne.trim().length !== 4) {
        withError = true

        this.setState({
          openSnack: true,
          messageSnack: 'Debes ingresar los últimos 4 dígitos del folio de tu credencial.',
          openProgressBar: false
        })
      }
    } else if (this.state.shippingMethodSelected !== null && this.state.shippingMethodSelected !== CLICK_AND_COLLECT && this.state.selectedAddress === null) {
      withError = true

      this.setState({
        openSnack: true,
        messageSnack: 'Debes indicar una dirección de entrega.',
        openProgressBar: false
      })
    } else if (this.state.shippingMethodSelected !== null && this.state.shippingMethodSelected === CLICK_AND_COLLECT && this.state.selectedStore === null) {
      withError = true

      this.setState({
        openSnack: true,
        messageSnack: 'Debes indicar tu tienda de preferencia.',
        openProgressBar: false
      })
    } else if (this.state.paymentMethodSelected === NETPAY && this.state.card === null) {
      withError = true

      this.setState({
        openSnack: true,
        messageSnack: 'Selecciona o agrega una tarjeta.',
        openProgressBar: false
      })
    } else if (this.state.paymentMethodSelected === OXXO_PAY && this.state.checkout.prices.total > 10000) {
      withError = true

      this.setState({
        openSnack: true,
        messageSnack: 'No se pueden procesar compras mayores a $10,000.00 M.N. con el método de pago OXXO. Por favor, selecciona otro método de pago.',
        openProgressBar: false
      })
    } else if (this.state.shippingMethodSelected !== CLICK_AND_COLLECT && (this.getFullSelectedAddress().lat === null || this.getFullSelectedAddress().lng === null)) {
      withError = true

      this.setState({
        openMapModal: true,
        openProgressBar: false
      })

      return
    }

    if (withError) {
      this.createLog({ name: 'BUY', message: this.state.messageSnack, error: true })
    } else {

      let selection = {
        code: this.props.product.code,
        quantity: 1,
        article: this.state.selectedArticle,
        size: this.state.selectedSize
      }

      let data = {
        shippingMethodSelected: this.state.shippingMethodSelected,
        isCredit: this.state.isCredit,
        checkout: this.state.checkout,
        giftCard: null,
        product: selection,
        paymentMethodSelected: this.getFullSelectedPaymentMethod(),
        bluePoints: (Utils.isEmpty(this.state.bluePoints)) ? 0 : Number(this.state.bluePoints),
        expressDelivery: this.state.expressDelivery
      }

      if (this.state.paymentMethodSelected === CREDIVALE_PAY) {
        data.vale = {
          folio: this.state.folio,
          amount: this.state.amount,
          ine: this.state.folioIne.trim()
        }
      }

      if (this.state.shippingMethodSelected === CLICK_AND_COLLECT) {
        data.storeId = this.state.selectedStore.code
      } else {
        data.address = this.getFullSelectedAddress()
      }

      if (this.state.paymentMethodSelected === NETPAY) {
        data.deviceFingerprintId = Utils.cybs_dfprofiler(Utils.constants.CONFIG_ENV.NETPAY_ORG_ID, 'netpaymx_retail', localStorage.getItem(Utils.constants.localStorage.UUID))
        data.card = this.getFullSelectedCard()
      }

      if (this.state.paymentMethodSelected === OPENPAY) {
        data.deviceId = Utils.getDeviceIdOpenpay()
        data.card = this.getFullSelectedOpenpayCard()
      }

      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'orders',
        endpoint: '/create',
        data: data
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.created) {
          if (response.data.paymentWay === BBVA_PAY) {
            localStorage.setItem('payment', JSON.stringify(response.data))
            Router.push(Utils.constants.paths.payments)
          } else if (response.data.paymentWay === PAYPAL) {
            localStorage.setItem('payment', JSON.stringify(response.data))
            Router.push(Utils.constants.paths.payments)
          } else if (response.data.paymentWay === PAYPAL) {
            localStorage.setItem('payment', JSON.stringify(response.data))
            Router.push(Utils.constants.paths.payments)
          } else if (response.data.paymentWay === MERCADOPAGO) {
            localStorage.setItem('payment', JSON.stringify(response.data))
            Router.push(Utils.constants.paths.payments)
          } else if (response.data.paymentWay === NETPAY && response.data.netpay.status === 'REVIEW') {
            localStorage.setItem('payment', JSON.stringify(response.data))
            Router.push(Utils.constants.paths.payments)
          } else if (response.data.paymentWay === OPENPAY && response.data.url !== undefined && response.data.url !== null) {
            localStorage.setItem('payment', JSON.stringify(response.data))
            Router.push(Utils.constants.paths.payments)
          } else {
            let paymentDescription = ''
            if (response.data.paymentWay === NETPAY) {
              paymentDescription = 'netpay'
            } else if (response.data.paymentWay === CREDIVALE_PAY) {
              paymentDescription = 'credivale'
            } else if (response.data.paymentWay === OXXO_PAY) {
              paymentDescription = 'oxxo'
            } else if (response.data.paymentWay === BBVA_PAY) {
              paymentDescription = 'bbva'
            } else if (response.data.paymentWay === OPENPAY) {
              paymentDescription = 'openpay'
            }

            if (response.data.paymentWay === PAYNET) {
              this.createLog({ name: 'BUY', paymentStatus: 'pending', success: false })
            }



            this.setState({
              openProgressBar: false
            }, () => {
              Router.push('/resumen/exito?pago=' + paymentDescription + '&token=' + response.data.order)
            })

            if (this.props.selection.size != undefined) {
              let productsIds = []
              productsIds.push({ size: this.props.selection.size, code: this.props.product.code })
              this.props.selectedSize(productsIds)
            }

          }
        } else {
          let messageError = response.data.error.message

          this.setState({
            openSnack: true,
            messageSnack: messageError,
            createOrderLoading: false,
            openProgressBar: false
          })

          this.createLog({ name: 'BUY', message: messageError, error: true })
        }
      } else if (response.status === Utils.constants.status.PAYLOAD_TO_LARGE) {
        this.setState({
          openSnack: true,
          messageSnack: 'Los documentos de la INE son demasiado grande. Por favor, intenta de nuevo con otros.',
          createOrderLoading: false,
          openProgressBar: false
        })
      } else {
        let messageError = response.data.error.message

        this.setState({
          openSnack: true,
          messageSnack: messageError,
          createOrderLoading: false,
          openProgressBar: false
        })

        this.createLog({ name: 'BUY', message: messageError, error: true })
      }
    }
  }

  handleChangeBluePoints(input) {
    if (!isNaN(Number(input.target.value.trim()))) {
      this.setState({
        bluePoints: input.target.value.trim()
      })
    }
  }

  applyBluePoints(flag) {
    const self = this
    if (flag) {
      if (Utils.isEmpty(this.state.bluePoints.trim()) || isNaN(Number(this.state.bluePoints.trim())) || Number(this.state.bluePoints.trim()) <= 0) {
        this.setState({
          openSnack: true,
          messageSnack: 'Ingresa una cantidad válida.'
        })

        this.createLog({ name: 'PUT_BLUEPOINTS', info: Number(this.state.bluePoints), message: 'Ingresa una cantidad válida.', error: true })
        return
      }

      if (Number(this.state.bluePoints) > this.state.user.bluePoints.balance) {
        this.setState({
          openSnack: true,
          messageSnack: 'No cuentas con esos puntos en tu monedero.'
        })

        this.createLog({ name: 'PUT_BLUEPOINTS', info: Number(this.state.bluePoints), message: 'No cuentas con esos puntos en tu monedero.', error: true })

        return
      }

      this.setState({ disabledBluePoints: true }, () => { self.getCheckout() })
      this.createLog({ name: 'PUT_BLUEPOINTS', info: Number(this.state.bluePoints) })
    } else {
      this.setState({ bluePoints: '', disabledBluePoints: false }, () => { self.getCheckout() })
      this.createLog({ name: 'PUTOUT_BLUEPOINTS' })

    }
  }

  createLog(action) {
    createHotShoppingLogs({
      "productCode": this.props.product.code,
      "size": this.props.selection.size,
      "action": action
    })
  }

  render() {
    const self = this
    const { classes } = this.props

    const defaultMapOptions = {
      fullscreenControl: false,
    }


    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}>
        <>
          <div style={getModalStyle()} className={`${classes.largeForm} ${classes.scrollBar}`}>
            {
              (this.state.checkout !== undefined && this.state.checkout !== null) ?
                <>
                  {
                    (this.state.openProgressBar) ?
                      <Grid container justify='center'>
                        <Grid item xs={12}>
                          <Loading />
                          <Typography variant='body1' align='center' style={{ marginTop: 16 }}>Cargando...</Typography>
                        </Grid>
                      </Grid>
                      :
                      <Grid container >
                        <Grid item xs={12}>
                          <Typography className={classes.textSubtitle} variant="body1"><span className={classes.textSubtitleStep}><strong>1</strong></span><strong>Revisa tu producto</strong></Typography>
                        </Grid>
                        <Grid container item xs={12} style={{ marginTop: '12px', padding: '4px' }}>
                          <Grid item xs={3} sm={2}>
                            <img
                              style={(this.state.isVertical) ? { height: '180px' } : { width: '100%' }}
                              src={Utils.constants.HOST_CDN_AWS + '/normal/' + this.props.product.photos[0].description} />
                          </Grid>
                          <Grid item xs={9} sm={10} style={{ paddingLeft: 12 }}>
                            <Typography style={{ width: '100%', fontSize: '16px', fontWeight: 'bold' }}>{this.props.product.name}</Typography>
                            <Typography style={{ width: '100%', fontSize: '16px' }}>Código: {this.props.product.code}</Typography>
                            <Typography style={{ width: '100%', fontSize: '16px' }}>Talla: {this.props.selection.measurement || this.props.selection.size}</Typography>
                            <Typography
                              color='primary'
                              onClick={() => { window.location.href = this.props.product.url }}
                              style={{ cursor: 'pointer', width: '100%', fontSize: '16px' }}><strong>Ver detalle de producto</strong></Typography>
                          </Grid>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography className={classes.textSubtitle} variant="body1"><span className={classes.textSubtitleStep}><strong>2</strong></span><strong>Selecciona un método de entrega</strong></Typography>
                        </Grid>

                        <Grid container item xs={12} justify='space-between' style={{ marginTop: 12 }}>
                          <Grid item xs={12} sm={6} className={classes.cardContainer}>
                            <div
                              className={(this.state.shippingMethodSelected === DELIVERY) ? classes.cardSelectedDesignContainer : classes.cardDesignContainer}
                              onClick={() => { this.handleChangeShippingMethod(DELIVERY) }}>
                              <Grid container alignItems='flex-start'>
                                <Grid item xs={1} sm={1}>
                                  <Radio
                                    color='primary'
                                    checked={(this.state.shippingMethodSelected === DELIVERY ? true : false)} />
                                </Grid>
                                <Grid container item xs={11} sm={11} justify='center'>
                                  <div>
                                    <img style={{ display: 'inline-block', width: '40px', height: '40px' }} src="/domicilio-v-2.svg" />
                                    <div style={{ display: 'inline-block', marginLeft: '12px' }}>
                                      <Typography color='primary' style={{ width: '100%', fontSize: '20px', fontWeight: 500, lineHeight: 'normal' }}>Envío a domicilio</Typography>
                                      <Typography style={{ width: '100%', fontSize: '16px', fontWeight: 500, lineHeight: 'normal' }}>Nosotros te lo llevamos</Typography>
                                    </div>
                                  </div>
                                </Grid>
                              </Grid>
                            </div>
                          </Grid>
                          <Grid item xs={12} sm={6} className={classes.cardContainer}>
                            <div
                              className={(this.state.shippingMethodSelected === CLICK_AND_COLLECT) ? classes.cardSelectedDesignContainer : classes.cardDesignContainer}
                              onClick={() => { this.handleChangeShippingMethod(CLICK_AND_COLLECT) }}>
                              <Grid container alignItems='flex-start'>
                                <Grid item xs={1} sm={1}>
                                  <Radio
                                    color='primary'
                                    checked={(this.state.shippingMethodSelected === CLICK_AND_COLLECT)} />
                                </Grid>
                                <Grid container item xs={11} sm={11} justify='center'>
                                  <div>
                                    <img style={{ display: 'inline-block', width: '40px', height: '40px' }} src="/click-collect-v-2.svg" />
                                    <div style={{ display: 'inline-block', marginLeft: '12px' }}>
                                      <Typography color='primary' style={{ width: '100%', fontSize: '20px', fontWeight: 500, lineHeight: 'normal' }}>Entrega en tu auto</Typography>
                                      <Typography style={{ width: '100%', fontSize: '16px', fontWeight: 500, lineHeight: 'normal' }}>Recoge en nuestras tiendas</Typography>
                                    </div>
                                  </div>
                                </Grid>
                              </Grid>
                            </div>
                          </Grid>
                        </Grid>

                        {
                          (this.state.shippingMethodSelected !== null) ?
                            <Grid container justify='flex-start' style={{ padding: '12px 0px 12px 0px' }}>
                              {
                                (this.state.shippingMethodSelected === CLZ_DELIVERY || this.state.shippingMethodSelected === DELIVERY || this.state.shippingMethodSelected === CALZZAMOVIL) ?
                                  <Grid item xs={12} md={4} className={classes.formControl}>
                                    <Typography variant="body1">Enviar a:</Typography>
                                    <FormControl fullWidth variant="outlined" style={{ marginTop: '8px' }}>
                                      <Select
                                        style={{ height: 44, borderRadius: 0 }}
                                        native
                                        value={this.state.selectedAddress}
                                        disabled={this.state.disabledSelect}
                                        onChange={(event) => { this.handleChangeAddress(event.target.value) }}>
                                        <option value="">Selecciona una dirección</option>
                                        {
                                          this.state.addresses.map((address, idx) => {
                                            return (
                                              <option key={idx} value={address.id}>
                                                {address.street} #{address.exteriorNumber} - {address.type} {address.location}. {address.municipality}, {address.state} C.P. {address.zip} ({address.name})
                                              </option>
                                            )
                                          })
                                        }
                                      </Select>
                                    </FormControl>

                                    <Typography
                                      color='primary'
                                      onClick={() => { this.setState({ openAddressModal: true }) }}
                                      style={{ cursor: 'pointer', width: '100%', marginTop: '8px', fontSize: '16px' }}><strong>Agregar nueva dirección</strong></Typography>

                                  </Grid>
                                  :
                                  <Grid container item xs={12}>
                                    <Grid item xs={12} style={{ marginBottom: 8 }}>
                                      <Typography align='center' className={classes.textSubtitle} variant="body1"><strong>Elige tu tienda más cercana</strong></Typography>
                                    </Grid>

                                    <Grid item xs={12} md={6} className={classes.formControl}>
                                      <GoogleMapReact
                                        style={{ width: '100%', height: '360px', position: 'relative' }}
                                        bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
                                        center={{
                                          lat: (this.state.selectedStore !== null) ? this.state.selectedStore.lat : 25.8257,
                                          lng: (this.state.selectedStore !== null) ? this.state.selectedStore.lng : -108.214,
                                        }}
                                        zoom={(this.state.selectedStore !== null) ? 17 : 5}
                                        options={defaultMapOptions}>
                                        {
                                          this.state.states.map((state, idx) => {
                                            return (
                                              state.zones.map((zone) => {
                                                return (
                                                  zone.stores.map((store, jdx) => {
                                                    return <div key={jdx} onClick={() => {
                                                      self.setState({
                                                        selectedState: state,
                                                        selectedZone: zone,
                                                        selectedStore: store
                                                      })
                                                    }} lat={store.lat} lng={store.lng} className={(self.state.selectedStore === idx) ? classes.selectedPin : classes.pin}><label onClick={() => { self.handleChangeStore(store.code, true) }} style={{ textAling: 'center', height: 19, 'line-height': 16, margin: 0, fontSize: 14 }}><img src={self.getMarkerStore(store)} /></label></div>
                                                  })
                                                )
                                              })
                                            )
                                          })
                                        }
                                      </GoogleMapReact>
                                    </Grid>

                                    <Grid container item xs={12} md={6} alignContent='flex-start' className={classes.formControl}>

                                      <Grid item xs={12} className={classes.formControl}>
                                        <Typography variant="body1">Selecciona un estado:</Typography>
                                        <FormControl fullWidth variant="outlined" style={{ marginTop: '8px' }}>
                                          <Select
                                            style={{ height: 44, borderRadius: 0 }}
                                            native
                                            value={(this.state.selectedState !== null) ? this.state.selectedState.code : null}
                                            disabled={this.state.disabledSelect}
                                            onChange={(event) => { this.handleChangeState(event.target.value) }}>
                                            <option value="">Selecciona un estado</option>
                                            {
                                              this.state.states.map((state, idx) => {
                                                return (<option key={idx} value={state.code}>{state.name}</option>)
                                              })
                                            }
                                          </Select>
                                        </FormControl>
                                      </Grid>

                                      {
                                        (this.state.selectedState !== null) ?
                                          <Grid item xs={12} className={classes.formControl}>
                                            <Typography variant="body1">Selecciona una ciudad:</Typography>
                                            <FormControl fullWidth variant="outlined" style={{ marginTop: '8px' }}>
                                              <Select
                                                style={{ height: 44, borderRadius: 0 }}
                                                native
                                                value={(this.state.selectedZone !== null) ? this.state.selectedZone.code : "0"}
                                                disabled={this.state.disabledSelect}
                                                onChange={(event) => { this.handleChangeZone(event.target.value) }}                                    >
                                                <option value="0">Selecciona una ciudad</option>
                                                {
                                                  this.state.selectedState.zones.map((zone, idx) => {
                                                    return (<option key={idx} value={zone.code}>{zone.name}</option>)
                                                  })
                                                }
                                              </Select>
                                            </FormControl>
                                          </Grid>
                                          :
                                          ''
                                      }

                                      {
                                        (this.state.selectedState !== null && this.state.selectedZone) ?
                                          <Grid item xs={12} className={classes.formControl}>
                                            <Typography variant="body1">Selecciona una tienda:</Typography>
                                            <FormControl fullWidth variant="outlined" style={{ marginTop: '8px' }}>
                                              <Select
                                                style={{ height: 44, borderRadius: 0 }}
                                                native
                                                value={(this.state.selectedStore !== null) ? this.state.selectedStore.code : null}
                                                disabled={this.state.disabledSelect}
                                                onChange={(event) => { this.handleChangeStore(event.target.value) }}>
                                                <option value="">Selecciona una tienda</option>
                                                {
                                                  this.state.selectedZone.stores.map((store, idx) => {
                                                    return (<option key={idx} value={store.code}>{store.name}</option>)
                                                  })
                                                }
                                              </Select>
                                            </FormControl>
                                          </Grid>
                                          :
                                          ''
                                      }

                                      {
                                        (this.state.selectedStore !== null) ?
                                          <Grid item xs={12} className={classes.formControl}>
                                            <Typography style={{ width: '100%' }} variant="body1"><strong>Recoge en:</strong></Typography>
                                            <Typography style={{ width: '100%', fontSize: '16px', fontWeight: 'bold' }}>{this.state.selectedStore.name}</Typography>
                                            <Typography variant="body1">
                                              {this.state.selectedStore.street} #{this.state.selectedStore.exteriorNumber} {(!Utils.isEmpty(this.state.selectedStore.interiorNumber)) ? this.state.selectedStore.interiorNumber : ''}<br />
                                              {(this.state.selectedStore.municipality.length !== 0) ? this.state.selectedStore.municipality + ',' : ''} {(this.state.selectedStore.state.length !== 0) ? this.state.selectedStore.state + '.' : ''} {this.state.selectedStore.country}<br />
                                              C.P. {this.state.selectedStore.zip}. Tel: {this.state.selectedStore.phone}<br />
                                              <a target="_blank" href={"https://www.google.com/maps/dir//" + this.state.selectedStore.lat + "," + this.state.selectedStore.lng + "/@" + this.state.selectedStore.lat + "," + this.state.selectedStore.lng + ",16z"}>Ver en Google Maps</a>
                                            </Typography>
                                          </Grid>
                                          :
                                          ''
                                      }

                                    </Grid>
                                  </Grid>
                              }

                              <Grid item xs={12} md={4} className={classes.formControl}>
                                <Typography variant="body1">Pagar con:</Typography>
                                <FormControl fullWidth variant="outlined" style={{ marginTop: '8px' }}>
                                  <Select
                                    style={{ height: 44, borderRadius: 0 }}
                                    native
                                    value={this.state.paymentMethodSelected}
                                    disabled={this.state.disabledSelect}
                                    onChange={(event) => { this.handleChangePaymentMethod(event.target.value) }}>
                                    {
                                      this.state.checkout.paymentMethods.map((paymentMethod, idx) => {
                                        if (this.props.product.restricted && this.state.shippingMethodSelected !== CLICK_AND_COLLECT) {
                                          if (paymentMethod.id === CREDIVALE_PAY) {
                                            return (<option key={idx} value={paymentMethod.id}>{paymentMethod.name} - {paymentMethod.description}</option>)
                                          }
                                        } else {
                                          return (<option key={idx} value={paymentMethod.id}>{paymentMethod.name} - {paymentMethod.description}</option>)
                                        }
                                      })
                                    }
                                  </Select>
                                </FormControl>
                              </Grid>
                              {
                                (this.state.paymentMethodSelected === NETPAY || this.state.paymentMethodSelected === OPENPAY) ?
                                  <Grid item xs={12} md={4} className={classes.formControl}>
                                    <Typography variant="body1">Selecciona una tarjeta:</Typography>
                                    <FormControl fullWidth variant="outlined" style={{ marginTop: '8px' }}>
                                      <Select
                                        style={{ height: 44, borderRadius: 0 }}
                                        native
                                        value={this.state.card}
                                        onChange={(event) => { this.handleChangeCard(event.target.value) }}>
                                        <option value="">Selecciona una tarjeta</option>
                                        {
                                          (this.state.paymentMethodSelected === NETPAY) ?
                                            this.state.checkout.cards.map((card, idx) => {
                                              return (<option key={idx} value={card.id}>{card.type.split('-').join(' ').toUpperCase()} - {card.number} / {card.titular} ({card.alias})</option>)
                                            })
                                            :
                                            this.state.checkout.cardsOpenpay.map((card, idx) => {
                                              return (<option key={idx} value={card.id}>{card.type.split('-').join(' ').toUpperCase()} - {card.number} / {card.titular} ({card.alias})</option>)
                                            })
                                        }
                                      </Select>
                                    </FormControl>

                                    <Typography
                                      color='primary'
                                      onClick={() => { this.setState({ openAddCardModal: true, cardOpenpay: false }) }}
                                      style={{ cursor: 'pointer', width: '100%', marginTop: '8px', fontSize: '16px' }}><strong>Agregar nueva tarjeta</strong></Typography>

                                  </Grid>
                                  :
                                  ''
                              }
                              {
                                (this.state.paymentMethodSelected === PAYNET) ?
                                  <Grid container item xs={10}>
                                    <Grid item xs={3}>
                                      <img className={classes.image} src={'https://www.paynet.com.mx/img/benavides.png'} />
                                    </Grid>
                                    <Grid item xs={3}>
                                      <img className={classes.image} src={'https://www.paynet.com.mx/img/ahorro.jpg'} />
                                    </Grid>
                                    <Grid item xs={3}>
                                      <img className={classes.image} src={'https://www.paynet.com.mx/img/aurrera.jpg'} />
                                    </Grid>
                                    <Grid item xs={3}>
                                      <img className={classes.image} src={'https://www.paynet.com.mx/img/seven.jpg'} />
                                    </Grid>
                                    <Grid item xs={3}>
                                      <img className={classes.image} src={'https://www.paynet.com.mx/img/walmart.jpg'} />
                                    </Grid>
                                    <Grid item xs={3}>
                                      <img className={classes.image} src={'https://www.paynet.com.mx/img/guadalajara.jpg'} />
                                    </Grid>
                                    <Grid item xs={3}>
                                      <img className={classes.image} src={'https://www.paynet.com.mx/img/waldos.jpg'} />
                                    </Grid>
                                    <Grid item xs={3}>
                                      <img className={classes.image} src={"https://www.paynet.com.mx/img/walmart_express.png"} />
                                    </Grid>
                                  </Grid>
                                  :
                                  ''
                              }
                              {
                                (this.state.paymentMethodSelected === CREDIVALE_PAY) ?
                                  <Grid container style={{ padding: '12px 0px 12px 0px' }}>
                                    <Grid item xs={12} className={classes.formControl}>
                                      <Typography className={classes.textSubtitle} variant="body1"><strong>Paso 1</strong></Typography>
                                      <Typography className={classes.textSubtitle} variant="body1">Captura el folio de tu CrediVale ®</Typography>
                                    </Grid>

                                    <Grid item xs={12} md={6} className={classes.formControl}>
                                      <OutlinedInput
                                        value={self.state.folio}
                                        placeholder="Folio electrónico *"
                                        variant='outlined'
                                        fullWidth
                                        type="text"
                                        style={{ borderRadius: 0, height: 44 }}
                                        onChange={self.handleChangeFolio} />
                                    </Grid>

                                    <Grid item xs={12} md={3} className={classes.formControl}>
                                      <OutlinedInput
                                        value={self.state.amount}
                                        placeholder="Monto *"
                                        variant='outlined'
                                        fullWidth
                                        type="text"
                                        style={{ borderRadius: 0, height: 44 }}
                                        onChange={self.handleChangeAmount} />
                                    </Grid>

                                    <Grid item xs={12} md={3} className={classes.formControl}>
                                      <Button
                                        variant='contained'
                                        color='primary'
                                        onClick={() => { this.validateCredivale() }}
                                        style={{ width: '100%', height: 44, borderRadius: 0, fontSize: 12 }}><strong>Validar CrediVale®</strong></Button>
                                    </Grid>

                                    <Grid container alignItems='flex-start' item xs={12} style={{ marginTop: 8 }} >
                                      <Grid item xs={12} md={6} className={classes.formControl}>
                                        <Typography className={classes.textSubtitle} variant="body1"><strong>Paso 2</strong></Typography>
                                        <Typography className={classes.textSubtitle} variant="body1">Captura los últimos 4 dígitos del folio de tu credencial. Lo puedes encontrar al reverso de tu credencial.</Typography>
                                        <Typography className={classes.textSubtitle} variant="body1" style={{ marginTop: 20 }}><strong>Últimos cuatro dígitos</strong></Typography>

                                        <OutlinedInput
                                          value={self.state.folioIne}
                                          placeholder="Últimos cuatro dígitos *"
                                          variant='outlined'
                                          fullWidth
                                          type="text"
                                          style={{ borderRadius: 0, height: 44, marginTop: 12 }}
                                          onChange={self.handleChangeFolioIne} />
                                      </Grid>
                                      <Grid item xs={12} md={6} className={classes.formControl}>
                                        <img
                                          style={{ width: '100%' }}
                                          src="/ine-v-2.svg" />
                                      </Grid>

                                      <Grid item xs={12} className={classes.alertContainer}>
                                        <Typography align="justify" variant='body1' style={{ alignItems: 'center', display: 'inline-flex' }}>
                                          <ErrorOutlineIcon color='primary' />
                                          <span style={{ marginLeft: 12, fontSize: 12 }}>La entrega está disponible solamente a la persona autorizada del vale, no se podrá entregar su artículo a otra persona. Favor de considerar antes de confirmar su compra.</span>
                                        </Typography>
                                      </Grid>
                                    </Grid>

                                  </Grid>
                                  :
                                  ''
                              }


                              {
                                (this.state.availableExpressDelivery) ?
                                  <Grid container item xs={12} style={{ marginTop: 12 }}>
                                    <Grid item xs={12} sm={6} className={classes.cardContainer}>
                                      <div className={(this.state.expressDelivery) ? classes.cardSelectedDesignContainer : classes.cardDesignContainer} onClick={() => this.setState({ expressDelivery: !this.state.expressDelivery })}>
                                        <Grid container alignItems='flex-start'>
                                          <Grid item xs={1} sm={1}>
                                            <Radio
                                              color='primary'
                                              checked={this.state.expressDelivery} />
                                          </Grid>
                                          <Grid container item xs={11} sm={11} justify='center'>
                                            <div style={{ textAlign: 'center' }}>
                                              <img style={{ display: 'inline-block', width: '88px' }} src="../../calzzamovil-v-2.svg" />
                                              <div style={{ display: 'inline-block', marginLeft: '12px' }}>
                                                <Typography color='primary' style={{ width: '100%', fontSize: '20px', fontWeight: 500, lineHeight: 'normal' }}>Entrega Express</Typography>
                                                <Typography style={{ width: '100%', fontSize: '16px', fontWeight: 500, lineHeight: 'normal' }}>Recibe el mismo día</Typography>
                                              </div>
                                            </div>
                                          </Grid>
                                        </Grid>
                                      </div>
                                    </Grid>
                                    <Typography variant='body1' color='primary'>Pide y paga antes de las 2:00 pm y recibe hoy de 9:00 am a 9:00 pm</Typography>
                                    <Typography variant='body1'>Pide y paga después de las 2:00 pm y recibe mañana de 9:00 am a 9:00 pm</Typography>
                                  </Grid>
                                  :
                                  ''
                              }

                            </Grid>
                            :
                            ''
                        }

                        <Grid item xs={12}>
                          <Typography className={classes.textSubtitle} variant="body1"><span className={classes.textSubtitleStep}><strong>3</strong></span><strong>Promociones</strong></Typography>
                        </Grid>

                        <Grid container item xs={12} alignContent='flex-start' className={classes.formControl}>
                          <Grid item xs={7} sm={8} md={9}>
                            <OutlinedInput
                              value={this.state.coupon}
                              placeholder="Cupón de descuento"
                              variant='outlined'
                              disabled={(this.state.appliedCoupon) ? true : false}
                              fullWidth
                              type="text"
                              style={{ borderRadius: 0, height: 44 }}
                              onChange={self.handleChangeCoupon}
                              startAdornment={
                                <InputAdornment position='start'>
                                  <Label style={{ opacity: 0.3 }} />
                                </InputAdornment>
                              } />
                          </Grid>
                          <Grid item xs={5} sm={4} md={3}>
                            {
                              (this.state.appliedCoupon) ?
                                <Button
                                  style={{ width: '100%', height: 44, borderRadius: 0 }}
                                  disabled={(this.state.coupon.trim().length <= 0) ? true : false}
                                  variant="contained"
                                  color="primary"
                                  onClick={() => { this.removeCoupon() }}>QUITAR</Button>
                                :
                                <Button
                                  style={{ width: '100%', height: 44, borderRadius: 0 }}
                                  disabled={(this.state.coupon.trim().length <= 0) ? true : false}
                                  variant="contained"
                                  color="primary"
                                  onClick={() => { this.applyCoupon() }}>APLICAR</Button>
                            }
                          </Grid>
                        </Grid>
                        {
                          (this.state.checkout.bluePoints.win > 0) ?
                            <Grid container item xs={12} alignContent='flex-start' className={classes.formControl} style={{ paddingTop: 12 }}>
                              <Typography variant='body1'>
                                <strong>{Utils.numberWithCommas(this.state.checkout.bluePoints.win)} {this.state.checkout.bluePoints.win === 1 ? 'punto azul' : 'puntos azules'} genera esta compra.</strong>
                                <br />
                                <span>
                                  {
                                    (this.state.checkout.bluePoints.conditions.exchange) ?
                                      'Puedes utilizarlos en tu siguiente compra.'
                                      :
                                      'Activa tu Mondero Azul ® para acumularlos.'
                                  }
                                </span>
                              </Typography>
                            </Grid>
                            :
                            ''
                        }
                        {
                          (this.state.checkout.bluePoints.conditions.exchange) ?
                            <Grid container item xs={12} alignContent='flex-start' className={classes.formControl} style={{ paddingTop: 12 }}>
                              <Grid item xs={7} sm={8} md={9}>
                                <OutlinedInput
                                  value={this.state.bluePoints}
                                  placeholder="Agregar puntos azules"
                                  variant='outlined'
                                  disable={this.state.disabledBluePoints}
                                  fullWidth
                                  type="text"
                                  style={{ borderRadius: 0, height: 44 }}
                                  onChange={self.handleChangeBluePoints}
                                  startAdornment={
                                    <InputAdornment position='start'>
                                      <img style={{ width: 64 }} src="/monederoazul.svg" />
                                    </InputAdornment>
                                  } />
                              </Grid>
                              <Grid item xs={5} sm={4} md={3}>
                                {
                                  (this.state.disabledBluePoints) ?
                                    <Button
                                      style={{ width: '100%', height: 44, borderRadius: 0 }}
                                      variant="contained"
                                      color="primary"
                                      onClick={() => { this.applyBluePoints(false) }}>QUITAR</Button>
                                    :
                                    <Button
                                      style={{ width: '100%', height: 44, borderRadius: 0 }}
                                      variant="contained"
                                      color="primary"
                                      onClick={() => { this.applyBluePoints(true) }}>APLICAR</Button>
                                }
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant='body1'>Tienes <strong>{Utils.numberWithCommas(this.state.user.bluePoints.balance)}</strong> {(this.state.user.bluePoints.balance === 1) ? 'punto' : 'puntos'} en tu Monedero Azul ®.</Typography>
                              </Grid>
                            </Grid>
                            :
                            <Grid container item xs={12} alignContent='flex-start' className={classes.formControl} style={{ paddingTop: 24 }}>
                              {
                                (Utils.isEmpty(this.state.checkout.bluePoints.conditions.link)) ?
                                  <Typography align='justify' variant='body1' style={{ fontSize: '14px' }}>{this.state.checkout.bluePoints.conditions.message}</Typography>
                                  :
                                  <Typography
                                    color='primary'
                                    align='justify'
                                    onClick={() => { window.open(this.state.checkout.bluePoints.conditions.link) }}
                                    style={{ cursor: 'pointer', width: '100%', fontSize: '14px' }}><strong>{this.state.checkout.bluePoints.conditions.message}</strong></Typography>
                              }

                            </Grid>

                        }

                        <Grid item xs={12}>
                          <Typography className={classes.textSubtitle} variant="body1"><span className={classes.textSubtitleStep}><strong>4</strong></span><strong>Confirmar compra</strong></Typography>
                        </Grid>

                        {
                          (this.state.loadingCheckout) ?
                            <Grid container item justify='center' alignContent='center' xs={12}>
                              <Loading />
                            </Grid>
                            :
                            <>
                              <Grid item xs={12} className={classes.formControl}>
                                <Typography variant="body1">
                                  <span style={{ marginRight: 8 }}>Subtotal:</span>
                                  <span>$ {Utils.numberWithCommas(this.state.checkout.prices.subtotal.toFixed(2))} M.N.</span>
                                  <br />
                                  {
                                    (Number(this.state.bluePoints) > 0 && this.state.disabledBluePoints) ?
                                      <>
                                        <span style={{ marginRight: 8 }}>Puntos:</span>
                                        <span style={{ textDecoration: 'line-through' }}>- $ {Utils.numberWithCommas(Number(this.state.bluePoints).toFixed(2))} M.N.</span>
                                        <br />
                                      </>
                                      :
                                      ''
                                  }
                                  {
                                    (this.state.checkout.prices.discount > 0) ?
                                      <>
                                        <span style={{ marginRight: 8 }}>Descto. cupón:</span>
                                        <span>
                                          - ${Utils.numberWithCommas(this.state.checkout.prices.discount.toFixed(2))} M.N.
                                          {
                                            (this.state.checkout.coupon !== null && this.state.checkout.coupon.percentageDiscount > 0) ?
                                              <strong>(<span>{this.state.checkout.coupon.percentageDiscount}%</span>)</strong>
                                              :
                                              ''
                                          }
                                        </span>
                                        <br />
                                      </>
                                      :
                                      ''
                                  }
                                  <span style={{ marginRight: 8 }}>Envío:</span>
                                  <span>{this.state.checkout.shippingMethod.name}</span>
                                  {
                                    (this.state.checkout.prices.shippingCost > 0) ?
                                      <span>
                                        ($ {Utils.numberWithCommas(this.state.checkout.prices.shippingCost.toFixed(2))} M.N.)
                                      </span>
                                      :
                                      ''
                                  }
                                  <br />
                                  {
                                    (this.state.checkout.prices.recharge !== 0) ?
                                      <>
                                        <span style={{ marginRight: 8 }}>Recarga:</span>
                                        <span>$ {Utils.numberWithCommas(this.state.checkout.prices.recharge.toFixed(2))} M.N.</span>
                                        <br />
                                      </>
                                      :
                                      ''
                                  }
                                  <span style={{ marginRight: 8 }}>Total:</span>
                                  <span>$ {Utils.numberWithCommas(this.state.checkout.prices.total.toFixed(2))} M.N.</span>
                                </Typography>
                              </Grid>

                              <Grid item xs={12}>
                                <Grid item xs={12} style={{ padding: '12px 0px 12px 0px' }}>
                                  <Typography align='justify' variant='body1' style={{ alignItems: 'center', display: 'inline-flex' }}>
                                    <img style={{ width: 40 }} src="/shield-v-2.svg" />
                                    <span style={{ marginLeft: 12, fontSize: 10, opacity: 0.6 }}>
                                      Compra 100% segura con cifrado de información. Revisa tu pedido y asegúrate de que todos tus datos esten correctos. No se te cobrará nada hasta que confirmes tu compra.
                                      <br />Al confirmar tu pedido aceptas los términos y condiciones y las políticas de privacidad de GRUPO CALZAPATO S.A. DE C.V. y Calzapato.com ®
                                    </span>
                                  </Typography>
                                </Grid>
                                <Grid container item xs={12} justify='space-between'>
                                  <Grid item xs={12} sm={6} className={classes.formControl}>
                                    <Button
                                      className={classes.secondaryButton}
                                      onClick={() => { this.handleClose() }}>Cancelar</Button>
                                  </Grid>
                                  <Grid item xs={12} sm={6} className={classes.formControl}>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      className={classes.primaryButton}
                                      onClick={() => { if (this.state.validateCellphone) { this.setState({ openProgressBar: true }, () => this.createOrder()) } else { this.setState({ openValidationSMS: true }) } }}>Confirmar compra</Button>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </>
                        }

                        <ValidationSMSModal
                          openDialog={this.state.openValidationSMS}
                          handleCloseValidationSMSModalWithSuccess={(event) => {
                            this.setState({ openValidationSMS: false, validateCellphone: true, openProgressBar: true }, () => {
                              self.createOrder()
                            })
                          }}
                          handleCloseValidationSMSModal={(event) => {
                            this.setState({ openValidationSMS: false })
                          }} />

                        <MapModal
                          open={this.state.openMapModal}
                          address={(this.state.selectedAddress !== null) ? this.getFullSelectedAddress() : null}
                          handleConfirm={(data) => {
                            this.setState({ openMapModal: false }, () => {
                              let addresses = this.state.addresses
                              addresses.map(address => {
                                if (this.state.selectedAddress === address.id) {
                                  address.lat = data.lat,
                                    address.lng = data.lng
                                }
                              })
                              self.setState({
                                addresses: addresses,
                                openProgressBar: true
                              }, () => {
                                self.createOrder()
                              })
                            })
                          }}
                          handleClose={() => { this.setState({ openMapModal: false }) }}
                        />
                        <AddressModal
                          open={this.state.openAddressModal}
                          host={Utils.constants.CONFIG_ENV.HOST}
                          mode="create"
                          handleConfirmWithAddress={this.handleConfirmWithAddress}
                          handleClose={() => { this.setState({ openAddressModal: false }) }}
                        />

                        <CardModal
                          open={this.state.openAddCardModal}
                          editCard={false}
                          card={null}
                          openpay={this.state.cardOpenpay}
                          handleCloseWithCard={(card) => {
                            const self = this
                            let checkout = this.state.checkout
                            card.checked = true
                            checkout.cards.push(card)
                            checkout.cardsOpenpay.push(card)
                            this.setState({
                              openAddCardModal: false,
                              editCard: false,
                              card: null,
                              checkout: checkout
                            }, () => {
                              self.handleChangeCard(card.id)
                            })
                          }}
                          handleClose={() => {
                            this.setState({
                              openAddCardModal: false,
                              editCard: false,
                              card: null
                            })
                          }}
                        />
                      </Grid>
                  }
                </>
                :
                <Grid container justify='center'>
                  <Grid item xs={12}>
                    <Loading />
                    <Typography variant='body1' align='center' style={{ marginTop: 16 }}>Cargando...</Typography>
                  </Grid>
                </Grid>
            }
          </div>
          <div className={classes.actionButtons} style={{ textAlign: 'center', marginTop: 24 }}>
            <Snackbar
              autoHideDuration={5000}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              open={this.state.openSnack}
              onClose={() => this.setState({ openSnack: false, messageSnack: '' })}
              message={<span>{this.state.messageSnack}</span>}
              action={[
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={() => this.setState({ openSnack: false, messageSnack: '' })}><CloseIcon /></IconButton>
              ]}
            />
          </div>
        </>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    selectedSize: (data) => {
      dispatch(selectedSize(data))
    },
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(HotShoppingNew)
