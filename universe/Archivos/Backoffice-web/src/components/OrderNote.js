import React, { Component } from 'react'
import compose from 'recompose/compose'
import { connect } from 'react-redux'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { IconButton, TextField, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'

import emptyImg from '../resources/images/empty.svg'
import sleepImg from '../resources/images/sleep.svg'

// Components
import Empty from './Empty'

import Utils from '../resources/Utils'

const styles = theme => ({
  container: {
    marginTop: 48
  },
  titleStep: {
    fontWeight: 700
  },
  textField: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'white',
  },
  deleteButton: {
    float: 'right'
  }
})

class OrderNote extends Component {
  constructor(props) {
    super(props)
    this.state = {
      deletedNotes: [],
      notes: [],
      txtAddNote: '',
      emptyTitle: Utils.messages.General.loadTitle,
      emptyDescription: Utils.messages.General.loadDescription
    }

    this.getPlaceholderForEmptyComponent = this.getPlaceholderForEmptyComponent.bind(this)
    this.addNote = this.addNote.bind(this)
    this.handleChangeTextNote = this.handleChangeTextNote.bind(this)
    this.deleteNote = this.deleteNote.bind(this)
  }

  componentWillMount() {
    if (this.props.mode === 'update') {
      this.setState({
        deletedNotes: [],
        notes: this.props.notes
      }, function() {
        this.setState({
          emptyTitle: Utils.messages.OrderForm.emptyAnotationsTitle,
          emptyDescription: Utils.messages.OrderForm.emptyAnotationsDescription
        })
      })
    }
    else {
      this.setState({
        emptyTitle: Utils.messages.OrderForm.emptyAnotationsTitle,
        emptyDescription: Utils.messages.OrderForm.emptyAnotationsDescription
      })
    }
  }

  getPlaceholderForEmptyComponent() {
    if (this.state.emptyTitle !== Utils.messages.General.loadTitle) {
      return emptyImg
    }
    return sleepImg
  }

  addNote(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (Utils.isEmpty(event.target.value))
        return

      let notes = this.state.notes
      notes.push(event.target.value)
      this.setState({
        notes: notes,
        textAddNote: ''
      })
      this.props.updateNotes(notes, this.state.deletedNotes)
    }
  }

  deleteNote(idx) {
    let deletedNotes = this.state.deletedNotes
    let notes = this.state.notes
    if (typeof(notes[idx]) === 'object') {
      deletedNotes.push(notes[idx])
      notes.splice(idx, 1)
    }
    else {
      notes.splice(idx, 1)
    }

    this.setState({
      deletedNotes: deletedNotes,
      notes: notes
    })

    this.props.updateNotes(notes, deletedNotes)
  }

  handleChangeTextNote(event) {
    this.setState({
      textAddNote: event.target.value
    })
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <Typography variant="body1" className={classes.titleStep}>{Utils.messages.OrderForm.anotations.title}</Typography>
        <TextField
          className={classes.textField}
          placeholder={Utils.messages.OrderForm.anotations.description + "..."}
          autoFocus={true}
          value={this.state.textAddNote}
          onChange={(event) => { this.handleChangeTextNote(event) }}
          onKeyPress={(event) => { this.addNote(event) }}
        />
        {
          (this.state.notes.length <= 0) ?
          <div className={classes.container}>
            <Empty
              emptyImg={this.getPlaceholderForEmptyComponent()}
              title={this.state.emptyTitle}
              description={this.state.emptyDescription}
            />
          </div>

          :

          <Paper className={classes.container}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>{Utils.messages.OrderForm.anotations.headerList}</strong></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.notes.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell component="th" scope="item">
                      {
                        (typeof(item) === 'object') ?
                        item.description
                        :
                        item
                      }
                    </TableCell>
                    <TableCell scope="item">
                      <IconButton className={classes.deleteButton}
                        onClick={() => { this.deleteNote(idx) }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

        }
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(OrderNote)
