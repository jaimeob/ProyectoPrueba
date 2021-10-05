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
    width: theme.spacing.unit * 80,
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

class CustomerInfoModal extends Component {
  constructor(props) {
    super(props)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose() {
    this.props.handleClose()
  }

  handleRender() {
    if (this.props.data !== null && this.props.data.address !== null) {
      this.props.history.push('/solicitudes/' + this.props.data.folio + '/entrega' )
    } else {
      this.props.history.push('/solicitudes')
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
          (this.props.data !== null && this.props.data.address !== null) ?
          <div style={getModalStyle()} className={classes.container}>
            <Typography variant="h4" className={classes.modalTitle}>
              Información de entrega.
            </Typography>
            <Grid container style={{ marginTop: 8 }}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="body1">Folio de la solicitud: <strong>#{this.props.data.folio}</strong></Typography>              
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="body1">Estatus: <strong style={{ backgroundColor: Utils.getStatusColor(this.props.data.pipelineCode), marginTop: -4, padding: 6, borderRadius: 10, color: 'white', fontSize: 12 }}>{this.props.data.pipelineName}</strong></Typography>
              </Grid>
            </Grid>
            <Paper className={classes.paper}>
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.address.street}</Typography>
                  <Typography variant="body1"><strong>Calle</strong></Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.address.betweenStreets || 'N/A'}</Typography>
                  <Typography variant="body1"><strong>Entre calles</strong></Typography>
                </Grid>
                <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.address.exteriorNumber}</Typography>
                  <Typography variant="body1"><strong>Número exterior</strong></Typography>
                </Grid>
                <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.address.interiorNumber || 'N/A' }</Typography>
                  <Typography variant="body1"><strong>Número interior</strong></Typography>
                </Grid>
                <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.address.zip}</Typography>
                  <Typography variant="body1"><strong>Código postal</strong></Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.address.locationType + ' ' + this.props.data.address.location}</Typography>
                  <Typography variant="body1"><strong>Locación (colonia)</strong></Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.address.state}</Typography>
                  <Typography variant="body1"><strong>Estado</strong></Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1" className={classes.title}>{this.props.data.address.municipality}</Typography>
                  <Typography variant="body1"><strong>Ciudad</strong></Typography>
                </Grid>
              </Grid>
            </Paper>
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
)(CustomerInfoModal)
