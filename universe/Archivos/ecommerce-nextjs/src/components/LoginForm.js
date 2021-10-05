'use strict'

import React, { Component } from 'react'
import Link from 'next/link'
import { connect } from 'react-redux'
import Axios from 'axios'
//import Cookies from 'next-cookies'
import Cookies from 'universal-cookie'


import compose from 'recompose/compose'

// Components
import FacebookLoginButton from './FacebookLoginButton'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { TextField, Button, Typography } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Utils
import Utils from '../resources/Utils'
import Router from 'next/router'
import * as loginAction from '../modules/Login/loginAction'
import { emailTrackingCode } from '../resources/classes/retailrocket.js'

const { initSession: initSessionLogin } = loginAction

const cookies = new Cookies();

const styles = theme => ({
  loginForm: {
    backgroundColor: theme.palette.background.secondary,
    padding: "32px"
  },
  textField: {
    width: '100%',
    marginTop: 8
  },
  loginButton: {
    width: '100%',
    marginTop: 16,
    fontWeight: 600,
    fontSize: 14
  },
  containerFooter: {
    marginTop: 16,
    textAlign: 'center'
  }
})

class LoginForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      snackbar: {
        open: false,
        message: 'Usuario y/o contraseña incorrecta.'
      },
      email: '',
      password: '',
      metadata: '',
      loginLoading: false
    }

    this.handleClose = this.handleClose.bind(this)
    this.login = this.login.bind(this)
    this.handleChangeEmail = this.handleChangeEmail.bind(this)
    this.handleChangePassword = this.handleChangePassword.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.getQueryParam = this.getQueryParam.bind(this)
  }

  getQueryParam() {
    if (Utils.validateEmail(this.state.email)) {
      return '?email=' + this.state.email
    }
    return ''
  }
  async componentWillMount() {
    this.setState({
      email: this.props.patchEmail
    })
    
    const metadata = await (Utils.getMetadata())
    try {
      const response = await Axios('https://api.ipify.org?format=json')
      const data = await response.data
      metadata.instance = this.props.app.data.uuid
      metadata.user = this.props.login
      metadata.ip = data.ip
      this.setState({
        metadata
      })
      return metadata
    } catch (error) {
      this.setState({
        metadata
      })
    }
  }

  handleClose() {
    this.setState({
      snackbar: {
        open: false,
        message: this.state.snackbar.message
      }
    })
  }

  async login() {
    this.setState({
      loginLoading: true
    })
    if (this.state.email === "") {
      this.setState({
        snackbar: {
          open: true,
          message: 'Los campos marcados ( * ) son obligatorios.'
        }
      })
    }
    else {
      let email = this.state.email
      let password = this.state.password
      if (!Utils.validateEmail(email) && (Utils.isPhoneNumber(email) && !email.length === 10)) {
        this.setState({
          snackbar: {
            open: true,
            message: 'Correo electrónico o numero celular inválido. Intenta de nuevo con otro correo o numero celular.'
          }
        })
      }
      else if (password.trim().length <= 0) {
        this.setState({
          snackbar: {
            open: true,
            message: 'Los campos marcados ( * ) son obligatorios.'
          }
        })
      }
      else {
        const { initSessionLogin } = this.props
        let res = await initSessionLogin({
          email: email,
          password: password,
          withFacebook: false,
          username: '',
          facebookId: '',
          accessToken: '',
          metadata: JSON.stringify(this.state.metadata)
        })
        
        if (res.status === 200) {
          cookies.set('userEmail', res.data.username, {path: '/', secure: true, sameSite:'None'})
          cookies.set('userToken', res.data.token, {path: '/', secure: true, sameSite:'None'})
          localStorage.setItem(Utils.constants.localStorage.USER, JSON.stringify(res.data))
          if (window.location.search.includes('checkout=true')) {
            Router.push('/compras/finalizar')
          } else {
            Router.push('/')
          }

          // RETAIL ROCKET CODE 6
          emailTrackingCode(email)
        }
        if (res.status !== 200) {
          this.setState({
            snackbar: {
              open: true,
              message: 'Usuario y/o contraseña incorrecta.'
            }
          })
        }
      }
    }
    this.setState({
      loginLoading: false
    })
  }
  //  componentDidUpdate(prevProps) {

  handleChangeEmail(event) {
    this.setState({ email: event.target.value })
  }

  handleChangePassword(event) {
    this.setState({ password: event.target.value })
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.login()
    }
  }

  render() {
    const { snackbar: { open, message } } = this.state
    const { classes } = this.props
    return (
      <form className={classes.loginForm} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
        <TextField
          label='Correo electrónico o número celular *'
          value={this.state.email}
          onChange={this.handleChangeEmail}
          className={classes.textField}
          autoFocus
        />
        <TextField
          label='Contraseña *'
          type="password"
          value={this.state.password}
          onChange={this.handleChangePassword}
          className={classes.textField}
        />
        {
          (this.props.app.data.configs) ?
            <Button
              variant="contained"
              color="primary"
              disabled={this.state.loginLoading}
              startIcon={this.state.loginLoading === true ? <img src='/loading.svg' style={{ width: '20px' }} /> : null}
              className={classes.loginButton}
              onClick={() => { this.login() }}
            >
              INGRESAR
            </Button>
            :
            ''
        }

        <div className={classes.containerFooter}>
          <FacebookLoginButton />
          <br />
          <Link href='/recuperar-contrasena'>
            <a>
              <Typography color="primary" variant="body1">Recuperar contraseña</Typography>
            </a>
          </Link>
          <br />
          <Link href='/registro'>
            <a>
              <Typography color="primary" variant="body1">Crear cuenta</Typography>
            </a>
          </Link>
        </div>

        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={open}
          onClose={this.handleClose}
          message={
            <span>
              {message}
            </span>
          }
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.handleClose}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />

      </form>
    )
  }
}

const mapStateToProps = ({ app, login }) => ({ app, login })

const mapDispatchToProps = {
  initSessionLogin
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(LoginForm)
