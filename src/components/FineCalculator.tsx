import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, AlertCircle, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FineCalculatorProps {
  onContactClick: () => void;
}

export const FineCalculator = ({ onContactClick }: FineCalculatorProps) => {
  const [fineAmount, setFineAmount] = useState<string>('');

  const fineValue = parseFloat(fineAmount) || 0;
  const paymentAmount = fineValue * 0.5; // 50% of the fine

  return (
    <Card className="w-full h-full bg-white shadow-card hover:shadow-elevated transition-all duration-300 border-0 flex flex-col">
      <CardHeader className="space-y-2 pb-4">
        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-2">
          <AlertCircle className="w-6 h-6 text-orange-600" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-orange-600 uppercase tracking-wider">Opción B</div>
          <CardTitle className="text-2xl font-bold">Eliminación Inmediata</CardTitle>
        </div>
        <CardDescription className="text-base">
          Para multas ya generadas. Paga solo el 50% y nosotros nos encargamos del resto.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 flex-1 flex flex-col">
        <div className="space-y-2">
          <Label htmlFor="fine-amount">Monto total de tus multas (MXN)</Label>
          <Input
            id="fine-amount"
            type="number"
            placeholder="Ej. 5,000"
            value={fineAmount}
            onChange={(e) => setFineAmount(e.target.value)}
            className="text-lg"
          />
        </div>

        {fineValue > 0 ? (
          <div className="bg-orange-50 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Deuda original:</span>
              <span className="line-through decoration-red-500">${fineValue.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Pagas a CARAVEL:</span>
              <span className="font-bold text-2xl text-primary">
                ${paymentAmount.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="text-xs text-center text-muted-foreground pt-2 border-t border-orange-200">
              Te ahorras: ${(fineValue - paymentAmount).toLocaleString('es-MX')} (50%)
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-xl p-8 text-center text-muted-foreground flex-1 flex items-center justify-center">
            <p>Ingresa el monto para calcular tu ahorro</p>
          </div>
        )}

        <div className="mt-auto space-y-4">
          <Button
            onClick={() => window.open('https://wa.me/523318497494?text=Hola, me interesa eliminar una multa (Opción B).', '_blank')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg shadow-lg shadow-primary/20"
          >
            Eliminar mis multas
          </Button>

          <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <FileText className="w-3 h-3" />
                  Requisitos: INE + Poder Simple
                </TooltipTrigger>
                <TooltipContent>
                  <p>Necesitamos tu INE y la firma de un poder simple para tramitar la devolución.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};