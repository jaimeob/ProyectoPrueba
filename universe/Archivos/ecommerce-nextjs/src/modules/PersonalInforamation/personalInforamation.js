import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Hidden, Typography, TextField, FormControlLabel, Checkbox, Button, InputLabel, FormControl, OutlinedInput } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'


// Utils
import Utils from '../../resources/Utils'

import { requestAPI } from '../../api/CRUD'
import Router from 'next/router'

// Components
import MyAccountMenu from '../../components/MyAccountMenu'
import ValidationSMSModal from '../../components/ValidationSMSModal'

const styles = theme => ({
  root: {
    width: '100%',
    padding: '16px 0px 32px 0px',
    minHeight: 500,
    backgroundColor: "#F4F4F4"
  },
  container: {
    padding: '100px 32px 32px 0px',
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
      padding: '16px 16px 16px 16px',
    },
    [theme.breakpoints.down('xs')]: {
      padding: '16px 16px 16px 16px',
    }
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    padding: 20,
    [theme.breakpoints.down('xs')]: {
      padding: 12
    }
  },
  cardHeader: {
    paddingBottom: 24
  },
  cardTitle: {
    fontSize: 24,
    color: '#000000',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#000000'
  },
  title: {
    width: '100%',
    fontSize: '36px',
    color: '#000000',
    [theme.breakpoints.down('sm')]: {
      margin: '8px 0px 8px 0px'
    }
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(0, 0, 0, 0.54)",
    [theme.breakpoints.down('xs')]: {
      fontSize: 16
    }
  },
  textInput: {
    width: '100%',
    // padding: theme.spacing(2)
  },
  dateInput: {
    width: '100%',
    // padding: theme.spacing(2)
  },
  primaryButton: {
    width: 'auto',
    padding: 'auto 32px auto 32px',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      padding: 'auto 0px auto 0px'
    }
  },
  secondaryButton: {
    width: 'auto',
    backgroundColor: "white",
    border: "2px solid #283A78",
    color: "#283A78",
    padding: 'auto 32px auto 32px',
    margin: '0px 16px 0px 0px',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      padding: 'auto 0px auto 0px',
      margin: '0px 0px 16px 0px'
    }
  }
})

