import { Suspense } from 'react';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { CourseFilters, FilterOption } from '@/components/cursos/CourseFilters';
import { CourseCard, CourseCardData } from '@/components/cursos/CourseCard';
import { Pagination } from '@/components/cursos/Pagination';
import { Container } from '@/components/layout';

export const metadata: Metadata = {
    title: 'Cursos de Permacultura y Agroecología | CEUTA Uruguay',
    description: 'Explora nuestros cursos de permacultura, agroecología, bioconstrucción y huerta orgánica en Uruguay. Formación práctica y teórica con docentes expertos.',
    keywords: 'cursos permacultura uruguay, curso agroecologia montevideo, bioconstruccion uruguay, huerta organica curso',
    openGraph: {
        title: 'Cursos | CEUTA Uruguay',
        description: 'Formación en permacultura, agroecología y bioconstrucción',
        type: 'website',
    },
};

const COURSES_PER_PAGE = 9;

interface PageProps {
    searchParams: Promise<{
        categoria?: string;
        modalidad?: string;
        nivel?: string;
        page?: string;
    }>;
}


const MODALITY_OPTIONS: FilterOption[] = [
    { value: 'presencial', label: 'Presencial' },
    { value: 'virtual', label: 'Online' },
    { value: 'hibrido', label: 'Híbrido' },
];

const LEVEL_OPTIONS: FilterOption[] = [
    { value: 'basico', label: 'Básico' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' },
];

async function getCourses(filters: {
    categoria?: string;
    modalidad?: string;
    nivel?: string;
}): Promise<CourseCardData[]> {
    const supabase = await createClient();

    let query = supabase
        .from('cursos')
        .select(`
            id,
            nombre,
            slug,
            descripcion,
            precio,
            fecha_inicio,
            duracion,
            modalidad,
            lugar,
            nivel,
            categoria,
            imagen_portada,
            transformacion_hook,
            fecha_a_confirmar,
            lugar_a_confirmar,
            es_inscripcion_anticipada,
            cantidad_cuotas,
            descuento_porcentaje,
            descuento_cupos_totales,
            descuento_cupos_usados,
            descuento_etiqueta,
            descuento_fecha_fin,
            descuento_online_porcentaje,
            descuento_online_etiqueta
        `)
        .eq('activo', true)
        .order('orden', { ascending: true, nullsFirst: false })
        .order('fecha_inicio', { ascending: true, nullsFirst: false });

    // Apply filters
    if (filters.categoria) {
        query = query.ilike('categoria', `%${filters.categoria}%`);
    }
    if (filters.modalidad) {
        if (filters.modalidad === 'virtual') {
            // For online filter, include both pure virtual AND hybrid with permite_online
            query = query.or('modalidad.eq.virtual,and(modalidad.eq.hibrido,permite_online.eq.true)');
        } else {
            query = query.ilike('modalidad', `%${filters.modalidad}%`);
        }
    }
    if (filters.nivel) {
        // Use 'contains' operator for array column 'niveles'
        query = query.contains('niveles', [filters.nivel]);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching courses:', error);
        return [];
    }

    return data || [];
}

function CoursesGrid({ courses }: { courses: CourseCardData[] }) {
    if (courses.length === 0) {
        return (
            <div className="text-center py-16 bg-cream/30 rounded-lg">
                <p className="font-heading text-xl text-earth-900 mb-2">
                    No encontramos cursos con esos filtros
                </p>
                <p className="text-foreground/70">
                    Prueba ajustando los filtros o explora todos nuestros cursos
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
}

export default async function CursosPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const filters = {
        categoria: params.categoria,
        modalidad: params.modalidad,
        nivel: params.nivel,
    };
    const currentPage = Math.max(1, parseInt(params.page || '1', 10));

    const allCourses = await getCourses(filters);

    // Pagination
    const totalCourses = allCourses.length;
    const totalPages = Math.ceil(totalCourses / COURSES_PER_PAGE);
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    const paginatedCourses = allCourses.slice(startIndex, startIndex + COURSES_PER_PAGE);

    return (
        <main className="py-12 min-h-screen">
            <Container>
                {/* Page Header */}
                <div className="text-center mb-10">
                    <h1 className="font-heading text-4xl md:text-5xl font-bold text-earth-900 mb-4">
                        Nuestros Cursos
                    </h1>
                    <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                        Formación práctica y teórica en permacultura, agroecología y
                        sustentabilidad. Encuentra el curso ideal para tu camino.
                    </p>
                </div>

                {/* Filters */}
                <Suspense fallback={<div className="h-24 bg-cream/50 rounded-lg animate-pulse" />}>
                    <CourseFilters
                        modalities={MODALITY_OPTIONS}
                        levels={LEVEL_OPTIONS}
                    />
                </Suspense>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-sm text-foreground/60">
                        {totalCourses === 1
                            ? '1 curso encontrado'
                            : `${totalCourses} cursos encontrados`}
                        {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
                    </p>
                </div>

                {/* Courses Grid */}
                <CoursesGrid courses={paginatedCourses} />

                {/* Pagination */}
                <Suspense fallback={null}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </Suspense>
            </Container>
        </main>
    );
}

