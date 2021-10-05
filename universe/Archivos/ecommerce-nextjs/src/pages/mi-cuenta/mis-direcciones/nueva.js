import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import AddressComponent from '../../../modules/Address/address'
import AddressNewComponent from '../../../modules/AddressCreate/AddressCreate'
import MainLayout from '../../../modules/Layout/MainLayout'

class Nueva extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <>
            {/* <MainLayout style={{ padding: '0px 0px' }}>
              <AddressComponent />
            </MainLayout> */}
              <AddressNewComponent />

          </>
          : null}
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(Nueva)
