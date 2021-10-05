import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Typography, Paper } from '@material-ui/core'

import Utils from '../resources/Utils'

const styles = theme => ({
  value: {
    marginBottom: 8,
    fontSize: 32
  },
  label: {
    fontWeight: 600,
    fontSize: 11
  },
  card: {
    textAlign: 'center',
    margin: 8,
    marginLeft: 0,
    padding: 16,
    marginBottom: 0
  }
})

class StatusCard extends Component {
  render() {
    const { classes } = this.props
    return (
      <Paper className={classes.card}>
        <Typography variant="h1" color="primary" className={classes.value}>
          {this.props.value}
        </Typography>
        <Typography variant="body1" className={classes.label}>
          {this.props.label}
        </Typography>
      </Paper>
    )
  }
}

export default compose(
  withTheme(),
  withStyles(styles),
)(StatusCard)
