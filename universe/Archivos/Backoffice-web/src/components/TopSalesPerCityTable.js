import { Table, TableCell, TableHead, TableRow, TableSortLabel, Typography, TableBody } from '@material-ui/core'
import React, { Component } from 'react'
import Utils from '../resources/Utils'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'

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

export default class TopSalesPerCityTable extends Component {
  constructor(props) {
    super(props)

    this.state = {
      order: 'desc',
      orderBy: 'orders',
      data: this.props.cities
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
            <TableCell key={'cityName'} sortDirection={orderBy === 'cityName' ? order : false}>
              <TableSortLabel active={orderBy === 'cityName'} direction={order} onClick={() => this.handleRequestSort('cityName')}>
                <Typography variant='body1'>
                  <strong>Ciudad</strong>
                </Typography>
              </TableSortLabel>
            </TableCell>
            <TableCell key={'orders'} sortDirection={orderBy === 'orders' ? order : false}>
              <TableSortLabel active={orderBy === 'orders'} direction={order} onClick={() => this.handleRequestSort('orders')}>
                <Typography variant='body1'>
                  <strong>Pedidos</strong>
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
            <TableCell>
              <Typography variant='body1'>
                <strong>Opciones</strong>
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stableSort(data, getSorting(order, orderBy)).map((city) => {
            return (
              <TableRow>
                <TableCell key={'cityName'}>
                  <Typography style={{ fontSize: 14 }} variant='body1'>
                    {city.cityName}
                  </Typography>
                </TableCell>
                <TableCell key={'orders'}>
                  <Typography style={{ fontSize: 14 }} variant='body1'>
                    {Utils.numberWithCommas(city.orders)}
                  </Typography>
                </TableCell>
                <TableCell key={'products'}>
                  <Typography style={{ fontSize: 14 }} variant='body1'>
                    {Utils.numberWithCommas(city.products)}
                  </Typography>
                </TableCell>
                <TableCell key={'amount'}>
                  <Typography style={{ fontSize: 14 }} variant='body1'>
                    ${Utils.numberWithCommas(city.amount)}
                  </Typography>
                </TableCell>
                <TableCell align='center'>
                  <Typography style={{ fontSize: 14 }} variant='body1'>
                    <ArrowForwardIosIcon
                      onClick={(event) => (window.location.href = `${Utils.constants.paths.orders}/?cityName=${city.cityName === null ? undefined : city.cityName}`)}
                      style={{ cursor: 'pointer' }}
                    ></ArrowForwardIosIcon>

                    {/* <a href={`${Utils.constants.paths.orders}/?cityName=${city.cityName === null ? undefined : city.cityName}`}>
                      <ArrowForwardIosIcon onClick={}></ArrowForwardIosIcon>
                    </a> */}
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
