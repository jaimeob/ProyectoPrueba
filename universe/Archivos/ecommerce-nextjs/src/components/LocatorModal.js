import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import GoogleMapReact from 'google-map-react'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Select from '@material-ui/core/Select'
import Modal from '@material-ui/core/Modal'
import FormControl from '@material-ui/core/FormControl'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import Paper from '@material-ui/core/Paper'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Hidden from '@material-ui/core/Hidden'
import { Table, TableContainer, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core'
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
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const styles = theme => ({
  smallForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '100%',
      height: '100%'
    }
  },
  largeForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: '80%',
    height: '80%',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '100%',
      height: '100%'
    }
  },
  modalTitle: {
    fontSize: 28,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    },
    fontWeight: 600
  },
  form: {
    marginTop: 16
  },
  textFieldForm: {
    marginTop: 16
  },
  select: {
    marginTop: 16
  },
  textField: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'white',
    fontWeight: 200
  },
  actions: {
    float: 'right',
    marginTop: 32,
    [theme.breakpoints.down('sm')]: {
      paddingBottom: 16
    }
  },
  closeButton: {
    float: 'left',
    [theme.breakpoints.down('sm')]: {
      marginTop: 0
    }
  },
  primaryButton: {
    fontWeight: 600,
    fontSize: 14
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
  gridContainer: {
    minWidth: '300',
    minHeight: '300',
    width: '100%',
    height: '100%',
  },
  gridMap: {
    minWidth: '300',
    minHeight: '300',
    width: '100%',
    height: '100%',
    padding: theme.spacing(0, 2)
  },
  infoGrid: {
    padding: 16,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 0
    }
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
  },
  imageContainer: {
    width: '100%',
    height: 'auto',
    [theme.breakpoints.down('sm')]: {

    }
  },
})


