import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { TextField, Button } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({
  loginForm: {
    margin: '0 auto',
    backgroundColor: theme.palette.background.secondary,
    padding: "16px 32px"
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
    marginTop: 32,
    textAlign: 'center'
  }
})

class NewPasswordForm extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      openSnack: false,
      messageSnack: '',
      token: '',
      password: '',
      confirmPassword: ''
    }

    this.handleClose = this.handleClose.bind(this)
    this.setNewPassword = this.setNewPassword.bind(this)    
    this.handleChangePassword = this.handleChangePassword.bind(this)
    this.handleChangeConfirmPassword = this.handleChangeConfirmPassword.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleClose() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  async setNewPassword() {
    if (this.state.password.trim() === "" || this.state.confirmPassword.trim() === "") {
      this.setState({
        openSnack: true,
        messageSnack: Utils.messages.LoginForm.loginFormRequired
      })
    }
    else if (this.state.password.trim().length < 8) {
      this.setState({
        openSnack: true,
        messageSnack: 'La contraseña debe ser igual o mayor a 8 caracteres.'
      })
    }
    else {
      let password = this.state.password
      let confirmPassword = this.state.confirmPassword
      if (password !== confirmPassword) {
        this.setState({
          openSnack: true,
          messageSnack: "Las contraseñas no coinciden."
        })
      }
      else {
        let data = {
          token: this.props.token,
          password: password
        }

        let response = await requestAPI({
          host: Utils.constants.HOST,
          resource: 'users',
          endpoint: '/password',
          method: 'PATCH',
          data: {
            data
          }
        })

        if (response.status === Utils.constants.status.SUCCESS) {
          this.props.history.push(Utils.constants.paths.home)
        }
        else {
          this.setState({
            openSnack: true,
            messageSnack: Utils.messages.General.error
          })
        }
      }
    }
  }

  handleChangePassword(event) {
    this.setState({password: event.target.value})
  }

  handleChangeConfirmPassword(event) {
    this.setState({confirmPassword: event.target.value})
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.setNewPassword()
    }
  }
  
  render() {
    const { classes } = this.props

    return (
      <form className={classes.loginForm} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
        <TextField
          label="Nueva contraseña"
          type="password"
          value={this.state.password}
          onChange={this.handleChangePassword}
          className={classes.textField}
          autoFocus
        />
        <TextField
          label="Confirmar nueva contraseña"
          type="password"
          value={this.state.confirmPassword}
          onChange={this.handleChangeConfirmPassword}
          className={classes.textField}
        />
        {
          (this.props.app.configs) ?
            <Button
              variant="contained"
              color="primary"
              className={classes.loginButton}
              onClick={() => { this.setNewPassword() }}
            >
              CONFIRMAR
            </Button>
            :
            ''
        }

        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          open={this.state.openSnack}
          onClose={this.handleClose}
          message={
            <span>
              {this.state.messageSnack}
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

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(NewPasswordForm)
