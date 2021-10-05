import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import ReactSelect from 'react-select'
import Uploader from './Uploader'
import { showSnackbar } from "./Snackbar";

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Actions
import Utils from '../resources/Utils'
import Title from './Title'
import {
    Grid,
    TextField,
    Button,
    MenuItem,
    Modal,
    FormControlLabel,
    Typography,
    FormControl,
    Radio,
    RadioGroup
} from '@material-ui/core'
import { requestAPI } from '../api/CRUD.js'



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
    smallForm: {
        overflowY: 'scroll',
        position: 'absolute',
        width: theme.spacing.unit * 60,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: 16,
        height: '90%',
        width: '50%',

        [theme.breakpoints.down('sm')]: {
            background: 'white',
            width: '90%',
            height: '100%',
        }
    },
    container: {
        width: '100%',
        margin: '0 auto'
    },
    buttonsContainer: {
        textAlign: 'right',
        borderTop: '1px solid #CED2DD',
        padding: 16,
        backgroundColor: 'white'
    },
    primaryButton: {
        fontWeight: 800
    },
    content: {
        width: "90%",
        margin: '0 auto',
    },
    textFieldFull: {
        marginTop: '10px',
        width: '100%',
    },
})



class NewUserModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            campaign: "",
            subject: "",
            data: { products: [], users: [] },
            productValue: "",
            orientationValue: "",
            openDesktopUploader: false,
            openDesktopUploader: false,
            openMobileUploader: false,
            desktopDocs: [],
            mobileDocs: [],
            openSnack: false,
            messageSnack: '',
            deletedDesktopDocs: [],
            deletedMobileDocs: [],
            banners: [],
            blockTypeId: null,
            blockId: null,
            identifier: '',
            fullWidth: false,
            paddingTop: '0',
            paddingBottom: '0',
            heightBanner: '600',
            heightBannerMobile: '600',
            seoDescription: '',
            callToAction: '',
            stateArray: [],
            municipalityArray: [],
            stateSelected: '',
            municipalitySelected: [],

        }

        this.handleClose = this.handleClose.bind(this)
        this.handleChangeCheck = this.handleChangeCheck.bind(this);
        this.handleChangeOrientation = this.handleChangeOrientation.bind(this);
        this.createEmail = this.createEmail.bind(this);
        this.handleFieldChangeState = this.handleFieldChangeState.bind(this);
        this.handleFieldChangeMunicipality = this.handleFieldChangeMunicipality.bind(this)
        this.getStates = this.getStates.bind(this)
        this.getMunicipality = this.getMunicipality.bind(this)
    }



    handleClose() {
        this.setState({
            campaign: '',
            subject: '',
            productValue: '',
            orientationValue: '',
            stateArray: [],
            municipalityArray: [],
            stateSelected: '',
            municipalitySelected: [],
            desktopDocs: []
        })
        this.props.handleClose()
    }

    confirmDesktopUploader(docs, deletedDocs) {
        this.setState({
            openDesktopUploader: false,
            desktopDocs: docs,
            deletedDesktopDocs: deletedDocs
        })
    }

    handleChangeCheck(e) {
        this.setState({
            productValue: e.target.value,
        })
    }

    async getMailById(id) {
        let response = await requestAPI({
            method: 'POST',
            host: Utils.constants.HOST,
            resource: 'mailings',
            endpoint: '/mail/',
            data: id
        })

        if (response.data.length > 0) {
            this.setState({
                stateArray: response.data
            })
        }
    }

    async getStates() {
        let response = await requestAPI({
            method: 'GET',
            host: Utils.constants.HOST,
            resource: 'mailings',
            endpoint: '/states/',
        })

        if (response.data.length > 0) {
            this.setState({
                stateArray: response.data
            })
        }
    }

    async getMunicipality(state) {
        let response = await requestAPI({
            method: 'POST',
            host: Utils.constants.HOST,
            resource: 'mailings',
            endpoint: '/municipality',
            data: { state: state }
        })

        if (response.data.length > 0) {
            this.setState({
                municipalityArray: response.data
            })
        }
    }

    async handleChangeOrientation(e) {
        if (e.target.value === "city") {
            this.getStates()
            this.setState({
                orientationValue: e.target.value,
            })
        }else{
            this.setState({
                orientationValue: e.target.value,
                stateArray: [],
                municipalityArray: [],
                stateSelected: '',
                municipalitySelected: [],
                
            })
        }

        this.setState({
            orientationValue: e.target.value,
        })
    }

    async handleFieldChangeState(e) {
        if (e.target.value !== '') {
            this.getMunicipality(e.target.value)
            this.setState({
                stateSelected: e.target.value,
            })
        }
    }

    async handleFieldChangeMunicipality(selectedOption) {
        this.setState({
            municipalitySelected: selectedOption,
        })
    }

    async createEmail() {
        let user = await Utils.getCurrentUser()
        if (this.state.orientationValue === "") {
            showSnackbar({ variant: "error", message: "Es necesario seleccionar una orientación" });
            return false
        }
        if (this.state.campaign === "") {
            showSnackbar({ variant: "error", message: "Es necesario escribir el nombre de la campaña" });
            return false
        }
        if (this.state.subject === "") {
            showSnackbar({ variant: "error", message: "Es necesario escribir un titulo" });
            return false
        }
        if (this.state.productValue === "") {
            showSnackbar({ variant: "error", message: "Es necesario seleccionar algun tipo de producto" });
            return false
        }
        if (this.state.orientationValue !== "" && this.state.campaign !== "" && this.state.subject !== "" && this.state.productValue !== "") {

            this.props.handleClose()
            let response = await requestAPI({
                method: 'POST',
                host: Utils.constants.HOST,
                resource: 'mailings',
                endpoint: '/new/',
                data: {
                    orientationValue: this.state.orientationValue,
                    productValue: this.state.productValue,
                    municipalitySelected: this.state.municipalitySelected,
                    campaign: this.state.campaign,
                    subject: this.state.subject,
                    user: user.name + ' ' + user.firstLastName + ' ' + user.secondLastName,
                    images: this.state.desktopDocs

                }
            })


            if (response.data.created === true) {

                this.setState({
                    campaign: '',
                    subject: '',
                    productValue: '',
                    orientationValue: '',
                    stateArray: [],
                    municipalityArray: [],
                    stateSelected: '',
                    municipalitySelected: [],
                    desktopDocs: []
                })

            } else {
                showSnackbar({ variant: "error", message: "No se encontraron usuarios" });
                this.setState({
                    campaign: '',
                    subject: '',
                    productValue: '',
                    orientationValue: '',
                    stateArray: [],
                    municipalityArray: [],
                    stateSelected: '',
                    municipalitySelected: [],
                    desktopDocs: []
                })

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
                onRendered={this.handleRender}
            >
                <div style={getModalStyle()} className={classes.smallForm}>
                    <Title
                        title={Utils.isEmpty(this.props.data) ? "Nuevo envío de correos." : "Detalle del correo"}
                    />
                    <div style={{ marginTop: 24 }}>
                        <Grid className={classes.container} container>
                            <Grid item xs={12}>
                                <TextField
                                    style={{ width: '100%' }}
                                    label="Nombre de campaña *"
                                    variant="outlined"
                                    type="text"
                                    autoFocus={true}
                                    value={!Utils.isEmpty(this.props.data) && this.props.data != undefined ? this.props.data.campaign : this.state.campaign}
                                    onChange={(event) => { this.setState({ campaign: event.target.value }) }}
                                    disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)}
                                />
                            </Grid>

                            <Grid item xs={12} style={{ marginTop: 16 }}>
                                <TextField
                                    style={{ width: '100%' }}
                                    label="Asunto *"
                                    variant="outlined"
                                    type="text"
                                    value={this.props.data.subject != undefined ? this.props.data.subject : this.state.subject}
                                    onChange={(event) => { this.setState({ subject: event.target.value }) }}
                                    disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)}
                                />
                            </Grid>
                            {this.state.productValue === "offer" ? (
                                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                    {
                                        (this.state.desktopDocs.length > 0) ?
                                            <div style={{ marginTop: 8 }}>
                                                {/* <label><strong>Desktop banner cargado:</strong> {this.state.desktopDocs[0].name}</label> */}
                                            </div>
                                            :
                                            ''
                                    }
                                    <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                                        this.setState({ openDesktopUploader: true })
                                    }}>
                                        SUBIR IMAGEN DESKTOP
                                    </Button>
                                    <Uploader
                                        open={this.state.openDesktopUploader}
                                        host={Utils.constants.HOST}
                                        title="Subir Imagen "
                                        description={"Solo se permite iamgenes de tamaño máximo de 880px x 440"}
                                        limit={5}
                                        use="banners"
                                        docs={this.props.data.imagen === undefined ? this.state.desktopDocs : this.props.data.imagen}
                                        validFormats={['image/jpeg', 'image/jpg', 'image/png']}
                                        hideComments={true}
                                        minWidth={880}
                                        maxWidth={880}
                                        minHeight={440}
                                        maxHeight={440}
                                        maxSize={500000}
                                        handleCloseWithData={(docs, deletedBlocks) => { this.confirmDesktopUploader(docs, deletedBlocks) }}
                                        handleClose={() => { this.setState({ openDesktopUploader: false }) }}

                                    />

                                </Grid>
                            ) : null
                            }


                            < Grid item xs={12} style={{ marginTop: 16 }}>
                                <Typography variant="h6" color="inherit" >
                                    Productos
                                </Typography>
                            </Grid>

                            < Grid item xs={12} style={{ marginTop: 16 }}>
                                <FormControl component="fieldset">
                                    <RadioGroup aria-label="gender" name="gender1" value={this.props.data.productValue === undefined ? this.state.productValue : this.props.data.productValue} onChange={this.handleChangeCheck}>
                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="productsRealation" control={<Radio />} label="Productos Relacionados" />
                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="seenProducts" control={<Radio />} label="Vistos  Recientemente" />
                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="lostCar" control={<Radio />} label="Carrito abandonado" />
                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="offer" control={<Radio />} label="Oferta" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>

                            < Grid item xs={12} style={{ marginTop: 16 }}>
                                <Typography variant="h6" color="inherit" >
                                    Orientación
                                </Typography>
                            </Grid>

                            < Grid item xs={12} style={{ marginTop: 16 }} >
                                <FormControl component="fieldset" style={{ width: '100%' }}>
                                    <RadioGroup aria-label="gender" name="gender1" value={this.props.data.orientationValue === undefined ? this.state.orientationValue : this.props.data.orientationValue} onChange={this.handleChangeOrientation}>
                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="all" control={<Radio />} label="Todos" />
                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="lastPurshase" control={<Radio />} label="Fecha última compra" />
                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="city" control={<Radio />} label="Ciudad" />
                                        {this.state.orientationValue === 'city' ? (
                                            <Grid container style={{ width: '100%' }}>
                                                <Grid item xs={12} style={{ width: '100%' }}>
                                                    <TextField
                                                        className={classes.textFieldFull}
                                                        fullWidth
                                                        select
                                                        name="States"
                                                        id="states"
                                                        variant="outlined"
                                                        label="Estados"
                                                        value={this.state.stateSelected}
                                                        SelectProps={{
                                                            value: this.state.stateSelected,
                                                            onChange: this.handleFieldChangeState
                                                        }}
                                                    >
                                                        {this.state.stateArray.map((state, index) => (
                                                            <MenuItem key={index} value={state.code}>
                                                                {state.name}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </Grid>

                                                <Grid item xs={12} style={{ marginTop: 16 }}>

                                                    <ReactSelect
                                                        placeholder={'Selecciona un municipio'}
                                                        isMulti
                                                        options={this.state.municipalityArray}
                                                        onChange={this.handleFieldChangeMunicipality}
                                                        noOptionsMessage={() => 'Cargando...'}
                                                        defaultValue={
                                                            (this.state.municipalitySelected.length > 0) ?
                                                                this.state.municipalitySelected
                                                                :
                                                                false
                                                        }
                                                    />
                                                </Grid>
                                            </Grid>

                                        ) : null
                                        }



                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="noPurshase" control={<Radio />} label="Usuarios sin compra" />
                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="withFacebook" control={<Radio />} label="Usuarios con facebook" />
                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="withoutFacebook" control={<Radio />} label="Usuarios sin facebook" />
                                        <FormControlLabel disabled={this.props.data != undefined && !Utils.isEmpty(this.props.data)} value="newsletter" control={<Radio />} label="Newsletter" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>


                            <Grid item xs={12}  >
                                {
                                    Utils.isEmpty(this.props.data) ?
                                        (
                                            <Grid container>
                                                <Grid item xs={6} className={classes.buttonsContainer} style={{ marginTop: 16 }}>
                                                    <Button fullWidth variant="outlined" style={{ marginRight: 8 }} onClick={() => { this.props.handleClose() }}>
                                                        CANCELAR
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={6} className={classes.buttonsContainer} style={{ marginTop: 16 }}>
                                                    <Button fullWidth variant="contained" color="primary" className={classes.primaryButton} onClick={this.createEmail}>
                                                        CREAR EMAIL
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Grid container>
                                                <Grid item xs={6} className={classes.buttonsContainer} style={{ marginTop: 16 }}>
                                                </Grid>
                                                <Grid item xs={6} className={classes.buttonsContainer} style={{ marginTop: 16 }}>
                                                    <Button fullWidth variant="contained" color="primary" className={classes.primaryButton} onClick={() => { this.props.handleClose() }}>
                                                        ACEPTAR
                                                    </Button>
                                                </Grid>
                                            </Grid>)
                                }
                            </Grid >
                        </Grid>
                    </div>
                    <Snackbar
                        style={{ width: '90%' }}
                        autoHideDuration={5000}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        open={this.state.openSnack}
                        onClose={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
                        message={
                            <span>{this.state.messageSnack}</span>
                        }
                        action={[
                            <IconButton
                                key="close"
                                aria-label="Close"
                                color="inherit"
                                onClick={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
                            >
                                <CloseIcon />
                            </IconButton>
                        ]}
                    />
                </div>
            </Modal>
        )
    }
}

const mapStateToProps = state => ({ ...state })

export default compose(
    withRouter,
    withTheme(),
    withStyles(styles),
    connect(mapStateToProps, null)
)(NewUserModal)
