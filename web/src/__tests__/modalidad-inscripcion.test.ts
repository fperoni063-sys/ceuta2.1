import {
    modalidadValida,
    normalizarModalidad,
    normalizarOrigen,
    notaDeOrigen,
    precioConDescuentoDelCurso,
    precioDeLista,
} from '@/lib/utils/modalidadInscripcion';
import { aplicarCodigo } from '@/lib/utils/discountUtils';

// Curso con las dos opciones, como Jardines: completo 4.000, solo online 3.500.
const jardines = { precio: 4000, precio_online: 3500, permite_online: true, modalidad: 'hibrido' };

describe('opción elegida en la inscripción', () => {
    it('solo acepta hibrido u online', () => {
        expect(normalizarModalidad('online')).toBe('online');
        expect(normalizarModalidad('hibrido')).toBe('hibrido');
        expect(normalizarModalidad('presencial')).toBeNull();
        expect(normalizarModalidad(undefined)).toBeNull();
    });

    it('ignora la elección si el curso no ofrece las dos opciones', () => {
        expect(modalidadValida({ ...jardines, permite_online: false }, 'online')).toBeNull();
        expect(modalidadValida({ ...jardines, modalidad: 'virtual' }, 'online')).toBeNull();
        expect(modalidadValida(jardines, 'online')).toBe('online');
    });

    it('usa el precio online para la opción solo online', () => {
        expect(precioDeLista(jardines, 'online')).toBe(3500);
        expect(precioDeLista(jardines, 'hibrido')).toBe(4000);
        expect(precioDeLista(jardines, null)).toBe(4000);
        expect(precioDeLista({ ...jardines, precio_online: null }, 'online')).toBe(4000);
    });

    it('el código se aplica sobre el precio de la opción elegida, no sobre el completo', () => {
        const conCodigo = { ...jardines, precio: 5000, precio_online: 3750 };
        expect(aplicarCodigo(precioDeLista(conCodigo, 'online')!, 'porcentaje', 20)).toBe(3000);
        expect(aplicarCodigo(precioDeLista(conCodigo, 'hibrido')!, 'porcentaje', 20)).toBe(4000);
    });

    it('aplica el descuento automático de cada opción', () => {
        const futuro = new Date(Date.now() + 86400000).toISOString();
        const curso = { ...jardines, descuento_online_porcentaje: 10, descuento_cupos_totales: 100, descuento_fecha_fin: futuro };
        expect(precioConDescuentoDelCurso(curso, 'online')).toBe(3150);
        expect(precioConDescuentoDelCurso(curso, 'hibrido')).toBe(4000);
    });
});

describe('origen del enlace', () => {
    it('acepta palabras cortas y las pasa a minúsculas', () => {
        expect(normalizarOrigen('Charla')).toBe('charla');
        expect(normalizarOrigen('whatsapp_2')).toBe('whatsapp_2');
    });

    it('rechaza cualquier otra cosa', () => {
        expect(normalizarOrigen('<script>')).toBeNull();
        expect(normalizarOrigen('a'.repeat(31))).toBeNull();
        expect(normalizarOrigen(null)).toBeNull();
        expect(normalizarOrigen('')).toBeNull();
    });

    it('arma la nota', () => {
        expect(notaDeOrigen('charla')).toBe('origen: charla');
        expect(notaDeOrigen(null)).toBeNull();
    });
});
