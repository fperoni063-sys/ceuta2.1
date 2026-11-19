/**
 * Qué pasa cuando alguien vuelve a hacer la reserva de un curso.
 *
 * La web reconoce la reserva por correo y curso: si la persona la rehace con el
 * mismo correo, no se crea otra, se actualiza la que tenía. Desde el 19/11/2026
 * el pasante de WhatsApp les dice a quienes cargaron mal el número que la
 * rehagan, así que este camino tiene que ser seguro:
 *   - el número nuevo tiene que llegar a la web vieja, porque Karen trabaja con
 *     esa y allá no hay forma de editar: va una inscripción nueva;
 *   - si cambia de solo online a completo, no puede quedar congelado el precio
 *     online (en Jardines, 3.500 en vez de 4.000);
 *   - no puede bajar a "pago pendiente" a quien ya mandó el comprobante o ya fue
 *     verificado;
 *   - no puede borrar la cédula y los demás datos del perfil, que el paso 2 del
 *     formulario no manda.
 */

/** Estados que una reserva rehecha conserva. Los demás vuelven a pago pendiente. */
const ESTADOS_QUE_SE_CONSERVAN = new Set(['pago_a_verificar', 'verificado', 'confirmado']);

export function estadoAlRehacer(estadoAnterior: string | null | undefined): string {
    return estadoAnterior && ESTADOS_QUE_SE_CONSERVAN.has(estadoAnterior) ? estadoAnterior : 'pago_pendiente';
}

/** El número sin formato: 099 123 456, 099123456 y +598 99 123 456 dan lo mismo. */
export function claveDeTelefono(telefono: string | null | undefined): string {
    let digitos = String(telefono ?? '').replace(/\D/g, '').replace(/^0+/, '');
    if (digitos.startsWith('598') && digitos.length > 9) digitos = digitos.slice(3);
    return digitos.replace(/^0+/, '');
}

export function cambioElTelefono(anterior: string | null | undefined, nuevo: string | null | undefined): boolean {
    const nuevoLimpio = claveDeTelefono(nuevo);
    return nuevoLimpio.length > 0 && claveDeTelefono(anterior) !== nuevoLimpio;
}

/**
 * Qué guardar en `precio_pagado` al actualizar una reserva.
 *   - Si ahora hay un precio calculado (código o solo online), ese.
 *   - Si estaba en solo online y ahora no, se borra: si no, el completo quedaba
 *     con el precio online congelado.
 *   - Si no, no se toca: puede ser un precio guardado a mano.
 */
export function precioPagadoAlRehacer(
    precioNuevo: number | null,
    modalidadAnterior: string | null | undefined,
    modalidadNueva: string | null
): { precio_pagado?: number | null } {
    if (precioNuevo !== null) return { precio_pagado: precioNuevo };
    if (modalidadAnterior === 'online' && modalidadNueva !== 'online') return { precio_pagado: null };
    return {};
}

const CAMPOS_DE_PERFIL = ['cedula', 'edad', 'departamento', 'direccion', 'como_se_entero'] as const;
type CampoDePerfil = (typeof CAMPOS_DE_PERFIL)[number];

/** Solo los datos de perfil que vinieron con algo: los vacíos no pisan lo guardado. */
export function perfilQueVino(datos: Partial<Record<CampoDePerfil, unknown>>): Partial<Record<CampoDePerfil, unknown>> {
    const out: Partial<Record<CampoDePerfil, unknown>> = {};
    for (const campo of CAMPOS_DE_PERFIL) {
        const valor = datos[campo];
        if (valor !== undefined && valor !== null && String(valor).trim() !== '') out[campo] = valor;
    }
    return out;
}
