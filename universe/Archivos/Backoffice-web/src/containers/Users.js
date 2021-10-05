import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

// Components
import TableCRUD from '../components/TableCRUD'
import NotFound from './NotFound'
import Title from '../components/Title'
import NewUserModal from '../components/NewUserModal'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Empty from '../components/Empty'
import Head from '../components/Head'

const styles = theme => ({

})

class Users extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openModal: false,
      openSnack: false,
      messageSnack: '',
      loading: true,
      showData: false,
      user: null,
      data: [],
    }
    this.loadData = this.loadData.bind(this)
  }

  async loadData() {
    let user = await Utils.getCurrentUser()

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/list'
    })

    this.setState({
      loading: false,
      showData: (response.data.length > 0) ? true : false,
      user: user,
      data: response.data
    })
  }

  async componentWillMount() {
    this.loadData()
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  async searchQuery(filter) {
    this.setState({
      loading: true
    })

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/list',
      filter
    })

    this.setState({
      loading: false,
      showData: (response.data.length > 0) ? true : false,
      data: response.data
    })
  }

  action() {

  }

  handleAction() {

  }

  createUser(event) {
    this.props.history.push(Utils.constants.paths.addUsers)
  }

  render() {
    const { classes } = this.props
    const self = this
    const module = Utils.app().modules.Users

    if (module.permissions.read) {
      return (
        <div>
          <Grid container>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <Title title="Crear usuario." />
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8, marginBottom: 8 }}>
              <Head
                searchPlaceholder="Buscar usuario por nombre, correo, etc."
                titleButtonCreate="Crear usuario"
                searchQuery={(data) => { this.searchQuery(data) }}
                callToCreate={(module.permissions.create) ? (() => { this.setState({ openModal: true }) }) : false}
              />
            </Grid>

          </Grid>
          {
            (this.state.loading) ?
              <Empty
                isLoading={this.state.loading}
                title="Cargando usuarios..."
                description="Espere un momento por favor."
              />
              : (this.state.data.length > 0) ?
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
                            actions={this.action()}
                            handleActions={(item, action) => { this.handleAction(item, action) }}
                            params={[
                              {
                                title: "Usuario",
                                name: "fullName",
                                type: "string",
                                responsive: "sm"
                              },
                              {
                                title: "Correo electrónico",
                                name: "email",
                                type: "string",
                                responsive: "sm"
                              },
                              {
                                title: "Celular",
                                name: "cellphone",
                                type: "string",
                                responsive: "md"
                              },
                              {
                                title: "Creado por",
                                name: "createdBy",
                                type: "string",
                                responsive: "xs"
                              },
                              {
                                title: "Estado",
                                name: "status",
                                type: "string",
                                responsive: "xs"
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
                  title="¡No tienes usuarios!"
                  description="No hay usuarios para mostrar."
                />
          }

          <NewUserModal
            open={this.state.openModal}
            handleClose={() => {
              this.loadData()
              this.setState({ openModal: false })
            }}
          />
        </div>
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
)(Users)
