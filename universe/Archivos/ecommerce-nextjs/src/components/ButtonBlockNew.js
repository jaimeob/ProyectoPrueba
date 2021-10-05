import React, { Component } from 'react'
import compose from 'recompose/compose'
import Link from 'next/link'
import Router from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Hidden, GridList } from '@material-ui/core'


// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Empty from './Empty'

const styles = theme => ({
  imageContainter: {
    background: 'white',
    height: '100px',
    width: '100px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    //boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.19)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    borderRadius: '50%'
  },
  blockTitle: {
    marginBottom: 8,
    width: '100%',
    textAlign: 'center',
    fontSize: 20
  },
  blockDescription: {
    width: '100%',
    textAlign: 'center',
    fontSize: 22
  },
  item: {
    marginTop: '16px',
    marginBottom: 16,
    padding: 32
  },
  image: {
    width: '100%',
    'object-fit': 'contain'
  },
  /*
  itemTitle: {
    textAlign: 'right',
    paddingTop: 24,
    paddingRight: 12,
    fontWeight: 600,
    fontSize: 14,
    color: '#95B0BC',
    [theme.breakpoints.down('sm')]: {
      paddingTop: 28,
      fontSize: 12
    }
  },
  */
  itemTitle: {
    textAlign: 'center',
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 8,
    lineHeight: 1.2
  },
  /*
  itemMinTitle: {
    textAlign: 'right',
    paddingTop: 15,
    paddingRight: 12,
    fontWeight: 600,
    color: '#95B0BC',
    fontSize: 14,
    fontHeight: 1.0,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 24,
      fontSize: 11
    }
  }
  */
  scrollBar: {
    padding: '0 16px',
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
    height: '170px',
    overflowY: 'hidden',
    [theme.breakpoints.down("md")]: {
      height: '190px',

    },
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

class ButtonBlock extends Component {
  constructor(props) {
    super(props)
    this.getLink = this.getLink.bind(this)
    this.state = {
      loading: true,
      buttons: []
    }
  }

  async componentWillMount() {
    let responseButtons = null
    if (this.props.category === null) {
      responseButtons = await requestAPI({
        method: 'GET',
        host: Utils.constants.CONFIG_ENV.HOST,
        resource: 'menu',
        endpoint: '/buttons'
      })
    } else {
      responseButtons = await requestAPI({
        method: 'GET',
        host: Utils.constants.CONFIG_ENV.HOST,
        resource: 'categories',
        endpoint: '/' + this.props.category + '/menu'
      })
    }

    if (responseButtons.data !== undefined) {
      await Utils.asyncForEach(responseButtons.data, async (data, idx) => {
        responseButtons.data[idx].vertical = await Utils.isVertical(data.image)
      })
      this.setState({
        loading: false,
        buttons: responseButtons.data
      })
    } else {
      this.setState({
        loading: false
      })
    }
  }

  getLink(subcategory) {
    let url = ''
    if (Router.query !== undefined && Router.query.category !== undefined && Router.query.category.length !== undefined) {
      Router.query.category.forEach(breadcrumb => {
        if (breadcrumb !== 'todos') {
          url += '/' + Utils.generateURL(breadcrumb)
        }
      })
      url += '/' + Utils.generateURL(subcategory.description)
    } else {
      url = '/' + Utils.generateURL(subcategory.description)
    }
    return url.toLowerCase()
  }

  render() {
    const self = this
    const { classes } = this.props

    return (
      <>
      {
        (!this.state.loading && this.state.buttons.length > 0) ?
        <>
        <Hidden mdDown>
          <GridList className={classes.scrollBar} cols={2.5}>
            {
              (this.state.buttons.length > 0) ?
                this.state.buttons.map((subcategory, idx) => {
                  if (subcategory.products > 0) {
                    return (
                      <Grid key={idx} item xs={12} style={{ cursor: 'pointer', marginRight: 25 }}>
                        <a href={self.getLink(subcategory)} style={{display:'flex', justifyContent: 'center'}}  >
                          <div style={{ display:'flex', justifyContent: 'center'}} >
                            <div className={classes.imageContainter} >
                              <img style={ (subcategory.vertical) ? { height: 80, width: 'auto' } : { height: 'auto', width: 80 } } src={Utils.constants.HOST_CDN_AWS + '/normal/' + subcategory.image} alt="" />
                            </div>
                          </div>

                        </a>
                        <Typography variant="body1" className={classes.itemTitle}>{subcategory.description}</Typography>
                        {/* <Typography variant="body1" style={{ textAlign: 'center', fontSize: 12, lineHeight: 1.0, paddingBottom: 16, fontWeight: 100 }}>( <strong style={{ color: 'red', fontSize: 14 }}>{Utils.numberWithCommas(subcategory.products)}</strong> )</Typography> */}
                      </Grid>
                    )
                  } else {
                    return ''
                  }
                })
                :
                ''
            }
            </GridList>
          </Hidden>
          <Hidden lgUp>
            <div style={{ flexWrap: 'wrap', overflowX: 'scroll'}}>
              <GridList className={classes.scrollBar} style={{ padding: '0 16px', flexWrap: 'nowrap', transform: 'translateZ(0)', marginBottom:10 }} cols={2.5}>
                {
                  (this.state.buttons.length > 0) ?
                    this.state.buttons.map((subcategory, idx) => {
                      if (subcategory.products > 0) {
                        return (
                          <Grid key={idx} item xl={1} lg={1} md={2} sm={6} xs={6} style={{ cursor: 'pointer', marginTop: '30px', marginRight:25 }}>
                            <a href={self.getLink(subcategory)}  >
                              <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
                                <div style={{ background: 'white', height: '100px', width: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 100, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.19)' }} >
                                  <img style={{ height: 70, width: 70, objectFit: 'fill' }} src={Utils.constants.HOST_CDN_AWS + '/normal/' + subcategory.image} alt="" />
                                </div>
                              </div>
                            </a>
                            <Typography variant="body2" className={classes.itemTitle}>{subcategory.description}</Typography>

                          </Grid>
                        )
                      } else {
                        return ''
                      }
                    })
                    :
                    ''
                }
              </GridList>
            </div>
          </Hidden>
        </>
        :
        <>
        {
          (this.state.loading) ?
          <Empty 
            isLoading={this.state.loading}
          />
          :
          ''
        } 
        </>
      }
      </>
    )
  }
}

export default compose(
  withStyles(styles)
)(ButtonBlock)
