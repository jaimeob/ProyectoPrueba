import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import AddressComponent from '../../../modules/Address/address'
import AddressNewComponent from '../../../modules/AddressNew/addressNew'
import MainLayout from '../../../modules/Layout/MainLayout'

class AddressPage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <>
            <MainLayout style={{ padding: '0px 0px' }}>
              <AddressComponent />
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
)(AddressPage)
