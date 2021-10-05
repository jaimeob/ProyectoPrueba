import React, { useState, useEffect } from "react";
import Router from 'next/router'

import {
    Dialog,
    DialogContent,
    Grid,
    Button,
    withStyles
} from "@material-ui/core";

import { renderModal } from "../modal";

const style = theme => ({
    loginButton: {
        marginBottom: 15
    }
})

function Login(props) {

    const { classes } = props;

    const [open, setOpen] = useState(true);

    const closeModal = () => {
        setOpen(false);
    }

    const login = () => {
        Router.push('/ingreso');
        closeModal();
    }

    return <Dialog open={open} maxWidth="md" fullWidth={true}>
        <DialogContent>
            <Grid container alignItems="center" justify="center" direction="column" style={{ padding: 20 }}>

                <h4>Para poder participar es necesario ingresar con tu usuario Calzzapato ®</h4>

                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={login}
                        className={classes.loginButton}
                    >
                        INGRESAR
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={closeModal}
                        className={classes.loginButton}
                    >
                        CANCELAR
                    </Button>
                </Grid>
            </Grid>
        </DialogContent>

    </Dialog >
}
const LoginForm = withStyles(style)(Login);

export const showLogin = () => new Promise(async (resolve, reject) => {

    const onLogin = (result) => {
        if (result) resolve();
        else reject();
    }

    renderModal(LoginForm, { onLogin })
});
