'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, X, Check, Quote } from 'lucide-react';

interface Testimonio {
    id: number;
    curso_id: number | null;
    nombre: string;
    texto: string;
    foto_url: string | null;
    orden: number;
    activo: boolean;
}

interface TestimoniosManagerProps {
    cursoId: number;
}

export function TestimoniosManager({ cursoId }: TestimoniosManagerProps) {
    const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ nombre: '', texto: '', foto_url: '' });

    useEffect(() => {
        loadTestimonios();
    }, [cursoId]);

    const loadTestimonios = async () => {
        try {
            const res = await fetch(`/api/testimonios?curso_id=${cursoId}`);
            const data = await res.json();
            if (data.success) {
                setTestimonios(data.data || []);
            }
        } catch (error) {
            console.error('Error loading testimonios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre.trim() || !formData.texto.trim()) return;

        setSaving(true);
        try {
            const isEditing = editingId !== null;
            const url = '/api/testimonios';
            const method = isEditing ? 'PUT' : 'POST';

            const body = isEditing
                ? { id: editingId, nombre: formData.nombre, texto: formData.texto, foto_url: formData.foto_url || null }
                : {
                    curso_id: cursoId,
                    nombre: formData.nombre,
                    texto: formData.texto,
                    foto_url: formData.foto_url || null,
                    orden: testimonios.length,
                };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (data.success) {
                if (isEditing) {
                    setTestimonios(testimonios.map(t => t.id === editingId ? data.data : t));
                } else {
                    setTestimonios([...testimonios, data.data]);
                }
                resetForm();
            }
        } catch (error) {
            console.error('Error saving testimonio:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este testimonio?')) return;

        try {
            const res = await fetch(`/api/testimonios?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setTestimonios(testimonios.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error('Error deleting testimonio:', error);
        }
    };

    const startEditing = (t: Testimonio) => {
        setEditingId(t.id);
        setFormData({ nombre: t.nombre, texto: t.texto, foto_url: t.foto_url || '' });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ nombre: '', texto: '', foto_url: '' });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="text-center py-8 text-gray-500">
                Cargando testimonios...
            </div>
        );
    }

    return (
        <Card className="p-6 border-amber-100 bg-amber-50/30">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-medium text-amber-900 flex items-center gap-2">
                        <Quote className="w-5 h-5" />
                        Testimonios de Alumnos
                    </h2>
                    <p className="text-xs text-amber-700/70 mt-1">
                        Los testimonios generan confianza y ayudan a convencer a los indecisos.
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} disabled={showForm} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                </Button>
            </div>

            {/* Formulario */}
            {showForm && (
                <Card className="p-4 bg-white border-amber-200 mb-4">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-700">
                                {editingId ? 'Editar Testimonio' : 'Nuevo Testimonio'}
                            </h4>
                            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del alumno *
                            </label>
                            <Input
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: María García"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Testimonio *
                            </label>
                            <textarea
                                value={formData.texto}
                                onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                                placeholder="Ej: Gracias al curso pude construir mi propio invernadero..."
                                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                URL foto (opcional)
                            </label>
                            <Input
                                value={formData.foto_url}
                                onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={saving} size="sm">
                                <Check className="w-4 h-4 mr-1" />
                                {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Lista */}
            {testimonios.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-white/50 rounded-lg border-2 border-dashed border-amber-200">
                    <Quote className="w-8 h-8 mx-auto mb-2 text-amber-300" />
                    <p>No hay testimonios aún.</p>
                    <p className="text-sm mt-1">Agregá el primero para aumentar las conversiones.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {testimonios.map((t) => (
                        <div
                            key={t.id}
                            className="flex items-start gap-3 bg-white p-4 rounded-lg border border-amber-100"
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold flex-shrink-0">
                                {t.nombre.charAt(0)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-sm">{t.nombre}</p>
                                <p className="text-gray-600 text-sm italic mt-1 line-clamp-2">"{t.texto}"</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <Button variant="ghost" size="sm" onClick={() => startEditing(t)}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(t.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
