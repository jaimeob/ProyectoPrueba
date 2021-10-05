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
    width: theme.spacing.unit * 60,
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

class OrderInfoModal extends Component {
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
      this.props.history.push('/solicitudes/' + this.props.data.folio + '/info' )
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
              Datos generales.
            </Typography>
            <Grid container style={{ marginTop: 8 }}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="body1">Folio de la solicitud: <strong>#{this.props.data.folio}</strong></Typography>              
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="body1">Estatus: <strong style={{ backgroundColor: Utils.getStatusColor(this.props.data.pipelineCode), marginTop: -4, padding: 6, borderRadius: 10, color: 'white', fontSize: 12 }}>{this.props.data.pipelineName}</strong></Typography>
              </Grid>
            </Grid>
            <Paper className={classes.paper} style={{ marginTop: 12 }}>
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.requester}</Typography>
                  <Typography variant="body1"><strong>Solicitante</strong></Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.hospital}</Typography>
                  <Typography variant="body1"><strong>Hospital</strong></Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.doctor}</Typography>
                  <Typography variant="body1"><strong>Doctor</strong></Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.patient}</Typography>
                  <Typography variant="body1"><strong>Paciente</strong></Typography>
                </Grid>
              </Grid>
            </Paper>
            <Paper className={classes.paper}>
              <Grid container>
                <Grid item xl={6} lg={6} md={6} sm={6} xs={6}>
                  <Typography variant="body1" className={classes.title}>{Utils.onlyDate(this.props.data.createdAt)}</Typography>
                  <Typography variant="body1"><strong>Fecha de captura</strong></Typography>
                </Grid>
                <Grid item xl={6} lg={6} md={6} sm={6} xs={6}>
                  <Typography variant="body1" className={classes.title}>{Utils.onlyDate(this.props.data.deliveryDate)}</Typography>
                  <Typography variant="body1"><strong>Fecha de cirugía</strong></Typography>
                </Grid>
              </Grid>
            </Paper>
            <Paper className={classes.paper}>
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.capturist}</Typography>
                  <Typography variant="body1"><strong>Capturado por</strong></Typography>
                </Grid>
              </Grid>
            </Paper>
            <div className={classes.actions}>
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
)(OrderInfoModal)
