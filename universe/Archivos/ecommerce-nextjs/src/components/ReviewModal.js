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
import Uploader from './Uploader'

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

class ReviewModal extends Component {
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
                ¿Qué opinas del producto?
              </Typography>
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Paper className={classes.paper}>
                <Grid container>
                  <Grid item xl={4} lg={4} md={4} sm={4} xs={4}>
                    <img className={classes.media} src={ Utils.constants.HOST_CDN_AWS + '/normal/' + this.props.data.photos[0].description} alt={this.props.data.detail.title} />
                  </Grid>
                  <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                    <Typography variant="body1" className={classes.title}>{this.props.data.detail.title}</Typography>
                    <div className={classes.ratingContainer}>
                      <Rating
                        size="large"
                        className={classes.ratingComponent}
                        value={this.state.rating}
                        precision={0.5}
                        onChange={(event, newValue) => {
                          this.setState({
                            rating: newValue
                          })
                        }}
                      />
                    </div>
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Typography variant="body1" className={classes.title}>Foto del producto</Typography>
                    <Typography variant="body1" className={classes.description}>Las opiniones con foto suelen ser más útiles para otros compradores.</Typography>
                    {
                      (this.state.images.length > 0) ?
                        <div style={{ marginTop: 8 }}>
                          <label><strong>Imágenes agregadas:</strong> {this.state.images.length}</label>
                        </div>
                        :
                        ''
                    }
                    <Button variant="contained" className={classes.uploadButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                      this.setState({ openImagesUploader: true })
                    }}>
                      Subir foto del producto
                    </Button>
                    <Uploader
                      open={this.state.openImagesUploader}
                      host={Utils.constants.CONFIG_ENV.HOST}
                      title="Subir foto del producto."
                      description={"Sube tu foto de producto para que más compradores la vean (máximo 3 fotos)."}
                      limit={3}
                      use="reviews"
                      hideUse={true}
                      docs={this.state.images}
                      validFormats={['image/jpeg', 'image/jpg', 'image/png']}
                      hideComments={true}
                      maxSize={5000000}
                      handleCloseWithData={(images) => { this.confirmUploader(images) }}
                      handleClose={() => { this.setState({ openImagesUploader: false }) }}
                    />
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Typography variant="body1" className={classes.title}>Agrega un título ({this.state.values.title.length} / 100)</Typography>
                    <TextField
                      className={classes.textFieldLarge}
                      variant="outlined"
                      value={this.state.values.title}
                      onChange={ (event) => { this.handleChangeValues('title', event) } }
                      placeholder="¿Qué es lo más relevante de tu opinión?"
                    />
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Typography variant="body1" className={classes.title}>Opinión ({this.state.values.message.length} / 400)</Typography>
                    <TextField
                      className={classes.textFieldLarge}
                      variant="outlined"
                      value={this.state.values.message}
                      onChange={ (event) => { this.handleChangeValues('message', event) } }
                      placeholder="Agrega tu opinión completa aquí..."
                    />
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Button variant="contained" disabled={this.state.loading} color="primary" className={classes.uploadButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => { this.sendOpinion() } }>
                      Enviar opinión
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          <Snackbar
            autoHideDuration={10000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(ReviewModal)
