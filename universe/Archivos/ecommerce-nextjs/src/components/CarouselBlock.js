'use strict'

import React, { Component } from "react"
import compose from "recompose/compose"
import { withStyles } from "@material-ui/core/styles"

import Utils from "../resources/Utils"

const styles = theme => ({
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

class CarouselBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      configs: null,
      items: []
    }
  }

  componentWillMount() {
    let items = this.props.configs.items
    this.setState({
      configs: this.props.configs,
      items: items
    })
  }

  render() {
    const { classes } = this.props
    const self = this
    return (
      <div style={{ paddingTop: self.state.configs.paddingTop, paddingBottom: self.state.configs.paddingBottom, background: (Utils.isEmpty(self.state.configs.backgroundColor) ? 'none' : '#' + self.state.configs.backgroundColor) }}>
        <div className={classes.scrollBar} style={{ display: 'flex', justifyContent: 'start', width: '100%', overflowX: 'scroll' }}>
          {
            this.state.items.map((item, key) => {
              return (
                <div idx={key} style={{ padding: 0, paddingLeft: self.state.configs.separationItems / 2, paddingRight: self.state.configs.separationItems / 2, height: item.heightBanner / 2 }}>
                  {
                    (item.cta !== null) ?
                      <a href={item.cta.link}>
                        <img className={classes.image} style={{ borderRadius: self.state.configs.borderRadius }} src={item.image.url} alt={item.seoDescription} width={item.image.width / 2 || ''} height={item.image.height / 2 || ''} />
                      </a>
                      :
                      <img className={classes.image} style={{ borderRadius: self.state.configs.borderRadius }} src={item.image.url} alt={item.seoDescription} width={item.image.width / 2 || ''} height={item.image.height / 2 || ''} />
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default compose(
  withStyles(styles)
)(CarouselBlock)
