// Soporte a navegadores antiguos (IE)
import 'es6-promise/auto'
import '@babel/polyfill'
import './index.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

// Material UI
import { createMuiTheme } from '@material-ui/core/styles'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'

// Utils
import Utils from './resources/Utils'
import * as serviceWorker from './serviceWorker'
import store from './store'
import App from './App'

import axios from 'axios'

const filters = {
  where: {
    domain: document.domain,
    status: 1
  },
  include: ["configs"]
}

axios.get(Utils.constants.HOST_API + '/instances/findOne?filter=' + JSON.stringify(filters),
{headers: new Headers({
  "Access-Control-Allow-Origin": "*"
})}
)
.then(function(response) {
  initApp(response.data)
})
.catch(function(err) {
  console.log(err)
  if (Utils.checkLanguage() !== 'es') {
    document.title = 'Sorry!'
    ReactDOM.render(
      <div style={{textAlign: 'center', marginTop: 72}}>
      <h1>The web app could not be loaded.</h1>
      <p>Please try again later. Thank you!</p>
      </div>,
      document.getElementById('root')
      )
  }
  else {
    document.title = ''
    ReactDOM.render(
      <div style={{textAlign: 'center', marginTop: 72}}>
      <h1>No se ha podido cargar la aplicación.</h1>
      <p>Por favor intenta de nuevo más tarde. Gracias.</p>
      </div>,
      document.getElementById('root')
      )
  }
})

function initApp(instance) {
  if (Utils.checkLanguage() !== 'es') {
    Utils.messages = JSON.parse(instance.configs.en)
    localStorage.setItem('lang', JSON.stringify(JSON.parse(instance.configs.en)))
  }
  else {
    Utils.messages = JSON.parse(instance.configs.es)
    localStorage.setItem('lang', JSON.stringify(JSON.parse(instance.configs.es)))
  }
  
  localStorage.setItem(Utils.constants.localStorage.UUID, instance.uuid)

  document.title = instance.configs.faviconTitle
  let link = document.querySelector("link[rel*='icon']") || document.createElement('link')
  link.type = 'image/x-icon'
  link.rel = 'shortcut icon'
  link.href = instance.configs.favicon
  document.getElementsByTagName('head')[0].appendChild(link)

  const navbarColor = instance.configs.navbarBackgroundColor
  const mainFrame = instance.configs.backgroundColor
  const primaryColor = instance.configs.primaryColor
  const secondaryColor = instance.configs.secondaryColor
  const textMainColor = instance.configs.textMainColor
  const textSecondaryColor = instance.configs.textSecondaryColor

  let theme = createMuiTheme({
    typography: {
      useNextVariants: true,
      htmlFontSize: 16,
      fontFamily: "'Roboto', sans-serif",
      h1: {
        fontSize: 42,
        fontWeight: 700,
        color: textMainColor
      },
      body1: {
        fontSize: 16,
        fontWeight: 400,
        color: textSecondaryColor
      },
      body2: {
        fontSize: 16,
        fontWeight: 400
      }
    },
    sizes: {
      sizeLogo: instance.configs.sizeLogo,
      sizeNavbarLogo: instance.configs.sizeNavbarLogo,
      sizeFooterLogo: instance.configs.sizeFooterLogo
    },
    palette: {
      primary: {
        light: primaryColor + 20,
        main: primaryColor,
        dark: primaryColor - 20,
        contrastText: '#FFFFFF'
      },
      secondary: {
        light: secondaryColor + 20,
        main: secondaryColor,
        dark: secondaryColor - 20,
        contrastText: '#FFFFFF'
      },
      error: {
        main: '#FF5353'
      },
      frame: {
        main: mainFrame,
        secondary: 'white'
      },
      background: {
        main: navbarColor,
        secondary: '#FBFBFB'
      },
      border: {
        main: '#EAEAEA'
      }
    },
  })

  ReactDOM.render(
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <App />
      </Provider>
    </MuiThemeProvider>, document.getElementById('root')
  )
}
