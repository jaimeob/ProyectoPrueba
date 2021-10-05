import { Table, TableCell, TableHead, TableRow, TableSortLabel, Typography, TableBody, Tooltip } from '@material-ui/core'
import React, { Component } from 'react'
import Utils from '../resources/Utils'

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy)
}

export default class TopSalesPerCategoryTable extends Component {
  constructor(props) {
    super(props)

    this.state = {
      order: 'asc',
      orderBy: 'categories',
      data: this.props.categories
    }
    this.handleRequestSort = this.handleRequestSort.bind(this)
  }
  handleRequestSort(property) {
    const orderBy = property
    let order = 'desc'

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc'
    }

    this.setState({ order, orderBy })
  }

  render() {
    const { data, order, orderBy } = this.state

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell key={'category'} sortDirection={orderBy === 'category' ? order : false}>
              <TableSortLabel active={orderBy === 'category'} direction={order} onClick={() => this.handleRequestSort('category')}>
                <Typography variant='body1'>
                  <strong>Categorías</strong>
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell key={'products'} sortDirection={orderBy === 'products' ? order : false}>
              <TableSortLabel active={orderBy === 'products'} direction={order} onClick={() => this.handleRequestSort('products')}>
                <Typography variant='body1'>
                  <strong>Productos</strong>
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell key={'amount'} sortDirection={orderBy === 'amount' ? order : false}>
              <TableSortLabel active={orderBy === 'amount'} direction={order} onClick={() => this.handleRequestSort('amount')}>
                <Typography variant='body1'>
                  <strong>Importe</strong>
                </Typography>
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stableSort(data, getSorting(order, orderBy)).map((category) => {
            return (
              <TableRow>
                <TableCell key={'categories'}>
                  <Typography style={{ fontSize: 14 }} variant='body1'>
                    <a href={'https://www.kelder.mx' + category.url}>{category.category}</a>
                  </Typography>
                </TableCell>
                <TableCell key={'products'}>
                  <Typography style={{ fontSize: 14 }} variant='body1'>
                    {category.products}
                  </Typography>
                </TableCell>
                <TableCell key={'amount'}>
                  <Typography style={{ fontSize: 14 }} variant='body1'>
                    ${Utils.numberWithCommas(parseFloat(category.amount).toFixed(2))}
                  </Typography>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }
}
