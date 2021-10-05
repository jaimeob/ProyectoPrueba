'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props'
import Router from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'

// Utils 
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import * as loginAction from '../modules/Login/loginAction'

import ValidationSMSModal from './ValidationSMSModal'
import messages from '../resources/Messages.json'

const {initSession: initSessionLogin} = loginAction

const styles = theme => ({
  text: {
    padding: 16,
    background: '#4267B2',
    color: 'white',
    fontSize: 16,
    fontWeight: 600,
    '&:hover': {
      cursor: 'pointer'
    }
  }
})

class FacebookLoginButton extends Component {

  constructor(props) {
    super(props)
    this.state = {
      openValidationSMS: false,
      validateCellphone: false,
      openSnack: false,
      messageSnack: '',
      cellphone: '',
      code: '',
      facebookId: '',
      email: '',
      username: '',
      name: '',
      lastName: '',
      accessToken: ''
    }

    this.responseFacebook = this.responseFacebook.bind(this)
    this.signUp = this.signUp.bind(this)
  }

  responseFacebook(response) {
    if (!response.email) {
      return
    }

    let name = response.name.split(response.last_name).slice(0, -1)

    this.setState({
      facebookId: response.id,
      email: response.email,
      username: response.email,
      name: name[0].trim(),
      lastName: response.last_name,
      accessToken: response.accessToken
    }, () => {
      this.signUp()
    })
  }

  async signUp() {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'POST',
      resource: 'users',
      endpoint: '/check-email',
      data: {
        email: this.state.email
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.exist) {
        const { initSessionLogin } = this.props
        let res = await initSessionLogin({
          email: this.state.email,
          password: '',
          facebookId: this.state.facebookId,
          accessToken: this.state.accessToken,
          withFacebook: true,
          metadata: JSON.stringify(this.state.metadata)
        })
        if (res.status === 200) {
          localStorage.setItem(Utils.constants.localStorage.USER, JSON.stringify(res.data))
          Router.push('/')
        }
        else {
          this.setState({
            snackbar: {
              open: true,
              message: 'Usuario y/o contraseña incorrecta.'
            }
          })
        }
      } else {
        if (!this.state.validateCellphone) {
          this.setState({
            openValidationSMS: true
          })
          return
        }
        
        let response = await requestAPI({
          host: Utils.constants.CONFIG_ENV.HOST,
          method: 'POST',
          resource: 'users',
          endpoint: '/create',
          data: {
            facebookId: this.state.facebookId,
            name: this.state.name,
            firstLastName: this.state.lastName,
            secondLastName: '',
            email: this.state.email,
            cellphone: this.state.cellphone,
            code: this.state.code,
            password: this.state.facebookId,
            newsletter: false,
          }
        })
        
        let message = messages.General.error
        if (response.status === Utils.constants.status.SUCCESS) {
          const { initSessionLogin } = this.props
          let res = await initSessionLogin({
            email: '',
            password: '',
            facebookId: this.state.facebookId,
            accessToken: this.state.accessToken,
            withFacebook: true,
            metadata: JSON.stringify(this.state.metadata)
          })
          if (res.status === 200) {
            localStorage.setItem(Utils.constants.localStorage.USER, JSON.stringify(res.data))
            Router.push('/')
          }
          else {
            this.setState({
              snackbar: {
                open: true,
                message: 'Usuario y/o contraseña incorrecta.'
              }
            })
          }
        }
        else {
          if (response.data.error.errno === 1062) {
            message = this.state.recoveryPasswordMessage
          }
          this.setState({
            openSnack: true,
            messageSnack: message
          })
        }
      }
    }
  }

  render() {
    const self = this
    const { classes } = this.props
    return (
      <div>
        <FacebookLogin
          appId="569260793822380"
          isDisabled={false}
          autoLoad={false}
          disableMobileRedirect={false}
          fields="id, email, name, last_name"
          callback={this.responseFacebook}
          render={renderProps => (
            <Typography className={classes.text}
              color="primary"
              variant="body1"
              onClick={renderProps.onClick}
            >Ingresar con Facebook</Typography>
          )}
        />
        <ValidationSMSModal 
          openDialog={this.state.openValidationSMS}
          title="Estás a un paso."
          description="Es necesario validar tu número celular para crear tu cuenta Calzzapato."
          newAccount={true}
          handleCloseValidationSMSModalWithSuccess={(cellphone, code) => {
            this.setState({ openValidationSMS: false, validateCellphone: true, cellphone: cellphone, code: code }, () => {
              self.signUp()
            })
          }}
          handleCloseValidationSMSModal={(event) => {
            this.setState({ openValidationSMS: false })
          }}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = {
  initSessionLogin
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(FacebookLoginButton)
