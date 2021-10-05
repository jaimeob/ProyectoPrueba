import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Typography, Grid } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Tooltip from '@material-ui/core/Tooltip'

// Components
import TextField from '@material-ui/core/TextField'

const styles = theme => ({
  textField: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'white',
  }
})

class MultipleActions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      style: {
        fontSize: 42,
        fontWeight: 700
      }
    }
    this.handleClick = this.handleClick.bind(this)
  }
  componentWillMount() {
    if (this.props.variant === 'subtitle') {
      this.setState({
        style: {
          fontSize: 32,
          fontWeight: 700
        }
      })
    }
    else {
      this.setState({
        style: {
          fontSize: 42,
          fontWeight: 700
        }
      })
    }
  }

  handleClick(selected, option) {
    this.props.handleCloseMultipleAction(selected, option, true)
  }

  render() {
    const self = this
    const { classes } = this.props
    return (
      <Grid container>
        <Grid item lg={2} style={{marginTop: 16}}>
          <Typography>{this.props.selected.length} elementos seleccionados.</Typography>
        </Grid>
        <Grid item lg={10} style={{marginTop: 3}}>
          {
            this.props.actions.map(function(action) {
              return (
                <Tooltip title={self.props.messages[action.pluralName]} placement="bottom-start">
                  <IconButton
                    onClick={() => { self.handleClick(self.props.selected, action.pluralName)}}
                  >
                    <Icon>{action.icon}</Icon>
                  </IconButton>
                </Tooltip>
              )
            })
          }
        </Grid>
      </Grid>
    )
  }
}

export default compose(
  withTheme(),
  withStyles(styles),
)(MultipleActions)
