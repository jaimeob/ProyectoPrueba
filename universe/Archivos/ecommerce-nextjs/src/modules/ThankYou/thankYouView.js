import React, { Component } from 'react'
import moment from 'moment'
import compose from 'recompose/compose'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Button, Link } from '@material-ui/core'

// Utils
import Utils from '../../resources/Utils'
import { dropShoppingCart } from '../../actions/actionShoppingCart'

const styles = theme => ({
  root: {
    width: '100%',
    margin: '0 auto',
    padding: '16px 0px 16px',
    backgroundColor: "#F4F4F4"
  },
  container: {
    width: '45%',
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 16,
    padding: 24,
    [theme.breakpoints.down('md')]: {
      width: '60%'
    },
    [theme.breakpoints.down('sm')]: {
      width: '75%'
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%'
    }
  },
  mainText: {
    textAlign: 'center',
    fontStyle: 'normal',
    fontWeight: 800,
    fontSize: '38px',
  },
  secondaryText: {
    textAlign: 'center',
    marginTop: '8px',
    fontSize: '16px',
  },
  secondaryHeavyText: {
    textAlign: 'center',
    marginTop: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  textError: {
    textAlign: 'center',
    fontSize: '40px',
    color: '#FF6C62',
  },
  button: {
    marginTop: '24px',
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#243B7A',
  },
  buttonFailed: {
    marginTop: '24px',
    fontSize: '14px',
    fontWeight: 'normal',
    align: 'center'
  },
  loading: {
    textAlign: "center",
  }
})

class ThanYouView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      uuidCAPIFacebook: null
    }
  }

  componentWillMount() {
    let uuidActual = this.props.app.data.uuid
    if (uuidActual !== null) {
      this.setState({
        uuidCAPIFacebook: uuidActual
      })
    }

    Utils.scrollTop()
  }

  async componentDidMount() {

    if (this.props.order !== undefined) {
      this.props.dropShoppingCart()
      if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
        let user = await Utils.getCurrentUser()
        if (user !== null) {
          this.setState({
            user: user
          })
        }
        let dateSending = new Date();
        gtag('event', 'conversion', {
          'send_to': this.props.app.data.googleAdsConversionEvents.thankYouPage,
          'value': this.props.order.total,
          'currency': 'MXN',
          'transaction_id': this.props.order.folio
        })

        gtag('event', 'purchase', {
          "transaction_id": this.props.order.folio,
          "value": this.props.order.total,
          "currency": "MXN",
          "tax": 0,
          "shipping": this.props.order.shippingCost,
          "items": this.props.order.items
        })

        let contentIds = []
        this.props.order.items.forEach((product) => {
          contentIds.push(product.code)
        })

        fbq('track', 'Purchase', {
          'content_ids': contentIds,
          'contents': this.props.order.items,
          'content_type': 'ThankYouPage',
          'num_items': this.props.order.items.length,
          'value': this.props.order.total,
          'currency': 'MXN'
        }, { eventID: 'Purchase' })

        if (this.state.user !== null && this.state.user !== undefined) {

          let eventToFacebook = {
            "data": [
              {
                "event_name": 'Purchase',
                'event_time': Utils.timeIntoSeconds(dateSending),
                'user_data': {
                  'fn': await Utils.hashingData(this.state.user.name),
                  'ln': await Utils.hashingData(this.state.user.secondLastName)
                },
                'custom_data': {
                  "content_ids": contentIds,
                  'content_type': 'ThankYouPage',
                  'num_items': this.props.order.items.length,
                  "value": this.props.order.total,
                  "currency": "MXN"
                },
                'event_id': 'Purchase',
                'action_source': 'website'
              }
            ]
          }

          await Utils.sendConversionApiFacebook(eventToFacebook, this.state.uuidCAPIFacebook)

        }
      }
    }
  }

  getDeliveryDate() {
    return moment(this.props.order.address.date).locale('es').add(8, 'days').format("DD/MM/YYYY")
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        {
          (this.props.order !== undefined) ?
            <Grid container alignContent="center" direction="column">
              <Grid container alignItems="center" direction="column" className={classes.container}>
                <Typography className={classes.mainText}>¡Gracias!</Typography>
                <Typography className={classes.secondaryText}>Un email de confirmación será enviado con todos los detalles de tu orden.</Typography>
                {<Typography className={classes.secondaryHeavyText}>Folio de la orden: {this.props.order.folio}</Typography>}

                {
                  (this.props.order.crediValeFolio !== null) ?
                    <div>
                      <Typography className={classes.secondaryHeavyText}>CrediVale ® utilizado: {this.props.order.crediValeFolio}</Typography>
                      <Typography variant="body2">Un asesor se pondrá en contacto para continuar con tu compra.</Typography>
                      <br />
                    </div>
                    :
                    ''
                }
                {
                  (this.props.order.referenceOXXO !== null) ?
                    <div>
                      <Typography className={classes.secondaryHeavyText}>Referencia de pago: {this.props.order.referenceOXXO}</Typography>
                      <div style={{ margin: '0 auto', textAlign: 'center' }}>
                        <img src={this.props.order.barcodeOXXO} />
                        <Typography className={classes.secondaryText} >Revisa tu correo electrónico y realiza tu pago en tu OXXO ® más cercano.</Typography>
                        <Typography variant="body2">La referencia expira en 3 días. Una vez realizado el pago tu pedido será procesado.</Typography>
                      </div>
                    </div>
                    :
                    ''
                }

                <br />

                {
                  (this.props.order.paynetTicket !== null) ?
                    <Button target='_blank' href={this.props.order.paynetTicket} variant="contained" color="primary" style={{ backgroundColor: '#243b7a', marginTop: 24 }} onClick={() => { }}>
                      Datos de pago
                    </Button>
                    :
                    ''
                }
                <Typography className={classes.secondaryText} >{this.props.order.quantity} {(this.props.order.quantity > 1) ? 'productos procesados.' : 'producto procesado'}</Typography>
                <br />
                {
                  (this.props.order.shippingMethod === 3) ?
                    <Typography className={classes.secondaryText} variant="body1"><strong>Dirección para recoger tu producto:</strong></Typography>
                    :
                    <Typography className={classes.secondaryText} variant="body1"><strong>Dirección de entrega:</strong></Typography>
                }
                <Typography className={classes.secondaryText} style={{ marginTop: '8px' }}> {(this.props.order.address.street + ' #' + this.props.order.address.exteriorNumber + ', ' + this.props.order.address.location + ' ' + this.props.order.address.suburb).toUpperCase()} </Typography>
                <Typography className={classes.secondaryText}>{(this.props.order.address.municipality + " " + this.props.order.address.state + ", MÉXICO").toUpperCase()}</Typography>
                <Typography className={classes.secondaryText}>Código postal: {this.props.order.address.zip}</Typography>
                {
                  (this.props.order.shippingMethod === 3) ?
                    <Typography className={classes.secondaryText} variant="body1">Para recoger tu producto en sucursal, presenta tu identificación oficial (INE) y tu comprobante de compra que fue enviado a tu correo electrónico y vía SMS (una vez concluida la compra).</Typography>
                    :
                    ''
                }
                {
                  (this.props.order.calzzapatoCode !== null && this.props.order.shippingMethod !== 3 && this.props.order.shippingMethod !== 4) ?
                    <Typography className={classes.secondaryText}>Fecha de entrega estimada: <span style={{ color: '#009900' }}>{this.getDeliveryDate()}</span></Typography>
                    :
                    <>
                      {
                        (this.props.order.shippingMethod === 4) ?
                          <Button variant="contained" color="primary" style={{ backgroundColor: '#009900', marginTop: 24 }} onClick={() => {
                            window.location.href = "/calzzamovil/" + this.props.order.order
                          }}>
                            SEGUIR ENTREGA EN VIVO
                          </Button>
                          :
                          ''
                      }
                    </>
                }
                <a href='/'>
                  <Button className={classes.button} variant="outlined">Continuar comprando</Button>
                </a>
              </Grid>
              <Grid container alignItems="center" direction="column" className={classes.container}>
                <Typography className={classes.secondaryText}> ¿Tienes alguna pregunta? </Typography>
                <Typography className={classes.secondaryText}> Llámanos las 24 horas, los 365 días del año </Typography>
                <Typography className={classes.secondaryText}> También puedes visitar nuestra sección de <a href={Utils.constants.paths.faq}><ins style={{ color: '#243B7A' }}>preguntas frecuentes</ins></a> y <a href={Utils.constants.paths.support}><ins style={{ color: '#243B7A' }}>soporte</ins></a></Typography>
              </Grid>
            </Grid>
            :
            <Grid container alignContent="center" direction="column">
              <Grid container alignItems="center" direction="column" className={classes.container}>
                <img src="/unsuccessfull.svg" alt='' />
                <Typography className={classes.textError}>¡Algo salió mal!</Typography>
                <Typography className={classes.secondaryText}>Tu transacción no pudo ser procesada.</Typography>
                <Typography className={classes.secondaryText}>Por favor inténtalo de nuevo más tarde.</Typography>
                <Link href="/">
                  <Button variant="contained" color="primary" className={classes.buttonFailed}>Volver a intentar</Button>
                </Link>
              </Grid>
              <Grid container alignItems="center" direction="column" className={classes.container}>
                <Typography className={classes.secondaryText}> ¿Tienes alguna pregunta? </Typography>
                <Typography className={classes.secondaryText}> Llámanos las 24 horas, los 365 días del año </Typography>
                <Typography className={classes.secondaryText}> También puedes visitar nuestra sección de <a href={Utils.constants.paths.faq}><ins style={{ color: '#243B7A' }}>preguntas frecuentes</ins></a> y <a href={Utils.constants.paths.support}><ins style={{ color: '#243B7A' }}>soporte</ins></a></Typography>
              </Grid>
            </Grid>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    dropShoppingCart: () => {
      dispatch(dropShoppingCart())
    }
  }
}

export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(ThanYouView)
