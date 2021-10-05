import React, { Component } from 'react'
import moment from 'moment'
import compose from 'recompose/compose'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Button } from '@material-ui/core'

// Utils
import Utils from '../../resources/Utils'
import { dropShoppingCart } from '../../actions/actionShoppingCart'
import { transactionTracker } from '../../resources/classes/retailrocket'


const styles = theme => ({
  root: {
    width: '100%',
    margin: '0 auto',
    paddingBottom: '272px',
    backgroundColor: "#FAFAFA"
  },
  header: {
    padding: '40px 12px 20px 12px',
    backgroundColor: theme.palette.primary.main
  },
  body: {
    padding: '12px 12px 0px 12px',
  }
})

function GoToShopping(props) {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20 }}>
      <Button
        onClick={() => window.location.href = "/"}
        variant="outlined"
        color="primary"
        style={{ width: 224, padding: '6px 0px 6px 0px', backgroundColor: 'white' }}>
        <strong style={{ fontWeight: 600, fontSize: 12 }}>
          Seguir comprando
        </strong>
      </Button>
    </div>
  )
}

function Address(props) {
  return (
    <>
      <Typography variant="body1" align="center" style={{ width: '100%', marginTop: 20, fontSize: 14 }}>
        {
          (props.data.order.items !== undefined && props.data.order.items !== null) ?
            (props.data.order.items.length === 1) ?
              <span>1 Producto procesado</span>
              :
              <span>{props.data.order.items.length} Productos procesados</span>
            :
            ''
        }
      </Typography>
      <Typography variant="body1" align="center" style={{ width: '100%', marginTop: 20, fontWeight: 500, fontSize: 14 }}>
        <span>{(props.data.order.shippingMethod === 3) ? 'Dirección para recoger tu producto:' : 'Dirección de entrega:'}</span><br />
        {
          (props.data.order.address.street !== undefined && props.data.order.address.street !== null && props.data.order.address.street.length !== 0) ?
            <span>{props.data.order.address.street.toUpperCase()} </span>
            :
            ''
        }
        {
          (props.data.order.address.exteriorNumber !== undefined && props.data.order.address.exteriorNumber !== null && props.data.order.address.exteriorNumber.length !== 0) ?
            <span>#{props.data.order.address.exteriorNumber.toUpperCase()}, </span>
            :
            ''
        }
        {
          (props.data.order.address.location !== undefined && props.data.order.address.location !== null && props.data.order.address.location.length !== 0) ?
            <span>{props.data.order.address.location.toUpperCase()} </span>
            :
            ''
        }
        {
          (props.data.order.address.suburb !== undefined && props.data.order.address.suburb !== null && props.data.order.address.suburb.length !== 0) ?
            <span>{props.data.order.address.suburb.toUpperCase()},<br /> </span>
            :
            <br />
        }
        {
          (props.data.order.address.municipality !== undefined && props.data.order.address.municipality !== null && props.data.order.address.municipality.length !== 0) ?
            <span>{props.data.order.address.municipality.toUpperCase()}, </span>
            :
            ''
        }
        {
          (props.data.order.address.state !== undefined && props.data.order.address.state !== null && props.data.order.address.state.length !== 0) ?
            <span>{props.data.order.address.state.toUpperCase()}. </span>
            :
            ''
        }
        <span>MÉXICO</span><br />
        {
          (props.data.order.address.zip !== undefined && props.data.order.address.zip !== null && props.data.order.address.zip.length !== 0) ?
            <span>C.P {props.data.order.address.zip.toUpperCase()}. </span>
            :
            ''
        }
        {
          (props.data.order.shippingMethod === 3) ?
            <span><br /><br />Para recoger tu producto en sucursal, presenta tu identificación oficial (INE) y tu comprobante de compra que fue enviado a tu correo electrónico y vía SMS (una vez concluida la compra).</span>
            :
            ''
        }
      </Typography>
    </>
  )
}

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
    if (this.props.order !== undefined && this.props.order !== null) {

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
            ],
            "test_event_code": "TEST52609"
          }

          await Utils.sendConversionApiFacebook(eventToFacebook, this.state.uuidCAPIFacebook)
        }
      }
      
      //RETAIL ROCKET
      if (this.props.order !==undefined  && this.props.sizeSelected !=undefined) {
        transactionTracker(this.props.order,this.props.sizeSelected.size)
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
          (this.props.order !== undefined && this.props.order !== null) ?
            <Grid container justify="center">
              <Grid container item xs={12} className={classes.header} justify="center">
                <img src={(this.props.order.paymentMethod === 'oxxo' || this.props.order.paymentMethod === 'paynet') ? '/ic_store_big.svg' : '/ic_check.svg'} />
                <Typography variant="body1" align="center" style={{ width: '100%' }}>
                  {
                    (this.props.order.paymentMethod === 'oxxo') ?
                      <>
                        <strong style={{ color: 'white', fontWeight: 600, fontSize: 22 }}>Quedamos en espera de tu pago</strong><br />
                        <strong style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Revisa tu correo electrónico o toma captura de pantalla de tu ticket de pago.<br />Una vez realizado su pago su pedido será procesado.</strong>
                      </>
                      :
                      (this.props.order.paymentMethod === 'paynet') ?
                        <>
                          <strong style={{ color: 'white', fontWeight: 600, fontSize: 22 }}>Quedamos en espera de tu pago</strong><br />
                          <strong style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Pague en efectivo de forma segura escaneando su ticket de pago</strong>
                        </>
                        :
                        <>
                          <strong style={{ color: 'white', fontWeight: 600, fontSize: 28 }}>¡Gracias!</strong><br />
                          <strong style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>Un email de confirmación será enviado con todos los detalles de tu orden.</strong>
                        </>
                  }

                </Typography>
              </Grid>
              <Grid container item xs={12} sm={10} md={6} lg={5} className={classes.body} justify="center">
                <Typography variant="body1" align="center" style={{ width: '100%', fontWeight: 500, fontSize: 14 }}>Folio de la orden: {this.props.order.folio}</Typography>
                {
                  (this.props.order.crediValeFolio !== undefined && this.props.order.crediValeFolio !== null) ?
                    <Typography variant="body1" align="center" style={{ width: '100%', marginTop: 20, fontSize: 14 }}>
                      <span style={{ fontWeight: 600 }}>CrediVale ® utilizado: {this.props.order.crediValeFolio}</span><br />
                      <span>Un asesor se pondrá en contacto para continuar con tu compra.</span>
                    </Typography>
                    :
                    ''
                }
                {
                  (this.props.order.paymentMethod === 'oxxo') ?
                    <Grid container item xs={12} justify="center" style={{ padding: 12, marginTop: 12, backgroundColor: 'white', border: 'solid 1px #DEDEDE' }}>
                      <img src='/oxxo.svg' style={{ width: 92 }} />
                      <Typography variant="body1" align="center" style={{ width: '100%', marginTop: 20, fontWeight: 500, fontSize: 14 }}>Referencia de pago: {this.props.order.referenceOXXO}</Typography>
                      <img src={this.props.order.barcodeOXXO} style={{ width: 180, marginTop: 20 }} />
                      <Typography variant="body1" align="center" style={{ width: '100%', marginTop: 20, fontSize: 14 }}>Revisa tu correo electrónico y realiza tu pago en tu OXXO ® más cercano.<br />La referencia expira en 3 días. Una vez realizado el pago tu pedido será procesado.</Typography>
                      <Address data={this.props} />
                    </Grid>
                    :
                    <Address data={this.props} />
                }
                {
                  (this.props.order.paymentMethod === 'paynet') ?
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                      <Button
                        variant="contained"
                        onClick={() => { window.open(this.props.order.paynetTicket) }}
                        color="primary"
                        style={{ width: 224, padding: '6px 0px 6px 0px' }}>
                        <strong style={{ fontWeight: 600, fontSize: 12 }}>
                          Descargar ticket de pago
                        </strong>
                      </Button>
                    </div>
                    :
                    ''
                }
                {
                  (this.props.order.shippingMethod === 4) ?
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                      <Button
                        onClick={() => window.location.href = "/calzzamovil/" + this.props.order.order}
                        variant="contained"
                        color="primary"
                        style={{ width: 224, padding: '6px 0px 6px 0px' }}>
                        <strong style={{ fontWeight: 600, fontSize: 12 }}>
                          Seguir entrega en vivo
                        </strong>
                      </Button>
                    </div>
                    :
                    ''
                }
                <GoToShopping />
              </Grid>
            </Grid>
            :
            <Grid container justify="center">
              <Grid container item xs={12} className={classes.header} justify="center">
                <img src="/ic_order_error.svg" />
                <Typography variant="body1" align="center" style={{ width: '100%' }}>
                  <strong style={{ color: 'white', fontWeight: 600, fontSize: 22 }}>Algo salió mal</strong>
                </Typography>
              </Grid>
              <Grid container item xs={12} sm={10} md={6} lg={5} className={classes.body} justify="center">
                <Typography variant="body1" align="center" style={{ width: '100%', fontWeight: 600, fontSize: 14 }}>
                  Tu transacción no pudo ser procesada<br />Porfavor inténtalo más tarde
                </Typography>
                <GoToShopping />
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
