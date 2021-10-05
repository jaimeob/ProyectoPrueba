import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'

import SignUp from '../modules/SignUp/SignUpFormView'

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
    width: theme.spacing(50),
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
    fontWeight: 200
  },
  actions: {
    float: 'right',
    marginTop: 32,
    [theme.breakpoints.down('sm')]: {
      paddingBottom: 16
    }
  },
  closeButton: {
    float: 'right',
    [theme.breakpoints.down('sm')]: {
      marginTop: 8
    }
  },
  primaryButton: {
    fontWeight: 600,
    fontSize: 14
  }
})

class SignUpModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      errorMessage: ''
    }

    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.clearData = this.clearData.bind(this)
  }

  handleChangeLocation(event) {
    let location = event.target.value
    this.setState({
      selectedLocation: location
    })
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      errorMessage: ''
    })
  }

  handleClose() {
    this.clearData()
    this.props.close()
  }

  clearData() {
    this.setState({
      openSnack: false,
      errorMessage: ''
    })
  }

  render() {
    const self = this
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >
        <div style={getModalStyle()} className={classes.largeForm}>
          <SignUp />
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(SignUpModal)
