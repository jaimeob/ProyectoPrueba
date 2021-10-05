import React, { Component } from 'react'

// Material UI
import { Checkbox, TextField, Typography, Collapse } from '@material-ui/core'
import Utils from '../resources/Utils'
import RemoveIcon from '@material-ui/icons/Remove'
import AddIcon from '@material-ui/icons/Add'
import { transform } from 'lodash'
import { withStyles } from '@material-ui/core/styles'
import compose from 'recompose/compose'
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  chips: {
    top: 0,
    right: 0
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
class FilterList extends Component {
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
      <div  >
        {
          (this.props.title != null) ?
            <div style={{ position: 'relative' }}  >
              <Typography style={{ marginLeft: 10 }} variant="body1">{this.props.title}</Typography>
              {
                (!this.state.open) ?
                  <AddIcon className={classes.iconStyle} onClick={() => { this.handleClose() }} style={{ top: 0, right: 0, position: 'absolute', cursor: 'pointer' }} ></AddIcon>
                  :
                  <Collapse in={true} >
                    <RemoveIcon onClick={() => { this.handleClose() }} style={{ position: 'absolute', top: 0, right: 0, cursor: 'pointer' }} ></RemoveIcon>
                  </Collapse>
              }

            </div>
            :
            ''
        }
        {
          (this.state.open) ?
            <div>
              {
                (this.props.filterInput != null) ?
                  <TextField
                    variant="outlined"
                    type="text"
                    placeholder={this.props.filterInput.placeholder}
                    value={this.props.filterInput.search}
                    //onChange={(event) => { console.log(event) }}
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
            :
            ''
        }
        {
          (this.state.open) ?
            <div >
              {
                (this.props.data !== undefined) ?
                  <Grid container className={classes.scrollBar} style={this.props.style} style={{ maxHeight: '200px', overflow: 'auto', transition: 'max-height 1s ease-out' }} >
                    {
                      this.props.data.map((data, idx) => {
                        if (data.count > 0 && !data.hidden) {
                          if (this.props.size) {
                            return (
                              <Grid onClick={() => { this.props.handleFunction(idx) }} className={(!this.props.data[idx].checked) ? classes.filterSize : classes.filterSizeSelected} item xl={2} lg={3} md={2} sm={2} xs={2} key={idx} style={{ fontSize: 12 }}>
                                <span style={{ fontSize: 11, fontWeight: 400 }}>{data.value.substring(0, 22)} <br></br> (<strong style={(!this.props.data[idx].checked) ? { color: 'red' } : { color: 'white' }}>{Utils.numberWithCommas(data.count)}</strong>)</span>
                              </Grid>

                            )
                          }
                          if (this.props.price) {
                            return (
                              <div xs={12} style={{ width: '110%' }}>
                                {
                                  (!this.props.data[idx].checked) ?
                                    <Grid onClick={() => { this.props.handleFunction(idx) }} className={classes.filterBrand} item xs={12} key={idx} style={{ fontSize: 12 }}>
                                      <span style={{ fontSize: 11, fontWeight: 400 }}>{data.description} (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(data.count)}</strong>)</span>
                                    </Grid>
                                    :
                                    <Grid onClick={() => { this.props.handleFunction(idx) }} className={classes.filterBrandSelected} item xs={12} key={idx} style={{ fontSize: 12 }}>
                                      <span style={{ fontSize: 11, fontWeight: 400 }}>{data.description} (<strong>{Utils.numberWithCommas(data.count)}</strong>)</span>
                                    </Grid>
                                }


                              </div>
                              // <Grid item  >
                              //   <span style={{ fontSize: 11, fontWeight: 400 }}>{data.description} (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(data.count)}</strong>)</span>
                              // </Grid>
                            )
                          } if (this.props.zones) {
                            return (
                              <div xs={12} style={{ width: '110%' }}>
                                {
                                  (!this.props.data[idx].checked) ?
                                    <Grid onClick={() => { this.props.handleFunction(idx) }} className={classes.filterBrand} item xs={12} key={idx} style={{ fontSize: 12 }}>
                                      <span style={{ fontSize: 11, fontWeight: 400 }}>{data.name} (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(data.count)}</strong>)</span>
                                    </Grid>
                                    :
                                    <Grid onClick={() => { this.props.handleFunction(idx) }} className={classes.filterBrandSelected} item xs={12} key={idx} style={{ fontSize: 12 }}>
                                      <span style={{ fontSize: 11, fontWeight: 400 }}>{data.name} (<strong>{Utils.numberWithCommas(data.count)}</strong>)</span>
                                    </Grid>
                                }
                              </div>
                              // <Grid item  >
                              //   <span style={{ fontSize: 11, fontWeight: 400 }}>{data.description} (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(data.count)}</strong>)</span>
                              // </Grid>
                            )
                          } else {
                            return (
                              <div xs={12} style={{ width: '110%' }}>
                                {
                                  (!this.props.data[idx].checked) ?
                                    <div onClick={() => { this.props.handleFunction(idx) }} className={classes.filterBrand}  >
                                      <span style={{ fontSize: 11, fontWeight: 400 }}>{data.description.toUpperCase().substring(0, 22)} (<strong style={{ color: 'red' }}>{Utils.numberWithCommas(data.count)}</strong>)</span>
                                    </div>
                                    :
                                    <div onClick={() => { this.props.handleFunction(idx) }} className={classes.filterBrandSelected} >
                                      <span style={{ fontSize: 11, fontWeight: 400 }}>{data.description.toUpperCase().substring(0, 22)} (<strong>{Utils.numberWithCommas(data.count)}</strong>)</span>
                                    </div>
                                }
                              </div >
                            )
                          }
                        }
                        else {
                          return (<div></div>)
                        }
                      })
                    }
                  </Grid>
                  :
                  ''
              }
            </div>
            :
            ''
        }

        <hr style={{ opacity: 0.4, margin: '16px 0' }} />
      </div>
    )
  }
}

//export default (FilterList)
export default compose(withStyles(styles))(FilterList)