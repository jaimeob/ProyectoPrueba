'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
//import Cookies from 'next-cookies'
import Cookies from 'universal-cookie'
import * as loginAction from '../../modules/Login/loginAction'
import Router from 'next/router'
import Head from 'next/head'
// import Script from 'next/script'
// import {  NextScript } from 'next/document'
// import Script from 'next/script'



// Material UI
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import BannerBlock from '../../components/BannerBlock'
import BannerGridBlock from '../../components/BannerGridBlock'
import CarouselBlock from '../../components/CarouselBlock'
import TextBlock from '../../components/TextBlock'
import GridBlock from '../../components/GridBlock'
import BenefitBlock from '../../components/BenefitBlock'
import NewsletterBlock from '../../components/NewsletterBlock'
import BannerCountdown from '../../components/BannerCountdown'
import ProductsBlock from '../../components/ProductsBlock'
import Utils from '../../resources/Utils'
// import  from '../../resources/scripts/retailrocket/mainTrackingCode'

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
  },
  containerLanding: {
    width: 1380,
    margin: '0 auto',
    ['@media (max-width: 1450px)']: {
      width: 1170
    },
    ['@media (max-width: 1200px)']: {
      width: 1080
    },
    ['@media (max-width: 1100px)']: {
      width: 950
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: 0,
      width: '100%'
    }
  },
})

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      metadata: ''
    }
  }

  async componentWillMount() {
    
    let user = await Utils.getCurrentUser()
    this.setState({
      user: user
    })

    const metadata = await (Utils.getMetadata())
    try {
      const response = await Axios('https://api.ipify.org?format=json')
      const data = await response.data
      metadata.instance = this.props.app.data.uuid
      metadata.user = this.props.login
      metadata.ip = data.ip
      this.setState({
        metadata
      })
      return metadata
    } catch (error) {
      this.setState({
        metadata
      })
    }
  }

  render() {
    const { classes } = this.props
    const self = this
    console.log(this.props.blocks,"this.props.blocks -------------");
    return (
      <>
        <Head>
          {
            (
              (this.props.isLanding !== null && this.props.isLanding !== undefined && this.props.isLanding === true) ?
                <>
                  <link rel="canonical" href={(this.props.title !== undefined && !Utils.isEmpty(this.props.title) && this.props.title !== null) ? 'https://' + this.props.app.data.domain + '/marcas/' + (this.props.title).toLowerCase() : 'https://' + this.props.app.data.domain} />
                  <title>{(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle}</title>
                  <meta name="description" content={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? `Encuentra lo mejor de la marca ${(this.props.title).toLowerCase()}` : "Encuentra lo mejor de tu marca favorita."}></meta>
                  <meta property="og:title" content={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle} />
                  <meta property="og:description" content={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? `Encuentra lo mejor de la marca ${(this.props.title).toLowerCase()}` : "Encuentra lo mejor de tu marca favorita."} />
                  <meta property="og:url" content={(this.props.title !== undefined && !Utils.isEmpty(this.props.title) && this.props.title !== null) ? 'https://' + this.props.app.data.domain + '/marcas/' + (this.props.title).toLowerCase() : 'https://' + this.props.app.data.domain} />
                  <meta property="og:type" content="product-group" />
                  <meta property="og:image" content={this.props.app.data.configs.navbarLogo} />
                  <meta property="og:locale" content="es_MX" />
                  <meta property="twitter:title" content={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle} />
                  <meta property="twitter:description" content={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? `Encuentra lo mejor de la marca ${(this.props.title).toLowerCase()}` : "Encuentra lo mejor de tu marca favorita."} />
                  <meta property="twitter:url" content={(this.props.title !== undefined && !Utils.isEmpty(this.props.title) && this.props.title !== null) ? 'https://' + this.props.app.data.domain + '/marcas/' + (this.props.title).toLowerCase() : 'https://' + this.props.app.data.domain} />
                  <meta property="twitter:type" content="product-group" />
                  <meta property="og:image" content={this.props.app.data.configs.navbarLogo} />
                  <meta property="twitter:locale" content="es_MX" />
                  <meta name="robots" content="index, follow" />
                  <meta name="googlebot" content="noimageindex, noarchive" />
                </>
                :
                <>
                  <script
                    type='application/ld+json'
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": (this.props.app.data.configs.faviconTitle !== undefined && !Utils.isEmpty(this.props.app.data.configs.faviconTitle)) ? this.props.app.data.configs.faviconTitle : this.props.app.data.configs.faviconTitle,
                        "url": (this.props.app.data.domain !== undefined) ? ('https://' + this.props.app.data.domain) : ('https://' + this.props.app.data.domain),
                        "logo": (this.props.app.data.configs.navbarLogo !== undefined && this.props.app.data.configs.navbarLogo !== null) ? this.props.app.data.configs.navbarLogo : ""
                      })
                    }}
                  />
                  <title>{(this.props.app.data.configs.faviconTitle !== undefined && !Utils.isEmpty(this.props.app.data.configs.faviconTitle)) ? `${this.props.app.data.configs.faviconTitle}` : this.props.app.data.configs.faviconTitle}</title>
                  <meta name="description" content="Calzado para toda la familia, encontrara las mejores marcas como Nike, Adidas, Converse al mejor precio con compra segura y envio gratis."></meta>
                  <link id="meta-canonical" rel="canonical" href={(this.props.app.data.domain !== undefined) ? ('https://' + this.props.app.data.domain) : ('https://' + this.props.app.data.domain)} />
                  {/* OPEN GRAPH */}
                  <meta property="og:title" content={(this.props.app.data.configs.faviconTitle !== undefined && !Utils.isEmpty(this.props.app.data.configs.faviconTitle)) ? `${this.props.app.data.configs.faviconTitle}` : this.props.app.data.configs.faviconTitle} />
                  <meta property="og:description" content="Calzado para toda la familia, encontrara las mejores marcas como Nike, Adidas, Converse al mejor precio con compra segura y envio gratis." />
                  <meta property="og:url" content={(this.props.app.data.domain !== undefined) ? ('https://' + this.props.app.data.domain) : ('https://' + this.props.app.data.domain)} />
                  <meta property="og:type" content="website" />
                  <meta property="og:image" content={(this.props.app.data.configs.navbarLogo !== undefined && this.props.app.data.configs.navbarLogo !== null) ? this.props.app.data.configs.navbarLogo : ""} />
                  <meta property="og:locale" content="es_MX" />
                  {/* TWITTER */}
                  <meta property="twitter:title" content={(this.props.app.data.configs.faviconTitle !== undefined && !Utils.isEmpty(this.props.app.data.configs.faviconTitle)) ? `${this.props.app.data.configs.faviconTitle}` : this.props.app.data.configs.faviconTitle} />
                  <meta property="twitter:description" content="Calzado para toda la familia, encontrara las mejores marcas como Nike, Adidas, Converse al mejor precio con compra segura y envio gratis." />
                  <meta property="twitter:url" content={(this.props.app.data.domain !== undefined) ? ('https://' + this.props.app.data.domain) : ('https://' + this.props.app.data.domain)} />
                  <meta property="twitter:type" content="website" />
                  <meta property="og:image" content={(this.props.app.data.configs.navbarLogo !== undefined && this.props.app.data.configs.navbarLogo !== null) ? this.props.app.data.configs.navbarLogo : ""} />
                  {/* META ROBOTS */}
                  <meta property="twitter:locale" content="es_MX" />
                  <meta name="robots" content="index, follow" />
                </>
            )
          }
        </Head>

        <Grid container >
          <h1 style={{ display: 'none' }}>{(this.props.app.data.configs.faviconTitle !== undefined && !Utils.isEmpty(this.props.app.data.configs.faviconTitle)) ? `${this.props.app.data.configs.faviconTitle}` : this.props.app.data.configs.faviconTitle}</h1>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            {
              (this.props.blocks.length > 0) ?
                this.props.blocks.map(function (block, idx) {
                  if (block.blockTypeId === 1 && block.v !== undefined && block.v === '2.0') {
                    if (block.configs.fullWidth !== undefined && block.configs.fullWidth) {
                      return (
                        <div key={idx} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                          <TextBlock
                            configs={block.configs}
                          />
                        </div>
                      )
                    } else {
                      return (
                        <div key={idx} className={(self.props.fromCategory !== undefined && self.props.fromCategory) ? classes.containerLanding : classes.container} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                          <TextBlock
                            configs={block.configs}
                          />
                        </div>
                      )
                    }
                  }
                  else if (block.blockTypeId === 2 && block.v !== undefined && block.v === '2.0') {
                    if (block.configs.fullWidth !== undefined && block.configs.fullWidth) {
                      return (
                        <div key={idx}>
                          <GridBlock
                            configs={block.configs}
                          />
                        </div>
                      )
                    } else {
                      return (
                        <div className={(self.props.fromCategory !== undefined && self.props.fromCategory) ? classes.containerLanding : classes.container} key={idx}>
                          <GridBlock
                            configs={block.configs}
                          />
                        </div>
                      )
                    }
                  }
                  else if (block.blockTypeId === 3 && block.v !== undefined && block.v === '2.0') {
                    return (
                      <div key={idx} className={(self.props.fromCategory !== undefined && self.props.fromCategory) ? classes.containerLanding : classes.container} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                        <BannerGridBlock
                          configs={block.configs}
                        />
                      </div>
                    )
                  }
                  else if (block.blockTypeId === 4 && block.v !== undefined && block.v === '2.0') {
                    if (block.configs.fullWidth !== undefined && block.configs.fullWidth) {
                      return (
                        <div key={idx} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                          <BannerBlock
                            configs={block.configs}
                          />
                        </div>
                      )
                    } else {
                      return (
                        <div key={idx} className={(self.props.fromCategory !== undefined && self.props.fromCategory) ? classes.containerLanding : classes.container} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                          <BannerBlock
                            configs={block.configs}
                          />
                        </div>
                      )
                    }
                  }
                  else if (block.blockTypeId === 15 && block.v !== undefined && block.v === '2.0') {
                    if (block.configs.fullWidth !== undefined && block.configs.fullWidth) {
                      return (
                        <div key={idx}>
                          <CarouselBlock configs={block.configs} />
                        </div>
                      )
                    } else {
                      return (
                        <div key={idx} className={(self.props.fromCategory !== undefined && self.props.fromCategory) ? classes.containerLanding : classes.container}>
                          <CarouselBlock configs={block.configs} />
                        </div>
                      )
                    }
                  }
                  else if (block.blockTypeId === 17 && block.v !== undefined && block.v === '2.0') {
                    if (block.configs.fullWidth !== undefined && block.configs.fullWidth) {
                      return (
                        <div key={idx} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                          <BannerCountdown
                            configs={block.configs}
                          />
                        </div>
                      )
                    } else {
                      return (
                        <div key={idx} className={(self.props.fromCategory !== undefined && self.props.fromCategory) ? classes.containerLanding : classes.container} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                          <BannerCountdown
                            configs={block.configs}
                          />
                        </div>
                      )
                    }
                  }
                  else if (block.blockTypeId === 22 && block.v !== undefined && block.v === '2.0') {
                    if (block.configs.fullWidth !== undefined && block.configs.fullWidth) {
                      return (
                        <div key={idx} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                          <ProductsBlock
                            type="query"
                            configs={block}
                          />
                        </div>
                      )
                    } else {
                      return (
                        <div key={idx} className={(self.props.fromCategory !== undefined && self.props.fromCategory) ? classes.containerLanding : classes.container} style={{ paddingTop: (block.configs.paddingTop !== undefined) ? block.configs.paddingTop : 0, paddingBottom: (block.configs.paddingBottom !== undefined) ? block.configs.paddingBottom : 0 }}>
                          <ProductsBlock
                            type="query"
                            configs={block}
                          />
                        </div>
                      )
                    }
                  }
                  else {
                    return (
                      <div></div>
                    )
                  }
                })
                :
                ''
            }
            {
              (this.props.isLanding === undefined || !this.props.isLanding) ?
                <>
                  {
                    (this.state.user !== null) ?
                      <>
                        <div class={classes.container} style={{ marginTop: 24 }}>
                          <TextBlock configs={{
                            title: "Recomendaciones.",
                            message: "",
                            cta: null
                          }}
                          />
                          <ProductsBlock type="recomendations" />
                        </div>
                        <div class={classes.container} style={{ marginTop: 24 }}>
                          <TextBlock configs={{
                            title: "Vistos recientemente.",
                            message: "",
                            cta: null
                          }}
                          />
                          <ProductsBlock type="seen" />
                        </div>
                      </>
                      :
                      ''
                  }
                  <div class={classes.container} style={{ marginTop: 24 }}>
                    <BenefitBlock />
                  </div>
                  <div>
                    <NewsletterBlock
                      title="Newsletter."
                      description="Novedades, promociones, ofertas y mucho más. Déjanos tu correo electrónico."
                    />
                  </div>
                </>
                :
                ''
            }
            {
              <Grid>
                {/* // 2 Personal product recommendations for the home page RETAIL ROCKET */}
                {(Utils.constants.CONFIG_ENV.UUID === '054b980b-6f4e-4d0c-8d53-1915be4abea2') ?
                  < div data-retailrocket-markup-block="613ba51e97a5251e74fdb4ef" >
                  </div> : null
                }
              </Grid>
            }
          </Grid>
        </Grid>

        {
          <Grid>
            {/* // 1. Exit intent bar */}
            <div data-retailrocket-markup-block="613ba4fd97a5251e74fdb4ee" ></div>

          </Grid>
        }
      </>
    )
  }
}

const mapStateToProps = ({ app, login }) => ({ app, login })

const mapDispatchToProps = {

}

export default compose(
  withStyles(styles),
  connect(mapStateToProps, mapDispatchToProps)
)(Home)
