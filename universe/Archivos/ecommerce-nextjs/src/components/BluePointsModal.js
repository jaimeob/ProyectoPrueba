'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

//Material UI
import { withStyles } from '@material-ui/core/styles'
import { Modal, Button, Typography } from '@material-ui/core'

//Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import { setNewCode } from '../actions/actionBluePoints'

import Loading from './Loading'

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
    textAlign: 'center',
    overflowY: 'scroll',
    overflowX: 'hidden',
    position: 'absolute',
    width: theme.spacing(60),
    maxHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('xs')]: {
      background: 'white',
      minWidth: '100%',
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      maxHeight: '100%',
      paddingLeft: '2.5%',
      paddingRight: '2.5%'
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

class BluePointsModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoadingCode: true
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleRender = this.handleRender.bind(this)
  }

  handleClose() {
    this.props.handleClose()
  }

  async handleRender() {
    this.setState({ isLoadingCode: true })
    let bluePoints = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/bluepoints'
    })
    if (bluePoints.status === Utils.constants.status.SUCCESS) {
      this.props.setNewCode(bluePoints.data)
    }
    this.setState({ isLoadingCode: false })
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        className={classes.modalContainer}
        onRendered={this.handleRender}
      >
        <div style={getModalStyle()} className={classes.smallForm}>
          {
            (this.props.bluePoints !== undefined && this.props.bluePoints.data !== undefined && this.props.bluePoints.data !== null) ?
              <>
                {
                  (!this.state.isLoadingCode) ?
                    <>
                      <Button variant="text" onClick={() => {
                        this.props.handleClose()
                      }} style={{ position: 'absolute', top: 8, right: 8, float: 'right', padding: 8, border: '1px solid gray' }}>
                        Cerrar
                      </Button>
                      <Typography variant="h4" className={classes.modalTitle}>
                        <img style={{ width: 188 }} src="/monederoazul.svg" />
                      </Typography>
                      <div style={{ textAlign: 'center' }}>
                        <img style={{ width: 250 }} src={Utils.constants.CONFIG_ENV.HOST + this.props.bluePoints.data.qrImage || ''} />
                        <br />
                        <img style={{ width: 200 }} src={Utils.constants.CONFIG_ENV.HOST + this.props.bluePoints.data.barcodeImage || ''} />
                      </div>
                      <div style={{ marginTop: 12, padding: 16, border: '1px solid gray' }}>
                        Muestra el código en caja
                      </div>
                    </>
                    :
                    <Loading />
                }
              </>
              :
              ''
          }
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = {
  setNewCode
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(BluePointsModal)
