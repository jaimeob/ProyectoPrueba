import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import Catalog from '../../../modules/Catalogs/catalog'
import MainLayout from '../../../modules/Layout/MainLayout'

class MyCatalog extends Component {
  render() {
    return (
      <>
        {this.props.app.data !== null ?
          <>
            <MainLayout style={{ padding: '0px 0px' }}>
              <Catalog id={this.props.id} />
            </MainLayout>
          </>
          : null}
      </>
    )
  }
}

const mapStateToProps = ({ app }) => ({ app })

export async function getServerSideProps({ query }) {
  return { props: { id: query.id }}
}


export default compose(connect(mapStateToProps, null))(MyCatalog)
