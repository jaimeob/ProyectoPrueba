import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'

//Material-UI
import {
    Dialog,
    DialogContent,
    Button,
    DialogActions,
    Slide,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
    ListSubheader,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
    AppBar,
    Toolbar,
    IconButton,
    Typography
} from '@material-ui/core'

import {
    ExpandLess,
    ExpandMore,
    Visibility
} from '@material-ui/icons';
import PersonIcon from '@material-ui/icons/Person';
import CloseIcon from '@material-ui/icons/Close';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import VisibilityIcon from '@material-ui/icons/Visibility';
//Components
import DailyInfoCalzzapato from '../../../graphs/giveaway/calzzapato/DailyInfoCalzzapato';
import WebAndPhysicalPurchases from '../../../graphs/giveaway/WebAndPhysicalPurchases';
import { renderModal } from '../../../modal/Index';

import classes from './giveaway.module.css';
import moment from 'moment';
import RandomRevealModal from '../RandomReveal';
import WinnersModal from '../winnersModal';
import { requestAPI } from '../../../../api/CRUD'
import Utils from '../../../../resources/Utils'


// import backoffice from '../../../../resources/api'

// const Giveaway = require("@base/models/Giveaway");
const dataInstances = require('../../giveaway/instances.json');

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

const IndexInfo = (props) => {

    const { id } = props;
    const [modalOpen, setModalOpen] = useState(true);
    const [participants, setParticipants] = useState([]);
    const [giveawayData, setGiveawayData] = useState({});
    const [infoGiveaway, setInfoGiveaway] = useState([]);
    const [instances, setInstances] = useState([]);

    const handleClick = (participant) => {
        const part = Array.from(participants);
        const p = part.find(p => p === participant)

        p.isOpen = !p.isOpen;

        setParticipants(part)
    }

    const closeModal = () => {
        setModalOpen(false);
        props.exit();

        if (props && props.getGiveaways) props.getGiveaways();
    }

    const getInfoGiveaway = async () => {

        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'GET',
            resource: `giveaways/${id}`,
        })

        setInfoGiveaway(response.data)

        setInstances(instancesToShow => {
            const tmpInstances = Array.from(instancesToShow);
            response.data.instances.forEach(ins => {
                tmpInstances.find(tmp => tmp.uuid == ins.uuid).showSucursal = true;
            })
            return tmpInstances
        })
    }

    const getTotals = async (id) => {
        // let { data: giveawayTotal } = await backoffice.get(`giveaway/getGiveawayTotals/${id}`);
        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'GET',
            resource: `giveaways/getGiveawayTotals/${id}`,
        })
        setGiveawayData(response.data.totals)
    }

    const getUsersGiveaway = async () => {
        //let { data: mParticipantes } = await backoffice.get(`giveaway/getTicketsUser/${id}`)
        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'GET',
            resource: `giveaways/ticket-user/${id}`,
        })

        
        if (response.data.length > 0) {
            const nParticipantes = response.data.map(part => ({ isOpen: false, ...part }))
            setParticipants(nParticipantes)
        }


    }

    useEffect(() => {
        setInstances(dataInstances.map(i => ({ ...i, showSucursal: false })))
        getTotals(id);
        getUsersGiveaway();
        getInfoGiveaway();
    }, [])

    const createModalSort = () => {

        renderModal(RandomRevealModal, { id, onFinishSort: getInfoGiveaway })
    }

    const seeWinners = () => {
        renderModal(WinnersModal, { infoGiveaway })
    }

    const numberWithCommas = (x) => {
        x = x.toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x))
            x = x.replace(pattern, "$1,$2");
        return x;
    }

    //Dar formato de miles
    const { totalAmount } = giveawayData;
    const newNum = Number(totalAmount).toFixed(2)
    const formateado = numberWithCommas(newNum)

    const { totalGiveaway } = giveawayData;
    const total = Number(totalGiveaway).toFixed(2)
    const totalFormateado = numberWithCommas(total)

    //Obtener promedio de tickets
    const { totalTickets, totalParticipants } = giveawayData;
    // const avgTickets = Number(giveawayData.totalTickets / giveawayData.totalParticipants).toFixed()

    //Obtener promedio de dinero por ticket
    const avgPurchasePerTicket = Number(totalAmount / totalTickets).toFixed(2);
    return (
        <Dialog open={modalOpen} onClose={closeModal} fullScreen TransitionComponent={Transition}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton color="inherit" onClick={closeModal} aria-label="Close">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit" >
                        Información de giveaway
                    </Typography>
                    <div className={classes.right}>

                        {
                            giveawayData.totalParticipants > 0 ?
                                infoGiveaway.status == Utils.constants.status.CLOSED ?
                                    <IconButton color="inherit" onClick={createModalSort} aria-label="sort">
                                        <PlayCircleOutlineIcon style={{ fontSize: 40 }} />
                                    </IconButton> : null
                                :
                                <span>
                                    No Hay participantes
                                </span>
                        }
                        {
                            infoGiveaway.winner != undefined ?

                                <IconButton color="inherit" onClick={seeWinners} aria-label="ver">
                                    <VisibilityIcon style={{ fontSize: 40 }} />
                                </IconButton>
                                :
                                null
                        }

                    </div>
                </Toolbar>
            </AppBar>

            <Grid className={classes.container} >
                <DialogContent className={classes.dashboard}>
                    <TableRow>
                        <TableCell className={classes.tableRow}>Participantes totales</TableCell>
                        <TableCell className={classes.tableRowRight}>{giveawayData.totalParticipants}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableRow}>Monto total</TableCell>
                        <TableCell className={classes.tableRowRight}>{`$ ${totalFormateado}`}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell className={classes.tableRow}>Ticket promedio</TableCell>
                        {isNaN(giveawayData.avgTickets) == false ?
                            <TableCell className={classes.tableRow}>
                                {`${(giveawayData.avgTickets).toFixed(0)} / $ ${numberWithCommas(formateado)}`}
                            </TableCell>
                            :
                            <TableCell className={classes.tableRow}>$ 0.00</TableCell>
                        }
                    </TableRow>

                    <List
                        style={{maxHeight: '350px'}}
                        component="nav"
                        subheader={<ListSubheader component="div">Todos los participantes</ListSubheader>}
                    >

                        {
                            participants.map((participant) => (
                                <React.Fragment key={participant.idUser}>
                                    <ListItem button onClick={() => handleClick(participant)} className={classes.containUser}>
                                        <ListItemIcon>
                                            <PersonIcon />
                                        </ListItemIcon>
                                        <ListItemText inset><p className={classes.txtUsers}>{participant.name}</p></ListItemText>
                                        {participant.isOpen ? <ExpandLess /> : <ExpandMore />}
                                    </ListItem>
                                    <Collapse in={participant.isOpen} timeout="auto" unmountOnExit>
                                        <Table>
                                            <TableHead className={classes.tableRow}>
                                                <TableRow>
                                                    {/* <TableCell className={classes.tableRow}>#</TableCell> */}
                                                    <TableCell className={classes.tableRow}>Sucursal</TableCell>
                                                    <TableCell className={classes.tableRow}>Folio</TableCell>
                                                    <TableCell className={classes.tableRow}>Fecha compra</TableCell>
                                                    <TableCell className={classes.tableRowRight}>Monto</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {
                                                    participant.tickets.map((ticket, idx) => (
                                                        <TableRow key={idx} className={classes.tableRow}>
                                                            <TableCell className={classes.tableRow}>{ticket.branch}</TableCell>
                                                            <TableCell className={classes.tableRowLarge}>{ticket.ticketid}</TableCell>
                                                            <TableCell className={classes.tableRow}>{moment(ticket.purchaseDate).format('DD-MM-YYYY')}</TableCell>
                                                            <TableCell className={classes.tableRowRight}>{`$${numberWithCommas(ticket.amount)}`}</TableCell>
                                                        </TableRow>
                                                    ))
                                                }
                                            </TableBody>
                                        </Table>
                                    </Collapse>
                                </React.Fragment>
                            ))
                        }

                        {/* </TablePagination> */}
                        {/* </DataGrid> */}
                    </List>
                    <DialogActions>
                        <Button variant="contained" color="secondary" onClick={closeModal}>Cerrar</Button>
                    </DialogActions>
                </DialogContent>
                <div className={classes.containerGraphs}>
                    {
                        instances.map(instance => (
                            (instance.showSucursal) ?
                                <div key={instance.uuid} className={classes.contain}>
                                    <h1 className={classes.title}>{instance.alias}</h1>
                                    <div className={classes.graphs100}>
                                        <DailyInfoCalzzapato id={id} uuid={instance.uuid} />
                                    </div>

                                    {/* <div className={classes.graphs50}>
                                        <WebAndPhysicalPurchases />
                                    </div>  */}
                                </div> : <div></div>
                        ))
                    }
                </div>
            </Grid>
        </Dialog>
    )
}

export default IndexInfo;
