'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useInscripciones, type InscripcionPendiente } from '@/lib/hooks/useInscripcionCookie';

// Configuración visual por estado
const getEstadoConfig = (estado: InscripcionPendiente['estado']) => {
    switch (estado) {
        case 'aceptado':
            return {
                badge: 'Inscripción Confirmada',
                badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
                icon: '✅',
                buttonText: 'Ver detalles',
                buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
                priority: 4, // Menor urgencia
            };
        case 'revisando':
            return {
                badge: 'Pago en Revisión',
                badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
                icon: '👁️',
                buttonText: 'Ver estado',
                buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
                priority: 3,
            };
        case 'rechazado':
            return {
                badge: 'Pago Rechazado',
                badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
                icon: '⚠️',
                buttonText: 'Subir nuevo comprobante',
                buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
                priority: 1, // Mayor urgencia
            };
        case 'cancelado':
            return {
                badge: 'Cancelado',
                badgeClass: 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400',
                icon: '❌',
                buttonText: 'Ver',
                buttonClass: 'bg-gray-500 hover:bg-gray-600 text-white',
                priority: 5, // No mostrar
            };
        default: // 'pendiente'
            return {
                badge: 'Pendiente de Pago',
                badgeClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
                icon: '⏳',
                buttonText: 'Completar Inscripción',
                buttonClass: 'bg-green-600 hover:bg-green-700 dark:bg-primary dark:text-earth-900',
                priority: 2,
            };
    }
};

export default function MisInscripcionesPage() {
    const { inscripciones, removeInscripcion, hasInscripcionesPendientes } = useInscripciones();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Cargando tus inscripciones...</div>
            </div>
        );
    }

    // Filtrar cancelados y ordenar por prioridad (urgencia)
    const inscripcionesActivas = inscripciones
        .filter(i => i.estado !== 'cancelado')
        .sort((a, b) => getEstadoConfig(a.estado).priority - getEstadoConfig(b.estado).priority);

    const tieneActivas = inscripcionesActivas.length > 0;

    return (
        <main className="min-h-screen bg-background py-8 md:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center sm:text-left">
                    <Link href="/" className="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-sm font-medium mb-4 inline-flex items-center gap-1 transition-colors">
                        <span>←</span> Volver al inicio
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-serif text-earth-900 dark:text-white">
                        Tus Inscripciones
                    </h1>
                    <p className="mt-2 text-walnut-600 dark:text-gray-400 text-sm md:text-base">
                        Gestioná tus preinscripciones aquí.
                    </p>
                </div>

                {!tieneActivas ? (
                    <div className="bg-card rounded-2xl p-8 md:p-12 text-center border-2 border-dashed border-muted/50 dark:border-white/10">
                        <span className="text-4xl block mb-4">📭</span>
                        <h3 className="text-xl font-medium text-earth-900 dark:text-white mb-2">
                            No tienes inscripciones activas
                        </h3>
                        <p className="text-walnut-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            Explora nuestros cursos y comienza tu camino en la agroecología.
                        </p>
                        <Link
                            href="/cursos"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-sage-600 hover:bg-sage-700 dark:bg-primary dark:text-earth-900 transition-colors shadow-sm"
                        >
                            Ver Cursos Disponibles
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 md:gap-6">
                        {inscripcionesActivas.map((inscripcion) => {
                            const config = getEstadoConfig(inscripcion.estado);
                            const showDescartar = inscripcion.estado === 'pendiente';

                            return (
                                <div
                                    key={inscripcion.cursoId}
                                    className="bg-card rounded-2xl shadow-sm border border-earth-900/10 dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-300"
                                >
                                    <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:gap-6">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-base">{config.icon}</span>
                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.badgeClass}`}>
                                                    {config.badge}
                                                </span>
                                                <span className="text-[10px] md:text-xs text-muted-foreground">
                                                    Iniciado el {new Date(inscripcion.fechaCreacion).toLocaleDateString('es-UY')}
                                                </span>
                                            </div>
                                            <h3 className="text-lg md:text-xl font-semibold text-earth-900 dark:text-white mb-1 leading-tight">
                                                {inscripcion.cursoNombre}
                                            </h3>
                                            <p className="text-walnut-500 dark:text-gray-400 text-sm">
                                                Hola, {inscripcion.nombre}
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center pt-4 sm:pt-0 border-t sm:border-t-0 border-earth-900/5 dark:border-white/5">
                                            {showDescartar && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('¿Estás seguro de que quieres descartar esta inscripción?')) {
                                                            try {
                                                                await fetch('/api/inscripcion/cancelar', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ token: inscripcion.token }),
                                                                });
                                                            } catch (error) {
                                                                console.error('Error cancelando inscripción:', error);
                                                            }
                                                            removeInscripcion(inscripcion.cursoId);
                                                        }
                                                    }}
                                                    className="text-sm text-muted-foreground hover:text-red-500 font-medium px-4 py-2 transition-colors order-2 sm:order-1"
                                                >
                                                    Descartar
                                                </button>
                                            )}
                                            <Link
                                                href={`/mi-inscripcion/${inscripcion.token}`}
                                                className={`inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl transition-colors shadow-lg shadow-green-600/10 dark:shadow-none order-1 sm:order-2 ${config.buttonClass}`}
                                            >
                                                {config.buttonText} →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
