import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Search, Car, User as UserIcon, Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AdminAddVehicleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId?: string; // Optional: if provided, user selection is hidden
    onSuccess?: () => void;
}

interface Profile {
    user_id: string;
    telefono: string;
    full_name: string | null;
}

export const AdminAddVehicleDialog = ({ open, onOpenChange, userId, onSuccess }: AdminAddVehicleDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [licensePlate, setLicensePlate] = useState('');
    const [status, setStatus] = useState('Protegido');
    const [subscriptionType, setSubscriptionType] = useState('monthly');
    const [esPersonaMoral, setEsPersonaMoral] = useState(false);

    // Document state
    const [circulationCardFile, setCirculationCardFile] = useState<File | null>(null);
    const [ineFile, setIneFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // User selection state
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(userId);
    const [userSearchOpen, setUserSearchOpen] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        if (open) {
            setSelectedUserId(userId);
            setLicensePlate('');
            setStatus('Protegido');
            setSubscriptionType('monthly');
            setEsPersonaMoral(false);
            setCirculationCardFile(null);
            setIneFile(null);
            if (!userId) {
                fetchProfiles('');
            }
        }
    }, [open, userId]);

    const fetchProfiles = async (query: string) => {
        setSearchingUsers(true);
        try {
            let supabaseQuery = supabase
                .from('profiles')
                .select('user_id, telefono, full_name')
                .limit(10);

            if (query) {
                supabaseQuery = supabaseQuery.or(`telefono.ilike.%${query}%,full_name.ilike.%${query}%`);
            }

            const { data, error } = await supabaseQuery;
            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setSearchingUsers(false);
        }
    };

    const uploadFile = async (file: File, prefix: string, vehicleId: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${prefix}_${Date.now()}.${fileExt}`;
        const filePath = `vehicles/${vehicleId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) throw uploadError;
        return filePath;
    };

    const handleCreate = async () => {
        if (!licensePlate.trim()) {
            toast.error('La placa es obligatoria');
            return;
        }
        if (!selectedUserId) {
            toast.error('Debes seleccionar un usuario');
            return;
        }

        setLoading(true);
        setIsUploading(true);
        try {
            // 1. Create vehicle (initial record)
            const { data: vehicle, error: vehicleError } = await supabase
                .from('vehicles')
                .insert({
                    license_plate: licensePlate.toUpperCase(),
                    user_id: selectedUserId,
                    status: status as any,
                    es_persona_moral: esPersonaMoral
                })
                .select()
                .single();

            if (vehicleError) throw vehicleError;

            // 2. Upload documents if selected
            let circulationCardUrl = null;
            let ineUrl = null;

            if (circulationCardFile) {
                circulationCardUrl = await uploadFile(circulationCardFile, 'tarjeta_circulacion', vehicle.id);
            }
            if (ineFile && !esPersonaMoral) {
                ineUrl = await uploadFile(ineFile, 'ine', vehicle.id);
            }

            // 3. Update vehicle with document URLs if any were uploaded
            if (circulationCardUrl || ineUrl) {
                const { error: updateError } = await supabase
                    .from('vehicles')
                    .update({
                        circulation_card_url: circulationCardUrl,
                        ine_url: ineUrl
                    })
                    .eq('id', vehicle.id);

                if (updateError) throw updateError;
            }

            // 2. Create subscription if type is not none
            if (subscriptionType !== 'none') {
                const { error: subError } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: selectedUserId,
                        type: subscriptionType,
                        status: 'active',
                        amount: subscriptionType === 'annual' ? 2160 : 200,
                        last_payment_date: new Date().toISOString()
                    });

                if (subError) {
                    console.error('Error creating subscription:', subError);
                    toast.warning('Vehículo creado pero hubo un error con la suscripción');
                }
            }

            toast.success('Vehículo creado correctamente');
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Error creating vehicle:', error);
            toast.error(error.message || 'Error al crear el vehículo');
        } finally {
            setLoading(false);
            setIsUploading(false);
        }
    };

    const selectedProfile = profiles.find(p => p.user_id === selectedUserId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Car className="h-32 w-32 -mr-8 -mt-8" />
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-2">Manual Vehicle</DialogTitle>
                    <p className="text-primary-foreground/80 text-sm font-medium leading-tight">
                        Registra un vehículo manualmente y asígnalo a un usuario sin proceso de pago.
                    </p>
                </div>

                <div className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        {/* User Selection (only if not provided) */}
                        {!userId && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Asignar a Usuario</Label>
                                <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={userSearchOpen}
                                            className="w-full h-12 justify-between rounded-xl bg-muted/30 border-none px-4 hover:bg-muted/50 transition-all font-medium"
                                        >
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                                {selectedUserId ? (
                                                    <span className="truncate">
                                                        {selectedProfile?.full_name || selectedProfile?.telefono || 'Usuario seleccionado'}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">Buscar usuario...</span>
                                                )}
                                            </div>
                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[416px] p-0 rounded-xl border-none shadow-2xl overflow-hidden" align="start">
                                        <Command className="rounded-xl" shouldFilter={false}>
                                            <CommandInput
                                                placeholder="Nombre o teléfono..."
                                                onValueChange={(val) => {
                                                    setSearchQuery(val);
                                                    fetchProfiles(val);
                                                }}
                                            />
                                            <CommandList>
                                                {searchingUsers ? (
                                                    <div className="p-4 flex justify-center">
                                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                    </div>
                                                ) : profiles.length === 0 ? (
                                                    <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                                                ) : (
                                                    <CommandGroup>
                                                        {profiles.map((profile) => (
                                                            <CommandItem
                                                                key={profile.user_id}
                                                                value={profile.user_id}
                                                                onSelect={() => {
                                                                    setSelectedUserId(profile.user_id);
                                                                    setUserSearchOpen(false);
                                                                }}
                                                                className="py-3 px-4 flex items-center justify-between cursor-pointer"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-sm">{profile.full_name || 'Sin nombre'}</span>
                                                                    <span className="text-xs text-muted-foreground">{profile.telefono}</span>
                                                                </div>
                                                                {selectedUserId === profile.user_id && (
                                                                    <Check className="h-4 w-4 text-primary" />
                                                                )}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                )}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="plate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Placas</Label>
                                <div className="relative">
                                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="plate"
                                        placeholder="ABC-123"
                                        value={licensePlate}
                                        onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                        className="h-12 pl-10 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 font-black uppercase tracking-wider"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Estado Protección</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none focus:ring-primary/20 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-xl">
                                        <SelectItem value="Protegido" className="font-medium">Protegido</SelectItem>
                                        <SelectItem value="En revisión" className="font-medium">En revisión</SelectItem>
                                        <SelectItem value="Pendiente" className="font-medium">Pendiente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Plan de Suscripción</Label>
                            <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none focus:ring-primary/20 font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none shadow-xl">
                                    <SelectItem value="none" className="font-medium text-muted-foreground">Sin Suscripción (Solo Registro)</SelectItem>
                                    <SelectItem value="monthly" className="font-medium">Suscripción Mensual ($200)</SelectItem>
                                    <SelectItem value="annual" className="font-medium">Suscripción Anual ($2,160)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-muted/20 border border-border/10">
                            <input
                                type="checkbox"
                                id="moral"
                                checked={esPersonaMoral}
                                onChange={(e) => setEsPersonaMoral(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            />
                            <Label htmlFor="moral" className="text-xs font-bold uppercase tracking-tight text-muted-foreground cursor-pointer">Persona Moral</Label>
                        </div>

                        {/* Document Uploads */}
                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tarjeta de Circulación</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => setCirculationCardFile(e.target.files?.[0] || null)}
                                        className="h-10 text-xs rounded-xl bg-muted/30 border-none file:bg-primary file:text-white file:border-none file:rounded-lg file:px-3 file:py-1 file:mr-3 file:hover:bg-primary/90 file:cursor-pointer cursor-pointer"
                                    />
                                </div>
                            </div>

                            {!esPersonaMoral && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identificación INE</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setIneFile(e.target.files?.[0] || null)}
                                            className="h-10 text-xs rounded-xl bg-muted/30 border-none file:bg-primary file:text-white file:border-none file:rounded-lg file:px-3 file:py-1 file:mr-3 file:hover:bg-primary/90 file:cursor-pointer cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl border-border/50 font-bold text-muted-foreground"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest"
                            onClick={handleCreate}
                            disabled={loading || !selectedUserId || !licensePlate}
                        >
                            {loading || isUploading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Shield className="w-4 h-4 mr-2" />
                                    Agregar Vehículo
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
