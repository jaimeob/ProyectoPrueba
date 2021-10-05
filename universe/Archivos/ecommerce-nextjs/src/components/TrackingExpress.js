import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import io from 'socket.io-client'
import Utils from '../resources/Utils'

// Components
import StepperNew from '../components/StepperNew'
import GoogleMapReact from 'google-map-react'
import ProductsTrackingList from './ProductsTrackingList'
import Attention from './Attention'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Hidden } from '@material-ui/core'

const styles = theme => ({
  repaSyle: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    marginTop: '-20px',
    [theme.breakpoints.down('md')]: {
      marginTop: '20px',
    }
  },
  imageRepa: {
    height: 'auto',
    position: 'relative',
    width: '40%',
    [theme.breakpoints.down('md')]: {
      width: '20%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '40%',
    }
  }

})

class TrackingExpress extends Component {
  constructor(props) {
    super(props)
    this.state = {
      socket: null,
      lat: 24.781143,
      lng: -107.411886,
      order: null,
      pipeline: null,
      pipelineColor: 'green',
      dealer: null,
      currentStatus: 1,
      orientation: 1,
      toHome: false,
      statusCalzzapato: [],
      calzzamovilArray: [],
      shoppingDate: null,
      products: [],
      calzzamovilStatus: 1,
      h: 'holi'
    }
    this.changeCoordinates = this.changeCoordinates.bind(this)
    this.changePipelines = this.changePipelines.bind(this)
  }
  async componentWillMount() {
    await this.setState({
      dealer: this.props.data.dealer,
      statusCalzzapato: this.props.data.statusArray,
      calzzamovilArray: this.props.data.calzzamovilArray,
      currentStatus: this.props.data.currentStatus,
      calzzamovilStatus: this.props.data.calzzamovilStatus,
      shippingMethodName: this.props.data.shippingMethodName,
      shoppingDate: this.props.order.information.shoppingDate,
      products: this.props.data.products,
    })
    await this.changePipelines({ pipeline: this.props.data.calzzamovilStatus })


    if (this.state.socket === null) {
      const socket = io(Utils.constants.CONFIG_ENV.HOST_TRACKING_API)
      // const socket = io('https://calzzamovil.ngrok.io')
      let user = await Utils.getCurrentUser()

      socket.on('connect', () => {
        this.setState({
          socket: socket
        })
        socket.emit('registration', { folio: this.props.order.information.folio, userId: user.id }, () => {
        })

      })
      socket.emit('registration', { folio: this.props.order.information.folio, userId: user.id }, () => {
      })
      socket.on('tracking', (data) => {
        // console.log('TRACKING data de socket ', data);
        this.changeCoordinates(data.lat, data.lng, data.orientation)
      })
      socket.on('toHome', (data) => {
        //log('TRACKING data de socket ', data);
        let toHome = false
        if (data.toHome !== undefined && data.toHome !== null && data.toHome) {
          toHome = true
        }
        this.setState({ toHome: toHome })
      })
      socket.on('pipeline', (data) => {
        let pipelineArray = []
        if (data.pipeline === 5 || data.pipeline === 6) {
          if (data.pipeline === 5) {
            pipelineArray.push('Cancelado')
          } else if(data.pipeline === 6) {
            pipelineArray.push('Pausado')
          }
        this.setState({ calzzamovilArray: pipelineArray, h: data.pipeline, })
        } else {
          this.changePipelines(data)
        }
        this.setState({ h: data.pipeline, dealer: data.dealer.fullName })


        // //log('Pipeline socket', data);
        // let pipelineAux = this.state.pipeline
        // this.setState({ pipelineColor: 'green', dealer: data.dealer })
        // pipelineAux.forEach(element => {
        //   if (element.id === data.pipeline) {
        //     element.status = true
        //     this.setState({ currentStatus: data.pipeline })
        //   } else {
        //     if (data.pipeline === 0 || data.pipeline > 4) {
        //       this.setState({ pipelineColor: 'red' })
        //     } else {
        //       element.status = false
        //     }
        //   }
        // })
        // this.setState({
        //   pipeline: pipelineAux
        // })

      })

      socket.on('start', (data) => {
        //console.log('START data de socket ', data);
        if (data.currentStatus > 1) {
          this.setState({
            dealer: data,
            currentStatus: data.currentStatus
          })
        }
      })
    }
  }

