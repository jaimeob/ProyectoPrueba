import React, { useState, useEffect } from 'react'
//import { useSelector } from 'react-redux'
// Material
import { Grid, Typography, Checkbox, Button, Modal, FormControl, Select, TextField, Radio, FormControlLabel, RadioGroup, Snackbar, IconButton, Paper } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import ReactSelect from 'react-select'
import { withStyles } from '@material-ui/core/styles'

// Utils
import Utils from '../resources/Utils'
import Loading from './Loading'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({
    container: {
        overflowY: 'scroll',
        maxHeight: 'calc(100vh - 100px)',
        borderRadius: '2px',
        position: 'absolute',
        width: '50%',
        backgroundColor: 'white',
        boxShadow: theme.shadows[5],
        padding: '32px 16px 32px 16px',
        // minHeight: '80%',
        [theme.breakpoints.down('md')]: {
            width: '60%',
        },
        [theme.breakpoints.down('xs')]: {
            width: '90%',
            padding: '16px 16px 16px 16px'
        }
    }
})

function getModalStyle() {
    const top = 50
    const left = 50
    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    }
}

function PersonInformation(props) {
    const { classes } = props
    const [attributes, setAttributes] = useState(null)
    const [brands, setBrands] = useState(null)
    const [businessUnit, setBusinessUnit] = useState(null)
    const [businessUnitSelected, setBusinessUnitSelected] = useState(null)
    const [categories, setCategories] = useState(null)
    const [configSelected, setConfigSelected] = useState({})
    const [loading, setLoading] = useState(false)
    const [messageError, setMessageError] = useState('')
    const [openSnackbar, setOpenSnackbar] = useState(false)
    const [prices, setPrices] = useState([{ id: 1, description: '$0 a $500', status: false }, { id: 2, description: '$500 a $1,000', status: false }, { id: 3, description: '$1,000 a $1,500', status: false }, { id: 4, description: 'Mayor a $1,500', status: false }, { id: 5, description: 'Todos', status: false }])

//const app = useSelector(state => state)

    let loadData = async () => {
        setLoading(true)
        let user = await Utils.getCurrentUser()
        setBusinessUnit(user.accesses)
        if (businessUnitSelected !== null && businessUnitSelected !== undefined) {
            let response = await requestAPI({
                host: Utils.constants.HOST_API_ECOMMERCE,
                resource: 'catalogs',
                endpoint: '/' + businessUnitSelected + '/catalog-categories-brands',
                method: 'GET'
            })
            if (response.status === Utils.constants.status.SUCCESS) {
                if (response.data !== null) {
                    setCategories(response.data.categories)
                    setBrands(response.data.brands)
                    setAttributes(response.data.attributes)
                }
            }
        }
        setLoading(false)
    }

    let createPerson = async () => {
        setLoading(true)
        let pricesToSave = []
        prices.forEach(price => {
            if (price.status) {
                pricesToSave.push(price)
            }
        })
        let validParams = await validateForm()
        if (validParams.valid) {
            let response = await requestAPI({
                host: Utils.constants.HOST,
                method: 'POST',
                resource: 'persons',
                endpoint: '/new',
                data: {
                    businessId: businessUnitSelected,
                    name: configSelected.name,
                    gender: configSelected.gender,
                    age: configSelected.age,
                    prices: pricesToSave,
                    categories: configSelected.categories,
                    brands: configSelected.brands,
                    attributes: configSelected.attributes
                }
            })

            if (response.status === Utils.constants.status.SUCCESS) {
                if (response.data !== null) {
                    props.loadData()
                    handleClose()
                }
            } else {
                await setMessageError('No se pudo crear el perfil')
                setOpenSnackbar(true)
            }
        } else {
            await setMessageError(validParams.messageError)
            setOpenSnackbar(true)
        }
        setLoading(false)
    }

    let validateForm = async () => {
        let response = { valid: false, messageError: '' }
        let error = false

        if (configSelected === null || configSelected === undefined) {
            response.messageError = 'Debes llenar todo el formulario'
            return response
        }
        if (configSelected.name === null || configSelected.name === undefined) {
            response.messageError = 'Hace falta especificar nombre de perfil.'
            error = true
        }

        if (!error && (businessUnitSelected === null || businessUnitSelected === undefined)) {
            response.messageError = 'Hace falta especificar unidad de negocio.'
            error = true
        }

        if (!error && (configSelected.gender === null || configSelected.gender === undefined)) {
            response.messageError = 'Hace falta especificar género.'
            error = true
        }

        if (!error && (configSelected.age === null || configSelected.age === undefined)) {
            response.messageError = 'Hace falta especificar edad.'
            error = true
        }

        if (!error && (configSelected.categories === null || configSelected.categories === undefined || configSelected.attributes.length === 0)) {
            response.messageError = 'Hace falta especificar categorías.'
            error = true
        }

        if (!error && (configSelected.brands === null || configSelected.brands === undefined || configSelected.attributes.length === 0)) {
            response.messageError = 'Hace falta especificar marcas..'
            error = true
        }

        if (!error && (configSelected.attributes === null || configSelected.attributes === undefined || configSelected.attributes.length === 0)) {
            response.messageError = 'Hace falta especificar atributos.'
            error = true
        }
        if (!error) {
            response.valid = true
        }
        return response
    }

    let handleChange = name => event => {
        setBusinessUnitSelected(event.target.value)
    }

    let handleClose = () => {
        setBrands(null)
        setAttributes(null)
        setCategories(null)
        setConfigSelected({})
        setOpenSnackbar(false)
        prices.forEach(price => {
            price.status = false
        })
        setPrices(prices)
        props.handleClose()
    }

    const handleChangeSelected = (event) => {
        changeConfigurationSelected('gender', event.target.value)
    }

    const handleChangeSelectedAge = (event) => {
        changeConfigurationSelected('age', event.target.value)
    }

    const handleChangeName = (event) => {
        changeConfigurationSelected('name', event.target.value)
    }

    const handleChangeCategories = (selectedOption) => {
        changeConfigurationSelected('categories', selectedOption)
    }

    const handleChangeBrands = (selectedOption) => {
        changeConfigurationSelected('brands', selectedOption)
    }

    const handleChangeAttributes = (selectedOption) => {
        changeConfigurationSelected('attributes', selectedOption)
    }

    const handleChangePrices = (id, status) => {
        let pricesObject = JSON.parse(JSON.stringify(prices))
        pricesObject[id].status = status
        setPrices(pricesObject)
    }

    const changeConfigurationSelected = (type, value) => {
        let configurationSelected = configSelected
        configurationSelected[type] = value
        setConfigSelected(configurationSelected)
    }

    useEffect(() => {
        async function anyNameFunction() {
            await loadData()
        }
        anyNameFunction()
    }, [businessUnitSelected])
    return (
        <Modal
            open={props.open}
            onEscapeKeyDown={() => { handleClose() }}
            onBackdropClick={() => { handleClose() }}
        >
            <div>
                <div style={getModalStyle()} className={classes.container}>
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography variant='h6'>Información del perfil</Typography>
                        </Grid>
                        {/* <Grid item xs={12} style={{ marginBottom: '20px' }} >
                            <Typography variant='caption'>Selecciona información para crear el nuevo perfil.</Typography>
                        </Grid> */}

                        <Grid item xs={12}>
                            <Typography variant='h5'>Hola</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Grid container spacing={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }} >
                                <Grid item xs={5}>
                                    <Button onClick={() => { handleClose() }} style={{ marginRight: '10px', }} fullWidth variant='outlined'>Cancelar</Button>
                                </Grid>
                                <Grid item xs={5}>
                                    <Button fullWidth onClick={() => { createPerson() }} style={{ background: '#1b2d63', marginLeft: '10px', color: 'white' }} >Guardar</Button>
                                    {/* <Button onClick={() => { this.createFolio() }} fullWidth style={{ background: '#1b2d63', marginLeft: '20px', color: 'white' }} >
                          Generar
                        </Button> */}
                                </Grid>
                            </Grid>

                        </Grid>
                    </Grid>
                </div>
            </div>
        </Modal>
    )
}

// export default PersonComponentModal
export default withStyles(styles)(PersonInformation)