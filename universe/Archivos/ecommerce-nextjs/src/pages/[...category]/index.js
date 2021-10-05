'use strict'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from "recompose/compose"
import MainLayout from '../../modules/Layout/MainLayout'
import CategoryExplorer from '../../modules/CategoryExplorerNew/categoryExplorerViewNew'
import NotFound from '../../modules/NotFound/notFound'
import Utils from '../../resources/Utils'
import Axios from 'axios'
import Head from 'next/head'
import { useRouter } from 'next/router'

// Material UI
import { withStyles } from '@material-ui/core/styles'
import ProductPageView from '../../modules/ProductPage/productPageView'

const styles = theme => ({
  container: {
    marginTop: 164,
    [theme.breakpoints.down('md')]: {
      marginTop: 190
    },
    [theme.breakpoints.down('sm')]: {
      marginTop: 178
    }
  }
})

class Category extends Component {

  constructor(props) {
    super(props)
    this.state = {
      actualUrl: null
    }

    this.getActualUrl = this.getActualUrl.bind(this)
  }

  getActualUrl() {
    const { url } = this.props
    let actual = ""

    if (url !== null && url !== undefined && url.length > 0) {
      url.map((u, idx) => {
        if (url.length - 1 === idx) {
          actual = actual + u
        } else {
          actual = actual + u + '/'
        }
      })
      this.setState({
        actualUrl: actual
      })
    }
  }

  componentWillMount() {
    this.getActualUrl()
  }

