import React, { Component } from "react"
import compose from "recompose/compose"
import { withRouter } from "react-router-dom"

import { withStyles, withTheme } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import TextField from '@material-ui/core/TextField'
import Button from "@material-ui/core/Button"
import DoneIcon from "@material-ui/icons/DoneRounded"
import CloseIcon from "@material-ui/icons/CloseRounded"
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FacebookIcon from "../resources/images/icn-facebook.svg"

import { getDataAPI } from "../api/CRUD"
import Utils from "../resources/Utils"

const styles = theme => ({
  root: {
    margin: "1em"
  },
  block: {
    padding: "32px 24px 24px 24px",
    marginBottom: "1em",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    background: "#FFF",
    border: "1px solid #000",
    borderRadius: "10px",
    "& > *": {
      marginBottom: "32px"
    },
    [theme.breakpoints.down("xs")]: {
      padding: "1.2em 0.8em",

    }
  },
  blockTitle: {
    fontSize: "32px",
    fontWeight: 500,
    color: "#000"
  },
  blockSubtitle: {
    fontSize: "16px",
    color: "#000"
  },
  blockSubtitleInfo: {
    display: "none",
    [theme.breakpoints.down("xs")]: {
      display: "inline-block",
      color: "rgba(0,0,0,0.54) !important",
      marginBottom: "16px",
    },
  },
  title: {
    marginBottom: "1em",
    fontSize: "36px",
    fontWeight: 500,
    color: "#000"
  },
  input: {
    width: "60%",
    [theme.breakpoints.down("xs")]: {
      width: "100%"
    },
    [`& fieldset`]: {
      borderRadius: "10px",
    },
  },
  linkedAccount: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  platformIcon: {
    width: "50px",
    height: "50px",
    margin: "1em",
    [theme.breakpoints.down("xs")]: {
      width: "36px",
      height: "36px",
      margin: "0.5em",
    }
  },
  platformName: {
    fontSize: "24px",
    fontWeight: 500,
    color: "#1778f2 !important",
    [theme.breakpoints.down("xs")]: {
      fontSize: "18px"
    }
  },
  accountName: {
    fontSize: "18px",
    color: "#1778f2 !important",
    [theme.breakpoints.down("xs")]: {
      fontSize: "16px"
    }
  },
  linkedIcon: {
    fontSize: 30,
    margin: "16px",
    color: "#1778f2 !important",
    [theme.breakpoints.down("xs")]: {
      fontSize: 24,
      margin: "8px"
    }
  },
  flexRow: {
    display: "flex",
    flexDirection: "row"
  }
})

class AccountSettings extends Component {

    constructor(props){
        super(props)
        this.state = {
            form:{
                newEmail:{
                    value:null,
                    error:false,
                    helperText:""
                },
                confirmNewEmail:{
                    value:null,
                    error:false,
                    helperText:""
                },
                currentPassword:{
                    value:null,
                    error:false,
                    helperText:""
                },
                newPassword:{
                    value:null,
                    error:false,
                    helperText:""
                },
                confirmNewPassword:{
                    value:null,
                    error:false,
                    helperText:""
                },
                newsLetterActive:{
                    value:true,
                    error:false,
                    helperText:""
                },
            },
            linkedAccounts:[
                {
                    platform:"Facebook",
                    icon: FacebookIcon,
                    accountName:"Oscar Verdugo",
                    linked:true
                },
                {
                    platform:"Facebook",
                    icon: FacebookIcon,
                    accountName:"Oscar Verdugo",
                    linked:true
                },
            ],
        }
        this.handleInputChange = this.handleInputChange.bind(this)
        this.validateForm = this.validateForm.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleUnlinkAccount = this.handleUnlinkAccount.bind(this)
        this.handleBack = this.handleBack.bind(this)

        this.changeEmailRef = React.createRef()  
        this.changePasswordRef = React.createRef()  
        this.updatedEmail = false
        this.updatedPassword = true
    }

  handleInputChange(e) {
    const name = e.target.name
    const value = e.target.value
    this.setState(prev => {
      return ({ form: { ...prev.form, [name]: { value, error: false, helperText: "" } } })
    })
  }

