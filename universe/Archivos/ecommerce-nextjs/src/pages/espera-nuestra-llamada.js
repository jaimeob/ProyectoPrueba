import React, { Component } from 'react'

import { connect } from 'react-redux'
import compose from "recompose/compose"
import ResponseCrediValeView from '../modules/Credivale/ResponseCrediValeView'
import MainLayout from '../modules/Layout/MainLayout'

class RequestCrediValePage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <ResponseCrediValeView />
          : null}
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(RequestCrediValePage)
