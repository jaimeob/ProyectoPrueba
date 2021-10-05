import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'


// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, AppBar, Toolbar, Typography, Hidden } from '@material-ui/core'
import Icon from '@material-ui/core/Icon'
import Router from 'next/router'
import Link from 'next/link'

import ClearIcon from '@material-ui/icons/Clear';

// Components
import Headband from './Headband'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({
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
    padding: '20px',
    margin: 0,
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

class CheckoutNavbar extends Component {
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
      {
        (headband !== null) ?
        <Headband
          responsiveImage={headband.responsiveImage}
          image={headband.image}
          show={headband.show}
          message={headband.message}
          link={headband.link}
          textColor={headband.textColor}
          backgroundColor={headband.backgroundColor}
        />
        :
        ''
      }
      <AppBar position="absolute" className={classes.appBar} style={{top: topNavbar}}>
        <Toolbar style={{padding: 0, margin: 0, minHeight: 'auto'}}>
          <Grid container justify="flex-start" alignItems="center">
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.navbarTextItem}>
              <Link href="/" style={{float: 'left', marginTop: 6, marginRight: 16}}>
                <Icon>close</Icon>
              </Link>
              <Hidden xsDown>
                <ClearIcon onClick={() => this.setState({ expanded: false })} />
                <Link href="/">
                  <img style={{cursor:'pointer'}} className={classes.logo} alt="" src={this.props.navbarLogo} />
                </Link>
              </Hidden>
              <Typography className={classes.mainTitle} variant="h4" color="primary">
                Checkout.
              </Typography>
              <Link href="/" style={{float: 'left', marginTop: 6, marginRight: 16}}>
                <Icon>close</Icon>
              </Link>
              
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
)(CheckoutNavbar)
