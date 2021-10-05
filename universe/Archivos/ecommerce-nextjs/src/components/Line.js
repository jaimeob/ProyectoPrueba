import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  gray: {
    height: '1px',
    border: 'solid 1px #edeef2'
  },
  yellow: {
    height: '1px',
    //margin: '7.5px 0 15.5px 0px',
    border: 'solid 1px #e98607',
  }
})

class Line extends Component {
  constructor(props) {
    super(props)
    this.state = {
      color: 'gray'
    }
  }
  componentWillMount() {
  }
  render() {
    const { classes } = this.props
    const self = this
    return (
      <div className={ (this.props.color !== undefined)? classes[this.props.color] : classes.gray }></div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(Line)
