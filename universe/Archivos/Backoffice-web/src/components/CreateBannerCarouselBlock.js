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
import { Table, TableHead, TableBody, TableCell, TableRow, TextField, IconButton, Snackbar, Icon } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'

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
    width: theme.spacing.unit * '80',
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

class CreateBannerCarouselBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      blockTypeId: null,
      blockId: null,
      title: '',
      urlImage: '',
      callToAction: '',
      fixes: [
        {
          image: '',
          cta: {
            link: ''
          }
        },
        {
          image: '',
          cta: {
            link: ''
          }
        }
      ],
      banners: []
    }
    this.handleChangeTitle = this.handleChangeTitle.bind(this)
    this.handleChangeURLImage = this.handleChangeURLImage.bind(this)
    this.handleChangeCallToAction = this.handleChangeCallToAction.bind(this)
    this.addBannerToCarousel = this.addBannerToCarousel.bind(this)
    this.deleteBanner = this.deleteBanner.bind(this)
    this.handleChangeURLImageFixes = this.handleChangeURLImageFixes.bind(this)
    this.handleChangeCallToActionFixes = this.handleChangeCallToActionFixes.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseWithData = this.handleCloseWithData.bind(this)
  }

  handleChangeTitle(event) {
    this.setState({
      title: event.target.value
    })
  }

  handleChangeURLImage(event) {
    this.setState({
      urlImage: event.target.value.trim()
    })
  }

  handleChangeURLImageFixes(event, idx) {
    let fixes = this.state.fixes
    fixes[idx].image = event.target.value.trim()
    this.setState({
      fixes: fixes
    })
  }

  handleChangeCallToAction(event) {
    this.setState({
      callToAction: event.target.value.trim()
    })
  }

  handleChangeCallToActionFixes(event, idx) {
    let fixes = this.state.fixes
    fixes[idx].cta.link = event.target.value.trim()
    this.setState({
      fixes: fixes
    })
  }

  async addBannerToCarousel() {
    let banners = this.state.banners

    if (this.state.urlImage.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'La url de la imagen es obligatoria.'
      })
      return
    } else {
      let responseLoadImage = await Utils.loadImage(this.state.urlImage)
      
      if (responseLoadImage === undefined) {
        this.setState({
          openSnack: true,
          messageSnack: 'Imagen incorrecta. Revisa la URL de la imagen.'
        })
        return
      }

      if (responseLoadImage.width > 600) {
        this.setState({
          openSnack: true,
          messageSnack: 'Ancho de la imagen no recomendado. Ajusta las medidas de la imagen (Ancho: 600).'
        })
        return
      }

      if (responseLoadImage.height > 600) {
        this.setState({
          openSnack: true,
          messageSnack: 'Alto de la imagen no recomendado. Ajusta las medidas de la imagen (Alto: 600).'
        })
        return
      }

      if (!this.state.urlImage.match(/.(jpeg|gif)$/i)) {
        this.setState({
          openSnack: true,
          messageSnack: 'El formato de la imagen debe ser .jpeg o .gif'
        })
        return
      }
    }
    
    banners.push({
      image: this.state.urlImage,
      cta: {
        link: this.state.callToAction
      }
    })
    
    this.setState({
      banners: banners,
      openSnack: true,
      messageSnack: 'Contenido agregado exitosamente.',
      urlImage: '',
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
    if (this.state.title.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El título del bloque es obligatorio. Añade un título que identifique al nuevo bloque.'
      })
      return
    }

    if (this.state.banners.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Debes ingresar contenido al carrusel de banners.'
      })
      return
    }

    if (this.state.fixes[0].image.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'La url de la imagen del banner fijo uno es obligatoria.'
      })
      return
    } else {
      let responseLoadImage = await Utils.loadImage(this.state.fixes[0].image)
      
      if (responseLoadImage === undefined) {
        this.setState({
          openSnack: true,
          messageSnack: 'Imagen del banner fijo uno incorrecta. Revisa la URL de la imagen del banner fijo uno.'
        })
        return
      }

      if (responseLoadImage.width > 600) {
        this.setState({
          openSnack: true,
          messageSnack: 'Ancho de la imagen del banner fijo uno no recomendado. Ajusta las medidas (Ancho: 600).'
        })
        return
      }

      if (responseLoadImage.height> 292) {
        this.setState({
          openSnack: true,
          messageSnack: 'Ancho de la imagen del banner fijo uno no recomendado. Ajusta las medidas (Ancho: 292).'
        })
        return
      }

      if (!this.state.fixes[0].image.match(/.(jpeg|gif)$/i)) {
        this.setState({
          openSnack: true,
          messageSnack: 'El formato de la imagen del banner fijo uno debe ser .jpeg o .gif'
        })
        return
      }
    }

    // Dos
    if (this.state.fixes[1].image.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'La url de la imagen del banner fijo dos es obligatoria.'
      })
      return
    } else {
      let responseLoadImage = await Utils.loadImage(this.state.fixes[1].image)
      
      if (responseLoadImage === undefined) {
        this.setState({
          openSnack: true,
          messageSnack: 'Imagen del banner fijo dos incorrecta. Revisa la URL de la imagen del banner fijo dos.'
        })
        return
      }

      if (responseLoadImage.width > 600) {
        this.setState({
          openSnack: true,
          messageSnack: 'Ancho de la imagen del banner fijo dos no recomendado. Ajusta las medidas (Ancho: 600).'
        })
        return
      }

      if (responseLoadImage.height > 292) {
        this.setState({
          openSnack: true,
          messageSnack: 'Ancho de la imagen del banner fijo dos no recomendado. Ajusta las medidas (Ancho: 292).'
        })
        return
      }

      if (!this.state.fixes[1].image.match(/.(jpeg|gif)$/i)) {
        this.setState({
          openSnack: true,
          messageSnack: 'El formato de la imagen del banner fijo dos debe ser .jpeg o .gif'
        })
        return
      }
    }

    let response = null
    let data = {}
    if (this.props.editBlock) {
      if (this.props.landing) {
        data = {
          blockTypeId: this.state.blockTypeId,
          title: this.state.title,
          configs: {
            fixes: this.state.fixes,
            banners: this.state.banners
          },
          order: this.props.selectedBlock.order,
          status: this.props.selectedBlock.status,
          createdAt: this.props.selectedBlock.createdAt,
          id: this.props.selectedBlock.id,
          landingId: this.props.selectedBlock.landingId,
          instanceId: this.props.selectedBlock.instanceId
        }
      } else {
        data = {
          blockTypeId: this.state.blockTypeId,
          title: this.state.title,
          configs: {
            fixes: this.state.fixes,
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
          title: this.state.title,
          blockTypeId: 3,
          configs: {
            fixes: this.state.fixes,
            banners: this.state.banners
          }
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.added) {
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
      this.setState({
        blockTypeId: this.props.selectedBlock.blockTypeId,
        blockId: this.props.selectedBlock.id,
        title: this.props.selectedBlock.title,
        fixes: this.props.selectedBlock.configs.fixes,
        banners: this.props.selectedBlock.configs.banners
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
      blockTypeId: null,
      blockId: null,
      title: '',
      urlDesktopBanner: '',
      urlMobileBanner: '',
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
          <div style={getModalStyle()} className={classes.container}>
            <Typography variant="h4" className={classes.modalTitle}>
              Crear nuevo banner carrusel.
            </Typography>
            <Typography variant="body2">
              Ingresa los datos del nuevo bloque.
            </Typography>
            <Grid container style={{ marginTop: 8 }}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Typography variant="body1"><strong>Datos generales.</strong></Typography>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Título *"
                        placeholder="Título..."
                        value={this.state.title}
                        onChange={ (event) => { this.handleChangeTitle(event) } }
                        autoFocus={true}
                      />
                    </Grid>
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1"><strong>Carrusel de banners</strong></Typography>
                    </Grid>
                    <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="URL imagen .jpeg o .gif *"
                        placeholder="Resolución recomendada: 600 x 600"
                        value={this.state.urlImage}
                        onChange={ (event) => { this.handleChangeURLImage(event) } }
                      />
                      <TextField
                        className={classes.textFieldLarge}
                        style={{ marginBottom: 8 }}
                        label="Call To Action (URL destino al hacer click) *"
                        placeholder="Si es una URL interna usar / (diagonal) seguido de la ruta interna."
                        value={this.state.callToAction}
                        onChange={ (event) => { this.handleChangeCallToAction(event) } }
                      />
                    </Grid>
                    <Grid item xl={4} lg={4}>
                      <Button variant="contained" color="primary" style={{ marginLeft: 8, width: '100%' }} className={classes.primaryButton} onClick={() => { this.addBannerToCarousel() }}>AGREGAR</Button>
                      <img style={{ width: '90%', padding: 16 }} src={this.state.urlImage} />
                    </Grid>
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container>
                    {
                      (this.state.banners.length > 0) ?
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <Typography variant="body2" style={{ fontSize: 14 }}>Contenido del carrusel de banners</Typography>
                      </Grid>
                      :
                      ''
                    }
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      {
                        (this.state.banners.length > 0) ?
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
                                      <img style={{ width: 50 }} src={item.image} />
                                    </TableCell>
                                    <TableCell>
                                      <strong>{item.image}</strong>
                                      <br />
                                      <span>{item.cta.link}</span>
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
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1"><strong>Banner fijos (uno)</strong></Typography>
                    </Grid>
                    <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="URL imagen .jpeg o .gif *"
                        placeholder="Resolución recomendada: 600 x 292"
                        value={this.state.fixes[0].image}
                        onChange={ (event) => { this.handleChangeURLImageFixes(event, 0) } }
                      />
                    </Grid>
                    <Grid item xl={4} lg={4}>
                      <img style={{ width: '90%', padding: 16 }} src={this.state.fixes[0].image} />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        style={{ marginBottom: 8 }}
                        label="Call To Action (URL destino al hacer click) *"
                        placeholder="Si es una URL interna usar / (diagonal) seguido de la ruta interna."
                        value={this.state.fixes[0].cta.link}
                        onChange={ (event) => { this.handleChangeCallToActionFixes(event, 0) } }
                      />
                    </Grid>
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1"><strong>Banner fijos (dos)</strong></Typography>
                    </Grid>
                    <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="URL imagen .jpeg o .gif *"
                        placeholder="Resolución recomendada: 600 x 292"
                        value={this.state.fixes[1].image}
                        onChange={ (event) => { this.handleChangeURLImageFixes(event, 1) } }
                      />
                    </Grid>
                    <Grid item xl={4} lg={4}>
                      <img style={{ width: '90%', padding: 16 }} src={this.state.fixes[1].image} />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        style={{ marginBottom: 8 }}
                        label="Call To Action (URL destino al hacer click) *"
                        placeholder="Si es una URL interna usar / (diagonal) seguido de la ruta interna."
                        value={this.state.fixes[1].cta.link}
                        onChange={ (event) => { this.handleChangeCallToActionFixes(event, 1) } }
                      />
                    </Grid>
                  </Grid>
                </Paper>
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
              anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
              open={this.state.openSnack}
              onClose={() => { this.setState({ openSnack: false, messageSnack: '' })}}
              message={
                <span>{this.state.messageSnack}</span>
              }
              action={[
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={() => { this.setState({ openSnack: false, messageSnack: '' })}}
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
)(CreateBannerCarouselBlock)
