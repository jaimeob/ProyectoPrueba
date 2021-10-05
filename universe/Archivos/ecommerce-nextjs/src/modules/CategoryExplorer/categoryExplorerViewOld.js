'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'
import cookies from 'next-cookies'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import { Grid, Typography, Checkbox, Hidden, TablePagination, Button, Icon, TextField, Snackbar, Chip, IconButton, MenuItem } from '@material-ui/core'
import ViewModuleIcon from '@material-ui/icons/ViewModule'
import ListIcon from '@material-ui/icons/List'
import ViewComfyIcon from '@material-ui/icons/ViewComfy'

// Utils
import Utils from '../../resources/Utils'

// Components
import ProductCard from '../../components/ProductCard'
import ProductCardList from '../../components/ProductCardList'
import ProductCardInstagram from '../../components/ProductCardInstagram'
import FilterList from '../../components/FilterList'
import ButtonBlock from '../../components/ButtonBlock'
import CatalogModal from '../../components/CatalogModal'

// Blocks
import BannerBlock from '../../components/BannerBlock'
import CarouselBlock from '../../components/CarouselBlock'
import BannerGridBlock from '../../components/BannerGridBlock'
import BannerCountdown from '../../components/BannerCountdown'
import ProductsBlock from '../../components/ProductsBlock'
import TextBlock from '../../components/TextBlock'
import GridBlock from '../../components/GridBlock'
import BenefitBlock from '../../components/BenefitBlock'
import NewsletterBlock from '../../components/NewsletterBlock'

const styles = theme => ({
  container: {
    width: 1368,
    margin: '0 auto',
    [theme.breakpoints.down('md')]: {
      width: '100%'
    }
  },
  categoryExplorer: {
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
    marginTop: -54,
    marginBottom: 16,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 24
    },
    [theme.breakpoints.down('xs')]: {
      marginBottom: 0
    }
  },
  listView: {
    padding: '6px 12px',
    paddingLeft: 0,
    [theme.breakpoints.down('sm')]: {
      padding: '6px 12px'
    }
  },
  socialView: {
    padding: '6px 12px',
    paddingLeft: 0,
    [theme.breakpoints.down('sm')]: {
      padding: '6px 12px'
    }
  },
})

