import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import CrediVale from '../modules/Credivale/credivale'
import MainLayout from '../modules/Layout/MainLayout'

class ValidateCrediValePage extends Component {
  render() {
    return (
      <MainLayout style={{ padding: '2px 0px' }}>
        <CrediVale />
      </MainLayout>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(ValidateCrediValePage)
