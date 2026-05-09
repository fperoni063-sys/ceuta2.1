import { Container } from '@/components/layout';

export const metadata = {
    title: 'Política de Envíos | CEUTA Uruguay',
    description: 'Política de entrega de servicios educativos de CEUTA Uruguay.',
};

export default function PoliticaEnviosPage() {
    return (
        <Container>
            <div className="max-w-3xl mx-auto py-16 prose prose-lg dark:prose-invert">
                <h1>Política de Envíos y Entrega de Servicios</h1>
                <p className="text-sm text-gray-500">Última actualización: Mayo 2026</p>

                <h2>Naturaleza del Servicio</h2>
                <p>
                    CEUTA Uruguay ofrece servicios educativos (cursos, talleres y formaciones).
                    No realizamos envío de productos físicos. La &quot;entrega&quot; de nuestros servicios
                    se realiza mediante el acceso a clases presenciales y/o virtuales.
                </p>

                <h2>Acceso a los Cursos</h2>
                <ul>
                    <li><strong>Cursos presenciales:</strong> Se accede asistiendo al lugar y horario indicado en la descripción del curso.</li>
                    <li><strong>Cursos online:</strong> Se envían los datos de acceso (link de videollamada) al email registrado, previo al inicio del curso.</li>
                    <li><strong>Cursos híbridos:</strong> Combinan acceso presencial y virtual según el cronograma.</li>
                </ul>

                <h2>Confirmación de Inscripción</h2>
                <p>
                    Una vez verificado el pago, recibirás un email de confirmación con toda la
                    información necesaria para acceder al curso.
                </p>

                <h2>Contacto</h2>
                <p>
                    Para consultas sobre el acceso a tu curso, contactanos por WhatsApp al
                    +598 98 910 715 o por email a info@ceuta.org.uy.
                </p>
            </div>
        </Container>
    );
}
