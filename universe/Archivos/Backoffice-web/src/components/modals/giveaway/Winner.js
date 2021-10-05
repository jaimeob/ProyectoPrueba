import React, { useState, useEffect } from 'react';
import {
    Dialog,
    Button,
    DialogActions
} from '@material-ui/core';

import Modal from '@material-ui/core/Modal';
import classesWheel from './giveawayInfo/giveaway.module.css'
import classesWin from './winners.module.css'

import { RandomReveal } from 'react-random-reveal'

import backoffice from '../../../resources/api';

const Winner = (props) => {
    const searchId = props.id;

    const [modalOpen, setModalOpen] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [shouldRepeat, setshouldRepeat] = useState(false)
    const [winners, setWinners] = useState([]);
    const [sorted, setSorted] = useState(false)

    const startSort = () => {
        setIsPlaying(true)
    }

    const getWinners = async () => {
        const { data: winnersData } = await backoffice.post(`/giveaway/sortTicket/${searchId}`);
        setWinners(winnersData)
    }

    useEffect(() => {
        getWinners();
    }, [])

    const closeModal = () => {
        setModalOpen(false);
        props.exit();
    }

    return (
        <Modal open={modalOpen} onClose={closeModal} scroll="body" maxWidth="md" fullWidth={true} >
            <Dialog open={modalOpen} onClose={closeModal} scroll="body" maxWidth="md" fullWidth={true}  >
                <div style={{ display: 'flex' }}>
                    <h2 style={{ textAlign: 'center' }}>Mi titulo</h2>
                    <div className={classesWin.containWinners}>
                        <RandomReveal
                            isPlaying
                            duration={3}
                            revealDuration={0.7}
                            characterSet={winners}
                            onComplete={() => [shouldRepeat, 3000]}
                        />
                        <Button variant="contained" color="primary" className={classesWin.sortButton} onClick={startSort}>
                            Sortear
                        </Button>
                    </div>

                    <div className={classesWheel.containWinners}>
                        {(winners) ?
                            <div className={classesWheel.containWheel}>
                                <div >{`Los ganadores son: ${winners.userId}`}</div>
                                <div >{`El ticket ganador es: ${winners.giveawayId}`}</div>
                            </div> : <div></div>}
                    </div>

                    <DialogActions>
                        <Button variant="contained" color="secondary" className={classesWheel.buttonOpt} onClick={closeModal}>Cerrar</Button>
                        {(sorted) ?
                            <Button variant="contained" color="primary" className={classesWheel.buttonOpt} onClick={closeModal}>
                                Continuar
                            </Button> :
                            <div></div>
                        }
                    </DialogActions>
                </div>
            </Dialog>
        </Modal>
    )
}

export default Winner