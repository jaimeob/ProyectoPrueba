import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import { Typography, FormControl, Select } from '@material-ui/core'

// Components
import Title from '../../components/Title'
import GoogleMap from '../../components/GoogleMap'
import BenefitBlock from '../../components/BenefitBlock'
import NewsletterBlock from '../../components/NewsletterBlock'

// Utils
import Utils from '../../resources/Utils'
import { getDataAPI } from '../../api/CRUD'

const styles = theme => ({
  root: {
    width: '90%',
    margin: '32px auto',
  },
  formContainer: {
    marginTop: 0,
    marginBottom: 12,
  },
  map: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0
    }
  },
  formControl: {
    width: '90%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  myLocation: {
    float: 'left',
    color: "#283A78",
    marginLeft: "0px",
    cursor: "pointer",
    fontSize: '16px',
  },
  myLocationContainer: {
    width: 180,
    [theme.breakpoints.down('sm')]: {
      width: 'auto'
    }
  },
  storeLocationContainer: {
    paddingRight: "32px",
    [theme.breakpoints.down('xs')]: {
      paddingRight: "0px"
    }
  }
})

class TiendasView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rows: [],
      zones: [],
      stores: [],
      selectedZone: null,
      branches: [],
      selectedBranchId: null,
      selectedBranch: {},
      zoom: 13,
      userCoords: {
        lat: null,
        lng: null
      },
      mapMarker: null,
      messageErrorLocation: false
    }

    this.getPosition = this.getPosition.bind(this)
    this.handleClickBranch = this.handleClickBranch.bind(this)
  }
  
  componentWillMount() {
    this.getPosition()
  }

  async componentDidMount() {
    this.getZones()
    Utils.scrollTop()
  }

  async getPosition() {
    let self = this

    let options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }

    function success (location) {
      self.setState({
        userCoords: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        },
        selectedBranch: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        },
        selectedBranchId: null,
        selectedZone: null,
        zoom: 12,
        messageErrorLocation: false
      }, () => {
        self.getStores()
      })
    }

    function error (err) {
      self.setState({
        messageErrorLocation: true
      }, () => {
        self.getStores()
      })
      console.log(err)
    }

    navigator.geolocation.getCurrentPosition(success, error, options)
  }

  async getStores (){
    const businessUnit = this.props.app.data.configs.businessUnit

    const stores = this.props.stores

    let newStores = []

    stores.map(store => {
      if (store.businessUnit.code === businessUnit){
        newStores.push(store)
      }
    })

    if (this.state.userCoords.lat !== null && this.state.userCoords.lng !== null) {
      newStores = newStores.sort((a, b) => {
        return (Utils.distance(this.state.userCoords, a) - Utils.distance(this.state.userCoords, b))
      })
    }

    var marker = ""

    switch(businessUnit){
      case 8: marker = '/calzzapato-marker.svg'; break
      case 9: marker = '/kelder-marker.svg'; break
      case 2: marker = '/urbanna-marker.svg'; break;
    }

    this.setState({
      mapMarker: marker,
      stores: newStores
    })
  }

  async getZones() {
    let response = await getDataAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: 'zones',
      filters: {
      }
    })

    if (response.data.length > 0) {
      this.setState({
        zones: response.data,
      })
    }
  }

  async handleChangeZones(event) {
    let zone = event.target.value

    this.setState({ selectedZone: zone })
    
    let branches = []
    
    this.state.stores.map(item => {
      if (item.zone._id === zone){
        branches.push(item)
      }
    })
  
    this.setState({
      branches
    })
  }

  async handleChangeBranch(event) {
    let stores = this.state.stores
    let branch = event.target.value
    let selectedBranch = {}

    this.setState({ selectedBranchId: branch })

    for (let i = 0; i < stores.length; i ++){
      if (stores[i].id === branch){
        selectedBranch = stores[i]
        break
      }
    }

    this.setState({
      selectedBranch: selectedBranch,
      zoom: 13
    })
  }

  async handleClickBranch(branch){
    let stores = this.state.stores
    let selectedBranch = {}

    this.setState({ selectedBranchId: branch.id })
    
    for (let i = 0; i < stores.length; i ++){
      if (stores[i].id === branch.id){
        selectedBranch = stores[i]
        break
      }
    }

    this.setState({
      selectedBranch: selectedBranch,
      zoom: 13
    })
  }

  render() {
    const { classes } = this.props

    return (
      <Grid>
        <Grid className={classes.root}>
          <Grid container style={{ margin: '16px auto 0 auto' }}>
            <Grid container style={{ marginBottom: 12 }}>
              <Grid item xs={12}>
                <Title
                  title="Ubica tu tienda."
                  description="Nos encontramos en todo el noroeste del país."
                />
              </Grid>
            </Grid>
            <Grid item xs={12} className={classes.formContainer}>
              <Grid container style={{ margin: 0, padding: 0, paddingBottom: 0, height: 'auto' }}>
                <Grid item xs={12} md={5}>
                  <Typography variant="body1"><strong>Plaza:</strong></Typography>
                  <FormControl variant="outlined" className={classes.formControl}>
                    <Select
                      native
                      value={this.state.selectedZone}
                      onChange={(event) => { this.handleChangeZones(event) }}
                    >
                      <option value=''>Seleccione una plaza...</option>
                      {
                        (this.state.zones.length > 0) ?
                          this.state.zones.map(function (zones) {
                            return (
                              <option
                                key={zones.id}
                                value={zones.id}
                              >{zones.name}</option>
                            )
                          })
                          :
                          ''
                      }
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Typography variant="body1"><strong>Sucursal:</strong></Typography>
                  <FormControl variant="outlined" className={classes.formControl}>
                    <Select
                      native
                      value={this.state.selectedBranchId || 0}
                      onChange={(event) => { this.handleChangeBranch(event) }}
                    >
                      <option value=''>Seleccione una sucursal...</option>
                      {
                        (this.state.branches.length > 0) ?
                          this.state.branches.map(function (data, index) {
                            return (
                              <option key={index} value={data.id}>{data.name}</option>
                            )
                          })
                          :
                          ''
                      }
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2} style={{ alignSelf: "flex-end" }}>
                  <Grid container className={classes.myLocationContainer}>
                    <svg style={{ float: 'left', display: 'inline-block' }} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.135 2 5 5.135 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.135 15.865 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#283A78" />
                    </svg>
                    <Typography className={classes.myLocation} onClick={() => { this.getPosition() }}><strong>Utiliza mi ubicación</strong></Typography>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={12} style={{ marginTop: 22 }}>
                  {
                    (this.state.messageErrorLocation) ?
                    <div style={{ background: '#ff5454', color: 'white', textAlign: 'center', padding: 12, borderRadius: 8 }}>
                      <Typography variant="body1" style={{ color: 'white' }}>No se está utilizando la localización del navegador. Proporciona permisos para darte una mejor experiencia.</Typography>
                    </div> 
                    :
                    ''
                  }
                  {
                    (this.state.selectedBranchId) ?
                      <Grid container style={{ border: '2px solid #E5E5E5', borderRadius: "10px", fontFamily: "Circular Std", margin: "8px auto 8px auto", padding: "8px 32px 8px 32px" }} xs={12}>
                        <Grid item xs={12} sm={8} className={classes.storeLocationContainer}>
                          <Typography style={{ color: "#343A48" }}><strong>{this.state.selectedBranch.name}</strong></Typography>
                          <Typography style={{ color: "#343A48" }}>{(this.state.selectedBranch.suburb !== "")? this.state.selectedBranch.suburb + ',' : ''} {(this.state.selectedBranch.street !== "")? this.state.selectedBranch.street + ',' : ''} </Typography>
                          <Typography style={{ color: "#343A48" }}>{(this.state.selectedBranch.municipality !== "")? this.state.selectedBranch.municipality + ',': ''} {(this.state.selectedBranch.state !== "")? this.state.selectedBranch.state + ',' : ''} {(this.state.selectedBranch.country !== "")? this.state.selectedBranch.country + '.' : '.'}</Typography>
                        </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography style={{ color: "#343A48" }}>Teléfono: <strong>{(this.state.selectedBranch.phone !== "")? this.state.selectedBranch.phone: "-" }</strong></Typography>
                            <Typography style={{ color: "#343A48" }}>Distancia: <strong>{Utils.distance(this.state.userCoords, this.state.selectedBranch).toFixed(2)} KM</strong></Typography>
                          </Grid>
                      </Grid>

                      :
                      ''
                  }
                </Grid>

              </Grid>
            </Grid>
            {
              (this.state.stores.length > 0)?
                <Grid container className={classes.map} style={{ width: '100%', height: '496px', marginTop: 16 }} xs={12} justify="center">
                  <GoogleMap
                    lat={this.state.selectedBranch.lat}
                    lng={this.state.selectedBranch.lng}
                    userCoords={this.state.selectedBranch}
                    zoom={this.state.zoom}
                    branches={this.state.stores}
                    handleClickBranch={this.handleClickBranch}
                    mapMarker={this.state.mapMarker}
                  />
                </Grid>
              : ''
            }
          </Grid>
        </Grid>
        <Grid>
          <BenefitBlock
            title="Grandes beneficios."
            description=""
          />
          <NewsletterBlock
            title="Newsletter."
            description="Novedades, promociones, ofertas y mucho más. Déjanos tu correo electrónico."
          />
        </Grid>
      </Grid>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(TiendasView)
