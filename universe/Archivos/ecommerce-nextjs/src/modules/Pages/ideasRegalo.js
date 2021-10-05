import React, { Component } from 'react'
import { connect } from 'react-redux'

// Material UI
import { withStyles } from '@material-ui/core/styles'

// Utils
import Utils from '../../resources/Utils'
import { Typography, Grid } from '@material-ui/core'
import NewsletterBlock from '../../components/NewsletterBlock'
import BenefitBlock from '../../components/BenefitBlock'
import BannerCountdown from '../../components/BannerCountdown'
import BannerCarouselBlock from '../../components/BannerCarouselBlock'
import BannerBlock from '../../components/BannerBlock'

const styles = theme => ({
  container: {
    backgroundColor: '#E30715',
    width: '100%', margin: '0 auto',
    padding: 32,
    [theme.breakpoints.down('sm')]: {
      width: '100%', margin: '0 auto', textAlign: 'center'
    }
  },
  image: {
    width: 244, float: 'right', marginRight: 32,
    [theme.breakpoints.down('sm')]: {
      width: 244, float: 'none', marginRight: 0
    }
  },
  text: {
    color: 'white',
    paddingTop: 64,
    [theme.breakpoints.down('md')]: {
      paddingTop: 48,
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: 16,
    }
  },
  faqItem: {
    paddingTop: 16,
    paddingBottom: 16
  },
  faqTitle: {
    fontSize: 22,
    fontWeight: 100
  },
  trustContainer: {
    background: 'rgba(255, 255, 255, 1)',
    width: '100%',
    margin: '42px auto', padding: 0, listStyle: 'none', borderRadius: 5, textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      width: '100%'
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  trustLogo: {
    height: 42,
    margin: 8
  }
})


class BuenFin extends Component {
  componentDidMount() {
    Utils.scrollTop()
  }

  render() {
    const { classes } = this.props
    return (
      <>
        <Grid container>
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <BannerCountdown
              title=""
              configs={
                {
                  "banner": {
                    "main": "https://imgur.com/GS3OJY4.jpeg",
                    "responsive": "https://imgur.com/uYiJ22I.jpeg",
                    "mainFinishDate": "https://imgur.com/hdsOzvc.jpeg",
                    "responsiveFinishDate": "https://imgur.com/igKfzD1.jpeg"
                  },
                  "eventDate": "2020-12-24T00:00:00.000Z",
                  "cta": {
                    "link": "/todos?csa=eyJwZyI6MCwibCI6NTAsImMiOm51bGwsImJyIjpbXSwic2MiOltdLCJiIjpbXSwiYSI6W10sInMiOltdLCJwIjpbXSwiZyI6W10sIm8iOnRydWUsIm9iIjoiYmVzdE9mZmVyIn0=",
                    "type": "list",
                    "u": null,
                    "bc": null,
                    "csa": "eyJwZyI6MCwibCI6NTAsImMiOm51bGwsImJyIjpbXSwic2MiOltdLCJiIjpbXSwiYSI6W10sInMiOltdLCJwIjpbXSwiZyI6W10sIm8iOnRydWUsIm9iIjoiYmVzdE9mZmVyIn0=",
                    "code": null
                  }
                }
              }
            />
            <BannerCarouselBlock
              title=""
              description=""
              configs={
                {
                  "fixes": [ 
                    {
                      "image": "https://imgur.com/KLOdosG.jpeg",
                      "cta": {
                        "link": "/marcas/47-brand",
                        "type": "list",
                        "u": null,
                        "bc": [ 
                            "marcas", 
                            "47-brand"
                        ],
                        "csa": null,
                        "code": null
                      }
                    }, 
                    {
                      "image": "https://imgur.com/FcbNviY.jpeg",
                      "cta": {
                        "link": "/under-armour-1-368010-002-cubreboca-blk-ua-sports-mask-xch-gr-09ERP1",
                        "type": "product",
                        "u": null,
                        "bc": null,
                        "csa": null,
                        "code": "09ERP1"
                      }
                    }
                  ],
                  "banners": [ 
                    {
                      "image": "https://imgur.com/75NUGO7.gif",
                      "cta": {
                        "link": "/marcas/salomon",
                        "type": "list",
                        "u": null,
                        "bc": [ 
                            "marcas", 
                            "salomon"
                        ],
                        "csa": null,
                        "code": null
                      }
                    }
                  ]
                }
              }
            />
            <BannerBlock
              title=""
              description=""
              configs={
                {
                  "banner": {
                    "main": "https://imgur.com/A6N9Ctg.gif",
                    "responsive": "https://imgur.com/uoKO5xQ.gif"
                  },
                  "cta": {
                    "link": "https://www.monederoazul.com/",
                    "type": "webview",
                    "u": null,
                    "bc": null,
                    "csa": null,
                    "code": null
                  }
                }
              }
            />
          </Grid>
        </Grid>
        <div style={{ marginTop: 32 }}>
          <BenefitBlock
            title=""
            description=""
          />
        </div>
        <div>
          <ul className={classes.trustContainer}>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/amvo.svg" /></li>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/sellodeconfianza.svg" /></li>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/pci.svg" /></li>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/ssl.svg" /></li>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/oxxo.svg" /></li>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/paypal.svg" /></li>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/mastercard.svg" /></li>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/visa.svg" /></li>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/amex.svg" /></li>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/credivale.svg" /></li>
            <li style={{ display: 'inline-block' }}><img className={classes.trustLogo} src="/monederoazul.svg" /></li>
          </ul>
        </div>
        <div style={{ marginTop: "0.1%" }}>
          <NewsletterBlock
            title="Te compartimos más ideas."
            description="En estas fechas especiales te compartimos las mejores ideas de regalo."
          />
        </div>
      </>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default connect(mapStateToProps, null)(withStyles(styles)(BuenFin))
