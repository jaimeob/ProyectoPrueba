import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import NewPassword from '../modules/NewPassword/NewPasswordView'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const styles = theme => ({
  // + 36 headband
  container: {
    marginTop: 163 + 44,
    [theme.breakpoints.down('md')]: {
      marginTop: 190 + 44
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 178 + 44
    }
  }
})

class NewPasswordPage extends Component {
  render() {
    const { classes } = this.props
    return (
      <>
        {this.props.app.data !== null ?
          <>
            <Navbar
              headband={null}
              showMenuButton={false}
              navbarLogo={this.props.app.data.configs.navbarLogo}
              mainTitle={this.props.app.data.configs.mainTitle}
            />
            <div className={classes.container}>
              <NewPassword tokenNewPass={this.props.token} />
            </div>
            <Footer
              footerLogo={this.props.app.data.configs.footerLogo}
              name={this.props.app.data.name}
              website={this.props.app.data.configs.website}
              urlTerms={this.props.app.data.configs.urlTerms}
              urlPrivacy={this.props.app.data.configs.urlPrivacy}
              address={this.props.app.data.configs.address}
            />
          </>
          : null}
      </>
    )
  }
}
export async function getServerSideProps({ query }) {
  console.log("[nueva-contraseña]");
  return { props: { token: query.token } }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(NewPasswordPage)
