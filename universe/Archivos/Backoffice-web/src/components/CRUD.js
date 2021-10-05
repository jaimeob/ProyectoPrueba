import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Hidden from '@material-ui/core/Hidden'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import Chip from '@material-ui/core/Chip'
import Avatar from '@material-ui/core/Avatar'
import TableCell from '@material-ui/core/TableCell'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import EditIcon from '@material-ui/icons/Edit'
import InfoIcon from '@material-ui/icons/Info'
import Snackbar from '@material-ui/core/Snackbar'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'

import emptyImg from '../resources/images/empty.svg'
import sleepImg from '../resources/images/sleep.svg'

// Components
import KPICard from './KPICard'
import Title from './Title'
import Search from './Search'
import MultipleActions from './MultipleActions'
import Stepper from './Stepper'
import StatusCard from './StatusCard'
import DeleteDialog from './DeleteDialog'
import Breadcrumbs from './Breadcrumbs'
import Empty from './Empty'
import Paginator from './Paginator'

import Actions from './Actions'
import CRUDModal from './CRUDModal'

// Resources
import Utils from '../resources/Utils'
import { endUpdateDataCRUD } from '../actions/actionCRUD'

import { getPipelineAPI, getCountAPI, getDataAPI } from '../api/CRUD'

const styles = theme => ({
  searchAddContainer: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    boxShadow: '1px 1px 0.5em ' + theme.palette.border.main
  },
  multipleContainer: {
    position: 'fixed',
    zIndex: 1,
    top: 62,
    left: 220,
    width: '100%',
    padding: '8px 16px',
    backgroundColor: theme.palette.border.main,
    boxShadow: '1px 1px 0.5em ' + theme.palette.border.main
  },
  searchContainer: {
    paddingRight: 16
  },
  breadcrumbsContainer: {
    marginTop: 4,
    marginBottom: 8
  },
  statusGrid: {
    marginTop: 8,
    marginRight: 8
  },
  avatar: {
    fontWeight: 800
  },
  tableContainer: {
    paddingTop: 0,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    boxShadow: '1px 1px 0.5em ' + theme.palette.border.main
  },
  headerCell: {
    margin: 0,
    marginRight: 4,
    padding: '0px 0.5%',
    width: 'auto'
  },
  headerText: {
    fontWeight: 800,
    fontSize: 13
  },
  contentCell: {
    margin: 0,
    padding: '0px 0.5%',
    width: 'auto'
  },
  contentText: {
    fontSize: 13
  },
  hidden: {
    display: 'none'
  },
  paginatorContainer: {
    boxShadow: '1px 1px 0.5em '  + theme.palette.border.main,
    position: 'fixed',
    right: 0,
    bottom: 0,
    width: '100%'
  },
  addButton: {
    fontWeight: 600,
    fontSize: 14,
    width: '100%',
    float: 'right'
  }
})

