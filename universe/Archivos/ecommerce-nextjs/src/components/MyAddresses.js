import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

//material
import { Grid, Typography, Checkbox, Button } from '@material-ui/core'
import { withTheme, withStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

//components
import Empty from '../components/Empty'
import AddressForm from '../components/AddressForm'
import AddressModal from '../components/AddressModal'
import Router from 'next/router'

//utils
import { requestAPI } from '../api/CRUD'
import Utils from '../resources/Utils'
import messages from '../resources/Messages.json'
import { setNewDeliveryAddress, deleteDeliveryAddress } from '../actions/actionDeliveryAddress'

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
    cursor: 'pointer',
    backgroundColor: "transparent",
    color: '#1F2B4E',
    textDecoration: 'underline',
    border: "none",
    marginRight: "16px",
    fontSize: 16,
    '&:hover': {
      color: "#0076BD"
    },
    [theme.breakpoints.down('xs')]: {
      marginRight: "0px",
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
  }
})

class MyAddresses extends Component {
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
      expandAddressButtonDisabled: false
    }
    this.loadData = this.loadData.bind(this)
    this.handleConfirmWithAddress = this.handleConfirmWithAddress.bind(this)
    this.handleSelectAddress = this.handleSelectAddress.bind(this)
    this.handleEditAddress = this.handleEditAddress.bind(this)
    this.deleteAddress = this.deleteAddress.bind(this)
    this.openEditAddressModal = this.openEditAddressModal.bind(this)
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
        <Grid item style={{ display: "block", float: 'right' }}>
          {
            (this.state.addresses.length > 0) ?
              <button
                className={classes.expandButton}
                disabled={self.state.expandAddressButtonDisabled}
                onClick={() => {
                  this.setState({
                    expandAddresses: !this.state.expandAddresses
                  })
                }}
              ><Typography className={classes.buttonText}><strong>{(!this.state.expandAddresses) ? "CAMBIAR" : "CANCELAR"}</strong></Typography></button>
              : ""
          }
        </Grid>
        <Grid item xs={12}>
          {
            (this.state.loadedAddress) ?
              (this.state.addresses.length > 0) ?
                (!this.state.expandAddresses) ?
                  (this.state.selectedAddress) ?
                    <Grid container className={classes.addressBox} >
                      <Grid item xs={1}>
                        <Checkbox
                          checked={(!this.state.expandAddressButtonDisabled)}
                          value="secondary"
                          color="primary"
                          className={classes.chkBox}
                          inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />
                      </Grid>
                      <Grid item xs={10}>
                        <Typography><strong>{(this.state.selectedAddress.name + ' ' + this.state.selectedAddress.lastName).trim().toUpperCase()}</strong></Typography>
                        <Typography>{this.state.selectedAddress.street + " " + this.state.selectedAddress.exteriorNumber + ", " + this.state.selectedAddress.location}</Typography>
                        <Typography>{this.state.selectedAddress.municipality + ", " + this.state.selectedAddress.state + ", México"}</Typography>
                        <Typography>{this.state.selectedAddress.phone}</Typography>
                      </Grid>
                    </Grid>
                    :
                    <Empty
                      isLoading={true}
                      title="Cargando"
                      description="Espere un momento por favor."
                    />
                  :
                  <Grid >{
                    this.state.addresses.map(function (address, idx) {
                      return (
                        <Grid container className={classes.addressBox} key={idx}>
                          <Grid item xs={1}>
                            <Checkbox
                              checked={self.state.checkbox[idx].check}
                              value="secondary"
                              color="primary"
                              className={classes.chkBox}
                              inputProps={{ 'aria-label': 'secondary checkbox' }}
                              onClick={() => {
                                self.handleSelectAddress(idx, address)
                              }}
                            />
                          </Grid>
                          <Grid item xs={10}>
                            <Grid container >
                              <Grid item >
                                <Typography><strong>{(address.name + ' ' + address.lastName).trim().toUpperCase()}</strong></Typography>
                              </Grid>
                              <Grid item style={{ display: "block", marginLeft: "auto" }}>
                                <button className={classes.buttonText} onClick={() => { self.openEditAddressModal(address, idx) }}>EDITAR</button>
                              </Grid>
                            </Grid>
                            <Grid item container>
                              <Typography>{address.street + " " + address.exteriorNumber + ", " + address.location}</Typography>
                            </Grid>
                            <Grid item container>
                              <Typography>{address.municipality + ", " + address.state + ", México"}</Typography>
                            </Grid>
                            <Grid item container>
                              <Typography>{address.phone}</Typography>
                            </Grid>
                            <Grid container justify="center">
                              <Button
                                className={classes.sendHereButton}
                                onClick={() => {
                                  self.handleSelectAddress(idx, address)
                                }}
                              >Enviar a esta dirección</Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      )
                    })
                  }
                    <Grid item xs={10} sm={8} md={8} lg={4}>
                      <Button
                        className={classes.sendHereButton}
                        onClick={() => {
                          this.setState({
                            openAddressModal: true
                          })
                        }}
                      >Agregar nueva dirección</Button>
                    </Grid>

                  </Grid>
                :
                <Grid xs={11} style={{ marginTop: 24 }}>
                  <AddressForm
                    handleConfirmWithAddress={self.handleConfirmWithAddress}
                  />
                </Grid>
              :
              <div style={{ marginTop: 54 }}>
                <Empty
                  isLoading={true}
                  title="Cargando direcciones..."
                  description="Espere un momento por favor."
                />
              </div>
          }
          {/* MODAL QUE AGREGA UNA DIRECCION */}

          <AddressModal
            open={this.state.openAddressModal}
            host={Utils.constants.CONFIG_ENV.HOST}
            mode="create"
            handleConfirmWithAddress={this.handleConfirmWithAddress}
            handleClose={() => { this.setState({ openAddressModal: false }) }}
          />

          {/* MODAL QUE EDITA UNA DIRECCION */}

          <AddressModal
            open={this.state.openEditAddressModal}
            handleDeleteAddress={() => { self.deleteAddress(this.state.editIdx, this.state.editAddress) }}
            editAddress={this.state.editAddress}
            handleEditAddress={(address, location) => { this.handleEditAddress(address, location) }}
            handleClose={() => { this.setState({ openEditAddressModal: false, editAddress: "", editIdx: "" }) }}
          />

          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.state.openSnack}
            onClose={() => this.setState({ openSnack: false, messageSnack: '' })}
            message={
              <span>{this.state.messageSnack}</span>
            }
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => this.setState({ openSnack: false, messageSnack: '' })}
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

export default compose(withStyles(styles),connect(mapStateToProps, mapDispatchToProps))(MyAddresses)
