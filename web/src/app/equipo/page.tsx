
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Linkedin, Mail } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Equipo | CEUTA Uruguay',
    description: 'Conoce al equipo de CEUTA. Docentes expertos en permacultura, agroecología y sustentabilidad comprometidos con la educación transformadora.',
    openGraph: {
        title: 'Equipo CEUTA',
        description: 'Nuestro equipo docente y administrativo.',
        images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80'],
    },
};

const team = [
    {
        name: 'Gerardo Honty',
        role: 'Coordinador General / Energía',
        bio: 'Experto en energías renovables y cambio climático. Investigador y docente con más de 20 años de experiencia en políticas energéticas en América Latina.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    },
    {
        name: 'Ana Laura Rodríguez',
        role: 'Coordinadora Agroecología',
        bio: 'Ingeniera Agrónoma especializada en sistemas productivos sustentables. Docente de huerta orgánica y diseño de predios agroecológicos.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
    },
    {
        name: 'Carlos Pérez',
        role: 'Docente Bioconstrucción',
        bio: 'Arquitecto especializado en construcción con tierra. Ha dirigido proyectos de vivienda sustentable en todo el país.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80',
    },
    {
        name: 'Julia Méndez',
        role: 'Secretaria Académica',
        bio: 'El corazón de CEUTA. Encargada de la gestión de cursos, alumnos y administración general del centro.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80',
    },
    {
        name: 'Martín García',
        role: 'Docente Permacultura',
        bio: 'Diseñador de permacultura certificado. Facilita procesos grupales y diseño de sistemas humanos y productivos regenerativos.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
    },
    {
        name: 'Lucía Fernández',
        role: 'Docente Plantas Medicinales',
        bio: 'Herborista y terapeuta floral. Comparte saberes sobre el reconocimiento, cultivo y uso de plantas medicinales nativas.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
    },
];

export default function EquipoPage() {
    return (
        <main className="py-12 md:py-20">
            <Container>
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="font-heading text-4xl md:text-5xl text-earth-900 mb-6">
                        Nuestro Equipo
                    </h1>
                    <p className="text-lg text-gray-600">
                        CEUTA está formado por un grupo interdisciplinario de profesionales
                        apasionados por la sustentabilidad y la educación.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {team.map((member) => (
                        <div key={member.name} className="group">
                            <div className="relative aspect-[4/5] mb-6 overflow-hidden rounded-2xl bg-cream">
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-earth-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                    <div className="flex gap-4 text-white">
                                        <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                            <Mail size={20} />
                                        </button>
                                        <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                            <Linkedin size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-heading text-2xl text-earth-900 mb-1">
                                {member.name}
                            </h3>
                            <p className="text-green-700 font-medium mb-3 uppercase tracking-wide text-sm">
                                {member.role}
                            </p>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {member.bio}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Join Team CTA */}
                <div className="mt-24 bg-earth-900/5 rounded-3xl p-12 text-center">
                    <h2 className="font-heading text-3xl text-earth-900 mb-4">
                        ¿Querés enseñar con nosotros?
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Siempre estamos buscando nuevos talentos y propuestas educativas alineadas
                        con nuestros valores. Envianos tu CV y propuesta.
                    </p>
                    <a
                        href="/contacto"
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-earth-900 text-earth-900 font-bold rounded-xl hover:bg-earth-900 hover:text-white transition-colors"
                    >
                        Contactar
                    </a>
                </div>
            </Container>
        </main>
    );
}
