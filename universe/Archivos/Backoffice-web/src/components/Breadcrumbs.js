import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import ChevronRight from '@material-ui/icons/ChevronRight'

const styles = theme => ({
  separator: {
    float: 'right',
    color: '#6A7688'
  }
})

class Breadcrumbs extends Component {
  goToBack() {
    window.history.back()
  }
  
  render() {
    const { classes } = this.props
    return (
      <div>
      {
        this.props.breadcrumbs.map((breadcrumb, idx) => {
          return (
            (Number(idx) >= (this.props.breadcrumbs.length - 1)) ?
            <Typography key={idx} variant="body1" style={{color: '#6A7688'}}><strong>{breadcrumb.label}</strong></Typography>
            :
            <div key={idx} style={{float: 'left'}}>
              <span><Link style={{color: '#C9D5E1'}} onClick={this.goToBack}>{breadcrumb.label}</Link><ChevronRight className={classes.separator}/></span>
            </div>
          )
        })
      }
      </div>
    )
  }
}

export default compose(
  withTheme(),
  withStyles(styles)
)(Breadcrumbs)