  async changePipelines(data) {
    let pipelines = this.state.calzzamovilArray
    if (pipelines.length > 0) {
      pipelines.forEach(pipeline => {
        if (pipeline.id <= data.pipeline) {
          pipeline.status = true
        } else {
          pipeline.status = false
        }
      })
    }
    await this.setState({ calzzamovilArray: pipelines })
  }

  changeCoordinates(lat, lng, orientation) {
    let orientationSuma = Number(orientation) + 10
    this.setState({
      lat: Number(lat),
      lng: Number(lng),
      orientation: orientationSuma,
    })

  }
  render() {
    const { classes } = this.props
    const self = this
    return (
      <Grid container style={{ padding: '20px', paddingBottom: '30px', background: 'white' }} >
        <Grid item xs={12}>
          <Grid container>

            <Grid item xs={12} >
              <StepperNew steps={this.state.statusCalzzapato}  ></StepperNew>
            </Grid>

            <Grid item xs={12} style={{ marginTop: '10px', marginBottom: '10px' }} >
              <ProductsTrackingList products={this.state.products} />
            </Grid>
            <Grid item xs={12} >
              <Attention folio={this.props.order.information.folio} shoppingDate={this.state.shoppingDate} shippingName={this.state.shippingMethodName} />
            </Grid>


            {/* Componente de servicio al cliente */}
            <Grid item xs={12} style={{ marginTop: '20px' }} >
            </Grid>

            {/* Ultimo de componente */}
            <Grid item xs={12} style={{ marginTop: '20px' }} >
              <Grid container>
                <Grid item lg={6} sm={12} style={{ width: '100%' }} >
                  {
                    <Grid item xs={12} style={{ pointerEvents: 'none' }}>
                      <div style={{ width: '100%' }} >
                        <Hidden lgUp >
                          <StepperNew h={this.state.h} calzzamovil={true} steps={this.state.calzzamovilArray} ></StepperNew>
                        </Hidden>
                        <GoogleMapReact
                          style={{ width: '100%', height: '500px', position: 'relative', zIndex: '2' }}
                          bootstrapURLKeys={{
                            key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo'
                          }}
                          center={{
                            lat: this.state.lat,
                            lng: this.state.lng
                          }}
                          zoom={18}
                          disableDoubleClickZoom={false}
                          zoomControl={false}
                          options={{
                            gestureHandling: 'greedy',
                            disableDoubleClickZoom: true,
                            scaleControl: false,
                            zoomControl: false,
                            rotateControl: false,
                            panControl: false,
                            streetViewControl: false,
                            fullscreenControl: false,
                            zoomControlOptions: { position: 9 },
                            scrollwheel: false
                          }}
                        >
                          <img lat={this.state.lat} lng={this.state.lng} style={{ marginLeft: '-5px', marginTop: '-10px', width: '15px', height: 'auto', position: 'relative' }} src='/circulo.png'></img>
                          {/* <div onClick={() => { }} lat={Number(this.props.data.order.address.lat)} lng={Number(this.props.data.order.address.lng)} className={classes.pin}><img style={{ width: '30px', height: 'auto', transform: '' }} src='/house.png' ></img></div> */}
                          
                        </GoogleMapReact>

                      </div>
                    </Grid>
                  }
                </Grid>
                <Grid item lg={6} sm={12} style={{}} >
                  <Grid container style={{ marginLeft: '10px', height: '100%' }} >
                    <Grid item xs={12} style={{ width: '100%' }} >
                      <Hidden mdDown  >
                        <StepperNew h={this.state.h} calzzamovil={true} steps={this.state.calzzamovilArray} ></StepperNew>
                      </Hidden>
                    </Grid>
                    <Grid item xs={12} className={classes.repaSyle} style={{}} >
                      <Grid container>
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }} >
                          <img className={classes.imageRepa} src='/repa.png'></img>
                        </Grid>
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }} >
                          <Typography variant='h5'>Repartidor</Typography>
                        </Grid>
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }} >
                          <Typography variant='body1'>{(this.state.dealer !== null && this.state.dealer !== undefined) ? this.state.dealer : 'Aún no asignado'}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
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
)(TrackingExpress)
