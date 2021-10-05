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
import NewShoppingLines from './NewShoppingLines'
import Autocomplete from './Autocomplete'
import Uploader from './Uploader'

import Utils from '../resources/Utils'
import { requestGetDataAutocomplete } from '../actions/actionAutocomplete'
import { addDataAPI } from '../api/CRUD'

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
  total: {
    position: 'fixed',
    top: 180
  },
  titleTotal: {
    color: 'green',
    fontWeight: 800
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

class NewShopping extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openSnack: false,
      messageSnack: '',
      products: [],
      total: 0,
      values: {
        branchId: '',
        supplierId: '',
        requieredDeliveryDate: '',
        comments: ''
      }
    }

    this.updateProducts = this.updateProducts.bind(this)

    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.handleChangeDeliveryDate = this.handleChangeDeliveryDate.bind(this)
    this.handleChangeComments = this.handleChangeComments.bind(this)

    this.validateNewShopping = this.validateNewShopping.bind(this)
    this.createNewShopping = this.createNewShopping.bind(this)

    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
  }

  updateProducts(products) {
    let total = 0
    products.forEach(function(product) {
      total += (Number(product.quantity) * Number(product.data.cost))
    })
    this.setState({
      products: products,
      total: total
    })
  }

  handleChangeValueSelect(param, newValue) {
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
    let values = this.state.values
    values.requieredDeliveryDate = event.target.value
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

  async createNewShopping(event) {
    event.preventDefault()
    if (this.validateNewShopping()) {
      let response = await addDataAPI({
        resource: 'shoppings',
        data: {
          products: this.state.products,
          branchId: this.state.values.branchId,
          supplierId: this.state.values.supplierId,
          comments: this.state.values.comments,
          requieredDeliveryDate: this.state.values.requieredDeliveryDate,
          total: this.state.total
        }
      })
      if (response.status === Utils.constants.status.SUCCESS) {
        this.setState({
          openSnack: true,
          errorMessage: 'Se ha creado correctamente la nueva compra.'
        })
        this.props.history.push('/compras')
      }
      else {
        let errorMessage = Utils.messages.General.error
        if (response.data.error.errno === 1062) {
          errorMessage = this.props.messages.errors.duplicate
        }
        this.setState({
          openSnack: true,
          errorMessage: errorMessage
        })
      }
    }
    else {
      this.setState({
        openSnack: true,
        messageSnack: 'Debe cumplir con los campos obligatorios de la nueva solicitud.'
      })
    }
  }

  validateNewShopping() {
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
      <div></div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    requestGetDataAutocomplete: (request) => {
      dispatch(requestGetDataAutocomplete(request))
    }
  }
}

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(NewShopping)
