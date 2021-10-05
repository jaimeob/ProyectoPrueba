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
import Empty from './Empty'
import OrderCard from './OrderCard'
import Autocomplete from './Autocomplete'
import ConsumptionItems from './ConsumptionItems'
import Uploader from './Uploader'

import Utils from '../resources/Utils'

import { requestAPI, getItemAPI, getItemsAPI } from '../api/CRUD'

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
    top: 90
  },
  orderForm: {
    position: 'fixed',
    bottom: 0,
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
    margin: '4px 0',
    padding: 0,
    width: '100%',
    backgroundColor: 'white',
  },
  select: {
    margin: '8px 0'
  },
  date: {
    margin: '16px 0'
  }
})

class ConsumptionOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openSnack: false,
      messageSnack: '',
      openUploader: false,
      showOrder: false,
      order: {
        folio: ''
      },
      docs: [
        {
          name: '',
          doc: 'Receta médica',
          format: '',
          data: '',
          required: true
        },
        {
          name: '',
          doc: 'INE paciente',
          type: '',
          format: '',
          required: true
        },
        {
          name: '',
          doc: 'Nota post-quirúrjica',
          format: '',
          data: '',
          required: false
        }
      ],
      productsAdded: [],
      anotations: [],
      items: [],
      values: {
        requesterId: '',
        hospitalId: '',
        doctorId: '',
        patientId: '',
        deliveryDate: ''
      }
    }

    this.handleAddedProducts = this.handleAddedProducts.bind(this)
    this.openUploader = this.openUploader.bind(this)

    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.handleChangeDeliveryDate = this.handleChangeDeliveryDate.bind(this)

    this.validateNewOrder = this.validateNewOrder.bind(this)
    this.fillOrder = this.fillOrder.bind(this)

    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
  }

  componentWillMount() {
    if (Utils.isUserLoggedIn()) {
      this.getData()
    }
  }

  async getData() {
    let self = this
    let response = await getItemAPI({resource: 'orders', where: {folio: this.props.match.params.id, status: {neq: 2}}, relations: ["requester", "hospital", "doctor", "patient", "pipelineDetail"]})
    if (response.status === Utils.constants.status.SUCCESS) {
      let responseAnotations = await getItemsAPI({resource: 'anotations', where: {orderId: response.data.id, status: {neq: 2}}})
      if (responseAnotations.status === Utils.constants.status.SUCCESS) {
        let responseDocs = await getItemsAPI({resource: 'documents', where: {orderId: response.data.id, status: {neq: 2}}})
        if (responseDocs.status === Utils.constants.status.SUCCESS) {
          let documents = this.state.docs
          responseDocs.data.forEach(function(doc) {
            self.state.docs.forEach(function(document, idx) {
              if (doc.doc === document.doc) {
                document = {
                  name: doc.name,
                  doc: doc.doc,
                  format: doc.format,
                  data: doc.url,
                  required: false
                }
                documents[idx] = document
              }
            })
          })
          this.setState({
            showOrder: true,
            order: response.data,
            docs: documents,
            anotations: responseAnotations.data,
            values: {
              requesterId: response.data.requesterId,
              hospitalId: response.data.hospitalId,
              doctorId: response.data.doctorId,
              patientId: response.data.patientId,
              deliveryDate: Utils.onlyDate(response.data.deliveryDate)
            }
          }, function() {
            console.log(this.state)
          })
        }
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.newOrder !== this.props.newOrder) {
      this.setState({
        openSnack: true,
        messageSnack: 'Se creó correctamente una nueva solicitud.'
      })

      this.props.history.push('/solicitudes')

    }
  }

  handleAddedProducts(products) {
    this.setState({
      productsAdded: products
    })
  }

  handleChangeValueSelect(param, newValue, required) {
    let values = this.state.values
    if (newValue === undefined) {
      values[param] = ''
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
    values.deliveryDate = date
    this.setState({
      values: values
    })
  }

  openUploader() {
    this.setState({
      openUploader: true
    })
  }

  confirmUploader(data) {
    this.setState({openUploader: false, docs: data})
  }

  getTitleForUploadButton() {
    let total = 0
    this.state.docs.forEach(function(doc) {
      if (doc.data !== "")
        total ++
    })
    if (total > 0) {
      return Utils.messages.NewOrder.uploadDocsButton + " (" + total + ")"
    }
    return Utils.messages.NewOrder.uploadDocsButton
  }

  async fillOrder(event) {
    event.preventDefault()
    if (this.validateNewOrder()) {
      let data = {
        orderId: this.state.order.id,
        products: this.state.productsAdded,
        requesterId: this.state.values.requesterId,
        hospitalId: this.state.values.hospitalId,
        doctorId: this.state.values.doctorId,
        patientId: this.state.values.patientId,
        deliveryDate: this.state.values.deliveryDate,
        docs: this.state.docs
      }

      let response = await requestAPI({resource: 'orders', endpoint: '/products/consumption', method: 'POST', data: data})

      if (response.data.ok) {
        this.props.history.push("/solicitudes")
      }

    }
    else {
      this.setState({
        openSnack: true,
        messageSnack: 'Debe cumplir con los campos obligatorios de la nueva solicitud.'
      })
    }
  }

  validateNewOrder() {
    // Validate list of concepts
    let validated = false

    // Validate documentation
    this.state.docs.forEach(function(doc) {
      if (doc.required && doc.data === "")
        return validated
    })

    // Validate values
    if (this.state.values.requesterId === "" || this.state.values.hospitalId === "" || this.state.values.doctorId === "" || this.state.values.deliveryDate === "")
      return validated

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
        <Grid container>
          {
            (this.state.showOrder) ?
            <Grid item lg={7}>
              <OrderCard
                anotations={this.state.anotations}
                documents={this.state.docs}
              />
              <ConsumptionItems
                resource="inventories"
                query="name"
                orderId={this.state.order.id}
                updateAddedProducts={(products) => this.handleAddedProducts(products)}
              />
            </Grid>
            :
            ''
          }
          <Grid item lg={4} className={classes.newOrderContainer}>
          {
            (this.state.showOrder) ?
            <div>
              <div className={classes.orderHead}>
                <Typography variant="h4" className={classes.titleStep}>{Utils.messages.FillOrder.title + "" + this.state.order.folio}</Typography>
                <Typography variant="body1" className={classes.titleStep}>{Utils.messages.FillOrder.description}</Typography>
              </div>
              <form className={classes.orderForm}>
                <div className={classes.select}>
                  <Autocomplete
                    label={Utils.messages.NewOrder.autocompletes.requester}
                    resource="requesters"
                    value={this.state.values.requesterId}
                    onChange={(newValue) => this.handleChangeValueSelect('requesterId', newValue, true)}
                  />
                </div>
                <div className={classes.select}>
                  <Autocomplete
                    label={Utils.messages.NewOrder.autocompletes.hospital}
                    resource="hospitals"
                    value={this.state.values.hospitalId}
                    onChange={(newValue) => this.handleChangeValueSelect('hospitalId', newValue, true)}
                  />
                </div>
                <div className={classes.select}>
                  <Autocomplete
                    label={Utils.messages.NewOrder.autocompletes.doctor}
                    resource="doctors"
                    value={this.state.values.doctorId}
                    onChange={(newValue) => this.handleChangeValueSelect('doctorId', newValue, true)}
                  />
                </div>
                <div className={classes.select}>
                  <Autocomplete
                    label={Utils.messages.NewOrder.autocompletes.patient}
                    resource="patients"
                    value={this.state.values.patientId}
                    onChange={(newValue) => this.handleChangeValueSelect('patientId', newValue, false)}
                  />
                </div>
                <div className={classes.date}>
                  <Typography variant="body1"><strong>{Utils.messages.NewOrder.deliveryDateHeader}:</strong></Typography>
                  <TextField
                    className={classes.textFieldForm}
                    value={this.state.values.deliveryDate}
                    onChange={(event) => { this.handleChangeDeliveryDate(event) }}
                    type="date"
                  />
                </div>


                <Button variant="text" color="primary" className={classes.btnAddDocs}
                  onClick={() => {this.openUploader()}}
                >
                  {this.getTitleForUploadButton()}
                </Button>
                <Button variant="contained" color="primary" className={classes.createButton} onClick={(event) => { this.fillOrder(event) }}>
                  Consumir
                </Button>
                <br />
                <Button variant="text" className={classes.cancelButton}>
                  Cancelar
                </Button>
              </form>
            </div>
            :
            ''
          }
          </Grid>
        </Grid>

        <Uploader
          open={this.state.openUploader}
          title={Utils.messages.NewOrder.uploaderModal.title}
          description={Utils.messages.NewOrder.uploaderModal.description}
          docs={this.state.docs}
          handleCloseWithData={(data) => { this.confirmUploader(data) }}
          handleClose={() => { this.setState({openUploader: false}) }}
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
)(ConsumptionOrder)
