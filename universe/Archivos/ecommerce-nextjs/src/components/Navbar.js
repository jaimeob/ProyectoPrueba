'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'
import { isAndroid, isIOS, isIOS13 } from 'react-device-detect'
import CloseIcon from '@material-ui/icons/Close'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, AppBar, Toolbar, Hidden, Typography, Button, IconButton, Avatar, Box } from '@material-ui/core'

import Utils from '../resources/Utils'

// Components
import Headband from './Headband'
import Search from './Search'
import NavigationMenuDesign from './NavigationMenuDesign'
import MyAccount from './MyAccount'
import ShoppingCart from './ShoppingCart'
import BrandsMenu from './BrandsMenu'
import DeliveryInfoBar from './DeliveryInfoBar'
import Menu from './Menu'
import cookies from 'next-cookies'
import TrackingProduct from './TrackingProduct'

const styles = (theme) => ({
  appBar: {
    backgroundColor: theme.palette.background.main,
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: '1px 1px 1px 1px rgba(192, 198, 214, 0.1)',
    borderBottom: '2px solid #C0C6D6',
    top: 0,
    left: 0,
    width: '100%',
    marginBottom: 36
  },
  toolbar: {
    margin: 0,
    padding: 0,
    width: 'auto'
  },
  logo: {
    textAlign: 'center',
    height: 'auto',
    width: theme.sizes.sizeNavbarLogo + 30,
    margin: '0 auto',
    [theme.breakpoints.down('md')]: {
      width: theme.sizes.sizeNavbarLogo + 15
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: 22,
      width: theme.sizes.sizeNavbarLogo
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 6,
      marginLeft: 26,
      width: theme.sizes.sizeNavbarLogo - 20
    }
  },
  menuButton: {
    [theme.breakpoints.down('sm')]: {
      marginTop: 0
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 4
    }
  }
})

