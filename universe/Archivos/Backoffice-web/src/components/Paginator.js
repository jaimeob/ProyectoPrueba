import React, { Component } from 'react'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'

// Components
import TablePagination from '@material-ui/core/TablePagination'

const styles = theme => ({

})

class Paginator extends Component {
  render() {
    const { classes } = this.props
    return (
      <TablePagination
        component="div"
        style={{marginRight: 8}}
        labelRowsPerPage="Registros por página:"
        labelDisplayedRows={({ from, to, count }) => {
          return `${from} - ${to} de ${count}`}
        }
        rowsPerPageOptions={this.props.options}
        count={this.props.count}
        rowsPerPage={this.props.rowsPerPage}
        page={this.props.page}
        onChangePage={this.props.onChangePage}
        onChangeRowsPerPage={this.handleChangeRowsPerPage}
        nextIconButtonText='show'
      />
    )
  }
}

export default compose(
  withTheme(),
  withStyles(styles),
)(Paginator)
