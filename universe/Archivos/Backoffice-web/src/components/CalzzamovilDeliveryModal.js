import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Icon from '@material-ui/core/Icon';
import Avatar from '@material-ui/core/Avatar';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close'
import TextField from '@material-ui/core/TextField'

// Components
import Title from './Title'

//Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

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
    padding: '72px 48px 32px 48px',
    [theme.breakpoints.down('sm')]: {
      width: '80%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
      padding: '48px 16px 16px 16px'
    }
  },
  modalTitle: {
    width:'100%',
    marginTop: 16,
    fontSize: 28,
    fontWeight: 600,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: 22
    }
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: 16
    }
  },
  modalTextInline: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    fontSize: 18,
    [theme.breakpoints.down('sm')]: {
      fontSize: 16
    }
  },
  avatar: {
    width: 144,
    height: 144,
    fontSize: 76,
    color: 'white',
    [theme.breakpoints.down('xs')]: {
      width: 112,
      height: 112
    }
  },
  primaryButton: {
    fontWeight: 600,
    fontSize: 18,
    [theme.breakpoints.down('sm')]: {
      fontSize: 16
    }
  },
  inputContainer: {
    marginTop: 32,
    [theme.breakpoints.down('md')]: {
      marginTop: 0
    }
  },
  input: {
    width: '48%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
      marginTop: 32
    }
  }
})

class CalzzamovilOrderModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editInfo: false,
      name: '',
      firstLastName: '',
      secondLastName: '',
      cellphone: '',
      email: '',
      status: 1,
      openSnack: false,
      messageSnack: ''
    }

    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.handleChangeCellphone = this.handleChangeCellphone.bind(this)
    this.updateUser = this.updateUser.bind(this)
  }

  getStatus(){
    return [{
      status: 1,
      name: "Habilitar"
    },
    {
      status: 2,
      name: 'Deshabilitar'
    }]
  }

  handleClose() {
    this.setState({
      editInfo: false
    }, () => {
      this.props.handleClose()
    })
  }

  handleRender() {
    if (this.props.data !== null || this.props.data !== undefined) {
      this.props.history.push('/calzzamovil/repartidores/' + this.props.data.id)
      this.setState({
        name: this.props.data.name,
        firstLastName: this.props.data.firstLastName,
        secondLastName: this.props.data.secondLastName,
        email: this.props.data.email,
        cellphone: this.props.data.cellphone,
        status: this.props.data.status

      })
    } else {
      this.handleClose()
    }
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  async updateUser() {
    let name = this.state.name.trim()
    let firstLsatName = this.state.firstLastName.trim()
    let secondLastName = this.state.secondLastName.trim()
    let email = this.state.email.trim()
    let cellphone = this.state.cellphone.trim()
    let status = this.state.status


    let validate = true

    if (validate && Utils.isEmpty(name)){
      validate = false
      this.setState({
        openSnack: true,
        messageSnack: 'Es necesario ingresar los datos marcados con *'
      })
    }

    if (validate && Utils.isEmpty(firstLsatName)){
      validate = false
      this.setState({
        openSnack: true,
        messageSnack: 'Es necesario ingresar los datos marcados con *'
      })
    }

    if (validate && !Utils.validateEmail(email)){
      validate = false
      this.setState({
        openSnack: true,
        messageSnack: 'Es necesario ingresar los datos marcados con *'
      })
    }

    if (validate && cellphone.length < 10){
      validate = false
      this.setState({
        openSnack: true,
        messageSnack: 'Ingresa un número de celular válido'
      })
    }

    if (validate){
      let response = await requestAPI({
        host: Utils.constants.HOST,
        method: 'POST',
        resource: 'users',
        endpoint: '/calzzamovil/update/',
        data: {
          id: this.props.data.id,
          name: this.state.name,
          firstLastName: this.state.firstLastName,
          secondLastName: this.state.secondLastName,
          email: this.state.email,
          cellphone: this.state.cellphone,
          status: this.state.status
        }
      })

      if (response.data !== undefined){
        if (response.data.updated){
          this.props.loadData()
          this.handleClose()
        } else {
          this.setState({
            openSnack: true,
            messageSnack: 'No se ha podido actualizar la información del repartidor.'
          })
        }
      }
    }
  }

  handleChangeCellphone(event){
    if (event.target.value.length <= 10){
      this.setState({
        cellphone: event.target.value
      })
    }
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
            (this.props.data !== null && this.props.data !== undefined)?
              (!this.state.editInfo)?
                <div style={getModalStyle()} className={classes.container}>
                  <Grid container justify="center" direction="row">
                    {
                      (this.props.data.profilePhoto !== null && this.props.profilePhoto !== undefined)?
                      <Avatar item className={classes.avatar} src={this.props.data.profilePhoto}/>
                      : 
                      <Avatar item className={classes.avatar}>{this.props.data.name.substring(0, 1)}</Avatar>
                    }
                    <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Typography className={classes.modalTitle} variant="body1">{this.props.data.fullName}</Typography>
                      <Typography className={classes.modalText} variant="body1"><strong>Estatus</strong></Typography>
                      <Typography className={classes.modalText} variant="body1">{(this.props.data.status === 1)? 'Activo' : 'Inactivo'}</Typography>
                    </Grid>
                  </Grid>
                  <Grid container direction="row" style={{marginTop: 32}}>
                    <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12}>
                      <Icon item style={{marginRight: 8}}>email</Icon>
                      <Typography item className={classes.modalTextInline}>{this.props.data.email}</Typography>
                    </Grid>
                    <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12} style={{marginTop: 16}}>
                      <Icon item style={{marginRight: 8}}>phone</Icon>
                      <Typography item className={classes.modalTextInline}>{this.props.data.cellphone}</Typography>
                    </Grid>
                  </Grid>
                  <Grid container justify="flex-end" direction="row" style={{marginTop: 112}}>
                    <Button 
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        this.handleRender()
                        this.setState({
                          editInfo: true
                        })
                      }}>
                        Actualizar
                      </Button>
                      
                  </Grid>
                </div>
                :
                <div style={getModalStyle()} className={classes.container}>
                  <Grid container direction="row">
                    <Title
                      title="Actualizar información"/>
                    <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} justify="space-between" className={classes.inputContainer}>
                      <TextField 
                        className={classes.input}
                        value={this.state.name}
                        label='Nombre *'
                        variant='outlined'
                        onChange={(event) => this.setState({ name: event.target.value })}

                      />
                      <TextField 
                        className={classes.input}
                        select
                        value={this.state.status}
                        label='Estatus *'
                        variant='outlined'
                        onChange={(event) => this.setState({ status: event.target.value })}
                      >
                        {
                          (this.getStatus().map((item) => {
                            return(
                              <MenuItem key={item.status} value={item.status}>{item.name}</MenuItem>
                            )
                          }))
                        }
                      </TextField>
                    </Grid> 
                    <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} justify="space-between" className={classes.inputContainer}>
                      <TextField 
                        className={classes.input}
                        value={this.state.firstLastName}
                        label='Apellido paterno *'
                        variant='outlined'
                        onChange={(event) => this.setState({ firstLastName: event.target.value })}

                      />
                      <TextField 
                        className={classes.input}
                        value={this.state.secondLastName}
                        label='Apellido materno'
                        variant='outlined'
                        onChange={(event) => this.setState({ secondLastName: event.target.value })}
                      />
                    </Grid> 
                    <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} justify="space-between" className={classes.inputContainer}>
                      <TextField 
                        className={classes.input}
                        value={this.state.email}
                        label='Correo electrónico *'
                        variant='outlined'
                        type='email'
                        onChange={(event) => this.setState({ email: event.target.value })}

                      />
                      <TextField 
                        className={classes.input}
                        value={this.state.cellphone}
                        label='Celular *'
                        variant='outlined'
                        type='number'
                        onChange={(event) => this.handleChangeCellphone(event)}
                      />
                    </Grid> 
                  </Grid>
                  <Grid container justify="flex-end" direction="row" style={{marginTop: 112}}>
                    <Button 
                      style={{marginRight: 16}}
                      onClick={() => {
                        this.setState({
                          editInfo: false,
                          name: '',
                          firstLastName: '',
                          secondLastName: '',
                          cellphone: '',
                          email: ''
                        })
                      }}>
                        Cancelar
                    </Button>
                    <Button 
                      color="primary"
                      variant="contained"
                      onClick={() => {this.updateUser()}}>
                        Aceptar
                    </Button>
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
)(CalzzamovilOrderModal)
