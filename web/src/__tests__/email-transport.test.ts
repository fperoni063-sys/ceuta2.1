import {
    getFromAddress,
    getSmtpPassword,
    resolveEmailTransport,
    getEmailProviderStatus,
} from '@/lib/services/emailTransport';

describe('emailTransport', () => {
    it('prefers Resend over SMTP when both are set', () => {
        expect(resolveEmailTransport({
            RESEND_API_KEY: 're_test',
            SMTP_USER: 'a@b.com',
            SMTP_PASSWORD: 'secret',
        })).toBe('resend');
    });

    it('uses SMTP when Resend is missing', () => {
        expect(resolveEmailTransport({
            SMTP_USER: 'a@b.com',
            SMTP_PASSWORD: 'secret',
        })).toBe('smtp');
    });

    it('accepts SMTP_PASS as alias of SMTP_PASSWORD', () => {
        expect(getSmtpPassword({ SMTP_PASS: 'alias' })).toBe('alias');
        expect(resolveEmailTransport({
            SMTP_USER: 'a@b.com',
            SMTP_PASS: 'alias',
        })).toBe('smtp');
    });

    it('reports none when nothing is configured', () => {
        expect(resolveEmailTransport({})).toBe('none');
        expect(getEmailProviderStatus({}).configured).toBe(false);
    });

    it('uses EMAIL_FROM when provided', () => {
        expect(getFromAddress('resend', {
            EMAIL_FROM: 'CEUTA <secretaria@ceuta.org.uy>',
        })).toBe('CEUTA <secretaria@ceuta.org.uy>');
    });

    it('falls back to SMTP user or Resend onboarding address', () => {
        expect(getFromAddress('smtp', { SMTP_USER: 'secretaria@ceuta.org.uy' }))
            .toBe('CEUTA <secretaria@ceuta.org.uy>');
        expect(getFromAddress('resend', {})).toBe('CEUTA <onboarding@resend.dev>');
    });
});
