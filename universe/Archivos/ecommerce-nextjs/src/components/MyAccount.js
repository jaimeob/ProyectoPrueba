import React, { Component } from 'react'
import Router from 'next/router'
import Cookies from 'universal-cookie'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Hidden, Tabs, Tab, Grid, Typography, Link as MaterialLink, Icon } from '@material-ui/core'

//Utils
import Utils from '../resources/Utils'
import { connect } from 'react-redux'
import * as loginAction from '../modules/Login/loginAction'
import BluePointsModal from './BluePointsModal'
const { logout: logoutMyAccount } = loginAction

const cookies =  new Cookies()

const styles = theme => ({
  accountContainer: {
    background: '#FFFFFF',
    [theme.breakpoints.down('xs')]: {
      borderTop: 'none',
      background: 'none'
    }
  },
  tabs: {
    backgroundColor: '#FFFFFF',
    float: 'right',
    [theme.breakpoints.down('xs')]: {
      borderTop: 0,
      borderBottom: 0,
      background: 'none',
      paddingRight: 0
    }
  },
  tab: {
    textTransform: 'none',
    color: '#243B7A'
  },
  menuContainer: {
    border: 'solid 1px #DBDBDB',
    position: 'absolute',
    width: 296,
    margin: 0,
    padding: 0,
    backgroundColor: 'white',
    zIndex: 1,
    visibility: 'hidden',
    [theme.breakpoints.down('xl')]: {
      top: '62%',
      right: 46
    },
    [theme.breakpoints.down('md')]: {
      top: '60%',
      right: 35
    },
    [theme.breakpoints.down('sm')]: {
      top: '58%',
      right: 78
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      right: 0,
      top: 100
    }
  },
  menuItem: {
    width: '100%',
    padding: '12px 16px 12px 16px'
  },
  menuHeader: {
    width: '100%',
    padding: '16px 16px 16px 16px',
    height: 32,
    borderBottom: 'solid 1px #DBDBDB'
  },
  menuFooter: {
    width: '100%',
    height: 32,
    padding: '20px 16px 20px 16px',
    backgroundColor: '#F4F4F4',
    borderTop: 'solid 1px #DBDBDB'
  },
  menuText: {
    fontSize: 16,
    color: '#000',
  },
  actionText: {
    fontSize: 16,
    color: '#000',
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.primary.main,
      textDecoration: 'none'
    }
  },
  iconButton: {
    marginRight: 4,
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
      marginBottom: 0
    }
  },
  closeSesionText: {
    cursor: 'pointer',
    color: 'red'
  },
  descriptionItem: {
    [theme.breakpoints.up('lg')]: {
      display: 'none'
    }
  },
  textDescritionButton: {
    [theme.breakpoints.down('sm')]: {
      fontSize: 11,
      float: 'left',
    }
  }
})

