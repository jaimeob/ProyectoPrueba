import React, { Component } from "react";
import compose from "recompose/compose";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";

import Utils from "../resources/Utils.js";

import { withStyles, withTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import HeartIcon from "../resources/images/icn-heart.svg";
import HeartOutlineIcon from "../resources/images/icn-heart-outline.svg";
import { CircularProgress } from "@material-ui/core";

const styles = theme => ({
  rootCard: {
    position:"relative",
    width: "200px",
    height: "220px",
    padding: "10px",
    boxShadow: "0px 8px 16px 0px rgba(196,196,196, 0.5)",
    "&:hover":{
        boxShadow:"none",
        transition:"all 0.2s"
    },
    borderRadius: "15px",
    background: "#FFF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
    transition:"all 0.2s",
  },
  heartIcon: {
    alignSelf: "flex-end",
    width: "20px",
    height: "20px"
  },
  image: {
    width: "200px",
    alignSelf: "center"
  },
  productInfo: {
    display: "flex",
    flexDirection: "column"
  },
  textBlock: {
    alignSelf: "flex-start",
    display: "flex",
    flexDirection: "column"
  },
  productName: {
    color: "rgba(0,0,0,0.4)",
    fontSize: "0.6em",
    fontWeight: "500"
  },
  brandName: {
    color: "rgba(0,0,0)",
    fontSize: "1em",
    fontWeight: "600"
  },
  priceBlock: {
    display: "flex",
    flexDirection: "row"
  },
  realPrice: {
    color: "#EA2027",
    textDecoration: "line-through",
    fontWeight: "500",
    fontSize: "1.1em"
  },
  price: {
    color: "#283a78",
    fontWeight: "600",
    fontSize: "1.1em"
  },
  progress:{
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)"
  }
});

class ProductCardBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      liked: false
    };
    this.handleLikeClick = this.handleLikeClick.bind(this);
    this.handleClick = this.handleClick.bind(this);

  }

  handleLikeClick(e) {
    this.setState({ liked: !this.state.liked });
    e.stopPropagation();
  }
  
  handleClick(){
      if(this.props.dragging) return;
    this.props.history.push(Utils.generateURL(this.props.name,this.props.sku));
  }
  render() {
    const { classes } = this.props;
    return (
        (!this.props.loading) ? (
      <div className={classes.rootCard} onClick={this.handleClick}>
        <img
          src={this.state.liked ? HeartIcon : HeartOutlineIcon}
          alt=""
          className={classes.heartIcon}
          onClick={this.handleLikeClick}
        />
          <div className={classes.productInfo} >
            <img
              className={classes.image}
              src={Utils.constants.HOST_CDN_AWS + "/normal/" + this.props.image}
              alt=" "
            ></img>
            <div className={classes.textBlock}>
            <Typography className={classes.brandName}>
                {this.props.brand} - {this.props.gender}
              </Typography>
              <Typography className={classes.productName}>
                {this.props.name.substring(0, 32)}
              </Typography>
              <span className={classes.priceBlock}>
                {this.props.discount > 0
                  ? [
                      <Typography className={classes.realPrice}>
                        $ { Utils.numberWithCommas((Number(this.props.price).toFixed(2))) }
                      </Typography>,
                      <span>&nbsp;&nbsp;</span>
                    ]
                  : null}
                <Typography className={classes.price}>
                  $ {Utils.numberWithCommas((this.props.price - this.props.discount).toFixed(2))}
                </Typography>
              </span>
            </div>
          </div>
      </div>) : (<div className={classes.rootCard}><span className={classes.progress}><CircularProgress /></span></div>)
    );
  }
}

export default compose(
  withRouter,
  
  withStyles(styles)
)(ProductCardBlock);
