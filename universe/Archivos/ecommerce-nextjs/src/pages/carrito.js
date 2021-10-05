import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import Cart from '../modules/Cart/cart'
import MainLayout from '../modules/Layout/MainLayout'
import Loading from '../components/Loading'
import { Grid } from '@material-ui/core'
import { openShoppingCart, removeProductFromShoppingCart, updateAllProductFrontShoppingCart } from '../actions/actionShoppingCart'


// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'


class Carrito extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  async componentWillMount() {
  }

  render() {
    const self = this

    return (
      <>
          <MainLayout style={{ padding: '48px 0px' }}>
            <Cart />
          </MainLayout>
          {/* :
          <MainLayout style={{ padding: '48px 0px', height: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Loading />
          </MainLayout> */}
      </>
    )
  }
}

const mapStateToProps = dispatch => {
  return {
    openShoppingCart: (show) => {
      dispatch(openShoppingCart(show))
    },
    removeProductFromShoppingCart: (product) => {
      dispatch(removeProductFromShoppingCart(product))
    },
    updateAllProductFrontShoppingCart: (shoppingCart) => {
      dispatch(updateAllProductFrontShoppingCart(shoppingCart))
    }
  }
}

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
    }
  }
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Carrito)
//export default compose(connect(mapStateToProps, ''))(carrito)

