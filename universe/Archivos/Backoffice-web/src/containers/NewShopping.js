import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Snackbar, Grid, Button, IconButton, TextField, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'

// Icons
import CloseIcon from '@material-ui/icons/Close'

// Components
import Empty from '../components/Empty'
import NewShoppingLines from '../components/NewShoppingLines'
import Autocomplete from '../components/Autocomplete'
import ProductSearch from '../components/ProductSearch'
import Uploader from '../components/Uploader'
import NotFound from './NotFound'

// Utils
import Utils from '../resources/Utils'

const styles = theme => ({
  container: {
    marginTop: 48
  },
  titleStep: {
    fontWeight: 700
  },
  newOrderContainer: {
    position: 'absolute',
    right: 0,
    width: '33%',
    marginTop: -24,
    padding: 32,
    boxShadow: '1px 1px 0.5em ' + theme.palette.border.main,
    height: '100%'
  },
  textField: {
    margin: 0,
    padding: 0,
    width: '100%',
    backgroundColor: 'white',
  },
  deleteButton: {
    float: 'right'
  },
  orderHead: {
    position: 'fixed',
    top: 90
  },
  total: {
    position: 'fixed',
    top: 180
  },
  titleTotal: {
    color: 'green',
    fontWeight: 800
  },
  orderForm: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '27%',
    padding: '3.6%'
  },
  btnAddDocs: {
    width: '100%',
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'left'
  },
  createButton: {
    width: '100%',
    fontWeight: 700
  },
  cancelButton: {
    marginTop: 8,
    width: '100%',
    fontWeight: 700
  },
  textFieldForm: {
    margin: '4px 0',
    padding: 0,
    width: '100%',
    backgroundColor: 'white',
  },
  select: {
    margin: '8px 0'
  },
  date: {
    margin: '16px 0'
  }
})

class NewShopping extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openSnack: false,
      messageSnack: '',
      products: [],
      total: 0,
      values: {
        branchId: '',
        supplierId: '',
        requieredDeliveryDate: '',
        comments: ''
      }
    }
  }

  render() {
    const { classes } = this.props
    return (
      (Utils.constants.modules.Shoppings !== undefined && Utils.constants.modules.Shoppings.permissions.create) ?
      <div>
        <Grid container>
          <Grid item lg={7}>
            <ProductSearch
              selectedProduct={(product) => { this.selectedProduct(product) }}
            />
          </Grid>
          <Grid item lg={7}>
            <NewShoppingLines
              updateProducts={(products) => { this.updateProducts(products) }}
            />
          </Grid>
          <Grid item lg={4} className={classes.newOrderContainer}>
            <div className={classes.orderHead}>
              <Typography variant="h4" className={classes.titleStep}>{Utils.messages.NewShopping.mainTitle}</Typography>
              <Typography variant="body1" className={classes.titleStep}>{Utils.messages.NewShopping.mainDescription}</Typography>
            </div>
            <div className={classes.total}>
              <Typography variant="h4" className={classes.titleTotal}>$ {Utils.numberWithCommas(this.state.total.toFixed(2))}</Typography>
              <Typography variant="body1" className={classes.titleStep}>Total compra</Typography>
            </div>
            <form className={classes.orderForm}>
              <div className={classes.date}>
                <Typography variant="body1"><strong>{Utils.messages.NewShopping.storerLabel}:</strong></Typography>
                <TextField
                  placeholder=""
                  className={classes.textFieldForm}
                  value={this.state.values.comments}
                  onChange={(event) => { this.handleChangeComments(event) }}
                  type="text"
                />
              </div>
              <div className={classes.select}>
                <Autocomplete
                  label={Utils.messages.NewShopping.autocompletes.branch}
                  resource="branches"
                  param="name"
                  value={this.state.values.branchId}
                  onChange={(newValue) => this.handleChangeValueSelect('branchId', newValue)}
                />
              </div>
              <div className={classes.select}>
                <Autocomplete
                  label={Utils.messages.NewShopping.autocompletes.supplier}
                  resource="suppliers"
                  param="brand"
                  value={this.state.values.supplierId}
                  onChange={(newValue) => this.handleChangeValueSelect('supplierId', newValue)}
                />
              </div>
              <div className={classes.date}>
                <Typography variant="body1"><strong>{Utils.messages.NewShopping.deliveryDateLabel}:</strong></Typography>
                <TextField
                  className={classes.textFieldForm}
                  value={this.state.values.deliveryDate}
                  onChange={(event) => { this.handleChangeDeliveryDate(event) }}
                  type="date"
                />
              </div>
              <div className={classes.date}>
                <Typography variant="body1"><strong>{Utils.messages.NewShopping.commentsLabel}:</strong></Typography>
                <TextField
                  placeholder="Comentarios..."
                  className={classes.textFieldForm}
                  value={this.state.values.comments}
                  onChange={(event) => { this.handleChangeComments(event) }}
                  type="text"
                />
              </div>
              <Button variant="contained" color="primary" className={classes.createButton} onClick={(event) => { this.createNewShopping(event) }}>
                Crear nueva compra
              </Button>
              <br />
              <Button variant="text" className={classes.cancelButton}>
                Cancelar
              </Button>
            </form>
          </Grid>
        </Grid>

        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          open={this.state.openSnack}
          onClose={this.handleCloseSnackbar}
          message={
            <span>{this.state.messageSnack}</span>
          }
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={this.handleCloseSnackbar}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      </div>
      :
      <NotFound />
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withRouter,
  withTheme(),
  withStyles(styles),
  connect(mapStateToProps, null)
)(NewShopping)
