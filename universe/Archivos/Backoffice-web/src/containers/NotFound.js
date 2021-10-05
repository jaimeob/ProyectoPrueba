import React, { Component } from 'react'

import Title from '../components/Title'

// Utils
import Utils from '../resources/Utils'

class NotFound extends Component {

  componentDidMount() {
    window.scrollTo(0, 0)
  }
  
  render() {
    return (
      <div>
        <Title 
          title={Utils.messages.General.notFound}
        />
      </div>
    )
  }
}

export default (NotFound)
