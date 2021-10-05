'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Checkbox, Icon, Button, Modal, Typography, Paper, Grid, TextField, IconButton, Snackbar } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'

import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Uploader from './Uploader'
import Empty from './Empty'


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
    width: theme.spacing.unit * 150,
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

class CreateGridBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editMode: [],
      openSnack: false,
      messageSnack: '',
      uploader: [],
      grid: [],
      blockTypeId: null,
      blockId: null,
      identifier: '',
      fullWidth: false,
      gridMobile: false,
      paddingTop: '0',
      paddingBottom: '0',
      heightBanner: '400',
      separationItems: '16',
      borderRadius: '0',
      backgroundColor: '',
      columns: '' // 2, 3, 4, 6
    }
    this.handleChangeIdentifier = this.handleChangeIdentifier.bind(this)
    this.handleChangeColumns = this.handleChangeColumns.bind(this)
    this.addToGrid = this.addToGrid.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.createNewBlock = this.createNewBlock.bind(this)
    this.handleChangePaddingTop = this.handleChangePaddingTop.bind(this)
    this.handleChangePaddingBottom = this.handleChangePaddingBottom.bind(this)
    this.handleChangeHeightBanner = this.handleChangeHeightBanner.bind(this)
    this.handleChangeSeparationItems = this.handleChangeSeparationItems.bind(this)
    this.handleChangeBorderRadius = this.handleChangeBorderRadius.bind(this)
    this.handleChangeBackgroundColor = this.handleChangeBackgroundColor.bind(this)
  }

  handleChangeIdentifier(event) {
    this.setState({
      identifier: event.target.value
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
      if (Number(event.target.value.trim()) > 50) {
        borderRadius = '50'
      }
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

  handleChangeColumns(event) {
    let grid = this.state.grid
    let uploader = this.state.uploader
    let editMode = this.state.editMode
    let columns = Number(event.target.value.trim())
    if (columns === 0) {
      this.setState({
        columns: '',
        grid: [],
        uploader: []
      })
    }
    else if (columns !== 2 && columns !== 3 && columns !== 4 && columns !== 6) {
      this.setState({
        openSnack: true,
        messageSnack: 'Ingresa un valor válido.'
      })
      return
    } else {
      grid = []
      for (var i = 0; i < columns; i ++) {
        editMode.push(true)
        uploader.push(false)
        grid.push({
          seoDescription: '',
          image: [],
          callToAction: ''
        })
      }
      this.setState({
        columns: columns,
        grid: grid,
        uploader: uploader
      })
    }
  }

  addToGrid(event, idx, type) {
    let grid = this.state.grid
    if (type === 'image') {
      grid[idx][type] = event
      let uploader = this.state.uploader
      uploader[idx] = false
      this.setState({
        grid: grid,
        uploader: uploader
      })
    } else {
      grid[idx][type] = event.target.value
      this.setState({
        grid: grid
      })
    }
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  async createNewBlock() {
    if (this.state.identifier.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El identificador del bloque es obligatorio. Ingresa un identificador al nuevo bloque.'
      })
      return
    }

    if (Number(this.state.columns) <= 0 || Number(this.state.columns) !== 2 && Number(this.state.columns) !== 3 && Number(this.state.columns) !== 4 && Number(this.state.columns) !== 6) {
      this.setState({
        openSnack: true,
        messageSnack: 'Ingresa un número de columnas válido.'
      })
      return
    }

    let error = false
    this.state.grid.forEach((item) => {
      if (item.seoDescription.trim().length <= 0 || item.image.length <= 0) {
        error = true
      }
    })

    if (error) {
      this.setState({
        openSnack: true,
        messageSnack: 'Falta información en los items del grid. Revisa las descripciones SEO y/o imágenes.'
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
          v: this.props.selectedBlock.v,
          status: this.props.selectedBlock.status,
          configs: {
            fullWidth: this.state.fullWidth,
            gridMobile: this.state.gridMobile,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 400,
            separationItems: !Utils.isEmpty(this.state.separationItems) ? Number(this.state.separationItems) : 16,
            borderRadius: !Utils.isEmpty(this.state.borderRadius) ? Number(this.state.borderRadius) : 0,
            backgroundColor: this.state.backgroundColor.length === 6 ? this.state.backgroundColor : '',
            columns: Number(this.state.columns),
            grid: this.state.grid
          },
          createdAt: this.props.selectedBlock.createdAt
        }
      } else {
        data = {
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          configs: {
            fullWidth: this.state.fullWidth,
            gridMobile: this.state.gridMobile,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 400,
            separationItems: !Utils.isEmpty(this.state.separationItems) ? Number(this.state.separationItems) : 16,
            borderRadius: !Utils.isEmpty(this.state.borderRadius) ? Number(this.state.borderRadius) : 0,
            backgroundColor: this.state.backgroundColor.length === 6 ? this.state.backgroundColor : '',
            columns: Number(this.state.columns),
            grid: this.state.grid
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
          blockTypeId: 2,
          fullWidth: this.state.fullWidth,
          gridMobile: this.state.gridMobile,
          paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
          paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
          heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 400,
          separationItems: !Utils.isEmpty(this.state.separationItems) ? Number(this.state.separationItems) : 16,
          borderRadius: !Utils.isEmpty(this.state.borderRadius) ? Number(this.state.borderRadius) : 0,
          backgroundColor: this.state.backgroundColor.length === 6 ? this.state.backgroundColor : '',
          columns: Number(this.state.columns),
          grid: this.state.grid
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
      let grid = []
      let editMode = []
      this.props.selectedBlock.configs.grid.forEach(item => {
        editMode.push(false)
        grid.push({
          seoDescription: item.seoDescription,
          image: [item.image],
          callToAction: item.callToAction
        })
      })

      this.setState({
        editMode: editMode,
        blockTypeId: this.props.selectedBlock.blockTypeId,
        blockId: this.props.selectedBlock.id,
        identifier: this.props.selectedBlock.identifier,
        fullWidth: this.props.selectedBlock.configs.fullWidth,
        gridMobile: this.props.selectedBlock.configs.gridMobile,
        paddingTop: String(this.props.selectedBlock.configs.paddingTop) || '0',
        paddingBottom: String(this.props.selectedBlock.configs.paddingBottom) || '0',
        heightBanner: String(this.props.selectedBlock.configs.heightBanner) || '400',
        separationItems: String(this.props.selectedBlock.configs.separationItems) || '16',
        borderRadius: String(this.props.selectedBlock.configs.borderRadius) || '0',
        backgroundColor: String(this.props.selectedBlock.configs.backgroundColor) || '',
        columns: String(this.props.selectedBlock.configs.columns),
        grid: grid
      })
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/editar/' + this.props.selectedBlock.id)
      } else {
        this.props.history.push('/cms/' + this.props.selectedBlock.id + '/editar')
      }
    } else {
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/bloques/nuevo/1')
      } else {
        this.props.history.push('/cms/nuevo/2')
      }
    }
  }

  clearData() {
    this.setState({
      editMode: [],
      openSnack: false,
      messageSnack: '',
      uploader: [],
      grid: [],
      blockTypeId: null,
      blockId: null,
      identifier: '',
      fullWidth: false,
      gridMobile: false,
      paddingTop: '0',
      paddingBottom: '0',
      heightBanner: '400',
      separationItems: '16',
      borderRadius: '0',
      backgroundColor: '',
      columns: '' // 2, 3, 4, 6
    })
  }

  render() {
    const { classes } = this.props
    const self = this

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
                  Crear nuevo bloque Grid.
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
                        disabled={(this.state.grid.length > 0) ? true : false}
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
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Num. columnas (2, 3, 4, 6)"
                        placeholder="Ingresa un número de columnas válida..."
                        value={this.state.columns}
                        disabled={this.props.editBlock}
                        onChange={ (event) => { this.handleChangeColumns(event) } }
                      />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxGridMobile" style={{ marginTop: -2 }} checked={this.state.gridMobile} onChange={() => { this.setState({ gridMobile: !this.state.gridMobile }) }} />
                      <label for="checkboxGridMobile"><strong>Grid en versión móvil.</strong></label>
                    </Grid>
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1"><strong>Contenido del bloque.</strong></Typography>
                    </Grid>
                    {
                      this.state.grid.map((grid, key) => {
                        return (
                          <Grid item key={key} xl={12 / self.state.columns} lg={12 / self.state.columns} md={12 / self.state.columns} sm={12} xs={12}>
                            <Grid container>
                              <Grid item xl={12} style={{ padding: 6 }}>
                                {
                                  (!this.state.editMode[key]) ?
                                  <>
                                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                    <img style={{ width: 50, marginRight: 8 }} src={grid.image[0].url} />
                                    <IconButton onClick={() => {
                                      let editMode = this.state.editMode
                                      let grid = this.state.grid
                                      editMode[key] = true
                                      grid[key].seoDescription = ''
                                      grid[key].image = []
                                      grid[key].callToAction = ''
                                      this.setState({
                                        editMode: editMode,
                                        grid: grid
                                      })
                                    }}><Icon>delete</Icon></IconButton>
                                    <br />
                                    <strong>{grid.seoDescription}</strong>
                                    <br />
                                    <Typography variant="body1">{grid.callToAction}</Typography>
                                  </Grid>
                                  </>
                                  :
                                  <>
                                    <TextField
                                      className={classes.textFieldLarge}
                                      label="Descripción SEO *"
                                      placeholder="Describe tu imagen, se usará para el SEO..."
                                      value={this.state.grid[key].seoDescription}
                                      onChange={ (event) => { this.addToGrid(event, key, 'seoDescription') } }
                                    />
                                    {
                                      (this.state.grid[key].image.length > 0) ?
                                        <div style={{ marginTop: 8 }}>
                                          <label><strong>Imagen cargada:</strong> {this.state.grid[key].image[0].name}</label>
                                        </div>
                                        :
                                        ''
                                    }
                                    <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                                      let uploader = this.state.uploader
                                      uploader[key] = true
                                      this.setState({ uploader: uploader })
                                    }}>
                                      SUBIR IMAGEN
                                    </Button>
                                    <Uploader
                                      open={this.state.uploader[key]}
                                      host={Utils.constants.HOST}
                                      title="Subir banner"
                                      description={"Solo se permite formato .webp. Ancho máximo " + Math.round(2340 / Number(this.state.columns)) + "px. Altura máxima " + this.state.heightBanner + "px."}
                                      limit={1}
                                      use="banners"
                                      docs={this.state.grid[key].image}
                                      validFormats={['image/webp']}
                                      hideComments={true}
                                      minWidth={1}
                                      maxWidth={Math.round(2340 / Number(this.state.columns))}
                                      minHeight={Number(this.state.heightBanner)}
                                      maxHeight={Number(this.state.heightBanner)}
                                      maxSize={500000}
                                      handleCloseWithData={(docs, deletedBlocks) => { this.addToGrid(docs, key, 'image') }}
                                      handleClose={() => { 
                                        let uploader = this.state.uploader
                                        uploader[key] = false
                                        this.setState({ uploader: uploader })
                                      }}
                                    />
                                    <TextField
                                      className={classes.textFieldLarge}
                                      label="CTA URL"
                                      placeholder="URL Call To Action..."
                                      value={this.state.grid[key].callToAction}
                                      onChange={ (event) => { this.addToGrid(event, key, 'callToAction') } }
                                    />
                                  </>
                                }
                              </Grid>
                            </Grid>
                          </Grid>
                        )
                      })
                    }
                    {
                      (this.state.grid.length === 0) ?
                      <Empty
                        title="No hay contenido"
                        description="Especificar número de columnas."
                      />
                      :
                      ''
                    }
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            <div className={classes.actions}>
              <Button
                onClick={this.handleClose}
              >
                CERRAR
              </Button>
              <Button
                  color="primary"
                  variant="contained"
                  onClick={this.createNewBlock}
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
)(CreateGridBlock)
