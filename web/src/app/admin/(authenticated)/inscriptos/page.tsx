/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, RefreshCw } from 'lucide-react';
import { ReviewPaymentModal } from '@/components/admin/ReviewPaymentModal';

interface Inscripto {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    cedula: string;
    edad: number | null;
    departamento: string | null;
    direccion: string | null;
    como_se_entero: string | null;
    recibir_novedades: boolean;
    estado: string;
    metodo_pago: string;
    codigo_descuento: string;
    monto_pagado: number;
    monto_pago: number;
    created_at: string;
    cursos: { nombre: string; precio: number } | null;
    // Payment proof fields
    comprobante_url?: string;
    motivo_rechazo?: string;
}

const estadoColors: Record<string, string> = {
    contacto: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
    pago_pendiente: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
    pago_a_verificar: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    verificado: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    rechazado: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    primer_contacto: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    segundo_contacto: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
};

const estadoLabels: Record<string, string> = {
    contacto: 'Interesado (Paso 1)',
    pago_pendiente: 'Pago pendiente',
    pago_a_verificar: 'Pago a verificar',
    verificado: 'Verificado',
    rechazado: 'Rechazado',
    cancelado: 'Cancelado',
    primer_contacto: 'Primer contacto',
    segundo_contacto: 'Segundo contacto',
};

