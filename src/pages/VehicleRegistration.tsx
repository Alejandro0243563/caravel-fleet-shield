import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, Upload, CreditCard, ArrowLeft, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { PhoneAuthForm } from '@/components/PhoneAuthForm';
import { SEO } from '@/components/SEO';
import { breadcrumbSchema, productSchema } from '@/utils/seo-schemas';

interface VehicleFormData {
  licensePlate: string;            // <--- NUEVO
  circulationCard: File | null;
  ownerIne: File | null;
  isCorporate: boolean;
  sameOwnerAs: number | null;
}


interface FormData {
  vehicles: VehicleFormData[];
  paymentType: 'monthly' | 'annual';
}

const VehicleRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  
  // Get vehicle count from URL params or default to 1
  const urlParams = new URLSearchParams(location.search);
  const initialVehicleCount = parseInt(urlParams.get('vehicles') || '1');
  
  const [vehicleCount, setVehicleCount] = useState(initialVehicleCount);
  const [formData, setFormData] = useState<FormData>({
    vehicles: Array(initialVehicleCount).fill(null).map(() => ({
      licensePlate: '',                // <--- NUEVO
      circulationCard: null,
      ownerIne: null,
      isCorporate: false,
      sameOwnerAs: null,
    })),

    paymentType: 'monthly'
  });
  const [showAuth, setShowAuth] = useState(false);

  const basePrice = 200; // MXN per vehicle
  const monthlyTotal = vehicleCount * basePrice;
  const annualTotal = monthlyTotal * 12 * (formData.paymentType === 'annual' ? 0.9 : 1);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      minimumFractionDigits: 0 
    }).format(amount);

  // Update vehicles array when count changes
  useEffect(() => {
    if (vehicleCount !== formData.vehicles.length) {
      const newVehicles = Array(vehicleCount).fill(null).map((_, index) => 
        formData.vehicles[index] || {
          licensePlate: '',                // <--- NUEVO
          circulationCard: null,
          ownerIne: null,
          isCorporate: false,
          sameOwnerAs: null,
        }

      );
      setFormData(prev => ({ ...prev, vehicles: newVehicles }));
    }
  }, [vehicleCount, formData.vehicles]);

  const updateVehicle = (index: number, field: keyof VehicleFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((vehicle, i) => 
        i === index ? { ...vehicle, [field]: value } : vehicle
      )
    }));
  };

  const handleFileUpload = (index: number, field: 'circulationCard' | 'ownerIne', file: File | null) => {
    updateVehicle(index, field, file);
  };

  const isFormValid = () => {

    // Check each vehicle
    return formData.vehicles.every((vehicle, index) => {
      if (!vehicle.licensePlate?.trim()) return false;   // <--- NUEVO
      // Circulation card is always required
      if (!vehicle.circulationCard) return false;
      
      // INE is required unless it's corporate or same owner as previous
      if (!vehicle.isCorporate && vehicle.sameOwnerAs === null) {
        if (!vehicle.ownerIne) return false;
      }
      
      return true;
    });
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

    // Show authentication modal first
    setShowAuth(true);
  };