class Navbar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      winScroll: 0,
      direction: 'UP',
      iosAppLink: '',
      androidAppLink: '',
      appIcon: '',
      isBannerOpen: cookies(props).isBannerOpen
    }

    this.handleChange = this.handleChange.bind(this)

    switch (props.app.data.id) {
      case 1:
        this.state.iosAppLink = 'https://apps.apple.com/mx/app/calzzapato/id1276449293'
        this.state.androidAppLink = 'https://play.google.com/store/apps/details?id=com.calzzapato&hl=es_MX'
        this.state.appIcon = '/calzzapatoApp.png'
        break
      case 2:
        this.state.iosAppLink = 'https://apps.apple.com/mx/app/kelder/id1535865926'
        this.state.androidAppLink = 'https://play.google.com/store/apps/details?id=mx.kelder'
        this.state.appIcon = '/kelderApp.png'
        break
      case 3:
        this.state.iosAppLink = 'https://apps.apple.com/mx/app/urbanna/id1538452227'
        this.state.androidAppLink = 'https://play.google.com/store/apps/details?id=mx.urbanna&hl=es_MX'
        this.state.appIcon = '/urbannaApp.png'
        break
      case 4:
        this.state.iosAppLink = 'https://apps.apple.com/mx/app/calzzasport/id1538281258'
        this.state.androidAppLink = 'https://play.google.com/store/apps/details?id=com.calzzasport'
        this.state.appIcon = '/calzzasportApp.png'
        break
      case 5:
        this.state.iosAppLink = 'https://apps.apple.com/mx/app/calzakids/id1538452345'
        this.state.androidAppLink = 'https://play.google.com/store/apps/details?id=mx.calzakids'
        this.state.appIcon = '/calzzakidsApp.png'
        break
    }
  }

  handleChange(value) {
    value.filter.queryParams.length === 0 ? window.open(value.filter.url, '_self') : window.open(`${value.filter.url}?${JSON.stringify(value.filter.queryParams)}`, '_self')
  }

  handleChangePage(url) {
    if (Utils.isExternalLink(url.filter.url)) {
      window.open(url.filter.url, '_self')
    } else {
      Router.push(url.filter.url)
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.listenToScroll)
  }

  listenToScroll = () => {
    let direction = ''
    if (document.body.getBoundingClientRect().top > this.state.scrollPos) direction = 'UP'
    else direction = 'DOWN'

    let scrollPos = document.body.getBoundingClientRect().top

    let winScroll = document.body.scrollTop || document.documentElement.scrollTop

    this.setState({
      winScroll: winScroll,
      scrollPos: scrollPos,
      direction: direction
    })
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.listenToScroll)
  }

  render() {
    const { classes } = this.props

    let topNavbar = 0
    let headband = null

    if (this.props.headband !== undefined && this.props.headband !== null && this.props.headband.show) {
      topNavbar = 36
      headband = this.props.headband
    }

    return (
      <div>
        <AppBar id='info-box' className={classes.appBar} style={{ top: topNavbar, position: this.state.direction === 'DOWN' ? 'absolute' : 'fixed' }}>
          <Toolbar className={classes.toolbar}>
            <Grid container justify='center' alignItems='center'>
              {this.state.winScroll < 72 ? (
                <Grid item xs={12}>
                  {this.state.isBannerOpen == 'true' && (isAndroid || isIOS || isIOS13) ? (
                    <Hidden smUp>
                      <Grid container xs={12} style={{ background: '#e2eaf4', height: '76px', color: 'black' }}>
                        <Grid container item xs={2} alignItems='center' align='center' justify='center'>
                          <Avatar variant='rounded' src={this.state.appIcon} style={{ width: '60px', height: '60px' }}></Avatar>
                        </Grid>
                        <Grid container item xs={9} direction='column' justify='space-around' alignItems='center'>
                          <Grid item>
                            <Typography variant='caption' style={{ fontSize: '.75rem' }}>
                              <strong>Instala nuestra app y navega más fácil</strong>
                            </Typography>
                          </Grid>
                          <Grid item>
                            <a href={isAndroid ? this.state.androidAppLink : this.state.iosAppLink} target='_blank' rel='noopener noreferrer'>
                              <Button variant='contained' size='small' style={{ backgroundColor: this.props.app.data.configs.primaryColor, width: '12rem', color: 'white' }}>
                                <Typography variant='caption' style={{ fontSize: '0.75rem', 'text-transform': 'none' }}>
                                  <strong>Instalar</strong>
                                </Typography>
                              </Button>
                            </a>
                          </Grid>
                        </Grid>
                        <Grid container item xs={1} alignItems='flex-start' justify='center'>
                          <IconButton
                            onClick={() => {
                              document.cookie = `isBannerOpen=${false}; path=/`
                              this.setState({ isBannerOpen: false })
                            }}
                          >
                            <CloseIcon style={{ fontSize: 12, color: this.props.app.data.configs.primaryColor }}></CloseIcon>
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Hidden>
                  ) : (
                      ''
                    )}

                  <BrandsMenu />
                </Grid>
              ) : (
                  ''
                )}

              <Hidden mdUp>
                <Grid item md={2} xs={5} style={{ width: '100%', textAlign: 'left' }}>
                  <Grid container>
                    <Grid item xs={2}>
                      <div className={classes.menuButton}>
                        <Menu />
                      </div>
                    </Grid>
                    <Grid item xs={10}>
                      <a href='/'>
                        <img className={classes.logo} alt={'Logo ' + this.props.app.data.alias} src={this.props.navbarLogo} />
                      </a>
                    </Grid>
                  </Grid>
                </Grid>
              </Hidden>

              <Hidden smDown>
                <Grid item lg={2} xs={3} style={{ width: '100%', textAlign: 'center', paddingTop: 20, paddingBottom: 12 }}>
                  <a href='/'>
                    <img className={classes.logo} alt={'Logo ' + this.props.app.data.alias} src={this.props.navbarLogo} />
                  </a>
                </Grid>
              </Hidden>
              <Hidden smDown>
                <Grid item xs={5}>
                  <Grid container>
                    <Hidden smDown>
                      <Grid item xs={12} style={{ paddingRight: 32 }}>
                        <Search />
                      </Grid>
                    </Hidden>
                  </Grid>
                </Grid>
              </Hidden>
              <Grid item lg={5} md={4} xs={7}>
                <Grid container justify='flex-end' alignItems='center'>
                  <Hidden mdDown>
                    <Grid item lg={3}>
                      <DeliveryInfoBar />
                    </Grid>
                  </Hidden >
                  <Hidden mdDown>
                    <Grid item lg={3} xs={4}>
                      <TrackingProduct />
                    </Grid>
                  </Hidden>
                  <Grid item lg={3} xs={4}>
                    <MyAccount />
                  </Grid>
                  <Grid item lg={3} xs={4}>
                    <ShoppingCart />
                  </Grid>
                </Grid>
              </Grid>
              <Hidden mdUp>
                <Grid item xs={12}>
                  <Search />
                </Grid>
              </Hidden>
              <Hidden smDown>
                <Grid item xs={12}>
                  <NavigationMenuDesign />
                </Grid>
              </Hidden>
              <Hidden lgUp>
                <Grid item xs={9}>
                  <DeliveryInfoBar />
                </Grid>
              </Hidden>
              <Hidden lgUp>
                <Grid xs={3}>
                  <TrackingProduct />
                </Grid>
              </Hidden>
            </Grid>
          </Toolbar>
        </AppBar>
        {this.state.isBannerOpen == 'true' && (isAndroid || isIOS || isIOS13) ? <Box height={50}></Box> : ''}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({ ...state })

export default compose(withStyles(styles), connect(mapStateToProps, null))(Navbar)