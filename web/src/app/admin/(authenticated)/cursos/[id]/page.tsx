'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

import { Docente } from '@/types/db';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { FAQManager } from '@/components/admin/FAQManager';
import { ProgramaManager } from '@/components/admin/ProgramaManager';

interface CourseFormData {
    nombre: string;
    slug: string;
    descripcion: string;
    // contenido eliminado - ahora se usa ProgramaManager
    precio: number;
    categoria: string;
    modalidad: string;
    nivel: string;
    niveles: string[]; // Multi-nivel
    duracion: string;
    fecha_inicio: string;
    lugar: string;
    // docente: string; // Removed legacy string input
    docente_id: string; // New FK
    dia_teorico: string;
    horario_teorico: string;
    dia_practico: string;
    horario_practico: string;
    activo: boolean;
    orden: number;
    transformacion_hook: string;
    beneficios: string;
    certificacion: string;
    link_mercado_pago: string;

    // New fields
    fecha_a_confirmar: boolean;
    lugar_a_confirmar: boolean;
    departamento_probable: string;
    es_inscripcion_anticipada: boolean;
    cantidad_cuotas: number;
    permite_online: boolean; // Para híbridos: si acepta modalidad 100% online
    precio_online: number | null; // Precio diferenciado para online

    // Discount fields
    descuento_porcentaje: number | null;
    descuento_cupos_totales: number | null;
    descuento_cupos_usados: number;
    descuento_etiqueta: string | null;
    descuento_fecha_fin: string | null;
    descuento_online_porcentaje: number | null;
    descuento_online_etiqueta: string | null;

    // Images
    imagen_portada: string | null;
    imagen_hero: string | null;
}

const DEPARTAMENTOS_URUGUAY = [
    'Montevideo', 'Canelones', 'Maldonado', 'Colonia', 'San José',
    'Rocha', 'Lavalleja', 'Florida', 'Flores', 'Durazno',
    'Tacuarembó', 'Rivera', 'Cerro Largo', 'Treinta y Tres',
    'Paysandú', 'Río Negro', 'Soriano', 'Salto', 'Artigas'
];

