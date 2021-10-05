import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale } from  "react-datepicker";
import es from 'date-fns/locale/es';

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Button, TextField, Typography, Modal } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
// Components
import Title from '../components/Title'

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
    width: '30%',
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
    width:'100%',
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

class CalzzamovilPausedOrderModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
        selectedDate: '',
        comments: '',
        openSnack: false,
        messageSnack: ''
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleChangeDate = this.handleChangeDate.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.cancelOrder = this.cancelOrder.bind(this)
  }

  async rejectedRequest(){
    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'POST',
      resource: 'users',
      endpoint: '/calzzamovil/cancel',
      data: {
        comments: this.state.comments,
        orderId: this.props.data.orderId,
        type: this.props.data.type,
        accepts: false
      }
    })

    if (response.data !== undefined){
      this.setState({
        openSnack: false,
        messageSnack: response.data.message,
        comments: ''

      }, () => {
        setTimeout(function() { 
          this.handleClose()
          this.props.loadData()
        }.bind(this), 1000)
      })
    }   
  }
  
  handleClose() {
    this.setState({
      comments: '',
      selectedDate: '',
      messageSnack: '',
      openSnack: false
    })

    this.props.handleClose()
  }

  handleChangeDate(date) {
    this.setState({
      selectedDate: date
    })
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

   async cancelOrder() {
    let validate = true
    let comments = this.state.comments.trim()
    let selectedDate = this.state.selectedDate.toString().trim()

    if (validate && Utils.isEmpty(comments)){
        validate = false

        this.setState({
            openSnack: true,
            messageSnack: 'Es necesario ingresar un comentario'
        })
    }
    if (validate && this.props.data.type === 'PAUSED' && Utils.isEmpty(selectedDate)){
        validate = false

        this.setState({
            openSnack: true,
            messageSnack: 'Es necesario ingresar una fecha para posponer envió'
        })
    }

    if (validate){
      let response = await requestAPI({
          host: Utils.constants.HOST,
          method: 'POST',
          resource: 'users',
          endpoint: '/calzzamovil/cancel',
          data: {
            comments: this.state.comments,
            orderId: this.props.data.orderId,
            type: this.props.data.type,
            accepts: true,
            date: selectedDate
          }
      })

      if (response.data !== undefined){
        this.setState({
          openSnack: true,
          messageSnack: response.data.message
        }, () => {
          setTimeout(function() { 
            this.handleClose()
            this.props.loadData()
          }.bind(this), 1000)
        })
      }   
    }
  }

  render() {
    const { classes } = this.props

    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        //onRendered={this.handleRender}
        >
          {
            (this.props.data !== null && this.props.data !== undefined)?
              <div style={getModalStyle()} className={classes.container}>
                <Grid container direction="row">
                  <Title 
                    title={(this.props.data.type === 'PAUSED')? 'POSPONER COMPRA': 'CANCELAR COMPRA'}/>
                    {
                      (this.props.data.type === 'PAUSED')?
                        (this.props.data.reason !== undefined && this.props.data.reason !== null)?
                        <div style={{width: '100%'}}>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{marginTop: 8}}>
                            <Typography item className={classes.modalText} style={{width: '100%'}}><strong>Motivo:</strong></Typography>
                            <Typography item className={classes.modalText} style={{width: '100%'}}>{this.props.data.reason}</Typography>
                          </Grid>
                          <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{marginTop: 8}}>
                            <Typography item className={classes.modalText} style={{width: '100%'}}><strong>Comentarios del repartidor:</strong></Typography>
                            <Typography item className={classes.modalText} style={{width: '100%'}}>{this.props.data.comments}</Typography>
                          </Grid>
                        </div>
                        :
                        ''
                      :
                      ''
                    }
                    {
                      (this.props.data.type === 'PAUSED')?
                        <div style={{width: '100%'}}>
                          <Typography item className={classes.modalText} style={{width: '100%', marginTop: 8}}><strong>Reanudar entrega:</strong></Typography>
                          <DatePicker
                            selected={this.state.selectedDate}
                            onChange={(date) => { this.handleChangeDate(date)}}
                            showYearPicker={false}
                            showMonthYearPicker={false}
                            showFullMonthYearPicker={true} 
                            dateFormat="Pp"
                            showTimeSelect
                            timeIntervals={15}
                            locale="es"/>
                        </div>
                      :
                        ''
                    }
                  <Typography item className={classes.modalText} style={{width: '100%', marginTop: 16}}><strong>Comentarios:</strong></Typography>
                  <TextField
                    value={this.state.comments}
                    fullWidth={true}
                    multiline
                    rows={4}
                    variant="outlined"
                    onChange={(event) => {
                        this.setState({
                            comments: event.target.value
                        })
                    }}
                  />
                  <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} style={{marginTop: 32}} justify="flex-end">
                    <Grid item >
                      <Button 
                        style={{fontFamily: 16, fontWeight: 600, marginRight: 16}}
                        onClick={() => {
                          (this.props.data.type === "PAUSED")?
                            this.rejectedRequest()
                            :
                            this.handleClose()
                        }}>
                        Cancelar
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        style={{fontFamily: 16, fontWeight: 600}}
                        onClick={() => {
                            this.cancelOrder()
                        }}>
                        Aceptar
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Snackbar
                  autoHideDuration={5000}
                  anchorOrigin={{vertical: 'top', horizontal: 'center'}}
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
)(CalzzamovilPausedOrderModal)
