import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'


// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, AppBar, Toolbar, Typography, Hidden } from '@material-ui/core'
import Icon from '@material-ui/core/Icon'
import Router from 'next/router'
import Link from 'next/link'

import ClearIcon from '@material-ui/icons/Clear'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';

// Components
import Headband from './Headband'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({
  imageNavbar: {
    width: '70%',

    [theme.breakpoints.down("sm")]: {
      width: '90%',
    },
    [theme.breakpoints.down("xs")]: {
      width: '90%',
    }
  },
  container: {
    //width: 850,
    width: 1080,
    margin: '0 auto',

    [theme.breakpoints.down("md")]: {
      margin: '0 auto',
      width: 850,
    },
    [theme.breakpoints.down("sm")]: {
      margin: '0 auto',
      width: 750,
    },
    [theme.breakpoints.down("xs")]: {
      margin: '0 auto',
      width: 'auto',
    }
  },
  imageContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  addressContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'blue',
  },
  findProducts: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
  },
  findProductsContainer: {
    [theme.breakpoints.down("sm")]: {
      display:'flex',
      justifyContent:'flex-end'
    }
  },





  appBar: {
    backgroundColor: theme.palette.background.main,
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: '1px 1px 1px 1px rgba(192, 198, 214, 0.1)',
    borderBottom: '2px solid #C0C6D6',
    width: '100%'
  },
  customerInfo: {
    width: '100%',
    backgroundColor: theme.palette.topBar.main,
    padding: '8px 16px'
  },
  navbarTextItem: {
    paddingTop: '20px',
    paddingBottom: '20px',
    margin: 0,
    [theme.breakpoints.down("xs")]: {
      paddingBottom: '0px',

    }
  },
  logo: {
    float: 'left',
    marginRight: '2%',
    height: 'auto',
    width: theme.sizes.sizeNavbarLogo,
    [theme.breakpoints.down('xs')]: {
      marginTop: 4
    }
  },
  searchTextField: {
    fontWeight: 300,
    width: '100%'
  },
  mainTitle: {
    float: 'left',
    margin: 0,
    padding: 0,
    fontSize: 28,
    fontWeight: 600,
    marginTop: 0,
    [theme.breakpoints.down('sm')]: {
      marginTop: 4,
      fontSize: 24
    }
  },
  userContainer: {
    textAlign: 'right',
    margin: 0,
    padding: '12px 36px',
    paddingBottom: 0,
    paddingLeft: 0,
    backgroundColor: '#F4F4F4',
    height: 36,
    fontSize: 16
  },
  cartContainer: {
    float: 'right',
    paddingRight: 32,
    hover: {
      backgroundColor: 'red'
    }
  },
  userIcon: {
    float: 'right',
    padding: 0,
    margin: 0,
    marginTop: 4,
    marginLeft: 12,
    [theme.breakpoints.down('xs')]: {
      opacity: 0,
      heigth: 0,
    }
  },
  userData: {
    margin: 0,
    padding: 0,
    fontSize: 12,
    [theme.breakpoints.down('xs')]: {
      fontSize: 10,
    }
  },
  version: {
    margin: 0,
    padding: 0,
    fontSize: 10
  },
  versionNotSession: {
    fontWeight: 600,
    fontSize: 12
  },
  menuButton: {
    margin: 0,
    marginRight: 12
  }
})

class CheckoutNavbarNew extends Component {
  getUserEmail() {
    if (Utils.isUserLoggedIn()) {
      let data = JSON.parse(localStorage.getItem(Utils.constants.localStorage.USER))
      return data.user.email
    }
    return ''
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
        <AppBar position="absolute" className={classes.appBar} style={{ top: topNavbar }}>
          <Toolbar style={{ padding: 0, margin: 0, minHeight: 'auto' }}>
            <Grid className={classes.container} container justify="flex-start" alignItems="center">
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.navbarTextItem}>
                <Grid container>
                  <Grid item lg={3} sm={3} xs={3} className={classes.imageContainer} >
                    <img className={classes.imageNavbar} src={this.props.app.data.configs.navbarLogo} />
                  </Grid>

                  {/* Desktop */}
                  <Hidden smDown>
                    {
                      (this.props.checkout !== null && this.props.checkout !== undefined && this.props.checkout.address !== null && this.props.checkout.address !== undefined) ?
                        <Grid item xs={6} className={classes.addressContainer}>
                          <LocationOnOutlinedIcon style={{ color: '#808080' }} />
                          <Typography variant="body2" style={{ color: '#808080' }}>
                            Entregar en:
                   </Typography>
                   &nbsp;
                   <Typography variant="body2" style={{ color: '#006fb9' }}>
                            {this.props.checkout.address.municipality + ', ' + this.props.checkout.address.state}
                          </Typography>
                        </Grid>
                        :
                        <Grid item xs={6} className={classes.addressContainer}>
                          ''
                  </Grid>
                    }

                  </Hidden>


                  <Grid item lg={3} md={3} sm={9} xs={9} className={classes.findProductsContainer} >
                    <a href='/' className={classes.findProducts} >
                      <ArrowBackIcon fontSize="small" style={{ color: '#006fb9' }} />

                      <Typography variant="body2" style={{ color: '#006fb9' }}>
                        Busca más productos
                      </Typography>

                    </a>
                  </Grid>

                </Grid>

              </Grid>

              <Grid item xs={12} >
                {/* Responsive */}
                <Hidden mdUp>
                  {
                    (this.props.checkout !== null && this.props.checkout !== undefined && this.props.checkout.address !== null && this.props.checkout.address !== undefined) ?
                      <Grid item xs={12} className={classes.addressContainer}>
                        <LocationOnOutlinedIcon style={{ color: '#808080' }} />
                        <Typography variant="body2" style={{ color: '#808080' }}>
                          Entregar en:
                        </Typography>
                   &nbsp;
                      <Typography variant="body2" style={{ color: '#006fb9' }}>
                          {this.props.checkout.address.municipality + ', ' + this.props.checkout.address.state}
                        </Typography>
                      </Grid>
                      :
                      <Grid item xs={6} className={classes.addressContainer}>
                        ''
                  </Grid>
                  }

                </Hidden>
              </Grid>

            </Grid>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(CheckoutNavbarNew)
