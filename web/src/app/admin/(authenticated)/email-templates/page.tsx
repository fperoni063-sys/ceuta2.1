'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmailTemplate {
    id: number;
    nombre: string;
    asunto: string;
    contenido_html: string;
    contenido_texto: string;
    descripcion: string;
    variables_disponibles: string[];
    activo: boolean;
    orden_secuencia: number | null;
    horas_despues: number | null;
}

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [selected, setSelected] = useState<EmailTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    async function fetchTemplates() {
        const res = await fetch('/api/admin/email-templates');
        const data = await res.json();
        setTemplates(data.templates || []);
        setLoading(false);
    }

    async function saveTemplate() {
        if (!selected) return;
        setSaving(true);
        setMessage(null);

        const res = await fetch('/api/admin/email-templates', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selected),
        });

        if (res.ok) {
            setMessage('✅ Template guardado correctamente');
            fetchTemplates();
        } else {
            setMessage('❌ Error al guardar');
        }

        setSaving(false);
    }

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Link href="/admin" className="text-sage-600 hover:text-sage-700 text-sm">
                        ← Volver al admin
                    </Link>
                    <h1 className="text-2xl font-bold text-walnut-800 mt-2">📧 Templates de Email</h1>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Lista de templates */}
                <div className="lg:col-span-1 space-y-2">
                    <p className="text-sm text-walnut-500 mb-3">
                        Seleccioná un template para editarlo
                    </p>
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setSelected(t);
                                setMessage(null);
                            }}
                            className={`w-full text-left p-4 rounded-lg border transition-colors ${selected?.id === t.id
                                ? 'bg-sage-100 border-sage-400'
                                : 'bg-white hover:bg-cream-50 border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-walnut-800">{t.nombre}</span>
                                <div className="flex items-center gap-2">
                                    {!t.activo && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            Inactivo
                                        </span>
                                    )}
                                    {t.orden_secuencia && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            {t.horas_despues}h
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{t.descripcion}</p>
                        </button>
                    ))}
                </div>

                {/* Editor */}
                {selected ? (
                    <div className="lg:col-span-2 bg-white rounded-lg border p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-walnut-800">
                                Editando: {selected.nombre}
                            </h2>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.activo}
                                    onChange={(e) =>
                                        setSelected({ ...selected, activo: e.target.checked })
                                    }
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm">Activo</span>
                            </label>
                        </div>

                        {/* Variables disponibles */}
                        <div className="mb-4 p-3 bg-cream-50 rounded-lg">
                            <p className="text-sm font-medium mb-2">Variables disponibles:</p>
                            <div className="flex flex-wrap gap-2">
                                {selected.variables_disponibles?.map((v) => (
                                    <code key={v} className="text-xs bg-white px-2 py-1 rounded border">
                                        {v}
                                    </code>
                                ))}
                            </div>
                        </div>

                        {/* Asunto */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Asunto</label>
                            <input
                                type="text"
                                value={selected.asunto}
                                onChange={(e) =>
                                    setSelected({ ...selected, asunto: e.target.value })
                                }
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                            />
                        </div>

                        {/* Contenido HTML */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                                Contenido HTML
                            </label>
                            <textarea
                                value={selected.contenido_html}
                                onChange={(e) =>
                                    setSelected({ ...selected, contenido_html: e.target.value })
                                }
                                rows={12}
                                className="w-full p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                            />
                        </div>

                        {/* Contenido Texto */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">
                                Contenido Texto (fallback)
                            </label>
                            <textarea
                                value={selected.contenido_texto}
                                onChange={(e) =>
                                    setSelected({ ...selected, contenido_texto: e.target.value })
                                }
                                rows={6}
                                className="w-full p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                            />
                        </div>

                        {message && (
                            <p className="mb-4 text-sm">{message}</p>
                        )}

                        <button
                            onClick={saveTemplate}
                            disabled={saving}
                            className="w-full bg-sage-600 hover:bg-sage-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                ) : (
                    <div className="lg:col-span-2 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center p-12">
                        <p className="text-gray-400">Seleccioná un template para editarlo</p>
                    </div>
                )}
            </div>
        </div>
    );
}
