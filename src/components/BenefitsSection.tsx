import { Card, CardContent } from '@/components/ui/card';
import { Shield, Banknote, Clock, CheckCircle, Users, Smartphone } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: "Cero estrés por multas",
    description: "Olvídate de las multas para siempre. Nuestro equipo legal se encarga de todo el proceso de defensa y gestión.",
    features: ["Defensa legal especializada", "Sin comparecencias", "Seguimiento 24/7"]
  },
  {
    icon: Banknote,
    title: "Sin mordidas, todo legal",
    description: "Proceso 100% transparente y legal. Sin corrupción, sin mordidas, solo un servicio profesional y ético.",
    features: ["Proceso transparente", "Documentación completa", "Cumplimiento legal total"]
  },
  {
    icon: Users,
    title: "Ahorros automáticos por volumen",
    description: "Entre más vehículos tengas, más ahorras. Descuentos automáticos que crecen con tu flotilla.",
    features: ["10% descuento cada 10 vehículos", "Hasta 50% de descuento", "Precios especiales para empresas"]
  }
];

const additionalFeatures = [
  "Dashboard en tiempo real para monitorear tu flotilla",
  "Reportes mensuales detallados de todas las gestiones",
  "Soporte por WhatsApp y teléfono",
  "App móvil para gestión desde cualquier lugar",
  "Notificaciones instantáneas de nuevas multas",
  "Histórico completo de infracciones resueltas"
];

export const BenefitsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Por qué CARAVEL?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            La solución completa para liberar tu flotilla del estrés de las multas vehiculares
          </p>
        </div>

        {/* Main Benefits */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="bg-white shadow-card hover:shadow-elevated transition-all duration-300 border-0">
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {benefit.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-gradient-hero rounded-3xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Herramientas que facilitan tu trabajo
            </h3>
            <p className="text-muted-foreground">
              Tecnología de punta para el manejo eficiente de tu flotilla
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Tech Stack Icons */}
          <div className="mt-8 flex justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <span className="text-sm">App Móvil</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Tiempo Real</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};