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
        padding: theme.spacing.unit * 5,
        [theme.breakpoints.down('xs')]: {
            background: 'white',
            width: '90%',
            height: '100%',
            paddingTop: '20%',
            paddingLeft: '5%',
            paddingRight: '5%'
        }
    },
    first: {
        paddingRight: 32,
        [theme.breakpoints.down('sm')]: {
            padding: 0
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
    largeTextField: {
        width: '100%',
        marginTop: 12
    },
    actions: {
        float: 'right',
        marginTop: 32
    },
    primaryButton: {
        marginLeft: 16,
        fontWeight: 600,
        fontSize: 14
    },
    textFieldLarge: {
        width: '100%'
    },
    title: {
        marginTop: 8
    }
})

class CreateBannerBlock extends Component {
    constructor(props) {
        super(props)
        this.state = {
            openSnack: false,
            messageSnack: '',
            blockTypeId: null,
            blockId: null,
            title: '',
            description: '',
            identifier: '',
            withBanner: false,
            withQuery: false,
            urlDesktopBanner: '',
            urlMobileBanner: '',
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
            orderOptions: [
                { value: 'priceLowToHight', label: 'Precio: menor a mayor', order: 'price ASC' },
                { value: 'priceHightToLow', label: 'Precio: mayor a menor', order: 'price DESC' },
                { value: 'brandNameASC', label: 'Marca: A - Z', order: 'name ASC' },
                { value: 'brandNameDESC', label: 'Marca: Z - A', order: 'name DESC' },
                { value: 'bestOffer', label: 'Mejor oferta', order: 'savingPrice DESC' }
            ]
        }
        this.handleChangeTitle = this.handleChangeTitle.bind(this)
        this.handleChangeURLDesktopBanner = this.handleChangeURLDesktopBanner.bind(this)
        this.handleChangeURLMobileBanner = this.handleChangeURLMobileBanner.bind(this)
        this.handleChangeCallToAction = this.handleChangeCallToAction.bind(this)
        this.clearData = this.clearData.bind(this)
        this.handleRender = this.handleRender.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.handleCloseWithData = this.handleCloseWithData.bind(this)
        this.handleChangeDescription = this.handleChangeDescription.bind(this)
        this.handleChangeIdentifier = this.handleChangeIdentifier.bind(this)
        this.handleChangeWithBanner = this.handleChangeWithBanner.bind(this)
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
    }

    async loadData() {
        let response = await requestAPI({
            host: Utils.constants.HOST,
            resource: 'blocks',
            endpoint: '/options',
            method: 'GET'
        })
        let data = response.data

        this.setState({
            categories: data.categories,
            brands: data.brands
        })
    }

    componentWillMount() {
        this.loadData()
    }

    handleChangeTitle(event) {
        this.setState({
            title: event.target.value
        })
    }

    handleChangeDescription(event) {
        this.setState({
            description: event.target.value
        })
    }

    handleChangeIdentifier(event) {
        this.setState({
            identifier: event.target.value
        })
    }

