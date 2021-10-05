import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Paper } from '@material-ui/core'

import Utils from '../resources/Utils'

const styles = theme => ({
  title: {
    fontWeight: 600,
    fontSize: 16
  },
  card: {
    marginBottom: 16,
    padding: 16
  }
})

class OrderCard extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { classes } = this.props
    return (
      <Paper className={classes.card}>
        <Grid container>
          <Grid item lg={6}>
            <Typography variant="h6" color="primary" className={classes.title}>
              Notas de la solicitud
            </Typography>
            <ul>
            {
              this.props.notes.map(function(note) {
                return (
                  <li>
                  <Typography variant="body1">
                    {note.description}
                  </Typography>
                  </li>
                )
              })
            }
            </ul>
          </Grid>
          <Grid item lg={6}>
            <Typography variant="h6" color="primary" className={classes.title}>
              Documentos
            </Typography>
            <ul>
            {
              this.props.documents.map(function(doc) {
                return (
                  <li>
                  <Typography variant="body1">
                    <a target="blank" href={Utils.constants.HOST + doc.url}>{doc.documentTypeName}</a>
                  </Typography>
                  </li>
                )
              })
            }
            </ul>
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

export default compose(
  withTheme(),
  withStyles(styles),
)(OrderCard)