export default function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [formData, setFormData] = useState<CourseFormData | null>(null);
    const [docentes, setDocentes] = useState<Docente[]>([]); // Teachers list
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch course and teachers in parallel
                const [courseRes, teachersRes] = await Promise.all([
                    fetch(`/api/admin/cursos/${resolvedParams.id}`),
                    fetch(`/api/admin/docentes`)
                ]);

                if (!courseRes.ok) throw new Error('Curso no encontrado');

                const data = await courseRes.json();
                const teachersData = await teachersRes.json();

                if (Array.isArray(teachersData)) {
                    setDocentes(teachersData);
                }

                setFormData({
                    nombre: data.nombre || '',
                    slug: data.slug || '',
                    descripcion: data.descripcion || '',
                    // contenido eliminado
                    precio: data.precio || 0,
                    categoria: data.categoria || '',
                    modalidad: data.modalidad || 'presencial',
                    nivel: data.nivel || 'principiante',
                    niveles: data.niveles || [],
                    duracion: data.duracion || '',
                    fecha_inicio: data.fecha_inicio || '',
                    lugar: data.lugar || '',
                    docente_id: data.docente_id || '', // Use ID
                    dia_teorico: data.dia_teorico || '',
                    horario_teorico: data.horario_teorico || '',
                    dia_practico: data.dia_practico || '',
                    horario_practico: data.horario_practico || '',
                    activo: data.activo ?? true,
                    orden: data.orden || 0,
                    transformacion_hook: data.transformacion_hook || '',
                    beneficios: data.beneficios || '',
                    certificacion: data.certificacion || '',
                    link_mercado_pago: data.link_mercado_pago || '',

                    // New fields defaults
                    fecha_a_confirmar: data.fecha_a_confirmar ?? false,
                    lugar_a_confirmar: data.lugar_a_confirmar ?? false,
                    departamento_probable: data.departamento_probable || '',
                    es_inscripcion_anticipada: data.es_inscripcion_anticipada ?? false,
                    cantidad_cuotas: data.cantidad_cuotas || 1,
                    permite_online: data.permite_online ?? false,
                    precio_online: data.precio_online || null,

                    // Discount fields defaults
                    descuento_porcentaje: data.descuento_porcentaje || null,
                    descuento_cupos_totales: data.descuento_cupos_totales || null,
                    descuento_cupos_usados: data.descuento_cupos_usados || 0,
                    descuento_etiqueta: data.descuento_etiqueta || '',
                    descuento_fecha_fin: data.descuento_fecha_fin || null,
                    descuento_online_porcentaje: data.descuento_online_porcentaje || null,
                    descuento_online_etiqueta: data.descuento_online_etiqueta || '',

                    // Images
                    imagen_portada: data.imagen_portada || null,
                    imagen_hero: data.imagen_hero || null,
                });
            } catch (err: any) {
                setError(err.message || 'Error al cargar datos');
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [resolvedParams.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setSaving(true);
        setError('');

        try {
            const response = await fetch(`/api/admin/cursos/${resolvedParams.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    precio: Number(formData.precio),
                    orden: Number(formData.orden),
                    cantidad_cuotas: Number(formData.cantidad_cuotas),
                    fecha_inicio: formData.fecha_inicio || null,
                    docente_id: formData.docente_id || null,
                    niveles: formData.niveles,
                    permite_online: formData.permite_online,
                    precio_online: formData.precio_online ? Number(formData.precio_online) : null,

                    // Discount fields
                    descuento_porcentaje: formData.descuento_porcentaje ? Number(formData.descuento_porcentaje) : null,
                    descuento_cupos_totales: formData.descuento_cupos_totales ? Number(formData.descuento_cupos_totales) : null,
                    descuento_cupos_usados: Number(formData.descuento_cupos_usados),
                    descuento_etiqueta: formData.descuento_etiqueta || null,
                    descuento_fecha_fin: formData.descuento_fecha_fin || null,
                    descuento_online_porcentaje: formData.descuento_online_porcentaje ? Number(formData.descuento_online_porcentaje) : null,
                    descuento_online_etiqueta: formData.descuento_online_etiqueta || null,

                    updated_at: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar el curso');
            }

            router.push('/admin/cursos');
            router.refresh();
        } catch (err) {
            console.error('Error updating course:', err);
            setError(err instanceof Error ? err.message : 'Error al actualizar el curso. Por favor, intente nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/admin/cursos/${resolvedParams.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al archivar el curso');
            }

            router.push('/admin/cursos');
            router.refresh();
        } catch (err) {
            console.error('Error archiving course:', err);
            setError(err instanceof Error ? err.message : 'Error al archivar el curso.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Cargando curso...</p>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error || 'Curso no encontrado'}</p>
                <Link href="/admin/cursos" className="text-[var(--color-green-700)] hover:underline mt-4 inline-block">
                    Volver a cursos
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/cursos">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-serif font-bold text-gray-800">Editar Curso</h1>
                </div>
                {!deleteConfirm ? (
                    <Button variant="outline" onClick={() => setDeleteConfirm(true)} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Archivar
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">¿Archivar este curso? (quedará oculto pero se conservan las inscripciones)</span>
                        <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(false)}>Cancelar</Button>
                        <Button onClick={handleDelete} className="bg-orange-600 hover:bg-orange-700">Archivar</Button>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Información Básica</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del curso *</label>
                            <Input
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                            <Input
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green-700)] focus:border-transparent"
                            />
                        </div>
                        {/* Campo contenido eliminado - ahora se usa ProgramaManager más abajo */}
                    </div>
                </Card>

                {/* Images */}
                <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Imágenes</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Sube las imágenes del curso. La portada se usa en cards y listados, el hero en la página de detalle.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUploader
                            value={formData.imagen_portada}
                            onChange={(url) => setFormData(prev => prev ? { ...prev, imagen_portada: url } : prev)}
                            folder="cursos/portadas"
                            label="Imagen de Portada"
                            helpText="Para cards y listados. Ratio 4:3 recomendado (800×600px)"
                            aspectRatio="4:3"
                        />
                        <ImageUploader
                            value={formData.imagen_hero}
                            onChange={(url) => setFormData(prev => prev ? { ...prev, imagen_hero: url } : prev)}
                            folder="cursos/heroes"
                            label="Imagen Hero (Banner)"
                            helpText="Para página de detalle. Ratio 21:9 recomendado (1920×823px)"
                            aspectRatio="21:9"
                        />
                    </div>
                </Card>

                {/* Classification */}
                <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Clasificación y Modalidad</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Modalidad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                            <select
                                name="modalidad"
                                value={formData.modalidad}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green-700)] focus:border-transparent"
                            >
                                <option value="presencial">Presencial</option>
                                <option value="virtual">Online (Virtual)</option>
                                <option value="hibrido">Híbrido</option>
                            </select>
                        </div>

                        {/* Niveles (Multi-selección) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Niveles (puede ser más de uno)</label>
                            <div className="flex flex-wrap gap-3">
                                {['basico', 'intermedio', 'avanzado'].map((nivel) => (
                                    <label key={nivel} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.niveles.includes(nivel)}
                                            onChange={(e) => {
                                                setFormData(prev => {
                                                    if (!prev) return prev;
                                                    const newNiveles = e.target.checked
                                                        ? [...prev.niveles, nivel]
                                                        : prev.niveles.filter(n => n !== nivel);
                                                    return { ...prev, niveles: newNiveles };
                                                });
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-[var(--color-green-700)] focus:ring-[var(--color-green-700)]"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">
                                            {nivel === 'basico' ? 'Básico' : nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Opción de modalidad online alternativa (solo para híbridos) */}
                        {formData.modalidad === 'hibrido' && (
                            <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.permite_online}
                                        onChange={(e) => setFormData(prev => prev ? { ...prev, permite_online: e.target.checked } : prev)}
                                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-green-700)] focus:ring-[var(--color-green-700)]"
                                    />
                                    <div>
                                        <span className="block font-medium text-gray-800">¿También se puede cursar 100% online?</span>
                                        <span className="text-xs text-gray-600">Marca esta opción si el curso híbrido tiene una variante 100% online (sin prácticas presenciales).</span>
                                    </div>
                                </label>

                                {formData.permite_online && (
                                    <div className="mt-4 pl-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio modalidad Online (UYU)</label>
                                        <Input
                                            type="number"
                                            value={formData.precio_online || ''}
                                            onChange={(e) => setFormData(prev => prev ? { ...prev, precio_online: e.target.value ? Number(e.target.value) : null } : prev)}
                                            placeholder="Ej: 9800"
                                            min={0}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Deja vacío si el precio es el mismo que la modalidad híbrida.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Schedule */}
                <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Horarios y Ubicación</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                {/* Date Section */}
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="fecha_a_confirmar"
                                        checked={formData.fecha_a_confirmar}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-green-700)] focus:ring-[var(--color-green-700)]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Fecha a confirmar</span>
                                </label>

                                <div className={formData.fecha_a_confirmar ? 'opacity-50 pointer-events-none' : ''}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                                    <Input
                                        name="fecha_inicio"
                                        type="date"
                                        value={formData.fecha_inicio}
                                        onChange={handleChange}
                                        disabled={formData.fecha_a_confirmar}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Location Section */}
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="lugar_a_confirmar"
                                        checked={formData.lugar_a_confirmar}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-green-700)] focus:ring-[var(--color-green-700)]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Dirección exacta a confirmar</span>
                                </label>

                                {formData.lugar_a_confirmar ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Departamento probable (opcional)</label>
                                        <select
                                            name="departamento_probable"
                                            value={formData.departamento_probable}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green-700)] focus:border-transparent"
                                        >
                                            <option value="">Sin especificar</option>
                                            {DEPARTAMENTOS_URUGUAY.map(dep => (
                                                <option key={dep} value={dep}>{dep}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Se mostrará como "Montevideo (dirección a confirmar)"</p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Lugar</label>
                                        <Input
                                            name="lugar"
                                            value={formData.lugar}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                            <Input
                                name="duracion"
                                value={formData.duracion}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Día teórico</label>
                            <Input
                                name="dia_teorico"
                                value={formData.dia_teorico}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Horario teórico</label>
                            <Input
                                name="horario_teorico"
                                value={formData.horario_teorico}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Día práctico</label>
                            <Input
                                name="dia_practico"
                                value={formData.dia_practico}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Horario práctico</label>
                            <Input
                                name="horario_practico"
                                value={formData.horario_practico}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Docente</label>
                            <div className="flex gap-2">
                                <select
                                    name="docente_id"
                                    value={formData.docente_id}
                                    onChange={handleChange}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green-700)] focus:border-transparent"
                                >
                                    <option value="">Seleccionar docente...</option>
                                    {docentes.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </select>
                                <Link href="/admin/docentes/nuevo" target="_blank">
                                    <Button type="button" variant="outline" size="sm">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Si el docente no está en la lista, agrégalo desde la sección de Docentes.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Pricing & Marketing */}
                <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Precio y Marketing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (UYU) *</label>
                            <Input
                                name="precio"
                                type="number"
                                value={formData.precio}
                                onChange={handleChange}
                                required
                                min={0}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de Cuotas</label>
                            <Input
                                name="cantidad_cuotas"
                                type="number"
                                value={formData.cantidad_cuotas}
                                onChange={handleChange}
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Orden (para listado)</label>
                            <Input
                                name="orden"
                                type="number"
                                value={formData.orden}
                                onChange={handleChange}
                                min={0}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                                <input
                                    type="checkbox"
                                    name="es_inscripcion_anticipada"
                                    checked={formData.es_inscripcion_anticipada}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-[var(--color-green-700)] focus:ring-[var(--color-green-700)]"
                                />
                                <div>
                                    <span className="block font-medium text-gray-800">Inscripción Anticipada</span>
                                    <span className="text-xs text-gray-600">Mostrará un distintivo especial y el texto de apertura de inscripciones.</span>
                                </div>
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hook de transformación</label>
                            <textarea
                                name="transformacion_hook"
                                value={formData.transformacion_hook}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green-700)] focus:border-transparent"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Beneficios</label>
                            <textarea
                                name="beneficios"
                                value={formData.beneficios}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green-700)] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Certificación</label>
                            <Input
                                name="certificacion"
                                value={formData.certificacion}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link Mercado Pago</label>
                            <Input
                                name="link_mercado_pago"
                                value={formData.link_mercado_pago}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </Card>

                {/* Visibility */}
                <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Visibilidad</h2>
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="activo"
                            checked={formData.activo}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-gray-300 text-[var(--color-green-700)] focus:ring-[var(--color-green-700)]"
                        />
                        <span className="text-gray-700">Curso visible en el sitio público</span>
                    </label>
                </Card>

                {/* Promociones y Descuentos */}
                <Card className="p-6 border-green-100 bg-green-50/30">
                    <h2 className="text-lg font-medium text-green-900 mb-4 flex items-center gap-2">
                        💰 Promociones y Descuentos
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Descuento General (Presencial/Híbrido) */}
                        <div className="space-y-4 p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                            <h3 className="font-medium text-green-800 border-b border-green-100 pb-2">
                                Descuento General
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje OFF</label>
                                    <div className="relative">
                                        <Input
                                            name="descuento_porcentaje"
                                            type="number"
                                            min="0"
                                            value={formData.descuento_porcentaje || ''}
                                            onChange={handleChange}
                                            placeholder="Ej: 20"
                                        />
                                        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cupos con descuento</label>
                                    <Input
                                        name="descuento_cupos_totales"
                                        type="number"
                                        min="0"
                                        value={formData.descuento_cupos_totales || ''}
                                        onChange={handleChange}
                                        placeholder="Ej: 5"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Promocional</label>
                                <Input
                                    name="descuento_etiqueta"
                                    value={formData.descuento_etiqueta || ''}
                                    onChange={handleChange}
                                    placeholder="Ej: 20% OFF - Cupos Limitados"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Texto que aparece en el badge de descuento.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite del descuento</label>
                                <Input
                                    name="descuento_fecha_fin"
                                    type="datetime-local"
                                    value={
                                        formData.descuento_fecha_fin
                                            ? (() => {
                                                const date = new Date(formData.descuento_fecha_fin);
                                                // Ajustar a zona horaria local para el input datetime-local
                                                // El input espera "YYYY-MM-DDThh:mm" en hora local
                                                // El truco es restar el offset antes de hacer toISOString
                                                const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                                                return localDate.toISOString().slice(0, 16);
                                            })()
                                            : ''
                                    }
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => prev ? { ...prev, descuento_fecha_fin: val ? new Date(val).toISOString() : null } : prev);
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Si se define, el descuento dejará de aplicar automáticamente después de esta fecha.
                                </p>
                            </div>

                            {formData.descuento_cupos_totales && Number(formData.descuento_cupos_totales) > 0 && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded flex justify-between items-center">
                                    <span>Cupos usados:</span>
                                    <span className="font-mono font-bold">{formData.descuento_cupos_usados} / {formData.descuento_cupos_totales}</span>
                                </div>
                            )}
                        </div>

                        {/* Descuento Online (Opcional) */}
                        <div className="space-y-4 p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
                            <h3 className="font-medium text-blue-800 border-b border-blue-100 pb-2">
                                Descuento Online (Opcional)
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje OFF</label>
                                    <div className="relative">
                                        <Input
                                            name="descuento_online_porcentaje"
                                            type="number"
                                            min="0"
                                            value={formData.descuento_online_porcentaje || ''}
                                            onChange={handleChange}
                                            placeholder="Ej: 15"
                                        />
                                        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">%</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta Online</label>
                                <Input
                                    name="descuento_online_etiqueta"
                                    value={formData.descuento_online_etiqueta || ''}
                                    onChange={handleChange}
                                    placeholder="Ej: 15% OFF Online"
                                />
                            </div>

                            <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded">
                                Este descuento aplica específicamente si el usuario elige la modalidad Online (cuando hay precio diferenciado).
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Programa del Curso */}
                <Card className="p-6">
                    <ProgramaManager cursoId={parseInt(resolvedParams.id)} />
                </Card>

                {/* FAQs */}
                <Card className="p-6">
                    <FAQManager cursoId={parseInt(resolvedParams.id)} />
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link href="/admin/cursos">
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
