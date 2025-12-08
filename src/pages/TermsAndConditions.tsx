import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 hover:bg-transparent hover:text-primary -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <div className="bg-white shadow-lg rounded-2xl p-8 md:p-12 space-y-8">
          <div className="text-center border-b pb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              TÉRMINOS Y CONDICIONES GENERALES DE CONTRATACIÓN
            </h1>
            <p className="text-muted-foreground">
              DEL SERVICIO DENOMINADO “SEGURO CONTRA MULTAS”
            </p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-justify">
            <section>
              <p>
                Los presentes Términos y Condiciones regulan el acceso, uso y contratación del servicio denominado “Seguro contra multas”, ofrecido y operado bajo el nombre comercial CARAVEL, a través del sitio web https://caravel.com.mx, conforme a lo siguiente:
              </p>
              <p>
                <strong>Responsable del servicio:</strong> Santiago Calderón Chávez, persona física con actividad empresarial, en adelante referida como "CARAVEL" o "El Prestador", quien actúa por cuenta propia y es titular de los derechos sobre la marca, el sitio web, la plataforma de operación y la prestación del servicio contratado.<br />
                <strong>RFC:</strong> CACS011217MM1<br />
                <strong>Domicilio para efectos legales y de notificación:</strong> Calle Allioth, número exterior 4140, entre las calles Juan Kepler y Carnero, en la colonia Arboledas 1ª Sección, localidad San Gonzalo Torre Vieja, municipio de Zapopan, estado de Jalisco, con código postal 45070.<br />
                <strong>Sitio web oficial:</strong> https://caravel.com.mx
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">II. DECLARACIONES</h2>

              <h3 className="text-lg font-semibold mb-2">A. DEL RESPONSABLE DEL SERVICIO</h3>
              <p>Santiago Calderón Chávez, en su carácter de responsable de la prestación del servicio comercializado bajo el nombre CARAVEL, declara, bajo protesta de decir verdad, lo siguiente:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>I. Actividad profesional:</strong> Que se dedica, por cuenta propia, a la prestación de servicios jurídicos, incluyendo la representación legal en juicios administrativos de nulidad, defensa de derechos del automovilista y asesoría legal en materia de infracciones de tránsito.</li>
                <li><strong>II. Propiedad del sitio y control del servicio:</strong> Que es titular y responsable del portal web https://caravel.com.mx, así como de la plataforma tecnológica mediante la cual se lleva a cabo la contratación, gestión, comunicación y seguimiento del servicio ofrecido, y que opera bajo la marca comercial CARAVEL.</li>
                <li><strong>III. Capacidad legal:</strong> Que cuenta con plena capacidad jurídica para obligarse en términos de los presentes Términos y Condiciones, así como para representar legalmente a los clientes que contraten el servicio, conforme a las facultades que le son otorgadas mediante la aceptación electrónica del presente documento.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">B. DEL USUARIO / CLIENTE</h3>
              <p>Por su parte, quien contrate el servicio a través del sitio web antes mencionado (en lo sucesivo, el "Cliente" o "Usuario"), declara, bajo protesta de decir verdad:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>I. Identificación:</strong> Que es una persona física o moral, con capacidad legal para contratar, y que al momento de la suscripción del presente documento ha proporcionado información veraz, completa y actualizada, incluyendo identificación oficial, datos de contacto y documentación del vehículo registrado.</li>
                <li><strong>II. Interés en la contratación:</strong> Que tiene interés en contar con un servicio profesional de defensa jurídica, consistente en la gestión, tramitación y litigio para la cancelación de infracciones de tránsito y adeudos vehiculares, a través de medios legales válidos.</li>
                <li><strong>III. Reconocimiento del carácter jurídico del servicio:</strong> Que reconoce y acepta expresamente que el servicio contratado no constituye una póliza de seguro, ni una operación financiera regulada por la legislación aplicable al sector asegurador, sino que se trata de un servicio legal especializado, ofertado bajo la denominación comercial “Seguro contra multas” por razones meramente explicativas y de marketing.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">III. DEFINICIONES</h2>
              <p>Para efectos del presente contrato, los términos que a continuación se enlistan tendrán el significado que se les atribuye, indistintamente si se utilizan en singular o plural, con mayúscula o minúscula:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Multa:</strong> Cualquier sanción económica impuesta por una autoridad administrativa de tránsito del estado de Jalisco derivada de una supuesta infracción a la normativa de movilidad, vialidad, transporte o cualquier otra disposición legal aplicable a vehículos automotores.</li>
                <li><strong>Cliente:</strong> Persona física o moral que contrata el servicio objeto del presente contrato, a través del sitio web https://caravel.com.mx, y que proporciona sus datos personales y la información del vehículo para recibir la prestación jurídica.</li>
                <li><strong>Servicio:</strong> Conjunto de gestiones legales ofrecidas por CARAVEL, consistentes en representar jurídicamente al Cliente para impugnar, anular o eliminar infracciones vehiculares mediante juicios de nulidad u otros medios legales, con la finalidad de garantizar que el vehículo se encuentre libre de adeudos al mes de enero de cada año.</li>
                <li><strong>CARAVEL:</strong> Denominación comercial utilizada por Santiago Calderón Chávez, responsable legal y operativo de la prestación del servicio jurídico regulado por el presente contrato.</li>
                <li><strong>Juicio de nulidad:</strong> Procedimiento contencioso-administrativo que se tramita ante tribunales competentes, mediante el cual se solicita la anulación de una resolución administrativa (como una multa), por considerarse contraria a derecho.</li>
                <li><strong>Refrendo:</strong> Pago anual obligatorio exigido por las autoridades estatales para mantener vigente la circulación de un vehículo, cuya realización puede verse impedida por la existencia de adeudos o multas en el sistema.</li>
                <li><strong>Firma simple:</strong> Medio de manifestación del consentimiento electrónico mediante selección, activación o marcación digital de campos en línea (checkbox), cuyo valor jurídico es equiparable a la firma autógrafa para la validez de contratos civiles y mercantiles en términos de la legislación mexicana.</li>
                <li><strong>INPC (Índice Nacional de Precios al Consumidor):</strong> Indicador económico publicado por el Instituto Nacional de Estadística y Geografía (INEGI) que mide la variación de precios de bienes y servicios en México, y que puede servir como parámetro de actualización de las tarifas del servicio contratado.</li>
                <li><strong>Portal:</strong> Sitio web operado por CARAVEL en https://caravel.com.mx, mediante el cual se lleva a cabo el registro, contratación, seguimiento, administración y atención relacionada con el servicio.</li>
                <li><strong>Documentación requerida:</strong> Conjunto de archivos e información que el Cliente debe proporcionar para que CARAVEL pueda representar legalmente al vehículo registrado, en los términos y plazos establecidos en este contrato.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">IV. CLÁUSULAS</h2>

              <h3 className="text-lg font-semibold mb-2">1. Objeto del Contrato</h3>
              <p>El presente contrato tiene por objeto la prestación de un servicio jurídico especializado por parte de CARAVEL, consistente en representar legalmente al Cliente ante las autoridades competentes del estado de Jalisco, con el fin de impugnar, controvertir y lograr la nulidad de infracciones y adeudos vehiculares, a efecto de garantizar que, al mes de enero siguiente a la contratación anual del servicio, el vehículo registrado se encuentre libre de multas y adeudos que pudieran impedir o complicar el pago del refrendo correspondiente.</p>
              <p>Para tal efecto, CARAVEL se obliga a llevar a cabo, en nombre y por cuenta del Cliente, todos los actos jurídicos, procesales, administrativos y técnicos necesarios para procurar la baja, eliminación o suspensión de los registros de infracción y cualquier otro adeudo de naturaleza administrativa relacionado con el vehículo especificado por el Cliente al momento de la contratación.</p>
              <p>La contratación anual del servicio cubre, sin límite de cuantía, los adeudos preexistentes acumulados hasta el momento de la celebración del contrato, así como aquellos que se generen durante la vigencia del mismo, conforme a las reglas, plazos y condiciones establecidas en el presente instrumento.</p>
              <p>Lo anterior únicamente aplicará respecto al mes de enero del año inmediato siguiente a la contratación, siempre y cuando el Cliente haya celebrado el contrato y efectuado el pago correspondiente a más tardar el día 1° de julio del año anterior. En caso de contratar el servicio en fecha posterior, la garantía de liberación de multas aplicará hasta enero del año subsiguiente.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">2. Condiciones Generales</h3>
              <p><strong>2.1 Alcance del servicio.</strong> El servicio contratado comprende la representación legal integral del Cliente en todos los procedimientos administrativos y/o jurisdiccionales necesarios para obtener la nulidad o cancelación de infracciones de tránsito, sanciones administrativas y cualquier adeudo vehicular registrado en el estado de Jalisco, exclusivamente respecto del vehículo designado en el momento de la contratación. Lo anterior incluye la elaboración, presentación, seguimiento y desahogo de escritos, recursos, demandas, promociones, pruebas y comparecencias necesarias para lograr el objetivo pactado.</p>
              <p><strong>2.2 Territorio.</strong> El servicio se limita territorialmente a infracciones, adeudos o procedimientos derivados de actos de autoridad cometidos o registrados únicamente en el estado de Jalisco.</p>
              <p><strong>2.3 Vigencia.</strong> El servicio surte efectos a partir del momento en que el Cliente realiza el pago a través del sitio web y permanece vigente por los periodos cubiertos por los pagos efectuados (mensuales o anual), conforme al esquema de renovación automática previsto en este contrato.</p>
              <p><strong>2.4 Inclusión de vehículos arrendados.</strong> El Cliente podrá registrar vehículos de su propiedad o bien vehículos arrendados o bajo su administración, en cuyo caso deberá proporcionar, de forma adicional, copia del contrato de arrendamiento o documentación equivalente que acredite la relación jurídica con la unidad, así como la información y documentación complementaria que le sea solicitada para la adecuada prestación del servicio.</p>
              <p><strong>2.5 Límites y restricciones.</strong> El servicio no está sujeto a límites económicos ni al número de multas por vehículo, siempre que el contrato se encuentre vigente y los pagos estén al corriente. Sin embargo, no incluye la gestión de adeudos originados fuera del estado de Jalisco, ni aquellos que deriven de delitos, procedimientos penales, faltas graves que no admitan defensa administrativa, o infracciones que se encuentren firmes por haber sido consentidas o pagadas sin reserva de derechos.</p>
              <p><strong>2.6 Requisitos de documentación.</strong> El Cliente deberá cargar en la plataforma digital, dentro de los 10 días naturales posteriores a la contratación, la documentación necesaria para iniciar la representación legal, incluyendo, de forma enunciativa más no limitativa:</p>
              <ul className="list-disc pl-5">
                <li>Tarjeta de circulación o comprobante de pago de refrendo.</li>
                <li>Identificación oficial vigente del propietario del vehículo (INE).</li>
                <li>En caso de personas morales: acta constitutiva, poderes notariales, identificación del representante legal.</li>
                <li>En caso de arrendamiento: contrato de arrendamiento vigente.</li>
                <li>Cualquier otro documento adicional que CARAVEL considere necesario para la estrategia legal.</li>
              </ul>
              <p><strong>2.7 Negativa de servicio.</strong> CARAVEL se reserva el derecho de prestar el servicio cuando el Cliente no proporcione oportunamente la documentación requerida, proporcione información incompleta, falsa o ilegible, o bien omita cumplir con los requerimientos que le sean solicitados. En tales casos, CARAVEL quedará exento de toda obligación y responsabilidad, sin obligación de reembolso alguno.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">3. Requisitos para la Prestación del Servicio</h3>
              <p><strong>3.1 Documentos obligatorios.</strong> Para que CARAVEL pueda iniciar la prestación del servicio y llevar a cabo las gestiones jurídicas necesarias, el Cliente deberá proporcionar, a través del portal web https://caravel.com.mx, los siguientes documentos digitales en formato legible:</p>
              <ul className="list-disc pl-5">
                <li>a) Tarjeta de circulación vigente del vehículo o, en su defecto, comprobante de pago del refrendo.</li>
                <li>b) Identificación oficial (INE) del propietario, en caso de personas físicas.</li>
                <li>c) En caso de personas morales: Acta constitutiva, Instrumento notarial con facultades del representante legal, e INE del representante legal.</li>
                <li>d) En caso de vehículos arrendados: Contrato de arrendamiento vigente, y Cualquier otro documento que permita acreditar la relación jurídica con el vehículo.</li>
                <li>e) Cualquier documento complementario o aclaratorio que CARAVEL solicite, cuando resulte necesario para el desarrollo del juicio.</li>
              </ul>
              <p><strong>3.2 Plazo para entrega.</strong> El Cliente se obliga a entregar la documentación antes referida dentro de un plazo máximo de diez (10) días naturales contados a partir de la fecha en que se haya realizado el pago del servicio. La carga de documentos se realiza directamente desde el portal del Cliente, en su cuenta personalizada.</p>
              <p><strong>3.3 Consecuencias por omisión o entrega extemporánea.</strong> Si el Cliente no proporciona la documentación dentro del plazo estipulado, o bien, si la documentación entregada es insuficiente, ilegible, contradictoria, o no permite llevar a cabo la acción legal correspondiente, CARAVEL quedará legalmente liberado de la obligación de prestar el servicio respecto del período en cuestión, sin que ello implique reembolso o responsabilidad alguna por parte del prestador. En caso de que el Cliente entregue la documentación fuera del plazo indicado y esta aún sea útil jurídicamente, CARAVEL podrá, a su exclusiva discreción, reconsiderar la prestación del servicio, sin estar obligado a garantizar resultados ni a cumplir con los tiempos ordinarios de resolución.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">4. Forma de Contratación</h3>
              <p><strong>4.1 Registro digital.</strong> La contratación del servicio se realiza de manera exclusivamente electrónica, a través del portal web https://caravel.com.mx, en el cual el Cliente deberá crear una cuenta de usuario proporcionando su número telefónico, datos de identificación, información del vehículo y demás datos solicitados para efectos de autenticación, operación y seguimiento.</p>
              <p><strong>4.2 Aceptación de los Términos y Condiciones.</strong> La contratación se perfecciona mediante la aceptación expresa del Cliente a los presentes Términos y Condiciones Generales de Contratación, marcando la casilla correspondiente ("check box") y realizando el pago a través de la plataforma habilitada en el sitio web. Dicha aceptación genera los mismos efectos jurídicos que la firma autógrafa, en términos de lo previsto por la legislación civil y mercantil aplicable.</p>
              <p><strong>4.3 Verificación en dos pasos.</strong> Como medida de seguridad y control, CARAVEL requiere que el Cliente verifique su identidad mediante un sistema de autenticación en dos pasos vinculado a su número telefónico registrado. Solo los usuarios debidamente autenticados podrán tener acceso a su cuenta y a las funciones de administración de servicios contratados.</p>
              <p><strong>4.4 Activación del servicio.</strong> El servicio se considera contratado y activo a partir de la fecha en que el sistema registre el pago correspondiente, sea mensual o anual. A partir de dicho momento, comenzará el cómputo del plazo para la entrega de la documentación requerida y se habilitarán las funcionalidades de seguimiento y contacto a través del portal del Cliente.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">5. Vigencia, Cancelación y Renovación</h3>
              <p><strong>5.1 Esquema de contratación y vigencia.</strong> El servicio puede contratarse bajo dos modalidades:</p>
              <ul className="list-disc pl-5">
                <li>a) Pago mensual, por vehículo, con vigencia de un mes natural a partir de la fecha de pago, o</li>
                <li>b) Pago anual, con vigencia de doce meses consecutivos contados desde la fecha de contratación.</li>
              </ul>
              <p>En ambos casos, el servicio estará activo únicamente durante los periodos efectivamente pagados por el Cliente. El servicio se suspenderá automáticamente en caso de falta de pago oportuno.</p>
              <p><strong>5.2 Cancelación por parte del Cliente.</strong> El Cliente podrá cancelar el servicio en cualquier momento, sin necesidad de justificación y sin penalización alguna. La cancelación se realiza desde el panel de control del usuario disponible en https://caravel.com.mx, mediante la opción correspondiente, surtiendo efectos a partir del mes siguiente a aquel en que se haya procesado la cancelación. En el caso del pago anual, el Cliente podrá solicitar la baja anticipada del servicio, pero no tendrá derecho a reembolso parcial o total, ya que el esquema anual incluye la cobertura de adeudos preexistentes sin límite de cuantía, que se entienden prestados al momento de activarse el servicio.</p>
              <p><strong>5.3 Efectos de la cancelación o suspensión.</strong> La cancelación o suspensión del servicio implica la terminación inmediata de cualquier obligación de CARAVEL respecto a multas o adeudos no cubiertos al momento del corte. El Cliente reconoce que, en estos casos, CARAVEL no estará obligado a iniciar ni continuar procedimientos de impugnación en curso o futuros.</p>
              <p><strong>5.4 Renovación automática.</strong> Salvo cancelación expresa por parte del Cliente, el servicio se renovará automáticamente al finalizar cada periodo contratado (mensual o anual), cargando el monto correspondiente a la forma de pago previamente registrada. CARAVEL se reserva el derecho de actualizar el importe del servicio de forma anual, conforme al Índice Nacional de Precios al Consumidor (INPC) publicado por el Instituto Nacional de Estadística y Geografía (INEGI), notificando al Cliente con al menos diez (10) días naturales de anticipación mediante su cuenta en el portal.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">6. Garantía del Servicio</h3>
              <p><strong>6.1 Compromiso de resultado.</strong> CARAVEL se obliga a prestar al Cliente un servicio legal orientado a la obtención de una sentencia favorable firme que declare la nulidad de las infracciones y adeudos vehiculares impugnados, así como a gestionar la eliminación de los registros correspondientes en las bases de datos públicas que afecten la regularización del vehículo. El compromiso de CARAVEL no se limita a realizar gestiones de buena fe, sino que implica una obligación de resultado en términos jurídicos, consistente en que el vehículo se encuentre libre de multas registradas en el mes de enero del año siguiente a la contratación, siempre que el contrato se haya celebrado en los plazos establecidos y el Cliente haya cumplido con sus obligaciones documentales.</p>
              <p><strong>6.2 Tiempos de resolución.</strong> El Cliente reconoce que los juicios administrativos y las gestiones de cancelación ante autoridades públicas están sujetos a plazos legales, cargas de trabajo institucionales y eventualidades procesales ajenas a CARAVEL. Por lo tanto, no se ofrece una garantía sobre el tiempo en que se alcanzará la resolución favorable, aunque en ningún caso el plazo excederá de dos años a partir del inicio del procedimiento correspondiente.</p>
              <p><strong>6.3 Garantía compensatoria.</strong> En caso de que, habiendo cumplido el Cliente con todos los requisitos y plazos establecidos, CARAVEL no obtuviera una sentencia favorable o no lograra cancelar la infracción, se obliga expresamente a cubrir el monto de la multa o adeudo correspondiente con cargo propio, sin necesidad de que el Cliente realice pago adicional alguno. Dicha garantía aplica exclusivamente cuando la causa de la subsistencia del adeudo no derive de omisiones, incumplimientos, documentación incompleta o cualquier actuación atribuible al Cliente.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">7. Excepciones y Limitaciones</h3>
              <p><strong>7.1 Supuestos de fuerza mayor e imposibilidad legal.</strong> CARAVEL no será responsable del incumplimiento o demora en la prestación del servicio cuando dicho incumplimiento derive de causas de fuerza mayor o caso fortuito, incluyendo, de forma enunciativa más no limitativa: cambios legislativos o administrativos súbitos, suspensión de actividades judiciales, caídas de sistemas informáticos oficiales, desastres naturales, pandemias, conflictos sociales, huelgas, fallas generalizadas de telecomunicaciones o cualquier evento fuera del control razonable del prestador. Asimismo, CARAVEL estará exento de responsabilidad cuando la continuación o inicio de una defensa resulte legalmente imposible por resolución firme, negativa administrativa insubsanable o caducidad del derecho a impugnar.</p>
              <p><strong>7.2 Responsabilidad limitada por causa del Cliente.</strong> El Cliente reconoce que la adecuada prestación del servicio depende de su colaboración oportuna. En consecuencia, CARAVEL no será responsable de la falta de cancelación de multas o adeudos cuando:</p>
              <ul className="list-disc pl-5">
                <li>a) El Cliente omita entregar documentación dentro del plazo de diez (10) días naturales señalado;</li>
                <li>b) La información o documentos proporcionados sean falsos, incompletos o ilegibles;</li>
                <li>c) El Cliente haya consentido, pagado o reconocido expresamente el adeudo, renunciando con ello a medios de defensa;</li>
                <li>d) El Cliente incumpla con cualquier requerimiento razonable necesario para el ejercicio de la defensa jurídica.</li>
              </ul>
              <p><strong>7.3 Limitación de responsabilidad indirecta.</strong> CARAVEL no será responsable, en ningún caso, de daños indirectos, pérdida de beneficios, afectación a calificaciones crediticias, negativa de trámites administrativos o cualquier otro efecto secundario que derive de la existencia o subsistencia temporal de multas vehiculares, salvo en los casos expresamente cubiertos por la garantía establecida en la Cláusula 6.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">8. Medios de Comunicación y Atención</h3>
              <p><strong>8.1 Portal del Cliente.</strong> CARAVEL pone a disposición del Cliente una plataforma digital de gestión accesible a través del sitio web https://caravel.com.mx, donde podrá consultar el estatus de su servicio, cargar documentos, monitorear los avances relacionados con su(s) vehículo(s), actualizar información y administrar sus pagos y renovaciones.</p>
              <p><strong>8.2 Acceso autenticado.</strong> El acceso a dicha plataforma se encuentra protegido mediante un sistema de verificación en dos pasos, utilizando el número telefónico proporcionado por el Cliente al momento de la contratación. Solo los usuarios autenticados podrán acceder a la cuenta y realizar gestiones vinculadas al servicio.</p>
              <p><strong>8.3 Sección de seguimiento y soporte.</strong> El portal incluye una sección específica de seguimiento legal y soporte técnico, desde la cual el Cliente podrá:</p>
              <ul className="list-disc pl-5">
                <li>Consultar el historial de infracciones impugnadas,</li>
                <li>Visualizar el avance procesal de cada expediente,</li>
                <li>Contactar directamente al equipo de atención de CARAVEL mediante mensajería interna, y</li>
                <li>Recibir notificaciones relevantes sobre su servicio.</li>
              </ul>
              <p>Cualquier duda, aclaración, solicitud de cancelación o ejercicio de derechos será atendida a través de dicho canal, sin perjuicio de los medios legales adicionales previstos en este contrato.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">9. Propiedad Intelectual y Uso del Sitio Web</h3>
              <p><strong>9.1 Titularidad de derechos.</strong> CARAVEL es titular exclusivo de todos los derechos de propiedad intelectual e industrial relacionados con el nombre comercial, el diseño del sitio web https://caravel.com.mx, su estructura, interfaces, funcionalidades, código fuente, bases de datos, imágenes, textos, documentos, videos, marcas, signos distintivos y demás contenidos incorporados o asociados a la prestación del servicio. El uso del sitio y sus herramientas por parte del Cliente no implica cesión, licencia, ni autorización alguna, más allá de lo estrictamente necesario para la ejecución del presente contrato.</p>
              <p><strong>9.2 Uso autorizado y restricciones.</strong> El Cliente se compromete a utilizar el sitio web y la plataforma de manera legal, ética y conforme a los fines pactados en este contrato. Queda expresamente prohibido:</p>
              <ul className="list-disc pl-5">
                <li>a) Reproducir, modificar, copiar, distribuir o comunicar públicamente cualquier parte del sitio o sus contenidos sin autorización previa por escrito;</li>
                <li>b) Utilizar ingeniería inversa, técnicas de extracción de datos o cualquier procedimiento destinado a descompilar, desmontar o interferir con la operación del portal;</li>
                <li>c) Usar el sitio para fines fraudulentos, ilegales, o para representar a terceros sin consentimiento expreso;</li>
                <li>d) Suplantar identidad, manipular registros, cargar documentos falsos o alterar deliberadamente el funcionamiento de la plataforma.</li>
              </ul>
              <p>El incumplimiento de esta cláusula facultará a CARAVEL a suspender de inmediato el servicio, sin necesidad de resolución judicial ni derecho a reembolso, reservándose además las acciones legales correspondientes por daños y perjuicios.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">10. Modificaciones al Contrato</h3>
              <p><strong>10.1 Facultad de modificación.</strong> CARAVEL se reserva el derecho de modificar, actualizar o ajustar los presentes Términos y Condiciones, en cualquier momento, con el fin de reflejar mejoras operativas, cambios normativos, actualizaciones tecnológicas, ajustes económicos o nuevas disposiciones regulatorias aplicables a la prestación del servicio. Dichas modificaciones podrán referirse tanto a aspectos sustantivos del contrato (incluyendo alcance, tarifas, requisitos, procesos y renovaciones), como a elementos formales y técnicos del sitio web o del modelo de atención.</p>
              <p><strong>10.2 Notificación y aceptación tácita.</strong> Cualquier modificación será comunicada al Cliente mediante publicación visible en el portal https://caravel.com.mx y mediante mensaje dentro del panel de usuario. En caso de que el Cliente continúe utilizando el servicio y no manifieste oposición dentro de los cinco (5) días hábiles posteriores a su publicación, se entenderá que acepta de forma tácita e irrevocable las nuevas condiciones. En caso de no estar de acuerdo con las modificaciones, el Cliente podrá cancelar el servicio conforme a lo previsto en la Cláusula 5, sin penalización alguna.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">11. Legislación Aplicable y Jurisdicción</h3>
              <p>El presente contrato se celebra en territorio mexicano y se regirá e interpretará de conformidad con lo dispuesto en el Código Civil Federal, el Código de Comercio, y demás leyes, reglamentos y disposiciones administrativas vigentes en el estado de Jalisco, en lo que resulten aplicables a la naturaleza del servicio prestado.</p>
              <p>Para la interpretación y cumplimiento de este contrato, así como para la resolución de cualquier controversia derivada del mismo, las partes se someten expresa e irrevocablemente a la jurisdicción de los tribunales competentes en la ciudad de Zapopan, Jalisco, renunciando a cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro, o por cualquier otra causa.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">12. Interpretación, Separabilidad y Anticorrupción</h3>
              <p><strong>12.1 Principios interpretativos.</strong> El presente contrato debe interpretarse en su conjunto, conforme a la buena fe, el uso honesto del comercio, la equidad contractual y la finalidad jurídica del servicio pactado. En caso de duda en la interpretación de alguna cláusula, prevalecerá aquella que otorgue mayor eficacia a las obligaciones asumidas por las partes y que permita cumplir con el objeto del contrato.</p>
              <p><strong>12.2 Separabilidad.</strong> En caso de que cualquier cláusula, disposición o sección del presente contrato sea declarada nula, inválida o ineficaz por autoridad competente, tal circunstancia no afectará la validez del resto del contrato, el cual permanecerá vigente y exigible en todos sus demás términos, salvo que se trate de un elemento esencial que impida su ejecución.</p>
              <p><strong>12.3 Declaración de integridad y anticorrupción.</strong> Las partes declaran que en la celebración, ejecución y cumplimiento del presente contrato:</p>
              <ul className="list-disc pl-5">
                <li>a) No ha mediado soborno, cohecho, promesa, dádiva, presión o ventaja indebida de ningún tipo;</li>
                <li>b) Se han conducido en todo momento con apego a la legalidad, ética profesional y principios de integridad comercial; y</li>
                <li>c) Se obligan a abstenerse de cualquier práctica que contravenga normas anticorrupción nacionales o internacionales.</li>
              </ul>
              <p>El incumplimiento de esta disposición facultará a CARAVEL a cancelar de forma inmediata el servicio, sin responsabilidad alguna y con independencia de las acciones legales que procedan.</p>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-xl font-bold text-foreground mb-4">IV. AVISO DE PRIVACIDAD</h2>

              <h3 className="text-lg font-semibold mb-2">1. Identidad y domicilio del responsable</h3>
              <p>El responsable del tratamiento de sus datos personales es Santiago Calderón Chávez, quien opera bajo la marca comercial CARAVEL, con domicilio en calle Allioth, número 4140, colonia Arboledas 1ª Sección, localidad San Gonzalo Torre Vieja, municipio de Zapopan, estado de Jalisco, C.P. 45070.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">2. Datos personales recabados</h3>
              <p>CARAVEL recaba y trata los siguientes datos personales del Cliente, ya sea en su calidad de persona física o representante legal de una persona moral:</p>
              <ul className="list-disc pl-5">
                <li>Nombre completo</li>
                <li>Número telefónico</li>
                <li>Correo electrónico</li>
                <li>Datos de identificación oficial (INE)</li>
                <li>Domicilio</li>
                <li>Información del vehículo (placas, tarjeta de circulación, historial de refrendo)</li>
                <li>Documentación jurídica del vehículo (contrato de arrendamiento, en su caso)</li>
                <li>Documentación legal del representante (actas notariales y poderes, en caso de personas morales)</li>
              </ul>
              <p>No se recaban datos personales sensibles.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">3. Finalidades del tratamiento</h3>
              <p>Los datos personales serán utilizados para las siguientes finalidades:</p>
              <ul className="list-disc pl-5">
                <li>a) Prestación del servicio jurídico contratado, consistente en la representación legal ante autoridades administrativas para la impugnación de infracciones vehiculares;</li>
                <li>b) Autenticación y validación de identidad del Cliente, así como de la titularidad o posesión del vehículo;</li>
                <li>c) Comunicación directa, envío de notificaciones, seguimiento del estado del servicio, y contacto a través del portal o medios registrados;</li>
                <li>d) Cumplimiento de obligaciones legales o contractuales;</li>
                <li>e) Análisis estadístico y mejora de procesos internos, sin fines comerciales adicionales.</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6 mb-2">4. Transferencias de datos (no aplicables)</h3>
              <p>CARAVEL no realiza transferencias de datos personales a terceros, nacionales ni extranjeros, salvo aquellas que resulten necesarias para el cumplimiento de una orden judicial o administrativa debidamente fundada, o en el ejercicio de las acciones legales a nombre del Cliente en cumplimiento del objeto del contrato.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">5. Derechos ARCO</h3>
              <p>El Cliente podrá ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación u Oposición (ARCO) respecto a sus datos personales, mediante solicitud electrónica dirigida a través de la cuenta de usuario en el portal web o enviando correo electrónico desde la dirección registrada, con atención a CARAVEL. La solicitud deberá incluir el nombre del titular, la descripción clara de los datos respecto de los cuales se solicita el ejercicio de derechos, copia de identificación oficial y, en su caso, documentación que acredite su representación.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">6. Medidas de seguridad</h3>
              <p>CARAVEL ha implementado medidas técnicas, administrativas y físicas necesarias para proteger los datos personales contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado. Los datos son almacenados en servidores propios y en soluciones en la nube con cifrado, acceso controlado y protocolos de respaldo.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">7. Uso de cookies y tecnologías de rastreo</h3>
              <p>CARAVEL no utiliza cookies, web beacons ni tecnologías de rastreo similares para la recolección de datos personales a través del portal web.</p>

              <h3 className="text-lg font-semibold mt-6 mb-2">8. Modificaciones al aviso</h3>
              <p>CARAVEL podrá modificar el presente Aviso de Privacidad en cualquier momento para adaptarlo a cambios legislativos, políticas internas o nuevos requerimientos para la prestación del servicio. Las modificaciones serán publicadas en el sitio web https://caravel.com.mx, y se entenderán aceptadas por el Cliente al continuar utilizando la plataforma.</p>
            </section>

            <section className="border-t pt-8 mt-8">
              <h2 className="text-xl font-bold text-foreground mb-4">V. CLÁUSULA DE CONSENTIMIENTO DIGITAL</h2>
              <p>El Cliente reconoce y acepta que al seleccionar la opción de “acepto los términos y condiciones” al momento de la contratación a través del sitio web https://caravel.com.mx, se entiende otorgado su consentimiento expreso, pleno e informado, en términos de lo dispuesto por la legislación civil, mercantil y de protección de datos personales vigente en los Estados Unidos Mexicanos.</p>
              <p>Dicha aceptación digital:</p>
              <ul className="list-disc pl-5">
                <li>a) Tiene la misma validez, fuerza legal y efectos jurídicos que una firma autógrafa, conforme al Código de Comercio, la Ley de Firma Electrónica Avanzada y demás normativas aplicables;</li>
                <li>b) Faculta a CARAVEL para actuar en nombre y representación del Cliente, promoviendo y desahogando procedimientos administrativos o judiciales necesarios para cumplir con el objeto del contrato;</li>
                <li>c) Acredita que el Cliente ha leído, comprendido y aceptado voluntariamente el contenido íntegro del presente instrumento, incluyendo el Aviso de Privacidad y sus efectos legales.</li>
              </ul>
              <p>El Cliente podrá, en cualquier momento, consultar, descargar y conservar una copia de estos Términos y Condiciones desde el sitio web oficial, constituyendo ello prueba plena de la relación contractual para todos los efectos legales a que haya lugar.</p>
            </section>

            <section className="bg-muted/30 p-6 rounded-lg border mt-8">
              <h3 className="text-lg font-bold text-foreground mb-4">FORMATO PARA EL EJERCICIO DE DERECHOS ARCO</h3>
              <p className="text-sm text-muted-foreground mb-4">(Acceso, Rectificación, Cancelación u Oposición de datos personales)</p>

              <div className="space-y-4 text-sm">
                <p><strong>Dirigido a:</strong> Santiago Calderón Chávez / CARAVEL<br />
                  <strong>Domicilio:</strong> Calle Allioth 4140, Arboledas 1ª Sección, Zapopan, Jalisco, C.P. 45070<br />
                  <strong>Portal web:</strong> https://caravel.com.mx</p>

                <div className="space-y-2">
                  <p className="font-semibold">1. Datos del titular de los datos personales</p>
                  <ul className="list-disc pl-5">
                    <li>Nombre completo: __________________________________________</li>
                    <li>Correo electrónico registrado: _______________________________</li>
                    <li>Número telefónico registrado: ________________________________</li>
                    <li>Relación con CARAVEL (Cliente / Representante legal): ______________________</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">2. Tipo de derecho que desea ejercer</p>
                  <p>(Marcar solo uno por formato. Para múltiples solicitudes, enviar un formato por cada derecho.)</p>
                  <ul className="list-none pl-5 space-y-1">
                    <li>☐ Acceso (Conocer qué datos tiene CARAVEL sobre mí)</li>
                    <li>☐ Rectificación (Solicitar corrección de datos incorrectos o incompletos)</li>
                    <li>☐ Cancelación (Solicitar eliminación de mis datos personales)</li>
                    <li>☐ Oposición (Solicitar que no se usen mis datos para ciertos fines)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">3. Descripción clara y precisa de la solicitud</p>
                  <p>(Indicar el motivo de la solicitud, datos a corregir o eliminar, y cualquier información relevante para atender el caso.)</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">4. Documentos que se anexan</p>
                  <ul className="list-none pl-5 space-y-1">
                    <li>☐ Copia de INE vigente (obligatorio)</li>
                    <li>☐ Documentos que acreditan representación legal (si aplica)</li>
                    <li>☐ Otros (especificar): ________________________________________</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">5. Medio de respuesta deseado</p>
                  <ul className="list-none pl-5 space-y-1">
                    <li>☐ Correo electrónico (a la dirección registrada)</li>
                    <li>☐ A través del portal del Cliente</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-4">
                  <p className="font-semibold">6. Firma del titular o representante legal</p>
                  <p>Declaro bajo protesta de decir verdad que los datos aquí asentados son verídicos y que soy el titular legítimo (o su representante legal) de los datos personales que se solicitan.</p>
                  <p className="mt-8">Firma: ___________________________</p>
                  <p>Fecha: _____ / ______ / ______</p>
                </div>

                <div className="bg-white p-4 rounded border mt-4">
                  <p className="font-semibold">Instrucciones de envío:</p>
                  <p>Este formato deberá enviarse digitalmente a través de la cuenta de Cliente en el portal https://caravel.com.mx, o en su defecto mediante el correo electrónico previamente registrado. Toda solicitud será respondida en un plazo máximo de 20 días hábiles, conforme a la normativa aplicable.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;