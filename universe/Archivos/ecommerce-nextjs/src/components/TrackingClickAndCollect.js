import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import GoogleMapReact from 'google-map-react'

// Components
import StepperNew from '../components/StepperNew'
import ProductsTrackingList from './ProductsTrackingList'
import Attention from './Attention'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography } from '@material-ui/core'
import RoomIcon from '@material-ui/icons/Room';


const styles = theme => ({
  container: {
    width: "90%",
    margin: "0 auto",
    paddingTop: 36,
    [theme.breakpoints.down("xs")]: {
      paddingTop: 36,
    },
    paddingBottom: 64,
  },

  containerMainInfo: {
    padding: '15px'
  },

  mapStyle: {
    marginTop: 16,
    width: '88%',
    margin: '0 auto',
    height: '100%',
    position: 'relative',
    [theme.breakpoints.down("xs")]: {
      width: '100%',
    }
  }

})

class TrackingClickAndCollecte extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingLocation: false,
      selectedLocation: null,
    }
  }
  
  render() {
    const { classes } = this.props
    const self = this
    const { orderTotrack } = this.props
    return (
      <Grid container style={{ padding: '20px', paddingBottom: '30px', background: 'white' }} >
        <Grid item xs={12}>
          <Grid container>

            <Grid item xs={12} >
              <StepperNew steps={orderTotrack.shippingMethods[0].statusArray} ></StepperNew>
            </Grid>

            {/* Listtado de procutos */}
            <Grid item xs={12} style={{ marginTop: '20px' }} >
              <Grid container >
                <ProductsTrackingList products={this.props.data.products} />
              </Grid>
            </Grid>

            {/* Componente de servicio al cliente */}
            <Grid item xs={12} style={{ marginTop: '20px' }} >
              <div>
                <Attention folio={this.props.orderTotrack.information.folio}  shoppingDate={this.props.orderTotrack.information.shoppingDate} shippingName={this.props.orderTotrack.shippingMethods[0].shippingMethodName}/>
              </div>
            </Grid>

            {/* Ultimo de componente */}
            <Grid item xs={12} style={{ marginTop: '20px' }} >
              <Grid container>
                  {/*Mapa */}
                  <Grid item xs={12} md={8}>
                    <Grid container style={{ minWidth: 300, minHeight: 300, width: '100%', height: '100%', textAlign: 'center' }}>
                        <GoogleMapReact
                            style={{ marginTop: 16, width: '95%',margin: '0 auto' ,height: '100%', position: 'relative', /*[theme.breakpoints.down("xs")]: { width: '100%' }*/ }}
                            //className={classes.mapStyle}
                            bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
                            center={{
                            lat: (this.state.selectedLocation !== null && this.state.selectedLocation !== undefined && this.state.selectedLocation.lat !== '' && this.state.selectedLocation.lat !== 0) ? this.state.selectedLocation.lat : orderTotrack.shippingMethods[0].store.lat,
                            lng: (this.state.selectedLocation !== null && this.state.selectedLocation !== undefined && this.state.selectedLocation.lng !== '' && this.state.selectedLocation.lng !== 0) ? this.state.selectedLocation.lng : orderTotrack.shippingMethods[0].store.lng
                            }}
                            zoom={(this.state.selectedLocation !== null) ? 20 : 15}
                            options={{
                              gestureHandling: 'greedy',
                              scaleControl: false,
                              rotateControl: false,
                              panControl: false,
                              streetViewControl: false,
                              fullscreenControl: false,
                              zoomControlOptions: { position: 9 },
                              scrollwheel: false
                            }}
                            onClick={(event) => {
                            this.setState({
                                selectedLocation: {
                                lat: event.lat,
                                lng: event.lng
                                }
                            })
                            }}
                        >
                            {
                                (orderTotrack.shippingMethods[0].store.lat !== null && orderTotrack.shippingMethods[0].store.lat !== undefined && orderTotrack.shippingMethods[0].store.lng !== null && orderTotrack.shippingMethods[0].store.lng !== null)
                                ? <div lat={orderTotrack.shippingMethods[0].store.lat} lng={orderTotrack.shippingMethods[0].store.lng}><RoomIcon style={{ marginTop: -20, marginLeft: -20, color: '#DA0037', fontSize: 30 }} /></div>
                                : ''
                            }
                            
                        </GoogleMapReact>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={4}  style={{paddingLeft: '8px'}}>
                    <Grid item xs={12}>
                        <Typography variant='subtitle1' style={{ fontWeight: 'bold', marginTop: '10px' }} >Recoger en tienda</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='subtitle1'>{orderTotrack.shippingMethods[0].store.name}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='subtitle1' style={{ fontWeight: 'bold', marginTop: '10px' }} >Dirección tienda</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant='subtitle1'>
                            {
                                (orderTotrack !== null && orderTotrack !== undefined) ?
                                    (orderTotrack.shippingMethods[0].store.street !== null && orderTotrack.shippingMethods[0].store.street !== undefined && orderTotrack.shippingMethods[0].store.street.length > 0)
                                    ? `${orderTotrack.shippingMethods[0].store.street} ${(orderTotrack.shippingMethods[0].store.exteriorNumber !== null && orderTotrack.shippingMethods[0].store.exteriorNumber !== undefined && orderTotrack.shippingMethods[0].store.exteriorNumber.length > 0)
                                        ? `# ${orderTotrack.shippingMethods[0].store.exteriorNumber} ` : '' }` : ''
                                : ''
                            }
                        </Typography>
                        <Typography variant='subtitle1' >
                          {
                              (orderTotrack !== null && orderTotrack !== undefined) ?
                                (orderTotrack.shippingMethods[0].store.location !== null && orderTotrack.shippingMethods[0].store.location !== undefined && orderTotrack.shippingMethods[0].store.location.length > 0)
                                ? `${orderTotrack.shippingMethods[0].store.location} ${(orderTotrack.shippingMethods[0].store.municipality !== null && orderTotrack.shippingMethods[0].store.municipality !== undefined && orderTotrack.shippingMethods[0].store.municipality.length > 0)
                                  ? `${orderTotrack.shippingMethods[0].store.municipality}, ` : '' } ${(orderTotrack.shippingMethods[0].store.state !== null && orderTotrack.shippingMethods[0].store.state !== undefined && orderTotrack.shippingMethods[0].store.state.length > 0)
                                    ? `${orderTotrack.shippingMethods[0].store.state} ` : '' }` : ''
                              : ''
                          }
                        </Typography>
                        <Typography variant='subtitle1' >
                          {
                              (orderTotrack !== null && orderTotrack !== undefined) ?
                              (orderTotrack.shippingMethods[0].store.zip !== null && orderTotrack.shippingMethods[0].store.zip !== undefined && orderTotrack.shippingMethods[0].store.zip.length > 0)
                                ? `C.P. ${orderTotrack.shippingMethods[0].store.zip}` : ''
                                : ''
                          }
                        </Typography>
                        
                    </Grid>
                  </Grid>

                </Grid>
              </Grid>
            </Grid>

          </Grid>
        </Grid>

    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(TrackingClickAndCollecte)
