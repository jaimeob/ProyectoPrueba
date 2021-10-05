import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { IconButton, TextField, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'

// Components
import Empty from './Empty'
import Autocomplete from './Autocomplete'

import Utils from '../resources/Utils'

const styles = theme => ({
  container: {
    marginTop: 48
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
  }
})

class NewShoppingLines extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      selectedProduct: ''
    }

    this.handleChangeProductQuantity = this.handleChangeProductQuantity.bind(this)
    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.addItem = this.addItem.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
  }

  handleChangeProductQuantity(idx, event) {
    let products = this.state.products
    products[idx].quantity = event.target.value
    this.setState({
      products: products
    })
    this.props.updateProducts(products)
  }


  handleChangeValueSelect(param, newValue) {
    if (newValue !== undefined) {
      newValue.quantity = 0
      this.addItem(newValue)
    }
  }

  addItem(newValue) {
    let products = this.state.products
    products.unshift(newValue)
    this.setState({
      products: products,
      selectedProduct: ''
    })
    this.props.updateProducts(products)
  }

  deleteItem(idx) {
    let products = this.state.products
    products.splice(idx, 1)
    this.setState({
      products: products
    })
    this.props.updateProducts(products)
  }

  render() {

    let autcompleteFilter = {
      where: {
        status: 1
      },
      include: ["measurement"],
      limit: 10
    }

    const { classes } = this.props
    return (
      <div>
        <Typography variant="body1" className={classes.titleStep}>{Utils.messages.NewShopping.title}</Typography>
        <Autocomplete
          resource="products"
          param="name"
          filters={autcompleteFilter}
          value={this.state.selectedProduct}
          onChange={(newValue) => this.handleChangeValueSelect('selectedProduct', newValue)}
        />
        {
          (this.state.products.length <= 0) ?

          <div className={classes.container}>
            <Empty
              title="Carrito vacio"
              description="No has ingresado productos al carrito de compra"
            />
          </div>

          :

          <Paper className={classes.container}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{Utils.messages.NewShopping.titleList}</strong></TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Costo</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.products.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell component="th" scope="item">
                      {item.label}
                    </TableCell>
                    <TableCell component="th" scope="item">
                      {item.data.measurement.name}
                    </TableCell>
                    <TableCell component="th" scope="item">
                      <TextField 
                        type="number"
                        value={this.state.products[idx].quantity}
                        onChange={(event) => this.handleChangeProductQuantity(idx, event)}
                      />
                    </TableCell>
                    <TableCell component="th" scope="item">
                      $ {Utils.numberWithCommas(item.data.cost.toFixed(2))}
                    </TableCell>
                    <TableCell scope="item">
                      <IconButton className={classes.deleteButton}
                        onClick={() => { this.deleteItem(idx) }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
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
)(NewShoppingLines)
