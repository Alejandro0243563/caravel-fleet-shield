import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart3, Users, Car, FileText, DollarSign, Plus, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  totalFines: number;
  totalRevenue: number;
}

interface User {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  role: string;
  created_at: string;
  vehicle_count?: number;
}

interface Vehicle {
  id: string;
  license_plate: string;
  status: string;
  created_at: string;
  user_email: string;
  user_name: string;
}

interface Fine {
  id: string;
  amount: number;
  status: string;
  description?: string;
  created_at: string;
  vehicle_plate: string;
  user_name: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalVehicles: 0, totalFines: 0, totalRevenue: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New fine form state
  const [newFine, setNewFine] = useState({
    vehicle_id: '',
    amount: '',
    description: '',
    status: 'Pendiente'
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch users with vehicle count
      const { data: usersData } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          phone,
          role,
          created_at
        `);

      // Get user emails from auth.users (we need to use a different approach)
      const { data: vehiclesCount } = await supabase
        .from('vehicles')
        .select('user_id, id');

      // Count vehicles per user
      const vehicleCountByUser = vehiclesCount?.reduce((acc, vehicle) => {
        acc[vehicle.user_id] = (acc[vehicle.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const enrichedUsers = usersData?.map(user => ({
        ...user,
        email: `user-${user.user_id.slice(0, 8)}@domain.com`, // Placeholder since we can't access auth.users directly
        vehicle_count: vehicleCountByUser[user.user_id] || 0
      })) || [];

      setUsers(enrichedUsers);

      // Fetch vehicles with user info
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select(`
          id,
          license_plate,
          status,
          created_at,
          user_id
        `);

      // Get user names separately to avoid join issues
      const enrichedVehicles = [];
      if (vehiclesData) {
        for (const vehicle of vehiclesData) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', vehicle.user_id)
            .single();
          
          enrichedVehicles.push({
            ...vehicle,
            user_name: profile?.full_name || 'Usuario desconocido',
            user_email: `user-${vehicle.user_id.slice(0, 8)}@domain.com`
          });
        }
      }

      setVehicles(enrichedVehicles);

      // Fetch fines with vehicle and user info
      const { data: finesData } = await supabase
        .from('fines')
        .select(`
          id,
          amount,
          status,
          description,
          created_at,
          vehicle_id
        `);

      // Get vehicle and user info separately
      const enrichedFines = [];
      if (finesData) {
        for (const fine of finesData) {
          const { data: vehicle } = await supabase
            .from('vehicles')
            .select('license_plate, user_id')
            .eq('id', fine.vehicle_id)
            .single();
          
          let userName = 'Usuario desconocido';
          if (vehicle) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', vehicle.user_id)
              .single();
            
            userName = profile?.full_name || 'Usuario desconocido';
          }
          
          enrichedFines.push({
            ...fine,
            vehicle_plate: vehicle?.license_plate || 'Desconocido',
            user_name: userName
          });
        }
      }

      setFines(enrichedFines);

      // Fetch leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      setLeads(leadsData || []);

      // Calculate stats
      const totalRevenue = vehiclesCount?.length ? vehiclesCount.length * 200 : 0; // $200 per vehicle monthly
      setStats({
        totalUsers: enrichedUsers.length,
        totalVehicles: enrichedVehicles.length,
        totalFines: enrichedFines.length,
        totalRevenue
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addFine = async () => {
    try {
      const { error } = await supabase
        .from('fines')
        .insert({
          vehicle_id: newFine.vehicle_id,
          amount: parseFloat(newFine.amount),
          description: newFine.description,
          status: newFine.status as any
        });

      if (error) throw error;

      toast.success('Multa agregada exitosamente');
      setNewFine({ vehicle_id: '', amount: '', description: '', status: 'Pendiente' });
      fetchAdminData();
    } catch (error) {
      console.error('Error adding fine:', error);
      toast.error('Error al agregar la multa');
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: status as any })
        .eq('id', leadId);

      if (error) throw error;

      toast.success('Estado del lead actualizado');
      fetchAdminData();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Error al actualizar el lead');
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      toast.success('Lead eliminado');
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Error al eliminar el lead');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Cargando dashboard administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png" 
              alt="CARAVEL Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold">Dashboard Administrativo</h1>
              <p className="text-sm text-muted-foreground">
                Panel de control maestro
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vista General
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehículos
            </TabsTrigger>
            <TabsTrigger value="fines" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Multas
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Suscripciones
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              CRM Leads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                      <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vehículos Protegidos</p>
                      <p className="text-3xl font-bold">{stats.totalVehicles}</p>
                    </div>
                    <Car className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Multas Totales</p>
                      <p className="text-3xl font-bold">{stats.totalFines}</p>
                    </div>
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ingresos Estimados</p>
                      <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Lista completa de usuarios registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Vehículos</TableHead>
                      <TableHead>Registro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || 'No especificado'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || 'No especificado'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.vehicle_count}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Vehículos</CardTitle>
                <CardDescription>
                  Todos los vehículos registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Placas</TableHead>
                      <TableHead>Propietario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha de Alta</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.license_plate}</TableCell>
                        <TableCell>{vehicle.user_name}</TableCell>
                        <TableCell>
                          <Badge variant={vehicle.status === 'Protegido' ? 'default' : 'secondary'}>
                            {vehicle.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(vehicle.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setNewFine(prev => ({ ...prev, vehicle_id: vehicle.id }))}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Asignar Multa
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Asignar Nueva Multa</DialogTitle>
                                <DialogDescription>
                                  Vehículo: {vehicle.license_plate} - {vehicle.user_name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Monto (MXN)</Label>
                                  <Input
                                    type="number"
                                    value={newFine.amount}
                                    onChange={(e) => setNewFine(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="Ej: 1500"
                                  />
                                </div>
                                <div>
                                  <Label>Descripción</Label>
                                  <Textarea
                                    value={newFine.description}
                                    onChange={(e) => setNewFine(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Descripción de la multa"
                                  />
                                </div>
                                <div>
                                  <Label>Estado</Label>
                                  <Select 
                                    value={newFine.status} 
                                    onValueChange={(value) => setNewFine(prev => ({ ...prev, status: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                                      <SelectItem value="Cubierta">Cubierta</SelectItem>
                                      <SelectItem value="Impugnada">Impugnada</SelectItem>
                                      <SelectItem value="Rechazada">Rechazada</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button onClick={addFine} className="w-full">
                                  Agregar Multa
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fines">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Multas</CardTitle>
                <CardDescription>
                  Registro completo de multas en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Propietario</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fines.map((fine) => (
                      <TableRow key={fine.id}>
                        <TableCell className="font-medium">{fine.vehicle_plate}</TableCell>
                        <TableCell>{fine.user_name}</TableCell>
                        <TableCell className="text-destructive font-semibold">
                          ${Number(fine.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={fine.status === 'Cubierta' ? 'default' : 'secondary'}>
                            {fine.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{fine.description || 'Sin descripción'}</TableCell>
                        <TableCell>{new Date(fine.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Control de Suscripciones</CardTitle>
                <CardDescription>
                  Gestión de suscripciones y pagos de usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Integración con Stripe próximamente</p>
                  <p className="text-muted-foreground">
                    Esta sección mostrará el estado de suscripciones una vez integrado Stripe
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>CRM - Gestión de Leads</CardTitle>
                <CardDescription>
                  Leads generados desde formularios de contacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Mensaje</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone || 'No especificado'}</TableCell>
                        <TableCell className="max-w-xs truncate">{lead.message || 'Sin mensaje'}</TableCell>
                        <TableCell>
                          <Badge variant={lead.status === 'nuevo' ? 'default' : 'secondary'}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateLeadStatus(lead.id, 'gestionado')}
                              disabled={lead.status === 'gestionado'}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Contactado
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteLead(lead.id)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;