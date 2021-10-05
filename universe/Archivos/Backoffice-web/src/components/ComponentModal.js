import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material
import { Grid, Typography, Checkbox, Button, Hidden, Modal, FormControl, Select, TextField, Snackbar, IconButton, InputLabel, OutlinedInput, InputAdornment } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'

// Utils
import { requestAPI } from '../api/CRUD'
import Utils from '../resources/Utils'


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
  align: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
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
  },
  containerOrder: {
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: '80%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '32px 16px 32px 16px',
    [theme.breakpoints.down('md')]: {
      width: '60%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
      padding: '16px 16px 16px 16px'
    }
  },
  containerClickCollect: {
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: '50%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    paddingBottom: '20px',
    [theme.breakpoints.down('md')]: {
      width: '60%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
    }
  },

  convenioButton: {
    background: 'none',
    border: 'none',
    color: '#006fb9',
    cursor: 'pointer',
    display: 'block',
    marginLeft: 'auto',
    marginTop: '2px',
  },
  textfield: {
    display: 'flex',
    height: '2px'

  },

})

class ComponentModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      size: 12,
      selectedState: null,
      branch: null,
      agreement: null,
      vigencia: false,
      edited: false,

      name: null,
      nickname: null,
      businessName: null,
      prefix: null,
      contactName: null,
      cellphone: null,
      messageSnack: null,
      openSnack: false,

      agreement: null,
      campaign: null,
      totalFolios: null,
      import: null,
      initDate: null,
      finishDate: null,
      resumen: null,

      pendding: false

    }
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)



    this.createAgreement = this.createAgreement.bind(this)
    this.createCampaign = this.createCampaign.bind(this)
    this.isNull = this.isNull.bind(this)
    this.openConvenio = this.openConvenio.bind(this)
    this.openCampaign = this.openCampaign.bind(this)
    this.createFolio = this.createFolio.bind(this)

  }
  openCampaign = async () => {
    await this.setState({ pendding: true })
    this.props.addCampaign()
  }

  openConvenio = async () => {
    await this.setState({ pendding: true })
    this.props.addConvenio()
  }

  isNull = (attri) => {
    let response = false
    let attribute = this.state[attri]
    if (this.state.messageSnack !== null && this.state.messageSnack !== undefined && this.state.messageSnack !== '' && (attribute === null || attribute === undefined || attribute === '')) {
      response = true
    }
    return false
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value })
    if (name === 'vigencia') {
      this.setState({ initDate: new Date() })
    }
  }

  UNSAFE_componentWillUpdate() {
    if (this.props.edit && !this.state.edited) {
      this.setState({ edited: true, cellphone: this.props.data.cellphone, contactName: this.props.data.contactName, name: this.props.data.name, finishDate: this.props.data.finishDate })
    }
  }

  async createAgreement() {
    let atributes = null
    if (this.props.edit) {
      atributes = [{ name: 'contactName', errorMessage: 'Falta especificar nombre de contacto.' }, { name: 'cellphone', errorMessage: 'Falta teléfono de contacto.' }]
    } else {
      atributes = [{ name: 'name', errorMessage: 'Falta especificar nombre.' }, { name: 'nickname', errorMessage: 'Falta especificar alias.' }, { name: 'businessName', errorMessage: 'Falta especificar razón social.' }, { name: 'prefix', errorMessage: 'Falta especificar prefijo.' }, { name: 'contactName', errorMessage: 'Falta especificar nombre de contacto.' }, { name: 'cellphone', errorMessage: 'Falta teléfono de contacto.' }]
    }
    let errorMessage = null
    atributes.forEach(element => {
      if (errorMessage === null && (this.state[element.name] === undefined || this.state[element.name] === null || this.state[element.name] === '' || this.state[element.name] === ' ')) {
        errorMessage = element.errorMessage
      }
    })
    if (errorMessage !== null) {
      this.setState({ messageSnack: errorMessage, openSnack: true })
    } else {
      if (!this.props.edit) {
        let response = await requestAPI({
          host: Utils.constants.HOST,
          method: 'POST',
          resource: 'users',
          endpoint: '/agreement/new',
          data: {
            name: this.state.name,
            nickname: this.state.nickname,
            businessName: this.state.businessName,
            prefix: this.state.prefix,
            contactName: this.state.contactName,
            cellphone: this.state.cellphone
          }
        })
        if (response.data !== undefined && response.data !== null && response.data.created) {
          // await this.setState({ messageSnack: 'Se ha creado un nuevo convenio.', openSnack: true })
          await this.props.loadData()
          if (this.state.pendding) {
            this.props.folios()
          } else {
            await this.handleClose()
          }
        } else {
          await this.setState({ messageSnack: 'No se ha podido agregar convenio.', openSnack: true })
        }

      } else {
        let response = await requestAPI({
          host: Utils.constants.HOST,
          method: 'PATCH',
          resource: 'users',
          endpoint: '/agreement/' + this.props.data.id,
          data: {
            contactName: this.state.contactName,
            cellphone: this.state.cellphone
          }
        })
        if (response.data !== undefined && response.data !== null && response.data.edited) {
          // await this.setState({ messageSnack: 'Se ha creado un nuevo convenio.', openSnack: true })
          await this.props.loadData()
          await this.handleClose()
        } else {
          await this.setState({ messageSnack: 'No se ha podido agregar convenio.', openSnack: true })
        }
      }
    }
  }

  async createFolio() {
    let attributes = null
    if (this.props.edit) {
      attributes = [{ name: 'finishDate', errorMessage: 'Falta especificar fecha de cierre.' }]
    } else {
      attributes = [{ name: 'agreement', errorMessage: 'Falta especificar convenio.' }, { name: 'campaign', errorMessage: 'Falta especificar una campaña.' }, { name: 'totalFolios', errorMessage: 'Falta especificar el total de folios.' }, { name: 'import', errorMessage: 'Falta especificar el importe.' }]
      if (this.state.vigencia) {
        attributes.push({ name: 'initDate', errorMessage: 'Falta especificar fecha de inicio.' })
        attributes.push({ name: 'finishDate', errorMessage: 'Falta especificar fecha de termino.' })
      }
    }
    let errorMessage = null

    attributes.forEach(element => {
      if (errorMessage === null && (this.state[element.name] === undefined || this.state[element.name] === null || this.state[element.name] === '' || this.state[element.name] === ' ')) {
        errorMessage = element.errorMessage
      }
    })

    if (errorMessage !== null) {
      this.setState({ messageSnack: errorMessage, openSnack: true })
    } else {
      if (!this.props.edit) {
        let response = await requestAPI({
          host: Utils.constants.HOST,
          method: 'POST',
          resource: 'users',
          endpoint: '/folio/new',
          data: {
            campaignId: this.state.campaign,
            name: this.state.name,
            agreementId: this.state.agreement,
            totalFolios: this.state.totalFolios,
            import: this.state.import,
            initDate: this.state.initDate,
            finishDate: this.state.finishDate
          }
        })
        if (response.data !== undefined && response.data !== null && response.data.created) {
          // await this.setState({ messageSnack: 'Se ha creado un nuevo convenio.', openSnack: true })
          await this.props.loadData()
          await this.handleClose()
        } else {
          await this.setState({ messageSnack: 'No se ha podido agregar folio.', openSnack: true })
        }
      } else {
        let response = await requestAPI({
          host: Utils.constants.HOST,
          method: 'PATCH',
          resource: 'users',
          endpoint: '/folio/' + this.props.data._id,
          data: {
            finishDate: this.state.finishDate
          }
        })
        if (response.data !== undefined && response.data !== null && response.data.edited) {
          // await this.setState({ messageSnack: 'Se ha creado un nuevo convenio.', openSnack: true })
          await this.props.loadData()
          if (this.state.pendding) {
            this.props.folios()
          } else {
            await this.handleClose()
          }
        } else {
          await this.setState({ messageSnack: 'No se ha podido agregar folio.', openSnack: true })
        }
      }

    }

  }

  async createCampaign() {
    let atributes = [{ name: 'name', errorMessage: 'Falta especificar nombre.' }]
    let errorMessage = null
    atributes.forEach(element => {
      if (errorMessage === null && (this.state[element.name] === undefined || this.state[element.name] === null || this.state[element.name] === '' || this.state[element.name] === ' ')) {
        errorMessage = element.errorMessage
      }
    })
    if (errorMessage !== null) {
      this.setState({ messageSnack: errorMessage, openSnack: true })
    } else {
      if (!this.props.edit) {
        let response = await requestAPI({
          host: Utils.constants.HOST,
          method: 'POST',
          resource: 'users',
          endpoint: '/campaign/new',
          data: {
            name: this.state.name,
          }
        })
        if (response.data !== undefined && response.data !== null && response.data.created) {
          // await this.setState({ messageSnack: 'Se ha creado un nuevo convenio.', openSnack: true })
          await this.props.loadData()
          if (this.state.pendding) {
            this.props.folios()
          } else {
            await this.handleClose()
          }
        } else {
          await this.setState({ messageSnack: 'No se ha podido agregar campaña.', openSnack: true })
        }
      } else {
        let response = await requestAPI({
          host: Utils.constants.HOST,
          method: 'PATCH',
          resource: 'users',
          endpoint: '/campaign/' + this.props.data.id,
          data: {
            name: this.state.name,
          }
        })
        if (response.data !== undefined && response.data !== null && response.data.edited) {
          // await this.setState({ messageSnack: 'Se ha creado un nuevo convenio.', openSnack: true })
          await this.props.loadData()
          if (this.state.pendding) {
            this.props.folios()
          } else {
            await this.handleClose()
          }
        } else {
          await this.setState({ messageSnack: 'No se ha podido agregar campaña.', openSnack: true })
        }

      }
    }


  }

  async componentWillMount() {
  }

  handleClose() {
    this.setState({
      changeButton: true,
      comments: '',
      selectedDate: '',
      messageSnack: '',
      openSnack: false,
      name: '',
      nickname: '',
      businessName: '',
      prefix: '',
      contactName: '',
      cellphone: '',
      messageSnack: '',

      agreement: '',
      vigencia: false,

      campaign: '',
      totalFolios: '',
      import: '',
      initDate: '',
      finishDate: '',
      resumen: '',

      pendding: false,
      edited: false

    })

    this.props.handleClose()
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      //messageSnack: ''
    })
  }

  render() {
    const self = this
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
      >
        <div>
          {
            (this.props.modalType === 'folios') ?
              <div style={getModalStyle()} className={classes.container}  >
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant='h6' align='center'>
                      {
                        (this.props.detail) ?
                          'Folio Monedero Azul'
                          :
                          (this.props.edit) ?
                            'Editar folio para Monedero Azul'
                            :
                            'Generar folio para Monedero Azul'
                      }
                    </Typography>
                  </Grid>

                  <Grid item xs={12} style={{ marginTop: '50px' }} >

                    <Grid container>
                      <Grid item xs={1}></Grid>
                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2' >Convenio</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth variant="outlined" className={classes.formControl}>
                          <Select
                            native
                            disabled={(this.props.detail || this.props.edit)}
                            value={(this.props.detail || this.props.edit) ? this.props.data.agreementId : this.state.agreement}
                            onChange={this.handleChange('agreement')}
                            input={
                              <OutlinedInput
                                style={{ height: '40px' }}
                                InputProps={{
                                  classes: {
                                    input: classes.textfield,
                                  },
                                }}
                                name="age"
                                labelWidth={this.state.labelWidth}
                                id="outlined-age-native-simple"
                              />
                            }
                          >
                            <option value="" />
                            {
                              this.props.agreements.map((element) => {
                                return (<option value={element.id}>{element.name}</option>)
                              })
                            }
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={7}></Grid>
                      <Grid item xs={4}>
                        {
                          (!this.props.edit && !this.props.detail) ?
                            <button onClick={() => { this.openConvenio() }} className={classes.convenioButton} >Agregar nuevo convenio</button>
                            :
                            ''
                        }
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: '20px' }} >
                      <Grid item xs={1}></Grid>
                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2' >Campaña</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth variant="outlined" className={classes.formControl}>
                          <Select
                            native
                            disabled={(this.props.detail || this.props.edit)}
                            value={(this.props.detail || this.props.edit) ? this.props.data.campaignId : this.state.campaign}
                            onChange={this.handleChange('campaign')}
                            input={
                              <OutlinedInput
                                style={{ height: '40px' }}
                                InputProps={{
                                  classes: {
                                    input: classes.textfield,
                                  },
                                }}
                                name="age"
                                labelWidth={this.state.labelWidth}
                                id="outlined-age-native-simple"
                              />
                            }
                          >
                            <option value="" />
                            {
                              this.props.campaigns.map((element) => {
                                return (<option value={element.id}>{element.name}</option>)
                              })
                            }
                          </Select>
                        </FormControl>

                      </Grid>

                    </Grid>

                    <Grid container>
                      <Grid item xs={7}></Grid>
                      <Grid item xs={4}>
                        {
                          (!this.props.edit && !this.props.detail) ?
                            <button onClick={() => { this.openCampaign() }} className={classes.convenioButton} >Agregar nueva campaña</button>
                            :
                            ''
                        }
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: '20px' }} >
                      <Grid item xs={1}></Grid>
                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2' >Total de folios</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          variant="outlined"
                          disabled={(this.props.detail || this.props.edit)}
                          value={(this.props.detail || this.props.edit) ? this.props.data.totalFolios : this.state.totalFolios} InputProps={{
                            classes: {
                              input: classes.textfield,
                            },
                          }}
                          onChange={this.handleChange('totalFolios')}
                          fullWidth
                          type="number"
                          onInput={(e) => {
                            e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, 5)
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: '20px' }} >
                      <Grid item xs={1}></Grid>

                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2' >Importe</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          variant="outlined"
                          onChange={this.handleChange('import')}
                          disabled={(this.props.detail || this.props.edit)}
                          value={(this.props.detail || this.props.edit) ? this.props.data.import : this.state.import}
                          InputProps={{
                            startAdornment:
                              <InputAdornment position="start">$</InputAdornment>
                            ,
                            classes: {
                              input: classes.textfield,
                            },
                          }}
                          fullWidth
                          onInput={(e) => {
                            e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, 4)
                          }}
                          type="number"
                        />
                      </Grid>
                    </Grid>

                    {
                      (!this.props.detail && !this.props.edit) ?
                        < Grid container style={{ marginTop: '20px' }} >
                          <Grid item xs={1}></Grid>

                          <Grid item xs={4} className={classes.align}>
                            <Typography variant='body2' >Vigencia</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Checkbox
                              style={{ padding: '0px' }}
                              checked={this.state.vigencia}
                              onChange={() => { this.setState({ vigencia: !this.state.vigencia, initDate: new Date() }) }}
                              color="primary"
                              inputProps={{ 'aria-label': 'secondary checkbox' }}
                            />
                          </Grid>
                        </Grid>

                        :
                        ''
                    }
                    {
                      (this.state.vigencia || ((this.props.detail || this.props.edit) && this.props.data.initDate !== null && this.props.data.initDate !== undefined)) ?
                        <div>
                          <Grid container spacing={3} style={{ marginTop: '20px', marginLeft: '15px' }} >
                            <Grid item xs={1}></Grid>
                            <Grid item xs={5}>
                              <Grid container>
                                <Grid item xs={10} className={classes.align} style={{ marginTop: '10px' }}>
                                  <TextField
                                    id="datetime-local"
                                    label="Fecha Inicio"
                                    onChange={this.handleChange('initDate')}
                                    disabled={this.props.edit || this.props.detail}
                                    className={classes.textField}
                                    type="date"
                                    defaultValue={(this.props.detail || this.props.edit) ? new Date(this.props.data.initDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    inputProps={{
                                      min: new Date().toISOString().split("T")[0]
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid item xs={5}>
                              <Grid container>
                                <Grid item xs={10} className={classes.align} style={{ marginTop: '10px' }}>
                                  <TextField
                                    id="datetime-local"
                                    label="Fecha Fin"
                                    className={classes.textField}
                                    type="date"
                                    onChange={this.handleChange('finishDate')}
                                    disabled={this.props.detail}
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    defaultValue={(this.props.detail || this.props.edit) ? new Date(this.props.data.finishDate).toISOString().split("T")[0] : null}
                                    inputProps={
                                      // ((!this.props.detail && !this.props.edit) && this.state.initDate !== null && this.state.initDate !== undefined) ? { min: new Date('2020-01-02').toISOString().split("T")[0] } : {}
                                      (!this.props.detail && !this.props.edit) ? { min: new Date((this.state.initDate !== null && this.state.initDate !== undefined)? this.state.initDate : '2021-02-02').toISOString().split("T")[0] } : {  min: new Date(this.props.data.initDate).toISOString().split("T")[0] }
                                      // { min: new Date().toISOString().split("T")[0] }
                                    }
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </div>
                        :
                        ''
                    }
                  </Grid>
                  {/* <Grid container style={{ marginTop: '20px' }} >
                    <Grid item xs={1}></Grid>
                    <Grid item xs={4} style={{ marginLeft: '10px' }} >
                      <Typography variant='body2' >Resumen</Typography>
                    </Grid>
                    <Grid item xs={10} className={classes.align} style={{ marginLeft: '70px', marginTop: '10px' }} >
                      <TextField
                        variant="outlined"
                        InputProps={{
                          classes: {
                            input: classes.textfield,
                          },
                        }}
                        value={this.state.resumen}
                        disabled
                        fullWidth
                        multiline
                        type="text"
                      />
                    </Grid>
                  </Grid> */}

                  <Grid item xs={12} style={{ marginTop: '50px' }} >
                    <Grid container spacing={2} className={classes.align} >
                      <Grid item xs={5}>
                        <Button onClick={() => { this.handleClose() }} fullWidth variant='outlined'>
                          Cancelar
                      </Button>
                      </Grid>
                      <Grid item xs={5}>
                        {
                          (this.props.detail) ?
                            <Button onClick={() => { this.props.handleEdit() }} fullWidth style={{ background: '#1b2d63', marginLeft: '20px', color: 'white' }} >
                              Editar
                            </Button>
                            :
                            <Button onClick={() => { this.createFolio() }} fullWidth style={{ background: '#1b2d63', marginLeft: '20px', color: 'white' }} >
                              {
                                (this.props.edit) ?
                                  'Editar'
                                  :
                                  'Generar'
                              }
                            </Button>
                        }

                        {/* <Button onClick={() => { this.createFolio() }} fullWidth style={{ background: '#1b2d63', marginLeft: '20px', color: 'white' }} >
                          Generar
                        </Button> */}
                      </Grid>
                    </Grid>

                  </Grid>

                </Grid>
              </div>
              :
              ''
          }
          {
            (this.props.modalType === 'convenios') ?
              <div style={getModalStyle()} className={classes.container}  >
                <Grid container>
                  <Grid item xs={12}>
                    {
                      (this.props.edit) ?
                        <Typography variant='h6' align='center' >Editar convenio</Typography>
                        :
                        (this.props.detail) ?
                          <Typography variant='h6' align='center' >Convenio</Typography>
                          :
                          <Typography variant='h6' align='center' >Agregar nuevo convenio</Typography>
                    }
                  </Grid>

                  <Grid item xs={12} style={{ marginTop: '50px' }} >

                    <Grid container>
                      <Grid item xs={1}></Grid>
                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2'>Nombre de Empresa</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          error={this.isNull('name') ? true : false}
                          disabled={(this.props.detail || this.props.edit)}
                          autoFocus
                          value={(this.props.detail || this.props.edit) ? this.props.data.name : this.state.name}
                          variant="outlined"
                          onChange={this.handleChange('name')}
                          InputProps={{
                            classes: {
                              input: classes.textfield,
                            },
                          }}
                          fullWidth
                          type="text"
                        />
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: '20px' }} >
                      <Grid item xs={1}></Grid>
                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2' >Alias</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          variant="outlined"
                          value={(this.props.detail || this.props.edit) ? this.props.data.nickname : this.state.nickname}
                          disabled={this.props.detail || this.props.edit}
                          error={this.isNull('nickname') ? true : false}
                          onChange={this.handleChange('nickname')}
                          InputProps={{
                            classes: {
                              input: classes.textfield,
                            },
                          }}
                          fullWidth
                          type="text"
                        />
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: '20px' }} >
                      <Grid item xs={1}></Grid>
                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2' >Razón Social</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          value={(this.props.detail || this.props.edit) ? this.props.data.businessName : this.state.businessName}
                          error={this.isNull('businessName') ? true : false}
                          onChange={this.handleChange('businessName')}
                          disabled={this.props.detail || this.props.edit}
                          variant="outlined"
                          InputProps={{
                            classes: {
                              input: classes.textfield,
                            },
                          }}
                          fullWidth
                          type="text"
                        />
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: '20px' }} >
                      <Grid item xs={1}></Grid>
                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2'>Prefijo cupón</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          value={(this.props.detail || this.props.edit) ? this.props.data.prefix : this.state.prefix}
                          disabled={this.props.detail || this.props.edit}
                          error={this.isNull('prefix') ? true : false}
                          onChange={this.handleChange('prefix')}
                          variant="outlined"
                          InputProps={{
                            classes: {
                              input: classes.textfield,
                            },
                          }}
                          fullWidth
                          type="text"
                        />
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: '20px' }} >
                      <Grid item xs={1}></Grid>
                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2' >Nombre de contacto</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          disabled={this.props.detail}
                          // value={this.state.contactName}
                          defaultValue={(this.props.edit || this.props.detail) ? this.props.data.contactName : ''}
                          variant='outlined'
                          error={this.isNull('contactName') ? true : false}
                          onChange={this.handleChange('contactName')}
                          InputProps={{
                            classes: {
                              input: classes.textfield,
                            },
                          }}
                          fullWidth
                          type="text"
                        />
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginTop: '20px' }} >
                      <Grid item xs={1}></Grid>
                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2' >Teléfono de contacto</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          disabled={this.props.detail}
                          error={this.isNull('cellphone') ? true : false}
                          onChange={this.handleChange('cellphone')}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              this.createAgreement()
                            }
                          }}
                          variant="outlined"
                          defaultValue={(this.props.edit || this.props.detail) ? this.props.data.cellphone : ''}
                          // value={(!this.props.edit && this.props.detail) ? this.state.cellphone : ''}
                          onInput={(e) => {
                            e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, 10)
                          }}
                          InputProps={{
                            classes: {
                              input: classes.textfield,
                            },
                          }}
                          fullWidth
                          type="number"
                        />
                      </Grid>
                    </Grid>

                  </Grid>

                  <Grid item xs={12} style={{ marginTop: '50px' }} >
                    <Grid container spacing={2} className={classes.align} >
                      <Grid item xs={5}>
                        <Button fullWidth variant='outlined' onClick={() => { (!this.state.pendding) ? this.handleClose() : this.props.folios() }} >
                          Cancelar
                        </Button>
                      </Grid>
                      <Grid item xs={5}>
                        {
                          (this.props.detail) ?
                            <Button onClick={() => { this.props.handleEdit() }} fullWidth style={{ background: '#1b2d63', marginLeft: '20px', color: 'white' }} >
                              Editar
                            </Button>
                            :
                            <Button onClick={() => { this.createAgreement() }} fullWidth style={{ background: '#1b2d63', marginLeft: '20px', color: 'white' }} >
                              {
                                (this.props.edit) ?
                                  'Editar'
                                  :
                                  'Guardar'
                              }
                            </Button>
                        }
                      </Grid>
                    </Grid>

                  </Grid>

                </Grid>
              </div>
              :
              ''
          }
          {
            (this.props.modalType === 'campaign') ?
              <div style={getModalStyle()} className={classes.container}  >
                <Grid container>
                  <Grid item xs={12}>
                    <Typography variant='h6' align='center' >Agregar nueva campaña</Typography>
                  </Grid>

                  <Grid item xs={12} style={{ marginTop: '50px' }} >

                    <Grid container>
                      <Grid item xs={1}></Grid>
                      <Grid item xs={4} className={classes.align}>
                        <Typography variant='body2'>Nombre de la Campaña</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          error={this.isNull('name') ? true : false}
                          autoFocus
                          variant="outlined"
                          defaultValue={(this.props.detail || this.props.edit) ? this.props.data.name : ''}
                          disabled={(this.props.detail)}
                          onChange={this.handleChange('name')}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              this.createCampaign()
                            }
                          }}
                          InputProps={{
                            classes: {
                              input: classes.textfield,
                            },
                          }}
                          fullWidth
                          type="text"
                        />
                      </Grid>
                    </Grid>


                  </Grid>

                  <Grid item xs={12} style={{ marginTop: '50px' }} >
                    <Grid container spacing={2} className={classes.align} >
                      <Grid item xs={5}>
                        <Button fullWidth variant='outlined' onClick={() => { (!this.state.pendding) ? this.handleClose() : this.props.folios() }} >
                          Cancelar
                        </Button>
                      </Grid>
                      <Grid item xs={5}>
                        {
                          (this.props.detail) ?
                            <Button onClick={() => { this.props.handleEdit() }} fullWidth style={{ background: '#1b2d63', marginLeft: '20px', color: 'white' }} >
                              Editar
                          </Button>
                            :
                            <Button onClick={() => { this.createCampaign() }} fullWidth style={{ background: '#1b2d63', marginLeft: '20px', color: 'white' }} >
                              Guardar
                        </Button>
                        }
                      </Grid>
                    </Grid>

                  </Grid>

                </Grid>
              </div>
              :
              ''
          }
          <Snackbar
            anchorOrigin={{
              horizontal: 'center',
              vertical: 'top',
            }}
            message={this.state.messageSnack}
            open={this.state.openSnack}
            autoHideDuration={6000}
            onClose={() => { this.setState({ openSnack: false }) }}
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                autoHideDuration={6000}
                onClick={this.handleCloseSnackbar}
              >
                <CloseIcon className={classes.icon} />
              </IconButton>,
            ]}
          >
          </Snackbar>

        </div>
      </Modal >
    )
  }
}
const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(ComponentModal)
