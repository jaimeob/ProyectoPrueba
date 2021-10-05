import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import PersonalInformationComponent from '../../modules/PersonalInforamation/personalInforamation'
import MainLayout from '../../modules/Layout/MainLayout'
import CheckoutNew from '../../modules/CheckoutNew/checkoutViewNew'
import Utils from '../../resources/Utils'
import CheckoutNavbarNew from '../../components/CheckoutNavbarNew'


class Direcciones extends Component {
  render() {
    return (
      <>
        <>
          <CheckoutNavbarNew />
          <div style={{marginTop:'100px'}} >
            {/* <CheckoutNew
              navbarLogo={this.props.app.data.configs.navbarLogo}
              direcciones={true}
              title="¿Dónde te entregamos?"
              nextStep={Utils.constants.paths.checkoutPago}
            /> */}
          </div>
        </>
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(Direcciones)
