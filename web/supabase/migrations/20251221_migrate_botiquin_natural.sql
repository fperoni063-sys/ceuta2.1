-- =====================================================
-- MIGRATION: Plantas medicinales: Botiquín natural
-- DATE: 2025-12-21
-- =====================================================

-- 1. Create Docente if not exists
INSERT INTO docentes (nombre, descripcion, foto_url)
SELECT
    'Vera García',
    'Docente de Plantas Medicinales',
    NULL
WHERE NOT EXISTS (SELECT 1 FROM docentes WHERE nombre = 'Vera García');

-- 2. Insert or Update Course
-- Using ON CONFLICT (slug) to update if exists.

INSERT INTO cursos (
    nombre, 
    slug, 
    descripcion, 
    transformacion_hook, -- formerly descripcion_corta
    precio, 
    descuento_porcentaje, 
    descuento_cupos_totales, 
    descuento_cupos_usados, 
    descuento_etiqueta,
    descuento_online_porcentaje,
    fecha_inicio, 
    duracion,
    dia_teorico, 
    horario_teorico,
    dia_practico, 
    horario_practico,
    lugar, 
    modalidad,
    nivel, 
    niveles,
    categoria,
    beneficios,
    docente, 
    docente_id,
    activo,
    permite_online,
    precio_online,
    cantidad_cuotas
)
VALUES (
    'Plantas medicinales: Botiquín natural',
    'plantas-medicinales-botiquin-natural',
    'BOTIQUÍN NATURAL, un espacio para compartir los saberes de curarnos naturalmente. Aprenderemos cómo armar un botiquín natural y que elementos poner en el, con énfasis en el VERANO.

Aprenderemos en profundidad la medicina del aloe y la arcilla.
Elaboraremos crema corporal como humectante y post solar. Y una bruma refrescante para acompañar el calor (y la vida).
Aprenderemos a hacer cataplasmas y a aplicarnos arcilla. También a elaborar tintura madres y cómo usarlas adecuadamente.

Te esperamos.',
    'Aprende a armar tu botiquín natural con énfasis en el verano. Medicina del aloe, arcilla, cremas y tinturas madres.',
    5000, -- Precio Base
    60,   -- Descuento 60% -> $2000 (Semipresencial)
    20, 
    0, 
    '🔥 60% OFF - Semipresencial ($2000)',
    50,   -- Descuento Online 50% -> $2500 (Virtual) (Base 5000)
    '2026-02-04', 
    '1 Mes (14hs totales)',
    'Miércoles', 
    '18:30 hs por Zoom (en vivo y grabadas)',
    'Sábados', 
    '10:00 hs Presencial (4 horas)',
    'Tierra Pura, Km90 de la interbalnearia, Maldonado', 
    'hibrido', -- "Semipresencial o virtual" implies hybrid options
    'basico', 
    ARRAY['basico'],
    'salud_natural',
    '✅ Aprende a armar tu propio botiquín natural
✅ Medicina del aloe y la arcilla en profundidad
✅ Elaboración de crema corporal y bruma refrescante
✅ Preparación de tinturas madres
✅ Modalidad semipresencial o virtual
✅ Clases grabadas disponibles',
    'Vera García',
    (SELECT id FROM docentes WHERE nombre = 'Vera García' LIMIT 1),
    true,
    true, -- permite_online
    5000, -- precio_online base
    1     -- cantidad_cuotas (default)
)
ON CONFLICT (slug) DO UPDATE SET
    precio = EXCLUDED.precio,
    descuento_porcentaje = EXCLUDED.descuento_porcentaje,
    descuento_online_porcentaje = EXCLUDED.descuento_online_porcentaje,
    fecha_inicio = EXCLUDED.fecha_inicio,
    horario_teorico = EXCLUDED.horario_teorico,
    horario_practico = EXCLUDED.horario_practico,
    descripcion = EXCLUDED.descripcion,
    transformacion_hook = EXCLUDED.transformacion_hook,
    beneficios = EXCLUDED.beneficios,
    docente_id = EXCLUDED.docente_id,
    permite_online = EXCLUDED.permite_online,
    precio_online = EXCLUDED.precio_online,
    niveles = EXCLUDED.niveles,
    updated_at = NOW();

-- 3. Insert Classes
DO $$
DECLARE
    v_curso_id INTEGER;
BEGIN
    SELECT id INTO v_curso_id FROM cursos WHERE slug = 'plantas-medicinales-botiquin-natural';

    -- Clear existing classes for idempotent run
    DELETE FROM programa_clases WHERE curso_id = v_curso_id;

    -- Insert Classes (Teóricos and Prácticos)
    INSERT INTO programa_clases (curso_id, numero, titulo, tipo, practica_presencial, practica_virtual, orden, activo)
    VALUES
        -- Teóricos
        (v_curso_id, 1, 'Botiquín natural: qué es y cómo mirarlo. Qué usar en un botiquín natural.', 'teorico', false, true, 1, true),
        (v_curso_id, 2, 'Aloe: gran aliada del verano y de la vida.', 'teorico', false, true, 2, true),
        (v_curso_id, 3, 'La medicina de la arcilla y cómo aplicarla.', 'teorico', false, true, 3, true),
        (v_curso_id, 4, 'Cómo armo mi botiquín natural. Acciones y hábitos aliados en la salud.', 'teorico', false, true, 4, true),
        
        -- Prácticos
        (v_curso_id, 5, 'Elaboración de crema corporal de aloe y pepino. Bruma refrescante.', 'practico', true, false, 5, true),
        (v_curso_id, 6, 'Aplicación de arcilla y cataplasmas. Elaboración de una tintura madre.', 'practico', true, false, 6, true);
        
    RAISE NOTICE 'Curso Botiquín Natural actualizado con clases.';
END $$;
