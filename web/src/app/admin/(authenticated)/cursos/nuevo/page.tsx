'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Docente } from '@/types/db';

interface CourseFormData {
    nombre: string;
    slug: string;
    descripcion: string;
    // contenido eliminado - se usa ProgramaManager después de crear
    precio: number;
    categoria: string;
    modalidad: string;
    nivel: string;
    duracion: string;
    fecha_inicio: string;
    lugar: string;
    docente_id: string;
    dia_teorico: string;
    horario_teorico: string;
    dia_practico: string;
    horario_practico: string;
    activo: boolean;
    orden: number;
    transformacion_hook: string;
    certificacion: string;
    link_mercado_pago: string;

    // New fields
    fecha_a_confirmar: boolean;
    lugar_a_confirmar: boolean;
    departamento_probable: string;
    es_inscripcion_anticipada: boolean;
    cantidad_cuotas: number;

    // Discount fields - added to match CourseFormData in edit page
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

const initialFormData: CourseFormData = {
    nombre: '',
    slug: '',
    descripcion: '',
    // contenido eliminado
    precio: 0,
    categoria: '',
    modalidad: 'presencial',
    nivel: 'principiante',
    duracion: '',
    fecha_inicio: '',
    lugar: '',
    docente_id: '',
    dia_teorico: '',
    horario_teorico: '',
    dia_practico: '',
    horario_practico: '',
    activo: true,
    orden: 0,
    transformacion_hook: '',
    certificacion: '',
    link_mercado_pago: '',

    // New fields
    fecha_a_confirmar: false,
    lugar_a_confirmar: false,
    departamento_probable: '',
    es_inscripcion_anticipada: false,
    cantidad_cuotas: 1,

    // Discount fields
    descuento_porcentaje: null,
    descuento_cupos_totales: null,
    descuento_cupos_usados: 0,
    descuento_etiqueta: null,
    descuento_fecha_fin: null,
    descuento_online_porcentaje: null,
    descuento_online_etiqueta: null,

    // Images
    imagen_portada: null,
    imagen_hero: null,
};

const DEPARTAMENTOS_URUGUAY = [
    'Montevideo', 'Canelones', 'Maldonado', 'Colonia', 'San José',
    'Rocha', 'Lavalleja', 'Florida', 'Flores', 'Durazno',
    'Tacuarembó', 'Rivera', 'Cerro Largo', 'Treinta y Tres',
    'Paysandú', 'Río Negro', 'Soriano', 'Salto', 'Artigas'
];

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default function NuevoCursoPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<CourseFormData>(initialFormData);
    const [docentes, setDocentes] = useState<Docente[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Cargar lista de docentes
    useEffect(() => {
        async function loadDocentes() {
            try {
                const res = await fetch('/api/admin/docentes');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setDocentes(data);
                    }
                }
            } catch (err) {
                console.error('Error loading docentes:', err);
            }
        }
        loadDocentes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
            };

            // Auto-generate slug from nombre
            if (name === 'nombre') {
                newData.slug = generateSlug(value);
            }

            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/cursos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    precio: Number(formData.precio),
                    orden: Number(formData.orden),
                    cantidad_cuotas: Number(formData.cantidad_cuotas),
                    fecha_inicio: formData.fecha_a_confirmar ? null : (formData.fecha_inicio || null),
                    docente_id: formData.docente_id || null,

