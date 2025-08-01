import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VehicleFormData {
  circulationCard: File | null;
  ownerIne: File | null;
  isCorporate: boolean;
  sameOwnerAs: number | null;
  paymentType: 'monthly' | 'annual';
}

interface AddVehicleFormProps {
  onClose: () => void;
}

const AddVehicleForm = ({ onClose }: AddVehicleFormProps) => {
  const { toast } = useToast();
  const [vehicleData, setVehicleData] = useState<VehicleFormData>({
    circulationCard: null,
    ownerIne: null,
    isCorporate: false,
    sameOwnerAs: null,
    paymentType: 'monthly',
  });


  const handleFileUpload = (field: 'circulationCard' | 'ownerIne', file: File | null) => {
    setVehicleData(prev => ({ ...prev, [field]: file }));
  };

  const isFormValid = () => {
    if (!vehicleData.circulationCard) return false;
    if (!vehicleData.isCorporate && vehicleData.sameOwnerAs === null && !vehicleData.ownerIne) {
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!isFormValid()) {
      toast({
        title: "Formulario incompleto",
        description: "Por favor completa todos los campos obligatorios antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    // Save vehicle data to localStorage before payment
    localStorage.setItem('pendingVehicles', JSON.stringify([vehicleData]));

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceType: vehicleData.paymentType,
          vehicleCount: 1 
        }
      });

      if (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Error",
          description: "Error al procesar el pago. Intenta de nuevo.",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: "Error al procesar el pago. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const shouldShowIneField = () => {
    return !vehicleData.isCorporate && vehicleData.sameOwnerAs === null;
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Nuevo Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Circulation Card Upload */}
          <div className="space-y-2">
            <Label htmlFor="circulation" className="text-sm font-medium">
              Tarjeta de circulación * <span className="text-muted-foreground">(imagen o PDF)</span>
            </Label>
            <Input
              id="circulation"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload('circulationCard', e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            {vehicleData.circulationCard && (
              <p className="text-sm text-success">✓ {vehicleData.circulationCard.name}</p>
            )}
          </div>

          {/* Corporate Vehicle Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="corporate"
              checked={vehicleData.isCorporate}
              onCheckedChange={(checked) => {
                setVehicleData(prev => ({
                  ...prev,
                  isCorporate: !!checked,
                  sameOwnerAs: checked ? null : prev.sameOwnerAs,
                  ownerIne: checked ? null : prev.ownerIne
                }));
              }}
            />
            <Label htmlFor="corporate" className="text-sm">
              ¿Está a nombre de persona moral?
            </Label>
          </div>

          {/* Same Owner Option - placeholder for when we have multiple vehicles */}
          {!vehicleData.isCorporate && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Propietario del vehículo</Label>
              <RadioGroup
                value={vehicleData.sameOwnerAs?.toString() || 'new'}
                onValueChange={(value) => {
                  const sameOwnerAs = value === 'new' ? null : parseInt(value);
                  setVehicleData(prev => ({
                    ...prev,
                    sameOwnerAs,
                    ownerIne: sameOwnerAs !== null ? null : prev.ownerIne
                  }));
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new-owner" />
                  <Label htmlFor="new-owner" className="text-sm">
                    Nuevo propietario
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* INE Upload */}
          {shouldShowIneField() && (
            <div className="space-y-2">
              <Label htmlFor="ine" className="text-sm font-medium">
                INE del propietario * <span className="text-muted-foreground">(imagen o PDF)</span>
              </Label>
              <Input
                id="ine"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload('ownerIne', e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {vehicleData.ownerIne && (
                <p className="text-sm text-success">✓ {vehicleData.ownerIne.name}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Selecciona tu plan de pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={vehicleData.paymentType}
            onValueChange={(value: 'monthly' | 'annual') => 
              setVehicleData(prev => ({ ...prev, paymentType: value }))
            }
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Pago mensual</div>
                      <div className="text-sm text-muted-foreground">$200/mes</div>
                    </div>
                    <div className="text-lg font-bold text-foreground">$200</div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-primary/50 bg-primary/5">
                <RadioGroupItem value="annual" id="annual" />
                <Label htmlFor="annual" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Pago anual</div>
                      <div className="text-sm text-success font-semibold">¡Ahorra 10%! - $2,160/año</div>
                    </div>
                    <div className="text-lg font-bold text-foreground">$2,160</div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Resumen de tu protección adicional:</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>1 vehículo adicional × $200</span>
                <span>$200/mes</span>
              </div>
              {vehicleData.paymentType === 'annual' && (
                <>
                  <div className="flex justify-between">
                    <span>Subtotal anual</span>
                    <span>$2,400</span>
                  </div>
                  <div className="flex justify-between text-success font-semibold">
                    <span>Descuento anual (10%)</span>
                    <span>-$240</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total anual</span>
                      <span>$2,160</span>
                    </div>
                  </div>
                </>
              )}
              {vehicleData.paymentType === 'monthly' && (
                <div className="flex justify-between font-bold text-lg">
                  <span>Total mensual</span>
                  <span>$200</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          onClick={handlePayment}
          disabled={!isFormValid()}
          className="w-full sm:w-auto bg-gradient-accent hover:shadow-glow transition-all duration-300"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {vehicleData.paymentType === 'annual' 
            ? 'Pagar y agregar vehículo - $2,160/año' 
            : 'Pagar y agregar vehículo - $200/mes'
          }
        </Button>
      </div>

      {!isFormValid() && (
        <p className="text-sm text-muted-foreground text-center">
          * Completa todos los campos obligatorios para continuar
        </p>
      )}
    </div>
  );
};

export default AddVehicleForm;