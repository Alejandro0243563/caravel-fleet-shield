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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, Car, FileText, Plus, Eye, Edit, Trash2, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  user_id: string;
  telefono: string;
  role: string;
  created_at: string;
  fecha_registro?: string;
  vehicleCount: number;
}

interface Vehicle {
  id: string;
  license_plate: string;
  status: string;
  created_at: string;
  circulation_card_url?: string;
  es_persona_moral: boolean;
  ine_url?: string;
  user_id: string;
  profiles?: {
    telefono: string;
  };
}

interface Fine {
  id: string;
  amount: number;
  status: string;
  description?: string;
  created_at: string;
  vehicle_id: string;
  vehicles?: {
    license_plate: string;
    profiles?: {
      telefono: string;
    };
  };
}

interface NewFine {
  vehicleId: string;
  amount: string;
  description: string;
  status: string;
}

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showCreateFine, setShowCreateFine] = useState(false);
  const [newFine, setNewFine] = useState<NewFine>({
    vehicleId: '',
    amount: '',
    description: '',
    status: 'nueva'
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchVehicles(),
        fetchFines(),
        fetchLeads()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data: usersData } = await supabase
      .from('profiles')
      .select('user_id, telefono, role, created_at, fecha_registro');

    if (usersData) {
      // Get vehicle count for each user
      const usersWithCounts = await Promise.all(
        usersData.map(async (user) => {
          const { data: vehicleData } = await supabase
            .from('vehicles')
            .select('id')
            .eq('user_id', user.user_id);
          
          return {
            ...user,
            vehicleCount: vehicleData?.length || 0
          };
        })
      );
      setUsers(usersWithCounts);
    }
  };

  const fetchVehicles = async () => {
    const { data: vehiclesData } = await supabase
      .from('vehicles')
      .select(`
        *,
        profiles:user_id (
          telefono
        )
      `);

    if (vehiclesData) {
      setVehicles(vehiclesData as any);
    }
  };

  const fetchFines = async () => {
    const { data: finesData } = await supabase
      .from('fines')
      .select(`
        *,
        vehicles (
          license_plate,
          profiles:user_id (
            telefono
          )
        )
      `);

    if (finesData) {
      setFines(finesData as any);
    }
  };

  const fetchLeads = async () => {
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsData) {
      setLeads(leadsData);
    }
  };

  const handleCreateFine = async () => {
    if (!newFine.vehicleId || !newFine.amount || !newFine.description) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const { error } = await supabase
        .from('fines')
        .insert({
          vehicle_id: newFine.vehicleId,
          amount: parseFloat(newFine.amount),
          description: newFine.description,
          status: newFine.status as any
        });

      if (error) throw error;

      toast.success('Multa creada exitosamente');
      setShowCreateFine(false);
      setNewFine({ vehicleId: '', amount: '', description: '', status: 'nueva' });
      fetchFines();
    } catch (error) {
      console.error('Error creating fine:', error);
      toast.error('Error al crear la multa');
    }
  };

  const updateFineStatus = async (fineId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('fines')
        .update({ status: newStatus as any })
        .eq('id', fineId);

      if (error) throw error;

      toast.success('Estado actualizado');
      fetchFines();
    } catch (error) {
      console.error('Error updating fine:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const deleteFine = async (fineId: string) => {
    try {
      const { error } = await supabase
        .from('fines')
        .delete()
        .eq('id', fineId);

      if (error) throw error;

      toast.success('Multa eliminada');
      fetchFines();
    } catch (error) {
      console.error('Error deleting fine:', error);
      toast.error('Error al eliminar la multa');
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus as any })
        .eq('id', leadId);

      if (error) throw error;

      toast.success('Estado del lead actualizado');
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Error al actualizar el lead');
    }
  };

  const updateVehicleStatus = async (vehicleId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: newStatus as any })
        .eq('id', vehicleId);

      if (error) throw error;

      toast.success('Estado del vehículo actualizado');
      fetchVehicles();
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast.error('Error al actualizar el estado del vehículo');
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Archivo descargado');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Protegido': return 'bg-green-500';
      case 'En revisión': return 'bg-yellow-500';
      case 'Pendiente': return 'bg-orange-500';
      case 'Pago pendiente': return 'bg-orange-400';
      case 'nueva': return 'bg-blue-500';
      case 'en proceso': return 'bg-yellow-500';
      case 'eliminada': return 'bg-red-500';
      case 'Cubierta': return 'bg-green-500';
      default: return 'bg-gray-500';
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
              <p className="text-sm text-muted-foreground">Panel de control</p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Usuarios</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Vehículos</p>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Multas</p>
                  <p className="text-2xl font-bold">{fines.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Leads</p>
                  <p className="text-2xl font-bold">{leads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Vehículos</TableHead>
                      <TableHead>Fecha Registro</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>{user.telefono || 'Sin teléfono'}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.vehicleCount}</TableCell>
                        <TableCell>{new Date(user.fecha_registro || user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetail(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </TableCell>
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
                  Administra todos los vehículos registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Tarjeta de Circulación</TableHead>
                      <TableHead>ID del Propietario</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Multas</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => {
                      const userFines = fines.filter(f => f.vehicle_id === vehicle.id);
                      const pendingFines = userFines.filter(f => f.status === 'nueva' || f.status === 'en proceso').length;
                      const deletedFines = userFines.filter(f => f.status === 'eliminada').length;
                      
                      return (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{vehicle.profiles?.telefono || 'Sin teléfono'}</p>
                              <p className="text-xs text-muted-foreground">{vehicle.license_plate}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {vehicle.circulation_card_url ? (
                              <Badge variant="outline" className="text-xs bg-green-50">✓ Subida</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-red-50">✗ Faltante</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {vehicle.es_persona_moral ? (
                              <Badge variant="secondary" className="text-xs">Persona Moral</Badge>
                            ) : vehicle.ine_url ? (
                              <Badge variant="outline" className="text-xs bg-green-50">✓ INE Subida</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-red-50">✗ INE Faltante</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={vehicle.status}
                              onValueChange={(value) => updateVehicleStatus(vehicle.id, value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pago pendiente">Pago pendiente</SelectItem>
                                <SelectItem value="En revisión">En revisión</SelectItem>
                                <SelectItem value="Protegido">Protegido</SelectItem>
                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-xs">Por eliminar: <span className="font-medium text-orange-600">{pendingFines}</span></p>
                              <p className="text-xs">Eliminadas: <span className="font-medium text-green-600">{deletedFines}</span></p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {vehicle.circulation_card_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadFile(vehicle.circulation_card_url!, `tarjeta-${vehicle.license_plate}.pdf`)}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Tarjeta
                                </Button>
                              )}
                              {vehicle.ine_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadFile(vehicle.ine_url!, `ine-${vehicle.license_plate}.pdf`)}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  INE
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fines">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestión de Multas</CardTitle>
                  <CardDescription>
                    Administra todas las multas del sistema
                  </CardDescription>
                </div>
                <Dialog open={showCreateFine} onOpenChange={setShowCreateFine}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Multa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Multa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Vehículo</Label>
                        <Select value={newFine.vehicleId} onValueChange={(value) => setNewFine({...newFine, vehicleId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un vehículo" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.license_plate} - {vehicle.profiles?.telefono}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Monto</Label>
                        <Input
                          type="number"
                          value={newFine.amount}
                          onChange={(e) => setNewFine({...newFine, amount: e.target.value})}
                          placeholder="Monto de la multa"
                        />
                      </div>
                      <div>
                        <Label>Descripción</Label>
                        <Textarea
                          value={newFine.description}
                          onChange={(e) => setNewFine({...newFine, description: e.target.value})}
                          placeholder="Descripción de la multa"
                        />
                      </div>
                      <div>
                        <Label>Estado</Label>
                        <Select value={newFine.status} onValueChange={(value) => setNewFine({...newFine, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nueva">Nueva</SelectItem>
                            <SelectItem value="en proceso">En Proceso</SelectItem>
                            <SelectItem value="eliminada">Eliminada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateFine} className="w-full">
                        Crear Multa
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fines.map((fine) => (
                      <TableRow key={fine.id}>
                        <TableCell>{fine.vehicles?.license_plate}</TableCell>
                        <TableCell>{fine.vehicles?.profiles?.telefono}</TableCell>
                        <TableCell className="font-medium">${Number(fine.amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Select
                            value={fine.status}
                            onValueChange={(value) => updateFineStatus(fine.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nueva">Nueva</SelectItem>
                              <SelectItem value="en proceso">En Proceso</SelectItem>
                              <SelectItem value="eliminada">Eliminada</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{fine.description}</TableCell>
                        <TableCell>{new Date(fine.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteFine(fine.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mensaje</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate">
                            {lead.message && lead.message.length > 50 
                              ? `${lead.message.substring(0, 50)}...` 
                              : lead.message
                            }
                          </div>
                          {lead.message && lead.message.length > 50 && (
                            <button
                              className="text-xs text-primary hover:underline"
                              onClick={() => toast.info(lead.message)}
                            >
                              Ver completo
                            </button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nuevo">Nuevo</SelectItem>
                              <SelectItem value="contactado">Contactado</SelectItem>
                              <SelectItem value="convertido">Convertido</SelectItem>
                              <SelectItem value="descartado">Descartado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Detail Modal */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle del Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Teléfono</Label>
                  <p className="text-lg font-medium">{selectedUser.telefono}</p>
                </div>
                <div>
                  <Label>Rol</Label>
                  <p className="text-lg font-medium">{selectedUser.role}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Vehículos ({selectedUser.vehicleCount})</h3>
                <div className="space-y-2">
                  {vehicles
                    .filter(v => v.user_id === selectedUser.user_id)
                    .map(vehicle => (
                      <div key={vehicle.id} className="flex justify-between items-center p-3 border rounded">
                        <span>{vehicle.license_plate}</span>
                        <Badge className={getStatusColor(vehicle.status)}>
                          {vehicle.status}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Multas</h3>
                <div className="space-y-2">
                  {fines
                    .filter(fine => vehicles.some(v => v.id === fine.vehicle_id && v.user_id === selectedUser.user_id))
                    .map(fine => (
                      <div key={fine.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-medium">${Number(fine.amount).toLocaleString()}</span>
                          <p className="text-sm text-muted-foreground">{fine.description}</p>
                        </div>
                        <Badge className={getStatusColor(fine.status)}>
                          {fine.status}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;