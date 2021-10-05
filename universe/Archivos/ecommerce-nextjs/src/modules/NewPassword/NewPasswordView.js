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
import NewPasswordForm from '../../components/NewPasswordForm'

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

class NewPassword extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      token: ''
    }
    
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
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

 componentDidMount() {
  if (Utils.isUserLoggedIn()) {
    Router.push("/")
  }
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
          (this.props.app.configs!==null) ?
            <Grid 
              container
              justify="flex-start"
              alignItems="flex-start"
              className={classes.home}>
              <Grid item lg={12}>
                <Title
                  title="Contraseña de acceso."
                  description="Ingresa tu nueva contraseña de acceso."/>
                <br />
                {
                  (!Utils.isEmpty(this.props.tokenNewPass)) ?
                    <NewPasswordForm tokenNewPass={this.props.tokenNewPass}/>
                  :
                    ''
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
                onClick={this.handleCloseSnackbar}>
                <CloseIcon />
              </IconButton>
            ]}/>
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
)(NewPassword)
