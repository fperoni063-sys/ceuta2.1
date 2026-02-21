'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    RefreshCw,
    Download,
    FileText,
    Image as ImageIcon,
    ChevronDown,
    ExternalLink,
    Eye
} from 'lucide-react';
import { ReviewPaymentModal } from '@/components/admin/ReviewPaymentModal';

interface Comprobante {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    comprobante_url: string;
    comprobante_tipo: string | null;
    estado: string;
    metodo_pago: string;
    monto_pagado: number;
    monto_pago: number | null; // Precio congelado al momento de inscripción
    codigo_descuento: string | null;
    updated_at: string;
    created_at: string;
    cursos: { id: number; nombre: string; precio: number } | null;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

const estadoColors: Record<string, string> = {
    pago_a_verificar: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    verificado: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    rechazado: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

const estadoLabels: Record<string, string> = {
    pago_a_verificar: 'Pendiente',
    verificado: 'Verificado',
    rechazado: 'Rechazado',
};

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-UY');
}

function getThumbnailUrl(url: string): string {
    // For Cloudinary images, add transformation for thumbnail
    if (url.includes('cloudinary.com') && !url.toLowerCase().endsWith('.pdf')) {
        // Insert transformation before the file name
        return url.replace('/upload/', '/upload/w_150,h_150,c_thumb,q_auto/');
    }
    return url;
}

function isPdfFile(url: string): boolean {
    return url.toLowerCase().endsWith('.pdf');
}

export default function AdminComprobantesPage() {
    const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [estadoFilter, setEstadoFilter] = useState('');
    const [reviewItem, setReviewItem] = useState<Comprobante | null>(null);

    const fetchComprobantes = useCallback(async (page: number = 1, append: boolean = false) => {
        if (page === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            let url = `/api/admin/comprobantes?page=${page}&limit=10`;
            if (estadoFilter) {
                url += `&estado=${estadoFilter}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                if (append) {
                    setComprobantes(prev => [...prev, ...result.data]);
                } else {
                    setComprobantes(result.data);
                }
                setPagination(result.pagination);
            } else {
                console.error('Error fetching comprobantes');
            }
        } catch (error) {
            console.error('Error fetching comprobantes:', error);
        }

        setLoading(false);
        setLoadingMore(false);
    }, [estadoFilter]);

    useEffect(() => {
        fetchComprobantes(1, false);
    }, [fetchComprobantes]);

    const handleLoadMore = () => {
        if (pagination?.hasMore) {
            fetchComprobantes(pagination.page + 1, true);
        }
    };

    const handleDownload = async (url: string, nombre: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;

            // Extract extension from URL
            const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
            link.download = `comprobante_${nombre.replace(/\s+/g, '_')}.${extension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
            // Fallback: open in new tab
            window.open(url, '_blank');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-foreground">
                        Galería de Comprobantes
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {pagination?.total || 0} comprobantes en total
                    </p>
                </div>
                <Button variant="outline" onClick={() => fetchComprobantes(1, false)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground">Filtrar por estado:</span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={estadoFilter === '' ? 'default' : 'outline'}
                            onClick={() => setEstadoFilter('')}
                        >
                            Todos
                        </Button>
                        <Button
                            size="sm"
                            variant={estadoFilter === 'pago_a_verificar' ? 'default' : 'outline'}
                            onClick={() => setEstadoFilter('pago_a_verificar')}
                            className={estadoFilter === 'pago_a_verificar' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                        >
                            Pendientes
                        </Button>
                        <Button
                            size="sm"
                            variant={estadoFilter === 'verificado' ? 'default' : 'outline'}
                            onClick={() => setEstadoFilter('verificado')}
                            className={estadoFilter === 'verificado' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            Verificados
                        </Button>
                        <Button
                            size="sm"
                            variant={estadoFilter === 'rechazado' ? 'default' : 'outline'}
                            onClick={() => setEstadoFilter('rechazado')}
                            className={estadoFilter === 'rechazado' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            Rechazados
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Grid of Comprobantes */}
            {loading ? (
                <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Cargando comprobantes...</p>
                </div>
            ) : comprobantes.length === 0 ? (
                <Card className="p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No hay comprobantes para mostrar</p>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {comprobantes.map((item) => (
                            <Card
                                key={item.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow group"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                    {isPdfFile(item.comprobante_url) ? (
                                        <div className="text-center p-4">
                                            <FileText className="w-16 h-16 mx-auto text-slate-400" />
                                            <p className="text-xs text-muted-foreground mt-2">PDF</p>
                                        </div>
                                    ) : (
                                        <img
                                            src={getThumbnailUrl(item.comprobante_url)}
                                            alt={`Comprobante de ${item.nombre}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    )}

                                    {/* Overlay with actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => setReviewItem(item)}
                                            title="Ver completo"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={() => handleDownload(item.comprobante_url, item.nombre)}
                                            title="Descargar"
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            asChild
                                            title="Abrir en nueva pestaña"
                                        >
                                            <a href={item.comprobante_url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-3 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium text-sm text-foreground truncate" title={item.nombre}>
                                            {item.nombre}
                                        </p>
                                        <Badge className={`${estadoColors[item.estado] || 'bg-gray-100'} text-xs shrink-0`}>
                                            {estadoLabels[item.estado] || item.estado}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate" title={item.cursos?.nombre}>
                                        {item.cursos?.nombre || 'Sin curso'}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex flex-col">
                                            {item.monto_pagado > 0 ? (
                                                <span className="text-green-600 font-medium">${item.monto_pagado}</span>
                                            ) : (
                                                <span className="text-orange-600 font-medium">
                                                    Esperado: ${item.monto_pago || item.cursos?.precio || 0}
                                                </span>
                                            )}
                                            {item.codigo_descuento && (
                                                <span className="text-[10px] text-blue-500 font-bold" title="Código aplicado">
                                                    🎟️ {item.codigo_descuento}
                                                </span>
                                            )}
                                        </div>
                                        <span>{formatTimeAgo(item.updated_at)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Load More */}
                    {pagination?.hasMore && (
                        <div className="text-center pt-4">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="min-w-[200px]"
                            >
                                {loadingMore ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Cargando...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4 mr-2" />
                                        Cargar más ({pagination.total - comprobantes.length} restantes)
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Review Modal */}
            <ReviewPaymentModal
                inscripto={reviewItem}
                isOpen={!!reviewItem}
                onClose={() => setReviewItem(null)}
                onUpdate={() => fetchComprobantes(1, false)}
            />
        </div>
    );
}
