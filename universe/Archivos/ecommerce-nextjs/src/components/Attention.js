import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import moment from 'moment'

//material
import { Grid, withStyles, Typography, Button, Hidden } from '@material-ui/core'

const styles = theme => ({

    title: {
        fontWeight: 'bold',
        fontSize: '18px',
        [theme.breakpoints.down('xs')]: {
            fontSize: '16px',
        }
    },
    subtitle: {
        [theme.breakpoints.down('xs')]: {
            fontSize: '14px',
        }
    },
    button: {
        [theme.breakpoints.down('md')]: {
            marginTop: '10px',
        }
    },

})

const atention = (props) => {
    window.open('https://api.whatsapp.com/send?phone=526677515229&text=Hola, necesito ayuda con mi pedido, el folio es ' + props.folio, '_blank')
}

class Attention extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        const { classes } = this.props
        const self = this
        return (
            <div style={{ width: '100%', background: '#edeef2', padding: '10px' }} >
                <Grid container >
                    <Grid item md={4} xs={6}>
                        <Grid container>
                            <Grid item xs={12} >
                                <Typography className={classes.title} align='center' variant='body1'>Pedido enviado</Typography>
                            </Grid>
                            <Grid item xs={12} >
                                <Typography className={classes.subtitle} align='center' variant='body1'>{(this.props.shoppingDate !== null && this.props.shoppingDate !== undefined && this.props.shoppingDate !== 'Invalid date') ? String(this.props.shoppingDate).charAt(0).toUpperCase() + (this.props.shoppingDate).slice(1) : '-'}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item md={4} xs={6}>
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography className={classes.title} align='center' variant='body1'>Tipo de envío</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography className={classes.subtitle} align='center' variant='body1'>{(this.props.shippingName !== null && this.props.shippingName !== undefined) ? this.props.shippingName : '-'}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item md={4} xs={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Grid container style={{}}>
                            <Grid item md={11} xs={12} style={{}} >
                                <Button className={classes.button} fullWidth variant="contained" color="primary" onClick={() => atention(this.props)} >Solicitar atención</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

const mapStateToProps = ({ app }) => ({ app })

export default
    compose(
        withStyles(styles),
        connect(mapStateToProps, null)
    )(Attention)
