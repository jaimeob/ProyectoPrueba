import React, { Component } from 'react'
import compose from 'recompose/compose'
import StepperNew from '../components/StepperNew'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import {
    Typography,
    Grid,
    Paper,
    Button,
    StepContent,
    StepLabel,
    Stepper,
    Step,
    Divider,
    Hidden
} from '@material-ui/core'
import GoogleMapReact from 'google-map-react'
import ProductCartNew from './ProductCartNew'
import Attention from './Attention'
import ProductsTrackingList from './ProductsTrackingList'
import Utils from '../resources/Utils'

const styles = theme => ({
    paper: {
        backgroundColor: '#ffffff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
    },
    page: {
        width: "100%",
        height: "100%",
    }
})


class TrackingOrder extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedPhoto: '',
            activeStep: 0,
            steps: [],
            imageWorking: true,
        }
    }

    getStepContent = (step) => {
        switch (step) {
            case 0:
                return this.props.order.shippingMethods[step]
            case 1:
                return this.props.order.shippingMethods[step]
            case 2:
                return this.props.order.shippingMethods[step]
            default:
                return 'Unknown step';
        }
    }

    render() {
        const { classes } = this.props
        const self = this
        return (
            <div style={{ background:'white' }} >
                <Grid container >
                    <Grid item xs={12} style={{ margin: "15px" }}>
                        <StepperNew steps={[{ id: 1, name: 'Creado', status: true }, { id: 2, name: 'Pagado', status: true }, { id: 3, name: 'Enviado', status: false }, { id: 4, name: 'Entregado', status: false }]} ></StepperNew>
                    </Grid>

                    <ProductsTrackingList products={this.props.data.products} />

                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.paper} style={{ backgroundColor: '#edeef2', textAlign: 'center', }}>
                        <Attention folio={this.props.order.information.folio}   shoppingDate={this.props.order.information.shoppingDate} shippingName={this.props.order.shippingMethods[0].shippingMethodName}/>
                    </Grid>

                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: "30px" }}>
                        {this.props.order != null || this.props.order != undefined ?
                            <div className={classes.root}>

                                {this.props.order.shippingMethods.map((order, index) => (
                                    <Stepper activeStep={0} orientation="vertical">
                                        {
                                            (this.getStepContent(index).tracking !== null && this.getStepContent(index).tracking !== undefined) ?
                                                this.getStepContent(index).tracking.map((product, index) => (
                                                    <Step key={index}>
                                                        <StepLabel>{product.description} - {product.date} - {product.location} </StepLabel>
                                                        <StepContent>
                                                            <Typography>{product.date} - {product.location} </Typography>
                                                        </StepContent>
                                                    </Step>
                                                ))
                                                : null
                                        }
                                    </Stepper>
                                ))}
                            </div>
                            : null}
                    </Grid>
                </Grid>
            </div >


        )
    }
}

export default compose(
    withStyles(styles),
)(TrackingOrder)
