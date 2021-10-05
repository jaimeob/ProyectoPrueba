import React, { Component } from 'react'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import Link from 'next/link'
import { Grid, Typography } from '@material-ui/core'

const useStyles = theme => ({
  title: {
    fontSize: 46,
    marginTop: 32,
    fontWeight: 500
  },
  subTitle: {
    fontSize: 18,
    marginTop: 0,
    padding: 0,
    'text-align': 'center',
    marginTop: 16,
    marginBottom: 24
  },
  description: {
    fontSize: 18,
    margin: '0 auto',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 42,
    fontWeight: 200
  },
  textitem: {
    margin: 0,
    color: 'rgba(0, 0, 0, 0.87)'
  }
});


class NotFound extends Component {
  render() {
    const { classes } = this.props
    return (
      <>
        <Grid container alignItems='center' justify='center' direction='column' style={{ textAlign: 'center' }}>
          <Grid item>
            <Typography className={classes.title} variant="body1">¡No hay resultados!</Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems='center' justify='center' direction='column'>
              <Grid xs={12}>
                <Typography className={classes.subTitle} variant="body2">Lo sentimos, no encontramos lo que estabas buscando. Intenta una nueva búsqueda o usa los enlaces de abajo.</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid>
            <Grid container>
              <Grid item xl={2} lg={2} md={4} sm={4} xs={4} style={{ padding: 28 }}>
                <Link href='/'>
                  <a>
                    <Grid container alignItems='center' justify='center' direction='column'>
                      <Grid item>
                        <img src='../../calzzapatoround.svg' />
                      </Grid>
                      <Grid item>
                        <h4 className={classes.textitem}>Inicio</h4>
                      </Grid>
                    </Grid>
                  </a>
                </Link>
              </Grid>
              <Grid item xl={2} lg={2} md={4} sm={4} xs={4} style={{ padding: 28 }}>
                <Link href='/todos'>
                  <a>
                    <Grid container alignItems='center' justify='center' direction='column'>
                      <Grid item>
                        <img src='../../explorer.svg' />
                      </Grid>
                      <Grid item>
                        <h4 className={classes.textitem}>Explorar</h4>
                      </Grid>
                    </Grid>
                  </a>
                </Link>
              </Grid>
              <Grid item xl={2} lg={2} md={4} sm={4} xs={4} style={{ padding: 28 }}>
                <Link href='/todos'>
                  <a>
                    <Grid container alignItems='center' justify='center' direction='column'>
                      <Grid item>
                        <img src='../../offers.svg' />
                      </Grid>
                      <Grid item>
                        <h4 className={classes.textitem}>Ofertas</h4>
                      </Grid>
                    </Grid>
                  </a>
                </Link>
              </Grid>
              <Grid item xl={2} lg={2} md={4} sm={4} xs={4} style={{ padding: 28 }}>
                <Link href='/tiendas'>
                  <a>
                    <Grid container alignItems='center' justify='center' direction='column'>
                      <Grid item>
                        <img src='../../stores.svg' />
                      </Grid>
                      <Grid item>
                        <h4 className={classes.textitem}>Tiendas</h4>
                      </Grid>
                    </Grid>
                  </a>
                </Link>
              </Grid>
              <Grid item xl={2} lg={2} md={4} sm={4} xs={4} style={{ padding: 28 }}>
                <Link href='/preguntas'>
                  <a>
                    <Grid container alignItems='center' justify='center' direction='column'>
                      <Grid item>
                        <img src='../../faq.svg' />
                      </Grid>
                      <Grid item>
                        <h4 className={classes.textitem}>Preguntas</h4>
                        <h4 className={classes.textitem}>frecuentes</h4>
                      </Grid>
                    </Grid>
                  </a>
                </Link>
              </Grid>
              <Grid item xl={2} lg={2} md={4} sm={4} xs={4} style={{ padding: 28 }}>
                <Link href='/soporte'>
                  <a>
                    <Grid container alignItems='center' justify='center' direction='column'>
                      <Grid item>
                        <img src='../../support.svg' />
                      </Grid>
                      <Grid item>
                        <h4 className={classes.textitem}>Atención a</h4>
                        <h4 className={classes.textitem}>clientes</h4>
                      </Grid>
                    </Grid>
                  </a>
                </Link>
              </Grid>
            </Grid>
          </Grid>
          <Grid container>
          <Typography className={classes.description} variant="body2">Llámanos al <strong><a href="tel:8009272867">800 927 2867</a></strong> si todavía no encuentras lo que estás buscando.</Typography>
          </Grid>
        </Grid>
      </>
    )
  }
}

export default compose(
  withStyles(useStyles)
)(NotFound)
