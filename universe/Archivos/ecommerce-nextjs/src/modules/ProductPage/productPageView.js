'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'
import sanitizeHtml from 'sanitize-html'
import Head from 'next/head'


// Material UI
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import { Rating } from '@material-ui/lab'

import { Typography, Table, TableBody, TableRow, TableCell, Button, Hidden, Icon } from '@material-ui/core'

// Utils
import Utils from '../../resources/Utils'
import { addProductToShoppingCart, openShoppingCart, updateAllProductFrontShoppingCart } from '../../actions/actionShoppingCart'
import { getDeliveryAddress } from '../../actions/actionDeliveryAddress'
import { requestAPI } from '../../api/CRUD'

// Components
import LocatorModal from '../../components/LocatorModalDesign'
import HotShoppingNew from '../../components/HotShoppingNew'
import ReviewModal from '../../components/ReviewModal'
import ShareModal from '../../components/ShareModal'
import Loading from '../../components/Loading'
import ProductsBlock from '../../components/ProductsBlock'
import TextBlock from '../../components/TextBlock'
import { productPageTrackerFunction, addToCart } from '../../resources/classes/retailrocket.js'
import {
	SideBySideMagnifier,
	TOUCH_ACTIVATION
} from "react-image-magnifiers"

import MobilePhotos from '../../components/MobilePhotos'
import { Description } from '@material-ui/icons'

const styles = theme => ({
	separatorLine: {
		height: 1,
		border: 'none',
		background: '#EDEEF2',
	},
	breadcrumbs: {
		margin: '0 auto',
		padding: '8px 0',
		[theme.breakpoints.down('sm')]: {
			paddingLeft: 8,
			paddingRight: 8
		}
	},
	breadcrumb: {
		fontSize: 16,
		fontWeight: 500,
		color: '#006FB9'
	},
	container: {
		backgroundColor: 'white',
		width: 1170,
		margin: '0 auto',
		['@media (max-width: 1200px)']: {
			width: 1080
		},
		['@media (max-width: 1100px)']: {
			width: 950
		},
		[theme.breakpoints.down('sm')]: {
			width: '100%'
		}
	},
	infoGrid: {
		padding: 16,
		[theme.breakpoints.down('sm')]: {
			paddingTop: 0
		}
	},
	imageContainer: {
		width: '100%',
		height: 'auto',
		[theme.breakpoints.down('sm')]: {

		}
	},
	imageList: {
		padding: '8px 16px',
		margin: 0,
		listStyle: 'none'
	},
	imageItem: {
		display: 'inline-block',
		height: 55,
		width: 'auto',
		marginRight: 12,
		border: 'solid 2px white',
		cursor: 'pointer'
	},
	imageSelectedItem: {
		display: 'inline-block',
		height: 55,
		width: 'auto',
		marginRight: 12,
		border: 'solid 2px #006FB9',
		cursor: 'pointer'
	},
	thumbImage: {
		height: '100%',
		width: 'auto'
	},
	actionButton: {
		marginRight: 12,
		textTransform: 'none'
	},
	actionButtonIcon: {
		height: 22,
		marginRight: 8
	},
	actionButtonText: {
		fontSize: 14,
		fontWeight: 500,
		color: '#006FB9'
	},
	title: {
		fontSize: 22,
		fontWeight: '500',
		color: '#111110',
		margin: '4px 0'
	},
	subtitle: {
		fontSize: 17,
		fontWeight: '300',
		color: '#111110',
		margin: '4px 0'
	},
	code: {
		fontSize: 14,
		fontWeight: 'normal',
		color: '#808080',
		margin: '4px 0'
	},
	ratingContainer: {
		margin: '8px 0'
	},
	ratingComponent: {
		float: 'left',
		marginRight: 8
	},
	ratingButton: {
		display: 'inline-block',
		padding: 0,
		margin: 0,
		marginTop: 4
	},
	ratingButtonText: {
		fontSize: 14,
		textDecoration: 'none',
		textTransform: 'none',
		fontWeight: 'normal',
		color: '#006fb9'
	},
	tagItem: {
		display: 'inline-block',
		padding: '0px 8px',
		borderRadius: 6,
		fontSize: 14,
		fontWeight: 'normal',
		margin: '4px 0',
		marginRight: 4
	},
	discountTag: {
		display: 'inline-block',
		width: 'auto',
		padding: '0px 8px',
		borderRadius: 6,
		backgroundColor: '#FFE8EB',
		margin: '4px 0',
		marginRight: 8
	},
	discountText: {
		fontSize: 14,
		fontWeight: '500',
		color: '#D11E0A'
	},
	bluePointsTag: {
		display: 'inline-block',
		width: 'auto',
		padding: '0px 8px',
		borderRadius: 6,
		backgroundColor: '#3091E530',
		margin: '4px 0'
	},
	bluePointsText: {
		fontSize: 14,
		fontWeight: '500',
		color: '#3091E5'
	},
	price: {
		display: 'inline-block',
		fontSize: 32,
		fontWeight: 800,
		color: '#22397C',
	},
	oldPrice: {
		textDecoration: 'line-through',
		display: 'inline-block',
		fontSize: 14,
		fontWeight: 'normal',
		color: '#808080',
		verticalAlign: 'middle',
		marginTop: -12,
		marginLeft: 12
	},
	priceDescription: {
		fontSize: 14,
		fontWeight: 'normal',
		color: '#68686A',
		marginBottom: 16
	},
	headerInfoPrice: {
		fontSize: 14,
		fontWeight: 500,
		color: '#111110'
	},
	infoPriceContainer: {
		padding: '16px 0'
	},
	iconPriceContainer: {
		textAlign: 'center',
		marginTop: 4
	},
	iconPrice: {
		display: 'inline-block',
		width: 70
	},
	descriptionInfoPrice: {
		lineHeight: 'normal',
		letterSpacing: '0.15px',
		fontSize: 14,
		color: '#111110'
	},
	sizeContainer: {
		marginTop: 8
	},
	sizeNotAvailableItem: {
		cursor: 'not-allowed',
		margin: 4,
		padding: 12,
		borderRadius: 6,
		border: 'solid 1px #C6C7CB',
		backgroundColor: '#EDEEF2',
		textAlign: 'center'
	},
	sizeNotAvailableText: {
		fontSize: 14,
		fontWeight: 'normal',
		color: '#68686A'
	},
	sizeItem: {
		cursor: 'pointer',
		margin: 4,
		padding: 12,
		borderRadius: 6,
		border: 'solid 2px #C6C7CB60',
		backgroundColor: '#FFFFFF',
		textAlign: 'center'
	},
	sizeSelectedItem: {
		cursor: 'pointer',
		margin: 4,
		padding: 12,
		borderRadius: 6,
		border: 'solid 2px #006FB9',
		outlineOffset: '-40px',
		backgroundColor: '#FFFFFF',
		textAlign: 'center'
	},
	sizeAvailableText: {
		fontSize: 14,
		fontWeight: 'normal',
		color: '#212222'
	},
	selectedSizeIndicator: {
		fontSize: 14,
		fontWeight: 'normal',
		color: '#111110'
	},
	sizeGuideContainer: {
		float: 'right'
	},
	sizeGuideButton: {
		display: 'inline-block',
		padding: 0,
		margin: 0
	},
	sizeGuideButtonText: {
		fontSize: 14,
		textDecoration: 'none',
		textTransform: 'none',
		fontWeight: 'normal',
		color: '#006fb9'
	},
	modelContainer: {
		margin: '4px 0px'
	},
	modelItem: {
		marginTop: 12,
		cursor: 'pointer',
		marginRight: 8,
		borderRadius: '50%',
		width: 60,
		height: 60,
		border: '1px solid #C6C7CB',
		objectFit: 'cover'
	},
	modelItemSelected: {
		marginTop: 12,
		cursor: 'pointer',
		marginRight: 8,
		borderRadius: '50%',
		width: 60,
		height: 60,
		border: 'solid 2px #006FB9',
		objectFit: 'cover'
	},
	modelImage: {
		borderRadius: '50%',
		objectFit: 'cover',
		width: '100%',
		height: '100%'
	},
	availableMessage: {
		fontSize: 14,
		fontWeight: 'normal',
		color: '#E98607'
	},
	iconLocation: {
		display: 'inline-block',
		float: 'left',
		width: 33,
		height: 'auto',
		margin: '16px 0',
		marginRight: 12
	},
	messageLocation: {
		fontSize: 14,
		fontWeight: 500,
		color: '#448345',
		marginTop: 8
	},
	secondaryMessageLocation: {
		fontSize: 14,
		fontWeight: 'normal',
		color: '#111111'
	},
	buyNowButton: {
		width: '96%',
		marginRight: '4%',
		height: 44,
		padding: 8,
		borderRadius: 4,
		backgroundColor: '#22397C',
		textTransform: 'none'
	},
	buyNowButtonText: {
		fontSize: 16,
		fontWeight: 500,
		color: 'white'
	},
	addToCartButton: {
		width: '100%',
		height: 44,
		padding: 8,
		borderRadius: 4,
		backgroundColor: '#white',
		border: 'solid 1px #22397C'
	},
	featuresContainer: {
		marginTop: 16,
		padding: 16
	},
	textFeature: {
		fontSize: 14,
		fontWeight: 'normal',
		color: '#111110'
	}
})

