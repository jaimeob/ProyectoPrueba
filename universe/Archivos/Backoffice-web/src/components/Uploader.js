import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import CheckIcon from '@material-ui/icons/Check'
import DeleteIcon from '@material-ui/icons/Delete'

// Components
import Autocomplete from './Autocomplete'
import Empty from './Empty'

// Utils
import Utils from '../resources/Utils'
import { clearAutocomplete } from '../actions/actionAutocomplete'

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
  container: {
    position: 'absolute',
    width: theme.spacing.unit * 100,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 5,
    [theme.breakpoints.down('xs')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingTop: '20%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  modalTitle: {
    fontWeight: 600
  },
  largeTextField: {
    width: '100%',
    marginTop: 12
  },
  uploadContainer: {
    margin: 0,
    padding: 0,
    marginTop: 16,
    paddingBottom: 16,
    borderBottom: '1px solid #E5E5E5'
  },
  uploadButton: {
    width: '100%',
    fontWeight: 600,
    fontSize: 12
  },
  actions: {
    float: 'right',
    marginTop: 32
  },
  fileOkMessage: {
    fontSize: 14,
    fontWeight: 600,
    color: '#42E861'
  },
  fileMessagePlaceholder: {
    fontSize: 14,
    fontWeight: 600,
    color: 'gray'
  },
  docImage: {
    width: 70,
    float: 'right',
    heigth: 'auto'
  },
  primaryButton: {
    fontWeight: 600,
    fontSize: 14
  },
  loadButton: {
    marginTop: 24,
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

class Uploader extends Component {
  constructor(props) {
    super(props)

    this.state = {
      doc: {
        id: null,
        cdnId: null,
        documentTypeId: null,
        documentTypeName: '',
        name: '',
        type: '',
        size: 0,
        width: 0,
        height: 0,
        comments: '',
        data: ''
      },
      deletedDocs: [],
      docs: [],
      openSnack: false,
      snackMessage: ''
    }

    //
    this.handleChangeFileValue = this.handleChangeFileValue.bind(this)
    this.handleChangeValueSelect = this.handleChangeValueSelect.bind(this)
    this.handleChangeCommentsValue = this.handleChangeCommentsValue.bind(this)
    this.getFileName = this.getFileName.bind(this)
    this.getFileType = this.getFileType.bind(this)
    this.getImage = this.getImage.bind(this)

    this.loadDocument = this.loadDocument.bind(this)
    this.deleteItem = this.deleteItem.bind(this)

    //
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.clearData = this.clearData.bind(this)
  }

  handleChangeFileValue(event) {
    let uploadFile = event.target.files[0]
    if (uploadFile === undefined)
      return
    let self = this
    let fileName = uploadFile.name
    let fileType = uploadFile.type
    let fileSize = uploadFile.size

    Utils.getBase64(uploadFile).then(function(data) {
      let doc = self.state.doc
      doc.name = fileName
      doc.type = fileType
      doc.size = fileSize
      doc.data = data
      if (fileType === 'application/pdf') {
        doc.width = 0
        doc.height = 0
        self.setState({
          doc: doc
        })
      }
      else {
        let img = new Image()
        img.src = doc.data
        img.onload = function() {
          doc.width = this.width
          doc.height = this.height
          self.setState({
            doc: doc
          })
        }
      }
    })
  }

  handleChangeValueSelect(param, newValue) {
    let doc = this.state.doc
    if (newValue === null) {
      doc[param] = null
    }
    else {
      doc[param] = newValue.id
      doc.documentTypeName = newValue.data.name
    }
    this.setState({
      doc: doc
    })
  }

  handleChangeCommentsValue(event) {
    let value = event.target.value
    let doc = this.state.doc
    doc.comments = value
    this.setState({
      doc: doc
    })
  }

  getFileName() {
    if (this.state.doc !== undefined) {
      return this.state.doc.name
    }
    else {
      return '-'
    }
  }

  getFileType() {
    if (this.state.doc !== undefined) {
      return this.state.doc.type
    }
    else {
      return '-'
    }
  }

  getImage() {
    if (this.state.doc === undefined || this.state.doc.data === '') {
      return ''
    }
    return this.state.doc.data
  }

  loadDocument() {
    let snackMessage = ''
    console.log(this.state.doc.documentTypeId,"this.state.doc.data ---");
    if (Utils.isEmpty(this.state.doc.data)) {
      snackMessage = 'No se ha especificado un archivo.'
    }
    else if (Number(this.state.doc.documentTypeId) <= 0) {
      snackMessage = 'No se ha especificado uso del archivo.'
    }
    else if (this.props.limit !== undefined && this.state.docs.length >= this.props.limit) {
      // Check quantity
      let complement = (this.props.limit === 1) ? 'archivo' : 'archivos'
      snackMessage = 'Solo se permite ' + Utils.numberWithCommas(this.props.limit) + ' ' + complement
    }
    else if (this.state.doc.size > this.props.maxSize) {
      // Check size
      snackMessage = 'El banner debe de pesar menos de ' + Utils.numberWithCommas(this.props.maxSize/100) + '  KB.'
    }
    else if (this.state.doc.width > this.props.maxWidth || this.state.doc.width < this.props.minWidth) {
      // Check dimensions
      snackMessage = 'Ancho máximo ' + Utils.numberWithCommas(this.props.minWidth) + 'px y máximo ' + Utils.numberWithCommas(this.props.maxWidth) + 'px'
    }
    else if (this.state.doc.height > this.props.maxHeight || this.state.doc.height < this.props.minHeight) {
      // Check dimensions
      snackMessage = 'Altura mínima ' + Utils.numberWithCommas(this.props.minHeight) + 'px y máxima ' + Utils.numberWithCommas(this.props.maxHeight) + 'px'
    }
    else if (!this.props.validFormats.includes(this.state.doc.type)) {
      // Check format
      let stringFormats = ''
      this.props.validFormats.forEach((format, idx) => {
        if (idx === 0) {
          stringFormats += format
        } else {
          stringFormats += ', ' + format
        }
      })
      snackMessage = 'Los formatos válidos son ' + stringFormats

    }
    else {
      this.props.clearAutocomplete('documentTypeAutocomplete')
      snackMessage = 'Archivo cargado exitósamente.'
      let docs = this.state.docs
      docs.push(this.state.doc)
      this.setState({
        doc: {
          id: null,
          cdnId: null,
          documentTypeId: null,
          documentTypeName: '',
          name: '',
          type: '',
          size: 0,
          width: 0,
          height: 0,
          comments: '',
          data: ''
        },
        docs: docs
      })
    }
    this.setState({
      openSnack: true,
      snackMessage: snackMessage
    })
  }

  deleteItem(idx) {
    let deletedDocs = this.state.deletedDocs
    let docs = this.state.docs
    if (docs[idx].id !== undefined && docs[idx].id !== null)
      deletedDocs.push(docs[idx])
    docs.splice(idx, 1)
    this.setState({
      docs: docs,
      deletedDocs: deletedDocs
    })
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (this.state.doc.data === null)
        this.handleConfirm()
      else
      this.loadDocument()
    }
  }

  handleConfirm() {
    let totalSize = 0
    this.state.docs.forEach(function(doc, idx) {
      totalSize += doc.size
    })

    if (totalSize > Utils.constants.MAX_UPLOAD_SIZE) {
      this.setState({
        openSnack: true,
        snackMessage: 'El tamaño de los archivos no debe ser mayor a ' + ((Utils.constants.MAX_UPLOAD_SIZE / 1000) / 1000) + ' MB. Por favor, ajuste la cantidad archivos y vuelva a intentarlo.' 
      })
    }
    else {
      this.clearData()
      this.props.handleCloseWithData(this.state.docs, this.state.deletedDocs)
    }
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      snackMessage: ''
    })
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  clearData() {
    this.setState({
      doc: {
        id: null,
        cdnId: null,
        documentTypeId: null,
        documentTypeName: '',
        name: '',
        type: '',
        size: 0,
        width: 0,
        height: 0,
        comments: '',
        data: ''
      },
      docs: [],
      openSnack: false,
      snackMessage: ''
    })
  }

  handleRender() {
    let docs = []
    let id = null
    let cdnId = null
    let documentTypeName = ''
    this.props.docs.forEach(function(doc) {
      id = null
      cdnId = null
      documentTypeName = ''

      if (doc.documentTypeName !== undefined) {
        documentTypeName = doc.documentTypeName
      }

      if (doc.id !== undefined) {
        id = doc.id
      }

      if (doc.cdnId !== undefined) {
        cdnId = doc.cdnId
      }

      docs.push({id: id, cdnId: cdnId, name: doc.name, documentTypeId: doc.documentTypeId, documentTypeName: documentTypeName, type: doc.type, size: doc.size, width: doc.width, height: doc.height, comments: '', data: doc.data})
    })

    this.setState({
      docs: docs
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >
        <div style={getModalStyle()} className={classes.container}>
          <Typography variant="h4" className={classes.modalTitle}>
            {this.props.title}
          </Typography>
          <Typography variant="body1" style={{marginTop: 8}}>
            {this.props.description}
          </Typography>
          <form className={classes.initForm} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
            <Grid container lg={12} className={classes.uploadContainer}>
              <Grid item lg={5}>
                <div>
                  <div style={{float: 'left', paddingRight:16}}>
                    {
                      (this.getFileType() === 'application/pdf') ?
                      <iframe className={classes.previewImage} data={this.getImage()} width="100" height="100"/>
                      :
                      <img className={classes.previewImage} src={this.getImage()} width="100" height="100"/>
                    }
                  </div>
                  <div>
                    <ul style={{margin: 0, padding: 0, 'list-style': 'none'}}>
                      <li><strong>Nombre:</strong> {this.getFileName()}</li>
                      <li><strong>Tipo:</strong> {this.getFileType()}</li>
                    </ul>
                  </div>
                  <Button
                    style={{marginTop: 16}}
                    className={classes.primaryButton}
                    color="primary"
                    variant="contained"
                    component="label"
                  >
                    {Utils.messages.Uploader.labelButton}
                    <input
                      type="file"
                      accept={ (this.props.validFormats !== undefined) ? this.props.validFormats : Utils.constants.VALID_FORMATS }
                      style={{ display: "none" }}
                      onChange={(event) => { this.handleChangeFileValue(event) }}
                    />
                  </Button>
                </div>
                <br />
                <Autocomplete
                  id="documentTypeAutocomplete"
                  label="Uso del archivo"
                  host={this.props.host}
                  resource="document-types"
                  filters={{where: {use: this.props.use, status: {neq: 2}}, limit: 5}}
                  param="name"
                  value={this.state.doc.documentTypeId}
                  onChange={(newValue) => this.handleChangeValueSelect('documentTypeId', newValue)}
                />
                {
                  (this.props.hideComments === undefined || !this.props.hideComments) ?
                  <TextField
                    className={classes.largeTextField}
                    type="text"
                    label={Utils.messages.Uploader.commentsLabel}
                    placeholder={Utils.messages.Uploader.commentsLabel + "..."}
                    value={this.state.doc.comments}
                    onChange={(event) => this.handleChangeCommentsValue(event)}
                  />
                  :
                  ''
                }
                <Button
                  className={classes.loadButton}
                  variant="contained"
                  color="primary"
                  onClick={() => { this.loadDocument() }}
                >
                  Cargar archivo
                </Button>
              </Grid>
              <Grid item lg={1}>
              </Grid>
              <Grid item lg={6}>
                <Typography variant="h6">
                  <strong>Archivos cargados.</strong>
                </Typography>
                {
                  (this.state.docs.length > 0) ?
                  <Paper>
                    <Table>
                      <TableBody>
                        {
                          this.state.docs.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell component="th" scope="item">
                                <img src={item.data} style={{ width: '100%' }} />
                                <strong>{item.name}</strong>
                                <br />
                                {item.documentTypeName}
                                <br />
                                {Utils.numberWithCommas((item.size / 1000).toFixed(2))} KB
                              </TableCell>
                              <TableCell scope="item">
                                <IconButton className={classes.deleteButton}
                                  onClick={() => { this.deleteItem(idx) }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </Paper>
                  :
                  <Empty
                    description="¡No hay archivos cargados!"
                  />
                }
              </Grid>
            </Grid>
            <div className={classes.actions}>
              <Button
                  style={{marginRight: 16}}
                  onClick={this.handleClose}
                >
                {Utils.messages.Uploader.cancelButton}
              </Button>
              <Button
                className={classes.primaryButton}
                variant="contained"
                color="primary"
                onClick={this.handleConfirm}
              >
                {Utils.messages.Uploader.confirmButton}
              </Button>
            </div>
          </form>
          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            open={this.state.openSnack}
            onClose={this.handleCloseSnackbar}
            message={
              <span>{this.state.snackMessage}</span>
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

const mapDispatchToProps = dispatch => {
  return {
    clearAutocomplete: (autocompleteId) => {
      dispatch(clearAutocomplete(autocompleteId))
    }
  }
}

export default compose(
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(Uploader)
