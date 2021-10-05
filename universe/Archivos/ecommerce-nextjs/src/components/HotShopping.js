'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Modal, InputAdornment, Grid, TextField, Typography, Select, Button, Snackbar, IconButton, Table, TableBody, TableCell, TableRow, FormControl, Icon, Hidden, Link, Checkbox } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import CloseIcon from '@material-ui/icons/Close'
import Label from '@material-ui/icons/Label'

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
  smallForm: {
    overflowY: 'scroll',
    position: 'absolute',
    width: theme.spacing.unit * 60,
    maxHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 3,
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  largeForm: {
    overflowY: 'scroll',
    overflowX: 'hidden',
    position: 'absolute',
    minWidth: theme.spacing.unit * 100,
    width: theme.spacing.unit * 100,
    maxWidth: theme.spacing.unit * 100,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 3,
    maxHeight: 'calc(100vh - 100px)',
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      minWidth: '100%',
      width: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      paddingLeft: '2.5%',
      paddingRight: '2.5%'
    }
  },
  modalTitle: {
    fontSize: 28,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    },
    fontWeight: 600
  },
  sizeItem: {
    padding: 8,
    margin: '1%',
    width: '12%',
    backgroundColor: 'white',
    color: 'black',
    borderRadius: 4,
    cursor: 'pointer',
    border: '1px solid ' + theme.palette.primary.main
  },
  sizeItemSelected: {
    padding: 8,
    margin: '1%',
    width: '12%',
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4,
    cursor: 'pointer',
    border: '1px solid ' + theme.palette.primary.main
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
  actionButtons: {
    position: 'fixed',
    right: 0,
    bottom: 0,
    width: '100%',
    background: 'white'
  },
  fix: {
    paddingBottom: 50,
    [theme.breakpoints.down('sm')]: {
      paddingBottom: 80,
    }
  },
  expressDelivery: {
    width: '50%',
    margin: 6,
    [theme.breakpoints.down('sm')]: {
      width: '100%'
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


class HotShopping extends Component {
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
      cardOpenpay: false
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

  }

  componentWillMount() {
    console.log(this.props.size)
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
      expressDelivery: false
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
      expressDelivery: false
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

  async createOrder() {
    let withError = false
    if (this.state.shippingMethodSelected === null) {
      withError = true
      await this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un método de entrega.'
      })
    }
    else if (this.state.paymentMethodSelected === null) {
      withError = true
      await this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un método de pago.'
      })
    }
    else if (this.state.paymentMethodSelected !== null && this.state.paymentMethodSelected === CREDIVALE_PAY) {
      if (Utils.isEmpty(this.state.folio.trim()) || isNaN(this.state.amount.trim())) {
        withError = true
        await this.setState({
          openSnack: true,
          messageSnack: 'Debes ingresar los datos del CrediVale ®'
        })
      }
      else if (Utils.isEmpty(this.state.folioIne.trim()) || this.state.folioIne.trim().length !== 4) {
        withError = true
        await this.setState({
          openSnack: true,
          messageSnack: 'Debes ingresar los últimos 4 dígitos del folio de tu credencial.'
        })
      }
    }
    else if (this.state.shippingMethodSelected !== null && this.state.shippingMethodSelected !== CLICK_AND_COLLECT && this.state.selectedAddress === null) {
      withError = true
      await this.setState({
        openSnack: true,
        messageSnack: 'Debes indicar una dirección de entrega.'
      })
    }
    else if (this.state.shippingMethodSelected !== null && this.state.shippingMethodSelected === CLICK_AND_COLLECT && this.state.selectedStore === null) {
      withError = true
      await this.setState({
        openSnack: true,
        messageSnack: 'Debes indicar tu tienda de preferencia.'
      })
    }
    else if (this.state.paymentMethodSelected === NETPAY && this.state.card === null) {
      withError = true
      await this.setState({
        openSnack: true,
        messageSnack: 'Selecciona o agrega una tarjeta.'
      })
    }
    else if (this.state.paymentMethodSelected === OXXO_PAY && this.state.checkout.prices.total > 10000) {
      withError = true
      await this.setState({
        openSnack: true,
        messageSnack: 'No se pueden procesar compras mayores a $10,000.00 M.N. con el método de pago OXXO. Por favor, selecciona otro método de pago.'
      })
    }
    else if (this.state.shippingMethodSelected !== CLICK_AND_COLLECT && (this.getFullSelectedAddress().lat === null || this.getFullSelectedAddress().lng === null)) {
      withError = true
      this.setState({
        openMapModal: true
      })
      return
    }

    if (!withError) {
      this.setState({ createOrderLoading: true })

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
          }
          else if (response.data.paymentWay === PAYPAL) {
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
            Router.push('/resumen/exito?pago=' + paymentDescription + '&token=' + response.data.order)
          }
        }
        else {
          let messageError = response.data.error.message
          this.setState({
            openSnack: true,
            messageSnack: messageError,
            createOrderLoading: false
          })
          this.createLog({ name: 'BUY', message: messageError, error: true })

        }
      }
      else if (response.status === Utils.constants.status.PAYLOAD_TO_LARGE) {
        this.setState({
          openSnack: true,
          messageSnack: 'Los documentos de la INE son demasiado grande. Por favor, intenta de nuevo con otros.',
          createOrderLoading: false
        })
      }
      else {
        let messageError = response.data.error.message
        this.setState({
          openSnack: true,
          messageSnack: messageError,
          createOrderLoading: false
        })
        this.createLog({ name: 'BUY', message: messageError, error: true })

      }
    } else {
      this.createLog({ name: 'BUY', message: this.state.messageSnack, error: true })
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
      this.setState({
        disabledBluePoints: true
      }, () => {
        self.getCheckout()
      })
      this.createLog({ name: 'PUT_BLUEPOINTS', info: Number(this.state.bluePoints) })
    } else {
      this.setState({
        bluePoints: '',
        disabledBluePoints: false
      }, () => {
        self.getCheckout()
      })
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
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >
        <>
          <div style={getModalStyle()} className={`${classes.largeForm} ${classes.scrollBar}`}>
            {
              (this.state.checkout !== null) ?
                <>
                  <Grid container>
                    <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                      <img
                        style={(this.state.isVertical) ? { height: '180px' } : { width: '100%' }}
                        src={Utils.constants.HOST_CDN_AWS + '/normal/' + this.props.product.photos[0].description}
                      />
                    </Grid>
                    <Grid item xl={9} lg={9} md={9} sm={9} xs={9}>
                      <Table style={{ paddingLeft: '5%' }}>
                        <TableBody>
                          <TableRow>
                            <TableCell style={{ width: '1%', margin: 0, padding: 4, fontSize: 13 }}>
                              Marca
                            </TableCell>
                            <TableCell style={{ margin: 0, padding: 4, fontSize: 13 }}>
                              <strong>{this.props.product.brand.name}</strong>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ width: '1%', margin: 0, padding: 4, fontSize: 13 }}>
                              Descripción
                            </TableCell>
                            <TableCell style={{ margin: 0, padding: 4, fontSize: 13 }}>
                              <strong>{this.props.product.name}</strong>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ width: '1%', margin: 0, padding: 4, fontSize: 13 }}>
                              Código
                            </TableCell>
                            <TableCell style={{ margin: 0, padding: 4, fontSize: 13 }}>
                              <strong>{this.props.product.code}</strong>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ width: '1%', margin: 0, padding: 4, fontSize: 13 }}>
                              Talla
                            </TableCell>
                            <TableCell style={{ margin: 0, padding: 4, fontSize: 13 }}>
                              <strong>{this.props.selection.measurement || this.props.selection.size}</strong>
                            </TableCell>
                          </TableRow>
                          <Hidden smDown>
                            <TableRow>
                              <TableCell></TableCell>
                              <TableCell style={{ margin: 0, padding: 4, fontSize: 13 }}>
                                <a href={this.props.product.url}>Ver detalle del producto</a>
                              </TableCell>
                            </TableRow>
                          </Hidden>
                        </TableBody>
                      </Table>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      {
                        /*
                        (this.props.product.showSizeSelector) ?
                        <div>
                          <br />
                          Selecciona tu talla:
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
                        </div>
                        :
                        ''
                        */
                      }
                    </Grid>
                  </Grid>
                  <Grid container style={{ marginTop: 8, marginBottom: 8 }}>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ textAlign: 'center' }}>
                      <Typography variant="body1"><strong>Selecciona un método de entrega:</strong></Typography>
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                      <Button variant="text" style={{ width: '100%', margin: 6 }} onClick={() => { this.handleChangeShippingMethod(DELIVERY) }}>
                        <Checkbox checked={(this.state.shippingMethodSelected === DELIVERY ? true : false)} style={{ float: 'left' }} />
                        <img style={{ width: '88%', padding: 0, float: 'right' }} alt="Envío a domicilio" src="/delivery.png" />
                      </Button>
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                      <Button variant="text" style={{ width: '100%', margin: 6 }} onClick={() => { this.handleChangeShippingMethod(CLICK_AND_COLLECT) }}>
                        <Checkbox checked={(this.state.shippingMethodSelected === CLICK_AND_COLLECT ? true : false)} style={{ float: 'left' }} />
                        <img style={{ width: '88%', padding: 0, float: 'right' }} alt="Click &amp; Collect" src="/ClickCollect.png" />
                      </Button>
                    </Grid>
                  </Grid>
                  {
                    (this.state.shippingMethodSelected !== null) ?
                      <Grid container>
                        {
                          (this.state.shippingMethodSelected === CLZ_DELIVERY || this.state.shippingMethodSelected === DELIVERY || this.state.shippingMethodSelected === CALZZAMOVIL) ?
                            <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
                              <Grid style={{ marginBottom: 8 }}>
                                <Typography variant="body1"><strong>Enviar a:</strong></Typography>
                                <FormControl variant="outlined" style={{ width: '95%' }}>
                                  <Select
                                    disabled={this.state.disabledSelect}
                                    native
                                    onChange={(event) => { this.handleChangeAddress(event.target.value) }}
                                    value={this.state.selectedAddress}
                                  >
                                    <option value="">Selecciona una dirección</option>
                                    {
                                      this.state.addresses.map((address, idx) => {
                                        return (
                                          <option value={address.id}>
                                            {address.street} #{address.exteriorNumber} - {address.type} {address.location}. {address.municipality}, {address.state} C.P. {address.zip} ({address.name})
                                          </option>
                                        )
                                      })
                                    }
                                  </Select>
                                  <a href="" onClick={(event) => {
                                    event.preventDefault()
                                    this.setState({
                                      openAddressModal: true,
                                    })
                                  }} style={{ marginTop: 10 }}>Agregar nueva dirección</a>
                                </FormControl>
                              </Grid>
                            </Grid>
                            :
                            <>
                              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                                  <Typography variant="body1"><strong>Elige tu tienda más cercana.</strong></Typography>
                                </div>
                              </Grid>
                              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} style={{ padding: 8, marginBottom: 16 }}>
                                {
                                  <GoogleMapReact
                                    style={{ width: '99%', height: '360px', position: 'relative' }}
                                    bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
                                    center={{
                                      lat: (this.state.selectedStore !== null) ? this.state.selectedStore.lat : 25.8257,
                                      lng: (this.state.selectedStore !== null) ? this.state.selectedStore.lng : -108.214,
                                    }}
                                    zoom={(this.state.selectedStore !== null) ? 17 : 5}
                                  >
                                    {
                                      this.state.states.map(function (state, idx) {
                                        return (
                                          state.zones.map((zone) => {
                                            return (
                                              zone.stores.map(store => {
                                                return <div onClick={() => {
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
                                }
                              </Grid>
                              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} style={{ marginBottom: 16 }}>
                                <Grid style={{ marginBottom: 8 }}>
                                  {
                                    (this.state.selectedStore !== null) ?
                                      <div style={{ marginBottom: 4 }}>
                                        <strong>Recoge en: {this.state.selectedStore.name}</strong>
                                        <Typography variant="body2">{this.state.selectedStore.street} #{this.state.selectedStore.exteriorNumber} {(!Utils.isEmpty(this.state.selectedStore.interiorNumber)) ? this.state.selectedStore.interiorNumber : ''}</Typography>
                                        <Typography variant="body2">{this.state.selectedStore.municipality}, {this.state.selectedStore.state}. {this.state.selectedStore.country}</Typography>
                                        <Typography variant="body2">C.P. {this.state.selectedStore.zip}. Tel: {this.state.selectedStore.phone}</Typography>
                                        <a target="_blank" href={"https://www.google.com/maps/dir//" + this.state.selectedStore.lat + "," + this.state.selectedStore.lng + "/@" + this.state.selectedStore.lat + "," + this.state.selectedStore.lng + ",16z"}>Ver en Google Maps</a>
                                      </div>
                                      :
                                      ''
                                  }
                                </Grid>
                                <Grid style={{ marginBottom: 8 }}>
                                  <Typography variant="body1"><strong>Selecciona un estado:</strong></Typography>
                                  <FormControl variant="outlined" style={{ width: '100%' }}>
                                    <Select
                                      disabled={this.state.disabledSelect}
                                      native
                                      onChange={(event) => { this.handleChangeState(event.target.value) }}
                                      value={(this.state.selectedState !== null) ? this.state.selectedState.code : null}
                                    >
                                      <option value="">Selecciona un estado</option>
                                      {
                                        this.state.states.map((state, idx) => {
                                          return (
                                            <option value={state.code}>
                                              {state.name}
                                            </option>
                                          )
                                        })
                                      }
                                    </Select>
                                  </FormControl>
                                </Grid>
                                {
                                  (this.state.selectedState !== null) ?
                                    <Grid style={{ marginBottom: 8 }}>
                                      <Typography variant="body1"><strong>Selecciona una ciudad:</strong></Typography>
                                      <FormControl variant="outlined" style={{ width: '100%' }}>
                                        <Select
                                          disabled={this.state.disabledSelect}
                                          native
                                          onChange={(event) => { this.handleChangeZone(event.target.value) }}
                                          value={(this.state.selectedZone !== null) ? this.state.selectedZone.code : null}
                                        >
                                          <option value="">Selecciona una ciudad</option>
                                          {
                                            this.state.selectedState.zones.map((zone, idx) => {
                                              return (
                                                <option value={zone.code}>
                                                  {zone.name}
                                                </option>
                                              )
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
                                    <Grid style={{ marginBottom: 8 }}>
                                      <Typography variant="body1"><strong>Selecciona una tienda:</strong></Typography>
                                      <FormControl variant="outlined" style={{ width: '100%' }}>
                                        <Select
                                          disabled={this.state.disabledSelect}
                                          native
                                          onChange={(event) => { this.handleChangeStore(event.target.value) }}
                                          value={(this.state.selectedStore !== null) ? this.state.selectedStore.code : null}
                                        >
                                          <option value="">Selecciona una tienda</option>
                                          {
                                            this.state.selectedZone.stores.map((store, idx) => {
                                              return (
                                                <option value={store.code}>
                                                  {store.name}
                                                </option>
                                              )
                                            })
                                          }
                                        </Select>
                                      </FormControl>
                                    </Grid>
                                    :
                                    ''
                                }
                              </Grid>
                            </>
                        }
                        <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
                          {
                            (this.state.paymentMethodSelected !== null) ?
                              <Grid style={{ marginBottom: 8 }}>
                                <Hidden mdUp>
                                  <hr style={{ opacity: 0.3 }} />
                                </Hidden>
                                <Typography variant="body1"><strong>Pagar con:</strong></Typography>
                                <FormControl variant="outlined" style={{ width: '95%' }}>
                                  <Select
                                    disabled={this.state.disabledSelect}
                                    native
                                    onChange={(event) => { this.handleChangePaymentMethod(event.target.value) }}
                                    value={this.state.paymentMethodSelected}
                                  >
                                    {
                                      this.state.checkout.paymentMethods.map((paymentMethod, idx) => {
                                        if (this.props.product.restricted && this.state.shippingMethodSelected !== CLICK_AND_COLLECT) {
                                          if (paymentMethod.id === CREDIVALE_PAY) {
                                            return (
                                              <option value={paymentMethod.id}>{paymentMethod.name} - {paymentMethod.description}</option>
                                            )
                                          }
                                        } else {
                                          return (
                                            <option value={paymentMethod.id}>{paymentMethod.name} - {paymentMethod.description}</option>
                                          )
                                        }
                                      })
                                    }
                                  </Select>
                                </FormControl>
                              </Grid>
                              :
                              ''
                          }
                        </Grid>
                        <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
                          {
                            (this.state.paymentMethodSelected === NETPAY) ?
                              <Grid style={{ marginBottom: 8 }}>
                                <Hidden mdUp>
                                  <hr style={{ opacity: 0.3 }} />
                                </Hidden>
                                <Typography variant="body1"><strong>Selecciona una tarjeta:</strong></Typography>
                                <FormControl variant="outlined" style={{ width: '95%' }}>
                                  <Select
                                    disabled={this.state.disabledSelect}
                                    native
                                    onChange={(event) => { this.handleChangeCard(event.target.value) }}
                                    value={this.state.card}
                                  >
                                    <option value="">Selecciona una tarjeta</option>
                                    {
                                      this.state.checkout.cards.map((card, idx) => {
                                        return (
                                          <option value={card.id}>{card.type.split('-').join(' ').toUpperCase()} - {card.number} / {card.titular} ({card.alias})</option>
                                        )
                                      })
                                    }
                                  </Select>
                                  <a href="" onClick={(event) => {
                                    event.preventDefault()
                                    this.setState({
                                      openAddCardModal: true,
                                      cardOpenpay: false
                                    })
                                  }} style={{ marginTop: 10 }}>Agregar nueva tarjeta</a>
                                </FormControl>
                              </Grid>

                              :
                              <>
                                {
                                  (this.state.paymentMethodSelected === CREDIVALE_PAY) ?
                                    <>
                                      Ingresa tu CrediVale ®
                                      <form>
                                        <TextField autoFocus style={{ marginTop: 10, width: '100%' }} type="text" placeholder="Folio electrónico *" value={self.state.folio} onChange={self.handleChangeFolio} />
                                        <TextField style={{ marginTop: 10, width: '100%' }} type="text" placeholder="Monto *" value={self.state.amount} onChange={self.handleChangeAmount} />
                                      </form>
                                    </>
                                    :
                                    ''
                                }
                                {
                                  (this.state.paymentMethodSelected === OPENPAY) ?
                                    <Grid style={{ marginBottom: 8 }}>
                                      <Hidden mdUp>
                                        <hr style={{ opacity: 0.3 }} />
                                      </Hidden>
                                      <Typography variant="body1"><strong>Selecciona una tarjeta:</strong></Typography>
                                      <FormControl variant="outlined" style={{ width: '95%' }}>
                                        <Select
                                          disabled={this.state.disabledSelect}
                                          native
                                          onChange={(event) => { this.handleChangeCard(event.target.value) }}
                                          value={this.state.card}
                                        >
                                          <option value="">
                                            Selecciona una tarjeta
                                          </option>
                                          {
                                            this.state.checkout.cardsOpenpay.map((card, idx) => {
                                              return (
                                                <option value={card.id}>{card.type.split('-').join(' ').toUpperCase()} - {card.number} / {card.titular} ({card.alias})</option>
                                              )
                                            })
                                          }
                                        </Select>
                                        <a href="" onClick={(event) => {
                                          event.preventDefault()
                                          this.setState({
                                            cardOpenpay: true,
                                            openAddCardModal: true
                                          })
                                        }} style={{ marginTop: 10 }}>Agregar nueva tarjeta</a>
                                      </FormControl>
                                    </Grid>

                                    :
                                    <div>
                                    </div>
                                }
                              </>
                          }
                        </Grid>
                        {
                          (this.state.paymentMethodSelected === CREDIVALE_PAY) ?
                            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} >
                              <div style={{ marginTop: 12, marginBottom: 12 }}>
                                <Grid container>
                                  <Grid item xl={3} lg={3} md={3} sm={4} xs={4}>
                                    <img src='/ine.jpg' style={{ width: '100%', paddingRight: 12 }} />
                                  </Grid>
                                  <Grid item xl={9} lg={9} md={9} sm={8} xs={8}>
                                    <Typography variant="body1">Captura los últimos 4 dígitos del folio de tu credencial.</Typography>
                                    <Typography variant="body2"><span style={{ fontSize: 12 }}>Lo puedes encontrar al reverso de tu credencial.</span></Typography>
                                    <TextField
                                      variant="outlined"
                                      style={{ marginTop: 8, marginBottom: 8 }}
                                      placeholder="_ _ _ _"
                                      label="Últimos 4 dígitos"
                                      value={self.state.folioIne}
                                      onChange={self.handleChangeFolioIne}
                                    />
                                  </Grid>
                                </Grid>
                                <Typography style={{ marginTop: 4, fontSize: 10, textAlign: 'center' }} variant="body2">* Todos los datos del CrediVale ® son obligatorios.</Typography>
                              </div>
                            </Grid>
                            :
                            ''
                        }

                      </Grid>
                      :
                      ''
                  }
                  <Hidden mdUp>
                    <hr style={{ opacity: 0.3 }} />
                  </Hidden>
                  {
                    (this.state.loadingCheckout) ?
                      <div style={{ textAlign: 'center', width: 100, margin: '0 auto', padding: '8px 0px' }}>
                        <Loading />
                      </div>
                      :
                      <>
                        <Grid container>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            {
                              (this.state.paymentMethodSelected === CREDIVALE_PAY  &&  this.state.availableExpressDelivery) ?
                                <Grid container >
                                  <Grid item xs={12}>
                                    <Alert style={{ display:'flex', justifyContent: 'center', alignItems:'center', marginBottom:'10px' }} severity="info">La entrega está disponible solamente a la persona autorizada del vale, no se podrá entregar su artículo a otra persona. Favor de considerar antes de confirmar su compra.</Alert>
                                  </Grid>
                                </Grid>
                                :
                                ''
                            }
                            <Table style={{ paddingLeft: '5%' }}>
                              <TableBody>
                                <TableRow>
                                  <TableCell style={{ width: '1%', margin: 0, padding: 4 }}>
                                    Subtotal
                                  </TableCell>
                                  <TableCell style={{ margin: 0, padding: 4 }}>
                                    <strong>$ {Utils.numberWithCommas(this.state.checkout.prices.subtotal.toFixed(2))} M.N.</strong>
                                  </TableCell>
                                </TableRow>
                                {
                                  (Number(this.state.bluePoints) > 0 && this.state.disabledBluePoints) ?
                                    <TableRow>
                                      <TableCell style={{ width: '1%', margin: 0, padding: 4 }}>
                                        Puntos
                                      </TableCell>
                                      <TableCell style={{ margin: 0, padding: 4 }}>
                                        <strong style={{ color: 'red', textDecoration: 'line-through' }}>- $ {Utils.numberWithCommas(Number(this.state.bluePoints).toFixed(2))} M.N.</strong>
                                      </TableCell>
                                    </TableRow>
                                    :
                                    <>
                                    </>
                                }
                                {
                                  (this.state.checkout.prices.discount > 0) ?
                                    <TableRow>
                                      <TableCell style={{ width: '1%', margin: 0, padding: 4 }}>
                                        Descto. cupón:
                                      </TableCell>
                                      <TableCell style={{ margin: 0, padding: 4 }}>
                                        <strong style={{ color: '#035D59' }}>- ${Utils.numberWithCommas(this.state.checkout.prices.discount.toFixed(2))} M.N.</strong>
                                        {
                                          (this.state.checkout.coupon !== null && this.state.checkout.coupon.percentageDiscount > 0) ?
                                            <strong> (<span style={{ color: 'red' }}>{this.state.checkout.coupon.percentageDiscount}%</span>)</strong>
                                            :
                                            ''
                                        }
                                      </TableCell>
                                    </TableRow>
                                    :
                                    <>
                                    </>
                                }
                                <TableRow>
                                  <TableCell style={{ width: '1%', margin: 0, padding: 4 }}>
                                    Envío
                                  </TableCell>
                                  <TableCell style={{ margin: 0, padding: 4 }}>
                                    <strong>{this.state.checkout.shippingMethod.name} {
                                      (this.state.checkout.prices.shippingCost > 0) ?
                                        <strong>($ {Utils.numberWithCommas(this.state.checkout.prices.shippingCost.toFixed(2))} M.N.)</strong>
                                        :
                                        ''
                                    }</strong>
                                    {
                                      (this.state.availableExpressDelivery) ?
                                        <div>
                                          <Button variant="text" className={classes.expressDelivery}>
                                            <Checkbox checked={this.state.expressDelivery} onChange={() => {
                                              this.setState({ expressDelivery: !this.state.expressDelivery })
                                            }} style={{ float: 'left' }} />
                                            <img style={{ width: '100%', padding: 0, float: 'right' }} alt="Entrega Express" src="../../calzzamovil.png" />
                                          </Button>
                                          <Typography variant="body1" style={{ fontSize: 11, color: 'green' }}>Pide y paga antes de las 2:00 pm y recibe hoy de 9:00 am a 9:00 pm</Typography>
                                          <Typography variant="body1" style={{ fontSize: 11, color: 'gray', marginBottom: 8 }}>Pide y paga después de las 2:00 pm y recibe mañana de 9:00 am a 9:00 pm</Typography>
                                        </div>
                                        :
                                        ''
                                    }
                                  </TableCell>
                                </TableRow>
                                {
                                  (this.state.checkout.prices.recharge !== 0) ?
                                    <TableRow>
                                      <TableCell style={{ width: '1%', margin: 0, padding: 4 }}>
                                        Recarga
                                      </TableCell>
                                      <TableCell style={{ margin: 0, padding: 4 }}>
                                        <strong>$ {Utils.numberWithCommas(this.state.checkout.prices.recharge.toFixed(2))} M.N.</strong>
                                      </TableCell>
                                    </TableRow>
                                    :
                                    <>
                                    </>
                                }
                                <TableRow>
                                  <TableCell style={{ width: '1%', margin: 0, padding: 4 }}>
                                    Total
                                  </TableCell>
                                  <TableCell style={{ margin: 0, padding: 4 }}>
                                    <strong style={{ color: 'green' }}>$ {Utils.numberWithCommas(this.state.checkout.prices.total.toFixed(2))} M.N.</strong>
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell></TableCell>
                                  <TableCell style={{ margin: 0, padding: 4 }}>
                                    <TextField
                                      disabled={(this.state.appliedCoupon) ? true : false}
                                      variant="outlined"
                                      style={{ width: '100%', marginTop: 12, marginBottom: 4 }}
                                      placeholder="Ingresar..."
                                      label="Cupón de descuento"
                                      value={this.state.coupon}
                                      onChange={this.handleChangeCoupon}
                                      InputProps={{
                                        startAdornment: (
                                          <InputAdornment position="start">
                                            <Label style={{ opacity: 0.3 }} />
                                          </InputAdornment>
                                        ),
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            {
                                              (!this.state.appliedCoupon) ?
                                                <Button disabled={(this.state.coupon.trim().length <= 0) ? true : false} variant="contained" color="primary" onClick={() => { this.applyCoupon() }} >
                                                  APLICAR
                                                </Button>
                                                :
                                                <Button variant="contained" color="default" onClick={() => { this.removeCoupon() }} >
                                                  QUITAR
                                                </Button>
                                            }
                                          </InputAdornment>
                                        )
                                      }} />
                                  </TableCell>
                                </TableRow>
                                {
                                  (this.state.checkout.bluePoints.win > 0) ?
                                    <TableRow>
                                      <TableCell style={{ width: '1%', margin: 0, padding: 4 }}>
                                      </TableCell>
                                      <TableCell style={{ margin: 0, padding: 4 }}>
                                        <strong style={{ color: 'blue' }}>{Utils.numberWithCommas(this.state.checkout.bluePoints.win)} {this.state.checkout.bluePoints.win === 1 ? 'punto azul' : 'puntos azules'} genera esta compra.</strong>
                                        <br />
                                        {
                                          (this.state.checkout.bluePoints.conditions.exchange) ?
                                            'Puedes utilizarlos en tu siguiente compra.'
                                            :
                                            'Activa tu Mondero Azul ® para acumularlos.'
                                        }
                                      </TableCell>
                                    </TableRow>
                                    :
                                    ''
                                }
                                {
                                  (this.state.checkout.bluePoints.conditions.exchange) ?
                                    <TableRow>
                                      <TableCell style={{ width: '1%', margin: 0, padding: 4 }}>
                                        <img style={{ width: 88 }} src="/monederoazul.svg" />
                                      </TableCell>
                                      <TableCell style={{ margin: 0, padding: 4 }}>
                                        <TextField style={{ marginTop: 12, paddingBottom: 6, width: '100%' }} variant="outlined"
                                          disabled={this.state.disabledBluePoints}
                                          label="Puntos"
                                          placeholder="Puntos..."
                                          value={this.state.bluePoints}
                                          onChange={self.handleChangeBluePoints}
                                          InputProps={{
                                            endAdornment: (
                                              <InputAdornment position="end">
                                                {
                                                  (this.state.disabledBluePoints) ?
                                                    <Button variant="contained" onClick={() => { this.applyBluePoints(false) }}>
                                                      QUITAR
                                                    </Button>
                                                    :
                                                    <Button variant="contained" color="primary" onClick={() => { this.applyBluePoints(true) }}>
                                                      APLICAR
                                                    </Button>
                                                }
                                              </InputAdornment>
                                            )
                                          }}
                                        />
                                        <br />
                                        <div style={{ paddingBottom: 12 }}>
                                          <span>Tienes <strong>{Utils.numberWithCommas(this.state.user.bluePoints.balance)}</strong> {(this.state.user.bluePoints.balance === 1) ? 'punto' : 'puntos'} en tu Monedero Azul ®.</span>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                    :
                                    <>
                                      {
                                        (!this.state.checkout.bluePoints.conditions.exchange) ?
                                          <TableRow style={{ textAlign: 'center', paddingTop: 12, paddingBottom: 12 }}>
                                            <TableCell></TableCell>
                                            <TableCell>
                                              {
                                                (!Utils.isEmpty(this.state.checkout.bluePoints.conditions.link)) ?
                                                  <Link href={this.state.checkout.bluePoints.conditions.link} target="blank">{this.state.checkout.bluePoints.conditions.message}</Link>
                                                  :
                                                  <span>{this.state.checkout.bluePoints.conditions.message}</span>
                                              }
                                            </TableCell>
                                          </TableRow>
                                          :
                                          ''
                                      }
                                    </>
                                }
                              </TableBody>
                            </Table>
                          </Grid>
                        </Grid>
                        {
                          (this.state.location !== null && this.state.shippingMethodSelected !== CLICK_AND_COLLECT) ?
                            <>
                              {
                                (!this.state.availableExpressDelivery) ?
                                  <Typography variant="body2" style={{ textAlign: 'center', marginTop: 22, color: this.state.location.color, lineHeight: 1.2, fontSize: 13, fontWeight: 800 }}>{this.state.location.description}</Typography>
                                  :
                                  ''
                              }
                            </>
                            :
                            ''
                        }
                      </>
                  }
                  <div style={{ marginTop: 24 }}>
                    <Icon style={{ color: 'green', float: 'left', marginTop: 6, marginRight: 10 }}>lock</Icon>
                    <Typography variant="body1" style={{ fontSize: 12, color: 'gray' }}>
                      Compra 100% segura con cifrado de información. Revisa tu pedido y asegúrate de que todos tus datos esten correctos. <strong>No se te cobrará nada hasta que confirmes tu compra.</strong>
                    </Typography>
                    <br />
                    <Typography variant="body1" className={(this.state.shippingMethodSelected !== null) ? classes.fix : ''} style={{ fontSize: 12, color: 'gray', textAlign: 'center' }}>
                      Al confirmar tu pedido aceptas los <a href="/terminos">términos y condiciones</a> y las <a href="/privacidad">políticas de privacidad</a> de GRUPO CALZAPATO S.A. DE C.V. y Calzapato.com ®
                    </Typography>
                  </div>
                  <ValidationSMSModal
                    openDialog={this.state.openValidationSMS}
                    handleCloseValidationSMSModalWithSuccess={(event) => {
                      this.setState({ openValidationSMS: false, validateCellphone: true }, () => {
                        self.createOrder()
                      })
                    }}
                    handleCloseValidationSMSModal={(event) => {
                      this.setState({ openValidationSMS: false })
                    }}
                  />
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
                          addresses: addresses
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
                </>
                :
                <div style={{ textAlign: 'center' }}>
                  <Loading />
                  <span style={{ marginTop: 16 }}>Cargando...</span>
                </div>
            }
          </div>
          <div className={classes.actionButtons} style={{ textAlign: 'center', marginTop: 24 }}>
            <Snackbar
              autoHideDuration={5000}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              open={this.state.openSnack}
              onClose={() => this.setState({ openSnack: false, messageSnack: '' })}
              message={
                <span>{this.state.messageSnack}</span>
              }
              action={[
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={() => this.setState({ openSnack: false, messageSnack: '' })}
                >
                  <CloseIcon />
                </IconButton>
              ]}
            />
            {
              (this.state.createOrderLoading || this.state.loadingCheckout) ?
                <>
                  {
                    (this.state.createOrderLoading) ?
                      <div style={{ padding: 32, paddingLeft: 0, paddingRight: 0, textAlign: 'center', width: 100, margin: '0 auto' }}>
                        <Loading />
                      </div>
                      :
                      ''
                  }
                </>
                :
                <div style={{ padding: 32 }}>
                  <Button variant="contained" style={{ marginRight: 16 }} onClick={() => { this.handleClose() }}><label style={{ textTransform: 'none', fontWeight: 400 }}>Cancelar</label></Button>
                  <Button variant="contained" style={{ backgroundColor: '#FFAA00' }} onClick={() => {
                    if (this.state.validateCellphone) {
                      this.createOrder()
                    } else {
                      this.setState({
                        openValidationSMS: true
                      })
                    }
                  }}>
                    <label style={{ textTransform: 'none', fontWeight: 800 }}>Confirmar pedido</label>
                  </Button>
                </div>
            }
          </div>
        </>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(HotShopping)
