
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { FileText, Download, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Publicaciones y Recursos | CEUTA Uruguay',
    description: 'Accede a documentos, manuales e informes sobre agroecología, permacultura, y tecnologías apropiadas generados por CEUTA.',
    openGraph: {
        title: 'Publicaciones CEUTA',
        description: 'Recursos educativos y técnicos gratuitos.',
    },
};

const publications = [
    {
        title: 'Manual de Huerta Orgánica',
        type: 'PDF',
        size: '2.4 MB',
        year: '2023',
        description: 'Guía práctica para el diseño, siembra y mantenimiento de huertas familiares y comunitarias en Uruguay.',
        image: 'https://images.unsplash.com/photo-1596727147705-54a9d0c609c5?w=500&q=80',
        url: '#',
    },
    {
        title: 'Bioconstrucción en Clima Templado',
        type: 'PDF',
        size: '5.1 MB',
        year: '2022',
        description: 'Análisis de técnicas de construcción con tierra y su comportamiento térmico en el clima uruguayo.',
        image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500&q=80',
        url: '#',
    },
    {
        title: 'Energía Solar Térmica: Guía de Instalación',
        type: 'Manual',
        size: '3.8 MB',
        year: '2021',
        description: 'Paso a paso para la instalación de colectores solares de agua caliente sanitaria.',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80',
        url: '#',
    },
    {
        title: 'Informe Anual de Actividades 2023',
        type: 'Informe',
        size: '1.2 MB',
        year: '2024',
        description: 'Resumen de los proyectos, cursos e impacto social de CEUTA durante el último año.',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80',
        url: '#',
    },
    {
        title: 'Catálogo de Plantas Medicinales Nativas',
        type: 'Libro Digital',
        size: '15 MB',
        year: '2020',
        description: 'Enciclopedia visual de 50 plantas medicinales autóctonas del Uruguay y sus usos.',
        image: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=500&q=80',
        url: '#',
    },
];

export default function PublicacionesPage() {
    return (
        <main className="py-12 md:py-20">
            <Container>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="font-heading text-4xl md:text-5xl text-earth-900 mb-6">
                        Publicaciones y Recursos
                    </h1>
                    <p className="text-lg text-gray-600">
                        Compartimos conocimiento para democratizar el acceso a tecnologías apropiadas.
                        Descargá nuestros materiales de forma gratuita.
                    </p>
                </div>

                <div className="space-y-6">
                    {publications.map((pub, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-8 hover:shadow-lg transition-shadow items-start"
                        >
                            <div className="w-full md:w-48 aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                <Image
                                    src={pub.image}
                                    alt={pub.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-grow">
                                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                        {pub.type}
                                    </span>
                                    <span>{pub.year}</span>
                                    <span>•</span>
                                    <span>{pub.size}</span>
                                </div>
                                <h3 className="font-heading text-2xl text-earth-900 mb-3">
                                    {pub.title}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl">
                                    {pub.description}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="inline-flex items-center gap-2 px-6 py-2 bg-earth-900 text-white rounded-lg hover:bg-earth-800 transition-colors font-medium">
                                        <Download size={18} />
                                        Descargar PDF
                                    </button>
                                    <button className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                                        <ExternalLink size={18} />
                                        Leer online
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </main>
    );
}

import Image from 'next/image';
