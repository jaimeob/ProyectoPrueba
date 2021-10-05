import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { TextField, Button, Grid, Typography, Icon } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Components
import { getDataAPI, requestAPI } from '../../api/CRUD'

// Utils
import Utils from '../../resources/Utils'
import { Router } from 'next/router'

const styles = theme => ({
  home: {
    margin: "0 auto",
    paddingTop: 48,
    textAlign: 'left',
    width: '50%',
    height: 450,
    paddingBottom: 300,
    [theme.breakpoints.down('md')]: {
      width: "65%",
      height: 450,
    },
    [theme.breakpoints.down('sm')]: {
      width: "90%"
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      height: 440
    }
  },
  containerLogoCrediVale: {
    width: '100%', textAlign: 'right',
    margin: '0 auto',
    textAlign: 'center'
  },
  logoCrediVale: {
    width: '20%'
  },
  containerTitle: {
    marginTop: 32,
    textAlign: 'center',
    marginBottom: 24
  },
  validateForm: {
    backgroundColor: theme.palette.background.secondary,
    padding: 36,
    margin: '0 auto',
    marginTop: 36,
    width: '80%',
    boxShadow: '-1px 3px 17px -8px rgba(0,0,0,0.75);',
    [theme.breakpoints.down('xs')]: {
      padding: 36,
      paddingTop: 48,
      top: 460,
      width: '100%'
    }
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
  },
  listContainer: {
    width: '100%',
    textAlign: 'center',
    marginTop: 0,
    paddingTop: 0
  },
  itemList: {
    color: 'white',
    padding: 8
  },
  dateInput: {
    marginRight: 12
  }
})

