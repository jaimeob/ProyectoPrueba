import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { IconButton, TextField, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'

import emptyImg from '../resources/images/empty.svg'
import sleepImg from '../resources/images/sleep.svg'

// Components
import Empty from './Empty'
import OrderCard from '../components/OrderCard'
import SearchContainer from '../components/SearchContainer'

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

class SupplyOrder extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      itemsToPrint: [],
      txtAddItem: '',
      emptyTitle: Utils.messages.General.loadTitle,
      emptyDescription: Utils.messages.General.loadDescription
    }

    this.getPlaceholderForEmptyComponent = this.getPlaceholderForEmptyComponent.bind(this)
    this.addItem = this.addItem.bind(this)
    this.changeTxtAddItem = this.changeTxtAddItem.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.updateItems = this.updateItems.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.mode === 'update') {
        this.setState({
          items: this.props.items,
          itemsToPrint: this.props.items
        }, function() {
          this.setState({
            emptyTitle: Utils.messages.OrderForm.emptyAnotationsTitle,
            emptyDescription: Utils.messages.OrderForm.emptyAnotationsDescription
          })
        })
      }
      else {
        this.setState({
          emptyTitle: Utils.messages.OrderForm.emptyAnotationsTitle,
          emptyDescription: Utils.messages.OrderForm.emptyAnotationsDescription
        })
      }
    }
  }

  changeTxtAddItem(event) {
    this.setState({
      txtAddItem: event.target.value
    })
  }

  getPlaceholderForEmptyComponent() {
    if (this.state.emptyTitle !== Utils.messages.General.loadTitle) {
      return emptyImg
    }
    return sleepImg
  }

  addItem(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (Utils.isEmpty(event.target.value))
        return

      let items = this.state.items
      items.push(event.target.value)
      this.setState({
        items: items,
        itemsToPrint: items,
        txtAddItem: ''
      })
      this.props.updateItems(items)
    }
  }

  deleteItem(idx) {
    let items = this.state.items
    let itemsToPrint = this.state.itemsToPrint
    if (typeof(items[idx]) === 'object') {
      items[idx].status = 2
      itemsToPrint.splice(idx, 1)
    }
    else {
      items.splice(idx, 1)
      itemsToPrint.splice(idx, 1)
    }

    this.setState({
      items: items,
      itemsToPrint: itemsToPrint
    })
  }

  updateItems(items) {
    this.setState({
      items: items
    }, function() {
      this.props.updateItems(items)
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
        <SearchContainer
          host={this.props.host}
          resource="inventories"
          query="name"
          mode={this.props.mode}
          products={this.props.order.lines}
          updateItems={(items) => { this.updateItems(items) }}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(SupplyOrder)
