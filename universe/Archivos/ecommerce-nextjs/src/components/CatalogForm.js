import { Grid, Typography, TextField, Box, RadioGroup, FormControlLabel, Radio, Select, Switch, Button, Checkbox, Snackbar, IconButton, CircularProgress } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Uploader from './Uploader'
import Utils from '../resources/Utils'
import ReactSelect from 'react-select'
import { requestAPI } from '../api/CRUD'
import _ from 'lodash'

const styles = (theme) => ({
  uploadRectangle: {
    width: '134px',
    height: '134px',
    margin: '1px 21px 0 0',
    padding: '47px 23px',
    border: 'dashed 1px #979797',
    'background-color': '#f0f0f0'
  },
  text: {
    fontSize: 12
  }
})

const orderByOptions = [
  { value: 'priceLowToHight', label: 'Precio: menor a mayor' },
  { value: 'priceHightToLow', label: 'Precio: mayor a menor' },
  { value: 'brandNameASC', label: 'Marca: A - Z' },
  { value: 'brandNameDESC', label: 'Marca: Z - A' },
  { value: 'bestOffer', label: 'Mejor oferta' },
  { value: 'bluePoints', label: 'Mayor puntos azules' }
]

class CatalogForm extends Component {
  constructor(props) {
    super(props)

    const { currentCatalog } = this.props

    this.state = {
      loadingInfo: false,
      catalogName: currentCatalog?.name || '',
      generateProductList: currentCatalog !== undefined && currentCatalog?.configs.productsLimit !== '',
      categoriesSelected: currentCatalog?.configs.categories.length > 0,
      brandsSelected: currentCatalog?.configs.brands.length > 0,
      discountSelected: currentCatalog?.configs.withDiscount || false,
      bluePoints: false,
      catalogPresentation: currentCatalog?.configs.catalogPresentation || 'grid',
      columnsPerPage: Number(currentCatalog?.configs.columnsPerPage) || 0,
      productsPerPage: Number(currentCatalog?.configs.productsPerPage) || undefined,
      openCoverImageUploader: false,
      openBackCoverImageUploader: false,
      coverImage:
        currentCatalog !== undefined
          ? {
            data: currentCatalog?.configs.coverImageUrl
          }
          : undefined,
      backCoverImage:
        currentCatalog !== undefined
          ? {
            data: currentCatalog?.configs.backCoverImageUrl
          }
          : undefined,
      brands: [],
      categories: [],
      selectedCategories: [],
      selectedBrands: [],
      selectedOrderBy: currentCatalog !== undefined ? orderByOptions.find((option) => option.value === currentCatalog.configs.order) : undefined,
      limit: currentCatalog?.configs.productsLimit || '',
      productsQuery: currentCatalog?.configs.productsCodes.length !== 0 ? currentCatalog?.configs.productsCodes.join(',') : '',
      uiValues: {
        cantSave: this.props.currentCatalog !== undefined,
        snackMessage: '',
        openSnack: false
      }
    }

    this.getCatalogsCategoriesAndBrands = this.getCatalogsCategoriesAndBrands.bind(this)
    this.handleChangeCategories = this.handleChangeCategories.bind(this)
    this.handleChangeBrands = this.handleChangeBrands.bind(this)
    this.handleChangeOrderBy = this.handleChangeOrderBy.bind(this)
    this.isAFieldInvalid = this.isAFieldInvalid.bind(this)
    this.throwSnack = this.throwSnack.bind(this)
    this.handleSnackbarClose = this.handleSnackbarClose.bind(this)
    this.handleSaveCatalog = this.handleSaveCatalog.bind(this)
    this.compareCurrentCatalogWithState = this.compareCurrentCatalogWithState.bind(this)
  }

