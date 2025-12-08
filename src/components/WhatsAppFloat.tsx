import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WhatsAppFloat = () => {
  const whatsappNumber = "3318497494";
  const message = "Hola, me interesa proteger mis vehículos con Caravel. ¿Pueden darme más información?";
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#22C55E] text-white shadow-lg hover:shadow-xl transition-all duration-300 p-0"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  );
};