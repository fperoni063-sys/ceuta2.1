'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useInscripciones, type InscripcionPendiente } from '@/lib/hooks/useInscripcionCookie';

export function InscripcionBanner() {
    const pathname = usePathname();
    const { inscripciones, hasInscripcionesPendientes, removeInscripcion, markAsAcceptedShown } = useInscripciones();
    const [dismissedCursos, setDismissedCursos] = useState<Set<number>>(new Set());
    const [isClient, setIsClient] = useState(false);

    // Evitar hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || !hasInscripcionesPendientes) {
        return null;
    }

    // Filtrar inscripciones que no han sido descartadas en esta sesión y NO están canceladas
    const pendientes = inscripciones.filter(i => !dismissedCursos.has(i.cursoId) && i.estado !== 'cancelado');

    if (pendientes.length === 0) {
        return null;
    }

    const handleDismiss = (cursoId: number) => {
        setDismissedCursos(prev => new Set([...prev, cursoId]));
    };

    const handleRemove = (cursoId: number) => {
        removeInscripcion(cursoId);
    };

    // Caso DE MÚLTIPLES INSCRIPCIONES: Mostrar Banner Agrupado con mensaje inteligente
    if (pendientes.length > 1) {
        // Verificar si ya estamos en la página de listado para no ser redundantes
        if (pathname === '/mi-inscripcion') {
            return null;
        }

        // Contar por estado para mensaje inteligente
        const counts = {
            pendiente: pendientes.filter(i => i.estado === 'pendiente').length,
            revisando: pendientes.filter(i => i.estado === 'revisando').length,
            aceptado: pendientes.filter(i => i.estado === 'aceptado' && !i.acceptedShown).length,
            rechazado: pendientes.filter(i => i.estado === 'rechazado').length,
        };

        // Generar mensaje compuesto
        const parts: string[] = [];
        if (counts.rechazado > 0) {
            parts.push(`${counts.rechazado} rechazada${counts.rechazado > 1 ? 's' : ''}`);
        }
        if (counts.pendiente > 0) {
            parts.push(`${counts.pendiente} pendiente${counts.pendiente > 1 ? 's' : ''} de pago`);
        }
        if (counts.revisando > 0) {
            parts.push(`${counts.revisando} en revisión`);
        }
        if (counts.aceptado > 0) {
            parts.push(`${counts.aceptado} confirmada${counts.aceptado > 1 ? 's' : ''} 🎉`);
        }

        const mensaje = parts.length > 0
            ? `Tenés ${parts.join(', ')}.`
            : `Tenés ${pendientes.length} inscripciones activas.`;

        // Determinar color del banner según prioridad
        const hasUrgent = counts.rechazado > 0;
        const allConfirmed = counts.aceptado === pendientes.length;
        const bannerColor = hasUrgent
            ? 'bg-red-100 dark:bg-red-900/30'
            : allConfirmed
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-amber-100 dark:bg-amber-900/30';
        const iconEmoji = hasUrgent ? '⚠️' : allConfirmed ? '🎉' : '📋';

        return (
            <div className="fixed bottom-24 right-4 left-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-background dark:bg-card rounded-xl shadow-xl border border-sage-200 dark:border-white/10 p-4">
                    <div className="flex items-start gap-4">
                        <div className={`${bannerColor} p-2 rounded-full`}>
                            <span className="text-xl block leading-none">{iconEmoji}</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-earth-900 dark:text-foreground">
                                {mensaje}
                            </p>
                            <p className="text-sm text-foreground/70 dark:text-muted-foreground mt-1">
                                {hasUrgent
                                    ? 'Algunas requieren tu atención.'
                                    : allConfirmed
                                        ? '¡Todas tus inscripciones están al día!'
                                        : 'Revisá el estado de cada una.'}
                            </p>
                            <div className="flex gap-2 mt-3">
                                <Link
                                    href="/mi-inscripcion"
                                    className={`${hasUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'} dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-earth-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                                >
                                    Ver mis inscripciones
                                </Link>
                                <button
                                    onClick={() => {
                                        // Descartar todas visualmente por esta sesión
                                        pendientes.forEach(p => handleDismiss(p.cursoId));
                                    }}
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                                >
                                    Ocultar
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                pendientes.forEach(p => handleDismiss(p.cursoId));
                            }}
                            className="text-gray-500 hover:text-gray-700 -mt-1 -mr-1"
                            title="Ocultar notificación"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Caso de UNA ÚNICA INSCRIPCIÓN VÁLIDA PARA MOSTRAR
    // (O iterar sobre todas si hay varias, pero el diseño actual parece optimizado para listas)

    return (
        <div className="fixed bottom-24 right-4 left-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md z-50 space-y-2 pointer-events-none">
            {inscripciones.map((inscripcion: InscripcionPendiente) => {
                // Filtrar lo que no queremos mostrar
                if (dismissedCursos.has(inscripcion.cursoId)) return null;
                if (pathname === `/mi-inscripcion/${inscripcion.token}`) return null;
                if (inscripcion.estado === 'cancelado') return null; // No mostrar cancelados
                if (inscripcion.estado === 'aceptado' && inscripcion.acceptedShown) return null; // Ya mostrado

                // Auto-ocultar aceptados después de un tiempo
                if (inscripcion.estado === 'aceptado' && !inscripcion.acceptedShown) {
                    // Efecto secundario para marcar como visto (no bloqueante visualmente inmediato, pero sí next render)
                    // Usamos un timeout pequeño para permitir que el usuario lo vea
                    setTimeout(() => {
                        // Idealmente esto se maneja con un evento de cierre o al desmontar, 
                        // pero para "show once" estricto, podemos marcarlo al renderizar.
                        // Sin embargo, para UX, mejor dejarlo hasta que el usuario lo cierre o navegue.
                        // El requerimiento dice "solo una vez que le aparezca".
                        // Lo marcaremos como visto cuando el componente se monte/muestre.
                        markAsAcceptedShown(inscripcion.cursoId);
                    }, 5000); // 5 segundos de gracia y luego se marca como visto (desaparecerá on refresh)
                }

                // Configuración del contenido según estado
                let icon = '👋';
                let title = `¡Hola${inscripcion.nombre ? `, ${inscripcion.nombre}` : ''}!`;
                let message: React.ReactNode = (
                    <span>Tu inscripción a <span className="font-semibold text-earth-900 dark:text-foreground">{inscripcion.cursoNombre}</span> está pendiente de pago.</span>
                );
                let buttonText = 'Completar inscripción';
                let buttonClass = 'bg-green-600 hover:bg-green-700 text-white dark:bg-primary dark:text-earth-900';

                if (inscripcion.estado === 'revisando') {
                    icon = '⏳';
                    message = (
                        <span>Tu inscripción a <span className="font-semibold text-earth-900 dark:text-foreground">{inscripcion.cursoNombre}</span> está siendo revisada. Te avisaremos pronto.</span>
                    );
                    buttonText = 'Ver estado';
                    buttonClass = 'bg-amber-500 hover:bg-amber-600 text-white';
                } else if (inscripcion.estado === 'aceptado') {
                    icon = '🎉';
                    title = '¡Inscripción Confirmada!';
                    message = (
                        <span>Tu inscripción a <span className="font-semibold text-earth-900 dark:text-foreground">{inscripcion.cursoNombre}</span> fue aceptada. ¡Bienvenido/a!</span>
                    );
                    buttonText = 'Ver detalles';
                    buttonClass = 'bg-blue-600 hover:bg-blue-700 text-white';
                }

                return (
                    <div
                        key={inscripcion.cursoId}
                        className="bg-background dark:bg-card rounded-xl shadow-xl border border-sage-200 dark:border-white/10 p-4 animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{icon}</span>
                            <div className="flex-1">
                                <p className="font-medium text-earth-900 dark:text-foreground">
                                    {title}
                                </p>
                                <p className="text-sm text-foreground/70 dark:text-muted-foreground mt-1">
                                    {message}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <Link
                                        href={`/mi-inscripcion/${inscripcion.token}`}
                                        className={`${buttonClass} px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                                    >
                                        {buttonText}
                                    </Link>
                                    <button
                                        onClick={() => handleDismiss(inscripcion.cursoId)}
                                        className="text-gray-500 hover:text-gray-700 px-2 text-sm"
                                    >
                                        {inscripcion.estado === 'aceptado' ? 'Cerrar' : 'Ahora no'}
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (inscripcion.estado === 'aceptado') {
                                        markAsAcceptedShown(inscripcion.cursoId);
                                    }
                                    handleDismiss(inscripcion.cursoId);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                                title="Cerrar notificación"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
