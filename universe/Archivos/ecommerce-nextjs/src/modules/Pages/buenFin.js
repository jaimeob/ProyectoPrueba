import React, { Component } from 'react'
import {connect} from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles'

// Utils
import Utils from '../../resources/Utils'
import { Typography, Grid } from '@material-ui/core'

import NewsletterBlock from '../../components/NewsletterBlock'
import BenefitBlock from '../../components/BenefitBlock'

const styles = theme => ({
  container: {
    backgroundColor: '#E30715',
    width: '100%', margin: '0 auto',
    padding: 32,
    [theme.breakpoints.down('sm')]: {
      width: '100%', margin: '0 auto', textAlign: 'center'
    }
  },
  image: {
    width: 244, float: 'right', marginRight: 32,
    [theme.breakpoints.down('sm')]: {
      width: 244, float: 'none', marginRight: 0
    }
  },
  text: {
    color: 'white',
    paddingTop: 64,
    [theme.breakpoints.down('md')]: {
      paddingTop: 48,
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    }
  },
  faqItem: {
    paddingTop: 16,
    paddingBottom: 16
  },
  faqTitle: {
    fontSize: 22,
    fontWeight: 100
  },
  trustContainer: {
    background: 'rgba(255, 255, 255, 1)',
    width: '100%',
    margin: '42px auto', padding: 0, listStyle: 'none', borderRadius: 5, textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      width: '100%'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  trustLogo: {
    height: 42,
    margin: 8
  }
})


class BuenFin extends Component {
  componentDidMount() {
    Utils.scrollTop()
  }

  render() {
    const { classes } = this.props
    return (
      <>
        <div className={classes.container}>
          <Grid container>
            <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
              <img src="./buenfin.svg" className={classes.image}/>
            </Grid>
            <Grid item xl={7} lg={7} md={7} sm={12} xs={12} className={classes.text}>
              <Typography variant="h4" style={{ fontSize: 28 }}>Prepárate para las mejores ofertas del año.</Typography>
              <br />
              <Typography variant="body1" style={{ fontSize: 18, color: 'white' }} >
                Regístrate con tu correo electrónico y sé el primero en recibir todos los descuentos y promociones que Grupo Calzzapato ® y El Buen Fin tienen para ti.
              </Typography>
            </Grid>
          </Grid>
        </div>
        <div style={{ marginTop: "0.1%" }}>
          <NewsletterBlock
            title="Regístrate a El Buen Fin."
            description="Disfruta comprando del 9 al 20 de noviembre de 2020"
          />
        </div>
        <div style={{ marginTop: 32 }}>
          <BenefitBlock
            title=""
            description=""
          />
        </div>
        <div style={{ width: '80%', margin: '0 auto', marginTop: 32, textAlign: 'left' }}>
          <div className={classes.faqItem}>
            <Typography className={classes.faqTitle} variant="h6"><strong>¿Qué es El Buen Fin?</strong></Typography>
            <Typography className={classes.faqAnswer} variant="body1">El llamado fin de semana más barato del año es una iniciativa del Consejo Coordinador Empresarial, surgida en 2011 con el respaldo del gobierno federal y las instituciones bancarias, en la que los comercios ofrecen descuentos, ofertas y promociones exclusivas.</Typography>
          </div>
          <div className={classes.faqItem}>
            <Typography className={classes.faqTitle} variant="h6"><strong>¿Cuándo empieza El Buen Fin 2020?</strong></Typography>
            <Typography className={classes.faqAnswer} variant="body1">El Buen Fin 2020 cada vez está más cerca: su décima edición se celebrará durante 12 días seguidos. Del 9 al 20 de noviembre podrás encontrar increíbles promociones y descuentos exclusivos en nuestras tiendas en línea.</Typography>
          </div>
          <div className={classes.faqItem}>
            <Typography className={classes.faqTitle} variant="h6"><strong>¿Cuáles serán las ofertas del Buen Fin 2020?</strong></Typography>
            <Typography className={classes.faqAnswer} variant="body1">Ve haciendo tu lista de deseos para que aproveches increíbles descuentos en celulares, pantallas, electrónica, muebles, línea blanca, ropa, zapatos y mucho más.</Typography>
          </div>
          <div className={classes.faqItem}>
            <Typography className={classes.faqTitle} variant="h6"><strong>¿Cómo puedo comprar en línea?</strong></Typography>
            <Typography className={classes.faqAnswer} variant="body1">
              <ul>
                <li>1. Inicia sesión en nuestras tienda en línea o app móvil.</li>
                <li>2. Agrega tus productos al carrito dando clic en "Agregar al carrito" o bien utilizando la compra rápida "Comprar ahora"</li>
                <li>3. Confirma los datos de entrega a domicilio.</li>
                <li>4. Elige tu método de pago: CrediVale ®, tarjeta de crédito o débito, medios digitales o en efectivo.</li>
                <li>5. Verifica tus datos y da clic en "Confirmar pedido".</li>
                <li>6. Revisa tu correo, ya que recibirás un mensaje con los datos de tu compra.</li>
              </ul>
              O si lo prefieres compra desde Calzzapato.com en Tienda: acude a tu tienda favorita, acércate al kiosco y un colaborador te ayudará a realizar tus compras en línea.
            </Typography>
          </div>
          <div className={classes.faqItem}>
            <Typography className={classes.faqTitle} variant="h6"><strong>¿Cuáles son las formas de pago?</strong></Typography>
            <Typography className={classes.faqAnswer} variant="body1">Puedes pagar en Calzzapato.com usando tu Crédito CrediVale ®, tarjeta de crédito o débito, PayPal, pagos en efectivo en OXXO ® y otros medios electrónicos.</Typography>
          </div>
          <div>
            <ul className={classes.trustContainer}>
              <li style={{ display: 'inline-block'}}><img className={classes.trustLogo} src="/amvo.svg" /></li>
              <li style={{ display: 'inline-block'}}><img className={classes.trustLogo} src="/sellodeconfianza.svg" /></li>
              <li style={{ display: 'inline-block'}}><img className={classes.trustLogo} src="/pci.svg" /></li>
              <li style={{ display: 'inline-block'}}><img className={classes.trustLogo} src="/ssl.svg" /></li>
              <li style={{ display: 'inline-block'}}><img className={classes.trustLogo} src="/oxxo.svg" /></li>
              <li style={{ display: 'inline-block'}}><img className={classes.trustLogo} src="/mastercard.svg" /></li>
              <li style={{ display: 'inline-block'}}><img className={classes.trustLogo} src="/visa.svg" /></li>
              <li style={{ display: 'inline-block'}}><img className={classes.trustLogo} src="/amex.svg" /></li>
              <li style={{ display: 'inline-block'}}><img className={classes.trustLogo} src="/credivale.svg" /></li>
            </ul>
          </div>
        </div>
      </>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default connect(mapStateToProps, null)(withStyles(styles)(BuenFin))
