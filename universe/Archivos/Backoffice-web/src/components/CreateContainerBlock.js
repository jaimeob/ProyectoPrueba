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
import { TextField, IconButton, Snackbar, Checkbox } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'

import StoryBlock from '../components/StoryBlock.js'

import Empty from './Empty'
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

import containerBlockImg from '../resources/images/containerblock.jpg'
import containerBlockImg2 from '../resources/images/containerblock2.jpg'

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
  emojiAlias: {
    width: 14,
    marginRight: 4
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
  },
  blockType: {
    marginTop: 12,
    cursor: 'pointer',
    border: '2px solid #E8F1F4',
    borderRadius: 8,
    padding: 8,
    width: '90%',
    marginLeft: '2.5%',
    marginRight: '2.5%',
    textAlign: 'center',
    opacity: 0.5
  },
  blockTypeSelected: {
    marginTop: 12,
    cursor: 'pointer',
    border: '2px solid #E8F1F4',
    borderColor: theme.palette.primary.main,
    borderRadius: 8,
    padding: 8,
    width: '90%',
    marginLeft: '2.5%',
    marginRight: '2.5%',
    textAlign: 'center',
    opacity: 1.0
  }
})

class CreateContainerBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      carousels: [],
      selectedCarousel: null,
      blockId: null,
      selectedBlockType: null,
      content: [],
      title: ''
    }
    this.addCarousel = this.addCarousel.bind(this)
    this.deleteCarousel = this.deleteCarousel.bind(this)
    this.handleChangeTitle = this.handleChangeTitle.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseWithData = this.handleCloseWithData.bind(this)
    this.selectBlockType = this.selectBlockType.bind(this)
    this.handleChangeCarousel = this.handleChangeCarousel.bind(this)
  }

  async handleChangeCarousel(idx) {
    let carousels = this.state.carousels
    
    carousels.forEach(carousel => {
      carousel.checked = false
    })

    carousels[idx].checked = true

    this.setState({
      selectedCarousel: carousels[idx],
      carousels: carousels
    })
  }

  async componentWillMount() {
    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'blocks',
      endpoint: '/all',
      filter: {
        where: {
          blockTypeId: 15
        }
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      response.data.forEach(carousel => {
        carousel.checked = false
      })

      this.setState({
        carousels: response.data
      })
    }
  }

  selectBlockType(blockTypeId) {
    this.setState({
      selectedBlockType: blockTypeId
    })
  }

  handleChangeTitle(event) {
    this.setState({
      title: event.target.value
    })
  }

  deleteCarousel(idx) {
    let content = this.state.content
    content.splice(idx, 1)
    this.setState({
      content: content,
      openSnack: true,
      messageSnack: 'Historia eliminada exitosamente'
    })
  }

  async addCarousel() {
    let content = this.state.content
    
    if (this.state.selectedBlockType === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'Selecciona un tipo de contenedor.'
      })
      return
    } else if (this.state.selectedCarousel === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'Selecciona un carusel.'
      })
      return
    }
    
    content.push({
      type: this.state.selectedBlockType,
      carousel: this.state.selectedCarousel
    })

    let carousels = this.state.carousels
    carousels.forEach(carousel => {
      carousel.checked = false
    })

    this.setState({
      selectedBlockType: null,
      selectedCarousel: null,
      carousels: carousels,
      content: content,
      openSnack: true,
      messageSnack: 'Contenido agregado exitosamente.'
    })
  }

  handleClose() {
    this.props.handleClose()
  }

  async handleCloseWithData() {
    if (this.state.content.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Debes ingresar contenido al carrusel.'
      })
      return
    }

    let response = null
    if (this.props.editBlock) {
      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'PATCH',
        resource: 'blocks',
        endpoint: '/' + this.state.blockId +  '/edit',
        data: {
          title: this.state.title,
          description: this.state.description,
          configs: {
            title: this.state.title,
            description: this.state.description,
            content: this.state.content
          }
        }
      })
    } else {
      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
        endpoint: (this.props.landing !== undefined && this.props.landing) ? '/' + this.props.match.params.id + '/new' : '/new',
        data: {
          blockTypeId: Utils.constants.blocks.CONTAINER_BLOCK,
          title: this.state.title,
          content: this.state.content
        }
      })
    }

    if (response.status === Utils.constants.status.SUCCESS) {
      this.props.handleCloseWithData()
    }
  }

  handleRender() {
    this.setState({
      title: '',
      description: '',
      content: []
    })
    if (this.props.editBlock && this.props.selectedBlock !== null) {
      let configs = this.props.selectedBlock.configs
      this.setState({
        blockId: this.props.selectedBlock.id,
        title: configs.title,
        description: configs.description,
        content: configs.content
      })
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/editar/' + this.props.selectedBlock.id)
      } else {
        this.props.history.push('/cms/' + this.props.selectedBlock.id + '/editar')
      }
    } else {
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/bloques/nuevo/18')
      } else {
        this.props.history.push('/cms/nuevo/18')
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
          (this.props.data !== null) ?
          <div style={getModalStyle()} className={classes.container}>
            <Typography variant="h4" className={classes.modalTitle}>
              Crear nuevo contenedor de carruseles.
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
                        placeholder="Título obligatorio..."
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
                      <Typography variant="body1"><strong>1. Selecciona un tipo de contenedor.</strong></Typography>
                      <Grid container>
                        <Grid item xl={6} lg={6} md={6} xs={6} sm={6} onClick={ () => { this.selectBlockType(1) }}>
                          <div className={ (this.state.selectedBlockType === 1) ? classes.blockTypeSelected : classes.blockType}>
                            <img style={{ width: 200 }} src={containerBlockImg} />
                            <Typography variant="body1">Grid</Typography>
                          </div>
                        </Grid>
                        <Grid item xl={6} lg={6} md={6} xs={6} sm={6} onClick={ () => { this.selectBlockType(2) }}>
                          <div className={ (this.state.selectedBlockType === 2) ? classes.blockTypeSelected : classes.blockType}>
                            <img style={{ width: 200 }} src={containerBlockImg2} />
                            <Typography variant="body1">Banner</Typography>
                          </div>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1"><strong>2. Selecciona un carrusel para el contenedor seleccionado.</strong></Typography>
                      {
                        this.state.carousels.map((carousel, idx) => {
                          return (
                            <Paper style={{ marginTop: 8, marginBottom: 8 }} onClick={() => { this.handleChangeCarousel(idx) }}>
                              <Grid container>
                                <Grid xl={1} lg={1} md={1} sm={1} xs={1}>
                                  <Checkbox checked={carousel.checked} onChange={() => { this.handleChangeCarousel(idx) }}/>
                                </Grid>
                                <Grid xl={11} lg={11} md={11} sm={11} xs={11}>
                                  <StoryBlock configs={carousel.configs} />
                                </Grid>
                              </Grid>
                            </Paper>
                          )
                        })
                      }
                    </Grid>
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1"><strong>3. Confirma la selección.</strong></Typography>
                      <Button variant="contained" color="primary" style={{ width: '100%',  fontWeight: 600, fontSize: 14 }} onClick={() => { this.addCarousel() }}>AGREGAR</Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Paper className={classes.paper}>
                  <Grid container>
                    {
                      (this.state.content.length > 0) ?
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <Typography variant="body1"><strong>Contenido.</strong></Typography>
                      </Grid>
                      :
                      ''
                    }
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      {
                        (this.state.content.length > 0) ?
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                          {
                            this.state.content.map((item, idx) => {
                              return (
                                <Paper style={{ padding: 16, marginTop: 8, marginBottom: 8 }}>
                                  <strong>Tipo de contenedor: {(item.type === 1) ? 'Grid' : 'Banner'}</strong>
                                  <br />
                                  <StoryBlock configs={item.carousel.configs} />
                                </Paper>
                              )
                            })
                          }
                        </div>
                        :
                        <div style={{ marginBottom: 24 }}>
                          <Empty
                            title="¡No hay contenido!"
                            description="No se ha agregado contenido al contenedor."
                          />
                        </div>
                      }
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
              anchorOrigin={{vertical: 'top', horizontal: 'center'}}
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
)(CreateContainerBlock)
