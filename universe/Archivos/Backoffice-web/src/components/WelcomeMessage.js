import React, { Component } from 'react'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'

const styles = theme => ({
  container: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      marginBottom: 32
    }
  },
  welcomeTitle: {
    [theme.breakpoints.down('xs')]: {
      fontSize: 32
    }
  },
  welcomeDescription: {
    [theme.breakpoints.down('xs')]: {
      fontSize: 14
    }
  },
  containerImage: {
    marginRight: 32,
    [theme.breakpoints.down('sm')]: {
      opacity: '0',
      height: '0'
    }
  },
  inlineImg: {
    width: theme.sizes.sizeLogo + '%',
    height: 'auto',
    marginTop: 32
  }
})

class WelcomeMessage extends Component {
  render() {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <Typography className={classes.welcomeTitle} variant="h1">
          {this.props.welcomeTitle}
        </Typography>
        <Typography className={classes.welcomeDescription} variant="body1" style={{marginTop: 16}}>
          {this.props.welcomeDescription}
        </Typography>
        <Grid container>
          <Hidden smDown>
            <Grid className={classes.containerImage} lg={12} md={12} sm={12} xs={12} item>
              <img className={classes.inlineImg} alt="" src={this.props.mainLogo} />
            </Grid>
          </Hidden>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(WelcomeMessage)
