'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import MainLayout from '../../modules/Layout/MainLayout'
import NotFound from '../../modules/NotFound/notFound'

import BrandIndexView from '../../modules/Brands/brandIndexView'

// Material UI
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  container: {
    marginTop: 164,
    [theme.breakpoints.down('md')]: {
      marginTop: 190
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 178
    }
  }
})

class BrandIndexPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      index: []
    }
  }

  componentWillMount() {
    this.props.app.tree.forEach(item => {
      if (item.key === 'brands') {
        this.setState({
          index: item.subNodes
        })
      }
    })
  }

  render() {
    const { classes } = this.props
    return (
      <>
      {
        (this.state.index.length > 0) ?
        <MainLayout style={{ padding: '0px 0px' }}>
          <div className={classes.container}>
            <BrandIndexView index={this.state.index} />
          </div>
        </MainLayout>
        :
        <MainLayout style={{ padding: '0px 0px' }}>
          <NotFound />
        </MainLayout>
      }
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(BrandIndexPage)
