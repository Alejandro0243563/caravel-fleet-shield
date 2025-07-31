import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png" 
                alt="CARAVEL Logo" 
                className="h-16 w-auto"
              />
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Términos y Condiciones de Servicio
            </CardTitle>
            <p className="text-muted-foreground text-center">
              Última actualización: {new Date().toLocaleDateString('es-MX')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
              <p>
                Al utilizar los servicios de CARAVEL, usted acepta estar sujeto a estos términos y condiciones. 
                Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestros servicios.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
              <p>
                CARAVEL proporciona servicios de protección y gestión de multas vehiculares. Nuestro servicio 
                incluye el monitoreo de infracciones, gestión de trámites y asesoría legal relacionada con 
                multas de tránsito.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Registro y Cuenta de Usuario</h2>
              <p>
                Para utilizar nuestros servicios, debe registrarse proporcionando información precisa y 
                actualizada. Es responsable de mantener la confidencialidad de sus credenciales de acceso 
                y de todas las actividades que ocurran bajo su cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Suscripciones y Pagos</h2>
              <p>
                Los servicios de CARAVEL están disponibles mediante suscripción mensual o anual. Los pagos 
                se procesan de forma segura a través de Stripe. Las suscripciones se renuevan automáticamente 
                a menos que se cancelen antes del próximo período de facturación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Uso de la Información</h2>
              <p>
                Al registrar sus vehículos, usted autoriza a CARAVEL a consultar bases de datos oficiales 
                para verificar infracciones y gestionar los trámites correspondientes. Toda la información 
                se maneja de acuerdo con nuestra política de privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Limitaciones del Servicio</h2>
              <p>
                CARAVEL se compromete a brindar el mejor servicio posible, sin embargo, no garantiza la 
                eliminación del 100% de las multas. Los resultados pueden variar según las circunstancias 
                específicas de cada caso y las regulaciones locales aplicables.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cancelación</h2>
              <p>
                Puede cancelar su suscripción en cualquier momento desde su panel de usuario o contactándonos 
                directamente. La cancelación será efectiva al final del período de facturación actual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Modificaciones</h2>
              <p>
                CARAVEL se reserva el derecho de modificar estos términos y condiciones en cualquier momento. 
                Las modificaciones serán notificadas a los usuarios y entrarán en vigor inmediatamente después 
                de su publicación.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
              <p>
                Para cualquier pregunta sobre estos términos y condiciones, puede contactarnos a través de 
                WhatsApp al número 33-1849-7494 o a través de nuestro formulario de contacto en el sitio web.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Ley Aplicable</h2>
              <p>
                Estos términos y condiciones se rigen por las leyes de México. Cualquier disputa relacionada 
                con estos términos será resuelta en los tribunales competentes de México.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;