'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { Link, Hidden, Typography, Checkbox, TextField, Button, InputAdornment, Table, TableHead, TableRow, TableCell, TableBody, Icon } from '@material-ui/core'
import Label from '@material-ui/icons/Label'

// Utils
import Utils from '../../resources/Utils'
import { requestAPI } from '../../api/CRUD'
import { dropShoppingCart } from '../../actions/actionShoppingCart'

// Components
import Empty from '../../components/Empty'
import ProductItem from '../../components/ProductItem'
import Loading from '../../components/Loading'
import MyAddresses from '../../components/MyAddresses'
import DeleteDialog from '../../components/DeleteDialog'
import ValidationSMSModal from '../../components/ValidationSMSModal'
import CardModal from '../../components/CardModal'
import GiftModal from '../../components/GiftModal'
import messages from '../../resources/Messages.json'
import MapModal from '../../components/MapModal'
import { selectedSize } from '../../actions/selectedSize'

const MB_SIZE = 2000000 // 2.0 MB
const BBVA_PAY = 1
const CREDIVALE_PAY = 2
const OXXO_PAY = 3
const PAYPAL = 4
const NETPAY = 5
const MERCADOPAGO = 8
const OPENPAY = 9
const PAYNET = 10
const CODI = 11

const styles = theme => ({
  checkoutContainer: {
    width: '90%',
    margin: '0 auto',
    marginTop: -48,
    [theme.breakpoints.down('sm')]: {
      marginTop: -72,
      marginBottom: 496
    }
  },
  createOrderContainer: {
    textAlign: 'right',
    backgroundColor: '#EFF3F7',
    padding: 16,
    marginLeft: 48
  },
  createOrderContainerUp: {
    textAlign: 'right',
    backgroundColor: '#EFF3F7',
    padding: 16,
    marginTop: -32,
    marginBottom: 32
  },
  createOrderButton: {
    textTransform: 'none',
    backgroundColor: '#A7E688',
    color: '#035D59',
    border: '2px solid #A7E688',
    boxShadow: 'none',
    marginBottom: 22,
    marginTop: 22,
    width: '100%',
    '&:hover': {
      opacity: 0.9
    }
  },
  paymentMethodSelected: {
    border: '2px solid ' + theme.palette.primary.main,
    borderRadius: 4,
    padding: '16px 8px',
    backgroundColor: '#FCFEFF'
  },
  paymentMethod: {
    padding: '18px 10px'
  },
  stores: {
    filter: 'brightness(1.1)',
    mixBlendMode: 'multiply',
  }
})

