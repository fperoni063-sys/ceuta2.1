import { CourseVideo } from '@/components/cursos/CourseVideo';

/**
 * Lo primero que se lee: qué es el curso y si es para vos.
 *
 * Por qué existe: en celular la tarjeta de precio venía inmediatamente después
 * del título, así que a alguien que llegaba de un anuncio se le cotizaba antes
 * de contarle qué se llevaba. El `transformacion_hook` —el mejor texto que tiene
 * el sitio— quedaba a ~1.000px, debajo del precio y del botón.
 *
 * El orden es promesa -> "¿es para mí?" -> precio. El precio no se esconde: pasa
 * de la primera a la segunda pantalla, que es donde puede compararse contra algo.
 * "¿Qué vas a lograr?" queda abajo a propósito: es el detalle que justifica el
 * precio una vez que la persona ya decidió que le interesa, y ocupa demasiado
 * alto como para meterlo antes.
 */
export function CourseIntro({
    videoUrl,
    hook,
    publicoObjetivo,
}: {
    videoUrl?: string | null;
    hook?: string | null;
    publicoObjetivo?: string[] | null;
}) {
    const tienePublico = Array.isArray(publicoObjetivo) && publicoObjetivo.length > 0;

    // Sin nada que decir no dejamos una fila vacía en la grilla.
    if (!videoUrl && !hook && !tienePublico) return null;

    return (
        <div className="space-y-6">
            {videoUrl && (
                <section>
                    <CourseVideo videoUrl={videoUrl} />
                </section>
            )}

            {hook && (
                <p className="text-lg leading-relaxed text-earth-900 sm:text-xl">
                    {hook}
                </p>
            )}

            {tienePublico && (
                <section>
                    <h2 className="font-heading text-xl font-bold text-earth-900 mb-3 sm:text-2xl">
                        ¿Para quién es este curso?
                    </h2>
                    <ul className="space-y-2.5">
                        {publicoObjetivo!.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <span className="text-lg leading-tight" aria-hidden="true">🎯</span>
                                <span className="text-base text-foreground/80 sm:text-lg">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
