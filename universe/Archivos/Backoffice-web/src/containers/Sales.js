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

class Sales extends Component {
  render() {
    const { classes } = this.props
    return (
      <CRUD
        status={true}
        origin={Utils.constants.modules.Sales}
        messages={Utils.messages.Sales}
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
)(Sales)
