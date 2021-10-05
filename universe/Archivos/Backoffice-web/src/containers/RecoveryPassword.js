import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

// Components
import WelcomeMessage from '../components/WelcomeMessage'
import RecoveryPasswordForm from '../components/RecoveryPasswordForm'

// Actions
import Utils from '../resources/Utils'
import { resetUserData } from '../actions/actionConfigs'

const styles = theme => ({
  home: {
    margin: "0 auto",
    marginTop: 104,
    [theme.breakpoints.down('lg')]: {
      width: "75%"
    },
    [theme.breakpoints.down('md')]: {
      width: "85%"
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 32,
      textAling: 'center'
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 24,
      width: '95%'
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
      <div>
        {
          (!Utils.isEmpty(this.props.app.configs)) ?
            <Grid 
              container
              className={classes.home}
            >
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
                <WelcomeMessage 
                  welcomeTitle={Utils.messages.RecoveryPasswordForm.title}
                  welcomeDescription={Utils.messages.RecoveryPasswordForm.description}
                  mainLogo={this.props.app.configs.mainLogo}
                />
              </Grid>
              <Grid item xl={6} lg={6} md={6} sm={12} xs={12}>
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
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(RecoveryPassword)
