import React, { Component } from 'react'
import Link from 'next/link'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { TextField, Button, Typography, Grid, Checkbox, FormControlLabel } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import ValidationSMSModal from './ValidationSMSModal'
import * as signUpAction from './../modules/SignUp/signUpAction'
import { emailTrackingCode } from '../resources/classes/retailrocket.js'

const { signupCreateSession } = signUpAction

const styles = theme => ({
  signUpForm: {
    margin: '0 auto',
    backgroundColor: theme.palette.background.secondary,
    padding: "16px 32px"
  },
  textField: {
    width: '100%',
    marginTop: 8
  },
  signUpButton: {
    width: '100%',
    marginTop: 16,
    fontWeight: 600,
    fontSize: 14
  },
  containerFooter: {
    marginTop: 32,
    textAlign: 'center'
  },
  dateInput: {
    width: '25%',
    marginRight: '24px',
    [theme.breakpoints.down('xs')]: {
      margin: '0px',
      width: '30%'
    }
  }
})

class SignUpForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      openSnack: false,
      messageSnack: '',
      name: '',
      firstLastName: '',
      secondLastName: '',
      email: '',
      cellphone: '',
      password: '',
      confirmPassword: '',
      gender: null,
      years: [],
      months: [],
      monthDays: [],
      selectedDay: '',
      selectedMonth: '',
      selectedYear: '',
      newsletter: false,
      recoveryPasswordMessage: 'Correo electrónico en uso.',
      loginLoading: false
    }

    this.handleChangeMonth = this.handleChangeMonth.bind(this)
    this.getDate = this.getDate.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.createAccount = this.createAccount.bind(this)
    this.handleChangeValue = this.handleChangeValue.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  handleChangeMonth(flag = false, month = this.state.selectedMonth) {
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
      { name: 'Diciembre', index: 12 }
    ]

    let selectedMonth = null
    if (!flag) {
      if (this.state.selectedMonth !== null) {
        selectedMonth = month
      } else {
        selectedMonth = months[0]
      }
    } else {
      selectedMonth = months[month]
    }

    if (this.state.selectedYear !== null) {
      for (var j = 1; j < (new Date(parseInt(this.state.selectedYear), selectedMonth.index, 0).getDate()) + 1; j++) {
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

  async getDate(birthday) {
    let selectedDay = null
    let selectedMonth = null
    let selectedYear = null

    var birthday = null
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

    for (var i = (new Date()).getFullYear() - 18; i > 1900; i --) {
      years.push(i)
    }

    for (var j = 1; j < (new Date(2000, 1, 0).getDate()) + 1; j++) {
      monthDays.push(j)
    }

    if (birthday !== null) {
      selectedDay = parseInt(birthday.substring(8, 10))
      selectedMonth = parseInt(birthday.substring(5, 7))
      selectedYear = parseInt(birthday.substring(0, 4))

      months.map((month) => {
        if (month.index === selectedMonth) {
          selectedMonth = month
        }
      })
    }

    this.setState({
      years: years,
      monthDays: monthDays,
      months: months,
      selectedDay: selectedDay,
      selectedMonth: selectedMonth,
      selectedYear: selectedYear
    })
  }

  componentDidMount() {
    this.getDate()
    let message = 'verifique que todos los campos sean llenados correctamente'
    if (this.props.signUp.token !== '') {
      //localStorage.setItem(Utils.constants.localStorage.USER, JSON.stringify(response.data.user))
      Router.push('/')
    }
    else {
      if (this.props.signUp.errorSession !== '') {
        message = this.state.recoveryPasswordMessage
        this.setState({
          openSnack: true,
          messageSnack: message
        })
      }
    }
  }

  handleClose() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  async createAccount() {
    const self = this

    this.setState({
      loginLoading: true
    })

    if (this.state.name.trim() === "" || this.state.firstLastName.trim() === "" || this.state.email.trim() === "" || this.state.password.trim() === "" || this.state.confirmPassword.trim() === "") {
      this.setState({
        loginLoading: false,
        openSnack: true,
        messageSnack: 'Captura los campos marcados como obligatorios (*)'
      })
      return
    }

    if (Utils.checkSpecialCharacters(this.state.name)) {
      this.setState({
        loginLoading: false,
        openSnack: true,
        messageSnack: 'El nombre no debe contener caracteres especiales.'
      })
      return
    }

    if (Utils.checkSpecialCharacters(this.state.firstLastName)) {
      this.setState({
        loginLoading: false,
        openSnack: true,
        messageSnack: 'El primer apellido no debe contener caracteres especiales.'
      })
      return
    }

    if (!Utils.isEmpty(this.state.secondLastName.trim()) && Utils.checkSpecialCharacters(this.state.secondLastName)) {
      this.setState({
        loginLoading: false,
        openSnack: true,
        messageSnack: 'El segundo apellido no debe contener caracteres especiales.'
      })
      return
    }

    if (this.state.password !== this.state.confirmPassword) {
      this.setState({
        loginLoading: false,
        openSnack: true,
        messageSnack: 'Las contraseñas no coinciden.'
      })
      return
    }
    
    if (!Utils.validateEmail(this.state.email)) {
      this.setState({
        loginLoading: false,
        openSnack: true,
        messageSnack: 'Email incorrecto.'
      })
      return
    }

    if (Utils.validateEmail(this.state.email)) {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'users',
        endpoint: '/check-email',
        data: {
          email: this.state.email
        }
      })
  
      let error = false
      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.exist) {
          error = true
        }
      } else {
        error = true
      }

      if (error) {
        this.setState({
          loginLoading: false,
          openSnack: true,
          messageSnack: 'El correo electrónico ingresado ya se encuentra en uso. Por favor, intenta de nuevo con otro.'
        })
        return
      }
    }

    if (this.state.gender === null) {
      this.setState({
        loginLoading: false,
        openSnack: true,
        messageSnack: 'Selecciona tu sexo.'
      })
      return
    }

    let month = ''
    let day = ''
    if (Utils.isEmpty(this.state.selectedDay) || Utils.isEmpty(this.state.selectedMonth) || Utils.isEmpty(this.state.selectedYear)) {
      this.setState({
        loginLoading: false,
        openSnack: true,
        messageSnack: 'Selecciona tu fecha de cumpleaños.'
      })
      return
    } else {
      if (this.state.selectedMonth.index !== undefined) {
        if (this.state.selectedMonth.index < 9) {
          month = '0' + this.state.selectedMonth.index
        } else {
          month = this.state.selectedMonth.index
        }
      }

      if (!Utils.isEmpty(this.state.selectedDay)) {
        if (this.state.selectedDay < 9) {
          day = '0' + this.state.selectedDay
        } else {
          day = this.state.selectedDay
        }
      }
    }

    let birthday = this.state.selectedYear + '-' + month + '-' + day
    let age = Utils.getAge(birthday)
    if (age < 18 || age > 90) {
      this.setState({
        loginLoading: false,
        openSnack: true,
        messageSnack: 'Edad inválida (rango: 18 - 90 años).'
      })
      return
    }

    if (!this.state.validateCellphone) {
      this.setState({
        loginLoading: false,
        openValidationSMS: true
      })
      return
    }

    const { signupCreateSession } = this.props;
    const res = await signupCreateSession({
      data: {
        name: this.state.name,
        firstLastName: this.state.firstLastName,
        secondLastName: this.state.secondLastName,
        email: this.state.email,
        cellphone: this.state.cellphone,
        password: this.state.password,
        gender: this.state.gender,
        birthday: birthday,
        newsletter: this.state.newsletter,
        code: this.state.code
      }, uuid: this.props.app.data.uuid
    })

    if (res.data.created) {
      this.setState({
        loginLoading: false
      }, () => {
        Router.push(`/ingreso?email=${self.state.email}`)
      })

      //RETAIL ROCKET
      emailTrackingCode(self.state.email)



    } else {
      this.setState({
        loginLoading: false,
        openSnack: true,
        messageSnack: 'Las contraseñas no coinciden.'
      })
    }
  }

  handleChangeValue(event, param) {
    this.setState({ [param]: event.target.value })
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.createAccount()
    }
  }

  render() {
    const self = this
    const { classes } = this.props

    return (
      <form className={classes.signUpForm} autoComplete="off" onKeyPress={this.handleKeyPress}>
        <TextField
          label="Nombre *"
          type="text"
          value={this.state.name}
          onChange={(event) => { this.handleChangeValue(event, 'name') }}
          className={classes.textField}
          autoFocus
        />
        <TextField
          label="Primer apellido *"
          type="text"
          value={this.state.firstLastName}
          onChange={(event) => { this.handleChangeValue(event, 'firstLastName') }}
          className={classes.textField}
        />
        <TextField
          label="Segundo apellido"
          type="text"
          value={this.state.secondLastName}
          onChange={(event) => { this.handleChangeValue(event, 'secondLastName') }}
          className={classes.textField}
        />
        <TextField
          label="Correo electrónico *"
          type="email"
          value={this.state.email}
          onChange={(event) => { this.handleChangeValue(event, 'email') }}
          className={classes.textField}
        />
        <TextField
          label="Contraseña *"
          type="password"
          value={this.state.password}
          onChange={(event) => { this.handleChangeValue(event, 'password') }}
          className={classes.textField}
        />
        <TextField
          label="Confirmar contraseña *"
          type="password"
          value={this.state.confirmPassword}
          onChange={(event) => { this.handleChangeValue(event, 'confirmPassword') }}
          className={classes.textField}
        />
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ textAlign: 'left' }}>
          <div style={{ width: '100%', marginTop: 16 }}>
            <Typography className={classes.cardTitle}><heavy>Sexo</heavy></Typography>
          </div>
          <div>
            <FormControlLabel
              control={<Checkbox colorPrimary="#283a78" />}
              label="Mujer"
              checked={this.state.gender === 1}
              onChange={() => this.setState({
                gender: 1
              })}
              labelPlacement="end"
            />
            <FormControlLabel
              control={<Checkbox colorPrimary="#283a78" />}
              label="Hombre"
              checked={this.state.gender === 2}
              onChange={() => this.setState({
                gender: 2
              })}
              labelPlacement="end"
            />
            <FormControlLabel
              control={<Checkbox colorPrimary="#283a78" />}
              label="Otro"
              checked={this.state.gender === 3}
              onChange={() => this.setState({
                gender: 3
              })}
              labelPlacement="end"
            />
          </div>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ textAlign: 'left' }}>
          <div style={{ width: '100%', marginTop: 16, marginBottom: 8 }}>
            <Typography className={classes.cardTitle}><heavy>Fecha de cumpleaños</heavy></Typography>
          </div>
          <div className={classes.dateContainer}>
            <TextField
              className={classes.dateInput}
              label="Día"
              onChange={(event) => this.setState({
                selectedDay: event.target.value
              })}
              select
              SelectProps={{
                native: true
              }}
              value={this.state.selectedDay}
              variant="outlined">
              <option value={null}>
                Selecciona un día
              </option>
              {
                (this.state.monthDays.map((day, index) => {
                  return (
                    <option key={index} value={day}>
                      {day}
                    </option>
                  )
                }))
              }
            </TextField>
            <TextField
              className={classes.dateInput}
              label="Mes"
              onChange={(event) => this.handleChangeMonth(true, event.target.value)}
              select
              SelectProps={{
                native: true
              }}
              value={(this.state.selectedMonth !== null) ? (this.state.selectedMonth.index - 1) : ''}
              variant="outlined">
              <option value={null}>
                Selecciona un mes
              </option>
              {
                (this.state.months.map((month) => {
                  return (
                    <option key={month.index - 1} value={month.index - 1}>
                      {month.name}
                    </option>
                  )
                }))
              }
            </TextField>
            <TextField
              className={classes.dateInput}
              label="Año"
              onChange={(event) => this.setState({
                selectedYear: event.target.value
              }, () => this.handleChangeMonth())}
              select
              SelectProps={{
                native: true
              }}
              value={this.state.selectedYear}
              variant="outlined">
              <option value={null}>
                Selecciona un año
              </option>
              {
                (this.state.years.map((year, index) => {
                  return (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  )
                }))
              }
            </TextField>
          </div>
        </Grid>
        <Grid container style={{ marginTop: 16, marginBottom: 16 }}>
          <Grid item lg={1} md={1} sm={1} xs={1} style={{ margin: 0, padding: 0 }}>
            <Checkbox
              value={this.state.newsletter}
              onChange={() => {
                self.setState({
                  newsletter: !self.state.newsletter
                })
              }}
            />
          </Grid>
          <Grid item lg={10} md={10} sm={10} xs={10} style={{ textAlign: 'left', paddingLeft: 16, paddingTop: 12 }}>
            <Typography variant="body1">Suscribir al newsletter Calzzapato.com ®</Typography>
            <Typography variant="body2" style={{ fontSize: 11 }}>Aceptas recibir correos electrónicos a la dirección de correo proporcionada.</Typography>
          </Grid>
        </Grid>
        {
          (this.props.app.data.configs) ?
            <Button
              variant="contained"
              color="primary"
              className={classes.signUpButton}
              disabled={this.state.loginLoading}
              startIcon={this.state.loginLoading === true ? <img src='/loading.svg' style={{ width: '20px' }} /> : null}
              onClick={() => { this.createAccount() }}
            >
              CREAR CUENTA
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

        <ValidationSMSModal
          openDialog={this.state.openValidationSMS}
          title="Estás a un paso."
          description="Es necesario validar tu número celular para crear tu cuenta Calzzapato."
          newAccount={true}
          handleCloseValidationSMSModalWithSuccess={(cellphone, code) => {
            this.setState({ openValidationSMS: false, validateCellphone: true, cellphone: cellphone, code: code }, () => {
              self.createAccount()
            })
          }}
          handleCloseValidationSMSModal={(event) => {
            this.setState({ openValidationSMS: false })
          }}
        />

        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.state.openSnack}
          onClose={this.handleClose}
          message={
            <span>
              {this.state.messageSnack}
            </span>
          }
          action={[
            (this.state.messageSnack === this.state.recoveryPasswordMessage) ?
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => {
                  this.props.history.push(Utils.constants.paths.login + '?email=' + this.state.email)
                }}
              >
                <span style={{ fontSize: 14 }}>INICIAR SESIÓN</span>
              </IconButton>
              :
              '',
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

const mapStateToProps = ({ app, signUp }) => ({ app, signUp })

const mapDispatchToProps = {
  signupCreateSession
}


export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(SignUpForm)
