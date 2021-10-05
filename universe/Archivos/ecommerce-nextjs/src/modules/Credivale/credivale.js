import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { TextField, Button, Grid } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Components
import Title from '../../components/Title'
import { requestAPI } from '../../api/CRUD'

// Utils
import Utils from '../../resources/Utils'

const styles = theme => ({
  home: {
    margin: "0 auto",
    marginTop: 48,
    marginBottom: 32,
    textAlign: 'center',
    [theme.breakpoints.down('lg')]: {
      width: "35%"
    },
    [theme.breakpoints.down('md')]: {
      width: "45%"
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 48,
      width: "60%"
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 48,
      width: '95%'
    }
  },
  validateForm: {
    backgroundColor: theme.palette.background.secondary,
    padding: "32px"
  },
  textField: {
    width: '100%',
    marginTop: 8
  },
  validateButton: {
    width: '100%',
    marginTop: 16,
    fontWeight: 600,
    fontSize: 14
  }
})

class ValidateCrediVale extends Component {
  constructor(props) {
    super(props)
    this.state = {
      snackbar: {
        open: false,
        message: ''
      },
      folio: '',
      amount: ''
    }

    this.handleClose = this.handleClose.bind(this)
    this.validate = this.validate.bind(this)
    this.handleChangeFolio = this.handleChangeFolio.bind(this)
    this.handleChangeAmount = this.handleChangeAmount.bind(this)
  }

  componentWillMount() {
    //Utils.scrollTop()
  }

  handleClose() {
    this.setState({
      snackbar: {
        open: false,
        message: this.state.snackbar.message
      }
    })
  }

  async validate() {
    if (this.state.folio.trim() === "" || this.state.amount.trim() === "") {
      this.setState({
        snackbar: {
          open: true,
          message: 'Todos los datos son necesarios.'
        }
      })
    } else {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'credivales',
        endpoint: '/validate',
        data: {
          folio: this.state.folio,
          amount: this.state.amount
        }
      })

      this.setState({
        snackbar: {
          open: true,
          message: response.data.message
        }
      })
    }
  }

  handleChangeFolio(event) {
    this.setState({ folio: event.target.value })
  }

  handleChangeAmount(event) {
    this.setState({ amount: event.target.value })
  }

  render() {
    const { classes } = this.props
    const { snackbar: { open, message } } = this.state

    return (
      <div>
        <Grid container
          justify="center"
          alignItems="center"
          className={classes.home}>
          <Grid item lg={12}>
            <Title
              title="Validar CrediVale ®"
              description="Valida tu CrediVale de Grupo Calzzapato." 
            />
            <br />
            <form className={classes.validateForm} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
              <TextField
                label="Folio"
                type="text"
                value={this.state.folio}
                onChange={this.handleChangeFolio}
                className={classes.textField}
                autoFocus
              />
              <TextField
                label="Monto "
                type="number"
                value={this.state.amount}
                onChange={this.handleChangeAmount}
                className={classes.textField}
              />
              {
                // (this.props.app.configs) ?
                (true)?
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.validateButton}
                    onClick={() => { this.validate() }}
                  >
                    Validar
                  </Button>
                  :
                  ''
              }
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
          </Grid>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(withStyles(styles),connect(mapStateToProps))(ValidateCrediVale)
