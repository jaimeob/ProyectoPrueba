import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Hidden } from '@material-ui/core'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({
  headbandContainer: {
    width: '100%',
    textAlign: 'center',
    padding: 0,
    fontSize: 12,
    height: 36,
    zIndex: theme.zIndex.drawer + 1,
    /*
    [theme.breakpoints.down('xs')]: {
      left: -30
    }
    */
  },
  headbandImage: {
    [theme.breakpoints.down('sm')]: {
      height: 36
    }
  }
})

class Headband extends Component {
  render() {
    const { classes } = this.props
    let cursor = ''

    if (this.props.link !== undefined && !Utils.isEmpty(this.props.link)) {
      cursor = 'pointer'
    }

    if (!Utils.isEmpty(this.props.image)) {
      return (
        <Grid container className={classes.headbandContainer} style={{ backgroundColor: this.props.backgroundColor, cursor: cursor }}>
          <Hidden smDown>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <img className={classes.headbandImage} alt='' src={this.props.image} />
            </Grid>
          </Hidden>
          <Hidden mdUp>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <img className={classes.headbandImage} alt='' src={this.props.responsiveImage} />
            </Grid>
          </Hidden>
        </Grid>
      )
    } else {
      return (
        <a href={this.props.link}>
          <Grid container className={classes.headbandContainer} style={{ backgroundColor: this.props.backgroundColor, cursor: cursor }}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Typography type="body1" style={{ marginTop: 8, fontSize: 14, fontWeight: 800, color: this.props.textColor }}>
                <strong>{this.props.message}</strong>
              </Typography>
            </Grid>
          </Grid>
        </a>
      )
    }
  }
}

export default compose(
  withStyles(styles)
)(Headband)
