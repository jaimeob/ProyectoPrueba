'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import { TextField, IconButton, Snackbar } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

// react-select
import ReactSelect from 'react-select'

function getModalStyle() {
  const top = 50
  const left = 50
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const styles = theme => ({
  container: {
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: theme.spacing.unit * 80,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    [theme.breakpoints.down('xs')]: {
      paddingTop: '10%',
      paddingBottom: '10%',
      background: 'white',
      width: '100%',
      height: '100%'
    }
  },
  innerContainer: {
    padding: 32,
    [theme.breakpoints.down('xs')]: {
      padding: 8
    }
  },
  paper: {
    marginTop: 8,
    marginBottom: 16,
    padding: '8px 16px'
  },
  modalTitle: {
    fontWeight: 600
  },
  actions: {
    position: 'sticky',
    left: 0,
    bottom: 0,
    background: 'white',
    padding: '16px 0px',
    textAlign: 'right',
    width: '100%'
  },
  primaryButton: {
    marginLeft: 16,
    fontWeight: 600,
    fontSize: 14
  },
  uploadButton: {
    fontWeight: 600,
    fontSize: 14
  },
  textFieldLarge: {
    width: '100%'
  },
  scrollBar: {
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px'
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      'border-radius': '4px',
      'background-color': 'rgba(0,0,0,.5)',
      '-webkit-box-shadow': '0 0 1px hsla(0,0%,100%,.5)'
    }
  }
})

class CreateProductsBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      blockTypeId: null,
      blockId: null,
      identifier: '',
      withQuery: false,
      withBluePoints: false,
      withInformation: false,
      callToAction: '',
      withCategory: false,
      withBrand: false,
      withDiscount: false,
      categories: [],
      selectedCategories: [],
      brands: [],
      selectedBrands: [],
      productsCode: [],
      products: '',
      orderBy: [],
      selectedOrderBy: [],
      productLimit: '',
      queryMongo: {},
      fullWidth: false,
      paddingTop: '0',
      paddingBottom: '0',
      sizeProductCard: 'normal'
    }
    this.handleChangeCallToAction = this.handleChangeCallToAction.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.createNewBlock = this.createNewBlock.bind(this)
    this.handleChangeIdentifier = this.handleChangeIdentifier.bind(this)
    this.handleChangeWithQuery = this.handleChangeWithQuery.bind(this)
    this.handleChangeProductLimit = this.handleChangeProductLimit.bind(this)
    this.handleChangeWithDiscount = this.handleChangeWithDiscount.bind(this)
    this.handleChangeWithBrand = this.handleChangeWithBrand.bind(this)
    this.handleChangeWithCategory = this.handleChangeWithCategory.bind(this)
    this.handleChangeProductCode = this.handleChangeProductCode.bind(this)
    this.handleChangeCategories = this.handleChangeCategories.bind(this)
    this.handleChangeBrands = this.handleChangeBrands.bind(this)
    this.handleChangeOrderBy = this.handleChangeOrderBy.bind(this)
    this.handleChangeCallToAction = this.handleChangeCallToAction.bind(this)
    this.handleChangePaddingTop = this.handleChangePaddingTop.bind(this)
    this.handleChangePaddingBottom = this.handleChangePaddingBottom.bind(this)
  }

  handleChangeIdentifier(event) {
    this.setState({
      identifier: event.target.value
    })
  }

  handleChangePaddingTop(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        paddingTop: event.target.value.trim()
      })
    } else {
      this.setState({
        paddingTop: '0'
      })
    }
  }

  handleChangePaddingBottom(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        paddingBottom: event.target.value.trim()
      })
    } else {
      this.setState({
        paddingBottom: '0'
      })
    }
  }

  handleChangeWithQuery(event) {
    let checked = event.target.checked

    if (checked) {
      this.setState({
        withQuery: checked,
        productLimit: '',
        productCode: [],
        products: '',
        selectedOrderBy: []
      })
    } else {
      this.setState({
        withQuery: checked,
        withCategory: false,
        withBrand: false,
        withDiscount: false,
        withBluePoints: false,
        selectedCategories: [],
        selectedBrands: [],
        productCode: [],
        products: '',
        selectedOrderBy: [],
        productLimit: 0
      })
    }
  }

  handleChangeWithDiscount(event) {
    let withDiscount = this.state.withDiscount

    this.setState({
      withDiscount: !withDiscount
    })
  }

  handleChangeWithCategory(event) {
    let withCategory = this.state.withCategory

    if (withCategory) {
      this.setState({
        withCategory: !withCategory
      })
    } else {
      this.setState({
        withCategory: !withCategory,
        selectedCategories: []
      })
    }
  }

  handleChangeWithBrand(event) {
    let withBrand = this.state.withBrand

    if (withBrand) {
      this.setState({
        withBrand: !withBrand
      })
    } else {
      this.setState({
        withBrand: !withBrand,
        selectedBrands: []
      })
    }
  }

  handleChangeProductCode(event) {
    let productsCodeWithCommas = event.target.value.trim()
    let trimmedProductsCodeArray = []
    let productsCodeArray = productsCodeWithCommas.split(',')

    productsCodeArray.forEach((productCode) => {
      trimmedProductsCodeArray.push(productCode.trim())
    })

    this.setState({
      productsCode: trimmedProductsCodeArray,
      products: event.target.value
    })
  }

  handleChangeCallToAction(event) {
    this.setState({
      callToAction: event.target.value.trim()
    })
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  handleChangeOrderBy(selectedOption) {
    this.setState({
      selectedOrderBy: selectedOption
    })
  }

  handleChangeProductLimit(event) {
    let productLimit = parseInt(event.target.value.trim())

    this.setState({
      productLimit: productLimit
    }, () => {
      if (productLimit < 1) {
        this.setState({
          openSnack: true,
          messageSnack: "El mínimo de productos es 1.",
          productLimit: 1
        })
      } else if (productLimit > 100) {
        this.setState({
          openSnack: true,
          messageSnack: "El limite de productos es 100.",
          productLimit: 100
        })
      }
    })
  }

  handleChangeCategories(selectedOption) {
    this.setState({
      selectedCategories: selectedOption
    })
  }

  handleChangeBrands(selectedOption) {
    this.setState({
      selectedBrands: selectedOption
    })
  }

  async createNewBlock() {
    if (this.state.identifier.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El identificador del bloque es obligatorio. Ingresa un identificador al nuevo bloque.'
      })
      return
    }

    if (this.state.withQuery) {
      if (!this.state.withCategory && !this.state.withBrand && !this.state.withDiscount && !this.state.withBluePoints) {
        this.setState({
          openSnack: true,
          messageSnack: 'Selecciona al menos una opción para formar un filtro de productos.'
        })
        return
      }

      if (this.state.withCategory && (Utils.isEmpty(this.state.selectedCategories) || this.state.selectedCategories === null)) {
        this.setState({
          openSnack: true,
          messageSnack: 'Selecciona al menos una categoría.'
        })
        return
      }

      if (this.state.withBrand && (Utils.isEmpty(this.state.selectedBrands) || this.state.selectedBrands === null)) {
        this.setState({
          openSnack: true,
          messageSnack: 'Selecciona al menos un producto con marca.'
        })
        return
      }

      if (this.state.productLimit.length <= 0 || isNaN((Number(this.state.productLimit)))) {
        this.setState({
          openSnack: true,
          messageSnack: 'El número de límite de productos no es válido. Escribe una cantidad.'
        })
        return
      } else {
        if (Number(this.state.productLimit <= 0)) {
          this.setState({
            openSnack: true,
            messageSnack: 'El número de límite de productos no es válido. Escribe una cantidad mayor a cero.'
          })
          return
        }
      }
    }

    if (!this.state.withQuery) {
      if (Utils.isEmpty(this.state.productsCode)) {
        this.setState({
          openSnack: true,
          messageSnack: 'Falta agregar productos. Escribe lotes de productos separados por coma.'
        })
        return
      }

      if (Utils.isEmpty(this.state.selectedOrderBy)) {
        this.setState({
          openSnack: true,
          messageSnack: 'Selecciona una opción para ordenar productos.'
        })
        return
      }
    }

    let selectedCategories = []
    let selectedBrands = []

    if (this.state.selectedCategories !== undefined && this.state.selectedCategories !== null) {
      this.state.selectedCategories.forEach(category => {
        selectedCategories.push({ node: category.node, name: category.label.split('/') })
      })

      selectedCategories.forEach(category => {
        let categoryArray = category.name
        categoryArray.forEach((element, index) => {
          categoryArray[index] = element.toLowerCase().replace(/\s/g, '-')
        })
      })
    }

    if (this.state.selectedBrands !== undefined && this.state.selectedBrands !== null) {
      this.state.selectedBrands.forEach(brand => {
        selectedBrands.push(brand.value)
      })
    }

    let response = null
    let data = {}

    if (this.props.editBlock) {
      if (this.props.landing) {
        data = {
          id: this.props.selectedBlock.id,
          landingId: this.props.selectedBlock.landingId,
          instanceId: this.props.selectedBlock.instanceId,
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          configs: {
            category: (this.state.withQuery && this.state.withCategory) ? selectedCategories : [],
            brands: (this.state.withQuery && this.state.withBrand) ? selectedBrands : [],
            discount: this.state.withDiscount,
            withBluePoints: this.state.withBluePoints,
            withInformation: this.state.withInformation,
            productsCode: (!this.state.withQuery) ? this.state.productsCode : [],
            order: this.state.selectedOrderBy.value,
            productLimit: Number(this.state.productLimit),
            withQuery: this.state.withQuery,
            withBrand: this.state.withBrand,
            withCategory: this.state.withCategory,
            query: this.state.queryMongo,
            fullWidth: this.state.fullWidth,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            sizeProductCard: this.state.sizeProductCard
          },
          v: this.props.selectedBlock.v,
          createdAt: this.props.selectedBlock.createdAt,
          position: this.props.selectedBlock.position,
          status:  this.props.selectedBlock.status
        }
      } else {
        data = {
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          configs: {
            category: (this.state.withQuery && this.state.withCategory) ? selectedCategories : [],
            brands: (this.state.withQuery && this.state.withBrand) ? selectedBrands : [],
            discount: this.state.withDiscount,
            withBluePoints: this.state.withBluePoints,
            withInformation: this.state.withInformation,
            productsCode: (!this.state.withQuery) ? this.state.productsCode : [],
            order: this.state.selectedOrderBy.value,
            productLimit: Number(this.state.productLimit),
            withQuery: this.state.withQuery,
            withBrand: this.state.withBrand,
            withCategory: this.state.withCategory,
            query: this.state.queryMongo,
            fullWidth: this.state.fullWidth,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            sizeProductCard: this.state.sizeProductCard
          },
          position: this.props.selectedBlock.position,
          status: true
        }
      }

      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'PATCH',
        resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
        endpoint: (this.props.landing !== undefined && this.props.landing) ?
          '/' + this.props.match.params.id + '/edit'
          :
          '/' + this.state.blockId + '/edit',
        data: data
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.updated) {
          this.clearData()
          this.props.handleCloseWithData()
        }
      } else {
        let message = Utils.messages.General.error
        if (response.data.error !== undefined && !Utils.isEmpty(response.data.error.message)) {
          message = response.data.error.message
        }
        this.setState({
          openSnack: true,
          messageSnack: message
        })
      }
    } else {
      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
        endpoint: (this.props.landing !== undefined && this.props.landing) ? '/' + this.props.match.params.id + '/new' : '/new',
        data: {
          identifier: this.state.identifier,
          blockTypeId: 22,
          category: selectedCategories,
          brands: selectedBrands,
          discount: this.state.withDiscount,
          withBluePoints: this.state.withBluePoints,
          withInformation: this.state.withInformation,
          productsCode: this.state.productsCode,
          order: this.state.selectedOrderBy.value,
          productLimit: Number(this.state.productLimit) || 100,
          withQuery: this.state.withQuery,
          withBrand: this.state.withBrand,
          withCategory: this.state.withCategory,
          fullWidth: this.state.fullWidth,
          paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
          paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
          sizeProductCard: this.state.sizeProductCard
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.created) {
          this.clearData()
          this.props.handleCloseWithData()
        }
      } else {
        let message = Utils.messages.General.error
        if (response.data.error !== undefined && !Utils.isEmpty(response.data.error.message)) {
          message = response.data.error.message
        }
        this.setState({
          openSnack: true,
          messageSnack: message
        })
      }
    }
  }

  handleRender() {
    this.clearData()
    if (this.props.editBlock && this.props.selectedBlock !== null) {
      let brands = this.props.options.brands
      let categories = this.props.options.categories
      let selectedBrands = []
      let selectedCategories = []
      let products = ''
      let productsCode = []
      let discount = false
      let bluePoints = false

      this.props.selectedBlock.configs.brands.forEach(selectedBrand => {
        for (let index = 0; index < brands.length; index++) {
          if (selectedBrand === brands[index].value) {
            selectedBrands.push(brands[index])
            break
          }
        }
      })

      this.props.selectedBlock.configs.category.forEach(selectedCategorie => {
        for (let index = 0; index < categories.length; index++) {
          if (selectedCategorie.node === categories[index].node) {
            selectedCategories.push(categories[index])
            break
          }
        }
      })

      if (this.props.selectedBlock.configs.query.where.bluePoints !== undefined) {
        bluePoints = this.props.selectedBlock.configs.query.where.bluePoints.status
      }

      bluePoints = this.props.selectedBlock.configs.withBluePoints
      discount = this.props.selectedBlock.configs.discount

      if (this.props.selectedBlock.configs.query.where.code !== undefined) {
        productsCode = [this.props.selectedBlock.configs.query.where.code]
        products = this.props.selectedBlock.configs.query.where.code

      } else if (this.props.selectedBlock.configs.query.where.or !== undefined) {
        if (this.props.selectedBlock.configs.query.where.or[0].code !== undefined && this.props.selectedBlock.configs.query.where.or.length > 0) {
          this.props.selectedBlock.configs.query.where.or.forEach(productCode => {
            productsCode.push(productCode.code)
          })

          products = productsCode.join(', ')
        }
      } else if (this.props.selectedBlock.configs.productsCode !== undefined) {
        productsCode = this.props.selectedBlock.configs.productsCode
        products = this.props.selectedBlock.configs.productsCode.join(',')
      }

      let orderBy = null
      let orderOptions = [
        { value: 'priceLowToHight', label: 'Precio: menor a mayor' },
        { value: 'priceHightToLow', label: 'Precio: mayor a menor' },
        { value: 'brandNameASC', label: 'Marca: A - Z' },
        { value: 'brandNameDESC', label: 'Marca: Z - A' },
        { value: 'bestOffer', label: 'Mejor oferta' },
        { value: 'bluePoints', label: 'Mayor porcentaje puntos azules' }]

      for (let i = 0; i < orderOptions.length; i++) {
        if (orderOptions[i].value === this.props.selectedBlock.configs.order) {
          orderBy = orderOptions[i]
          break
        }
      }

      this.setState({
        blockTypeId: this.props.selectedBlock.blockTypeId,
        blockId: this.props.selectedBlock.id,
        queryMongo: this.props.selectedBlock.configs.query,
        identifier: this.props.selectedBlock.identifier,
        withQuery: this.props.selectedBlock.configs.withQuery,
        productsCode: productsCode,
        products: products,
        productLimit: this.props.selectedBlock.configs.productLimit,
        withCategory: (selectedCategories.length > 0) ? true : false,
        withBrand: (selectedBrands.length > 0) ? true : false,
        withDiscount: discount,
        withBluePoints: bluePoints,
        withInformation: this.props.selectedBlock.configs.withInformation,
        selectedBrands: selectedBrands,
        selectedCategories: selectedCategories,
        selectedOrderBy: orderBy,
        fullWidth: this.props.selectedBlock.configs.fullWidth,
        paddingTop: this.props.selectedBlock.configs.paddingTop,
        paddingBottom: this.props.selectedBlock.configs.paddingBottom,
        sizeProductCard: this.props.selectedBlock.configs.sizeProductCard
      })

      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/editar/' + this.props.selectedBlock.id)
      } else {
        this.props.history.push('/cms/' + this.props.selectedBlock.id + '/editar')
      }
    } else {
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/bloques/nuevo/22')
      } else {
        this.props.history.push('/cms/nuevo/22')
      }
    }
  }

  clearData() {
    this.setState({
      openSnack: false,
      messageSnack: '',
      blockTypeId: null,
      blockId: null,
      identifier: '',
      withQuery: false,
      withBluePoints: false,
      withInformation: false,
      callToAction: '',
      withCategory: false,
      withBrand: false,
      withDiscount: false,
      categories: [],
      selectedCategories: [],
      brands: [],
      selectedBrands: [],
      productsCode: [],
      products: '',
      orderBy: [],
      selectedOrderBy: [],
      productLimit: '',
      queryMongo: {},
      fullWidth: false,
      paddingTop: '0',
      paddingBottom: '0',
      sizeProductCard: 'normal'
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >
        {
          (!this.props.editBlock || this.props.selectedBlock !== null) ?
          <div style={getModalStyle()} className={`${classes.container} ${classes.scrollBar}`}>
            <Grid container className={classes.innerContainer}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="h4" className={classes.modalTitle}>
                Crear nuevo carrusel de productos.
                </Typography>
                <Typography variant="body2">
                  Ingresa los datos del nuevo bloque.
                </Typography>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Typography variant="body1"><strong>Datos generales.</strong></Typography>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Identificador del bloque *"
                        placeholder="Identificador del bloque..."
                        value={this.state.identifier}
                        onChange={(event) => { this.handleChangeIdentifier(event) }}
                        autoFocus={true}
                      />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxFullWidth" style={{ marginTop: -2 }} checked={this.state.fullWidth} onChange={() => { this.setState({ fullWidth: !this.state.fullWidth }) }} />
                      <label for="checkboxFullWidth"><strong>Full width</strong> (ancho completo)</label>
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8, paddingRight: 16 }}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Separación superior (top)"
                        placeholder="Indicar separación top banner..."
                        value={this.state.paddingTop}
                        onChange={(event) => { this.handleChangePaddingTop(event) }}
                      />
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8 }}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Separación inferior (bottom)"
                        placeholder="Indicar separación bottom banner..."
                        value={this.state.paddingBottom}
                        onChange={(event) => { this.handleChangePaddingBottom(event) }}
                      />
                    </Grid>
                    {/*
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                      <Typography variant="body1">
                        Tamaño de la tarjeta de producto.
                      </Typography>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxSizeProductCardSmall" style={{ marginTop: -2 }} checked={this.state.sizeProductCard === 'small'} onChange={() => { this.setState({ sizeProductCard: 'small' }) }} />
                      <label for="checkboxSizeProductCardSmall"><strong>Chico</strong></label>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxSizeProductCardNormal" style={{ marginTop: -2 }} checked={this.state.sizeProductCard === 'normal'} onChange={() => { this.setState({ sizeProductCard: 'normal' }) }} />
                      <label for="checkboxSizeProductCardNormal"><strong>Normal</strong></label>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxSizeProductCardBig" style={{ marginTop: -2 }} checked={this.state.sizeProductCard === 'big'} onChange={() => { this.setState({ sizeProductCard: 'big' }) }} />
                      <label for="checkboxSizeProductCardBig"><strong>Grande</strong></label>
                    </Grid>
                    */}
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    style={{ marginBottom: 8 }}>
                    <Grid item xl={2} lg={2} md={2} sm={2} xs={2}>
                      <Switch
                        checked={this.state.withInformation}
                        onChange={(event) => { this.setState({ withInformation: event.target.checked }) }}
                      />
                    </Grid>
                    <Grid item xl={10} lg={10} md={10} sm={10} xs={10}>
                      <Typography variant="body1"><strong>Incluir información del producto.</strong></Typography>
                    </Grid>
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container
                    direction="row"
                    justify="flex-start"
                    alignItems="center"
                    style={{ marginBottom: 8 }}>
                    <Grid item xl={2} lg={2} md={2} sm={2} xs={2}>
                      <Switch
                        checked={this.state.withQuery}
                        onChange={(event) => { this.handleChangeWithQuery(event) }}
                      />
                    </Grid>
                    <Grid item xl={10} lg={10} md={10} sm={10} xs={10}>
                      <Typography variant="body1"><strong>Generar lista de productos.</strong></Typography>
                    </Grid>
                  </Grid>
                  {
                    (this.state.withQuery) ?
                    <Grid container
                      direction="row"
                      justify="flex-start"
                      alignItems="center"
                      style={{ marginBottom: 16 }}>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <Typography variant="body1"><strong>Contenido del query.</strong></Typography>
                      </Grid>

                      <Grid container justify="space-between">
                        <FormControlLabel item xl={3} lg={3} md={3} sm={3} xs={3}
                          control={
                            <Checkbox
                              checked={this.state.withCategory}
                              onChange={(event) => { this.handleChangeWithCategory(event) }}
                              value={'withCategory'}
                            />
                          }
                          label="Categoría(s)"
                        />
                        {
                          (this.state.withCategory) ?
                            <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                              <ReactSelect
                                placeholder={'Seleccionar categorías...'}
                                isMulti
                                options={this.props.options.categories}
                                noOptionsMessage={() => 'Sin datos...'}
                                onChange={this.handleChangeCategories}
                                defaultValue={
                                  (this.props.editBlock && this.props.selectedBlock.configs.category !== undefined)
                                    ?
                                    this.state.selectedCategories
                                    :
                                    false
                                }
                              />
                            </Grid>
                            :
                            ''
                        }
                      </Grid>

                      <Grid container justify="space-between">
                        <FormControlLabel item xl={3} lg={3} md={3} sm={3} xs={3}
                          control={
                            <Checkbox
                              checked={this.state.withBrand}
                              onChange={(event) => { this.handleChangeWithBrand(event) }}
                              value={'withBrand'}
                            />
                          }
                          label="Marca(s)"
                        />
                        {
                          (this.state.withBrand) ?
                            <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                              <ReactSelect
                                placeholder={'Seleccionar marcas...'}
                                isMulti
                                options={this.props.options.brands}
                                noOptionsMessage={() => 'Sin datos...'}
                                onChange={this.handleChangeBrands}
                                defaultValue={
                                  (this.props.editBlock && this.props.selectedBlock.configs.brands !== undefined)
                                    ?
                                    this.state.selectedBrands
                                    :
                                    false
                                }
                              />
                            </Grid>
                            :
                            ''
                        }
                      </Grid>

                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={this.state.withDiscount}
                              onChange={(event) => { this.handleChangeWithDiscount(event) }}
                              value={'withDiscount'}
                            />
                          }
                          label="Con descuento"
                        />
                      </Grid>

                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={this.state.withBluePoints}
                              onChange={(event) => { this.setState({ withBluePoints: event.target.checked }) }}
                              value={'withBluePoints'}
                            />
                          }
                          label="Con puntos azules"
                        />
                      </Grid>

                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 24 }}>
                        <ReactSelect
                          placeholder="Ordenar por"
                          options={[
                            { value: 'priceLowToHight', label: 'Precio: menor a mayor' },
                            { value: 'priceHightToLow', label: 'Precio: mayor a menor' },
                            { value: 'brandNameASC', label: 'Marca: A - Z' },
                            { value: 'brandNameDESC', label: 'Marca: Z - A' },
                            { value: 'bestOffer', label: 'Mejor oferta' },
                            { value: 'bluePoints', label: 'Mayor puntos azules' }]}
                          noOptionsMessage={() => 'Sin datos...'}
                          onChange={this.handleChangeOrderBy}
                          value={this.state.selectedOrderBy}
                          defaultValue={(this.state.selectedOrderBy !== undefined) ? this.state.selectedOrderBy : false}
                          isSearchable={false}
                        />
                      </Grid>

                      <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                        <TextField
                          className={classes.textFieldLarge}
                          style={{ marginBottom: 8, marginTop: 8 }}
                          type="number"
                          label="Límite *"
                          placeholder="Ingresar límite..."
                          value={this.state.productLimit}
                          onChange={(event) => { this.handleChangeProductLimit(event) }}
                        />
                      </Grid>
                    </Grid>
                    :
                    ''
                  }
                </Paper>
                  {
                    (!this.state.withQuery) ?
                      <Paper className={classes.paper}>
                        <Grid container>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <Typography variant="body1"><strong>Productos.</strong></Typography>
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                            <TextField
                              className={classes.textFieldLarge}
                              style={{ marginBottom: 8 }}
                              label="Ingresar lote y separar por coma"
                              placeholder="Ejemplo: LOTE1,LOTE2,LOTE3, etc."
                              value={this.state.products}
                              onChange={(event) => { this.handleChangeProductCode(event) }}
                            />
                          </Grid>

                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 24, marginBottom: 16 }}>
                            <ReactSelect
                              placeholder="Ordenar por"
                              options={[
                                { value: 'priceLowToHight', label: 'Precio: menor a mayor' },
                                { value: 'priceHightToLow', label: 'Precio: mayor a menor' },
                                { value: 'brandNameASC', label: 'Marca: A - Z' },
                                { value: 'brandNameDESC', label: 'Marca: Z - A' },
                                { value: 'bestOffer', label: 'Mejor oferta' },
                                { value: 'bluePoints', label: 'Mayor puntos azules' }]}
                              noOptionsMessage={() => 'Sin datos...'}
                              onChange={this.handleChangeOrderBy}
                              value={this.state.selectedOrderBy}
                              isSearchable={false}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                      :
                      ''
                  }

                </Grid>
              </Grid>
              <div className={classes.actions}>
                <Button
                  onClick={this.handleClose}
                >
                  CERRAR
                                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={this.createNewBlock}
                  className={classes.primaryButton}
                >
                  CONFIRMAR
                                </Button>
              </div>
              <Snackbar
                autoHideDuration={5000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={this.state.openSnack}
                onClose={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
                message={
                  <span>{this.state.messageSnack}</span>
                }
                action={[
                  <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
                  >
                    <CloseIcon />
                  </IconButton>
                ]}
              />
            </div>
            :
            ''
        }
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(CreateProductsBlock)
