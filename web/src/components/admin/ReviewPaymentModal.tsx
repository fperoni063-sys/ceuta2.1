/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

import { Inscripto } from '@/types/admin';

interface ReviewPaymentModalProps {
    inscripto: Inscripto | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export function ReviewPaymentModal({ inscripto, isOpen, onClose, onUpdate }: ReviewPaymentModalProps) {
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(1);

    if (!inscripto) return null;

    // Prioridad: 
    // 1. monto_pago (Precio congelado al inscribirse)
    // 2. monto_pagado (Si ya fue verificado manualmente antes)
    // 3. cursos.precio (Precio actual del curso - fallback)
    const montoMostrado = inscripto.monto_pago || inscripto.monto_pagado || inscripto.cursos?.precio;

    const handleVerify = async () => {
        if (!confirm('¿Deseas aprobar este pago?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/inscriptos/${inscripto.id}/verificar`, {
                method: 'POST'
            });
            if (res.ok) {
                onUpdate();
                handleClose();
            } else {
                alert('Error al verificar pago');
            }
        } catch (error) {
            console.error(error);
            alert('Error al verificar pago');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Debes ingresar un motivo');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/inscriptos/${inscripto.id}/rechazar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivo: rejectReason })
            });
            if (res.ok) {
                onUpdate();
                handleClose();
            } else {
                alert('Error al rechazar pago');
            }
        } catch (error) {
            console.error(error);
            alert('Error al rechazar pago');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsRejecting(false);
        setRejectReason('');
        setZoom(1);
        onClose();
    };

    const isPdf = inscripto.comprobante_url?.toLowerCase().endsWith('.pdf');

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto flex flex-col">
                <DialogHeader>
                    <DialogTitle>Revisar Comprobante de {inscripto.nombre}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col md:flex-row gap-6 mt-4 min-h-0">
                    {/* Image / Preview Area */}
                    <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden min-h-[300px] border border-slate-200 dark:border-slate-800">
                        {inscripto.comprobante_url ? (
                            isPdf ? (
                                <div className="text-center p-6">
                                    <FileText className="w-16 h-16 mx-auto text-slate-400 mb-2" />
                                    <p className="mb-4 text-sm text-slate-500">Es un archivo PDF</p>
                                    <Button asChild variant="outline">
                                        <a href={inscripto.comprobante_url} target="_blank" rel="noreferrer">
                                            Abrir PDF
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center overflow-auto bg-checkerboard">
                                    <img
                                        src={inscripto.comprobante_url}
                                        alt="Comprobante"
                                        className="transition-transform duration-200 max-w-full max-h-[60vh] object-contain"
                                        style={{ transform: `scale(${zoom})` }}
                                    />
                                    {/* Zoom Controls */}
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <Button size="icon" variant="secondary" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
                                            <ZoomOut className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="secondary" onClick={() => setZoom(1)}>
                                            <span className="text-xs">{Math.round(zoom * 100)}%</span>
                                        </Button>
                                        <Button size="icon" variant="secondary" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
                                            <ZoomIn className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-slate-400">No hay comprobante subido</div>
                        )}
                    </div>

                    {/* Actions Area */}
                    <div className="w-full md:w-80 flex flex-col gap-4 flex-shrink-0">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg space-y-2 text-sm">
                            <p>
                                <strong>Monto esperado:</strong> ${montoMostrado || '-'}
                                {inscripto.monto_pagado ? <span className="text-xs text-green-600 ml-2">(Pagado: ${inscripto.monto_pagado})</span> : null}
                            </p>
                            {inscripto.codigo_descuento && (
                                <p className="text-blue-600 font-medium">
                                    <strong>Descuento:</strong> {inscripto.codigo_descuento}
                                </p>
                            )}
                            <p><strong>Método:</strong> {inscripto.metodo_pago}</p>
                            <p><strong>Curso:</strong> {inscripto.cursos?.nombre}</p>
                            <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                                Precio base curso: ${inscripto.cursos?.precio || '-'}
                            </p>
                        </div>

                        {!isRejecting ? (
                            <div className="flex flex-col gap-3 mt-auto">
                                <Button
                                    onClick={handleVerify}
                                    className="bg-green-600 hover:bg-green-700 text-white w-full h-12 text-lg"
                                    disabled={loading || !inscripto.comprobante_url}
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                                    Aprobar Pago
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsRejecting(true)}
                                    className="w-full"
                                    disabled={loading}
                                >
                                    <XCircle className="mr-2 w-4 h-4" />
                                    Rechazar
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 mt-auto animate-in fade-in slide-in-from-right-5">
                                <label className="text-sm font-medium">Motivo del rechazo:</label>
                                <Textarea
                                    value={rejectReason}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                                    placeholder="Ej: La imagen no es legible, el monto no coincide..."
                                    className="resize-none"
                                    rows={4}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsRejecting(false)}
                                        className="flex-1"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleReject}
                                        className="flex-1"
                                        disabled={loading || !rejectReason.trim()}
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Rechazo'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
