import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import Track from '../components/TrackingHomeOrder'
import MainLayout from '../modules/Layout/MainLayout'

class TrackingPage extends Component {
  render() {
    return (
      <MainLayout style={{ padding: '2px 0px' }}>
        <Track />
      </MainLayout>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(TrackingPage)
