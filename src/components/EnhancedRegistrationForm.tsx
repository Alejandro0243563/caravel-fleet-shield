import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Car, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PhoneAuthForm } from './PhoneAuthForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';

interface EnhancedRegistrationFormProps {
  vehicleCount: number;
  onClose?: () => void;
}

export const EnhancedRegistrationForm = ({ vehicleCount, onClose }: EnhancedRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    vehicles: Array.from({ length: vehicleCount }, () => ({
      plateNumber: '',
      circulationCard: null as File | null,
      esPersonaMoral: false,
      ineFile: null as File | null
    }))
  });
  const { toast } = useToast();
  const { user } = useAuth();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const incompleteVehicles = formData.vehicles.filter(v => 
      !v.plateNumber || !v.circulationCard || (!v.esPersonaMoral && !v.ineFile)
    );
    
    if (incompleteVehicles.length > 0) {
      toast({
        title: "Error",
        description: `Te faltan completar ${incompleteVehicles.length} vehículo(s). Completa todos los datos.`,
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para registrar vehículos.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload files and create vehicle records
      for (const [index, vehicle] of formData.vehicles.entries()) {
        // Upload circulation card
        const circulationCardPath = `circulation_cards/${user.id}/${Date.now()}_${index}`;
        const { error: uploadError1 } = await supabase.storage
          .from('documents')
          .upload(circulationCardPath, vehicle.circulationCard!);

        if (uploadError1) {
          throw new Error(`Error al subir tarjeta de circulación: ${uploadError1.message}`);
        }

        let ineUrl = null;
        if (!vehicle.esPersonaMoral && vehicle.ineFile) {
          const inePath = `ine/${user.id}/${Date.now()}_${index}`;
          const { error: uploadError2 } = await supabase.storage
            .from('documents')
            .upload(inePath, vehicle.ineFile);

          if (uploadError2) {
            throw new Error(`Error al subir INE: ${uploadError2.message}`);
          }
          ineUrl = inePath;
        }

        // Create vehicle record
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            user_id: user.id,
            license_plate: vehicle.plateNumber,
            circulation_card_url: circulationCardPath,
            es_persona_moral: vehicle.esPersonaMoral,
            ine_url: ineUrl,
            status: 'En revisión'
          });

        if (vehicleError) {
          throw new Error(`Error al registrar vehículo: ${vehicleError.message}`);
        }
      }

      toast({
        title: "¡Vehículo registrado!",
        description: "Redirigiendo al pago...",
      });
      
      // Redirect to payment (Stripe)
      setTimeout(() => {
        window.location.href = `/registro?vehicles=${vehicleCount}`;
      }, 1000);
      
      if (onClose) onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (vehicleIndex: number, file: File | null, type: 'circulation' | 'ine') => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((vehicle, index) => 
        index === vehicleIndex 
          ? { 
              ...vehicle, 
              [type === 'circulation' ? 'circulationCard' : 'ineFile']: file 
            } 
          : vehicle
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

  const handlePersonaMoralChange = (vehicleIndex: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((vehicle, index) => 
        index === vehicleIndex ? { ...vehicle, esPersonaMoral: checked } : vehicle
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
          {/* Vehicle Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Información de {vehicleCount === 1 ? "vehículo" : "vehículos"}
            </h3>
            
            <div className={`grid gap-6 ${vehicleCount > 1 ? 'md:grid-cols-1' : 'grid-cols-1'}`}>
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

                  {/* Persona Moral Checkbox */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id={`persona-moral-${index}`}
                      checked={vehicle.esPersonaMoral}
                      onCheckedChange={(checked) => handlePersonaMoralChange(index, checked as boolean)}
                    />
                    <Label htmlFor={`persona-moral-${index}`} className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      ¿Está a nombre de persona moral?
                    </Label>
                  </div>

                  {/* Circulation Card Upload */}
                  <div className="space-y-2 mb-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Tarjeta de circulación *
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-accent transition-colors">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(index, e.target.files?.[0] || null, 'circulation')}
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

                  {/* INE Upload (only if not persona moral) */}
                  {!vehicle.esPersonaMoral && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        INE del propietario *
                      </Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-accent transition-colors">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(index, e.target.files?.[0] || null, 'ine')}
                          className="hidden"
                          id={`ine-${index}`}
                          required={!vehicle.esPersonaMoral}
                        />
                        <label
                          htmlFor={`ine-${index}`}
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          {vehicle.ineFile ? (
                            <div className="text-sm">
                              <p className="font-medium text-foreground">
                                {vehicle.ineFile.name}
                              </p>
                              <p className="text-muted-foreground">
                                Haz clic para cambiar
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              <p>Subir INE</p>
                              <p>JPG, PNG, PDF</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
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