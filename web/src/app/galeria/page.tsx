
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Galería de Fotos | CEUTA Uruguay',
    description: 'Imágenes de nuestras actividades, cursos, talleres y la vida cotidiana en CEUTA.',
    openGraph: {
        title: 'Galería CEUTA',
        description: 'Momentos compartidos en nuestra comunidad de aprendizaje.',
    },
};

const images = [
    {
        src: 'https://images.unsplash.com/photo-1591857177580-dc82b9e4e5c5?w=800&q=80',
        alt: 'Estudiantes trabajando en la huerta',
        span: 'row-span-2',
    },
    {
        src: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=800&q=80',
        alt: 'Taller de bioconstrucción',
        span: 'row-span-1',
    },
    {
        src: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80',
        alt: 'Cosecha de vegetales orgánicos',
        span: 'row-span-1',
    },
    {
        src: 'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=800&q=80',
        alt: 'Clase teórica en el salón',
        span: 'row-span-1',
    },
    {
        src: 'https://images.unsplash.com/photo-1622383563227-04401bb4583e?w=800&q=80',
        alt: 'Instalación de panel solar',
        span: 'row-span-2',
    },
    {
        src: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
        alt: 'Grupo de permacultura',
        span: 'row-span-1',
    },
    {
        src: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80',
        alt: 'Preparación de remedios naturales',
        span: 'row-span-1',
    },
    {
        src: 'https://images.unsplash.com/photo-1621451968536-bb1e0ecc8295?w=800&q=80',
        alt: 'Compostaje comunitario',
        span: 'row-span-1',
    },
];

export default function GaleriaPage() {
    return (
        <main className="py-12 md:py-20">
            <Container>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="font-heading text-4xl md:text-5xl text-earth-900 mb-6">
                        Galería
                    </h1>
                    <p className="text-lg text-gray-600">
                        Un recorrido visual por nuestras actividades. Aprendizaje,
                        trabajo en equipo y conexión con la naturaleza.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[250px]">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`relative rounded-xl overflow-hidden group hover:shadow-xl transition-shadow ${image.span}`}
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                <p className="text-white font-medium text-lg">
                                    {image.alt}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </main>
    );
}