  async validateForm() {
    let form = this.state.form
    if (form.newEmail.value || form.confirmNewEmail.value) {
      if (Utils.validateEmail(form.newEmail.value)) {
        if (form.newEmail.value === form.confirmNewEmail.value) {
          this.setState(prev => {
            return ({ form: { ...prev.form, confirmNewEmail: { value: form.confirmNewEmail.value, error: false, helperText: "" }, newEmail: { value: form.newEmail.value, error: false, helperText: "" } } })
          })
          this.updatedEmail = true
        } else {
          this.setState(prev => {
            return ({ form: { ...prev.form, confirmNewEmail: { value: form.confirmNewEmail.value, error: true, helperText: "Emails no coinciden" } } })
          })
          this.updatedEmail = false
          this.focusOn(this.changeEmailRef);
          return
        }
      } else {
        this.setState(prev => {
          return ({ form: { ...prev.form, newEmail: { value: form.newEmail.value, error: true, helperText: "Email inválido" } } })
        })
        this.updatedEmail = false
        this.focusOn(this.changeEmailRef)
        return
      }
    } else {
      this.updatedEmail = false
      this.setState(prev => {
        return ({ form: { ...prev.form, confirmNewEmail: { value: form.confirmNewEmail.value, error: false, helperText: "" }, newEmail: { value: form.newEmail.value, error: false, helperText: "" } } })
      })
    }

    if (form.currentPassword.value || form.newPassword.value || form.confirmNewPassword.value) {
      if (true) { //validate currentPasword on api
        if (Utils.validatePassword(form.newPassword.value)) {
          if (form.newPassword.value === form.confirmNewPassword.value) {
            this.updatedPassword = true
            this.setState(prev => {
              return ({ orm: { ...prev.form, currentPassword: { value: form.currentPassword.value, error: false, helperText: "" }, newPassword: { value: form.newPassword.value, error: false, helperText: "" }, confirmNewPassword: { value: form.confirmNewPassword.value, error: false, helperText: "" } } })
            })
          } else {
            this.setState(prev => {
              this.updatedPassword = false
              return ({ form: { ...prev.form, confirmNewPassword: { value: form.confirmNewPassword.value, error: true, helperText: "Contraseñas no coinciden" } } })
            })
            this.focusOn(this.changePasswordRef)
            return
          }
        } else {
          this.updatedPassword = false
          this.setState(prev => {
            return ({ form: { ...prev.form, newPassword: { value: form.newPassword.value, error: true, helperText: "Contraseña inválida (al menos una letra mayúscula, una minúscula y al menos 8 caracteres números o letras)" } } })
          })
          this.focusOn(this.changePasswordRef)
          return
        }

      } else {
        this.updatedPassword = false
        this.setState(prev => {
          return ({ form: { ...prev.form, currentPassword: { value: form.currentPassword.value, error: true, helperText: "Contraseña incorrecta" } } })
        })
        this.focusOn(this.changePasswordRef)
        return
      }
    } else {
      this.updatedPassword = false
      this.setState(prev => {
        return ({ form: { ...prev.form, currentPassword: { value: form.currentPassword.value, error: false, helperText: "" }, newPassword: { value: form.newPassword.value, error: false, helperText: "" }, confirmNewPassword: { value: form.confirmNewPassword.value, error: false, helperText: "" } } })
      })
    }
  }

    handleUnlinkAccount(account){

    }

    handleBack(){

    }

    async handleSubmit() {
        this.validateForm().then(()=>{

        })
    }

  async saveChanges() {
    await this.validateForm()
  }

  focusOn(ref) {
    window.scrollTo(0, ref.current.offsetTop);
  }


