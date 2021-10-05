import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { Typography } from '@material-ui/core'
import { withTheme, withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  loadingBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.26)'
  },
  loadingBar: {
    height: 'inherit',
    backgroundColor: '#26a446'
  },
  loadingBarCanceled: {
    height: 'inherit',
    backgroundColor: '#da123f'
  }
})

class ProgressBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      steps: [],
      step: 0,
      canceled: false
    }
  }

  componentWillMount(){
    
    var step = 0
    if (this.props.step > this.props.steps[0].length){
      step = this.props.steps[0].length
    } else {
      step = this.props.step
    }
    let steps = []
    this.props.steps[0].forEach(element => {
      steps.push(element.name)
    })


    if (this.props.step === '6' || this.props.step === '4') {
      if (this.props.steps[0][3].name === 'Cancelado') {
        this.setState({
          canceled: true
        })
      } else {
        if (this.props.steps[0].length > 4  ) {
          if (this.props.steps[0][5].name === 'Cancelado') {
            this.setState({
              canceled: true
            })
          }
        }
      }




    }
    
    this.setState({
      steps: steps,
      step: step
    })
  }
  
  render() {
    const { classes } = this.props
    return(
      <div>
        {
          (this.state.steps.length > 0)?
            <div>
              <div className={classes.loadingBarContainer}> 
                {/* <div className={classes.loadingBar} style={{ width: ((100 / this.state.steps.length) * this.state.step) + "%" }}></div> */}
                {
                  (!this.state.canceled ) ?
                  <div className={classes.loadingBar} style={{ width: ((100 / this.state.steps.length) * this.state.step) + "%" }}></div>
                  :
                  <div className={classes.loadingBarCanceled} style={{ width: ((100 / this.state.steps.length) * this.state.step) + "%" }}></div>
                }
              </div>
              {
                (this.state.steps.map((step, index) => {
                  return(
                    <div key={index} style={{width: (100 / this.state.steps.length) + "%", display: 'inline-block'}}>
                      {
                        ((index ) === parseInt(this.state.step) - 1 )?
                          <Typography variant="body1" align="center" style={{...this.props.style, color: '#000000'}}>
                            {step}
                          </Typography>
                        :
                          <Typography variant="body1" align="center" style={this.props.style}>
                            {step}
                          </Typography>
                      } 
                    </div>
                  )
                }))
              }
            </div>
          :
            ''
        }
      </div>
    )
  }
}

export default compose(
  
  withStyles(styles),
)(ProgressBar)
