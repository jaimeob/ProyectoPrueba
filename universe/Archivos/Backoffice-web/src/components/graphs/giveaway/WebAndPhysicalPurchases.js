import React from 'react';
import { Pie } from 'react-chartjs-2';
import classes from '../giveaway/dailyGraph.module.css'
//import backoffice from '../../../../resources/api';

const WebAndPhysicalPurchases = () => {

  /* const infoPie = async () => {
    const { data } = await backoffice.get()
  } */

  const data = {
    labels: ['Compras web', 'Compras en tiendas'],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return(
      <>
        <div className='header'>
          <h1 className='title'>Compra web y física</h1>
        </div>
        <Pie data={data} className={classes.pie} />
      </>
    )
};

export default WebAndPhysicalPurchases;