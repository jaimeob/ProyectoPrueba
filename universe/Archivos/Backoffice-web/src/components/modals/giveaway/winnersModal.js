import React, { useState } from "react";
import Fade from "react-reveal/Fade";
import {
    Dialog,
    Button,
    DialogContent,
    DialogActions
} from '@material-ui/core';

import Modal from '@material-ui/core/Modal';
import classes from './randomReveal.module.css';



const RandomRevealModal = (props) => {
    console.log(props.infoGiveaway,"PROPS ----");
    const [modalOpen, setModalOpen] = useState(true);
    const [isCloseDisabled, setCloseDisabled] = useState(true);
    const [participants, setParticipants] = useState([]); // Participants to display in roulette
    const [winners, setWinners] = useState([]); // Winners 
    const [winnerName, setWinnerName] = useState('Ruleta de la suerte');

    console.log(modalOpen,"modalOpen ----");


    const closeModal = () => {
        setModalOpen(false);
        // props.exit();

        // if (props && props.onFinishSort) props.onFinishSort();
    }


    return (
        <>

            <Modal open={modalOpen}>
                <Dialog open={modalOpen} scroll="body" maxWidth="md" fullWidth={true} >
                    <DialogContent>

                        <div className={classes.contain} >

                            <h1>Ganadores</h1>
                            <h2>Ganadores</h2>
                            <Fade left cascade>
                                 <div>
                                    {
                                        props.infoGiveaway.winner.map((winner, idx) => <div key={idx}>
                                            <div className={classes.winnerName}>{winner.name}</div>
                                        </div>)
                                    }
                                </div> 
                            </Fade>

                        </div>

                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={closeModal}
                        >
                            Salir
                        </Button>
                    </DialogActions>

                </Dialog>
            </Modal>
        </>
    );
}

export default RandomRevealModal;
