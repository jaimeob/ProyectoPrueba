'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Router from 'next/router'
import sanitizeHtml from 'sanitize-html'

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

import {
	SideBySideMagnifier,
	TOUCH_ACTIVATION
} from "react-image-magnifiers"

import MobilePhotos from '../../components/MobilePhotos'

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
	selectedPriceIndicator: {
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

class GiftCardView extends Component {
	constructor(props) {
		super(props)

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
			description: '',
			blocks: [],
			uuidCAPIFacebook: null,
			selectedPhoto: '',
			tags: [
				{
					text: 'Exclusivo en línea',
					color: '#EA121D'
				}
			],
			prices: [
				{
					description: '$200 M.N.',
					value: 200
				},
				{
					description: '$300 M.N.',
					value: 300
				},
				{
					description: '$500 M.N.',
					value: 500
				},
				{
					description: '$1,000 M.N.',
					value: 1000
				},
				{
					description: '$5,000 M.N.',
					value: 5000
				}
			],
			rating: 0,
			comments: [],
			selectedPrice: 200,
			clickFrom: '',
			colors: [],
			colorIdx: '',
			imageMagnifyWorking: true,
			openHotShoppingModal: false,
			fromClickAndCollect: false,
			photos: []
		}

		this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
		this.loadReviews = this.loadReviews.bind(this)
		this.handleOpenWhatsApp = this.handleOpenWhatsApp.bind(this)
		this.loadData = this.loadData.bind(this)
		this.handleChangePrice = this.handleChangePrice.bind(this)
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
			this.setState({
				user: user
			})
		}
		// First time
		this.loadData()
	}

	handleChangePrice(event, option) {
		event.preventDefault()
		let price = Number(option.value)
		this.setState({
			selectedPrice: price
		})
	}

	async loadData() {
		this.setState({ loadingProduct: false, selectedPhoto: '' })
		Utils.scrollTop()
		//this.loadReviews()
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
				"value": this.props.product.price
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
								"content_type": 'ProductDetail',
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

		this.setState({
			photos: [],
			selectedPhoto: '',
			colorIdx: 0
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
				<Grid item lg={12} sm={12} xs={12}>
					<Button variant="contained" className={classes.buyNowButton} style={{ width: '100%' }} onClick={(event) => {
						event.preventDefault()
						if (!Utils.isUserLoggedIn()) {
							this.setState({ openSnack: true, messageSnack: 'Es necesario iniciar sesión.', clickFrom: 'login' })
							return
						}

						if (this.state.totalAvailable !== null) {
							this.setState({ openHotShoppingModal: true })
						}
						else {
							this.setState({ openSnack: true, messageSnack: 'Selecciona una talla.' })
						}
					}}>
						<Typography variant="body1" className={classes.buyNowButtonText}>
							Comprar ahora
						</Typography>
					</Button>
				</Grid>
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
				<Grid container className={classes.container}>
					<Grid item xl={7} lg={7} md={7} sm={12} xs={12} className={classes.imageContainer}>
						<Hidden smDown>
							<Grid container>
								<Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
									{
										//this.renderMainPhoto()
									}
								</Grid>
							</Grid>
						</Hidden>
						<Hidden mdUp>
							{
								(this.state.photos.length > 0) ?
									<MobilePhotos
										photos={this.state.photos}
									/>
									:
									'this.renderMainPhoto()'
							}
						</Hidden>
					</Grid>
					<Grid item xl={5} lg={5} md={5} sm={12} xs={12} className={classes.infoGrid}>
						<Typography variant="h1" className={classes.title}>Tarjeta de Regalo Digital Calzzapato</Typography>
						<Typography variant="body2" className={classes.code}></Typography>
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
							(this.state.tags.length > 0) ?
								<div>
									{
										this.state.tags.map(tag => {
											return (
												<Typography variant="body1" className={classes.tagItem} style={{ backgroundColor: tag.color + '30', color: tag.color }}>{tag.text}</Typography>
											)
										})
									}
								</div>
								:
								''
						}
						{/*<hr className={classes.separatorLine} />*/}
						{/*
							(this.props.product.percentagePrice > 0) ?
							<div className={classes.discountTag}>
                <Typography variant="body1" className={classes.discountText}>{this.props.product.percentagePrice}% de descuento</Typography>
              </div>
              :
              ''
            */}
						{/*
							(this.props.product.bluePoints.status) ?
							<div className={classes.bluePointsTag}>
                <Typography variant="body1" className={classes.bluePointsText}>Gana {Utils.numberWithCommas(this.props.product.bluePoints.win)} puntos</Typography>
              </div>
              :
              ''
            */}
						{/*
							(this.props.product.percentagePrice > 0) ?
              <div>
                <Typography variant="body1" className={classes.price}>$ {Utils.numberWithCommas(this.props.product.discountPrice)}</Typography>
                <Typography variant="body2" className={classes.oldPrice}>$ {Utils.numberWithCommas(this.props.product.price)}</Typography>
              </div>
							:
							<div>
								<Typography variant="body1" className={classes.price}>$ {Utils.numberWithCommas(this.props.product.price)}</Typography>
							</div>
            */}
						<div>
							<Typography variant="body1" className={classes.priceDescription}>Precio de contado</Typography>
						</div>
						{
							<>
								<hr className={classes.separatorLine} />
								{
									(!this.state.loadingProduct) ?
										<>
											<Grid container className={classes.sizeContainer}>
												<Grid item lg={2}>
													<Typography variant="body1" className={classes.headerInfoPrice}>Saldo:</Typography>
												</Grid>
												<Grid item lg={4}>
													<Typography variant="body1" className={classes.selectedPriceIndicator}>{(self.state.selectedPrice !== 0) ? '$' + Utils.numberWithCommas(self.state.selectedPrice) + ' M.N.' : ''}</Typography>
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
															(this.state.prices.length >= 0) ?
																this.state.prices.map(function (price, idx) {
																	return (
																		<Grid idx={idx} item lg={3} className={(self.state.selectedPrice === Number(price.value)) ? classes.sizeSelectedItem : classes.sizeItem} onClick={(event) => { self.handleChangePrice(event, price) }}>
																			<Typography variant="body2" className={classes.sizeAvailableText}>{price.description}</Typography>
																		</Grid>
																	)
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
											<Loading />
										</div>
								}
							</>
						}
						<hr className={classes.separatorLine} />
						<Grid container className={classes.modelContainer}>
							{
								(false) ?
									this.props.configs.colors.map((item, idx) => {
										if (item.color !== undefined && item.code === self.props.product.code) {
											return (
												<>
													<Grid item lg={2}>
														<Typography variant="body1" className={classes.headerInfoPrice}>Color:</Typography>
													</Grid>
													<Grid item lg={10}>
														<Typography variant="body1" className={classes.selectedPriceIndicator}>{item.color.description}</Typography>
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
										(false) ?
											this.props.configs.colors.map((item, idx) => {
												if (item.color !== undefined) {
													return (
														<Grid item className={(item.code === self.props.product.code) ? classes.modelItemSelected : classes.modelItem} onClick={() => { self.handleChangeColor(idx) }}>
															{
																(item.photos.length > 0) ?
																	<img value={idx} className={classes.modelImage} src={Utils.constants.HOST_CDN_AWS + "/thumbs/" + item.photos[0].description}></img>
																	:
																	<img value={idx} className={classes.modelImage} src={Utils.getPlaceholderByGender(item.genderCode)}></img>
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
								(!this.state.loadingProduct) ?
									<>
										{
											this.renderBuyButtons()
										}
									</>
									:
									<>
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
												<img src="../../truck.svg" className={classes.iconLocation} />
												<Typography variant="body2" className={classes.messageLocation} style={{ color: this.state.location.color }}>{this.state.location.description}</Typography>
												<Typography variant="body2" className={classes.secondaryMessageLocation}>Comprando en este momento.</Typography>
											</Grid>
										</Grid>
									</>
									:
									''
							}
							<Grid item lg={12} style={{ paddingTop: 16 }}>
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
									<TableCell className={classes.textFeature}><strong>Distribuida por:</strong></TableCell>
									<TableCell className={classes.textFeature}>Calzzapato.com</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</Grid>
				</Grid>
				{
					(false) ?
						<Grid container className={`${classes.container} ${classes.featuresContainer}`}>
							<Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
								<Typography variant="h2" className={classes.title}>Descripción</Typography>
								<div dangerouslySetInnerHTML={{ __html: this.state.description }}
									class="editor"
								></div>
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
					url="/tarjeta-regalo"
					close={() => { this.setState({ openShareModal: false }) }}
				/>
				{
					(this.state.locatorData !== null) ?
						<LocatorModal
							open={this.state.openLocatorModal}
							host={Utils.constants.CONFIG_ENV.HOST}
							data={this.state.locatorData}
							close={() => { this.setState({ openLocatorModal: false, locatorData: null }) }}
						/>
						:
						''
				}
				<HotShoppingNew open={this.state.openHotShoppingModal} product={this.props.product} fromClickAndCollect={this.state.fromClickAndCollect} selection={{
					size: this.state.selectedPrice,
					article: this.state.selectedArticle,
					measurement: this.state.selectedPrice.description
				}} handleClose={() =>
					this.setState({
						openHotShoppingModal: false,
						fromClickAndCollect: false
					})
				}
				/>
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
)(GiftCardView)
