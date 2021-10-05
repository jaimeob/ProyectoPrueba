"use strict"

import React, { Component } from "react"
import Link from "next/link"

// Material UI
import { withStyles } from "@material-ui/core/styles"
import { Grid, Typography, Icon, Button } from "@material-ui/core"

// Utils
import Utils from "../resources/Utils"
import { connect } from "react-redux"

const styles = (theme) => ({
  footer: {
    paddingBottom: 16,
    width: "100%",
    backgroundColor: theme.palette.footer.main,
    fontSize: 12,
    color: "#6A7688",
  },
  legalContainer: {
    padding: "24px 48px",
  },
  listContainer: {
    padding: 48,
    paddingTop: 24,
    [theme.breakpoints.down("sm")]: {
      paddingTop: 32,
    },
  },
  listTitle: {
    color: "white",
    fontSize: 24,
  },
  list: {
    margin: 0,
    padding: 0,
    marginTop: 16,
    listStyle: "none",
  },
  listItem: {
    padding: "6px 0px",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  listItemLink: {
    color: "white",
    fontSize: 14,
  },
  listItemDescription: {
    fontSize: 11,
    color: "white",
    opacity: 0.5,
  },
  social: {
    marginTop: 16,
    width: "100%",
  },
  socialIcon: {
    width: "20%",
    marginRight: "5%",
  },
  socialIconImage: {
    width: 24,
  },
  downloadApp: {},
  downloadAppIconImage: {
    width: "60%",
    margin: "12px 0px",
    [theme.breakpoints.down("md")]: {
      width: "80%",
    },
    [theme.breakpoints.down("sm")]: {
      width: "25%",
      marginRight: 32,
    },
    [theme.breakpoints.down("xs")]: {
      width: "45%",
    },
  },
  footerLogo: {
    padding: 0,
    marginBottom: 8,
    width: theme.sizes.sizeFooterLogo + "%",
    [theme.breakpoints.down("sm")]: {
      height: 32,
      width: "auto",
    },
  },
  footerText: {
    color: "white",
    fontSize: 12,
  },
  footerLink: {
    color: "white",
    fontSize: 10,
  },
  footerVersion: {
    color: "white",
    fontSize: 10,
  },
  trustContainer: {
    background: "rgba(255, 255, 255, 1)",
    width: "75%",
    margin: "0 auto",
    padding: 0,
    listStyle: "none",
    marginBottom: 24,
    borderRadius: 5,
    textAlign: "center",
    [theme.breakpoints.down("md")]: {
      width: "75%",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  trustLogo: {
    height: 26,
    margin: 8,
  },
})

class Footer extends Component {
  constructor(props) {
    super(props)
    var date = new Date()
    var year = date.getFullYear()
    this.year = year

    this.state = {
      iosAppLink: "",
      androidAppLink: "",
    }

    switch (props.app.data.id) {
      case 1:
        this.state.iosAppLink = "https://apps.apple.com/mx/app/calzzapato/id1276449293"
        this.state.androidAppLink = "https://play.google.com/store/apps/details?id=com.calzzapato&hl=es_MX"
        break
      case 2:
        this.state.iosAppLink = "https://apps.apple.com/mx/app/kelder/id1535865926"
        this.state.androidAppLink = "https://play.google.com/store/apps/details?id=mx.kelder"
        break
      case 3:
        this.state.iosAppLink = "https://apps.apple.com/mx/app/urbanna/id1538452227"
        this.state.androidAppLink = "https://play.google.com/store/apps/details?id=mx.urbanna&hl=es_MX"
        break
      case 4:
        this.state.iosAppLink = "https://apps.apple.com/mx/app/calzzasport/id1538281258"
        this.state.androidAppLink = "https://play.google.com/store/apps/details?id=com.calzzasport"
        break
      case 5:
        this.state.iosAppLink = "https://apps.apple.com/mx/app/calzakids/id1538452345"
        this.state.androidAppLink = "https://play.google.com/store/apps/details?id=mx.calzakids"
        break
    }
  }

  render() {
    const { classes } = this.props
    const { explore, support, download, about, social, copyright, terms, privacy } = this.props.app.data.langs.es.Footer
    return (
      <footer className={classes.footer}>
        <Grid container>
          <Grid item xs={12}>
            <Button color="secondary" aria-label="add an alarm" style={{ textTransform: "none", width: "100%", margin: 0, padding: 16 }} onClick={() => window.scrollTo(0, 0)}>
              <Typography style={{ color: "white", fontSize: 16 }}>Ir al inicio de la página</Typography>{" "}
              <Icon style={{ marginTop: 4, color: "white", fontSize: 24 }} fontSize="large">
                keyboard_arrow_up
              </Icon>
            </Button>
          </Grid>
          <Grid item md={3} className={classes.listContainer}>
            <Typography variant="h3" className={classes.listTitle}>
              {explore.title}
            </Typography>
            <ul className={classes.list}>
              {explore.options.map((item, i) => (
                <li className={classes.listItem} key={i}>
                  <Link href={item.cta}>
                    <a className={classes.listItemLink}>{item.title}</a>
                  </Link>
                </li>
              ))}
            </ul>
          </Grid>
          <Grid item md={3} className={classes.listContainer}>
            <Typography variant="h3" className={classes.listTitle}>
              {support.title}
            </Typography>
            <ul className={classes.list}>
              {support.options.map((item, i) => (
                <li className={classes.listItem} key={i}>
                  <a href={item.cta} className={classes.listItemLink}>
                    {item.title}
                    {item.subtitle !== "" ? (
                      <Typography variant="body2" className={classes.listItemDescription}>
                        {item.subtitle}
                      </Typography>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </Grid>
          <Grid item md={3} className={classes.listContainer}>
            <Typography variant="h3" className={classes.listTitle}>
              {download.title}
            </Typography>
            <div className={classes.downloadApp} style={{ marginTop: 24 }}>
              {/* {download.options.map((item, i) => (
                <a href={item.cta} target="_blank" rel="noopener noreferrer" key={i} className={classes.downloadAppIcon}>
                  <img className={classes.downloadAppIconImage} src={item.image} alt=""></img>
                </a>
              ))} */}
              <a href={this.state.iosAppLink} target="_blank" rel="noopener noreferrer" key={0} className={classes.downloadAppIcon}>
                <img className={classes.downloadAppIconImage} src={download.options[0].image} alt="Descarga app(aplicacion) calzzapato ios"></img>
              </a>
              <a href={this.state.androidAppLink} target="_blank" rel="noopener noreferrer" key={1} className={classes.downloadAppIcon}>
                <img className={classes.downloadAppIconImage} src={download.options[1].image} alt="Descarga app(aplicacion) calzzapato android"></img>
              </a>
            </div>
          </Grid>
          <Grid item md={3} className={classes.listContainer}>
            <Typography variant="h3" className={classes.listTitle}>
              {about.title}
            </Typography>
            <ul className={classes.list}>
              {about.options.map((item, i) =>
                !Utils.isExternalLink(item.cta) ? (
                  <li className={classes.listItem} key={i}>
                    <Link href={item.cta}>
                      <a className={classes.listItemLink}>{item.title}</a>
                    </Link>
                  </li>
                ) : (
                  <li className={classes.listItem} key={i}>
                    <Typography style={{ fontSize: 14, marginRight: 16 }} variant="body1">
                      <a style={{ color: "white" }} href={item.cta}>
                        {item.title}
                      </a>
                    </Typography>
                  </li>
                )
              )}
            </ul>
            <Typography variant="h5" className={classes.listTitle} style={{ marginTop: 24 }}>
              {social.title}
            </Typography>
            <div className={classes.social}>
              {social.options.map((item, i) => (
                <a href={item.cta} target="_blank" rel="noopener noreferrer" className={classes.socialIcon}>
                  <img className={classes.socialIconImage} src={item.image} alt={`Encuentra a ${this.props.app.data.alias} en tus redes sociales favoritas.`}></img>
                </a>
              ))}
            </div>
          </Grid>
        </Grid>
        <Grid container justify="center" alignItems="center" className={classes.legalContainer}>
          <Grid item lg={12} md={12} sm={12} xs={12}>
            <ul className={classes.trustContainer}>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/amvo.svg" alt="Asociación mexicana de venta online, compra seguro." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/sellodeconfianza.svg" alt="Asociación de internet MX, sello de confianza compra segura en linea." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/pci.svg" alt="PCI Security Standards Council, pago seguro y seguridad de datos." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/ssl.svg" alt="Protección de datos y conexión segura." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/oxxo.svg" alt="Pago seguro a través Oxxo." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/paypal.svg" alt="Pago seguro a través PayPal." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/mastercard.svg" alt="Pago seguro a través Mastecard." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/visa.svg" alt="Pago seguro a través Visa." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/amex.svg" alt="Pago seguro a través de American Express." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/credivale.svg" alt="Pago seguro a través de Credi Vale (Calzzapato)." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/monederoazul.svg" alt="Pago seguro a través de Monedero Azul (Calzzapato)." />
              </li>
              <li style={{ display: "inline-block" }}>
                <img className={classes.trustLogo} src="/openpay.png" alt="Pago seguro a través de Monedero Azul." />
              </li>
            </ul>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12} style={{ textAlign: "center" }}>
            <img id="footerLogo" className={classes.footerLogo} src={this.props.footerLogo} alt={this.props.name} />
            <Typography className={classes.footerText} variant="body1">
              © {this.year}{" "}
              <Link href={this.props.website}>
                <strong style={{ color: "white" }}>{this.props.name}</strong>
              </Link>{" "}
              {this.props.app.data.description} {copyright}
            </Typography>
            <Typography variant="body1" className={classes.footerText}>
              {this.props.address}
            </Typography>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12} style={{ textAlign: "center", marginTop: 4 }}>
            <Link href="/terminos">
              <a className={classes.footerLink} style={{ marginRight: 8, color: "white" }}>
                {terms}{" "}
              </a>
            </Link>
            <Link href="/privacidad">
              <a className={classes.footerLink} style={{ color: "white" }}>
                {" "}
                {privacy}
              </a>
            </Link>
          </Grid>
          <Grid item lg={12} md={12} sm={12} xs={12} style={{ textAlign: "center", marginTop: 4 }}>
            <Typography className={classes.footerVersion} variant="body1">
              v<a className={classes.footerLink}>{Utils.constants.version}</a>
            </Typography>
          </Grid>
        </Grid>
      </footer>
    )
  }
}

const mapStateToProps = (state) => ({ ...state })

export default connect(mapStateToProps, null)(withStyles(styles)(Footer))
