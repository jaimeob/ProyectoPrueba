'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Typography, Paper, Grid } from '@material-ui/core'
import { requestAPI } from '../api/CRUD'

// Utils
import Utils from '../resources/Utils'
import Tag from './Tag'

const styles = theme => ({
  card: {
    //padding: theme.spacing(1),
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    paddingBottom: '16px',
    borderRadius: '4px',
  },
  informationContainer: {
    paddingLeft: '24px',
    paddingRight: '24px',
    margin: '0 auto',
    width: '100%',
    [theme.breakpoints.down("xs")]: {
      width: '100%!important',
    }
  },
  itemPrice: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#22397c',
  },
  itemPriceTachado: {
    fontSize: '15px',
    fontWeight: 'normal',
    textDecoration: 'line-through',
    color: '#808080'
  },
  productName: {
    fontSize: 14,
    color: '#111110',
    lineHeight: '1.5em',
    height: '3em',
    overflow: 'hidden',
    //whiteSpace: 'nowrap',
    //textOverflow: 'ellipsis',
    width: '100%',
    // overflow: 'hidden',
    // //width: '200px',
    // //width: '97%',
    // //textOverflow: 'ellipsis', 
    // whiteSpace: 'nowrap',
    // [theme.breakpoints.down("xs")]: {
    //   width: '100%!important',
    // }
  },
  quincenas: {
    fontSize: '12px',
    fontWeight: 'normal',
    color: '#68686a',
  }
})

class ProductCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      user: null,
      imageWorking: true,
      selected: false,
      uuidCAPIFacebook: null,
      selectedPhoto: (this.props.data.photos.length === 0) ? 'placeholder.svg' : Utils.constants.HOST_CDN_AWS + "/normal/" + this.props.data.photos[0].description,
      withInformation: (this.props.configs !== undefined) ? this.props.configs.withInformation : true
    }

    this.getSizesRange = this.getSizesRange.bind(this)
    this.getSubtitle = this.getSubtitle.bind(this)
    this.changePhoto = this.changePhoto.bind(this)
  }


  changePhoto(status) {
    if (status === 0) {
      if (this.props.data.photos.length === 0) {
        this.setState({
          selectedPhoto: 'placeholder.svg'
        })
      } else {
        this.setState({
          selectedPhoto: Utils.constants.HOST_CDN_AWS + "/normal/" + this.props.data.photos[0].description
        })
      }
    } else {
      if (this.props.data.photos.length === 0) {
        this.setState({
          selectedPhoto: 'placeholder.svg'
        })
      } else {
        let random = Math.floor(Math.random() * this.props.data.photos.length)
        let photo = this.props.data.photos[random]
        if (this.props.data.photos.length > 1 && random === 0) {
          photo = this.props.data.photos[1]
        }
        this.setState({
          selectedPhoto: Utils.constants.HOST_CDN_AWS + "/normal/" + photo.description
        })
      }
    }
  }

  getSubtitle(product) {
    let string = ''
    if (!Utils.isEmpty(this.getSizesRange(product))) {
      string = this.getSizesRange(product)
    }

    if (product.gender !== undefined && product.gender.description !== undefined && product.gender.description !== null && !Utils.isEmpty(product.gender.description)) {
      if (!Utils.isEmpty(string)) {
        string = product.gender.description + ' (' + string + ')'
      }
      else {
        string = product.gender.description
      }
    }
    return string
  }

  getSizesRange(product) {
    let sizes = product.sizes
    let string = ''
    if (sizes.length >= 2) {
      string = sizes[0] + ' - ' + sizes[sizes.length - 1]
    }
    return string
  }

  async componentWillMount() {
    let uuidActual = this.props.app.data.uuid
    if (uuidActual !== null) {
      this.setState({
        uuidCAPIFacebook: uuidActual
      })
    }
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      this.setState({
        user: user
      })
    }
    this.setState({
      //selected: this.props.currentCatalog
      selected: false
    })
  }

  handleChange() {
    if (this.state.selected) {
      //Utils.removeProductFromCatalog(this.props.data)
      this.props.dispatch({ type: 'REMOVE_FROM_CATALOG', product: this.props.data })

      this.setState({
        selected: false
      })
    } else {
      //Utils.addProductToCatalog(this.props.data)
      this.props.dispatch({ type: 'ADD_TO_CATALOG', product: this.props.data })

      this.setState({
        selected: true
      })
    }
    this.props.updateCount()
  }

  render() {
    const { classes } = this.props
    let product = this.props.data
    let styleItem = { width: 'auto' }
    if (this.props.sizeProductCard === 'small') {
      styleItem = { width: 100 }
    } else if (this.props.sizeProductCard === 'normal') {
      styleItem = { width: 280 }
    } else if (this.props.sizeProductCard === 'big') {
      styleItem = { width: 400 }
    }

    let marginTop = 0
    /*
    if (product.percentagePrice > 0 && this.props.app.data.id === 1) {
      marginTop = -63
    }
    */
    return (
      <div className={(!this.state.withInformation) ? classes.itemNoInfo : classes.item} style={styleItem} >
        <a href={product.url}
          onClick={async () => {
            if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
              let dateSending = new Date();
              gtag('event', 'select_content', {
                "content_type": "product",
                "items": [
                  {
                    "id": this.props.data.code,
                    "name": this.props.data.name,
                    "list_name": "CategoryExplorer",
                    "brand": this.props.data.brand.name,
                    "category": this.props.data.categoryCode,
                    "price": this.props.data.price
                  }
                ]
              })

              fbq('track', 'ViewContent', {
                'content_ids': [this.props.data.code],
                'content_name': this.props.data.name,
                'content': [this.props.data],
                'content_type': 'CategoryExplorer',
                'currency': 'MXN',
                'valye': this.props.data.price
              }, { eventID: 'ViewContent' })

              if (this.state.user !== null && this.state.user !== undefined) {

                let eventToFacebook = {
                  "data": [
                    {
                      "event_name": 'ViewContent',
                      'event_time': Utils.timeIntoSeconds(dateSending),
                      'user_data': {
                        'fn': await Utils.hashingData(this.state.user.name),
                        'ln': await Utils.hashingData(this.state.user.secondLastName)
                      },
                      'custom_data': {
                        "content_ids": [this.props.data.code],
                        "content_name": this.props.data.name,
                        'currency': 'MXN',
                        'content_type': 'CategoryExplorer',
                        "value": this.props.data.price
                      },
                      'event_id': 'ViewContent',
                      'action_source': 'website'
                    }
                  ]
                }

                await Utils.sendConversionApiFacebook(eventToFacebook, this.state.uuidCAPIFacebook)
              }
            }
          }}
        >
          <Paper elevation={0} className={classes.card}>
            <Grid container>
              {/*
                (product.percentagePrice > 0 && this.props.app.data.id === 1) ?
                <img src="/hot-sale.svg" style={{ width: 48, height: 48, position: 'relative', float: 'left', display: 'inline-block', marginTop: 16, marginLeft: 16 }}/>
                :
                ''
              */}
              {/* Image */}
              <Grid style={{ height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: marginTop }} item xs={12}>
                {
                  (product.photos.length > 0) ?
                    (this.state.imageWorking) ?
                      // <div className={ (!this.state.withInformation) ? classes.imageContainerNoInfo : classes.imageContainer } style={{ borderRadius: '15px' }} >
                      <img
                        style={{ height: '95%', width: '95%', objectFit: 'contain' }}
                        //className={ }
                        //className={ (!this.state.withInformation) ? classes.itemImageNoInfo : classes.itemImage }
                        src={this.state.selectedPhoto}
                        onMouseOver={() => { this.changePhoto(1) }}
                        onMouseLeave={() => { this.changePhoto(0) }}
                        alt={product.photos[0].description}
                        onError={() => {
                          this.setState({ imageWorking: false })
                        }}
                      />
                      // </div> 
                      :
                      <img
                        style={{ height: '150px', width: '100%' }}
                        src={Utils.getPlaceholderByGender(1)}
                        onMouseOver={() => { this.changePhoto(1) }}
                        onMouseLeave={() => { this.changePhoto(0) }}
                        alt=" " //-----> AlT DE IMAGENES
                      />
                    :
                    ""
                }
              </Grid>
              {/* Name */}
              {
                (this.state.withInformation) ?
                  <>
                    {/* Tag */}
                    {
                      (product.percentagePrice > 0) ?
                        <Grid item xs={5} style={{ margin: 4, marginLeft: 8, marginBottom: 12, marginTop: -36 }}>
                          <Tag name={'Oferta ' + Utils.numberWithCommas(product.percentagePrice) + '%'} text={'offerText'} container={'offerRectangle'} />
                        </Grid>
                        :
                        ''
                    }
                    {
                      (product.bluePoints.status) ?
                        <Grid item xs={6} style={{ margin: 4, marginBottom: 12, marginRight: 0, marginTop: -36 }}>
                          <Tag name={'Gana ' + Utils.numberWithCommas(product.bluePoints.win) + ' puntos'} text={'bluePointText'} container={'bluePointRectangle'} />
                        </Grid>
                        :
                        ''
                    }
                    <div className={classes.informationContainer}>
                      <Grid item xs={12} >
                        <Typography variant="body2" className={classes.productName}>{product.detail.title}</Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Grid container>
                          {
                            (product.percentagePrice > 0) ?
                              <Grid item={12}>
                                <Typography variant="body1" className={classes.itemPrice}>$ {Utils.numberWithCommas(product.discountPrice)}<span className={classes.itemPriceTachado} > $ {Utils.numberWithCommas(product.price)}</span></Typography>
                              </Grid>
                              :
                              <Grid item={12}>
                                <Typography variant="body1" className={classes.itemPrice}>$ {Utils.numberWithCommas(product.price)}</Typography>
                              </Grid>
                          }
                        </Grid>
                      </Grid>

                      <Grid item xs={12}>
                        {
                          (product.creditPrice > 0) ?
                            <Grid item={12}>
                              {/* <Typography variant="body1" className={classes.itemPrice} style={{ color: 'red', overflow: 'hidden', width: '100%', textOverflow: 'ellipsis' }} ><span style={{ color: 'red' }}>${Utils.numberWithCommas(product.partialityPrice.toFixed(2))} quincenales</span></Typography */}
                              <Typography variant="body2" className={classes.quincenas}>Desde ${Utils.numberWithCommas(product.partialityPrice)} quincenales </Typography>
                            </Grid>
                            :
                            ''
                        }
                      </Grid>
                    </div>
                  </>
                  :
                  ''
              }
            </Grid>
          </Paper>
        </a>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(ProductCard)
