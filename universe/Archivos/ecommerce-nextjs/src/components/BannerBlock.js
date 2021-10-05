'use strict'

import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Hidden } from '@material-ui/core'
import Slider from "react-slick"

const styles = theme => ({
  root: {
    lineHeight: 0,
    height: "auto",
    textAlign: 'center',
    width: '100%'
  },
  mediaContainer: {
    width: '100%',
    overflow: 'hidden'
  },
  media: {
    width: '100%',
    height: 'auto'
  },
  slider: {
    height: "auto",
    "& .slick-slide": {
      margin: "0px 0px"
    },
    "& .slick-list": {
      marginLeft: 0
    }
  }
})

class BannerBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dragging: false,
      configs: null
    }
  }

  componentWillMount() {
    // Support to versions
    let fullWidth = false
    let paddingTop = 0
    let paddingBottom = 0
    let heightBanner = 0
    let heightBannerMobile = 0
    let configs = this.props.configs

    if (this.props.configs.banners === undefined) {
      configs = {
        fullWidth,
        paddingTop,
        paddingBottom,
        heightBanner,
        heightBannerMobile,
        banners: [
          {
            desktopImage: this.props.configs.banner.main,
            mobileImage: this.props.configs.banner.responsive,
            cta: this.props.configs.cta
          }
        ]
      }
    }

    this.setState({
      configs: configs
    })
  }

  render() {
    const { classes } = this.props
    const settings = {
      dots: true,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 5000,
      speed: 800,
      slidesToShow: 1,
      slidesToScroll: 1,
      swipeToSlide: true,
      arrows: false,
      beforeChange: () => this.setState({ dragging: true }),
      afterChange: () => this.setState({ dragging: false })
    }

    return (
      <>
      {
        (this.state.configs !== null) ?
        <Grid container className={classes.root}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Slider {...settings} className={classes.slider} style={ (this.state.configs.banners.length > 1) ? { marginBottom: 22 } : {} }>
              {
                this.state.configs.banners.map((banner, key) => {
                  if (banner.cta !== null) {
                    return (
                      <a href={banner.cta.link} disabled={this.state.dragging} className={classes.mediaContainer}>
                        <Hidden mdUp>
                          <img
                            className={classes.media}
                            src={banner.mobileImage.url || banner.mobileImage}
                            alt={banner.seoDescription || ''}
                            width={banner.mobileImage.width || ''}
                            height={banner.mobileImage.height || ''}
                          >
                          </img>
                        </Hidden>
                        <Hidden smDown>
                          <img
                            className={classes.media}
                            src={banner.desktopImage.url || banner.desktopImage}
                            alt={banner.seoDescription || ''}
                            width={banner.desktopImage.width || ''}
                            height={banner.desktopImage.height || ''}
                          >
                          </img>
                        </Hidden>
                      </a>
                    )
                  } else {
                    return (
                      <div className={classes.mediaContainer}>
                        <Hidden mdUp>
                          <img
                            className={classes.media}
                            src={banner.mobileImage.url || banner.mobileImage}
                            alt={banner.seoDescription || ''}
                            width={banner.mobileImage.width || ''}
                            height={banner.mobileImage.height || ''}
                          >
                          </img>
                        </Hidden>
                        <Hidden smDown>
                          <img
                            className={classes.media}
                            src={banner.desktopImage.url || banner.desktopImage}
                            alt={banner.seoDescription || ''}
                            width={banner.desktopImage.width || ''}
                            height={banner.desktopImage.height || ''}
                          >
                          </img>
                        </Hidden>
                      </div>
                    )
                  }
                })
              }
            </Slider>
          </Grid>
        </Grid>
        :
        ''
      }
      </>
    )
  }
}

export default compose(
  withStyles(styles)
)(BannerBlock)
