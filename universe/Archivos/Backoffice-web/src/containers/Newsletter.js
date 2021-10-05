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
import OrderInfoModal from '../components/OrderInfoModal'
import DeliveryInfoModal from '../components/DeliveryInfoModal'
import OrderDetailModal from '../components/OrderDetailModal'
import OrderCommentsModal from '../components/OrderCommentsModal'
import OrderHistoryModal from '../components/OrderHistoryModal'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Empty from '../components/Empty'
import Head from '../components/Head'

const styles = theme => ({})

class Newsletter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      loading: true,
      showData: false,
      user: null,
      data: [],
      selectedOrder: null
    }

    this.sendNewsletter = this.sendNewsletter.bind(this)
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
      resource: 'newsletter',
      endpoint: '/all'
    })

    this.setState({
      loading: false,
      showData: (response.data.length > 0) ? true : false,
      user: user,
      data: response.data
    })
  }

  handleActions(item, option) {
  }

  getActions() {
    return []
  }

  async searchQuery(data) {
    this.setState({
      loading: true
    })

    let response = await requestAPI({
      host: Utils.constants.HOST_API_ECOMMERCE,
      uuid: localStorage.getItem(Utils.constants.localStorage.BUSINESS_UNIT),
      method: 'GET',
      resource: 'newsletter',
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

  sendNewsletter(event) {
    
  }

  render() {
    
    const self = this
    const { classes } = this.props
    const module = Utils.app().modules.Newsletter

    if (module.permissions.read) {
      return (
        <div>
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Title
                title="Newsletter."
                description="Newsletter."
              />
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8, marginBottom: 8 }}>
              <Head
                searchPlaceholder="Buscar pedido por nombre, folio, etc."
                titleButtonCreate="Enviar newsletter"
                searchQuery={ (data) => { this.searchQuery(data) } }
                callToCreate={ (module.permissions.create) ? ( (event) => { this.sendNewsletter(event) } ) : false }
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
                            title: "UUID",
                            name: "uuid",
                            type: "string",
                            responsive: "xl"
                          },
                          {
                            title: "Nombre",
                            name: "name",
                            type: "string",
                            responsive: "lg"
                          },
                          {
                            title: "URL",
                            name: "url",
                            type: "string",
                            responsive: "lg"
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
                title="¡Sin suscriptores!"
                description="No hay suscriptores para mostrar."
              />
            :
            <Empty 
              isLoading={this.state.loading}
              title="Cargando suscriptores..."
              description="Espere un momento por favor."
            />
          }
          <OrderInfoModal
            data={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
              }, () => {
                self.props.history.push('/solicitudes')
              })
            }}
          />
          <DeliveryInfoModal
            data={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
              }, () => {
                self.props.history.push('/solicitudes')
              })
            }}
          />
          <OrderDetailModal
            data={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
              }, () => {
                self.props.history.push('/solicitudes')
              })
            }}
          />
          <OrderCommentsModal
            data={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
              }, () => {
                self.props.history.push('/solicitudes')
              })
            }}
          />
          <OrderHistoryModal
    
            data={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
        
              }, () => {
                self.props.history.push('/solicitudes')
              })
            }}
          />
          {/*
          <AssignToModal
            data={this.state.selectedOrder}
            handleClose={() => {
              this.setState({
              }, () => {
                self.props.history.push('/solicitudes')
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
)(Newsletter)
