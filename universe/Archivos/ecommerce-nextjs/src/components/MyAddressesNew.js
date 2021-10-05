import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material
import { Grid, Typography, Checkbox, Button } from '@material-ui/core'
import { withTheme, withStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add';


// Components
import AddressFormNew from './AddressFormNew'
import AddressModal from './AddressModal'
import AddressCardNew from './AddressCardNew'

import Router from 'next/router'

// Utils
import { requestAPI } from '../api/CRUD'
import Utils from '../resources/Utils'
import messages from '../resources/Messages.json'
import { setNewDeliveryAddress, deleteDeliveryAddress } from '../actions/actionDeliveryAddress'
import Loading from './Loading'

const styles = theme => ({
  addressBox: {
    backgroundColor: "white",
    margin: "16px 0px 16px 0px",
    border: "2px solid #E0E0E0",
    borderRadius: "10px",
    padding: "20px 20px 20px 20px",
    [theme.breakpoints.down('xs')]: {
      padding: "8px",
    }
  },
  expandButton: {
    border: "none",
    backgroundColor: "transparent"
  },
  buttonText: {
    width: '100%', 
    textTransform: 'none', 
    fontWeight: 'bold',
    // '&:hover': {
    //   color: "#0076BD"
    // },
    [theme.breakpoints.down('xs')]: {
      fontSize:'10px',
    }
  },
  sendHereButton: {
    backgroundColor: "white",
    marginTop: "8px",
    color: "#283A78",
    border: "2px solid #283A78",
    width: "100%",
  },
  chkBox: {
    margin: "0px 0px 0px 0px",
    padding: "8px 0px 0px 0px"
  },
  root: {
    maxWidth: 800,
    [theme.breakpoints.down('sm')]: {
      margin: '0 auto',
    }
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
  },
})

class MyAddressesNew extends Component {
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

      form: false,
      editAddress: null

    }
    this.loadData = this.loadData.bind(this)
    this.handleConfirmWithAddress = this.handleConfirmWithAddress.bind(this)
    this.handleSelectAddress = this.handleSelectAddress.bind(this)
    this.handleEditAddress = this.handleEditAddress.bind(this)
    this.deleteAddress = this.deleteAddress.bind(this)
    this.openEditAddressModal = this.openEditAddressModal.bind(this)
    this.handleChangeAddress = this.handleChangeAddress.bind(this)
  }


  async handleChangeAddress(id) {
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
      this.props.handleChangeFavoriteAddress(id)
      this.props.handleClose()
    }
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
                if (self.props.selectedAddress)
                  self.props.selectedAddress(self.state.addresses[i])
                self.props.setNewDeliveryAddress({
                  zip: self.state.addresses[i].zip,
                  state: self.state.addresses[i].state,
                  city: self.state.addresses[i].municipality
                })
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

  handleConfirmWithAddress(address) {
    const self = this
    let addressess = this.state.addresses
    addressess.push(address)

    let checkbox = []
    if (addressess.length > 0) {
      addressess.forEach(function (item) {
        if (item.id === address.id) {
          checkbox.push({ check: true })
        } else {
          checkbox.push({ check: false })
        }
      })
    }

    this.setState({
      addresses: addressess,
      loadedAddress: true,
      openAddressModal: false,
      expandAddresses: false,
      selectedAddress: address,
      expandAddressButtonDisabled: false,
      checkbox,
      openSnack: true,
      messageSnack: 'Dirección guardada correctamente.'
    }, () => {
      if (self.props.selectedAddress)
        self.props.selectedAddress(address)
      self.props.setNewDeliveryAddress({
        zip: address.zip,
        state: address.state,
        city: address.municipality
      })
    })

    this.props.loadData()
  }

  async handleSelectAddress(idx, address) {
    const self = this
    let checkbox = this.state.checkbox
    checkbox.forEach(function (check, i) {
      if (idx === i) {
        checkbox[idx].check = true
      }
      else
        checkbox[i].check = false
    })

    let selectedAddress = address

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'POST',
      resource: 'users',
      endpoint: '/setFavoriteAddress',
      data: {
        addressId: selectedAddress.id
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.setState({
        checkbox: checkbox,
        selectedAddress: selectedAddress,
        expandAddresses: false,
        expandAddressButtonDisabled: false,
        openSnack: true,
        messageSnack: 'Dirección seleccionada correctamente.'
      }, () => {
        if (self.props.selectedAddress)
          self.props.selectedAddress(selectedAddress)
        self.props.setNewDeliveryAddress({
          zip: selectedAddress.zip,
          state: selectedAddress.state,
          city: selectedAddress.municipality
        })
      })
    }
  }

  async handleEditAddress(address, location) {
    const self = this

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'PUT',
      resource: 'addresses',
      endpoint: '/update',
      data: {
        values: address,
        location: location
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      let addresses = this.state.addresses
      addresses.forEach((addressFE, pos) => {
        if (addressFE.id === address.id) {
          addresses[pos] = address
          this.setState({
            addresses,
            messageSnack: "Dirección guardada correctamente.",
            openSnack: true
          }, () => {
            if (this.state.selectedAddress.id === address.id) {
              this.setState({
                selectedAddress: address
              }, () => {
                if (self.props.selectedAddress)
                  self.props.selectedAddress(address)
                self.props.setNewDeliveryAddress({
                  zip: address.zip,
                  state: address.state,
                  city: address.municipality
                })
              })
            }
          })
        }
      })
    } else {
      this.setState({
        messageSnack: messages.General.error,
        openSnack: true
      })
    }
    this.props.loadData()

  }

  async deleteAddress(idx, address) {
    const self = this
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'DELETE',
      resource: 'addresses',
      endpoint: '/delete',
      data: {
        addressId: address.id
      }
    })

    if (this.state.addresses[idx] === this.state.selectedAddress) {
      this.setState({
        selectedAddress: '',
        expandAddresses: true,
        expandAddressButtonDisabled: true,
      }, () => {
        if (self.props.selectedAddress)
          self.props.selectedAddress('')
        self.props.deleteDeliveryAddress()
      }
      )
    }

    let error = true
    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.deleted) {
        let addresses = this.state.addresses
        addresses.splice(idx, 1)
        let checkboxx = this.state.checkbox
        checkboxx.splice(idx, 1)

        this.setState({
          checkbox: checkboxx,
          addresses: addresses,
          openEditAddressModal: false,
          openSnack: true,
          messageSnack: "Dirección borrada correctamente."
        })

        error = false
      }
    }

    if (error) {
      this.setState({
        openSnack: true,
        errorMessage: messages.General.error
      })
    }
  }

  openEditAddressModal(address, idx) {
    this.setState({
      openEditAddressModal: true,
      editAddress: address,
      editIdx: idx
    })
  }

  render() {
    const self = this
    const { classes } = this.props

    return (
      <Grid className={classes.root}>
        {
            <Grid container>
              {
                (this.state.addresses.length > 0 && !this.state.form) ?
                  <div style={{ width: '100%' }}>
                    <Typography className={classes.title}>Selecciona tu dirección de entrega</Typography>
                    {
                      this.state.addresses.map(function (address, idx) {
                        return (
                          <Grid item xs={12}>
                            <AddressCardNew
                              data={address}
                              handleChangeAddress={() => { self.handleChangeAddress(idx) }}
                              handleEditAddress={() => { self.setState({ form: !self.state.form, editAddress: address }) }}
                              openClickAndCollect={ ()=> {  } }
                            />
                          </Grid>
                        )
                      })
                    }
                    <Grid container>
                      <Grid item xs={12} >
                        <Grid container spacing={2} style={{ marginTop: '20px' }} >
                          <Grid style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} item xs={6}>
                            <Button onClick={() => { this.props.handleClose() }} style={{ width: '100%', textTransform: 'none', fontWeight: 'bold' }} variant='outlined' color="primary" >Cancelar</Button>
                          </Grid>
                          <Grid style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} item xs={6}>
                            <Button onClick={() => { this.setState({ form: !this.state.form }) }} className={classes.buttonText} variant='contained' color="primary" >
                              <AddIcon></AddIcon>
                            Agregar nueva dirección
                          </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>

                  </div>
                  :
                  <Grid item xs={12}>
                    <AddressFormNew
                      handleConfirmWithAddress={self.handleConfirmWithAddress}
                      editAddress={this.state.editAddress}
                      cancelButton={() => { this.setState({ form: !this.state.form }) }}
                      handleClose={() => { this.props.handleClose() }}
                      handleEditAddress={(address, location) => { this.handleEditAddress(address, location) }}
                    />
                  </Grid>

              }
            </Grid>
        }
      </Grid>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    setNewDeliveryAddress: (address) => {
      dispatch(setNewDeliveryAddress(address))
    },
    deleteDeliveryAddress: () => {
      dispatch(deleteDeliveryAddress())
    }
  }
}

export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(MyAddressesNew)
