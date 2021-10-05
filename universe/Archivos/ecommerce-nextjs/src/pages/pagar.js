import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'

// Utils'
import { deletePaymentForm } from '../actions/actionPayment'
import Title from '../components/Title'

const BBVA_PAY = 1
const CREDIVALE_PAY = 2
const OXXO_PAY = 3
const PAYPAL = 4
const NETPAY = 5
const MERCADOPAGO = 8
const OPENPAY = 9

const styles = theme => ({
  paymentContainer: {
    marginTop: 32,
    marginBottom: 222,
    width: '90%',
    margin: '0 auto'
  },
  createOrderContainer: {
    textAlign: 'right',
    backgroundColor: '#EFF3F7',
    padding: 16,
    marginLeft: 48
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
  fixCell: {
    width: 'auto',
    margin: 0,
    padding: 0,
    paddingRight: '1%'
  }
})

class Payment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      payment: null,
      paymentMethodName: '',
      interval: null
    }
  }

  componentWillMount() {
    try {
      let payment = localStorage.getItem('payment')
      payment = JSON.parse(payment)
      this.setState({
        payment: payment
      })
    } catch (e) {
      localStorage.removeItem('payment')
      clearInterval(this.state.interval)
      window.location.replace('/compras/finalizar')
    }
  }

  componentWillUnmount() {
    localStorage.removeItem('payment')
    clearInterval(this.state.interval)
  }

  componentDidMount() {
    const self = this
    if (this.state.payment !== null && this.state.payment !== undefined) {
      if (this.state.payment.paymentWay === BBVA_PAY) {
        document.getElementById('paymentForm').innerHTML = this.state.payment.body
        this.setState({
          paymentMethodName: 'BBVA Bancomer ®',
          interval: setInterval(function () {
            try {
              document.form.submit()
              clearInterval(self.state.interval)
            } catch (err) {
              clearInterval(self.state.interval)
              window.location.replace('/compras/finalizar')
            }
          }, 5000)
        })
      } else if (this.state.payment.paymentWay === PAYPAL) {
        this.setState({
          paymentMethodName: 'PayPal ®',
          interval: setInterval(function () {
            window.location.href = self.state.payment.paypal.links[1].href
          }, 5000)
        })
      } else if (this.state.payment.paymentWay === MERCADOPAGO) {
        let href = this.state.payment.url
        this.setState({
          paymentMethodName: 'MercadoPago ®',
          interval: setInterval(function () {
            window.location.href = href
          }, 5000)
        })
      } else if (this.state.payment.paymentWay === OPENPAY) {
        let href = this.state.payment.url
        this.setState({
          paymentMethodName: '3D Secure',
          interval: setInterval(function () {
            window.location.href = href
          }, 5000)
        })
      } 
      else if (this.state.payment.paymentWay === NETPAY) {
        this.setState({
          paymentMethodName: '3D Secure',
          interval: setInterval(function () {
            window.location.href = self.state.payment.netpay.url
          }, 5000)
        })
      }
    } else {
      localStorage.removeItem('payment')
      clearInterval(this.state.interval)
      window.location.replace('/compras/finalizar')
    }
  }

  render() {
    return (
      <div style={{marginTop: 64, marginBottom: 244, textAlign: 'center'}}>
        <Title
          title="Redireccionando."
          description={"Te estamos redireccionando a " + this.state.paymentMethodName + " para completar tu proceso de compra."}
        />
        <br />
        <br />
        <Button variant="contained" color="primary" onClick={() => {
          if (this.state.payment.paymentWay === BBVA_PAY) {
            try {
              document.form.submit()
              clearInterval(this.state.interval)
            } catch (err) {
              clearInterval(this.state.interval)
              window.location.replace('/compras/finalizar')
            }
          } else if (this.state.payment.paymentWay === PAYPAL) {
            clearInterval(this.state.interval)
            window.location.href = this.state.payment.paypal.links[1].href
          } else if (this.state.payment.paymentWay === NETPAY) {
            clearInterval(this.state.interval)
            window.location.href = this.state.payment.netpay.url
          } else if (this.state.payment.paymentWay === MERCADOPAGO) {
            clearInterval(this.state.interval)
            window.location.href = this.state.payment.url
          } 
        }}>
          CONTINUAR EN { this.state.paymentMethodName }
        </Button>
        <br />
        <br />
        <br />
        <span>En 5 segundos serás redireccionado...</span>
        <div id="paymentForm" style={{display: 'none'}}></div>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    deletePaymentForm: () => {
      dispatch(deletePaymentForm())
    }
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(Payment)
