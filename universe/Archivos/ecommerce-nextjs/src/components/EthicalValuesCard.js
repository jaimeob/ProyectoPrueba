import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Avatar, Typography, Grid } from '@material-ui/core'

const styles = theme => ({
  avatar: {
     marginLeft: 'auto',
     marginRight: 'auto',
     marginBottom: 16,
     display: 'flex',
     width: '30%',
     height: '30%'
  },
  cardValuesStyle: {
    width: '90%',
    height: '100%',
    margin: 'auto',
    marginTop: 32,
  }
})

 class EthicalValuesCard extends Component {
   constructor(props) {
     super(props)
     this.setState={
       
     }
   }

   render(){
     const { classes } = this.props
     return(
       <Grid item lg={3} md={3} sm={6} xs={6} style={{marginBottom: 16}}>
        <div className={classes.cardValuesStyle}>
          <div>
            <Avatar
              variant='square'
              className={classes.avatar}
              src={this.props.imageUrl}
            />
            <Typography style={{textAlign: 'justify'}}>
              {this.props.description}
            </Typography>
          </div>
        </div>
      </Grid>
     )
   }
 }

 export default compose(
   withRouter,
   
   withStyles(styles),
   connect(null, null)
 )(EthicalValuesCard)
