import React, { Component } from 'react'

//Material Ui
import { Button, Typography, TextField, Snackbar, IconButton, Grid, Icon } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import Modal from '@material-ui/core/Modal'

import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'

import CardValidator from 'card-validator'
import Loading from './Loading'

//Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Router from 'next/router'

function getModalStyle() {
  const top = 50
  const left = 50
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const styles = theme => ({
  smallForm: {
    overflowY: 'scroll',
    position: 'absolute',
    width: theme.spacing(60),
    maxHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('xs')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  largeForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing(100),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  largeTextField: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'inherit',
    fontWeight: 200
  },
  modalTitle: {
    fontSize: 28,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    },
    fontWeight: 600
  }
})

class CardModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      number: '',
      numberMask: '',
      month: '',
      year: '',
      cvv: '',
      titular: '',
      alias: '',
      numberDisabled: false,
      monthDisabled: false,
      yearDisabled: false,
      cvvDisabled: false,
      titularDisabled: false,
      openSnack: false,
      errorMessage: '',
      loading: false
    }

    this.isDataFormValid = this.isDataFormValid.bind(this)
    this.handleChangeNumber = this.handleChangeNumber.bind(this)
    this.handleChangeMonth = this.handleChangeMonth.bind(this)
    this.handleChangeYear = this.handleChangeYear.bind(this)
    this.handleChangeCVV = this.handleChangeCVV.bind(this)
    this.handleChangeTitular = this.handleChangeTitular.bind(this)
    this.handleChangeAlias = this.handleChangeAlias.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleRender = this.handleRender.bind(this)
  }

  isDataFormValid() {
    let number = String(this.state.number).trim()
    let type = ''
    let month = String(this.state.month).trim()
    let year = String(this.state.year).trim()
    let cvv = String(this.state.cvv).trim()
    let email = String(this.state.email).trim()
    let titular = String(this.state.titular).trim()
    let alias = String(this.state.alias).trim() || ''

    if (number === "" || month === "" || year === "" || cvv === "") {
      return { error: true, code: 1, message: "Ingresa los datos de la tarjeta." }
    }

    // Validar tarjeta
    let validation = CardValidator.number(number).isValid
    validation = (!validation) ? false : CardValidator.expirationMonth(month).isValid
    validation = (!validation) ? false : CardValidator.expirationYear(year).isValid

    if (CardValidator.creditCardType(number)[0].type === 'american-express') {
      validation = (!validation) ? false : CardValidator.cvv(cvv, 4).isValid
    } else {
      validation = (!validation) ? false : CardValidator.cvv(cvv, 3).isValid
    }

    if (!validation) {
      return { error: true, code: 2, message: "Ingresa una tarjeta válida y con vigencia." }
    }

    validation = CardValidator.creditCardType(number)[0].type || ''

    if (validation === '') {
      return { error: true, code: 3, message: "Tipo de tarjeta no soportada." }
    }
    else {
      type = validation
    }

    if (titular === "") {
      return { error: true, code: 8, message: "El nombre del titular es obligatorio." }
    }

    return {
      error: false, code: 0, message: "",
      data: {
        type: type,
        number: number,
        month: month,
        year: year,
        cvv: cvv,
        titular: titular,
        email: email,
        alias: alias
      }
    }
  }

  handleChangeNumber(event) {
    let lastDigit = event.target.value.substr(event.target.value.length - 1, event.target.value.length).trim()
    if (isNaN(lastDigit)) {
      return
    }

    let backspace = false
    if (event.target.value.length < this.state.numberMask.length) {
      backspace = true
    }

    // Máximo 16 dígitos (VISA y MASTERCARD)
    if (this.state.number.length >= 16 && !backspace) {
      return
    }

    let numberUpdated = ''
    if (backspace) {
      numberUpdated = this.state.number.substr(0, this.state.number.length - 1)
    }
    else {
      numberUpdated = this.state.number
      numberUpdated += lastDigit
    }

    this.setState({ number: numberUpdated }, () => {
      let number = this.state.number
      let mask = ''

      if (number.length > 4) {
        let type = ''
        if (CardValidator.creditCardType(number).length > 0) {
          type = CardValidator.creditCardType(number)[0].type
        }
        let LAST_DIGIT = 4
        if (type === 'american-express') {
          LAST_DIGIT = 5
          if (number.length > 15) {
            number = this.state.number.substr(0, this.state.number.length - 1)
            this.setState({ number: number })
          }
        }
        let lastDigits = number.substr(number.length - LAST_DIGIT, number.length)
        for (let i = 0; i < number.length - LAST_DIGIT; i++) {
          if (type === 'american-express') {
            if (i === 4)
              mask += " ●"
            else if (i === 9)
              mask += "● "
            else
              mask += "●"
          }
          else {
            if (i === 4 || i === 8)
              mask += " ●"
            else if (i === 11)
              mask += "● "
            else
              mask += "●"
          }
        }
        mask += lastDigits
      }
      else {
        mask = number
      }

      this.setState({
        number: number,
        numberMask: mask
      })
    })
  }

  handleChangeMonth(event) {
    if (event.target.value.length > 2 || !isNaN(event.target.value.trim))
      return
    this.setState({ month: event.target.value })
  }

  handleChangeYear(event) {
    if (event.target.value.length > 2 || !isNaN(event.target.value.trim))
      return
    this.setState({ year: event.target.value })
  }

  handleChangeCVV(event) {
    if (event.target.value.length > 4 || !isNaN(event.target.value.trim))
      return
    this.setState({ cvv: event.target.value })
  }

  handleChangeTitular(event) {
    if (event.target.value.length > 64)
      return
    let upperCase = event.target.value.toUpperCase()
    this.setState({ titular: upperCase })
  }

  handleChangeAlias(event) {
    if (event.target.value.length > 32)
      return
    this.setState({ alias: event.target.value })
  }

  async handleConfirm() {
    this.setState({ loading: true })
    if (this.props.editCard) {
      let data = this.props.card
      data.alias = this.state.alias
      let openpay = false 
      if (data.paymentMethodId === 9) {
        openpay = true
      }
      let response = null
      if (openpay === false) {
        response = await requestAPI({
          host: Utils.constants.CONFIG_ENV.HOST,
          method: 'POST',
          resource: 'cards',
          endpoint: '/add',
          data: data
        })

      } else {
        response = await requestAPI({
          host: Utils.constants.CONFIG_ENV.HOST,
          method: 'POST',
          resource: 'cards',
          endpoint: '/openpay/add',
          data: data
        })
      }
      
      if (response.status === 200) {
        if (response.data.added) {
          await this.clearData()
          this.props.handleCloseWithCard(response.data.card)
        }
      }
    }
    else {
      let response = this.isDataFormValid()
      if (response.error) {
        this.setState({
          openSnack: true,
          errorMessage: response.message
        })
      } else {
        let user = await Utils.getCurrentUser()
        if (user !== null) {
          let data = {
            type: response.data.type,
            number: response.data.number,
            month: response.data.month,
            year: response.data.year,
            cvv: response.data.cvv,
            titular: response.data.titular,
            alias: response.data.alias
          }

          response = await requestAPI({
            host: Utils.constants.CONFIG_ENV.HOST,
            method: 'POST',
            resource: 'cards',
            endpoint: '/add',
            data: data
          })

          let cardTokenize = await Utils.createToken(data)

          if (cardTokenize.success === true) {
            // Tarjeta tokenizada.
            data.token = cardTokenize.card.data.id
            data.cardInfo = cardTokenize.card.data
            data.deviceId = await Utils.getDeviceIdOpenpay()

            response = await requestAPI({
              host: Utils.constants.CONFIG_ENV.HOST,
              method: 'POST',
              resource: 'cards',
              endpoint: '/openpay/add',
              data: data
            })
          }

          if (response.status === 200) {
            if (response.data.added) {
              await this.clearData()
              await this.props.handleCloseWithCard(response.data.card)
            } else {
              let errorMessage = 'Ocurrió un problema. Intenta de nuevo más tarde.'
              if (response.data.error !== undefined && response.data.error.message !== undefined) {
                errorMessage = response.data.error.message
              }

              this.setState({
                openSnack: true,
                errorMessage: errorMessage
              })
            }
          } else {
            let errorMessage = 'Ocurrió un problema. Intenta de nuevo más tardes.'
            if (Number(response.data.error.errno) === 1062) {
              errorMessage = 'La tarjeta ya ha sido agregada.'
            } else if (response.data.error !== undefined && response.data.error.message !== undefined) {
              errorMessage = response.data.error.message
            }

            this.setState({
              openSnack: true,
              errorMessage: errorMessage
            })
          }
        } else {
          Router.push('/')
        }
      }
    }
    this.setState({ loading: false })
  }

  handleCloseSnackbar() {
    this.setState({ errorMessage: '', openSnack: false })
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.handleConfirm()
    }
  }

  handleRender() {
    if (this.props.editCard) {
      let numberMask = ''
      let cvvMask = ''
      let monthMask = ''
      let yearMask = ''
      if (this.props.card.type === 'mastercard' || this.props.card.type === 'visa') {
        numberMask = '●●●● ●●●● ●●●● ' + this.props.card.number
        cvvMask = '●●●'
        monthMask = '●●'
        yearMask = '●●'
      }
      else {
        numberMask = '●●●● ●●●●●● ' + this.props.card.number
        cvvMask = '●●●●'
        monthMask = '●●'
        yearMask = '●●'
      }

      this.setState({
        numberMask: numberMask,
        number: this.props.card.number,
        month: monthMask,
        year: yearMask,
        titular: this.props.card.titular,
        cvv: cvvMask,
        numberDisabled: true,
        monthDisabled: true,
        yearDisabled: true,
        cvvDisabled: true,
        titularDisabled: true,
        alias: this.props.card.alias
      })
    }
    else {
      this.setState({
        numberDisabled: false,
        monthDisabled: false,
        yearDisabled: false,
        cvvDisabled: false,
        titularDisabled: false
      })
    }
  }

  clearData() {
    this.setState({
      numberMask: '',
      number: '',
      month: '',
      year: '',
      cvv: '',
      titular: '',
      alias: '',
      numberDisabled: false,
      monthDisabled: false,
      yearDisabled: false,
      cvvDisabled: false,
      openSnack: false,
      errorMessage: ''
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        className={classes.modalContainer}
        onRendered={this.handleRender}
      >
        <div style={getModalStyle()} className={classes.smallForm}>
          <Typography variant="h4" className={classes.modalTitle}>
            Agregar tarjeta.
          </Typography>
          <Typography variant="body1" style={{ marginTop: 8 }}>
            Agrega una tarjeta Visa, MasterCard o American Express.
          </Typography>
          <form noValidate autoComplete="off" onKeyPress={this.handleKeyPress} style={{ marginTop: 16 }}>
            <Grid container>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <TextField
                  className={classes.largeTextField}
                  label="Número de tarjeta *"
                  placeholder="Ingresa el número que aparece en el plástico"
                  type="text"
                  value={this.state.numberMask}
                  onChange={this.handleChangeNumber}
                  disabled={this.state.numberDisabled}
                  autoFocus
                />
              </Grid>
              <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ paddingRight: 16 }}>
                <TextField
                  className={classes.largeTextField}
                  label="Mes"
                  placeholder="MM"
                  type="text"
                  value={this.state.month}
                  onChange={this.handleChangeMonth}
                  disabled={this.state.monthDisabled}
                />
              </Grid>
              <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ paddingRight: 16 }}>
                <TextField
                  className={classes.largeTextField}
                  label="Año"
                  placeholder="YY"
                  type="text"
                  value={this.state.year}
                  onChange={this.handleChangeYear}
                  disabled={this.state.yearDisabled}
                />
              </Grid>
              <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                <TextField
                  className={classes.largeTextField}
                  label="CVV *"
                  placeholder="Código de seguridad"
                  type="text"
                  value={this.state.cvv}
                  onChange={this.handleChangeCVV}
                  disabled={this.state.cvvDisabled}
                />
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <TextField
                  className={classes.largeTextField}
                  label="Titular *"
                  placeholder="Nombre del titular como aparece en el plástico."
                  type="text"
                  value={this.state.titular}
                  onChange={this.handleChangeTitular}
                  disabled={this.state.titularDisabled}
                />
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                {
                  (this.props.editCard) ?
                    <TextField
                      className={classes.largeTextField}
                      label="Alias"
                      placeholder="¿Cómo quieres reconocer tu tarjeta?"
                      type="text"
                      value={this.state.alias}
                      onChange={this.handleChangeAlias}
                      autoFocus
                    />
                    :
                    <TextField
                      className={classes.largeTextField}
                      label="Alias"
                      placeholder="¿Cómo quieres reconocer tu tarjeta?"
                      type="text"
                      value={this.state.alias}
                      onChange={this.handleChangeAlias}
                    />
                }
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
                <Icon style={{ color: 'green', float: 'left', marginTop: 6, marginRight: 10 }}>lock</Icon>
                <Typography variant="body1" style={{ fontSize: 12, color: 'gray' }}>
                  Compra 100% segura con cifrado de información. Revisa tu pedido y asegúrate de que todos tus datos esten correctos. <strong>No se te cobrará nada hasta que confirmes tu compra.</strong>
                </Typography>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <div style={{ textAlign: 'right', marginTop: 24 }}>
                  <Button
                    style={{ marginRight: 16 }}
                    onClick={this.handleClose}
                  >
                    CANCELAR
                  </Button>
                  <Button
                    className={classes.primaryButton}
                    variant="contained"
                    color="primary"
                    onClick={this.handleConfirm}
                  >
                    CONFIRMAR
                  </Button>
                </div>
              </Grid>
            </Grid>
          </form>
          {
            (this.state.loading) ?
              <Loading />
              :
              ''
          }
          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.state.openSnack}
            onClose={this.handleCloseSnackbar}
            message={
              <span>{this.state.errorMessage}</span>
            }
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={this.handleCloseSnackbar}
              >
                <CloseIcon />
              </IconButton>
            ]}
          />
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(withStyles(styles), connect(mapStateToProps, null))(CardModal)
