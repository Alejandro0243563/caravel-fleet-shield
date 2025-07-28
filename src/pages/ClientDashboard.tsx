import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Car, FileText, Upload, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  full_name: string;
  phone: string;
}

interface Vehicle {
  id: string;
  license_plate: string;
  status: string;
  created_at: string;
  circulation_card_url?: string;
}

interface Fine {
  id: string;
  amount: number;
  status: string;
  description?: string;
  created_at: string;
  vehicle_id: string;
}

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', user?.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setNewPhone(profileData.phone || '');
      }

      // Fetch vehicles
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (vehiclesData) {
        setVehicles(vehiclesData);
      }

      // Fetch fines for user's vehicles
      if (vehiclesData && vehiclesData.length > 0) {
        const vehicleIds = vehiclesData.map(v => v.id);
        const { data: finesData } = await supabase
          .from('fines')
          .select('*')
          .in('vehicle_id', vehicleIds)
          .order('created_at', { ascending: false });
        
        if (finesData) {
          setFines(finesData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const updatePhone = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: newPhone })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, phone: newPhone } : null);
      setEditingPhone(false);
      toast.success('Teléfono actualizado');
    } catch (error) {
      console.error('Error updating phone:', error);
      toast.error('Error al actualizar el teléfono');
    }
  };

  const handleFileUpload = async (file: File, vehicleId?: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${vehicleId || 'profile'}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast.success('Archivo subido exitosamente');
      
      // If it's a vehicle document, update the vehicle record
      if (vehicleId) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({ circulation_card_url: fileName })
          .eq('id', vehicleId);

        if (updateError) throw updateError;
        
        fetchUserData(); // Refresh data
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir el archivo');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Protegido': return 'bg-green-500';
      case 'En revisión': return 'bg-yellow-500';
      case 'Pendiente': return 'bg-orange-500';
      case 'Cubierta': return 'bg-green-500';
      case 'Impugnada': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateTotalFines = () => {
    return fines.reduce((total, fine) => total + Number(fine.amount), 0);
  };

  const calculateTotalSaved = () => {
    const totalFines = calculateTotalFines();
    const subscriptionCost = vehicles.length * 200; // $200 per vehicle per month
    return Math.max(0, totalFines - subscriptionCost);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Cargando dashboard...</p>
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
              <h1 className="text-xl font-bold">Mi Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {profile?.full_name || user?.email}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehículos
            </TabsTrigger>
            <TabsTrigger value="fines" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Multas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Gestiona tu información de contacto y documentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Correo electrónico
                    </Label>
                    <Input value={user?.email || ''} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </Label>
                    {editingPhone ? (
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="Ingresa tu teléfono"
                        />
                        <Button onClick={updatePhone} size="sm">
                          Guardar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingPhone(false);
                            setNewPhone(profile?.phone || '');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        <Input value={profile?.phone || 'No especificado'} disabled />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingPhone(true)}
                        >
                          Editar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Subir documentos personales</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      className="hidden"
                      id="personal-documents"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('personal-documents')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Subir INE o documento
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mis Vehículos</h2>
                <Badge variant="secondary">
                  {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} registrado{vehicles.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {vehicles.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No tienes vehículos registrados</p>
                    <p className="text-muted-foreground">
                      Los vehículos se registran automáticamente cuando realizas un pago
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold">
                              Placas: {vehicle.license_plate}
                            </h3>
                            <Badge className={getStatusColor(vehicle.status)}>
                              {vehicle.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              Registrado: {new Date(vehicle.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <div>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(file, vehicle.id);
                                  }
                                }}
                                className="hidden"
                                id={`vehicle-docs-${vehicle.id}`}
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => document.getElementById(`vehicle-docs-${vehicle.id}`)?.click()}
                                className="flex items-center gap-2"
                              >
                                <Upload className="h-3 w-3" />
                                Actualizar documentos
                              </Button>
                            </div>
                            {vehicle.circulation_card_url && (
                              <Badge variant="outline" className="text-xs">
                                Documentos subidos
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fines">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {fines.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Total de multas</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-destructive">
                        ${calculateTotalFines().toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Monto total</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        ${calculateTotalSaved().toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total ahorrado</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fines List */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Historial de Multas</h2>
                {fines.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No tienes multas registradas</p>
                      <p className="text-muted-foreground">
                        ¡Excelente! Tu protección está funcionando
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {fines.map((fine) => {
                      const vehicle = vehicles.find(v => v.id === fine.vehicle_id);
                      return (
                        <Card key={fine.id}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <h3 className="font-semibold">
                                  Multa - {vehicle?.license_plate || 'Vehículo desconocido'}
                                </h3>
                                <p className="text-2xl font-bold text-destructive">
                                  ${Number(fine.amount).toLocaleString()}
                                </p>
                                {fine.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {fine.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {new Date(fine.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={getStatusColor(fine.status)}>
                                {fine.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;