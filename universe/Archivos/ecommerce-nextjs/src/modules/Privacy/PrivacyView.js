import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'

// Utils
import Utils from '../../resources/Utils'

// Components
import Title from '../../components/Title'
import { Typography } from '@material-ui/core'

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
          title="Políticas de privacidad."
          description="En cumplimiento a los artículos 15 y 16 de la Ley Federal de Protección de Datos en Posesión de los Particulares (LA LEY), se pone a su disposición el aviso de privacidad siguiente:"
        />
        <br />
        <Typography variant="body1" style={{fontWeight: 200}}>
        <strong>I.- Identidad y domicilio del responsable que recaba los datos personales</strong>
        <br />
        GRUPO CALZAPATO S.A. DE C.V. (CALZZAPATO), a través de su Departamento de Privacidad es el responsable del tratamiento de sus datos personales. Para cualquier aviso o notificación concerniente a la localización del responsable señalado se manifiestan los siguientes datos para la finalidad mencionada:
        <br />
        <br />
        Correo electrónico: datospersonales@calzzapato.com
        Domicilio: Fray Marcos de Niza 3510-Sur CP 80150 Col San Rafael.
        <br />
        <br />
        <strong>II.- Datos personales que serán recabados para el tratamiento de información:</strong>
        <br />
        Para las finalidades señaladas en este aviso de privacidad, podemos recabar sus datos personales de las formas siguientes:
        <br />
        <br />
        1.- Personalmente: Cuando por cualquiera de nuestro colaboradores de manera personalísima y directa con la presencia física de ambos, cuando usted solicita uno de nuestro productos, cuando usted solicita el otorgamiento de un crédito para la satisfacción personal o de terceras personas, cuando solicita facturación por la compra de algún producto en específico, cuando le es otorgado de manera directa cualquier programa de beneficios o recompensas (Descuentos, Promociones, Monederos electores y/o Cualquier beneficio adicional.
        <br />
        Los datos solicitados de manera personal pueden ser los siguientes: Nombre, domicilio, sexo, teléfono, celular, correo electrónico, fecha de nacimiento, lugar de trabajo, teléfono de trabajo, domicilio de trabajo, nombre del cónyuge, referencias personales, aval, domicilio del aval, teléfono del aval, Registro Federal de Contribuyentes, Número de Seguro Social, Clave Única de Registro de Población, INFONAVIT, INFONACOT, datos de geo-localización de su domicilio o avales, fotografía, nombre de padres e hijos.
        <br />
        <br />
        2.- Directamente: Cuando le solicitemos ya sea por nuestra página web www.calzzapato.com o cuando utiliza alguno de nuestros servicio en línea, alguno(s) de los datos que podemos recabar son los siguientes: nombre completo, edad, sexo, fecha de nacimiento, teléfono, celular, correo electrónico, domicilio, nivel de escolaridad, RFC y/o CURP y datos de facturación, entre otros.
        <br />
        Las Redes sociales: (Facebook, twitter entre otras) son una plataforma de comunicación e interconexión dentro de plataformas digitales de los diferentes usuarios, son ajenas a GRUPO CALZAPATO S.A. DE C.V. (Calzzapato) y por lo tanto, no se encuentran bajo su responsabilidad.
        <br />
        <br />
        <strong>COOKIES</strong>
        <br />
        Los cookies son pequeñas piezas de información que son enviadas por el sitio Web a su navegador y se almacenan en el disco duro de su equipo y se utilizan para determinar sus preferencias cuando se conecta a los servicios de nuestros sitios, así como para rastrear determinados comportamientos o actividades llevadas a cabo por usted dentro de nuestros sitios. Grupo Calzapato S.A de C.V, www.calzzapato.com no emplea el uso de ninguna especie de cookies para el conocimiento de la información y comportamiento de los usuarios y visitantes en www.calzzapato.com, de tal manera que la visita y uso del mismo sitio es completamente privada y no se da a conocer a los administradores del sitio ni a terceros. De la misma manera ninguna especie de archivos son instalados en los computadores y dispositivos móviles de los usuarios
        <br />
        <br />
        3.- Indirectamente: Grupo Calzapato S.A. DE C.V. (Calzzapato) no obtiene información a través de otras fuentes permitidas por la ley.
        <br />
        <br />
        <strong>III.- Datos personales sensibles</strong>
        <br />
        Le informamos que la empresa Grupo Calzapato S.A. DE C.V. (Calzzapato) no recaba datos personales sensibles.
        <br />
        <br />
        <strong>IV.- Finalidades del tratamiento de sus datos personales</strong>
        <br />
        Sus datos personales serán utilizados para alguna(s) de las finalidades siguientes
        <br />
        <ul>
          <li>Proveer servicios y productos requeridos, -Informar sobre nuevos productos y servicios,</li>
          <li>Dar cumplimiento a obligaciones contraídas con nuestros clientes,</li>
          <li>Informar sobre cambios de nuestros productos o servicios,</li>
          <li>Evaluar la calidad del servicio y</li>
          <li>Realizar estudios internos sobre hábitos de consumo.</li>
        </ul>
        <strong>V.- Limitación de uso y divulgación de sus datos personales</strong>
        <br />
        Nos comprometemos a utilizar únicamente sus datos para los fines descritos en el apartado IV de este aviso. Nuestra base de datos es únicamente accesible para personal selecto que labora en esta empresa y se encuentra protegida bajo estrictas medidas de seguridad, tanto físicas como electrónicas.
        <br />
        <br />
        Si usted desea limitar el uso y divulgación de sus datos personales con las finalidades descritas en la sección anterior, envíe un correo electrónico manifestándolo a la dirección que aparece en el apartado I y confírmenos al teléfono xxxxxxx correspondiente a nuestro departamento de privacidad, de lo contrario se entiende que nos otorga su consentimiento.
        <br />
        <br />
        En cuanto al Termino tendremos un plazo máximo de 20 (veinte) días hábiles para atender su petición si resulta procedente, y se haga efectiva la misma dentro de los 15 (quince) días siguientes a la fecha en la que se efectuó la solicitud, donde la respuesta se hará al correo electrónico desde donde se realizó la solicitud.
        <br />
        <br />
        <strong>VI.- Acceso, rectificación, cancelación u oposición al uso de sus datos personales</strong>
        <br />
        Usted tiene derecho de acceder a sus datos personales en posesión nuestra y a los detalles del tratamiento de los mismos, así como a rectificarlos en caso de ser inexactos e incompletos; cancelarlos cuando considere que no se requieren para alguna de las finalidades señaladas en este aviso de privacidad, estén siendo utilizados para finalidades no consentidas o haya finalizado la relación contractual o de servicio, o bien, oponerse al tratamiento de los mismos para fines específicos. Podrá hacer esto a través de los pasos siguientes:
        <br />
        <br />
        Envíe un correo electrónico manifestándolo a la dirección que aparece en el apartado I y confírmenos al teléfono (667)-758-78-50 correspondiente a nuestro departamento de privacidad.
        <br />
        <br />
        Este correo electrónico dirigido al departamento de privacidad de la empresa deberá contener los siguientes requisitos:
        <br />
        <br />
        a).- El nombre del titular de los datos personales y domicilio u otro medio para comunicarle la respuesta a su solicitud;
        <br />
        b).- Los documentos que acrediten la identidad o, en su caso, la representación legal del titular de los datos personales;
        <br />
        c).- La descripción clara y precisa de los datos personales respecto de los que se busca acceder, rectificar, cancelar u oponerse a su uso.
        <br />
        <br />
        <strong>VII.- Transferencias de sus datos personales</strong>
        <br />
        <br />
        Alguno(s) de sus datos personales podrán ser transferidos dentro del territorio nacional a: las empresas que Grupo Calzapato S.A. DE C.V. (Calzzapato) representa comercialmente, para estrategias de segmentación y mercadotecnia; empresa(s) calificadoras de riesgo, para análisis y otorgamiento de crédito; empresas dedicadas a la recuperación de cartera por medios judiciales y extrajudiciales, cuando sea necesario; proveedores de servicio de correo electrónico transaccional; empresas que soliciten referencias laborales y comerciales; centros de llamadas (call centers), para atención al cliente y venta de telemarketing; paqueterías, para envío de producto y documentos; así como entre nuestras sucursales y filiales para brindarles una mejor atención y servicio; sin embargo, siempre se velará por el correcto uso y la más alta seguridad de los mismos. Además de las excepciones previstas en el artículo 37 de LA LEY, que pueden ser autoridades competentes para los fines legales conducentes.
        <br />
        Los receptores de datos personales antes mencionados, de conformidad con LA LEY, asumen las mismas obligaciones y responsabilidades de GRUPO CALZAPATO S.A. DE C.V (Calzzapato) para el correcto tratamiento de los datos personales que le son transferidos.
        <br />
        En caso de estar inconforme, envíe un correo electrónico manifestándolo a la dirección que aparece en el apartado I, de lo contrario se entiende que nos otorga su consentimiento.
        <br />
        <br />
        <strong>VIII.- Modificaciones a este aviso de privacidad</strong>
        <br />
        Nos reservamos el derecho de efectuar cualquier modificación o actualización a este aviso de privacidad para la atención de novedades legislativas o políticas internas, en cualquier momento. La notificación de las modificaciones se hará a través de la página web siguiente: www.calzzapato.com en el apartado Aviso de Privacidad.
        <br />
        <br />
        <strong>QUEJAS Y DENUNCIAS POR EL TRATAMIENTO INDEBIDO DE SUS DATOS PERSONALES:</strong>
        <br />
        Si usted considera que su derecho de protección de datos personales ha sido lesionado por alguna conducta de nuestros empleados o de nuestras actuaciones o respuestas, presume que en el tratamiento de sus datos personales existe alguna violación a las disposiciones previstas en Ley Federal de Protección de Datos Personales en Posesión de los Particulares, podrá interponer la queja o denuncia correspondiente ante el IFAI, para mayor información visite www.ifai.org.mx . Ley Federal de Protección de Datos Personales en Posesión de Particulares vigente.
        <br />
        <br />
        <br />
        <br />
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
