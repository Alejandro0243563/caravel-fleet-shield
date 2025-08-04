import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, Home } from 'lucide-react';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Success = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update vehicle status after successful payment
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const updateVehicleStatus = async () => {
      // Get user from localStorage (saved before payment)
      const userIdFromStorage = localStorage.getItem('currentUserId');
      
      if (userIdFromStorage) {
        try {
          const { data, error } = await supabase.functions.invoke('update-vehicle-status', {
            body: { userId: userIdFromStorage }
          });

          if (error) {
            console.error('Error updating vehicle status:', error);
            toast({
              title: "Aviso",
              description: "El pago fue exitoso. Nuestro equipo verificará tu información pronto.",
              variant: "default",
            });
          } else {
            console.log('Vehicle status updated successfully:', data);
            // Clear the stored user ID
            localStorage.removeItem('currentUserId');
          }
        } catch (error) {
          console.error('Error processing vehicle status update:', error);
        }
      }

      // Clean up any remaining pending vehicles from localStorage
      localStorage.removeItem('pendingVehicles');
    };

    updateVehicleStatus();
  }, [toast]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
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
                className="h-16 w-auto"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Success Card */}
        <Card className="border-2 border-success/20 bg-success/5">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-20 h-20 text-success" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              ¡Gracias por confiar en CARAVEL!
            </CardTitle>
            <p className="text-xl text-success font-semibold">
              Tu suscripción fue procesada con éxito.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="bg-white p-6 rounded-lg border border-border">
              <p className="text-lg text-foreground leading-relaxed">
                Nuestro equipo se pondrá en contacto contigo para validar tu información y activar la protección de tu(s) vehículo(s).
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Te enviaremos todas las actualizaciones a tu correo electrónico registrado.
              </p>
              
              <Button 
                size="lg" 
                onClick={handleGoHome}
                className="w-full md:w-auto bg-gradient-accent hover:shadow-glow transition-all duration-300 text-lg px-12 py-6"
              >
                <Home className="w-5 h-5 mr-2" />
                Volver al inicio
              </Button>
            </div>

            {/* Contact Info */}
            <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium">¿Tienes dudas? Contáctanos:</p>
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

export default Success;
