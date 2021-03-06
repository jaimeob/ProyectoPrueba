import React, { Component } from 'react'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles'

// Utils
import Utils from '../../resources/Utils'
import { Grid, Typography, Icon, Button } from '@material-ui/core'
import SignUpModal from '../../components/SignUpModal'

const styles = theme => ({
  container: {
    background: '#50cef4'
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  benefit: {
    padding: '16px 32px'
  },
  benefitIcon: {
    fontSize: 48,
    marginBottom: 24
  },
  benefitTitle: {
    fontSize: 18
  },
  benefitDescription: {
    fontSize: 14
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
  },
  activationCard: {
    height: 300,
    borderRadius: 32,
    padding: 32,
    margin: '2.5%',
    background: 'rgb(0,200,255)',
    background: 'linear-gradient(180deg, rgba(0,200,255,1) 0%, rgba(86,218,255,1) 35%, rgba(139,230,255,1) 100%)',
    boxShadow: '0px 10px 27px -13px rgba(0,115,255,1)'
  },
  activationTitle: {
    color: 'white',
    fontSize: 28,
    lineHeight: 1,
    height: 40
  },
  activationDescription: {
    color: 'white',
    fontSize: 18,
    lineHeight: 1,
    marginTop: 16,
    height: 100
  },
  activactionButton: {
    marginTop: 32,
    background: 'white',
    color: '#0086B7',
    fontSize: 20,
    width: '100%',
    borderRadius: 32,
    textTransform: 'none',
    boxShadow: '0px 10px 27px -13px rgba(0,115,255,0.3)'
  }
})

class MonederoAzul extends Component {
  constructor(props){
    super(props)
    this.state = {
      openNewRegister: false
    }
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  render() {
    const { classes } = this.props
    return (
      <>
      {/* 
      <Grid container className={classes.container}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <nav>
            <ul className={classes.list} style={{ color: 'white', float: 'right' }}>
              <li style={{ display: 'inline-block', padding: 32 }}>Beneficios</li>
              <li style={{ display: 'inline-block', padding: 32 }}>Preguntas frecuentes</li>
              <li style={{ display: 'inline-block', padding: 32 }}>Activaci??n</li>
            </ul>
          </nav>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <div style={{ width: '80%', margin: '0 auto', padding: '48px 16px' }}>
            <Grid container>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <Typography variant="h1" style={{ color: 'white', fontSize: 72, lineHeight: 1, color: '#0086b7', marginBottom: 8 }}>Monedero Azul<span style={{ fontSize: 122, lineHeight: 0.1, color: 'white'}}>.</span></Typography>
                <span style={{ background: 'white', fontSize: 12, color: "#42c8f4", padding: '6px 12px', borderRadius: 12 }}><strong>De Grupo Calzzapato ??</strong></span>
                <Typography variant="body1" style={{ color: 'white', fontSize: 18, padding: '32px 0px', width: '80%' }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                </Typography>
                <div style={{ marginTop: 24 }}>
                  <ul className={classes.list}>
                    <li style={{ display: 'inline-block', marginRight: 24 }}><img style={{ width: 200 }} src="./downloadAndroid.svg" /></li>
                    <li style={{ display: 'inline-block' }}><img style={{ width: 200 }} src="./downloadApple.svg" /></li>
                  </ul>
                </div>
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <Grid container>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                    <div className={classes.activationCard}>
                      <Typography variant="body1" className={classes.activationTitle}>Estoy registrado</Typography>
                      <Typography variant="body2" className={classes.activationDescription}>Si ya tienes tu cuenta digital activa tu monedero.</Typography>
                      <Button variant="contained" className={classes.activactionButton}>
                        Activar
                      </Button>
                    </div>
                  </Grid>
                  <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                    <div className={classes.activationCard}>
                      <Typography variant="body1" className={classes.activationTitle}>Soy nuevo</Typography>
                      <Typography variant="body2" className={classes.activationDescription}>Crea tu cuenta digital y activa tu monedero.</Typography>
                      <Button variant="contained" className={classes.activactionButton} onClick={ () => {
                        this.setState({
                          openNewRegister: true
                        })
                      }}>
                        Activar
                      </Button>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <div style={{ textAlign: 'center', padding: '32px 0px' }}>
            <ul className={classes.list}>
              <li style={{ display: 'inline-block', padding: 12 }} ><img style={{ height: 42 }} src="./calzzapatov.svg" /></li>
              <li style={{ display: 'inline-block', padding: 12 }} ><img style={{ height: 42 }} src="./kelderv.svg" /></li>
              <li style={{ display: 'inline-block', padding: 12 }} ><img style={{ height: 42 }} src="./urbannav.svg" /></li>
              <li style={{ display: 'inline-block', padding: 12 }} ><img style={{ height: 42 }} src="./calzzasportv.svg" /></li>
              <li style={{ display: 'inline-block', padding: 12 }} ><img style={{ height: 42 }} src="./calzakidsv.svg" /></li>
            </ul>
          </div>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <div style={{ textAlign: 'center', padding: '32px 0px' }}>
            <Typography variant="h2">Beneficios.</Typography>
            <Typography variant="body1">Description description description description.</Typography>
            <Grid container style={{ width: '80%', margin: '0 auto', marginTop: 48}}>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <div className={classes.benefit}>
                  <Icon className={classes.benefitIcon}>circle</Icon>
                  <Typography variant="body1" className={classes.benefitTitle}><strong>Title</strong></Typography>
                  <Typography variant="body2" className={classes.benefitDescription}>Description description description</Typography>
                </div>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <div className={classes.benefit}>
                  <Icon className={classes.benefitIcon}>circle</Icon>
                  <Typography variant="body1" className={classes.benefitTitle}><strong>Title</strong></Typography>
                  <Typography variant="body2" className={classes.benefitDescription}>Description description description</Typography>
                </div>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <div className={classes.benefit}>
                  <Icon className={classes.benefitIcon}>circle</Icon>
                  <Typography variant="body1" className={classes.benefitTitle}><strong>Title</strong></Typography>
                  <Typography variant="body2" className={classes.benefitDescription}>Description description description</Typography>
                </div>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <div className={classes.benefit}>
                  <Icon className={classes.benefitIcon}>circle</Icon>
                  <Typography variant="body1" className={classes.benefitTitle}><strong>Title</strong></Typography>
                  <Typography variant="body2" className={classes.benefitDescription}>Description description description</Typography>
                </div>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <div style={{ textAlign: 'center', padding: '32px 0px' }}>
            <Typography variant="h2">Preguntas frecuentes.</Typography>
            <Typography variant="body1">Description description description description.</Typography>
            <div style={{ width: '80%', margin: '0 auto', marginTop: 32, textAlign: 'left' }}>
              <div className={classes.faqItem}>
                <Typography className={classes.faqTitle} variant="h6"><strong>??Qu?? es El Buen Fin?</strong></Typography>
                <Typography className={classes.faqAnswer} variant="body1">El llamado fin de semana m??s barato del a??o es una iniciativa del Consejo Coordinador Empresarial, surgida en 2011 con el respaldo del gobierno federal y las instituciones bancarias, en la que los comercios ofrecen descuentos, ofertas y promociones exclusivas.</Typography>
              </div>
              <div className={classes.faqItem}>
                <Typography className={classes.faqTitle} variant="h6"><strong>??Cu??ndo empieza El Buen Fin 2020?</strong></Typography>
                <Typography className={classes.faqAnswer} variant="body1">El Buen Fin 2020 cada vez est?? m??s cerca: su d??cima edici??n se celebrar?? durante 12 d??as seguidos. Del 9 al 20 de noviembre podr??s encontrar incre??bles promociones y descuentos exclusivos en nuestras tiendas en l??nea.</Typography>
              </div>
              <div className={classes.faqItem}>
                <Typography className={classes.faqTitle} variant="h6"><strong>??Cu??les ser??n las ofertas del Buen Fin 2020?</strong></Typography>
                <Typography className={classes.faqAnswer} variant="body1">Ve haciendo tu lista de deseos para que aproveches incre??bles descuentos en celulares, pantallas, electr??nica, muebles, l??nea blanca, ropa, zapatos y mucho m??s.</Typography>
              </div>
              <div className={classes.faqItem}>
                <Typography className={classes.faqTitle} variant="h6"><strong>??C??mo puedo comprar en l??nea?</strong></Typography>
                <Typography className={classes.faqAnswer} variant="body1">
                  <ul>
                    <li>1. Inicia sesi??n en nuestras tienda en l??nea o app m??vil.</li>
                    <li>2. Agrega tus productos al carrito dando clic en "Agregar al carrito" o bien utilizando la compra r??pida "Comprar ahora"</li>
                    <li>3. Confirma los datos de entrega a domicilio.</li>
                    <li>4. Elige tu m??todo de pago: CrediVale ??, tarjeta de cr??dito o d??bito, medios digitales o en efectivo.</li>
                    <li>5. Verifica tus datos y da clic en "Confirmar pedido".</li>
                    <li>6. Revisa tu correo, ya que recibir??s un mensaje con los datos de tu compra.</li>
                  </ul>
                  O si lo prefieres compra desde Calzzapato.com en Tienda: acude a tu tienda favorita, ac??rcate al kiosco y un colaborador te ayudar?? a realizar tus compras en l??nea.
                </Typography>
              </div>
              <div className={classes.faqItem}>
                <Typography className={classes.faqTitle} variant="h6"><strong>??Cu??les son las formas de pago?</strong></Typography>
                <Typography className={classes.faqAnswer} variant="body1">Puedes pagar en Calzzapato.com usando tu Cr??dito CrediVale ??, tarjeta de cr??dito o d??bito, PayPal, pagos en efectivo en OXXO ?? y otros medios electr??nicos.</Typography>
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
            </div>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <div style={{ width: '80%', margin: '0 auto', textAlign: 'center', padding: '32px 0px' }}>
            <Typography variant="h2">Act??vate hoy.</Typography>
            <Typography variant="body1">Description description description description.</Typography>
          </div>
          <div style={{ width: '80%', margin: '0 auto', textAlign: 'center' }}>
            <Grid container>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <div className={classes.activationCard}>
                  <Typography variant="body1" className={classes.activationTitle}>Ya estoy registrado</Typography>
                  <Typography variant="body2" className={classes.activationDescription}>Si ya tienes tu cuenta digital activa tu monedero.</Typography>
                  <Button variant="contained" className={classes.activactionButton}>
                    Activar
                  </Button>
                </div>
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <div className={classes.activationCard}>
                  <Typography variant="body1" className={classes.activationTitle}>Soy nuevo</Typography>
                  <Typography variant="body2" className={classes.activationDescription}>Crea tu cuenta digital y activa tu monedero.</Typography>
                  <Button variant="contained" className={classes.activactionButton}>
                    Activar
                  </Button>
                </div>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <SignUpModal
        open={this.state.openNewRegister}
      />
      <Grid container>
        <footer style={{ marginTop: 48, height: 88, width: '100%', textAlign: 'center', fontWeight: 100, fontSize: 13 }}>
          <p>?? {new Date().getFullYear()} Grupo Calzzapato - Todos los derechos reservados.</p>
        </footer>
      </Grid>
      */}
      </>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default connect(mapStateToProps, null)(withStyles(styles)(MonederoAzul))
