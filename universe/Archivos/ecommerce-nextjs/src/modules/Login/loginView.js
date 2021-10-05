import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Router from 'next/router'
// Components
import Title from '../../components/Title'
import LoginForm from '../../components/LoginForm'

// Actions
import Utils from '../../resources/Utils'
import { resetUserData } from '../../actions/actionConfigs'
import messages from '../../resources/Messages.json'

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

class Login extends Component {
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
    Utils.scrollTop()
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
    if (this.props.login.token!=='') {
      Router.push("/")
    }
    return (
      <div>
            <Grid 
              container
              justify="center"
              alignItems="center"
              className={classes.home}
            >
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                <Title
                  title="Ingresar."
                  description="Inicia sesión con tu usuario Calzzapato ®"
                />
                <br />
                {
                  <LoginForm patchEmail={this.props.patchEmail}/>
                }
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
    )
  }
}

const mapStateToProps = ({login}) => ({login})

const mapDispatchToProps = {
  
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(Login)
