import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Typography, Paper, Table, TableBody, TableHead, TableRow, TableCell, Grid, TableSortLabel } from '@material-ui/core'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'

import Utils from '../resources/Utils'
import TopSalesPerCityTable from './TopSalesPerCityTable'
import TopSalesPerBrandTable from './TopSalesPerBrandTable'
import TopSalesPerCategoryTable from './TopSalesPerCategoryTable'

const styles = (theme) => ({
  title: {
    fontSize: 22
  },
  card: {
    margin: 16,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 16,
    padding: 24
  }
})

class KPICard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 0
    }
  }

  render() {
    const { classes } = this.props

    return (
      <Paper className={classes.card}>
        {true ? (
          <div>
            <Typography variant='body1'>{this.props.title}</Typography>
            <Typography variant='body1' color='primary' className={classes.title}>
              <strong>{this.props.value}</strong>
            </Typography>
            <Typography variant='body2'>
              <span style={{ color: 'gray', fontSize: 12 }}>{this.props.description}</span>
            </Typography>
            {this.props.arrows ? (
              <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-25px' }}>
                <ArrowBackIosIcon
                  onClick={() => {
                    this.props.setDaily(-1)
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <ArrowForwardIosIcon
                  onClick={
                    !this.props.blockArrow
                      ? () => {
                          this.props.setDaily(1)
                        }
                      : {}
                  }
                  style={this.props.blockArrow ? { cursor: 'no-drop', color: 'gray' } : { cursor: 'pointer' }}
                />
              </Grid>
            ) : (
              ''
            )}

            {this.props.type !== null && this.props.type !== 'city' && this.props.type !== 'brand' && this.props.type !== 'category' ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={this.props.list}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 20,
                      bottom: 20
                    }}
                    barSize={20}
                  >
                    {this.props.chart !== undefined ? (
                      this.props.chart === 'day' ? (
                        <XAxis dataKey='day' scale='point' padding={{ left: 30, right: 30 }} />
                      ) : (
                        <XAxis dataKey='month' scale='point' padding={{ left: 30, right: 30 }} />
                      )
                    ) : (
                      <XAxis dataKey='hour' scale='point' padding={{ left: 30, right: 30 }} />
                    )}
                    <YAxis />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <CartesianGrid strokeDasharray='10 10' />
                      <Bar dataKey={(new Date().getFullYear() - 1).toString()} fill='#82ca9d' background={{ fill: '#eee' }} />
                      <Bar dataKey={new Date().getFullYear().toString()} fill='#8884d8' background={{ fill: '#eee' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              ''
            )}
            {this.props.list.length > 0 && this.props.type === null ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant='body1'></Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body1'></Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body1'>
                        <strong>Código</strong>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body1'>
                        <strong>Descripción</strong>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body1'>
                        <strong>Cantidad</strong>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body1'>
                        <strong>Monto</strong>
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.props.list.map((product, idx) => {
                    return (
                      <TableRow>
                        <TableCell>#{idx + 1}</TableCell>
                        <TableCell>
                          <div>
                            <a href={'https://www.kelder.mx/' + Utils.generateURL(product.description, product.code)}>
                              <img
                                style={{ width: 40 }}
                                src={Utils.constants.HOST_CDN_AWS + '/normal/' + product.code + '-1.jpg'}
                                alt='-'
                                onError={() => {
                                  return ''
                                }}
                              />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Typography style={{ fontSize: 14 }} variant='body1'>
                            {product.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography style={{ fontSize: 14 }} variant='body1'>
                            {product.description.substring(0, 32)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography style={{ fontSize: 14 }} variant='body1'>
                            {Utils.numberWithCommas(product.totalQuantity)}
                          </Typography>
                        </TableCell>
                        <TableCell style={{ width: '20%' }}>
                          <Typography style={{ fontSize: 14 }} variant='body1'>
                            $ {Utils.numberWithCommas(product.total)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              ''
            )}
            {this.props.list.length > 0 && this.props.type === 'city' ? <TopSalesPerCityTable cities={this.props.list} /> : ''}
            {this.props.list.length > 0 && this.props.type === 'brand' ? <TopSalesPerBrandTable brands={this.props.list} /> : ''}
            {this.props.list.length > 0 && this.props.type === 'category' ? <TopSalesPerCategoryTable categories={this.props.list} /> : ''}
          </div>
        ) : (
          ''
        )}
      </Paper>
    )
  }
}

export default compose(withTheme(), withStyles(styles))(KPICard)
