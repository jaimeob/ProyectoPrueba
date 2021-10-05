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
    ExpansionPanelDetails,

} from '@material-ui/core'

import {
    ExpandMore as ExpandMoreIcon,
    Close as CloseIcon,

} from '@material-ui/icons'

import moment from 'moment';
import { requestAPI } from '../../../api/CRUD'
import Utils from "../../../resources/Utils";

// import backoffice from "../../../resources/api";

import { showSnackbar } from "../../Snackbar";

// const Giveaway = require("../../../../base/models/Giveaway");
// const { Utils: baseUtils } = require('../../../../base');

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
        width: "100%"
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
    },
    coverIMG: {
        width: "100%",
        borderRadius: 25
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


function Editar(props) {

    const searchId = props.id;

    const { classes } = props;
    const [modalOpen, setModalOpen] = useState(true);


    const [errorName, seterrorName] = useState(false);
    const [errorDescription, setErrorDescription] = useState(false);
    const [errorStartDate, setErrorStartDate] = useState(false);
    const [errorFinishDate, setErrorFinishDate] = useState(false);
    const [cover, setCover] = useState(null);


    const [instances, setInstances] = useState([]);
    const uploadRef = useRef();

    let [nuevoGiveaway, setNuevoGiveaway] = useState({
        name: '',
        startDate: '',
        finishDate: '',
        description: '',
        cover: '',
        createdBy: '',
        requiredLogin: true,
        countDownStart: false,
        countDownEnd: false,
        requiredTicket: false,

        minimumRequired: false,
        minimumAmount: 0,

        maxTicket: 0,
        status: 0,
        totalWinner: 0,
        termsOfService: ""
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
        if (param === 'name') {
            seterrorName(false)
        } else (setErrorDescription(false))
    }


    useEffect(() => {

        setInstances(dataInstances.map(i => ({ ...i, selected: false })));

        const getGiveawayById = async () => {

            // let { data: dataGiveawayById } = await backoffice.get(`giveaway/${searchId}`)
            let response = await requestAPI({
                host: Utils.constants.HOST,
                method: 'GET',
                resource: `giveaways/${searchId}`,
            })

            setNuevoGiveaway({
                ...response.data,
                startDate: moment(response.data.startDate).format('yyyy-MM-DDTHH:mm'),
                finishDate: moment(response.data.finishDate).format('yyyy-MM-DDTHH:mm')
            })

            setInstances(instancesReady => {
                const tInstances = Array.from(instancesReady);
                response.data.instances.forEach(ins => {
                    tInstances.find(t => t.uuid == ins.uuid).selected = true;
                })
                return tInstances;
            })

        }
        getGiveawayById();

    }, [])

    const sendUptadedGiveaway = async () => {

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


        try {
            // let { data } = await backoffice.put(`/giveaway/${searchId}`, {
            //     ...nuevoGiveaway,
            //     status: parseInt(nuevoGiveaway.status),
            //     instances: instances.filter(i => i.selected).map(i => ({ uuid: i.uuid }))
            // });
            if (cover != null) {
                nuevoGiveaway.cover = cover
            }

            let response = await requestAPI({
                host: Utils.constants.HOST,
                method: 'PATCH',
                resource: `giveaways/${searchId}`,
                data: {
                    ...nuevoGiveaway,
                    status: parseInt(nuevoGiveaway.status),
                    instances: instances.filter(i => i.selected).map(i => ({ uuid: i.uuid }))
                }
            })

            props.getGiveaways()

        } catch (error) {
            showSnackbar({ variant: "error", message: "Ha ocurrido un error inesperado" })
            console.log(error)
        }
        closeModal();

    }

    const handleInstanceCheck = (e) => {
        const tInstances = Array.from(instances);
        let i = tInstances.find(d => d == e);
        i.selected = !i.selected;
        setInstances(tInstances)
    }

    const handleFileChange = async (e) => {
        window.file = uploadRef.current;
        console.log(e)

        let cover = {
            data: await fileToBase64(uploadRef.current.files[0]),
            type: uploadRef.current.files[0].type
        }

        setCover(cover)
    }

    return (
        <Dialog open={modalOpen} onClose={closeModal} scroll="body" maxWidth="md" fullWidth={true}>

            <DialogTitle id="form-dialog-title">Creación de Giveaway</DialogTitle>
            <DialogContent className={classes.content}>
                <DialogContentText>
                    <TextField id="outlined-name"
                        name='name'
                        helperText="Nombre"
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        className={classes.textFieldFull}
                        error={errorName}
                        autoFocus={true}
                        onFocus={() => handleFocus('name')}
                        value={nuevoGiveaway.name}
                    />
                    <TextField
                        id="outlined-multiline-static"
                        helperText="Descripcion"
                        multiline
                        rows={4}
                        name='description'
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        className={classes.textFieldFull}
                        error={errorDescription}
                        value={nuevoGiveaway.description}
                        onFocus={() => handleFocus('description')} />
                    <TextField
                        id="outlined-name"
                        helperText="Ticket máximos"
                        name='maxTicket'
                        onChange={handleChange}
                        margin="normal"
                        type='number'
                        variant="outlined"
                        className={classes.textFieldHalf}
                        value={nuevoGiveaway.maxTicket}
                        disabled={!nuevoGiveaway.requiredTicket}
                    />
                    <TextField
                        id="outlined-select-currency-native"
                        helperText="estatus"
                        name='status'
                        select
                        value={nuevoGiveaway.status}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        className={classes.textFieldHalf}
                        SelectProps={{
                            native: true,
                            MenuProps: {
                                className: classes.menu,
                            },
                        }}
                    >
                        {
                            Utils.serialize(Utils.ConstantsGiveaway.Status).map(option => (
                                <option key={option.value} value={option.value}>{option.name}</option>
                            ))
                        }
                    </TextField>
                    {/* <TextField
                        id="outlined-name"
                        helperText="Cubierta"
                        name='cover' 
                        margin="normal"
                        variant="outlined"
                        className={classes.textFieldFull}
                        
                    /> */}
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
                        style={{ margin: '10px' }}
                    />
                    <br />
                    <img src={ cover === null ? nuevoGiveaway.cover.data : cover.data} className={classes.coverIMG} />
                    <TextField
                        id="outlined-name"
                        helperText="Monto minimo"
                        name='minimumAmount'
                        margin="normal"
                        variant="outlined"
                        type="number"
                        onChange={handleChange}
                        className={classes.textFieldFull}
                        disabled={!nuevoGiveaway.minimumRequired}
                        value={nuevoGiveaway.minimumAmount}
                    />
                    <TextField
                        id="outlined-name"
                        helperText="Cantidad de ganadores"
                        name='totalWinners' /*onChange={handleChange}*/
                        margin="normal"
                        variant="outlined"
                        type="number"
                        onChange={handleChange}
                        className={classes.textFieldFull}
                        value={nuevoGiveaway.totalWinners}
                    />
                    <TextField
                        id="date"
                        label="Fecha Inicio"
                        name='startDate'
                        onChange={handleChange}
                        type="datetime-local"
                        InputLabelProps={{ shrink: true, }}
                        className={classes.textFieldHalf}
                        onFocus={() => handleFocus('startDate')}
                        error={errorStartDate}
                        value={nuevoGiveaway.startDate}
                    />

                    <TextField
                        id="date"
                        label="Fecha fin"
                        name='finishDate'
                        onChange={handleChange}
                        type="datetime-local"
                        InputLabelProps={{ shrink: true, }}
                        className={classes.textFieldHalf}
                        onFocus={() => handleFocus('finishDate')}
                        error={errorFinishDate}
                        value={nuevoGiveaway.finishDate}
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
                        className={classes.textField}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                onChange={handleChange}
                                name='countDownEnd'
                                checked={nuevoGiveaway.countDownEnd}
                            />
                        }
                        label='Conteo final'
                        className={classes.textField}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                onChange={handleChange}
                                name='requiredLogin'
                                checked={nuevoGiveaway.requiredLogin}
                            />
                        }
                        label='Requiere Login'
                        className={classes.textField}
                        disabled
                        style={{display:"none"}}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                onChange={handleChange}
                                name='requiredTicket'
                                checked={nuevoGiveaway.requiredTicket}
                            />
                        }
                        label='Requiere Ticket'
                        className={classes.textField}
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
                        onFocus={() => handleFocus('termsOfService')}
                        value={nuevoGiveaway.termsOfService} />

                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeModal}>Cancelar</Button>
                <Button onClick={sendUptadedGiveaway}>Editar</Button>
            </DialogActions>

        </Dialog>
    )
}


// We need an intermediary variable for handling the recursive nesting.


export default withStyles(styles)(Editar);

