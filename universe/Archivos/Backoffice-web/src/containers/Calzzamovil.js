import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Checkbox, FormControlLabel, FormGroup, Tabs, Tab } from '@material-ui/core'

// Components
import TableCRUD from '../components/TableCRUD'
import NotFound from './NotFound'
import Title from '../components/Title'
import Empty from '../components/Empty'
import CalzzamovilOrderModal from '../components/CalzzamovilOrderModal'
import CalzzamovilDeliveryModal from '../components/CalzzamovilDeliveryModal'
import CalzzamovilClientModal from '../components/CalzzamovilClientModal'
import CalzzamovilEvidenceModal from '../components/CalzzamovilEvidenceModal'
import CalzzamovilPausedOrderModal from '../components/CalzzamovilPausedOrderModal'
import CalzzamovilReubicar from '../components/CalzzamovilReubicar'
import CalzzamovilUploadEvidence from '../components/CalzzamovilUploadEvidence'


// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import { values } from 'lodash'

const styles = theme => ({})

class Calzzamovil extends Component {
  constructor(props) {
    super(props)
    this.state = {
      optionSelected: 'REPARTIDORES',
      deliverys: [],
      orders: [],
      deliveryDetail: null,
      orderDetail: null,
      clientDetail: null,
      evidence: null,
      orderSelected: null,
      openDeliveryModal: false,
      openOrderModal: false,
      openClientModal: false,
      openEvidenceModal: false,
      openCancelModal: false,
      openReubicar: false,
      openSnack: false,
      messageSnack: '',
      loading: true,
      showData: false,
      user: null,
      uploadEvidence: false,
      value: 0
    }

    this.loadData = this.loadData.bind(this)
    this.handleDeliveryActions = this.handleDeliveryActions.bind(this)
    this.handleOrderActions = this.handleOrderActions.bind(this)
    this.changeTab = this.changeTab.bind(this)
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  async componentWillMount() {
    let pathname = this.props.history.location.pathname

    pathname = '/calzzamovil/compras'

    if (Utils.isUserLoggedIn()) {
      if (pathname === '/calzzamovil') {
        this.setState({
          optionSelected: "REPARTIDORES"
        }, () => {
          this.props.history.push('/calzzamovil/repartidores')
        })
      } else if (pathname === '/calzzamovil/repartidores') {
        this.setState({
          optionSelected: "REPARTIDORES"
        })
      } else if (pathname === '/calzzamovil/compras') {
        this.setState({
          optionSelected: "COMPRAS"
        })
      } else {
        let parts = pathname.split('/')
        if (parts.length >= 2) {
          if (parts[2] == "compras") {
            this.setState({
              optionSelected: "COMPRAS"
            }, () => {
              this.props.history.push('/calzzamovil/compras')
            })
          } else {
            this.setState({
              optionSelected: "REPARTIDORES"
            }, () => {
              this.props.history.push('/calzzamovil/repartidores')
            })
          }
        } else {
          this.setState({
            optionSelected: "REPARTIDORES"
          }, () => {
            this.props.history.push('/calzzamovil/repartidores')
          })
        }
      }

      let user = await Utils.getCurrentUser()
      this.setState({
        user
      }, () => {
        this.loadData()
      })
    } else {
      Utils.logout()
      this.props.history.push('/')
    }

  }

  async loadData() {
    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/calzzamovil'
    })

