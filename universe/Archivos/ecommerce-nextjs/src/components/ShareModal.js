'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Button, Modal, Typography, Icon, Paper, Snackbar, IconButton, Select, TextField } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { Rating } from '@material-ui/lab'

//
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

import {
  FacebookIcon,
  FacebookShareButton,
  PinterestIcon,
  PinterestShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton
} from "react-share"

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
    width: theme.spacing(80),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    [theme.breakpoints.down('xs')]: {
      top: 0,
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
    fontSize: 18,
    fontWeight: 500,
    color: '#111110'
  },
  media: {
    width: 160
  },
  title: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'normal',
    color: '#111110'
  },
  description: {
    fontSize: 14,
    fontWeight: 300,
    color: '#111110'
  },
  ratingContainer: {
    margin: '8px 0',
	},
	ratingComponent: {
		float: 'left',
    marginLeft: -3
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
    textTransform: 'none',
    fontWeight: 600,
    fontSize: 14
  },
  textFieldLarge: {
    width: '100%'
  },
  closeButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#006FB9',
    textTransform: 'none',
    margin: 0,
    padding: 0,
    [theme.breakpoints.down('sm')]: {
      marginTop: 8
    }
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

class ShareModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      openSnack: false,
      messageSnack: '',
      rating: 0,
      images: [],
      values: {
        title: '',
        message: ''
      }
    }

    this.handleChangeValues = this.handleChangeValues.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.sendOpinion = this.sendOpinion.bind(this)
    this.confirmUploader = this.confirmUploader.bind(this)
  }

  async sendOpinion() {
    this.setState({ loading: true })
    if (this.state.rating <= 0) {
      this.setState({
        loading: false,
        openSnack: true,
        messageSnack: 'Es importante calificar el producto con estrellas.'
      })
      return
    }

    if (!Utils.isUserLoggedIn()) {
      window.location.href = '/ingreso?review=' + this.props.data.url
    } else {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'products',
        endpoint: '/review',
        data: {
          productCode: this.props.data.code,
          rating: this.state.rating,
          title: this.state.values.title,
          message: this.state.values.message,
          photos: this.state.images
        }
      })

      let success = false
      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.created) {
          success = true
        }
      }

      if (success) {
        this.props.closeWithSuccess()
      } else {
        this.setState({
          loading: false,
          openSnack: true,
          messageSnack: 'No se ha podido enviar tu opinión. Intenta de nuevo más tarde.'
        })
      }
    }
  }

  confirmUploader(images) {
    this.setState({
      openImagesUploader: false,
      images: images
    })
  }

  handleChangeValues(param, event) {
    let values = this.state.values
    values[param] = event.target.value

    if (param === 'title') {
      if (values.title.trim().length > 100) {
        return
      }
    }

    if (param === 'message') {
      if (values.message.trim().length > 400) {
        return
      }
    }

    this.setState({
      values: values
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
      messageSnack: ''
    })
  }

  handleClose() {
    this.clearData()
    this.props.close()
  }

  clearData() {
    this.setState({
      loading: false,
      openSnack: false,
      messageSnack: '',
      rating: 0,
      images: [],
      values: {
        title: '',
        message: ''
      }
    })
  }

  handleRender() {
    this.clearData()
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
        <div style={getModalStyle()} className={`${classes.container} ${classes.scrollBar}`}>
          <Grid container className={classes.innerContainer}>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Button onClick={this.handleClose} className={classes.closeButton}><Icon style={{ marginRight: 4 }}>arrow_back</Icon> Volver al producto</Button>
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
              <Typography variant="body1" className={classes.modalTitle}>
                Compartir en redes sociales.
              </Typography>
              <Typography variant="body2" className={classes.description}>
                Comparte en Facebook, Telegram, Twitter y WhatsApp con un solo click.
              </Typography>
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                <li style={{ float: 'left', marginRight: 16 }}>
                <FacebookShareButton quote={"¡Descubri este increible producto en " + this.props.app.data.alias + "!"} url={'https://' + this.props.app.data.domain + this.props.url}>
                  <FacebookIcon size={44} round={true} />
                </FacebookShareButton>
                </li>
                <li style={{ float: 'left', marginRight: 16 }}>
                <TelegramShareButton title={"¡Descubri este increible producto en " + this.props.app.data.alias + "!"} url={'https://' + this.props.app.data.domain + this.props.url}>
                  <TelegramIcon size={44} round={true} />
                </TelegramShareButton>
                </li>
                <li style={{ float: 'left', marginRight: 16 }}>
                <TwitterShareButton title={"¡Descubri este increible producto en " + this.props.app.data.alias + "!"} url={'https://' + this.props.app.data.domain + this.props.url}>
                  <TwitterIcon size={44} round={true} />
                </TwitterShareButton>
                </li>
                <li style={{ float: 'left', marginRight: 16 }}>
                <WhatsappShareButton title={"¡Descubri este increible producto en " + this.props.app.data.alias + "!"} separator=" -> " url={'https://' + this.props.app.data.domain + this.props.url}>
                  <WhatsappIcon size={44} round={true} />
                </WhatsappShareButton>
                </li>
              </ul>
            </Grid>
          </Grid>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(ShareModal)
