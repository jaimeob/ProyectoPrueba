import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';



// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Button, Typography, Modal, TextField } from '@material-ui/core'
import { showSnackbar } from "./Snackbar";


import Snackbar from './Snackbar'
// import Product from '../components/Product'


// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

registerLocale('es', es)

function getModalStyle() {
    const top = 50
    const left = 50
    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    }
}

const styles = theme => ({
    container: {
        overflowY: 'scroll',
        maxHeight: 'calc(100vh - 100px)',
        position: 'absolute',
        width: theme.spacing.unit * 50,
        backgroundColor: 'white',
        boxShadow: theme.shadows[5],
        padding: '32px 16px 32px 16px',
        borderRadius: "5px",

        [theme.breakpoints.down('xs')]: {
            width: '90%',
            padding: 12
        }
    },


    avatar: {
        fontSize: '50px',
        width: '100px',
        height: '100px',
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
        display: 'flex',
    },
    containerInfo: {
        padding: '10px',
        borderRadius: '5px',
        boxShadow: 'rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) 0px 16px 32px -4px',
    },
    buttonsContainer: {
        textAlign: 'right',
        borderTop: '1px solid #CED2DD',
        padding: 16,
        backgroundColor: 'white'
    },
    primaryButton: {
        fontWeight: 800
    }
})

class ModalTracking extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedDate: '',
            comments: '',
            openSnack: false,
            messageSnack: '',
            guide: "",
        }

        this.handleClose = this.handleClose.bind(this)
        this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
        this.handleChangeValues = this.handleChangeValues.bind(this)
        this.searchTrackingNumber = this.searchTrackingNumber.bind(this)
    }

    handleClose() {
        this.setState({
            changeButton: true,
            comments: '',
            selectedDate: '',
            messageSnack: '',
            openSnack: false,
            sign: [],
            ine: [],
            guide:""

        })

        this.props.handleClose()
    }

    handleCloseSnackbar() {
        this.setState({
            openSnack: false,
            messageSnack: ''
        })
    }

    handleChangeValues(e) {
        this.setState({
            guide: e.target.value,
        })
    }


    async searchTrackingNumber() {
        if (this.state.guide === "" || this.state.guide === undefined) {
            showSnackbar({ variant: "error", message: "Es necesario escribir un numero de rastreo" });
        } else {
            let response = await requestAPI({
                host: Utils.constants.HOST_API_ECOMMERCE,
                resource: 'orders',
                endpoint: '/info-guide',
                method: 'POST',
                json: true,
                data: {
                    id: this.state.guide,
                    calzzapatoCode: this.props.calzzapatoCode
                }
            })


            if (response.data.information) {
                this.props.closeModalTracking()

                let sendingEmail = await requestAPI({ host: Utils.constants.HOST_API_ECOMMERCE,
                    resource: 'orders',
                    endpoint: '/email-tracking',
                    method: 'POST',
                    json: true,
                    data: {
                        data: {
                            trackingNumber: this.state.guide,
                            calzzapatoCode: this.props.calzzapatoCode,
                            estimatedDelivery: response.data.estimatedDelivery
                        }
                    }

                })

                this.setState({
                    guide: "",
                })

            } else {
                showSnackbar({ variant: "error", message: "El número de rastreo no es valido" });
            }
        }
    }

    render() {
        const { classes } = this.props

        return (
            <Modal
                open={this.props.open}
                onEscapeKeyDown={this.handleClose}
                onBackdropClick={this.handleClose}
            >
                <div style={getModalStyle()} className={classes.container}>
                    <Grid container>
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} >
                            <Typography variant="body1" style={{ fontSize: 16 }}>
                                Folio: {this.props.folio}
                            </Typography>
                            <br />
                            <TextField
                                type="number"
                                value={this.state.guide}
                                variant="outlined"
                                onChange={(e) => this.handleChangeValues(e)}
                                fullWidth
                                placeholder="Numero de rastreo..."
                                autoFocus={true}
                                size="small"
                            />
                            <Grid item xs={12}  >
                                <Grid container>
                                    <Grid item xs={6} className={classes.buttonsContainer} style={{ marginTop: 16 }}>
                                        <Button fullWidth variant="outlined" style={{ marginRight: 8 }} onClick={() => { this.handleClose() }} >
                                            Cancelar
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6} className={classes.buttonsContainer} style={{ marginTop: 16 }}>
                                        <Button fullWidth variant="contained" color="primary" className={classes.primaryButton} onClick={this.searchTrackingNumber} >
                                            Aceptar
                                        </Button>
                                    </Grid>
                                </Grid>


                            </Grid >
                        </Grid>
                    </Grid>
                </div>

            </Modal>
        )
    }
}
const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = dispatch => {
    return {

    }
}
export default compose(
    withRouter,
    withTheme(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(ModalTracking)
