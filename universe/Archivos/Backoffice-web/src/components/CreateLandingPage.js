'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { TextField, IconButton, Snackbar, Checkbox } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'

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

class CreateLandingPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      title: '',
      description: '',
      url: '/',
      catalog: '',
      showProducts: true
    }
    this.handleChangeTitle = this.handleChangeTitle.bind(this)
    this.handleChangeDescription = this.handleChangeDescription.bind(this)
    this.handleChangeURL = this.handleChangeURL.bind(this)
    this.handleChangeCatalog = this.handleChangeCatalog.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseWithData = this.handleCloseWithData.bind(this)
  }

  handleChangeTitle(event) {
    if (event.target.value.length <= 60) {
      this.setState({
        title: event.target.value
      })
    }
  }

  handleChangeDescription(event) {
    if (event.target.value.length <= 160) {
      this.setState({
        description: event.target.value
      })
    }
  }

  handleChangeURL(event) {
    let url = event.target.value.trim().substr(1, event.target.value.length - 1)
    url = Utils.generateURLWithSlash(url)
    this.setState({
      url: '/' + url
    })
  }

  handleChangeCatalog(event) {
    this.setState({
      catalog: event.target.value.trim()
    })
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  async handleCloseWithData() {
    if (this.state.title.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Ingresa un título válido.'
      })
      return
    }

    if (this.state.description.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Ingresa una descripción válida.'
      })
      return
    }

    if (this.state.url.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Ingresa una URL válida.'
      })
      return
    }

    if (!Utils.isEmpty(this.state.catalog) && !Utils.isExternalLink(this.state.catalog)) {
      this.setState({
        openSnack: true,
        messageSnack: 'Link incorrecto. Copia y pega el link desde Mis catálogos.'
      })
      return
    }

    let response = null
    if (this.props.edit) {
      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'PATCH',
        resource: 'landings',
        endpoint: '/update',
        data: {
          id: this.props.landing.id,
          title: this.state.title.trim(),
          description: this.state.description.trim(),
          url: this.state.url,
          catalog: this.state.catalog,
          showProducts: this.state.showProducts
        }
      })
    } else {
      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: 'landings',
        endpoint: '/new',
        data: {
          title: this.state.title.trim(),
          description: this.state.description.trim(),
          url: this.state.url,
          catalog: this.state.catalog,
          showProducts: this.state.showProducts
        }
      })
    }

    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data.added || response.data.updated) {
        this.clearData()
        this.props.handleCloseWithData()
      }
    } else {
      let messageError = Utils.messages.General.error

      if (response.data !== undefined) {
        if (response.data.error.message === '0001') {
          messageError = 'La URL ya está siendo utilizada.'
        } else if (response.data.error.message === '0002') {
          messageError = 'La URL no puede ser utilizada.'
        }
      }

      this.setState({
        openSnack: true,
        messageSnack: messageError
      })
    }
  }

  handleRender() {
    if (this.props.edit) {
      if (this.props.landing === undefined) {
        this.handleClose()
      } else {
        this.setState({
          title: this.props.landing.title,
          description: this.props.landing.description,
          url: this.props.landing.url,
          catalog: (!Utils.isEmpty(this.props.landing.catalog)) ? 'https://api.calzzapato.com/api/catalogs/' + this.props.landing.catalog + '/download' : '',
          showProducts: (this.props.landing.showProducts !== undefined) ? this.props.landing.showProducts : true
        }, () => {
          this.props.history.push('/landings/' + this.props.landing.id + '/editar')
        })
      }
    } else {
      this.clearData()
      this.props.history.push('/landings/nueva')
    }
  }

  clearData() {
    this.setState({
      url: '/',
      title: '',
      description: '',
      showProducts: true,
      catalog: ''
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
        <div style={getModalStyle()} className={classes.container}>
          <Typography variant="h4" className={classes.modalTitle}>{(this.props.edit) ? 'Editar Landing Page.' : 'Crear nueva Landing Page.'}</Typography>
          {
            (!this.props.edit) ?
            <Typography variant="body2">Ingresa la URL de la landing page.</Typography>
            :
            ''
          }
          <Grid container style={{ marginTop: 8 }}>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <TextField
                    className={classes.textFieldLarge}
                    label={"SEO title * (" + this.state.title.length + "/60)"}
                    placeholder="Ingresa el título de tu página (máximo 60 caracteres)..."
                    value={ this.state.title }
                    onChange={(event) => { this.handleChangeTitle(event) }}
                    autoFocus={true}
                  />
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                  <TextField
                    className={classes.textFieldLarge}
                    label={"SEO description * (" + this.state.description.length + "/160)"}
                    placeholder="Ingresa la descripción de tu página (máximo 160 caracteres)..."
                    value={ this.state.description }
                    onChange={(event) => { this.handleChangeDescription(event) }}
                  />
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                  <TextField
                    className={classes.textFieldLarge}
                    label="URL Landing Page *"
                    placeholder="Ejemplo: /mujeres/calzado, /marcas/adidas, etc."
                    value={ this.state.url }
                    onChange={(event) => { this.handleChangeURL(event) }}
                  />
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                  <TextField
                    className={classes.textFieldLarge}
                    label="¿Catálogo? (opcional)"
                    placeholder="Especificar catálogo, ejemplo: https://api.calzzapato.com:3000/api/catalogs/515af72e6ab04d2c93c928ac4dd6eec8c73ac6328e23782f35479b13b855942a/download"
                    value={this.state.catalog}
                    onChange={(event) => { this.handleChangeCatalog(event) }}
                  />
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
                  <Checkbox id="checkboxCheckProducts" checked={this.state.showProducts} onChange={ () => { this.setState({ showProducts: !this.state.showProducts })} } /> <label for="checkboxCheckProducts"><strong>Mostrar productos</strong> (abajo del contenido del landing page).</label>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <div className={classes.actions}>
            <Button onClick={this.handleClose}>CERRAR</Button>
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
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            open={this.state.openSnack}
            onClose={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
            message={
              <span>{this.state.messageSnack}</span>
            }
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
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
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(CreateLandingPage)
