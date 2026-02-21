-- Migración para el curso: Jardines Ecológicos Full
-- Generado por Agentic AI

-- 1. Variables globales
\set curso_slug 'jardines-ecologicos-full'
\set docente_nombre 'Anaclara Lopardo y Mariana Talento'

-- 2. Insertar o Actualizar Docente
-- Al ser dos docentes, creamos un perfil conjunto para simplificar la asignación única
UPDATE docentes 
SET descripcion = 'Licenciadas en Diseño de Paisaje, Técnicas en Jardinería y especialistas en Paisajismo Ecológico. Apasionadas por la restauración ambiental y el diseño de espacios que conviven con la naturaleza.'
WHERE nombre = :'docente_nombre';

INSERT INTO docentes (nombre, descripcion)
SELECT :'docente_nombre', 'Licenciadas en Diseño de Paisaje, Técnicas en Jardinería y especialistas en Paisajismo Ecológico. Apasionadas por la restauración ambiental y el diseño de espacios que conviven con la naturaleza.'
WHERE NOT EXISTS (SELECT 1 FROM docentes WHERE nombre = :'docente_nombre');

-- 3. Insertar o Actualizar Curso
INSERT INTO cursos (
    nombre, slug, descripcion, precio, cantidad_cuotas, 
    fecha_inicio, fecha_a_confirmar, duracion, modalidad,
    dia_teorico, horario_teorico, dia_practico, horario_practico, lugar,
    transformacion_hook, beneficios, certificacion,
    descuento_porcentaje, descuento_etiqueta, descuento_fecha_fin, descuento_cupos_totales, descuento_cupos_usados,
    docente_id, activo, created_at, updated_at
) VALUES (
    'Jardines Ecológicos Full',
    :'curso_slug',
    'Aprendé a diseñar espacios verdes que trabajen a favor de la naturaleza. Este curso te dará las herramientas para crear jardines resilientes, bellos y sustentables, integrando conocimientos de ecología, botánica y paisajismo.\n\nDominarás desde el manejo del suelo y la selección de especies nativas, hasta el diseño de "infraestructura azul" para el manejo inteligente del agua. Ideal para quienes buscan transformar su entorno o dedicarse profesionalmente al paisajismo con conciencia ambiental.\n\n**Dirigido a:**\nAmantes de la naturaleza, estudiantes de arquitectura o agronomía, jardineros y cualquier persona interesada en el paisajismo sustentable.\n\n**Requisitos:**\nNo se requieren conocimientos previos. Solo curiosidad y ganas de aprender.',
    11700, -- 3 cuotas de 3900
    3,
    '2026-03-01', -- Fecha estimada futura
    true, -- FECHA A CONFIRMAR
    '8 clases teóricas + 2 prácticos',
    'hibrido',
    'Martes', '18:00 a 20:00 hs (Zoom)',
    'Sábados', 'Horario a confirmar (Presencial)',
    'Teóricos por Zoom / Prácticos en Vivero y Ecoparque',
    '¿Querés un jardín que trabaje con la naturaleza y no contra ella? 🌿',
    '✅ Diseño de paisajes resilientes\n✅ Manejo de flora nativa y biodiversidad\n✅ Sistemas de drenaje sostenible (SUDS)\n✅ Prácticas reales en viveros y parques',
    'Certificado CEUTA avalado por MEC e INEFOP',
    40,
    '40% OFF - Cupos Limitados',
    '2026-02-01', -- Hasta el 1/2
    20,
    0,
    (SELECT id FROM docentes WHERE nombre = :'docente_nombre'),
    true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    cantidad_cuotas = EXCLUDED.cantidad_cuotas,
    fecha_inicio = EXCLUDED.fecha_inicio,
    fecha_a_confirmar = EXCLUDED.fecha_a_confirmar,
    duracion = EXCLUDED.duracion,
    modalidad = EXCLUDED.modalidad,
    dia_teorico = EXCLUDED.dia_teorico,
    horario_teorico = EXCLUDED.horario_teorico,
    dia_practico = EXCLUDED.dia_practico,
    horario_practico = EXCLUDED.horario_practico,
    lugar = EXCLUDED.lugar,
    transformacion_hook = EXCLUDED.transformacion_hook,
    beneficios = EXCLUDED.beneficios,
    certificacion = EXCLUDED.certificacion,
    descuento_porcentaje = EXCLUDED.descuento_porcentaje,
    descuento_etiqueta = EXCLUDED.descuento_etiqueta,
    descuento_fecha_fin = EXCLUDED.descuento_fecha_fin,
    activo = true,
    updated_at = NOW();

-- 4. Programa de Clases
DELETE FROM programa_clases WHERE curso_id = (SELECT id FROM cursos WHERE slug = :'curso_slug');

INSERT INTO programa_clases (curso_id, numero, titulo, tipo, practica_presencial, practica_virtual, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 1, 'Ecología y Jardines: Bases Conceptuales', 'teorico', false, true, 1, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 2, 'Diseño en Clave Ecológica', 'teorico', false, true, 2, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 3, 'Espacios Verdes Ecológicos y Ecoparques', 'teorico', false, true, 3, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 4, 'Suelo: Estructura, Vida y Fertilidad', 'teorico', false, true, 4, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 5, 'PRÁCTICA: Reproducción Vegetal', 'practico', true, false, 5, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 6, 'Uso Ornamental y Manejo de Vegetación', 'teorico', false, true, 6, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 7, 'Infraestructura Azul: Agua y Drenaje', 'teorico', false, true, 7, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 8, 'Biodiversidad y Control Sanitario', 'teorico', false, true, 8, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 9, 'Conceptos Básicos de Diseño', 'teorico', false, true, 9, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 10, 'PRÁCTICA: Plantación y Diseño', 'practico', true, false, 10, true);

-- 5. FAQs
DELETE FROM faqs_cursos WHERE curso_id = (SELECT id FROM cursos WHERE slug = :'curso_slug');

INSERT INTO faqs_cursos (curso_id, pregunta, respuesta, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Necesito conocimientos previos de jardinería?', 'No, el curso comienza desde cero. Es ideal tanto para principiantes como para quienes ya trabajan en el rubro y quieren incorporar una visión ecológica.', 1, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Las clases quedan grabadas?', 'Sí, todas las clases teóricas por Zoom quedan grabadas para que puedas volver a verlas cuando quieras.', 2, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Dónde se realizan las prácticas?', 'Visitamos lugares reales como el Vivero Montes en Canelones y el Ecoparque en Montevideo para aplicar lo aprendido en entornos vivos.', 3, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Qué certificación obtengo?', 'Al finalizar y aprobar la propuesta práctica, recibirás un diploma de CEUTA, institución avalada por el MEC e INEFOP.', 4, true);
