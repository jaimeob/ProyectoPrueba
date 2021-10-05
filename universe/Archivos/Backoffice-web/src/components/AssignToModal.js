import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Components
import Autocomplete from './Autocomplete'

//
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
  smallForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 5,
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  largeForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing.unit * 100,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 5,
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  modalTitle: {
    fontSize: 28,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    },
    fontWeight: 600
  },
  form: {
    marginTop: 16
  },
  textFieldForm: {
    marginTop: 16
  },
  select: {
    marginTop: 16
  },
  textField: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'white',
  },
  actions: {
    float: 'right',
    marginTop: 32,
    [theme.breakpoints.down('sm')]: {
      paddingBottom: 16
    },
  },
  primaryButton: {
    fontWeight: 600,
    fontSize: 14
  },
  fileContainer: {
    backgroundColor: '#E9EEF1',
    marginTop: 16
  },
  previewImage: {
    'object-fit': 'cover',
    width: 100,
    heigth: 100
  }
})

class AssignToModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      orderId: null,
      values: {
        values: {
          assignedBy: null
        }
      }
    }

    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.handleChangeValues = this.handleChangeValues.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
  }

  handleChangeValues(param, event) {
    let values = this.state.values
    values[param] = event.target.value
    this.setState({
      values: values
    })
  }

  handleChangeValueSelect(param, newValue) {
    let values = this.state.values
    if (newValue !== null) {
      values[param] = newValue.id
    }
    else {
      values[param] = null
    }
    this.setState({
      values: values
    })
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.handleConfirm()
    }
  }

  async handleConfirm() {
    let error = false
    
    let errorMessage = Utils.messages.General.formRequired

    if (this.state.values.officeId === null) {
      error = true
      errorMessage = 'Seleccione un despacho.'
    }
    else if (Number(this.state.values.amount) <= 0) {
      error = true
      errorMessage = 'El monto a asignar debe ser mayor a cero.'
    }
    else if (Number(this.state.values.amount) > (this.state.account.debit - this.state.account.totalTurn)) {
      error = true
      errorMessage = 'El monto a asignar debe ser menor o igual a: $' + Utils.numberWithCommas(Number(this.state.account.debit - this.state.account.totalTurn).toFixed(2))
    }

    if (error) {
      this.setState({
        openSnack: error,
        messageSnack: errorMessage
      })
    }
    else {
      let user = await Utils.getCurrentUser()
      let response = await requestAPI({
        host: this.props.host,
        method: 'POST',
        resource: 'portfolio',
        endpoint: '/turn',
        data: {
          account: this.state.account,
          officeId: this.state.values.officeId,
          turnedBy: user.id,
          amount: this.state.values.amount,
          comments: this.state.values.comments
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.OfficeForm.addOk
        }, function() {
          this.props.history.push(Utils.constants.paths.turn)
        })
      }
      else {
        let messageSnack = Utils.messages.General.error
        if (response.data.error.errno === 1062) {
          messageSnack = Utils.messages.General.duplicateError
        }
        this.setState({
          openSnack: true,
          messageSnack: messageSnack
        })
      }
    }
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  clearData() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    }) 
  }

  handleRender() {
    this.setState({
      orderId: this.props.data.id,
      values: {
        assignedBy: null
      }
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
          (this.props.data !== null) ?
          <div style={getModalStyle()} className={classes.smallForm}>
            <Typography variant="h4" className={classes.modalTitle}>
              Asignar solicitud.
            </Typography>
            <Typography variant="body1">
              Asigna una solicitud a un colaborador para su seguimiento.
            </Typography>
            <Grid container style={{ marginTop: 8 }}>
                <strong>SOLICITUD: #{this.props.data.order}</strong>
                <strong style={{ backgroundColor: Utils.getStatusColor(this.props.data.pipelineName), marginTop: -4, marginLeft: 8, padding: 6, borderRadius: 10, color: 'white', fontSize: 12}}>{this.props.data.pipelineName}</strong>
              </Grid>
            <form className={classes.form} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
              <div className={classes.select}>
                <Autocomplete
                  label="Colaboradores"
                  host={Utils.constants.HOST}
                  resource="users"
                  param="email"
                  value={this.state.values.assignedBy}
                  onChange={(newValue) => this.handleChangeValueSelect('assignedBy', newValue)}
                />
              </div>
              <div className={classes.textFieldForm}>
                <Typography variant="body1"><strong>Comentarios:</strong></Typography>
                <TextField
                  disabled={this.state.textInputDisabled}
                  placeholder="Comentarios..."
                  className={classes.textField}
                  value={this.state.comments}
                  onChange={(event) => { this.handleChangeValues('comments', event) }}
                  type="text"
                />
              </div>
              <div className={classes.actions}>
                <Button
                    onClick={this.handleClose}
                  >
                    CANCELAR
                </Button>
                <Button
                  style={{marginLeft: 16}}
                  className={classes.primaryButton}
                  variant="contained"
                  color="primary"
                  onClick={this.handleConfirm}
                >
                  CONFIRMAR
                </Button>
              </div>
            </form>
            <Snackbar
              autoHideDuration={5000}
              anchorOrigin={{vertical: 'top', horizontal: 'center'}}
              open={this.state.openSnack}
              onClose={this.handleCloseSnackbar}
              message={
                <span>{this.state.messageSnack}</span>
              }
              action={[
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={this.handleCloseSnackbar}
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
)(AssignToModal)
