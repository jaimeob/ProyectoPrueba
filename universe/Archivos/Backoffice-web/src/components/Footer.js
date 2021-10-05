import React, { Component } from 'react'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography } from '@material-ui/core'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({
  footer: {
    paddingTop: 8,
    paddingBottom: 16,
    width: '100%',
    backgroundColor: theme.palette.background.secondary,
    position: 'fixed',
    bottom: 0,
    fontSize: 12,
    color: '#6A7688',
    borderTop: '0.5px solid #E0E0E0',
    zIndex: theme.zIndex.drawer + 1
  },
  footerLogo: {
    margin: 8,
    opacity: 0.5,
    filter: 'grayscale(100%)',
    width: theme.sizes.sizeFooterLogo + '%',
    [theme.breakpoints.down('md')]: {
      width: (theme.sizes.sizeFooterLogo * 1.2) + '%',
    },
    [theme.breakpoints.down('sm')]: {
      width: (theme.sizes.sizeFooterLogo * 1.8) + '%',
    },
    [theme.breakpoints.down('xs')]: {
      width: (theme.sizes.sizeFooterLogo * 2.5) + '%',
    }
  },
  footerText: {
    fontSize: 12
  },
  footerLink: {
    fontSize: 10
  },
  footerVersion: {
    fontSize: 10
  }
})

class Footer extends Component {
  constructor(props) {
    super(props)
    var date = new Date()
    var year = date.getFullYear()
    this.year = year
  }

  render() {
    const { classes } = this.props

    return (
      <footer className={classes.footer}>
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item lg={12} md={12} sm={12} xs={12} style={{textAlign: 'center'}}>
            <img id="footerLogo" className={classes.footerLogo} alt="" src={this.props.footerLogo} />
            <Typography className={classes.footerText} variant="body1">
              © {this.year} <a style={{color: '#6A7688'}} href={this.props.website}><strong>{this.props.name}</strong></a> - {Utils.messages.Footer.copyright}
            </Typography>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12} style={{textAlign: 'center', marginTop: 4}}>
            <a className={classes.footerLink} rel="noopener noreferrer" target="_blank" href={this.props.urlTerms} style={{marginRight: 8, color: '#6A7688'}}>{Utils.messages.Footer.terms}</a>
            <a className={classes.footerLink} rel="noopener noreferrer" target="_blank" href={this.props.urlPrivacy} style={{color: '#6A7688'}}>{Utils.messages.Footer.privacy}</a>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12} style={{textAlign: 'center', marginTop: 4}}>
            <Typography className={classes.footerVersion} variant="body1">
              v{Utils.constants.version}
            </Typography>
          </Grid>
        </Grid>
      </footer>
    )
  }
}

export default withStyles(styles)(Footer)
