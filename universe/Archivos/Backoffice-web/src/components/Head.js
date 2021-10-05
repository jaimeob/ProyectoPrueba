import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Typography, Paper, Grid, TextField, Button } from '@material-ui/core'

import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

const styles = theme => ({
  container: {
    padding: 12
  },
  textField: {
    width: '100%'
  },
  button: {
    fontWeight: 800,
    float: 'right'
  }
})

class Head extends Component {
  constructor(props) {
    super(props)
    this.state = {
      searchQuery: ''
    }
    this.handleChangeSearchQuery = this.handleChangeSearchQuery.bind(this)
  }

  handleChangeSearchQuery(event) {
    this.setState({
      searchQuery: event.target.value
    }, () => {
      this.props.searchQuery(this.state.searchQuery)
    })
  }

  render() {
    const { classes } = this.props
    return (
      <Paper className={classes.container}>
        {
          (typeof(this.props.callToCreate) === 'function' && this.props.callToCreate !== false) ?
          <Grid container>
            <Grid item xl={10} lg={10} md={129} sm={8} xs={6}>
              <TextField 
                variant="standard"
                type="text"
                color="primary"
                value={this.state.searchQuery}
                onChange={this.handleChangeSearchQuery}
                className={classes.textField}
                placeholder={this.props.searchPlaceholder}
              />
            </Grid>
            <Grid item xl={2} lg={2} md={3} sm={4} xs={6}>
              <Button variant="contained" color="primary" className={classes.button} onClick={this.props.callToCreate}>{this.props.titleButtonCreate}</Button>
            </Grid>
          </Grid>
          :
          <Grid container>
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
              <TextField 
                variant="standard"
                type="text"
                color="primary"
                value={this.state.searchQuery}
                onChange={this.handleChangeSearchQuery}
                className={classes.textField}
                placeholder={this.props.searchPlaceholder}
              />
            </Grid>
          </Grid>
        }
      </Paper>
    )
  }
}

export default compose(
  withTheme(),
  withStyles(styles),
)(Head)
