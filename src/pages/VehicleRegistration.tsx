import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, Upload, CreditCard, ArrowLeft, Phone, Mail, FileText, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VehicleFormData {
  circulationCard: File | null;
  ownerIne: File | null;
  isCorporate: boolean;
  sameOwnerAs: number | null;
}

interface FormData {
  vehicles: VehicleFormData[];
  phone: string;
  email: string;
  paymentType: 'monthly' | 'annual';
}

const VehicleRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PK ?? ''
  );
  
  // Get vehicle count from URL params or default to 1
  const urlParams = new URLSearchParams(location.search);
  const initialVehicleCount = parseInt(urlParams.get('vehicles') || '1');
  
  const [vehicleCount, setVehicleCount] = useState(initialVehicleCount);
  const [formData, setFormData] = useState<FormData>({
    vehicles: Array(initialVehicleCount).fill(null).map(() => ({
      circulationCard: null,
      ownerIne: null,
      isCorporate: false,
      sameOwnerAs: null,
    })),
    phone: '',
    email: '',
    paymentType: 'monthly'
  });

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
          circulationCard: null,
          ownerIne: null,
          isCorporate: false,
          sameOwnerAs: null,
        }
      );
      setFormData(prev => ({ ...prev, vehicles: newVehicles }));
    }
  }, [vehicleCount, formData.vehicles.length]);

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
    // Check user data
    if (!formData.phone || !formData.email) return false;
    
    // Check each vehicle
    return formData.vehicles.every((vehicle, index) => {
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

    toast({
      title: 'Redirigiendo a pago...',
      description: 'Te estamos redirigiendo a Stripe para completar tu pago.'
    });

    const stripe = await stripePromise;
    if (!stripe) {
      toast({
        title: "Configuración incorrecta",
        description: "Stripe no se cargó correctamente.",
        variant: "destructive",
      });
      return;
    }

    const priceId =
      formData.paymentType === 'annual'
        ? import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID
        : import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID;

    try {
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: vehicleCount }],
        mode: 'subscription',
        successUrl:
          import.meta.env.VITE_STRIPE_SUCCESS_URL || window.location.origin,
        cancelUrl:
          import.meta.env.VITE_STRIPE_CANCEL_URL || window.location.href,
        customerEmail: formData.email,
        clientReferenceId: formData.phone,
      });
      if (error) {
        toast({
          title: 'Pago falló',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Pago falló',
        description: String(err),
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">CARAVEL</span>
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
            <div className="flex items-center gap-4">
              <Label htmlFor="vehicle-count">Vehículos:</Label>
              <Input
                id="vehicle-count"
                type="number"
                min="1"
                max="10"
                value={vehicleCount}
                onChange={(e) => setVehicleCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">
                (máximo 10 vehículos)
              </span>
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

        {/* User Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Información de contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Número de teléfono *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+52 55 1234 5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Correo electrónico *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="tu@correo.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
    </div>
  );
};

export default VehicleRegistration;