                    // Discount fields
                    descuento_porcentaje: formData.descuento_porcentaje ? Number(formData.descuento_porcentaje) : null,
                    descuento_cupos_totales: formData.descuento_cupos_totales ? Number(formData.descuento_cupos_totales) : null,
                    descuento_cupos_usados: Number(formData.descuento_cupos_usados),
                    descuento_etiqueta: formData.descuento_etiqueta || null,
                    descuento_fecha_fin: formData.descuento_fecha_fin || null,
                    descuento_online_porcentaje: formData.descuento_online_porcentaje ? Number(formData.descuento_online_porcentaje) : null,
                    descuento_online_etiqueta: formData.descuento_online_etiqueta || null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear el curso');
            }

            const createdCourse = await response.json();

            // Redirect to edit page to add program/faqs
            router.push(`/admin/cursos/${createdCourse.id}`);
            router.refresh();
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err instanceof Error ? err.message : 'Error al crear el curso. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/cursos">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                </Link>
                <h1 className="text-2xl font-serif font-bold text-gray-800">Nuevo Curso</h1>
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
                                placeholder="Ej: Huerta Orgánica Básica"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                            <Input
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="huerta-organica-basica"
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
                                placeholder="Breve descripción del curso..."
                            />
                        </div>
                        {/* Campo contenido eliminado - se usa ProgramaManager después de crear el curso */}
                    </div>
                </Card>

                {/* VISUAL PLACEHOLDER FOR PROGRAM */}
                <Card className="p-6 bg-gray-50 border-dashed border-2 border-gray-200">
                    <h2 className="text-lg font-medium text-gray-400 mb-2">Programa del Curso y FAQs</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Guarda el curso primero para poder agregar clases, horarios específicos y gestionar las preguntas frecuentes.
                    </p>
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
                            onChange={(url) => setFormData(prev => ({ ...prev, imagen_portada: url }))}
                            folder="cursos/portadas"
                            label="Imagen de Portada"
                            helpText="Para cards y listados. Ratio 4:3 recomendado (800×600px)"
                            aspectRatio="4:3"
                        />
                        <ImageUploader
                            value={formData.imagen_hero}
                            onChange={(url) => setFormData(prev => ({ ...prev, imagen_hero: url }))}
                            folder="cursos/heroes"
                            label="Imagen Hero (Banner)"
                            helpText="Para página de detalle. Ratio 21:9 recomendado (1920×823px)"
                            aspectRatio="21:9"
                        />
                    </div>
                </Card>

                {/* Classification */}
                <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Clasificación</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green-700)] focus:border-transparent"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="huerta">Huerta</option>
                                <option value="bioconstruccion">Bioconstrucción</option>
                                <option value="permacultura">Permacultura</option>
                                <option value="agroecologia">Agroecología</option>
                                <option value="otros">Otros</option>
                            </select>
                        </div>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                            <select
                                name="nivel"
                                value={formData.nivel}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green-700)] focus:border-transparent"
                            >
                                <option value="principiante">Principiante</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                            </select>
                        </div>
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
                                            placeholder="Ej: CEUTA, Malvín Norte"
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
                                placeholder="Ej: 8 semanas"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Día teórico</label>
                            <Input
                                name="dia_teorico"
                                value={formData.dia_teorico}
                                onChange={handleChange}
                                placeholder="Ej: Miércoles"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Horario teórico</label>
                            <Input
                                name="horario_teorico"
                                value={formData.horario_teorico}
                                onChange={handleChange}
                                placeholder="Ej: 18:00 a 20:00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Día práctico</label>
                            <Input
                                name="dia_practico"
                                value={formData.dia_practico}
                                onChange={handleChange}
                                placeholder="Ej: Sábado"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Horario práctico</label>
                            <Input
                                name="horario_practico"
                                value={formData.horario_practico}
                                onChange={handleChange}
                                placeholder="Ej: 09:00 a 12:00"
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
                                Si el docente no está en la lista, agrégalo primero desde la sección de Docentes.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Pricing & Marketing */}
                <Card className="p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Precio y Marketing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Total (UYU) *</label>
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
                                max={12}
                            />
                            {formData.cantidad_cuotas > 1 && formData.precio > 0 && (
                                <p className="text-sm text-green-700 mt-1 font-medium">
                                    💡 Se mostrará: {formData.cantidad_cuotas} cuotas de ${Math.ceil(formData.precio / formData.cantidad_cuotas).toLocaleString('es-UY')}
                                </p>
                            )}
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
                                placeholder="¿Qué transformación logrará el estudiante?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Certificación</label>
                            <Input
                                name="certificacion"
                                value={formData.certificacion}
                                onChange={handleChange}
                                placeholder="Ej: Certificado de asistencia"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link Mercado Pago</label>
                            <Input
                                name="link_mercado_pago"
                                value={formData.link_mercado_pago}
                                onChange={handleChange}
                                placeholder="https://mpago.la/..."
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

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link href="/admin/cursos">
                        <Button type="button" variant="outline">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Guardando...' : 'Guardar y Continuar al Programa'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
