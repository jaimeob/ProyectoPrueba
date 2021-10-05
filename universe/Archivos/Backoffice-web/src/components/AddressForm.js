import React, { Component } from 'react'

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

const styles = theme => ({
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
    width: "100%",
    height: "100%",
    [theme.breakpoints.down('sm')]: {
      width: "100%"
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
        interiorNumber: ''
      },
      disabled: false,
      alreadySelectedLocationByDefaultOnEdit: true,
    }
    this.handleChangeValues = this.handleChangeValues.bind(this)
    this.handleChangeLocation = this.handleChangeLocation.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.checkZip = this.checkZip.bind(this)
    this.updateAddress = this.updateAddress.bind(this)
    this.editAddress = this.editAddress.bind(this)
  }

  handleChangeValues(param, event) {
    let values = this.state.values
    values[param] = event.target.value
    this.setState({
      values: values
    })
    if (param === 'zip') {
      this.checkZip()
    } else {
      this.updateAddress()
    }
  }

  async checkZip() {
    const self = this
    let values = this.state.values
    if (Utils.isNumeric(Number(values['zip']))) {
      if (values['zip'].trim().length === 5) {
        let response = await getDataAPI({
          host: Utils.constants.HOST,
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
          }, () => {
            self.updateAddress()
          })
        }
      }
      else {
        this.setState({
          locations: [],
          selectedLocation: ''
        }, () => {
          self.updateAddress()
        })
      }
    }
    else {
      this.setState({
        locations: [],
        selectedLocation: ''
      }, () => {
        this.updateAddress()
      })
    }
  }

  async componentWillMount() {
    if (!this.props.editAddress) {
      return
    }

    let address = { ...this.props.editAddress }

    await this.setState({
      values: address
    })
    this.checkZip()
  }

  handleChangeLocation(event) {
    const self = this
    let values = this.state.values
    let location = ''
    try {
      location = this.state.locations[event.target.value]
      values.locationCode = location.code
      values.location = location.name
      this.setState({
        selectedLocation: location,
        values
      }, () => {
        self.updateAddress()
      })
    } catch (error) {
      this.setState({
        selectedLocation: ''
      }, () => {
        self.updateAddress()
      })
    }
  }

  updateAddress() {
    let values = this.state.values
    values.locations = this.state.locations
    values.selectedLocation = this.state.selectedLocation
    this.props.updateAddress(values)
  }

  editAddress() {
    if (!this.validate()) {
      this.setState({ disabled: true })
      this.props.handleClose()
      this.props.handleEditAddress(this.state.values, this.state.selectedLocation)
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
    }
    else {
      this.setState({ disabled: true })

      var address = {
        zip: this.state.values.zip,
        stateCode: this.state.values.stateCode,
        municipalityCode: this.state.values.cityCode,
        locationCode: this.state.selectedLocation.code,
        street: this.state.values.street,
        exteriorNumber: this.state.values.exteriorNumber,
        interiorNumber: this.state.values.interiorNumber,
        betweenStreets: this.state.values.betweenStreets
      }

      let user = await Utils.getCurrentUser()
      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: 'addresses',
        endpoint: '/create',
        data: {
          address
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
          errorMessage: Utils.messages.General.error
        })
      }
    }
  }

  validate() {
    let error = false

    let errorMessage = Utils.messages.General.formRequired
    if (this.state.values.street.trim().length <= 0 || this.state.values.street.trim().length > 128) {
      error = true
      errorMessage = 'Calle de la dirección no válida.'
    }
    else if (Number(this.state.values.exteriorNumber) <= 0 || this.state.values.exteriorNumber.length > 16) {
      error = true
      errorMessage = 'Número exterior no válido.'
    }
    else if (this.state.values.zip.trim().length > 5 || Number(this.state.values.zip) <= 0 || this.state.locations.length === 0) {
      error = true
      errorMessage = 'Código postal no válido.'
    }
    else if (this.state.selectedLocation === '') {
      error = true
      errorMessage = 'Selecciona una colonia.'
    }
    else if (this.state.values.stateCode === '') {
      error = true
      errorMessage = 'Estado no válido.'
    }
    else if (this.state.values.cityCode === '') {
      error = true
      errorMessage = 'Ciudad no válida.'
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
        interiorNumber: ''
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
        <Grid container>
          <Grid item xl={12} lg={12} sm={12} md={12} xs={12}>
            <form noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
              <div className={classes.textFieldForm}>
                <Typography variant="body1"><strong>Calle *</strong></Typography>
                <TextField
                  inputProps={{
                    maxLength: 128,
                  }}
                  disabled={this.state.textInputDisabled}
                  placeholder={"Calle..."}
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
                placeholder={"Especifíca las entre calles del domicilio..."}
                className={classes.textField}
                value={this.state.values.betweenStreets}
                onChange={(event) => { this.handleChangeValues('betweenStreets', event) }}
                type="text"
              />
              <Grid container className={classes.textFieldForm}>
                <Grid item lg={6} xs={6} style={{ paddingRight: 8 }}>
                  <Typography variant="body1"><strong>Número exterior *</strong></Typography>
                  <TextField
                    inputProps={{
                      maxLength: 16,
                    }}
                    disabled={this.state.textInputDisabled}
                    placeholder={"Número exterior..."}
                    className={classes.textField}
                    value={this.state.values.exteriorNumber}
                    onChange={(event) => { this.handleChangeValues('exteriorNumber', event) }}
                    type="number"
                  />
                </Grid>
                <Grid item lg={6} xs={6} style={{ paddingLeft: 8 }}>
                  <Typography variant="body1"><strong>Número interior</strong></Typography>
                  <TextField
                    inputProps={{
                      maxLength: 16,
                      type: "number"
                    }}
                    disabled={this.state.textInputDisabled}
                    placeholder={"Número interior..."}
                    className={classes.textField}
                    value={this.state.values.interiorNumber}
                    onChange={(event) => { this.handleChangeValues('interiorNumber', event) }}
                  />
                </Grid>
              </Grid>
              {/**/}
              <Grid container className={classes.textFieldForm}>
                <Grid item lg={6} xs={6} style={{ paddingRight: 8 }}>
                  <Typography variant="body1"><strong>Código postal *</strong></Typography>
                  <TextField
                    inputProps={{
                      maxLength: 5,
                      type: "number"
                    }}
                    disabled={this.state.textInputDisabled}
                    placeholder={"Código postal..."}
                    className={classes.textField}
                    value={this.state.values.zip}
                    onChange={(event) => { this.handleChangeValues('zip', event) }}
                  //type="number"
                  />
                </Grid>
                <Grid item lg={6} xs={6} style={{ paddingLeft: 8 }}>
                  <FormControl variant="outlined" style={{ width: '100%' }}>
                    <Typography variant="body1"><strong>Colonia *</strong></Typography>
                    <Select
                      native
                      onChange={(event) => { this.handleChangeLocation(event) }}
                      inputProps={{
                        name: 'age',
                        id: 'outlined-age-native-simple',
                      }}
                    >
                      <option value={null} style={{ fontSize: '8px' }}>Selecciona una colonia...</option>
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
                        disabled={this.state.disabled}
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
                    <Grid item xl={12} lg={12} md={12} xs={8}>
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
                        CONFIRMAR DIRECCIÓN
                      </Button>
                    </Grid>
                    :
                    ""
                }
              </Grid>
            </form>
          </Grid>
        </Grid>
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

export default withStyles(styles)(AddressForm)
