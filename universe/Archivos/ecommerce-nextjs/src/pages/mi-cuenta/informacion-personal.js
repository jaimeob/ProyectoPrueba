import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import PersonalInformationComponent from '../../modules/PersonalInforamation/personalInforamation'
import MainLayout from '../../modules/Layout/MainLayout'

class PersonalInformationPage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <>
            <MainLayout style={{ padding: '0px 0px' }}>
              <PersonalInformationComponent />
            </MainLayout>
          </>
          :
          null
        }
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(PersonalInformationPage)
