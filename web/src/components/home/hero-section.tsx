"use client";

import Image from "next/image";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
    const scrollToContent = () => {
        document.getElementById("courses-section")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=2070"
                    alt="Hero background - Jardín Agroecológico"
                    fill
                    priority
                    quality={90}
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                    Aprende a vivir en armonía con la naturaleza
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Centro Uruguayo de Tecnologías Apropiadas. Más de 30 años formando comunidad
                    en Agroecología, Energías Renovables y Vida Sustentable.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/cursos">
                        <Button size="lg" className="text-lg px-8 py-6">
                            Ver cursos
                        </Button>
                    </Link>
                    <Link href="/nosotros">
                        <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-white bg-transparent text-white hover:bg-white hover:text-earth-900">
                            Conocé CEUTA
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Scroll indicator */}
            <button
                onClick={scrollToContent}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce cursor-pointer"
                aria-label="Scroll down"
            >
                <ChevronDown size={40} />
            </button>
        </section>
    );
}
