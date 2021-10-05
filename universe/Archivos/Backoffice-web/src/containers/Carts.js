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

class Carts extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      loading: true,
      showData: false,
      user: null,
      data: [],
      limit: 1000,
      selectedOrder: null
    }

    this.createPage = this.createPage.bind(this)
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
      resource: 'carts',
      endpoint: '/all',
      filter: {
        where: {
          limit: Number(this.state.limit)
        }
      }
    })

    this.setState({
      loading: false,
      showData: (response.data.carts.length > 0) ? true : false,
      user: user,
      data: response.data
    })
  }

  handleActions(item, action) {
  }

  getActions() {
    return []
  }

  async searchQuery() {
    this.setState({
      loading: true
    })

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'carts',
      endpoint: '/all',
      filter: {
        where: {
          limit: Number(this.state.limit)
        }
      }
    })

    this.setState({
      loading: false,
      showData: (response.data.carts.length > 0) ? true : false,
      data: response.data
    })
  }

  createPage(event) {
    this.props.history.push(Utils.constants.paths.createPage)
  }

  render() {
    const self = this
    const { classes } = this.props
    const module = Utils.app().modules.Carts

    if (module.permissions.read) {
      return (
        <div>
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Title
                title="Carritos abandonados."
                description="Seguimiento carritos abandonados por usuarios."
              />
            </Grid>
            <Grid item xl={3} lg={3} md={3} sm={3} xs={3} style={{ marginTop: 16 }}>
              <TextField
                style={{ marginRight: 12 }}
                label="Num. Carritos"
                placeholder="100, 1000, etc"
                value={this.state.limit}
                onChange={(event) => {
                  if (!isNaN(Number(event.target.value))) {
                    this.setState({
                      limit: event.target.value
                    })
                  }
                }}
              />
              <Button variant="contained" style={{ fontWeight: 800, marginTop: 8 }} onClick={ () => {
                if (Number(this.state.limit) > 0) {
                  this.searchQuery()
                }
              }}>
                APLICAR
              </Button>
            </Grid>
            <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8, marginBottom: 8 }}>
              {/*
              <Head
                searchPlaceholder="Buscar carrito..."
                searchQuery={ (data) => { this.searchQuery(data) } }
              />
              */}
            </Grid>
            <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
              <Button variant="contained" style={{ background: 'green', color: 'white', fontWeight: 800, marginTop: 16, marginLeft: 16, width: '95%'}} onClick={ () => {
                window.open(Utils.constants.IP + "/api/carts/download?limit=" + this.state.limit)
              }}>
                EXPORTAR
              </Button>
            </Grid>
          </Grid>
          {
            (!this.state.loading) ?
              (this.state.data.carts.length > 0) ?
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <div>
                    {
                      (this.state.showData) ?
                      <>
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
                      <br />
                      <TableCRUD
                        
                        user={this.state.user}

                        module={module}
                        data={this.state.data.carts}
                        actions={this.getActions()}

                        handleActions={
                          (item, action) => { this.handleActions(item, action) }
                        }

                        params={[
                          {
                            title: "Cliente",
                            name: "user.name",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Correo",
                            name: "user.email",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Celular",
                            name: "user.cellphone",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Compras",
                            name: "shoppings",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Total",
                            name: "total",
                            type: "money",
                            responsive: "xl"
                          },
                          {
                            title: "Productos",
                            name: "totalProducts",
                            type: "number",
                            responsive: "xl"
                          },
                          {
                            title: "Creación",
                            name: "createDays",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Actualización",
                            name: "updateDays",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Estatus",
                            name: "status",
                            type: "string",
                            responsive: "xl",
                            styles: [
                              {
                                param: 'status',
                                condition: 'FALLO AL COMPRAR',
                                style: {
                                  fontWeight: 'bold',
                                  color: 'red'
                                }
                              },
                              {
                                param: 'status',
                                condition: 'FALLO AL COMPRAR',
                                style: {
                                  fontWeight: 'bold',
                                  color: 'red'
                                }
                              },
                              {
                                param: 'status',
                                condition: 'FALLO CON BBVA',
                                style: {
                                  fontWeight: 'bold',
                                  color: 'red'
                                }
                              },
                              {
                                param: 'status',
                                condition: 'FALLO CON CREDIVALE',
                                style: {
                                  fontWeight: 'bold',
                                  color: 'red'
                                }
                              },
                              {
                                param: 'status',
                                condition: 'FALLO CON OXXO',
                                style: {
                                  fontWeight: 'bold',
                                  color: 'red'
                                }
                              },
                              {
                                param: 'status',
                                condition: 'FALLO CON PAYPAL',
                                style: {
                                  fontWeight: 'bold',
                                  color: 'red'
                                }
                              },
                              {
                                param: 'status',
                                condition: 'FALLO CON NETPAY',
                                style: {
                                  fontWeight: 'bold',
                                  color: 'red'
                                }
                              }
                            ]
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
                title="¡Sin carritos!"
                description="No hay carritos para mostrar."
              />
            :
            <Empty 
              isLoading={this.state.loading}
              title="Cargando carritos..."
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
)(Carts)
