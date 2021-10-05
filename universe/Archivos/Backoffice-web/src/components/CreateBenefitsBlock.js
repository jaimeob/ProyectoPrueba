import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Button, Modal, Typography, Paper, Grid, Icon, TextField, IconButton, Snackbar, Table, TableHead, TableBody, TableRow, TableCell} from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'

import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Empty from './Empty'

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

class CreateBenefitsBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      blockTypeId: null,
      blockId: null,
      identifier: '',
      title: '',
      message: '',
      callToActionText: '',
      callToActionUrl: ''
    }
    this.handleChangeIdentifier = this.handleChangeIdentifier.bind(this)
    this.handleChangeTitle = this.handleChangeTitle.bind(this)
    this.handleChangeMessage = this.handleChangeMessage.bind(this)
    this.handleChangeCallToActionText = this.handleChangeCallToActionText.bind(this)
    this.handleChangeCallToActionUrl = this.handleChangeCallToActionUrl.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseWithData = this.handleCloseWithData.bind(this)
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

  async handleCloseWithData() {
    if (this.state.identifier.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El identificador del bloque es obligatorio. Añade un identificador que identifique al nuevo bloque.'
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
          status: this.props.selectedBlock.status,
          configs: null,
          createdAt: this.props.selectedBlock.createdAt
        }
      } else {
        data = {
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          configs: null
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
          identifier: this.state.identifier,
          blockTypeId: 6
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
        identifier: this.props.selectedBlock.identifier
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
        this.props.history.push('/cms/nuevo/6')
      }
    }
  }

  clearData() {
    this.setState({
      banners: [],
      blockId: null,
      blockTypeId: null,
      identifier: '',
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
          <div style={getModalStyle()} className={classes.container}>
            <Typography variant="h4" className={classes.modalTitle}>
              Crear nuevo bloque de beneficios.
            </Typography>
            <Typography variant="body2">
              Ingresa los datos del nuevo bloque.
            </Typography>
            <Grid container style={{ marginTop: 8 }}>
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
                  onClick={this.handleCloseWithData}
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
)(CreateBenefitsBlock)
