import React, { Component } from 'react'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import emptyImg from '../resources/images/empty.svg'
import Loading from '../components/Loading'

const styles = theme => ({
  container: {
    margin: '0 auto',
    marginTop: 32,
    width: '50%',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      width: '70%'
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  },
  mainButton: {
    marginTop: 32,
    fontWeight: 600,
    fontSize: 14
  },
  image: {
    width: 122,
    marginBottom: 32
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 8,
    width: '100%',
    backgroundColor: theme.palette.background.secondary,
    position: 'fixed',
    bottom: 0,
    fontSize: 12,
    color: '#6A7688'
  },
  footerLogo: {
    width: 24,
    margin: 8,
    opacity: 0.5,
    filter: 'grayscale(80%)',
  },
  footerText: {
    fontSize: 12
  },
  footerLink: {
    fontSize: 10
  }
})

class Empty extends Component {
  constructor(props) {
    super(props)
    var date = new Date()
    var year = date.getFullYear()
    this.year = year
  }

  render() {
    
    const { classes } = this.props

    return (
      <div className={classes.container}>
        {
          (this.props.isLoading !== undefined && this.props.isLoading) ?
            <div className={classes.image} style={{textAlign: 'center', margin: '0 auto'}}>
              <Loading />
              <br />
            </div>
          :
          (this.props.emptyImg === undefined) ?
            <img alt="" src={emptyImg} className={classes.image} />
          :
            <img alt="" src={this.props.emptyImg} className={classes.image} />
        }
        <Typography variant="h6">
          <strong>{this.props.title}</strong>
        </Typography>
        <Typography variant="body1">
          {this.props.description}
        </Typography>
        {
          (this.props.buttonTitle) ?
          <Button
            className={classes.mainButton}
            variant="contained"
            color="primary"
            onClick={this.props.callToAction}
          >
            {this.props.buttonTitle}
          </Button>
          :
          ''
        }
      </div>
    )
  }
}

export default withStyles(styles)(Empty)
