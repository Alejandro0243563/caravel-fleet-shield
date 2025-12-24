import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Eye, MoreVertical, FileText, User as UserIcon, AlertCircle, CheckCircle2, Phone, Calendar as CalendarIconLucide, Shield, CreditCard } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { AdminAddVehicleDialog } from './AdminAddVehicleDialog';
import { Car } from 'lucide-react';

interface Vehicle {
    id: string;
    license_plate: string;
    status: string;
    user_id: string;
    created_at: string;
    circulation_card_url?: string;
    ine_url?: string;
    es_persona_moral?: boolean;
    documents_enabled?: boolean;
    additional_documents?: Array<{ name: string; url: string }>;
    profiles?: {
        telefono: string;
        full_name?: string | null;
    };
    subscription?: {
        id: string;
        type: string;
        last_payment_date: string | null;
    };
    fines_summary?: {
        pending: number;
        resolved: number;
    };
}

const ITEMS_PER_PAGE = 10;

// Helper to get public URL
const publicFileUrl = (path?: string | null) => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path)) return path;
    return supabase.storage.from('documents').getPublicUrl(path).data.publicUrl;
};

export const AdminVehiclesTable = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);

    useEffect(() => {
        fetchVehicles();
    }, [page, searchTerm, statusFilter]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            // 1. Fetch vehicles
            let query = supabase
                .from('vehicles')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.ilike('license_plate', `%${searchTerm}%`);
            }

            if (statusFilter && statusFilter !== 'all') {
                query = query.eq('status', statusFilter as any);
            }

            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data: vehiclesData, error: vehiclesError, count } = await query
                .range(from, to)
                .order('created_at', { ascending: false });

            if (vehiclesError) throw vehiclesError;

            if (vehiclesData && vehiclesData.length > 0) {
                const userIds = [...new Set(vehiclesData.map(v => v.user_id))];
                const vehicleIds = vehiclesData.map(v => v.id);

                // 2. Fetch profiles
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('user_id, telefono, full_name')
                    .in('user_id', userIds);

                // 3. Fetch subscriptions
                const { data: subscriptionsData } = await supabase
                    .from('subscriptions')
                    .select('id, user_id, type, last_payment_date')
                    .in('user_id', userIds);

                // 4. Fetch fines for these vehicles to calculate summary
                const { data: finesData } = await supabase
                    .from('fines')
                    .select('vehicle_id, status')
                    .in('vehicle_id', vehicleIds);

                // 5. Join data
                const vehiclesWithDetails = vehiclesData.map(vehicle => {
                    const profile = profilesData?.find(p => p.user_id === vehicle.user_id);
                    const subscription = subscriptionsData?.find(s => s.user_id === vehicle.user_id);

                    const vehicleFines = finesData?.filter(f => f.vehicle_id === vehicle.id) || [];
                    const pendingFines = vehicleFines.filter(f => f.status === 'Pendiente').length;
                    const resolvedFines = vehicleFines.filter(f => ['Cubierta', 'Rechazada'].includes(f.status)).length;

                    return {
                        ...vehicle,
                        profiles: profile || { telefono: 'Sin teléfono', full_name: 'No especificado' },
                        subscription: subscription || { id: '', type: 'none', last_payment_date: null },
                        fines_summary: {
                            pending: pendingFines,
                            resolved: resolvedFines
                        },
                        additional_documents: (vehicle.additional_documents as any) || []
                    } as Vehicle;
                });

                setVehicles(vehiclesWithDetails);
            } else {
                setVehicles([]);
            }

            if (count !== null) {
                setTotalCount(count);
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Error al cargar vehículos');
        } finally {
            setLoading(false);
        }
    };

    const updateVehicleStatus = async (vehicleId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('vehicles')
                .update({ status: newStatus as any })
                .eq('id', vehicleId);

            if (error) throw error;

            setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus } : v));
            toast.success('Estado actualizado');
        } catch (error) {
            console.error('Error updating vehicle:', error);
            toast.error('Error al actualizar');
        }
    };

    const updateSubscription = async (userId: string, field: 'type' | 'last_payment_date', value: any) => {
        try {
            // Check if subscription exists first
            const { data: existingSub } = await supabase
                .from('subscriptions')
                .select('id')
                .eq('user_id', userId)
                .single();

            let error;

            if (existingSub) {
                const { error: updateError } = await supabase
                    .from('subscriptions')
                    .update({ [field]: value })
                    .eq('user_id', userId);
                error = updateError;
            } else {
                // Create if not exists
                const { error: insertError } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: userId,
                        [field]: value,
                        amount: 0, // Default
                        status: 'active',
                        type: field === 'type' ? value : 'monthly' // If setting date, default type to monthly
                    });
                error = insertError;
            }

            if (error) throw error;

            setVehicles(prev => prev.map(v => {
                if (v.user_id === userId) {
                    return {
                        ...v,
                        subscription: {
                            ...v.subscription!,
                            [field]: value
                        }
                    };
                }
                return v;
            }));

            toast.success('Suscripción actualizada');
        } catch (error) {
            console.error('Error updating subscription:', error);
            toast.error('Error al actualizar suscripción');
        }
    };

    const updateDocumentsEnabled = async (vehicleId: string, enabled: boolean) => {
        try {
            const { error } = await supabase
                .from('vehicles')
                .update({ documents_enabled: enabled })
                .eq('id', vehicleId);

            if (error) throw error;

            setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, documents_enabled: enabled } : v));
            toast.success(enabled ? 'Carga de documentos habilitada' : 'Carga de documentos deshabilitada');
        } catch (error) {
            console.error('Error updating documents_enabled:', error);
            toast.error('Error al actualizar');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Protegido': return 'bg-green-500 hover:bg-green-600 text-white border-0';
            case 'Pendiente': return 'bg-yellow-500 hover:bg-yellow-600 text-white border-0';
            case 'En revisión': return 'bg-blue-500 hover:bg-blue-600 text-white border-0';
            case 'Inactivo': return 'bg-gray-500 hover:bg-gray-600 text-white border-0';
            case 'Pago pendiente': return 'bg-red-500 hover:bg-red-600 text-white border-0';
            default: return 'bg-gray-500 text-white border-0';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por placa..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="pl-8"
                    />
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={(val) => {
                        setStatusFilter(val);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Protegido">Protegido</SelectItem>
                        <SelectItem value="En revisión">En revisión</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Pago pendiente">Pago pendiente</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    onClick={() => setShowAddVehicleDialog(true)}
                    className="w-full md:w-auto h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all group shrink-0"
                >
                    <Car className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Nuevo Vehículo
                </Button>
            </div>

            <div className="rounded-md border text-[10px] md:text-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[180px]">Vehículo / Usuario</TableHead>
                            <TableHead>Suscripción</TableHead>
                            <TableHead>Último Pago</TableHead>
                            <TableHead className="w-[160px]">Protección</TableHead>
                            <TableHead>Documentos</TableHead>
                            <TableHead>Multas</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : vehicles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No se encontraron vehículos
                                </TableCell>
                            </TableRow>
                        ) : (
                            vehicles.map((vehicle) => (
                                <TableRow
                                    key={vehicle.id}
                                    className="hover:bg-muted/50 transition-colors cursor-pointer group"
                                    onClick={() => {
                                        setSelectedVehicle(vehicle);
                                        setIsDetailOpen(true);
                                    }}
                                >
                                    <TableCell className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm tracking-tight">{vehicle.license_plate}</span>
                                            <span className="text-xs text-foreground font-bold">{vehicle.profiles?.full_name || 'Sin nombre'}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">{vehicle.profiles?.telefono}</span>
                                            {vehicle.es_persona_moral && (
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[9px] py-0 px-1 mt-1 w-fit">
                                                    Persona Moral
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Plan</div>
                                            <Select
                                                value={vehicle.subscription?.type || "none"}
                                                onValueChange={(val) => updateSubscription(vehicle.user_id, 'type', val)}
                                            >
                                                <SelectTrigger className="w-24 h-8 text-xs font-medium focus:ring-0">
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Ninguna</SelectItem>
                                                    <SelectItem value="monthly">Mensual</SelectItem>
                                                    <SelectItem value="annual">Anual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Pago</div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-[100px] justify-start text-left font-medium text-xs h-8 focus:ring-0",
                                                            !vehicle.subscription?.last_payment_date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5 opacity-60" />
                                                        {vehicle.subscription?.last_payment_date ? (
                                                            format(new Date(vehicle.subscription.last_payment_date), "dd/MM/yy")
                                                        ) : (
                                                            <span>Fecha</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={vehicle.subscription?.last_payment_date ? new Date(vehicle.subscription.last_payment_date) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                updateSubscription(vehicle.user_id, 'last_payment_date', date.toISOString());
                                                            }
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Estado Protección</div>
                                            <Select
                                                value={vehicle.status}
                                                onValueChange={(value) => updateVehicleStatus(vehicle.id, value)}
                                            >
                                                <SelectTrigger className={cn(
                                                    "w-36 h-8 text-[11px] font-bold rounded-full transition-all border-0 ring-offset-background focus:ring-0 focus:ring-offset-0",
                                                    getStatusColor(vehicle.status)
                                                )}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Protegido">Protegido</SelectItem>
                                                    <SelectItem value="En revisión">En revisión</SelectItem>
                                                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                                                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                                                    <SelectItem value="Pago pendiente">Pago pendiente</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={vehicle.documents_enabled}
                                                onCheckedChange={(checked) => updateDocumentsEnabled(vehicle.id, checked)}
                                                id={`docs-${vehicle.id}`}
                                            />
                                            <Label
                                                htmlFor={`docs-${vehicle.id}`}
                                                className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground cursor-pointer"
                                            >
                                                Carga Habilitada
                                            </Label>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <TooltipProvider>
                                            <div className="flex items-center gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center gap-1 cursor-help px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100">
                                                            <AlertCircle className="h-3 w-3" />
                                                            <span className="text-xs font-bold">{vehicle.fines_summary?.pending || 0}</span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p className="text-xs">Multas Pendientes</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center gap-1 cursor-help px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-100">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            <span className="text-xs font-bold">{vehicle.fines_summary?.resolved || 0}</span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p className="text-xs">Multas Resueltas</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-muted-foreground border-b mb-1">
                                                    Documentos Base
                                                </div>
                                                {vehicle.circulation_card_url ? (
                                                    <DropdownMenuItem asChild>
                                                        <a href={publicFileUrl(vehicle.circulation_card_url)} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                                                            <FileText className="mr-2 h-4 w-4 text-primary" />
                                                            <span>Tarjeta Circulación</span>
                                                        </a>
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem disabled>Tarjeta Circulación (Falta)</DropdownMenuItem>
                                                )}

                                                {!vehicle.es_persona_moral && (
                                                    vehicle.ine_url ? (
                                                        <DropdownMenuItem asChild>
                                                            <a href={publicFileUrl(vehicle.ine_url)} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                                                                <UserIcon className="mr-2 h-4 w-4 text-primary" />
                                                                <span>Identificación INE</span>
                                                            </a>
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem disabled>INE (Falta)</DropdownMenuItem>
                                                    )
                                                )}

                                                {vehicle.additional_documents && vehicle.additional_documents.length > 0 && (
                                                    <>
                                                        <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-muted-foreground border-b border-t mt-1 mb-1">
                                                            Documentos Adicionales
                                                        </div>
                                                        {vehicle.additional_documents.map((doc, idx) => (
                                                            <DropdownMenuItem key={idx} asChild>
                                                                <a href={publicFileUrl(doc.url)} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                                                                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                    <span className="truncate">{doc.name}</span>
                                                                </a>
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
                    Total: {totalCount}
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
                    <div className="text-xs font-medium">
                        {page} / {totalPages}
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

            <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="border-b pb-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <SheetTitle className="text-2xl font-bold tracking-tight">Detalle del Vehículo</SheetTitle>
                        </div>
                        <SheetDescription className="text-base">
                            Información completa y gestión del vehículo <span className="font-bold text-foreground">{selectedVehicle?.license_plate}</span>
                        </SheetDescription>
                    </SheetHeader>

                    {selectedVehicle && (
                        <div className="space-y-8">
                            {/* Propietario Section */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    Datos del Propietario
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-tight">Teléfono de contacto</div>
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-primary" />
                                            {selectedVehicle.profiles?.telefono}
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-tight">Tipo de Persona</div>
                                        <div className="font-bold text-lg">
                                            {selectedVehicle.es_persona_moral ? (
                                                <Badge className="bg-blue-600 text-white hover:bg-blue-700">Persona Moral</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-primary text-primary">Persona Física</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Estado y Protección */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Protección y Estado
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
                                        <div className="text-xs text-muted-foreground uppercase tracking-tight">Estado Actual</div>
                                        <Select
                                            value={selectedVehicle.status}
                                            onValueChange={(value) => updateVehicleStatus(selectedVehicle.id, value)}
                                        >
                                            <SelectTrigger className={cn(
                                                "w-full h-10 text-xs font-bold rounded-lg border-0 focus:ring-2",
                                                getStatusColor(selectedVehicle.status)
                                            )}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Protegido">Protegido</SelectItem>
                                                <SelectItem value="En revisión">En revisión</SelectItem>
                                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                                                <SelectItem value="Inactivo">Inactivo</SelectItem>
                                                <SelectItem value="Pago pendiente">Pago pendiente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-tight">Control de Documentos</div>
                                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border">
                                            <span className="text-xs font-bold">Carga Habilitada</span>
                                            <Switch
                                                checked={selectedVehicle.documents_enabled}
                                                onCheckedChange={(checked) => updateDocumentsEnabled(selectedVehicle.id, checked)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SuscripciónSection */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Plan y Suscripción
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
                                        <div className="text-xs text-muted-foreground uppercase tracking-tight">Tipo de Plan</div>
                                        <Select
                                            value={selectedVehicle.subscription?.type || "none"}
                                            onValueChange={(val) => updateSubscription(selectedVehicle.user_id, 'type', val)}
                                        >
                                            <SelectTrigger className="w-full h-10 text-sm font-medium">
                                                <SelectValue placeholder="Seleccionar Plan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Ninguno</SelectItem>
                                                <SelectItem value="monthly">Mensual</SelectItem>
                                                <SelectItem value="annual">Anual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
                                        <div className="text-xs text-muted-foreground uppercase tracking-tight">Último Pago</div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-medium h-10",
                                                        !selectedVehicle.subscription?.last_payment_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIconLucide className="mr-2 h-4 w-4 opacity-70" />
                                                    {selectedVehicle.subscription?.last_payment_date ? (
                                                        format(new Date(selectedVehicle.subscription.last_payment_date), "PPP", { locale: es })
                                                    ) : (
                                                        <span>Registrar fecha de pago</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedVehicle.subscription?.last_payment_date ? new Date(selectedVehicle.subscription.last_payment_date) : undefined}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            updateSubscription(selectedVehicle.user_id, 'last_payment_date', date.toISOString());
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </section>

                            {/* Documentos Section */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Expediente de Documentos
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-muted/10 p-5 rounded-2xl border-2 border-dashed border-muted flex flex-col gap-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {selectedVehicle.circulation_card_url && (
                                                <a
                                                    href={publicFileUrl(selectedVehicle.circulation_card_url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center p-3 bg-white rounded-xl border shadow-sm hover:border-primary transition-colors group"
                                                >
                                                    <FileText className="mr-3 h-5 w-5 text-primary" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-foreground">Tarjeta Circulación</span>
                                                        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Click para ver</span>
                                                    </div>
                                                </a>
                                            )}
                                            {selectedVehicle.ine_url && !selectedVehicle.es_persona_moral && (
                                                <a
                                                    href={publicFileUrl(selectedVehicle.ine_url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center p-3 bg-white rounded-xl border shadow-sm hover:border-primary transition-colors group"
                                                >
                                                    <UserIcon className="mr-3 h-5 w-5 text-primary" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-foreground">Identificación Propietario</span>
                                                        <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Click para ver</span>
                                                    </div>
                                                </a>
                                            )}
                                        </div>

                                        {selectedVehicle.additional_documents && selectedVehicle.additional_documents.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-1">Documentos adicionales subidos por el cliente</div>
                                                {selectedVehicle.additional_documents.map((doc, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={publicFileUrl(doc.url)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center p-2.5 bg-muted/50 rounded-lg border hover:bg-muted transition-colors"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                                        <span className="text-xs font-medium truncate">{doc.name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <AdminAddVehicleDialog
                open={showAddVehicleDialog}
                onOpenChange={setShowAddVehicleDialog}
                onSuccess={fetchVehicles}
            />
        </div>
    );
};
