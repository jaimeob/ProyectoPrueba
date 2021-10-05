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

// Components
import TableCRUD from '../components/TableCRUD'
import NotFound from './NotFound'
import Title from '../components/Title'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Empty from '../components/Empty'
import { Button, TextField } from '@material-ui/core'
import KPICard from '../components/KPICard'

const styles = theme => ({})

class Products extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      loading: true,
      showData: false,
      user: null,
      data: []
    }

    this.getActions = this.getActions.bind(this)
    this.searchQuery = this.searchQuery.bind(this)
    this.handleActions = this.handleActions.bind(this)
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  async componentWillMount() {
    let user = await Utils.getCurrentUser()

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'products',
      endpoint: '/all'
    })

    this.setState({
      loading: false,
      showData: (response.data.length > 0) ? true : false,
      user: user,
      data: response.data
    })
  }

  handleActions(item, action) {
  }

  async searchQuery() {
    this.setState({
      loading: true
    })

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'products',
      endpoint: '/all',
      filter: {
        where: {
          limit: Number(this.state.limit)
        }
      }
    })

    this.setState({
      loading: false,
      showData: (response.data.length > 0) ? true : false,
      data: response.data
    })
  }

  getActions() {
    return [
      {
        "icon": "visibility",
        "code": 'viewWeb',
        "key":  'viewWeb',
        "name": "Ver producto en website",
        "pipeline": []
      },
      {
        "icon": "assignment",
        "code": 'viewInfo',
        "key":  'viewInfo',
        "name": "Información del producto",
        "pipeline": []
      },
      {
        "icon": "feedback",
        "code": 'reviews',
        "key":  'reviews',
        "name": "Opiniones",
        "pipeline": []
      },
      {
        "icon": "edit",
        "code": 'update',
        "key":  'update',
        "name": "Editar",
        "pipeline": []
      },
      {
        "icon": "delete",
        "code": "delete",
        "key": "delete",
        "name": "Deshabilitar",
        "pipeline": []
      }
    ]
  }

  render() {
    const self = this
    const { classes } = this.props
    const myModule = Utils.app().modules.Products

    if (myModule.permissions.read) {
      return (
        <div>
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Title
                title="Productos."
                description="Módulo de productos."
              />
            </Grid>
          </Grid>
          {
            (!this.state.loading) ?
              (this.state.data.length > 0) ?
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <div>
                    {
                      (this.state.showData) ?
                      <>
                      {
                        /*
                        <Grid container>
                          <Grid item xl={4} lg={4} md={4} sm={6} xs={12}>
                            <KPICard title={this.state.data.kpis[0].title} description={ "Total de compras fallidas: " + Utils.numberWithCommas(this.state.data.kpis[0].subvalue) } value={ "$ " + Utils.numberWithCommas(this.state.data.kpis[0].value.toFixed(2)) + " M.N." } list={[]} type={null} />
                          </Grid>
                          <Grid item xl={4} lg={4} md={4} sm={6} xs={12}>
                            <KPICard title={this.state.data.kpis[1].title} description={ "Total de carritos activos: " + Utils.numberWithCommas(this.state.data.kpis[1].subvalue) } value={ "$ " + Utils.numberWithCommas(this.state.data.kpis[1].value.toFixed(2)) + " M.N." } list={[]} type={null} />
                          </Grid>
                          <Grid item xl={4} lg={4} md={4} sm={6} xs={12}>
                            <KPICard title={this.state.data.kpis[2].title} description={ "Total de carritos abandonados: " + Utils.numberWithCommas(this.state.data.kpis[2].subvalue) } value={ "$ " + Utils.numberWithCommas(this.state.data.kpis[2].value.toFixed(2)) + " M.N." } list={[]} type={null} />
                          </Grid>
                        </Grid>
                        */
                      }
                      <br />
                      <TableCRUD
                        user={this.state.user}
                        module={myModule}
                        data={this.state.data}
                        actionsFunction={(item) => this.getActions(item)}
                        handleActions={
                          (item, action) => { this.handleActions(item, action) }
                        }

                        params={[
                          {
                            title: "Código",
                            name: "code",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Nombre",
                            name: "detail.title",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Marca",
                            name: "brand.name",
                            type: "string",
                            responsive: "xl"
                          }
                        ]}
                      />
                      </>
                      :
                      ''
                    }
                  </div>
                </Grid>
              </Grid>
              :
              <Empty 
                title="¡Sin productos!"
                description="No hay productos para mostrar."
              />
            :
            <Empty 
              isLoading={this.state.loading}
              title="Cargando productos..."
              description="Espere un momento por favor."
            />
          }
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
)(Products)
