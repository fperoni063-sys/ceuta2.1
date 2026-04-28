import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { COMPANY_INFO } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'Política de Entrega de Servicios | CEUTA Uruguay',
    description: 'Política de entrega de servicios educativos y cursos de CEUTA Uruguay.',
};

export default function PoliticaEnviosPage() {
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
                            Política de Entrega de Servicios
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Última actualización: {lastUpdated}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none text-earth-900/80 space-y-8">

                        {/* Aclaración importante */}
                        <section className="bg-green-50 border border-green-100 rounded-xl p-6">
                            <p className="text-earth-900 font-medium">
                                CEUTA ofrece servicios de formación y capacitación. No comercializamos productos físicos
                                sujetos a envío postal o logístico. La presente política describe cómo se entrega el servicio
                                educativo contratado.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                1. Tipo de servicio
                            </h2>
                            <p>
                                Los cursos y talleres ofrecidos por {COMPANY_INFO.fullName} son servicios educativos
                                presenciales que se imparten en las instalaciones de CEUTA o en la sede indicada
                                en la descripción de cada curso.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                2. Modalidad de entrega
                            </h2>
                            <p>La entrega del servicio educativo se realiza de las siguientes formas según el curso:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Cursos presenciales:</strong> se desarrollan en la sede de CEUTA
                                    ({COMPANY_INFO.address}) o en el lugar especificado en la ficha del curso.
                                    El/la participante asiste personalmente en las fechas y horarios indicados.
                                </li>
                                <li>
                                    <strong>Cursos con modalidad online:</strong> cuando se ofrezca esta modalidad,
                                    el acceso se brindará a través de plataformas digitales. Los datos de acceso se
                                    enviarán por email al correo registrado en la inscripción.
                                </li>
                                <li>
                                    <strong>Materiales complementarios:</strong> cuando el curso incluya materiales
                                    digitales (guías, presentaciones, bibliografía), estos se entregan por email o
                                    a través de un enlace de descarga compartido con los/las participantes.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                3. Confirmación y acceso al servicio
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Una vez confirmado el pago, recibirás un aviso de confirmación de tu inscripción.</li>
                                <li>Antes del inicio del curso, CEUTA te enviará la información necesaria para asistir (dirección exacta, horarios, materiales requeridos).</li>
                                <li>El plazo de confirmación de pago es de hasta 48 horas hábiles luego de recibido el comprobante.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                4. Plazos
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Confirmación de inscripción:</strong> hasta 48 horas hábiles después de recibir
                                    el comprobante de pago.
                                </li>
                                <li>
                                    <strong>Envío de información del curso:</strong> al menos 48 horas antes del inicio del curso.
                                </li>
                                <li>
                                    <strong>Materiales digitales:</strong> disponibles al inicio del curso o según el
                                    cronograma indicado por el/la docente.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                5. Cancelaciones y reprogramaciones
                            </h2>
                            <p>
                                Para información sobre cancelaciones, reembolsos y reprogramaciones, consultá nuestros{' '}
                                <Link href="/terminos" className="text-green-700 hover:underline">Términos y Condiciones</Link>,
                                sección 5 (Cancelación y reembolso).
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                6. Contacto
                            </h2>
                            <p>
                                Ante cualquier consulta sobre la entrega de nuestros servicios educativos:
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
                                {' '}y nuestros{' '}
                                <Link href="/terminos" className="text-green-700 hover:underline">Términos y Condiciones</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    );
}
