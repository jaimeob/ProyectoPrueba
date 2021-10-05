import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Hidden, Typography } from '@material-ui/core'

const styles = theme => ({
  mediaContainer: {
    width: '100%'
  },
  media: {
    width: '100%',
    height: 'auto'
  },
  numberClock: {
    borderRadius: 5, width: '100%', display: 'block', margin: 'auto', textAlign: 'center'
  },
  containerNumberClock: {
    textAlign: 'center'
  },
  container: {
    padding: 22,
    background: 'rgba(0, 0, 0, 0.9)'
  },
  numberText: {
    color: 'white',
    fontSize: 32,
    [theme.breakpoints.down('md')]: {
      fontSize: 24,
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: 24
    }
  },
  colorText: {
    color: 'white',
    fontSize: 12,
    [theme.breakpoints.down('md')]: {
      fontSize: 12,
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: 12
    }
  },
  absoluteContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '50%',
    left: '50%',
    padding: 16,
    transform: 'translate(-50%, -50%)',
  }
})

class BannerCountdown extends Component {
  constructor(props) {
    super(props)

    let verticalAlign = 'center'
    if (this.props.configs.countdownVerticalAlign === 'top') {
      verticalAlign = 'flex-start'
    } else if (this.props.configs.countdownVerticalAlign === 'bottom') {
      verticalAlign = 'flex-end'
    }

    let horizontalAlign = 'center'
    if (this.props.configs.countdownHorizontalAlign === 'left') {
      horizontalAlign = 'flex-start'
    } else if (this.props.configs.countdownHorizontalAlign === 'right') {
      horizontalAlign = 'flex-end'
    }

    this.state = {
      interval: null,
      configs: this.props.configs,
      verticalAlign: verticalAlign,
      horizontalAlign: horizontalAlign,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      interval: 0,
      finishedDate: false
    }

    this.getTimeRemaining = this.getTimeRemaining.bind(this)
    this.updateClock = this.updateClock.bind(this)
  }

  getTimeRemaining() {
    let total = 0
    let days = 0
    let hours = 0
    let seconds = 0
    let minutes = 0

    if (this.props.configs.eventDate) {
      total = new Date(this.props.configs.eventDate) - new Date()

      days = Math.floor(total / (1000 * 60 * 60 * 24))
      hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
      seconds = Math.floor((total % (1000 * 60)) / 1000)
    }

    return {
      total,
      days,
      hours,
      minutes,
      seconds
    };
  }

