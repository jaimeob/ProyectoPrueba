import React, { Component } from 'react'
import compose from 'recompose/compose'
import { Grid } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'

const useStyles = theme => ({
  title: {
    margin: 0,
    fontSize: 30
  },
  subTitle: {
    color: 'rgba(0, 0, 0, 0.54)',
    margin: 0,
    paddingTop: 16,
    fontSize: 22,
    marginBottom: 24
  },
  descriptiontitle: {
    margin: 0,
    'font-size': '18px',
    'text-align': 'center',
    paddingTop: 14,
    color: '#000000'
  },
  description: {
    'font-size': '14px',
    paddingTop: 12,
    'text-align': 'center',
    color: 'rgba(0, 0, 0, 0.54)',
    margin: 0
  },
  img: {
    paddingTop: 39,
    width: '96px',
    height: '96px'
  },
  card: {
    height: 269,
    margin: '24px 32px',
    'border-radius': '10px'
  },
  cont: {
    margin: '0px 0px 69px 0px'
  }
});
export class supportView extends Component {
  render() {
    const { classes } = this.props
    return (
      <>
        <Grid container direction='column' justify='center' alignItems='center'>
          <Grid item>
            <h1 className={classes.title}>¿Cómo prefieres obtener ayuda?</h1>
          </Grid>
          <Grid item>
            <h2 className={classes.subTitle}>Selecciona la mejor opción para tí.</h2>
          </Grid>
        </Grid>
        <Grid container className={classes.cont} direction='row' justify='center' alignItems='center'>
          <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
            <a href="tel:8009272867">
              <Card className={classes.card}>
                <Grid container direction='column' justify='center' alignItems='center'>
                  <img src='/soporte3.svg' className={classes.img} />
                  <Grid container direction='column' justify='center' alignItems='center'>
                    <Grid item xs={7}>
                      <h5 className={classes.descriptiontitle}>Habla con el soporte técnico de Calzzapato ahora</h5>
                      <h6 className={classes.description}>Llama al <a href="tel:8009272867">800 927 2867</a></h6>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </a>
          </Grid>
          <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
            <a href='https://api.whatsapp.com/send?phone=526677515229&text=Hola,%20me%20gustaria%20hablar%20con%20un%20asesor%20de%20Calzzapato'>
              <Card className={classes.card}>
                <Grid container direction='column' justify='center' alignItems='center'>
                  <img src='/soporte2.svg' className={classes.img} />
                  <h5 className={classes.descriptiontitle}>Whatsapp</h5>
                  <h6 className={classes.description}>Chatea con nosotros por whatsapp</h6>
                </Grid>
              </Card>
            </a>
          </Grid>
          <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
            <a href='https://www.messenger.com/t/calzzapatodigital'>
              <Card className={classes.card}>
                <Grid container direction='column' justify='center' alignItems='center'>
                  <img src='/soporte1.svg' className={classes.img} />
                  <h5 className={classes.descriptiontitle}>Facebook Messenger</h5>
                  <Grid container direction='column' justify='center' alignItems='center'>
                    <Grid item xs={10}>
                      <h6 className={classes.description}>Chatea con nosotros por Facebook Messenger</h6>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </a>
          </Grid>
        </Grid>
      </>
    )
  }
}

export default compose(
  withStyles(useStyles)
)(supportView)
