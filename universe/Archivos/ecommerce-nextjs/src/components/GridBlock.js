'use strict'

import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'

import Utils from "../resources/Utils"

const styles = theme => ({})

class GridBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      configs: this.props.configs
    }
  }

  render() {
    const { classes } = this.props
    const self = this
    let smColumns = 12
    if (self.state.configs.gridMobile) {
      if (self.state.configs.columns === 3) {
        smColumns = 4
      } else {
        smColumns = 6
      }
    }
    return (
      <Grid container style={{ lineHeight: 0, paddingTop: self.state.configs.paddingTop, paddingBottom: self.state.configs.paddingBottom, background: (Utils.isEmpty(self.state.configs.backgroundColor) ? 'none' : '#' + self.state.configs.backgroundColor) }}>
        {
          this.state.configs.grid.map((item, key) => {
            return (
              <Grid key={key} item style={{ paddingLeft: self.state.configs.separationItems / 2, paddingRight: self.state.configs.separationItems / 2, paddingTop: self.state.configs.separationItems / 2, paddingBottom: self.state.configs.separationItems / 2 }} key={key} xl={12 / self.state.configs.columns} lg={12 / self.state.configs.columns} md={12 / self.state.configs.columns} sm={ smColumns } xs={ smColumns }>
                {
                  (item.cta !== null) ?
                    <div style={{ width: 'auto' }}>
                      <a href={item.cta.link}>
                        <img style={{ width: '100%', height: 'auto', borderRadius: self.state.configs.borderRadius }} src={item.image.url} alt={item.seoDescription} width={item.image.width || ''} height={item.image.height || ''} />
                      </a>
                    </div>
                    :
                    <div style={{ width: 'auto' }}>
                      <img style={{ width: '100%', height: 'auto', borderRadius: self.state.configs.borderRadius }} src={item.image.url} alt={item.seoDescription} width={item.image.width || ''} height={item.image.height || ''} />
                    </div>
                }
              </Grid>
            )
          })
        }
      </Grid>
    )
  }
}

export default compose(
  withStyles(styles)
)(GridBlock)