  render() {
    const { classes } = this.props
    return (
      <form autoComplete="no">
        <div className={classes.root}>
          <Typography variant="h2" className={classes.title}>Configuración de cuenta</Typography>
          <Typography variant="body2" className={classes.blockSubtitleInfo}>
            Para hacer actualización, escribre tu información en los campos que quieras hacer cambios y haz click en el boton de GUARDAR.
                    </Typography>
                    <div className={classes.block} ref={this.changeEmailRef}>
                        <Typography variant="h3" className={classes.blockTitle}>Email</Typography>
                        <Typography variant="body1" className={classes.blockSubtitle}>Email actual: example@gmail.com</Typography>
                        <TextField 
                            error={this.state.form.newEmail.error}
                            helperText={this.state.form.newEmail.helperText}
                            type="email"
                            name="newEmail"
                            label="Nuevo email" 
                            variant="outlined" 
                            onChange={this.handleInputChange}
                            value={this.state.form.newEmail.value}
                            className={classes.input}/>
                        <TextField 
                            error={this.state.form.confirmNewEmail.error}
                            helperText={this.state.form.confirmNewEmail.helperText}
                            type="email"
                            name="confirmNewEmail" 
                            label="Verifica nuevo email" 
                            variant="outlined" 
                            onChange={this.handleInputChange}
                            value={this.state.form.confirmNewEmail.value}
                            className={classes.input}/>
                    </div>
                    <div className={classes.block}>
                        <Typography variant="h3" className={classes.blockTitle}>Cuentas vinculadas</Typography>
                        <Typography variant="body1" className={classes.blockSubtitle}>Estas son las cuentas que están vinculadas a tu cuenta</Typography>
                        {this.state.linkedAccounts.map(account =>{
                            return (
                                <div className={classes.linkedAccount}>
                                    <span className={classes.linkedAccount} style={{justifyContent:"flex-start",width:"auto"}}>
                                        <img alt="Icono" src={account.icon} className={classes.platformIcon}></img>
                                        <Typography className={classes.platformName}>{account.platform}</Typography>
                                    </span>
                                    <span className={classes.linkedAccount} style={{justifyContent:"flex-start",width:"auto"}}>
                                        <Typography className={classes.accountName}>{account.accountName}</Typography>
                                        {account.linked ? <DoneIcon className={classes.linkedIcon}/> : <CloseIcon className={classes.linkedIcon} style={{color:"#EA2027"}}/>}
                                    </span>
                                    <Button 
                                        variant="outlined" 
                                        color="primary" 
                                        onClick={()=>{this.handleUnlinkAccount(account)}}
                                        style={{justifySelf:"flex-end",minWidth:"120px"}}>
                                        {account.linked ? "Desvincular":"Vincular"}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                    <div className={classes.block} ref={this.changePasswordRef}>
                            <Typography variant="h3" className={classes.blockTitle}>Cambiar contraseña</Typography>
                            <TextField name="currentPassword" 
                                error={this.state.form.currentPassword.error}
                                helperText={this.state.form.currentPassword.helperText}
                                label="Contraseña actual" 
                                variant="outlined" 
                                autoComplete="off"
                                value={this.state.form.currentPassword.value}
                                onChange={this.handleInputChange}
                                className={classes.input} 
                                type="password"/>
                            <TextField name="newPassword" 
                                error={this.state.form.newPassword.error}
                                helperText={this.state.form.newPassword.helperText}
                                label="Nueva contraseña" 
                                variant="outlined" 
                                value={this.state.form.newPassword.value}
                                onChange={this.handleInputChange}
                                className={classes.input} 
                                type="password"/>
                            <TextField name="confirmNewPassword" 
                                error={this.state.form.confirmNewPassword.error}
                                helperText={this.state.form.confirmNewPassword.helperText}
                                label="Verificar nueva contraseña" 
                                value={this.state.form.confirmNewPassword.value}
                                onChange={this.handleInputChange}
                                variant="outlined" 
                                className={classes.input} 
                                type="password"/>
                    </div>
                    <div className={classes.block}>
                            <Typography variant="h3" className={classes.blockTitle}>Newsletter</Typography>
                            <Typography variant="body1" style={{color:"rgba(0,0,0,0.54)"}}>Registrate en el Newletter y recibirás las últimas noticias, información sobre promociones y descuentos en Calzzapato.com</Typography>
                            <span className={classes.flexRow}>
                                <FormControlLabel 
                                    control={<Checkbox 
                                        name="newsLetterActive" 
                                        onChange={this.handleInputChange}
                                        value={this.state.form.newsLetterActive.value}/>} label="Activa" style={{marginRight:"16px"}} />
                                {/* <FormControlLabel control={<Checkbox name="newsLetterInactive" value={!this.state.form.newsLetterActive}/>} label="Inactiva" /> */}
                            </span>
                    </div>
                    <span>
                        <Button variant="outlined" color="primary" style={{minWidth:"120px",marginRight:"16px"}} onClick={this.handleBack}>
                            REGRESAR A MI CUENTA
                        </Button>
                        <Button variant="contained" color="primary" style={{minWidth:"120px"}} onClick={()=>{this.handleSubmit()}}>
                            GUARDAR CAMBIOS
                        </Button>
          </span>
        </div>
      </form>
    )
  }
}


export default compose(
  withRouter,
  
  withStyles(styles)
)(AccountSettings)