import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import PersonalInformationComponent from '../../modules/PersonalInforamation/personalInforamation'
import MainLayout from '../../modules/Layout/MainLayout'
import CheckoutNew from '../../modules/CheckoutNew/checkoutViewNew'
import Utils from '../../resources/Utils'
import CheckoutNavbarNew from '../../components/CheckoutNavbarNew'

class Verificar extends Component {
  render() {
    return (
      <>
        <>

        <div style={{marginTop:'100px'}} >
        {/* <CheckoutNavbarNew /> */}
            {/* <CheckoutNew
              navbarLogo={this.props.app.data.configs.navbarLogo}
              verificar={true}
              title="Revisa y confirma tu compra"
              detailButton='Confirmar y pagar'
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
)(Verificar)
