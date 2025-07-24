import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "¿Qué incluye tu protección?",
    answer: "Cobertura contra fotoinfracciones, trámites ante autoridades, impugnación legal, y más. Nuestro equipo se encarga de todo el proceso para que no tengas que preocuparte por las multas vehiculares."
  },
  {
    question: "¿Cómo se activan los servicios?",
    answer: "Una vez que completes tu registro y subas la documentación requerida, tu protección se activa en 24-48 horas. Te enviaremos una confirmación por email y WhatsApp. A partir de ese momento, todas las multas nuevas quedan cubiertas automáticamente."
  },
  {
    question: "¿Qué pasa si tengo más de 10 vehículos?",
    answer: "Para flotillas de más de 10 vehículos, ofrecemos planes empresariales personalizados con descuentos especiales, soporte dedicado 24/7, y gestión centralizada. Contáctanos para recibir una cotización personalizada que se adapte a tus necesidades específicas."
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    answer: "Sí, puedes cancelar tu suscripción en cualquier momento sin penalizaciones. Si pagas mensualmente, la cancelación es efectiva al final del ciclo actual. Si pagas anualmente, puedes solicitar reembolso proporcional de los meses no utilizados."
  },
  {
    question: "¿Cómo funciona el proceso legal?",
    answer: "Nuestro equipo legal especializado se encarga de todo el proceso: revisión de la multa, preparación de defensas, comparecencias ante autoridades, y seguimiento hasta la resolución final. Todo es 100% legal y transparente, sin mordidas ni corrupción."
  },
  {
    question: "¿Qué documentos necesito para registrarme?",
    answer: "Solo necesitas la tarjeta de circulación de tus vehículos, identificación oficial del representante legal, y comprobante de domicilio. Para empresas, también solicitamos el acta constitutiva. Todo el proceso es digital y seguro."
  }
];

export const FaqSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resolvemos las dudas más comunes sobre nuestro servicio de inmunidad contra multas
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-muted/30 rounded-lg px-6 border-none"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            ¿No encuentras la respuesta que buscas?
          </p>
          <a 
            href="mailto:soporte@caravel.mx"
            className="inline-flex items-center text-primary hover:text-primary-light transition-colors font-medium"
          >
            Contáctanos directamente →
          </a>
        </div>
      </div>
    </section>
  );
};