'use strict'

import React, { Component } from "react"
import compose from "recompose/compose"
import { withStyles } from "@material-ui/core/styles"


import Empty from '../components/Empty'
import ProductCardNew from '../components/ProductCardNew'

import Utils from "../resources/Utils"
import { requestAPI } from '../api/CRUD'

const styles = theme => ({
  scrollBar: {
    '&::-webkit-scrollbar': {
      width: '7px',
      height: '7px'
    },
    '&::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      'border-radius': '4px',
      'background-color': 'rgba(0,0,0,.5)',
      '-webkit-box-shadow': '0 0 1px hsla(0,0%,100%,.5)'
    }
  },
  productClass: {
    backgroundColor: 'white',
    marginRight: 8
  }
})

class ProductsBlock extends Component {
  constructor(props) {
    super(props)
    this.state = {
      configs: (this.props.type === 'query') ? this.props.configs.configs : {
        paddingTop: 12,
        marginTop: 12,
        withInformation: true,
      },
      isLoading: true,
      products: []
    }
    this.getProductsByQuery = this.getProductsByQuery.bind(this)
    this.getRecomentarionProducts = this.getRecomentarionProducts.bind(this)
    this.getSeenProducts = this.getSeenProducts.bind(this)
  }

  async componentWillMount() {
    if (this.props.type === 'query') {
      this.getProductsByQuery()
    } else if (this.props.type === 'recomendations') {
      this.getRecomentarionProducts()
    } else if (this.props.type === 'seen') {
      this.getSeenProducts()
    }
  }

  async getProductsByQuery() {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'POST',
      resource: 'users',
      endpoint: '/products/query',
      data: {
        query: this.props.configs.configs.query
      }
    })
    if (response.status === 200) {
      if (response.data !== undefined) {
        this.setState({
          isLoading: false,
          products: response.data
        })
      } else {
        this.setState({ isLoading: false })
      }
    } else {
      this.setState({ isLoading: false })
    }
  }

  async getRecomentarionProducts() {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/recomendation/products'
    })
    if (response.status === 200) {
      if (response.data !== undefined) {
        this.setState({
          isLoading: false,
          products: response.data
        })
      } else {
        this.setState({ isLoading: false })
      }
    } else {
      this.setState({ isLoading: false })
    }
  }

  async getSeenProducts() {
    let response = await requestAPI({
      host: Utils.constants.CONFIG_ENV.HOST,
      method: 'GET',
      resource: 'users',
      endpoint: '/seen/products'
    })
    if (response.status === 200) {
      if (response.data !== undefined) {
        this.setState({
          isLoading: false,
          products: response.data
        })
      } else {
        this.setState({ isLoading: false })
      }
    } else {
      this.setState({ isLoading: false })
    }
  }

  render() {
    const { classes } = this.props
    const self = this
    return (
      <>
        <div style={{ paddingTop: self.state.configs.paddingTop, paddingBottom: self.state.configs.paddingBottom, background: (Utils.isEmpty(self.state.configs.backgroundColor) ? 'none' : '#' + self.state.configs.backgroundColor) }}>
          <div className={classes.scrollBar} style={{ display: 'flex', justifyContent: 'start', width: '100%', overflowX: 'scroll' }}>
          {
            (!this.state.isLoading) ?
            <>
            {
              (this.state.products.length > 0) ?
              <>
              {
                this.state.products.map((product, index) => {
                  return (
                    <div className={classes.productClass} key={index}>
                      <ProductCardNew
                        sizeProductCard="normal"
                        data={product}
                        configs={this.state.configs}
                      />
                    </div>
                  )
                })
              }
              </>
              :
              <Empty />
            }
            </>
            :
            <Empty 
              isLoading={true}
            />
          }
          </div>
        </div>
      </>
    )
  }
}

export default compose(
  withStyles(styles)
)(ProductsBlock)
