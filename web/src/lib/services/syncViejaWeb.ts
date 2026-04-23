export async function sincronizarPreinscripcion(inscripto: { nombre: string; email: string; telefono?: string }, urlVieja: string | null | undefined) {
    if (!urlVieja) return { success: false, reason: 'No URL provided' };

    console.log(`[SYNC-VIEJA] Iniciando sincronización para ${inscripto.nombre} a ${urlVieja}`);

    try {
        // Extraer ID del curso de la URL (ej: /calendario/200/...)
        const idMatch = urlVieja.match(/\/calendario\/(\d+)\//);
        const idCurso = idMatch ? idMatch[1] : '200'; // Default 200 si no se encuentra
        
        const formData = new URLSearchParams();
        formData.append('nombre', inscripto.nombre);
        formData.append('ci', '00000000'); // Genérico porque aún no lo tenemos (Paso 1)
        formData.append('edad', '99'); // Genérico
        formData.append('cel', inscripto.telefono || '090000000');
        formData.append('correo', inscripto.email);
        formData.append('dpto', '10'); // 10 = Montevideo
        formData.append('dir', '-'); // Genérico
        formData.append('en_curso', '4'); // 4 = Otro
        formData.append('recibir', '1');
        formData.append('submit', '');
        formData.append('id_curso', idCurso);

        // AbortController para timeout estricto de 4 segundos
        // Importante para no bloquear las Vercel Serverless Functions
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

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
            console.log(`[SYNC-VIEJA] ✅ Éxito: Sincronizado correctamente al ID ${idCurso}. Status: ${response.status}`);
            return { success: true };
        } else {
            console.warn(`[SYNC-VIEJA] ⚠️ Servidor respondió con error: ${response.status}`);
            return { success: false, status: response.status };
        }
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.warn(`[SYNC-VIEJA] ⏳ Timeout: La web vieja tardó más de 4 segundos en responder.`);
        } else {
            console.error(`[SYNC-VIEJA] ❌ Error de red:`, error.message);
        }
        // Retornamos false pero NO lanzamos el error para no romper la app principal
        return { success: false, error: error.message };
    }
}
