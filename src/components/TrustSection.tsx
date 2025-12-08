export const TrustSection = () => {
    return (
        <section className="py-10 border-y border-border/50 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="space-y-1">
                        <div className="text-3xl font-bold text-foreground">500+</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Empresas</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl font-bold text-foreground">5,000+</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Vehículos</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl font-bold text-foreground">$10M+</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ahorrados</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-3xl font-bold text-foreground">99.9%</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Éxito</div>
                    </div>
                </div>
            </div>
        </section>
    );
};
