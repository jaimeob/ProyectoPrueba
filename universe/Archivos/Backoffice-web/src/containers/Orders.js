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
import Paginator from '../components/Paginator'

// Components
import TableCRUD from '../components/TableCRUD'
import NotFound from './NotFound'
import Title from '../components/Title'
import InfoModal from '../components/InfoModal'
import ModalTracking from '../components/modalTracking'

// Utils
import Utils from '../resources/Utils'
import { requestAPI, cancelAPI } from '../api/CRUD'
import Empty from '../components/Empty'
import Head from '../components/Head'
import { TablePagination } from '@material-ui/core'


const styles = (theme) => ({})

class Orders extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      loading: true,
      showData: false,
      user: null,
      data: [],
      selectedOrder: null,
      rows: 50,
      page: 0,
      count: 1,
      search: '',
      cityName: this.props.location.search.split('=')[1] == 'undefined' ? undefined : this.props.location.search.split('=')[1],
      openModal: false,
      openModalTracking: false,
      dataModal: null,
      key: null
    }

    console.log(this.state.cityName)

    console.log(this.props)

    this.createPage = this.createPage.bind(this)
    this.searchQuery = this.searchQuery.bind(this)
    this.handleActions = this.handleActions.bind(this)
    this.loadData = this.loadData.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
    this.getActions = this.getActions.bind(this)
    this.closeModalTracking = this.closeModalTracking.bind(this)
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  async componentWillMount() {
    let user = await Utils.getCurrentUser()
    await this.loadData()

    this.setState({
      loading: false,
      user: user
    })
  }

  getActions() {
    return [
      {
        icon: 'person',
        code: 'read',
        key: 'info_cliente',
        name: 'Información del cliente',
        pipeline: []
      },
      {
        icon: 'home',
        code: 'read',
        key: 'info_address',
        name: 'Dirección',
        pipeline: []
      },
      {
        icon: 'wysiwyg',
        code: 'read',
        key: 'info_order',
        name: 'Detalles del pedido',
        pipeline: []
      },
      {
        icon: 'sync_alt',
        code: 'read',
        key: 'info_logs',
        name: 'Logs',
        pipeline: []
      },
      {
        icon: 'local_shipping',
        code: 'read',
        key: 'info_tracking',
        name: 'Agregar guia',
        pipeline: []
      }
    ]
  }

  handleActions(item, action) {

    let key = action.key
    let data = {}
    let openModal = false
    let openModalTracking = false
    switch (key) {
      case 'info_cliente':
        openModal = true
        data.title = 'Información del cliente'
        data.letter = item.fullName.charAt(0)
        data.fullName = item.fullName
        data.cellphone = item.cellphone
        data.email = item.email
        data.key = 'info_cliente'
        if (item.address !== null && item.address !== undefined) {
          data.address = { stateName: item.address.stateName, municipalityName: item.address.municipalityName }
        }
        break

      case 'info_address':
        openModal = true
        data.title = 'Dirección de entrega'
        data.key = 'info_address'
        if (item.address !== null && item.address !== undefined) {
          data.address = item.address
        } else {
          openModal = false
        }
        break

      case 'info_order':
        openModal = true
        data.title = 'Detalle del pedido'
        data.key = 'info_order'
        data.calzzapatoCode = item.calzzapatoCode
        data.createdAt = item.createdAt
        data.detail = item.detail
        data.discount = item.discount
        data.paymentMethod = item.paymentMethod
        data.pipelineName = item.pipelineName
        data.shippingMethod = item.shippingMethod
        data.shoppingDate = Utils.onlyDate(item.shoppingDate)
        data.subtotal = item.subtotal
        data.total = item.total
        data.shippingCost = item.shippingCost
        break

      case 'info_logs':
        openModal = true
        data.title = 'Logs de pedido'
        data.key = 'info_logs'
        data.logs = item.logs
        break

      case 'info_tracking':
        openModalTracking = true
        data.title = 'Folio'
        data.key = 'info_tracking'
        data.tracking = item.logs
        // data.selectedOrder = item.
        break

      default:
        break
    }

    this.setState({
      openModal: openModal,
      openModalTracking: openModalTracking,
      key: key,
      dataModal: data,
      calzzapatoCodeSelected: item.calzzapatoCode,
      selectedOrder: item.order
    })
  }

  async loadData() {
    await this.setState({
      loading: true
    })
    let page = this.state.page
    if (page === null || page === 0) {
      page = 0
    } else {
      page = Number(this.state.page) + 1
    }
    await cancelAPI()

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'orders',
      endpoint: '/all',
      filter: {
        page: page,
        filters: this.state.search,
        cityName: this.state.cityName
      }
    })

    await this.setState({
      loading: false,
      showData: response.data.orders.length > 0 ? true : false,
      data: response.data.orders,
      count: response.data.count
    })
  }

  async handleChangePage(event, page) {
    await this.setState({
      page: page
    })
    await this.loadData()
  }

  async searchQuery(data) {
    await this.setState({
      search: data
    })
    await this.loadData()
  }

  createPage(event) {
    this.props.history.push(Utils.constants.paths.createPage)
  }

  closeModalTracking() {
    this.setState({
      openModalTracking: false
    })
    
  }


  render() {
    const self = this
    const { classes } = this.props
    const module = Utils.app().modules.Orders


    if (module.permissions.read) {
      return (
        <div>
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Title title='Pedidos.' description='Pedidos creados desde todos los canales de venta.' />
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8, marginBottom: 8 }}>
              <Head
                searchPlaceholder='Buscar pedido por folio, calzzapato, importe, estatus.'
                searchQuery={(data) => {
                  this.searchQuery(data)
                }}
              />
            </Grid>
          </Grid>
          {!this.state.loading ? (
            this.state.data.length > 0 ? (
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <br />
                  <div>
                    <TablePagination
                      style={{ position: 'fixed', right: 0, bottom: 0, width: '100%' }}
                      labelRowsPerPage=''
                      count={this.state.count}
                      rowsPerPage={50}
                      page={this.state.page}
                      rowsPerPageOptions={false}
                      SelectProps={{
                        native: false
                      }}
                      onChangePage={this.handleChangePage}
                    />
                    {this.state.showData ? (
                      <TableCRUD
                        user={this.state.user}
                        module={module}
                        data={this.state.data}
                        actionsFunction={(item) => this.getActions(item)}
                        handleActionsFunction={(item, action) => {
                          this.handleActions(item, action)
                        }}
                        handleActions={(item, action) => {
                          this.handleActions(item, action)
                        }}
                        params={[
                          {
                            title: 'Folio',
                            name: 'order',
                            type: 'string',
                            responsive: 'xl'
                          },
                          {
                            title: 'Calzzapato',
                            name: 'calzzapatoCode',
                            type: 'string',
                            responsive: 'xl'
                          },
                          {
                            title: 'Método de envio',
                            name: 'shippingMethod',
                            type: 'string',
                            responsive: 'xl'
                          },
                          {
                            title: 'Método de pago',
                            name: 'paymentMethod',
                            type: 'string',
                            responsive: 'xl'
                          },
                          {
                            title: 'Total',
                            name: 'total',
                            type: 'moneyFormat',
                            responsive: 'xl'
                          },
                          {
                            title: 'Creación',
                            name: 'createdAt',
                            type: 'date',
                            responsive: 'xl'
                          },
                          {
                            title: 'Creación',
                            name: 'createdAt',
                            type: 'date',
                            responsive: 'xl'
                          }
                          // {
                          //   title: "Estatus",
                          //   name: "pipelineName",
                          //   type: "string",
                          //   responsive: "xl",
                          //   styles: [
                          //     {
                          //       param: 'pipelineName',
                          //       condition: 'ORDEN PAGADA',
                          //       style: {
                          //         fontWeight: 'bold',
                          //         color: 'green'
                          //       }
                          //     }
                          //   ]
                          // }
                        ]}
                      />
                    ) : (
                      ''
                    )}
                  </div>
                </Grid>
              </Grid>
            ) : (
              <Empty title='¡Sin pedidos!' description='No hay pedidos para mostrar.' />
            )
          ) : (
            <Empty isLoading={this.state.loading} title='Cargando pedidos...' description='Espere un momento por favor.' />
          )}
          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.state.openSnack}
            onClose={() => {
              this.setState({ openSnack: false, messageSnack: '' })
            }}
            message={<span>{this.state.messageSnack}</span>}
            action={[
              <IconButton
                key='close'
                aria-label='Close'
                color='inherit'
                onClick={() => {
                  this.setState({ openSnack: false, messageSnack: '' })
                }}
              >
                <CloseIcon />
              </IconButton>
            ]}
          />
          <InfoModal
            open={this.state.openModal}
            data={this.state.dataModal}
            handleClose={() => {
              this.setState({
                openModal: false
              })
            }}
            loadData={() => this.loadData()}
          />
          <ModalTracking
            open={this.state.openModalTracking}
            calzzapatoCode={this.state.calzzapatoCodeSelected}
            closeModalTracking={this.closeModalTracking}
            folio={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
                openModalTracking: false
              })
            }}
          // loadData={() => this.loadData()}
          />
        </div>
      )
    } else {
      return <NotFound />
    }
  }
}

const mapStateToProps = (state) => ({ ...state })

export default compose(withRouter, withTheme(), withStyles(styles), connect(mapStateToProps, null))(Orders)
