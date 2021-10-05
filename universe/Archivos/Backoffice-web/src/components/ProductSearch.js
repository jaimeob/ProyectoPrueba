import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import AsyncSelect from 'react-select/async'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import { requestGetDataAutocomplete } from '../actions/actionAutocomplete'

import Utils from '../resources/Utils'

const styles = theme => ({
  select: {
    marginTop: 8
  }
})

class ProductSearch extends Component {
  constructor(props) {
    super(props)
    this.state = {
      options: [],
      selected: [],
      inputValue: ''
    }

    this.loadOptions = this.loadOptions.bind(this)
    this.handleChangeValue = this.handleChangeValue.bind(this)
    this.autocompleteEmpty = this.autocompleteEmpty.bind(this)
    this.getOptionValue = this.getOptionValue.bind(this)
  }

  getValue(item, param) {
    let values = param.split('.')
    let returnValue = ''
    if (values.length === 2) {
      returnValue = item[values[1]]
    }
    else {
      returnValue = item[param]
    }

    if (param.type === 'date') {
      return Utils.onlyDate(returnValue)
    }
    else if (param.type === 'money') {
      return " $ " + Utils.numberWithCommas(returnValue.toFixed(2))
    }
    else {
      return returnValue
    }
  }

  componentWillMount() {
    this.props.requestGetDataAutocomplete({resource: this.props.resource, filters: this.props.filters})
  }

  componentDidUpdate(prevProps) {
    if (prevProps.autocomplete[this.props.resource] !== this.props.autocomplete[this.props.resource]) {
      if (!Utils.isEmpty(this.props.autocomplete[this.props.resource])) {
        let self = this
        let options = []
        let selectedIndex = null
        this.props.autocomplete[this.props.resource].forEach(function(item, idx) {
          if (item.id === self.props.value)
            selectedIndex = idx
          options.push({id: item.id, label: self.getValue(item, self.props.param), data: item})
        })
        if (selectedIndex !== null)
          this.setState({options: options, selected: [options[selectedIndex]]})
        else
          this.setState({options: options})
      }
    }
  }

  getOptionValue() {
    if (Utils.isEmpty(this.state.selected))
      return ''
    return {label: this.state.selected[0].label, value: this.state.selected[0].id, data: this.state.selected[0].data}
  }

  handleChangeValue(value) {
    const inputValue = value.replace(/\W/g, '');
    this.setState({
      inputValue: value
    })
    return value
  }  

  autocompleteEmpty() {
    if (this.state.selected.length <= 0) {
      return (
        <div>
          <p>No hay productos con esta descripción...</p>
        </div>
      )
    }
    else {
      return ''
    }
  }

  async loadOptions(value, callback) {
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.select}>
        {
          (this.props.label !== undefined && this.props.label.trim() !== "") ?
          <Typography variant="body1"><strong>{this.props.label}:</strong></Typography>
          :
          ''
        }
        <AsyncSelect
          cacheOptions
          loadOptions={this.loadOptions}
          defaultOptions
          className={classes.selectOptions}
          options={this.state.options}
          onInputChange={(value) => { this.handleChangeValue(value) }}
          placeholder="Busca y selecciona un producto..."
          value={this.getOptionValue()}
          noOptionsMessage={this.autocompleteEmpty}
        />
      </div>
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
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(ProductSearch)
