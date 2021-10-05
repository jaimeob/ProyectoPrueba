'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Link from 'next/link'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Button } from '@material-ui/core'

// Utils
import Utils from '../resources/Utils'
import { getDataAPI } from '../api/CRUD'
import ProductCard from './ProductCard'

const styles = theme => ({
  basicBlockContainer: {
    width: '85%',
    margin: '0 auto',
    paddingTop: 48,
    paddingBottom: 48,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    }
  },
  blockTitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 500,
    [theme.breakpoints.down('sm')]: {
      fontSize: 18
    }
  },
  blockDescription: {
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
    [theme.breakpoints.down('sm')]: {
      fontSize: 14
    }
  }
})

class BasicBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      configs: (this.props.configs !== undefined) ? JSON.parse(this.props.configs) : null
    }
  }

  async componentWillMount() {
    let filters = this.props.filters
    if (typeof (this.props.filters) !== 'object') {
      filters = JSON.parse(this.props.filters)

    }
    let response = await getDataAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      resource: this.props.resource,
      filters: filters
    })
    this.setState({
      items: response.data
    })
  }

  render() {
    const self = this
    const { classes } = this.props

    return (
      <div>
        {
          (this.state.items.length > 0) ?
            <Grid container className={classes.basicBlockContainer} justify="center" alignItems="flex-end">
              <Typography variant="h4" className={classes.blockTitle}>
                {this.props.title}
              </Typography>
              <Typography variant="h5" className={classes.blockDescription}>
                {this.props.description}
              </Typography>
              {
                (this.state.items.length > 0) ?
                  this.state.items.map((item, idx) => {
                    return (
                      <Grid key={idx} item md={3} sm={4} xs={6}>
                        <div style={{ backgroundColor: 'white', margin: 8, boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.12)'}}>
                          <ProductCard
                            data={item}
                          />
                        </div>
                      </Grid>
                    )
                  })
                  :
                  ''
              }
              {
                (this.props.configs !== undefined && this.state.configs.moreInfo.callToAction !== undefined && !Utils.isEmpty(this.state.configs.moreInfo.callToAction)) ?
                  <Button variant="outlined" color="primary" style={{ marginTop: 16 }}>
                    {
                      (Utils.isExternalLink(this.state.configs.moreInfo.callToAction)) ?
                        <a href={this.state.configs.moreInfo.callToAction}>{this.state.configs.moreInfo.title}</a>
                        :
                        <Link to={this.state.configs.moreInfo.callToAction}>{this.state.configs.moreInfo.title}</Link>
                    }
                  </Button>
                  :
                  ''
              }
            </Grid>
            :
            ''
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(BasicBlock)
