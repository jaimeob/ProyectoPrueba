import React, { useEffect, useRef, useState } from "react";
// import mongoose from "mongoose";
import Axios from 'axios'
// import { backoffice } from "../../resources/api";
import { requestAPI } from '../../api/CRUD'

import {
    Grid,
    Typography,
    Container,
    TextField,
    Button,
    Chip,
    List,
    ListItem,
    ListItemText,
    withStyles
} from '@material-ui/core';

import momemt from "moment";

import MainLayout from "../../modules/Layout/MainLayout";
import NotFound from '../../modules/NotFound/notFound'
import Utils from "../../resources/Utils";

import classes from './giveaway.module.css'
import { showSnackbar } from "../../components/Snackbar";
// import { renderModal } from "../../components/modal";

// import Login from "../../components/LoginForm"
import { showLogin } from "../../components/modals/Login";

import moment from "moment";
import catalog from "../../reducers/reducerCatalog";
moment.locale('es')

// const Giveaway = require('../../../base/models/Giveaway')(mongoose);


const style = theme => ({
    hLogin: {
        ground: theme.palette.topBar.main,
        color: theme.palette.topBar.text
    }
})

function App(props) {

    const [user, setUser] = useState(null);

    const [ticket, setTicket] = useState('');
    const [amount, setAmount] = useState('');


    const getUser = async () => {
        let usr = await Utils.getCurrentUser();
        setUser(usr)
    }

    useEffect(() => {
        getUser();
    }, []);


    const register = async () => {

        if (props.requiredLogin && user == null) {
            await showLogin();
            return;
        }

        if (ticket.length == 0) {
            showSnackbar({ variant: "error", message: "Ingresa el folio de tu ticket de compra" });
            return;
        }

        try {
            let response = await requestAPI({
                host: Utils.constants.HOST,
                method: 'POST',
                resource: 'giveaways',
                endpoint: '/register-ticket',
                data: {
                    giveawayId: props.path,
                    amount: parseInt(amount),
                    userId: user.id,
                    ticket,
                }
            })

            if (response.data.error != undefined) {
                showSnackbar({ variant: "error", message: response.data.error });
            } else {
                showSnackbar({ variant: "success", message: "Ticket registrado correctamente" });

            }

            setTicket("");
            setAmount("");

        } catch (error) {

            if (error.response.error) {
                showSnackbar({ variant: "error", message: error.response.data.msg })
            }
            else {
                showSnackbar({ variant: "error", message: "Ha ocurrido un error inesperado" });
            }
        }

    }

    const ticketChange = async (e) => setTicket(e.target.value)
    const amountChange = async (e) => setAmount(e.target.value)
    return <>
        <MainLayout
            title={props.giveaway}
            description={props.description}
            url={props.path}
        >
            {
                props.notFound ? <NotFound /> :
                    <>
                        {
                            props.requiredLogin && user == null ?
                                <Grid container alignItems="center" justify="center" direction="row" className={props.classes.hLogin}>
                                    <h3>PARA PARTICIPAR DEBES INICIAR SESIÓN</h3>
                                </Grid> : null
                        }


                        <Container>
                            <Grid container alignItems="center" justify="center" direction="row">
                                <h1 style={{ textAlign: 'center' }}>¡Giveaway {props.giveaway}! </h1>
                            </Grid>

                            <Grid container spacing={2}>

                                <Grid item xs={12} sm={6}>
                                    <img style={{ width: '100%', borderRadius: 25 }} src={props.d.cover.data} />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <h3>
                                        {props.details.description}
                                    </h3>

                                    <Grid item xs={12}>
                                        <List>
                                            <ListItem>
                                                <Chip label="1" color="primary" />
                                                <ListItemText className={classes.listItem}>Haz una compra {props.d.minimumRequired ? `por un minimo de $${props.d.minimumAmount} pesos` : ''}</ListItemText>
                                            </ListItem>
                                            <ListItem>
                                                <Chip label="2" color="primary" />
                                                <ListItemText className={classes.listItem}>Registra tu ticket y participa</ListItemText>
                                            </ListItem>
                                            <ListItem>
                                                <Chip label="3" color="primary" />
                                                <ListItemText className={classes.listItem}>Tienes hasta el {moment(props.d.finishDate).format('D [de] MMMM')} para participar</ListItemText>
                                            </ListItem>
                                        </List>
                                    </Grid>

                                    <Grid item xs={12} className={classes.registerForm}>
                                        <TextField
                                            value={ticket}
                                            onChange={ticketChange}
                                            type="text"
                                            variant="outlined"
                                            label="Folio"
                                            placeholder="Ingresa el folio de tu ticket de compra"
                                            style={{ marginBottom: 5 }}
                                            fullWidth
                                        />

                                        <TextField
                                            value={amount}
                                            onChange={amountChange}
                                            type="number"
                                            variant="outlined"
                                            label="Monto"
                                            placeholder="Ingresa el monto de tu compra"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button variant="contained" color="primary" onClick={register}>
                                            Registrar
                                        </Button>
                                    </Grid>
                                </Grid>

                                <Grid align="center" item xs={12} className={classes.termsOfService}>
                                    <Typography className={classes.terms} >{props.d.termsOfService}</Typography>
                                </Grid>
                            </Grid>

                        </Container>
                    </>
            }

        </MainLayout>
    </>
}

export async function getServerSideProps({ params }) {
    console.log("[name]");
    //let giveaway = await Giveaway.findOne({ path: params.name, "instances.uuid": Utils.constants.CONFIG_ENV.UUID })
    let response = await Axios({
        method: 'GET',
        url: `${Utils.constants.HOST}/api/giveaways/${params.name}/giveaway-uuid/${Utils.constants.CONFIG_ENV.UUID}`
    })

    if (response === null || response.data.giveaway === undefined) {
        return {

            props: {
                notFound: true,
                giveaway: 'Sitio no encontrado',
                description: 'Sitio no encontrado',
                path: params.name
            }
        }
    }

    return {
        props: {
            giveaway: response.data.giveaway.name,
            details: {
                description: response.data.giveaway.description
            },
            path: response.data.giveaway.path,
            requiredLogin: response.data.giveaway.requiredLogin,
            d: JSON.parse(JSON.stringify(response.data.giveaway))
        }
    }
}
export default withStyles(style)(App);
