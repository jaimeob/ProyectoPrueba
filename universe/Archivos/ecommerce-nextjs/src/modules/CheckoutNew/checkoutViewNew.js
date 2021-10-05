import React, { Component } from 'react'
import { connect } from 'react-redux'
import Router from 'next/router'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import MuiAlert from '@material-ui/lab/Alert';
import { Link, Hidden, Typography, TextField, Button, InputAdornment, TableRow, TableCell, Snackbar } from '@material-ui/core'
import Label from '@material-ui/icons/Label'
import AccountCircle from '@material-ui/icons/AccountCircle'
import LocalOfferIcon from '@material-ui/icons/LocalOffer'


import { openShoppingCart, removeProductFromShoppingCart, updateAllProductFrontShoppingCart, updateShoppingCart } from '../../actions/actionShoppingCart'
import { cleanCheckout, updatePaymentMethod, updateCard, updateAddress, updateBluePoint, updateCoupon } from '../../actions/actionCheckout'

// Utils
import Utils from '../../resources/Utils'
import { requestAPI } from '../../api/CRUD'
import { dropShoppingCart } from '../../actions/actionShoppingCart'

// Components
import Empty from '../../components/Empty'
import Loading from '../../components/Loading'
import messages from '../../resources/Messages.json'
import ShoppingDetail from '../../components/ShoppingDetailNew'
import StepperNew from '../../components/StepperNew'
import AddressRequest from '../../components/AddressRequest'
import ProductCheckout from '../../components/ProductCheckout'
import ModalComponent from '../../components/ModalComponent'
import PaymentCard from '../../components/PaymentCard'
import CardModal from '../../components/CardModal'
import { method } from 'lodash'
import { blue } from '@material-ui/core/colors'

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

const CALZZAPATO_SHIPPING = 1
const CLICK_AND_COLLECT = 2
const ENVIO_EXPRESS = 3

