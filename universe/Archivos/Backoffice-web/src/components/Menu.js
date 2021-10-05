import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Collapse from '@material-ui/core/Collapse'
import Hidden from '@material-ui/core/Hidden'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Icon from '@material-ui/core/Icon'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

// Utils
import Utils from '../resources/Utils'

const drawerWidth = 220

const styles = theme => ({
  drawerPaper: {
    position: 'fixed',
    width: drawerWidth,
    top: 66,
    [theme.breakpoints.down('sm')]: {
      width: 56,
    },
    [theme.breakpoints.down('xs')]: {
      top: 54,
      width: 56,
    },
  },
  textItemMenu: {
    marginLeft: -8,
    fontWeight: 800,
    fontSize: 14
  },
  textSubItemMenu: {
    fontWeight: 400,
    fontSize: 14
  },
  nested: {
    paddingLeft: 48
  }
})

class Menu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      login: false,
      menu: []
    }

    this.goTo = this.goTo.bind(this)
    this.logout = this.logout.bind(this)
    this.collapseListMenu = this.collapseListMenu.bind(this)
  }

  async componentWillMount() {
    if (Utils.isUserLoggedIn()) {
      let pathname = this.props.history.location.pathname
      let menu = await Utils.getModules()
      if (menu !== undefined){
        menu = menu.menu
        
        if (menu !== undefined && menu !== null){
          menu.forEach(function(module, idx) {
            if (module.path === pathname) {
              Utils.setSelectedModuleId(module.id)
              menu[idx].selected = true
            }
            else {
              menu[idx].selected = false
            }
            menu[idx].collapse = false
          })
          
          this.setState({
            menu: menu
          }) 
        }
      }
    }
  }

  goTo(index, path) {
    let menu = []
    this.state.menu.forEach(function(module, idx) {
      module.selected = false
      if (index === idx) {
        module.selected = true
      }
      menu.push(module)
    })
    this.props.history.push(path)
  }

  logout() {
    localStorage.removeItem(Utils.constants.localStorage.USER)
    localStorage.removeItem(Utils.constants.localStorage.MODULES)
    localStorage.removeItem(Utils.constants.localStorage.MENU)
    this.props.history.push('/')
  }

  collapseListMenu(idx) {
    let menu = this.state.menu
    menu[idx].collapse = !menu[idx].collapse
    this.setState({menu: menu})
  }

  render() {
    let self = this
    const { classes } = this.props

    return (
      <Drawer
        variant="persistent"
        open={true}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
      {
        (Utils.isUserLoggedIn()) ?
        <div>
          <List>
          {
            this.state.menu.map(function(module, idx) {
              if (module.nesting === 1) {
                return (
                <div>
                  <ListItem button onClick={(event) => { self.collapseListMenu(idx) }}>
                    <ListItemIcon>
                      <Icon>{module.icon}</Icon>
                    </ListItemIcon>
                    <ListItemText classes={{primary:classes.textItemMenu}} primary={module.name} />
                    {self.state.menu[idx].collapse ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  {
                    self.state.menu.map(function(submodule, jdx) {
                      return (
                        (submodule.nesting === 2 && submodule.moduleGroup === module.id) ?
                        <Collapse in={self.state.menu[idx].collapse} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            <ListItem button className={classes.nested} key={jdx} selected={submodule.selected} button onClick={ () => { self.goTo(jdx, submodule.path) }}>
                              <ListItemText classes={{primary:classes.textSubItemMenu}} primary={submodule.name} />
                            </ListItem>
                          </List>
                        </Collapse>
                        :
                        ''
                      )
                    })
                  }
                </div>
                )
              }
              else if (module.nesting === 0) {
                return (
                  <ListItem key={idx} selected={module.selected} button onClick={ () => { self.goTo(idx, module.path) } }>
                    <ListItemIcon>
                      <Icon>{module.icon}</Icon>
                    </ListItemIcon>
                    <Hidden smDown>
                      <ListItemText classes={{primary:classes.textItemMenu}} primary={module.name} />
                    </Hidden>
                  </ListItem>
                )
              }
            })
          }
          <ListItem onClick={this.logout} button>
            <ListItemIcon>
              <Icon>exit_to_app</Icon>
            </ListItemIcon>
            <Hidden smDown>
              <ListItemText classes={{primary:classes.textItemMenu}} primary={Utils.messages.Menu.logout} />
            </Hidden>
          </ListItem>
          </List>
          <Divider />
        </div>
        :
        ''
      }
      </Drawer>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(Menu)