class Checkout extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loadingCheckout: false,
      user: null,
      openDeleteCard: false,
      validateCellphone: false,
      openValidationSMS: false,
      createOrderLoading: false,
      createOrderButtonDisabled: false,
      isCredit: false,
      openSnack: false,
      messageSnack: '',
      config: null,
      scrollPosition: 0,
      coupon: '',
      openGiftModal: false,
      appliedCoupon: false,
      selectedAddress: null,
      paymentMethodSelected: null,
      ineFront: null,
      ineBack: null,
      digitalVale: {
        status: false,
        folio: '',
        amount: ''
      },
      folio: '',
      amount: '',
      folioIne: '',
      withGiftCard: false,
      giftCard: null,
      card: null,
      editCard: false,
      disabledBluePoints: false,
      bluePoints: '',
      openMapModal: false,
      coords: false,
      uuidCAPIFacebook: null
    }

    this.handleChangeFileValue = this.handleChangeFileValue.bind(this)
    this.loadData = this.loadData.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.createOrder = this.createOrder.bind(this)
    this.handleChangeCoupon = this.handleChangeCoupon.bind(this)
    this.applyCoupon = this.applyCoupon.bind(this)
    this.removeCoupon = this.removeCoupon.bind(this)
    this.handleChangePaymentMethod = this.handleChangePaymentMethod.bind(this)
    this.handleChangeFolio = this.handleChangeFolio.bind(this)
    this.handleChangeAmount = this.handleChangeAmount.bind(this)
    this.handleChangeFolioIne = this.handleChangeFolioIne.bind(this)
    this.validateDigitalVale = this.validateDigitalVale.bind(this)
    this.handleChangeQuantity = this.handleChangeQuantity.bind(this)
    this.removeProduct = this.removeProduct.bind(this)
    this.getImageByCardType = this.getImageByCardType.bind(this)
    this.handleChangeCard = this.handleChangeCard.bind(this)
    this.handleChangeBluePoints = this.handleChangeBluePoints.bind(this)
    this.applyBluePoints = this.applyBluePoints.bind(this)
    this.handleChangeOpenpayCard = this.handleChangeOpenpayCard.bind(this)
  }

  handleChangeBluePoints(input) {
    if (!isNaN(Number(input.target.value.trim()))) {
      this.setState({
        bluePoints: input.target.value.trim()
      })
    }
  }

  handleChangeCard(card) {
    let config = this.state.config
    config.cards.forEach((item, idx) => {
      item.checked = false
      if (item.id === card.id) {
        config.cards[idx].checked = true
      }
    })

    this.setState({
      config: config
    })
  }
  handleChangeOpenpayCard(card) {
    let config = this.state.config
    config.cardsOpenpay.forEach((item, idx) => {
      item.checked = false
      if (item.id === card.id) {
        config.cardsOpenpay[idx].checked = true
      }
    })

    this.setState({
      config: config
    })
  }

  getImageByCardType(cardType) {
    if (cardType === 'visa') {
      return '/visa.svg'
    } else if (cardType === 'mastercard') {
      return '/mastercard.svg'
    } else {
      return '/amex.svg'
    }
  }

  extraForCellphoneShipping() {
    let total = 0
    this.state.products.forEach((product) => {
      if (product.genderCode === 5) {
        total += 350
      }
    })
    return total
  }

  async removeProduct(idx) {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'DELETE',
      resource: 'carts',
      endpoint: '/remove',
      data: {
        product: this.state.config.cart.products[idx].code,
        size: this.state.config.cart.products[idx].selection.size,
        article: this.state.config.cart.products[idx].selection.article
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.removed) {
        this.loadData()
      }
    }
  }

  async handleChangeQuantity(event, idx) {
    let value = Number(event.target.value)
    if (value > 0) {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'PATCH',
        resource: 'carts',
        endpoint: '/update',
        data: {
          product: this.state.config.cart.products[idx].code,
          size: this.state.config.cart.products[idx].selection.size,
          article: this.state.config.cart.products[idx].selection.article,
          quantity: value
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.updated) {
          this.loadData()
        }
      }
    }
    else {
      this.removeProduct(idx)
    }
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

  async validateDigitalVale() {
    if (Utils.isEmpty(this.state.folio.trim()) || Utils.isEmpty(this.state.amount.trim())) {
      this.setState({
        openSnack: true,
        messageSnack: 'Todos los datos del CrediVale ® son obligatorios.'
      })
    } else {
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

      let amount = Number(this.state.amount.trim())

      let message = messages.General.error
      let digitalVale = {
        status: false,
        folio: this.state.folio.trim(),
        amount: this.state.amount.trim()
      }

      if (response.status === Utils.constants.status.SUCCESS) {
        if (amount >= this.state.config.prices.total) {
          message = response.data.message
          if (response.data.message.substr(response.data.message.length - 15, response.data.message.length) === 'SI son válidos.') {
            digitalVale = {
              status: true,
              folio: this.state.folio.trim(),
              amount: this.state.amount.trim()
            }
          }
        }
        else {
          message = 'El monto del CrediVale ® es menor al monto total de la compra.'
        }
      }

      this.setState({
        digitalVale: digitalVale,
        openSnack: true,
        messageSnack: message
      })
    }
  }

  handleChangePaymentMethod(option) {
    let paymentMethodSelected = null
    let config = this.state.config
    let methods = []

    config.paymentMethods.forEach(function (method, idx) {
      method.checked = false
      if (method.id === option.id) {
        method.checked = true
        paymentMethodSelected = method
      }
      methods.push(method)
    })

    let openSnack = false
    let messageSnack = ''
    if (paymentMethodSelected.id === OXXO_PAY && this.state.config.prices.total > 10000) {
      openSnack = true
      messageSnack = 'Método de pago no válido para compras mayores a 10,000.00 M.N. Selecciona otro método de pago, por favor.'
    }

    this.setState({
      openSnack: openSnack,
      messageSnack: messageSnack,
      paymentMethodSelected: paymentMethodSelected,
      config: config
    }, () => {
      let isCredit = false
      if (paymentMethodSelected.id === CREDIVALE_PAY) {
        isCredit = true
      }
      this.loadData()
    })
  }

  async applyCoupon() {
    const self = this
    if (!Utils.isEmpty(this.state.coupon)) {
      this.setState({
        appliedCoupon: true
      }, () => {
        self.loadData()
      })
    }
  }

  async removeCoupon() {
    const self = this
    this.setState({
      coupon: '',
      appliedCoupon: false
    }, () => {
      self.loadData()
    })
  }

  handleChangeCoupon(input) {
    this.setState({
      coupon: input.target.value.toUpperCase()
    })
  }

  async componentWillMount() {
    const self = this
    let uuidActual = this.props.app.data.uuid
    if (uuidActual !== null) {
      this.setState({
        uuidCAPIFacebook: uuidActual
      })
    }
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      this.setState({
        user: user,
        validateCellphone: user.validationCellphone
      }, () => {
        self.loadData()
      })
    } else {
      Router.push(Utils.constants.paths.login + '?checkout=true')
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.giftCard !== prevProps.giftCard) {
      if (this.props.giftCard !== undefined && this.props.giftCard.data !== undefined && this.props.giftCard.data.option !== undefined) {
        this.setState({
          withGiftCard: true,
          giftCard: this.props.giftCard
        })
      } else {
        this.setState({
          withGiftCard: false,
          giftCard: null
        })
      }
    }
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  listenToScroll = () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop
    this.setState({
      scrollPosition: winScroll
    })
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.listenToScroll)
    // this.props.deleteGiftCard()
  }

  async createOrder() {
    let withError = false
    let selectedCard = null
    let deviceId = null

    if (this.state.selectedAddress.lat === null || this.state.selectedAddress.lng === null || this.state.selectedAddress.lat === undefined || this.state.selectedAddress.lng === undefined || this.state.selectedAddress.lat === '' || this.state.selectedAddress.lng === '' || this.state.selectedAddress.lat === 0 || this.state.selectedAddress.lng === 0) {
      withError = true
      this.setState({
        openMapModal: true
      })
      return
    }


    if (this.state.paymentMethodSelected === null) {
      withError = true
      this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un método de pago.'
      })
    } else {
      if (this.state.paymentMethodSelected.id === NETPAY) {
        this.state.config.cards.forEach(card => {
          if (card.checked) {
            selectedCard = card
          }
        })

        if (selectedCard === null) {
          withError = true
          this.setState({
            openSnack: true,
            messageSnack: 'Debes seleccionar o ingresar una tarjeta válida.'
          })
        }
      } else if (this.state.paymentMethodSelected.id === CREDIVALE_PAY) {
        if (!this.state.digitalVale.status) {
          withError = true
          this.setState({
            openSnack: true,
            messageSnack: 'Debes ingresar y validar un folio de CrediVale ®'
          }, () => {
            if (window.outerWidth < 960) {
              window.scrollTo(0, 800)
            }
          })
        } else if (Utils.isEmpty(this.state.folioIne.trim()) || this.state.folioIne.trim().length !== 4) {
          withError = true
          this.setState({
            openSnack: true,
            messageSnack: 'Debes ingresar los últimos 4 dígitos del folio de tu credencial.'
          }, () => {
            if (window.outerWidth < 960) {
              window.scrollTo(0, 800)
            }
          })
        }
      } else if (this.state.paymentMethodSelected.id === OXXO_PAY) {
        if (this.state.config.prices.subtotal > 10000) {
          withError = true
          this.setState({
            openSnack: true,
            messageSnack: 'No se pueden procesar compras mayores a $10,000.00 M.N. con el método de pago OXXO. Por favor, selecciona otro método de pago.'
          })
        }
      } else if (this.state.paymentMethodSelected.id === OPENPAY) {
        this.state.config.cardsOpenpay.forEach(card => {
          if (card.checked) {
            selectedCard = card
            deviceId = Utils.getDeviceIdOpenpay()
          }
        })

        if (selectedCard === null) {
          withError = true
          this.setState({
            openSnack: true,
            messageSnack: 'Debes seleccionar o ingresar una tarjeta válida.'
          })
        }

      }

      if (!withError && this.state.selectedAddress === null) {
        withError = true
        this.setState({
          openSnack: true,
          messageSnack: 'Debes indicar una dirección de entrega.'
        }, () => {
          let sum = 0
          if (this.state.paymentMethodSelected !== null && this.state.paymentMethodSelected.id === CREDIVALE_PAY)
            sum = 200
          if (window.outerWidth < 960) {
            window.scrollTo(0, 1000 + sum)
          }
          else {
            window.scrollTo(0, 500 + sum)
          }
        })
      }
    }


    if (!withError) {
      this.setState({ createOrderLoading: true })

      let data = {
        isCredit: this.state.isCredit,
        address: this.state.selectedAddress,
        checkout: this.state.config,
        giftCard: this.state.giftCard,
        paymentMethodSelected: this.state.paymentMethodSelected,
        bluePoints: (Utils.isEmpty(this.state.bluePoints)) ? 0 : Number(this.state.bluePoints)
      }

      if (this.state.paymentMethodSelected.id === CREDIVALE_PAY) {
        data.vale = this.state.digitalVale
        data.vale.ine = this.state.folioIne.trim()
      }

      if (this.state.paymentMethodSelected.id === NETPAY) {
        data.deviceFingerprintId = Utils.cybs_dfprofiler(Utils.constants.CONFIG_ENV.NETPAY_ORG_ID, 'netpaymx_retail', localStorage.getItem(Utils.constants.localStorage.UUID))
        data.card = selectedCard
      }

      if (this.state.paymentMethodSelected.id === OPENPAY) {
        data.deviceId = deviceId
        data.card = selectedCard
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
          } else if (response.data.paymentWay === MERCADOPAGO) {
            localStorage.setItem('payment', JSON.stringify(response.data))
            Router.push(Utils.constants.paths.payments)
          }
          else if (response.data.paymentWay === NETPAY && response.data.netpay.status === 'REVIEW') {
            localStorage.setItem('payment', JSON.stringify(response.data))
            Router.push(Utils.constants.paths.payments)
          } else if (response.data.paymentWay === OPENPAY && response.data.url !== undefined && response.data.url !== null) {
            localStorage.setItem('payment', JSON.stringify(response.data))
            Router.push(Utils.constants.paths.payments)
          }
          else {
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
            Router.push('/resumen/exito?pago=' + paymentDescription + '&token=' + response.data.order)
            
            if (this.state.config.cart.products != undefined && this.state.config.cart.products.length > 0  ) {
              let productsIds = []
              this.state.config.cart.products.forEach(product => {
                productsIds.push({size:product.selection.size,code:product.code})
              });
              this.props.selectedSize(productsIds)
            }          
          }
        }
        else {
          let messageError = response.data.error.message
          this.setState({
            openSnack: true,
            messageSnack: messageError,
            createOrderLoading: false
          })
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
      }
    }
  }

  async componentDidMount() {
    window.addEventListener('scroll', this.listenToScroll)
  }

  async loadData() {
    this.setState({
      loadingCheckout: true
    })

    let isCredit = (this.state.paymentMethodSelected !== null && this.state.paymentMethodSelected.id === CREDIVALE_PAY)
    if (Router.query.pago !== undefined && Router.query.pago === 'credivale') {
      isCredit = true
    }

    let bluePoints = 0
    if (this.state.disabledBluePoints && !isNaN(this.state.bluePoints)) {
      bluePoints = this.state.bluePoints
    }

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'POST',
      resource: 'orders',
      endpoint: '/checkout',
      data: {
        isCredit: isCredit,
        coupon: (this.state.appliedCoupon) ? this.state.coupon : '',
        bluePoints: Number(bluePoints)
      },
      headers: {
        zip: Utils.getDeliveryAddress().zip
      }
    })

    this.setState({
      loadingCheckout: false
    })

    if (response.status === Utils.constants.status.SUCCESS && response.data.cart.products.length > 0) {
      let paymentMethodSelected = null

      response.data.cards.forEach(card => {
        card.checked = false
      })

      response.data.paymentMethods.forEach((paymentMethod, idx) => {
        paymentMethod.checked = false
        if (isCredit) {
          if (paymentMethod.id === CREDIVALE_PAY) {
            paymentMethod.checked = true
            paymentMethodSelected = paymentMethod
          }
        } else {
          if (this.state.paymentMethodSelected !== null) {
            if (paymentMethod.id === this.state.paymentMethodSelected.id) {
              paymentMethod.checked = true
              paymentMethodSelected = paymentMethod
            }
          } else {
            if (idx === 0) {
              paymentMethod.checked = true
              paymentMethodSelected = paymentMethod
            }
          }
        }
      })

      let couponCode = this.state.appliedCoupon
      let couponName = this.state.coupon
      let snackBar = {
        status: false,
        message: ''
      }
      if (this.state.appliedCoupon) {
        if (response.data.coupon === null) {
          snackBar = {
            status: true,
            message: 'Cupón de descuento inválido.'
          }
          couponCode = false
          couponName = ''
        } else {
          snackBar = {
            status: true,
            message: 'Cupón de descuento válido.'
          }
        }
      }

      this.setState({
        isCredit: isCredit,
        paymentMethodSelected: paymentMethodSelected,
        config: response.data,
        appliedCoupon: couponCode,
        coupon: couponName,
        openSnack: snackBar.status,
        messageSnack: snackBar.message
      }, async () => {
        if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
          let items = []
          let contentIds = []
          let dateSending = new Date();
          response.data.cart.products.forEach((product, index) => {
            items.push({
              "id": product.code,
              "name": product.name,
              "list_name": "CategoryExplorer",
              "brand": product.brand.name,
              "category": product.categoryCode,
              "quantity": product.selection.quantity,
              "price": product.price
            })

            contentIds.push(product.code)
          })

          gtag('event', 'conversion', {
            'send_to': this.props.app.data.googleAdsConversionEvents.checkout,
            'value': response.data.prices.total,
            'currency': 'MXN'
          })

          gtag('event', 'begin_checkout', {
            "items": items,
            "coupon": ""
          })

          fbq('event', 'InitiateCheckout', {
            'content_category': 'CategoryExplorer',
            'content_ids': contentIds,
            'contents': items,
            'num_items': items.length
          }, { eventID: 'InitiateCheckout' })

          if (this.state.user !== null && this.state.user !== undefined) {
            let eventInitiateCheckoutToFacebook = {
              "data": [
                {
                  "event_name": 'InitiateCheckout',
                  'event_time': Utils.timeIntoSeconds(dateSending),
                  'user_data': {
                    'fn': await Utils.hashingData(this.state.user.name),
                    'ln': await Utils.hashingData(this.state.user.secondLastName)
                  },
                  'custom_data': {
                    'content_category': 'CategoryExplorer',
                    'content_ids': contentIds,
                    'num_items': items.length
                  },
                  'event_id': 'InitiateCheckout',
                  'action_source': 'website'
                }
              ]
            }

            await Utils.sendConversionApiFacebook(eventInitiateCheckoutToFacebook, this.state.uuidCAPIFacebook)

          }

        }
      })
    } else {
      if (response.data.cart.products.length <= 0) {
        this.props.dropShoppingCart()
      }
      Router.push('/')
    }
  }

  handleChangeFileValue(event, document) {
    const self = this
    let uploadFile = event.target.files[0]

    if (uploadFile === undefined) {
      this.setState({
        openSnack: true,
        messageSnack: 'Formato de documento no válido.'
      })
      return
    }

    let fileName = uploadFile.name
    let fileType = uploadFile.type
    let fileSize = uploadFile.size

    if (fileType !== 'image/jpeg' && fileType !== 'image/jpg' && fileType !== 'image/png' && fileType !== 'application/pdf') {
      this.setState({
        openSnack: true,
        messageSnack: 'Formato de documento no válido.'
      })
      return
    }

    Utils.getBase64(uploadFile).then(function (data) {
      let doc = {
        name: fileName,
        type: fileType,
        size: fileSize,
        data: data
      }

      if (fileType === 'application/pdf') {
        if (fileSize > MB_SIZE) {
          self.setState({
            openSnack: true,
            messageSnack: 'El documento de la INE es demasiado grande. Por favor, intenta de nuevo con otro.'
          })
          return
        }
        else {
          self.setState({
            [document]: doc
          })
          return
        }
      }

      let img = new Image()
      img.src = data
      img.onload = function () {
        doc.width = this.width
        doc.height = this.height
        doc.data = Utils.compressImage(img, fileType, doc.width, doc.height, 0.3)
        doc.size = Utils.dataURLToBlob(doc.data, fileType).size

        if (doc.size > MB_SIZE) {
          self.setState({
            openSnack: true,
            messageSnack: 'El documentos de la INE es demasiado grande. Por favor, intenta de nuevo con otro.'
          })
          return
        }

        self.setState({
          [document]: doc
        })
      }
    })
  }

  applyBluePoints(flag) {
    const self = this
    if (flag) {
      if (Utils.isEmpty(this.state.bluePoints.trim()) || isNaN(Number(this.state.bluePoints.trim())) || Number(this.state.bluePoints.trim()) <= 0) {
        this.setState({
          openSnack: true,
          messageSnack: 'Ingresa una cantidad válida.'
        })
        return
      }
      if (Number(this.state.bluePoints) > this.state.user.bluePoints.balance) {
        this.setState({
          openSnack: true,
          messageSnack: 'No cuentas con esos puntos en tu monedero.'
        })
        return
      }
      this.setState({
        disabledBluePoints: true
      }, () => {
        self.loadData()
      })
    } else {
      this.setState({
        bluePoints: '',
        disabledBluePoints: false
      }, () => {
        self.loadData()
      })
    }
  }

  render() {
    const self = this
    const { classes } = this.props
console.log(this.state);
    return (
      <div className={classes.checkoutContainer}>
        {
          (this.state.config !== null) ?
            <Grid container>
              <GiftModal
                openDialog={this.state.openGiftModal}
                handleCloseGiftModal={(event) => {
                  this.setState({ openGiftModal: false })
                }}
              />
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
              <CardModal
                open={this.state.openAddCardModal}
                openpay={(this.state.paymentMethodSelected.id === OPENPAY) ? true : false}
                editCard={this.state.editCard}
                card={this.state.card}
                handleCloseWithCard={(card) => {
                  if (!this.state.editCard) {
                    const self = this
                    let config = this.state.config
                    card.checked = true
                    config.cards.push(card)
                    config.cardsOpenpay.push(card)
                    this.setState({
                      openAddCardModal: false,
                      editCard: false,
                      card: null,
                      config: config
                    }, () => {
                      self.handleChangeCard(card)
                    })
                  } else {
                    this.setState({
                      openAddCardModal: false,
                      editCard: false,
                      card: null,
                    })
                  }
                }}
                handleClose={() => {
                  this.setState({
                    openAddCardModal: false,
                    editCard: false,
                    card: null
                  })
                }}
              />
              <DeleteDialog
                open={this.state.openDeleteCard}
                title="Eliminar tarjeta."
                description={
                  (this.state.card !== null) ?
                    <Typography variant="body1">¿Deseas eliminar la tarjeta con terminación: <strong>{this.state.card.number}</strong>?</Typography>
                    :
                    ''
                }
                host={Utils.constants.CONFIG_ENV.HOST}
                resource="cards"
                data={this.state.card}
                onCancel={() => {
                  this.setState({
                    openDeleteCard: false,
                    card: null
                  })
                }}
                onConfirm={() => {
                  let config = this.state.config
                  let card = this.state.card
                  let cards = []
                  if (this.state.paymentMethodSelected.id === NETPAY) {
                    config.cards.forEach(item => {
                      if (item.id !== card.id) {
                        cards.push(item)
                      }
                    })
                    config.cards = cards
                  } else if (this.state.paymentMethodSelected.id === OPENPAY) {
                    config.cardsOpenpay.forEach(item => {
                      if (item.id !== card.id) {
                        cards.push(item)
                      }
                    })
                    config.cardsOpenpay = cards
                  }

                  this.setState({
                    openDeleteCard: false,
                    card: null,
                    config: config
                  })
                }}
              />
              <Hidden mdUp>
                <Grid item sm={12} xs={12}>
                  <div className={classes.createOrderContainerUp} style={{ marginTop: 4 }}>
                    {
                      (this.state.loadingCheckout) ?
                        <div style={{ textAlign: 'center', width: 100, margin: '0 auto', padding: '16px 0px' }}>
                          <Loading />
                        </div>
                        :
                        this.renderConfirmOrder()
                    }
                  </div>
                </Grid>
              </Hidden>
              <Grid item lg={7} md={7} sm={12} xs={12}>
                <Grid item lg={12}>
                  <Typography variant="h4">1. Método de pago.</Typography>
                  <Typography variant="body2">Tu compra a crédito o de contado con nuestras opciones de pago.</Typography>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', marginTop: 32 }}>
                    {
                      (this.state.config.paymentMethods.length > 0) ?
                        this.state.config.paymentMethods.map(function (method, idx) {
                          return (
                            <li key={idx} className={(method.checked) ? classes.paymentMethodSelected : classes.paymentMethod} >
                              <Grid container>
                                <Grid item xl={1} lg={1} md={1} sm={1} xs={2}>
                                  <Checkbox color="primary" checked={method.checked} onChange={() => { self.handleChangePaymentMethod(method) }}></Checkbox>
                                </Grid>
                                <Grid item xl={11} lg={11} md={11} sm={11} xs={10}>
                                  <Typography variant="body1"><strong>{method.name}</strong></Typography>
                                  <Typography variant="body2">{method.description}</Typography>
                                  {
                                    (method.id === NETPAY) ?
                                      <div>
                                        <img style={{ height: 34, float: 'left', paddingTop: 8, marginRight: 8 }} alt='' src={'/visa.svg'} />
                                        <img style={{ height: 34, float: 'left', marginRight: 8, paddingTop: 8 }} alt='' src={'/mastercard.svg'} />
                                        <img style={{ height: 34, float: 'left', paddingTop: 8, marginBottom: 12 }} alt='' src={'/amex.svg'} />
                                        {
                                          (self.state.paymentMethodSelected !== null && self.state.paymentMethodSelected.id === NETPAY) ?
                                            <Grid container>
                                              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginBottom: 16 }}>
                                                {
                                                  (self.state.config.cards.length > 0) ?
                                                    <Table style={{ marginTop: 8 }}>
                                                      <TableHead style={{ padding: 0, margin: 0, maxHeight: 0, minHeight: 0, height: 0 }}>
                                                        <TableRow>
                                                          <TableCell style={{ width: '5%', padding: 0, margin: 0 }}></TableCell>
                                                          <TableCell style={{ width: '10%', padding: 0, margin: 0 }}></TableCell>
                                                          <TableCell style={{ width: '10%', padding: 0, margin: 0 }}>
                                                            <Typography variant="body1" style={{ fontSize: 12 }}>Número</Typography>
                                                          </TableCell>
                                                          <Hidden mdDown>
                                                            <TableCell style={{ width: '30%', padding: 0, margin: 0 }}>
                                                              <Typography variant="body1" style={{ fontSize: 12 }}>Titular</Typography>
                                                            </TableCell>
                                                            <TableCell style={{ width: '20%', padding: 0, margin: 0 }}>
                                                              <Typography variant="body1" style={{ fontSize: 12 }}>Alias</Typography>
                                                            </TableCell>
                                                          </Hidden>
                                                          <TableCell style={{ width: '25%', padding: 0, margin: 0 }}></TableCell>
                                                        </TableRow>
                                                      </TableHead>
                                                      <TableBody>
                                                        {
                                                          self.state.config.cards.map(card => {
                                                            return (
                                                              <TableRow>
                                                                <TableCell style={{ width: '1%', padding: 0, margin: 0 }}>
                                                                  <Checkbox color="primary" checked={card.checked} onChange={() => { self.handleChangeCard(card) }} />
                                                                </TableCell>
                                                                <TableCell style={{ width: '1%', padding: 0, margin: 0 }}><img style={{ height: 16, marginRight: 16 }} src={self.getImageByCardType(card.type)} /></TableCell>
                                                                <TableCell style={{ width: '1%', padding: 0, margin: 0 }}>
                                                                  <Typography variant="body2" style={{ fontSize: 14 }}>{card.number}</Typography>
                                                                </TableCell>
                                                                <Hidden mdDown>
                                                                  <TableCell style={{ width: '1%', padding: 0, margin: 0 }}>
                                                                    <Typography variant="body2" style={{ fontSize: 14 }}>{card.titular}</Typography>
                                                                  </TableCell>
                                                                  <TableCell style={{ width: '1%', padding: 0, margin: 0 }}>
                                                                    <Typography variant="body2" style={{ fontSize: 14 }}>{card.alias}</Typography>
                                                                  </TableCell>
                                                                </Hidden>
                                                                <TableCell style={{ width: '1%', padding: 0, margin: 0 }}>
                                                                  <IconButton onClick={() => {
                                                                    self.setState({
                                                                      openAddCardModal: true,
                                                                      editCard: true,
                                                                      card: card
                                                                    })
                                                                  }}><Icon>edit</Icon></IconButton>
                                                                  <IconButton onClick={() => {
                                                                    self.setState({
                                                                      openDeleteCard: true,
                                                                      card: card
                                                                    })
                                                                  }}><Icon>delete</Icon></IconButton>
                                                                </TableCell>
                                                              </TableRow>
                                                            )
                                                          })
                                                        }
                                                      </TableBody>
                                                    </Table>
                                                    :
                                                    <Empty
                                                      title="¡No tienes tarjetas!"
                                                      description="Agrega una tarjeta haciendo click en el botón de abajo."
                                                      buttonTitle="Agregar tarjeta"
                                                      callToAction={() => { self.setState({ openAddCardModal: true }) }}
                                                    />
                                                }
                                                {
                                                  (self.state.config.cards.length > 0) ?
                                                    <Button variant="contained" color="primary" style={{ marginTop: 16 }} onClick={() => {
                                                      self.setState({
                                                        openAddCardModal: true
                                                      })
                                                    }}>
                                                      <span style={{ fontWeight: 600, color: 'white' }}>
                                                        AGREGAR TARJETA
                                                      </span>
                                                    </Button>
                                                    :
                                                    ''
                                                }
                                              </Grid>
                                            </Grid>
                                            :
                                            ''
                                        }
                                      </div>
                                      :
                                      <div>
                                        {
                                          (method.id === CREDIVALE_PAY) ?
                                            <Grid container>
                                              <Grid item lg={12}><img style={{ height: 44, float: 'left', paddingTop: 8 }} alt='' src='/credivale.svg' /></Grid>
                                              {
                                                (self.state.paymentMethodSelected !== null && self.state.paymentMethodSelected.id === CREDIVALE_PAY) ?
                                                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
                                                    <form>
                                                      <strong>Paso 1.</strong>
                                                      <Typography variant="body1">Valida el vale electrónico de CrediVale ® de forma rápida y segura.</Typography>
                                                      <TextField autoFocus style={{ marginTop: 4, marginRight: 8 }} type="text" placeholder="Folio electrónico *" value={self.state.folio} onChange={self.handleChangeFolio} />
                                                      <TextField style={{ marginTop: 4, marginRight: 8 }} type="text" placeholder="Monto *" value={self.state.amount} onChange={self.handleChangeAmount} />
                                                      <Button style={{ marginTop: 4, marginRight: 4 }} variant="contained" color="primary" onClick={() => self.validateDigitalVale()}>VALIDAR CREDIVALE ®</Button>
                                                      {
                                                        (self.state.digitalVale.status) ?
                                                          <img style={{ paddingTop: 4, marginLeft: 8, width: 22 }} alt='' src={'/success.svg'} />
                                                          :
                                                          <span>
                                                            {
                                                              (!self.state.digitalVale.status && !Utils.isEmpty(self.state.digitalVale.folio.trim())) ?
                                                                <img style={{ paddingTop: 4, marginLeft: 8, width: 22 }} alt='' src={'/error.svg'} />
                                                                :
                                                                ''
                                                            }
                                                          </span>
                                                      }
                                                      <Typography style={{ marginTop: 4, fontSize: 10 }} variant="body2">* Todos los datos del CrediVale ® son obligatorios.</Typography>
                                                      <div style={{ marginTop: 16 }}>
                                                        <strong>Paso 2.</strong>
                                                        <br />
                                                        <Grid container>
                                                          <Grid item xl={7} lg={7} md={7} sm={7} xs={7}>
                                                            <Typography variant="body1">Captura los últimos 4 dígitos del folio de tu credencial.</Typography>
                                                            <Typography variant="body2"><span style={{ fontSize: 12 }}>Lo puedes encontrar al reverso de tu credencial.</span></Typography>
                                                            <TextField
                                                              variant="outlined"
                                                              style={{ marginTop: 16, marginBottom: 32 }}
                                                              placeholder="_ _ _ _"
                                                              label="Últimos 4 dígitos"
                                                              value={self.state.folioIne}
                                                              onChange={self.handleChangeFolioIne}
                                                            />
                                                          </Grid>
                                                          <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                                                            <img src='/ine.jpg' style={{ width: '100%' }} />
                                                          </Grid>
                                                        </Grid>
                                                        {/*
                                                        <Typography variant="body1">Sube la INE del beneficiario por enfrente y por atrás.</Typography>
                                                        <Typography variant="body2"><span style={{ fontSize: 12 }}>Debe ser la misma persona que recibirá el pedido.</span></Typography>
                                                        <Grid container>
                                                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                                            <Button
                                                              style={{ marginTop: 16, width: '70%' }}
                                                              className={classes.primaryButton}
                                                              color={ (self.state.ineFront !== null) ? "primary" : "default" }
                                                              variant="contained"
                                                              component="label"
                                                            >
                                                              <div>
                                                                <span>HAZ CLICK AQUÍ PARA SUBIR INE POR ENFRENTE </span> { (self.state.ineFront !== null) ? '✅' : '❌' }
                                                              </div>
                                                              <input
                                                                type="file"
                                                                style={{ display: "none" }}
                                                                onChange={(event) => { self.handleChangeFileValue(event, "ineFront") }}
                                                              />
                                                            </Button>
                                                          </Grid>
                                                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                                            <Button
                                                              style={{ marginTop: 16, width: '70%' }}
                                                              color={ (self.state.ineBack !== null) ? "primary" : "default" }
                                                              variant="contained"
                                                              component="label"
                                                            >
                                                              <div>
                                                                <span>HAZ CLICK AQUÍ PARA SUBIR INE POR ATRÁS </span> { (self.state.ineBack !== null) ? '✅' : '❌' }
                                                              </div>
                                                              <input
                                                                type="file"
                                                                style={{ display: "none" }}
                                                                onChange={(event) => { self.handleChangeFileValue(event, "ineBack") }}
                                                              />
                                                            </Button>
                                                          </Grid>
                                                        </Grid>
                                                        */}
                                                      </div>
                                                    </form>
                                                  </Grid>
                                                  :
                                                  ''
                                              }
                                            </Grid>
                                            :
                                            <div>
                                              {
                                                (method.id === OXXO_PAY) ?
                                                  <div>
                                                    <Typography variant="body2">Monto máximo permitido: <strong style={{ color: 'green' }}>$10,000 M.N.</strong></Typography>
                                                    <img style={{ height: 50, float: 'left', marginRight: 8, paddingTop: 8 }} alt='' src='/oxxo.svg' />
                                                  </div>
                                                  :
                                                  <div>
                                                    {
                                                      (method.id === BBVA_PAY) ?
                                                        <div>
                                                          <img style={{ height: 36, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'/visa.svg'} />
                                                          <img style={{ height: 36, float: 'left', marginRight: 12, paddingTop: 8 }} alt='' src={'/mastercard.svg'} />
                                                          <img style={{ height: 36, float: 'left', marginRight: 12, paddingTop: 8 }} alt='' src={'/bbva.svg'} />
                                                        </div>
                                                        :
                                                        <div>
                                                          {
                                                            (method.id === PAYPAL) ?
                                                              <div>
                                                                <img style={{ height: 44, float: 'left', marginRight: 8, paddingTop: 8 }} alt='' src={'/paypal.svg'} />
                                                              </div>
                                                              :
                                                              <div>
                                                                {
                                                                  /* MercadoPago */
                                                                  (method.id === MERCADOPAGO) ?
                                                                    <div>
                                                                      <img style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'/mercadopago.png'} />
                                                                    </div>
                                                                    :
                                                                    /* PAYNET */
                                                                    <div>
                                                                      {
                                                                        (method.id === PAYNET) ?
                                                                          <div>
                                                                            <div style={{ display: 'flex' }}>
                                                                              <img style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'https://www.paynet.com.mx/img/logo_header.png'} />
                                                                            </div>
                                                                            <Typography variant="body1">Establecimientos en los que puedes realizar el pago:</Typography>
                                                                            <div style={{ display: 'flex' }}>
                                                                              <img className={classes.stores} style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'https://www.paynet.com.mx/img/benavides.png'} />
                                                                              <img className={classes.stores} style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'https://www.paynet.com.mx/img/ahorro.jpg'} />
                                                                              <img className={classes.stores} style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'https://www.paynet.com.mx/img/aurrera.jpg'} />
                                                                              <img className={classes.stores} style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'https://www.paynet.com.mx/img/seven.jpg'} />
                                                                            </div>
                                                                            <div style={{ display: 'flex' }}>
                                                                              <img className={classes.stores} style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'https://www.paynet.com.mx/img/walmart.jpg'} />
                                                                              <img className={classes.stores} style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'https://www.paynet.com.mx/img/guadalajara.jpg'} />
                                                                              <img className={classes.stores} style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'https://www.paynet.com.mx/img/waldos.jpg'} />
                                                                              <img className={classes.stores} style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'https://www.paynet.com.mx/img/walmart_express.png'} />
                                                                            </div>
                                                                          </div>
                                                                          :
                                                                          <div>
                                                                            {
                                                                              (method.id === OPENPAY) ?
                                                                                <div>
                                                                                  <img style={{ height: 34, float: 'left', paddingTop: 8, marginRight: 8 }} alt='' src={'/visa.svg'} />
                                                                                  <img style={{ height: 34, float: 'left', marginRight: 8, paddingTop: 8 }} alt='' src={'/mastercard.svg'} />
                                                                                  <img style={{ height: 34, float: 'left', paddingTop: 8, marginBottom: 12 }} alt='' src={'/amex.svg'} />
                                                                                  {
                                                                                    (self.state.paymentMethodSelected !== null && self.state.paymentMethodSelected.id === OPENPAY) ?
                                                                                      <Grid container>
                                                                                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginBottom: 16 }}>
                                                                                          {
                                                                                            (self.state.config.cardsOpenpay.length > 0) ?
                                                                                              <Table style={{ marginTop: 8 }}>
                                                                                                <TableHead style={{ padding: 0, margin: 0, maxHeight: 0, minHeight: 0, height: 0 }}>
                                                                                                  <TableRow>
                                                                                                    <TableCell style={{ width: '5%', padding: 0, margin: 0 }}></TableCell>
                                                                                                    <TableCell style={{ width: '10%', padding: 0, margin: 0 }}></TableCell>
                                                                                                    <TableCell style={{ width: '10%', padding: 0, margin: 0 }}>
                                                                                                      <Typography variant="body1" style={{ fontSize: 12 }}>Número</Typography>
                                                                                                    </TableCell>
                                                                                                    <Hidden mdDown>
                                                                                                      <TableCell style={{ width: '30%', padding: 0, margin: 0 }}>
                                                                                                        <Typography variant="body1" style={{ fontSize: 12 }}>Titular</Typography>
                                                                                                      </TableCell>
                                                                                                      <TableCell style={{ width: '20%', padding: 0, margin: 0 }}>
                                                                                                        <Typography variant="body1" style={{ fontSize: 12 }}>Alias</Typography>
                                                                                                      </TableCell>
                                                                                                    </Hidden>
                                                                                                    <TableCell style={{ width: '25%', padding: 0, margin: 0 }}></TableCell>
                                                                                                  </TableRow>
                                                                                                </TableHead>
                                                                                                <TableBody>
                                                                                                  {
                                                                                                    self.state.config.cardsOpenpay.map(card => {
                                                                                                      return (
                                                                                                        <TableRow>
                                                                                                          <TableCell style={{ width: '1%', padding: 0, margin: 0 }}>
                                                                                                            <Checkbox color="primary" checked={card.checked} onChange={() => { self.handleChangeOpenpayCard(card) }} />
                                                                                                          </TableCell>
                                                                                                          <TableCell style={{ width: '1%', padding: 0, margin: 0 }}><img style={{ height: 16, marginRight: 16 }} src={self.getImageByCardType(card.type)} /></TableCell>
                                                                                                          <TableCell style={{ width: '1%', padding: 0, margin: 0 }}>
                                                                                                            <Typography variant="body2" style={{ fontSize: 14 }}>{card.number}</Typography>
                                                                                                          </TableCell>
                                                                                                          <Hidden mdDown>
                                                                                                            <TableCell style={{ width: '1%', padding: 0, margin: 0 }}>
                                                                                                              <Typography variant="body2" style={{ fontSize: 14 }}>{card.titular}</Typography>
                                                                                                            </TableCell>
                                                                                                            <TableCell style={{ width: '1%', padding: 0, margin: 0 }}>
                                                                                                              <Typography variant="body2" style={{ fontSize: 14 }}>{card.alias}</Typography>
                                                                                                            </TableCell>
                                                                                                          </Hidden>
                                                                                                          <TableCell style={{ width: '1%', padding: 0, margin: 0 }}>
                                                                                                            <IconButton onClick={() => {
                                                                                                              self.setState({
                                                                                                                openAddCardModal: true,
                                                                                                                editCard: true,
                                                                                                                card: card
                                                                                                              })
                                                                                                            }}><Icon>edit</Icon></IconButton>
                                                                                                            <IconButton onClick={() => {
                                                                                                              self.setState({
                                                                                                                openDeleteCard: true,
                                                                                                                card: card
                                                                                                              })
                                                                                                            }}><Icon>delete</Icon></IconButton>
                                                                                                          </TableCell>
                                                                                                        </TableRow>
                                                                                                      )
                                                                                                    })
                                                                                                  }
                                                                                                </TableBody>
                                                                                              </Table>
                                                                                              :
                                                                                              <Empty
                                                                                                title="¡No tienes tarjetas!"
                                                                                                description="Agrega una tarjeta haciendo click en el botón de abajo."
                                                                                                buttonTitle="Agregar tarjeta"
                                                                                                callToAction={() => { self.setState({ openAddCardModal: true }) }}
                                                                                              />
                                                                                          }
                                                                                          {
                                                                                            (self.state.config.cardsOpenpay.length > 0) ?
                                                                                              <Button variant="contained" color="primary" style={{ marginTop: 16 }} onClick={() => {
                                                                                                self.setState({
                                                                                                  openAddCardModal: true
                                                                                                })
                                                                                              }}>
                                                                                                <span style={{ fontWeight: 600, color: 'white' }}>
                                                                                                  AGREGAR TARJETA
                                                                                                </span>
                                                                                              </Button>
                                                                                              :
                                                                                              ''
                                                                                          }
                                                                                        </Grid>
                                                                                      </Grid>
                                                                                      :
                                                                                      ''
                                                                                  }
                                                                                </div>


                                                                                :
                                                                                <div>
                                                                                  {
                                                                                    /* MercadoPago */
                                                                                    (method.id === CODI) ?
                                                                                      <div>
                                                                                        <img style={{ height: 50, float: 'left', paddingTop: 8, marginRight: 12 }} alt='' src={'https://www.codi.org.mx/img/LogText.png'} />
                                                                                      </div>
                                                                                      :
                                                                                      ''
                                                                                  }
                                                                                </div>
                                                                            }
                                                                          </div>
                                                                      }
                                                                    </div>



                                                                }
                                                              </div>
                                                          }
                                                        </div>
                                                    }
                                                  </div>
                                              }
                                            </div>
                                        }
                                      </div>
                                  }
                                </Grid>
                              </Grid>
                            </li>
                          )
                        })
                        :
                        <Empty
                          title="Métodos de pagos no disponibles."
                          description="Por el momento no hay métodos de pagos disponibles."
                        />
                    }
                  </ul>
                </Grid>
                <Grid>
                  <Grid item style={{ marginTop: 48, marginBottom: "16px" }}>
                    <Typography variant="h4">2. Dirección de entrega</Typography>
                    <Grid container>
                      <Grid item>
                        <Typography variant="body2">Agrega o selecciona la dirección donde quieres que sea entregado tu pedido.</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <MyAddresses
                    selectedAddress={(address) => {
                      self.setState({
                        selectedAddress: address
                      }, () => {
                        self.loadData()
                      })
                    }}
                  />
                </Grid>
                <Grid item lg={12} style={{ marginTop: 48 }}>
                  <Typography variant="h4">3. Tu pedido.</Typography>
                  <Typography variant="body2">Revisa que tu pedido esté completo para continuar.</Typography>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', marginTop: 32 }}>
                    {
                      this.state.config.cart.products.map(function (product, idx) {
                        return (
                          <li key={idx}>
                            <ProductItem
                              idx={idx}
                              from="checkout"
                              products={self.state.config.cart.products}
                              removeProduct={(idx) => { self.removeProduct(idx) }}
                              handleChangeQuantity={(event, idx) => { self.handleChangeQuantity(event, idx) }}
                            />
                            <hr style={{ opacity: 0.2 }} />
                          </li>
                        )
                      })
                    }
                  </ul>
                </Grid>
              </Grid>
              <Hidden smDown>
                <Grid item lg={5} md={5}>
                  <div className={classes.createOrderContainer} style={(this.state.scrollPosition >= 80) ? { position: 'fixed', top: 22, right: 90, width: '34.35%' } : { position: 'relative' }}>
                    {
                      (this.state.loadingCheckout) ?
                        <div style={{ textAlign: 'center', width: 100, margin: '0 auto', padding: '16px 0px' }}>
                          <Loading />
                        </div>
                        :
                        this.renderConfirmOrder()
                    }
                  </div>
                </Grid>
              </Hidden>
              <Hidden mdUp>
                <Grid item sm={12} xs={12}>
                  <div className={classes.createOrderContainerUp} style={{ marginTop: 4 }}>
                    {this.renderConfirmOrder()}
                  </div>
                </Grid>
              </Hidden>
            </Grid>
            :
            <Empty
              isLoading={true}
              title="Cargando..."
            />
        }

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
        <MapModal
          open={this.state.openMapModal}
          address={this.state.selectedAddress}
          handleConfirm={(data) => {
            this.setState({ openMapModal: false, }, () => {
              let address = this.state.selectedAddress
              address.lat = data.location.lat
              address.lng = data.location.lng

              self.setState({
                selectedAddress: address
              }, () => {
                self.createOrder()
              })
            })
          }}
          handleClose={() => { this.setState({ openMapModal: false }) }}
        />
      </div>
    )
  }

  renderConfirmOrder() {
    let { classes } = this.props
    return (
      <Grid container>
        <Grid item lg={3} md={3} sm={12} xs={12}></Grid>
        <Grid item lg={6} md={6} sm={12} xs={12} style={{ textAlign: 'center' }}>
          <Typography variant="body1">
            Total de productos: <strong>{Utils.numberWithCommas(this.state.config.cart.totalProducts)}</strong>
          </Typography>
          <Typography variant="body1">
            Sutotal: <strong>$ {Utils.numberWithCommas(this.state.config.prices.subtotal.toFixed(2))} M.N.</strong>
          </Typography>
          <br />
          <Typography variant="body1">
            Envío: <strong>{this.state.config.shippingMethod.name}
              {
                (this.state.config.shippingMethod.cost > 0) ?
                  <span> (${Utils.numberWithCommas(this.state.config.shippingMethod.cost.toFixed(2))} M.N.)</span>
                  :
                  ''
              }
            </strong>
          </Typography>
          <Typography variant="body2">
            <span style={{ fontSize: 11 }}>{this.state.config.shippingMethod.description}</span>
          </Typography>
          {
            (this.state.config.prices.recharge !== 0) ?
              <>
                <br />
                <Typography variant="body1">
                  Recarga Telcel: <strong>$ {Utils.numberWithCommas(this.state.config.prices.recharge.toFixed(2))} M.N.</strong>
                </Typography>
                <span style={{ fontSize: 11 }}>$50.00 por equipo.</span>
              </>
              :
              ''
          }
          <br />
          {
            (this.state.saved) ?
              <Typography variant="body1">
                Total ahorrado: <strong style={{ color: '#035D59' }}>${Utils.numberWithCommas(this.state.config.prices.saved.toFixed(2))} M.N.</strong>
              </Typography>
              :
              ''
          }
          {
            (Number(this.state.bluePoints) > 0 && this.state.disabledBluePoints) ?
              <Typography variant="body1">
                Puntos: <strong style={{ color: 'red', textDecoration: 'line-through' }}>- $ {Utils.numberWithCommas(Number(this.state.bluePoints).toFixed(2))} M.N.</strong>
              </Typography>
              :
              ''
          }
          {
            (this.state.config.prices.discount > 0) ?
              <Typography variant="body1">
                Dscto. cupón: <strong style={{ color: '#035D59' }}>- $ {Utils.numberWithCommas(this.state.config.prices.discount.toFixed(2))} M.N.</strong>
                {
                  (this.state.config.coupon !== null && this.state.config.coupon.percentageDiscount > 0) ?
                    <strong> (<span style={{ color: 'red' }}>{this.state.config.coupon.percentageDiscount}%</span>)</strong>
                    :
                    ''
                }
              </Typography>
              :
              ''
          }
          <br />
          <Typography variant="h6">
            Total: <strong style={{ color: '#035D59' }}>$ {Utils.numberWithCommas(this.state.config.prices.total.toFixed(2))} M.N.</strong>
            {
              (this.state.isCredit) ?
                <div style={{ margin: 0, padding: 0, marginTop: -12 }}>
                  <span style={{ fontSize: 12, color: 'red' }}>Precio a crédito con CrediVale ®</span>
                </div>
                :
                ''
            }
          </Typography>
        </Grid>
        <Grid item lg={12} md={12} sm={12} xs={12}>
          {
            (!this.state.createOrderLoading) ?
              <Button className={classes.createOrderButton} variant="contained" onClick={async () => {
                if (this.state.validateCellphone) {
                  this.createOrder()
                } else {
                  this.setState({
                    openValidationSMS: true
                  })
                }

                if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
                  let dateSending = new Date();

                  fbq('track', 'Purchase', {
                    'value': Utils.numberWithCommas(this.state.config.prices.subtotal.toFixed(2)),
                    'currency': 'MXN'
                  }, { eventID: 'Purchase' })

                  if (this.state.user !== null && this.state.user !== undefined) {
                    let eventToFacebook = {
                      "data": [
                        {
                          "event_name": 'Purchase',
                          'event_time': Utils.timeIntoSeconds(dateSending),
                          'user_data': {
                            'fn': await Utils.hashingData(this.state.user.name),
                            'ln': await Utils.hashingData(this.state.user.secondLastName)
                          },
                          'custom_data': {
                            'value': this.state.config.prices.subtotal.toFixed(2),
                            'currency': 'MXN'
                          },
                          'event_id': 'Purchase',
                          'action_source': 'website'
                        }
                      ]
                    }

                    await Utils.sendConversionApiFacebook(eventToFacebook, this.state.uuidCAPIFacebook)
                  }
                }

              }}>
                <label style={{ fontWeight: 600, fontSize: 18 }}>Confirmar compra probando</label>
              </Button>
              :
              <div style={{ textAlign: 'center', width: 100, margin: '0 auto', padding: '16px 0px' }}>
                <Loading />
              </div>
          }
          {
            (this.state.config.bluePoints.win > 0) ?
              <div>
                <div style={{ margin: 0, padding: 4 }}>
                  <strong style={{ color: 'blue' }}>{Utils.numberWithCommas(this.state.config.bluePoints.win)} {this.state.config.bluePoints.win === 1 ? 'punto azul' : 'puntos azules'} genera esta compra.</strong>
                  <br />
                  {
                    (this.state.config.bluePoints.conditions.exchange) ?
                      'Puedes utilizarlos en tu siguiente compra.'
                      :
                      'Activa tu Mondero Azul ® para acumularlos.'
                  }
                </div>
              </div>
              :
              ''
          }
        </Grid>
        {/*
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          {
            (this.state.withGiftCard && this.state.giftCard !== null) ?
            <Grid container style={{ textAlign: 'left', background: 'white', padding: '16px', borderRadius: 6, marginBottom: 8 }} >
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3} style={{ marginRight: 8 }}>
                <img style={{ width: '88%' }} src={this.state.giftCard.data.option.img}></img>
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={6} xs={6}>
                <Typography variant="body1"><strong>¡Tarjeta personalizada!</strong></Typography>
                <Typography variant="body2" style={{ fontSize: 12 }}>De parte de: <strong>{this.state.giftCard.data.from}</strong></Typography>
                <Typography variant="body2" style={{ fontSize: 12 }}>Precio: <strong>GRATIS</strong></Typography>
              </Grid>
              <Grid item xl={2} lg={2} md={2} sm={2} xs={2}>
                <Button variant="outlined" onClick={() => {
                  this.props.deleteGiftCard()
                }} style={{ fontSize: 11, color: 'red' }}>Eliminar</Button>
              </Grid>
            </Grid>
            :
            <Button variant="contained" style={{ backgroundColor: '#FF8282', color: 'white', fontWeight: 800, boder: 'none', width: '100%', margin: 0, marginBottom: 16 }} onClick={(event) => { this.setState({
              openGiftModal: true
            })}}>Agregar tarjeta para mamá ❤️</Button>
          }
        </Grid>
        */}
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          {
            (this.state.user.calzzapatoUserId !== null && this.state.user.bluePoints !== null) ?
              <>
                {
                  (this.state.config.bluePoints.conditions.exchange) ?
                    <TableRow>
                      <TableCell style={{ width: '1%', margin: 0, padding: 4 }}>
                        <img style={{ width: 88 }} src="/monederoazul.svg" />
                      </TableCell>
                      <TableCell style={{ margin: 0, padding: 4 }}>
                        <TextField style={{ marginTop: 12, paddingBottom: 6, width: '100%' }} variant="outlined"
                          disabled={this.state.disabledBluePoints}
                          label="Puntos azules"
                          placeholder="Utilizar..."
                          value={this.state.bluePoints}
                          onChange={this.handleChangeBluePoints}
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
                        (!this.state.config.bluePoints.conditions.exchange) ?
                          <TableRow style={{ textAlign: 'center', paddingTop: 12, paddingBottom: 12 }}>
                            <TableCell></TableCell>
                            <TableCell>
                              {
                                (!Utils.isEmpty(this.state.config.bluePoints.conditions.link)) ?
                                  <Link href={this.state.config.bluePoints.conditions.link}>{this.state.config.bluePoints.conditions.message}</Link>
                                  :
                                  <span>{this.state.config.bluePoints.conditions.message}</span>
                              }
                            </TableCell>
                          </TableRow>
                          :
                          ''
                      }
                    </>
                }
              </>
              :
              <TableRow style={{ textAlign: 'center', paddingTop: 12, paddingBottom: 12 }}>
                <TableCell></TableCell>
                <TableCell>
                  <Link href="https://www.monederoazul.com">Activa tu Monedero Azul ® GRATIS y obtén grandes beneficios.</Link>
                </TableCell>
              </TableRow>
          }
        </Grid>
        <Grid item lg={12} md={12} sm={12} xs={12}>
          <div style={{ textAlign: 'left' }}>
            <strong>¿Quieres descuento?</strong>
            <Typography variant="body1" style={{ fontSize: 12, textAlign: 'left' }}>
              Suscríbete a nuestro newsletter donde obtendrás cupones de descuentos y más.
            </Typography>
          </div>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <TextField
            disabled={(this.state.appliedCoupon) ? true : false}
            variant="outlined"
            style={{ width: '100%', marginTop: 16, marginBottom: 32 }}
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
            }}
          />
        </Grid>
        <Grid item lg={12}>
          <Typography variant="body1" style={{ fontSize: 12, textAlign: 'center' }}>
            Al confirmar tu pedido aceptas los <a href="/terminos">términos y condiciones</a> y las <a href="/privacidad">políticas de privacidad</a> de GRUPO CALZAPATO S.A. DE C.V. y Calzapato.com ®
          </Typography>
        </Grid>

      </Grid>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    dropShoppingCart: () => {
      dispatch(dropShoppingCart())
    },
    selectedSize: (data) => {
      dispatch(selectedSize(data))
    },
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(Checkout)
