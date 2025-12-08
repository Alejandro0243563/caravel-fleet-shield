import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Fine {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    description?: string;
    vehicle_id: string;
    vehicles?: {
        license_plate: string;
        profiles?: {
            telefono: string;
        };
    };
}

const ITEMS_PER_PAGE = 10;

export const AdminFinesTable = () => {
    const [fines, setFines] = useState<Fine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // New Fine State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newFine, setNewFine] = useState({
        amount: '',
        description: '',
        status: 'Pendiente',
        vehicle_id: ''
    });
    const [availableVehicles, setAvailableVehicles] = useState<{ id: string, license_plate: string }[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);

    useEffect(() => {
        fetchFines();
    }, [page, searchTerm, statusFilter]);

    useEffect(() => {
        if (isCreateOpen) {
            fetchAvailableVehicles();
        }
    }, [isCreateOpen]);

    const fetchAvailableVehicles = async () => {
        setLoadingVehicles(true);
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('id, license_plate')
                .order('license_plate');

            if (error) throw error;
            setAvailableVehicles(data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Error al cargar vehículos');
        } finally {
            setLoadingVehicles(false);
        }
    };

    const fetchFines = async () => {
        setLoading(true);
        try {
            // 1. Fetch fines
            let query = supabase
                .from('fines')
                .select('*', { count: 'exact' });

            if (statusFilter && statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const from = (page - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data: finesData, error: finesError, count } = await query
                .range(from, to)
                .order('created_at', { ascending: false });

            if (finesError) throw finesError;

            if (finesData && finesData.length > 0) {
                const vehicleIds = [...new Set(finesData.map(f => f.vehicle_id))];

                // 2. Fetch vehicles
                const { data: vehiclesData } = await supabase
                    .from('vehicles')
                    .select('id, license_plate, user_id')
                    .in('id', vehicleIds);

                const userIds = [...new Set(vehiclesData?.map(v => v.user_id) || [])];

                // 3. Fetch profiles
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('user_id, telefono')
                    .in('user_id', userIds);

                // 4. Join data
                const finesWithDetails = finesData.map(fine => {
                    const vehicle = vehiclesData?.find(v => v.id === fine.vehicle_id);
                    const profile = profilesData?.find(p => p.user_id === vehicle?.user_id);

                    // Filter by search term (license plate) if needed
                    if (searchTerm && !vehicle?.license_plate.toLowerCase().includes(searchTerm.toLowerCase())) {
                        return null;
                    }

                    return {
                        ...fine,
                        vehicles: {
                            license_plate: vehicle?.license_plate || 'Desconocido',
                            profiles: {
                                telefono: profile?.telefono || 'Sin teléfono'
                            }
                        }
                    };
                }).filter(Boolean) as Fine[];

                setFines(finesWithDetails);
            } else {
                setFines([]);
            }

            if (count !== null) {
                setTotalCount(count);
                setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
            }
        } catch (error) {
            console.error('Error fetching fines:', error);
            toast.error('Error al cargar multas');
        } finally {
            setLoading(false);
        }
    };

    const createFine = async () => {
        if (!newFine.amount || !newFine.vehicle_id) {
            toast.error('Por favor completa los campos requeridos');
            return;
        }

        try {
            const { error } = await supabase
                .from('fines')
                .insert({
                    amount: parseFloat(newFine.amount),
                    description: newFine.description,
                    status: newFine.status as any,
                    vehicle_id: newFine.vehicle_id
                });

            if (error) throw error;

            toast.success('Multa creada exitosamente');
            setIsCreateOpen(false);
            setNewFine({ amount: '', description: '', status: 'Pendiente', vehicle_id: '' });
            fetchFines();
        } catch (error) {
            console.error('Error creating fine:', error);
            toast.error('Error al crear multa');
        }
    };

    const updateFineStatus = async (fineId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('fines')
                .update({ status: newStatus as any })
                .eq('id', fineId);

            if (error) throw error;

            setFines(prev => prev.map(f => f.id === fineId ? { ...f, status: newStatus } : f));
            toast.success('Estado actualizado');
        } catch (error) {
            console.error('Error updating fine:', error);
            toast.error('Error al actualizar');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Cubierta': return 'bg-green-100 text-green-800 border-green-200';
            case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Impugnada': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Rechazada': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-4 w-full md:w-auto">
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
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="Pendiente">Pendiente</SelectItem>
                            <SelectItem value="Cubierta">Cubierta</SelectItem>
                            <SelectItem value="Impugnada">Impugnada</SelectItem>
                            <SelectItem value="Rechazada">Rechazada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Multa
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Nueva Multa</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Vehículo</Label>
                                <Select
                                    value={newFine.vehicle_id}
                                    onValueChange={(val) => setNewFine({ ...newFine, vehicle_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingVehicles ? "Cargando..." : "Seleccionar vehículo"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableVehicles.map((v) => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {v.license_plate}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Monto</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={newFine.amount}
                                    onChange={(e) => setNewFine({ ...newFine, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción</Label>
                                <Input
                                    placeholder="Motivo de la multa"
                                    value={newFine.description}
                                    onChange={(e) => setNewFine({ ...newFine, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Estado Inicial</Label>
                                <Select
                                    value={newFine.status}
                                    onValueChange={(val) => setNewFine({ ...newFine, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                                        <SelectItem value="Cubierta">Cubierta</SelectItem>
                                        <SelectItem value="Impugnada">Impugnada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full" onClick={createFine}>
                                Guardar Multa
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Placa</TableHead>
                            <TableHead>Propietario</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : fines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No se encontraron multas
                                </TableCell>
                            </TableRow>
                        ) : (
                            fines.map((fine) => (
                                <TableRow key={fine.id}>
                                    <TableCell className="font-medium">
                                        {fine.vehicles?.license_plate || '—'}
                                    </TableCell>
                                    <TableCell>
                                        {fine.vehicles?.profiles?.telefono || '—'}
                                    </TableCell>
                                    <TableCell>
                                        ${fine.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {fine.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(fine.status)}>
                                            {fine.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={fine.status}
                                            onValueChange={(value) => updateFineStatus(fine.id, value)}
                                        >
                                            <SelectTrigger className="w-32 h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                                                <SelectItem value="Cubierta">Cubierta</SelectItem>
                                                <SelectItem value="Impugnada">Impugnada</SelectItem>
                                                <SelectItem value="Rechazada">Rechazada</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                    Total: {totalCount} multas
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
