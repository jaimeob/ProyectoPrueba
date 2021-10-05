import React from 'react';
import { Bar } from 'react-chartjs-2';
import classes from '../giveaway/dailyGraph.module.css'

const DailyGraphTickets = ({label,values}) => {
    
    const data = {
        labels: label,
        datasets: [
            {
                label: 'Registro de tickets por día',
                data: values,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                }, { maintainAspectRatio: false }
            ],
        },
        
    };

    return (
        <React.Fragment>
            <div className='header'>
                <h1 className='title'>Tickets</h1>
            </div>
            <Bar data={data} options={options} width={400} height={120}/>
        </React.Fragment>
    )
};

export default DailyGraphTickets;