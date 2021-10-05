'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Typography, Grid, TextField, Button, IconButton, Icon, Modal, Checkbox, Snackbar } from '@material-ui/core'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import CloseIcon from '@material-ui/icons/Close'
import Empty from '../components/Empty'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

function getModalStyle() {
  return {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }
}

const styles = theme => ({
  root: {
    position: 'absolute',
    width: '50%',
    height: 'auto',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    borderRadius: 5,
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      height: '100%',
      borderRadius: 10
    }
  },
  mainContainer: {
    width: '100%',
    padding: '0px 96px 40px 96px',
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 192px)',
      padding: '0px 48px 24px 48px'
    },
    [theme.breakpoints.down('xs')]: {
      width: 'calc(100% - 16px)',
      padding: '0px 8px 24px 8px',
    }
  },
  container: {
    marginTop: 32,
    [theme.breakpoints.down('xs')]: {
      marginTop: 16
    }
  },
  catalogsContainer: {
    overflowY: 'scroll',
    maxHeight: 320,
    minHeight: 320,
    marginTop: 32,
    [theme.breakpoints.down('xs')]: {
      marginTop: 16
    },
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
  },
  catalog: {
    width: '100%',
    border: 'solid 1px #dbdbdb',
    borderRadius: 3,
    marginTop: 8,
    padding: 12,
    [theme.breakpoints.down('xs')]: {
      padding: 8
    }
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 600
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

class CatalogModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      createCatalog: false,
      catalogs: [],
      selectedCatalogs: [],
      name: '',
      description: ''
    }

    this.getCatalogsByUserId = this.getCatalogsByUserId.bind(this)
    this.createCatalog = this.createCatalog.bind(this)
    this.saveProducts = this.saveProducts.bind(this)
    this.selectedCatalogs = this.selectedCatalogs.bind(this)
    this.deleteCatalog = this.deleteCatalog.bind(this)
    this.handleRender = this.handleRender.bind(this)
  }

  async createCatalog() {
    if (this.state.name.trim() !== '') {
      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'catalogs',
        endpoint: '/create',
        data: {
          name: this.state.name,
          description: this.state.description
        }
      })

      if (response.data !== undefined) {
        if (response.data.created) {
          this.setState({
            name: '',
            description: ''
          }, () => this.getCatalogsByUserId(response.data.id))
        }
      }
    }
  }

  async getCatalogsByUserId(idNewCatalog = null) {
    let user = await Utils.getCurrentUser()
    let selectedCatalogs = this.state.selectedCatalogs

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/catalogs'
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      let catalogs = response.data
      for (let idx in catalogs) {
        catalogs[idx]["checked"] = false
        if (idNewCatalog !== null) {
          if (catalogs[idx]["id"] === idNewCatalog) {
            catalogs[idx]["checked"] = true
            selectedCatalogs.push(catalogs[idx])
          }
        }
      }

      let create = false
      if (catalogs.length === 0) {
        create = true
      }

      this.setState({
        catalogs: catalogs,
        createCatalog: create,
        selectedCatalogs: selectedCatalogs
      })
    }
  }

  selectedCatalogs(idx) {
    let catalogs = this.state.catalogs
    let selectedCatalogs = this.state.selectedCatalogs

    selectedCatalogs = []
    catalogs.forEach((item, jdx) => {
      if (idx === jdx) {
        catalogs[idx].checked = !catalogs[idx].checked
        if (catalogs[idx].checked) {
          selectedCatalogs.push(catalogs[idx])
        }
      } else {
        if (catalogs[jdx].checked) {
          selectedCatalogs.push(item)
        }
      }
    })

    this.setState({
      catalogs: catalogs,
      selectedCatalogs: selectedCatalogs
    })
  }

  async saveProducts() {
    const self = this
    let catalog = this.props.catalogs.products
    let products = []
    let catalogs = this.state.catalogs
    let selectedCatalogs = this.state.selectedCatalogs

    if (selectedCatalogs.length > 0 && catalog.length > 0) {
      catalog.forEach((item, jdx) => {
        products[jdx] = item.code
      })

      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'PUT',
        resource: 'catalogs',
        endpoint: '/products',
        data: {
          catalogs: selectedCatalogs,
          catalog: products
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.updated) {
          for (let idx in catalogs) {
            if (catalogs[idx].checked) {
              catalogs[idx].checked = false
            }
          }

          this.setState({
            catalog: [],
            catalogs: catalogs,
            selectedCatalogs: []
          }, () => {
            self.getCatalogsByUserId()
            localStorage.removeItem(Utils.constants.localStorage.CATALOG_INIT)
            localStorage.removeItem(Utils.constants.localStorage.CATALOG)
            self.props.handleClose(true)
          })
        }
      }
    }
  }

  async deleteCatalog(catalog) {
    let newCatalogs = []
    let newSelectedCatalogs = []
    let catalogs = this.state.catalogs
    let selectedCatalogs = this.state.selectedCatalogs

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'DELETE',
      resource: 'catalogs',
      endpoint: '/' + catalog.uuid + '/delete',
    })

    if (response.status === Utils.constants.status.SUCCESS && response.data.deleted) {
      catalogs.forEach((item) => {
        if (item._id !== catalog._id) {
          newCatalogs.push(item)
        }
      })

      selectedCatalogs.forEach((item) => {
        if (item._id !== catalog._id) {
          newSelectedCatalogs.push(item)
        }
      })

      let createCatalog = false
      if (newCatalogs.length === 0) {
        createCatalog = true
      }

      this.setState({
        createCatalog: createCatalog,
        catalogs: newCatalogs,
        selectedCatalogs: newSelectedCatalogs
      })
    }
  }

  async downloadCatalog(uuid) {
    this.setState({
      openSnack: true,
      message: 'Descargando PDF.'
    })
    const API_PDF = Utils.constants.CONFIG_ENV.HOST + "/api/catalogs/" + uuid + "/download"
    window.open(API_PDF)
  }

  handleRender() {
    if (Utils.isUserLoggedIn()) {
      this.getCatalogsByUserId()
      if (Utils.isUserLoggedIn()) {
        this.setState({
          catalog: Utils.getCurrentCatalog()
        })
      }
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onRendered={this.handleRender}
        onEscapeKeyDown={() => this.props.handleClose(false)}
        onBackdropClick={() => this.props.handleClose(false)}>
        <div style={getModalStyle()} className={classes.root}>
          <IconButton style={{ float: 'right' }} onClick={() => this.props.handleClose(false)}>
            <Icon>
              <CancelOutlinedIcon />
            </Icon>
          </IconButton>
          {(this.state.createCatalog) ?
            <Grid container direction="column" className={classes.mainContainer}>
              <Grid item xs={12} style={{ borderBottom: 'solid 1px #dbdbdb', paddingBottom: 8 }}>
                <Typography variant="h1" style={{ fontSize: 32, marginBottom: 8 }}>Guardar catálogo.</Typography>
                <Typography variant="h2" className={classes.modalTitle}>Crea un nuevo catálogo para guardar tus productos seleccionados.</Typography>
              </Grid>
              <Grid item xs={12} className={classes.container} >
                <TextField
                  value={this.state.name}
                  onChange={(event) => { this.setState({ name: event.target.value }) }}
                  label="Nombre"
                  fullWidth
                  variant="outlined" />
              </Grid>
              <Grid item xs={12} className={classes.container}>
                <TextField
                  value={this.state.description}
                  onChange={(event) => { this.setState({ description: event.target.value }) }}
                  label="Descripción (opcional)"
                  multiline
                  fullWidth
                  rows={5}
                  variant="outlined" />
              </Grid>
              <Grid container direction="row" className={classes.container}>
                <Grid item style={{ paddingRight: 8 }}>
                  <Button disabled={this.state.name.trim() === ''} variant="contained" color="primary" onClick={() => this.createCatalog()}>
                    CREAR CATÁLOGO
                  </Button>
                </Grid>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    if (this.state.catalogs.length > 0) {
                      this.setState({
                        createCatalog: false,
                        name: '',
                        description: ''
                      })
                    } else {
                      this.props.handleClose(false)
                    }
                  }}>
                  CANCELAR
                </Button>
              </Grid>
            </Grid>
            :
            <Grid container direction="column" className={classes.mainContainer}>
              <Grid item xs={12} style={{ borderBottom: 'solid 1px #dbdbdb', paddingBottom: 8 }}>
                <Typography variant="h1" style={{ fontSize: 32, marginBottom: 8 }}>Guardar catálogo.</Typography>
                <Typography variant="h2" className={classes.modalTitle}>Elige o crea un catálogo para guardar tus productos seleccionados</Typography>
              </Grid>
              <Grid item className={classes.catalogsContainer}>
                {
                  (this.state.catalogs.length === 0) ?
                    <Empty
                      isLoading={true}
                      title="Cargando catálogos..."
                      description="Espere un momento por favor."
                    />
                    :
                    <div >
                      {
                        (this.state.catalogs.map((catalog, idx) => {
                          return (
                            <Grid key={idx} container direction="row" justify="space-between" alignContent="center" className={classes.catalog}>
                              <Grid container direction="column" style={{ width: 'auto' }}>
                                <Typography style={{ width: '100%', fontSize: 16 }}>
                                  <strong>{catalog.name}</strong>
                                </Typography>
                                {(catalog.products.length === 1) ?
                                  <Typography style={{ width: '100%', fontSize: 14, color: 'rgb(0, 0, 0, 0.54)' }}>1 Producto</Typography>
                                  :
                                  <Typography style={{ width: '100%', fontSize: 14, color: 'rgb(0, 0, 0, 0.54)' }}>{catalog.products.length} Productos</Typography>
                                }
                              </Grid>
                              <Grid container direction="row" justify="space-between" style={{ width: 'auto' }}>
                                {/* <CopyToClipboard
                                  onCopy={() => {
                                    this.setState({
                                      openSnack: true,
                                      message: 'Link copiado al portapapeles.'
                                    })
                                  }}
                                  text={Utils.constants.CONFIG_ENV.HOST + '/api/catalogs/' + catalog.uuid + '/download'}
                                >
                                  <Button color="primary" style={{ fontSize: 12 }}>
                                    COPIAR LINK
                            </Button>
                                </CopyToClipboard> */}
                                {/* <Button color="primary" style={{ fontSize: 12 }} onClick={() => this.downloadCatalog(catalog.uuid)}>
                                  DESCARGAR PDF
                            </Button> */}
                                <Checkbox
                                  checked={catalog.checked}
                                  color="primary"
                                  onChange={() => this.selectedCatalogs(idx)}
                                />
                                {/* <IconButton onClick={() => { this.deleteCatalog(catalog) }}>
                                  <Icon>delete</Icon>
                                </IconButton> */}
                              </Grid>
                            </Grid>
                          )
                        })
                        )
                      }
                    </div>
                }
              </Grid>
              <Grid container direction="row" className={classes.container}>
                {
                  (this.state.catalogs.length > 0) ?
                    <Grid item style={{ paddingRight: 8 }}>
                      <Button disabled={this.state.selectedCatalogs.length === 0} variant="contained" color="primary" onClick={() => this.saveProducts()}>
                        GUARDAR
                    </Button>
                    </Grid>
                    :
                    ''
                }
                <Button variant="outlined" color="primary" onClick={() => this.setState({ createCatalog: true })}>
                  CREAR NUEVO CATÁLOGO
                </Button>
              </Grid>
            </Grid>
          }
          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.state.openSnack}
            onClose={() => this.setState({ openSnack: false })}
            message={
              <span>{this.state.message}</span>
            }
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => this.setState({ openSnack: false })}
              >
                <CloseIcon />
              </IconButton>
            ]} />
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(CatalogModal)
