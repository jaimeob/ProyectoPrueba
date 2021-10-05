import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import './App.css'

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

// Containers
import Home from './containers/Home'
import NewPassword from './containers/NewPassword'
import RecoveryPassword from './containers/RecoveryPassword'
import Dashboard from './containers/Dashboard'
import Carts from './containers/Carts'
import Orders from './containers/Orders'
import Users from './containers/Users'
import Landings from './containers/Landings'
import NewLanding from './containers/NewLanding'
import Calzzamovil from './containers/Calzzamovil'
import Foliador from './containers/Foliador'
import Persons from './containers/Persons'
import Giveaway from './containers/Giveaway'
import DetailProducts from './containers/UploadPruductsDetailed'
import Mailing from './containers/Mailing'

import CMS from './containers/CMS'
import Products from './containers/Products'
import NotFound from './containers/NotFound'

// Components
import Navbar from './components/Navbar'
import Menu from './components/Menu'
import Footer from './components/Footer'

// Utils
import Utils from './resources/Utils'
import { requestGetConfigs } from './actions/actionConfigs'

const styles = theme => ({
  root: {
    height: 9999,
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex'
  },
  content: {
    backgroundColor: theme.palette.frame.main,
    minWidth: 0,
    paddingTop: 80,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 0,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 84
    },
    [theme.breakpoints.down('xs')]: {
      paddingTop: 74
    }
  },
  contentWithMenu: {
    backgroundColor: theme.palette.frame.main,
    minWidth: 0,
    paddingTop: 84,
    paddingLeft: 244,
    paddingRight: 24,
    paddingBottom: 80,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 80,
      paddingRight: 20
    },
    [theme.breakpoints.down('xs')]: {
      paddingTop: 74
    }
  },
  toolbar: theme.mixins.toolbar,
  loadingBar: {
    zIndex: 999999,
    height: 4,
    backgroundColor: "red",
    position: "fixed",
    top: 0
  }
})

class App extends Component {
  constructor(props) {
    super(props)
    this.props.requestGetConfigs(localStorage.getItem(Utils.constants.localStorage.UUID))

    const self = this

    this.showLoadingBar = this.showLoadingBar.bind(this)
    this.hideLoadingBar = this.hideLoadingBar.bind(this)

    let proxied = window.XMLHttpRequest.prototype.send
    window.XMLHttpRequest.prototype.send = function () {
      let count = 0
      self.showLoadingBar()
      let pointer = this
      let intervalId = window.setInterval(function () {
        if (pointer.readyState !== 4) {
          if (count >= 0 && count < 60) {
            count += 1
          }
          if (count >= 60 && count < 90) {
            count += 0.5
          } else if (count >= 90 && count < 95) {
            count = count + 0.1
          } else if (count >= 95 && count < 99) {
            count = count + 0.05
          }
          self.showLoadingBar(count)
          return
        }
        self.hideLoadingBar()
        clearInterval(intervalId)
      }, 1)
      return proxied.apply(this, [].slice.call(arguments))
    }

    /*
    service.register({
      async onRequest(config) {
        if (config.url && config.url.indexOf(Utils.constants.HOST) >= 0) {
          let metadata = Utils.getMetadata()
          let logs = Utils.getTracking()
          if (logs && logs.length > 0) {
            config.headers.log = JSON.stringify({ metadata, logs })
            Utils.resetTacking()
          }
        }
        return config
      }
    })
    */

    this.state = {
      navbarType: 1,
      progress: 0,
      showLoadingBar: false,
      showMessengerFacebook: true
    }

    this.props.requestGetConfigs(
      localStorage.getItem(Utils.constants.localStorage.UUID)
    )
  }

  showLoadingBar(count) {
    this.setState({
      progress: count,
      showLoadingBar: true
    })
  }

  hideLoadingBar() {
    const self = this
    this.setState(
      {
        progress: 100
      },
      function () {
        setTimeout(function () {
          self.setState({
            showLoadingBar: false,
          })
        }, 1000)
      }
    )
  }

