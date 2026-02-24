import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Phone, BookOpen, Award, Users } from 'lucide-react';
import { FAQSection } from '@/components/cursos/FAQSection';
import { ProgramaSection } from '@/components/cursos/ProgramaSection';
import { FAQ, ProgramaClase } from '@/types/db';
import { PriceDisplay, DiscountBadge } from '@/components/cursos/PriceDisplay';
import { CourseSidebarClient } from '@/components/cursos/CourseSidebarClient';
import { CourseTracker } from '@/components/analytics/CourseTracker';

interface Docente {
    nombre: string;
    descripcion: string | null;
    foto_url: string | null;
}

interface CourseFullData {
    id: number;
    nombre: string;
    slug: string;
    descripcion: string | null;
    // contenido: string | null; -- ELIMINADO: ahora se usa programa_clases
    precio: number | null;
    fecha_inicio: string | null;
    duracion: string | null;
    modalidad: string | null;
    lugar: string | null;
    nivel: string | null;
    niveles: string[] | null;
    categoria: string | null;
    imagen_portada: string | null;
    imagen_hero: string | null;
    docentes: Docente | null; // Joined relation
    dia_teorico: string | null;
    horario_teorico: string | null;
    dia_practico: string | null;
    horario_practico: string | null;
    transformacion_hook: string | null;
    certificacion: string | null;
    link_mercado_pago: string | null;

    // New fields
    fecha_a_confirmar: boolean;
    lugar_a_confirmar: boolean;
    departamento_probable: string | null;
    es_inscripcion_anticipada: boolean;
    cantidad_cuotas: number;
    teoricas_presenciales: boolean;
    permite_online: boolean;
    precio_online: number | null;

    // Discount fields
    descuento_porcentaje: number | null;
    descuento_cupos_totales: number | null;
    descuento_cupos_usados: number;
    descuento_etiqueta: string | null;
    descuento_fecha_fin: string | null;
    descuento_online_porcentaje: number | null;
    descuento_online_etiqueta: string | null;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getCourse(slug: string): Promise<CourseFullData | null> {
    const supabase = await createClient();

    // First try to find by slug
    let { data, error } = await supabase
        .from('cursos')
        .select(`
            *,
            docentes:docente_id (
                nombre,
                descripcion,
                foto_url
            )
        `)
        .eq('slug', slug)
        .eq('activo', true)
        .single();

    // If not found by slug, try by id (for backwards compatibility)
    if (error || !data) {
        const numericId = parseInt(slug, 10);
        if (!isNaN(numericId)) {
            const result = await supabase
                .from('cursos')
                .select(`
                    *,
                    docentes:docente_id (
                        nombre,
                        descripcion,
                        foto_url
                    )
                `)
                .eq('id', numericId)
                .eq('activo', true)
                .single();
            data = result.data;
            error = result.error;
        }
    }

    if (error || !data) {
        return null;
    }

    return data;
}

interface RelatedCourse {
    id: number;
    nombre: string;
    slug: string | null;
    imagen_portada: string | null;
    precio: number | null;
    categoria: string | null;

