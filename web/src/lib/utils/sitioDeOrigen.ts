/**
 * Sitio desde el que llegó la visita, por ejemplo "https://l.instagram.com".
 * Guarda solo el sitio, nunca la dirección completa, y nada si vino de la misma web.
 * Se usa para medir de dónde viene el tráfico (columna referrer de analytics_events).
 */
export function sitioDeOrigen(): string | undefined {
    if (typeof document === 'undefined' || !document.referrer) return undefined;
    try {
        const origen = new URL(document.referrer).origin;
        if (!origen || origen === 'null' || origen === window.location.origin) return undefined;
        return origen;
    } catch {
        return undefined;
    }
}
