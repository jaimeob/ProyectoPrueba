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

class NewInventory extends Component {
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
        branchId: null,
        warehouseId: null,
        productId: null,
        kitId: null,
        minStock: '',
        stock: '',
        maxStock: '',
        comments: ''
      },
      totalQuantity: 0
    }

    this.handleChangeValue = this.handleChangeValue.bind(this)
    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.getUserFullName = this.getUserFullName.bind(this)
    this.deleteTag = this.deleteTag.bind(this)
    
    this.addProductToInventory = this.addProductToInventory.bind(this)
    this.addKitToInventory = this.addKitToInventory.bind(this)

    this.deleteProduct = this.deleteProduct.bind(this)
    this.handleChangeComments = this.handleChangeComments.bind(this)
    this.confirmUploader = this.confirmUploader.bind(this)
    this.handleCancelConfirmDialog = this.handleCancelConfirmDialog.bind(this)
    this.handleAcceptConfirmDialog = this.handleAcceptConfirmDialog.bind(this)
    this.getMargin = this.getMargin.bind(this)
    this.getProfit = this.getProfit.bind(this)
    
    this.getTotalQuantity = this.getTotalQuantity.bind(this)
    this.getTotalValue = this.getTotalValue.bind(this)
    this.getTotalCost = this.getTotalCost.bind(this)
    this.getTotalPiecesForKit = this.getTotalPiecesForKit.bind(this)

    this.createInventory = this.createInventory.bind(this)
  }

  getTotalPiecesForKit(kit) {
    let total = 0
    this.state.kits.forEach((kit) => {
      total += Number(kit.data.quantity * kit.data.stock)
    })
    return total
  }

  getTotalQuantity() {
    let total = 0

    this.state.products.forEach((product) => {
      total += Number(product.data.stock)
    })

    this.state.kits.forEach((kit) => {
      total += Number(kit.data.quantity * kit.data.stock)
    })

    return total.toFixed(2)
  }

  getTotalValue() {
    let total = 0
    this.state.products.forEach((product) => {
      total += Number(product.data.stock * product.data.price)
    })

    this.state.kits.forEach((kit) => {
      total += Number(kit.data.totalPrice * kit.data.stock)
    })

    return total.toFixed(2)
  }

  getTotalCost() {
    let total = 0
    this.state.products.forEach((product) => {
      total += Number(product.data.stock * product.data.cost)
    })

    this.state.kits.forEach((kit) => {
      total += Number(kit.data.totalCost * kit.data.stock)
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

  addProductToInventory(event) {
    const self = this
    event.preventDefault()

    let minStock = Number(this.state.values.minStock)
    let stock = Number(this.state.values.stock)
    let maxStock = Number(this.state.values.maxStock)

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
    } else if (isNaN(minStock) || minStock <= 0 || minStock >= maxStock) {
      this.setState({
        openSnack: true,
        messageSnack: 'El stock mínimo debe ser mayor a cero y menor al stock máximo.'
      })
    } else if (isNaN(maxStock) || maxStock <= 0 || maxStock <= minStock) {
      this.setState({
        openSnack: true,
        messageSnack: 'El stock máximo debe ser mayor a cero y menor al stock mínimo.'
      })
    } else {
      let productId = this.state.values.productId
      productId.data.minStock = minStock
      productId.data.stock = stock
      productId.data.maxStock = maxStock
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
        values['minStock'] = ''
        values['stock'] = ''
        values['maxStock'] = ''
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

  addKitToInventory(event) {
    const self = this
    event.preventDefault()

    let minStock = Number(this.state.values.kitMinStock)
    let stock = Number(this.state.values.kitStock)
    let maxStock = Number(this.state.values.kitMaxStock)

    if (this.state.values.kitId === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un kit.'
      })
    } else if (isNaN(stock) || stock <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El stock debe ser mayor a cero.'
      })
    } else if (isNaN(minStock) || minStock <= 0 || minStock >= maxStock) {
      this.setState({
        openSnack: true,
        messageSnack: 'El stock mínimo debe ser mayor a cero y menor al stock máximo.'
      })
    } else if (isNaN(maxStock) || maxStock <= 0 || maxStock <= minStock) {
      this.setState({
        openSnack: true,
        messageSnack: 'El stock máximo debe ser mayor a cero y menor al stock mínimo.'
      })
    } else {
      let kitId = this.state.values.kitId
      kitId.data.minStock = minStock
      kitId.data.stock = stock
      kitId.data.maxStock = maxStock
      let error = false
      let kits = this.state.kits
      
      kits.forEach((kit) => {
        if (kit.id === kitId.id) {
          error = true
        }
      })

      if (!error) {
        kits.unshift(kitId)
        let values = this.state.values
        values['kitMinStock'] = ''
        values['kitStock'] = ''
        values['kitMaxStock'] = ''
        this.setState({
          values: values,
          kits: kits,
        }, () => {
          self.props.clearAutocomplete('kitAutocomplete')
        })
      } else {
        this.setState({
          openSnack: true,
          messageSnack: 'El kit ya se encuentra agregado.'
        })
      }
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

    if (type === 'branchId' || type === 'warehouseId') {
      if (value !== null)
        values[type] = value.id
    }

    if (type === 'branchId') {
      values['warehouseId'] = null
    }

    this.setState({
      values: values
    }, () => {
      if (type === 'branchId' && after !== null) {
        self.props.reloadAutocomplete('warehouseAutocomplete')
      }
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

  async createInventory(event) {
    event.preventDefault()

    let error = false
    let messageError = ''
    if (this.state.values.branchId === null) {
      error = true
      messageError = 'No haz seleccionado una sucursal.'
    } else if (this.state.values.warehouseId === null) {
      error = true
      messageError = 'No haz seleccionado un almacén.'
    } else if (this.state.products.length <= 0 && this.state.kits.length <= 0) {
      error = true
      messageError = 'No haz seleccionado productos o kit al inventario.'
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
      resource: 'inventories',
      endpoint: '/create',
      data: {
        branchId: this.state.values.branchId,
        warehouseId: this.state.values.warehouseId,
        products: this.state.products,
        kits: this.state.kits,
        comments: this.state.values.comments
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.props.history.push('/inventarios')
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
          title="Crear nuevo inventario."
          description={ <span>Inventario creado por: <strong>{ this.getUserFullName() }</strong></span> }
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
              <Typography variant="h6"><strong>1. Datos generales del inventario.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Los campos marcados con asterisco son obligatorios (*).</Typography>
              <div style={{ marginTop: 16 }}>
                <Autocomplete
                  host={Utils.constants.HOST}
                  label="Selecciona una sucursal *"
                  resource="branches"
                  param="name"
                  value={this.state.values.branchId}
                  onChange={(newValue) => this.handleChangeValueSelect('branchId', newValue)}
                />
                {
                  (this.state.values.branchId !== null) ?
                  <Autocomplete
                    id="warehouseAutocomplete"
                    host={Utils.constants.HOST}
                    label="Selecciona un almacén *"
                    resource="warehouses"
                    param="name"
                    filters={{
                      where: {and: [{branchId: this.state.values.branchId}, {status: {neq: 2}}]}, limit: 5
                    }}
                    withIdFilter={[
                      {
                        ['branchId']: this.state.values.branchId
                      }
                    ]}
                    addToCatalog={true}
                    messages={{
                      title: "Crear nuevo almacén.",
                      description: "Captura el nombre del nuevo almacén.",
                      params: {
                        name: "Nombre del almacén"
                      }
                    }}
                    createParams={[
                      { name: "name", type: "string", required: true },
                      { name: "branchId", type: "id", value: this.state.values.branchId, hidden: true, required: true }
                    ]}
                    value={this.state.values.warehouseId}
                    onChange={(newValue) => this.handleChangeValueSelect('warehouseId', newValue)}
                  />
                  :
                  ''
                }
              </div>
            </Paper>
          </Grid>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={[classes.container]}>
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>Resumen.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Resumen del inventario.</Typography>
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
                        <Typography variant="body1">Cantidad total de piezas agregadas:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <strong>{Utils.numberWithCommas(this.getTotalQuantity())}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1">Costo del inventario:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <strong>$ {Utils.numberWithCommas(this.getTotalCost())} M.N.</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1">Valor del inventario:</Typography>
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
                <Grid item xl={3} lg={3} md={3} sm={4} xs={4} style={{ marginTop: 20, paddingRight: 8 }}>
                  <Typography><strong>Stock</strong></Typography>
                  <TextField
                    placeholder="1, 2, 3, etc..."
                    className={classes.textFieldLarge}
                    value={this.state.values.stock}
                    onChange={(event) => { this.handleChangeValue('stock', event) }}
                    type="number"
                  />
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={4} xs={4} style={{ marginTop: 20, paddingRight: 8 }}>
                  <Typography><strong>Stock mínimo</strong></Typography>
                  <TextField
                    placeholder="1, 2, 3, etc..."
                    className={classes.textFieldLarge}
                    value={this.state.values.minStock}
                    onChange={(event) => { this.handleChangeValue('minStock', event) }}
                    type="number"
                  />
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={4} xs={4} style={{ marginTop: 20 }}>
                  <Typography><strong>Stock máximo</strong></Typography>
                  <TextField
                    placeholder="1, 2, 3, etc..."
                    className={classes.textFieldLarge}
                    value={this.state.values.maxStock}
                    onChange={(event) => { this.handleChangeValue('maxStock', event) }}
                    type="number"
                  />
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={8} xs={8} style={{ paddingLeft: 16, marginTop: 40 }}>
                  <Button variant="contained" color="primary" className={classes.primaryButton} style={{ width: '100%' }} onClick={ (event) => { this.addProductToInventory(event) } }>
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
                        <TableCell className={classes.contentCell}>
                          <Typography variant="body1"><strong>Min.</strong></Typography>
                        </TableCell>
                        <TableCell className={classes.contentCell}>
                          <Typography variant="body1"><strong>Max.</strong></Typography>
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
                              <TableCell className={classes.contentCell}>{product.data.minStock}</TableCell>
                              <TableCell className={classes.contentCell}>{product.data.maxStock}</TableCell>
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
                <Grid item xl={3} lg={3} md={3} sm={4} xs={4} style={{ marginTop: 20, paddingRight: 8 }}>
                  <Typography><strong>Stock</strong></Typography>
                  <TextField
                    placeholder="1, 2, 3, etc..."
                    className={classes.textFieldLarge}
                    value={this.state.values.kitStock}
                    onChange={(event) => { this.handleChangeValue('kitStock', event) }}
                    type="number"
                  />
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={4} xs={4} style={{ marginTop: 20, paddingRight: 8 }}>
                  <Typography><strong>Stock mínimo</strong></Typography>
                  <TextField
                    placeholder="1, 2, 3, etc..."
                    className={classes.textFieldLarge}
                    value={this.state.values.kitMinStock}
                    onChange={(event) => { this.handleChangeValue('kitMinStock', event) }}
                    type="number"
                  />
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={4} xs={4} style={{ marginTop: 20 }}>
                  <Typography><strong>Stock máximo</strong></Typography>
                  <TextField
                    placeholder="1, 2, 3, etc..."
                    className={classes.textFieldLarge}
                    value={this.state.values.kitMaxStock}
                    onChange={(event) => { this.handleChangeValue('kitMaxStock', event) }}
                    type="number"
                  />
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={8} xs={8} style={{ paddingLeft: 16, marginTop: 40 }}>
                  <Button variant="contained" color="primary" className={classes.primaryButton} style={{ width: '100%' }} onClick={ (event) => { this.addKitToInventory(event) } }>
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
                          <Typography variant="body1"><strong>Stock</strong></Typography>
                        </TableCell>
                        <TableCell className={classes.contentCell}>
                          <Typography variant="body1"><strong>Stock mínimo</strong></Typography>
                        </TableCell>
                        <TableCell className={classes.contentCell}>
                          <Typography variant="body1"><strong>Stock máximo</strong></Typography>
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
                              <TableCell className={classes.contentCell}>{kit.data.stock}</TableCell>
                              <TableCell className={classes.contentCell}>{kit.data.minStock}</TableCell>
                              <TableCell className={classes.contentCell}>{kit.data.maxStock}</TableCell>
                              <TableCell className={classes.contentCell}>{this.getTotalPiecesForKit(kit)}</TableCell>
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
          <Button variant="contained" color="primary" className={classes.primaryButton} onClick={(event) => { this.createInventory(event) }}>
            CREAR INVENTARIO
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
)(NewInventory)
