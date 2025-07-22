import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Users } from 'lucide-react';

interface QuoteCalculatorProps {
  onContactClick: () => void;
}

export const QuoteCalculator = ({ onContactClick }: QuoteCalculatorProps) => {
  const [vehicles, setVehicles] = useState([5]);
  const [annualPay, setAnnualPay] = useState(false);
  
  const basePrice = 200; // MXN per vehicle
  const vehicleCount = vehicles[0];
  
  // Calculate volume discounts (10% per 10 vehicles, max 50%)
  const volumeDiscountTiers = Math.floor(vehicleCount / 10);
  const volumeDiscount = Math.min(volumeDiscountTiers * 0.1, 0.5);
  
  // Calculate pricing
  const baseTotal = vehicleCount * basePrice;
  const afterVolumeDiscount = baseTotal * (1 - volumeDiscount);
  const monthlyTotal = afterVolumeDiscount;
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
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 vehículo</span>
              <span>100 vehículos</span>
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
            {volumeDiscount > 0 && (
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <p className="text-success font-semibold">
                  ¡Descuento por volumen aplicado: {(volumeDiscount * 100).toFixed(0)}%!
                </p>
              </div>
            )}
            
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
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full bg-gradient-accent hover:shadow-glow transition-all duration-300 text-lg py-6"
            >
              Proteger mi flotilla ahora
            </Button>
            
            {vehicleCount > 2 && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  ¿Más de 2 vehículos? Recibe atención personalizada
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
            )}
          </div>

          {/* Volume Benefits */}
          {vehicleCount >= 10 && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 text-primary">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Beneficios por volumen activos</span>
              </div>
              <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                <li>• Descuentos automáticos cada 10 vehículos</li>
                <li>• Soporte prioritario para tu flotilla</li>
                <li>• Gestión centralizada de todas las multas</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};