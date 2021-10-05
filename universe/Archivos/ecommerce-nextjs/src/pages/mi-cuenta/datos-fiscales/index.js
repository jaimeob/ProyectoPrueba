import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import TaxDataComponent from '../../../modules/TaxData/taxData'
import MainLayout from '../../../modules/Layout/MainLayout'

class TaxDataPage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <>
            <MainLayout style={{ padding: '0px 0px' }}>
              <TaxDataComponent />
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
)(TaxDataPage)
