import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import PersonalInformationComponent from '../../modules/PersonalInforamation/personalInforamation'
import MainLayout from '../../modules/Layout/MainLayout'
import CheckoutNew from '../../modules/CheckoutNew/checkoutViewNew'
import Utils from '../../resources/Utils'
import CheckoutNavbarNew from '../../components/CheckoutNavbarNew'

class Pagos extends Component {
  render() {
    return (
      <>
        <>
          {/* <CheckoutNavbarNew /> */}
          <div style={{marginTop:'100px'}} >
            {/* <CheckoutNew
              navbarLogo={this.props.app.data.configs.navbarLogo}
              pagos={true}
              title="¿Cómo quieres pagar?"
              nextStep={Utils.constants.paths.checkoutVerificar}
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
)(Pagos)
