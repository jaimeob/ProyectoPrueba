import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, } from '@material-ui/core'

import { updateShippingMethod } from '../actions/actionCheckout'
import Router from 'next/router'

const styles = theme => ({
  iconImage: {
    cursor: 'pointer',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '8px',
    width: '50%',
    [theme.breakpoints.down("xs")]: {
      width: '35%',
    }
  },
  iconImageSelected:{
    cursor: 'default',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '8px',
    marginLeft: '28px',
    width: '65%',
    [theme.breakpoints.down("xs")]: {
      width: '46%',
      // marginLeft: '48px',
      marginLeft: '34px'
    }
  },
  texto: {
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    [theme.breakpoints.down("xs")]: {
      fontSize:'11px'
    }
  }

})
class ShippingIcons extends Component {
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
      <Grid item xs={4} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
        <Grid container>
          <Grid item xs={12}>
            {
              (this.props.data.selected) ?
                <img className={classes.iconImageSelected} src={this.props.data.imageSelected} onError={() => { this.setState({ imageWorking: false }) }}  ></img>
                :
                <img onClick={ () => {this.props.changeShippingMethod()} } className={classes.iconImage} src={this.props.data.image} onError={() => { this.setState({ imageWorking: false }) }}  ></img>
            }
          </Grid>
          <Grid item xs={12} style={{ textAlign: 'center' }} >
            <Typography variant='body' className={classes.texto}>{this.props.data.name}</Typography>
          </Grid>
        </Grid>
      </Grid>
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
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(ShippingIcons)
