import React, { Component } from 'react'
import {connect} from 'react-redux'
// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Hidden, Card } from '@material-ui/core'

// Components
//import BannerBlock from '../components/BannerBlock'
//import Title from '../components/Title'

// Utils
import Utils from '../../resources/Utils'

const styles = theme => ({
  root: {
    minWidth: 275,
    padding: 30
  },
  aboutUsSection: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  videoContainer: {
    margin: '0 auto',
    width: '80%',
    textAlign: 'center',
    marginTop: 64
  },
  video: {
    [theme.breakpoints.down('md')]: {
      width: "100%"
    },
    [theme.breakpoints.down('sm')]: {
      height: "100%",
      width: "100%"
    },
    frameborder: "0",
    scrolling: "no",
    width: 800,
    height: 443,
    type: "text/html"
  },
  review: {
    [theme.breakpoints.down('sm')]: {
      fontSize: "100%"
    },
    textAlign: 'justify',
    marginTop: 50,
    fontSize: "20px"
  },
  missionAndVisionSection: {
    width: '92%',
    margin: '0 auto',
    marginTop: 32,
    marginBottom: 56
  },
  subTitle: {
    [theme.breakpoints.down('sm')]: {
      marginTop: 32
    },
    marginBottom: 24,
  },
  block: {
    [theme.breakpoints.down('md')]: {
      marginTop: 0
    },
    textAlign: 'center',
    marginTop: 64,
    marginBottom: 56
  },
  text: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '100%'
    },
    fontSize: "20px",
    lineHeight: "25px",
    textAlign: 'justify',
    paddingRight: 16,
    paddingLeft: 16
  }
})


class AboutUs extends Component {

  componentDidMount() {
    Utils.scrollTop()
  }


  render() {
    const { classes } = this.props
    const {title, subtitle, description, images, blocks} = this.props.app.data.langs.es.About
    return (
      <>
        <div style={{ width: '80%', margin: '0 auto' }}>
          <Grid container direction="column" justify="center" alignItems="center" className={classes.aboutUsSection}>
            <Typography style={{ marginBottom: 9 }} variant='h1' align="center">{title}</Typography>
            <Typography variant='h3' align="center">{subtitle}</Typography>
            <Hidden mdUp>
              <img src={images.main} style={{marginTop: '50px'}} style={{height:230}}/>
            </Hidden>
            <Hidden smDown>
              <img src={images.main} style={{marginTop: '50px'}} style={{height:450}}/>
            </Hidden>
            <Grid>
              <Typography variant='body2' className={classes.review}>
                {description}
              </Typography>
            </Grid>
          </Grid>
        </div>
        <Grid container className={classes.missionAndVisionSection} direction="row" justify="center" alignItems="center" spacing={4}>
          {blocks.map((item, i)=>
            <Grid item sm={4} xs={12} className={classes.block} key={i}>
            <Card className={classes.root}>
              <Typography variant='h3' className={classes.subTitle}>
                {item.title}
              </Typography>
              <Grid item xs={12}>
                <Typography variant='body2' className={classes.text}>
                  {item.description}
                </Typography>
              </Grid>
          </Card>
            </Grid>
          )}
        </Grid>
      </>
    )
  }
}
const mapStateToProps = state => ({ ...state })

export default connect(mapStateToProps, null)(withStyles(styles)(AboutUs))
