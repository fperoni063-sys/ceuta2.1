import {
    construirCiSync,
    esRechazoSilenciosoHtml,
    extraerIdCursoViejo,
    idCursoDeclaradoEnHtml,
} from '@/lib/services/syncViejaWeb';

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

    // Regresión 19/11/2026: ceuta.org.uy descarta en silencio (HTTP 200) cualquier
    // envío con el mismo (id_curso, ci, fecha). Mandar siempre '00000000' hacía que
    // solo entrara la primera persona del día por curso.
    describe('construirCiSync', () => {
        it('usa la cédula real cuando existe', () => {
            expect(construirCiSync({ id: 301, cedula: ' 39583485 ', email: 'a@b.uy', telefono: '099' })).toBe('39583485');
        });

        it('usa el id de Supabase rellenado con ceros para que dos personas del mismo día no colisionen', () => {
            const ci1 = construirCiSync({ id: 301, email: 'a@b.uy', telefono: '099111111' });
            const ci2 = construirCiSync({ id: 302, email: 'b@b.uy', telefono: '099222222' });
            expect(ci1).toBe('00000301');
            expect(ci2).toBe('00000302');
            expect(ci1).not.toBe(ci2);
        });

        it('sin id ni cédula genera un 00xxxxxx determinístico y distinto de 00000000', () => {
            const ciA = construirCiSync({ email: 'Carmen@Test.uy', telefono: '099 571 846' });
            const ciARetry = construirCiSync({ email: 'carmen@test.uy ', telefono: '099571846' });
            const ciB = construirCiSync({ email: 'karina@test.uy', telefono: '098636478' });
            expect(ciA).toMatch(/^00\d{6}$/);
            expect(ciA).not.toBe('00000000');
            expect(ciA).toBe(ciARetry);
            expect(ciA).not.toBe(ciB);
        });
    });

    describe('esRechazoSilenciosoHtml', () => {
        it('detecta el 200 engañoso cuando PHP redirige a /inscripto sin abrir el form', () => {
            const htmlRechazo = `
                <script>window.location = "cursos/calendario/209/-jardines/inscripto"</script>
                <a class="btn-inscripcion ">PREINSCRIBIRME</a>
                <div class="col col-100" id="form" ></div>
            `;
            expect(esRechazoSilenciosoHtml(htmlRechazo)).toBe(true);
        });

        it('no marca como rechazo un alta real que muestra activo y display: block', () => {
            const htmlOk = `
                <script>window.location = "cursos/calendario/209/-jardines/inscripto"</script>
                <a class="btn-inscripcion  activo ">PREINSCRIBIRME</a>
                <div class="col col-100" id="form"  style="display: block" ></div>
            `;
            expect(esRechazoSilenciosoHtml(htmlOk)).toBe(false);
        });
    });
});
