import React, { Component } from 'react'
import compose from 'recompose/compose'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { FacebookShareButton, FacebookIcon, WhatsappIcon, WhatsappShareButton } from 'react-share'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Modal, Card, CardContent, Grid, Hidden, Typography, Icon, IconButton, Button, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import {WhatsApp, Facebook, GetApp, Edit, Link, Close} from '@material-ui/icons'
import Router from 'next/router'
import CatalogForm from '../../components/CatalogFormDesign'

// Utils
import Utils from '../../resources/Utils'
import { requestAPI } from '../../api/CRUD'

// Components
import MyAccountMenu from '../../components/MyAccountMenu'
import Empty from '../../components/Empty'
import ProductCard from '../../components/ProductCard'

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
    padding: '38px 32px 32px 0px',
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
      padding: '16px 16px 16px 16px',
    },
    [theme.breakpoints.down('xs')]: {
      padding: '16px 16px 16px 16px',
    }
  },
  title: {
    width: '100%',
    fontSize: '36px',
    color: '#000000',
    [theme.breakpoints.down('sm')]: {
      margin: '8px 0px 8px 0px'
    }
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(0, 0, 0, 0.54)",
    [theme.breakpoints.down('xs')]: {
      fontSize: 16
    }
  },
  productCard: {
    width: '90%',
    padding: 16,
    margin: '0px auto 24px 0px',
    backgroundColor: '#FFF',
    borderRadius: 10,
    [theme.breakpoints.down('xs')]: {
      width: '95%',
      margin: '0px auto 8px'
    }
  },
  textPrice: {
    fontSize: 20,
    color: '#da123f',
    [theme.breakpoints.down('xs')]: {
      fontSize: 12
    }
  },
  textOldPrice: {
    fontSize: 20,
    color: 'rgb(0, 0, 0, 0.54)',
    textDecorationLine: 'line-through',
    [theme.breakpoints.down('xs')]: {
      fontSize: 12
    }
  },
  buttonContainer: {
    marginBottom: '16px'
  },
  productCard: {
    padding: 10
  },
  menuButtonContainer: {
    padding: '0px 10px 0px 10px',
    [theme.breakpoints.down('md')]: {
      padding: 10
    }
  },
  buttonCard: {
    width: '100%',
    padding: '12px 10px 12px 10px', 
    backgroundColor: 'white', 
    borderRadius: 15, 
    cursor: 'pointer'
  }
})

class MyCatalogs extends Component {
  constructor(props) {
    super(props)
    this.state = {
      redirect: false,
      catalog: null,
      emptyTitle: 'No hay productos',
      emptyDescription: 'Aún no haz agregado productos a tu catálogo.',
      openSnack: false,
      message: '',
      loading: true,
      openCatalogForm: false,
      openDeleteDialog: false,
      editCatalog: false
    }

    this.getCatalog = this.getCatalog.bind(this)
    this.getProductImage = this.getProductImage.bind(this)
    this.closeCatalogForm = this.closeCatalogForm.bind(this)
    this.showSnackbarMessage = this.showSnackbarMessage.bind(this)
  }

  closeCatalogForm() {
    this.setState({ openCatalogForm: false, editCatalog: false })
  }

  getProductImage(product) {
    if (product.photos.length > 0) {
      return Utils.constants.HOST_CDN_AWS + '/normal/' + product.photos[0].description
    } else {
      return '/placeholder.svg'
    }
  }

  componentDidMount() {
    if (Utils.isUserLoggedIn()) {
      this.setState({
        uuid: this.props.id
      }, () => {
        this.getCatalog()
      })
    } else {
      this.setState({
        redirect: true
      })
    }
  }

  showSnackbarMessage(message) {
    this.setState({
      openSnack: true,
      message: message
    })
  }

