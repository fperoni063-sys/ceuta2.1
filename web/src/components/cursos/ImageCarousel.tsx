'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
    images: string[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    if (!images || images.length === 0) return null;

    if (images.length === 1) {
        return (
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg my-8 group bg-black/90">
                {/* Fondo difuminado ambiental */}
                <div className="absolute inset-0 w-full h-full scale-110">
                    <Image
                        src={images[0]}
                        alt="Background blur"
                        fill
                        className="object-cover blur-[40px] opacity-50 saturate-150"
                        priority
                    />
                </div>
                {/* Contenido real (Frente) */}
                <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center p-0">
                    <Image
                        src={images[0]}
                        alt="Galería del curso"
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full my-8 group">
            <div className="overflow-hidden rounded-2xl shadow-lg border border-earth-100/20" ref={emblaRef}>
                <div className="flex">
                    {images.map((img, index) => (
                        <div className="flex-[0_0_100%] min-w-0 relative aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] bg-black/90 overflow-hidden" key={index}>
                            {/* Fondo difuminado ambiental */}
                            <div className="absolute inset-0 w-full h-full scale-110">
                                <Image
                                    src={img}
                                    alt="Background blur"
                                    fill
                                    className="object-cover blur-[40px] opacity-50 saturate-150"
                                    priority={index <= 1}
                                />
                            </div>
                            {/* Contenido real (Frente) */}
                            <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center p-0">
                                <Image
                                    src={img}
                                    alt={`Imagen de galería ${index + 1}`}
                                    fill
                                    className="object-contain drop-shadow-2xl"
                                    priority={index <= 1}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation buttons */}
            <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm text-earth-900 rounded-full shadow hover:bg-white transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-0"
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                aria-label="Imagen anterior"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm text-earth-900 rounded-full shadow hover:bg-white transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-0"
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                aria-label="Imagen siguiente"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                            index === selectedIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        onClick={() => emblaApi?.scrollTo(index)}
                        aria-label={`Ir a la imagen ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
