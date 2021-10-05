import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import GoogleMapReact from 'google-map-react'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import Paper from '@material-ui/core/Paper'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

//
import Utils from '../resources/Utils'
import { getDataAPI } from '../api/CRUD'

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
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  largeForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing(100),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
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
    float: 'right',
    [theme.breakpoints.down('sm')]: {
      marginTop: 8
    }
  },
  primaryButton: {
    fontWeight: 600,
    fontSize: 14
  },
  pin: {
    background: theme.palette.primary.main,
    width: '20px',
    height: '20px',
    border: '2px solid white',
    borderRadius: '100%',
    color: 'white',
    textAlign: 'center'
  },
  selectedPin: {
    background: 'red',
    width: '20px',
    height: '20px',
    border: '2px solid white',
    borderRadius: '100%',
    color: 'white',
    textAlign: 'center'
  }
})

class ClickAndCollect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedBranch: null,
      cities: [],
      branches: [],
      openSnack: false,
      errorMessage: '',
      selectedLocation: '',
      urlMap: 'https://www.google.com/maps/embed?key=AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo',
      locations: []
    }

    this.handleChangeValues = this.handleChangeValues.bind(this)
    this.handleChangeLocation = this.handleChangeLocation.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.clearData = this.clearData.bind(this)
    this.loadCities = this.loadCities.bind(this)
    this.loadBranches = this.loadBranches.bind(this)
  }

  componentWillMount() {
    this.loadCities()
    this.loadBranches()
  }

  async loadCities() {
    let response = await getDataAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: 'zones'
    })

    this.setState({
      cities: response.data
    })
  }

  async loadBranches() {
    const self = this

    let response = await getDataAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: 'branches'
    })

    let branches = []
    let sizes = this.props.data.sizes
    sizes.forEach(function (size) {
      size.detail.forEach(function (detail) {
        response.data.forEach(function (branch) {
          if (detail.branch === branch.tienda_id) {
            branches.push({
              id: branch.tienda_id,
              name: branch.nombre,
              suburb: branch.colonia,
              street: branch.calle,
              city: branch.localidad,
              state: branch.estado,
              exteriorNumber: branch.numext,
              interiorNumber: branch.numint,
              phone: branch.telefono,
              article: detail.article,
              size: detail.size,
              stock: detail.stock,
              lat: branch.lat,
              lng: branch.lng
            })
          }
        })
      })
    })

    this.setState({
      branches: branches
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
      selectedBranch: null,
      branches: [],
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
        <div style={getModalStyle()} className={classes.largeForm}>
          <Button onClick={this.handleClose} className={classes.closeButton}><Icon>close</Icon> CERRAR</Button>
          <Typography variant="h4" className={classes.modalTitle}>
            {this.props.data.product.marca.descripcion}
          </Typography>
          <Typography variant="body1" style={{ fontSize: 12, color: 'gray' }}>
            {this.props.data.product.nombre}
          </Typography>
          <Grid container style={{ marginTop: 16 }}>
            <Grid item xl={3} lg={3} md={3} sm={4} xs={4}>
              <Typography><strong>Seleccionar talla:</strong></Typography>
              <FormControl variant="outlined" style={{ width: '95%' }}>
                <Select
                  disabled={this.state.disabledSelect}
                  native
                  value={this.state.selectedSize}
                  onChange={(event) => { this.handleChangeSizes(event) }}
                  inputProps={{
                    name: 'age',
                    id: 'outlined-age-native-simple',
                  }}
                >
                  <option value={0}>-</option>
                  {
                    (this.props.data.sizes.length > 0) ?
                      this.props.data.sizes.map((size, idx) => {
                        return (
                          <option key={idx} value={Number(size.size)}>{size.size}</option>
                        )
                      })
                      :
                      ''
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xl={3} lg={3} md={3} sm={4} xs={4}>
              <Typography><strong>Seleccionar ciudad:</strong></Typography>
              <FormControl variant="outlined" style={{ width: '95%' }}>
                <Select
                  disabled={this.state.disabledSelect}
                  native
                  value={this.state.selectedSize}
                  onChange={(event) => { this.handleChangeSizes(event) }}
                  inputProps={{
                    name: 'age',
                    id: 'outlined-age-native-simple',
                  }}
                >
                  <option value={0}>-</option>
                  {
                    (this.state.cities.length > 0) ?
                      this.state.cities.map((city, idx) => {
                        return (
                          <option key={idx} value={Number(city.id)}>{city.nombre}</option>
                        )
                      })
                      :
                      ''
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xl={3} lg={3} md={3} sm={4} xs={4}>
              <Typography><strong>Seleccionar tienda:</strong></Typography>
              <FormControl variant="outlined" style={{ width: '95%' }}>
                <Select
                  disabled={this.state.disabledSelect}
                  native
                  value={this.state.selectedSize}
                  onChange={(event) => { this.handleChangeSizes(event) }}
                  inputProps={{
                    name: 'age',
                    id: 'outlined-age-native-simple',
                  }}
                >
                  <option value={0}>-</option>
                  {
                    (this.state.branches.length > 0) ?
                      this.state.branches.map((branch, idx) => {
                        return (
                          <option key={idx} value={Number(branch.id)}>{branch.name}</option>
                        )
                      })
                      :
                      ''
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xl={3} lg={3} md={3} sm={12} xs={12}>
              <Button style={{ width: '100%', backgroundColor: 'red', color: 'white', marginTop: 16 }}>
                  APARTAR
              </Button>
            </Grid>
          </Grid>
          <Typography variant="body1">
            {
              (this.state.selectedBranch !== null) ?
                <Paper style={{ marginTop: 16, padding: '16px 24px' }}>
                  <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                    <li style={{ marginBottom: 4 }}>
                      <Typography variant="body1" style={{ fontSize: 14 }}><strong>Disponibilidad:</strong> <span style={{ color: 'red' }}>{Number(this.state.branches[this.state.selectedBranch].stock)}</span></Typography>
                    </li>
                    <li style={{ marginBottom: 4 }}>
                      <Typography variant="body1" style={{ fontSize: 14 }}><strong>Nombre:</strong> {this.state.branches[this.state.selectedBranch].name}</Typography>
                    </li>
                    <li style={{ marginBottom: 4 }}>
                      <Typography variant="body1" style={{ fontSize: 14 }}><strong>Dirección:</strong> {this.state.branches[this.state.selectedBranch].street} {this.state.branches[this.state.selectedBranch].suburb} #{this.state.branches[this.state.selectedBranch].exteriorNumber} {(!Utils.isEmpty(this.state.branches[this.state.selectedBranch].interiorNumber)) ? '(' + this.state.branches[this.state.selectedBranch].interiorNumber + ')' : ''}</Typography>
                      <Typography variant="body1" style={{ fontSize: 14 }}>{this.state.branches[this.state.selectedBranch].city}, {this.state.branches[this.state.selectedBranch].state}</Typography>
                    </li>
                    {
                      (!Utils.isEmpty(this.state.branches[this.state.selectedBranch].phone)) ?
                        <li style={{ marginBottom: 4 }}>
                          <Typography variant="body1" style={{ fontSize: 14 }}><strong>Teléfono:</strong> {this.state.branches[this.state.selectedBranch].phone}</Typography>
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
          <div style={{ minWidth: 300, minHeight: 300, width: '100%', height: '100%' }}>
            {
              (this.state.branches.length > 0) ?
                <GoogleMapReact
                  style={{ marginTop: 16, width: '100%', height: '400px', position: 'relative' }}
                  bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
                  center={{
                    lat: 23.6260333,
                    lng: -102.5375005
                  }}
                  zoom={4.5}
                >
                  {
                    this.state.branches.map((point, idx) => {
                      return 
                      <div 
                        key ={idx}
                        onClick={() => { self.setState({selectedBranch: idx })}} 
                        lat={point.lat} 
                        lng={point.lng} 
                        className={(self.state.selectedBranch === idx) ? classes.selectedPin : classes.pin}>
                          <label
                            style={{ textAling: 'center', height: 19, 'line-height': 19, padding: 0, margin: 0 }}>
                              {Number(point.stock)}
                          </label>
                        </div>
                    })
                  }
                </GoogleMapReact>
                :
                ''
            }
          </div>
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
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  
  withStyles(styles),
  connect(mapStateToProps, null)
)(ClickAndCollect)
