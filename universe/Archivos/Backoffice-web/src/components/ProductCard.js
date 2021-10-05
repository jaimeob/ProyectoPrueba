import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Button, Typography, Snackbar, IconButton, Hidden, Checkbox } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

// Utils
import Utils from '../resources/Utils'
import { addToCatalog, removeFromCatalog, getCurrentCatalog } from '../actions/actionCatalog'

const styles = theme => ({
  item: {
    margin: 0,
    padding: 16,
    height: 320,
    [theme.breakpoints.down('sm')]: {
      padding: 4,
      height: 'auto',
    }
  },
  itemTag: {
    backgroundColor: 'red',
    position: 'absolute',
    marginTop: 32,
    color: 'white',
    fontSize: 14,
    padding: '4px 8px',
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    [theme.breakpoints.down('sm')]: {
      marginTop: 0
    }
  },
  checkbox: {
    float: 'right'
  },
  itemImage: {
    width: '100%'
  },
  itemDescription: {
    width: '90%',
    margin: '0 auto'
  },
  itemName: {
    fontSize: 16,
    fontWeight: 800,
    [theme.breakpoints.down('sm')]: {
      fontSize: 12
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
    fontSize: 10,
    opacity: 0.8
  }
})

class ProductCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      imageWorking: true,
      selected: false
    }
    this.getSizesRange = this.getSizesRange.bind(this)
    this.getSubtitle = this.getSubtitle.bind(this)
  }

  getSubtitle(product) {
    let string = ''
    if (!Utils.isEmpty(this.getSizesRange(product))) {
      string = this.getSizesRange(product)
    }

    if (product.genero !== undefined && product.genero.descripcion !== undefined && product.genero.descripcion !== null && !Utils.isEmpty(product.genero.descripcion)) {
      if (!Utils.isEmpty(string)) {
        string = product.genero.descripcion + ' (' + string + ')'
      }
      else {
        string = product.genero.descripcion
      }
    }
    return string
  }

  getSizesRange(product) {
    let sizes = product.tallas.split('|')
    let string = ''
    if (sizes.length > 4) {
      string = sizes[1] + ' - ' + sizes[sizes.length - 2]
    }
    return string
  }

  componentDidUpdate(prevProps) {
    if (prevProps.catalog !== this.props.catalog) {   
      if (this.props.catalog.procusts !== undefined && this.props.catalog.products.length === 0) {
        this.setState({
          selected: false
        })
      }
    }
  }

  componentWillMount() {
    if (this.props.currentCatalogStatus) {
      if (this.props.catalog.products != this.state.catalog){
        this.setState({
          catalog: this.props.catalog.products
        }, () => {
          if (this.state.catalog.length > 0){
            let product = this.props.data
            let catalog = this.state.catalog

            let productSelected = catalog.some(selected => selected.id === product.id)
            this.setState({
              selected: productSelected
            })
          } else {
            this.setState({
              selected: false
            })
          }
        })
      }
    } else {
      if (this.state.selected){
        this.setState({
          selected: false
        })
      }
    }
  }

  handleChange(){
    if (this.state.selected){
      this.props.removeFromCatalog(this.props.data)

      this.setState({
        selected: false
      })
    } else {
      this.props.addToCatalog(this.props.data)

      this.setState({
        selected: true
      })
    }
  }

  render() {
    const { classes } = this.props
    let product = this.props.data

    return (
      (this.props.app.configs) ?
        <div className={classes.item}>
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
                ''
            :
              '' 
          }   
          {
            (product.precio_porcentaje > 0) ?
              <div className={classes.itemTag}>
                <span>{product.precio_porcentaje}% DESC.</span>
              </div>
              :
              ''
          }
          {
            (product.fotografias.length > 0) ?
              (this.state.imageWorking) ?
                <img
                  className={classes.itemImage}
                  src={Utils.constants.HOST_CDN_AWS + "/normal/" + product.fotografias[0].nombre_fotografia}
                  alt=""
                  onError={() => {
                    this.setState({ imageWorking: false })
                  }}
                />
                :
                <img
                  className={classes.itemImage}
                  style={{ width: '65%', textAlign: 'center', margin: '0 auto' }}
                  src={Utils.getPlaceholderByGender(product.genero_id)}
                  alt=""
                />
              :
              <img
                className={classes.itemImage}
                style={{ width: 90 }}
                src=""
                alt=""
              />
          }
          <div className={classes.itemDescription}>
            <Typography variant="body1" className={classes.itemName}>{product.marca.descripcion}</Typography>
            <Typography variant="body2" className={classes.itemName} style={{ fontSize: 12 }}>{this.getSubtitle(product)} ({product.modelo})</Typography>
            {
              (product.precio_porcentaje > 0) ?
                <div>
                  <Typography variant="body1" className={classes.itemOldPrice}>$ {Utils.numberWithCommas(product.precio.toFixed(2))}</Typography>
                  <Typography variant="body1" className={classes.itemPrice}>$ {Utils.numberWithCommas(product.precio_rebaja.toFixed(2))} <span style={{ fontSize: 12 }}>al contado</span></Typography>
                </div>
                :
                <Typography variant="body1" className={classes.itemPrice}>$ {Utils.numberWithCommas(product.precio.toFixed(2))} <span style={{ fontSize: 12 }}>al contado</span></Typography>
            }
            {
              (product.precio_credito > 0) ?
                <Typography variant="body1" className={classes.itemPrice}><span style={{ fontSize: 14, color: 'red' }}>Desde ${Utils.numberWithCommas(Number(product.precio_credito / product.numero_quincena).toFixed(2))} quincenales.</span></Typography>
                :
                ''
            }
            <Hidden smDown>
              <Typography variant="body1" className={classes.itemBrand}>{product.nombre.substring(0, 28)}</Typography>
            </Hidden>
            <Typography variant="body1" className={classes.itemCode}>{product.producto_id}</Typography>
          </div>
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
        </div>
        :
        ''
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    addToCatalog: (product) => {
      dispatch(addToCatalog(product))
    },
    removeFromCatalog: (product) => {
      dispatch(removeFromCatalog(product))
    },
    getCurrentCatalog: () => {
      dispatch(getCurrentCatalog())
    },
  }
}


export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(ProductCard)
