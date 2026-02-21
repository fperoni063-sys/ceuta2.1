'use client';

import { useState } from 'react';
import { ProgramaClase } from '@/types/db';
import { BookOpen, Wrench, Monitor, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface ProgramaSectionProps {
    clases: ProgramaClase[];
    diaTeortico?: string | null;
    horarioTeorico?: string | null;
    diaPractico?: string | null;
    horarioPractico?: string | null;
    teoricasPresenciales?: boolean;
}

export function ProgramaSection({
    clases,
    diaTeortico,
    horarioTeorico,
    diaPractico,
    horarioPractico,
    teoricasPresenciales = false,
}: ProgramaSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!clases || clases.length === 0) {
        return null;
    }

    // Calcular resumen
    const teoricas = clases.filter(c => c.tipo === 'teorico');
    const practicas = clases.filter(c => c.tipo === 'practico');
    const hasPresencial = practicas.some(c => c.practica_presencial);
    const hasVirtual = practicas.some(c => c.practica_virtual);

    return (
        <section className="mt-12 pt-8 border-t border-earth-900/10">
            {/* Header */}
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-earth-900 mb-6 flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-green-700" />
                Programa del Curso
            </h2>

            {/* Resumen compacto (siempre visible) */}
            <div className="relative bg-gradient-to-r from-green-50 to-orange-50 dark:from-green-950/20 dark:to-orange-950/20 rounded-xl p-5 border border-earth-900/10 mb-6">

                {/* Botón de expansión posicionado absoluto arriba a la derecha en desktop, o flow normal en móvil */}
                <div className="md:absolute md:top-5 md:right-5 mb-4 md:mb-0 flex justify-end">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1.5 text-sm font-medium text-green-800 dark:text-green-200 bg-background/60 hover:bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg transition-all border border-green-800/10 shadow-sm"
                    >
                        {isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-4 pr-0 md:pr-32">
                    {/* Clases teóricas */}
                    {teoricas.length > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-green-700" />
                            </div>
                            <div>
                                <p className="font-semibold text-earth-900">
                                    {teoricas.length} {teoricas.length === 1 ? 'clase teórica' : 'clases teóricas'}
                                </p>
                                <p className="text-sm text-earth-900/60">
                                    {teoricasPresenciales ? '📍 Presencial' : '💻 Online (Zoom)'}
                                    {diaTeortico && ` · ${diaTeortico}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Clases prácticas */}
                    {practicas.length > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                                <Wrench className="w-5 h-5 text-orange-700" />
                            </div>
                            <div>
                                <p className="font-semibold text-earth-900">
                                    {practicas.length} {practicas.length === 1 ? 'práctica' : 'prácticas'}
                                </p>
                                <p className="text-sm text-earth-900/60">
                                    {hasPresencial && hasVirtual && 'Presencial o Virtual (a elección)'}
                                    {hasPresencial && !hasVirtual && 'Presencial'}
                                    {!hasPresencial && hasVirtual && 'Virtual'}
                                    {diaPractico ? ` · ${diaPractico}` : (!horarioPractico && ' · Sábados (fecha a definir)')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Horarios si existen */}
                {(horarioTeorico || horarioPractico) && (
                    <div className="mt-4 pt-4 border-t border-earth-900/10 dark:border-white/5 flex items-center gap-2 text-sm text-earth-900/60 dark:text-foreground/60">
                        <Clock className="w-4 h-4" />
                        <span>
                            {horarioTeorico && `Teóricas: ${horarioTeorico}`}
                            {horarioTeorico && horarioPractico && ' · '}
                            {horarioPractico && `Prácticas: ${horarioPractico}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Lista de Clases expandible */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="space-y-2">
                    {clases.map((clase, index) => (
                        <ClaseRow
                            key={clase.id}
                            clase={clase}
                            teoricasPresenciales={teoricasPresenciales}
                        />
                    ))}
                </div>

                {/* Leyenda simple */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-earth-900/50">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        <span>Clase Teórica</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <span>Clase Práctica</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Versión compacta de cada clase (una línea)
function ClaseRow({ clase, teoricasPresenciales }: { clase: ProgramaClase, teoricasPresenciales?: boolean }) {
    const isTeorico = clase.tipo === 'teorico';

    return (
        <div
            className={`
                flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-4 py-3 rounded-lg border transition-colors
                ${isTeorico
                    ? 'bg-green-50/50 border-green-200 hover:bg-green-50 dark:bg-green-950/10 dark:border-green-800/30'
                    : 'bg-orange-50/50 border-orange-200 hover:bg-orange-50 dark:bg-orange-950/10 dark:border-orange-800/30'
                }
            `}
        >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                {/* Indicador de tipo */}
                <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isTeorico ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                />

                {/* Número */}
                <span className="text-sm font-bold text-earth-900/70 w-5 flex-shrink-0">
                    {clase.numero}.
                </span>

                {/* Título */}
                <span className="text-sm font-medium text-earth-900 dark:text-foreground/90">
                    {clase.titulo}
                </span>
            </div>

            {/* Tipo e íconos de modalidad con texto */}
            <div className={`
                flex items-center gap-3 flex-shrink-0 pl-5 sm:pl-0 text-xs font-medium
                ${isTeorico ? 'text-green-700' : 'text-orange-700'}
            `}>

                {isTeorico ? (
                    <div className="flex items-center gap-1.5">
                        <span>Teórica</span>
                        {/* Asumimos virtual para teórica a menos que se indique presencial en el curso */}
                        {teoricasPresenciales ? (
                            <span className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-full">
                                Presencial
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-full">
                                Virtual
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <span>Práctica</span>
                        <div className="flex items-center gap-2">
                            {clase.practica_presencial && clase.practica_virtual ? (
                                <span className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-full">
                                    Presencial o Virtual (a elección)
                                </span>
                            ) : (
                                <>
                                    {clase.practica_presencial && (
                                        <span className="flex items-center gap-1 bg-background/50 px-2 py-0.5 rounded-full">
                                            Presencial
                                        </span>
                                    )}
                                    {clase.practica_virtual && (
                                        <span className="flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-full">
                                            Virtual
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

