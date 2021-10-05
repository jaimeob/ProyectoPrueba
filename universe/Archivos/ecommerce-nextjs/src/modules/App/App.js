'use strict'

import React from 'react'
import { connect } from 'react-redux'
import { loadConfig } from '../../actions/actionApp'

class App extends React.Component {
  async componentDidMount() {
    this.props.loadConfig(this.props.data, this.props.tree)
    try {
      const response = await Axios('https://api.ipify.org?format=json')
      localStorage.setItem(Utils.constants.localStorage.IP, response.data.ip)
    } catch (err) {}
  }

  render() {
    return (
      <>
        {this.props.children}
      </>
    )
  }
}

const mapStateToProps = state => ({ ...state })

const mapDispatchToProps = {
  loadConfig
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
