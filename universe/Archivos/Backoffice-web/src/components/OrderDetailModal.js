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
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import ReactImageMagnify from 'react-image-magnify'

import Empty from './Empty'
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
  first: {
    paddingRight: 32,
    [theme.breakpoints.down('sm')]: {
      padding: 0
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
  }

  handleClose() {
    this.props.handleClose()
  }

  handleRender() {
    console.log(this.props.data)
    if (this.props.data !== null && this.props.data.address !== null) {
      this.props.history.push('/solicitudes/' + this.props.data.folio + '/detalle' )
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
            <Paper style={{ position: 'fixed', top: 0, left: 0 }} id="imageZoomFrame"></Paper>
            <Typography variant="h4" className={classes.modalTitle}>
              Detalle de la solicitud.
            </Typography>

            <Grid container style={{ marginTop: 8 }}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="body1">Folio de la solicitud: <strong>#{this.props.data.folio}</strong></Typography>              
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="body1">Estatus: <strong style={{ backgroundColor: Utils.getStatusColor(this.props.data.pipelineCode), marginTop: -4, padding: 6, borderRadius: 10, color: 'white', fontSize: 12 }}>{this.props.data.pipelineName}</strong></Typography>
              </Grid>
            </Grid>
            <Grid container style={{ marginTop: 8 }}>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={classes.first}>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="h6"><strong>Notas de la solicitud.</strong></Typography>
                      <Typography variant="body2" style={{ fontSize: 13 }}>Lista de notas capturados en la solicitud.</Typography>
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 12 }}>
                      {
                        (this.props.data.notes.length > 0) ?
                        <Table>
                          <TableBody>
                            {
                              this.props.data.notes.map((item, idx) => {
                                return (
                                  <TableRow style={{ maxHeight: 28, height: 28, minHeight: 28 }}>
                                    <TableCell><span>🖊</span> {item.note}</TableCell>
                                  </TableRow>
                                )
                              })
                            }
                          </TableBody>
                        </Table>
                        :
                        <Empty
                          title="¡No hay notas!"
                          description="No se han agregado notas a la solicitud."
                        />
                      }
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="h6"><strong>Documentos de la solicitud.</strong></Typography>
                      <Typography variant="body2" style={{ fontSize: 13 }}>Lista de documentos capturadas en la solicitud.</Typography>
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 12 }}>
                      {
                        (this.props.data.documents.length > 0) ?
                        this.props.data.documents.map((item, idx) => {
                          return (
                            <div style={{ width: 72, float: 'left', paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}>
                              <ReactImageMagnify
                                {
                                  ...{
                                    smallImage: {
                                      isFluidWidth: true,
                                      src: Utils.constants.HOST + item.url
                                    },
                                    largeImage: {
                                      src: Utils.constants.HOST + item.url,
                                      width: 1022,
                                      height: 700
                                    },
                                    enlargedImageContainerDimensions: { width: 600, height: 300 },
                                    enlargedImagePortalId: 'imageZoomFrame',
                                    isEnlargedImagePortalEnabledForTouch: false,
                                    shouldUsePositiveSpaceLens: false
                                  }
                                }
                              />
                            </div>
                          )
                        })
                        :
                        <Empty
                          title="¡No hay documentos!"
                          description="No se han agregado documentos a la solicitud."
                        />
                      }
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              {
                (this.props.data.lines.length > 0) ?
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Paper className={classes.paper}>
                    <Grid container>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <Typography variant="h6"><strong>Productos asociados a la solicitud.</strong></Typography>
                        <Typography variant="body2" style={{ fontSize: 13 }}>Lista de productos surtidos y consumidos en la solicitud.</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                :
                ''
              }
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
