import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import MainLayout from '../../modules/Layout/MainLayout'
import CalzzamovilView from '../../modules/Calzzamovil/calzzaMovilView'
import Axios from 'axios'
import Utils from '../../resources/Utils'

class CalzzamovilPage extends Component {
  render() {
    return (
      <MainLayout>
        {
          (this.props.error) ?
          <CalzzamovilView success={false} />
          :
          <CalzzamovilView success={true} data={this.props.order} /> 
        }
      </MainLayout>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })
export async function getServerSideProps({ query }) {
  try {
    let response = await Axios({
      method: 'GET',
      url: Utils.constants.CONFIG_ENV.HOST + '/api/orders/' + query.order + '/calzzamovil'
    })
    
    if (response.status === Utils.constants.status.SUCCESS) {
      return { props: { error: false, order: response.data } }
    } else {
      return { props: { error: true } }  
    }
  } catch (err) {
    return { props: { error: true } }
  }
}

export default compose(
  connect(mapStateToProps, null)
)(CalzzamovilPage)