import React, { Component } from 'react'

// Material UI
import { Checkbox, TextField, Typography, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core'

import { withStyles } from '@material-ui/core/styles'
import compose from 'recompose/compose'
import Grid from '@material-ui/core/Grid'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

const styles = theme => ({
  chips: {
    top: 0,
    right: 0
  },
  checkbox: {
    margin: 0,
    padding: 0
  },
  filterBrand: {
    cursor: 'pointer',
    color: 'rgba(0, 0, 0, 0.54)',
    textAlign: 'center',
    margin: 5,
    padding: 5,
    borderRadius: 10,
    border: '1px solid rgba(0, 0, 0, 0.12)'
  },
  filterBrandSelected: {
    cursor: 'pointer',
    color: 'white',
    textAlign: 'center',
    margin: 5,
    padding: 5,
    borderRadius: 10,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    background: '#283a78'
  },
  filterSize: {
    cursor: 'pointer',
    color: 'rgba(0, 0, 0, 0.54)',
    textAlign: 'center',
    borderRadius: 10,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    padding: 5,
    width: '65px'
  },
  filterSizeSelected: {
    cursor: 'pointer',
    color: 'white',
    textAlign: 'center',
    borderRadius: 10,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    padding: 5,
    background: '#283a78',
    width: '65px'
  },
  input: {
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '4px',
    height: '30px',
    width: '100%',

    backgroundImage: 'url(/searchIcon.png)',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '5%',
    backgroundSize: '15px 15px',
  },
  scrollBar: {
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px'
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      'border-radius': '4px',
      'background-color': 'rgba(0,0,0,.5)',
      '-webkit-box-shadow': '0 0 1px hsla(0,0%,100%,.5)'
    }
  }

})
class FilterListNew extends Component {
  constructor(props) {
    super(props)
    this.state = {
      open: true
    }
    this.handleClose = this.handleClose.bind(this)

  }
  handleClose() {

    this.setState({
      open: !this.state.open,
    })
  }

  render() {
    const { classes } = this.props

    return (
      <div >
        <ExpansionPanel elevation={0} >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} >
            <Typography >
              {
                (this.props.title !== null && this.props.title !== undefined) ?
                  this.props.title
                  :
                  ''
              }
            </Typography>
          </ExpansionPanelSummary>
          {
            (this.props.filterInput != null) ?
              <ExpansionPanelDetails>
                <Grid container style={{ width: '100%' }}  >
                  <Grid item={12} style={{ width: '100%' }} >
                    <div>
                      {
                        (this.props.filterInput != null) ?
                          // <TextField
                          //   variant="outlined"
                          //   type="text"
                          //   placeholder={this.props.filterInput.placeholder}
                          //   value={this.props.filterInput.search}
                          //   onChange={(event) => { this.props.handleInputFunction.function(this.props.handleInputFunction.params[0], this.props.handleInputFunction.params[1], event) }}
                          //   style={{ width: '100%' }}
                          //   InputProps={{
                          //     className: this.props.filterInput.inputSearch
                          //   }}
                          // />
                          <TextField
                            variant="outlined"
                            type="text"
                            size="small"
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
                    </div>
                    {/* <input className={classes.input} type="text" id="fname" name="fname"></input> */}

                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
              :
              ''
          }
          <div style={{ maxHeight: '200px', overflow: 'scroll' }} className={classes.scrollBar} >
            {
              this.props.data.map((data, idx) => {
                if (data.count > 0 && !data.hidden) {
                  return (
                    <ExpansionPanelDetails  key={idx}>
                      <Grid item style={{ width: '100%' }} >
                        <Grid container style={{ width: '100%', flexWrap: 'nowrap', display:'flex', alignItems:'center' }} >
                          <Grid item={2} style={{ marginRight:'5px' }} >
                            <Checkbox
                              className={classes.checkbox}
                              checked={this.props.data[idx].checked}
                              onChange={() => { this.props.handleFunction(idx) }}
                              value={this.state.offer}
                              color="primary"
                            />
                          </Grid>
                          <Grid item={9} style={{ width: '85%', display: 'flex', alignItems: 'center' }} >
                            <Typography variant='body2' >
                              {
                                (data.value !== undefined && data.value !== null) ?
                                  data.value.substring(0, 22)
                                  :
                                  (data.description !== undefined && data.description !== null) ?
                                    data.description
                                    :
                                    (data.name !== undefined && data.name !== null) ?
                                      data.name
                                      :
                                      ''
                              }
                              {
                                (data.count !== undefined && data.count !== null) ?
                                  ' (' + data.count + ')'
                                  :
                                  ''
                              }
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </ExpansionPanelDetails>
                  )
                } else {
                  return (<div key={idx}></div>)
                }
              })
            }
          </div>
        </ExpansionPanel>
      </div>
    )
  }
}

//export default (FilterListNew)
export default compose(withStyles(styles))(FilterListNew)