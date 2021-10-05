import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import { Grid, Typography, Checkbox, Hidden, TablePagination, Button, Icon, TextField, Snackbar, Chip, IconButton, MenuItem } from '@material-ui/core'

// Utils
import Utils from '../../resources/Utils'

// Components
import ProductCard from '../../components/ProductCard'
import Empty from '../../components/Empty'
import FilterList from '../../components/FilterList'
import ButtonBlock from '../../components/ButtonBlock'
import AddCatalogModal from '../../components/AddCatalogModal'

const styles = theme => ({
  brandContainer: {
    padding: '0px 24px',
    marginBottom: 24,
    [theme.breakpoints.down('sm')]: {
      marginBottom: 8,
      marginTop: 36
    },
    [theme.breakpoints.down('xs')]: {
      marginBottom: 8,
      marginTop: 36
    }
  },
  catalogMenu: {
    zIndex: 2,
    background: '#E5F3FF',
    padding: '16px 24px 16px',
    marginBottom: 24,
    borderBottom: 'solid 1px #dbdbdb',
    [theme.breakpoints.down('sm')]: {
      marginBottom: 8,
    }
  },
  catalogTitleContainer: {
    marginBottom: 0,
    [theme.breakpoints.down('sm')]: {
      marginBottom: 16
    },
    [theme.breakpoints.down('xs')]: {
      marginBottom: 0
    }
  },
  catalogTitle: {
    fontSize: 28,
    [theme.breakpoints.down('md')]: {
      fontSize: 24
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 22,
    }
  },
  searchTitle: {
    fontSize: 24,
    [theme.breakpoints.down('sm')]: {
      fontSize: 30
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 28
    }
  },
  input: {
    height: 40
  },
  label: {
    border: 'solid 1px red',
  },
  button: {
    width: '45%',
    height: 40,
    fontSize: 12
  },
  searchCount: {
    fontSize: 18,
    fontWeight: 600,
    [theme.breakpoints.down('xs')]: {
      marginBottom: 16,
      fontSize: 14
    }
  },
  filtersContainer: {
    margin: 0,
    paddingLeft: 24,
    paddingRight: 24,
    display: 'block',
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  filtersMobileContainer: {
    zIndex: theme.zIndex.drawer + 1,
    paddingLeft: 24,
    paddingRight: 24,
    display: 'none',
    position: 'absolute',
    background: 'white',
    top: 0,
    left: 0,
    width: '100%',
    height: 'auto',
    [theme.breakpoints.down('sm')]: {
      display: 'block'
    }
  },
  paginator: {
    padding: 0,
    margin: 0,
    float: 'right',
    border: 'none',
    color: theme.palette.primary.main
  },
  inputSearch: {
    marginTop: 8,
    height: 36
  },
  mySelection: {
    marginTop: -52,
    marginBottom: 28,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 24
    },
    [theme.breakpoints.down('xs')]: {
      marginBottom: 0
    }
  }
})

