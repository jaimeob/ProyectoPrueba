import React, { Component } from 'react'

import { connect } from 'react-redux'
import compose from "recompose/compose"
import PrivacyView from '../modules/Privacy/PrivacyView'
import MainLayout from '../modules/Layout/MainLayout'

class PrivacyPage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <MainLayout style={{ padding: '1px 0px' }}>
            <PrivacyView />
          </MainLayout>
          : null}
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(PrivacyPage)
