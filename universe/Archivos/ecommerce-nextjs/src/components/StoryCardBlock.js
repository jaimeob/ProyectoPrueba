import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

// Utils
import Utils from '../resources/Utils'
import { deleteDataAPI } from '../api/CRUD'
import { showMessengerFacebook } from '../actions/actionConfigs'

let INTERVAL = null

const styles = theme => ({
  container: {
    overflow: 'hidden'
  },
  primaryButton: {
    marginLeft: 16,
    fontWeight: 600,
    fontSize: 14
  }
})

class Story extends Component {
  constructor(props) {
    super(props)
    this.state = {
      storytelling: [],
      story: -1,
      second: 0
    }
    this.handleRender = this.handleRender.bind(this)
    this.executeTimer = this.executeTimer.bind(this)
    this.stopStory = this.stopStory.bind(this)
  }

  stopStory() {
    this.props.stopStory()
    clearInterval(INTERVAL)
    INTERVAL = null
  }

  handleRender() {
    const self = this
    this.props.showMessengerFacebook(false)
    this.setState({
      second: 0,
      story: 0,
      storytelling: this.props.story.storytelling
    }, () => {
      INTERVAL = setInterval(() => {
        self.executeTimer()
      }, 1000)
    })
  }

  executeTimer() {
    if (this.state.storytelling[this.state.story].time > (this.state.second)) {
      let secondUpdate = (this.state.second + 1)
      this.setState({
        second: secondUpdate,
      })
    } else {
      let storyIdx = (this.state.story + 1)
      if (storyIdx < this.state.storytelling.length) {
        this.setState({
          second: 0,
          story: storyIdx
        })
      } else {
        this.stopStory()
      }
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Dialog
        open={this.props.open}
        onBackdropClick={this.stopStory}
        onEscapeKeyDown={this.stopStory}
        onRendered={this.handleRender}
      >
      {
        (INTERVAL !== null) ?
          <div className={classes.container}>
          {
            (this.state.storytelling[this.state.story].type === 'image') ?
            <div style={{ textAlign: 'center' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'red', width: ((this.state.second / this.state.storytelling[this.state.story].time) * 100) + '%', height: 10 }}><strong style={{ opacity: 0, fontSize: 10, color: 'white', textAlign: 'center' }}>{this.state.storytelling[this.state.story].time - this.state.second}</strong></span>
              <img style={{ height: 800 }} src={this.state.storytelling[this.state.story].src} />
            </div>
            :
            ''
          }
        </div>
        :
        ''
      }
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    showMessengerFacebook: (show) => {
      dispatch(showMessengerFacebook(show))
    }
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(Story)