    // Discount fields
    cantidad_cuotas: number;
    descuento_porcentaje: number | null;
    descuento_cupos_totales: number | null;
    descuento_cupos_usados: number;
    descuento_etiqueta: string | null;
    descuento_fecha_fin: string | null;
}

async function getRelatedCourses(categoria: string | null, excludeId: number): Promise<RelatedCourse[]> {
    if (!categoria) return [];

    const supabase = await createClient();

    const { data } = await supabase
        .from('cursos')
        .select(`
            id, 
            nombre, 
            slug, 
            imagen_portada, 
            precio, 
            categoria,
            cantidad_cuotas,
            descuento_porcentaje,
            descuento_cupos_totales,
            descuento_cupos_usados,
            descuento_etiqueta,
            descuento_fecha_fin
        `)
        .eq('activo', true)
        .ilike('categoria', `%${categoria}%`)
        .neq('id', excludeId)
        .limit(3);

    return data || [];
}

async function getFAQs(cursoId: number): Promise<FAQ[]> {
    const supabase = await createClient();

    // Obtener FAQs del curso específico + FAQs globales
    const { data, error } = await supabase
        .from('faqs_cursos')
        .select('*')
        .eq('activo', true)
        .or(`curso_id.eq.${cursoId},curso_id.is.null`)
        .order('orden', { ascending: true });

    if (error) {
        console.error('Error fetching FAQs:', error);
        return [];
    }

    return data || [];
}

async function getPrograma(cursoId: number): Promise<ProgramaClase[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('programa_clases')
        .select('*')
        .eq('curso_id', cursoId)
        .eq('activo', true)
        .order('orden', { ascending: true });

    if (error) {
        console.error('Error fetching programa:', error);
        return [];
    }

    return data || [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const curso = await getCourse(slug);

    if (!curso) {
        return {
            title: 'Curso no encontrado | CEUTA Uruguay',
        };
    }

    return {
        title: `${curso.nombre} | Cursos CEUTA Uruguay`,
        description: curso.transformacion_hook || curso.descripcion || `Aprende ${curso.nombre} con CEUTA Uruguay. ${curso.duracion || ''} ${curso.modalidad || ''}`,
        keywords: `${curso.categoria || 'permacultura'}, ${curso.nombre}, curso uruguay, ${curso.lugar || 'montevideo'}`,
        openGraph: {
            title: curso.nombre,
            description: curso.transformacion_hook || curso.descripcion || 'Formación en CEUTA Uruguay',
            images: curso.imagen_portada ? [curso.imagen_portada] : [],
            type: 'website',
        },
    };
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-UY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatPrice(price: number | null): string {
    if (!price) return 'Consultar';
    return new Intl.NumberFormat('es-UY', {
        style: 'currency',
        currency: 'UYU',
        minimumFractionDigits: 0,
    }).format(price);
}

function CourseHeader({ curso }: { curso: CourseFullData }) {
    // Priority: imagen_hero > imagen_portada > elegant fallback
    const heroImage = curso.imagen_hero || curso.imagen_portada;

    return (
        <div className="relative">
            {/* Hero Image con título integrado */}
            <div className="relative h-[240px] md:h-[320px] w-full overflow-hidden">
                {heroImage ? (
                    <Image
                        src={heroImage}
                        alt={curso.nombre}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    /* Elegant fallback - earth tones with side margins */
                    <div className="w-full h-full relative bg-earth-800">
                        {/* Side bars for letterbox effect */}
                        <div className="absolute inset-y-0 left-0 w-[10%] bg-earth-900/60" />
                        <div className="absolute inset-y-0 right-0 w-[10%] bg-earth-900/60" />
                        {/* Subtle texture and branding */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white/5 font-heading text-[8rem] md:text-[12rem] tracking-[0.3em] select-none">
                                CEUTA
                            </span>
                        </div>
                    </div>
                )}

                {/* Title Container - ahora DENTRO de la imagen */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <Container>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {curso.categoria && (
                                <Badge variant="default">{curso.categoria}</Badge>
                            )}
                            {curso.modalidad && (
                                <Badge variant="secondary">{curso.modalidad}</Badge>
                            )}
                            {curso.nivel && (
                                <Badge variant="accent">{curso.nivel}</Badge>
                            )}
                        </div>
                        <h1 className="font-heading text-xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                            {curso.nombre}
                        </h1>
                        {curso.es_inscripcion_anticipada && (
                            <div className="mt-3 inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-lg transform hover:scale-105 transition-transform">
                                <span className="animate-pulse">✨</span>
                                ¡Inscripciones Anticipadas Abiertas!
                            </div>
                        )}
                    </Container>
                </div>
            </div>
        </div>
    );
}

function CourseSidebar({ curso }: { curso: CourseFullData }) {
    // Nota: CourseSidebarClient es un componente 'use client', se importa arriba
    // y se usa directamente aquí. No usar require() porque causa hydration mismatches.
    return (
        <CourseSidebarClient
            curso={{
                id: curso.id,
                nombre: curso.nombre,
                precio: curso.precio,
                cantidad_cuotas: curso.cantidad_cuotas,
                duracion: curso.duracion,
                lugar: curso.lugar,
                lugar_a_confirmar: curso.lugar_a_confirmar,
                departamento_probable: curso.departamento_probable,
                fecha_inicio: curso.fecha_inicio,
                fecha_a_confirmar: curso.fecha_a_confirmar,
                link_mercado_pago: curso.link_mercado_pago,
                modalidad: curso.modalidad,
                permite_online: curso.permite_online,
                precio_online: curso.precio_online,
                // Discount fields
                descuento_porcentaje: curso.descuento_porcentaje,
                descuento_cupos_totales: curso.descuento_cupos_totales,
                descuento_cupos_usados: curso.descuento_cupos_usados ?? 0,
                descuento_etiqueta: curso.descuento_etiqueta,
                descuento_online_porcentaje: curso.descuento_online_porcentaje,
                descuento_online_etiqueta: curso.descuento_online_etiqueta,
                descuento_fecha_fin: curso.descuento_fecha_fin,
            }}
        />
    );
}

function CourseContent({ curso, programa }: { curso: CourseFullData; programa: ProgramaClase[] }) {
    return (
        <div className="space-y-8">
            {/* Transformation Hook */}
            {curso.transformacion_hook && (
                <div className="bg-cream/20 rounded-lg p-6 border-l-4 border-green-700">
                    <p className="text-lg text-earth-900 font-medium italic">
                        {curso.transformacion_hook}
                    </p>
                </div>
            )}

            {/* Description */}
            {curso.descripcion && (
                <section>
                    <h2 className="font-heading text-2xl font-bold text-earth-900 mb-4">
                        Descripción del Curso
                    </h2>
                    <div className="prose prose-lg max-w-none text-foreground/80">
                        {curso.descripcion.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>
                </section>
            )}

            {/* Schedule */}
            {(curso.dia_teorico || curso.dia_practico) && (
                <section>
                    <h2 className="font-heading text-2xl font-bold text-earth-900 mb-4">
                        Horarios
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {curso.dia_teorico && (
                            <div className="bg-cream/20 rounded-lg p-4">
                                <h3 className="font-semibold text-earth-900 mb-2">Clases Teóricas</h3>
                                <p className="text-earth-900/70">{curso.dia_teorico}</p>
                                {curso.horario_teorico && (
                                    <p className="text-earth-900/70">{curso.horario_teorico}</p>
                                )}
                            </div>
                        )}
                        {curso.dia_practico && (
                            <div className="bg-cream/20 rounded-lg p-4">
                                <h3 className="font-semibold text-earth-900 mb-2">Clases Prácticas</h3>
                                <p className="text-earth-900/70">{curso.dia_practico}</p>
                                {curso.horario_practico && (
                                    <p className="text-earth-900/70">{curso.horario_practico}</p>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Programa del Curso */}
            {programa.length > 0 && (
                <ProgramaSection
                    clases={programa}
                    diaTeortico={curso.dia_teorico}
                    horarioTeorico={curso.horario_teorico}
                    diaPractico={curso.dia_practico}
                    horarioPractico={curso.horario_practico}
                    teoricasPresenciales={curso.teoricas_presenciales}
                />
            )}

            {/* Certification */}
            {/* Target Audience and Prerequisites removed */}
            {curso.certificacion && (
                <section>
                    <h2 className="font-heading text-2xl font-bold text-earth-900 mb-4 flex items-center gap-2">
                        <Award className="w-6 h-6 text-green-700" />
                        Certificación
                    </h2>
                    <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
                        <p className="text-earth-900">{curso.certificacion}</p>
                    </div>
                </section>
            )}

            {/* Teacher Section */}
            {curso.docentes && (
                <section className="bg-background rounded-xl shadow-sm border border-earth-900/10 p-6 md:p-8">
                    <h2 className="font-heading text-2xl font-bold text-earth-900 mb-6 flex items-center gap-2">
                        <User className="w-6 h-6 text-green-700" />
                        Docente
                    </h2>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-green-50 flex-shrink-0">
                            {curso.docentes.foto_url ? (
                                <Image
                                    src={curso.docentes.foto_url}
                                    alt={curso.docentes.nombre}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    <User className="w-12 h-12" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-earth-900 mb-2">{curso.docentes.nombre}</h3>
                            <div className="prose prose-sm text-foreground/80">
                                {curso.docentes.descripcion && curso.docentes.descripcion.split('\n').map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

function RelatedCourses({ courses }: { courses: RelatedCourse[] }) {
    if (courses.length === 0) return null;

    return (
        <section className="mt-16 pt-12 border-t border-earth-900/10">
            <Container>
                <h2 className="font-heading text-3xl font-bold text-earth-900 mb-8 text-center">
                    Cursos Relacionados
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Link
                            key={course.id}
                            href={`/cursos/${course.slug || course.id}`}
                            className="group bg-background rounded-lg shadow-sm border border-earth-900/10 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="relative h-40 overflow-hidden">
                                {course.imagen_portada ? (
                                    <Image
                                        src={course.imagen_portada}
                                        alt={course.nombre}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-green-700/20 to-earth-900/10" />
                                )}
                                <div className="absolute top-2 left-2">
                                    <DiscountBadge
                                        porcentaje={course.descuento_porcentaje}
                                        etiqueta={course.descuento_etiqueta}
                                        className="shadow-sm text-xs px-2 py-0.5"
                                    />
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-heading font-semibold text-earth-900 group-hover:text-green-700 transition-colors">
                                    {course.nombre}
                                </h3>
                                <div className="mt-2 text-left">
                                    <PriceDisplay
                                        precioOriginal={course.precio || 0}
                                        cantidadCuotas={course.cantidad_cuotas}
                                        descuentoPorcentaje={course.descuento_porcentaje}
                                        descuentoCuposTotales={course.descuento_cupos_totales}
                                        descuentoCuposUsados={course.descuento_cupos_usados}
                                        descuentoEtiqueta={null}
                                        descuentoFechaFin={course.descuento_fecha_fin}
                                        variant="card"
                                        className="items-start"
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    );
}

export default async function CourseDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const curso = await getCourse(slug);

    if (!curso) {
        notFound();
    }

    const relatedCourses = await getRelatedCourses(curso.categoria, curso.id);
    const faqs = await getFAQs(curso.id);
    const programa = await getPrograma(curso.id);

    return (
        <main className="pb-16">
            <CourseTracker courseId={curso.id} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Course",
                        name: curso.nombre,
                        description: curso.descripcion,
                        provider: {
                            "@type": "Organization",
                            name: "CEUTA Uruguay",
                            sameAs: "https://ceuta.org.uy",
                        },
                        offers: {
                            "@type": "Offer",
                            price: curso.precio,
                            priceCurrency: "UYU",
                            category: "Paid",
                        },
                        hasCourseInstance: {
                            "@type": "CourseInstance",
                            courseMode:
                                curso.modalidad?.toLowerCase() === "online"
                                    ? "online"
                                    : curso.modalidad?.toLowerCase() === "hibrido"
                                        ? "blended"
                                        : "onsite",
                            startDate: curso.fecha_inicio,
                            location: curso.lugar,
                            courseWorkload: curso.duracion,
                        },
                        image: curso.imagen_portada,
                    }).replace(/<\/script>/g, '<\\/script>'),
                }}
            />
            {/* Header with Image */}
            <CourseHeader curso={curso} />

            {/* Main Content */}
            <Container>
                <div className="grid lg:grid-cols-3 gap-8 mt-8">
                    {/* Content Column */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <CourseContent curso={curso} programa={programa} />
                    </div>

                    {/* Sidebar Column */}
                    <div className="order-1 lg:order-2">
                        <CourseSidebar curso={curso} />
                    </div>
                </div>
            </Container>

            {/* FAQs Section */}
            {faqs.length > 0 && (
                <Container>
                    <FAQSection faqs={faqs} />
                </Container>
            )}

            {/* Related Courses */}
            <RelatedCourses courses={relatedCourses} />
        </main>
    );
}
