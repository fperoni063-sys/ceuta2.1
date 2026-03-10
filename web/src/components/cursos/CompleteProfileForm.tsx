'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

const DEPARTAMENTOS = [
    'Otro país',
    'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno',
    'Flores', 'Florida', 'Lavalleja', 'Maldonado', 'Montevideo',
    'Paysandú', 'Río Negro', 'Rivera', 'Rocha', 'Salto',
    'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres'
];

const COMO_SE_ENTERO_OPTIONS = [
    '¿Cómo te enteraste del curso?',
    'Redes sociales',
    'Búsqueda en Google',
    'Recomendación de un amigo',
    'Email / Newsletter',
    'Publicidad',
    'Otro'
];

interface Props {
    token: string;
    onSuccess: () => void;
}

export function CompleteProfileForm({ token, onSuccess }: Props) {
    const { track } = useAnalytics();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        cedula: '',
        edad: '',
        departamento: '',
        direccion: '',
        comoSeEntero: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation for CI / Age (required now since it's the post-payment requirement)
        if (!formData.cedula || !formData.edad || !formData.departamento || !formData.direccion) {
            setError('Por favor completá los campos obligatorios (*).');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/inscripcion/completar-perfil', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    cedula: formData.cedula,
                    edad: parseInt(formData.edad),
                    departamento: formData.departamento,
                    direccion: formData.direccion,
                    como_se_entero: formData.comoSeEntero,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al guardar datos. Intentalo nuevamente.');
            }

            track('profile_completed_post_payment');
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos. Intentá de nuevo o contactate con soporte.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-left animate-in fade-in zoom-in-95">
            <div className="bg-blue-50/50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                    <span className="mt-0.5">ℹ️</span>
                    <span>Necesitamos algunos datos adicionales para poder emitir tu certificado y completar tu ficha de estudiante.</span>
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="cedula" className="block text-sm font-medium text-earth-900 dark:text-gray-200 mb-1">
                        Cédula de Identidad *
                    </label>
                    <Input
                        id="cedula"
                        type="text"
                        value={formData.cedula}
                        onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                        placeholder="1.234.567-8"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="edad" className="block text-sm font-medium text-earth-900 dark:text-gray-200 mb-1">
                        Edad *
                    </label>
                    <Input
                        id="edad"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.edad}
                        onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                        placeholder="Ej. 25"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="departamento" className="block text-sm font-medium text-earth-900 dark:text-gray-200 mb-1">
                        Departamento *
                    </label>
                    <select
                        id="departamento"
                        value={formData.departamento}
                        onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background dark:bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">Seleccionar...</option>
                        {DEPARTAMENTOS.map((dep) => (
                            <option key={dep} value={dep}>{dep}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-earth-900 dark:text-gray-200 mb-1">
                        Dirección *
                    </label>
                    <Input
                        id="direccion"
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        placeholder="Ej. Av. 18 de Julio..."
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="comoSeEntero" className="block text-sm font-medium text-earth-900 dark:text-gray-200 mb-1">
                    ¿Cómo te enteraste del curso? <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
                </label>
                <select
                    id="comoSeEntero"
                    value={formData.comoSeEntero}
                    onChange={(e) => setFormData({ ...formData, comoSeEntero: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background dark:bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {COMO_SE_ENTERO_OPTIONS.map((opt, i) => (
                        <option key={opt} value={i === 0 ? '' : opt} disabled={i === 0}>
                            {opt}
                        </option>
                    ))}
                </select>
            </div>

            <Button type="submit" className="w-full mt-6 bg-green-700 hover:bg-green-800" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                    </>
                ) : (
                    'Completar mis datos y confirmar'
                )}
            </Button>
        </form>
    );
}
