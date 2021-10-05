'use strict'

import 'es6-promise/auto'
import '@babel/polyfill'
import "slick-carousel/slick/slick-theme.css"
import "slick-carousel/slick/slick.css"
import '../static/css/App.css'
import '../static/css/index.css'

import React, {useEffect} from 'react'
import App from '../modules/App/App'
import { ThemeProvider as MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import Head from 'next/head'
import CssBaseline from '@material-ui/core/CssBaseline'
import Axios from 'axios'
import Utils from '../resources/Utils'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '../store/index'

export const _app = (props) => {
  const { Component, pageProps, data } = props
  let topBarColor = ''
  let navbarTextColor = ''
  let navbarColor = ''
  let footerColor = ''
  let primaryColor = ''
  let secondaryColor = ''
  let textMainColor = ''
  let textSecondaryColor = ''
  let theme = ''

  if (!props.notFound) {
    const { configs } = props.data
    topBarColor = configs.topBarBackgroundColor
    navbarTextColor = configs.navbarTextColor
    navbarColor = configs.navbarBackgroundColor
    footerColor = configs.footerBackgroundColor
    primaryColor = configs.primaryColor
    secondaryColor = configs.secondaryColor
    textMainColor = configs.textMainColor
    textSecondaryColor = configs.textSecondaryColor
    theme = createMuiTheme({
      typography: {
        useNextVariants: true,
        htmlFontSize: 16,
        fontWeight: 400,
        fontFamily: "IBM Plex Sans",
        h1: {
          fontSize: 42,
          fontWeight: 800,
          color: textMainColor
        },
        h2: {
          fontWeight: 700,
          fontSize: 38,
        },
        h3: {
          fontWeight: 700,
          fontSize: 34,
        },
        h4: {
          fontWeight: 600,
          fontSize: 30,
        },
        h5: {
          fontWeight: 600,
          fontSize: 26,
        },
        h6: {
          fontWeight: 600,
          fontSize: 22,
        },
        body1: {
          fontSize: 16,
          fontWeight: 400,
          color: textSecondaryColor
        },
        body2: {
          fontSize: 16,
          fontWeight:  300,
          color: textSecondaryColor
        }
      },
      sizes: {
        sizeLogo: configs.sizeLogo,
        sizeNavbarLogo: configs.sizeNavbarLogo,
        sizeFooterLogo: configs.sizeFooterLogo
      },
      palette: {
        topBar: {
          main: topBarColor,
          text: navbarTextColor
        },
        footer: {
          main: footerColor
        },
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
        background: {
          main: navbarColor,
          secondary: '#FBFBFB'
        },
        border: {
          main: '#D9DCE2'
        }
      }
    })

  }

  return (
    (!props.notFound) ?
      <>
        <Head>
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: process.env.CONFIG_ENV.rawJsFromFile }}></script>
          {/* Meta Tags ---> para meta robots */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta name="theme-color" content="#000000" />
          <link type="image/x-icon" rel="shortcut icon" href={data.configs.favicon} />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          <script type="text/javascript" src="https://js.openpay.mx/openpay.v1.min.js"></script>
          <script type='text/javascript' src="https://js.openpay.mx/openpay-data.v1.min.js"></script>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
          {
            (Utils.constants.CONFIG_ENV.APP_MODE === 'dev' || Utils.constants.CONFIG_ENV.APP_MODE === 'staging') ?
            <script
              dangerouslySetInnerHTML={{
                __html: `
                OpenPay.setId('m7gqb3y8lyylfomlquqs')
                OpenPay.setApiKey('pk_53f39239b0664156b0f89bce06012876')
                OpenPay.setSandboxMode(true)`,
              }}
            />
            :
            ''
          }
          {
            (Utils.constants.CONFIG_ENV.APP_MODE === 'production') ?
            <script
              dangerouslySetInnerHTML={{
                __html: `
                OpenPay.setId('mhp8ltdrku9ssxkqnecj')
                OpenPay.setApiKey('pk_9d2c9c85326645738c15ff13205c9b88')
                OpenPay.setSandboxMode(false)`,
              }}
            />
            :
            ''
          }
          {
            (data.id === 1 && Utils.constants.CONFIG_ENV.APP_MODE === 'production') ?
              <>
                <meta name="google-site-verification" content="3LbeRgm-OALQWychvnWTrnKQQy_9HsDrU8243tt39Y0" />
                <meta name="facebook-domain-verification" content="aw78gn5tyzz5va37n9it6fcglp9tnm" />
                <script id="google-analytics" async src="https://www.googletagmanager.com/gtag/js?id=UA-127012109-3"></script>
                <script
                  dangerouslySetInnerHTML={{
                    __html: ` window.dataLayer = window.dataLayer || []
                  function gtag(){dataLayer.push(arguments)}
                  gtag('js', new Date())
                  gtag('config', 'UA-127012109-3')`
                  }}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: ` !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window,document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '716528969259588'); 
                  fbq('track', 'PageView');`
                  }}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','GTM-KCM6B73');`
                  }}
                />
                <script async src="https://www.googletagmanager.com/gtag/js?id=AW-646532468"></script>
                <script
                  dangerouslySetInnerHTML={{
                    __html: `window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'AW-646532468');`
                  }}
                />
              </>
              :
              ''
          }
          {
            (data.id === 2 && Utils.constants.CONFIG_ENV.APP_MODE === 'production') ?
              <>
                <meta name="facebook-domain-verification" content="0io6kp84ox7so212eaj2thfldncjat" />
                <script id="google-analytics" async src="https://www.googletagmanager.com/gtag/js?id=UA-164354035-2"></script>
                <script
                  dangerouslySetInnerHTML={{
                    __html: ` window.dataLayer = window.dataLayer || []
                  function gtag(){dataLayer.push(arguments)}
                  gtag('js', new Date())
                  gtag('config', 'UA-164354035-2')`
                  }}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: ` !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window,document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '666297137628567'); 
                  fbq('track', 'PageView');`
                  }}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','GTM-TVT2QJZ');`
                  }}
                />
                <script async src="https://www.googletagmanager.com/gtag/js?id=AW-553377982"></script>
                <script
                  dangerouslySetInnerHTML={{
                    __html: `window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'AW-553377982');`
                  }}
                />
              </>
              :
              ''
          }
          {
            (data.id === 3 && Utils.constants.CONFIG_ENV.APP_MODE === 'production') ?
              <>
                <meta name="facebook-domain-verification" content="9ieyfppgxwodm8ysuf2m30iihmpelm" />
                <script id="google-analytics" async src="https://www.googletagmanager.com/gtag/js?id=UA-164354035-3"></script>
                <script
                  dangerouslySetInnerHTML={{
                    __html: ` window.dataLayer = window.dataLayer || []
                  function gtag(){dataLayer.push(arguments)}
                  gtag('js', new Date())
                  gtag('config', 'UA-164354035-3')`
                  }}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: ` !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '839554736852750');
                  fbq('track', 'PageView');`
                  }}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','GTM-KCW96MS');`
                  }}
                />
                <script async src="https://www.googletagmanager.com/gtag/js?id=AW-553972387"></script>
                <script
                  dangerouslySetInnerHTML={{
                    __html: `window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'AW-553972387');`
                  }}
                />
              </>
              :
              ''
          }
          {
            (data.id === 4 && Utils.constants.CONFIG_ENV.APP_MODE === 'production') ?
              <>
                <meta name="facebook-domain-verification" content="2l4le3tmpamvylrtfjcbjyi9gbajl7" />
                <script id="google-analytics" async src="https://www.googletagmanager.com/gtag/js?id=UA-164354035-4"></script>
                <script
                  dangerouslySetInnerHTML={{
                    __html: ` window.dataLayer = window.dataLayer || []
                  function gtag(){dataLayer.push(arguments)}
                  gtag('js', new Date())
                  gtag('config', 'UA-164354035-4')`
                  }}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: ` !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '3185348928258831');
                  fbq('track', 'PageView');`
                  }}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','GTM-MJRCPCC');`
                  }}
                />
                <script async src="https://www.googletagmanager.com/gtag/js?id=AW-553577328"></script>
                <script
                  dangerouslySetInnerHTML={{
                    __html: `window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'AW-553577328');`
                  }}
                />
              </>
              :
              ''
          }
          {
            (data.id === 5 && Utils.constants.CONFIG_ENV.APP_MODE === 'production') ?
              <>
                <script id="google-analytics" async src="https://www.googletagmanager.com/gtag/js?id=UA-164354035-5"></script>
                <script
                  dangerouslySetInnerHTML={{
                    __html: ` window.dataLayer = window.dataLayer || []
                  function gtag(){dataLayer.push(arguments)}
                  gtag('js', new Date())
                  gtag('config', 'UA-164354035-5')`
                  }}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: ` !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window,document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '331453044747334'); 
                  fbq('track', 'PageView');`
                  }}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','GTM-TV8T89Z');</script>`
                  }}
                />
              </>
              :
              ''
          }
        </Head>
        <Provider store={store}>
          <MuiThemeProvider theme={theme}>
            <App data={data} tree={props.tree}>
              <PersistGate persistor={persistor}>
                <CssBaseline />
                <Component {...pageProps} />
              </PersistGate>
            </App>
          </MuiThemeProvider>
        </Provider>
      </>
      :
      <MessageError language={props.language} />
  )
}

