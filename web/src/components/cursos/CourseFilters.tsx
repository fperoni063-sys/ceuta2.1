'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

export interface FilterOption {
    value: string;
    label: string;
}

interface CourseFiltersProps {
    modalities: FilterOption[];
    levels: FilterOption[];
}

export function CourseFilters({ modalities, levels }: CourseFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentModality = searchParams.get('modalidad') || '';
    const currentLevel = searchParams.get('nivel') || '';

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset to page 1 when filters change
        params.delete('page');
        router.push(`/cursos?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/cursos');
    };

    const hasActiveFilters = currentModality || currentLevel;

    return (
        <div className="bg-cream/50 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Modality Filter */}
                <div className="flex-1">
                    <label
                        htmlFor="filter-modality"
                        className="block text-sm font-medium text-earth-900 mb-2"
                    >
                        Modalidad
                    </label>
                    <select
                        id="filter-modality"
                        value={currentModality}
                        onChange={(e) => updateFilter('modalidad', e.target.value)}
                        className={cn(
                            "w-full px-4 py-2.5 rounded-md border border-earth-900/20",
                            "bg-background text-earth-900 text-base",
                            "focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700",
                            "cursor-pointer transition-colors"
                        )}
                    >
                        <option value="">Todas las modalidades</option>
                        {modalities.map((mod) => (
                            <option key={mod.value} value={mod.value}>
                                {mod.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Level Filter */}
                <div className="flex-1">
                    <label
                        htmlFor="filter-level"
                        className="block text-sm font-medium text-earth-900 mb-2"
                    >
                        Nivel
                    </label>
                    <select
                        id="filter-level"
                        value={currentLevel}
                        onChange={(e) => updateFilter('nivel', e.target.value)}
                        className={cn(
                            "w-full px-4 py-2.5 rounded-md border border-earth-900/20",
                            "bg-background text-earth-900 text-base",
                            "focus:outline-none focus:ring-2 focus:ring-green-700/50 focus:border-green-700",
                            "cursor-pointer transition-colors"
                        )}
                    >
                        <option value="">Todos los niveles</option>
                        {levels.map((lvl) => (
                            <option key={lvl.value} value={lvl.value}>
                                {lvl.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className={cn(
                                "px-4 py-2.5 text-sm font-medium text-accent",
                                "hover:text-accent/80 transition-colors",
                                "underline underline-offset-4"
                            )}
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-earth-900/10">
                    <p className="text-sm text-earth-900/70">
                        Filtros activos:{' '}
                        <span className="font-medium text-earth-900">
                            {[
                                currentModality && modalities.find(m => m.value === currentModality)?.label,
                                currentLevel && levels.find(l => l.value === currentLevel)?.label,
                            ].filter(Boolean).join(' • ')}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
