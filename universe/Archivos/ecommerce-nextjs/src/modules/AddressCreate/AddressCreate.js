import React, { Component } from 'react'

//components
import MyAddresses from '../../components/MyAddresses'
import MyAccountMenu from '../../components/MyAccountMenu'
import AddressCard from '../../components/AddressCard'

import messages from '../../resources/Messages.json'


//material
import { withStyles, Grid, Typography, Hidden, Paper, TextField, Snackbar, FormControl, Select, Button } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Utils from '../../resources/Utils'

import Link from 'next/link'
import Router from 'next/router'
import Line from '../../components/Line'

import { getDataAPI, requestAPI } from '../../api/CRUD'
import Axios from 'axios'
import GoogleMapReact from 'google-map-react'




const style = theme => ({
  container: {
    //width: 850,
    width: 1080,
    margin: '0 auto',

    [theme.breakpoints.down("md")]: {
      margin: '0 auto',
      width: 850,
    },
    [theme.breakpoints.down("sm")]: {
      margin: '0 auto',
      width: 750,
    },
    [theme.breakpoints.down("xs")]: {
      margin: '0 auto',
      width: 'auto',
    }
  },
  blueButton: {
    width: '198px',
    height: '44px',
    color: 'white',
    //marginLeft: 9,
    display: 'block',
    //marginLeft: 'auto',
    paddingBottom: '13px',
    paddingTop: '13px',
    borderRadius: '4px',
    background: '#22397c',
    cursor: 'pointer'
  },
  card: {
    padding: theme.spacing(2),
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    paddingBottom: '50px',
  },
  whiteButton: {
    width: '198px',
    height: '44px',
    color: '#22397c',
    marginLeft: 9,
    display: 'block',
    marginLeft: 'auto',
    paddingBottom: '13px',
    paddingTop: '13px',
    borderRadius: '4px',
    background: 'white',
    cursor: 'pointer',
    border: 'solid 1px #22397c',

  },

})

