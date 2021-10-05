import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'

import Utils from '../resources/Utils'
import TableCRUD from './TableCRUD'

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
    width: theme.spacing.unit * 120,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 5,
    [theme.breakpoints.down('xs')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingTop: '20%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  paper: {
    marginTop: 8,
    marginBottom: 16,
    padding: '8px 16px'
  },
  emojiAlias: {
    width: 14,
    marginRight: 4
  },
  modalTitle: {
    fontWeight: 600
  },
  largeTextField: {
    width: '100%',
    marginTop: 12
  },
  actions: {
    float: 'right',
    marginTop: 32
  },
  primaryButton: {
    marginLeft: 16,
    fontWeight: 600,
    fontSize: 14
  },
  title: {
    marginTop: 8
  }
})

class OrderDetailModal extends Component {
  constructor(props) {
    super(props)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.getPensionary = this.getPensionary.bind(this)
  }

  getPensionary(data) {
    if (Number(data) === 0) {
      return '❌'
    }
    return '✅'
  }

  handleClose() {
    this.props.handleClose()
  }

  handleRender() {
    if (this.props.data !== null) {
      this.props.history.push('/solicitudes/' + this.props.data.order + '/detalle' )
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >
        {
          (this.props.data !== null) ?
          <div style={getModalStyle()} className={classes.container}>
            <Typography variant="h4" className={classes.modalTitle}>
              Entrega.
            </Typography>
            <Grid container style={{ marginTop: 8 }}>
              <strong>SOLICITUD: #{this.props.data.order}</strong>
              <strong style={{ backgroundColor: Utils.getStatusColor(this.props.data.pipelineName), marginTop: -4, marginLeft: 8, padding: 6, borderRadius: 10, color: 'white', fontSize: 12}}>{this.props.data.pipelineName}</strong>
            </Grid>
            <Paper className={classes.paper}>
              <Grid container>
                <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                  <Typography variant="body1" className={classes.title}>$ {Utils.numberWithCommas(Number(this.props.data.subtotal).toFixed(2))}</Typography>
                  <Typography variant="body1"><strong>Subtotal</strong></Typography>
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                  <Typography variant="body1" className={classes.title}>$ {Utils.numberWithCommas(Number(this.props.data.discount).toFixed(2))}</Typography>
                  <Typography variant="body1"><strong>Descuento</strong></Typography>
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                  <Typography variant="body1" className={classes.title}>$ {Utils.numberWithCommas(Number(this.props.data.shippingCost).toFixed(2))}</Typography>
                  <Typography variant="body1"><strong>Costo de envío</strong></Typography>
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                  <Typography variant="body1" className={classes.title}>$ {Utils.numberWithCommas(Number(this.props.data.total).toFixed(2))}</Typography>
                  <Typography variant="body1"><strong>Total</strong></Typography>
                </Grid>
              </Grid>
            </Paper>
            <Typography variant="h6"><strong>Artículos.</strong></Typography>
            <Grid container>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <TableCRUD
                  data={this.props.data.detail}
                  params={[
                    {
                      title: "",
                      name: "image",
                      type: "image",
                      responsive: "xl"
                    },
                    {
                      title: "Código lote",
                      name: "productCode",
                      type: "string",
                      responsive: "xl"
                    },
                    {
                      title: "Artículo",
                      name: "productArticleCode",
                      type: "string",
                      responsive: "xl"
                    },
                    {
                      title: "Descripción",
                      name: "productDescription",
                      type: "string",
                      responsive: "xl"
                    },
                    {
                      title: "Cantidad",
                      name: "quantity",
                      type: "number",
                      responsive: "xl"
                    },
                    {
                      title: "Talla",
                      name: "size",
                      type: "number",
                      responsive: "xl"
                    },
                    {
                      title: "Precio",
                      name: "unitPrice",
                      type: "money",
                      responsive: "xl"
                    }
                  ]}
                />
              </Grid>
            </Grid>
            <div className={classes.actions}>
              {
                (this.props.data.pipelineName === 'SOLICITUD PAGADA') ?
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleClose}
                >
                  <strong>EMPEZAR PREPARACIÓN</strong>
                </Button>
                :
                ''
              }
              <Button
                  onClick={this.handleClose}
                >
                CERRAR
              </Button>
            </div>
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
)(OrderDetailModal)
