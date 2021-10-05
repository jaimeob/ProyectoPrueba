'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Table, TableHead, TableBody, TableCell, TableRow, TextField, IconButton, Snackbar, Icon, Checkbox, Grid, Paper, Typography, Modal, Button } from '@material-ui/core'
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

class CreateCarouselBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      openUploader: false,
      docs: [],
      deletedDocs: [],
      items: [],
      blockTypeId: null,
      blockId: null,
      identifier: '',
      fullWidth: false,
      paddingTop: '0',
      paddingBottom: '0',
      heightBanner: '400',
      separationItems: '16',
      borderRadius: '0',
      backgroundColor: '',
      seoDescription: '',
      callToAction: ''
    }
    this.addItemToCarousel = this.addItemToCarousel.bind(this)
    this.deleteItemFromCarousel = this.deleteItemFromCarousel.bind(this)
    this.handleChangeIdentifier = this.handleChangeIdentifier.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.confirmCreateCarouselBlock = this.confirmCreateCarouselBlock.bind(this)
    this.handleChangeSEODescription = this.handleChangeSEODescription.bind(this)
    this.handleChangeCallToAction = this.handleChangeCallToAction.bind(this)
    this.clearData = this.clearData.bind(this)
    this.confirmUploader = this.confirmUploader.bind(this)
    this.handleChangePaddingTop = this.handleChangePaddingTop.bind(this)
    this.handleChangePaddingBottom = this.handleChangePaddingBottom.bind(this)
    this.handleChangeHeightBanner = this.handleChangeHeightBanner.bind(this)
    this.handleChangeSeparationItems = this.handleChangeSeparationItems.bind(this)
    this.handleChangeBorderRadius = this.handleChangeBorderRadius.bind(this)
    this.handleChangeBackgroundColor = this.handleChangeBackgroundColor.bind(this)
  }

  clearData() {
    this.setState({
      openSnack: false,
      messageSnack: '',
      openUploader: false,
      docs: [],
      deletedDocs: [],
      items: [],
      blockTypeId: null,
      blockId: null,
      identifier: '',
      fullWidth: false,
      paddingTop: '0',
      paddingBottom: '0',
      heightBanner: '400',
      separationItems: '16',
      borderRadius: '0',
      backgroundColor: '',
      seoDescription: '',
      callToAction: ''
    })
  }

  confirmUploader(docs, deletedDocs) {
    this.setState({
      openUploader: false,
      docs: docs,
      deletedDocs: deletedDocs
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
        heightBanner: '400'
      })
    }
  }

  handleChangeSeparationItems(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        separationItems: event.target.value.trim()
      })
    } else {
      this.setState({
        separationItems: '16'
      })
    }
  }

  handleChangeBorderRadius(event) {
    if (!isNaN(event.target.value.trim())) {
      let borderRadius = event.target.value.trim()
      this.setState({
        borderRadius: borderRadius
      })
    } else {
      this.setState({
        borderRadius: '0'
      })
    }
  }

  handleChangeBackgroundColor(event) {
    let backgroundColor = event.target.value.trim()
    if (backgroundColor.length === 6) {
      let result = /^[0-9A-F]{6}$/i.test(backgroundColor) 
      if (!result) {
        backgroundColor = ''
      }
    }

    if (backgroundColor.length > 6) {
      backgroundColor = ''
    }

    this.setState({
      backgroundColor: backgroundColor
    })
  }

  async addItemToCarousel() {
    let items = this.state.items
    if (this.state.seoDescription.trim().length === 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Descripción SEO obligatoria.'
      })
      return
    }

    if (this.state.docs.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Imagen obligatoria.'
      })
      return
    }

    items.push({
      seoDescription: this.state.seoDescription,
      image: this.state.docs[0],
      callToAction: this.state.callToAction
    })

    this.setState({
      items: items,
      openSnack: true,
      messageSnack: 'Item agregado exitosamente.',
      seoDescription: '',
      docs: [],
      deletedDocs: [],
      callToAction: ''
    })
  }

  deleteItemFromCarousel(idx) {
    let items = this.state.items
    items.splice(idx, 1)
    this.setState({
      items: items,
      openSnack: true,
      messageSnack: 'Item eliminado exitosamente.'
    })
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  async confirmCreateCarouselBlock() {
    if (this.state.identifier.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El identificador del bloque es obligatorio. Ingresa un identificador al nuevo bloque.'
      })
      return
    }

    if (this.state.items.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Debes ingresar contenido al carrusel.'
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
            heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 400,
            separationItems: !Utils.isEmpty(this.state.separationItems) ? Number(this.state.separationItems) : 16,
            borderRadius: !Utils.isEmpty(this.state.borderRadius) ? Number(this.state.borderRadius) : 0,
            backgroundColor: this.state.backgroundColor.length === 6 ? this.state.backgroundColor : '',
            items: this.state.items
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
            heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 400,
            separationItems: !Utils.isEmpty(this.state.separationItems) ? Number(this.state.separationItems) : 16,
            borderRadius: !Utils.isEmpty(this.state.borderRadius) ? Number(this.state.borderRadius) : 0,
            backgroundColor: this.state.backgroundColor.length === 6 ? this.state.backgroundColor : '',
            items: this.state.items
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
    } else {
      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: 'blocks',
        resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
        endpoint: (this.props.landing !== undefined && this.props.landing) ? '/' + this.props.match.params.id + '/new' : '/new',
        data: {
          blockTypeId: 15,
          identifier: this.state.identifier,
          fullWidth: this.state.fullWidth,
          paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
          paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
          heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 400,
          separationItems: !Utils.isEmpty(this.state.separationItems) ? Number(this.state.separationItems) : 16,
          borderRadius: !Utils.isEmpty(this.state.borderRadius) ? Number(this.state.borderRadius) : 0,
          backgroundColor: this.state.backgroundColor.length === 6 ? this.state.backgroundColor : '',
          items: this.state.items
        }
      })
    }

    if (response.status === Utils.constants.status.SUCCESS) {
      this.props.handleCloseWithData()
    }
  }

  handleRender() {
    this.clearData()
    if (this.props.editBlock && this.props.selectedBlock !== null) {
      let items = []
      this.props.selectedBlock.configs.items.forEach(item => {
        items.push({
          seoDescription: item.seoDescription,
          image: item.image,
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
        heightBanner: String(this.props.selectedBlock.configs.heightBanner) || '400',
        separationItems: String(this.props.selectedBlock.configs.separationItems) || '16',
        borderRadius: String(this.props.selectedBlock.configs.borderRadius) || '0',
        backgroundColor: String(this.props.selectedBlock.configs.backgroundColor) || '',
        items: items,
      })
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/editar/' + this.props.selectedBlock.id)
      } else {
        this.props.history.push('/cms/' + this.props.selectedBlock.id + '/editar')
      }
    } else {
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/bloques/nuevo/15')
      } else {
        this.props.history.push('/cms/nuevo/15')
      }
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
        {
          (!this.props.editBlock || this.props.selectedBlock !== null) ?
            <div style={getModalStyle()} className={`${classes.container} ${classes.scrollBar}`}>
              <Grid container className={classes.innerContainer}>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="h4" className={classes.modalTitle}>
                    Crear nuevo carrusel.
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
                          disabled={(this.state.items.length > 0 || this.state.docs.length > 0) ? true : false}
                          onChange={(event) => { this.handleChangeHeightBanner(event) }}
                        />
                      </Grid>
                      <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8 }}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Separación entre items"
                          placeholder="Indicar separación entre items del carrusel..."
                          value={this.state.separationItems}
                          onChange={(event) => { this.handleChangeSeparationItems(event) }}
                        />
                      </Grid>
                      <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8, paddingRight: 16 }}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Redondear borde"
                          placeholder="Ejemplo: 0 = cuadrado, 50 = redondo..."
                          value={this.state.borderRadius}
                          onChange={(event) => { this.handleChangeBorderRadius(event) }}
                          onChange={(event) => { this.handleChangeBorderRadius(event) }}
                        />
                      </Grid>
                      <Grid item xl={5} lg={5} md={5} sm={5} xs={5} style={{ marginTop: 8 }}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Color del fondo"
                          placeholder="Especificar código hexadecimal: #FFFFFF"
                          value={this.state.backgroundColor}
                          onChange={(event) => { this.handleChangeBackgroundColor(event) }}
                        />
                      </Grid>
                      <Grid item xl={1} lg={1} md={1} sm={1} xs={1} style={{ marginTop: 24 }}>
                      {
                        (this.state.backgroundColor.trim().length === 6) ?
                        <div style={{ float: 'right', height: 20, width: 20, backgroundColor: '#' + this.state.backgroundColor, border: '1px solid gray' }}></div>
                        :
                        <div><strong>N/A</strong></div>
                      }
                      </Grid>
                    </Grid>
                  </Paper>
                  <Paper className={classes.paper}>
                    <Grid container>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <Typography variant="body1"><strong>Contenido del carrusel.</strong></Typography>
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
                          (this.state.docs.length > 0) ?
                            <div style={{ marginTop: 8 }}>
                              <label><strong>Imagen cargada:</strong> {this.state.docs[0].name}</label>
                            </div>
                            :
                            ''
                        }
                        <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                          this.setState({ openUploader: true })
                        }}>
                          SUBIR IMAGEN
                      </Button>
                        <Uploader
                          open={this.state.openUploader}
                          host={Utils.constants.HOST}
                          title="Subir imagen"
                          description={"Solo se permite formato .webp. Ancho máximo 800px. Altura máxima " + this.state.heightBanner + "px."}
                          limit={1}
                          use="banners"
                          docs={this.state.docs}
                          validFormats={['image/webp']}
                          hideComments={true}
                          minWidth={1}
                          maxWidth={800}
                          minHeight={Number(this.state.heightBanner)}
                          maxHeight={Number(this.state.heightBanner)}
                          maxSize={500000}
                          handleCloseWithData={(docs, deletedBlocks) => { this.confirmUploader(docs, deletedBlocks) }}
                          handleClose={() => { this.setState({ openUploader: false }) }}
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
                          onClick={this.addItemToCarousel}
                          style={{ background: 'green', color: 'white', marginTop: 16, width: '100%', fontWeight: 'bold' }}
                        >
                          AGREGAR ITEM AL CARRUSEL
                      </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Paper className={classes.paper}>
                      <Grid container>
                        {
                          (this.state.items.length > 0) ?
                            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                              <Typography variant="body2" style={{ fontSize: 14 }}><strong>Contenido del carrusel.</strong></Typography>
                            </Grid>
                            :
                            ''
                        }
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                          {
                            (this.state.items.length > 0) ?
                              <Table>
                                <TableHead>
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                  <TableCell></TableCell>
                                </TableHead>
                                <TableBody>
                                {
                                  this.state.items.map((item, idx) => {
                                    return (
                                      <TableRow style={{ maxHeight: 28, height: 28, minHeight: 28 }}>
                                        <TableCell>
                                          <img style={{ width: 50, marginRight: 8 }} src={item.image.data || item.image.url} />
                                        </TableCell>
                                        <TableCell>
                                          <strong>{item.seoDescription}</strong>
                                          <br />
                                          <span>{item.callToAction}</span>
                                        </TableCell>
                                        <TableCell>
                                          <IconButton onClick={() => { this.deleteItemFromCarousel(idx) }}><Icon>delete</Icon></IconButton>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })
                                }
                                </TableBody>
                              </Table>
                              :
                              <div style={{ marginBottom: 24 }}>
                                <Empty
                                  title="¡No hay contenido!"
                                  description="No se ha agregado contenido al carrusel."
                                />
                              </div>
                          }
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
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
                  onClick={this.confirmCreateCarouselBlock}
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
)(CreateCarouselBlock)