class CRUD extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      showData: false,
      openModal: false,
      editModal: false,
      openDeleteDialog: false,
      openActions: false,
      actions: [],
      count: 0,
      data: [],
      item: {},
      allCheckbox: false,
      checkbox: [],
      showActionMultiple: false,
      multipleActions: [],
      selected: [],
      emptyTitle: Utils.messages.General.loadTitle,
      emptyDescription: Utils.messages.General.loadDescription
    }

    //
    this.getPlaceholderForEmptyComponent = this.getPlaceholderForEmptyComponent.bind(this)
    this.getTitleForEmptyButton = this.getTitleForEmptyButton.bind(this)

    this.getValue = this.getValue.bind(this)
    this.getParams = this.getParams.bind(this)
    this.getActions = this.getActions.bind(this)
    this.showActions = this.showActions.bind(this)
    this.openModal = this.openModal.bind(this)
    this.handleChangeCheckbox = this.handleChangeCheckbox.bind(this)
    this.handleActions = this.handleActions.bind(this)
    this.handleCancelDelete = this.handleCancelDelete.bind(this)
    this.handleConfirmDelete = this.handleConfirmDelete.bind(this)
    this.handleNewData = this.handleNewData.bind(this)
    this.getBreadcrumbs = this.getBreadcrumbs.bind(this)
  }

  getTitleForEmptyButton() {
    if (this.props.create !== undefined && this.props.create) {
      if (this.state.emptyTitle !== Utils.messages.General.loadTitle) {
        return this.props.messages.addButton
      }
      return ''
    }
    else {
      return ''
    }
  }

  getPlaceholderForEmptyComponent() {
    if (this.state.emptyTitle !== Utils.messages.General.loadTitle) {
      return emptyImg
    }
    return sleepImg
  }

  getBreadcrumbs() {
    return this.props.breadcrumbs
  }

  getValue(item, param) {
    let values = param.name.split('.')
    let returnValue = ''
    if (values.length === 3) {
      if (item[values[0]] !== undefined) {
        if (item[values[0]][values[1]] !== undefined) {
          returnValue = item[values[0]][values[1]][values[2]]
        }
      }
      else
        returnValue = '-'
    }
    else if (values.length === 2) {
      if (item[values[0]] !== undefined)
        returnValue = item[values[0]][values[1]]
      else
        returnValue = '-'
    }
    else {
      if (Utils.isEmpty(item[param.name])) {
        if (Utils.isNumeric(item[param.name])) {
          returnValue = item[param.name]
        }
        else {
          returnValue = '-'
        }
      }
      else {
        returnValue = item[param.name]
      }
    }

    if (param.type === 'date') {
      return Utils.onlyDate(returnValue)
    }
    else if (param.type === 'money') {
      return " $ " + Utils.numberWithCommas(returnValue.toFixed(2))
    }
    else if (param.type === 'boolean') {
      return (returnValue === 0) ? 'NO' : 'SI'
    }
    else if (param.type === 'link') {
      if (returnValue === '-') {
        return returnValue
      }
      let url = param.link.split('.')
      if (url.length === 2) {
        return this.props.host + item[url[0]][url[1]]
      }
      else {
        return this.props.host + item[param.link]
      }
    }
    else {
      return returnValue
    }
  }

  getParams() {
    return this.props.origin.params
  }

  showActions() {
    let permissions = Utils.jsonToArray(this.props.origin.permissions)
    let exclude = 0
    
    if (this.props.origin.permissions.read.permission)
      exclude ++
    if (this.props.origin.permissions.create !== undefined) {
      if (this.props.origin.permissions.create.permission)
        exclude ++
    }

    if (this.props.origin.permissions.update !== undefined) {
      if (this.props.origin.permissions.update.permission)
        if (this.props.update === undefined || !this.props.update)
          exclude ++
    }

    if (this.props.origin.permissions.delete !== undefined) {
      if (this.props.origin.permissions.delete.permission)
        if (this.props.delete === undefined || !this.props.update)
          exclude ++
    }

    if (permissions.length > exclude)
      return true
    return false
  }

  getActions(item) {
    let position = 0
    let pipelineArray = []
    let pipelineLength = 0
    let actionsList = []
    let actions = Utils.jsonToArray(this.props.origin.permissions)
    actions.forEach(function(action) {
      if (action.name !== 'create' && action.name !== 'read') {

        pipelineLength = action.pipeline.toString().length
        if (pipelineLength === 1) {
          pipelineArray.push(action.pipeline)
        }
        else {
          pipelineArray = action.pipeline.split('|')
        }
        
        pipelineArray.forEach(function(pipeline) {
          if (pipeline === '') {
            actionsList.push({icon: action.icon, name: action.name, pluralName: action.pluralName})
          }
          else {
            if (Number(pipeline) === item.pipelineDetail.stage) {
              actionsList.push({icon: action.icon, name: action.name, pluralName: action.pluralName})
            }
          }
        })
        pipelineArray = []
      }
    })
    return actionsList
  }

  openModal() {
    this.setState({openModal: true})
  }

  handleCancelDelete() {
    this.setState({openDeleteDialog: false})
  }

  handleConfirmDelete() {
    this.setState({
      openDeleteDialog: false,
      openSnack: true,
      messageSnack: this.props.messages.deleteOk
    })
    this.getData()
  }

  handleNewData(action, newData) {
    let message = this.props.messages.addOk
    if (action === 'edit') {
      message = this.props.messages.editOk
    }

    this.setState({
      openModal: false,
      editModal: false,
      openSnack: true,
      messageSnack: message
    })
    this.getData()
  }

  componentWillMount() {
    if (Utils.isUserLoggedIn()) {
      this.getData()
    }
    else {
      this.props.history.push('/')
    }
  }

  async getData() {
    let statusData = []
    let statusGrid = 0

    let user = await Utils.getCurrentUser()
    let instanceId = user.instanceId
    let filters = {where: {status: {neq: 2}}}

    if (this.props.origin.filter !== undefined && this.props.origin.filter !== null) {
      if (this.props.origin.filter.type === 'filterByUserId') {
        filters = {where: {[this.props.origin.filter.key]: user.id, status: {neq: 2}}}
      }
      else if (this.props.origin.filter.type === 'filterByItemId') {
        filters = {where: {[this.props.origin.filter.key]: this.props.match.params[this.props.origin.filter.key], status: {neq: 2}}}
      }
    }

    if (this.props.origin.order !== undefined && (!Utils.isEmpty(this.props.origin.order) || this.props.origin.order !== null)) {
      filters.order = this.props.origin.order
    }

    if (this.props.origin.paginator !== undefined && this.props.origin.paginator !== null) {
      filters.limit = this.props.origin.paginator.rowsPerPage
      filters.skip = 0
    }

    let responseCount = await getCountAPI({host: this.props.host, resource: this.props.origin.resourcePlural, filters: filters})
    if (responseCount.status === Utils.constants.status.SUCCESS) {
      if (this.props.status !== undefined && this.props.status) {
        let responsePipeline = await getPipelineAPI({host: this.props.host, resource: this.props.origin.resource})
        if (responsePipeline.data.length > 0) {
          responsePipeline.data.forEach(function(status) {
            statusData.push({label: status.name, value: status.count})
          })
        }
      }

      let include = []
      this.props.origin.relations.forEach(function(relation) {
        let length = relation.split('.').length
        if (length === 2) {
          include.push({
            relation: relation.split('.')[0],
            scope: {
              include: relation.split('.')[1]
            }
          })
        }
        else {
          include.push(relation)
        }
      })

      let response = await getDataAPI({host: this.props.host, resource: this.props.origin.resourcePlural, filters: filters, relations: include})

      let checkbox = []
      if (this.props.multiple !== undefined && this.props.multiple) {
        for (var i = 0; i < response.data.length; i++)
          checkbox.push(false)
      }

      if (response.status === Utils.constants.status.SUCCESS) {
        if (responseCount.data.count > 0) {
          this.setState({
            showData: true,
            data: response.data,
            count: responseCount.data.count,
            statusGrid: statusGrid,
            status: statusData,
            checkbox: checkbox,
            allCheckbox: false
          })
        }
        else {
          this.setState({
            showData: false,
            data: response.data,
            count: responseCount.data.count,
            statusGrid: statusGrid,
            status: statusData,
            emptyTitle: this.props.messages.emptyTitle,
            emptyDescription: this.props.messages.emptyDescription
          })
        }
      }
    }
    else {

    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.crud !== this.props.crud) {
      if (this.props.crud.updateDataCRUD) {
        this.getData()
        this.props.endUpdateDataCRUD()
      }
    }
  }

  componentDidDelete(prevProps) {
    Utils.scrollTop()
  }

  openActions(idx) {
    this.setState({openActions: true})
  }

  handleChangeCheckbox(option) {
    let self = this
    let allCheckbox = this.state.allCheckbox
    let checkbox = this.state.checkbox
    let selectedCheckbox = 0
    let multipleActions = []

    if (typeof(option) === 'string' && option === 'all') {
      let flag = true
      if (allCheckbox) {
        flag = false
      }
      else {
        selectedCheckbox = checkbox.length 
      }

      allCheckbox = flag
      checkbox.forEach(function(check, idx) {
        if (flag)
          multipleActions = Utils.arrayUnique(self.getActions(self.state.data[idx]))
        checkbox[idx] = flag
      })
    }
    else {
      allCheckbox = true
      checkbox[option] = !checkbox[option]
      checkbox.forEach(function(check, idx) {
        if (!check) {
          allCheckbox = false
          return
        }
        else {
          multipleActions = Utils.arrayUnique(self.getActions(self.state.data[idx]))
          selectedCheckbox ++
        }
      })
    }

    let multiple = false
    let selected = []
    if ((allCheckbox || selectedCheckbox > 1) && multipleActions.length > 0) {
      multiple = true
      this.state.data.forEach(function(data, idx) {
        if (checkbox[idx])
          selected.push(data)
      })
    }

    console.log(multiple)
    console.log(selected)
    console.log(selectedCheckbox)
    console.log(allCheckbox)
    console.log(multipleActions)

    this.setState({
      showActionMultiple: multiple,
      multipleActions: multipleActions,
      selected: selected,
      allCheckbox: allCheckbox,
      checkbox: checkbox
    })
  }

  handleActions(value, option, multiple) {
    if (multiple) {
      this.props.actions(value, option, multiple)      
    }
    else {
      let self = this
      if (option === 'update' && typeof(this.props.update) !== 'function') {
        this.setState({
          openModal: true,
          editModal: true,
          item: self.state.data[value]
        })
      }
      else if (option === 'delete' && typeof(this.props.delete) !== 'function') {
        this.setState({
          openDeleteDialog: true,
          item: self.state.data[value]
        })
      }
      else {
        if (this.props.actions !== undefined) 
          this.props.actions(self.state.data[value], option, multiple)
      }
    }
  }

  renderWithData(classes) {
    let self = this
    return (
      <div>
        <Title
          title={this.props.messages.title}
          description={this.props.messages.description}
        />
        {
          (this.props.origin.kpi !== undefined && this.props.origin.kpi.length > 0) ?
            <Grid container lg={12}>
            {
              this.props.origin.kpi.map(function(kpi) {
                return (
                    <Grid item lg={3}>
                      <KPICard
                        host={self.props.host}
                        resource={self.props.origin.resourcePlural}
                        type={kpi.type}
                        title={kpi.title}
                        description={kpi.description}
                        valueType={kpi.valueType}
                        query={kpi.query}
                        formule={kpi.formule}
                      />
                    </Grid>
                )
              })
            }
            </Grid>
          :
          ''
        }
        {
          (this.props.status !== undefined && this.props.status) ?
          <Grid container lg={12}>
            {
              this.state.status.map(function(status) {
                return (
                  <Grid item className={classes.statusGrid}>
                  <Chip
                    avatar={<Avatar className={classes.avatar}>{status.value}</Avatar>}
                    label={status.label}
                    className={classes.chip}
                  />
                  </Grid>
                )
              })
            }
          </Grid>
          :
          ''
        }
        <Paper className={classes.searchAddContainer}>
          <Grid container>
            {
              (this.props.breadcrumbs !== undefined) ?
              <Grid item className={classes.breadcrumbsContainer} lg={(this.props.create !== undefined && this.props.create) ? 10 : 12} md={9} sm={9} xs={9}>
                <Breadcrumbs
                  breadcrumbs={this.getBreadcrumbs()}
                />
              </Grid>
              :
              ''
            }
            {
              (this.props.search === undefined || this.props.search) ?
              <Grid item className={classes.searchContainer} lg={(this.props.create !== undefined && this.props.create) ? 10 : 12} md={9} sm={9} xs={9}>
                <Search 
                  placeholder={this.props.messages.searchText}
                />
              </Grid>
              :
              ''
            }
            {
              (this.props.create !== undefined || this.props.create) ?
              <Grid item lg={2} md={3} sm={3} xs={3}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.addButton}
                  onClick={ () => {
                    if (typeof(this.props.create) === 'function') {
                      this.props.create()
                    }
                    else {
                      this.openModal()
                    }
                  }}
                >
                  {this.props.messages.addButton}
                </Button>
              </Grid>
              :
              ''
            }
          </Grid>
        </Paper>
        {
          (this.props.multiple !== undefined && this.props.multiple && this.state.showActionMultiple) ?
          <Paper className={classes.multipleContainer}>
            <Grid container lg={12}>
              <MultipleActions 
                actions={this.state.multipleActions}
                selected={this.state.selected}
                messages={this.props.messages.options}
                handleCloseMultipleAction={this.handleActions}
              />
            </Grid>
          </Paper>
          :
          ''
        }
        <Paper className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
            {
              (this.props.multiple !== undefined && this.props.multiple) ?
              <TableCell className={classes.headerCell}>
                <Checkbox
                  checked={this.state.allCheckbox}
                  onChange={() => { this.handleChangeCheckbox('all') }}
                  value={this.state.allCheckbox}
                  color="primary"
                />
              </TableCell>
              :
              ''
            }
            {
              this.getParams().map((param, idx) => {
                if (param.actions.read) {
                  if (param.responsive === 'lg') {
                    return (
                      <Hidden key={idx} mdDown>
                        <TableCell className={classes.headerCell}><Typography variant="subtitle2" className={classes.headerText}>{this.props.messages.params[param.name]}</Typography></TableCell>
                      </Hidden>
                    )

                  }
                  else if (param.responsive === 'md') {
                    return (
                      <Hidden key={idx} smDown>
                        <TableCell className={classes.headerCell}><Typography variant="subtitle2" className={classes.headerText}>{this.props.messages.params[param.name]}</Typography></TableCell>
                      </Hidden>
                    )
                  }
                  else if (param.responsive === 'sm') {
                    return (
                      <Hidden key={idx} xsDown>
                        <TableCell className={classes.headerCell}><Typography variant="subtitle2" className={classes.headerText}>{this.props.messages.params[param.name]}</Typography></TableCell>
                      </Hidden>
                    )
                  }
                  else {
                    return (
                      <TableCell key={idx} className={classes.headerCell}><Typography variant="subtitle2" className={classes.headerText}>{this.props.messages.params[param.name]}</Typography></TableCell>
                    )
                  }
                }
              })
            }
            {
              (this.showActions()) ?
              <TableCell><Typography variant="subtitle1"></Typography></TableCell>
              :
              ''
            }
          </TableRow>
        </TableHead>
        <TableBody>
        {
          this.state.data.map((item, idx) => {
            return (
              <TableRow key={idx} className={classes.fitTableRow}>
              {
                (this.props.multiple !== undefined && this.props.multiple) ?
                <TableCell className={classes.headerCell}>
                  <Checkbox
                    checked={this.state.checkbox[idx]}
                    onChange={() => { this.handleChangeCheckbox(idx) }}
                    value={this.state.checkbox[idx]}
                    color="primary"
                  />
                </TableCell>
                :
                ''
              }
              {
                this.getParams().map((param, jdx) => {
                  if (param.actions.read) {
                    if (param.responsive === 'lg') {
                      return (
                        <Hidden key={jdx} mdDown>
                        {
                          (param.type === 'link') ?
                          <TableCell className={classes.contentCell}><a href={this.getValue(item, param)} target="_blank">Visualizar</a></TableCell>
                          :
                          <TableCell className={classes.contentCell}><Typography variant="body1" className={classes.contentText}>{this.getValue(item, param)}</Typography></TableCell>
                        }
                        </Hidden>
                      )
                    }
                    else if (param.responsive === 'md') {
                      return (
                        <Hidden key={jdx} smDown>
                        {
                          (param.type === 'link') ?
                          <TableCell className={classes.contentCell}><a href={this.getValue(item, param)} target="_blank">Visualizar</a></TableCell>
                          :
                          <TableCell className={classes.contentCell}><Typography variant="body1" className={classes.contentText}>{this.getValue(item, param)}</Typography></TableCell>
                        } 
                        </Hidden>
                      )
                    }
                    else if (param.responsive === 'sm') {
                      return (
                        <Hidden key={jdx} xsDown>
                        {
                          (param.type === 'link') ?
                          <TableCell className={classes.contentCell}><a href={this.getValue(item, param)} target="_blank">Visualizar</a></TableCell>
                          :
                          <TableCell className={classes.contentCell}><Typography variant="body1" className={classes.contentText}>{this.getValue(item, param)}</Typography></TableCell>
                        }
                        </Hidden>
                      )
                    }
                    else {
                      if (param.type === 'link') {
                        return (
                          <TableCell className={classes.contentCell}><a href={this.getValue(item, param)} target="_blank">Visualizar</a></TableCell>
                        )
                      }
                      else {
                        return (
                          <TableCell className={classes.contentCell}><Typography variant="body1" className={classes.contentText}>{this.getValue(item, param)}</Typography></TableCell>
                        )
                      }
                    }
                  }
                })
              }
              {
                (this.showActions()) ?
                <TableCell><Typography variant="subtitle1">
                <Actions
                  idx={idx}
                  open={this.state.openActions}
                  messages={this.props.messages}
                  actions={this.getActions(item)}
                  handleCloseAction={this.handleActions}
                />
                </Typography></TableCell>
                :
                ''
              }
              </TableRow>
            )
          })
        }
        </TableBody>
        </Table>
      </Paper>
      <Paper className={classes.paginatorContainer}>
        <Paginator
          count={this.state.count}
          rowsPerPage={this.props.origin.paginator.rowsPerPage || 10}
          options={this.props.origin.paginator.options || [5, 10, 15]}
          page={0}
        />
      </Paper>
      {this.renderComponents()}
    </div>
    )
  }

  render() {
    const { classes } = this.props

    if (this.state.showData) {
      return this.renderWithData(classes)
    }
    else {
      return (
        <div>
          <Empty
            title={this.state.emptyTitle}
            description={this.state.emptyDescription}
            emptyImg={this.getPlaceholderForEmptyComponent()}
            buttonTitle={this.getTitleForEmptyButton()}
            callToAction={() => { 
              if (this.props.create !== undefined && this.props.create) {
                if (typeof(this.props.create) === 'function') {
                  this.props.create()
                }
                else {
                  this.openModal()
                }
              }
            }}
          />
          {this.renderComponents()}
        </div>
      )
    }
  }

  renderComponents() {
    return (
      <div>
        <CRUDModal
          open={this.state.openModal}
          editMode={this.state.editModal}
          params={this.getParams()}
          messages={this.props.messages}
          host={this.props.host}
          origin={this.props.origin}
          data={this.state.item}
          handleClose={() => {this.setState({openModal: false, editModal: false})}}
          handleCloseWithNewData={(action, data) => { this.handleNewData(action, data) }}
        />
        
        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          open={this.state.openSnack}
          onClose={() => this.setState({openSnack: false, messageSnack: ''})}
          message={
            <span>{this.state.messageSnack}</span>
          }
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={() => this.setState({openSnack: false, messageSnack: ''})}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />

        <DeleteDialog
          open={this.state.openDeleteDialog}
          title={this.props.messages.deleteTitle}
          description={
            <span>{this.props.messages.deleteDescription} <strong>{this.state.item.id}</strong></span>
          }
          host={this.props.host}
          resource={this.props.origin.resourcePlural}
          data={this.state.item}
          onCancel={(this.handleCancelDelete)}
          onConfirm={this.handleConfirmDelete}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    endUpdateDataCRUD: () => {
      dispatch(endUpdateDataCRUD())
    }
  }
}

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(CRUD)
