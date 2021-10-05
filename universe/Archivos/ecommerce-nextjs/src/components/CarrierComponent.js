import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, } from '@material-ui/core'

import { updateShippingMethod } from '../actions/actionCheckout'
import Router from 'next/router'

const styles = theme => ({
  alignContainer:{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  carrierImg: {
    cursor: 'pointer',
    width: '40px',
    [theme.breakpoints.down("xs")]: {
      width: '100%',
    }
  },
  container: {
    cursor:'pointer',
    padding: '5px',
    paddingTop: '10px',
    paddingBottom: '10px',
  },
  containerSelected: {
    border: 'solid 0.5px #243b7a',
    borderRadius: '2px',
    cursor: 'default',
    padding: '5px',
    paddingTop: '10px',
    paddingBottom: '10px',
  }

})
class CarrierComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageWorking: true,
      shippingMethods: [],
      changeShippingMethod: false
    }

    // this.changeQuantity = this.changeQuantity.bind(this)
  }


  componentWillMount() {

  }

  render() {
    const { classes } = this.props
    const self = this

    return (
      <div style={{ width: '100%' }} className={ (this.props.selected)? classes.containerSelected : classes.container } >
        <Grid onClick={ this.props.changeCarrier } container >
          <Grid item xs={7} className={classes.alignContainer} >
            {
              <img  className={classes.carrierImg} src={this.props.urlImage}></img>
            }
          </Grid>
          <Grid item xs={5} className={classes.alignContainer} >
            ${this.props.price}
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
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(CarrierComponent)