  compareCurrentCatalogWithState() {
    const changeCantSave = () => this.setState({ uiValues: { ...this.state.uiValues, cantSave: false } })

    const currentCatalogGenerateProductList = this.props.currentCatalog.configs.productsLimit !== ''

    if (this.props.currentCatalog.name !== this.state.catalogName) {
      changeCantSave()
      return
    } else if (this.props.currentCatalog.configs.coverImageUrl !== this.state.coverImage.data) {
      changeCantSave()
      return
    } else if (this.props.currentCatalog.configs.backCoverImageUrl !== this.state.backCoverImage.data) {
      changeCantSave()
      return
    } else if (this.props.currentCatalog.configs.catalogPresentation !== this.state.catalogPresentation) {
      changeCantSave()
      return
    } else if (this.props.currentCatalog.configs.columnsPerPage != this.state.columnsPerPage) {
      changeCantSave()
      return
    } else if (this.props.currentCatalog.configs.productsPerPage != this.state.productsPerPage) {
      changeCantSave()
      return
    } else if (this.props.currentCatalog.configs.productsOrderBy !== this.state.selectedOrderBy.value) {
      changeCantSave()
      return
    } else if (this.state.generateProductList !== currentCatalogGenerateProductList) {
      changeCantSave()
      return
    } else if (!currentCatalogGenerateProductList && !_.isEqual(this.props.currentCatalog.configs.productsCodes, this.state.productsQuery.split(','))) {
      changeCantSave()
      return
    } else if (currentCatalogGenerateProductList) {
      if (this.state.discountSelected !== this.props.currentCatalog.configs.withDiscount) {
        changeCantSave()
        return
      }

      if (this.state.bluePoints !== this.props.currentCatalog.configs.withBluePoints) {
        changeCantSave()
        return
      }

      if (this.state.limit !== this.props.currentCatalog.configs.productsLimit) {
        changeCantSave()
        return
      }

      if (
        !_.isEqual(
          this.state.selectedCategories?.map((option) => {
            return { node: option.node, name: option.label.toLowerCase().replace(/\s+/g, '-').split('/') }
          }),
          this.props.currentCatalog.configs.categories
        )
      ) {
        changeCantSave()
        return
      }

      if (
        !_.isEqual(
          this.state.selectedBrands?.map((option) => option.value),
          this.props.currentCatalog.configs.brands
        )
      ) {
        changeCantSave()
        return
      }
    }

    this.setState({ uiValues: { ...this.state.uiValues, cantSave: true } })
  }

  throwSnack(snackMessage) {
    this.setState({
      uiValues: { ...this.state.uiValues, openSnack: false, snackMessage: '' }
    })

    let tempUiValues = { ...this.state.uiValues }
    tempUiValues.openSnack = true
    tempUiValues.snackMessage = snackMessage

    this.setState({ uiValues: tempUiValues })
  }

  handleSnackbarClose() {
    let tempUiValues = { ...this.state.uiValues }
    tempUiValues.openSnack = false
    this.setState({ uiValues: tempUiValues })
  }

  async handleSaveCatalog() {
    this.throwSnack(this.props.currentCatalog === undefined ? 'Guardando...' : 'Actualizando...')

    if (!this.isAFieldInvalid()) {
      this.setState({ uiValues: { ...this.state.uiValues, cantSave: true } })

      let response = await requestAPI({
        host: Utils.constants.CONFIG_ENV.HOST,
        method: this.props.currentCatalog === undefined ? 'POST' : 'PUT',
        resource: 'catalogs',
        endpoint: this.props.currentCatalog === undefined ? '/create' : '/update',
        data: {
          _id: this.props.currentCatalog !== undefined ? this.props.currentCatalog?._id : '',
          businessUnit: this.props.businessUnit,
          name: this.state.catalogName,
          coverImage: this.state.coverImage,
          backCoverImage: this.state.backCoverImage,
          catalogPresentation: this.state.catalogPresentation,
          columnsPerPage: this.state.columnsPerPage,
          productsPerPage: this.state.productsPerPage,
          productsQuery: this.state.productsQuery || '',
          categories: this.state.selectedCategories.map((option) => {
            return { node: option.node, name: option.label.toLowerCase().replace(/\s+/g, '-').split('/') }
          }),
          brands: this.state.selectedBrands.map((option) => option.value),
          withDiscount: this.state.discountSelected,
          withBluePoints: this.state.bluePoints,
          order: this.state.selectedOrderBy,
          productsLimit: this.state.limit
        }
      })

      if (response.status === 200) {
        this.throwSnack(this.props.currentCatalog === undefined ? 'Catálogo creado correctamente' : 'Catálogo modificado correctamente')
        this.props.getCatalogs()

        setTimeout(() => {
          this.props.getCatalogs()
          if (this.props.isFormInModal) this.props.closeCatalogForm()
        }, 3000)
      } else {
        this.throwSnack('Fallo al guardar el catálogo')
        this.setState({ uiValues: { ...this.state.uiValues, cantSave: true } })
      }

      this.setState({ uiValues: { ...this.state.uiValues, cantSave: true } })
    }
  }

