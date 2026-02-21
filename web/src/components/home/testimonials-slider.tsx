"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonio {
    id: number;
    nombre: string;
    curso: string;
    texto: string;
    foto_url: string | null;
}

// Fallback testimonials when database is empty
const fallbackTestimonials: Testimonio[] = [
    {
        id: 1,
        nombre: "María García",
        curso: "Huerta Orgánica",
        texto: "El curso de huerta orgánica cambió mi forma de ver la alimentación. Ahora tengo mi propia huerta en casa y es increíble cosechar mis propios alimentos.",
        foto_url: null,
    },
    {
        id: 2,
        nombre: "Carlos Rodríguez",
        curso: "Permacultura",
        texto: "CEUTA me dio las herramientas para diseñar un estilo de vida más sustentable. Los docentes son excepcionales y la comunidad que se forma es invaluable.",
        foto_url: null,
    },
    {
        id: 3,
        nombre: "Ana Martínez",
        curso: "Bioconstrucción",
        texto: "Aprendí técnicas de construcción natural que apliqué en mi propia casa. El conocimiento práctico que brinda CEUTA no se encuentra en ningún otro lado.",
        foto_url: null,
    },
];

export function TestimonialsSlider() {
    const [testimonios, setTestimonios] = useState<Testimonio[]>(fallbackTestimonials);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        async function fetchTestimonios() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("testimonios")
                .select("id, nombre, curso, texto, foto_url")
                .eq("activo", true)
                .order("orden", { ascending: true })
                .limit(10);

            if (!error && data && data.length > 0) {
                setTestimonios(data);
            }
        }
        fetchTestimonios();
    }, []);

    useEffect(() => {
        if (!isAutoPlaying || testimonios.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonios.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, testimonios.length]);

    const goTo = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const prev = () => goTo((currentIndex - 1 + testimonios.length) % testimonios.length);
    const next = () => goTo((currentIndex + 1) % testimonios.length);

    const current = testimonios[currentIndex];

    return (
        <section className="py-20 bg-earth-900 dark:bg-card text-white dark:text-foreground">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-4xl mb-4">
                        Lo que dicen nuestros egresados
                    </h2>
                    <p className="text-white/80 dark:text-muted-foreground max-w-2xl mx-auto">
                        Historias de transformación de quienes pasaron por nuestros cursos.
                    </p>
                </div>

                {/* Testimonial Card */}
                <div className="max-w-3xl mx-auto relative">
                    <div className="bg-white/10 dark:bg-muted/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 text-center relative">
                        <Quote className="absolute top-6 left-6 text-white/20 dark:text-foreground/20" size={48} />

                        {/* Photo */}
                        <div className="w-20 h-20 rounded-full bg-green-700 mx-auto mb-6 flex items-center justify-center overflow-hidden relative">
                            {current.foto_url ? (
                                <Image
                                    src={current.foto_url}
                                    alt={current.nombre}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />

                            ) : (
                                <span className="text-3xl text-white">
                                    {current.nombre.charAt(0)}
                                </span>
                            )}
                        </div>

                        {/* Text */}
                        <blockquote className="text-lg md:text-xl text-white/90 dark:text-foreground/90 mb-6 leading-relaxed">
                            "{current.texto}"
                        </blockquote>

                        {/* Author */}
                        <div>
                            <p className="font-semibold text-lg">{current.nombre}</p>
                            {current.curso && (
                                <p className="text-white/70 dark:text-muted-foreground text-sm">Curso: {current.curso}</p>
                            )}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {testimonios.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={next}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Dots */}
                {testimonios.length > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonios.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goTo(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                    ? "bg-white w-6"
                                    : "bg-white/40 hover:bg-white/60"
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
