'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

//Material UI
import { withStyles } from '@material-ui/core/styles'
import { Typography, Grid } from '@material-ui/core'

import TextBlock from '../../components/TextBlock'
import BenefitBlock from '../../components/BenefitBlock'
import NewsletterBlock from '../../components/NewsletterBlock'

const styles = theme => ({
  container: {
    width: 1170,
    margin: '0 auto',
    ['@media (max-width: 1200px)']: {
      width: 1080
    },
    ['@media (max-width: 1100px)']: {
      width: 950
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
})

class BrandIndexView extends Component {
  render() {
    const { classes } = this.props
    return (
    <>
      <Grid container className={classes.container} >
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ padding: 16, textAlign: 'center' }}>
          <TextBlock configs={{
            title: "Encuentra tu marca.",
            message: "Las mejores marcas están en " + this.props.app.data.alias + ".",
            cta: null
          }}
          />
        </Grid>
        {
          this.props.index.map((node, idx) => {
            return (
              <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ padding: 16 }}>
                <Typography variant="h4" style={{ color: 'gray' }}>{node.key}</Typography>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {
                    node.brands.map(brand => {
                      return (
                        <li style={{ float:'left', marginRight: 8, marginTop: 8, padding: 8, borderRadius: 8, background: 'white', border: '1px solid #b4dce8' }}>
                          <a href={brand.url} style={{ color: '#3091E5', fontWeight: 500 }}>{brand.name} ( <strong style={{ color: '#ff3a3a', fontWeight: 800 }}>{brand.count}</strong> )</a>
                        </li>
                      )
                    })
                  }
                </ul>
              </Grid>
            )
          })
        }
      </Grid>
      <div className={classes.container} style={{ marginTop: 24 }}>
        <BenefitBlock />
      </div>
      <div>
        <NewsletterBlock
          title="Newsletter."
          description="Novedades, promociones, ofertas y mucho más. Déjanos tu correo electrónico."
        />
      </div>
    </>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(BrandIndexView)
