
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { createClient } from '@/lib/supabase/server';
import { Calendar as CalendarIcon, Clock, MapPin, ArrowRight, Sparkles, Bell } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const metadata: Metadata = {
    title: 'Calendario de Cursos | CEUTA Uruguay',
    description: 'Próximos inicios de cursos y talleres en CEUTA. Inscribite y asegurá tu lugar.',
    openGraph: {
        title: 'Calendario CEUTA',
        description: 'Fechas de próximos cursos.',
    },
};

interface Course {
    id: number;
    nombre: string;
    slug: string;
    fecha_inicio: string | null;
    fecha_a_confirmar: boolean;
    duracion: string | null;
    modalidad: string;
    lugar: string | null;
    departamento_probable: string | null;
    descripcion: string | null;
}

async function getUpcomingCourses(): Promise<{ confirmed: Course[]; upcoming: Course[] }> {
    const supabase = await createClient();

    const { data: courses, error } = await supabase
        .from('cursos')
        .select(`
            id,
            nombre,
            slug,
            fecha_inicio,
            fecha_a_confirmar,
            duracion,
            modalidad,
            lugar,
            departamento_probable,
            descripcion
        `)
        .eq('activo', true)
        .order('fecha_inicio', { ascending: true, nullsFirst: false });

    if (error) {
        console.error('Error fetching courses:', error);
        return { confirmed: [], upcoming: [] };
    }

    const allCourses = (courses || []) as Course[];
    const now = new Date();

    // Separate confirmed courses (with date and not "a confirmar") from upcoming (to be confirmed)
    const confirmed = allCourses.filter(course =>
        course.fecha_inicio &&
        !course.fecha_a_confirmar &&
        parseLocalDate(course.fecha_inicio) >= now
    );

    const upcoming = allCourses.filter(course =>
        course.fecha_a_confirmar === true
    );

    return { confirmed, upcoming };
}

/**
 * Parse a date string safely, treating it as a local date (not UTC).
 * This prevents timezone offset issues where dates shift by one day.
 */
function parseLocalDate(dateString: string): Date {
    // If it's a date-only string (YYYY-MM-DD), treat as local time
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    // Otherwise use parseISO which handles ISO strings better
    return parseISO(dateString);
}
function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getModalidadLabel(modalidad: string): string {
    const labels: Record<string, string> = {
        'presencial': 'Presencial',
        'virtual': 'Online',
        'hibrido': 'Híbrido'
    };
    return labels[modalidad] || modalidad;
}

