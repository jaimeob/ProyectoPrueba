'use strict'

import { Box, Grid, Typography } from '@material-ui/core'
import { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'

import MainLayout from '../modules/Layout/MainLayout'

class DescargaAppsPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      iosAppLink: '',
      androidAppLink: '',
      appIcon: '',
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.updateDimensions = this.updateDimensions.bind(this)

    switch (props.app.data.id) {
      case 1:
        this.state.iosAppLink = 'https://apps.apple.com/mx/app/calzzapato/id1276449293'
        this.state.androidAppLink = 'https://play.google.com/store/apps/details?id=com.calzzapato&hl=es_MX'
        this.state.appIcon = '/calzzapatoApp.png'
        break
      case 2:
        this.state.iosAppLink = 'https://apps.apple.com/mx/app/kelder/id1535865926'
        this.state.androidAppLink = 'https://play.google.com/store/apps/details?id=mx.kelder'
        this.state.appIcon = '/kelderApp.png'
        break
      case 3:
        this.state.iosAppLink = 'https://apps.apple.com/mx/app/urbanna/id1538452227'
        this.state.androidAppLink = 'https://play.google.com/store/apps/details?id=mx.urbanna&hl=es_MX'
        this.state.appIcon = '/urbannaApp.png'
        break
      case 4:
        this.state.iosAppLink = 'https://apps.apple.com/mx/app/calzzasport/id1538281258'
        this.state.androidAppLink = 'https://play.google.com/store/apps/details?id=com.calzzasport'
        this.state.appIcon = '/calzzasportApp.png'
        break
      case 5:
        this.state.iosAppLink = 'https://apps.apple.com/mx/app/calzakids/id1538452345'
        this.state.androidAppLink = 'https://play.google.com/store/apps/details?id=mx.calzakids'
        this.state.appIcon = '/calzzakidsApp.png'
        break
    }
  }

  updateDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight })
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions)
  }
  functioncomponentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions)
  }
  render() {
    return (
      <MainLayout>
        <Grid container style={{ paddingTop: 30, paddingBottom: 30, position: 'relative', zIndex: 2 }} alignItems='center' direction={this.state.width < 960 ? 'column-reverse' : 'row'}>
          <Grid container item xs={12} sm={12} md={4} lg={4} xl={4} justify={this.state.width < 960 ? 'center' : 'flex-end'}>
            <img src='/teardrop-dark-3@3x.png' height={525}></img>
          </Grid>
          {this.state.width < 960 ? <Box height={40}></Box> : ''}
          <Grid container item direction='column' xs={12} sm={12} md={8} lg={8} xl={8} alignItems='center' justify='center'>
            <img src={this.state.appIcon} width={95} height={95}></img>
            <Typography style={{ fontSize: 24, color: 'white' }}>
              <strong>Instala nuestra app</strong>
            </Typography>
            <Typography style={{ fontSize: 24, color: 'white' }} align='center'>
              Navega más fácil, rápido y seguro desde nuestra app
            </Typography>
            <Grid container item justify='center' spacing={8} style={{ marginTop: 40 }}>
              <Grid item>
                <a href={this.state.androidAppLink}>
                  <img src='/google-play-badge@3x.png' width={205} height={62}></img>
                </a>
              </Grid>
              <Grid item>
                <a href={this.state.iosAppLink}>
                  <img src='/download-on-the-app-store-badge-esmx-rgb-blk-100217@3x.png' width={179} height={60}></img>
                </a>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box
          height={176}
          width={'100%'}
          bgcolor={this.props.app.data.configs.primaryColor}
          style={{ position: 'relative', bottom: this.state.width < 960 ? (this.state.width < 460 ? 1020 : 860) : 410, zIndex: 1 }}
        ></Box>
      </MainLayout>
    )
  }
}
const mapStateToProps = ({ app }) => ({ app })

export default compose(connect(mapStateToProps, null))(DescargaAppsPage)
