import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Hidden, Icon, Modal, Card, CardContent, Menu, MenuItem, Button, Typography, Snackbar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'

import CloseIcon from '@material-ui/icons/Close'

// Utils
import Utils from '../../resources/Utils'
import { requestAPI } from '../../api/CRUD'
import Router from 'next/router'
import Link from 'next/link'

// Components
import MyAccountMenu from '../../components/MyAccountMenu'
import Empty from '../../components/Empty'
import CatalogForm from '../../components/CatalogFormDesign'
import _ from 'lodash'

function getModalStyle() {
  const top = 50
  const left = 50
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  }
}

const styles = (theme) => ({
  largeForm: {
    overflowY: 'scroll',
    overflowX: 'hidden',
    position: 'absolute',
    width: theme.spacing(100),
    minWidth: theme.spacing(100),
    maxWidth: theme.spacing(100),
    maxHeight: 'calc(100vh - 100px)',
    minHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '2px',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      background: theme.palette.background.paper,
      minWidth: '100%',
      width: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      paddingLeft: '2.5%',
      paddingRight: '2.5%'
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
  },
  root: {
    width: '100%',
    padding: '16px 0px 32px 0px',
    minHeight: 500,
    backgroundColor: "#F4F4F4"
  },
  container: {
    padding: '48px 32px 32px 0px',
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
      padding: '16px 16px 16px 16px',
    },
    [theme.breakpoints.down('xs')]: {
      padding: '16px 16px 16px 16px',
    }
  },
  catalog: {
    padding: 24,
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 10
  }
})

class MyCatalogs extends Component {
  constructor(props) {
    super(props)

    this.state = {
      redirect: false,
      catalogs: [],
      emptyTitle: '¡No hay  catálogos!',
      emptyDescription: 'Aún no tienes catálogos creados.',
      emptyButtonTitle: '',
      loading: true,
      options: undefined,
      openCatalogForm: false,
      anchorEl: null,
      currentCatalog: undefined,
      openSnack: false,
      openDeleteDialog: false,
      snackMessage: ''
    }

    this.getCatalogs = this.getCatalogs.bind(this)
    this.closeCatalogForm = this.closeCatalogForm.bind(this)
    this.changeCurrentCatalog = this.changeCurrentCatalog.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.showSnackbarMessage = this.showSnackbarMessage.bind(this)
  }

  showSnackbarMessage(message) {
    this.setState({
      openSnack: true,
      snackMessage: message
    })
  }

  async handleDelete() {
    this.setState({
      openSnack: true,
      snackMessage: 'Eliminando...',
      openDeleteDialog: false
    })

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'DELETE',
      resource: 'catalogs',
      endpoint: `/${this.state.currentCatalog.uuid}/delete`
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.setState({
        catalogs: response.data,
        openSnack: true,
        snackMessage: 'Catálogo eliminado con éxito',
        openDeleteDialog: false
      })
    } else {
      this.setState({
        openSnack: true,
        snackMessage: 'Ocurrió un error al eliminar el catálogo',
        openDeleteDialog: false
      })
    }

