'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'
import cookies from 'next-cookies'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { SwipeableDrawer, Grid, Typography, Paper, Checkbox, TablePagination, Hidden, Button, Icon, TextField, Snackbar, Chip, MenuItem } from '@material-ui/core'

import ListIcon from '@material-ui/icons/List'
import ViewComfyIcon from '@material-ui/icons/ViewComfy'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import TuneIcon from '@material-ui/icons/Tune'

// Utils
import Utils from '../../resources/Utils'

// Components
import Line from '../../components/Line'
import FilterListNew from '../../components/FilterListNew'
import ButtonBlockNew from '../../components/ButtonBlockNew'

// Blocks
import HomeView from '../Home/homeView'
import ProductCardNew from '../../components/ProductCardNew'
import ProductCardListNew from '../../components/ProductCardListNew'
import { categoryPageTracker } from '../../resources/classes/retailrocket'

const LIMIT = 24

const styles = theme => ({
  container: {
    width: 1380,
    margin: '0 auto',
    ['@media (max-width: 1450px)']: {
      width: 1170
    },
    ['@media (max-width: 1200px)']: {
      width: 1080
    },
    ['@media (max-width: 1100px)']: {
      width: 950
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: 0,
      width: '100%'
    }
  },
  containerButtonBlock: {
    paddingLeft: 28,
    marginBottom: 8,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      marginBottom: 0
    }
  },
  breadcrumbs: {
    margin: '0 auto',
    padding: '8px 0',
    [theme.breakpoints.down('sm')]: {
      padding: 0,
      paddingTop: 12,
      paddingLeft: 8,
      paddingRight: 8
    }
  },
  breadcrumb: {
    fontSize: 16,
    fontWeight: 500,
    color: '#006FB9'
  },
  card: {
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(1),
  },
  cardFont: {
    fontSize: '16px',
    marginBottom: '10px'
  },
  checkbox: {
    margin: 0,
    padding: 0
  },
  checkboxText: {
    fontSize: '14px',
    fontWeight: 'normal',
    marginBottom: '10px'
  },
  chip: {
    background: '#ffffff',
    border: 'solid 1px #dfe3e6',
    color: '#111110',
    fontSize: '14px',
    marginBottom: '5px',
    marginRight: 4
  },
  chipsResponsiveContainer: {
    paddingTop: '8px',
    paddingLeft: '8px',
    paddingRight: 8
  },
  containerCheckbox: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  containerCheckboxComponent: {
    marginTop: '16px'
  },
  containerContent: {
    marginTop: '24px',
  },
  containerFilterResponsive: {
    marginBottom: '20px',
    [theme.breakpoints.down("sm")]: {
      marginBottom: '8px'
    }
  },
  containerOrder: {
    marginLeft: '20px',
    [theme.breakpoints.down("md")]: {
      marginLeft: '0px',
    }
  },
  containerProductCards: {
    marginLeft: '20px',
    [theme.breakpoints.down("md")]: {
      margin: '0 auto'
    }
  },
  filterButton: {
    background: 'none',
    border: 'none',
    color: '#006fb9',
    cursor: 'pointer',
    display: 'block',
    fontSize: '14px',
    margin: '0',
    padding: '0',
    marginLeft: 'auto',
    [theme.breakpoints.down("sm")]: {
      marginTop: 8,
      marginRight: 8
    }
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'baseLine',
    position: 'relative'
  },
  filtersContainerResponsive: {

  },
  filtersItemsResponsive: {
    alignItems: 'center',
    background: 'white',
    display: 'flex',
    justifyContent: 'center'

  },
  filterTitle: {
    color: '#111110',
    fontSize: '22px'
  },
  orderMenu: {

  },
  viewContainer: {
    alignItems: 'center',
    display: 'flex',
    height: '30px',
  },
  paginator: {
    marginTop: 8,
    float: 'right'
  }
})

