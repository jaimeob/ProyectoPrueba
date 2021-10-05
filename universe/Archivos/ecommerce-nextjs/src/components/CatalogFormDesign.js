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
  root: {
    width: 'auto',
    padding: '24px 16px 24px 16px',
    [theme.breakpoints.down('sm')]: {
      padding: '12px 12px 12px 12px'
    }
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '144px',
    height: '144px',
    border: 'dashed 1px #979797',
    backgroundColor: '#f0f0f0',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    cursor: 'pointer'
  },
  spacingRigth: {
    paddingRigth: theme.spacing(2),
    paddingBottom: 0,
    [theme.breakpoints.down('xs')]: {
      paddingRigth: 0,
      paddingBottom: theme.spacing(2)
    }
  },
  spacingLeft: {
    paddingLeft: theme.spacing(2),
    paddingTop: 0,
    [theme.breakpoints.down('xs')]: {
      paddingLeft: 0,
      paddingTop: theme.spacing(2)
    }
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

class CatalogFormDesign extends Component {
  constructor(props) {
    super(props)

    const { currentCatalog } = this.props

    let columnsPerPage = currentCatalog?.configs.columnsPerPage || 0

    let productsPerPageValues = []

    if (currentCatalog?.configs.catalogPresentation === 'list' || columnsPerPage == 2){
      productsPerPageValues = [2, 3, 4]
    } else if (columnsPerPage == 3){
      productsPerPageValues = [3, 4, 5, 6, 7, 8, 9]
    } else if (columnsPerPage == 4){
      productsPerPageValues = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    }

    this.state = {
      loadingInfo: false,
      catalogName: currentCatalog?.name || '',
      generateProductList: currentCatalog !== undefined && currentCatalog?.configs.productsCodes.length === 0,
      categoriesSelected: currentCatalog?.configs.categories.length > 0,
      brandsSelected: currentCatalog?.configs.brands.length > 0,
      discountSelected: currentCatalog?.configs.withDiscount || false,
      bluePoints: false,
      catalogPresentation: currentCatalog?.configs.catalogPresentation || 'grid',
      columnsPerPageValues: [2, 3, 4],
      productsPerPageValues: productsPerPageValues,
      columnsPerPage: Number(currentCatalog?.configs.columnsPerPage) || 0,
      productsPerPage: Number(currentCatalog?.configs.productsPerPage) || 0,
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
    this.setColumnsPerPage = this.setColumnsPerPage.bind(this)
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
    if (this.props.isFormInModal){
      this.props.showSnackbarMessage(snackMessage)
    } else {
      this.setState({
        uiValues: { ...this.state.uiValues, openSnack: false, snackMessage: '' }
      })
  
      let tempUiValues = { ...this.state.uiValues }
      tempUiValues.openSnack = true
      tempUiValues.snackMessage = snackMessage
  
      this.setState({ uiValues: tempUiValues }) 
    }
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
          productsQuery: (this.state.generateProductList)? '' : this.state.productsQuery,
          categories: (this.state.generateProductList)? this.state.selectedCategories.map((option) => {
            return { node: option.node, name: option.label.toLowerCase().replace(/\s+/g, '-').split('/') }
          }): [],
          brands: (this.state.generateProductList)? this.state.selectedBrands.map((option) => option.value) : [],
          withDiscount: (this.state.generateProductList)? this.state.discountSelected : false,
          withBluePoints: (this.state.generateProductList)? this.state.bluePoints : false,
          order: this.state.selectedOrderBy,
          productsLimit: (this.state.generateProductList)? this.state.limit : 0
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
    this.setState({ loadingInfo: true })
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
      this.setState({ loadingInfo: false })
      
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

  setColumnsPerPage(value){
    let productsPerPageValues = []

    if (value == 0 || value == 2){
      productsPerPageValues = [2, 3, 4]
    } else if (value == 3){
      productsPerPageValues = [3, 4, 5, 6, 7, 8, 9]
    } else if (value == 4){
      productsPerPageValues = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    }

    this.setState({
      columnsPerPage: value, 
      productsPerPage: '0',
      productsPerPageValues: productsPerPageValues
    },
      (this.props.currentCatalog !== undefined && this.props.currentCatalog !== null) ? this.compareCurrentCatalogWithState : () => { }
    )
  }

  render() {
    const { classes } = this.props

    return (
      <Grid container style={(this.props.isFormInModal)? {} : {backgroundColor: 'white', borderRadius: 10, padding: 20}}>
        <Grid item xs={12}>
          <Typography style="body1" style={{width: '100%', fontSize: 24, fontWeight: 600}}>{(this.props.edit)? <strong>Editar catálogo</strong> : <strong>Crear nuevo catálogo</strong>}</Typography>
          {
            (this.props.edit)?
              ''
            :
              <Typography style="body1" style={{width: '100%', fontSize: 16}}>Ingresa los datos para generar un nuevo catálogo</Typography>
          }
          <Typography style="body1" style={{width: '100%', fontSize: 18, marginTop: 20}}><strong>Datos generales</strong></Typography>
        </Grid>
        <Grid item xs={12} md={8} lg={7} style={{marginTop: 12}}>
          <TextField
            value={this.state.catalogName}
            className={classes.textInput}
            label="Nombre del catálogo*"
            placeholder="Nombre del catálogo"
            variant="outlined"
            fullWidth
            onChange={({ target: { value } }) => {
              this.setState({ catalogName: value }, (this.props.currentCatalog !== undefined && this.props.currentCatalog !== null) ? this.compareCurrentCatalogWithState : () => { })
            }}
            InputLabelProps={{ shrink: true }}/>

            <Grid container item xs={12} style={{marginTop: 12}}>
              <div 
                className={classes.imageContainer}
                onClick={() => this.setState({ openCoverImageUploader: true })}
                style={(this.state.coverImage)? {backgroundImage: `url(${this.state.coverImage.data})` } : {}}>
                {
                  (this.state.coverImage)? 
                    ''
                  :
                  <Typography align="center" variant="body1" style={{fontSize: 14}}>Subir imagen de portada</Typography> 
                }
              </div>
              <div style={{width: 20}}/>
              <div 
                className={classes.imageContainer}
                onClick={() => this.setState({ openBackCoverImageUploader: true })}
                style={(this.state.backCoverImage)? { backgroundImage: `url(${this.state.backCoverImage.data})` } : {}}>
                {
                  (this.state.backCoverImage)? 
                    ''
                  :
                  <Typography align="center" variant="body1" style={{fontSize: 14}}>Subir imagen de contra portada</Typography> 
                }
              </div>
          </Grid>
          <Grid item xs={12}>
            <Typography style="body1" style={{width: '100%', fontSize: 18, marginTop: 20}}><strong>Presentación</strong></Typography>
          </Grid>
          <Grid item xs={12}>
            <RadioGroup
              row
              value={this.state.catalogPresentation}
              onChange={({ target: { value } }) => {this.setColumnsPerPage(0), this.setState({catalogPresentation: value, productsPerPage: '0' }, (this.props.currentCatalog !== undefined && this.props.currentCatalog !== null) ? this.compareCurrentCatalogWithState : () => { })}}>
              <FormControlLabel value='grid' control={<Radio />} label='Mosaicos' />
              <FormControlLabel value='list' control={<Radio />} label='Listas' />
            </RadioGroup>
          </Grid>
          <Grid container item xs={12} style={{marginTop: 20}}>
            <Grid item xs={12} sm={6} className={classes.spacingRigth}>
              <TextField
                value={this.state.columnsPerPage}
                label="Número de columnas"
                disabled={this.state.catalogPresentation !== 'grid'}
                select
                SelectProps={{
                  native: true,
                }}
                fullWidth
                variant="outlined"
                onChange={({ target: { value } }) => { this.setColumnsPerPage(value)}}>
                <option value="0">Número de columnas</option>
                {
                  this.state.columnsPerPageValues.map((item) => {
                    return(
                      <option key={item} value={item}>{item}</option>
                    )
                  })
                }
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} className={classes.spacingLeft}>
              <TextField
                value={this.state.productsPerPage}
                disabled={this.state.catalogPresentation === "grid" && this.state.columnsPerPage == 0}
                fullWidth
                native
                select
                SelectProps={{
                  native: true,
                }}
                variant="outlined"
                label="Productos por página"
                onChange={({ target: { value } }) => {this.setState({ productsPerPage: value }, (this.props.currentCatalog !== undefined)? this.compareCurrentCatalogWithState : () => { })}}>
                <option value="0">Productos por página</option>
                {
                  this.state.productsPerPageValues.map((item) => {
                    return(
                      <option key={item} value={item}>{item}</option>
                    )
                  })
                }
              </TextField>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography style="body1" style={{width: '100%', fontSize: 18, marginTop: 20}}><strong>Contenido del catálogo</strong></Typography>
          </Grid>
          <Grid container item xs={12} direction='row' alignItems='center' style={{ marginTop: 12 }}>
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
        </Grid>
        {
          (this.state.generateProductList)?
            <Grid container item xs={12} style={{marginTop: 20}}>
              <Grid item xs={4}>
                <FormControlLabel
                  label='Categorías'
                  control={
                    <Checkbox
                      name='categories'
                      checked={this.state.categoriesSelected}
                      onChange={() => {this.setState({categoriesSelected: !this.state.categoriesSelected, selectedCategories: []}, this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { })}}/>
                  }
                />
              </Grid>
              <Grid item xs={8}>
                {
                  (this.state.categoriesSelected)?
                    (this.state.loadingInfo)?
                      <CircularProgress />
                      :
                      <ReactSelect
                        placeholder={this.state.loadingInfo ? 'Cargando categorías' : 'Seleccionar categorías'}
                        isMulti
                        fullWidth
                        options={this.state.categories}
                        noOptionsMessage={() => 'Sin datos...'}
                        onChange={this.handleChangeCategories}
                        value={this.state.selectedCategories}
                      />
                    :
                     ''
                }
              </Grid>
              <Grid item xs={4}>
                <FormControlLabel
                  label='Marcas'
                  control={
                    <Checkbox
                      name='brands'
                      checked={this.state.brandsSelected}
                      onChange={() => {this.setState({brandsSelected: !this.state.brandsSelected,selectedBrands: []},this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { })}}/>
                    }
                />
              </Grid>
              <Grid item xs={8}>
                {
                  (this.state.brandsSelected)?
                    (this.state.loadingInfo)?
                      <CircularProgress />
                    :
                      <ReactSelect
                        placeholder={this.state.loadingInfo ? 'Cargando marcas' : 'Seleccionar marcas'}
                        isMulti
                        options={this.state.brands}
                        noOptionsMessage={() => 'Sin datos...'}
                        onChange={this.handleChangeBrands}
                        value={this.state.selectedBrands}
                      />
                    :
                     ''
                }
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  label='Con descuento'
                  control={
                    <Checkbox
                      checked={this.state.discountSelected}
                      onChange={() => {this.setState({discountSelected: !this.state.discountSelected},this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { })}}
                      name='discount'
                    />
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body1">Ordernar por</Typography>
              </Grid>
              <Grid item xs={8}>
                <ReactSelect
                    placeholder='Ordenar por'
                    fullWidth
                    options={orderByOptions}
                    noOptionsMessage={() => 'Sin datos...'}
                    onChange={this.handleChangeOrderBy}
                    value={this.state.selectedOrderBy}
                    isSearchable={false}
                  />
              </Grid>
              <Grid item xs={4} style={{marginTop: 12}}>
                <Typography variant="body1">Limite</Typography>
              </Grid>
              <Grid item xs={8} style={{marginTop: 12}}>
                <TextField
                  type='number'
                  size='small'
                  fullWidth
                  variant="outlined"
                  value={this.state.limit}
                  onChange={({ target: { value } }) => {
                    if (value.length < 4 && value < 101 && value > -1) this.setState({ limit: value }, this.props.currentCatalog !== undefined ? this.compareCurrentCatalogWithState : () => { })
                  }}
                />
              </Grid>
            </Grid>
          :
            <Grid container item xs={12} style={{marginTop: 20}}>
              <Grid item xs={12}>
                <Typography style="body1" style={{width: '100%', fontSize: 16}}><strong>Productos</strong><br/><span>Ingresar lote y separar por coma</span></Typography>
              </Grid>
              <Grid item xs={12} md={8} lg={7}>
                <TextField 
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder='Por ejemplo: 09EZ5Q, 09ERQ7, 09FGNJ'
                  style={{marginTop: 12}}
                  value={this.state.productsQuery}
                  onChange={({ target: { value } }) => {this.setState({ productsQuery: value }, (this.props.currentCatalog !== undefined && this.props.currentCatalog !== null) ? this.compareCurrentCatalogWithState : () => { })}}/>
              </Grid>
              <Grid container item xs={12} style={{marginTop: 12}} alignContent="center" alignItems="center">
                <Grid item xs={4}>
                  <Typography variant="body1">Ordernar por</Typography>
                </Grid>
                <Grid item xs={8}>
                  <ReactSelect
                      placeholder='Ordenar por'
                      fullWidth
                      options={orderByOptions}
                      noOptionsMessage={() => 'Sin datos...'}
                      onChange={this.handleChangeOrderBy}
                      value={this.state.selectedOrderBy}
                      isSearchable={false}
                    />
                </Grid>
              </Grid>
            </Grid>
        }
         <Grid container item xs={12} style={{marginTop: 20}} justify="space-between" spacing={(this.props.isFormInModal)? 2 : 0}>
          {
            (this.props.isFormInModal)?
              <Grid item xs={6}>
                <Button fullWidth variant='outlined' color='primary' onClick={this.props.closeCatalogForm}>
                  Cancelar
                </Button>
              </Grid>
            :
              ''
          }
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

export default withStyles(styles)(CatalogFormDesign)
