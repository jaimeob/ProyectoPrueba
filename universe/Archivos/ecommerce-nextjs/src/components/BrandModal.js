import React, { Component } from 'react'

//Material UI
import { Typography, Grid } from '@material-ui/core'
import Modal from '@material-ui/core/Modal'

import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withStyles } from '@material-ui/core/styles'
import TextBlock from './TextBlock'

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
  smallForm: {
    overflowY: 'scroll',
    position: 'absolute',
    width: theme.spacing(150),
    maxHeight: 'calc(100vh - 100px)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('md')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  largeForm: {
    overflow: 'scroll',
    position: 'absolute',
    width: theme.spacing(100),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
      background: 'white',
      width: '90%',
      height: '100%',
      paddingLeft: '5%',
      paddingRight: '5%'
    }
  },
  largeTextField: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'inherit',
    fontWeight: 200
  },
  modalTitle: {
    fontSize: 28,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    },
    fontWeight: 600
  },
  scrollBar: {
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px'
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      'border-radius': '4px',
      'background-color': 'rgba(0,0,0,.5)',
      '-webkit-box-shadow': '0 0 1px hsla(0,0%,100%,.5)'
    }
  }
})

class BrandModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      errorMessage: ''
    }
    
    this.handleClose = this.handleClose.bind(this)
    this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
  }

  handleCloseSnackbar() {
    this.setState({errorMessage: '', openSnack: false})
  }

  handleClose() {
    this.props.handleClose()
  }

  render() {
    const { classes } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        className={classes.modalContainer}
        onRendered={this.handleRender}
      >
        <div style={getModalStyle()} className={`${classes.smallForm} ${classes.scrollBar}`}>
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ padding: 16, textAlign: 'center' }}>
              <TextBlock configs={{
                title: "Encuentra tu marca.",
                message: "Las mejores marcas están en " + this.props.app.data.alias + ".",
                cta: null
              }}
              />
            </Grid>
          {
            this.props.index.map((node, idx) => {
              return (
                <Grid key={idx} item xl={12} lg={12} md={12} sm={12} xs={12} style={{ padding: 16 }}>
                  <Typography variant="h4" style={{ color: 'gray' }}>{node.key}</Typography>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {
                      node.brands.map((brand, jdx) => {
                        return (
                          <li key={jdx} style={{ float:'left', marginRight: 8, marginTop: 8, padding: 8, borderRadius: 8, background: '#c9e5ed', color: '#245b6b', border: '1px solid #b4dce8' }}>
                            <a href={brand.url} style={{ color: '#245b6b' }}>{brand.name} ( <strong style={{ color: '#ff3a3a' }}>{brand.count}</strong> )</a>
                          </li>
                        )
                      })
                    }
                  </ul>
                </Grid>
              )
            })
          }
          </Grid>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(withStyles(styles),connect(mapStateToProps, null))(BrandModal)
