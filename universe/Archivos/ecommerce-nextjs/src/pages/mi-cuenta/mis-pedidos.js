import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import Orders from '../../modules/Orders/orders'
import MainLayout from '../../modules/Layout/MainLayout'

class OrdersPage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <>
            <MainLayout style={{ padding: '0px 0px' }}>
              <Orders />
            </MainLayout>
          </>
          : null}
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(OrdersPage)
