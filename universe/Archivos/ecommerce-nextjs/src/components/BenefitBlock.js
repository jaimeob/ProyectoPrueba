'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography } from '@material-ui/core'

const styles = theme => ({
  item: {
    padding: 16,
    textAlign: 'center',
    backgroundColor: 'white'
  },
  itemImage: {
    width: '25%',
    textAlign: 'center',
    margin: '0 auto'
  },
  itemName: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 22,
    fontWeight: 500,
  },
  itemDescription: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    fontWeight: 300
  }
})

class BenefitBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      configs: null
    }
  }

  componentWillMount() {
    if (this.props.configs !== undefined) {
      this.setState({
        configs: this.props.configs,
      })
    } else {
      const { items } = this.props.app.data.langs.es.Benefits
      this.setState({
        configs: { items: items }
      })
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Grid container style={{ width: '100%', margin: '0 auto' }}>
        {
          (this.state.configs.items.length > 0) ?
            this.state.configs.items.map((item, idx) => {
              return (
                <Grid key={idx} item className={classes.item} lg={3} md={3} sm={6} xs={12}>
                  <img
                    className={classes.itemImage}
                    src={item.banner}
                    alt={item.description}
                  />
                  <div className={classes.itemDescription}>
                    <Typography variant="body1" className={classes.itemName}>{item.title}</Typography>
                    <Typography variant="body2" className={classes.itemDescription}>{item.description}</Typography>
                  </div>
                </Grid>
              )
            })
            :
            ''
        }
      </Grid>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default connect(mapStateToProps, null)(withStyles(styles)(BenefitBlock))