    this.getCatalogs()
  }

  changeCurrentCatalog(catalog) {
    this.setState({ currentCatalog: undefined })
    this.setState({ currentCatalog: catalog })
  }

  closeCatalogForm() {
    this.setState({ openCatalogForm: false })
  }

  async componentWillMount() {
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      this.getCatalogs()
    } else {
      Router.push('/')
    }
  }

  async getCatalogs() {
    this.setState({ loading: true })
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/catalogs'
    })

    this.setState({ loading: false })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.setState({
        catalogs: response.data
      })
    }
  }

  render() {
    const { classes } = this.props
    return this.state.redirect ? (
      <Redirect to={Utils.constants.paths.signUp} />
    ) : (
      <Grid container className={classes.root}>
        <Hidden smDown>
          <Grid item md={4}>
            <MyAccountMenu text={'Mis catálogos'} />
          </Grid>
        </Hidden>
        <Grid item md={8} xs={12} className={classes.container}>
          <Typography style={{ fontSize: 28, marginBottom: 10 }}><strong>Mis catálogos</strong></Typography>
          {
          this.state.catalogs.length > 0 ? (
            this.state.catalogs.map((catalog, idx) => {
              return (
                <Grid key={idx} container direction='row' justify='space-between' alignContent='center' className={classes.catalog}>
                  <Grid item xs={9} sm={10}>
                    <Grid container direction='column' style={{ width: 'auto' }}>
                      <Typography style={{ width: '100%', fontSize: 16 }}>
                        <strong>{catalog.name}</strong>
                      </Typography>
                      {catalog.products === 1 ? (
                        <Typography style={{ width: '100%', fontSize: 14, color: 'rgb(0, 0, 0, 0.54)' }}>1 producto</Typography>
                      ) : (
                        <Typography style={{ width: '100%', fontSize: 14, color: 'rgb(0, 0, 0, 0.54)' }}>{catalog.products} productos</Typography>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item xs={3} sm={2}>
                    <Grid container direction='row' justify='flex-end' alignContent='center' style={{ height: '100%' }}>
                      <Link href={'/mi-cuenta/catalogo/' + catalog.uuid}>
                        <IconButton
                        // onClick={(event) => {
                        //   this.setState({ anchorEl: event.currentTarget })
                        //   this.changeCurrentCatalog(catalog)
                        // }}
                        >
                          <Icon>
                            <img height='24' width='24' src={'/icon-arrow.svg'} alt='' />
                          </Icon>
                        </IconButton>
                      </Link>
                    </Grid>
                  </Grid>
                </Grid>
              )
            })
          ) : (
            <div style={{ width: '100%', marginBottom: 32 }}>
              {!this.state.loading ? (
                // <Empty
                //   emptyImg={this.state.emptyImage}
                //   title={this.state.emptyTitle}
                //   description={this.state.emptyDescription}
                //   buttonTitle={this.state.emptyButtonTitle}
                // />
                <CatalogForm options={this.state.options} uuid={this.props.app.data.uuid} businessUnit={this.props.app.data.configs.businessUnit} getCatalogs={this.getCatalogs} />
              ) : (
                <Empty isLoading={true} title='Cargando...' description='Espera un momento por favor.' />
              )}
            </div>
          )}
          {this.state.catalogs.length > 0 ? (
            <Grid xs={12} container justify='center'>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  onClick={() => {
                    this.setState({ openCatalogForm: true, currentCatalog: undefined })
                  }}
                >
                  Crear catálogo
                </Button>
              </Grid>
            </Grid>
          ) : (
            ''
          )}
        </Grid>
        <Modal
          open={this.state.openCatalogForm}
          onClose={this.closeCatalogForm}
          onEscapeKeyDown={this.closeCatalogForm}
          onBackdropClick={this.closeCatalogForm}>
            <div style={getModalStyle()} className={`${classes.largeForm} ${classes.scrollBar}`}>
              <CatalogForm
                options={this.state.options}
                uuid={this.props.app.data.uuid}
                businessUnit={this.props.app.data.configs.businessUnit}
                getCatalogs={this.getCatalogs}
                isFormInModal={true}
                closeCatalogForm={this.closeCatalogForm}
                currentCatalog={this.state.currentCatalog}
                showSnackbarMessage={this.showSnackbarMessage }/>
            </div>
        </Modal>
        <Menu
          anchorEl={this.state.anchorEl}
          keepMounted
          open={Boolean(this.state.anchorEl)}
          onClose={() => {
            this.setState({ anchorEl: null })
          }}
        >
          <MenuItem
            onClick={() => {
              this.setState({
                anchorEl: null,
                openCatalogForm: true
              })
            }}
          >
             Editar
          </MenuItem>
          <MenuItem
            onClick={() => {
              this.setState({ anchorEl: null, openDeleteDialog: true })
            }}
          >
            Eliminar
          </MenuItem>
          <MenuItem
            onClick={async () => {
              this.setState({ anchorEl: null })

              window.open(Utils.constants.CONFIG_ENV.HOST + '/api/catalogs/' + this.state.currentCatalog.uuid + '/download')
            }}
          >
             Descargar PDF
          </MenuItem>
        </Menu>

        <Dialog open={this.state.openDeleteDialog}>
          <DialogTitle>¿Desea eliminar el catálogo?</DialogTitle>
          <DialogContent>Al eliminar el catálogo dejará de estar disponible para generar los archivos PDF</DialogContent>
          <DialogActions>
            <Button
              variant='outlined'
              color='secondary'
              style={{ border: '2px solid' }}
              onClick={() =>
                this.setState({
                  openDeleteDialog: false
                })
              }
            >
              Cancelar
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                this.setState({
                  openDeleteDialog: false
                })
                this.handleDelete()
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.state.openSnack}
          onClose={() => {
            this.setState({ openSnack: false })
          }}
          message={<span>{this.state.snackMessage}</span>}
          action={[
            <IconButton
              key='close'
              aria-label='Close'
              color='inherit'
              onClick={() => {
                this.setState({ openSnack: false })
              }}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      </Grid>
    )
  }
}

const mapStateToProps = (state) => ({ ...state })

export default compose(withStyles(styles), connect(mapStateToProps, null))(MyCatalogs)
