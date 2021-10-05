import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Button } from '@material-ui/core'

// Components
import Title from '../components/Title'
import ProductsDocument from './ProductsDocument'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({})

class UploadPruducts extends Component {
  constructor(props) {
    super(props)
    this.state = {
        docSelected: false
    }
  }

  render() {
    const self = this
    const { classes } = this.props
    
    return (
      <Grid container >
        {/*Title */}
        <Grid item xs={12} style={{marginBottom:'25px'}}>
            <Grid container>
                <Grid item xs={12}>
                    <Title
                        title="Productos."
                        description="Subir excel con detalles de productos."
                    />
                </Grid>
            </Grid>
        </Grid>
        {/*Drop excel */}
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <Grid container>
              <Grid item xs={10} style={{margin: '0 auto'}}>
                {/*Componente para subir archivo */}
                <Grid container>
                    <Grid item xs={12}>
                        <ProductsDocument />
                    </Grid>
                </Grid>
              </Grid>
          </Grid>
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
)(UploadPruducts)