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
import Router from 'next/router'

const MB_SIZE = 2000000 // 2.0 MB

const styles = theme => ({
  home: {
    margin: "0 auto",
    paddingTop: 48,
    textAlign: 'left',
    width: '50%',
    height: 600,
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
    width: '25%'
  },
  containerTitle: {
    marginTop: 32,
    textAlign: 'center',
    marginBottom: 32
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
      disabledButton: false,
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
        cellphone: '',
        schedule:''
      },
      ineFront: null,
      ineBack: null,
      addressProof: null
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
    this.setState({ disabledButton: true })
    if (Utils.isEmpty(this.state.values.name.trim())) {
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'El nombre es obligatorio.'
        }
      })
      return
    }

    if (Utils.isEmpty(this.state.values.firstLastName.trim())) {
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'El primer apellido es obligatorio.'
        }
      })
      return
    }

    if (Utils.isEmpty(this.state.values.cityCode.trim())) {
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'Es necesario indicar tu residencia actual por medio del código postal.'
        }
      })
      return
    }
    
    if (this.state.ineFront === null) {
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'Es necesario subir INE por enfrente.'
        }
      })
      return
    }

    if (this.state.ineBack === null) {
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'Es necesario subir INE por atrás.'
        }
      })
      return
    }

    if (this.state.addressProof === null) {
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'Es necesario subir comprobante de domicilio.'
        }
      })
      return
    }

    if (Utils.isEmpty(this.state.values.email.trim())) {
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'El correo electrónico es obligatorio.'
        }
      })
      return
    }

    if (!Utils.validateEmail(this.state.values.email.trim())) {
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'El correo electrónico es incorrecto.'
        }
      })
      return
    }

    if (Utils.isEmpty(this.state.values.cellphone.trim())) {
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'El número celular es obligatorio.'
        }
      })
      return
    }

    if (isNaN(this.state.values.cellphone.trim()) || this.state.values.cellphone.trim().length !== 10) {
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'El número celular debe ser un número de 10 dígitos.'
        }
      })
      return
    }
    if (Utils.isEmpty(this.state.values.schedule.trim())){
      this.setState({
        disabledButton: false,
        snackbar: {
          open: true,
          message: 'El horario es obligatorio.'
        }
      })
      return
    }

    let selectedDay = ""
    if (this.state.selectedDay >= 10) {
      selectedDay = this.state.selectedDay
    } else {
      selectedDay = "0" + this.state.selectedDay
    }

    let selectedMonth = ""
    if (this.state.selectedMonth.index >= 10) {
      selectedMonth = this.state.selectedMonth.index
    } else {
      selectedMonth = "0" + this.state.selectedMonth.index
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
        birthday: this.state.selectedYear + '-' + selectedMonth + '-' + selectedDay,
        location: this.state.values.cityCode + '' + this.state.values.stateCode,
        email: this.state.values.email,
        cellphone: this.state.values.cellphone,
        schedule: this.state.values.schedule,
        cityName: this.state.values.cityName,
        documents: {
          ineFront: this.state.ineFront,
          ineBack: this.state.ineBack,
          addressProof: this.state.addressProof
        }
      }
    })

    let success = false
    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.success) {
        success = true
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
      if (response.status === Utils.constants.status.PAYLOAD_TO_LARGE) {
        this.setState({
          disabledButton: false,
          snackbar: {
            open: true,
            message: 'Los documentos son demasiado grandes. Por favor, intenta de nuevo con otros o intenta compromirlos.'
          }
        })
      } if (response.data.outZone) {
        this.setState({
          disabledButton: false,
          snackbar: {
            open: true,
            message: 'De momento no contamos con cobertura de crédito en tu ciudad, te invitamos a visitar nuestra página www.calzzapato.com. Para mas información estamos a tus órdenes al 800 99 05 002'
          }
        })
      } else {
        this.setState({
          disabledButton: false,
          snackbar: {
            open: true,
            message: 'Ocurrió un problema, no se pudo registrar tu solicitud. Inténtalo de nuevo más tarde.'
          }
        })
      }
    }
  }

  handleChangeFolio(event) {
    this.setState({ folio: event.target.value })
  }

  handleChangeAmount(event) {
    this.setState({ amount: event.target.value })
  }

  handleChangeFileValue(event, document) {
    const self = this
    let uploadFile = event.target.files[0]

    if (uploadFile === undefined) {
      this.setState({
        snackbar: {
          open: true,
          message: 'Formato de documento no válido.'
        }
      })
      return
    }

    let fileName = uploadFile.name
    let fileType = uploadFile.type
    let fileSize = uploadFile.size

    if (fileType !== 'image/jpeg' && fileType !== 'image/jpg' && fileType !== 'image/png' && fileType !== 'application/pdf') {
      this.setState({
        snackbar: {
          open: true,
          message: 'Formato de documento no válido.'
        }
      })
      return
    }

    Utils.getBase64(uploadFile).then(function (data) {
      let doc = {
        name: fileName,
        type: fileType,
        size: fileSize,
        width: 0,
        height: 0,
        data: data
      }

      if (fileType === 'application/pdf') {
        if (fileSize > MB_SIZE) {
          self.setState({
            snackbar: {
              open: true,
              message: 'El documento es demasiado grande. Por favor, intenta de nuevo con otro.'
            }
          })
          return
        }
        else {
          self.setState({
            [document]: doc
          })
          return
        }
      }

      let img = new Image()
      img.src = data
      img.onload = function () {
        doc.width = this.width
        doc.height = this.height
        doc.data = Utils.compressImage(img, fileType, doc.width, doc.height, 0.2)
        doc.size = Utils.dataURLToBlob(doc.data, fileType).size

        if (doc.size > MB_SIZE) {
          self.setState({
            snackbar: {
              open: true,
              message: 'El documento es demasiado grande. Por favor, intenta de nuevo con otro.'
            }
          })
          return
        }

        self.setState({
          [document]: doc
        })
      }
    })
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
              <Typography variant="h1" style={{ color: 'white', fontSize: 28 }}>Solicita tu crédito CrediVale <span style={{ fontSize: 13 }}>®</span></Typography>
              <Typography variant="body1" style={{ color: 'white', fontSize: 16 }}>Ingresa a continuación tus datos y disfruta de grandes beneficios.</Typography>
            </Grid>
          </Grid>

          <Grid container className={classes.listContainer}>
            <Grid item xl={3} lg={3} md={3} sm={3} xs={6} className={classes.itemList}>
              <div>
                <Icon>verified</Icon>
              </div>
              <div>
                <strong style={{ fontWeight: 800 }}>Las mejoras marcas.</strong>
                <br />
                <span style={{ fontSize: 12, fontWeight: 100 }}>Importadas y nacionales.</span>
              </div>
            </Grid>
            <Grid item xl={3} lg={3} md={3} sm={3} xs={6} className={classes.itemList}>
              <div>
                <Icon>monetization_on</Icon>
              </div>
              <div>
                <strong style={{ fontWeight: 800 }}>Plazos y promociones.</strong>
                <br />
                <span style={{ fontSize: 12, fontWeight: 100 }}>Empieza tu negocio con nosotros.</span>
              </div>
            </Grid>
            <Grid item xl={3} lg={3} md={3} sm={3} xs={6} className={classes.itemList}>
              <div>
                <Icon>location_on</Icon>
              </div>
              <div>
                <strong style={{ fontWeight: 800 }}>Tiendas estratégicas.</strong>
                <br />
                <span style={{ fontSize: 12, fontWeight: 100 }}>Tiendas en puntos estratégicos.</span>
              </div>
            </Grid>
            <Grid item xl={3} lg={3} md={3} sm={3} xs={6} className={classes.itemList}>
              <div>
                <Icon>credit_card</Icon>
              </div>
              <div>
                <strong style={{ fontWeight: 800 }}>Puntos electrónicos.</strong>
                <br />
                <span style={{ fontSize: 12, fontWeight: 100 }}>Genera puntos con tu crédito.</span>
              </div>
            </Grid>
          </Grid>

          <Grid container>
            <form className={classes.validateForm} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
              <div style={{ textAlign: 'center' }}>
                <Typography variant="h6">Datos personales.</Typography>
                <Typography variant="body2">Ingresa tus datos personales como aparecen en tu credencial para votar.</Typography>
              </div>
              <br />
              <TextField
                label="Nombre *"
                placeholder="Ingresa tu nombre completo..."
                type="text"
                value={this.state.values.name}
                onChange={(event) => { this.handleChangeValues('name', event) }}
                className={classes.textField}
              />
              <TextField
                label="Primer apellido *"
                placeholder="Ingresa tu primer apellido..."
                type="text"
                value={this.state.values.firstLastName}
                onChange={(event) => { this.handleChangeValues('firstLastName', event) }}
                className={classes.textField}
              />
              <TextField
                label="Segundo apellido"
                placeholder="Ingresa tu segundo apellido..."
                type="text"
                value={this.state.values.secondLastName}
                onChange={(event) => { this.handleChangeValues('secondLastName', event) }}
                className={classes.textField}
              />
              <div className={classes.dateContainer}>
                <Typography variant="body1" style={{ marginTop: 24, marginBottom: 12 }}>Fecha de nacimiento *</Typography>
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
                  onChange={(event) => this.handleChangeMonth(event.target.value)}
                  select
                  SelectProps={{
                    native: true
                  }}
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
              <Grid container style={{ marginTop: 24 }}>
                <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                  <Typography variant="body1"><strong>Código postal *</strong></Typography>
                  <TextField
                    type="text"
                    placeholder="Código postal..."
                    className={classes.textField}
                    value={this.state.values.zip}
                    onChange={(event) => { this.handleChangeValues('zip', event) }}
                  />
                </Grid>
                <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ paddingLeft: 8 }}>
                  <Typography variant="body1"><strong>Estado</strong></Typography>
                  <TextField
                    disabled={true}
                    className={classes.textField}
                    value={this.state.values.stateName}
                    type="text"
                  />
                </Grid>
                <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ paddingLeft: 8 }}>
                  <Typography variant="body1" ><strong>Ciudad</strong></Typography>
                  <TextField
                    disabled={true}
                    className={classes.textField}
                    value={this.state.values.cityName}
                    type="text"
                  />
                </Grid>
              </Grid>
              <div style={{ textAlign: 'center', marginTop: 48 }} >
                <Typography variant="h6">Documentación.</Typography>
                <Typography variant="body2">Sube los siguientes documentos para agilizar tu solicitud.</Typography>
              </div>
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Button
                    style={{ marginTop: 16, width: '100%', textAlign: 'center' }}
                    className={classes.primaryButton}
                    color={ (this.state.ineFront !== null) ? "primary" : "default" }
                    variant="contained"
                    component="label"
                  >
                    <div>
                      <span>HAZ CLICK AQUÍ PARA SUBIR INE POR ENFRENTE </span> { (this.state.ineFront !== null) ? '✅' : '❌' }
                    </div>
                    <input
                      type="file"
                      style={{ display: "none" }}
                      accept={['image/jpeg', 'image/jpg','image/png', 'application/pdf', 'image/webp']}
                      onChange={(event) => { this.handleChangeFileValue(event, "ineFront") }}
                    />
                  </Button>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Button
                    style={{ marginTop: 16, width: '100%', textAlign: 'center' }}
                    color={ (this.state.ineBack !== null) ? "primary" : "default" }
                    variant="contained"
                    component="label"
                  >
                    <div>
                      <span>HAZ CLICK AQUÍ PARA SUBIR INE POR ATRÁS </span> { (this.state.ineBack !== null) ? '✅' : '❌' }
                    </div>
                    <input
                      type="file"
                      style={{ display: "none" }}
                      accept={['image/jpeg', 'image/jpg','image/png', 'application/pdf', 'image/webp']}
                      onChange={(event) => { this.handleChangeFileValue(event, "ineBack") }}
                    />
                  </Button>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Button
                    style={{ marginTop: 16, width: '100%', textAlign: 'center' }}
                    color={ (this.state.addressProof !== null) ? "primary" : "default" }
                    variant="contained"
                    component="label"
                  >
                    <div>
                      <span>HAZ CLICK AQUÍ PARA SUBIR COMPROBANTE DE DOMICILIO </span> { (this.state.addressProof !== null) ? '✅' : '❌' }
                    </div>
                    <input
                      type="file"
                      style={{ display: "none" }}
                      accept={['image/jpeg', 'image/jpg','image/png', 'application/pdf', 'image/webp']}
                      onChange={(event) => { this.handleChangeFileValue(event, "addressProof") }}
                    />
                  </Button>
                </Grid>
              </Grid>
              <div style={{ textAlign: 'center', marginTop: 48 }} >
                <Typography variant="h6">Datos de contacto.</Typography>
                <Typography variant="body2">Te contactaremos por estos medios para seguir con la solicitud.</Typography>
              </div>
              <TextField
                label="Correo electrónico *"
                type="email"
                value={this.state.values.email}
                onChange={(event) => { this.handleChangeValues('email', event) }}
                className={classes.textField}
              />
              <TextField
                label="Número celular *"
                type="phone"
                value={this.state.values.cellphone}
                onChange={(event) => { this.handleChangeValues('cellphone', event) }}
                className={classes.textField}
              />
              <TextField
                label="Horario de contacto *"
                value={this.state.values.schedule}
                onChange={(event) => { this.handleChangeValues('schedule', event) }}
                className={classes.textField}
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.validateButton}
                onClick={() => { this.validate() }}
                disabled={this.state.disabledButton}
              >
                ENVIAR INFORMACIÓN
              </Button>
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
            <p>® {new Date().getFullYear()} CrediVale - Todos los derechos reservados.</p>
          </footer>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(withStyles(styles), connect(mapStateToProps))(RequestCrediValeView)
