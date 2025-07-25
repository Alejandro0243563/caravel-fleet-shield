import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, Building, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactModal = ({ open, onOpenChange }: ContactModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    comments: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "¡Mensaje enviado!",
      description: "Nuestro equipo se pondrá en contacto contigo en menos de 24 horas.",
    });
    onOpenChange(false);
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      comments: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            Habla con nuestro equipo
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            ¿Tienes una flotilla grande o necesitas una solución especial?
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Nombre completo *
            </Label>
            <Input
              id="contact-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Tu nombre completo"
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="contact-company" className="text-sm font-medium flex items-center gap-2">
              <Building className="w-4 h-4" />
              Empresa (opcional)
            </Label>
            <Input
              id="contact-company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Nombre de tu empresa"
              className="transition-all duration-200 focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Teléfono *
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="3318497494"
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Correo electrónico *
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="tu.email@empresa.com"
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="contact-comments" className="text-sm font-medium">
              Comentarios
            </Label>
            <Textarea
              id="contact-comments"
              value={formData.comments}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Cuéntanos sobre tu flotilla y tus necesidades específicas..."
              rows={4}
              className="transition-all duration-200 focus:ring-2 focus:ring-accent resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-gradient-accent hover:shadow-glow transition-all duration-300"
          >
            Enviar mensaje
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Te responderemos en menos de 24 horas
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};