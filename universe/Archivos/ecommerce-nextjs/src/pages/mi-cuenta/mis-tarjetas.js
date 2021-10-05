import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import Cards from '../../modules/Cards/cards'
import MainLayout from '../../modules/Layout/MainLayout'

class CardsPage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <>
            <MainLayout style={{ padding: '0px 0px' }}>
              <Cards />
            </MainLayout>
          </>
          : null}
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(CardsPage)
