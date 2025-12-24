import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Car,
  FileText,
  Upload,
  Phone,
  Plus,
  Eye,
  Trash2,
  Calendar as CalendarIcon,
  ExternalLink,
  Gavel,
  Download,
  Scale
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from 'sonner';
import { EnhancedRegistrationForm } from '@/components/EnhancedRegistrationForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddVehicleForm from '@/components/AddVehicleForm';
import { SEO } from '@/components/SEO';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Profile {
  telefono: string;
  role: string;
  full_name?: string | null;
  email?: string | null;
}

interface Vehicle {
  id: string;
  license_plate: string;
  status: string;
  created_at: string;
  circulation_card_url?: string;
  es_persona_moral: boolean;
  ine_url?: string;
  documents_enabled?: boolean;
  additional_documents?: Array<{ name: string; url: string }>;
}

interface Fine {
  id: string;
  amount: number;
  status: string;
  description?: string;
  created_at: string;
  vehicle_id: string;
  legal_documents?: Array<{ name: string; url: string }>;
}

const publicFileUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return supabase.storage.from('documents').getPublicUrl(path).data.publicUrl;
};


const ClientDashboard = () => {
  const { user, userRole, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        fetchUserData();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchUserData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setPhone(profileData.telefono || '');
        setFullName(profileData.full_name || '');
        setEmail(profileData.email || '');
      }

      // Fetch vehicles
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (vehiclesData) {
        setVehicles(vehiclesData.map(v => ({
          ...v,
          additional_documents: (v.additional_documents as any) || []
        })) as Vehicle[]);
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
          setFines((finesData || []) as any);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          telefono: phone,
          full_name: fullName,
          email: email
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Perfil actualizado correctamente');
      setIsEditingProfile(false);
      fetchUserData();
    } catch (error: any) {
      toast.error('Error al actualizar: ' + error.message);
    }
  };

  const handleFileUpload = async (vehicleId: string, file: File) => {
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${vehicleId}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update vehicle's additional_documents
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const newDocs = [...(vehicle?.additional_documents || []), { name: file.name, url: filePath }];

      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ additional_documents: newDocs as any })
        .eq('id', vehicleId);

      if (updateError) throw updateError;

      toast.success('Documento subido correctamente');
      fetchUserData();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(`Error al subir el documento: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (vehicleId: string, docUrl: string) => {
    try {
      setLoading(true);

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([docUrl]);

      if (storageError) throw storageError;

      const vehicle = vehicles.find(v => v.id === vehicleId);
      const newDocs = (vehicle?.additional_documents || []).filter(d => d.url !== docUrl);

      const { error: dbError } = await supabase
        .from('vehicles')
        .update({ additional_documents: newDocs as any })
        .eq('id', vehicleId);

      if (dbError) throw dbError;

      toast.success('Documento eliminado');
      fetchUserData();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Error al eliminar el documento');
    } finally {
      setLoading(false);
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
      <SEO
        title="Mi Dashboard - CARAVEL México"
        description="Gestiona tu protección contra multas, vehículos registrados y estado de suscripción CARAVEL."
        canonical="https://caravel.com/clientdashboard"
        noIndex={true}
      />
      {/* Header - Mobile First */}
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img
              src="/lovable-uploads/baa877cc-6d08-4d7e-ba07-2f4a014b2a59.png"
              alt="CARAVEL Logo"
              className="h-6 md:h-8 w-auto"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold">Mi Dashboard</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {profile?.telefono || user?.phone}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            Salir
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 md:py-8">
        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="vehicles" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <Car className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Vehículos</span>
              <span className="sm:hidden">Auto</span>
            </TabsTrigger>
            <TabsTrigger value="fines" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
              Multas
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <User className="h-3 w-3 md:h-4 md:w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Mis Vehículos</h2>
                  <p className="text-muted-foreground text-sm">Gestiona la protección y documentos de tu flota.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
                    {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''}
                  </Badge>
                  <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
                    <DialogTrigger asChild>
                      <Button className="flex-1 sm:flex-none shadow-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Vehículo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Vehículo</DialogTitle>
                      </DialogHeader>
                      <AddVehicleForm
                        onClose={() => {
                          setShowAddVehicle(false);
                          fetchUserData();
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {vehicles.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <Car className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">No tienes vehículos</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mt-2 mb-6">
                      Registra tu primer vehículo para comenzar a recibir protección contra multas.
                    </p>
                    <Button onClick={() => setShowAddVehicle(true)}>
                      Registrar Vehículo
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="overflow-hidden border-2 transition-all hover:border-primary/20">
                      <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-black tracking-tighter text-primary">
                                {vehicle.license_plate}
                              </h3>
                              <Badge className={cn(getStatusColor(vehicle.status), "text-white border-0 py-0.5 px-2.5")}>
                                {vehicle.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3" />
                              <span>Registrado el {new Date(vehicle.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              {vehicle.es_persona_moral && (
                                <Badge variant="outline" className="ml-2 text-[10px] h-4 py-0">Persona Moral</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <div className="flex items-center gap-2">
                                {vehicle.circulation_card_url && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                                        <a href={publicFileUrl(vehicle.circulation_card_url)} target="_blank" rel="noopener noreferrer">
                                          <FileText className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Ver Tarjeta de Circulación</TooltipContent>
                                  </Tooltip>
                                )}

                                {!vehicle.es_persona_moral && vehicle.ine_url && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                                        <a href={publicFileUrl(vehicle.ine_url)} target="_blank" rel="noopener noreferrer">
                                          <User className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Ver Identificación (INE)</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardHeader>

                      {(vehicle.documents_enabled || (vehicle.additional_documents && vehicle.additional_documents.length > 0)) && (
                        <CardContent className="pt-0 pb-6">
                          <Separator className="mb-6" />

                          <div className="space-y-6">
                            {vehicle.documents_enabled && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <h4 className="text-sm font-bold flex items-center gap-2">
                                      <Upload className="h-4 w-4 text-primary" />
                                      Cargar Documentos Solicitados
                                    </h4>
                                    <p className="text-xs text-muted-foreground">Sube los archivos adicionales requeridos por administración.</p>
                                  </div>
                                  <div>
                                    <Input
                                      type="file"
                                      className="hidden"
                                      id={`file-upload-${vehicle.id}`}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(vehicle.id, file);
                                      }}
                                    />
                                    <Button
                                      variant="default"
                                      size="sm"
                                      asChild
                                      className="cursor-pointer shadow-sm"
                                    >
                                      <label htmlFor={`file-upload-${vehicle.id}`}>
                                        <Plus className="h-4 w-4 mr-1.5" />
                                        Subir Nuevo
                                      </label>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {vehicle.additional_documents && vehicle.additional_documents.length > 0 && (
                              <div className="space-y-3">
                                {vehicle.documents_enabled && <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Documentos en expediente</p>}
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {vehicle.additional_documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border group hover:bg-muted/50 transition-colors">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-md bg-background border flex items-center justify-center shrink-0">
                                          <FileText className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium truncate">{doc.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" asChild>
                                          <a href={publicFileUrl(doc.url)} target="_blank" rel="noopener noreferrer">
                                            <Eye className="h-4 w-4" />
                                          </a>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 hover:text-destructive"
                                          onClick={() => deleteDocument(vehicle.id, doc.url)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
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
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg">
                                  Multa - {vehicle?.license_plate || 'Vehículo desconocido'}
                                </h3>
                                <p className="text-3xl font-black text-destructive tracking-tighter">
                                  ${Number(fine.amount).toLocaleString()}
                                </p>
                                {fine.description && (
                                  <p className="text-sm text-muted-foreground font-medium leading-tight max-w-md">
                                    {fine.description}
                                  </p>
                                )}
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                  Registrada el {new Date(fine.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-3">
                                <Badge className={cn(getStatusColor(fine.status), "text-white border-0 py-1 px-3")}>
                                  {fine.status}
                                </Badge>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 h-9 rounded-full px-4 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                                  onClick={() => {
                                    setSelectedFine(fine);
                                    setIsLegalOpen(true);
                                  }}
                                >
                                  <Scale className="h-4 w-4" />
                                  Ver Avance Legal
                                </Button>
                              </div>
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

          <Sheet open={isLegalOpen} onOpenChange={setIsLegalOpen}>
            <SheetContent className="sm:max-w-xl overflow-y-auto bg-slate-50">
              <SheetHeader className="border-b bg-white -mx-6 px-6 pb-6 pt-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Scale className="h-6 w-6" />
                  </div>
                  <SheetTitle className="text-2xl font-black tracking-tight uppercase">Expediente Legal</SheetTitle>
                </div>
                <SheetDescription className="text-base font-medium">
                  Seguimiento del proceso legal para la multa del vehículo <span className="font-bold text-foreground underline decoration-primary/30 decoration-2 underline-offset-4">{vehicles.find(v => v.id === selectedFine?.vehicle_id)?.license_plate}</span>
                </SheetDescription>
              </SheetHeader>

              {selectedFine && (
                <div className="space-y-8 pt-8">
                  {/* Status Summary */}
                  <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Estatus Legal</span>
                        <span className={cn("text-lg font-bold", selectedFine.status === 'Impugnada' ? 'text-blue-600' : 'text-primary')}>{selectedFine.status}</span>
                      </div>
                      <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Monto en Juicio</span>
                        <span className="text-lg font-black text-primary">${selectedFine.amount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mb-1">Causa del caso</span>
                      <p className="text-sm font-medium leading-relaxed text-slate-700">{selectedFine.description || 'Proceso en etapa informativa.'}</p>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2 flex items-center gap-2">
                      <Gavel className="h-4 w-4" />
                      Documentación y Pruebas
                    </h3>

                    <div className="bg-white p-2 rounded-[2.5rem] border shadow-inner">
                      {(!selectedFine.legal_documents || selectedFine.legal_documents.length === 0) ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-8 border-2 border-dashed border-slate-100 rounded-[2.2rem]">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-slate-200" />
                          </div>
                          <p className="text-sm font-bold text-slate-400">Sin documentos públicos</p>
                          <p className="text-[11px] text-slate-300 mt-1">El equipo legal aún no ha adjuntado documentos visibles para este caso.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedFine.legal_documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[1.8rem] border border-transparent hover:border-primary/20 hover:bg-white transition-all shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{doc.name}</span>
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Archivo PDF / Imagen</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-2xl bg-white border shadow-sm hover:text-primary transition-all">
                                <a href={publicFileUrl(doc.url)} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-5 w-5" />
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Legal Support Note */}
                  <div className="bg-primary p-6 rounded-[2.5rem] text-primary-foreground shadow-lg shadow-primary/20">
                    <div className="flex gap-4 items-start">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <Scale className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-wider">Compromiso Legal Caravel</p>
                        <p className="text-xs font-medium opacity-90 leading-tight">Tu caso está siendo gestionado por nuestro despacho especializado. Mantente atento a las actualizaciones en este portal.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          <TabsContent value="profile">
            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
              <CardHeader className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <User className="h-32 w-32 -mr-8 -mt-8" />
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight mb-2">Mi Perfil</CardTitle>
                <CardDescription className="text-primary-foreground/80 font-medium">
                  Información personal y de contacto protegida
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                      <User className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground uppercase tracking-tight">{profile?.full_name || 'Usuario Caravel'}</h3>
                      <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">{profile?.role}</p>
                    </div>
                  </div>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="rounded-xl border-primary/20 hover:bg-primary/5 text-primary font-bold h-10 px-6"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  )}
                </div>

                <Separator className="bg-muted/50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={isEditingProfile ? fullName : (profile?.full_name || 'No especificado')}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={!isEditingProfile}
                          placeholder="Tu nombre completo"
                          className="h-12 pl-10 rounded-xl bg-muted/30 border-none font-medium disabled:opacity-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={isEditingProfile ? phone : (profile?.telefono || 'No especificado')}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditingProfile}
                          className="h-12 pl-10 rounded-xl bg-muted/30 border-none font-bold text-primary disabled:opacity-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Correo Electrónico</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={isEditingProfile ? email : (profile?.email || 'No especificado')}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={!isEditingProfile}
                          placeholder="tu@correo.com"
                          className="h-12 pl-10 rounded-xl bg-muted/30 border-none font-medium disabled:opacity-100"
                        />
                      </div>
                    </div>

                    {isEditingProfile && (
                      <div className="pt-6 flex gap-3">
                        <Button
                          onClick={updateProfile}
                          className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 font-black uppercase tracking-tight"
                        >
                          Guardar Cambios
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setFullName(profile?.full_name || '');
                            setPhone(profile?.telefono || '');
                            setEmail(profile?.email || '');
                          }}
                          className="flex-1 h-12 rounded-xl border-border font-bold text-muted-foreground"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
