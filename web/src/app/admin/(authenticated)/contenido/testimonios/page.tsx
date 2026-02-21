'use client';

import { useState, useEffect } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ImageUploader } from '@/components/admin/ImageUploader';

interface Testimonio {
    id: number;
    nombre: string;
    curso: string;
    texto: string;
    foto_url: string;
    orden: number;
    activo: boolean;
}

export default function AdminTestimoniosPage() {
    const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        curso: '',
        texto: '',
        foto_url: '',
        orden: 0,
        activo: true,
    });

    useEffect(() => {
        fetchTestimonios();
    }, []);

    async function fetchTestimonios() {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/testimonios');
            if (response.ok) {
                const data = await response.json();
                setTestimonios(data || []);
            } else {
                console.error('Error fetching testimonios');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingId) {
                await fetch(`/api/admin/testimonios/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            } else {
                await fetch('/api/admin/testimonios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            }

            setFormData({ nombre: '', curso: '', texto: '', foto_url: '', orden: 0, activo: true });
            setEditingId(null);
            await fetchTestimonios();
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (t: Testimonio) => {
        setEditingId(t.id);
        setFormData({
            nombre: t.nombre,
            curso: t.curso || '',
            texto: t.texto,
            foto_url: t.foto_url || '',
            orden: t.orden,
            activo: t.activo,
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este testimonio?')) return;
        try {
            await fetch(`/api/admin/testimonios/${id}`, {
                method: 'DELETE',
            });
            await fetchTestimonios();
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/contenido">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                </Link>
                <h1 className="text-2xl font-serif font-bold text-gray-800">Gestión de Testimonios</h1>
            </div>

            {/* Form */}
            <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                    {editingId ? 'Editar Testimonio' : 'Nuevo Testimonio'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <Input
                                value={formData.nombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                required
                                placeholder="Nombre del alumno"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                            <Input
                                value={formData.curso}
                                onChange={(e) => setFormData(prev => ({ ...prev, curso: e.target.value }))}
                                placeholder="Nombre del curso"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Testimonio</label>
                            <textarea
                                value={formData.texto}
                                onChange={(e) => setFormData(prev => ({ ...prev, texto: e.target.value }))}
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green-700)] focus:border-transparent"
                                placeholder="El testimonio del alumno..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <ImageUploader
                                value={formData.foto_url}
                                onChange={(url) => setFormData(prev => ({ ...prev, foto_url: url || '' }))}
                                folder="testimonios"
                                label="Foto del Alumno"
                                helpText="Imagen cuadrada recomendada (PNG o JPG)"
                                aspectRatio="1:1"
                                size="sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                            <Input
                                type="number"
                                value={formData.orden}
                                onChange={(e) => setFormData(prev => ({ ...prev, orden: Number(e.target.value) }))}
                                min={0}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.activo}
                                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-gray-700">Activo</span>
                        </label>
                        <div className="flex-1" />
                        {editingId && (
                            <Button type="button" variant="outline" onClick={() => {
                                setEditingId(null);
                                setFormData({ nombre: '', curso: '', texto: '', foto_url: '', orden: 0, activo: true });
                            }}>
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" disabled={saving}>
                            {editingId ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            {saving ? 'Guardando...' : editingId ? 'Guardar' : 'Agregar'}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* List */}
            <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Testimonios Existentes</h2>
                {loading ? (
                    <p className="text-gray-500 text-center py-4">Cargando...</p>
                ) : testimonios.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay testimonios.</p>
                ) : (
                    <div className="space-y-4">
                        {testimonios.map((t) => (
                            <div key={t.id} className={`p-4 border rounded-lg ${t.activo ? '' : 'opacity-50'}`}>
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{t.nombre}</p>
                                        {t.curso && <p className="text-sm text-gray-500">{t.curso}</p>}
                                        <p className="text-gray-600 mt-2">&quot;{t.texto}&quot;</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(t)}>
                                            Editar
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
