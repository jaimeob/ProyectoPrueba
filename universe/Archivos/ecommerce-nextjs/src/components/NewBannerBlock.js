import React, { Component } from 'react'
import compose from 'recompose/compose'
import { Link } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Typography } from '@material-ui/core'
import Utils from '../resources/Utils'

const styles = theme => ({
  container: {
    padding: 0,
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
      width: "100%"
    },
    [theme.breakpoints.up("md")]: {
      width: '85%',
      marginTop: '24px'
    }
  },
  mainMedia: {
    width: '100%',
    margin: '0 auto',
    overflow: 'hidden'
  },
  secondaryMedia: {
    width: '90%',
    [theme.breakpoints.down('sm')]: {
      margin: '0 auto'
    },
    [theme.breakpoints.up('md')]: {
      marginLeft: '24px',
    },
    overflow: 'hidden'
  },
  media: {
    width: '100%',
    'object-fit': 'cover',
    'object-position': 'center'
  },
  text: {
    textAlign: 'center',
    'font-style': 'normal',
    'font-weight': 'bold',
    [theme.breakpoints.down('sm')]: {
      'font-size': '18px',
      'line-height': '23px',
      marginBottom: '24px'
    },
    [theme.breakpoints.up('md')]: {
      'font-size': '20px',
      'line-height': '25px',
    }
  },
  mainText: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      marginTop: '24px',
      marginLeft: '0px'
    },
    [theme.breakpoints.up('md')]: {
      marginTop:'0px',
      marginLeft: '24px'
    },
    marginBottom: 8,
    textAlign: 'left',
    'font-style': 'normal',
    'font-weight': '900',
    'font-size': '28px',
    'line-height': '30px',
  },
  secondaryText: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      marginTop: '8',
      marginBottom: '24px',
      marginLeft: '0px'
    },
    [theme.breakpoints.up('md')]: {
      marginTop:'0px',
      marginLeft: '24px'
    },
    textAlign: 'left',
    'font-style': 'normal',
    'font-weight': '400',
    'font-size': '22px',
    'line-height': '30px',
  }
})

class NewBannerBlock extends Component {
  constructor(props) {
    super(props)

    this.state = {
      configs: null
    }
  }

  componentWillMount(){
    var configs = JSON.parse(this.props.configs)
    this.setState({
      configs: configs
    })
  }

  render() {
    const { classes } = this.props

    return (
      <Grid container className={classes.container}>
        <Grid container item lg={8} md={8} sm={12} xs={12}>
          <div className={classes.mainMedia}>
            {
              this.state.configs !== undefined && this.state.configs.callToAction !== undefined && !Utils.isEmpty(this.state.configs.callToAction) ?
              <div>
              {
                (Utils.isExternalLink(this.state.configs.callToAction)) ?
                <a href={this.state.configs.callToAction}>
                  <img className={classes.media} src={this.state.configs.mainImage}/>
                </a>
                :
                <Link to={this.state.configs.callToAction}>
                  <img className={classes.media} src={this.state.configs.mainImage}/>
                </Link>
              }
              </div>
              :
              <img className={classes.media} src={this.state.configs.mainImage}/>
            }
            </div> 
          </Grid>
        <Grid container item lg={4} md={4} sm={12} xs={12}>
          <Grid item lg={12} md={12} sm={12} xs={12}> 
            <Typography variant="h1" className={classes.mainText}>{this.props.title}</Typography>
            <Typography variant="h5" className={classes.secondaryText}>{this.props.description}</Typography>
          </Grid>
            {
              (this.state.configs != null && this.state.configs.images != undefined) ?
                this.state.configs.images.map((data, index) => {
                  return(
                    <Grid key={index} item lg={6} md={6} sm={6} xs={6}>
                      <div className={classes.secondaryMedia}>
                        {
                          (Utils.isExternalLink(data.callToAction)) ?
                          <a href={data.callToAction}>
                            <img className={classes.media} src={data.url} />
                          </a>
                          :
                          <Link to={data.callToAction}>
                            <img className={classes.media} src={data.url} />
                          </Link>
                        }
                        <Typography className={classes.text}>{data.description}</Typography>
                      </div>
                    </Grid>  
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

export default compose(
  
  withStyles(styles)
)(NewBannerBlock)
