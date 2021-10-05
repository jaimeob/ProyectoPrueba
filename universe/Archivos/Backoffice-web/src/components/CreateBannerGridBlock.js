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
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import { Table, TableHead, TableBody, TableCell, TableRow, TextField, IconButton, Snackbar, Icon, Checkbox } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'
import Uploader from './Uploader'
import Empty from './Empty'
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
  largeTextField: {
    width: '100%',
    marginTop: 12
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

class CreateBannerGridBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      blockTypeId: null,
      blockId: null,
      identifier: '',
      paddingTop: '0',
      paddingBottom: '0',
      gridBannerMobile: false,
      seoDescription: '',
      callToAction: '',
      banners: [],
      openDesktopUploader: false,
      openMobileUploader: false,
      desktopDocs: [],
      mobileDocs: [],
      deletedDesktopDocs: [],
      deletedMobileDocs: [],
      openSecondaryTopDesktopUploader: false,
      openSecondaryTopMobileUploader: false,
      secondaryTopDesktopDocs: [],
      secondaryTopMobileDocs: [],
      deletedSecondaryTopDesktopDocs: [],
      deletedSecondaryTopMobileDocs: [],
      secondaryTopSeoDescription: '',
      secondaryTopCallToAction: '',
      openSecondaryBottomDesktopUploader: false,
      openSecondaryBottomMobileUploader: false,
      secondaryBottomDesktopDocs: [],
      secondaryBottomMobileDocs: [],
      deletedSecondaryBottomDesktopDocs: [],
      deletedSecondaryBottomMobileDocs: [],
      secondaryBottomSeoDescription: '',
      secondaryBottomCallToAction: '',
      editSecondaryTopBanner: true,
      editSecondaryBottomBanner: true,
    }

    this.handleChangeIdentifier = this.handleChangeIdentifier.bind(this)
    this.handleChangeCallToAction = this.handleChangeCallToAction.bind(this)
    this.handleChangeSecondaryTopCallToAction = this.handleChangeSecondaryTopCallToAction.bind(this)
    this.handleChangeSecondaryBottomCallToAction = this.handleChangeSecondaryBottomCallToAction.bind(this)
    this.addBannerToCarousel = this.addBannerToCarousel.bind(this)
    this.deleteBanner = this.deleteBanner.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseWithData = this.handleCloseWithData.bind(this)
    this.handleChangePaddingTop = this.handleChangePaddingTop.bind(this)
    this.handleChangePaddingBottom = this.handleChangePaddingBottom.bind(this)
    this.handleChangeSEODescription = this.handleChangeSEODescription.bind(this)
    this.handleChangeSecondaryTopSEODescription = this.handleChangeSecondaryTopSEODescription.bind(this)
    this.handleChangeSecondaryBottomSEODescription = this.handleChangeSecondaryBottomSEODescription.bind(this)
    this.confirmDesktopUploader = this.confirmDesktopUploader.bind(this)
    this.confirmMobileUploader = this.confirmMobileUploader.bind(this)
    this.confirmSecondaryTopDesktopUploader = this.confirmSecondaryTopDesktopUploader.bind(this)
    this.confirmSecondaryTopMobileUploader = this.confirmSecondaryTopMobileUploader.bind(this)
    this.confirmSecondaryBottomDesktopUploader = this.confirmSecondaryBottomDesktopUploader.bind(this)
    this.confirmSecondaryBottomMobileUploader = this.confirmSecondaryBottomMobileUploader.bind(this)
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

  confirmSecondaryTopDesktopUploader(docs, deletedDocs) {
    this.setState({
      openSecondaryTopDesktopUploader: false,
      secondaryTopDesktopDocs: docs,
      deletedSecondaryTopDesktopDocs: deletedDocs
    })
  }

  confirmSecondaryTopMobileUploader(docs, deletedDocs) {
    this.setState({
      openSecondaryTopMobileUploader: false,
      secondaryTopMobileDocs: docs,
      deletedSecondaryTopMobileDocs: deletedDocs
    })
  }

  confirmSecondaryBottomDesktopUploader(docs, deletedDocs) {
    this.setState({
      openSecondaryBottomDesktopUploader: false,
      secondaryBottomDesktopDocs: docs,
      deletedSecondaryBottomDesktopDocs: deletedDocs
    })
  }

  confirmSecondaryBottomMobileUploader(docs, deletedDocs) {
    this.setState({
      openSecondaryBottomMobileUploader: false,
      secondaryBottomMobileDocs: docs,
      deletedSecondaryBottomMobileDocs: deletedDocs
    })
  }

  handleChangeSEODescription(event) {
    this.setState({
      seoDescription: event.target.value
    })
  }

  handleChangeSecondaryTopSEODescription(event) {
    this.setState({
      secondaryTopSeoDescription: event.target.value
    })
  }

  handleChangeSecondaryBottomSEODescription(event) {
    this.setState({
      secondaryBottomSeoDescription: event.target.value
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

  handleChangeIdentifier(event) {
    this.setState({
      identifier: event.target.value
    })
  }

  handleChangeCallToAction(event) {
    this.setState({
      callToAction: event.target.value.trim()
    })
  }

  handleChangeSecondaryTopCallToAction(event) {
    this.setState({
      secondaryTopCallToAction: event.target.value.trim()
    })
  }

  handleChangeSecondaryBottomCallToAction(event) {
    this.setState({
      secondaryBottomCallToAction: event.target.value.trim()
    })
  }

  async addBannerToCarousel() {
    let banners = this.state.banners
    if (banners.length >= 3) {
      this.setState({
        banners: banners,
        openSnack: true,
        messageSnack: 'Solo se permiten 3 banners por bloque.'
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

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }


  async handleCloseWithData() {
    if (this.state.identifier.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El identificador del bloque es obligatorio. Ingresa un identificador al nuevo bloque.'
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

    let secondaryTopBanner = null
    let secondaryBottomBanner = null
    // Validate secondaries banners
    if (this.state.editSecondaryTopBanner) {
      if (this.state.secondaryTopSeoDescription.trim().length === 0) {
        this.setState({
          openSnack: true,
          messageSnack: 'Descripción SEO obligatoria (banner secundario superior).'
        })
        return
      }

      if (this.state.secondaryTopDesktopDocs.length <= 0) {
        this.setState({
          openSnack: true,
          messageSnack: 'Imagen desktop obligatoria  (banner secundario superior).'
        })
        return
      }

      if (this.state.secondaryTopMobileDocs.length <= 0) {
        this.setState({
          openSnack: true,
          messageSnack: 'Imagen mobile obligatoria  (banner secundario superior).'
        })
        return
      }
      secondaryTopBanner = {
        seoDescription: this.state.secondaryTopSeoDescription,
        desktopImage: this.state.secondaryTopDesktopDocs[0],
        mobileImage: this.state.secondaryTopMobileDocs[0],
        callToAction: this.state.secondaryTopCallToAction
      }
    }

    if (this.state.editSecondaryBottomBanner) {
      if (this.state.secondaryBottomSeoDescription.trim().length === 0) {
        this.setState({
          openSnack: true,
          messageSnack: 'Descripción SEO obligatoria (banner secundario inferior).'
        })
        return
      }


      if (this.state.secondaryBottomDesktopDocs.length <= 0) {
        this.setState({
          openSnack: true,
          messageSnack: 'Imagen desktop obligatoria  (banner secundario inferior).'
        })
        return
      }

      if (this.state.secondaryBottomMobileDocs.length <= 0) {
        this.setState({
          openSnack: true,
          messageSnack: 'Imagen mobile obligatoria  (banner secundario inferior).'
        })
        return
      }
      secondaryBottomBanner = {
        seoDescription: this.state.secondaryBottomSeoDescription,
        desktopImage: this.state.secondaryBottomDesktopDocs[0],
        mobileImage: this.state.secondaryBottomMobileDocs[0],
        callToAction: this.state.secondaryBottomCallToAction
      }
    }

    let response = null
    let data = {}
    if (this.props.editBlock) {
      if (secondaryTopBanner === null) {
        secondaryTopBanner = {
          seoDescription: this.props.selectedBlock.configs.secondaryTopBanner.seoDescription,
          desktopImage: this.props.selectedBlock.configs.secondaryTopBanner.desktopImage,
          mobileImage: this.props.selectedBlock.configs.secondaryTopBanner.mobileImage,
          callToAction: this.props.selectedBlock.configs.secondaryTopBanner.callToAction
        }
      }

      if (secondaryBottomBanner === null) {
        secondaryBottomBanner = {
          seoDescription: this.props.selectedBlock.configs.secondaryBottomBanner.seoDescription,
          desktopImage: this.props.selectedBlock.configs.secondaryBottomBanner.desktopImage,
          mobileImage: this.props.selectedBlock.configs.secondaryBottomBanner.mobileImage,
          callToAction: this.props.selectedBlock.configs.secondaryBottomBanner.callToAction
        }
      }

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
            gridBannerMobile: this.state.gridBannerMobile,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            banners: this.state.banners,
            secondaryTopBanner: secondaryTopBanner,
            secondaryBottomBanner: secondaryBottomBanner
          },
          createdAt: this.props.selectedBlock.createdAt
        }
      } else {
        data = {
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          configs: {
            gridBannerMobile: this.state.gridBannerMobile,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            banners: this.state.banners,
            secondaryTopBanner: secondaryTopBanner,
            secondaryBottomBanner: secondaryBottomBanner
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
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.error
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
          blockTypeId: 3,
          gridBannerMobile: this.state.gridBannerMobile,
          paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
          paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
          banners: this.state.banners,
          secondaryTopBanner: {
            seoDescription: this.state.secondaryTopSeoDescription,
            desktopImage: this.state.secondaryTopDesktopDocs[0],
            mobileImage: this.state.secondaryTopMobileDocs[0],
            callToAction: this.state.secondaryTopCallToAction
          },
          secondaryBottomBanner: {
            seoDescription: this.state.secondaryBottomSeoDescription,
            desktopImage: this.state.secondaryBottomDesktopDocs[0],
            mobileImage: this.state.secondaryBottomMobileDocs[0],
            callToAction: this.state.secondaryBottomCallToAction
          }
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.created) {
          this.clearData()
          this.props.handleCloseWithData()
        }
      } else {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.error
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
        gridBannerMobile: this.props.selectedBlock.configs.gridBannerMobile,
        paddingTop: String(this.props.selectedBlock.configs.paddingTop) || '0',
        paddingBottom: String(this.props.selectedBlock.configs.paddingBottom) || '0',
        banners: banners,
        editSecondaryTopBanner: false,
        editSecondaryBottomBanner: false,
      })
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/editar/' + this.props.selectedBlock.id)
      } else {
        this.props.history.push('/cms/' + this.props.selectedBlock.id + '/editar')
      }
    } else {
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/bloques/nuevo/3')
      } else {
        this.props.history.push('/cms/nuevo/3')
      }
    }
  }

  clearData() {
    this.setState({
      openSnack: false,
      messageSnack: '',
      blockTypeId: null,
      blockId: null,
      identifier: '',
      paddingTop: '0',
      paddingBottom: '0',
      gridBannerMobile: false,
      seoDescription: '',
      callToAction: '',
      banners: [],
      openDesktopUploader: false,
      openMobileUploader: false,
      desktopDocs: [],
      mobileDocs: [],
      deletedDesktopDocs: [],
      deletedMobileDocs: [],
      openSecondaryTopDesktopUploader: false,
      openSecondaryTopMobileUploader: false,
      secondaryTopDesktopDocs: [],
      secondaryTopMobileDocs: [],
      deletedSecondaryTopDesktopDocs: [],
      deletedSecondaryTopMobileDocs: [],
      secondaryTopSeoDescription: '',
      secondaryTopCallToAction: '',
      openSecondaryBottomDesktopUploader: false,
      openSecondaryBottomMobileUploader: false,
      secondaryBottomDesktopDocs: [],
      secondaryBottomMobileDocs: [],
      deletedSecondaryBottomDesktopDocs: [],
      deletedSecondaryBottomMobileDocs: [],
      secondaryBottomSeoDescription: '',
      secondaryBottomCallToAction: '',
      editSecondaryTopBanner: true,
      editSecondaryBottomBanner: true
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
                    Crear nuevo banner grid.
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
                        <Typography variant="body1">Separación del bloque entre los demás bloques.</Typography>
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
                      {
                        (!this.props.editBlock) ?
                          <>
                            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                              <Checkbox id="checkboxGridBannerMobile" style={{ marginTop: -2 }} checked={this.state.gridBannerMobile} onChange={() => { this.setState({ gridBannerMobile: !this.state.gridBannerMobile }) }} />
                              <label for="checkboxGridBannerMobile"><strong>Banners secundarios como grid en versión móvil.</strong></label>
                            </Grid>
                          </>
                          :
                          <div style={{ marginTop: 8 }}>
                            <div>
                              <label>Grid banners secundarios (versión móvil): <strong>{(this.state.gridBannerMobile) ? 'SI' : 'NO'}</strong></label>
                            </div>
                          </div>
                      }
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
                          description={"Solo se permite formato .webp y tamaño máximo de 1,640px x 600px"}
                          limit={1}
                          use="banners"
                          docs={this.state.desktopDocs}
                          validFormats={['image/webp']}
                          hideComments={true}
                          minWidth={1640}
                          maxWidth={1640}
                          minHeight={600}
                          maxHeight={600}
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
                          description="Solo se permite formato .webp y tamaño máximo de 800px x 800px."
                          limit={1}
                          use="banners"
                          docs={this.state.mobileDocs}
                          validFormats={['image/webp']}
                          hideComments={true}
                          minWidth={780}
                          maxWidth={780}
                          minHeight={1}
                          maxHeight={585}
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
                  {
                    (this.state.editSecondaryTopBanner) ?
                      <Paper className={classes.paper}>
                        <Grid container>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Typography variant="body1"><strong>Banner secundario #1 (superior)</strong></Typography>
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <TextField
                              className={classes.textFieldLarge}
                              label="Descripción SEO *"
                              placeholder="Describe tu imagen, se usará para el SEO..."
                              value={this.state.secondaryTopSeoDescription}
                              onChange={(event) => { this.handleChangeSecondaryTopSEODescription(event) }}
                            />
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            {
                              (this.state.secondaryTopDesktopDocs.length > 0) ?
                                <div style={{ marginTop: 8 }}>
                                  <label><strong>Desktop banner cargado:</strong> {this.state.secondaryTopDesktopDocs[0].name}</label>
                                </div>
                                :
                                ''
                            }
                            <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                              this.setState({ openSecondaryTopDesktopUploader: true })
                            }}>
                              SUBIR IMAGEN DESKTOP
                            </Button>
                            <Uploader
                              open={this.state.openSecondaryTopDesktopUploader}
                              host={Utils.constants.HOST}
                              title="Subir banner secundario superior (desktop)"
                              description={"Solo se permite formato .webp y tamaño máximo de 700px x 300px"}
                              limit={1}
                              use="banners"
                              docs={this.state.secondaryTopDesktopDocs}
                              validFormats={['image/webp']}
                              hideComments={true}
                              minWidth={785}
                              maxWidth={785}
                              minHeight={585}
                              maxHeight={585}
                              maxSize={500000}
                              handleCloseWithData={(docs, deletedBlocks) => { this.confirmSecondaryTopDesktopUploader(docs, deletedBlocks) }}
                              handleClose={() => { this.setState({ openSecondaryTopDesktopUploader: false }) }}
                            />
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            {
                              (this.state.secondaryTopMobileDocs.length > 0) ?
                                <div style={{ marginTop: 8 }}>
                                  <label><strong>Mobile banner cargado:</strong> {this.state.secondaryTopMobileDocs[0].name}</label>
                                </div>
                                :
                                ''
                            }
                            <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, marginBottom: 8, width: '100%' }} onClick={(event) => {
                              this.setState({ openSecondaryTopMobileUploader: true })
                            }}>
                              SUBIR IMAGEN MOBILE
                            </Button>
                            <Uploader
                              open={this.state.openSecondaryTopMobileUploader}
                              host={Utils.constants.HOST}
                              title="Subir banner secundario superior (móvil)"
                              description={
                                (this.state.gridBannerMobile) ?
                                  "Solo se permite formato .webp, ancho de 400px y altura máxima de 800px."
                                  :
                                  "Solo se permite formato .webp, ancho de 700px y altura máxima de 800px."
                              }
                              limit={1}
                              use="banners"
                              docs={this.state.secondaryTopMobileDocs}
                              validFormats={['image/webp']}
                              hideComments={true}
                              minWidth={(this.state.gridBannerMobile) ? 400 : 700}
                              maxWidth={(this.state.gridBannerMobile) ? 400 : 700}
                              minHeight={1}
                              maxHeight={800}
                              maxSize={500000}
                              handleCloseWithData={(docs, deletedBlocks) => { this.confirmSecondaryTopMobileUploader(docs, deletedBlocks) }}
                              handleClose={() => { this.setState({ openSecondaryTopMobileUploader: false }) }}
                            />
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <TextField
                              className={classes.textFieldLarge}
                              label="Call To Action (URL destino al hacer click en el banner)"
                              placeholder="Ejemplo: /mujeres/calzado, https://instagram.com/calzzapato.mx, etc."
                              value={this.state.secondaryTopCallToAction}
                              onChange={(event) => { this.handleChangeSecondaryTopCallToAction(event) }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                      :
                      <Paper className={classes.paper}>
                        <Grid container>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Typography variant="body1"><strong>Banner secundario #1 (superior)</strong></Typography>
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Table>
                              <TableHead>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </TableHead>
                              <TableBody>
                                <TableRow style={{ maxHeight: 28, height: 28, minHeight: 28 }}>
                                  <TableCell>
                                    <img style={{ width: 50, marginRight: 8 }} src={this.props.selectedBlock.configs.secondaryTopBanner.desktopImage.url} />
                                    <img style={{ width: 50 }} src={this.props.selectedBlock.configs.secondaryTopBanner.mobileImage.url} />
                                  </TableCell>
                                  <TableCell>
                                    <strong>{this.props.selectedBlock.configs.secondaryTopBanner.seoDescription}</strong>
                                    <br />
                                    <span>{this.props.selectedBlock.configs.secondaryTopBanner.callToAction}</span>
                                  </TableCell>
                                  <TableCell>
                                    <IconButton onClick={() => {
                                      this.setState({
                                        editSecondaryTopBanner: true
                                      })
                                    }}><Icon>delete</Icon></IconButton>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                        </Grid>
                      </Paper>
                  }
                  {
                    (this.state.editSecondaryBottomBanner) ?
                      <Paper className={classes.paper}>
                        <Grid container>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Typography variant="body1"><strong>Banner secundario #2 (inferior)</strong></Typography>
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <TextField
                              className={classes.textFieldLarge}
                              label="Descripción SEO *"
                              placeholder="Describe tu imagen, se usará para el SEO..."
                              value={this.state.secondaryBottomSeoDescription}
                              onChange={(event) => { this.handleChangeSecondaryBottomSEODescription(event) }}
                            />
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            {
                              (this.state.secondaryBottomDesktopDocs.length > 0) ?
                                <div style={{ marginTop: 8 }}>
                                  <label><strong>Desktop banner cargado:</strong> {this.state.secondaryBottomDesktopDocs[0].name}</label>
                                </div>
                                :
                                ''
                            }
                            <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                              this.setState({ openSecondaryBottomDesktopUploader: true })
                            }}>
                              SUBIR IMAGEN DESKTOP
                            </Button>
                            <Uploader
                              open={this.state.openSecondaryBottomDesktopUploader}
                              host={Utils.constants.HOST}
                              title="Subir banner secundario inferior (desktop)"
                              description={"Solo se permite formato .webp y tamaño máximo de 700px x 300px"}
                              limit={1}
                              use="banners"
                              docs={this.state.secondaryBottomDesktopDocs}
                              validFormats={['image/webp']}
                              hideComments={true}
                              minWidth={785}
                              maxWidth={785}
                              minHeight={585}
                              maxHeight={585}
                              maxSize={500000}
                              handleCloseWithData={(docs, deletedBlocks) => { this.confirmSecondaryBottomDesktopUploader(docs, deletedBlocks) }}
                              handleClose={() => { this.setState({ openSecondaryBottomDesktopUploader: false }) }}
                            />
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            {
                              (this.state.secondaryBottomMobileDocs.length > 0) ?
                                <div style={{ marginTop: 8 }}>
                                  <label><strong>Mobile banner cargado:</strong> {this.state.secondaryBottomMobileDocs[0].name}</label>
                                </div>
                                :
                                ''
                            }
                            <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, marginBottom: 8, width: '100%' }} onClick={(event) => {
                              this.setState({ openSecondaryBottomMobileUploader: true })
                            }}>
                              SUBIR IMAGEN MOBILE
                            </Button>
                            <Uploader
                              open={this.state.openSecondaryBottomMobileUploader}
                              host={Utils.constants.HOST}
                              title="Subir banner secundario inferior (móvil)"
                              description={
                                (this.state.gridBannerMobile) ?
                                  "Solo se permite formato .webp, ancho de 400px y altura máxima de 800px."
                                  :
                                  "Solo se permite formato .webp, ancho de 700px y altura máxima de 800px."
                              }
                              limit={1}
                              use="banners"
                              docs={this.state.secondaryBottomMobileDocs}
                              validFormats={['image/webp']}
                              hideComments={true}
                              minWidth={(this.state.gridBannerMobile) ? 400 : 700}
                              maxWidth={(this.state.gridBannerMobile) ? 400 : 700}
                              minHeight={1}
                              maxHeight={800}
                              maxSize={500000}
                              handleCloseWithData={(docs, deletedBlocks) => { this.confirmSecondaryBottomMobileUploader(docs, deletedBlocks) }}
                              handleClose={() => { this.setState({ openSecondaryBottomMobileUploader: false }) }}
                            />
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <TextField
                              className={classes.textFieldLarge}
                              label="Call To Action (URL destino al hacer click en el banner)"
                              placeholder="Ejemplo: /mujeres/calzado, https://instagram.com/calzzapato.mx, etc."
                              value={this.state.secondaryBottomCallToAction}
                              onChange={(event) => { this.handleChangeSecondaryBottomCallToAction(event) }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                      :
                      <Paper className={classes.paper}>
                        <Grid container>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Typography variant="body1"><strong>Banner secundario #2 (inferior)</strong></Typography>
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Table>
                              <TableHead>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </TableHead>
                              <TableBody>
                                <TableRow style={{ maxHeight: 28, height: 28, minHeight: 28 }}>
                                  <TableCell>
                                    <img style={{ width: 50, marginRight: 8 }} src={this.props.selectedBlock.configs.secondaryBottomBanner.desktopImage.url} />
                                    <img style={{ width: 50 }} src={this.props.selectedBlock.configs.secondaryBottomBanner.mobileImage.url} />
                                  </TableCell>
                                  <TableCell>
                                    <strong>{this.props.selectedBlock.configs.secondaryBottomBanner.seoDescription}</strong>
                                    <br />
                                    <span>{this.props.selectedBlock.configs.secondaryBottomBanner.callToAction}</span>
                                  </TableCell>
                                  <TableCell>
                                    <IconButton onClick={() => {
                                      this.setState({
                                        editSecondaryBottomBanner: true
                                      })
                                    }}><Icon>delete</Icon></IconButton>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Grid>
                        </Grid>
                      </Paper>
                  }
                </Grid>
              </Grid>

              <div className={classes.actions}>
                <Button
                  onClick={this.handleClose}
                  onClick={this.handleClose}
                >
                  CERRAR
                </Button>
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
)(CreateBannerGridBlock)
