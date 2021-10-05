import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'
import Utils from '../resources/Utils'
import placeholder from '../resources/images/placeholder.svg'


// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Button, TextField, Typography, Modal, Select, Paper, Avatar, Icon, Divider } from '@material-ui/core'

const styles = theme => ({
  container: {
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
  }
})

class Product extends Component {
  render() {
    const { classes } = this.props
    return (
      <div className={classes.container}>
        <Grid container>
          <Grid item xs={2}>
            {
              (this.props.data !== null && this.props.data !== undefined && this.props.data.photos !== null && this.props.data.photos !== undefined && this.props.data.photos.length > 0) ?
                <img style={{ width: '90%' }} src={'https://s3-us-west-1.amazonaws.com/calzzapato/normal/' + this.props.data.photos[0].description} ></img>
                :
                <img style={{ width: '90%' }} src={placeholder} ></img>
            }
          </Grid>

          <Grid style={{ display: 'flex', alignItems: 'center' }} item xs={6} >
            <Grid container>
              <Grid item xs={12}>
                <Typography variant='body2' style={{ fontWeight: 'bold' }}>{this.props.data.productDescription}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='body2' style={{}}>{'Talla: ' + this.props.data.size + ' | Cantidad: ' + this.props.data.quantity}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid style={{ display: 'flex', alignItems: 'center' }} item xs={4} >
            <Typography variant='body1' style={{ fontSize: '16px', marginRight: '5px', fontWeight: 'bold', display: 'block', marginLeft: 'auto' }}>{'$ ' + Utils.numberWithCommas(Number(this.props.data.unitPrice).toFixed(2))}</Typography>
          </Grid>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(Product)
