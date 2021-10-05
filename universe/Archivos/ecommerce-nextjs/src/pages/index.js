'use strict'

import React, { Component } from 'react'
import Utils from '../resources/Utils'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import MainLayout from '../modules/Layout/MainLayout'
import HomeView from '../modules/Home/homeView'
import Axios from 'axios'

import { setNewCode } from '../actions/actionBluePoints'

import MessengerCustomerChat from 'react-messenger-customer-chat'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Icon, Hidden } from '@material-ui/core'
import BluePointsModal from '../components/BluePointsModal'
import BottomBarMovil from '../components/BottomBarMovil'
import { requestAPI } from '../api/CRUD'
import cookies from 'next-cookies'

const styles = (theme) => ({
  container: {
    backgroundColor: '#EDEEF2',
    marginTop: 163,
    [theme.breakpoints.down('md')]: {
      marginTop: 190
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 178
    }
  },
  bluePointsContainer: {
    width: 320,
    bottom: 24,
    cursor: 'pointer',
    [theme.breakpoints.down('xs')]: {
      bottom: 62,
      margin: 0,
      padding: 0,
      left: '0!important;',
      marginLeft: '2.5%',
      marginRight: '2.5%',
      width: '95%'
    }
  },
  bluePointsContainerActive: {
    width: 320,
    bottom: 24,
    cursor: 'pointer',
    [theme.breakpoints.down('xs')]: {
      bottom: 62,
      margin: 0,
      padding: 0,
      left: '0!important;',
      marginLeft: '2.5%',
      marginRight: '2.5%',
      width: '95%'
    }
  },
  whatsAppContainer: {
    bottom: 24,
    [theme.breakpoints.down('xs')]: {
      bottom: 72,
      margin: 0,
      padding: 0,
      left: '0!important;',
      marginLeft: '2.5%',
      marginRight: '2.5%',
      width: '95%'
    }
  }
})

class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openBluePoints: false,
      user: null
    }
  }
  
  async componentWillMount() {
    if (cookies(this.props).isBannerOpen === undefined) document.cookie = `isBannerOpen=${true}; path=/`

    let user = await Utils.getCurrentUser()
    this.setState({
      user: user
    })
    if (user !== null) {
      let bluePoints = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'GET',
        resource: 'users',
        endpoint: '/bluepoints'
      })
      if (bluePoints.status === Utils.constants.status.SUCCESS) {
        this.props.setNewCode(bluePoints.data)
      }
    }
  }

  render() {
    const { classes } = this.props
    return (
      <>
        {this.props.app.data !== null ? (
          <MainLayout>
            <div className={classes.container}>
              <HomeView blocks={this.props.blocks} app={this.props.app} />
              <div
                style={{ padding: 12, paddingTop: 16, zIndex: 1000, width: 62, height: 62, textAlign: 'center', backgroundColor: '#25CC68', borderRadius: '50%', position: 'fixed', left: 32 }}
                className={classes.whatsAppContainer}
              >
                <a href='https://api.whatsapp.com/send?phone=526677515229&text=Hola,%20me%20gustaria%20hablar%20con%20un%20asesor%20de%20Calzzapato'>
                  <img style={{ width: 28 }} alt='whatsapp' src={'./whatsapp.svg'} />
                </a>
              </div>
              {this.props.app.data !== undefined && Utils.constants.CONFIG_ENV.APP_MODE === 'production' ? (
                <MessengerCustomerChat
                  pageId='130326850383983'
                  appId='569260793822380'
                  loggedInGreeting={this.props.app.data.configs.hiMessageMessengerFB}
                  loggedOutGreeting={this.props.app.data.configs.hiMessageMessengerFB}
                  themeColor={this.props.app.data.configs.primaryColor}
                  language='es_LA'
                  version='5.0'
                />
              ) : (
                ''
              )}
              <Hidden smUp>
                <BottomBarMovil />
              </Hidden>
              <BluePointsModal
                open={this.state.openBluePoints}
                data={this.state.user !== null ? this.state.user.bluePoints : null}
                handleClose={() => {
                  this.setState({
                    openBluePoints: false
                  })
                }}
              />
            </div>
          </MainLayout>
        ) : null}
      </>
    )
  }
}

export async function getServerSideProps() {
  let filter = {
    where: {
      status: true
    },
    skip: 0,
    limit: 100,
    order: 'position ASC'
  }
  let response = await Axios(Utils.constants.CONFIG_ENV.HOST + '/api/blocks/?filter=' + JSON.stringify(filter), { headers: { uuid: Utils.constants.CONFIG_ENV.UUID } })
  let data = await response.data
  let idx = null
  data.forEach((block, i) => {
    if (block.blockTypeId === 16) {
      idx = i
    }
  })
  let buttons = []
  if (idx !== null) {
    let responseButtons = await Axios({
      method: 'GET',
      url: Utils.constants.CONFIG_ENV.HOST_API + '/menu/buttons',
      headers: {
        uuid: Utils.constants.CONFIG_ENV.UUID
      }
    })
    buttons = await responseButtons.data
    data[idx].buttons = buttons
  }
  console.log(data,"PAGES");
  return { props: { blocks: data } }
}

const mapStateToProps = (state) => ({ ...state })

const mapDispatchToProps = {
  setNewCode
}

export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(Index)
