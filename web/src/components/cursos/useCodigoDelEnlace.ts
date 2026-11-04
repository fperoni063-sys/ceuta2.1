'use client';

import { useEffect, useState } from 'react';
import { normalizarCodigo } from '@/lib/utils/discountUtils';

export interface CodigoDelEnlace {
    codigo: string;
    tipo: string | null;
    valor: number | null;
}

/**
 * El código que trae el enlace (/cursos/monte-comestible?codigo=MONTE20), ya validado.
 *
 * Por qué existe: el modal aplica el código recién en el paso del pago, así que
 * quien venía de un mensaje que prometía $ 4.000 abría la ficha y veía $ 5.000.
 * Si el código no sirve o la validación falla, devuelve null y la ficha sigue
 * con el precio de lista.
 */
export function useCodigoDelEnlace(cursoId: number): CodigoDelEnlace | null {
    const [resultado, setResultado] = useState<CodigoDelEnlace | null>(null);

    useEffect(() => {
        const crudo = new URLSearchParams(window.location.search).get('codigo');
        const codigo = crudo ? normalizarCodigo(crudo) : '';
        if (!codigo) return;

        let vigente = true;
        fetch('/api/validate-discount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, curso_id: cursoId }),
        })
            .then((res) => res.json())
            .then((r) => {
                if (vigente && r.valid) setResultado({ codigo, tipo: r.tipo, valor: r.valor });
            })
            .catch(() => { /* sin validar, queda el precio de lista */ });

        return () => { vigente = false; };
    }, [cursoId]);

    return resultado;
}