class ProductPage extends Component {
	constructor(props) {
		super(props)

		let description = sanitizeHtml(this.props.product.detail.description, {
			allowedTags: ['strong', 'p', 'br', 'a', 'img', 'ul', 'li', 'h1', 'h2'],
			allowedAttributes: {
				'img': ['src'],
				'a': ['href'],
				'p': ['style']
			},
			allowedIframeHostnames: ['amazonaws.com']
		})

		this.state = {
			user: null,
			openShareModal: false,
			breadcrumbs: [],
			stock: true,
			loadingProduct: true,
			location: null,
			openLocatorModal: false,
			openReviewModal: false,
			locatorData: null,
			openSnack: false,
			messageSnack: '',
			description: description,
			blocks: [],
			selectedPhoto: '',
			isVertical: false,
			sizes: [],
			rating: 0,
			comments: [],
			selectedSize: 0,
			selectedArticle: '',
			totalAvailable: null,
			clickFrom: '',
			colors: [],
			colorIdx: '',
			imageMagnifyWorking: true,
			openHotShoppingModal: false,
			fromClickAndCollect: false,
			photos: [],
			locatorStoreSize: 0,
			uuidCAPIFacebook: null,
			productDescriptionSeo: null,
			breadcrumbsRetail: null,
			showExitIntentRetailRocket: false,
		}

		this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
		this.handleChangeSizes = this.handleChangeSizes.bind(this)
		this.changePhoto = this.changePhoto.bind(this)
		this.loadReviews = this.loadReviews.bind(this)
		this.loadSizes = this.loadSizes.bind(this)
		this.handleAddProductToShoppingCart = this.handleAddProductToShoppingCart.bind(this)
		this.openShoppingCart = this.openShoppingCart.bind(this)
		this.handleOpenLocatorModal = this.handleOpenLocatorModal.bind(this)
		this.getLocationProduct = this.getLocationProduct.bind(this)
		this.handleOpenWhatsApp = this.handleOpenWhatsApp.bind(this)
		this.loadData = this.loadData.bind(this)
		this.addSeenProducts = this.addSeenProducts.bind(this)
		this.handleOpenHotShoppingModal = this.handleOpenHotShoppingModal.bind(this)
	}


	addSeenProducts(productCode) {
		if (productCode !== undefined) {
			requestAPI({
				host: Utils.constants.CONFIG_ENV.HOST,
				method: 'POST',
				resource: 'recently-seen',
				endpoint: '/add-product',
				data: {
					product: productCode
				}
			})
		}
	}



	async getLocationProduct(zip) {
		let response = await requestAPI({
			method: 'POST',
			host: Utils.constants.CONFIG_ENV.HOST,
			resource: 'products',
			endpoint: '/locations',
			data: {
				deliveryZip: zip,
				products: [{
					code: this.props.product.code,
					size: this.state.selectedSize,
					stock: this.props.product.stock,
					quantity: 1
				}]
			}
		})

		if (response.status === Utils.constants.status.SUCCESS) {
			if (response.data.length === 1) {
				this.setState({
					location: response.data[0]
				})
			}
		}
	}



	async componentWillMount() {
		let uuidActual = this.props.app.data.uuid
		if (uuidActual !== null) {
			this.setState({
				uuidCAPIFacebook: uuidActual
			})
		}
		let user = await Utils.getCurrentUser()
		if (user !== null) {
			// Método para agregar producto a productos vistos
			if (this.props.product.code !== undefined) {
				this.addSeenProducts(this.props.product.code)
			}
			this.setState({
				user: user
			})
		}
		let { breadcrumbs } = this.props
		let descriptionSeo = ""
		let breadcrumbsRetail = ""


		if (breadcrumbs.length > 0 && breadcrumbs !== null && breadcrumbs !== undefined) {

			breadcrumbs.map((breadcrumb, idx) => {
				if (breadcrumbs.length - 1 === idx) {
					descriptionSeo = descriptionSeo + breadcrumb.description
					//breadcrumbsRetail = breadcrumbsRetail + breadcrumb.description + '/'
				} else {
					descriptionSeo = descriptionSeo + breadcrumb.description + ' '
					breadcrumbsRetail = breadcrumbsRetail + breadcrumb.description + '/'
				}
			})

		}

		breadcrumbsRetail = breadcrumbsRetail.split(' ').join('')

		this.setState({
			productDescriptionSeo: descriptionSeo,
			breadcrumbsRetail: breadcrumbsRetail
		})

		// First time
		this.loadData()

	}