  render() {
    const { classes } = this.props
    console.log('INDEX CATEGORY')
    return (
      <>
        <Head>
          
          <link rel="canonical" href={(this.props.url !== undefined) ? 'https://' + this.props.app.data.domain + '/' + this.state.actualUrl : 'https://' + this.props.app.data.domain} />
          <title>{(this.props.title !== undefined && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle}</title>
          <meta name="description" content="Calzado para toda la familia, encontrara las mejores marcas como Nike, Adidas, Converse al mejor precio con compra segura y envio gratis."></meta>
          <meta property="og:title" content={(this.props.app.data.configs.faviconTitle !== undefined && !Utils.isEmpty(this.props.app.data.configs.faviconTitle)) ? `${this.props.app.data.configs.faviconTitle}` : this.props.app.data.configs.faviconTitle} />
          <meta property="og:description" content="Calzado para toda la familia, encontrara las mejores marcas como Nike, Adidas, Converse al mejor precio con compra segura y envio gratis." />
          <meta property="og:url" content={(this.props.app.data.domain !== undefined) ? 'https://' + this.props.app.data.domain + '/' + this.state.actualUrl : 'https://' + this.props.app.data.domain} />
          <meta property="og:type" content="product-group" />
          <meta property="og:image" content={this.props.app.data.configs.navbarLogo} />
          <meta property="og:locale" content="es_MX" />
          <meta property="twitter:title" content={(this.props.app.data.configs.faviconTitle !== undefined && !Utils.isEmpty(this.props.app.data.configs.faviconTitle)) ? `${this.props.app.data.configs.faviconTitle}` : this.props.app.data.configs.faviconTitle} />
          <meta property="twitter:description" content="Calzado para toda la familia, encontrara las mejores marcas como Nike, Adidas, Converse al mejor precio con compra segura y envio gratis." />
          <meta property="twitter:url" content={(this.props.app.data.domain !== undefined && this.state.actualUrl !== null && this.state.actualUrl !== undefined) ? 'https://' + this.props.app.data.domain + '/' + this.state.actualUrl : 'https://' + this.props.app.data.domain} />
          <meta property="twitter:type" content="product-group" />
          <meta property="og:image" content={this.props.app.data.configs.navbarLogo} />
          <meta property="twitter:locale" content="es_MX" />
          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="noimageindex, noarchive" />
        </Head>
        <h1 style={{ display: 'none' }}>{(this.props.title !== undefined && !Utils.isEmpty(this.props.title)) ? this.props.title : this.props.app.data.configs.faviconTitle}</h1>
        {this.props.app.data !== null ?
          <MainLayout
            title={this.props.title}
            description={this.props.description}
            url={this.props.url}
          >
            {
              (!this.props.notFound) ?
                <>
                  {
                    (this.props.isProduct) ?
                      <div className={classes.container}>
                        <ProductPageView
                          breadcrumbs={this.props.breadcrumbs}
                          product={this.props.product}
                          configs={this.props.configs}
                        />
                      </div>
                      :
                      <>
                        {
                          (this.props.isLanding) ?
                            <div className={classes.container} style={{ background: '#f4f4f4' }}>
                              <CategoryExplorer
                                category={this.props.category}
                                showProducts={this.props.showProducts}
                                breadcrumbs={this.props.breadcrumbs}
                                blocks={this.props.blocks}
                                filters={this.props.filters}
                                products={this.props.products}
                                page={this.props.page}
                                limit={this.props.limit}
                                offers={this.props.offers}
                                points={this.props.points}
                                orderBy={this.props.orderBy}
                              />
                            </div>
                            :
                            <>
                              {
                                (this.props.products !== undefined && this.props.products !== null && this.props.products.length > 0) ?
                                  <div className={classes.container} style={{ background: '#f4f4f4' }}>
                                    <CategoryExplorer
                                      category={this.props.category}
                                      showProducts={this.props.showProducts}
                                      breadcrumbs={this.props.breadcrumbs}
                                      blocks={this.props.blocks}
                                      filters={this.props.filters}
                                      products={this.props.products}
                                      page={this.props.page}
                                      limit={this.props.limit}
                                      offers={this.props.offers}
                                      points={this.props.points}
                                      orderBy={this.props.orderBy}
                                    />
                                  </div>
                                  :
                                  <div className={classes.container}>
                                    <NotFound />
                                  </div>
                              }
                            </>
                        }
                      </>
                  }
                </>
                :
                <div className={classes.container}>
                  <NotFound />
                </div>
            }
          </MainLayout>
          : null}
      </>
    )
  }
}

export async function getServerSideProps({ query }) {
  console.log("[index]");
  const LIMIT = 24
  if (query.category[query.category.length - 1] === 'favicon.ico') { return }
  let isProduct = false
  /*
  Revisar si el usuario intenta buscar un producto
  */
  try {
    let split = query.category[query.category.length - 1].split('-')
    if (split.length !== 0) {
      let code = split[split.length - 1]

      let checkProduct = await Axios({
        method: 'GET',
        url: Utils.constants.CONFIG_ENV.HOST_API + '/products/' + code + '/check',
        headers: {
          uuid: Utils.constants.CONFIG_ENV.UUID
        }
      })

      if (checkProduct.error) {
        console.log(checkProduct.error)
        throw 'Error'
      } else {
        checkProduct = await checkProduct
        // console.log(checkProduct)
        if (!checkProduct.data.exist) {
          throw 'No product'
        }
      }

      let filter = {
        where: {
          code: code
        },
        include: ['brand', 'detail']
      }

      let responseProduct = await Axios({
        method: 'GET',
        url: Utils.constants.CONFIG_ENV.HOST_API + '/products/findOne?filter=' + JSON.stringify(filter),
        headers: {
          uuid: Utils.constants.CONFIG_ENV.UUID
        }
      })

      if (responseProduct.error) {
        console.log(responseProduct.error)
        throw 'Error'
      }

      responseProduct = await responseProduct

      if (responseProduct.status === Utils.constants.status.SUCCESS && responseProduct.data.code !== undefined) {
        isProduct = true

        let responseBlocks = await Axios({
          method: 'GET',
          url: Utils.constants.CONFIG_ENV.HOST_API + '/blocks?filter=' + JSON.stringify({
            where: {
              blockTypeId: 7,
              status: 1
            },
            order: "order ASC"
          })
        })

        let responseDifColors = await Axios({
          method: 'GET',
          url: Utils.constants.CONFIG_ENV.HOST_API + '/products?filter=' + encodeURIComponent(JSON.stringify({
            where: {
              modelCode: responseProduct.data.modelCode,
              brandCode: responseProduct.data.brandCode,
              sublineCode: responseProduct.data.sublineCode
            },
            include: ['color', 'brand']
          }))
        })

        let colorIdx = 0

        responseDifColors.data.forEach((product, idx) => {
          if (product.color !== undefined) {
            if (product.color.code === responseProduct.data.colorCode) {
              colorIdx = idx
            }
          }
        })

        responseProduct.data.photos.forEach((image, idx) => {
          responseProduct.data.photos[idx].selected = false
        })
        responseProduct.data.photos[0].selected = true

        let breadcrumbs = await Axios({
          method: 'GET',
          url: Utils.constants.CONFIG_ENV.HOST_API + '/products/' + responseProduct.data.categoryCode + '/breadcrumbs'
        })

        breadcrumbs = await breadcrumbs
        if (breadcrumbs.error) {
          console.log(breadcrumbs.error)
          throw 'Error'
        }

        breadcrumbs.data.push({
          code: responseProduct.data.code,
          description: responseProduct.data.detail.title,
          url: responseProduct.data.url
        })

        return {
          props: {
            url: query.category,
            notFound: false,
            breadcrumbs: breadcrumbs.data || [],
            title: responseProduct.data.detail.title,
            isProduct: isProduct,
            product: responseProduct.data,
            configs: {
              colors: responseDifColors.data,
              blocks: responseBlocks.data,
              colorIdx: colorIdx
            }
          }
        }
      }
    }
  } catch (err) {
    isProduct = false
  }

  // Sino está buscando un producto, intenta buscar una categoría
  try {
    let isLanding = false

    if (!isProduct) {
      // Check si es landing y muestra productos
      let dataLandingBlocks = []
      let title = ''
      let description = ''
      let showProducts = true

      let bcString = ''
      if (query.category[0].toLowerCase() !== 'todos') {
        query.category.forEach(b => {
          bcString += '/' + b
        })
      } else {
        bcString = '/todos'
      }

      if (!Utils.isEmpty(title)) {
        title = title.split('-').join(' ').split('/').join(' ')
      }

      let filterLandingBlocks = {
        where: {
          url: bcString
        }
      }

      let responseLandingBlocks = await Axios(Utils.constants.CONFIG_ENV.HOST + '/api/landings/blocks?filter=' + JSON.stringify(filterLandingBlocks), { headers: { uuid: Utils.constants.CONFIG_ENV.UUID } })

      if (responseLandingBlocks.error) {
        console.log(responseLandingBlocks.error)
        throw 'Error'
      }

      let responseDataBlocks = await responseLandingBlocks.data

      if (responseDataBlocks.status) {
        isLanding = true
        dataLandingBlocks = responseDataBlocks.blocks
        title = responseDataBlocks.title || ''
        description = responseDataBlocks.description || ''
        showProducts = (responseDataBlocks.showProducts !== undefined) ? responseDataBlocks.showProducts : true
      } else {
        isLanding = false
      }

      if (showProducts) {
        let categoryId = null
        if (query.category[0].toLowerCase() !== 'todos') {
          let responseCategory = await Axios({
            method: 'POST',
            url: Utils.constants.CONFIG_ENV.HOST_API + '/categories/transform',
            data: {
              url: query.category
            },
            headers: {
              uuid: Utils.constants.CONFIG_ENV.UUID
            }
          })

          responseCategory = await responseCategory

          if (responseCategory.error) {
            console.log(responseCategory.error)
          } else {
            categoryId = responseCategory.data.categoryId
          }
        }

        let data = {
          pg: 0,
          u: (query.category[0].toLowerCase() !== 'todos') ? query.category[query.category.length - 1] : null,
          l: LIMIT,
          c: categoryId,
          br: [],
          sc: [],
          b: [],
          a: [],
          s: [],
          p: [],
          g: [],
          o: false,
          bp: false,
          ob: ''
        }

        // Revisar si viene un filtro aplicado
        let filter = ''
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

        if (response.error) {
          console.log(response.error)
          throw 'Error'
        }

        let page = 0
        let offers = false
        let points = false
        let orderBy = ''

        let products = await response.data

        let breadcrumbs = []
        if (categoryId !== null) {
          let responseBreadcrumbs = await Axios({
            method: 'GET',
            url: Utils.constants.CONFIG_ENV.HOST_API + '/products/' + categoryId + '/breadcrumbs'
          })
          responseBreadcrumbs = await responseBreadcrumbs
          if (responseBreadcrumbs.error) {
            console.log(responseBreadcrumbs.error)
            throw 'Error'
          } else {
            breadcrumbs = responseBreadcrumbs.data
          }
        }

        if (query.category[0].toLowerCase() !== 'todos') {
          breadcrumbs.forEach((b, idx) => {
            title += b.description
            if (breadcrumbs.length - 1 !== idx) {
              title += ' > '
            }
          })
        }

        if (!Utils.isEmpty(title)) {
          title = title.split('-').join(' ').split('/').join(' ')
        }

        if (query.csa !== undefined) {
          filter = JSON.parse(Utils.decode(query.csa))
          page = filter.pg
          offers = filter.o
          if (filter.bp !== undefined) {
            points = filter.bp
          }
          orderBy = filter.ob
          delete filter.pg
          delete filter.l
          delete filter.ob
        } else {
          filter = {
            u: (query.category[0].toLowerCase() !== 'todos') ? query.category[query.category.length - 1] : null,
            c: categoryId,
            br: [],
            sc: [],
            b: [],
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

        if (responseFilters.error) {
          console.log(responseFilters.error)
          throw 'Error'
        }

        let filters = await responseFilters.data
        filters.genders = []

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

        return {
          props: {
            url: query.category,
            notFound: false,
            category: categoryId,
            breadcrumbs: breadcrumbs,
            title: title,
            description: description,
            isLanding: isLanding,
            showProducts: (products.length > 0) ? true : false,
            isProduct: false,
            products: products,
            blocks: dataLandingBlocks,
            filters: filters,
            page: page,
            limit: LIMIT,
            offers: offers,
            points: points,
            orderBy: orderBy
          }
        }
      } else {
        return {
          props: {
            url: query.category,
            notFound: false,
            category: null,
            breadcrumbs: [],
            title: title,
            description: description,
            isLanding: isLanding,
            showProducts: showProducts,
            isProduct: false,
            products: [],
            blocks: dataLandingBlocks,
            filters: null,
            page: 0,
            limit: LIMIT,
            offers: false,
            points: false,
            orderBy: ''
          }
        }
      }
    } else {
      return {
        props: {
          notFound: true
        }
      }
    }
  } catch (err) {
    return {
      props: {
        notFound: true
      }
    }
  }
}

const mapStateToProps = ({ app }) => ({ app })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(Category)
