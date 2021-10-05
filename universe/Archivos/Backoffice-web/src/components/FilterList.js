import React, { Component } from 'react'

// Material UI
import { Checkbox, TextField, Typography } from '@material-ui/core'


class FilterList extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        {
          (this.props.title != null) ?
            <Typography variant="body1"><strong>{this.props.title}</strong></Typography>
            :
            ''
        }
        {
          (this.props.filterInput != null) ?
            <TextField
              variant="outlined"
              type="text"
              placeholder={this.props.filterInput.placeholder}
              value={this.props.filterInput.search}
              onChange={(event) => { this.props.handleInputFunction.function(this.props.handleInputFunction.params[0], this.props.handleInputFunction.params[1], event) }}
              style={{ width: '100%' }}
              InputProps={{
                className: this.props.filterInput.inputSearch
              }}
            />
            :
            ''
        }
        {
          (this.props.data !== undefined) ?
            <ul style={this.props.style}>
              {
                this.props.data.map((data, idx) => {
                  if (data.count > 0 && !data.hidden) {
                    return (
                      <li key={idx} style={{ fontSize: 12, margin: 0, padding: 0 }}>
                        <Checkbox
                          style={{ fontSize: 12, margin: 0, padding: 0 }}
                          checked={this.props.data[idx].checked}
                          onChange={() => { this.props.handleFunction(idx) }}
                          value={this.props.data[idx].checked}
                          color="primary"
                        />
                        {
                          (this.props.size) ?
                            <span style={{ fontSize: 11 }}>{data.value.substring(0, 22)} (<strong style={{ color: 'red' }}>{data.count}</strong>)</span>
                            :
                            (this.props.price) ?
                              <span style={{ fontSize: 11 }}>{data.description} (<strong style={{ color: 'red' }}>{data.count}</strong>)</span>
                              :
                              <span style={{ fontSize: 11 }}>{data.description.toUpperCase().substring(0, 22)} (<strong style={{ color: 'red' }}>{data.count}</strong>)</span>
                        }
                      </li>
                    )
                  }
                  else {
                    return (<div></div>)
                  }
                })
              }
            </ul>
            :
            ''
        }
        <hr style={{ opacity: 0.4, margin: '16px 0' }} />
      </div>
    )
  }
}

export default (FilterList)
