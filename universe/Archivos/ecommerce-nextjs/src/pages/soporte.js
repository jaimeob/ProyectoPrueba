import React, { Component } from 'react'
import { connect } from 'react-redux'
import Support from '../modules/Support/supportView'
import MainLayout from '../modules/Layout/MainLayout'

export class SupportPage extends Component {
  render() {
    return (
      <>
        <MainLayout style={{ padding: '44px 0px' }}>
          <Support />
        </MainLayout>
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default connect(mapStateToProps, null)(SupportPage)