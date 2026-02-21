'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Globe, Edit2, X, Check } from 'lucide-react';
import { FAQ } from '@/types/db';

interface FAQManagerProps {
    cursoId: number;
}

export function FAQManager({ cursoId }: FAQManagerProps) {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ pregunta: '', respuesta: '', esGlobal: false });
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        loadFAQs();
    }, [cursoId]);

    const loadFAQs = async () => {
        try {
            const res = await fetch(`/api/faqs?curso_id=${cursoId}`);
            const data = await res.json();
            if (data.success) {
                setFaqs(data.data || []);
            }
        } catch (error) {
            console.error('Error loading FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.pregunta.trim() || !formData.respuesta.trim()) return;

        setSaving(true);
        try {
            const isEditing = editingId !== null;
            const url = '/api/faqs';
            const method = isEditing ? 'PUT' : 'POST';

            const body = isEditing
                ? { id: editingId, pregunta: formData.pregunta, respuesta: formData.respuesta }
                : {
                    curso_id: formData.esGlobal ? null : cursoId,
                    pregunta: formData.pregunta,
                    respuesta: formData.respuesta,
                    orden: faqs.length
                };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.success) {
                if (isEditing) {
                    setFaqs(faqs.map(f => f.id === editingId ? data.data : f));
                } else {
                    setFaqs([...faqs, data.data]);
                }
                resetForm();
            }
        } catch (error) {
            console.error('Error saving FAQ:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return;

        try {
            const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setFaqs(faqs.filter(f => f.id !== id));
            }
        } catch (error) {
            console.error('Error deleting FAQ:', error);
        }
    };

    const handleToggleActive = async (faq: FAQ) => {
        try {
            const res = await fetch('/api/faqs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: faq.id, activo: !faq.activo })
            });

            const data = await res.json();
            if (data.success) {
                setFaqs(faqs.map(f => f.id === faq.id ? data.data : f));
            }
        } catch (error) {
            console.error('Error toggling FAQ:', error);
        }
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const newFaqs = [...faqs];
        [newFaqs[index - 1], newFaqs[index]] = [newFaqs[index], newFaqs[index - 1]];
        setFaqs(newFaqs);
        await updateOrder(newFaqs);
    };

    const handleMoveDown = async (index: number) => {
        if (index === faqs.length - 1) return;
        const newFaqs = [...faqs];
        [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];
        setFaqs(newFaqs);
        await updateOrder(newFaqs);
    };

    const updateOrder = async (orderedFaqs: FAQ[]) => {
        try {
            await fetch('/api/faqs/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: orderedFaqs.map((faq, idx) => ({ id: faq.id, orden: idx }))
                })
            });
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const startEditing = (faq: FAQ) => {
        setEditingId(faq.id);
        setFormData({
            pregunta: faq.pregunta,
            respuesta: faq.respuesta,
            esGlobal: faq.curso_id === null
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ pregunta: '', respuesta: '', esGlobal: false });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="text-center py-8 text-gray-500">
                Cargando preguntas frecuentes...
            </div>
        );
    }

    // Separar FAQs específicas del curso y globales
    const faqsEspecificas = faqs.filter(f => f.curso_id === cursoId);
    const faqsGlobales = faqs.filter(f => f.curso_id === null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Preguntas Frecuentes</h3>
                    <p className="text-sm text-gray-500">
                        {faqs.length} pregunta{faqs.length !== 1 ? 's' : ''}
                        ({faqsEspecificas.length} específica{faqsEspecificas.length !== 1 ? 's' : ''},
                        {faqsGlobales.length} global{faqsGlobales.length !== 1 ? 'es' : ''})
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} disabled={showForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar FAQ
                </Button>
            </div>

            {/* Formulario */}
            {showForm && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-700">
                                {editingId ? 'Editar Pregunta' : 'Nueva Pregunta'}
                            </h4>
                            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pregunta
                            </label>
                            <Input
                                value={formData.pregunta}
                                onChange={(e) => setFormData({ ...formData, pregunta: e.target.value })}
                                placeholder="¿Cuál es la pregunta?"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Respuesta
                            </label>
                            <textarea
                                value={formData.respuesta}
                                onChange={(e) => setFormData({ ...formData, respuesta: e.target.value })}
                                placeholder="La respuesta a la pregunta..."
                                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {!editingId && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="esGlobal"
                                    checked={formData.esGlobal}
                                    onChange={(e) => setFormData({ ...formData, esGlobal: e.target.checked })}
                                    className="w-4 h-4 text-green-600 rounded"
                                />
                                <label htmlFor="esGlobal" className="text-sm text-gray-700 flex items-center gap-1">
                                    <Globe className="w-4 h-4 text-blue-500" />
                                    FAQ Global (aparece en todos los cursos)
                                </label>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button type="submit" disabled={saving}>
                                <Check className="w-4 h-4 mr-2" />
                                {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                            </Button>
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Lista de FAQs */}
            {faqs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                    <p>No hay preguntas frecuentes aún.</p>
                    <p className="text-sm mt-1">Haz clic en "Agregar FAQ" para crear la primera.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <Card
                            key={faq.id}
                            className={`p-4 transition-all ${!faq.activo ? 'opacity-50 bg-gray-50' : ''
                                } ${faq.curso_id === null ? 'border-l-4 border-l-blue-400' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Orden / Drag handle */}
                                <div className="flex flex-col items-center gap-1 text-gray-400">
                                    <GripVertical className="w-5 h-5 cursor-move" />
                                    <button
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === faqs.length - 1}
                                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {faq.curso_id === null && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                        <Globe className="w-3 h-3" />
                                                        Global
                                                    </span>
                                                )}
                                                <h4 className="font-medium text-gray-800">
                                                    {faq.pregunta}
                                                </h4>
                                            </div>
                                            {expandedId === faq.id && (
                                                <p className="mt-2 text-gray-600 text-sm whitespace-pre-wrap">
                                                    {faq.respuesta}
                                                </p>
                                            )}
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleToggleActive(faq)}
                                                className={`px-2 py-1 text-xs rounded ${faq.activo
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                    }`}
                                            >
                                                {faq.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEditing(faq)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(faq.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Info sobre FAQs globales */}
            <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                <Globe className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                    <strong>FAQs Globales:</strong> Las preguntas marcadas como "Global" aparecerán
                    automáticamente en todos los cursos. Útil para preguntas comunes como métodos de pago,
                    inscripciones, etc.
                </div>
            </div>
        </div>
    );
}