class CategoryExplorer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      banners: [],
      user: null,
      scrollPosition: 0,

      openSnack: false,
      messageSnack: '',

      count: this.props.filters.count,
      rowsPerPage: this.props.limit,
      page: this.props.page,
      uuidCAPIFacebook: null,
      offer: this.props.offers,
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
        { value: 'priceLowToHight', description: 'Precio: menor a mayor' },
        { value: 'priceHightToLow', description: 'Precio: mayor a menor' },
        { value: 'brandNameASC', description: 'Marca: A - Z' },
        { value: 'brandNameDESC', description: 'Marca: Z - A' },
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
      selectedZones: []

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
    this.deleteBreadcrumb = this.deleteBreadcrumb.bind(this)

    this.showMobileFilters = this.showMobileFilters.bind(this)
    this.checkStatus = this.checkStatus.bind(this)

    this.onChangeInputSearch = this.onChangeInputSearch.bind(this)

    this.handleChangeMosaico = this.handleChangeMosaico.bind(this)

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

  componentDidMount() {
    if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
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
  }

  createCatalog() {
    if (Utils.isUserLoggedIn()) {
      //localStorage.setItem(Utils.constants.localStorage.CATALOG_INIT, 1)
      this.props.dispatch({ type: 'START_CREATE_CATALOG' });
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
      showMobileFilters: show
    })
  }

  onChangeInputSearch(inputName, listName, event) {
    const self = this
    const query = event.target.value.toLowerCase()
    this.setState({ [inputName]: query }, () => self.filterList(inputName, listName))
  }

  handleChangeMosaico(viewCards) {
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
        break;
      case 2:
        view = 'Lista'
        break;
      case 3:
        view = 'Imágenes'
        break;
      default:
        break;
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

  componentWillMount() {
    let uuidActual = this.props.app.data.uuid
    if (uuidActual !== null) {
      this.setState({
        uuidCAPIFacebook: uuidActual
      })
    }
    let user = await Utils.getCurrentUser()
    if (user !== null) {
      this.setState({
        user: user
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

    this.setState({
      brands: this.props.filters.brands,
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

  // handleChangeBranches(idx, remove = false) {
  //   let branches = this.state.branches
  //   let selectedBranches = this.state.selectedBranches

  //   if (remove) {
  //     branches.forEach((item, jdx) => {
  //       if (item.id === selectedBranches[idx].id)
  //         branches[jdx].checked = false
  //     })
  //     selectedBranches.splice(idx, 1)
  //   }
  //   else {
  //     selectedBranches = []
  //     branches.forEach((item, jdx) => {
  //       branches[jdx].checked = false
  //     })

  //     branches[idx].checked = !branches[idx].checked
  //     if (branches[idx].checked) {
  //       selectedBranches.push(branches[idx])
  //       if (selectedBranches.length > 1) {
  //         selectedBranches = Utils.uniqBy(selectedBranches, 'id')
  //       }
  //     }
  //     else {
  //       if (selectedBranches.length > 0) {
  //         selectedBranches.forEach((selected, jdx) => {
  //           if (selected.id === branches[idx].id) {
  //             selectedBranches.splice(jdx, 1)
  //           }
  //         })
  //       }
  //     }
  //   }

  //   this.setState({
  //     branchSearch: '',
  //     page: 0,
  //     branches: branches,
  //     selectedBranches: selectedBranches
  //   }, () => this.generateQuery())
  // }
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

    Router.push(url.toLowerCase())
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


    // this.props.filters.branches.forEach((item) => {
    //   if (item.checked) {
    //     selectedBranches.push(item.id.toString())
    //   }
    // })

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
        l: 50,
        u: ((this.props.breadcrumbs !== null) ? this.props.breadcrumbs[this.props.breadcrumbs.length - 1] : this.props.breadcrumbs),
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
      if (this.props.breadcrumbs === null) {
        url = 'todos'
      } else {
        this.props.breadcrumbs.forEach(breadcrumb => {
          url += '/' + breadcrumb
        })
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

  render() {
    let self = this
    const { classes } = this.props
    return (
      <>
        {
          (this.props.blocks !== undefined && this.props.blocks.length > 0) ?
            this.props.blocks.map(function (block, idx) {
              if (block.blockTypeId === 1) {
                return (
                  <div key={idx}>
                    <TextBlock
                      configs={block.configs}
                    />
                  </div>
                )
              }
              else if (block.blockTypeId === 2) {
                return (
                  <div key={idx}>
                    <GridBlock
                      configs={block.configs}
                    />
                  </div>
                )
              }
              else if (block.blockTypeId === 3 && block.v !== undefined && block.v === '2.0') {
                return (
                  <div key={idx} className={classes.container} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                    <BannerGridBlock
                      configs={block.configs}
                    />
                  </div>
                )
              }
              else if (block.blockTypeId === 4) {
                if (block.configs.fullWidth !== undefined && block.configs.fullWidth) {
                  return (
                    <div key={idx} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                      <BannerBlock
                        configs={block.configs}
                      />
                    </div>
                  )
                } else {
                  return (
                    <div key={idx} className={classes.container} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                      <BannerBlock
                        configs={block.configs}
                      />
                    </div>
                  )
                }
              }
              else if (block.blockTypeId === 6) {
                return (
                  <div key={idx}>
                    <BenefitBlock />
                  </div>
                )
              }
              else if (block.blockTypeId === 7) {
                return (
                  <div key={idx}>
                    <NewsletterBlock
                      title="Newsletter."
                      description="Novedades, promociones, ofertas y mucho más. Déjanos tu correo electrónico."
                    />
                  </div>
                )
              }
              else if (block.blockTypeId === 15) {
                return (
                  <div key={idx} style={{ marginTop: '1%' }}>
                    <CarouselBlock configs={block.configs} />
                  </div>
                )
              }
              else if (block.blockTypeId === 17) {
                return (
                  <div key={idx}>
                    <BannerCountdown
                      title={block.title}
                      configs={block.configs}
                    />
                  </div>
                )
              } else if (block.blockTypeId === 22) {
                return (
                  <div key={idx} style={{ marginTop: '1%' }}>
                    <ProductsBlock configs={block} />
                  </div>
                )
              }
              else {
                return (
                  <div></div>
                )
              }
            })
            :
            ''
        }
        {
          (this.props.showProducts && this.props.products.length > 0) ?
            <div className={classes.container}>
              {
                (this.props.isBrand === undefined || !this.props.isBrand) ?
                  <ButtonBlock data={this.props.buttons} />
                  :
                  ''
              }
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
              <Grid container justify="flex-start" alignItems="flex-end" className={classes.categoryExplorer} style={(this.state.scrollPosition >= 170 && this.state.currentCatalogStatus) ? { marginTop: 72 } : { marginTop: 0 }}>
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
                  <Hidden xsDown>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={11} style={{ display: 'flex', borderRadius: 5, justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(0, 0, 0, 0.20)', height: '40px' }} >
                      <div style={{ display: 'flex' }} >
                        {/* <span>Vista: {this.state.view} </span> */}
                        <span>Vista: </span>
                        <div style={{}} >
                          <ViewComfyIcon onClick={() => { this.handleChangeMosaico(1) }} style={{ cursor: 'pointer', marginLeft: 5 }} color={`${this.state.viewCards === 1 || this.state.viewCards === '1' ? "primary" : "disabled"}`} ></ViewComfyIcon >
                          <ListIcon onClick={() => { this.handleChangeMosaico(2) }} style={{ cursor: 'pointer', marginLeft: 5 }} color={`${this.state.viewCards === 2 || this.state.viewCards === '2' ? "primary" : "disabled"}`} ></ListIcon >
                          <ViewModuleIcon onClick={() => { this.handleChangeMosaico(3) }} style={{ cursor: 'pointer', marginLeft: 5 }} color={`${this.state.viewCards === 3 || this.state.viewCards === '3' ? "primary" : "disabled"}`} ></ViewModuleIcon>

                        </div>
                      </div>
                    </Grid>
                  </Hidden>
                  <div>
                    <Typography variant="body1" style={{ marginBottom: 8 }}>Ordenar resultado</Typography>
                    <TextField
                      fullWidth
                      select
                      value={this.state.orderBy}
                      variant="outlined"
                      label={Utils.isEmpty(this.state.orderBy) ? "Ordenar por..." : ''}
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
                    <hr style={{ opacity: 0.4, margin: '16px 0', marginTop: 24 }} />
                    {
                      (this.props.filters.genders.length > 0) ?
                        <FilterList
                          data={this.props.filters.genders}
                          handleFunction={self.handleChangeGender}
                          style={{ margin: 0, marginTop: 16, padding: 16, paddingTop: 0, paddingBottom: 0, listStyle: 'none', height: 120, overflowY: 'auto' }}
                          title="Género"
                        />
                        :
                        ''
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
                      (this.props.filters.bluePoints > 0) ?
                        <div>
                          <Typography variant="body1">Monedero Azul ®</Typography>
                          <ul style={{ margin: 0, padding: '16px', listStyle: 'none', overflow: 'none' }}>
                            <li style={{ fontSize: 12, margin: 0, padding: 0 }}>
                              <Checkbox
                                style={{ fontSize: 12, margin: 0, padding: 0 }}
                                checked={this.state.bluePoint}
                                onChange={() => { self.handleChangeBluePoint() }}
                                value={this.state.bluePoint}
                                color="primary"
                              />
                              (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(this.props.filters.bluePoints)}</strong>)
                            </li>
                          </ul>
                          <hr style={{ opacity: 0.4, margin: '16px 0', marginTop: 8 }} />
                        </div>
                        :
                        ''
                    }
                    {
                      ((this.props.isBrand === undefined || !this.props.isBrand) && this.props.filters.brands.length > 0) ?
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
                    {
                      (this.props.filters.zones.length > 0) ?
                        <FilterList
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
                        <FilterList
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
                  </div>
                </Grid>
                <Grid item lg={10} md={9} sm={12} xs={12} style={(this.state.showMobileFilters) ? { display: 'none' } : { display: 'block' }}>
                  <Grid container justify="flex-start" alignItems="flex-end">
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginBottom: 20 }}>
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

                        <Grid item xl={12} lg={12} md={12} sm={12} xs={11} style={{ display: 'flex', borderRadius: 5, justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(0, 0, 0, 0.20)', height: '40px' }} >
                          <div style={{ display: 'flex' }} >
                            {/* <span>Vista: {this.state.view} </span> */}
                            <span>Vista: </span>
                            <div style={{}} >
                              <ViewComfyIcon onClick={() => { this.handleChangeMosaico(1) }} style={{ cursor: 'pointer', marginLeft: 5 }} color={`${this.state.viewCards === 1 || this.state.viewCards === '1' ? "primary" : "disabled"}`} ></ViewComfyIcon >
                              <ListIcon onClick={() => { this.handleChangeMosaico(2) }} style={{ cursor: 'pointer', marginLeft: 5 }} color={`${this.state.viewCards === 2 || this.state.viewCards === '2' ? "primary" : "disabled"}`} ></ListIcon >
                              <ViewModuleIcon onClick={() => { this.handleChangeMosaico(3) }} style={{ cursor: 'pointer', marginLeft: 5 }} color={`${this.state.viewCards === 3 || this.state.viewCards === '3' ? "primary" : "disabled"}`} ></ViewModuleIcon>

                            </div>
                          </div>
                        </Grid>

                      </Hidden>
                      <Typography variant="body1"><strong>{Utils.numberWithCommas(this.props.filters.count)}</strong> resultados para tu búsqueda:</Typography>
                      {
                        (this.props.isBrand !== undefined && this.props.isBrand) ?
                          this.props.filters.brands.map((brand, idx) => {
                            if (brand.checked) {
                              return (
                                <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={brand.description} color="primary" />
                              )
                            }
                          })
                          :
                          ''
                      }
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
                        (this.state.bluePoint) ?
                          <Chip style={{ marginTop: 6, marginRight: 6 }} label="MONEDERO AZUL ®" onDelete={() => { self.handleChangeBluePoint(true) }} color="primary" />
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
                        (this.props.isBrand === undefined || !this.props.isBrand) ?
                          this.props.filters.brands.map((brand, idx) => {
                            if (brand.checked) {
                              return (
                                <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={brand.description} onDelete={() => { self.handleChangeBrands(idx, true) }} color="primary" />
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
                        this.props.filters.zones.map((zone, idx) => {
                          if (zone.checked) {
                            return (
                              <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={zone.name} onDelete={() => { self.handleChangeZones(idx, true) }} color="primary" />
                            )
                          }
                        })
                      }
                      {
                        this.props.filters.branches.map((branch, idx) => {
                          if (branch.checked) {
                            return (
                              <Chip key={idx} style={{ marginTop: 6, marginRight: 6 }} label={branch.name} onDelete={() => { self.handleChangeBranches(idx, true) }} color="primary" />
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
                        (this.state.viewCards === 1 || this.state.viewCards === '1') ?
                          this.props.products.map((product, index) => {
                            return (
                              <Grid key={index} item xl={3} lg={3} md={3} sm={3} xs={6} style={{ marginTop: 4 }}>
                                <div style={{ margin: 2, marginBottom: 0, backgroundColor: 'white' }}>
                                  <ProductCard
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
                                <Grid className={classes.listView} key={index} item xl={12} lg={12} md={12} sm={12} xs={12}>
                                  <div style={{ margin: 0, padding: 0, backgroundColor: 'white' }}>
                                    <ProductCardList
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
                            this.props.products.map((product, index) => {
                              return (
                                <Grid className={classes.socialView} key={index} item xl={4} lg={4} md={4} sm={4} xs={4}>
                                  <div style={{ background: 'white', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.19)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.19)' }}>
                                    <ProductCardInstagram
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
                        <Grid item lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
                          {/*
                          <Empty
                            isLoading={this.state.isLoading}
                            emptyImg={this.state.emptyImage}
                            title={this.state.emptyTitle}
                            description={this.state.emptyDescription}
                            buttonTitle={this.state.emptyButtonTitle}
                            callToAction={() => { this.toCategory() }}
                          />
                          */}
                        </Grid>
                    }
                    {/* {
                      (this.props.products.length > 0) ?
                        this.props.products.map((product, index) => {
                          return (
                            <Grid key={index} item xl={3} lg={3} md={3} sm={3} xs={6} style={{ marginTop: 4}}>
                              <div style={{ margin: 2, marginBottom: 0, backgroundColor: 'white' }}>
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
                    } */}
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
            ''
        }
        <CatalogModal
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
)(CategoryExplorer)
