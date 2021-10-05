import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Actions
import Utils from '../resources/Utils'
import Title from '../components/Title'
import { Paper, Grid, TextField, Button } from '@material-ui/core'
import CategoryExplorer from '../components/CategoryExplorer'
import { requestAPI } from '../api/CRUD.js'

const styles = theme => ({
  container: {
    [theme.breakpoints.down('sm')]: {
      padding: 0,
      paddingTop: 32
    }
  },
  first: {
    paddingRight: 32,
    [theme.breakpoints.down('sm')]: {
      padding: 0
    }
  },
  containerPaper: {
    padding: 32
  },
  fixButtons: {
    textAlign: 'right',
    borderTop: '1px solid #CED2DD',
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '84%',
    padding: 24,
    backgroundColor: 'white'
  },
  primaryButton: {
    fontWeight: 800
  }
})

class NewPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      edit: false,
      openSnack: false,
      messageSnack: '',
      openUploader: false,
      user: null,
      products: [],
      values: {
        banner: '',
        mobileBanner: '',
        name: '',
        description: '',
        url: '',
        catalog: ''
      }
    }

    this.handleChangeText = this.handleChangeText.bind(this)
    this.getUserFullName = this.getUserFullName.bind(this)
    this.createPage = this.createPage.bind(this)
  }

  handleChangeText(type, event) {
    let values = this.state.values
    let url = ''
    if (type === 'name') {
      url = Utils.generateURL(event.target.value.trim())
      url = url.toLowerCase()
      values['url'] = url.trim()
    }

    if (type === 'url') {
      values[type] = Utils.generateURL(event.target.value.trim())
    } else {
      values[type] = event.target.value
    }

    values[type].trim()

    this.setState({
      values: values
    })
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (prevProps.catalog !== this.props.catalog) {
        this.setState({
          products: this.props.catalog.products
        })
      }
    }
  }

  async componentWillMount() {
    let user = await Utils.getCurrentUser()
    this.setState({
      edit: false,
      openSnack: false,
      messageSnack: '',
      openUploader: false,
      user: user,
      products: [],
      values: {
        banner: '',
        mobileBanner: '',
        name: '',
        description: '',
        url: '',
        catalog: ''
      }
    })
  }

  getUserFullName() {
    try {
      if (this.state.user.name !== undefined) {
        return (this.state.user.name + ' ' + this.state.user.firstLastName).toUpperCase().trim()
      }
    } catch (err) {
      return ''
    }
  }

  async createPage(event) {
    event.preventDefault()

    let error = false
    let messageError = ''

    if (Utils.isEmpty(this.state.values.name)) {
      error = true
      messageError = 'No se ha capturado el nombre de la página.'
    } else if (Utils.isEmpty(this.state.values.url)) {
      error = true
      messageError = 'No se ha capturado la url de la página.'
    } else if (Utils.isEmpty(this.state.values.catalog)) {
      error = true
      messageError = 'No se ha ingresado el link del catálogo.'
    } else if (!Utils.isExternalLink(this.state.values.catalog)) {
      error = true
      messageError = 'Link incorrecto. Copia y pega el Link desde Mis catálogos.'
    }
    
    if (!Utils.isEmpty(this.state.values.banner)) {
      let responseLoadImage = await Utils.loadImage(this.state.values.banner)
      if (responseLoadImage === undefined) {
        error = true
        messageError = 'Imagen incorrecta. Revisa la URL de la imagen para desktop.'
      } else {
        if (responseLoadImage.width > 1280) {
          error = true
          messageError = 'Ancho de la imagen no recomendada. Ajusta las medidas del banner para desktop (Ancho: 1280).'
        }
        
        if (!this.state.values.banner.match(/.(jpeg|gif)$/i)) {
          error = true
          messageError = 'El formato de la imagen desktop debe ser .jpeg o .gif'
        }
      }
    }
    
    if (!Utils.isEmpty(this.state.values.mobileBanner)) {
      let responseLoadImage = await Utils.loadImage(this.state.values.mobileBanner)
      if (responseLoadImage === undefined) {
        error = true
        messageError = 'Imagen incorrecta. Revisa la URL de la imagen para móvil.'
      } else {
        if (responseLoadImage.width > 640) {
          error = true
          messageError = 'Ancho de la imagen no recomendada. Ajusta las medidas del banner para móvil (Ancho: 640).'
        }

        if (!this.state.values.mobileBanner.match(/.(jpeg|gif)$/i)) {
          error = true
          messageError = 'El formato de la imagen móvil debe ser .jpeg o .gif'
        }
      }
    }

    if (error) {
      this.setState({
        openSnack: error,
        messageSnack: messageError
      })
      return
    }

    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'POST',
      resource: 'pages',
      endpoint: '/create',
      data: {
        banner: this.state.values.banner,
        mobileBanner: this.state.values.mobileBanner,
        name: this.state.values.name,
        description: this.state.values.description,
        url: this.state.values.url,
        products: this.state.products,
        catalog: this.state.values.catalog
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.props.history.push('/paginas')
    } else {
      this.setState({
        openSnack: true,
        messageSnack: Utils.messages.General.error
      })
    }
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <Title
          title="Nueva página."
          description={ <span>Página creada por: <strong>{ this.getUserFullName() }</strong></span> }
        />
        <div style={{ marginTop: 24 }}>
          <Paper style={{ padding: 16 }}>
            <Grid container>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <TextField
                  style={{ width: '95%' }}
                  label="Nombre de la página *"
                  variant="outlined"
                  placeholder="Escribe aquí el nombre de la página (obligatorio)..."
                  type="text"
                  autoFocus={true}
                  value={this.state.values.name}
                  onChange={(event) => { this.handleChangeText('name', event) }}
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <TextField
                  style={{ width: '100%' }}
                  label="Descripción de la página"
                  variant="outlined"
                  placeholder="Escribe aquí una descripción para esta página..."
                  type="text"
                  value={this.state.values.description}
                  onChange={(event) => { this.handleChangeText('description', event) }}
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <TextField
                  style={{ width: '95%', marginTop: 16 }}
                  label="Banner página (URL imagen .jpeg)"
                  variant="outlined"
                  placeholder="Resolución recomendada: 1280 x 350"
                  type="text"
                  value={this.state.values.banner}
                  onChange={(event) => { this.handleChangeText('banner', event) }}
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <TextField
                  style={{ width: '100%', marginTop: 16 }}
                  label="Banner móvil página (URL imagen .jpeg)"
                  variant="outlined"
                  placeholder="Resolución recomendada: 640 x 350"
                  type="text"
                  value={this.state.values.mobileBanner}
                  onChange={(event) => { this.handleChangeText('mobileBanner', event) }}
                />
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <TextField
                  style={{ width: '100%', marginTop: 16 }}
                  label="URL de la página"
                  variant="outlined"
                  placeholder="No acentos, no mayúsculas, no caracteres especiales, solo letras y guiones..."
                  type="text"
                  value={'/' + this.state.values.url}
                  onChange={(event) => { this.handleChangeText('url', event) }}
                />
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <TextField
                  style={{ width: '100%', marginTop: 16 }}
                  label="Crear página desde catálogo (Copiar Link)"
                  variant="outlined"
                  placeholder="Ejemplo: https://api.calzzapato.com:3000/api/catalogs/515af72e6ab04d2c93c928ac4dd6eec8c73ac6328e23782f35479b13b855942a/download"
                  type="text"
                  value={this.state.values.catalog}
                  onChange={(event) => { this.handleChangeText('catalog', event) }}
                />
              </Grid>
            </Grid>
          </Paper>
        </div>
        <div className={classes.fixButtons}>
          <Button variant="outlined" style={{ marginRight: 8 }} onClick={() => {
            this.props.history.push('/paginas')
          }}>
            CANCELAR
          </Button>
          <Button variant="contained" color="primary" className={classes.primaryButton} onClick={(event) => { this.createPage(event) }}>
            GUARDAR PÁGINA
          </Button>
        </div>
        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          open={this.state.openSnack}
          onClose={() => { this.setState({ openSnack: false, messageSnack: '' })}}
          message={
            <span>{this.state.messageSnack}</span>
          }
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={() => { this.setState({ openSnack: false, messageSnack: '' })}}
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

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(NewPage)
