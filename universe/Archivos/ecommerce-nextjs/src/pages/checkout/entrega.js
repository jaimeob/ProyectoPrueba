import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import CheckoutNew from '../../modules/CheckoutNew/checkoutViewNew'
import CheckoutNavbarNew from '../../components/CheckoutNavbarNew'
import Head from 'next/head'

class Entrega extends Component {
  render() {
    return (
      <>
        <>
        <Head>
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: process.env.CONFIG_ENV.rawJsFromFile }}></script>
          <title>Entrega</title>
        </Head>
          {/* <CheckoutNavbarNew /> */}
          <div style={{ marginTop: '100px' }} >
            <CheckoutNew shipping={true} />
          </div>
        </>
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(Entrega)
