import React, { Component } from 'react'
import Link from 'next/link'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { TextField, Button, Typography } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import * as recoveryAction from '../modules/RecoveryPassword/recoveryAction'
const {recoverypass: recoverypassForm} = recoveryAction

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

class RecoveryPasswordForm extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      openSnack: false,
      messageSnack: '',
      email: ''
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleChangeEmail = this.handleChangeEmail.bind(this)
    this.sendEmail = this.sendEmail.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }


  handleClose() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  async sendEmail() {
    let email = this.state.email
    const {recoverypassForm} = this.props

    if (Utils.validateEmail(email)) {
      let response = await recoverypassForm(email)
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
      this.sendEmail()
    }
  }
  
  render() {
    const { classes } = this.props

    return (
      <form className={classes.loginForm} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
        <TextField
          label="Correo electrónico *"
          type="email"
          value={this.state.email}
          onChange={this.handleChangeEmail}
          className={classes.textField}
          autoFocus
        />
        {
          (this.props.app.data.configs) ?
            <Button
              variant="contained"
              color="primary"
              className={classes.loginButton}
              onClick={() => { this.sendEmail() }}
            >
              CONFIRMAR
            </Button>
            :
            ''
        }
        <div className={classes.containerFooter}>
          <Link href='/ingreso'>
            <a>
              <Typography color="primary" variant="body1">Ingresar</Typography>
            </a>
          </Link>
        </div>
        
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

const mapStateToProps = ({app}) => ({app})

const mapDispatchToProps = {
  recoverypassForm
}
export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(RecoveryPasswordForm)
