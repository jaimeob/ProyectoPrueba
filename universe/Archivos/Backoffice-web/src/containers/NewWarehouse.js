import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Actions
import Utils from '../resources/Utils'
import Title from '../components/Title'
import ConfirmDialog from '../components/ConfirmDialog'
import { Paper, Typography, Grid, Table, TextField, TableHead, TableBody, TableCell, Button, Checkbox, TableRow, Icon } from '@material-ui/core'
import Empty from '../components/Empty'
import Autocomplete from '../components/Autocomplete'
import AddressForm from '../components/AddressForm'
import Uploader from '../components/Uploader'
import { requestAPI } from '../api/CRUD.js'
import { clearAutocomplete, reloadAutocomplete } from '../actions/actionAutocomplete'

const styles = theme => ({
  container: {
    [theme.breakpoints.down('sm')]: {
      padding: 0,
      paddingTop: 32
    }
  },
  first: {
    paddingRight: 32,
    [theme.breakpoints.down('sm')]: {
      padding: 0
    }
  },
  containerPaper: {
    padding: 32
  },
  fixButtons: {
    textAlign: 'right',
    borderTop: '1px solid #CED2DD',
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '84%',
    padding: 24,
    backgroundColor: 'white'
  },
  textFieldLarge: {
    width: '100%'
  },
  primaryButton: {
    fontWeight: 800
  },
  imageProduct: {
    'object-fit': 'cover',
    width: 64,
    heigth: 64,
    marginRight: 4
  },
  tag: {
    float: 'left',
    margin: 0,
    marginRight: 4,
    padding: 4,
    paddingLeft: 16,
    width: 'max-content',
    borderRadius: 6,
    color: 'white',
    backgroundColor: '#9CA7C1'
  },
  contentCell: {
    margin: 0,
    padding: '0px 0.5%',
    width: 'auto'
  }
})

