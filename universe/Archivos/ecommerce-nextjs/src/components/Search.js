import React, { Component } from 'react'
import Link from 'next/link'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Async from 'react-select/async'
import Router from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import AddIcon from '@material-ui/icons/AddCircle'
import { requestGetDataAutocomplete } from '../actions/actionAutocomplete'
import Utils from '../resources/Utils'
import Axios from 'axios'

const styles = theme => ({
  select: {
    color: 'black',
    padding: '8px 16px',
    paddingTop: 10,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      padding: 4,
      paddingTop: 0,
      paddingBottom: 8
    }
  },
  scrollBar: {
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px'
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      'border-radius': '4px',
      'background-color': 'rgba(0,0,0,.5)',
      '-webkit-box-shadow': '0 0 1px hsla(0,0%,100%,.5)'
    }
  }
})

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: 'products',
      param: 'nombre',
      value: null,
      options: [],
      selected: [],
      addToCatalogModal: false,
      toAdd: '',
      selectedOption: this.props.defaultValue
    }

    this.loadOptions = this.loadOptions.bind(this)

    this.handleCreate = this.handleCreate.bind(this)
    this.noOptionsMessage = this.noOptionsMessage.bind(this)
    this.loadingMessage = this.loadingMessage.bind(this)
    this.getOptionValue = this.getOptionValue.bind(this)
    this.getOptionLabel = this.getOptionLabel.bind(this)

    this.getPlaceholder = this.getPlaceholder.bind(this)

    this.formatCreate = this.formatCreate.bind(this)

    this.handleChangeValue = this.handleChangeValue.bind(this)

    this.handleConfirmAddToCatalog = this.handleConfirmAddToCatalog.bind(this)
  }

  getValue(item, param) {
    let values = param.split('.')
    let returnValue = ''
    if (values.length === 3) {
      returnValue = item[values[1]][values[2]]
    }
    else if (values.length === 2) {
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

  async componentWillMount() {
    this.setState({
      options: [],
      selectedOption: []
    })
  }

  handleConfirmAddToCatalog(action, data) {
    let options = this.state.options
    options.splice(options.length - 1, 1, { id: data.data.id, label: this.getValue(data.data, this.state.param), data: data.data })
    let selectedOption = [options[options.length - 1]]
    this.setState({
      openAddToCatalogModal: false,
      options: options,
      selectedOption: selectedOption
    }, function () {
      this.props.onChange(this.state.selectedOption[0])
    })
  }

  getOptionLabel(option) {
    return <div>
      <Grid container>
        {
          (option.data.type !== undefined && option.data.type === 'brand') ?
          <>
          <Grid item xl={11} lg={11} md={11} sm={11} xs={11}>
            <Typography style={{ fontSize: 16, padding: 0, paddingLeft: 16 }} variant="body1"><strong>Encuentra todo de la marca {option.data.name}...</strong></Typography>
          </Grid>
          <Grid item xl={1} lg={1} md={1} sm={1} xs={1}>
            <img src="../../icon-arrow.svg" />
          </Grid>
          </>
          :
          <>
          <Grid item xl={2} lg={2} md={2} sm={1} xs={2}>
            {
              (option.data.photos.length > 0) ?
                <img style={{ width: '100%' }} src={Utils.constants.HOST_CDN_AWS + '/thumbs/' + option.data.photos[0].description} alt={ "Foto de producto " + option.data.detail.title }></img>
                :
                <img style={{ width: '100%' }} src={'../../placeholder.svg'} alt="Producto sin imagen"></img>
            }
          </Grid>
          <Grid item xl={10} lg={10} md={10} sm={11} xs={10}>
            <Typography style={{ fontSize: 12, paddingLeft: 16 }} variant="body1">{option.data.detail.title}</Typography>
            {
              (option.data.percentagePrice > 0) ?
                <Typography style={{ paddingLeft: 16 }} color="primary" variant="body1"><strong style={{ color: 'red', textDecoration: 'line-through' }}>Antes: ${Utils.numberWithCommas(option.data.price.toFixed(2))}</strong> - <strong>Ahora: ${Utils.numberWithCommas(option.data.discountPrice.toFixed(2))}</strong></Typography>
                :
                <Typography style={{ paddingLeft: 16 }} color="primary" variant="body1"><strong>${Utils.numberWithCommas(option.data.price.toFixed(2))}</strong></Typography>
            }
          </Grid>
          </>
        }
      </Grid>
    </div>
  }

  getOptionValue(option) {
    return option.id
  }

  getPlaceholder() {
    if (this.state.value === null && this.props.isDisabled) {
      return '-'
    }
    return <Typography variant="body1" style={{ opacity: 0.3, color: 'black', fontWeight: 500 }}>Encuéntralo en { this.props.app.data.alias }...</Typography>
  }

  handleChangeValue(event) {
    this.setState({
      selectedOption: null
    })
    if (event !== null) {
      window.location.href = event.data.url
    }
  }

  noOptionsMessage(input) {
    if (Utils.isEmpty(input.inputValue))
      return <div>
        <Typography variant="body1">Ejemplo: Under Armour, Reebok, Adidas, Steve Madden, etc.</Typography>
        <a href="/todos">Búsqueda avanzada</a>
      </div>
    else
      return <div>
        <Typography variant="body1">No se encontraron resultados.</Typography>
        <a href="/todos">Búsqueda avanzada</a>
      </div>
  }

  loadingMessage() {
    return 'Cargando...'
  }

  async loadOptions(input) {
    if (input.length > 1) {
      let self = this

      let or = [{ genero_id: 1 }, { genero_id: 2 }, { genero_id: 3 }, { genero_id: 4 }]
      if (this.props.app.data.configs.businessUnit === 9)
        or = []
      try {
        const response = await Axios.get(self.state.host + '/api/' + self.state.resource + '/search?query=' + input, { headers: { uuid: this.props.app.data.uuid } })
        let options = []
        response.data.forEach(function (item) {
          options.push({ id: item.id, label: self.getValue(item, self.state.param), data: item })
        })
        return options
      } catch (err) {
      }
    }
  }

  handleCreate(option) {
    this.setState({
      openAddToCatalogModal: true,
      toAdd: option
    })
  }

  formatCreate(input) {
    return <div><AddIcon style={{ float: 'left', marginRight: 4 }} /><Typography type="body">Agregar opción: "<strong>{input}</strong>"</Typography></div>
  }

  render() {
    const { classes } = this.props
    return (
      <div className={`${classes.select} ${classes.scrollBar}`}>
        <Async
          styles={{
            control: () => {
              return { height: 38, width: '100%', borderRadius: 24, padding: '0px 6px', background: '#f9f9f9', border: '2px solid #dae5e8' }
            },
            dropdownIndicator: () => {
              return { display: 'none' }
            },
            indicatorSeparator: () => {
              return { display: 'none' }
            }
          }}
          isClearable
          cacheOptions
          defaultOptions={this.state.options}
          loadOptions={this.loadOptions}
          isDisabled={this.props.isDisabled}
          className={`${classes.selectOptions} ${classes.scrollBar}`}
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
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(Search)
