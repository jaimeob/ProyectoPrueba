import React, { useState, useEffect } from 'react'

// Components
import Title from '../components/Title'
import Head from '../components/Head'
import { renderModal } from '../components/modal/Index'
import Crear from '../components/modals/giveaway/Crear'
import IndexInfo from '../components/modals/giveaway/giveawayInfo/IndexInfo'
import Editar from '../components/modals/giveaway/Editar'

// Utils
import Utils from '../resources/Utils'
import Empty from '../components/Empty'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import EditIcon from '@material-ui/icons/Edit'
import VisibilityIcon from '@material-ui/icons/Visibility'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import moment from 'moment'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({
    table: {
        minWidth: 650,
    },
    tableContainer: {
        paddingTop: 0,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
    },
    margin: {
        margin: '10px',
    },
})

const TableCRUDgiveaway = (props) => {

    moment.locale('es')

    const { classes } = props

    const [allGiveaways, setAllGiveaways] = useState([])

    const crearModal = (getGiveaways) => {
        renderModal(Crear, { getGiveaways })
    }

    const createModalUpdate = (id) => {
        renderModal(Editar, { id, getGiveaways })
    }

    const openModalInfoGiveaway = (id) => {
        renderModal(IndexInfo, { id, getGiveaways })
    }

    const searchGiveaways = async (value) => {

        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'GET',
            resource: 'giveaways',
            endpoint: '/all',

        })


        if (response.length > 0) {
            setAllGiveaways(response)
        }
    }

    const getGiveaways = async () => {

        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'GET',
            resource: 'giveaways',
            endpoint: '/all',

        })

        console.log(response.data, "response")

        setAllGiveaways(response.data.map(g => ({
            ...g,
            createdAt: moment(g.createdAt).format('DD-MM-yyyy hh:mm a'),
            startDate: moment(g.startDate).format('DD-MM-yyyy hh:mm a'),
            finishDate: moment(g.finishDate).format('DD-MM-yyyy hh:mm a'),

        })))
    }

    useEffect(() => {
        getGiveaways()
    }, [])

    Utils.scrollTop()

    if (allGiveaways != null && allGiveaways.length != 0) {
        return (
            <div>
                <Grid container>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={6}>
                                <Title
                                    title="Giveaways"
                                    description="Listado de giveaways."
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Button style={{ display: 'block', marginLeft: 'auto', marginBottom: '10px' }} classame={classes.button} onClick={() => crearModal(getGiveaways)} variant="contained" color="primary" >
                                    Crear giveaway
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} style={{ marginTop: 8, marginBottom: 8 }}>
                        <Head
                            searchPlaceholder="Buscar giveaway por nombre."
                            onchange={(e) => searchGiveaways(e.target.value)}
                            searchQuery={(data) => { searchGiveaways(data) }}
                        />

                    </Grid>
                </Grid>

                <Paper className={classes.tableContainer}>
                    <Table className={classes.table} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '13px', width: '20%' }}>Nombre</TableCell>
                                <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '13px', width: '25%' }}>Descripción</TableCell>
                                <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '13px', width: '10%' }}>Fecha creación</TableCell>
                                <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '13px', width: '10%' }}>Fecha inicio</TableCell>
                                <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '13px', width: '10%' }}>Fecha limite</TableCell>
                                <TableCell align="center" style={{ padding: '15px 4px 15px 15px', fontFamily: 'Roboto', fontSize: '13px', width: '5%' }}>Estatus</TableCell>
                                <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '13px', width: '5%' }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allGiveaways.map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell component="th" scope="row" align="left" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '13px', width: '10%' }}>
                                        {row.name}
                                    </TableCell>
                                    <TableCell align="left" style={{ padding: '4px 4px 4px 24px', fontFamily: 'Roboto', fontSize: '12x', width: '40%' }}>{row.description}</TableCell>
                                    <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '12px', width: '5%' }}>{row.createdAt}</TableCell>
                                    <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '12px', width: '5%' }}>{row.startDate}</TableCell>
                                    <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '12px', width: '5%' }}>{row.finishDate}</TableCell>
                                    <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '13px', width: '10%' }}>{Utils.ConstantsGiveaway.Status[row.status]}</TableCell>
                                    <TableCell align="center" style={{ padding: '4px 4px 4px 4px', fontFamily: 'Roboto', fontSize: '13px', width: '10%' }}>
                                        <div style={{ width: 100 }} >
                                            <IconButton onClick={() => createModalUpdate(row._id)} style={{ padding: '4px 4px 4px 4px' }}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => openModalInfoGiveaway(row._id)} style={{ padding: '4px 4px 4px 4px' }}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </Paper>
            </div>
        )
    } else {
        return (
            <React.Fragment>
                <Button style={{ right: "9px" }} className={classes.button} onClick={() => crearModal(getGiveaways)} variant="contained" color="primary" >
                    Crear giveaway
                </Button>
                <Empty
                    title="¡Sin giveaways!"
                    description="No hay giveaways para mostrar."

                />
            </React.Fragment>

            //<NotFound />
        )
    }

}

export default withStyles(styles)(TableCRUDgiveaway)
