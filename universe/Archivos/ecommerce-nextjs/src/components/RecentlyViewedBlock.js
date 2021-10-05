import React, { Component } from "react";
import compose from "recompose/compose";
import { withRouter } from "react-router-dom";

import { withStyles, withTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Fab from '@material-ui/core/Fab';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import { getDataAPI } from "../api/CRUD";
import Utils from "../resources/Utils";

import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import ProductCardBlock from "./ProductCardBlock";

const styles = theme => ({
  root: {
    margin: "3em 1.5em",
    height: "auto"
  },
  blockTitle: {
    fontSize: 32,
    fontWeight: 400
  },
  slider: {
    height: "auto",
    "& .slick-slide": {
      margin: "0px 10px"
    },
    "& .slick-list": {
      paddingLeft: "1em",
      paddingTop: "1.5em",
      paddingBottom: "1.5em",
      margin: "0px -10px"
    }
  },
  item: {
    padding: "2em auto !important"
  }
});

const arrowClass = () => ({
  custom:{
    "&.MuiFab-root":{
      backgroundColor:"#fff !important"
    }
  }
})

function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <Fab 
      onClick={onClick}
      size="small"
      style={{ position:"absolute",right:"10px",top:"50%",transform: "translate(0, -50%)",zIndex:99,backgroundColor:"#fff"}} >
           <KeyboardArrowRight />
    </Fab>
  );
}
function PreviousArrow(props) {
  const { className, style, onClick } = props;
  return (
    <Fab
      onClick={onClick}
      className={arrowClass.custom} 
      size="small"
      style={{ position:"absolute",left:"10px",top:"50%",transform: "translate(0, -50%)",zIndex:99, backgroundColor:"#fff"}} >
           <KeyboardArrowLeft />
    </Fab>
  );
}

class RecentlyViewedBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      page: 0,
      size: 15,
      loading: false,
      empty: false
    };
    this.getProducts = this.getProducts.bind(this);
  }
  async componentDidMount() {
    // await this.getProducts();
  }

  async getProducts() {
    let metadata = await Utils.getMetadata();
    this.setState({ loading: true });
    let response = await getDataAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: `products/getRecentlyViewed`,
      filters: `{}&page=${this.state.page}&size=${this.state.size}${
        metadata.user ? "&token=" + metadata.user.token : ""
      }&ip=${metadata.ip}`
    });
    if (response.status !== 200) response.data = [];
    if (response.data.length === 0) this.setState({ empty: true });
    let page = this.state.page + 1;
    this.setState({
      loading: false,
      products: this.state.products.concat(response.data),
      page,
      dragging:false
    });
  }

  render() {
    const { classes } = this.props;
    let dragging = false;
    const settings = {
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      swipeToSlide: true,
      variableWidth: true,
      nextArrow: <NextArrow />,
      prevArrow:<PreviousArrow/>,
      beforeChange: () => this.setState({dragging:true}),
      afterChange: async index => {
        this.setState({dragging:false})
        if (index >= this.state.products.length - 6) {
          if (this.state.empty) return;
          await this.getProducts();
        }
      }
    };
    return (
      <div className={classes.root}>
      <Typography variant="h2" className={classes.blockTitle}>Vistos recientemente.</Typography>
        <Slider {...settings} className={classes.slider}>
          {this.state.products.map((product, key) => {
            return (
              <ProductCardBlock
                key={key}
                className={classes.item}
                price={product.price}
                discount={product.discount}
                image={product.image}
                name={product.product}
                brand={product.brand}
                sku={product.sku}
                dragging = {this.state.dragging}
                onClick={(e)=> dragging && e.stopPropagation()}/>
            );
          })}
          {(this.state.loading)? <ProductCardBlock loading={true}/> : null}
        </Slider>
      </div>
    );
  }
}

export default compose(
  withRouter,
  
  withStyles(styles)
)(RecentlyViewedBlock);
