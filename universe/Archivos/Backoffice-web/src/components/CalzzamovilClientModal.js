import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Icon from '@material-ui/core/Icon';
import Avatar from '@material-ui/core/Avatar';


// Components
import Title from '../components/Title'
import Utils from '../resources/Utils'

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
  container: {
    overflowY: 'scroll',
    maxHeight: 'calc(100vh - 100px)',
    position: 'absolute',
    width: '30%',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '32px 16px 32px 16px',
    [theme.breakpoints.down('sm')]: {
      width: '60%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90%',
      padding: '16px 16px 16px 16px'
    }
  },
  modalTitle: {
    width:'100%',
    marginTop: 16,
    fontSize: 26,
    fontWeight: 600,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: 22
    }
  },
  modalText: {
    display: 'block',
    fontSize: 16,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  },
  modalTextInline: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    fontSize: 16,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  }
})

class CalzzamovilClientModal extends Component {
  constructor(props) {
    super(props)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose() {
    this.props.handleClose()
  }

  handleRender() {
    if (this.props.data !== null || this.props.data !== undefined) {
      this.props.history.push('/calzzamovil/compras/cliente/' + this.props.data.id)
    } else {
      this.handleClose()
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}>
          {
            (this.props.data !== null && this.props.data !== undefined)?
              <div style={getModalStyle()} className={classes.container}>
                <Grid container direction="row">
                  <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <Icon item style={{marginRight: 8}}>person</Icon>
                    <Typography item className={classes.modalTextInline}>{this.props.data.name}</Typography>
                  </Grid>
                  <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12} style={{marginTop: 8}}>
                    <Icon item style={{marginRight: 8}}>email</Icon>
                    <Typography item className={classes.modalTextInline}>{this.props.data.email}</Typography>
                  </Grid>
                  <Grid container alignItems="center" item xl={12} lg={12} md={12} sm={12} xs={12} style={{marginTop: 8}}>
                    <Icon item style={{marginRight: 8}}>phone</Icon>
                    <Typography item className={classes.modalTextInline}>{this.props.data.cellphone}</Typography>
                  </Grid>
                </Grid>
                <Grid container direction="row" style={{marginTop: 32}}>
                  <Typography item className={classes.modalTextInline} variant="body1"><strong>Domicilios:</strong></Typography>
                  {
                    (this.props.data.address.map((item, index) => {
                      return (
                        <Grid key={index} item xl={12} lg={12} md={12} sm={12} xs={12} style={(index === 0)? {marginTop: 0} : {marginTop: 16}}>
                            <Typography className={classes.modalText} variant="body1"><strong>{item.name}</strong></Typography>
                            <Typography className={classes.modalText} variant="body1">{item.street} #{item.exteriorNumber}</Typography>
                            <Typography className={classes.modalText} variant="body1">{item.locationType}, {item.location}</Typography>
                            <Typography className={classes.modalText} variant="body1">{item.municipality}, {item.state}</Typography>
                            <Typography className={classes.modalText} variant="body1">C.P {item.zip}</Typography>
                        </Grid>        
                      )
                    }))
                  }
                </Grid>
              </div>
            :
              ''
            }
          
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = dispatch => {
  return {
    
  }
}

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(CalzzamovilClientModal)
