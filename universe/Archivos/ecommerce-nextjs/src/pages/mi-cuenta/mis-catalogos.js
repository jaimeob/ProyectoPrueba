import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import CatalogComponent from '../../modules/Catalogs/catalogs'
import MainLayout from '../../modules/Layout/MainLayout'

class CatalogPage extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <>
            <MainLayout style={{ padding: '0px 0px' }}>
              <CatalogComponent />
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
)(CatalogPage)