class MyAccount extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tab: false,
      open: false,
      openBluePoints: false,
      user: null,
      isLoadingCode: true
    }

    this.handleChange = this.handleChange.bind(this)
    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  async componentWillMount() {
    document.addEventListener('mousedown', this.handleClickOutside, false)
    if (Utils.isUserLoggedIn()) {
      let user = await Utils.getCurrentUser()
      this.setState({
        user: user
      })
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside, false)
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ open: false })
    }
  }

  handleChange() {
    if (this.state.user !== null || this.props.login.token !== '') {
      this.setState({ open: !this.state.open })
    } else {
      Router.push(Utils.constants.paths.login)
    }
  }

  closeSesion() {
    localStorage.removeItem(Utils.constants.localStorage.USER)
    localStorage.removeItem(Utils.constants.localStorage.CATALOG)
    localStorage.removeItem(Utils.constants.localStorage.CATALOG_INIT)
    cookies.remove('userEmail',{path: '/'})
    cookies.remove('userToken',{path: '/'})
    this.setState({
      user: null
    }, () => {
      this.props.logoutMyAccount()
      Router.push(Utils.constants.paths.login)
    })
  }

  render() {
    const self = this
    const { classes } = this.props
    return (
      <div className={classes.accountContainer} ref={this.setWrapperRef}>
        <Tabs
          value={this.state.tab}
          onChange={this.handleChange}
          className={classes.tabs}
          indicatorColor="primary"
          textColor="primary">
          {
            (this.props.login.token !== '') ?
              // icon={<Icon>account_circle</Icon>}
              <Tab className={classes.tab} icon={<>
                {
                  (this.state.user !== null) ?
                  <div>
                    {
                      (this.state.user.calzzapatoUserId !== null && this.props.bluePoints !== undefined && this.props.bluePoints.data !== undefined && this.props.bluePoints.data !== null) ?
                      <>
                      <Hidden xsDown>
                        <div 
                          onClick={ (event) => { event.preventDefault(); this.setState({ open: false, openBluePoints: true })}} 
                          style={{ display: 'inline-block', width: 35, height: 35, borderRadius: '50%!important', marginRight: 8 }}>
                          {
                            (this.props.bluePoints !== undefined && this.props.bluePoints.data !== null) ?
                            <img style={{ width: 35, height: 35, borderRadius: '50%!important', marginBottom: -4 }} src={ Utils.constants.CONFIG_ENV.HOST + this.props.bluePoints.data.qrImage } />
                            :
                            ''
                          }
                        </div>
                        <div style={{ display: 'inline-block', textAlign: 'left' }} >
                          <span style={{ display: 'block', marginBottom: -8, paddingBottom: 0 }} >Mi cuenta</span>
                          {
                            (this.props.bluePoints.data.balance === 1) ?
                            <span style={{ fontSize: 10 }} >Tienes <label style={{ fontSize: 12 }}>{Utils.numberWithCommas(this.props.bluePoints.data.balance)}</label> punto</span>
                            :
                            <span style={{ fontSize: 10 }} >Tienes <label style={{ fontSize: 12 }}>{Utils.numberWithCommas(this.props.bluePoints.data.balance)}</label> puntos</span>
                          }
                        </div>
                        <div style={{ display: 'inline-block' }}>
                          <Icon>arrow_right</Icon>
                        </div>
                      </Hidden>
                      <Hidden smUp>
                        <div>
                          <div style={{ display: 'inline-block', width: 35, height: 35, borderRadius: '50%!important' }}>
                          {
                            (this.props.bluePoints !== undefined && this.props.bluePoints.data !== null) ?
                            <img style={{ width: 35, height: 35, borderRadius: '50%!important'}} src={ Utils.constants.CONFIG_ENV.HOST + this.props.bluePoints.data.qrImage } />
                            :
                            ''
                          }
                          </div>
                          <br className={classes.descriptionItem} />
                          <span className={classes.textDescritionButton}>Mi cuenta</span>
                        </div>
                      </Hidden>
                      </>
                      :
                      <div><Icon className={classes.iconButton}>person</Icon> <br className={classes.descriptionItem} /> <span className={classes.textDescritionButton}>Mi cuenta</span></div>
                    }
                  </div>
                  :
                  <div><Icon className={classes.iconButton}>person</Icon> <br className={classes.descriptionItem} /> <span className={classes.textDescritionButton}>Ingresar</span></div>
                }
              </>
              }
              />
              :
              <Tab className={classes.tab} icon={ <div><Icon className={classes.iconButton}>person</Icon> <br className={classes.descriptionItem} /> <span className={classes.textDescritionButton}>Ingresar</span></div>} />
          }
        </Tabs>
        <Grid
          container
          ref={this.setWrapperRef}
          className={classes.menuContainer}
          style={{ visibility: (this.state.open !== false) ? 'visible' : 'hidden' }}>
          <Grid container className={classes.menuHeader} alignContent="center">
            <Typography variant="body1" className={classes.menuText}>Bienvenido, {this.props.login.name}</Typography>
          </Grid>
          <Grid container>
            <Grid container direction="row" className={classes.menuItem}>
              <img style={{ width: 24, height: 24, marginRight: 8 }} src='/menu-icon-myAccount.svg' alt="Tu cuenta Calzzapato" />
              <div className={classes.actionText}>
                <a href="/mi-cuenta" style={{ color: '##243B7A' }}><Typography color="inherit" variant="body2" style={{ color: '##243B7A' }}>Mi cuenta</Typography></a>
              </div>
            </Grid>
            <Grid container direction="row" className={classes.menuItem}>
              <div style={{ color: 'black', width: 24, height: 24, marginRight: 8 }}>
                <Icon>card_giftcard</Icon>
              </div>
              <div className={classes.actionText}>
                <div onClick={ (event) => {
                    event.preventDefault()
                    if (this.state.user !== null && this.state.user.calzzapatoUserId !== null) {
                      this.setState({ open: false, openBluePoints: true }, () => {
                        self.setState({
                          open: false
                        })
                      })
                    } else {
                      window.location.href = "https://www.monederoazul.com?login=" + this.state.user.email
                    }
                  }}>
                  <a href="" style={{ color: '##243B7A' }}><Typography color="inherit" variant="body2" style={{ color: '##243B7A' }}>Monedero Azul ®</Typography></a>
                </div>
              </div>
            </Grid>
          </Grid>
          <Grid container className={classes.menuFooter} alignContent="center" justify="center">
            <Typography className={classes.closeSesionText}>
              <MaterialLink
                variant="body2"
                color="inherit"
                onClick={() => { this.closeSesion() }}>
                Salir
              </MaterialLink>
            </Typography>
          </Grid>
        </Grid>
        <BluePointsModal
          open={this.state.openBluePoints}
          data={ (this.state.user !== null && this.props.bluePoints !== undefined && this.props.bluePoints.data !== null) ? this.props.bluePoints.data : null }
          handleClose={() => { this.setState({openBluePoints: false}) }}/>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = {
  logoutMyAccount
}

export default connect(mapStateToProps, mapDispatchToProps)((withStyles(styles))(MyAccount))