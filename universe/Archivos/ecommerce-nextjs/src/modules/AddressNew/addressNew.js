import React, { Component } from 'react'

//components
import MyAddresses from '../../components/MyAddresses'
import MyAccountMenu from '../../components/MyAccountMenu'
import AddressCard from '../../components/AddressCard'

import { requestAPI } from '../../api/CRUD'

//material
import { withStyles, Grid, Typography, Hidden } from '@material-ui/core'
import Utils from '../../resources/Utils'

import Link from 'next/link'
import Router from 'next/router'



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
    marginLeft: 9,
    display: 'block',
    marginLeft: 'auto',
    paddingBottom: '13px',
    paddingTop: '13px',
    borderRadius: '4px',
    background: '#22397c',
    cursor: 'pointer'
  }

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
      expandAddressButtonDisabled: false
    }

    this.handleChangeFavoriteAddress = this.handleChangeFavoriteAddress.bind(this)




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

  render() {
    const { classes } = this.props

    return (
      <div className={classes.container} >
        <Grid container>

          <Grid item xs={12}>
            <Typography variant='h3'> Mis domicilios </Typography>
          </Grid>

          <Grid item xs={12} style={{ marginBottom: '30px' }} >
            <Grid container>
              <Grid item xs={6}>
                .
              </Grid>
              <Grid item xs={6}>
                <button onClick={() => { Router.push('/') }} className={classes.blueButton} >Nuevo domicilio</button>
              </Grid>
            </Grid>
          </Grid>


          <Grid item xs={12}>
            <Grid container spacing={2} >
              {
                this.state.addresses.map((address, idx) => {
                  return (
                    <Grid item xs={6}>
                      <AddressCard
                        address={address}
                        changeAddress={(i) => { (i !== null && i !== undefined && i !== -1) ? this.handleChangeFavoriteAddress(i) : '' }}
                        //changeAddress={ (i) => { console.log('Holaaa changeAddress', i) } }
                        idx={idx}
                      />
                    </Grid>
                  )
                })
              }



            </Grid>
          </Grid>








        </Grid>
      </div>
    )


  }
}

export default withStyles(style)(AddressNew)