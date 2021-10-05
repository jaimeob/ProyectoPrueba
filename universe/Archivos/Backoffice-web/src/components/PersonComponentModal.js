import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
// Material
import { Grid, Typography, Checkbox, Button, Modal, FormControl, Select, TextField, Radio, FormControlLabel, RadioGroup, Snackbar, IconButton } from '@material-ui/core'
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

function PersonComponentModal(props) {
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
                <div style={getModalStyle()} className={classes.container}  >
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography variant='h6'>Crear nuevo perfil</Typography>
                        </Grid>
                        <Grid item xs={12} style={{ marginBottom: '20px' }} >
                            <Typography variant='caption'>Selecciona información para crear el nuevo perfil.</Typography>
                        </Grid>
                        <Grid item xs={12} >
                            <Typography style={{ fontWeight: '700' }} variant='subtitle1'>Nombre</Typography>
                        </Grid>
                        <Grid item xs={8} style={{ marginBottom: '10px' }} >
                            <TextField autoFocus fullWidth onChange={handleChangeName} />
                        </Grid>
                        <Grid item xs={12} >
                            <Typography style={{ fontWeight: '700' }} variant='subtitle1'>Unidad de negocio</Typography>
                        </Grid>
                        <Grid item xs={8} >
                            {
                                (businessUnit !== null && businessUnit !== undefined) ?
                                    <FormControl fullWidth variant="outlined" className={classes.formControl}>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            native
                                            onChange={handleChange()}
                                        // value={age}
                                        >
                                            <option value="" />
                                            {
                                                businessUnit.map((element) => {
                                                    return (<option value={element.name} > { element.description} </option>)
                                                })
                                            }
                                        </Select>
                                    </FormControl>
                                    :
                                    ''
                            }
                        </Grid>
                        {
                            (!loading) ?
                                <div style={{ width: '100%' }} >
                                    <Grid item xs={12} >
                                        <Typography style={{ fontWeight: '700' }} variant='subtitle1'>Género</Typography>
                                    </Grid>
                                    <Grid item xs={12} >
                                        <RadioGroup style={{ display: 'inline-block' }} onChange={handleChangeSelected} >
                                            <FormControlLabel value="men" control={<Radio color="primary" />} label="Hombre" />
                                            <FormControlLabel value="women" control={<Radio color="primary" />} label="Mujer" />
                                            <FormControlLabel value="both" control={<Radio color="primary" />} label="Ambos" />
                                        </RadioGroup>
                                    </Grid>
                                    <Grid item xs={12} >
                                        <Typography style={{ fontWeight: '700' }} variant='subtitle1'>Rango de edad</Typography>
                                    </Grid>
                                    <Grid item xs={12} >
                                        <RadioGroup style={{ display: 'inline-block' }} onChange={handleChangeSelectedAge} >
                                            <FormControlLabel value="25" control={<Radio color="primary" />} label="Menores a 25 años" />
                                            <FormControlLabel value="25-35" control={<Radio color="primary" />} label="de 25 a 35 años" />
                                            <FormControlLabel value="35" control={<Radio color="primary" />} label="Mayores de 35 años" />
                                        </RadioGroup>

                                    </Grid>
                                    {
                                        (categories !== null && categories !== undefined && categories.length > 0) ?
                                            <div style={{ width: '100%' }} >
                                                <Grid item xs={12} >
                                                    <Typography style={{ fontWeight: '700' }} variant='subtitle1'>Categoría</Typography>
                                                </Grid>
                                                <Grid item xs={12} >
                                                    <ReactSelect
                                                        // placeholder={this.state.loadingInfo ? 'Cargando categorías...' : 'Seleccionar categorías...'}
                                                        isMulti
                                                        options={categories}
                                                        noOptionsMessage={() => 'Sin datos...'}
                                                        onChange={handleChangeCategories}
                                                    // value={this.state.selectedCategories}
                                                    />
                                                </Grid>
                                            </div>
                                            :
                                            ''
                                    }
                                    {
                                        (brands !== null && brands !== undefined && brands.length > 0) ?
                                            <div style={{ width: '100%' }} >
                                                <Grid item xs={12} >
                                                    <Typography style={{ fontWeight: '700' }} variant='subtitle1'>Marca</Typography>
                                                </Grid>
                                                <Grid item xs={12} >
                                                    <Grid item xs={12} >
                                                        <ReactSelect
                                                            // placeholder={this.state.loadingInfo ? 'Cargando categorías...' : 'Seleccionar categorías...'}
                                                            isMulti
                                                            options={brands}
                                                            noOptionsMessage={() => 'Sin datos...'}
                                                            onChange={handleChangeBrands}
                                                        // value={this.state.selectedCategories}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </div>
                                            :
                                            ''
                                    }
                                    {
                                        (attributes !== null && attributes !== undefined && attributes.length > 0) ?
                                            <div style={{ width: '100%' }} >
                                                <Grid item xs={12} >
                                                    <Typography style={{ fontWeight: '700' }} variant='subtitle1'>Atributos</Typography>
                                                </Grid>
                                                <Grid item xs={12} >
                                                    <Grid item xs={12} >
                                                        <ReactSelect
                                                            // placeholder={this.state.loadingInfo ? 'Cargando categorías...' : 'Seleccionar categorías...'}
                                                            isMulti
                                                            options={attributes}
                                                            noOptionsMessage={() => 'Sin datos...'}
                                                            onChange={handleChangeAttributes}
                                                        // value={this.state.selectedCategories}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </div>
                                            :
                                            ''
                                    }
                                    <Grid item xs={12} >
                                        <Typography style={{ fontWeight: '700' }} variant='subtitle1'>Precios</Typography>
                                    </Grid>
                                    <Grid item xs={12} >
                                        {
                                            prices.map((element, idx) => {
                                                return (<FormControlLabel
                                                    control={<Checkbox onClick={() => { handleChangePrices(idx, !prices[idx].status) }} checked={element.status} name="checkedA" />}
                                                    label={element.description}
                                                />)
                                            })
                                        }
                                    </Grid>
                                </div>
                                :
                                <Grid item xs={12} >
                                    <Grid container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20vh' }} >
                                        <Grid item xs={1} >
                                            <Loading></Loading>
                                        </Grid>
                                    </Grid>
                                </Grid>
                        }
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
                <Snackbar
                    open={openSnackbar}
                    message={messageError}
                    key={'top', 'center'}
                    anchorOrigin={{vertical: 'top',horizontal: 'center'}}
                    resumeHideDuration={3000}
                    action={[
                        <IconButton
                          key="close"
                          aria-label="Close"
                          color="inherit"
                          onClick={ ()=> { setOpenSnackbar(false) } }
                        >
                          <CloseIcon />
                        </IconButton>
                      ]}
                />
            </div>
        </Modal>
    )
}

// export default PersonComponentModal
export default withStyles(styles)(PersonComponentModal)