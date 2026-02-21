
import { Suspense } from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container'; // Lowercase fixed
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { ContactForm } from '@/components/contact/contact-form';

export const metadata: Metadata = {
    title: 'Contacto | CEUTA Uruguay',
    description: 'Comunicate con nosotros para más información sobre nuestros cursos, actividades y proyectos.',
    openGraph: {
        title: 'Contacto CEUTA',
        description: 'Estamos para responder tus consultas.',
    },
};

export default function ContactoPage() {
    return (
        <main className="py-12 md:py-20">
            <Container>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="font-heading text-4xl md:text-5xl text-earth-900 mb-6">
                        Contacto
                    </h1>
                    <p className="text-lg text-gray-600">
                        ¿Tenés dudas sobre algún curso? ¿Querés conocer más sobre nuestras propuestas?
                        Escribinos, llamanos o visitanos.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Contact Info */}
                    <div className="space-y-10">
                        <div>
                            <h2 className="font-heading text-2xl text-earth-900 mb-6">
                                Información de Contacto
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-earth-900 block mb-1">Dirección</h3>
                                        <p className="text-gray-600">
                                            Canelones 1198 (esquina Zelmar Michelini)<br />
                                            Montevideo, Uruguay
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-earth-900 block mb-1">WhatsApp</h3>
                                        <p className="text-gray-600">
                                            <a href="https://wa.me/59891431577?text=Hola!%20Estoy%20visitando%20la%20página%20de%20contacto%20de%20CEUTA%20y%20quería%20hacerles%20una%20consulta." target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">+598 91 431 577</a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-earth-900 block mb-1">Email</h3>
                                        <p className="text-gray-600">
                                            <a href="mailto:secretaria@ceuta.org.uy" className="hover:text-accent transition-colors">secretaria@ceuta.org.uy</a>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-earth-900 block mb-1">Horarios de Secretaría</h3>
                                        <p className="text-gray-600">
                                            Lunes a Viernes: 14:00 a 20:00 hs
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="rounded-2xl overflow-hidden border border-gray-200 h-64 md:h-80 bg-gray-100 relative">
                            {/* Placeholder for map - in production use an iframe or map library */}
                            <div className="absolute inset-0 flex items-center justify-center bg-cream text-earth-900/40 font-bold">
                                Mapa de Ubicación
                            </div>
                            <iframe
                                title="Mapa CEUTA"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.868779435695!2d-56.19323148476214!3d-34.90998398038165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959f81d1134704ff%3A0x6295383501a37c56!2sCanelones%201198%2C%2011100%20Montevideo%2C%20Departamento%20de%20Montevideo!5e0!3m2!1ses-419!2suy!4v1620000000000!5m2!1ses-419!2suy"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <Suspense fallback={<div className="bg-background p-8 rounded-3xl shadow-sm border border-earth-900/5 animate-pulse h-96" />}>
                        <ContactForm />
                    </Suspense>
                </div>
            </Container>
        </main>
    );
}