  isAFieldInvalid() {
    if (this.state.catalogName.trim() === '') {
      this.throwSnack('Nombre de catálogo requerido')
      return true
    }

    if (this.state.coverImage === undefined || this.state.backCoverImage === undefined) {
      this.throwSnack('Las imágenes de portada y contraportada son necesarias')
      return true
    }

    if (this.state.catalogPresentation === 'grid') {
      if (this.state.columnsPerPage === 0 || this.state.columnsPerPage === '') {
        this.throwSnack('Se debe especificar el número de columnas')
        return true
      }
    }

    if (this.state.productsPerPage === undefined || this.state.productsPerPage === '') {
      this.throwSnack('Se debe especificar los productos por página')
      return true
    }

    if (this.state.generateProductList) {
      if (!this.state.categoriesSelected && !this.state.brandsSelected && !this.state.discountSelected && !this.state.bluePoints) {
        this.throwSnack('Se debe seleccionar por lo menos una opción')
        return true
      }

      if (this.state.categoriesSelected && this.state.selectedCategories.length === 0) {
        this.throwSnack('Es necesario seleccionar categorías')
        return true
      }
      if (this.state.brandsSelected && this.state.selectedBrands.length === 0) {
        this.throwSnack('Es necesario seleccionar marcas')
        return true
      }

      if (this.state.selectedOrderBy === undefined) {
        this.throwSnack('Se debe seleccionar un orden para los productos')
        return true
      }

      if (this.state.limit.trim() === '') {
        this.throwSnack('Se debe especificar un límite de productos')
        return true
      } else {
        if (parseInt(this.state.limit) < 1){
          this.throwSnack('Es necesario que el limite de productos sea mayor a 0')
        return true
        }
      }
    } else {
      if (this.state.productsQuery === null || this.state.productsQuery === undefined || this.state.productsQuery.trim() === '') {
        this.throwSnack('Se deben proporcionar códigos de productos')
        return true
      }

      if (this.state.selectedOrderBy === undefined) {
        this.throwSnack('Se debe seleccionar un orden para los productos')
        return true
      }
    }

    return false
  }

  async componentWillMount() {
    this.getCatalogsCategoriesAndBrands()
  }

  handleChangeCategories(selectedOption) {
    this.setState(
      {
        selectedCategories: selectedOption
      },
      this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { }
    )
  }

  handleChangeOrderBy(selectedOption) {
    this.setState(
      {
        selectedOrderBy: selectedOption
      },
      this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { }
    )
  }

  handleChangeBrands(selectedOption) {
    this.setState(
      {
        selectedBrands: selectedOption
      },
      this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { }
    )
  }

