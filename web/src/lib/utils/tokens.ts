import crypto from 'crypto';

/**
 * Genera un token seguro de 32 caracteres hexadecimales
 * Usado para el link mágico en emails
 */
export function generateAccessToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Calcula la fecha de expiración del token
 * Por defecto: 8 días desde ahora (7 días del último email + 1 día de gracia)
 */
export function getTokenExpiry(days: number = 8): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
}

/**
 * Genera el link completo para acceder a la inscripción
 */
export function generateMagicLink(token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/mi-inscripcion/${token}`;
}
