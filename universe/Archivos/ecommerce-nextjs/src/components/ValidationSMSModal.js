import React, { Component } from 'react'

//Material Ui
import { Button, DialogActions, DialogContent, DialogTitle, Typography, TextField, Snackbar, Checkbox, Grid } from '@material-ui/core'
import Close from '@material-ui/icons/Close'
import Modal from '@material-ui/core/Modal'

import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'

//Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import { setGiftCard } from '../actions/actionGiftCard'
import { showMessengerFacebook } from '../actions/actionConfigs'

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
  modalTitle: {
    fontSize: 28,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    },
    fontWeight: 600
  }
})

let INTERVAL = null

class ValidationSMSModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      disabledButton: false,
      step: 1,
      openSnackbar: false,
      messageSnackbar: '',
      cellphoneNumber: '',
      code: '',
      timer: 120
    }

    this.handleCellphoneNumberChange = this.handleCellphoneNumberChange.bind(this)
    this.handleCodeChange = this.handleCodeChange.bind(this)
    this.handleCloseSnack = this.handleCloseSnack.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleConfirmCode = this.handleConfirmCode.bind(this)
    this.timer = this.timer.bind(this)
  }

  handleCellphoneNumberChange(event) {
    let number = event.target.value
    if (!isNaN(Number(number)) && number.length <= 10) {
      this.setState({
        cellphoneNumber: number
      })
    }
  }

  handleCodeChange(event) {
    let number = event.target.value
    if (!isNaN(Number(number)) && number.length <= 6) {
      this.setState({
        code: number
      })
    }
  }

  async handleConfirm() {
    const self = this
    if (Utils.isEmpty(this.state.cellphoneNumber) || this.state.cellphoneNumber.length !== 10) {
      this.setState({
        openSnackbar: true,
        messageSnackbar: 'Proporciona un número celular válido de 10 dígitos.'
      })
    } else {
      this.setState({ disabledButton: true })

      let newAccount = false
      if (this.props.newAccount !== undefined && this.props.newAccount) {
        newAccount = true
      }

      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'users',
        endpoint: '/generate-code',
        data: {
          cellphone: this.state.cellphoneNumber,
          newAccount: newAccount
        }
      })

      let error = true
      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.success) {
          error = false
          this.setState({
            step: 2,
            disabledButton: false
          }, () => {
            INTERVAL = setInterval(self.timer, 1000)
          })
        }
      }

      if (error && response.status !== Utils.constants.status.SUCCESS) {
        this.setState({
          disabledButton: false,
          openSnackbar: true,
          messageSnackbar: 'El número celular ingresado ya se encuentra en uso. Por favor, intenta de nuevo con otro número celular.'
        })
      }
    }
  }

  timer() {
    let updatedTimer = this.state.timer = this.state.timer - 1
    this.setState({
      timer: updatedTimer
    })

    if (updatedTimer <= 0) {
      clearInterval(INTERVAL)
      INTERVAL = null
    }
  }

  async handleConfirmCode() {
    const self = this
    if (Utils.isEmpty(this.state.code) || this.state.code.length !== 6) {
      this.setState({
        openSnackbar: true,
        messageSnackbar: 'Proporciona un código Calzzapato válido de 6 dígitos.'
      })
    } else {
      this.setState({ disabledButton: true })

      let newAccount = false
      if (this.props.newAccount !== undefined && this.props.newAccount) {
        newAccount = true
      }

      const response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'users',
        endpoint: '/validate-code',
        data: {
          cellphone: this.state.cellphoneNumber,
          code: this.state.code,
          newAccount: newAccount
        }
      })

      let error = true

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.success) {
          error = false
          INTERVAL = null
          clearInterval(INTERVAL)
          this.setState({
            disabledButton: false
          }, () => {
            self.props.handleCloseValidationSMSModalWithSuccess(this.state.cellphoneNumber, this.state.code)
          })
        }
      }

      if (error) {
        this.setState({
          disabledButton: false,
          openSnackbar: true,
          messageSnackbar: response.data.error.message
        })
      }
    }
  }

  handleRender() {
    INTERVAL = null
    clearInterval(INTERVAL)
    this.props.showMessengerFacebook(false)
    this.setState({
      disabledButton: false,
      step: 1,
      timer: 120,
      code: '',
      cellphone: ''
    })
  }

  handleClose = () => {
    this.setState({
      openSnackbar: false,
      messageSnackbar: '',
      cellphoneNumber: '',
      code: ''
    })
    this.props.handleCloseValidationSMSModal()
    this.props.showMessengerFacebook(true)
  }

  handleCloseSnack() {
    this.setState({
      openSnackbar: false
    })
  }

  render() {
    const self = this
    const { classes } = this.props
    return (
      <Modal
        open={this.props.openDialog}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
        style={{ margin: 0, padding: 0 }}
      >
        <div style={getModalStyle()} className={classes.smallForm}>
          <div style={{ textAlign: 'left' }}>
            <strong style={{ fontSize: 36 }}>{(this.props.title !== undefined) ? this.props.title : 'Un último paso.'}</strong>
            {
              (this.props.description !== undefined) ?
                <Typography variant='body1'>{this.props.description}</Typography>
                :
                <div>
                  <Typography variant='body1'>Confirma tu teléfono celular para ofrecerte un mejor servicio e informarte el estatus de tu pedido.</Typography>
                  <br />
                  <Typography variant='body1'>Te enviarémos un SMS.</Typography>
                </div>
            }
          </div>
          <div className={classes.container}>
            <Snackbar
              style={{ zIndex: 99999 }}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              autoHideDuration={5000}
              message={this.state.messageSnackbar}
              open={this.state.openSnackbar}
              onClose={this.handleCloseSnack}
              action={
                <Button onClick={this.handleCloseSnack} color='inherit' >
                  <Close />
                </Button>
              }
            />
            {
              (this.state.step === 1) ?
                <TextField
                  autoFocus
                  variant="outlined"
                  label="Teléfono ceular (10 dígitos)"
                  placeholder="Escribe aquí tu teléfono celular..."
                  style={{ marginTop: 12, width: '100%' }}
                  value={this.state.cellphoneNumber}
                  onChange={this.handleCellphoneNumberChange}
                />
                :
                <TextField
                  variant="outlined"
                  label="Código Calzzapato ® (6 dígitos)"
                  placeholder="_ _ _ _ _ _"
                  style={{ marginTop: 12, width: '100%' }}
                  value={this.state.code}
                  onChange={this.handleCodeChange}
                />
            }
          </div>
          <div style={{ position: 'sticky', bottom: -42, background: 'white', margin: 0 }}>
            {
              (this.state.step === 1) ?
                <Button disabled={this.state.disabledButton} variant="contained" color="primary" style={{ marginTop: 8, width: '100%' }} onClick={(event) => { this.handleConfirm(event) }}>
                  ENVIAR CÓDIGO
              </Button>
                :
                <Button disabled={this.state.disabledButton} variant="contained" color="primary" style={{ marginTop: 8, width: '100%' }} onClick={(event) => { this.handleConfirmCode(event) }}>
                  CONFIRMAR
              </Button>
            }
            {
              (this.state.step === 1) ?
                <Button color="primary" style={{ marginTop: 8, width: '100%' }} onClick={(event) => { this.setState({ step: 2, timer: 0, code: '' }) }}>
                  YA TENGO UN CÓDIGO
              </Button>
                :
                <div>
                  {
                    (this.state.timer !== 120) ?
                      (this.state.timer <= 0) ?
                        <Button color="primary" style={{ marginTop: 8, width: '100%' }} onClick={(event) => { this.setState({ step: 1, timer: 120, code: '' }) }}>
                          RE-ENVIAR CÓDIGO
                    </Button>
                        :
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                          <Typography variant="body1" style={{ fontSize: 14 }}>¿Aún no te llega un código SMS?</Typography>
                          <Typography variant="body1" style={{ fontSize: 14 }}>Espera {this.state.timer} segundo(s) para re-enviar un código.</Typography>
                        </div>
                      :
                      ''
                  }
                </div>
            }
            <Button onClick={this.handleClose} color='primary' style={{ marginTop: 8, width: '100%' }} >
              <Close />
            </Button>
            <Typography variant="body1" style={{ textAlign: 'center', width: '100%', fontSize: 10, paddingBottom: 12 }}>Recibirás un SMS con un código de 6 dígitos de Calzzapato.</Typography>
          </div>
        </div>
      </Modal>
    )
  }
}


const mapStateToProps = ({ app }) => ({ app })

const mapDispatchToProps = dispatch => {
  return {
    setGiftCard: (data) => {
      dispatch(setGiftCard(data))
    },
    showMessengerFacebook: (show) => {
      dispatch(showMessengerFacebook(show))
    }
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(ValidationSMSModal)
