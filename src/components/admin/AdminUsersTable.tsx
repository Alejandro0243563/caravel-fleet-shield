import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface User {
    user_id: string;
    telefono: string;
    role: string;
    created_at: string;
    fecha_registro?: string;
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
                query = query.ilike('telefono', `%${searchTerm}%`);
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

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por teléfono..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Fecha Registro</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No se encontraron usuarios
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.user_id}>
                                    <TableCell>{user.telefono || 'Sin teléfono'}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.fecha_registro || user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleShowDetails(user)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Ver Detalles
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

            {/* User Detail Dialog */}
            <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
                <DialogContent className="max-w-3xl">
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
                                <h3 className="text-lg font-semibold mb-2">Vehículos Registrados</h3>
                                {loadingDetails ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : userVehicles.length > 0 ? (
                                    <div className="space-y-2">
                                        {userVehicles.map(vehicle => (
                                            <div key={vehicle.id} className="flex justify-between items-center p-3 border rounded">
                                                <span className="font-medium">{vehicle.license_plate}</span>
                                                <Badge variant="outline">{vehicle.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No tiene vehículos registrados.</p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

