import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Components
import Autocomplete from './Autocomplete'

//
import Utils from '../resources/Utils'
import { addDataAPI, editDataAPI } from '../api/CRUD'

function getModalStyle() {
  const top = 50
  const left = 50
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

const styles = theme => ({
  smallForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 5,
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  largeForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing.unit * 100,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 5,
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  modalTitle: {
    fontSize: 28,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    },
    fontWeight: 600
  },
  largeTextField: {
    width: '100%',
    marginTop: 12
  },
  actions: {
    float: 'right',
    marginTop: 32,
    [theme.breakpoints.down('sm')]: {
      paddingBottom: 16
    },
  },
  primaryButton: {
    fontWeight: 600,
    fontSize: 14
  },
  fileContainer: {
    backgroundColor: '#E9EEF1',
    marginTop: 16
  },
  previewImage: {
    'object-fit': 'cover',
    width: 100,
    heigth: 100
  }
})

class CRUDModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      designForm: {
        class: 'smallForm',
        padding: 0,
        grid: 12
      },
      values: {},
      openSnack: false,
      errorMessage: ''
    }

    this.requestAddData = this.requestAddData.bind(this)
    this.requestEditData = this.requestEditData.bind(this)

    //
    this.getImage = this.getImage.bind(this)
    this.getFileName = this.getFileName.bind(this)
    this.getFileType = this.getFileType.bind(this)
    this.handleChangeFileValue = this.handleChangeFileValue.bind(this)
    this.handleChangeValues = this.handleChangeValues.bind(this)

    //
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.setDesignForm = this.setDesignForm.bind(this)
  }

  componentWillMount() {
    this.setDesignForm()
    let values = {}
    this.props.params.forEach(function(param) {
      if (param.actions.create) {
        if (param.type === 'catalog')
          values[param.id] = ''
        else if (param.type === 'file')
          values[param.name] = {name: '', type: '', data: ''}
        else
          values[param.name] = ''
      }
    })
    this.setState({
      values: values
    })
  }

  async requestAddData(request) {
    let response = await addDataAPI(request)
    if (response.status === Utils.constants.status.SUCCESS) {
      this.handleCloseWithNewData('add', response)
    }
    else {
      let errorMessage = Utils.messages.General.error
      if (response.data.error.errno === 1062) {
        errorMessage = this.props.messages.errors.duplicate
      }
      this.setState({
        openSnack: true,
        errorMessage: errorMessage
      })
    }
  }

  async requestEditData(request) {
    let response = await editDataAPI(request)
    if (response.status === Utils.constants.status.SUCCESS) {
      this.handleCloseWithNewData('edit', response)
    }
    else {
      let errorMessage = Utils.messages.General.error
      if (response.data.error.errno === 1062) {
        errorMessage = this.props.messages.errors.duplicate
      }
      this.setState({
        openSnack: true,
        errorMessage: errorMessage
      })
    }
  }

  getFileName(param) {
    if (this.state.values[param.name] !== undefined) {
      return this.state.values[param.name].name
    }
    else {
      return '-'
    }
  }

  getFileType(param) {
    if (this.state.values[param.name] !== undefined) {
      return this.state.values[param.name].type
    }
    else {
      return '-'
    }
  }

  getImage(paramName) {
    if (this.state.values[paramName] === undefined || this.state.values[paramName].data === '') {
      return ''
    }
    return this.state.values[paramName].data
  }

  handleChangeFileValue(event, paramName) {
    let uploadFile = event.target.files[0]
    let self = this
    let fileName = uploadFile.name
    let fileType = uploadFile.type
    Utils.getBase64(uploadFile).then(function(data) {
      let values = self.state.values
      values[paramName] = {name: fileName, type: fileType, data: data}
      self.setState({
        values: values
      })
    })
  }

  handleChangeValues(event, param) {
    let values = this.state.values
    values[param.name] = event.target.value
    this.setState({
      values: values
    })
  }

  handleChangeValueSelect(param, newValue) {
    let values = this.state.values
    if (newValue !== undefined) {
      values[param.id] = newValue.id
    }
    else {
      values[param.id] = ''
    }
    this.setState({
      values: values
    })
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.handleConfirm()
    }
  }

  handleConfirm() {
    let formRequired = false
    let self = this
    this.props.params.forEach(function(param) {
      if (param.required) {
        if (param.type === 'catalog') {
          if (self.state.values[param.id] === "")
            formRequired = true
        }
        else {
          if (self.state.values[param.name] === "")
            formRequired = true
        }
      }
    })

    if (formRequired) {
      this.setState({
        openSnack: true,
        errorMessage: Utils.messages.General.formRequired
      })
    }
    else {
      if (this.props.editMode) {
        this.requestEditData({host: this.props.host, resource: this.props.origin.resourcePlural, data: this.state.values, relations: this.props.origin.relations})
      }
      else {
        this.requestAddData({host: this.props.host, resource: this.props.origin.resourcePlural, data: this.state.values, relations: this.props.origin.relations})
      }
    }
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      errorMessage: ''
    })
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  handleCloseWithNewData(response) {
    this.clearData()
    this.props.handleCloseWithNewData(response)
  }

  clearData() {
    let values = {}
    this.props.params.forEach(function(param) {
      if (param.actions.create) {
        if (param.type === 'catalog')
          values[param.id] = ''
        if (param.type === 'file')
          values[param.name] = {name: '', type: '', data: ''}
        else
          values[param.name] = ''
      }
    })
    this.setState({
      values: values,
      openSnack: false,
      errorMessage: ''
    })
  }

  handleRender() {
    let values = {}
    if (this.props.editMode) {
      values = this.props.data
    }
    this.setState({
      values: values
    })
  }

  getLabel(param) {
    let required = ''
    if (param.required) {
      required = '*'
      return this.props.messages.params[param.name] + ' ' + required
    }
    else {
      return this.props.messages.params[param.name]
    }
    
  }

  setDesignForm() {
    if (this.props.params.length > 5) {
      let countParams = 0
      this.props.params.forEach(function(param) {
        if (param.actions.create || (param.actions.editMode && this.props.editMode))
          countParams ++
      })
      if (countParams > 5) {
        this.setState({
          designForm: {
            class: 'largeForm',
            grid: 6
          }
        })
        return true
      }
    }
    this.setState({
      designForm: {
        class: 'smallForm',
        grid: 12
      }
    })
    return true
  }

  render() {
    
    const { classes } = this.props
    let paddingRight = 0
    let firstParam = true

    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >
        <div style={getModalStyle()} className={classes[this.state.designForm.class]}>
          <Typography variant="h4" className={classes.modalTitle}>
            {
              (this.props.editMode) ?
              this.props.messages.modal.titleEdit
              :
              this.props.messages.modal.title
            }
          </Typography>
          <Typography variant="body1">
            {
              (this.props.editMode) ?
                this.props.messages.modal.descriptionEdit
              :
                this.props.messages.modal.description
            }
          </Typography>
          <form className={classes.form} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
            <Grid container>
            {
              this.props.params.map((param, idx) => {
                
                if (this.state.designForm.class === 'largeForm') {
                  if (idx % 2 !== 0 || idx === 0)
                    if (idx === 1)
                      paddingRight = 16
                    else
                      paddingRight = 16
                  else
                    paddingRight = 0
                }

                if (param.actions.create || (param.actions.editMode && this.props.editMode)) {
                  if (firstParam) {
                    firstParam = false
                    if (param.type === 'catalog') {
                      return (
                        <Grid item lg={this.state.designForm.grid} md={this.state.designForm.grid} sm={this.state.designForm.grid} xs={12} style={{paddingRight: paddingRight}}>
                          <Autocomplete
                            key={idx}
                            label={this.getLabel(param)}
                            resource={param.catalog}
                            param={param.name}
                            value={this.state.values[param.id]}
                            onChange={(newValue) => this.handleChangeValueSelect(param, newValue)}
                          />
                        </Grid>
                      )
                    }
                    else if (param.type === 'file') {
                      return (
                        <Grid item className={classes.fileContainer} lg={this.state.designForm.grid} md={this.state.designForm.grid} sm={this.state.designForm.grid} xs={12} style={{paddingTop: paddingRight}}>
                          <div style={{float: 'left'}}>
                            <img className={classes.previewImage} src={this.getImage(param.name)} width="100" height="100"/>
                          </div>
                          <div style={{width: '50%', paddingLeft: '15%', marginTop: 4}}>
                            <ul style={{margin: 0, padding: 0, 'list-style': 'none'}}>
                              <li><strong>Nombre:</strong> {this.getFileName(param)}</li>
                              <li><strong>Tipo:</strong> {this.getFileType(param)}</li>
                            </ul>
                            <Button
                              style={{marginTop: 16}}
                              className={classes.primaryButton}
                              color="primary"
                              variant="contained"
                              component="label"
                            >
                              {this.getLabel(param)}
                              <input
                                type="file"
                                style={{ display: "none" }}
                                onChange={(event) => { this.handleChangeFileValue(event, param.name) }}
                              />
                            </Button>
                          </div>
                        </Grid>
                      )
                    }
                    else {
                      return (
                        <Grid item lg={this.state.designForm.grid} md={this.state.designForm.grid} sm={this.state.designForm.grid} xs={12} style={{paddingRight: paddingRight}}>
                          <TextField
                            key={idx}
                            className={classes.largeTextField}
                            label={this.getLabel(param)}
                            type={param.type}
                            value={this.state.values[param.name]}
                            onChange={(event) => {this.handleChangeValues(event, param) }}
                            autoFocus
                          />
                        </Grid>
                      )
                    }
                  }
                  else {
                    if (param.type === 'catalog') {
                      return (
                        <Grid item lg={this.state.designForm.grid} md={this.state.designForm.grid} sm={this.state.designForm.grid} xs={12} style={{paddingRight: paddingRight}}>
                          <Autocomplete
                            key={idx}
                            label={this.getLabel(param)}
                            resource={param.catalog}
                            param={param.name}
                            value={this.state.values[param.id]}
                            onChange={(newValue) => this.handleChangeValueSelect(param, newValue)}
                          />
                        </Grid>
                      )
                    }
                    else if (param.type === 'file') {
                      return (
                        <Grid item className={classes.fileContainer} lg={this.state.designForm.grid} md={this.state.designForm.grid} sm={this.state.designForm.grid} xs={12} style={{paddingTop: paddingRight}}>
                          <div style={{float: 'left', paddingLeft: 16, paddingRight:16, paddingBottom: 16}}>
                            <img className={classes.previewImage} src={this.getImage(param.name)} width="100" height="100"/>
                          </div>
                          <div>
                            <ul style={{margin: 0, padding: 0, 'list-style': 'none'}}>
                              <li><strong>Nombre:</strong> {this.getFileName(param)}</li>
                              <li><strong>Tipo:</strong> {this.getFileType(param)}</li>
                            </ul>
                          </div>
                          <Button
                            style={{marginTop: 16}}
                            className={classes.primaryButton}
                            color="primary"
                            variant="contained"
                            component="label"
                          >
                            {this.getLabel(param)}
                            <input
                              type="file"
                              style={{ display: "none" }}
                              onChange={(event) => { this.handleChangeFileValue(event, param.name) }}
                            />
                          </Button>
                        </Grid>
                      )
                    }
                    else {
                      return (
                        <Grid item lg={this.state.designForm.grid} md={this.state.designForm.grid} sm={this.state.designForm.grid} xs={12} style={{paddingRight: paddingRight}}>
                          <TextField
                            key={idx}
                            className={classes.largeTextField}
                            label={this.getLabel(param)}
                            type={param.type}
                            value={this.state.values[param.name]}
                            onChange={(event) => {this.handleChangeValues(event, param) }}
                          />
                        </Grid>
                      )
                    }
                  }
                }
              })
            }
            </Grid>
            <div className={classes.actions}>
              <Button
                  onClick={this.handleClose}
                >
                {this.props.messages.modal.cancelButton}
              </Button>
              <Button
                style={{marginLeft: 16}}
                className={classes.primaryButton}
                variant="contained"
                color="primary"
                onClick={this.handleConfirm}
              >
                {this.props.messages.modal.confirmButton}
              </Button>
            </div>
          </form>
          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            open={this.state.openSnack}
            onClose={this.handleCloseSnackbar}
            message={
              <span>{this.state.errorMessage}</span>
            }
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={this.handleCloseSnackbar}
              >
                <CloseIcon />
              </IconButton>
            ]}
          />
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(CRUDModal)
