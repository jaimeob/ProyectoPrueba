import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'

// Components
import Title from '../components/Title'
import Giveaway from '../components/Giveaway'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({})

class Calzzamovil extends Component {
  constructor(props) {
    super(props)
    this.state = {
      optionSelected: 'REPARTIDORES',
      deliverys: [],
      orders: [],

    }
  }


  render() {
    const self = this
    const { classes } = this.props


    return (
      <Grid container >
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          {/* <Title
            title="Giveaway."
            description="Aqui van los datos apapa"
          /> */}
          <Giveaway />
        </Grid>
      </Grid>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(Calzzamovil)