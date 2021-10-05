import React, { Component } from "react"
import compose from "recompose/compose"
import { withRouter, Link } from "react-router-dom"

import { withStyles, withTheme } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import Hidden from "@material-ui/core/Hidden"
import Fab from '@material-ui/core/Fab'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'

import Utils from "../resources/Utils"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css";

import "slick-carousel/slick/slick-theme.css";

const styles = theme => ({
  root: {
    backgroundColor: 'white',
    paddingTop: 4,
    paddingBottom: 4,
    height: "auto",
    textAlign: 'center',
    margin: "1.5em 1.5em",
    padding: 16,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      marginBottom: '0.3em',
      padding: 0,
      paddingTop: 4,
      paddingBottom: 0,
    }
  },
  blockTitle: {
    padding: 16,
    fontSize: 12,
    textAlign: 'left',
    fontWeight: 500,
    paddingBottom: 4,
    [theme.breakpoints.down('sm')]: {
      fontSize: 12
    }
  },
  blockDescription: {
    fontSize: 10,
    padding: '0px 16px',
    paddingBottom: 10,
    lineHeight: 1.0,
    textAlign: 'left'
  },
  slider: {
    height: "auto",
    "& .slick-slide": {
      margin: "0px 0px"
    },
    "& .slick-list": {
      paddingLeft: "1em",
      paddingTop: "0.5em",
      paddingBottom: "0.5em",
      marginLeft: 0
    }
  },
  item: {
    padding: "0em auto !important"
  },
  storyContainer: {
    textAlign: 'center',
    'object-fit': 'cover',
    width: 200,
    padding: 0,
    margin: '0 auto',
    marginRight: 8,
    [theme.breakpoints.down('sm')]: {
      width: 200
    }
  },
  imageStory: {
    textAlign: 'center',
    margin: '0 auto',
    width: 50,
    height: 'auto',
    padding: 0,
    [theme.breakpoints.down('sm')]: {
      width: 50
    }
  },
  storyTitleItem: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: 400,
    [theme.breakpoints.down('sm')]: {
      fontSize: 12
    }
  }
})

const arrowClass = () => ({
  custom:{
    "&.MuiFab-root":{
      backgroundColor:"#fff !important"
    }
  }
})

function NextArrow(props) {
  const { onClick } = props
  return (
    <Hidden smDown>
      <Fab 
        onClick={onClick}
        size="small"
        style={{ width: 35, height: 30, position:"absolute",right:"8px",top:"40%",transform: "translate(0, -35%)",zIndex:99,backgroundColor:"#fff"}} >
           <KeyboardArrowRight />
      </Fab>
    </Hidden>
  )
}

function PreviousArrow(props) {
  const { onClick } = props
  return (
    <Hidden smDown>
      <Fab
        onClick={onClick}
        className={arrowClass.custom} 
        size="small"
        style={{ width: 35, height: 30, position:"absolute",left:"8px",top:"40%",transform: "translate(0, -50%)",zIndex:99, backgroundColor:"#fff"}} >
            <KeyboardArrowLeft />
      </Fab>
    </Hidden>
  )
}

class StoryBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      products: [],
      page: 0,
      size: 15,
      loading: false,
      empty: false,
      configs: {},
      stories: [],
      openStoryModal: false,
      story: null
    }
  }

  async componentWillMount() {
    this.setState({
      configs: this.props.configs,
      stories: this.props.configs.stories
    })
  }

  render() {
    const { classes } = this.props
    let dragging = false
    const settings = {
      infinite: true,
      speed: 100,
      slidesToShow: 1,
      swipeToSlide: true,
      variableWidth: true,
      nextArrow: <NextArrow />,
      prevArrow: <PreviousArrow/>,
      beforeChange: () => this.setState({ dragging: true }),
      afterChange: () => this.setState({ dragging: false })
    }

    return (
      <div className={classes.root}>
        {
          (!Utils.isEmpty(this.state.configs.title)) ?
          <Typography variant="h4" className={classes.blockTitle}>{this.state.configs.title}</Typography>
          :
          ''
        }
        {
          (!Utils.isEmpty(this.state.configs.description)) ?
          <Typography variant="body1" className={classes.blockDescription}>{this.state.configs.description}</Typography>
          :
          ''
        }
        <Slider {...settings} className={classes.slider}>
          {
            this.state.stories.map((story, key) => {
              return (
                <div className={classes.storyContainer}>
                  <img className={classes.imageStory} src={story.cover} />
                  {
                    (!Utils.isEmpty(story.title)) ?
                    <Typography variant="h4" className={classes.storyTitleItem} >{story.title}</Typography>
                    :
                    ''
                  }
                  {
                    (!Utils.isEmpty(story.description)) ?
                    <Hidden smDown>
                      <Typography variant="body1" style={{ fontSize: 11, lineHeight: 1.0, marginTop: 4, fontWeight: 100 }}>{story.description}</Typography>
                    </Hidden>
                    :
                    ''
                  }
                </div>
              )
            })
          }
        </Slider>
        {/*
        <div style={{ textAlign: 'center', paddingBottom: 8 }}>
          <Link to=""><span style={{ fontSize: 14, fontWeight: 400 }}>Ver más</span></Link>
        </div>
        */}
      </div>
    )
  }
}

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles)
)(StoryBlock)
