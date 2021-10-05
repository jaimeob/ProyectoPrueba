import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import PersonalInformationComponent from '../../modules/PersonalInforamation/personalInforamation'
import MainLayout from '../../modules/Layout/MainLayout'
import CheckoutNew from '../../modules/CheckoutNew/checkoutViewNew'
import Utils from '../../resources/Utils'
import CheckoutNavbarNew from '../../components/CheckoutNavbarNew'
import ClickAndCollect from '../../modules/ClickAndCollect/ClickAndCollect'
import Head from 'next/head'


class Confirmacion extends Component {
  render() {
    return (
      <>
        <>
        <Head>
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: process.env.CONFIG_ENV.rawJsFromFile }}></script>
          <title>Confirmación</title>
        </Head>
          <CheckoutNavbarNew />
          <div style={{marginTop:'100px'}} >
            {/* <CheckoutNew confirmation={true} /> */}
          </div>
        </>
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(Confirmacion)
