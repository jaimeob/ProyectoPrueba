import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { IconButton, TextField, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'

import AddIcon from '@material-ui/icons/Cancel'
import DeleteIcon from '@material-ui/icons/Check'

// Components
import Empty from './Empty'

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
  true: {
    background: 'green'
  },
  false: {

  }
})

class ConsumptionItems extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      values: [],
      queryText: ''
    }

    this.changeQueryText = this.changeQueryText.bind(this)
    this.addProduct = this.addProduct.bind(this)
    this.removeProduct = this.removeProduct.bind(this)
    this.setNewValue = this.setNewValue.bind(this)
  }

  async componentWillMount() {
    let responseInventories = await getItemsAPI({resource: 'order-products', where: {orderId: this.props.orderId, status: {neq: 2}}, relations: ["product", "inventory"]})
    let products = []
    responseInventories.data.forEach(function(product) {
      product.consumption = false
      product.toConsumption = 0
      products.push(product)
    })
    this.setState({products: products})
  }

  search(event) {

  }

  setNewValue(idx, event) {
    let values = this.state.values
    values[idx] = event.target.value
    this.setState({
      values: values
    })
  }

  addProduct(idx) {
    let products = this.state.products
    products[idx].consumption = true
    products[idx].toConsumption = Number(this.state.values[idx])
    this.setState({
      products: products
    })
    this.props.updateAddedProducts(products)
  }

  removeProduct(idx) {
    let products = this.state.products
    products[idx].consumption = false
    products[idx].toConsumption = 0
    this.setState({
      products: products
    })
    this.props.updateAddedProducts(products)
  }

  changeQueryText(event) {
    this.setState({
      queryText: event.target.value
    })
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <Typography variant="body1" className={classes.titleStep}>Productos en inventario.</Typography>
        <TextField
          className={classes.textField}
          placeholder="Ingresa un valor para comenzar con la búsqueda..."
          autoFocus={true}
          value={this.state.queryText}
          onChange={(event) => { this.changeQueryText(event) }}
          onKeyPress={(event) => { this.search(event) }}
        />
        {
          (this.state.products.length <= 0) ?

          <div className={classes.container}>
            <Empty
              title="No hay productos"
              description="No se han encontrado productos para mostrar."
            />
          </div>

          :

          <Paper className={classes.container}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>SKU</strong></TableCell>
                  <TableCell><strong>Nombre del producto</strong></TableCell>
                  <TableCell><strong>Surtido</strong></TableCell>
                  <TableCell><strong>Consumo</strong></TableCell>
                  <TableCell><strong></strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.products.map((product, idx) => (
                  <TableRow key={idx} className={product.consumption}>
                    <TableCell component="th" scope="item">
                      {product.product.sku}
                    </TableCell>
                    <TableCell component="th" scope="item">
                      {product.product.name}
                    </TableCell>
                    <TableCell component="th" scope="item">
                      {product.quantity}
                    </TableCell>
                    <TableCell component="th" scope="item">
                      <TextField
                        className={classes.textField}
                        type="number"
                        placeholder="Cant"
                        disabled={product.consumption}
                        value={this.state.values[idx]}
                        onChange={(event) => { this.setNewValue(idx, event) }}
                      />
                    </TableCell>
                    {
                      (product.consumption) ?
                      <TableCell scope="item">
                        <IconButton className={classes.deleteButton}
                          onClick={() => { this.removeProduct(idx) }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      :
                      <TableCell scope="item">
                        <IconButton className={classes.deleteButton}
                          onClick={() => { this.addProduct(idx) }}
                        >
                          <AddIcon />
                        </IconButton>
                      </TableCell>
                    }
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

        }
      </div>
    )
  }
}

export default compose(
  withTheme(),
  withStyles(styles),
)(ConsumptionItems)