    if (response.data !== undefined) {
      if (response.data.orders !== undefined && response.data.deliverys !== undefined) {
        this.setState({
          deliverys: response.data.deliverys,
          orders: response.data.orders,
          loading: false
        })
      }
    }
  }

  async handleDeliveryActions(item, action) {
    let option = action.code
    if (option === 'read') {
      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'GET',
        resource: 'users',
        endpoint: '/calzzamovil/' + item.id + '/delivery'
      })
      if (response !== null && response !== undefined && response.data !== null && response.data !== undefined && response.data.error === null) {
        this.setState({
          deliveryDetail: response.data.delivery,
          openDeliveryModal: true
        })
      }
    } else if (option === 'update') {

      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'PATCH',
        resource: 'users',
        endpoint: '/calzzamovil/' + item.id + '/delivery/update'
      })

      if (response.data !== undefined) {
        if (response.data.updated) {
          this.loadData()
        }
      }
    }
  }

  async handleOrderActions(item, action) {
    let key = action.key

    if (key === 'read_order') {
      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'GET',
        resource: 'users',
        endpoint: '/calzzamovil/' + item.order + '/order',
      })


      if (response.data !== undefined) {
        this.setState({
          orderDetail: response.data,
          openOrderModal: true
        })
      }
    } else if (key === 'read_client') {
      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'GET',
        resource: 'users',
        endpoint: '/calzzamovil/client/' + item.userId
      })

      if (response.data !== undefined) {
        this.setState({
          clientDetail: response.data.clientDetail,
          openClientModal: true
        })
      }
    } else if (key === 'reubicar_orden') {
      let data = Object.assign({}, item, { type: 'PAUSED' })

      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'GET',
        resource: 'orders',
        endpoint: '/stores/' + data.order
      })

      if (response.data !== undefined && response.data !== null && response.data.length > 0) {
        data.stores = response.data
        await this.setState({
          orderSelected: data,
          openReubicar: true
        })
      }


    } else if (key === 'upload_evidence') {
      let data = Object.assign({}, item, { type: 'PAUSED' })

      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'GET',
        resource: 'users',
        endpoint: '/calzzamovil/order/' + item.id + '/evidence'
      })

      if (response.data !== undefined && response.data !== null && response.data.evidence === null) {
        data.information = response.data
        await this.setState({
          orderSelected: data,
          uploadEvidence: true
        })
      }
    } else if (key === 'read_evidence') {
      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'GET',
        resource: 'users',
        endpoint: '/calzzamovil/order/' + item.id + '/evidence'
      })

      if (response.data !== undefined) {
        let data = Object.assign({}, response.data.evidence, item)

        this.setState({
          evidence: data,
          openEvidenceModal: true
        })
      }
    } else if (key === 'cancel_order') {
      let data = Object.assign({}, item, { type: 'CANCEL' })

      this.setState({
        orderSelected: data,
        openCancelModal: true
      })
    } else if (key === 'pause_order') {
      let data = Object.assign({}, item, { type: 'PAUSED' })
      this.setState({
        orderSelected: data,
        openCancelModal: true
      })
    }
  }

  getDeliveryActions(item) {
    if (item !== undefined) {
      if (item.status === 1) {
        return [
          {
            "icon": 'lock',
            "code": 'update',
            "name": 'Deshabilitar',
            "pipeline": []
          },
          {
            "icon": 'visibility',
            "code": 'read',
            "name": 'Ver detalle',
            "pipeline": []
          }
        ]
      } else {
        return [
          {
            "icon": 'lock_open',
            "code": 'update',
            "name": 'Habilitar',
            "pipeline": []
          },
          {
            "icon": 'visibility',
            "code": 'read',
            "name": 'Ver detalle',
            "pipeline": []
          }
        ]
      }
    } else {
      return []
    }
  }

  getOrderActions(item) {
    let options = [
      {
        "icon": 'visibility',
        "code": 'read',
        "key": 'read_order',
        "name": 'Ver detalle del pedido',
        "pipeline": []
      },
      {
        "icon": 'visibility',
        "code": 'read',
        "key": 'read_client',
        "name": 'Ver detalle del cliente',
        "pipeline": []
      }
    ]
    if (item !== undefined) {
      if (item.pipelineId !== 4 && item.pipelineId !== 5) {
        options.push({
          "icon": 'block',
          "code": 'update',
          "key": 'cancel_order',
          "name": 'Cancelar pedido',
          "pipeline": []
        },
        )
      }
      if (item.pipelineId === 4) {
        options.push({
          "icon": 'visibility',
          "code": 'read',
          "key": 'read_evidence',
          "name": 'Ver evidencia',
          "pipeline": []
        })
      }
      if (item.pipelineId === 6) {
        options.push({
          "icon": 'pause',
          "code": 'update',
          "key": 'pause_order',
          "name": 'Solicitud de pausa',
          "pipeline": []
        },
          {
            "icon": 'storefront',
            "code": 'update',
            "key": 'reubicar_orden',
            "name": 'Reubicar pedido',
            "pipeline": []
          },
          {
            "icon": 'cloud_upload',
            "code": 'update',
            "key": 'upload_evidence',
            "name": 'Subir evidencia',
            "pipeline": []
          }
        )
      }
    }

    return options
  }

  changeTab = (event, value) => {
    if (value === 0 ) {
      this.props.history.push('/calzzamovil/compras')
      this.setState({ optionSelected: 'COMPRAS' })
    } else {
      this.props.history.push('/calzzamovil/repartidores')
      this.setState({ optionSelected: 'REPARTIDORES'})
    }
    this.setState({ value: value })
  }

  render() {
    const self = this
    const { classes } = this.props
    const module = Utils.app().modules.Calzzamovil

    if (module.permissions.read) {
      return (
        <Grid container >
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Title
              title="Calzzamovil."
              description="Asistente para configurar repartidores y pedidos."
            />
          </Grid>
          <Grid style={{ marginTop: 8, marginBottom: 16 }} item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Tabs
              value={this.state.value}
              // onChange={this.handleChange}
              // onClick={this.handleChangeTab}
              onChange={
                (event, value) => {
                  this.changeTab(event, value)
                }
              }
              indicatorColor="primary"
              textColor="primary"
            // centered
            >
              <Tab label="Ordenes" />
              <Tab label="Repartidores" />
            </Tabs>
            {/* <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(this.state.optionSelected === 'REPARTIDORES')}
                    onChange={() => {
                      this.props.history.push('/calzzamovil/repartidores')
                      this.setState({ optionSelected: 'REPARTIDORES' })
                    }}
                    color="primary"
                  />
                }
                label='Repartidores'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(this.state.optionSelected === 'COMPRAS')}
                    onChange={() => {
                      this.props.history.push('/calzzamovil/compras')
                      this.setState({ optionSelected: 'COMPRAS' })
                    }}
                    color="primary"
                  />
                }
                label='Compras'
              />
            </FormGroup> */}
          </Grid>

          {
            (this.state.loading) ?
              <Empty
                isLoading={this.state.loading}
                title="Cargando información..."
                description="Espere un momento por favor."
              />
              :
              (this.state.optionSelected === 'REPARTIDORES') ?
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  {
                    (this.state.deliverys.length > 0) ?
                      <TableCRUD
                        user={this.state.user}
                        module={module}
                        data={this.state.deliverys}
                        actionsFunction={(item) => this.getDeliveryActions(item)}
                        handleActionsFunction={(item, option) => { this.handleDeliveryActions(item, option) }}
                        params={[
                          {
                            title: "Nombre",
                            name: "userName",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Teléfono",
                            name: "cellphone",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Correo electrónico",
                            name: "email",
                            type: "string",
                            responsive: "md"
                          },
                          {
                            title: "Ciudad",
                            name: "municipality",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Estatus",
                            name: "statusName",
                            type: "string",
                            responsive: "xl"
                          }
                        ]}
                      />
                      :
                      <Empty
                        title="¡No hay repartidores!"
                        descrpition="No hay repartidores para mostrar" />
                  }
                </Grid>
                :
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  {
                    (this.state.orders.length > 0) ?
                      <TableCRUD
                        user={this.state.user}
                        module={module}
                        data={this.state.orders}
                        actionsFunction={(item) => this.getOrderActions(item)}
                        handleActionsFunction={(item, option) => { this.handleOrderActions(item, option) }}
                        params={[
                          {
                            title: "Folio",
                            name: "order",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Cliente",
                            name: "client",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Ciudad",
                            name: "municipality",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Estatus",
                            name: "pipeline",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Repartidor",
                            name: "delivery",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Fecha de compra",
                            name: "createdAt",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Tiempo entrega",
                            name: "diference",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Observación",
                            name: "reason",
                            type: "string",
                            responsive: "xl"
                          }
                        ]}
                      />
                      :
                      <Empty
                        title="¡No hay compras!"
                        description="No hay compras para mostrar" />
                  }
                </Grid>
          }
          <CalzzamovilOrderModal
            open={this.state.openOrderModal}
            data={this.state.orderDetail}
            handleClose={() => {
              this.setState({
                openOrderModal: false
              }, () => {
                this.props.history.push('/calzzamovil/compras')
              })
            }}
          />

          <CalzzamovilDeliveryModal
            open={this.state.openDeliveryModal}
            data={this.state.deliveryDetail}
            handleClose={() => {
              this.setState({
                openDeliveryModal: false
              }, () => {
                this.props.history.push('/calzzamovil/repartidores')
              })
            }}
            loadData={() => this.loadData()}
          />

          <CalzzamovilClientModal
            open={this.state.openClientModal}
            data={this.state.clientDetail}
            handleClose={() => {
              this.setState({
                openClientModal: false
              }, () => {
                this.props.history.push('/calzzamovil/compras')
              })
            }}
          />

          <CalzzamovilEvidenceModal
            open={this.state.openEvidenceModal}
            data={this.state.evidence}
            handleClose={() => {
              this.setState({
                openEvidenceModal: false
              }, () => {
                this.props.history.push('/calzzamovil/compras')
              })
            }}
          />

          <CalzzamovilPausedOrderModal
            open={this.state.openCancelModal}
            data={this.state.orderSelected}
            handleClose={() => {
              this.setState({
                openCancelModal: false
              }, () => {
                this.props.history.push('/calzzamovil/compras')
              })
            }}
            loadData={() => this.loadData()}
          />

          <CalzzamovilReubicar
            open={this.state.openReubicar}
            data={this.state.orderSelected}
            handleClose={() => {
              this.setState({
                openReubicar: false
              }, () => {
                this.props.history.push('/calzzamovil/compras')
              })
            }}
            loadData={() => this.loadData()}
          />

          <CalzzamovilUploadEvidence
            open={this.state.uploadEvidence}
            data={this.state.orderSelected}
            handleClose={() => {
              this.setState({
                uploadEvidence: false
              }, () => {
                this.props.history.push('/calzzamovil/compras')
              })
            }}
            loadData={() => this.loadData()}
          />


        </Grid>
      )
    } else {
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
)(Calzzamovil)
