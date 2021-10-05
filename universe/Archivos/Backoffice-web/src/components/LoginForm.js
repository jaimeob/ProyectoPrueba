import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { TextField, Button, Typography } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Utils
import Utils from '../resources/Utils'
import { requestLogin } from '../actions/actionOnboarding'
import { setBusinessUnit } from '../actions/actionConfigs'

const styles = theme => ({
  loginForm: {
    margin: '0 auto',
    backgroundColor: 'white',
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

class LoginForm extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      snackbar: {
        open: false,
        message: ''
      },
      email: '',
      password: ''
    }

    this.handleClose = this.handleClose.bind(this)
    this.login = this.login.bind(this)
    this.handleChangeEmail = this.handleChangeEmail.bind(this)
    this.handleChangePassword = this.handleChangePassword.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
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
    if (this.state.email.trim() === "" || this.state.password.trim() === "") {
      this.setState({
        snackbar: {
          open: true,
          message: Utils.messages.LoginForm.loginFormRequired
        }
      })
    }
    else {
      let email = this.state.email
      let password = this.state.password
      if (!Utils.validateEmail(email)) {
        this.setState({
          snackbar: {
            open: true,
            message: Utils.messages.LoginForm.invalidEmail
          }
        })
      }
      else if (password.trim().length <= 0) {
        this.setState({
          snackbar: {
            open: true,
            message: Utils.messages.LoginForm.invalidPassword
          }
        })
      }
      else {
        this.props.requestLogin({
          email: email,
          password: password
        })
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.onboarding.user !== this.props.onboarding.user) {
      if (this.props.onboarding.user.status === Utils.constants.status.SUCCESS) {
        this.props.setBusinessUnit(this.props.onboarding.user.data.accesses[0].name)
        this.props.history.push('/inicio')
      }
      else if (this.props.onboarding.user.status === Utils.constants.status.UNAUTHORIZED) {
        this.setState({
          snackbar: {
            open: true,
            message: Utils.messages.LoginForm.loginFormValidation
          }
        })
      }
      else {
        if (!Utils.isEmpty(this.props.onboarding.user)) {
          this.setState({
            snackbar: {
              open: true,
              message: Utils.messages.General.error
            }
          })
        }
      }
    }
  }

  handleChangeEmail(event) {
    this.setState({email: event.target.value})
  }

  handleChangePassword(event) {
    this.setState({password: event.target.value})
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.login()
    }
  }
  
  render() {
    const {snackbar: {open, message}} = this.state
    const { classes } = this.props

    return (
      <form className={classes.loginForm} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
        <TextField
          label={Utils.messages.LoginForm.placeholderEmail}
          type="email"
          value={this.state.email}
          onChange={this.handleChangeEmail}
          className={classes.textField}
          autoFocus/>
        <TextField
          label={Utils.messages.LoginForm.placeholderPassword}
          type="password"
          value={this.state.password}
          onChange={this.handleChangePassword}
          className={classes.textField}/>
        {
          (this.props.app.configs) ?
            <Button
              variant="contained"
              color="primary"
              className={classes.loginButton}
              onClick={() => { this.login() }}
            >
              {Utils.messages.LoginForm.loginButton}
            </Button>
            :
            ''
        }
     
        <div className={classes.containerFooter}>
          <Link to={{pathname: Utils.constants.paths.recoveryPassword}}>
            <a>
              <Typography color="primary" variant="body1"><strong>{Utils.messages.LoginForm.recoveryButton}</strong></Typography>
            </a>
          </Link>
        </div>
        
        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
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

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    requestLogin: (data) => {
      dispatch(requestLogin(data))
    },
    setBusinessUnit: (business) => {
      dispatch(setBusinessUnit(business))
    }
  }
}

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(LoginForm)