class NewWarehouse extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openConfirmDialog: false,
      openSnack: false,
      messageSnack: '',
      openUploader: false,
      step: 1,
      user: null,
      products: [],
      kits: [],
      values: {
        name: '',
        branchId: null,
        productId: null,
        kitId: null,
        kitLabel: '',
        stock: '',
        comments: ''
      },
      totalQuantity: 0
    }

    this.handleChangeValue = this.handleChangeValue.bind(this)
    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.getUserFullName = this.getUserFullName.bind(this)
    this.deleteTag = this.deleteTag.bind(this)
    
    this.addProductToWarehouse = this.addProductToWarehouse.bind(this)
    this.addKitToWarehouse = this.addKitToWarehouse.bind(this)

    this.deleteProduct = this.deleteProduct.bind(this)
    this.deleteKit = this.deleteKit.bind(this)

    this.handleChangeComments = this.handleChangeComments.bind(this)
    this.confirmUploader = this.confirmUploader.bind(this)
    this.handleCancelConfirmDialog = this.handleCancelConfirmDialog.bind(this)
    this.handleAcceptConfirmDialog = this.handleAcceptConfirmDialog.bind(this)
    this.getMargin = this.getMargin.bind(this)
    this.getProfit = this.getProfit.bind(this)
    
    this.getTotalQuantity = this.getTotalQuantity.bind(this)
    this.getTotalValue = this.getTotalValue.bind(this)
    this.getTotalCost = this.getTotalCost.bind(this)

    this.createWarehouse = this.createWarehouse.bind(this)
  }

  getTotalQuantity() {
    let total = 0

    this.state.products.forEach((product) => {
      total += Number(product.data.stock)
    })

    this.state.kits.forEach((kit) => {
      total += Number(kit.data.quantity * 1)
    })

    return total.toFixed(2)
  }

  getTotalValue() {
    let total = 0
    this.state.products.forEach((product) => {
      total += Number(product.data.stock * product.data.price)
    })

    this.state.kits.forEach((kit) => {
      total += Number(kit.data.totalPrice * 1)
    })

    return total.toFixed(2)
  }

  getTotalCost() {
    let total = 0
    this.state.products.forEach((product) => {
      total += Number(product.data.stock * product.data.cost)
    })

    this.state.kits.forEach((kit) => {
      total += Number(kit.data.totalCost * 1)
    })

    return total.toFixed(2)
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  async componentWillMount() {
    if (Utils.isUserLoggedIn()) {
      let user = await Utils.getCurrentUser()
      this.setState({
        user: user
      })
    } else {
      this.props.history.push('/')
    }
  }

  handleCancelConfirmDialog() {
    this.setState({
      openConfirmDialog: false
    })
  }

  handleAcceptConfirmDialog() {
    this.props.history.push(Utils.constants.paths.orders)
  }

  handleChangeNote(event) {
    this.setState({
      note: event.target.value
    })
  }

  deleteTag(idx) {
    let tags = this.state.tags
    tags.splice(idx, 1)
    this.setState({
      tags: tags
    })
  }

  addProductToWarehouse(event) {
    const self = this
    event.preventDefault()

    let stock = Number(this.state.values.stock)

    if (this.state.values.productId === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un producto.'
      })
    } else if (isNaN(stock) || stock <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El stock debe ser mayor a cero.'
      })
    } else {
      let productId = this.state.values.productId
      productId.data.stock = stock
      let error = false
      let products = this.state.products
      
      products.forEach((product) => {
        if (product.id === productId.id) {
          error = true
        }
      })

      if (!error) {
        products.unshift(productId)
        let values = this.state.values
        values['productId'] = null
        values['stock'] = ''
        this.setState({
          values: values,
          products: products,
        }, () => {
          self.props.clearAutocomplete('productAutocomplete')
        })
      } else {
        this.setState({
          openSnack: true,
          messageSnack: 'El producto ya se encuentra agregado.'
        })
      }
    }
  }

  addKitToWarehouse(event) {
    const self = this
    event.preventDefault()

    if (this.state.values.kitId === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un kit.'
      })
    } else {
      let kitId = this.state.values.kitId
      kitId.data.description = this.state.values.kitLabel
      let kits = this.state.kits

      kits.unshift(Utils.cloneJson(kitId))
      let values = this.state.values
      values['kitId'] = null
      values['kitLabel'] = ''
      this.setState({
        values: values,
        kits: kits,
      }, () => {
        self.props.clearAutocomplete('kitAutocomplete')
      })
    }
  }

  deleteProduct(idx) {
    let totalQuantity = 0
    let products = this.state.products
    products.splice(idx, 1)
    products.forEach((product) => {
      totalQuantity += product.data.quantity
    })
    this.setState({
      products: products,
      totalQuantity: totalQuantity
    })
  }

  deleteKit(idx) {
    let totalQuantity = 0
    let kits = this.state.kits
    kits.splice(idx, 1)
    kits.forEach((kit) => {
      totalQuantity += kit.data.quantity
    })
    this.setState({
      kits: kits,
      totalQuantity: totalQuantity
    })
  }
  
  confirmUploader(docs, deletedDocs) {
    this.setState({openUploader: false, docs: docs, deletedDocs, deletedDocs})
  }

  handleChangeComments(event) {
    this.setState({
      comments: event.target.value
    })
  }

  handleChangeValue(type, event) {
    let values = this.state.values
    values[type] = event.target.value
    
    if (type === 'price') {
      values.variantPrice = event.target.value
    } else if (type === 'cost') {
      values.variantCost = event.target.value
    }

    this.setState({
      values: values
    })
  }

  handleChangeValueSelect(type, value) {
    const self = this
    let values = this.state.values
    values[type] = value
    let after = values[type]

    if (type === 'branchId') {
      if (value !== null)
        values[type] = value.id
    }

    this.setState({
      values: values
    })
  }

  getUserFullName() {
    try {
      if (this.state.user.name !== undefined) {
        return (this.state.user.name + ' ' + this.state.user.firstLastName).toUpperCase().trim()
      }
    } catch (err) {
      return ''
    }
  }

  getMargin() {
    let price = Number(this.state.values.price)
    let cost = Number(this.state.values.cost)
    if (!isNaN(price) && !isNaN(cost) && price > 0) {
      return (((price-cost) / price) * 100).toFixed(2) + '%'
    }
    return '-'
  }

  getProfit() {
    let price = Number(this.state.values.price)
    let cost = Number(this.state.values.cost)
    if (!isNaN(price) && !isNaN(cost) && price > 0) {
      return '$ ' + Utils.numberWithCommas((price - cost).toFixed(2)) + ' M.N.'
    }
    return '-'
  }

  async createWarehouse(event) {
    event.preventDefault()

    let error = false
    let messageError = ''
    if (this.state.values.name === null) {
      error = true
      messageError = 'No haz capturado el nombre del almacén.'
    } if (this.state.values.branchId === null) {
      error = true
      messageError = 'No haz seleccionado una sucursal.'
    } else if (this.state.products.length <= 0 && this.state.kits.length <= 0) {
      error = true
      messageError = 'No haz seleccionado productos o kits para agregar al almacén.'
    }

    if (error) {
      this.setState({
        openSnack: error,
        messageSnack: messageError
      })
      return
    }

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'POST',
      resource: 'warehouses',
      endpoint: '/create',
      data: {
        name: this.state.values.name,
        branchId: this.state.values.branchId,
        products: this.state.products,
        kits: this.state.kits,
        comments: this.state.values.comments
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.props.history.push(Utils.constants.paths.warehouses)
    } else {
      this.setState({
        openSnack: true,
        messageSnack: Utils.messages.General.error
      })
    }
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <Title
          title="Crear nuevo almacén."
          description={ <span>Almacén creado por: <strong>{ this.getUserFullName() }</strong></span> }
        />
        <div style={{ marginTop: 12 }}>
        {
          (this.state.step === 1) ?
            this.renderFirstStep(classes)
          :
          ''
        }
        </div>
      </div>
    )
  }

  renderFirstStep(classes) {
    const self = this
    return (
      <div style={{ paddingBottom: 64 }}>
        <Grid container>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={[classes.container, classes.first]}>
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>1. Datos generales del almacén.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Los campos marcados con asterisco son obligatorios (*).</Typography>
              <div style={{ marginTop: 16 }}>
                <Typography><strong>Nombre del almacén *</strong></Typography>
                <TextField
                  placeholder="Captura el nombre del almacén..."
                  className={classes.textFieldLarge}
                  value={this.state.values.name}
                  onChange={(event) => { this.handleChangeValue('name', event) }}
                  type="text"
                />
                <Autocomplete
                  host={Utils.constants.HOST}
                  label="Selecciona una sucursal *"
                  resource="branches"
                  param="name"
                  value={this.state.values.branchId}
                  onChange={(newValue) => this.handleChangeValueSelect('branchId', newValue)}
                />
              </div>
            </Paper>
          </Grid>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={[classes.container]}>
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>Resumen.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Resumen de mercancía.</Typography>
              <div style={{ marginTop: 14 }}>
                <Table>
                  <TableBody>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1">Productos agregados:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <strong>{this.state.products.length}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1">Kits agregados:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <strong>{this.state.kits.length}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1">Cantidad total en piezas únicas:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <strong>{Utils.numberWithCommas(this.getTotalQuantity())}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1">Costo de la mercancía:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <strong>$ {Utils.numberWithCommas(this.getTotalCost())} M.N.</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1">Valor de la mercancía:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <strong>$ {Utils.numberWithCommas(this.getTotalValue())} M.N.</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Paper>
          </Grid>
        </Grid>
        <Grid container style={{ marginTop: 24 }}>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={[classes.container, classes.first]}>
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>2. Agregar productos.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Busca y selecciona los productos a dar de alta.</Typography>
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Autocomplete
                    id="productAutocomplete"
                    host={Utils.constants.HOST}
                    label="Buscar producto *"
                    resource="products"
                    param="nameWithSKU"
                    searchParams={["sku", "name"]}
                    value={this.state.values.productId}
                    onChange={(newValue) => this.handleChangeValueSelect('productId', newValue)}
                  />
                </Grid>
                <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 20, paddingRight: 8 }}>
                  <Typography><strong>Stock</strong></Typography>
                  <TextField
                    placeholder="1, 2, 3, etc..."
                    className={classes.textFieldLarge}
                    value={this.state.values.stock}
                    onChange={(event) => { this.handleChangeValue('stock', event) }}
                    type="number"
                  />
                </Grid>
                <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ paddingLeft: 16, marginTop: 40 }}>
                  <Button variant="contained" color="primary" className={classes.primaryButton} style={{ width: '100%' }} onClick={ (event) => { this.addProductToWarehouse(event) } }>
                    AGREGAR
                  </Button>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography style={{ marginTop: 12 }}><strong>{this.state.products.length}</strong> { (this.state.products.length === 1) ? 'producto agregado.' : 'productos agregados.' }</Typography>
                  {
                  (this.state.products.length > 0) ?
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className={classes.contentCell} ></TableCell>
                        <TableCell className={classes.contentCell} >
                          <Typography variant="body1"><strong>SKU</strong></Typography>
                        </TableCell>
                        <TableCell className={classes.contentCell}>
                          <Typography variant="body1"><strong>Nombre</strong></Typography>
                        </TableCell>
                        <TableCell className={classes.contentCell}>
                          <Typography variant="body1"><strong>Stock</strong></Typography>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        this.state.products.map((product, idx) => {
                          return (
                            <TableRow>
                              <TableCell className={classes.contentCell} >
                                {
                                  (Utils.isEmpty(product.data.image)) ?
                                  ''
                                  :
                                  <img className={classes.imageProduct} src={Utils.constants.HOST + product.data.image} alt={product.data.name} />
                                }
                              </TableCell>
                              <TableCell className={classes.contentCell} >{product.data.sku}</TableCell>
                              <TableCell className={classes.contentCell}>{product.data.name}</TableCell>
                              <TableCell className={classes.contentCell}>{product.data.stock}</TableCell>
                              <TableCell className={classes.contentCell}><IconButton onClick={ (event) => { this.deleteProduct(idx) } }><Icon>delete</Icon></IconButton></TableCell>
                            </TableRow>
                          )
                        })
                      }
                    </TableBody>
                  </Table>
                  :
                  <Empty
                    title="¡No hay productos!"
                    description="No se han agregado productos."
                  />
                }
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={[classes.container]}>
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>3. Agregar kits.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Busca y selecciona los kits a dar de alta.</Typography>
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Autocomplete
                    id="kitAutocomplete"
                    host={Utils.constants.HOST}
                    label="Buscar kit *"
                    resource="kits"
                    param="nameWithQuantity"
                    searchParams={["name"]}
                    value={this.state.values.kitId}
                    onChange={(newValue) => this.handleChangeValueSelect('kitId', newValue)}
                  />
                </Grid>
                <Grid item xl={9} lg={9} md={9} sm={9} xs={9} style={{ marginTop: 20, paddingRight: 8 }}>
                  <Typography><strong>Etiqueta</strong></Typography>
                  <TextField
                    placeholder="Etiqueta física para identificar kit..."
                    className={classes.textFieldLarge}
                    value={this.state.values.kitLabel}
                    onChange={(event) => { this.handleChangeValue('kitLabel', event) }}
                    type="text"
                  />
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={3} xs={3} style={{ paddingLeft: 16, marginTop: 40 }}>
                  <Button variant="contained" color="primary" className={classes.primaryButton} style={{ width: '100%' }} onClick={ (event) => { this.addKitToWarehouse(event) } }>
                    AGREGAR
                  </Button>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography style={{ marginTop: 12 }}><strong>{this.state.kits.length}</strong> { (this.state.kits.length === 1) ? 'kit agregado.' : 'kits agregados.' }</Typography>
                  {
                  (this.state.kits.length > 0) ?
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className={classes.contentCell}>
                          <Typography variant="body1"><strong>Nombre</strong></Typography>
                        </TableCell>
                        <TableCell className={classes.contentCell}>
                          <Typography variant="body1"><strong>Descripción</strong></Typography>
                        </TableCell>
                        <TableCell className={classes.contentCell}>
                          <Typography variant="body1"><strong>Piezas</strong></Typography>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        this.state.kits.map((kit, idx) => {
                          return (
                            <TableRow>
                              <TableCell className={classes.contentCell}>{kit.data.name}</TableCell>
                              <TableCell className={classes.contentCell}>{kit.data.description}</TableCell>
                              <TableCell className={classes.contentCell}>{kit.data.quantity}</TableCell>
                              <TableCell className={classes.contentCell}><IconButton onClick={ (event) => { this.deleteKit(idx) } }><Icon>delete</Icon></IconButton></TableCell>
                            </TableRow>
                          )
                        })
                      }
                    </TableBody>
                  </Table>
                  :
                  <Empty
                    title="¡No hay kits!"
                    description="No se han agregado kits."
                  />
                }
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Paper className={classes.containerPaper} style={{ marginTop: 24 }}>
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="h6"><strong>5. Comentarios adicionales.</strong></Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                  <TextField
                    className={classes.textFieldLarge}
                    placeholder="Escribir comentarios adicionales..."
                    value={this.state.values.comments}
                    onChange={(event) => { this.handleChangeValue('comments', event) }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <div className={classes.fixButtons}>
          <Button variant="outlined" style={{ marginRight: 8 }} onClick={ (event) => {
            this.setState({
              openConfirmDialog: true
            })
          } }>
            CANCELAR
          </Button>
          <Button variant="contained" color="primary" className={classes.primaryButton} onClick={(event) => { this.createWarehouse(event) }}>
            GUARDAR ALMACÉN
          </Button>
        </div>
        <ConfirmDialog
          open={this.state.openConfirmDialog}
          title="Cancelar solicitud"
          description="¿Está seguro que desea cancelar la solicitud en progreso?"
          onCancel={(this.handleCancelConfirmDialog)}
          onConfirm={this.handleAcceptConfirmDialog}
        />
        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          open={this.state.openSnack}
          onClose={() => { this.setState({ openSnack: false, messageSnack: '' })}}
          message={
            <span>{this.state.messageSnack}</span>
          }
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={() => { this.setState({ openSnack: false, messageSnack: '' })}}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    reloadAutocomplete: (autocompleteId) => {
      dispatch(reloadAutocomplete(autocompleteId))
    },
    clearAutocomplete: (autocompleteId) => {
      dispatch(clearAutocomplete(autocompleteId))
    }
  }
}

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(NewWarehouse)
