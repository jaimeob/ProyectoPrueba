'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'


// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Button, Paper, Table, TableRow, TableCell, TableBody, Modal, Typography, TextField, Grid, Snackbar, IconButton, Icon } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
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
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: theme.spacing(80),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    [theme.breakpoints.down('xs')]: {
      top: 0,
      paddingTop: '10%',
      paddingBottom: '10%',
      background: 'white',
      width: '100%',
      height: '100%'
    }
  },
  innerContainer: {
    padding: 32,
    [theme.breakpoints.down('xs')]: {
      padding: 8
    }
  },
  paper: {
    marginTop: 8,
    marginBottom: 16,
    padding: '8px 16px'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 500,
    color: '#111110'
  },
  media: {
    width: 160
  },
  title: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'normal',
    color: '#111110'
  },
  description: {
    fontSize: 14,
    fontWeight: 300,
    color: '#111110'
  },
  ratingContainer: {
    margin: '8px 0',
  },
  ratingComponent: {
    float: 'left',
    marginLeft: -3
  },
  actions: {
    position: 'sticky',
    left: 0,
    bottom: 0,
    background: 'white',
    padding: '16px 0px',
    textAlign: 'right',
    width: '100%'
  },
  primaryButton: {
    fontWeight: 600,
    fontSize: 14,
    textTransform: 'none',
  },
  uploadButton: {
    fontWeight: 600,
    fontSize: 14
  },
  loadButton: {
    textTransform: 'none',
    background: '#31C65E',
    color: 'white',
    widht: '100%',
  },
  textFieldLarge: {
    width: '100%'
  },
  closeButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#006FB9',
    textTransform: 'none',
    margin: 0,
    padding: 0,
    [theme.breakpoints.down('sm')]: {
      marginTop: 8
    }
  },
  previewImage: {
    width: '100px',
    height: '100px',
    'object-fit': 'contain'
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

    Utils.getBase64(uploadFile).then(function (data) {
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
        img.onload = function () {
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
      return './placeholder.svg'
    }
    return this.state.doc.data
  }

  loadDocument() {
    let snackMessage = ''
    if (Utils.isEmpty(this.state.doc.data)) {
      snackMessage = 'No se ha especificado un archivo.'
    }
    else if ((this.props.hideUse === undefined || !this.props.hideUse) && Number(this.state.doc.documentTypeId) <= 0) {
      snackMessage = 'No se ha especificado uso del archivo.'
    }
    else if (this.props.limit !== undefined && this.state.docs.length >= this.props.limit) {
      // Check quantity
      let complement = (this.props.limit === 1) ? 'archivo' : 'archivos'
      snackMessage = 'Solo se permite ' + Utils.numberWithCommas(this.props.limit) + ' ' + complement
    }
    else if (this.state.doc.size > this.props.maxSize) {
      // Check size
      snackMessage = 'El banner debe de pesar menos de ' + Utils.numberWithCommas(this.props.maxSize / 100) + '  KB.'
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
    this.state.docs.forEach(function (doc, idx) {
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
    this.props.docs.forEach(function (doc) {
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

      docs.push({ id: id, cdnId: cdnId, name: doc.name, documentTypeId: doc.documentTypeId, documentTypeName: documentTypeName, type: doc.type, size: doc.size, width: doc.width, height: doc.height, comments: '', data: doc.data })
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
        <div style={getModalStyle()} className={`${classes.container} ${classes.scrollBar}`}>
          <Grid container className={classes.innerContainer}>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <Typography variant="h4" className={classes.modalTitle}>
                {this.props.title}
              </Typography>
              <Typography variant="body1">
                {this.props.description}
              </Typography>
            </Grid>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
              <form className={classes.initForm} noValidate autoComplete="off" onKeyPress={this.handleKeyPress}>
                <Grid container className={classes.uploadContainer}>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <div>
                      <div style={{ float: 'left', paddingRight: 16 }}>
                        {
                          (this.getFileType() === 'application/pdf') ?
                            <iframe className={classes.previewImage} data={this.getImage()} />
                            :
                            <img className={classes.previewImage} src={this.getImage()} />
                        }
                      </div>
                      <div>
                        <ul style={{ margin: 0, padding: 0, 'list-style': 'none', fontWeight: 300 }}>
                          <li><strong style={{ fontWeight: 500 }}>Nombre:</strong> <label style={{ fontWeight: 300 }}>{this.getFileName()}</label></li>
                          <li><strong style={{ fontWeight: 500 }}>Tipo:</strong> <label style={{ fontWeight: 300 }}>{this.getFileType()}</label></li>
                        </ul>
                      </div>
                      <Button
                        style={{ marginTop: 16 }}
                        className={classes.primaryButton}
                        color="primary"
                        variant="contained"
                        component="label"
                      >
                        Selecciona una foto horizontal
                        <input
                          type="file"
                          accept={(this.props.validFormats !== undefined) ? this.props.validFormats : Utils.constants.VALID_FORMATS}
                          style={{ display: "none" }}
                          onChange={(event) => { this.handleChangeFileValue(event) }}
                        />
                      </Button>
                      <Button
                        style={{ marginLeft: 8, marginTop: 16 }}
                        className={classes.loadButton}
                        variant="contained"
                        onClick={() => { this.loadDocument() }}
                      >
                        Cargar archivo <Icon>done</Icon>
                      </Button>
                    </div>
                    <br />
                    {
                      (this.props.hideUse === undefined || !this.props.hideUse) ?
                        <Autocomplete
                          id="documentTypeAutocomplete"
                          label="Uso del archivo"
                          host={this.props.host}
                          resource="document-types"
                          filters={{ where: { use: this.props.use, status: { neq: 2 } }, limit: 5 }}
                          param="name"
                          value={this.state.doc.documentTypeId}
                          onChange={(newValue) => this.handleChangeValueSelect('documentTypeId', newValue)}
                        />
                        :
                        ''
                    }
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
                  </Grid>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    {
                      (this.state.docs.length > 0) ?
                        <Grid container item>
                          <Typography variant="body1" style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
                            <strong>Fotos cargadas</strong>
                          </Typography>
                          <Table>
                            <TableBody>
                              {
                                this.state.docs.map((item, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell component="th" scope="item">
                                      <img src={item.data} className={classes.previewImage}/>
                                      <strong>{item.name}</strong>
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
                        </Grid>
                        :
                        <Empty
                          description="¡No hay fotos cargadas!"
                        />
                    }
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>
          <div className={classes.actions}>
            <Button
              style={{ marginRight: 16, textTransform: 'none' }}
              onClick={this.handleClose}
            >
              Cancelar
            </Button>
            <Button
              className={classes.primaryButton}
              variant="contained"
              color="primary"
              onClick={this.handleConfirm}
            >
              Confirmar
            </Button>
          </div>
          <Snackbar
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(Uploader)
