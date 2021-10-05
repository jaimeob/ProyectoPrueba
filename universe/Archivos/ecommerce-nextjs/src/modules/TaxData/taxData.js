import React, { Component } from 'react'

//components
import TaxDataForm from '../../components/TaxDataForm'
import MyTaxData from '../../components/MyTaxData'
import MyAccountMenu from '../../components/MyAccountMenu'

//material
import { withStyles, Grid, Typography, Hidden } from '@material-ui/core'
import Utils from '../../resources/Utils'

import Link from 'next/link'


const style = theme => ({
  root: {
    width: '100%',
    float: 'left',
    padding: '12px 48px 154px 48px',
    minHeight: 500,
    backgroundColor: "#F4F4F4",
    [theme.breakpoints.down('sm')]: {
      padding: "6px 0px 32px 0px",
    },
    [theme.breakpoints.down('xs')]: {
      padding: "0px 0px 32px 0px",
    }
  },
  txt: {
    fontWeight: 500,
    fontSize: '20px',
    lineHeight: '25px',
    paddingTop: 24,
    [theme.breakpoints.down('sm')]: {
      margin: 8,
      padding: 0
    }
  },
  title: {
    fontSize: '36px',
    color: '#000000',
    [theme.breakpoints.down('sm')]: {
      margin: 8
    }
  },
  container: {
    padding: '40px 32px 32px 32px',
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
      padding: 16,
      margin: 8
    }
  }
})



class TaxData extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { classes } = this.props

    return (
      <div>
        <Grid container className={classes.root} >
          <Hidden smDown>
            <Grid item md={4}>
              <MyAccountMenu
                text={"Datos fiscales"} />
            </Grid>
          </Hidden>
          <Hidden mdUp>
            <Grid item xs={12} style={{ paddingLeft: 16 }}>
              <Link href={Utils.constants.paths.myAccount} color="inherit" style={{ display: 'inline-block' }}>
                <Typography style={{ color: "grey", fontSize: 18 }}> Mi cuenta /&nbsp;</Typography>
              </Link>
              <Link href={`/mi-cuenta/[pid]`} as={`/mi-cuenta/${Utils.constants.paths.addresses}`} color="inherit" style={{ display: 'inline-block' }}>
                <Typography style={{ color: "#283A78", fontSize: 18 }}>Datos fiscales</Typography>
              </Link>
            </Grid>
          </Hidden>
          <Grid item className={classes.container} xs={12} sm={12} md={8} style={{ margin: '0 auto' }}>
            <Typography variant="h2" className={classes.title}><heavy>Datos fiscales</heavy></Typography>
            <Typography className={classes.txt}>Agrega datos fiscales para solicitar tus facturas</Typography>
            <MyTaxData />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(style)(TaxData)