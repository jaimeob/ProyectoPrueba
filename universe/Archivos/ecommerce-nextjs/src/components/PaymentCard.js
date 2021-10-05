import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Paper, Button, Hidden, Card, Radio, TextField } from '@material-ui/core'
import StarIcon from '@material-ui/icons/Star'

// Components
import QuantityControl from './QuantityControl'
import Line from './Line'
import CardComponent from './Card'
import { requestAPI } from '../api/CRUD'
import AddressRequest from './AddressRequest'

// Utils
import Utils from '../resources/Utils'
import ItemCheckout from './ItemCheckout'

import { updateShippingMethod } from '../actions/actionCheckout'

const styles = theme => ({
  containerAddress: {
    borderRadius: '3px',
    boxShadow: ' 0 2px 2px 0.1px rgba(180, 180, 180, 0.5)',
    background: 'white',
    marginBottom: '10px',
    paddingLeft: '20px',
    paddingBottom: '20px',
    paddingTop: '20px',
  },
  containerAddressBlocked: {
    borderRadius: '3px',
    boxShadow: ' 0 2px 2px 0.1px rgba(180, 180, 180, 0.5)',
    background: 'white',
    marginBottom: '10px',
    paddingLeft: '20px',
    paddingBottom: '20px',
    paddingTop: '20px',
    opacity: 0.5
  },
  align: {
    display: 'flex',
    alignItems: 'center'
  },
  image: {
    width: '90%',
    marginBottom: '-5px',
    [theme.breakpoints.down("xs")]: {
      marginTop: '7px',

    }
  }

})

class PaymentCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      amount: null,
      folio: null

    }
    this.handleChangeAddress = this.handleChangeAddress.bind(this)
    this.handleChangeFolio = this.handleChangeFolio.bind(this)
    this.handleChangeAmount = this.handleChangeAmount.bind(this)
    this.handleChangeFolioIne = this.handleChangeFolioIne.bind(this)
  }
  componentWillMount() {
    this.setState({
    })
  }

  handleChangeAddress(id) {
    this.props.handleChangeAddress(id)
  }

  handleChangeFolio(input) {
    let folio = input.target.value.toUpperCase().trim()
    this.props.handleChangeFolio(folio)
  }

  handleChangeAmount(input) {
    if (!isNaN(Number(input.target.value.trim()))) {
      let amount = input.target.value.trim()
      this.props.handleChangeAmount(amount)

    }
  }
  handleChangeFolioIne(input) {
    if (!isNaN(Number(input.target.value.trim())) && input.target.value.trim().length <= 4) {
      let folioIne = input.target.value.trim()
      this.props.handleChangeFolioIne(folioIne)
    }
  }

  render() {
    const { classes } = this.props
    const self = this

    return (
      <div style={{ width: '100%' }}>
        <Grid container className={(this.props.data.blocked) ? classes.containerAddressBlocked : classes.containerAddress}  >
          <Grid item sm={2} xs={3} style={{ display: 'flex', alignItems: 'center' }}  >
            {
              (this.props.data.id === 5) ?
                <img className={classes.image} src={'/netpay.png'} ></img>
                :
                (this.props.data.id === 9) ?
                  <img className={classes.image} src={'/openpayCard.png'} ></img>
                  :
                  (this.props.data.id === 4) ?
                    <img className={classes.image} src={'/paypalCard.png'} ></img>
                    :
                    (this.props.data.id === 1) ?
                      <img className={classes.image} src={'/bbva.svg'} ></img>
                      :
                      (this.props.data.id === 2) ?
                        <img className={classes.image} src={'/credivale.svg'} ></img>
                        :
                        (this.props.data.id === 3) ?
                          <img className={classes.image} src={'/oxxo.svg'} ></img>
                          :
                          (this.props.data.id === 10) ?
                            <img className={classes.image} src={'https://www.paynet.com.mx/img/logo_header.png'} ></img>
                            :
                            ''

            }
          </Grid>

          <Grid item sm={6} xs={7} className={classes.align} >
            <Grid container style={{ paddingTop: '10px', paddingBottom: '10px' }} >
              <Grid item xs={12}>
                <Typography style={{ fontSize: '14px', fontWeight: 'bold' }} variant='body2'>{this.props.data.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography style={{ fontSize: '12px', color: 'black' }} variant='body2'>{this.props.data.description} </Typography>
              </Grid>
              {
                (this.props.data.id === 10) ?
                  <Grid item xs={12}>

                    <Grid container>
                      <Grid item xs={3}>
                        <img className={classes.image} src={'https://www.paynet.com.mx/img/benavides.png'} ></img>
                      </Grid>
                      <Grid item xs={3}>
                        <img className={classes.image} src={'https://www.paynet.com.mx/img/ahorro.jpg'} ></img>
                      </Grid>
                      <Grid item xs={3}>
                        <img className={classes.image} src={'https://www.paynet.com.mx/img/aurrera.jpg'} ></img>
                      </Grid>
                      <Grid item xs={3}>
                        <img className={classes.image} src={'https://www.paynet.com.mx/img/seven.jpg'} ></img>
                      </Grid>
                      <Grid item xs={3}>
                        <img className={classes.image} src={'https://www.paynet.com.mx/img/walmart.jpg'} ></img>
                      </Grid>
                      <Grid item xs={3}>
                        <img className={classes.image} src={'https://www.paynet.com.mx/img/guadalajara.jpg'} ></img>
                      </Grid>
                      <Grid item xs={3}>
                        <img className={classes.image} src={'https://www.paynet.com.mx/img/waldos.jpg'} ></img>
                      </Grid>
                      <Grid item xs={3}>
                        <img className={classes.image} src={"https://www.paynet.com.mx/img/walmart_express.png"} ></img>
                      </Grid>
                    </Grid>

                  </Grid>
                  :
                  ''
              }
            </Grid>
          </Grid>

          <Grid item sm={4} xs={2} className={classes.align} style={{ justifyContent: 'flex-end' }} >
            {
              (!this.props.confirmation) ?
                <Radio
                  checked={this.props.data.selected}
                  onChange={(!this.props.data.blocked) ? () => { this.props.handleChangePaymentMethod() } : () => { }}
                  disabled={this.props.data.blocked}
                />
                :
                ''
            }
          </Grid>

          {
            (this.props.data.blocked) ?
              <Grid item xs={12} style={{ marginTop: '20px' }}>
                <Grid container>
                  <Grid item xs={1} style={{ justifyContent: 'center', display: 'flex' }} >
                    <img src={'/icono-alerta.svg'} ></img>
                  </Grid>
                  <Grid item xs={11}>
                    <Typography style={{ fontSize: '13px' }} variant='body1'>{this.props.data.blockedMessage}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              :
              (this.props.data.id === 2 && this.props.data.selected) ?
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
                  <form>
                    <strong>Paso 1.</strong>
                    <Typography variant="body1">Valida el vale electrónico de CrediVale ® de forma rápida y segura.</Typography>
                    <TextField autoFocus style={{ marginTop: 4, marginRight: 8 }} type="text" placeholder="Folio electrónico *" value={self.state.folio} onChange={self.handleChangeFolio} />
                    <TextField style={{ marginTop: 4, marginRight: 8 }} type="text" placeholder="Monto *" value={self.state.amount} onChange={self.handleChangeAmount} />
                    <Button style={{ marginTop: 4, marginRight: 4 }} variant="contained" color="primary" onClick={() => self.props.validateDigitalVale()}>VALIDAR CREDIVALE ®</Button>
                    {
                      (self.props.digitalVale.status) ?
                        <img style={{ paddingTop: 4, marginLeft: 8, width: 22 }} alt='' src={'/success.svg'} />
                        :
                        <span>
                          {
                            (!self.props.digitalVale.status && !Utils.isEmpty(self.props.digitalVale.folio.trim())) ?
                              <img style={{ paddingTop: 4, marginLeft: 8, width: 22 }} alt='' src={'/error.svg'} />
                              :
                              ''
                          }
                        </span>
                    }
                    <Typography style={{ marginTop: 4, fontSize: 10 }} variant="body2">* Todos los datos del CrediVale ® son obligatorios.</Typography>
                    <div style={{ marginTop: 16 }}>
                      <strong>Paso 2.</strong>
                      <br />
                      <Grid container>
                        <Grid item xl={7} lg={7} md={7} sm={7} xs={7}>
                          <Typography variant="body1">Captura los últimos 4 dígitos del folio de tu credencial.</Typography>
                          <Typography variant="body2"><span style={{ fontSize: 12 }}>Lo puedes encontrar al reverso de tu credencial.</span></Typography>
                          <TextField
                            variant="outlined"
                            style={{ marginTop: 16, marginBottom: 32 }}
                            placeholder="_ _ _ _"
                            label="Últimos 4 dígitos"
                            value={self.state.folioIne}
                            onChange={self.handleChangeFolioIne}
                            inputProps={{ maxLength: 4 }
                            }
                          />
                        </Grid>
                        <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                          <img src='/ine.jpg' style={{ width: '100%' }} />
                        </Grid>
                      </Grid>
                    </div>
                  </form>
                </Grid>
                :
                (this.props.cardSelected !== null && this.props.cardSelected !== undefined) ?
                  <Grid item xs={12} style={{ marginTop: '20px', paddingRight: '20px' }}>
                    <Grid container spacing={1}>
                      {
                        (this.props.data.id === 5 || this.props.data.id === 9) ?
                          (this.props.data.cards.length > 0) ?
                            <Grid item xs={12}>
                              {
                                this.props.data.cards.map((card, idx) => {
                                  return (
                                    // (card.selected) ?
                                    (this.props.cardSelected.id === card.id) ?
                                      <Grid item xs={3} style={{ justifyContent: 'center', display: 'flex' }} >
                                        <CardComponent data={card} ></CardComponent>
                                      </Grid>
                                      :
                                      ''
                                  )
                                })
                              }
                              <Grid item xs={4}>
                                <Typography onClick={() => { this.props.openCardList() }} variant='body2' style={{ fontSize: '12px', fontWeight: '600', color: '#499dd8', marginTop: '10px', cursor: 'pointer', userSelect: 'none' }}  >
                                  Editar o elegir otra tarjeta
                            </Typography>
                              </Grid>
                            </Grid>
                            :
                            <Grid container className={classes.container} >
                              <Grid item xs={12}>
                                <Grid container>
                                  <Grid style={{}} className={classes.align} item sm={1} xs={1}>
                                    <img src={'/icono-alerta.svg'} ></img>
                                  </Grid>

                                  <Grid item sm={6} xs={10} className={classes.align} >
                                    {/* Web view */}
                                    <Hidden mdDown >
                                      <Grid container>
                                        <Grid item xs={12}>
                                          <Typography style={{ fontSize: '14px', textAlign: 'center' }} variant='body2'>No tienes ninguna tarjeta guardada. Agrega una tarjeta para proceder con tu compra.</Typography>
                                        </Grid>
                                      </Grid>
                                    </Hidden>

                                    {/* Responsive view */}
                                    <Hidden lgUp>
                                      <Grid container>
                                        <Grid item xs={12}>
                                          <Typography style={{ fontSize: '14px', textAlign: 'center' }} variant='body2'>No tienes ninguna tarjeta guardada. Agrega una tarjeta para proceder con tu compra.</Typography>
                                        </Grid>
                                      </Grid>
                                    </Hidden>
                                  </Grid>

                                  <Grid item sm={5} xs={12} className={classes.align} >
                                    <Button onClick={() => { this.props.openCardModal() }} style={{ marginLeft: '5px', width: '100%', boxShadow: '0 2px 1px -2px rgba(0, 0, 0, 0.5)', background: '#243b7a', color: 'white', fontWeight: 'bold', textTransform: 'none' }}   >Agregar tarjeta</Button>
                                  </Grid>

                                </Grid>
                              </Grid>

                            </Grid>
                          :
                          ''
                      }

                    </Grid>
                  </Grid>
                  :
                  ''

          }

        </Grid>
      </div>
    )

  }
}
const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = dispatch => {
  return {
    updateShippingMethod: (checkout) => {
      dispatch(updateShippingMethod(checkout))
    }
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(PaymentCard)