const styles = theme => ({
  address: {
    fontSize: '12px',
    fontWeight: '600',
    marginTop: '20px'
  },
  bluePointsButton: {
    padding: 0,
    height: '100%',
    width: '100%',
    textTransform: 'none',
    fontWeight: 'bold',
    [theme.breakpoints.down("xs")]: {
      padding: 'inherit'
    }
  },
  container: {
    //width: 850,
    width: 1100,
    margin: '0 auto',

    [theme.breakpoints.down("md")]: {
      margin: '0 auto',
      width: 900,
    },
    [theme.breakpoints.down("sm")]: {
      margin: '0 auto',
      width: 'auto',
    },
    [theme.breakpoints.down("xs")]: {
      margin: '0 auto',
      width: 'auto',
    }
  },

  titulo: {
    fontSize: '28px',
    fontWeight: '600'
  },
  inputBluePoints: {

  },
  shoppingSticky: {
    position: 'relative',
    right: '0px',
    width: '100%',
    top: '22px',
    [theme.breakpoints.down("sm")]: {
      // position: 'sticky',
      width: '50%',
      bottom: 0,
      left: 0,
    }
  },
  checkoutContainer: {
    marginBottom: 222,
    width: '90%',
    margin: '0 auto',
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
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
class CheckoutViewNew extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loadingCheckout: false,
      openAddCardModal: false,
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

      stepAddress: true,
      stepPyment: false,
      stepConfirmation: false,

      favoriteAddress: null,
      shippingMethodSelected: [],
      products: [],

      shippingMethod: 1,
      openModal: false,
      addressModal: true,
      modalType: '',
      clickCollectLocations: null,
      clickCollectProductId: null,
      productsRequest: [],
      paymentMethods: null,
      shippingMethodSelected: [],

      checkoutRequest: [],
      checkout: false,
      paymentMethod: null,
      cardSelected: null,
      paymentMethodSelected: null,
      bluePointExchange: ''

    }

    this.handleChangeFileValue = this.handleChangeFileValue.bind(this)
    this.loadData = this.loadData.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.createOrder = this.createOrder.bind(this)
    this.handleChangeCoupon = this.handleChangeCoupon.bind(this)
    this.applyCoupon = this.applyCoupon.bind(this)
    this.removeCoupon = this.removeCoupon.bind(this)
    this.handleChangeFolio = this.handleChangeFolio.bind(this)
    this.handleChangeAmount = this.handleChangeAmount.bind(this)
    this.handleChangeFolioIne = this.handleChangeFolioIne.bind(this)
    this.validateDigitalVale = this.validateDigitalVale.bind(this)
    this.handleChangeQuantity = this.handleChangeQuantity.bind(this)
    this.removeProduct = this.removeProduct.bind(this)
    this.getImageByCardType = this.getImageByCardType.bind(this)
    this.handleChangeBluePoints = this.handleChangeBluePoints.bind(this)
    this.applyBluePoints = this.applyBluePoints.bind(this)
    this.handleChangeOpenpayCard = this.handleChangeOpenpayCard.bind(this)
    this.checkExpressDelivery = this.checkExpressDelivery.bind(this)
    this.getAddress = this.getAddress.bind(this)
    this.handleChangeFavoriteAddress = this.handleChangeFavoriteAddress.bind(this)

    this.handleChangeShippingMethod = this.handleChangeShippingMethod.bind(this)
    this.handleOpenModal = this.handleOpenModal.bind(this)
    this.handleChangeClickCollect = this.handleChangeClickCollect.bind(this)
    this.handleChageStore = this.handleChageStore.bind(this)
    this.confirmStore = this.confirmStore.bind(this)
    this.addInProductRequest = this.addInProductRequest.bind(this)
    this.changeCarrier = this.changeCarrier.bind(this)
    this.nextStep = this.nextStep.bind(this)
    this.updateCart = this.updateCart.bind(this)
    this.handleCloseWithCard = this.handleCloseWithCard.bind(this)
    this.handleChangeCard = this.handleChangeCard.bind(this)
    this.handleChangePaymentMethod = this.handleChangePaymentMethod.bind(this)



  }




  async handleCloseWithCard(card) {
    await this.setState({ openAddCardModal: false, editCard: false, selectedCard: card })
    await this.loadData()
  }

  async updateCart(shippingMethod, idx) {
    if (shippingMethod !== null && shippingMethod !== undefined) {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'PATCH',
        resource: 'carts',
        endpoint: '/update',
        data: {
          product: this.state.products[idx].code,
          size: this.state.products[idx].selection.size,
          article: this.state.products[idx].selection.article,
          shippingMethod: shippingMethod,
          id: idx
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.updated) {
          await this.setState({ checkout: true })
          this.loadData()
        } else {
          this.setState({ loadingCart: false })
        }
      }
    }
  }

  async nextStep() {
    if (this.props.shipping) {
      Router.push('/checkout/pago')
    } else if (this.props.payment) {
      Router.push('/checkout/confirmacion')
    } else if (this.props.confirmation) {
      this.setState({ openModal: true, modalType: 'billing' })
      // Abrir modal para confirmación
    }
  }

  async handleChageStore(branch) {
    // let products = this.state.productsRequest

    // let prodIndex = products.find((prod) => prod.id === this.state.clickCollectProductId)

    // if (products.length > 0 && prodIndex !== -1) {
    //   products[prodIndex] = { id: this.state.clickCollectProductId, shippingMethod: CLICK_AND_COLLECT, branch: branch }
    // } else {
    //   products.push({ id: this.state.clickCollectProductId, shippingMethod: CLICK_AND_COLLECT, branch: branch })
    // }
    // await this.setState({ productsRequest: [...products] })
    // this.loadData()
  }

  async changeCarrier(carrier, id) {
    let productExpressCount = 0
    let products = this.state.products
    let checkoutRequest = this.state.checkoutRequest

    await Utils.asyncForEach(products, async (product, idx) => {

      if (product.shippingMethod !== undefined && product.shippingMethod !== null && product.shippingMethod.id === 3) {
        let shippingMethods = product.shippingMethods
        let expressIndex = shippingMethods.findIndex(element => element.id === 3)
        if (expressIndex !== -1) {
          for (let i = 0; i < shippingMethods[expressIndex].carriers.length; i++) {
            if (shippingMethods[expressIndex].carriers[i].carrier === carrier) {
              shippingMethods[expressIndex].carriers[i].selected = true
              product.shippingMethod = { id: 3, carrier: carrier }
              this.updateCart({ id: 3, carrier: carrier }, idx)
            } else {
              shippingMethods[expressIndex].carriers[i].selected = false
            }
          }
        }
        product.shippingMethods = [...shippingMethods]
      }

    })

    await this.setState({ product: products, checkoutRequest: checkoutRequest })

    // await this.props.updateShoppingCart({
    //   products: products,
    //   priceInformation: {
    //     total: 0,
    //     totalProducts: 0,
    //     shippingMethod: 0,
    //     subtotal: 0,
    //     // total: response.data.paymentInfo.subtotal,
    //     // totalProducts: response.data.paymentInfo.totalProducts,
    //     // shippingMethod: 0,
    //     // subtotal: response.data.paymentInfo.subtotal,
    //   }
    // })

    // this.loadData()


  }

  async confirmStore(branch) {
    let checkoutRequest = this.state.checkoutRequest
    if (checkoutRequest !== null && checkoutRequest !== undefined) {
      let index = checkoutRequest.findIndex((element) => element.id === this.state.clickCollectProductId)
      if (index !== -1) {
        checkoutRequest[index] = { id: this.state.clickCollectProductId, shippingMethod: CLICK_AND_COLLECT, branch: branch }
      } else {
        checkoutRequest.push({ id: this.state.clickCollectProductId, shippingMethod: CLICK_AND_COLLECT, branch: branch })
      }
    } else {
      checkoutRequest = [{ id: this.state.clickCollectProductId, shippingMethod: CLICK_AND_COLLECT, branch: branch }]
    }
    await this.setState({ checkoutRequest: checkoutRequest })
    await this.updateCart({ id: 2, branch: branch }, this.state.clickCollectProductId)
    this.loadData()

  }

  async addInProductRequest(data) {
    let productRequest = await this.state.productRequest
    if (productRequest !== null && productRequest !== undefined && productRequest.length > 0) {
      let index = productRequest.findIndex((element) => element.id === data.id)
      if (index !== -1) {
        console.log('Request 1');
        productRequest[index] = data
      } else {
        console.log('Request 2');
        // productRequest.push(data)
        productRequest.push({ id: 2, shippingMethodId: 2, branch: "124" })
      }
    } else {
      console.log('Request 3');
      productRequest = [data]
    }
    console.log('ProducRequest Final ', productRequest)
    await this.setState({ productRequest: productRequest })
    console.log('State ProducRequest Final ', this.state.productsRequest)
    this.loadData()
  }

  async handleChangeClickCollect(locations, id) {
    this.setState({ clickCollectLocations: locations, clickCollectProductId: id })
  }

  async handleOpenModal(type) {
    await this.setState({ openModal: !this.state.openModal, modalType: 'address' })
  }

  handleChangeBluePoints(input) {
    if (!isNaN(Number(input.target.value))) {
      this.setState({
        bluePointExchange: input.target.value
      })
    }
  }

  async handleChangeShippingMethod(id, productId) {
    let products = this.state.products

    for (let i = 0; i < products[productId].shippingMethods.length; i++) {
      if (products[productId].shippingMethods[i].id === id && products[productId].shippingMethods[i].id !== 2) {
        products[productId].shippingMethods[i].selected = true
      } else {
        products[productId].shippingMethods[i].selected = false
      }
    }
    products[productId].shippingMethod = { id: id }
    await this.setState({ products: products })

    if (id === 2) {
      this.setState({ openModal: true, modalType: 'click-collect' })
    } else if (id === 1) {
      this.updateCart({ id: 1 }, productId)
    } else if (id === 3) {
      let carrierIndex = products[productId].shippingMethods.findIndex(element => element.id === id)
      if (carrierIndex !== -1) {
        if (products[productId].shippingMethods[carrierIndex].carriers[0].name === "Calzzamovil") {
          await this.updateCart({ id: 3 }, productId)
          this.loadData()
        }
      }
    }
  }

  async handleChangeCard(card) {
    let paymentMethods = this.state.paymentMethods
    paymentMethods.cards.forEach(method => {
      if (method.id === card.paymentMethodId) {
        method.selected = true
      } else {
        method.selected = false
      }
    })

    await this.setState({
      cardSelected: card,
      openModal: false,
      paymentMethods: paymentMethods
    })

    await this.props.updateShoppingCart({
      products: this.props.shoppingCart.products,
      paymentMethod: { id: card.paymentMethodId, card: card },
      priceInformation: {
        total: this.props.shoppingCart.priceInformation.total,
        totalProducts: this.props.shoppingCart.products.length,
        subtotal: this.props.shoppingCart.priceInformation.total,
      }
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
        // if (amount >= this.state.config.prices.total) {
        message = response.data.message
        if (response.data.message.substr(response.data.message.length - 15, response.data.message.length) === 'SI son válidos.') {
          digitalVale = {
            status: true,
            folio: this.state.folio.trim(),
            amount: this.state.amount.trim()
          }
        }
        // }
        // else {
        //   message = 'El monto del CrediVale ® es menor al monto total de la compra.'
        // }
      }

      this.setState({
        digitalVale: digitalVale,
        openSnack: true,
        messageSnack: message
      })
    }
  }

  async handleChangePaymentMethod(option, type) {
    await this.setState({ cardSelected: null })

    let paymentMethods = this.state.paymentMethods
    paymentMethods[type].forEach(method => {
      if (method.id === option.id) {
        method.selected = true
      } else {
        method.selected = false
      }
    })

    // if (type === 'cards' && (option.id === 5 || option.id === 9)) {
    //   paymentMethods.cards.forEach(method => {
    //     method.selected = false
    //   })
    // }

    if (type !== 'credit') {
      paymentMethods.credit.forEach(method => {
        if (method.id !== option.id) {
          method.selected = false
        }
      })
    }
    if (type !== 'cards') {
      paymentMethods.cards.forEach(method => {
        if (method.id !== option.id) {
          method.selected = false
        }
      })
    }

    if (type !== 'money') {
      paymentMethods.money.forEach(method => {
        if (method.id !== option.id) {
          method.selected = false
        }
      })
    }

    await this.setState({
      paymentMethods: paymentMethods
    })

    if (type === 'cards' && (option.id === 5 || option.id === 9)) {
      await this.setState({
        openModal: true,
        modalType: 'cards',
        paymentMethod: option
      })
    }
    if (option.id === PAYPAL || option.id === BBVA_PAY || option.id === OXXO_PAY || option.id === PAYNET) {
      // Guardar
      await this.props.updateShoppingCart({
        products: this.props.shoppingCart.products,
        paymentMethod: { id: option.id },
        priceInformation: {
          total: this.props.shoppingCart.priceInformation.total,
          totalProducts: this.props.shoppingCart.products.length,
          subtotal: this.props.shoppingCart.priceInformation.total,
        }
      })
    }

    // config.paymentMethods.forEach(function (method, idx) {
    //   method.checked = false
    //   if (method.id === option.id) {
    //     method.checked = true
    //     paymentMethodSelected = method
    //   }
    //   methods.push(method)
    // })

    // let openSnack = false
    // let messageSnack = ''
    // if (paymentMethodSelected.id === OXXO_PAY && this.state.config.prices.total > 10000) {
    //   openSnack = true
    //   messageSnack = 'Método de pago no válido para compras mayores a 10,000.00 M.N. Selecciona otro método de pago, por favor.'
    // }
    // this.props.updatePaymentMethod({
    //   paymentMethod: paymentMethodSelected,
    // })
    // this.setState({
    //   openSnack: openSnack,
    //   messageSnack: messageSnack,
    //   paymentMethodSelected: paymentMethodSelected,
    //   config: config
    // }, () => {
    //   let isCredit = false
    //   if (paymentMethodSelected.id === CREDIVALE_PAY) {
    //     isCredit = true
    //   }
    //   this.loadData()
    // })
  }

  async applyCoupon() {
    const self = this
    this.setState({ appliedCoupon: true }, () => {
      this.loadData()
    })
    // if (!Utils.isEmpty(this.props.checkout.couponValue)) {
    //   this.setState({
    //     appliedCoupon: true
    //   }, () => {
    //     self.loadData()
    //   })
    // } else {
    //   self.loadData()
    // }
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

  async handleChangeCoupon(input) {
    await this.setState({
      coupon: input.target.value.toUpperCase()
    })
  }

  async handleChangeFavoriteAddress(id) {
    let addresses = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/addresses'
    })
    if (addresses !== null && addresses !== undefined && addresses.data !== null && addresses.data !== undefined && addresses.data.length > 0) {
      addresses.data.forEach(address => {
        if (address.favorite) {
          this.setState({
            selectedAddress: address,
            favoriteAddress: address
          })
        }
      })
    }
  }

  async componentWillMount() {
    const self = this
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      this.setState({
        user: user,
        validateCellphone: user.validationCellphone
      }, () => {
        if (this.props.checkout.address === null || this.props.checkout.address === undefined) {
          // Router.push(Utils.constants.paths.checkoutDireccions)
        }
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

    // Redux to state checkout data
    await this.setState({
      selectedAddress: this.props.checkout.address,
      paymentMethodSelected: this.props.checkout.paymentMethod
    })

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

        selectedCard = this.props.checkout.card


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


  // async loadData() {
  //   this.setState({ loadingCheckout: true })
  //   let bluePoints = null
  //   let isCredit = false
  //   let step = null 

  //   if (this.props.shipping) {
  //     step = 'shipping'
  //   } else if (this.props.payment) {
  //     step = 'payment'
  //   } else if (this.props.confirmation) {
  //     step = 'confirmation'
  //   }

  //   console.log(this.props)

  //   let response = await requestAPI({
  //     host: Utils.constants.CONFIG_ENV.HOST,
  //     method: 'POST',
  //     resource: 'orders',
  //     endpoint: '/checkout/detail',
  //     data: {
  //       isCredit: isCredit,
  //       coupon: (this.props.checkout.couponValue !== null) ? this.props.checkout.couponValue : '',
  //       bluePoints: Number(bluePoints),
  //       step: step,
  //       checkout: this.state.checkout,
  //       paymentMethod: (this.props.shoppingCart !== null && this.props.shoppingCart !== undefined && this.props.shoppingCart.paymentMethod !== null && this.props.shoppingCart.paymentMethod !== undefined) ? this.props.shoppingCart.paymentMethod.paymentMethod : null
  //     },
  //     headers: {
  //       zip: Utils.getDeliveryAddress().zip
  //     }
  //   })

  //   if (response.status === Utils.constants.status.SUCCESS && response.data.products.length > 0) {
  //     let paymentMethodSelected = null

  //     // CARGADATA
  //     await this.setState({
  //       products: response.data.products,
  //       favoriteAddress: response.data.favoriteAddress,
  //       paymentMethods: response.data.paymentMethods,
  //       loadingCheckout: false
  //     })

  //     await this.props.updateShoppingCart({
  //       products: response.data.products,
  //       paymentMethod: response.data.paymentInfo.paymentMethod,
  //       priceInformation: {
  //         total: response.data.paymentInfo.subtotal,
  //         totalProducts: response.data.paymentInfo.totalProducts,
  //         subtotal: response.data.paymentInfo.subtotal,
  //         bluePoints: response.data.paymentInfo.bluePoints,
  //         paymentMethod: this.props.shoppingCart.paymentMethod
  //       }
  //     })
  //   }
  // }



  async loadData() {
    this.setState({
      loadingCheckout: true
    })
    //this.props.cleanCheckout({})
    let isCredit = false
    let bluePoints = 0


    if (this.props.shipping) {
      isCredit = (this.state.paymentMethodSelected !== null && this.state.paymentMethodSelected.id === CREDIVALE_PAY)
      if (Router.query.pago !== undefined && Router.query.pago === 'credivale') {
        isCredit = true
      }

      // if ((this.state.disabledBluePoints && !isNaN(this.state.bluePoints) || this.props.checkout !== undefined && this.props.checkout !== null && this.props.checkout.bluePointExchange !== null && this.props.checkout.bluePointExchange !== undefined)) {
      //   bluePoints = this.state.bluePoints.conditions.points
      // }

      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'orders',
        endpoint: '/checkout/detail',
        // endpoint: '/checkout',
        data: {
          isCredit: isCredit,
          coupon: (this.props.checkout.couponValue !== null) ? this.props.checkout.couponValue : '',
          bluePoints: Number(bluePoints),
          step: 'shipping',
          checkout: this.state.checkout,
          paymentMethod: (this.props.shoppingCart !== null && this.props.shoppingCart !== undefined && this.props.shoppingCart.paymentMethod !== null && this.props.shoppingCart.paymentMethod !== undefined) ? this.props.shoppingCart.paymentMethod.paymentMethod : null
        },
        headers: {
          zip: Utils.getDeliveryAddress().zip
        }
      })

      this.setState({
        loadingCheckout: false,
        checkout: false
      })

      if (response.status === Utils.constants.status.SUCCESS && response.data.products.length > 0) {
        let paymentMethodSelected = null

        // CARGADATA
        await this.setState({
          products: response.data.products,
          favoriteAddress: response.data.favoriteAddress,
          paymentMethod: response.data.paymentMethod
        })

        await this.props.updateShoppingCart({
          products: response.data.products,
          priceInformation: {
            total: response.data.paymentInfo.subtotal,
            totalProducts: response.data.paymentInfo.totalProducts,
            subtotal: response.data.paymentInfo.subtotal,
          }
        })


        this.setState({
          isCredit: isCredit,
          paymentMethodSelected: paymentMethodSelected,
          config: response.data,
          // openSnack: snackBar.status,
          // messageSnack: snackBar.message,
        }, () => {
          let items = []
          let contentIds = []

          let totalPrice = 0.0
          this.state.config.products.forEach((product) => {
            totalPrice += product.price
          })

        })
      } else {
        // Router.push('/')
      }

    } else {

      if (this.state.bluePointExchange !== null && this.state.bluePointExchange !== undefined ) {
        bluePoints = this.state.bluePointExchange
      } else {
        bluePoints = 0
      }
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'orders',
        endpoint: '/checkout/detail',
        data: {
          isCredit: false,
          // coupon: (this.props.checkout.couponValue !== null) ? this.props.checkout.couponValue : '',
          coupon: this.state.coupon,
          bluePoints: bluePoints,
          step: 'confirmation',
          checkout: this.state.checkout,
          // paymentMethod: (this.props.shoppingCart !== null && this.props.shoppingCart !== undefined && this.props.shoppingCart.paymentMethod !== null && this.props.shoppingCart.paymentMethod !== undefined)? this.props.shoppingCart.paymentMethod.paymentMethod : null
          paymentMethod: this.props.shoppingCart.paymentMethod
        },
        headers: {
          zip: Utils.getDeliveryAddress().zip
        }
      })


      if (response.status === Utils.constants.status.SUCCESS) {
        // await this.setState({ paymentMethods: response.data.paymentMethods })
        await this.setState({
          products: response.data.products,
          favoriteAddress: response.data.favoriteAddress,
          paymentMethods: response.data.paymentMethods,
          bluePoints: response.data.paymentInfo.bluePoints,
          loadingCheckout: false
        })


        await this.props.updateShoppingCart({
          products: response.data.products,
          paymentMethod: response.data.paymentInfo.paymentMethod,
          priceInformation: {
            total: response.data.paymentInfo.total,
            shippingCost: response.data.paymentInfo.shippingCost,
            totalProducts: response.data.paymentInfo.totalProducts,
            subtotal: response.data.paymentInfo.subtotal,
            bluePoints: response.data.paymentInfo.bluePoints

          }
        })
      }

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


    if (this.state.location !== null && this.state.location !== undefined && this.state.location.isLocal && selectedAddress !== null && selectedAddress.municipality.toLowerCase() === 'culiacán' && this.state.paymentMethodSelected !== CREDIVALE_PAY) {
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

  async applyBluePoints(flag) {
    const self = this

    if (flag || typeof flag === 'string') {
      if (typeof flag === 'string') {
        await this.setState({ bluePoints: flag })
      }
      if (Utils.isEmpty(this.state.bluePointExchange) || isNaN(Number(this.state.bluePointExchange)) || Number(this.state.bluePointExchange <= 0)) {
        this.setState({
          openSnack: true,
          messageSnack: 'Ingresa una cantidad válida.'
        })
        return
      }
      if (Number(this.state.bluePointExchange) > this.state.user.bluePoints.balance) {
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
      await this.props.updateBluePoint({
        bluePoints: 0,
      })
      this.setState({
        bluePoints: '',
        bluePointExchange: '',
        disabledBluePoints: false
      }, () => {
        self.loadData()
      })
    }
  }

  async getAddress() {
    const self = this
    let addresses = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/addresses'
    })

    let favorite = []
    if (addresses.status === Utils.constants.status.SUCCESS) {
      let checkbox = []
      if (addresses.data.length > 0) {
        addresses.data.forEach((address) => {
          checkbox.push({ check: false })
          if (address.favorite)
            favorite.push(address)
        })
      }

      this.setState({
        addresses: addresses.data,
        loadedAddress: true,
        checkbox: checkbox
      })

      if (favorite.length > 0) {
        for (let i = 0; i < this.state.addresses.length; i++) {
          if (this.state.addresses[i].id === favorite[0].id) {
            let checkbox = this.state.checkbox
            checkbox[i].check = true
            this.setState({
              selectedAddress: this.state.addresses[i],
              checkbox: checkbox,
              favoriteAddress: this.state.addresses[i].street + ', ' + this.state.addresses[i].exteriorNumber + ', Colonia ' + this.state.addresses[i].location + ', ' + this.state.addresses[i].zip + ', ' + this.state.addresses[i].municipality + ', ' + this.state.addresses[i].state + '. ' + this.state.addresses[i].name + ' - ' + this.state.addresses[i].phone
            })
            this.state.addresses[i].favoriteAddress = this.state.addresses[i].street + ', ' + this.state.addresses[i].exteriorNumber + ', Colonia ' + this.state.addresses[i].location + ', ' + this.state.addresses[i].zip + ', ' + this.state.addresses[i].municipality + ', ' + this.state.addresses[i].state + '. ' + this.state.addresses[i].name + ' - ' + this.state.addresses[i].phone

            this.props.updateAddress({
              address: this.state.addresses[i],
            })
          }
        }
      } else {
        this.setState({
          expandAddresses: true,
          expandAddressButtonDisabled: true,
        })
      }
    } else {
      this.setState({
        addresses: [],
        loadedAddress: true,
        checkbox: []
      })
    }
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        {
          (this.state.config !== null && this.state.loadingCheckout === false) ?
          // (true) ?
            <Grid container className={classes.container} spacing={3} >
              <Grid item xs={12}>
                <Typography variant='body2' className={classes.titulo} >Checkout</Typography>
              </Grid>

              <Grid item md={8} xs={12} >
                <Grid container>
                  <Grid item sm={12} xs={12}>
                    {
                      (this.props.shipping) ?
                        <StepperNew steps={[{ name: 'Entrega', status: true }, { name: 'Pago', status: false }, { name: 'Confirmación', status: false }]} ></StepperNew>
                        :
                        (this.props.payment) ?
                          <StepperNew steps={[{ name: 'Entrega', status: true }, { name: 'Pago', status: true }, { name: 'Confirmación', status: false }]} ></StepperNew>
                          :
                          (this.props.confirmation) ?
                            <StepperNew steps={[{ name: 'Entrega', status: true }, { name: 'Pago', status: true }, { name: 'Confirmación', status: true }]} ></StepperNew>
                            :
                            ''
                    }
                  </Grid>
                  {
                    (this.props.shipping && this.state.products.length > 0 && !this.state.loadingCheckout) ?
                      <Grid item sm={12} xs={12}>
                        <Typography variant='body2' className={classes.address}>Seleccione el domicilio de entrega</Typography>
                      </Grid>
                      :
                      ''
                  }
                  {
                    (this.props.shipping) ?
                      <Grid item xs={12}>
                        {
                          (this.state.products.length > 0 && !this.state.loadingCheckout) ? <Grid container>
                            <Grid item sm={12} xs={12} style={{ marginTop: '20px', height: '100%' }} >
                              <AddressRequest
                                handleOpenModal={() => { this.handleOpenModal() }}
                                address={this.state.favoriteAddress}
                                loading={this.state.loadingCheckout}
                              ></AddressRequest>
                            </Grid>
                            <Grid item sm={12} xs={12}  >
                              <Typography variant='body2' className={classes.address}>Seleccione el tipo de entrega</Typography>
                            </Grid>
                            {
                              (this.state.products.length > 0 && !this.state.loadingCheckout) ?
                                <Grid item sm={12} xs={12} style={{ marginTop: '20px' }}>
                                  <Grid container  >
                                    <Grid item xs={12} >
                                      {
                                        this.state.products.map((product, idx) => {
                                          return (<div>
                                            <ProductCheckout
                                              number={idx}
                                              loadData={() => { this.loadData() }}
                                              loading={() => { this.setState({ loadingCart: true }) }}
                                              removeProductFromCart={(data) => { this.removeProductFromCart(data) }}
                                              article={product.selection.article}
                                              code={product.selection.code}
                                              image={Utils.constants.HOST_CDN_AWS + '/normal/' + product.photos[0].description}
                                              name={product.name}
                                              store={(product.shippingMethod !== null && product.shippingMethod !== undefined) ? product.shippingMethod.store : ''}
                                              addressStore={(product.shippingMethod !== null && product.shippingMethod !== undefined) ? product.shippingMethod.addressStore : ''}
                                              quantity={Number(product.selection.quantity)}
                                              size={Number(product.selection.size)}
                                              shippingMethod={(product.shippingMethod !== null && product.shippingMethod !== undefined) ? product.shippingMethod.id : 0}
                                              shippingMethods={product.shippingMethods}
                                              handleChangeShippingMethod={(index) => { this.handleChangeShippingMethod(index, idx) }}
                                              openClickAndCollectModal={() => { this.setState({ openModal: true, modalType: 'click-collect' }) }}
                                              handleChangeClickCollect={(locations) => { this.handleChangeClickCollect(locations, idx) }}
                                              shippingDay={product.location[0].description}
                                              shippingDayColor={product.location[0].color}
                                              changeCarrier={(carrier) => { this.changeCarrier(carrier, idx) }}
                                            />
                                          </div>)

                                        })
                                      }
                                    </Grid>

                                  </Grid>
                                </Grid>
                                :
                                <Grid item sm={12} xs={12} style={{ marginTop: '20px' }}>
                                  <Loading />
                                </Grid>
                            }
                          </Grid>
                            :
                            <Grid container >
                              <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }} >
                                <Loading></Loading>
                              </Grid>

                            </Grid>
                        }
                      </Grid>
                      :
                      (this.props.payment) ?
                        <Grid item xs={12}>
                          {
                            (this.state.paymentMethods !== null && this.state.paymentMethods !== undefined) ?
                              <Grid container>
                                <Grid item sm={12} xs={12} style={{ marginBottom: '10px' }} >
                                  <Typography variant='body2' className={classes.address}>Pagos con tarjeta de crédito o débito.</Typography>
                                </Grid>
                                <Grid item sm={12} xs={12}>
                                  {
                                    (this.state.paymentMethods !== null && this.state.paymentMethods !== undefined && this.state.paymentMethods.cards !== undefined && this.state.paymentMethods.cards !== null && this.state.paymentMethods.cards.length > 0) ?
                                      this.state.paymentMethods.cards.map((method, idx) => {
                                        return (
                                          // <PaymentCard data={method} openCardModal={()=>{ this.setState({ openModal: true, paymentMethod: method, modalType: 'cards' }) }} />
                                          <PaymentCard handleChangePaymentMethod={() => { this.handleChangePaymentMethod(method, 'cards') }} cardSelected={this.state.cardSelected} openCardList={() => { this.setState({ openModal: true, paymentMethod: method, modalType: 'cards' }) }} data={method} openCardModal={() => { this.setState({ openAddCardModal: true, paymentMethod: method, modalType: 'cards' }) }} />
                                        )
                                      })
                                      :
                                      ''
                                  }
                                  <CardModal card={this.state.card} editCard={this.state.editCard} handleCloseWithCard={(card) => { this.handleCloseWithCard(card) }} handleClose={() => { this.setState({ openAddCardModal: false, editCard: false }) }} open={this.state.openAddCardModal} ></CardModal>
                                </Grid>


                                <Grid item sm={12} xs={12} style={{ marginBottom: '10px' }} >
                                  <Typography variant='body2' className={classes.address}>Pagos a crédito</Typography>
                                </Grid>
                                <Grid item sm={12} xs={12}>
                                  {
                                    (this.state.paymentMethods !== null && this.state.paymentMethods !== undefined && this.state.paymentMethods.credit !== undefined && this.state.paymentMethods.credit !== null && this.state.paymentMethods.credit.length > 0) ?
                                      this.state.paymentMethods.credit.map((method, idx) => {

                                        return (
                                          <PaymentCard
                                            handleChangePaymentMethod={() => { this.handleChangePaymentMethod(method, 'credit') }}
                                            data={method} type={'credit'}
                                            digitalVale={this.state.digitalVale}
                                            validateDigitalVale={() => { this.validateDigitalVale() }}
                                            amount={this.state.amount}
                                            folio={this.state.folio}
                                            handleChangeAmount={(amount) => { this.setState({ amount: amount }) }}
                                            handleChangeFolio={(folio) => { this.setState({ folio: folio }) }}
                                            handleChangeFolioIne={(folioIne) => { this.setState({ folioIne: folioIne }) }}

                                          />
                                        )
                                      })
                                      :
                                      ''
                                  }
                                </Grid>

                                <Grid item sm={12} xs={12} style={{ marginBottom: '10px' }} >
                                  <Typography variant='body2' className={classes.address}>Pagos en efectivo.</Typography>
                                </Grid>
                                <Grid item sm={12} xs={12}>
                                  {
                                    (this.state.paymentMethods !== null && this.state.paymentMethods !== undefined && this.state.paymentMethods.money !== undefined && this.state.paymentMethods.money !== null && this.state.paymentMethods.money.length > 0) ?
                                      this.state.paymentMethods.money.map((method, idx) => {
                                        return (
                                          <PaymentCard handleChangePaymentMethod={() => { this.handleChangePaymentMethod(method, 'money') }} data={method} type={'money'} />
                                        )
                                      })
                                      :
                                      ''
                                  }
                                </Grid>
                              </Grid>
                              :
                              <Grid item xs={12} style={{ height: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                                <Loading></Loading>
                              </Grid>
                          }
                        </Grid>
                        :
                        (this.props.confirmation) ?
                          <Grid item xs={12}>
                            {
                              (!this.state.loadingCheckout) ?
                                <Grid container>
                                  <Grid item sm={12} xs={12} style={{ marginBottom: '10px' }} >
                                    <Typography variant='body2' className={classes.address}>Detalle de pago</Typography>
                                  </Grid>
                                  <Grid item sm={12} xs={12}>
                                    {
                                      (this.state.paymentMethods !== null && this.state.paymentMethods !== undefined && this.state.paymentMethods.length > 0) ?
                                        <PaymentCard
                                          handleChangePaymentMethod={() => { this.handleChangePaymentMethod(method, 'cards') }}
                                          cardSelected={(this.state.paymentMethods[0].id === 5 || this.state.paymentMethods[0].id === 9) ? this.state.paymentMethods[0].cards[0] : null}
                                          openCardList={() => { this.setState({ openModal: true, paymentMethod: '', modalType: 'cards' }) }}
                                          data={this.state.paymentMethods[0]}
                                          openCardModal={() => { this.setState({ openAddCardModal: true, paymentMethod: method, modalType: 'cards' }) }}
                                          confirmation={true}
                                        />
                                        :
                                        ''
                                    }
                                    {/* <CardModal card={this.state.card} editCard={this.state.editCard} handleCloseWithCard={(card) => { this.handleCloseWithCard(card) }} handleClose={() => { this.setState({ openAddCardModal: false, editCard: false }) }} open={this.state.openAddCardModal} ></CardModal> */}
                                  </Grid>

                                  <Grid item sm={12} xs={12} style={{ marginBottom: '5px' }} >
                                    <Typography variant='body2' className={classes.address}>¿ Deseas agregar un cupón ?</Typography>
                                  </Grid>
                                  <Grid item sm={12} xs={12}>
                                    <Grid container style={{ background: 'white', paddingBottom: '12px', paddingTop: '12px', paddingLeft: '10px', borderRadius: '3px', boxShadow: '0 2px 2px 0.1px rgba(180, 180, 180, 0.5)', marginTop: '10px' }} spacing={2} >
                                      <Grid item sm={9} xs={12}>
                                        <TextField
                                          value={this.state.coupon}
                                          variant='outlined'
                                          size='small'
                                          onChange={this.handleChangeCoupon}
                                          fullWidth
                                          disabled={this.state.appliedCoupon}
                                          placeholder='Agregar cupón de descuento...'
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              this.applyCoupon()
                                            }
                                          }}
                                          InputProps={{
                                            startAdornment: (
                                              <InputAdornment position="start">
                                                <LocalOfferIcon fontSize='small' />
                                              </InputAdornment>
                                            ),
                                          }}

                                        ></TextField>
                                      </Grid>
                                      <Grid item sm={3} xs={12}>
                                        <Button
                                          onClick={(!this.state.appliedCoupon) ? () => { this.applyCoupon() } : () => { this.removeCoupon() }}
                                          fullWidth
                                          className={classes.bluePointsButton}
                                          variant={(this.state.appliedCoupon) ? 'outlined' : 'contained'}
                                          color="primary"
                                        >
                                          {
                                            (this.state.appliedCoupon) ?
                                              'Quitar cupón'
                                              :
                                              'Agregar cupón'
                                          }
                                        </Button>
                                      </Grid>
                                    </Grid>
                                  </Grid>

                                  <Grid item sm={12} xs={12} style={{ marginBottom: '5px' }} >
                                    <Typography variant='body2' className={classes.address}>Monedero Azul</Typography>
                                  </Grid>
                                  <Grid item sm={12} xs={12}>
                                    <Grid container style={{ background: 'white', paddingBottom: '12px', paddingTop: '12px', paddingLeft: '10px', borderRadius: '3px', boxShadow: '0 2px 2px 0.1px rgba(180, 180, 180, 0.5)', marginTop: '10px' }} spacing={2} >

                                      <Hidden mdUp>
                                        <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} item sm={2} xs={2}>
                                          <img style={{ width: '100%' }} src={'/monederoazul.svg'} ></img>
                                        </Grid>                                    
                                      </Hidden>

                                      <Grid item sm={12} xs={10} style={{ display: 'flex', alignItems:'center' }} >
                                        {
                                          (this.state.bluePoints !== null && this.state.bluePoints !== undefined && this.state.bluePoints.conditions !== undefined && this.state.bluePoints.conditions !== null) ?
                                            <Typography style={{ fontSize: '12px' }} variant='body2'>Actualmente cuentas con <span style={{ fontWeight: '600' }}>${this.state.user.bluePoints.balance} </span> en tu <span style={{ fontWeight: '600' }}> Monedero azul.</span> </Typography>
                                            :
                                            ''
                                        }
                                      </Grid>

                                      <Hidden smDown>
                                        <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} item sm={2} xs={12}>
                                          <img style={{ width: '80%' }} src={'/monederoazul.svg'} ></img>
                                        </Grid>
                                      </Hidden>

                                      <Grid item sm={7} xs={12}>
                                        <TextField
                                          className={classes.inputBluePoints}
                                          type='number'
                                          variant='outlined'
                                          size='small'
                                          disabled={this.state.disabledBluePoints}
                                          fullWidth
                                          onChange={this.handleChangeBluePoints}
                                          value={(this.state.bluePointExchange !== null && this.state.bluePointExchange !== undefined)? this.state.bluePointExchange : ''}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              this.applyBluePoints(true)
                                            }
                                          }}
                                          placeholder='Agregar descuento desde monedero azul…'
                                        ></TextField>
                                      </Grid>
                                      <Grid item sm={3} xs={12}>
                                        <Button
                                          fullWidth
                                          className={classes.bluePointsButton}
                                          variant={(this.state.disabledBluePoints) ? 'outlined' : 'contained'}
                                          onClick={(this.state.disabledBluePoints) ? () => { this.applyBluePoints(false) } : () => { this.applyBluePoints(true) }}
                                          color="primary" >
                                          {
                                            (this.state.disabledBluePoints) ?
                                              'Quitar'
                                              :
                                              'Agregar'
                                          }
                                        </Button>
                                      </Grid>
                                    </Grid>
                                  </Grid>

                                  <Grid item sm={12} xs={12}  >
                                    <Typography variant='body2' className={classes.address}>Productos</Typography>
                                  </Grid>
                                  {
                                    (this.state.products.length > 0 && !this.state.loadingCheckout) ?
                                      <Grid item sm={12} xs={12}>
                                        <Grid container style={{ marginBottom: '100px' }} >
                                          <Grid item xs={12} style={{ marginBottom: '100px' }}>
                                            {
                                              this.state.products.map((product, idx) => {
                                                return (<div>
                                                  <ProductCheckout
                                                    number={idx}
                                                    loadData={() => { this.loadData() }}
                                                    loading={() => { this.setState({ loadingCart: true }) }}
                                                    removeProductFromCart={(data) => { this.removeProductFromCart(data) }}
                                                    article={product.selection.article}
                                                    code={product.selection.code}
                                                    image={Utils.constants.HOST_CDN_AWS + '/normal/' + product.photos[0].description}
                                                    name={product.name}
                                                    store={(product.shippingMethod !== null && product.shippingMethod !== undefined) ? product.shippingMethod.store : ''}
                                                    storeAddress={(product.shippingMethod !== null && product.shippingMethod !== undefined) ? product.shippingMethod.storeAddress : ''}
                                                    quantity={Number(product.selection.quantity)}
                                                    size={Number(product.selection.size)}
                                                    shippingMethod={(product.shippingMethod !== null && product.shippingMethod !== undefined) ? product.shippingMethod.id : 0}
                                                    shippingMethods={product.shippingMethods}
                                                    handleChangeShippingMethod={(index) => { this.handleChangeShippingMethod(index, idx) }}
                                                    openClickAndCollectModal={() => { this.setState({ openModal: true, modalType: 'click-collect' }) }}
                                                    handleChangeClickCollect={(locations) => { this.handleChangeClickCollect(locations, idx) }}
                                                    shippingDay={product.location[0].description}
                                                    changeCarrier={(carrier) => { this.changeCarrier(carrier, idx) }}
                                                  />
                                                </div>)

                                              })
                                            }
                                          </Grid>

                                        </Grid>
                                      </Grid>
                                      :
                                      <Grid item sm={12} xs={12} style={{ marginTop: '20px' }}>
                                        <Loading />
                                      </Grid>
                                  }

                                </Grid>

                                :
                                <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', height: '50vh', justifyContent: 'center' }} >
                                  <Loading></Loading>
                                </Grid>
                            }
                          </Grid>
                          :
                          ''
                  }
                </Grid>
              </Grid>

              <Grid item md={4} sm={12} xs={12} className={classes.shoppingSticky} >
                <div style={{ marginTop: '30px' }} >
                  <ShoppingDetail
                    data={this.state.priceInformation}
                    //action={(this.props.shipping) ? () => { Router.push('/checkout/pago') } : () => { Router.push('/checkout/confirmacion') }}
                    action={() => { this.nextStep() }}
                    confirmation={this.props.confirmation}
                    loading={this.state.loadingCheckout}
                  />
                  {
                    (this.props.confirmation) ?
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography style={{ fontSize: '10px', marginTop: '10px' }} variant='body2'>
                            Al confirmar tu pedido aceptas los términos y condiciones y las políticas de privacidad de GRUPO CALZAPATO S.A. DE C.V. y Calzapato.com ® Compra 100% segura con cifrado de información. Revisa tu pedido y asegúrate de que todos tus datos esten correctos. No se te cobrará nada hasta que confirmes tu compra.
                      </Typography>
                        </Grid>
                      </Grid>

                      :
                      ''
                  }
                </div>
              </Grid>

              <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={() => { this.setState({ openSnack: false }) }} open={this.state.openSnack} autoHideDuration={6000} >

                {/* <Alert  severity="success" onClose={()=> { this.setState({ openSnack: false })}} >
                  This is a success message!
                </Alert> */}
                <Alert severity="warning" onClose={() => { this.setState({ openSnack: false }) }} >{this.state.messageSnack}  </Alert>
              </Snackbar>

              <ModalComponent
                open={this.state.openModal}
                handleClose={() => { this.setState({ openModal: !this.state.openModal }) }}
                handleChangeFavoriteAddress={(id) => { this.handleChangeFavoriteAddress(id) }}
                type={this.state.modalType}
                locations={this.state.clickCollectLocations}
                handleChageStore={(branch) => { this.handleChageStore(branch) }}
                confirmStore={(branch) => { this.confirmStore(branch) }}
                loadData={() => { this.loadData() }}
                paymentMethod={this.state.paymentMethod}
                newCard={() => { this.setState({ openModal: false, openAddCardModal: true }) }}
                editCard={(card) => { this.setState({ openModal: false, openAddCardModal: true, editCard: true, card: card }) }}
                handleSelectedCard={(card) => { this.handleChangeCard(card) }}

              ></ModalComponent>

            </Grid>
            :
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
              <Loading />
            </div>
        }

      </div >
    )
  }































  
  // renderConfirmOrder() {
  //   let { classes } = this.props
  //   return (
  //     <Grid container>
  //       <Grid item lg={3} md={3} sm={12} xs={12}></Grid>
  //       <Grid item lg={6} md={6} sm={12} xs={12} style={{ textAlign: 'center' }}>
  //         <Typography variant="body1">
  //           Total de productos: <strong>{Utils.numberWithCommas(this.state.config.cart.totalProducts)}</strong>
  //         </Typography>
  //         <Typography variant="body1">
  //           Sutotal: <strong>$ {Utils.numberWithCommas(this.state.config.prices.subtotal.toFixed(2))} M.N.</strong>
  //         </Typography>
  //         <br />
  //         <Typography variant="body1">
  //           Envío: <strong>{this.state.config.shippingMethod.name}
  //             {
  //               (this.state.config.shippingMethod.cost > 0) ?
  //                 <span> (${Utils.numberWithCommas(this.state.config.shippingMethod.cost.toFixed(2))} M.N.)</span>
  //                 :
  //                 ''
  //             }
  //           </strong>
  //         </Typography>
  //         <Typography variant="body2">
  //           <span style={{ fontSize: 11 }}>{this.state.config.shippingMethod.description}</span>
  //         </Typography>
  //         {
  //           (this.state.config.prices.recharge !== 0) ?
  //             <>
  //               <br />
  //               <Typography variant="body1">
  //                 Recarga Telcel: <strong>$ {Utils.numberWithCommas(this.state.config.prices.recharge.toFixed(2))} M.N.</strong>
  //               </Typography>
  //               <span style={{ fontSize: 11 }}>$50.00 por equipo.</span>
  //             </>
  //             :
  //             ''
  //         }
  //         <br />
  //         {
  //           (this.state.saved) ?
  //             <Typography variant="body1">
  //               Total ahorrado: <strong style={{ color: '#035D59' }}>${Utils.numberWithCommas(this.state.config.prices.saved.toFixed(2))} M.N.</strong>
  //             </Typography>
  //             :
  //             ''
  //         }
  //         {
  //           (Number(this.state.bluePoints) > 0 && this.state.disabledBluePoints) ?
  //             <Typography variant="body1">
  //               Puntos: <strong style={{ color: 'red', textDecoration: 'line-through' }}>- $ {Utils.numberWithCommas(Number(this.state.bluePoints).toFixed(2))} M.N.</strong>
  //             </Typography>
  //             :
  //             ''
  //         }
  //         {
  //           (this.state.config.prices.discount > 0) ?
  //             <Typography variant="body1">
  //               Dscto. cupón: <strong style={{ color: '#035D59' }}>- $ {Utils.numberWithCommas(this.state.config.prices.discount.toFixed(2))} M.N.</strong>
  //               {
  //                 (this.state.config.coupon !== null && this.state.config.coupon.percentageDiscount > 0) ?
  //                   <strong> (<span style={{ color: 'red' }}>{this.state.config.coupon.percentageDiscount}%</span>)</strong>
  //                   :
  //                   ''
  //               }
  //             </Typography>
  //             :
  //             ''
  //         }
  //         <br />
  //         <Typography variant="h6">
  //           Total: <strong style={{ color: '#035D59' }}>$ {Utils.numberWithCommas(this.state.config.prices.total.toFixed(2))} M.N.</strong>
  //           {
  //             (this.state.isCredit) ?
  //               <div style={{ margin: 0, padding: 0, marginTop: -12 }}>
  //                 <span style={{ fontSize: 12, color: 'red' }}>Precio a crédito con CrediVale ®</span>
  //               </div>
  //               :
  //               ''
  //           }
  //         </Typography>
  //       </Grid>
  //       <Grid item lg={12} md={12} sm={12} xs={12}>
  //         {
  //           (!this.state.createOrderLoading) ?
  //             <Button className={classes.createOrderButton} variant="contained" onClick={() => {
  //               if (this.state.validateCellphone) {
  //                 this.createOrder()
  //               } else {
  //                 this.setState({
  //                   openValidationSMS: true
  //                 })
  //               }
  //             }}>
  //               CONFIRMAR PEDIDO
  //             </Button>
  //             :
  //             <div style={{ textAlign: 'center', width: 100, margin: '0 auto', padding: '16px 0px' }}>
  //               <Loading />
  //             </div>
  //         }
  //         {
  //           (this.state.config.bluePoints.win > 0) ?
  //             <div>
  //               <div style={{ margin: 0, padding: 4 }}>
  //                 <strong style={{ color: 'blue' }}>{Utils.numberWithCommas(this.state.config.bluePoints.win)} {this.state.config.bluePoints.win === 1 ? 'punto azul' : 'puntos azules'} genera esta compra.</strong>
  //                 <br />
  //                 {
  //                   (this.state.config.bluePoints.conditions.exchange) ?
  //                     'Puedes utilizarlos en tu siguiente compra.'
  //                     :
  //                     'Activa tu Mondero Azul ® para acumularlos.'
  //                 }
  //               </div>
  //             </div>
  //             :
  //             ''
  //         }
  //       </Grid>
  //       <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
  //         {
  //           (this.state.user.calzzapatoUserId !== null && this.state.user.bluePoints !== null) ?
  //             <>
  //               {
  //                 (this.state.config.bluePoints.conditions.exchange) ?
  //                   <TableRow>
  //                     <TableCell style={{ width: '1%', margin: 0, padding: 4 }}>
  //                       <img style={{ width: 88 }} src="/monederoazul.svg" />
  //                     </TableCell>
  //                     <TableCell style={{ margin: 0, padding: 4 }}>
  //                       <TextField style={{ marginTop: 12, paddingBottom: 6, width: '100%' }} variant="outlined"
  //                         disabled={this.state.disabledBluePoints}
  //                         label="Puntos azules"
  //                         placeholder="Utilizar..."
  //                         value={this.state.bluePoints}
  //                         onChange={this.handleChangeBluePoints}
  //                         InputProps={{
  //                           endAdornment: (
  //                             <InputAdornment position="end">
  //                               {
  //                                 (this.state.disabledBluePoints) ?
  //                                   <Button variant="contained" onClick={() => { this.applyBluePoints(false) }}>
  //                                     QUITAR
  //                         </Button>
  //                                   :
  //                                   <Button variant="contained" color="primary" onClick={() => { this.applyBluePoints(true) }}>
  //                                     APLICAR
  //                         </Button>
  //                               }
  //                             </InputAdornment>
  //                           )
  //                         }}
  //                       />
  //                       <br />
  //                       <div style={{ paddingBottom: 12 }}>
  //                         <span>Tienes <strong>{Utils.numberWithCommas(this.state.user.bluePoints.balance)}</strong> {(this.state.user.bluePoints.balance === 1) ? 'punto' : 'puntos'} en tu Monedero Azul ®.</span>
  //                       </div>
  //                     </TableCell>
  //                   </TableRow>
  //                   :
  //                   <>
  //                     {
  //                       (!this.state.config.bluePoints.conditions.exchange) ?
  //                         <TableRow style={{ textAlign: 'center', paddingTop: 12, paddingBottom: 12 }}>
  //                           <TableCell></TableCell>
  //                           <TableCell>
  //                             {
  //                               (!Utils.isEmpty(this.state.config.bluePoints.conditions.link)) ?
  //                                 <Link href={this.state.config.bluePoints.conditions.link}>{this.state.config.bluePoints.conditions.message}</Link>
  //                                 :
  //                                 <span>{this.state.config.bluePoints.conditions.message}</span>
  //                             }
  //                           </TableCell>
  //                         </TableRow>
  //                         :
  //                         ''
  //                     }
  //                   </>
  //               }
  //             </>
  //             :
  //             <TableRow style={{ textAlign: 'center', paddingTop: 12, paddingBottom: 12 }}>
  //               <TableCell></TableCell>
  //               <TableCell>
  //                 <Link href="https://www.monederoazul.com">Activa tu Monedero Azul ® GRATIS y obtén grandes beneficios.</Link>
  //               </TableCell>
  //             </TableRow>
  //         }
  //       </Grid>
  //       <Grid item lg={12} md={12} sm={12} xs={12}>
  //         <div style={{ textAlign: 'left' }}>
  //           <strong>¿Quieres descuento?</strong>
  //           <Typography variant="body1" style={{ fontSize: 12, textAlign: 'left' }}>
  //             Suscríbete a nuestro newsletter donde obtendrás cupones de descuentos y más.
  //         </Typography>
  //         </div>
  //       </Grid>
  //       <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
  //         <TextField
  //           disabled={(this.state.appliedCoupon) ? true : false}
  //           variant="outlined"
  //           style={{ width: '100%', marginTop: 16, marginBottom: 32 }}
  //           placeholder="Ingresar..."
  //           label="Cupón de descuento"
  //           value={this.state.coupon}
  //           onChange={this.handleChangeCoupon}
  //           InputProps={{
  //             startAdornment: (
  //               <InputAdornment position="start">
  //                 <Label style={{ opacity: 0.3 }} />
  //               </InputAdornment>
  //             ),
  //             endAdornment: (
  //               <InputAdornment position="end">
  //                 {
  //                   (!this.state.appliedCoupon) ?
  //                     <Button disabled={(this.state.coupon.trim().length <= 0) ? true : false} variant="contained" color="primary" onClick={() => { this.applyCoupon() }} >
  //                       APLICAR
  //                   </Button>
  //                     :
  //                     <Button variant="contained" color="default" onClick={() => { this.removeCoupon() }} >
  //                       QUITAR
  //                   </Button>
  //                 }
  //               </InputAdornment>
  //             )
  //           }}
  //         />
  //       </Grid>
  //       <Grid item lg={12}>
  //         <Typography variant="body1" style={{ fontSize: 12, textAlign: 'center' }}>
  //           Al confirmar tu pedido aceptas los <a href="/terminos">términos y condiciones</a> y las <a href="/privacidad">políticas de privacidad</a> de GRUPO CALZAPATO S.A. DE C.V. y Calzapato.com ®
  //         </Typography>
  //       </Grid>

  //     </Grid>
  //   )
  // }
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
    },
    cleanCheckout: (checkout) => {
      dispatch(cleanCheckout(checkout))
    },
    updatePaymentMethod: (checkout) => {
      dispatch(updatePaymentMethod(checkout))
    },
    updateCard: (checkout) => {
      dispatch(updateCard(checkout))
    },
    updateAddress: (checkout) => {
      dispatch(updateAddress(checkout))
    },
    updateBluePoint: (checkout) => {
      dispatch(updateBluePoint(checkout))
    },
    updateCoupon: (checkout) => {
      dispatch(updateCoupon(checkout))
    }

  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(CheckoutViewNew)

