import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Hidden, Typography } from '@material-ui/core'
import Router from 'next/router'

// Utils
import Utils from '../../resources/Utils'
import { requestAPI } from '../../api/CRUD'

// Components
import MyAccountMenu from '../../components/MyAccountMenu'
import OrderDetail from '../../components/OrderDetail'
import OrderDetailModal from '../../components/OrderDetailModal'
import Empty from '../../components/Empty'

const styles = theme => ({
  root: {
    width: '100%',
    padding: '12px 48px 154px 48px',
    minHeight: 500,
    backgroundColor: "#F4F4F4",
    [theme.breakpoints.down('sm')]: {
      padding: "6px 0px 32px 0px",
    },
    [theme.breakpoints.down('xs')]: {
      padding: "0px 0px 32px 0px",
    }
  },
  container: {
    padding: '48px 32px 32px 0px',
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
      padding: '8px 16px 32px 16px',
    },
    [theme.breakpoints.down('xs')]: {
      padding: '8px 16px 16px 16px',
    }
  },
  title: {
    width: '100%',
    fontSize: '32px',
    color: '#000000',
    margin: '0px 8px 20px 8px',
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
  }
})

class MyOrders extends Component {
  constructor(props) {
    super(props)
    this.state = {
      redirect: false,
      orders: [],
      ordersLoaded: false,
      openOrderDetailModal: false,
      dataOrderDetailModal: null,
      emptyTitle: '¡Sin pedidos!',
      emptyDescription: 'No hay pedidos para mostrar.',
      emptyButtonTitle: '',
    }

    this.getOrders = this.getOrders.bind(this)
    this.handleOpenModal = this.handleOpenModal.bind(this)
  }

  handleOpenModal(data) {
    this.setState({
      openOrderDetailModal: true,
      dataOrderDetailModal: data
    })
  }

  async componentWillMount() {
    let user = await Utils.getCurrentUser()
    if (user !== null) {
        this.getOrders()
    } else {  
      Router.push(Utils.constants.paths.login)
    }
  }

  async getOrders() {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: `/orders`
    })
    this.setState({
      ordersLoaded: true
    })

    if (response.data !== undefined) {
      this.setState({
        orders: response.data,
      })
    }
  }

  render() {
    const { classes } = this.props

    return (
      (this.state.redirect) ?
        <Redirect to={ Utils.constants.paths.signUp } />
        :
        <Grid container className={classes.root}>
          <Hidden smDown>
            <Grid item xl={4} lg={4} md={4}>
              <MyAccountMenu text={"Mis pedidos"} />
            </Grid>
          </Hidden>
          <Grid item xl={8} lg={8} md={8} sm={12} xs={12} className={classes.container}>
            <Typography className={classes.title}>Mis pedidos</Typography>
            {
              (this.state.orders.length > 0) ?
                (this.state.orders.map((order, index) => {
                  return (
                    <OrderDetail
                      key={index}
                      order={order}
                      handleOpen={this.handleOpenModal}
                      handleClose={() => this.setState({ openOrderDetailModal: false })}
                    />
                  )
                }))
                :
                (this.state.ordersLoaded) ?
                  <div style={{ width: '100%', marginBottom: 32 }}>
                    <Empty
                      emptyImg={this.state.emptyImage}
                      title={this.state.emptyTitle}
                      description={this.state.emptyDescription}
                      buttonTitle={this.state.emptyButtonTitle}
                    />
                  </div>
                  :
                  <div>
                    <Empty
                      isLoading={true}
                      title="Cargando..."
                      description="Espera un momento por favor."
                    />
                  </div>
            }
            {
              (this.state.dataOrderDetailModal !== null) ?
                <OrderDetailModal
                  open={this.state.openOrderDetailModal}
                  host={Utils.constants.CONFIG_ENV.HOST}
                  data={this.state.dataOrderDetailModal}
                  handleClose={() => { this.setState({ openOrderDetailModal: false }) }}
                />
                :
                ''
            }
          </Grid>
        </Grid>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
    return {
    }
}
export default compose(withStyles(styles),connect(mapStateToProps, mapDispatchToProps))(MyOrders)

