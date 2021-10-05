import React, { Component } from 'react'

import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Button, InputAdornment, Grid, Snackbar, Typography, TextField } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import MailOutlineIcon from '@material-ui/icons/MailOutline'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({
  blockContainer: {
    backgroundColor: theme.palette.primary.main,
    padding: '32px',
    paddingLeft: 48
  },
  blockTitle: {
    width: '90%',
    textAlign: 'left',
    fontSize: 32,
    color: 'white'
  },
  blockDescription: {
    width: '90%',
    textAlign: 'left',
    fontSize: 16,
    fontWeight: 300,
    color: 'white'
  },
  textField: {
    width: '100%',
    backgroundColor: 'white'
  }
})

class NewsletterBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      openSnack: false,
      messageSnack: ''
    }

    this.subscribeToNewsletter = this.subscribeToNewsletter.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this)
  }

  async subscribeToNewsletter() {
    if (!Utils.validateEmail(this.state.email)) {
      this.setState({
        messageSnack: 'Correo electrónico inválido.',
        openSnack: true
      })
      return
    }

    let register = await requestAPI ({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: 'subscribers',
      method: 'POST',
      endpoint: '/newsletter',
      data: {
        email: this.state.email
      }
    })

    if (register.status === Utils.constants.status.SUCCESS) {
      this.setState({
        email: '',
        messageSnack: 'Gracias por registrarte al newsletter de Calzzapato.com',
        openSnack: true
      })
    }
  }

  handleCloseSnackbar() {
    this.setState({
      messageSnack: '',
      openSnack: false
    })
  }

  handleTextFieldChange(event) {
    this.setState({
      email: event.target.value
    })
  }

  render() {
    const { classes } = this.props

    return (
      <Grid container className={classes.blockContainer}>
        <Grid item lg={7} md={7} sm={12} xs={12}>
          <Typography variant="h2" className={classes.blockTitle}>
            {this.props.title}
          </Typography>
          <Typography variant="body2" className={classes.blockDescription}>
            {this.props.description}
          </Typography>
        </Grid>
        <Grid item lg={5} md={5} sm={12} xs={12}>
          <TextField
            variant="filled"
            type="text"
            label="Newsletter Calzzapato.com"
            placeholder="Ingresa tu correo electrónico..."
            className={classes.textField}
            value={this.state.email}
            onChange={this.handleTextFieldChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon style={{opacity: 0.5}}/>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button variant="contained" color="primary" onClick={this.subscribeToNewsletter}>
                    SUSCRIBIRSE
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            autoHideDuration={5000}
            message={this.state.messageSnack}
            onClose={this.handleCloseSnackbar}
            open={this.state.openSnack}
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
        </Grid>
      </Grid>
    )
  }
}

export default compose(
  withStyles(styles)
)(NewsletterBlock)
