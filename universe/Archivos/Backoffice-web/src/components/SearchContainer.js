import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Snackbar, IconButton, TextField, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import CloseIcon from '@material-ui/icons/Close'

// Components
import Empty from './Empty'
import SearchProduct from './SearchProduct'

import Utils from '../resources/Utils'

import { getItemsAPI } from '../api/CRUD'

const styles = theme => ({
  container: {
    marginTop: 16
  },
  titleStep: {
    fontWeight: 700
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
  fitCell: {
    width: '1%',
    padding: 0,
    margin: 0,
    paddingLeft: '3%'
  },
  cell: {
    width: '3%',
    padding: 0,
    margin: 0,
    paddingLeft: '3%'
  },
  fatCell: {
    width: '8%'
  },
  productRow: {
    height: '1%',
    padding: 0,
    margin: 0
  }
})

class SearchContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openSnack: '',
      messageSnack: '',
      product: null,
      products: [],
      values: [],
      queryText: ''
    }

    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.changeQueryText = this.changeQueryText.bind(this)
    this.addProduct = this.addProduct.bind(this)
    this.removeProduct = this.removeProduct.bind(this)
    this.handleChangeQuantityValue = this.handleChangeQuantityValue.bind(this)

    this.getProductValue = this.getProductValue.bind(this)
  }

  componentWillMount() {
    this.setState({
      products: this.props.products
    })
  }
  
  getProductValue(idx, param) {
    if (param === 'stock') {
      return this.state.products[idx][param]
    }
    else {
      if (this.props.mode === 'reSupply') {
        return this.state.products[idx][param]
      }
      else {
        return this.state.products[idx].product[param]
      }
    }
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false
    })
  }

  handleChangeQuantityValue(idx, event) {
    let values = this.state.values
    values[idx] = event.target.value
    this.setState({
      values: values
    }, function() {
      this.addProduct(idx)
    })
  }

  addProduct(idx) {
    let toSupply = 0
    if (!Utils.isEmpty(this.state.values[idx])) {
      let products = this.state.products
      if (Number(this.state.values[idx]) <= 0) {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.minZero
        })
      }
      else if (Number(this.state.values[idx]) > Number(products[idx].stock)) {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.maxStock
        })
      }
      else {
        toSupply = Number(this.state.values[idx])
      }
      products[idx].toSupply = toSupply
      this.setState({
        products: products
      }, function() {
        this.props.updateItems(products)
      })
    }
  }

  removeProduct(idx) {
    let products = this.state.products
    let values = this.state.values
    products.splice(idx, 1)
    values.splice(idx, 1)
    this.setState({
      products: products,
      values: values
    })
    this.props.updateItems(products)
  }

  changeQueryText(event) {
    this.setState({
      queryText: event.target.value
    })
  }

  handleChangeValueSelect(param, newValue) {
    let self = this
    let values = this.state.values
    let products = this.state.products
    if (newValue === null) {
      values[param] = null
    }
    else {
      values[param] = newValue.id
      if (products.length === 0) {
        products.unshift(newValue.data)
      }
      else {
        let exist = false
        products.forEach(function(item, idx) {
          if (self.props.mode === 'reSupply') {
            if (item.sku === newValue.data.product.sku) {
              exist = true
            }
          }
          else {
            if (item.product.sku === newValue.data.product.sku) {
              exist = true
            }
          }
        })

        if (!exist) {
          products.unshift(newValue.data)
        }
      }
    }

    this.setState({
      values: values,
      products: products
    }, function() {
      this.props.updateItems(products)
    })
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <SearchProduct
          label={Utils.messages.OrderForm.search.title}
          host={this.props.host}
          resource="inventories"
          relations={["product"]}
          filters={{where: {stock: {neq: 0}, status: {neq: 2}, limit: 50}, include: ["product"]}}
          param="inventory.product.name"
          value={this.state.product}
          onChange={(newValue) => this.handleChangeValueSelect('product', newValue)}
          clearToSelect={true}
        />

        {
          (this.state.products.length <= 0) ?

          <div className={classes.container}>
            <Empty
              title={Utils.messages.OrderForm.search.emptyTitle}
              description={Utils.messages.OrderForm.search.emptyDescription}
            />
          </div>

          :

          <Paper className={classes.container}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.fitCell}><strong>{Utils.messages.OrderForm.search.headers.sku}</strong></TableCell>
                  <TableCell className={classes.fatCell}><strong>{Utils.messages.OrderForm.search.headers.productName}</strong></TableCell>
                  <TableCell className={classes.fitCell}><strong>{Utils.messages.OrderForm.search.headers.inStock}</strong></TableCell>
                  {
                    (this.props.mode === 'supply') ?
                    <TableCell className={classes.cell}><strong>{Utils.messages.OrderForm.search.headers.toSupply}</strong></TableCell>
                    :
                    <TableCell className={classes.cell}><strong>Re-surtir</strong></TableCell>
                  }
                  {
                    (this.props.mode === 'supply') ?
                    <TableCell className={classes.fitCell}></TableCell>
                    :
                    ''
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.products.map((product, idx) => (
                  <TableRow key={idx} className={classes.productRow}>
                    <TableCell component="th" scope="item" className={classes.fitCell}>
                      {this.getProductValue(idx, 'sku')}
                    </TableCell>
                    <TableCell component="th" scope="item" className={classes.fatCell}>
                      {this.getProductValue(idx, 'name')}
                    </TableCell>
                    <TableCell component="th" scope="item" className={classes.fitCell}>
                      {this.getProductValue(idx, 'stock')}
                    </TableCell>
                    <TableCell component="th" scope="item" className={classes.cell}>
                      <TextField
                        className={classes.textField}
                        type="number"
                        placeholder="Cant."
                        value={this.state.values[idx]}
                        onChange={(event) => { this.handleChangeQuantityValue(idx, event) }}
                      />
                    </TableCell>
                    {
                      (this.props.mode === 'supply') ?
                      <TableCell scope="item">
                        <IconButton className={classes.deleteButton}
                          onClick={() => { this.removeProduct(idx) }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      :
                      ''
                    }
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        }
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

export default compose(
  withTheme(),
  withStyles(styles),
)(SearchContainer)