  updateClock() {
    const t = this.getTimeRemaining();

    if (t.total <= 0) {
      clearInterval(this.state.interval)
    }
    this.setState({
      seconds: t.seconds,
      minutes: t.minutes,
      hours: t.hours,
      days: t.days
    })

  }
  componentWillMount() {
    let total = 0
    if (this.props.configs.eventDate) {
      total = new Date(this.props.configs.eventDate) - new Date()
    }

    if (total > 0) {
      this.setState({
        finishedDate: false
      })
    } else {
      this.setState({
        finishedDate: true
      })
    }
    let interval = setInterval(this.updateClock, 1000)
    this.setState({ interval: interval })
  }
  componentDidUpdate() {

    if (this.state.days < 0 || this.state.hours < 0 || this.state.minutes < 0 || this.state.seconds < 0) {
      this.setState({
        days: 0,
        minutes: 0,
        hours: 0,
        seconds: 0,
        finishedDate: true
      })
    }
  }
  render() {
    const { classes } = this.props
    let paddingStyle = '0'
    if (this.props.configs.countdownHorizontalAlign === 'left') {
      paddingStyle = '48px'
    } else if (this.props.configs.countdownHorizontalAlign === 'right') {
      paddingStyle = '48px'
    }

    return (
      <Grid container style={{ lineHeight: 0, position: 'relative' }} >
        <a href={(this.state.finishedDate) ? this.props.configs.finishBanner.cta.link : ''} style={(this.state.finishedDate) ? { cursor: 'pointer' } : { pointerEvents: 'none' }} className={classes.mediaContainer}>
          <Hidden mdUp>
          {
            (!this.state.finishedDate) ?
              <img className={classes.media} src={this.state.configs.banner.mobileImage.url} alt={this.state.configs.banner.seoDescription} height={this.state.configs.banner.mobileImage.height || ''} width={this.state.configs.banner.mobileImage.width || ''} />
              :
              <img className={classes.media} src={this.state.configs.finishBanner.mobileImage.url} alt={this.state.configs.finishBanner.seoDescription} height={this.state.configs.finishBanner.mobileImage.height || ''} width={this.state.configs.finishBanner.mobileImage.width || ''} />
          }
          </Hidden>
          <Hidden smDown>
          {
            (!this.state.finishedDate) ?
              <div>
                <img className={classes.media} src={this.state.configs.banner.desktopImage.url} alt={this.state.configs.banner.seoDescription} height={this.state.configs.banner.desktopImage.height || ''} width={this.state.configs.banner.desktopImage.width || ''} />
              </div>
              :
              <div>
                <img className={classes.media} src={this.state.configs.finishBanner.desktopImage.url} alt={this.state.configs.finishBanner.seoDescription} height={this.state.configs.finishBanner.desktopImage.height || ''} width={this.state.configs.finishBanner.desktopImage.width || ''} />
              </div>
          }
          </Hidden>
          {
            (!this.state.finishedDate) ? 
            <>
            <Hidden smDown>
              <Grid item container xs={12} className={classes.absoluteContainer} style={{ display: 'flex', justifyContent: this.state.horizontalAlign, alignItems: this.state.verticalAlign, padding: paddingStyle }}>
                <Grid item container md={1} xs={2} className={classes.container} style={{ borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}  >
                  <Grid item xs={12} className={classes.containerNumberClock} >
                    <div className={classes.numberClock} >
                      <Typography variant='h1' className={classes.numberText} style={{ color: 'white ' }}  >{this.state.days}</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} style={{ textAlign: 'center' }} >
                    <Typography className={classes.colorText} variant='body2'  >Días</Typography>
                  </Grid>
                </Grid>
                <Grid item container md={1} xs={2} className={classes.container}  >
                  <Grid item xs={12} className={classes.containerNumberClock}  >
                    <div className={classes.numberClock} >
                      <Typography className={classes.numberText} variant='h1' style={{ color: 'white ' }} >{this.state.hours}</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} style={{ textAlign: 'center' }} >
                    <Typography className={classes.colorText} variant='body2'  >Horas</Typography>
                  </Grid>
                </Grid>
                <Grid item container md={1} xs={2} className={classes.container}  >
                  <Grid item xs={12} className={classes.containerNumberClock} style={{ textAlign: 'center' }} >
                    <div className={classes.numberClock} >
                      <Typography className={classes.numberText} variant='h1' style={{ color: 'white ' }} >{this.state.minutes}</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} style={{ textAlign: 'center' }} >
                    <Typography className={classes.colorText} variant='body2'  >Minutos</Typography>
                  </Grid>
                </Grid>
                <Grid item container md={1} xs={2} className={classes.container} style={{ borderTopRightRadius: 5, borderBottomRightRadius: 5 }}  >
                  <Grid item xs={12} className={classes.containerNumberClock} >
                    <div className={classes.numberClock} >
                      <Typography className={classes.numberText} variant='h1' style={{ color: 'white ' }} >{this.state.seconds}</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} style={{ textAlign: 'center' }} >
                    <Typography className={classes.colorText} variant='body2'  >Segundos</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Hidden>
            <Hidden mdUp>
              <Grid item container xs={12} className={classes.absoluteContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Grid item container md={1} xs={2} className={classes.container} style={{ borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}  >
                  <Grid item xs={12} className={classes.containerNumberClock} >
                    <div className={classes.numberClock} >
                      <Typography variant='h1' className={classes.numberText} style={{ color: 'white ' }}  >{this.state.days}</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} style={{ textAlign: 'center' }} >
                    <Typography className={classes.colorText} variant='body2'  >D</Typography>
                  </Grid>
                </Grid>
                <Grid item container md={1} xs={2} className={classes.container}  >
                  <Grid item xs={12} className={classes.containerNumberClock}  >
                    <div className={classes.numberClock} >
                      <Typography className={classes.numberText} variant='h1' style={{ color: 'white ' }} >{this.state.hours}</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} style={{ textAlign: 'center' }} >
                    <Typography className={classes.colorText} variant='body2'  >H</Typography>
                  </Grid>
                </Grid>
                <Grid item container md={1} xs={2} className={classes.container}  >
                  <Grid item xs={12} className={classes.containerNumberClock} style={{ textAlign: 'center' }} >
                    <div className={classes.numberClock} >
                      <Typography className={classes.numberText} variant='h1' style={{ color: 'white ' }} >{this.state.minutes}</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} style={{ textAlign: 'center' }} >
                    <Typography className={classes.colorText} variant='body2'  >M</Typography>
                  </Grid>
                </Grid>
                <Grid item container md={1} xs={2} className={classes.container} style={{ borderTopRightRadius: 5, borderBottomRightRadius: 5 }}  >
                  <Grid item xs={12} className={classes.containerNumberClock} >
                    <div className={classes.numberClock} >
                      <Typography className={classes.numberText} variant='h1' style={{ color: 'white ' }} >{this.state.seconds}</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} style={{ textAlign: 'center' }} >
                    <Typography className={classes.colorText} variant='body2'  >S</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Hidden>
            </>
            :
            ''
          }
        </a>
      </Grid>
    )
  }
}

export default compose(
  withStyles(styles)
)(BannerCountdown)
