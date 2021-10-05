'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import MainLayout from '../modules/Layout/MainLayout'
import GiftCardView from '../modules/GiftCard/giftCardView'
import Axios from 'axios'
import Utils from '../resources/Utils'

class GiftCardPage extends Component {
  render() {
    return (
      <MainLayout>
        <GiftCardView />
      </MainLayout>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

/*
export async function getServerSideProps({ query }) {}
*/

export default compose(
  connect(mapStateToProps, null)
)(GiftCardPage)
