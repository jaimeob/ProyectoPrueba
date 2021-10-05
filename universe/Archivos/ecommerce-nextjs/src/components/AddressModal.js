import React, { Component } from 'react'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'

// Components
import AddressFrom from './AddressForm'

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
    overflowY: 'scroll',
    position: 'absolute',
    width: theme.spacing(60),
    maxHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
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
    width: theme.spacing(100),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
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
  }
})

class AddressModal extends Component {
  constructor(props) {
    super(props)
    this.handleClose = this.handleClose.bind(this)
    this.handleRender = this.handleRender.bind(this)
  }

  handleClose() {
    this.props.handleClose()
  }

  handleRender() {
    if (this.props.data !== undefined && this.props.data !== null) {
      let values = this.props.data
      this.setState({
        values: values
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
        <div style={getModalStyle()} className={classes.smallForm}>
          <AddressFrom
            handleConfirmWithAddress={this.props.handleConfirmWithAddress}
            handleClose={this.handleClose}
            handleDeleteAddress={this.props.handleDeleteAddress}
            editAddress={this.props.editAddress}
            handleEditAddress={this.props.handleEditAddress}
          />
        </div>
      </Modal>
    )
  }
}

export default withStyles(styles)(AddressModal)
