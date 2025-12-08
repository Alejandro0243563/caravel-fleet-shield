import { FineCalculator } from './FineCalculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, FileCheck, AlertCircle } from 'lucide-react';
import { SeasonalPackageCard } from './SeasonalPackageCard';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServicesSectionProps {
    onContactClick: () => void;
}

export const ServicesSection = ({ onContactClick }: ServicesSectionProps) => {
    return (
        <section className="py-20 bg-muted/30" id="services">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        ¿Ya tienes multas? Tenemos una solución.
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        No importa si tus multas son recientes o antiguas, tenemos un esquema legal para ayudarte.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
                    {/* Seasonal Package */}
                    <div className="relative">
                        <SeasonalPackageCard onContactClick={onContactClick} />
                    </div>

                    {/* Option B: Fine Calculator (Immediate Elimination) */}
                    <div className="relative">
                        <FineCalculator onContactClick={onContactClick} />
                    </div>

                    {/* Option C: Reimbursement */}
                    <Card className="w-full bg-white shadow-card hover:shadow-elevated transition-all duration-300 border-0 flex flex-col">
                        <CardHeader className="space-y-2 pb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                                <RefreshCcw className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-blue-600 uppercase tracking-wider">Opción C</div>
                                <CardTitle className="text-2xl font-bold">Reembolso de Multas</CardTitle>
                            </div>
                            <CardDescription className="text-base">
                                ¿Pagaste una multa recientemente? Recupera tu dinero legalmente.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 flex-1 flex flex-col">
                            <div className="bg-blue-50 rounded-xl p-6 space-y-4 flex-1">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-900">
                                        Solo aplica si el pago se realizó hace <span className="font-bold">menos de 45 días</span>.
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-blue-800">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        <span>Plazo: 3 a 8 meses (Juicio de Nulidad)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-blue-800">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        <span>Garantía: 100% de reembolso asegurado</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-4">
                                <Button
                                    onClick={() => window.open('https://wa.me/523318497494?text=Hola, me interesa el Reembolso de Multas (Opción C).', '_blank')}
                                    variant="outline"
                                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-semibold py-6 text-lg"
                                >
                                    Solicitar Reembolso
                                </Button>

                                <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger className="flex items-center gap-1 hover:text-foreground transition-colors">
                                                <FileCheck className="w-3 h-3" />
                                                Requisitos
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Comprobante de pago original + INE</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
};
