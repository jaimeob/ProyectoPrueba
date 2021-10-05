import React, { useState, useEffect, useRef } from "react";
import Fade from "react-reveal/Fade";
import {
    Dialog,
    Button,
    Grid,
    DialogContent,
    DialogActions
} from '@material-ui/core';

import Modal from '@material-ui/core/Modal';
import classes from './randomReveal.module.css';
import { requestAPI } from '../../../api/CRUD'
import Utils from "../../../resources/Utils";



import Confetti from "react-confetti"

const RandomRevealModal = (props) => {
    const searchId = props.id;


    const [modalOpen, setModalOpen] = useState(true);
    const [isCloseDisabled, setCloseDisabled] = useState(true);

    const canvasRef = useRef();

    const [confettiRun, setConfettiRun] = useState(false);
    const [isSortDisabled, setSortDisabled] = useState(true);

    const [currentSort, setCurrentSort] = useState(0); // 
    const [totalSorts, setTotalSorts] = useState(0);

    const [participants, setParticipants] = useState([]); // Participants to display in roulette
    const [winners, setWinners] = useState([]); // Winners 
    const [sorted, setSorted] = useState([]); // Add winner when sort end

    const [winnerName, setWinnerName] = useState('Ruleta de la suerte');


    const loadGiveaway = async () => {
        //const { data: sortResult } = await backoffice.post(`/giveaway/sortTicket/${searchId}`);
        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'POST',
            resource: `/giveaways/sort-ticket/${searchId}`,
            //endpoint: '/all',

        })


        let sortArray = response.data.giveaway.winner

        let sortResult = sortArray.filter(function (el) {
            return el != null;
        });

        setWinners(sortResult.map(r => r.name));
        setTotalSorts(sortResult.length);

        setSortDisabled(false);

        //const { data: allParticipants } = await backoffice.get(`/giveaway/getTicketsUser/${searchId}`)
        // let response = await requestAPI({
        //     host: Utils.constants.HOST,
        //     method: 'GET',
        //     resource: `/giveaways/ticket-user/${searchId}`,
        //     //endpoint: '/all',

        //   })

        // setParticipants(allParticipants.map(p => p.name))
    }


    useEffect(() => {
        canvasRef.current.style.zIndex = 100000;
        loadGiveaway();

    }, []);


    const onReveal = (name) => {
        setConfettiRun(true);

        const tmpSorted = Array.from(sorted);
        tmpSorted.push(name);
        setSorted(tmpSorted)
    }

    const randomize = (name, props) => {
        const timeout = props.timeout || 2000;

        let randomInterval = setInterval(() => {
            let r = Math.floor(Math.random() * participants.length)
            setWinnerName(participants[r])

        }, 50)

        setTimeout(() => {
            clearInterval(randomInterval)
            setWinnerName(name);

            if (props && props.onReveal) props.onReveal(name);

        }, timeout)
    }

    const closeModal = () => {
        setModalOpen(false);
        props.exit();

        if (props && props.onFinishSort) props.onFinishSort();
    }

    const nextSort = () => {
        if (winners.length == 0) return;

        const p = Array.from(winners)
        const name = p.pop();
        setWinners(p);

        setSortDisabled(true);

        randomize(name, { timeout: 2500, onReveal })
    }

    const confettiEnd = (confetti) => {
        setConfettiRun(false);
        confetti.reset();

        if (winners.length > 0) {
            setSortDisabled(false);
            setCurrentSort(c => c + 1);
        }
        else {
            setCloseDisabled(false);
        }
    }

    return (
        <>

            <Confetti
                numberOfPieces={confettiRun ? 3500 : 0}
                recycle={false}
                onConfettiComplete={confettiEnd}
                canvasRef={canvasRef}
            />

            <Modal open={modalOpen}>
                <Dialog open={modalOpen} scroll="body" maxWidth="md" fullWidth={true} >
                    <DialogContent>

                        <div className={classes.contain} >

                            <h2>Giveaway Verano! </h2>

                            <div>
                                <span className={classes.winnerName}> {winnerName}</span>
                            </div>

                            <h4>Ganadores</h4>
                            <Fade left cascade>
                                <div>
                                    {
                                        sorted.map((name, idx) => <div key={idx}>
                                            <div>{name}</div>
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
                            disabled={isSortDisabled}
                            onClick={nextSort}
                        >
                            Sortear {currentSort + 1} / {totalSorts}
                        </Button>

                        <Button
                            color="primary"
                            variant="contained"
                            onClick={closeModal}
                            disabled={isCloseDisabled}
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
