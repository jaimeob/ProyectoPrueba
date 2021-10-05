import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, IconButton, TextField, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'

import ErrorIcon from '@material-ui/icons/Cancel'
import CheckIcon from '@material-ui/icons/CheckCircle'

import emptyImg from '../resources/images/empty.svg'
import sleepImg from '../resources/images/sleep.svg'

// Components
import Empty from './Empty'
import OrderCard from '../components/OrderCard'

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
  },
  notCheck: {
    opacity: 0.5
  },
  check: {
    opacity: 1.0
  }
})

const ACTIONS = {
  WITHOUT_CHECKING: 0,
  ERROR_SUPPLY: 1,
  OK_SUPPLY: 2
}

class CheckSupplyOrder extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      itemsToPrint: [],
      txtAddItem: '',
      emptyTitle: Utils.messages.General.loadTitle,
      emptyDescription: Utils.messages.General.loadDescription
    }

    this.checkProduct = this.checkProduct.bind(this)
  }

  componentWillMount() {
    let order = this.props.order
    order.lines.forEach(function(line) {
      line.supplyStatus = ACTIONS.WITHOUT_CHECKING
    })
    this.setState({
      order: order
    }, function() {
      this.props.supplyRevision(this.state.order.lines)
    })
  }

  checkProduct(idx, action) {
    let order = this.state.order
    let products = order.lines
    let product = products[idx]

    if (action === ACTIONS.ERROR_SUPPLY) {
      if (product.supplyStatus === ACTIONS.ERROR_SUPPLY) {
        product.supplyStatus = ACTIONS.WITHOUT_CHECKING
      }
      else {
        product.supplyStatus = ACTIONS.ERROR_SUPPLY
      }
    }
    else {
      if (product.supplyStatus === ACTIONS.OK_SUPPLY) {
        product.supplyStatus = ACTIONS.WITHOUT_CHECKING
      }
      else {
        product.supplyStatus = ACTIONS.OK_SUPPLY
      }
    }

    products[idx] = product
    order.lines = products
    this.setState({
      order: order
    }, function() {
      this.props.supplyRevision(products)
    })
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <OrderCard
          notes={this.props.order.items}
          documents={this.props.order.documents}
        />
        {
          (this.props.order.lines.length <= 0) ?

          <div className={classes.container}>
            <Empty
              title={"¡Solicitud sin productos!"}
              description={"No hay productos surtidos para esta solicitud."}
            />
          </div>

          :

          <div>
            <Typography type="body">
              <strong>Productos surtidos:</strong>
            </Typography>
            <br />
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.fitCell}><strong>{Utils.messages.OrderForm.search.headers.sku}</strong></TableCell>
                    <TableCell className={classes.fatCell}><strong>{Utils.messages.OrderForm.search.headers.productName}</strong></TableCell>
                    <TableCell className={classes.fitCell}><strong>Cantidad surtida</strong></TableCell>
                    <TableCell className={classes.cell}><strong>¿Surtido correcto?</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.order.lines.map((product, idx) => (
                    <TableRow key={idx} className={classes.productRow}>
                      <TableCell component="th" scope="item" className={classes.fitCell}>
                        {product.sku}
                      </TableCell>
                      <TableCell component="th" scope="item" className={classes.fatCell}>
                        {product.name}
                      </TableCell>
                      <TableCell component="th" scope="item" className={classes.fitCell}>
                        {product.supplyQuantity}
                      </TableCell>
                      <TableCell component="th" scope="item" className={classes.cell}>
                        <Grid container>
                          <Grid item lg={6} className={classes.checkButton}>
                            <IconButton onClick={() => { this.checkProduct(idx, ACTIONS.ERROR_SUPPLY) }} >
                              <ErrorIcon className={(this.state.order.lines[idx].supplyStatus === ACTIONS.ERROR_SUPPLY) ? classes.check : classes.notCheck} />
                            </IconButton>
                          </Grid>
                          <Grid item lg={6} className={classes.checkButton}>
                            <IconButton onClick={() => { this.checkProduct(idx, ACTIONS.OK_SUPPLY) }} >
                              <CheckIcon className={(this.state.order.lines[idx].supplyStatus === ACTIONS.OK_SUPPLY) ? classes.check : classes.notCheck} />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(CheckSupplyOrder)
