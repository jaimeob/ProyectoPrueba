'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Typography } from '@material-ui/core'
// Material UI
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  text:{
    fontSize: '14px',
    fontWeight: 500
  },
  bluePointText: {
    color: '#006fb9',
  },
  bluePointRectangle: {
    background: '#e7f3fb',
  },
  offerText: {
    color: '#d11e0a',
  },
  offerRectangle: {
    background: '#ffe8eb',
  },
  mostText: {
    color: '#ff8300',
  },
  mostRectangle: {
    background: 'rgba(255, 131, 0, 0.2);',
  },
  blank: {
    background: 'white',
  },
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
      <div>
      {
        (this.props.name !== false) ?
        <div className={classes[this.props.container]} style={{
          borderRadius: '6px',
          paddingTop: '3px',
          paddingBottom: '5px',
          paddingLeft: '8px',
          paddingRight: '8px',
          justifyContent:' center',
          alignItems: 'center',
          display: 'flex',
          }}
        >
          <Typography variant="body2" className={[ classes.text, classes[this.props.text]]} >{ this.props.name }</Typography>
        </div>
        :
        ''
      }
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(Line)
