import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'

// Components
import TableCRUD from '../components/TableCRUD'
import NotFound from './NotFound'
import Title from '../components/Title'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Empty from '../components/Empty'
import Head from '../components/Head'
import CreateLandingPage from '../components/CreateLandingPage'
import DeleteDialog from '../components/DeleteDialog'

const styles = theme => ({})

class Landings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      openCreateLandingPage: false,
      openDeleteDialog: false,
      loading: true,
      showData: false,
      user: null,
      data: [],
      selectedLandingPage: null,
      selectedOrder: null,
      editUrl: false
    }

    this.loadData = this.loadData.bind(this)

    this.createLanding = this.createLanding.bind(this)
    this.searchQuery = this.searchQuery.bind(this)
    this.handleActions = this.handleActions.bind(this)
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  componentWillMount() {
    this.loadData()
  }

  async loadData() {
    const self = this
    let user = await Utils.getCurrentUser()

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'landings',
      endpoint: '/all'
    })

    this.setState({
      loading: false,
      showData: (response.data.length > 0) ? true : false,
      user: user,
      data: response.data
    }, () => {
      if (self.props.match.path === Utils.constants.paths.createLanding) {
        self.setState({
          openCreateLandingPage: true
        })
      } else if (self.props.match.path === Utils.constants.paths.editUrlLanding) {
        let landing = Utils.search(self.state.data, { id: self.props.match.params.id })
        self.handleActions(landing[0], { key: 'update' })
      }
    })
  }

  handleActions(item, action) {
    let key = action.key

    if (key === 'update_blocks') {
      this.props.history.push('/landings/' + item.id + '/bloques')
    } else if (key === 'update') {
      this.setState({
        openCreateLandingPage: true,
        selectedLandingPage: item,
        editUrl: true
      })
    } else if (key === 'delete') {
      this.setState({
        openDeleteDialog: true,
        selectedLandingPage: item
      })
    } 
  }

  getActions() {
    return [
      {
        "icon": "edit",
        "code": 'update',
        "key":  'update',
        "name": "Editar",
        "pipeline": []
      },
      {
        "icon": "edit",
        "code": 'update',
        "key":  'update_blocks',
        "name": "Bloques",
        "pipeline": []
      },
      {
        "icon": "delete",
        "code": "delete",
        "key": "delete",
        "name": "Eliminar",
        "pipeline": []
      }
    ]
  }

  async searchQuery(data) {
    this.setState({
      loading: true
    })

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'landings',
      endpoint: '/all',
      filter: {
        param: data
      }
    })

    this.setState({
      loading: false,
      showData: (response.data.length > 0) ? true : false,
      data: response.data
    })
  }

  createLandingPage() {
    this.setState({
      openCreateLandingPage: true,
      editUrl: false,
      selectedLandingPage: null
    })
  }

  createLanding(event) {
    this.props.history.push(Utils.constants.paths.createLanding)
  }

  render() {
    
    const self = this
    const { classes } = this.props
    const module = Utils.app().modules.Landings

    if (module.permissions.read) {
      return (
        <div>
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Title
                title="Landings pages."
                description="Asistente para configurar landings pages."
              />
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8, marginBottom: 8 }}>
              <Head
                searchPlaceholder="Buscar landing page por nombre, descripción o url..."
                titleButtonCreate="Nueva landing page"
                searchQuery={ (data) => { this.searchQuery(data) } }
                callToCreate={ (module.permissions.create) ? ( (event) => { this.createLandingPage(event) } ) : false }
              />
            </Grid>
          </Grid>
          {
            (!this.state.loading) ?
              (this.state.data.length > 0) ?
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <br />
                  <div>
                    {
                      (this.state.showData) ?
                      <TableCRUD
                        user={this.state.user}
                        module={module}
                        data={this.state.data}
                        actionsFunction={(item) => this.getActions(item)}
                        handleActionsFunction={(item, action) => { this.handleActions(item, action) }}
                        params={[
                          {
                            title: "ID",
                            name: "id",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "URL",
                            name: "url",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Catálogo",
                            name: "catalog",
                            type: "link",
                            link: "downloadCatalog",
                            responsive: "xl"
                          },
                          {
                            title: "Productos",
                            name: "showProducts",
                            type: "boolean",
                            responsive: "xl"
                          },
                          {
                            title: "Bloques",
                            name: "count",
                            type: "number",
                            responsive: "xl"
                          }
                        ]}
                      />
                      :
                      ''
                    }
                  </div>
                </Grid>
              </Grid>
              :
              <Empty 
                title="¡Sin landings pages!"
                description="No hay landings pages para mostrar."
              />
            :
            <Empty 
              isLoading={this.state.loading}
              title="Cargando landings pages..."
              description="Espere un momento por favor."
            />
          }

          <CreateLandingPage
            edit={this.state.editUrl}
            landing={this.state.selectedLandingPage}
            open={this.state.openCreateLandingPage}
            handleClose={() => {
              this.setState({
                openCreateLandingPage: false,
                edutUrl: false,
                selectedLandingPage: null
              }, () => {
                self.props.history.push(Utils.constants.paths.landings)
              })
            }}
            handleCloseWithData={(selection) => {
              this.setState({
                openCreateLandingPage: false,
                editUrl: false,
                selectedLandingPage: null
              }, () => {
                self.props.history.push(Utils.constants.paths.landings)
                this.loadData()
              })
            }}
          />

          <DeleteDialog
            open={this.state.openDeleteDialog}
            host={Utils.constants.HOST}
            resource="landings"
            data={this.state.selectedLandingPage}
            title="Deshabilitar landing page."
            description={
              <Typography variant="body1">
                ¿Desea deshabilitar la landing page <i>{(this.state.selectedLandingPage !== null) ?
                  this.state.selectedLandingPage.url : ''}</i>?
              </Typography>
            }
            onCancel={() => {
              this.setState({
                openDeleteDialog: false
              })
            }}
            onConfirm={() => {
              const self = this
              this.setState({
                openDeleteDialog: false
              }, () => {
                self.loadData()
              })
            }}
          />

          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.state.openSnack}
            onClose={ () => { this.setState({ openSnack: false, messageSnack: '' }) } }
            message={
              <span>{this.state.messageSnack}</span>
            }
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={ () => { this.setState({ openSnack: false, messageSnack: '' }) } }
              >
                <CloseIcon />
              </IconButton>
            ]}
          />
        </div>
      )
    }
    else {
      return (
        <NotFound />
      )
    }
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(Landings)
