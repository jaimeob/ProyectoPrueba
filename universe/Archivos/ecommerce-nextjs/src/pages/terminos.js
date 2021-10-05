import React, { Component } from 'react'

import { connect } from 'react-redux'
import compose from "recompose/compose"
import Terms from '../modules/Terms/termsView'
import MainLayout from '../modules/Layout/MainLayout'

class TermsPage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <MainLayout style={{ padding: '1px 0px' }}>
            <Terms />
          </MainLayout>
          : null}
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(TermsPage)
