import React, { Component } from 'react'
import {connect} from 'react-redux'
import compose from "recompose/compose"
import ThankYouView from '../../modules/ThankYou/thankYouView'
import MainLayout from '../../modules/Layout/MainLayout'

class Success extends Component {
  render() {
    return (
      <MainLayout>
        <ThankYouView />
      </MainLayout>
    )
  }
}

const mapStateToProps = ({app}) => ({app})

export default compose(connect(mapStateToProps, ''))(Success)
