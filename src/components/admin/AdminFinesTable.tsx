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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Eye,
    MoreVertical,
    FileText,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Upload,
    Download,
    Scale,
    Gavel,
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
            full_name?: string | null;
        };
    };
    legal_documents?: Array<{ name: string; url: string }>;
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

    // Detail View State
    const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

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
                query = query.eq('status', statusFilter as any);
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
                    .select('user_id, telefono, full_name')
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
                        vehicles: vehicle ? {
                            license_plate: vehicle.license_plate,
                            profiles: profile || { telefono: 'Sin teléfono', full_name: 'Sin nombre' }
                        } : undefined
                    };
                }).filter(Boolean) as unknown as Fine[];

                setFines(finesWithDetails);
            } else {
                if (finesError) throw finesError;
                setFines(finesData as any);
                setTotalCount(count || 0);
                setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
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
            case 'Cubierta': return 'bg-green-500 hover:bg-green-600 text-white border-0';
            case 'Pendiente': return 'bg-yellow-500 hover:bg-yellow-600 text-white border-0';
            case 'Impugnada': return 'bg-blue-500 hover:bg-blue-600 text-white border-0';
            case 'Rechazada': return 'bg-red-500 hover:bg-red-600 text-white border-0';
            default: return 'bg-gray-500 text-white border-0';
        }
    };

    const publicFileUrl = (path?: string | null) => {
        if (!path) return undefined;
        if (/^https?:\/\//i.test(path)) return path;
        return supabase.storage.from('documents').getPublicUrl(path).data.publicUrl;
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedFine) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `legal_files/${selectedFine.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const newDoc = { name: file.name, url: filePath };
            const currentDocs = selectedFine.legal_documents || [];
            const updatedDocs = [...currentDocs, newDoc];

            const { error: dbError } = await supabase
                .from('fines')
                .update({ legal_documents: updatedDocs })
                .eq('id', selectedFine.id);

            if (dbError) throw dbError;

            const updatedFine = { ...selectedFine, legal_documents: updatedDocs };
            setSelectedFine(updatedFine);
            setFines(prev => prev.map(f => f.id === selectedFine.id ? updatedFine : f));
            toast.success('Documento legal subido');
            fetchFines();
        } catch (error: any) {
            console.error('Error uploading:', error);
            toast.error('Error al subir documento');
        } finally {
            setUploading(false);
        }
    };

    const deleteLegalDoc = async (docUrl: string) => {
        if (!selectedFine || !docUrl) return;

        try {
            setUploading(true);
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([docUrl]);

            if (storageError) throw storageError;

            const updatedDocs = (selectedFine.legal_documents || []).filter(d => d.url !== docUrl);

            const { error: dbError } = await supabase
                .from('fines')
                .update({ legal_documents: updatedDocs as any } as any)
                .eq('id', selectedFine.id);

            if (dbError) throw dbError;

            const updatedFine = { ...selectedFine, legal_documents: updatedDocs };
            setSelectedFine(updatedFine);
            setFines(prev => prev.map(f => f.id === selectedFine.id ? updatedFine : f));
            toast.success('Documento eliminado');
        } catch (error: any) {
            console.error('Error deleting:', error);
            toast.error('Error al eliminar documento');
        } finally {
            setUploading(false);
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

            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[150px]">Vehículo</TableHead>
                            <TableHead className="w-[180px]">Propietario / Contacto</TableHead>
                            <TableHead className="w-[120px]">Monto</TableHead>
                            <TableHead>Detalle / Motivo</TableHead>
                            <TableHead className="w-[160px]">Estado Legal</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
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
                                <TableRow
                                    key={fine.id}
                                    className="hover:bg-muted/50 transition-colors cursor-pointer group"
                                    onClick={() => {
                                        setSelectedFine(fine);
                                        setIsDetailOpen(true);
                                    }}
                                >
                                    <TableCell className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm tracking-tight">{fine.vehicles?.license_plate || '—'}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Vehículo Registrado</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-foreground">{fine.vehicles?.profiles?.full_name || 'Sin nombre'}</span>
                                            <span className="text-xs text-muted-foreground font-medium">{fine.vehicles?.profiles?.telefono || '—'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-bold text-sm text-foreground">
                                            ${fine.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                                            {fine.description || 'Sin descripción detallada'}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5">
                                            <Select
                                                value={fine.status}
                                                onValueChange={(value) => updateFineStatus(fine.id, value)}
                                            >
                                                <SelectTrigger
                                                    className={cn(
                                                        "w-36 h-8 text-[11px] font-bold rounded-full transition-all border-0 focus:ring-0",
                                                        getStatusColor(fine.status)
                                                    )}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
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
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted-foreground/10">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => { setSelectedFine(fine); setIsDetailOpen(true); }}>
                                                    <Scale className="mr-2 h-4 w-4 text-primary" />
                                                    <span>Gestión de Expediente</span>
                                                </DropdownMenuItem>
                                                <div className="border-t my-1"></div>
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Eliminar Registro</span>
                                                </DropdownMenuItem>
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

            <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="border-b pb-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                <Scale className="h-6 w-6" />
                            </div>
                            <SheetTitle className="text-2xl font-bold tracking-tight">Expediente Legal del Caso</SheetTitle>
                        </div>
                        <SheetDescription className="text-base">
                            Gestión de documentos relativos al juicio/multa del vehículo <span className="font-bold text-foreground">{selectedFine?.vehicles?.license_plate}</span>
                        </SheetDescription>
                    </SheetHeader>

                    {selectedFine && (
                        <div className="space-y-8">
                            {/* General Info */}
                            <section className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider underline decoration-primary/30 underline-offset-4">ID de Seguimiento</div>
                                        <div className="text-sm font-mono font-bold">#{selectedFine.id.slice(0, 8).toUpperCase()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider underline decoration-primary/30 underline-offset-4">Monto Judicial</div>
                                        <div className="text-sm font-bold text-primary">${selectedFine.amount.toLocaleString()} MXN</div>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-muted-foreground/10">
                                        <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Causa / Motivo</div>
                                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                            {selectedFine.description || 'Sin causa legal registrada.'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Expediente Section */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Gavel className="h-4 w-4" />
                                        Documentación del Juicio
                                    </h3>
                                    <label className="cursor-pointer">
                                        <Input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                        <Button variant="outline" size="sm" asChild disabled={uploading} className="rounded-full shadow-sm">
                                            <span>
                                                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Upload className="h-3.5 w-3.5 mr-2" />}
                                                Subir Documento
                                            </span>
                                        </Button>
                                    </label>
                                </div>

                                <div className="bg-muted/10 p-5 rounded-2xl border-2 border-dashed border-muted min-h-[200px]">
                                    {(!selectedFine.legal_documents || selectedFine.legal_documents.length === 0) ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-8 space-y-3">
                                            <div className="bg-white p-3 rounded-full shadow-sm border">
                                                <FileText className="h-8 w-8 text-muted-foreground/30" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-muted-foreground">Expediente Vacío</p>
                                                <p className="text-[11px] text-muted-foreground/60">No hay documentos cargados en este juicio.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedFine.legal_documents.map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border shadow-sm group hover:ring-2 hover:ring-primary/20 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-primary/5 p-2 rounded-lg text-primary">
                                                            <Upload className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold truncate max-w-[200px]">{doc.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">Documento Adjunto</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-primary">
                                                            <a href={publicFileUrl(doc.url)} target="_blank" rel="noopener noreferrer">
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive"
                                                            onClick={() => deleteLegalDoc(doc.url)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Historial de Estatus */}
                            <section className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary/70 mb-4 flex items-center gap-2">
                                    <History className="h-3.5 w-3.5" />
                                    Actualizar Estatus Procesal
                                </h3>
                                <div className="flex flex-col gap-4">
                                    <Select
                                        value={selectedFine.status}
                                        onValueChange={(value) => updateFineStatus(selectedFine.id, value)}
                                    >
                                        <SelectTrigger className={cn("w-full h-11 font-bold text-sm", getStatusColor(selectedFine.status))}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pendiente">Pendiente</SelectItem>
                                            <SelectItem value="Cubierta">Cubierta</SelectItem>
                                            <SelectItem value="Impugnada">Impugnada (En Juicio)</SelectItem>
                                            <SelectItem value="Rechazada">Rechazada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground text-center italic">
                                        Al cambiar el estado, el cliente podrá ver la actualización en su portal de forma inmediata.
                                    </p>
                                </div>
                            </section>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};