export default async function CalendarioPage() {
    const { confirmed, upcoming } = await getUpcomingCourses();

    // Group confirmed courses by month
    const coursesByMonth = confirmed.reduce((acc: Record<string, Course[]>, course) => {
        if (!course.fecha_inicio) return acc;

        const date = parseLocalDate(course.fecha_inicio);
        const monthKey = format(date, 'MMMM yyyy', { locale: es });

        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(course);
        return acc;
    }, {});

    const months = Object.keys(coursesByMonth);
    const hasConfirmedCourses = months.length > 0;
    const hasUpcomingCourses = upcoming.length > 0;

    return (
        <main className="py-12 md:py-20">
            <Container>
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="font-heading text-4xl md:text-5xl text-earth-900 mb-6">
                        Calendario de Actividades
                    </h1>
                    <p className="text-lg text-gray-600">
                        Planificá tu formación. Aquí encontrarás las fechas de inicio de todos nuestros
                        cursos y talleres para los próximos meses.
                    </p>
                </div>

                {/* No courses at all */}
                {!hasConfirmedCourses && !hasUpcomingCourses && (
                    <div className="text-center py-20 bg-cream/30 dark:bg-card/30 rounded-3xl">
                        <CalendarIcon size={48} className="mx-auto text-green-700/50 dark:text-green-400/50 mb-4" />
                        <h3 className="text-2xl font-heading text-earth-900 mb-2">
                            No hay fechas confirmadas por el momento
                        </h3>
                        <p className="text-foreground/70 mb-8">
                            Estamos planificando el próximo ciclo. Suscribite a nuestro newsletter para enterarte de novedades.
                        </p>
                        <Link
                            href="/cursos"
                            className="inline-flex items-center px-6 py-3 bg-earth-900 text-secondary rounded-xl font-bold hover:bg-earth-800 transition-colors"
                        >
                            Ver catálogo de cursos
                        </Link>
                    </div>
                )}

                {/* Confirmed Courses Section */}
                {hasConfirmedCourses && (
                    <div className="space-y-16 mb-20">
                        {months.map((month) => (
                            <div key={month} className="relative">
                                <div className="sticky top-24 z-10 bg-background/95 backdrop-blur-sm py-4 border-b border-border mb-8">
                                    <h2 className="font-heading text-3xl text-earth-900 dark:text-foreground flex items-center gap-3">
                                        <CalendarIcon className="text-accent" />
                                        {capitalize(month)}
                                    </h2>
                                </div>

                                <div className="grid gap-6">
                                    {coursesByMonth[month].map((course) => (
                                        <div
                                            key={course.id}
                                            className="group bg-card rounded-2xl border border-border p-6 md:p-8 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col md:flex-row gap-6 md:items-center"
                                        >
                                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-800 dark:text-green-300 border border-green-100 dark:border-green-800/30">
                                                <span className="text-3xl font-bold font-heading">
                                                    {format(parseLocalDate(course.fecha_inicio!), 'dd')}
                                                </span>
                                                <span className="text-xs uppercase font-bold tracking-wider">
                                                    {format(parseLocalDate(course.fecha_inicio!), 'MMM', { locale: es })}
                                                </span>
                                            </div>

                                            <div className="flex-grow">
                                                <div className="flex flex-wrap gap-2 mb-2 text-sm font-medium text-gray-500">
                                                    <span className="bg-cream px-2 py-1 rounded text-earth-900">
                                                        {getModalidadLabel(course.modalidad)}
                                                    </span>
                                                    {course.duracion && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {course.duracion}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="font-heading text-2xl text-earth-900 mb-2 group-hover:text-accent transition-colors">
                                                    <Link href={`/cursos/${course.slug}`}>
                                                        {course.nombre}
                                                    </Link>
                                                </h3>
                                                {course.lugar && (
                                                    <div className="flex items-center gap-2 text-gray-600 mb-2 text-sm">
                                                        <MapPin size={16} />
                                                        {course.lugar}
                                                    </div>
                                                )}
                                                <p className="text-gray-600 line-clamp-2 md:line-clamp-1 text-sm">
                                                    {course.descripcion}
                                                </p>
                                            </div>

                                            <div className="flex-shrink-0">
                                                <Link
                                                    href={`/cursos/${course.slug}`}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-earth-900 text-secondary rounded-xl font-bold hover:bg-accent transition-colors w-full md:w-auto justify-center"
                                                >
                                                    Inscribirse
                                                    <ArrowRight size={18} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Próximamente Section */}
                {hasUpcomingCourses && (
                    <section className="relative">
                        {/* Section Header */}
                        <div className="relative mb-12">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-6 py-2 flex items-center gap-3">
                                    <Sparkles className="text-amber-500 w-6 h-6" />
                                    <h2 className="font-heading text-3xl text-earth-900">
                                        Próximamente
                                    </h2>
                                    <Sparkles className="text-amber-500 w-6 h-6" />
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
                            Estos cursos están en planificación. Las fechas se confirmarán pronto.
                            <span className="font-medium text-earth-900"> ¡Reservá tu lugar con anticipación!</span>
                        </p>

                        {/* Upcoming Courses Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcoming.map((course) => (
                                <div
                                    key={course.id}
                                    className="group relative bg-gradient-to-br from-cream/50 to-green-50/50 dark:from-white/5 dark:to-green-900/10 rounded-2xl border border-green-100/50 dark:border-white/10 p-6 hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden"
                                >
                                    {/* Decorative element */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-transparent rounded-bl-full"></div>

                                    {/* Badge */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wide">
                                            <Bell size={12} className="animate-pulse" />
                                            Fecha a confirmar
                                        </span>
                                    </div>

                                    {/* Course Info */}
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            <span className="bg-white/80 px-2 py-1 rounded text-earth-900 font-medium">
                                                {getModalidadLabel(course.modalidad)}
                                            </span>
                                            {course.duracion && (
                                                <span className="flex items-center gap-1 text-gray-500">
                                                    <Clock size={14} />
                                                    {course.duracion}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-heading text-xl text-earth-900 group-hover:text-accent transition-colors">
                                            <Link href={`/cursos/${course.slug}`}>
                                                {course.nombre}
                                            </Link>
                                        </h3>

                                        {(course.lugar || course.departamento_probable) && (
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <MapPin size={14} />
                                                {course.lugar || `${course.departamento_probable} (ubicación a confirmar)`}
                                            </div>
                                        )}

                                        {course.descripcion && (
                                            <p className="text-gray-600 text-sm line-clamp-2">
                                                {course.descripcion}
                                            </p>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-6">
                                        <Link
                                            href={`/cursos/${course.slug}`}
                                            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-earth-900 text-secondary rounded-xl font-bold hover:bg-accent transition-all group-hover:scale-[1.02]"
                                        >
                                            Reservar mi lugar
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </Container>
        </main>
    );
}
