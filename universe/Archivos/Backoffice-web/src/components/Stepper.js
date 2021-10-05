import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

const styles = theme => ({
  button: {
    marginLeft: 16
  },
  nextButton: {
    marginLeft: 16,
    fontWeight: 600,
    fontSize: 14
  }
})

class Stepper extends Component {
  render() {

    const { classes } = this.props

    return (
      <div className={this.props.className}>
        {

          (this.props.back) ?

          <Button
            className={classes.button}
            onClick={this.props.onClickBack}
          >
            {this.props.back.name}
          </Button>
          
          :
          
          ''

        }
        {
          (this.props.next) ?

          <Button
            className={classes.nextButton}
            variant="contained"
            color="primary"
            onClick={this.props.onClickNext}
          >
            {this.props.next.name}
          </Button>
          
          :
          
          ''
        }
      </div>
    )
  }
}

export default compose(
  withTheme(),
  withStyles(styles)
)(Stepper)
