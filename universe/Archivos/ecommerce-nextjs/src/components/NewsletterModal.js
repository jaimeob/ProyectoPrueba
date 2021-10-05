import React, { Component } from 'react'

//Material Ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, TextField, InputAdornment, Snackbar, Hidden } from '@material-ui/core'
import MailOutline from '@material-ui/icons/MailOutline'
import Close from '@material-ui/icons/Close'
import { withTheme, withStyles } from '@material-ui/core/styles'

import { connect } from 'react-redux'
import { newsletterStatus } from '../actions/actionNewsletterModal'
import compose from 'recompose/compose'

//Utils
import Utils from '../resources/Utils'
import { getDataAPI, requestAPI } from '../api/CRUD'

class NewsletterModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      openDialog: false,
      messageSnackbar: '',
      openSnackbar: false,
      messageInternalSnackbar: '',
      openInternalSnackbar: false
    }
    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.sendingMail = this.sendingMail.bind(this)
    this.handleCloseSnack = this.handleCloseSnack.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  async subscribeEmail() {
    //Busca email en la base de datos
    let response = await getDataAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: 'subscribers',
      filters: {
        where: {
          email: this.state.email
        }
      }
    })
    //Si lo encuentra se cierra dialog, si no, envia email a la base de datos ejecutando metodo remoto
    if (response.data.length > 0 && response.data[0].status == 1) {
      this.setState({
        messageSnackbar: '¡Gracias! Te mantendremos informado.',
        openSnackbar: true,
        openDialog: false
      })
    } else {
      let register = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        resource: 'subscribers',
        method: 'POST',
        endpoint: '/welcome-newsletter',
        data: {
          email: this.state.email
        }
      })
      //Si el status fue exitoso
      if (register.status === Utils.constants.status.SUCCESS) {

        this.props.newsletterStatus(true)

        this.setState({
          messageSnackbar: '¡Su correo electrónico ha sido registrado exitosamente',
          openSnackbar: true,
          openDialog: false
        })
      }
    }
  }

  //Valída email ingresado
  sendingMail() {
    let isValidMail = Utils.validateEmail(this.state.email)
    if (isValidMail === true) {
      this.subscribeEmail()
    } else {
      this.setState({
        messageInternalSnackbar: 'Ingresa un correo electrónico válido por favor',
        openInternalSnackbar: true,
      })
    }
  }

  handleEmailChange(event) {
    this.setState({
      email: event.target.value
    })
  }

  handleClickOpen = () => {
    this.setState({ openDialog: true })
  }

  handleClose = () => {
    this.setState({ openDialog: false })
  }

  componentWillMount() {
    this.handleClickOpen()
  }

  handleCloseSnack() {
    this.setState({
      openSnackbar: false
    })
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.sendingMail()
    }
  }

  render() {
    return (
      <div>
        <form onKeyPress={this.handleKeyPress}>
          <Dialog
            open={this.state.openDialog}
            onClose={this.handleClose}
          >
            <Snackbar
              autoHideDuration={5000}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              message={this.state.messageInternalSnackbar}
              open={this.state.openInternalSnackbar}
            />
            <DialogTitle style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: 36 }}>Hola.</strong>
            </DialogTitle>
            <DialogContent>
              <Hidden xsDown>
                <Typography variant='body1'>
                  <strong>¡Entérate de novedades, descuentos y promociones que Calzzapato tiene para ti!</strong>
                  <br />
                  <br />
                  Ingresa tu correo electrónico.
                  </Typography>
                <br />

              <TextField
                variant="outlined"
                placeholder="Ingresa tu correo electrónico aquí"
                style={{width: '100%'}}
                onChange={this.handleEmailChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button variant="contained" color="primary" onClick={this.sendingMail} >
                        SUBSCRIBIRSE
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              </Hidden>

              <Hidden smUp>
                <Typography variant='body1' style={{'font-size': '15px'}}>
                  <strong>¡Entérate de las novedades, descuentos y promociones que Calzzapato tiene para ti!</strong>
                  <br />
                  <br />
                  Ingresa tu correo electrónico.
                  </Typography>
                <br />

              <TextField
                variant="outlined"
                style={{width: '100%'}}
                placeholder="Correo electrónico"
                onChange={this.handleEmailChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline />
                    </InputAdornment>
                  ),
                }}
              />

                <Button variant="contained" color="primary" style={{width: '100%', marginTop: '16px'}} onClick={this.sendingMail} >
                  SUBSCRIBIRSE
                </Button>
              </Hidden>
        
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color='primary' style={{ margin: '0 auto', marginBottom: 16 }}>
                <Close />
              </Button>
            </DialogActions>
          </Dialog>
        </form>
        <Snackbar
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
      </div>
    )
  }
}


const mapStateToProps = state => {
  return {
    status: state.status
  }
}

const mapDispatchToProps = dispatch => {
  return {
    newsletterStatus: (show) => {
      dispatch(newsletterStatus(show))
    }
  }
}

export default compose(
  connect(mapStateToProps, mapDispatchToProps)
)(NewsletterModal)
