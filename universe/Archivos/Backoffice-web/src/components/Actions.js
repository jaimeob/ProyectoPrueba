import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Icon from '@material-ui/core/Icon'

const ITEM_HEIGHT = 24

class Actions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClick(event) {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose(idx, option) {
    this.setState({ anchorEl: null })
    this.props.handleCloseAction(this.props.idx, option, false)
  }

  render() {
    const { anchorEl } = this.state
    const open = Boolean(anchorEl)

    return (
      <div>
        {
          (this.props.actions.length > 0) ?
          <div>
            <IconButton
              aria-label="More"
              aria-owns={open ? 'long-menu' : undefined}
              aria-haspopup="true"
              onClick={this.handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={this.handleClose}
              PaperProps={{
                style: {
                  maxHeight: 'auto',
                  width: 'auto',
                },
              }}
            >
            {
              this.props.actions.map((action, idx) => {
                return (
                  <MenuItem key={idx} onClick={() => { this.handleClose(idx, action) }}>
                    <Icon style={{opacity: 0.8, marginRight: 8}}>{action.icon}</Icon> {action.name}
                  </MenuItem>
                )
              })
            }
            </Menu>
          </div>
          :
          ''
        }
      </div>
    )
  }
}

export default Actions
