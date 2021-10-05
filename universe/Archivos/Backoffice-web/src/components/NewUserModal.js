import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import ReactSelect from 'react-select'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Actions
import Utils from '../resources/Utils'
import Title from './Title'
import { Grid, TextField, Button, MenuItem, Modal } from '@material-ui/core'
import { requestAPI } from '../api/CRUD.js'


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
  smallForm: {
    overflowY: 'scroll',
    position: 'absolute',
    width: theme.spacing.unit * 60,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: 16,
    height: '90%',

    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
    }
  },
  container: {
    width: '100%',
    margin: '0 auto'
  },
  buttonsContainer: {
    textAlign: 'right',
    borderTop: '1px solid #CED2DD',
    padding: 16,
    backgroundColor: 'white'
  },
  primaryButton: {
    fontWeight: 800
  }
})

class NewUserModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      edit: false,
      openSnack: false,
      messageSnack: '',
      user: null,
      name: "",
      firstLastName: "",
      secondLastName: "",
      employeeIdentifier: "",
      email: "",
      cellphone: "",
      role: null,
      roles: [],
      branches: [],
      selectedBranch: [],
      city: null
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleChangeBranch = this.handleChangeBranch.bind(this)
    this.createUser = this.createUser.bind(this)
  }

  handleClose() {
    this.props.handleClose()
  }

  async handleRender() {
    let user = await Utils.getCurrentUser()

    let roles = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/roles'
    })

    let branches = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/branches'
    })

    let cities = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/calzzamovil/cities'
    })

    this.setState({
      user: user,
      roles: roles.data,
      branches: branches.data,
      cities: cities.data
    })
  }

  handleChangeBranch(selectedOption) {
    this.setState({
      selectedBranch: selectedOption
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

  async createUser() {
    let name = this.state.name.trim()
    let firstLastName = this.state.firstLastName.trim()
    let secondLastName = this.state.secondLastName.trim()
    let employeeIdentifier = this.state.employeeIdentifier.trim()
    let email = this.state.email.trim()
    let cellphone = this.state.cellphone.trim()
    let branches = this.state.selectedBranch
    let role = this.state.role
    let city = this.state.city


    let valid = true
    let messageSnack = ""

    if (valid && Utils.isEmpty(name)) {
      valid = false
      messageSnack = 'Captura los campos marcados como obligatorios (*)'
    }

    if (valid && Utils.isEmpty(firstLastName)) {
      valid = false
      messageSnack = 'Captura los campos marcados como obligatorios (*)'
    }

    if (valid && Utils.isEmpty(employeeIdentifier)) {
      valid = false
      messageSnack = 'Captura los campos marcados como obligatorios (*)'
    }

    if (valid && !Utils.validateEmail(email)) {
      valid = false
      messageSnack = 'Correo electrónico inválido.'
    }

    if (role.id === 4) {
      if (city === null || city.cityMunicipalityStateCode === undefined || city.cityMunicipalityStateCode === null) {
        valid = false
        messageSnack = 'Ciudad no seleccionada.'
      }
    }

    /*
    if (valid && cellphone.length < 10){
      valid = false
      messageSnack = 'Número de celular inválido.'
    }
    */

    if (valid && branches.length === 0) {
      valid = false
      messageSnack = 'Selecciona por lo menos una unidad de negocio.'
    }

    if (valid && (role === undefined || role === null)) {
      valid = false
      messageSnack = 'Selecciona un Rol.'
    }

    if (valid) {
      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: 'users',
        endpoint: '/create',
        data: {
          name: this.state.name,
          firstLastName: this.state.firstLastName,
          secondLastName: secondLastName,
          employeeIdentifier: this.state.employeeIdentifier,
          email: this.state.email,
          cellphone: cellphone,
          branches: this.state.selectedBranch,
          roleId: this.state.role.id,
          createdBy: this.state.user.id,
          cityMunicipalityStateCode: (this.state.role.id === 4) ? this.state.city.cityMunicipalityStateCode : null
        }
      })
      if (response.status === 200) {
        await this.setState({
          user: null,
          name: "",
          firstLastName: "",
          secondLastName: "",
          employeeIdentifier: "",
          email: "",
          cellphone: "",
          role: null,
          roles: [],
          branches: [],
          selectedBranch: [],
          city: null
        })
        this.props.handleClose()
      } else if (response.data !== undefined && response.data.error !== undefined && response.data.error.message) {
        this.setState({
          openSnack: true,
          messageSnack: response.data.error.message
        })

      }
    } else {
      this.setState({
        openSnack: true,
        messageSnack
      })
    }
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
        <div style={getModalStyle()} className={classes.smallForm}>
          <Title
            title="Crear Usuario."
            description={<span>Usuario creado por: <strong>{this.getUserFullName()}</strong></span>}
          />
          <div style={{ marginTop: 24 }}>
            <Grid className={classes.container} container>
              <Grid item xs={12}>
                <TextField
                  style={{ width: '100%' }}
                  label="Nombre *"
                  variant="outlined"
                  type="text"
                  autoFocus={true}
                  value={this.state.name}
                  onChange={(event) => { this.setState({ name: event.target.value }) }}
                />
              </Grid>
              <Grid item xs={12} style={{ marginTop: 16 }}>
                <TextField
                  style={{ width: '100%' }}
                  label="Primer apellido *"
                  variant="outlined"
                  type="text"
                  value={this.state.firstLastName}
                  onChange={(event) => { this.setState({ firstLastName: event.target.value }) }}
                />
              </Grid>
              <Grid item xs={12} style={{ marginTop: 16 }}>
                <TextField
                  style={{ width: '100%' }}
                  label="Segundo apellido"
                  variant="outlined"
                  type="text"
                  value={this.state.secondLastName}
                  onChange={(event) => { this.setState({ secondLastName: event.target.value }) }}
                />
              </Grid>
              <Grid item xs={12} style={{ marginTop: 16 }}>
                <TextField
                  style={{ width: '100%' }}
                  label="Identificación *"
                  variant="outlined"
                  type="text"
                  value={this.state.employeeIdentifier}
                  onChange={(event) => { this.setState({ employeeIdentifier: event.target.value }) }}
                />
              </Grid>
              <Grid item xs={12} style={{ marginTop: 16 }}>
                <TextField
                  style={{ width: '100%' }}
                  label="Correo electrónico"
                  variant="outlined"
                  type="email"
                  value={this.state.email}
                  onChange={(event) => { this.setState({ email: event.target.value }) }}
                />
              </Grid>
              <Grid item xs={12} style={{ marginTop: 16 }}>
                <TextField
                  style={{ width: '100%' }}
                  label="Celular"
                  variant="outlined"
                  type="number"
                  maxlength="10"
                  value={this.state.cellphone}
                  onChange={(event) => {
                    if (this.state.cellphone.length < 10) {
                      this.setState({ cellphone: event.target.value })
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} style={{ marginTop: 16 }}>
                <TextField
                  style={{ width: '100%' }}
                  select
                  label="Rol"
                  variant="outlined"
                  value={this.state.role}
                  onChange={(event) => { this.setState({ role: event.target.value }) }}
                >
                  {
                    (this.state.roles.length > 0) ?
                      this.state.roles.map((role) => {
                        return (
                          <MenuItem key={role.id} value={role}>
                            {role.name}
                          </MenuItem>
                        )
                      })
                      :
                      ''
                  }
                </TextField>
              </Grid>
              {
                (this.state.role !== null && this.state.role !== undefined && this.state.role.id === 4) ?
                  <Grid item xs={12} style={{ marginTop: 16 }}>
                    <TextField
                      style={{ width: '100%' }}
                      select
                      label="Ciudad"
                      variant="outlined"
                      value={this.state.city}
                      onChange={(event) => { this.setState({ city: event.target.value }) }}
                    >
                      {
                        (this.state.cities !== null && this.state.cities !== undefined && this.state.cities.length > 0) ?
                          this.state.cities.map((city) => {
                            return (
                              <MenuItem key={city.id} value={city}>
                                {city.name}
                              </MenuItem>
                            )
                          })
                          :
                          ''
                      }
                    </TextField>
                  </Grid>
                  :
                  ''
              }


              <Grid item xs={12} style={{ marginTop: 16 }}>
                <ReactSelect
                  placeholder={'Selecciona una unidad de negocio *'}
                  isMulti
                  options={this.state.branches}
                  onChange={this.handleChangeBranch}
                  noOptionsMessage={() => 'Cargando...'}
                  defaultValue={
                    (this.state.selectedBranch.length > 0) ?
                      this.state.selectedBranch
                      :
                      false
                  }
                />
              </Grid>
              <Grid item xs={12} className={classes.buttonsContainer} style={{ marginTop: 16 }}>
                <Button variant="outlined" style={{ marginRight: 8 }} onClick={() => { this.props.handleClose() }}>
                  CANCELAR
                </Button>
                <Button variant="contained" color="primary" className={classes.primaryButton} onClick={() => { this.createUser() }}>
                  CREAR USUARIO
                </Button>
              </Grid>
            </Grid>
          </div>
          <Snackbar
            style={{ width: '90%' }}
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
)(NewUserModal)