export default function AdminInscriptosPage() {
    const [inscriptos, setInscriptos] = useState<Inscripto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [reviewInscripto, setReviewInscripto] = useState<Inscripto | null>(null);

    const fetchInscriptos = useCallback(async () => {
        setLoading(true);
        try {
            let url = '/api/admin/inscriptos';
            if (estadoFilter) {
                url += `?estado=${estadoFilter}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setInscriptos((data as Inscripto[]) || []);
            } else {
                console.error('Error fetching inscriptos');
            }
        } catch (error) {
            console.error('Error fetching inscriptos:', error);
        }
        setLoading(false);
    }, [estadoFilter]);

    useEffect(() => {
        fetchInscriptos();
    }, [fetchInscriptos]);

    const updateStatus = async (id: number, newStatus: string) => {
        setUpdatingId(id);

        try {
            await fetch(`/api/admin/inscriptos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estado: newStatus,
                    updated_at: new Date().toISOString()
                }),
            });
            await fetchInscriptos();
        } catch (error) {
            console.error('Error updating status:', error);
        }
        setUpdatingId(null);
    };

    const exportToExcel = () => {
        const headers = ['Nombre', 'Email', 'Teléfono', 'Cédula', 'Edad', 'Departamento', 'Dirección', 'Cómo se enteró', 'Recibe novedades', 'Curso', 'Estado', 'Método Pago', 'Monto', 'Fecha'];
        const rows = filteredInscriptos.map(i => [
            i.nombre,
            i.email,
            i.telefono,
            i.cedula || '',
            i.edad?.toString() || '',
            i.departamento || '',
            i.direccion || '',
            i.como_se_entero || '',
            i.recibir_novedades ? 'Sí' : 'No',
            i.cursos?.nombre || '',
            i.estado,
            i.metodo_pago || '',
            i.monto_pagado?.toString() || '',
            new Date(i.created_at).toLocaleDateString('es-UY'),
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inscriptos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filteredInscriptos = inscriptos.filter(i =>
        i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.telefono.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-foreground">Gestión de Inscriptos</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchInscriptos}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </Button>
                    <Button variant="outline" onClick={exportToExcel}>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Buscar por nombre, email o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <select
                        value={estadoFilter}
                        onChange={(e) => setEstadoFilter(e.target.value)}
                        className="px-3 py-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    >
                        <option value="">Todos los estados</option>
                        <option value="contacto">Interesado (Paso 1)</option>
                        <option value="pago_pendiente">Pago pendiente</option>
                        <option value="pago_a_verificar">Pago a verificar</option>
                        <option value="verificado">Verificado</option>
                        <option value="rechazado">Rechazado</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="primer_contacto">Primer contacto</option>
                        <option value="segundo_contacto">Segundo contacto</option>
                    </select>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {['contacto', 'pago_pendiente', 'pago_a_verificar', 'verificado', 'rechazado', 'cancelado'].map(estado => (
                    <Card key={estado} className="p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">
                            {inscriptos.filter(i => i.estado === estado).length}
                        </p>
                        <Badge className={(estadoColors[estado] || 'bg-gray-100')}>{estadoLabels[estado] || estado.replace('_', ' ')}</Badge>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1400px]">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Nombre</th>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Contacto</th>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Curso</th>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Edad</th>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Departamento</th>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Dirección</th>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">¿Cómo se enteró?</th>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Novedades</th>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Estado</th>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Pago</th>
                                <th className="text-left py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Fecha</th>
                                <th className="text-right py-3 px-3 text-sm font-medium text-muted-foreground whitespace-nowrap">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={12} className="text-center py-8 text-muted-foreground">
                                        Cargando inscriptos...
                                    </td>
                                </tr>
                            ) : filteredInscriptos.length === 0 ? (
                                <tr>
                                    <td colSpan={12} className="text-center py-8 text-muted-foreground">
                                        No hay inscriptos que coincidan con los filtros.
                                    </td>
                                </tr>
                            ) : (
                                filteredInscriptos.map((inscripto) => (
                                    <tr key={inscripto.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="py-3 px-3">
                                            <p className="font-medium text-foreground">{inscripto.nombre}</p>
                                            {inscripto.cedula && <p className="text-xs text-muted-foreground">CI: {inscripto.cedula}</p>}
                                        </td>
                                        <td className="py-3 px-3">
                                            <p className="text-sm text-foreground/80">{inscripto.email}</p>
                                            <p className="text-xs text-muted-foreground">{inscripto.telefono}</p>
                                        </td>
                                        <td className="py-3 px-3 text-sm text-muted-foreground">
                                            {inscripto.cursos?.nombre || 'N/A'}
                                        </td>
                                        <td className="py-3 px-3 text-sm text-muted-foreground">
                                            {inscripto.edad || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-sm text-muted-foreground">
                                            {inscripto.departamento || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-sm text-muted-foreground max-w-[150px] truncate" title={inscripto.direccion || ''}>
                                            {inscripto.direccion || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-sm text-blue-600 dark:text-blue-400">
                                            {inscripto.como_se_entero || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-sm">
                                            {inscripto.recibir_novedades ? (
                                                <span className="text-green-600">Sí</span>
                                            ) : (
                                                <span className="text-muted-foreground/50">No</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3">
                                            <Badge className={estadoColors[inscripto.estado] || 'bg-muted text-foreground'}>
                                                {inscripto.estado}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-3">
                                            <p className="text-sm text-muted-foreground">{inscripto.metodo_pago || '-'}</p>
                                            {inscripto.monto_pagado && (
                                                <p className="text-xs text-muted-foreground/80">${inscripto.monto_pagado}</p>
                                            )}
                                            {inscripto.codigo_descuento && (
                                                <p className="text-xs text-green-600 dark:text-green-400">Código: {inscripto.codigo_descuento}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-sm text-muted-foreground whitespace-nowrap">
                                            {new Date(inscripto.created_at).toLocaleDateString('es-UY')}
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {inscripto.estado === 'pago_a_verificar' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                                                        onClick={() => setReviewInscripto(inscripto)}
                                                    >
                                                        Revisar Pago
                                                    </Button>
                                                )}

                                                <select
                                                    value={inscripto.estado}
                                                    onChange={(e) => updateStatus(inscripto.id, e.target.value)}
                                                    disabled={updatingId === inscripto.id}
                                                    className="text-sm px-2 py-1 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-[var(--color-green-700)] max-w-[140px]"
                                                >
                                                    <option value="contacto">Interesado (Paso 1)</option>
                                                    <option value="pago_pendiente">Pago pendiente</option>
                                                    <option value="pago_a_verificar">Pago a verificar</option>
                                                    <option value="verificado">Verificado</option>
                                                    <option value="rechazado">Rechazado</option>
                                                    <option value="cancelado">Cancelado</option>
                                                    <option value="primer_contacto">Primer contacto</option>
                                                    <option value="segundo_contacto">Segundo contacto</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ReviewPaymentModal
                inscripto={reviewInscripto}
                isOpen={!!reviewInscripto}
                onClose={() => setReviewInscripto(null)}
                onUpdate={fetchInscriptos}
            />
        </div>
    );
}
