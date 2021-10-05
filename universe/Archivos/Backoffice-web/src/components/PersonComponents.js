import React, { useState } from 'react'
import { Grid, Typography } from '@material-ui/core'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { withTheme, withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    container: {
        background: 'white',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        paddingLeft: '15px',
        paddingTop: '20px',
        paddingBottom: '20px',
    }
    
})

function PersonComponent(props) {
    const { classes } = props
    return (
        <Grid container className={ classes.container } >
            <Grid item xs={12}>
                <Grid container style={{ display:'flex', justifyContent:'center', alignItems:'center' }} >
                    <Grid item xs={11}>
                        <Typography variant='subtitle1'>
                            {
                                (props.title !== null && props.title !== undefined) ?
                                    props.title
                                    :
                                    ''
                            }
                        </Typography>
                        <Typography variant='caption' style={ (props.subtitle === 'Activo') ? { color:'green' } : { color:'red' } } >
                            {
                                (props.subtitle !== null && props.subtitle !== undefined) ?
                                    props.subtitle
                                    :
                                    ''
                            }
                        </Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <ArrowForwardIcon></ArrowForwardIcon>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

// export default PersonComponent
export default withStyles(styles) (PersonComponent)