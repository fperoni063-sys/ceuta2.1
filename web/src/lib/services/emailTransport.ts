/**
 * Resolución pura del transporte de email (sin I/O).
 * Resend (HTTP) tiene prioridad porque SMTP es frágil en Vercel serverless.
 */
export type EmailTransportKind = 'resend' | 'smtp' | 'none';

export function getSmtpPassword(
    env: NodeJS.Dict<string> = process.env
): string | undefined {
    return env.SMTP_PASSWORD || env.SMTP_PASS || undefined;
}

export function resolveEmailTransport(
    env: NodeJS.Dict<string> = process.env
): EmailTransportKind {
    if (env.RESEND_API_KEY?.trim()) return 'resend';
    const smtpPass = getSmtpPassword(env);
    if (env.SMTP_USER?.trim() && smtpPass?.trim()) return 'smtp';
    return 'none';
}

export function getFromAddress(
    kind: EmailTransportKind,
    env: NodeJS.Dict<string> = process.env
): string {
    if (env.EMAIL_FROM?.trim()) return env.EMAIL_FROM.trim();
    if (kind === 'smtp' && env.SMTP_USER?.trim()) {
        return `CEUTA <${env.SMTP_USER.trim()}>`;
    }
    return 'CEUTA <onboarding@resend.dev>';
}

export function getEmailProviderStatus(env: NodeJS.Dict<string> = process.env) {
    const provider = resolveEmailTransport(env);
    return {
        configured: provider !== 'none',
        provider,
        from: provider === 'none' ? null : getFromAddress(provider, env),
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
