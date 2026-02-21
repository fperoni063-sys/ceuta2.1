'use client';

import { useState, useEffect } from 'react';

// Interfaz para una inscripción individual
export interface InscripcionPendiente {
    token: string;
    nombre: string;
    cursoId: number;
    cursoNombre: string;
    estado: 'pendiente' | 'revisando' | 'aceptado' | 'cancelado' | 'rechazado';
    fechaCreacion: string;
    acceptedShown?: boolean;
}

interface UseInscripcionesResult {
    inscripciones: InscripcionPendiente[];
    hasInscripcionesPendientes: boolean;
    countByEstado: {
        pendiente: number;
        revisando: number;
        aceptado: number;
        rechazado: number;
        cancelado: number;
    };
    addInscripcion: (inscripcion: Omit<InscripcionPendiente, 'fechaCreacion' | 'estado'>) => void;
    updateEstadoInscripcion: (cursoId: number, nuevoEstado: InscripcionPendiente['estado']) => void;
    markAsAcceptedShown: (cursoId: number) => void;
    removeInscripcion: (cursoId: number) => void;
    markAsPagado: (cursoId: number) => void; // Deprecated but kept for compatibility
    clearAll: () => void;
}

const COOKIE_NAME = 'ceuta_inscripciones';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function getCookie(): InscripcionPendiente[] {
    if (typeof window === 'undefined') return [];

    const cookies = document.cookie.split(';').reduce((acc, curr) => {
        const [key, value] = curr.trim().split('=');
        if (key) acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    const raw = cookies[COOKIE_NAME];
    if (!raw) return [];

    try {
        const parsed = JSON.parse(decodeURIComponent(raw)) as InscripcionPendiente[];
        // Migrar estados viejos a nuevos
        return parsed.map(i => {
            // Si tiene un estado viejo, normalizarlo
            if ((i.estado as string) === 'pagado') {
                return { ...i, estado: 'pendiente' as const, acceptedShown: false };
            }
            // Asegurar que acceptedShown exista
            if (i.acceptedShown === undefined) {
                return { ...i, acceptedShown: false };
            }
            return i;
        });
    } catch {
        return [];
    }
}

function setCookie(inscripciones: InscripcionPendiente[]): void {
    const value = encodeURIComponent(JSON.stringify(inscripciones));
    document.cookie = `${COOKIE_NAME}=${value}; max-age=${MAX_AGE}; path=/`;
}

export function useInscripciones(): UseInscripcionesResult {
    const [inscripciones, setInscripciones] = useState<InscripcionPendiente[]>([]);

    // Cargar inscripciones de la cookie al montar
    useEffect(() => {
        const stored = getCookie();
        setInscripciones(stored);
    }, []);

    const addInscripcion = (nueva: Omit<InscripcionPendiente, 'fechaCreacion' | 'estado'>) => {
        setInscripciones(prev => {
            // Si ya existe para este curso, actualizar
            const existing = prev.find(i => i.cursoId === nueva.cursoId);
            let updated: InscripcionPendiente[];

            if (existing) {
                updated = prev.map(i =>
                    i.cursoId === nueva.cursoId
                        ? { ...nueva, estado: 'pendiente' as const, fechaCreacion: i.fechaCreacion, acceptedShown: false }
                        : i
                );
            } else {
                updated = [...prev, {
                    ...nueva,
                    estado: 'pendiente' as const,
                    fechaCreacion: new Date().toISOString(),
                    acceptedShown: false
                }];
            }

            setCookie(updated);
            return updated;
        });
    };

    const updateEstadoInscripcion = (cursoId: number, nuevoEstado: InscripcionPendiente['estado']) => {
        setInscripciones(prev => {
            const updated = prev.map(i =>
                i.cursoId === cursoId ? { ...i, estado: nuevoEstado } : i
            );
            setCookie(updated);
            return updated;
        });
    };

    const markAsAcceptedShown = (cursoId: number) => {
        setInscripciones(prev => {
            const updated = prev.map(i =>
                i.cursoId === cursoId ? { ...i, acceptedShown: true } : i
            );
            setCookie(updated);
            return updated;
        });
    };

    const removeInscripcion = (cursoId: number) => {
        setInscripciones(prev => {
            const updated = prev.filter(i => i.cursoId !== cursoId);
            setCookie(updated);
            return updated;
        });
    };

    const markAsPagado = (cursoId: number) => {
        updateEstadoInscripcion(cursoId, 'aceptado');
    };

    const clearAll = () => {
        document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;
        setInscripciones([]);
    };

    // Filter logic for "Active" notifications
    // We keep 'pendiente', 'revisando', and ONLY 'aceptado' if not shown yet.
    // 'cancelado' should be effectively hidden/removed by logic, but we keep in cookie for specific checks if needed, 
    // though generic banner logic usually filters them out.
    // For the banner specifically, we return ALL and let the banner filter.

    // Contadores por estado para uso en componentes
    const countByEstado = {
        pendiente: inscripciones.filter(i => i.estado === 'pendiente').length,
        revisando: inscripciones.filter(i => i.estado === 'revisando').length,
        aceptado: inscripciones.filter(i => i.estado === 'aceptado').length,
        rechazado: inscripciones.filter(i => i.estado === 'rechazado').length,
        cancelado: inscripciones.filter(i => i.estado === 'cancelado').length,
    };

    return {
        inscripciones,
        hasInscripcionesPendientes: inscripciones.some(i => i.estado === 'pendiente' || i.estado === 'revisando' || (i.estado === 'aceptado' && !i.acceptedShown)),
        countByEstado,
        addInscripcion,
        updateEstadoInscripcion,
        markAsAcceptedShown,
        removeInscripcion,
        markAsPagado,
        clearAll,
    };
}

// Función helper para guardar desde el modal (sin hook)
export function saveInscripcionCookie(
    token: string,
    nombre: string,
    cursoId: number,
    cursoNombre: string
): void {
    const inscripciones = getCookie();
    const existing = inscripciones.find(i => i.cursoId === cursoId);

    let updated: InscripcionPendiente[];
    if (existing) {
        updated = inscripciones.map(i =>
            i.cursoId === cursoId
                ? { ...i, token, nombre } // Mantener estado anterior si existe, o resetear si es re-inscripción? Mejor mantener.
                : i
        );
    } else {
        updated = [...inscripciones, {
            token,
            nombre,
            cursoId,
            cursoNombre,
            estado: 'pendiente' as const,
            fechaCreacion: new Date().toISOString(),
            acceptedShown: false
        }];
    }

    setCookie(updated);
}

// Mantener compatibilidad con el código existente
export function useInscripcionCookie() {
    const { inscripciones, hasInscripcionesPendientes } = useInscripciones();
    const primera = inscripciones[0] || null;

    return {
        token: primera?.token || null,
        nombre: primera?.nombre || null,
        hasInscripcion: hasInscripcionesPendientes,
    };
}

// Compatibilidad: mantener las cookies antiguas por ahora pero usar la nueva estructura
export function removeInscripcionCookie(cursoId: number): void {
    const inscripciones = getCookie();
    const updated = inscripciones.filter(i => i.cursoId !== cursoId);
    setCookie(updated);

    // Si no quedan inscripciones, limpiar las antiguas también
    if (updated.length === 0) {
        document.cookie = 'ceuta_inscripcion=; max-age=0; path=/';
        document.cookie = 'ceuta_nombre=; max-age=0; path=/';
    }
}

export function clearInscripcionCookie(): void {
    document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;
    // También limpiar cookies antiguas si existen
    document.cookie = 'ceuta_inscripcion=; max-age=0; path=/';
    document.cookie = 'ceuta_nombre=; max-age=0; path=/';
}

// Helper para obtener el token de un curso específico
export function getTokenByCursoId(cursoId: number): string | null {
    const inscripciones = getCookie();
    const inscripcion = inscripciones.find(i => i.cursoId === cursoId);
    return inscripcion?.token || null;
}

// Función helper para actualizar el estado desde fuera del hook (ej: tras subir comprobante)
export function updateInscripcionStateCookie(
    cursoId: number,
    nuevoEstado: InscripcionPendiente['estado']
): void {
    const inscripciones = getCookie();
    const updated = inscripciones.map(i =>
        i.cursoId === cursoId ? { ...i, estado: nuevoEstado } : i
    );
    setCookie(updated);
}