	async productPageTracker(sizes) {
		productPageTrackerFunction(this.props.product, sizes, this.state.breadcrumbsRetail)
	}



	componentDidUpdate(prevProps) {

		if (prevProps !== this.props) {
			if (prevProps.product !== undefined && prevProps.product.code !== this.props.product.code) {
				// Change product
				this.loadData()
			}
			if (prevProps.delivery !== this.props.delivery) {
				if (this.props.delivery !== undefined && this.props.delivery.data !== undefined && this.props.delivery.data !== null) {
					if (this.props.product !== null && (this.state.selectedSize !== 0 || this.props.product.uniqueProduct)) {
						this.getLocationProduct(this.props.delivery.data.zip)
					}
				}
			}
		}
	}

	async loadData() {
		this.setState({ loadingProduct: true, selectedPhoto: this.props.product.photos[0].description })
		Utils.scrollTop()
		this.loadReviews()
		if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
			let dateSending = new Date();

			gtag('event', 'view_item', {
				"items": [
					{
						"id": this.props.product.code,
						"name": this.props.product.name,
						"list_name": "CategoryExplorer",
						"brand": this.props.product.brand.name,
						"category": this.props.product.categoryCode,
						"price": this.props.product.price
					}
				]
			})

			fbq('track', 'ViewContent', {
				"content_ids": [this.props.product.code],
				"content_name": this.props.product.name,
				'contents': [this.props.product],
				"content_type": 'ProductDetail',
				"currency": 'MXN',
				"value": this.props.product.price,

			}, { eventID: 'ViewContent' })

			if (this.state.user !== null && this.state.user !== undefined) {

				let eventToFacebook = {
					"data": [
						{
							"event_name": 'ViewContent',
							'event_time': Utils.timeIntoSeconds(dateSending),
							'user_data': {
								'fn': await Utils.hashingData(this.state.user.name),
								'ln': await Utils.hashingData(this.state.user.secondLastName)
							},
							'custom_data': {
								"content_ids": [this.props.product.code],
								"content_name": this.props.product.name,
								"value": this.props.product.price,
								"currency": "MXN"
							},
							'event_id': 'ViewContent',
							'action_source': 'website'
						}
					]
				}

				await Utils.sendConversionApiFacebook(eventToFacebook, this.state.uuidCAPIFacebook)
			}
		}

		let isVertical = await Utils.isVertical(this.props.product.photos[0].description)

		let photos = []
		await Utils.asyncForEach(this.props.product.photos, async (photo) => {
			photos.push({
				url: Utils.constants.HOST_CDN_AWS + '/zoom/' + photo.description,
				description: this.props.product.detail.title,
				vertical: isVertical,
				width: 400,
				size: 400,
			})
		})

