import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'

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

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      style: {
        fontSize: 42,
        fontWeight: 700
      }
    }
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

  render() {
    const { classes } = this.props
    return (
      <div>
        <TextField
          className={classes.textField}
          placeholder={this.props.placeholder}
        />
      </div>
    )
  }
}

export default compose(
  withTheme(),
  withStyles(styles),
)(Search)
