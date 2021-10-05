import React, { Component } from 'react'
//React-Icons
import { IoIosCloseCircle } from 'react-icons/io'

//Material UI
import { Grid, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'

const styles = {
  alingIcon: {
    color: red[500],
    fontSize: 188,
    marginTop: 222
  },
  colorText: {
    color: red[500],
    fontSize: 22
  },
  sizetext: {
    fontSize: 24
  }
}

class FailedPage extends Component {
  render() {
    const classes = (this.props.classes)
    return (
      <div>
        <Grid className={classes.alingIcon} align='center'>
          <IoIosCloseCircle />
        </Grid>
        <Typography variant='h2' align='center'>¡Algo salió mal!</Typography>
        <br />
        <br />
        <br />
        <Typography variant='body1' align='center' className={classes.sizetext}>
          Tu compra no se pudo finalizar con éxito, puedes verificar que:
                </Typography>
        <br />
        <Typography
          variant='body1'
          align='center'
          className={classes.colorText} >
          <p>Cuentes con el crédito suficiente.</p>
          <p>Tu banco te permita usar tu tarjeta para realizar compras por internet.</p>
          <p>Los datos ingresados estén correctos.</p>
        </Typography>
        <br />
        <Typography variant='body1' align='center' className={classes.sizetext}>
          Puedes verificar esas opciones o contactar a servicio al cliente al: <br />
          <strong>01 800 927 2867 </strong>
        </Typography>
      </div>
    )
  }
}

export default withStyles(styles)(FailedPage)