  async getCatalog() {
    this.setState({ loading: true })
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'catalogs',
      endpoint: '/' + this.props.id + '/entity'
    })
    this.setState({ loading: false })


    if (response.status === Utils.constants.status.SUCCESS) {
      if (response.data !== null) {
        this.setState({
          catalog: response.data
        })
      }
    }
  }

  async deleteCatalog() {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'DELETE',
      resource: 'catalogs',
      endpoint: `/${this.state.uuid}/delete`,
    })

    if (response.data !== undefined) {
      if (response.data.deleted) {
        Router.push(Utils.constants.paths.myCatalogs)
      }
    }
  }

  async deleteProduct(product, idx) {

    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'DELETE',
      resource: 'catalogs',
      endpoint: '/' + this.props.id + '/' + product.code + '/delete'
    })

    if (response.status === Utils.constants.status.SUCCESS && response.data.deleted) {
      let catalog = this.state.catalog
      let newProducts = []
      let products = catalog.products
      
      products.forEach((item, jdx) => {
        if (idx !== jdx) {
          newProducts.push(item)
        }
      })
      catalog.products = newProducts
      this.setState({
        catalog: catalog
      })
      this.getCatalog()
    }
  }

  async downloadCatalog() {
    this.setState({
      openSnack: true,
      message: 'Descargando PDF...'
    })
    const API_PDF = Utils.constants.CONFIG_ENV.HOST + "/api/catalogs/" + this.state.uuid + "/download"
    window.open(API_PDF)
  }

  render() {
    const self = this
    const { classes } = this.props
    
    return (
      (this.state.redirect) ?
        (Utils.isUserLoggedIn()) ?
          <>{Router.push(Utils.constants.paths.myCatalogs)}</>
          :
          <>{Router.push('/')}</>
        :
        <Grid container className={classes.root}>
          <Modal
            open={this.state.openCatalogForm}
            onClose={this.closeCatalogForm}
            onEscapeKeyDown={this.closeCatalogForm}
            onBackdropClick={this.closeCatalogForm}>
              <div style={getModalStyle()} className={`${classes.largeForm} ${classes.scrollBar}`}>
                <CatalogForm
                   options={this.state.options}
                   edit={this.state.editCatalog}
                   uuid={this.props.app.data.uuid}
                   businessUnit={this.props.app.data.configs.businessUnit}
                   getCatalogs={this.getCatalog}
                   isFormInModal={true}
                   closeCatalogForm={this.closeCatalogForm}
                   currentCatalog={this.state.catalog}
                  showSnackbarMessage={this.showSnackbarMessage}/>
              </div>
          </Modal>
          <Hidden smDown>
            <Grid item sm={4}>
              <MyAccountMenu text={(this.state.catalog === null) ? '...' : this.state.catalog.name} />
            </Grid>
          </Hidden>
            <Grid container item md={8} xs={12} className={classes.container}>
              {
                (this.state.catalog !== null) ?
                  <div>
                    <Typography style={{ fontSize: 28, marginBottom: 20 }}><strong>{this.state.catalog.name}</strong></Typography>
                    <Grid container direction="row" justify="space-between" style={{marginBottom: 10}}>
                      <Grid container item xs={6} sm={4} lg={2} justify="center" className={classes.menuButtonContainer}>
                        <div className={classes.buttonCard} onClick={() => this.setState({ openCatalogForm: true, editCatalog: true })}>
                          <Edit style={{width: '100%'}} color="primary" />
                          <Typography align="center" color="primary" variant="body1" style={{marginTop: 8}}><strong>Editar</strong></Typography>
                        </div>
                      </Grid> 
                      <Grid container item xs={6} sm={4} lg={2} justify="center" className={classes.menuButtonContainer}>
                        <CopyToClipboard 
                          onCopy={() => self.setState({openSnack: true, message: 'Link copiado al portapapeles.'})}
                          text={Utils.constants.CONFIG_ENV.HOST + '/api/catalogs/' + this.state.uuid + '/download'}>
                          <div className={classes.buttonCard}>
                            <Link style={{width: '100%'}} color="primary" />
                            <Typography align="center" color="primary" variant="body1" style={{marginTop: 8}}><strong>Copiar Link</strong></Typography>
                          </div>
                        </CopyToClipboard>
                      </Grid> 
                      <Grid container item xs={6} sm={4} lg={2} justify="center" className={classes.menuButtonContainer}>
                        <div className={classes.buttonCard} onClick={() => this.downloadCatalog()}>
                          <GetApp style={{width: '100%'}} color="primary" />
                          <Typography align="center" color="primary" variant="body1" style={{marginTop: 8}}><strong>Descargar PDF</strong></Typography>
                        </div>
                      </Grid> 
                      <Grid container item xs={6} sm={4} lg={2} justify="center" className={classes.menuButtonContainer}>
                        <div className={classes.buttonCard}>
                        <FacebookShareButton
                          style={{width: '100%'}}
                          quote={'Catálogo: ' + this.state.catalog.name}
                          url={Utils.constants.CONFIG_ENV.HOST + '/api/catalogs/' + this.state.uuid + '/download'}>
                            <Facebook style={{width: '100%'}} color="primary" />
                            <Typography align="center" color="primary" variant="body1" style={{marginTop: 8}}><strong>Compartir</strong></Typography>
                        </FacebookShareButton>
                        </div>
                      </Grid> 
                      <Grid container item xs={6} sm={4} lg={2} justify="center" className={classes.menuButtonContainer}>
                       <div className={classes.buttonCard}>
                          <WhatsappShareButton
                            style={{width: '100%'}}
                            title={'Catálogo: ' + this.state.catalog.name}
                            url={Utils.constants.CONFIG_ENV.HOST + '/api/catalogs/' + this.state.uuid + '/download'}>
                              <WhatsApp style={{width: '100%'}} color="primary" />
                              <Typography align="center" color="primary" variant="body1" style={{marginTop: 8}}><strong>Compartir</strong></Typography>
                          </WhatsappShareButton>
                        </div>
                      </Grid> 
                      <Grid container item xs={6} sm={4} lg={2} justify="center" className={classes.menuButtonContainer}>
                        <div className={classes.buttonCard} onClick={() => this.setState({ openDeleteDialog: true })}>
                          <Close style={{width: '100%'}} color="primary" />
                          <Typography align="center" color="primary" variant="body1" style={{marginTop: 8}}><strong>Eliminar</strong></Typography>
                        </div>
                      </Grid> 
                    </Grid>

                    <Grid container direction="row" justify="flex-start">
                      {
                        (this.state.catalog !== null && this.state.catalog !== undefined && this.state.catalog.products !== null && this.state.catalog.products !== undefined && this.state.catalog.products.length > 0 && !this.state.loading) ?
                          this.state.catalog.products.map((product, index) => {
                            return (
                              <Grid 
                                key={index} 
                                item xl={3} sm={4} xs={6}
                                className={classes.productCard}>
                                <div style={{backgroundColor: 'white', borderRadius: 15}}>
                                  <ProductCard
                                    currentCatalogStatus={this.state.currentCatalogStatus}
                                    cancelButton={true}
                                    cancelAction={() => this.deleteProduct(product, index)}
                                    data={product}
                                    updateCount={() => { this.setState({ countCatalog: Utils.getCurrentCatalog().length })}}/>
                                </div>
                              </Grid>
                            )
                          })
                          :
                          <div style={{ width: '100%', marginBottom: 32 }}>
                            {
                              (!this.state.loading) ?
                                < Empty
                                  title={this.state.emptyTitle}
                                  description={this.state.emptyDescription}
                                />
                                :
                                <Empty
                                  isLoading={true}
                                  title="Cargando..."
                                  description="Espera un momento por favor."
                                />
                            }
                          </div>
                      }
                    </Grid>
                  </div>
                  :
                  <div style={{ width: '100%', marginBottom: 32 }}>
                  {
                    (!this.state.loading) ?
                      < Empty
                        title={this.state.emptyTitle}
                        description={this.state.emptyDescription}
                      />
                      :
                      <Empty
                        isLoading={true}
                        title="Cargando..."
                        description="Espera un momento por favor."
                      />
                  }
                  </div>
              }
            </Grid>
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
                  this.deleteCatalog()
                }}
              >
                Eliminar
            </Button>
            </DialogActions>
          </Dialog>
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
        </Grid>
    )
  }
}

const mapStateToProps = (state) => ({ ...state })


export default compose(withStyles(styles), connect(mapStateToProps, null))(MyCatalogs)

