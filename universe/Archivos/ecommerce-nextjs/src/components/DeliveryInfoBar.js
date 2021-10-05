import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Link from 'next/link'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Icon, Typography, Hidden } from '@material-ui/core'

// Components
import DeliveryInfoModal from './DeliveryInfoModal'
import Utils from '../resources/Utils'

import { requestAPI } from '../api/CRUD'
import { getDeliveryAddress, setNewDeliveryAddress } from '../actions/actionDeliveryAddress'

const styles = theme => ({
  icon: {
    color: '#243B7A'
  },
  text: {
    fontSize: 12,
    color: 'blue'
  }
})

class DeliveryInfoBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openDeliveryInfoModal: false,
      shortAddress: 'Ingresa tu dirección',
      address: 'Ingresa tu dirección'
    }
  }

  async componentWillMount() {
    let user = await Utils.getCurrentUser()
    if (user !== undefined && user !== null) {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'GET',
        resource: '/addresses',
        endpoint: '/favorite'
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data !== undefined && response.data !== null) {
          response = response.data

          this.props.setNewDeliveryAddress({
            zip: response.zip,
            state: response.state,
            city: response.city
          })
        }
      }
    } else {
      this.props.getDeliveryAddress()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.delivery !== this.props.delivery) {
      if (this.props.delivery !== undefined && this.props.delivery.data !== undefined) {
        let state = this.props.delivery.data.state
        let city = this.props.delivery.data.city
        let zip = this.props.delivery.data.zip

        let shortAddressCondition = (city !== undefined && city !== null && zip !== undefined && city !== null)
        let addressCondition = (state !== undefined && state !== null && shortAddressCondition)

        this.setState({
          shortAddress: (shortAddressCondition)? (this.props.delivery.data.city + ' ('+ this.props.delivery.data.zip + ')') : 'Ingresa tu dirección',
          address: (addressCondition)? (this.props.delivery.data.city + ', ' + this.props.delivery.data.state + ' (' + this.props.delivery.data.zip + ')'): 'Ingresa tu dirección'
        })
      } else {
        this.setState({
          shortAddress: 'Ingresa tu dirección',
          address: 'Ingresa tu dirección'
        })
      }
    }
  }

  render() {
    const { classes } = this.props
    if (Utils.isUserLoggedIn()) {
      return (
        <div>
          { this.renderLogin(classes) }
          { this.renderModal(classes) }
        </div>
      )
    } else {
      return (
        <div>
          { this.renderLogout(classes) }
          { this.renderModal(classes) }
        </div>
      )
    }
  }

  renderLogin(classes) {
    return (
      <a href="/mi-cuenta/mis-direcciones">
        <Hidden mdDown>
          <div style={{display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
              <Icon style={{color: '#243B7A', marginRight: 8}}>local_shipping</Icon>
              <Typography variant="body1" style={{fontSize: 12}}><span>Entregar en:</span><br/><span className={classes.text}>{this.state.shortAddress}</span></Typography>
          </div>
        </Hidden>
        <Hidden lgUp>
          <div style={{ paddingBottom: 4, textAlign: 'center', borderTop: '1px solid #EAF0FC', background: '#EAF0FC' }}>
            <Typography variant="body1" ><span style={{ fontSize: 12 }}>Entregar en:</span> <strong className={classes.text}>{this.state.address}</strong></Typography>
          </div>
        </Hidden>
      </a>
    )
  }

  renderLogout(classes) {
    return (
      <div style={{ cursor: 'pointer' }} onClick={() => { this.setState({ openDeliveryInfoModal: true }) }}>
        <Hidden mdDown>
          <Grid container alignContent="center" alignItems="center">
            <Grid item xs={4}>
              <Icon className={classes.icon}>local_shipping</Icon>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body1" style={{ fontSize: 12 }}>Entregar en:</Typography>
              <Typography variant="body1" className={classes.text} >{this.state.shortAddress}</Typography>
            </Grid>
          </Grid>
        </Hidden>
        <Hidden lgUp>
          <div style={{ paddingBottom: 4, textAlign: 'center', borderTop: '1px solid #EAF0FC', background: '#EAF0FC' }}>
            <Typography variant="body1"><span style={{ fontSize: 12 }}>Entregar en:</span> <strong className={classes.text}>{this.state.address}</strong></Typography>
          </div>
        </Hidden>
      </div>
    )
  }

  renderModal(classes) {
    return (
      <DeliveryInfoModal 
        open={this.state.openDeliveryInfoModal}
        handleClose={() => { this.setState({ openDeliveryInfoModal: false }) }}
      />
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    setNewDeliveryAddress: (address) => {
      dispatch(setNewDeliveryAddress(address))
    },
    getDeliveryAddress: () => {
      dispatch(getDeliveryAddress())
    }
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(DeliveryInfoBar)
