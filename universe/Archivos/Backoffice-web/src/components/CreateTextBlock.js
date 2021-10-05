'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Checkbox, Button, Modal, Typography, Paper, Grid, Icon, TextField, IconButton, Snackbar, Table, TableHead, TableBody, TableRow, TableCell} from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'

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
    [theme.breakpoints.down('xs')]: {
      paddingTop: '10%',
      paddingBottom: '10%',
      background: 'white',
      width: '100%',
      height: '100%'
    }
  },
  innerContainer: {
    padding: 32,
    [theme.breakpoints.down('xs')]: {
      padding: 8
    }
  },
  paper: {
    marginTop: 8,
    marginBottom: 16,
    padding: '8px 16px'
  },
  modalTitle: {
    fontWeight: 600
  },
  actions: {
    position: 'sticky',
    left: 0,
    bottom: 0,
    background: 'white',
    padding: '16px 0px',
    textAlign: 'right',
    width: '100%'
  },
  primaryButton: {
    marginLeft: 16,
    fontWeight: 600,
    fontSize: 14
  },
  uploadButton: {
    fontWeight: 600,
    fontSize: 14
  },
  textFieldLarge: {
    width: '100%'
  },
  scrollBar: {
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px'
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      'border-radius': '4px',
      'background-color': 'rgba(0,0,0,.5)',
      '-webkit-box-shadow': '0 0 1px hsla(0,0%,100%,.5)'
    }
  }
})

class CreateTextBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      blockTypeId: null,
      blockId: null,
      identifier: '',
      fullWidth: false,
      paddingTop: '0',
      paddingBottom: '0',
      textAlign: 'center',
      title: '',
      message: '',
      callToActionText: '',
      callToActionUrl: ''
    }
    
    this.handleChangePaddingTop = this.handleChangePaddingTop.bind(this)
    this.handleChangePaddingBottom = this.handleChangePaddingBottom.bind(this)
    this.handleChangeIdentifier = this.handleChangeIdentifier.bind(this)
    this.handleChangeTitle = this.handleChangeTitle.bind(this)
    this.handleChangeMessage = this.handleChangeMessage.bind(this)
    this.handleChangeCallToActionText = this.handleChangeCallToActionText.bind(this)
    this.handleChangeCallToActionUrl = this.handleChangeCallToActionUrl.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.createNewBlock = this.createNewBlock.bind(this)
  }

  handleChangePaddingTop(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        paddingTop: event.target.value.trim()
      })
    } else {
      this.setState({
        paddingTop: '0'
      })
    }
  }

  handleChangePaddingBottom(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        paddingBottom: event.target.value.trim()
      })
    } else {
      this.setState({
        paddingBottom: '0'
      })
    }
  }

  handleChangeIdentifier(event) {
    this.setState({
      identifier: event.target.value
    })
  }

  handleChangeTitle(event) {
    this.setState({
      title: event.target.value
    })
  }

  handleChangeMessage(event) {
    this.setState({
      message: event.target.value
    })
  }

  handleChangeCallToActionText(event) {
    this.setState({
      callToActionText: event.target.value
    })
  }

  handleChangeCallToActionUrl(event) {
    this.setState({
      callToActionUrl: event.target.value.trim()
    })
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  async createNewBlock() {
    if (this.state.identifier.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El identificador del bloque es obligatorio. Ingresa un identificador al nuevo bloque.'
      })
      return
    }

    if (this.state.callToActionText.length > 0 && this.state.callToActionUrl.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'La URL del CTA es obligatoria.'
      })
      return
    }

    if (this.state.callToActionUrl.length > 0 && this.state.callToActionText.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El texto del CTA es obligatorio.'
      })
      return
    }

    if (this.state.title.length <= 0 && this.state.message.length <= 0 && (this.state.callToActionText.length <= 0 || this.state.callToActionUrl.length <= 0)) {
      this.setState({
        openSnack: true,
        messageSnack: 'El bloque debe contener por lo menos título, mensaje o CTA.'
      })
      return
    }

    let response = null
    let data = {}
    if (this.props.editBlock) {
      if (this.props.landing) {
        data = {
          id: this.props.selectedBlock.id,
          landingId: this.props.selectedBlock.landingId,
          instanceId: this.props.selectedBlock.instanceId,
          position: this.props.selectedBlock.position,
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          v: this.props.selectedBlock.v,
          status: this.props.selectedBlock.status,
          configs: {
            fullWidth: this.state.fullWidth,
            textAlign: this.state.textAlign,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            title: this.state.title,
            message: this.state.message,
            callToActionText: this.state.callToActionText,
            callToActionUrl: this.state.callToActionUrl
          },
          createdAt: this.props.selectedBlock.createdAt
        }
      } else {
        data = {
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          configs: {
            fullWidth: this.state.fullWidth,
            textAlign: this.state.textAlign,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            title: this.state.title,
            message: this.state.message,
            callToActionText: this.state.callToActionText,
            callToActionUrl: this.state.callToActionUrl
          }
        }
      }

      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'PATCH',
        resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
        endpoint: (this.props.landing !== undefined && this.props.landing) ?
          '/' + this.props.selectedBlock.landingId + '/edit'
          :
          '/' + this.state.blockId + '/edit',
        data: data
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.updated) {
          this.clearData()
          this.props.handleCloseWithData()
        }
      } else {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.error
        })
      }
    } else {
      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
        endpoint: (this.props.landing !== undefined && this.props.landing) ? '/' + this.props.match.params.id + '/new' : '/new',
        data: {
          blockTypeId: 1,
          identifier: this.state.identifier,
          fullWidth: this.state.fullWidth,
          textAlign: this.state.textAlign,
          paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
          paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
          title: this.state.title,
          message: this.state.message,
          callToActionText: this.state.callToActionText,
          callToActionUrl: this.state.callToActionUrl
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.created) {
          this.clearData()
          this.props.handleCloseWithData()
        }
      } else {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.error
        })
      }
    }
  }

  handleRender() {
    this.clearData()
    if (this.props.editBlock && this.props.selectedBlock !== null) {
      this.setState({
        blockTypeId: this.props.selectedBlock.blockTypeId,
        blockId: this.props.selectedBlock.id,
        identifier: this.props.selectedBlock.identifier,
        fullWidth: this.props.selectedBlock.configs.fullWidth,
        textAlign: this.props.selectedBlock.configs.textAlign,
        paddingTop: String(this.props.selectedBlock.configs.paddingTop) || '0',
        paddingBottom: String(this.props.selectedBlock.configs.paddingBottom) || '0',
        title: this.props.selectedBlock.configs.title,
        message: this.props.selectedBlock.configs.message,
        callToActionText: (this.props.selectedBlock.configs.cta !== null) ? this.props.selectedBlock.configs.cta.text : '',
        callToActionUrl: (this.props.selectedBlock.configs.cta !== null) ? this.props.selectedBlock.configs.cta.link : '',
      })
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/editar/' + this.props.selectedBlock.id)
      } else {
        this.props.history.push('/cms/' + this.props.selectedBlock.id + '/editar')
      }
    } else {
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/bloques/nuevo/1')
      } else {
        this.props.history.push('/cms/nuevo/1')
      }
    }
  }

  clearData() {
    this.setState({
      openSnack: false,
      messageSnack: '',
      blockTypeId: null,
      blockId: null,
      identifier: '',
      fullWidth: false,
      paddingTop: '0',
      paddingBottom: '0',
      textAlign: 'center',
      title: '',
      message: '',
      callToActionText: '',
      callToActionUrl: ''
    })
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
          (!this.props.editBlock || this.props.selectedBlock !== null) ?
          <div style={getModalStyle()} className={`${classes.container} ${classes.scrollBar}`}>
            <Grid container className={classes.innerContainer}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="h4" className={classes.modalTitle}>
                  Crear nuevo bloque de texto.
                </Typography>
                <Typography variant="body2">
                  Ingresa los datos del nuevo bloque.
                </Typography>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Typography variant="body1"><strong>Datos generales.</strong></Typography>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Identificador del bloque *"
                        placeholder="Identificador del bloque..."
                        value={this.state.identifier}
                        onChange={ (event) => { this.handleChangeIdentifier(event) } }
                        autoFocus={true}
                      />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxFullWidth" style={{ marginTop: -2 }} checked={this.state.fullWidth} onChange={() => { this.setState({ fullWidth: !this.state.fullWidth }) }} />
                      <label for="checkboxFullWidth"><strong>Full width</strong> (ancho completo)</label>
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1">
                        Alineación del texto.
                      </Typography>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxAlignLeft" style={{ marginTop: -2 }} checked={this.state.textAlign === 'left'} onChange={() => { this.setState({ textAlign: 'left' }) }} />
                      <label for="checkboxAlignLeft"><strong>Izquierda</strong></label>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxAlignCenter" style={{ marginTop: -2 }} checked={this.state.textAlign === 'center'} onChange={() => { this.setState({ textAlign: 'center' }) }} />
                      <label for="checkboxAlignCenter"><strong>Centro</strong></label>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxAlignRight" style={{ marginTop: -2 }} checked={this.state.textAlign === 'right'} onChange={() => { this.setState({ textAlign: 'right' }) }} />
                      <label for="checkboxAlignRight"><strong>Derecha</strong></label>
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8, paddingRight: 16 }}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Separación superior (top)"
                        placeholder="Indicar separación top banner..."
                        value={this.state.paddingTop}
                        onChange={(event) => { this.handleChangePaddingTop(event) }}
                      />
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8 }}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Separación inferior (bottom)"
                        placeholder="Indicar separación bottom banner..."
                        value={this.state.paddingBottom}
                        onChange={(event) => { this.handleChangePaddingBottom(event) }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1"><strong>Contenido del bloque.</strong></Typography>
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Título"
                        placeholder="Título..."
                        value={this.state.title}
                        onChange={ (event) => { this.handleChangeTitle(event) } }
                      />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Mensaje"
                        placeholder="Mensaje..."
                        value={this.state.message}
                        onChange={ (event) => { this.handleChangeMessage(event) } }
                      />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Call To Action (Texto)"
                        placeholder="CTA texto..."
                        value={this.state.callToActionText}
                        onChange={ (event) => { this.handleChangeCallToActionText(event) } }
                      />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Call To Action (URL)"
                        placeholder="CTA url..."
                        value={this.state.callToActionUrl}
                        onChange={ (event) => { this.handleChangeCallToActionUrl(event) } }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            <div className={classes.actions}>
              <Button
                onClick={this.handleClose}
              >
                CERRAR
              </Button>
              <Button
                  color="primary"
                  variant="contained"
                  onClick={this.createNewBlock}
                  className={classes.primaryButton}
                >
                CONFIRMAR
              </Button>
            </div>
            <Snackbar
              autoHideDuration={5000}
              anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
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

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(CreateTextBlock)
