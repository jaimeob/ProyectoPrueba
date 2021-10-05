import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { ListItemText, Divider } from '@material-ui/core'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Collapse from '@material-ui/core/Collapse'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

const styles = theme => ({
})

class FaqListItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false
    }
  }

  setOpen() {
    this.setState({
      open: !this.state.open
    })
  }

  render() {
    const { classes } = this.props

    return (
      <div>
        <ListItem button onClick={() => { this.setOpen() }}>
          <ListItemText primary={this.props.question} />
          {(this.state.open) ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem className={classes.nested}>
              <ListItemText secondary={this.props.answer} />
            </ListItem>
          </List>
        </Collapse>
        <Divider />
      </div>
    )
  }
}


const mapStateToProps = state => ({ ...state })

export default compose(
  
  withStyles(styles),
  connect(mapStateToProps, null)
)(FaqListItem)
