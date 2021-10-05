import React, { Component } from 'react'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Hidden, Typography, TextField, Button, InputAdornment, TableRow, TableCell, Snackbar } from '@material-ui/core'

import Loading from './Loading'


const styles = theme => ({
  blueLine: {
    background: '#243b7a',
    height: '15px',
    width: '100%'

  },
  cardContainer: {
    border: 'solid 1px #243b7a',
    borderRadius: '7px',
    paddingTop: '12px',
    width: '100%',
    // height: '83px',
    height: '100%',
    marginBottom: '10px',

    [theme.breakpoints.down("md")]: {

    },
  }

})

class Card extends Component {
  constructor(props) {
    super(props)
    var date = new Date()
    var year = date.getFullYear()
    this.year = year
  }

  render() {
    const { classes } = this.props
    return (
      <Grid container>
        <Grid onClick={ (this.props.edit)? ()=>{ this.props.handleSelectedCard() } : ()=>{ }} item xs={12} className={classes.cardContainer} >
          <Grid container>
            <Grid item xs={12} className={classes.blueLine}></Grid>
            <Grid item xs={12} style={{ paddingTop: '10px', marginLeft: '10px' }} >
              {
                (this.props.data.type === 'visa') ?
                  <img style={{ width: '30%' }} src={'/visa.svg'}></img>
                  :
                  (this.props.data.type === 'american-express') ?
                    <img style={{ width: '17%' }} src={'/amex.svg'}></img>
                    :
                    (this.props.data.type === 'mastercard') ?
                      <img style={{ width: '23%' }} src={'/mastercard.svg'}></img>
                      :
                      ''

              }
            </Grid>
            <Grid item xs={12} style={{ marginLeft: '10px' }} >
              <Typography style={{ verticalAlign: 'sub', fontSize: '13px', height: '1em', lineHeight: '1em', overflow: 'hidden' }} variant='body2'>{this.props.data.alias}</Typography>
            </Grid>
            <Grid item xs={12} style={{ marginLeft: '10px' }} >
              <Typography style={{ verticalAlign: 'sub', fontSize: '13px' }} variant='body2'><span style={{ verticalAlign: 'sub' }} >**** **** ****</span> {this.props.data.number} </Typography>
            </Grid>

          </Grid>
        </Grid>
      {
        (this.props.edit)?
        <Typography onClick={ ()=>{ this.props.editCard() } } variant='body2' style={{ fontSize:'12px', fontWeight:'600', color:'#499dd8' }} > Editar</Typography>
        :
        ''
      }
      
      </Grid>
    )
  }
}

export default withStyles(styles)(Card)
