import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Link, Hidden, Typography, TextField, Button, InputAdornment, TableRow, TableCell, Snackbar, Paper, InputBase, Divider } from '@material-ui/core'
import Label from '@material-ui/icons/Label'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import GoogleMapReact from 'google-map-react'




import { openShoppingCart, removeProductFromShoppingCart, updateAllProductFrontShoppingCart, updateShoppingCart } from '../../actions/actionShoppingCart'
import { cleanCheckout, updatePaymentMethod, updateCard, updateAddress, updateBluePoint, updateCoupon } from '../../actions/actionCheckout'



// Utils
import Utils from '../../resources/Utils'
import { requestAPI } from '../../api/CRUD'
import { dropShoppingCart } from '../../actions/actionShoppingCart'
import Line from '../../components/Line'
import ItemCheckout from '../../components/ItemCheckout'

const styles = theme => ({

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
  card: {
    padding: theme.spacing(2),
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    paddingBottom: '50px',
  },
  input: {

    borderRadius: '4px',
    backgroundColor: '#f5f5f5',

  },
  containerItemSelected: {
    margin: '5px',
    padding: '16px 16px 16px',
    borderRadius: '4px',
    border: 'solid 1px rgba(0, 131, 224, 0.35)',
    background: '#f7f8f9',
  },
  containerItem: {
    margin: '5px',
    padding: '16px 16px 16px',
    borderRadius: '4px',
    background: '#f7f8f9',
  },


})

class ClickAndCollect extends Component {
  constructor(props) {
    super(props)

    this.state = {


    }

    //this.handleChangeFileValue = this.handleChangeFileValue.bind(this)

  }



  render() {
    const { classes } = this.props


    return (
      <div className={classes.container} >
        <Grid container>

          <Grid item xs={12}>
            <Typography variant='h3'> ¿Dónde te entregamos? </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container>

              {/* Columna izquierda */}
              <Grid item xs={6}>
                <Paper className={classes.card} >
                  <Grid container spacing={3}>

                    <Grid item xs={12}>
                      <Typography variant='body1' >Nuevo domicilio</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Line color='yellow' />
                    </Grid>

                    <Grid item xs={12} >
                      {/* <TextField
                        label="Buscar tienda"
                        fullWidth
                        autoFocus
                        //value={this.state.values.name}
                        //onChange={(event) => { this.handleChangeValues('name', event) }}
                        size="small"
                          variant="outlined"
                        /> */}
                      <IconButton className={classes.iconButton} aria-label="Menu">
                        <SearchIcon />
                      </IconButton>
                      <InputBase style={{ width: '80%' }} placeholder="Buscar tienda" />
                      <Divider className={classes.divider} />
                    </Grid>


                    <Grid xs={12} >
                      {
                        (this.state.changeAddress && this.props.addresses !== null && this.props.addresses !== undefined) ?
                          this.props.addresses.map((item, idx) => {
                            return (
                              <Grid xs={12} className={(this.props.selected) ? classes.containerItemSelected : classes.containerItem} >
                                {/* Contenido */}
                                <ItemCheckout
                                  selected={item.selected}
                                  name={item.name}
                                  description={item.street + ', ' + item.exteriorNumber + ', Colonia ' + item.location + ', ' + item.zip + ', ' + item.municipality + ', ' + item.state}
                                  selectedFunction={() => { this.handleChangeAddress(idx) }}
                                />
                              </Grid>
                            )
                          })
                          :
                          ''
                      }
                    </Grid>








                  </Grid>
                </Paper>
              </Grid>
              {/* Columna izquierda END */}















              {/* Columna derecha */}
              <Grid item xs={6} >
                <Paper className={classes.card} >
                  <Grid container spacing={2}>

                    <Grid item xs={12}>

                      {
                        <GoogleMapReact
                          style={{ width: '99%', height: '90vh', position: 'relative' }}
                          bootstrapURLKeys={{ key: 'AIzaSyAyTOd_cml2QodRI_Z9FDhV1HYdTmiSqPo' }}
                          center={{
                            lat: (false) ? this.state.selectedStore.lat : 25.8257,
                            lng: (false) ? this.state.selectedStore.lng : -108.214,
                          }}
                          zoom={(false) ? 17 : 5}
                        >
                          {
                            (this.state.states !== null && this.state.states !== undefined) ?
                              this.state.states.map(function (state, idx) {
                                return (
                                  state.zones.map((zone) => {
                                    return (
                                      zone.stores.map(store => {
                                        return <div onClick={() => {
                                          self.setState({
                                            selectedState: state,
                                            selectedZone: zone,
                                            selectedStore: store
                                          })
                                        }} lat={store.lat} lng={store.lng} className={(self.state.selectedStore === idx) ? classes.selectedPin : classes.pin}><label onClick={() => { self.handleChangeStore(store.code, true) }} style={{ textAling: 'center', height: 19, 'line-height': 16, margin: 0, fontSize: 14 }}><img src={self.getMarkerStore(store)} /></label></div>
                                      })
                                    )
                                  })
                                )
                              })
                              :
                              ''
                          }
                        </GoogleMapReact>
                      }





                    </Grid>

                  </Grid>
                </Paper>
              </Grid>
              {/* Columna derecha END */}











            </Grid>
          </Grid>



        </Grid>
      </div>
    )






  }


}
const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = dispatch => {
  return {
    openShoppingCart: (show) => {
      dispatch(openShoppingCart(show))
    },
    removeProductFromShoppingCart: (product) => {
      dispatch(removeProductFromShoppingCart(product))
    },
    updateAllProductFrontShoppingCart: (shoppingCart) => {
      dispatch(updateAllProductFrontShoppingCart(shoppingCart))
    },
    updateShoppingCart: (shoppingCart) => {
      dispatch(updateShoppingCart(shoppingCart))
    },
    cleanCheckout: (checkout) => {
      dispatch(cleanCheckout(checkout))
    },
    updatePaymentMethod: (checkout) => {
      dispatch(updatePaymentMethod(checkout))
    },
    updateCard: (checkout) => {
      dispatch(updateCard(checkout))
    },
    updateAddress: (checkout) => {
      dispatch(updateAddress(checkout))
    },
    updateBluePoint: (checkout) => {
      dispatch(updateBluePoint(checkout))
    },
    updateCoupon: (checkout) => {
      dispatch(updateCoupon(checkout))
    }

  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(ClickAndCollect)

