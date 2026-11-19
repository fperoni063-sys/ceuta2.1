/**
 * Copia cada preinscripción de la web nueva al formulario PHP de la web vieja.
 *
 * EL PUNTO DELICADO ES QUÉ CURSO SE MANDA.
 *
 * El curso viaja como `id_curso`. Ese id no lo tenemos en Supabase: está
 * escondido adentro del string `cursos.url_web_vieja`, escrito a mano en el
 * admin. Deducirlo de la URL es frágil, y ya falló dos veces en producción:
 *
 *   Hasta el 08/09/2026 el código hacía `match(/\/calendario\/(\d+)\//)` con un
 *   fallback `'200'`. Solar Fotovoltaica es el único curso cuya URL lleva un
 *   segmento extra (`/cursos/calendario/anteriores/49/…`), no matcheaba, y caía
 *   al default. 200 es Jardines ecológicos. Resultado: cuatro personas que se
 *   anotaron a Solar quedaron archivadas como Jardines en el panel viejo, y el
 *   bot de WhatsApp — que lee ese panel — les escribió nombrando el curso
 *   equivocado. Uno de ellos ya había pagado.
 *
 * Por eso ahora el id NO se adivina. Orden de preferencia:
 *
 *   1. El `id_curso` que declara el propio formulario de la página. Es la única
 *      fuente autoritativa: es literalmente el valor que mandaría un humano
 *      llenando ese form.
 *   2. Si la página no se puede leer, el único segmento numérico del path.
 *   3. Si no hay ninguno de los dos, NO se sincroniza.
 *
 * Nunca un default. Un id inventado no da error: archiva bien callado bajo otro
 * curso, y alguien más abajo lo lee como si fuera cierto. Que falte el registro
 * se nota; que esté mal, no.
 */

const TIMEOUT_GET_MS = 2500;
const TIMEOUT_POST_MS = 4000;

/**
 * Saca el id del path. Exige UN único segmento numérico: con cero no sabemos el
 * curso, con dos o más no sabemos cuál de los dos es.
 */
export function extraerIdCursoViejo(urlVieja: string): string | null {
    let pathname: string;
    try {
        pathname = new URL(urlVieja).pathname;
    } catch {
        return null;
    }
    const numericos = pathname.split('/').filter((s) => /^\d+$/.test(s));
    return numericos.length === 1 ? numericos[0] : null;
}

