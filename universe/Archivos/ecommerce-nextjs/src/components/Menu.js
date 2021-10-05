'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import clsx from 'clsx'
import showTracking from './modals/TrackingOrder'


import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Collapse from '@material-ui/core/Collapse'
import ListItemText from '@material-ui/core/ListItemText'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

// Material UI
import { withStyles } from '@material-ui/core/styles';
import { Icon } from '@material-ui/core'

// Utils
import Utils from '../resources/Utils'

const useStyles = theme => ({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  itemSocialList: {
    marginRight: 6, float: 'left', background: '#243B7A', width: 32, height: 32, padding: 6, paddingTop: 5, borderRadius: '50%',
    [theme.breakpoints.down('xs')]: {
      marginRight: 6,
      width: 32, height: 32, padding: 8, paddingTop: 7
    }
  }
})

class Menu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      menu: []
    }
    this.list = this.list.bind(this)
    this.collapseListMenu = this.collapseListMenu.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)
  }

  componentDidMount() {
    let menu = this.props.app.tree
    menu.forEach((item, idx) => {
      menu[idx].collapse = false
    })
    this.setState({menu: menu})
  }

  toggleDrawer(event, anchor, open) {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    this.setState({ ...this.state, [anchor]: open })
  }

  collapseListMenu(idx) {
    let menu = this.state.menu
    menu[idx].collapse = !menu[idx].collapse
    this.setState({menu: menu})
  }

  list(anchor, showModal) {
    const self = this
    const { classes } = this.props

    return (
      <div
        className={clsx(classes.list, {
          [classes.fullList]: anchor === 'top' || anchor === 'bottom',
        })}
        role="presentation"
      >
        {
          (this.state.menu.length > 0) ?
          <List>
            {
              this.state.menu.map((item, index) => (
                (item.subNodes.length > 0 || item.key.toLowerCase() === 'all' || item.key.toLowerCase() === 'offers' || item.key.toLowerCase() === 'bluepoints') ?
                <div key={index}>
                <ListItem button onClick={(event) => { 
                  if (item.subNodes.length > 0 && item.url !== undefined) {
                    self.collapseListMenu(index)
                  } else {
                    if (item.key === 'brands') {
                      window.location.href = '/marcas'
                    } else {
                      window.location.href = item.filter.url + '?' + item.filter.queryParams[0].key + '=' + item.filter.queryParams[0].value
                    }
                  }
                 }}>
                  {
                    (!Utils.isEmpty(item.image)) ?
                    <img style={{ height: 24 }} src={item.image} />
                    :
                    <ListItemText primary={item.description} />
                  }
                  {
                    (item.subNodes.length > 0 && item.url !== undefined) ?
                    (item.collapse) ? <ExpandLess /> : <ExpandMore />
                    :
                    ''
                  }
                </ListItem>
                {
                  item.subNodes.map((subitem, jdx) => {
                    return (
                      (subitem.count > 0) ?
                      <Collapse key={jdx} in={self.state.menu[index].collapse} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          <ListItem button onClick={ () => { window.location.href = '/' + Utils.generateURL(item.description) + '/' + Utils.generateURL(subitem.description) }}>
                            <div style={{ marginRight: 16, width: 32, height: 32, borderRadius: '100%', paddingRight: 16, marginTop: 0, backgroundColor: 'white', border: '1px solid rgba(149, 176, 188, 0.5);' }}>
                              <img style={{ width: 32, height: 32, objectFit: 'cover', objectPosition: '50%', borderRadius: '100%' }} src={Utils.constants.HOST_CDN_AWS + '/thumbs/' + subitem.image} />
                            </div>
                            <ListItemText classes={{primary:classes.textSubItemMenu}} primary={subitem.description} />
                          </ListItem>
                        </List>
                      </Collapse>
                      :
                      ''
                    )
                  })
                }
                </div>
                :
                ''
              ))
            }
          </List>
          :
          ''
        }
        <Divider />
        <List>
          {[{icon: 'support', title: 'Atención a clientes', link: '/soporte'}, {icon: 'search', title: 'Rastrear pedido', link: '/rastrear'}, {icon: 'storefront', title: 'Tiendas', link: '/tiendas'}, {icon: 'payment', title: 'Solicitar Crédito', link: '/solicitud-credivale'}].map((item, index) => (
            (item.link === '/rastrear')?
              <ListItem button key={index} onClick={(showModal)}>
                <ListItemIcon>
                  <Icon>{item.icon}</Icon>
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItem>
            :
              <ListItem button key={index} onClick={() => {window.location.href = Utils.generateURL(item.link)}}>
                <ListItemIcon>
                  <Icon>{item.icon}</Icon>
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItem>
          ))}
        </List>
        <Divider />
        <ul style={{ paddingRight: 0, paddingLeft: 12, float: 'left', marginTop: 12, listStyle: 'none' }}>
          <li className={ classes.itemSocialList }>
            <a href={"http://bit.ly/calzzapatoinstagram"}>
              <img style={{ width: '100%', padding: 0, margin: 0 }} alt={ "Instagram de " + this.props.app.data.alias } src={ '../../instagram.svg' }/>
            </a>
          </li>
          <li className={ classes.itemSocialList }>
            <a href="http://bit.ly/calzzapatofacebook">
              <img style={{ width: '100%', padding: 0, margin: 0 }} alt={ "Facebook de " + this.props.app.data.alias } src={ '../../facebook.svg' }/>
            </a>
          </li>
          <li className={ classes.itemSocialList }>
            <a href="https://api.whatsapp.com/send?phone=526677515229&text=Hola,%20me%20gustaria%20hablar%20con%20un%20asesor%20de%20Calzzapato">
              <img style={{ width: '100%', padding: 0, margin: 0 }} alt={ "WhatsApp de " + this.props.app.data.alias } src={ '../../whatsapp.svg' }/>
            </a>
          </li>
          <li className={ classes.itemSocialList } style={{ marginRight: 0 }}>
            <a href="http://bit.ly/calzzapatoyoutube">
              <img style={{ width: '100%', padding: 0, margin: 0 }} alt={ "YouTube de " + this.props.app.data.alias } src={ '../../youtube.svg' }/>
            </a>
          </li>
        </ul>
      </div>
    )
  }

  render() {
    const self = this
    const { classes } = this.props

    const showModal = () => {
        showTracking(classes)
    }

    return (
      <div>
        <Button style={{ float: 'left', minWidth: 10, width: 50 }} onClick={(event) => { this.toggleDrawer(event, 'left', true) }}><Icon>dehaze</Icon></Button>
        <Drawer anchor={'left'} open={this.state['left']} onClose={(event) => { this.toggleDrawer(event, 'left', false) }}>
          {this.list('left', showModal)}
        </Drawer>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default connect(mapStateToProps, null)(withStyles(useStyles)(Menu))