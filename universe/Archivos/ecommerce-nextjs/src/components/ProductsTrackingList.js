import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material
import { Grid, withStyles, Typography, Paper, Hidden } from '@material-ui/core'
import Utils from '../resources/Utils'

const styles = theme => ({
    iconLink: {
        color: theme.palette.primary.main
    },
    cantidad: {
        fontSize: '16px',
        [theme.breakpoints.down("xs")]: {
            fontSize: '14px',
        }
    },
    card: {
        padding: theme.spacing(2),
        margin: 10,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        display: 'block',
        justifyContent: 'center',
        alignItems: 'center',
        width: '95%',
    },
    changeSize: {
        cursor: 'pointer',
        color: '#49a7e9',
        fontSize: '13px',
        fontWeight: '600',
    },
    colorGray: {
        color: '#808080'
    },

    containerItemSelected: {
        margin: '5px',
        padding: '16px 16px 16px',
        borderRadius: '4px',
        border: 'solid 1px rgba(0, 131, 224, 0.35)',
        background: '#f7f8f9',
    },
    containerItem: {
        margin: '5px',
        padding: '16px 16px 16px',
        borderRadius: '4px',
        background: '#f7f8f9',
    },
    containerItemInfo: {
        margin: '5px',
        padding: '16px 16px 16px',
        borderRadius: '4px',
    },
    discount: {
        color: '#57aa64',
        fontSize: '18',
        [theme.breakpoints.down("xs")]: {
            fontSize: '10px',
        }
    },
    productColor: {
        fontSize: '16px',
        color: '#808080',
        [theme.breakpoints.down("xs")]: {
            fontSize: '14px',
        }
    },
    productEdit: {
        border: 'none',
        background: 'none',
        color: '#006fb9',
        cursor: 'pointer',
        fontSize: '14px',
        padding: '0px'
    },
    productImageMovil: {
        width: '100%',
        cursor: 'pointer',
        paddingTop: "27px"
    },
    productImage: {
        width: '100%',
        cursor: 'pointer',
    },
    productName: {
        fontSize: '18px',
        [theme.breakpoints.down("xs")]: {
            fontSize: '16px',
        }
    },
    productNameNew: {
        fontSize: '18px',
        color: '#111110',
        lineHeight: '1.5em',
        height: '1.5em',
        overflow: 'hidden',
        fontWeight: 'bold',
        //whiteSpace: 'nowrap',
        //textOverflow: 'ellipsis',
        width: '100%',
        [theme.breakpoints.down("xs")]: {
            fontSize: '14px',
        }
    },
    productSize: {
        fontSize: '16px',
        color: '#808080',
        [theme.breakpoints.down("xs")]: {
            fontSize: '12px',
        }
    },
    price: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'black',
    },
    priceNumber: {
        textDecoration: 'line-through',
        color: '#808080',
        [theme.breakpoints.down("xs")]: {
            fontSize: '10px',
        }

    },
    quitar: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        color: '#49a7e9',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
        [theme.breakpoints.down("xs")]: {
            top: 'auto',
            right: 'auto'
        }

    },
    subtotalCheckout: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '20px'

    },
    total: {
        fontSize: '16px',
        fontWeight: '500',
        [theme.breakpoints.down("md")]: {
            fontSize: '14px',
        }
    },
    container: {
        width: "90%",
        margin: "0 auto",
        paddingTop: 36,
        [theme.breakpoints.down("xs")]: {
            paddingTop: 36,
        },
        paddingBottom: 64,
    },
})

class ProductsTrackingList extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render() {
        const { classes } = this.props
        const self = this
        return (
            <div style={{ width: '100%', padding: '10px', marginBottom:'10px' }} >
                <Grid container>
                    {
                        (this.props.products != null || this.props.products != undefined) ?
                            this.props.products.map((product, index) => (
                                <Grid item xs={12}>
                                    <Grid container>
                                        <Grid item xs={2} style={{display:'flex', alignItems:'center' }} >
                                            {
                                                (product.productImage != null || product.productImage != undefined) ?
                                                    <div>
                                                        <img className={classes.productImage} src={product.productImage} onError={() => { this.setState({ imageWorking: false }) }}  ></img>
                                                        <br></br>

                                                    </div>
                                                    :
                                                    <img style={{ width: '90%' }} src={'/placeholder.svg'} alt=" " />
                                            }
                                        </Grid>
                                        <Grid item xs={9} style={{ marginLeft:'10px' }} >
                                            <Typography className={classes.productNameNew} >{product.productDescription}</Typography>
                                            <Typography variant='body2' className={classes.productSize} >Código: <span style={{ fontWeight: '600', color: 'black' }} >{product.productCode}</span></Typography>
                                            <Typography variant='body2' className={classes.productSize} >Talla: <span style={{ fontWeight: '600', color: 'black' }} > {product.size} </span></Typography>
                                            <Typography variant='body2' className={classes.productSize} >Subtotal: <span style={{ fontWeight: '600', color: 'black' }} > ${Utils.numberWithCommas(product.subtotal)} </span></Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            ))
                            :
                            ''
                    }
                </Grid>
            </div>
        )
    }
}
const mapStateToProps = ({ app }) => ({ app })
export default compose(withStyles(styles),connect(mapStateToProps, null))(ProductsTrackingList)