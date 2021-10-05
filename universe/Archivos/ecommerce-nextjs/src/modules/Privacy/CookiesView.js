import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'

// Utils
import Utils from '../../resources/Utils'

// Components
import Title from '../../components/Title'
import { Typography, Table, TableBody, TableRow, TableCell } from '@material-ui/core'

const styles = theme => ({
  home: {
    marginTop: 164
  }
})

class PrivacyView extends Component {
  componentWillMount() {
    Utils.scrollTop()
  }

  render() {
    //const { classes } = this.props
    return (
      <div style={{width: '75%', margin: '0 auto', marginTop: 54, textAlign: 'justify'}}>
        <Title
          title="Aviso uso de Cookies."
          description="Aspectos específicos de privacidad en nuestro sitio web."
        />
        <Typography variant="body1" style={{ color: 'black', fontWeight: 200}}>
        <br />
        <br />
        En nuestro Sitio web utilizamos "cookies". Las cookies son pequeños archivos de datos que se almacenan en el disco duro de su equipo de cómputo o del dispositivo de comunicación electrónica que usted utiliza cuando navega en nuestro Sitio. Estos archivos de datos permiten intercambiar información de estado entre nuestro Sitio web y el navegador que usted utiliza. La "información de estado" puede revelar medios de identificación de sesión, medios de autenticación o sus preferencias como usuario, así como cualquier otro dato almacenado por el navegador respecto del Sitio web. Las cookies nos permiten monitorear el comportamiento de un usuario en línea. Utilizamos la información que es obtenida a través de cookies para ayudarnos a optimizar su experiencia de compra. A través del uso de cookies podemos, por ejemplo, personalizar en su favor nuestra página de inicio de manera que nuestras pantallas se desplieguen de mejor manera de acuerdo a su tipo de navegador. Las cookies también nos permiten ofrecerle recomendaciones personalizadas respecto de productos, y correos electrónicos.
        <br />
        <br />
        Las cookies no son software espía, y Grupo Calzzapato no recopila datos de múltiples sitios o comparte con terceros la información que obtenemos a través de cookies.
        <br />
        <br />
        Como la mayoría de los sitios web, nuestros servidores registran su dirección IP, la dirección URL desde la que accedió a nuestro Sitio web, el tipo de navegador, y la fecha y hora de sus compras y otras actividades. Utilizamos esta información para la administración del sistema, solución de problemas técnicos, investigación de fraudes y para nuestras comunicaciones con usted.
        <br />
        <br />
        Por último, le informamos que el Sitio web utiliza web beacons. Los web beacons también nos permiten monitorear su comportamiento en medios electrónicos Utilizamos web beacons para determinar cuándo y cuántas veces una página ha sido vista. Utilizamos esta información para fines de mercadotecnia, pero únicamente para nuestras propias prácticas de mercadotecnia.
        <br />
        <br />
        Si se inhabilitan las cookies del Sitio web, nuestro Sitio no se cargará apropiadamente.
        <br />
        <br />
        <Table style={{ fontWeight: 200 }}>
          <TableBody>
            <TableRow>
              <TableCell>
                <strong>Categorías de Cookies</strong>
              </TableCell>
              <TableCell>
                <strong>¿Por qué utilizamos estas cookies?</strong>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Técnicas</TableCell>
              <TableCell>Son cookies necesarias para el funcionamiento de un sitio web. Incluyen, por ejemplo, cookies que le permiten iniciar sesión en áreas seguras de un sitio web o comprar bienes por Internet.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Preferencias</TableCell>
              <TableCell>Estas cookies permiten al usuario acceder al sitio web con determinadas funcionalidades generales predefinidas en el terminal del usuario de acuerdo con una serie de criterios (p. ej., idioma, tipo de navegador, ajustes geográficos). Se utilizan para reconocer a un usuario cuando regresa a un sitio web. Estas cookies nos permiten personalizar el contenido para un usuario y recordar sus preferencias.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Seguridad</TableCell>
              <TableCell>Utilizamos estas cookies para ayudar a identificar y prevenir riesgos para la seguridad.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Rendimiento</TableCell>
              <TableCell>Utilizamos estas cookies para recoger información sobre cómo interactúa con nuestro sitio web y para ayudarnos a mejorarlo. Por ejemplo, podemos utilizar estas cookies para determinar si usted ha interactuado con una determinada página web.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Análisis</TableCell>
              <TableCell>Estas cookies nos permiten entender mejor cómo interactúan nuestros usuarios con nuestro sitio web. Nos permiten reconocer y contar el número de visitas y saber cómo navegan en un sitio web cuando lo utilizan. Estas cookies nos ayudan a mejorar el modo en que funciona un sitio web, por ejemplo, garantizando que los usuarios encuentren lo que buscan fácilmente. Podemos utilizar estas cookies para conocer más sobre qué funcionalidades son las más populares entre nuestros usuarios y dónde necesitamos mejorar.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </Typography>
      </div>
    )
  }
}

const mapStateToProps = state => ({ ...state })

export default compose(
  withStyles(styles),
  connect(mapStateToProps, null)
)(PrivacyView)
