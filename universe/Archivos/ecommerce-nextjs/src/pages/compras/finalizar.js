'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import Checkout from '../../modules/Checkout/checkoutView'
import MainLayout from '../../modules/Layout/MainLayout'

import { withStyles } from '@material-ui/core'

const styles = theme => ({})

class CheckoutPage extends Component {
  render() {
    const { classes } = this.props
    return (
      <> 
        <MainLayout title={ "Finalizar compra | " + this.props.app.data.alias } checkout={true} style={{ padding: '0px 0px' }}>
          <Checkout />
        </MainLayout>
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(CheckoutPage)
