'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles';
import { Grid, Typography, Hidden, Icon, Tabs, Tab, Drawer, Collapse } from '@material-ui/core'


// Utils
import * as loginAction from '../modules/Login/loginAction'
import Utils from '../resources/Utils';

const { logout: logoutLogin } = loginAction

const useStyles = theme => ({
  navigationContainer: {
    width: '100%',
    padding: 0,
    margin: '0 auto',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  tabText: {
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 'bold',
    textDecoration: 'none',
    '&:hover': {
      fontWeight: 'normal'
    }
  },
  indicator: {
    display: 'none'
  },
})

class NavigationMenuDesign extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tab: false
    }

    this.handleChange = this.handleChange.bind(this)
  }


  handleChange(target, newValue) {
    if (this.props.app.tree[newValue].subNodes.length === 0) {
      let query = ''

      this.props.app.tree[newValue].filter.queryParams.forEach(param => {
        if (Utils.isEmpty(query)) {
          query = '?' + param.key + '=' + param.value
        } else {
          query += '&' + param.key + '=' + param.value
        }
      })

      if (Utils.isExternalLink(this.props.app.tree[newValue].filter.url)) {
        window.location.href = this.props.app.tree[newValue].filter.url
      } else {
        window.location.href = this.props.app.tree[newValue].filter.url + query
      }
    } else if (this.props.app.tree[newValue].key === 'brands') {
      window.location.href = '/marcas'
    } else {
      this.setState({
        tab: newValue
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

    const { classes } = this.props
    return (
      <div 
        onMouseLeave={() => this.setState({tab: false})}>
        <Tabs
          className={classes.navigationContainer}
          classes={{ indicator: classes.indicator }}
          indicatorColor="primary"
          onChange={this.handleChange}
          textColor="primary"
          variant="scrollable"
          value={this.state.tab}
          scrollButtons="on">
          {
            this.props.app.tree.map((item, index) => 
              (Utils.isEmpty(item.image))?
                <Tab 
                  key={index}
                  value={index}
                  disabled={false}
                  disableRipple
                  style={{width: Number(100 / count) + '%', cursor: 'default'}}
                  icon={
                    <Typography 
                      variant='body1' 
                      className={classes.tabText}
                      onClick={() => {window.location.href = this.getLink(index, this.props.app.tree[index], null, true)}}
                      onMouseEnter={() => { if (item.key !== "brands" && item.key !== "all") {this.setState({tab: index})} else {this.setState({tab: false})}}}>
                      {item.description}
                    </Typography>
                  }/>
              :
                (item.key.toLowerCase() === 'offers' || item.key.toLowerCase() === 'bluepoints') ?
                  <Tab 
                    key={index}
                    value={index}
                    disableRipple
                    style={{width: Number(100 / count) + '%', cursor: 'default'}}
                    icon={
                      <img 
                        src={item.image} 
                        style={{height: 22, margin: 8, textAlign: 'center', cursor: 'pointer'}}
                        onMouseEnter={() => this.setState({tab: false})}/>
                    }/>
                :
                  ''
            )
          }
        </Tabs>
        <Collapse
          in={this.state.tab !== false}
          anchor='top'
          onClose={() => this.setState({tab: false})}>
          {
            (this.state.tab !== false)?
              <Grid container justify="center" style={{padding: '24px 0px 16px 0px'}}>
              {
                this.props.app.tree[this.state.tab].subNodes.map((node, idx) => {
                  if (node.count > 0){
                    return(
                      <Grid key={idx} item xs={2} style={{padding: '0px 12px 0px 12px'}}>
                        <Typography 
                          color="primary" 
                          variant="body1" 
                          onClick={() => {window.location.href=this.getLink(this.state.tab, node, null)}}
                          style={{fontSize: 12, lineHeight: '32px', cursor: 'pointer'}}>
                            <strong>{node.description}</strong>
                        </Typography>                           
                        <div style={{width: '100%', height: '1px', backgroundColor: 'gray', opacity: 0.3}}/>
                        {
                          node.subNodes.map((subNode) => {
                            if (subNode.count > 0){
                              return(
                                <Typography 
                                  variant="body1" 
                                  className={classes.tabText} 
                                  onClick={() => {window.location.href=this.getLink(this.state.tab, node, subNode)}}
                                  style={{lineHeight: '32px'}}>
                                  {subNode.description}
                                </Typography>
                              )
                            }
                          })
                        }
                      </Grid>
                    )
                  }
                })
              }
            </Grid>
          :
            ''
          }
        </Collapse>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = { logoutLogin }

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles)(NavigationMenuDesign))
