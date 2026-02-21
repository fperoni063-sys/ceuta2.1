'use client';

import { useEffect, useState, useCallback } from 'react';
import { saveInscripcionCookie, useInscripciones } from '@/lib/hooks/useInscripcionCookie';
import { UploadComprobante } from '@/components/payment/UploadComprobante';
import { calculateFrozenPrice } from '@/lib/utils/priceLogic';
import { CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

interface InscripcionData {
    id: number;
    nombre: string;
    email: string;
    estado: 'contacto' | 'pago_pendiente' | 'pago_a_verificar' | 'verificado' | 'rechazado' | 'cancelado' | 'primer_contacto' | 'segundo_contacto';
    motivo_rechazo?: string | null;
    metodo_pago: string;
    fecha_inscripcion: string;
    precio_pagado?: number | null;
    descuento_aplicado?: number | null;
    curso: {
        id: number;
        nombre: string;
        slug?: string;
        precio: number;
        descripcion?: string | null;
        imagen_portada?: string | null;
        link_mercado_pago?: string;
        fecha_inicio?: string;
        modalidad?: string;
        lugar?: string;
        duracion?: string;
        cantidad_cuotas?: number;
        categoria?: string | null;
        nivel?: string | null;
        transformacion_hook?: string | null;
        fecha_a_confirmar?: boolean;
        lugar_a_confirmar?: boolean;
        es_inscripcion_anticipada?: boolean;
        // Discount fields
        descuento_porcentaje?: number | null;
        descuento_cupos_totales?: number | null;
        descuento_cupos_usados?: number;
        descuento_etiqueta?: string | null;
        descuento_fecha_fin?: string | null;
        descuento_online_porcentaje?: number | null;
        descuento_online_etiqueta?: string | null;
        precio_online?: number | null;
    };
}

interface PaymentConfig {
    banco: {
        nombre: string;
        cuenta: string;
        titular: string;
        tipo: string;
        moneda: string;
    };
    efectivo: {
        habilitado: boolean;
        // Cuenta específica para Abitab/Red Pagos (puede ser diferente a la de transferencia)
        banco: {
            nombre: string;
            cuenta: string;
            titular: string;
        };
        instrucciones: string;
        codigo: string | null;
    };
    whatsapp: string;
}

interface Props {
    data: InscripcionData;
    token: string;
}

type MetodoPago = 'transferencia' | 'mercadopago' | 'efectivo' | '';
type PaymentStep = 'select' | 'show-details' | 'upload' | 'success';

export function MiInscripcionClient({ data, token }: Props) {
    const { removeInscripcion, updateEstadoInscripcion } = useInscripciones();
    const { track } = useAnalytics();
    const [selectedMethod, setSelectedMethod] = useState<MetodoPago>('');
    const [paymentStep, setPaymentStep] = useState<PaymentStep>('select');
    const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);

    // Sincronizar estado de la cookie con el estado real de la inscripción

    useEffect(() => {
        // Si está cancelado, eliminar de la cookie inmediatamente
        if (data.estado === 'cancelado') {
            removeInscripcion(data.curso.id);
            return;
        }

        // Si está verificado, marcar como aceptado en cookie
        if (data.estado === 'verificado') {
            updateEstadoInscripcion(data.curso.id, 'aceptado');
            return;
        }

        // Si está en proceso de revisión (pago_a_verificar)
        if (data.estado === 'pago_a_verificar') {
            updateEstadoInscripcion(data.curso.id, 'revisando');
            // Asegurarse que exista en cookie si no estaba
            saveInscripcionCookie(
                token,
                data.nombre.split(' ')[0],
                data.curso.id,
                data.curso.nombre
            );
            return;
        }

        // Si está pendiente (o cualquier otro estado activo no final), asegurar que esté guardado
        saveInscripcionCookie(
            token,
            data.nombre.split(' ')[0],
            data.curso.id,
            data.curso.nombre
        );
        // Y asegurarnos que el estado sea coherente (pendiente) si no es ninguno de los anteriores
        if (data.estado === 'pago_pendiente' || data.estado === 'contacto' || data.estado === 'primer_contacto') {
            updateEstadoInscripcion(data.curso.id, 'pendiente');
        } else if (data.estado === 'rechazado') {
            updateEstadoInscripcion(data.curso.id, 'rechazado');
        }

    }, [token, data.nombre, data.curso.id, data.curso.nombre, data.estado]);

    // Fetch payment configuration
    useEffect(() => {
        fetch('/api/configuracion/pagos')
            .then(res => res.json())
            .then(data => setPaymentConfig(data))
            .catch(err => console.error('Error loading payment config:', err))
            .finally(() => setLoadingConfig(false));
    }, []);

    const isPagado = data.estado === 'verificado';
    const isAVerificar = data.estado === 'pago_a_verificar';
    const isCancelado = data.estado === 'cancelado';
    const primerNombre = data.nombre.split(' ')[0];

    // Calculate Price using Frozen Logic
    const priceInfo = calculateFrozenPrice(data.curso, {
        fecha_inscripcion: data.fecha_inscripcion,
        precio_pagado: data.precio_pagado
    });

    const cantidadCuotas = data.curso.cantidad_cuotas || 1;
    const valorCuota = Math.round(priceInfo.finalPrice / cantidadCuotas);
    const whatsappLink = `https://wa.me/59898910715`; // Default fallback

    // Seña payment option
    const SENA_AMOUNT = 500;
    const [tipoPago, setTipoPago] = useState<'total' | 'seña'>('total');

    // Helper para calcular qué mostrar según el tipo de pago
    const getDisplayInfo = () => {
        if (tipoPago === 'seña') {
            return {
                amount: SENA_AMOUNT,
                label: 'Seña para reservar',
                subtitle: 'El resto lo abonás al comenzar el curso'
            };
        }

        if (cantidadCuotas > 1) {
            return {
                amount: valorCuota,
                label: `Primera cuota (1 de ${cantidadCuotas})`,
                subtitle: `Total del curso: $${priceInfo.finalPrice.toLocaleString('es-UY')}`
            };
        }

        return {
            amount: priceInfo.finalPrice,
            label: 'Total a pagar',
            subtitle: null
        };
    };

    const handleMethodSelect = (method: MetodoPago) => {
        setSelectedMethod(method);
        if (method === 'mercadopago') {
            // No auto-open, user clicks button
        }
        // Para todos los métodos mostramos detalles/opciones (incluso MP para dar feedback visual)
        setPaymentStep('show-details');
    };

    const handleUploadSuccess = useCallback(() => {
        setPaymentStep('success');
        // Sincronizar cookie para que el banner muestre "revisando" en lugar de "pendiente"
        updateEstadoInscripcion(data.curso.id, 'revisando');
        // Track analytics event for funnel statistics
        track('enrollment_comprobante_upload', { courseId: data.curso.id });
    }, [data.curso.id, updateEstadoInscripcion, track]);

    // ----------------------------------------------------------------------
    // View: Cancelado
    // ----------------------------------------------------------------------
    if (isCancelado) {
        return (
            <main className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
                <div className="max-w-lg w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto text-4xl">
                        ❌
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif text-earth-900 dark:text-white mb-2">
                            Inscripción Cancelada
                        </h1>
                        <p className="text-walnut-600 dark:text-gray-300">
                            Esta preinscripción fue cancelada.
                        </p>
                    </div>
                    <a
                        href={`/cursos/${data.curso.slug || ''}`}
                        className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
                    >
                        Volver a inscribirme
                    </a>
                </div>
            </main>
        );
    }

    // ----------------------------------------------------------------------
    // View: Success (Pagado)
    // ----------------------------------------------------------------------
    if (isPagado) {
        return (
            <main className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
                <div className="max-w-lg w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-4xl animate-in zoom-in">
                        🎉
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif text-walnut-800 dark:text-white mb-2">
                            ¡Inscripción Completada!
                        </h1>
                        <p className="text-xl text-walnut-600 dark:text-gray-300">
                            {primerNombre}, ya sos parte de <strong>{data.curso.nombre}</strong>.
                        </p>
                    </div>
                    <div className="bg-cream-50 dark:bg-card/50 p-6 rounded-2xl border border-cream-100 dark:border-white/5">
                        <p className="text-walnut-500 dark:text-gray-400 mb-2">Nos vemos pronto.</p>
                        <p className="text-sm text-walnut-400 dark:text-gray-500">Te enviamos los detalles a tu email.</p>
                    </div>
                </div>
            </main>
        );
    }

    // ----------------------------------------------------------------------
    // View: A Verificar (Esperando confirmación)
    // ----------------------------------------------------------------------
    if (isAVerificar || paymentStep === 'success') {
        return (
            <main className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
                <div className="max-w-lg w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">
                        ⏳
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif text-earth-900 dark:text-white mb-2">
                            Comprobante Recibido
                        </h1>
                        <p className="text-walnut-600 dark:text-gray-300">
                            Gracias {primerNombre}. Estamos verificando tu pago.
                        </p>
                    </div>
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl text-amber-800 dark:text-amber-200 text-sm border border-amber-100 dark:border-amber-900/30">
                        Te avisaremos en breve cuando tu cupo esté 100% confirmado.
                    </div>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-green-600 hover:text-green-700 font-medium hover:underline"
                    >
                        ¿Tenés dudas? Escribinos
                    </a>
                </div>
            </main>
        );
    }

    // ----------------------------------------------------------------------
    // View: Rechazado (Allows re-upload)
    // ----------------------------------------------------------------------
    if (data.estado === 'rechazado') {
        return (
            <main className="min-h-screen bg-background py-8 px-4 sm:px-6">
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-3xl">
                            ⚠️
                        </div>
                        <h1 className="text-2xl md:text-3xl font-serif text-earth-900 dark:text-white">
                            Tu pago no pudo ser verificado
                        </h1>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/30 space-y-3">
                        <h3 className="font-semibold text-red-800 dark:text-red-200">Motivo del rechazo:</h3>
                        <p className="text-red-700 dark:text-red-300/90 text-sm leading-relaxed">
                            {data.motivo_rechazo || 'El comprobante no es legible o no coincide con el monto esperado.'}
                        </p>
                    </div>

                    <div className="bg-background rounded-2xl shadow-sm border border-earth-900/10 dark:border-white/10 p-6 md:p-8">
                        <h2 className="font-serif text-xl text-earth-900 dark:text-white mb-6 text-center">
                            Subir un nuevo comprobante
                        </h2>

                        <UploadComprobante
                            token={token}
                            onSuccess={handleUploadSuccess}
                            onError={(msg) => console.error(msg)}
                        />

                        <div className="mt-6 text-center">
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-walnut-500 hover:text-green-600 underline"
                            >
                                Contactar soporte si el problema persiste
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // ----------------------------------------------------------------------
    // View: Main Selection / Payment
    // ----------------------------------------------------------------------
    return (
        <main className="min-h-screen bg-background py-8 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-serif text-earth-900 dark:text-white">
                        Hola {primerNombre}, completá tu inscripción
                    </h1>
                    <p className="text-walnut-600 dark:text-gray-300 max-w-md mx-auto">
                        Estás a un paso de reservar tu lugar en <br />
                        <span className="font-semibold text-earth-900 text-lg">{data.curso.nombre}</span>
                    </p>
                </div>

                {/* Price & Summary Card */}
                <div className="bg-background rounded-2xl shadow-sm border border-earth-900/10 dark:border-white/10 overflow-hidden">

                    {/* Selector Seña vs Total */}
                    <div className="p-4 border-b border-earth-900/5 dark:border-white/5">
                        <p className="text-sm font-medium text-center mb-3 text-earth-900 dark:text-gray-100">
                            ¿Qué deseas abonar hoy?
                        </p>
                        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                            <button
                                type="button"
                                onClick={() => setTipoPago('total')}
                                className={cn(
                                    "py-2 px-3 rounded-md text-sm font-medium transition-all border-2",
                                    tipoPago === 'total'
                                        ? "border-green-600 bg-background dark:bg-card text-green-700 dark:text-green-400 shadow-sm"
                                        : "border-transparent bg-gray-100 dark:bg-muted text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-muted/80"
                                )}
                            >
                                Total / Cuota
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipoPago('seña')}
                                className={cn(
                                    "py-2 px-3 rounded-md text-sm font-medium transition-all border-2",
                                    tipoPago === 'seña'
                                        ? "border-green-600 bg-background dark:bg-card text-green-700 dark:text-green-400 shadow-sm"
                                        : "border-transparent bg-gray-100 dark:bg-muted text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-muted/80"
                                )}
                            >
                                Seña ($500)
                            </button>
                        </div>
                    </div>

                    {/* Precio dinámico usando getDisplayInfo() */}
                    <div className="bg-green-950/10 dark:bg-green-900/20 border-b border-green-900/10 dark:border-white/5 p-4 sm:p-5 text-center">
                        {/* Label dinámico */}
                        <p className="text-xs sm:text-sm text-foreground/50 uppercase tracking-wide font-medium">
                            {getDisplayInfo().label}
                        </p>
                        <div className="flex items-baseline justify-center gap-2 mt-1">
                            {/* Precio original tachado (solo si no es seña y hay descuento) */}
                            {tipoPago !== 'seña' && priceInfo.hasDiscount && (
                                <span className="text-base sm:text-lg text-gray-400 line-through decoration-gray-400/50">
                                    ${(cantidadCuotas > 1
                                        ? Math.round(priceInfo.originalPrice / cantidadCuotas)
                                        : priceInfo.originalPrice
                                    ).toLocaleString('es-UY')}
                                </span>
                            )}
                            {/* Precio Principal */}
                            <span className="text-3xl sm:text-4xl font-bold text-earth-900 dark:text-white">
                                ${getDisplayInfo().amount.toLocaleString('es-UY')}
                            </span>
                        </div>
                        {/* Subtítulo */}
                        {getDisplayInfo().subtitle && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                                {getDisplayInfo().subtitle}
                            </p>
                        )}
                        {/* Badges */}
                        {tipoPago !== 'seña' && priceInfo.hasDiscount && (
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                                🎟️ Precio congelado con descuento
                            </div>
                        )}
                        {priceInfo.isOnline && (
                            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Modalidad Online
                            </div>
                        )}
                    </div>

                    {/* Payment Selector */}
                    {paymentStep === 'select' && (
                        <div className="p-6 md:p-8 space-y-6">
                            <p className="text-center text-walnut-600 dark:text-gray-300 font-medium">
                                Elegí cómo preferís pagar:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Option 1: Transferencia */}
                                <button
                                    onClick={() => handleMethodSelect('transferencia')}
                                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-muted/30 hover:bg-white dark:hover:bg-muted/50 hover:border-green-200 dark:hover:border-green-800 hover:shadow-md transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                                        🏦
                                    </div>
                                    <span className="font-semibold text-earth-900 dark:text-white">Transferencia</span>
                                    <span className="text-xs text-walnut-500 dark:text-gray-400 mt-1">BROU / Santander</span>
                                </button>

                                {/* Option 2: Mercado Pago */}
                                <button
                                    onClick={() => handleMethodSelect('mercadopago')}
                                    disabled={!data.curso.link_mercado_pago}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-muted/30 hover:bg-white dark:hover:bg-muted/50 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all group",
                                        !data.curso.link_mercado_pago && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                                        💳
                                    </div>
                                    <span className="font-semibold text-earth-900 dark:text-white">Mercado Pago</span>
                                    <span className="text-xs text-walnut-500 dark:text-gray-400 mt-1">Hasta 12 cuotas</span>
                                </button>

                                {/* Option 3: Efectivo */}
                                <button
                                    onClick={() => handleMethodSelect('efectivo')}
                                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-muted/30 hover:bg-white dark:hover:bg-muted/50 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                                        💵
                                    </div>
                                    <span className="font-semibold text-earth-900 dark:text-white">Efectivo</span>
                                    <span className="text-xs text-walnut-500 dark:text-gray-400 mt-1">Abitab / RedPagos</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Payment Details View */}
                    {(paymentStep === 'show-details' || paymentStep === 'upload') && (
                        <div className="p-6 md:p-8">
                            <button
                                onClick={() => setPaymentStep('select')}
                                className="mb-6 text-sm text-walnut-500 dark:text-gray-400 hover:text-walnut-800 dark:hover:text-white flex items-center gap-1"
                            >
                                ← Cambiar método de pago
                            </button>

                            {selectedMethod === 'transferencia' && paymentConfig && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="bg-slate-50 dark:bg-card p-6 rounded-xl border border-slate-200 dark:border-white/10">
                                        <h3 className="font-semibold text-earth-900 dark:text-white mb-4 flex items-center gap-2">
                                            <span>🏦</span> Datos Bancarios
                                        </h3>
                                        <div className="grid gap-3 text-sm text-walnut-700">
                                            <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                                                <span>Banco:</span>
                                                <span className="font-medium">{paymentConfig.banco.nombre}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                                                <span>Titular:</span>
                                                <span className="font-medium">{paymentConfig.banco.titular}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                                                <span>Tipo:</span>
                                                <span className="font-medium">{paymentConfig.banco.tipo}</span>
                                            </div>
                                            <div className="flex justify-between items-center sm:items-start flex-col sm:flex-row gap-1">
                                                <span>Cuenta:</span>
                                                <span className="font-mono bg-white dark:bg-black/20 px-2 py-1 rounded border border-slate-200 dark:border-white/10 select-all">
                                                    {paymentConfig.banco.cuenta}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {paymentStep !== 'upload' && (
                                        <button
                                            onClick={() => setPaymentStep('upload')}
                                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-600/20"
                                        >
                                            ✅ Ya hice la transferencia (Subir Comprobante)
                                        </button>
                                    )}
                                </div>
                            )}

                            {selectedMethod === 'efectivo' && paymentConfig && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="bg-orange-50/50 dark:bg-orange-950/20 p-6 rounded-xl border border-orange-100 dark:border-orange-500/20">
                                        <h3 className="font-semibold text-earth-900 dark:text-orange-50 mb-4 flex items-center gap-2">
                                            <span>💵</span> Pago en Abitab / Red Pagos
                                        </h3>
                                        <p className="text-sm text-walnut-700 dark:text-orange-100/70 mb-4">{paymentConfig.efectivo.instrucciones}</p>

                                        <div className="grid gap-3 text-sm text-walnut-700 dark:text-orange-100/80">
                                            <div className="flex justify-between border-b border-orange-100 dark:border-orange-500/10 pb-2">
                                                <span>Banco:</span>
                                                <span className="font-medium">{paymentConfig.efectivo.banco.nombre}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-orange-100 dark:border-orange-500/10 pb-2">
                                                <span>Titular:</span>
                                                <span className="font-medium">{paymentConfig.efectivo.banco.titular}</span>
                                            </div>
                                            {paymentConfig.efectivo.banco.cuenta && (
                                                <div className="flex justify-between items-center sm:items-start flex-col sm:flex-row gap-1">
                                                    <span>Cuenta:</span>
                                                    <span className="font-mono bg-white dark:bg-black/20 px-2 py-1 rounded border border-orange-200 dark:border-white/10 select-all">
                                                        {paymentConfig.efectivo.banco.cuenta}
                                                    </span>
                                                </div>
                                            )}
                                            {paymentConfig.efectivo.codigo && (
                                                <div className="flex justify-between border-b border-orange-100 dark:border-orange-500/10 pb-2">
                                                    <span>Cédula/Código:</span>
                                                    <span className="font-mono font-medium">{paymentConfig.efectivo.codigo}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {paymentStep !== 'upload' && (
                                        <button
                                            onClick={() => setPaymentStep('upload')}
                                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-600/20"
                                        >
                                            ✅ Ya realicé el pago (Subir Comprobante)
                                        </button>
                                    )}
                                </div>
                            )}

                            {selectedMethod === 'mercadopago' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="bg-cyan-50 dark:bg-cyan-950/20 p-6 rounded-xl border border-cyan-100 dark:border-cyan-500/20">
                                        <h3 className="font-semibold text-earth-900 dark:text-cyan-50 mb-6 flex items-center gap-2">
                                            <span>💳</span> Pago con Mercado Pago
                                        </h3>

                                        {/* Smart Bridge UI */}
                                        <div className="space-y-6">

                                            {/* 1. Value Display & Copy - Dynamic label like other methods */}
                                            <div className="bg-white dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-700/50 rounded-xl p-4 sm:p-5 text-center shadow-sm">
                                                <p className="text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold mb-2">
                                                    {getDisplayInfo().label}
                                                </p>
                                                <div className="flex items-center justify-center gap-2 sm:gap-3">
                                                    <span className="text-2xl sm:text-4xl font-bold text-earth-900 dark:text-white">
                                                        ${getDisplayInfo().amount.toLocaleString('es-UY')}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(getDisplayInfo().amount.toString());
                                                            const btn = document.getElementById('copy-price-btn');
                                                            if (btn) {
                                                                btn.innerHTML = '✅';
                                                                setTimeout(() => { if (btn) btn.innerHTML = '📋'; }, 2000);
                                                            }
                                                        }}
                                                        id="copy-price-btn"
                                                        className="p-2 bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-800 dark:hover:bg-cyan-700 text-cyan-700 dark:text-cyan-200 rounded-lg transition-colors"
                                                        title="Copiar monto"
                                                    >
                                                        📋
                                                    </button>
                                                </div>
                                                {getDisplayInfo().subtitle && (
                                                    <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70 mt-1.5">
                                                        {getDisplayInfo().subtitle}
                                                    </p>
                                                )}
                                            </div>

                                            {/* 2. Instructions */}
                                            <div className="space-y-3">
                                                <div className="flex gap-3 items-start">
                                                    <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                                                    <p className="text-sm text-walnut-700 dark:text-cyan-100/80">
                                                        Copiá el monto exacto de arriba.
                                                    </p>
                                                </div>
                                                <div className="flex gap-3 items-start">
                                                    <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                                                    <p className="text-sm text-walnut-700 dark:text-cyan-100/80">
                                                        Ingresá al link de pago y escribí ese monto manualmente.
                                                    </p>
                                                </div>
                                                <div className="flex gap-3 items-start">
                                                    <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                                                    <p className="text-sm text-walnut-700 dark:text-cyan-100/80">
                                                        Al finalizar, sacá una captura de pantalla del comprobante.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* 3. Action Button */}
                                            <a
                                                href={data.curso.link_mercado_pago || "https://link.mercadopago.com.uy/ceutacapacitaciones"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => {
                                                    // Auto-show upload step logic
                                                    // We won't change step immediately to prevent UI weirdness, 
                                                    // but we'll enable the 'Ya pagué' button distinctively
                                                }}
                                                className="block w-full text-center py-4 bg-[#009ee3] hover:bg-[#0082c3] text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-[0.98] group"
                                            >
                                                <span className="flex items-center justify-center gap-2">
                                                    Ir a Pagar en Mercado Pago
                                                    <span className="group-hover:translate-x-1 transition-transform">↗</span>
                                                </span>
                                            </a>

                                            <p className="text-xs text-center text-cyan-600/60 dark:text-cyan-400/50">
                                                Se abrirá en una nueva pestaña
                                            </p>
                                        </div>
                                    </div>

                                    {/* 4. Upload Trigger (Always visible for MP flow to avoid blocking) */}
                                    <div className="pt-2 animate-in fade-in delay-300">
                                        <button
                                            onClick={() => setPaymentStep('upload')}
                                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-600/20 flex flex-col items-center justify-center gap-1"
                                        >
                                            <span>✅ Ya realicé el pago</span>
                                            <span className="text-xs opacity-90 font-normal">Subir comprobante ahora</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload Component */}
                            {paymentStep === 'upload' && (
                                <div className="mt-6 animate-in fade-in zoom-in-95">
                                    <UploadComprobante
                                        token={token}
                                        onSuccess={handleUploadSuccess}
                                        onError={(msg) => console.error(msg)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Important Info Footer */}
                <div className="text-center text-sm text-muted-foreground space-y-4 max-w-lg mx-auto">
                    <div className="bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-lg p-3 text-left">
                        <div className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ</span>
                            <div>
                                <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">Información Importante de Pago</p>
                                <ul className="text-xs text-blue-800 dark:text-blue-200/80 space-y-1 mt-1 list-disc pl-4">
                                    <li><strong>Pago mes a mes:</strong> Esta no es una suscripción automática. Tú realizas el pago de la cuota cada mes manualmente (en caso de ser más de una cuota).</li>
                                    <li><strong>Política de Reembolso:</strong> Si por alguna razón no puedes continuar, cuentas con nuestra garantía de cancelación y, si no ha empezado el curso, de reembolso/devolución.</li>

                                </ul>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            if (confirm('¿Estás seguro de que deseas cancelar tu preinscripción? Esto liberará tu cupo.')) {
                                try {
                                    await fetch('/api/inscripcion/cancelar', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ token }),
                                    });
                                } catch (error) {
                                    console.error('Error:', error);
                                }
                                removeInscripcion(data.curso.id);
                                window.location.href = '/cursos';
                            }
                        }}
                        className="text-red-400 hover:text-red-500 text-xs hover:underline transition-colors"
                    >
                        Cancelar preinscripción y liberar cupo
                    </button>
                </div>

            </div >
        </main >
    );
}
