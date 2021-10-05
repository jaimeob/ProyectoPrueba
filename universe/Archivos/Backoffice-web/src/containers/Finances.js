import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

// Components
import CRUD from '../components/CRUD'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({

})

class Finances extends Component {
  render() {
    const { classes } = this.props
    return (
      <CRUD
        origin={Utils.constants.modules.Finances}
        messages={Utils.messages.Finances}
      />
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(Finances)
