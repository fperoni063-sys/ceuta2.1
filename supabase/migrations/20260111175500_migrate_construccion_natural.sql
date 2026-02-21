-- 1. Variables para no repetir slugs y nombres
\set curso_slug 'construccion-natural-semipresencial'
\set docente_nombre 'Santiago Ruedi'

-- 2. Insertar o Actualizar Docente (SIN UNIQUE CONSTRAINT)
-- Primero intentamos actualizar si existe
UPDATE docentes SET descripcion = 'Bioconstructor con más de 15 años de experiencia, diseñador en permacultura y emprendedor. Ha liderado numerosos proyectos de construcción natural y es co-creador de la comunidad Nido Churrinche.'
WHERE nombre = :'docente_nombre';

-- Luego insertamos si no existe
INSERT INTO docentes (nombre, descripcion)
SELECT :'docente_nombre', 'Bioconstructor con más de 15 años de experiencia, diseñador en permacultura y emprendedor. Ha liderado numerosos proyectos de construcción natural y es co-creador de la comunidad Nido Churrinche.'
WHERE NOT EXISTS (SELECT 1 FROM docentes WHERE nombre = :'docente_nombre');

-- 3. Insertar Curso (Upsert basado en slug)
INSERT INTO cursos (
    nombre, slug, descripcion, precio, cantidad_cuotas, 
    fecha_inicio, fecha_a_confirmar, duracion, modalidad,
    dia_teorico, horario_teorico, dia_practico, horario_practico, lugar,
    transformacion_hook, beneficios, certificacion,
    descuento_porcentaje, descuento_etiqueta, descuento_fecha_fin, descuento_cupos_totales, descuento_cupos_usados,
    docente_id, activo, created_at, updated_at
) VALUES (
    'Construcción Natural Semipresencial',
    :'curso_slug',
    E'Este curso te sumerge en el mundo de la bioconstrucción y la arquitectura bioclimática. Aprenderás a diseñar viviendas saludables y térmicamente eficientes utilizando materiales naturales como tierra, paja y fibras.\n\nCombinamos la comodidad del aprendizaje online con la experiencia insustituible de la práctica en obra. Descubrirás técnicas como el adobe, fajina, cob y superadobe, adaptadas a las necesidades modernas.\n\nEs una formación integral que cubre desde el análisis de suelos y cimientos hasta techos vivos y terminaciones finas, todo con un enfoque de sustentabilidad real.\n\n**Dirigido a:**\nAutoconstructores, arquitectos, albañiles y cualquier persona que quiera aprender a construir de forma ecológica y responsable.\n\n**Requisitos:**\nNo se requieren conocimientos previos. Ganas de ensuciarse las manos y aprender haciendo.',
    11700, -- Precio lista (3 x 3900)
    3, -- Cuotas
    '2026-03-10', -- Fecha inicio
    false, -- A confirmar
    '3 meses',
    'hibrido',
    'Martes', '18:30 a 20:30 hs (Zoom)',
    'Sábados', '09:00 a 13:00 hs (Fechas a confirmar)',
    'Teóricos Zoom / Prácticos en Obra',
    '¿Te imaginas construir tu propia casa, eficiente y en armonía con el entorno? 🌿🏠',
    '✅ Aprende a construir tu propia casa\n✅ Materiales naturales y saludables\n✅ Ahorro energético garantizado',
    'Diploma de aprobación CEUTA',
    40, -- % Descuento
    '40% OFF por inscripción anticipada',
    '2026-02-01',
    20, -- Cupos para descuento (REQ PARA QUE SE MUESTRE)
    0, -- Cupos usados
    (SELECT id FROM docentes WHERE nombre = :'docente_nombre'),
    true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    horario_teorico = EXCLUDED.horario_teorico,
    horario_practico = EXCLUDED.horario_practico,
    fecha_inicio = EXCLUDED.fecha_inicio,
    descuento_porcentaje = EXCLUDED.descuento_porcentaje,
    descuento_fecha_fin = EXCLUDED.descuento_fecha_fin,
    descuento_cupos_totales = EXCLUDED.descuento_cupos_totales,
    updated_at = NOW();

-- 4. Limpiar clases viejas e insertar nuevas
DELETE FROM programa_clases WHERE curso_id = (SELECT id FROM cursos WHERE slug = :'curso_slug');

INSERT INTO programa_clases (curso_id, numero, titulo, tipo, practica_presencial, practica_virtual, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 1, 'Principios y valores de la construcción natural', 'teorico', false, true, 1, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 2, 'Materiales naturales y reciclados', 'teorico', false, true, 2, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 3, 'Técnicas constructivas I: Adobe y Fajina', 'teorico', false, true, 3, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 4, 'Práctica 1: Análisis de tierras y preparación de mezclas', 'practico', true, false, 4, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 5, 'Técnicas constructivas II: Cob y Superadobe', 'teorico', false, true, 5, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 6, 'Práctica 2: Levantamiento de muros', 'practico', true, false, 6, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 7, 'Cimientos, drenaje y estructuras', 'teorico', false, true, 7, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 8, 'Techos vivos y Pisos', 'teorico', false, true, 8, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 9, 'Revoques y terminaciones finas', 'practico', true, false, 9, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), 10, 'Arquitectura bioclimática y Diseño solar pasivo', 'teorico', false, true, 10, true);

-- 5. Limpiar y regenerar FAQs
DELETE FROM faqs_cursos WHERE curso_id = (SELECT id FROM cursos WHERE slug = :'curso_slug');

INSERT INTO faqs_cursos (curso_id, pregunta, respuesta, orden, activo)
VALUES
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Necesito experiencia previa?', 'No, el curso está diseñado para empezar desde cero. Aprenderás paso a paso todas las técnicas necesarias.', 1, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Qué validez tiene el certificado?', 'El certificado es otorgado por CEUTA, entidad registrada en el MEC e INEFOP. Sirve para acreditar tus conocimientos en el ámbito laboral y profesional.', 2, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Son resistentes las casas de barro?', 'Absolutamente. Aprenderás las técnicas correctas para estabilizar la tierra y protegerla de la intemperie, logrando construcciones que duran décadas o incluso siglos.', 3, true),
((SELECT id FROM cursos WHERE slug = :'curso_slug'), '¿Dónde se realizan las prácticas?', 'Las prácticas se realizan en obras reales o espacios demostrativos (generalmente en Piriápolis o Montevideo), lo que te permite experimentar con los materiales y herramientas en un entorno de trabajo real.', 4, true);
