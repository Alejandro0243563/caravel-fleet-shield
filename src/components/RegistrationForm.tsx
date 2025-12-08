import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Phone, Mail, FileText, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RegistrationFormProps {
  vehicleCount: number;
  onClose?: () => void;
}

export const RegistrationForm = ({ vehicleCount, onClose }: RegistrationFormProps) => {
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    vehicles: Array.from({ length: vehicleCount }, () => ({
      plateNumber: '',
      circulationCard: null as File | null
    }))
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.phone || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor completa tu teléfono y correo electrónico.",
        variant: "destructive"
      });
      return;
    }

    const incompleteVehicles = formData.vehicles.filter(v => !v.plateNumber || !v.circulationCard);
    if (incompleteVehicles.length > 0) {
      toast({
        title: "Error",
        description: `Te faltan completar ${incompleteVehicles.length} vehículo(s). Completa todos los datos.`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "¡Registro completado!",
      description: "Te contactaremos pronto para activar tu protección.",
    });
    
    if (onClose) onClose();
  };

  const handleFileChange = (vehicleIndex: number, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((vehicle, index) => 
        index === vehicleIndex ? { ...vehicle, circulationCard: file } : vehicle
      )
    }));
  };

  const handlePlateChange = (vehicleIndex: number, plateNumber: string) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((vehicle, index) => 
        index === vehicleIndex ? { ...vehicle, plateNumber: plateNumber.toUpperCase() } : vehicle
      )
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Completa tu registro
        </CardTitle>
        <p className="text-muted-foreground">
          {vehicleCount === 1 
            ? "Solo necesitamos algunos datos para proteger tu vehículo"
            : `Necesitamos algunos datos para proteger tus ${vehicleCount} vehículos`
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Information */}
          <div className="space-y-6 p-6 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground">Información de contacto</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Número de teléfono *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="3318497494"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Correo electrónico *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu.email@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Información de {vehicleCount === 1 ? "vehículo" : "vehículos"}
            </h3>
            
            <div className={`grid gap-6 ${vehicleCount > 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {formData.vehicles.map((vehicle, index) => (
                <Card key={index} className="p-6 bg-white border border-border shadow-sm">
                  <h4 className="text-md font-medium text-foreground mb-4">
                    {vehicleCount === 1 ? "Tu vehículo" : `Vehículo ${index + 1}`}
                  </h4>
                  
                  {/* Plate Number */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor={`plate-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Número de placa *
                    </Label>
                    <Input
                      id={`plate-${index}`}
                      type="text"
                      placeholder="ABC-123-D"
                      value={vehicle.plateNumber}
                      onChange={(e) => handlePlateChange(index, e.target.value)}
                      required
                      className="transition-all duration-200 focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Tarjeta de circulación *
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-accent transition-colors">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                        className="hidden"
                        id={`circulation-card-${index}`}
                        required
                      />
                      <label
                        htmlFor={`circulation-card-${index}`}
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        {vehicle.circulationCard ? (
                          <div className="text-sm">
                            <p className="font-medium text-foreground">
                              {vehicle.circulationCard.name}
                            </p>
                            <p className="text-muted-foreground">
                              Haz clic para cambiar
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            <p>Subir tarjeta</p>
                            <p>JPG, PNG, PDF</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg py-6"
          >
            Completar registro
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Al registrarte, aceptas nuestros términos y condiciones de servicio.
            Tus datos están protegidos bajo nuestra política de privacidad.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};