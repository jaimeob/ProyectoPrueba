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
import { Table, TableBody, TableCell, TableRow, TableHead, TextField, IconButton, Snackbar } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'

import Empty from './Empty'
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

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
  imageProduct: {
    'object-fit': 'cover',
    width: 64,
    heigth: 64,
    marginRight: 4
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
  textFieldLarge: {
    width: '100%'
  },
  title: {
    marginTop: 8
  }
})

class KitDetailModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      kit: null
    }
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose() {
    this.props.onCancel()
  }

  handleRender() {
    console.log('selected kit')
    console.log(this.props.data)
    if (this.props.data !== null) {
      this.setState({
        kit: this.props.data
      })
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
        <div style={getModalStyle()} className={classes.container}>
          {
            (this.state.kit !== null) ?
            <div>
              <Typography variant="h4" className={classes.modalTitle}>
                Detalle del Kit.
              </Typography>
              {
                (this.props.order !== undefined) ?
                <Grid container style={{ marginTop: 8 }}>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Typography variant="body1">Folio de la solicitud: <strong>#{this.props.order.folio}</strong></Typography>
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Typography variant="body1">Estatus: <strong style={{ backgroundColor: Utils.getStatusColor(this.props.order.pipelineCode), marginTop: -4, padding: 6, borderRadius: 10, color: 'white', fontSize: 12 }}>{this.props.order.pipelineName}</strong></Typography>
                  </Grid>
                </Grid>
                :
                ''
              }
              <Grid container style={{ marginTop: 8 }}>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Paper className={classes.paper}>
                    <Grid container>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 12 }}>
                        {
                          (this.state.kit.data.kit.products.length > 0) ?
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell className={classes.contentCell} ></TableCell>
                                <TableCell className={classes.contentCell}>
                                  <Typography variant="body1"><strong>Descripción</strong></Typography>
                                </TableCell>
                                <TableCell className={classes.contentCell}>
                                  <Typography variant="body1"><strong>Cant.</strong></Typography>
                                </TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {
                                this.state.kit.data.kit.products.map((product, idx) => {
                                  return (
                                    <TableRow>
                                      <TableCell className={classes.contentCell} >
                                        {
                                          (Utils.isEmpty(product.image)) ?
                                          ''
                                          :
                                          <img className={classes.imageProduct} src={Utils.constants.HOST + product.image} alt={product.name} />
                                        }
                                      </TableCell>
                                      <TableCell className={classes.contentCell} >
                                        <span>{product.name}</span>
                                        <br />
                                        <strong>{product.sku}</strong>
                                      </TableCell>
                                      <TableCell className={classes.contentCell}>{product.quantity}</TableCell>
                                      <TableCell className={classes.contentCell}></TableCell>
                                    </TableRow>
                                  )
                                })
                              }
                            </TableBody>
                          </Table>
                          :
                          <Empty
                            title="¡Sin productos!"
                            description="El kit no cuenta con productos."
                          />
                        }
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
              <div className={classes.actions}>
                {
                  (this.props.order.pipelineName === 'SOLICITUD PAGADA') ?
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
        </div>
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
)(KitDetailModal)
