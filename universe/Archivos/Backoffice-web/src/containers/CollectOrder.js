import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import ReactImageMagnify from 'react-image-magnify'

// Actions
import Utils from '../resources/Utils'
import Title from '../components/Title'
import ConfirmDialog from '../components/ConfirmDialog'
import { Paper, Typography, Grid, Table, TextField, TableHead, TableBody, TableCell, Button, Checkbox, TableRow, Icon } from '@material-ui/core'
import Empty from '../components/Empty'
import KitDetailModal from '../components/KitDetailModal'
import Autocomplete from '../components/Autocomplete'
import { requestAPI } from '../api/CRUD.js'
import { clearAutocomplete, reloadAutocomplete } from '../actions/actionAutocomplete'
import Uploader from '../components/Uploader'

import deliveryGift from '../resources/images/delivery.gif'

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

class CollectOrder extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openKitDetailModal: false,
      openConfirmDialog: false,
      openSnack: false,
      messageSnack: '',
      openUploader: false,
      step: 1,
      user: null,
      order: null,
      products: [],
      kits: [],
      selectedKit: null,
      docs: [],
      values: {
        technicalId: null,
        branchId: null,
        warehouseId: null,
        branchKitId: null,
        warehouseKitId: null,
        productId: null,
        kitId: null,
        quantity: '',
        stock: '',
        comments: ''
      },
      totalQuantity: 0
    }

    this.viewKitDetail = this.viewKitDetail.bind(this)
    this.handleCloseKitDetailModal = this.handleCloseKitDetailModal.bind(this)
    this.handleCloseKitDetailModalWithChanges = this.handleCloseKitDetailModalWithChanges.bind(this)

    this.handleChangeValue = this.handleChangeValue.bind(this)
    this.handleChangeConsumptionValue = this.handleChangeConsumptionValue.bind(this)
    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.getUserFullName = this.getUserFullName.bind(this)
    this.deleteTag = this.deleteTag.bind(this)
    
    this.addProductToOrder = this.addProductToOrder.bind(this)
    this.addKitToOrder = this.addKitToOrder.bind(this)

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
    this.getTotalPiecesForKit = this.getTotalPiecesForKit.bind(this)

    this.consumption = this.consumption.bind(this)
  }

  viewKitDetail(idx) {
    let kits = this.state.kits
    let kit = kits[idx]
    this.setState({
      openKitDetailModal: true,
      selectedKit: kit
    })
  }

  handleCloseKitDetailModal() {
    this.setState({
      openKitDetailModal: false,
      selectedKit: null
    })
  }

  handleCloseKitDetailModalWithChanges() {

  }

  getTotalPiecesForKit(kit) {
    return Number(kit.data.kit.quantity)
  }

  getTotalQuantity() {
    let total = 0

    this.state.order.lines.forEach((product) => {
      total += Number(product.consumption)
    })

    return total.toFixed(2)
  }

  getTotalValue() {
    let total = 0
    
    this.state.order.lines.forEach((product) => {
      total += Number(product.price * product.consumption)
    })

    return total.toFixed(2)
  }

  getTotalCost() {
    let total = 0
    this.state.order.lines.forEach((product) => {
      total += Number(product.cost * product.consumption)
    })
    return total.toFixed(2)
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  async componentWillMount() {
    const self = this
    if (Utils.isUserLoggedIn()) {
      let user = await Utils.getCurrentUser()
      this.setState({
        user: user
      }, async () => {
        if (this.props.match.path === Utils.constants.paths.collectOrder) {
          let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'GET',
            resource: 'orders',
            endpoint: '/' + this.props.match.params.folio + '/entity'
          })

          if (response.status === Utils.constants.status.SUCCESS) {
            self.setState({
              order: response.data
            }, () => {
              let order = self.state.order
              let products = order.lines
              products.forEach((product) => {
                product.consumption = ''
              })
              self.setState({
                order: order
              })
            })
          } else {
            this.props.history.push('/')
          }
        }
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

  addProductToOrder(event) {
    const self = this
    event.preventDefault()

    let quantity = Number(this.state.values.quantity)
    let stock = Number(this.state.values.productId.data.stock)

    if (this.state.values.productId === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un producto.'
      })
    } else if (isNaN(quantity) || quantity <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'La cantidad a surtir debe ser mayor a cero.'
      })
    } else if (isNaN(stock) || stock <= 0 ) {
      this.setState({
        openSnack: true,
        messageSnack: 'No hay disponibilidad de este producto en este almacén.'
      })
    } else if (quantity > stock) {
      this.setState({
        openSnack: true,
        messageSnack: 'No hay suficiente stock para surtir esta cantidad de producto.'
      })
    } else {
      let productId = this.state.values.productId
      let error = false
      let products = this.state.products
      
      products.forEach((product) => {
        if (product.id === productId.id) {
          error = true
        }
      })

      if (!error) {
        productId.data.quantity = quantity
        products.unshift(productId)
        let values = this.state.values
        values['quantity'] = ''
        values['productId'] = null
        this.setState({
          values: values,
          products: products,
        }, () => {
          this.props.clearAutocomplete('productAutocomplete')
        })
      } else {
        this.setState({
          openSnack: true,
          messageSnack: 'El producto ya se encuentra agregado.'
        })
      }
    }
  }

  addKitToOrder(event) {
    const self = this
    event.preventDefault()

    if (this.state.values.kitId === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar un kit.'
      })
    } else {
      let kitId = this.state.values.kitId
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
        values['kitId'] = null
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

  handleChangeConsumptionValue(idx, event) {
    let order = this.state.order
    let products = order.lines
    products[idx].consumption = event.target.value
    this.setState({
      order: order
    })
  }

  handleChangeValueSelect(type, value) {
    const self = this
    let values = this.state.values
    values[type] = value
    let after = values[type]

    console.log(value)

    if (type === 'branchId' || type === 'warehouseId' || type === 'branchKitId' || type === 'warehouseKitId') {
      if (value !== null)
        values[type] = value.id
    }

    if (type === 'branchId') {
      values['warehouseId'] = null
    }

    if (type === 'branchKitId') {
      values['warehouseKitId'] = null
    }

    this.setState({
      values: values
    }, () => {
      if (type === 'branchId' && after !== null) {
        self.props.reloadAutocomplete('warehouseAutocomplete')
      }
      if (type === 'warehouseId' && after !== null) {
        self.props.reloadAutocomplete('productAutocomplete')
      }
      if (type === 'branchKitId' && after !== null) {
        self.props.reloadAutocomplete('warehouseKitAutocomplete')
      }
      if (type === 'warehouseKitId' && after !== null) {
        self.props.reloadAutocomplete('kitAutocomplete')
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

  async consumption(type, event) {
    event.preventDefault()
    let error = false
    let messageError = ''

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'POST',
      resource: 'orders',
      endpoint: '/consumption',
      data: {
        orderId: this.state.order.id,
        type: type,
        products: this.state.products,
        docs: this.state.docs,
        comments: this.state.values.comments
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.props.history.push('/solicitudes')
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
          title={"Surtir solicitud: " + this.props.match.params.folio}
          description={ <span>Solicitud surtida por: <strong>{ this.getUserFullName() }</strong></span> }
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
          <Paper style={{ position: 'fixed', top: 86 }} id="imageZoomFrame"></Paper>
          {
            (this.state.order !== null) ?
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>Datos generales de la solicitud.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Información de la captura de la solicitud.</Typography>
              <div style={{ marginTop: 14 }}>
                <Table>
                  <TableBody>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1" style={{ textAlign: 'right' }}>Solicitante:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <strong>{this.state.order.requester}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1" style={{ textAlign: 'right' }}>Hospital:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <strong>{this.state.order.hospital}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1" style={{ textAlign: 'right' }}>Doctor:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <strong>{this.state.order.doctor}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1" style={{ textAlign: 'right' }}>Paciente:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <strong>{this.state.order.patient}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1" style={{ textAlign: 'right' }}>Fecha captura:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <strong>{Utils.onlyDate(this.state.order.createdAt)}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1" style={{ textAlign: 'right' }}>Fecha cirugía:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <strong>{Utils.onlyDate(this.state.order.deliveryDate)}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ height: 24 }}></TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1" style={{ textAlign: 'right' }}>Capturado por:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <strong>{this.state.order.email}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1" style={{ textAlign: 'right' }}>Suministrado por:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <strong>{this.state.order.suppliedEmail}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1" style={{ textAlign: 'right' }}>Técnico:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'left' }}>
                        <strong>{this.state.order.checkedEmail}</strong>
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                      <TableCell>
                        <Typography variant="body1" style={{ textAlign: 'right' }}>Estatus:</Typography>
                      </TableCell>
                      <TableCell style={{ textAlign: 'left', background: Utils.getStatusColor(this.state.order.pipelineCode) }}>
                        <strong style={{ color: 'white' }}>{this.state.order.pipelineName}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Paper>
            :
            ''
          }
          </Grid>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={[classes.container]}>
          {
            (this.state.order !== null) ?
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>Indicar consumo.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Lista de mercancía surtida. Indicar piezas que contabiliza por producto.</Typography>
              <div style={{ marginTop: 14 }}>
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
                        <Typography variant="body1"><strong>Cant. Visualizada</strong></Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {
                    this.state.order.lines.map((product, idx) => {
                      return (
                        <TableRow>
                          <TableCell className={classes.contentCell} >
                            {
                              (Utils.isEmpty(product.image)) ?
                              ''
                              :
                              <img className={classes.imageProduct} src={Utils.constants.HOST + product.image} alt={product.name} />
                            }
                          </TableCell>
                          <TableCell className={classes.contentCell} >{product.sku}</TableCell>
                          <TableCell className={classes.contentCell}>{product.name}</TableCell>
                          <TableCell className={classes.contentCell}>
                          <TextField
                            placeholder="Cant. visualizada"
                            className={classes.textFieldLarge}
                            value={product.consumption}
                            onChange={(event) => { this.handleChangeConsumptionValue(idx, event) }}
                            type="text"
                          />
                          </TableCell>
                        </TableRow>
                      )
                    })
                  }
                  </TableBody>
                </Table>
              </div>
            </Paper>
            :
            ''
          }
          </Grid>
          <Grid item xl={4} lg={4} md={4} sm={12} xs={12} className={[classes.container, classes.first]}>
            {
              (this.state.order !== null) ?
              <Paper className={classes.containerPaper} style={{ marginTop: 24 }}>
                <Typography variant="h6"><strong>Consumido.</strong></Typography>
                <Typography variant="body2" style={{ fontSize: 13 }}>Resumen de mercancía consumida.</Typography>
                <div style={{ marginTop: 14 }}>
                  <Table>
                    <TableBody>
                      <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                        <TableCell>
                          <Typography variant="body1">Piezas totales:</Typography>
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          <strong>{Utils.numberWithCommas(this.getTotalQuantity())}</strong>
                        </TableCell>
                      </TableRow>
                      <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                        <TableCell>
                          <Typography variant="body1">Costo:</Typography>
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          <strong>$ {Utils.numberWithCommas(this.getTotalCost())} M.N.</strong>
                        </TableCell>
                      </TableRow>
                      <TableRow style={{ maxHeight: 5, height: 5, minHeight: 5 }}>
                        <TableCell>
                          <Typography variant="body1">Valor:</Typography>
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          <strong>$ {Utils.numberWithCommas(this.getTotalValue())} M.N.</strong>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
                  <Typography variant="h6"><strong>Evidencia de consumo.</strong></Typography>
                  <Typography variant="body2" style={{ fontSize: 13 }}>Sube las fotografía que respalden la información del consumo.</Typography>
                  <Typography><strong>{this.state.docs.length}</strong> { (this.state.docs.length === 1) ? 'imagen cargada' : 'imágenes cargadas' }</Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Button variant="contained" color="primary" className={classes.primaryButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                    this.setState({ openUploader: true })
                  }}>
                      SUBIR EVIDENCIA
                  </Button>
                  <Uploader
                    open={this.state.openUploader}
                    host={Utils.constants.HOST}
                    title="Subir evidencia del consumo."
                    description="Adjunta las imágenes aquí."
                    use="consumption"
                    docs={this.state.docs}
                    handleCloseWithData={(docs, deletedDocs) => { this.confirmUploader(docs, deletedDocs) }}
                    handleClose={() => { this.setState({openUploader: false}) }}
                  />
                </Grid>
              </Paper>
              :
              ''
            }
          </Grid>
          {/*
          <Grid item xl={4} lg={4} md={4} sm={12} xs={12} className={[classes.container, classes.first]}>
            <Paper className={classes.containerPaper} style={{ marginTop: 24, textAlign: 'center', height: 292, backgroundColor: '#F2F2F2' }}>
              <img src={deliveryGift} style={{ margin: '0 auto', width: '80%' }} />
              <Typography variant="body2" style={{ marginTop: 16 }}><strong>Los productos surtidos serán trasladados a la siguiente dirección.</strong></Typography>
            </Paper>
          </Grid>
          */}
          {
            (this.state.order !== null) ?
            <Grid item xl={4} lg={4} md={4} sm={12} xs={12} className={[classes.container, classes.first]}>
              <Paper className={classes.containerPaper} style={{ marginTop: 24 }}>
                <Grid container>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Typography variant="h6"><strong>2. Notas de la solicitud.</strong></Typography>
                    <Typography variant="body2" style={{ fontSize: 13 }}>Lista de notas capturadas en la solicitud.</Typography>
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 12 }}>
                    {
                      (this.state.order.notes.length > 0) ?
                      <Table>
                        <TableBody>
                          {
                            this.state.order.notes.map((item, idx) => {
                              return (
                                <TableRow style={{ maxHeight: 28, height: 28, minHeight: 28 }}>
                                  <TableCell><span>🖊</span> {item.note}</TableCell>
                                </TableRow>
                              )
                            })
                          }
                        </TableBody>
                      </Table>
                      :
                      <Empty
                        title="¡No hay notas!"
                        description="No se han agregado notas a la solicitud."
                      />
                    }
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            :
            ''
          }
          {
            (this.state.order !== null) ?
            <Grid item xl={4} lg={4} md={4} sm={12} xs={12} className={[classes.container, classes.first]}>
              <Paper className={classes.containerPaper} style={{ marginTop: 24 }}>
                <Grid container>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Typography variant="h6"><strong>Documentos de la solicitud.</strong></Typography>
                    <Typography variant="body2" style={{ fontSize: 13 }}>Lista de documentos capturados en la solicitud.</Typography>
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 12 }}>
                    {
                      (this.state.order.docs.length > 0) ?
                      this.state.order.docs.map((item, idx) => {
                        return (
                          <div style={{ width: 88, float: 'left', paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}>
                            <ReactImageMagnify
                              {
                                ...{
                                  smallImage: {
                                    isFluidWidth: true,
                                    src: Utils.constants.HOST + item.url
                                  },
                                  largeImage: {
                                    src: Utils.constants.HOST + item.url,
                                    width: 1022,
                                    height: 700
                                  },
                                  enlargedImageContainerDimensions: { width: 600, height: 300 },
                                  enlargedImagePortalId: 'imageZoomFrame',
                                  isEnlargedImagePortalEnabledForTouch: false,
                                  shouldUsePositiveSpaceLens: false
                                }
                              }
                            />
                          </div>
                        )
                      })
                      :
                      <Empty
                        title="¡No hay documentos!"
                        description="No se han agregado documentos a la solicitud."
                      />
                    }
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            :
            ''
          }
        </Grid>
        <Grid container>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Paper className={classes.containerPaper} style={{ marginTop: 24 }}>
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="h6"><strong>Comentarios adicionales.</strong></Typography>
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
            CERRAR
          </Button>
          <Button style={{ marginRight: 8 }} variant="contained" color="warning" className={classes.primaryButton} onClick={(event) => { this.consumption(1, event) }}>
            ESTERIL SIN CONSUMO
          </Button>
          <Button style={{ marginRight: 8 }} variant="contained" color="primary" className={classes.primaryButton} onClick={(event) => { this.consumption(2, event) }}>
            CONFIRMAR REGRESO
          </Button>
        </div>
        <ConfirmDialog
          open={this.state.openConfirmDialog}
          title="Cancelar solicitud"
          description="¿Está seguro que desea cancelar la solicitud en progreso?"
          onCancel={(this.handleCancelConfirmDialog)}
          onConfirm={this.handleAcceptConfirmDialog}
        />
        <KitDetailModal
          open={this.state.openKitDetailModal}
          order={this.state.order}
          data={this.state.selectedKit}
          onCancel={(this.handleCloseKitDetailModal)}
          onConfirm={this.handleCloseKitDetailModalWithChanges}
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
)(CollectOrder)
