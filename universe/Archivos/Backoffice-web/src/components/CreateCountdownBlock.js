'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Checkbox, Grid, Paper, Icon, Typography, Modal, Button, TextField, IconButton, Snackbar } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'

//Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'
import Uploader from './Uploader'

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
    width: theme.spacing.unit * 80,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    [theme.breakpoints.down('xs')]: {
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
    fontWeight: 600
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
    marginLeft: 16,
    fontWeight: 600,
    fontSize: 14
  },
  uploadButton: {
    fontWeight: 600,
    fontSize: 14
  },
  textFieldLarge: {
    width: '100%'
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

class CreateCountdownBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editBanner: true,
      editFinishBanner: true,
      openSnack: false,
      messageSnack: '',
      openDesktopUploader: false,
      openMobileUploader: false,
      openDesktopFinishUploader: false,
      openMobileFinishUploader: false,
      desktopDocs: [],
      mobileDocs: [],
      deletedDesktopDocs: [],
      deletedMobileDocs: [],
      desktopFinishDocs: [],
      mobileFinishDocs: [],
      deletedFinishDesktopDocs: [],
      deletedFinishMobileDocs: [],
      blockTypeId: null,
      blockId: null,
      identifier: '',
      fullWidth: false,
      paddingTop: '0',
      paddingBottom: '0',
      heightBanner: '600',
      heightBannerMobile: '600',
      countdownVerticalAlign: 'center',
      countdownHorizontalAlign: 'center',
      seoDescription: '',
      seoDescriptionFinish: '',
      callToAction: '',
      selectedDate: null,
      selectedTime: null,
      eventDate: '',
      dateToday: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000 )).toISOString().split("T")[0]
    }
    this.handleChangeDate = this.handleChangeDate.bind(this)
    this.handleChangeTime = this.handleChangeTime.bind(this)
    this.handleChangeIdentifier = this.handleChangeIdentifier.bind(this)
    this.handleChangeSEODescription = this.handleChangeSEODescription.bind(this)
    this.handleChangeSEODescriptionFinish = this.handleChangeSEODescriptionFinish.bind(this)
    this.confirmDesktopUploader = this.confirmDesktopUploader.bind(this)
    this.confirmMobileUploader = this.confirmMobileUploader.bind(this)
    this.confirmDesktopFinishUploader = this.confirmDesktopFinishUploader.bind(this)
    this.confirmMobileFinishUploader = this.confirmMobileFinishUploader.bind(this)
    this.handleChangeCallToAction = this.handleChangeCallToAction.bind(this)
    this.handleChangePaddingTop = this.handleChangePaddingTop.bind(this)
    this.handleChangePaddingBottom = this.handleChangePaddingBottom.bind(this)
    this.handleChangeHeightBanner = this.handleChangeHeightBanner.bind(this)
    this.handleChangeHeightBannerMobile = this.handleChangeHeightBannerMobile.bind(this)
    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.createNewBlock = this.createNewBlock.bind(this)
  }

  handleChangeDate(event) {
    let date = event.target.value
    let selectedDate = `${date.slice(0, 4)}-${date.slice(5, 7)}-${date.slice(8, 10)}`

    this.setState({
      selectedDate: selectedDate
    })
  }

  handleChangeTime(event) {
    this.setState({
      selectedTime: event.target.value
    })
  }

  confirmDesktopUploader(docs, deletedDocs) {
    this.setState({
      openDesktopUploader: false,
      desktopDocs: docs,
      deletedDesktopDocs: deletedDocs
    })
  }

  confirmMobileUploader(docs, deletedDocs) {
    this.setState({
      openMobileUploader: false,
      mobileDocs: docs,
      deletedMobileDocs: deletedDocs
    })
  }

  confirmDesktopFinishUploader(docs, deletedDocs) {
    this.setState({
      openDesktopFinishUploader: false,
      desktopFinishDocs: docs,
      deletedDesktopFinishDocs: deletedDocs
    })
  }

  confirmMobileFinishUploader(docs, deletedDocs) {
    this.setState({
      openMobileFinishUploader: false,
      mobileFinishDocs: docs,
      deletedMobileFinishDocs: deletedDocs
    })
  }

  handleChangeIdentifier(event) {
    this.setState({
      identifier: event.target.value
    })
  }

  handleChangeSEODescription(event) {
    this.setState({
      seoDescription: event.target.value
    })
  }

  handleChangeCallToAction(event) {
    this.setState({
      callToAction: event.target.value.trim()
    })
  }

  handleChangeSEODescription(event) {
    this.setState({
      seoDescription: event.target.value
    })
  }

  handleChangeSEODescriptionFinish(event) {
    this.setState({
      seoDescriptionFinish: event.target.value
    })
  }

  handleChangePaddingTop(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        paddingTop: event.target.value.trim()
      })
    } else {
      this.setState({
        paddingTop: '0'
      })
    }
  }

  handleChangePaddingBottom(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        paddingBottom: event.target.value.trim()
      })
    } else {
      this.setState({
        paddingBottom: '0'
      })
    }
  }

  handleChangeHeightBanner(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        heightBanner: event.target.value.trim()
      })
    } else {
      this.setState({
        heightBanner: '600'
      })
    }
  }

  handleChangeHeightBannerMobile(event) {
    if (!isNaN(event.target.value.trim())) {
      this.setState({
        heightBannerMobile: event.target.value.trim()
      })
    } else {
      this.setState({
        heightBannerMobile: '600'
      })
    }
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  validateSelectedDateAndTime(selectedDate, selectedTime) {
    let yearToday = new Date().getFullYear()
    let monthToday = new Date().getMonth() + 1
    let dayToday = new Date().getDate()
    let selectedHours = Number(selectedTime.slice(0, 2))
    let selectedMinutes = Number(selectedTime.slice(3))
    let selectedYear = Number(selectedDate.slice(0, 4))
    let selectedMonth = Number(selectedDate.slice(5, 7))
    let selectedDay = Number(selectedDate.slice(8, 10))
    let hoursToday = new Date().getHours()
    let minutesToday = new Date().getMinutes()

    if (isNaN(selectedYear)) {
      this.setState({
        openSnack: true,
        messageSnack: 'Fecha no válida. Seleccione una fecha diferente.'
      })
      return true
    }

    if (selectedYear < yearToday) {
      this.setState({
        openSnack: true,
        messageSnack: 'Año no válido. Seleccione un año diferente.'
      })
      return true
    }

    if (selectedYear === yearToday && selectedMonth < monthToday) {
      this.setState({
        openSnack: true,
        messageSnack: 'Mes no válido. Seleccione un mes diferente.'
      })
      return true
    }

    if (selectedYear === yearToday && selectedMonth === monthToday && selectedDay < dayToday) {
      this.setState({
        openSnack: true,
        messageSnack: 'Día no válido. Seleccione un día diferente.'
      })
      return true
    }

    if (selectedYear === yearToday && selectedMonth === monthToday && selectedDay === dayToday) {
      if (selectedHours < hoursToday) {
        this.setState({
          openSnack: true,
          messageSnack: 'Hora no válida. Seleccione una hora diferente.'
        })
        return true
      } else if (selectedHours === hoursToday && selectedMinutes < minutesToday) {
        this.setState({
          openSnack: true,
          messageSnack: 'Hora no válida. Seleccione una hora diferente.'
        })
        return true
      } else {
        return false
      }
    }
  }

  async createNewBlock() {
    if (this.state.identifier.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'El identificador del bloque es obligatorio. Ingresa un identificador al nuevo bloque.'
      })
      return
    }

    if (this.state.seoDescription.trim().length <= 0 || this.state.seoDescriptionFinish.trim().length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'Descripción SEO de los banner son obligatorias.'
      })
      return
    }

    if (this.state.desktopDocs.length <= 0 || this.state.mobileDocs.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'La imagen desktop y mobile del banner son obligatorias.'
      })
      return
    }

    if (this.state.desktopFinishDocs.length <= 0 || this.state.mobileFinishDocs.length <= 0) {
      this.setState({
        openSnack: true,
        messageSnack: 'La imagen desktop y mobile del banner son obligatorias.'
      })
      return
    }
    
    let eventDate = `${this.state.selectedDate} ${this.state.selectedTime}:00.000Z`
    let defaultSelectedDate = document.getElementById('date').defaultValue
    let defaultSelectedTime = document.getElementById('time').defaultValue   
 
    if (this.props.selectedBlock !== null && this.props.editBlock) {
      if (this.validateSelectedDateAndTime(this.state.selectedDate, this.state.selectedTime)) {
        return
      }

      eventDate = `${this.state.selectedDate} ${this.state.selectedTime}:00.000Z`

      this.setState({
        eventDate: eventDate
      })
    } else {
      if (this.state.selectedDate === null && this.state.selectedTime === null) {
        if (this.validateSelectedDateAndTime(defaultSelectedDate, defaultSelectedTime)) {
          return
        }

        eventDate = `${defaultSelectedDate} ${defaultSelectedTime}:00.000Z`

        this.setState({
          eventDate: eventDate
        })
      } else if (this.state.selectedDate !== null && this.state.selectedTime === null) {
        if (this.validateSelectedDateAndTime(this.state.selectedDate, defaultSelectedTime)) {
          return
        }

        eventDate = `${this.state.selectedDate} ${defaultSelectedTime}:00.000Z`

        this.setState({
          eventDate: eventDate
        })
      } else if (this.state.selectedDate === null && this.state.selectedTime !== null) {
        if (this.validateSelectedDateAndTime(defaultSelectedDate, this.state.selectedTime)) {
          return
        }

        eventDate = `${defaultSelectedDate} ${this.state.selectedTime}:00.000Z`

        this.setState({
          eventDate: eventDate
        })
      } else {
        if (this.validateSelectedDateAndTime(this.state.selectedDate, this.state.selectedTime)) {
          return
        }

        eventDate = `${this.state.selectedDate} ${this.state.selectedTime}:00.000Z`
        
        this.setState({
          eventDate: eventDate
        })
      }
    }

    let response = null
    let data = {}
    if (this.props.editBlock) {
      if (this.props.landing) {
        data = {
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          configs: {
            fullWidth: this.state.fullWidth,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 0,
            heightBannerMobile: !Utils.isEmpty(this.state.heightBannerMobile) ? Number(this.state.heightBannerMobile) : 0,
            countdownVerticalAlign: this.state.countdownVerticalAlign,
            countdownHorizontalAlign: this.state.countdownHorizontalAlign,
            banner: {
              seoDescription: this.state.seoDescription,
              desktopImage: this.state.desktopDocs[0],
              mobileImage: this.state.mobileDocs[0]
            },
            finishBanner: {
              seoDescription: this.state.seoDescriptionFinish,
              desktopImage: this.state.desktopFinishDocs[0],
              mobileImage: this.state.mobileFinishDocs[0],
              callToAction: this.state.callToAction
            },
            eventDate: eventDate,
          },
          v: this.props.selectedBlock.v,
          position: this.props.selectedBlock.position,
          status: this.props.selectedBlock.status,
          createdAt: this.props.selectedBlock.createdAt,
          id: this.props.selectedBlock.id,
          landingId: this.props.selectedBlock.landingId,
          instanceId: this.props.selectedBlock.instanceId
        }
      } else {
        data = {
          blockTypeId: this.state.blockTypeId,
          identifier: this.state.identifier,
          configs: {
            fullWidth: this.state.fullWidth,
            paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
            paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
            heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 0,
            heightBannerMobile: !Utils.isEmpty(this.state.heightBannerMobile) ? Number(this.state.heightBannerMobile) : 0,
            countdownVerticalAlign: this.state.countdownVerticalAlign,
            countdownHorizontalAlign: this.state.countdownHorizontalAlign,
            banner: {
              seoDescription: this.state.seoDescription,
              desktopImage: this.state.desktopDocs[0],
              mobileImage: this.state.mobileDocs[0]
            },
            finishBanner: {
              seoDescription: this.state.seoDescriptionFinish,
              desktopImage: this.state.desktopFinishDocs[0],
              mobileImage: this.state.mobileFinishDocs[0],
              callToAction: this.state.callToAction
            },
            eventDate: eventDate,
          }
        }
      }

      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'PATCH',
        resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
        endpoint: (this.props.landing !== undefined && this.props.landing) ?
          '/' + this.props.selectedBlock.landingId + '/edit'
          :
          '/' + this.state.blockId + '/edit',
        data: data
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.updated) {
          this.clearData()
          this.props.handleCloseWithData()
        }
      } else {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.error
        })
      }
    } else {
      response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: (this.props.landing !== undefined && this.props.landing) ? 'landings' : 'blocks',
        endpoint: (this.props.landing !== undefined && this.props.landing) ? '/' + this.props.match.params.id + '/new' : '/new',
        data: {
          identifier: this.state.identifier,
          blockTypeId: 17,
          fullWidth: this.state.fullWidth,
          paddingTop: !Utils.isEmpty(this.state.paddingTop) ? Number(this.state.paddingTop) : 0,
          paddingBottom: !Utils.isEmpty(this.state.paddingBottom) ? Number(this.state.paddingBottom) : 0,
          heightBanner: !Utils.isEmpty(this.state.heightBanner) ? Number(this.state.heightBanner) : 0,
          heightBannerMobile: !Utils.isEmpty(this.state.heightBannerMobile) ? Number(this.state.heightBannerMobile) : 0,
          countdownVerticalAlign: this.state.countdownVerticalAlign,
          countdownHorizontalAlign: this.state.countdownHorizontalAlign,
          banner: {
            seoDescription: this.state.seoDescription,
            desktopImage: this.state.desktopDocs[0],
            mobileImage: this.state.mobileDocs[0]
          },
          finishBanner: {
            seoDescription: this.state.seoDescriptionFinish,
            desktopImage: this.state.desktopFinishDocs[0],
            mobileImage: this.state.mobileFinishDocs[0],
            callToAction: this.state.callToAction
          },
          eventDate: eventDate,
        }
      })

      if (response.status === Utils.constants.status.SUCCESS) {
        if (response.data.created) {
          this.clearData()
          this.props.handleCloseWithData()
        }
      } else {
        this.setState({
          openSnack: true,
          messageSnack: Utils.messages.General.error
        })
      }
    }
  }

  handleRender() {
    this.handleMinimumDate()
    this.clearData()
    if (this.props.editBlock && this.props.selectedBlock !== null) {

      let date = this.props.selectedBlock.configs.eventDate.split('T')
      let hour = date[1].split(':')

      this.setState({
        editBanner: false,
        editFinishBanner: false,
        blockTypeId: this.props.selectedBlock.blockTypeId,
        blockId: this.props.selectedBlock.id,
        identifier: this.props.selectedBlock.identifier,
        fullWidth: this.props.selectedBlock.configs.fullWidth,
        paddingTop: String(this.props.selectedBlock.configs.paddingTop),
        paddingBottom: String(this.props.selectedBlock.configs.paddingBottom),
        heightBanner: String(this.props.selectedBlock.configs.heightBanner),
        heightBannerMobile: String(this.props.selectedBlock.configs.heightBannerMobile),
        countdownVerticalAlign: this.props.selectedBlock.configs.countdownVerticalAlign,
        countdownHorizontalAlign: this.props.selectedBlock.configs.countdownHorizontalAlign,
        seoDescription: this.props.selectedBlock.configs.banner.seoDescription,
        seoDescriptionFinish: this.props.selectedBlock.configs.finishBanner.seoDescription,
        desktopDocs: [this.props.selectedBlock.configs.banner.desktopImage],
        desktopFinishDocs: [this.props.selectedBlock.configs.finishBanner.desktopImage],
        mobileDocs: [this.props.selectedBlock.configs.banner.mobileImage],
        mobileFinishDocs: [this.props.selectedBlock.configs.finishBanner.mobileImage],
        callToAction: (this.props.selectedBlock.configs.finishBanner.cta !== null) ? this.props.selectedBlock.configs.finishBanner.cta.link : '',
        selectedDate: date[0],
        selectedTime: hour[0] + ':' + hour[1],
        eventDate: this.props.selectedBlock.configs.eventDate,
      })

      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/editar/' + this.props.selectedBlock.id)
      } else {
        this.props.history.push('/cms/' + this.props.selectedBlock.id + '/editar')
      }
    } else {
      if (this.props.landing !== undefined && this.props.landing) {
        this.props.history.push('/landings/' + this.props.match.params.id + '/bloques/nuevo/17')
      } else {
        this.props.history.push('/cms/nuevo/17')
      }
    }
  }

  clearData() {
    this.setState({
      editBanner: true,
      editFinishBanner: true,
      openSnack: false,
      messageSnack: '',
      openDesktopUploader: false,
      openMobileUploader: false,
      openDesktopFinishUploader: false,
      openMobileFinishUploader: false,
      desktopDocs: [],
      mobileDocs: [],
      deletedDesktopDocs: [],
      deletedMobileDocs: [],
      desktopFinishDocs: [],
      mobileFinishDocs: [],
      deletedFinishDesktopDocs: [],
      deletedFinishMobileDocs: [],
      blockTypeId: null,
      blockId: null,
      identifier: '',
      fullWidth: false,
      paddingTop: '0',
      paddingBottom: '0',
      heightBanner: '600',
      heightBannerMobile: '600',
      countdownVerticalAlign: 'center',
      countdownHorizontalAlign: 'center',
      seoDescription: '',
      seoDescriptionFinish: '',
      callToAction: '',
      selectedDate: null,
      selectedTime: null,
      eventDate: '',
      dateToday: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000 )).toISOString().split("T")[0]
    })
  }

  handleMinimumDate() {
    let date = new Date()
    document.getElementById("date").min = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split("T")[0]
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
        {
          (!this.props.editBlock || this.props.selectedBlock !== null) ?
          <div style={getModalStyle()} className={`${classes.container} ${classes.scrollBar}`}>
            <Grid container className={classes.innerContainer}>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Typography variant="h4" className={classes.modalTitle}>
                  Crear nuevo countdown banner.
                </Typography>
                <Typography variant="body2">
                  Ingresa los datos del nuevo bloque.
                </Typography>
              </Grid>
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Typography variant="body1"><strong>Datos generales.</strong></Typography>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Identificador del bloque *"
                        placeholder="Identificador del bloque..."
                        value={this.state.identifier}
                        onChange={(event) => { this.handleChangeIdentifier(event) }}
                        autoFocus={true}
                      />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxFullWidth" style={{ marginTop: -2 }} checked={this.state.fullWidth} onChange={() => { this.setState({ fullWidth: !this.state.fullWidth }) }} />
                      <label for="checkboxFullWidth"><strong>Full width</strong> (ancho completo)</label>
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8, paddingRight: 16 }}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Separación superior (top)"
                        placeholder="Indicar separación top banner..."
                        value={this.state.paddingTop}
                        onChange={(event) => { this.handleChangePaddingTop(event) }}
                      />
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8 }}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Separación inferior (bottom)"
                        placeholder="Indicar separación bottom banner..."
                        value={this.state.paddingBottom}
                        onChange={(event) => { this.handleChangePaddingBottom(event) }}
                      />
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8, paddingRight: 16 }}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Altura bloque *"
                        placeholder="Indicar la altura del bloque..."
                        value={this.state.heightBanner}
                        disabled={(!this.state.editBanner || !this.state.editFinishBanner || this.state.desktopDocs.length > 0 || this.state.desktopFinishDocs.length > 0) ? true : false}
                        onChange={(event) => { this.handleChangeHeightBanner(event) }}
                      />
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={6} xs={6} style={{ marginTop: 8 }}>
                      <TextField
                        className={classes.textFieldLarge}
                        label="Altura bloque mobile *"
                        placeholder="Indicar la altura del bloque en mobile..."
                        value={this.state.heightBannerMobile}
                        disabled={(!this.state.editBanner || !this.state.editFinishBanner || this.state.mobileDocs.length > 0 || this.state.mobileDocs.length > 0) ? true : false}
                        onChange={(event) => { this.handleChangeHeightBannerMobile(event) }}
                      />
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1">
                        Alineación del contador (vertical).
                      </Typography>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxAlignVerticalLeft" style={{ marginTop: -2 }} checked={this.state.countdownVerticalAlign === 'top'} onChange={() => { this.setState({ countdownVerticalAlign: 'top' }) }} />
                      <label for="checkboxAlignVerticalLeft"><strong>Arriba</strong></label>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxAlignVerticalCenter" style={{ marginTop: -2 }} checked={this.state.countdownVerticalAlign === 'center'} onChange={() => { this.setState({ countdownVerticalAlign: 'center' }) }} />
                      <label for="checkboxAlignVerticalCenter"><strong>Centro</strong></label>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxAlignVerticalRight" style={{ marginTop: -2 }} checked={this.state.countdownVerticalAlign === 'bottom'} onChange={() => { this.setState({ countdownVerticalAlign: 'bottom' }) }} />
                      <label for="checkboxAlignVerticalRight"><strong>Abajo</strong></label>
                    </Grid>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1">
                        Alineación del contador (horizontal).
                      </Typography>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxAlignHorizontalLeft" style={{ marginTop: -2 }} checked={this.state.countdownHorizontalAlign === 'left'} onChange={() => { this.setState({ countdownHorizontalAlign: 'left' }) }} />
                      <label for="checkboxAlignHorizontalLeft"><strong>Izquierda</strong></label>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxAlignHorizontalCenter" style={{ marginTop: -2 }} checked={this.state.countdownHorizontalAlign === 'center'} onChange={() => { this.setState({ countdownHorizontalAlign: 'center' }) }} />
                      <label for="checkboxAlignHorizontalCenter"><strong>Centro</strong></label>
                    </Grid>
                    <Grid item xl={4} lg={4} md={4} sm={4} xs={4} style={{ marginTop: 8 }}>
                      <Checkbox id="checkboxAlignHorizontalRight" style={{ marginTop: -2 }} checked={this.state.countdownHorizontalAlign === 'right'} onChange={() => { this.setState({ countdownHorizontalAlign: 'right' }) }} />
                      <label for="checkboxAlignHorizontalRight"><strong>Derecha</strong></label>
                    </Grid>
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1"><strong>Contenido del banner del evento.</strong></Typography>
                    </Grid>
                    {
                      (this.state.editBanner) ?
                      <>
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                          <TextField
                            className={classes.textFieldLarge}
                            label="Descripción SEO *"
                            placeholder="Describe tu imagen, se usará para el SEO..."
                            value={this.state.seoDescription}
                            onChange={(event) => { this.handleChangeSEODescription(event) }}
                          />
                        </Grid>
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                          {
                            (this.state.desktopDocs.length > 0) ?
                              <div style={{ marginTop: 8 }}>
                                <label><strong>Desktop banner cargado:</strong> {this.state.desktopDocs[0].name}</label>
                              </div>
                              :
                              ''
                          }
                          <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                            this.setState({ openDesktopUploader: true })
                          }}>
                            SUBIR IMAGEN DESKTOP
                        </Button>
                          <Uploader
                            open={this.state.openDesktopUploader}
                            host={Utils.constants.HOST}
                            title="Subir banner"
                            description={"Solo se permite formato .webp. Ancho 2,340px. Altura máxima " + this.state.heightBanner + "x."}
                            limit={1}
                            use="banners"
                            docs={this.state.desktopDocs}
                            validFormats={['image/webp']}
                            hideComments={true}
                            maxWidth={2340}
                            minWidth={2340}
                            minHeight={Number(this.state.heightBanner)}
                            maxHeight={Number(this.state.heightBanner)}
                            maxSize={500000}
                            handleCloseWithData={(docs, deletedBlocks) => { this.confirmDesktopUploader(docs, deletedBlocks) }}
                            handleClose={() => { this.setState({ openDesktopUploader: false }) }}
                          />
                        </Grid>
                        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                          {
                            (this.state.mobileDocs.length > 0) ?
                              <div style={{ marginTop: 8 }}>
                                <label><strong>Mobile banner cargado:</strong> {this.state.mobileDocs[0].name}</label>
                              </div>
                              :
                              ''
                          }
                          <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, marginBottom: 8, width: '100%' }} onClick={(event) => {
                            this.setState({ openMobileUploader: true })
                          }}>
                            SUBIR IMAGEN MOBILE
                        </Button>
                          <Uploader
                            open={this.state.openMobileUploader}
                            host={Utils.constants.HOST}
                            title="Subir banner"
                            description={"Solo se permite formato .webp. Ancho 800px. Altura máxima " + this.state.heightBannerMobile + "px."}
                            limit={1}
                            use="banners"
                            docs={this.state.mobileDocs}
                            validFormats={['image/webp']}
                            hideComments={true}
                            maxWidth={800}
                            minWidth={800}
                            minHeight={Number(this.state.heightBannerMobile)}
                            maxHeight={Number(this.state.heightBannerMobile)}
                            maxSize={500000}
                            handleCloseWithData={(docs, deletedBlocks) => { this.confirmMobileUploader(docs, deletedBlocks) }}
                            handleClose={() => { this.setState({ openMobileUploader: false }) }}
                          />
                        </Grid>
                      </>
                      :
                      <div>
                        <img style={{ width: 50, marginRight: 8 }} src={this.props.selectedBlock.configs.banner.desktopImage.data || this.props.selectedBlock.configs.banner.desktopImage.url} />
                        <img style={{ width: 50 }} src={this.props.selectedBlock.configs.banner.mobileImage.data || this.props.selectedBlock.configs.banner.mobileImage.url} />
                        <br />
                        <strong>{this.props.selectedBlock.configs.banner.seoDescription}</strong>
                        <br />
                        <IconButton onClick={() => { this.setState({
                          seoDescription: '',
                          desktopDocs: [],
                          mobileDocs: [],
                          editBanner: true
                        }) }}><Icon>delete</Icon></IconButton>
                      </div>
                    }
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1"><strong>Contenido del banner al finalizar evento.</strong></Typography>
                    </Grid>
                    {
                      (this.state.editFinishBanner) ?
                      <>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Descripción SEO *"
                          placeholder="Describe tu imagen, se usará para el SEO..."
                          value={this.state.seoDescriptionFinish}
                          onChange={(event) => { this.handleChangeSEODescriptionFinish(event) }}
                        />
                      </Grid>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        {
                          (this.state.desktopFinishDocs.length > 0) ?
                            <div style={{ marginTop: 8 }}>
                              <label><strong>Desktop banner cargado:</strong> {this.state.desktopFinishDocs[0].name}</label>
                            </div>
                            :
                            ''
                        }
                        <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, width: '100%' }} onClick={(event) => {
                          this.setState({ openDesktopFinishUploader: true })
                        }}>
                          SUBIR IMAGEN DESKTOP
                        </Button>
                        <Uploader
                          open={this.state.openDesktopFinishUploader}
                          host={Utils.constants.HOST}
                          title="Subir banner"
                          description={"Solo se permite formato .webp. Ancho 2,340px. Altura máxima " + this.state.heightBanner + "x."}
                          limit={1}
                          use="banners"
                          docs={this.state.desktopFinishDocs}
                          validFormats={['image/webp']}
                          hideComments={true}
                          maxWidth={2340}
                          minWidth={2340}
                          minHeight={Number(this.state.heightBanner)}
                          maxHeight={Number(this.state.heightBanner)}
                          maxSize={500000}
                          handleCloseWithData={(docs, deletedBlocks) => { this.confirmDesktopFinishUploader(docs, deletedBlocks) }}
                          handleClose={() => { this.setState({ openDesktopFinishUploader: false }) }}
                        />
                      </Grid>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        {
                          (this.state.mobileFinishDocs.length > 0) ?
                            <div style={{ marginTop: 8 }}>
                              <label><strong>Mobile banner cargado:</strong> {this.state.mobileFinishDocs[0].name}</label>
                            </div>
                            :
                            ''
                        }
                        <Button variant="contained" color="primary" className={classes.uploadButton} style={{ marginTop: 8, marginBottom: 8, width: '100%' }} onClick={(event) => {
                          this.setState({ openMobileFinishUploader: true })
                        }}>
                          SUBIR IMAGEN MOBILE
                        </Button>
                        <Uploader
                          open={this.state.openMobileFinishUploader}
                          host={Utils.constants.HOST}
                          title="Subir banner"
                          description={"Solo se permite formato .webp. Ancho 800px. Altura máxima " + this.state.heightBannerMobile + "px."}
                          limit={1}
                          use="banners"
                          docs={this.state.mobileFinishDocs}
                          validFormats={['image/webp']}
                          hideComments={true}
                          maxWidth={800}
                          minWidth={800}
                          minHeight={Number(this.state.heightBannerMobile)}
                          maxHeight={Number(this.state.heightBannerMobile)}
                          maxSize={500000}
                          handleCloseWithData={(docs, deletedBlocks) => { this.confirmMobileFinishUploader(docs, deletedBlocks) }}
                          handleClose={() => { this.setState({ openMobileFinishUploader: false }) }}
                        />
                      </Grid>
                      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <TextField
                          className={classes.textFieldLarge}
                          label="Call To Action (URL destino al hacer click en el banner)"
                          placeholder="Ejemplo: /mujeres/calzado, https://instagram.com/calzzapato.mx, etc."
                          value={this.state.callToAction}
                          onChange={(event) => { this.handleChangeCallToAction(event) }}
                        />
                      </Grid>
                    </>
                    :
                    <div>
                      <img style={{ width: 50, marginRight: 8 }} src={this.props.selectedBlock.configs.finishBanner.desktopImage.data || this.props.selectedBlock.configs.finishBanner.desktopImage.url} />
                      <img style={{ width: 50 }} src={this.props.selectedBlock.configs.finishBanner.mobileImage.data || this.props.selectedBlock.configs.finishBanner.mobileImage.url} />
                      <br />
                      <strong>{this.props.selectedBlock.configs.finishBanner.seoDescription}</strong>
                      <br />
                      <span>{(this.props.selectedBlock.configs.finishBanner.cta !== null) ? this.props.selectedBlock.configs.finishBanner.cta.link : ''}</span>
                      <IconButton onClick={() => { this.setState({
                        seoDescriptionFinish: '',
                        desktopFinishDocs: [],
                        mobileFinishDocs: [],
                        callToAction: '',
                        editFinishBanner: true
                      }) }}><Icon>delete</Icon></IconButton>
                    </div>
                    }
                  </Grid>
                </Paper>
                <Paper className={classes.paper}>
                  <Grid container>
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography variant="body1"><strong>Evento.</strong></Typography>
                    </Grid>
                  </Grid>
                  <Grid style={{ marginTop: 16 }} container justify="center">
                    <Grid item xl={6} lg={6} md={6} sm={6} xs={6}>
                      <form noValidate>
                        <TextField
                          id="date"
                          label="Fecha"
                          type="date"
                          value={this.state.selectedDate}
                          defaultValue={this.state.dateToday}
                          onChange={this.handleChangeDate}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </form>
                    </Grid>
                    <Grid item xl={6} lg={6} md={6} sm={6} xs={6}>
                      <form noValidate>
                        <TextField
                          id="time"
                          label="Hora"
                          type="time"
                          value={this.state.selectedTime}
                          defaultValue={'12:00'}
                          onChange={this.handleChangeTime}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            step: 300, // 5 min
                          }}
                        />
                      </form>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              </Grid>
              <div className={classes.actions}>
                <Button
                  onClick={this.handleClose}
                >
                  CERRAR
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={this.createNewBlock}
                  className={classes.primaryButton}
                >
                  CONFIRMAR
                </Button>
              </div>
              <Snackbar
                autoHideDuration={5000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={this.state.openSnack}
                onClose={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
                message={
                  <span>{this.state.messageSnack}</span>
                }
                action={[
                  <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
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

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(CreateCountdownBlock)
