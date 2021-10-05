import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'

const styles = theme => ({
  title: {
    marginBottom: 8,
    [theme.breakpoints.down('sm')]: {
      fontSize: '32px!important'
    }
  }
})

class Title extends Component {
  constructor(props) {
    super(props)
    this.state = {
      style: {
        fontSize: 30,
        fontWeight: 700
      }
    }
  }
  componentWillMount() {
    if (this.props.variant === 'subtitle') {
      this.setState({
        style: {
          fontSize: 28,
          fontWeight: 700
        }
      })
    }
    else {
      this.setState({
        style: {
          fontWeight: 700
        }
      })
    }
  }

  render() {
    const { classes } = this.props
    return (
      <header>
        <Typography variant="h1" style={this.state.style} className={classes.title}>
          {this.props.title}
        </Typography>
        <Typography variant="body2">
          {this.props.description}
        </Typography>
      </header>
    )
  }
}

export default compose(
  
  withStyles(styles),
)(Title)
