import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import MainLayout from '../modules/Layout/MainLayout'
import StoresView from '../modules/Stores/storesView'
import Utils from '../resources/Utils'
import Axios from 'axios'

class Tiendas extends Component {
  render() {
    return (
      <>
      {
        this.props.app.data !== null ?
        <>
          <MainLayout style={{ padding: '2px 0px' }}>
            <StoresView stores={this.props.stores} />
          </MainLayout>
        </>
        : null }
      </>
    )
  }
}
export async function getServerSideProps() {
  console.log("[tiendas]");
  let response = await Axios(Utils.constants.CONFIG_ENV.HOST + '/api/stores', { headers: { uuid: Utils.constants.CONFIG_ENV.UUID } })
  let data = await response.data
  return { props: { stores: data } }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(Tiendas)
