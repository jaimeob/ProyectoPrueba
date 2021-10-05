import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Button, TextField, Typography, Modal, Select, Paper } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
// Components
import Title from './Title'
import Uploader from '../components/Uploader'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

registerLocale('es', es)

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
    width: '50%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '32px 16px 32px 16px',
    [theme.breakpoints.down('md')]: {
      width: '60%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
      padding: '16px 16px 16px 16px'
    }
  },
  modalTitle: {
    width: '100%',
    marginTop: 16,
    fontSize: 26,
    fontWeight: 600,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: 22
    }
  },
  modalText: {
    display: 'block',
    fontSize: 16,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  },
  modalTextInline: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    fontSize: 16,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  }
})

class CalzzamovilUploadEvidence extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedDate: '',
      comments: '',
      openSnack: false,
      messageSnack: '',
      ine: [],
      sign: [],
      uploader: false
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.confirmImage = this.confirmImage.bind(this)
    this.uploadImage = this.uploadImage.bind(this)
    this.confirmImageSign = this.confirmImageSign.bind(this)

  }

  async uploadImage() {
    this.state.ine[0].document = 'ine'
    this.state.sign[0].document = 'firma'
    let response = await requestAPI({
      host: Utils.constants.HOST_TRACKING,
      method: 'POST',
      resource: 'orders',
      endpoint: '/calzzamovil/evidence',
      data: {
        documents: {
          ine: this.state.ine[0],
          sign: this.state.sign[0]
        },
        orderId: this.props.data.orderId
      }
    })
    if (response.data !== undefined && response.data !== null && response.data.uploaded) {
      response = await requestAPI({
        host: Utils.constants.HOST_TRACKING,
        method: 'PATCH',
        resource: 'orders',
        endpoint: '/calzzamovil/' + this.props.data.orderId + '/finish'
      })
      if (response.data !== undefined && response.data !== null && response.data.updated) {
        this.setState({
          sign: [],
          ine: []
        })
        this.props.loadData()
        this.props.handleClose()
      }
    } else {
      this.setState({
        openSnack: true,
        messageSnack: 'No se puede subir evidencia.'
      })
    }
  }

  confirmImageSign(docs, deletedDocs) {
    this.setState({
      uploader: false,
      sign: docs
    })
  }
  confirmImage(docs, deletedDocs) {
    this.setState({
      uploader: false,
      ine: docs
    })
  }

  handleClose() {
    this.setState({
      changeButton: true,
      comments: '',
      selectedDate: '',
      messageSnack: '',
      openSnack: false,
      sign: [],
      ine: [],

    })

    this.props.handleClose()
  }


  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  render() {
    const { classes } = this.props

    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
      >
        {
          (this.props.data !== null && this.props.data !== undefined) ?
            <div style={getModalStyle()} className={classes.container}>
              <Typography style={{ marginBottom: '20px' }} variant='h5'> Subir evidencia</Typography>
              <Grid container direction="row" style={{ padding: '15px', borderRadius: '5px', boxShadow: 'rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) 0px 16px 32px -4px' }} >
                <Grid item xs={12} >
                  {/* <Typography style={{  }} variant='body2'> Subir evidencia</Typography> */}
                </Grid>
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Uploader
                        open={this.state.uploader}
                        host={Utils.constants.HOST}
                        title={(this.state.ine.length === 0) ? "Subir INE" : "Subir firma digital"}
                        description={"Solo se permite formato .png, .jgp y jpeg "}
                        limit={1}
                        maxWidth={100000000}
                        minWidth={0}
                        minHeight={0}
                        maxHeight={1000000000}
                        maxSize={500000}
                        use="calzzamovil"
                        docs={(this.state.ine.length === 0) ? this.state.ine : this.state.sign}
                        validFormats={['image/jpeg', 'image/jpg', 'image/png']}
                        maxWidth={100000000}
                        hideComments={true}
                        minHeight={Number(this.state.heightBanner)}
                        maxSize={100000000}
                        handleCloseWithData={(docs, deletedBlocks) => { (this.state.ine.length === 0) ? this.confirmImage(docs, deletedBlocks) : this.confirmImageSign(docs, deletedBlocks) }}
                        handleClose={() => { this.setState({ uploader: false }) }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container style={{ marginTop: '30px' }}>
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }} >
                          {
                            (this.state.ine.length > 0) ?
                              <img style={{ width: '40%' }} src={this.state.ine[0].data} ></img>
                              :
                              ''
                          }
                        </Grid>
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }} >
                          {
                            (this.state.sign.length > 0) ?
                              <img style={{ width: '40%' }} src={this.state.sign[0].data} ></img>
                              :
                              ''
                          }
                        </Grid>
                        <Grid xs={12} style={{ width: '100%' }} >
                          {
                            (this.state.ine.length > 0 && this.state.sign.length > 0) ?
                              <Button onClick={() => { this.uploadImage() }} variant="contained" color="primary" style={{ background: '#00eb00', width: '100%', marginLeft: 'auto', display: 'block', color: 'white', marginTop: '50px', marginRight: '10px', marginBottom: '20px' }} >Subir evidencia</Button>
                              :
                              <Button onClick={() => { this.setState({ uploader: true }) }} variant="contained" color="primary" style={{ width: '100%', marginLeft: 'auto', display: 'block', color: 'white', marginTop: '50px', marginRight: '10px', marginBottom: '20px' }} >{(this.state.ine.length === 0) ? 'Cargar INE de galeria de fotos' : 'Cargar FIRMA de galeria de fotos'}  </Button>
                          }
                        </Grid>
                      </Grid >
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Snackbar
                autoHideDuration={5000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={this.state.openSnack}
                onClose={this.handleCloseSnackbar}
                message={
                  <span>{this.state.messageSnack}</span>
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
            :
            ''
        }
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {

  }
}

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(CalzzamovilUploadEvidence)