class AddressNew extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      openAddressModal: false,
      addresses: [],
      checkbox: [],
      loadedAddress: false,
      expandAddresses: false,
      openEditAddressModal: false,
      selectedAddress: '',
      expandAddressButtonDisabled: false,


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

    this.handleChangeFavoriteAddress = this.handleChangeFavoriteAddress.bind(this)


    this.handleChangeValues = this.handleChangeValues.bind(this)
    this.handleChangeLocation = this.handleChangeLocation.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.checkZip = this.checkZip.bind(this)
    this.editAddress = this.editAddress.bind(this)


  }

  async componentWillMount() {
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      this.setState({
        user: user,
      }, () => {
        this.loadData()
      })
    } else {
      Router.push('/')
    }
  }


  async loadData() {
    const self = this
    let addresses = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/addresses'
    })

    let favorite = []
    if (addresses.status === Utils.constants.status.SUCCESS) {
      let checkbox = []
      if (addresses.data.length > 0) {
        addresses.data.forEach((address) => {
          checkbox.push({ check: false })
          if (address.favorite)
            favorite.push(address)
        })
      }

      this.setState({
        addresses: addresses.data,
        loadedAddress: true,
        checkbox: checkbox
      }, () => {
        if (favorite.length > 0) {
          for (let i = 0; i < this.state.addresses.length; i++) {
            if (this.state.addresses[i].id === favorite[0].id) {
              let checkbox = this.state.checkbox
              checkbox[i].check = true
              this.setState({
                selectedAddress: this.state.addresses[i],
                checkbox: checkbox
              }, () => {
                //if (self.props.selectedAddress)
                //   self.props.selectedAddress(self.state.addresses[i])
                //   self.props.setNewDeliveryAddress({
                //   zip: self.state.addresses[i].zip,
                //   state: self.state.addresses[i].state,
                //   city: self.state.addresses[i].municipality
                // })
              })
            }
          }
        } else {
          this.setState({
            expandAddresses: true,
            expandAddressButtonDisabled: true,
          })
        }
      })
    } else {
      this.setState({
        addresses: [],
        loadedAddress: true,
        checkbox: []
      })
    }
  }

  async handleChangeFavoriteAddress(id) {

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'POST',
      resource: 'users',
      endpoint: '/setFavoriteAddress',
      data: {
        addressId: this.state.addresses[id].id
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.setState({
        selectedAddress: this.state.addresses[id],
        favoriteAddress: this.state.addresses[id].street + ', ' + this.state.addresses[id].exteriorNumber + ', Colonia ' + this.state.addresses[id].location + ', ' + this.state.addresses[id].zip + ', ' + this.state.addresses[id].municipality + ', ' + this.state.addresses[id].state + '. ' + this.state.addresses[id].name + ' - ' + this.state.addresses[id].phone
      })

      this.state.addresses[id].favoriteAddress = this.state.addresses[id].street + ', ' + this.state.addresses[id].exteriorNumber + ', Colonia ' + this.state.addresses[id].location + ', ' + this.state.addresses[id].zip + ', ' + this.state.addresses[id].municipality + ', ' + this.state.addresses[id].state + '. ' + this.state.addresses[id].name + ' - ' + this.state.addresses[id].phone
      await this.loadData()
    }
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

  // async componentWillMount() {
  //   if (!this.props.editAddress) {
  //     return
  //   }

  //   let address = { ...this.props.editAddress }

  //   await this.setState({
  //     values: address,
  //     lat: (this.props.editAddress.lat === 0) ? '' : this.props.editAddress.lat,
  //     lng: (this.props.editAddress.lng === 0) ? '' : this.props.editAddress.lng,
  //     oldAddress: { ...this.props.editAddress }

  //   })
  //   this.checkZip()
  // }

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
          needsCoords: false,
          values: values
        })
      }
      this.setState({
        openMapModal: true
      })
      return
    } else {
      this.setState({ disabled: true })

      var address = {
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
        phone: this.state.values.phone
      }

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
          phone: this.state.values.phone,
          lat: this.state.lat,
          lng: this.state.lng
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        let address = response.data.createdAddress;
        this.clearData()
        //this.props.handleConfirmWithAddress(address)
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
    else if (this.state.values.name === '') {
      error = true
      errorMessage = 'Nombre no válido'
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
        phone: ''
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
      <div className={classes.container} >
        <Grid container>

          <Grid item xs={12}>
            <Typography variant='h3'> Mis domicilios </Typography>
          </Grid>


          <Grid item xs={12}>
            <Paper className={classes.card} >
              <Grid container spacing={3}>

                <Grid item xs={12}>
                  <Typography variant='body1' >Nuevo domicilio</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Line color='yellow' />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Nombre completo"
                    fullWidth
                    autoFocus
                    value={this.state.values.name}
                    onChange={(event) => { this.handleChangeValues('name', event) }}
                    size="small"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Código Postal"
                    fullWidth
                    value={this.state.values.zip}
                    onChange={(event) => { this.handleChangeValues('zip', event) }}
                    size="small"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Estado"
                    fullWidth
                    disabled
                    //className={classes.textField}
                    value={this.state.values.stateName}
                    //onChange={this.handleChange('name')}
                    //margin="normal"
                    size="small"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Delegación/municipio"
                    fullWidth
                    disabled
                    //className={classes.textField}
                    value={this.state.values.cityName}
                    //onChange={this.handleChange('name')}
                    //margin="normal"
                    size="small"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  {/* <TextField
                    label="Colonia"
                    fullWidth
                    //className={classes.textField}
                    value={this.state.name}
                    //onChange={this.handleChange('name')}
                    //margin="normal"
                    size="small"
                    variant="outlined"
                  /> */}
                  <FormControl style={{ width: '100%' }}>

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

                <Grid item xs={12}>
                  <TextField
                    label="Calle"
                    fullWidth
                    //className={classes.textField}
                    value={this.state.values.street}
                    onChange={(event) => { this.handleChangeValues('street', event) }}
                    //margin="normal"
                    size="small"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={6}>
                      <TextField
                        label="Número exterior"
                        fullWidth
                        //className={classes.textField}
                        value={this.state.values.exteriorNumber}
                        onChange={(event) => { this.handleChangeValues('exteriorNumber', event) }}
                        //margin="normal"
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Número interior (opcional)"
                        fullWidth
                        //className={classes.textField}
                        value={this.state.values.interiorNumber}
                        onChange={(event) => { this.handleChangeValues('interiorNumber', event) }}
                        //margin="normal"
                        size="small"
                        variant="outlined"
                      />
                    </Grid>

                  </Grid>




                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Entre calles"
                    fullWidth
                    //className={classes.textField}
                    value={this.state.values.betweenStreets}
                    onChange={(event) => { this.handleChangeValues('betweenStreets', event) }}
                    //margin="normal"
                    size="small"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Referencias"
                    multiline
                    fullWidth
                    //className={classes.textField}
                    value={this.state.values.reference}
                    onChange={(event) => { this.handleChangeValues('reference', event) }}
                    size="small"
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Teléfono (para asistir la entrega)"
                    fullWidth
                    value={this.state.values.phone}
                    onChange={(event) => { this.handleChangeValues('phone', event) }}
                    size="small"
                    variant="outlined"
                  />
                </Grid>

                {/* <Grid item xs={12}>
                  <TextField
                    label="Ponle un nombre a este domicilio"
                    fullWidth
                    //className={classes.textField}
                    value={this.state.name}
                    //onChange={this.handleChange('name')}
                    //margin="normal"
                    size="small"
                    variant="outlined"
                  />
                </Grid> */}


                {
                  (this.state.lat !== null && this.state.lng) ?
                    <Grid item xs={12}>
                      <Typography variant='body1' >Selecciona la dirección correcta de tu casa.</Typography>
                      <GoogleMapReact
                        style={{ width: '99%', height: '360px', position: 'relative' }}
                        bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
                        // center={{
                        //   lat: (this.state.lat !== null ) ? this.state.lat : 25.8257,
                        //   lng: (this.state.lng !== null ) ? this.state.lng : -108.214,
                        // }}
                        center={{
                          lat: (this.state.lat !== null) ? this.state.lat : 25.8257,
                          lng: (this.state.lng !== null) ? this.state.lng : -108.214,
                        }}
                        zoom={(this.state.lat !== null) ? 17 : 5}
                        onClick={(event) => {
                          this.setState({
                            lat: event.lat,
                            lng: event.lng,
                            //openSnack: true,
                            messageSnack: 'Ubicación seleccionada con éxito.'
                          })
                        }}
                      >
                        <div lat={this.state.lat} lng={this.state.lng}><img style={{ marginTop: -20, marginLeft: -20, width: 50, height: 50 }} src="/house.png" /></div>
                      </GoogleMapReact>

                    </Grid>
                    :
                    ''
                }

                <Grid item xs={12}>
                  {/* <Button variant="contained" style={{ background: 'green', color: 'white', width: '100%' }} onClick={() => {
                      //this.confirmLocation()
                    }}
                    >
                      CONFIRMAR UBICACIÓN DE ENTREGA
                  </Button> */}
                </Grid>





              </Grid>
            </Paper>

          </Grid>

          <Grid item xs={12} style={{ marginTop: '20px' }} >
            <Grid container>
              <Grid item xs={3}>
                <button onClick={() => {
                  this.setState({ disabled: true })
                  this.handleConfirm()
                }} className={classes.blueButton} >Guardar domicilio</button>
              </Grid>
              <Grid item xs={3}>
                <button className={classes.whiteButton} >Cancelar</button>
              </Grid>


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
                onClick={() => { this.setState({ openSnack: false }) }}
              >
                <CloseIcon />
              </IconButton>
            ]}
          />





        </Grid>
      </div>
    )


  }
}

export default withStyles(style)(AddressNew)