const MessageError = ({ language }) => (
  language == 'es' ?
    <div style={{ textAlign: 'center', marginTop: 72, padding: 16 }}>
      <h1>No se ha podido cargar el sitio.</h1>
      <p>Por favor intenta de nuevo más tarde. Gracias.</p>
    </div> :
    <div style={{ textAlign: 'center', marginTop: 72, padding: 16 }}>
      <h1>The site could not be loaded.</h1>
      <p>Please try again later. Thank you!</p>
    </div>
)

_app.getInitialProps = async (props) => {
  try {
    const filters = {
      where: {
        uuid: Utils.constants.CONFIG_ENV.UUID,
        status: true
      },
      include: ["configs"]
    }

    let response = await Axios(Utils.constants.CONFIG_ENV.HOST_API + '/instances/findOne?filter=' + JSON.stringify(filters))
    if (response.error) {
      console.log(responsee.error)
      throw 'Error to init website!'
    }

    let data = await response.data

    data.googleAdsConversionEvents = {
      addToCart: '',
      fastShopping: '',
      checkout: '',
      thankYouPage: ''
    }

    if (data.id === 1 && Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
      data.googleAdsConversionEvents = {
        addToCart: 'AW-646532468/h-L6CNq9q-QBEPSapbQC',
        fastShopping: 'AW-646532468/FZinCLLW6-gBEPSapbQC',
        checkout: 'AW-646532468/ZFruCJe8q-QBEPSapbQC',
        thankYouPage: 'AW-646532468/mRPLCIr5meQBEPSapbQC'
      }
    }
    else if (data.id === 2 && Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
      data.googleAdsConversionEvents = {
        addToCart: 'AW-553377982/WMahCOmWj-QBEL7B74cC',
        fastShopping: 'AW-553377982/RxxNCLvT6-gBEL7B74cC',
        checkout: 'AW-553377982/GLj8CI_7meQBEL7B74cC',
        thankYouPage: 'AW-553377982/sIUBCL2Xj-QBEL7B74cC'
      }
    } else if (data.id === 3 && Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
      data.googleAdsConversionEvents = {
        addToCart: 'AW-553972387/5t7eCN3-meQBEKPlk4gC',
        fastShopping: 'AW-553972387/MzibCOvW6-gBEKPlk4gC',
        checkout: 'AW-553972387/sCEkCPHCq-QBEKPlk4gC',
        thankYouPage: 'AW-553972387/mFX1CPOaj-QBEKPlk4gC'
      }
    } else if (data.id === 4 && Utils.constants.CONFIG_ENV.APP_MODE === 'production') {
      data.googleAdsConversionEvents = {
        addToCart: 'AW-553577328/R1jwCLDDq-QBEPDW-4cC',
        fastShopping: 'AW-553577328/X3adCP7g_-gBEPDW-4cC',
        checkout: 'AW-553577328/6B2ICJ7Dq-QBEPDW-4cC',
        thankYouPage: 'AW-553577328/tI_hCKyej-QBEPDW-4cC'
      }
    }

    let tree = await Axios({
      method: 'GET',
      url: Utils.constants.CONFIG_ENV.HOST_API + '/menu/tree',
      headers: {
        uuid: Utils.constants.CONFIG_ENV.UUID
      }
    })

    if (tree.error) {
      console.log(tree.error)
      throw 'Error to init website!'
    }

    let treeData = await tree.data

    return { data, tree: treeData, language: 'es', notFound: false }
  } catch {
    return { data: null, tree: null, language: 'es', notFound: true }
  }
}

export default _app