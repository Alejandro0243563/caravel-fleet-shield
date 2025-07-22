import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Carlos Mendoza",
    company: "Transportes del Valle",
    vehicles: "15 vehículos",
    content: "CARAVEL nos ha ahorrado miles de pesos en multas y tiempo perdido. Ahora me enfoco en hacer crecer mi negocio en lugar de lidiar con infracciones.",
    rating: 5,
    location: "Ciudad de México"
  },
  {
    id: 2,
    name: "María González",
    company: "Logística Express",
    vehicles: "8 vehículos",
    content: "El servicio es excelente. Ya no me preocupo por las multas de mis conductores. El equipo de CARAVEL maneja todo de manera profesional y rápida.",
    rating: 5,
    location: "Guadalajara"
  },
  {
    id: 3,
    name: "Roberto Silva",
    company: "Reparto Rápido",
    vehicles: "25 vehículos",
    content: "Con CARAVEL, eliminé por completo el estrés de las multas. El descuento por volumen me conviene mucho y el servicio es impecable.",
    rating: 5,
    location: "Monterrey"
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Miles de empresas ya confían en CARAVEL para proteger sus flotillas
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white shadow-card hover:shadow-elevated transition-all duration-300">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-accent" />
                  
                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-foreground leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Author Info */}
                  <div className="pt-4 border-t border-border">
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.company}
                    </div>
                    <div className="text-sm text-accent font-medium">
                      {testimonial.vehicles} • {testimonial.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 bg-white rounded-lg p-6 shadow-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Empresas</div>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-muted-foreground">Vehículos</div>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Satisfacción</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};