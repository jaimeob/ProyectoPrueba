import React from 'react';
import { Pie } from 'react-chartjs-2';
import classes from '../giveaway/dailyGraph.module.css'

const data = {
  labels: ['1500 - 2250', '2250 - 3000', '3000 - 4500'],
  datasets: [
    {
      label: '',
      data: [30,15,55],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const PurchaseRange = () => (
  <>
    <div className='header'>
      <h1 className='title'>Rangos de compra</h1>
    </div>
    <Pie data={data} className={classes.pie}/>
  </>
);

export default PurchaseRange;