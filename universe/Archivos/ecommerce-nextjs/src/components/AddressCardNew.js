import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Paper, Button, Hidden, Card, Radio } from '@material-ui/core'
import StarIcon from '@material-ui/icons/Star'

// Components
import QuantityControl from './QuantityControl'
import Line from './Line'
import { requestAPI } from '../api/CRUD'

// Utils
import Utils from '../resources/Utils'
import ItemCheckout from './ItemCheckout'

import { updateShippingMethod } from '../actions/actionCheckout'

const styles = theme => ({
  containerAddress: {
    borderRadius: '3px',
    boxShadow: ' 0 2px 2px 0.1px rgba(180, 180, 180, 0.5)',
  },
  align: {
    display: 'flex',
    alignItems: 'center'
  }, 
  image: {
    width: '90%', 
    height: '90%', 
    marginTop: '10px', 
    marginBottom: '-7px',
    [theme.breakpoints.down("xs")]: {
      marginTop: '7px', 

    }
  }

})

class AddressCardNew extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
    this.handleChangeAddress = this.handleChangeAddress.bind(this)
  }
  componentWillMount() {
    this.setState({
    })
  }

  handleChangeAddress(id) {
    this.props.handleChangeAddress(id)
  }

  render() {
    const { classes } = this.props
    const self = this

    return (
      <div style={{ width: '100%' }}>
        <Grid container className={classes.containerAddress} >
          <Grid item sm={2} xs={3} >
            <img className={classes.image} src={'/mapa.png'} ></img>
          </Grid>

          <Grid item sm={4} xs={7} className={classes.align} >
            <Grid container style={{ paddingTop: '10px', paddingBottom:'10px' }} >
              <Grid item xs={12}>
                <Typography style={{ fontSize: '14px', fontWeight: 'bold' }} variant='body2'>{this.props.data.type}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography style={{ fontSize: '12px', color: 'black' }} variant='body2'>{this.props.data.street + ' #' + this.props.data.exteriorNumber + ', ' + this.props.data.location + ' ' + this.props.data.municipality + ', ' + this.props.data.state + ', México ' + this.props.data.zip}</Typography>
              </Grid>
              <Grid item xs={12}>
              <Typography onClick={()=>{this.props.handleEditAddress()}} style={{ fontSize: '11px', fontWeight: '600', color:'#499dd8', cursor: 'pointer' }} variant='body2'>Editar</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item sm={6} xs={2} className={classes.align} style={{ justifyContent: 'flex-end' }} >
              <Radio
                checked={this.props.data.favorite}
                onChange={() => { this.handleChangeAddress() }}
                value="a"
                name="radio-button-demo"
                inputProps={{ 'aria-label': 'A' }}
              />
            </Grid>
        </Grid>
      </div>
    )

  }
}
const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = dispatch => {
  return {
    updateShippingMethod: (checkout) => {
      dispatch(updateShippingMethod(checkout))
    }
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(AddressCardNew)


