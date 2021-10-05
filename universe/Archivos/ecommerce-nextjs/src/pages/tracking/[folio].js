import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import MainLayout from '../../modules/Layout/MainLayout'
import TrackingView from '../../modules/Tracking/trackingView'
import Utils from '../../resources/Utils'
import Axios from 'axios'

class TrackingPage extends Component {

    render() {
        return (
            <MainLayout>
                <TrackingView order={this.props.order} />
            </MainLayout>
        )
    }
}

const mapStateToProps = ({ app }) => ({ app })

// export async function getServerSideProps(context) {
//     return {
//         props: {
//             folioActual: context.query.folio
//         }
//     }
// }

export async function getServerSideProps(context) {
    console.log("tiendas");
    let folio = parseInt(context.query.folio)
    try {
        let response = await Axios({
            method: 'GET',
            url: Utils.constants.CONFIG_ENV.HOST + '/api/orders/' + folio + '/detail-information'
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
)(TrackingPage)