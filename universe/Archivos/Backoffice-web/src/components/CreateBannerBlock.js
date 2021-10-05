'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Button, Modal, Typography, Paper, Grid, Icon, TextField, IconButton, Snackbar, Table, TableHead, TableBody, TableRow, TableCell, Checkbox } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'

import Empty from './Empty'
import Uploader from './Uploader'
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
    [theme.breakpoints.down('xs')]: {
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
    fontWeight: 600
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
    fontWeight: 600,
    fontSize: 14
  },
  textFieldLarge: {
    width: '100%'
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

class CreateBannerBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      openDesktopUploader: false,
      openMobileUploader: false,
      desktopDocs: [],
      mobileDocs: [],
      deletedDesktopDocs: [],
      deletedMobileDocs: [],
      banners: [],
      blockTypeId: null,
      blockId: null,
      identifier: '',
      fullWidth: false,
      paddingTop: '0',
      paddingBottom: '0',
      heightBanner: '600',
      heightBannerMobile: '600',
      seoDescription: '',
      callToAction: ''
    }
    this.handleChangeIdentifier = this.handleChangeIdentifier.bind(this)
    this.handleChangeSEODescription = this.handleChangeSEODescription.bind(this)
    this.handleChangeCallToAction = this.handleChangeCallToAction.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.confirmCreateBannerBlock = this.confirmCreateBannerBlock.bind(this)
    this.addBannerToCarousel = this.addBannerToCarousel.bind(this)
    this.deleteBanner = this.deleteBanner.bind(this)
    this.confirmDesktopUploader = this.confirmDesktopUploader.bind(this)
    this.confirmMobileUploader = this.confirmMobileUploader.bind(this)
    this.handleChangePaddingTop = this.handleChangePaddingTop.bind(this)
    this.handleChangePaddingBottom = this.handleChangePaddingBottom.bind(this)
    this.handleChangeHeightBanner = this.handleChangeHeightBanner.bind(this)
    this.handleChangeHeightBannerMobile = this.handleChangeHeightBannerMobile.bind(this)
  }

  confirmDesktopUploader(docs, deletedDocs) {
    this.setState({
      openDesktopUploader: false,
      desktopDocs: docs,
      deletedDesktopDocs: deletedDocs
    })
  }

  confirmMobileUploader(docs, deletedDocs) {
    this.setState({
      openMobileUploader: false,
      mobileDocs: docs,
      deletedMobileDocs: deletedDocs
    })
  }

  handleChangeIdentifier(event) {
    this.setState({
      identifier: event.target.value
    })
  }

  handleChangeSEODescription(event) {
    this.setState({
      seoDescription: event.target.value
    })
  }

  handleChangeCallToAction(event) {
    this.setState({
      callToAction: event.target.value.trim()
    })
  }

  handleChangePaddingTop(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        paddingTop: event.target.value.trim()
      })
    } else {
      this.setState({
        paddingTop: '0'
      })
    }
  }

  handleChangePaddingBottom(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        paddingBottom: event.target.value.trim()
      })
    } else {
      this.setState({
        paddingBottom: '0'
      })
    }
  }

  handleChangeHeightBanner(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        heightBanner: event.target.value.trim()
      })
    } else {
      this.setState({
        heightBanner: '600'
      })
    }
  }

  handleChangeHeightBannerMobile(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        heightBannerMobile: event.target.value.trim()
      })
    } else {
      this.setState({
        heightBannerMobile: '600'
      })
    }
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  async confirmCreateBannerBlock() {
    if (this.state.identifier.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El identificador del bloque es obligatorio. Ingresa un identificador al nuevo bloque.'
      })
      return
    }

    if (!isNaN(this.state.heightBanner.trim()) && Number(this.state.heightBanner.trim()) > 800) {
      this.setState({
        openSnack: true,
        messageSnack: 'Altura incorrecta. Altura máxima 800px.'
      })
      return
    }

    if (!isNaN(this.state.heightBannerMobile.trim()) && Number(this.state.heightBannerMobile.trim()) > 800) {
      this.setState({
        openSnack: true,
        messageSnack: 'Altura mobile incorrecta. Altura máxima 800px.'
      })
      return
    }

    if (this.state.banners.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'No se han agregado banners al bloque.'
      })
      return
    }

    let response = null
    let data = {}
    if (this.props.editBlock) {
      if (this.props.landing) {
        data = {
          id: this.props.selectedBlock.id,
          landingId: this.props.selectedBlock.landingId,
          instanceId: this.props.selectedBlock.instanceId,
          position: this.props.selectedBlock.position,
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          status: this.props.selectedBlock.status,
          v: this.props.selectedBlock.v,
          configs: {
            fullWidth: this.state.fullWidth,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 0,
            heightBannerMobile: !Utils.isEmpty(this.state.heightBannerMobile) ? Number(this.state.heightBannerMobile) : 0,
            banners: this.state.banners
          },
          createdAt: this.props.selectedBlock.createdAt
        }
      } else {
        data = {
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          configs: {
            fullWidth: this.state.fullWidth,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 0,
            heightBannerMobile: !Utils.isEmpty(this.state.heightBannerMobile) ? Number(this.state.heightBannerMobile) : 0,
            banners: this.state.banners
          }
        }
      }

      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'PATCH',
        resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
        endpoint: (this.props.landing !== undefined && this.props.landing) ?
          '/' + this.props.selectedBlock.landingId + '/edit'
          :
          '/' + this.state.blockId + '/edit',
        data: data
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.updated) {
          this.clearData()
          this.props.handleCloseWithData()
        }
      } else {
        let messageError = Utils.messages.General.error
        if (response.data.error !== undefined && response.data.error.message !== undefined) {
          messageError = response.data.error.message
        }
        this.setState({
          openSnack: true,
          messageSnack: messageError
        })
      }
    } else {
      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
        endpoint: (this.props.landing !== undefined && this.props.landing) ? '/' + this.props.match.params.id + '/new' : '/new',
        data: {
          identifier: this.state.identifier,
          fullWidth: this.state.fullWidth,
          paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
          paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
          heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 0,
          heightBannerMobile: !Utils.isEmpty(this.state.heightBannerMobile) ? Number(this.state.heightBannerMobile) : 0,
          blockTypeId: 4,
          banners: this.state.banners
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.created) {
          this.clearData()
          this.props.handleCloseWithData()
        }
      } else {
        let messageError = Utils.messages.General.error
        if (response.data.error !== undefined && response.data.error.message !== undefined) {
          messageError = response.data.error.message
        }
        this.setState({
          openSnack: true,
          messageSnack: messageError
        })
      }
    }
  }

  handleRender() {
    this.clearData()
    if (this.props.editBlock && this.props.selectedBlock !== null) {
      let banners = []
      this.props.selectedBlock.configs.banners.forEach(item => {
        banners.push({
          seoDescription: item.seoDescription,
          desktopImage: item.desktopImage,
          mobileImage: item.mobileImage,
          callToAction: item.callToAction
        })
      })
      this.setState({
        blockTypeId: this.props.selectedBlock.blockTypeId,
        blockId: this.props.selectedBlock.id,
        identifier: this.props.selectedBlock.identifier,
        fullWidth: this.props.selectedBlock.configs.fullWidth,
        paddingTop: String(this.props.selectedBlock.configs.paddingTop) || '0',
        paddingBottom: String(this.props.selectedBlock.configs.paddingBottom) || '0',
        heightBanner: String(this.props.selectedBlock.configs.heightBanner) || '0',
        heightBannerMobile: String(this.props.selectedBlock.configs.heightBannerMobile) || '0',
        banners: banners,
      })
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/editar/' + this.props.selectedBlock.id)
      } else {
        this.props.history.push('/cms/' + this.props.selectedBlock.id + '/editar')
      }
    } else {
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/bloques/nuevo/4')
      } else {
        this.props.history.push('/cms/nuevo/4')
      }
    }
  }

  async addBannerToCarousel() {
    let banners = this.state.banners
    if (banners.length >= 5) {
      this.setState({
        openSnack: true,
        messageSnack: 'Solo se permiten 5 banners por bloque.'
      })
      return
    }

    if (this.state.seoDescription.trim().length === 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Descripción SEO obligatoria.'
      })
      return
    }

    if (this.state.desktopDocs.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Imagen desktop obligatoria.'
      })
      return
    }

    if (this.state.mobileDocs.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Imagen mobile obligatoria.'
      })
      return
    }

    banners.push({
      seoDescription: this.state.seoDescription,
      desktopImage: this.state.desktopDocs[0],
      mobileImage: this.state.mobileDocs[0],
      callToAction: this.state.callToAction
    })

    this.setState({
      banners: banners,
      openSnack: true,
      messageSnack: 'Banner agregado exitosamente.',
      seoDescription: '',
      desktopDocs: [],
      mobileDocs: [],
      deletedDesktopDocs: [],
      deletedMobileDocs: [],
      callToAction: ''
    })
  }

  deleteBanner(idx) {
    let banners = this.state.banners
    banners.splice(idx, 1)
    this.setState({
      banners: banners,
      openSnack: true,
      messageSnack: 'Banner eliminado exitosamente.'
    })
  }

  clearData() {
    this.setState({
      openSnack: false,
      messageSnack: '',
      openDesktopUploader: false,
      openMobileUploader: false,
      desktopDocs: [],
      mobileDocs: [],
      deletedDesktopDocs: [],
      deletedMobileDocs: [],
      banners: [],
      blockTypeId: null,
      blockId: null,
      identifier: '',
      fullWidth: false,
      paddingTop: '0',
      paddingBottom: '0',
      heightBanner: '600',
      heightBannerMobile: '600',
      seoDescription: '',
      callToAction: ''
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
          (!this.props.editBlock || this.props.selectedBlock !== null) ?
            <div style={getModalStyle()} className={`${classes.container} ${classes.scrollBar}`}>
              <Grid container className={classes.innerContainer}>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="h4" className={classes.modalTitle}>
                    Crear nuevo banner.
                  </Typography>
                  <Typography variant="body2">
                    Ingresa los datos del nuevo bloque.
                  </Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Paper className={classes.paper}>
                    <Grid container>
                      <Typography variant="body1"><strong>Datos generales.</strong></Typography>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Identificador del bloque *"
                          placeholder="Identificador del bloque..."
                          value={this.state.identifier}
                          onChange={(event) => { this.handleChangeIdentifier(event) }}
                          autoFocus={true}
                        />
                      </Grid>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                        <Checkbox id="checkboxFullWidth" style={{ marginTop: -2 }} checked={this.state.fullWidth} onChange={() => { this.setState({ fullWidth: !this.state.fullWidth }) }} />
                        <label for="checkboxFullWidth"><strong>Full width</strong> (ancho completo)</label>
                      </Grid>
                      <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8, paddingRight: 16 }}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Separación superior (top)"
                          placeholder="Indicar separación top banner..."
                          value={this.state.paddingTop}
                          onChange={(event) => { this.handleChangePaddingTop(event) }}
                        />
                      </Grid>
                      <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8 }}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Separación inferior (bottom)"
                          placeholder="Indicar separación bottom banner..."
                          value={this.state.paddingBottom}
                          onChange={(event) => { this.handleChangePaddingBottom(event) }}
                        />
                      </Grid>
                      <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8, paddingRight: 16 }}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Altura bloque *"
                          placeholder="Indicar la altura del bloque..."
                          value={this.state.heightBanner}
                          disabled={(this.state.banners.length > 0 || this.state.desktopDocs.length > 0) ? true : false}
                          onChange={(event) => { this.handleChangeHeightBanner(event) }}
                        />
                      </Grid>
                      <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8 }}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Altura bloque mobile *"
                          placeholder="Indicar la altura del bloque en mobile..."
                          value={this.state.heightBannerMobile}
                          disabled={(this.state.banners.length > 0 || this.state.mobileDocs.length > 0) ? true : false}
                          onChange={(event) => { this.handleChangeHeightBannerMobile(event) }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                  <Paper className={classes.paper}>
                    <Grid container>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <Typography variant="body1"><strong>Contenido del banner.</strong></Typography>
                      </Grid>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Descripción SEO *"
                          placeholder="Describe tu imagen, se usará para el SEO..."
                          value={this.state.seoDescription}
                          onChange={(event) => { this.handleChangeSEODescription(event) }}
                        />
                      </Grid>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        {
                          (this.state.desktopDocs.length > 0) ?
                            <div style={{ marginTop: 8 }}>
                              <label><strong>Desktop banner cargado:</strong> {this.state.desktopDocs[0].name}</label>
                            </div>
                            :
                            ''
                        }
                        <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                          this.setState({ openDesktopUploader: true })
                        }}>
                          SUBIR IMAGEN DESKTOP
                      </Button>
                        <Uploader
                          open={this.state.openDesktopUploader}
                          host={Utils.constants.HOST}
                          title="Subir banner"
                          description={"Solo se permite formato .webp. Ancho 2,340px. Altura máxima " + this.state.heightBanner + "x."}
                          limit={1}
                          use="banners"
                          docs={this.state.desktopDocs}
                          validFormats={['image/webp']}
                          hideComments={true}
                          maxWidth={2340}
                          minWidth={2340}
                          minHeight={Number(this.state.heightBanner)}
                          maxHeight={Number(this.state.heightBanner)}
                          maxSize={500000}
                          handleCloseWithData={(docs, deletedBlocks) => { this.confirmDesktopUploader(docs, deletedBlocks) }}
                          handleClose={() => { this.setState({ openDesktopUploader: false }) }}
                        />
                      </Grid>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        {
                          (this.state.mobileDocs.length > 0) ?
                            <div style={{ marginTop: 8 }}>
                              <label><strong>Mobile banner cargado:</strong> {this.state.mobileDocs[0].name}</label>
                            </div>
                            :
                            ''
                        }
                        <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, marginBottom: 8, width: '100%' }} onClick={(event) => {
                          this.setState({ openMobileUploader: true })
                        }}>
                          SUBIR IMAGEN MOBILE
                      </Button>
                        <Uploader
                          open={this.state.openMobileUploader}
                          host={Utils.constants.HOST}
                          title="Subir banner"
                          description={"Solo se permite formato .webp. Ancho 800px. Altura máxima " + this.state.heightBannerMobile + "px."}
                          limit={1}
                          use="banners"
                          docs={this.state.mobileDocs}
                          validFormats={['image/webp']}
                          hideComments={true}
                          maxWidth={800}
                          minWidth={800}
                          minHeight={Number(this.state.heightBannerMobile)}
                          maxHeight={Number(this.state.heightBannerMobile)}
                          maxSize={500000}
                          handleCloseWithData={(docs, deletedBlocks) => { this.confirmMobileUploader(docs, deletedBlocks) }}
                          handleClose={() => { this.setState({ openMobileUploader: false }) }}
                        />
                      </Grid>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Call To Action (URL destino al hacer click en el banner)"
                          placeholder="Ejemplo: /mujeres/calzado, https://instagram.com/calzzapato.mx, etc."
                          value={this.state.callToAction}
                          onChange={(event) => { this.handleChangeCallToAction(event) }}
                        />
                      </Grid>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <Button
                          variant="contained"
                          onClick={this.addBannerToCarousel}
                          style={{ background: 'green', color: 'white', marginTop: 16, width: '100%', fontWeight: 'bold' }}
                        >
                          AGREGAR BANNER AL CARRUSEL
                      </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                  {
                    (this.state.banners.length > 0) ?
                      <Paper className={classes.paper}>
                        <Grid container>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Typography variant="body2" style={{ fontSize: 14 }}>Contenido carrusel de banners.</Typography>
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Table>
                              <TableHead>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </TableHead>
                              <TableBody>
                                {
                                  this.state.banners.map((item, idx) => {
                                    return (
                                      <TableRow style={{ maxHeight: 28, height: 28, minHeight: 28 }}>
                                        <TableCell>
                                          <img style={{ width: 50, marginRight: 8 }} src={item.desktopImage.data || item.desktopImage.url} />
                                          <img style={{ width: 50 }} src={item.mobileImage.data || item.mobileImage.url} />
                                        </TableCell>
                                        <TableCell>
                                          <strong>{item.seoDescription}</strong>
                                          <br />
                                          <span>{item.callToAction}</span>
                                        </TableCell>
                                        <TableCell>
                                          <IconButton onClick={() => { this.deleteBanner(idx) }}><Icon>delete</Icon></IconButton>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })
                                }
                              </TableBody>
                            </Table>
                          </Grid>
                        </Grid>
                      </Paper>
                      :
                      <div style={{ marginBottom: 24 }}>
                        <Empty
                          title="¡No hay contenido!"
                          description="No se ha agregado contenido al carrusel de banners."
                        />
                      </div>
                  }
                </Grid>
              </Grid>
              <div className={classes.actions}>
                <Button onClick={this.handleClose}>
                  CERRAR
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={this.confirmCreateBannerBlock}
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
)(CreateBannerBlock)
