import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Users } from 'lucide-react';

interface QuoteCalculatorProps {
  onContactClick: () => void;
  onProceedToForm: (vehicleCount: number) => void;
}

export const QuoteCalculator = ({ onContactClick, onProceedToForm }: QuoteCalculatorProps) => {
  const [vehicles, setVehicles] = useState([1]);
  const [annualPay, setAnnualPay] = useState(false);
  
  const basePrice = 200; // MXN per vehicle
  const vehicleCount = vehicles[0];
  
  // Calculate pricing (no volume discounts, only annual discount)
  const monthlyTotal = vehicleCount * basePrice;
  const annualTotal = monthlyTotal * 12 * (annualPay ? 0.9 : 1); // 10% annual discount
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      minimumFractionDigits: 0 
    }).format(amount);

  return (
    <Card className="w-full max-w-2xl bg-white shadow-elevated border-0">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Value Proposition */}
          <div className="text-center space-y-2 mb-6">
            <p className="text-lg font-semibold text-foreground">
              Activa tu escudo contra multas desde $200 MXN/mes por vehículo
            </p>
            <p className="text-muted-foreground">Sin trámites. Sin mordidas.</p>
          </div>

          {/* Vehicle Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-lg font-semibold text-foreground">
                Número de vehículos
              </label>
              <div className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-bold text-xl min-w-[80px] text-center">
                {vehicleCount}
              </div>
            </div>
            <Slider
              value={vehicles}
              onValueChange={setVehicles}
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

          {/* Annual Payment Option */}
          <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
            <Checkbox
              id="annual"
              checked={annualPay}
              onCheckedChange={(checked) => setAnnualPay(!!checked)}
            />
            <label
              htmlFor="annual"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Quiero pagar anual y ahorrar 10%
            </label>
          </div>

          {/* Pricing Display */}
          <div className="space-y-3">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(monthlyTotal)}/mes
              </div>
              {annualPay && (
                <div className="text-lg text-muted-foreground">
                  Total anual: {formatCurrency(annualTotal)}
                  <span className="text-success font-semibold ml-2">
                    (Ahorro: {formatCurrency(monthlyTotal * 12 - annualTotal)})
                  </span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Precio base: $200 MXN por vehículo
              </p>
              {annualPay && (
                <p className="text-xs text-muted-foreground/80">
                  Solo con pago anual obtienes 10% de descuento en tu suscripción.
                </p>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              size="lg" 
              onClick={() => onProceedToForm(vehicleCount)}
              className="w-full bg-gradient-accent hover:shadow-glow transition-all duration-300 text-lg py-6"
            >
              {vehicleCount === 1 ? "Proteger mi vehículo" : "Proteger mis vehículos"}
            </Button>
          </div>

          {/* Enterprise Contact Message */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              ¿Tienes más de 10 vehículos? Habla con nuestro equipo para un plan especial
            </p>
            <Button 
              variant="outline" 
              onClick={onContactClick}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contáctanos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};