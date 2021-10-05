import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import Select from 'react-select';

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Snackbar, Grid, Button, IconButton, TextField, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'

import CloseIcon from '@material-ui/icons/Close'
import Cancel from '@material-ui/icons/Cancel'
import DeleteIcon from '@material-ui/icons/Delete'

// Components
import OrderNote from '../components/OrderNote'
import SupplyOrder from '../components/SupplyOrder'
import CheckSupplyOrder from '../components/CheckSupplyOrder'
import Autocomplete from '../components/Autocomplete'
import Uploader from '../components/Uploader'
import CheckSupplyModal from '../components/CheckSupplyModal'
import Loading from '../components/Loading'

import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Empty from '../components/Empty';

import sleepImg from '../resources/images/sleep.svg'

const styles = theme => ({
  container: {
    marginTop: 48
  },
  titleStep: {
    fontWeight: 700
  },
  newOrderContainer: {
    position: 'absolute',
    right: 0,
    width: '33%',
    marginTop: -24,
    padding: 32,
    boxShadow: '1px 1px 0.5em ' + theme.palette.border.main,
    height: '100%'
  },
  textField: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'white',
  },
  deleteButton: {
    float: 'right'
  },
  orderHead: {
    position: 'fixed',
    width: '27%',
    top: 90
  },
  orderForm: {
    position: 'fixed',
    bottom: -20,
    right: 0,
    width: '27%',
    padding: '3.6%'
  },
  btnAddDocs: {
    width: '100%',
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'left'
  },
  createButton: {
    width: '100%',
    fontWeight: 700
  },
  cancelButton: {
    marginTop: 8,
    width: '100%',
    fontWeight: 700
  },
  textFieldForm: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'white',
  },
  select: {
    margin: '8px 0'
  },
  date: {
    margin: '16px 0'
  },
  comments: {
    margin: '16px 0'
  }
})

const ACTIONS = {
  WITHOUT_CHECKING: 0,
  ERROR_SUPPLY: 1,
  OK_SUPPLY: 2
}

class OrderForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openSnack: false,
      messageSnack: '',
      openUploader: false,
      textInputDisabled: false,
      openCheckSupplyModal: false,
      data: null,
      deletedDocs: [],
      docs: [],
      deletedNotes: [],
      notes: [],
      products: [],
      values: {
        requesterId: null,
        hospitalId: null,
        doctorId: null,
        patientId: null,
        deliveryDate: null,
        comments: ''
      }
    }

    this.getTitle = this.getTitle.bind(this)
    this.getDescription = this.getDescription.bind(this)

    this.updateNotes = this.updateNotes.bind(this)
    this.openUploader = this.openUploader.bind(this)

    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.handleChangeDeliveryDate = this.handleChangeDeliveryDate.bind(this)

    this.execButtonAction = this.execButtonAction.bind(this)
    this.validateOrderForm = this.validateOrderForm.bind(this)
    this.createOrder = this.createOrder.bind(this)
    this.updateOrder = this.updateOrder.bind(this)
    this.supplyOrder = this.supplyOrder.bind(this)
    this.checkSupplyOrder = this.checkSupplyOrder.bind(this)
    this.confirmCheckSupplyOrder = this.confirmCheckSupplyOrder.bind(this)
    this.reSupplyOrder = this.reSupplyOrder.bind(this)

    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
  }

  async componentWillMount() {
    if (this.props.orderFolio !== undefined) {
      let response = await requestAPI({
        host: this.props.host,
        method: 'GET',
        resource: this.props.origin.resourcePlural,
        endpoint: '/' + this.props.orderFolio + '/entity'
      })

      let notes = []
      response.data.notes.forEach(function(item) {
        notes.push({id: item.id, description: item.note, status: item.status})
      })

      let disabled = false
      if (this.props.mode === 'supply' || this.props.mode === 'checkSupply' || this.props.mode === 'reSupply' || this.props.mode === 'consume') {
        disabled = true
      }

      this.setState({
        textInputDisabled: disabled,
        data: response.data,
        notes: notes,
        docs: response.data.documents,
        values: {
          requesterId: response.data.requesterId,
          hospitalId: response.data.hospitalId,
          doctorId: response.data.doctorId,
          patientId: response.data.patientId,
          deliveryDate: response.data.deliveryDate,
          comments: response.data.comments
        }
      })
    }
  }

  getTitle() {
    if (this.props.mode === 'create') {
      return Utils.messages.OrderForm.title
    }
    else if (this.props.mode === 'update') {
      return Utils.messages.OrderForm.titleUpdate
    }
    else if (this.props.mode === 'supply') {
      return Utils.messages.OrderForm.titleSupply
    }
    else if (this.props.mode === 'checkSupply') {
      return Utils.messages.OrderForm.titleCheckSupply
    }
    else if (this.props.mode === 'reSupply') {
      return 'Re-surtir solicitud.'
    }
    else if (this.props.mode === 'consume') {
      return Utils.messages.OrderForm.titleConsume
    }
    else {
      return ''
    }
  }

  getDescription() {
    if (this.props.mode === 'create') {
      return Utils.messages.OrderForm.description
    }
    else if (this.props.mode === 'update') {
      return Utils.messages.OrderForm.descriptionUpdate
    }
    else if (this.props.mode === 'supply') {
      return Utils.messages.OrderForm.descriptionSupply
    }
    else if (this.props.mode === 'checkSupply') {
      return Utils.messages.OrderForm.descriptionCheckSupply
    }
    else if (this.props.mode === 'reSupply') {
      return 'Datos de la solicitud'
    }
    else if (this.props.mode === 'consume') {
      return Utils.messages.OrderForm.descriptionComnsume
    }
    else {
      return ''
    }
  }

  getTitleMainButton() {
    if (this.props.mode === 'create') {
      return Utils.messages.OrderForm.confirmCreateOrderButton
    }
    else if (this.props.mode === 'update') {
      return Utils.messages.OrderForm.confirmUpdateOrderButton
    }
    else if (this.props.mode === 'supply') {
      return Utils.messages.OrderForm.confirmSupplyOrderButton
    }
    else if (this.props.mode === 'checkSupply') {
      return Utils.messages.OrderForm.confirmCheckSupplyOrderButton
    }
    else if (this.props.mode === 'reSupply') {
      return 'RE-SURTIR SOLICITUD'
    }
    else if (this.props.mode === 'consume') {
      return Utils.messages.OrderForm.confirmConsumeOrderButton
    }
    else {
      return '-'
    }
  }

  updateNotes(notes, deletedNotes) {
    this.setState({notes: notes, deletedNotes: deletedNotes})
  }

  handleChangeValueSelect(param, newValue) {
    let values = this.state.values
    if (newValue === null) {
      values[param] = null
    }
    else {
      values[param] = newValue.id
    }
    this.setState({
      values: values
    })
  }

  handleChangeDeliveryDate(event) {
    let date = event.target.value
    let values = this.state.values
    if (Utils.isEmpty(date))
      date = null
    values.deliveryDate = date
    this.setState({
      values: values
    })
  }

  handleChangeComments(event) {
    let values = this.state.values
    values.comments = event.target.value
    this.setState({
      values: values
    })
  }

  openUploader() {
    this.setState({
      openUploader: true
    })
  }

  confirmUploader(docs, deletedDocs) {
    this.setState({openUploader: false, docs: docs, deletedDocs, deletedDocs})
  }

  getTitleForUploadButton() {
    let total = 0
    this.state.docs.forEach(function(doc) {
      if (doc.data !== "")
        total ++
    })

    if (this.props.mode === 'create' || this.props.mode === 'update') {
      if (total > 0) {
        return Utils.messages.OrderForm.uploadButton + " (" + total + ")"
      }
      return Utils.messages.OrderForm.uploadButton
    }
    else {
      if (total === 1) {
        return total + " DOCUMENTO CARGADO"
      }
      else if (total > 1) {
        return total + " DOCUMENTOS CARGADOS"
      }
      return 'SIN DOCUMENTACIÓN'
    }
  }

  execButtonAction(event) {
    if (this.props.mode === 'create') {
      this.createOrder(event)
    }
    else if (this.props.mode === 'update') {
      this.updateOrder(event)
    }
    else if (this.props.mode === 'supply') {
      this.supplyOrder(event)
    }
    else if (this.props.mode === 'checkSupply') {
      this.checkSupplyOrder(event)
    }
    else if (this.props.mode === 'reSupply') {
      this.reSupplyOrder(event)
    }
  }

  async createOrder(event) {
    event.preventDefault()
    let user = await Utils.getCurrentUser()
    if (this.validateOrderForm()) {
      let response = await requestAPI({
        host: this.props.host,
        method: 'POST',
        resource: 'orders',
        endpoint: '/create',
        data: {
          branchId: user.branchId,
          capturedBy: user.id,
          notes: this.state.notes,
          docs: this.state.docs,
          requesterId: this.state.values.requesterId,
          hospitalId: this.state.values.hospitalId,
          doctorId: this.state.values.doctorId,
          patientId: this.state.values.patientId,
          deliveryDate: this.state.values.deliveryDate,
          comments: this.state.values.comments,
        }
      })
      if (response.status === Utils.constants.status.SUCCESS) {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.OrderForm.addOk
        })
        this.props.history.push('/solicitudes')
      }
      else {
        let messageSnack = Utils.messages.General.error
        if (response.data.error.errno === 1062) {
          messageSnack = Utils.messages.General.duplicateError
        }
        this.setState({
          openSnack: true,
          messageSnack: messageSnack
        })
      }
    }
    else {
      this.setState({
        openSnack: true,
        messageSnack: Utils.messages.OrderForm.emptyAnotationsDescription
      })
    }
  }

  async updateOrder(event) {
    event.preventDefault()
    let user = await Utils.getCurrentUser()
    if (this.validateOrderForm()) {
      let response = await requestAPI({
        host: this.props.host,
        method: 'PATCH',
        resource: 'orders',
        endpoint: '/update',
        data: {
          old: this.state.data,
          deletedNotes: this.state.deletedNotes,
          notes: this.state.notes,
          deletedDocs: this.state.deletedDocs,
          docs: this.state.docs,
          requesterId: this.state.values.requesterId,
          hospitalId: this.state.values.hospitalId,
          doctorId: this.state.values.doctorId,
          patientId: this.state.values.patientId,
          deliveryDate: this.state.values.deliveryDate,
          comments: this.state.values.comments,
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.OrderForm.addOk
        })
        this.props.history.push('/solicitudes')
      }
      else {
        let messageSnack = Utils.messages.General.error
        if (response.data.error.errno === 1062) {
          messageSnack = Utils.messages.General.duplicateError
        }
        this.setState({
          openSnack: true,
          messageSnack: messageSnack
        })
      }
    }
    else {
      this.setState({
        openSnack: true,
        messageSnack: Utils.messages.OrderForm.emptyAnotationsDescription
      })
    }
  }

  async supplyOrder(event) {
    event.preventDefault()
    let user = await Utils.getCurrentUser()
    if (this.validateOrderForm()) {
      if (this.state.products <= 0) {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.supplyError
        })
      }
      else {
        let supplyOk = true
        this.state.products.forEach(function(product) {
          if (product.toSupply === undefined || Number(product.toSupply) <= 0) {
            supplyOk = false
          }
        })

        if (supplyOk) {
          let response = await requestAPI({
            host: this.props.host,
            method: 'PATCH',
            resource: 'orders',
            endpoint: '/supply',
            data: {
              orderId: this.state.data.id,
              suppliedBy: user.id,
              products: this.state.products
            }
          })
          if (response.status === Utils.constants.status.SUCCESS) {
            this.setState({
              openSnack: true,
              messageSnack: Utils.messages.OrderForm.addOk
            })
            this.props.history.push('/solicitudes')
          }
          else {
            let messageSnack = Utils.messages.General.error
            if (response.data.error.errno === 1062) {
              messageSnack = Utils.messages.General.duplicateError
            }
            this.setState({
              openSnack: true,
              messageSnack: messageSnack
            })
          }
        }
        else {
          this.setState({
            openSnack: true,
            messageSnack: Utils.messages.General.supplyError
          })
        }
      }
    }
    else {
      this.setState({
        openSnack: true,
        messageSnack: Utils.messages.OrderForm.emptyAnotationsDescription
      })
    }
  }

  async checkSupplyOrder(event) {
    event.preventDefault()
    let user = await Utils.getCurrentUser()
    if (this.validateOrderForm()) {
      let openSnack = false
      let messageSnack = ''
      this.state.products.forEach(function(product) {
        if (product.supplyStatus === ACTIONS.WITHOUT_CHECKING) {
          openSnack = true
          messageSnack = 'Revisión de productos surtidos incompleta.'
        }
      })

      if (openSnack) {
        this.setState({
          openSnack: openSnack,
          messageSnack: messageSnack
        })
      }
      else {
        this.setState({
          openCheckSupplyModal: true
        })
      }
    }
    else {
      this.setState({
        openSnack: true,
        messageSnack: Utils.messages.OrderForm.emptyAnotationsDescription
      })
    }
  }

  async confirmCheckSupplyOrder(observations) {
    
    this.setState({openCheckSupplyModal: false})
    let user = await Utils.getCurrentUser()

    let messageSnack = ''

    let response = await requestAPI({
      host: this.props.host,
      method: 'PATCH',
      resource: 'orders',
      endpoint: '/check',
      data: {
        orderId: this.state.data.id,
        checkedBy: user.id,
        observations: observations,
        products: this.state.products
      }
    })
    if (response.status === Utils.constants.status.SUCCESS) {
      this.setState({
        openSnack: true,
        messageSnack: Utils.messages.OrderForm.addOk
      })
      this.props.history.push('/solicitudes')
    }
    else {
      messageSnack = Utils.messages.General.error
      if (response.data.error.errno === 1062) {
        messageSnack = Utils.messages.General.duplicateError
      }
      this.setState({
        openSnack: true,
        messageSnack: messageSnack
      })
    }
  }

  async reSupplyOrder(event) {
    event.preventDefault()
    let user = await Utils.getCurrentUser()
    if (this.validateOrderForm()) {
      if (this.state.products <= 0) {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.supplyError
        })
      }
      else {
        let supplyOk = true
        this.state.products.forEach(function(product) {
          if (product.toSupply === undefined || Number(product.toSupply) <= 0) {
            supplyOk = false
          }
        })

        if (supplyOk) {
          let response = await requestAPI({
            host: this.props.host,
            method: 'PATCH',
            resource: 'orders',
            endpoint: '/supply',
            data: {
              orderId: this.state.data.id,
              suppliedBy: user.id,
              products: this.state.products
            }
          })
          if (response.status === Utils.constants.status.SUCCESS) {
            this.setState({
              openSnack: true,
              messageSnack: Utils.messages.OrderForm.addOk
            })
            this.props.history.push('/solicitudes')
          }
          else {
            let messageSnack = Utils.messages.General.error
            if (response.data.error.errno === 1062) {
              messageSnack = Utils.messages.General.duplicateError
            }
            this.setState({
              openSnack: true,
              messageSnack: messageSnack
            })
          }
        }
        else {
          this.setState({
            openSnack: true,
            messageSnack: Utils.messages.General.supplyError
          })
        }
      }
    }
    else {
      this.setState({
        openSnack: true,
        messageSnack: Utils.messages.OrderForm.emptyAnotationsDescription
      })
    }
  }

  validateOrderForm() {
    if (this.state.notes.length === 0) {
      return false
    }
    return true
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false
    })
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        {
          (this.props.mode === 'create' || this.state.data !== null) ?
          <Grid container>
          <Grid item lg={7}>
            {
              (this.props.mode === 'create' || (this.props.mode === 'update' && this.state.data !== null)) ?
              <OrderNote
                mode={this.props.mode}
                notes={this.state.notes}
                updateNotes={(notes, deletedNotes) => { this.updateNotes(notes, deletedNotes) }}
              />
              :
              ((this.props.mode === 'supply' || this.props.mode === 'reSupply') && this.state.data !== null) ?
              <SupplyOrder
                host={this.props.host}
                order={this.state.data}
                mode={this.props.mode}
                updateNotes={(notes) => {
                  this.setState({
                    products: notes
                  })
                }}
              />
              :
              (this.props.mode === 'checkSupply' && this.state.data !== null) ?
              <CheckSupplyOrder
                host={this.props.host}
                order={this.state.data}
                supplyRevision={(products) => {
                  this.setState({
                    products: products
                  })
                }}
              />
              :
              <Loading />
            }
          </Grid>
          {
            (this.props.mode === 'create' || this.state.data !== null) ?
            <Grid item lg={4} className={classes.newOrderContainer}>
              <div className={classes.orderHead}>
                <Typography variant="h4" className={classes.titleStep}>{this.getTitle()}</Typography>
                <Typography variant="body1" className={classes.titleStep}>{this.getDescription()}</Typography>
              </div>
              <form className={classes.orderForm}>
                <div className={classes.select}>
                  <Autocomplete
                    isDisabled={this.state.textInputDisabled}
                    label={Utils.messages.OrderForm.autocompletes.requester}
                    host={this.props.host} 
                    resource="requesters"
                    param="name"
                    value={this.state.values.requesterId}
                    onChange={(newValue) => this.handleChangeValueSelect('requesterId', newValue)}
                    addToCatalog={true}
                    messages={Utils.messages.OrderForm.quickModal.requesters}
                    createParams={
                      [
                        {
                          name: 'name',
                          type: 'string',
                          required: true
                        }
                      ]
                    }
                  />
                </div>
                <div className={classes.select}>
                  <Autocomplete
                    isDisabled={this.state.textInputDisabled}
                    label={Utils.messages.OrderForm.autocompletes.hospital}
                    host={this.props.host}
                    resource="hospitals"
                    param="name"
                    value={this.state.values.hospitalId}
                    onChange={(newValue) => this.handleChangeValueSelect('hospitalId', newValue)}
                    addToCatalog={true}
                    messages={Utils.messages.OrderForm.quickModal.hospitals}
                    createParams={
                      [
                        {
                          name: 'name',
                          type: 'string',
                          required: true
                        }
                      ]
                    }
                  />
                </div>
                <div className={classes.select}>
                  <Autocomplete
                    isDisabled={this.state.textInputDisabled}
                    label={Utils.messages.OrderForm.autocompletes.doctor}
                    host={this.props.host}
                    resource="doctors"
                    param="fullName"
                    searchParams={["firstName", "lastName"]}
                    value={this.state.values.doctorId}
                    onChange={(newValue) => this.handleChangeValueSelect('doctorId', newValue)}
                    addToCatalog={true}
                    messages={Utils.messages.OrderForm.quickModal.doctors}
                    createParams={
                      [
                        {
                          name: 'firstName',
                          type: 'string',
                          required: true
                        },
                        {
                          name: 'lastName',
                          type: 'string',
                          required: false
                        }
                      ]
                    }
                  />
                </div>
                <div className={classes.select}>
                  <Autocomplete
                    isDisabled={this.state.textInputDisabled}
                    label={Utils.messages.OrderForm.autocompletes.patient}
                    host={this.props.host}
                    resource="patients"
                    param="fullName"
                    searchParams={["firstName", "lastName"]}
                    value={this.state.values.patientId}
                    onChange={(newValue) => this.handleChangeValueSelect('patientId', newValue)}
                    addToCatalog={true}
                    messages={Utils.messages.OrderForm.quickModal.patients}
                    createParams={
                      [
                        {
                          name: 'firstName',
                          type: 'string',
                          required: true
                        },
                        {
                          name: 'lastName',
                          type: 'string',
                          required: false
                        }
                      ]
                    }

                  />
                </div>
                <div className={classes.date}>
                  <Typography variant="body1"><strong>{Utils.messages.OrderForm.deliveryDateLabel}:</strong></Typography>
                  <TextField
                    disabled={this.state.textInputDisabled}
                    className={classes.textFieldForm}
                    value={Utils.onlyDate(this.state.values.deliveryDate)}
                    onChange={(event) => { this.handleChangeDeliveryDate(event) }}
                    type="date"
                  />
                </div>
                <div className={classes.comments}>
                  <Typography variant="body1"><strong>{Utils.messages.OrderForm.commentsLabel}:</strong></Typography>
                  <TextField
                    disabled={this.state.textInputDisabled}
                    placeholder={Utils.messages.OrderForm.commentsLabel + "..."}
                    className={classes.textFieldForm}
                    value={this.state.values.comments}
                    onChange={(event) => { this.handleChangeComments(event) }}
                    type="text"
                  />
                </div>
                {
                  <Button disabled={this.state.textInputDisabled} variant="text" color="primary" className={classes.btnAddDocs}
                  onClick={() => {this.openUploader()}}
                  >
                    {this.getTitleForUploadButton()}
                  </Button>
                }
                <Button variant="contained" color="primary" className={classes.createButton} onClick={(event) => { this.execButtonAction(event) }}>
                  {this.getTitleMainButton()}
                </Button>
                <br />
                <Button variant="text" className={classes.cancelButton} onClick={(event) => { this.props.history.push(Utils.constants.paths.order) }}>
                  {Utils.messages.OrderForm.cancelButton}
                </Button>
              </form>
            </Grid>
            :
            <Loading />
          }
        </Grid>
          :
          <Empty
            title="Cargando..."
            description="Espere un momento por favor."
            emptyImg={sleepImg}
          />
        }
        <Uploader
          open={this.state.openUploader}
          host={this.props.host}
          title={Utils.messages.OrderForm.uploaderModal.title}
          description={Utils.messages.OrderForm.uploaderModal.description}
          use="orders"
          docs={this.state.docs}
          handleCloseWithData={(docs, deletedDocs) => { this.confirmUploader(docs, deletedDocs) }}
          handleClose={() => { this.setState({openUploader: false}) }}
        />

        <CheckSupplyModal
          open={this.state.openCheckSupplyModal}
          host={this.props.host}
          title="¿Surtido correcto?"
          description="Elige una opción..."
          use="orders"
          onCancel={() => { this.setState({openCheckSupplyModal: false}) }}
          onConfirm={(observations) => { this.confirmCheckSupplyOrder(observations) }}
        />

        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          open={this.state.openSnack}
          onClose={this.handleCloseSnackbar}
          message={
            <span>{this.state.messageSnack}</span>
          }
          action={[
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
)(OrderForm)
