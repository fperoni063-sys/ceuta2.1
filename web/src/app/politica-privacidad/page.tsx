import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { COMPANY_INFO } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'Política de Privacidad | CEUTA Uruguay',
    description: 'Política de privacidad y protección de datos personales de CEUTA Uruguay.',
};

export default function PoliticaPrivacidadPage() {
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
                            Política de Privacidad
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Última actualización: {lastUpdated}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none text-earth-900/80 space-y-8">
                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                1. Responsable del tratamiento
                            </h2>
                            <p>
                                {COMPANY_INFO.fullName} ({COMPANY_INFO.name}), con domicilio en {COMPANY_INFO.address},
                                es responsable del tratamiento de los datos personales recogidos a través de este sitio web.
                            </p>
                            <p>
                                Contacto: <a href={`mailto:${COMPANY_INFO.email}`} className="text-green-700 hover:underline">{COMPANY_INFO.email}</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                2. Datos que recopilamos
                            </h2>
                            <p>
                                Recopilamos únicamente los datos necesarios para gestionar tu inscripción a nuestros cursos y brindarte un servicio adecuado:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Nombre completo</li>
                                <li>Correo electrónico</li>
                                <li>Número de teléfono/celular</li>
                                <li>Departamento de residencia (opcional)</li>
                                <li>Datos de pago (comprobantes de transferencia)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                3. Finalidad del tratamiento
                            </h2>
                            <p>Utilizamos tus datos exclusivamente para:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Gestionar tu inscripción y participación en los cursos.</li>
                                <li>Procesar y verificar pagos.</li>
                                <li>Comunicarte información relevante sobre el curso al que te inscribiste (horarios, materiales, cambios).</li>
                                <li>Enviarte información sobre futuros cursos y actividades de CEUTA, solo si diste tu consentimiento.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                4. Base legal
                            </h2>
                            <p>
                                El tratamiento de tus datos se realiza en cumplimiento de la Ley N° 18.331 de Protección de Datos Personales
                                y Acción de Habeas Data de la República Oriental del Uruguay, y se basa en:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Tu consentimiento al completar el formulario de inscripción.</li>
                                <li>La ejecución de la relación contractual derivada de la inscripción al curso.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                5. Conservación de datos
                            </h2>
                            <p>
                                Tus datos personales se conservarán mientras dure la relación derivada de la inscripción al curso
                                y por el tiempo necesario para cumplir con obligaciones legales o contractuales.
                                Los comprobantes de pago se conservan por el plazo legal vigente.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                6. Tus derechos
                            </h2>
                            <p>
                                De acuerdo con la Ley N° 18.331, tenés derecho a:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Acceso:</strong> conocer qué datos personales tenemos sobre vos.</li>
                                <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos.</li>
                                <li><strong>Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
                                <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos para fines de marketing.</li>
                            </ul>
                            <p>
                                Para ejercer estos derechos, escribinos a{' '}
                                <a href={`mailto:${COMPANY_INFO.email}`} className="text-green-700 hover:underline">{COMPANY_INFO.email}</a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                7. Seguridad
                            </h2>
                            <p>
                                Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos personales
                                contra acceso no autorizado, pérdida o alteración. Nuestro sitio utiliza conexión segura (HTTPS)
                                y los datos se almacenan en servidores con estándares de seguridad reconocidos internacionalmente.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                8. Cookies
                            </h2>
                            <p>
                                Este sitio utiliza cookies funcionales estrictamente necesarias para el correcto funcionamiento
                                del sitio (por ejemplo, para recordar el estado de tu inscripción). No utilizamos cookies
                                de seguimiento ni compartimos información con terceros a través de cookies.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-heading text-xl font-semibold text-earth-900">
                                9. Modificaciones
                            </h2>
                            <p>
                                CEUTA se reserva el derecho de actualizar esta Política de Privacidad.
                                Cualquier cambio será publicado en esta página con la fecha de última actualización.
                            </p>
                        </section>

                        {/* Footer links */}
                        <div className="pt-8 border-t border-earth-900/10">
                            <p className="text-sm text-muted-foreground">
                                Consulta también nuestros{' '}
                                <Link href="/terminos" className="text-green-700 hover:underline">Términos y Condiciones</Link>
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
