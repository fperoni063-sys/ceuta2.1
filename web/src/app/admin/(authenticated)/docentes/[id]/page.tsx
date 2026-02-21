'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface DocenteFormData {
    nombre: string;
    descripcion: string;
    foto_url: string | null;
}

export default function EditarDocentePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const isNew = resolvedParams.id === 'nuevo';

    const [formData, setFormData] = useState<DocenteFormData>({
        nombre: '',
        descripcion: '',
        foto_url: null,
    });
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isNew) {
            fetch(`/api/admin/docentes/${resolvedParams.id}`)
                .then(res => {
                    if (!res.ok) throw new Error('Docente no encontrado');
                    return res.json();
                })
                .then(data => {
                    setFormData({
                        nombre: data.nombre || '',
                        descripcion: data.descripcion || '',
                        foto_url: data.foto_url || '',
                    });
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [isNew, resolvedParams.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const url = isNew ? '/api/admin/docentes' : `/api/admin/docentes/${resolvedParams.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Error al guardar');

            router.push('/admin/docentes');
            router.refresh();
        } catch (err) {
            setError('Error al guardar el docente');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-12">Cargando...</div>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/docentes">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                </Link>
                <h1 className="text-2xl font-serif font-bold text-gray-800">
                    {isNew ? 'Nuevo Docente' : 'Editar Docente'}
                </h1>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <Input
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <ImageUploader
                            value={formData.foto_url}
                            onChange={(url) => setFormData(prev => ({ ...prev, foto_url: url }))}
                            folder="docentes"
                            label="Foto del Docente"
                            helpText="Ratio 1:1 (400×400px)"
                            aspectRatio="1:1"
                            size="sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Biografía / Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green-700)] focus:border-transparent"
                        />
                    </div>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/admin/docentes">
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={saving} className="bg-[var(--color-green-700)] hover:bg-[var(--color-green-800)]">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
