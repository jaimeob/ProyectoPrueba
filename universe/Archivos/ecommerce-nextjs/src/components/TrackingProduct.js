import React, { useState } from 'react'
// Material UI
import { withStyles } from '@material-ui/core/styles'
import { Grid, Icon, Typography, Hidden, Button } from '@material-ui/core'
import showTracking from './modals/TrackingOrder'

const styles = theme => ({
    text: {
        fontSize: 12,
    }
})

function TrackingProduct({ classes }) {
    const showModal = () => {
        showTracking(classes)
    }

    return <React.Fragment >
        <a style={{ textDecoration: 'none', cursor: 'pointer'}} onClick={showModal}>
            <Hidden xsDown >
                <Hidden mdDown>
                    <div style={{display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
                        <Icon style={{width: 24, height: 24, color: '#243B7A', marginRight: 8}}>search</Icon>
                        <Typography className={classes.text} variant="body1" align="center">Rastrear</Typography>
                    </div>
                </Hidden>
                <Hidden lgUp>
                    <div style={{display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
                        <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center'}}>
                            <Icon style={{width: 24, height: 24, color: '#243B7A', marginRight: 8}}>search</Icon>
                        </div>
                        <Typography className={classes.text} variant="body1" align="center">Rastrear</Typography>
                    </div>
                </Hidden>
            </Hidden>
            <Hidden smUp>
                <div style={{ cursor: 'pointer', paddingBottom: 4, textAlign: 'center', borderTop: '1px solid #EAF0FC', background: '#EAF0FC' }}>
                    <Typography variant="body1" style={{fontSize: 13}}>Rastrear</Typography>
                </div>
            </Hidden>
        </a>
    </React.Fragment>
}

export default withStyles(styles)(TrackingProduct);