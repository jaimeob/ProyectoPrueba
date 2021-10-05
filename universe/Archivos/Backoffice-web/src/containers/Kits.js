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
import OrderForm from './OrderForm'
import NotFound from './NotFound'
import Title from '../components/Title'
import OrderInfoModal from '../components/OrderInfoModal'
import DeliveryInfoModal from '../components/DeliveryInfoModal'
import OrderDetailModal from '../components/OrderDetailModal'
import AssignToModal from '../components/AssignToModal'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Empty from '../components/Empty'
import Head from '../components/Head'

const styles = theme => ({})

class Kits extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      loading: true,
      showData: false,
      user: null,
      data: [],
      openGeneralOrderInfo: false,
      openDeliveryInfoModal: false,
      openOrderDetailModal: false,
      openAssignToModal: false,
      selectedOrder: null
    }

    this.createKit = this.createKit.bind(this)
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
      resource: 'kits',
      endpoint: '/all'
    })

    this.setState({
      loading: false,
      showData: (response.data.length > 0) ? true : false,
      user: user,
      data: response.data
    }, () => {
      if (this.props.match.path === Utils.constants.paths.generalInfoFromOrders) {
        let selectedOrder = Utils.search(this.state.data, { folio: this.props.match.params.folio })
        this.setState({
          openGeneralOrderInfo: true, 
          selectedOrder: selectedOrder[0]
        })
      } else if (this.props.match.path === Utils.constants.paths.deliveryInfoFromOrders) {
        let selectedOrder = Utils.search(this.state.data, { folio: this.props.match.params.folio })
        this.setState({
          openDeliveryInfoModal: true,
          selectedOrder: selectedOrder[0]
        })
      } else if (this.props.match.path === Utils.constants.paths.orderDetailFromOrders) {
        let selectedOrder = Utils.search(this.state.data, { folio: this.props.match.params.folio })
        this.setState({
          openOrderDetailModal: true,
          selectedOrder: selectedOrder[0]
        })
      }
    })
  }

  handleActions(item, option) {
    if (option === 'viewGeneralOrderInfo') {
      this.setState({
        openGeneralOrderInfo: true,
        selectedOrder: item
      })
    } else if (option === 'viewDeliveryInfo') {
      if (item.address !== null) {
        this.setState({
          openDeliveryInfoModal: true,
          selectedOrder: item
        })
      } else {
        this.setState({
          openSnack: true,
          messageSnack: 'No hay información de entrega.'
        })
      }
    } else if (option === 'viewOrderDetail') {
      this.setState({
        openOrderDetailModal: true,
        selectedOrder: item
      })
    } else if (option === 'assignTo') {
      this.setState({
        openAssignToModal: true,
        selectedOrder: item
      })
    }
  }

  getActions() {
    return [
      {
        "icon": "account_circle",
        "code": 'viewKitDetail',
        "name": "Ver detalle del kit",
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
      resource: 'kits',
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

  createKit(event) {
    this.props.history.push(Utils.constants.paths.createKit)
  }

  render() {
    
    const self = this
    const { classes } = this.props
    const module = Utils.app().modules.Product

    if (module.permissions.read) {
      return (
        <div>
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Title
                title="Kits de productos."
                description="Consulta los kits creados y disponibles dentro de la plataforma."
              />
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8, marginBottom: 8 }}>
              <Head
                searchPlaceholder="Buscar nombre..."
                titleButtonCreate="Capturar kit"
                searchQuery={ (data) => { this.searchQuery(data) } }
                callToCreate={ (module.permissions.create) ? ( (event) => { this.createKit(event) } ) : false }
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
                        actions={this.getActions()}

                        handleActions={
                          (item, option) => { this.handleActions(item, option) }
                        }

                        params={[
                          {
                            title: "Nombre",
                            name: "name",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Descripción",
                            name: "description",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "SKUs",
                            name: "products",
                            type: "number",
                            responsive: "xl",
                            style: {
                              textAlign: 'center'
                            }
                          },
                          {
                            title: "Piezas",
                            name: "quantity",
                            type: "number",
                            responsive: "xl",
                            style: {
                              textAlign: 'center'
                            }
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
                title="¡Sin kits!"
                description="No hay kits para mostrar."
              />
            :
            <Empty 
              isLoading={this.state.loading}
              title="Cargando kits..."
              description="Espere un momento por favor."
            />
          }
          <OrderInfoModal
            open={this.state.openGeneralOrderInfo}
            data={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
                openGeneralOrderInfo: false
              }, () => {
                self.props.history.push('/productos')
              })
            }}
          />
          <DeliveryInfoModal
            open={this.state.openDeliveryInfoModal}
            data={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
                openDeliveryInfoModal: false
              }, () => {
                self.props.history.push('/productos')
              })
            }}
          />
          {/*
          <OrderDetailModal
            open={this.state.openOrderDetailModal}
            data={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
                openOrderDetailModal: false
              }, () => {
                self.props.history.push('/productos')
              })
            }}
          />
          <AssignToModal
            open={this.state.openAssignToModal}
            data={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
                openAssignToModal: false
              }, () => {
                self.props.history.push('/productos')
              })
            }}
          />
          */}
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
)(Kits)
