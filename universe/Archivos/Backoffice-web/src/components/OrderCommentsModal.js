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
import { Table, TableBody, TableCell, TableRow, TextField, IconButton, Snackbar } from '@material-ui/core'
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

class OrderCommentsModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      comments: [],
      comment: ''
    }
    this.addComment = this.addComment.bind(this)
    this.handleChangeComment = this.handleChangeComment.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleChangeComment(event) {
    this.setState({
      comment: event.target.value
    })
  }

  async addComment(event) {
    event.preventDefault()
    let comment = this.state.comment.trim()
    if (!Utils.isEmpty(comment)) {
      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: 'orders',
        endpoint: '/comment',
        data: {
          orderId: this.props.data.id,
          comment: comment
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        let comments = this.state.comments
        comments.unshift(response.data.comment)
        this.setState({
          openSnack: true,
          messageSnack: 'Comentario agregado exitósamente.',
          comment: '',
          comments: comments
        })
      } else {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.error
        })
      }
    } else {
      this.setState({
        openSnack: true,
        messageSnack: 'No haz escrito un comentario.'
      })
    }
  }

  handleClose() {
    this.props.handleClose()
  }

  handleRender() {
    const self = this
    if (this.props.data !== null) {
      this.setState({
        comments: this.props.data.comments
      }, () => {
        console.log('ORDER')
        console.log(self.state.order)
        self.props.history.push('/solicitudes/' + self.props.data.folio + '/comentarios' )
      })
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
          (this.props.data !== null) ?
          <div style={getModalStyle()} className={classes.container}>
            <Paper style={{ position: 'fixed', top: 0, left: 0 }} id="imageZoomFrame"></Paper>
            <Typography variant="h4" className={classes.modalTitle}>
              Comentarios de la solicitud.
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
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body2" style={{ fontSize: 14 }}>Agrega un comentario a la solicitud.</Typography>
                    </Grid>
                    <Grid item xl={9} lg={9} md={9} sm={9} xs={9} style={{ marginTop: 8 }}>
                      <TextField
                        className={classes.textFieldLarge}
                        placeholder="Escribir comentario..."
                        value={this.state.comment}
                        onKeyPress={ (event) => { if (event.key === 'Enter') { this.addComment(event) } } }
                        onChange={ (event) => { this.handleChangeComment(event) } }
                      />
                    </Grid>
                    <Grid item xl={3} lg={3} md={3} sm={3} xs={3} style={{ paddingLeft: 8, marginTop: 8 }}>
                      <Button variant="contained" color="primary" className={classes.primaryButton} style={{ width: '100%', margin: 0 }} onClick={ (event) => { this.addComment(event) } }>
                        AGREGAR
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Paper className={classes.paper}>
                  <Grid container>
                    {
                      (this.state.comments.length > 0) ?
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <Typography variant="body2" style={{ fontSize: 14 }}>Lista de comentarios capturados en la solicitud.</Typography>
                      </Grid>
                      :
                      ''
                    }
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 12 }}>
                      {
                        (this.state.comments.length > 0) ?
                        <Table>
                          <TableBody>
                            {
                              this.state.comments.map((item, idx) => {
                                return (
                                  <TableRow style={{ maxHeight: 28, height: 28, minHeight: 28 }}>
                                    <TableCell>
                                      <strong>{item.comment}</strong>
                                      <br />
                                      <span style={{ fontSize: 11 }}>{item.email} - {Utils.onlyDate(item.createdAt)}</span>
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            }
                          </TableBody>
                        </Table>
                        :
                        <Empty
                          title="¡No hay comentarios!"
                          description="No se han agregado comentarios a la solicitud."
                        />
                      }
                    </Grid>
                  </Grid>
                </Paper>
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
            <Snackbar
              autoHideDuration={5000}
              anchorOrigin={{vertical: 'top', horizontal: 'center'}}
              open={this.state.openSnack}
              onClose={() => { this.setState({ openSnack: false, messageSnack: '' })}}
              message={
                <span>{this.state.messageSnack}</span>
              }
              action={[
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={() => { this.setState({ openSnack: false, messageSnack: '' })}}
                >
                  <CloseIcon />
                </IconButton>
              ]}
            />
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
)(OrderCommentsModal)
