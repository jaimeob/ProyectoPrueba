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
    let response = null
    
    if (this.props.data.deleteLandingBlock) {
      let data = this.props.data
      data.blocks.forEach((block, idx) => {
        if (block.id === data.item.id) {
          data.blocks.splice(idx, 1)
        }
      })
      response = await deleteDataAPI({
        host: this.props.host, resource: this.props.resource, id: this.props.data.id, data: {
          blocks: data.blocks
        }
      })
    } else {
      response = await deleteDataAPI({
        host: this.props.host, resource: this.props.resource, id: this.props.data.id, data: {
          status: false
        }
      })
    }

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
              {Utils.messages.DeleteDialog.cancelButton}
            </Button>
            <Button 
              className={classes.primaryButton}
              color="primary"
              variant="contained"
              onClick={this.handleConfirm}
            >
              {Utils.messages.DeleteDialog.confirmButton}
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
)(DeleteDialog)
