import React, { useState, useEffect } from 'react';
import VerticalBar from '../DailyGraph';
import DailyGraphTickets from '../DailyGraphTickets';
import moment from 'moment';
import { requestAPI } from '../../../../api/CRUD'
import Utils from '../../../../resources/Utils'

const DailyInfoCalzzapato = ({ id, uuid }) => {

    moment.locale('es');

    const [labels, setLabels] = useState([]);
    const [valuesGraphic, setValuesGraphic] = useState([]);
    const [quantityTickets, setQuantityTickets] = useState([]);

    const settingLabels = async () => {
        const ammounts = {}
        //const { data: newLabels } = await backoffice.get(`/giveaway/${id}/getTicketsByUuid/${uuid}`)
        let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'GET',
            resource: `/giveaways/${id}/tickets-uuid/${uuid}`,

        })

        console.log(response,"response.data.");

        if (response.data !== null) {
            let tickets = response.data.tickets

            tickets.map(ticket => {
                ammounts[ticket.createdAt] = ammounts[ticket.createdAt] ? ammounts[ticket.createdAt] + ticket.amount : ticket.amount
            })
    
            const dates = Object.keys(ammounts)
            setLabels(dates)
    
            const ammountArray = Object.values(ammounts)
            setValuesGraphic(ammountArray)
    
            const ammountTickets = {}
    
            tickets.map(ticket => {
                ammountTickets[ticket.createdAt] = ammountTickets[ticket.createdAt] ? ammountTickets[ticket.createdAt] + 1 : +1
            })
    
            const ammountTicketsArray = Object.values(ammountTickets)
    
            setQuantityTickets(ammountTicketsArray)
        }

       
    }

    useEffect(() => {
        settingLabels();
    }, [])

    return (
        <>
            <VerticalBar label={labels} values={valuesGraphic}/>
            <DailyGraphTickets label={labels} values={quantityTickets}/>
        </>
    )
}

export default DailyInfoCalzzapato