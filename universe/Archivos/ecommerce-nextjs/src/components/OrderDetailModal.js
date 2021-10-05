import React, { Component } from 'react'

// Components
import ProgressBar from './ProgressBar'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import { Grid, Typography, Icon, IconButton, Button, MobileStepper } from '@material-ui/core'

const styles = theme => ({
  modalContainer: {
    overflow: 'scroll',
    position: 'absolute',
    margin: '0 auto',
    width: 360,
    height: '100%',
    top: 0,
    right: 0,
    backgroundColor: '#F4F4F4',
    boxShadow: theme.shadows[5],
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: '100%',
    }
  },
  modalHeader: {
    width: '100%',
    height: 48,
    background: '#FFFFFF'
  }
})

class OrderDetailModal extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      width: 0, 
      height: 0 
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    
    this.handleClose = this.handleClose.bind(this)
    this.handleRender = this.handleRender.bind(this)
  }

  handleClose() {
    this.props.handleClose()
  }

  handleRender() {
    if (this.props.data !== undefined && this.props.data !== null) {
      let values = this.props.data
      this.setState({
        values: values
      })
    }
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    const { classes, data } = this.props
    return (
      <Modal
        open={this.props.open}
        onEscapeKeyDown={this.handleClose}
        onBackdropClick={this.handleClose}
        onRendered={this.handleRender}
      >
        <div className={classes.modalContainer}>
          <div className={classes.modalHeader}>
            <div style={{position: 'absolute', width: '100%'}}>
              <IconButton onClick={this.handleClose}>
                <Icon>
                  close_icon
                </Icon>
              </IconButton>
            </div>
            <div style={{position: 'absolute', width: '100%', zindex: 10, top: 12}}>
              <Typography variant="body1" align="center" style={{fontSize: 16, fontWeight: 500}}>
                Detalle de pedido
              </Typography>
            </div>
          </div>
          <Typography variant="body1" style={{width: '100%', fontSize: 16, fontWeight: 500, marginLeft: 16, marginTop: 20, marginBottom: 20}}>
            Tu producto
          </Typography>
          <Grid container style={{width: 328, background: '#FFFFFF', borderRadius: 5, margin: '0 auto', padding: 16}}>
            <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
              <img src={data.image} style={{width: '100%'}}/>
            </Grid>
            <Grid container item xl={9} lg={9} md={9} sm={9} xs={9} style={{paddingLeft: 16}}>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                {data.productDescription.substring(0, 28).split("-")}
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Cantidad: {data.quantity}
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Marca: {data.brand.charAt(0)}{data.brand.slice(1).toLowerCase()}
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Color: {data.color.charAt(0)}{data.color.slice(1).toLowerCase()}
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Talla: {data.size}
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Descuento: <span style={{color: '#da123f'}}>${data.discount}</span>
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Total: <span style={{color: '#26a446'}}>${data.total}</span>
              </Typography>
            </Grid>
            <Grid container item xl={12} lg={12} md={12} sm={12} xs={12} style={{marginTop: 32}}>
              <Button style={{width: "100%", fontSize: 14, borderRadius: 3, border: 'solid 2px #283a78', color: "#283a78"}}>
                SEGUIMIENTO DE ENVíO
              </Button>
              <Button style={{width: "100%", marginTop: 12, fontSize: 14, borderRadius: 3, border: 'solid 2px #283a78', color: "#283a78"}}>
                ESCRIBE UNA RESEÑA DEL PRODUCTO
              </Button>
            </Grid>
          </Grid>
          <Typography variant="body1" style={{width: '100%', fontSize: 16, fontWeight: 500, marginLeft: 16, marginTop: 20, marginBottom: 20}}>
            Tu envío
          </Typography>
          <Grid container style={{width: 328, background: '#FFFFFF', borderRadius: 5, margin: '0 auto', padding: 16}}>
            <Grid item style={{width: '100%'}}>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Método de envío
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500, color: 'rgba(0, 0, 0, 0.54)'}}>
                {data.shippingMethod.name}
              </Typography>
            </Grid>
            <Grid item style={{width: '100%', marginTop: 16}}>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Dirección de envío
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500, color: 'rgba(0, 0, 0, 0.54)'}}>
                {data.address.street} #{data.address.exteriorNumber}, Fracc {data.address.locationName}
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500, color: 'rgba(0, 0, 0, 0.54)'}}>
                {data.address.municipalityName} {data.address.stateName}
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500, color: 'rgba(0, 0, 0, 0.54)'}}>
                {data.address.zip}
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="body1" style={{width: '100%', fontSize: 16, fontWeight: 500, marginLeft: 16, marginTop: 20, marginBottom: 20}}>
            Tu orden
          </Typography>
          <Grid container style={{width: 328, background: '#FFFFFF', borderRadius: 5, margin: '0 auto', marginBottom: 48, padding: 16}}>
            <Grid item style={{width: '100%'}}>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Estado
              </Typography>
              <ProgressBar
                steps={['Pagado', 'Procesado', 'Enviado', 'Entregado']}
                step={2}
                style={{fontSize: 12, color: 'rgba(0, 0, 0, 0.54)'}}
              />
            </Grid>
            <Grid item style={{width: '100%'}}>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Orden
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500, color: 'rgba(0, 0, 0, 0.54)'}}>
                #{data.order}
              </Typography>
            </Grid>
            <Grid item style={{width: '100%', marginTop: 16}}>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                Método de pago
              </Typography>
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500, color: 'rgba(0, 0, 0, 0.54)'}}>
                {data.paymentMethod.name}
              </Typography>
            </Grid>
            <Grid item style={{width: '100%', marginTop: 16}}>
              {
                (data.quantity > 1)?
                  <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                    Precio total({data.quantity} Productos)
                  </Typography>
                :
                  <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500}}>
                    Precio total({data.quantity} Producto)
                  </Typography>
              }
              <Typography variant="body1" style={{width: '100%', fontSize: 14, fontWeight: 500, color: 'rgba(0, 0, 0, 0.54)'}}>
                ${data.total}
              </Typography>
            </Grid>
          </Grid>
        </div>
      </Modal>
    )
  }
}

export default withStyles(styles)(OrderDetailModal)