class PersonalInformation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      name: '',
      firstLastName: '',
      secondLastName: '',
      email: '',
      cellphone: '',
      code: '',
      gender: null,
      size: '',
      years: [],
      months: [],
      monthDays: [],
      selectedDay: '',
      selectedMonth: '',
      selectedYear: '',
      newsletter: false,
      validateCellphone: false,
      openSnack: false
    }

    this.updateUser = this.updateUser.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
  }

  async componentWillMount() {
    const self = this
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      this.setState({
        user: user,
        name: user.name,
        firstLastName: user.firstLastName,
        secondLastName: user.secondLastName,
        gender: user.genderId,
        email: user.email,
        cellphone: user.cellphone,
        newsletter: user.newsletter,
        validateCellphone: user.validationCellphone
      })
      this.getDate()
    } else {
      Router.push(Utils.constants.paths.login)
    }
  }

  async getDate(birthday) {
    let selectedDay = null
    let selectedMonth = null
    let selectedYear = null

    var birthday = this.state.user.birthday
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

    for (var i = 1900; i < (new Date()).getFullYear() + 1; i++) {
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

  async updateUser() {
    let selectedDay = ""

    if (this.state.selectedDay > 10) {
      selectedDay = this.state.selectedDay
    } else {
      selectedDay = "0" + this.state.selectedDay
    }

    let selectedMonth = ""

    if (this.state.selectedMonth.index > 10) {
      selectedMonth = this.state.selectedMonth.index
    } else {
      selectedMonth = "0" + this.state.selectedMonth.index
    }

    if (this.state.validateCellphone) {
      let messageError = ''

      if (Utils.isEmpty(this.state.name)) {
        messageError = 'El nombre es obligatorio.'
      } else if (Utils.isEmpty(this.state.firstLastName)) {
        messageError = 'El primer apellido es obligatorio.'
      } else if (Utils.isEmpty(this.state.gender)) {
        messageError = 'El sexo es obligatorio.'
      } else if (Utils.isEmpty(this.state.birthday)) {
        messageError = 'La fecha de cumpleaños es obligatoria.'
      }
    } else {
      this.setState({
        openValidationSMS: true
      }, () => {
        return
      })
    }

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'PUT',
      resource: 'users',
      endpoint: '/update-info',
      data: {
        name: this.state.name,
        firstLastName: this.state.firstLastName,
        secondLastName: this.state.secondLastName,
        cellphone: this.state.cellphone,
        code: this.state.code,
        genderId: this.state.gender,
        validateCellphone: this.state.validateCellphone,
        newsletter: this.state.newsletter,
        birthday: this.state.selectedYear + "-" + selectedMonth + "-" + selectedDay
      }
    })

    if (response.status === Utils.constants.status.SUCCESS && response.data !== null) {
      this.handleCloseSnackbar()
    }
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: !this.state.openSnack
    })
  }

  render() {
    const self = this
    const { classes } = this.props

    return (
      (this.state.redirect === true) ?
        <Redirect to={Utils.constants.paths.signUp} />
        :
        <Grid container className={classes.root}>
          <Hidden smDown>
            <Grid item md={4}>
              <MyAccountMenu text={"Información personal"} />
            </Grid>
          </Hidden>
          <Grid container item md={8} xs={12} className={classes.container} alignContent="flex-start">
            <Grid spacing={2} container item xs={12} className={classes.cardContainer}>
              <Grid item xs={12} className={classes.cardHeader}>
                <Typography className={classes.cardTitle}><heavy>Nombre completo</heavy></Typography>
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  value={this.state.name}
                  className={classes.textInput}
                  label="Nombre *"
                  placeholder="Ingresa tu nombre aquí (obligatorio)..."
                  variant="outlined"
                  onChange={(event) => { this.setState({ name: event.target.value }) }}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item sm={6} xs={12} >
                <TextField
                  value={this.state.firstLastName}
                  className={classes.textInput}
                  label="Primer apellido *"
                  placeholder="Ingresa tu primer apellido aquí (obligatorio)..."
                  variant="outlined"
                  onChange={(event) => { this.setState({ firstLastName: event.target.value }) }} />
              </Grid>
              <Grid item sm={6} xs={12} >
                {/* <FormControl variant="outlined" className={classes.textInput}>
                  <InputLabel shrink>Segundo apellido</InputLabel>
                  <OutlinedInput 
                    value={this.state.secondLastName}
                    placeholder="Ingresa tu segundo apellido aquí (opcional)..."
                    onChange={(event) => { this.setState({ secondLastName: event.target.value })}} />
                </FormControl> */}
                <TextField
                  value={this.state.secondLastName}
                  className={classes.textInput}
                  label="Segundo apellido *"
                  placeholder="Ingresa tu segundo apellido aquí (opcional)..."
                  variant="outlined"
                  onChange={(event) => { this.setState({ secondLastName: event.target.value })}} />
                  </Grid>
            </Grid>

            <Grid container spacing={2} item xs={12} className={classes.cardContainer}>
              <Grid item xs={12} className={classes.cardHeader}>
                <Typography className={classes.cardTitle}><heavy>Información de contacto</heavy></Typography>
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  value={this.state.email}
                  className={classes.textInput}
                  label="Email*"
                  variant="outlined"
                  disabled={true}
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <TextField
                  value={this.state.cellphone}
                  className={classes.textInput}
                  label="Número celular *"
                  variant="outlined"
                  disabled={this.state.validateCellphone}
                  onChange={(event) => { this.setState({ cellphone: event.target.value }) }} />
              </Grid>
            </Grid>

            <Grid container item xs={12} className={classes.cardContainer}>
              <Grid item xs={12} className={classes.cardHeader}>
                <Typography className={classes.cardTitle}><heavy>Sexo</heavy></Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox colorPrimary="#283a78" />}
                  label="Mujer"
                  checked={this.state.gender === 1}
                  onChange={() => this.setState({ gender: 1 })}
                  labelPlacement="end" />

                <FormControlLabel
                  control={<Checkbox colorPrimary="#283a78" />}
                  label="Hombre"
                  checked={this.state.gender === 2}
                  onChange={() => this.setState({ gender: 2 })}
                  labelPlacement="end" />

                <FormControlLabel
                  control={<Checkbox colorPrimary="#283a78" />}
                  label="Otro"
                  checked={this.state.gender === 3}
                  onChange={() => this.setState({ gender: 3 })}
                  labelPlacement="end" />
              </Grid>
            </Grid>

            <Grid container spacing={2} item xs={12} className={classes.cardContainer}>
              <Grid item xs={12} className={classes.cardHeader}>
                <Typography className={classes.cardTitle}><heavy>Fecha de nacimiento</heavy></Typography>
                <Typography className={classes.cardSubtitle}>Selecciona tu fecha de cumpleaños</Typography>
              </Grid>
              <Grid item xs={12} sm={6} lg={4} >
                <TextField
                  className={classes.dateInput}
                  label="Día"
                  onChange={(event) => this.setState({ selectedDay: event.target.value })}
                  select
                  SelectProps={{ native: true }}
                  value={this.state.selectedDay}
                  variant="outlined">
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
              </Grid>
              <Grid item xs={12} sm={6} lg={4} >
                <TextField
                  className={classes.dateInput}
                  label="Mes"
                  onChange={(event) => this.handleChangeMonth(event.target.value)}
                  select
                  SelectProps={{ native: true }}
                  value={(this.state.selectedMonth !== null) ? (this.state.selectedMonth.index - 1) : ''}
                  variant="outlined">
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
              </Grid>
              <Grid item xs={12} sm={6} lg={4} >
                <TextField
                  className={classes.dateInput}
                  label="Año"
                  onChange={(event) => this.setState({ selectedYear: event.target.value }, () => this.handleChangeMonth())}
                  select
                  SelectProps={{ native: true }}
                  value={this.state.selectedYear}
                  variant="outlined">
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
              </Grid>

            </Grid>

            <Grid container item xs={12} className={classes.cardContainer}>
              <Grid item xs={2} sm={1}>
                <Checkbox
                  value={this.state.newsletter}
                  checked={this.state.newsletter}
                  onChange={() => { this.setState({ newsletter: !this.state.newsletter }) }} />
              </Grid>
              <Grid item xs={10} sm={11}>
                <Typography variant="body1">Suscribir al newsletter Calzzapato.com ®</Typography>
                <Typography variant="body2" style={{ fontSize: 12 }}>Aceptas recibir correos electrónicos a la dirección de correo proporcionada.</Typography>
              </Grid>
            </Grid>

            <Grid container item xs={12}>
              <Button
                className={classes.secondaryButton}
                onClick={() => this.props.history.push(Utils.constants.paths.myAccount)}
                variant="outlined">REGRESAR</Button>

              <Button
                className={classes.primaryButton}
                onClick={() => this.updateUser()}
                variant="contained"
                color="primary">GUARDAR CAMBIOS</Button>
            </Grid>
          </Grid>

          <ValidationSMSModal
            openDialog={this.state.openValidationSMS}
            title="Confirma tu número."
            description="Es necesario validar tu número celular para finalizar el proceso."
            handleCloseValidationSMSModalWithSuccess={(cellphone, code) => {
              this.setState({ openValidationSMS: false, validateCellphone: true, cellphone: cellphone, code: code }, () => {
                self.updateUser()
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
            onClose={this.handleCloseSnackbar}
            message={
              <span>La información se ha actualizado.</span>
            }
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
    )
  }
}
const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = dispatch => {
  return {
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(PersonalInformation)

