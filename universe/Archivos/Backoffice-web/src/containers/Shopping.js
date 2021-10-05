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
import NewShopping from '../components/NewShopping'
import AuthorizationModal from '../components/AuthorizationModal'
import NotFound from './NotFound'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({

})

class Shopping extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shoppingCartSelected: {},
      openAuthorizationModal: false
    }

    this.options = this.options.bind(this)
  }

  create() {
    this.props.history.push(Utils.constants.paths.newShopping)
  }

  options(item, option) {
    if (option === 'authorize') {
      this.setState({
        shoppingCartSelected: item,
        openAuthorizationModal: true
      })
    }
  }

  render() {
    const { classes } = this.props
    if (this.props.match.path === Utils.constants.paths.newShopping) {
      return (
        <NewShopping />
      )
    }
    else {
      return (
        <div>
          <CRUD
            status={true}
            origin={Utils.app.modules.Shoppings}
            messages={Utils.messages.Shoppings}
            options={(item, option) => this.options(item, option)}
            create={
              (Utils.app.modules.Shoppings.permissions.create) ?
                () => this.create()
              :
              ''
            }
            read={Utils.app.modules.Shoppings.permissions.read}
            update={Utils.app.modules.Shoppings.permissions.update}
            delete={Utils.app.modules.Shoppings.permissions.delete}
          />
          <AuthorizationModal
            open={this.state.openAuthorizationModal}
            data={this.state.shoppingCartSelected}
            resource="shoppings"
            onConfirm={() => { this.setState({openAuthorizationModal: false, shoppingCartSelected: {}}) }}
          />
        </div>
      )
    }
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(Shopping)
