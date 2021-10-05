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
import { requestAPI } from '../api/CRUD'
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
  confirmButton: {
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

class RecoveryPasswordForm extends Component {
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
    this.handleChangeEmail = this.handleChangeEmail.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.sendEmail = this.sendEmail.bind(this)
  }

  handleClose() {
    this.setState({
      snackbar: {
        open: false,
        message: this.state.snackbar.message
      }
    })
  }

  async sendEmail() {
    let email = this.state.email

    if (Utils.validateEmail(email)) {
      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: 'users',
        endpoint: '/recovery-password',
        data: {
          email
        }
      })

      console.log("Response", response)

      this.setState({ 
        openSnack: true,
        messageSnack: 'Revisa tu correo electrónico: ' + email,
        email: ''
      })
    } else {
      this.setState({
        openSnack: true,
        messageSnack: 'Correo electrónico inválido.'
      })
    }
  }

  handleChangeEmail(event) {
    this.setState({email: event.target.value})
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }
  
  render() {
    const {snackbar: {open, message}} = this.state
    const { classes } = this.props

    return (
      <form className={classes.loginForm} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
        <TextField
          label={Utils.messages.RecoveryPasswordForm.placeholderEmail}
          type="email"
          value={this.state.email}
          onChange={this.handleChangeEmail}
          className={classes.textField}
          autoFocus/>
        
        <Button variant="contained" color="primary" className={classes.confirmButton} onClick={() => {this.sendEmail()}}> {Utils.messages.RecoveryPasswordForm.confirmButton}</Button>

        <div className={classes.containerFooter}>
          <Link to={{pathname: Utils.constants.paths.home}}>
            <a>
              <Typography color="primary" variant="body1"><strong>{Utils.messages.RecoveryPasswordForm.login}</strong></Typography>
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
)(RecoveryPasswordForm)
