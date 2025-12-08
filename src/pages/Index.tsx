import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QuoteCalculator } from '@/components/QuoteCalculator';
import { ContactModal } from '@/components/ContactModal';
import { BenefitsSection } from '@/components/BenefitsSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FaqSection } from '@/components/FaqSection';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';
import { organizationSchema, websiteSchema, serviceSchema, faqSchema } from '@/utils/seo-schemas';
import { TrustSection } from '@/components/TrustSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { ServicesSection } from '@/components/ServicesSection';

const Index = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const handleLogoClick = () => {
    if (window.location.pathname === '/') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      navigate('/');
    }
  };
  const combinedJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      websiteSchema,
      serviceSchema,
      faqSchema
    ]
  };

  return (
    <>
      <SEO
        title="CARAVEL - Protección contra multas desde $200/mes"
        description="Protege tu flotilla contra multas vehiculares en México. Servicio legal, transparente y sin mordidas desde $200 MXN/mes por vehículo."
        canonical="https://caravel.com/"
        jsonLd={combinedJsonLd}
      />
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Header */}
        <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
                <img src="/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png" alt="CARAVEL Logo" className="h-16 w-auto" />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setShowContactModal(true)}>
                  Contactar
                </Button>
                {user ? <Button onClick={() => navigate('/dashboard')}>
                  Mi Dashboard
                </Button> : <Button onClick={() => navigate('/auth')}>
                  Iniciar Sesión
                </Button>}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section with Quote Calculator (Option A) */}
        <section className="bg-gradient-hero py-16 md:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-primary/20 text-primary font-medium animate-in fade-in slide-in-from-left-4">
                    <Shield className="w-4 h-4" />
                    <span>Líderes en defensa vehicular corporativa</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Tu vehículo blindado contra multas. <br />
                    <span className="text-primary">Garantizado.</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-lg">
                    Elimina el estrés y la corrupción. Nosotros absorbemos el riesgo legal de tu flotilla.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} variant="outline" className="text-lg px-8 py-6">
                    Ver otras opciones
                  </Button>
                </div>
              </div>

              {/* Right Column - Quote Calculator */}
              <div className="lg:ml-auto w-full">
                <QuoteCalculator onContactClick={() => setShowContactModal(true)} />
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent -z-0" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-0" />
        </section>

        {/* Services Section (Option B & C) */}
        <ServicesSection onContactClick={() => setShowContactModal(true)} />

        {/* Trust Indicators */}
        <TrustSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* FAQ */}
        <FaqSection />

        {/* Final Contact Section */}
        <section className="py-20 bg-gradient-primary text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold">
                ¿Tienes una flotilla grande?
              </h2>
              <p className="text-xl opacity-90 leading-relaxed">
                Diseñamos soluciones a la medida para empresas con más de 50 vehículos.
                Optimiza tus costos operativos hoy mismo.
              </p>
              <Button size="lg" variant="secondary" onClick={() => setShowContactModal(true)} className="bg-white text-primary hover:bg-gray-50 text-lg px-10 py-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                Habla con un especialista
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-12">
              <div className="space-y-6 col-span-1 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-8 h-8 text-primary" />
                  <span className="text-2xl font-bold">CARAVEL</span>
                </div>
                <p className="text-gray-400 max-w-md text-lg">
                  La solución integral para proteger tu flotilla contra multas vehiculares en México. Legalidad, transparencia y eficiencia.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-lg">Contacto</h3>
                <div className="space-y-4 text-gray-400">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>3318497494</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>caravel@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>Av Pablo Neruda 3055, Providencia 4a. Secc, 44639 Guadalajara, Jal.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-lg">Legal</h3>
                <div className="space-y-3 text-gray-400">
                  <button onClick={() => navigate('/terminos-y-condiciones')} className="block hover:text-white transition-colors text-left">
                    Términos y Condiciones
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
              <p>&copy; {new Date().getFullYear()} CARAVEL. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>

        {/* Contact Modal */}
        <ContactModal open={showContactModal} onOpenChange={setShowContactModal} />

        {/* WhatsApp Float Button */}
        <WhatsAppFloat />
      </div>
    </>
  );
};
export default Index;