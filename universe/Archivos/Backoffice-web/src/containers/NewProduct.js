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
    width: 100,
    heigth: 100,
    marginRight: 4
  },
  tag: {
    float: 'left',
    margin: 0,
    marginTop: 4,
    marginRight: 4,
    padding: 4,
    paddingLeft: 16,
    paddingRight: 8,
    width: 'max-content',
    borderRadius: 6,
    color: 'white',
    backgroundColor: '#9CA7C1'
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
      margin: '-',
      profit: '-',
      tags: [],
      variants: [],
      values: {
        name: '',
        description: '',
        categoryId: null,
        subCategoryId: null,
        materialId: null,
        measurementUnitId: null,
        brandId: null,
        providerId: null,
        price: '',
        cost: '',
        productTagTypeId: null,
        productTagId: null,
        variantCost: '',
        variantPrice: '',
        comments: ''
      },
      deliveryDate: null,
      addressId: null,
      address: null,
      docs: [],
      deletedDocs: [],
      comments: ''
    }

    this.handleChangeValue = this.handleChangeValue.bind(this)
    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.handleChangeDeliveryDate = this.handleChangeDeliveryDate.bind(this)
    this.handleChangeAddressLoad = this.handleChangeAddressLoad.bind(this)
    this.getUserFullName = this.getUserFullName.bind(this)
    this.handleChangeNote = this.handleChangeNote.bind(this)
    this.deleteTag = this.deleteTag.bind(this)
    this.addVariant = this.addVariant.bind(this)
    this.deleteVariant = this.deleteVariant.bind(this)
    this.handleChangeComments = this.handleChangeComments.bind(this)
    this.confirmUploader = this.confirmUploader.bind(this)
    this.handleCancelConfirmDialog = this.handleCancelConfirmDialog.bind(this)
    this.handleAcceptConfirmDialog = this.handleAcceptConfirmDialog.bind(this)
    this.getMargin = this.getMargin.bind(this)
    this.getProfit = this.getProfit.bind(this)
    
    this.getVariants = this.getVariants.bind(this)

    this.createProduct = this.createProduct.bind(this)
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

  addVariant(event) {
    const self = this
    event.preventDefault()

    let price = Number(this.state.values.variantPrice)
    let cost = Number(this.state.values.variantCost)

    let variant = {
      tags: this.state.tags,
      cost: cost,
      price: price
    }

    if (this.state.tags.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Agrega variantes al producto.'
      })
    } else if (isNaN(variant.price) || variant.price <= 0 || isNaN(variant.cost)) {
      this.setState({
        openSnack: true,
        messageSnack: 'Revisa el precio y costo de la variante.'
      })
    } else {
      let variants = this.state.variants
      let length = this.state.tags.length
      let exist = false
      let count = 0
      variants.forEach((v) => {
        if (v.tags.length === length) {
          v.tags.forEach((t1) => {
            this.state.tags.forEach((t2) => {
              if (t1.id === t2.id) {
                count ++
              }
            })
          })
        }
        if (count === length) {
          exist = true
        }
        count = 0
      })

      if (exist) {
        this.setState({
          openSnack: true,
          messageSnack: 'La variante ya se encuentra agregada.'
        })
        return
      }

      let values = this.state.values
      values['productTagTypeId'] = null
      values['productTagId'] = null
      
      variants.unshift(variant)
      this.setState({
        values: values,
        tags: [],
        variants: variants
      }, () => {
        self.props.clearAutocomplete('variantTypeAutocomplete')
        self.props.reloadAutocomplete('variantTypeAutocomplete')
        self.props.reloadAutocomplete('variantAutocomplete')
      })
    }
  }

  deleteVariant(idx) {
    let variants = this.state.variants
    variants.splice(idx, 1)
    this.setState({
      variants: variants
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

  async handleChangeAddressLoad(checkbox) {
    let checkboxs = this.state.checkboxs
    let id = null
    let entity = ''
    let resource = ''
    let checked = !checkboxs[checkbox]

    if (checkbox === 0) {
      entity = 'hospital'
      resource = 'hospitals'
      id = this.state.values.hospitalId
    } else if (checkbox === 1) {
      entity = 'doctor'
      resource = 'doctors'
      id = this.state.values.doctorId
    } else {
      entity = 'paciente'
      resource = 'patients'
      id = this.state.values.patientId
    }
    
    if (id === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'No haz seleccionado un ' + entity + '.'
      })
      return
    }
    checkboxs.forEach((check, idx) => {
      checkboxs[idx] = false
    })
    checkboxs[checkbox] = checked
    this.setState({
      addressId: null,
      address: null,
      checkboxs: checkboxs
    }, async () => {
      if (checked) {
        let response = await requestAPI({
          host: Utils.constants.HOST,
          method: 'GET',
          resource: resource,
          endpoint: '/' + id + '/address'
        })
  
        let error = true
        if (response.status === Utils.constants.status.SUCCESS) {
          if (response.data.success) {
            error = false
            this.setState({
              addressId: response.data.address.id,
              address: response.data.address
            })
          } else {
            this.setState({
              openSnack: error,
              messageSnack: 'El ' + entity + ' no tiene dirección.'
            })
          }
        } else {
          this.setState({
            openSnack: error,
            messageSnack: Utils.messages.General.error
          })
        }
  
        if (error) {
          checkboxs[checkbox] = !checked
          this.setState({
            checkboxs: checkboxs
          })
        }
      }
    })
  }

  handleChangeDeliveryDate(event) {
    let date = event.target.value
    if (Utils.isEmpty(date))
      date = null
    this.setState({
      deliveryDate: date
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

    let tags = this.state.tags
    let variants = this.state.variants

    let after = values[type]
    values[type] = value
    if (value !== null && type !== 'productTagTypeId')
      values[type] = value.id

    if (type === 'categoryId') {
      values['subCategoryId'] = null
      values['productTagTypeId'] = null
      values['productTagId'] = null
      tags = []
      variants = []
    }
    else if (type === 'subCategoryId') {
      values['productTagTypeId'] = null
      values['productTagId'] = null
      tags = []
      variants = []
    }
    else if (type === 'productTagTypeId') {
      values['productTagId'] = null
    }

    this.setState({
      values: values,
      tags: tags,
      variants: variants
    }, () => {
      if (type === 'categoryId' && after !== null) {
        self.props.reloadAutocomplete('subCategoryId')
      } else if (type === 'subCategoryId' && after !== null) {
        self.props.clearAutocomplete('variantTypeAutocomplete')
      } else if (type === 'productTagTypeId') {
        self.props.reloadAutocomplete('variantAutocomplete')
      } else if (type === 'productTagId') {
        self.props.clearAutocomplete('variantAutocomplete')
        let tags = self.state.tags
        let exist = false
        let idxTag = 0
        let message = ''
        tags.forEach((tag, idx) => {
          if (tag.data.tagTypeId === self.state.values.productTagTypeId.data.id) {
            exist = true
            idxTag = idx
            message = 'Variante remplazada.'
          }
          if (tag.data.id === value.data.id) {
            message = 'La variante ya ha sido seleccionada.'
          }
        })

        value.data.tagTypeName = self.state.values.productTagTypeId.data.name
        if (exist) {
          self.setState({
            openSnack: true,
            messageSnack: message
          })
          tags.splice(idxTag, 1, value)
        }
        else {
          tags.push(value)
        }

        self.setState({
          tags: tags
        })
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

  async createProduct(event) {
    event.preventDefault()

    let error = false
    let messageError = ''
    if (Utils.isEmpty(this.state.values.name)) {
      error = true
      messageError = 'No haz capturado el nombre del producto.'
    } else if (this.state.values.categoryId === null) {
      error = true
      messageError = 'No haz seleccionado una categoría.'
    } else if (this.state.values.subCategoryId === null) {
      error = true
      messageError = 'No haz seleccionado una sub categoría.'
    } else if (this.state.values.measurementUnitId === null) {
      error = true
      messageError = 'No haz seleccionado una unidad de medida.'
    } else if (this.state.variants <= 0) {
      error = true
      messageError = 'Es necesario capturar por lo menos 1 variante.'
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
      resource: 'products',
      endpoint: '/create',
      data: {
        name: this.state.values.name,
        description: this.state.values.description,
        categoryId: this.state.values.categoryId,
        subCategoryId: this.state.values.subCategoryId,
        materialId: this.state.values.materialId,
        measurementUnitId: this.state.values.measurementUnitId,
        brandId: this.state.values.brandId,
        providerId: this.state.values.providerId,
        images: this.state.docs,
        variants: this.state.variants,
        comments: this.state.values.comments
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.props.history.push('/productos')
    } else {
      let errorMessage = Utils.messages.General.error
      if (response.data.error.errno === 1062) {
        errorMessage = 'SKU duplicado. Un producto con estas características ya existe.'
      } else if (response.data.error.error.errorMessage === '00001') {
        if (response.data.error.error.exists.length > 1) {
          errorMessage = 'SKUs duplicados. Más de una variante ya existe.'
        } else {
          errorMessage = 'SKU duplicado. Una variante ya existe'
        }
      }
      this.setState({
        openSnack: true,
        messageSnack: errorMessage
      })
    }
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <Title
          title="Captura de producto."
          description={ <span>Producto capturado por: <strong>{ this.getUserFullName() }</strong></span> }
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
              <Typography variant="h6"><strong>1. Datos generales del producto.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Los campos marcados con asterisco son obligatorios (*).</Typography>
              <div style={{ marginTop: 16 }}>
                <Typography><strong>Nombre del producto *</strong></Typography>
                <TextField
                  placeholder="Ejemplo: CLAVO DE FEMUR..."
                  className={classes.textFieldLarge}
                  value={this.state.values.name}
                  onChange={(event) => { this.handleChangeValue('name', event) }}
                  type="text"
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <Typography><strong>Descripción</strong></Typography>
                <TextField
                  placeholder="Describe el producto a capturar (opcional)..."
                  className={classes.textFieldLarge}
                  value={this.state.values.description}
                  onChange={(event) => { this.handleChangeValue('description', event) }}
                  type="text"
                />
              </div>
              <Grid container>
                <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={classes.first}>
                  <Autocomplete
                    host={Utils.constants.HOST}
                    label="Categoría *"
                    resource="categories"
                    param="name"
                    addToCatalog={true}
                    messages={{
                      title: "Crear nueva categoría.",
                      description: "Captura el nombre del nueva categoría.",
                      params: {
                        name: "Nombre de la categoría"
                      }
                    }}
                    createParams={[
                      { name: "name", type: "string", required: true }
                    ]}
                    value={this.state.values.categoryId}
                    onChange={(newValue) => this.handleChangeValueSelect('categoryId', newValue)}
                  />
                </Grid>
                <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                  {
                    (this.state.values.categoryId !== null) ?
                    <Autocomplete
                      id="subCategoryId"
                      host={Utils.constants.HOST}
                      label="Sub categoría *"
                      resource="subcategories"
                      param="name"
                      filters={{
                        where: {and: [{categoryId: this.state.values.categoryId}, {status: {neq: 2}}]}, limit: 5
                      }}
                      withIdFilter={[
                        {
                          ['categoryId']: this.state.values.categoryId
                        }
                      ]}
                      addToCatalog={true}
                      messages={{
                        title: "Crear nueva sub categoría.",
                        description: "Captura el nombre de la nueva sub categoría.",
                        params: {
                          name: "Nombre de la subcategoría"
                        }
                      }}
                      createParams={[
                        { name: "name", type: "string", required: true },
                        { name: "categoryId", type: "id", value: this.state.values.categoryId, hidden: true, required: true }
                      ]}
                      value={this.state.values.subCategoryId}
                      onChange={(newValue) => this.handleChangeValueSelect('subCategoryId', newValue)}
                    />
                    :
                    ''
                  }
                </Grid>
              </Grid>
              <Autocomplete
                host={Utils.constants.HOST}
                label="Unidad de medida *"
                resource="measurements"
                param="name"
                addToCatalog={true}
                messages={{
                  title: "Crear nueva unidad de medida.",
                  description: "Captura el nombre de la nueva unidad de medida.",
                  params: {
                    name: "Nombre de la unidad de medida"
                  }
                }}
                createParams={[
                  { name: "name", type: "string", required: true }
                ]}
                value={this.state.values.measurementUnitId}
                onChange={(newValue) => this.handleChangeValueSelect('measurementUnitId', newValue)}
              />
              <Autocomplete
                host={Utils.constants.HOST}
                label="Marca"
                resource="brands"
                param="name"
                searchParams={["firstName", "lastName"]}
                addToCatalog={true}
                messages={{
                  title: "Crear nueva marca.",
                  description: "Captura el nombre de la nueva marca.",
                  params: {
                    name: "Nombre de la marca",
                  }
                }}
                createParams={[
                  { name: "name", type: "string", required: true }
                ]}
                value={this.state.values.brandId}
                onChange={(newValue) => this.handleChangeValueSelect('brandId', newValue)}
              />
              <Autocomplete
                host={Utils.constants.HOST}
                label="Proveedor por defecto"
                resource="providers"
                param="name"
                addToCatalog={true}
                messages={{
                  title: "Crear nuevo proveedor.",
                  description: "Captura el nombre del nuevo proveedor.",
                  params: {
                    name: "Nombre del proveedor",
                  }
                }}
                createParams={[
                  { name: "name", type: "string", required: true }
                ]}
                value={this.state.values.providerId}
                onChange={(newValue) => this.handleChangeValueSelect('providerId', newValue)}
              />
            </Paper>
          </Grid>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={classes.container}>
            <Paper className={classes.containerPaper}>
              <Grid container>
                <Grid item xl={8} lg={8} md={8} sm={12} xs={12}>
                  <Typography variant="h6"><strong>2. Imágenes del producto.</strong></Typography>
                  <Typography variant="body2" style={{ fontSize: 13 }}>Imágenes del producto por ángulo.</Typography>
                  <Typography><strong>{this.state.docs.length}</strong> { (this.state.docs.length === 1) ? 'imagen cargada' : 'imágenes cargadas' }</Typography>
                  {
                    (this.state.docs.length > 0) ?
                    <div style={{ marginTop: 12 }}>
                      {
                        this.state.docs.map((doc) => {
                          return (
                            <img className={classes.imageProduct} src={doc.data} alt={doc.name} />
                          )
                        })
                      }
                    </div>
                    :
                    ''
                  }
                </Grid>
                <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
                  <Button variant="contained" color="primary" className={classes.primaryButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                    this.setState({ openUploader: true })
                  }}>
                      SUBIR IMÁGENES
                  </Button>
                  <Uploader
                    open={this.state.openUploader}
                    host={Utils.constants.HOST}
                    title="Subir imágenes del producto."
                    description="Adjunta las imágenes aquí."
                    use="products"
                    validFormats=".png,.jpeg,.jpg"
                    docs={this.state.docs}
                    handleCloseWithData={(docs, deletedDocs) => { this.confirmUploader(docs, deletedDocs) }}
                    handleClose={() => { this.setState({openUploader: false}) }}
                  />
                </Grid>
              </Grid>
            </Paper>
            <Paper className={classes.containerPaper} style={{ marginTop: 24 }}>
              <Grid container>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="h6"><strong>3. Precio.</strong></Typography>
                  <Typography variant="body2" style={{ fontSize: 13 }}>Precio, costo, margen y ganancia bruta del producto.</Typography>
                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <div style={{ marginTop: 12 }}>
                    <Typography><strong>Precio</strong></Typography>
                    <TextField
                      placeholder="$ 0.00 M.N."
                      className={classes.textFieldLarge}
                      value={this.state.values.price}
                      onChange={(event) => { this.handleChangeValue('price', event) }}
                      type="number"
                    />
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Typography><strong>Costo</strong></Typography>
                    <TextField
                      placeholder="$ 0.00 M.N."
                      className={classes.textFieldLarge}
                      value={this.state.values.cost}
                      onChange={(event) => { this.handleChangeValue('cost', event) }}
                      type="number"
                    />
                  </div>
                </Grid>
                <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 12 }}>
                  <Typography><strong>Margen bruto</strong></Typography>
                  <Typography variant="body1">{this.getMargin()}</Typography>
                </Grid>
                <Grid item xl={6} lg={6} md={6} sm={6} xs={6}  style={{ marginTop: 12 }}>
                  <Typography><strong>Ganancia bruta</strong></Typography>
                  <Typography variant="body1">{this.getProfit()}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <Grid container>
          {
            (this.state.values.subCategoryId !== null) ?
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={[classes.container, classes.first]}>
              <Paper className={classes.containerPaper} style={{ marginTop: 24 }}>
                <Grid container>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Typography variant="h6"><strong>4. Variantes.</strong></Typography>
                    <Typography variant="body2" style={{ fontSize: 13 }}>Se creará un SKU por cada variante que se agregue.</Typography>
                  </Grid>
                  <Grid item xl={3} lg={3} md={3} sm={6} xs={6} style={{ paddingRight: 16 }}>
                    <Autocomplete
                      id="variantTypeAutocomplete"
                      host={Utils.constants.HOST}
                      label="Tipo de variante"
                      resource="tag-types"
                      param="name"
                      addToCatalog={true}
                      messages={{
                        title: "Crear nuevo tipo de variante.",
                        description: "Captura el nombre del nuevo tipo de variante.",
                        params: {
                          name: "Tipo de variante"
                        }
                      }}
                      createParams={[
                        { name: "name", type: "string", required: true }
                      ]}
                      value={this.state.values.productTagTypeId}
                      onChange={(newValue) => this.handleChangeValueSelect('productTagTypeId', newValue)}
                    />
                  </Grid>
                  <Grid item xl={3} lg={3} md={3} sm={6} xs={6} className={classes.first}>
                    {
                      (this.state.values.productTagTypeId !== null) ?
                      <Autocomplete
                        id="variantAutocomplete"
                        host={Utils.constants.HOST}
                        label="Variantes"
                        resource="tags"
                        param="name"
                        filters={{
                          where: {and: [{subCategoryId: this.state.values.subCategoryId}, {tagTypeId: this.state.values.productTagTypeId.data.id}, {status: {neq: 2}}]}, limit: 5
                        }}
                        addToCatalog={true}
                        withIdFilter={[
                          {
                            ['subCategoryId']: this.state.values.subCategoryId
                          },
                          {
                            ['tagTypeId']: this.state.values.productTagTypeId.data.id
                          }
                        ]}
                        messages={{
                          title: "Crear nueva variante.",
                          description: "Captura el nombre de la nueva variante.",
                          params: {
                            name: "Variante"
                          }
                        }}
                        createParams={[
                          { name: "name", type: "string", required: true },
                          { name: "subCategoryId", value: this.state.values.subCategoryId, type: "number", hidden: true, required: true },
                          { name: "tagTypeId", value: this.state.values.productTagTypeId.data.id, type: "number", hidden: true, required: true }
                        ]}
                        value={this.state.values.productTagId}
                        onChange={(newValue) => this.handleChangeValueSelect('productTagId', newValue)}
                      />
                      :
                      ''
                    }
                  </Grid>
                  <Grid item xl={3} lg={3} md={3} sm={8} xs={8}>
                    <Grid container>
                      <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 24 }}>
                        <Typography><strong>Precio</strong></Typography>
                        <TextField
                          placeholder="$ 0.00 M.N."
                          className={classes.textFieldLarge}
                          value={this.state.values.variantPrice}
                          onChange={(event) => { this.handleChangeValue('variantPrice', event) }}
                          type="number"
                        />
                      </Grid>
                      <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ paddingLeft: 16, marginTop: 24 }}>
                        <Typography><strong>Costo</strong></Typography>
                        <TextField
                          placeholder="$ 0.00 M.N."
                          className={classes.textFieldLarge}
                          value={this.state.values.variantCost}
                          onChange={(event) => { this.handleChangeValue('variantCost', event) }}
                          type="number"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xl={3} lg={3} md={3} sm={4} xs={4} style={{ paddingLeft: 16, marginTop: 40 }}>
                    <Button variant="contained" color="primary" className={classes.primaryButton} style={{ width: '100%' }} onClick={ (event) => { this.addVariant(event) } }>
                      AGREGAR
                    </Button>
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <ul style={{ margin: 0, padding: 0, marginTop: 12, listStyle: 'none' }}>
                      {
                        this.state.tags.map((tag, tagIdx) => {
                          return (
                            <li className={classes.tag}>{ tag.data.name + ' (' + tag.data.tagTypeName + ')' } <IconButton onClick={ (event) => { this.deleteTag(tagIdx) } }><Icon style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>close</Icon></IconButton></li>
                          )
                        })
                      }
                    </ul>
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    {
                      (this.state.variants.length > 0) ?
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <Typography variant="body1"><strong>SKU marca</strong></Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1"><strong>Nombre</strong></Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1"><strong>Variantes</strong></Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1"><strong>Precio</strong></Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1"><strong>Costo</strong></Typography>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {
                            this.state.variants.map((variant, idx) => {
                              return (
                                <TableRow>
                                  <TableCell>
                                  <TextField type="text"/>
                                  </TableCell>
                                  <TableCell>
                                    { self.state.values.name + ' ' + self.getVariants(variant) }
                                  </TableCell>
                                  <TableCell>
                                    {
                                      variant.tags.map((tag) => {
                                        return (
                                          <span className={classes.tag} style={{ paddingLeft: 6 }}>{ tag.data.name + '(' + tag.data.tagTypeName + ')' }</span>
                                        )
                                      })
                                    }
                                  </TableCell>
                                  <TableCell>$ {Utils.numberWithCommas(variant.price.toFixed(2))} M.N.</TableCell>
                                  <TableCell>$ {Utils.numberWithCommas(variant.cost.toFixed(2))} M.N.</TableCell>
                                  <TableCell><IconButton onClick={ (event) => { this.deleteVariant(idx) } }><Icon>delete</Icon></IconButton></TableCell>
                                </TableRow>
                              )
                            })
                          }
                        </TableBody>
                      </Table>
                      :
                      <Empty
                        title="¡No hay variantes!"
                        description="No se han agregado variantes al producto."
                      />
                    }
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            :
            ''
          }
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
          <Button variant="contained" color="primary" className={classes.primaryButton} onClick={(event) => { this.createProduct(event) }}>
            GUARDAR PRODUCTO
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
