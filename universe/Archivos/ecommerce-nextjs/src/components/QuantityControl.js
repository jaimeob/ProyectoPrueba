'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Add, Grade, Remove } from '@material-ui/icons'
import { Typography } from '@material-ui/core'

import { requestAPI } from '../api/CRUD'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({
  colorBlock: {
    color: '#808080'

  },
  container: {
    // width: '156px',
    // height: '44px',
    width: '80px',
    height: '30px',
    margin: '8px 0 0',
    padding: '10px 16px',
    borderRadius: '2px',
    // border: 'solid 1px #c6c7cb',
    boxShadow: '0 1px 1px 0.6px rgba(180, 180, 180, 0.5)',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.down("xs")]: {
      width: '100%',
      height: '30px',
    }
  },
  existence: {
    color: '#828282',
    lineHeight: 'normal',
    fontSize: '12px',
    marginTop: '4px',
    textAlign: 'center'
  },
  item: {
    border: 'none'
  },
  mas: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: 'auto',
    marginTop: '3px',
  },
  menos: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginRight: 'auto',
    marginTop: '3px',
  }

})

class QuantityControl extends Component {
  constructor(props) {
    super(props)
    this.state = {
      available: 0,
      counter: 1,
      blockMenos: false,
      blockMas: false,
      quantity: 1
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(number) {
    let blockMenos = false
    let blockMas = false
    let quantity = 0
    // Prevenir 0 o numeros negativos

    if (this.props.data.quantity === 1 && number === -1) {
      number = 0
    }
    if (this.props.data.quantity === this.state.available && number === 1) {
      number = 0
    }
    quantity = this.props.data.quantity + number

    this.setState({ counter: this.props.data.quantity + number, blockMas: blockMas, blockMenos: blockMenos })

    this.props.changeQuantity(quantity)
  }

  async componentWillMount() {
    if (this.props !== undefined && this.props.data !== undefined) {
      await this.setState({
        counter: Number(this.props.data.quantity),
        available: Number(this.props.data.available)
      })
    }
  }

  render() {
    const { classes } = this.props
    const self = this


    return (
      <div>
        <div className={classes.container} style={(this.props.modalCart) ? { width: '100%', height: '30px', } : {}} >
          <button className={classes.menos} onClick={() => self.handleChange(-1)} >
            <Remove style={{ height: '15px' }} className={(this.props.shoppingCart.count === 1) ? classes.colorBlock : ''} />
          </button>
          <Typography style={{ fontSize: '14px', marginBottom: '1px' }} >{this.props.data.quantity}</Typography>
          <button className={classes.mas} onClick={() => self.handleChange(1)} >
            <Add style={{ height: '15px' }} className={(this.props.shoppingCart.count === this.state.available) ? classes.colorBlock : ''} />
          </button>
        </div>
        <div>
          {
            (this.state.available <= 10) ?
              (this.state.available > 1) ?
                // <Typography className={classes.existence} >Sólo quedan {this.state.available} pares</Typography>
                <Typography className={classes.existence} >{this.state.available} disponibles</Typography>
                :
                // <Typography className={classes.existence} >Sólo queda {this.state.available} par</Typography>
                <Typography className={classes.existence} >{this.state.available} disponible</Typography>
              :
              ''
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(QuantityControl)
