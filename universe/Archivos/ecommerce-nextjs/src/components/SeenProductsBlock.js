import React, { Component } from "react"
import compose from "recompose/compose"

import { withStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import Hidden from "@material-ui/core/Hidden"
import Fab from '@material-ui/core/Fab'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import Utils from "../resources/Utils"
import Slider from "react-slick"
import ProductCard from '../components/ProductCard'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({
  root: {
    backgroundColor: 'white',
    paddingTop: 4,
    paddingBottom: 4,
    height: "auto",
    textAlign: 'center',
    margin: "1.5em 1.5em",
    marginBottom: '2%',
    padding: 16,
    [theme.breakpoints.down('sm')]: {
      marginBottom: '2%',
      padding: 0,
      paddingTop: 4,
      paddingBottom: 0,
    }
  },
  blockTitle: {
    padding: 16,
    fontSize: 20,
    textAlign: 'left',
    fontWeight: 500,
    paddingBottom: 4,
    [theme.breakpoints.down('sm')]: {
      fontSize: 18
    }
  },
  blockDescription: {
    fontSize: 16,
    padding: '0px 16px',
    paddingBottom: 16,
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
  productClass: {
    backgroundColor: 'white', width: '300px!important', marginLeft: 8,
    [theme.breakpoints.down('sm')]: {
      width: '200px!important'
    }
  }
})

const arrowClass = () => ({
  custom: {
    "&.MuiFab-root": {
      backgroundColor: "#fff !important"
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
        style={{ width: 35, height: 30, position: "absolute", right: "8px", top: "40%", transform: "translate(0, -35%)", zIndex: 99, backgroundColor: "#fff" }} >
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
        style={{ width: 35, height: 30, position: "absolute", left: "8px", top: "40%", transform: "translate(0, -50%)", zIndex: 99, backgroundColor: "#fff" }} >
        <KeyboardArrowLeft />
      </Fab>
    </Hidden>
  )
}

class SeenProductsBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 0,
      size: 15,
      loading: false,
      empty: false,
      openStoryModal: false,
      story: null,
      dragging: false,
      products: [],
      error: false,
      link: ''
    }

    this.getProducts = this.getProducts.bind(this)
    this.getQuery = this.getQuery.bind(this)
    this.getRecomendation = this.getRecomendation.bind(this)
  }

  async getProducts() {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: `/seen/products`
    })
    if (response) {
      if (response.status === 200) {
        if (response.data !== undefined) {
          this.setState({
            products: response.data,
            error: false
          })
        }
      } else {
        this.setState({
          error: true
        })
      }
    } else {
      this.setState({
        error: true
      })
    }
  }
  async getRecomendation() {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: `/recomendation/products`
    })

    if (response) {
      if (response.status === 200) {
        if (response.data !== undefined) {
          this.setState({
            products: response.data,
            error: false
          })
        }
      } else {
        this.setState({
          error: true
        })
      }
    } else {
      this.setState({
        error: true
      })
    }
  }

  async getQuery(query) {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'POST',
      resource: 'users',
      endpoint: '/products/query',
      data: {
        query: query
      }
    })
    
    if (response.status === 200) {
      this.setState({
        products: response.data,
        error: false
      })
    } else {
      this.setState({
        error: true
      })
    }
  }
  async componentWillMount() {
    if (this.props.seenProducts) {
      await this.getProducts()
    } else if (this.props.recomendation) {
      await this.getRecomendation()
    }
    else if (this.props.query) {
      await this.getQuery(this.props.configs.query)
    }
  }

  render() {
    const { classes } = this.props
    const settings = {
      infinite: false,
      speed: 100,
      slidesToShow: 1,
      swipeToSlide: true,
      variableWidth: true,
      nextArrow: <NextArrow />,
      prevArrow: <PreviousArrow />,
      beforeChange: () => this.setState({ dragging: true }),
      afterChange: () => this.setState({ dragging: false })
    }

    return (
      <>
        {
          (this.state.products.length > 0 && !this.state.error) ?
            <div className={classes.root}>
              <Typography variant="h4" className={classes.blockTitle}>{this.props.title}</Typography>
              {
                (this.props.description !== undefined) ?
                <Typography variant="h4" className={classes.blockDescription}>{this.props.description}</Typography>
                :
                ''
              }
              <Slider {...settings} className={classes.slider}>
                {
                  this.state.products.map((product, index) => {
                    return (
                      <div className={classes.productClass} style={{boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.12)'}} >
                        <ProductCard
                          data={product}
                          configs={this.props.configs}
                        />
                      </div>
                    )
                  })
                }
              </Slider>
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
)(SeenProductsBlock)
