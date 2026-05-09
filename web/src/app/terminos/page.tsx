import { Container } from '@/components/layout';

export const metadata = {
    title: 'Términos y Condiciones | CEUTA Uruguay',
    description: 'Términos y condiciones de uso de los servicios educativos de CEUTA Uruguay.',
};

export default function TerminosPage() {
    return (
        <Container>
            <div className="max-w-3xl mx-auto py-16 prose prose-lg dark:prose-invert">
                <h1>Términos y Condiciones</h1>
                <p className="text-sm text-gray-500">Última actualización: Mayo 2026</p>

                <h2>1. Aceptación</h2>
                <p>
                    Al inscribirte en cualquier curso o servicio de CEUTA Uruguay,
                    aceptás estos términos y condiciones.
                </p>

                <h2>2. Servicios</h2>
                <p>
                    CEUTA ofrece cursos, talleres y formaciones en permacultura,
                    bioconstrucción, agroecología y huerta orgánica, en modalidad
                    presencial, online o híbrida.
                </p>

                <h2>3. Inscripciones y Pagos</h2>
                <ul>
                    <li>La inscripción se realiza a través de nuestro sitio web.</li>
                    <li>Los pagos se pueden realizar por transferencia bancaria, Mercado Pago o tarjeta de crédito/débito.</li>
                    <li>El cupo queda reservado una vez confirmado el pago.</li>
                </ul>

                <h2>4. Cancelaciones y Reembolsos</h2>
                <p>
                    Podés cancelar tu inscripción y solicitar un reembolso completo hasta
                    antes del inicio del curso. Una vez iniciado el curso, no se realizan
                    reembolsos.
                </p>

                <h2>5. Propiedad Intelectual</h2>
                <p>
                    Todo el material didáctico proporcionado es propiedad de CEUTA Uruguay.
                    No está permitida su reproducción o distribución sin autorización.
                </p>

                <h2>6. Contacto</h2>
                <p>
                    Para consultas: info@ceuta.org.uy | WhatsApp: +598 98 910 715
                </p>
            </div>
        </Container>
    );
}
