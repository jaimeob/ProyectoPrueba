import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Button, Typography, Modal, Select, Snackbar, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

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

class CalzzamovilReubicar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedDate: '',
      comments: '',
      openSnack: false,
      messageSnack: '',
      store: null,
      stores: [],
      storeName: null,
      changeButton: true
    }
    this.handleClose = this.handleClose.bind(this)
    this.handleChangeDate = this.handleChangeDate.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getStores = this.getStores.bind(this)
    this.changeStore = this.changeStore.bind(this)
  }

  handleChange = name => event => {
    let store = this.props.data.stores.filter(store => store.branch === event.target.value)
    this.setState({ 
      [name]: event.target.value,
      storeName: store[0].name,
      changeButton: false
     }) 
  }

  async changeStore() {
    if (this.state.store === null || this.state.store === undefined) {
      this.setState({
        openSnack: true,
        messageSnack: 'Debes seleccionar una tienda'
      })
      return
    }
    
    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'PATCH',
      resource: 'orders',
      endpoint: '/calzzamovil/store',
      data:{
        data:{
          storeId: this.state.store,
          order: this.props.data.order
        }
      }
    })

    if ( response !== null && response !== undefined && response.status === 200 && response.data !== null && response.data !== undefined && response.data.updated ) {
      this.handleClose()
    } else {
      this.setState({
        openSnack: true,
        messageSnack: 'No se ha podido asignar la sucursal'
      })
    }
  }

  async getStores() {
    let response = await requestAPI({
      host: Utils.constants.HOST,
      method: 'GET',
      resource: 'orders',
      endpoint: '/stores/' + this.props.data.order
    })

    if (response.data !== undefined && response.data !== null && response.data.length) {
      this.setState({
        stores: response.data.stores
      })

      this.setState({
        openSnack: false,
        messageSnack: response.data.message,
        comments: ''

      }, () => {
        setTimeout(function () {
          this.handleClose()
          this.props.loadData()
        }.bind(this), 1000)
      })
    }
  }

  handleClose() {
    this.setState({
      store: null,
      changeButton: true,
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
              <Grid container direction="row">
                <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography style={{ textAlign: 'center' }} variant='h4'> Reubicar pedido</Typography>
                </Grid>

                <Grid container style={{ marginTop: '50px' }} >
                  <Grid item xs={5} style={{ display: 'flex', alignItems: 'center' }} >
                    <Typography style={{ textAlign: 'center' }} variant='body1'> Asignar recolección a sucursal: </Typography>
                  </Grid>
                  <Grid item xs={7} >
                    <Select
                      native
                      fullWidth
                      variant="standard"
                      value={this.state.store}
                      onChange={this.handleChange('store')}
                      inputProps={{
                        name: 'store',
                        id: 'age-native-simple',
                      }}
                    >
                      <option value="" />

                      {
                        (this.props !== null && this.props !== undefined && this.props.data !== null && this.props.data !== undefined && this.props.data.stores !== null && this.props.data.stores !== undefined && this.props.data.stores.length > 0) ?
                          this.props.data.stores.map((data, idx) => {
                            return (
                              <option value={data.branch}>  {'(' + data.branch + ')'} { data.name} { Number(data.stock)} {(Number(data.stock) > 1) ? 'piezas' : 'pieza'} </option>
                            )
                          })
                          :
                          ''
                      }
                    </Select>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={12}>
                    <Grid container>
                      <Grid style={{ display:'block', marginLeft:'auto' }} item xs={3}>
                        <Button onClick={this.handleClose} variant="contained"  style={{ background:'red', color: 'white', display: 'block', marginLeft: 'auto', marginTop: '50px' }} >Cancelar</Button>
                      </Grid>
                      <Grid item xs={3}>
                        <Button disabled={this.state.changeButton} onClick={this.changeStore} variant="contained" color="primary" style={{  color: 'white', display: 'block', marginLeft: 'auto', marginTop: '50px' }} >Cambiar</Button>
                      </Grid>
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
)(CalzzamovilReubicar)
