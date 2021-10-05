import React, { useState, useEffect } from 'react';
import VerticalBar from '../DailyGraph';
import DailyGraphTickets from '../DailyGraphTickets';

let ticketsGiveaway = require('./giveawayTickets.json');

const DailyInfoCalzzapato = (props) => {

    //const {_id} = props;

    const [labels, setLabels] = useState([]);
    const [ticketsInfo, setTicketsInfo] = useState([]);

    const settingLabels = () => {
        let newLabels = Array.from(ticketsGiveaway)
        let dates = newLabels.map(date => date.dateOfRegister)
        let labelsToGraph = dates.reduce((date, currentValue) => (
            date.includes(currentValue) ? date : [...date, currentValue]
        ), [])
        setLabels(labelsToGraph)
    }

    const settingAmountOfDay = () => {

    }


    useEffect(() => {
        settingLabels();
        settingAmountOfDay();
    }, [])

    return (
        <>
            <VerticalBar label={labels} />
            <DailyGraphTickets label={labels} />
        </>
    )
}

export default DailyInfoCalzzapato
