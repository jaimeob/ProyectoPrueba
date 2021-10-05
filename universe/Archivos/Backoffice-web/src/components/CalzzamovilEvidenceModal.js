import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import dateFormat from 'dateformat'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

// Components
import Title from '../components/Title'

dateFormat.i18n = {
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
  ],
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ],
  timeNames: ["a", "p", "am", "pm", "A", "P", "AM", "PM"],
}

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
    width: '60%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '32px 16px 32px 16px',
    [theme.breakpoints.down('sm')]: {
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

class CalzzamovilEvidenceModal extends Component {
  constructor(props) {
    super(props)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose() {
    this.props.handleClose()
  }

  handleRender() {
    if (this.props.data !== null || this.props.data !== undefined) {
      this.props.history.push('/calzzamovil/compras/' + this.props.data.order)
    } else {
      this.handleClose()
    }
  }

  getDateWithFormat(date) {
    return dateFormat(date, 'ddd') + ' ' + dateFormat(date, 'd') + ' de ' + dateFormat(date, 'mmm') + ' de ' + dateFormat(date, 'yyyy') + ' a las ' + dateFormat(date, 'h:mmTT')
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}>
        {
          (this.props.data !== null && this.props.data !== undefined) ?
            <div style={getModalStyle()} className={classes.container}>
              <Grid container direction="row">
                <Title
                  title="Evidencia" />
                <Typography className={classes.modalText} style={{ width: '100%' }} variant="body1">Folio: {this.props.data.order}</Typography>
                {
                  (this.props.data.deliveryDate !== undefined && this.props.data.deliveryDate !== null) ?
                    <Typography className={classes.modalText} style={{ width: '100%' }} variant="body1">Entrega realizada el {this.getDateWithFormat(this.props.data.deliveryDate)}</Typography>
                    :
                    ''
                }

                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
                  <Typography className={classes.modalText} variant="body1">Credencial:</Typography>
                  {
                    (this.props.data.ine !== null && this.props.data.ine !== undefined && this.props.data.ine.url !== null && this.props.data.ine.url !== undefined)?
                    <img style={{ width: '30%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} src={this.props.data.ine.url} />
                    :
                    <img style={{ width: '30%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} src={`data:image/jpeg;base64,${this.props.data.ine}`} />
                  }

                </Grid>
                <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 16 }}>
                  <Typography className={classes.modalText} variant="body1">Firma:</Typography>
                  {
                    (this.props.data.sign !== null && this.props.data.sign !== undefined && this.props.data.sign.url !== null && this.props.data.sign.url !== undefined)?
                    <img style={{ width: '30%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} src={this.props.data.sign.url} />
                    :
                    <img style={{ width: '30%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} src={`data:image/jpeg;base64,${this.props.data.sign}`} />
                  }
                </Grid>
              </Grid>
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
)(CalzzamovilEvidenceModal)
