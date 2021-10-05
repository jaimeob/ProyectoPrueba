import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

//material
import { Grid, withStyles, Icon } from '@material-ui/core'

const styles = theme => ({
  iconContainer: {
    color: theme.palette.primary.main,
    opacity: 0.9,
    marginTop: 6,
    marginBottom: 6,
    margin: ' auto ',
    maxWidth: '20%',
    textAlign: 'center'
  },
  iconLink: {
    color: theme.palette.primary.main
  }
})

class BottomBarMovil extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  render() {
    const { classes } = this.props
    const self = this

    return (
      <div>
        <Grid container style={{ zIndex: 1, position: 'fixed', left: 0, bottom: 0, minHeight: '56px', width: '100%', backgroundColor: 'white', borderTop: '1px solid #D7D7D7' }}>
          <Grid item xs='auto' className={classes.iconContainer}>
            <a className={ classes.iconLink } href='/'>
              <Icon style={{ marginBottom: -8 }} >home</Icon>
              <br />
              <span style={{ fontSize: 12 }}>Inicio</span>
            </a>
          </Grid>
          <Grid item xs='auto' className={classes.iconContainer}>
            <a className={ classes.iconLink } href='/todos'>
              <Icon style={{ marginBottom: -8 }} >storefront</Icon>
              <br />
              <span style={{ fontSize: 12 }}>Explorar</span>
            </a>
          </Grid>
          <Grid item xs='auto' className={classes.iconContainer}>
            <a className={ classes.iconLink } href='/todos?csa=eyJwZyI6MCwibCI6NTAsInUiOm51bGwsImMiOm51bGwsImJjIjpudWxsLCJiciI6W10sInNjIjpbXSwiYiI6W10sImEiOltdLCJzIjpbXSwicCI6W10sImciOltdLCJvIjp0cnVlLCJicCI6ZmFsc2UsIm9iIjoiYmVzdE9mZmVyIn0='>
              <Icon style={{ marginBottom: -8 }} >local_offer</Icon>
              <br />
              <span style={{ fontSize: 12 }}>Ofertas</span>
            </a>
          </Grid>
          <Grid item xs='auto' className={classes.iconContainer}>
            <a className={ classes.iconLink } href='/todos?csa=eyJwZyI6MCwibCI6NTAsInUiOm51bGwsImMiOm51bGwsImJjIjpudWxsLCJiciI6W10sInNjIjpbXSwiYiI6W10sImEiOltdLCJzIjpbXSwicCI6W10sImciOltdLCJvIjpmYWxzZSwiYnAiOnRydWUsIm9iIjoiIn0='>
              <Icon style={{ marginBottom: -8 }} >monetization_on</Icon>
              <br />
              <span style={{ fontSize: 12 }}>Puntos</span>
            </a>
          </Grid>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default
  compose(
    withStyles(styles),
    connect(mapStateToProps, null)
  )
(BottomBarMovil)
