import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, XCircle, ArrowLeft, Phone } from 'lucide-react';
import { useEffect } from 'react';

const Cancel = () => {
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTryAgain = () => {
    navigate('/registro?vehicles=1');
  };

  const handleGoHome = () => {
    navigate('/');
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png" 
                alt="CARAVEL Logo" 
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Cancel Card */}
        <Card className="border-2 border-warning/20 bg-warning/5">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <XCircle className="w-20 h-20 text-warning" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              ¿Cancelaste tu pago?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="bg-white p-6 rounded-lg border border-border">
              <p className="text-lg text-foreground leading-relaxed">
                Parece que no finalizaste el proceso. Si necesitas ayuda o tienes dudas, contáctanos y con gusto te apoyamos.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="lg" 
                  onClick={handleTryAgain}
                  className="bg-gradient-accent hover:shadow-glow transition-all duration-300 text-lg px-8 py-6"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Intentar de nuevo
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg" 
                  onClick={handleGoHome}
                  className="border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-6"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                ¿Necesitas ayuda? Contáctanos:
              </p>
              <div className="space-y-1 text-muted-foreground">
                <p>📞 3318497494</p>
                <p>✉️ caravel@gmail.com</p>
                <p>📍 Guadalajara, Jalisco</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cancel;