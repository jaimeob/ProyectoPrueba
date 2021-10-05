import React, { Component } from 'react'

//Material Ui
import { Button, DialogActions, DialogContent, DialogTitle, Typography, TextField, Snackbar, Checkbox, Grid } from '@material-ui/core'
import Close from '@material-ui/icons/Close'
import Modal from '@material-ui/core/Modal'

import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withTheme, withStyles } from '@material-ui/core/styles'

//Utils
import Utils from '../resources/Utils'
import { setGiftCard } from '../actions/actionGiftCard'
import { showMessengerFacebook } from '../actions/actionConfigs'

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
    overflowY: 'scroll',
    position: 'absolute',
    width: theme.spacing(60),
    maxHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('xs')]: {
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
    width: theme.spacing(100),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
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
  }
})

class GiftModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnackbar: false,
      messageSnackbar: '',
      from: '',
      message: '',
      optionsWithMessages: [
        {
          id: 1,
          for: 'Mamá',
          message: 'Te mando todo mi amor y agradecimiento en este par de zapatos.',
          img: 'https://imgur.com/GHUjwxL.jpeg',
          selected: true
        },
        {
          id: 2,
          for: 'Mamá',
          message: 'Gracias por ser el pilar de nuestra familia, deseo que pases un bonito día.',
          img: 'https://imgur.com/ddhSisE.jpeg',
          selected: false
        },
        {
          id: 3,
          for: 'Abuela',
          message: 'A pesar de que hoy no pueda estar cerca, deseo que tu día sea tan especial como tú.',
          img: 'https://imgur.com/C5yebmu.jpeg',
          selected: false
        },
        {
          id: 4,
          for: '',
          message: 'Hoy quiero recordarte lo mucho que te quiero y lo importante que eres para mí. ¡Feliz día!',
          img: 'https://imgur.com/NOXjmVJ.jpeg',
          selected: false
        }
      ],
      optionsWithoutMessages: [
        {
          id: 5,
          for: '',
          message: '',
          img: 'https://imgur.com/hvlboN0.jpeg',
          selected: true
        },
        {
          id: 6,
          for: '',
          message: '',
          img: 'https://imgur.com/ap8CB8r.jpeg',
          selected: false
        },
        {
          id: 7,
          for: '',
          message: '',
          img: 'https://imgur.com/UBY21Q9.jpeg',
          selected: false
        }
      ],
      checkboxs: [
        false,
        false
      ]
    }
    
    this.handleChangeMessageType = this.handleChangeMessageType.bind(this)
    this.handleCloseSnack = this.handleCloseSnack.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleChangeImage = this.handleChangeImage.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleFromChange = this.handleFromChange.bind(this)
    this.handleMessageChange = this.handleMessageChange.bind(this)
    this.handleRender = this.handleRender.bind(this)
  }
  
  handleRender() {
    this.props.showMessengerFacebook(false)
  }

  handleFromChange(event) {
    if (event.target.value.trim().length <= 120) {
      this.setState({
        from: event.target.value.trim()
      })
    }
  }

  handleMessageChange(event) {
    if (event.target.value.trim().length <= 120) {
      this.setState({
        message: event.target.value.trim()
      })
    }
  }

  handleConfirm(event) {
    if (this.state.checkboxs[0]) {
      let error = true
      let selectedOption = null
      
      let message = 'Selecciona una tarjeta con mensaje especial.'
      this.state.optionsWithMessages.forEach((option) => {
        if (option.selected) {
          selectedOption = option
          error = false
        }
      })

      if (Utils.isEmpty(this.state.from)) {
        error = true
        message = 'Captura el nombre de la persona que envía.'
      }
      
      if (!error) {
        message = '¡Listo! Se agregó correctamente tu tarjeta.'
        this.props.setGiftCard({
          option: selectedOption,
          from: this.state.from,
          message: this.state.message
        })
        this.handleClose()
      }
      else {
        this.setState({
          openSnackbar: true,
          messageSnackbar: message
        })
      }
    } else if (this.state.checkboxs[1]) {
      let error = true
      let selectedOption = null
      let message = 'Selecciona una fondo.'
      
      this.state.optionsWithoutMessages.forEach((option) => {
        if (option.selected) {
          error = false
          selectedOption = option
        }
      })

      if (Utils.isEmpty(this.state.message)) {
        error = true
        message = 'Captura tu mensaje personalizado.'
      }

      if (Utils.isEmpty(this.state.from)) {
        error = true
        message = 'Captura el nombre de la persona que envía.'
      }

      if (!error) {
        message = '¡Listo! Se agregó correctamente tu tarjeta.'
        this.props.setGiftCard({
          option: selectedOption,
          from: this.state.from,
          message: this.state.message
        })
       this.handleClose()
      } else {
        this.setState({
          openSnackbar: true,
          messageSnackbar: message
        })
      }
    } else {
      this.setState({
        openSnackbar: true,
        messageSnackbar: 'Selecciona una opción del paso 1'
      })
    }
  }

  handleChangeImage(type, idx = undefined) {
    if (type === 0) {
      let options = this.state.optionsWithMessages
      options.forEach((item) => {
        item.selected = false
      })
      if (idx !== undefined)
        options[idx].selected = true
      this.setState({
        optionsWithMessages: options
      })
    } else if (type === 1) {
      let options = this.state.optionsWithoutMessages
      options.forEach((item) => {
        item.selected = false
      })
      if (idx !== undefined)
        options[idx].selected = true
      this.setState({
        optionsWithoutMessages: options
      })
    }
  }

  handleChangeMessageType(option) {
    let checkboxs = this.state.checkboxs
    checkboxs[0] = false
    checkboxs[1] = false
    checkboxs[option] = true
    this.setState({
      checkboxs: checkboxs,
      from: '',
      message: ''
    }, () => {
      this.handleChangeImage(option)
    })
  }

  handleEmailChange(event) {
    this.setState({
      email: event.target.value
    })
  }

  handleClose = () => {
    this.setState({
      openSnackbar: false,
      messageSnackbar: '',
      from: '',
      message: '',
      optionsWithMessages: [
        {
          id: 1,
          for: 'Mamá',
          message: 'Te mando todo mi amor y agradecimiento en este par de zapatos.',
          img: 'https://imgur.com/GHUjwxL.jpeg',
          selected: true
        },
        {
          id: 2,
          for: 'Mamá',
          message: 'Gracias por ser el pilar de nuestra familia, deseo que pases un bonito día.',
          img: 'https://imgur.com/ddhSisE.jpeg',
          selected: false
        },
        {
          id: 3,
          for: 'Abuela',
          message: 'A pesar de que hoy no pueda estar cerca, deseo que tu día sea tan especial como tú.',
          img: 'https://imgur.com/C5yebmu.jpeg',
          selected: false
        },
        {
          id: 4,
          for: '',
          message: 'Hoy quiero recordarte lo mucho que te quiero y lo importante que eres para mí. ¡Feliz día!',
          img: 'https://imgur.com/NOXjmVJ.jpeg',
          selected: false
        }
      ],
      optionsWithoutMessages: [
        {
          id: 5,
          for: '',
          message: '',
          img: 'https://imgur.com/hvlboN0.jpeg',
          selected: true
        },
        {
          id: 6,
          for: '',
          message: '',
          img: 'https://imgur.com/ap8CB8r.jpeg',
          selected: false
        },
        {
          id: 7,
          for: '',
          message: '',
          img: 'https://imgur.com/UBY21Q9.jpeg',
          selected: false
        }
      ],
      checkboxs: [
        false,
        false
      ]
    })
    this.props.handleCloseGiftModal()
    this.props.showMessengerFacebook(true)
  }

  handleCloseSnack() {
    this.setState({
      openSnackbar: false
    })
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      this.sendingMail()
    }
  }

  render() {
    const self = this
    const { classes } = this.props
    return (
      <Modal
        open={this.props.openDialog}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
        style={{ margin: 0, padding: 0}}
      >
        <div style={getModalStyle()} className={classes.smallForm}>
          <div style={{ textAlign: 'left' }}>
            <strong style={{ fontSize: 36 }}>Regala a mamá.</strong>
            <Typography variant='body1'>¡Personaliza un mensaje especial en este día de las madres!</Typography>
          </div>
          <div className={classes.container}>
            <Snackbar
              style={{ zIndex: 99999}}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              autoHideDuration={5000}
              message={this.state.messageSnackbar}
              open={this.state.openSnackbar}
              onClose={this.handleCloseSnack}
              action={
                <Button onClick={this.handleCloseSnack} color='inherit' >
                  <Close />
                </Button>
              }
            />
            <Typography variant='body1'><strong>Paso 1</strong></Typography>
            <Typography variant='body2'>Selecciona una opción.</Typography>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, marginTop: 8 }}>
              <li style={{ mading: 0, padding: 0 }}><Checkbox style={{ mading: 0, padding: 0 }}
                color="primary" checked={this.state.checkboxs[0]} onChange={() => { this.handleChangeMessageType(0) }}
              /> Usar mensaje especial</li>
              <li style={{ margin: 0, padding: 0 }}><Checkbox style={{ mading: 0, padding: 0 }}style={{ mading: 0, padding: 0 }}
                color="primary" checked={this.state.checkboxs[1]} onChange={() => { this.handleChangeMessageType(1) }}
              /> Escribir mensaje personalizado</li>
            </ul>
            <br />
            {
              (this.state.checkboxs[0]) ?
              <div>
                <Typography variant='body1'><strong>Paso 2</strong></Typography>
                <Typography variant='body2'>Selecciona una tarjeta.</Typography>
                <TextField
                  autoFocus
                  variant="outlined"
                  label="De parte de"
                  placeholder="Nombre..."
                  style={{ marginTop: 12, width: '100%' }}
                  onChange={this.handleFromChange}
                />
                <Grid container style={{ margin: 0, padding: 0, marginLeft: -5 }} >
                  {
                    this.state.optionsWithMessages.map((option, idx) => {
                      return <Grid key={idx} item xl={6} lg={6} md={6} sm={12} xs={12} style={{ margin: 0, padding: 0 }} onClick={ () => { self.handleChangeImage(0, idx) }}>
                        <img style={ (option.selected) ? { border: '4px solid red', width: '95%', margin: '2.5%', cursor: 'pointer' } : { border: '4px solid rgba(0, 0, 0, 0.0)', width: '95%', margin: '2.5%', cursor: 'pointer' } } src={option.img} alt='' />
                      </Grid>
                    })
                  }
                </Grid>
              </div>
              :
              (this.state.checkboxs[1]) ?
                <div>
                  <Typography variant='body1'><strong>Paso 2</strong></Typography>
                  <Typography variant='body2'>Escribe tu mensaje y selecciona un fondo.</Typography>
                  <TextField
                    autoFocus
                    variant="outlined"
                    label="De parte de"
                    placeholder="Nombre..."
                    style={{ marginTop: 12, width: '100%' }}
                    onChange={this.handleFromChange}
                  />
                  <TextField
                    variant="outlined"
                    label="Tu mensaje"
                    placeholder="Escribe un mensaje con 120 caracteres..."
                    style={{ marginTop: 16, width: '100%' }}
                    onChange={this.handleMessageChange}
                  />
                  <br />
                  <br />
                  <Grid container style={{ margin: 0, padding: 0, marginLeft: -5 }} >
                  {
                    this.state.optionsWithoutMessages.map((option, idx) => {
                      return <Grid key={idx} item xl={4} lg={4} md={4} sm={4} xs={4} style={{ margin: 0, padding: 0 }} onClick={ () => { self.handleChangeImage(1, idx) }}>
                        <img style={ (option.selected) ? { border: '4px solid red', width: '95%', margin: '2.5%', cursor: 'pointer' } : { border: '4px solid rgba(0, 0, 0, 0.0)', width: '95%', margin: '2.5%', cursor: 'pointer' } } src={option.img} alt='' />
                      </Grid>
                    })
                  }
                </Grid>
              </div>
              :
              ''
          }
        </div>
        <div style={{ position: 'sticky', bottom: -42, background: 'white', margin: 0 }}>
          {
            (true) ?
            <Button variant="contained" color="primary" style={{ marginTop: 8, width: '100%' }} onClick={(event) => { this.handleConfirm(event) }}>
              CONFIRMAR MENSAJE
            </Button>
            :
            ''
          }
          <Button onClick={this.handleClose} color='primary' style={{ marginTop: 8, width: '100%' }} >
            <Close />
          </Button>
          <Typography variant="body1" style={{ textAlign: 'center', width: '100%', fontSize: 10, paddingBottom: 12 }}>Opción válida hasta agotar existencia y sujeta a cambios sin previo aviso.</Typography>
        </div>
        </div>
      </Modal>
    )
  }
}


const mapStateToProps = state => {
  return {
    status: state.status
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setGiftCard: (data) => {
      dispatch(setGiftCard(data))
    },
    showMessengerFacebook: (show) => {
      dispatch(showMessengerFacebook(show))
    }
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(GiftModal)

