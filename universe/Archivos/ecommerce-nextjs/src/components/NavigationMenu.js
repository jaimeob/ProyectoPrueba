'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles';
import { Grid, Typography, Hidden, Icon } from '@material-ui/core'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

// Utils
import Utils from '../resources/Utils'
import * as loginAction from '../modules/Login/loginAction'

const { logout: logoutLogin } = loginAction

const useStyles = theme => ({
  navigationContainer: {
    padding: 0,
    margin: '0 auto',
    textAlign: 'center',
    backgroundColor: '#f9fcfc',
  },
  tab: {
    textTransform: 'none',
    margin: 0,
    padding: 0,
    [theme.breakpoints.down('sm')]: {
      width: 'auto',
      marginRight: 16,
      marginLeft: 16
    }
  },
  tabText: {
    color: 'rgb(0, 0, 0, 0.54)',
    fontSize: 16,
  },
  indicator: {
    height: 4,
    borderRadius: '4px 4px 0px 0px'
  },
  menuContainer: {
    position: 'fixed',
    top: 0,
    margin: 0,
    padding: 0,
    paddingBottom: 24,
    backgroundColor: 'white',
    zIndex: 1000,
    visibility: 'hidden',
    overflowY: 'scroll',
    height: 'auto',
    border: '2px solid #C0C7D6',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
      margin: 0,
      padding: 0,
      paddingBottom: 32
    }
  },
  departamentalMenuContainer: {
    position: 'absolute',
    width: '25%',
    margin: 0,
    padding: 0,
    backgroundColor: 'white',
    zIndex: 1000,
    visibility: 'hidden',
    overflowY: 'scroll',
    height: 10000,
    border: '2px solid #C0C7D6',
    marginTop: 1,
    [theme.breakpoints.down('md')]: {
      width: '50%'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      margin: 0,
      padding: 0,
      paddingBottom: 32
    }
  },
  titleMenuList: {
    padding: 24,
    paddingTop: 6,
    paddingBottom: 6,
    margin: 0,
    fontSize: 15,
    fontWeight: 400,
    paddingLeft: 20,
    color: 'rgba(0, 0, 0, 0.87)'
  },
  menuList: {
    listStyle: 'none',
    margin: 0,
    padding: 24,
    paddingTop: 8,
    paddingBottom: 8
  },
  menuItem: {
    marginTop: 8,
    marginBottom: 8,
    [theme.breakpoints.down('xs')]: {
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 8,
      paddingBottom: 8,
    }
  },
  menuLink: {
    fontSize: 12,
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  icon: {
    padding: '0px 8px 0px 8px',
    height: 28,
    [theme.breakpoints.down('md')]: {
      height: 28
    }
  },
  brandLogo: {
    height: '22px',
    margin: '8px',
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {

    }
  },
  scrollBar: {
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px'
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      'border-radius': '4px',
      'background-color': 'rgba(0,0,0,.5)',
      '-webkit-box-shadow': '0 0 1px hsla(0,0%,100%,.5)'
    }
  }
})

