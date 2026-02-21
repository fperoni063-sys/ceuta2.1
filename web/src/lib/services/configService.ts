import { createAdminClient, createClient } from '@/lib/supabase/server';
import { COMPANY_INFO, CONFIG_KEYS } from '@/lib/constants';

interface SystemConfig {
    whatsappContacto: string;
    whatsappContactoDisplay: string;
    whatsappSecretaria: string;
    whatsappSecretariaDisplay: string;
    email: string;
    direccion: string;
}

/**
 * Helper to format phone numbers for display (e.g., 098910715 -> 098 910 715)
 * Simple formatter, assumes Uruguayan mobile length mainly
 */
function formatDisplayPhone(phone: string): string {
    // Remove non-digits
    const clean = phone.replace(/\D/g, '');

    // Check for international 598 prefix and remove it for local display
    const local = clean.startsWith('598') ? clean.substring(3) : clean;

    // If it looks like a mobile (9 digits starting with 09), format it
    if (local.length === 9 && local.startsWith('09')) {
        return `${local.substring(0, 3)} ${local.substring(3, 6)} ${local.substring(6)}`;
    }

    return local; // Return as-is if pattern doesn't match
}

/**
 * Fetches system configuration with robust fallbacks.
 * Uses Admin Client for server-side reliability.
 */
export async function getSystemConfig(): Promise<SystemConfig> {
    const supabase = createAdminClient();

    try {
        const { data: configs } = await supabase
            .from('configuracion')
            .select('clave, valor');

        const configMap = new Map(configs?.map(c => [c.clave, c.valor]) || []);

        // Helper to get value or fallback
        const get = (key: string, fallback: string) => configMap.get(key) || fallback;

        const rawWhatsappContacto = get(CONFIG_KEYS.WHATSAPP_CONTACTO, COMPANY_INFO.whatsapp.contacto);
        const rawWhatsappSecretaria = get(CONFIG_KEYS.WHATSAPP_SECRETARIA, COMPANY_INFO.whatsapp.secretaria);

        return {
            whatsappContacto: rawWhatsappContacto.replace(/\D/g, ''), // Ensure clean numbers for links
            whatsappContactoDisplay: formatDisplayPhone(rawWhatsappContacto),
            whatsappSecretaria: rawWhatsappSecretaria.replace(/\D/g, ''),
            whatsappSecretariaDisplay: formatDisplayPhone(rawWhatsappSecretaria),
            email: get(CONFIG_KEYS.EMAIL_CONTACTO, COMPANY_INFO.email),
            direccion: get(CONFIG_KEYS.DIRECCION, COMPANY_INFO.address),
        };

    } catch (error) {
        console.error('Error fetching system config, using fallbacks:', error);
        // Fallback total en caso de error de DB
        return {
            whatsappContacto: COMPANY_INFO.whatsapp.contacto,
            whatsappContactoDisplay: COMPANY_INFO.whatsapp.contactoDisplay,
            whatsappSecretaria: COMPANY_INFO.whatsapp.secretaria,
            whatsappSecretariaDisplay: COMPANY_INFO.whatsapp.secretariaDisplay,
            email: COMPANY_INFO.email,
            direccion: COMPANY_INFO.address,
        };
    }
}
