import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

// Utils
import Utils from '../resources/Utils'
import { editDataAPI } from '../api/CRUD'

const styles = theme => ({
  container: {
    padding: 16
  },
  largeTextField: {
    width: '100%',
    marginTop: 12
  },
  primaryButton: {
    marginLeft: 16,
    fontWeight: 600,
    fontSize: 14
  }
})

class CheckSupplyModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      authorizationCode: ''
    }
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  async handleConfirm() {
    if (this.state.authorizationCode === '9999') {
      let response = await editDataAPI({resource: this.props.resource, 
        data: {
          id: this.props.data.id,
          pipeline: 19
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        this.props.onConfirm()
      }
      else {
        let errorMessage = Utils.messages.General.error
        this.setState({
          openSnack: true,
          errorMessage: errorMessage
        })
      }
    
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Dialog
        open={this.props.open}
        onBackdropClick={this.props.onCancel}
        onEscapeKeyDown={this.props.onCancel}
      >
        <div className={classes.container}>
          <DialogTitle>
            <strong>Producto adicional.</strong>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Si necesitas producto adicional especificalo en el
              <br />
              siguiente campo.
            </DialogContentText>
            <TextField
              className={classes.largeTextField}
              type="text"
              label="Productos adicionales"
              placeholder="Productos adicionales..."
              onChange={(event) => { this.setState({observations: event.target.value}) }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.onCancel}>
              CANCELAR
            </Button>
            <Button 
              className={classes.primaryButton}
              color="primary"
              variant="contained"
              onClick={() => {this.props.onConfirm(this.state.observations)}}
            >
              CONFIRMAR
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(CheckSupplyModal)
