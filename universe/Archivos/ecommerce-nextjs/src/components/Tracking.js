import React, { Component } from 'react'
import { connect } from 'react-redux'
import MainLayout from '../modules/Layout/MainLayout'
import TrackingProduct from './TrackingProduct'

export class Tracking extends Component {
    render(props) {
        return (
            <>
                <MainLayout style={{ padding: '44px 0px' }}>
                    <TrackingProduct />
                </MainLayout>
            </>
        )
    }
}

const mapStateToProps = ({ app }) => ({ app })

export default connect(mapStateToProps, null)(Tracking)