    handleChangeWithBanner(event) {
        let checked = event.target.checked

        if (checked) {
            this.setState({
                withBanner: checked
            })
        } else {
            this.setState({
                withBanner: checked,
                urlDesktopBanner: '',
                urlMobileBanner: '',
                callToAction: ''
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

    handleChangeURLDesktopBanner(event) {
        this.setState({
            urlDesktopBanner: event.target.value.trim()
        })
    }

    handleChangeURLMobileBanner(event) {
        this.setState({
            urlMobileBanner: event.target.value.trim()
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
        let productLimit = event.target.value.trim()

        this.setState({
            productLimit: productLimit
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

    async handleCloseWithData() {
        if (this.state.identifier.length <= 0) {
            this.setState({
                openSnack: true,
                messageSnack: 'El nombre identificador del bloque es obligatorio. Añade un nombre que identifique al nuevo bloque.'
            })
            return
        }

        if (this.state.withBanner) {
            if (this.state.urlDesktopBanner.length <= 0) {
                this.setState({
                    openSnack: true,
                    messageSnack: 'La url de la imagen desktop es obligatoria.'
                })
                return
            } else {
                let responseLoadImage = await Utils.loadImage(this.state.urlDesktopBanner)

                if (responseLoadImage === undefined) {
                    this.setState({
                        openSnack: true,
                        messageSnack: 'Imagen desktop incorrecta. Revisa la URL de la imagen desktop.'
                    })
                    return
                }

                if (responseLoadImage.width > 1280) {
                    this.setState({
                        openSnack: true,
                        messageSnack: 'Ancho de la imagen no recomendado. Ajusta las medidas del banner para desktop (Ancho: 1280).'
                    })
                    return
                }

                if (!this.state.urlDesktopBanner.match(/.(jpeg|gif)$/i)) {
                    this.setState({
                        openSnack: true,
                        messageSnack: 'El formato de la imagen debe ser .jpeg o .gif'
                    })
                    return
                }
            }

            if (this.state.urlMobileBanner.length <= 0) {
                this.setState({
                    openSnack: true,
                    messageSnack: 'La url de la imagen móvil es obligatoria.'
                })
                return
            } else {
                let responseLoadImage = await Utils.loadImage(this.state.urlMobileBanner)

                if (responseLoadImage === undefined) {
                    this.setState({
                        openSnack: true,
                        messageSnack: 'Imagen móvil incorrecta. Revisa la URL de la imagen móvil.'
                    })
                    return
                }

                if (responseLoadImage.width > 640) {
                    this.setState({
                        openSnack: true,
                        messageSnack: 'Ancho de la imagen no recomendado. Ajusta las medidas del banner para móvil (Ancho: 640).'
                    })
                    return
                }

                if (!this.state.urlDesktopBanner.match(/.(jpeg|gif)$/i)) {
                    this.setState({
                        openSnack: true,
                        messageSnack: 'El formato de la imagen debe ser .jpeg o .gif'
                    })
                    return
                }
            }

            if (this.state.callToAction <= 0) {
                this.setState({
                    openSnack: true,
                    messageSnack: 'La url del call to action es obligatoria.'
                })
                return
            }
        }

        if (this.state.withQuery) {
            if (!this.state.withCategory && !this.state.withBrand && !this.state.withDiscount) {
                this.setState({
                    openSnack: true,
                    messageSnack: 'Selecciona al menos una opción para formar una nueva query'
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

            if (Utils.isEmpty(this.state.selectedOrderBy)) {
                this.setState({
                    openSnack: true,
                    messageSnack: 'Selecciona una opción para ordenar productos.'

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
                    messageSnack: 'Faltan agregar productos. Escribe lotes de productos separados por coma.'
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

        if (this.state.selectedCategories.length > 0 && this.state.selectedCategories !== null) {
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

        if (this.state.selectedBrands.length > 0 && this.state.selectedBrands !== null) {
            this.state.selectedBrands.forEach(brand => {
                selectedBrands.push(brand.value)
            })
        }

        let response = null
        let data = {}
        if (this.props.editBlock) {
            if (this.props.landing) {
                data = {
                    blockTypeId: this.state.blockTypeId,
                    title: this.state.title,
                    query: this.state.queryMongo,
                    configs: {
                        banner: {
                            main: this.state.urlDesktopBanner,
                            responsive: this.state.urlMobileBanner
                        },
                        callToAction: this.state.callToAction
                    },
                    description: this.state.description,
                    identifier: this.state.identifier,
                    banner: this.state.withBanner,
                    category: (this.state.withQuery && this.state.withCategory) ? selectedCategories : [],
                    brands: (this.state.withQuery && this.state.withBrand) ? selectedBrands : [],
                    discount: this.state.withDiscount,
                    productsCode: (!this.state.withQuery) ? this.state.productsCode : [],
                    order: this.state.selectedOrderBy.order,
                    productLimit: Number(this.state.productLimit),
                    withQuery: this.state.withQuery,
                    withBrand: this.state.withBrand,
                    withCategory: this.state.withCategory,
                    order: this.props.selectedBlock.order,
                    status: this.props.selectedBlock.status,
                    createdAt: this.props.selectedBlock.createdAt,
                    id: this.props.selectedBlock.id,
                    landingId: this.props.selectedBlock.landingId,
                    instanceId: this.props.selectedBlock.instanceId
                }
            } else {
                data = {
                    blockTypeId: this.state.blockTypeId,
                    title: this.state.title,
                    query: this.state.queryMongo,
                    configs: {
                        banner: {
                            main: this.state.urlDesktopBanner,
                            responsive: this.state.urlMobileBanner
                        },
                        callToAction: this.state.callToAction
                    },
                    description: this.state.description,
                    identifier: this.state.identifier,
                    banner: this.state.withBanner,
                    category: (this.state.withQuery && this.state.withCategory) ? selectedCategories : [],
                    brands: (this.state.withQuery && this.state.withBrand) ? selectedBrands : [],
                    discount: this.state.withDiscount,
                    productsCode: (!this.state.withQuery) ? this.state.productsCode : [],
                    order: this.state.selectedOrderBy.order,
                    productLimit: Number(this.state.productLimit),
                    withQuery: this.state.withQuery,
                    withBrand: this.state.withBrand,
                    withCategory: this.state.withCategory
                }
            }

            response = await requestAPI({
                host: Utils.constants.HOST,
                method: 'PATCH',
                resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
                endpoint: (this.props.landing !== undefined && this.props.landing) ?
                    '/' + this.props.selectedBlock.landingId + '/edit'
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
                this.setState({
                    openSnack: true,
                    messageSnack: Utils.messages.General.error
                })
            }
        } else {
            response = await requestAPI({
                host: Utils.constants.HOST,
                method: 'POST',
                resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
                endpoint: (this.props.landing !== undefined && this.props.landing) ? '/' + this.props.match.params.id + '/new' : '/new',
                data: {
                    title: this.state.title,
                    description: this.state.description,
                    identifier: this.state.identifier,
                    blockTypeId: 22,
                    banner: this.state.withBanner,
                    callToAction: this.state.callToAction,
                    urlDesktopBanner: this.state.urlDesktopBanner,
                    urlMobileBanner: this.state.urlMobileBanner,
                    category: selectedCategories,
                    brands: selectedBrands,
                    discount: this.state.withDiscount,
                    productsCode: this.state.productsCode,
                    order: this.state.selectedOrderBy.order,
                    productLimit: Number(this.state.productLimit),
                    withQuery: this.state.withQuery,
                    withBrand: this.state.withBrand,
                    withCategory: this.state.withCategory
                }
            })

            if (response.status === Utils.constants.status.SUCCESS) {
                if (response.data.added) {
                    this.clearData()
                    this.props.handleCloseWithData()
                }
            } else {
                this.setState({
                    openSnack: true,
                    messageSnack: Utils.messages.General.error
                })
            }
        }
    }

    handleRender() {
        this.clearData()
        if (this.props.editBlock && this.props.selectedBlock !== null) {
            let brands = []
            let categories = []
            let products = ''
            let orderBy = []
            let productsCode = []
            let discount = false

            if (this.props.selectedBlock.discount === undefined) {
                if (this.props.selectedBlock.query.where.discountPrice !== undefined) {
                    discount = true
                }
            } else {
                discount = this.props.selectedBlock.discount
            }

            if (this.props.selectedBlock.brands.length > 0) {
                this.props.selectedBlock.brands.forEach(brandCode => {
                    let brandsFound = this.state.brands.filter(brand => {
                        if (brand.value === brandCode) {
                            return true
                        } else {
                            return false
                        }
                    })

                    brands.push(brandsFound[0])
                })
            }

            if (this.props.selectedBlock.category.length > 0) {
                this.props.selectedBlock.category.forEach(categoryInfo => {
                    let categoriesFound = this.state.categories.filter(category => {
                        if (category.node === categoryInfo.node) {
                            return true
                        } else {
                            return false
                        }
                    })

                    categories.push(categoriesFound[0])
                })
            }

            if (this.props.selectedBlock.query.order !== undefined) {
                orderBy = this.state.orderOptions.filter(option => {
                    if (this.props.selectedBlock.query.order === option.order) {
                        return true
                    } else {
                        return false
                    }
                })
            }

            if (this.props.selectedBlock.query.where.code !== undefined) {
                productsCode = [this.props.selectedBlock.query.where.code]
                products = this.props.selectedBlock.query.where.code

            } else if (this.props.selectedBlock.query.where.or !== undefined) {
                if (this.props.selectedBlock.query.where.or[0].code !== undefined && this.props.selectedBlock.query.where.or.length > 0) {
                    this.props.selectedBlock.query.where.or.forEach(productCode => {
                        productsCode.push(productCode.code)
                    })

                    products = productsCode.join(', ')
                }
            } else if (this.props.selectedBlock.productsCode !== undefined) {
                productsCode = this.props.selectedBlock.productsCode
                products = this.props.selectedBlock.productsCode.join(', ')
            }

            this.setState({
                blockTypeId: this.props.selectedBlock.blockTypeId,
                blockId: this.props.selectedBlock.id,
                queryMongo: this.props.selectedBlock.query,
                identifier: this.props.selectedBlock.identifier,
                title: this.props.selectedBlock.title,
                description: this.props.selectedBlock.description,
                withQuery: this.props.selectedBlock.withQuery,
                urlDesktopBanner: (this.props.selectedBlock.banner) ? this.props.selectedBlock.configs.banner.main : '',
                urlMobileBanner: (this.props.selectedBlock.banner) ? this.props.selectedBlock.configs.banner.responsive : '',
                callToAction: (this.props.selectedBlock.banner) ?
                    ((this.props.selectedBlock.configs.cta !== undefined) ?
                        this.props.selectedBlock.configs.cta.link : this.props.selectedBlock.configs.callToAction) : '',
                productsCode: (this.props.selectedBlock.productLimit <= 0) ? productsCode : [],
                products: (this.props.selectedBlock.productLimit <= 0) ? products : '',
                productLimit: this.props.selectedBlock.productLimit,
                withBanner: this.props.selectedBlock.banner,
                withCategory: (categories.length > 0) ? true : false,
                withBrand: (brands.length > 0) ? true : false,
                withDiscount: discount,
                selectedBrands: brands,
                selectedCategories: categories,
                selectedOrderBy: orderBy[0],
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
            title: '',
            description: '',
            identifier: '',
            callToAction: '',
            withBanner: false,
            withQuery: false,
            urlDesktopBanner: '',
            urlMobileBanner: '',
            withCategory: false,
            withBrand: false,
            withDiscount: false,
            selectedCategories: [],
            selectedBrands: [],
            selectedOrderBy: [],
            productsCode: [],
            products: '',
            productLimit: ''
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
                        <div style={getModalStyle()} className={classes.container}>
                            <Typography variant="h4" className={classes.modalTitle}>
                                Crear nuevo carrusel de productos.
                            </Typography>
                            <Typography variant="body2">
                                Ingresa los datos del nuevo bloque.
                            </Typography>
                            <Grid container style={{ marginTop: 8 }}>
                                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>

                                </Grid>
                                <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                    <Paper className={classes.paper}>
                                        <Grid container>
                                            <Typography variant="body1"><strong>Datos del bloque.</strong></Typography>
                                            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                                <TextField
                                                    className={classes.textFieldLarge}
                                                    style={{ marginBottom: 8 }}
                                                    label="Nombre identificador *"
                                                    placeholder="Nombre identificador..."
                                                    value={this.state.identifier}
                                                    onChange={(event) => { this.handleChangeIdentifier(event) }}
                                                    autoFocus={true}
                                                />
                                                <TextField
                                                    className={classes.textFieldLarge}
                                                    style={{ marginBottom: 8 }}
                                                    label="Título"
                                                    placeholder="El título puede ser opcional..."
                                                    value={this.state.title}
                                                    onChange={(event) => { this.handleChangeTitle(event) }}
                                                />
                                                <TextField
                                                    className={classes.textFieldLarge}
                                                    style={{ marginBottom: 8 }}
                                                    label="Descripción"
                                                    placeholder="La descripción puede ser opcional..."
                                                    value={this.state.description}
                                                    onChange={(event) => { this.handleChangeDescription(event) }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>

                                    <Paper className={classes.paper}>
                                        <Grid container
                                            direction="row"
                                            justify="flex-start"
                                            alignItems="center"
                                            style={{ marginBottom: 8 }}
                                        >
                                            <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                                                <Switch
                                                    checked={this.state.withBanner}
                                                    onChange={(event) => { this.handleChangeWithBanner(event) }}
                                                />
                                            </Grid>
                                            <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                                                <Typography variant="body1"><strong>Incluir banner.</strong></Typography>
                                            </Grid>
                                        </Grid>

                                        {
                                            (this.state.withBanner) ?
                                                <Grid container>
                                                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                                        <Typography variant="body1"><strong>Contenido del banner.</strong></Typography>
                                                    </Grid>
                                                    <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                                                        <TextField
                                                            className={classes.textFieldLarge}
                                                            label="URL imagen desktop .jpeg"
                                                            placeholder="Resolución recomendada: 1280 x 350"
                                                            value={this.state.urlDesktopBanner}
                                                            onChange={(event) => { this.handleChangeURLDesktopBanner(event) }}
                                                        />
                                                    </Grid>
                                                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ padding: 16 }}>
                                                        <a href={this.state.urlDesktopBanner}>
                                                            <img style={{ width: '100%' }} src={this.state.urlDesktopBanner} />
                                                        </a>
                                                    </Grid>
                                                    <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                                                        <TextField
                                                            className={classes.textFieldLarge}
                                                            style={{ marginBottom: 8 }}
                                                            label="URL imagen móvil .jpeg"
                                                            placeholder="Resolución recomendada: 640 x 350"
                                                            value={this.state.urlMobileBanner}
                                                            onChange={(event) => { this.handleChangeURLMobileBanner(event) }}
                                                        />
                                                    </Grid>
                                                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ padding: 16 }}>
                                                        <a href={this.state.urlMobileBanner}>
                                                            <img style={{ width: '100%' }} src={this.state.urlMobileBanner} />
                                                        </a>
                                                    </Grid>
                                                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                                        <TextField
                                                            className={classes.textFieldLarge}
                                                            style={{ marginBottom: 8 }}
                                                            label="Call To Action (URL destino al hacer click) "
                                                            placeholder="Si es una URL interna usar / (diagonal) seguido de la ruta interna."
                                                            value={this.state.callToAction}
                                                            onChange={(event) => { this.handleChangeCallToAction(event) }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                :
                                                ''
                                        }
                                    </Paper>

                                    <Paper className={classes.paper}>
                                        <Grid container
                                            direction="row"
                                            justify="flex-start"
                                            alignItems="center"
                                            style={{ marginBottom: 8 }}
                                        >
                                            <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                                                <Switch
                                                    checked={this.state.withQuery}
                                                    onChange={(event) => { this.handleChangeWithQuery(event) }}
                                                />
                                            </Grid>
                                            <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                                                <Typography variant="body1"><strong>Generar query.</strong></Typography>
                                            </Grid>
                                        </Grid>

                                        {
                                            (this.state.withQuery) ?
                                                <Grid container
                                                    direction="row"
                                                    justify="flex-start"
                                                    alignItems="center"
                                                    style={{ marginBottom: 16 }}
                                                >
                                                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                                                        <Typography variant="body1"><strong>Contenido del query.</strong></Typography>
                                                    </Grid>

                                                    <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
                                                        <Checkbox
                                                            checked={this.state.withCategory}
                                                            onChange={(event) => { this.handleChangeWithCategory(event) }}
                                                            value={'withCategory'}
                                                        />
                                                    </Grid>
                                                    <Grid
                                                        item
                                                        xl={(this.state.withCategory) ? 3 : 11}
                                                        lg={(this.state.withCategory) ? 3 : 11}
                                                        md={(this.state.withCategory) ? 3 : 11}
                                                        sm={(this.state.withCategory) ? 3 : 11}
                                                        xs={(this.state.withCategory) ? 3 : 11}
                                                    >
                                                        <Typography variant="body2"><strong>Categoría</strong></Typography>
                                                    </Grid>
                                                    {
                                                        (this.state.withCategory) ?
                                                            <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                                                                <ReactSelect
                                                                    placeholder={'Seleccionar categorías...'}
                                                                    isMulti
                                                                    options={this.state.categories}
                                                                    noOptionsMessage={() => 'Sin datos...'}
                                                                    onChange={this.handleChangeCategories}
                                                                    defaultValue={
                                                                        (this.props.editBlock && this.props.selectedBlock.category !== undefined)
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

                                                    <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
                                                        <Checkbox
                                                            checked={this.state.withBrand}
                                                            onChange={(event) => { this.handleChangeWithBrand(event) }}
                                                            value={'withBrand'}
                                                        />
                                                    </Grid>
                                                    <Grid
                                                        item
                                                        xl={(this.state.withBrand) ? 3 : 11}
                                                        lg={(this.state.withBrand) ? 3 : 11}
                                                        md={(this.state.withBrand) ? 3 : 11}
                                                        sm={(this.state.withBrand) ? 3 : 11}
                                                        xs={(this.state.withBrand) ? 3 : 11}
                                                    >
                                                        <Typography variant="body2"><strong>Marca</strong></Typography>
                                                    </Grid>

                                                    {
                                                        (this.state.withBrand) ?
                                                            <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                                                                <ReactSelect
                                                                    placeholder={'Seleccionar marcas...'}
                                                                    isMulti
                                                                    options={this.state.brands}
                                                                    noOptionsMessage={() => 'Sin datos...'}
                                                                    onChange={this.handleChangeBrands}
                                                                    defaultValue={
                                                                        (this.props.editBlock && this.props.selectedBlock.brands !== undefined)
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

                                                    <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
                                                        <Checkbox
                                                            checked={this.state.withDiscount}
                                                            onChange={(event) => { this.handleChangeWithDiscount(event) }}
                                                            value={'withDiscount'}
                                                        />
                                                    </Grid>
                                                    <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                                                        <Typography variant="body2"><strong>Con descuento</strong></Typography>
                                                    </Grid>

                                                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 24 }}>
                                                        <ReactSelect
                                                            placeholder="Ordenar por"
                                                            options={[
                                                                { value: 'priceLowToHight', label: 'Precio: menor a mayor', order: 'price ASC' },
                                                                { value: 'priceHightToLow', label: 'Precio: mayor a menor', order: 'price DESC' },
                                                                { value: 'brandNameASC', label: 'Marca: A - Z', order: 'name ASC' },
                                                                { value: 'brandNameDESC', label: 'Marca: Z - A', order: 'name DESC' },
                                                                { value: 'bestOffer', label: 'Mejor oferta', order: 'savingPrice DESC' }
                                                            ]}
                                                            noOptionsMessage={() => 'Sin datos...'}
                                                            onChange={this.handleChangeOrderBy}
                                                            isSearchable={false}
                                                            defaultValue={(this.props.editBlock && this.props.selectedBlock !== undefined)
                                                                ?
                                                                this.state.selectedOrderBy
                                                                :
                                                                false
                                                            }
                                                        />
                                                    </Grid>

                                                    <Grid item xl={8} lg={8} md={8} sm={8} xs={8}>
                                                        <TextField
                                                            className={classes.textFieldLarge}
                                                            style={{ marginBottom: 8, marginTop: 8 }}
                                                            label="Ingresar límite"
                                                            placeholder="Ingresar límite"
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
                                                            placeholder="Ingresar lote y separar por coma"
                                                            value={this.state.products}
                                                            onChange={(event) => { this.handleChangeProductCode(event) }}
                                                        />
                                                    </Grid>

                                                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 24, marginBottom: 16 }}>
                                                        <ReactSelect
                                                            placeholder="Ordenar por"
                                                            options={[
                                                                { value: 'priceLowToHight', label: 'Precio: menor a mayor', order: 'price ASC' },
                                                                { value: 'priceHightToLow', label: 'Precio: mayor a menor', order: 'price DESC' },
                                                                { value: 'brandNameASC', label: 'Marca: A - Z', order: 'name ASC' },
                                                                { value: 'brandNameDESC', label: 'Marca: Z - A', order: 'name DESC' },
                                                                { value: 'bestOffer', label: 'Mejor oferta', order: 'savingPrice DESC' }
                                                            ]}
                                                            noOptionsMessage={() => 'Sin datos...'}
                                                            onChange={this.handleChangeOrderBy}
                                                            isSearchable={false}
                                                            value={this.state.selectedOrderBy}
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
                                    onClick={this.handleCloseWithData}
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
)(CreateBannerBlock)
