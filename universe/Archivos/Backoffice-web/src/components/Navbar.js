import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import LoadingBar from 'react-redux-loading-bar'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, AppBar, Toolbar, Typography, Hidden, FormControl, Select, Modal } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import AccountCircle from '@material-ui/icons/AccountCircle'
import BusinessIcon from '@material-ui/icons/Business'

// Utils
import Utils from '../resources/Utils'
import { setBusinessUnit } from '../actions/actionConfigs'

const styles = theme => ({
  appBar: {
    backgroundColor: theme.palette.background.main,
    zIndex: theme.zIndex.drawer + 1,
  },
  logo: {
    float: 'left',
    marginRight: '2%',
    height: 'auto',
    width: theme.sizes.sizeNavbarLogo
  },
  navbarTextItem: {
    padding: 0,
    margin: 0,
  },
  mainTitle: {
    float: 'left',
    margin: 0,
    padding: 0,
    fontWeight: 600,
    marginTop: 3,
    [theme.breakpoints.down('sm')]: {
      marginTop: 6,
      fontSize: 16
    }
  },
  branchContainer: {
    textAlign: 'left',
    margin: 0,
    padding: 0
  },
  branchIcon: {
    float: 'left'
  },
  branchTitle: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: 400
  },
  branchSubtitle: {
    fontSize: 11,
    fontWeight: 800,
    color: '#AAB1B7'
  },
  userContainer: {
    textAlign: 'right',
    margin: 0,
    padding: 0
  },
  userIcon: {
    float: 'right',
    padding: 0,
    margin: 0,
    marginTop: 4,
    marginLeft: 12,
    [theme.breakpoints.down('xs')]: {
      opacity: 0,
      heigth: 0,
    }
  },
  userData: {
    margin: 0,
    padding: 0,
    fontSize: 12,
    [theme.breakpoints.down('xs')]: {
      fontSize: 10,
    }
  },
  version: {
    margin: 0,
    padding: 0,
    fontSize: 10
  },
  versionNotSession: {
    fontWeight: 600,
    fontSize: 12
  },
  menuButton: {
    margin: 0,
    marginRight: 12
  },
  loading: {
    position: 'absolute',
    backgroundColor: theme.palette.primary.main,
    height: 10
  }
})

class Navbar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      user: null,
      open: false
    }

    this.getUser = this.getUser.bind(this)
    this.changeBusinessUnit = this.changeBusinessUnit.bind(this)
    this.getBusinessUnit = this.getBusinessUnit.bind(this)
  }

  async changeBusinessUnit(event) {
    let business = event.target.value
    this.props.setBusinessUnit(business)
    window.location.reload()
  }

  componentWillMount() {
    if (Utils.isUserLoggedIn()) {
      this.getUser()
    }
  }

  async getUser() {
    let user = await Utils.getCurrentUser()
    this.setState({
      user: user
    })
  }

  getBusinessUnit() {
    if (Utils.isUserLoggedIn()) {
      return localStorage.getItem(Utils.constants.localStorage.BUSINESS_UNIT)
    }
    return ''
  }

  getUserEmail() {
    if (Utils.isUserLoggedIn()) {
      let data = JSON.parse(localStorage.getItem(Utils.constants.localStorage.USER))
      return data.email
    }
    return ''
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.app !== prevProps.app) {
        if (this.props.app !== undefined && !Utils.isEmpty(this.props.app.businessUnit)) {
          this.getUser()
        }
      }
    }
  }

  render() {
    const { classes } = this.props
    const self = this

    return (
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          {
            (false) ?

              <IconButton className={classes.menuButton} color="primary">
                <MenuIcon />
              </IconButton>

              :

              ''

          }
          <Grid container justify="flex-start" alignItems="center">
            <Grid item lg={(Utils.isUserLoggedIn()) ? 6 : 8} md={6} sm={6} xs={6} className={classes.navbarTextItem}>
              <img className={classes.logo} alt="" src={this.props.navbarLogo} />
              <Typography className={classes.mainTitle} variant="h6" color="primary">
                {this.props.mainTitle}
              </Typography>
            </Grid>
            {
              (Utils.isUserLoggedIn()) ?
                <Grid item lg={3} md={3} sm={3} xs={3} className={classes.branchContainer}>
                  <IconButton onClick={() => { this.setState({ open: !this.state.open }) }} className={classes.branchIcon} color="primary">
                    <BusinessIcon />
                  </IconButton>
                  {
                    (this.state.user !== null) ?
                      <Hidden smDown>
                        <FormControl variant="outlined" style={{ width: '80%' }}>
                          <Select
                            native
                            onChange={(event) => { this.changeBusinessUnit(event) }}
                            inputProps={{
                              name: 'age',
                              id: 'outlined-age-native-simple',
                            }}
                          >
                            {
                              (this.state.user.accesses.length > 0) ?
                                this.state.user.accesses.map(function (item, idx) {
                                  if (item.name === self.getBusinessUnit()) {
                                    return (
                                      <option selected value={item.name}>{item.description}</option>
                                    )
                                  } else {
                                    return (
                                      <option value={item.name}>{item.description}</option>
                                    )
                                  }
                                })
                                :
                                ''
                            }
                          </Select>
                        </FormControl>
                      </Hidden>
                      :
                      ''
                  }
                  <Hidden smDown>
                    <Typography className={classes.branchSubtitle} variant="body1" color="primary">
                      <strong>UNIDAD DE NEGOCIO SELECCIONADA</strong>
                    </Typography>
                  </Hidden>

                </Grid>
                :
                ''
            }
            <Grid item lg={3} md={3} sm={3} xs={3}>
              {
                (Utils.isUserLoggedIn()) ?
                  <div className={classes.userContainer}>
                    <Hidden smDown>
                      <IconButton className={classes.userIcon} color="primary">
                        <AccountCircle />
                      </IconButton>
                    </Hidden>
                    <Typography className={classes.userData} variant="body1" color="primary">
                      <strong>{this.getUserEmail()}</strong>
                    </Typography>
                    <Typography className={classes.version} variant="body1" color="primary">
                      v{Utils.constants.version}
                    </Typography>
                  </div>
                  :
                  <div className={classes.userContainer}>
                    <Typography className={classes.versionNotSession} variant="body1" color="primary">
                      v{Utils.constants.version}
                    </Typography>
                  </div>
              }
            </Grid>
          </Grid>
        </Toolbar>
        <LoadingBar className={classes.loading} />
      </AppBar>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    setBusinessUnit: (business) => {
      dispatch(setBusinessUnit(business))
    }
  }
}

export default compose(
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(Navbar)
