import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import AsyncCreatable from 'react-select/async-creatable'
import Async from 'react-select/async'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import AddIcon from '@material-ui/icons/AddCircle'

import AddToCatalogModal from './AddToCatalogModal'

import { getDataAPI, getItemAPI } from '../api/CRUD'

import Utils from '../resources/Utils'

const styles = theme => ({
  container: {
    marginTop: 48
  },
  select: {
    marginTop: 16
  }
})

class Autocomplete extends Component {
  constructor(props) {
    super(props)
    this.state = {
      options: [],
      selected: [],
      addToCatalogModal: false,
      toAdd: '',
      selectedOption: this.props.defaultValue
    }

    this.loadOptions = this.loadOptions.bind(this)

    this.handleCreate = this.handleCreate.bind(this)
    this.autocompleteEmpty = this.autocompleteEmpty.bind(this)
    this.noOptionsMessage = this.noOptionsMessage.bind(this)
    this.getOptionValue = this.getOptionValue.bind(this)
    this.getOptionLabel = this.getOptionLabel.bind(this)

    this.getPlaceholder = this.getPlaceholder.bind(this)

    this.formatCreate = this.formatCreate.bind(this)

    this.handleChangeValue = this.handleChangeValue.bind(this)

    this.handleConfirmAddToCatalog = this.handleConfirmAddToCatalog.bind(this)
    this.loadingMessage = this.loadingMessage.bind(this)

    this.loadData = this.loadData.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.autocompletes !== this.props.autocompletes) {
      if (prevProps.autocompletes[this.props.id] !== this.props.autocompletes[this.props.id]) {
        if (this.props.autocompletes[this.props.id].action === 'clear') {
          this.setState({
            selectedOption: null
          })
        } else if (this.props.autocompletes[this.props.id].action === 'reload') {
          const self = this
          this.setState({
            options: [],
            selected: [],
            selectedOption: null
          }, () => {
            self.loadData()
          })
        }
      }
    }
  }

  getValue(item, param) {
    let values = param.split('.')
    let returnValue = ''
    if (values.length === 3) {
      returnValue = item[values[1]][values[2]]
    }
    else if (values.length === 2) {
      returnValue = item[values[0]][values[1]]
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
    this.loadData()
  }

  async loadData() {
    let filters = {}
    if (this.props.filters !== undefined) {
      filters = this.props.filters
    }
    else {
      filters = {where: {status: {neq: 2}}, limit: 5, include: this.props.relations}
    }
    
    let self = this
    let response = await getDataAPI({host: this.props.host, resource: this.props.resource, filters: filters})
    let options = []
    let selected = []

    if (this.props.value !== null) {
      let responseItem = await getItemAPI({host: this.props.host, resource: this.props.resource, filters: {
        where: {
          id: self.props.value
        },
        limit: 1
      }})

      let exist = false
      response.data.forEach(function(item, idx) {
        options.push({id: item.id, label: self.getValue(item, self.props.param), data: item})
        if (responseItem.data.id === item.id) {
          exist = true
          selected.push(options[idx])
        }
      })

      if (!exist) {
        options.splice(options.length - 1, 1, {id: responseItem.data.id, label: self.getValue(responseItem.data, self.props.param), data: responseItem.data})
        let optionSelected = Utils.cloneJson(options)
        optionSelected = optionSelected[optionSelected.length - 1]
        selected.push(optionSelected)
      }
    }
    else {
      response.data.forEach(function(item, idx) {
        options.push({id: item.id, label: self.getValue(item, self.props.param), data: item})
      })
    }

    this.setState({
      options: options,
      selectedOption: selected
    })
  }

  handleConfirmAddToCatalog(action, data) {
    const self = this
    let options = this.state.options
    options.unshift({id: data.data.id, label: this.getValue(data.data, this.props.param), data: data.data})
    let selectedOption = [options[0]]
    this.setState({
      openAddToCatalogModal: false,
      options: options,
      selectedOption: selectedOption
    }, function() {
      self.props.onChange(this.state.selectedOption[0])
    })
  }

  getOptionLabel(option) {
    return option.label
  }
  
  getOptionValue(option) {
    return option.id
  }

  getPlaceholder() {
    if (this.props.value === null && this.props.isDisabled) {
      return '-'
    }
    return 'Buscar...'
  }

  handleChangeValue(event) {
    if (this.props.clearToSelect !== undefined && this.props.clearToSelect) {
      this.props.onChange(event)
      this.setState({
        selectedOption: null
      }, function() {
        this.props.onChange(null)
      })
    }
    else {
      this.setState({
        selectedOption: event
      }, function() {
        this.props.onChange(event)
      })
    }
  }

  noOptionsMessage(inputValue) {
    return 'No se encontraron resultados'
  }

  loadingMessage() {
    return 'Cargando...'
  }

  autocompleteEmpty() {
    if (this.state.selected.length <= 0) {
      return (
        <div>
          <p>No hay resultados...</p>
        </div>
      )
    }
    else {
      return 'Opci??n seleccionada'
    }
  }

  loadOptions(input = '') {
    let self = this

    input = '%25' + input + '%25'

    let searchWhereQuery = {}
    if (this.props.searchParams !== undefined && this.props.searchParams.length > 0) {
      let queryParams = []
      this.props.searchParams.forEach(function(searchParam) {
        queryParams.push({[searchParam]: {like: input}})
      })

      let and = [
        {or: queryParams},
        {status: {neq: 2}}
      ]

      if (this.props.withIdFilter !== undefined) {
        let idFilters = []
        this.props.withIdFilter.forEach((filter) => {
          idFilters.push(filter)
        })
        idFilters.concat(and)
        and = idFilters
      }

      searchWhereQuery = {
        where: {
          and: and
        }
      }
    }
    else {
      let where = {[this.props.param]: {like: input}, status: {neq: 2}}
      if (this.props.withIdFilter !== undefined) {
        let idFilters = []
        this.props.withIdFilter.forEach((filter) => {
          idFilters.push(filter)
        })
        idFilters.push({[this.props.param]: {like: input}})
        idFilters.push({status: {neq: 2}})
        where = { and: idFilters }
      }
      searchWhereQuery = {where: where}
    }

    let filters = searchWhereQuery
    searchWhereQuery.limit = 5

    if (this.props.relations !== undefined) {
      searchWhereQuery.include = this.props.relations
    }

    let response = getDataAPI({host: this.props.host, resource: this.props.resource, filters: filters})
    return response.then(function(res) {
      let options = []
      res.data.forEach(function(item) {
        options.push({id: item.id, label: self.getValue(item, self.props.param), data: item})
      })
      return options
    }).catch(function(err) {
      console.log(err)
    })
  }

  handleCreate(option) {
    this.setState({
      openAddToCatalogModal: true,
      toAdd: option
    })
  }

  formatCreate(input) {
    return <div><AddIcon style={{float: 'left', marginRight: 4}}/><Typography type="body">Agregar opci??n: "<strong>{input}</strong>"</Typography></div>
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.select}>
        <Typography variant="body1"><strong>{this.props.label}</strong></Typography>
        {
          (this.props.addToCatalog !== undefined && this.props.addToCatalog) ?
          <AsyncCreatable
            isClearable
            cacheOptions
            defaultOptions={this.state.options}
            loadOptions={this.loadOptions}
            isDisabled={this.props.isDisabled}
            className={classes.selectOptions}
            options={this.state.options}
            getOptionValue={this.getOptionValue}
            getOptionLabel={this.getOptionLabel}
            placeholder={this.getPlaceholder()}
            value={this.state.selectedOption}
            onCreateOption={this.handleCreate}
            noOptionsMessage={this.noOptionsMessage}
            formatCreateLabel={this.formatCreate}
            loadingMessage={this.loadingMessage}
            onChange={(event) => { this.handleChangeValue(event) }}
          />
          :
          <Async
            isClearable
            cacheOptions
            defaultOptions={this.state.options}
            loadOptions={this.loadOptions}
            isDisabled={this.props.isDisabled}
            className={classes.selectOptions}
            options={this.state.options}
            getOptionValue={this.getOptionValue}
            getOptionLabel={this.getOptionLabel}
            placeholder={this.getPlaceholder()}
            value={this.state.selectedOption}
            onCreateOption={this.handleCreate}
            noOptionsMessage={this.noOptionsMessage}
            loadingMessage={this.loadingMessage}
            onChange={(event) => { this.handleChangeValue(event) }}
          />
        }
        {
          (this.props.addToCatalog !== undefined && this.props.addToCatalog) ?
          <AddToCatalogModal
            open={this.state.openAddToCatalogModal}
            messages={this.props.messages}
            params={this.props.createParams}
            host={this.props.host}
            resource={this.props.resource}
            data={{
              [this.props.createParams[0].name]: this.state.toAdd.trim()
            }}
            handleCloseAddToCatalog={() => {this.setState({openAddToCatalogModal: false})}}
            handleConfirmAddToCatalog={(action, data) => { this.handleConfirmAddToCatalog(action, data) }}
          />
          :
          ''
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
)(Autocomplete)
