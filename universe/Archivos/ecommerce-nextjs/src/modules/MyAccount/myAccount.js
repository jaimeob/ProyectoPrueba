import React, { Component } from "react"
import { connect } from "react-redux"
import compose from "recompose/compose"
// Material UI
import { Typography, Grid, List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, Paper } from "@material-ui/core"
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
  page: {
    width: "100%",
    height: "100%",
  },
  container: {
    width: "90%",
    margin: "0 auto",
    paddingTop: 36,
    [theme.breakpoints.down("xs")]: {
      paddingTop: 36,
    },
    paddingBottom: 64,
  },
  firstList: {
    width: "100%",
    marginRight: 48,
    [theme.breakpoints.down("md")]: {
      marginRight: 24,
    },
    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
    },
  },
  secondList: {
    paddingRight: 12,
    [theme.breakpoints.down("md")]: {
      paddingRight: 0,
    },
  },
  thirdList: {
    paddingLeft: 12,
    [theme.breakpoints.down("md")]: {
      paddingLeft: 0,
    },
  },
  fourdList: {
    width: "100%",
    marginBottom: 24,
    [theme.breakpoints.down("sm")]: {
      marginTop: 16,
    },
  },
  listItem: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    color: "#000",
    "&:hover": {
      color: "#233B7A",
      textDecoration: "underline",
    },
  },
})

function AccountActions(props) {
  let link = ""
  if (props.onClick !== Utils.constants.paths.validateCrediVale) {
    link = `mi-cuenta/`
  }

  return (
    // <Link href={`/${link}[pid]`} as={`/${link}${props.onClick}`}>
    <Link href={props.onClick}>
      <ListItem
        style={{ cursor: "pointer " }}
        className={props.classes.listItem}
      >
        <ListItemAvatar style={{ marginRight: 8 }}>
          <img height="40" width="40" src={props.icon} alt="" />
        </ListItemAvatar>
        <Typography variant="body1" color="inherit">
          {props.action}
        </Typography>
        <ListItemSecondaryAction>
          <Icon style={{ cursor: "pointer" }}>
            <img height="24" width="24" src="/icon-arrow.svg" alt="" />
          </Icon>
        </ListItemSecondaryAction>
      </ListItem>
    </Link>
  )
}

function AccountReview(props) {
  return (
    <ListItem
      style={{ marginTop: 8, borderRadius: 10, backgroundColor: "#FFFFFF" }}
    >
      <ListItemAvatar variant="square" style={{ width: 80, height: 80 }}>
        <Avatar variant="square" src={props.image}></Avatar>
      </ListItemAvatar>
      <ListItemText primary={props.description} secondary={props.size} />
      <ListItemSecondaryAction>
        <Icon>arrow_forward</Icon>
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
    if (user !== null) {
      this.setState({
        title: "Bienvenido, " + (user.name + " " + user.firstLastName),
        user: user,
      })

      if (user.calzzapatoUserId !== null) {
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
    return (
      <div className={classes.page}>
        <div className={classes.container}>
          <Grid container xl={12} lg={12} md={12} sm={12} xs={12}>
            <header>
              <Typography
                variant="h2"
                style={{ fontSize: 24, fontWeight: 400 }}
              >
                {this.state.title}
              </Typography>
            </header>
          </Grid>
          <Grid
            container
            xl={12}
            lg={12}
            md={12}
            sm={12}
            xs={12}
            style={{ marginTop: 32 }}
          >
            {this.state.user !== null &&
            this.state.user.calzzapatoUserId !== null &&
            this.props.bluePoints !== undefined &&
            this.props.bluePoints.data !== undefined &&
            this.props.bluePoints.data !== null ? (
              <Grid container item xl={4} lg={4} md={4} sm={12} xs={12}>
                <Paper
                  className={classes.firstList}
                  style={{ textAlign: "center", padding: 16, marginBottom: 32 }}
                >
                  <Typography
                    variant="body1"
                    style={{ width: "100%", fontSize: 20, fontWeight: 500 }}
                  >
                    <img style={{ width: 188 }} src="/monederoazul.svg" />
                  </Typography>
                  {!this.state.isLoadingCode ? (
                    <>
                      <div style={{ margin: 0, padding: 0, marginTop: 16 }}>
                        <Typography
                          variant="body1"
                          style={{
                            color: "blue",
                            width: "100%",
                            fontSize: 20,
                            fontWeight: 500,
                          }}
                        >
                          Tienes{" "}
                          {Utils.numberWithCommas(
                            this.props.bluePoints.data.balance
                          )}{" "}
                          puntos.
                        </Typography>
                      </div>
                      <div style={{ margin: 0, padding: 0 }}>
                        <img style={{ width: "70%" }} src={Utils.constants.CONFIG_ENV.HOST + this.props.bluePoints.data.qrImage}/>
                        <img src={Utils.constants.CONFIG_ENV.HOST + this.props.bluePoints.data.barcodeImage}/>
                      </div>
                      <Typography
                        variant="body1"
                        style={{
                          width: "100%",
                          fontSize: 13,
                          fontWeight: 200,
                          marginTop: 16,
                          padding: 16,
                          border: "1px solid gray",
                        }}
                      >
                        Muestra el código en caja
                      </Typography>
                    </>
                  ) : (
                    <div style={{ marginTop: 48 }}>
                      <Loading />
                    </div>
                  )}
                </Paper>
              </Grid>
            ) : (
              ""
            )}
            <Grid container item xl={3} lg={3} md={4} sm={12} xs={12}>
              <Grid item className={classes.firstList}>
                <Typography
                  variant="body1"
                  style={{ width: "100%", fontSize: 20, fontWeight: 500 }}
                >
                  Mis listas
                </Typography>
                <List style={{ width: "100%", marginBottom: 24 }}>
                  <AccountActions
                    classes={classes}
                    action="Mis catálogos"
                    icon="icon-miscatalogos.svg"
                    onClick={Utils.constants.paths.myCatalogs}
                  />
                  {/* <AccountActions action="Mis deseos"/>
                              <AccountActions action="Vistos recientemente"/>
                              <AccountActions action="Mis cupones"/> */}
                </List>
                <Typography
                  variant="body1"
                  style={{ width: "100%", fontSize: 20, fontWeight: 500 }}
                >
                  Información personal
                </Typography>
                <List style={{ width: "100%", marginBottom: 24 }}>
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

                  {/* <AccountActions action="Configuración de cuenta" icon={iconAccountConfig} /> */}
                  {/* <AccountActions action="Preferencias"/> */}
                </List>
              </Grid>
            </Grid>
            <Grid container item xl={5} lg={5} md={4} sm={12} xs={12}>
              <Grid item style={{ width: "100%" }}>
                <Typography
                  variant="body1"
                  style={{ width: "100%", fontSize: 20, fontWeight: 500 }}
                >
                  Pedidos recientes
                </Typography>
                <List className={classes.fourdList}>
                  <AccountActions
                    classes={classes}
                    action="Ver todos mis pedidos"
                    icon={"icon-mispedidos.svg"}
                    onClick={Utils.constants.paths.myOrders}/>
                  {/* <AccountActions action="Ver mis apartados" onClick={Utils.constants.paths.mySections} icon={iconApartados} /> */}
                </List>
              </Grid>
            </Grid>
          </Grid>
        </div>
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
