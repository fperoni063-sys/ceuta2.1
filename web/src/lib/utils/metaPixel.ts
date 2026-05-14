'use client';

/**
 * Meta Pixel utilities — PURE CLIENT-SIDE.
 * 
 * ⚠️ DO NOT import 'crypto' from Node.js here.
 *    Use `crypto.randomUUID()` which is the Web Crypto API (native browser).
 * 
 * All functions are fire-and-forget and will never throw.
 */

/**
 * Genera un event_id único para deduplicación Meta Pixel + CAPI.
 * Usa crypto.randomUUID() nativo del browser.
 * Fallback a timestamp+random si no está disponible.
 */
export function generateEventId(): string {
    try {
        return crypto.randomUUID();
    } catch {
        // Fallback para browsers muy viejos que no soportan randomUUID
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
}

/**
 * Dispara un evento Lead en el Meta Pixel del browser.
 * 100% fire-and-forget. Si falla, no pasa nada.
 */
export function trackMetaLead(params: {
    eventId: string;
    courseName: string;
    courseId: number;
    email?: string;
    phone?: string;
    name?: string;
}): void {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fbq = (window as any).fbq;
        if (typeof fbq !== 'function') {
            console.log('[META-PIXEL] fbq no disponible (bloqueador de ads o pixel no cargado)');
            return;
        }

        fbq('track', 'Lead', {
            content_name: params.courseName,
            content_category: 'course_enrollment',
            content_ids: [String(params.courseId)],
        }, {
            eventID: params.eventId, // Para deduplicación con CAPI
        });

        console.log('[META-PIXEL] ✅ Lead enviado (browser)', { eventId: params.eventId });
    } catch (error) {
        // Silencioso. NUNCA debe romper el flujo principal.
        console.warn('[META-PIXEL] ⚠️ Error (ignorado):', error);
    }
}
