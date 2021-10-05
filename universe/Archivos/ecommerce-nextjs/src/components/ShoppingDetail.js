import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'


// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Paper, Hidden, Collapse } from '@material-ui/core'

// Components
import { requestAPI } from '../api/CRUD'
import Line from './Line'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({
  blueButton: {
    width: '100%',
    height: '44px',
    padding: '10px 39px 11px',
    borderRadius: '4px',
    backgroundColor: '#22397c',
    cursor: 'pointer',
    color: '#ffffff',
    border: 'none',
    display: 'block',
    fontSize: '16px',
    marginLeft: 'auto',
    marginTop: '15px',
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px'

    }
  },
  card: {
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      boxShadow: '0 -1px 2px 0 rgba(0, 0, 0, 0.1)',
    }
  },
  details: {
    background: 'none',
    border: 'none',
    color: '#006fb9',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0px'
  },
  line: {
    margin: '7.5px 0 15.5px 0px',
  },
  shippingCostGreen: {
    color: '#0abd3e',
    fontSize: '16px',
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px',
    }
  },
  shippingCost: {
    color: 'black',
    fontSize: '16px',
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px',
    }
  },
  spaceBottom: {
    marginBottom: '10px',
    [theme.breakpoints.down("sm")]: {
      marginBottom: '0px',
    }
  },
  subtotal: {
    fontSize: '16px',
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px',
    }
  },
  title: {
    color: '#111110',
    fontSize: '16px'
  },
  total: {
    fontSize: '22px',
    [theme.breakpoints.down("sm")]: {
      fontSize: '16px',
    }
  }
})

class ProductCart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      seeDetail: true,
      firstResponsive: true,
      totalProducts: null,
      shippingMethod: null,
      subtotal: null,
      total: null,
    }

    this.handleChangeDetail = this.handleChangeDetail.bind(this)
  }

  handleChangeDetail() {
    this.setState({ seeDetail: !this.state.seeDetail })
  }
  resize() {
    if (window.innerWidth > 960) {
      this.setState({ seeDetail: true, firstResponsive: true })
    } else if (this.state.firstResponsive) {
      this.setState({ seeDetail: false, firstResponsive: false })
    }
  }
  componentWillMount() {
    window.addEventListener("resize", this.resize.bind(this))
    this.resize()
    if (this.props !== undefined && this.props.data !== undefined) {
      this.setState({
        totalProducts: this.props.shoppingCart.count,
        total: this.props.data.total,
        subtotal: this.props.data.subtotal,
        shippingMethod: this.props.data.shippingMethod
      })
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.resize.bind(this))
  }

  render() {
    const { classes } = this.props

    return (
      <div>
        <Paper elevation={0} className={classes.card}>
          <Grid container >
            <Hidden smDown>
              {/* Desktop */}
              <Grid item xs={12}>
                <Typography className={classes.title} >Resumen de compra</Typography>
              </Grid>

              <Grid item xs={12}>
                <div className={classes.line} >
                  <Line color={'yellow'} />
                </div>
              </Grid>
            </Hidden>

            <Hidden mdUp>
              {/* Responsive */}
              <Grid container >
                <Grid item xs={6}>
                  <Typography className={classes.total} >Total</Typography>
                </Grid>

                <Grid item xs={6}>
                  {/* <Typography align='right' className={classes.total}>${this.state.total}</Typography> */}
                  <Typography align='right' className={classes.total}>${Utils.numberWithCommas(this.props.shoppingCart.priceInformation.total.toFixed(0))}</Typography>


                </Grid>
                <Grid item xs={12}>
                  <button onClick={() => { this.handleChangeDetail() }} className={classes.details} >Ver detalles</button>
                </Grid>
              </Grid>
            </Hidden>

            <Collapse in={this.state.seeDetail} style={{ width: '100%' }}>
              <Grid container >
                <Grid className={classes.spaceBottom} item sm={6} xs={10}>
                  <Typography className={classes.subtotal} >Subtotal ({this.props.shoppingCart.count} producto{(this.props.shoppingCart.count > 1) ? 's' : ''})</Typography>
                </Grid>

                <Grid item sm={6} xs={2}>

                  <Typography align='right' className={classes.subtotal}>${Utils.numberWithCommas(this.props.shoppingCart.priceInformation.subtotal.toFixed(0))}</Typography>
                </Grid>
              </Grid>

              <Grid className={classes.spaceBottom} container >
                <Grid item sm={6} xs={10}>
                  <Typography className={classes.subtotal} >Costo de envío</Typography>
                </Grid>

                <Grid item sm={6} xs={2}>
                  <Typography align='right' className={(Number(this.props.shoppingCart.priceInformation.shippingMethod.shippingCost) === 0) ? classes.shippingCostGreen : classes.shippingCost}>{(Number(this.props.shoppingCart.priceInformation.shippingMethod.shippingCost) === 0) ? 'Gratis' : '$' + this.props.shoppingCart.priceInformation.shippingMethod.shippingCost}</Typography>
                </Grid>
              </Grid>
            </Collapse>

            <Hidden smDown>
              {/* Desktop */}
              <Grid className={classes.spaceBottom} item xs={12}>
                <Line color={'gray'} />
              </Grid>
              <Grid container >
                <Grid item xs={6}>
                  <Typography className={classes.total} >Total</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography align='right' className={classes.total}>${Utils.numberWithCommas(this.props.shoppingCart.priceInformation.total.toFixed(0))}</Typography>

                </Grid>
              </Grid>
            </Hidden>

          </Grid>
          <button variant="contained" disableRipple color="primary" className={classes.blueButton}
            onClick={ (this.props.buttonFunction === undefined)? () => { Router.push(Utils.constants.paths.checkout) } : this.props.buttonFunction }>
            {
              (this.props.buttonName === undefined)?
                'Continuar con la compra'
                :
                this.props.buttonName

            }
          </button>
        </Paper>


      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(ProductCart)
