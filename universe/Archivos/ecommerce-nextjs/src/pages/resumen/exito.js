import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import MainLayout from '../../modules/Layout/MainLayout'
import ThankYouView from '../../modules/ThankYou/thankYouViewDesign'
import Axios from 'axios'
import Utils from '../../resources/Utils'

class ThankYouPage extends Component {
  render() {
    return (
      <MainLayout>
        {
          (this.props.error) ?
          <ThankYouView success={false} />
          :
          <ThankYouView success={true} order={this.props.order} /> 
        }
      </MainLayout>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export async function getServerSideProps({ query }) {
  let response = await Axios({
    method: 'GET',
    url: Utils.constants.CONFIG_ENV.HOST + '/api/orders/' + query.token + '/entity'
  })
  
  if (response.status === Utils.constants.status.SUCCESS) {
    if (response.data.success) {
      let folio = response.data.folio
      if (response.data.calzzapatoCode !== null) {
        folio = response.data.calzzapatoCode
      }
      
      let items = []
      response.data.items.forEach(item => {
        
        let price = item.price
        if (query.pago === 'credivale') {
          price = item.creditPrice
        }

        console.log(item.codeRetailRocket,"el item");

        items.push({
          "id": item.code,
          "name": item.name,
          "list_name": "CategoryExplorer",
          "brand": item.brand.name,
          "category": item.categoryCode,
          "quantity": item.quantity,
          "price": price,
          "codeRetailRocket": item.codeRetailRocket !== undefined ? item.codeRetailRocket : null
        })
      })

      return { props: {
        error: false,
        order: {
          success: response.data.success,
          folio: folio,
          order: response.data.folio,
          calzzapatoCode: response.data.calzzapatoCode,
          shippingMethod: response.data.shippingMethod,
          paymentMethod: response.data.paymentMethod,
          quantity: response.data.quantity,
          address: response.data.address,
          date: response.data.date,
          crediValeFolio: response.data.crediValeFolio,
          referenceOXXO: response.data.referenceOXXO,
          barcodeOXXO: response.data.barcodeOXXO,
          paynetTicket: response.data.paynetTicket,
          total: response.data.total,
          shippingCost: response.data.shippingCost,
          items: items
        }
      } }
    }
  }
  return { props: { error: true } }
}

export default compose(
  connect(mapStateToProps, null)
)(ThankYouPage)
