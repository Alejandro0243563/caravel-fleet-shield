import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Shield, Car, FileCheck, AlertCircle } from 'lucide-react';

interface SeasonalPackageCardProps {
    onContactClick: () => void;
}

export const SeasonalPackageCard = ({ onContactClick }: SeasonalPackageCardProps) => {
    return (
        <Card className="w-full bg-white shadow-card hover:shadow-elevated transition-all duration-300 border-2 border-primary/20 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                VIGENTE DIC-ENE-FEB
            </div>

            <CardHeader className="space-y-2 pb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                    <div className="text-sm font-medium text-primary uppercase tracking-wider">Paquete de Temporada</div>
                    <CardTitle className="text-2xl font-bold">Todo en Uno</CardTitle>
                </div>
                <CardDescription className="text-base">
                    Aprovecha esta temporada para regularizar y proteger tu vehículo.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-center py-4 bg-muted/30 rounded-lg">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-foreground">$3,500</span>
                            <span className="text-sm text-muted-foreground ml-1">MXN</span>
                            <p className="text-xs text-muted-foreground mt-1">Pago único</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">Plan anual CARAVEL (12 meses de blindaje ante multas)</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <FileCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">Gestión de verificación vehicular</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <Car className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">Gestión de cambio de placas</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-orange-800">
                            No incluye pago de derechos o impuestos gubernamentales.
                        </p>
                    </div>
                </div>

                <div className="mt-auto pt-4">
                    <Button
                        onClick={() => window.open('https://wa.me/523318497494?text=Hola, me interesa el Paquete de Temporada de $3500.', '_blank')}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        Lo quiero
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
