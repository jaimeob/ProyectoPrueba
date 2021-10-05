import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import Account from '../../modules/MyAccount/myAccountDesign'
import MainLayout from '../../modules/Layout/MainLayout'

class MyAccountPage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <>
            <MainLayout style={{ padding: '0px 0px' }}>
              <Account />
            </MainLayout>
          </>
          : null}
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })
export default compose(connect(mapStateToProps, null))(MyAccountPage)
