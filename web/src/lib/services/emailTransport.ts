/**
 * Resolución pura del transporte de email (sin I/O).
 * Resend (HTTP) es el primario. SMTP/Gmail es fallback gratis para alumnos
 * mientras el dominio de Resend no esté verificado.
 */
export type EmailTransportKind = 'resend' | 'smtp' | 'none';

export function getSmtpPassword(
    env: NodeJS.Dict<string> = process.env
): string | undefined {
    return env.SMTP_PASSWORD || env.SMTP_PASS || undefined;
}

export function hasResend(env: NodeJS.Dict<string> = process.env): boolean {
    return Boolean(env.RESEND_API_KEY?.trim());
}

export function hasSmtp(env: NodeJS.Dict<string> = process.env): boolean {
    const smtpPass = getSmtpPassword(env);
    return Boolean(env.SMTP_USER?.trim() && smtpPass?.trim());
}

export function resolveEmailTransport(
    env: NodeJS.Dict<string> = process.env
): EmailTransportKind {
    if (hasResend(env)) return 'resend';
    if (hasSmtp(env)) return 'smtp';
    return 'none';
}

function looksLikeEmailFrom(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed === 'EMAIL_FROM') return false;
    return /[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+/.test(trimmed);
}

export function getFromAddress(
    kind: EmailTransportKind,
    env: NodeJS.Dict<string> = process.env
): string {
    const configured = env.EMAIL_FROM?.trim();
    if (configured && looksLikeEmailFrom(configured)) {
        if (kind === 'smtp' && configured.includes('onboarding@resend.dev')) {
            // Gmail no puede mandar como onboarding@resend.dev
        } else {
            return configured;
        }
    }
    if (kind === 'smtp' && env.SMTP_USER?.trim()) {
        return `CEUTA <${env.SMTP_USER.trim()}>`;
    }
    return 'CEUTA <onboarding@resend.dev>';
}

export function getEmailProviderStatus(env: NodeJS.Dict<string> = process.env) {
    const resend = hasResend(env);
    const smtp = hasSmtp(env);
    const provider: EmailTransportKind | 'resend+smtp' =
        resend && smtp ? 'resend+smtp' : resend ? 'resend' : smtp ? 'smtp' : 'none';
    const kind: EmailTransportKind = resend ? 'resend' : smtp ? 'smtp' : 'none';
    return {
        configured: provider !== 'none',
        provider,
        from: kind === 'none' ? null : getFromAddress(kind, env),
        smtpFallback: smtp,
    };
}

/** Estados en los que ya no deben salir recordatorios de pago. */
export const STOP_REMINDER_STATES = [
    'verificado',
    'cancelado',
    'rechazado',
    'pago_a_verificar',
    'pagado',
    'confirmado',
] as const;
