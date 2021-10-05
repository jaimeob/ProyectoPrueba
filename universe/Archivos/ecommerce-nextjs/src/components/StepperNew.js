import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

//material
import { Grid, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  containerStepper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%'
  },
  available: {
    background: '#7ad689',
    display: 'block',
    borderRadius: '4px',
    width: '100%',
    height: '3px',
    fontWeight: '600',
    color: 'black',
  },
  unavailable: {
    background: '#dedede',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: '4px',
    width: '100%',
    height: '3px',
    fontWeight: '600',
    color: '#dedede'
  },
  availableText: {
    fontWeight: '600',
    color: 'black',
    marginBottom: '10px',
    [theme.breakpoints.down('xs')]: {
      fontSize:'12px', 
    }
  },
  unavailableText: {
    fontWeight: '600',
    color: '#dedede',
    marginBottom: '10px',
    [theme.breakpoints.down('xs')]: {
      fontSize:'12px', 
    }
  }
})

class StepperNew extends Component {
  constructor(props) {
    super(props)
    this.state = {
      size: 12,
      steps:[]
    }
  }

componentWillMount() {
  if (this.props.steps !== null && this.props.steps !== undefined) {
    this.setState({
      steps: this.props.steps
    })
  }
}

  render() {
    const self = this
    const { classes } = this.props
    return (

      <Grid container style={{ width:'100%' }} >
        <Grid item sm={12} className={classes.containerStepper} >
          {
            (this.state.steps !== null && this.state.steps !== null && this.state.steps.length > 0) ?
              this.state.steps.map((step, idx) => {
                return (
                  <div className={classes.outter} style={{ width: '100%', paddingLeft: '0px', paddingRight: '0px' }} >
                    <Typography variant='body2' style={{ height:'30px', display: 'flex', alignItems:'flex-end', justifyContent: 'center'  }} align='center' className={(step.status) ? classes.availableText : classes.unavailableText}  >{step.name}</Typography>
                    <div style={{ width: (this.props.calzzamovil) ? '100%' : '95%', background: '#dedede' }} >
                      <div className={(step.status) ? classes.available : classes.unavailable} style={(((idx + 1) < this.state.steps.length && step.status && !this.state.steps[idx + 1].status) || (step.status && (idx + 1) === this.state.steps.length)) ? { animation: ` fillup 3s` } : {}} ></div>
                    </div>
                  </div>
                )
              })
              :
              ''
          }
        </Grid>
      </Grid>
    )
  }
}
const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(StepperNew)
