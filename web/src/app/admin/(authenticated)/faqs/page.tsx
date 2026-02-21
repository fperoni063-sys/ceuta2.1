'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Globe, Edit2, X, Check, HelpCircle } from 'lucide-react';
import { FAQ } from '@/types/db';

export default function FAQsGlobalesPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ pregunta: '', respuesta: '' });
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        loadFAQs();
    }, []);

    const loadFAQs = async () => {
        try {
            const res = await fetch('/api/faqs?solo_globales=true');
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
                    curso_id: null, // Global FAQ
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
        if (!confirm('¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer.')) return;

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
            respuesta: faq.respuesta
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ pregunta: '', respuesta: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                        <HelpCircle className="w-7 h-7 text-blue-500" />
                        Preguntas Frecuentes Globales
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Estas preguntas aparecen automáticamente en <strong>todos los cursos</strong>.
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} disabled={showForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva FAQ Global
                </Button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>¿Qué son las FAQs Globales?</strong>
                    <p className="mt-1">
                        Son preguntas frecuentes que aplican a todos los cursos, como &quot;¿Cómo me inscribo?&quot;,
                        &quot;¿Cuáles son los métodos de pago?&quot;, etc. Se muestran junto con las FAQs específicas
                        de cada curso en la página pública.
                    </p>
                </div>
            </div>

            {/* Formulario */}
            {showForm && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">
                                {editingId ? 'Editar Pregunta Global' : 'Nueva Pregunta Global'}
                            </h4>
                            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
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
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Respuesta
                            </label>
                            <textarea
                                value={formData.respuesta}
                                onChange={(e) => setFormData({ ...formData, respuesta: e.target.value })}
                                placeholder="La respuesta a la pregunta..."
                                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

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
            {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Cargando preguntas frecuentes...
                </div>
            ) : faqs.length === 0 ? (
                <Card className="text-center py-12 text-muted-foreground border-2 border-dashed">
                    <Globe className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="font-medium">No hay preguntas frecuentes globales aún.</p>
                    <p className="text-sm mt-1">Haz clic en &quot;Nueva FAQ Global&quot; para crear la primera.</p>
                </Card>
            ) : (
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-4">
                        {faqs.length} pregunta{faqs.length !== 1 ? 's' : ''} global{faqs.length !== 1 ? 'es' : ''}
                    </p>
                    {faqs.map((faq, index) => (
                        <Card
                            key={faq.id}
                            className={`p-4 transition-all border-l-4 border-l-blue-400 ${!faq.activo ? 'opacity-50 bg-muted' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Orden / Drag handle */}
                                <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                                    <GripVertical className="w-5 h-5 cursor-move" />
                                    <button
                                        onClick={() => handleMoveUp(index)}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-muted rounded disabled:opacity-30"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleMoveDown(index)}
                                        disabled={index === faqs.length - 1}
                                        className="p-1 hover:bg-muted rounded disabled:opacity-30"
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
                                            <h4 className="font-medium text-foreground">
                                                {faq.pregunta}
                                            </h4>
                                            {expandedId === faq.id && (
                                                <p className="mt-2 text-muted-foreground text-sm whitespace-pre-wrap">
                                                    {faq.respuesta}
                                                </p>
                                            )}
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleToggleActive(faq)}
                                                className={`px-2 py-1 text-xs rounded ${faq.activo
                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                    : 'bg-gray-100 text-muted-foreground'
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
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
        </div>
    );
}
