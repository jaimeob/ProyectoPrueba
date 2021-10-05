'use strict'

import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Icon } from '@material-ui/core'

import Utils from '../resources/Utils'

const styles = theme => ({
  container: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center!important;'
    }
  },
  message: {
    lineHeight: 0,
    fontSize: 16,
    fontWeight: '300'
  },
  cta: {
    fontSize: 16
  }
})

class TextBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      configs: this.props.configs
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Grid container className={classes.container} style={{ lineHeight: 0, textAlign: this.state.configs.textAlign }}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          {
            (!Utils.isEmpty(this.state.configs.title)) ?
            <Typography variant="body1" style={{ fontSize: 26, fontWeight: '500' }}>{this.state.configs.title}</Typography>
            :
            ''
          }
          {
            (!Utils.isEmpty(this.state.configs.message)) ?
            <Typography variant="body2" className={ classes.message } style={(!Utils.isEmpty(this.state.configs.title)) ? { marginTop: 12 } : {}}>
              {this.state.configs.message}
            </Typography>
            :
            ''
          }
          {
            (this.state.configs.cta !== null) ?
            <Typography variant="body2" className={ classes.cta } style={(!Utils.isEmpty(this.state.configs.title) || !Utils.isEmpty(this.state.configs.message)) ? { marginTop: 18 } : {}}>
              <a href={this.state.configs.cta.link} style={{ lineHeight: 0, padding: 0, margin: 0, color: 'blue' }}>
                {this.state.configs.cta.text} <Icon style={{ paddingTop: 6 }}>arrow_right_alt</Icon>
              </a>
            </Typography>
            :
            ''
          }
        </Grid>
      </Grid>
    )
  }
}

export default compose(
  withStyles(styles)
)(TextBlock)
