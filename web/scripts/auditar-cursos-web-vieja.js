/**
 * Audita el mapeo curso nuevo -> curso viejo.
 *
 * Para cada curso con `url_web_vieja`, compara el id que sale del path contra el
 * `id_curso` que declara el formulario de esa página. Si no coinciden, las
 * preinscripciones de ese curso se archivan bajo OTRO curso en el panel viejo, y
 * el bot de WhatsApp le escribe al cliente nombrando el curso equivocado.
 *
 * Pasó dos veces con Solar Fotovoltaica (ver syncViejaWeb.ts). Correlo cuando
 * agregues un curso o le cambies la url_web_vieja:
 *
 *     node scripts/auditar-cursos-web-vieja.js
 *
 * Sale con código 1 si encuentra algo mal, así se puede colgar de CI.
 * SOLO LECTURA: no escribe en Supabase ni en la web vieja.
 */
const fs = require('fs');
const path = require('path');

// .env.local a mano: el repo no tiene dotenv instalado (Next lo carga solo).
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Mismas dos funciones que src/lib/services/syncViejaWeb.ts
function extraerIdCursoViejo(urlVieja) {
    let pathname;
    try { pathname = new URL(urlVieja).pathname; } catch { return null; }
    const numericos = pathname.split('/').filter((s) => /^\d+$/.test(s));
    return numericos.length === 1 ? numericos[0] : null;
}

function idCursoDeclaradoEnHtml(html) {
    const input = html.match(/<input[^>]*\bname=["']?id_curso["']?[^>]*>/i);
    if (!input) return null;
    const value = input[0].match(/\bvalue=["']?(\d+)["']?/i);
    return value ? value[1] : null;
}

// La web vieja se cae seguido; sin reintentos el audit da falsos positivos.
async function getConReintentos(url, intentos = 4) {
    let ultimo;
    for (let i = 0; i < intentos; i++) {
        try {
            const r = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
                signal: AbortSignal.timeout(20000),
            });
            if (r.ok) return await r.text();
            ultimo = 'HTTP ' + r.status;
        } catch (e) { ultimo = e.message; }
        await new Promise((res) => setTimeout(res, 2000 * (i + 1)));
    }
    throw new Error(ultimo);
}

(async () => {
    if (!SUPABASE_URL || !SERVICE_KEY) {
        console.error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en web/.env.local');
        process.exit(2);
    }

    const r = await fetch(SUPABASE_URL + '/rest/v1/cursos?select=id,nombre,url_web_vieja&order=id', {
        headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY },
    });
    const cursos = (await r.json()).filter((c) => c.url_web_vieja);

    console.log('Auditando ' + cursos.length + ' cursos con url_web_vieja...\n');

    const problemas = [];
    const ilegibles = [];
    for (const c of cursos) {
        const idPath = extraerIdCursoViejo(c.url_web_vieja);
        let idPagina = null;
        let error = null;
        try {
            idPagina = idCursoDeclaradoEnHtml(await getConReintentos(c.url_web_vieja));
        } catch (e) { error = e.message; }

        const nombre = c.nombre.slice(0, 42).padEnd(42);
        if (error) {
            console.log('  ?  ' + nombre + ' path=' + idPath + '  (no pude leer la página: ' + error + ')');
            ilegibles.push(c);
        } else if (!idPagina) {
            console.log('  X  ' + nombre + ' path=' + idPath + '  LA PÁGINA NO TIENE FORMULARIO');
            problemas.push({ ...c, idPath, idPagina, motivo: 'la página no tiene formulario de inscripción' });
        } else if (idPath !== idPagina) {
            console.log('  X  ' + nombre + ' path=' + idPath + '  pero la página declara ' + idPagina + '  <-- MAL');
            problemas.push({ ...c, idPath, idPagina, motivo: 'el path y la página no coinciden' });
        } else {
            console.log('  ok ' + nombre + ' id_curso=' + idPagina);
        }
    }

    if (ilegibles.length) {
        console.log('\n' + ilegibles.length + ' curso(s) no se pudieron verificar (la web vieja no respondió). Reintentá.');
    }

    if (problemas.length) {
        console.log('\nMAL: ' + problemas.length + ' curso(s) mapean a otro curso:');
        for (const p of problemas) {
            console.log('\n   ' + p.nombre + ' (curso_id ' + p.id + ')');
            console.log('   url_web_vieja: ' + p.url_web_vieja);
            console.log('   ' + p.motivo + ': path dice ' + p.idPath + ', página dice ' + p.idPagina);
        }
        console.log('\n   Arreglo: corregí url_web_vieja en /admin/cursos/<id> para que apunte');
        console.log('   a la página del curso correcto.');
        process.exit(1);
    }

    if (!ilegibles.length) console.log('\nOK: todos los cursos mapean bien.');
})();
