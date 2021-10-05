import React, { Component } from 'react'
import {connect} from 'react-redux'
import compose from "recompose/compose"
import AboutUs from '../modules/AboutUs/aboutUs'
import MainLayout from '../modules/Layout/MainLayout'

class nosotros extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  render() {

    return (
      <>
        {this.props.app.data!==null?
        <MainLayout style={{ padding: '48px 0px' }}>
            <AboutUs />
        </MainLayout>
        :null}
      </>
    )
  }
}

const mapStateToProps = ({app}) => ({app})

export default compose(
  connect(mapStateToProps, '')
)(nosotros)
