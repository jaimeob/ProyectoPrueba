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
import { IconButton, Snackbar } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'

import Utils from '../resources/Utils'

import bannerBlockImg from '../resources/images/bannerblock.jpg'
import carouselBlockImg from '../resources/images/carouselblock.jpg'
import containerBlockImg from '../resources/images/containerblock.jpg'
import bannerCarouselBlockImg from '../resources/images/bannercarouselblock.jpg'
import { requestAPI } from '../api/CRUD'

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
    width: theme.spacing.unit * 120,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 5,
    [theme.breakpoints.down('xs')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingTop: '20%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  first: {
    paddingRight: 32,
    [theme.breakpoints.down('sm')]: {
      padding: 0
    }
  },
  paper: {
    marginTop: 8,
    marginBottom: 16,
    padding: '8px 16px'
  },
  emojiAlias: {
    width: 14,
    marginRight: 4
  },
  modalTitle: {
    fontWeight: 600
  },
  largeTextField: {
    width: '100%',
    marginTop: 12
  },
  actions: {
    float: 'right',
    marginTop: 32
  },
  primaryButton: {
    marginLeft: 16,
    fontWeight: 600,
    fontSize: 14
  },
  textFieldLarge: {
    width: '100%'
  },
  title: {
    marginTop: 8
  },
  blockType: {
    marginTop: 12,
    cursor: 'pointer',
    border: '2px solid #E8F1F4',
    borderRadius: 8,
    padding: 8,
    width: '90%',
    marginLeft: '2.5%',
    marginRight: '2.5%',
    textAlign: 'center',
    opacity: 0.5
  },
  blockTypeSelected: {
    marginTop: 12,
    cursor: 'pointer',
    border: '2px solid #E8F1F4',
    borderColor: theme.palette.primary.main,
    borderRadius: 8,
    padding: 8,
    width: '90%',
    marginLeft: '2.5%',
    marginRight: '2.5%',
    textAlign: 'center',
    opacity: 1.0
  }
})

class CreateNewBlockModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      selectedBlockType: null
    }

    this.clearData = this.clearData.bind(this)
    this.handleRender = this.handleRender.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseWithData = this.handleCloseWithData.bind(this)
    this.selectBlockType = this.selectBlockType.bind(this)
  }

  selectBlockType(blockTypeId) {
    this.setState({
      selectedBlockType: blockTypeId
    })
  }

  handleClose() {
    this.clearData()
    this.props.handleClose()
  }

  handleCloseWithData() {
    if (this.state.selectedBlockType === null) {
      this.setState({
        openSnack: true,
        messageSnack: 'Selecciona el tipo de bloque que deseas crear.'
      })
      return
    }
    this.clearData()
    this.props.handleCloseWithData(this.state.selectedBlockType)
  }

  handleRender() {
    this.clearData()
    if (this.props.landing !== undefined && this.props.landing) {
      this.props.history.push('/landings/' + this.props.match.params.id + '/bloques/nuevo')
    } else {
      this.props.history.push(Utils.constants.paths.newBlock)
    }
  }

  clearData() {
    this.setState({
      openSnack: false,
      messageSnack: '',
      selectedBlockType: null
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >
        {
          (this.props.data !== null) ?
            <div style={getModalStyle()} className={classes.container}>
              <Typography variant="h4" className={classes.modalTitle}>
                Crear nuevo bloque.
            </Typography>
              <Typography variant="body2">
                Selecciona el tipo de bloque que deseas crear.
            </Typography>
              <Grid container style={{ marginTop: 8 }}>
                <Grid item xl={3} lg={3} md={3} xs={12} sm={12} onClick={() => { this.selectBlockType(Utils.constants.blocks.BANNER_BLOCK) }}>
                  <div className={(this.state.selectedBlockType === Utils.constants.blocks.BANNER_BLOCK) ? classes.blockTypeSelected : classes.blockType}>
                    <img style={{ width: 200 }} src={bannerBlockImg} />
                    <Typography variant="body1">Hero Banner</Typography>
                  </div>
                </Grid>
                <Grid item xl={3} lg={3} md={3} xs={12} sm={12} onClick={() => { this.selectBlockType(Utils.constants.blocks.BANNER_GRID_BLOCK) }}>
                  <div className={(this.state.selectedBlockType === Utils.constants.blocks.BANNER_GRID_BLOCK) ? classes.blockTypeSelected : classes.blockType}>
                    <img style={{ width: 200 }} src={bannerCarouselBlockImg} />
                    <Typography variant="body1">Grid Banner</Typography>
                  </div>
                </Grid>
                <Grid item xl={3} lg={3} md={3} xs={12} sm={12} onClick={() => { this.selectBlockType(Utils.constants.blocks.CAROUSEL_BLOCK) }}>
                  <div className={(this.state.selectedBlockType === Utils.constants.blocks.CAROUSEL_BLOCK) ? classes.blockTypeSelected : classes.blockType}>
                    <img style={{ width: 200 }} src={carouselBlockImg} />
                    <Typography variant="body1">Carrousel Block</Typography>
                  </div>
                </Grid>
                <Grid item xl={3} lg={3} md={3} xs={12} sm={12} onClick={() => { this.selectBlockType(Utils.constants.blocks.TEXT_BLOCK) }}>
                  <div className={(this.state.selectedBlockType === Utils.constants.blocks.TEXT_BLOCK) ? classes.blockTypeSelected : classes.blockType}>
                    <img style={{ width: 200 }} src={bannerBlockImg} />
                    <Typography variant="body1">Text Block</Typography>
                  </div>
                </Grid>
                <Grid item xl={3} lg={3} md={3} xs={12} sm={12} onClick={() => { this.selectBlockType(Utils.constants.blocks.GRID_BLOCK) }}>
                  <div className={(this.state.selectedBlockType === Utils.constants.blocks.GRID_BLOCK) ? classes.blockTypeSelected : classes.blockType}>
                    <img style={{ width: 200 }} src={bannerBlockImg} />
                    <Typography variant="body1">Grid Block</Typography>
                  </div>
                </Grid>
                <Grid item xl={3} lg={3} md={3} xs={12} sm={12} onClick={() => { this.selectBlockType(Utils.constants.blocks.COUNTDOWN_BLOCK) }}>
                  <div className={(this.state.selectedBlockType === Utils.constants.blocks.COUNTDOWN_BLOCK) ? classes.blockTypeSelected : classes.blockType}>
                    <img style={{ width: 200 }} src={bannerBlockImg} />
                    <Typography variant="body1">Countdown Banner</Typography>
                  </div>
                </Grid>
                <Grid item xl={3} lg={3} md={3} xs={12} sm={12} onClick={() => { this.selectBlockType(Utils.constants.blocks.FILTER_BLOCK) }}>
                  <div className={(this.state.selectedBlockType === Utils.constants.blocks.FILTER_BLOCK) ? classes.blockTypeSelected : classes.blockType}>
                    <img style={{ width: 200 }} src={carouselBlockImg} />
                    <Typography variant="body1">Products Block</Typography>
                  </div>
                </Grid>
                {/*
                  (this.props.landing) ?
                  <>
                  <Grid item xl={3} lg={3} md={3} xs={12} sm={12} onClick={() => { this.selectBlockType(Utils.constants.blocks.BENEFITS_BLOCK) }}>
                    <div className={(this.state.selectedBlockType === Utils.constants.blocks.BENEFITS_BLOCK) ? classes.blockTypeSelected : classes.blockType}>
                      <img style={{ width: 200 }} src={bannerBlockImg} />
                      <Typography variant="body1">Beneficios</Typography>
                    </div>
                  </Grid>
                  <Grid item xl={3} lg={3} md={3} xs={12} sm={12} onClick={() => { this.selectBlockType(Utils.constants.blocks.NEWSLETTER_BLOCK) }}>
                    <div className={(this.state.selectedBlockType === Utils.constants.blocks.NEWSLETTER_BLOCK) ? classes.blockTypeSelected : classes.blockType}>
                      <img style={{ width: 200 }} src={bannerBlockImg} />
                      <Typography variant="body1">Newsletter</Typography>
                    </div>
                  </Grid>
                  </>
                  :
                  ''
                */}
              </Grid>
              <div className={classes.actions}>
                <Button
                  onClick={this.handleClose}
                >
                  CANCELAR
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={this.handleCloseWithData}
                  className={classes.primaryButton}
                >
                  CONFIRMAR
              </Button>
              </div>
              <Snackbar
                autoHideDuration={5000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={this.state.openSnack}
                onClose={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
                message={
                  <span>{this.state.messageSnack}</span>
                }
                action={[
                  <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={() => { this.setState({ openSnack: false, messageSnack: '' }) }}
                  >
                    <CloseIcon />
                  </IconButton>
                ]}
              />
            </div>
            :
            ''
        }
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(CreateNewBlockModal)
