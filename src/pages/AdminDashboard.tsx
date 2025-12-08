import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';
import { AdminVehiclesTable } from '@/components/admin/AdminVehiclesTable';
import { AdminFinesTable } from '@/components/admin/AdminFinesTable';
import { AdminLeadsTable } from '@/components/admin/AdminLeadsTable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png"
              alt="CARAVEL Logo"
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold">Dashboard Administrativo</h1>
              <p className="text-sm text-muted-foreground">Panel de control</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={async () => {
              const { error } = await supabase.functions.invoke('send-test-email');
              if (error) toast.error('Error al enviar correo de prueba');
              else toast.success('Correo de prueba enviado');
            }}>
              📧 Probar Correo
            </Button>
            <Button variant="outline" onClick={signOut}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="vehicles">Vehículos</TabsTrigger>
            <TabsTrigger value="fines">Multas</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra todos los usuarios registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUsersTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Vehículos</CardTitle>
                <CardDescription>
                  Administra todos los vehículos registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminVehiclesTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fines">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Multas</CardTitle>
                <CardDescription>
                  Administra todas las multas del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminFinesTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Leads</CardTitle>
                <CardDescription>
                  Administra todos los contactos recibidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminLeadsTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
