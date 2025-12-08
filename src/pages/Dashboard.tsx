import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ClientDashboard from './ClientDashboard';
import AdminDashboard from './AdminDashboard';
import { SEO } from '@/components/SEO';

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // Render dashboard based on user role
  // FOR TESTING ONLY: Force admin view
  const forcedRole = 'admin';
  if (forcedRole === 'admin' || userRole === 'admin') {
    return (
      <>
        <SEO
          title="Panel Administrativo - CARAVEL México"
          description="Panel de administración para gestionar usuarios, vehículos y suscripciones CARAVEL."
          canonical="https://caravel.com/dashboard"
          noIndex={true}
        />
        <AdminDashboard />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Mi Dashboard - CARAVEL México"
        description="Gestiona tu protección contra multas, vehículos registrados y estado de suscripción CARAVEL."
        canonical="https://caravel.com/dashboard"
        noIndex={true}
      />
      <ClientDashboard />
    </>
  );
};

export default Dashboard;