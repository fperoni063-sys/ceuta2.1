'use client';

import { useState, useEffect } from 'react';
import { ProgramaClase } from '@/types/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, GripVertical, Trash2, Edit2, Save, X, BookOpen, Wrench } from 'lucide-react';

interface ProgramaManagerProps {
    cursoId: number;
}

export function ProgramaManager({ cursoId }: ProgramaManagerProps) {
    const [clases, setClases] = useState<ProgramaClase[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        titulo: '',
        tipo: 'teorico' as 'teorico' | 'practico',
        practica_presencial: false,
        practica_virtual: false,
    });

    useEffect(() => {
        fetchClases();
    }, [cursoId]);

    async function fetchClases() {
        try {
            const res = await fetch(`/api/admin/programa?curso_id=${cursoId}`);
            if (res.ok) {
                const data = await res.json();
                setClases(data);
            }
        } catch (error) {
            console.error('Error fetching programa:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd() {
        if (!formData.titulo.trim()) return;

        setSaving(true);
        try {
            const res = await fetch('/api/admin/programa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    curso_id: cursoId,
                    ...formData,
                }),
            });

            if (res.ok) {
                await fetchClases();
                setFormData({
                    titulo: '',
                    tipo: 'teorico',
                    practica_presencial: false,
                    practica_virtual: false,
                });
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Error adding clase:', error);
        } finally {
            setSaving(false);
        }
    }

    async function handleUpdate(clase: ProgramaClase) {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/programa', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: clase.id,
                    titulo: formData.titulo,
                    tipo: formData.tipo,
                    practica_presencial: formData.practica_presencial,
                    practica_virtual: formData.practica_virtual,
                }),
            });

            if (res.ok) {
                await fetchClases();
                setEditingId(null);
            }
        } catch (error) {
            console.error('Error updating clase:', error);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('¿Eliminar esta clase del programa?')) return;

        try {
            const res = await fetch(`/api/admin/programa?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await fetchClases();
            }
        } catch (error) {
            console.error('Error deleting clase:', error);
        }
    }

    function startEdit(clase: ProgramaClase) {
        setEditingId(clase.id);
        setFormData({
            titulo: clase.titulo,
            tipo: clase.tipo,
            practica_presencial: clase.practica_presencial,
            practica_virtual: clase.practica_virtual,
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setFormData({
            titulo: '',
            tipo: 'teorico',
            practica_presencial: false,
            practica_virtual: false,
        });
    }

    async function handleReorder(dragIndex: number, dropIndex: number) {
        if (dragIndex === dropIndex) return;

        const newClases = [...clases];
        const [removed] = newClases.splice(dragIndex, 1);
        newClases.splice(dropIndex, 0, removed);

        // Actualizar orden
        const reorderedClases = newClases.map((c, idx) => ({
            ...c,
            orden: idx,
            numero: idx + 1,
        }));

        setClases(reorderedClases);

        // Guardar en servidor
        try {
            await fetch('/api/admin/programa/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clases: reorderedClases.map(c => ({ id: c.id, orden: c.orden })),
                }),
            });
        } catch (error) {
            console.error('Error reordering:', error);
        }
    }

    if (loading) {
        return <div className="text-gray-500 py-4">Cargando programa...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-700" />
                    Programa del Curso
                </h2>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(true)}
                    disabled={showAddForm}
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Clase
                </Button>
            </div>

            <p className="text-sm text-gray-500">
                Define las clases del programa. Los horarios generales se configuran arriba en "Horarios y Ubicación".
            </p>

            {/* Lista de clases */}
            <div className="space-y-2">
                {clases.map((clase, index) => (
                    <div
                        key={clase.id}
                        draggable={editingId === null}
                        onDragStart={(e) => {
                            setDraggedIndex(index);
                            e.dataTransfer.effectAllowed = 'move';
                            // Optional: set custom drag image or data
                        }}
                        onDragOver={(e) => {
                            e.preventDefault(); // Necessary to allow dropping
                            e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (draggedIndex !== null && draggedIndex !== index) {
                                handleReorder(draggedIndex, index);
                            }
                            setDraggedIndex(null);
                        }}
                        className={`transition-opacity ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
                    >
                        <Card className="p-3">
                            {editingId === clase.id ? (
                                // Modo edición
                                <div className="space-y-3">
                                    <Input
                                        value={formData.titulo}
                                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                        placeholder="Título de la clase"
                                    />
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`tipo-${clase.id}`}
                                                checked={formData.tipo === 'teorico'}
                                                onChange={() => setFormData({ ...formData, tipo: 'teorico', practica_presencial: false, practica_virtual: false })}
                                                className="w-4 h-4 text-green-700"
                                            />
                                            <span className="text-sm">Teórica</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name={`tipo-${clase.id}`}
                                                checked={formData.tipo === 'practico'}
                                                onChange={() => setFormData({ ...formData, tipo: 'practico' })}
                                                className="w-4 h-4 text-orange-600"
                                            />
                                            <span className="text-sm">Práctica</span>
                                        </label>
                                    </div>

                                    {formData.tipo === 'practico' && (
                                        <div className="flex flex-wrap gap-4 pl-4 border-l-2 border-orange-200">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.practica_presencial}
                                                    onChange={(e) => setFormData({ ...formData, practica_presencial: e.target.checked })}
                                                    className="w-4 h-4 rounded text-orange-600"
                                                />
                                                <span className="text-sm">📍 Presencial</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.practica_virtual}
                                                    onChange={(e) => setFormData({ ...formData, practica_virtual: e.target.checked })}
                                                    className="w-4 h-4 rounded text-orange-600"
                                                />
                                                <span className="text-sm">💻 Virtual</span>
                                            </label>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={() => handleUpdate(clase)} disabled={saving}>
                                            <Save className="w-4 h-4 mr-1" />
                                            Guardar
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                                            <X className="w-4 h-4 mr-1" />
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                // Modo visualización
                                <div className="flex items-center gap-3">
                                    <div
                                        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
                                        title="Arrastrar para reordenar"
                                    >
                                        <GripVertical className="w-4 h-4" />
                                    </div>

                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                                        {clase.numero}
                                    </span>

                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{clase.titulo}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {clase.tipo === 'teorico' ? (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                                    <BookOpen className="w-3 h-3" />
                                                    Teórica
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                                                    <Wrench className="w-3 h-3" />
                                                    Práctica
                                                    {clase.practica_presencial && ' 📍'}
                                                    {clase.practica_virtual && ' 💻'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => startEdit(clase)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(clase.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                ))}

                {clases.length === 0 && !showAddForm && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No hay clases en el programa</p>
                        <p className="text-sm">Haz clic en "Agregar Clase" para comenzar</p>
                    </div>
                )}
            </div>

            {/* Formulario para agregar nueva clase */}
            {showAddForm && (
                <Card className="p-4 border-2 border-green-200 bg-green-50/30">
                    <h3 className="font-medium text-gray-800 mb-3">Nueva Clase</h3>
                    <div className="space-y-3">
                        <Input
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            placeholder="Título de la clase (ej: Introducción a la huerta)"
                        />

                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="tipo-new"
                                    checked={formData.tipo === 'teorico'}
                                    onChange={() => setFormData({ ...formData, tipo: 'teorico', practica_presencial: false, practica_virtual: false })}
                                    className="w-4 h-4 text-green-700"
                                />
                                <span className="text-sm font-medium">🎓 Teórica</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="tipo-new"
                                    checked={formData.tipo === 'practico'}
                                    onChange={() => setFormData({ ...formData, tipo: 'practico' })}
                                    className="w-4 h-4 text-orange-600"
                                />
                                <span className="text-sm font-medium">🔧 Práctica</span>
                            </label>
                        </div>

                        {formData.tipo === 'practico' && (
                            <div className="flex flex-wrap gap-4 pl-4 border-l-2 border-orange-200 bg-orange-50/50 p-3 rounded-r-lg">
                                <p className="w-full text-sm text-gray-600 mb-1">Modalidades disponibles:</p>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.practica_presencial}
                                        onChange={(e) => setFormData({ ...formData, practica_presencial: e.target.checked })}
                                        className="w-4 h-4 rounded text-orange-600"
                                    />
                                    <span className="text-sm">📍 Presencial</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.practica_virtual}
                                        onChange={(e) => setFormData({ ...formData, practica_virtual: e.target.checked })}
                                        className="w-4 h-4 rounded text-orange-600"
                                    />
                                    <span className="text-sm">💻 Virtual</span>
                                </label>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button type="button" onClick={handleAdd} disabled={saving || !formData.titulo.trim()}>
                                <Plus className="w-4 h-4 mr-1" />
                                {saving ? 'Agregando...' : 'Agregar Clase'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setFormData({ titulo: '', tipo: 'teorico', practica_presencial: false, practica_virtual: false });
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
