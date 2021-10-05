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
import ConfirmDialog from '../components/ConfirmDialog'
import { Paper, Typography, Grid, Table, TextField, TableHead, TableBody, TableCell, Button, Checkbox, TableRow, Icon } from '@material-ui/core'
import Empty from '../components/Empty'
import Autocomplete from '../components/Autocomplete'
import AddressForm from '../components/AddressForm'
import Uploader from '../components/Uploader'
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
  textFieldLarge: {
    width: '100%'
  },
  primaryButton: {
    fontWeight: 800
  }
})

class NewOrder extends Component {
  constructor(props) {
    super(props)
    this.state = {
      edit: false,
      order: null,
      openConfirmDialog: false,
      openSnack: false,
      messageSnack: '',
      openUploader: false,
      step: 1,
      user: null,
      checkboxs: [ false, false, false ],
      values: {
        requesterId: null,
        hospitalId: null,
        doctorId: null,
        patientId: null,
      },
      deliveryDate: null,
      addressId: null,
      address: null,
      docs: [],
      deletedDocs: [],
      note: '',
      notes: [],
      comments: ''
    }

    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.handleChangeDeliveryDate = this.handleChangeDeliveryDate.bind(this)
    this.handleChangeAddressLoad = this.handleChangeAddressLoad.bind(this)
    this.getUserFullName = this.getUserFullName.bind(this)
    this.handleChangeNote = this.handleChangeNote.bind(this)
    this.addNote = this.addNote.bind(this)
    this.deleteNote = this.deleteNote.bind(this)
    this.handleChangeComments = this.handleChangeComments.bind(this)
    this.confirmUploader = this.confirmUploader.bind(this)
    this.handleCancelConfirmDialog = this.handleCancelConfirmDialog.bind(this)
    this.handleAcceptConfirmDialog = this.handleAcceptConfirmDialog.bind(this)
    this.createOrder = this.createOrder.bind(this)
  }

  componentDidMount() {
    Utils.scrollTop()
  }

  async componentWillMount() {
    const self = this
    if (Utils.isUserLoggedIn()) {
      let user = await Utils.getCurrentUser()
      this.setState({
        user: user
      }, async () => {
        if (this.props.match.path === Utils.constants.paths.updateOrder) {
          let response = await requestAPI({
            host: Utils.constants.HOST,
            method: 'GET',
            resource: 'orders',
            endpoint: '/' + this.props.match.params.folio + '/entity'
          })

          if (response.status === Utils.constants.status.SUCCESS) {
            self.setState({
              edit: true,
              values: {
                requesterId: response.data.requesterId,
                hospitalId: response.data.hospitalId,
                doctorId: response.data.doctorId,
                patientId: response.data.patientId
              },
              deliveryDate: response.data.deliveryDate,
              order: response.data
            })
          } else {
            this.props.history.push('/')
          }
        }
      })
      
    } else {
      this.props.history.push('/')
    }
  }

  handleCancelConfirmDialog() {
    this.setState({
      openConfirmDialog: false
    })
  }

  handleAcceptConfirmDialog() {
    this.props.history.push(Utils.constants.paths.orders)
  }

  handleChangeNote(event) {
    this.setState({
      note: event.target.value
    })
  }

  addNote(event) {
    event.preventDefault()
    let note = this.state.note.trim()
    if (!Utils.isEmpty(note)) {
      let notes = this.state.notes
      notes.unshift(note)
      this.setState({
        note: '',
        notes: notes
      })
    } else {
      this.setState({
        openSnack: true,
        messageSnack: 'No haz escrito una nota.'
      })
    }
  }

  deleteNote(idx) {
    let notes = this.state.notes
    notes.splice(idx, 1)
    this.setState({
      notes: notes
    })
  }
  
  confirmUploader(docs, deletedDocs) {
    this.setState({openUploader: false, docs: docs, deletedDocs, deletedDocs})
  }

  handleChangeComments(event) {
    this.setState({
      comments: event.target.value
    })
  }

