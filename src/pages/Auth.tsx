import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PhoneAuthForm } from '@/components/PhoneAuthForm';
import { SEO } from '@/components/SEO';
import { breadcrumbSchema } from '@/utils/seo-schemas';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  const authBreadcrumb = breadcrumbSchema([
    { name: 'Inicio', url: 'https://caravel.com/' },
    { name: 'Iniciar Sesión', url: 'https://caravel.com/auth' }
  ]);

  return (
    <>
      <SEO 
        title="Iniciar Sesión - CARAVEL México"
        description="Accede a tu cuenta CARAVEL para gestionar la protección de tus vehículos contra multas. Sistema seguro de autenticación."
        canonical="https://caravel.com/auth"
        jsonLd={authBreadcrumb}
        noIndex={true}
      />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png" 
            alt="CARAVEL Logo" 
            className="h-12 w-auto"
          />
        </div>

        <PhoneAuthForm onAuthSuccess={handleAuthSuccess} />

        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
      </div>
    </>
  );
};

export default Auth;