import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Button, Typography, Snackbar, IconButton, Hidden, Checkbox, Grid } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({
  item: {
    margin: 0,
    [theme.breakpoints.down('sm')]: {
      height: 'auto',
    }
  },
  itemTag: {
    backgroundColor: 'red',
    position: 'absolute',
    color: 'white',
    fontSize: 18,
    padding: '4px 8px',
    borderBottomRightRadius: 10
  },
  checkbox: {
    float: 'right',
    position: 'absolute',
    right: '5%',
    top: '10%',
    [theme.breakpoints.down('sm')]: {
      position: 'absolute',
      right: '5%'
    }
  },
  imageContainer: {
    verticalAlign: 'middle',
    textAlign: 'center',
    display: 'table-cell',
    margin: '0 auto',
    backgroundColor: 'white',
    height: '200px',
    [theme.breakpoints.down('sm')]: {
      height: '100px',
    }
  },
  imageContainerKelder: {
    width: 400,
    height: 400,
    verticalAlign: 'text-bottom',
    textAlign: 'center',
    display: 'table-cell',
    margin: '0 auto',
    backgroundColor: 'white'
  },
  itemImage: {
    width: '60%',
    height: 'auto',
    objectFit: 'cover',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    }

  },
  itemVerticalImage: {
    width: 'auto',
    height: '100%',
    objectFit: 'cover'
  },
  itemDescription: {
    width: '90%',
    margin: '0 auto'
  },
  itemName: {
    fontSize: 16,
    fontWeight: 800,
    [theme.breakpoints.down('sm')]: {
      fontSize: 15
    }
  },
  itemPrice: {
    lineHeight: 1,
    fontSize: 18,
    fontWeight: 800,
    color: '#243B7A'
  },
  itemOldPrice: {
    fontSize: 12,
    fontWeight: 400,
    color: 'red',
    textDecoration: 'line-through'
  },
  itemBrand: {
    fontSize: 12,
    opacity: 0.8
  },
  itemCode: {
    fontSize: 16,
    opacity: 0.5
  },
  buttonHide: {
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  }
})

class ProductCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      imageWorking: true,
      selected: false,
      selectedPhoto: (this.props.data.photos.length === 0) ? 'placeholder.svg' : Utils.constants.HOST_CDN_AWS + "/normal/" + this.props.data.photos[0].description
    }

    this.getSizesRange = this.getSizesRange.bind(this)
    this.getSubtitle = this.getSubtitle.bind(this)
    this.changePhoto = this.changePhoto.bind(this)
    this.addSeenProducts = this.addSeenProducts.bind(this)

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

  async addSeenProducts(product) {
    if (product) {
      await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: 'POST',
        resource: 'recently-seen',
        endpoint: '/add-product',
        data: {
          product: product
        }
      })
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

  componentWillMount() {
    this.setState({
      selected: this.props.currentCatalog
    })
  }

  handleChange() {
    if (this.state.selected) {
      //Utils.removeProductFromCatalog(this.props.data)
      this.props.dispatch({ type: 'REMOVE_FROM_CATALOG',product:this.props.data})

      this.setState({
        selected: false
      })
    } else {
      //Utils.addProductToCatalog(this.props.data)
      this.props.dispatch({ type: 'ADD_TO_CATALOG',product:this.props.data})

      this.setState({
        selected: true
      })
    }
    this.props.updateCount()
  }

  render() {
    const { classes } = this.props
    let product = this.props.data


    return (
      <Grid container className={classes.item} style={{ margin: 0, padding: 0, boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.12)', position: 'relative' }} >
        {
          (Utils.isUserLoggedIn()) ?
            (this.props.currentCatalogStatus) ?
              <Checkbox
                color="primary"
                className={classes.checkbox}
                checked={this.state.selected}
                onChange={() => this.handleChange()}
              />
              :
              <div>
              {
                (this.state.selected)?
                this.setState({
                  selected: false
                })
                :
                ''
              }
            </div>
            :
            ''
        }
        <Grid item xs={5}>
          <a href={product.url}
            onClick={async () => {
              // Método para agregar producto a productos vistos
              (product.code) ? await this.addSeenProducts(product.code) : ''
            }}
          >
            <div >
              {
                (product.percentagePrice > 0) ?
                  <div className={classes.itemTag}>
                    <span>{product.percentagePrice}%</span>
                  </div>
                  :
                  ''
              }
              {/*
                (product.percentagePrice > 0) ?
                <div style={{ padding: 0, margin: 0, textAlign: 'center', position: 'absolute', top: 8, right: 8, fontSize: 12, color: 'white', width: 48, height: 48, borderRadius: '50%' }}>
                  <img src="/buenfin.svg" />
                </div>
                :
                ''
              */}
              {
                (product.photos.length > 0) ?
                  (this.state.imageWorking) ?
                    <div className={classes.imageContainer} style={{ borderRadius: '15px' }} >
                      <img
                        className={classes.itemImage}
                        style={{ textAlign: 'center', margin: '0 auto' }}
                        src={this.state.selectedPhoto}
                        onMouseOver={() => { this.changePhoto(1) }}
                        onMouseLeave={() => { this.changePhoto(0) }}
                        alt=""
                        onError={() => {
                          this.setState({ selectedPhoto: 'placeholder.svg', imageWorking: false })
                        }}
                      />
                    </div>
                    :
                    <img
                      className={classes.itemImage}
                      style={{ textAlign: 'center', margin: '0 auto', width: '70%' }}
                      src={this.state.selectedPhoto}
                      onMouseOver={() => { this.changePhoto(1) }}
                      onMouseLeave={() => { this.changePhoto(0) }}
                      alt=""
                    />
                  :
                  <img
                    className={classes.itemImage}
                    style={{ width: 90 }}
                    src={this.state.selectedPhoto}
                    onMouseOver={() => { this.changePhoto(1) }}
                    onMouseLeave={() => { this.changePhoto(0) }}
                    alt=" "
                  />
              }
            </div>
          </a>

        </Grid>

        <Hidden mdDown>
          <Grid item xs={4} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} HOLA >
            <a href={product.url}>
            </a>
            <div className={classes.itemDescription}>
              {/*
              (product.percentagePrice > 0) ?
              <img src={hotSaleImg} style={{ width: 64, float: 'right' }} />
              :
              ''
            */}
              <Typography variant="body1" className={classes.itemCode}>{product.code}</Typography>
              <Typography variant="body1" className={classes.itemName}>{product.brand.name}</Typography>
              <Typography variant="body2" className={classes.itemName} style={{ opacity: '0.5', fontSize: 15 }}>{this.getSubtitle(product)} ({product.name})</Typography>
              {/* <Hidden smDown>
                <Typography variant="body1" className={classes.itemBrand}>{product.name.substring(0, 28)}</Typography>
              </Hidden> */}

            </div>
          </Grid>
          <Grid item xs={2} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} >
            <div>

              <div style={{ textAlign: 'right' }} >
                {
                  (product.creditPrice > 0) ?
                    <Typography variant="body1" className={classes.itemPrice}><span style={{ fontSize: 18, color: 'red' }}> ${Utils.numberWithCommas(product.partialityPrice.toFixed(2))} quincenales.</span></Typography>
                    :
                    ''
                }
                {
                  (product.percentagePrice > 0) ?
                    <div>
                      <Typography variant="body1" className={classes.itemOldPrice}>$ {Utils.numberWithCommas(product.price.toFixed(2))}</Typography>
                      <Typography variant="body1" className={classes.itemPrice}>$ {Utils.numberWithCommas(product.discountPrice.toFixed(2))} <span style={{ fontSize: 12 }}>al contado</span></Typography>
                    </div>
                    :
                    <Typography variant="body1" className={classes.itemPrice}>$ {Utils.numberWithCommas(product.price.toFixed(2))} <span style={{ fontSize: 18 }}></span></Typography>
                }
              </div>
              {/* <Grid container >
                <Grid item xs={12} style={{ marginBottom: 15, marginTop: 15 }} >
                  <Button className={classes.buttonHide} style={{ width: '100%', color: '#283a78', border: '1px solid #283a78', borderRadius: 20, textTransform: 'none' }} >Agregar al carrito</Button>
                </Grid>
                <Grid item xs={12}>
                  <Button className={classes.buttonHide} style={{ width: '100%', color: 'white', background: '#283a78', borderRadius: 20, textTransform: 'none' }} >Comprar ahora</Button>
                </Grid>
              </Grid> */}
            </div>
          </Grid>
        </Hidden >

        {/* RESPONSIVE */}
        <Hidden lgUp>
          <Grid item xs={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
            <a href={product.url}>
            </a>
            <div className={classes.itemDescription}>
              {/*
              (product.percentagePrice > 0) ?
              <img src={hotSaleImg} style={{ width: 64, float: 'right' }} />
              :
              ''
            */}
              <Typography variant="body1" className={classes.itemCode}>{product.code}</Typography>
              <Typography variant="body1" className={classes.itemName}>{product.brand.name}</Typography>
              <Typography variant="body2" className={classes.itemName} style={{ opacity: '0.5', fontSize: 12 }}>{this.getSubtitle(product)} ({product.modelCode})</Typography>
              <div >
                {
                  (product.creditPrice > 0) ?
                    <Typography variant="body1" className={classes.itemPrice}><span style={{ fontSize: 15, color: 'red' }}> ${Utils.numberWithCommas(product.partialityPrice.toFixed(2))} quincenales.</span></Typography>
                    :
                    ''
                }
                {
                  (product.percentagePrice > 0) ?
                    <div>
                      <Typography variant="body1" className={classes.itemOldPrice}>$ {Utils.numberWithCommas(product.price.toFixed(2))}</Typography>
                      <Typography variant="body1" className={classes.itemPrice}>$ {Utils.numberWithCommas(product.discountPrice.toFixed(2))} <span style={{ fontSize: 12 }}>al contado</span></Typography>
                    </div>
                    :
                    <Typography variant="body1" className={classes.itemPrice}>$ {Utils.numberWithCommas(product.price.toFixed(2))} <span style={{ fontSize: 18 }}></span></Typography>
                }
              </div>

            </div>
          </Grid>
          <Grid item xs={4} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} >
            <div>

              {/* <Grid container >
                <Grid item xs={12} style={{ marginBottom: 15, marginTop: 15 }} >
                  <Button className={classes.buttonHide} style={{ width: '100%', color: '#283a78', border: '1px solid #283a78', borderRadius: 20, textTransform: 'none' }} >Agregar al carrito</Button>
                </Grid>
                <Grid item xs={12}>
                  <Button className={classes.buttonHide} style={{ width: '100%', color: 'white', background: '#283a78', borderRadius: 20, textTransform: 'none' }} >Comprar ahora</Button>
                </Grid>
              </Grid> */}
            </div>
          </Grid>
        </Hidden>


        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.state.openSnack}
          onClose={() => this.setState({ openSnack: false, messageSnack: '' })}
          message={
            <span>{this.state.messageSnack}</span>
          }
          action={
            [
              <Button
                color="inherit"
                onClick={() => this.props.history.push(Utils.constants.paths.catalog)}
              >
                VER CATÁLOGO
            </Button>,
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => this.setState({ openSnack: false, messageSnack: '' })}
              >
                <CloseIcon />
              </IconButton>
            ]
          }
        />
      </Grid>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(ProductCard)
