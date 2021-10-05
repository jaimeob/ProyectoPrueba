import { useState, useEffect } from 'react'
import Router from "next/router"
import { Dialog, DialogContent, DialogContentText, DialogTitle, Button, Grid, Typography, TextField } from "@material-ui/core"
import { renderModal } from "../../resources/modals/index"
import { requestAPI } from '../../api/CRUD'
import Utils from '../../resources/Utils'
import Axios from 'axios'
import { showSnackbar } from '../Snackbar'
import Empty from '../Empty'


function ModalTracking(props) {
    const [modalOpen, setModalOpen] = useState(true)
    const [folio, setFolio] = useState('')
    const [openLoading, setLoading] = useState(false)

    const closeModal = () => {
        if (props.exit) props.exit()
        setModalOpen(false)
    }

    const fetchApi = async () => {
        let response = await Axios({
            method: 'POST',
            url: Utils.constants.CONFIG_ENV.HOST + '/api/orders/verify-order',
            data: { folio: folio }
        })

        setLoading(true)

        if (folio === '' || folio === null || folio === undefined) {
            showSnackbar({ variant: "error", message: "Es necesario escribir un folio" })
            setLoading(false)
        } else {

            if (response.data !== null && response.data !== undefined && response.data.valid) {
                window.location.href = `/tracking/${response.data.folio}`
                setFolio('')
                setLoading(true)
            } else {
                showSnackbar({ variant: "error", message: "Este folio no es valido" })
                setLoading(false)
            }
        }
    }

    const handleChangeValues = async (e) => {
        setFolio(e.target.value)
    }

    useEffect(() => {
        // did mount
    }, [])
    return <Dialog open={modalOpen} onClose={closeModal}
        onKeyUp={(e) => {
            const ENTER = 13;
            if (e.keyCode === ENTER) {
                fetchApi()
            }
        }}>

        <DialogTitle id="form-dialog-title" style={{ textAlign: "center", fontSize: 24, fontFamily: 'IBMPlexSans' }}>Rastrear pedido</DialogTitle>
        <DialogContent style={{ textAlign: "center", }} >
            <DialogContentText>
                {(!openLoading ?
                    <Grid container>
                        <Grid><br /></Grid>
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} >
                            <Typography variant="body1" style={{ fontSize: 16 }}>
                                Ingresa el folio de tu pedido para brindarte información de la entrega.
                            </Typography>
                            <br />
                            <TextField
                                type="text"
                                value={folio}
                                variant="outlined"
                                onChange={handleChangeValues}
                                fullWidth
                                placeholder="Folio..."
                                autoFocus={true}
                                size="small"

                            />
                            <br />
                            <br />
                            <Grid container direction='row' spacing={2}>
                                <Grid item xl={6} lg={6} md={6} sm={6} xs={6} >
                                    <Button variant="outlined" color="primary" onClick={closeModal} fullWidth>
                                        Cancelar
                                    </Button>
                                </Grid>
                                <Grid item xl={6} lg={6} md={6} sm={6} xs={6} >
                                    <Button variant="contained" type="submit" color="primary" onClick={fetchApi}  fullWidth>
                                        Rastrear
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid> :

                    <Grid container  >
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} >
                            <Empty
                                isLoading={true}
                                title="Cargando..."
                                description="Espera un momento por favor."
                            />
                        </Grid>
                    </Grid>
                )}


            </DialogContentText>
        </DialogContent>
    </Dialog>

}
const showTracking = () => { renderModal(ModalTracking, {}) }
export default (showTracking)