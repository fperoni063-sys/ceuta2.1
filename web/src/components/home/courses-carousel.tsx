"use client";

import Image from "next/image";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { CourseCard, CourseCardData } from "@/components/cursos/CourseCard";

// Obsolete local interface
// interface Curso { ... }

export function CoursesCarousel() {
    const [cursos, setCursos] = useState<CourseCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchCursos() {
            const supabase = createClient();

            const { data, error } = await supabase
                .from("cursos")
                .select(`
                    id, 
                    nombre, 
                    descripcion, 
                    slug, 
                    fecha_inicio, 
                    modalidad, 
                    lugar, 
                    imagen_portada, 
                    precio, 
                    categoria,
                    duracion,
                    cantidad_cuotas,
                    nivel,
                    transformacion_hook,
                    fecha_a_confirmar,
                    lugar_a_confirmar,
                    es_inscripcion_anticipada,
                    descuento_porcentaje,
                    descuento_cupos_totales,
                    descuento_cupos_usados,
                    descuento_etiqueta,
                    descuento_fecha_fin
                `)
                .eq("activo", true)
                .order("fecha_inicio", { ascending: true })
                .limit(8);

            if (!error && data) {
                setCursos(data);
            }
            setLoading(false);
        }
        fetchCursos();
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 340;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    // formatDate helper removed as it is handled by CourseCard

    if (loading) {
        return (
            <section id="courses-section" className="py-20 bg-cream">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="courses-section" className="py-20 bg-cream">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-4xl text-earth-900 mb-4">
                        Próximos Cursos
                    </h2>
                    <p className="text-foreground/70 max-w-2xl mx-auto">
                        Encontrá tu próximo curso en Agroecología, Energías Renovables y más. Conocimiento práctico para aplicar hoy mismo.
                    </p>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    {/* Navigation Buttons */}
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg rounded-full p-2 hover:bg-cream/10 transition-colors hidden md:block"
                        aria-label="Previous courses"
                    >
                        <ChevronLeft size={24} className="text-earth-900" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg rounded-full p-2 hover:bg-cream/10 transition-colors hidden md:block"
                        aria-label="Next courses"
                    >
                        <ChevronRight size={24} className="text-earth-900" />
                    </button>

                    {/* Cards Scroll Container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-2 md:px-12 snap-x snap-mandatory"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {cursos.length === 0 ? (
                            <div className="w-full text-center py-12 text-gray-500">
                                No hay cursos próximos disponibles
                            </div>
                        ) : (
                            cursos.map((curso) => (
                                <div key={curso.id} className="flex-shrink-0 w-[300px] snap-start h-full">
                                    <CourseCard course={curso} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* View All Button */}
                <div className="text-center mt-8">
                    <Link href="/cursos">
                        <Button variant="outline" size="lg">
                            Ver todos los cursos
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
