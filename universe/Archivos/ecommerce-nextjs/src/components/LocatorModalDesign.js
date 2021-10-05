import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import GoogleMapReact from 'google-map-react'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Modal, Typography, Button, Grid, Select, TextField, FormControl, Snackbar, Table, TableContainer, TableBody, TableCell, TableHead, TableRow} from '@material-ui/core'
import { Close } from '@material-ui/icons'
import { getDataAPI } from '../api/CRUD'
import HotShoppingNew from '../components/HotShoppingNew'
import MobilePhotos from '../components/MobilePhotos'

import {
  SideBySideMagnifier,
  TOUCH_ACTIVATION
} from "react-image-magnifiers"

import Utils from '../resources/Utils'
import { size } from 'lodash'

function getModalStyle() {
  const top = 50
  const left = 50
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  }
}

const styles = theme => ({
  largeForm: {
    overflowY: 'scroll',
    overflowX: 'hidden',
    position: 'absolute',
    width: theme.spacing(120),
    minWidth: theme.spacing(120),
    maxWidth: theme.spacing(120),
    maxHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '2px',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      background: theme.palette.background.paper,
      minWidth: '100%',
      width: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      paddingLeft: '2.5%',
      paddingRight: '2.5%'
    }
  },
  scrollBar: {
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px'
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      'border-radius': '4px',
      'background-color': 'rgba(0,0,0,.5)',
      '-webkit-box-shadow': '0 0 1px hsla(0,0%,100%,.5)'
    }
  },
  form: {
    marginTop: 16
  },
  select: {
    marginTop: 16
  },
  closeButton: {
    float: 'right',
    [theme.breakpoints.down('sm')]: {
      marginTop: 8
    }
  },
  pin: {
    background: '#3091E5',
    width: '25px',
    height: '25px',
    border: '3px solid white',
    borderRadius: '100%',
    color: 'white',
    textAlign: 'center'
  },
  selectedPin: {
    background: 'red',
    width: '25px',
    height: '25px',
    border: '3px solid white',
    borderRadius: '100%',
    color: 'white',
    textAlign: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: '#111110',
    margin: '4px 0'
  },
  code: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#808080',
    margin: '4px 0'
  },
  table: {
    minWidth: 400,
  },
  buyNowButton: {
    width: '96%',
    marginRight: '4%',
    height: 44,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#22397C',
    textTransform: 'none'
  },
  buyNowButtonText: {
    fontSize: 16,
    fontWeight: 500,
    color: 'white'
  },
  separatorLine: {
    height: 1,
    border: 'none',
    background: '#EDEEF2',
  }
})

const CustomTableCell = withStyles({
  root: {
    borderBottom: "none"
  }
})(TableCell);

class LocatorModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedStore: null,
      stores: [],
      openSnack: false,
      errorMessage: '',
      selectedLocation: '',
      urlMap: 'https://www.google.com/maps/embed?key=AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo',
      locations: [],
      location: null,
      selectedSize: '',
      selectedArticle: '',
      totalAvailable: '',
      isVertical: false,
      selectedPhoto: "",
      loadingProduct: false,
      stock: true,
      openHotShoppingModal: false,
      sizeSelected: 0,
      sizes: []

    }

    this.handleChangeValues = this.handleChangeValues.bind(this)
    this.handleChangeLocation = this.handleChangeLocation.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.clearData = this.clearData.bind(this)
    this.loadStores = this.loadStores.bind(this)
    this.handleOpenHotShoppingModal = this.handleOpenHotShoppingModal.bind(this)
  }

  componentWillMount() {
    let sizes = []

    this.props.data.sizes.forEach((size) => {
      if (size.quantity > 0){
        sizes.push(size)
      }
    })

    this.setState({
      sizes: sizes,
      selectedSize: (this.props.data.selectedSize)? this.props.data.selectedSize : sizes[0].size,
    }, () => this.loadStores())

  }

  async loadStores() {
    const self = this

    let response = await getDataAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: 'stores'
    })

    let stores = []
    let sizes = this.props.data.sizes
    let sizeSelected = this.state.selectedSize

    sizes.forEach((size) => {
      if (Number(size.size) === Number(sizeSelected)) {
        size.detail.forEach((detail) => {
          response.data.forEach((store) => {
            if (detail.branch === store.code) {
              stores.push({
                code: store.code,
                name: store.name,
                suburb: store.suburb,
                street: store.street,
                city: store.location,
                state: store.state,
                exteriorNumber: store.exteriorNumber,
                interiorNumber: store.interiorNumber,
                phone: store.phone,
                article: detail.article,
                size: detail.size,
                stock: detail.stock,
                lat: store.lat,
                lng: store.lng
              })
            }
          })
        })
      }
    })

    this.setState({
      stores: stores,
      selectedSize: sizeSelected,
      selectedPhoto: this.props.data.product.photos[0].description,
      selectedStore: null
    })
  }

  async handleChangeValues(param, event) {
    let values = this.state.values
    values[param] = event.target.value
    this.setState({
      values: values
    })
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
        }

        if (response.data.length > 0) {
          this.setState({
            locations: response.data,
            values: values
          })
        }
      }
      else {
        this.setState({
          locations: []
        })
      }
    }
    else {
      this.setState({
        locations: []
      })
    }
  }

  handleChangeLocation(event) {
    let location = event.target.value
    this.setState({
      selectedLocation: location
    })
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      errorMessage: ''
    })
  }

  handleClose() {
    this.clearData()
    this.props.close()
  }

  clearData() {
    this.setState({
      selectedStore: null,
      stores: [],
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
      }
    })
  }

  async handleChangeSizes(event, option) {
    const self = this
    let totalAvailable = null
    let size = Number(event)
    let selectedArticle = ''

    this.props.data.sizes.forEach((item) => {
      if (Number(item.size) === size) {
        selectedArticle = item.detail[0].article
        totalAvailable = item.quantity
      }
    })

    this.setState({
      location: null,
      selectedSize: size,
      selectedArticle: selectedArticle,
      totalAvailable: totalAvailable
    })
    this.loadStores()

  }

  handleOpenHotShoppingModal(event) {
    event.preventDefault()
   
    if (!Utils.isUserLoggedIn()) {
      this.setState({ openSnack: true, messageSnack: 'Es necesario iniciar sesión.', clickFrom: 'login' })
      return
    }

    if (this.state.totalAvailable !== null) {
      this.props.openHotShopping(this.state.selectedSize)
    } else {
      this.setState({ openSnack: true, messageSnack: 'Selecciona una talla.' })
    }
  }

  renderBuyButtons() {
    const { classes } = this.props
    return (
      <Button 
        fullWidth
        variant="contained" 
        className={classes.buyNowButton} 
        onClick={(event) => { this.handleOpenHotShoppingModal(event)}} >
        <Typography variant="body1" className={classes.buyNowButtonText}>{(this.props.data.product.restricted) ?'Comprar ahora con CrediVale ®' : 'Comprar ahora'}</Typography>
      </Button>
    )
  }

  render() {
    let self = this
    const { classes } = this.props
    
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}>
        <div style={getModalStyle()} className={`${classes.largeForm} ${classes.scrollBar}`}>
          {
            (this.state.sizes.length > 0)?
              <Grid container>
                <Grid container item xs={12} justify="space-between">
                    <Typography variant="body1" style={{fontSize: 24, fontWeight: 600}}>Disponibilidad en tienda</Typography>
                    <Button onClick={()=> { this.handleClose() }} ><Close /></Button>
                </Grid>
                <Grid item xs={12} md={6} style={{marginTop: '20px', padding: '0px 10px 0px 10px'}}>
                  <Grid container item xs={12}>
                    <Grid item xs={4}>
                      <img
                          style={(this.state.isVertical) ? { height: '180px' } : { width: '100%' }}
                          src={Utils.constants.HOST_CDN_AWS + '/normal/' + this.state.selectedPhoto}/>
                    </Grid>
                    <Grid item xs={8} style={{paddingLeft: 12}}>
                      <Grid container alignContent="flex-start">
                        <Grid item xs={12}>
                          <Typography style={{width: '100%', fontSize: '16px', fontWeight: 'bold'}}>{this.props.data.product.detail.title}</Typography>
                        </Grid>
                        <Grid container item xs={12} alignItems="center" style={{marginTop: 8}}>
                          <Typography variant="body1" style={{marginRight: 8}}>Talla</Typography>
                          <TextField
                            defaultValue={(this.props.data !== null && this.props.data !== undefined && this.props.data.selectedSize !== null && this.props.data.selectedSize !== undefined && this.props.data.selectedSize !== '' && this.props.data.selectedSize !== ' ' && this.props.data.selectedSize !== 0) ? this.props.data.selectedSize.toFixed(1) : null}
                            select
                            SelectProps={{native: true}}
                            size="small"
                            variant="outlined"
                            onChange={(event) => { this.handleChangeSizes(event.target.value) }}>
                            {
                              this.state.sizes.map((size, idx) => {
                                return (<option key={idx} value={size.description}>{size.size}</option>)
                              })
                            }
                          </TextField>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <TableContainer style={{maxHeight: 244}}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tienda</TableCell>
                            <TableCell>Existencia</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {
                            this.state.stores.map((store, idx) => (
                              <TableRow key={idx}>
                                <CustomTableCell component="th" scope="row">{store.name}</CustomTableCell>
                                <CustomTableCell>{Number(store.stock)}</CustomTableCell>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} style={{marginTop: 20}}>
                    {
                      this.renderBuyButtons()
                    }
                  </Grid>
                </Grid>
                <Grid container item xs={12} md={6} style={{marginTop: '20px', padding: '0px 0px 10px 0px'}} justify="center">
                  <Grid item xs={12}>
                    <GoogleMapReact
                      style={{width: '100%', height: 400, position: 'relative'}}
                      bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
                      center={{lat: 23.6260333, lng: -102.5375005}}
                      zoom={5}
                      options={{fullscreenControl: false}}>
                      {
                        this.state.stores.map((point, idx) => {
                          return(
                            <div 
                              key={idx} 
                              lat={point.lat} 
                              lng={point.lng} 
                              onClick={() => {self.setState({selectedStore: idx})}} 
                              className={(self.state.selectedStore === idx) ? classes.selectedPin : classes.pin}>
                                <label style={{ textAling: 'center', height: 19, 'line-height': 16, padding: 0, margin: 0, fontSize: 14 }}>{Number(point.stock)}</label>
                            </div>)
                        })
                      }
                    </GoogleMapReact>
                  </Grid>
                  {
                    (this.state.selectedStore)?
                      <Grid item xs={12} style={{marginTop: 12}}>
                        <Typography style={{width: '100%', fontSize: '16px', fontWeight: 'bold'}}>{this.state.stores[this.state.selectedStore].name}</Typography>

                        <Typography variant="body1" style={{marginTop: 12}}>
                          {this.state.stores[this.state.selectedStore].street} #{this.state.stores[this.state.selectedStore].exteriorNumber} {(!Utils.isEmpty(this.state.stores[this.state.selectedStore].interiorNumber)) ? this.state.stores[this.state.selectedStore].interiorNumber : ''}<br />
                          {(this.state.stores[this.state.selectedStore].city.length !== 0)? this.state.stores[this.state.selectedStore].city + ',': ''} {(this.state.stores[this.state.selectedStore].state.length !== 0)? this.state.stores[this.state.selectedStore].state + '.' : ''} {this.state.stores[this.state.selectedStore].country}<br />
                          Teléfono: {this.state.stores[this.state.selectedStore].phone}<br />
                        </Typography>
                      </Grid>
                    :
                     ''
                  }
                </Grid>
              </Grid>
            : 
              ''
          }
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(LocatorModal)
