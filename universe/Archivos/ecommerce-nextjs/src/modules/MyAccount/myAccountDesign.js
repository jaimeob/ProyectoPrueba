import React, { Component } from "react"
import { connect } from "react-redux"
import compose from "recompose/compose"
// Material UI
import { Typography, Grid, List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, Paper, Button } from "@material-ui/core"
import { withStyles } from "@material-ui/core/styles"
import Icon from "@material-ui/core/Icon"

import Link from "next/link"

import Router from "next/router"

// Actions
import Utils from "../../resources/Utils"
import { setNewCode } from "../../actions/actionBluePoints"
import { requestAPI } from "../../api/CRUD"
import Loading from "../../components/Loading"

const styles = (theme) => ({
  root: {
    width: '100%',
    padding: '20px 48px 96px 48px',
    minHeight: 500,
    backgroundColor: "#F4F4F4",
    [theme.breakpoints.down("sm")]: {
      padding: '20px 12px 48px 12px'
    }
  },
  cardBluePoints: {
    width: '100%',
    background: '#FFF',
    borderRadius: 10,
    margin: '0px 24px 0px 0px',
    padding: '20px 0px 20px 0px',
    boxShadow: '0 2px 2px 0.1px rgba(180, 180, 180, 0.5)',
    textAlign: 'center',
    [theme.breakpoints.down("sm")]:{
      width: 'auto',
      padding: '20px 40px 20px 40px'
    },
    [theme.breakpoints.down("xs")]:{
      width: 'auto',
      margin: '0px 0px 20px 0px',
      padding: '20px 48px 20px 48px'
    }
  },
  listContainer: {
    paddingRight: 24,
    [theme.breakpoints.down("sm")]:{
      paddingRight: 0
    }
  },
  listItem: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    color: "#000",
    cursor: 'pointer',
    //boxShadow: '0 2px 2px 0.1px rgba(180, 180, 180, 0.5)'
  },
  listText: {
    fontSize: 14,
    fontWeight: 'nornal',
    '&:hover': {
      fontWeight: 'bold',
      textDecoration: 'underline'
    }
  }
})

function AccountActions(props) {
  let link = ""
  if (props.onClick !== Utils.constants.paths.validateCrediVale) {
    link = `mi-cuenta/`
  }

  return (
    <ListItem className={props.classes.listItem} onClick={() => {window.location.href = props.onClick}}>
      <ListItemAvatar style={{ marginRight: 8 }}>
        <img height="40" width="40" src={props.icon} alt="" />
      </ListItemAvatar>
      <Typography variant="body1" className={props.classes.listText}>{props.action}</Typography>
      <ListItemSecondaryAction style={{cursor: 'pointer'}}>
        <Icon><img height="24" width="24" src="/icon-arrow.svg" alt="" /></Icon>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

class MyAccount extends Component {
  constructor(props) {
    super(props)

    this.state = {
      title: "Bienvenido",
      user: null,
      isLoadingCode: true,
    }
  }

  async componentWillMount(event) {
    let user = await Utils.getCurrentUser()

    if (user !== undefined && user !== null) {
      this.setState({
        title: "Bienvenido, " + (user.name + " " + user.firstLastName),
        user: user
      })

      if (user.calzzapatoUserId !== undefined && user.calzzapatoUserId !== null) {
        this.setState({ isLoadingCode: true })
        
        let bluePoints = await requestAPI({
          host: Utils.constants.CONFIG_ENV.HOST,
          method: "GET",
          resource: "users",
          endpoint: "/bluepoints",
        })

        if (bluePoints.status === Utils.constants.status.SUCCESS) {
          this.setState({ isLoadingCode: false })
          this.props.setNewCode(bluePoints.data)
        }
      }
    } else {
      Router.push(Utils.constants.paths.login)
    }
  }

  handleCloseSnack() {
    this.setState({
      openSnackbar: false,
    })
  }

  render() {
    const { classes } = this.props

    let bluePointsCondition =  (this.state.user !== undefined && this.state.user !== null && this.state.user.calzzapatoUserId !== undefined && this.state.user.calzzapatoUserId !== null &&
                                this.props.bluePoints !== undefined && this.props.bluePoints !== null && this.props.bluePoints.data != undefined && this.props.bluePoints.data !== null)
    return (
      <div className={classes.root}>
        <Typography variant="body1" style={{width: '100%', fontSize: 16, fontWeight: 600}}>{this.state.title}</Typography>
        <Grid container>
          <Grid container item xs={12} style={{marginTop: 20}}>
            {
              (bluePointsCondition)?
                <Grid container item xs={12} sm={6} md={4} lg={3} justify="center">                 
                   <div className={classes.cardBluePoints}>
                    <img style={{ width: 112 }} src="/monederoazul.svg" />
                      {
                      (this.state.isLoadingCode)?
                        <div style={{ marginTop: 48 }}>
                          <Loading />
                        </div>
                      :
                        <div style={{marginTop: 12, textAlign: 'center'}}>
                          <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500, color: '#288fe8'}}>Tienes {Utils.numberWithCommas(this.props.bluePoints.data.balance)} Puntos.</Typography>
                          <div style={{width: '100%'}}>
                            <img style={{ width: 192 }} src={Utils.constants.CONFIG_ENV.HOST + this.props.bluePoints.data.qrImage}/>
                          </div>
                          <img style={{width: 176}} src={Utils.constants.CONFIG_ENV.HOST + this.props.bluePoints.data.barcodeImage}/>
                          <Typography variant="body1" style={{width: '100%', marginTop: 24, fontSize: 12}}>Muestra el código en caja</Typography>
                        </div>
                      }     
                    </div>
                  </Grid>
                :
                  ''
            }
            <Grid container item xs={12} sm={(bluePointsCondition)? 6: 12} md={(bluePointsCondition)? 8: 12} lg={(bluePointsCondition)? 9: 12}>
              <Grid item xs={12} md={6} className={classes.listContainer} alignContent="flex-start"> {/* Primera lista */}
                <Typography variant="body1" style={{width: '100%', fontSize: 16}}>Mis listas</Typography>
                <List style={{width: '100%'}}>
                  <AccountActions
                    classes={classes}
                    action="Mis catálogos"
                    icon="icon-miscatalogos.svg"
                    onClick={Utils.constants.paths.myCatalogs}/>
                </List>
                <Typography variant="body1" style={{width: '100%', fontSize: 16}}>Información personal</Typography>
                <List style={{width: '100%'}}>
                  <AccountActions
                    classes={classes}
                    action="Actualizar información"
                    icon={"icon-personal-info.svg"}
                    onClick={Utils.constants.paths.personalInfo}/>
                  <AccountActions
                    classes={classes}
                    action="Editar direcciones"
                    icon={"icon-edita-direciones.svg"}
                    onClick={Utils.constants.paths.addresses}/>
                </List>
              </Grid>
              <Grid container item xs={12} md={6} alignContent="flex-start"> {/* Segunda lista */}
                <Typography variant="body1" style={{width: '100%', fontSize: 16}}>Pedidos recientes</Typography>
                <List style={{width: '100%'}}>
                  <AccountActions
                    classes={classes}
                    action="Ver todos mis pedidos"
                    icon={"icon-mispedidos.svg"}
                    onClick={Utils.constants.paths.myOrders}/>
                </List>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({ ...state })

const mapDispatchToProps = {
  setNewCode,
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(MyAccount)
