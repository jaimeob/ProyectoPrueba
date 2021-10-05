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
import NotFound from './NotFound'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({

})

class Categories extends Component {
  render() {
    const { classes } = this.props
    return (
      (Utils.constants.modules.Categories !== undefined && Utils.constants.modules.Categories.permissions.read) ?
      <CRUD
        status={false}
        origin={Utils.constants.modules.Categories}
        messages={Utils.messages.Categories}
        create={Utils.constants.modules.Categories.permissions.create}
        read={Utils.constants.modules.Categories.permissions.read}
        update={Utils.constants.modules.Categories.permissions.update}
        delete={Utils.constants.modules.Categories.permissions.delete}
      />
      :
      <NotFound />
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(Categories)
