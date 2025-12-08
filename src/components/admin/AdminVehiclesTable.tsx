import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface Vehicle {
    id: string;
    license_plate: string;
    status: string;
    user_id: string;
    created_at: string;
    circulation_card_url?: string;
    ine_url?: string;
    es_persona_moral?: boolean;
    profiles?: {
        telefono: string;
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

export const AdminVehiclesTable = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

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
                query = query.eq('status', statusFilter);
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
                    .select('user_id, telefono')
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
                        profiles: profile || { telefono: 'Sin teléfono' },
                        subscription: subscription || { id: '', type: 'none', last_payment_date: null },
                        fines_summary: {
                            pending: pendingFines,
                            resolved: resolvedFines
                        }
                    };
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Protegido': return 'bg-green-100 text-green-800 border-green-200';
            case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'En revisión': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Inactivo': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Pago pendiente': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Tarjeta de Circulación</TableHead>
                            <TableHead>ID del Propietario</TableHead>
                            <TableHead>Último pago</TableHead>
                            <TableHead>Tipo suscripción</TableHead>
                            <TableHead>Estado vehículo</TableHead>
                            <TableHead>Multas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : vehicles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No se encontraron vehículos
                                </TableCell>
                            </TableRow>
                        ) : (
                            vehicles.map((vehicle) => (
                                <TableRow key={vehicle.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-base">{vehicle.profiles?.telefono}</span>
                                            <span className="text-sm text-muted-foreground">{vehicle.license_plate}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {vehicle.circulation_card_url ? (
                                            <a
                                                href={vehicle.circulation_card_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline text-sm font-medium"
                                            >
                                                Ver archivo
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {vehicle.es_persona_moral ? (
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                Persona Moral
                                            </Badge>
                                        ) : vehicle.ine_url ? (
                                            <a
                                                href={vehicle.ine_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline text-sm font-medium"
                                            >
                                                Ver INE
                                            </a>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[180px] justify-start text-left font-normal",
                                                        !vehicle.subscription?.last_payment_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {vehicle.subscription?.last_payment_date ? (
                                                        format(new Date(vehicle.subscription.last_payment_date), "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Seleccionar fecha</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
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
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={vehicle.subscription?.type || "none"}
                                            onValueChange={(val) => updateSubscription(vehicle.user_id, 'type', val)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Selecciona</SelectItem>
                                                <SelectItem value="monthly">Mensual</SelectItem>
                                                <SelectItem value="annual">Anual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getStatusColor(vehicle.status)}>
                                                {vehicle.status}
                                            </Badge>
                                            <Select
                                                value={vehicle.status}
                                                onValueChange={(value) => updateVehicleStatus(vehicle.id, value)}
                                            >
                                                <SelectTrigger className="w-32 h-8">
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
                                        <div className="flex flex-col text-xs space-y-1">
                                            <span className="text-orange-600 font-medium">
                                                Por eliminar: {vehicle.fines_summary?.pending || 0}
                                            </span>
                                            <span className="text-green-600 font-medium">
                                                Eliminadas: {vehicle.fines_summary?.resolved || 0}
                                            </span>
                                        </div>
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
                    Total: {totalCount} vehículos
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
        </div>
    );
};
