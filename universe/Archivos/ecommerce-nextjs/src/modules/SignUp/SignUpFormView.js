import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Components
import Title from '../../components/Title'
import SignUpForm from '../../components/SignUpForm'

// Actions
import Utils from '../../resources/Utils'
import { resetUserData } from '../../actions/actionConfigs'
import messages from '../../resources/Messages.json'

import Router from 'next/router'
const styles = theme => ({
  home: {
    margin: "0 auto",
    marginTop: 64,
    marginBottom: 88,
    textAlign: 'center',
    [theme.breakpoints.down('xl')]: {
      width: "35%"
    },
    [theme.breakpoints.down('lg')]: {
      width: "40%"
    },
    [theme.breakpoints.down('md')]: {
      marginTop: 56,
      width: "50%"
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 86,
      width: "65%"
    },
    [theme.breakpoints.down('xs')]: {
      width: "85%"
    }
  }
})

class SignUp extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      openSnack: false,
      messageSnack: ''
    }
    
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
    this.getWelcomeTitle = this.getWelcomeTitle.bind(this)
    this.getWelcomeDescription = this.getWelcomeDescription.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.init !== this.props.init) {
      if (this.props.init.reset) {
        this.setState({
          openSnack: true,
          messageSnack: messages.Profile.deleteUserAccountOk
        })
      }
    }
    //else if (prevProps.location.pathname !== this.props.location.pathname)
      //Utils.scrollTop()
  }

  componentWillMount() {
    if (this.props.login.token!=='') {
      Router.push("/")
    }
  }

  handleCloseSnackbar() {
    this.setState({
      openSnack: false,
      messageSnack: ''
    })
  }

  getWelcomeTitle() {
    if (Utils.checkLanguage() !== 'es') {
      return this.props.app.data.configs.welcomeTitleEN
    }
    return this.props.app.data.configs.welcomeTitle
  }

  getWelcomeDescription() {
    if (Utils.checkLanguage() !== 'es') {
      return this.props.app.data.configs.welcomeDescriptionEN
    }
    return this.props.app.data.configs.welcomeDescription
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        {
          (this.props.app.data.configs!==null) ?
            <Grid 
              container
              justify="flex-start"
              alignItems="flex-start"
              className={classes.home}
            >
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Title
                  title="Crear cuenta."
                  description="Crea una cuenta de manera fácil y rápida para acceder a todos los servicios digitales de Calzzapato ®"
                />
                {
                  <SignUpForm/>
                }
              </Grid>
            </Grid>
          :

          ''
        }

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
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(SignUp)
