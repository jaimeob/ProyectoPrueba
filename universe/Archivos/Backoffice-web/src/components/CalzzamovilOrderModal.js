import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import dateFormat from 'dateformat'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import Utils from '../resources/Utils'

dateFormat.i18n = {
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
  ],
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ]
}

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const styles = theme => ({
  container: {
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: '35%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '32px 16px 32px 16px',
    [theme.breakpoints.down('sm')]: {
      width: '60%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
      padding: '16px 16px 16px 16px'
    }
  },
  modalTitle: {
    width: '100%',
    marginTop: 16,
    fontSize: 28,
    fontWeight: 600,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: 22
    }
  },
  modalText: {
    display: 'block',
    fontSize: 16,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  },
  modalTextInline: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    fontSize: 16,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  },
})

class CalzzamovilDeliveryModal extends Component {
  constructor(props) {
    super(props)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose() {
    this.props.handleClose()
  }

  handleRender() {
    if (this.props.data !== null) {
      this.props.history.push('/calzzamovil/compras/' + this.props.data.id)
    }
  }

  getDateWithFormat(date) {
    let dayName = dateFormat(date, 'ddd')
    let day = dateFormat(date, 'd')
    let month = dateFormat(date, 'mmm')

    return dayName + ' ' + day + ' de ' + month
  }

  render() {
    const { classes } = this.props

    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}>
        {
          (this.props.data !== null && this.props.data !== undefined) ?
            <div style={getModalStyle()} className={classes.container}>
              <Grid container direction="row">
                <Typography item className={classes.modalText} variant="body1" style={{ fontSize: 20 }}><strong>Pedido</strong></Typography>
                <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ marginRight: 8 }}>Folio:</Typography>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ opacity: 0.54 }}>#{this.props.data.order}</Typography>
                </Grid>
                <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ marginRight: 8 }}>Fecha:</Typography>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ opacity: 0.54 }}>{this.getDateWithFormat(this.props.data.shoppingDate)}</Typography>
                </Grid>
                <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ marginRight: 8 }}>Método de pago:</Typography>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ opacity: 0.54 }}>{this.props.data.paymentMethod.name}</Typography>
                </Grid>
                <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ marginRight: 8 }}>Método de envío:</Typography>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ opacity: 0.54 }}>{this.props.data.shippingMethod.name}{(this.props.data.shippingCost === 0) ? '(GRATIS)' : '(' + this.props.data.shippingCost + ')'}</Typography>
                </Grid>
                <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ marginRight: 8 }}>Ahorrado:</Typography>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ opacity: 0.54 }}>{(this.props.data.discount === undefined || this.props.data.discount === 0) ? '-' : Utils.numberWithCommas(this.props.data.discount)}</Typography>
                </Grid>
                <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ marginRight: 8 }}>Cúpon de pago:</Typography>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ opacity: 0.54 }}>{(this.props.data.coupon === undefined || this.props.data.coupon === 0) ? '-' : Utils.numberWithCommas(this.props.data.coupon)}</Typography>
                </Grid>
                <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ marginRight: 8 }}>Total:</Typography>
                  <Typography item className={classes.modalTextInline} variant="body1" style={{ color: 'green' }}><strong>${Utils.numberWithCommas(this.props.data.total)}</strong></Typography>
                </Grid>
                {/* <Typography item className={classes.modalText} variant="body1" style={{ fontSize: 18, marginTop: 16 }}><strong>Calificación del envio:</strong></Typography>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                
<StarIcon />
<StarIcon />
<StarIcon />
                </Grid> */}
                <Typography item className={classes.modalText} variant="body1" style={{ fontSize: 18, marginTop: 16 }}><strong>Dirección de envío:</strong></Typography>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography className={classes.modalText} style={{ width: '100%', opacity: 0.54 }} variant="body1"><strong>{this.props.data.address.name}</strong></Typography>
                  <Typography className={classes.modalText} style={{ width: '100%', opacity: 0.54 }} variant="body1">{this.props.data.address.street} #{this.props.data.address.exteriorNumber}</Typography>
                  <Typography className={classes.modalText} style={{ width: '100%', opacity: 0.54 }} variant="body1">{this.props.data.address.locationType} {this.props.data.address.locationName}</Typography>
                  <Typography className={classes.modalText} style={{ width: '100%', opacity: 0.54 }} variant="body1">{this.props.data.address.municipalityName}, {this.props.data.address.stateName}</Typography>
                  <Typography className={classes.modalText} style={{ width: '100%', opacity: 0.54 }} variant="body1">C.P {this.props.data.address.zip}</Typography>

                </Grid>
                <Typography item className={classes.modalText} variant="body1" style={{ fontSize: 18, marginTop: 16 }}><strong>Productos:</strong></Typography>
                {
                  (this.props.data.orderDetail.map((item, index) => {
                    return (
                      <Grid key={index} container style={(index === 0) ? { padding: 8 } : { padding: 8, marginTop: 16 }}>
                        <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                          <img style={{ width: '100%' }} src={item.image} />
                        </Grid>
                        <Grid container item style={{ paddingLeft: 8 }} xl={8} lg={8} md={8} sm={8} xs={8}>
                          <Typography item className={classes.modalText} variant="body1"><strong>{item.productDescription}</strong></Typography>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Typography className={classes.modalTextInline} variant="body1" style={{ marginRight: 8 }}>Cantidad:</Typography>
                            <Typography className={classes.modalTextInline} variant="body1" style={{ opacity: .54 }}>{item.quantity} {(item.quantity === 1) ? 'Producto' : 'Productos'}</Typography>
                          </Grid>
                          {
                            (item !== undefined && item.orderStatus !== undefined && item.orderStatus.steps !== undefined && item.orderStatus.current !== undefined && item.orderStatus.current !== null) ?
                              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                <Typography className={classes.modalTextInline} variant="body1" style={{ marginRight: 8 }}>Estatus:</Typography>
                                <Typography className={classes.modalTextInline} variant="body1" style={{ opacity: .54 }}>{item.orderStatus.steps[Number(item.orderStatus.current - 1)].name}</Typography>
                              </Grid>
                              :
                              ''
                          }
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Typography className={classes.modalTextInline} variant="body1" style={{ marginRight: 8 }}>Subtotal:</Typography>
                            <Typography className={classes.modalTextInline} variant="body1" style={{ opacity: .54 }}>${Utils.numberWithCommas(item.subtotal)}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    )
                  }))
                }
              </Grid>
            </div>
            :
            ''
        }
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {

  }
}

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(CalzzamovilDeliveryModal)
