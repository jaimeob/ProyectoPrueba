'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import MainLayout from '../../modules/Layout/MainLayout'
import Axios from 'axios'
import Utils from '../../resources/Utils'
import CategoryExplorer from '../../modules/CategoryExplorerNew/categoryExplorerViewNew'
import Head from 'next/head'

import NotFound from '../../modules/NotFound/notFound'
import { LOGIN_INIT_SESSION } from '../../modules/Login/types'

class BrandPage extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <>
        <Head>
          <link rel="canonical" href={(this.props.title !== undefined && !Utils.isEmpty(this.props.title) && this.props.title !== null) ? 'https://' + this.props.app.data.domain + '/marcas/' + (this.props.title).toLowerCase() : 'https://' + this.props.app.data.domain} />
          <title>{(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle}</title>
          <meta name="description" content={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? `Encuentra lo mejor de la marca ${(this.props.title).toLowerCase()}` : "Encuentra lo mejor de tu marca favorita."}></meta>
          <meta property="og:title" content={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle} />
          <meta property="og:description" content={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? `Encuentra lo mejor de la marca ${(this.props.title).toLowerCase()}` : "Encuentra lo mejor de tu marca favorita."} />
          <meta property="og:url" content={(this.props.title !== undefined && !Utils.isEmpty(this.props.title) && this.props.title !== null) ? 'https://' + this.props.app.data.domain + '/marcas/' + (this.props.title).toLowerCase() : 'https://' + this.props.app.data.domain} />
          <meta property="og:type" content="product-group" />
          <meta property="og:image" content={this.props.app.data.configs.navbarLogo} />
          <meta property="og:locale" content="es_MX" />
          <meta property="twitter:title" content={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle} />
          <meta property="twitter:description" content={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? `Encuentra lo mejor de la marca ${(this.props.title).toLowerCase()}` : "Encuentra lo mejor de tu marca favorita."} />
          <meta property="twitter:url" content={(this.props.title !== undefined && !Utils.isEmpty(this.props.title) && this.props.title !== null) ? 'https://' + this.props.app.data.domain + '/marcas/' + (this.props.title).toLowerCase() : 'https://' + this.props.app.data.domain} />
          <meta property="twitter:type" content="product-group" />
          <meta property="og:image" content={this.props.app.data.configs.navbarLogo} />
          <meta property="twitter:locale" content="es_MX" />
          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="noimageindex, noarchive" />
        </Head>
        <h1 style={{ display: 'none' }}>{(this.props.title !== undefined && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle}</h1>
        {
          this.props.app.data !== null && !this.props.error ?
            <MainLayout title={this.props.title} description={this.props.description} style={{ padding: '0px 0px' }}>
              <CategoryExplorer
                isBrand={this.props.isBrand}
                breadcrumbs={this.props.breadcrumbs}
                showProducts={this.props.showProducts}
                blocks={this.props.blocks}
                buttons={this.props.buttons}
                filters={this.props.filters}
                products={this.props.products}
                page={this.props.page}
                limit={this.props.limit}
                offers={this.props.offers}
                points={this.props.points}
                orderBy={this.props.orderBy}
                title={(this.props.title !== undefined && this.props.title !== null && !Utils.isEmpty(this.props.title)) ? this.props.title : null}
              />
            </MainLayout>
            :
            <MainLayout title={this.props.title} style={{ padding: '0px 0px' }}>
              <NotFound />
            </MainLayout>
        }
      </>
    )
  }
}