class BrandView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      banners: [],

      scrollPosition: 0,

      openSnack: false,
      messageSnack: '',

      count: this.props.filters.count,
      rowsPerPage: this.props.limit,
      page: this.props.page,

      withProducts: false,

      offers: 0,
      offer: this.props.offer,

      branches: [],
      selectedBranches: [],

      subcategories: [],
      selectedSubcategories: [],
      subcategorySearch: '',

      genders: [],
      selectedGenders: [],

      brands: [],
      selectedBrands: [],

      attributes: [],
      selectedAttributes: [],
      sizes: [],
      selectedSizes: [],

      prices: [],
      selectedPrices: [],

      loadingFilters: false,
      loadingProducts: false,

      isLoading: true,
      emptyTitle: 'Cargando...',
      emptyDescription: 'Espere un momento por favor.',
      emptyButtonTitle: '',

      orderBy: this.props.orderBy,
      orders: [
        { value: 'priceLowToHight', description: 'Precio: menor a mayor' },
        { value: 'priceHightToLow', description: 'Precio: mayor a menor' },
        { value: 'brandNameASC', description: 'Marca: A - Z' },
        { value: 'brandNameDESC', description: 'Marca: Z - A' },
        { value: 'bestOffer', description: 'Mejor oferta' }
      ],

      brandSearch: '',
      branchSearch: '',


      loadingPosition: false,
      position: null,
      distance: '',

      showMobileFilters: false,

      countCatalog: Utils.getCurrentCatalog().length,
      catalog: [],
      currentCatalogStatus: false,
      catalogModalOpen: false
    }

    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)

    this.loadData = this.loadData.bind(this)
    this.loadFilters = this.loadFilters.bind(this)

    this.handleChangeBranches = this.handleChangeBranches.bind(this)
    this.handleChangeSubcategories = this.handleChangeSubcategories.bind(this)
    this.handleChangeBrands = this.handleChangeBrands.bind(this)
    this.handleChangeSizes = this.handleChangeSizes.bind(this)
    this.handleChangeAttributes = this.handleChangeAttributes.bind(this)
    this.handleChangePrices = this.handleChangePrices.bind(this)
    this.handleChangeOffer = this.handleChangeOffer.bind(this)
    this.handleChangeOrder = this.handleChangeOrder.bind(this)
    this.handleChangeGender = this.handleChangeGender.bind(this)

    this.generateQuery = this.generateQuery.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
    this.deletePosition = this.deletePosition.bind(this)
    this.deleteBreadcrumb = this.deleteBreadcrumb.bind(this)

    this.showMobileFilters = this.showMobileFilters.bind(this)
    this.checkStatus = this.checkStatus.bind(this)
  }

  checkStatus(product) {
    if (Utils.activeCatalog()) {
      return Utils.isProductIntoCatalog(product)
    } else {
      return false
    }
  }

  listenToScroll = () => {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop
    /*
    const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight
    */
    // const scrolled = winScroll / height

    this.setState({
      scrollPosition: winScroll,
    })
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.listenToScroll)
  }

  createCatalog() {
    if (Utils.isUserLoggedIn()) {
      localStorage.setItem(Utils.constants.localStorage.CATALOG_INIT, 1)
      this.setState({
        openSnack: true,
        currentCatalogStatus: true,
        messageSnack: 'Empieza a agregar productos a tu catálogo.'
      })
    }
    else {
      Router.push('/ingreso?catalogo=true')
    }
  }

  cancelCatalog() {
    if (Utils.isUserLoggedIn()) {
      localStorage.setItem(Utils.constants.localStorage.CATALOG_INIT, 0)
      this.setState({
        openSnack: true,
        currentCatalogStatus: false,
        catalog: [],
        messageSnack: 'Haz cancelado la creación del catálogo correctamente.'
      })
    }
  }

  showMobileFilters() {
    let show = !this.state.showMobileFilters
    this.setState({
      showMobileFilters: show
    })
  }

  onChangeInputSearch(inputName, listName, event) {
    const query = event.target.value.toLowerCase()
    this.setState({ [inputName]: query }, () => this.filterList(inputName, listName))
  }

  filterList(inputName, listName) {
    let list = this.props.filters[listName]
    let filtered = this.props.filters[listName]
    let inputSearch = this.props.filters[inputName]

    filtered = filtered.filter((item) => {
      return item.description.toLowerCase().indexOf(inputSearch) !== -1
    })

    if (filtered.length !== list.length) {
      let hidden = true

      list.forEach((item, idx) => {
        hidden = true
        filtered.forEach((filter) => {
          if (item.id === filter.id) {
            hidden = false
          }
        })
        list[idx].hidden = hidden
      })
    } else {
      list.forEach((item, idx) => {
        list[idx].hidden = false
      })
    }

    this.setState({ [listName]: list })
  }

  componentWillMount() {
    Utils.scrollTop()
    if (Number(localStorage.getItem(Utils.constants.localStorage.CATALOG_INIT)) === 1) {
      let catalog = []
      if (localStorage.getItem(Utils.constants.localStorage.CATALOG) !== null)
        catalog = JSON.parse(localStorage.getItem(Utils.constants.localStorage.CATALOG))
      this.setState({
        currentCatalogStatus: true,
        catalog: catalog
      })
    }
  }

  async loadData() {
    let isLoading = this.state.isLoading
    let emptyImage = this.state.emptyImage
    let title = this.state.emptyTitle
    let description = this.state.emptyDescription
    let buttonTitle = this.state.emptyButtonTitle

    if (this.state.products.length === 0) {
      isLoading = false
      emptyImage = boxEmpty
      title = '¡No hay resultados!'
      description = 'Por favor intenta más tarde o realiza una búsqueda diferente.'
      if (this.state.position !== null)
        buttonTitle = 'Borrar filtros'
    }

    this.setState({
      banners: [],
      products: this.state.products,
      withProducts: (this.state.products.length > 0) ? true : false,
      loadingFilters: true,
      loadingProducts: false,
      isLoading: isLoading,
      emptyImage: emptyImage,
      emptyTitle: title,
      emptyDescription: description,
      emptyButtonTitle: buttonTitle,
      showMobileFilters: false
    })

    this.loadFilters(false, this.state.withOffer, this.state.page, this.state.orderBy)
  }

  async loadFilters(fromUrl = false, withOffer = false, page = 0, orderBy = '', selectedBranches = [], selectedSubcategories = [], selectedBrands = [], selectedAttributes = [], selectedSizes = [], selectedPrices = [], selectedGenders = []) {
    const self = this
    let count = this.props.count
    let checked = false
    let branches = []
    let selectedBranchesState = []
    
    this.props.branches.forEach((branch) => {
      checked = false
      if (fromUrl) {
        selectedBranches.forEach((b) => {
          if (Number(b) === branch.id) {
            checked = true
          }
        })
        if (checked) {
          selectedBranchesState.push({ id: branch.id, description: branch.description, count: branch.count, checked: checked })
        }
      } else {
        self.state.selectedBranches.forEach((selected) => {
          if (selected.id === branch.id)
            checked = true
        })
      }
      branches.push({ id: branch.id, description: branch.description, count: branch.count, hidden: false, checked: checked })
    })

    let subcategories = []
    let selectedSubcategoriesState = []
    this.props.subcategories.forEach((subcategory) => {
      checked = false
      if (fromUrl) {
        selectedSubcategories.forEach((c) => {
          if (Number(c) === subcategory.id) {
            checked = true
          }
        })
        if (checked) {
          selectedSubcategoriesState.push({ id: subcategory.id, description: subcategory.description, count: subcategory.count, checked: checked })
        }
      } else {
        self.state.selectedSubcategories.forEach((selected) => {
          if (selected.id === subcategory.id)
            checked = true
        })
      }
      subcategories.push({ id: subcategory.id, description: subcategory.description, count: subcategory.count, hidden: false, checked: checked })
    })

    let brands = []
    let selectedBrandsState = []
    this.props.brands.forEach((brand) => {
      checked = false
      if (fromUrl) {
        selectedBrands.forEach((b) => {
          if (Number(b) === brand.id) {
            checked = true
          }
        })
        if (checked) {
          selectedBrandsState.push({ id: brand.code, description: brand.name, count: brand.count, checked: checked })
        }
      } else {
        self.state.selectedBrands.forEach((selected) => {
          if (selected.id === brand.id)
            checked = true
        })
      }
      brands.push({ id: brand.code, description: brand.name, count: brand.count, hidden: false, checked: checked })
    })

    let attributes = []
    let selectedAttributesState = []
    this.props.attributes.forEach((attribute) => {
      checked = false
      if (fromUrl) {
        selectedAttributes.forEach((a) => {
          if (a === attribute.code) {
            checked = true
          }
        })
        if (checked) {
          selectedAttributesState.push({ id: attribute.code, description: attribute.description, count: attribute.count, checked: checked })
        }
      } else {
        self.state.selectedAttributes.forEach((selected) => {
          if (selected.id === attribute.code)
            checked = true
        })
      }
      attributes.push({ id: attribute.code, description: attribute.description, count: attribute.count, checked: checked })
    })

    let sizes = []
    let selectedSizesState = []
    this.props.sizes.forEach((size) => {
      if (size.count > 0) {
        checked = false
        if (fromUrl) {
          selectedSizes.forEach((s) => {
            if (s === size.value) {
              checked = true
            }
          })
          if (checked) {
            selectedSizesState.push({ value: size.value, count: size.count, checked: checked })
          }
        } else {
          self.state.selectedSizes.forEach((selected) => {
            if (selected.value === size.value)
              checked = true
          })
        }
        sizes.push({ value: size.value, count: size.count, checked: checked })
      }
    })

    let prices = []
    let selectedPricesState = []
    this.props.prices.forEach((price) => {
      checked = false
      if (fromUrl) {
        selectedPrices.forEach((p) => {
          if (p.split('|')[0] === price.min) {
            checked = true
          }
        })
        if (checked) {
          if (Utils.isEmpty(price.min)) {
            selectedPricesState.push({ min: price.min, max: price.max, description: '$' + Utils.numberWithCommas(Number(price.max).toFixed(2)) + ' o menor', count: price.count, checked: checked })
          }
          else if (Utils.isEmpty(price.max)) {
            selectedPricesState.push({ min: price.min, max: price.max, description: '$' + Utils.numberWithCommas(Number(price.min).toFixed(2)) + ' o mayor', count: price.count, checked: checked })
          }
          else {
            selectedPricesState.push({ min: price.min, max: price.max, description: '$' + Utils.numberWithCommas(Number(price.min).toFixed(2)) + ' - $' + Utils.numberWithCommas(Number(price.max).toFixed(2)), count: price.count, checked: checked })
          }
        }
      } else {
        self.state.selectedPrices.forEach((selected) => {
          if (selected.min === price.min)
            checked = true
        })
      }
      prices.push({ min: price.min, max: price.max, description: price.description, count: price.count, checked: checked })
    })

    let genders = []
    let selectedGendersState = []
    this.props.genders.forEach((gender) => {
      checked = false
      if (fromUrl) {
        selectedGenders.forEach((g) => {
          if (g === gender.id) {
            checked = true
          }
        })
        if (checked) {
          selectedGendersState.push({ id: gender.id, description: gender.description, count: gender.count, checked: checked })
        }
      } else {
        self.state.selectedGenders.forEach((selected) => {
          if (selected.id === gender.id)
            checked = true
        })
      }
      genders.push({ id: gender.id, description: gender.description, count: gender.count, checked: checked })
    })

    let openSnack = false
    let messageSnack = ''
    if (this.state.position !== null && Utils.isEmpty(this.props.distance)) {
      openSnack = true
      messageSnack = 'No hay tiendas cercanas.'
    }

    this.setState({
      openSnack: openSnack,
      messageSnack: messageSnack,
      withOffer: withOffer,
      orderBy: orderBy,
      page: page,
      offers: this.props.offers,
      branches: branches,
      subcategories: subcategories,
      sizes: sizes,
      prices: prices,
      genders: genders,
      attributes: attributes,
      brands: brands,
      loadingFilters: false,
      selectedBranches: (fromUrl) ? selectedBranchesState : this.state.selectedBranches,
      selectedSubcategories: (fromUrl) ? selectedSubcategoriesState : this.state.selectedSubcategories,
      selectedBrands: (fromUrl) ? selectedBrandsState : this.state.selectedBrands,
      selectedSizes: (fromUrl) ? selectedSizesState : this.state.selectedSizes,
      selectedAttributes: (fromUrl) ? selectedAttributesState : this.state.selectedAttributes,
      selectedPrices: (fromUrl) ? selectedPricesState : this.state.selectedPrices,
      selectedGenders: (fromUrl) ? selectedGendersState : this.state.selectedGenders,
      count: count,
      distance: this.props.distance
    })
  }

  handleChangeOrder(event) {
    this.setState({
      page: 0,
      orderBy: event.target.value
    }, () => this.generateQuery())
  }

  handleChangeOffer(remove = false) {
    let offer = !this.state.offer
    if (remove) {
      offer = false
    }
    this.setState({
      page: 0,
      offer: offer
    }, () => this.generateQuery())
  }

  handleChangeBranches(idx, remove = false) {
    let branches = this.state.branches
    let selectedBranches = this.state.selectedBranches

    if (remove) {
      branches.forEach((item, jdx) => {
        if (item.id === selectedBranches[idx].id)
          branches[jdx].checked = false
      })
      selectedBranches.splice(idx, 1)
    }
    else {
      selectedBranches = []
      branches.forEach((item, jdx) => {
        branches[jdx].checked = false
      })

      branches[idx].checked = !branches[idx].checked
      if (branches[idx].checked) {
        selectedBranches.push(branches[idx])
        if (selectedBranches.length > 1) {
          selectedBranches = Utils.uniqBy(selectedBranches, 'id')
        }
      }
      else {
        if (selectedBranches.length > 0) {
          selectedBranches.forEach((selected, jdx) => {
            if (selected.id === branches[idx].id) {
              selectedBranches.splice(jdx, 1)
            }
          })
        }
      }
    }

    this.setState({
      branchSearch: '',
      page: 0,
      branches: branches,
      selectedBranches: selectedBranches
    }, () => this.generateQuery())
  }

  handleChangeSubcategories(idx, remove = false) {
    let subcategories = this.state.subcategories
    let selectedSubcategories = this.state.selectedSubcategories
    if (remove) {
      subcategories.forEach(function (subcategory, jdx) {
        if (subcategory.id === selectedSubcategories[idx].id)
          subcategories[jdx].checked = false
      })
      selectedSubcategories.splice(idx, 1)
    } else {
      selectedSubcategories = []
      subcategories.forEach(function (item, jdx) {
        subcategories[jdx].checked = false
      })

      subcategories[idx].checked = !subcategories[idx].checked
      if (subcategories[idx].checked) {
        selectedSubcategories.push(subcategories[idx])
        if (selectedSubcategories.length > 1) {
          selectedSubcategories = Utils.uniqBy(selectedSubcategories, 'id')
        }
      }
      else {
        if (selectedSubcategories.length > 0) {
          selectedSubcategories.forEach(function (selected, jdx) {
            if (selected.id === subcategories[idx].id) {
              selectedSubcategories.splice(jdx, 1)
            }
          })
        }
      }
    }

    this.setState({
      subcategoriesSearch: '',
      page: 0,
      subcategories: subcategories,
      selectedSubcategories: selectedSubcategories
    }, () => this.generateQuery())
  }

  handleChangeBrands(idx, remove = false) {
    let brands = this.props.filters.brands
    let selectedBrands = this.state.selectedBrands
    if (remove) {
      brands[idx].checked = false
    }
    else {
      brands[idx].checked = !brands[idx].checked
      if (brands[idx].checked) {
        selectedBrands.push(brands[idx])
        if (selectedBrands.length > 1) {
          selectedBrands = Utils.uniqBy(selectedBrands, 'code')
        }
      }
      else {
        if (selectedBrands.length > 0) {
          selectedBrands.forEach((selected, jdx) => {
            if (selected.code === brands[idx].code) {
              selectedBrands.splice(jdx, 1)
            }
          })
        }
      }
    }

    this.setState({
      brandSearch: '',
      page: 0,
      brands: brands,
      selectedBrands: selectedBrands
    }, () => this.generateQuery())
  }

  handleChangeGender(idx, remove = false) {
    let genders = this.props.filters.genders
    let selectedGenders = this.state.selectedGenders
    if (remove) {
      genders.forEach((gender, jdx) => {
        if (gender.id === selectedGenders[idx]) {
          gender[jdx].checked = false
        }
      })
      selectedGenders.splice(idx, 1)
    } else {
      genders[idx].checked = !genders[idx].checked
      if (genders[idx].checked) {
        selectedGenders.push(genders[idx])
        if (selectedGenders.length > 1) {
          selectedGenders = Utils.uniqBy(selectedGenders, 'id')
        }
      } else {
        if (selectedGenders.length > 0) {
          selectedGenders.forEach((selected, jdx) => {
            if (selected.id === genders[idx].id) {
              selectedGenders.splice(jdx, 1)
            }
          })
        }
      }
    }

    this.setState({
      page: 0,
      genders: genders,
      selectedGenders: selectedGenders
    }, () => this.generateQuery())
  }

  handleChangeAttributes(idx, remove = false) {
    let attributes = this.props.filters.attributes
    let selectedAttributes = this.state.selectedAttributes
    if (remove) {
      attributes[idx].checked = false
    }
    else {
      attributes[idx].checked = !attributes[idx].checked
      if (attributes[idx].checked) {
        selectedAttributes.push(attributes[idx])
        if (selectedAttributes.length > 1) {
          selectedAttributes = Utils.uniqBy(selectedAttributes, 'icoded')
        }
      }
      else {
        if (selectedAttributes.length > 0) {
          selectedAttributes.forEach(function (selected, jdx) {
            if (selected.code === attributes[idx].code) {
              selectedAttributes.splice(jdx, 1)
            }
          })
        }
      }
    }

    this.setState({
      page: 0,
      attributes: attributes,
      selectedAttributes: selectedAttributes
    }, function () {
      this.generateQuery()
    })
  }

  handleChangeSizes(idx, remove = false) {
    let sizes = this.props.filters.sizes
    let selectedSizes = this.state.selectedSizes
    if (remove) {
      sizes[idx].checked = false
    }
    else {
      sizes[idx].checked = !sizes[idx].checked
      if (sizes[idx].checked) {
        selectedSizes.push(sizes[idx])
        if (selectedSizes.length > 1) {
          selectedSizes = Utils.uniqBy(selectedSizes, 'value')
        }
      }
      else {
        if (selectedSizes.length > 0) {
          selectedSizes.forEach(function (selected, jdx) {
            if (selected.value === sizes[idx].value) {
              selectedSizes.splice(jdx, 1)
            }
          })
        }
      }
    }

    this.setState({
      page: 0,
      sizes: sizes,
      selectedSizes: selectedSizes
    }, () => {
      this.generateQuery()
    })
  }

  handleChangePrices(idx, remove = false) {
    let prices = this.props.filters.prices
    let selectedPrices = this.state.selectedPrices

    if (remove) {
      prices[idx].checked = false
    }
    else {
      prices[idx].checked = !prices[idx].checked
      if (prices[idx].checked) {
        selectedPrices.push(prices[idx])
        if (selectedPrices.length > 1) {
          selectedPrices = Utils.uniqBy(selectedPrices, 'min')
        }
      }
      else {
        if (selectedPrices.length > 0) {
          selectedPrices.forEach(function (selected, jdx) {
            if (selected.min === prices[idx].min) {
              selectedPrices.splice(jdx, 1)
            }
          })
        }
      }
    }

    this.setState({
      page: 0,
      prices: prices,
      selectedPrices: selectedPrices
    }, function () {
      this.generateQuery()
    })
  }

  handleChangePage(event, page) {
    this.setState({
      page: page
    }, () => {
      Utils.scrollTop()
      this.generateQuery()
    })
  }

  /*
  handlePermission() {
    let self = this
    this.setState({
      loadingPosition: true
    })
    navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
      if (result.state === 'granted') {
        navigator.geolocation.getCurrentPosition(function (success) {
          self.setState({
            loadingPosition: false,
            position: { lat: success.coords.latitude, lng: success.coords.longitude }
          }, () => {
            self.generateQuery()
          })
        }, (err) => {
          self.setState({
            loadingPosition: false,
            position: null
          }, () => {
          })
        })
      } else if (result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(function (success) {
          self.setState({
            loadingPosition: false,
            position: { lat: success.coords.latitude, lng: success.coords.longitude }
          }, function () {
            self.generateQuery()
          })
        }, function (err) {
          self.setState({
            loadingPosition: false,
            position: null
          }, function () {
          })
        }, {enableHighAccuracy: true, maximumAge: 10000})
      } else if (result.state === 'denied') {
        self.setState({
          openSnack: true,
          messageSnack: 'No podemos acceder a tu ubicación. Revisa los ajustes de ubicación de tu navegador.',
          loadingPosition: false,
          position: null
        })
      }
    })
  }
  */

  deleteBreadcrumb(breadcrumb) {
    let url = ''
    let stop = false
    this.props.breadcrumbs.forEach((item, idx) => {
      if (item !== breadcrumb && !stop) {
        url += '/' + item
      } else {
        if (idx !== this.props.breadcrumbs.length - 1) {
          stop = true
        }
      }
    })
    if (Utils.isEmpty(url))
      url = '/'
    Router.push(url)
  }

  deletePosition() {
    this.setState({
      loadingPosition: false,
      position: null,
      distance: ''
    }, () => this.generateQuery())
  }

  async generateQuery() {
    let offer = this.state.offer
    let orderBy = this.state.orderBy
    let page = this.state.page
    let selectedBranches = []
    let selectedSubcategories = []
    let selectedBrands = []
    let selectedAttributes = []
    let selectedSizes = []
    let selectedPrices = []
    let selectedGenders = []

    this.props.filters.branches.forEach((item) => {
      if (item.checked) {
        selectedBranches.push(item.id.toString())
      }
    })

    this.props.filters.subcategories.forEach((item) => {
      if (item.checked) {
        selectedSubcategories.push(item.id.toString())
      }
    })

    this.props.filters.brands.forEach((item) => {
      if (item.checked) {
        selectedBrands.push(item.code)
      }
    })

    this.props.filters.attributes.forEach((item) => {
      if (item.checked) {
        selectedAttributes.push(item.code)
      }
    })

    this.props.filters.sizes.forEach((item) => {
      if (item.checked) {
        selectedSizes.push(item.value)
      }
    })

    this.props.filters.prices.forEach((item) => {
      if (item.checked) {
        selectedPrices.push(item.min + '|' + item.max)
      }
    })

    this.props.filters.genders.forEach((item) => {
      if (item.checked) {
        selectedGenders.push(item.code)
      }
    })

    if (page === 0 && Utils.isEmpty(orderBy) && !offer && selectedBranches.length === 0 && selectedSubcategories.length === 0 && selectedBrands.length === 0 && selectedPrices.length === 0 && selectedAttributes.length === 0 && selectedSizes.length === 0 && selectedGenders.length === 0) {
      this.toCategory()
    } else {
      let query = {
        pg: page,
        l: 50,
        u: (this.props.breadcrumbs) !== null ? this.props.breadcrumbs[this.props.breadcrumbs.length - 1] : this.props.breadcrumbs,
        c: null,
        bc: this.props.breadcrumbs,
        br: selectedBranches,
        sc: selectedSubcategories,
        b: selectedBrands,
        a: selectedAttributes,
        s: selectedSizes,
        p: selectedPrices,
        g: selectedGenders,
        o: offer,
        ob: orderBy
      }

      let filter = Utils.encode(JSON.stringify(query))
      this.toCategory(filter)
    }
  }

  toCategory(withCsa = '') {
    let url = ''
    if (this.props.breadcrumbs === null) {
      url = 'todos'
    } else {
      this.props.breadcrumbs.forEach(breadcrumb => {
        url += '/' + breadcrumb
      })
    }
    
    if (!Utils.isEmpty(withCsa)) {
      url += '?csa=' + withCsa
    }
    Router.push(url)
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  render() {
    let self = this
    const { classes } = this.props
    return (
      <>
        {
          (this.props.isBrand === undefined || !this.props.isBrand) ?
          <ButtonBlock data={this.props.buttons} />
          :
          ''
        }
        {
          (this.props.products.length > 0) ?
            <div>
              {
                (self.state.currentCatalogStatus) ?
                  <div>
                    <Hidden smUp>
                      <Grid container style={{ zIndex: 1, position: 'fixed', left: 0, bottom: 0, padding: 16, backgroundColor: 'white', borderTop: '1px solid #D7D7D7' }}>
                        <Grid item xs={12}>
                          <Button variant="contained" fullWidth color="primary" onClick={() => self.setState({ catalogModalOpen: true })}>
                            GENERAR CATÁLOGO
                          </Button>
                        </Grid>
                      </Grid>
                    </Hidden>
                    <Grid container justify="flex-start" alignItems="center" className={classes.catalogMenu} style={(this.state.scrollPosition >= 170) ? { position: 'fixed', top: 0, right: 0, width: '100%' } : { position: 'relative' }}>
                      <Grid item xl={8} lg={8} md={7} sm={12} className={classes.catalogTitleContainer}>
                        <Typography className={classes.catalogTitle} variant="h1">Selecciona productos a tu nuevo catálogo.</Typography>
                        <Hidden smUp>
                          {(self.state.countCatalog === 1) ?
                            <Typography variant="body1" style={{ color: 'rgb(0, 0, 0, 0.54)' }}>1 producto</Typography>
                            :
                            <Typography variant="body1" style={{ color: 'rgb(0, 0, 0, 0.54)' }}>{self.state.countCatalog} productos</Typography>
                          }
                        </Hidden>
                      </Grid>
                      <Hidden xsDown>
                        <Grid item xl={4} lg={4} md={5} sm={12}>
                          <Grid container direction="row" justify="space-between" alignItems="center">
                            {(self.state.countCatalog === 1) ?
                              <Typography variant="body1" style={{ color: 'rgb(0, 0, 0, 0.54)' }}>1 producto seleccionado</Typography>
                              :
                              <Typography variant="body1" style={{ color: 'rgb(0, 0, 0, 0.54)' }}>{self.state.countCatalog} productos seleccionados</Typography>
                            }
                            <Button variant="contained" className={classes.button} color="primary" onClick={() => self.setState({ catalogModalOpen: true })}>
                              GUARDAR CATÁLOGO
                            </Button>
                          </Grid>
                        </Grid>
                      </Hidden>
                    </Grid>
                  </div>
                  :
                  ''
              }
              <Grid container justify="flex-start" alignItems="flex-end" className={classes.brandContainer} style={(this.state.scrollPosition >= 170 && this.state.currentCatalogStatus) ? { marginTop: 72 } : { marginTop: 0 }}>
                {/*
                  (this.state.banners.length > 0 && !Utils.isEmpty(this.state.banners[0]) || !Utils.isEmpty(this.state.banners[1])) ?
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Hidden smDown>
                      <img src={this.state.banners[0]} alt="" style={{ marginBottom: 32, width: '100%'}} />
                    </Hidden>
                    <Hidden smUp>
                      <img src={this.state.banners[1]} alt="" style={{ width: '100%' }} />
                    </Hidden>
                  </Grid>
                  :
                  ''
                */}
              </Grid>
              <Grid container justify="flex-start" alignItems="flex-start">
                <Grid item lg={2} md={3} className={(this.state.showMobileFilters) ? classes.filtersMobileContainer : classes.filtersContainer}>
                  <Hidden mdUp>
                    <Grid container style={{ zIndex: 1, position: 'fixed', left: 0, bottom: 0, padding: 16, backgroundColor: 'white', borderTop: '1px solid #D7D7D7' }}>
                      <Grid item sm={6} xs={6} style={{ paddingRight: 8 }}>
                        <Button variant="outlined" color="primary" style={{ textAlign: 'center', width: '100%' }} onClick={() => { this.toCategory() }}>
                          LIMPIAR FILTROS
                        </Button>
                      </Grid>
                      <Grid item sm={6} xs={6} style={{ paddingLeft: 8 }}>
                        <Button variant="outlined" color="primary" style={{ textAlign: 'center', width: '100%' }} onClick={() => { this.showMobileFilters() }}>
                          CERRAR
                        </Button>
                      </Grid>
                    </Grid>
                  </Hidden>
                  <Hidden smDown>
                    <div style={{ width: '100%', marginBottom: 12 }}>
                    {
                    (self.state.currentCatalogStatus) ?
                    <Button variant="outlined" className={classes.button} style={{ width: '100%' }} color="primary" onClick={() => { this.cancelCatalog() }}>
                      CANCELAR
                    </Button>
                    :
                    <Button variant="contained" className={classes.button} style={{ width: '100%' }} color="primary" onClick={() => { this.createCatalog() }}>
                      CREAR CATÁLOGO
                    </Button>
                    }
                    </div>
                  </Hidden>
                  <div>
                    <Typography variant="body1" style={{ marginBottom: 8 }}>Ordenar resultado</Typography>
                    <TextField 
                      fullWidth
                      select
                      value={this.state.orderBy}
                      variant="outlined"
                      label={ Utils.isEmpty(this.state.orderBy) ? "Ordenar por..." : '' }
                      InputProps={{
                        className: classes.input,
                      }}
                      InputLabelProps={{
                        style: {
                          height: 40,
                          top: -8
                        },
                      }}
                      onChange={(event) => { self.handleChangeOrder(event) }}>
                        <MenuItem value="">-</MenuItem>
                        {
                          this.state.orders.map((order, index) => {
                            if (order.value === 'bestOffer') {
                              if (self.state.offers > 0) {
                                return (
                                  <MenuItem key={index} value={order.value}>{order.description}</MenuItem>
                                )
                              } 
                            } else {
                              return (
                                <MenuItem key={index} value={order.value}>{order.description}</MenuItem>
                              )
                            }
                          })
                        }
                    </TextField>
                    <hr style={{ opacity: 0.4, margin: '16px 0', marginTop: 24 }} />
                    {/*
                      (this.props.breadcrumbs.length === 0 && this.props.filters.genders.length > 0) ?
                      <FilterList
                        data={this.props.filters.genders}
                        handleFunction={self.handleChangeGender}
                        style={{ margin: 0, marginTop: 16, padding: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 120, overflowY: 'auto' }}
                        title="Género"
                      />
                      :
                      ''
                    */}
                    {
                    /*
                      (Utils.isEmpty(this.state.distance)) ?
                      <div>
                        <Button variant="outlined" color="primary" style={{ textAlign: 'center', width: '100%' }} onClick={this.handlePermission}>
                          {(this.state.loadingPosition) ? <div style={{ width: 24, paddingRight: 4 }}><Loading /></div> : <Icon style={{ paddingRight: 4 }}>room</Icon>} <span>Cercano</span>
                        </Button>
                        <hr style={{ opacity: 0.4, margin: '16px 0' }} />
                      </div>
                      :
                      ''
                    */
                    }
                    {
                      (this.props.filters.offers > 0) ?
                      <div>
                        <Typography variant="body1">Con oferta</Typography>
                        <ul style={{ margin: 0, padding: '16px', listStyle: 'none', overflow: 'none' }}>
                          <li style={{ fontSize: 12, margin: 0, padding: 0 }}>
                            <Checkbox
                              style={{ fontSize: 12, margin: 0, padding: 0 }}
                              checked={this.state.offer}
                              onChange={() => { self.handleChangeOffer() }}
                              value={this.state.offer}
                              color="primary"
                            />
                            (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(this.props.filters.offers)}</strong>)
                          </li>
                        </ul>
                        <hr style={{ opacity: 0.4, margin: '16px 0', marginTop: 8 }} />
                      </div>
                      :
                      ''
                    }
                    {
                    /*
                      (false) ?
                      <FilterList
                        data={this.state.branches}
                        filterInput={{ placeholder: "Buscar tienda...", search: this.state.branchSearch, inputSearch: classes.inputSearch }}
                        handleInputFunction={{ function: this.onChangeInputSearch, params: ['branchSearch', 'branches'] }}
                        handleFunction={self.handleChangeBranches}
                        style={{ margin: 0, marginTop: 16, padding: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 80, overflowY: 'auto' }}
                        title="Tienda"
                      />
                      :
                      ''
                    */
                    }
                    {
                    /*
                      (false) ?
                      <FilterList
                        data={this.state.subcategories}
                        filterInput={{ placeholder: "Buscar sub-categoría...", search: this.state.subcategorySearch, inputSearch: classes.inputSearch }}
                        handleInputFunction={{ function: this.onChangeInputSearch, params: ['subcategorySearch', 'subcategories'] }}
                        handleFunction={self.handleChangeSubcategories}
                        style={{ margin: 0, marginTop: 16, padding: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 140, overflowY: 'auto' }}
                        title="Sub-categoría"
                      />
                      :
                      ''
                    */
                    }
                    {
                      (this.props.filters.brands.length > 0) ?
                      <FilterList
                        data={this.props.filters.brands}
                        filterInput={{ placeholder: "Buscar marca...", search: this.state.brandSearch, inputSearch: classes.inputSearch }}
                        handleInputFunction={{ function: this.onChangeInputSearch, params: ['brandSearch', 'brands'] }}
                        handleFunction={self.handleChangeBrands}
                        style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 200, 'overflow-y': 'auto' }}
                        title="Marca"
                      />
                      :
                      ''
                    }
                    {
                      (this.props.filters.sizes.length > 0) ?
                      <FilterList
                        data={this.props.filters.sizes}
                        handleFunction={self.handleChangeSizes}
                        size={true}
                        style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 200, 'overflow-y': 'auto' }}
                        title="Talla"
                      />
                      :
                      ''
                    }
                    {
                      (this.props.filters.attributes.length > 0) ?
                      <FilterList
                        data={this.props.filters.attributes}
                        handleFunction={self.handleChangeAttributes}
                        style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 200, 'overflow-y': 'auto' }}
                        title="Atributo"
                      />
                      :
                      ''
                    }
                    {
                      (this.props.filters.prices.length > 0) ?
                      <FilterList
                        data={this.props.filters.prices}
                        handleFunction={self.handleChangePrices}
                        price={true}
                        style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 120, 'overflow-y': 'auto' }}
                        title="Precio"
                      />
                      :
                      ''
                    }
                  </div>
                </Grid>
                <Grid item lg={10} md={9} sm={12} xs={12} style={(this.state.showMobileFilters) ? { display: 'none' } : { display: 'block' }}>
                  <Grid container justify="flex-start" alignItems="flex-end">
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TablePagination
                        className={classes.paginator}
                        labelRowsPerPage=''
                        labelDisplayedRows={({ from, to, count }) => {
                          return <Hidden xsDown><div style={{ fontSize: 14 }}>{from} - {to} de {Utils.numberWithCommas(count)}</div></Hidden>
                        }}
                        count={this.props.filters.count}
                        rowsPerPage={this.state.rowsPerPage}
                        page={this.state.page}
                        rowsPerPageOptions={false}
                        SelectProps={{
                          native: false
                        }}
                        onChangePage={this.handleChangePage}
                      />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.mySelection}>
                      <Hidden mdUp>
                        <Button variant="outlined" color="primary" style={{ margin: '8px 0', marginRight: 8 }} onClick={() => {
                          this.showMobileFilters()
                        }}>
                          <Icon>filter_list</Icon> <span>Filtros</span>
                        </Button>
                        {
                        (self.state.currentCatalogStatus) ?
                        <Button variant="outlined" className={classes.button} color="primary" onClick={() => { this.cancelCatalog() }}>
                          CANCELAR
                        </Button>
                        :
                        <Button variant="contained" className={classes.button} color="primary" onClick={() => { this.createCatalog() }}>
                          CREAR CATÁLOGO
                        </Button>
                        }
                      </Hidden>
                      <Typography variant="body1"><strong>{Utils.numberWithCommas(this.props.filters.count)}</strong> resultados para tu búsqueda:</Typography>
                      {
                        (this.props.breadcrumbs !== null) ?
                          this.props.breadcrumbs.map(breadcrumb => {
                            let title = breadcrumb.split('-').join(' ')
                            return (
                              <Chip style={{ marginTop: 6, marginRight: 6 }} label={title.toUpperCase()} color="primary" onDelete={() => { self.deleteBreadcrumb(breadcrumb) }} color="primary" />
                            )
                          })
                        :
                        ''
                      }
                      {
                        (!Utils.isEmpty(this.state.distance)) ?
                          <Chip style={{ marginTop: 6, marginRight: 6 }} label={this.state.distance} onDelete={() => { self.deletePosition() }} color="primary" />
                          :
                          ''
                      }
                      {
                        this.props.filters.genders.map((gender, idx) => {
                          if (gender.checked) {
                            return (
                              <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={gender.description} onDelete={() => { self.handleChangeGender(idx, true) }} color="primary" />
                            )
                          }
                        })
                      }
                      {
                        (this.state.offer) ?
                          <Chip style={{ marginTop: 6, marginRight: 6 }} label="OFERTAS" onDelete={() => { self.handleChangeOffer(true) }} color="primary" />
                          :
                          ''
                      }
                      {
                        this.state.selectedBranches.map((branch, idx) => {
                          return (
                            <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={branch.description} onDelete={() => { self.handleChangeBranches(idx, true) }} color="primary" />
                          )
                        })
                      }
                      {
                        this.state.selectedSubcategories.map((subcategory, idx) => {
                          return (
                            <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={subcategory.description} onDelete={() => { self.handleChangeSubcategories(idx, true) }} color="primary" />
                          )
                        })
                      }
                      {
                        this.props.filters.brands.map((brand, idx) => {
                          if (brand.checked) {
                            return (
                              <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={brand.description} onDelete={() => { self.handleChangeBrands(idx, true) }} color="primary" />
                            )
                          }
                        })
                      }
                      {
                        this.props.filters.attributes.map((attribute, idx) => {
                          if (attribute.checked) {
                            return (
                              <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={attribute.description.toUpperCase()} onDelete={() => { self.handleChangeAttributes(idx, true) }} color="primary" />
                            )
                          }
                        })
                      }
                      {
                        this.props.filters.sizes.map((size, idx) => {
                          if (size.checked) {
                            return (
                              <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={size.value} onDelete={() => { self.handleChangeSizes(idx, true) }} color="primary" />
                            )
                          }
                        })
                      }
                      {
                        this.props.filters.prices.map((price, idx) => {
                          if (price.checked) {
                            return (
                              <Chip key={idx} style={{ marginTop: 6, marginRight: 8 }} label={price.description} onDelete={() => { self.handleChangePrices(idx, true) }} color="primary" />
                            )
                          }
                        })
                      }
                    </Grid>
                    {
                      (this.props.products.length > 0) ?
                        this.props.products.map((product, index) => {
                          return (
                            <Grid key={index} item xl={3} lg={3} md={3} sm={3} xs={6}>
                              <div style={{ margin: 4, backgroundColor: 'white', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.12)'}}>
                              <ProductCard
                                currentCatalogStatus={this.state.currentCatalogStatus}
                                currentCatalog={this.checkStatus(product)}
                                data={product}
                                updateCount={
                                  () => {
                                    this.setState({
                                      countCatalog: Utils.getCurrentCatalog().length
                                    })
                                  }
                                }
                              />
                              </div>
                            </Grid>
                          )
                        })
                        :
                        <Grid item lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
                          <Empty
                            isLoading={this.state.isLoading}
                            emptyImg={this.state.emptyImage}
                            title={this.state.emptyTitle}
                            description={this.state.emptyDescription}
                            buttonTitle={this.state.emptyButtonTitle}
                            callToAction={() => { this.toCategory() }}
                          />
                        </Grid>
                    }
                  </Grid>
                  <TablePagination
                    className={classes.paginator}
                    labelRowsPerPage=''
                    labelDisplayedRows={({ from, to, count }) => {
                      return <div style={{ fontSize: 14 }}>{from} - {to} de {Utils.numberWithCommas(count)}</div>
                    }}
                    colSpan={12}
                    count={this.props.filters.count}
                    rowsPerPage={this.state.rowsPerPage}
                    page={this.state.page}
                    rowsPerPageOptions={false}
                    SelectProps={{
                      native: false
                    }}
                    onChangePage={this.handleChangePage}
                  />
                </Grid>
              </Grid>
            </div>
            :
            <div style={{ margin: '144px 0', marginTop: 144 }}>
              <Empty
                isLoading={this.state.isLoading}
                emptyImg={this.state.emptyImage}
                title={this.state.emptyTitle}
                description={this.state.emptyDescription}
                buttonTitle={this.state.emptyButtonTitle}
                callToAction={() => { this.toCategory() }}
              />
            </div>
        }
        <AddCatalogModal
          open={self.state.catalogModalOpen}
          handleClose={(success) => {
            let open = false
            let message = ''
            if (success) {
              open = true
              message = '¡Catálogo guardado con éxito!'
            }
            self.setState({
              countCatalog: 0,
              catalog: [],
              currentCatalogStatus: false,
              catalogModalOpen: false,
              openSnack: open, messageSnack: message
            })
          }}
        />
        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.state.openSnack}
          onClose={this.handleCloseSnackbar}
          message={
            <span>{this.state.messageSnack}</span>
          }
          action={[
            <Button
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={() => { Router.push('/mi-cuenta/mis-catalogos') }}
            >
              <Icon style={{ fontSize: 14, paddingRight: 8 }}>bookmarks</Icon> <span style={{ color: 'white', fontSize: 14 }}>IR A MIS CATÁLOGOS</span>
            </Button>,
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.handleCloseSnackbar}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      </>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(BrandView)
