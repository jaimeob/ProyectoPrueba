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
  media: {
    width: '100%',
    height: 'auto'
  },
  slider: {
    height: "auto",
    marginBottom: 44,
    "& .slick-slide": {
      margin: "0px 0px"
    },
    "& .slick-list": {
      marginLeft: 0
    }
  }
})

class MobilePhotos extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dragging: false,
      photos: this.props.photos
    }
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
        (this.state.photos.length > 0) ?
        <Grid container className={classes.root}>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Slider {...settings} className={classes.slider}>
              {
                this.state.photos.map((photo, key) => {
                  return (
                    <img
                      className={classes.media}
                      src={photo.url}
                      alt={photo.description}
                      width={photo.width}
                      height={photo.height}
                    />
                  )
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
)(MobilePhotos)
