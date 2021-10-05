import React, { Component } from 'react'
import Router from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Hidden, Grid, Typography, Icon } from '@material-ui/core'

//Utils
import Utils from '../resources/Utils'
import { connect } from 'react-redux'
import * as loginAction from '../modules/Login/loginAction'
import BluePointsModal from './BluePointsModal'
const { logout: logoutMyAccount } = loginAction

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
    width: 296,
    position: 'absolute',
    visibility: 'hidden',
    border: 'solid 1px #DBDBDB',
    backgroundColor: 'white',
    zIndex: 1,
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
  text: {
    fontSize: 12
  },
  textAction: {
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 'normal',
    '&:hover': {
      fontWeight: 'bold',
      textDecoration: 'underline'
    }
  }
})

class MyAccount extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      openBluePoints: false,
      user: null,
      isLoadingCode: true
    }

    this.handleOpen = this.handleOpen.bind(this)
    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.handleOpenBluePoints = this.handleOpenBluePoints.bind(this)
  }

  async componentWillMount() {
    document.addEventListener('mousedown', this.handleClickOutside, false)

    if (Utils.isUserLoggedIn()) {
      this.setState({
        user: await Utils.getCurrentUser()
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

  handleOpenBluePoints(event) {
    event.preventDefault()

    if (this.state.user !== null && this.state.user.calzzapatoUserId !== null) {
      this.setState({
        open: false,
        openBluePoints: true
      })
    } else {
      window.open("https://www.monederoazul.com?login=" + this.state.user.email)
    }
  }

  handleOpen() {
    if ((this.state.user !== undefined && this.state.user !== null) || this.props.login.token !== '') {
      this.setState({ open: !this.state.open })
    } else {

      Router.push(Utils.constants.paths.login)
    }
  }

  closeSesion() {
    localStorage.removeItem(Utils.constants.localStorage.USER)
    localStorage.removeItem(Utils.constants.localStorage.CATALOG)
    localStorage.removeItem(Utils.constants.localStorage.CATALOG_INIT)
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

    let bluePointsCondition = (this.state.user !== undefined && this.state.user !== null && this.state.user.calzzapatoUserId !== undefined && this.state.user.calzzapatoUserId !== null && this.props.bluePoints !== undefined && this.props.bluePoints !== null && this.props.bluePoints.data !== undefined && this.props.bluePoints.data !== null)
    
    return (
      <div ref={this.setWrapperRef}>
        <Hidden mdDown> {/* INLINE */}
          <div style={{display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexWrap: 'wrap', cursor: 'pointer'}}>
            {
              (bluePointsCondition)?
                <img 
                  style={{ width: 35, height: 35, marginRight: 8, borderRadius: '50%!important'}} 
                  onClick={(event) => this.handleOpenBluePoints(event)}
                  src={ Utils.constants.CONFIG_ENV.HOST + this.props.bluePoints.data.qrImage } />
              :
                <Icon onClick={() => this.handleOpen()} style={{color: '#243B7A', marginRight: 8}}>person</Icon>
            }

            {
              (this.state.user !== undefined && this.state.user !== null)? 
                <Typography 
                  className={classes.text} 
                  onClick={() => this.handleOpen()}
                  variant="body1" >
                    <span>Mi cuenta</span>
                    {
                      (bluePointsCondition)?
                      <>
                        <br/>
                        {
                          (this.props.bluePoints.data.balance === 1) ?
                          <span style={{ fontSize: 10 }} >Tienes <label style={{ fontSize: 12 }}>{Utils.numberWithCommas(this.props.bluePoints.data.balance)}</label> punto</span>
                          :
                          <span style={{ fontSize: 10 }} >Tienes <label style={{ fontSize: 12 }}>{Utils.numberWithCommas(this.props.bluePoints.data.balance)}</label> puntos</span>
                        }
                      </>
                      :
                        ''
                    }
                </Typography>
              :
                <Typography 
                  className={classes.text} 
                  onClick={() => this.handleOpen()}
                  variant="body1" 
                  align="center">
                    Ingresar
                </Typography>
              }
          </div>
        </Hidden>
        <Hidden lgUp>
          <div style={{display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexWrap: 'wrap', cursor: 'pointer'}}>
              <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
              {
                (bluePointsCondition)?
                  <img 
                    style={{ width: 35, height: 35, borderRadius: '50%!important'}} 
                    onClick={(event) => this.handleOpenBluePoints(event)}
                    src={ Utils.constants.CONFIG_ENV.HOST + this.props.bluePoints.data.qrImage } />
                :
                  <Icon onClick={() => this.handleOpen()} style={{color: '#243B7A'}}>person</Icon>
              }
              </div>
              {
                (this.state.user !== undefined && this.state.user !== null)? 
                  <Typography 
                    className={classes.text} 
                    onClick={() => this.handleOpen()}
                    variant="body1" 
                    align="center"> 
                    Mi cuenta
                  </Typography>
                :
                  <Typography 
                    className={classes.text} 
                    onClick={() => this.handleOpen()}
                    variant="body1" 
                    align="center">
                      Ingresar
                  </Typography>
              }
          </div>
        </Hidden>
        {
          (this.state.user !== undefined && this.state.user !== null)?
            <>
              <Grid container className={classes.menuContainer} style={{ visibility: (this.state.open !== false) ? 'visible' : 'hidden' }}>
                <Grid item xs={12} style={{padding: '8px 12px 8px 12px', borderBottom: 'solid 1px #DBDBDB'}}>
                  <Typography style={{fontSize: 14, fontWeight: 500}} variant="body1">Bienvenido, {this.props.login.name}</Typography>
                </Grid>

                <Grid item xs={12} style={{padding: '8px 12px 8px 12px'}} onClick={() => window.location.href="/mi-cuenta"}>
                  <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                    <img style={{ width: 24, height: 24, marginRight: 8 }} src='/menu-icon-myAccount.svg' />
                    <Typography className={classes.textAction} variant="body1">Mi cuenta</Typography>
                  </div>
                </Grid>

                <Grid item xs={12} style={{padding: '8px 12px 8px 12px'}} onClick={(event) => this.handleOpenBluePoints(event)}>
                  <div style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                    <Icon style={{ color: 'black', width: 24, height: 24, marginRight: 8 }}>card_giftcard</Icon>
                    <Typography className={classes.textAction} variant="body1">Monedero Azul ®</Typography>
                  </div>
                </Grid>

                <Grid item xs={12} style={{padding: '8px 12px 8px 12px', borderTop: 'solid 1px #DBDBDB'}}>
                  <Typography 
                    className={classes.textAction} 
                    onClick={() => this.closeSesion()}
                    style={{color: 'red'}}
                    align="center" 
                    variant="body1">Salir</Typography>
                </Grid>
                

            </Grid>
            <BluePointsModal
              open={this.state.openBluePoints}
              data={ (bluePointsCondition)? this.props.bluePoints.data : null }
              handleClose={() => { this.setState({openBluePoints: false}) }}/>
            </>
          :
            ''
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = {
  logoutMyAccount
}

export default connect(mapStateToProps, mapDispatchToProps)((withStyles(styles))(MyAccount))