/** Lee el `id_curso` del hidden que la propia página declara en su formulario. */
export function idCursoDeclaradoEnHtml(html: string): string | null {
    const input = html.match(/<input[^>]*\bname=["']?id_curso["']?[^>]*>/i);
    if (!input) return null;
    const value = input[0].match(/\bvalue=["']?(\d+)["']?/i);
    return value ? value[1] : null;
}

async function leerIdDeclarado(urlVieja: string): Promise<string | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_GET_MS);
    try {
        const r = await fetch(urlVieja, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
            },
            signal: controller.signal,
        });
        if (!r.ok) return null;
        return idCursoDeclaradoEnHtml(await r.text());
    } catch {
        // La web vieja se cae seguido. No es fatal: caemos al id del path.
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
}

export interface InscriptoSync {
    id?: number | string | null;
    nombre: string;
    email: string;
    telefono?: string;
    cedula?: string | null;
}

/**
 * Construye el campo `ci` para el formulario PHP de la web vieja.
 *
 * El formulario de ceuta.org.uy descarta en silencio (respondiendo HTTP 200)
 * cualquier envío que repita `(id_curso, ci, fecha)` en el mismo día. Hasta el
 * 19/11/2026 mandábamos siempre `'00000000'`, así que solo entraba la primera
 * persona del día por curso y las siguientes se perdían sin dar error.
 *
 * Con un identificador determinístico con prefijo `00` (ninguna cédula real
 * uruguaya empieza con `00`):
 *   - dos personas distintas el mismo día ya no colisionan,
 *   - un reintento de la misma persona el mismo día sigue siendo idempotente.
 */
export function construirCiSync(
    inscripto: Pick<InscriptoSync, 'id' | 'cedula' | 'email' | 'telefono'>
): string {
    const cedulaReal = inscripto.cedula?.trim();
    if (cedulaReal) return cedulaReal;

    const idDigitos = inscripto.id != null ? String(inscripto.id).replace(/\D/g, '') : '';
    if (idDigitos && Number(idDigitos) > 0) {
        return idDigitos.length >= 8 ? idDigitos : idDigitos.padStart(8, '0');
    }

    const semilla = `${inscripto.email.trim().toLowerCase()}|${(inscripto.telefono || '').replace(/\D/g, '')}`;
    let hash = 2166136261;
    for (let i = 0; i < semilla.length; i++) {
        hash ^= semilla.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    const sufijo = ((hash >>> 0) % 999999) + 1;
    return `00${String(sufijo).padStart(6, '0')}`;
}

/**
 * Detecta el rechazo silencioso por duplicado `(id_curso, ci, fecha)` en PHP:
 * devuelve HTTP 200 con `window.location = ".../inscripto"`, pero sin marcar el
 * formulario como enviado (`btn-inscripcion activo` / `#form display: block`).
 */
export function esRechazoSilenciosoHtml(html: string): boolean {
    if (!html) return false;
    const redirigeInscripto = /window\.location\s*=\s*["'][^"']*\/inscripto["']/i.test(html);
    if (!redirigeInscripto) return false;
    const confirmoForm =
        /id=["']form["'][^>]*display\s*:\s*block/i.test(html) ||
        /class=["'][^"']*btn-inscripcion[^"']*\bactivo\b/i.test(html);
    return !confirmoForm;
}

/**
 * La web vieja no tiene forma de editar una inscripción. Cuando alguien rehace la
 * reserva con otro número, se le manda una inscripción nueva con el número bueno
 * (Karen trabaja con la web vieja y necesita ese número). La primera queda ahí.
 *
 * Va sin el id a propósito: la cédula de relleno sale del correo y del número
 * nuevo, así no repite la del primer envío (`00` + id), que la web vieja
 * descartaría en silencio si es del mismo día.
 */
export async function sincronizarCorreccion(
    inscripto: Omit<InscriptoSync, 'id'>,
    urlVieja: string | null | undefined
) {
    console.log(`[SYNC-VIEJA] Corrección de datos: va una inscripción nueva para ${inscripto.nombre}`);
    return sincronizarPreinscripcion({ ...inscripto, id: null }, urlVieja);
}

export async function sincronizarPreinscripcion(
    inscripto: InscriptoSync,
    urlVieja: string | null | undefined
) {
    if (!urlVieja) return { success: false, reason: 'No URL provided' };

    console.log(`[SYNC-VIEJA] Iniciando sincronización para ${inscripto.nombre} a ${urlVieja}`);

    try {
        const idPorPath = extraerIdCursoViejo(urlVieja);
        const idDeclarado = await leerIdDeclarado(urlVieja);

        if (idDeclarado && idPorPath && idDeclarado !== idPorPath) {
            console.error(
                `[SYNC-VIEJA] ⚠️ La URL sugiere el curso ${idPorPath} pero la página declara ${idDeclarado}. ` +
                `Mando ${idDeclarado} (manda la página). Revisá cursos.url_web_vieja: ${urlVieja}`
            );
        }

        const idCurso = idDeclarado ?? idPorPath;
        const fuente = idDeclarado ? 'formulario de la página' : 'path de la URL';

        if (!idCurso) {
            console.error(
                `[SYNC-VIEJA] ❌ No pude determinar el curso, NO se sincroniza: ${urlVieja}\n` +
                `             La página no declaró id_curso y el path no tiene un único segmento numérico.\n` +
                `             Revisá cursos.url_web_vieja de este curso.`
            );
            return { success: false, reason: 'No se pudo determinar el id del curso' };
        }

        const ciSync = construirCiSync(inscripto);
        const formData = new URLSearchParams();
        formData.append('nombre', inscripto.nombre.trim());
        formData.append('ci', ciSync);
        formData.append('edad', '99'); // Genérico
        formData.append('cel', (inscripto.telefono || '090000000').trim());
        formData.append('correo', inscripto.email.trim());
        formData.append('dpto', '10'); // 10 = Montevideo
        formData.append('dir', '-'); // Genérico
        formData.append('en_curso', '4'); // 4 = Otro
        formData.append('recibir', '1');
        formData.append('submit', '');
        formData.append('id_curso', idCurso);

        // AbortController para timeout estricto
        // Importante para no bloquear las Vercel Serverless Functions
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_POST_MS);

        const response = await fetch(urlVieja, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // Simulamos ser un navegador para evitar bloqueos anti-bot de cPanel o similar
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
            },
            body: formData.toString(),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const responseHtml = await response.text().catch(() => '');
            if (esRechazoSilenciosoHtml(responseHtml)) {
                console.warn(
                    `[SYNC-VIEJA] ⚠️ Posible rechazo silencioso/duplicado en web vieja para ${inscripto.nombre} ` +
                    `(curso viejo ${idCurso}, ci ${ciSync}). Status: ${response.status}`
                );
                return { success: false, reason: 'Posible duplicado o rechazo silencioso en web vieja', idCurso, ci: ciSync };
            }
            console.log(`[SYNC-VIEJA] ✅ ${inscripto.nombre} sincronizado al curso viejo ${idCurso} (según ${fuente}, ci ${ciSync}). Status: ${response.status}`);
            return { success: true, idCurso, ci: ciSync };
        } else {
            console.warn(`[SYNC-VIEJA] ⚠️ Servidor respondió con error: ${response.status}`);
            return { success: false, status: response.status };
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.warn(`[SYNC-VIEJA] ⏳ Timeout: La web vieja tardó demasiado en responder.`);
        } else {
            console.error(`[SYNC-VIEJA] ❌ Error de red:`, error.message);
        }
        // Retornamos false pero NO lanzamos el error para no romper la app principal
        return { success: false, error: error.message };
    }
}
