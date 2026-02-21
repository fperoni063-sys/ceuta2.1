export interface Inscripto {
    id: number;
    nombre: string;
    email?: string;
    comprobante_url?: string;
    monto_pagado?: number;
    monto_pago?: number | null;
    codigo_descuento?: string | null;
    metodo_pago?: string;
    updated_at?: string;
    cursos?: {
        nombre: string;
        precio: number;
    } | null;
}

export interface NotificationItem extends Inscripto {
    key?: string; // Just in case
    // Notification specific fields if any, effectively Inscripto has everything we need now
    email: string;
    updated_at: string;
    comprobante_url: string;
    metodo_pago: string;
    monto_pagado: number;
}
