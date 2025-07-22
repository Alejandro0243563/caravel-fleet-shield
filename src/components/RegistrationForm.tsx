import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Phone, Mail, FileText, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    plateNumber: '',
    circulationCard: null as File | null
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "¡Registro iniciado!",
      description: "Te contactaremos pronto para completar tu registro.",
    });
    // Here you would handle the actual form submission
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, circulationCard: file }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          Completa tu registro
        </CardTitle>
        <p className="text-muted-foreground">
          Solo necesitamos algunos datos para proteger tu flotilla
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Número de teléfono *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+52 55 1234 5678"
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

          {/* Plate Number */}
          <div className="space-y-2">
            <Label htmlFor="plateNumber" className="text-sm font-medium flex items-center gap-2">
              <Car className="w-4 h-4" />
              Número de placa (vehículo principal)
            </Label>
            <Input
              id="plateNumber"
              type="text"
              placeholder="ABC-123-D"
              value={formData.plateNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))}
              className="transition-all duration-200 focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Tarjeta de circulación (imagen o PDF)
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="circulation-card"
              />
              <label
                htmlFor="circulation-card"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                {formData.circulationCard ? (
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      {formData.circulationCard.name}
                    </p>
                    <p className="text-muted-foreground">
                      Haz clic para cambiar archivo
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    <p>Haz clic para subir tu tarjeta de circulación</p>
                    <p>Formatos: JPG, PNG, PDF (máx. 5MB)</p>
                  </div>
                )}
              </label>
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