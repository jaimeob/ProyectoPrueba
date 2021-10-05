import React, { useState, useEffect, useRef } from "react";
import { withStyles } from '@material-ui/core/styles';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Button,
    DialogActions,
    TextField,
    Checkbox,
    FormControlLabel,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails
} from '@material-ui/core'
import { requestAPI } from '../../../api/CRUD'


import {
    ExpandMore as ExpandMoreIcon,
    Close as CloseIcon,

} from '@material-ui/icons'

import moment from 'moment';

import { showSnackbar } from "../../Snackbar";
import Utils from "../../../resources/Utils";



const dataInstances = require('./instances.json');

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        margin: '0 auto',
    },
    content: {
        width: "90%",
        margin: '0 auto',
    },
    textFieldFull: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: '93.2%',
    },
    textFieldHalf: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: '45%',
    },
    dense: {
        marginTop: 16,
    },
    menu: {
        width: 200,
    },
    checks: {
        width: "90%",
        marginLeft: '-1.2%'
    }
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function Crear(props) {

    const { classes } = props;

    const [modalOpen, setModalOpen] = useState(true);
    const [dataUser, setDataUser] = useState(0);

    const [errorName, seterrorName] = useState(false);
    const [errorDescription, setErrorDescription] = useState(false);
    const [errorStartDate, setErrorStartDate] = useState(false);
    const [errorFinishDate, setErrorFinishDate] = useState(false);

    const [instances, setInstances] = useState([]);

    const uploadRef = useRef();

    useEffect(() => {

        setInstances(dataInstances.map(i => ({ ...i, selected: false })));

        const currentUser = async () => {
            const user = await Utils.getCurrentUser()
            setDataUser(user.id)
        };
        currentUser();

        props.getGiveaways()

    }, [])

    const [nuevoGiveaway, setNuevoGiveaway] = useState({
        name: '',
        startDate: moment().format('yyyy-MM-DDT[00:00]'),
        finishDate: moment().format('yyyy-MM-DDT[23:59]'),
        description: '',
        createdBy: dataUser,
        requiredLogin: true,
        countDownStart: false,
        countDownEnd: false,
        requiredTicket: false,
        maxTicket: 0,
        errorName: false,
        errorDescription: false,
        errorStartDate: false,
        errorFinishDate: false,
        minimumRequired: false,
        minimumAmount: 0,
        totalWinners: 0,
        termsOfService: "",
    });

    const handleChange = (e) => {
        if (e.target.name === "requiredLogin" || e.target.name === "countDownStart" || e.target.name === "countDownEnd" || e.target.name === "requiredTicket" || e.target.name === "minimumRequired") {
            setNuevoGiveaway({
                ...nuevoGiveaway,
                [e.target.name]: e.target.checked
            })
        } else {
            let { value } = e.target;

            if (e.target.name === "maxTicket" || e.target.name === "minimumAmount" || e.target.name === "totalWinners") {
                value = parseInt(e.target.value)
            }


            setNuevoGiveaway({
                ...nuevoGiveaway,
                [e.target.name]: value
            })
        }
    }

    const closeModal = () => {
        setModalOpen(false);
        props.exit();
    }

    const handleFocus = (param) => {
        if (param === 'name') seterrorName(false)
        if (param === 'description') (setErrorDescription(false))
        if (param === 'startDate') (setErrorStartDate(false))
        if (param === 'finishDate') (setErrorFinishDate(false))
    }


    const handleFileChange = (e) => {
        window.file = uploadRef.current;
        console.log(e)
    }


    const sendNewGiveaway = async () => {

        if (nuevoGiveaway.name === '') {
            seterrorName(true)
            showSnackbar({ variant: "error", message: "Ingresa el nombre del giveaway" });
            return;
        }
        if (nuevoGiveaway.description === '') {
            setErrorDescription(true)
            showSnackbar({ variant: "error", message: "Ingresa la descripición del giveaway" });
            return;
        }
        if (nuevoGiveaway.startDate === '') {
            setErrorStartDate(true)
            showSnackbar({ variant: "error", message: "Ingresa la fecha de inicio" });
            return;
        }
        if (nuevoGiveaway.finishDate === '') {
            setErrorFinishDate(true)
            showSnackbar({ variant: "error", message: "Ingresa la fecha de finalización" });
            return;
        }

        if (Date.parse(nuevoGiveaway.startDate) > Date.parse(nuevoGiveaway.finishDate)) {
            showSnackbar({ variant: "error", message: "La fecha inicial no puede ser mayor a la final" });
            return;
        }

        if (instances.filter(i => i.selected).length == 0) {
            showSnackbar({ variant: "error", message: "Selecciona al menos una unidad de negocio" });
            return;
        }

        if (uploadRef.current.files.length == 0) {
            showSnackbar({ variant: "error", message: "Selecciona una imagen de portada" });
            return;
        }

        const data = {
            ...nuevoGiveaway,
            instances: instances.filter(i => i.selected).map(i => ({ uuid: i.uuid })),
            cover: {
                data: await fileToBase64(uploadRef.current.files[0]),
                type: uploadRef.current.files[0].type
            }
        }



        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'POST',
            resource: 'giveaways',
            endpoint: '/new',
            data: data

        })

        props.getGiveaways(response)
        closeModal();
    }

    const handleInstanceCheck = (e) => {
        const tInstances = Array.from(instances);
        let i = tInstances.find(d => d == e);
        i.selected = !i.selected;
        setInstances(tInstances)
    }


    return (
        <Dialog open={modalOpen} onClose={closeModal} scroll="body" maxWidth="md" fullWidth={true}>

            <DialogTitle id="form-dialog-title">Creación de Giveaway</DialogTitle>
            <DialogContent className={classes.content}>
                <DialogContentText>
                    <TextField id="outlined-name"
                        label="Nombre"
                        name='name'
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        className={classes.textFieldFull}
                        error={errorName}
                        autoFocus={true}
                        onFocus={() => handleFocus('name')}
                        defaultValue=""
                    />
                    <TextField
                        id="outlined-multiline-static"
                        multiline
                        rows={4}
                        label="Descripción"
                        name='description'
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        className={classes.textFieldFull}
                        error={errorDescription}
                        defaultValue=""
                        onFocus={() => handleFocus('description')} />
                    <TextField
                        id="outlined-name"
                        label="Tickets máximos"
                        name='maxTicket'
                        onChange={handleChange}
                        margin="normal"
                        type='number'
                        variant="outlined"
                        className={classes.textFieldHalf}
                        disabled={!nuevoGiveaway.requiredTicket}
                    />


                    <FormControlLabel
                        control={
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={uploadRef}
                            />
                        }
                        label=''
                        className={classes.textFieldHalf}
                    />

                    <TextField
                        id="outlined-name"
                        label="Monto minimo"
                        name='minimumAmount'
                        margin="normal"
                        variant="outlined"
                        type="number"
                        onChange={handleChange}
                        className={classes.textFieldFull}
                        disabled={!nuevoGiveaway.minimumRequired}
                    />
                    <TextField
                        id="outlined-name"
                        label="Cantidad de ganadores"
                        name='totalWinners'
                        margin="normal"
                        variant="outlined"
                        type="number"
                        onChange={handleChange}
                        className={classes.textFieldFull}
                    />
                    <TextField
                        id="date"
                        label="Fecha inicio"
                        name='startDate'
                        value={nuevoGiveaway.startDate}
                        onChange={handleChange}
                        type="datetime-local"
                        InputLabelProps={{ shrink: true, }}
                        className={classes.textFieldHalf}
                        onFocus={() => handleFocus('startDate')}
                        error={errorStartDate}
                    />

                    <TextField
                        id="date"
                        label="Fecha fin"
                        name='finishDate'
                        value={nuevoGiveaway.finishDate}
                        onChange={handleChange}
                        type="datetime-local"
                        InputLabelProps={{ shrink: true, }}
                        className={classes.textFieldHalf}
                        onFocus={() => handleFocus('finishDate')}
                        error={errorFinishDate}
                    />

                    <ExpansionPanel>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            Sucursales
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
                            {
                                instances.map((i, k) => <FormControlLabel key={k}
                                    control={<Checkbox checked={i.selected} onChange={() => handleInstanceCheck(i)} />}
                                    label={i.alias}
                                    className={classes.checks}
                                />)
                            }
                        </ExpansionPanelDetails>
                    </ExpansionPanel>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={nuevoGiveaway.countDownStart}
                                onChange={handleChange}
                                name='countDownStart'
                            />
                        }
                        label='Conteo inicial'
                        className={classes.checks}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={nuevoGiveaway.countDownEnd}
                                onChange={handleChange}
                                name='countDownEnd'
                            />
                        }
                        label='Conteo final'
                        className={classes.checks}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={nuevoGiveaway.requiredLogin}
                                onChange={handleChange}
                                name='requiredLogin'
                                
                            />
                        }
                        label='Requiere Login'
                        className={classes.checks}
                        disabled
                        style={{display:"none"}}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={nuevoGiveaway.requiredTicket}
                                onChange={handleChange}
                                name='requiredTicket'
                            />
                        }
                        label='Requiere Ticket'
                        className={classes.checks}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={nuevoGiveaway.minimumRequired}
                                onChange={handleChange}
                                name='minimumRequired'
                            />
                        }
                        label='Requiere Monto '
                        className={classes.checks}
                    />
                    <TextField
                        id="outlined-multiline-static"
                        multiline
                        rows={4}
                        label="Terminos y condiciones"
                        name='termsOfService'
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        className={classes.textFieldFull}
                        defaultValue=""
                        onFocus={() => handleFocus('termsOfService')} />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeModal}>Cancelar</Button>
                <Button onClick={sendNewGiveaway}>Crear</Button>
            </DialogActions>

        </Dialog>
    )
}
export default withStyles(styles)(Crear);