class RequestCrediValeView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      snackbar: {
        open: false,
        message: ''
      },
      years: [],
      months: [],
      monthDays: [],
      selectedDay: '',
      selectedMonth: '',
      selectedYear: '',
      values: {
        name: '',
        firstLastName: '',
        secondLastName: '',
        zip: '',
        cityCode: '',
        cityName: '',
        stateCode: '',
        stateName: '',
        email: '',
        cellphone: ''
      }
    }

    this.handleClose = this.handleClose.bind(this)
    this.validate = this.validate.bind(this)
    this.handleChangeFolio = this.handleChangeFolio.bind(this)
    this.handleChangeAmount = this.handleChangeAmount.bind(this)
    this.getDate = this.getDate.bind(this)
    this.handleChangeMonth = this.handleChangeMonth.bind(this)
    this.handleChangeValues = this.handleChangeValues.bind(this)
    this.checkZip = this.checkZip.bind(this)
  }

  handleChangeValues(param, event) {
    let values = this.state.values
    if (param === 'zip') {
      if (event.target.value.trim().length > 5 || isNaN(event.target.value))
        return
    }
    values[param] = event.target.value
    this.setState({
      values: values
    })
    if (param === 'zip') {
      this.checkZip()
    }
  }

  async checkZip() {
    let values = this.state.values
    if (Utils.isNumeric(Number(values['zip']))) {
      if (values['zip'].trim().length === 5) {
        let response = await getDataAPI({
          host: Utils.constants.CONFIG_ENV.HOST,
          resource: 'locations',
          filters: {
            where: {
              zip: values['zip']
            },
            include: ["state", "municipality", "type"]
          }
        })
        if (response.data.length > 0) {
          values.stateCode = response.data[0].state.code
          values.stateName = response.data[0].state.name
          values.cityCode = response.data[0].municipality.code
          values.cityName = response.data[0].municipality.name
          this.setState({
            locations: response.data,
            values: values
          })
        }
      }
      else {
        values.stateCode = ''
        values.stateName = ''
        values.cityCode = ''
        values.cityName = ''
        this.setState({
          locations: [],
          values: values
        })
      }
    }
    else {
      values.stateCode = ''
      values.stateName = ''
      values.cityCode = ''
      values.cityName = ''
      this.setState({
        locations: [],
        values: values
      })
    }
  }

  async getDate() {
    let selectedDay = ''
    let selectedMonth = ''
    let selectedYear = ''

    let monthDays = []
    let months = [
      { name: 'Enero', index: 1 },
      { name: 'Febrero', index: 2 },
      { name: 'Marzo', index: 3 },
      { name: 'Abril', index: 4 },
      { name: 'Mayo', index: 5 },
      { name: 'Junio', index: 6 },
      { name: 'Julio', index: 7 },
      { name: 'Agosto', index: 8 },
      { name: 'Septiembre', index: 9 },
      { name: 'Octubre', index: 10 },
      { name: 'Noviembre', index: 11 },
      { name: 'Diciembre', index: 12 }]
    let years = []

    for (var i = 1940; i < (new Date()).getFullYear() + 1; i++) {
      years.push(i)
    }

    for (var j = 1; j < (new Date(2000, 1, 0).getDate()) + 1; j++) {
      monthDays.push(j)
    }

    this.setState({
      years: years,
      monthDays: monthDays,
      months: months,
      selectedDay: 1,
      selectedMonth: months[0],
      selectedYear: 1940
    })
  }

  handleChangeMonth(month = this.state.selectedMonth) {
    let monthDays = []
    let months = [
      { name: 'Enero', index: 1 },
      { name: 'Febrero', index: 2 },
      { name: 'Marzo', index: 3 },
      { name: 'Abril', index: 4 },
      { name: 'Mayo', index: 5 },
      { name: 'Junio', index: 6 },
      { name: 'Julio', index: 7 },
      { name: 'Agosto', index: 8 },
      { name: 'Septiembre', index: 9 },
      { name: 'Octubre', index: 10 },
      { name: 'Noviembre', index: 11 },
      { name: 'Diciembre', index: 12 }]

    let selectedMonth = month
    if (selectedMonth.index === undefined) {
      selectedMonth = months[month]
    }

    if (this.state.selectedYear !== null) {
      for (var j = 1; j < (new Date(parseInt(this.state.selectedYear) + 1, selectedMonth.index, 0).getDate()) + 1; j++) {
        monthDays.push(j)
      }
    } else {
      for (var k = 1; k < (new Date(2000, selectedMonth.index, 0)) + 1; k++) {
        monthDays.push(k)
      }
    }

    this.setState({
      selectedMonth: selectedMonth,
      monthDays: monthDays
    })
  }

  componentWillMount() {
    Utils.scrollTop()
    this.getDate()
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
    if (Utils.isEmpty(this.state.values.name.trim())) {
      this.setState({
        snackbar: {
          open: true,
          message: 'El nombre es obligatorio.'
        }
      })
      return
    }

    if (Utils.isEmpty(this.state.values.firstLastName.trim())) {
      this.setState({
        snackbar: {
          open: true,
          message: 'El primer apellido es obligatorio.'
        }
      })
      return
    }

    if (Utils.isEmpty(this.state.values.cityCode.trim())) {
      this.setState({
        snackbar: {
          open: true,
          message: 'Es necesario indicar tu residencia actual por medio del código postal.'
        }
      })
      return
    }

    if (Utils.isEmpty(this.state.values.email.trim())) {
      this.setState({
        snackbar: {
          open: true,
          message: 'El correo electrónico es obligatorio.'
        }
      })
      return
    }

    if (!Utils.validateEmail(this.state.values.email.trim())) {
      this.setState({
        snackbar: {
          open: true,
          message: 'El correo electrónico es incorrecto.'
        }
      })
      return
    }

    if (Utils.isEmpty(this.state.values.cellphone.trim())) {
      this.setState({
        snackbar: {
          open: true,
          message: 'El número celular es obligatorio.'
        }
      })
      return
    }

    if (isNaN(this.state.values.cellphone.trim()) || this.state.values.cellphone.trim().length === 10) {
      this.setState({
        snackbar: {
          open: true,
          message: 'El número celular debe ser un número de 10 dígitos.'
        }
      })
      return
    }

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'POST',
      resource: 'credivales',
      endpoint: '/request',
      data: {
        name: this.state.values.name,
        firstLastName: this.state.values.firstLastName,
        secondLastName: this.state.values.secondLastName,
        birthday: this.state.selectedDay + '-' + this.state.selectedMonth.index + '-' + this.state.selectedYear,
        location: this.state.values.cityCode + '' + this.state.values.stateCode,
        email: this.state.values.email,
        cellphone: this.state.values.cellphone
      }
    })

    let success = false
    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.success) {
        this.setState({
          snackbar: {
            open: true,
            message: 'Solicitud registrada exitósamente.'
          }
        }, () => {
          Router.push('/espera-nuestra-llamada')
        })
      }
    }

    if (!success) {
      this.setState({
        snackbar: {
          open: true,
          message: 'Ocurrió un problema, no se pudo registrar tu solicitud. Inténtalo de nuevo más tarde.'
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
      <div style={{ background: '#1C3767' }}>
        <hr style={{ border: 'none', backgroundColor: '#D90E25', height: 4, margin: 0 }} />
        <hr style={{ border: 'none', backgroundColor: 'white', height: 4, margin: 0 }} />
        <Grid container
          justify="center"
          alignItems="center"
          className={classes.home}
        >
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} >
              <div className={classes.containerLogoCrediVale} >
                <img className={classes.logoCrediVale} src='./credivale.svg' />
              </div>
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.containerTitle}>
              <Typography variant="h1" style={{ color: 'white', fontSize: 28 }}>¡Listo, recibimos tu solicitud!</Typography>
              <Typography variant="body1" style={{ color: 'white', fontSize: 16 }}>Un asesor de comunicará contigo en las próximas horas.</Typography>
            </Grid>
          </Grid>
          <Grid container>
            <form className={classes.validateForm} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
              <div style={{ textAlign: 'center' }}>
                <Typography variant="h6">Siguiente paso.</Typography>
                <Typography variant="body2">Recuerda tener a la mano la siguiente información.</Typography>
              </div>
              <br />
              <ul>
                <li><Typography variant="body1">Comprobante de ingresos vigente</Typography></li>
                <li><Typography variant="body1">2 referencias familiares (nombre, dirección y teléfono)</Typography></li>
              </ul>
              <br />
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <span style={{ textAlign: 'center', color: 'gray', fontWeight: 100, fontSize: 13 }}>
                  <Icon style={{ color: 'green', fontSize: 24, marginBottom: -8 }}>lock</Icon> Tus datos están 100% seguros y encriptados.
                  <img style={{ height: 24, marginLeft: 16, marginBottom: -8 }} src='./secure.png' />
                </span>
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
          </Grid>
          <footer style={{ marginTop: 28, height: 64, width: '100%', textAlign: 'center', fontWeight: 100, fontSize: 13 }}>
            <Typography variant="body1" style={{ fontSize: 16 }}><a href={"https://" + document.domain}>Ir a {document.domain}</a></Typography>
            <p>® {new Date().getFullYear()} CrediVale - Todos los derechos reservados.</p>
          </footer>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(withStyles(styles),connect(mapStateToProps))(RequestCrediValeView)