  showMenu() {
    let pathname = window.location.pathname
    if (pathname === Utils.constants.paths.home || pathname === Utils.constants.paths.newPassword || pathname === Utils.constants.paths.recoveryPassword) {
      return false
    }

    return true
  }

  showFooter() {
    let pathname = window.location.pathname
    if (pathname === Utils.constants.paths.home || pathname === Utils.constants.paths.newPassword || pathname === Utils.constants.paths.recoveryPassword) {
      return true
    }

    return false
  }

  render() {

    const { classes } = this.props

    return (
      <Router>
        <div className={classes.root}>
          {
            (this.state.showLoadingBar) ?
              <div
                className={classes.loadingBar}
                style={{ width: this.state.progress + "%" }}
              ></div>
              :
              ''
          }
          {
            (!Utils.isEmpty(this.props.app.configs)) ?

              <Navbar
                showMenuButton={this.showMenu()}
                navbarLogo={this.props.app.configs.navbarLogo}
                mainTitle={this.props.app.configs.mainTitle}
              />

              :

              ''
          }

          {
            (this.showMenu()) ?
              <Menu />
              :
              ''
          }

          <Grid container direction="row" justify="flex-start" alignItems="flex-start" className={(this.showMenu()) ? classes.contentWithMenu : classes.content}>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Switch>
                <Route exact path={Utils.constants.paths.home} component={Home} />
                <Route exact path={Utils.constants.paths.newPassword} component={NewPassword} />
                <Route exact path={Utils.constants.paths.recoveryPassword} component={RecoveryPassword} />
                <Route exact path={Utils.constants.paths.dashboard} component={Dashboard} />
                <Route exact path={Utils.constants.paths.orders} component={Orders} />
                <Route exact path={Utils.constants.paths.products} component={Products} />
                <Route exact path={Utils.constants.paths.carts} component={Carts} />
                <Route exact path={Utils.constants.paths.cms} component={CMS} />
                <Route exact path={Utils.constants.paths.newBlock} component={CMS} />
                <Route exact path={Utils.constants.paths.createBlock} component={CMS} />
                <Route exact path={Utils.constants.paths.editBlock} component={CMS} />
                <Route exact path={Utils.constants.paths.users} component={Users} />
                <Route exact path={Utils.constants.paths.landings} component={Landings} />
                <Route exact path={Utils.constants.paths.createLanding} component={Landings} />
                <Route exact path={Utils.constants.paths.editUrlLanding} component={Landings} />
                <Route exact path={Utils.constants.paths.editLanding} component={NewLanding} />
                <Route exact path={Utils.constants.paths.newLandingBlock} component={NewLanding} />
                <Route exact path={Utils.constants.paths.createLandingBlock} component={NewLanding} />
                <Route exact path={Utils.constants.paths.editLandingBlock} component={NewLanding} />
                <Route path={Utils.constants.paths.calzzamovil} component={Calzzamovil} />
                <Route path={Utils.constants.paths.giveaway} component={Giveaway} />
                <Route path={Utils.constants.paths.mailing} component={Mailing} />
                <Route path={Utils.constants.paths.foliador} component={Foliador} />
                <Route path={Utils.constants.paths.persons} component={Persons} />
                <Route path={Utils.constants.paths.detailProducts} component={DetailProducts} />
                <Route path="*" component={NotFound} />
              </Switch>
            </Grid>
          </Grid>
          {
            (!Utils.isEmpty(this.props.app.configs)) ?

              (this.showFooter()) ?
                <Footer
                  footerLogo={this.props.app.configs.footerLogo}
                  name={this.props.app.name}
                  website={this.props.app.configs.website}
                  urlTerms={this.props.app.configs.urlTerms}
                  urlPrivacy={this.props.app.configs.urlPrivacy}
                />
                :

                ''
              :

              ''
          }
        </div>
      </Router>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    requestGetConfigs: (uuid) => {
      dispatch(requestGetConfigs(uuid))
    }
  }
}

export default compose(
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(App)