class Navigation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tab: false,
      disabled: true,
      menu: [],
      selectedNode: null
    }

    this.handleChange = this.handleChange.bind(this)
    this.getLink = this.getLink.bind(this)
    this.showSubcategories = this.showSubcategories.bind(this)
    this.getSubcategoriesByNode = this.getSubcategoriesByNode.bind(this)

    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.getText = this.getText.bind(this)
  }

  getText(string) {
    return string
  }

  showSubcategories(category, tab) {
    const self = this
    let goTo = true

    if (category.subNodes.length > 0) {
      goTo = false
    }

    if (goTo) {
      window.location.href = self.getLink(self.state.tab, category, null)
    } else {
      this.setState({
        tab: tab,
        selectedNode: category
      })
      Utils.scrollTop()
    }
  }

  getSubcategoriesByNode(node) {
    return node.subNodes
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  setWrapperRef(node) {
    this.wrapperRef = node
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({
        tab: false,
        selectedNode: null
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.setState({ tab: false })
    }
  }

  handleChange(target, newValue) {
    const self = this

    if (self.props.app.tree[newValue].subNodes.length === 0) {
      let query = ''
      self.props.app.tree[newValue].filter.queryParams.forEach(param => {
        if (Utils.isEmpty(query)) {
          query = '?' + param.key + '=' + param.value
        } else {
          query += '&' + param.key + '=' + param.value
        }
      })

      if (Utils.isExternalLink(self.props.app.tree[newValue].filter.url)) {
        window.location.href = self.props.app.tree[newValue].filter.url
      } else {
        window.location.href = self.props.app.tree[newValue].filter.url + query
      }
    } else if (self.props.app.tree[newValue].key === 'brands') {
      window.location.href = '/marcas'
    } else {
      this.setState({
        tab: newValue,
        selectedNode: null
      })
    }
  }

  getLink(idx, item, subItem, father = false) {
    let url = ''

    if (subItem !== null) {
      url = item.url + '/' + subItem.url
    } else {
      url = item.url
    }

    if (father) {
      url = '/' + url
    } else {
      url = '/' + this.props.app.tree[this.state.tab].url + '/' + url
    }

    return url
  }

  render() {
    const self = this
    const { classes } = this.props
    
    let count = 0

    this.props.app.tree.map((item) => {
      if (Utils.isEmpty(item.image)) {
        count ++
      } else {
        if (item.key.toLowerCase() === 'offers' || item.key.toLowerCase() === 'bluepoints') {
          count ++
        }
      }
    })

    return (
      <div ref={this.setWrapperRef}>
        <Hidden mdUp>
          <Tabs
            aria-label="scrollable force tabs example"
            className={classes.navigationContainer}
            classes={{ indicator: classes.indicator }}
            color="default"
            indicatorColor="primary"
            onChange={this.handleChange}
            scrollButtons="on"
            textColor="primary"
            value={this.state.tab}
            variant="scrollable">
            {
              this.props.app.tree.map((item, i) =>
                (Utils.isEmpty(item.image)) ?
                  <Tab value={i} className={classes.tab} style={{ width: Number(100 / count) + '%' }} disabled={false} key={i} icon={<Typography className={classes.tabText}><strong>{item.description}</strong></Typography>} />
                  :
                  <Tab key={i} value={i} className={classes.tab} style={{ width: Number(100 / count) + '%' }} icon={<img src={item.image} alt={item.description} className={classes.brandLogo} />} />
              )
            }
          </Tabs>
        </Hidden>
        <Hidden smDown>
          <Tabs
            aria-label="scrollable force tabs example"
            classes={{ indicator: classes.indicator }}
            className={classes.navigationContainer}
            color="default"
            indicatorColor="primary"
            onChange={this.handleChange}
            scrollButtons="on"
            textColor="primary"
            value={this.state.tab}
            variant="scrollable">
            {
              this.props.app.tree.map((item, i) =>
                (Utils.isEmpty(item.image)) ?
                  <Tab key={i} value={i} className={classes.tab} style={{ width: Number(100 / count) + '%' }} disabled={false} key={i} icon={<Typography className={classes.tabText}><strong>{item.description}</strong></Typography>} />
                  :
                  (item.key.toLowerCase() === 'offers' || item.key.toLowerCase() === 'bluepoints') ?
                    <Tab value={i} className={classes.tab} style={{ width: Number(100 / count) + '%' }} icon={<img src={item.image} alt={item.description} className={classes.brandLogo} />} />
                    :
                    ''
              )
            }
          </Tabs>
        </Hidden>
        {
          (this.state.tab !== false) ?
            <div className={`${classes.departamentalMenuContainer} ${classes.scrollBar}`} style={{ visibility: (this.state.tab !== false) ? 'visible' : 'hidden' }}>
              <Grid container>
                {
                  (this.state.selectedNode === null) ?
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <a href={self.getLink(self.state.tab, this.props.app.tree[this.state.tab], null, true)}>
                        <Typography className={classes.titleMenuList} style={{ marginTop: 8, fontSize: 20, fontWeight: 600 }} variant="h2">{this.props.app.tree[this.state.tab].description}</Typography>
                        <Typography className={classes.titleMenuList} variant="body1"><a style={{ color: 'black', fontSize: 16, textDecoration: 'underline' }} href={self.getLink(self.state.tab, this.props.app.tree[this.state.tab], null, true)}>Ver todo (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(this.props.app.tree[this.state.tab].count)}</strong>) <img style={{ marginBottom: -8 }} src={'/icon-arrow.svg'} /></a></Typography>
                      </a>
                    </Grid>
                    :
                    ''
                }
                {
                  this.props.app.tree[this.state.tab].subNodes.map((node, idx) => {
                    if (node.count > 0 && this.state.selectedNode === null) {
                      return (
                        <Grid key={idx} item xl={12} lg={12} md={12} sm={12} xs={12} onClick={() => { self.showSubcategories(node, this.state.tab) }} style={(idx === 0) ? { cursor: 'pointer', marginTop: 8 } : { cursor: 'pointer' }}>
                          <Grid container style={{ paddingLeft: 8, paddingRight: 8 }}>
                            <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
                              <div style={{ width: 38, height: 38, borderRadius: '100%', paddingRight: 16, marginTop: 0, backgroundColor: 'white', border: '1px solid rgba(149, 176, 188, 0.5);' }}>
                                <img style={{ width: 38, height: 38, objectFit: 'cover', objectPosition: '50%', borderRadius: '100%' }} src={Utils.constants.HOST_CDN_AWS + '/thumbs/' + node.image} />
                              </div>
                            </Grid>
                            <Grid item xl={10} lg={10} md={10} sm={10} xs={10}>
                              <Typography className={classes.titleMenuList} variant="h4" style={(this.state.tab !== false && node === this.state.selectedNode) ? { marginTop: 6, fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' } : { marginTop: 6, fontWeight: 500, cursor: 'pointer' }} >{this.getText(node.description)} (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(node.count)}</strong>)</Typography>
                            </Grid>
                            <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
                              <Icon style={{ marginTop: 8, color: 'gray', opacity: 0.8 }}>keyboard_arrow_right</Icon>
                            </Grid>
                          </Grid>
                          <hr style={{ opacity: 0.5 }} />
                        </Grid>
                      )
                    }
                  })
                }
                {
                  (this.state.selectedNode !== null) ?
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Grid container>
                        <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
                          <strong style={{ marginLeft: 8, paddingLeft: 8, cursor: 'pointer' }} onClick={() => { this.setState({ selectedNode: null }) }}>
                            <Icon style={{ marginTop: 16, color: 'gray' }}>keyboard_arrow_left</Icon>
                          </strong>
                        </Grid>
                        <Grid item xl={10} lg={10} md={10} sm={10} xs={10}>
                          <a href={self.getLink(self.state.tab, this.state.selectedNode, null)}>
                            <Typography className={classes.titleMenuList} style={{ marginTop: 8, fontSize: 20, fontWeight: 600 }} variant="h2">{this.getText(this.state.selectedNode.description)}</Typography>
                            <Typography className={classes.titleMenuList} variant="body1"><a style={{ color: 'black', fontSize: 16, textDecoration: 'underline' }} href={self.getLink(self.state.tab, this.state.selectedNode, null)}>Ver todo (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(this.state.selectedNode.count)}</strong>) <img style={{ marginBottom: -8 }} src={'/icon-arrow.svg'} /></a></Typography>
                          </a>
                        </Grid>
                      </Grid>
                    </Grid>
                    :
                    ''
                }
                {
                  (this.state.selectedNode !== null) ?
                    this.getSubcategoriesByNode(this.state.selectedNode).map((subNode, idx) => {
                      if (subNode.count) {
                        return (
                          <Grid key={idx} item xl={12} lg={12} md={12} sm={12} xs={12} style={(idx === 0) ? { cursor: 'pointer', marginTop: 8 } : { cursor: 'pointer' }}>
                            <a href={self.getLink(self.state.tab, this.state.selectedNode, subNode)}>
                              <Grid container style={{ paddingLeft: 8, paddingRight: 8 }}>
                                <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
                                  <div style={{ width: 50, height: 50, borderRadius: '100%', paddingRight: 16, marginTop: 0, backgroundColor: 'white', border: '1px solid rgba(149, 176, 188, 0.5);' }}>
                                    <img style={{ width: 50, height: 50, objectFit: 'cover', objectPosition: '50%', borderRadius: '100%' }} src={Utils.constants.HOST_CDN_AWS + '/thumbs/' + subNode.image} />
                                  </div>
                                </Grid>
                                <Grid item xl={10} lg={10} md={10} sm={10} xs={10} style={{ paddingLeft: 16 }}>
                                  <Typography className={classes.titleMenuList} variant="h4" style={(this.state.tab !== false && subNode === this.state.selectedNode) ? { marginTop: 11, fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' } : { marginTop: 11, fontWeight: 500, cursor: 'pointer' }} >{this.getText(subNode.description)} (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(subNode.count)}</strong>)</Typography>
                                </Grid>
                                <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
                                  <Icon style={{ marginTop: 16, color: 'gray' }}>keyboard_arrow_right</Icon>
                                </Grid>
                              </Grid>
                            </a>
                            <hr style={{ opacity: 0.5 }} />
                          </Grid>
                        )
                      }
                    })
                    :
                    ''
                }
              </Grid>
            </div>
            :
            <div>
              {
                (this.state.tab !== false) ?
                  <Grid container className={`${classes.menuContainer} ${classes.scrollBar}`} style={{ visibility: (this.state.tab !== false) ? 'visible' : 'hidden' }}>
                    {
                      this.props.app.tree[this.state.tab].subNodes.map((node, idx) => {
                        if (node.count) {
                          return (
                            <Grid key={idx} item xl={3} lg={3} md={3} sm={6} xs={12}>
                              <a href={self.getLink(self.state.tab, node, null)}>
                                <Typography className={classes.titleMenuList} style={{ fontSize: 24 }} variant="body1" >{this.getText(node.description)}</Typography>
                                <Typography variant="body2" className={classes.titleMenuList} style={{ marginTop: 0, paddingTop: 0 }}>Encuentra hasta <strong style={{ color: 'red' }}>{Utils.numberWithCommas(node.count)}</strong> productos. <strong style={{ textDecoration: 'underline' }}>Explorar</strong></Typography>
                              </a>
                              <ul className={classes.menuList}>
                                {
                                  node.subNodes.map((subNode) => {
                                    if (subNode.count) {
                                      return (
                                        <li className={classes.menuItem} style={{ margin: 0, paddingTop: 0, paddingBottom: 16 }}>
                                          <a href={self.getLink(self.state.tab, node, subNode)}>
                                            <Grid container>
                                              <Grid item xl={2} lg={2} md={2} sm={2} xs={2}>
                                                <div style={{ width: 55, height: 55, borderRadius: '100%', marginTop: 0, backgroundColor: 'white', border: '1px solid rgba(149, 176, 188, 0.5);' }}>
                                                  <img style={{ width: 55, height: 55, objectFit: 'cover', objectPosition: '50%', borderRadius: '100%' }} src={Utils.constants.HOST_CDN_AWS + '/thumbs/' + subNode.image} />
                                                </div>
                                              </Grid>
                                              <Grid item xl={10} lg={10} md={10} sm={10} xs={10}>
                                                <Typography variant="body1" className={classes.menuLink} style={{ fontSize: 14, fontWeight: 600, marginLeft: 8, marginTop: 14 }} >{this.getText(subNode.description)} (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(subNode.count)}</strong>)</Typography>
                                              </Grid>
                                            </Grid>
                                          </a>
                                        </li>
                                      )
                                    }
                                  })
                                }
                              </ul>
                            </Grid>
                          )
                        }
                      })
                    }
                    <Grid item xl={3} lg={3} md={3} sm={6} xs={12}>
                      <a href={self.getLink(self.state.tab, this.props.app.tree[this.state.tab], null, true)}>
                        <Typography variant="body1" className={classes.titleMenuList} style={{ fontSize: 24 }}>Todo para {this.props.app.tree[this.state.tab].description.toLowerCase()}</Typography>
                        <Typography variant="body2" className={classes.titleMenuList}>Más de <strong style={{ color: 'red' }}>{Utils.numberWithCommas(this.props.app.tree[this.state.tab].count)}</strong> productos te esperan.</Typography>
                        <Typography variant="h2" className={classes.titleMenuList} style={{ fontSize: 14, textDecoration: 'underline' }}>Explorar</Typography>
                      </a>
                    </Grid>
                  </Grid>
                  :
                  ''
              }
            </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = { logoutLogin }

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles)(Navigation))