class categoryExplorerViewNew extends Component {
  constructor(props) {
    super(props)

    this.state = {
      banners: [],
      user: null,
      scrollPosition: 0,
      uuidCAPIFacebook: null,
      openSnack: false,
      messageSnack: '',

      rowsPerPage: this.props.limit,
      page: this.props.page,

      withProducts: false,

      offers: 0,
      offer: this.props.offers,

      bluePoints: 0,
      bluePoint: this.props.points,

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
        { value: 'priceLowToHight', description: 'Menor precio' },
        { value: 'priceHightToLow', description: 'Mayor precio' },
        { value: 'brandNameASC', description: 'Marca A - Z' },
        { value: 'brandNameDESC', description: 'Marca Z - A' },
        { value: 'bestOffer', description: 'Mejor oferta' }
      ],

      brandSearch: '',
      branchSearch: '',
      zoneSearch: '',

      loadingPosition: false,
      position: null,
      distance: '',

      showMobileFilters: false,

      countCatalog: 0,
      catalog: [],
      currentCatalogStatus: false,
      catalogModalOpen: false,
      viewCards: cookies(props).viewCards || 1,
      view: cookies(props).view || 'Mosaico',
      viewsResponsive: [
        { id: 1, name: 'Mosaico' },
        { id: 2, name: 'Lista' },
        { id: 3, name: 'Imágenes' },
      ],

      ordersModal: false,
      zones: [],
      selectedZones: [],

      seeDetail: true,
      right: false,
      desktop: false
    }

    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.handleChangeBranches = this.handleChangeBranches.bind(this)
    this.handleChangeSubcategories = this.handleChangeSubcategories.bind(this)
    this.handleChangeBrands = this.handleChangeBrands.bind(this)
    this.handleChangeZones = this.handleChangeZones.bind(this)
    this.handleChangeSizes = this.handleChangeSizes.bind(this)
    this.handleChangeAttributes = this.handleChangeAttributes.bind(this)
    this.handleChangePrices = this.handleChangePrices.bind(this)
    this.handleChangeOffer = this.handleChangeOffer.bind(this)
    this.handleChangeBluePoint = this.handleChangeBluePoint.bind(this)
    this.handleChangeOrder = this.handleChangeOrder.bind(this)
    this.handleChangeGender = this.handleChangeGender.bind(this)
    this.generateQuery = this.generateQuery.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
    this.deletePosition = this.deletePosition.bind(this)
    this.showMobileFilters = this.showMobileFilters.bind(this)
    this.checkStatus = this.checkStatus.bind(this)
    this.onChangeInputSearch = this.onChangeInputSearch.bind(this)
    this.handleChangeGrid = this.handleChangeGrid.bind(this)
    this.handleOrderResponsive = this.handleOrderResponsive.bind(this)
  }

  checkStatus(product) {
    if (Utils.activeCatalog()) {
      return Utils.isProductIntoCatalog(product)
    } else {
      return false
    }
  }

  listenToScroll = () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop
    this.setState({
      scrollPosition: winScroll,
    })
  }

  async componentDidMount() {

    //RETAIL ROCKET
    if (this.props.breadcrumbs!= undefined && this.props.breadcrumbs!= null) {
      
    
    categoryPageTracker(this.props.breadcrumbs, "this.props.breadcrumbs")
  }

    if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
      let responseUser = await Utils.getCurrentUser()
      if (responseUser !== null) {
        this.setState({
          user: responseUser
        })
      }
      let dateSending = new Date();
      let gtagslist = this.props.products.map((i, index) => (
        {
          "id": i.code,
          "name": i.name,
          "list_name": "CategoryExplorer",
          "brand": i.brand.name,
          "category": i.categoryCode,
          "list_position": index,
          "price": i.price
        }
      ))



      gtag('event', 'view_item_list', {
        "items": gtagslist
      })

      fbq('event', 'PageView', {}, { eventID: 'PageView' })

      if (this.state.user !== null && this.state.user !== undefined) {

        let eventToFacebook = {
          "data": [
            {
              "event_name": 'PageView',
              'event_time': Utils.timeIntoSeconds(dateSending),
              'user_data': {
                'fn': await Utils.hashingData(this.state.user.name),
                'ln': await Utils.hashingData(this.state.user.secondLastName)
              },
              'event_id': 'PageView',
              'action_source': 'website'
            }
          ]
        }

        await Utils.sendConversionApiFacebook(eventToFacebook, this.state.uuidCAPIFacebook)

      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.listenToScroll)
    window.removeEventListener("resize", this.resize.bind(this))
  }

  createCatalog() {
    if (Utils.isUserLoggedIn()) {
      //localStorage.setItem(Utils.constants.localStorage.CATALOG_INIT, 1)
      this.props.dispatch({ type: 'START_CREATE_CATALOG' })
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
      //localStorage.setItem(Utils.constants.localStorage.CATALOG_INIT, 0)
      this.props.dispatch({ type: 'CLEAN_CURRENT_CATALOG' })

      this.setState({
        openSnack: true,
        currentCatalogStatus: false,
        catalog: [],
        messageSnack: 'Haz cancelado la creación del catálogo correctamente.',
        countCatalog: 0
      })
    }
  }

  showMobileFilters() {
    let show = !this.state.showMobileFilters
    this.setState({
      showMobileFilters: show,
      desktop: false
    })
  }

  onChangeInputSearch(inputName, listName, event) {
    const self = this
    const query = event.target.value.toLowerCase()
    this.setState({ [inputName]: query }, () => self.filterList(inputName, listName))
  }

  handleChangeGrid(viewCards) {
    this.setState({
      ordersModal: false
    })
    if (!viewCards) {
      let currentView = parseInt(this.state.viewCards) || this.state.viewCards
      currentView++
      if (currentView > this.state.viewsResponsive.length) {
        this.setState({
          viewCards: this.state.viewsResponsive[0].id,
          view: this.state.viewsResponsive[0].name,
        })
      } else {
        this.setState({
          viewCards: this.state.viewsResponsive[currentView - 1].id,
          view: this.state.viewsResponsive[currentView - 1].name,
        })
      }


      return
    }
    var view = ''
    switch (viewCards) {
      case 1:
        view = 'Mosaico'
        break
      case 2:
        view = 'Lista'
        break
      case 3:
        view = 'Imágenes'
        break
      default:
        break
    }

    this.setState({
      viewCards: viewCards,
      view: view
    })
    document.cookie = `viewCards=${viewCards}; path=/`
    document.cookie = `view=${view}; path=/`


  }

  filterList(inputName, listName) {
    let list = this.state[listName]
    let filtered = this.state[listName]
    if (listName === 'zones') {
      list = this.props.filters.zones
      filtered = this.props.filters.zones
    }
    let inputSearch = this.state[inputName]

    filtered = filtered.filter((item) => {
      return item.name.toLowerCase().indexOf(inputSearch) !== -1
    })

    if (filtered.length !== list.length) {
      let hidden = true

      list.forEach((item, idx) => {
        hidden = true
        filtered.forEach((filter) => {
          if (item.code === filter.code) {
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

  resize() {
    if (window.innerWidth > 1280) {
      this.setState({ showMobileFilters: true, desktop: true })
    } else {
      this.setState({ showMobileFilters: false, desktop: false })
    }
  }

  async componentWillMount() {

    let uuidActual = this.props.app.data.uuid
    if (uuidActual !== null) {
      this.setState({
        uuidCAPIFacebook: uuidActual
      })
    }
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
    if (window.innerWidth > 1280) {
      this.setState({ showMobileFilters: true, desktop: true })
    } else {
      this.setState({ showMobileFilters: false, desktop: false })
    }
    window.addEventListener("resize", this.resize.bind(this))

    if (this.props.filters !== null) {
      this.setState({
        brands: this.props.filters.brands,
      })
    }
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

  handleChangeBluePoint(remove = false) {
    let bluePoint = !this.state.bluePoint
    if (remove) {
      bluePoint = false
    }
    this.setState({
      page: 0,
      bluePoint: bluePoint
    }, () => this.generateQuery())
  }


  handleChangeBranches(idx, remove = false) {
    let branches = this.props.filters.branches
    let selectedBranches = this.state.selectedBranches
    if (remove) {
      branches[idx].checked = false
    }
    else {
      branches[idx].checked = !branches[idx].checked
      if (branches[idx].checked) {
        selectedBranches.push(branches[idx])
        if (selectedBranches.length > 1) {
          selectedBranches = Utils.uniqBy(selectedBranches, 'code')
        }
      }
      else {
        if (selectedBranches.length > 0) {
          selectedBranches.forEach((selected, jdx) => {
            if (selected.code === branches[idx].code) {
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
  handleChangeZones(idx, remove = false) {
    let zones = this.props.filters.zones
    // this.props.filters.zones.forEach(zone => {
    //   zone.checked = false
    // })
    this.props.filters.branches.forEach(branch => {
      branch.checked = false
    })


    let selectedZones = this.state.selectedZones
    if (remove) {
      zones[idx].checked = false
    }
    else {
      zones[idx].checked = !zones[idx].checked
      if (zones[idx].checked) {
        selectedZones.push(zones[idx])
        if (selectedZones.length > 1) {
          selectedZones = Utils.uniqBy(selectedZones, 'code')
        }
      }
      else {
        if (selectedZones.length > 0) {
          selectedZones.forEach((selected, jdx) => {
            if (selected.code === zones[idx].code) {
              selectedZones.splice(jdx, 1)
            }
          })
        }
      }
    }

    this.setState({
      zoneSearch: '',
      page: 0,
      zones: zones,
      selectedZones: selectedZones
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

  deletePosition() {
    this.setState({
      loadingPosition: false,
      position: null,
      distance: ''
    }, () => this.generateQuery())
  }

  async generateQuery() {
    let offer = this.state.offer
    let bluePoint = this.state.bluePoint
    let orderBy = this.state.orderBy
    let page = this.state.page
    let selectedBranches = []
    let selectedSubcategories = []
    let selectedBrands = []
    let selectedAttributes = []
    let selectedSizes = []
    let selectedPrices = []
    let selectedGenders = []
    let selectedZones = []

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
        selectedGenders.push(item.id.toString())
      }
    })

    this.props.filters.zones.forEach((item) => {
      if (item.checked) {
        selectedZones.push(item.code.toString())
      }
    })
    this.props.filters.branches.forEach((item) => {
      if (item.checked) {
        selectedBranches.push(item.code.toString())
      }
    })


    if (page === 0 && Utils.isEmpty(orderBy) && !offer && !bluePoint && selectedBranches.length === 0 && selectedSubcategories.length === 0 && selectedBrands.length === 0 && selectedPrices.length === 0 && selectedAttributes.length === 0 && selectedSizes.length === 0 && selectedGenders.length === 0 && selectedZones.length === 0) {
      this.toCategory()
    } else {
      let query = {
        pg: page,
        l: LIMIT,
        u: ((this.props.breadcrumbs !== null) ? this.props.breadcrumbs[this.props.breadcrumbs.length - 1] : this.props.breadcrumbs),
        c: this.props.category,
        br: selectedBranches,
        sc: selectedSubcategories,
        b: selectedBrands,
        a: selectedAttributes,
        s: selectedSizes,
        p: selectedPrices,
        g: selectedGenders,
        o: offer,
        bp: bluePoint,
        ob: orderBy,
        z: selectedZones
      }

      let filter = Utils.encode(JSON.stringify(query))
      this.toCategory(filter)
    }
  }

  toCategory(withCsa = '') {
    let url = ''
    if (this.props.isBrand !== undefined && this.props.isBrand) {
      url = '/marcas/' + this.props.filters.brands[0].description
    } else {
      if (this.props.breadcrumbs.length === 0) {
        url = 'todos'
      } else {
        url = this.props.breadcrumbs[this.props.breadcrumbs.length - 1].url
      }
    }

    url = url.toLowerCase()
    if (!Utils.isEmpty(withCsa)) {
      url += '?csa=' + withCsa
    }

    window.location.href = url
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }
  handleOrderResponsive(value) {
    this.setState({
      right: true,
      page: 0,
      orderBy: value
    }, () => this.generateQuery())
  }

  toggleDrawer = (open) => () => {
    this.setState({
      right: open
    })
  }

  render() {
    let self = this
    const { classes } = this.props
    console.log(this.props.breadcrumbs[this.props.breadcrumbs.length - 1].url,"this props");
    return (
      <>
      {this.props.breadcrumb!== undefined && this.props.breadcrumb.length > 0 ? (
        <div data-retailrocket-markup-block="613ba53e97a5251e74fdb4f0" data-category-name={this.props.breadcrumbs[this.props.breadcrumbs.length - 1].url} ></div>
      ) : null }
      
        {
          (this.props.blocks !== undefined && this.props.blocks.length > 0) ?
            <HomeView
              isLanding={true}
              fromCategory={(this.props.products.length > 0 && this.props.showProducts)}
              blocks={this.props.blocks}
              title={(this.props.title !== null && this.props.title !== undefined && !Utils.isEmpty(this.props.title)) ? this.props.title : null}
            
            />
            :
            ''
        }
        {
          (this.props.showProducts && this.props.products.length > 0) ?
            
        <div className={classes.container}>
          {
            (this.props.isBrand === undefined && this.props.breadcrumbs.length > 0) ?
              <Grid container className={`${classes.container} ${classes.breadcrumbs}`}>
                {
                  this.props.breadcrumbs.map((breadcrumb, idx) => {
                    if (idx === this.props.breadcrumbs.length - 1) {
                      return (
                        <label key={idx}>
                          <Typography variant="body1" className={classes.breadcrumb}>{breadcrumb.description}</Typography>
                        </label>
                      )
                    } else {
                      return (
                        <label key={idx}>
                          <a href={breadcrumb.url} className={classes.breadcrumb} style={{ display: 'inline-block', float: 'left' }}>
                            <Typography variant="body1" className={classes.breadcrumb}>{breadcrumb.description}</Typography>
                          </a>
                          <Icon style={{ display: 'inline-block', float: 'left' }}>keyboard_arrow_right</Icon>
                        </label>
                      )
                    }
                  })
                }
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1"><strong>{Utils.numberWithCommas(this.props.filters.count)}</strong> {(this.props.filters.count === 1) ? 'resultado.' : 'resultados.'}</Typography>
                </Grid>
              </Grid>
              :
              <Grid container className={`${classes.container} ${classes.breadcrumbs}`}>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                  <Typography variant="body1"><strong>{Utils.numberWithCommas(this.props.filters.count)}</strong> {(this.props.filters.count === 1) ? 'resultado.' : 'resultados.'}</Typography>
                </Grid>
              </Grid>
          }
          <div style={(this.state.showMobileFilters) ? { display: 'block' } : { display: 'none' }} >
            <Hidden mdUp  >
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

            <Hidden lgUp>
              <SwipeableDrawer
                anchor="bottom"
                open={this.state.right}
                onClose={this.toggleDrawer(false)}
                onOpen={this.toggleDrawer(true)}
              >
                {
                  this.state.orders.map((order, index) => {
                    if (order.value === 'bestOffer') {
                      if (self.props.filters.offers > 0) {
                        return (
                          <div
                            key={index}
                            tabIndex={0}
                            role="button"
                            onClick={() => { this.handleOrderResponsive(order.value) }}
                            onKeyDown={this.toggleDrawer(false)}>
                            <MenuItem style={{ fontSize: '14px', fontWeight: 'normal', color: '#68686a' }} value={order.value}>{order.description}</MenuItem>
                            <Line />

                          </div>
                        )
                      }
                    } else {
                      return (
                        <div
                          key={index}
                          tabIndex={0}
                          role="button"
                          onClick={() => { this.handleOrderResponsive(order.value) }}
                          onKeyDown={this.toggleDrawer(false)}>
                          <MenuItem style={{ fontSize: '14px', fontWeight: 'normal', color: '#68686a' }} key={index} value={order.value}>{order.description}</MenuItem>
                          <Line />
                        </div>
                      )
                    }
                  })
                }
              </SwipeableDrawer>
            </Hidden>
          </div>
          {/* Filtros y contenido START */}
          <Grid container>
            {/* Filtros START */}
            <Grid style={(this.state.showMobileFilters || this.state.desktop) ? { display: 'block' } : { display: 'none' }} item lg={2} xs={12} >
              <Grid container className={classes.filterContainer}>
                <Grid item xs={6}>
                  <Typography className={classes.filterTitle} >Filtros</Typography>
                </Grid>
                {
                  (window.location.href.includes('csa')) ?
                    <Grid item xs={6} >
                      <button className={classes.filterButton} onClick={() => { this.toCategory() }}>
                        Borrar filtros
                      </button>
                    </Grid>
                    :
                    ''
                }
              </Grid>

              {/* Chips START */}
              <Grid container style={{ paddingTop: 8, paddingBottom: 8 }}>
                {
                  (this.props.isBrand !== undefined && this.props.isBrand) ?
                    this.props.filters.brands.map((brand, idx) => {
                      if (brand.checked) {
                        return (
                          <Chip key={idx} className={classes.chip} label={brand.description} />
                        )
                      }
                    })
                    :
                    ''
                }
                {
                  (!Utils.isEmpty(this.state.distance)) ?
                    <Chip className={classes.chip} label={this.state.distance} onDelete={() => { self.deletePosition() }} />
                    :
                    ''
                }
                {
                  this.props.filters.genders.map((gender, idx) => {
                    if (gender.checked) {
                      return (
                        <Chip key={idx} className={classes.chip} label={gender.description.charAt(0).toUpperCase() + gender.description.slice(1)} onDelete={() => { self.handleChangeGender(idx, true) }} />
                      )
                    }
                  })
                }
                {
                  (this.state.offer) ?
                    <Chip className={classes.chip} label="Ofertas" onDelete={() => { self.handleChangeOffer(true) }} />
                    :
                    ''
                }
                {
                  (this.state.bluePoint) ?
                    <Chip className={classes.chip} label="Monedero Azul ®" onDelete={() => { self.handleChangeBluePoint(true) }} />
                    :
                    ''
                }
                {
                  this.state.selectedBranches.map((branch, idx) => {
                    return (
                      <Chip key={idx} className={classes.chip} label={branch.description} onDelete={() => { self.handleChangeBranches(idx, true) }} />
                    )
                  })
                }
                {
                  this.state.selectedSubcategories.map((subcategory, idx) => {
                    return (
                      <Chip key={idx} className={classes.chip} label={subcategory.description.charAt(0).toUpperCase() + subcategory.description.slice(1)} onDelete={() => { self.handleChangeSubcategories(idx, true) }} />
                    )
                  })
                }
                {
                  (this.props.isBrand === undefined || !this.props.isBrand) ?
                    this.props.filters.brands.map((brand, idx) => {
                      if (brand.checked) {
                        return (
                          <Chip key={idx} className={classes.chip} label={brand.description.charAt(0).toUpperCase() + brand.description.slice(1)} onDelete={() => { self.handleChangeBrands(idx, true) }} />
                        )
                      }
                    })
                    :
                    ''
                }
                {
                  this.props.filters.attributes.map((attribute, idx) => {
                    if (attribute.checked) {
                      return (
                        <Chip key={idx} className={classes.chip} label={attribute.description.charAt(0).toUpperCase() + attribute.description.slice(1)} onDelete={() => { self.handleChangeAttributes(idx, true) }} />
                      )
                    }
                  })
                }
                {
                  this.props.filters.sizes.map((size, idx) => {
                    if (size.checked) {
                      return (
                        <Chip key={idx} className={classes.chip} label={size.value} onDelete={() => { self.handleChangeSizes(idx, true) }} />
                      )
                    }
                  })
                }
                {
                  this.props.filters.zones.map((zone, idx) => {
                    if (zone.checked) {
                      return (
                        <Chip key={idx} className={classes.chip} label={zone.name.charAt(0).toUpperCase() + zone.name.slice(1)} onDelete={() => { self.handleChangeZones(idx, true) }} />
                      )
                    }
                  })
                }
                {
                  this.props.filters.branches.map((branch, idx) => {
                    if (branch.checked) {
                      return (
                        <Chip key={idx} className={classes.chip} label={branch.name.charAt(0).toUpperCase() + branch.name.slice(1)} onDelete={() => { self.handleChangeBranches(idx, true) }} />
                      )
                    }
                  })
                }
                {
                  this.props.filters.prices.map((price, idx) => {
                    if (price.checked) {
                      return (
                        <Chip key={idx} className={classes.chip} label={price.description} onDelete={() => { self.handleChangePrices(idx, true) }} />
                      )
                    }
                  })
                }
              </Grid>

              {/* Selection filters START */}
              {
                ((this.props.filters !== undefined && this.props.filters.offers !== undefined && this.props.filters.offers !== null && this.props.filters.offers !== 0) || (this.props.filters.bluePoints !== null && this.props.filters.bluePoints !== undefined && this.props.filters.bluePoints !== 0)) ?
                  <Grid container>
                    <Grid item xs={12}>
                      <Paper elevation={0} className={classes.card}>
                        <Grid container>
                          {
                            (this.props.filters.offers > 0) ?
                              <Grid item={12} container>
                                <Grid item xs={8} className={classes.containerCheckboxComponent} >
                                  <Typography className={classes.cardFont} >Oferta</Typography>
                                </Grid>
                                <Grid item xs={4} className={classes.containerCheckbox} >
                                  <ul style={{ margin: 0, padding: '16px', listStyle: 'none', overflow: 'none' }}>
                                    <li style={{ fontSize: 12, margin: 0, padding: 0 }}>
                                      <Checkbox
                                        style={{ fontSize: 12, margin: 0, padding: 0 }}
                                        checked={this.state.offer}
                                        onChange={() => { self.handleChangeOffer() }}
                                        value={this.state.offer}
                                        color="primary"
                                      />
                                    </li>
                                  </ul>
                                </Grid>
                                <Grid item xs={12}>
                                  {
                                    (this.props.filters.bluePoints > 0) ?
                                      <Line />
                                      :
                                      ''
                                  }
                                </Grid>
                              </Grid>
                              :
                              ''
                          }
                          {
                            (this.props.filters.bluePoints > 0) ?
                              <Grid item={12} container>
                                <Grid item xs={8} className={classes.containerCheckboxComponent} >
                                  <Typography className={classes.cardFont} >Puntos azules</Typography>
                                </Grid>
                                <Grid item xs={4} className={classes.containerCheckbox} >
                                  <ul style={{ margin: 0, padding: '16px', listStyle: 'none', overflow: 'none' }}>
                                    <li style={{ fontSize: 12, margin: 0, padding: 0 }}>
                                      <Checkbox
                                        style={{ fontSize: 12, margin: 0, padding: 0 }}
                                        checked={this.state.bluePoint}
                                        onChange={() => { self.handleChangeBluePoint() }}
                                        value={this.state.bluePoint}
                                        color="primary"
                                      />
                                    </li>
                                  </ul>
                                </Grid>
                                <Grid item xs={12}>
                                  {/* <Line /> */}
                                </Grid>
                              </Grid>
                              :
                              ''
                          }
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                  :
                  ''
              }
              {/* Selections filters END */}

              {/* OtherFilters Start */}
              <Grid container>
                <Grid item xs={12}>
                  <Paper elevation={0} className={classes.card} style={{ marginTop: 16 }} >
                    {
                      ((this.props.isBrand === undefined || !this.props.isBrand) && this.props.filters.brands.length > 0) ?
                        <FilterListNew
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
                      (this.props.filters.genders.length > 0) ?
                        <FilterListNew
                          data={this.props.filters.genders}
                          handleFunction={self.handleChangeGender}
                          style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 200, 'overflow-y': 'auto' }}
                          title="Géneros"
                        />
                        :
                        ''
                    }
                    {
                      (this.props.filters.sizes.length > 0) ?
                        <FilterListNew
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
                        <FilterListNew
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
                        <FilterListNew
                          data={this.props.filters.prices}
                          handleFunction={self.handleChangePrices}
                          price={true}
                          style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 120, 'overflow-y': 'auto' }}
                          title="Precio"
                        />
                        :
                        ''
                    }
                    {
                      (this.props.filters.zones.length > 0) ?
                        <FilterListNew
                          data={this.props.filters.zones}
                          filterInput={{ placeholder: "Buscar ciudad...", search: this.state.zoneSearch, inputSearch: classes.inputSearch }}
                          handleInputFunction={{ function: this.onChangeInputSearch, params: ['zoneSearch', 'zones'] }}
                          handleFunction={self.handleChangeZones}
                          style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 200, 'overflow-y': 'auto' }}
                          zones={true}
                          title="Ciudades"
                        />
                        :
                        ''
                    }
                    {
                      (this.props.filters.branches.length > 0) ?
                        <FilterListNew
                          data={this.props.filters.branches}
                          handleInputFunction={{ function: this.onChangeInputSearch, params: ['branchSearch', 'branches'] }}
                          handleFunction={self.handleChangeBranches}
                          style={{ margin: 0, marginTop: 16, paddingLeft: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 200, 'overflow-y': 'auto' }}
                          zones={true}
                          title="Sucursales"
                        />
                        :
                        ''
                    }

                  </Paper>
                </Grid>
              </Grid>
              {/* OtherFilters End */}
            </Grid>

            {/* Filtros END */}

            {/* Contenido START */}
            <Grid style={(this.state.showMobileFilters) ? { display: 'block' } : { display: 'block' }} item lg={10} xs={12} >
              {/* Categorias START */}
              <Grid container>
                {
                  (this.props.isBrand === undefined || !this.props.isBrand) ?
                    <Grid item xs={12}>
                      <div className={classes.containerButtonBlock}>
                        <ButtonBlockNew category={this.props.category} />
                      </div>
                    </Grid>
                    :
                    ''
                }
              </Grid>
              {/* Categorias END */}

              <Hidden mdDown>
                {/* Ordenar START */}
                <Grid container spacing={1} className={classes.containerOrder} >
                  <Grid item lg={3} sm={5} xs={5}>

                    <Grid container className={classes.card} style={{ background: 'white' }}   >
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          select
                          value={(Utils.isEmpty(this.state.orderBy)) ? 'ordenar' : this.state.orderBy}
                          defaultValue="Small"
                          size="small"
                          //label={Utils.isEmpty(this.state.orderBy) ? "Ordenar por..." : ''}
                          InputProps={{
                            className: classes.input,
                          }}
                          InputLabelProps={{
                            style: {
                              height: 50,
                            },
                          }}
                          onChange={(event) => { self.handleChangeOrder(event) }}>
                          <MenuItem value="ordenar">Ordenar por...</MenuItem>
                          {
                            this.state.orders.map((order, index) => {
                              if (order.value === 'bestOffer') {
                                if (self.props.filters.offers > 0) {
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
                  </Grid>
                  {/* Views change START */}
                  <Grid item lg={3} md={3} xs={6}>
                    <Paper elevation={0} className={classes.card}>
                      <div className={classes.viewContainer} >
                        <Grid container>
                          {
                            (this.state.viewCards === 2 || this.state.viewCards === '2') ?
                              <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}  >
                                <ViewComfyIcon onClick={() => { this.handleChangeGrid(1) }} style={{ cursor: 'pointer', marginLeft: 5 }} color={'black'} ></ViewComfyIcon >
                              </Grid>
                              :
                              <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
                                <ListIcon onClick={() => { this.handleChangeGrid(2) }} style={{ cursor: 'pointer', marginLeft: 5 }} color={'black'} ></ListIcon >
                              </Grid>
                          }
                          {/* Desktop */}
                          <Hidden smDown>
                            <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}  >
                              <span style={{ marginLeft: '2px' }} > Vista: </span>
                            </Grid>
                          </Hidden>

                          <Grid item lg={4} xs={4} style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }} >
                            <Typography variant='body2' >{this.state.view}</Typography>
                          </Grid>

                        </Grid>

                      </div>
                    </Paper>

                  </Grid>

                  <Grid item xs={6}>
                    <TablePagination
                      className={classes.paginator}
                      labelRowsPerPage=''
                      style={{ border: 'none' }}
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
                {/* Vistas change END */}

              </Hidden>


              {/* Chips Responsive START */}
              <Hidden lgUp>
                <Grid container className={classes.chipsResponsiveContainer} >
                  <Grid item xs={12} className={classes.containerFilterResponsive} >
                    <Grid container spacing={0}  >

                      {/* Ordenar */}
                      <Grid item xs={4}>
                        <Paper elevation={0} className={classes.card}>
                          <Grid container>
                            <Grid item xs={4}>
                              <ExpandMoreIcon onClick={() => { this.setState({ right: true }) }} />
                            </Grid>
                            <Grid item xs={4}  >
                              <Typography variant='body2'>Ordenar</Typography>
                            </Grid>
                          </Grid>

                        </Paper>
                      </Grid>

                      {/* Filtros */}
                      <Grid item xs={4} >
                        <Paper elevation={0} style={{ marginLeft: '5px', marginRight: '5px' }} className={classes.card}>
                          <Grid container>
                            <Grid item xs={4}>
                              <TuneIcon onClick={() => { this.showMobileFilters() }} />
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant='body2'>Filtrar</Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>

                      {/* Vistas */}
                      <Grid item xs={4}>
                        <Paper elevation={0} className={classes.card}>
                          <Grid container>
                            <Grid item xs={4}>
                              {
                                (this.state.viewCards === 1 || this.state.viewCards === '1') ?
                                  <ViewComfyIcon onClick={() => { this.handleChangeGrid(2) }} style={{ cursor: 'pointer', marginLeft: 5 }} color={'black'} ></ViewComfyIcon >
                                  :
                                  <ListIcon onClick={() => { this.handleChangeGrid(1) }} style={{ cursor: 'pointer', marginLeft: 5 }} color={'black'} ></ListIcon >
                              }
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant='body2' >{this.state.view}</Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={9}>
                    {
                      (this.props.isBrand !== undefined && this.props.isBrand) ?
                        this.props.filters.brands.map((brand, idx) => {
                          if (brand.checked) {
                            return (
                              <Chip key={idx} className={classes.chip} label={brand.description} />
                            )
                          }
                        })
                        :
                        ''
                    }
                    {
                      (!Utils.isEmpty(this.state.distance)) ?
                        <Chip className={classes.chip} label={this.state.distance} onDelete={() => { self.deletePosition() }} />
                        :
                        ''
                    }
                    {
                      this.props.filters.genders.map((gender, idx) => {
                        if (gender.checked) {
                          return (
                            <Chip key={idx} className={classes.chip} label={gender.description.charAt(0).toUpperCase() + gender.description.slice(1)} onDelete={() => { self.handleChangeGender(idx, true) }} />
                          )
                        }
                      })
                    }
                    {
                      (this.state.offer) ?
                        <Chip className={classes.chip} label="Ofertas" onDelete={() => { self.handleChangeOffer(true) }} />
                        :
                        ''
                    }
                    {
                      (this.state.bluePoint) ?
                        <Chip className={classes.chip} label="Monedero Azul ®" onDelete={() => { self.handleChangeBluePoint(true) }} />
                        :
                        ''
                    }
                    {
                      this.state.selectedBranches.map((branch, idx) => {
                        return (
                          <Chip key={idx} className={classes.chip} label={branch.description} onDelete={() => { self.handleChangeBranches(idx, true) }} />
                        )
                      })
                    }
                    {
                      this.state.selectedSubcategories.map((subcategory, idx) => {
                        return (
                          <Chip key={idx} className={classes.chip} label={subcategory.description.charAt(0).toUpperCase() + subcategory.description.slice(1)} onDelete={() => { self.handleChangeSubcategories(idx, true) }} />
                        )
                      })
                    }
                    {
                      (this.props.isBrand === undefined || !this.props.isBrand) ?
                        this.props.filters.brands.map((brand, idx) => {
                          if (brand.checked) {
                            return (
                              <Chip key={idx} className={classes.chip} label={brand.description.charAt(0).toUpperCase() + brand.description.slice(1)} onDelete={() => { self.handleChangeBrands(idx, true) }} />
                            )
                          }
                        })
                        :
                        ''
                    }
                    {
                      this.props.filters.attributes.map((attribute, idx) => {
                        if (attribute.checked) {
                          return (
                            <Chip key={idx} className={classes.chip} label={attribute.description.charAt(0).toUpperCase() + attribute.description.slice(1)} onDelete={() => { self.handleChangeAttributes(idx, true) }} />
                          )
                        }
                      })
                    }
                    {
                      this.props.filters.sizes.map((size, idx) => {
                        if (size.checked) {
                          return (
                            <Chip key={idx} className={classes.chip} label={size.value} onDelete={() => { self.handleChangeSizes(idx, true) }} />
                          )
                        }
                      })
                    }
                    {
                      this.props.filters.zones.map((zone, idx) => {
                        if (zone.checked) {
                          return (
                            <Chip key={idx} className={classes.chip} label={zone.name.charAt(0).toUpperCase() + zone.name.slice(1)} onDelete={() => { self.handleChangeZones(idx, true) }} />
                          )
                        }
                      })
                    }
                    {
                      this.props.filters.branches.map((branch, idx) => {
                        if (branch.checked) {
                          return (
                            <Chip key={idx} className={classes.chip} label={branch.name.charAt(0).toUpperCase() + branch.name.slice(1)} onDelete={() => { self.handleChangeBranches(idx, true) }} />
                          )
                        }
                      })
                    }
                    {
                      this.props.filters.prices.map((price, idx) => {
                        if (price.checked) {
                          return (
                            <Chip key={idx} className={classes.chip} label={price.description} onDelete={() => { self.handleChangePrices(idx, true) }} />
                          )
                        }
                      })
                    }
                  </Grid>
                  {
                    (window.location.href.includes('csa')) ?
                      <Grid item xs={3}>
                        <button className={classes.filterButton} onClick={() => { this.toCategory() }}>
                          Borrar filtros
                        </button>
                      </Grid>
                      :
                      ''
                  }
                </Grid>
              </Hidden>
              {/* Chips Responsive END */}

              {/* Product cards START */}
              <Grid container spacing={0} className={classes.containerProductCards} >
                {
                  (this.props.products.length > 0) ?
                    (this.state.viewCards === 1 || this.state.viewCards === '1') ?
                      this.props.products.map((product, index) => {
                        return (
                          <Grid key={index} item xl={3} lg={3} md={3} sm={3} xs={6} style={{ marginTop: 4 }}>
                            <div style={{ margin: 2, marginBottom: 0, backgroundColor: 'white' }}>
                              <ProductCardNew
                                currentCatalogStatus={this.state.currentCatalogStatus}
                                currentCatalog={this.checkStatus(product)}
                                data={product}
                                updateCount={
                                  () => {
                                    this.setState({
                                      countCatalog: this.props.catalogs.products.length
                                    })
                                  }
                                }
                              />
                            </div>
                          </Grid>
                        )
                      })
                      :
                      (this.state.viewCards === 2 || this.state.viewCards === '2') ?
                        this.props.products.map((product, index) => {
                          return (
                            <Grid key={index} item xs={12} style={{ marginTop: 4, background: 'white' }}>
                              <div style={{ margin: 2, marginBottom: 0, backgroundColor: 'white' }}>
                                <ProductCardListNew
                                  currentCatalogStatus={this.state.currentCatalogStatus}
                                  currentCatalog={this.checkStatus(product)}
                                  data={product}
                                  updateCount={
                                    () => {
                                      this.setState({
                                        countCatalog: this.props.catalogs.products.length
                                      })
                                    }
                                  }
                                />
                              </div>
                            </Grid>
                          )
                        })
                        :
                        ''
                    :
                    ''
                }
              </Grid>
              {/* Product cards END */}


              {/* Tablepagination START */}
              <Grid container>
                <Grid item xs={12}>
                  <TablePagination
                    className={classes.paginator}
                    style={{
                      float: 'left',
                      marginTop: 0
                    }}
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
              {/* Tablepagination END */}
            </Grid>
            {/* Contenido END */}
          </Grid>
          {/* Filtros y contenido END */}
        </div>
      
            :
    ''
  }
  
      </>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(categoryExplorerViewNew)
