'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import Head from 'next/head'
import Navbar from '../../components/NavbarDesign'
import Footer from '../../components/Footer'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import Utils from '../../resources/Utils'
import CheckoutNavbar from '../../components/CheckoutNavbar'

const styles = theme => ({
  container: {
    marginTop: 163,
    [theme.breakpoints.down('md')]: {
      marginTop: 202
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 205
    }
  }
})

class MainLayout extends Component {
  render() {
    const { classes } = this.props
    return (
      <>
        { this.props.app !== null && this.props.app !== undefined && this.props.app.data !== undefined && this.props.app.data !== null ?
          <>
            {/* <Head>
              <title>{(this.props.title !== undefined && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle}</title>
              <meta name="description" content={(this.props.description !== undefined && !Utils.isEmpty(this.props.description)) ? this.props.description : this.props.app.data.configs.welcomeDescription}></meta>
              <link rel="canonical" href={(this.props.url !== undefined) ? ('https://' + this.props.app.data.domain + '/' + this.props.url) : ('https://' + this.props.app.data.domain)} />
              <meta property="og:title" content={(this.props.title !== undefined && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle} />
              <meta property="og:description" content={(this.props.description !== undefined && !Utils.isEmpty(this.props.description)) ? this.props.description : this.props.app.data.configs.welcomeDescription} />
              <meta property="og:url" content={(this.props.url !== undefined) ? ('https://' + this.props.app.data.domain + '/' + this.props.url) : ('https://' + this.props.app.data.domain)} />
              <meta property="og:type" content="website" />
              <meta property="og:locale" content="es_MX" />
              <meta property="og:image" content="" />
              <meta property="fb:app_id" content="website" />
              <meta property="og:site_name" content={this.props.app.data.alias} />
              <meta name="robots" content="noimageindex, noarchive" />
              <meta name="googlebot" content="noimageindex, noarchive" />
            </Head> */}
            {
              (this.props.checkout !== undefined && this.props.checkout) ?
                <CheckoutNavbar
                  showMenuButton={true}
                  navbarLogo={this.props.app.data.configs.navbarLogo}
                  mainTitle='Checkout'
                />
                :
                <Navbar
                  headband={null}
                  showMenuButton={false}
                  navbarLogo={this.props.app.data.configs.navbarLogo}
                  mainTitle={this.props.app.data.configs.mainTitle}
                />
            }
            {
              (this.props.mTop !== undefined) ?
                <div style={{ marginTop: this.props.mTop }}>
                  {this.props.children}
                </div>
                :
                <div className={classes.container}>
                  <div style={(this.props.style !== undefined) ? this.props.style : {}}>
                    {this.props.children}
                  </div>
                </div>
            }
            {
              (this.props.checkout === undefined) ?
                <Footer
                  footerLogo={this.props.app.data.configs.footerLogo}
                  name={this.props.app.data.name}
                  website={this.props.app.data.configs.website}
                  urlTerms={this.props.app.data.configs.urlTerms}
                  urlPrivacy={this.props.app.data.configs.urlPrivacy}
                  address={this.props.app.data.configs.address}
                />
                :
                ''
            }
          </>
          :
          ''
        }
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })
export default compose(withStyles(styles), connect(mapStateToProps, null))(MainLayout)
