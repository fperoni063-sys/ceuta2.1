import { extraerIdCursoViejo, idCursoDeclaradoEnHtml } from '@/lib/services/syncViejaWeb';

const BASE = 'https://www.ceuta.org.uy';

describe('extraerIdCursoViejo', () => {
    // Regresión: Solar Fotovoltaica es el único curso con un segmento extra en el
    // path. La versión vieja hacía match(/\/calendario\/(\d+)\//) y caía a un
    // fallback '200', así que las preinscripciones a solar quedaban archivadas
    // como "Jardines ecológicos" (id 200) en la web vieja.
    it('saca el id aunque la URL tenga segmentos extra (caso solar / anteriores)', () => {
        expect(extraerIdCursoViejo(
            `${BASE}/cursos/calendario/anteriores/49/energia-solar-fotovoltaica-semipresencial`
        )).toBe('49');
    });

    it('nunca cae a Jardines (200) cuando la URL no trae ese id', () => {
        const url = `${BASE}/cursos/calendario/anteriores/49/energia-solar-fotovoltaica-semipresencial`;
        expect(extraerIdCursoViejo(url)).not.toBe('200');
    });

    it.each([
        [`${BASE}/cursos/calendario/200/jardines-ecologicos-full`, '200'],
        [`${BASE}/cursos/calendario/192/cosmetica-natural-semipresencial-full`, '192'],
        [`${BASE}/cursos/calendario/110/huerta-organica-`, '110'],
        [`${BASE}/cursos/inscripcion/49/energia-solar-fotovoltaica-full`, '49'],
    ])('saca el id de %s', (url, esperado) => {
        expect(extraerIdCursoViejo(url)).toBe(esperado);
    });

    // Preferimos que falte el registro a que quede archivado bajo otro curso.
    it('devuelve null si la URL no tiene ningún id', () => {
        expect(extraerIdCursoViejo(`${BASE}/cursos/calendario/jardines-ecologicos-full`)).toBeNull();
    });

    it('devuelve null si la URL es ambigua (dos números)', () => {
        expect(extraerIdCursoViejo(`${BASE}/cursos/2026/calendario/49/solar`)).toBeNull();
    });

    it('devuelve null si no es una URL válida', () => {
        expect(extraerIdCursoViejo('/cursos/calendario/200/jardines')).toBeNull();
        expect(extraerIdCursoViejo('')).toBeNull();
    });

    // La página vieja declara su propio id_curso en un hidden. Esa es la fuente
    // autoritativa: si la URL y la página no coinciden, manda la página.
    describe('idCursoDeclaradoEnHtml', () => {
        it('lee el hidden id_curso del formulario', () => {
            expect(idCursoDeclaradoEnHtml(
                `<form method="post"><input type="hidden" name="id_curso" value="49" /></form>`
            )).toBe('49');
        });

        it('tolera comillas simples, sin comillas y atributos en otro orden', () => {
            expect(idCursoDeclaradoEnHtml(`<input name='id_curso' value='200'>`)).toBe('200');
            expect(idCursoDeclaradoEnHtml(`<input value=185 name=id_curso>`)).toBe('185');
            expect(idCursoDeclaradoEnHtml(`<INPUT TYPE="HIDDEN" NAME="ID_CURSO" VALUE="110">`)).toBe('110');
        });

        it('devuelve null si la página no declara id_curso', () => {
            expect(idCursoDeclaradoEnHtml('<html><body>Error 404</body></html>')).toBeNull();
            expect(idCursoDeclaradoEnHtml('<input name="otra_cosa" value="200">')).toBeNull();
        });

        it('no confunde otro input que contenga el texto id_curso', () => {
            expect(idCursoDeclaradoEnHtml(`<input name="nombre_id_curso_x" value="7">`)).toBeNull();
        });
    });
});
