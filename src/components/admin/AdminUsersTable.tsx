import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Search, ChevronLeft, ChevronRight, Eye, Mail, Phone, Shield, Save, Undo, Edit, User as UserIcon, UserPlus, UserRound, MoreVertical, Trash2, Car } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { AdminAddVehicleDialog } from './AdminAddVehicleDialog';

interface User {
    user_id: string;
    telefono: string;
    role: string;
    created_at: string;
    fecha_registro?: string;
    full_name?: string | null;
    email?: string | null;
}

interface Vehicle {
    id: string;
    license_plate: string;
    status: string;
    user_id: string;
}

const ITEMS_PER_PAGE = 10;

export const AdminUsersTable = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Detail Modal State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const { impersonate } = useAuth();

    // Create User state
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newTelefono, setNewTelefono] = useState('');
    const [newFullName, setNewFullName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('cliente');
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`telefono.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
            }

            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error, count } = await query
                .range(from, to)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setUsers(data || []);
            if (count) {
                setTotalCount(count);
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleShowDetails = async (user: User) => {
        setSelectedUser(user);
        setShowUserDetail(true);
        setLoadingDetails(true);
        try {
            const { data } = await supabase
                .from('vehicles')
                .select('id, license_plate, status, user_id')
                .eq('user_id', user.user_id);

            setUserVehicles(data || []);
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Error al cargar detalles del usuario');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newTelefono) {
            toast.error('El teléfono es obligatorio');
            return;
        }

        setIsCreating(true);
        try {
            const { data, error } = await supabase.functions.invoke('admin-create-user', {
                body: {
                    telefono: newTelefono,
                    role: newRole,
                    full_name: newFullName,
                    email: newEmail
                }
            });

            if (error) throw error;

            toast.success('Usuario creado con éxito');
            setShowCreateDialog(false);
            setNewTelefono('');
            setNewFullName('');
            setNewEmail('');
            setNewRole('cliente');
            fetchUsers();
        } catch (error: any) {
            console.error('Error creating user:', error);
            toast.error(error.message || 'Error al crear el usuario');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    telefono: selectedUser.telefono,
                    full_name: selectedUser.full_name,
                    email: selectedUser.email,
                    role: selectedUser.role as any
                })
                .eq('user_id', selectedUser.user_id);

            if (error) throw error;

            toast.success('Perfil actualizado correctamente');
            fetchUsers();
        } catch (error: any) {
            console.error('Error updating user:', error);
            toast.error(error.message || 'Error al actualizar el usuario');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleImpersonate = async (user: User) => {
        try {
            await impersonate(user.user_id);
            toast.success(`Simulando sesión de ${user.telefono}`);
        } catch (error) {
            console.error('Error impersonating:', error);
            toast.error('Error al iniciar la simulación');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, correo o teléfono..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="pl-10 h-11 bg-white border-border/50 rounded-xl shadow-sm focus:ring-primary/20 transition-all"
                    />
                </div>
                <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all group"
                >
                    <UserPlus className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Nuevo Usuario
                </Button>
            </div>

            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-[280px] font-bold py-4">Usuario</TableHead>
                            <TableHead className="font-bold py-4">Contacto</TableHead>
                            <TableHead className="w-[120px] font-bold py-4">Rol</TableHead>
                            <TableHead className="w-[150px] font-bold py-4">Registro</TableHead>
                            <TableHead className="w-[80px] text-right py-4"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">Cargando usuarios...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <UserIcon className="h-10 w-10 text-muted-foreground/30" />
                                        <span className="text-sm font-medium text-muted-foreground">No se encontraron usuarios</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow
                                    key={user.user_id}
                                    className="hover:bg-muted/30 transition-colors cursor-pointer group border-b last:border-0"
                                    onClick={() => handleShowDetails(user)}
                                >
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                                <UserIcon className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm tracking-tight text-foreground/90">
                                                    {user.full_name || 'Sin nombre'}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                                                    ID: {user.user_id.slice(0, 8)}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs font-medium text-foreground/70">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                {user.telefono}
                                            </div>
                                            {user.email && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    {user.email}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "rounded-lg font-bold text-[10px] uppercase tracking-wider px-2 py-0.5",
                                                user.role === 'admin'
                                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                            )}
                                        >
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {new Date(user.fecha_registro || user.created_at).toLocaleDateString('es-MX', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleImpersonate(user);
                                            }}
                                        >
                                            <UserRound className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Total: {totalCount} usuarios
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                        Página {page} de {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* User Detail Sheet */}
            <Sheet open={showUserDetail} onOpenChange={setShowUserDetail}>
                <SheetContent className="sm:max-w-xl p-0 border-none flex flex-col h-full bg-white shadow-2xl">
                    {selectedUser && (
                        <>
                            <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden shrink-0">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <UserIcon className="h-40 w-40 -mr-12 -mt-12" />
                                </div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                                            <UserIcon className="h-8 w-8 text-white" />
                                        </div>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-md font-black uppercase tracking-widest px-3 py-1">
                                            {selectedUser.role}
                                        </Badge>
                                    </div>
                                    <div>
                                        <SheetTitle className="text-3xl font-black uppercase tracking-tight text-white mb-1">
                                            {selectedUser.full_name || 'Perfil de Usuario'}
                                        </SheetTitle>
                                        <SheetDescription className="text-white/80 font-medium">
                                            Gestión integral y visualización de datos del usuario
                                        </SheetDescription>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
                                {/* Profile Info / Edit Section */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                                            <Edit className="h-3 w-3" />
                                            Información Personal
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleUpdateUser}
                                            disabled={isUpdating}
                                            className="h-8 pr-4 pl-3 rounded-lg text-primary hover:bg-primary/5 font-bold"
                                        >
                                            {isUpdating ? (
                                                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                            ) : (
                                                <Save className="h-3 w-3 mr-2" />
                                            )}
                                            Guardar Cambios
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre Completo</Label>
                                            <Input
                                                value={selectedUser.full_name || ''}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                                                className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Teléfono</Label>
                                            <Input
                                                value={selectedUser.telefono || ''}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, telefono: e.target.value })}
                                                className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold text-primary"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Correo Electrónico</Label>
                                            <Input
                                                value={selectedUser.email || ''}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                                className="h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rol de Acceso</Label>
                                            <Select
                                                value={selectedUser.role}
                                                onValueChange={(val) => setSelectedUser({ ...selectedUser, role: val })}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-none focus:ring-primary/20 font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="cliente">Cliente</SelectItem>
                                                    <SelectItem value="admin">Administrador</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-muted/50" />

                                {/* Vehicles Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                                            <Shield className="h-3 w-3" />
                                            Vehículos Protegidos
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAddVehicleDialog(true)}
                                            className="h-8 pr-4 pl-3 rounded-lg text-primary hover:bg-primary/5 font-bold"
                                        >
                                            <Car className="h-3.5 w-3.5 mr-2" />
                                            Nuevo Vehículo
                                        </Button>
                                    </div>

                                    {loadingDetails ? (
                                        <div className="py-8 flex justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                                        </div>
                                    ) : userVehicles.length > 0 ? (
                                        <div className="grid gap-3">
                                            {userVehicles.map(vehicle => (
                                                <div key={vehicle.id} className="flex justify-between items-center p-4 rounded-2xl bg-white border border-border/50 shadow-sm group hover:border-primary/30 transition-all">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-base tracking-tight text-foreground/90 uppercase">{vehicle.license_plate}</span>
                                                        <span className="text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">ID: {vehicle.id.slice(0, 8)}</span>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "rounded-lg font-bold text-[10px] uppercase tracking-widest px-2",
                                                            vehicle.status === 'Protegido' ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                        )}
                                                    >
                                                        {vehicle.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-muted/20 rounded-2xl p-8 border border-dashed flex flex-col items-center justify-center text-center gap-2">
                                            <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground/40">
                                                <Shield className="h-6 w-6" />
                                            </div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Sin vehículos registrados</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 shrink-0 bg-muted/10 border-t border-muted/50 flex gap-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl border-border/50 font-black uppercase tracking-widest text-xs hover:bg-white"
                                    onClick={() => handleImpersonate(selectedUser)}
                                >
                                    <UserRound className="h-4 w-4 mr-2" />
                                    Simular Sesión
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/5"
                                    onClick={() => toast.error('Función de borrado no habilitada')}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Create User Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <UserPlus className="h-32 w-32 -mr-8 -mt-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-2">Nuevo Usuario</DialogTitle>
                        <p className="text-primary-foreground/80 text-sm font-medium leading-tight">
                            Registra un nuevo usuario de forma manual. Se recomienda completar todos los campos.
                        </p>
                    </div>

                    <div className="p-8 space-y-6 bg-white">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre Completo</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="fullName"
                                        placeholder="Ej. Juan Pérez"
                                        value={newFullName}
                                        onChange={(e) => setNewFullName(e.target.value)}
                                        className="h-12 pl-10 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefono" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 text-primary">Teléfono (Obligatorio)</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                    <Input
                                        id="telefono"
                                        placeholder="+52..."
                                        value={newTelefono}
                                        onChange={(e) => setNewTelefono(e.target.value)}
                                        className="h-12 pl-10 rounded-xl bg-primary/5 border-primary/20 focus-visible:ring-primary/20 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Correo Electrónico</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="h-12 pl-10 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rol de Acceso</Label>
                                <Select value={newRole} onValueChange={setNewRole}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none focus:ring-primary/20 font-bold">
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="cliente" className="rounded-lg py-3 font-medium">Cliente (Dashboard Usuario)</SelectItem>
                                        <SelectItem value="admin" className="rounded-lg py-3 font-medium">Administrador (Gestión Total)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-border/50 font-bold text-muted-foreground"
                                onClick={() => setShowCreateDialog(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest"
                                onClick={handleCreateUser}
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Crear Usuario"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AdminAddVehicleDialog
                open={showAddVehicleDialog}
                onOpenChange={setShowAddVehicleDialog}
                userId={selectedUser?.user_id}
                onSuccess={() => {
                    if (selectedUser) {
                        handleShowDetails(selectedUser);
                    }
                }}
            />
        </div>
    );
};

