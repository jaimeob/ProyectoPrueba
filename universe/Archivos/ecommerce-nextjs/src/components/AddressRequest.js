import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material
import { Grid, Typography, Checkbox, Button, Hidden, CircularProgress } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

// Utils
import { requestAPI } from '../api/CRUD'
import Utils from '../resources/Utils'
import Router from 'next/router'

// Components
import Loading from '../components/Loading'

const styles = theme => ({
  align: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down("sm")]: {
      marginBottom: '15px'
    }
  },
  container: {
    background: '#e2eaf4',
    borderRadius: '3px',
    boxShadow: ' 0 2px 2px 0.1px rgba(180, 180, 180, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '18px',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '18px',
  },
  containerAddress: {
    borderRadius: '3px',
    boxShadow: ' 0 2px 2px 0.1px rgba(180, 180, 180, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
})

class AddressRequest extends Component {
  constructor(props) {
    super(props)
    this.state = {
      size: 12,
      address: null


    }
    this.loadData = this.loadData.bind(this)

  }

  async componentWillMount() {
    this.loadData()


  }

  async loadData() {

    let addresses = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/addresses'
    })

    if (addresses !== null && addresses !== undefined && addresses.data !== null && addresses.data !== undefined && addresses.data.length > 0) {
      addresses.data.forEach(address => {
        if (address.favorite) {
          this.setState({ address: address })
        }
      })
    }
  }

  render() {
    const self = this
    const { classes } = this.props
    return (<div style={{ width: '100%' }} >
      {
        (!this.props.loading) ?
          (this.props.address === null) ?
            <Grid container className={classes.container} >
              <Grid item xs={12}>
                <Grid container>
                  <Grid style={{}} className={classes.align} item sm={1} xs={1}>
                    <img src={'/icono-alerta.svg'} ></img>
                  </Grid>

                  <Grid item sm={6} xs={10} className={classes.align} >
                    {/* Web view */}
                    <Hidden mdDown >
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography style={{ fontSize: '14px', textAlign: 'center' }} variant='body2'>Es necesario agregar una ciudad para brindarle </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography style={{ fontSize: '14px', textAlign: 'center' }} variant='body2'>información de entrega de su pedido</Typography>
                        </Grid>
                      </Grid>
                    </Hidden>

                    {/* Responsive view */}
                    <Hidden lgUp>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography style={{ fontSize: '14px', textAlign: 'center' }} variant='body2'>Es necesario agregar una ciudad para brindarle información de entrega de su pedido</Typography>
                        </Grid>
                      </Grid>
                    </Hidden>
                  </Grid>

                  <Grid item sm={5} xs={12} className={classes.align} >
                    <Button onClick={() => { this.props.handleOpenModal() }} style={{ width: '100%', boxShadow: '0 2px 1px -2px rgba(0, 0, 0, 0.5)', background: '#243b7a', color: 'white', fontWeight: 'bold', textTransform: 'none' }}   >Agregar dirección</Button>
                  </Grid>

                </Grid>
              </Grid>

            </Grid>
            :
            <Grid container className={classes.containerAddress} >
              <Grid item xs={12}>
                <Grid container >

                  <Grid item xs={2}>
                    <img style={{ width: '95%', marginBottom: '-5px' }} src={'/mapa.png'} ></img>
                  </Grid>

                  <Grid item xs={4} className={classes.align} >
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography style={{ fontSize: '14px', fontWeight: 'bold' }} variant='body2'>{this.props.address.type}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography style={{ fontSize: '12px', color: 'black' }} variant='body2'>{this.props.address.street + ' #' + this.props.address.exteriorNumber + ', ' + this.props.address.location + ' ' + this.props.address.municipality + ', ' + this.props.address.state + ', México ' + this.props.address.zip}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={5} className={classes.align} style={{ justifyContent: 'flex-end' }} >
                    <Typography onClick={() => { this.props.handleOpenModal() }} style={{ fontSize: '12px', color: '#499dd8', fontWeight: '600', cursor: 'pointer' }} variant='body2'>Editar o elegir otro</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          :
          <div style={{ display:'justify', justifyContent:'center', width:'100%' }} >
            <CircularProgress style={{ display:'block', margin:'auto' }} color='primary' ></CircularProgress>
          </div>

      }
    </div>
    )
  }
}
const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(AddressRequest)
