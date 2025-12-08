import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Info, CheckCircle2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuoteCalculatorProps {
  onContactClick: () => void;
}

export const QuoteCalculator = ({ onContactClick }: QuoteCalculatorProps) => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([1]);
  const [annualPay, setAnnualPay] = useState(false);

  const basePrice = 200; // MXN per vehicle monthly
  const annualPrice = 2160; // MXN per vehicle annually
  const vehicleCount = vehicles[0];

  // Calculate pricing
  const monthlyTotal = vehicleCount * basePrice;
  const annualTotal = vehicleCount * annualPrice;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);

  return (
    <Card className="w-full max-w-2xl bg-white shadow-elevated border-0 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Value Proposition */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Opción A: Blindaje Total
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Suscripción de Protección
            </h3>
            <p className="text-muted-foreground">
              Garantizamos 0 infracciones de 3 a 8 meses desde el inicio del trámite.
            </p>
          </div>

          {/* Vehicle Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-lg font-semibold text-foreground">
                Número de vehículos
              </label>
              <div className="bg-gradient-primary text-white px-4 py-2 rounded-lg font-bold text-xl min-w-[80px] text-center shadow-lg">
                {vehicleCount}
              </div>
            </div>
            <Slider
              value={vehicles}
              onValueChange={setVehicles}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 vehículo</span>
              <span>50 vehículos</span>
            </div>
          </div>

          {/* Annual Payment Option */}
          <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-300 ${annualPay ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-transparent'}`}>
            <Checkbox
              id="annual"
              checked={annualPay}
              onCheckedChange={(checked) => setAnnualPay(!!checked)}
              className="mt-1"
            />
            <div className="space-y-1">
              <label
                htmlFor="annual"
                className="text-base font-medium leading-none cursor-pointer flex items-center gap-2"
              >
                Pago Anual (Ahorra 2 meses)
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  RECOMENDADO
                </span>
              </label>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Incluye multas preexistentes</span> al contratar.
              </p>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="text-center space-y-1">
              <div className="text-4xl font-bold text-foreground tracking-tight">
                {annualPay ? formatCurrency(annualTotal) : formatCurrency(monthlyTotal)}
                <span className="text-lg text-muted-foreground font-normal">
                  /{annualPay ? 'año' : 'mes'}
                </span>
              </div>

              {!annualPay && (
                <p className="text-sm text-orange-600 font-medium flex items-center justify-center gap-1">
                  <Info className="w-4 h-4" />
                  No incluye multas anteriores
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Sin mordidas</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Riesgo legal absorbido</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              size="lg"
              onClick={() => navigate(`/registro?vehicles=${vehicleCount}&plan=${annualPay ? 'annual' : 'monthly'}`)}
              className="w-full bg-gradient-accent hover:shadow-glow transition-all duration-300 text-lg py-6 font-bold"
            >
              {vehicleCount === 1 ? "Proteger mi vehículo" : "Proteger mis vehículos"}
            </Button>

            <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 hover:text-foreground transition-colors underline decoration-dotted">
                    <Info className="w-3 h-3" />
                    Requisitos de contratación
                  </TooltipTrigger>
                  <TooltipContent>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Foto de INE</li>
                      <li>Instrumento notarial (Personas Morales)</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};