import { Car, ShieldCheck, Coffee } from 'lucide-react';

const steps = [
    {
        icon: Car,
        title: "1. Registra",
        description: "Da de alta tus vehículos en nuestra plataforma en menos de 2 minutos."
    },
    {
        icon: ShieldCheck,
        title: "2. Protege",
        description: "Activamos el blindaje legal inmediatamente. Monitoreamos 24/7."
    },
    {
        icon: Coffee,
        title: "3. Relájate",
        description: "Si llega una multa, nosotros la gestionamos y eliminamos. Tú no haces nada."
    }
];

export const HowItWorksSection = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Así de fácil es estar protegido
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Sin burocracia, sin filas, sin complicaciones.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
                    {/* Connector Line (Desktop only) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -z-10" />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="relative flex flex-col items-center text-center group">
                                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-primary/10 shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:border-primary/30 group-hover:shadow-xl">
                                    <Icon className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed max-w-xs">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