  async handleChangeAddressLoad(checkbox) {
    let checkboxs = this.state.checkboxs
    let id = null
    let entity = ''
    let resource = ''
    let checked = !checkboxs[checkbox]

    if (checkbox === 0) {
      entity = 'hospital'
      resource = 'hospitals'
      id = this.state.values.hospitalId
    } else if (checkbox === 1) {
      entity = 'doctor'
      resource = 'doctors'
      id = this.state.values.doctorId
    } else {
      entity = 'paciente'
      resource = 'patients'
      id = this.state.values.patientId
    }
    
    if (id === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'No haz seleccionado un ' + entity + '.'
      })
      return
    }
    checkboxs.forEach((check, idx) => {
      checkboxs[idx] = false
    })
    checkboxs[checkbox] = checked
    this.setState({
      addressId: null,
      address: null,
      checkboxs: checkboxs
    }, async () => {
      if (checked) {
        let response = await requestAPI({
          host: Utils.constants.HOST,
          method: 'GET',
          resource: resource,
          endpoint: '/' + id + '/address'
        })
  
        let error = true
        if (response.status === Utils.constants.status.SUCCESS) {
          if (response.data.success) {
            error = false
            this.setState({
              addressId: response.data.address.id,
              address: response.data.address
            })
          } else {
            this.setState({
              openSnack: error,
              messageSnack: 'El ' + entity + ' no tiene dirección capturada.'
            })
          }
        } else {
          this.setState({
            openSnack: error,
            messageSnack: Utils.messages.General.error
          })
        }
  
        if (error) {
          checkboxs[checkbox] = !checked
          this.setState({
            checkboxs: checkboxs
          })
        }
      }
    })
  }

  handleChangeDeliveryDate(event) {
    let date = event.target.value
    if (Utils.isEmpty(date))
      date = null
    this.setState({
      deliveryDate: date
    })
  }

  handleChangeValueSelect(type, value) {
    const self = this
    let values = this.state.values

    if (value !== null) {
      values[type] = value.id
    } else {
      values[type] = value
    }

    this.setState({
      values: values
    }, () => {
      if (type === 'hospitalId') {
        if (this.state.checkboxs[0]) {
          self.handleChangeAddressLoad(0)
        }
      } else if (type === 'doctorId') {
        if (this.state.checkboxs[1]) {
          self.handleChangeAddressLoad(1)
        }
      } else if (type === 'patientId') {
        if (this.state.checkboxs[2]) {
          self.handleChangeAddressLoad(2)
        }
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

  async createOrder(event) {
    event.preventDefault()

    let error = false
    let messageError = ''
    if (this.state.values.requesterId === null) {
      error = true
      messageError = 'No se ha capturado el solicitante.'
    } else if (this.state.values.hospitalId === null) {
      error = true
      messageError = 'No se ha capturado el hospital.'
    } else if (this.state.values.doctorId === null) {
      error = true
      messageError = 'No se ha capturado el doctor.'
    } else if (this.state.values.patientId === null) {
      error = true
      messageError = 'No se ha capturado el paciente.'
    } else if (this.state.deliveryDate === null) {
      error = true
      messageError = 'No se ha capturado la fecha de cirugía.'
    } else if (this.state.address === null) {
      error = true
      messageError = 'No se ha capturado la dirección de entrega.'
    } else if (this.state.address.street !== undefined && Utils.isEmpty(this.state.address.street)) {
      error = true
      messageError = 'No se ha capturado la calle de la dirección de entrega.'
    } else if (this.state.address.exteriorNumber !== undefined && Utils.isEmpty(this.state.address.exteriorNumber)) {
      error = true
      messageError = 'No se ha capturado el número exterior de la dirección de entrega.'
    } else if (this.state.address.zip !== undefined && Utils.isEmpty(this.state.address.zip)) {
      error = true
      messageError = 'No se ha capturado el código postal de la dirección de entrega.'
    } else if (this.state.address.selectedLocation !== undefined && Utils.isEmpty(this.state.address.selectedLocation)) {
      error = true
      messageError = 'No se ha capturado la colonia de la dirección de entrega.'
    }
    else if (this.state.notes <= 0) {
      error = true
      messageError = 'No se han capturado notas.'
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
      resource: 'orders',
      endpoint: '/create',
      data: {
        requesterId: this.state.values.requesterId,
        hospitalId: this.state.values.hospitalId,
        doctorId: this.state.values.doctorId,
        patientId: this.state.values.patientId,
        deliveryDate: this.state.deliveryDate,
        comments: this.state.comments,
        docs: this.state.docs,
        addressId: this.state.addressId,
        address: this.state.address,
        notes: this.state.notes
      }
    })

    if (response.status === Utils.constants.status.SUCCESS) {
      this.props.history.push('/solicitudes')
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
          title="Captura de solicitud."
          description={ <span>Solicitud capturada por: <strong>{ this.getUserFullName() }</strong></span> }
        />
        <div style={{ marginTop: 12 }}>
        {
          (this.state.step === 1) ?
            this.renderFirstStep(classes)
          :
          ''
        }
        </div>
      </div>
    )
  }

  renderFirstStep(classes) {
    return (
      <div style={{ paddingBottom: 64 }}>
        <Grid container>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={[classes.container, classes.first]}>
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>1. Datos generales de la solicitud.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Los campos marcados con asterisco son obligatorios (*).</Typography>
              <Autocomplete
                host={Utils.constants.HOST}
                label="Solicitante *"
                resource="requesters"
                param="name"
                addToCatalog={true}
                messages={{
                  title: "Nuevo solicitante.",
                  description: "Captura el nombre del nuevo solicitante.",
                  params: {
                    name: "Nombre"
                  }
                }}
                createParams={[
                  { name: "name", type: "string", required: true }
                ]}
                value={this.state.values.requesterId}
                onChange={(newValue) => this.handleChangeValueSelect('requesterId', newValue)}
              />
              <Autocomplete
                host={Utils.constants.HOST}
                label="Hospital *"
                resource="hospitals"
                param="name"
                addToCatalog={true}
                messages={{
                  title: "Nuevo hospital.",
                  description: "Captura el nombre del nuevo hospital.",
                  params: {
                    name: "Nombre"
                  }
                }}
                createParams={[
                  { name: "name", type: "string", required: true }
                ]}
                value={this.state.values.hospitalId}
                onChange={(newValue) => this.handleChangeValueSelect('hospitalId', newValue)}
              />
              <Autocomplete
                host={Utils.constants.HOST}
                label="Doctor *"
                resource="doctors"
                param="fullName"
                searchParams={["firstName", "lastName"]}
                addToCatalog={true}
                messages={{
                  title: "Nuevo doctor.",
                  description: "Captura el nombre del nuevo doctor.",
                  params: {
                    firstName: "Nombre",
                    lastName: "Apellido"
                  }
                }}
                createParams={[
                  { name: "firstName", type: "string", required: true },
                  { name: "lastName", type: "string", required: true }
                ]}
                value={this.state.values.doctorId}
                onChange={(newValue) => this.handleChangeValueSelect('doctorId', newValue)}
              />
              <Autocomplete
                host={Utils.constants.HOST}
                label="Paciente *"
                resource="patients"
                param="fullName"
                searchParams={["firstName", "lastName"]}
                addToCatalog={true}
                messages={{
                  title: "Nuevo paciente.",
                  description: "Captura el nombre del nuevo paciente.",
                  params: {
                    firstName: "Nombre",
                    lastName: "Apellido"
                  }
                }}
                createParams={[
                  { name: "firstName", type: "string", required: true },
                  { name: "lastName", type: "string", required: true }
                ]}
                value={this.state.values.patientId}
                onChange={(newValue) => this.handleChangeValueSelect('patientId', newValue)}
              />
            </Paper>
          </Grid>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={classes.container}>
            <Paper className={classes.containerPaper}>
              <Typography variant="h6"><strong>2. Datos de entrega de la solicitud.</strong></Typography>
              <Typography variant="body2" style={{ fontSize: 13 }}>Fecha de entrega (cirujía) y dirección.</Typography>
              <div style={{ marginTop: 20 }}>
                <Grid container>
                  <Grid item xl={4} lg={4} md={4} sm={12} xs={12} style={{ marginBottom: 16, paddingRight: 16 }}>
                    <Typography><strong>Fecha de cirugía *</strong></Typography>
                    <TextField
                      className={classes.textFieldLarge}
                      value={Utils.onlyDate(this.state.deliveryDate)}
                      onChange={(event) => { this.handleChangeDeliveryDate(event) }}
                      type="date"
                    />
                  </Grid>
                  <Grid item xl={8} lg={8} md={8} sm={12} xs={12}>
                    <Typography><strong>Usar la dirección del:</strong></Typography>
                    <Grid container>
                      <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
                        <Checkbox
                          style={{ marginLeft: 0, paddingLeft: 0 }}
                          checked={this.state.checkboxs[0]}
                          onChange={(event) => { this.handleChangeAddressLoad(0) }}
                        />
                        <span>Hospital</span>
                      </Grid>
                      <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
                        <Checkbox
                          style={{ marginLeft: 0, paddingLeft: 0 }}
                          checked={this.state.checkboxs[1]}
                          onChange={(event) => { this.handleChangeAddressLoad(1) }}
                        />
                        <span>Doctor</span>
                      </Grid>
                      <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
                        <Checkbox
                          style={{ marginLeft: 0, paddingLeft: 0 }}
                          checked={this.state.checkboxs[2]}
                          onChange={(event) => { this.handleChangeAddressLoad(2) }}
                        />
                        <span>Paciente</span>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {
                  (this.state.addressId !== null) ?
                  <div>
                    <Typography><strong>Calle:</strong> {this.state.address.street}</Typography>
                    <Typography><strong>Entre calles:</strong> {this.state.address.betweenStreets}</Typography>
                    <Typography><strong>Número exterior:</strong> {this.state.address.exteriorNumber}</Typography>
                    <Typography><strong>Número interior:</strong> {this.state.address.interiorNumber}</Typography>
                    <Typography><strong>Código postal:</strong> {this.state.address.zip}</Typography>
                    <Typography><strong>Colonia:</strong> {this.state.address.type + ' ' + this.state.address.location}</Typography>
                    <Typography><strong>Estado:</strong> {this.state.address.state}</Typography>
                    <Typography><strong>Municipio:</strong> {this.state.address.municipality}</Typography>
                  </div>
                  :
                  <AddressForm
                    editAddress={false}
                    updateAddress={(values) => {
                      this.setState({
                        address: values
                      })
                    }}
                  />
                }
                </div>
            </Paper>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12} className={[classes.container, classes.first]}>
            <Paper className={classes.containerPaper} style={{ marginTop: 24 }}>
            <Grid container>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="h6"><strong>3. Notas de la solicitud.</strong></Typography>
                <Typography variant="body2" style={{ fontSize: 13 }}>Ejemplo: El doctor solicitó tercio de caña.</Typography>
              </Grid>
              <Grid item xl={9} lg={9} md={9} sm={9} xs={9} style={{ marginTop: 8 }}>
                <TextField
                  className={classes.textFieldLarge}
                  placeholder="Escribir nota..."
                  value={this.state.note}
                  onKeyPress={ (event) => { if (event.key === 'Enter') { this.addNote(event) } } }
                  onChange={ (event) => { this.handleChangeNote(event) } }
                />
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3} style={{ paddingLeft: 8, marginTop: 8 }}>
                <Button variant="contained" color="primary" className={classes.primaryButton} style={{ width: '100%' }} onClick={ (event) => { this.addNote(event) } }>
                  AGREGAR
                </Button>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                {
                  (this.state.notes.length > 0) ?
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body1"><strong>Descripción</strong></Typography>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        this.state.notes.map((note, idx) => {
                          return (
                            <TableRow>
                              <TableCell>{note}</TableCell>
                              <TableCell><IconButton onClick={ (event) => { this.deleteNote(idx) } }><Icon>delete</Icon></IconButton></TableCell>
                            </TableRow>
                          )
                        })
                      }
                    </TableBody>
                  </Table>
                  :
                  <Empty
                    title="¡No hay notas!"
                    description="No se han agregado notas a la solicitud."
                  />
                }
              </Grid>
            </Grid>
          </Paper>
          </Grid>
          <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
            <Grid container>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Paper className={classes.containerPaper} style={{ marginTop: 24 }}>
                  <Grid container>
                    <Grid item xl={8} lg={8} md={8} sm={12} xs={12}>
                      <Typography variant="h6"><strong>4. Documentos de la solicitud.</strong></Typography>
                      <Typography variant="body2" style={{ fontSize: 13 }}>Receta, identificación del paciente, nota post-quirúrjica, etc.</Typography>
                      <Typography><strong>{this.state.docs.length}</strong> { (this.state.docs.length === 1) ? 'documento cargado' : 'documentos cargados' }</Typography>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={12} xs={12}>
                      <Button variant="contained" color="primary" className={classes.primaryButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                        this.setState({ openUploader: true })
                      }}>
                          SUBIR DOCUMENTOS
                      </Button>
                      <Uploader
                        open={this.state.openUploader}
                        host={Utils.constants.HOST}
                        title="Subir documentos de la solicitud."
                        description="Adjunta los documentos aquí."
                        use="orders"
                        docs={this.state.docs}
                        handleCloseWithData={(docs, deletedDocs) => { this.confirmUploader(docs, deletedDocs) }}
                        handleClose={() => { this.setState({openUploader: false}) }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Paper className={classes.containerPaper} style={{ marginTop: 24 }}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="h6"><strong>5. Comentarios adicionales.</strong></Typography>
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                      <TextField
                        className={classes.textFieldLarge}
                        placeholder="Escribir comentarios adicionales..."
                        value={this.state.comments}
                        onChange={ (event) => { this.handleChangeComments(event) } }
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <div className={classes.fixButtons}>
          <Button variant="outlined" style={{ marginRight: 8 }} onClick={ (event) => {
            this.setState({
              openConfirmDialog: true
            })
          } }>
            CANCELAR
          </Button>
          <Button variant="contained" color="primary" className={classes.primaryButton} onClick={(event) => { this.createOrder(event) }}>
            GUARDAR SOLICITUD
          </Button>
        </div>
        <ConfirmDialog
          open={this.state.openConfirmDialog}
          title="Cancelar solicitud."
          description="¿Está seguro que desea cancelar la solicitud en progreso?"
          onCancel={(this.handleCancelConfirmDialog)}
          onConfirm={this.handleAcceptConfirmDialog}
        />
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
)(NewOrder)