const handleAuthSuccess = async () => {
  setShowAuth(false);

  try {
    // Opcional: guardar el userId por si lo usas en success page
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      localStorage.setItem('currentUserId', user.id);
    }

    // Prepara payload similar a AddVehicleForm, pero para N vehículos
    const vehiclesPayload = await Promise.all(
      formData.vehicles.map(async (v) => {
        const obj: any = {
          licensePlate: v.licensePlate,
          isCorporate: v.isCorporate,
          sameOwnerAs: v.sameOwnerAs,
        };
        if (v.circulationCard) {
          obj.circulationCardBase64 = await fileToBase64(v.circulationCard);
          obj.circulationCardMimeType = v.circulationCard.type;
        }
        if (v.ownerIne) {
          obj.ownerIneBase64 = await fileToBase64(v.ownerIne);
          obj.ownerIneMimeType = v.ownerIne.type;
        }
        return obj;
      })
    );

    // Llama a tu Edge Function con TODOS los vehículos
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        priceType: formData.paymentType,  // 'monthly' | 'annual'
        vehicleCount: formData.vehicles.length,
        vehicles: vehiclesPayload,        // <--- importante
      },
    });

    if (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Error',
        description: 'Error al procesar el pago. Intenta de nuevo.',
        variant: 'destructive',
      });
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error('Payment error:', error);
    toast({
      title: 'Error',
      description: 'Error al procesar el pago. Intenta de nuevo.',
      variant: 'destructive',
    });
  }
};


  const shouldShowIneField = (index: number) => {
    const vehicle = formData.vehicles[index];
    return !vehicle.isCorporate && vehicle.sameOwnerAs === null;
  };

  const getAvailableOwners = (currentIndex: number) => {
    return formData.vehicles
      .map((vehicle, index) => ({ vehicle, index }))
      .filter(({ vehicle, index }) => 
        index < currentIndex && !vehicle.isCorporate && vehicle.ownerIne
      )
      .map(({ index }) => index);
  };
  const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1]; // quita el prefijo data:...;base64,
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
  });
};


  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const registrationBreadcrumb = breadcrumbSchema([
    { name: 'Inicio', url: 'https://caravel.com/' },
    { name: 'Registro de Vehículos', url: 'https://caravel.com/registro' }
  ]);

  return (
    <>
      <SEO 
        title="Registro de Vehículos - Protección CARAVEL México"
        description="Registra tus vehículos para obtener protección integral contra multas. Desde $200 MXN/mes por vehículo. Proceso rápido y seguro."
        canonical="https://caravel.com/registro"
        jsonLd={[registrationBreadcrumb, productSchema]}
      />
      <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png" 
                alt="CARAVEL Logo" 
                className="h-16 w-auto"
              />
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Protege {vehicleCount === 1 ? 'tu vehículo' : 'tus vehículos'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Completa la información para activar tu protección contra multas
          </p>
        </div>

        {/* Vehicle Count Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Número de vehículos a proteger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-lg font-semibold text-foreground">
                  Vehículos:
                </label>
                <div className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-bold text-xl min-w-[80px] text-center">
                  {vehicleCount}
                </div>
              </div>
              <Slider
                value={[vehicleCount]}
                onValueChange={(value) => setVehicleCount(value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1 vehículo</span>
                <span>10 vehículos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Forms */}
        <div className="space-y-6 mb-8">
          {formData.vehicles.map((vehicle, index) => (
            <Card key={index} className="border-2 border-dashed border-muted">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Vehículo {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* License Plate */}
                <div className="space-y-2">
                  <Label htmlFor={`licensePlate-${index}`} className="text-sm font-medium">
                    Número de placas *
                  </Label>
                  <Input
                    id={`licensePlate-${index}`}
                    type="text"
                    placeholder="Ej: ABC-123-D"
                    value={vehicle.licensePlate}
                    onChange={(e) => updateVehicle(index, 'licensePlate', e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                </div>

                {/* Circulation Card Upload */}
                <div className="space-y-2">
                  <Label htmlFor={`circulation-${index}`} className="text-sm font-medium">
                    Tarjeta de circulación * <span className="text-muted-foreground">(imagen o PDF)</span>
                  </Label>
                  <Input
                    id={`circulation-${index}`}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(index, 'circulationCard', e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  {vehicle.circulationCard && (
                    <p className="text-sm text-success">✓ {vehicle.circulationCard.name}</p>
                  )}
                </div>

                {/* Corporate Vehicle Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`corporate-${index}`}
                    checked={vehicle.isCorporate}
                    onCheckedChange={(checked) => {
                      updateVehicle(index, 'isCorporate', !!checked);
                      if (checked) {
                        updateVehicle(index, 'sameOwnerAs', null);
                        updateVehicle(index, 'ownerIne', null);
                      }
                    }}
                  />
                  <Label htmlFor={`corporate-${index}`} className="text-sm">
                    ¿Está a nombre de persona moral?
                  </Label>
                </div>

                {/* Same Owner Checkbox */}
                {!vehicle.isCorporate && index > 0 && getAvailableOwners(index).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Propietario del vehículo</Label>
                    <RadioGroup
                      value={vehicle.sameOwnerAs?.toString() || 'new'}
                      onValueChange={(value) => {
                        const sameOwnerAs = value === 'new' ? null : parseInt(value);
                        updateVehicle(index, 'sameOwnerAs', sameOwnerAs);
                        if (sameOwnerAs !== null) {
                          updateVehicle(index, 'ownerIne', null);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new" id={`new-owner-${index}`} />
                        <Label htmlFor={`new-owner-${index}`} className="text-sm">
                          Nuevo propietario
                        </Label>
                      </div>
                      {getAvailableOwners(index).map((ownerIndex) => (
                        <div key={ownerIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={ownerIndex.toString()} id={`same-owner-${index}-${ownerIndex}`} />
                          <Label htmlFor={`same-owner-${index}-${ownerIndex}`} className="text-sm">
                            Mismo propietario que vehículo {ownerIndex + 1}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* INE Upload */}
                {shouldShowIneField(index) && (
                  <div className="space-y-2">
                    <Label htmlFor={`ine-${index}`} className="text-sm font-medium">
                      INE del propietario * <span className="text-muted-foreground">(imagen o PDF)</span>
                    </Label>
                    <Input
                      id={`ine-${index}`}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(index, 'ownerIne', e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    {vehicle.ownerIne && (
                      <p className="text-sm text-success">✓ {vehicle.ownerIne.name}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Payment Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Selecciona tu plan de pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={formData.paymentType}
              onValueChange={(value: 'monthly' | 'annual') => 
                setFormData(prev => ({ ...prev, paymentType: value }))
              }
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg border">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Pago mensual</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(monthlyTotal)}/mes
                        </div>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {formatCurrency(monthlyTotal)}
                      </div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-primary/50 bg-primary/5">
                  <RadioGroupItem value="annual" id="annual" />
                  <Label htmlFor="annual" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Pago anual</div>
                        <div className="text-sm text-success font-semibold">
                          ¡Ahorra 10%! - {formatCurrency(annualTotal)}/año
                        </div>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {formatCurrency(annualTotal)}
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            <Separator />

            {/* Payment Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Resumen de tu protección:</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>{vehicleCount} {vehicleCount === 1 ? 'vehículo' : 'vehículos'} × {formatCurrency(basePrice)}</span>
                  <span>{formatCurrency(monthlyTotal)}/mes</span>
                </div>
                {formData.paymentType === 'annual' && (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal anual</span>
                      <span>{formatCurrency(monthlyTotal * 12)}</span>
                    </div>
                    <div className="flex justify-between text-success font-semibold">
                      <span>Descuento anual (10%)</span>
                      <span>-{formatCurrency(monthlyTotal * 12 * 0.1)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total anual</span>
                      <span>{formatCurrency(annualTotal)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handlePayment}
            disabled={!isFormValid()}
            className="w-full md:w-auto bg-gradient-accent hover:shadow-glow transition-all duration-300 text-lg px-12 py-6"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Pagar con tarjeta - {formatCurrency(formData.paymentType === 'annual' ? annualTotal : monthlyTotal)}
          </Button>
          
          {!isFormValid() && (
            <p className="text-sm text-muted-foreground mt-2">
              * Completa todos los campos obligatorios para continuar
            </p>
          )}
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <PhoneAuthForm 
              onSuccess={handleAuthSuccess}
              onCancel={() => setShowAuth(false)}
            />
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default VehicleRegistration;
