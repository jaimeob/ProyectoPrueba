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
import RecoveryPasswordForm from '../../components/RecoveryPasswordForm'

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

class RecoveryPassword extends Component {
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
    if (Utils.isUserLoggedIn()) {
      this.props.history.push("/inicio")
    }
    else {
      this.props.resetUserData()
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
    return this.props.app.configs.welcomeDescription
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
              <Grid item lg={12}>
                <Title
                  title="Recuperar contraseña."
                  description="Ingresa tu correo electrónico para iniciar el proceso de recuperación de contraseña. Gracias."
                />
                <br />
                {
                  <RecoveryPasswordForm/>
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

const mapDispatchToProps = dispatch => {
  return {
    resetUserData: () => {
      dispatch(resetUserData())
    }
  }
}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(RecoveryPassword)
