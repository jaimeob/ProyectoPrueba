import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material
import { Grid, Typography, Checkbox, Button, Hidden, Modal, FormControl, Select } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles'

// Components
import AddressForm from './AddressForm'
import MyAddressesNew from './MyAddressesNew'
import GoogleMapReact from 'google-map-react'
import CardComponent from './Card'
import TaxDataComponent from '../components/MyTaxData'



// Utils
import { requestAPI } from '../api/CRUD'
import Utils from '../resources/Utils'
import Router from 'next/router'

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
  container: {
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: '50%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '32px 16px 32px 16px',
    // minHeight: '80%',
    [theme.breakpoints.down('md')]: {
      width: '60%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
      padding: '16px 16px 16px 16px'
    }
  },
  containerOrder: {
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: '80%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '32px 16px 32px 16px',
    [theme.breakpoints.down('md')]: {
      width: '60%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
      padding: '16px 16px 16px 16px'
    }
  },
  containerClickCollect: {
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: '50%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    paddingBottom: '20px',
    [theme.breakpoints.down('md')]: {
      width: '60%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
    }
  },
  title: {
    fontSize: '22px',
    fontWeight: '600',
  },


})

class ModalComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      size: 12,
      selectedState: null,
      branch: null


    }
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.handleChageStore = this.handleChageStore.bind(this)
    this.confirmStore = this.confirmStore.bind(this)

  }

  confirmStore() {
    this.props.confirmStore(this.state.branch)
    this.handleClose()
  }

  async handleChageStore(option) {
    await this.setState({ branch: option })
    this.props.handleChageStore(option)
  }

  async componentWillMount() {

  }

  handleClose() {
    this.setState({
      changeButton: true,
      comments: '',
      selectedDate: '',
      messageSnack: '',
      openSnack: false,

    })

    this.props.handleClose()
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
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
      >

        <div>
          {
            (this.props.type === 'address') ?
              <div style={getModalStyle()} className={classes.container}  >
                <Grid container>
                  <Grid item xs={12}>
                    <MyAddressesNew
                      handleChangeFavoriteAddress={(id) => { this.props.handleChangeFavoriteAddress(id) }}
                      handleClose={() => { this.props.handleClose() }}
                      loadData={() => { this.props.loadData() }}
                    ></MyAddressesNew>
                  </Grid>
                </Grid>
              </div>
              :
              ''
          }
          {
            (this.props.type === 'click-collect') ?
              <div style={getModalStyle()} className={classes.containerClickCollect}  >
                <Grid container>
                  <Grid item xs={12}>
                    {
                      (true) ?
                        <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                          <GoogleMapReact
                            style={{ width: '100%', height: '100%', position: 'relative' }}
                            bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
                            center={{
                              lat: (this.state.lat !== null && this.state.lat !== undefined && this.state.lat !== '' && this.state.lat !== 0) ? this.state.lat : this.props.locations[0].lat,
                              lng: (this.state.lng !== null && this.state.lng !== undefined && this.state.lng !== '' && this.state.lng !== 0) ? this.state.lng : this.props.locations[0].lng
                            }}
                            zoom={11}
                            onClick={(event) => {
                              this.setState({
                                lat: event.lat,
                                lng: event.lng,
                                openSnack: true,
                                messageSnack: 'Ubicación seleccionada con éxito.'
                              })
                            }}
                          >
                            {
                              this.props.locations.map((store, idx) => {
                                return (
                                  <div lat={store.lat} lng={store.lng}><img style={{ marginTop: -20, marginLeft: -20, width: 50, height: 50 }} src="/pin.svg" />
                                  </div>
                                )
                              })
                            }
                          </GoogleMapReact>
                        </div>
                        :
                        ''
                    }
                  </Grid>
                  <Grid item xs={12} style={{ marginTop: '20px', marginLeft: '20px', marginRight: '20px' }} >
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography style={{ fontWeight: '600', fontSize: '22px' }} variant='body2'>{'Click & Collect'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container>
                          <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }} >
                            <Typography variant='body2'>Selecciona una tienda: </Typography>
                          </Grid>
                          <Grid item xs={7}>
                            <FormControl size='small' variant="outlined" style={{ width: '100%' }}>
                              <Select
                                disabled={this.state.disabledSelect}
                                native
                                variant='standard'
                                onChange={(event) => { this.handleChageStore(event.target.value) }}
                                value={(this.state.selectedState !== null) ? this.state.selectedState.code : null}
                              >
                                <option value="">Selecciona una tienda</option>
                                {
                                  this.props.locations.map((store, idx) => {
                                    return (
                                      <option value={store.branch}>
                                        {store.name}
                                      </option>
                                    )
                                  })
                                }
                              </Select>
                            </FormControl>

                          </Grid>
                        </Grid>


                      </Grid>

                      <Grid item xs={12} style={{ marginTop: '20px' }} >
                        <Grid container spacing={2}>

                          <Grid item xs={6}>
                            <Button onClick={() => { this.props.handleClose() }} style={{ width: '100%', textTransform: 'none', fontWeight: 'bold' }} variant='outlined' color="primary" >Cancelar</Button>
                          </Grid>

                          <Grid item xs={6}>
                            <Button style={{ width: '100%', textTransform: 'none', fontWeight: 'bold' }} onClick={() => { this.confirmStore() }} variant='contained' color="primary" >
                              Recoger en tienda
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>

                    </Grid>

                  </Grid>

                </Grid>
              </div>
              :
              ''
          }
          {
            (this.props.type === 'cards') ?
              <div style={getModalStyle()} className={classes.container}  >
                <Grid container>
                  <Grid item xs={12} style={{ marginBottom: '20px' }}>
                    <Typography variant='h5'>Selecciona un tarjeta</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={1} >
                      {
                        this.props.paymentMethod.cards.map((card, idx) => {
                          return (
                            <Grid item xs={4} style={{ justifyContent: 'center', display: 'flex', cursor: 'pointer' }} >
                              <CardComponent handleSelectedCard={() => { this.props.handleSelectedCard(card) }} data={card} edit={true} editCard={() => { this.props.editCard(card) }} ></CardComponent>
                            </Grid>
                          )
                        })
                      }

                    </Grid>
                  </Grid>
                  <Grid item xs={12} style={{ marginTop: '50px' }} >
                    <Grid container spacing={2}>

                      <Grid item xs={6}>
                        <Button onClick={() => { this.props.handleClose() }} style={{ width: '100%', textTransform: 'none', fontWeight: 'bold' }} variant='outlined' color="primary" >Cancelar</Button>
                      </Grid>

                      <Grid item xs={6}>
                        <Button style={{ width: '100%', textTransform: 'none', fontWeight: 'bold' }} onClick={() => { this.props.newCard() }} variant='contained' color="primary" >
                          <AddIcon></AddIcon>
                              Agregar nueva tarjeta
                            </Button>
                      </Grid>

                    </Grid>

                  </Grid>
                </Grid>
              </div>
              :
              ''
          }
          {
            (this.props.type === 'billing') ?
              <div style={getModalStyle()} className={classes.container}  >
                {
                  (false)?
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography align='center' variant='h4'> ¿ Desea facturar su pedido ?</Typography>
                    </Grid>
                    <Grid item xs={12} style={{ marginTop: '50px', marginBottom: '50px' }} >
                      <Typography align='center' variant='body2'> <span style={{ fontWeight: 'bold' }} >Aviso: </span> Solo podrá generar su factura antes de la compra.</Typography>
                    </Grid>
                    <Grid item xs={12} >
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Button onClick={() => { this.props.handleClose() }} style={{ width: '100%', textTransform: 'none', fontWeight: 'bold' }} variant='outlined' color="primary" >No</Button>
                        </Grid>
  
                        <Grid item xs={6}>
                          <Button style={{ width: '100%', textTransform: 'none', fontWeight: 'bold' }} onClick={() => { this.confirmStore() }} variant='contained' color="primary" >
                            Si
                              </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                :
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant='h4'>Generar factura</Typography>
                    {/* <Typography variant='body2'><span style={{ fontWeight:'bold' }}>Folio de la orden:</span></Typography> */}
                    <Typography variant='body2'><span style={{ fontWeight:'bold' }}>Total: </span>{ Utils.numberWithCommas(this.props.shoppingCart.priceInformation.total) }</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TaxDataComponent />
                  </Grid>
                </Grid>

                }
              </div>
              :
              ''
          }
        </div>
      </Modal>
    )
  }
}
const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(ModalComponent)
