/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, Check, X } from 'lucide-react';

interface Pago {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    estado: string;
    metodo_pago: string;
    monto_pagado: number;
    comprobante_url: string | null;
    notas: string | null;
    created_at: string;
    codigo_descuento: string | null;
    cursos: { nombre: string; precio: number } | null;
}

export default function AdminPagosPage() {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchPagos = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch pagos a verificar
            const response = await fetch('/api/admin/inscriptos?estado=pago_a_verificar');
            if (response.ok) {
                const data = await response.json();
                setPagos((data as Pago[]) || []);
            } else {
                console.error('Error fetching pagos');
            }
        } catch (error) {
            console.error('Error fetching pagos:', error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPagos();
    }, [fetchPagos]);

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
            await fetchPagos();
        } catch (error) {
            console.error('Error updating status:', error);
        }
        setUpdatingId(null);
    };

    const pagosPendientes = pagos.filter(p => p.estado === 'pago_a_verificar');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-foreground">Gestión de Pagos</h1>
                <Button variant="outline" onClick={() => { fetchPagos(); }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4">
                <Card className="p-6 border-l-4 border-l-yellow-500">
                    <p className="text-3xl font-bold text-foreground">{pagosPendientes.length}</p>
                    <p className="text-muted-foreground">Pagos a verificar</p>
                </Card>
            </div>

            {/* Por Verificar */}
            <Card className="p-6">
                <h2 className="text-lg font-medium text-foreground mb-4">
                    Comprobantes a Verificar ({pagosPendientes.length})
                </h2>
                {loading ? (
                    <p className="text-muted-foreground text-center py-4">Cargando...</p>
                ) : pagosPendientes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No hay comprobantes pendientes de verificación.</p>
                ) : (
                    <div className="space-y-4">
                        {pagosPendientes.map((pago) => (
                            <div key={pago.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">{pago.nombre}</p>
                                    <p className="text-sm text-muted-foreground">{pago.email} • {pago.telefono}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Curso: {pago.cursos?.nombre || 'N/A'}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">{pago.metodo_pago}</Badge>
                                        <span className="font-medium text-foreground">
                                            ${pago.monto_pagado || pago.cursos?.precio || 0}
                                        </span>
                                    </div>
                                    {pago.codigo_descuento && (
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                            Descuento aplicado: <span className="font-medium">{pago.codigo_descuento}</span>
                                        </p>
                                    )}
                                </div>

                                {pago.comprobante_url && (
                                    <a
                                        href={pago.comprobante_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-[var(--color-green-700)] hover:underline"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Ver comprobante
                                    </a>
                                )}

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateStatus(pago.id, 'cancelado')}
                                        disabled={updatingId === pago.id}
                                        className="text-destructive hover:bg-destructive/10 border-destructive/50"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Rechazar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => updateStatus(pago.id, 'verificado')}
                                        disabled={updatingId === pago.id}
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Verificar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
