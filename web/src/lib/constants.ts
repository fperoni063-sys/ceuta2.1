export const COMPANY_INFO = {
    name: "CEUTA",
    fullName: "Centro Uruguayo de Tecnologías Apropiadas",
    address: "Canelones 1198, Montevideo, Uruguay",
    email: "secretaria@ceuta.org.uy",
    // Nuevos números solicitados
    whatsapp: {
        contacto: "59898910715", // Formato internacional limpio para links
        contactoDisplay: "098 910 715", // Formato visual
        secretaria: "59891431577",
        secretariaDisplay: "091 431 577"
    },
    social: {
        facebook: "https://www.facebook.com/cursosceuta/",
        instagram: "https://www.instagram.com/ceuta.uy/"
    }
} as const;

export const CONFIG_KEYS = {
    WHATSAPP_CONTACTO: 'contacto_whatsapp',
    WHATSAPP_SECRETARIA: 'contacto_secretaria',
    EMAIL_CONTACTO: 'email_contacto',
    DIRECCION: 'direccion',
} as const;
