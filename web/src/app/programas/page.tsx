
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Leaf, Home, Sun, Droplets, Sprout, Hammer } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Programas y Areas de Trabajo | CEUTA Uruguay',
    description: 'Conoce nuestras áreas de trabajo: Agroecología, Permacultura, Bioconstrucción, Energías Renovables y más.',
    openGraph: {
        title: 'Programas CEUTA',
        description: 'Áreas de trabajo y programas educativos.',
    },
};

const programs = [
    {
        icon: Leaf,
        title: 'Agroecología',
        description: 'Sistemas de producción de alimentos que respetan los ciclos naturales, promoviendo la biodiversidad y la soberanía alimentaria.',
        slug: 'agroecologia',
        color: 'bg-green-100 text-green-700',
    },
    {
        icon: Sprout,
        title: 'Permacultura',
        description: 'Diseño de hábitats humanos sostenibles, integrando arquitectura, agricultura y sociedad en armonía con la naturaleza.',
        slug: 'permacultura',
        color: 'bg-emerald-100 text-emerald-700',
    },
    {
        icon: Home,
        title: 'Bioconstrucción',
        description: 'Técnicas de construcción con tierra y materiales naturales, creando viviendas saludables y eficientes.',
        slug: 'bioconstruccion',
        color: 'bg-orange-100 text-orange-700',
    },
    {
        icon: Sun,
        title: 'Energías Renovables',
        description: 'Tecnologías para el aprovechamiento de fuentes de energía limpia: solar, eólica y biomasa.',
        slug: 'energia',
        color: 'bg-yellow-100 text-yellow-700',
    },
    {
        icon: Droplets,
        title: 'Plantas Medicinales',
        description: 'Rescate de saberes ancestrales sobre el uso y cultivo de plantas para la salud y el bienestar.',
        slug: 'plantas',
        color: 'bg-teal-100 text-teal-700',
    },
    {
        icon: Hammer,
        title: 'Tecnologías Apropiadas',
        description: 'Desarrollo de herramientas y técnicas sencillas, de bajo costo y bajo impacto ambiental.',
        slug: 'tecnologias',
        color: 'bg-blue-100 text-blue-700',
    },
];

export default function ProgramasPage() {
    return (
        <main className="py-12 md:py-20">
            <Container>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="font-heading text-4xl md:text-5xl text-earth-900 mb-6">
                        Nuestros Programas
                    </h1>
                    <p className="text-lg text-gray-600">
                        En CEUTA trabajamos desde un enfoque integral, abarcando diversas áreas
                        que contribuyen al desarrollo sustentable y la regeneración de nuestro entorno.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {programs.map((program) => (
                        <div
                            key={program.slug}
                            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all border border-earth-900/5 group"
                        >
                            <div className={`w-16 h-16 rounded-xl ${program.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <program.icon size={32} />
                            </div>
                            <h3 className="font-heading text-2xl text-earth-900 mb-3">
                                {program.title}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {program.description}
                            </p>
                            <Link
                                href={`/cursos?categoria=${program.slug}`}
                                className="inline-flex items-center text-sm font-bold uppercase tracking-wide text-earth-900 hover:text-accent transition-colors"
                            >
                                Ver cursos relacionados
                                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-20 bg-cream p-12 rounded-3xl text-center">
                    <h2 className="font-heading text-3xl md:text-4xl text-earth-900 mb-6">
                        ¿Te interesa formarte en estas áreas?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Ofrecemos cursos teóricos y prácticos todo el año.
                        Descubrí nuestra oferta educativa y sumate a la comunidad.
                    </p>
                    <Link
                        href="/cursos"
                        className="inline-flex items-center justify-center px-8 py-4 bg-green-700 text-white font-medium rounded-xl hover:bg-green-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Ver todos los cursos
                    </Link>
                </div>
            </Container>
        </main>
    );
}
