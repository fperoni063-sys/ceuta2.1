export interface Docente {
    id: string;
    nombre: string;
    descripcion: string | null;
    foto_url: string | null;
    created_at?: string;
}

export interface Curso {
    id: string; // UUID
    nombre: string;
    slug: string;
    descripcion: string;
    // contenido: string; -- ELIMINADO: ahora se usa tabla programa_clases
    precio: number;
    categoria: string;
    modalidad: string;
    nivel: string;
    duracion: string;
    fecha_inicio: string | null;
    lugar: string;
    docente: string | null; // Legacy field
    docente_id: string | null; // New FK
    docentes?: Docente; // Joined relation
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
    imagen_portada: string | null;
    imagen_hero: string | null;

    // New fields
    fecha_a_confirmar: boolean;
    lugar_a_confirmar: boolean;
    es_inscripcion_anticipada: boolean;
    cantidad_cuotas: number;
    teoricas_presenciales: boolean; // Curso 100% presencial

    // Discount fields (presencial/híbrido)
    descuento_porcentaje: number | null;       // 1-50, NULL = sin descuento
    descuento_cupos_totales: number | null;    // NULL = descuento no aplica
    descuento_cupos_usados: number;            // Default 0
    descuento_etiqueta: string | null;         // Texto personalizado
    descuento_fecha_fin: string | null;        // Fecha de expiración

    // Discount fields (online, opcional)
    descuento_online_porcentaje: number | null;
    descuento_online_etiqueta: string | null;

    updated_at?: string;
    created_at?: string;
}

export interface FAQ {
    id: number;
    curso_id: number | null; // NULL = FAQ global que aplica a todos los cursos
    pregunta: string;
    respuesta: string;
    orden: number;
    activo: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ProgramaClase {
    id: number;
    curso_id: number;
    numero: number;
    titulo: string;
    tipo: 'teorico' | 'practico';
    practica_presencial: boolean;
    practica_virtual: boolean;
    orden: number;
    activo: boolean;
    created_at?: string;
    updated_at?: string;
}

