import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'


// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Paper, Button, Hidden, Radio, Collapse, GridList } from '@material-ui/core'

// Components
import { requestAPI } from '../api/CRUD'
import Line from './Line'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({
  imgContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'

  },

  description: {
    color: '#212222'

  },
  blueButton: {
    background: 'none',
    border: 'none',
    color: '#006fb9',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '0px',
    padding: '0px',
    [theme.breakpoints.down("sm")]: {
      fontSize: '14px'

    }
  },
  containerItemSelected: {
    margin: '5px',
    padding: '16px 16px 16px',
    borderRadius: '4px',
    border: 'solid 1px rgba(0, 131, 224, 0.35)',
    background: '#f7f8f9',
  },
  containerItem: {
    margin: '5px',
    padding: '16px 16px 16px',
    borderRadius: '4px',
    background: '#f7f8f9',
  },





  card: {
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      boxShadow: '0 -1px 2px 0 rgba(0, 0, 0, 0.1)',
    }
  },
  line: {
    margin: '7.5px 0 15.5px 0px',
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

})

class ItemCheckout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      seeDetail: true,
      firstResponsive: true,
      totalProducts: null,
      shippingMethod: null,
      subtotal: null,
      total: null,
      paymentMethodImages: [
        {
          id: 1,
          images: [
            '/visa.svg',
            '/mastercard.svg',
            '/bbva.svg'
          ]
        },
        {
          id: 2,
          images: ['/credivale.svg']
        },
        {
          id: 3,
          images: ['/oxxo.svg']
        },

        {
          id: 4,
          images: [
            '/paypal.svg'
          ]

        },
        {
          id: 10,
          images: ['https://www.paynet.com.mx/img/logo_header.png']
        },
        {
          id: 11,
          images: ['https://www.codi.org.mx/img/LogText.png']
        }

      ]



    }

    this.handleChangeDetail = this.handleChangeDetail.bind(this)
    this.getImageByCardType = this.getImageByCardType.bind(this)
    this.getImageByPaymentMethod = this.getImageByPaymentMethod.bind(this)

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
  getImageByCardType(cardType) {
    if (cardType === 'visa') {
      return '/visa.svg'
    } else if (cardType === 'mastercard') {
      return '/mastercard.svg'
    } else {
      return '/amex.svg'
    }
  }
  getImageByPaymentMethod(type) {
    let image = null
    if (this.state.paymentMethodImages.some((element) => element.id === Number(type))) {
      let foundIndex = this.state.paymentMethodImages.findIndex(element => element.id == Number(type))
      image = this.state.paymentMethodImages[foundIndex].images[0]
    } 

    return image



  }


  render() {
    const { classes } = this.props

    return (
      <div>
        {/* Contenido */}
        <Grid container>
          {
            (this.props.image) ?
              <Grid item xs={2} className={classes.imgContainer} >
                {
                  (this.props.card) ?
                    // Cards image
                    <img style={{ height: 16, marginRight: 16 }} src={this.getImageByCardType(this.props.type)} />
                    :
                    (this.props.paymentMethod) ?
                      // Paymentmethods image
                      <img style={{ height: 16, marginRight: 16 }} src={this.getImageByPaymentMethod(this.props.id)} />
                      :
                      ''
                }
              </Grid>
              :
              ''
          }
          <Grid item xs={(this.props.image) ? 9 : 11} style={(this.props.description !== undefined && this.props.description !== null) ? {} : { display: 'flex', alignItems: 'center' }}  >
            <Grid container  >
              <Grid item xs={12} >
                <Typography className={classes.title} >{this.props.name}</Typography>
              </Grid>
              {
                (this.props.description !== undefined && this.props.description !== null) ?
                  <Grid item xs={12}>
                    <Typography variant='body2' className={classes.title} >{this.props.description}</Typography>
                  </Grid>
                  :
                  ''
              }
            </Grid>

          </Grid>

          <Grid item xs={1}>
            <Radio
              checked={this.props.selected}
              color="primary"
              onChange={this.props.selectedFunction}
              value="b"
              name="radio-button-demo"
              aria-label="B"
            />
          </Grid>

        </Grid>
        {/* Check */}


      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(ItemCheckout)
