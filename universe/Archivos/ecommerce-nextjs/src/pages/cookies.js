import React, { Component } from 'react'

import { connect } from 'react-redux'
import compose from "recompose/compose"
import CookiesView from '../modules/Privacy/CookiesView'
import MainLayout from '../modules/Layout/MainLayout'

class PrivacyPage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <MainLayout style={{ padding: '1px 0px' }}>
            <CookiesView />
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