const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

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
      photos: [],
      sizeSelected: 0

    }

    this.handleChangeValues = this.handleChangeValues.bind(this)
    this.handleChangeLocation = this.handleChangeLocation.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.clearData = this.clearData.bind(this)
    this.loadStores = this.loadStores.bind(this)
  }

  componentWillMount() {
    this.loadStores()
  }

  async loadStores() {
    const self = this

    let response = await getDataAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: 'stores'
    })

    let stores = []
    let sizes = this.props.data.sizes
    let sizeSelected = this.state.selectedSize === "" ? self.props.data.selectedSize : this.state.selectedSize
    if (this.props.data !== null && this.props.data !== undefined && this.props.data.selectedSize !== null && this.props.data.selectedSize !== undefined && this.props.data.selectedSize !== 0 && this.props.data.selectedSize !== '') {
      sizeSelected = this.props.data.selectedSize
    } else {
      sizeSelected = Number(this.props.data.sizes[0].description)
    }
    if (this.state.selectedSize !== 0 && this.state.selectedSize !== '' && this.state.selectedSize !== ' ') {
      sizeSelected = this.state.selectedSize
    }
    sizes.forEach(function (size) {
      if (Number(size.size) === Number(sizeSelected)) {
        size.detail.forEach(function (detail) {
          response.data.forEach(function (store) {
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
      photos: this.props.data.product.photos,
      selectedStore: null
    })
  }

  async handleChangeSizes(event) {
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

  renderMainPhoto() {
    const self = this
    const { classes } = this.props
    return (
      <>
        {
          (!Utils.isEmpty(this.state.selectedPhoto)) ?
            <SideBySideMagnifier
              imageSrc={Utils.constants.HOST_CDN_AWS + '/zoom/' + this.state.selectedPhoto}
              alwaysInPlace={true}
              imageAlt={this.props.data.product.detail.title}
              largeImageSrc={Utils.constants.HOST_CDN_AWS + '/zoom/' + this.state.selectedPhoto}
            />
            :
            ''
        }
      </>
    )
  }

  renderBuyButtons() {
    const { classes } = this.props
    return (
      <>
        <Grid item lg={(this.props.data.product.restricted) ? 12 : 10} sm={(this.props.data.product.restricted) ? 12 : 10} xs={(this.props.data.product.restricted) ? 12 : 10} >
          <Button variant="contained" className={classes.buyNowButton} style={(this.props.data.product.restricted) ? { width: '100%' } : {}} onClick={(event) => {
            event.preventDefault()
            if (!Utils.isUserLoggedIn()) {
              this.setState({ openSnack: true, messageSnack: 'Es necesario iniciar sesión.', clickFrom: 'login' })
              return
            }

            if (this.state.totalAvailable !== null) {
              // this.setState({ openHotShoppingModal: true })
              this.props.openHotShopping(this.state.selectedSize)
            }
            else {
              this.setState({ openSnack: true, messageSnack: 'Selecciona una talla.' })
            }
          }}>
            <Typography variant="body1" className={classes.buyNowButtonText}>
              {
                (this.props.data.product.restricted) ?
                  'Comprar ahora con CrediVale ®'
                  :
                  'Comprar ahora'
              }
            </Typography>
          </Button>
        </Grid>
      </>
    )
  }

  render() {
    const self = this
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >

        <div style={getModalStyle()} className={`${classes.largeForm} ${classes.scrollBar}`}>
          <Button onClick={this.handleClose} className={classes.closeButton}><Icon>close</Icon> CERRAR</Button>

          <Grid container direction='row' spacing={2}>
            <Grid item xs={12} sm={6}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h4">Disponibilidad en tienda</Typography>
                </Grid>
                <Grid item xs={3} md={2} className={classes.imageContainer} >
                  {
                    this.renderMainPhoto()
                  }
                </Grid>
                <Grid item xs={9} md={10}>
                  <Grid container >
                    <Grid item xs={12}>
                      <Typography variant="h6">{this.props.data.product.detail.title} - ({this.state.selectedSize})</Typography>
                    </Grid>
                    <Grid item xs={2} md={1} style={{ display: 'flex', alignSelf: 'center' }}>
                      <Typography variant="body">Talla: </Typography>
                    </Grid>
                    <Grid item xs={2} md={2}>
                      <FormControl size='small' variant="outlined" className={classes.formControl}>
                        <Select
                          native
                          variant='standard'
                          defaultValue={(this.props.data !== null && this.props.data !== undefined && this.props.data.selectedSize !== null && this.props.data.selectedSize !== undefined && this.props.data.selectedSize !== '' && this.props.data.selectedSize !== ' ' && this.props.data.selectedSize !== 0) ? this.props.data.selectedSize.toFixed(1) : null}
                          onChange={(event) => { this.handleChangeSizes(event.target.value) }}
                        >
                          {
                            this.props.data.sizes.map((size, idx) => {
                              return (
                                <option key={idx} value={size.description} >
                                  {size.size}
                                </option>
                              )
                            })
                          }
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <TableContainer component={Paper} style={{ maxHeight: 275 }}>
                <Table className={classes.table} aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Tienda</StyledTableCell>
                      <StyledTableCell>Existencia</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      this.state.stores.map((store, idx) => (
                        <StyledTableRow key={idx}>
                          <StyledTableCell component="th" scope="row">
                            {store.name}
                          </StyledTableCell>
                          <StyledTableCell>{Number(store.stock)}</StyledTableCell>
                        </StyledTableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              <Grid container>
                <Grid item xs={12} style={{ display: 'flex', alignSelf: 'center', marginTop: '4%' }} alignItems="center"
                  justify="center">
                  {
                    this.renderBuyButtons()
                  }
                </Grid>
              </Grid>
              <HotShoppingNew open={this.state.openHotShoppingModal} product={this.props.data.product} fromClickAndCollect={this.state.fromClickAndCollect} selection={{
                size: this.state.selectedSize,
                article: this.state.selectedArticle,
                measurement: this.state.selectedSize.description
              }} handleClose={() =>
                this.setState({
                  openHotShoppingModal: false,
                  fromClickAndCollect: false
                })
              }
              />
            </Grid>

            <Grid item xs={12} sm={6} >
              <div style={{ minWidth: 300, minHeight: 300, width: '100%', height: '100%', maxHeight: 400 }}>
                <GoogleMapReact
                  style={{ marginTop: 16, width: '100%', height: '100%', position: 'relative' }}
                  bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
                  center={{
                    lat: 23.6260333,
                    lng: -102.5375005
                  }}
                  zoom={5}
                >
                  {
                    this.state.stores.map((point, idx) => {
                      return <div key={idx} onClick={() => {
                        self.setState({
                          selectedStore: idx
                        })
                      }} lat={point.lat} lng={point.lng} className={(self.state.selectedStore === idx) ? classes.selectedPin : classes.pin}><label style={{ textAling: 'center', height: 19, 'line-height': 16, padding: 0, margin: 0, fontSize: 14 }}>{Number(point.stock)}</label></div>
                    })
                  }
                </GoogleMapReact>
              </div>
              <Typography variant="body1">
                {
                  (this.state.selectedStore !== null) ?
                    <Paper style={{ marginTop: 16, padding: '16px 24px' }}>
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        <li style={{ marginBottom: 4 }}>
                          <Typography variant="body1" style={{ fontSize: 14 }}><strong>Disponibilidad:</strong> <span style={{ color: 'red' }}>{Number(this.state.stores[this.state.selectedStore].stock)}</span></Typography>
                        </li>
                        <li style={{ marginBottom: 4 }}>
                          <Typography variant="body1" style={{ fontSize: 14 }}><strong>Nombre:</strong> {this.state.stores[this.state.selectedStore].name}</Typography>
                        </li>
                        <li style={{ marginBottom: 4 }}>
                          <Typography variant="body1" style={{ fontSize: 14 }}><strong>Dirección:</strong> {this.state.stores[this.state.selectedStore].street} {this.state.stores[this.state.selectedStore].suburb} #{this.state.stores[this.state.selectedStore].exteriorNumber} {(!Utils.isEmpty(this.state.stores[this.state.selectedStore].interiorNumber)) ? '(' + this.state.stores[this.state.selectedStore].interiorNumber + ')' : ''}</Typography>
                          <Typography variant="body1" style={{ fontSize: 14 }}>{this.state.stores[this.state.selectedStore].city}, {this.state.stores[this.state.selectedStore].state}</Typography>
                        </li>
                        {
                          (!Utils.isEmpty(this.state.stores[this.state.selectedStore].phone)) ?
                            <li style={{ marginBottom: 4 }}>
                              <Typography variant="body1" style={{ fontSize: 14 }}><strong>Teléfono:</strong> {this.state.stores[this.state.selectedStore].phone}</Typography>
                            </li>
                            :
                            ''
                        }
                      </ul>
                    </Paper>
                    :
                    ''
                }
              </Typography>
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
          <HotShoppingNew open={this.state.openHotShoppingModal} product={this.props.data.product} fromClickAndCollect={this.state.fromClickAndCollect} selection={{
            size: this.state.selectedSize,
            article: this.state.selectedArticle,
            measurement: this.state.selectedSize.description
          }} handleClose={() =>
            this.setState({
              openHotShoppingModal: false,
              fromClickAndCollect: false
            })
          }
          />

        </div>
      </Modal >
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(LocatorModal)
