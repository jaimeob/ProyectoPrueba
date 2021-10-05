import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'

//Utils
import Utils from '../../resources/Utils'

// Components
import Title from '../../components/Title'
import { Typography } from '@material-ui/core'

const styles = theme => ({
  home: {
    marginTop: 164
  }
})

class Terms extends Component {
  componentWillMount() {
    Utils.scrollTop()
  }

  render() {
    //const { classes } = this.props
    return (
      <div style={{ width: '75%', margin: '0 auto', marginTop: 54, textAlign: 'justify' }}>
        <Title
          title="Términos y condiciones."
          description="Políticas de Condiciones Generales"
        />
        <br />
        <Typography variant="h6">
          <strong>1. OBJETO</strong>
        </Typography>
        <Typography variant="body1" style={{ fontWeight: 200 }}>
          El objeto de las presentes Condiciones Generales (en adelante las "Condiciones") es el de regular la utilización del sitio web www.calzzapato.com (en adelante "Calzzapato”), con domicilio en Culiacán, Sinaloa.
        <br />
          <br />
        La web www.calzzapato.com ha sido diseñada y desarrollada con el objetivo de servir como medio de comunicación para sus productos y servicios, así como de toda la información relacionada con ellos, y de canal de comercialización en las condiciones marcadas el presente documento de Condiciones Generales.
        <br />
          <br />
        La utilización del sitio web, atribuye a quien haga uso del mismo, la condición de Usuario (en adelante "Usuario"). De acuerdo con la legislación vigente, dispuesta por el artículo 1803 y demás relativos del Código Civil Federal, las presentes Condiciones Generales se encuentran publicadas desde al menos 48 horas antes de cualquier tipo de actividad por lo que el usuario declara conocer y aceptar sin reserva ni excepción alguna, todas y cada una de las Condiciones Generales que en este documento se exponen.
        <br />
          <br />
        A través de www.calzzapato.com se facilitará a todos los Usuarios Registrados, la posibilidad de acceder a los contenidos, servicios y demás información concerniente al objeto de la presente entidad.
        <br />
          <br />
        Las presentes Condiciones Generales constituyen íntegramente lo convenido entre las partes en lo referente a las transacciones “en línea” de compraventa entre Calzzapato y los usuarios.
        <br />
          <br />
        Calzzapato está facultada para modificar unilateralmente todas y cada una de las obligaciones dispuestas en las presentes Condiciones Generales, con el debido cumplimiento de los plazos y procedimientos marcados por la normativa vigente. Igualmente está capacitada para reestructurar, modificar o eliminar cualquier información, servicio o contenido incluido en www.calzzapato.com sin necesidad de previo aviso. La modificación de cualquiera de las presentes condiciones generales para un caso particular sólo tendrá validez cuando haya sido recogida por escrito y firmada por los representantes legales de cada parte.
        <br />
          <br />
        En caso de no aceptar en forma absoluta y completa los términos y condiciones de este contrato, el usuario deberá abstenerse de acceder, utilizar y observar el sitio web www.calzzapato.com
        <br />
          <br />
        En caso de que el usuario acceda, utilice y observe el sitio www.calzzapato.com, se considerará como una absoluta y expresa aceptación de los Términos y Condiciones de Uso aquí estipulados. La sola utilización de dicha página de Internet le otorga al público en general la condición de Usuario e implica la aceptación, plena e incondicional de todas y cada una de las condiciones generales y particulares incluidas en estos Términos y Condiciones de Uso publicados por Calzzapato.
        </Typography>
        <br />
        <Typography variant="h6">
          <strong>2. DERECHOS Y OBLIGACIONES DEL USUARIO</strong>
        </Typography>
        <Typography variant="body1" style={{ fontWeight: 200 }}>
          <br />
          <strong>2.1. Condiciones de Acceso y Uso</strong>
          <br />
        A través de la dirección emplazada en www.calzzapato.com, cualquier usuario podrá acceder gratuitamente a la información contenida en el citado sitio web. Las condiciones de acceso a la web sometida a las disposiciones legales vigentes en cada momento así como a los principios de buena fe y uso licito por parte del Usuario, prohibiéndose expresa y taxativamente cualquier tipo de actuación que pudiera ir en detrimento o perjuicio de Calzzapato o de terceros.
        <br />
          <br />
        Calzzapato no exige la previa suscripción para la simple navegación, acceso o utilización del servicio en cuestión. Por el contrario, para el acceso a determinados contenidos y servicios, se exigirá la previa suscripción y su correspondiente registro como Usuario (de ahora en adelante Usuario Registrado). En lo que al tratamiento de datos personales se refiera, véase la Política de Privacidad de Calzzapato.
        <br />
          <br />
          <strong>2.1.1. Registro de Usuario</strong>
          <br />
        De conformidad con lo dispuesto anteriormente, Calzzapato se reserva algunos de los Servicios ofrecidos a través del sitio web a los Usuarios Registrados de www.calzzapato.com mediante la cumplimentación del correspondiente formulario de registro de Usuarios de www.calzzapato.com, que estará a disposición de los Usuarios que lo deseasen. Los datos que el usuario proporcione a Calzzapato deberán ser reales y actuales. En caso de haber realizado un proceso de compra, el nombre del Usuario debe ser el mismo de la persona que realizó el pedido.
        <br />
          <br />
        El Usuario se compromete a seleccionar, usar y conservar su identificador de usuario y su contraseña o "password" (en adelante y de modo conjunto las "Claves de Acceso") de conformidad con lo establecido en las cláusulas siguientes.
        <br />
          <br />
          <strong>2.1.2. Asignación de las Claves de Acceso</strong>
          <br />
        El Usuario tendrá la opción de elegir e indicar sus propias Claves de Acceso. La asignación de las Claves de Acceso se produce de manera automática, siendo el único criterio empleado al efecto, la inexistencia de unas Claves de Acceso previas que fueren idénticas a las seleccionadas por el Usuario. En tal caso, el Usuario podrá en cualquier momento cambiarlas por cualesquiera otras, siempre de conformidad con lo previsto en los párrafos anteriores y posteriores.
        <br />
          <br />
        Estamos comprometidos a proteger su privacidad en el nivel más alto posible de seguridad. Toda su información personal, incluyendo número de tarjeta de crédito, nombre y dirección es encriptada, por lo que no se puede leer cuando está siendo transmitida desde su computadora a nuestro servidor
        <br />
        Usamos la tecnología Secure Socket Layer (SSL), que permite de extremo a extremo protección de los datos.
        <br />
          <br />
          <strong>2.1.3. Uso y Custodia</strong>
          <br />
        El Usuario se compromete a hacer un uso lícito y diligente de las Claves de Acceso, así como a no poner a disposición de terceros sus Claves de Acceso.
        <br />
          <br />
        El Usuario se compromete a comunicar fehacientemente al Webmaster (vía correo electrónico a tiendavirtual@calzzapato.com) a la mayor brevedad, la pérdida o robo de las Claves de Acceso así como cualquier riesgo de acceso a las mismas por un tercero.
        <br />
          <br />
        Las Claves de Acceso solamente podrán ser utilizadas por los Usuarios a las que se les haya asignado. Calzzapato queda exonerada de cualquier tipo de responsabilidad que se pueda devengar por los daños y perjuicios causados o sufridos por el uso fraudulento o falta de diligencia en la guarda y custodia de las Claves de Acceso, pérdida o uso contraviniendo lo dispuesto en estas Condiciones Generales.
        <br />
          <br />
          <strong>2.2. Contenido y Actuaciones del Usuario</strong>
          <br />
        El Usuario se compromete a hacer un uso lícito, diligente, honrado y correcto de cuanta información o contenido tenga acceso ya sea a través de www.calzzapato.com o de algún tercero proporcionado por Calzzapato., y todo ello bajo los principios de la buena fe y con respeto en todo momento a la legalidad vigente.
        <br />
          <br />
        El Usuario deberá abstenerse de obtener, salvo para uso personal, cuanta información (entiéndase por información como cualquier mensaje, archivos de sonido, fotografías, dibujos, software y en general cualquier clase o tipo de archivo informático, gráfico etc.) que sea propiedad de Calzzapato.
        <br />
          <br />
        Igualmente el Usuario adquiere el compromiso de no provocar ni maliciosa ni intencionadamente daños o perjuicios que puedan menoscabar, alterar el propio sitio web así como no introducir, ni difundir los denominados "virus informáticos" que puedan producir alteraciones no autorizadas de los contenidos o sistemas integrantes del sitio web. El compromiso adquirido se ha de regir sobre la utilización contenidos de conformidad con lo dispuesto en la ley, moral y orden publico; no copiar, reproducir, distribuir, ceder, transformar o modificar los contenidos sin previo consentimiento y por escrito de Calzzapato o persona por éste delegada.
        <br />
          <br />
        A este respecto, Calzzapato se exonera de cualquier tipo de fallo o virus informático introducido por terceros.
        <br />
          <br />
        El usuario se compromete a cumplir todos los requisitos dispuestos en relación a los derechos de propiedad intelectual, industrial y demás análogos.
        <br />
          <br />
          <strong>2.3. Contenido de www.calzzapato.com</strong>
          <br />
        www.calzzapato.com tiene como objetivo prioritario proporcionar un servicio de información y venta de productos y servicios.
        <br />
          <br />
        La Base de Datos propiedad de Calzzapato contiene toda la información necesaria que el cliente pudiese necesitar, así como una actualización constante de los precios, descripción técnica completa, de acuerdo a las leyes vigentes de la PROFECO.
        <br />
          <br />
        La información proporcionada no deberá ser considerada en ningún momento ni completa ni exhaustiva debido a la variada gama de productos y servicios existentes en el sector. Calzzapato, en caso de error en alguno de los precios de sus productos o servicios se compromete a comunicarlo de forma inmediata al usuario y a devolver cualquier importe pagado por el mismo en caso de que el precio real del mismo no sea de su interés, sin ningún costo adicional.
        <br />
          <br />
        Calzzapato manifiesta que el producto ofrecido corresponde con la fotografía y descripción técnica del mismo. No obstante queda exonerada de responsabilidad para aquellos supuestos en los que por errores técnicos o humanos hubiese equivocaciones o variaciones entre la fotografía, la descripción técnica y el precio. Igualmente se pone de manifiesto que las fotografías tienen un mero carácter orientativo pudiendo existir variaciones en lo que a su aspecto físico respecta pero sin menoscabar la integridad y prestaciones del producto solicitado.
        </Typography>
        <br />
        <Typography variant="h6">
          <strong>3. DERECHOS Y OBLIGACIONES DE CALZZAPATO</strong>
        </Typography>
        <Typography variant="body1" style={{ fontWeight: 200 }}>
          <strong>2.1. Condiciones de Acceso y Uso</strong>
          <br />
        Calzzapato responderá única y exclusivamente de los servicios que preste por ella misma y de los contenidos directamente originados por el propio sitio web identificado con su correspondiente copyright.
        <br />
          <br />
        Calzzapato se compromete a la adopción de los medios y medidas necesarias que permitan garantizar la seguridad y privacidad en la comunicaciones. No responderá cuando, adoptadas las pertinentes medidas de seguridad, éstas fueren vulneradas por agentes externos.
        <br />
          <br />
        Calzzapato no será responsable ni siquiera de forma indirecta o subsidiaria, por ningún contenido, información, opinión o manifestación de cualquier tipo, que tenga su origen en el Usuario o terceras personas o entidades y que tengan acceso, transmitan, comuniquen, traten, exhiban o vendan dicha información al sitio web www.calzzapato.com
        <br />
          <br />
        Calzzapato se reserva el derecho a suspender temporalmente la prestación del servicio sin previo aviso al Usuario, siempre y cuando sea necesario para efectuar operaciones de mantenimiento, actualización o mejora del servicio. Igualmente podrá modificar las condiciones de acceso y/o concreta ubicación del contenido integrante del sitio web, así como impedir, restringir, bloquear, suprimir o retirar el acceso a los servicios a los Usuarios cuando éstos no hicieren un uso lícito, honrado y diligente de los servicios prestados en el Portal. En la misma línea podrá retirar, bloquear o restringir el uso de los contenidos introducidos por terceras personas que fueren ilícitos, racistas delictivos, de apología de terrorismo, violación de derechos humanos, difamatorios, pornográficos, constitutivos de estafa o de cualquier otro modo que infrinjan las leyes o normativas aplicables bien sean nacionales como internacionales.
        <br />
          <br />
        Calzzapato no asegura la disponibilidad y continuidad permanente del Portal debido a interrupciones, fallos, etc. así como tampoco responderá de los daños y perjuicios que pueda causar a los Usuarios por los virus informáticos o agentes externos que terceras personas puedan depositar en el sitio web o en los documentos electrónicos y ficheros almacenados en el sistema informático.
        <br />
          <br />
        El Portal pone a disposición de los Usuarios ciertas herramientas tales como, botones, banners, links o enlaces que permitan al Usuario acceder a otros sitios relacionados con el objeto social del sitio web u otros diferentes. La instalación de estas herramientas tienen como fin último proporcionar y facilitar la navegación al Usuario, no siendo responsable Calzzapato de los sitios a los que acceda el Usuario a través de su página. Por todo ello será el Usuario quién bajo su propia responsabilidad accederá a través de esos hipervínculos. Por su parte Calzzapato tratará en la medida de sus posibilidades de comprobar dichos hipervínculos, restringiendo, bloqueando o suspendiendo dichos botones cuando atentasen contra el principio descrito en las presentes Condiciones Generales.
        <br />
          <br />
          <strong>3.1. Respecto a los productos que se comercializan en nuestra página web</strong>
          <br />
        La actividad de Calzzapato es poner al alcance del público una amplia gama de artículos de calzado y accesorios. El objetivo es ofrecer siempre el mejor servicio a los clientes. Un servicio rápido, eficaz y cómodo para que puedan adquirir los productos de una forma práctica. Para ello los productos que se comercializan se tienen en inventario salvo alguna falta del mismo debido a problemas ajenos a la empresa o a una falta de servicio por parte de los proveedores/fabricantes de los mismos (contactando de inmediato con el cliente para comunicarlo y poder de alguna manera solucionar la entrega de su pedido).
        <br />
          <br />
        Los productos que se ofrecen son de la más alta calidad y pertenecen a marcas fabricadas por empresas de reconocido prestigio nacional e internacional. Todos los artículos presentados por Calzzapato en su página web están respaldados por esta condición.
        <br />
          <br />
          <strong>3.2. Respecto a los precios de los productos</strong>
          <br />
        Los precios de los productos son los precios de venta al público incluido el IVA (Impuesto al Valor Agregado) que correspondiera. A su vez los mismos se establecen de acuerdo a la política de la empresa, intentando ser lo más fieles a los usuarios, ofreciendo siempre la mayor calidad al mejor precio.
        <br />
          <br />
        Los precios y promociones de los productos publicados en www.calzzapato.com son exclusivos para su venta online, pueden coincidir o no con los precios y promociones de las tiendas físicas de Calzzapato.
        <br />
          <br />
          <strong>3.3. Respecto al envío</strong>
          <br />
        El costo del envío es Gratis a todo México. En este sentido, la política de la empresa es intentar que los pedidos lleguen al destinatario en un tiempo razonable. Si el usuario desea otra forma de envío, la empresa es lo suficientemente flexible como para estudiar dicha posibilidad e intentar satisfacer las necesidades del cliente.
        <br />
          <br />
        El tiempo estimado de entrega es entre 3 y 7 días hábiles después de la realización del pago.
        <br />
          <br />
        El pedido será enviado a la dirección que el Usuario indicó en el detalle de compra. En caso de elegir como método de pago PayPal la dirección de envío a la que Calzzapato se compromete a enviar su pedido será la que el Usuario registró en PayPal respetando las políticas que PayPal establece.
        <br />
          <br />
        Para entrega de pedidos dentro de la ciudad de Culiacán Sinaloa mediante "Calzzamovil", el consignatario deberá de proporcionar una identificación oficial así como el número de identificación OCR para ser capturada por el repartidor en el caso, a su vez, deberá firmar de recibido una constancia de entrega con su nombre completo y firma tal cual se presenta en su identificación del Instituto Federal Electoral.
        </Typography>
        <br />
        <Typography variant="h6">
          <strong>4. OFERTAS, PRECIOS, PAGOS Y PLAZOS DE ENTREGA</strong>
        </Typography>
        <Typography variant="body1" style={{ fontWeight: 200 }}>
          En base a su política comercial, Calzzapato podrá realizar variaciones finales del precio ya sea por fidelización, por adquisición de productos de cierta entidad o relevancia así como otros que pueda estipular en su debido momento.
        <br />
          <br />
        No obstante, será Calzzapato quien libre y voluntariamente ofrezca estos descuentos y/o rebajas, a quienes estime oportuno, no pudiendo ser exigidos ni solicitados en ningún momento por el cliente. Calzzapato se reserva el derecho a modificar unilateralmente los precios de los productos sin necesidad de previo aviso.
        <br />
          <br />
        Los descuentos adicionales y regalos promocionales por cantidad o volumen de pedido serán exclusivamente los recogidos por Calzzapato en su oferta y tendrán validez hasta la expiración del periodo señalado o el agotamiento de su stock.
        <br />
          <br />
        Para realizar una compra será indispensable realizar un carrito de la compra y haber procedido previamente a rellenar el correspondiente formulario de suscripción, posteriormente habrá que emitir el pedido con los precios definitivos de los productos así como con los plazos aproximados de entrega y proceder al pago mediante cualquiera de las posibilidades de forma de pago que en cada momento estén a disposición del cliente en el sitio web: Pago con tarjeta (Visa, MasterCard y AMEX), Crédito CrediVale, Efectivo con Oxxo, Tarjeta de Crédito Débito a través de PayPal, Paynet y Tarjeta de Crédito Débito a través de Openpay.
        <br />
          <br />
        * Para más detalles vea nuestra página de Formas de Pago. Para pagos con tarjeta de débito o crédito el Usuario deberá proporcionar una identificación oficial al repartidor quien validara el nombre y firma del mismo como medida de protección, a su vez el repartidor tendrá todo el derecho de escribir el número de identificación OCR de la identificación IFE del usuario.
        <br />
          <br />
        El plazo de entrega dependerá de los productos y del domicilio al que se efectúe el envío.
        <br />
          <br />
        Los envíos de mercancías pagadas por transferencia bancaria sólo se enviarán una vez realizado el pago. En caso de no recibirse el pago del producto en un plazo de 3 días hábiles, el pedido será anulado.
        <br />
          <br />
        La entrega de cualquiera de los productos objeto de compraventa al amparo de las presentes condiciones generales, se encuentra sujeta al plan de disponibilidad de Calzzapato.
        <br />
          <br />
        Éste realizará sus más encarecidos esfuerzos con el fin de efectuar las entregas en la fecha prevista, ofertada o confirmada. Sin embargo, no adquirirá responsabilidad alguna por fallos en el cumplimiento de esas fechas siempre y cuando sea por causas ajenas a Calzzapato.
        <br />
          <br />
        Si el cliente cancela total o parcialmente pedidos antes de que Calzzapato hubiera procedido a la expedición de los mismos, Calzzapato podrá exigir el pago de una compensación en concepto de gastos y tramitación, consistente en el 10 % del valor de la mercancía rechazada. Los clientes podrán adherirse a cualquiera de las modalidades de pago ofrecidas por Calzzapato.
        <br />
          <br />
        La factura digital de la tienda virtual se enviará por correo electrónico en caso de ser solicitada por el cliente en el momento de la compra.
        <br />
          <br />
        Calzzapato procurará entregar los productos de modo idéntico a como aparecen recogidos en la web. Sin embargo, sus proveedores pueden variar en ocasiones ciertas características o cantidades ofertadas en un lote sin previo aviso. Calzzapato podrá asimismo variar éstas de manera no sustancial, sin incurrir por ello en ningún tipo de responsabilidad.
        <br />
          <br />
        A la entrega de la mercancía, el Usuario deberá firmar el comprobante de entrega dando su conformidad a la entrega efectuada.
        <br />
          <br />
        La conformidad del Usuario en el comprobante de entrega implica la renuncia a cualquier tipo de reclamación o denuncia respecto a la mercancía pedida y recibida. Si no se cumplen estas condiciones, Calzzapato no asumirá ninguna responsabilidad sobre dicha mercancía. Una vez que Calzzapato entrega la mercancía a la empresa de transporte, cualquier desperfecto que sufra la misma será por cuenta de esa empresa, a la que deberá reclamar en este caso.
        </Typography>
        <br />
        <Typography variant="h6">
          <strong>5. DEVOLUCIONES Y DERECHO DE REEMBOLSO</strong>
        </Typography>
        <Typography variant="body1" style={{ fontWeight: 200 }}>
          Calzzapato se reserva el derecho de exigir una indemnización para compensar los posibles daños sufridos por las mercancías, así como para recuperar los gastos directos ocasionados por la devolución.
        <br />
          <br />
        Calzzapato solamente aceptará la devolución de la mercancía si:
        <br />
          <br />
        a. En el plazo máximo 15 días a partir de la fecha de recibido, el comprador ejercita su derecho de Devolución (ver políticas de devolución). Calzzapato aceptará el ejercicio del mencionado derecho única y exclusivamente cuando la mercancía estuviese en perfecto estado y listo para la venta, con su correspondiente embalaje original y habiendo cumplido los requisitos establecidos en el punto que describe la entrega.
        <br />
          <br />
        b. La mercancía estuviese defectuosa desde el primer momento. A este respecto Calzzapato estará a lo dispuesto en la Ley, procediendo a sustituir inmediatamente el producto por otro con idénticas condiciones y prestaciones.
        <br />
          <br />
        c. La mercancía no le fuese proporcionada en el plazo que previamente hubiese indicado Calzzapato en la confirmación del pedido.
        <br />
          <br />
        d. Calzzapato procederá igualmente a devolver el importe de la mercancía cuando por causas no imputables (ya sean directas o indirectas) a ella, se viese imposibilitado de servirlo.
        <br />
          <br />
        e. Calzzapato aceptará la devolución de la mercancía cuando por causas imputables a ella, el producto solicitado no se correspondiese con el solicitado por el cliente.
        <br />
          <br />
        f. En mercancía con descuento o en liquidación no se aceptan cambios ni devoluciones.
        <br />
          <br />
        g. A partir de un 2º cambio, el costo de los fletes correspondientes son por parte del cliente: $150.00 para el flete del producto que regresará al Almacén y  $150.00 para el envío del nuevo producto a recibir.
        <br />
          <br />
          <strong>5.1. Procedimiento para devoluciones por servicio de mensajería:</strong>
          <br />
        Se podrá devolver la mercancía, en caso de los motivos anteriores, utilizando la misma compañía de mensajería que le entregó la mercancía, enviándonos el número de guía de la devolución al siguiente correo: contacto@calzzapato.com asegurando perfectamente el paquete el cual deberá contener la factura original, una nota aclaratoria que indique el motivo de la devolución, y si deseas la reposición del artículo o el reembolso de tu dinero anexando la credencial de elector y una cuenta bancaria donde realizaremos la devolución de su dinero en los próximos 7 días hábiles.
        <br />
          <br />
        Las presentes Condiciones Generales se resolverán automáticamente por la extinción de “Calzzapato.” o por la presentación de solicitudes de declaración de quiebra (voluntaria o necesaria), suspensión de pagos, concurso de acreedores, cesión general de bienes a favor de acreedores, cese de las actividades propias de la empresa, etc.
        <br />
          <br />
        No obstante lo anterior, Calzzapato podrá considerar que cuando los productos solicitados por el cliente fueren claramente personalizados y realizados conforme a las especificaciones del consumidor, u otros que en su momento determine, no prevalecerá el citado derecho de resolución ni las presentes condiciones generales, prevaleciendo por tanto el contrato de compraventa interpartes suscrito.
        <br />
          <br />
        Dicho contrato será emitido por Calzzapato y remitido al usuario registrado “CLIENTE”, con el objeto de aceptar las condiciones en él dispuestas y renunciando a las presentes Condiciones Generales.
        </Typography>
        <br />
        <Typography variant="h6">
          <strong>6. Propiedad Intelectual</strong>
        </Typography>
        <Typography variant="body1" style={{ fontWeight: 200 }}>
          La totalidad de los contenidos a los que se acceda a través del servicio prestado por www.calzzapato.com están sujetos a los Derechos de Propiedad Intelectual e Industrial de Calzzapato. Dicho contenido no podrá ser usado, duplicado, distribuido, vendido, explotado o cualquier otra forma con propósito comercial o no, sin el previo y preceptivo consentimiento y por escrito de su titular.
        <br />
          <br />
        Todos los contenidos y partes integrantes de la página web www.calzzapato.com han sido incluidos conforme a los principios de la buena fe, con información procedente total o parcialmente de fuentes externas a la propia entidad razón por la cual Calzzapato no se responsabiliza en manera alguna de la inexactitud o no actualización de los contenidos ofertados.
        <br />
          <br />
        Por el contrario todos aquellos contenidos procedentes de fuentes internas estarán debidamente identificados con su copyright. La entidad se reserva el derecho o facultad de efectuar cualquier cambio en cualquier momento sin necesidad de previo aviso. Todos los contenidos incluidos en la página procedentes de fuentes internas que lleven su signo identificativo de copyright, son responsabilidad única y exclusivamente de Calzzapato.
        <br />
          <br />
        El Usuario, declara haber leído, conocer y aceptar las presentes Condiciones Generales en toda su extensión.
        <br />
          <br />
          <strong><i>Copyright © www.calzzapato.com Todos los derechos reservados.</i></strong>
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
)(Terms)
