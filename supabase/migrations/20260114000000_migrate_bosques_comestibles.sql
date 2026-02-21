-- Migración para el curso: Bosques Comestibles
-- Fecha: 2026-01-14

-- 1. Variables Globales (REEMPLAZADAS POR LITERALES PARA COMPATIBILIDAD MCP)
-- curso_slug: 'bosques-comestibles-semipresencial'
-- docente_nombre: 'Pablo Federico Álvarez Rodríguez'

-- 2. Insertar o Actualizar Docente
UPDATE docentes SET descripcion = 'Contador Público reorientado al diseño regenerativo y economías alternativas. Experto en permacultura y planificación territorial. Co-fundador de Ceibo Azul, consultora en diseño de hábitats sustentables.'
WHERE nombre = 'Pablo Federico Álvarez Rodríguez';

INSERT INTO docentes (nombre, descripcion)
SELECT 'Pablo Federico Álvarez Rodríguez', 'Contador Público reorientado al diseño regenerativo y economías alternativas. Experto en permacultura y planificación territorial. Co-fundador de Ceibo Azul, consultora en diseño de hábitats sustentables.'
WHERE NOT EXISTS (SELECT 1 FROM docentes WHERE nombre = 'Pablo Federico Álvarez Rodríguez');

-- 3. Insertar Curso
INSERT INTO cursos (
    nombre, slug, descripcion, precio, cantidad_cuotas, 
    fecha_inicio, fecha_a_confirmar, duracion, modalidad,
    dia_teorico, horario_teorico, dia_practico, horario_practico, lugar,
    transformacion_hook, beneficios, certificacion,
    descuento_porcentaje, descuento_etiqueta, descuento_fecha_fin, descuento_cupos_totales, descuento_cupos_usados,
    docente_id, activo, created_at, updated_at
) VALUES (
    'Bosques Comestibles: Diseño y Abundancia',
    'bosques-comestibles-semipresencial',
    'Aprende a diseñar y gestionar ecosistemas productores de alimentos que imitan la estructura de un bosque natural. Este curso te brinda las herramientas teóricas y prácticas para cultivar frutas, hojas y medicinas en armonía con la naturaleza, minimizando el trabajo y maximizando la biodiversidad.

Descubrirás la Agricultura Sintrópica y cómo aplicar sus principios para regenerar el suelo, gestionar el agua y crear paisajes comestibles resilientes, ya sea en un campo, una chacra o un jardín urbano.

Dirigido a:
Personas que buscan soberanía alimentaria, regenerar sus tierras o iniciar proyectos productivos sustentables. No se requiere experiencia previa en agricultura.

Requisitos:
Curiosidad y ganas de aprender a trabajar a favor de la naturaleza.',
    11700, -- Precio lista (3 cuotas de 3900)
    3, -- Cuotas
    '2026-03-11', -- Fecha inicio
    false, -- A confirmar
    '3 meses (10 clases)',
    'hibrido',
    'Miércoles', '18:00 a 20:00 hs (Zoom)',
    'Sábados', '10:00 a 14:00 hs (2 encuentros)',
    'Teóricos por Zoom / Prácticos en Tala (Ruta 7 km 90)',
    'Transforma tu tierra en un paraíso de alimentos 🌳🍎',
    '✅ Producción de alimentos con bajo mantenimiento
✅ Regeneración de suelos degradados
✅ Diseño de paisajes comestibles resilientes
✅ Conexión profunda con los ciclos naturales',
    'Diploma de aprobación CEUTA',
    40, -- % Descuento
    '40% OFF por inscripción anticipada',
    '2026-02-01',
    20, -- Cupos para descuento
    0, -- Cupos usados
    (SELECT id FROM docentes WHERE nombre = 'Pablo Federico Álvarez Rodríguez'),
    true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    fecha_inicio = EXCLUDED.fecha_inicio,
    dia_teorico = EXCLUDED.dia_teorico,
    horario_teorico = EXCLUDED.horario_teorico,
    dia_practico = EXCLUDED.dia_practico,
    horario_practico = EXCLUDED.horario_practico,
    lugar = EXCLUDED.lugar,
    transformacion_hook = EXCLUDED.transformacion_hook,
    beneficios = EXCLUDED.beneficios,
    descuento_porcentaje = EXCLUDED.descuento_porcentaje,
    descuento_fecha_fin = EXCLUDED.descuento_fecha_fin,
    updated_at = NOW();

-- 4. Programa de Clases
DELETE FROM programa_clases WHERE curso_id = (SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial');

INSERT INTO programa_clases (curso_id, numero, titulo, tipo, practica_presencial, practica_virtual, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), 1, 'Introducción: El Bosque como Maestro', 'teorico', false, true, 1, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), 2, 'Conceptos Claves: Agricultura Sintrópica', 'teorico', false, true, 2, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), 3, 'El Suelo: Organismo Vivo y Fertilidad', 'teorico', false, true, 3, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), 4, 'Diseño del Bosque: Clima, Agua y Zonas', 'teorico', false, true, 4, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), 5, 'Selección de Especies: El Elenco del Bosque', 'teorico', false, true, 5, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), 6, 'Establecimiento e Implementación', 'teorico', false, true, 6, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), 7, 'Práctica 1: Visita a Bosque Comestible Maduro', 'practico', true, false, 7, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), 8, 'Manejo del Bosque y Huertas Integradas', 'teorico', false, true, 8, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), 9, 'Práctica 2: Taller de Diseño en Campo', 'practico', true, false, 9, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), 10, 'Presentación de Proyectos Finales', 'teorico', false, true, 10, true);

-- 5. FAQs
DELETE FROM faqs_cursos WHERE curso_id = (SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial');

INSERT INTO faqs_cursos (curso_id, pregunta, respuesta, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), '¿Qué es un Bosque Comestible?', 'Es un sistema de producción de alimentos que imita la estructura, biodiversidad y dinámica de un bosque natural, requiriendo menos mantenimiento a largo plazo.', 1, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), '¿Necesito tener un campo grande?', 'No necesariamente. Los principios se pueden aplicar desde pequeños jardines urbanos hasta grandes extensiones. El curso cubre adaptaciones para diferentes escalas.', 2, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), '¿Cómo son las instancias prácticas?', 'Realizaremos dos jornadas presenciales en Tala (Canelones). Visitaremos un sistema en funcionamiento para observar el manejo real y tendremos un taller de diseño aplicado.', 3, true),
((SELECT id FROM cursos WHERE slug = 'bosques-comestibles-semipresencial'), '¿Obtengo certificado?', 'Sí, al completar el curso y aprobar el trabajo final, recibirás un certificado expedido por CEUTA.', 4, true);
