'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

//Utils
import { getDataAPI, requestAPI } from '../api/CRUD'
import Utils from '../resources/Utils'
import messages from '../resources/Messages.json'
import MapModal from './MapModal'
import Axios from 'axios'

const styles = theme => ({
  form: {
    padding: "16px 0px 0px 0px"
  },
  textFieldForm: {
    marginTop: 16
  },
  select: {
    marginLeft: 16
  },
  textField: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'inherit',
    fontWeight: 200
  },
  actions: {
    float: 'right',
    marginTop: 32,
    [theme.breakpoints.down('sm')]: {
      paddingBottom: 16
    },
  },
  primaryButton: {
    fontWeight: 600,
    fontSize: 14,
    width: "95%",
    height: "100%",
    [theme.breakpoints.down('sm')]: {
      width: "100%",
      padding: "0%"
    }
  },
  deleteButton: {
    fontWeight: 600,
    fontSize: 14,
    width: "95%",
    color: "white",
    backgroundColor: "#DA123F",
    height: "100%",
    '&:hover': {
      color: "#white",
      backgroundColor: "#DA1230"
    },
  },
  cancelButton: {
    color: "#283A78",
    border: "2px solid #283A78",
    width: "95%",

  }
})

class AddressForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      errorMessage: '',
      selectedLocation: '',
      urlMap: '',
      locations: [],
      values: {
        alias: '',
        reference: '',
        betweenStreets: '',
        zip: '',
        stateCode: '',
        stateName: '',
        cityCode: '',
        cityName: '',
        locationCode: '',
        locationName: '',
        street: '',
        exteriorNumber: '',
        interiorNumber: '',
        name: '',
        lastName: '',
        phone: ''
      },
      disabled: false,
      alreadySelectedLocationByDefaultOnEdit: true,
      openMapModal: false,
      lat: '',
      lng: '',
      needsCoords: false,
      editButton: true,
      oldAddress: null
    }
    this.handleChangeValues = this.handleChangeValues.bind(this)
    this.handleChangeLocation = this.handleChangeLocation.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.checkZip = this.checkZip.bind(this)
    this.editAddress = this.editAddress.bind(this)
  }

  handleChangeValues(param, event) {
    let values = this.state.values
    let editButton = true
    if (this.state.oldAddress !== undefined && this.state.oldAddress !== null && event.target.value !== this.state.oldAddress[param]) {
          editButton = false
        } else {
          editButton = true
        }

    if (param === 'phone') {
      if (event.target.value.trim().length > 10 || isNaN(event.target.value))
        return
    }

    if (param === 'zip') {
      if (event.target.value.trim().length > 5 || isNaN(event.target.value))
        return
    }

    if (param === 'interiorNumber' || param === 'exteriorNumber') {
      if (event.target.value.trim().length > 15 || isNaN(event.target.value))
        return
    }
    if (param === 'street' || param === 'zip') {
      this.setState({
        needsCoords: true
      })

    }
    values[param] = event.target.value
    this.setState({
      values: values,
      editButton: editButton
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
        this.setState({
          locations: [],
          selectedLocation: ''
        })
      }
    }
    else {
      this.setState({
        locations: [],
        selectedLocation: ''
      })
    }
  }

  async componentWillMount() {
    if (!this.props.editAddress) {
      return
    }

    let address = { ...this.props.editAddress }

    await this.setState({
      values: address,
      lat: (this.props.editAddress.lat === 0) ? '' : this.props.editAddress.lat,
      lng: (this.props.editAddress.lng === 0) ? '' : this.props.editAddress.lng,
      oldAddress: { ...this.props.editAddress }

    })
    this.checkZip()
  }

  handleChangeLocation(event) {
    let location = ''
    try {
      location = this.state.locations[event.target.value]
      let values = this.state.values
      values.locationCode = location.code
      values.location = location.name
      this.setState({
        selectedLocation: location,
        values
      })
    } catch (error) {
      this.setState({
        selectedLocation: ''
      })
    }
  }
  async editAddress() {
    if (this.state.lat === '' || this.lng === '' || this.state.needsCoords) {
      let address = this.state.values.zip.replace(" ", "") + '+' + this.state.values.location.replace(" ", "") + '+' + this.state.values.street.replace(" ", "") + '+' + this.state.values.exteriorNumber.replace(" ", "") + '+' + this.state.values.cityName.replace(" ", "") + '+' + this.state.values.stateName.replace(" ", "")
      let geolocationData = await Axios('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '+Mexico&key=AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo', {})
      if (geolocationData.status === 200 && geolocationData.data.results.length > 0) {
        let values = this.state.values
        values.lat = geolocationData.data.results[0].geometry.location.lat
        values.lng = geolocationData.data.results[0].geometry.location.lng
        this.setState({
          lat: geolocationData.data.results[0].geometry.location.lat,
          lng: geolocationData.data.results[0].geometry.location.lng,
          values: values
        })
      }
      this.setState({
        openMapModal: true
      })
      return
    }
    if (!this.validate()) {
      this.setState({ disabled: true })
      this.props.handleClose()
      let values = this.state.values
      values.lat = this.state.lat
      values.lng = this.state.lng
      this.props.handleEditAddress(values, this.state.selectedLocation)
    }
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.handleConfirm()
    }
  }

  async handleConfirm() {
    if (this.validate()) {
    } else if (this.state.lat === '' || this.state.lng === '' || this.state.needsCoords) {
      let address = this.state.values.zip.replace(" ", "") + '+' + this.state.values.location.replace(" ", "") + '+' + this.state.values.street.replace(" ", "") + '+' + this.state.values.exteriorNumber.replace(" ", "") + '+' + this.state.values.cityName.replace(" ", "") + '+' + this.state.values.stateName.replace(" ", "")

      let geolocationData = await Axios('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '+Mexico&key=AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo', {})
      if (geolocationData.status === 200 && geolocationData.data.results.length > 0) {
        let values = this.state.values
        values.lat = geolocationData.data.results[0].geometry.location.lat
        values.lng = geolocationData.data.results[0].geometry.location.lng
        this.setState({
          lat: geolocationData.data.results[0].geometry.location.lat,
          lng: geolocationData.data.results[0].geometry.location.lng,
          values: values
        })
      }
      this.setState({
        openMapModal: true
      })
      return
    } else {
      this.setState({ disabled: true })

      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'addresses',
        endpoint: '/create',
        data: {
          zip: this.state.values.zip,
          stateCode: this.state.values.stateCode,
          municipalityCode: this.state.values.cityCode,
          locationCode: this.state.selectedLocation.code,
          street: this.state.values.street,
          exteriorNumber: this.state.values.exteriorNumber,
          interiorNumber: this.state.values.interiorNumber,
          alias: this.state.values.alias,
          reference: this.state.values.reference,
          betweenStreets: this.state.values.betweenStreets,
          name: this.state.values.name,
          lastName: this.state.values.lastName,
          phone: this.state.values.phone,
          lat: this.state.lat,
          lng: this.state.lng
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        let address = response.data.createdAddress;
        this.clearData()
        this.props.handleConfirmWithAddress(address)
      }
      else {
        this.setState({
          openSnack: true,
          errorMessage: messages.General.error
        })
      }
    }
  }

  validate() {
    let error = false

    let errorMessage = messages.General.formRequired
    if (this.state.values.zip.trim().length > 5 || Number(this.state.values.zip) <= 0) {
      error = true
      errorMessage = 'Código postal incorrecto.'
    }
    else if (this.state.values.stateCode === '') {
      error = true
      errorMessage = 'Estado incorrecto.'
    }
    else if (this.state.values.cityCode === '') {
      error = true
      errorMessage = 'Ciudad incorrecta.'
    }
    else if (this.state.selectedLocation === '') {
      error = true
      errorMessage = 'Asentamiento incorrecto.'
    }
    else if (this.state.values.street.trim().length <= 0 || this.state.values.street.trim().length > 128) {
      error = true
      errorMessage = 'Calle incorrecta.'
    }
    else if (Number(this.state.values.exteriorNumber) <= 0 || this.state.values.exteriorNumber.length > 16) {
      error = true
      errorMessage = 'Número exterior incorrecto.'
    }
    else if (Number(this.state.values.interiorNumber) <= -1 || this.state.values.interiorNumber.length > 16) {
      error = true
      errorMessage = 'Número interior incorrecto'
    }
    else if (this.state.values.name.trim() === '') {
      error = true
      errorMessage = 'Nombre no válido'
    }
    else if (this.state.values.lastName.trim() === '') {
      error = true
      errorMessage = 'Se requiere apellido'
    }
    else if (this.state.values.phone.length < 7 || this.state.values.phone.length > 15 || Number(this.state.values.phone) <= 0) {
      error = true
      errorMessage = 'Teléfono incorrecto'
    }

    if (error) {
      this.setState({
        openSnack: error,
        errorMessage: errorMessage,
        disabled: false
      })
    }

    if (error) {
      this.setState({
        openSnack: error,
        errorMessage: errorMessage
      })
    }

    return error
  }

  clearData() {
    this.setState({
      openSnack: false,
      errorMessage: '',
      selectedLocation: '',
      locations: [],
      values: {
        alias: '',
        zip: '',
        stateCode: '',
        stateName: '',
        cityCode: '',
        cityName: '',
        locationCode: '',
        locationName: '',
        street: '',
        exteriorNumber: '',
        interiorNumber: '',
        name: '',
        lastName: ''
      },
      loading: false
    })
  }

  changeLocation(location) {
    if (location.name === this.state.values.location && !this.state.selectedLocation && this.state.alreadySelectedLocationByDefaultOnEdit) {
      this.setState({
        selectedLocation: location,
        alreadySelectedLocationByDefaultOnEdit: false
      })
    }
  }

  render() {
    const { classes } = this.props
    const self = this

    return (
      <Grid>
        <Typography variant="h4" className={classes.modalTitle}>{
          (this.props.editAddress) ? "Editar dirección de entrega" : "Agregar dirección de entrega"
        }
        </Typography>
        <Typography variant="body1">
          ¿Dónde quieres recibir tu pedido?
        </Typography>
        <Grid container>
          <Grid item xl={12} lg={12} sm={12} md={12} xs={12}>
            <form className={classes.form} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
              <div className={classes.textFieldForm}>
                <Typography variant="body1"><strong>{messages.OfficeForm.addressModal.street} *</strong></Typography>
                <TextField
                  inputProps={{
                    maxLength: 128,
                  }}
                  disabled={this.state.textInputDisabled}
                  placeholder={messages.OfficeForm.addressModal.street + "..."}
                  className={classes.textField}
                  value={this.state.values.street}
                  onChange={(event) => { this.handleChangeValues('street', event) }}
                  type="text"
                />
              </div>
              <Typography variant="body1" style={{ marginTop: 8 }}><strong>Entre calles</strong></Typography>
              <TextField
                inputProps={{
                  maxLength: 128,
                }}
                placeholder={"Entre calles..."}
                className={classes.textField}
                value={this.state.values.betweenStreets}
                onChange={(event) => { this.handleChangeValues('betweenStreets', event) }}
                type="text"
              />
              <Grid container className={classes.textFieldForm}>
                <Grid item lg={6} xs={6} style={{ paddingRight: 8 }}>
                  <Typography variant="body1"><strong>{messages.OfficeForm.addressModal.exteriorNumber} *</strong></Typography>
                  <TextField
                    inputProps={{
                      maxLength: 16,
                    }}
                    disabled={this.state.textInputDisabled}
                    placeholder={messages.OfficeForm.addressModal.exteriorNumber + "..."}
                    className={classes.textField}
                    value={this.state.values.exteriorNumber}
                    onChange={(event) => { this.handleChangeValues('exteriorNumber', event) }}
                    type="number"
                  />
                </Grid>
                <Grid item lg={6} xs={6} style={{ paddingLeft: 8 }}>
                  <Typography variant="body1"><strong>{messages.OfficeForm.addressModal.interiorNumber}</strong></Typography>
                  <TextField
                    inputProps={{
                      maxLength: 16,
                      type: "number"
                    }}
                    disabled={this.state.textInputDisabled}
                    placeholder={messages.OfficeForm.addressModal.interiorNumber + "..."}
                    className={classes.textField}
                    value={this.state.values.interiorNumber}
                    onChange={(event) => { this.handleChangeValues('interiorNumber', event) }}
                  />
                </Grid>
              </Grid>
              {/**/}
              <Grid container className={classes.textFieldForm}>
                <Grid item lg={6} xs={6} style={{ paddingRight: 8 }}>
                  <Typography variant="body1"><strong>{messages.OfficeForm.addressModal.zip} *</strong></Typography>
                  <TextField
                    inputProps={{
                      maxLength: 5,
                      type: "number"
                    }}
                    disabled={this.state.textInputDisabled}
                    placeholder={messages.OfficeForm.addressModal.zip + "..."}
                    className={classes.textField}
                    value={this.state.values.zip}
                    onChange={(event) => { this.handleChangeValues('zip', event) }}
                  //type="number"
                  />
                </Grid>
                <Grid item lg={6} xs={6} style={{ paddingLeft: 8 }}>
                  <FormControl style={{ width: '100%' }}>
                    <Typography variant="body1"><strong>Colonia *</strong></Typography>
                    <Select
                      native
                      onChange={(event) => { this.handleChangeLocation(event) }}
                      inputProps={{
                        name: 'age',
                        id: 'outlined-age-native-simple',
                      }}
                    >
                      <option value={null} style={{ fontSize: '8px' }}>Seleccione una colonia...</option>
                      {
                        (this.state.locations.length > 0) ?
                          this.state.locations.map(function (location, idx) {
                            self.changeLocation(location);
                            return (
                              <option {...((self.state.values.location === location.name) ? { selected: " " } : {})} value={idx}>{location.name}</option>
                            )
                          })
                          :
                          ''
                      }

                    </Select>
                  </FormControl>
                </Grid>

              </Grid>
              {
                (this.state.locations.length > 0 || this.props.editAddress) ?
                  <div>
                    <br />
                    <Grid container className={classes.textFieldForm}>
                      <Grid item xs={6} style={{ paddingRight: 8 }}>
                        <Typography variant="body1"><strong>Estado</strong></Typography>
                        <TextField
                          disabled={true}
                          className={classes.textField}
                          value={this.state.values.stateName}
                          type="text"
                        />
                      </Grid>
                      <Grid item xs={6} style={{ paddingLeft: 8 }}>
                        <Typography variant="body1" ><strong>Ciudad</strong></Typography>
                        <TextField
                          disabled={true}
                          className={classes.textField}
                          value={this.state.values.cityName}
                          type="text"
                        />
                      </Grid>
                    </Grid>
                    <br />
                    <Typography style={{ fontSize: 16 }}>Información que puede ayudar a la entrega</Typography>
                    <Typography variant="body1" style={{ marginTop: 8 }}><strong>Referencia</strong></Typography>
                    <TextField
                      inputProps={{
                        maxLength: 256,
                      }}
                      placeholder={"¿Cómo podemos identificar el lugar?"}
                      className={classes.textField}
                      value={this.state.values.reference}
                      onChange={(event) => { this.handleChangeValues('reference', event) }}
                      type="text"
                    />
                    <Grid container className={classes.textFieldForm}>
                      <Grid item lg={6} xs={6} style={{ paddingRight: 8 }}>
                        <Typography variant="body1"><strong>Nombre *</strong></Typography>
                        <TextField
                          inputProps={{
                            maxLength: 256,
                          }}
                          placeholder={"Nombre..."}
                          className={classes.textField}
                          value={this.state.values.name}
                          onChange={(event) => { this.handleChangeValues('name', event) }}
                        />
                      </Grid>
                      <Grid item lg={6} xs={6} style={{ paddingRight: 8 }}>
                        <Typography variant="body1"><strong>Apellidos *</strong></Typography>
                        <TextField
                          inputProps={{
                            maxLength: 256,
                          }}
                          placeholder={"Apellido..."}
                          className={classes.textField}
                          value={this.state.values.lastName}
                          onChange={(event) => { this.handleChangeValues('lastName', event) }}
                        />
                      </Grid>
                    </Grid>
                  
                    <Grid container className={classes.textFieldForm}>
                      <Grid item lg={12} xs={12} style={{ paddingLeft: 8 }}>
                        <Typography variant="body1"><strong>Teléfono *</strong></Typography>
                        <TextField
                          inputProps={{
                            maxLength: 15,
                          }}
                          placeholder={"Teléfono..."}
                          className={classes.textField}
                          value={this.state.values.phone}
                          onChange={(event) => { this.handleChangeValues('phone', event) }}
                          type="number"
                        />
                      </Grid>
                    </Grid>
                  
                  </div>
                  :
                  ''
              }
              <Grid container className={classes.actions} xs={12} >
                {
                  (this.props.handleClose) ?
                    <Grid item xs={4}>
                      <Button
                        disabled={this.state.disabled}
                        className={classes.cancelButton}
                        onClick={() => {
                          this.setState({ disabled: true })
                          this.props.handleClose()
                        }}
                      >
                        Cancelar
                                        </Button>
                    </Grid>
                    :
                    ""
                }
                {
                  (this.props.editAddress) ?
                    <Grid item xs={4}>
                      <Button
                        disabled={this.state.disabled}
                        className={classes.deleteButton}
                        onClick={() => {
                          this.setState({
                            disabled: true
                          })
                          this.props.handleDeleteAddress()
                          this.props.handleClose()
                        }}
                      >
                        BORRAR
                                            </Button>
                    </Grid>
                    : ""
                }
                {
                  (this.props.editAddress) ?
                    <Grid item xs={4}>
                      <Button
                        disabled={this.state.disabled || this.state.editButton}
                        color="primary"
                        variant="contained"
                        className={classes.primaryButton}
                        onClick={() => {
                          this.setState({ disabled: true })
                          this.editAddress()
                        }}
                      >
                        GUARDAR
                                            </Button>
                    </Grid>
                    : ""
                }
                {
                  (this.props.handleConfirmWithAddress) ?
                    <Grid item xs={8}>
                      <Button
                        disabled={this.state.disabled}
                        color="primary"
                        variant="contained"
                        className={classes.primaryButton}
                        onClick={() => {
                          this.setState({ disabled: true })
                          this.handleConfirm()
                        }}
                      >
                        ENVIAR A ESTA DIRECCIÓN
                                        </Button>
                    </Grid>
                    :
                    ""
                }
              </Grid>
            </form>
          </Grid>
        </Grid>
        {
          (this.state.openMapModal) ?
            <MapModal
              open={this.state.openMapModal}
              address={(this.state.lat !== '' && this.state.lng !== '' && this.state.lat !== 0 && this.state.lng !== 0) ? this.state.values : this.state.values}
              //address={(this.state.lat !== '' && this.state.lng !== '' && this.state.lat !== 0 && this.state.lng !== 0) ? this.props.editAddress : null}
              fromCreateAddress={true}
              handleConfirm={(data) => {
                this.setState({ openMapModal: false }, () => {
                  self.setState({
                    lat: data.lat,
                    lng: data.lng,
                    needsCoords: false
                  }, () => {
                    (this.props.editAddress) ? self.editAddress() : self.handleConfirm()
                  })
                })
              }}
              handleClose={() => { this.setState({ openMapModal: false, disabled: false }) }}
            />
            :
            ''
        }
        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.state.openSnack}
          onClose={this.handleCloseSnackbar}
          message={
            <span>{this.state.errorMessage}</span>
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

export default compose(withStyles(styles), connect(mapStateToProps, null))(AddressForm)
