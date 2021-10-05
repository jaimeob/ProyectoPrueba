'use strict'

import React, { Component } from "react"
import compose from "recompose/compose"
import { withStyles } from "@material-ui/core/styles"
import Hidden from "@material-ui/core/Hidden"
import Slider from "react-slick"

const styles = theme => ({
  root: {
    lineHeight: 0,
    display: 'block',
    width: '100%',
    margin: 0,
    padding: 0,
    height: "auto",
    textAlign: 'center',
  },
  slider: {
    "& .slick-slide": {
      margin: "0px 0px"
    },
    "& .slick-list": {
      marginLeft: 0
    }
  },
  mainContainer: {
    width: '70%',
    display: 'inline-block',
    [theme.breakpoints.down('sm')]: {
      float: 'none',
      width: '100%',
      overflow: 'hidden',
      display: 'block',
    }
  },
  secondaryContainerBanner: {
    display: 'inline-block',
    verticalAlign: 'top',
    width: '30%',
    display: 'inline-block',
    [theme.breakpoints.down('sm')]: {
      float: 'none',
      width: '100%',
      display: 'block',
    }
  },
  media: {
    width: '100%',
    height: '5000'
  },
  mediaSecondaryTop: {
    padding: 0,
    margin: 0,
    width: '96%',
    marginBottom: '3%',
    float: 'right',
    [theme.breakpoints.down('sm')]: {
      marginTop: '3%',
      float: 'left',
      width: '48.5%',
      marginRight: '1.5%',
      marginBottom: 0,
      display: 'inline-block'
    }
  },
  mediaSecondaryBottom: {
    width: '96%',
    float: 'right',
    [theme.breakpoints.down('sm')]: {
      marginTop: '3%',
      float: 'none',
      width: '48.5%',
      marginLeft: '1.5%',
      display: 'inline-block'
    }
  }
})

class BannerGridBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      configs: null,
      dragging: false
    }
  }

  componentWillMount() {
    // Support to versions
    let paddingTop = 0
    let paddingBottom = 0
    let heightBanner = 600
    let gridBannerMobile = false
    let configs = this.props.configs

    if (this.props.configs.totalSize === undefined) {
      configs = {
        gridBannerMobile,
        paddingTop,
        paddingBottom,
        heightBanner,
        banners: [],
        secondaryTopBanner: {
          desktopImage: this.props.configs.fixes[0].image,
          mobileImage: this.props.configs.fixes[0].image,
          cta: this.props.configs.fixes[0].cta
        },
        secondaryBottomBanner: {
          desktopImage: this.props.configs.fixes[1].image,
          mobileImage: this.props.configs.fixes[1].image,
          cta: this.props.configs.fixes[1].cta
        }
      }

      configs.banners.forEach(banner => {
        configs.banners.push({
          desktopImage: banner.image,
          mobileImage: banner.image,
          cta: banner.cta
        })
      })
    }

    this.setState({
      height: configs.heightBanner,
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
            <div className={classes.root}>
              <div className={classes.mainContainer}>
                <Slider {...settings} className={classes.slider} style={ (this.state.configs.banners.length > 1) ? { marginBottom: 22 } : {} }>
                  {
                    this.state.configs.banners.map((banner, key) => {
                      if (banner.cta !== null) {
                        return (
                          <a key={key} href={banner.cta.link} disabled={this.state.dragging}>
                            <Hidden mdUp>
                              <img
                                className={classes.media}
                                src={banner.mobileImage.url || banner.mobileImage}
                                alt={banner.seoDescription || ''}
                                height={banner.height}
                                width={banner.width}
                              />
                            </Hidden>
                            <Hidden smDown>
                              <img
                                className={classes.media}
                                src={banner.desktopImage.url || banner.desktopImage}
                                alt={banner.seoDescription || ''}
                                height={banner.height}
                                width={banner.width}
                              />
                            </Hidden>
                          </a>
                        )
                      } else {
                        return (
                          <div>
                            <Hidden mdUp>
                              <img
                                className={classes.media}
                                src={banner.mobileImage.url || banner.mobileImage}
                                alt={banner.seoDescription || ''}
                                height={banner.height}
                                width={banner.width}
                              />
                            </Hidden>
                            <Hidden smDown>
                              <img
                                className={classes.media}
                                src={banner.desktopImage.url || banner.desktopImage}
                                alt={banner.seoDescription || ''}
                                height={banner.height}
                                width={banner.width}
                              />
                            </Hidden>
                          </div>
                        )
                      }
                    })
                  }
                </Slider>
              </div>
              <div className={classes.secondaryContainerBanner}>
                <div>
                {
                  (this.state.configs.secondaryTopBanner.cta !== null) ?
                    <a href={this.state.configs.secondaryTopBanner.cta.link} disabled={this.state.dragging}>
                      <Hidden mdUp>
                        <img
                          className={classes.mediaSecondaryTop}
                          src={this.state.configs.secondaryTopBanner.mobileImage.url || this.state.configs.secondaryTopBanner.mobileImage}
                          alt={this.state.configs.secondaryTopBanner.seoDescription || ''}
                        />
                      </Hidden>
                      <Hidden smDown>
                        <img
                          className={classes.mediaSecondaryTop}
                          src={this.state.configs.secondaryTopBanner.desktopImage.url || this.state.configs.secondaryTopBanner.desktopImage}
                          alt={this.state.configs.secondaryTopBanner.seoDescription || ''}
                        />
                      </Hidden>
                    </a>
                    :
                    <div>
                      <Hidden mdUp>
                        <img
                          className={classes.mediaSecondaryTop}
                          src={this.state.configs.secondaryTopBanner.mobileImage.url || this.state.configs.secondaryTopBanner.mobileImage}
                          alt={this.state.configs.secondaryTopBanner.seoDescription || ''}
                        />
                      </Hidden>
                      <Hidden smDown>
                        <img
                          className={classes.mediaSecondaryTop}
                          src={this.state.configs.secondaryTopBanner.desktopImage.url || this.state.configs.secondaryTopBanner.desktopImage}
                          alt={this.state.configs.secondaryTopBanner.seoDescription || ''}
                        />
                      </Hidden>
                    </div>
                }
                </div>
                <div>
                {
                  (this.state.configs.secondaryBottomBanner.cta !== null) ?
                    <a href={this.state.configs.secondaryBottomBanner.cta.link} disabled={this.state.dragging}>
                      <Hidden mdUp>
                        <img
                          className={classes.mediaSecondaryBottom}
                          src={this.state.configs.secondaryBottomBanner.mobileImage.url || this.state.configs.secondaryBottomBanner.mobileImage}
                          alt={this.state.configs.secondaryBottomBanner.seoDescription || ''}
                        />
                      </Hidden>
                      <Hidden smDown>
                        <img
                          className={classes.mediaSecondaryBottom}
                          src={this.state.configs.secondaryBottomBanner.desktopImage.url || this.state.configs.secondaryBottomBanner.desktopImage}
                          alt={this.state.configs.secondaryBottomBanner.seoDescription || ''}
                        />
                      </Hidden>
                    </a>
                    :
                    <div>
                      <Hidden mdUp>
                        <img
                          className={classes.mediaSecondaryBottom}
                          src={this.state.configs.secondaryBottomBanner.mobileImage.url || this.state.configs.secondaryBottomBanner.mobileImage}
                          alt={this.state.configs.secondaryBottomBanner.seoDescription || ''}
                        />
                      </Hidden>
                      <Hidden smDown>
                        <img
                          className={classes.mediaSecondaryBottom}
                          src={this.state.configs.secondaryBottomBanner.desktopImage.url || this.state.configs.secondaryBottomBanner.desktopImage}
                          alt={this.state.configs.secondaryBottomBanner.seoDescription || ''}
                        />
                      </Hidden>
                    </div>
                }
                </div>
              </div>
            </div>
            :
            ''
        }
      </>
    )
  }
}

export default compose(
  withStyles(styles)
)(BannerGridBlock)
