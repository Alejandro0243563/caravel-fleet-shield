import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface PhoneAuthFormProps {
  onAuthSuccess: () => void;
}

export const PhoneAuthForm = ({ onAuthSuccess }: PhoneAuthFormProps) => {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [telefono, setTelefono] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const sendVerificationCode = async () => {
    if (!telefono || telefono.length < 10) {
      toast.error('Por favor ingresa un número de teléfono válido');
      return;
    }

    if (!acceptedTerms) {
      toast.error('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    setIsLoading(true);
    try {
      // Use Supabase Auth with phone
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+52${telefono}`,
        options: {
          channel: 'sms',
        },
      });

      if (error) {
        toast.error('Error al enviar el código: ' + error.message);
        return;
      }

      toast.success('Código enviado por SMS');
      setStep('verify');
    } catch (error) {
      toast.error('Error al enviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast.error('Por favor ingresa el código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: `+52${telefono}`,
        token: code,
        type: 'sms',
      });

      if (error) {
        toast.error('Código inválido: ' + error.message);
        return;
      }

      toast.success('¡Autenticación exitosa!');
      onAuthSuccess();
    } catch (error) {
      toast.error('Error al verificar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendVerificationCode();
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode();
  };

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verificar código</CardTitle>
          <CardDescription>
            Enviamos un código de 6 dígitos al {telefono}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-center block">
                Código de verificación
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  value={code}
                  onChange={setCode}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? 'Verificando...' : 'Verificar código'}
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                className="w-full" 
                onClick={() => setStep('phone')}
                disabled={isLoading}
              >
                Cambiar número
              </Button>
            </div>

            <div className="text-center">
              <Button 
                type="button"
                variant="link" 
                onClick={sendVerificationCode}
                disabled={isLoading}
                className="text-sm"
              >
                Reenviar código
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Accede a tu cuenta</CardTitle>
        <CardDescription>
          Ingresa tu número de teléfono para recibir un código de verificación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="telefono">Número de teléfono</Label>
            <div className="flex">
              <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                <span className="text-sm text-muted-foreground">+52</span>
              </div>
              <Input
                id="telefono"
                type="tel"
                placeholder="3318497494"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="rounded-l-none"
                required
              />
            </div>
          </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                Acepto los{' '}
                <Link to="/terminos" className="text-primary hover:underline">
                  términos y condiciones
                </Link>{' '}
                de servicio
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !telefono || telefono.length < 10 || !acceptedTerms}
            >
              {isLoading ? 'Enviando código...' : 'Enviar código'}
            </Button>
        </form>
      </CardContent>
    </Card>
  );
};