import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QuoteCalculator } from '@/components/QuoteCalculator';
import { ContactModal } from '@/components/ContactModal';
import { BenefitsSection } from '@/components/BenefitsSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { FaqSection } from '@/components/FaqSection';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogoClick = () => {
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={handleLogoClick}
            >
              <img 
                src="/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png" 
                alt="CARAVEL Logo" 
                className="h-16 w-auto"
              />
            </div>
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>
                Mi Dashboard
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Quote Calculator */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text & Calculator */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Tu vehículo blindado contra multas. Solo{' '}
                  <span className="text-primary">$200/mes</span>.{' '}
                
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground">
                  Elimina el estrés. Nosotros nos encargamos de las multas.
                </p>
              </div>

              {/* Quote Calculator */}
              <QuoteCalculator 
                onContactClick={() => setShowContactModal(true)} 
              />
            </div>

            {/* Right Column - Hero Image */}
            <div className="lg:order-last">
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Flotilla protegida por CARAVEL" 
                  className="w-full h-auto rounded-2xl shadow-elevated"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Benefits Section */}
      <BenefitsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ */}
      <FaqSection />

      {/* Final Contact Section */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              ¿Tienes una flotilla grande o necesitas una solución especial?
            </h2>
            <p className="text-xl opacity-90">
              Nuestro equipo de especialistas está listo para crear la solución perfecta para tu empresa
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setShowContactModal(true)}
              className="bg-white text-primary hover:bg-gray-50 text-lg px-8 py-6"
            >
              Habla con nuestro equipo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <span className="text-xl font-bold">CARAVEL</span>
              </div>
              <p className="text-gray-300">
                La solución integral para proteger tu flotilla contra multas vehiculares en México.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Contacto</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>3318497494</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>caravel@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Guadalajara, Jalisco</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <div className="space-y-2 text-gray-300">
                <a href="#" className="block hover:text-white transition-colors">
                  Términos y Condiciones
                </a>
                <a href="#" className="block hover:text-white transition-colors">
                  Política de Privacidad
                </a>
                <a href="#" className="block hover:text-white transition-colors">
                  Aviso de Privacidad
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 CARAVEL. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal 
        open={showContactModal} 
        onOpenChange={setShowContactModal} 
      />
    </div>
  );
};

export default Index;
