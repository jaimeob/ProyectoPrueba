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
    fontSize: '13px',
    marginLeft: 'auto',
    marginTop: '15px',
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px'

    }
  },
  greenButton: {
    width: '100%',
    height: '44px',
    padding: '10px 39px 11px',
    borderRadius: '4px',
    backgroundColor: '#57aa64',
    cursor: 'pointer',
    color: 'white',
    border: 'none',
    display: 'block',
    fontSize: '13px',
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
    fontSize: '18px',
    fontWeight: '600',
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px',
    }
  },
  title: {
    color: 'black',
    fontSize: '25px',
    fontWeight: '600'
  },
  total: {
    fontSize: '14px',
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
          {
            (!this.props.loading) ?
              <Grid container>
                <Hidden smDown>
                  {/* Desktop */}
                  <Grid item xs={12}>
                    <Typography className={classes.title} >Resumen</Typography>
                  </Grid>
                </Hidden>

                <Grid item xs={12}>
                  <Typography className={classes.total} >Total de productos: <span style={{ fontWeight: '600' }} >{this.props.shoppingCart.count}</span> </Typography>
                </Grid>
                {
                  (this.props.shoppingCart.priceInformation.shippingCost) ?
                    <Grid item xs={12}>
                      <Typography className={classes.total} >Costo de envío: $<span style={{ fontWeight: '600' }} >{Utils.numberWithCommas(this.props.shoppingCart.priceInformation.shippingCost)}</span> </Typography>
                    </Grid>
                    :
                    ''
                }

                <Grid item xs={12}>
                  <Typography className={classes.subtotal} >Total: ${Utils.numberWithCommas(this.props.shoppingCart.priceInformation.total.toFixed(0))} </Typography>
                </Grid>

              </Grid>
              :
              ''
          }
          <button variant="contained" disableRipple color="primary" className={(!this.props.confirmation) ? classes.blueButton : classes.greenButton}
            onClick={(this.props.buttonFunction === undefined) ? () => { this.props.action() } : this.props.action()}>
            {
              (this.props.buttonName === undefined) ?
                'Continuar'
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
