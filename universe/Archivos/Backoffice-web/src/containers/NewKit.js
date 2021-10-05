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

class NewProduct extends Component {
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
      values: {
        name: '',
        description: '',
        productId: null,
        quantity: '',
        comments: ''
      },
      totalQuantity: 0
    }

    this.handleChangeValue = this.handleChangeValue.bind(this)
    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.getUserFullName = this.getUserFullName.bind(this)
    this.deleteTag = this.deleteTag.bind(this)
    this.addProductToKit = this.addProductToKit.bind(this)
    this.deleteProduct = this.deleteProduct.bind(this)
    this.handleChangeComments = this.handleChangeComments.bind(this)
    this.confirmUploader = this.confirmUploader.bind(this)
    this.handleCancelConfirmDialog = this.handleCancelConfirmDialog.bind(this)
    this.handleAcceptConfirmDialog = this.handleAcceptConfirmDialog.bind(this)
    this.getMargin = this.getMargin.bind(this)
    this.getProfit = this.getProfit.bind(this)
    
    this.getVariants = this.getVariants.bind(this)

    this.createKit = this.createKit.bind(this)
  }

  getVariants(variant) {
    let string = ''
    variant.tags.forEach((tag, idx) => {
      if (idx != 0) {
        string += ' ' + tag.data.name
      } else {
        string += tag.data.name
      }
    })
    return string
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

  addProductToKit(event) {
    const self = this
    event.preventDefault()

    let quantity = Number(this.state.values.quantity)

    if (this.state.values.productId === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un producto.'
      })
    } else if (isNaN(quantity) || quantity <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'La cantidad debe ser mayor a cero.'
      })
    } else {
      let productId = this.state.values.productId
      productId.data.quantity = quantity
      let error = false
      let totalQuantity = quantity
      let products = this.state.products
      products.forEach((product) => {
        totalQuantity += product.data.quantity
        if (product.id === productId.id) {
          error = true
        }
      })

      if (!error) {
        products.unshift(productId)
        let values = this.state.values
        values['quantity'] = ''
        this.setState({
          values: values,
          products: products,
          totalQuantity: totalQuantity
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

  async createKit(event) {
    event.preventDefault()

    let error = false
    let messageError = ''
    if (Utils.isEmpty(this.state.values.name)) {
      error = true
      messageError = 'No haz capturado el nombre del kit.'
    } else if (this.state.products <= 0) {
      error = true
      messageError = 'Es necesario capturar por lo menos 1 producto.'
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
      resource: 'kits',
      endpoint: '/create',
      data: {
        name: this.state.values.name,
        description: this.state.values.description,
        products: this.state.products,
        comments: this.state.values.comments
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.props.history.push('/kits')
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
          title="Captura de kit."
          description={ <span>Kit capturado por: <strong>{ this.getUserFullName() }</strong></span> }
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
          <Grid item xl={5} lg={5} md={5} sm={12} xs={12} className={[classes.container, classes.first]}>
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>1. Datos generales del kit.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Los campos marcados con asterisco son obligatorios (*).</Typography>
              <div style={{ marginTop: 16 }}>
                <Typography><strong>Nombre del kit *</strong></Typography>
                <TextField
                  placeholder="Ejemplo: KIT CLAVO DE FEMUR..."
                  className={classes.textFieldLarge}
                  value={this.state.values.name}
                  onChange={(event) => { this.handleChangeValue('name', event) }}
                  type="text"
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <Typography><strong>Descripción</strong></Typography>
                <TextField
                  placeholder="Opcional..."
                  className={classes.textFieldLarge}
                  value={this.state.values.description}
                  onChange={(event) => { this.handleChangeValue('description', event) }}
                  type="text"
                />
              </div>
            </Paper>
          </Grid>
          <Grid item xl={7} lg={7} md={7} sm={12} xs={12} className={[classes.container]}>
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>2. Productos.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Selecciona los productos a agregar en el Kit.</Typography>
              <Grid container>
                <Grid item xl={8} lg={8} md={8} sm={12} xs={12} className={classes.first}>
                  <Autocomplete
                    id="productAutocomplete"
                    host={Utils.constants.HOST}
                    label="Producto *"
                    resource="products"
                    param="nameWithSKU"
                    searchParams={["sku", "name"]}
                    value={this.state.values.productId}
                    onChange={(newValue) => this.handleChangeValueSelect('productId', newValue)}
                  />
                </Grid>
                <Grid item xl={2} lg={2} md={2} sm={4} xs={4} style={{ marginTop: 20 }}>
                  <Typography><strong>Cantidad</strong></Typography>
                  <TextField
                    placeholder="1, 2, 3, etc..."
                    className={classes.textFieldLarge}
                    value={this.state.values.quantity}
                    onChange={(event) => { this.handleChangeValue('quantity', event) }}
                    type="number"
                  />
                </Grid>
                <Grid item xl={2} lg={2} md={2} sm={8} xs={8} style={{ paddingLeft: 16, marginTop: 40 }}>
                  <Button variant="contained" color="primary" className={classes.primaryButton} style={{ width: '100%' }} onClick={ (event) => { this.addProductToKit(event) } }>
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
                          <Typography variant="body1"><strong>Cantidad</strong></Typography>
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
                              <TableCell className={classes.contentCell}>{product.data.quantity}</TableCell>
                              <TableCell className={classes.contentCell}><IconButton onClick={ (event) => { this.deleteProduct(idx) } }><Icon>delete</Icon></IconButton></TableCell>
                            </TableRow>
                          )
                        })
                      }
                      <TableRow>
                        <TableCell className={classes.contentCell}></TableCell>
                        <TableCell className={classes.contentCell}></TableCell>
                        <TableCell className={classes.contentCell} style={{ textAlign: 'right' }}>Cantidad total:</TableCell>
                        <TableCell className={classes.contentCell}><strong>{this.state.totalQuantity}</strong></TableCell>
                        <TableCell className={classes.contentCell}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  :
                  <Empty
                    title="¡No hay productos!"
                    description="No se han agregado productos al kit."
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
          <Button variant="contained" color="primary" className={classes.primaryButton} onClick={(event) => { this.createKit(event) }}>
            GUARDAR KIT
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
)(NewProduct)
