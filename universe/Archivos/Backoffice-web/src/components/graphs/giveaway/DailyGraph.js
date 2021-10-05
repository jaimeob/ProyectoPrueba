import React from 'react';
import { Bar } from 'react-chartjs-2';
import classes from '../giveaway/dailyGraph.module.css'

const VerticalBar = ({label,values}) => {

  const data = {
    labels: label,
    datasets: [
      {
        label: 'Registro de dinero por día',
        data: values,
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
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
        <h1 className='title'>Dinero</h1>
      </div>
    <Bar data={data} options={options} width={400} height={120} />
  </ React.Fragment>
  )
};

export default VerticalBar;