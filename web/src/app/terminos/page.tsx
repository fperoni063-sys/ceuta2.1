import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { COMPANY_INFO } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'Términos y Condiciones | CEUTA Uruguay',
    description: 'Términos y condiciones de uso del sitio web y servicios educativos de CEUTA Uruguay.',
};

export default function TerminosPage() {
    const lastUpdated = '28 de abril de 2026';

    return (
        <main className="py-12 md:py-20">
            <Container>
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <Link
                            href="/"
                            className="text-green-700 hover:text-green-800 text-sm font-medium inline-flex items-center gap-1 transition-colors mb-6"
                        >
                            <span>←</span> Volver al inicio
                        </Link>
                        <h1 className="font-heading text-3xl md:text-4xl text-earth-900 mb-4">
                            Términos y Condiciones
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Última actualización: {lastUpdated}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none text-earth-900/80 space-y-8">
                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                1. Identificación del prestador
                            </h2>
                            <p>
                                {COMPANY_INFO.fullName} ({COMPANY_INFO.name}), con sede en {COMPANY_INFO.address},
                                ofrece servicios de formación y capacitación en áreas de tecnologías apropiadas,
                                agroecología, permacultura y disciplinas afines.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                2. Objeto
                            </h2>
                            <p>
                                Estos Términos y Condiciones regulan el uso del sitio web ceuta.org.uy y la relación
                                entre CEUTA y las personas que se inscriben a sus cursos y actividades de formación
                                (en adelante, &quot;el/la participante&quot;).
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                3. Inscripción y reserva de cupo
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>La inscripción se realiza a través del formulario disponible en este sitio web.</li>
                                <li>Completar el formulario de preinscripción no garantiza el cupo hasta que se confirme el pago.</li>
                                <li>El cupo queda reservado una vez que CEUTA verifica el comprobante de pago correspondiente.</li>
                                <li>Los cupos son limitados y se asignan por orden de confirmación de pago.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                4. Precios y medios de pago
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Los precios publicados están expresados en pesos uruguayos (UYU) e incluyen impuestos cuando corresponda.</li>
                                <li>CEUTA acepta los siguientes medios de pago: transferencia bancaria, Mercado Pago y efectivo (Abitab/Red Pagos).</li>
                                <li>En los cursos que ofrecen pago en cuotas, cada cuota se abona de forma manual por el/la participante. No se trata de un débito automático.</li>
                                <li>CEUTA se reserva el derecho de modificar los precios de los cursos. Los cambios no afectarán a inscripciones ya confirmadas.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                5. Cancelación y reembolso
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Cancelación por el/la participante:</strong> podés cancelar tu inscripción y solicitar
                                    un reembolso completo hasta 48 horas antes del inicio del curso, comunicándote
                                    por email a <a href={`mailto:${COMPANY_INFO.email}`} className="text-green-700 hover:underline">{COMPANY_INFO.email}</a> o
                                    por WhatsApp al {COMPANY_INFO.whatsapp.secretariaDisplay}.
                                </li>
                                <li>
                                    <strong>Cancelación posterior:</strong> las cancelaciones realizadas con menos de 48 horas de
                                    anticipación no tendrán derecho a reembolso, pero el monto abonado podrá ser aplicado
                                    como crédito para una futura edición del mismo curso u otro curso de CEUTA.
                                </li>
                                <li>
                                    <strong>Cancelación por CEUTA:</strong> en caso de que CEUTA cancele un curso por razones de fuerza
                                    mayor o cupo mínimo no alcanzado, se ofrecerá al participante el reembolso total del monto
                                    abonado o la posibilidad de transferir la inscripción a otra fecha o curso.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                6. Naturaleza del servicio
                            </h2>
                            <p>
                                Los cursos ofrecidos por CEUTA son servicios de formación y capacitación. No se trata de
                                productos físicos sujetos a envío. La entrega del servicio se realiza de forma presencial
                                en las instalaciones de CEUTA o en la modalidad indicada en la descripción de cada curso
                                (presencial, online o mixta).
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                7. Propiedad intelectual
                            </h2>
                            <p>
                                Todo el contenido de este sitio web (textos, imágenes, logos, material didáctico)
                                es propiedad de CEUTA o de sus respectivos autores y está protegido por la legislación
                                uruguaya de derechos de autor (Ley N° 9.739).
                                Queda prohibida su reproducción total o parcial sin autorización expresa.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                8. Responsabilidad
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    CEUTA se compromete a brindar el servicio educativo según lo descrito en cada curso,
                                    con docentes calificados y material adecuado.
                                </li>
                                <li>
                                    CEUTA no se responsabiliza por la aplicación que el/la participante haga de los
                                    conocimientos adquiridos fuera del ámbito del curso.
                                </li>
                                <li>
                                    La información publicada en este sitio es orientativa. CEUTA se reserva el
                                    derecho de realizar ajustes en el programa, fechas u horarios de los cursos,
                                    informando oportunamente a los/las participantes inscriptos/as.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                9. Uso del sitio web
                            </h2>
                            <p>
                                El usuario se compromete a utilizar este sitio web de manera lícita, sin realizar acciones
                                que puedan dañar, inutilizar o sobrecargar el sitio o impedir su normal funcionamiento.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                10. Legislación aplicable
                            </h2>
                            <p>
                                Estos Términos y Condiciones se rigen por la legislación de la República Oriental del Uruguay.
                                Cualquier controversia será sometida a la jurisdicción de los tribunales competentes de Montevideo.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                11. Contacto
                            </h2>
                            <p>
                                Para cualquier consulta sobre estos Términos y Condiciones, podés comunicarte con nosotros:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Email: <a href={`mailto:${COMPANY_INFO.email}`} className="text-green-700 hover:underline">{COMPANY_INFO.email}</a></li>
                                <li>WhatsApp: {COMPANY_INFO.whatsapp.secretariaDisplay}</li>
                                <li>Dirección: {COMPANY_INFO.address}</li>
                            </ul>
                        </section>

                        {/* Footer links */}
                        <div className="pt-8 border-t border-earth-900/10">
                            <p className="text-sm text-muted-foreground">
                                Consulta también nuestra{' '}
                                <Link href="/politica-privacidad" className="text-green-700 hover:underline">Política de Privacidad</Link>
                                {' '}y nuestra{' '}
                                <Link href="/politica-envios" className="text-green-700 hover:underline">Política de Entrega de Servicios</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    );
}
