import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import { Grid, Typography, Checkbox, Hidden, TablePagination, Button, Icon, TextField, Snackbar, Chip, IconButton, MenuItem } from '@material-ui/core'

import boxEmpty from '../resources/images/boxEmpty.svg'

// Utils
import Utils from '../resources/Utils'
import { startCreateCatalog, endCreateCatalog, getCurrentCatalogStatus, getCurrentCatalog, removeFromCatalog } from '../actions/actionCatalog'
import { requestAPI } from '../api/CRUD'

// Components
import ProductCard from '../components/ProductCard'
import Empty from '../components/Empty'
import Loading from '../components/Loading'
import FilterList from '../components/FilterList'

const styles = theme => ({
  categoryExplorer: {
    marginTop: 36,
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
    fontSize: 32,
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
    [theme.breakpoints.down('xs')]: {
      marginBottom: 16,
      fontSize: 14
    }
  },
  filtersContainer: {
    margin: 0,
    paddingTop: 8,
    paddingLeft: 24,
    paddingRight: 24,
    display: 'block',
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  filtersMobileContainer: {
    zIndex: theme.zIndex.drawer + 1,
    paddingTop: 8,
    paddingLeft: 24,
    paddingRight: 24,
    display: 'none',
    position: 'absolute',
    background: 'white',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
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

class CategoryExplorer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      scrollPosition: 0,

      openSnack: false,
      messageSnack: '',

      count: 0,
      rowsPerPage: 50,
      page: 0,

      products: [],
      withProducts: false,

      offers: 0,
      withOffer: false,

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

      orderBy: '',
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

      catalog: [],
      currentCatalog: false
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
    this.withFilters = this.withFilters.bind(this)
    this.getTitle = this.getTitle.bind(this)

    this.filterList = this.filterList.bind(this)
    this.onChangeInputSearch = this.onChangeInputSearch.bind(this)

    this.handlePermission = this.handlePermission.bind(this)
    this.deletePosition = this.deletePosition.bind(this)

    this.getSelectedFilters = this.getSelectedFilters.bind(this)
    this.showMobileFilters = this.showMobileFilters.bind(this)
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

  cancelCatalog() {
    if (Utils.isUserLoggedIn()) {
      this.props.endCreateCatalog()
      this.setState({
        openSnack: true,
        currentCatalogStatus: false,
        catalog: [],
        messageSnack: 'Haz cancelado la creación del catálogo correctamente.'
      })
    }
  }

  getSelectedFilters() {
    let count = 0
    if (this.state.withOffer)
      count++
    return (count + this.state.selectedBranches.length + this.state.selectedSubcategories.length + this.state.selectedBrands.length + this.state.selectedAttributes.length + this.state.selectedSizes.length + this.state.selectedPrices.length)
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
    let list = this.state[listName]
    let filtered = this.state[listName]
    let inputSearch = this.state[inputName]

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

  componentDidMount() {
    if (Utils.isUserLoggedIn()) {
      window.addEventListener('scroll', this.listenToScroll)
      this.props.getCurrentCatalogStatus()
      this.props.getCurrentCatalog()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.props.getCurrentCatalogStatus()
      this.props.getCurrentCatalog()
      Utils.scrollTop()
      this.setState({
        scrollPosition: 0,
        count: 0,
        withProducts: false,
        loadingFilters: false,
        loadingProducts: false,
        isLoading: true,
        emptyTitle: 'Cargando...',
        emptyDescription: 'Espere un momento por favor.',
        emptyButtonTitle: '',
        withOffer: false,
        offers: 0,
        branchSearch: '',
        branches: [],
        selectedBranches: [],
        subcategorySearch: '',
        subcategories: [],
        selectedSubcategories: [],
        brandSearch: '',
        brands: [],
        selectedBrands: [],
        attributes: [],
        selectedAttributes: [],
        sizes: [],
        selectedSizes: [],
        prices: [],
        selectedPrices: [],
        genders: [],
        selectedGenders: [],
        orderBy: '',
        loadingPosition: false,
        position: null,
        distance: '',
        catalog: [],
        currentCatalog: false
      }, () => {
        this.loadData()
      })
    }
    else if (prevProps !== this.props) {
      if (prevProps.catalog !== this.props.catalog) {
        this.setState({
          currentCatalog: this.props.catalog.init,
          catalog: this.props.catalog.products
        })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      this.props.getCurrentCatalogStatus()
      this.props.getCurrentCatalog()
      if (nextProps.location.search !== '') {
        Utils.scrollTop()
        //this.generateQuery(nextProps.location.search.split('?csa=')[1])
      } else {
        this.setState({
          scrollPosition: 0,
          count: 0,
          withProducts: false,
          loadingFilters: false,
          loadingProducts: false,
          isLoading: true,
          emptyTitle: 'Cargando...',
          emptyDescription: 'Espere un momento por favor.',
          emptyButtonTitle: '',
          withOffer: false,
          offers: 0,
          branchSearch: '',
          branches: [],
          selectedBranches: [],
          subcategorySearch: '',
          subcategories: [],
          selectedSubcategories: [],
          brandSearch: '',
          brands: [],
          selectedBrands: [],
          attributes: [],
          selectedAttributes: [],
          sizes: [],
          selectedSizes: [],
          prices: [],
          selectedPrices: [],
          genders: [],
          selectedGenders: [],
          orderBy: '',
          loadingPosition: false,
          position: null,
          distance: '',
          currentCatalog: false
        }, () => this.loadData())
      }
    }
  }

  componentWillMount() {
    Utils.scrollTop()

    if (Utils.isUserLoggedIn()) {
      this.props.startCreateCatalog()
    }

    if (!Utils.isEmpty(this.props.location.search)) {
      try {
        let filter = this.props.location.search.split('?csa=')
        filter = filter[1]
        if (!Utils.isEmpty(filter)) {
          this.generateQuery(filter)
        }
        else {
          this.props.history.push({
            pathname: this.props.location.pathname,
            search: ''
          })
          this.loadData()
        }
      } catch (err) {
        this.props.history.push({
          pathname: this.props.location.pathname,
          search: ''
        })
        this.loadData()
      }
    }
    else {
      this.loadData()
    }
  }

  getTitle() {
    let url = this.props.match.url
    url = url.split('/')
    return url[1].split('-').join(' ').toUpperCase()
  }

  async loadData() {
    let query = {
      pg: this.state.page,
      l: this.state.rowsPerPage,
      c: this.props.match.params.sectionId || null,
      z: [],
      br: [],
      sc: [],
      b: [],
      a: [],
      s: [],
      p: [],
      g: [],
      o: this.state.withOffer,
      ob: this.state.orderBy
    }

    query = Utils.encode(JSON.stringify(query))

    let response = await requestAPI({
      host: Utils.constants.HOST_API_ECOMMERCE,
      uuid: localStorage.getItem(Utils.constants.localStorage.BUSINESS_UNIT),
      method: 'GET',
      resource: 'products',
      endpoint: '/filter',
      filter: query,
      headers: {
        position: JSON.stringify(this.state.position)
      }
    })

    let isLoading = this.state.isLoading
    let emptyImage = this.state.emptyImage
    let title = this.state.emptyTitle
    let description = this.state.emptyDescription
    let buttonTitle = this.state.emptyButtonTitle

    if (response.data.length === 0) {
      isLoading = false
      emptyImage = boxEmpty
      title = '¡No hay resultados!'
      description = 'Por favor intenta más tarde o realiza una búsqueda diferente.'
      if (this.state.position !== null)
        buttonTitle = 'Borrar filtros'
    }

    this.setState({
      products: response.data,
      withProducts: (response.data.length > 0) ? true : false,
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
    let responseFilters = await requestAPI({
      host: Utils.constants.HOST_API_ECOMMERCE,
      uuid: localStorage.getItem(Utils.constants.localStorage.BUSINESS_UNIT),
      method: 'POST',
      resource: 'products',
      endpoint: '/filters',
      data: {
        id: this.props.match.params.sectionId || null,
        position: navigator.geolocation,
        branches: selectedBranches,
        subcategories: selectedSubcategories,
        brands: selectedBrands,
        attributes: selectedAttributes,
        sizes: selectedSizes,
        prices: selectedPrices,
        genders: selectedGenders,
        offers: withOffer,
      },
      headers: {
        position: JSON.stringify(this.state.position)
      }
    })

    let count = responseFilters.data.count

    let checked = false

    let branches = []
    let selectedBranchesState = []
    responseFilters.data.branches.forEach((branch) => {
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
    responseFilters.data.subcategories.forEach((subcategory) => {
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
    responseFilters.data.brands.forEach((brand) => {
      checked = false
      if (fromUrl) {
        selectedBrands.forEach((b) => {
          if (Number(b) === brand.id) {
            checked = true
          }
        })
        if (checked) {
          selectedBrandsState.push({ id: brand.id, description: brand.description, count: brand.count, checked: checked })
        }
      } else {
        self.state.selectedBrands.forEach((selected) => {
          if (selected.id === brand.id)
            checked = true
        })
      }
      brands.push({ id: brand.id, description: brand.description, count: brand.count, hidden: false, checked: checked })
    })

    let attributes = []
    let selectedAttributesState = []
    responseFilters.data.attributes.forEach((attribute) => {
      checked = false
      if (fromUrl) {
        selectedAttributes.forEach((a) => {
          if (a === attribute.id) {
            checked = true
          }
        })
        if (checked) {
          selectedAttributesState.push({ id: attribute.id, description: attribute.description, count: attribute.count, checked: checked })
        }
      } else {
        self.state.selectedAttributes.forEach((selected) => {
          if (selected.id === attribute.id)
            checked = true
        })
      }
      attributes.push({ id: attribute.id, description: attribute.description, count: attribute.count, checked: checked })
    })

    let sizes = []
    let selectedSizesState = []
    responseFilters.data.sizes.forEach((size) => {
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
    responseFilters.data.prices.forEach((price) => {
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
    responseFilters.data.genders.forEach((gender) => {
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
    if (this.state.position !== null && Utils.isEmpty(responseFilters.data.distance)) {
      openSnack = true
      messageSnack = 'No hay tiendas cercanas.'
    }

    this.setState({
      openSnack: openSnack,
      messageSnack: messageSnack,
      withOffer: withOffer,
      orderBy: orderBy,
      page: page,
      offers: responseFilters.data.offers,
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
      distance: responseFilters.data.distance
    })
  }

  handleChangeOrder(event) {
    this.setState({
      page: 0,
      orderBy: event.target.value
    }, () => this.generateQuery())
  }

  handleChangeOffer(remove = false) {
    let withOffer = !this.state.withOffer
    if (remove) {
      withOffer = false
    }
    this.setState({
      page: 0,
      withOffer: withOffer
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
    let brands = this.state.brands
    let selectedBrands = this.state.selectedBrands
    if (remove) {
      brands.forEach((brand, jdx) => {
        if (brand.id === selectedBrands[idx].id)
          brands[jdx].checked = false
      })
      selectedBrands.splice(idx, 1)
    }
    else {
      brands[idx].checked = !brands[idx].checked
      if (brands[idx].checked) {
        selectedBrands.push(brands[idx])
        if (selectedBrands.length > 1) {
          selectedBrands = Utils.uniqBy(selectedBrands, 'id')
        }
      }
      else {
        if (selectedBrands.length > 0) {
          selectedBrands.forEach((selected, jdx) => {
            if (selected.id === brands[idx].id) {
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
    let genders = this.state.genders
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
    let attributes = this.state.attributes
    let selectedAttributes = this.state.selectedAttributes
    if (remove) {
      attributes.forEach((attribute, jdx) => {
        if (attribute.id === selectedAttributes[idx].id)
          attributes[jdx].checked = false
      })
      selectedAttributes.splice(idx, 1)
    }
    else {
      attributes[idx].checked = !attributes[idx].checked
      if (attributes[idx].checked) {
        selectedAttributes.push(attributes[idx])
        if (selectedAttributes.length > 1) {
          selectedAttributes = Utils.uniqBy(selectedAttributes, 'id')
        }
      }
      else {
        if (selectedAttributes.length > 0) {
          selectedAttributes.forEach(function (selected, jdx) {
            if (selected.id === attributes[idx].id) {
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
    let sizes = this.state.sizes
    let selectedSizes = this.state.selectedSizes
    if (remove) {
      sizes.forEach(function (size, jdx) {
        if (size.value === selectedSizes[idx].value)
          sizes[jdx].checked = false
      })
      selectedSizes.splice(idx, 1)
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
    }, this.generateQuery)
  }

  handleChangePrices(idx, remove = false) {
    let prices = this.state.prices
    let selectedPrices = this.state.selectedPrices

    if (remove) {
      prices.forEach(function (price, jdx) {
        if (price.min === selectedPrices[idx].min)
          prices[jdx].checked = false
      })
      selectedPrices.splice(idx, 1)
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
      loadingFilters: true,
      loadingProducts: true,
      isLoading: true,
      emptyTitle: 'Cargando...',
      emptyDescription: 'Espere un momento por favor.',
      emptyButtonTitle: '',
      page: page
    }, () => {
      Utils.scrollTop()
      this.generateQuery()
    })
  }

  withFilters() {
    if (!this.state.withOffer && this.state.selectedBranches.length === 0 && this.state.selectedSubcategories.length === 0 && this.state.selectedBrands.length === 0 && this.state.selectedPrices.length === 0 && this.state.selectedAttributes.length === 0 && this.state.selectedSizes.length === 0) {
      return false
    }
    return true
  }

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

  deletePosition() {
    this.setState({
      loadingPosition: false,
      position: null,
      distance: ''
    }, () => this.generateQuery())
  }

  async generateQuery(filter = null) {
    let withOffer = this.state.withOffer
    let orderBy = this.state.orderBy
    let page = this.state.page
    let selectedBranches = []
    let selectedSubcategories = []
    let selectedBrands = []
    let selectedAttributes = []
    let selectedSizes = []
    let selectedPrices = []
    let selectedGenders = []

    if (filter !== null) {
      let selected = JSON.parse(Utils.decode(filter))
      selectedBranches = selected.br
      selectedSubcategories = selected.sc
      selectedBrands = selected.b
      selectedAttributes = selected.a
      selectedSizes = selected.s
      selectedPrices = selected.p
      selectedGenders = selected.g
      withOffer = selected.o
      orderBy = selected.ob
      page = selected.pg
    } else {
      this.state.selectedBranches.forEach((item) => {
        selectedBranches.push(item.id.toString())
      })

      this.state.selectedSubcategories.forEach((item) => {
        selectedSubcategories.push(item.id.toString())
      })

      this.state.selectedBrands.forEach((item) => {
        selectedBrands.push(item.id.toString())
      })

      this.state.selectedAttributes.forEach((item) => {
        selectedAttributes.push(item.id)
      })

      this.state.selectedSizes.forEach((item) => {
        selectedSizes.push(item.value)
      })

      this.state.selectedPrices.forEach((item) => {
        selectedPrices.push(item.min + '|' + item.max)
      })

      this.state.selectedGenders.forEach((item) => {
        selectedGenders.push(item.id)
      })
    }

    let isLoading = this.state.isLoading
    let emptyImage = this.state.emptyImage
    let title = this.state.emptyTitle
    let description = this.state.emptyDescription
    let buttonTitle = this.state.emptyButtonTitle

    this.setState({
      loadingFilters: true,
      loadingProducts: true,
      isLoading: true,
      emptyTitle: 'Cargando...',
      emptyDescription: 'Espere un momento por favor.',
      emptyButtonTitle: ''
    })

    if (page === 0 && Utils.isEmpty(orderBy) && !withOffer && selectedBranches.length === 0 && selectedSubcategories.length === 0 && selectedBrands.length === 0 && selectedPrices.length === 0 && selectedAttributes.length === 0 && selectedSizes.length === 0 && selectedGenders.length === 0) {
      this.loadData()
      this.props.history.push({
        pathname: this.props.location.pathname,
        search: ''
      })
    } else {
      let query = null
      if (filter === null) {
        query = {
          pg: this.state.page,
          l: this.state.rowsPerPage,
          c: this.props.match.params.sectionId || null,
          br: selectedBranches,
          sc: selectedSubcategories,
          b: selectedBrands,
          a: selectedAttributes,
          s: selectedSizes,
          p: selectedPrices,
          g: selectedGenders,
          o: this.state.withOffer,
          ob: this.state.orderBy
        }
        query = Utils.encode(JSON.stringify(query))
      }
      else {
        query = filter
      }

      let responseFilter = await requestAPI({
        host: Utils.constants.HOST_API_ECOMMERCE,
        uuid: localStorage.getItem(Utils.constants.localStorage.BUSINESS_UNIT),
        method: 'GET',
        resource: 'products',
        endpoint: '/filter',
        filter: query,
        headers: {
          position: JSON.stringify(this.state.position)
        }
      })

      this.props.history.push({
        pathname: this.props.location.pathname,
        search: '?csa=' + query
      })

      if (responseFilter.data.length === 0) {
        isLoading = false
        emptyImage = boxEmpty
        title = '¡No hay resultados!'
        description = 'Por favor intenta más tarde o realiza una búsqueda diferente.'
        if (this.withFilters()) {
          buttonTitle = 'Borrar filtros'
        }
        Utils.scrollTop()
      }

      let fromUrl = false
      if (filter !== null)
        fromUrl = true

      this.loadFilters(fromUrl, withOffer, page, orderBy, selectedBranches, selectedSubcategories, selectedBrands, selectedAttributes, selectedSizes, selectedPrices, selectedGenders)

      this.setState({
        isLoading: isLoading,
        showMobileFilters: false,
        withProducts: (responseFilter.data.length > 0) ? true : false,
        products: responseFilter.data,
        loadingProducts: false,
        loadingFilters: true,
        emptyImage: emptyImage,
        emptyTitle: title,
        emptyDescription: description,
        emptyButtonTitle: buttonTitle
      })
    }
  }

  clearFilters() {
    let branches = this.state.branches
    this.state.branches.forEach((item, idx) => {
      branches[idx].checked = false
    })

    let subcategories = this.state.subcategories
    this.state.subcategories.forEach((item, idx) => {
      subcategories[idx].checked = false
    })

    let brands = this.state.brands
    this.state.brands.forEach((item, idx) => {
      brands[idx].checked = false
    })

    let attributes = this.state.attributes
    this.state.attributes.forEach((item, idx) => {
      attributes[idx].checked = false
    })

    let sizes = this.state.sizes
    this.state.sizes.forEach((item, idx) => {
      sizes[idx].checked = false
    })

    let prices = this.state.prices
    this.state.prices.forEach((item, idx) => {
      prices[idx].checked = false
    })

    let genders = this.state.genders
    this.state.genders.forEach((item, idx) => {
      genders[idx].checked = false
    })

    this.props.history.push({
      pathname: this.props.location.pathname,
      search: ''
    })

    this.setState({
      // Cargando
      loadingFilters: true,
      loadingProducts: false,

      // Tiendas
      branchSearch: '',
      branches: branches,
      selectedBranches: [],

      // Categorias
      subcategorySearch: '',
      subcategories: subcategories,
      selectedSubcategories: [],

      // Marcas
      brandSearch: '',
      brands: brands,
      selectedBrands: [],

      // Atributos
      attributes: attributes,
      selectedAttributes: [],
      sizes: sizes,
      selectedSizes: [],

      // Precios
      prices: prices,
      selectedPrices: [],

      // Generos
      genders: genders,
      selectedGenders: [],

      // Empty State
      isLoading: true,
      emptyTitle: 'Cargando...',
      emptyDescription: 'Espere un momento por favor.',
      emptyButtonTitle: '',

      //Orden
      orderBy: '',

      // Ofertas
      offers: 0,
      withOffer: false,

      // Posición
      loadingPosition: false,
      position: null,
      distance: '',

      //Catalogo
      catalog: [],
      currentCatalog: false
    }, () => {
      this.loadData()
    })
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
    let marginTopMySelection = -58
    if (this.state.loadingProducts) {
      marginTopMySelection = -2
    }

    return (
      <div>
        {
          (this.state.withProducts) ?
            <div>
              {
                (self.state.currentCatalog) ?
                <div>
                  <Grid container justify="flex-start" alignItems="center" className={classes.catalogMenu} style={(this.state.scrollPosition >= 230) ? { position: 'fixed', top: 64, left: 220, width: '90%' } : { position: 'relative' }}>
                    <Grid item xl={9} lg={9} md={9} sm={9} className={classes.catalogTitleContainer}>
                      <Typography className={classes.catalogTitle} variant="h1">Selección de productos.</Typography>
                      <Typography variant="body2">Selecciona los productos que aparecerán en esta página.</Typography>
                      <Hidden smUp>
                        {(self.state.catalog.length === 1) ?
                          <Typography variant="body1" style={{ color: 'rgb(0, 0, 0, 0.54)' }}>1 Producto</Typography>
                          :
                          <Typography variant="body1" style={{ color: 'rgb(0, 0, 0, 0.54)' }}>{self.state.catalog.length} Productos</Typography>
                        }
                      </Hidden>
                    </Grid>
                    <Hidden xsDown>
                      <Grid item xl={3} lg={3} md={3} sm={3}>
                        <Grid container direction="row" justify="space-between" alignItems="center">
                          {(self.state.catalog.length === 1) ?
                            <Typography variant="body1" style={{ color: 'rgb(0, 0, 0, 0.54)' }}>1 producto seleccionado</Typography>
                            :
                            <Typography variant="body1" style={{ color: 'rgb(0, 0, 0, 0.54)' }}>{self.state.catalog.length} productos seleccionados</Typography>
                          }
                        </Grid>
                      </Grid>
                    </Hidden>
                  </Grid>
                </div>
                :
                ''
              }
              <Grid container justify="flex-start" alignItems="flex-start" className={classes.categoryExplorer} style={(this.state.scrollPosition >= 170 && this.state.currentCatalogStatus) ? { marginTop: 72 } : { marginTop: 36 }}>
                <Grid item xl={9} lg={9} md={9} sm={12} xs={12}>
                  <Typography className={classes.searchCount} variant="h6">{Utils.numberWithCommas(this.state.count)} artículos encontrados.</Typography>
                </Grid>
                <Grid item xl={3} lg={3} md={3} sm={12} xs={12}>
                  {
                  (Utils.isUserLoggedIn())?
                    <Grid container direction="row" justify="space-between">
                      <Grid item style={{width: '100%'}}>
                        <TextField 
                        fullWidth
                        select
                        value={this.state.orderBy}
                        variant="outlined"
                        label="Ordenar por:"
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
                      </Grid>
                    </Grid>
                    :
                    <Grid container direction="row" justify="flex-end">
                      <Grid item style={{width: '45%'}}>
                        <TextField 
                        fullWidth
                        select
                        value={this.state.orderBy}
                        variant="outlined"
                        label="Ordenar por:"
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
                      </Grid>
                    </Grid>
                  }
                </Grid>
              </Grid>
              <Grid container>
                <Grid item lg={2} md={3} className={(this.state.showMobileFilters) ? classes.filtersMobileContainer : classes.filtersContainer}>
                  <Hidden mdUp>
                    {
                      (!this.state.loadingFilters) ?
                        <Grid container style={{ zIndex: 1, position: 'fixed', left: 0, bottom: 0, padding: 16, backgroundColor: 'white', borderTop: '1px solid #D7D7D7' }}>
                          <Grid item sm={6} xs={6} style={{ paddingRight: 8 }}>
                            <Button variant="outlined" color="primary" style={{ textAlign: 'center', width: '100%' }} onClick={() => { this.clearFilters() }}>
                              LIMPIAR {(this.getSelectedFilters() > 0) ? <span>: <strong style={{ color: 'red' }}>{this.getSelectedFilters()}</strong></span> : ''}
                            </Button>
                          </Grid>
                          <Grid item sm={6} xs={6} style={{ paddingLeft: 8 }}>
                            <Button variant="outlined" color="primary" style={{ textAlign: 'center', width: '100%' }} onClick={() => { this.showMobileFilters() }}>
                              CERRAR
                        </Button>
                          </Grid>
                        </Grid>
                        :
                        ''
                    }
                  </Hidden>
                  {
                    (!this.state.loadingFilters) ?
                      <div>
                        {
                          (this.state.genders.length > 0) ?
                            <FilterList
                              data={this.state.genders}
                              handleFunction={self.handleChangeGender}
                              style={{ margin: 0, marginTop: 16, padding: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 120, overflowY: 'auto' }}
                              title="Género"
                            />
                            :
                            ''
                        }
                        {
                          (Utils.isEmpty(this.state.distance)) ?
                            <div>
                              <Button variant="outlined" color="primary" style={{ textAlign: 'center', width: '100%' }} onClick={this.handlePermission}>
                                {(this.state.loadingPosition) ? <div style={{ width: 24, paddingRight: 4 }}><Loading /></div> : <Icon style={{ paddingRight: 4 }}>room</Icon>} <span>Cercano</span>
                              </Button>
                              <hr style={{ opacity: 0.4, margin: '16px 0' }} />
                            </div>
                            :
                            ''
                        }
                        <div>
                          {
                            (this.state.offers > 0) ?
                              <div>
                                <Typography variant="body1"><strong>Con oferta</strong></Typography>
                                <ul style={{ margin: 0, padding: '16px', listStyle: 'none', overflow: 'none' }}>
                                  <li style={{ fontSize: 12, margin: 0, padding: 0 }}>
                                    <Checkbox
                                      style={{ fontSize: 12, margin: 0, padding: 0 }}
                                      checked={self.state.withOffer}
                                      onChange={() => { self.handleChangeOffer() }}
                                      value={self.state.withOffer}
                                      color="primary"
                                    />
                                    (<strong style={{ color: 'red' }}>{this.state.offers}</strong>)
                                  </li>
                                </ul>
                                <hr style={{ opacity: 0.4, margin: '16px 0', marginTop: 8 }} />
                              </div>
                              :
                              ''
                          }
                        </div>
                        {
                          (this.state.branches.length > 0) ?
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
                        }
                        {
                          (this.state.subcategories.length > 0) ?
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
                        }
                        {
                          (this.state.brands.length > 0) ?
                            <FilterList
                              data={this.state.brands}
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
                          (this.state.sizes.length > 0) ?
                            <FilterList
                              data={this.state.sizes}
                              handleFunction={self.handleChangeSizes}
                              size={true}
                              style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 200, 'overflow-y': 'auto' }}
                              title="Talla"
                            />
                            :
                            ''
                        }
                        {
                          (this.state.attributes.length > 0) ?
                            <FilterList
                              data={this.state.attributes}
                              handleFunction={self.handleChangeAttributes}
                              style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 200, 'overflow-y': 'auto' }}
                              title="Atributo"
                            />
                            :
                            ''
                        }
                        {
                          (this.state.prices.length > 0) ?
                            <FilterList
                              data={this.state.prices}
                              handleFunction={self.handleChangePrices}
                              price={true}
                              style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 120, 'overflow-y': 'auto' }}
                              title="Precio"
                            />
                            :
                            ''
                        }
                      </div>
                      :
                      (this.state.showMobileFilters) ?
                        <div style={{ textAlign: 'center', margin: '0 auto' }}>
                          <div style={{ width: 100, margin: '50% auto' }}>
                            <Loading />
                          </div>
                        </div>
                        :
                        <div style={{ width: 100, padding: 0, textAlign: 'center', margin: '0 auto' }}>
                          <Loading />
                        </div>
                  }
                </Grid>
                <Grid item lg={10} md={9} sm={12} xs={12} style={(this.state.showMobileFilters) ? { display: 'none' } : { display: 'block' }}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      {
                        (!this.state.loadingProducts) ?
                          <TablePagination
                            className={classes.paginator}
                            labelRowsPerPage=''
                            labelDisplayedRows={({ from, to, count }) => {
                              return <Hidden xsDown><div style={{ fontSize: 14 }}>{from} - {to} de {count}</div></Hidden>
                            }}
                            count={this.state.count}
                            rowsPerPage={this.state.rowsPerPage}
                            page={this.state.page}
                            rowsPerPageOptions={false}
                            SelectProps={{
                              native: false
                            }}
                            onChangePage={this.handleChangePage}
                          />
                          :
                          ''
                      }
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} className={classes.mySelection} style={{ marginTop: marginTopMySelection }}>
                      <Hidden mdUp>
                        <Button variant="outlined" color="primary" style={{ margin: '8px 0' }} onClick={() => {
                          this.showMobileFilters()
                        }}>
                          <Icon>filter_list</Icon> <span>Filtros</span>
                        </Button>
                      </Hidden>
                      <div>
                        Tu selección:
                    </div>
                      <Chip style={{ marginTop: 6, marginRight: 6 }} label='PRODUCTOS' color="primary" />
                      {
                        (!Utils.isEmpty(this.state.distance)) ?
                          <Chip style={{ marginTop: 6, marginRight: 6 }} label={this.state.distance} onDelete={() => { self.deletePosition() }} color="primary" />
                          :
                          ''
                      }
                      {
                        this.state.selectedGenders.map((gender, idx) => {
                          return (
                            <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={gender.description} onDelete={() => { self.handleChangeGender(idx, true) }} color="primary" />
                          )
                        })
                      }
                      {
                        (this.state.withOffer) ?
                          <Chip style={{ marginTop: 6, marginRight: 6 }} label="CON OFERTA" onDelete={() => { self.handleChangeOffer(true) }} color="primary" />
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
                        this.state.selectedBrands.map((brand, idx) => {
                          return (
                            <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={brand.description} onDelete={() => { self.handleChangeBrands(idx, true) }} color="primary" />
                          )
                        })
                      }
                      {
                        this.state.selectedAttributes.map((attribute, idx) => {
                          if (attribute.checked) {
                            return (
                              <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={attribute.description.toUpperCase()} onDelete={() => { self.handleChangeAttributes(idx, true) }} color="primary" />
                            )
                          }
                          else {
                            return (<div key={idx} ></div>)
                          }
                        })
                      }
                      {
                        this.state.selectedSizes.map((size, idx) => {
                          return (
                            <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={size.value} onDelete={() => { self.handleChangeSizes(idx, true) }} color="primary" />
                          )
                        })
                      }
                      {
                        this.state.selectedPrices.map((price, idx) => {
                          return (
                            <Chip key={idx} style={{ marginTop: 6, marginRight: 8 }} label={price.description} onDelete={() => { self.handleChangePrices(idx, true) }} color="primary" />
                          )
                        })
                      }
                    </Grid>
                    {
                      (!this.state.loadingProducts && this.state.products.length > 0) ?
                        this.state.products.map((product, index) => {
                          return (
                            <Grid key={index} item xl={3} lg={3} md={4} sm={4} xs={6}>
                              <ProductCard
                                currentCatalogStatus={self.state.currentCatalog}
                                catalog={self.state.catalog}
                                data={product}
                              />
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
                            callToAction={() => { this.clearFilters() }}
                          />
                        </Grid>
                    }
                  </Grid>
                  <div>
                    {
                      (!this.state.loadingProducts) ?
                        <TablePagination
                          className={classes.paginator}
                          labelRowsPerPage=''
                          labelDisplayedRows={({ from, to, count }) => {
                            return <div style={{ fontSize: 14 }}>{from} - {to} de {count}</div>
                          }}
                          colSpan={12}
                          count={this.state.count}
                          rowsPerPage={this.state.rowsPerPage}
                          page={this.state.page}
                          rowsPerPageOptions={false}
                          SelectProps={{
                            native: false
                          }}
                          onChangePage={this.handleChangePage}
                        />
                        :
                        ''
                    }
                  </div>
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
                callToAction={() => { this.clearFilters() }}
              />
            </div>
        }
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
              onClick={() => { this.props.history.push('/mi-cuenta/mis-catalogos') }}
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
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    startCreateCatalog: () => {
      dispatch(startCreateCatalog())
    },
    endCreateCatalog: () => {
      dispatch(endCreateCatalog())
    },
    getCurrentCatalogStatus: () => {
      dispatch(getCurrentCatalogStatus())
    },
    getCurrentCatalog: () => {
      dispatch(getCurrentCatalog())
    },
    removeFromCatalog: () => {
      dispatch(removeFromCatalog())
    }
  }
}

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(CategoryExplorer)