		this.setState({
			photos: photos,
			selectedPhoto: this.props.product.photos[0].description,
			isVertical: isVertical,
			colorIdx: this.props.configs.colorIdx
		}, () => {
			if (!this.props.product.uniqueProduct) {
				this.loadSizes()
			} else {
				this.loadSizes(true)
			}
		})


	}

	async loadSizes(selected = false) {
		const self = this

		let sizesResponse = await requestAPI({
			method: 'GET',
			host: Utils.constants.CONFIG_ENV.HOST,
			resource: 'products',
			endpoint: '/' + this.props.product.code + '/sizes',
		})

		this.productPageTracker(sizesResponse.data.sizes, sizesResponse.data.stock)

		this.setState({
			sizes: sizesResponse.data.sizes,
			stock: sizesResponse.data.stock,
			loadingProduct: false,
			selectedSize: 0,
			selectedArticle: '',
			totalAvailable: null
		}, () => {
			if (selected && this.state.stock) {
				let totalAvailable = this.state.sizes[0].quantity
				let selectedArticle = this.state.sizes[0].detail[0].article
				this.setState({
					location: null,
					selectedSize: this.state.sizes[0].size,
					selectedArticle: selectedArticle,
					totalAvailable: totalAvailable
				}, () => {
					self.props.getDeliveryAddress()
				})
			}
		})
	}

	async loadReviews() {
		let response = await requestAPI({
			method: 'GET',
			host: Utils.constants.CONFIG_ENV.HOST,
			resource: 'products',
			endpoint: '/' + this.props.product.code + '/reviews',
		})

		if (response.status === Utils.constants.status.SUCCESS) {
			this.setState({
				rating: response.data.rating,
				comments: response.data.comments
			})
		}
	}

	openShoppingCart() {
		this.setState({
			openSnack: false,
			messageSnack: ''
		}, () => {
			this.props.openShoppingCart(true)
		})
	}

	handleOpenLocatorModal() {
		if (this.state.totalAvailable === null) {
			this.setState({
				openSnack: true,
				clickFrom: '',
				messageSnack: 'Selecciona una talla.'
			})
		} else {
			this.setState({
				openLocatorModal: true,
				locatorData: {
					product: this.props.product,
					selectedArticle: this.state.selectedArticle,
					selectedSize: this.state.selectedSize,
					sizes: this.state.sizes
				}
			})
		}
	}

	async handleAddProductToShoppingCart(method = '') {
		
		//RETAIL ROCKET
		if (this.props.product.codeRetailRocket !== undefined && this.state.selectedSize != 0 && this.state.selectedSize != undefined) {
			let productId = this.props.product.codeRetailRocket + String(this.state.selectedSize)
			addToCart(productId)
		}

		this.setState({ loadingProduct: true })
		let dateSending = new Date();
		if (Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
			gtag('event', 'conversion', {
				'send_to': this.props.app.data.googleAdsConversionEvents.addToCart,
				'value': this.props.product.price,
				'currency': 'MXN'
			})

			gtag('event', 'add_to_cart', {
				"items": [
					{
						"id": this.props.product.code,
						"name": this.props.product.name,
						"list_name": "CategoryExplorer",
						"brand": this.props.product.brand.name,
						"category": this.props.product.categoryCode,
						"price": this.props.product.price
					}
				]
			})

			fbq('track', 'AddToCart', {
				"content_ids": this.props.product.code,
				"content_name": this.props.product.name,
				"content_type": this.props.product.categoryCode,
				"currency": 'MXN',
				"value": this.props.product.price
			}, { eventID: 'AddToCart' })

			if (this.state.user !== null && this.state.user !== undefined) {

				let eventToFacebook = {
					"data": [
						{
							"event_name": 'AddToCart',
							'event_time': Utils.timeIntoSeconds(dateSending),
							'user_data': {
								'fn': await Utils.hashingData(this.state.user.name),
								'ln': await Utils.hashingData(this.state.user.secondLastName)
							},
							'custom_data': {
								"content_ids": [this.props.product.code],
								"content_name": this.props.product.name,
								"value": this.props.product.price,
								"currency": "MXN"
							},
							'event_id': 'AddToCart',
							'action_source': 'website'
						}
					]
				}

				await Utils.sendConversionApiFacebook(eventToFacebook, this.state.uuidCAPIFacebook)
			}
		}

		let messageError = 'Ocurrió un problema al intentar agregar un producto a tu carrito. Inténtalo de nuevo más tarde.'
		if (this.state.totalAvailable === null && this.props.product.stock.status) {
			this.setState({
				openSnack: true,
				messageSnack: 'Selecciona una talla.',
				loadingProduct: false
			})
		}
		else {
			let response = await requestAPI({
				host: Utils.constants.CONFIG_ENV.HOST,
				method: 'POST',
				resource: 'carts',
				endpoint: '/add',
				data: {
					product: this.props.product.code,
					article: this.state.selectedArticle,
					size: this.state.selectedSize,
					quantity: 1
				}
			})

			if (response.status === Utils.constants.status.SUCCESS) {
				if (response.data.added) {
					let product = Utils.cloneJson(this.props.product)
					this.props.addProductToShoppingCart(product)
					this.props.openShoppingCart(true)

					if (!this.props.product.uniqueProduct) {
						this.setState({
							selectedSize: 0,
							selectedArticle: '',
							totalAvailable: null,
							loadingProduct: false
						})
					}

					if (Utils.isEmpty(method)) {
						this.setState({
							openSnack: true,
							clickFrom: 'addToShoppingCart',
							messageSnack: 'Producto agregado al carrito de compras. (Código: ' + product.code + ')',
							loadingProduct: false
						})
					} else {
						if (Utils.isUserLoggedIn()) {
							Router.push(Utils.constants.paths.checkout + '' + method)
						}
						else {
							Router.push(Utils.constants.paths.login + '?checkout=true')
						}
					}
				} else {
					this.setState({
						openSnack: true,
						messageSnack: messageError,
						loadingProduct: false
					})
				}
			} else {
				if (response.data.error.error.code !== undefined) {
					messageError = response.data.error.error.message
				}
				this.setState({
					openSnack: true,
					messageSnack: messageError,
					loadingProduct: false
				})
			}
		}






	}

	async changePhoto(idx) {
		let selectedPhoto = ''
		let product = this.props.product
		let isVertical = false
		try {
			product.photos.forEach((image, i) => {
				product.photos[i].selected = false
			})
			product.photos[idx].selected = true
			selectedPhoto = product.photos[idx].description
			isVertical = await Utils.isVertical(selectedPhoto)
		} catch (err) {
			product.photos = []
		}

		this.setState({
			product: product,
			selectedPhoto: selectedPhoto,
			isVertical: isVertical,
			imageMagnifyWorking: true
		})
	}

	handleChangeSizes(event, option) {
		event.preventDefault()
		const self = this
		let totalAvailable = null
		let size = Number(option.size)
		let selectedArticle = ''

		this.state.sizes.forEach((item) => {
			if (Number(item.size) === size) {
				selectedArticle = item.detail[0].article
				totalAvailable = item.quantity
			}
		})

		this.setState({
			location: null,
			selectedSize: size,
			selectedArticle: selectedArticle,
			totalAvailable: totalAvailable
		}, () => {
			self.props.getDeliveryAddress()
		})
	}

	async handleChangeColor(idx) {
		let product = this.props.configs.colors[idx]
		window.location.href = product.url
	}

	handleCloseSnackbar() {
		this.setState({
			messageSnack: ''
		})
	}

	handleOpenWhatsApp() {
		window.location.href = 'https://api.whatsapp.com/send?phone=526677515229&text=Hola, necesito información de este producto: https://' + this.props.app.data.domain + this.props.product.url
	}

	handleOpenHotShoppingModal(size) {
		let locatorStoreSize = Number((size === undefined || size === null) ? 0 : size)
		let selectedSize = (locatorStoreSize === 0) ? this.state.selectedSize : locatorStoreSize

		let selectedArticle = ""

		this.state.sizes.forEach((item) => {
			if (Number(item.size) === selectedSize) {
				selectedArticle = item.detail[0].article
			}
		})

		this.setState({
			locatorStoreSize: locatorStoreSize,
			selectedArticle: selectedArticle,
			openHotShoppingModal: true,
			openLocatorModal: false,
			locatorData: null
		})
	}

	renderThumbs() {
		const self = this
		const { classes } = this.props
		return (
			<ul className={classes.imageList}>
				{
					this.props.product.photos.map((image, idx) => {
						return (
							<li key={idx} className={(image.selected) ? classes.imageSelectedItem : classes.imageItem} onMouseOver={() => { self.changePhoto(idx) }}>
								{
									(!image.imageWorking) ?
										<img className={classes.thumbImage} src={Utils.constants.HOST_CDN_AWS + '/thumbs/' + image.description} alt={this.props.product.detail.title} onError={() => { image.imageWorking = true }} />
										:
										<img className={classes.thumbImage} src={Utils.getPlaceholderByGender(self.props.product.genderCode)} alt={this.props.product.detail.title} />
								}
							</li>
						)
					})
				}
				{
					(!Utils.isEmpty(this.props.product.detail.photo360)) ?
						<li className={classes.thumbPhoto360Item}>
							<img className={classes.thumbPhoto360} src="./photo360.svg" alt={this.props.product.detail.title} />
						</li>
						:
						''
				}
			</ul>
		)
	}

	renderMainPhoto() {
		const self = this
		const { classes } = this.props
		return (
			<>
				{
					(!Utils.isEmpty(this.state.selectedPhoto)) ?
						<SideBySideMagnifier
							imageSrc={Utils.constants.HOST_CDN_AWS + '/zoom/' + this.state.selectedPhoto}
							alwaysInPlace={true}
							imageAlt={this.props.product.detail.title}
							largeImageSrc={Utils.constants.HOST_CDN_AWS + '/zoom/' + this.state.selectedPhoto}
							touchActivation={TOUCH_ACTIVATION.DOUBLE_TAP}
						/>
						:
						''
				}
			</>
		)
	}

	renderBuyButtons() {
		const { classes } = this.props
		return (
			<>
				{
					this.props.product.codeRetailRocket !== undefined ? <div data-retailrocket-markup-block="613ba58e97a5281790144f0f" data-product-id={Number(this.props.product.codeRetailRocket)}  >
					</div> : null
				}

				<Grid item lg={(this.props.product.restricted) ? 12 : 10} sm={(this.props.product.restricted) ? 12 : 10} xs={(this.props.product.restricted) ? 12 : 10}>
					<Button variant="contained" className={classes.buyNowButton} style={(this.props.product.restricted) ? { width: '100%' } : {}} onClick={(event) => {
						event.preventDefault()
						if (!Utils.isUserLoggedIn()) {
							this.setState({ openSnack: true, messageSnack: 'Es necesario iniciar sesión.', clickFrom: 'login' })
							return
						}

						if (this.state.totalAvailable !== null) {
							this.handleOpenHotShoppingModal()
						}
						else {
							this.setState({ openSnack: true, messageSnack: 'Selecciona una talla.' })
						}
					}}>
						<Typography variant="body1" className={classes.buyNowButtonText}>
							{
								(this.props.product.restricted) ?
									'Comprar ahora con CrediVale ®'
									:
									'Comprar ahora'
							}
						</Typography>
					</Button>
				</Grid>
				<Grid>
					{
						// EXIT INTENT BAR

						(this.props.product.codeRetailRocket !== undefined && Utils.constants.CONFIG_ENV.UUID === '054b980b-6f4e-4d0c-8d53-1915be4abea2' && this.state.showExitIntentRetailRocket) ?
							<div data-retailrocket-markup-block="613ba58e97a5281790144f0f" data-product-id={Number(this.props.product.codeRetailRocket)}>
							</div>
							//retailrocket.markup.render()
							: null
								
					}
				</Grid>
				{
					(!this.props.product.restricted) ?
						<Grid item lg={2} xs={2}>

							<Button variant="outlined" className={classes.addToCartButton} onClick={() => { this.handleAddProductToShoppingCart() }}>
								{/* <div class="buy_button" onmousedown="mouseDown()"></div> */}
								<img src="./addtocart.svg" alt="Carrito Calzzapato" />
							</Button>
						</Grid>
						:
						''
				}
			</>
		)
	}

	renderSearchInStoresButton() {
		const { classes } = this.props
		return (
			<>
				<Button variant="text" className={classes.actionButton} onClick={() => { this.handleOpenLocatorModal() }}>
					<img className={classes.actionButtonIcon} src="../../search.svg" alt="Buscar en tienda" />
					<Typography variant="body2" className={classes.actionButtonText}>Buscar en tienda</Typography>
				</Button>
			</>
		)
	}



	render() {
		const self = this
		const { classes } = this.props

		return (
			<>
				<Head>
					<script
						type='application/ld+json'
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								"@context": "https://schema.org/",
								"@type": "Product",
								"name": (this.props.product.detail.title !== undefined && !Utils.isEmpty(this.props.product.detail.title)) ? this.props.product.detail.title : this.props.app.data.configs.welcomeDescription,
								"image": (this.props.product.photos !== null && this.props.product.photos !== undefined && this.props.product.photos.length > 0) ? Utils.constants.HOST_CDN_AWS + '/thumbs/' + this.props.product.photos[0].description : '',
								"description": (this.state.description !== undefined && !Utils.isEmpty(this.state.description)) ? this.state.description : this.props.product.description
							})
						}}
					/>
					<title>{(this.props.product.detail.title !== undefined && !Utils.isEmpty(this.props.product.detail.title)) ? this.props.product.detail.title : this.props.app.data.configs.faviconTitle}</title>
					<meta name="description" content={(this.state.productDescriptionSeo !== undefined && !Utils.isEmpty(this.state.productDescriptionSeo)) ? this.state.productDescriptionSeo : this.props.product.description}></meta>
					<link id="meta-canonical" rel="canonical" href={(this.props.product.url !== undefined) ? ('https://' + this.props.app.data.domain + this.props.product.url) : ('https://' + this.props.app.data.domain)} />
					{/* OPEN GRAPH */}
					<meta property="og:title" content={(this.props.product.detail.title !== undefined && !Utils.isEmpty(this.props.product.detail.title)) ? this.props.product.detail.title : this.props.app.data.configs.faviconTitle} />
					<meta property="og:description" content={(this.state.productDescriptionSeo !== undefined && !Utils.isEmpty(this.state.productDescriptionSeo)) ? this.state.productDescriptionSeo : this.props.product.description} />
					<meta property="og:url" content={(this.props.product.url !== undefined) ? ('https://' + this.props.app.data.domain + this.props.product.url) : ('https://' + this.props.app.data.domain)} />
					<meta property="og:type" content="product" />
					<meta property="og:image" content={(this.props.product.photos !== null && this.props.product.photos !== undefined && this.props.product.photos.length > 0) ? Utils.constants.HOST_CDN_AWS + '/thumbs/' + this.props.product.photos[0].description : ''} />
					<meta property="og:locale" content="es_MX" />
					{/* TWITTER */}
					<meta property="twitter:title" content={(this.props.product.detail.title !== undefined && !Utils.isEmpty(this.props.product.detail.title)) ? this.props.product.detail.title : this.props.app.data.configs.faviconTitle} />
					<meta property="twitter:description" content={(this.state.productDescriptionSeo !== undefined && !Utils.isEmpty(this.state.productDescriptionSeo)) ? this.state.productDescriptionSeo : this.props.product.description} />
					<meta property="twitter:url" content={(this.props.product.url !== undefined) ? ('https://' + this.props.app.data.domain + this.props.product.url) : ('https://' + this.props.app.data.domain)} />
					<meta property="twitter:type" content="product" />
					<meta property="twitter:image" content={Utils.constants.HOST_CDN_AWS + '/thumbs/' + this.props.product.photos[0].description} />
					<meta property="twitter:locale" content="es_MX" />
					{/* PRODUCT */}
					<meta property="product:sku" content={(this.props.product !== null && this.props.product !== undefined && !Utils.isEmpty(this.props.product)) ? this.props.product.code : ''} />
					<meta property="product:condition" content="new" />
					<meta property="product:brand" content={(this.props.product !== null && this.props.product !== undefined && !Utils.isEmpty(this.props.product)) ? this.props.product.brand.name : ''} />
					<meta property="product:price:currency" content="MXN" />
					<meta property="product:price:amount" content={(this.props.product !== null && this.props.product !== undefined && !Utils.isEmpty(this.props.product)) ? this.props.product.price : ''} />
					<meta property="product:availability" content={(this.props.product !== null && this.props.product !== undefined && !Utils.isEmpty(this.props.product)) ? (this.props.product.stock.status) ? 'inStock' : 'nonStock' : ''} />
					{/* <meta property="product:retailer_item_id" content={(this.props.product !== null && this.props.product !== undefined && !Utils.isEmpty(this.props.product))}/> */}
					{/* META ROBOTS */}
					<meta name="robots" content="index, follow" />
					<meta name="googlebot" content="noimageindex, noarchive" />
				</Head>
				{
					(this.props.breadcrumbs.length > 0) ?
						<Grid container className={`${classes.container} ${classes.breadcrumbs}`}>
							{
								this.props.breadcrumbs.map((breadcrumb, idx) => {
									if (idx === this.props.breadcrumbs.length - 1) {
										return (
											<label>
												<Typography variant="body1" className={classes.breadcrumb} style={{ color: 'gray' }}>{breadcrumb.description}</Typography>
											</label>
										)
									} else {
										return (
											<label>
												<a href={breadcrumb.url} className={classes.breadcrumb} style={{ display: 'inline-block', float: 'left' }}>
													<Typography variant="body1" className={classes.breadcrumb}>{breadcrumb.description}</Typography>
												</a>
												<Icon style={{ display: 'inline-block', float: 'left' }}>keyboard_arrow_right</Icon>
											</label>
										)
									}
								})
							}
						</Grid>
						:
						''
				}
				<Grid container className={classes.container}>
					<Grid item xl={8} lg={8} md={8} sm={12} xs={12} className={classes.imageContainer}>
						<Hidden smDown>
							{
								(this.state.isVertical) ?
									<Grid container>
										<Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
											{
												this.renderThumbs()
											}
										</Grid>
										<Grid item xl={11} lg={11} md={11} sm={11} xs={11}>
											{
												this.renderMainPhoto()
											}
										</Grid>
									</Grid>
									:
									<Grid container>
										<Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
											{
												this.renderMainPhoto()
											}
											{
												this.renderThumbs()
											}
										</Grid>
									</Grid>
							}
						</Hidden>
						<Hidden mdUp>
							{
								(this.state.photos.length > 0) ?
									<MobilePhotos
										photos={this.state.photos}
									/>
									:
									this.renderMainPhoto()
							}
						</Hidden>
					</Grid>
					<Grid item xl={4} lg={4} md={4} sm={12} xs={12} className={classes.infoGrid}>
						<Typography variant="h1" className={classes.title}>{this.props.product.detail.title}</Typography>
						<Typography variant="body2" className={classes.code}>Código: {this.props.product.code}</Typography>
						{
							(this.state.rating > 0) ?
								<div className={classes.ratingContainer}>
									<Rating
										size="large"
										readOnly={true}
										className={classes.ratingComponent}
										value={this.state.rating}
										precision={0.5}
									/>
									<Button variant="text" className={classes.ratingButton}>
										<Typography variant="body2" className={classes.ratingButtonText}>{this.state.comments.length} {(this.state.comments.length === 1) ? 'opinión' : 'opiniones'}</Typography>
									</Button>
								</div>
								:
								''
						}
						<div className={classes.ratingContainer}>
							<Button variant="text" className={classes.ratingButton} onClick={() => {
								this.setState({
									openReviewModal: true
								})
							}}>
								<Typography variant="body2" className={classes.ratingButtonText}>Escribir una opinión</Typography>
							</Button>
						</div>
						{
							(this.props.product.detail.tags.length > 0) ?
								<div>
									{
										this.props.product.detail.tags.map(tag => {
											return (
												<Typography variant="body1" className={classes.tagItem} style={{ backgroundColor: tag.color + '30', color: tag.color }}>{tag.text}</Typography>
											)
										})
									}
								</div>
								:
								''
						}
						<hr className={classes.separatorLine} />
						{
							(this.props.product.percentagePrice > 0) ?
								<>
									{/*
			(this.props.app.data.id === 1) ?
			<div style={{ display: 'inline-block' }}>
			  <img src="/hot-sale.svg" style={{ display: 'inline-block', width: 48, marginBottom: -14, marginRight: 8 }}/>
			</div>
			:
			''
		  */}
									<div className={classes.discountTag}>
										<Typography variant="body1" className={classes.discountText}>{this.props.product.percentagePrice}% de descuento</Typography>
									</div>
								</>
								:
								''
						}
						{
							(this.props.product.bluePoints.status) ?
								<div className={classes.bluePointsTag}>
									<Typography variant="body1" className={classes.bluePointsText}>Gana {Utils.numberWithCommas(this.props.product.bluePoints.win)} puntos</Typography>
								</div>
								:
								''
						}
						{
							(this.props.product.percentagePrice > 0) ?
								<div>
									<Typography variant="body1" className={classes.price}>$ {Utils.numberWithCommas(this.props.product.discountPrice)}</Typography>
									<Typography variant="body2" className={classes.oldPrice}>$ {Utils.numberWithCommas(this.props.product.price)}</Typography>
								</div>
								:
								<div>
									<Typography variant="body1" className={classes.price}>$ {Utils.numberWithCommas(this.props.product.price)}</Typography>
								</div>
						}
						<div>
							<Typography variant="body1" className={classes.priceDescription}>Precio de contado</Typography>
						</div>
						<hr className={classes.separatorLine} />
						<div>
							<Typography variant="body1" className={classes.headerInfoPrice}>Compra con tu CrediVale ®</Typography>
							<Grid container className={classes.infoPriceContainer}>
								<Grid item lg={3} className={classes.iconPriceContainer}>
									<img className={classes.iconPrice} src="./credivale.svg" alt="Pago seguro con Credi Vale" />
								</Grid>
								<Grid item lg={9}>
									<Typography variant="body1" className={classes.descriptionInfoPrice}>Desde <strong style={{ fontWeight: 600 }}>${Utils.numberWithCommas(this.props.product.partialityPrice)}</strong> quincenales</Typography>
									<Typography variant="body1" className={classes.descriptionInfoPrice}>(paga <strong style={{ fontWeight: 600 }}>${Utils.numberWithCommas(this.props.product.creditPrice)}</strong> en <strong style={{ fontWeight: 600 }}>{this.props.product.partiality}</strong> quincenas)</Typography>
								</Grid>
							</Grid>
						</div>
						{
							(this.props.product.bluePoints.win > 0) ?
								<>
									<hr className={classes.separatorLine} />
									<div>
										<Typography variant="body1" className={classes.headerInfoPrice}>Monedero Azul ®</Typography>
										<Grid container className={classes.infoPriceContainer}>
											<Grid item lg={3} className={classes.iconPriceContainer}>
												<img className={classes.iconPrice} src="./monederoazul.svg" alt="Monedero azul" />
											</Grid>
											<Grid item lg={9}>
												<Typography variant="body1" className={classes.descriptionInfoPrice}>Gana <strong style={{ fontWeight: 600 }}>{Utils.numberWithCommas(this.props.product.bluePoints.win)}</strong> puntos en tu Monedero Azul ® para tu siguiente compra.</Typography>
											</Grid>
										</Grid>
									</div>
								</>
								:
								''
						}
						{
							(!this.props.product.uniqueProduct) ?
								<>
									<hr className={classes.separatorLine} />
									{
										(!this.state.loadingProduct && this.state.stock) ?
											<>
												<Grid container className={classes.sizeContainer}>
													<Grid item lg={2}>
														<Typography variant="body1" className={classes.headerInfoPrice}>Talla:</Typography>
													</Grid>
													<Grid item lg={4}>
														<Typography variant="body1" className={classes.selectedSizeIndicator}>{(self.state.selectedSize !== 0) ? self.state.selectedSize : ''}</Typography>
													</Grid>
													<Grid item lg={6}>
														{/*
				  <div className={classes.sizeGuideContainer}>
											<Button variant="text" className={classes.sizeGuideButton}>
												<Typography variant="body2" className={classes.sizeGuideButtonText}>Guía de tallas</Typography>
											</Button>
										</div>
				  */}
													</Grid>
													<Grid item lg={12} sm={12} xs={12}>
														<Grid container>
															{
																(this.state.sizes.length >= 0) ?
																	this.state.sizes.map(function (size, idx) {
																		if (size.quantity === 0) {
																			return (
																				<Grid idx={idx} item lg={2} className={classes.sizeNotAvailableItem}>
																					<Typography variant="body2" className={classes.sizeNotAvailableText}>{size.description}</Typography>
																				</Grid>
																			)
																		} else {
																			return (
																				<Grid idx={idx} item lg={2} className={(self.state.selectedSize === Number(size.size)) ? classes.sizeSelectedItem : classes.sizeItem} onClick={(event) => { self.handleChangeSizes(event, size) }}>
																					<Typography variant="body2" className={classes.sizeAvailableText}>{size.description}</Typography>
																				</Grid>
																			)
																		}
																	})
																	:
																	''
															}
														</Grid>
													</Grid>
												</Grid>
											</>
											:
											<div>
												{
													(this.state.stock) ?
														<Loading />
														:
														<Typography style={{ fontWeight: 500, color: 'red' }} variant="body2">Producto no disponible</Typography>
												}
											</div>
									}
								</>
								:
								<>
									{
										(!this.state.stock) ?
											<Typography style={{ fontWeight: 500, color: 'red' }} variant="body2">Producto no disponible</Typography>
											:
											''
									}
								</>
						}
						<hr className={classes.separatorLine} />
						<Grid container className={classes.modelContainer}>
							{
								(this.props.configs.colors.length > 0) ?
									this.props.configs.colors.map((item, idx) => {
										if (item.color !== undefined && item.code === self.props.product.code) {
											return (
												<>
													<Grid item lg={2}>
														<Typography variant="body1" className={classes.headerInfoPrice}>Color:</Typography>
													</Grid>
													<Grid item lg={10}>
														<Typography variant="body1" className={classes.selectedSizeIndicator}>{item.color.description}</Typography>
													</Grid>
												</>
											)
										}
									})
									:
									''
							}
							<Grid lg={12} sm={12} xs={12}>
								<Grid container>
									{
										(this.props.configs.colors.length > 0) ?
											this.props.configs.colors.map((item, idx) => {
												if (item.color !== undefined) {
													return (
														<Grid item className={(item.code === self.props.product.code) ? classes.modelItemSelected : classes.modelItem} onClick={() => { self.handleChangeColor(idx) }}>
															{
																(item.photos.length > 0) ?
																	<img value={idx} className={classes.modelImage} src={Utils.constants.HOST_CDN_AWS + "/thumbs/" + item.photos[0].description} alt={Utils.constants.HOST_CDN_AWS + "/thumbs/" + item.photos[0].description}></img>
																	:
																	<img value={idx} className={classes.modelImage} src={Utils.getPlaceholderByGender(item.genderCode)} alt=""></img>
															}
														</Grid>

													)
												}
											})
											:
											''
									}
								</Grid>
							</Grid>
						</Grid>
						{/* <hr className={classes.separatorLine} /> */}
						<Grid container className={classes.sizeContainer}>
							{/*
		  <Grid item lg={12}>
							<Typography variant="body1" className={classes.headerInfoPrice}>Cantidad:</Typography>
						</Grid>
						<Grid item lg={12}>
							<QuantityControl data={1} changeQuantity={() => changeQuantity()} />
						</Grid>
		  */}
							<Grid item lg={12}>
								{
									(this.state.totalAvailable !== null) ?
										(this.state.totalAvailable !== 0) ?
											(this.state.totalAvailable === 1) ?
												<Typography variant="body2" className={classes.availableMessage}>Solo 1 disponible.</Typography>
												:
												(this.state.totalAvailable < 10) ?
													<Typography variant="body2" className={classes.availableMessage}>{this.state.totalAvailable} disponibles.</Typography>
													:
													''
											:
											<Typography variant="body2" className={classes.availableMessage}>No hay disponibilidad.</Typography>
										:
										''
								}
							</Grid>
						</Grid>
						<hr className={classes.separatorLine} />
						<Grid container>
							{
								(!this.props.product.uniqueProduct) ?
									<>
										{
											(!this.state.loadingProduct && this.state.stock) ?
												this.renderBuyButtons()
												:
												''
										}
									</>
									:
									<>
										{
											(!this.state.loadingProduct && this.state.stock) ?
												this.renderBuyButtons()
												:
												''
										}
									</>
							}
							{
								(this.state.location !== null && this.state.stock) ?
									<>
										<Grid container className={classes.sizeContainer} style={{ marginTop: 16 }}>
											<Grid item lg={12} sm={12} xs={12}>
												<Typography variant="body1" className={classes.headerInfoPrice}>Fecha estimada de entrega</Typography>
											</Grid>
											<Grid item lg={12} sm={12} xs={12}>
												<img src="../../truck.svg" className={classes.iconLocation} alt="truck" />
												<Typography variant="body2" className={classes.messageLocation} style={{ color: this.state.location.color }}>{this.state.location.description}</Typography>
												<Typography variant="body2" className={classes.secondaryMessageLocation}>Comprando en este momento.</Typography>
											</Grid>
										</Grid>
									</>
									:
									''
							}
							<Grid item lg={12} style={{ paddingTop: 16 }}>
								{
									(!this.props.product.uniqueProduct) ?
										<>
											{
												(!this.state.loadingProduct && this.state.stock) ?
													this.renderSearchInStoresButton()
													:
													''
											}
										</>
										:
										<>
											{
												(!this.state.loadingProduct && this.state.stock) ?
													this.renderSearchInStoresButton()
													:
													''
											}
										</>
								}
								<Button variant="text" className={classes.actionButton} onClick={() => {
									this.setState({
										openShareModal: true
									})
								}}>
									<img className={classes.actionButtonIcon} src="../../share.svg" alt="Compartir producto" />
									<Typography variant="body2" className={classes.actionButtonText}>Compartir</Typography>
									<br />
								</Button>
								<Button variant="text" className={classes.actionButton} onClick={this.handleOpenWhatsApp}>
									<img className={classes.actionButtonIcon} src="../../message.svg" alt="Enviar mensaje por whatsapp" />
									<Typography variant="body2" className={classes.actionButtonText}>Enviar mensaje</Typography>
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Grid container className={`${classes.container} ${classes.featuresContainer}`}>
					<Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
						<Typography variant="h2" className={classes.title}>Características</Typography>
						<Table>
							<TableBody>
								<TableRow>
									<TableCell className={classes.textFeature}><strong>Marca</strong></TableCell>
									<TableCell className={classes.textFeature}>{this.props.product.brand.name}</TableCell>
								</TableRow>
								{
									this.props.product.detail.features.map(feature => {
										return (
											<TableRow>
												<TableCell className={classes.textFeature}><strong>{feature.description}</strong></TableCell>
												<TableCell className={classes.textFeature}>{feature.value}</TableCell>
											</TableRow>
										)
									})
								}
							</TableBody>
						</Table>
					</Grid>
				</Grid>
				{
					(!Utils.isEmpty(this.props.product.detail.description)) ?
						<Grid container className={`${classes.container} ${classes.featuresContainer}`}>
							<Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
								<Typography variant="h2" className={classes.title}>Descripción</Typography>
								<div class="editor">
									<Typography variant="h2" className={classes.subtitle} dangerouslySetInnerHTML={{ __html: this.state.description }} ></Typography>
								</div>
							</Grid>
						</Grid>
						:
						''
				}
				{
					(this.state.comments.length > 0) ?
						<Grid container className={`${classes.container} ${classes.featuresContainer}`}>
							<Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
								<Typography variant="h2" className={classes.title}>Opiniones sobre este producto</Typography>
								<Grid container style={{ marginTop: 8 }}>
									{
										this.state.comments.map(comment => {
											return (
												<div style={{ paddingTop: 16 }}>
													<Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
														<Typography variant="body1"><strong>Autor:</strong> {comment.user}</Typography>
														<div style={{ marginLeft: -3, paddingTop: 4 }}>
															<Rating
																readOnly={true}
																className={classes.ratingComponent}
																value={comment.rating}
																precision={0.5}
															/>
														</div>
													</Grid>
													<Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
														<div style={{ paddingTop: 32 }}>
															{
																comment.photos.map(photo => {
																	return (
																		<a href={photo.url} target="_blank" style={{ paddingRight: 8 }}>
																			<img style={{ height: 200, width: 'auto' }} src={photo.url} alt={comment.title || ''} width={photo.width || ''} height={photo.height || ''} />
																		</a>
																	)
																})
															}
														</div>
													</Grid>
													<Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
														<Typography variant="body1"><strong>{comment.title}</strong></Typography>
														<Typography variant="body2">{comment.message}</Typography>
														{/*<Typography variant="body2">{comment.updatedAt}</Typography>*/}
														<hr style={{ opacity: 0.2 }} />
													</Grid>
												</div>
											)
										})
									}
								</Grid>
							</Grid>
						</Grid>
						:
						''
				}
				{
					(this.state.user !== null) ?
						<>
							<div className={classes.container} style={{ marginTop: 24 }}>
								<TextBlock configs={{
									title: "Recomendaciones.",
									message: "",
									cta: null
								}}
								/>
								<ProductsBlock type="recomendations" />
							</div>
							<div className={classes.container} style={{ marginTop: 24, marginBottom: 24 }}>
								<TextBlock configs={{
									title: "Vistos recientemente.",
									message: "",
									cta: null
								}}
								/>
								<ProductsBlock type="seen" />
							</div>
						</>
						:
						''
				}
				{
					(this.props.product !== undefined && this.props.product.detail !== undefined) ?
						<ReviewModal
							open={this.state.openReviewModal}
							host={Utils.constants.CONFIG_ENV.HOST}
							data={this.props.product}
							closeWithSuccess={() => {
								this.setState({
									openReviewModal: false,
									openSnack: true,
									messageSnack: '¡Gracias por enviar tu opinión!'
								})
							}}
							close={() => { this.setState({ openReviewModal: false }) }}
						/>
						:
						''
				}
				<ShareModal
					open={this.state.openShareModal}
					url={this.props.product.url}
					close={() => { this.setState({ openShareModal: false }) }}
				/>
				{
					(this.state.locatorData !== undefined && this.state.locatorData !== null) ?
						<LocatorModal
							open={this.state.openLocatorModal}
							host={Utils.constants.CONFIG_ENV.HOST}
							data={this.state.locatorData}
							openHotShopping={this.handleOpenHotShoppingModal}
							close={() => { this.setState({ openLocatorModal: false, locatorData: null }) }}
						/>
						:
						''
				}

				<HotShoppingNew
					open={this.state.openHotShoppingModal}
					product={this.props.product}
					fromClickAndCollect={this.state.fromClickAndCollect}
					selection={{
						size: (this.state.locatorStoreSize === 0) ? this.state.selectedSize : this.state.locatorStoreSize,
						article: this.state.selectedArticle,
						measurement: this.state.selectedSize.description
					}}
					handleClose={() => this.setState({ openHotShoppingModal: false, fromClickAndCollect: false })} />

				<Snackbar
					autoHideDuration={5000}
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
					open={this.state.openSnack}
					onClose={() => this.setState({ openSnack: false, messageSnack: '' })}
					message={
						<span>{this.state.messageSnack}</span>
					}
					action={
						(this.state.clickFrom === 'addToShoppingCart') ?
							[
								<Button
									key="close"
									aria-label="Close"
									color="inherit"
									onClick={() => { this.openShoppingCart() }}
								>
									<Icon style={{ color: '#91E577', fontSize: 14, paddingRight: 8 }}>shopping_cart</Icon> <span style={{ color: '#91E577', fontSize: 14 }}>VER CARRITO</span>
								</Button>,
								<IconButton
									key="close"
									aria-label="Close"
									color="inherit"
									onClick={() => this.setState({ openSnack: false, clickFrom: '', messageSnack: '' })}
								>
									<CloseIcon />
								</IconButton>
							]
							:
							<>
								{
									(this.state.clickFrom === 'login') ?
										[
											<Button
												key="close"
												aria-label="Close"
												color="inherit"
												onClick={() => { Router.push(Utils.constants.paths.login) }}
											>
												<span style={{ fontSize: 14 }}>INGRESAR</span>
											</Button>,
											<IconButton
												key="close"
												aria-label="Close"
												color="inherit"
												onClick={() => this.setState({ openSnack: false, clickForm: '', messageSnack: '' })}
											>
												<CloseIcon />
											</IconButton>
										]
										:
										<IconButton
											key="close"
											aria-label="Close"
											color="inherit"
											onClick={() => this.setState({ openSnack: false, clickForm: '', messageSnack: '' })}
										>
											<CloseIcon />
										</IconButton>
								}
							</>
					}
				/>
			</>
		)
	}



}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
	return {
		addProductToShoppingCart: (product) => {
			dispatch(addProductToShoppingCart(product))
		},
		openShoppingCart: (show) => {
			dispatch(openShoppingCart(show))
		},
		getDeliveryAddress: () => {
			dispatch(getDeliveryAddress())
		},
		updateAllProductFrontShoppingCart: (shoppingCart) => {
			dispatch(updateAllProductFrontShoppingCart(shoppingCart))
		}
	}
}

export default compose(
	withStyles(styles),
	connect(mapStateToProps, mapDispatchToProps)
)(ProductPage)
