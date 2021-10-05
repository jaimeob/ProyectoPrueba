import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

// Utils
import Utils from '../resources/Utils'
import { deleteDataAPI } from '../api/CRUD'
import messages from '../resources/Messages.json'


const styles = theme => ({
  container: {
    padding: 16
  },
  primaryButton: {
    marginLeft: 16,
    fontWeight: 600,
    fontSize: 14
  }
})

class DeleteDialog extends Component {
  constructor(props) {
    super(props)
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  async handleConfirm() {
    let response = await deleteDataAPI({host: this.props.host, resource: this.props.resource, id: this.props.data.id})
    if (response.status === Utils.constants.status.SUCCESS) {
      this.props.onConfirm()
    }
    else {
      let errorMessage = 'Ocurrió un problema. Intenta de nuevo más tarde.'
      this.setState({
        openSnack: true,
        errorMessage: errorMessage
      })
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
            <strong>{this.props.title}</strong>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.props.description}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.onCancel}>
              {/* {messages.DeleteDialog.cancelButton} */}
              {messages.DeleteDialog.cancelButton}
            </Button>
            <Button 
              className={classes.primaryButton}
              color="primary"
              variant="contained"
              onClick={this.handleConfirm}
            >
              {/* {messages.DeleteDialog.confirmButton} */}
              {messages.DeleteDialog.confirmButton}
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    )
  }
}


const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
    return {
    }
}
export default compose(withStyles(styles),connect(mapStateToProps, mapDispatchToProps))(DeleteDialog)