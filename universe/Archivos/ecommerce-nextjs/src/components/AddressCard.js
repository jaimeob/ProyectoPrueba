import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Typography, Paper, Button, Hidden, Card, Radio } from '@material-ui/core'
import StarIcon from '@material-ui/icons/Star'

// Components
import QuantityControl from './QuantityControl'
import Line from './Line'
import { requestAPI } from '../api/CRUD'

// Utils
import Utils from '../resources/Utils'
import ItemCheckout from './ItemCheckout'

import { updateShippingMethod } from '../actions/actionCheckout'

const styles = theme => ({
  card: {
    padding: theme.spacing(2),
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    paddingBottom: '50px',
    height: '175px',
    overflow: 'hidden'
  },
  containerStar: {
    display: 'flex',
    alignItems: 'center'
  },
  description: {
    color: '#808080'
  }

})

class ProductCart extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }

    //this.changeQuantity = this.changeQuantity.bind(this)
    this.handleChangeAddress = this.handleChangeAddress.bind(this)
    
  }


  componentWillMount() {
    this.setState({
    })
  }

  handleChangeAddress(id) {
    // if (id !== -1 || id !== undefined || id !== null) {
    //   this.props.changeAddress(id)
    // }
    this.props.changeAddress(id)
  }

  render() {
    const { classes } = this.props
    const self = this


    return (
      <div>
        <Paper className={classes.card} >
          <Grid container>

            <Grid item xs={12}>
              <Grid container>

                <Grid item xs={1} className={classes.containerStar} >
                  {
                    (this.props.address.favorite) ?
                      <StarIcon style={{ color: '#ffdd30' }} />
                      :
                      ''
                  }
                </Grid>

                <Grid item xs={10} className={classes.containerStar} >
                  <Typography>{(this.props.address.favorite) ? 'Domicilio predeterminado' : ''}</Typography>
                </Grid>

                <Grid item xs={1}>
                  <Radio
                    checked={(this.props.address.favorite)}
                    color="primary"
                    onChange={() => { this.handleChangeAddress(this.props.idx) }}
                    value="b"
                    name="radio-button-demo"
                    aria-label="B"
                  />
                </Grid>


              </Grid>
            </Grid>


            <Grid item xs={12}>
              <Typography variant='body2'> {(this.props.address.alias !== '') ? this.props.address.alias : 'Casa'} </Typography>
            </Grid>

            <Grid item xs={10}>
              <Typography variant='body2' className={classes.description}> { this.props.address.street + ' ' + this.props.address.exteriorNumber + ' ' + this.props.address.location + ' ' + this.props.address.zip + ' ' + this.props.address.municipality + ' ' + this.props.address.state } </Typography>
            </Grid>

            <Grid item xs={10}>
              <Typography variant='body2' className={classes.description} > { this.props.address.name + ' - ' + this.props.address.phone } </Typography>
            </Grid>




          </Grid>

        </Paper>
      </div>
    )

  }
}

// const mapStateToProps = state => ({ ...state })

// export default compose(
//   withStyles(styles),
//   connect(mapStateToProps, null)
// )(ProductCart)

const mapStateToProps = state => ({ ...state })
const mapDispatchToProps = dispatch => {
  return {
    updateShippingMethod: (checkout) => {
      dispatch(updateShippingMethod(checkout))
    }
  }
}
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(ProductCart)