export async function getServerSideProps({ query }) {
  console.log("[brand]");
  let title = query.brand.toUpperCase()
  let description = ''

  let error = false

  let data = {
    pg: 0,
    l: 50,
    u: null,
    c: null,
    bc: null,
    br: [],
    sc: [],
    b: [],
    a: [],
    s: [],
    p: [],
    g: [],
    o: false,
    ob: ''
  }
  let brandGuion = query.brand
  let brandName = query.brand.split('-').join(' ')
  brandName = brandName.toUpperCase()
  let filter = {
    where: {
      name: brandName
    }
  }
  try {
    let responseBrand = null
    try {
      responseBrand = await Axios({
        method: 'GET',
        url: Utils.constants.CONFIG_ENV.HOST_API + '/brands/findOne?filter=' + JSON.stringify(filter),
        headers: {
          uuid: Utils.constants.CONFIG_ENV.UUID
        }
      })
    } catch (error) {
      filter.where.name = brandGuion.toUpperCase()
      responseBrand = await Axios({
        method: 'GET',
        url: Utils.constants.CONFIG_ENV.HOST_API + '/brands/findOne?filter=' + JSON.stringify(filter),
        headers: {
          uuid: Utils.constants.CONFIG_ENV.UUID
        }
      })
    }

    let brand = await responseBrand.data
    data.b = [brand.code]
  } catch (err) {
    console.log(err)
    console.log('BRANDS_ERROR')
    error = true
  }

  // Revisar si viene un filtro aplicado
  filter = ''
  if (query.csa !== undefined) {
    filter = query.csa
  } else {
    filter = Utils.encode(JSON.stringify(data))
    filter = JSON.stringify(filter)
  }

  let response = await Axios({
    method: 'GET',
    url: Utils.constants.CONFIG_ENV.HOST_API + '/products/filter?filter=' + filter,
    headers: {
      uuid: Utils.constants.CONFIG_ENV.UUID
    }
  })
  let page = 0
  let limit = 50
  let offers = false
  let points = false
  let orderBy = ''

  let products = await response.data

  if (query.csa !== undefined) {
    filter = JSON.parse(Utils.decode(query.csa))
    filter.b = data.b
    page = filter.pg
    offers = filter.o
    points = filter.bp
    orderBy = filter.ob
    delete filter.pg
    delete filter.l
    delete filter.ob
  } else {
    filter = {
      u: null,
      c: null,
      bc: null,
      br: [],
      sc: [],
      b: data.b,
      a: [],
      s: [],
      g: [],
      p: [],
      o: false,
      bp: false
    }
  }

  let responseFilters = await Axios({
    method: 'POST',
    url: Utils.constants.CONFIG_ENV.HOST_API + '/products/filters',
    data: {
      data: filter
    },
    headers: {
      uuid: Utils.constants.CONFIG_ENV.UUID
    }
  })

  let filters = await responseFilters.data

  filters.genders.forEach((gender) => {
    gender.checked = false
    filter.g.forEach(item => {
      if (Number(item) === gender.id) {
        gender.checked = true
      }
    })
  })

  filters.brands.forEach((brand) => {
    brand.description = brand.name
    brand.checked = false
    filter.b.forEach(item => {
      if (item === brand.code) {
        brand.checked = true
      }
    })
  })

  filters.sizes.forEach((size) => {
    size.checked = false
    filter.s.forEach(item => {
      if (item === size.value) {
        size.checked = true
      }
    })
  })

  filters.attributes.forEach((attribute) => {
    attribute.checked = false
    filter.a.forEach(item => {
      if (item === attribute.code) {
        attribute.checked = true
      }
    })
  })

  filters.prices.forEach((price) => {
    price.checked = false
    filter.p.forEach(item => {
      if (item.split('|')[0] === price.min) {
        price.checked = true
      }
    })
  })

  let dataLandingBlocks = []
  let filterLandingBlocks = {
    where: {
      url: '/marcas/' + query.brand.toUpperCase(),
      status: true
    }
  }
  let responseLandingBlocks = await Axios(Utils.constants.CONFIG_ENV.HOST + '/api/landings/blocks?filter=' + JSON.stringify(filterLandingBlocks), { headers: { uuid: Utils.constants.CONFIG_ENV.UUID } })

  if (responseLandingBlocks.error) {
    throw 'Error'
  }
  let showProducts = true
  let responseDataBlocks = await responseLandingBlocks.data
  if (responseDataBlocks.status) {
    dataLandingBlocks = responseDataBlocks.blocks
    title = title
    description = responseDataBlocks.description || ''
    showProducts = (responseDataBlocks.showProducts !== undefined) ? responseDataBlocks.showProducts : true
  }

  return {
    props: {
      error: error,
      showProducts: showProducts,
      isBrand: true,
      title: title,
      description: description,
      blocks: dataLandingBlocks,
      breadcrumbs: null,
      products: products,
      filters: filters,
      buttons: [],
      page: page,
      limit: limit,
      offers: offers,
      points: points,
      orderBy: orderBy
    }
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  connect(mapStateToProps, null)
)(BrandPage)