  async getCatalogsCategoriesAndBrands() {
    await this.setState({ loadingInfo: true })
    let optionsResponse = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: 'catalogs',
      endpoint: '/categories-brands',
      method: 'GET'
    })

    if (optionsResponse.status === Utils.constants.status.SUCCESS) {
      if (optionsResponse.data !== null && optionsResponse.data !== undefined && optionsResponse.data.brands !== null && optionsResponse.data.brands !== undefined && optionsResponse.data.categories !== null && optionsResponse.data.categories !== undefined) {
        this.setState({
          brands: optionsResponse.data.brands,
          categories: optionsResponse.data.categories
        })
      }
    }

    if (optionsResponse.status === Utils.constants.status.SUCCESS) {
      await this.setState({ loadingInfo: false })
      let currentSelectedCategories = []
      let currentSelectedBrands = []

      if (this.props.currentCatalog?.configs.categories.length > 0) {
        for (let currentCatalogCategory of this.props.currentCatalog.configs.categories) {
          currentSelectedCategories.push(optionsResponse.data.categories.find((option) => option.node === currentCatalogCategory.node))
        }
      }

      if (this.props.currentCatalog?.configs.brands.length > 0) {
        for (let currentCatalogBrand of this.props.currentCatalog.configs.brands) {
          currentSelectedBrands.push(optionsResponse.data.brands.find((option) => option.value === currentCatalogBrand))
        }
      }

      this.setState({
        brands: optionsResponse.data.brands,
        categories: optionsResponse.data.categories,
        selectedCategories: currentSelectedCategories,
        selectedBrands: currentSelectedBrands
      })
    }
  }

  confirmUploader(images) {
    this.setState({
      openImagesUploader: false,
      images: images
    })
  }

  render() {
    const { classes } = this.props

    return (

      <Grid container xs={12}>
        <Grid item xs={12}>
          <Typography style={{ fontSize: 22, marginBottom: 20 }}>
            {
              (this.props.edit) ?
                <strong>Editar catálogo</strong>
                :
                <strong>Crear nuevo catálogo</strong>
            }
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography>Ingresa los datos para generar un nuevo catálogo</Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography style={{ marginTop: 20 }}>
            <strong>Datos generales</strong>
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography style={{ marginTop: 20 }}>
            <strong>Nombre del catálogo</strong>
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <TextField
            size='small'
            fullWidth
            placeholder='Nombre del catálogo'
            value={this.state.catalogName}
            onChange={({ target: { value } }) => {
              this.setState({ catalogName: value }, (this.props.currentCatalog !== undefined && this.props.currentCatalog !== null) ? this.compareCurrentCatalogWithState : () => { })
            }}
          />
        </Grid>

        <Grid container item xs={12} style={{ marginTop: 20, marginBottom: 20 }}>
          <Grid item>
            <Box
              className={classes.uploadRectangle}
              justifySelf='center'
              onClick={() => {
                this.setState({ openCoverImageUploader: true })
              }}
              style={(this.state.coverImage !== undefined && this.state.coverImage !== null) ? { cursor: 'pointer', backgroundImage: `url(${this.state.coverImage.data})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center'} : { cursor: 'pointer' }}
            >
              <Typography align='center' className={classes.text}>
                {(this.state.coverImage !== undefined && this.state.coverImage !== null) ? '' : 'Subir foto de portada'}
              </Typography>
            </Box>
          </Grid>

          <Grid item>
            <Box
              className={classes.uploadRectangle}
              onClick={() => {
                this.setState({ openBackCoverImageUploader: true })
              }}
              style={(this.state.backCoverImage !== undefined && this.state.backCoverImage !== null) ? {cursor: 'pointer', backgroundImage: `url(${this.state.backCoverImage.data})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center'} : { cursor: 'pointer' }}
            >
              <Typography align='center' className={classes.text}>
                {(this.state.backCoverImage) ? '' : 'Subir foto de contraportada'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid container item xs={12}>
          <Typography>Presentación</Typography>
        </Grid>

        <RadioGroup
          value={this.state.catalogPresentation}
          onChange={({ target: { value } }) => {
            this.setState(
              {
                catalogPresentation: value,
                columnsPerPage: 0,
                productsPerPage: undefined
              },
              (this.props.currentCatalog !== undefined && this.props.currentCatalog !== null) ? this.compareCurrentCatalogWithState : () => { }
            )
          }}
        >
          <Grid container direction='row' alignItems='center'>
            <Grid item>
              <FormControlLabel value='grid' control={<Radio />} label='Mosaicos' />
            </Grid>
            <Grid item>
              <FormControlLabel value='list' control={<Radio />} label='Listas' />
            </Grid>
          </Grid>
        </RadioGroup>

        <Grid container item xs={12} direction='row' alignItems='center' style={{ marginBottom: 20 }}>
          <Typography style={{ marginRight: 10 }}>Número de columnas</Typography>
          <Box width={71} style={{ marginRight: 20 }}>
            <Select
              disabled={this.state.catalogPresentation !== 'grid'}
              fullWidth
              native
              onChange={({ target: { value } }) => {
                this.setState(
                  {
                    columnsPerPage: value,
                    productsPerPage: undefined
                  },
                  (this.props.currentCatalog !== undefined && this.props.currentCatalog !== null) ? this.compareCurrentCatalogWithState : () => { }
                )
              }}
              value={this.state.columnsPerPage}
            >
              <option aria-label='None' value='' />
              {[...Array(3)].map((item, idx) => {
                return <option key={idx} value={idx + 2}>{idx + 2}</option>
              })}
            </Select>
          </Box>
          <Typography style={{ marginRight: 10 }}>Productos por página</Typography>
          <Box width={71} style={{ marginRight: 20 }}>
            <Select
              fullWidth
              native
              value={this.state.productsPerPage}
              onChange={({ target: { value } }) => {
                this.setState({ productsPerPage: value }, this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { })
              }}
            >
              <option aria-label='None' value='' />
              {this.state.catalogPresentation === 'list'
                ? [...Array(4)].map((item, idx) => {
                  if (idx > 0) return <option key={idx} value={idx + 1}>{idx + 1}</option>
                })
                : this.state.columnsPerPage !== 0 && this.state.columnsPerPage !== ''
                  ? [...Array(this.state.columnsPerPage * this.state.columnsPerPage - 1)].map((item, idx) => {
                    if (idx + 2 >= this.state.columnsPerPage) return <option value={idx + 2}>{idx + 2}</option>
                  })
                  : ''}
            </Select>
          </Box>
        </Grid>

        <Grid container item xs={12} direction='row' alignItems='center' style={{ marginBottom: 20 }}>
          <Typography>Generar lista de productos</Typography>
          <Switch
            name='generateProductList'
            checked={this.state.generateProductList}
            onChange={() => {
              this.setState(
                {
                  generateProductList: !this.state.generateProductList
                },
                this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { }
              )
            }}
          />
        </Grid>

        {this.state.generateProductList ? (
          <Grid container style={{ marginBottom: 20 }}>
            <Typography style={{ marginBottom: 10 }}>
              <strong>Contenido del catálogo</strong>
            </Typography>

            <Grid item xs={12} >
              <Grid container>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.categoriesSelected}
                        onChange={() => {
                          this.setState(
                            {
                              categoriesSelected: !this.state.categoriesSelected,
                              selectedCategories: []
                            },
                            this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { }
                          )
                        }}
                        name='categories'
                      />
                    }
                    label='Categorías'
                  />
                </Grid>
                <Grid item xs={8}>
                  {(this.state.categoriesSelected) ?
                    <Grid item xs={12} fullWidth>
                      {
                        (this.state.loadingInfo) ?
                          <CircularProgress />
                          :
                          <ReactSelect
                            placeholder={this.state.loadingInfo ? 'Cargando categorías...' : 'Seleccionar categorías...'}
                            isMulti
                            options={this.state.categories}
                            noOptionsMessage={() => 'Sin datos...'}
                            onChange={this.handleChangeCategories}
                            value={this.state.selectedCategories}
                          />
                      }
                    </Grid>
                    :
                    ''
                  }
                </Grid>
              </Grid>


            </Grid>

            <Grid item xs={12}>

              <Grid container>
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.brandsSelected}
                        onChange={() => {
                          this.setState(
                            {
                              brandsSelected: !this.state.brandsSelected,
                              selectedBrands: []
                            },
                            this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { }
                          )
                        }}
                        name='brands'
                      />
                    }
                    label='Marcas'
                  />
                </Grid>
                <Grid item xs={8}>

                  {
                    (this.state.brandsSelected) ?
                      <Grid item xs={12} fullWidth>
                        {this.state.loadingInfo ? <CircularProgress /> : <ReactSelect
                          placeholder={this.state.loadingInfo ? 'Cargando marcas...' : 'Seleccionar marcas...'}
                          isMulti
                          options={this.state.brands}
                          noOptionsMessage={() => 'Sin datos...'}
                          onChange={this.handleChangeBrands}
                          value={this.state.selectedBrands}
                        />
                        }
                      </Grid>
                      :
                      ''
                  }

                </Grid>
              </Grid>
            </Grid>

            <Grid container item xs={12} direction='row'>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.discountSelected}
                    onChange={() => {
                      this.setState(
                        {
                          discountSelected: !this.state.discountSelected
                        },
                        this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { }
                      )
                    }}
                    name='discount'
                  />
                }
                label='Con descuento'
              />
            </Grid>

            {/* <Grid container item xs={12} direction='row'>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.bluePoints}
                    onChange={() => {
                      this.setState(
                        {
                          bluePoints: !this.state.bluePoints
                        },
                        this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => {}
                      )
                    }}
                    name='bluePoints'
                  />
                }
                label='Con puntos azules'
              />
            </Grid> */}
            <Grid item xs={12} style={{ marginBottom: 20 }}>
              <Grid container>
                <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography style={{ marginRight: 10 }}>Ordenar por</Typography>
                </Grid>
                <Grid item xs={6} >
                  <Box style={{ marginRight: 20 }}>
                    <ReactSelect
                      placeholder='Ordenar por'
                      options={orderByOptions}
                      noOptionsMessage={() => 'Sin datos...'}
                      onChange={this.handleChangeOrderBy}
                      value={this.state.selectedOrderBy}
                      isSearchable={false}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} style={{ marginBottom: 20 }}>
              <Grid container>
                <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }} >
                  <Typography style={{ marginRight: 10 }}>Límite</Typography>

                </Grid>
                <Grid item xs={3}>
                  <Box style={{ marginRight: 20 }}>
                    <TextField
                      type='number'
                      size='small'
                      fullWidth
                      value={this.state.limit}
                      onChange={({ target: { value } }) => {
                        if (value.length < 4 && value < 101 && value > -1) this.setState({ limit: value }, this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { })
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : (
            <Grid container item style={{ marginBottom: 20 }}>
              <Grid item xs={12} >
                <Typography style={{ marginBottom: 20 }}><strong>Productos</strong></Typography>
                <Typography>Ingresar lote y separar por comas</Typography>
              </Grid>
              <Grid item xs={6} style={{ marginBottom: 20 }}>
                <TextField
                  fullWidth
                  placeholder='Por ejemplo: 09EZ5Q, 09ERQ7, 09FGNJ'
                  value={this.state.productsQuery}
                  onChange={({ target: { value } }) => {
                    this.setState({ productsQuery: value }, (this.props.currentCatalog !== undefined && this.props.currentCatalog !== null) ? this.compareCurrentCatalogWithState : () => { })
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
              <Grid container>
                <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography style={{ marginRight: 10 }}>Ordenar por</Typography>
                </Grid>
                <Grid item xs={6} >
                  <Box style={{ marginRight: 20 }}>
                    <ReactSelect
                      placeholder='Ordenar por'
                      options={orderByOptions}
                      noOptionsMessage={() => 'Sin datos...'}
                      onChange={this.handleChangeOrderBy}
                      value={this.state.selectedOrderBy}
                      isSearchable={false}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            </Grid>

          )}

        <Grid container xs={12} spacing={2}>
          {this.props.isFormInModal ? (
            <Grid item xs={6}>
              <Button fullWidth variant='outlined' color='primary' onClick={this.props.closeCatalogForm}>
                Cancelar
              </Button>
            </Grid>
          ) : (
              ''
            )}

          <Grid item xs={this.props.isFormInModal ? 6 : 12}>
            <Button fullWidth variant='contained' color='primary' onClick={this.handleSaveCatalog} disabled={this.state.uiValues.cantSave}>
              Agregar
            </Button>
          </Grid>
        </Grid>
        <Uploader
          open={this.state.openCoverImageUploader}
          host={Utils.constants.CONFIG_ENV.HOST}
          title={`Subir foto de ${this.state.openCoverImageUploader ? 'portada' : 'contraportada'}`}
          limit={1}
          use='reviews'
          hideUse={true}
          docs={this.state.coverImage === undefined ? [] : [this.state.coverImage]}
          validFormats={['image/jpeg', 'image/jpg', 'image/png']}
          hideComments={true}
          maxSize={5000000}
          handleCloseWithData={(images) => {
            this.setState(
              {
                openCoverImageUploader: false,
                coverImage: images[0]
              },
              this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { }
            )
          }}
          handleClose={() => {
            this.setState({ openCoverImageUploader: false, openBackCoverImageUploader: false })
          }}
        />
        <Uploader
          open={this.state.openBackCoverImageUploader}
          host={Utils.constants.CONFIG_ENV.HOST}
          title={`Subir foto de ${this.state.openCoverImageUploader ? 'portada' : 'contraportada'}`}
          limit={1}
          use='reviews'
          hideUse={true}
          docs={this.state.backCoverImage === undefined ? [] : [this.state.backCoverImage]}
          validFormats={['image/jpeg', 'image/jpg', 'image/png']}
          hideComments={true}
          maxSize={5000000}
          handleCloseWithData={(images) => {
            this.setState(
              {
                openBackCoverImageUploader: false,
                backCoverImage: images[0]
              },
              this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { }
            )
          }}
          handleClose={() => {
            this.setState({ openCoverImageUploader: false, openBackCoverImageUploader: false })
          }}
        />
        <Snackbar
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.state.uiValues.openSnack}
          onClose={this.handleCloseSnackbar}
          message={<span>{this.state.uiValues.snackMessage}</span>}
          action={[
            <IconButton key='close' aria-label='Close' color='inherit' onClick={this.handleSnackbarClose}>
              <CloseIcon />
            </IconButton>
          ]}
        />
      </Grid>
    )
  }
}

export default withStyles(styles)(CatalogForm)
