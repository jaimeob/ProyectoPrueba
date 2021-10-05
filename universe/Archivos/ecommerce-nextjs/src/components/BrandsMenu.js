'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles';
import { Grid, Hidden, Icon, Tabs, Tab } from '@material-ui/core'

// Utils
import Utils from '../resources/Utils'

const useStyles = theme => ({
  navigationContainer: {
    padding: 0,
    margin: 0,
    height: 'auto',
    background: theme.palette.topBar.main,
    width: '100%',
    maxWidth: '100%',
    minWidth: '100%',
    minHeight: 38,
    height: 38,
    maxHeight: 38
  },
  tab: {
    margin: 0,
    padding: 0,
    minWidth: 10,
    minHeight: 38,
    height: 38,
    maxHeight: 38,
    [theme.breakpoints.down('sm')]: {
      minWidth: 'auto',
      minHeight: 40
    }
  },
  brandLogoUp: {
    height: '20px',
    width: 'auto',
    margin: '0 16px',
    textAlign: 'center',
    opacity: 1.0,
    '&:hover': {
      opacity: 0.5
    },
    [theme.breakpoints.down('md')]: {
      height: '15px',
      margin: '0 6px'
    },
    [theme.breakpoints.down('sm')]: {
      height: 18,
      width: 'auto',
      margin: '0px 6px',
    }
  },
  containerLinks: {
    margin: 0,
    height: 38,
    background: theme.palette.topBar.main,
    [theme.breakpoints.down('sm')]: {
      height: 34, 
      textAlign: 'center'
    },
    [theme.breakpoints.down('sm')]: {
      height: 0
    }
  },
  listLinks: {
    float: 'right', listStyle: 'none', marginTop: 6,
    padding: 0,
    margin: 0,
    [theme.breakpoints.down('sm')]: {
      marginTop: 0,
      float: 'none'
    }
  },
  itemLinkList: {
    float: 'left', marginRight: 12,
    [theme.breakpoints.down('md')]: {
      marginRight: 8
    },
    [theme.breakpoints.down('sm')]: {
      float: 'none',
      display: 'inline-block'
    },
    [theme.breakpoints.down('xs')]: {
      padding: 0,
      margin: 0
    }
  },
  textItemIconLink: {
    fontSize: 20,
    color: theme.palette.topBar.text,
    marginRight: 4, marginLeft: 10, marginBottom: -5,
    [theme.breakpoints.down('xs')]: {
      marginBottom: -2,
      fontSize: 14
    }
  },
  textItemIcon: {
    fontSize: 14,
    color: theme.palette.topBar.text,
    [theme.breakpoints.down('xs')]: {
      fontSize: 13
    }
  }
})

class BrandsMenu extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(target, newValue) {
    window.location.href = this.props.app.tree[newValue].filter.url
  }

  render() {
    const { classes } = this.props
    return (
      <Grid container>
        <Grid item md={5} xs={12}>
          <Tabs
            variant="scrollable"
            scrollButtons="off"
            className={classes.navigationContainer}
            onChange={this.handleChange}
            disabled={false}>
          {
            this.props.app.tree.map((item, i) =>
            {
              let imageType = 'white'
              return (
                (item.key !== undefined && !Utils.isEmpty(item.image) && item.key.toLowerCase() !== 'offers' && item.key.toLowerCase() !== 'bluepoints') ?
                <Tab key={i} value={i} disabled={false} className={classes.tab} style={{ opacity: 1.0 }} icon={<img alt={item.description} src={'/' + item.key.toLowerCase() + '' + imageType + '.svg'} className={classes.brandLogoUp} />} />
                :
                null
              )
            }
          )
          }
          </Tabs>
        </Grid>
        <Grid item md={7} xs={12} className={classes.containerLinks}>
          <Hidden smDown lgUp>
            <ul className={classes.listLinks}>
              <li className={classes.itemLinkList}><Icon className={ classes.textItemIconLink }>support</Icon><a className={classes.textItemIcon} href="/soporte">Atención a clientes</a></li>
              <li className={classes.itemLinkList}><Icon className={ classes.textItemIconLink }>navigation</Icon><a className={classes.textItemIcon} href="/mi-cuenta/mis-pedidos">Localizar pedido</a></li>
              <li className={classes.itemLinkList}><Icon className={ classes.textItemIconLink }>storefront</Icon><a className={classes.textItemIcon} href="/tiendas">Tiendas</a></li>
              <li className={classes.itemLinkList}><Icon className={ classes.textItemIconLink }>payment</Icon><a className={classes.textItemIcon} href="/solicitud-credivale">Crédito</a></li>
            </ul>
          </Hidden>
          <Hidden mdDown>
            <ul className={classes.listLinks}>
              <li className={classes.itemLinkList}><Icon className={ classes.textItemIconLink }>support</Icon><a className={classes.textItemIcon} href="/soporte">Atención a clientes 24/7</a></li>
              <li className={classes.itemLinkList}><Icon className={ classes.textItemIconLink }>navigation</Icon><a className={classes.textItemIcon} href="/mi-cuenta/mis-pedidos">Localizar pedido</a></li>
              <li className={classes.itemLinkList}><Icon className={ classes.textItemIconLink }>storefront</Icon><a className={classes.textItemIcon} href="/tiendas">Tiendas</a></li>
              <li className={classes.itemLinkList}><Icon className={ classes.textItemIconLink }>payment</Icon><a className={classes.textItemIcon} href="/solicitud-credivale">Crédito CrediVale ®</a></li>
            </ul>
          </Hidden>
        </Grid>
      </Grid>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default connect(mapStateToProps, null)(withStyles(useStyles)(BrandsMenu))